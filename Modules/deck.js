/* ====================================
   DECK MODULE
   Destiny Draw - Yu-Gi-Oh! App
   GestiÃ³n del Deck del usuario
   ==================================== */

const Deck = {

    cards: {},
    name: "Mi Deck",

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
    // SINCRONIZAR DESDE CARDVIEWER
    // ===============================
    syncFromViewer: function (id, card, qty) {
        if (qty <= 0) {
            delete this.cards[id];
        } else {
            if (!this.cards[id]) {
                this.cards[id] = {
                    data: card,
                    qty: qty,
                    location: this.isExtraDeckCard(card) ? 'extra' : 'main'
                };
            } else {
                this.cards[id].qty = qty;
            }
        }
        this.render();
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
    // ACCIONES
    // ===============================
    saveDeck: function () {
        const deckData = {
            cards: this.cards,
            savedAt: new Date().getTime()
        };
        localStorage.setItem(`deck_${this.name}`, JSON.stringify(deckData));
        alert('Deck guardado');
        this.render();
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
            this.name = deckName;
            this.closeModal();
            this.render();
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
                        location: location
                    };
                }
            });

            // Actualizar deck
            this.cards = newCards;
            this.name = filename.replace('.ydk', '');
            this.render();
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
            const mostRepeatedCard = this.getMostRepeatedCard(deck.cards);
            const imgUrl = mostRepeatedCard 
                ? mostRepeatedCard.card_images[0].image_url_small 
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
                            <span class="deck-count-main">Main: ${mainCount}</span> | 
                            <span class="deck-count-extra">Extra: ${extraCount}</span> | 
                            <span class="deck-count-side">Side: ${sideCount}</span>
                        </p>
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
            .sort((a, b) => a[1].data.name.localeCompare(b[1].data.name));

        if (entries.length === 0) {
            return `<p class="deck-empty">Vacio</p>`;
        }

        let html = '';

        entries.forEach(([id, item]) => {

            const card = item.data;

            const color =
                card.type.includes('Monster') ? '#d9b38c' :
                card.type.includes('Spell') ? '#b7f7c3' :
                '#ffb3d9';

            html += `
                <div class="deck-row" style="background:${color}">
                    
                    <img 
                        src="${card.card_images[0].image_url_small}" 
                        class="deck-img"
                        onclick="CardViewer.openFromDeck(${id})"
                    >

                    <div class="deck-name">${card.name}</div>

                    <div class="deck-qty">
                        <button onclick="Deck.changeQty(${id}, -1)">◀</button>
                        x${item.qty}
                        <button onclick="Deck.changeQty(${id}, 1)">▶</button>
                    </div>

                    ${location !== 'extra' ? `
                        <button class="deck-move" onclick="Deck.toggleLocation(${id})">
                            ${item.location === 'main' ? 'Side Deck' : 'Main Deck'}
                        </button>
                    ` : ''}

                </div>
            `;
        });

        return html;
    },

    // ===============================
    // RENDER GENERAL
    // ===============================
    render: function () {
        if (!this.container) return;

        const mainC = this.count('main');
        const extraC = this.count('extra');
        const sideC = this.count('side');

        let html = `
            <div id="deck-list-container">
                <h2 class="deck-list-title" onclick="Deck.toggleSection('saved-decks-sec')">
                    Decks Guardados
                </h2>
                <div id="saved-decks-sec">
                    ${this.renderDeckList()}
                </div>
            </div>
        `;

        if (Object.keys(this.cards).length === 0) {
            html += `<p>No hay un Deck seleccionado para mostrar.</p>`;
            this.container.innerHTML = html;
            return;
        }

        html += `
            <h2 onclick="Deck.openRenamePanel()" class="deck-title">
                ${this.name} (${mainC})
            </h2>

            <h3 onclick="Deck.toggleSection('main-sec')">
                Main Deck (${mainC})
            </h3>
            <div id="main-sec">${this.renderRows('main')}</div>

            <h3 onclick="Deck.toggleSection('extra-sec')">
                Extra Deck (${extraC})
            </h3>
            <div id="extra-sec">${this.renderRows('extra')}</div>

            <h3 onclick="Deck.toggleSection('side-sec')">
                Side Deck (${sideC})
            </h3>
            <div id="side-sec">${this.renderRows('side')}</div>

            <h3 onclick="Deck.toggleSection('actions-sec')">Acciones</h3>
            <div id="actions-sec" class="deck-actions">
                <button onclick="Deck.saveDeck()">Guardar Deck</button>
                <button onclick="Deck.clearDeck()">Limpiar Deck</button>
                <button onclick="Deck.exportYDK()">Exportar Deck</button>
                <button onclick="Deck.importYDK()">Importar Deck</button>
                <button onclick="Deck.exportTXT()">Lista en .txt</button>
            </div>
        `;

        this.container.innerHTML = html;
    }
};

window.Deck = Deck;
document.addEventListener('DOMContentLoaded', () => Deck.init());