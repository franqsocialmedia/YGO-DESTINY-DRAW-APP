/* ====================================
   BUSCADOR MODULE
   Destiny Draw - Yu-Gi-Oh! App
   ==================================== */

const Buscador = {

    apiUrl: 'https://db.ygoprodeck.com/api/v7/cardinfo.php',

    searchInput: null,
    filterInput: null,
    searchBtn: null,
    clearBtn: null,
    resultsContainer: null,
    filterWords: [],
    currentCards: [],


    init: function () {

        this.searchInput = document.getElementById('card-search-input');
        this.filterInput = document.getElementById('additional-filters');
        this.searchBtn = document.getElementById('search-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.resultsContainer = document.getElementById('search-results');

        if (!this.searchInput || !this.searchBtn || !this.clearBtn || !this.resultsContainer) {
            console.error('Buscador: Elementos no encontrados');
            return;
        }

        this.setupEvents();
    },

    setupEvents: function () {

        this.searchBtn.addEventListener('click', () => this.search());
        this.clearBtn.addEventListener('click', () => this.clear());

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.search();
        });

        if (this.filterInput) {
            this.filterInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.search();
            });
        }
    },

    search: async function () {

        const mainTerm = this.searchInput.value.trim();

        if (!mainTerm) {
            this.showMessage('⚠️ Escribe un nombre de carta');
            return;
        }

        if (this.filterInput) {
            this.filterWords = this.filterInput.value
                .split(',')
                .map(w => w.trim().toLowerCase())
                .filter(w => w.length > 0);
        } else {
            this.filterWords = [];
        }

        this.showLoading();

        try {
            const url = `${this.apiUrl}?fname=${encodeURIComponent(mainTerm)}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error('Error HTTP');

            const data = await response.json();
            const cards = data.data || [];

            if (cards.length === 0) {
                this.showMessage('😕 No se encontraron cartas');
                return;
            }

            const filteredCards = this.applyWordFilters(cards);

            if (filteredCards.length === 0) {
                this.showMessage('😕 No coinciden los filtros');
                return;
            }

            this.displayResults(filteredCards);

        } catch (err) {
            console.error(err);
            this.showMessage('❌ Error al buscar cartas');
        }
    },

    applyWordFilters: function (cards) {

        if (!this.filterWords.length) return cards;

        return cards.filter(card => {

            const text = [
                card.name,
                card.type,
                card.desc,
                card.race,
                card.attribute
            ].join(' ').toLowerCase();

            return this.filterWords.every(word => text.includes(word));
        });
    },

    displayResults: function (cards) {

        let html = '<div class="results-grid">';
        this.currentCards = cards;

            cards.forEach((card, index) => {

                const img = card.card_images?.[0]?.image_url_small || '';

                html += `
                    <div class="card-item" onclick="CardViewer.openFromIndex(${index})">
                        <img src="${img}" class="card-image">
                        <div class="card-name">${card.name}</div>
                        <div class="card-type">${card.type}</div>
                    </div>
                `;
            });


        html += '</div>';
        this.resultsContainer.innerHTML = html;
    },

    clear: function () {

        this.searchInput.value = '';
        if (this.filterInput) this.filterInput.value = '';
        this.filterWords = [];

        this.resultsContainer.innerHTML =
            '<p class="results-placeholder">Utiliza el buscador para encontrar cartas de Yu-Gi-Oh!</p>';

        this.searchInput.focus();
    },

    showLoading: function () {
        this.resultsContainer.innerHTML =
            '<p class="results-placeholder">⏳ Buscando...</p>';
    },

    showMessage: function (msg) {
        this.resultsContainer.innerHTML =
            `<p class="results-placeholder">${msg}</p>`;
    }
};

document.addEventListener('DOMContentLoaded', () => Buscador.init());
window.Buscador = Buscador;
