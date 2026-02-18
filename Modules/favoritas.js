/* ====================================
   FAVORITAS MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Lista de cartas favoritas del jugador
   ==================================== */

const Favoritas = {

    STORAGE_KEY: 'yugioh_favoritas',

    // ── Persistencia ────────────────────────────────────────────

    getAll: function () {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
        } catch (_) { return {}; }
    },

    has: function (cardId) {
        return !!this.getAll()[String(cardId)];
    },

    toggle: function (card) {
        const all = this.getAll();
        const id  = String(card.id);
        if (all[id]) {
            delete all[id];
        } else {
            all[id] = {
                id:    card.id,
                name:  card.name,
                type:  card.type,
                img:   card.card_images?.[0]?.image_url_small || '',
                data:  card          // guardamos la carta completa para poder Ver/Añadir
            };
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
        this.render();
    },

    // ── Render ────────────────────────────────────────────────────

    render: function () {
        const panel = document.getElementById('favoritas-panel');
        const list  = document.getElementById('favoritas-list');
        if (!panel || !list) return;

        const all   = this.getAll();
        const cards = Object.values(all).sort((a, b) => a.name.localeCompare(b.name));

        if (cards.length === 0) {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = '';

        list.innerHTML = cards.map((c, i) => `
            <div class="fav-item" onclick="Favoritas.showActions(${i}, this)">
                <img src="${c.img}" class="fav-img" alt="${c.name}">
                <div class="fav-info">
                    <div class="fav-name">${c.name}</div>
                    <div class="fav-type">${c.type}</div>
                </div>
                <button class="fav-remove" onclick="event.stopPropagation(); Favoritas.remove('${c.id}')" title="Quitar">✕</button>
            </div>
        `).join('');

        // Guardar el array indexado para showActions
        this._cards = cards;
    },

    showActions: function (index, el) {
        // Quitar overlay previo
        document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
        document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));

        const overlay = document.createElement('div');
        overlay.className = 'fav-actions-overlay';
        overlay.innerHTML = `
            <button class="card-action-btn btn-view"
                onclick="Favoritas.viewCard(${index}); event.stopPropagation();">Ver</button>
            <button class="card-action-btn btn-add"
                onclick="Favoritas.addCard(${index}); event.stopPropagation();">Añadir</button>
        `;
        el.appendChild(overlay);
        el.classList.add('fav-item-active');
    },

    viewCard: function (index) {
        document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
        document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));
        const card = this._cards?.[index];
        if (card?.data && window.CardViewer) CardViewer.open(card.data);
    },

    addCard: function (index) {
        document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
        document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));
        const card = this._cards?.[index];
        if (card?.data && window.Deck) Deck.syncFromViewer(card.id, card.data, 1);
    },

    remove: function (cardId) {
        const all = this.getAll();
        delete all[String(cardId)];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
        this.render();
    },

    init: function () {
        this.render();
    }
};

window.Favoritas = Favoritas;
document.addEventListener('DOMContentLoaded', () => Favoritas.init());