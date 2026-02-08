/* ====================================
   NAVIGATION MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Manejo de navegación entre pestañas
   ==================================== */

/**
 * Objeto Navigation
 * Controla toda la lógica de navegación entre pestañas
 */
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
        Logger.functionStart('Navigation', 'init');
        
        // Registrar todos los botones de navegación
        const navButtons = document.querySelectorAll('.nav-button');
        Logger.info('Navigation', `${navButtons.length} botones de navegación encontrados`);
        
        // Verificar que la pestaña actual esté visible
        this.showTab(this.currentTab);
        
        Logger.functionEnd('Navigation', 'init');
        Logger.success('Navigation', 'Módulo de navegación inicializado correctamente');
    },

    /**
     * Cambiar a una pestaña específica
     * @param {string} tabName - Nombre de la pestaña a mostrar
     * @returns {boolean} - true si se cambió correctamente, false si hubo error
     */
    showTab: function(tabName) {
        Logger.functionStart('Navigation', 'showTab', { tabName });

        // Validar que la pestaña existe
        if (!this.tabs.includes(tabName)) {
            Logger.error('Navigation', `Pestaña "${tabName}" no existe`, { availableTabs: this.tabs });
            return false;
        }

        // PASO 1: Ocultar todas las pestañas de contenido
        const allContents = document.querySelectorAll('.tab-content');
        allContents.forEach(content => {
            content.classList.remove('active');
        });
        Logger.debug('Navigation', 'Todas las pestañas de contenido ocultadas');

        // PASO 2: Desactivar todos los botones de navegación
        const allButtons = document.querySelectorAll('.nav-button');
        allButtons.forEach(button => {
            button.classList.remove('active');
        });
        Logger.debug('Navigation', 'Todos los botones desactivados');

        // PASO 3: Mostrar la pestaña de contenido seleccionada
        const selectedContent = document.getElementById(`${tabName}-content`);
        if (selectedContent) {
            selectedContent.classList.add('active');
            Logger.success('Navigation', `Pestaña de contenido "${tabName}" mostrada`);
        } else {
            Logger.error('Navigation', `Contenido de pestaña "${tabName}" no encontrado en el DOM`);
            return false;
        }

        // PASO 4: Activar el botón de navegación correspondiente
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
            Logger.debug('Navigation', `Botón "${tabName}" activado`);
        } else {
            Logger.warning('Navigation', `Botón para "${tabName}" no encontrado`);
        }

        // PASO 5: Actualizar pestaña actual y registrar cambio
        const previousTab = this.currentTab;
        this.currentTab = tabName;
        
        Logger.info('Navigation', `Navegación completada: ${previousTab} → ${tabName}`);
        Logger.functionEnd('Navigation', 'showTab', { success: true, currentTab: tabName });

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
        
        Logger.event('Navigation', 'PREVIOUS_TAB', previousTab);
        this.showTab(previousTab);
    },

    /**
     * Ir a la pestaña siguiente (navegación circular)
     */
    nextTab: function() {
        const currentIndex = this.tabs.indexOf(this.currentTab);
        const nextIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
        const nextTab = this.tabs[nextIndex];
        
        Logger.event('Navigation', 'NEXT_TAB', nextTab);
        this.showTab(nextTab);
    }
};

/**
 * FUNCIÓN GLOBAL: switchTab
 * Esta función es llamada directamente desde los botones HTML (onclick)
 * Debe estar en el scope global (window) para ser accesible
 * 
 * @param {string} tabName - Nombre de la pestaña a mostrar
 */
function switchTab(tabName) {
    // Obtener información del botón que fue clickeado
    const button = document.querySelector(`[data-tab="${tabName}"]`);
    const buttonText = button ? button.textContent.trim() : tabName;
    const buttonId = button ? button.getAttribute('data-tab') : tabName;
    
    // Registrar el click del botón en el logger
    Logger.buttonClick(buttonId, buttonText, 'Navigation');
    
    // Ejecutar el cambio de pestaña
    Navigation.showTab(tabName);
}

// ====================================
// INICIALIZACIÓN AUTOMÁTICA
// ====================================

/**
 * Inicializar cuando el DOM esté listo
 * Usa diferentes métodos según el estado del documento
 */
if (document.readyState === 'loading') {
    // DOM aún cargando - esperar evento DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        Navigation.init();
    });
} else {
    // DOM ya está listo - inicializar inmediatamente
    Navigation.init();
}

// ====================================
// EXPORTAR AL SCOPE GLOBAL
// Hacer accesibles las funciones desde cualquier parte
// ====================================
window.Navigation = Navigation;
window.switchTab = switchTab;

/**
 * NOTA IMPORTANTE:
 * La función switchTab DEBE estar en el scope global (window)
 * porque es llamada directamente desde atributos onclick en el HTML.
 * No funcionará si solo está dentro de un módulo ES6 o closure.
 */
