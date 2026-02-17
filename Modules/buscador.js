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
    chipsContainer: null,
    filterWords: [],
    currentCards: [],


    init: function () {

        this.searchInput = document.getElementById('card-search-input');
        this.filterInput = document.getElementById('additional-filters');
        this.searchBtn = document.getElementById('search-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.resultsContainer = document.getElementById('search-results');
        this.chipsContainer = document.getElementById('filter-chips-container');

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
            // Detectar cuando se presiona coma o Enter para agregar chip
            this.filterInput.addEventListener('keydown', (e) => {
                if (e.key === ',' || e.key === 'Enter') {
                    e.preventDefault();
                    this.addChipFromInput();
                }
            });

            // También buscar automáticamente cuando cambian los chips
            this.filterInput.addEventListener('input', (e) => {
                // Si el usuario borra todo, también actualizar
                if (e.target.value === '' && this.filterWords.length > 0) {
                    this.autoSearch();
                }
            });
        }
    },

    // NUEVO: Agregar chip desde el input
    addChipFromInput: function () {
        if (!this.filterInput) return;

        const value = this.filterInput.value.trim().toLowerCase();
        
        if (value && !this.filterWords.includes(value)) {
            this.filterWords.push(value);
            this.filterInput.value = '';
            this.renderChips();
            this.autoSearch();
        }
    },

    // NUEVO: Renderizar los chips visuales
    renderChips: function () {
        if (!this.chipsContainer) return;

        this.chipsContainer.innerHTML = '';

        this.filterWords.forEach((word, index) => {
            const chip = document.createElement('div');
            chip.className = 'filter-chip';
            chip.innerHTML = `
                <span class="chip-text">${word}</span>
                <span class="chip-remove" data-index="${index}">×</span>
            `;

            // Evento click para eliminar chip
            chip.querySelector('.chip-remove').addEventListener('click', () => {
                this.removeChip(index);
            });

            this.chipsContainer.appendChild(chip);
        });
    },

    // NUEVO: Eliminar un chip específico
    removeChip: function (index) {
        this.filterWords.splice(index, 1);
        this.renderChips();
        this.autoSearch();
    },

    // NUEVO: Buscar automáticamente cuando hay chips (incluso sin nombre)
    autoSearch: async function () {
        // Si no hay chips y no hay nombre, no buscar
        if (this.filterWords.length === 0 && !this.searchInput.value.trim()) {
            this.resultsContainer.innerHTML =
                '<p class="results-placeholder">Utiliza el buscador para encontrar cartas de Yu-Gi-Oh!</p>';
            return;
        }

        this.showLoading();

        try {
            let cards = [];

            const mainTerm = this.searchInput.value.trim();

            if (mainTerm) {
                // Búsqueda normal por nombre
                const url = `${this.apiUrl}?fname=${encodeURIComponent(mainTerm)}`;
                const response = await fetch(url);

                if (!response.ok) throw new Error('Error HTTP');

                const data = await response.json();
                cards = data.data || [];
            } else {
                this.showMessage('🔍 Buscando en la base de datos. Puede tardar unos segundos...');
await new Promise(resolve => setTimeout(resolve, 0));
                // Búsqueda solo por filtros (obtener todas las cartas y filtrar)
                // Usamos un nombre genérico para obtener un conjunto amplio
                const url = `${this.apiUrl}`;
                const response = await fetch(url);

                if (!response.ok) throw new Error('Error HTTP');

                const data = await response.json();
                cards = data.data || [];
            }

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

    search: async function () {

        const mainTerm = this.searchInput.value.trim();

        // Permitir buscar solo con filtros (sin nombre)
        if (!mainTerm && this.filterWords.length === 0) {
            this.showMessage('⚠️ Escribe un nombre de carta o agrega palabras clave');
            return;
        }

        this.showLoading();

        try {
            let cards = [];

            if (mainTerm) {
                // Búsqueda normal por nombre
                const url = `${this.apiUrl}?fname=${encodeURIComponent(mainTerm)}`;
                const response = await fetch(url);

                if (!response.ok) throw new Error('Error HTTP');

                const data = await response.json();
                cards = data.data || [];
            } else {
                this.showMessage('🔍 Buscando en la base de datos. Puede tardar unos segundos...');
await new Promise(resolve => setTimeout(resolve, 0));
                // Búsqueda solo por filtros (obtener todas las cartas)
                const url = `${this.apiUrl}`;
                const response = await fetch(url);

                if (!response.ok) throw new Error('Error HTTP');

                const data = await response.json();
                cards = data.data || [];
            }

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
        <div class="card-item" onclick="Buscador.showCardActions(${index}, this)">
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
        
        // NUEVO: Limpiar también los chips
        this.filterWords = [];
        this.renderChips();

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
    },
    showCardActions: function(index, element) {
        // Remover cualquier overlay previo
        this.removeCardActions();
        
        // Crear overlay con botones
        const overlay = document.createElement('div');
        overlay.className = 'card-actions-overlay';
        overlay.innerHTML = `
            <button class="card-action-btn btn-view" onclick="Buscador.viewCard(${index}); event.stopPropagation();">Ver</button>
            <button class="card-action-btn btn-add" onclick="Buscador.addCard(${index}); event.stopPropagation();">Añadir</button>
        `;
        
        element.appendChild(overlay);
        element.classList.add('card-item-active');
    },

    removeCardActions: function() {
        const activeItems = document.querySelectorAll('.card-item-active');
        activeItems.forEach(item => {
            const overlay = item.querySelector('.card-actions-overlay');
            if (overlay) overlay.remove();
            item.classList.remove('card-item-active');
        });
    },

    viewCard: function(index) {
        this.removeCardActions();
        CardViewer.openFromIndex(index);
    },

    addCard: function(index) {
        this.removeCardActions();
        const card = this.currentCards[index];
        if (window.Deck && card) {
            const currentQty = Deck.cards[card.id] ? Deck.cards[card.id].qty : 0;
            Deck.syncFromViewer(card.id, card, currentQty + 1);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Buscador.init());
window.Buscador = Buscador;