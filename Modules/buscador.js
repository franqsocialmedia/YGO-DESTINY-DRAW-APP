/* ====================================
   BUSCADOR MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Búsqueda de cartas con filtros
   ==================================== */

const Buscador = {
    // Elementos DOM
    searchInput: null,
    additionalFilters: null,
    resultsContainer: null,
    
    // Estado
    currentSearchTerm: '',
    currentFilters: [],
    searchResults: [],
    isSearching: false,

    /**
     * Inicializar módulo Buscador
     */
    init: function() {
        Logger.functionStart('Buscador', 'init');

        // Obtener elementos del DOM
        this.searchInput = document.getElementById('card-search-input');
        this.additionalFilters = document.getElementById('additional-filters');
        this.resultsContainer = document.getElementById('search-results');

        if (!this.searchInput || !this.additionalFilters || !this.resultsContainer) {
            Logger.error('Buscador', 'No se encontraron todos los elementos necesarios del DOM');
            return;
        }

        // Configurar event listeners
        this.setupEventListeners();

        Logger.functionEnd('Buscador', 'init');
        Logger.success('Buscador', 'Módulo Buscador inicializado correctamente');
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners: function() {
        Logger.debug('Buscador', 'Configurando event listeners');

        // Enter en input de búsqueda
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                Logger.event('Buscador', 'KEYPRESS_ENTER', 'search-input');
                searchCard();
            }
        });

        // Enter en filtros adicionales
        this.additionalFilters.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                Logger.event('Buscador', 'KEYPRESS_ENTER', 'additional-filters');
                searchCard();
            }
        });

        Logger.success('Buscador', 'Event listeners configurados');
    },

    /**
     * Realizar búsqueda de carta
     */
    search: function() {
        Logger.functionStart('Buscador', 'search');

        // Validar que no esté buscando actualmente
        if (this.isSearching) {
            Logger.warning('Buscador', 'Ya hay una búsqueda en progreso');
            return;
        }

        // Obtener término de búsqueda
        this.currentSearchTerm = this.searchInput.value.trim();
        
        if (!this.currentSearchTerm) {
            Logger.warning('Buscador', 'Término de búsqueda vacío');
            this.showMessage('Por favor, ingresa un nombre de carta para buscar', 'warning');
            return;
        }

        // Obtener filtros adicionales
        const filtersText = this.additionalFilters.value.trim();
        this.currentFilters = filtersText 
            ? filtersText.split(',').map(f => f.trim()).filter(f => f.length > 0)
            : [];

        Logger.info('Buscador', 'Búsqueda iniciada', {
            searchTerm: this.currentSearchTerm,
            filters: this.currentFilters
        });

        // Mostrar estado de carga
        this.showLoading();
        this.isSearching = true;

        // Simular búsqueda (aquí se integrará la API real)
        setTimeout(() => {
            this.performSearch();
        }, 1000);

        Logger.functionEnd('Buscador', 'search');
    },

    /**
     * Ejecutar búsqueda (placeholder para integración con API)
     */
    performSearch: function() {
        Logger.functionStart('Buscador', 'performSearch');

        // TODO: Integrar con API de Yu-Gi-Oh!
        // Por ahora, mostrar resultados de ejemplo
        
        const mockResults = [
            {
                id: 1,
                name: 'Dark Magician',
                type: 'Monster',
                image: 'https://via.placeholder.com/200x291/003366/FFD700?text=Dark+Magician'
            },
            {
                id: 2,
                name: 'Blue-Eyes White Dragon',
                type: 'Monster',
                image: 'https://via.placeholder.com/200x291/003366/FFD700?text=Blue-Eyes'
            },
            {
                id: 3,
                name: 'Pot of Greed',
                type: 'Spell',
                image: 'https://via.placeholder.com/200x291/003366/FFD700?text=Pot+of+Greed'
            }
        ];

        // Filtrar resultados basados en el término de búsqueda
        this.searchResults = mockResults.filter(card => 
            card.name.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
        );

        // Aplicar filtros adicionales si existen
        if (this.currentFilters.length > 0) {
            this.searchResults = this.searchResults.filter(card => {
                return this.currentFilters.some(filter => 
                    card.name.toLowerCase().includes(filter.toLowerCase()) ||
                    card.type.toLowerCase().includes(filter.toLowerCase())
                );
            });
        }

        Logger.info('Buscador', `Búsqueda completada: ${this.searchResults.length} resultados encontrados`);

        // Mostrar resultados
        this.displayResults();
        this.isSearching = false;

        Logger.functionEnd('Buscador', 'performSearch');
    },

    /**
     * Mostrar resultados de búsqueda
     */
    displayResults: function() {
        Logger.functionStart('Buscador', 'displayResults');

        if (this.searchResults.length === 0) {
            this.showNoResults();
            return;
        }

        let html = '<div class="results-grid">';

        this.searchResults.forEach(card => {
            html += `
                <div class="card-item" onclick="Buscador.viewCard(${card.id})">
                    <img src="${card.image}" alt="${card.name}" class="card-image">
                    <div class="card-name">${card.name}</div>
                    <div class="card-type">${card.type}</div>
                </div>
            `;
        });

        html += '</div>';

        this.resultsContainer.innerHTML = html;
        
        Logger.success('Buscador', `${this.searchResults.length} cartas mostradas`);
        Logger.functionEnd('Buscador', 'displayResults');
    },

    /**
     * Ver detalle de una carta
     */
    viewCard: function(cardId) {
        Logger.buttonClick(`card-${cardId}`, 'Ver Carta', 'Buscador');
        Logger.info('Buscador', `Visualizando carta ID: ${cardId}`);
        
        // TODO: Implementar modal o vista de detalle de carta
        alert(`Ver detalle de carta ID: ${cardId}\n(Funcionalidad pendiente de implementar)`);
    },

    /**
     * Mostrar estado de carga
     */
    showLoading: function() {
        this.resultsContainer.innerHTML = '<div class="loading"></div>';
        Logger.debug('Buscador', 'Mostrando estado de carga');
    },

    /**
     * Mostrar mensaje cuando no hay resultados
     */
    showNoResults: function() {
        this.resultsContainer.innerHTML = `
            <div class="no-results">
                <p>😕 No se encontraron cartas que coincidan con la búsqueda</p>
                <p style="font-size: 0.9rem; margin-top: 1rem; color: rgba(241, 241, 241, 0.6);">
                    Término buscado: "${this.currentSearchTerm}"
                    ${this.currentFilters.length > 0 ? '<br>Filtros: ' + this.currentFilters.join(', ') : ''}
                </p>
            </div>
        `;
        Logger.info('Buscador', 'No se encontraron resultados');
    },

    /**
     * Mostrar mensaje general
     */
    showMessage: function(message, type = 'info') {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            success: '✅'
        };

        this.resultsContainer.innerHTML = `
            <div class="results-placeholder">
                ${icons[type] || icons.info} ${message}
            </div>
        `;
        
        Logger.debug('Buscador', `Mensaje mostrado: ${message}`);
    },

    /**
     * Limpiar búsqueda
     */
    clear: function() {
        Logger.functionStart('Buscador', 'clear');

        // Limpiar inputs
        this.searchInput.value = '';
        this.additionalFilters.value = '';

        // Resetear estado
        this.currentSearchTerm = '';
        this.currentFilters = [];
        this.searchResults = [];

        // Mostrar mensaje inicial
        this.showMessage('Utiliza el buscador para encontrar cartas de Yu-Gi-Oh!');

        // Focus en el input de búsqueda
        this.searchInput.focus();

        Logger.success('Buscador', 'Búsqueda limpiada');
        Logger.functionEnd('Buscador', 'clear');
    },

    /**
     * Obtener estadísticas de búsqueda
     */
    getStats: function() {
        return {
            currentSearchTerm: this.currentSearchTerm,
            filtersCount: this.currentFilters.length,
            resultsCount: this.searchResults.length,
            isSearching: this.isSearching
        };
    }
};

/**
 * Función global para buscar (llamada desde HTML)
 */
function searchCard() {
    Logger.buttonClick('search-btn', 'Buscar', 'Buscador');
    Buscador.search();
}

/**
 * Función global para limpiar búsqueda (llamada desde HTML)
 */
function clearSearch() {
    Logger.buttonClick('clear-btn', 'Limpiar', 'Buscador');
    Buscador.clear();
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Buscador.init());
} else {
    Buscador.init();
}

// Exportar para uso global
window.Buscador = Buscador;
window.searchCard = searchCard;
window.clearSearch = clearSearch;
