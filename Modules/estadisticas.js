/* ====================================
   ESTADISTICAS MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Visualizacion de estadisticas y comparacion con meta
   ==================================== */

   
// VISUAL: "Especialización" renombrado a "Mecánica" para el usuario final.
// Internamente el código sigue usando specAnalysis, specializations, specBonus, etc.
// No cambiar los nombres de variables ni claves de objeto — solo los strings visibles.

// VISUAL: "Counter-Deck Score" renombrado a "Nivel de poder Anti-META".
// Las clases CSS (counter-deck-card, counter-deck-header, etc.) y las
// variables internas (finalScore, counter, breakdown) no cambian.
const Estadisticas = {
    container: null,
    metaDecks: {},
    metaFolders: [],
    currentMetaDeck: null,
    selectedFolders: [],   // [] = Todo el Meta (multi-selección)
    deckListExpanded: false,
    powerScoreCache: null,
    powerScoreLoading: false,
    metaCardLibrary: {},   // cardId → { id, name, type, roles }
    metaDeckScores:  {},   // "folder|||deckname" → { internalScore, externalScore, calculatedAt }

    init: function () {
        this.container = document.getElementById('estadisticas-content');
        if (!this.container) return;
        this.loadMetaData();
        this.render();
        this.createDeckFloatingWidget();
    },

   loadMetaData: function () {
    try {
        const saved = localStorage.getItem('yugioh_meta_decks');
        if (saved) {
            const data = JSON.parse(saved);
            this.metaDecks = data.decks || {};
            this.metaFolders = Object.keys(this.metaDecks).sort((a, b) => {
                const [mA, yA] = a.split(' ');
                const [mB, yB] = b.split(' ');
                const dateA = new Date(parseInt(yA), this.getMonthNumber(mA));
                const dateB = new Date(parseInt(yB), this.getMonthNumber(mB));
                return dateB - dateA;
            });
        }
    } catch (e) { console.error('Error cargando meta data:', e); }

    try {
        const cached = localStorage.getItem('yugioh_power_cache');
        this.powerScoreCache = cached ? JSON.parse(cached) : null;
    } catch (_) { this.powerScoreCache = null; }

    try {
        const lib = localStorage.getItem('yugioh_meta_card_library');
        this.metaCardLibrary = lib ? JSON.parse(lib) : {};
    } catch (_) { this.metaCardLibrary = {}; }

    try {
        const sc = localStorage.getItem('yugioh_meta_deck_scores');
        this.metaDeckScores = sc ? JSON.parse(sc) : {};
    } catch (_) { this.metaDeckScores = {}; }
},

    getMonthNumber: function (monthName) {
        const months = {
            'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3,
            'Mayo': 4, 'Junio': 5, 'Julio': 6, 'Agosto': 7,
            'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
        };
        return months[monthName] || 0;
    },

 saveMetaData: function () {
    try {
        localStorage.setItem('yugioh_meta_decks', JSON.stringify({ decks: this.metaDecks }));
    } catch (e) { console.error('Error guardando meta data:', e); }
},
_saveMetaCardLibrary: function () {
    try {
        localStorage.setItem('yugioh_meta_card_library', JSON.stringify(this.metaCardLibrary));
    } catch (_) {}
},

_saveMetaDeckScores: function () {
    try {
        localStorage.setItem('yugioh_meta_deck_scores', JSON.stringify(this.metaDeckScores));
    } catch (_) {}
},

// Fetcha las cartas faltantes de un deck del meta, analiza roles y guarda en biblioteca.
// Luego calcula y persiste internal+external score para ese deck.
enrichAndScoreMetaDeck: async function (folderName, deckFilename) {
    const deckData = (this.metaDecks[folderName] || []).find(d => d.filename === deckFilename);
    if (!deckData) return;

    const sections  = deckData.sections || { main: [], extra: [], side: [] };
    const allIds    = [
        ...sections.main.map(id => ({ id: String(id), loc: 'main' })),
        ...sections.extra.map(id => ({ id: String(id), loc: 'extra' }))
    ];
    const uniqueIds = [...new Set(allIds.map(e => e.id))];
    const missing   = uniqueIds.filter(id => !this.metaCardLibrary[id]);

    // Fetch en lotes de 10 — solo las que no están en la biblioteca
    for (let i = 0; i < missing.length; i += 10) {
        const batch = missing.slice(i, i + 10);
        try {
            const res  = await fetch(
                `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${batch.join(',')}`
            );
            const json = await res.json();
            (json.data || []).forEach(card => {
                const roles = window.Deck?.autoAssignRoles?.(card) ?? [];
                this.metaCardLibrary[String(card.id)] = {
                    id:    String(card.id),
                    name:  card.name,
                    type:  card.type,
                    desc:  card.desc || '',
                    roles
                };
            });
        } catch (_) {}
    }
    this._saveMetaCardLibrary();
    this._computeAndSaveMetaDeckScore(folderName, deckFilename);
},

// Construye fakeCards desde la biblioteca y calcula scores del deck del meta.
_computeAndSaveMetaDeckScore: function (folderName, deckFilename) {
    const deckData = (this.metaDecks[folderName] || []).find(d => d.filename === deckFilename);
    if (!deckData) return;

    const sections  = deckData.sections || { main: [], extra: [], side: [] };
    const fakeCards = {};

    const addSec = (ids, loc) => ids.forEach(id => {
    const entry = this.metaCardLibrary[String(id)];
    if (!entry) return;
    if (!fakeCards[id]) {
        fakeCards[id] = {
            data:     { id, name: entry.name, type: entry.type, desc: entry.desc || '', roles: entry.roles },
                qty:      0,
                location: loc,
                roles:    entry.roles
            };
        }
        fakeCards[id].qty++;
    });
    addSec(sections.main,  'main');
    addSec(sections.extra, 'extra');
    // side: excluido del scoring (ya pedido)

    if (Object.keys(fakeCards).length === 0) return;

    const key            = `${folderName}|||${deckFilename}`;
    const internalResult = window.Stats ? Stats.calculateInternalScore(fakeCards) : null;
    let   externalScore  = null;

    if (window.Stats && this.powerScoreCache) {
        try {
            const ext = Stats.calculateExternalScore(
                fakeCards, this.powerScoreCache, this.metaDecks
            );
            externalScore = ext.externalScore;
        } catch (_) {}
    }

    this.metaDeckScores[key] = {
        internalScore: internalResult ? parseFloat(internalResult.internalScore) : null,
        externalScore,
        calculatedAt:  Date.now()
    };
    this._saveMetaDeckScores();
},

// Recalcula external scores de todos los decks que ya tienen datos en la biblioteca.
recalculateAllMetaDeckScores: function () {
    let count = 0;
    for (const [folder, decks] of Object.entries(this.metaDecks)) {
        (decks || []).forEach(deck => {
            const secs = deck.sections || { main: [], extra: [] };
            const hasData = [...(secs.main || []), ...(secs.extra || [])]
                .some(id => this.metaCardLibrary[String(id)]);
            if (hasData) {
                this._computeAndSaveMetaDeckScore(folder, deck.filename);
                count++;
            }
        });
    }
    this.render();
    // Mantener sección abierta
    requestAnimationFrame(() => {
        const sec = document.getElementById('meta-decks-sec');
        if (sec) sec.style.display = 'block';
    });
    return count;
},
    // ===============================
    // GESTIÓN DE CARPETAS
    // ===============================
    createFolder: function () {
        const folderName = prompt('Ingresa el mes y año del meta\nEjemplo: Febrero 2026');
        if (!folderName) return;
        const regex = /^[A-Za-záéíóúÁÉÍÓÚñÑ]+ \d{4}$/;
        if (!regex.test(folderName)) {
            alert('Formato invalido. Usa: Mes Año (ejemplo: Febrero 2026)');
            return;
        }
        if (this.metaDecks[folderName]) {
            alert('Esta carpeta ya existe');
            return;
        }
        this.metaDecks[folderName] = [];
        this.metaFolders.unshift(folderName);
        this.saveMetaData();
        this.render();
        alert('Carpeta creada: ' + folderName);
    },

    deleteFolder: function (folderName) {
        if (!confirm('¿Eliminar carpeta "' + folderName + '" y todos sus decks?')) return;
        delete this.metaDecks[folderName];
        this.metaFolders = this.metaFolders.filter(f => f !== folderName);
        // Remover de selección si estaba
        this.selectedFolders = this.selectedFolders.filter(f => f !== folderName);
        this.saveMetaData();
        this.render();
    },

    importYDK: function (folderName) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.ydk';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            for (let file of files) {
                await this.processYDKFile(file, folderName);
            }
            this.saveMetaData();
            this.render();
            alert(files.length + ' deck(s) importado(s) a ' + folderName);
        };
        input.click();
    },

    processYDKFile: async function (file, folderName) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                const deckData = this.parseYDK(content);
                const mostFrequentId = this.getMostFrequentCardId(deckData.cards);
                const cardFrequency = {};
                deckData.cards.forEach(id => {
                    cardFrequency[id] = (cardFrequency[id] || 0) + 1;
                });
                const deckInfo = {
                    filename:        file.name.replace('.ydk', ''),
                    mostFrequentCard: mostFrequentId,
                    cardCount:       deckData.cards.length,
                    cardFrequency,
                    // Secciones para poder cargar en Mi Deck
                    sections: {
                        main:  deckData.main  || [],
                        extra: deckData.extra || [],
                        side:  deckData.side  || []
                    }
                };
                if (!this.metaDecks[folderName]) this.metaDecks[folderName] = [];
                const existingIndex = this.metaDecks[folderName].findIndex(d => d.filename === deckInfo.filename);
                if (existingIndex >= 0) {
                    this.metaDecks[folderName][existingIndex] = deckInfo;
                } else {
                    this.metaDecks[folderName].push(deckInfo);
                }
                resolve();
            };
            reader.readAsText(file);
        });
    },

    parseYDK: function (content) {
        const lines   = content.split('\n').map(l => l.trim()).filter(l => l);
        const cards   = [];   // plano — para cardFrequency (retrocompatible)
        const main    = [];
        const extra   = [];
        const side    = [];
        let   section = 'main';

        for (let line of lines) {
            if (line.startsWith('#')) {
                const l = line.toLowerCase();
                if (l.includes('extra')) section = 'extra';
                else if (l.includes('side'))  section = 'side';
                else                          section = 'main';
                continue;
            }
            if (line.startsWith('!')) { section = 'side'; continue; }

            const cardId = line.trim();
            if (cardId && !isNaN(cardId)) {
                cards.push(cardId);
                if (section === 'extra')     extra.push(cardId);
                else if (section === 'side') side.push(cardId);
                else                         main.push(cardId);
            }
        }

        return { cards, main, extra, side };
    },

    getMostFrequentCardId: function (cards) {
        if (!cards || cards.length === 0) return null;
        const frequency = {};
        cards.forEach(id => { frequency[id] = (frequency[id] || 0) + 1; });
        let maxCount = 0, mostFrequent = null;
        for (let id in frequency) {
            if (frequency[id] > maxCount) { maxCount = frequency[id]; mostFrequent = id; }
        }
        return mostFrequent;
    },

    deleteDeck: function (folderName, deckFilename) {
        if (!confirm('¿Eliminar deck "' + deckFilename + '"?')) return;
        this.metaDecks[folderName] = this.metaDecks[folderName].filter(d => d.filename !== deckFilename);
        this.saveMetaData();
        this.render();
    },

    // ===============================
    // FILTRO MULTI-CARPETA
    // ===============================
    setFolderFilter: function (folder) {
        if (folder === 'all') {
            // "Todo el Meta" limpia la selección
            this.selectedFolders = [];
        } else {
            const idx = this.selectedFolders.indexOf(folder);
            if (idx > -1) {
                // Deseleccionar si ya estaba activa
                this.selectedFolders.splice(idx, 1);
            } else {
                // Agregar a la selección
                this.selectedFolders.push(folder);
            }
        }
        this.render();
    },

    getFilteredDecks: function () {
        const filtered = [];
        // Si no hay selección específica → todos los decks
        const activeFolders = this.selectedFolders.length > 0
            ? this.selectedFolders
            : Object.keys(this.metaDecks);

        activeFolders.forEach(folder => {
            (this.metaDecks[folder] || []).forEach(deck => {
                filtered.push({ ...deck, folder });
            });
        });
        return filtered;
    },
// ===============================
    // CARGAR DECK DEL META EN MI DECK
    // Carga el .ydk del meta directamente en la pestaña Mi Deck,
    // consultando la API para obtener los datos de cada carta.
    // No requiere que el deck esté guardado en localStorage.
    // ===============================
    loadMetaDeckToMiDeck: async function (folderName, deckFilename) {
        const deckData = (this.metaDecks[folderName] || [])
            .find(d => d.filename === deckFilename);
        if (!deckData) return;

        // Fallback para decks importados antes de que sections existiera:
        // si no tiene sections, trata todo como main
        const sections = deckData.sections || {
            main:  Object.keys(deckData.cardFrequency || {}),
            extra: [],
            side:  []
        };

        const allIds = [
            ...sections.main.map(id => ({ id, loc: 'main' })),
            ...sections.extra.map(id => ({ id, loc: 'extra' })),
            ...sections.side.map(id => ({ id, loc: 'side' }))
        ];

        if (allIds.length === 0) {
            alert('Este deck no tiene cartas cargadas. Re-importa el .ydk para habilitarlo.');
            return;
        }

        // Mostrar loading
        const loadingEl = document.createElement('div');
        loadingEl.id = 'meta-deck-loading';
        loadingEl.style.cssText = `
            position:fixed;inset:0;background:rgba(0,0,0,0.7);
            display:flex;align-items:center;justify-content:center;
            z-index:9999;color:#FFD700;font-size:1.1rem;flex-direction:column;gap:12px;`;
        loadingEl.innerHTML = `
            <div class="power-loading-spinner"></div>
            <span>Cargando ${deckFilename}...</span>`;
        document.body.appendChild(loadingEl);

        try {
            const newCards = {};

            // Fetch en lotes de 5 para no saturar la API
            for (let i = 0; i < allIds.length; i += 5) {
                const batch = allIds.slice(i, i + 5);
                await Promise.all(batch.map(async ({ id, loc }) => {
                    // Si ya lo tenemos en el powerScoreCache, lo usamos directamente
                    const cached = this.powerScoreCache?.cards
                        ?.find(c => String(c.cardId) === String(id));
                    let cardData = cached?.cardData || null;

                    if (!cardData) {
                        try {
                            const res  = await fetch(
                                `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`
                            );
                            const json = await res.json();
                            cardData   = json.data?.[0] || null;
                        } catch (_) {}
                    }

                    if (!cardData) return; // carta no encontrada, la omite

                    // Freq de este id en este deck
                    const qty = deckData.cardFrequency?.[String(id)] || 1;

                    if (!newCards[id]) {
                        newCards[id] = {
                            data:     cardData,
                            qty,
                            location: loc,
                            roles: window.Deck?.autoAssignRoles?.(cardData) ?? []
                        };
                    }
                }));
            }

            if (Object.keys(newCards).length === 0) {
                alert('No se pudieron obtener datos de las cartas. Verifica tu conexión.');
                return;
            }

            // Cargar en Deck y navegar a Mi Deck
            if (window.Deck) {
                // Confirmar si hay deck activo con cartas
                if (Object.keys(Deck.cards).length > 0) {
                    const ok = confirm(
                        `¿Reemplazar el deck activo "${Deck.name}" con "${deckFilename}"?\n` +
                        `Guarda tu deck primero si no quieres perderlo.`
                    );
                    if (!ok) return;
                }
                Deck.cards = newCards;
                Deck.name  = deckFilename;
                if (Deck.render) Deck.render();
            }

            if (window.Deck) Deck.onDeckLoaded();
            if (window.Navigation) Navigation.showTab('mideck');


            // Enriquecer en segundo plano — no bloquea la carga del deck
            this.enrichAndScoreMetaDeck(folderName, deckFilename).then(() => {
                // Actualizar scores en la sección si está abierta
                const sec = document.getElementById('meta-decks-sec');
                if (sec && sec.style.display !== 'none') {
                    // Re-render solo los items de scores sin colapsar la sección
                    document.querySelectorAll('[data-meta-score-key]').forEach(el => {
                        const [f, n] = el.dataset.metaScoreKey.split('|||');
                        const cached = this.metaDeckScores[el.dataset.metaScoreKey];
                        if (cached) {
                            el.innerHTML = this._renderMetaDeckScoreHTML(cached);
                        }
                    });
                }
            });
        } finally {
            const el = document.getElementById('meta-deck-loading');
            if (el) el.remove();
        }
    },
    // ===============================
    // MODAL VER DECK DEL META
    // ===============================
    viewMetaDeck: function (folderName, deckFilename) {
        if (!Deck || !Deck.getSavedDecks) return;
        const savedDecks = Deck.getSavedDecks();
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';
        let deckListHTML = '';
        savedDecks.forEach(deck => {
            const mainCount  = Object.values(deck.cards).filter(c => c.location === 'main').reduce((s, c) => s + c.qty, 0);
            const extraCount = Object.values(deck.cards).filter(c => c.location === 'extra').reduce((s, c) => s + c.qty, 0);
            deckListHTML += `
                <div class="deck-select-item" onclick="Estadisticas.selectAndLoadDeck('${deck.key}')">
                    <span class="deck-select-name">${deck.name}</span>
                    <span class="deck-select-count">Main: ${mainCount} | Extra: ${extraCount}</span>
                </div>`;
        });
        overlay.innerHTML = `
            <div class="deck-modal">
                <h3>Seleccionar Deck para Comparar</h3>
                <p>Deck del Meta: <strong>${deckFilename}</strong></p>
                <p class="deck-modal-note">Selecciona un deck guardado para cargar y comparar</p>
                <div class="deck-select-list">
                    ${savedDecks.length === 0 ? '<p class="stats-empty">No hay decks guardados</p>' : deckListHTML}
                </div>
                <div class="deck-modal-buttons">
                    <button class="btn btn-secondary" onclick="Estadisticas.closeModal()">Cancelar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    selectAndLoadDeck: function (deckKey) {
        if (Deck && Deck.confirmLoadDeck) {
            const deckName = deckKey.replace('deck_', '');
            Deck.confirmLoadDeck(deckName);
        }
        this.closeModal();
        this.updateDeckStats();
        this.updateFloatingWidget();
    },

    closeModal: function () {
        const overlay = document.querySelector('.deck-overlay');
        if (overlay) overlay.remove();
    },
_renderMetaDeckScoreHTML: function (cached) {
    const iScore = (cached?.internalScore != null) ? cached.internalScore : null;
    const eScore = (cached?.externalScore != null) ? cached.externalScore : null;
    const iColor = iScore === null ? '#636e72' : iScore >= 20 ? '#00b894' : iScore >= 10 ? '#fdcb6e' : '#d63031';
    const eColor = eScore === null ? '#636e72' : eScore >= 7 ? '#00b894' : eScore >= 4 ? '#fdcb6e' : '#d63031';
    return `
        <div class="meta-deck-score-row">
            <span style="color:${iColor}">⚡ ${iScore !== null ? parseFloat(iScore).toFixed(1) : '—'}</span>
            <span style="color:${eColor}">🛡️ ${eScore !== null ? parseFloat(eScore).toFixed(1) : '—'}</span>
        </div>
        ${cached ? '<div class="meta-deck-score-hint">Internal · External</div>' : ''}
    `;
},
    // ===============================
    // INTERNAL SCORE Y Anti-META
    // ===============================
    renderDeckStats: function () {
        if (!Deck || !Deck.cards || Object.keys(Deck.cards).length === 0) {
            return `
                <div class="stats-empty">
                    <p>No hay deck activo para mostrar estadísticas</p>
                    <p class="stats-help">Ve a "Mi Deck" y carga un deck para ver sus estadísticas</p>
                </div>`;
        }

        const stats   = Stats.calculateInternalScore(Deck.cards);
        const counter = Stats.calculateCounterDeckScore(Deck.cards, this.powerScoreCache);

        // Proporciones para barra compuesta (pesos iguales 0.33 cada uno)
        const contC = parseFloat(stats.consistency);
        const contP = parseFloat(stats.power);
        const contR = parseFloat(stats.resilience);
        const total = contC + contP + contR || 1;
        const pctC  = Math.round((contC / total) * 100);
        const pctP  = Math.round((contP / total) * 100);
        const pctR  = 100 - pctC - pctP;

        const scoreColor = stats.internalScore >= 20 ? '#00b894'
                         : stats.internalScore >= 10 ? '#fdcb6e' : '#d63031';

        const breakdownRows = counter.breakdown.slice(0, 5).map(c => `
            <div class="counter-breakdown-row">
                <span class="counter-card-name">${c.name}${c.estimated ? ' *' : ''}</span>
                <span class="counter-card-contrib">
                    x${c.qty} · ${c.bonus}pts → <strong>+${c.contrib}</strong>
                </span>
            </div>`).join('');

        const brickNote = counter.brickCount > 0
            ? `<div class="counter-brick-note">
                   🧱 ${counter.brickCount} Brick(s) aplicaron penalización de -${counter.brickPenalty} pts
               </div>`
            : '';

        const noPowerNote = !counter.hasPowerData
            ? `<small class="counter-no-meta">* Sin cache de poder del meta. Calcula ⚡ Poder de Cartas para valores precisos.</small>`
            : '';

        return `
            <div class="stats-card">
                <div class="stats-header">
                    <h3>Internal Score — ${Deck.name}</h3>
                   <div class="stats-score" style="color:${scoreColor}">
                        ${stats.internalScore} pts
                    </div>
                </div>

                <div class="stats-composite-bar-wrap">
                    <div class="stats-composite-bar">
                        <div class="scb-segment scb-consistency"
                             style="width:${pctC}%"
                             title="Consistencia ${stats.consistency} pts · ${pctC}% del score"></div>
                        <div class="scb-segment scb-power"
                             style="width:${pctP}%"
                             title="Potencia ${stats.power} pts · ${pctP}% del score"></div>
                        <div class="scb-segment scb-resilience"
                             style="width:${pctR}%"
                             title="Resiliencia ${stats.resilience} pts · ${pctR}% del score"></div>
                        </div>
                    <div class="scb-legend">
                        <span class="scb-dot" style="background:#00b894"></span>
                        Consistencia <strong>${stats.consistency}</strong>
                        <span class="scb-dot" style="background:#d63031;margin-left:8px"></span>
                        Potencia <strong>${stats.power}</strong>
                        <span class="scb-dot" style="background:#0066cc;margin-left:8px"></span>
                        Resiliencia <strong>${stats.resilience}</strong>
                    </div>
                </div>

                <div class="stats-footer">
                    <span>Main Deck: ${stats.mainCards ?? stats.totalCards} cartas</span>
                    ${stats.penalty > 0 ? `<span style="color:var(--warning-color)">⚠️ Penalización exceso: -${stats.penalty}</span>` : ''}
                </div>
            </div>

            <div class="counter-deck-card">
                <div class="counter-deck-header">
                    <div>
                        <h3>Nivel de poder Anti-META</h3>
                        <div class="counter-deck-level" style="color:${counter.levelColor}">
                            ${counter.level}
                        </div>
                    </div>
                    <div class="counter-deck-score" style="color:${counter.levelColor}">
                        ${counter.finalScore}
                        <span class="counter-deck-score-label">pts</span>
                    </div>
                </div>
                <div class="counter-deck-meta">
                    <span>${counter.counterCards} cartas con capacidad de interrupción al Meta</span>
                    <span>Raw: ${counter.rawCounter} ${counter.brickPenalty > 0 ? `→ -${counter.brickPenalty}` : ''}</span>
                </div>
                ${brickNote}
                ${counter.breakdown.length > 0 ? `
                    <div class="counter-breakdown">
                        <div class="counter-breakdown-title">Cartas de tu deck que generan este poder:</div>
                        ${breakdownRows}
                    </div>` : ''}
                ${noPowerNote}
            </div>`;
    },

        updateDeckStats: function () {
            const analysisSec = document.getElementById('deck-analysis-sec');
            if (analysisSec) analysisSec.innerHTML = this.renderDeckAnalysis();

            const statsSec = document.getElementById('deck-stats-sec');
            if (statsSec) statsSec.innerHTML = this.renderDeckStats();

            this.updateFloatingWidget();
        },

    // ===============================
    // WIDGET FLOTANTE DE DECK
    // ===============================
    createDeckFloatingWidget: function () {
        if (document.getElementById('deck-floating-widget')) return;
        const widget = document.createElement('div');
        widget.id = 'deck-floating-widget';
        widget.className = 'deck-floating-widget';
        widget.onclick = () => this.toggleDeckList();
        document.body.appendChild(widget);
        this.updateFloatingWidget();
    },

    updateFloatingWidget: function () {
        const widget = document.getElementById('deck-floating-widget');
        if (!widget) return;
        widget.innerHTML = `
            <div class="widget-thumbnail">
                <img src="https://images.ygoprodeck.com/images/cards/back.jpg"
                     alt="Deck"
                     onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2292%22><rect width=%2264%22 height=%2292%22 fill=%22%23003366%22/><text x=%2232%22 y=%2251%22 font-family=%22sans-serif%22 font-size=%2210%22 text-anchor=%22middle%22 fill=%22%23FFD700%22>Deck</text></svg>'">
            </div>`;
    },// Pestañas donde el widget debe aparecer
    updateFloatingWidgetVisibility: function (tabName) {
        const widget = document.getElementById('deck-floating-widget');
        if (!widget) return;
        const VISIBLE_IN = ['buscador', 'estadisticas'];
        widget.style.display = VISIBLE_IN.includes(tabName) ? '' : 'none';
    },

    toggleDeckList: function () {
        if (this.deckListExpanded) {
            this.collapseDeckList();
        } else {
            this.expandDeckList();
        }
    },

    expandDeckList: function () {
        this.deckListExpanded = true;
        const widget = document.getElementById('deck-floating-widget');
        if (!widget) return;
        const savedDecks = Deck.getSavedDecks ? Deck.getSavedDecks() : [];
        const currentDeckKey = Deck.name ? `deck_${Deck.name}` : '';
        let deckListHTML = '';
        savedDecks.forEach(deck => {
            const mainCount  = Object.values(deck.cards).filter(c => c.location === 'main').reduce((s, c) => s + c.qty, 0);
            const extraCount = Object.values(deck.cards).filter(c => c.location === 'extra').reduce((s, c) => s + c.qty, 0);
            const isActive = `deck_${deck.name}` === currentDeckKey;
            const firstCard = Object.values(deck.cards)[0];
            const thumbnailUrl = firstCard?.data?.card_images
                ? firstCard.data.card_images[0].image_url_small
                : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="87"><rect width="60" height="87" fill="%23003366"/><text x="30" y="48" font-family="sans-serif" font-size="10" text-anchor="middle" fill="%23FFD700">Deck</text></svg>';
            deckListHTML += `
                <div class="widget-deck-item ${isActive ? 'active' : ''}"
                     onclick="event.stopPropagation(); Estadisticas.selectDeckFromWidget('${deck.name}')">
                    <img src="${thumbnailUrl}" class="widget-deck-thumbnail" alt="${deck.name}">
                    <div class="widget-deck-info">
                        <span class="widget-deck-name">${deck.name}</span>
                        <span class="widget-deck-counts">Main: ${mainCount} | Extra: ${extraCount}</span>
                    </div>
                </div>`;
        });
        widget.className = 'deck-floating-widget expanded';
        widget.innerHTML = `
            <button class="widget-close-btn" onclick="event.stopPropagation(); Estadisticas.collapseDeckList()">X</button>
            <div class="widget-deck-list">
                ${savedDecks.length === 0 ? '<p class="widget-no-decks">No hay decks guardados</p>' : deckListHTML}
            </div>`;
        this.autoCollapseTimeout = setTimeout(() => this.collapseDeckList(), 7000);
    },

    collapseDeckList: function () {
        this.deckListExpanded = false;
        if (this.autoCollapseTimeout) clearTimeout(this.autoCollapseTimeout);
        this.updateFloatingWidget();
        const widget = document.getElementById('deck-floating-widget');
        if (widget) widget.className = 'deck-floating-widget';
    },

    selectDeckFromWidget: function (deckName) {
        if (window.Deck && typeof Deck.confirmLoadDeck === 'function') {
            Deck.confirmLoadDeck(deckName);
        }
        if (window.Navigation) Navigation.showTab('mideck');
        this.collapseDeckList();
        setTimeout(() => {
            this.updateFloatingWidget();
            if (window.Estadisticas) Estadisticas.updateDeckStats();
        }, 100);
    },

    // ===============================
    // RECURRENCIA DE CARTAS DEL META
    // ===============================
    calculateMetaCardStats: function () {
        const filtered = this.getFilteredDecks();
        const totalCopies = {};
        const deckUsage = {};
        let decksWithData = 0;

        filtered.forEach(deck => {
            if (!deck.cardFrequency || Object.keys(deck.cardFrequency).length === 0) return;
            decksWithData++;
            Object.entries(deck.cardFrequency).forEach(([cardId, copies]) => {
                totalCopies[cardId] = (totalCopies[cardId] || 0) + copies;
                deckUsage[cardId]   = (deckUsage[cardId]   || 0) + 1;
            });
        });

        const stats = Object.entries(totalCopies)
            .map(([cardId, total]) => ({
                cardId,
                totalCopies:  total,
                deckCount:    deckUsage[cardId],
                avgCopies:    (total / deckUsage[cardId]).toFixed(2),
                presencePct:  Math.round((deckUsage[cardId] / decksWithData) * 100)
            }))
            .sort((a, b) => b.totalCopies - a.totalCopies)
            .slice(0, 30);

        return { stats, decksWithData, totalDecks: filtered.length };
    },

    renderMetaCardStats: function () {
        const { stats, decksWithData, totalDecks } = this.calculateMetaCardStats();

        if (totalDecks === 0) {
            return '<p class="stats-empty">No hay decks del meta cargados aún.</p>';
        }
        if (decksWithData === 0) {
            return `<p class="stats-empty">Ningún deck tiene datos de recurrencia.<br>
                <small>Re-importa los archivos .ydk para generar esta estadística.</small></p>`;
        }

        const header = `
            <div class="meta-card-stats-header">
                <span>Analizando <strong>${decksWithData}</strong> de ${totalDecks} decks</span>
                <span>Mostrando top ${stats.length} cartas</span>
            </div>`;

        const grid = stats.map((item, i) => `
            <div class="meta-card-stat-item">
                <div class="mcs-rank">#${i + 1}</div>
                <img class="mcs-img stats-card-clickable"
                    src="https://images.ygoprodeck.com/images/cards_small/${item.cardId}.jpg"
                    alt="${item.cardId}"
                    id="mcs-img-${item.cardId}"
                    onclick="Estadisticas.openCardById('${item.cardId}')"
                    onerror="this.style.background='#002b4d';this.src='';">
                <div class="mcs-name" id="mcs-name-${item.cardId}">···</div>
                <div class="mcs-stats">
                    <div class="mcs-stat" title="Total de copias en todos los decks">
                        <span class="mcs-stat-label">Copias totales</span>
                        <span class="mcs-stat-value">${item.totalCopies}</span>
                    </div>
                    <div class="mcs-stat" title="En cuántos decks aparece">
                        <span class="mcs-stat-label">Presencia</span>
                        <span class="mcs-stat-value">${item.deckCount}/${decksWithData} <em>(${item.presencePct}%)</em></span>
                    </div>
                    <div class="mcs-stat" title="Promedio de copias en los decks que la usan">
                        <span class="mcs-stat-label">Promedio x deck</span>
                        <span class="mcs-stat-value">${item.avgCopies}</span>
                    </div>
                </div>
            </div>`).join('');

        setTimeout(() => this.loadCardNames(stats.map(s => s.cardId)), 0);
        return header + `<div class="meta-card-stats-grid">${grid}</div>`;
    },

    loadCardNames: async function (cardIds) {
        const batchSize = 10;
        for (let i = 0; i < cardIds.length; i += batchSize) {
            const batch = cardIds.slice(i, i + batchSize);
            await Promise.all(batch.map(async id => {
                try {
                    const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`);
                    const data = await res.json();
                    const name = data.data?.[0]?.name;
                    if (name) {
                        const el = document.getElementById(`mcs-name-${id}`);
                        if (el) el.textContent = name;
                    }
                } catch (_) {}
            }));
        }
    },

    // ===============================
    // SISTEMA DE PUNTOS DE PODER
    // ===============================
    loadPowerScores: async function () {
        const container = document.getElementById('power-scores-content');
        if (!container || this.powerScoreLoading) return;
        this.powerScoreLoading = true;
        container.innerHTML = `
            <div style="text-align:center;padding:var(--spacing-lg);">
                <div class="power-loading-spinner"></div>
                <p style="margin-top:var(--spacing-sm);color:var(--gold-color);">
                    ⚡ Calculando poder... Consultando API para ${this.calculateMetaCardStats().stats.length} cartas
                </p>
            </div>`;
        try {
            const result = await this.calculatePowerScores();
            this.powerScoreCache = result;
            this.powerScoreCache = result;
            // Persistir para que Match-up funcione aunque se navegue a Mi Deck
            try {
                localStorage.setItem('yugioh_power_cache', JSON.stringify(result));
            } catch (_) {}
            container.innerHTML = this.renderPowerScores(result);
        } catch (e) {
            container.innerHTML = `<p class="stats-empty">❌ Error al calcular: ${e.message}</p>`;
        } finally {
            this.powerScoreLoading = false;
        }
    },

    refreshDependentSections: function () {
        // Si Mi Deck está visible, re-renderizar la lista de decks guardados
        // para que Power Level y Match-up usen el cache recién calculado
        if (window.Deck && typeof Deck.render === 'function') {
            Deck.render();
        }
        const counterSec = document.getElementById('counter-cards-sec');
        if (counterSec) counterSec.innerHTML = this.renderCounterCardStats();

        const analysisSec = document.getElementById('deck-analysis-sec');
        if (analysisSec) analysisSec.innerHTML = this.renderDeckAnalysis();

        const deckStatsSec = document.getElementById('deck-stats-sec');
        if (deckStatsSec) deckStatsSec.innerHTML = this.renderDeckStats();
    },

    calculatePowerScores: async function () {
        const { stats, decksWithData } = this.calculateMetaCardStats();
        if (stats.length === 0) return { cards: [], maxPower: 1 };

        const maxCopies = stats[0].totalCopies;

        // PASO 1: base recurrence score (0-100)
        let cards = stats.map(item => ({
            ...item,
            baseScore:    Math.round((item.presencePct * 0.6) + ((item.totalCopies / maxCopies) * 100 * 0.4)),
            cardData:     null,
            specAnalysis: null,
            specBonus:    0,
            counterBonus: 0,
            powerScore:   0,
            isCounter:    false
        }));

        // PASO 2: fetch card data en lotes de 5
        for (let i = 0; i < cards.length; i += 5) {
            await Promise.all(cards.slice(i, i + 5).map(async item => {
                try {
                    const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${item.cardId}`);
                    const data = await res.json();
                    if (data.data?.[0]) {
                        item.cardData     = data.data[0];
                        item.specAnalysis = window.SpecialtyAnalyzer
                            ? SpecialtyAnalyzer.analyzeCard(item.cardData)
                            : { specializations: [], counters: [] };
                        // Roles detectados con las keywords del Config del usuario
                        // — misma vara de medir que los decks guardados
                        item.detectedRoles = window.Deck?.autoAssignRoles?.(item.cardData) ?? [];
                    }
                } catch (_) {}
            }));
        }

        // PASO 3: peso de cada mecánica en el meta
        const specWeight = {};
        cards.forEach(card => {
            (card.specAnalysis?.specializations || []).forEach(spec => {
                specWeight[spec.name] = (specWeight[spec.name] || 0) + card.baseScore;
            });
        });

        // PASO 4: bonus de mecánica (primera pasada de scores)
        cards.forEach(card => {
            (card.specAnalysis?.specializations || []).forEach(spec => {
                const w = specWeight[spec.name] || 0;
                card.specBonus += Math.round((w / 100) * 15);
            });
            card.phase2Score = card.baseScore + card.specBonus;
        });

        // PASO 5: counter bonus basado en phase2Score de las cartas que contrarresta
        cards.forEach(card => {
            (card.specAnalysis?.counters || []).forEach(ctr => {
                const countered = cards.filter(c =>
                    (c.specAnalysis?.specializations || []).some(s => s.name === ctr.countersSpec)
                );
                const bonus = countered.reduce((sum, c) => sum + c.phase2Score, 0);
                card.counterBonus += Math.round(bonus * 0.4);
                if (bonus > 0) card.isCounter = true;
            });
        });

        // PASO 6: power final × multiplicador de copias
        cards.forEach(card => {
            const raw   = card.baseScore + card.specBonus + card.counterBonus;
            const multi = Math.min(1.0, Math.max(0.33, parseFloat(card.avgCopies) / 3));
            card.powerScore = Math.round(raw * multi);
        });

        cards.sort((a, b) => b.powerScore - a.powerScore);
        const maxPower = cards[0]?.powerScore || 1;
        return { cards, maxPower, decksWithData };
    },

    renderPowerScores: function ({ cards, maxPower, decksWithData }) {
        const metaStats = this.calculateMetaCardStats();
        const dwd = decksWithData ?? metaStats.decksWithData;

        if (cards.length === 0) return '<p class="stats-empty">No hay datos suficientes.</p>';

        const medals = ['🥇', '🥈', '🥉'];

        const rows = cards.map((card, i) => {
            const pct       = Math.round((card.powerScore / maxPower) * 100);
            const barColor  = card.isCounter ? '#d63031' : '#0066cc';
            const rankLabel = i < 3 ? medals[i] : `#${i + 1}`;
            const name      = card.cardData?.name || card.cardId;
            const type      = card.cardData?.type || '';
            const tags      = [
                card.isCounter ? '<span class="power-tag tag-counter">COUNTER</span>' : '',
                (card.specAnalysis?.specializations?.length > 0)
                    ? '<span class="power-tag tag-spec">MECÁNICA</span>' : ''
            ].filter(Boolean).join('');
            const breakdown = `Base: ${card.baseScore} | Esp: +${card.specBonus} | Counter: +${card.counterBonus}`;

            return `
                <div class="power-card-item" title="${breakdown}">
                    <div class="power-rank">${rankLabel}</div>
                    <img class="power-img stats-card-clickable"
                        src="https://images.ygoprodeck.com/images/cards_small/${card.cardId}.jpg"
                        alt="${name}"
                        onclick="Estadisticas.openCachedCard('${card.cardId}')"
                        onerror="this.src='';">
                    <div class="power-info">
                        <div class="power-name">${name}</div>
                        <div class="power-type">${type}</div>
                        <div class="power-tags">${tags}</div>
                        <div class="power-bar-container" title="${breakdown}">
                            <div class="power-bar" style="width:${pct}%;background:${barColor};"></div>
                        </div>
                    </div>
                    <div class="power-score-box">
                        <span class="power-score-num" style="color:${barColor}">${card.powerScore}</span>
                        <span class="power-score-label">pts</span>
                        <span class="power-copies-avg">x̄ ${card.avgCopies}/deck</span>
                    </div>
                </div>`;
        }).join('');

        const hasCounterConfig = window.ConfigManager && ConfigManager.getSpecialties().length > 0;
        const notice = !hasCounterConfig
            ? `<div class="power-notice">
                   💡 Configura pares de <strong>Especialidades y Counters</strong> en la pestaña Config
                   para que el bonus de counter se active.
               </div>`
            : '';

        return `
            ${notice}
            <div class="power-scores-meta">
                Análisis sobre <strong>${dwd}</strong> decks del meta ·
                <button class="btn btn-sm btn-secondary" onclick="Estadisticas.loadPowerScores()"
                    style="margin-left:8px;">🔄 Recalcular</button>
            </div>
            <div class="power-legend">
                <span><span class="power-dot" style="background:#0066cc;"></span> Especialización</span>
                <span><span class="power-dot" style="background:#d63031;"></span> Counter</span>
                <span style="font-size:0.75rem;opacity:0.6;">Hover sobre la barra para ver desglose</span>
            </div>
            <div class="power-scores-list">${rows}</div>`;
    },

    // ===============================
    // COUNTER-CARDS DEL META
    // ===============================
    renderCounterCardStats: function () {
        if (!this.powerScoreCache) {
            return `<p class="stats-empty">Requiere calcular ⚡ Poder de Cartas primero.</p>`;
        }

        const counterCards = this.powerScoreCache.cards
            .filter(c => c.isCounter && c.counterBonus > 0)
            .sort((a, b) => b.counterBonus - a.counterBonus);

        if (counterCards.length === 0) {
            return `<p class="stats-empty">
                Ninguna carta del meta detectada como counter.<br>
                <small>Configura pares en Config → Especialidades y Counters.</small>
            </p>`;
        }

        const maxBonus = counterCards[0].counterBonus;
        const medals   = ['🥇', '🥈', '🥉'];

        const rows = counterCards.map((card, i) => {
            const pct  = Math.round((card.counterBonus / maxBonus) * 100);
            const name = card.cardData?.name || card.cardId;
            const countersNames = (card.specAnalysis?.counters || [])
                .map(c => c.countersSpec).filter(Boolean).join(', ') || '—';
            const rank = i < 3 ? medals[i] : `#${i + 1}`;
            return `
                <div class="counter-card-meta-item">
                    <div class="ccm-rank">${rank}</div>
                    <img class="ccm-img stats-card-clickable"
                        src="https://images.ygoprodeck.com/images/cards_small/${card.cardId}.jpg"
                        alt="${name}"
                        onclick="Estadisticas.openCachedCard('${card.cardId}')"
                        onerror="this.src='';">
                    <div class="ccm-info">
                        <div class="ccm-name">${name}</div>
                        <div class="ccm-counters">Contrarresta: <em>${countersNames}</em></div>
                        <div class="ccm-bar-container">
                            <div class="ccm-bar" style="width:${pct}%"></div>
                        </div>
                    </div>
                    <div class="ccm-score">
                        <span class="ccm-score-num">${card.counterBonus}</span>
                        <span class="ccm-score-label">pts counter</span>
                        <span class="ccm-presence">${card.presencePct}% meta</span>
                    </div>
                </div>`;
        }).join('');

        return `
            <div class="counter-cards-header">
                ${counterCards.length} cartas con función counter contra tu Deck detectadas en el meta
            </div>
            <div class="counter-cards-list">${rows}</div>`;
    },

    // ===============================
    // ANÁLISIS COMPLETO DEL DECK
    // ===============================
    renderDeckAnalysis: function () {
        if (!Deck || !Deck.cards || Object.keys(Deck.cards).length === 0) {
            return `<p class="stats-empty">Carga un deck activo para ver el análisis.</p>`;
        }

        const internalStats = Stats.calculateInternalScore(Deck.cards);
        const analysis      = Stats.calculateExternalScore(Deck.cards, this.powerScoreCache, this.metaDecks);
        const internalScore = parseFloat(internalStats.internalScore);
        const externalScore = analysis.externalScore;

        const iColor = internalScore >= 20 ? '#00b894' : internalScore >= 10 ? '#fdcb6e' : '#d63031';
        const eColor = externalScore === null ? '#636e72'
                     : externalScore >= 7 ? '#00b894'
                     : externalScore >= 4 ? '#fdcb6e' : '#d63031';

        // --- MECÁNICAS DEL DECK (especialidades) ---
        const specsBadges = analysis.deckSpecs.length > 0
            ? analysis.deckSpecs.slice(0, 8).map(s =>
                `<span class="analysis-spec-tag">${s.name} <em>×${s.count}</em></span>`
              ).join('')
            : `<span class="analysis-no-data">Sin mecánicas detectadas — configura Mecánicas en Config</span>`;

        // --- CARTAS AMENAZA ---
        let threatHTML = '';
        if (!analysis.hasPowerData) {
            threatHTML = `<p class="stats-empty">Calcula ⚡ Poder de Cartas para ver amenazas.</p>`;
        } else if (analysis.threatCards.length === 0) {
            threatHTML = `<p class="stats-empty">✅ No se detectaron cartas amenaza en el meta actual.</p>`;
        } else {
            threatHTML = analysis.threatCards.slice(0, 8).map(c => `
                <div class="analysis-threat-item">
                    <img class="analysis-card-img stats-card-clickable"
                        src="https://images.ygoprodeck.com/images/cards_small/${c.cardId}.jpg"
                        alt="${c.name}"
                        onclick="Estadisticas.openCachedCard('${c.cardId}')"
                        onerror="this.src='';">
                    <div class="analysis-threat-info">
                        <div class="analysis-item-name">${c.name}</div>
                        <div class="analysis-spec-chips">
                            ${c.countersSpecs.map(s =>
                                `<span class="analysis-counter-chip">⚡ ${s}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="analysis-threat-nums">
                        <span class="analysis-threat-pct">${c.presencePct}%</span>
                        <span class="analysis-threat-meta">meta</span>
                        <span class="analysis-threat-lvl" style="color:#d63031">${c.threatLevel} ⚔️</span>
                    </div>
                </div>`).join('');
        }

        // --- DECKS COUNTER ---
        const medals = ['🥇','🥈','🥉'];
        let cdecksHTML = '';
        if (!analysis.hasPowerData || analysis.counterDecks.length === 0) {
            cdecksHTML = analysis.hasPowerData
                ? `<p class="stats-empty">✅ Ningún deck del meta detectado como amenaza directa.</p>`
                : `<p class="stats-empty">Requiere datos de ⚡ Poder de Cartas.</p>`;
        } else {
            cdecksHTML = analysis.counterDecks.map((d, i) => `
                <div class="analysis-cdeck-item">
                    <span class="analysis-cdeck-rank">${i < 3 ? medals[i] : '#'+(i+1)}</span>
                    <div class="analysis-cdeck-info">
                        <span class="analysis-item-name">${d.name}</span>
                        <span class="analysis-cdeck-folder">${d.folder}</span>
                    </div>
                    <span class="analysis-cdeck-count">${d.unique} cartas amenaza · ${d.copies} copias</span>
                </div>`).join('');
        }

        // --- STAPLES SUGERIDOS ---
        let staplesHTML = '';
        if (analysis.missingStaples.length === 0) {
            staplesHTML = `<p class="stats-empty">
                ${window.ConfigManager
                    ? 'Todos los staples configurados ya están en el deck, o no hay staples guardados en Config.'
                    : 'Configura Staples en la pestaña Config.'}
            </p>`;
        } else {
            staplesHTML = analysis.missingStaples.slice(0, 6).map(s => `
                <div class="analysis-staple-item">
                    <img class="analysis-card-img stats-card-clickable"
                        src="https://images.ygoprodeck.com/images/cards_small/${s.cardId}.jpg"
                        alt="${s.name}"
                        onclick="Estadisticas.openCardById('${s.cardId}')"
                        onerror="this.src='';">
                    <div class="analysis-staple-info">
                        <div class="analysis-item-name">${s.name}</div>
                        <div class="analysis-staple-type">${s.type}</div>
                    </div>
                    <span class="analysis-staple-badge ${s.isCounterOfThreat ? 'badge-disrupt' : 'badge-support'}">
                        ${s.isCounterOfThreat ? '🎯 ANTI-THREAT' : 'STAPLE'}
                    </span>
                </div>`).join('');
        }

        const noMetaNote = !analysis.hasPowerData
            ? `<div class="analysis-notice">
                   ℹ️ Calcula <strong>⚡ Poder de Cartas</strong> en la sección correspondiente
                   para obtener el External Score y las amenazas específicas del meta.
               </div>`
            : '';

        const noSpecNote = analysis.hasPowerData && !analysis.hasSpecData
            ? `<div class="analysis-notice analysis-notice-warn">
                   ⚠️ No se detectaron mecánicas en este deck. Configura pares de
                   Especialidades en Config para obtener análisis externo preciso.
               </div>`
            : '';

        return `
            <div class="deck-analysis-wrap">
                ${noMetaNote}${noSpecNote}

                <!-- SCORES COMPARATIVOS -->
                <div class="analysis-scores-row">
                    <div class="analysis-score-box">
                        <div class="asb-title">Poder Teórico</div>
                        <div class="asb-value" style="color:${iColor}">${internalScore}</div>
                        <div class="asb-sub">pts</div>
                        <div class="asb-bar-track">
                            <div class="asb-bar-fill" style="width:${Math.min(100,(internalScore/30)*100)}%;background:${iColor}"></div>
                        </div>
                        <div class="asb-label">Internal Score</div>
                    </div>
                    <div class="analysis-vs-divider">
                        <span>VS</span>
                        <span class="analysis-vs-meta">META</span>
                    </div>
                    <div class="analysis-score-box">
                        <div class="asb-title">Poder vs Meta</div>
                        <div class="asb-value" style="color:${eColor}">
                            ${externalScore !== null ? externalScore : '—'}
                        </div>
                        <div class="asb-sub">/ 10</div>
                        ${externalScore !== null ? `
                        <div class="asb-bar-track">
                            <div class="asb-bar-fill" style="width:${externalScore*10}%;background:${eColor}"></div>
                        </div>` : '<div class="asb-bar-track"></div>'}
                        <div class="asb-label">External Score</div>
                    </div>
                </div>

                <!-- VEREDICTO -->
                <div class="analysis-verdict">
                    El deck <strong>${Deck.name}</strong> posee un poder teórico de
                    <span style="color:${iColor}">${internalScore} pts</span>,
                    pero frente al META actual es de
                    <span style="color:${eColor}">${externalScore !== null ? externalScore+'/10' : 'N/A'}</span>
                    ${analysis.counterDecks.length > 0
                        ? `por la presencia de decks como
                           <em>${analysis.counterDecks.slice(0,3).map(d=>d.name).join(', ')}</em>.`
                        : '.'}
                </div>

                <!-- MECÁNICAS -->
                <div class="analysis-block">
                    <div class="analysis-block-title">🧬 Mecánicas detectadas</div>
                    <div class="analysis-specs-row">${specsBadges}</div>
                </div>

                <!-- CARTAS QUE GOLPEAN ESTE DECK -->
                <div class="analysis-block">
                    <div class="analysis-block-title">🎯 Cartas del meta que golpean este deck</div>
                    <div class="analysis-list">${threatHTML}</div>
                </div>

                <!-- DECKS QUE MÁS AMENAZAN -->
                <div class="analysis-block">
                    <div class="analysis-block-title">⚔️ Decks del meta que más amenazan</div>
                    <div class="analysis-list">${cdecksHTML}</div>
                </div>

                <!-- STAPLES SUGERIDOS -->
                <div class="analysis-block">
                    <div class="analysis-block-title">💡 Staples del formato no presentes en el deck</div>
                    <div class="analysis-list">${staplesHTML}</div>
                </div>
            </div>`;
    },

    // ===============================
    // ABRIR CARTA DESDE ESTADÍSTICAS
    // ===============================
    openCachedCard: function (cardId) {
        if (!window.CardViewer) return;
        const cached = this.powerScoreCache?.cards?.find(c => String(c.cardId) === String(cardId));
        if (cached?.cardData) {
            CardViewer.open(cached.cardData);
        } else {
            this.openCardById(cardId);
        }
    },

    openCardById: async function (cardId) {
        if (!window.CardViewer) return;
        try {
            const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}`);
            const data = await res.json();
            if (data.data?.[0]) CardViewer.open(data.data[0]);
        } catch (e) {
            console.warn('[Estadisticas] No se pudo abrir carta:', cardId, e);
        }
    },

    // ===============================
    // EXPORTACIONES
    // ===============================
    exportDeckReport: function () {
        if (!Deck || !Deck.cards || Object.keys(Deck.cards).length === 0) {
            alert('No hay deck activo para exportar.');
            return;
        }
        const stats    = Stats.calculateInternalScore(Deck.cards);
        const analysis = Stats.calculateExternalScore(Deck.cards, this.powerScoreCache, this.metaDecks);
        const counter  = Stats.calculateCounterDeckScore(Deck.cards, this.powerScoreCache);
        const now      = new Date().toLocaleDateString('es-ES');
        const section  = (title, lines) =>
            `\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}\n${lines.join('\n')}`;
        const mainCards  = Object.values(Deck.cards).filter(c => c.location === 'main');
        const extraCards = Object.values(Deck.cards).filter(c => c.location === 'extra');
        const sideCards  = Object.values(Deck.cards).filter(c => c.location === 'side');
        const cardLine   = c => `  x${c.qty}  ${c.data.name}${c.roles?.length ? '  ['+c.roles.join(', ')+']' : ''}`;

        let txt = `REPORTE DE DECK - DESTINY DRAW\n`;
        txt += `Deck: ${Deck.name}\nFecha: ${now}\n`;
        txt += section('PUNTUACIONES', [
            `Internal Score  : ${stats.internalScore} pts`,
            `  Consistencia  : ${stats.consistency} pts`,
            `  Potencia      : ${stats.power} pts`,
            `  Resiliencia   : ${stats.resilience} pts`,
            `External Score  : ${analysis.externalScore !== null ? analysis.externalScore + ' / 10' : 'N/A'}`,
            `Anti-META    : ${counter.finalScore} pts (${counter.level})`,
            `Main Deck       : ${stats.mainCards ?? stats.totalCards} cartas`,
        ]);
        txt += section('MECÁNICAS DETECTADAS',
            analysis.deckSpecs.length > 0
                ? analysis.deckSpecs.map(s => `  ${s.name} (×${s.count})`)
                : ['  Sin mecánicas detectadas']);
        txt += section('MAIN DECK', mainCards.map(cardLine));
        if (extraCards.length) txt += section('EXTRA DECK', extraCards.map(cardLine));
        if (sideCards.length)  txt += section('SIDE DECK',  sideCards.map(cardLine));
        txt += section('AMENAZAS DEL META',
            analysis.threatCards.length > 0
                ? analysis.threatCards.slice(0, 10).map(c =>
                    `  ${c.name} — ${c.presencePct}% | Amenaza: ${c.threatLevel} | Contrarresta: ${c.countersSpecs.join(', ')}`)
                : ['  Sin amenazas detectadas']);
        txt += section('DECKS DEL META QUE MÁS AMENAZAN',
            analysis.counterDecks.length > 0
                ? analysis.counterDecks.map((d, i) => `  #${i+1} ${d.name} (${d.folder})`)
                : ['  Ninguno detectado']);
        txt += section('STAPLES SUGERIDOS',
            analysis.missingStaples.length > 0
                ? analysis.missingStaples.slice(0, 10).map(s => `  ${s.name} [${s.type}]`)
                : ['  Todos los staples ya están en el deck']);
        txt += `\n${'='.repeat(60)}\nGenerado con Destiny Draw\n${'='.repeat(60)}\n`;
        this._downloadTxt(txt, `${Deck.name}_reporte.txt`);
    },

    exportMetaPowerRanking: function () {
        if (!this.powerScoreCache || !this.powerScoreCache.cards.length) {
            alert('Primero calcula ⚡ Poder de Cartas.');
            return;
        }
        const lines = [
            'Posicion,Nombre,ID,PowerScore,BaseScore,MecanicaBonus,CounterBonus,CopiasTotales,PresenciaPct,PromedioXDeck,EsCounter'
        ];
        this.powerScoreCache.cards.forEach((c, i) => {
            const name = (c.cardData?.name || c.cardId).replace(/,/g, ';');
            lines.push([
                i + 1, name, c.cardId, c.powerScore,
                c.baseScore, c.specBonus, c.counterBonus,
                c.totalCopies, c.presencePct, c.avgCopies,
                c.isCounter ? 'SI' : 'NO'
            ].join(','));
        });
        this._downloadTxt(lines.join('\n'), 'meta_power_ranking.csv');
    },

    exportMetaFrequency: function () {
        const { stats, decksWithData, totalDecks } = this.calculateMetaCardStats();
        if (stats.length === 0) {
            alert('No hay datos de recurrencia. Importa decks del meta.');
            return;
        }
        const lines = [
            `# Recurrencia de Cartas del Meta — ${new Date().toLocaleDateString('es-ES')}`,
            `# Analizando ${decksWithData} de ${totalDecks} decks`,
            '',
            'Posicion,CardID,CopiasTotales,DecksPresente,TotalDecks,PresenciaPct,PromedioXDeck'
        ];
        stats.forEach((s, i) => {
            lines.push([i+1, s.cardId, s.totalCopies, s.deckCount, decksWithData, s.presencePct, s.avgCopies].join(','));
        });
        this._downloadTxt(lines.join('\n'), 'meta_frecuencia.csv');
    },

    _downloadTxt: function (content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    // ===============================
    // RENDER PRINCIPAL
    // ===============================
    render: function () {
        if (!this.container) return;

        const filteredDecks = this.getFilteredDecks();
        const allSelected   = this.selectedFolders.length === 0;
        const totalMetaDecks = Object.values(this.metaDecks).reduce((s, d) => s + d.length, 0);

        // ─── CHIPS DE CARPETAS (multi-selección) ─────────────────
        const folderChips = `
            <div class="meta-filter-chips">
                <button class="folder-chip ${allSelected ? 'chip-active' : ''}"
                        onclick="Estadisticas.setFolderFilter('all')">
                    Todo el Meta
                    <span class="chip-count">${totalMetaDecks}</span>
                </button>
                ${this.metaFolders.map(folder => {
                    const active = this.selectedFolders.includes(folder);
                    const count  = (this.metaDecks[folder] || []).length;
                    return `
                        <button class="folder-chip ${active ? 'chip-active' : ''}"
                                onclick="Estadisticas.setFolderFilter('${folder}')">
                            ${folder}
                            <span class="chip-count">${count}</span>
                        </button>`;
                }).join('')}
            </div>
            ${this.selectedFolders.length > 1
                ? `<div class="meta-filter-note">
                       ${this.selectedFolders.length} carpetas seleccionadas
                       · ${filteredDecks.length} decks en vista
                   </div>`
                : ''}`;

        let html = `<h2>Estadísticas</h2>`;

        // ── 1. ANÁLISIS DEL DECK VS META (primero que todo) ──────
        html += `
            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('deck-analysis-sec')">
                📊 Análisis del Deck vs Meta
            </h3>
            <div id="deck-analysis-sec" class="stats-section">
                ${this.renderDeckAnalysis()}
            </div>`;

        // ── 2. INTERNAL SCORE ─────────────────────────────────────
        html += `
            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('deck-stats-sec')">
                Deck Activo - Internal Score
            </h3>
            <div id="deck-stats-sec" class="stats-section" style="display:none;">
                ${this.renderDeckStats()}
            </div>`;
        // ── 2.2 WINRATE DEL DECK (si hay datos) ─────────────────────
      html += `<h3 class="stats-section-title" onclick="Estadisticas.toggleSection('winrate-sec'); if(window.Winrate) Winrate.refreshSection();">
                🏆 Winrate del Deck
            </h3>
            <div id="winrate-sec" class="stats-section" style="display:none;">
                <p class="stats-empty">Abre esta sección para ver el winrate.</p>
            </div>`


        // ── 3. GESTIÓN DE CARPETAS ────────────────────────────────
        html += `
            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('meta-management-sec')">
                Gestión de Carpetas del Meta
            </h3>
            <div id="meta-management-sec" class="stats-section" style="display:none;">
                <button onclick="Estadisticas.createFolder()" class="btn btn-primary">Crear Carpeta</button>
                <div class="meta-folders-list">
                    ${this.metaFolders.length === 0 ? '<p class="stats-empty">No hay carpetas creadas</p>' : ''}
                    ${this.metaFolders.map(folder => `
                        <div class="meta-folder-item">
                            <span class="folder-name">${folder}</span>
                            <span class="folder-count">${this.metaDecks[folder].length} decks</span>
                            <button onclick="Estadisticas.importYDK('${folder}')" class="btn btn-primary btn-sm">Importar .ydk</button>
                            <button onclick="Estadisticas.deleteFolder('${folder}')" class="btn btn-danger btn-sm">Eliminar</button>
                        </div>`).join('')}
                </div>
            </div>`;


        // ── 4. DECKS DEL META (con multi-selección de carpetas) ───
        html += `
            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('meta-decks-sec')">
                Decks del Meta
            </h3>
            <div id="meta-decks-sec" class="stats-section" style="display:none;">
                <div class="meta-filter">
                    <label>Filtrar por carpeta:</label>
                    ${folderChips}
                </div>
<div style="display:flex;gap:8px;margin-bottom:var(--spacing-sm);align-items:center;">
    <button class="btn btn-sm btn-secondary" onclick="Estadisticas.recalculateAllMetaDeckScores()">
        🔄 Actualizar Scores
    </button>
    <small style="opacity:0.5;">Solo actualiza decks que ya fueron abiertos al menos una vez.</small>
</div>

                <div class="meta-decks-scroll">
                    ${filteredDecks.length === 0 ? '<p class="stats-empty">No hay decks en esta selección</p>' : ''}
                    ${filteredDecks.map(deck => {
    const key    = `${deck.folder}|||${deck.filename}`;
    const cached = this.metaDeckScores[key] || null;
    return `
        <div class="meta-deck-item" onclick="Estadisticas.loadMetaDeckToMiDeck('${deck.folder}', '${deck.filename}')">
            <button class="meta-deck-delete"
                    onclick="event.stopPropagation(); Estadisticas.deleteDeck('${deck.folder}', '${deck.filename}')"
                    title="Eliminar">X</button>
            <div class="meta-deck-thumbnail">
                <img src="https://images.ygoprodeck.com/images/cards_small/${deck.mostFrequentCard || '0'}.jpg"
                     onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22145%22><rect width=%22100%22 height=%22145%22 fill=%22%23003366%22/><text x=%2250%22 y=%2278%22 font-family=%22sans-serif%22 font-size=%2212%22 text-anchor=%22middle%22 fill=%22%23FFD700%22>Deck</text></svg>'"
                     alt="${deck.filename}">
            </div>
            <div class="meta-deck-info">
                <div class="meta-deck-name">${deck.filename}</div>
                <div class="meta-deck-folder">${deck.folder}</div>
                <div data-meta-score-key="${key}">
                    ${this._renderMetaDeckScoreHTML(cached)}
                </div>
            </div>
        </div>`;
}).join('')}
                </div>
            </div>`;

        // ── 5. RECURRENCIA DE CARTAS ──────────────────────────────
        html += `
            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('meta-card-stats-sec')">
                Recurrencia de Cartas en el Meta
            </h3>
            <div id="meta-card-stats-sec" class="stats-section" style="display:none;">
                ${this.renderMetaCardStats()}
            </div>`;

        // ── 6. PODER DE CARTAS ────────────────────────────────────
        html += `
            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('power-scores-sec')">
                ⚡ Poder de Cartas del Meta
            </h3>
            <div id="power-scores-sec" class="stats-section" style="display:none;">
                <div id="power-scores-content">
                    ${this.powerScoreCache
                        ? this.renderPowerScores(this.powerScoreCache)
                        : `<div style="text-align:center;padding:var(--spacing-md);">
                               <button class="btn btn-primary" onclick="Estadisticas.loadPowerScores()">
                                   ⚡ Calcular Poder de Cartas
                               </button>
                               <p class="stats-help" style="margin-top:var(--spacing-sm);">
                                   Analiza cada carta del meta, su utilidad, mecánica y valor de counter.
                                   Requiere conexión para consultar la API.
                               </p>
                           </div>`}
                </div>
            </div>`;

        // ── 7. COUNTER-CARDS ──────────────────────────────────────
        html += `
            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('counter-cards-sec')">
                🛡️ Counter-Cards del Meta
            </h3>
            <div id="counter-cards-sec" class="stats-section" style="display:none;">
                ${this.renderCounterCardStats()}
            </div>`;

        // ── 8. EXPORTAR DATOS ─────────────────────────────────────
        html += `
            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('export-sec')">
                📤 Exportar Datos
            </h3>
            <div id="export-sec" class="stats-section" style="display:none;">
                <div class="export-grid">
                    <div class="export-card">
                        <div class="export-card-icon">🃏</div>
                        <div class="export-card-title">Reporte del Deck</div>
                        <div class="export-card-desc">
                            TXT con Internal Score, External Score, Anti-META,
                            lista de cartas con roles, amenazas del meta y staples sugeridos.
                        </div>
                        <button class="btn btn-primary export-btn" onclick="Estadisticas.exportDeckReport()">
                            Descargar .txt
                        </button>
                    </div>
                    <div class="export-card">
                        <div class="export-card-icon">⚡</div>
                        <div class="export-card-title">Ranking de Poder</div>
                        <div class="export-card-desc">
                            CSV con todas las cartas del meta y sus puntos de poder,
                            desglose de bonuses y datos de presencia.
                            Requiere calcular Poder de Cartas primero.
                        </div>
                        <button class="btn btn-primary export-btn" onclick="Estadisticas.exportMetaPowerRanking()">
                            Descargar .csv
                        </button>
                    </div>
                    <div class="export-card">
                        <div class="export-card-icon">📊</div>
                        <div class="export-card-title">Frecuencia de Cartas</div>
                        <div class="export-card-desc">
                            CSV con las top 30 cartas más usadas en el meta,
                            copias totales, presencia y promedio por deck.
                        </div>
                        <button class="btn btn-primary export-btn" onclick="Estadisticas.exportMetaFrequency()">
                            Descargar .csv
                        </button>
                    </div>
                </div>
            </div>`;
        html += `
            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('duelista-sec'); if(window.Duelista) Duelista.refreshSection();">
                🎖️ Tu nivel como Duelista
            </h3>
            <div id="duelista-sec" class="stats-section" style="display:none;">
                <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
                    <button class="btn btn-sm" onclick="if(window.Duelista) Duelista.refreshSection()" title="Actualizar datos">
                        🔄 Actualizar
                    </button>
                </div>
                <div id="duelista-content">
                    <p class="stats-empty">Abre esta sección para ver tu perfil.</p>
                </div>
            </div>
        `;
        this.container.innerHTML = html;
    },

    // ===============================
    // UTILIDADES
    // ===============================
    toggleSection: function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
};

window.Estadisticas = Estadisticas;
document.addEventListener('DOMContentLoaded', () => Estadisticas.init());