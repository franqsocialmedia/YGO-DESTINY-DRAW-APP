/* ====================================
   CONTENT MANAGER MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Sistema de visibilidad de secciones y pestañas
   por perfil de jugador y preferencias del usuario
   ==================================== */

const ContentManager = {

    STORAGE_KEY: 'dd_content_visibility',
    PROFILE_KEY: 'dd_player_profile',

    // ── Catálogo de secciones controlables ────────────────────────
    // novato / casual / competitivo: visibilidad por defecto del perfil
    CATALOG: [

        // ── PESTAÑAS ──────────────────────────────────────────────
        { id: 'tab-estadisticas',  group: 'Pestañas', label: 'Estadísticas',  type: 'tab', novato: false, casual: false, competitivo: true },
        { id: 'tab-simuladores',   group: 'Pestañas', label: 'Simuladores',   type: 'tab', novato: true,  casual: true,  competitivo: true },
        { id: 'tab-meta',          group: 'Pestañas', label: 'Meta',          type: 'tab', novato: true,  casual: true,  competitivo: true },
        { id: 'tab-formacion',     group: 'Pestañas', label: 'Formación',     type: 'tab', novato: true,  casual: true,  competitivo: true },

        // ── BUSCADOR ──────────────────────────────────────────────
        { id: 'buscador-staples-panel', group: 'Buscador', label: 'Panel de Staples',            novato: false, casual: true,  competitivo: true },
        { id: 'buscador-archetypes',    group: 'Buscador', label: 'Filtro por Arquetipos',       novato: false, casual: true,  competitivo: true },
        { id: 'buscador-keywords',      group: 'Buscador', label: 'Filtrar por palabras clave',  novato: false, casual: true,  competitivo: true },
        { id: 'buscador-sets',          group: 'Buscador', label: 'Packs y Sets',                novato: false, casual: true,  competitivo: true },

        // ── VISTA DE CARTA (CardViewer) ───────────────────────────
        { id: 'cv-nomenclature', group: 'Vista de Carta', label: 'Nomenclatura de Efectos',   novato: false, casual: true,  competitivo: true },
        { id: 'cv-roles',        group: 'Vista de Carta', label: 'Posibles Roles',             novato: false, casual: true,  competitivo: true },
        { id: 'cv-contribution', group: 'Vista de Carta', label: 'Aporte al Deck Activo',      novato: false, casual: false, competitivo: true },
        { id: 'cv-staple-btn',   group: 'Vista de Carta', label: 'Botón Volver Staple',        novato: false, casual: true,  competitivo: true },

        // ── MI DECK ───────────────────────────────────────────────
        { id: 'deck-floating-widget', group: 'Mi Deck', label: 'Widget flotante de Decks',        novato: false, casual: true, competitivo: true },
        { id: 'deck-chart',           group: 'Mi Deck', label: 'Gráfica y Composición',           novato: false, casual: true, competitivo: true },
        { id: 'deck-roles-badges',    group: 'Mi Deck', label: 'Roles de cartas (badges)',        novato: false, casual: true, competitivo: true },
        { id: 'deck-engines',         group: 'Mi Deck', label: 'Engines',                         novato: false, casual: true, competitivo: true },
        { id: 'deck-experimentacion', group: 'Mi Deck', label: 'Botón Experimentación',           novato: false, casual: true, competitivo: true },
        { id: 'deck-matchups',        group: 'Mi Deck', label: 'Historial de Enfrentamientos',    novato: false, casual: true, competitivo: true },

        // ── SIMULADORES ───────────────────────────────────────────
        { id: 'sim-mulligan',         group: 'Simuladores', label: 'Mulligan',                       novato: false, casual: false, competitivo: true },
        { id: 'sim-torneo',           group: 'Simuladores', label: 'Torneo',                         novato: false, casual: true,  competitivo: true },
        { id: 'sim-timer',            group: 'Simuladores', label: 'Cronómetro Master Duel',         novato: false, casual: false, competitivo: true },
        { id: 'sim-experimentacion',  group: 'Simuladores', label: 'Experimentación',                novato: false, casual: true,  competitivo: true },
        { id: 'sim-practica-history', group: 'Simuladores', label: 'Historial y Guardado de Estados',novato: false, casual: false, competitivo: true },

        // ── CONFIGURACIÓN ─────────────────────────────────────────
        { id: 'config-roles',         group: 'Configuración', label: 'Roles y Palabras Asociadas',  novato: false, casual: true,  competitivo: true },
        { id: 'config-specialties',   group: 'Configuración', label: 'Mecánicas y Counters',        novato: false, casual: false, competitivo: true },
        { id: 'config-staples',       group: 'Configuración', label: 'Lista de Staples',            novato: false, casual: true,  competitivo: true },
        { id: 'config-nomenclature',  group: 'Configuración', label: 'Nomenclatura de Efectos',     novato: false, casual: true,  competitivo: true },
        { id: 'config-pillars',       group: 'Configuración', label: 'Pilares del Internal Score',  novato: false, casual: true,  competitivo: true },
        { id: 'config-diminishing',   group: 'Configuración', label: 'Rendimientos Decrecientes',   novato: false, casual: false, competitivo: true },
        { id: 'config-danger-delete', group: 'Configuración', label: 'Borrar Data',                 novato: false, casual: true,  competitivo: true },
        { id: 'config-danger-meta',   group: 'Configuración', label: 'Borrar META',                 novato: false, casual: false, competitivo: true },
    ],

    // ── Storage ───────────────────────────────────────────────────

    _load: function () {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {}; }
        catch (_) { return {}; }
    },

    _save: function (data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    // Devuelve true si la sección está visible.
    // Si no hay valor almacenado, usa el default del catálogo (competitivo = todo visible).
    isVisible: function (id) {
        const stored = this._load();
        if (stored[id] !== undefined) return !!stored[id];
        const item = this.CATALOG.find(c => c.id === id);
        return item ? !!item.competitivo : true;
    },

    setVisible: function (id, visible) {
        const data  = this._load();
        data[id]    = !!visible;
        this._save(data);
    },

    // ── Perfiles ──────────────────────────────────────────────────

    // level: 'novato' | 'casual' | 'competitivo' | 'default'
    applyProfile: function (level) {
        const key  = (['novato', 'casual', 'competitivo'].includes(level)) ? level : 'competitivo';
        const data = {};
        this.CATALOG.forEach(item => { data[item.id] = !!item[key]; });
        this._save(data);
        localStorage.setItem(this.PROFILE_KEY, key);
        this.applyAll();
    },

    getProfile: function () {
        return localStorage.getItem(this.PROFILE_KEY) || 'competitivo';
    },

    // ── Aplicar al DOM ────────────────────────────────────────────

    applyAll: function () {
        const stored = this._load();
        const vis    = (id) => (stored[id] !== undefined) ? !!stored[id] : this.isVisible(id);

        // 1. Nav tabs: botón + contenido
        this.CATALOG.filter(c => c.type === 'tab').forEach(item => {
            const tabName  = item.id.replace('tab-', '');
            const visible  = vis(item.id);
            const navItem  = document.querySelector(`[data-tab="${tabName}"]`)?.closest('.nav-item');
            if (navItem) navItem.classList.toggle('app-hidden', !visible);
            // Si el usuario está en una pestaña que acaba de ocultarse, redirigir
            if (!visible && window.Navigation?.currentTab === tabName) {
                Navigation.showTab('buscador');
            }
        });

        // 2. Elementos con data-section-id en el DOM
        document.querySelectorAll('[data-section-id]').forEach(el => {
            el.classList.toggle('app-hidden', !vis(el.dataset.sectionId));
        });

        // 3. Notificar módulos dinámicos que re-rendericen si es necesario
        this._notifyDynamic();
    },

    // Módulos cuya visibilidad depende de estado JS (no solo CSS)
    _notifyDynamic: function () {
        // Simuladores: re-aplica tabs visibles si el shell ya está en DOM
        if (document.getElementById('sim-torneo-content')) {
            this._applySimTabs();
        }
    },

    // Oculta/muestra los sub-tab buttons de Simuladores según visibilidad
    _applySimTabs: function () {
        const stored   = this._load();
        const vis      = (id) => (stored[id] !== undefined) ? !!stored[id] : this.isVisible(id);
        const tabMap   = {
            'mulligan':      'sim-mulligan',
            'torneo':        'sim-torneo',
            'experimentacion': 'sim-experimentacion',
            'practica':      null,          // Zona de Práctica siempre visible
            'winrate':       null,
            'duelo':         null,
        };
        document.querySelectorAll('.sim-tab-btn').forEach(btn => {
            const simtab   = btn.dataset.simtab;
            const sectionId = tabMap[simtab];
            if (!sectionId) return;         // siempre visible
            btn.classList.toggle('app-hidden', !vis(sectionId));
        });
    },

    // ── Render del panel en Configuración ─────────────────────────

    renderConfigSection: function () {
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
                <div id="cm-config-body" class="config-section-content">

                    <div class="cm-profile-bar">
                        <span class="cm-label">Perfil base:</span>
                        ${['novato','casual','competitivo'].map(p => `
                            <button class="cm-profile-btn ${profile === p ? 'cm-profile-active' : ''}"
                                    onclick="ContentManager._applyProfileUI('${p}')">
                                ${pIcons[p]} ${p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>`).join('')}
                    </div>
                    <p class="cm-hint">
                        Cambiar el perfil restablece la visibilidad a sus valores por defecto.
                        Luego puedes ajustar cada sección individualmente.
                    </p>

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

    _toggleExpand: function () {
        const body  = document.getElementById('cm-config-body');
        const title = body?.previousElementSibling;
        if (!body) return;
        const hide  = body.style.display !== 'none';
        body.style.display = hide ? 'none' : '';
        if (title) {
            title.textContent = title.textContent.replace(hide ? '▼' : '▶', hide ? '▶' : '▼');
        }
    },

    _toggle: function (id, visible) {
        this.setVisible(id, visible);
        this.applyAll();
        // Si el módulo afectado está activo, forzar re-render
        if (id.startsWith('deck-') && window.Deck?.render) Deck.render();
        if (id.startsWith('config-') && window.Config?.render) Config.render();
    },

    _applyProfileUI: function (level) {
        this.applyProfile(level);
        // Re-renderizar el panel del Content Manager en Config
        const section = document.getElementById('cm-config-section');
        if (section) section.outerHTML = this.renderConfigSection();
    },

    // ── Init ──────────────────────────────────────────────────────

    init: function () {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyAll());
        } else {
            this.applyAll();
        }
    }
};

window.ContentManager = ContentManager;
ContentManager.init();
