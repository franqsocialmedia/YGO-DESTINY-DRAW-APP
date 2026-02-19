/* ====================================
   NAVIGATION MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Manejo de navegación entre pestañas
   ==================================== */

/**
 * Objeto Navigation
 * Controla toda la lógica de navegación entre pestañas
 */
// SafeLogger seguro (evita que rompa si no existe)
const SafeLogger = window.Logger || {
    functionStart(){},
    functionEnd(){},
    info(){},
    success(){},
    error(){},
    warning(){},
    debug(){},
    event(){},
    buttonClick(){}
};


const Navigation = {
    // Pestaña actual
    currentTab: 'buscador',
    
    // Lista de todas las pestañas disponibles
    tabs: ['buscador', 'mideck', 'estadisticas', 'simuladores', 'meta', 'formacion', 'config'],
    
    /**
     * Inicializar módulo de navegación
     * Se ejecuta cuando el DOM está listo
     */
   init: function() {
    SafeLogger.functionStart('Navigation', 'init');

    // Esperar a que el DOM esté completamente renderizado
    requestAnimationFrame(() => {

        const navButtons = document.querySelectorAll('.nav-button');
        SafeLogger.info('Navigation', `${navButtons.length} botones de navegación encontrados`);

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                SafeLogger.buttonClick(tab, button.textContent.trim(), 'Navigation');
                this.showTab(tab);
            });
        });

        // Mostrar pestaña inicial
        this.showTab(this.currentTab);

        SafeLogger.success('Navigation', 'Eventos de navegación registrados correctamente');
    });

    SafeLogger.functionEnd('Navigation', 'init');
},


    /**
     * Cambiar a una pestaña específica
     * @param {string} tabName - Nombre de la pestaña a mostrar
     * @returns {boolean} - true si se cambió correctamente, false si hubo error
     */
    showTab: function(tabName) {
        SafeLogger.functionStart('Navigation', 'showTab', { tabName });

        // Validar que la pestaña existe
        if (!this.tabs.includes(tabName)) {
            SafeLogger.error('Navigation', `Pestaña "${tabName}" no existe`, { availableTabs: this.tabs });
            return false;
        }

        // PASO 1: Ocultar todas las pestañas de contenido
        const allContents = document.querySelectorAll('.tab-content');
        allContents.forEach(content => {
            content.classList.remove('active');
        });
        SafeLogger.debug('Navigation', 'Todas las pestañas de contenido ocultadas');

        // PASO 2: Desactivar todos los botones de navegación
        const allButtons = document.querySelectorAll('.nav-button');
        allButtons.forEach(button => {
            button.classList.remove('active');
        });
        SafeLogger.debug('Navigation', 'Todos los botones desactivados');

        // PASO 3: Mostrar la pestaña de contenido seleccionada
        const selectedContent = document.getElementById(`${tabName}-content`);
        if (selectedContent) {
            selectedContent.classList.add('active');
            SafeLogger.success('Navigation', `Pestaña de contenido "${tabName}" mostrada`);
        } else {
            SafeLogger.error('Navigation', `Contenido de pestaña "${tabName}" no encontrado en el DOM`);
            return false;
        }

        // PASO 4: Activar el botón de navegación correspondiente
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
            SafeLogger.debug('Navigation', `Botón "${tabName}" activado`);
        } else {
            SafeLogger.warning('Navigation', `Botón para "${tabName}" no encontrado`);
        }

        // PASO 5: Actualizar pestaña actual y registrar cambio
        const previousTab = this.currentTab;
        this.currentTab = tabName;
        
        SafeLogger.info('Navigation', `Navegación completada: ${previousTab} → ${tabName}`);

        // 🔽 NUEVO: NOTIFICAR A ESTADÍSTICAS PARA MOSTRAR / OCULTAR WIDGET
        if (window.Estadisticas && typeof Estadisticas.updateFloatingWidgetVisibility === 'function') {
            Estadisticas.updateFloatingWidgetVisibility(tabName);
        }

        SafeLogger.functionEnd('Navigation', 'showTab', { success: true, currentTab: tabName });

        // PASO 6: Hacer scroll al inicio del contenido (smooth)
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });

        return true;
    },

    /**
     * Obtener pestaña actual
     * @returns {string} - Nombre de la pestaña actual
     */
    getCurrentTab: function() {
        return this.currentTab;
    },

    /**
     * Ir a la pestaña anterior (navegación circular)
     */
    previousTab: function() {
        const currentIndex = this.tabs.indexOf(this.currentTab);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
        const previousTab = this.tabs[previousIndex];
        
        SafeLogger.event('Navigation', 'PREVIOUS_TAB', previousTab);
        this.showTab(previousTab);
    },

    /**
     * Ir a la pestaña siguiente (navegación circular)
     */
    nextTab: function() {
        const currentIndex = this.tabs.indexOf(this.currentTab);
        const nextIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
        const nextTab = this.tabs[nextIndex];
        
        SafeLogger.event('Navigation', 'NEXT_TAB', nextTab);
        this.showTab(nextTab);
    }
};

/**
 * FUNCIÓN GLOBAL: switchTab
 * Esta función es llamada directamente desde los botones HTML (onclick)
 */
function switchTab(tabName) {
    const button = document.querySelector(`[data-tab="${tabName}"]`);
    const buttonText = button ? button.textContent.trim() : tabName;
    const buttonId = button ? button.getAttribute('data-tab') : tabName;
    
    SafeLogger.buttonClick(buttonId, buttonText, 'Navigation');
    Navigation.showTab(tabName);
}

// ====================================
// INICIALIZACIÓN AUTOMÁTICA
// ====================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Navigation.init();
    });
} else {
    Navigation.init();
}

// ====================================
// EXPORTAR AL SCOPE GLOBAL
// ====================================
window.Navigation = Navigation;
window.switchTab = switchTab;

// ====================================
// SHORTCUTS
// ====================================
const Shortcuts = {
    CATALOG: [
        { label: 'Buscador',             tab: 'buscador',     sectionId: null,                    module: null },
        { label: 'Decks Guardados',      tab: 'mideck',       sectionId: 'saved-decks-sec',       module: 'Deck' },
        { label: 'Mi Deck - Notas',      tab: 'mideck',       sectionId: 'notes-sec',             module: 'Deck' },
        { label: 'Análisis vs Meta',     tab: 'estadisticas', sectionId: 'deck-analysis-sec',     module: 'Estadisticas' },
        { label: 'Internal Score',       tab: 'estadisticas', sectionId: 'deck-stats-sec',        module: 'Estadisticas' },
        { label: 'Winrate',              tab: 'estadisticas', sectionId: 'winrate-sec',           module: 'Estadisticas' },
        { label: 'Top Tier',             tab: 'estadisticas', sectionId: 'top-tier-sec',          module: 'Estadisticas' },
        { label: 'Decks del Meta',       tab: 'estadisticas', sectionId: 'meta-decks-sec',        module: 'Estadisticas' },
        { label: 'Poder de Cartas',      tab: 'estadisticas', sectionId: 'power-scores-sec',      module: 'Estadisticas' },
        { label: 'Counter-Cards',        tab: 'estadisticas', sectionId: 'counter-cards-sec',     module: 'Estadisticas' },
        { label: 'Exportar Datos',       tab: 'estadisticas', sectionId: 'export-sec',            module: 'Estadisticas' },
        { label: 'Nivel Duelista',       tab: 'estadisticas', sectionId: 'duelista-sec',          module: 'Estadisticas' },
        { label: 'Roles',                tab: 'config',       sectionId: 'roles-section',         module: 'Config' },
        { label: 'Mecánicas y Counters', tab: 'config',       sectionId: 'specialties-section',   module: 'Config' },
        { label: 'Staples',              tab: 'config',       sectionId: 'staples-section',       module: 'Config' },
        { label: 'Nomenclatura',         tab: 'config',       sectionId: 'nomenclature-section',  module: 'Config' },
        { label: 'Pilares',              tab: 'config',       sectionId: 'pillars-section',       module: 'Config' }
    ],

    init: function () {
        this._createButton();
    },

    _createButton: function () {
        if (document.getElementById('shortcuts-float-btn')) return;
        const btn = document.createElement('button');
        btn.id        = 'shortcuts-float-btn';
        btn.className = 'shortcuts-float-btn';
        btn.innerHTML = '⚡';
        btn.title     = 'Accesos rápidos';
        btn.onclick   = (e) => { e.stopPropagation(); this.toggleMenu(); };
        document.body.appendChild(btn);
    },

    toggleMenu: function () {
        document.getElementById('shortcuts-overlay') ? this.closeMenu() : this.openMenu();
    },

    openMenu: function () {
        this.closeMenu();

        const shortcuts = window.ConfigManager?.getShortcuts?.() || this.CATALOG.slice(0, 4);

        // Overlay con fondo oscuro
        const overlay = document.createElement('div');
        overlay.id        = 'shortcuts-overlay';
        overlay.className = 'shortcuts-overlay';
        overlay.onclick   = () => this.closeMenu();

        // Panel centrado
        const menu = document.createElement('div');
        menu.className = 'shortcuts-menu';
        menu.onclick   = (e) => e.stopPropagation();

        menu.innerHTML = `
            <div class="shortcuts-menu-title">Accesos Rápidos</div>
            ${shortcuts.map((s, i) => `
                <button class="shortcuts-menu-item" onclick="Shortcuts.go(${i})">
                    ${s.label}
                </button>`).join('')}`;

        overlay.appendChild(menu);
        document.body.appendChild(overlay);
    },

    closeMenu: function () {
        const o = document.getElementById('shortcuts-overlay');
        if (o) o.remove();
    },

    go: function (index) {
        const shortcuts = window.ConfigManager?.getShortcuts?.() || this.CATALOG.slice(0, 4);
        const s = shortcuts[index];
        if (!s) return;
        this.closeMenu();

        if (window.Navigation) Navigation.showTab(s.tab);

        if (s.sectionId) {
            setTimeout(() => {
                const el = document.getElementById(s.sectionId);
                if (!el) return;
                if (el.style.display === 'none' || el.style.display === '') {
                    el.style.display = 'block';
                }
                if (s.sectionId === 'winrate-sec'    && window.Winrate)      Winrate.refreshSection();
                if (s.sectionId === 'duelista-sec'   && window.Duelista)     Duelista.refreshSection();
                if (s.sectionId === 'top-tier-sec'   && window.Estadisticas) Estadisticas._refreshTopTier();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        }
    }
};

window.Shortcuts = Shortcuts;
document.addEventListener('DOMContentLoaded', () => Shortcuts.init());
