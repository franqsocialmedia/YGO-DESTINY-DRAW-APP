/* ====================================
   DECK MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Gestión del Deck del usuario
   ==================================== */

const Deck = {

    cards: {},

    init: function () {
        this.container = document.getElementById('deck-container');
        if (!this.container) return;
        this.render();
    },

    syncFromViewer: function (id, card, qty) {
        if (qty <= 0) {
            delete this.cards[id];
        } else {
            if (!this.cards[id]) {
                this.cards[id] = {
                    data: card,
                    qty: qty,
                    location: 'main',
                    functions: ['Tech', 'Side Deck']
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

        if (item.qty <= 0) {
            delete this.cards[id];
        }

        this.render();
    },

    toggleLocation: function (id) {
        const item = this.cards[id];
        if (!item) return;

        if (item.location === 'main') {
            item.location = 'side';
        } else {
            item.location = 'main';
        }

        this.render();
    },

    getMainCount: function () {
        return Object.values(this.cards)
            .filter(c => c.location === 'main')
            .reduce((sum, c) => sum + c.qty, 0);
    },

    // Cartas representativas (las de mayor cantidad)
    getTopCards: function () {
        return Object.values(this.cards)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 2);
    },

    render: function () {
        if (!this.container) return;

        const mainCount = this.getMainCount();
        const topCards = this.getTopCards();

        let html = `
            <div class="deck-header">
                <h2>Mi Deck (${mainCount})</h2>
                <div class="deck-top-cards">
        `;

        topCards.forEach(c => {
            html += `<img src="${c.data.card_images[0].image_url_small}" class="deck-top-img">`;
        });

        html += `</div></div>`;

        html += `<div class="deck-table">`;

        // ===== ORDEN ALFABÉTICO AQUÍ =====
        const sorted = Object.entries(this.cards)
            .sort((a, b) =>
                a[1].data.name.localeCompare(b[1].data.name)
            );

        sorted.forEach(([id, item]) => {
            const card = item.data;

            const color =
                card.type.includes('Monster') ? '#d9b38c' :
                card.type.includes('Spell') ? '#b7f7c3' :
                '#ffb3d9';

            const funcTags = item.functions.map(f =>
                `<span class="deck-tag">${f}</span>`
            ).join('');

            const locationLabel =
                item.location === 'main' ? 'Side Deck' : 'Main Deck';

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

                    <div class="deck-functions">
                        ${funcTags}
                    </div>

                    <button class="deck-move" onclick="Deck.toggleLocation(${id})">
                        ${locationLabel}
                    </button>

                </div>
            `;
        });

        html += `</div>`;

        this.container.innerHTML = html;
    }
};

window.Deck = Deck;
document.addEventListener('DOMContentLoaded', () => Deck.init());
