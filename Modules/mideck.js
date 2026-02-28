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

            this.closeModal();
            this.render();
            this.onDeckLoaded();
        } catch (e) {
            alert('Error al cargar el deck');
        }
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
            alert(`Deck importado: ${this.name}`);

        } catch (error) {
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
    const panes = ['mideck-decklist-pane', 'mideck-construccion-pane'];
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
</div>`;

html += `<div id="mideck-decklist-pane">`;

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

this.container.innerHTML = html;
    },

    
    downloadDecklist: async function() {
        try {
            if (typeof html2canvas === 'undefined') {
                alert('⚠️ La librería html2canvas no está cargada.\n\nPor favor, agrega esta línea a tu index.html antes de los scripts:\n\n<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>');
                return;
            }

            // Mostrar mensaje de carga
            const loadingMsg = document.createElement('div');
            loadingMsg.id = 'decklist-loading';
            loadingMsg.innerHTML = '<p style="text-align:center;padding:20px;background:#333;color:white;border-radius:8px;">⏳ Generando Decklist...</p>';
            loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;';
            document.body.appendChild(loadingMsg);

            // Crear HTML del decklist
            const decklistHTML = this.generateDecklistHTML();
            
            // Crear contenedor temporal
            const tempContainer = document.createElement('div');
            tempContainer.id = 'temp-decklist-container';
            tempContainer.innerHTML = decklistHTML;
            tempContainer.style.cssText = 'position:absolute;left:-9999px;top:0;background:white;padding:20px;';
            document.body.appendChild(tempContainer);

            await new Promise(resolve => setTimeout(resolve, 1000));

            // Convertir a imagen con html2canvas
            const canvas = await html2canvas(tempContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.name.replace(/[^a-z0-9]/gi, '_')}_decklist.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                document.body.removeChild(tempContainer);
                document.body.removeChild(loadingMsg);
            });

        } catch (error) {
            console.error('Error generando decklist:', error);
            alert('❌ Error al generar el decklist. Verifica la consola para más detalles.');
            const loading = document.getElementById('decklist-loading');
            if (loading) loading.remove();
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
                <img src="${imgUrl}" 
                     style="width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
                     crossorigin="anonymous">
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