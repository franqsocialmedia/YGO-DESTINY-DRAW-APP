/* ====================================
   BUSCADOR MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Búsqueda de cartas con API de YGOPRODeck
   
   API: https://ygoprodeck.com/api-guide/
   Endpoint: https://db.ygoprodeck.com/api/v7/cardinfo.php
   IMPORTANTE: Esta API permite CORS, funciona SIN servidor
   ==================================== */

const Buscador = {
    // ====================================
    // ELEMENTOS DOM
    // ====================================
    searchInput: null,
    additionalFilters: null,
    resultsContainer: null,
    
    // ====================================
    // ESTADO
    // ====================================
    currentSearchTerm: '',
    currentFilters: [],
    searchResults: [],
    isSearching: false,
    
    // ====================================
    // CONFIGURACIÓN API
    // ====================================
    apiUrl: 'https://db.ygoprodeck.com/api/v7/cardinfo.php',

    /**
     * Inicializar módulo Buscador
     */
    init: function() {
        Logger.functionStart('Buscador', 'init');

        // Obtener elementos del DOM
        this.searchInput = document.getElementById('card-search-input');
        this.additionalFilters = document.getElementById('additional-filters');
        this.resultsContainer = document.getElementById('search-results');

        // Validar elementos
        if (!this.searchInput || !this.additionalFilters || !this.resultsContainer) {
            Logger.error('Buscador', 'Elementos DOM no encontrados');
            return;
        }

        // Configurar event listeners
        this.setupEventListeners();

        Logger.success('Buscador', 'Módulo Buscador inicializado');
        Logger.functionEnd('Buscador', 'init');
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners: function() {
        Logger.debug('Buscador', 'Configurando event listeners');

        // Obtener botones
        const searchBtn = document.getElementById('search-btn');
        const clearBtn = document.getElementById('clear-btn');

        // Click en botón Buscar
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                Logger.buttonClick('search-btn', 'Buscar', 'Buscador');
                this.search();
            });
        }

        // Click en botón Limpiar
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                Logger.buttonClick('clear-btn', 'Limpiar', 'Buscador');
                this.clear();
            });
        }

        // Enter en input de búsqueda
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                Logger.event('Buscador', 'KEYPRESS_ENTER', 'search-input');
                this.search();
            }
        });

        // Enter en filtros
        this.additionalFilters.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                Logger.event('Buscador', 'KEYPRESS_ENTER', 'additional-filters');
                this.search();
            }
        });

        Logger.success('Buscador', 'Event listeners configurados');
    },

    /**
     * Realizar búsqueda
     */
    search: function() {
        Logger.functionStart('Buscador', 'search');

        // Validar que no hay búsqueda en progreso
        if (this.isSearching) {
            Logger.warning('Buscador', 'Búsqueda en progreso');
            return;
        }

        // Obtener término de búsqueda
        this.currentSearchTerm = this.searchInput.value.trim();
        
        if (!this.currentSearchTerm) {
            Logger.warning('Buscador', 'Término vacío');
            this.showMessage('⚠️ Ingresa un nombre de carta');
            return;
        }

        // Obtener filtros
        const filtersText = this.additionalFilters.value.trim();
        this.currentFilters = filtersText 
            ? filtersText.split(',').map(f => f.trim()).filter(f => f.length > 0)
            : [];

        Logger.info('Buscador', 'Búsqueda iniciada', {
            term: this.currentSearchTerm,
            filters: this.currentFilters
        });

        // Mostrar loading
        this.showLoading();
        this.isSearching = true;

        // Ejecutar búsqueda
        this.performSearch();

        Logger.functionEnd('Buscador', 'search');
    },

    /**
     * Ejecutar búsqueda en la API
     */
    performSearch: async function() {
        Logger.functionStart('Buscador', 'performSearch');

        try {
            // Construir URL (fname = fuzzy name search)
            const searchUrl = `${this.apiUrl}?fname=${encodeURIComponent(this.currentSearchTerm)}`;
            
            Logger.debug('Buscador', 'Request a API', { url: searchUrl });

            // Hacer request a la API
            const response = await fetch(searchUrl);
            
            // Verificar respuesta
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Parsear JSON
            const data = await response.json();
            
            Logger.info('Buscador', 'Respuesta recibida', {
                total: data.data ? data.data.length : 0
            });

            // Guardar resultados
            this.searchResults = data.data || [];

            // Aplicar filtros adicionales
            if (this.currentFilters.length > 0) {
                this.applyAdditionalFilters();
            }

            Logger.info('Buscador', `${this.searchResults.length} resultados`);

            // Mostrar resultados
            this.displayResults();

        } catch (error) {
            Logger.error('Buscador', 'Error en búsqueda', error);
            
            // Verificar si es 404 (no encontrado)
            if (error.message.includes('404')) {
                this.showNoResults();
            } else {
                this.showMessage('❌ Error al buscar. Intenta de nuevo.');
            }
        } finally {
            this.isSearching = false;
            Logger.functionEnd('Buscador', 'performSearch');
        }
    },

    /**
     * Aplicar filtros adicionales
     */
    applyAdditionalFilters: function() {
        Logger.debug('Buscador', 'Aplicando filtros', {
            filters: this.currentFilters,
            before: this.searchResults.length
        });

        this.searchResults = this.searchResults.filter(card => {
            // Texto buscable: nombre, tipo, descripción, race, atributo
            const searchText = [
                card.name,
                card.type,
                card.desc,
                card.race,
                card.attribute
            ].join(' ').toLowerCase();

            // Verificar si algún filtro coincide
            return this.currentFilters.some(filter => 
                searchText.includes(filter.toLowerCase())
            );
        });

        Logger.info('Buscador', 'Filtros aplicados', {
            after: this.searchResults.length
        });
    },

    /**
     * Mostrar resultados
     */
    displayResults: function() {
        Logger.functionStart('Buscador', 'displayResults');

        if (this.searchResults.length === 0) {
            this.showNoResults();
            return;
        }

        // Construir HTML
        let html = '<div class="results-grid">';

        this.searchResults.forEach((card, index) => {
            // Obtener imagen (usar small image)
            const cardImage = card.card_images && card.card_images[0] 
                ? card.card_images[0].image_url_small 
                : 'https://via.placeholder.com/200x291/003366/FFD700?text=No+Image';

            html += `
                <div class="card-item" data-card-index="${index}">
                    <img src="${cardImage}" 
                         alt="${card.name}" 
                         class="card-image"
                         onerror="this.src='https://via.placeholder.com/200x291/003366/FFD700?text=Error'">
                    <div class="card-name">${card.name}</div>
                    <div class="card-type">${card.type}</div>
                </div>
            `;
        });

        html += '</div>';

        this.resultsContainer.innerHTML = html;

        // Agregar event listeners a las cartas
        const cardItems = this.resultsContainer.querySelectorAll('.card-item');
        cardItems.forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.getAttribute('data-card-index'));
                this.viewCard(index);
            });
        });
        
        Logger.success('Buscador', `${this.searchResults.length} cartas mostradas`);
        Logger.functionEnd('Buscador', 'displayResults');
    },

    /**
     * Ver detalle de carta
     */
    viewCard: function(cardIndex) {
        const card = this.searchResults[cardIndex];
        
        if (!card) {
            Logger.error('Buscador', 'Carta no encontrada', { cardIndex });
            return;
        }

        Logger.buttonClick(`card-${cardIndex}`, card.name, 'Buscador');
        
        // Mostrar modal
        this.showCardModal(card);
    },

    /**
     * Mostrar modal con detalles de carta
     */
    showCardModal: function(card) {
        Logger.debug('Buscador', 'Mostrando modal', { card: card.name });

        // Imagen grande
        const cardImage = card.card_images && card.card_images[0] 
            ? card.card_images[0].image_url 
            : 'https://via.placeholder.com/421x614/003366/FFD700?text=No+Image';

        // Stats (ATK/DEF para monstruos)
        let statsHtml = '';
        if (card.type.includes('Monster')) {
            if (card.type.includes('Link')) {
                statsHtml = `<p><strong>LINK:</strong> ${card.linkval || 'N/A'}</p>`;
            } else {
                statsHtml = `
                    <p><strong>ATK:</strong> ${card.atk !== undefined ? card.atk : '?'} / 
                       <strong>DEF:</strong> ${card.def !== undefined ? card.def : '?'}</p>
                `;
            }
            if (card.level) {
                statsHtml += `<p><strong>Level:</strong> ${card.level}</p>`;
            }
        }

        // HTML del modal
        const modalHtml = `
            <div class="card-modal-overlay">
                <div class="card-modal">
                    <button class="modal-close-btn">✖</button>
                    <div class="modal-content">
                        <div class="modal-image">
                            <img src="${cardImage}" alt="${card.name}">
                        </div>
                        <div class="modal-info">
                            <h3>${card.name}</h3>
                            <p><strong>Tipo:</strong> ${card.type}</p>
                            ${card.race ? `<p><strong>Raza:</strong> ${card.race}</p>` : ''}
                            ${card.attribute ? `<p><strong>Atributo:</strong> ${card.attribute}</p>` : ''}
                            ${statsHtml}
                            <div class="modal-description">
                                <strong>Descripción:</strong>
                                <p>${card.desc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Agregar al body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Prevenir scroll
        document.body.style.overflow = 'hidden';

        // Event listeners para cerrar
        const overlay = document.querySelector('.card-modal-overlay');
        const closeBtn = document.querySelector('.modal-close-btn');

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeCardModal();
            }
        });

        closeBtn.addEventListener('click', () => {
            this.closeCardModal();
        });

        Logger.success('Buscador', 'Modal mostrado');
    },

    /**
     * Cerrar modal
     */
    closeCardModal: function() {
        const modal = document.querySelector('.card-modal-overlay');
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = '';
        Logger.success('Buscador', 'Modal cerrado');
    },

    /**
     * Mostrar loading
     */
    showLoading: function() {
        this.resultsContainer.innerHTML = '<div class="loading"></div>';
    },

    /**
     * Mostrar sin resultados
     */
    showNoResults: function() {
        this.resultsContainer.innerHTML = `
            <div class="no-results">
                <p>😕 No se encontraron cartas</p>
                <p style="font-size: 0.9rem; margin-top: 1rem; color: rgba(241, 241, 241, 0.6);">
                    Búsqueda: "${this.currentSearchTerm}"
                    ${this.currentFilters.length > 0 ? '<br>Filtros: ' + this.currentFilters.join(', ') : ''}
                </p>
            </div>
        `;
    },

    /**
     * Mostrar mensaje
     */
    showMessage: function(message) {
        this.resultsContainer.innerHTML = `
            <div class="results-placeholder">${message}</div>
        `;
    },

    /**
     * Limpiar búsqueda
     */
    clear: function() {
        this.searchInput.value = '';
        this.additionalFilters.value = '';
        this.currentSearchTerm = '';
        this.currentFilters = [];
        this.searchResults = [];
        
        this.showMessage('Utiliza el buscador para encontrar cartas de Yu-Gi-Oh!');
        this.searchInput.focus();
        
        Logger.success('Buscador', 'Búsqueda limpiada');
    }
};

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Buscador.init());
} else {
    Buscador.init();
}

window.Buscador = Buscador;
