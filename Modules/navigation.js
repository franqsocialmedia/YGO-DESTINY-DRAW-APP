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
