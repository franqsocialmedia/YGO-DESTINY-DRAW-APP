/* mideck.js — Deck activo, banlist y sidebar de Mi Deck */
/* Absorbe: deck.js, banlist.js, engines.js */

// Stats vive en data.js — se carga antes que mideck.js


// Winrate — shim si no existe como módulo independiente
if (!window.Winrate) {
    window.Winrate = { refreshSection: function() {} };
}



// ── Deck — deck activo: render sub-tabs Decklist/Construcción, guardado, importación/exportación .ydk, carta as, notas ──

const Deck = {

    cards: {},
    name: "Mi Deck",
    notes: "",

    init: function () {
        this.container = document.getElementById('deck-container');
        if (!this.container) return;
        this.render();
    },

    // ===============================
    isExtraDeckCard: function (card) {
        if (!card || !card.type) return false;
        const t = card.type.toLowerCase();
        return (
            t.includes('fusion') ||
            t.includes('synchro') ||
            t.includes('xyz') ||
            t.includes('link')
        );
    },

    
    // Determinar tipo de carta para ordenamiento Main Deck
    getMainDeckCardType: function(card) {
        if (!card || !card.type) return 999;
        
        const type = card.type.toLowerCase();
        
        if (type.includes('ritual monster')) return 0;
        if (type.includes('normal monster')) return 1;
        if (type.includes('effect monster')) return 2;
        if (type.includes('pendulum')) return 3;
        if (type.includes('spell')) return 4;
        if (type.includes('trap')) return 5;
        
        return 999;
    },
    
    // Determinar tipo de carta para ordenamiento Extra Deck
    getExtraDeckCardType: function(card) {
        if (!card || !card.type) return 999;
        
        const type = card.type.toLowerCase();
        
        if (type.includes('fusion')) return 0;
        if (type.includes('synchro')) return 1;
        if (type.includes('xyz')) return 2;
        if (type.includes('link')) return 3;
        
        return 999;
    },
    
    // Comparador para ordenamiento
    compareCards: function(a, b, location) {
        const cardA = a[1].data;
        const cardB = b[1].data;
        
        if (location === 'main') {
            // Ordenar Main Deck
            const typeA = this.getMainDeckCardType(cardA);
            const typeB = this.getMainDeckCardType(cardB);
            
            if (typeA !== typeB) {
                return typeA - typeB;
            }
            
            return cardA.name.localeCompare(cardB.name);
            
        } else if (location === 'extra') {
            // Ordenar Extra Deck
            const typeA = this.getExtraDeckCardType(cardA);
            const typeB = this.getExtraDeckCardType(cardB);
            
            if (typeA !== typeB) {
                return typeA - typeB;
            }
            
            return cardA.name.localeCompare(cardB.name);
            
        } else {
            return cardA.name.localeCompare(cardB.name);
        }
    },

    // ===============================
    
    detectSubtypes: function(card) {
        if (!card || !card.type) return [];
        
        const type = card.type.toLowerCase();
        const subtypes = [];
        
        if (type.includes('tuner')) subtypes.push('Tuner');
        if (type.includes('gemini')) subtypes.push('Gemini');
        if (type.includes('union')) subtypes.push('Union');
        if (type.includes('flip')) subtypes.push('Flip');
        if (type.includes('toon')) subtypes.push('Toon');
        
        return subtypes;
    },

    // ===============================
    autoAssignRoles: function (card) {
    const type = (card.type || '').toLowerCase();
    if (type.includes('normal monster')) return [];
    if (window.CardViewer && typeof CardViewer.detectPossibleRoles === 'function') {
        return CardViewer.detectPossibleRoles(card);
    }
    return [];
},

    // ===============================
    syncFromViewer: function (id, card, qty) {
        console.log('🔄 [Deck] syncFromViewer llamado:', { id, cardName: card.name, qty });
        
        if (qty <= 0) {
            console.log('❌ [Deck] Cantidad <= 0, eliminando carta');
            delete this.cards[id];
        } else {
            if (!this.cards[id]) {
                console.log('➕ [Deck] Nueva carta, creando entrada');
                
                // Analizar especialidades de la carta (incluye staples - Paso 2)
                const specialties = typeof SpecialtyAnalyzer !== 'undefined' 
                    ? SpecialtyAnalyzer.analyzeCard(card) 
                    : [];
                
                // PASO 4: Analizar nomenclatura de la carta
                const nomenclature = typeof NomenclatureAnalyzer !== 'undefined'
                    ? NomenclatureAnalyzer.analyzeCard(card)
                    : null;
                
                // Obtener roles automáticos
                let roles = this.autoAssignRoles(card);
                
                console.log('📊 [Deck] Roles automáticos asignados:', roles);
                console.log('🎯 [Deck] Especialidades detectadas:', specialties);
                
                this.cards[id] = {
                    data: card,
                    qty: qty,
                    location: this.isExtraDeckCard(card) ? 'extra' : 'main',
                    roles: roles,
                    specialties: specialties,
                    nomenclature: nomenclature
                };
                
                console.log('✅ [Deck] Carta agregada:', this.cards[id]);
            } else {
                console.log('📝 [Deck] Carta existente, actualizando cantidad');
                this.cards[id].qty = qty;
            }
        }
        
        console.log('🎨 [Deck] Llamando a render()');
        this.render();
        console.log('✅ [Deck] syncFromViewer completado');
    },

    changeQty: function (id, delta) {
        const item = this.cards[id];
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) delete this.cards[id];

        this.render();
    },

    toggleLocation: function (id) {
        const item = this.cards[id];
        if (!item || item.location === 'extra') return;

        item.location = item.location === 'main' ? 'side' : 'main';
        this.render();
    },

    // ===============================
    count: function (loc) {
        return Object.values(this.cards)
            .filter(c => c.location === loc)
            .reduce((s, c) => s + c.qty, 0);
    },

    // ===============================
    openRenamePanel: function () {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        overlay.innerHTML = `
            <div class="deck-modal">
                <h3>Cambiar Nombre del Deck</h3>
                <input id="deck-name-input" value="${this.name}">
                <button onclick="Deck.confirmRename()">Cambiar Nombre</button>
                <button onclick="Deck.closeModal()">Cancelar</button>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    confirmRename: function () {
        const val = document.getElementById('deck-name-input').value.trim();
        if (val) this.name = val;
        this.closeModal();
        this.render();
    },

    closeModal: function () {
        const overlay = document.querySelector('.deck-overlay');
        if (overlay) overlay.remove();
    },

    // ===============================
    openRolePanel: function (id) {
        const item = this.cards[id];
        if (!item) return;

        // ACTUALIZADO: Obtener roles desde ConfigManager
        const availableRoles = ConfigManager.getRoleNames();

        const currentRoles = item.roles || [];

        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        let checkboxesHTML = '';
        availableRoles.forEach(role => {
            const isChecked = currentRoles.includes(role) ? 'checked' : '';
            checkboxesHTML += `
                <label class="role-checkbox-label">
                    <input type="checkbox" value="${role}" ${isChecked} class="role-checkbox">
                    ${role}
                </label>
            `;
        });

        const isCartaAs = this.getCartaAs() === String(id);

        overlay.innerHTML = `
            <div class="deck-modal">
                <div class="role-panel-header">
                    <h3>Asignar Roles</h3>
                    <label class="carta-as-toggle" title="Marcar como carta insignia del deck">
                        <input type="checkbox"
                            id="carta-as-checkbox"
                            ${isCartaAs ? 'checked' : ''}
                            onchange="Deck.setCartaAs(this.checked ? '${id}' : null);">
                        ⭐ Carta As
                    </label>
                </div>
                <p class="deck-modal-highlight">${item.data.name}</p>
                <div class="role-checkboxes">
                    ${checkboxesHTML}
                </div>
                <div class="deck-modal-buttons">
                    <button onclick="Deck.assignRoles(${id})">Asignar Rol</button>
                    <button onclick="Deck.removeRoles(${id})">Quitar Roles</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    assignRoles: function (id) {
        const item = this.cards[id];
        if (!item) return;

        const checkboxes = document.querySelectorAll('.role-checkbox:checked');
        const selectedRoles = Array.from(checkboxes).map(cb => cb.value);

        // Preservar "Carta As" — no es un checkbox normal del panel
        const hadCartaAs = item.roles?.includes('Carta As');
        item.roles = selectedRoles;
        if (hadCartaAs) item.roles.push('Carta As');

        this.closeModal();
        this.render();
    },

    removeRoles: function (id) {
        const item = this.cards[id];
        if (!item) return;

        item.roles = [];
        this.closeModal();
        this.render();
    },

    // ===============================
    saveDeck: function () {
        const deckData = {
            cards:   this.cards,
            notes:   this.notes || '',
            savedAt: new Date().getTime()
        };
        localStorage.setItem(`deck_${this.name}`, JSON.stringify(deckData));
        alert('Deck guardado');
        this.render();
        if (window.Engines) Engines._renderSidebar();
        if (window.Estadisticas) {
            const panel = document.getElementById('deck-selector-panel');
            if (panel) panel.innerHTML = Estadisticas.renderDeckSelectorPanel();
        }
    },

    getSavedDecks: function () {
        const decks = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('deck_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    const deckName = key.replace('deck_', '');
                    decks.push({
                        name: deckName,
                        cards: data.cards || data,
                        savedAt: data.savedAt || 0
                    });
                } catch (e) {
                    console.error('Error cargando deck:', key);
                }
            }
        }
        return decks.sort((a, b) => b.savedAt - a.savedAt);
    },

    getMostRepeatedCard: function (cards) {
        let maxQty = 0;
        let mostRepeated = null;
        
        Object.values(cards).forEach(item => {
            if (item.qty > maxQty) {
                maxQty = item.qty;
                mostRepeated = item.data;
            }
        });
        
        return mostRepeated;
    },

    openLoadDeckPanel: function (deckName) {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        overlay.innerHTML = `
            <div class="deck-modal">
                <h3>Cargar Deck</h3>
                <p class="deck-modal-highlight">${deckName}</p>
                <p class="deck-modal-note">¿Deseas cargar este deck? Se reemplazarán las cartas actuales.</p>
                <div class="deck-modal-buttons">
                    <button onclick="Deck.confirmLoadDeck('${deckName}')">Sí, Cargar</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    confirmLoadDeck: function (deckName) {
    this.closeModal();

    const loadingEl = document.createElement('div');
    loadingEl.id = 'deck-load-overlay';
    loadingEl.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.78);
        display:flex;align-items:center;justify-content:center;
        z-index:9999;flex-direction:column;gap:14px;`;
    loadingEl.innerHTML = `
        <div class="power-loading-spinner"></div>
        <div style="color:#FFD700;font-size:1rem;text-align:center;padding:0 20px;">
            Cargando <strong>${deckName}</strong>...
        </div>`;
    document.body.appendChild(loadingEl);

    setTimeout(() => {
        try {
            const data = JSON.parse(localStorage.getItem(`deck_${deckName}`));
            this.cards = data.cards || data;
            this.name  = deckName;
            this.notes = data.notes || '';

            Object.entries(this.cards).forEach(([id, item]) => {
                if (item.data) {
                    item.roles = this.autoAssignRoles(item.data);
                }
            });

            this.render();
            this.onDeckLoaded();
        } catch (e) {
            alert('Error al cargar el deck');
        } finally {
            document.getElementById('deck-load-overlay')?.remove();
        }
    }, 50);
},
    openDeleteDeckPanel: function (deckName) {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        overlay.innerHTML = `
            <div class="deck-modal deck-modal-warning">
                <h3>Eliminar Deck</h3>
                <p class="deck-modal-highlight">${deckName}</p>
                <p class="deck-modal-note">¿Estás seguro de eliminar este deck? Esta acción no se puede deshacer.</p>
                <div class="deck-modal-buttons">
                    <button class="btn-danger" onclick="Deck.confirmDeleteDeck('${deckName}')">Sí, Eliminar</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    confirmDeleteDeck: function (deckName) {
        localStorage.removeItem(`deck_${deckName}`);
        this.closeModal();
        if (window.Engines) Engines._renderSidebar();
        this.render();
    },

    clearDeck: function () {
        this.cards = {};
        this.render();
    },
tryDeck: function () {
    if (!window.Navigation || !window.Torneo || !window.ZonaPractica) return;
    Navigation.showTab('simuladores');
    setTimeout(() => {
        Torneo.showSimTab('practica');
        setTimeout(() => {
            const dk = { name: this.name, cards: this.cards };
            ZonaPractica._loadDeck('_direct', 0);
            ZonaPractica._dsCache._direct = [dk];
            ZonaPractica._loadDeck('_direct', 0);
        }, 80);
    }, 60);
},
tryDeckExperimentacion: function (deckName) {
    if (!window.Navigation || !window.Torneo || !window.Experimentacion) return;
    const saved = Deck.getSavedDecks();
    const dk = saved.find(d => d.name === deckName);
    if (!dk) return;
    Navigation.showTab('simuladores');
    setTimeout(() => {
        Torneo.showSimTab('experimentacion');
        setTimeout(() => {
            Experimentacion._dsCache._direct = [dk];
            Experimentacion._loadDeck('_direct', 0);
        }, 80);
    }, 60);
},
    exportYDK: function () {
        let main = '', extra = '', side = '';

        Object.entries(this.cards).forEach(([id, item]) => {
            for (let i = 0; i < item.qty; i++) {
                if (item.location === 'main') main += id + '\n';
                if (item.location === 'extra') extra += id + '\n';
                if (item.location === 'side') side += id + '\n';
            }
        });

        const content = `#created by Destiny Draw\n#main\n${main}#extra\n${extra}!side\n${side}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.name}.ydk`;
        a.click();
    },

    exportTXT: function () {
        let txt = `${this.name}\n\n`;

        ['main','extra','side'].forEach(loc => {
            txt += `---- ${loc.toUpperCase()} ----\n`;
            Object.values(this.cards)
                .filter(c => c.location === loc)
                .forEach(c => {
                    txt += `${c.data.name} - ${c.data.type} - x${c.qty}\n`;
                });
            txt += '\n';
        });

        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.name}.txt`;
        a.click();
    },

    importYDK: function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.ydk';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const text = await file.text();
            this.parseYDK(text, file.name);
        };

        input.click();
    },

    parseYDK: async function (content, filename) {
        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        
        let currentSection = '';
        const cardIds = { main: [], extra: [], side: [] };

        lines.forEach(line => {
            if (line.startsWith('#main')) {
                currentSection = 'main';
            } else if (line.startsWith('#extra')) {
                currentSection = 'extra';
            } else if (line.startsWith('!side')) {
                currentSection = 'side';
            } else if (line.startsWith('#') || line.startsWith('!')) {
            } else if (/^\d+$/.test(line)) {
                if (currentSection) {
                    cardIds[currentSection].push(line);
                }
            }
        });

        // Contar cantidades
        const cardCounts = { main: {}, extra: {}, side: {} };
        
        ['main', 'extra', 'side'].forEach(section => {
            cardIds[section].forEach(id => {
                cardCounts[section][id] = (cardCounts[section][id] || 0) + 1;
            });
        });

        // Obtener IDs únicos
        const uniqueIds = new Set([
            ...Object.keys(cardCounts.main),
            ...Object.keys(cardCounts.extra),
            ...Object.keys(cardCounts.side)
        ]);

        if (uniqueIds.size === 0) {
            alert('No se encontraron cartas en el archivo');
            return;
        }

        // ── Pantalla de carga ────────────────────────────────────────
        const loadingEl = document.createElement('div');
        loadingEl.id = 'ydk-import-overlay';
        loadingEl.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.82);
            display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;gap:16px;`;
        loadingEl.innerHTML = `
            <div class="power-loading-spinner"></div>
            <p style="color:#f0d060;font-size:1rem;margin:0;">⏳ Importando deck... (${uniqueIds.size} cartas)</p>`;
        document.body.appendChild(loadingEl);

        try {
            const idsArray = Array.from(uniqueIds);
            const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${idsArray.join(',')}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al buscar cartas');
            
            const result = await response.json();
            const cardsData = result.data || [];

            if (!cardsData.length) throw new Error('La API no devolvió cartas');

            // Construir nuevo deck
            const newCards = {};

            cardsData.forEach(card => {
                const id = card.id.toString();
                let location = '';
                let qty = 0;

                if (cardCounts.main[id]) {
                    location = 'main';
                    qty = cardCounts.main[id];
                } else if (cardCounts.extra[id]) {
                    location = 'extra';
                    qty = cardCounts.extra[id];
                } else if (cardCounts.side[id]) {
                    location = 'side';
                    qty = cardCounts.side[id];
                }

                if (qty > 0) {
                    newCards[id] = {
                        data: card,
                        qty: qty,
                        location: location,
                        roles: this.autoAssignRoles(card)
                    };
                }
            });

            this.cards = newCards;
            this.name = filename.replace('.ydk', '');
            this.render();
            this.onDeckLoaded();
            document.getElementById('ydk-import-overlay')?.remove();
            alert(`Deck importado: ${this.name}`);

        } catch (error) {
            document.getElementById('ydk-import-overlay')?.remove();
            console.error('Error al importar deck:', error);
            alert('Error al importar el deck. Verifica que el archivo sea válido.');
        }
    },

    // ===============================
    toggleSection: function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    },

    // ===============================
    renderDeckList: function () {
        if (window.ContentManager && !ContentManager.isVisible('deck-floating-widget')) return '';
        const savedDecks = this.getSavedDecks();
        
        if (savedDecks.length === 0) {
            return '<p class="deck-empty">No hay decks guardados</p>';
        }

        let html = '<div class="deck-list-grid">';

        savedDecks.forEach(deck => {
            // Carta As tiene prioridad sobre la más repetida
            const cartaAsCard = Object.values(deck.cards)
                .find(c => c.roles?.includes('Carta As'));
            const mostRepeatedCard = cartaAsCard || this.getMostRepeatedCard(deck.cards);
            const imgUrl = mostRepeatedCard 
                ? mostRepeatedCard.data
                    ? mostRepeatedCard.data.card_images[0].image_url_small
                    : mostRepeatedCard.card_images[0].image_url_small
                : 'https://images.ygoprodeck.com/images/cards/6983839.jpg';

            const mainCount = Object.values(deck.cards)
                .filter(c => c.location === 'main')
                .reduce((s, c) => s + c.qty, 0);

            const extraCount = Object.values(deck.cards)
                .filter(c => c.location === 'extra')
                .reduce((s, c) => s + c.qty, 0);

            const sideCount = Object.values(deck.cards)
                .filter(c => c.location === 'side')
                .reduce((s, c) => s + c.qty, 0);

            // Calcular Internal Score para tier
            let tierLabel = 'Rogue';
            let tierClass = 'tier-rogue';
            let internalScore = 0;
            
            if (typeof Stats !== 'undefined') {
                const stats = Stats.calculateInternalScore(deck.cards);
                internalScore = parseFloat(stats.internalScore);
                
                if (internalScore >= 20) {
                    tierLabel = 'Tier 1';
                    tierClass = 'tier-1';
                } else if (internalScore >= 12) {
                    tierLabel = 'Tier 2';
                    tierClass = 'tier-2';
                } else if (internalScore >= 6) {
                    tierLabel = 'Tier 3';
                    tierClass = 'tier-3';
                }
            }

            // External Score real si hay powerScoreCache disponible en Estadísticas
            let externalScore = null;
                if (window.Stats && window.Estadisticas?.powerScoreCache) {
                    try {
                        const ext = Stats.calculateExternalScore(
                            deck.cards,
                            Estadisticas.powerScoreCache,
                            Estadisticas.metaDecks || {}
                        );
                        externalScore = ext.externalScore;
                    } catch (_) {}
                }

            html += `
                <div class="deck-list-item">
                    <button class="deck-delete-btn" onclick="Deck.openDeleteDeckPanel('${deck.name}')" title="Eliminar deck">
                        ✖
                    </button>
                    <div class="deck-thumbnail">
                        <img src="${imgUrl}" alt="${deck.name}">
                    </div>
                    <div class="deck-info">
                        <h4 class="deck-item-name">${deck.name}</h4>
                        <p class="deck-counts">
                            <span class="deck-count-main">M: ${mainCount}</span> | 
                            <span class="deck-count-extra">E: ${extraCount}</span> | 
                            <span class="deck-count-side">S: ${sideCount}</span>
                        </p>
                        <div class="deck-scores">
                            <div class="deck-score-row">
                                <span class="deck-score-label">Power Level:</span>
                                <span class="deck-score-value deck-score-internal">${internalScore.toFixed(1)}</span>
                            </div>
                            <div class="deck-score-row">
                                <span class="deck-score-label">Match-up:</span>
                                <span class="deck-score-value deck-score-external">
                                    ${externalScore !== null ? parseFloat(externalScore).toFixed(1) : '—'}
                                </span>
                            </div>
                            ${(() => {
                                if (!window.Winrate) return '';
                                const wr = Winrate.getRecord(deck.name);
                                const total = wr.wins1st + wr.wins2nd + wr.losses1st + wr.losses2nd;
                                if (total === 0) return '';
                                const pct = Winrate.calcWinrate(wr.wins1st + wr.wins2nd, wr.losses1st + wr.losses2nd);
                                const col = pct >= 60 ? '#00b894' : pct >= 45 ? '#fdcb6e' : '#d63031';
                                return `<div class="deck-score-row">
                                    <span class="deck-score-label">Winrate:</span>
                                    <span class="deck-score-value" style="color:${col}">${pct}% <span style="font-size:0.7rem;opacity:0.5">(${total})</span></span>
                                </div>`;
                            })()}
                        </div>
                    </div>
                    <button class="btn btn-primary deck-load-btn" onclick="Deck.openLoadDeckPanel('${deck.name}')">
                        Ver Deck
                    </button>
                </div>
            `;
        });

        html += '</div>';
        return html;
    },

    // ===============================
    renderRows: function (location) {

        const entries = Object.entries(this.cards)
            .filter(([_, c]) => c.location === location)
            .sort((a, b) => this.compareCards(a, b, location));

        if (entries.length === 0) {
            return `<p class="deck-empty">Vacio</p>`;
        }

        let html = '';

        entries.forEach(([id, item]) => {

            const card = item.data;
            const type = card.type.toLowerCase();

            let color = '';
            let nameClass = 'deck-name';
            let qtyColor = '#003366';
            let imgClass = 'deck-img';

            if (location === 'side') {
                color = 'rgba(128, 128, 128, 0.4)';
                nameClass = 'deck-name deck-name-white';
                qtyColor = '#ffffff';
                imgClass = 'deck-img deck-img-desaturated';
            } 
            else {
                if (type.includes('monster')) {
                    if (type.includes('synchro')) {
                        color = '#ffffff';
                    } else if (type.includes('fusion')) {
                        color = '#d8b5d8';
                    } else if (type.includes('xyz')) {
                        color = 'rgba(0, 0, 0, 0.85)';
                        nameClass = 'deck-name deck-name-white';
                        qtyColor = '#ffffff';
                    } else if (type.includes('link')) {
                        color = '#4169e1';
                        nameClass = 'deck-name deck-name-white';
                        qtyColor = '#ffffff';
                    } else if (type.includes('ritual')) {
                        color = '#b3d9ff';
                    } else if (type.includes('pendulum')) {
                        color = 'linear-gradient(to right, #d9b38c, #b7f7c3)';
                    } else {
                        color = '#d9b38c';
                    }
                } else if (type.includes('spell')) {
                    color = '#b7f7c3';
                } else if (type.includes('trap')) {
                    color = '#ffb3d9';
                } else {
                    color = '#d9b38c';
                }
            }

            // Si es degradado, usar background en lugar de background-color
            const backgroundStyle = color.includes('gradient') 
                ? `background: ${color}` 
                : `background: ${color}`;

            // DETECTAR SUBTIPOS AUTOMÁTICOS (Tuner, Gemini, Union, Flip, Toon)
            const subtypes = this.detectSubtypes(card);
            
            // Generar badges de SUBTIPOS (amarillos)
            let subtypesBadges = '';
            subtypes.forEach(subtype => {
                subtypesBadges += `<span class="subtype-badge">${subtype}</span>`;
            });

           // Generar badges de ROLES
            let rolesBadges = '';
            const showRoles = !window.ContentManager || ContentManager.isVisible('deck-roles-badges');
            const dimConfig = window.ConfigManager?.getDiminishingReturns?.();

            if (showRoles && item.roles && item.roles.length > 0) {
                item.roles.forEach(role => {
                    if (role === 'Carta As') {
                        rolesBadges += `<span class="role-badge badge-carta-as">⭐ Carta As</span>`;
                        return;
                    }


                    // Nivel de saturación → clase visual en el badge
                    let satClass = '';
                    if (dimConfig && dimConfig.enabled && location === 'main') {
                        const threshold = dimConfig.roleThresholds?.[role];
                        if (threshold) {
                            const roleCount = Object.values(Deck.cards)
                                .filter(c => c.location === 'main' && (c.roles || []).includes(role))
                                .reduce((sum, c) => sum + c.qty, 0);
                            if (roleCount > threshold.max) {
                                satClass = ' badge-over-saturated';
                            } else if (roleCount > threshold.optimal) {
                                satClass = ' badge-near-saturated';
                            }
                        }
                    }

                    rolesBadges += `<span class="role-badge${satClass}">${role}</span>`;
                });
            }

html += `
    <div class="deck-row" style="${backgroundStyle}">
        <img src="${card.card_images[0].image_url_small}" 
             class="${imgClass}"
             onclick="CardViewer.openFromDeck(${id})">
        <div class="${nameClass}">${card.name}</div>
        <div class="deck-roles">
            ${subtypesBadges}${rolesBadges}
            ${window.Banlist ? Banlist.getBadgeHTML(id) : ''}
        </div>

                    <div class="deck-qty">
                        <button onclick="Deck.changeQty(${id}, -1)">◀</button>
                        <span class="qty-number" style="color: ${qtyColor}">x${item.qty}</span>
                        <button onclick="Deck.changeQty(${id}, 1)">▶</button>
                    </div>

                    <div class="deck-buttons">
                        ${location !== 'extra' ? `
                            <button class="deck-move" onclick="Deck.toggleLocation(${id})">
                                ${item.location === 'main' ? 'Side Deck' : 'Main Deck'}
                            </button>
                        ` : ''}
                        
                        <button class="deck-role-btn" data-section-id="deck-role-btn" onclick="Deck.openRolePanel(${id})">
                            Rol
                        </button>
                    </div>

                </div>
            `;
        });

        return html;
            },


renderDeckStatsBlock: function () {
    const mainCards  = Object.values(this.cards).filter(c => c.location === 'main');
    const extraCards = Object.values(this.cards).filter(c => c.location === 'extra');
    const allCards   = [...mainCards, ...extraCards];

    if (allCards.length === 0) return '';

    // ── Tipos de cartas ──────────────────────────────────────────
    const cardTypes = {};
    allCards.forEach(item => {
        const t = item.data.type || '';
        const qty = item.qty || 1;
        if (t.toLowerCase().includes('spell'))     cardTypes['Hechizo']  = (cardTypes['Hechizo']  || 0) + qty;
        else if (t.toLowerCase().includes('trap')) cardTypes['Trampa']   = (cardTypes['Trampa']   || 0) + qty;
        else                                       cardTypes['Monstruo'] = (cardTypes['Monstruo'] || 0) + qty;
    });

    // ── Atributos ────────────────────────────────────────────────
    const attributes = {};
    allCards.forEach(item => {
        const t = item.data.type || '';
        if (!t.toLowerCase().includes('spell') && !t.toLowerCase().includes('trap')) {
            const attr = item.data.attribute;
            if (attr) attributes[attr] = (attributes[attr] || 0) + (item.qty || 1);
        }
    });

    // ── Raza ─────────────────────────────────────────────────────
    const races = {};
    allCards.forEach(item => {
        const t = item.data.type || '';
        if (!t.toLowerCase().includes('spell') && !t.toLowerCase().includes('trap')) {
            const race = item.data.race;
            if (race) races[race] = (races[race] || 0) + (item.qty || 1);
        }
    });

    // ── Niveles / Rangos / Link ───────────────────────────────────
    const levels = {};
    allCards.forEach(item => {
        const t = (item.data.type || '').toLowerCase();
        if (t.includes('spell') || t.includes('trap')) return;
        const qty = item.qty || 1;
        if (t.includes('link')) {
            const lv = `Link-${item.data.linkval || '?'}`;
            levels[lv] = (levels[lv] || 0) + qty;
        } else if (t.includes('xyz')) {
            const lv = `Rango ${item.data.level || '?'}`;
            levels[lv] = (levels[lv] || 0) + qty;
        } else if (item.data.level) {
            const lv = `Nivel ${item.data.level}`;
            levels[lv] = (levels[lv] || 0) + qty;
        }
    });

    // ── Tipos secundarios ────────────────────────────────────────
    const secondaryTypes = {};
    allCards.forEach(item => {
        const t = (item.data.type || '').toLowerCase();
        if (t.includes('spell') || t.includes('trap')) return;
        const qty = item.qty || 1;
        this.detectSubtypes(item.data).forEach(st => {
            secondaryTypes[st] = (secondaryTypes[st] || 0) + qty;
        });
    });

// ── Tipos de Monstruo (desglose visual) ──────────────────
    const monsterTypeOrder = [
        { key: 'ritual',   label: 'Ritual',         color: '#b3d9ff' },
        { key: 'fusion',   label: 'Fusión',          color: '#d8b5d8' },
        { key: 'synchro',  label: 'Sincronía',       color: '#f0f0f0' },
        { key: 'xyz',      label: 'Xyz',             color: '#9b59b6' },
        { key: 'link',     label: 'Link',            color: '#4169e1' },
        { key: 'pendulum', label: 'Péndulo',         color: '#7bed9f' },
        { key: 'normal',   label: 'Normal',          color: '#f9ca74' },
        { key: 'effect',   label: 'Efecto',          color: '#d9b38c' }
    ];
    const monsterTypeCounts = {};
    allCards.forEach(item => {
        const t = (item.data.type || '').toLowerCase();
        if (t.includes('spell') || t.includes('trap')) return;
        const qty = item.qty || 1;
        let assigned = false;
        for (const mt of monsterTypeOrder) {
            if (mt.key !== 'normal' && mt.key !== 'effect' && t.includes(mt.key)) {
                monsterTypeCounts[mt.key] = (monsterTypeCounts[mt.key] || 0) + qty;
                assigned = true;
                break;
            }
        }
        if (!assigned) {
            const bucket = t.includes('normal monster') ? 'normal' : 'effect';
            monsterTypeCounts[bucket] = (monsterTypeCounts[bucket] || 0) + qty;
        }
    });

    const totalMonsters = Object.values(monsterTypeCounts).reduce((s, v) => s + v, 0);
    const renderMonsterTypeBar = () => {
        if (!totalMonsters) return '';
        const bars = monsterTypeOrder
            .filter(mt => monsterTypeCounts[mt.key] > 0)
            .map(mt => {
                const val = monsterTypeCounts[mt.key];
                const pct = Math.round((val / totalMonsters) * 100);
                return `
            <div class="dsg-bar-item">
                <div class="dsg-bar-label" style="color:${mt.color}">${mt.label}</div>
                <div class="dsg-bar-track">
                    <div class="dsg-bar-fill" style="width:${pct}%;background:${mt.color}"></div>
                </div>
                <div class="dsg-bar-val">${val}</div>
            </div>`;
            }).join('');
        return `<div class="dsg-group"><div class="dsg-group-title">Tipos de Monstruo</div>${bars}</div>`;
    };


    // YGOProDeck devuelve el subtipo en card.race, no en card.type
    const spellTypes = {};
    const spellSubtypeMap = {
        'Quick-Play': 'Juego Rápido', 'Continuous': 'Continuo',
        'Field': 'Campo', 'Equip': 'Equipo', 'Ritual': 'Ritual'
    };
    allCards.forEach(item => {
        const t = item.data.type || '';
        if (!t.toLowerCase().includes('spell')) return;
        const race = item.data.race || '';
        const qty = item.qty || 1;
        let matched = false;
        for (const [key, label] of Object.entries(spellSubtypeMap)) {
            if (race.includes(key)) { spellTypes[label] = (spellTypes[label] || 0) + qty; matched = true; break; }
        }
        if (!matched) spellTypes['Normal'] = (spellTypes['Normal'] || 0) + qty;
    });

    // Ídem: subtipo en card.race
    const trapTypes = {};
    const trapSubtypeMap = { 'Counter': 'Counter', 'Continuous': 'Continua' };
    allCards.forEach(item => {
        const t = item.data.type || '';
        if (!t.toLowerCase().includes('trap')) return;
        const race = item.data.race || '';
        const qty = item.qty || 1;
        let matched = false;
        for (const [key, label] of Object.entries(trapSubtypeMap)) {
            if (race.includes(key)) { trapTypes[label] = (trapTypes[label] || 0) + qty; matched = true; break; }
        }
        if (!matched) trapTypes['Normal'] = (trapTypes['Normal'] || 0) + qty;
    });

    // ── Helpers chips (vista original) ───────────────────────────
    const renderChipRow = (obj, colorFn) => Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `<span class="ds-chip" style="${colorFn ? colorFn(k) : ''}">${k} <strong>(${v})</strong></span>`)
        .join('');

    const attrColors = {
        'FIRE':'background:rgba(255,80,0,0.25);border-color:#ff5000',
        'WATER':'background:rgba(0,120,255,0.25);border-color:#0078ff',
        'EARTH':'background:rgba(140,100,50,0.25);border-color:#8c6432',
        'WIND':'background:rgba(0,200,100,0.25);border-color:#00c864',
        'LIGHT':'background:rgba(255,220,0,0.25);border-color:#ffdc00',
        'DARK':'background:rgba(100,0,180,0.25);border-color:#6400b4',
        'DIVINE':'background:rgba(255,215,0,0.25);border-color:#ffd700'
    };
    const attrColorFn = k => attrColors[k] || '';

    const group = (title, content) => content
        ? `<div class="ds-group"><div class="ds-group-title">${title}</div><div class="ds-chips">${content}</div></div>`
        : '';

    // barColor: string CSS para el color de la barra
    const renderBarGroup = (title, data, barColor, labelColor) => {
        if (!Object.keys(data).length) return '';
        const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const maxVal = sorted[0][1];
        const bars   = sorted.map(([label, val]) => {
            const pct = Math.round((val / maxVal) * 100);
            return `
            <div class="dsg-bar-item">
                <div class="dsg-bar-label" style="color:${labelColor || 'rgba(255,255,255,0.75)'}">${label}</div>
                <div class="dsg-bar-track">
                    <div class="dsg-bar-fill" style="width:${pct}%;background:${barColor}"></div>
                </div>
                <div class="dsg-bar-val">${val}</div>
            </div>`;
        }).join('');

        return `
        <div class="dsg-group">
            <div class="dsg-group-title">${title}</div>
            ${bars}
        </div>`;
    };

    const attrBarColor = (attr) => ({
        'FIRE':  '#ff5000', 'WATER': '#0078ff', 'EARTH': '#8c6432',
        'WIND':  '#00c864', 'LIGHT': '#ffdc00', 'DARK':  '#9b59b6',
        'DIVINE':'#ffd700'
    })[attr] || 'rgba(255,215,0,0.7)';

    // Atributos: barra por atributo con su color propio
    const renderAttrBars = (data) => {
        if (!Object.keys(data).length) return '';
        const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const maxVal = sorted[0][1];
        const bars   = sorted.map(([label, val]) => {
            const pct   = Math.round((val / maxVal) * 100);
            const color = attrBarColor(label);
            return `
            <div class="dsg-bar-item">
                <div class="dsg-bar-label" style="color:${color}">${label}</div>
                <div class="dsg-bar-track">
                    <div class="dsg-bar-fill" style="width:${pct}%;background:${color}"></div>
                </div>
                <div class="dsg-bar-val">${val}</div>
            </div>`;
        }).join('');
        return `<div class="dsg-group"><div class="dsg-group-title">Atributos</div>${bars}</div>`;
    };

    // ── Vista gráfica grupo 1: M / H / T ─────────────────────────
    const typeColors = { 'Monstruo': '#d9b38c', 'Hechizo': '#00b894', 'Trampa': '#ff6b9d' };
    const totalMHT  = Object.values(cardTypes).reduce((s, v) => s + v, 0);
    const mhtBars   = Object.entries(cardTypes)
        .sort((a, b) => b[1] - a[1])
        .map(([label, val]) => {
            const pct = totalMHT > 0 ? Math.round((val / totalMHT) * 100) : 0;
            const col = typeColors[label] || 'rgba(255,215,0,0.6)';
            return `
            <div class="dsg-bar-item dsg-bar-item-lg">
                <div class="dsg-bar-label dsg-bar-label-lg" style="color:${col}">${label}</div>
                <div class="dsg-bar-track dsg-bar-track-lg">
                    <div class="dsg-bar-fill" style="width:${pct}%;background:${col}"></div>
                    <span class="dsg-bar-pct">${pct}%</span>
                </div>
                <div class="dsg-bar-val dsg-bar-val-lg">${val}</div>
            </div>`;
        }).join('');

    const chartGroup1 = `
    <div class="dsg-section">
        <div class="dsg-section-title">Monstruos · Hechizos · Trampas</div>
        <div class="dsg-group dsg-group-mht">${mhtBars}</div>
    </div>`;

    // ── Vista gráfica grupo 2: todo lo demás ─────────────────────
    const chartGroup2 = `
    <div class="dsg-section">
        <div class="dsg-section-title">Desglose detallado</div>
        <div class="dsg-scroll-row">
            ${renderMonsterTypeBar()}
            ${renderAttrBars(attributes)}
            ${renderBarGroup('Tipo de Monstruo', races,         'rgba(108,92,231,0.75)', '#a29bfe')}
            ${renderBarGroup('Niveles / Rangos / Link', levels, 'rgba(0,184,148,0.75)',  '#00b894')}
            ${Object.keys(secondaryTypes).length ? renderBarGroup('Tipos Secundarios', secondaryTypes, 'rgba(253,203,110,0.75)', '#fdcb6e') : ''}
            ${Object.keys(spellTypes).length     ? renderBarGroup('Subtipos Hechizo',  spellTypes,    'rgba(0,200,150,0.65)',   '#00b894') : ''}
            ${Object.keys(trapTypes).length      ? renderBarGroup('Subtipos Trampa',   trapTypes,     'rgba(255,107,157,0.65)', '#ff6b9d') : ''}
        </div>
    </div>`;

    return `
    <div class="deck-stats-block">
        <div class="dstab-tabs">
            <button class="dstab-btn" id="dstab-main"  onclick="Deck.switchDeckStatsTab('main')">
                🃏 Main
            </button>
            <button class="dstab-btn" id="dstab-extra" onclick="Deck.switchDeckStatsTab('extra')">
                ✨ Extra
            </button>
            <button class="dstab-btn" id="dstab-side"  onclick="Deck.switchDeckStatsTab('side')">
                🔄 Side
            </button>
            <button class="dstab-btn" id="dstab-chips" onclick="Deck.switchDeckStatsTab('chips')">
                📋 Composición
            </button>
            <button class="dstab-btn active" id="dstab-chart" onclick="Deck.switchDeckStatsTab('chart')">
                📊 Gráfica
            </button>
        </div>
        <!-- VISTAS DE CARTAS POR ZONA -->
        <div id="dstab-pane-main"  style="display:none;">${this._buildDeckViewPane('main')}</div>
        <div id="dstab-pane-extra" style="display:none;">${this._buildDeckViewPane('extra')}</div>
        <div id="dstab-pane-side"  style="display:none;">${this._buildDeckViewPane('side')}</div>

       <!-- VISTA CHIPS (original) -->
        <div id="dstab-pane-chips" style="display:none;">
            ${totalMonsters > 0 ? `<div class="ds-row">
                ${group('Tipos de Monstruo', monsterTypeOrder
                    .filter(mt => monsterTypeCounts[mt.key] > 0)
                    .map(mt => `<span class="ds-chip" style="border-color:${mt.color}">${mt.label} <strong>(${monsterTypeCounts[mt.key]})</strong></span>`)
                    .join(''))}
            </div>` : ''}
            <div class="ds-row">
                ${group('Tipo de Cartas', renderChipRow(cardTypes, null))}
                ${Object.keys(attributes).length ? group('Atributos', renderChipRow(attributes, attrColorFn)) : ''}
            </div>
            <div class="ds-row">
                ${Object.keys(races).length ? group('Tipo de Monstruo', renderChipRow(races, null)) : ''}
                ${Object.keys(secondaryTypes).length ? group('Tipos Secundarios', renderChipRow(secondaryTypes, null)) : ''}
            </div>
            <div class="ds-row">
                ${Object.keys(levels).length ? group('Niveles / Rangos / Link', renderChipRow(levels, null)) : ''}
            </div>
            <div class="ds-row">
                ${Object.keys(spellTypes).length ? group('Subtipos Hechizo', renderChipRow(spellTypes, null)) : ''}
                ${Object.keys(trapTypes).length  ? group('Subtipos Trampa',  renderChipRow(trapTypes,  null)) : ''}
            </div>
        </div>

        <!-- VISTA GRÁFICA -->
        <div id="dstab-pane-chart">
            ${chartGroup1}
            ${chartGroup2}
        </div>
    </div>`;
},

// ── Cambio de sub-pestaña en deck-stats-block ─────────────────
switchDeckStatsTab: function (tab) {
    const panes = ['main', 'extra', 'side', 'chips', 'chart'];
    panes.forEach(p => {
        const pane = document.getElementById(`dstab-pane-${p}`);
        const btn  = document.getElementById(`dstab-${p}`);
        if (pane) pane.style.display = (p === tab) ? '' : 'none';
        if (btn)  btn.classList.toggle('active', p === tab);
    });
},
switchMiDeckTab: function (tab) {
    const panes = ['mideck-decklist-pane', 'mideck-construccion-pane', 'mideck-optimizacion-pane'];
    panes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById('mideck-' + tab + '-pane');
    if (target) target.style.display = 'block';

    document.querySelectorAll('.mideck-subtab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.mideck-subtab-btn[data-tab="' + tab + '"]');
    if (btn) btn.classList.add('active');

    if (tab === 'construccion' && window.Estadisticas) {
        const cStats = document.getElementById('construccion-deck-stats-sec');
        if (cStats) cStats.innerHTML = Estadisticas.renderDeckStats();
        const cAnalysis = document.getElementById('construccion-deck-analysis-sec');
        if (cAnalysis) cAnalysis.innerHTML = Estadisticas.renderDeckAnalysis();
    }
},
// ===============================
setCartaAs: function (cardId) {
    for (const [id, item] of Object.entries(this.cards)) {
        if (item.roles && item.roles.includes('Carta As')) {
            this.cards[id].roles = item.roles.filter(r => r !== 'Carta As');
        }
    }
    if (cardId && this.cards[cardId]) {
        if (!this.cards[cardId].roles) this.cards[cardId].roles = [];
        this.cards[cardId].roles.push('Carta As');
    }
},

getCartaAs: function () {
    for (const [id, item] of Object.entries(this.cards)) {
        if (item.roles?.includes('Carta As')) return id;
    }
    return null;
},
// Llamar después de cualquier carga de deck.
onDeckLoaded: function () {
    if (window.Estadisticas) {
        Estadisticas.updateDeckStats();
        if (typeof Estadisticas.updateFloatingWidget === 'function') {
            Estadisticas.updateFloatingWidget();
        }
    }
    if (window.Winrate) Winrate.refreshSection();
},
    // ===============================
    render: function () {
        if (!this.container) return;

        const mainC = this.count('main');
        const extraC = this.count('extra');
        const sideC = this.count('side');
        const totalCards = Object.keys(this.cards).length;
        const isEmpty = totalCards === 0;

        let html = ``;

html += `
<div class="mideck-subtabs-nav">
    <button class="mideck-subtab-btn active sim-tab-btn" data-tab="decklist" onclick="Deck.switchMiDeckTab('decklist')">📋 Decklist</button>
    <button class="mideck-subtab-btn sim-tab-btn" data-tab="construccion" onclick="Deck.switchMiDeckTab('construccion')">🔨 Construcción</button>
    <button class="mideck-subtab-btn sim-tab-btn" data-tab="optimizacion" onclick="Deck.switchMiDeckTab('optimizacion')">🎯 Optimización</button>
</div>`;

html += `
<br>
<br>
<br>
<br>
<div id="mideck-decklist-pane">`;

if (isEmpty) {
    html += `<p style="margin-top:10px;font-size:.85rem;opacity:.6">Elige un deck desde el panel lateral o agrega cartas desde el Buscador.</p>`;
} else {
    html += `
    <h2 onclick="Deck.openRenamePanel()" class="deck-title">${this.name}</h2>
    <div class="deck-zone-counts">
        <span class="dzc-chip dzc-main">🃏 Main <strong>${mainC}</strong></span>
        <span class="dzc-chip dzc-extra">✨ Extra <strong>${extraC}</strong></span>
        <span class="dzc-chip dzc-side">🔄 Side <strong>${sideC}</strong></span>
        <button class="dzc-exp-btn" data-section-id="deck-experimentacion" onclick="Deck.tryDeckExperimentacion(Deck.name)" title="Abrir en Experimentación">🧪 Exp.</button>
        <button class="dzc-probar-btn" onclick="Deck.tryDeck()">⚔️ Probar Deck</button>
    </div>
    ${window.Banlist?.isGenesysActive?.() ? Banlist.renderDeckPointsIndicator(this.cards) : ''}
    <h3 onclick="Deck.toggleSection('main-sec')">🃏 Main Deck (${mainC})</h3>
    <div id="main-sec">${this.renderRows('main')}</div>
    <h3 onclick="Deck.toggleSection('extra-sec')">🃏 Extra Deck (${extraC})</h3>
    <div id="extra-sec">${this.renderRows('extra')}</div>
    <h3 onclick="Deck.toggleSection('side-sec')">🃏 Side Deck (${sideC})</h3>
    <div id="side-sec">${this.renderRows('side')}</div>`;
}

html += `
    <h3 onclick="Deck.toggleSection('actions-sec')"></h3>
    <div id="actions-sec" class="deck-actions">
        <button class="deck-move" onclick="Deck.saveDeck()" ${isEmpty ? 'disabled' : ''}>Guardar Deck</button>
        <button class="deck-move" onclick="Deck.clearDeck()" ${isEmpty ? 'disabled' : ''}>Limpiar Deck</button>
        <button class="deck-move" onclick="Deck.exportYDK()" ${isEmpty ? 'disabled' : ''}>Exportar Deck (.ydk)</button>
        <button class="deck-move" onclick="Deck.importYDK()">Importar Deck (.ydk)</button>
        <button class="deck-move" onclick="Deck.exportTXT()" ${isEmpty ? 'disabled' : ''}>Descargar Lista (.txt)</button>
        <button class="deck-move" onclick="Deck.downloadDecklist()" ${isEmpty ? 'disabled' : ''}>📸 Descargar Decklist</button>
    </div>`;

html += `</div>`;

html += `<div id="mideck-construccion-pane" style="display:none;">`;

if (!isEmpty) {
    html += `<div data-section-id="deck-chart">${this.renderDeckStatsBlock()}</div>`;

    html += `
        <h3 class="deck-section-title" onclick="Deck.toggleSection('notes-sec')">📝 Notas del Deck</h3>
        <div id="notes-sec" class="deck-section-content" style="display:none;">
            <textarea class="deck-notes-textarea"
                placeholder="Anota estrategias, combos clave, mulligan ideal, matchups difíciles..."
                oninput="Deck.notes = this.value"
            >${this.notes || ''}</textarea>
            <div class="deck-notes-hint">Las notas se guardan al presionar "Guardar Deck".</div>
        </div>`;

    if (window.Matchups) {
        html += `<div data-section-id="deck-matchups">${Matchups.renderSection()}</div>`;
    }

    html += `
        <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('construccion-deck-stats-sec')">
            📈 Deck Activo - Internal Score
        </h3>
        <div id="construccion-deck-stats-sec" class="stats-section" style="display:none;">
            ${window.Estadisticas ? Estadisticas.renderDeckStats() : ''}
        </div>

        <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('construccion-deck-analysis-sec')">
            📊 Análisis del Deck vs Meta
        </h3>
        <div id="construccion-deck-analysis-sec" class="stats-section">
            ${window.Estadisticas ? Estadisticas.renderDeckAnalysis() : ''}
        </div>`;
} else {
    html += `<p style="opacity:.6;margin-top:10px;">Carga un deck para ver la sección de Construcción.</p>`;
}

html += `</div>`;
html += `<div id="mideck-optimizacion-pane" style="display:none;">${!isEmpty ? this.renderOptimizacionPane() : '<p style="opacity:.6;margin-top:10px;">Carga un deck para usar Optimización.</p>'}</div>`;
this.container.innerHTML = html;
    },

    getOptimizacion: function() {
        try {
            const raw = JSON.parse(localStorage.getItem(`optimization_${this.name}`));
            if (!raw) return { sessions: [] };
            // Migración: formato viejo con records[] → convertir a sesión única
            if (raw.records && !raw.sessions) {
                const migrated = { sessions: [] };
                if (raw.records.length) {
                    // Cada record viejo se convierte en sesión con rondas sintéticas
                    raw.records.forEach(rec => {
                        const rounds = [];
                        const total = rec.partidas || 0;
                        for (let i = 0; i < total; i++) {
                            const isWin = i < (rec.victorias || 0);
                            rounds.push({
                                id: rec.id + i,
                                orden: 'primero',
                                resultado: isWin ? 'victoria' : 'derrota',
                                tipoVictoria: isWin ? 'normal' : null,
                                tipoDerrota: !isWin ? 'normal' : null,
                                presionTiempo: 'holgado',
                                comboCompleto: i < (rec.combosCompletos || 0),
                                brick: i < (rec.brickeadas || 0),
                                starter: (rec.vecesStarter || 0) > i ? 1 : 0,
                                extenders: (rec.vecesExtenders || 0) > i ? 1 : 0,
                                handtraps: (rec.demasiasHandtraps || 0) > i ? 3 : 1,
                                rompioBoard: i < (rec.vecesRompioBoard || 0),
                                negoJugada: i < (rec.vecesNegoJugada || 0),
                                rivalRompio: i < (rec.vecesRivalRompio || 0),
                                notas: ''
                            });
                        }
                        migrated.sessions.unshift({ id: rec.id, date: rec.date, label: rec.label || '', rounds });
                    });
                }
                return migrated;
            }
            return raw;
        } catch(e) { return { sessions: [] }; }
    },

    saveOptimizacionSession: function(session) {
        const data = this.getOptimizacion();
        if (!data.sessions) data.sessions = [];
        data.sessions.unshift(session);
        localStorage.setItem(`optimization_${this.name}`, JSON.stringify(data));
    },

    deleteOptimizacionRecord: function(id) {
        const data = this.getOptimizacion();
        data.sessions = (data.sessions || []).filter(s => s.id !== id);
        localStorage.setItem(`optimization_${this.name}`, JSON.stringify(data));
        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
    },

    deleteOptimizacionRound: function(sessionId, roundId) {
        const data = this.getOptimizacion();
        const sess = (data.sessions || []).find(s => s.id === sessionId);
        if (!sess) return;
        sess.rounds = sess.rounds.filter(r => r.id !== roundId);
        localStorage.setItem(`optimization_${this.name}`, JSON.stringify(data));
        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
    },

    calcOptMetrics: function(session) {
        const rounds = session.rounds || [];
        const p = Math.max(rounds.length, 1);
        const wins        = rounds.filter(r => r.resultado === 'victoria').length;
        const losses      = rounds.filter(r => r.resultado === 'derrota').length;
        const bricks      = rounds.filter(r => (r.bricks || 0) >= 1 || r.brick).length;
        const starters    = rounds.filter(r => (r.starter || 0) >= 1).length;
        const extenders   = rounds.filter(r => (r.extenders || 0) >= 1).length;
        const combos      = rounds.filter(r => r.comboCompleto).length;
        const boardBreaks = rounds.filter(r => r.rompioBoard).length;
        const negates     = rounds.filter(r => r.negoJugada).length;
        const ftks        = rounds.filter(r => r.tipoVictoria === 'ftk').length;
        const rendiciones = rounds.filter(r => r.tipoVictoria === 'rendicion').length;
        const tiempoGan   = rounds.filter(r => r.tipoVictoria === 'tiempo').length;
        const tiempoPer   = rounds.filter(r => r.tipoDerrota  === 'tiempo').length;
        const criticos    = rounds.filter(r => r.presionTiempo === 'critico').length;
        const ajustados   = rounds.filter(r => r.presionTiempo === 'ajustado').length;
        const rFirst      = rounds.filter(r => r.orden === 'primero');
        const rSecond     = rounds.filter(r => r.orden === 'segundo');
        const avgStarter  = rounds.reduce((a, r) => a + (r.starter   || 0), 0) / p;
        const avgExtender = rounds.reduce((a, r) => a + (r.extenders || 0), 0) / p;
        const avgHandtrap = rounds.reduce((a, r) => a + (r.handtraps || 0), 0) / p;
        const htExceso    = rounds.filter(r => (r.handtraps || 0) >= 3).length;

        // ── Distribución de duelos por turno (ganados/perdidos) ──────
        const turnMap = {};
        rounds.forEach(r => {
            const t = r.turnoVictoria || r.turnoDerrota;
            if (!t) return;
            if (!turnMap[t]) turnMap[t] = { wins: 0, losses: 0 };
            if (r.resultado === 'victoria') turnMap[t].wins++; else turnMap[t].losses++;
        });
        const turnDist = Object.keys(turnMap)
            .map(t => ({ turn: parseInt(t), wins: turnMap[t].wins, losses: turnMap[t].losses }))
            .sort((a, b) => a.turn - b.turn);
        const turnTotal = turnDist.reduce((a, td) => a + td.wins + td.losses, 0);

        const wr   = Math.round((wins        / p) * 100);
        const br   = Math.round((bricks      / p) * 100);
        const str  = Math.round((starters    / p) * 100);
        const extr = Math.round((extenders   / p) * 100);
        const cr   = Math.round((combos      / p) * 100);
        const bb   = Math.round((boardBreaks / p) * 100);
        const ctrl = Math.round((negates     / p) * 100);
        const htRate = Math.round((htExceso  / p) * 100);
        const score = Math.min(100, Math.round(
            (wr * 0.35) + ((100 - br) * 0.20) + (str * 0.15) + (cr * 0.15) + (bb * 0.10) + (ctrl * 0.05)
        ));
        return {
            p, wins, losses, wr, br, str, extr, cr, bb, ctrl, htRate, score,
            ftks, rendiciones, tiempoGan, tiempoPer, criticos, ajustados,
            rFirst, rSecond, avgStarter, avgExtender, avgHandtrap,
            turnDist, turnTotal
        };
    },

    getOptDiagnostics: function(m) {
        const w = [];
        if (m.wr   < 40) w.push('⚠ Win rate bajo. Revisa el motor principal del deck.');
        if (m.br   > 20) w.push('⚠ Alto nivel de bricks. Reduce situacionales y añade más starters.');
        if (m.str  < 60) w.push('⚠ Abre starter con poca frecuencia. Añade más cartas que inicien el combo.');
        if (m.str  > 85) w.push('⚠ Exceso de starters. Considera reducir 1-2 para añadir extenders o handtraps.');
        if (m.extr < 30 && m.p >= 5) w.push('⚠ Pocos extenders en mano. El combo se corta fácil ante disrupciones.');
        if (m.cr   < 40) w.push('⚠ El motor completa pocos combos. Revisa los ratios del motor.');
        if (m.bb   < 30) w.push('⚠ Going Second débil. Considera más outs y rompedores de campo.');
        if (m.htRate > 35) w.push('⚠ Exceso de handtraps en mano (3+) frecuente. Reduce 1-2 para mejorar consistencia.');
        if (m.avgHandtrap < 0.5 && m.p >= 5) w.push('⚠ Casi sin handtraps en mano. Considera sumar 3-6 handtraps al main deck.');
        if (m.ftks > 0) w.push(`ℹ ${m.ftks} FTK${m.ftks > 1 ? 's' : ''} registrado${m.ftks > 1 ? 's' : ''}. Vigilar restricciones de banlist.`);
        if (m.tiempoPer > 0) w.push(`⚠ ${m.tiempoPer} derrota${m.tiempoPer > 1 ? 's' : ''} por tiempo. Trabaja la velocidad de tus secuencias.`);
        if (m.criticos > 0) w.push(`⚠ ${m.criticos} ronda${m.criticos > 1 ? 's' : ''} con tiempo crítico. El deck puede ser lento para torneo.`);
        if (m.rSecond.length > 0 && m.bb < 30) w.push('⚠ Juegas de segundo frecuentemente pero el Board Break es bajo. Añade más rompedores.');
        return w;
    },

    addOptimizacionRound: function() {
        if (!Object.keys(this.cards).length) { alert('Carga un deck primero.'); return; }
        const v  = id => document.getElementById(id)?.value ?? '';
        const n  = id => parseInt(document.getElementById(id)?.value) || 0;
        const ck = id => document.getElementById(id)?.checked || false;

        const resultado = v('opt-r-resultado');
        const orden     = v('opt-r-orden');
        if (!resultado) { alert('Selecciona Victoria o Derrota.'); return; }
        if (!orden)     { alert('Selecciona si fuiste Primero o Segundo.'); return; }

        const round = {
            id:            Date.now(),
            orden,
            resultado,
            tipoVictoria:  resultado === 'victoria' ? (v('opt-r-tipo-vic') || 'normal') : null,
            tipoDerrota:   resultado === 'derrota'  ? (v('opt-r-tipo-der') || 'normal') : null,
            presionTiempo: v('opt-r-tiempo') || 'holgado',
            comboCompleto: ck('opt-r-combo'),
            bricks:        n('opt-r-bricks'),
            starter:       n('opt-r-starter'),
            extenders:     n('opt-r-extenders'),
            handtraps:     n('opt-r-handtraps'),rompioBoard:      n('opt-r-board') > 0,
vecesRompioBoard: n('opt-r-board'),
negoJugada:       n('opt-r-negate') > 0,
interrupciones:   n('opt-r-negate'),
turnoVictoria:    resultado === 'victoria' ? (n('opt-r-turnovic') || null) : null,
turnoDerrota:     resultado === 'derrota'  ? (n('opt-r-turnoder') || null) : null,
rivalRompio:      ck('opt-r-rival'),
notas:            v('opt-r-notas').trim()
        };

        const data  = this.getOptimizacion();
        if (!data.sessions) data.sessions = [];
        const label = v('opt-label').trim();

        let sess = this._activeSessionId
            ? data.sessions.find(s => s.id === this._activeSessionId)
            : null;

        if (!sess) {
            sess = { id: Date.now() + 1, date: new Date().toLocaleDateString('es-ES'), label, rounds: [] };
            data.sessions.unshift(sess);
            this._activeSessionId = sess.id;
        } else if (label) {
            sess.label = label;
        }

        sess.rounds.push(round);
        localStorage.setItem(`optimization_${this.name}`, JSON.stringify(data));

        // Reset campos de ronda (conserva label y sesión activa)
        ['opt-r-resultado','opt-r-orden','opt-r-tipo-vic','opt-r-tipo-der','opt-r-notas']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        ['opt-r-combo','opt-r-rival']
        .forEach(id => { const el = document.getElementById(id); if (el) el.checked = false; });
        ['opt-r-starter','opt-r-extenders','opt-r-handtraps','opt-r-bricks','opt-r-board','opt-r-negate']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = '0'; });
        const tvEl = document.getElementById('opt-r-turnovic');
        if (tvEl) tvEl.value = '';
        const tdEl = document.getElementById('opt-r-turnoder');
        if (tdEl) tdEl.value = '';
        const tEl = document.getElementById('opt-r-tiempo');
        if (tEl) tEl.value = 'holgado';
        // Ocultar selects de tipo
        ['opt-row-tipo-vic','opt-row-tipo-der','opt-row-turnovic','opt-row-turnoder'].forEach(id => {
            const el = document.getElementById(id); if (el) el.style.display = 'none';
        });

        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
    },

    cerrarSesionOptimizacion: function() {
        this._activeSessionId = null;
        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
    },

    // Alias por si algo externo sigue llamando addOptimizacionSession
    addOptimizacionSession: function() { this.addOptimizacionRound(); },

        
calcOptTrend: function(curr, prev, higherIsBetter) {
        if (prev === null || prev === undefined) return '';
        const diff = curr - prev;
        if (diff === 0) return '<span class="opt-trend opt-tr-eq">=</span>';
        const good = higherIsBetter ? diff > 0 : diff < 0;
        return `<span class="opt-trend ${good ? 'opt-tr-up' : 'opt-tr-dn'}">${diff > 0 ? '↑' : '↓'}</span>`;
    },

    editOptimizacionRecord: function(id) {
        // Reabrir sesión existente para seguir añadiendo rondas
        const data = this.getOptimizacion();
        const sess = (data.sessions || []).find(s => s.id === id);
        if (!sess) return;
        this._activeSessionId = id;
        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
        const lbl = document.getElementById('opt-label');
        if (lbl) lbl.value = sess.label || '';
        document.getElementById('opt-form-sec')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    _optToggleTipo: function() {
    const res  = document.getElementById('opt-r-resultado')?.value;
    const vic  = document.getElementById('opt-row-tipo-vic');
    const der  = document.getElementById('opt-row-tipo-der');
    const tvic = document.getElementById('opt-row-turnovic');
    const tder = document.getElementById('opt-row-turnoder');
    if (vic)  vic.style.display  = res === 'victoria' ? '' : 'none';
    if (der)  der.style.display  = res === 'derrota'  ? '' : 'none';
    if (tvic) tvic.style.display = res === 'victoria' ? '' : 'none';
    if (tder) tder.style.display = res === 'derrota'  ? '' : 'none';
},
    renderOptimizacionPane: function() {
        if (!Object.keys(this.cards).length)
            return `<p style="opacity:.6;margin-top:10px;">Carga un deck para usar Optimización.</p>`;

        const data     = this.getOptimizacion();
        const sessions = data.sessions || [];
        const activeSess = this._activeSessionId
            ? sessions.find(s => s.id === this._activeSessionId) : null;
        const activeRounds = activeSess ? activeSess.rounds.length : 0;
        const isActive = !!activeSess;

        const badge = (v, ranges) => { for (const [mn,mx,lbl,cls] of ranges) if (v>=mn && v<mx) return [lbl,cls]; return ['—','']; };
        const winB  = v => badge(v,[[65,101,'💎 Competitivo','opt-c-green'],[55,65,'✅ Sólido','opt-c-blue'],[40,55,'⚠ Inestable','opt-c-yellow'],[0,40,'❌ Débil','opt-c-red']]);
        const brkB  = v => badge(v,[[0,10,'💎 Excelente','opt-c-green'],[10,15,'✅ Aceptable','opt-c-blue'],[15,25,'⚠ Inestable','opt-c-yellow'],[25,101,'❌ Inconsistencia','opt-c-red']]);
        const strB  = v => v>=70&&v<=85?['✅ Ideal','opt-c-green']:v<60?['❌ Faltan starters','opt-c-red']:v<70?['⚠ Bajo el ideal','opt-c-yellow']:['⚠ Exceso','opt-c-yellow'];
        const cmbB  = v => badge(v,[[60,101,'💎 Consistente','opt-c-green'],[40,60,'✅ Aceptable','opt-c-blue'],[0,40,'❌ Motor inconsistente','opt-c-red']]);
        const scrB  = v => badge(v,[[80,101,'💎 Competitivo','opt-c-green'],[65,80,'✅ Optimizado','opt-c-blue'],[50,65,'⚠ Funcional','opt-c-yellow'],[0,50,'❌ Desbalanceado','opt-c-red']]);

        // ── BARRA DE SESIÓN ACTIVA ────────────────────────────────────────
        let html = `<div class="opt-session-bar ${isActive ? 'opt-session-active' : ''}">`;
        if (isActive) {
            html += `<span class="opt-sess-indicator">🟢 Sesión activa · <b>${activeRounds}</b> ronda${activeRounds !== 1 ? 's' : ''}</span>
                     <input type="text" id="opt-label" class="opt-input opt-label-inline" placeholder="Etiqueta de sesión..." maxlength="50" value="${(activeSess.label || '').replace(/"/g,'&quot;')}">
                     <button class="opt-close-sess-btn" onclick="Deck.cerrarSesionOptimizacion()">✅ Cerrar Sesión</button>`;
        } else {
            html += `<span class="opt-sess-indicator">⚪ Sin sesión activa</span>
                     <input type="text" id="opt-label" class="opt-input opt-label-inline" placeholder="Etiqueta (torneo, casual…)" maxlength="50">
                     <small class="opt-sess-hint">La sesión se abre al registrar la primera ronda</small>`;
        }
        html += `</div>`;

        // ── FORMULARIO DE RONDA ───────────────────────────────────────────
        html += `
        <h3 class="deck-section-title" onclick="Deck.toggleSection('opt-form-sec')">
            ➕ Nueva Ronda de Duelo${isActive ? ` <span class="opt-round-count">#${activeRounds + 1}</span>` : ''}
            </h3>
        <div id="opt-form-sec" class="deck-section-content" style="display:block;">
            <div class="opt-record opt-form-card">
            <div class="opt-form-grid">

                <div class="opt-group-hdr opt-full">⚔ Resultado</div>

                <div class="opt-form-row">
                    <label class="opt-lbl">¿Resultado?</label>
                    <select id="opt-r-resultado" class="opt-input" onchange="Deck._optToggleTipo()">
                        <option value="">— seleccionar —</option>
                        <option value="victoria">✅ Victoria</option>
                        <option value="derrota">❌ Derrota</option>
                    </select>
                </div>

                <div class="opt-form-row">
                    <label class="opt-lbl">¿Orden?</label>
                    <select id="opt-r-orden" class="opt-input">
                        <option value="">— seleccionar —</option>
                        <option value="primero">🥇 Voy Primero</option>
                        <option value="segundo">🥈 Voy Segundo</option>
                    </select>
                </div>

                <div class="opt-form-row" id="opt-row-tipo-vic" style="display:none;">
                    <label class="opt-lbl">Tipo de victoria</label>
                    <select id="opt-r-tipo-vic" class="opt-input">
                        <option value="normal">Normal</option>
                        <option value="ftk">⚡ FTK (Turno 1)</option>
                        <option value="rendicion">🏳 Rendición rival</option>
                        <option value="tiempo">⏰ Victoria por tiempo</option>
                    </select>
                </div>
                <div class="opt-form-row" id="opt-row-turnovic" style="display:none;">
                    <label class="opt-lbl">🏁 Turno en que gané</label>
                    <input type="number" id="opt-r-turnovic" class="opt-input" min="1" max="20" placeholder="Ej: 3">
                </div>
                <div class="opt-form-row" id="opt-row-tipo-der" style="display:none;">
                    <label class="opt-lbl">Tipo de derrota</label>
                  <select id="opt-r-tipo-der" class="opt-input">
                    <option value="normal">Normal</option>
                    <option value="ftk">🔱 FTK del rival</option>
                    <option value="rendicion">🏳 Me rendí</option>
                    <option value="tiempo">⏰ Derrota por tiempo</option>
                </select>
                </div>
                <div class="opt-form-row" id="opt-row-turnoder" style="display:none;">
                    <label class="opt-lbl">💀 Turno en que perdí</label>
                    <input type="number" id="opt-r-turnoder" class="opt-input" min="1" max="20" placeholder="Ej: 4">
                </div>

                <div class="opt-form-row opt-full">
                    <label class="opt-lbl">Presión de tiempo</label>
                    
                    <select id="opt-r-tiempo" class="opt-input">
                        <option value="holgado">🟢 Holgado</option>
                        <option value="ajustado">🟡 Ajustado (&lt;60s por turno)</option>
                        <option value="critico">🔴 Crítico (sin tiempo)</option>
                    </select>
                </div>

                <div class="opt-group-hdr opt-full">🃏 Mano Inicial</div>

                <div class="opt-form-row">
                    <label class="opt-lbl">Starters en mano</label>
                    <select id="opt-r-starter" class="opt-input">
                        <option value="0">0</option><option value="1">1</option>
                        <option value="2">2</option><option value="3">3+</option>
                    </select>
                </div>

                <div class="opt-form-row">
                    <label class="opt-lbl">Extenders en mano</label>
                    <select id="opt-r-extenders" class="opt-input">
                        <option value="0">0</option><option value="1">1</option>
                        <option value="2">2</option><option value="3">3+</option>
                    </select>
                </div>

                <div class="opt-form-row">
                    <label class="opt-lbl">Handtraps en mano</label>
                    <select id="opt-r-handtraps" class="opt-input">
                        <option value="0">0</option><option value="1">1</option>
                        <option value="2">2</option><option value="3">3+</option>
                    </select>
                </div>

                <div class="opt-form-row">
                    <label class="opt-lbl">Bricks en mano</label>
                    <select id="opt-r-bricks" class="opt-input">
                        <option value="0">0</option><option value="1">1</option>
                        <option value="2">2</option><option value="3">3+</option>
                    </select>
                </div>

                <div class="opt-group-hdr opt-full">⚙ Desarrollo</div>

                <div class="opt-form-row">
                    <label class="opt-lbl opt-cb-lbl"><input type="checkbox" id="opt-r-combo"> Combo completo</label>
                </div>
                <div class="opt-form-row">
                    <label class="opt-lbl">⚔️ Veces que rompí campo</label>
                    <input type="number" id="opt-r-board" class="opt-input" min="0" max="15" value="0">
                </div>
                <div class="opt-form-row">
                    <label class="opt-lbl">🛡️ Interrupciones exitosas</label>
                    <input type="number" id="opt-r-negate" class="opt-input" min="0" max="20" value="0">
                </div>
                <div class="opt-form-row">
                    <label class="opt-lbl opt-cb-lbl"><input type="checkbox" id="opt-r-rival"> El rival rompió mi campo</label>
                </div>

                <div class="opt-form-row opt-full">
                    <label class="opt-lbl">Notas rápidas (opcional)</label>
                    <input type="text" id="opt-r-notas" class="opt-input" placeholder="Ej: brick en extender, rival jugó Ash..." maxlength="120">
                </div>

            </div>
            <button class="opt-submit-btn" onclick="Deck.addOptimizacionRound()">➕ Registrar Ronda de Duelo</button>
            </div>
        </div>`;

        // ── HISTORIAL DE SESIONES ─────────────────────────────────────────
        if (sessions.length > 0) {
            html += `<h3 class="deck-section-title" style="margin-top:14px;" onclick="Deck.toggleSection('opt-hist-sec')">
                📊 Historial de Sesiones <span style="font-size:.72em;opacity:.6">(${sessions.length})</span>
            </h3><div id="opt-hist-sec" class="deck-section-content">`;

            const cartaAsCard = Object.values(this.cards).find(c => c.roles?.includes('Carta As'));
            const coverCard   = cartaAsCard || this.getMostRepeatedCard(this.cards);
            const coverImg    = coverCard
                ? (coverCard.data ? coverCard.data.card_images[0].image_url_small : coverCard.card_images[0].image_url_small)
                : 'https://images.ygoprodeck.com/images/cards/6983839.jpg';

            sessions.forEach((sess, si) => {
                const m    = this.calcOptMetrics(sess);
                const prev = sessions[si + 1] ? this.calcOptMetrics(sessions[si + 1]) : null;
                const tr   = (curr, prv, higher) => this.calcOptTrend(curr, prv ?? null, higher);
                const diag = this.getOptDiagnostics(m);
                const [sLbl,sCls]  = scrB(m.score);
                const [wLbl,wCls]  = winB(m.wr);
                const [bLbl,bCls]  = brkB(m.br);
                const [stLbl,stCls]= strB(m.str);
                const [cLbl,cCls]  = cmbB(m.cr);
                const isThisActive = sess.id === this._activeSessionId;

                const wrFirst  = m.rFirst.length
                    ? Math.round(m.rFirst.filter(r=>r.resultado==='victoria').length / m.rFirst.length * 100) : null;
                const wrSecond = m.rSecond.length
                    ? Math.round(m.rSecond.filter(r=>r.resultado==='victoria').length / m.rSecond.length * 100) : null;
                const lrFirst  = wrFirst  !== null ? 100 - wrFirst  : null;
                const lrSecond = wrSecond !== null ? 100 - wrSecond : null;
                html += `
                <div class="opt-record${isThisActive ? ' opt-record-active' : ''}">
                    <div class="opt-record-hdr">
                        <span class="opt-rec-date">
                            ${sess.date}${sess.label ? ` — ${sess.label}` : ''}
                            <span class="opt-rounds-pill">${m.p} rondas</span>
                            ${isThisActive ? '<span class="opt-active-pill">🟢 activa</span>' : ''}
                            <span class="opt-rec-deck-id">
                                <img src="${coverImg}" alt="${this.name}" class="opt-rec-deck-img">
                                ${this.name}
                            </span>
                        </span>
                        <span class="opt-score-main ${sCls}">${m.score} pts ${tr(m.score, prev?.score, true)} · ${sLbl}</span>
                        <span class="opt-session-actions">
                            <button class="opt-dl-btn" onclick="Deck.exportYDK()" title="Descargar Deck">⬇️</button>
                            <button class="opt-edit-btn" onclick="Deck.editOptimizacionRecord(${sess.id})" title="Reabrir sesión">🔁</button>
                            <button class="opt-del-btn" onclick="Deck.deleteOptimizacionRecord(${sess.id})" title="Eliminar sesión">🗑</button>
                        </span> </div>

                    <div class="opt-metrics-grid">
                        <div class="opt-metric"><div class="opt-m-name">Win Rate</div><div class="opt-m-val">${m.wr}% ${tr(m.wr, prev?.wr, true)}</div><div class="opt-m-badge ${wCls}">${wLbl}</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Brick Rate</div><div class="opt-m-val">${m.br}% ${tr(m.br, prev?.br, false)}</div><div class="opt-m-badge ${bCls}">${bLbl}</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Starter Rate</div><div class="opt-m-val">${m.str}% ${tr(m.str, prev?.str, true)}</div><div class="opt-m-badge ${stCls}">${stLbl}</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Combo Rate</div><div class="opt-m-val">${m.cr}% ${tr(m.cr, prev?.cr, true)}</div><div class="opt-m-badge ${cCls}">${cLbl}</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Board Break</div><div class="opt-m-val">${m.bb}% ${tr(m.bb, prev?.bb, true)}</div><div class="opt-m-badge opt-c-neutral">Going 2nd</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Control Rate</div><div class="opt-m-val">${m.ctrl}% ${tr(m.ctrl, prev?.ctrl, true)}</div><div class="opt-m-badge opt-c-neutral">Going 1st</div></div>
                    </div>

                    <div class="opt-order-split">
                        ${wrFirst  !== null ? `<span class="opt-order-chip opt-order-first">🥇 Primero (${m.rFirst.length}): ${wrFirst}% WR · ${lrFirst}% LR (${m.rFirst.filter(r=>r.resultado==='victoria').length}V/${m.rFirst.filter(r=>r.resultado==='derrota').length}D)</span>` : ''}
                        ${wrSecond !== null ? `<span class="opt-order-chip opt-order-second">🥈 Segundo (${m.rSecond.length}): ${wrSecond}% WR · ${lrSecond}% LR (${m.rSecond.filter(r=>r.resultado==='victoria').length}V/${m.rSecond.filter(r=>r.resultado==='derrota').length}D)</span>` : ''}
                    </div>

                    <div class="opt-turn-dist-block">
                        <div class="opt-turn-dist-title">⏱ Distribución de Duelos por Turno</div>
                        ${m.turnTotal > 0 ? `
                        <div class="opt-turn-dist-bar">
                            ${m.turnDist.map(td => {
                                const segTotal = td.wins + td.losses;
                                const winPct   = Math.round((td.wins / segTotal) * 100);
                                const lossPct  = 100 - winPct;
                                return `<div class="opt-turn-dist-seg" style="flex-grow:${segTotal};" title="Turno ${td.turn}: ${td.wins}V / ${td.losses}D">
                                            ${td.wins   ? `<div class="opt-turn-seg-win" style="width:${winPct}%"></div>`   : ''}
                                            ${td.losses ? `<div class="opt-turn-seg-loss" style="width:${lossPct}%"></div>` : ''}
                                        </div>`;
                            }).join('')}
                        </div>
                        <div class="opt-turn-dist-labels">
                            ${m.turnDist.map(td => `<span class="opt-turn-dist-lbl" style="flex-grow:${td.wins + td.losses};">T${td.turn}</span>`).join('')}
                        </div>
                        <div class="opt-turn-dist-legend">
                            <span><i class="opt-turn-dot opt-turn-dot-win"></i> Victoria</span>
                            <span><i class="opt-turn-dot opt-turn-dot-loss"></i> Derrota</span>
                            <span class="opt-turn-dist-count">${m.turnTotal} de ${m.p} rondas con turno registrado</span>
                        </div>` : `
                        <p class="opt-turn-dist-empty">Aún no hay rondas con turno registrado. Usa "🏁 Turno en que gané" / "💀 Turno en que perdí" al registrar.</p>`}
                    </div>

                    <div class="opt-raw-chips">
                        <span>🃏 ${m.p} rondas · ✅ ${m.wins}V / ❌ ${m.losses}D</span>
                        <span>🧱 ${sess.rounds.filter(r=>(r.bricks||0)>=1 || r.brick).length} bricks</span>
                        <span>⚡ ø${m.avgStarter.toFixed(1)} starters</span>
                        <span>🔗 ø${m.avgExtender.toFixed(1)} extenders</span>
                        <span>🖐 ø${m.avgHandtrap.toFixed(1)} HT</span>
                        ${m.ftks       ? `<span>⚡ ${m.ftks} FTK${m.ftks>1?'s':''}</span>` : ''}
                        ${m.rendiciones? `<span>🏳 ${m.rendiciones} rendición${m.rendiciones>1?'es':''}</span>` : ''}
                        ${m.tiempoGan  ? `<span>⏰ ${m.tiempoGan} ganada${m.tiempoGan>1?'s':''} x tiempo</span>` : ''}
                        ${m.tiempoPer  ? `<span>⏰ ${m.tiempoPer} perdida${m.tiempoPer>1?'s':''} x tiempo</span>` : ''}
                        ${m.criticos   ? `<span>🔴 ${m.criticos} crítico${m.criticos>1?'s':''}</span>` : ''}
                        ${m.ajustados  ? `<span>🟡 ${m.ajustados} ajustado${m.ajustados>1?'s':''}</span>` : ''}
                    </div>

                    ${diag.length ? `<div class="opt-diagnostics">${diag.map(d=>`<div class="opt-diag-item">${d}</div>`).join('')}</div>` : ''}

                    <details class="opt-rounds-detail">
                        <summary class="opt-rounds-summary">Ver rondas individuales (${sess.rounds.length})</summary>
                        <div class="opt-rounds-table">
                            ${sess.rounds.map((r, ri) => {
                                const orden  = r.orden === 'primero' ? '🥇' : '🥈';
                                const res    = r.resultado === 'victoria' ? '✅' : '❌';
                                const tipoV  = r.tipoVictoria === 'ftk' ? ' FTK' : r.tipoVictoria === 'rendicion' ? ' Rend.' : r.tipoVictoria === 'tiempo' ? ' Tpo.' : '';
                                const tipoD  = r.tipoDerrota === 'ftk' ? ' FTK' : r.tipoDerrota === 'rendicion' ? ' Rend.' : r.tipoDerrota === 'tiempo' ? ' Tpo.' : '';
                                const tiempo = r.presionTiempo === 'critico' ? '🔴' : r.presionTiempo === 'ajustado' ? '🟡' : '🟢';
                                return `<div class="opt-round-row">
                                    <span class="opt-rn">#${ri+1}</span>
                                    <span>${orden}</span>
                                    <span>${res}${tipoV}${tipoD}</span>
                                    <span title="Tiempo">${tiempo}</span>
                                    <span title="Starters">⚡${r.starter||0}</span>
                                    <span title="Extenders">🔗${r.extenders||0}</span>
                                    <span title="Handtraps">🖐${r.handtraps||0}</span>
                                    ${(r.bricks || r.brick) ? `<span class="opt-tag-brick" title="Bricks en mano">🧱${r.bricks || 1}</span>` : ''} : ''}
                                    ${r.comboCompleto? '<span class="opt-tag-combo" title="Combo">💥</span>' : ''}
                                    ${r.rompioBoard  ? `<span title="Campos rotos">⚔️${r.vecesRompioBoard ?? 1}</span>` : ''}
                                    ${r.negoJugada   ? `<span title="Interrupciones">🛡${r.interrupciones ?? 1}</span>` : ''}
                                    ${r.turnoVictoria? `<span title="Ganó en turno ${r.turnoVictoria}">🏁T${r.turnoVictoria}</span>` : ''}
                                    ${r.turnoDerrota ? `<span title="Perdió en turno ${r.turnoDerrota}">💀T${r.turnoDerrota}</span>` : ''}
                                    ${r.notas        ? `<span class="opt-round-nota" title="${r.notas.replace(/"/g,'&quot;')}">📝</span>` : ''}
                                    <button class="opt-round-del" onclick="Deck.deleteOptimizacionRound(${sess.id},${r.id})" title="Eliminar ronda">×</button>
                                </div>`;
                            }).join('')}
                        </div>
                    </details>
                </div>`;
            });
            html += `</div>`;
        } else {
            html += `<p class="opt-empty-msg">Registra rondas para comenzar a analizar tu deck.</p>`;
        }
        return html;
    },
    downloadDecklist: async function() {
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'decklist-loading';
        loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;min-width:260px;';
        const setMsg = t => loadingMsg.innerHTML = `<p style="text-align:center;padding:20px;background:#333;color:white;border-radius:8px;">${t}</p>`;
        setMsg('⏳ Cargando imágenes...');
        document.body.appendChild(loadingMsg);

        try {
            const mainCards  = Object.values(this.cards).filter(c => c.location === 'main');
            const extraCards = Object.values(this.cards).filter(c => c.location === 'extra');
            const sideCards  = Object.values(this.cards).filter(c => c.location === 'side');

            // ── Parámetros de layout ──
            const SCALE      = 2;          // resolución x2
            const PAD        = 30 * SCALE;
            const CARD_W     = 75 * SCALE;
            const CARD_H     = 110 * SCALE;
            const GAP_X      = 10 * SCALE;
            const GAP_Y      = 14 * SCALE;
            const COLS       = 10;
            const SECTION_GAP = 40 * SCALE;
            const TITLE_H    = 60 * SCALE;
            const SECTION_H  = 36 * SCALE;
            const NAME_H     = 28 * SCALE;  // altura reservada para nombre bajo la carta
            const BADGE_R    = 13 * SCALE;
            const ROLE_H     = 70 * SCALE;
            const CANVAS_W   = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP_X;

            // ── Cargar todas las imágenes como HTMLImageElement vía blob ──
            const loadImg = (url) => new Promise(resolve => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload  = () => resolve(img);
                img.onerror = () => {
                    // Segundo intento sin crossOrigin (permite dibujar pero tainta el canvas)
                    const img2 = new Image();
                    img2.onload  = () => resolve(img2);
                    img2.onerror = () => resolve(null);
                    img2.src = url + '?t=' + Date.now();
                };
                img.src = url;
            });

            const allItems = [...mainCards, ...extraCards, ...sideCards];
            const urls     = [...new Set(allItems.map(c => c.data?.card_images?.[0]?.image_url_small).filter(Boolean))];
            const total    = urls.length;
            let loaded = 0;
            const imgCache = {};
            await Promise.all(urls.map(async url => {
                imgCache[url] = await loadImg(url);
                loaded++;
                setMsg(`⏳ Cargando imágenes... (${loaded}/${total})`);
            }));
            await new Promise(r => setTimeout(r, 300));

            // ── Calcular roles del main ──
            const rolesCount = {};
            mainCards.forEach(item => {
                (item.roles || []).forEach(r => { rolesCount[r] = (rolesCount[r] || 0) + item.qty; });
            });
            const roleEntries = Object.entries(rolesCount).sort((a, b) => b[1] - a[1]);

            // ── Helper: altura de una sección de cartas ──
            const sectionHeight = (cards) => {
                if (!cards.length) return 0;
                const rows = Math.ceil(cards.length / COLS);
                return SECTION_H + rows * (CARD_H + NAME_H + GAP_Y) + SECTION_GAP;
            };

            // ── Altura total del canvas ──
            let canvasH = PAD + TITLE_H;
            if (mainCards.length)  canvasH += sectionHeight(mainCards);
            if (extraCards.length) canvasH += sectionHeight(extraCards);
            if (sideCards.length)  canvasH += sectionHeight(sideCards);
            if (roleEntries.length) canvasH += SECTION_H + ROLE_H + SECTION_GAP;
            canvasH += PAD;

            setMsg('⏳ Generando imagen...');
            const canvas  = document.createElement('canvas');
            canvas.width  = CANVAS_W;
            canvas.height = canvasH;
            const ctx     = canvas.getContext('2d');

            // Fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let y = PAD;

            // ── Título ──
            ctx.fillStyle = '#222222';
            ctx.font      = `bold ${28 * SCALE}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(this.name, CANVAS_W / 2, y + 40 * SCALE);
            y += TITLE_H;

            // ── Función para dibujar una sección ──
            const drawSection = (cards, label, lineColor) => {
                if (!cards.length) return;

                // Encabezado
                ctx.fillStyle = '#2c3e50';
                ctx.font      = `bold ${18 * SCALE}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText(label, PAD, y + 22 * SCALE);
                ctx.strokeStyle = lineColor;
                ctx.lineWidth   = 3 * SCALE;
                ctx.beginPath();
                ctx.moveTo(PAD, y + 30 * SCALE);
                ctx.lineTo(CANVAS_W - PAD, y + 30 * SCALE);
                ctx.stroke();
                y += SECTION_H;

                // Cartas
                cards.forEach((item, i) => {
                    const col  = i % COLS;
                    const row  = Math.floor(i / COLS);
                    const x    = PAD + col * (CARD_W + GAP_X);
                    const cardY = y + row * (CARD_H + NAME_H + GAP_Y);

                    // Imagen
                    const url = item.data?.card_images?.[0]?.image_url_small;
                    const img = url ? imgCache[url] : null;
                    if (img) {
                        ctx.drawImage(img, x, cardY, CARD_W, CARD_H);
                    } else {
                        // Placeholder gris
                        ctx.fillStyle = '#cccccc';
                        ctx.fillRect(x, cardY, CARD_W, CARD_H);
                        ctx.fillStyle = '#888';
                        ctx.font = `${9 * SCALE}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.fillText('?', x + CARD_W / 2, cardY + CARD_H / 2);
                    }

                    // Badge cantidad
                    const bx = x + CARD_W - BADGE_R + 4 * SCALE;
                    const by = cardY + BADGE_R - 4 * SCALE;
                    ctx.fillStyle = 'rgba(220,0,0,0.92)';
                    ctx.beginPath();
                    ctx.arc(bx, by, BADGE_R, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.font      = `bold ${10 * SCALE}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.fillText(`x${item.qty}`, bx, by + 4 * SCALE);

                    // Nombre
                    const nameY = cardY + CARD_H + 4 * SCALE;
                    ctx.fillStyle = '#222222';
                    ctx.font      = `${8 * SCALE}px Arial`;
                    ctx.textAlign = 'center';
                    // Truncar nombre si es muy largo
                    let name = item.data?.name || '';
                    const maxW = CARD_W - 4;
                    if (ctx.measureText(name).width > maxW) {
                        while (name.length > 1 && ctx.measureText(name + '…').width > maxW) name = name.slice(0, -1);
                        name += '…';
                    }
                    ctx.fillText(name, x + CARD_W / 2, nameY + 10 * SCALE);
                });

                const rows = Math.ceil(cards.length / COLS);
                y += rows * (CARD_H + NAME_H + GAP_Y) + SECTION_GAP;
            };

            drawSection(mainCards,  `MAIN DECK (${mainCards.reduce((s,c)=>s+c.qty,0)})`,  '#3498db');
            drawSection(extraCards, `EXTRA DECK (${extraCards.reduce((s,c)=>s+c.qty,0)})`, '#9b59b6');
            if (sideCards.length)
                drawSection(sideCards, `SIDE DECK (${sideCards.reduce((s,c)=>s+c.qty,0)})`, '#7f8c8d');

            // ── Roles ──
            if (roleEntries.length) {
                ctx.fillStyle = '#2c3e50';
                ctx.font      = `bold ${18 * SCALE}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText('ROLES', PAD, y + 22 * SCALE);
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth   = 3 * SCALE;
                ctx.beginPath();
                ctx.moveTo(PAD, y + 30 * SCALE);
                ctx.lineTo(CANVAS_W - PAD, y + 30 * SCALE);
                ctx.stroke();
                y += SECTION_H + 6 * SCALE;

                const PILL_H   = 22 * SCALE;
                const PILL_PAD = 12 * SCALE;
                const PILL_GAP = 8 * SCALE;
                let rx = PAD;
                let ry = y;

                ctx.font = `bold ${9 * SCALE}px Arial`;
                roleEntries.forEach(([role, count]) => {
                    const label = `${role}: ${count}`;
                    const tw    = ctx.measureText(label).width;
                    const pw    = tw + PILL_PAD * 2;

                    if (rx + pw > CANVAS_W - PAD) { rx = PAD; ry += PILL_H + PILL_GAP; }

                    // Píldora
                    ctx.fillStyle = '#3498db';
                    const radius  = PILL_H / 2;
                    ctx.beginPath();
                    ctx.moveTo(rx + radius, ry);
                    ctx.lineTo(rx + pw - radius, ry);
                    ctx.arcTo(rx + pw, ry, rx + pw, ry + PILL_H, radius);
                    ctx.lineTo(rx + pw, ry + PILL_H - radius);
                    ctx.arcTo(rx + pw, ry + PILL_H, rx + pw - radius, ry + PILL_H, radius);
                    ctx.lineTo(rx + radius, ry + PILL_H);
                    ctx.arcTo(rx, ry + PILL_H, rx, ry + PILL_H - radius, radius);
                    ctx.lineTo(rx, ry + radius);
                    ctx.arcTo(rx, ry, rx + radius, ry, radius);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(label, rx + PILL_PAD, ry + PILL_H / 2 + 3 * SCALE);

                    rx += pw + PILL_GAP;
                });
            }

            // ── Descargar ──
            try {
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a   = document.createElement('a');
                    a.href     = url;
                    a.download = `${this.name.replace(/[^a-z0-9]/gi, '_')}_decklist.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    loadingMsg.remove();
                });
            } catch(e) {
                // Canvas taintado: descargar sin imágenes con placeholder visible
                console.warn('Canvas taintado, descargando sin imágenes:', e);
                Object.keys(imgCache).forEach(k => { imgCache[k] = null; });
                // Re-dibujar con placeholders
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                y = PAD;
                ctx.fillStyle = '#222222';
                ctx.font = `bold ${28 * SCALE}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(this.name, CANVAS_W / 2, y + 40 * SCALE);
                y += TITLE_H;
                drawSection(mainCards,  `MAIN DECK (${mainCards.reduce((s,c)=>s+c.qty,0)})`,  '#3498db');
                drawSection(extraCards, `EXTRA DECK (${extraCards.reduce((s,c)=>s+c.qty,0)})`, '#9b59b6');
                if (sideCards.length) drawSection(sideCards, `SIDE DECK (${sideCards.reduce((s,c)=>s+c.qty,0)})`, '#7f8c8d');
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a   = document.createElement('a');
                    a.href     = url;
                    a.download = `${this.name.replace(/[^a-z0-9]/gi, '_')}_decklist.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    loadingMsg.remove();
                });
            }

        } catch (error) {
            console.error('=== ERROR DECKLIST ===', error);
            console.error('Tipo:', error.constructor.name);
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            alert('❌ Error: ' + error.message + '\n\nRevisa la consola (F12).');
            loadingMsg.remove();
        }
    },

    generateDecklistHTML: function() {
        const mainCards = Object.entries(this.cards).filter(([_, c]) => c.location === 'main');
        const extraCards = Object.entries(this.cards).filter(([_, c]) => c.location === 'extra');
        const sideCards = Object.entries(this.cards).filter(([_, c]) => c.location === 'side');

        // Contar roles en Main Deck
        const rolesCount = {};
        mainCards.forEach(([_, item]) => {
            if (item.roles && item.roles.length > 0) {
                item.roles.forEach(role => {
                    rolesCount[role] = (rolesCount[role] || 0) + item.qty;
                });
            }
        });

        let html = `
            <div style="font-family: Arial, sans-serif; max-width: 1200px; padding: 20px;">
                <h1 style="text-align: center; margin-bottom: 30px; color: #333;">${this.name}</h1>
        `;

        if (mainCards.length > 0) {
            const mainCount = mainCards.reduce((sum, [_, c]) => sum + c.qty, 0);
            html += `
                <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">
                    MAIN DECK (${mainCount})
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; margin-bottom: 30px;">
            `;
            mainCards.forEach(([_, item]) => {
                html += this.generateCardHTML(item);
            });
            html += '</div>';
        }

        if (extraCards.length > 0) {
            const extraCount = extraCards.reduce((sum, [_, c]) => sum + c.qty, 0);
            html += `
                <h2 style="color: #2c3e50; border-bottom: 3px solid #9b59b6; padding-bottom: 10px;">
                    EXTRA DECK (${extraCount})
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; margin-bottom: 30px;">
            `;
            extraCards.forEach(([_, item]) => {
                html += this.generateCardHTML(item);
            });
            html += '</div>';
        }

        if (sideCards.length > 0) {
            const sideCount = sideCards.reduce((sum, [_, c]) => sum + c.qty, 0);
            html += `
                <h2 style="color: #2c3e50; border-bottom: 3px solid #95a5a6; padding-bottom: 10px;">
                    SIDE DECK (${sideCount})
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; margin-bottom: 30px;">
            `;
            sideCards.forEach(([_, item]) => {
                html += this.generateCardHTML(item);
            });
            html += '</div>';
        }

        if (Object.keys(rolesCount).length > 0) {
            html += `
                <h2 style="color: #2c3e50; border-bottom: 3px solid #e74c3c; padding-bottom: 10px;">
                    ROLES
                </h2>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
            `;
            Object.entries(rolesCount)
                .sort((a, b) => b[1] - a[1])
                .forEach(([role, count]) => {
                    html += `
                        <div style="background: #3498db; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold;">
                            ${role}: ${count}
                        </div>
                    `;
                });
            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    generateCardHTML: function(item) {
        const card = item.data;
        const imgUrl = card.card_images[0].image_url_small;
        
        return `
            <div style="text-align: center; position: relative;">
                <img src="${imgUrl}" crossorigin="anonymous"
                     style="width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                <div style="font-size: 11px; margin-top: 5px; font-weight: bold; color: #333;">
                    ${card.name}
                </div>
                <div style="position: absolute; top: 5px; right: 5px; background: rgba(255, 0, 0, 0.9); 
                            color: white; font-weight: bold; font-size: 18px; padding: 5px 10px; 
                            border-radius: 50%; min-width: 30px; text-align: center;">
                    x${item.qty}
                </div>
            </div>
        `;
    },
    // ── Vista de cartas por zona (solo lectura) ───────────────
_buildDeckViewPane: function (location) {
    const entries = Object.entries(this.cards).filter(([, c]) => c.location === location);
    if (!entries.length) return `<p class="stats-empty">Sin cartas en esta sección.</p>`;

    // Definir grupos según zona
    let groups;
    if (location === 'extra') {
        groups = [
            { label: 'Link',     test: t => t.includes('link') },
            { label: 'Fusión',   test: t => t.includes('fusion') },
            { label: 'Sincronía',test: t => t.includes('synchro') },
            { label: 'Xyz',      test: t => t.includes('xyz') }
        ];
    } else {
        groups = [
            { label: 'Monstruos Normales', test: t => t.includes('normal monster') && !t.includes('pendulum') },
            { label: 'Monstruos de Efecto',test: t => t.includes('monster') && !t.includes('normal monster') && !t.includes('ritual') && !t.includes('pendulum') && !t.includes('fusion') && !t.includes('synchro') && !t.includes('xyz') && !t.includes('link') },
            { label: 'Monstruos Rituales', test: t => t.includes('ritual monster') },
            { label: 'Monstruos Péndulo',  test: t => t.includes('pendulum') },
            { label: 'Mágicas',            test: t => t.includes('spell') },
            { label: 'Trampas',            test: t => t.includes('trap') }
        ];
    }

    let html = '<div class="dv-pane">';

    groups.forEach(group => {
        const cards = entries
            .filter(([, c]) => group.test((c.data?.type || '').toLowerCase()))
            .sort(([, a], [, b]) => (a.data?.name || '').localeCompare(b.data?.name || ''));

        if (!cards.length) return;

        html += `<div class="dv-group-label">${group.label}</div>`;
        html += '<div class="tdp-cards-grid">';
        cards.forEach(([, item]) => {
            const img = item.data?.card_images?.[0]?.image_url_small || '';
            const qty = item.qty || 1;
            html += `
<div class="tdp-card">
    <img src="${img}" alt="${item.data?.name || ''}"
         onerror="this.style.opacity='0.3'">
    <span class="tdp-qty">x${qty}</span>
</div>`;
        });
        html += '</div>';
    });

    html += '</div>';
    return html;
},
};

window.Deck = Deck;
document.addEventListener('DOMContentLoaded', () => Deck.init());



// ── Banlist — estado de banlist por formato; decora filas del deck y advierte cartas limitadas/prohibidas ──

const Banlist = {
    STORAGE_KEY: 'yugioh_banlist_data',
    currentTab:  'TCG',

    STATUS_PRIORITY: { forbidden: 4, limited: 3, 'semi-limited': 2, free: 1 },
    STATUS_LABEL:    { forbidden: 'Baneada', limited: 'Limitada', 'semi-limited': 'Semi-Limitada' },
    STATUS_COLOR:    { forbidden: '#d63031', limited: '#e17055', 'semi-limited': '#fdcb6e' },
    STATUS_TEXT:     { forbidden: '#fff',    limited: '#fff',    'semi-limited': '#000' },
    STATUS_ORDER:    { forbidden: 0, limited: 1, 'semi-limited': 2 },

    // ── Persistencia ─────────────────────────────────────────────
    getData: function () {
    try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (!data.formats.Genesys) {
                data.formats.Genesys = { cards: {}, isCustom: false, isGenesys: true };
                this.saveData(data);
            }
            return data;
        }
    } catch (_) {}
    return {
        activeFormats: ['TCG'],
        formats: {
            TCG:     { cards: {}, lastUpdated: null, isCustom: false },
            OCG:     { cards: {}, lastUpdated: null, isCustom: false },
            Genesys: { cards: {}, isCustom: false, isGenesys: true }
        }
    };
},

    saveData: function (data) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    },

    // ── Formatos activos ─────────────────────────────────────────
    getActiveFormats: function () {
        return this.getData().activeFormats || ['TCG'];
    },

    toggleActiveFormat: function (formatName) {
    const data      = this.getData();
    const isGenesys = !!data.formats[formatName]?.isGenesys;
    const idx       = data.activeFormats.indexOf(formatName);

    if (idx > -1) {
        if (data.activeFormats.length === 1) return;
        data.activeFormats.splice(idx, 1);
    } else {
        if (isGenesys) {
            data.activeFormats = [formatName];
        } else {
            data.activeFormats = data.activeFormats.filter(f => !data.formats[f]?.isGenesys);
            data.activeFormats.push(formatName);
        }
    }
    this.saveData(data);
    this.refreshFormatChips();
},

    // ── Status efectivo ──────────────────────────────────────────
    getEffectiveBanStatus: function (cardId) {
        const data = this.getData();
        const id   = String(cardId);
        let highest = 'free';

        for (const fName of (data.activeFormats || [])) {
            const fmt = data.formats[fName];
            if (!fmt) continue;
            let status;
            if (fmt.inverted) {
                status = fmt.cards[id] ? 'free' : 'forbidden';
            } else {
                status = fmt.cards[id]?.status || 'free';
            }
            if ((this.STATUS_PRIORITY[status] || 1) > (this.STATUS_PRIORITY[highest] || 1)) {
                highest = status;
            }
        }
        return highest;
    },

    // Badge para usar en Mi Deck
    getBadgeHTML: function (cardId) {
    const data         = this.getData();
    const genesysActive = data.activeFormats.some(f => data.formats[f]?.isGenesys);

    if (genesysActive) {
        const pts = this.getCardPoints(cardId);
        if (!pts || pts === 0) return '';
        return `<span class="ban-badge" style="background:#1a1a1a;color:#fff;border:1px solid #555;">${pts} pts</span>`;
    }

    const status = this.getEffectiveBanStatus(cardId);
    if (!status || status === 'free') return '';
    const c = this.STATUS_COLOR[status];
    const t = this.STATUS_TEXT[status];
    const l = this.STATUS_LABEL[status];
    return `<span class="ban-badge" style="background:${c};color:${t};">${l}</span>`;
},

    // ── Operaciones sobre cartas ─────────────────────────────────
    setCardStatus: function (formatName, cardId, cardMeta, status) {
        const data = this.getData();
        if (!data.formats[formatName]) return;
        const id = String(cardId);
        if (status === 'free') {
            delete data.formats[formatName].cards[id];
        } else {
            data.formats[formatName].cards[id] = {
                name:   cardMeta.name || '',
                img:    cardMeta.img  || '',
                status
            };
        }
        this.saveData(data);
    },

    removeCardFromFormat: function (formatName, cardId) {
        const data = this.getData();
        if (!data.formats[formatName]) return;
        delete data.formats[formatName].cards[String(cardId)];
        this.saveData(data);
        const listEl = document.getElementById(`banlist-cards-${formatName}`);
        if (listEl) listEl.innerHTML = this.renderFormatList(formatName);
        const countEl = document.getElementById(`ban-count-${formatName}`);
        if (countEl) countEl.textContent = Object.keys(data.formats[formatName].cards).length + ' cartas';
    },

    // ── Crear / eliminar formato custom ──────────────────────────
    createCustomFormat: function () {
        const name = prompt('Nombre del formato personalizado:');
        if (!name || !name.trim()) return;
        const key  = name.trim();
        const data = this.getData();
        if (data.formats[key]) { alert('Ya existe un formato con ese nombre.'); return; }
        data.formats[key] = { cards: {}, isCustom: true, inverted: false };
        this.saveData(data);
        this.currentTab = key;
        this.renderSection();
    },

    deleteCustomFormat: function (formatName) {
        if (!confirm(`¿Eliminar el formato "${formatName}"?`)) return;
        const data = this.getData();
        delete data.formats[formatName];
        data.activeFormats = data.activeFormats.filter(f => f !== formatName);
        this.saveData(data);
        this.currentTab = 'TCG';
        this.renderSection();
    },

    toggleInverted: function (formatName) {
        const data = this.getData();
        if (!data.formats[formatName]) return;
        data.formats[formatName].inverted = !data.formats[formatName].inverted;
        this.saveData(data);
        const isInv  = data.formats[formatName].inverted;
        const btn    = document.getElementById(`ban-invert-btn-${formatName}`);
        if (btn) btn.textContent = isInv ? '🔄 Lista invertida (activa)' : '🔄 Invertir lista';
        if (btn) btn.style.borderColor = isInv ? '#fdcb6e' : '';
        if (btn) btn.style.color       = isInv ? '#fdcb6e' : '';
    },

    updateOfficialList: async function (format) {
        const btn = document.getElementById(`ban-update-btn-${format}`);
        if (btn) { btn.disabled = true; btn.textContent = '⏳ Actualizando...'; }

        try {
            const apiFormat = format.toLowerCase();
            const res  = await fetch(
                `https://db.ygoprodeck.com/api/v7/cardinfo.php?banlist=${apiFormat}`
            );
            const json = await res.json();
            const cards = json.data || [];

            const data = this.getData();
            if (!data.formats[format]) data.formats[format] = { cards: {}, isCustom: false };
            data.formats[format].cards = {};

            const STATUS_MAP = { 'Banned': 'forbidden', 'Limited': 'limited', 'Semi-Limited': 'semi-limited' };
            const key        = format === 'TCG' ? 'ban_tcg' : 'ban_ocg';

            cards.forEach(card => {
                const rawStatus = card.banlist_info?.[key];
                const status    = STATUS_MAP[rawStatus];
                if (!status) return;
                data.formats[format].cards[String(card.id)] = {
                    name: card.name,
                    img:  card.card_images?.[0]?.image_url_small || '',
                    status
                };
            });

            data.formats[format].lastUpdated = new Date().toLocaleDateString('es-ES');
            this.saveData(data);

            const listEl  = document.getElementById(`banlist-cards-${format}`);
            if (listEl) listEl.innerHTML = this.renderFormatList(format);
            const dateEl  = document.getElementById(`ban-date-${format}`);
            if (dateEl) dateEl.textContent = data.formats[format].lastUpdated;
            const countEl = document.getElementById(`ban-count-${format}`);
            if (countEl) countEl.textContent = Object.keys(data.formats[format].cards).length + ' cartas';

            if (btn) {
                btn.textContent = '✅ Actualizado';
                btn.disabled    = false;
                setTimeout(() => { btn.textContent = '🔄 Actualizar'; }, 2500);
            }
        } catch (_) {
            if (btn) {
                btn.textContent = '❌ Error de red';
                btn.disabled    = false;
                setTimeout(() => { btn.textContent = '🔄 Actualizar'; }, 2500);
            }
        }
    },

    // ── UI Principal ─────────────────────────────────────────────
    renderSection: function () {
        const el = document.getElementById('banlist-section');
        if (!el) return;
        el.innerHTML = this._buildSectionHTML();
    },

    _buildSectionHTML: function () {
        const data    = this.getData();
        const active  = data.activeFormats;
        const allKeys = ['TCG', 'OCG', ...Object.keys(data.formats).filter(k => k !== 'TCG' && k !== 'OCG')];

        const chips = allKeys.map(name => `
            <span class="ban-format-chip ${active.includes(name) ? 'ban-chip-active' : ''}"
                  onclick="Banlist.toggleActiveFormat('${name}')">${name}</span>`
        ).join('');

        const tabs = allKeys.map(name => `
            <button class="ban-tab-btn ${this.currentTab === name ? 'ban-tab-active' : ''}"
                    onclick="Banlist.switchTab('${name}')">${name}</button>`
        ).join('');

        return `
            <div class="ban-active-row">
                <span class="ban-label-text">Formato(s) activo(s):</span>
                <div class="ban-format-chips" id="ban-format-chips">${chips}</div>
            </div>
            <p class="ban-hint">Al elegir más de uno se aplica el baneo más restrictivo de cada carta.</p>
            <div class="ban-tabs">
                ${tabs}
                <button class="ban-tab-btn ban-tab-create"
                        onclick="Banlist.createCustomFormat()">＋ Crear Banlist</button>
            </div>
            <div class="ban-tab-body">
                ${this._buildTabContent(this.currentTab, data)}
            </div>`;
    },

    _buildTabContent: function (formatName, data) {
    const fmt = data?.formats?.[formatName];
    if (!fmt) return '<p class="stats-empty">Formato no encontrado.</p>';

    const isCustom   = fmt.isCustom;
    const isGenesys  = fmt.isGenesys || false;
    const isInverted = fmt.inverted || false;
    const lastUpd    = fmt.lastUpdated || '—';
    const cardCount  = Object.keys(fmt.cards).length;

    const officialBtns = (!isCustom && !isGenesys) ? `
    <button class="btn btn-sm btn-primary" id="ban-update-btn-${formatName}"
            onclick="Banlist.updateOfficialList('${formatName}')">🔄 Actualizar</button>
    <span class="ban-last-update">
        Última actualización: <span id="ban-date-${formatName}">${lastUpd}</span>
    </span>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.copyFormat('${formatName}')">📋 Copiar Banlist</button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.downloadTXT('${formatName}')">⬇️ .txt</button>` : '';

const customBtns = (isCustom && !isGenesys) ? `
    <button class="btn btn-sm btn-secondary"
            id="ban-invert-btn-${formatName}"
            style="${isInverted ? 'color:#fdcb6e;border-color:#fdcb6e;' : ''}"
            onclick="Banlist.toggleInverted('${formatName}')">
        🔄 ${isInverted ? 'Lista invertida (activa)' : 'Invertir lista'}
    </button>
    <button class="btn btn-sm btn-primary"
            onclick="CardViewer.openCardSearch('${formatName}')">＋ Agregar carta</button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.copyFormat('${formatName}')">📋 Copiar Banlist</button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.downloadTXT('${formatName}')">⬇️ .txt</button>
    <button class="btn btn-sm btn-danger"
            onclick="Banlist.deleteCustomFormat('${formatName}')">🗑️ Eliminar</button>` : '';

const genesisBtns = isGenesys ? `
    <button class="btn btn-sm btn-primary"
            onclick="CardViewer.openCardSearch('${formatName}', '', 'points')">
        ＋ Agregar carta
    </button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.copyFormat('${formatName}')">📋 Copiar Banlist</button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.downloadTXT('${formatName}')">⬇️ .txt</button>` : '';

    return `
        <div class="ban-tab-header">
            ${officialBtns}${customBtns}${genesisBtns}
            <span class="ban-card-count" id="ban-count-${formatName}">${cardCount} cartas</span>
        </div>
        <div id="banlist-cards-${formatName}" class="ban-cards-list">
            ${this.renderFormatList(formatName)}
        </div>`;
},
    renderFormatList: function (formatName) {
    const data = this.getData();
    const fmt  = data.formats[formatName];
    if (!fmt) return '';

    const isGenesys = fmt.isGenesys || false;

    const entries = Object.entries(fmt.cards).sort((a, b) => {
        if (isGenesys) return (b[1].points || 0) - (a[1].points || 0);
        return (this.STATUS_ORDER[a[1].status] ?? 9) - (this.STATUS_ORDER[b[1].status] ?? 9)
               || a[1].name.localeCompare(b[1].name);
    });

    if (entries.length === 0) {
        return `<p class="stats-empty">
            ${fmt.isCustom || isGenesys
                ? 'Sin cartas. Usa "Agregar carta" para poblar este formato.'
                : 'Sin datos. Usa "Actualizar" para descargar la lista oficial.'}
        </p>`;
    }

    return entries.map(([id, card]) => {
        const isStaple    = window.ConfigManager?.isStaple?.(id);
        const stapleBadge = isStaple ? '<span class="ban-staple-badge">📌 Staple</span>' : '';

        if (isGenesys) {
            const pts = card.points || 0;
            return `
                <div class="ban-card-row">
                    <img class="ban-card-img"
                         src="${card.img}"
                         onerror="this.style.display='none'" alt="${card.name}">
                    <div class="ban-card-info">
                        <div class="ban-card-name">${card.name} ${stapleBadge}</div>
                        <span class="ban-status-badge"
                              style="background:#1a1a1a;color:#fff;border:1px solid #555;">
                            ${pts} pts
                        </span>
                    </div>
                    <div class="ban-card-actions">
                        <button class="btn btn-sm btn-secondary"
                                onclick="Banlist.openChangeBan('${formatName}','${id}','${card.name.replace(/'/g,"\\'")}')">
                            Cambiar Puntos
                        </button>
                        <button class="btn btn-sm btn-secondary"
                                onclick="Banlist.viewCard('${id}')">Ver</button>
                        <button class="btn btn-sm btn-danger"
                                onclick="Banlist.removeCardFromFormat('${formatName}','${id}')">
                            Sacar
                        </button>
                    </div>
                </div>`;
        }

        const c   = this.STATUS_COLOR[card.status] || '#666';
        const t   = this.STATUS_TEXT[card.status]  || '#fff';
        const lbl = this.STATUS_LABEL[card.status] || card.status;

        return `
            <div class="ban-card-row">
                <img class="ban-card-img"
                     src="${card.img}"
                     onerror="this.style.display='none'" alt="${card.name}">
                <div class="ban-card-info">
                    <div class="ban-card-name">${card.name} ${stapleBadge}</div>
                    <span class="ban-status-badge" style="background:${c};color:${t};">${lbl}</span>
                </div>
                <div class="ban-card-actions">
                    <button class="btn btn-sm btn-secondary"
                            onclick="Banlist.openChangeBan('${formatName}','${id}','${card.name.replace(/'/g,"\\'")}')">
                        Cambiar Ban
                    </button>
                    <button class="btn btn-sm btn-secondary"
                            onclick="Banlist.viewCard('${id}')">Ver</button>
                    <button class="btn btn-sm btn-danger"
                            onclick="Banlist.removeCardFromFormat('${formatName}','${id}')">
                        Sacar
                    </button>
                </div>
            </div>`;
    }).join('');
},
openChangeBan: function (formatName, cardId, cardName) {
    const data      = this.getData();
    const isGenesys = data.formats[formatName]?.isGenesys;
    if (isGenesys) {
        const currentPts = this.getCardPoints(cardId);
        CardViewer.openPointsEditor(formatName, cardId, cardName, currentPts);
    } else {
        if (window.CardViewer) CardViewer.openCardSearch(formatName, cardName);
    }
},
    viewCard: function (cardId) {
        if (window.Estadisticas?.powerScoreCache?.cards) {
            const cached = Estadisticas.powerScoreCache.cards.find(c => String(c.cardId) === String(cardId));
            if (cached?.cardData && window.CardViewer) { CardViewer.open(cached.cardData); return; }
        }
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}`)
            .then(r => r.json())
            .then(d => { if (d.data?.[0] && window.CardViewer) CardViewer.open(d.data[0]); })
            .catch(() => {});
    },

    switchTab: function (name) {
        this.currentTab = name;
        this.renderSection();
    },

    refreshFormatChips: function () {
        const data    = this.getData();
        const active  = data.activeFormats;
        const chips   = document.getElementById('ban-format-chips');
        if (!chips) return;
        const allKeys = ['TCG', 'OCG', ...Object.keys(data.formats).filter(k => k !== 'TCG' && k !== 'OCG')];
        chips.innerHTML = allKeys.map(name =>
            `<span class="ban-format-chip ${active.includes(name) ? 'ban-chip-active' : ''}"
                   onclick="Banlist.toggleActiveFormat('${name}')">${name}</span>`
        ).join('');
    },
    // ── Genesys ──────────────────────────────────────────────────

isGenesysActive: function () {
    const data = this.getData();
    return data.activeFormats.some(f => data.formats[f]?.isGenesys);
},

getGenesysFormatName: function () {
    const data = this.getData();
    return Object.keys(data.formats).find(k => data.formats[k].isGenesys) || 'Genesys';
},

getCardPoints: function (cardId) {
    const data = this.getData();
    const id   = String(cardId);
    for (const fmt of Object.values(data.formats)) {
        if (fmt.isGenesys) return fmt.cards[id]?.points || 0;
    }
    return 0;
},

setCardPoints: function (formatName, cardId, cardMeta, points) {
    const data = this.getData();
    if (!data.formats[formatName]) return;
    const id  = String(cardId);
    const pts = Math.max(0, parseInt(points) || 0);
    if (pts === 0) {
        delete data.formats[formatName].cards[id];
    } else {
        data.formats[formatName].cards[id] = {
            name:   cardMeta.name || '',
            img:    cardMeta.img  || '',
            points: pts
        };
    }
    this.saveData(data);
},

getDeckPoints: function (cards) {
    if (!cards) return 0;
    const data   = this.getData();
    let   genFmt = null;
    for (const fmt of Object.values(data.formats)) {
        if (fmt.isGenesys) { genFmt = fmt; break; }
    }
    if (!genFmt) return 0;
    let total = 0;
    Object.entries(cards).forEach(([id, item]) => {
        if (item.location === 'side') return;
        const pts = genFmt.cards[String(id)]?.points || 0;
        total += pts * (item.qty || 1);
    });
    return total;
},

renderDeckPointsIndicator: function (cards) {
    const total = this.getDeckPoints(cards);
    return `
        <div class="genesys-points-indicator">
            <span class="gpi-label">⚙ Puntos Genesys</span>
            <span class="gpi-value">${total} pts</span>
            <span class="gpi-note">Main + Extra</span>
        </div>`;
},

// ── Copiar formato ────────────────────────────────────────────
copyFormat: function (sourceFormat) {
    const name = prompt(`Nombre para la copia de "${sourceFormat}":`);
    if (!name || !name.trim()) return;
    const key  = name.trim();
    const data = this.getData();
    if (data.formats[key]) { alert('Ya existe un formato con ese nombre.'); return; }

    const src = data.formats[sourceFormat];
    data.formats[key] = {
        cards:     JSON.parse(JSON.stringify(src.cards || {})),
        isCustom:  true,
        isGenesys: src.isGenesys || false,
        inverted:  src.inverted  || false
    };
    this.saveData(data);
    this.currentTab = key;
    this.renderSection();
},

// ── Descargar .txt ────────────────────────────────────────────
downloadTXT: function (formatName) {
    const data = this.getData();
    const fmt  = data.formats[formatName];
    if (!fmt) return;

    const entries = Object.entries(fmt.cards);
    if (!entries.length) { alert('Este formato no tiene cartas.'); return; }

    let txt = '';

    if (fmt.isGenesys) {
        // Orden descendente por puntos, bloques por rango
        const sorted = entries
            .map(([id, c]) => ({ name: c.name, pts: c.points || 0 }))
            .filter(c => c.pts > 0)
            .sort((a, b) => b.pts - a.pts);

        const high = sorted.filter(c => c.pts >= 51);
        const mid  = sorted.filter(c => c.pts >= 34 && c.pts <= 50);
        const low  = sorted.filter(c => c.pts >= 1  && c.pts <= 33);

        const block = (title, list) => list.length
            ? `${title}\n${'─'.repeat(title.length)}\n` +
              list.map(c => `${c.pts.toString().padStart(3)} pts  ${c.name}`).join('\n') + '\n\n'
            : '';

        txt += `GENESYS — ${formatName}\n${'═'.repeat(30)}\n\n`;
        txt += block('ALTO IMPACTO (51+ pts)',  high);
        txt += block('IMPACTO MEDIO (34–50 pts)', mid);
        txt += block('IMPACTO BAJO (1–33 pts)',  low);

    } else {
        // Banlist estándar por grupos
        const byStatus = { forbidden: [], limited: [], 'semi-limited': [] };
        entries.forEach(([_, c]) => {
            if (byStatus[c.status]) byStatus[c.status].push(c.name);
        });
        Object.values(byStatus).forEach(arr => arr.sort());

        const block = (title, list) => list.length
            ? `${title}\n${'─'.repeat(title.length)}\n` +
              list.map(n => `  ${n}`).join('\n') + '\n\n'
            : '';

        txt += `BANLIST — ${formatName}\n${'═'.repeat(30)}\n\n`;
        txt += block('PROHIBIDAS',     byStatus.forbidden);
        txt += block('LIMITADAS',      byStatus.limited);
        txt += block('SEMI-LIMITADAS', byStatus['semi-limited']);
    }

    txt += `Exportado desde Destiny Draw — ${new Date().toLocaleDateString('es-ES')}`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `banlist_${formatName.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
},
};

window.Banlist = Banlist;



// ── Engines — sidebar 4 tabs (Engines/Decks/Staples/Favoritas); gestión de engines guardados; imágenes de staples usan campo imageUrl ──

const Engines = {

    STORAGE_KEY: 'yugioh_engines',
    CARD_BACK:   'https://images.ygoprodeck.com/images/cards/back.jpg',
    _activeTab: 'saved',
    _activeTabBefore: null,

    // Estado del panel de creación
    _creating: {
        name:        '',
        cards:       {},
        roles:       [],
        notes:       '',
        coverCardId: null,
        coverCardImg: null
    },
    _searchTimeout: null,
    _searchResults: [],

    // ═══════════════════════════════════════════════════

    getAll: function () {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
        catch (_) { return []; }
    },

    saveAll: function (engines) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(engines)); }
        catch (_) {}
    },

    // ═══════════════════════════════════════════════════

    init: function () {
    if (document.getElementById('engines-sidebar')) {
        // Si ya existe, actualizar visibilidad según ContentManager
        const sidebar = document.getElementById('engines-sidebar');
        if (sidebar) {
            const visible = !window.ContentManager || ContentManager.isVisible('deck-engines');
            sidebar.style.display = visible ? '' : 'none';
        }
        return;
    }

    // Si ContentManager dice que no es visible, no crear el sidebar
    if (window.ContentManager && !ContentManager.isVisible('deck-engines')) return;

    const deckContainer = document.getElementById('deck-container');
    if (!deckContainer) return;

    // Crear wrapper flex DENTRO de mideck-content, sin tocar su display
    let wrapper = document.getElementById('mideck-flex-wrap');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id        = 'mideck-flex-wrap';
        wrapper.className = 'mideck-flex-wrap';
        deckContainer.parentNode.insertBefore(wrapper, deckContainer);
        wrapper.appendChild(deckContainer);
    }

    const sidebar = document.createElement('div');
    sidebar.id        = 'engines-sidebar';
    sidebar.className = 'engines-sidebar';
    wrapper.appendChild(sidebar);

    this._renderSidebar();
},
    // ═══════════════════════════════════════════════════

    _renderSidebar: function () {
    const sidebar = document.getElementById('engines-sidebar');
    if (!sidebar) return;

    const tab      = this._activeTab;
    const engines  = this.getAll();
    const tabs = [
        { id: 'engines',   label: '⚙️ Engines' },
        { id: 'saved',     label: '📁 Decks'   },
        { id: 'staples',   label: '📌 Staples' },
        { id: 'favoritas', label: '⭐ Favoritas'}
    ];

    // Contenido de cada panel
    const enginesHTML = `
        <div class="eng-sidebar-actions">
            <button class="eng-action-btn eng-btn-primary"
                    onclick="Engines.openCreatePanel()">＋ Añadir Engine</button>
            <button class="eng-action-btn eng-btn-secondary"
                    onclick="Engines.importYDK()">📥 Importar .ydk</button>
        </div>
        <div class="eng-list" id="eng-list">
            ${engines.length
                ? engines.map((e, i) => this._renderEngineItem(e, i)).join('')
                : '<div class="eng-empty">Sin engines guardados</div>'}
        </div>`;

    const savedHTML = `
        <div class="eng-list" id="eng-saved-list">
            ${this._renderSavedDeckItems()}
        </div>`;

    const staplesHTML = `
        <div class="eng-list" id="eng-staples-list">
            ${window.ConfigManager ? this._renderStaplesItems() : '<div class="eng-empty">Módulo no disponible.</div>'}
        </div>`;

    const favoritasHTML = `
        <div class="eng-list" id="eng-favoritas-list">
            ${window.Favoritas ? this._renderFavoritasItems() : '<div class="eng-empty">Módulo no disponible.</div>'}
        </div>`;

    const contentMap = {
        engines:   enginesHTML,
        saved:     savedHTML,
        staples:   staplesHTML,
        favoritas: favoritasHTML
    };

    sidebar.innerHTML = `
        <div class="eng-tabs eng-tabs-4">
            ${tabs.map(t => `
            <button class="eng-tab-btn ${tab === t.id ? 'eng-tab-active' : ''}"
                    onclick="Engines._switchTab('${t.id}')">${t.label}</button>`).join('')}
        </div>
        <div class="eng-panel-content">
            ${contentMap[tab] || ''}
        </div>`;
},

    _switchTab: function (tab) {
        this._activeTab = tab;
        this._renderSidebar();
    },

_renderSavedDeckItems: function () {
        if (!window.Deck) return '<div class="eng-empty">Módulo de decks no disponible.</div>';
        const saved = Deck.getSavedDecks();
        if (!saved.length) return '<div class="eng-empty">Sin decks guardados.</div>';

        return saved.map(deck => {
            const cartaAs = Object.values(deck.cards).find(c => c.roles?.includes('Carta As'));
            const cover   = cartaAs || (window.Deck ? Deck.getMostRepeatedCard(deck.cards) : null);
            const img     = cover
                ? (cover.data?.card_images?.[0]?.image_url_small || cover.card_images?.[0]?.image_url_small || this.CARD_BACK)
                : this.CARD_BACK;

            const mainCount = Object.values(deck.cards)
                .filter(c => c.location === 'main').reduce((s, c) => s + c.qty, 0);
            const extraCount = Object.values(deck.cards)
                .filter(c => c.location === 'extra').reduce((s, c) => s + c.qty, 0);

            // Winrate si está disponible
            let wrHtml = '';
            if (window.Winrate) {
                const wr    = Winrate.getRecord(deck.name);
                const total = wr.wins1st + wr.wins2nd + wr.losses1st + wr.losses2nd;
                if (total > 0) {
                    const pct = Winrate.calcWinrate(wr.wins1st + wr.wins2nd, wr.losses1st + wr.losses2nd);
                    const col = pct >= 60 ? '#00b894' : pct >= 45 ? '#fdcb6e' : '#d63031';
                    wrHtml = `<div class="eng-item-stats" style="color:${col}">WR ${pct}% (${total})</div>`;
                }
            }

            return `
<div class="eng-item">
    <img src="${img}" class="eng-item-img" onerror="this.src='${this.CARD_BACK}'"
         onclick="Deck.openLoadDeckPanel('${deck.name}')">
    <div class="eng-item-info">
        <div class="eng-item-name">${deck.name}</div>
        <div class="eng-item-counts">M:${mainCount} · E:${extraCount}</div>
        ${wrHtml}
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Ver / Cargar"
                onclick="Deck.openLoadDeckPanel('${deck.name}')">📂</button>
        <button class="eng-item-delete" title="Eliminar"
                onclick="Deck.openDeleteDeckPanel('${deck.name}');Engines._renderSidebar()">✖</button>
    </div>
</div>`;
        }).join('');
    },

    _renderEngineItem: function (engine, idx) {
    const img  = engine.coverCardImg || this.CARD_BACK;
    const s    = engine.stats || {};
    const mainCount  = Object.values(engine.cards || {})
        .filter(c => c.location === 'main')
        .reduce((sum, c) => sum + (c.qty || 1), 0);
    const extraCount = Object.values(engine.cards || {})
        .filter(c => c.location === 'extra')
        .reduce((sum, c) => sum + (c.qty || 1), 0);

    const statLine = [
        s.consistency > 0 ? `Cons: <b>+${s.consistency.toFixed(1)}</b>` : '',
        s.power       > 0 ? `Pot: <b>+${s.power.toFixed(1)}</b>`        : '',
        s.resilience  > 0 ? `Res: <b>+${s.resilience.toFixed(1)}</b>`   : ''
    ].filter(Boolean).join(' · ');

    return `
<div class="eng-item" onclick="Engines.clickEngine(${idx})">
    <img src="${img}" class="eng-item-img" onerror="this.src='${this.CARD_BACK}'">
    <div class="eng-item-info">
        <div class="eng-item-name">${engine.name}</div>
        <div class="eng-item-counts">M:${mainCount} · E:${extraCount}</div>
        ${statLine ? `<div class="eng-item-stats">${statLine}</div>` : ''}
        ${engine.roles?.length ? `<div class="eng-item-roles">${engine.roles.map(r =>
            `<span class="eng-role-chip">${r}</span>`).join('')}</div>` : ''}
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Editar"
                onclick="event.stopPropagation(); Engines.openEditPanel(${idx})">✏️</button>
        <button class="eng-item-delete" title="Eliminar"
                onclick="event.stopPropagation(); Engines.deleteEngine(${idx})">✕</button>
    </div>
</div>`;
},

    // ═══════════════════════════════════════════════════

    clickEngine: function (idx) {
        const engines = this.getAll();
        const engine  = engines[idx];
        if (!engine) return;

        if (!window.Deck || Object.keys(Deck.cards).length === 0) {
            alert(`Engine "${engine.name}" seleccionado, pero no hay ningún deck cargado. Carga primero un deck desde Decks Guardados.`);
            return;
        }

        if (!confirm(`¿Agregar el engine "${engine.name}" al deck "${Deck.name}"?\n\nSe respetará el límite de 3 copias por carta.`)) return;

        let added = 0;
        Object.entries(engine.cards || {}).forEach(([id, item]) => {
            const current = Deck.cards[id];
            const currentQty = current ? current.qty : 0;
            const canAdd  = Math.min(item.qty || 1, 3 - currentQty);
            if (canAdd <= 0) return;

            if (current) {
                current.qty += canAdd;
            } else {
                Deck.cards[id] = {
                    data:     item.data,
                    qty:      canAdd,
                    location: item.location,
                    roles:    window.Deck ? Deck.autoAssignRoles(item.data) : []
                };
            }
            added++;
        });

        Deck.render();
        alert(`Engine "${engine.name}" añadido. ${added} cartas actualizadas.`);
    },

    // ═══════════════════════════════════════════════════

    deleteEngine: function (idx) {
        const engines = this.getAll();
        if (!confirm(`¿Eliminar el engine "${engines[idx]?.name}"?`)) return;
        engines.splice(idx, 1);
        this.saveAll(engines);
        this._renderSidebar();
    },

    // ═══════════════════════════════════════════════════

    openCreatePanel: function () {
        this._creating = {
            name: '', cards: {}, roles: [], notes: '',
            coverCardId: null, coverCardImg: null
        };
        this._showCreateModal();
    },

    _showCreateModal: function () {
        document.getElementById('eng-modal')?.remove();

        const roles    = window.ConfigManager ? ConfigManager.getRoleNames() : [];
        const specs    = window.ConfigManager ? ConfigManager.getSpecialties() : [];
        const allTags  = [...new Set([
            ...roles,
            ...specs.map(s => s.mechanicRole).filter(Boolean),
            ...specs.map(s => s.counterRole).filter(Boolean)
        ])].filter(Boolean).sort();

        const overlay = document.createElement('div');
        overlay.id        = 'eng-modal';
        overlay.className = 'eng-modal';
        overlay.onclick   = e => { if (e.target === overlay) this.closeCreatePanel(); };

        overlay.innerHTML = `
<div class="eng-modal-box">
    <div class="eng-modal-header">
        <span>Nuevo Engine</span>
        <button class="eng-modal-close" onclick="Engines.closeCreatePanel()">✕</button>
    </div>

    <!-- Nombre -->
    <label class="eng-label">Nombre del Engine</label>
    <input type="text" id="eng-name-input" class="eng-input"
           placeholder="Ej: Paquete de búsqueda Infernoble..."
           oninput="Engines._creating.name = this.value">

    <!-- Layout principal: buscador + preview -->
    <div class="eng-create-layout">

        <!-- Columna izquierda: buscador + cartas -->
        <div class="eng-create-left">
            <label class="eng-label">Buscar cartas</label>
            <div class="eng-search-row">
                <input type="text" id="eng-search-input" class="eng-input"
                       placeholder="Nombre de la carta..."
                       oninput="Engines._onSearchInput()">
            </div>
            <div id="eng-search-results" class="eng-search-results">
                <div class="eng-search-hint">Escribe para buscar</div>
            </div>

            <!-- Cartas del engine -->
            <div class="eng-cards-header">
                <span class="eng-label">Cartas del Engine</span>
                <span class="eng-counters">
                    Main: <strong id="eng-count-main">0</strong> ·
                    Extra: <strong id="eng-count-extra">0</strong>
                </span>
            </div>
            <div id="eng-cards-grid" class="eng-cards-grid">
                <div class="eng-cards-empty">Sin cartas añadidas</div>
            </div>
        </div>

        <!-- Columna derecha: portada + tags + notas -->
        <div class="eng-create-right">

            <!-- Carta portada -->
            <label class="eng-label">Carta de Portada</label>
            <div class="eng-cover-slot" onclick="Engines.openCoverPicker()">
                <img id="eng-cover-img" src="${this.CARD_BACK}"
                     class="eng-cover-img" alt="Portada">
                <div class="eng-cover-hint">Toca para elegir</div>
            </div>

            <!-- Roles / mecánicas -->
            <label class="eng-label" style="margin-top:12px">Roles / Mecánicas que apoya</label>
            <div class="eng-roles-dropdown-wrap">
                <button class="eng-dropdown-btn"
                        onclick="Engines.toggleRolesDropdown()">
                    Seleccionar roles ▼
                </button>
                <div id="eng-roles-dropdown" class="eng-roles-dropdown" style="display:none">
                    ${allTags.map(tag => `
                    <label class="eng-role-opt">
                        <input type="checkbox" value="${tag}"
                               onchange="Engines._toggleRole('${tag}', this.checked)">
                        ${tag}
                    </label>`).join('')}
                    ${!allTags.length ? '<span class="eng-search-hint">No hay roles definidos en Config</span>' : ''}
                </div>
            </div>
            <div id="eng-selected-roles" class="eng-selected-roles"></div>

            <!-- Notas -->
            <label class="eng-label" style="margin-top:12px">Notas</label>
            <textarea id="eng-notes-input" class="eng-notes"
                      placeholder="Combos, sinergias, cómo usar este engine..."
                      oninput="Engines._creating.notes = this.value"></textarea>
        </div>
    </div>

    <!-- Botones de acción -->
    <div class="eng-modal-footer">
        <button class="eng-action-btn eng-btn-secondary"
                onclick="Engines.downloadCreatingYDK()">⬇️ Descargar .ydk</button>
        <button class="eng-action-btn eng-btn-primary"
                onclick="Engines.saveEngine()">✅ Crear Engine</button>
    </div>
</div>`;

        document.body.appendChild(overlay);
    },

    closeCreatePanel: function () {
        document.getElementById('eng-modal')?.remove();
        document.getElementById('eng-cover-picker')?.remove();
    },

    // ═══════════════════════════════════════════════════

    _onSearchInput: function () {
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => this._doSearch(), 380);
    },

    _doSearch: async function () {
        const q   = document.getElementById('eng-search-input')?.value?.trim();
        const box = document.getElementById('eng-search-results');
        if (!box) return;
        if (!q || q.length < 2) {
            box.innerHTML = '<div class="eng-search-hint">Escribe al menos 2 caracteres</div>';
            return;
        }
        box.innerHTML = '<div class="eng-search-hint">Buscando...</div>';
        try {
            const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}&num=30&offset=0`);
            const data = await res.json();
            if (!data.data?.length) { box.innerHTML = '<div class="eng-search-hint">Sin resultados</div>'; return; }
            this._searchResults = data.data;
            box.innerHTML = data.data.map((card, i) => {
                const img      = card.card_images?.[0]?.image_url_small || this.CARD_BACK;
                const existing = this._creating.cards[String(card.id)]?.qty || 0;
                return `
<div class="eng-sitem">
    <img src="${img}" class="eng-sitem-img" loading="lazy">
    <div class="eng-sitem-name">${card.name}</div>
    <div class="eng-sitem-btns">
        <button class="eng-qty-btn ${existing >= 1 ? 'eng-qty-active' : ''}"
                ${existing >= 3 ? 'disabled' : ''}
                onclick="Engines.addCard(${i}, 1)">x1</button>
        <button class="eng-qty-btn ${existing >= 2 ? 'eng-qty-active' : ''}"
                ${existing >= 2 ? 'disabled' : ''}
                onclick="Engines.addCard(${i}, 2)">x2</button>
        <button class="eng-qty-btn ${existing >= 3 ? 'eng-qty-active' : ''}"
                ${existing >= 1 ? 'disabled' : ''}
                onclick="Engines.addCard(${i}, 3)">x3</button>
    </div>
</div>`;
            }).join('');
        } catch (_) { box.innerHTML = '<div class="eng-search-hint">Error de conexión</div>'; }
    },

    addCard: function (searchIdx, qty) {
        const card = this._searchResults[searchIdx];
        if (!card) return;
        const id       = String(card.id);
        const isExtra  = window.Deck ? Deck.isExtraDeckCard(card) : this._isExtraCard(card);
        const location = isExtra ? 'extra' : 'main';
        const existing = this._creating.cards[id]?.qty || 0;
        const final    = Math.min(3, existing + qty);
        if (final <= existing) return;

        this._creating.cards[id] = {
            data: card,
            qty:  final,
            location
        };
        this._refreshCardsGrid();
        this._doSearch();
    },

    removeCard: function (cardId) {
        const item = this._creating.cards[cardId];
        if (!item) return;
        if (item.qty > 1) item.qty--;
        else delete this._creating.cards[cardId];
        this._refreshCardsGrid();
        this._doSearch();
    },

    _isExtraCard: function (card) {
        const t = (card.type || '').toLowerCase();
        return t.includes('fusion') || t.includes('synchro') || t.includes('xyz') || t.includes('link');
    },

    _refreshCardsGrid: function () {
        const grid = document.getElementById('eng-cards-grid');
        if (!grid) return;

        const entries = Object.entries(this._creating.cards);
        if (!entries.length) {
            grid.innerHTML = '<div class="eng-cards-empty">Sin cartas añadidas</div>';
        } else {
            grid.innerHTML = entries.map(([id, item]) => {
                const img = item.data?.card_images?.[0]?.image_url_small || this.CARD_BACK;
                return `
<div class="eng-card-thumb">
    <img src="${img}" class="eng-card-thumb-img" loading="lazy">
    <div class="eng-card-qty">x${item.qty}</div>
    <button class="eng-card-remove" onclick="Engines.removeCard('${id}')">✕</button>
</div>`;
            }).join('');
        }

        // Actualizar contadores
        const mainCount  = entries.filter(([,c]) => c.location === 'main') .reduce((s,[,c]) => s+c.qty,0);
        const extraCount = entries.filter(([,c]) => c.location === 'extra').reduce((s,[,c]) => s+c.qty,0);
        const mEl = document.getElementById('eng-count-main');
        const eEl = document.getElementById('eng-count-extra');
        if (mEl) mEl.textContent  = mainCount;
        if (eEl) eEl.textContent  = extraCount;
    },

    // ═══════════════════════════════════════════════════

    openCoverPicker: function () {
        document.getElementById('eng-cover-picker')?.remove();

        const entries = Object.entries(this._creating.cards);
        if (!entries.length) { alert('Añade cartas al engine primero.'); return; }

        const picker = document.createElement('div');
        picker.id        = 'eng-cover-picker';
        picker.className = 'eng-cover-picker';
        picker.onclick   = e => { if (e.target === picker) picker.remove(); };

        picker.innerHTML = `
<div class="eng-cover-picker-box">
    <div class="eng-modal-header">
        <span>Elegir Portada</span>
        <button class="eng-modal-close" onclick="document.getElementById('eng-cover-picker').remove()">✕</button>
    </div>
    <div class="eng-cover-picker-grid">
        ${entries.map(([id, item]) => {
            const img = item.data?.card_images?.[0]?.image_url_small || this.CARD_BACK;
            return `
<div class="eng-cover-option" onclick="Engines.setCover('${id}', '${img}')">
    <img src="${img}" class="eng-cover-option-img">
    <div class="eng-cover-option-name">${item.data?.name || id}</div>
</div>`;
        }).join('')}
    </div>
</div>`;

        document.body.appendChild(picker);
    },

    setCover: function (cardId, imgUrl) {
        this._creating.coverCardId  = cardId;
        this._creating.coverCardImg = imgUrl;
        const img = document.getElementById('eng-cover-img');
        if (img) img.src = imgUrl;
        document.getElementById('eng-cover-picker')?.remove();
    },

    // ═══════════════════════════════════════════════════

    toggleRolesDropdown: function () {
        const dd = document.getElementById('eng-roles-dropdown');
        if (dd) dd.style.display = dd.style.display === 'none' ? '' : 'none';
    },

    _toggleRole: function (role, checked) {
        if (checked) {
            if (!this._creating.roles.includes(role)) this._creating.roles.push(role);
        } else {
            this._creating.roles = this._creating.roles.filter(r => r !== role);
        }
        this._refreshSelectedRoles();
    },

    _refreshSelectedRoles: function () {
        const el = document.getElementById('eng-selected-roles');
        if (!el) return;
        el.innerHTML = this._creating.roles.map(r =>
            `<span class="eng-role-chip">${r}</span>`).join('') ||
            '<span class="eng-search-hint">Sin roles seleccionados</span>';
    },

    // ═══════════════════════════════════════════════════

    saveEngine: function () {
        const name = (document.getElementById('eng-name-input')?.value || this._creating.name).trim();
        if (!name) { alert('Escribe un nombre para el engine.'); return; }
        if (!Object.keys(this._creating.cards).length) { alert('Añade al menos una carta.'); return; }

        // Calcular stats con Stats.calculateInternalScore si disponible
        let stats = { consistency: 0, power: 0, resilience: 0 };
        if (window.Stats) {
            // Preparar cards con autoAssignRoles
            const cardsForStats = {};
            Object.entries(this._creating.cards).forEach(([id, item]) => {
                const roles = window.Deck ? Deck.autoAssignRoles(item.data) : [];
                cardsForStats[id] = { ...item, roles };
            });
            const result = Stats.calculateInternalScore(cardsForStats);
            stats = { consistency: result.consistency, power: result.power, resilience: result.resilience };
        }

        const engines = this.getAll();
        engines.push({
            name,
            coverCardId:  this._creating.coverCardId,
            coverCardImg: this._creating.coverCardImg || this.CARD_BACK,
            cards:        this._creating.cards,
            roles:        this._creating.roles,
            notes:        this._creating.notes,
            stats,
            createdAt:    Date.now()
        });

        this.saveAll(engines);
        this.closeCreatePanel();
        this._renderSidebar();
    },

    // ═══════════════════════════════════════════════════

    downloadCreatingYDK: function () {
        this._downloadCardsAsYDK(this._creating.cards,
            (document.getElementById('eng-name-input')?.value || 'engine').trim() || 'engine');
    },

    downloadEngineYDK: function (idx) {
        const engine = this.getAll()[idx];
        if (!engine) return;
        this._downloadCardsAsYDK(engine.cards, engine.name);
    },

    _downloadCardsAsYDK: function (cards, filename) {
        let main = '', extra = '', side = '';
        Object.entries(cards || {}).forEach(([id, item]) => {
            for (let i = 0; i < (item.qty || 1); i++) {
                if (item.location === 'main')  main  += id + '\n';
                if (item.location === 'extra') extra += id + '\n';
                if (item.location === 'side')  side  += id + '\n';
            }
        });
        const content = `#created by Destiny Draw\n#main\n${main}#extra\n${extra}!side\n${side}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = `${filename.replace(/[^a-z0-9]/gi, '_')}.ydk`;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    // ═══════════════════════════════════════════════════

    importYDK: function () {
        const input   = document.createElement('input');
        input.type    = 'file';
        input.accept  = '.ydk';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            await this._parseAndOpenYDK(text, file.name.replace('.ydk', ''));
        };
        input.click();
    },

    _parseAndOpenYDK: async function (content, defaultName) {
        const lines   = content.split('\n').map(l => l.trim()).filter(l => l);
        const cardIds = { main: [], extra: [], side: [] };
        let section   = 'main';

        lines.forEach(line => {
            if (line.startsWith('#main'))  { section = 'main';  return; }
            if (line.startsWith('#extra')) { section = 'extra'; return; }
            if (line.startsWith('!side'))  { section = 'side';  return; }
            if (line.startsWith('#') || line.startsWith('!')) return;
            if (/^\d+$/.test(line)) cardIds[section].push(line);
        });

        const counts = {};
        const locs   = {};
        ['main','extra','side'].forEach(loc => {
            cardIds[loc].forEach(id => {
                counts[id] = Math.min(3, (counts[id] || 0) + 1);
                if (!locs[id]) locs[id] = loc;
            });
        });

        const uniqueIds = Object.keys(counts);
        if (!uniqueIds.length) { alert('No se encontraron cartas en el archivo.'); return; }

        this.openCreatePanel();
        document.getElementById('eng-name-input').value = defaultName;
        this._creating.name = defaultName;

        const loadingEl = document.getElementById('eng-cards-grid');
        if (loadingEl) loadingEl.innerHTML = '<div class="eng-cards-empty">Cargando cartas...</div>';

        try {
            const chunks = [];
            for (let i = 0; i < uniqueIds.length; i += 50) chunks.push(uniqueIds.slice(i, i+50));

            for (const chunk of chunks) {
                const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${chunk.join(',')}`);
                const data = await res.json();
                (data.data || []).forEach(card => {
                    const id  = String(card.id);
                    this._creating.cards[id] = {
                        data:     card,
                        qty:      counts[id] || 1,
                        location: locs[id]  || 'main'
                    };
                });
            }
        } catch (_) { alert('Error al cargar cartas de la API.'); }

        this._refreshCardsGrid();
    },
    openEditPanel: function (idx) {
    const engines = this.getAll();
    const engine  = engines[idx];
    if (!engine) return;

    this._creating = {
        name:         engine.name,
        cards:        JSON.parse(JSON.stringify(engine.cards || {})),
        roles:        [...(engine.roles || [])],
        notes:        engine.notes || '',
        coverCardId:  engine.coverCardId  || null,
        coverCardImg: engine.coverCardImg || null,
        _editIdx:     idx
    };

    this._showCreateModal();

    requestAnimationFrame(() => {
        const nameInput = document.getElementById('eng-name-input');
        if (nameInput) nameInput.value = engine.name;

        const coverImg = document.getElementById('eng-cover-img');
        if (coverImg && engine.coverCardImg) coverImg.src = engine.coverCardImg;

        document.querySelectorAll('#eng-roles-dropdown input[type=checkbox]').forEach(cb => {
            cb.checked = this._creating.roles.includes(cb.value);
        });
        this._refreshSelectedRoles();

        const notesInput = document.getElementById('eng-notes-input');
        if (notesInput) notesInput.value = engine.notes || '';

        this._refreshCardsGrid();

        // Cambiar texto del botón de crear
        const footer = document.querySelector('#eng-modal .eng-modal-footer');
        if (footer) {
            const saveBtn = footer.querySelector('.eng-btn-primary');
            if (saveBtn) {
                saveBtn.textContent = '💾 Guardar Cambios';
                saveBtn.onclick     = () => Engines.saveEditEngine();
            }
        }
    });
},

saveEditEngine: function () {
    const idx = this._creating._editIdx;
    if (idx === undefined || idx === null) { this.saveEngine(); return; }

    const name = (document.getElementById('eng-name-input')?.value || this._creating.name).trim();
    if (!name) { alert('Escribe un nombre para el engine.'); return; }
    if (!Object.keys(this._creating.cards).length) { alert('Añade al menos una carta.'); return; }

    let stats = { consistency: 0, power: 0, resilience: 0 };
    if (window.Stats) {
        const cardsForStats = {};
        Object.entries(this._creating.cards).forEach(([id, item]) => {
            cardsForStats[id] = { ...item, roles: window.Deck ? Deck.autoAssignRoles(item.data) : [] };
        });
        const result = Stats.calculateInternalScore(cardsForStats);
        stats = { consistency: result.consistency, power: result.power, resilience: result.resilience };
    }

    const engines = this.getAll();
    engines[idx] = {
        ...engines[idx],
        name,
        coverCardId:  this._creating.coverCardId,
        coverCardImg: this._creating.coverCardImg || this.CARD_BACK,
        cards:        this._creating.cards,
        roles:        this._creating.roles,
        notes:        this._creating.notes,
        stats
    };

    this.saveAll(engines);
    this.closeCreatePanel();
    this._renderSidebar();
},
_renderStaplesItems: function () {
    const staples = ConfigManager.getStaples();
    const ids     = ConfigManager.getStapleIds();
    if (!ids.length) return '<div class="eng-empty">Sin staples en este formato.</div>';

    ConfigManager._staplePanelCards = ids.map(id => staples[id]);

    const BACK = this.CARD_BACK;
    return ids.map((id, idx) => {
        const s   = staples[id] || {};
        const img = s.imageUrl || `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`;
        const name = s.name || id;
        return `
<div class="eng-item">
    <img src="${img}" class="eng-item-img" onerror="this.src='${BACK}'"
         onclick="ConfigManager.openStapleCard(${idx})">
    <div class="eng-item-info">
        <div class="eng-item-name">${name}</div>
        <div class="eng-item-counts">${s.type || ''}</div>
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Añadir al deck"
                onclick="ConfigManager.addStapleToDeck(${idx})">＋</button>
        <button class="eng-item-delete" title="Quitar staple"
                onclick="ConfigManager.deleteStaple('${id}');Engines._renderSidebar()">✕</button>
    </div>
</div>`;
    }).join('');
},

_renderFavoritasItems: function () {
    const all = Favoritas.getAll();
    const ids = Object.keys(all);
    if (!ids.length) return '<div class="eng-empty">Sin favoritas guardadas.</div>';
    const BACK = this.CARD_BACK;
    return ids.map((id, idx) => {
        const f   = all[id];
        const img = f.img || f.data?.card_images?.[0]?.image_url_small || BACK;
        return `
<div class="eng-item">
    <img src="${img}" class="eng-item-img" onerror="this.src='${BACK}'"
         onclick="Favoritas.viewCard(${idx})">
    <div class="eng-item-info">
        <div class="eng-item-name">${f.name || id}</div>
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Añadir al deck"
                onclick="Favoritas.addCard(${idx})">＋</button>
        <button class="eng-item-delete" title="Quitar favorita"
                onclick="Favoritas.remove('${id}');Engines._renderSidebar()">✕</button>
    </div>
</div>`;
    }).join('');
},
};

window.Engines = Engines;
document.addEventListener('DOMContentLoaded', () => {
});