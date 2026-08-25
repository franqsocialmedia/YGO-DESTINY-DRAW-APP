/* lobby.js — Pestaña Lobby: "Lo Nuevo" (últimas cartas TCG/OCG) + "Sugerencias" aleatorias */

/**
 * Cada vez que quieras anunciar algo nuevo: cambia UPDATE_VERSION (ej. 'v1.1') y reescribe UPDATE_NOTES. 
 * Al no coincidir con lo guardado en dd_update_seen, vuelve a aparecer una vez para todos.
 */

const Lobby = {

    _latestCards: [],
    _lastFetch: 0,
    _activeSuggestions: [],
    CACHE_MS: 24 * 60 * 60 * 1000, // 24 horas — evita refetch en cada reload/cambio de pestaña
    CACHE_KEY: 'dd_lobby_latest_cache',

    // ── Aviso de Actualización — editar estos 2 campos en cada nueva mejora ──
    UPDATE_VERSION: 'v1.0',
    UPDATE_NOTES: [
        '*Nuevo*: Panel de Lobby con novedades y sugerencias.',
        '*Mejoras*: Grafico de Perfil de Rendimiento del Deck.',
        '* Filtrador*: Filtrador de Buscador por arquetipo, Set y palabras clave.',
        '* Mejoras*: Mejoras en la interfaz y el rendimiento general.',
        '* Exportado del Deck*: Puedes exportar toda la Data de tu deck y asi importarlo en otro dispositivo con ese mismo archivo.',
        '* Perfil de Rendimiento*: Puedes ver el grafico de tu rendimiento con el Deck segun registros de duelos.',
        '* Historial de Versiones*: Puedes ver el historial de todas las versiones de tu deck, con su puntaje de poder y todos las las cartas que tenia en esa version anterior.',
        '* Linea de Combos*: Puedes crear y guardar líneas de combos para optimizar tu estrategia.',
        '* Gestion del META*: Puedes subir los decks en formato .ydk de los decks del META para que tus decks sean comparados con las cartas mas populares del momento.',
        '* Counters*: Analiza los counters de tus cartas en Simuladores.',
        '* 2 Players*: Pon aprueba tu deck contra otro al mismo tiempo, jugando en ambas pantallas para simular un duelo en fisico.',
        '* Temas*: Mejora en el juego con los temas disponibles segun tu nivel de habilidad.',
        '* Tu Personaje*: Mira cual posible personaje del anime de Yugioh se alinea a tu personalidad y forma de ver el juego.',
        '* Test de Duelo*: Crea tu propio test de duelo para probar tu estrategia o enseñar a otros compartiendo tus pruebas de Duelo Practicas y Teoricas.',


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

        // 1) caché en memoria (misma sesión de navegación)
        if (!force && this._latestCards.length && (now - this._lastFetch) < this.CACHE_MS) {
            this._renderNuevoStrip();
            return;
        }

        // 2) caché persistida en localStorage (sobrevive a reload de página)
        if (!force) {
            const cached = this._loadCache();
            if (cached) {
                this._latestCards = cached.cards;
                this._lastFetch = cached.ts;
                this._renderNuevoStrip();
                return;
            }
        }

        try {
            this._latestCards = await this._fetchLatest();
            this._lastFetch = now;
            this._saveCache(this._latestCards, now);
            this._renderNuevoStrip();
        } catch (e) {
            const strip = document.getElementById('lobby-nuevo-strip');
            if (strip) strip.innerHTML = '<p class="lobby-empty">No se pudieron cargar las novedades.</p>';
        }
    },

    _loadCache: function() {
        try {
            const raw = localStorage.getItem(this.CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.cards) || !parsed.ts) return null;
            if ((Date.now() - parsed.ts) >= this.CACHE_MS) return null; // vencida
            return parsed;
        } catch (e) {
            return null;
        }
    },

    _saveCache: function(cards, ts) {
        try {
            localStorage.setItem(this.CACHE_KEY, JSON.stringify({ ts, cards }));
        } catch (e) {
            // localStorage lleno/bloqueado — sigue funcionando en memoria igual
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
                    // _raw recortado: solo lo que CardViewer.open() pinta de forma
                    // síncrona antes de su propio fetch (ver 8.9 del reporte).
                    // Se descartan card_sets/card_prices/misc_info completos.
                    _raw: {
                        id: card.id,
                        name: card.name,
                        type: card.type,
                        race: card.race,
                        attribute: card.attribute,
                        level: card.level,
                        atk: card.atk,
                        def: card.def,
                        archetype: card.archetype,
                        card_images: card.card_images,
                        desc: card.desc,
                        pend_desc: card.pend_desc,
                        monster_desc: card.monster_desc,
                        scale: card.scale,
                        linkval: card.linkval,
                        linkmarkers: card.linkmarkers
                    }
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
        { img: 'img/lobby/tip-simuladores.png',    title: 'Testea tu deck de varias formas',       desc: 'Hipergeometría, Torneo Swiss y Duelo en Vivo.',                       tab: 'simuladores', sectionId: null },
        { img: 'img/lobby/tip-optimizacion.png',   title: 'Mide tu nivel real como piloto',        desc: 'Registra rondas en Optimización y sube de nivel en Duelista.',        tab: 'mideck',      sectionId: 'mideck-optimizacion-pane' },
        { img: 'img/lobby/tip-matchups.png',       title: 'Lleva el historial contra tus rivales', desc: 'Guarda winrate, notas y decklist del rival en Matchups.',             tab: 'mideck',      sectionId: 'mideck-optimizacion-pane' },
        { img: 'img/lobby/tip-buscador.png',       title: 'Encuentra cartas por arquetipo',        desc: 'Filtra el Buscador por arquetipo, set o palabras clave.',             tab: 'buscador',    sectionId: 'buscador-archetypes' },
        { img: 'img/lobby/tip-scoring.png',        title: 'Ajusta el Scoring a tu criterio',       desc: 'Personaliza roles, pesos y el sistema G1/G2 a tu formato.',           tab: 'config',      sectionId: null },
        { img: 'img/lobby/tip-complejidad.png',    title: '¿Qué tan difícil es tu deck?',          desc: 'Corre el quiz de Complejidad: curva de entrada vs techo de habilidad.', tab: 'mideck',     sectionId: 'mideck-optimizacion-pane' },
        { img: 'img/lobby/tip-banlist.png',        title: 'Consulta y edita tu Banlist',           desc: 'Agrega cartas a Ban/Limitada o Genesys, con varios formatos activos.', tab: 'config',     sectionId: 'banlist-section' },
        { img: 'img/lobby/tip-formacion.png',      title: 'Aprende mecánicas del juego',           desc: 'Guías, Maestros del Duelo y juegos alternativos en Formación.',       tab: 'formacion',   sectionId: null },
        { img: 'img/lobby/tip-importar.png',       title: 'Importa tu deck en segundos',           desc: 'Desde archivo .ydk o directo desde la Lista Oficial en .pdf.',        tab: 'mideck',      sectionId: null },
        { img: 'img/lobby/tip-estadisticas.png',   title: 'Compara tu deck contra el meta',        desc: 'Internal y External Score frente a los decks del meta actual.',       tab: 'estadisticas', sectionId: null },
        { img: 'img/lobby/tip-combos.png',         title: 'Mapea tu Línea de Combos',              desc: 'Starters, choke points y endboard por zona, con modo de ejecución paso a paso.', tab: 'mideck', sectionId: null },
        { img: 'img/lobby/tip-counters.png',       title: 'Encuentra counters al rival',           desc: 'Marca las amenazas del oponente y arma un pool de respuesta en Counters.', tab: 'simuladores', sectionId: null },
        { img: 'img/lobby/tip-gauntlet.png',       title: 'Ponle presión a tu pool',               desc: 'Testea deck, Engine o pool manual contra el meta completo en Gauntlet.', tab: 'simuladores', sectionId: null },
        { img: 'img/lobby/tip-zonapractica.png',   title: 'Practica jugadas campo por campo',      desc: 'Simula zonas, resuelve cadenas y guarda estados en Zona de Práctica.', tab: 'simuladores', sectionId: null },
        { img: 'img/lobby/tip-primerosdecks.png',  title: '¿Recién empiezas?',                     desc: 'Carga uno de más de 200 decklists listas, por nivel de dificultad.',   tab: 'formacion',   sectionId: null },
        { img: 'img/lobby/tip-estilo.png',         title: 'Descubre tu arquetipo afín',            desc: 'Responde el quiz de Tu Estilo y Tu Personaje en Formación.',          tab: 'formacion',   sectionId: null },
        { img: 'img/lobby/tip-antimeta.png',       title: '¿Qué tan Anti-META es tu deck?',        desc: 'Revisa tu Counter-Deck Score en el Análisis de Deck.',                tab: 'estadisticas', sectionId: null },
        { img: 'img/lobby/tip-toptier.png',        title: 'Mira el Top Tier del meta',             desc: 'Ranking de decks por Powercreep, Consistencia, Potencia o Resiliencia.', tab: 'estadisticas', sectionId: null },
        { img: 'img/lobby/tip-engines.png',        title: 'Arma tus propios Engines',              desc: 'Guarda combos de cartas reutilizables y cárgalos en cualquier deck.',  tab: 'mideck',      sectionId: null },
        { img: 'img/lobby/tip-exportdata.png',     title: 'Nunca pierdas tu progreso',             desc: 'Exporta Data completa: deck, notas, versiones, Optimización y Combos.', tab: 'mideck',      sectionId: null },
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
// ============================================
// TourGate — orquesta el orden de paneles de bienvenida:
// Lobby Update Panel -> Welcome Panel -> App Tour -> Tab Intro
// No modifica Lobby/Welcome/TabIntro, solo observa su estado en DOM/localStorage.
// ============================================
const TourGate = {
  _updateDone: false,
  _welcomeDone: false,

  init() {
    this._watchUpdateOverlay();
    this._watchWelcomeOverlay();
  },

  _watchUpdateOverlay() {
    const selector = '.lobby-update-overlay, #lobby-update-overlay, .update-overlay';
    const check = () => {
      const stillThere = document.querySelector(selector);
      if (!stillThere) { this._updateDone = true; }
      else setTimeout(check, 300);
    };
    check();
  },

  _watchWelcomeOverlay() {
    const check = () => {
      const w = document.getElementById('welcome-overlay');
      const visible = w && w.classList.contains('welcome-visible');
      const dismissed = localStorage.getItem('dd_welcome_dismissed') === 'true';
      if (dismissed && !visible) { this._welcomeDone = true; }
      else setTimeout(check, 300);
    };
    check();
  },

  ready() { return this._updateDone && this._welcomeDone; },

  waitUntilReady(cb) {
    const poll = () => {
      if (this.ready()) cb();
      else setTimeout(poll, 300);
    };
    poll();
  }
};
// ============================================
// GUÍA VISUAL DE LA APP (AppTour)
// Recorrido de onboarding por pestañas, una sola vez.
// No depende de ni modifica ningún método existente de Lobby.
// ============================================
const AppTour = {
  STORAGE_KEY: 'dd_apptour_seen',

    steps: [
    { tab: 'lobby', slides: [
      { text: 'Esta es la pestaña donde podrás mantenerte al tanto de las actualizaciones tanto de la app como de revelaciones de cartas.', keywords: ['actualizaciones', 'revelaciones de cartas'] },
      { text: 'Al fondo de la app podrás ver la versión y detalles de creación de esta app.', keywords: ['versión y detalles de creación'] }
    ]},
    { tab: 'buscador', slides: [
      { text: 'Busca cualquier carta específica o al azar. Puedes emplear filtros por tipo, atributos y tipo de carta, tanto por set/pack como por arquetipo.', keywords: ['filtros', 'set/pack', 'arquetipo'] },
      { text: 'Al buscar una carta puedes ver su ficha de detalles o agregarla a la lista activa del deck en turno. Si no hay deck activo, se creará el Decklist con las cartas que vayas agregando.', keywords: ['ficha de detalles', 'deck en turno'] },
      { text: 'Podrás también marcar cartas como Staples, Favoritas, y si la carta lo posee, revisar el arquetipo del que proviene o el Lore al que pertenece.', keywords: ['Staples', 'Favoritas', 'Lore'] }
    ]},
    { tab: 'mideck', slides: [
      { text: 'En esta pestaña podrás ver una versión resumida y detallada de tus cartas del deck activo, ponerle nombre al deck, guardar cambios o importar Decklist o recetas en formato .ydk.', keywords: ['resumida y detallada', '.ydk'] },
      { text: 'En el panel lateral (en el celular lo verás abajo) podrás revisar los Decks Guardados, tus cartas Favoritas, tus Engines guardados y tus cartas marcadas como Staples.', keywords: ['Decks Guardados', 'Engines', 'Staples'] },
      { text: 'En la vista Detallada, cada carta la podrás pasar al Side Deck o cambiar su rol en el deck. La app evalúa automáticamente los efectos de la carta para sugerir sus posibles roles.', keywords: ['Side Deck', 'roles'] },
      { text: 'Tu Experiencia con el Deck se registra al fondo de esta pestaña.', keywords: ['Tu Experiencia con el Deck'] },
      { text: 'El Historial de Versiones se irá actualizando solo mientras haces cambios y guardas, pudiendo recuperar una versión anterior.', keywords: ['Historial de Versiones'] },
      { text: 'Podrás pasar rápidamente a Experimentar o Probar el deck en los Simuladores.', keywords: ['Simuladores'] },
      { text: 'En Mi Deck también podrás ver la Construcción del deck, considerando las cartas más usadas en los decks agregados al Meta.', keywords: ['Construcción del deck', 'Meta'] },
      { text: 'En Optimización podrás registrar tus duelos para analizar tu Winrate yendo 1ro y 2do, evaluar la Complejidad del deck según tu conocimiento del mismo, y anotar detalles a tener en cuenta a futuro.', keywords: ['Optimización', 'Complejidad del deck'] },
      { text: 'Podrás ver las cartas más clave de tu deck según las veces que fueron marcadas como cartas clave en las rondas registradas.', keywords: ['cartas clave'] },
      { text: 'El Historial de Enfrentamientos se puede exportar en formato .txt para analizarlo luego. También podrás registrar Nuevas Rondas de Duelo marcando los detalles en vivo.', keywords: ['Historial de Enfrentamientos', 'Nuevas Rondas de Duelo'] },
      { text: 'En el Historial de Sesiones podrás ver cada conjunto de rondas como una sesión, analizando la racha y resultados según la versión del deck.', keywords: ['Historial de Sesiones'] },
      { text: 'En Línea de Combos puedes registrar combos de ese deck guardado para analizar los procedimientos de la estrategia.', keywords: ['Línea de Combos'] }
    ]},
    { tab: 'estadisticas', slides: [
      { text: 'Aquí podrás crear carpetas de listas de Decks (.ydk), y con ello la app tomará en cuenta las cartas más recurrentes y el nivel de poder de los demás contendientes.', keywords: ['carpetas de listas de Decks', 'nivel de poder'] }
    ]},
    { tab: 'simuladores', slides: [
      { text: 'Aquí podrás hacer diferentes pruebas y cálculos con los decks guardados.', keywords: ['pruebas y cálculos'] },
      { text: 'Puedes crear y anotar Torneos para tus duelos en grupo en vivo.', keywords: ['Torneos'] },
      { text: 'Incluso puedes practicar tus decks en un simulador de campo, como si estuvieras jugando en formato físico.', keywords: ['simulador de campo'] }
    ]},
    { tab: 'formacion', slides: [
      { text: 'Podrás tomar apuntes y leer lecciones para aprender más del juego, desde nivel básico hasta nivel competitivo.', keywords: ['apuntes', 'lecciones'] },
      { text: 'Puedes hacer tests para medir tu conocimiento, trivias para ver qué tipo de deck sería ideal para ti, y descubrir qué personaje del anime podrías ser según tu forma de ver el juego.', keywords: ['tests', 'trivias'] }
    ]},
    { tab: 'config', slides: [
      { text: 'En esta pestaña podrás ajustar y cambiar las bases de la app a tu gusto, por si deseas plasmar tu forma personal de automatizar la aplicación.', keywords: ['ajustar y cambiar las bases'] }
    ]}
  ],

  _stepIdx: 0,
  _slideIdx: 0,
  _els: null,

   maybeStart() {
    if (localStorage.getItem(this.STORAGE_KEY) === 'true') return;
    TourGate.init();
    TourGate.waitUntilReady(() => this.start());
  },

  start() {
    this._stepIdx = 0;
    this._slideIdx = 0;
    this._injectStyles();
    this._buildDOM();
    this._fadeDim();
    this._goToTab(this.steps[0].tab);
    this._goToTab(this.steps[0].tab);
    this._render();
  },

  _currentStep() { return this.steps[this._stepIdx]; },
  _currentSlideText() { return this._currentStep().slides[this._slideIdx].text; },

  _highlightHTML(slide) {
    let html = slide.text;
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    (slide.keywords || []).forEach(kw => {
      const re = new RegExp(esc(kw), 'i');
      html = html.replace(re, match => `<span class="apptour-keyword">${match}</span>`);
    });
    return html;
  },

    next() {
    const step = this._currentStep();
    if (this._slideIdx < step.slides.length - 1) { this._slideIdx++; this._render(); return; }
    if (this._stepIdx < this.steps.length - 1) {
      this._stepIdx++; this._slideIdx = 0;
      this._goToTab(this.steps[this._stepIdx].tab);
      this._fadeDim();
      this._render();
      return;
    }
    this.finish();
  },

  prev() {
    if (this._slideIdx > 0) { this._slideIdx--; this._render(); return; }
    if (this._stepIdx > 0) {
      this._stepIdx--;
      this._slideIdx = this.steps[this._stepIdx].slides.length - 1;
      this._goToTab(this.steps[this._stepIdx].tab);
      this._fadeDim();
      this._render();
    }
  },

  finish() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    this._destroyDOM();
  },

  _goToTab(tabName) {
    if (typeof switchTab === 'function') switchTab(tabName);
  },
  _fadeDim() {
    if (!this._els) return;
    const dim = this._els.dim;
    dim.classList.remove('apptour-dim-anim');
    void dim.offsetWidth; // fuerza reflow para reiniciar la animación
    dim.classList.add('apptour-dim-anim');
  },
  _buildDOM() {
    const dim = document.createElement('div');
    dim.id = 'apptour-dim';
    document.body.appendChild(dim);

    const panel = document.createElement('div');
    panel.id = 'apptour-panel';
    panel.innerHTML = `
      <div id="apptour-text"></div>
      <div id="apptour-dots"></div>
      <div id="apptour-controls">
        <button id="apptour-skip" type="button">Saltar</button>
        <button id="apptour-prev" type="button">Atrás</button>
        <button id="apptour-next" type="button">Siguiente</button>
      </div>`;
    document.body.appendChild(panel);

    this._els = {
      dim, panel,
      text: panel.querySelector('#apptour-text'),
      dots: panel.querySelector('#apptour-dots'),
      skip: panel.querySelector('#apptour-skip'),
      prevBtn: panel.querySelector('#apptour-prev'),
      nextBtn: panel.querySelector('#apptour-next')
    };
    this._els.skip.onclick = () => this.finish();
    this._els.prevBtn.onclick = () => this.prev();
    this._els.nextBtn.onclick = () => this.next();
  },

  _destroyDOM() {
    if (!this._els) return;
    this._els.dim.remove();
    this._els.panel.remove();
    this._els = null;
  },

  _render() {
    if (!this._els) return;
    const step = this._currentStep();
    this._els.text.innerHTML = this._highlightHTML(this._currentStep().slides[this._slideIdx]);
    this._els.dots.innerHTML = step.slides.map((_, i) =>
      `<span class="apptour-dot${i === this._slideIdx ? ' apptour-dot-active' : ''}"></span>`
    ).join('');
    this._els.prevBtn.style.visibility = (this._stepIdx === 0 && this._slideIdx === 0) ? 'hidden' : 'visible';
    const isLast = this._stepIdx === this.steps.length - 1 && this._slideIdx === step.slides.length - 1;
    this._els.nextBtn.textContent = isLast ? 'Finalizar' : 'Siguiente';
  },

  _injectStyles() {
    if (document.getElementById('apptour-styles')) return;
    const style = document.createElement('style');
    style.id = 'apptour-styles';
    style.textContent = `
    #apptour-dim { position: fixed; inset: 0; background: rgba(0,0,0,0.72); z-index: 9998; opacity: 1; }
      #apptour-dim.apptour-dim-anim { animation: apptourDimFade 1s ease-in; }
      @keyframes apptourDimFade { from { opacity: 0; } to { opacity: 1; } }
      .apptour-keyword { color: var(--gold-color, #d4af37); font-weight: 700; }
      #apptour-panel {
        position: fixed; left: 0; right: 0; bottom: 0; max-height: 22vh;
        background: var(--bg-card, #1c1c24); color: var(--text-light, #fff);
        border-top: 2px solid var(--gold-color, #d4af37); z-index: 9999;
        padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
        display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;
      }
      #apptour-text { font-size: 0.95rem; line-height: 1.35; overflow-y: auto; }
      #apptour-dots { display: flex; gap: 6px; justify-content: center; margin: 8px 0; }
      .apptour-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); }
      .apptour-dot-active { background: var(--gold-color, #d4af37); }
      #apptour-controls { display: flex; justify-content: space-between; align-items: center; }
      #apptour-controls button {
        background: none; border: 1px solid var(--gold-color, #d4af37);
        color: var(--text-light, #fff); border-radius: 6px; padding: 6px 14px;
        cursor: pointer; font-size: 0.85rem;
      }
      #apptour-next { background: var(--gold-color, #d4af37); color: #1c1c24; font-weight: 600; }
      @media (max-width: 600px) { #apptour-panel { max-height: 26vh; padding: 12px 14px; } }
    `;
    document.head.appendChild(style);
  }
};
// Bloquea TabIntro hasta que el App Tour se complete por primera vez.
// Si el usuario ya vio el Tour antes, TabIntro funciona normal sin demora.
(function gateTabIntro() {
  if (typeof TabIntro === 'undefined' || typeof TabIntro.maybeShow !== 'function') return;
  const originalMaybeShow = TabIntro.maybeShow.bind(TabIntro);
  TabIntro.maybeShow = function(tabName) {
    if (localStorage.getItem(AppTour.STORAGE_KEY) !== 'true') return;
    return originalMaybeShow(tabName);
  };
})();
window.addEventListener('load', () => AppTour.maybeStart());