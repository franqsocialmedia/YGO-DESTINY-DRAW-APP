/* core.js — Infraestructura base: logger stub, navegación, scroll, visibilidad por perfil */
/* NOTA: logger.js y parallax.js se mantienen como archivos separados (no subidos en esta sesión) */

// ── SAFE LOGGER ─────────────────────────────────────────────────────
// Stub de Logger para que los módulos no rompan si logger.js no carga primero
const SafeLogger = window.Logger || {
    functionStart(){}, functionEnd(){}, info(){}, success(){},
    error(){}, warning(){}, debug(){}, event(){}, buttonClick(){}
};

// ── NAVIGATION ──────────────────────────────────────────────────────
// Controla el cambio de pestañas principales y notifica a cada módulo al activarse
const Navigation = {
    currentTab: 'lobby',
    tabs: ['lobby', 'buscador', 'mideck', 'estadisticas', 'simuladores', 'formacion', 'config'],

    // Registra clicks en botones nav y muestra la pestaña inicial
    init: function() {
        SafeLogger.functionStart('Navigation', 'init');
        requestAnimationFrame(() => {
            document.querySelectorAll('.nav-button').forEach(button => {
                button.addEventListener('click', () => {
                    const tab = button.dataset.tab;
                    SafeLogger.buttonClick(tab, button.textContent.trim(), 'Navigation');
                    this.showTab(tab);
                });
            });
            this.showTab(this.currentTab);
        });
        SafeLogger.functionEnd('Navigation', 'init');
    },

    // Activa la sección visible, notifica módulos y aplica visibilidad de ContentManager
    showTab: function(tabName) {
        SafeLogger.functionStart('Navigation', 'showTab', { tabName });

        if (!this.tabs.includes(tabName)) {
            SafeLogger.error('Navigation', `Pestaña "${tabName}" no existe`);
            return false;
        }

        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));

        const selectedContent = document.getElementById(`${tabName}-content`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        } else {
            SafeLogger.error('Navigation', `Contenido "${tabName}" no encontrado`);
            return false;
        }

        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) selectedButton.classList.add('active');

        const previousTab = this.currentTab;
        this.currentTab = tabName;

        if (window.Estadisticas && typeof Estadisticas.updateFloatingWidgetVisibility === 'function') {
            Estadisticas.updateFloatingWidgetVisibility(tabName);
        }
        if (window.Deck && typeof Deck.updateSaveFloatingBtnVisibility === 'function') {   
            Deck.updateSaveFloatingBtnVisibility(tabName);                                  
        }                                                                                    
        if (tabName === 'simuladores' && window.Torneo) Torneo.init();
        if (tabName === 'mideck' && window.Engines) Engines.init();
        if (previousTab === 'simuladores' && tabName !== 'simuladores' && window.ZonaPractica) {
            ZonaPractica._cleanupFloatBtns?.();
        }
        if (tabName === 'meta' && window.Meta) Meta.init();
        if (tabName === 'formacion' && window.Formacion) Formacion.init();
        if (tabName === 'lobby' && window.Lobby) Lobby.init();

        SafeLogger.functionEnd('Navigation', 'showTab', { success: true, currentTab: tabName });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof updateButtons === 'function') updateButtons();
        window.dispatchEvent(new Event('scroll'));
        if (window.ContentManager) ContentManager.applyAll();
        if (window.TabIntro) TabIntro.maybeShow(tabName);

        return true;
    },

    getCurrentTab: function() { return this.currentTab; },

    previousTab: function() {
        const i = this.tabs.indexOf(this.currentTab);
        this.showTab(this.tabs[i > 0 ? i - 1 : this.tabs.length - 1]);
    },

    nextTab: function() {
        const i = this.tabs.indexOf(this.currentTab);
        this.showTab(this.tabs[i < this.tabs.length - 1 ? i + 1 : 0]);
    }
};

// Función global llamada desde botones HTML onclick
function switchTab(tabName) {
    SafeLogger.buttonClick(tabName, tabName, 'Navigation');
    Navigation.showTab(tabName);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Navigation.init());
} else {
    Navigation.init();
}

window.Navigation = Navigation;
window.switchTab  = switchTab;

// ── TAB INTRO ────────────────────────────────────────────────────────
// Panel flotante informativo por pestaña, 1 vez por sesión (sessionStorage).
// Z-index queda por debajo de #welcome-overlay para que el flujo sea:
// Nivel de jugador (Welcome) → se cierra → aparece esta intro de la pestaña.
const TabIntro = {
    CONTENT: {
        buscador: {
            title: '🔍 Buscador de Cartas',
            items: [
                'Busca cualquier carta oficial del TCG/OCG por nombre.',
                'Filtra por arquetipo, set, tipo de monstruo, atributo y más.',
                'Añade cartas directo a tu Deck activo con un clic.',
                'Marca cartas como Favoritas para acceso rápido.',
                'Usa "Carta Random" para descubrir cartas nuevas.'
            ]
        },
        mideck: {
            title: '🗂️ Mi Deck',
            items: [
                'Importa tu deck desde archivo .ydk o desde la Lista Oficial en .pdf.',
                'Arma y edita tu Main, Extra y Side Deck.',
                'Consulta tu Internal Score, Consistencia, Potencia y Resiliencia en tiempo real.',
                'Registra rondas en Optimización para medir tu nivel real como piloto del deck.',
                'Lleva el historial de enfrentamientos por rival en Matchups.',
                'Mapea tu Línea de Combos por zonas y simulala paso a paso.'
            ]
        },
        estadisticas: {
            title: '📊 Estadísticas',
            items: [
                'Analiza tu deck activo: fortalezas, debilidades y matchups del meta.',
                'Consulta tu Nivel como Piloto del Deck (Duelista).',
                'Compara tu Internal Score contra los decks del meta actualizados.'
            ]
        },
        simuladores: {
            title: '🎲 Simuladores',
            items: [
                'Calcula probabilidades de mano inicial con Hipergeometría.',
                'Simula torneos Swiss completos con tu deck.',
                'Practica manos en la Zona de Práctica y Duelo en Vivo.',
                'Registra winrates y experimenta variantes de tu lista.',
                'Busca counters a las cartas del rival en Counters, o testea tu pool contra el meta en Gauntlet.'
            ]
        },
        formacion: {
            title: '🎓 Formación',
            items: [
                'Aprende mecánicas y conceptos del juego competitivo.',
                'Consulta Fuentes recomendadas y Maestros del Duelo del meta actual.',
                'Guarda tus propios apuntes de estrategia.',
                'Descubre juegos alternativos de Yu-Gi-Oh! para practicar.',
                'Ponte a prueba con Tests de Duelo, o descubre tu Estilo y Personaje afín.',
                'Carga un deck listo desde Primeros Decks si recién empiezas.'
            ]
        },
        config: {
            title: '⚙️ Configuración',
            items: [
                'Personaliza roles, nomenclatura de efectos y pesos del Internal Score.',
                'Ajusta el Scoring Avanzado G1/G2 a tu criterio competitivo.',
                'Gestiona la Banlist del formato que juegas.',
                'Exporta/Importa toda tu configuración y datos.'
            ]
        }
    },

    _key: function(tab) { return `dd_tabintro_shown_${tab}`; },
    _disabledKey: 'dd_tabintro_disabled',

    getDisabledMap: function() {
        try { return JSON.parse(localStorage.getItem(this._disabledKey)) || {}; }
        catch { return {}; }
    },

    isDisabled: function(tab) { return !!this.getDisabledMap()[tab]; },

    setDisabled: function(tab, disabled) {
        const map = this.getDisabledMap();
        if (disabled) map[tab] = true; else delete map[tab];
        localStorage.setItem(this._disabledKey, JSON.stringify(map));
    },

    maybeShow: function(tabName) {
        const data = this.CONTENT[tabName];
        if (!data) return;
        if (this.isDisabled(tabName)) return;
        if (sessionStorage.getItem(this._key(tabName)) === 'true') return;
        sessionStorage.setItem(this._key(tabName), 'true');
        this._render(tabName, data);
    },

    _render: function(tabName, data) {
        const overlay = document.createElement('div');
        overlay.className = 'tabintro-overlay';
        overlay.id = `tabintro-overlay-${tabName}`;
        overlay.innerHTML = `
            <div class="tabintro-panel">
                <button class="tabintro-x-btn" onclick="TabIntro.close('${tabName}')" title="Cerrar" aria-label="Cerrar">✕</button>
                <div class="tabintro-header">
                    <span class="tabintro-eyebrow">Guía rápida</span>
                    <h3 class="tabintro-title">${data.title}</h3>
                </div>
                <ul class="tabintro-list">
                    ${data.items.map((i, idx) => `
                        <li class="tabintro-item">
                            <span class="tabintro-item-num">${idx + 1}</span>
                            <span class="tabintro-item-text">${i}</span>
                        </li>`).join('')}
                </ul>
                <div class="tabintro-footer">
                    <label class="tabintro-disable-label">
                        <span class="tabintro-toggle">
                            <input type="checkbox" onchange="TabIntro.setDisabled('${tabName}', this.checked)">
                            <span class="tabintro-toggle-track"><span class="tabintro-toggle-thumb"></span></span>
                        </span>
                        No volver a mostrar esta intro
                    </label>
                    <button class="tabintro-close-btn" onclick="TabIntro.close('${tabName}')">Entendido</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    close: function(tabName) {
        const overlay = document.getElementById(`tabintro-overlay-${tabName}`);
        if (!overlay) return;
        overlay.classList.add('tabintro-hiding');
        setTimeout(() => overlay.remove(), 180);
    }
};

window.TabIntro = TabIntro;


// ── SHORTCUTS ────────────────────────────────────────────────────────
// Botón flotante ⚡ con menú de accesos rápidos configurables
const Shortcuts = {
    CATALOG: [
        // ── Lobby ──
        { label: 'Lobby',                        tab: 'lobby' },
        { label: 'Lobby - Lo Nuevo',              tab: 'lobby',        sectionId: 'lobby-nuevo-section' },
        { label: 'Lobby - Sugerencias',           tab: 'lobby',        sectionId: 'lobby-sugerencias-section' },

        // ── Buscador ──
        { label: 'Buscador',                     tab: 'buscador' },

        // ── Mi Deck ──
        { label: 'Mi Deck',                      tab: 'mideck' },
        { label: 'Mi Deck - Import/Export',      tab: 'mideck',       steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'importar' }] },
        { label: 'Mi Deck - Decklist',           tab: 'mideck',       steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'decklist' }] },
        { label: 'Mi Deck - Tu Experiencia con el Deck', tab: 'mideck', steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'decklist' }], sectionId: 'experiencia-sec' },
        { label: 'Mi Deck - Historial de Versiones',     tab: 'mideck', steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'decklist' }], sectionId: 'versiones-sec' },
        { label: 'Mi Deck - Construcción',       tab: 'mideck',       steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'construccion' }] },
        { label: 'Mi Deck - Complejidad (resultado)', tab: 'mideck',  steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'construccion' }], sectionId: 'construccion-complejidad-box' },
        { label: 'Mi Deck - Análisis vs Meta',   tab: 'mideck',       steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'construccion' }], sectionId: 'construccion-deck-analysis-sec' },
        { label: 'Mi Deck - Optimización',       tab: 'mideck',       steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'optimizacion' }] },
        { label: 'Mi Deck - Nivel como Piloto',  tab: 'mideck',       steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'optimizacion' }], sectionId: 'piloto-sec' },
        { label: 'Mi Deck - Complejidad (evaluar)', tab: 'mideck',    steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'optimizacion' }], sectionId: 'cxd-sec' },
        { label: 'Mi Deck - Notas del Deck',     tab: 'mideck',       steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'optimizacion' }], sectionId: 'notes-sec' },
        { label: 'Mi Deck - Cartas Clave y Amenazas', tab: 'mideck',  steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'optimizacion' }], sectionId: 'topcards-sec' },
        { label: 'Mi Deck - Historial de Enfrentamientos', tab: 'mideck', steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'optimizacion' }], sectionId: 'matchups-sec' },
        { label: 'Mi Deck - Línea de Combos',    tab: 'mideck',       steps: [{ fn: 'Deck.switchMiDeckTab', arg: 'combos' }] },

        // ── Estadísticas ──
        { label: 'Estadísticas',                 tab: 'estadisticas' },
        { label: 'Estadísticas - Top Tier',      tab: 'estadisticas', sectionId: 'top-tier-sec' },
        { label: 'Estadísticas - Carpetas del Meta', tab: 'estadisticas', sectionId: 'meta-management-sec' },
        { label: 'Estadísticas - Decks del Meta', tab: 'estadisticas', sectionId: 'meta-decks-sec' },
        { label: 'Estadísticas - Recurrencia de Cartas', tab: 'estadisticas', sectionId: 'meta-card-stats-sec' },
        { label: 'Estadísticas - Poder de Cartas del Meta', tab: 'estadisticas', sectionId: 'power-scores-sec' },
        { label: 'Estadísticas - Exportar Datos', tab: 'estadisticas', sectionId: 'export-sec' },

        // ── Simuladores ──
        { label: 'Simuladores - Mulligan',              tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'mulligan' }] },
        { label: 'Simuladores - Mulligan con Mis Decks', tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'mulligan' }, { fn: 'Hipergeometria.switchTab', arg: 'deck' }] },
        { label: 'Simuladores - Prueba Mulligan',        tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'mulligan' }, { fn: 'Hipergeometria.switchTab', arg: 'mul' }] },
        { label: 'Simuladores - Winrate',        tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'winrate' }], sectionId: 'winrate-sec' },
        { label: 'Simuladores - Torneo (Swiss)', tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'torneo' }] },
        { label: 'Simuladores - Duelo en Vivo',  tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'duelo' }] },
        { label: 'Simuladores - Counters',       tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'counters' }] },
        { label: 'Simuladores - Gauntlet',       tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'gauntlet' }] },
        { label: 'Simuladores - Experimentación', tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'experimentacion' }] },
        { label: 'Simuladores - Zona de Práctica', tab: 'simuladores', steps: [{ fn: 'Torneo.showSimTab', arg: 'practica' }] },

        // ── Formación ──
        { label: 'Formación - Apuntes',          tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'apuntes' }] },
        { label: 'Formación - Temas',            tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'temas' }] },
        { label: 'Formación - Historia del Meta', tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'historia' }] },
        { label: 'Formación - Test',             tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'test' }] },
        { label: 'Formación - Tu Estilo',        tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'estilo' }] },
        { label: 'Formación - Tu Personaje',     tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'personaje' }] },
        { label: 'Formación - Primeros Decks',   tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'decks' }] },
        { label: 'Formación - Juegos',           tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'juegos' }] },
        { label: 'Formación - Fuentes',          tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'fuentes' }] },
        { label: 'Formación - Maestros',         tab: 'formacion', steps: [{ fn: 'Formacion.switchTab', arg: 'maestros' }] },

        // ── Config ──
        { label: 'Mecánicas y Roles',            tab: 'config', sectionId: 'roles-section',                  module: 'Config' },
        { label: 'Counters',                     tab: 'config', sectionId: 'specialties-section',            module: 'Config' },
        { label: 'Lista de Staples',             tab: 'config', sectionId: 'staples-section',                module: 'Config' },
        { label: 'Nomenclatura de Efectos',      tab: 'config', sectionId: 'nomenclature-section',           module: 'Config' },
        { label: 'Pilares del Internal Score',   tab: 'config', sectionId: 'pillars-section',                module: 'Config' },
        { label: 'Scoring Avanzado (G1/G2)',     tab: 'config', sectionId: 'scoring-section',                module: 'Config' },
        { label: 'Rendimientos Decrecientes',    tab: 'config', sectionId: 'diminishing-section',            module: 'Config' },
        { label: 'Atajos Rápidos',               tab: 'config', sectionId: 'shortcuts-section',              module: 'Config' },
        { label: 'Banlist del Formato',          tab: 'config', sectionId: 'banlist-section',                module: 'Config' },
        { label: 'Ajustes de Música',            tab: 'config', sectionId: 'music-section',                  module: 'Config' },
        { label: 'Intro de Pestañas',            tab: 'config', sectionId: 'tabintro-section',               module: 'Config' },
        { label: 'Maestros del Duelo',           tab: 'config', sectionId: 'meta-masters-config-section',    module: 'Config' },
        { label: 'Fuentes del Meta (Config)',    tab: 'config', sectionId: 'meta-links-config-section',      module: 'Config' },
        { label: 'Juegos Alternativos',          tab: 'config', sectionId: 'formacion-games-config-section', module: 'Config' },
        { label: 'Temas de Formación',           tab: 'config', sectionId: 'formacion-topics-section',       module: 'Config' },
        { label: 'Test de Duelo (Config)',       tab: 'config', sectionId: 'test-duelo-section',             module: 'Config' },
        { label: 'Contenido de la App',          tab: 'config', sectionId: null,                             module: 'Config' },
        { label: 'Zona de Borrado',              tab: 'config', sectionId: 'config-danger-zone',             module: 'Config' },
    ],

    init: function() { this._createButton(); },

    _createButton: function() {
        if (document.getElementById('shortcuts-float-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'shortcuts-float-btn';
        btn.className = 'shortcuts-float-btn';
        btn.innerHTML = '⚡';
        btn.title = 'Accesos rápidos';
        btn.onclick = (e) => { e.stopPropagation(); this.toggleMenu(); };
        (document.getElementById('bottom-toolbar') || document.body).appendChild(btn);
    },

    toggleMenu: function() {
        document.getElementById('shortcuts-overlay') ? this.closeMenu() : this.openMenu();
    },

    openMenu: function() {
        this.closeMenu();
        const shortcuts = window.ConfigManager?.getShortcuts?.() || this.CATALOG.slice(0, 4);
        const overlay = document.createElement('div');
        overlay.id = 'shortcuts-overlay';
        overlay.className = 'shortcuts-overlay';
        overlay.onclick = () => this.closeMenu();
        const menu = document.createElement('div');
        menu.className = 'shortcuts-menu';
        menu.onclick = (e) => e.stopPropagation();
        menu.innerHTML = `
            <div class="shortcuts-menu-title">Accesos Rápidos</div>
            ${shortcuts.map((s, i) => `
                <button class="shortcuts-menu-item" onclick="Shortcuts.go(${i})">${s.label}</button>
            `).join('')}`;
        overlay.appendChild(menu);
        document.body.appendChild(overlay);
    },

    closeMenu: function() {
        document.getElementById('shortcuts-overlay')?.remove();
    },

    // Ejecuta s.steps en cadena (ej: cambiar sub-pestaña de Mi Deck/Simuladores/Formación)
    _runSteps: function(steps, i) {
        if (!steps || i >= steps.length) return;
        const step = steps[i];
        const fn = step.fn.split('.').reduce((o, k) => o && o[k], window);
        if (typeof fn === 'function') fn(step.arg);
        setTimeout(() => this._runSteps(steps, i + 1), 60);
    },

    // Navega a la pestaña, ejecuta los pasos de sub-navegación y hace scroll a la sección
    go: function(index) {
        const shortcuts = window.ConfigManager?.getShortcuts?.() || this.CATALOG.slice(0, 4);
        const s = shortcuts[index];
        if (!s) return;
        this.closeMenu();
        if (window.Navigation) Navigation.showTab(s.tab);

        setTimeout(() => {
            if (s.steps) this._runSteps(s.steps, 0);

            if (s.sectionId) {
                const delay = 60 + (s.steps ? s.steps.length * 60 : 0);
                setTimeout(() => {
                    const el = document.getElementById(s.sectionId);
                    if (!el) return;
                    if (!el.style.display || el.style.display === 'none') el.style.display = 'block';
                    if (s.sectionId === 'winrate-sec' && window.Winrate)      Winrate.refreshSection();
                    if (s.sectionId === 'piloto-sec'  && window.Duelista)     Duelista.refreshSection();
                    if (s.sectionId === 'top-tier-sec' && window.Estadisticas) Estadisticas._refreshTopTier();
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, delay);
            }
        }, 80);
    }
};

window.Shortcuts = Shortcuts;
document.addEventListener('DOMContentLoaded', () => Shortcuts.init());


// ── UTILS (SCROLL BUTTONS) ────────────────────────────────────────────
// Botones flotantes ▲▼ de scroll, se ocultan en la pestaña Simuladores
document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn    = document.getElementById('scrollTopBtn');
    const scrollBottomBtn = document.getElementById('scrollBottomBtn');
    if (!scrollTopBtn || !scrollBottomBtn) return;

    const updateButtons = () => {
        const inSim = window.Navigation?.currentTab === 'simuladores';
        if (inSim) {
            scrollTopBtn.style.display    = 'none';
            scrollBottomBtn.style.display = 'none';
            return;
        }
        const scrolled  = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollTopBtn.style.display    = scrolled > 300 ? 'block' : 'none';
        scrollBottomBtn.style.display = scrolled < maxScroll - 50 ? 'block' : 'none';
    };

    window.addEventListener('scroll', updateButtons);
    updateButtons();
    scrollTopBtn.addEventListener('click',    () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    scrollBottomBtn.addEventListener('click', () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }));
});

// ── CONTENT MANAGER ──────────────────────────────────────────────────
// Controla la visibilidad de secciones según perfil (novato/casual/competitivo)
const ContentManager = {

    STORAGE_KEY: 'dd_content_visibility',
    PROFILE_KEY: 'dd_player_profile',

    CATALOG: [
        { id: 'tab-estadisticas',  group: 'Pestañas', label: 'Estadísticas',  type: 'tab', novato: false, casual: false, competitivo: true },
        { id: 'tab-simuladores',   group: 'Pestañas', label: 'Simuladores',   type: 'tab', novato: true,  casual: true,  competitivo: true },
        { id: 'tab-formacion',     group: 'Pestañas', label: 'Formación',     type: 'tab', novato: true,  casual: true,  competitivo: true },

        { id: 'buscador-archetypes', group: 'Buscador', label: 'Filtro por Arquetipos',      novato: false, casual: true,  competitivo: true },
        { id: 'buscador-keywords',   group: 'Buscador', label: 'Filtrar por palabras clave', novato: false, casual: true,  competitivo: true },
        { id: 'buscador-sets',       group: 'Buscador', label: 'Packs y Sets',               novato: false, casual: true,  competitivo: true },

        { id: 'cv-nomenclature', group: 'Vista de Carta', label: 'Nomenclatura de Efectos',  novato: false, casual: false,  competitivo: true },
        { id: 'cv-roles',        group: 'Vista de Carta', label: 'Posibles Roles',            novato: false, casual: false,  competitivo: true },
        { id: 'cv-contribution', group: 'Vista de Carta', label: 'Aporte al Deck Activo',     novato: false, casual: true, competitivo: true },
        { id: 'cv-staple-btn',   group: 'Vista de Carta', label: 'Botón Volver Staple',       novato: false, casual: true,  competitivo: true },
        { id: 'cv-lore',         group: 'Vista de Carta', label: 'Lore de la Carta (Yugipedia)', novato: true, casual: false, competitivo: true },

        { id: 'deck-floating-widget', group: 'Mi Deck', label: 'Widget flotante de Decks',       novato: false, casual: true, competitivo: true },
        { id: 'deck-chart',           group: 'Mi Deck', label: 'Gráfica y Composición',          novato: false, casual: true, competitivo: true },
        { id: 'deck-roles-badges',    group: 'Mi Deck', label: 'Roles de cartas (badges)',       novato: false, casual: false, competitivo: true },
        { id: 'deck-engines',         group: 'Mi Deck', label: 'Sidebar de Engines',            novato: true, casual: true, competitivo: true },
        { id: 'deck-role-btn',        group: 'Mi Deck', label: 'Botón Rol (por carta)',          novato: false, casual: true, competitivo: true },
        { id: 'deck-experimentacion', group: 'Mi Deck', label: 'Botón Experimentación',          novato: false, casual: false, competitivo: true },
        { id: 'deck-matchups',        group: 'Mi Deck', label: 'Historial de Enfrentamientos',   novato: true, casual: true, competitivo: true },
        { id: 'deck-piloto',          group: 'Mi Deck', label: 'Nivel como Piloto del Deck',      novato: false, casual: true, competitivo: true },
        { id: 'deck-complejidad',     group: 'Mi Deck', label: 'Complejidad del Deck',            novato: false, casual: false, competitivo: true },
        { id: 'deck-experiencia',     group: 'Mi Deck', label: 'Tu Experiencia con el Deck',      novato: false, casual: true, competitivo: true },
        { id: 'deck-topcards',        group: 'Mi Deck', label: 'Cartas Clave y Amenazas',         novato: false, casual: false, competitivo: true },
        { id: 'deck-versiones',       group: 'Mi Deck', label: 'Historial de Versiones',          novato: false, casual: false, competitivo: true },
        { id: 'deck-combos',          group: 'Mi Deck', label: 'Línea de Combos',                 novato: false, casual: true, competitivo: true },
        { id: 'deck-opt-history',     group: 'Mi Deck', label: 'Historial de Sesiones',           novato: false, casual: false, competitivo: true },
        { id: 'deck-notas',          group: 'Mi Deck', label: 'Notas del Deck',                  novato: true,  casual: true, competitivo: true },

        { id: 'sim-mulligan',         group: 'Simuladores', label: 'Mulligan / Hipergeometría',          novato: false, casual: false, competitivo: true },
        { id: 'sim-torneo',           group: 'Simuladores', label: 'Torneo (Swiss)',                      novato: false, casual: true,  competitivo: true },
        { id: 'sim-timer',            group: 'Simuladores', label: 'Cronómetro Master Duel',              novato: false, casual: false, competitivo: true },
        { id: 'sim-experimentacion',  group: 'Simuladores', label: 'Experimentación',                     novato: false, casual: false,  competitivo: true },
        { id: 'sim-practica-history', group: 'Simuladores', label: 'Historial y Guardado de Estados',     novato: false, casual: false, competitivo: true },
        { id: 'pz-markstate-btn',     group: 'Simuladores', label: 'Botón Marcar Estado (flotante)',      novato: false, casual: false, competitivo: true },
        { id: 'sim-counters',         group: 'Simuladores', label: 'Counters (CounterSim)',              novato: false, casual: true, competitivo: true },
        { id: 'sim-gauntlet',         group: 'Simuladores', label: 'Gauntlet',                            novato: false, casual: false, competitivo: true },

        { id: 'meta-fuentes',         group: 'Formación',   label: 'Fuentes Externas del Meta',           novato: false, casual: false,  competitivo: true },

        { id: 'form-apuntes',   group: 'Formación', type: 'tab', label: 'Apuntes',           novato: true,  casual: true,  competitivo: true },
        { id: 'form-temas',     group: 'Formación', type: 'tab', label: 'Temas',             novato: true,  casual: true,  competitivo: true },
        { id: 'form-historia',  group: 'Formación', type: 'tab', label: 'Historia del Meta', novato: false, casual: true,  competitivo: true },
        { id: 'form-test',      group: 'Formación', type: 'tab', label: 'Test',              novato: false, casual: true,  competitivo: true },
        { id: 'form-estilo',    group: 'Formación', type: 'tab', label: 'Tu Estilo',         novato: true,  casual: true,  competitivo: true },
        { id: 'form-personaje', group: 'Formación', type: 'tab', label: 'Tu Personaje',      novato: true,  casual: true,  competitivo: true },
        { id: 'form-decks',     group: 'Formación', type: 'tab', label: 'Primeros Decks',    novato: true,  casual: true,  competitivo: true },
        { id: 'form-juegos',    group: 'Formación', type: 'tab', label: 'Juegos',            novato: false,  casual: true,  competitivo: true },
        { id: 'form-fuentes',   group: 'Formación', type: 'tab', label: 'Fuentes',           novato: false, casual: true,  competitivo: true },
        { id: 'form-maestros',  group: 'Formación', type: 'tab', label: 'Maestros',          novato: true,  casual: true,  competitivo: true },

        { id: 'config-roles',              group: 'Configuración', label: 'Roles y Palabras Asociadas',  novato: false, casual: false,  competitivo: true },
        { id: 'config-specialties',        group: 'Configuración', label: 'Mecánicas y Counters',        novato: false, casual: false, competitivo: true },
        { id: 'config-staples',            group: 'Configuración', label: 'Lista de Staples',            novato: true, casual: true,  competitivo: true },
        { id: 'config-nomenclature',       group: 'Configuración', label: 'Nomenclatura de Efectos',     novato: false, casual: false,  competitivo: true },
        { id: 'config-pillars',            group: 'Configuración', label: 'Pilares del Internal Score',  novato: false, casual: false,  competitivo: true },
        { id: 'config-diminishing',        group: 'Configuración', label: 'Rendimientos Decrecientes',   novato: false, casual: false, competitivo: true },
        { id: 'config-shortcuts',          group: 'Configuración', label: 'Atajos Rápidos',              novato: true,  casual: true,  competitivo: true },
        { id: 'config-banlist',            group: 'Configuración', label: 'Banlist del Formato',         novato: false,  casual: true,  competitivo: true },
        { id: 'config-music',              group: 'Configuración', label: 'Ajustes de Música',           novato: true,  casual: true,  competitivo: true },
        { id: 'config-meta-masters',       group: 'Configuración', label: 'Maestros del Duelo',          novato: false,  casual: false,  competitivo: true },
        { id: 'config-meta-links',         group: 'Configuración', label: 'Fuentes Externas del Meta',   novato: false, casual: false,  competitivo: true },
        { id: 'config-formacion-games',    group: 'Configuración', label: 'Juegos Alternativos',         novato: false,  casual: false,  competitivo: true },
        { id: 'config-formacion-topics',   group: 'Configuración', label: 'Temas de Formación',          novato: false,  casual: true,  competitivo: true },
        { id: 'config-scoring',            group: 'Configuración', label: 'Scoring Avanzado (G1/G2)',    novato: false, casual: false, competitivo: true },
        { id: 'config-tabintro',           group: 'Configuración', label: 'Intro de Pestañas',           novato: true,  casual: true,  competitivo: true },
        { id: 'config-test-duelo',         group: 'Configuración', label: 'Test de Duelo',               novato: false,  casual: false,  competitivo: true },
        { id: 'config-danger-zone',     group: 'Configuración', label: 'Zona de Borrado',             novato: false, casual: false,  competitivo: true },
        { id: 'config-danger-delete',   group: 'Configuración', label: '↳ Botón Borrar Decks',        novato: false, casual: false,  competitivo: true },
    ],
// ── FONDO DE LA APP (Config > Contenido de la App) ──
    BG_THEME_KEY: 'dd_bg_theme',
    BG_THEMES: [
        { id: 'purple', label: 'Morado Oscuro', swatch: '#2d0a4e' },
        { id: 'wine',   label: 'Rojo Vino',     swatch: '#4e0e1a' },
        { id: 'black',  label: 'Negro',         swatch: '#1a1a1a' },
        { id: 'navy',   label: 'Azul Navy',     swatch: '#001233' },
    ],

    getBgTheme: function() {
        return localStorage.getItem(this.BG_THEME_KEY) || 'purple';
    },

    setBgTheme: function(themeId) {
        if (!this.BG_THEMES.some(t => t.id === themeId)) themeId = 'purple';
        localStorage.setItem(this.BG_THEME_KEY, themeId);
        this.applyBgTheme(themeId);
    },

    applyBgTheme: function(themeId) {
        const theme = themeId || this.getBgTheme();
        if (theme === 'purple') document.body.removeAttribute('data-bg-theme');
        else document.body.setAttribute('data-bg-theme', theme);
    },

    renderBgThemeUI: function() {
        const current = this.getBgTheme();
        return `
            <div class="cm-theme-row">
                ${this.BG_THEMES.map(t => `
                    <button class="cm-theme-swatch ${current === t.id ? 'cm-theme-active' : ''}"
                            style="background:${t.swatch}"
                            title="${t.label}"
                            onclick="ContentManager.setBgTheme('${t.id}'); ContentManager._refreshBgThemeUI();"></button>
                `).join('')}
            </div>
            <div class="cm-theme-labels">
                ${this.BG_THEMES.map(t => `<span class="cm-theme-label">${t.label}</span>`).join('')}
            </div>`;
    },

    _refreshBgThemeUI: function() {
        const wrap = document.getElementById('cm-bgtheme-wrap');
        if (wrap) wrap.innerHTML = this.renderBgThemeUI();
    },
    _load: function() {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {}; }
        catch (_) { return {}; }
    },

    _save: function(data) { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); },

    isVisible: function(id) {
        const stored = this._load();
        if (stored[id] !== undefined) return !!stored[id];
        const item = this.CATALOG.find(c => c.id === id);
        return item ? !!item.competitivo : true;
    },

    setVisible: function(id, visible) {
        const data = this._load();
        data[id] = !!visible;
        this._save(data);
    },

    // Aplica el perfil al catálogo completo y persiste en localStorage
    applyProfile: function(level) {
        const key  = (['novato', 'casual', 'competitivo'].includes(level)) ? level : 'competitivo';
        const data = {};
        this.CATALOG.forEach(item => { data[item.id] = !!item[key]; });
        this._save(data);
        localStorage.setItem(this.PROFILE_KEY, key);
        this.applyAll();
    },

    // Devuelve el perfil activo actual
    getProfile: function() {
        return localStorage.getItem(this.PROFILE_KEY) || 'competitivo';
    },

    // Aplica visibilidad al DOM según el estado guardado
    applyAll: function() {
        const stored = this._load();
        const vis    = (id) => (stored[id] !== undefined) ? !!stored[id] : this.isVisible(id);

        // Pestañas
        this.CATALOG.filter(c => c.type === 'tab').forEach(c => {
            const btn = document.querySelector(`[data-tab="${c.id.replace('tab-', '')}"]`);
            if (btn) btn.closest('li')?.style && (btn.closest('li').style.display = vis(c.id) ? '' : 'none');
        });

        // Secciones con data-section-id
        document.querySelectorAll('[data-section-id]').forEach(el => {
            const id = el.dataset.sectionId;
            if (!id) return;
            const show = vis(id);
            el.style.display = show ? '' : 'none';
        });

        // Engines sidebar (usa id= no data-section-id)
        const enginesSidebar = document.getElementById('engines-sidebar');
        if (enginesSidebar) {
            enginesSidebar.style.display = vis('deck-engines') ? '' : 'none';
        } else if (vis('deck-engines') && window.Engines) {
            Engines.init();
        }

        // Sub-tabs de Simuladores
        this._applySimuladorSubTabs(vis);

        // Los módulos se re-renderizan sólo cuando se inicializan (al cambiar de pestaña)
        // applyAll solo controla visibility del DOM
    },

    // Oculta/muestra sub-tab buttons de Simuladores según visibilidad
    _applySimuladorSubTabs: function(vis) {
        // Cada clave del CATALOG controla qué botones de pestaña de Simuladores son visibles
        // El botón "Duelo en Vivo" tiene sub-secciones propias controladas por data-section-id
        const map = {
            'sim-mulligan':        ['mulligan', 'winrate'],
            'sim-torneo':          ['torneo'],
            'sim-experimentacion': ['experimentacion'],
            'sim-practica-history':['practica']
        };
        Object.entries(map).forEach(([sectionId, btnIds]) => {
            const show = vis(sectionId);
            btnIds.forEach(id => {
                const btn = document.querySelector(`.sim-tab-btn[data-simtab="${id}"]`);
                if (btn) btn.style.display = show ? '' : 'none';
            });
        });
        // Duelo en vivo: siempre visible si alguna sub-sección suya lo es
        // (sim-timer se controla via data-section-id dentro del panel de duelo)
        const dueloBtn = document.querySelector('.sim-tab-btn[data-simtab="duelo"]');
        if (dueloBtn) dueloBtn.style.display = '';
    },

    // Renderiza la UI de gestión de visibilidad para Config
    renderUI: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const stored  = this._load();
        const profile = this.getProfile();

        const groups = [...new Set(this.CATALOG.map(c => c.group))];

        const profileBtns = ['novato', 'casual', 'competitivo'].map(p => {
            const isActive = profile === p;
            return `<button class="cm-profile-btn ${isActive ? 'cm-profile-active' : ''}"
                            onclick="ContentManager._applyProfileUI('${p}')">${p.charAt(0).toUpperCase()+p.slice(1)}</button>`;
        }).join('');

        const groupsHtml = groups.map(group => {
            const items = this.CATALOG.filter(c => c.group === group);
            const rows  = items.map(item => {
                const checked = stored[item.id] !== undefined ? stored[item.id] : !!item.competitivo;
                return `<label class="cm-toggle-row">
                    <input type="checkbox" ${checked ? 'checked' : ''}
                           onchange="ContentManager._toggleItem('${item.id}', this.checked)">
                    <span>${item.label}</span>
                </label>`;
            }).join('');
            return `<div class="cm-group"><div class="cm-group-title">${group}</div>${rows}</div>`;
        }).join('');

        container.innerHTML = `
            <div class="cm-profile-bar">
                <span class="cm-profile-label">Perfil Base:</span>
                ${profileBtns}
            </div>
            <div class="cm-groups">${groupsHtml}</div>`;
    },

    // Alias para compatibilidad con Config.render()
    renderConfigSection: function() {
        const groups  = {};
        this.CATALOG.forEach(item => {
            if (!groups[item.group]) groups[item.group] = [];
            groups[item.group].push(item);
        });
        const stored  = this._load();
        const profile = this.getProfile();
        const vis     = (id) => (stored[id] !== undefined) ? !!stored[id] : true;
        const pIcons  = { novato: '🌱', casual: '🃏', competitivo: '⚔️' };

        return `
            <div class="config-section" id="cm-config-section">
                <h3 class="config-section-title" onclick="ContentManager._toggleExpand()">
                    ▼ Contenido de la App
                </h3>
                <div id="cm-config-body" class="config-section-content"style="display:none;">
                    <div class="cm-profile-bar">
                        <span class="cm-label">Perfil base:</span>
                        ${['novato','casual','competitivo'].map(p => `
                            <button class="cm-profile-btn ${profile === p ? 'cm-profile-active' : ''}"
                                    onclick="ContentManager._applyProfileUI('${p}')">
                                ${pIcons[p]} ${p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>`).join('')}
                    </div>
                    <p class="cm-hint">Cambiar el perfil restablece la visibilidad a sus valores por defecto. Luego puedes ajustar cada sección individualmente.</p>
                    
                    <div class="cm-appearance-block">
                        <div class="cm-group-title">🎨 Fondo de la App</div>
                        <div id="cm-bgtheme-wrap">${this.renderBgThemeUI()}</div>
                    </div>

                    <div class="cm-appearance-block">
                        <div class="cm-group-title">🖼️ Imagen del Buscador (lateral izquierdo)</div>
                        ${window.Buscador ? Buscador.renderSidebarImagePicker() : '<p class="cm-hint">Módulo Buscador no disponible.</p>'}
                    </div>

                    <div class="cm-groups">
                        ${Object.entries(groups).map(([gName, items]) => `
                            <div class="cm-group">
                                <div class="cm-group-title">${gName}</div>
                                <div class="cm-group-items">
                                    ${items.map(item => `
                                        <label class="cm-toggle-row">
                                            <span class="cm-item-label">${item.label}</span>
                                            <div class="cm-switch">
                                                <input type="checkbox"
                                                       ${vis(item.id) ? 'checked' : ''}
                                                       onchange="ContentManager._toggle('${item.id}', this.checked)">
                                                <span class="cm-slider"></span>
                                            </div>
                                        </label>`).join('')}
                                </div>
                            </div>`).join('')}
                    </div>
                </div>
            </div>`;
    },

    _toggleExpand: function() {
        const body  = document.getElementById('cm-config-body');
        const title = body?.previousElementSibling;
        if (!body) return;
        const hide  = body.style.display !== 'none';
        body.style.display = hide ? 'none' : '';
        if (title) title.textContent = title.textContent.replace(hide ? '▼' : '▶', hide ? '▶' : '▼');
    },

    _toggle: function(id, visible) {
        this.setVisible(id, visible);
        this.applyAll();
        if (id.startsWith('deck-')   && window.Deck?.render)   Deck.render();
        if (id.startsWith('config-') && window.Config?.render) Config.render();
        if (id.startsWith('meta-')   && window.Meta?.render)   Meta.render();
    },

    _applyProfileUI: function(level) {
        this.applyProfile(level);
        // Actualizar clases activas en todos los botones de perfil sin re-renderizar todo
        document.querySelectorAll('.cm-profile-btn').forEach(btn => {
            const btnLevel = btn.onclick?.toString().match(/['"]([^'"]+)['"]\s*\)/) ?
                btn.onclick.toString().match(/_applyProfileUI\(['"]([^'"]+)['"]\)/)?.[1] : null;
            if (btnLevel) btn.classList.toggle('cm-profile-active', btnLevel === level);
        });
        // Regenerar solo el bloque de ContentManager si existe en el DOM
        const section = document.getElementById('cm-config-section');
        if (section) section.outerHTML = this.renderConfigSection();
    },

    _toggleItem: function(id, visible) {
        this.setVisible(id, visible);
        this.applyAll();
    }
};

window.ContentManager = ContentManager;
ContentManager.applyBgTheme();