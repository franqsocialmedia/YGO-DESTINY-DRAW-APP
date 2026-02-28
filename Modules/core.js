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
    currentTab: 'buscador',
    tabs: ['buscador', 'mideck', 'estadisticas', 'simuladores', 'formacion', 'config'],

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
        if (tabName === 'simuladores' && window.Torneo) Torneo.init();
        if (tabName === 'mideck' && window.Engines) Engines.init();
        if (previousTab === 'simuladores' && tabName !== 'simuladores' && window.ZonaPractica) {
            ZonaPractica._cleanupFloatBtns?.();
        }
        if (tabName === 'meta' && window.Meta) Meta.init();
        if (tabName === 'formacion' && window.Formacion) Formacion.init();

        SafeLogger.functionEnd('Navigation', 'showTab', { success: true, currentTab: tabName });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof updateButtons === 'function') updateButtons();
        document.dispatchEvent(new Event('scroll'));
        if (window.ContentManager) ContentManager.applyAll();

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

// ── SHORTCUTS ────────────────────────────────────────────────────────
// Botón flotante ⚡ con menú de accesos rápidos configurables
const Shortcuts = {
    CATALOG: [
        { label: 'Buscador',             tab: 'buscador',     sectionId: null },
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

    init: function() { this._createButton(); },

    _createButton: function() {
        if (document.getElementById('shortcuts-float-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'shortcuts-float-btn';
        btn.className = 'shortcuts-float-btn';
        btn.innerHTML = '⚡';
        btn.title = 'Accesos rápidos';
        btn.onclick = (e) => { e.stopPropagation(); this.toggleMenu(); };
        document.body.appendChild(btn);
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

    // Navega a la pestaña y sección del shortcut seleccionado
    go: function(index) {
        const shortcuts = window.ConfigManager?.getShortcuts?.() || this.CATALOG.slice(0, 4);
        const s = shortcuts[index];
        if (!s) return;
        this.closeMenu();
        if (window.Navigation) Navigation.showTab(s.tab);
        if (s.sectionId) {
            setTimeout(() => {
                const el = document.getElementById(s.sectionId);
                if (!el) return;
                if (!el.style.display || el.style.display === 'none') el.style.display = 'block';
                if (s.sectionId === 'winrate-sec'  && window.Winrate)      Winrate.refreshSection();
                if (s.sectionId === 'duelista-sec' && window.Duelista)     Duelista.refreshSection();
                if (s.sectionId === 'top-tier-sec' && window.Estadisticas) Estadisticas._refreshTopTier();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        }
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
        { id: 'tab-meta',          group: 'Pestañas', label: 'Meta',          type: 'tab', novato: true,  casual: true,  competitivo: true },
        { id: 'tab-formacion',     group: 'Pestañas', label: 'Formación',     type: 'tab', novato: true,  casual: true,  competitivo: true },

        { id: 'buscador-staples-panel', group: 'Buscador', label: 'Panel de Staples',           novato: false, casual: true,  competitivo: true },
        { id: 'buscador-archetypes',    group: 'Buscador', label: 'Filtro por Arquetipos',      novato: false, casual: true,  competitivo: true },
        { id: 'buscador-keywords',      group: 'Buscador', label: 'Filtrar por palabras clave', novato: false, casual: true,  competitivo: true },
        { id: 'buscador-sets',          group: 'Buscador', label: 'Packs y Sets',               novato: false, casual: true,  competitivo: true },

        { id: 'cv-nomenclature', group: 'Vista de Carta', label: 'Nomenclatura de Efectos',  novato: false, casual: true,  competitivo: true },
        { id: 'cv-roles',        group: 'Vista de Carta', label: 'Posibles Roles',            novato: false, casual: true,  competitivo: true },
        { id: 'cv-contribution', group: 'Vista de Carta', label: 'Aporte al Deck Activo',     novato: false, casual: false, competitivo: true },
        { id: 'cv-staple-btn',   group: 'Vista de Carta', label: 'Botón Volver Staple',       novato: false, casual: true,  competitivo: true },

        { id: 'deck-floating-widget', group: 'Mi Deck', label: 'Widget flotante de Decks',       novato: false, casual: true, competitivo: true },
        { id: 'deck-chart',           group: 'Mi Deck', label: 'Gráfica y Composición',          novato: false, casual: true, competitivo: true },
        { id: 'deck-roles-badges',    group: 'Mi Deck', label: 'Roles de cartas (badges)',       novato: false, casual: true, competitivo: true },
        { id: 'deck-engines',         group: 'Mi Deck', label: 'Engines',                        novato: false, casual: true, competitivo: true },
        { id: 'deck-role-btn',        group: 'Mi Deck', label: 'Botón Rol (por carta)',          novato: false, casual: true, competitivo: true },
        { id: 'deck-experimentacion', group: 'Mi Deck', label: 'Botón Experimentación',          novato: false, casual: true, competitivo: true },
        { id: 'deck-matchups',        group: 'Mi Deck', label: 'Historial de Enfrentamientos',   novato: false, casual: true, competitivo: true },

        { id: 'sim-mulligan',         group: 'Simuladores', label: 'Mulligan',                        novato: false, casual: false, competitivo: true },
        { id: 'sim-torneo',           group: 'Simuladores', label: 'Torneo',                          novato: false, casual: true,  competitivo: true },
        { id: 'sim-timer',            group: 'Simuladores', label: 'Cronómetro Master Duel',          novato: false, casual: false, competitivo: true },
        { id: 'sim-experimentacion',  group: 'Simuladores', label: 'Experimentación',                 novato: false, casual: true,  competitivo: true },
        { id: 'sim-practica-history', group: 'Simuladores', label: 'Historial y Guardado de Estados', novato: false, casual: false, competitivo: true },
        { id: 'pz-markstate-btn',     group: 'Simuladores', label: 'Marcar Estado (flotante)',        novato: false, casual: false, competitivo: true },

        { id: 'meta-fuentes', group: 'Meta', label: 'Fuentes Externas', novato: false, casual: true, competitivo: true },

        { id: 'config-roles',              group: 'Configuración', label: 'Roles y Palabras Asociadas',  novato: false, casual: true,  competitivo: true },
        { id: 'config-specialties',        group: 'Configuración', label: 'Mecánicas y Counters',        novato: false, casual: false, competitivo: true },
        { id: 'config-staples',            group: 'Configuración', label: 'Lista de Staples',            novato: false, casual: true,  competitivo: true },
        { id: 'config-nomenclature',       group: 'Configuración', label: 'Nomenclatura de Efectos',     novato: false, casual: true,  competitivo: true },
        { id: 'config-pillars',            group: 'Configuración', label: 'Pilares del Internal Score',  novato: false, casual: true,  competitivo: true },
        { id: 'config-diminishing',        group: 'Configuración', label: 'Rendimientos Decrecientes',   novato: false, casual: false, competitivo: true },
        { id: 'config-shortcuts',          group: 'Configuración', label: 'Atajos Rápidos',              novato: true,  casual: true,  competitivo: true },
        { id: 'config-banlist',            group: 'Configuración', label: 'Banlist del Formato',         novato: true,  casual: true,  competitivo: true },
        { id: 'config-music',              group: 'Configuración', label: 'Ajustes de Música',           novato: true,  casual: true,  competitivo: true },
        { id: 'config-meta-masters',       group: 'Configuración', label: 'Maestros del Duelo',          novato: true,  casual: true,  competitivo: true },
        { id: 'config-meta-links',         group: 'Configuración', label: 'Fuentes Externas del Meta',   novato: false, casual: true,  competitivo: true },
        { id: 'config-formacion-games',    group: 'Configuración', label: 'Juegos Alternativos',         novato: true,  casual: true,  competitivo: true },
        { id: 'config-formacion-topics',   group: 'Configuración', label: 'Temas de Formación',          novato: true,  casual: true,  competitivo: true },
        { id: 'config-danger-zone',        group: 'Configuración', label: 'Zona de Borrado',             novato: false, casual: true,  competitivo: true },
        { id: 'config-danger-delete',      group: 'Configuración', label: '↳ Botón Borrar Deck',        novato: false, casual: true,  competitivo: true },
        { id: 'config-danger-meta',        group: 'Configuración', label: '↳ Botón Borrar META',        novato: false, casual: false, competitivo: true },
    ],

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

        // Sub-tabs de Simuladores
        this._applySimuladorSubTabs(vis);

        // Re-render de módulos si aplica
        this.CATALOG.forEach(c => {
            if (!vis(c.id)) return;
            if (c.id.startsWith('deck-') && window.Deck?.render) Deck.render();
            if (c.id.startsWith('config-') && window.Config?.render) Config.render();
            if (c.id.startsWith('meta-') && window.Meta?.render) Meta.render();
        });
    },

    // Oculta/muestra sub-tab buttons de Simuladores según visibilidad
    _applySimuladorSubTabs: function(vis) {
        const map = {
            'sim-mulligan':        ['mulligan', 'winrate'],
            'sim-torneo':          ['torneo'],
            'sim-timer':           ['timer', 'duelo'],
            'sim-experimentacion': ['experimentacion'],
            'sim-practica-history':['practica']
        };
        Object.entries(map).forEach(([sectionId, btnIds]) => {
            const show = vis(sectionId);
            btnIds.forEach(id => {
                const btn = document.querySelector(`.sim-tab-btn[data-sim="${id}"]`);
                if (btn) btn.style.display = show ? '' : 'none';
            });
        });
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

    _applyProfileUI: function(level) {
        this.applyProfile(level);
        const container = document.querySelector('[data-cm-container]');
        if (container) this.renderUI(container.id);
        if (window.Config?.render) Config.render();
    },

    _toggleItem: function(id, visible) {
        this.setVisible(id, visible);
        this.applyAll();
    }
};

window.ContentManager = ContentManager;
