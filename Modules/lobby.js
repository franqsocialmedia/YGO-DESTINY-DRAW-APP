/* lobby.js — Pestaña Lobby: "Lo Nuevo" (últimas cartas TCG/OCG) + "Sugerencias" aleatorias */

/**
 * Cada vez que quieras anunciar algo nuevo: cambia UPDATE_VERSION (ej. 'v1.1') y reescribe UPDATE_NOTES. 
 * Al no coincidir con lo guardado en dd_update_seen, vuelve a aparecer una vez para todos.
 */

const Lobby = {

    _latestCards: [],
    _lastFetch: 0,
    _activeSuggestions: [],
    CACHE_MS: 30 * 60 * 1000, // 30 min — evita refetch en cada cambio de pestaña

    // ── Aviso de Actualización — editar estos 2 campos en cada nueva mejora ──
    UPDATE_VERSION: 'v1.0',
    UPDATE_NOTES: [
        'Escribe aquí cada mejora de esta versión, una por línea.'
    ],

    init: function() {
        this.render();
    },

    render: function() {
        const c = document.getElementById('lobby-content');
        if (!c) return;

        c.innerHTML = `
            <h2>Lobby</h2>

            <section class="lobby-section" id="lobby-nuevo-section">
                <h3 class="lobby-section-title">
                    🆕 Lo Nuevo <span class="lobby-section-sub">(último mes · TCG/OCG)</span>
                </h3>
                <div id="lobby-nuevo-strip" class="lobby-nuevo-strip">
                    <p class="lobby-loading">Cargando cartas recientes...</p>
                </div>
            </section>

            <section class="lobby-section" id="lobby-sugerencias-section">
                <h3 class="lobby-section-title lobby-collapsible" onclick="Lobby.toggleSugerencias()">
                    <span id="lobby-sug-arrow">▼</span> 💡 Sugerencias
                </h3>
                <div id="lobby-sugerencias-body" class="lobby-suggestions-body">
                    <div id="lobby-suggestions-grid" class="lobby-suggestions-grid"></div>
                    <button class="lobby-refresh-btn" onclick="Lobby.renderSuggestions()">🔀 Otras sugerencias</button>
                </div>
            </section>
        `;

        this.renderSuggestions();
        this.loadLatestCards();
        this.checkUpdateNotice();
    },

    toggleSugerencias: function() {
        const body  = document.getElementById('lobby-sugerencias-body');
        const arrow = document.getElementById('lobby-sug-arrow');
        if (!body) return;
        const hide = body.style.display !== 'none';
        body.style.display = hide ? 'none' : '';
        if (arrow) arrow.textContent = hide ? '▶' : '▼';
    },
// ══════════════════════════════════════════════════════════
    // AVISO DE ACTUALIZACIÓN — panel flotante, 1 vez por versión
    // ══════════════════════════════════════════════════════════
    UPDATE_SEEN_KEY: 'dd_update_seen',

    checkUpdateNotice: function() {
        if (document.getElementById('lobby-update-overlay')) return; // ya está abierto
        const seen = localStorage.getItem(this.UPDATE_SEEN_KEY);
        if (seen === this.UPDATE_VERSION) return;
        this.showUpdateNotice();
    },

    showUpdateNotice: function() {
        const overlay = document.createElement('div');
        overlay.id = 'lobby-update-overlay';
        overlay.className = 'lobby-update-overlay';
        overlay.innerHTML = `
            <div class="lobby-update-panel">
                <div class="lobby-update-logo-wrap">
                    <img src="img/LOGO_Destiny_Draw_Yugioh_APP-01.png" class="lobby-update-logo"
                         alt="Destiny Draw" onerror="this.style.display='none'">
                </div>
                <h3 class="lobby-update-title">Actualización de App: Destiny Draw</h3>
                <ul class="lobby-update-list">
                    ${this.UPDATE_NOTES.map(n => `<li>${n}</li>`).join('')}
                </ul>
                <button class="lobby-update-close-btn" onclick="Lobby.dismissUpdateNotice()">Entendido</button>
            </div>`;
        document.body.appendChild(overlay);
    },

    dismissUpdateNotice: function() {
        localStorage.setItem(this.UPDATE_SEEN_KEY, this.UPDATE_VERSION);
        document.getElementById('lobby-update-overlay')?.remove();
    },
    // ══════════════════════════════════════════════════════════
    // LO NUEVO — últimas 10 cartas por fecha de salida (TCG/OCG)
    // ══════════════════════════════════════════════════════════

    loadLatestCards: async function(force) {
        const now = Date.now();
        if (!force && this._latestCards.length && (now - this._lastFetch) < this.CACHE_MS) {
            this._renderNuevoStrip();
            return;
        }
        try {
            this._latestCards = await this._fetchLatest();
            this._lastFetch = now;
            this._renderNuevoStrip();
        } catch (e) {
            const strip = document.getElementById('lobby-nuevo-strip');
            if (strip) strip.innerHTML = '<p class="lobby-empty">No se pudieron cargar las novedades.</p>';
        }
    },

    _fetchByRegion: async function(region, startStr) {
        try {
            const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes&startdate=${startStr}&dateregion=${region}`;
            const r = await fetch(url);
            const data = await r.json();
            return data?.data || [];
        } catch (e) {
            return [];
        }
    },

    // Fusiona TCG + OCG por ID. Si una carta salió en ambos formatos dentro
    // de la ventana de 30 días, se queda UNA sola entrada — se prioriza la
    // fecha MÁS TEMPRANA entre tcg_date/ocg_date como fecha de referencia.
    // MD no se considera (la API no expone fecha de lanzamiento de MD).
    _fetchLatest: async function() {
        const start = new Date();
        start.setDate(start.getDate() - 30);
        const startStr = start.toISOString().slice(0, 10);

        const [tcgList, ocgList] = await Promise.all([
            this._fetchByRegion('tcg', startStr),
            this._fetchByRegion('ocg', startStr)
        ]);

        const map = new Map();
        const consider = (list) => {
            list.forEach(card => {
                const misc    = card.misc_info?.[0] || {};
                const tcgDate = misc.tcg_date || null;
                const ocgDate = misc.ocg_date || null;
                const dates   = [tcgDate, ocgDate].filter(Boolean);
                if (!dates.length) return;

                const earliest = dates.slice().sort()[0]; // string YYYY-MM-DD, sort lexicográfico = cronológico
                const existing = map.get(card.id);
                if (existing && existing._sortDate <= earliest) return; // ya hay una entrada igual o más temprana

                map.set(card.id, {
                    id: card.id,
                    name: card.name,
                    card_images: card.card_images,
                    _sortDate: earliest,
                    _region: earliest === tcgDate ? 'TCG' : 'OCG',
                    _raw: card
                });
            });
        };
        consider(tcgList);
        consider(ocgList);

        return [...map.values()]
            .sort((a, b) => b._sortDate.localeCompare(a._sortDate))
            .slice(0, 10);
    },

    _renderNuevoStrip: function() {
        const strip = document.getElementById('lobby-nuevo-strip');
        if (!strip) return;
        if (!this._latestCards.length) {
            strip.innerHTML = '<p class="lobby-empty">No hay cartas nuevas en el último mes.</p>';
            return;
        }
        const fmt = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '';
        strip.innerHTML = this._latestCards.map((card, i) => {
            const img = card.card_images?.[0]?.image_url_small || '';
            return `
                <div class="lobby-card" onclick="Lobby.openCard(${i})">
                    <span class="lobby-card-tag lobby-card-tag-${card._region.toLowerCase()}">${card._region}</span>
                    <img src="${img}" class="lobby-card-img" alt="${card.name}" loading="lazy">
                    <div class="lobby-card-name">${card.name}</div>
                    <div class="lobby-card-date">${fmt(card._sortDate)}</div>
                </div>`;
        }).join('');
    },

    openCard: function(index) {
        const card = this._latestCards[index];
        if (!card || !window.CardViewer) return;
        CardViewer.open(card._raw);
    },

    // ══════════════════════════════════════════════════════════
    // SUGERENCIAS — collage aleatorio de 5 invitaciones a otras
    // secciones. Reemplazar "img" por assets propios cuando existan.
    // ══════════════════════════════════════════════════════════

    SUGGESTIONS_POOL: [
        { img: 'img/lobby/tip-simuladores.png',    title: 'Testea tu deck de varias formas',      desc: 'Hipergeometría, Torneo Swiss y Duelo en Vivo.',                 tab: 'simuladores', sectionId: null },
        { img: 'img/lobby/tip-optimizacion.png',   title: 'Mide tu nivel real como piloto',       desc: 'Registra rondas en Optimización y sube de nivel en Duelista.',  tab: 'mideck',      sectionId: 'mideck-optimizacion-pane' },
        { img: 'img/lobby/tip-matchups.png',       title: 'Lleva el historial contra tus rivales', desc: 'Guarda winrate y decklist por rival en Matchups.',              tab: 'mideck',      sectionId: 'mideck-optimizacion-pane' },
        { img: 'img/lobby/tip-buscador.png',       title: 'Encuentra cartas por arquetipo',       desc: 'Filtra el Buscador por arquetipo, set o palabras clave.',       tab: 'buscador',    sectionId: 'buscador-archetypes' },
        { img: 'img/lobby/tip-scoring.png',        title: 'Ajusta el Scoring a tu criterio',      desc: 'Personaliza roles, pesos y el sistema G1/G2.',                  tab: 'config',      sectionId: null },
        { img: 'img/lobby/tip-complejidad.png',    title: '¿Qué tan difícil es tu deck?',         desc: 'Corre el quiz de Complejidad del Deck en Optimización.',        tab: 'mideck',      sectionId: 'mideck-optimizacion-pane' },
        { img: 'img/lobby/tip-banlist.png',        title: 'Consulta y edita tu Banlist',          desc: 'Agrega cartas a Ban/Limitada o Genesys sin salir del panel.',   tab: 'config',      sectionId: 'banlist-section' },
        { img: 'img/lobby/tip-formacion.png',      title: 'Aprende mecánicas del juego',          desc: 'Guías, Maestros del Duelo y juegos alternativos en Formación.', tab: 'formacion',   sectionId: null },
        { img: 'img/lobby/tip-importar.png',       title: 'Importa tu deck en segundos',          desc: 'Desde archivo .ydk o directo desde la Lista Oficial en .pdf.',  tab: 'mideck',      sectionId: null },
        { img: 'img/lobby/tip-estadisticas.png',   title: 'Compara tu deck contra el meta',       desc: 'Internal y External Score frente a los decks del meta actual.', tab: 'estadisticas', sectionId: null },
    ],

    renderSuggestions: function() {
        const grid = document.getElementById('lobby-suggestions-grid');
        if (!grid) return;
        const shuffled = [...this.SUGGESTIONS_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
        this._activeSuggestions = shuffled;
        grid.innerHTML = shuffled.map((s, i) => `
            <div class="lobby-suggestion-card" onclick="Lobby.goSuggestion(${i})">
                <img src="${s.img}" class="lobby-suggestion-img" alt="" onerror="this.style.display='none'">
                <div class="lobby-suggestion-title">${s.title}</div>
                <div class="lobby-suggestion-desc">${s.desc}</div>
            </div>`).join('');
    },

    goSuggestion: function(index) {
        const s = this._activeSuggestions?.[index];
        if (!s || !window.Navigation) return;
        Navigation.showTab(s.tab);
        if (s.sectionId) {
            setTimeout(() => {
                const el = document.getElementById(s.sectionId);
                if (!el) return;
                if (!el.style.display || el.style.display === 'none') el.style.display = 'block';
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        }
    }
};

window.Lobby = Lobby;