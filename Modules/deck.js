/* ====================================
   DECK MODULE
   Destiny Draw - Yu-Gi-Oh! App
   GestiÃ³n del Deck del usuario
   ==================================== */

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
    // CLASIFICACIÃ“N EXTRA DECK
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

    // ===============================
    // ORDENAMIENTO DE CARTAS
    // ===============================
    
    // Determinar tipo de carta para ordenamiento Main Deck
    getMainDeckCardType: function(card) {
        if (!card || !card.type) return 999; // Desconocido al final
        
        const type = card.type.toLowerCase();
        
        // Orden: Ritual → Normal → Effect → Pendulum → Spell → Trap
        if (type.includes('ritual monster')) return 0;
        if (type.includes('normal monster')) return 1;
        if (type.includes('effect monster')) return 2;
        if (type.includes('pendulum')) return 3;
        if (type.includes('spell')) return 4;
        if (type.includes('trap')) return 5;
        
        return 999; // Otros al final
    },
    
    // Determinar tipo de carta para ordenamiento Extra Deck
    getExtraDeckCardType: function(card) {
        if (!card || !card.type) return 999; // Desconocido al final
        
        const type = card.type.toLowerCase();
        
        // Orden: Fusion → Synchro → Xyz → Link
        if (type.includes('fusion')) return 0;
        if (type.includes('synchro')) return 1;
        if (type.includes('xyz')) return 2;
        if (type.includes('link')) return 3;
        
        return 999; // Otros al final
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
                return typeA - typeB; // Por tipo primero
            }
            
            // Si son del mismo tipo, ordenar alfabéticamente
            return cardA.name.localeCompare(cardB.name);
            
        } else if (location === 'extra') {
            // Ordenar Extra Deck
            const typeA = this.getExtraDeckCardType(cardA);
            const typeB = this.getExtraDeckCardType(cardB);
            
            if (typeA !== typeB) {
                return typeA - typeB; // Por tipo primero
            }
            
            // Si son del mismo tipo, ordenar alfabéticamente
            return cardA.name.localeCompare(cardB.name);
            
        } else {
            // Side Deck: solo alfabético
            return cardA.name.localeCompare(cardB.name);
        }
    },

    // ===============================
    // DETECCIÓN DE SUBTIPOS AUTOMÁTICOS
    // ===============================
    
    detectSubtypes: function(card) {
        if (!card || !card.type) return [];
        
        const type = card.type.toLowerCase();
        const subtypes = [];
        
        // Detectar subtipos en el tipo de carta
        if (type.includes('tuner')) subtypes.push('Tuner');
        if (type.includes('gemini')) subtypes.push('Gemini');
        if (type.includes('union')) subtypes.push('Union');
        if (type.includes('flip')) subtypes.push('Flip');
        if (type.includes('toon')) subtypes.push('Toon');
        
        return subtypes;
    },

    // ===============================
    // AUTO-ASIGNACIÓN DE ROLES
    // ===============================
    autoAssignRoles: function (card) {
    const type = (card.type || '').toLowerCase();
    if (type.includes('normal monster')) return [];
    // Usa exactamente la misma lógica que CardViewer.detectPossibleRoles
    // para garantizar consistencia entre badges y panel de Posibles Roles
    if (window.CardViewer && typeof CardViewer.detectPossibleRoles === 'function') {
        return CardViewer.detectPossibleRoles(card);
    }
    return [];
},

    // ===============================
    // SINCRONIZAR DESDE CARDVIEWER
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
    // CONTADORES
    // ===============================
    count: function (loc) {
        return Object.values(this.cards)
            .filter(c => c.location === loc)
            .reduce((s, c) => s + c.qty, 0);
    },

    // ===============================
    // PANEL CAMBIO DE NOMBRE
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
    // GESTIÓN DE ROLES
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
    // ACCIONES
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
        // Notificar a Estadísticas para actualizar el selector de decks
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
            
            // Recalcular roles automáticos para cada carta al cargar
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
        this.render();
    },

    clearDeck: function () {
        this.cards = {};
        this.render();
    },

    exportYDK: function () {
        let main = '', extra = '', side = '';

        Object.entries(this.cards).forEach(([id, item]) => {
            // Repetir el ID tantas veces como copias tenga
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
                // Ignorar otros comentarios
            } else if (/^\d+$/.test(line)) {
                // Es un ID de carta
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

        // Buscar cartas en la API
        try {
            const idsArray = Array.from(uniqueIds);
            const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${idsArray.join(',')}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al buscar cartas');
            
            const result = await response.json();
            const cardsData = result.data;

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

            // Actualizar deck
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
    // DESPLEGABLES
    // ===============================
    toggleSection: function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    },

    // ===============================
    // RENDERIZAR LISTA DE DECKS
    // ===============================
    renderDeckList: function () {
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
                
                // Determinar tier según Internal Score
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
    // RENDER FILAS
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
            let qtyColor = '#003366'; // Negro por defecto
            let imgClass = 'deck-img';

            // SIDE DECK: Estilos especiales (gris + desaturado)
            if (location === 'side') {
                color = 'rgba(128, 128, 128, 0.4)'; // Gris claro 40%
                nameClass = 'deck-name deck-name-white'; // Letras blancas
                qtyColor = '#ffffff'; // Cantidad en blanco
                imgClass = 'deck-img deck-img-desaturated'; // Imagen desaturada
            } 
            // MAIN DECK Y EXTRA DECK: Colores según tipo
            else {
                // Determinar color según tipo de carta
                if (type.includes('monster')) {
                    // Monstruos especiales
                    if (type.includes('synchro')) {
                        color = '#ffffff'; // Blanco
                    } else if (type.includes('fusion')) {
                        color = '#d8b5d8'; // Morado claro
                    } else if (type.includes('xyz')) {
                        color = 'rgba(0, 0, 0, 0.85)'; // Negro 85%
                        nameClass = 'deck-name deck-name-white';
                        qtyColor = '#ffffff'; // Blanco para Xyz
                    } else if (type.includes('link')) {
                        color = '#4169e1'; // Azul
                        nameClass = 'deck-name deck-name-white';
                        qtyColor = '#ffffff'; // Blanco para Link
                    } else if (type.includes('ritual')) {
                        color = '#b3d9ff'; // Azul claro
                    } else if (type.includes('pendulum')) {
                        color = 'linear-gradient(to right, #d9b38c, #b7f7c3)'; // Degradado
                    } else {
                        color = '#d9b38c'; // Marrón claro normal
                    }
                } else if (type.includes('spell')) {
                    color = '#b7f7c3'; // Verde claro
                } else if (type.includes('trap')) {
                    color = '#ffb3d9'; // Rosa claro
                } else {
                    color = '#d9b38c'; // Default
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
            const dimConfig = window.ConfigManager?.getDiminishingReturns?.();

            if (item.roles && item.roles.length > 0) {
                item.roles.forEach(role => {
                    if (role === 'Carta As') {
                        rolesBadges += `<span class="role-badge badge-carta-as">⭐ Carta As</span>`;
                        return;
                    }

                   // Roles manuales (vía botón Rol) siempre se muestran sin filtro adicional.
                    // Roles auto-asignados ya pasaron por detectPossibleRoles que incluye
                    // el filtro de NomenclatureAnalyzer desde el origen.

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
                        
                        <button class="deck-role-btn" onclick="Deck.openRolePanel(${id})">
                            Rol
                        </button>
                    </div>

                </div>
            `;
        });

        return html;
            },
/* ====================================
   REEMPLAZO DE renderDeckStatsBlock en deck.js
   
   INSTRUCCIONES:
   Busca en deck.js la función:
       renderDeckStatsBlock: function () {
   
   Reemplaza TODA la función (desde "renderDeckStatsBlock: function () {"
   hasta el cierre "}" que la termina, ANTES de la línea:
       },// ===============================
       // CARTA AS
   )
   con el contenido de este bloque.
   
   TAMBIÉN añade la función switchDeckStatsTab() en el mismo objeto Deck,
   después del cierre de renderDeckStatsBlock (antes de setCartaAs).
   ==================================== */

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


    // ── Subtipos Hechizo ─────────────────────────────────────────
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

    // ── Subtipos Trampa ──────────────────────────────────────────
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

    // ── Helpers barras (vista gráfica) ────────────────────────────
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

    // ── HTML final con sub-pestañas ───────────────────────────────
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
// CARTA AS
// ===============================
setCartaAs: function (cardId) {
    // Quitar "Carta As" de cualquier carta que lo tenga
    for (const [id, item] of Object.entries(this.cards)) {
        if (item.roles && item.roles.includes('Carta As')) {
            this.cards[id].roles = item.roles.filter(r => r !== 'Carta As');
        }
    }
    // Asignar al nuevo si se pasó un id (null = solo quitar)
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
// Notifica a todos los módulos que el deck activo cambió.
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
    // RENDER GENERAL
    // ===============================
    render: function () {
        if (!this.container) return;

        const mainC = this.count('main');
        const extraC = this.count('extra');
        const sideC = this.count('side');
        const totalCards = Object.keys(this.cards).length;
        const isEmpty = totalCards === 0;

        let html = `
            <div id="deck-list-container">
                <h2 class="deck-list-title" onclick="Deck.toggleSection('saved-decks-sec')">
                    Decks Guardados
                </h2>
                <div id="saved-decks-sec"style="display:none;">
                    ${this.renderDeckList()}
                </div>
            </div>
        `;

        if (isEmpty) {
            html += `<p>Abra la seccion de Decks Guardados y elija uno o agregue cartas desde la pestaña Buscador.</p>`;
        } else {
    html += `
    <h2 onclick="Deck.openRenamePanel()" class="deck-title">
        ${this.name}
    </h2>

    <div class="deck-zone-counts">
        <span class="dzc-chip dzc-main">🃏 Main <strong>${mainC}</strong></span>
        <span class="dzc-chip dzc-extra">✨ Extra <strong>${extraC}</strong></span>
        <span class="dzc-chip dzc-side">🔄 Side <strong>${sideC}</strong></span>
    </div>

    ${this.renderDeckStatsBlock()}

        ${window.Banlist?.isGenesysActive?.() ? Banlist.renderDeckPointsIndicator(this.cards) : ''}
        <h3 onclick="Deck.toggleSection('main-sec')">
            🃏 Main Deck (${mainC})
        </h3>
        <div id="main-sec">${this.renderRows('main')}</div>

        <h3 onclick="Deck.toggleSection('extra-sec')">
            🃏 Extra Deck (${extraC})
        </h3>
        <div id="extra-sec">${this.renderRows('extra')}</div>

        <h3 onclick="Deck.toggleSection('side-sec')">
            🃏 Side Deck (${sideC})
        </h3>
        <div id="side-sec">${this.renderRows('side')}</div>
    `;
}
// SECCIÓN DE NOTAS - solo visible con cartas cargadas
        if (!isEmpty) {
            html += `
                <h3 class="deck-section-title" onclick="Deck.toggleSection('notes-sec')">
                    📝 Notas del Deck
                </h3>
                <div id="notes-sec" class="deck-section-content" style="display:none;">
                    <textarea
                        class="deck-notes-textarea"
                        placeholder="Anota estrategias, combos clave, mulligan ideal, matchups difíciles..."
                        oninput="Deck.notes = this.value"
                    >${this.notes || ''}</textarea>
                    <div class="deck-notes-hint">
                        Las notas se guardan al presionar "Guardar Deck".
                    </div>
                </div>
            `;
        }
// SECCIÓN DE HISTORIAL DE ENFRENTAMIENTOS
        if (!isEmpty && window.Matchups) {
            html += Matchups.renderSection();
        }
        // SECCIÓN DE ACCIONES - SIEMPRE VISIBLE
        html += `
            <h3 onclick="Deck.toggleSection('actions-sec')"></h3>
            <div id="actions-sec" class="deck-actions">
                <button class="deck-move" onclick="Deck.saveDeck()" ${isEmpty ? 'disabled' : ''}>Guardar Deck</button>
                <button class="deck-move" onclick="Deck.clearDeck()" ${isEmpty ? 'disabled' : ''}>Limpiar Deck</button>
                <button class="deck-move" onclick="Deck.exportYDK()" ${isEmpty ? 'disabled' : ''}>Exportar Deck (.ydk)</button>
                <button class="deck-move" onclick="Deck.importYDK()">Importar Deck (.ydk)</button>
                <button class="deck-move" onclick="Deck.exportTXT()" ${isEmpty ? 'disabled' : ''}>Descargar Lista (.txt)</button>
                <button class="deck-move" onclick="Deck.downloadDecklist()" ${isEmpty ? 'disabled' : ''}>📸 Descargar Decklist</button>
            </div>
        `;

        this.container.innerHTML = html;
    },

    // ===============================
    // DESCARGAR DECKLIST VISUAL
    // ===============================
    
    downloadDecklist: async function() {
        try {
            // Verificar si html2canvas está disponible
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

            // Esperar un momento para que las imágenes carguen
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Convertir a imagen con html2canvas
            const canvas = await html2canvas(tempContainer, {
                backgroundColor: '#ffffff',
                scale: 2, // Mejor calidad
                logging: false,
                useCORS: true, // Permitir imágenes externas
                allowTaint: true
            });

            // Convertir canvas a blob y descargar
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.name.replace(/[^a-z0-9]/gi, '_')}_decklist.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Limpiar
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

        // Main Deck
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

        // Extra Deck
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

        // Side Deck
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

        // Roles
        if (Object.keys(rolesCount).length > 0) {
            html += `
                <h2 style="color: #2c3e50; border-bottom: 3px solid #e74c3c; padding-bottom: 10px;">
                    ROLES
                </h2>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
            `;
            Object.entries(rolesCount)
                .sort((a, b) => b[1] - a[1]) // Ordenar por cantidad descendente
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