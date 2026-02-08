/* ====================================
   BUSCADOR MODULE
   Destiny Draw - Yu-Gi-Oh! App

   FUNCIÓN:
   - Buscar cartas por nombre usando YGOPRODeck API
   - Mostrar resultados en grid
   - Limpiar búsqueda

   NOTAS:
   - No depende de otras pestañas
   - Crea/valida elementos DOM
   - Mantiene estructura comentada
   ==================================== */

const Buscador = {

    /* ====================================
       CONFIGURACIÓN API
       ==================================== */
    apiUrl: 'https://db.ygoprodeck.com/api/v7/cardinfo.php',

    /* ====================================
       ELEMENTOS DOM
       ==================================== */
    searchInput: null,
    searchBtn: null,
    clearBtn: null,
    resultsContainer: null,

    /* ====================================
       INICIALIZACIÓN
       ==================================== */
    init: function () {

        // Obtener elementos desde index.html
        this.searchInput = document.getElementById('card-search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.resultsContainer = document.getElementById('search-results');

        // Validar que existan
        if (!this.searchInput || !this.searchBtn || !this.clearBtn || !this.resultsContainer) {
            console.error('Buscador: Elementos no encontrados en el DOM');
            return;
        }

        this.setupEvents();
    },

    /* ====================================
       EVENT LISTENERS
       ==================================== */
    setupEvents: function () {

        // Botón Buscar
        this.searchBtn.addEventListener('click', () => {
            this.search();
        });

        // Botón Limpiar
        this.clearBtn.addEventListener('click', () => {
            this.clear();
        });

        // Enter en input
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });
    },

    /* ====================================
       BÚSQUEDA PRINCIPAL
       ==================================== */
    search: async function () {

        const term = this.searchInput.value.trim();

        if (!term) {
            this.showMessage('⚠️ Escribe un nombre de carta');
            return;
        }

        this.showLoading();

        try {
            const url = `${this.apiUrl}?fname=${encodeURIComponent(term)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Error HTTP');
            }

            const data = await response.json();
            const cards = data.data || [];

            if (cards.length === 0) {
                this.showMessage('😕 No se encontraron cartas');
                return;
            }

            this.displayResults(cards);

        } catch (err) {
            console.error(err);
            this.showMessage('❌ Error al buscar cartas');
        }
    },

    /* ====================================
       MOSTRAR RESULTADOS
       ==================================== */
    displayResults: function (cards) {

        let html = '<div class="results-grid">';

        cards.forEach(card => {

            const img = card.card_images?.[0]?.image_url_small || '';

            html += `
                <div class="card-item">
                    <img src="${img}" class="card-image">
                    <div class="card-name">${card.name}</div>
                    <div class="card-type">${card.type}</div>
                </div>
            `;
        });

        html += '</div>';
        this.resultsContainer.innerHTML = html;
    },

    /* ====================================
       LIMPIAR BÚSQUEDA
       ==================================== */
    clear: function () {

        this.searchInput.value = '';

        this.resultsContainer.innerHTML =
            '<p class="results-placeholder">Utiliza el buscador para encontrar cartas de Yu-Gi-Oh!</p>';

        this.searchInput.focus();
    },

    /* ====================================
       MENSAJES
       ==================================== */
    showLoading: function () {
        this.resultsContainer.innerHTML =
            '<p class="results-placeholder">⏳ Buscando...</p>';
    },

    showMessage: function (msg) {
        this.resultsContainer.innerHTML =
            `<p class="results-placeholder">${msg}</p>`;
    }
};

/* ====================================
   AUTO-INICIALIZACIÓN
   ==================================== */
document.addEventListener('DOMContentLoaded', () => {
    Buscador.init();
});

window.Buscador = Buscador;
