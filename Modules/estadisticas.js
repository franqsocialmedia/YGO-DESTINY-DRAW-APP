/* ====================================
   ESTADISTICAS MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Visualizacion de estadisticas y comparacion con meta
   ==================================== */

const Estadisticas = {
    container: null,
    metaDecks: {},
    metaFolders: [],
    currentMetaDeck: null,
    selectedFolder: 'all',
    deckListExpanded: false,
    powerScoreCache: null,
    powerScoreLoading: false,
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
        } catch (error) {
            console.error('Error cargando meta data:', error);
        }
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
        this.powerScoreCache = null;
        try {
            localStorage.setItem('yugioh_meta_decks', JSON.stringify({
                decks: this.metaDecks
            }));
        } catch (error) {
            console.error('Error guardando meta data:', error);
        }
    },

    createFolder: function () {
        const folderName = prompt('Ingresa el mes y año del meta\nEjemplo: Febrero 2026');
        if (!folderName) return;

        const regex = /^[A-Za-z]+ \d{4}$/;
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
        if (!confirm('¿Eliminar carpeta "' + folderName + '" y todos sus decks?')) {
            return;
        }

        delete this.metaDecks[folderName];
        this.metaFolders = this.metaFolders.filter(f => f !== folderName);
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
                    filename: file.name.replace('.ydk', ''),
                    mostFrequentCard: mostFrequentId,
                    cardCount: deckData.cards.length,
                    cardFrequency: cardFrequency
                };

                if (!this.metaDecks[folderName]) {
                    this.metaDecks[folderName] = [];
                }

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
        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        const cards = [];
        let section = '';

        for (let line of lines) {
            if (line.startsWith('#') || line.startsWith('!')) {
                section = line;
                continue;
            }

            const cardId = line.trim();
            if (cardId && !isNaN(cardId)) {
                cards.push(cardId);
            }
        }

        return { cards };
    },

    getMostFrequentCardId: function (cards) {
        if (!cards || cards.length === 0) return null;

        const frequency = {};
        cards.forEach(id => {
            frequency[id] = (frequency[id] || 0) + 1;
        });

        let maxCount = 0;
        let mostFrequent = null;

        for (let id in frequency) {
            if (frequency[id] > maxCount) {
                maxCount = frequency[id];
                mostFrequent = id;
            }
        }

        return mostFrequent;
    },

    deleteDeck: function (folderName, deckFilename) {
        if (!confirm('¿Eliminar deck "' + deckFilename + '"?')) {
            return;
        }

        this.metaDecks[folderName] = this.metaDecks[folderName].filter(d => d.filename !== deckFilename);
        this.saveMetaData();
        this.render();
    },

    setFolderFilter: function (folder) {
        this.selectedFolder = folder;
        this.render();
    },

    getFilteredDecks: function () {
        const filtered = [];

        if (this.selectedFolder === 'all') {
            for (let folder in this.metaDecks) {
                this.metaDecks[folder].forEach(deck => {
                    filtered.push({ ...deck, folder });
                });
            }
        } else {
            const decks = this.metaDecks[this.selectedFolder] || [];
            decks.forEach(deck => {
                filtered.push({ ...deck, folder: this.selectedFolder });
            });
        }

        return filtered;
    },

    viewMetaDeck: function (folderName, deckFilename) {
        if (!Deck || !Deck.getSavedDecks) return;

        const savedDecks = Deck.getSavedDecks();
        
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        let deckListHTML = '';
        savedDecks.forEach(deck => {
            const mainCount = Object.values(deck.cards).filter(c => c.location === 'main').reduce((s, c) => s + c.qty, 0);
            const extraCount = Object.values(deck.cards).filter(c => c.location === 'extra').reduce((s, c) => s + c.qty, 0);
            
            deckListHTML += `
                <div class="deck-select-item" onclick="Estadisticas.selectAndLoadDeck('${deck.key}')">
                    <span class="deck-select-name">${deck.name}</span>
                    <span class="deck-select-count">Main: ${mainCount} | Extra: ${extraCount}</span>
                </div>
            `;
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
            </div>
        `;

        document.body.appendChild(overlay);
    },

    selectAndLoadDeck: function (deckKey) {
        if (Deck && Deck.loadDeck) {
            Deck.loadDeck(deckKey);
        }
        this.closeModal();
        this.updateDeckStats();
        this.updateFloatingWidget();
    },

    closeModal: function () {
        const overlay = document.querySelector('.deck-overlay');
        if (overlay) overlay.remove();
    },

    renderDeckStats: function () {
        if (!Deck || !Deck.cards || Object.keys(Deck.cards).length === 0) {
            return `
                <div class="stats-empty">
                    <p>No hay deck activo para mostrar estadisticas</p>
                    <p class="stats-help">Ve a "Mi Deck" y carga un deck para ver sus estadisticas</p>
                </div>
            `;
        }

        const stats = Stats.calculateInternalScore(Deck.cards);

        const scoreColor = stats.internalScore >= 7 ? '#00b894' : 
                          stats.internalScore >= 5 ? '#fdcb6e' : '#d63031';

        return `
            <div class="stats-card">
                <div class="stats-header">
                    <h3>Internal Score - ${Deck.name}</h3>
                    <div class="stats-score" style="color: ${scoreColor}">
                        ${stats.internalScore} / 10
                    </div>
                </div>

                <div class="stats-bars">
                    <div class="stat-bar-row">
                        <span class="stat-bar-label">Consistencia (50%)</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar" style="width: ${stats.consistency * 10}%; background: #00b894"></div>
                        </div>
                        <span class="stat-bar-value">${stats.consistency}/10</span>
                    </div>

                    <div class="stat-bar-row">
                        <span class="stat-bar-label">Potencia (30%)</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar" style="width: ${stats.power * 10}%; background: #d63031"></div>
                        </div>
                        <span class="stat-bar-value">${stats.power}/10</span>
                    </div>

                    <div class="stat-bar-row">
                        <span class="stat-bar-label">Resiliencia (20%)</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar" style="width: ${stats.resilience * 10}%; background: #0066cc"></div>
                        </div>
                        <span class="stat-bar-value">${stats.resilience}/10</span>
                    </div>
                </div>

                <div class="stats-footer">
                    <span>Total: ${stats.totalCards} cartas</span>
                </div>
            </div>
        `;
    },

    updateDeckStats: function () {
        const statsSection = document.getElementById('deck-stats-sec');
        if (statsSection) {
            statsSection.innerHTML = this.renderDeckStats();
        }
    },

    createDeckFloatingWidget: function () {
        const widget = document.createElement('div');
        widget.id = 'deck-floating-widget';
        widget.className = 'deck-floating-widget';
        widget.onclick = () => this.toggleDeckList();

        document.body.appendChild(widget);
        this.updateFloatingWidget();
    },
    openDeckFromWidget(deckId) {
    const metaDecks = JSON.parse(localStorage.getItem('yugioh_meta_decks')) || {};
    
    let selectedDeck = null;

    Object.values(metaDecks).forEach(folder => {
        folder.decks.forEach(deck => {
            if (deck.id === deckId) {
                selectedDeck = deck;
            }
        });
    });

    if (!selectedDeck) {
        alert('No se pudo cargar el deck');
        return;
    }

    // Sustituye el deck activo
    Deck.cards = JSON.parse(JSON.stringify(selectedDeck.cards));
    Deck.name = selectedDeck.name;

    Deck.render();

    // Feedback visual
    document
        .querySelectorAll('.widget-deck-item')
        .forEach(el => el.classList.remove('active'));

    const activeItem = document.querySelector(`[data-deck-id="${deckId}"]`);
    if (activeItem) activeItem.classList.add('active');
},


    updateFloatingWidget: function () {
    const widget = document.getElementById('deck-floating-widget');
    if (!widget) return;

    widget.innerHTML = `
        <div class="widget-thumbnail">
            <img src="https://images.ygoprodeck.com/images/cards/back.jpg" 
                 alt="Deck"
                 onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2292%22><rect width=%2264%22 height=%2292%22 fill=%22%23003366%22/><text x=%2232%22 y=%2251%22 font-family=%22sans-serif%22 font-size=%2210%22 text-anchor=%22middle%22 fill=%22%23FFD700%22>Deck</text></svg>'">
        </div>
    `;
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
            const mainCount = Object.values(deck.cards).filter(c => c.location === 'main').reduce((s, c) => s + c.qty, 0);
            const extraCount = Object.values(deck.cards).filter(c => c.location === 'extra').reduce((s, c) => s + c.qty, 0);
            const isActive = `deck_${deck.name}` === currentDeckKey;

            // Obtener imagen de la primera carta del deck
            const firstCard = Object.values(deck.cards)[0];
            const thumbnailUrl = firstCard && firstCard.data && firstCard.data.card_images
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
                </div>
            `;
        });

        widget.className = 'deck-floating-widget expanded';
        widget.innerHTML = `
            <button class="widget-close-btn" onclick="event.stopPropagation(); Estadisticas.collapseDeckList()">X</button>
            <div class="widget-deck-list">
                ${savedDecks.length === 0 ? '<p class="widget-no-decks">No hay decks guardados</p>' : deckListHTML}
            </div>
        `;

        this.autoCollapseTimeout = setTimeout(() => {
            this.collapseDeckList();
        }, 7000);
    },

    collapseDeckList: function () {
        this.deckListExpanded = false;
        if (this.autoCollapseTimeout) {
            clearTimeout(this.autoCollapseTimeout);
        }
        this.updateFloatingWidget();
        const widget = document.getElementById('deck-floating-widget');
        if (widget) {
            widget.className = 'deck-floating-widget';
        }
    },

    selectDeckFromWidget: function (deckName) {
    if (window.Deck && typeof Deck.confirmLoadDeck === 'function') {
        Deck.confirmLoadDeck(deckName);
    }
    if (window.Navigation) {
        Navigation.showTab('mideck');
    }
    this.collapseDeckList();
    setTimeout(() => {
        this.updateFloatingWidget();
        if (window.Estadisticas) Estadisticas.updateDeckStats();
    }, 100);
    },
    initFloatingDeckWidgetEvents() {
    const widget = document.querySelector('.deck-floating-widget');
    if (!widget) return;

    widget.addEventListener('click', (e) => {

        // Botón eliminar (X) → no abrir deck
        if (e.target.classList.contains('meta-deck-delete')) {
            e.stopPropagation();
            return;
        }

        // Buscar el item del deck clickeado
        const deckItem = e.target.closest('.widget-deck-item, .meta-deck-item');
        if (!deckItem) return;

        const deckId = deckItem.dataset.deckId;
        if (!deckId) {
            console.warn('[Stats] Deck sin dataset.deckId');
            return;
        }

        // 👉 ACCIÓN REAL: abrir / sustituir deck
        Estadisticas.openDeckFromWidget(deckId);
    });
},
// ===============================
// ESTADÍSTICAS DE CARTAS DEL META
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
        return `
            <p class="stats-empty">
                Ningún deck tiene datos de recurrencia.<br>
                <small>Re-importa los archivos .ydk para generar esta estadística.</small>
            </p>`;
    }

    const header = `
        <div class="meta-card-stats-header">
            <span>Analizando <strong>${decksWithData}</strong> de ${totalDecks} decks</span>
            <span>Mostrando top ${stats.length} cartas</span>
        </div>`;

    const grid = stats.map((item, i) => `
        <div class="meta-card-stat-item">
            <div class="mcs-rank">#${i + 1}</div>
            <img class="mcs-img"
                 src="https://images.ygoprodeck.com/images/cards_small/${item.cardId}.jpg"
                 alt="${item.cardId}"
                 id="mcs-img-${item.cardId}"
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
        </div>
    `).join('');

    // Lanzar carga de nombres tras render
    setTimeout(() => this.loadCardNames(stats.map(s => s.cardId)), 0);

    return header + `<div class="meta-card-stats-grid">${grid}</div>`;
},

loadCardNames: async function (cardIds) {
    // Lanza peticiones en lotes de 10 para no saturar la API
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
            } catch (_) { /* sin nombre si falla */ }
        }));
    }
},// ===============================
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
        container.innerHTML = this.renderPowerScores(result);
    } catch (e) {
        container.innerHTML = `<p class="stats-empty">❌ Error al calcular: ${e.message}</p>`;
    } finally {
        this.powerScoreLoading = false;
    }
},

calculatePowerScores: async function () {
    const { stats, decksWithData } = this.calculateMetaCardStats();
    if (stats.length === 0) return { cards: [], maxPower: 1 };

    const maxCopies = stats[0].totalCopies;

    // PASO 1: base recurrence score (0-100)
    let cards = stats.map(item => ({
        ...item,
        baseScore: Math.round(
            (item.presencePct * 0.6) +
            ((item.totalCopies / maxCopies) * 100 * 0.4)
        ),
        cardData:    null,
        specAnalysis: null,
        specBonus:   0,
        counterBonus: 0,
        powerScore:  0,
        isCounter:   false
    }));

    // PASO 2: fetch card data en lotes de 5
    for (let i = 0; i < cards.length; i += 5) {
        await Promise.all(cards.slice(i, i + 5).map(async item => {
            try {
                const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${item.cardId}`);
                const data = await res.json();
                if (data.data?.[0]) {
                    item.cardData    = data.data[0];
                    item.specAnalysis = window.SpecialtyAnalyzer
                        ? SpecialtyAnalyzer.analyzeCard(item.cardData)
                        : { specializations: [], counters: [] };
                }
            } catch (_) {}
        }));
    }

    // PASO 3: mapa de peso de especialización en el meta
    // specWeight[specName] = suma de baseScore de todas las cartas con esa spec
    const specWeight = {};
    cards.forEach(card => {
        (card.specAnalysis?.specializations || []).forEach(spec => {
            specWeight[spec.name] = (specWeight[spec.name] || 0) + card.baseScore;
        });
    });

    // PASO 4: specialization bonus (primera pasada de scores)
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

    // PASO 6: power final = (base + bonuses) × multiplicador de copias
    cards.forEach(card => {
        const raw   = card.baseScore + card.specBonus + card.counterBonus;
        const multi = Math.min(1.0, Math.max(0.33, parseFloat(card.avgCopies) / 3));
        card.powerScore = Math.round(raw * multi);
    });

    cards.sort((a, b) => b.powerScore - a.powerScore);
    const maxPower = cards[0]?.powerScore || 1;
    return { cards, maxPower };
},

renderPowerScores: function ({ cards, maxPower }) {
    const { decksWithData } = this.calculateMetaCardStats();

    if (cards.length === 0) {
        return '<p class="stats-empty">No hay datos suficientes.</p>';
    }

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
                ? '<span class="power-tag tag-spec">ESPECIALIZACIÓN</span>' : ''
        ].filter(Boolean).join('');

        const breakdown = `Base: ${card.baseScore} | Esp: +${card.specBonus} | Counter: +${card.counterBonus}`;

        return `
            <div class="power-card-item" title="${breakdown}">
                <div class="power-rank">${rankLabel}</div>
                <img class="power-img"
                     src="https://images.ygoprodeck.com/images/cards_small/${card.cardId}.jpg"
                     alt="${name}"
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

    const hasCounterConfig = window.ConfigManager &&
        ConfigManager.getSpecialties().length > 0;

    const notice = !hasCounterConfig
        ? `<div class="power-notice">
               💡 Configura pares de <strong>Especialidades y Counters</strong> en la pestaña Config
               para que el bonus de counter se active.
           </div>`
        : '';

    return `
        ${notice}
        <div class="power-scores-meta">
            Análisis sobre <strong>${decksWithData}</strong> decks del meta ·
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
    render: function () {
        if (!this.container) return;

        const filteredDecks = this.getFilteredDecks();

        let html = `
            <h2>Estadisticas</h2>

            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('deck-stats-sec')">
                Deck Activo - Internal Score
            </h3>
            <div id="deck-stats-sec" class="stats-section">
                ${this.renderDeckStats()}
            </div>

            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('meta-management-sec')">
                Gestion de Carpetas del Meta
            </h3>
            <div id="meta-management-sec" class="stats-section" ">
                <button onclick="Estadisticas.createFolder()" class="btn btn-primary">Crear Carpeta</button>
                <div class="meta-folders-list">
                    ${this.metaFolders.length === 0 ? '<p class="stats-empty">No hay carpetas creadas</p>' : ''}
                    ${this.metaFolders.map(folder => `
                        <div class="meta-folder-item">
                            <span class="folder-name">${folder}</span>
                            <span class="folder-count">${this.metaDecks[folder].length} decks</span>
                            <button onclick="Estadisticas.importYDK('${folder}')" class="btn btn-primary btn-sm">Importar .ydk</button>
                            <button onclick="Estadisticas.deleteFolder('${folder}')" class="btn btn-danger btn-sm">Eliminar</button>
                        </div>
                    `).join('')}
                </div>
            </div>

            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('meta-decks-sec')">
                Decks del Meta
            </h3>
            <div id="meta-decks-sec" class="stats-section">
                <div class="meta-filter">
                    <label>Filtrar por carpeta:</label>
                    <select onchange="Estadisticas.setFolderFilter(this.value)" class="meta-filter-select">
                        <option value="all" ${this.selectedFolder === 'all' ? 'selected' : ''}>Todo el Meta</option>
                        ${this.metaFolders.map(folder => `
                            <option value="${folder}" ${this.selectedFolder === folder ? 'selected' : ''}>${folder}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="meta-decks-scroll">
                    ${filteredDecks.length === 0 ? '<p class="stats-empty">No hay decks en esta seleccion</p>' : ''}
                    ${filteredDecks.map(deck => `
                        <div class="meta-deck-item" onclick="Estadisticas.viewMetaDeck('${deck.folder}', '${deck.filename}')">
                            <button class="meta-deck-delete" onclick="event.stopPropagation(); Estadisticas.deleteDeck('${deck.folder}', '${deck.filename}')" title="Eliminar">X</button>
                            <div class="meta-deck-thumbnail">
                                <img src="https://images.ygoprodeck.com/images/cards_small/${deck.mostFrequentCard || '0'}.jpg" 
                                     onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22145%22><rect width=%22100%22 height=%22145%22 fill=%22%23003366%22/><text x=%2250%22 y=%2278%22 font-family=%22sans-serif%22 font-size=%2212%22 text-anchor=%22middle%22 fill=%22%23FFD700%22>Deck</text></svg>'"
                                     alt="${deck.filename}">
                            </div>
                            <div class="meta-deck-info">
                                <div class="meta-deck-name">${deck.filename}</div>
                                <div class="meta-deck-folder">${deck.folder}</div>
                                <div class="meta-deck-score">External: 0.0</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
html += `
    <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('meta-card-stats-sec')">
        Recurrencia de Cartas en el Meta
    </h3>
    <div id="meta-card-stats-sec" class="stats-section">
        ${this.renderMetaCardStats()}
    </div>
`;
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
                           Analiza cada carta del meta, su utilidad, especialización y valor de counter.
                           Requiere conexión para consultar la API.
                       </p>
                   </div>`
            }
        </div>
    </div>
`;
        this.container.innerHTML = html;
    },

    toggleSection: function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
};

window.Estadisticas = Estadisticas;
document.addEventListener('DOMContentLoaded', () => Estadisticas.init());