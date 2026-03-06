/* formacion.js — Formación, Meta, Config, Welcome, MusicPlayer y ayuda contextual */
/* Absorbe: formacion.js, meta.js, config.js, welcome.js, help.js */


// ── Formacion — sub-tabs: Apuntes, Temas, Juegos, Fuentes (→Meta), Maestros (→Meta) ──

const Formacion = {

    container:     null,
    activeTab:     'apuntes',
    NOTES_KEY:     'yugioh_formacion_notes',
    MASTERED_KEY:  'yugioh_formacion_mastered',

    TOPICS: [
        { id: 'que-es-yugioh',            label: '¿Qué es Yu-Gi-Oh!?',                  nivel: 'novato' },
        { id: 'fases-del-duelo',          label: 'Las Fases del Duelo',                  nivel: 'novato' },
        { id: 'tipos-cartas-basicas',     label: 'Tipos de Cartas Básicas',              nivel: 'novato' },
        { id: 'tipos-cartas-especiales',  label: 'Tipos de Cartas Especiales',           nivel: 'novato' },
        { id: 'estructura-efecto-carta',  label: 'Estructura de un Efecto de Carta',     nivel: 'novato' },
        { id: 'funciones-cartas',         label: 'Funciones de las Cartas',              nivel: 'novato' },
        { id: 'mentalidad-jugador',       label: 'Mentalidad del Jugador',               nivel: 'novato' },
        { id: 'anatomia-deck',            label: 'Anatomía de un Deck Competitivo',      nivel: 'casual' },
        { id: 'staples-formato',          label: 'Staples del Formato',                  nivel: 'casual' },
        { id: 'elegir-construir-deck',    label: 'Cómo Elegir y Construir tu Deck',      nivel: 'casual' },
        { id: 'optimizar-deck',           label: 'Cómo Optimizar tu Deck',               nivel: 'casual' },
        { id: 'side-deck',                label: 'El Side Deck',                         nivel: 'casual' },
        { id: 'gestion-lp-recursos',      label: 'Gestión de LP y Recursos',             nivel: 'casual' },
        { id: 'leer-campo-oponente',      label: 'Leer el Campo del Oponente',           nivel: 'casual' },
        { id: 'velocidad-efectos',        label: 'Velocidad de Efectos y Cadenas',       nivel: 'competitivo' },
        { id: 'rulings-invocaciones',     label: 'Rulings de Invocaciones',              nivel: 'competitivo' },
        { id: 'rulings-batalla',          label: 'Rulings en Fase de Batalla',           nivel: 'competitivo' },
        { id: 'if-when-timing',           label: 'IF vs WHEN y Timing Avanzado',         nivel: 'competitivo' },
        { id: 'formatos-diferencias',     label: 'Formatos y sus Diferencias',           nivel: 'competitivo' },
    ],

    PLATFORMS: ['PC', 'GBC', 'GBA', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'Físico'],

    // ===============================

    init: function () {
        this.container = document.getElementById('formacion-content');
        if (!this.container) return;
        this.render();
    },

    render: function () {
        if (!this.container) return;
        const activeTopics = this._getActiveTopics();

        this.container.innerHTML = `
            <h2>Formación</h2>

            <!-- Sub-nav estilo Simuladores -->
            <div class="form-subnav" id="form-subnav">
                <button class="form-subnav-btn${this.activeTab === 'apuntes' ? ' active' : ''}"
                        onclick="Formacion.switchTab('apuntes')">📓 Apuntes</button>
                ${activeTopics.map(t => `
                    <button class="form-subnav-btn${this.activeTab === t.id ? ' active' : ''}"
                            onclick="Formacion.switchTab('${t.id}')">📖 ${t.label}</button>
                `).join('')}
                <button class="form-subnav-btn${this.activeTab === 'juegos' ? ' active' : ''}"
                        onclick="Formacion.switchTab('juegos')">🎮 Juegos</button>
                <button class="form-subnav-btn${this.activeTab === 'fuentes' ? ' active' : ''}"
                        onclick="Formacion.switchTab('fuentes')">🔗 Fuentes</button>
                <button class="form-subnav-btn${this.activeTab === 'maestros' ? ' active' : ''}"
                        onclick="Formacion.switchTab('maestros')">🎓 Maestros</button>
            </div>

            <!-- Contenido de sub-pestañas -->
            <div id="form-tab-content">
                ${this._renderCurrentTab()}
            </div>
        `;
    },

    switchTab: function (tabId) {
    this.activeTab = tabId;
    const content = document.getElementById('form-tab-content');
    if (!content) return;
    content.innerHTML = this._renderCurrentTab();
    document.querySelectorAll('.form-subnav-btn').forEach(btn => {
        const map = {
            apuntes:  'Apuntes',
            juegos:   'Juegos',
            fuentes:  'Fuentes',
            maestros: 'Maestros'
        };
        const label = map[tabId] || (this.TOPICS.find(t => t.id === tabId)?.label || '');
        btn.classList.toggle('active', label && btn.textContent.trim().includes(label));
    });
},

    _renderCurrentTab: function () {
        if (this.activeTab === 'apuntes') return this._renderApuntesTab();
        if (this.activeTab === 'juegos')  return this._renderJuegosTab();
        const topic = this.TOPICS.find(t => t.id === this.activeTab);
        if (topic) return this._renderTopicTab(topic);
        if (this.activeTab === 'fuentes')  return this._renderFuentesTab();
        if (this.activeTab === 'maestros') return this._renderMaestrosTab();
        return '';
    },

    // ===============================

    _renderApuntesTab: function () {
        return `
            <div class="form-apuntes-layout">

                <!-- Editor -->
                <div class="form-apuntes-editor">
                    <div class="form-apuntes-editor-header">
                        <input type="text" id="apunte-titulo" class="form-apunte-title-input"
                               placeholder="Título del apunte..." maxlength="80">
                    </div>
                    <textarea id="apunte-contenido" class="form-apunte-textarea"
                              placeholder="Escribe tus apuntes aquí..."></textarea>
                    <div class="form-apunte-actions">
                        <button class="form-apunte-btn form-apunte-btn--save"
                                onclick="Formacion.saveNote()">💾 Guardar</button>
                        <button class="form-apunte-btn form-apunte-btn--download"
                                onclick="Formacion.downloadNote()">⬇ Descargar .txt</button>
                        <button class="form-apunte-btn form-apunte-btn--clear"
                                onclick="Formacion.clearEditor()">✕ Limpiar</button>
                    </div>
                </div>

                <!-- Lista de apuntes -->
                <div class="form-apuntes-list-panel">
                    <div class="form-apuntes-list-header">
                        <span>Lista de apuntes:</span>
                        <label class="form-apunte-import-btn" title="Importar .txt">
                            📂 Importar
                            <input type="file" accept=".txt" style="display:none;"
                                   onchange="Formacion.importNote(this)">
                        </label>
                    </div>
                    <div id="form-notes-list" class="form-notes-list">
                        ${this._renderNotesList()}
                    </div>
                </div>

            </div>
        `;
    },

    _renderNotesList: function () {
        const notes = this._getNotes();
        if (!notes.length) return '<p class="form-empty">Sin apuntes guardados.</p>';
        return notes.map((n, i) => `
            <div class="form-note-item" id="form-note-item-${i}">
                <div class="form-note-name" onclick="Formacion.openNote(${i})" title="${this._escHtml(n.title)}">
                    📄 ${this._escHtml(n.title || 'Sin título')}
                </div>
                <div class="form-note-item-btns">
                    <button class="form-note-btn form-note-btn--open"
                            onclick="Formacion.openNote(${i})">Abrir</button>
                    <button class="form-note-btn form-note-btn--dl"
                            onclick="Formacion.downloadNoteByIndex(${i})">⬇</button>
                    <button class="form-note-btn form-note-btn--del"
                            onclick="Formacion.deleteNote(${i})">✕</button>
                </div>
            </div>
        `).join('');
    },

    saveNote: function () {
        const title   = document.getElementById('apunte-titulo')?.value.trim();
        const content = document.getElementById('apunte-contenido')?.value.trim();
        if (!title && !content) { alert('Escribe algo antes de guardar.'); return; }
        const notes = this._getNotes();
        // Si hay un apunte abierto con el mismo título, sobreescribir
        const idx = notes.findIndex(n => n.title === (title || 'Sin título'));
        const note = { title: title || 'Sin título', content, date: new Date().toISOString() };
        if (idx >= 0) notes[idx] = note;
        else notes.unshift(note);
        this._saveNotes(notes);
        this._refreshNotesList();
    },

    openNote: function (index) {
        const notes = this._getNotes();
        const n     = notes[index];
        if (!n) return;
        const titleEl   = document.getElementById('apunte-titulo');
        const contentEl = document.getElementById('apunte-contenido');
        if (titleEl)   titleEl.value   = n.title;
        if (contentEl) contentEl.value = n.content;
        titleEl?.focus();
    },

    deleteNote: function (index) {
        const notes = this._getNotes();
        notes.splice(index, 1);
        this._saveNotes(notes);
        this._refreshNotesList();
    },

    clearEditor: function () {
        const t = document.getElementById('apunte-titulo');
        const c = document.getElementById('apunte-contenido');
        if (t) t.value = '';
        if (c) c.value = '';
    },

    downloadNote: function () {
        const title   = document.getElementById('apunte-titulo')?.value.trim() || 'apunte';
        const content = document.getElementById('apunte-contenido')?.value || '';
        this._downloadTxt(title, content);
    },

    downloadNoteByIndex: function (index) {
        const n = this._getNotes()[index];
        if (!n) return;
        this._downloadTxt(n.title, n.content);
    },

    importNote: function (input) {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const titleEl   = document.getElementById('apunte-titulo');
            const contentEl = document.getElementById('apunte-contenido');
            if (titleEl)   titleEl.value   = file.name.replace('.txt', '');
            if (contentEl) contentEl.value = e.target.result;
        };
        reader.readAsText(file);
        input.value = '';
    },

    _downloadTxt: function (filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${filename}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    _refreshNotesList: function () {
        const el = document.getElementById('form-notes-list');
        if (el) el.innerHTML = this._renderNotesList();
    },

    _getNotes: function () {
        try { return JSON.parse(localStorage.getItem(this.NOTES_KEY)) || []; }
        catch (_) { return []; }
    },

    _saveNotes: function (notes) {
        localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
    },

    // ===============================

    _renderTopicTab: function (topic) {
        const mastered = this._getMastered();
        const html     = this._getTopicContent(topic.id);
        return `
            <div class="form-topic-container">
                <div class="form-notebook">
                    ${html}
                </div>
                ${!mastered.includes(topic.id) ? `
                    <div class="form-topic-footer">
                        <button class="form-mastered-btn" onclick="Formacion.masterTopic('${topic.id}')">
                            ✅ Tema Dominado
                        </button>
                    </div>
                ` : `
                    <div class="form-topic-footer">
                        <span class="form-mastered-badge">✅ Ya dominaste este tema</span>
                        <button class="form-unmaster-btn" onclick="Formacion.unmasterTopic('${topic.id}')">
                            Marcar como no dominado
                        </button>
                    </div>
                `}
            </div>
        `;
    },

    masterTopic: function (topicId) {
        const mastered = this._getMastered();
        if (!mastered.includes(topicId)) mastered.push(topicId);
        this._saveMastered(mastered);
        // Actualizar vista: quitar el botón
        const footer = document.querySelector('.form-topic-footer');
        if (footer) footer.outerHTML = `
            <div class="form-topic-footer">
                <span class="form-mastered-badge">✅ Ya dominaste este tema</span>
                <button class="form-unmaster-btn" onclick="Formacion.unmasterTopic('${topicId}')">
                    Marcar como no dominado
                </button>
            </div>`;
        if (window.ConfigManager?.getFormacionTopicsConfig?.()[topicId]?.hideOnMaster !== false) {
            this.render();
        }
    },

    unmasterTopic: function (topicId) {
        const mastered = this._getMastered().filter(id => id !== topicId);
        this._saveMastered(mastered);
        this.render();
    },

    _getMastered: function () {
        try { return JSON.parse(localStorage.getItem(this.MASTERED_KEY)) || []; }
        catch (_) { return []; }
    },

    _saveMastered: function (arr) {
        localStorage.setItem(this.MASTERED_KEY, JSON.stringify(arr));
    },

    _getActiveTopics: function () {
        const mastered     = this._getMastered();
        const topicsConfig = window.ConfigManager?.getFormacionTopicsConfig?.() ?? {};
        return this.TOPICS.filter(t => {
            const cfg = topicsConfig[t.id];
            if (cfg && cfg.active === false) return false;
            if (mastered.includes(t.id) && (cfg?.hideOnMaster !== false)) return false;
            return true;
        });
    },

    // ===============================

    _getTopicContent: function (topicId) {
        const topics = {
            'que-es-yugioh':           this._topicQueEsYugioh(),
            'fases-del-duelo':         this._topicFasesDelDuelo(),
            'tipos-cartas-basicas':    this._topicTiposCartasBasicas(),
            'tipos-cartas-especiales': this._topicTiposCartasEspeciales(),
            'estructura-efecto-carta': this._topicEstructuraEfecto(),
            'funciones-cartas':        this._topicFuncionesCartas(),
            'mentalidad-jugador':      this._topicMentalidad(),
            'anatomia-deck':           this._topicAnatomia(),
            'staples-formato':         this._topicStaples(),
            'elegir-construir-deck':   this._topicConstruirDeck(),
            'optimizar-deck':          this._topicOptimizar(),
            'side-deck':               this._topicSideDeck(),
            'gestion-lp-recursos':     this._topicGestionLP(),
            'leer-campo-oponente':     this._topicLeerCampo(),
            'velocidad-efectos':       this._topicVelocidadEfectos(),
            'rulings-invocaciones':    this._topicRulingsInvocaciones(),
            'rulings-batalla':         this._topicRulingsBatalla(),
            'if-when-timing':          this._topicIfWhen(),
            'formatos-diferencias':    this._topicFormatos(),
        };
        return topics[topicId] || '<p>Contenido no disponible.</p>';
    },

    _topicQueEsYugioh: function () {
        return `
            <h2 class="form-nb-title">¿Qué es Yu-Gi-Oh!?</h2>

            <h3 class="form-nb-subtitle">📜 Historia y Origen</h3>
            <p class="form-nb-text">
                Yu-Gi-Oh! es una franquicia japonesa creada por <strong>Kazuki Takahashi</strong> en 1996, 
                publicada en la revista Shonen Jump de Shueisha. Lo que comenzó como un manga de 
                juegos de azar y magia evolucionó en uno de los juegos de cartas coleccionables 
                más populares del mundo, gestionado actualmente por <strong>Konami</strong>.
            </p>

            <h3 class="form-nb-subtitle">🃏 ¿De qué trata el juego?</h3>
            <p class="form-nb-text">
                Es un juego de cartas estratégico donde dos jugadores se enfrentan con mazos de 
                40 a 60 cartas. El objetivo principal es reducir los <strong>Puntos de Vida (LP)</strong> 
                del rival de 8000 a 0 invocando monstruos, activando hechizos y trampas.
            </p>

            <h3 class="form-nb-subtitle">📦 Tipos de Cartas</h3>
            <p class="form-nb-text">
                Existen tres tipos principales de cartas:
            </p>
            <ul class="form-nb-list">
                <li><strong>Monstruos:</strong> Atacan y defienden. Tienen ATK (ataque) y DEF (defensa).</li>
                <li><strong>Hechizos (Magias):</strong> Efectos instantáneos o continuos que apoyan tu estrategia.</li>
                <li><strong>Trampas:</strong> Se activan en respuesta a las acciones del rival.</li>
            </ul>

            <h3 class="form-nb-subtitle">⚔️ Condiciones de Victoria</h3>
            <ul class="form-nb-list">
                <li>Reducir los LP del rival a 0.</li>
                <li>El rival no puede robar carta al inicio de su turno (deck out).</li>
                <li>Cumplir la condición especial de una carta (ej: Exodia).</li>
            </ul>

            <h3 class="form-nb-subtitle">🏆 Formatos de Juego</h3>
            <p class="form-nb-text">
                El juego tiene varios formatos competitivos activos:
            </p>
            <ul class="form-nb-list">
                <li><strong>TCG:</strong> Formato occidental (Europa y América).</li>
                <li><strong>OCG:</strong> Formato oriental (Japón, Asia).</li>
                <li><strong>Master Duel:</strong> Versión digital oficial de Konami.</li>
                <li><strong>Duel Links:</strong> Versión móvil simplificada.</li>
                <li><strong>Genesys:</strong> Formato alternativo con sus propias reglas.</li>
            </ul>

            <h3 class="form-nb-subtitle">📊 ¿Por qué es tan complejo?</h3>
            <p class="form-nb-text">
                Con más de <strong>12,000 cartas</strong> publicadas y reglas que evolucionan constantemente 
                vía la <em>banlist</em>, Yu-Gi-Oh! es considerado uno de los juegos de cartas más 
                complejos. La diferencia entre un jugador casual y uno competitivo radica en el 
                conocimiento del meta, las interacciones de cartas y la gestión del recurso.
            </p>
        `;
    },

    // ===============================

    _renderJuegosTab: function () {
        const games = window.ConfigManager?.getFormacionGames?.() ?? [];
        if (!games.length) {
            return '<p class="form-empty" style="margin-top:20px;">No hay juegos configurados. Ve a Configuración → Juegos Alternativos.</p>';
        }
        return `
            <div class="form-section" style="margin-top:12px;">
                <div class="form-section-content" style="border-top:none;">
                    <div class="form-juegos-grid">
                        ${games.map(g => this._renderGameCard(g)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    _renderGameCard: function (g) {
        const platforms = Array.isArray(g.platforms) ? g.platforms : [];
        const platformBadges = platforms.length
            ? platforms.map(p => `<span class="form-platform-badge">${this._escHtml(p)}</span>`).join('')
            : '<span class="form-platform-badge form-platform-none">Sin plataforma</span>';

        const fallback = g.fallbackUrl ? g.fallbackUrl.trim() : '';
        const resolved = fallback.startsWith('local:')
            ? (window.ConfigManager?.getFormacionFallbacks?.()[fallback.replace('local:', '')] || '')
            : fallback;

        const imgBlock = resolved
            ? `<img class="form-game-img" src="${this._escAttr(resolved)}" alt="${this._escAttr(g.name || '')}" loading="lazy">`
            : `<div class="form-game-img form-game-img--empty"><span>Sin imagen</span></div>`;

        const hasLink = g.link ? g.link.trim() : '';
        return `
            <a class="form-game-card${hasLink ? '' : ' form-game-card--nolink'}"
               ${hasLink ? `href="${this._escAttr(hasLink)}" target="_blank" rel="noopener noreferrer"` : ''}
               title="${this._escAttr(g.name || '')}">
                <div class="form-game-img-wrap">${imgBlock}</div>
                <div class="form-game-info">
                    <div class="form-game-name">${this._escHtml(g.name || 'Sin nombre')}</div>
                    ${g.title ? `<div class="form-game-title">${this._escHtml(g.title)}</div>` : ''}
                    <div class="form-game-platforms">
                        <span class="form-platforms-label">Plataforma:</span>
                        <div class="form-platforms-row">${platformBadges}</div>
                    </div>
                </div>
            </a>
        `;
    },

    // ===============================

    _escHtml: function (str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    _escAttr: function (str) {
        return String(str).replace(/"/g, '&quot;');
    },
    _renderFuentesTab: function () {
    if (window.Meta) return Meta._renderFuentesSection();
    return '<p class="form-empty">Módulo Meta no disponible.</p>';
},

_renderMaestrosTab: function () {
    if (window.Meta) return Meta._renderMaestrosSection();
    return '<p class="form-empty">Módulo Meta no disponible.</p>';
},

// ── CONTENIDO DE TEMAS ────────────────────────────────────────────

    _topicFasesDelDuelo: function () { return `
        <h2 class="form-nb-title">Las Fases del Duelo</h2>
        <p class="form-nb-text">Un duelo de Yu-Gi-Oh! no es caótico — tiene una estructura fija de fases que se repite cada turno. Entender cuándo puedes hacer qué cosa es la base de todo lo demás.</p>

        <h3 class="form-nb-subtitle">📋 Las 6 Fases en Orden</h3>
        <ul class="form-nb-list">
            <li><strong>1. Draw Phase (DP):</strong> Robas 1 carta. El jugador que va primero en el primer turno NO roba. Algunos efectos obligatorios se activan aquí.</li>
            <li><strong>2. Standby Phase (SP):</strong> Fase de mantenimiento. Efectos periódicos y costos de mantenimiento se activan aquí. Ambos jugadores pueden responder.</li>
            <li><strong>3. Main Phase 1 (MP1):</strong> La fase más activa. Puedes invocar, activar hechizos, colocar trampas y activar efectos. Construyes tu campo antes de atacar.</li>
            <li><strong>4. Battle Phase (BP):</strong> Declaras ataques. El jugador que va primero NO puede atacar en su primer turno. Los ataques se resuelven uno a uno con sus subfases propias.</li>
            <li><strong>5. Main Phase 2 (MP2):</strong> Igual que MP1 pero después de atacar. Útil para colocar trampas o invocar monstruos que no necesitan atacar este turno.</li>
            <li><strong>6. End Phase (EP):</strong> Descartas hasta 6 cartas si tienes más. Efectos de "al final del turno" y efectos temporales expiran aquí.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚖️ Las 2 Reglas de Oro</h3>
        <ul class="form-nb-list">
            <li><strong>Regla 1 — Duelo de caballeros:</strong> Siempre pide permiso antes de pasar de fase. Confirma cada acción importante con tu oponente. En torneo, una jugada no comunicada puede generar problemas serios.</li>
            <li><strong>Regla 2 — Se juega por partes:</strong> Anuncia qué estás haciendo y espera respuesta antes de continuar. El oponente puede interrumpirte en casi cualquier momento con la carta correcta — darle esa ventana es parte del juego limpio.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El error más común del novato es actuar sin respetar las fases. Poner una trampa en MP1 la deja activa ese mismo turno — pero el oponente puede destruirla antes de que la uses. Ponerla en MP2 la protege hasta el turno del oponente. Aprender a usar MP2 correctamente separa al jugador intuitivo del que realmente entiende la estructura.</p>
    `; },

    _topicTiposCartasBasicas: function () { return `
        <h2 class="form-nb-title">Tipos de Cartas Básicas</h2>
        <p class="form-nb-text">Antes de aprender combos o estrategias, necesitas saber exactamente qué puede hacer cada tipo de carta y cuándo puede usarse.</p>

        <h3 class="form-nb-subtitle">👾 Monstruos</h3>
        <ul class="form-nb-list">
            <li><strong>Invocación Normal:</strong> 1 por turno, boca arriba en ataque, o "seteado" boca abajo en defensa. Sin efectos adicionales.</li>
            <li><strong>ATK / DEF:</strong> Puntos de ataque y defensa. El ATK se compara al atacar; la DEF solo importa en posición de defensa.</li>
            <li><strong>Monstruos Normales (Vainilla):</strong> Solo texto de lore — sin efectos. Pero son válidos como materiales de Extra Deck.</li>
            <li><strong>Monstruos de Efecto:</strong> Tienen uno o más efectos activables o continuos que definen su función.</li>
            <li><strong>Cambio de Posición:</strong> 1 vez por turno, no si fue invocado ese turno, no si ya atacó.</li>
        </ul>

        <h3 class="form-nb-subtitle">🟢 Hechizos (Magias)</h3>
        <ul class="form-nb-list">
            <li><strong>Normal:</strong> Se activa y va al cementerio. Efecto inmediato.</li>
            <li><strong>Continuo:</strong> Permanece en campo mientras su efecto esté activo.</li>
            <li><strong>Equipo:</strong> Se equipa a un monstruo y modifica sus stats o le da efectos.</li>
            <li><strong>Campo:</strong> Va a la zona de campo. Solo 1 por lado del tablero.</li>
            <li><strong>Ritual:</strong> Realiza una Invocación Ritual específica.</li>
            <li><strong>Juego Rápido:</strong> Puede activarse en cualquier fase de TU turno, o en el turno del oponente si estaba boca abajo desde el turno anterior. ¡El único hechizo que puede usarse como respuesta!</li>
        </ul>

        <h3 class="form-nb-subtitle">🟣 Trampas</h3>
        <ul class="form-nb-list">
            <li><strong>Regla de Oro:</strong> Deben colocarse boca abajo primero. NO pueden activarse el mismo turno que fueron colocadas (salvo excepciones explícitas).</li>
            <li><strong>Normal:</strong> Activa su efecto una vez y va al cementerio.</li>
            <li><strong>Continua:</strong> Permanece en campo y sigue activa.</li>
            <li><strong>Counter (Velocidad 3):</strong> Solo puede ser respondida por otra Counter Trap. Las más rápidas del juego.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Para responder al oponente en su turno necesitas: trampas ya colocadas, hechizos de Juego Rápido boca abajo, o Quick Effects de monstruos en campo. Un hechizo normal en mano no sirve en el turno del oponente. Antes de jugar cualquier carta, pregúntate: ¿es mi turno o el del oponente?</p>
    `; },

    _topicTiposCartasEspeciales: function () { return `
        <h2 class="form-nb-title">Tipos de Cartas Especiales (Extra Deck)</h2>
        <p class="form-nb-text">El Extra Deck guarda hasta 15 cartas especiales que se invocan con mecánicas únicas. En el juego moderno, el Extra Deck es donde está la mayor parte del poder de un deck.</p>

        <h3 class="form-nb-subtitle">🟣 Fusión</h3>
        <p class="form-nb-text">Marco morado. Requiere una Magia de Fusión que combina los materiales desde mano, campo o cementerio. La <em>Fusión de Contacto</em> es inherente (sin magia), y los materiales regresan al deck, no al cementerio.</p>

        <h3 class="form-nb-subtitle">🔵 Ritual</h3>
        <p class="form-nb-text">Marco azul claro. Único tipo que llega del deck principal, no del Extra Deck. Necesita la Magia de Ritual correspondiente y tributar monstruos cuyo nivel total iguale o supere el del Ritual.</p>

        <h3 class="form-nb-subtitle">⚪ Sincronía (Synchro)</h3>
        <p class="form-nb-text">Marco blanco/gris. Necesitas 1 Tuner + 1 o más no-Tuner. La suma exacta de sus niveles debe igualar el del Sincro. Los materiales van al cementerio.</p>

        <h3 class="form-nb-subtitle">⬛ XYZ ("Exceed")</h3>
        <p class="form-nb-text">Marco negro. Necesitas 2+ monstruos del mismo nivel. Los materiales quedan <em>debajo</em> del XYZ — no están en el cementerio hasta que el XYZ se destruye. Los XYZ tienen Rango, no Nivel. El <em>Caos XYZ</em> permite usar otro XYZ como material para invocar una versión superior.</p>

        <h3 class="form-nb-subtitle">🔷 Link</h3>
        <p class="form-nb-text">Marco azul oscuro hexagonal. No tienen DEF ni Nivel — tienen Flechas de Link que habilitan zonas del Extra Deck para tus demás monstruos. Son el andamio de los decks modernos. Sin un Link en campo, solo puedes usar 1 zona central del Extra Deck.</p>

        <h3 class="form-nb-subtitle">🟠🟢 Péndulo</h3>
        <p class="form-nb-text">Marco mitad verde, mitad naranja. Dos cartas Péndulo con escalas distintas se colocan en las Zonas Péndulo. Una vez por turno puedes invocar especialmente todos los monstruos de tu mano cuyo nivel esté dentro del rango de las escalas. Cuando salen del campo, van al tope del Extra Deck boca arriba.</p>

        <h3 class="form-nb-subtitle">📈 Orden de Aprendizaje Recomendado</h3>
        <ul class="form-nb-list">
            <li>1. Fusión — más intuitiva</li>
            <li>2. Sincro — suma de niveles sencilla</li>
            <li>3. XYZ — mismo nivel, concepto de materiales debajo</li>
            <li>4. Link — cambia cómo funciona el tablero completo</li>
            <li>5. Ritual — costoso, necesita conocer el arquetipo</li>
            <li>6. Péndulo — el más complejo, requiere dominar los anteriores</li>
        </ul>
    `; },

    _topicEstructuraEfecto: function () { return `
        <h2 class="form-nb-title">Estructura de un Efecto de Carta</h2>
        <p class="form-nb-text">Leer mal una carta es uno de los errores más costosos en Yu-Gi-Oh!. Cada línea de texto tiene una función específica. Este tema te enseña a diseccionar cualquier efecto, incluso uno que nunca hayas visto.</p>

        <h3 class="form-nb-subtitle">🔬 Las 6 Partes de un Efecto</h3>
        <ul class="form-nb-list">
            <li><strong>1. Requisito:</strong> Condición externa previa. Generalmente antes de los dos puntos. Ej: "Si tienes un monstruo X en campo:"</li>
            <li><strong>2. Condición:</strong> Restricción de activación. Ej: "Solo puedes activar este efecto una vez por turno."</li>
            <li><strong>3. Costo:</strong> Lo que pagas ANTES de que resuelva. Si te niegan el efecto, el costo ya fue pagado y no se devuelve. Los dos puntos después del costo son la señal: "Descarta 1 carta:"</li>
            <li><strong>4. Efecto/Objetivo:</strong> Lo que hace al resolver. Si dice "selecciona" o "elige", tiene objetivo (target) — el oponente puede responder a la selección. Sin esas palabras, el efecto no tiene objetivo.</li>
            <li><strong>5. Duración:</strong> Por cuánto tiempo aplica. Si no lo dice, es permanente o hasta que se quite la carta.</li>
            <li><strong>6. Restricción:</strong> Limitación DESPUÉS de resolver. Ej: "No puedes atacar directamente el turno que actives este efecto."</li>
        </ul>

        <h3 class="form-nb-subtitle">🔗 Conectores Lógicos Clave</h3>
        <ul class="form-nb-list">
            <li><strong>IF (si):</strong> Menos estricto. La condición no necesita ser "lo último" que ocurrió.</li>
            <li><strong>WHEN (cuando):</strong> Más estricto. El efecto puede perder el timing si no fue lo último que pasó.</li>
            <li><strong>THEN / AND IF YOU DO:</strong> Las dos partes se resuelven en orden. Si falla la primera, falla la segunda.</li>
            <li><strong>YOU CAN (puedes):</strong> El efecto es opcional.</li>
            <li><strong>ONCE PER TURN:</strong> 1 activación por turno. OJO: "once per turn per card name" limita incluso si tienes múltiples copias.</li>
        </ul>

        <h3 class="form-nb-subtitle">🎯 Con Objetivo vs Sin Objetivo</h3>
        <ul class="form-nb-list">
            <li><strong>Con objetivo ("selecciona"):</strong> El oponente puede responder removiendo el objetivo antes de que resuelva.</li>
            <li><strong>Sin objetivo ("destruye todos"):</strong> No hay selección previa. No pueden escapar por mover la carta.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Lee siempre en este orden: ¿Qué necesito para activarlo? → ¿Qué pago? → ¿Qué hace? → ¿Qué limitación me queda? El jugador que entiende los costos y las restricciones toma mejores decisiones que el que solo ve el efecto en bruto.</p>
    `; },

    _topicFuncionesCartas: function () { return `
        <h2 class="form-nb-title">Funciones de las Cartas (Roles)</h2>
        <p class="form-nb-text">Una carta no vale por sus estadísticas ni por su rareza — vale por lo que hace dentro de tu deck. Identificar la función de cada carta es lo que distingue a alguien que "tiene cartas" de alguien que "juega".</p>

        <h3 class="form-nb-subtitle">⚙️ Cartas Engine (Arman el Combo)</h3>
        <ul class="form-nb-list">
            <li><strong>Starter:</strong> Inicia el combo desde la mano sin necesitar otra carta. La pieza más valiosa del engine. Perder una a una Handtrap es el golpe más duro al inicio del turno.</li>
            <li><strong>Extender:</strong> Continúa o amplía el combo una vez en marcha. No puede iniciar sola, pero sin ella el combo no termina bien. La respuesta a las interrupciones: si te niegan el starter y tienes un extender independiente, puedes seguir.</li>
            <li><strong>Searcher/Buscador:</strong> Busca cartas específicas del deck hacia la mano. No invoca directamente, pero garantiza que tengas la pieza que necesitas.</li>
            <li><strong>Bridge (Puente):</strong> Conecta dos piezas que normalmente no interactúan. Transforma el estado del campo para habilitar lo que viene después.</li>
            <li><strong>Garnet / Brick:</strong> Necesitas en deck para que otro efecto la busque, pero en mano no sirve de nada. Regla: no más de 2 en un deck. Más de eso destruye la consistencia.</li>
        </ul>

        <h3 class="form-nb-subtitle">🛡️ Cartas Defensivas (Interrumpen)</h3>
        <ul class="form-nb-list">
            <li><strong>Handtrap:</strong> Monstruo que activa su efecto desde la mano en respuesta al oponente. No necesita estar en campo. La interrupción estándar del formato moderno.</li>
            <li><strong>Boardbreaker:</strong> Destruye, regresa o neutraliza el campo ya construido del oponente. Se usa principalmente cuando vas segundo.</li>
            <li><strong>Anti-Handtrap:</strong> Protege tu combo de las Handtraps del oponente. En decks combo, tan importantes como el combo mismo.</li>
        </ul>

        <h3 class="form-nb-subtitle">🏆 Cartas de Finalización</h3>
        <ul class="form-nb-list">
            <li><strong>Boss Monster:</strong> La amenaza final. El monstruo que el oponente debe resolver para sobrevivir. Buenas protecciones lo hacen muy difícil de quitar.</li>
            <li><strong>Endboard:</strong> No es una carta — es el estado completo de tu campo al terminar tu turno. El objetivo de cualquier combo es llegar al mejor endboard posible.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔄 Las 4 Funciones Universales</h3>
        <p class="form-nb-text">Cuando no sepas clasificar una carta, usa estas 4 categorías: <strong>Motor</strong> (genera recursos, busca, invoca) · <strong>Interacción</strong> (interrumpe al oponente) · <strong>Protección</strong> (mantiene tu campo o cartas) · <strong>Ventaja de Recursos</strong> (te da más cartas, monstruos o LP).</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">La pregunta correcta al evaluar una carta no es "¿es poderosa?" sino "¿qué función cumple en mi deck?" Una carta sin función clara no debería estar en el deck, sin importar qué tan impresionante parezca en papel.</p>
    `; },

    _topicMentalidad: function () { return `
        <h2 class="form-nb-title">Mentalidad del Jugador</h2>
        <p class="form-nb-text">Las reglas se aprenden en semanas. Los combos se memorizan en días. Pero la mentalidad correcta tarda meses en instalarse — y es lo que determina si realmente mejorarás como jugador.</p>

        <h3 class="form-nb-subtitle">🧠 Mentalidades Correctas</h3>
        <ul class="form-nb-list">
            <li><strong>Cartas en contexto:</strong> Las cartas no se evalúan solas — se evalúan en conjunto. Una carta poderosa puede arruinar un deck si contradice su estrategia.</li>
            <li><strong>Cada carta tiene una función:</strong> No existe la carta inútil. Existe la carta en el deck equivocado. Antes de descartar una carta, pregunta: ¿para qué fue diseñada?</li>
            <li><strong>Gusto vs conveniencia:</strong> Si quieres ser competitivo, la conveniencia gana siempre. Puedes tener decks de gusto Y decks competitivos — no tienes que elegir uno.</li>
            <li><strong>Los costos altos no son malos:</strong> Hay cartas que parecen terribles porque descartan 2 o tributan 1000 LP. En el deck correcto, ese costo es exactamente lo que necesitan para activar algo más.</li>
            <li><strong>Practicar es lo que hace bueno un deck:</strong> El deck en papel es una hipótesis. El deck jugado 50 veces es la respuesta. Muchos decks considerados débiles son fuertes en manos de quien los conoce profundamente.</li>
            <li><strong>El META no es permanente:</strong> Es el mejor entendimiento colectivo del momento. En 3 meses puede cambiar completamente.</li>
            <li><strong>Todo deck tiene puntos débiles:</strong> No hay deck invencible. Hay decks que los jugadores no saben cómo vencer porque aún no encontraron el counter correcto.</li>
            <li><strong>Yu-Gi-Oh! es probabilidad:</strong> Las cartas salen de un deck barajado. Entender esto te evita frustraciones por malas manos y te ayuda a construir decks que maximicen las probabilidades de éxito.</li>
            <li><strong>Consistencia vs Potencia:</strong> No puedes maximizar ambas al mismo tiempo. Saber qué necesita tu deck es una decisión estratégica, no técnica.</li>
        </ul>

        <h3 class="form-nb-subtitle">🎯 Cómo Usar el Tipo de Carta Correctamente</h3>
        <ul class="form-nb-list">
            <li>¿Es mi turno o el del oponente? → Qué cartas puedo usar activamente.</li>
            <li>¿Cuántas interacciones tiene el oponente? → Si tiene muchas, no gastes el combo principal todavía.</li>
            <li>¿Cómo empezó el oponente? → Mano llena y campo vacío = probablemente tiene Handtraps.</li>
            <li>¿Voy ganando o perdiendo? → Perdiendo: más riesgos. Ganando: juega seguro.</li>
            <li>¿El oponente hizo un missplay o jugada ilegal? → Detén el juego con calma. Hay un juez para eso.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">La mentalidad es lo que convierte el conocimiento técnico en victoria real. Puedes saber todos los combos del meta y perder constantemente si tu toma de decisiones bajo presión es mala. El mejor entrenamiento no es aprender más combos — es aprender a pensar mejor cuando la jugada correcta no es obvia.</p>
    `; },

    _topicAnatomia: function () { return `
        <h2 class="form-nb-title">Anatomía de un Deck Competitivo</h2>
        <p class="form-nb-text">Todo deck competitivo puede diseccionarse en los mismos componentes. Aprende a leer estas métricas y podrás evaluar cualquier deck que veas, incluso uno que nunca hayas jugado.</p>

        <h3 class="form-nb-subtitle">📊 Los 6 Ejes de Evaluación</h3>
        <ul class="form-nb-list">
            <li><strong>Engine / Consistencia:</strong> El conjunto de cartas del combo principal. Mide qué tan probable es armar la estrategia desde la mano inicial. <em>Ideal: 85%+ de partidas abrir con al menos 1 Starter.</em></li>
            <li><strong>Techo de Poder (The Ceiling):</strong> Qué tan poderoso es el endboard si nadie interrumpió. <em>Ideal: 2+ negaciones, Boardbreakers disponibles, 1 Anti-Meta o Tower.</em></li>
            <li><strong>The Floor / Resiliencia:</strong> Qué pasa cuando el oponente interrumpe. ¿Puede el deck seguir con 1-2 negaciones recibidas? El "Glass Cannon" no tiene Floor — lo interrumpen y queda muerto. <em>Ideal: sobrepasar 2 negaciones corridas y aún tener una amenaza.</em></li>
            <li><strong>Slot Non-Engine / Eficiencia:</strong> Espacio libre después del engine para Handtraps, Boardbreakers, tech cards. Un engine de 30 cartas deja solo 10 para non-engine. Un engine de 18 deja 22 — mucha más libertad.</li>
            <li><strong>Grind Game / Follow-Up:</strong> Qué hace el deck en turnos 3, 4 y 5. ¿Puede rearmar combo? ¿Tiene segunda línea? <em>Ideal: jugadas para turno 3, 4 y 5.</em></li>
            <li><strong>Fragilidad / Choke Point:</strong> Qué tan vulnerable es el deck a 1 sola carta del meta. Si existe 1 carta que lo apaga completamente, tiene un Choke Point crítico.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔧 Otras Métricas</h3>
        <ul class="form-nb-list">
            <li><strong>Lineabilidad:</strong> Qué tan fijo es el camino del combo. Muy lineal = predecible pero poderoso. No-lineal = menos predecible, más complejo.</li>
            <li><strong>Versatilidad:</strong> Cuántas formas distintas de jugar tiene el deck según la mano.</li>
            <li><strong>Cartas Multifuncionales:</strong> Cartas que cumplen más de un rol. Son oro — reducen el tamaño del engine sin perder funciones.</li>
            <li><strong>Tipo de Interacción:</strong> Qué hace al interrumpir: ¿destruye, destierra, regresa al deck, niega? El tipo importa porque el oponente puede tener protecciones contra uno u otro.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">No preguntes solo "¿es poderoso?". Pregunta: ¿es consistente? ¿qué pasa si me niegan? ¿puedo seguir jugando? Un deck con techo de poder perfecto pero sin Floor perderá contra cualquier jugador que haya estudiado sus debilidades.</p>
    `; },

    _topicStaples: function () { return `
        <h2 class="form-nb-title">Staples del Formato</h2>
        <p class="form-nb-text">Un Staple es una carta tan generalmente útil que aparece en la mayoría de los decks del meta, independientemente del arquetipo. No son "las mejores cartas del juego" — son las más versátiles para el meta actual. Y cambian con cada banlist.</p>

        <h3 class="form-nb-subtitle">🤚 Handtraps (Interrupciones desde la Mano)</h3>
        <ul class="form-nb-list">
            <li><strong>Ash Blossom:</strong> Niega cualquier efecto que busque, robe o invoque especialmente desde el deck. Una de las más versátiles.</li>
            <li><strong>Droll &amp; Lock Bird:</strong> Si el oponente agrega 1+ cartas a su mano desde el deck, niega que puedan agregar más ese turno.</li>
            <li><strong>Infinite Impermanence:</strong> Niega el efecto de un monstruo en campo. Si lo seteas en la primera columna sin carta, da inmunidad a esa columna.</li>
            <li><strong>Nibiru, the Primal Being:</strong> Si el oponente invocó especialmente 5+ monstruos ese turno, tribútalos todos y dale un Token Nibiru. La respuesta a los combo-decks.</li>
            <li><strong>Effect Veiler:</strong> Niega el efecto de un monstruo hasta el final del turno. Velocidad 1 desde la mano — limitada pero específica.</li>
            <li><strong>D.D. Crow:</strong> Destierra 1 carta del cementerio del oponente desde la mano. Específico pero devastador contra decks de cementerio.</li>
        </ul>

        <h3 class="form-nb-subtitle">🛡️ Anti-Handtraps (Protegen tu Combo)</h3>
        <ul class="form-nb-list">
            <li><strong>Called by the Grave:</strong> Destierra 1 carta del cementerio del oponente y niega efectos de ese nombre ese turno. Contraresta Ash, Ghost Belle.</li>
            <li><strong>Crossout Designator:</strong> Declara un nombre de carta que tienes en tu deck. Niega todos los efectos de cartas con ese nombre ese turno.</li>
        </ul>

        <h3 class="form-nb-subtitle">💥 Boardbreakers (Destruyen el Campo Rival)</h3>
        <ul class="form-nb-list">
            <li><strong>Dark Ruler No More:</strong> Niega todos los efectos de los monstruos del oponente hasta fin de turno. No puede ser respondido. Limpia el camino.</li>
            <li><strong>Forbidden Droplet:</strong> Manda cartas al cementerio para negar efectos y bajar ATK a la mitad. La respuesta más versátil al campo rival.</li>
            <li><strong>Evenly Matched:</strong> El oponente destierra hasta tener 1 carta. Devastador si tiene campo lleno.</li>
            <li><strong>Super Polymerization:</strong> Fusiona usando cartas del campo del oponente. No puede ser respondida. Quita 2+ amenazas en 1 carta.</li>
            <li><strong>Lightning Storm:</strong> Destruye todos los monstruos de ataque O todas las mágicas/trampas boca abajo. Solo funciona con mano vacía.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">No incluyas un Staple solo porque "es bueno". Pregunta: ¿Su efecto sirve en el meta actual? ¿Su restricción no rompe mi combo? ¿Tengo el espacio en el deck? Un Staple mal incluido es peor que no incluirlo.</p>
    `; },

    _topicConstruirDeck: function () { return `
        <h2 class="form-nb-title">Cómo Elegir y Construir tu Deck</h2>
        <p class="form-nb-text">Elegir mal un deck es el error más costoso en tiempo, dinero y motivación. Este tema te da el proceso completo, desde cero hasta algo funcional que puedas mejorar.</p>

        <h3 class="form-nb-subtitle">🎯 Elegir tu Deck</h3>
        <ul class="form-nb-list">
            <li><strong>Define qué quieres:</strong> ¿Torneo o casual? ¿Combos largos, control lento o agresión rápida? ¿Presupuesto limitado?</li>
            <li><strong>Investiga antes de comprar:</strong> Prueba en un simulador (EDOPro, Master Duel) con un decklist de alguien más. Al menos 10 duelos antes de decidir.</li>
            <li><strong>Evalúa la curva de aprendizaje:</strong> Un deck difícil en manos inexpertas pierde donde uno fácil ganaría. Empieza con algo que puedas ejecutar correctamente.</li>
            <li><strong>Considera precio y versión budget:</strong> La versión budget sacrifica algo (consistencia, una pieza del endboard). Evalúa si ese sacrificio es aceptable para tu objetivo.</li>
        </ul>

        <h3 class="form-nb-subtitle">🧩 Entender las Piezas</h3>
        <ul class="form-nb-list">
            <li><strong>Core:</strong> Cartas que definen al arquetipo. Sin ellas, el deck no es el deck. Siempre en 3 copias si es posible.</li>
            <li><strong>Engine:</strong> El conjunto funcional que arma el combo. Puede incluir cartas de otros arquetipos.</li>
            <li><strong>Non-Engine:</strong> Handtraps, Boardbreakers, tech cards. Define tu adaptación al meta.</li>
            <li><strong>Tech Card:</strong> Carta no-Staple específica para combatir una amenaza del meta local. Puede ser 1 copia.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔨 Construir desde Cero</h3>
        <ul class="form-nb-list">
            <li>Define el endboard que quieres tener al final del turno 1.</li>
            <li>Arma el engine mínimo que llega a ese endboard.</li>
            <li>Agrega buscadores, searchers, extenders para consistencia.</li>
            <li>Evalúa el espacio libre y maximiza el non-engine.</li>
            <li>Elige el non-engine según el meta local específico.</li>
            <li>Prueba 10+ partidas y ajusta con razones claras.</li>
        </ul>

        <h3 class="form-nb-subtitle">📊 Hipergeometría Básica</h3>
        <p class="form-nb-text">Probabilidad de robar al menos 1 copia en la mano inicial (5 cartas de 40):</p>
        <ul class="form-nb-list">
            <li>1 copia → ~11%</li>
            <li>2 copias → ~21%</li>
            <li>3 copias → ~30%</li>
        </ul>
        <p class="form-nb-text">Para tener la carta al menos el 50% de las veces, necesitas 8-9 "accesos" (copias + buscadores que la buscan). Por eso los Starters siempre van en 3 más todos sus buscadores.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El deck no termina en la construcción — termina en el conocimiento. Elige un deck que puedas comprometerte a practicar durante meses, no el que está de moda esta semana.</p>
    `; },

    _topicOptimizar: function () { return `
        <h2 class="form-nb-title">Cómo Optimizar tu Deck</h2>
        <p class="form-nb-text">Un deck construido y un deck optimizado son cosas distintas. La optimización es el proceso continuo de pulirlo hasta que cada carta tiene una razón clara de estar ahí.</p>

        <h3 class="form-nb-subtitle">⚙️ Los 6 Tipos de Optimización</h3>
        <ul class="form-nb-list">
            <li><strong>Consistencia:</strong> Reducir bricks, aumentar probabilidad de abrir con Starter. Señal: estás brickeando frecuentemente.</li>
            <li><strong>Potencia (Combo):</strong> Mejorar la línea principal o agregar una nueva. Señal: el endboard es débil o el oponente lo rompe con recursos normales.</li>
            <li><strong>Techo de Poder (Endboard):</strong> Hacer el campo final más difícil de romper. Señal: el oponente rompe tu campo con una sola carta.</li>
            <li><strong>Defensa:</strong> Mejorar respuesta a lo que el meta te hace. Señal: estás perdiendo al mismo tipo de jugada repetidamente.</li>
            <li><strong>Versatilidad:</strong> Más de 1 ruta para llegar al endboard. Señal: el deck es muy lineal y sin segunda opción al ser interrumpido.</li>
            <li><strong>Resiliencia (Floor):</strong> Sobrevivir con 1-2 negaciones recibidas. Señal: con 1 Handtrap encima, el deck queda muerto.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔄 El Proceso de Optimización</h3>
        <ul class="form-nb-list">
            <li><strong>Identifica el problema específico:</strong> No optimices "en general". ¿Pierdo por inconsistencia, endboard débil, o sin respuesta a X del meta?</li>
            <li><strong>Haz 1 cambio a la vez:</strong> Si cambias 3 cosas y mejoras, no sabes cuál causó qué.</li>
            <li><strong>Prueba con suficientes partidas:</strong> Al menos 10-15 partidas para evaluar un cambio correctamente.</li>
            <li><strong>Documenta:</strong> Anota qué cambiaste y qué efecto tuvo.</li>
        </ul>

        <h3 class="form-nb-subtitle">✅ Señales de un Deck Bien Optimizado</h3>
        <ul class="form-nb-list">
            <li>Rara vez tienes cartas "muertas" en mano que no sirven para nada.</li>
            <li>El non-engine está exactamente calibrado para el meta local.</li>
            <li>Las líneas de combo son fluidas porque las conoces a fondo.</li>
            <li>El deck se siente "tuyo" — no es la lista de YouTube, es tu versión ajustada.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">La optimización nunca termina mientras el meta cambie. Un deck optimizado para el meta de hace 3 meses puede ser mediocre hoy. Trata tu deck como un proyecto en evolución, no como algo terminado.</p>
    `; },

    _topicSideDeck: function () { return `
        <h2 class="form-nb-title">El Side Deck</h2>
        <p class="form-nb-text">El Side Deck es la diferencia entre un jugador que "juega el deck" y uno que "juega el match". Un deck sin Side Deck pensado renuncia a la mitad de la estrategia competitiva.</p>

        <h3 class="form-nb-subtitle">📋 Qué es el Side Deck</h3>
        <p class="form-nb-text">Zona de hasta 15 cartas que puedes intercambiar libremente con tu Main Deck y Extra Deck entre partidas del mismo match. Reglas: siempre intercambios 1 a 1, el total de cartas en Main y Extra no cambia, solo puedes sidear entre partidas 2 y 3.</p>

        <h3 class="form-nb-subtitle">🎯 Para Qué Sirve</h3>
        <ul class="form-nb-list">
            <li><strong>Agregar counters específicos:</strong> Si en la partida 1 confirmaste el deck del oponente, metes las cartas que más lo afectan.</li>
            <li><strong>Quitar cartas que no sirven:</strong> Algunas cartas del main no tienen uso en ciertos matchups.</li>
            <li><strong>Cambiar el plan de juego:</strong> Algunos decks tienen un Plan B tan poderoso que la partida 2 es casi un deck diferente.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔨 Cómo Construir el Side Deck</h3>
        <ul class="form-nb-list">
            <li>Identifica los 3-4 decks más comunes de tu meta local (no el meta de internet).</li>
            <li>Para cada deck, identifica su punto débil y qué carta lo apaga.</li>
            <li>Busca cartas que cubran múltiples matchups — una carta útil contra 3 decks vale más que una contra 1.</li>
            <li>3 copias para matchups críticos · 2 para útiles · 1 para situacionales.</li>
            <li>Define de antemano qué sacas del Main para cada situación — no improvises en el momento.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚖️ Cuándo Sidear Mucho vs Poco</h3>
        <ul class="form-nb-list">
            <li><strong>Sidear mucho:</strong> Si el oponente tiene un mecanismo central que debes apagar, o si tu Plan A claramente no funcionó.</li>
            <li><strong>Sidear poco o nada:</strong> Si ganaste la partida 1 cómodamente y tu plan A funcionó bien.</li>
        </ul>

        <h3 class="form-nb-subtitle">🛡️ Anti-Metas Comunes</h3>
        <ul class="form-nb-list">
            <li><strong>Contra Combo:</strong> Nibiru, Dimensional Barrier, Summon Limit, Skill Drain.</li>
            <li><strong>Contra Control:</strong> Monstruos con efectos no negables, Twin Twisters, Cosmic Cyclone.</li>
            <li><strong>Contra Cementerio:</strong> Dimensional Shifter, Macro Cosmos, Ghost Belle, D.D. Crow.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El mejor Side Deck no es el que tiene las cartas más poderosas — es el que tiene las más específicas para lo que vas a enfrentar. 15 cartas bien pensadas para tu meta local ganan más que 15 Staples genéricos.</p>
    `; },

    _topicGestionLP: function () { return `
        <h2 class="form-nb-title">Gestión de LP y Recursos en el Duelo</h2>
        <p class="form-nb-text">Los LP son el recurso más mal gestionado por jugadores intermedios. El jugador novato teme perderlos. El jugador avanzado los usa como herramienta. La diferencia determina quién gana los duelos ajustados.</p>

        <h3 class="form-nb-subtitle">💎 Los LP No Son el Objetivo — Son un Recurso</h3>
        <p class="form-nb-text">Ir de 8000 a 4000 LP es exactamente tan válido como estar en 8000 — en ambos casos sigues en el juego. El error del novato: evitar perder LP a cualquier costo, incluso a costa de no activar efectos correctamente. El enfoque correcto: los LP se invierten para ganar ventaja.</p>

        <h3 class="form-nb-subtitle">📦 Los Recursos del Duelo</h3>
        <ul class="form-nb-list">
            <li><strong>Cartas en Mano:</strong> El recurso más importante. Calidad > Cantidad.</li>
            <li><strong>Cartas en Campo:</strong> Amenazas y protecciones presentes.</li>
            <li><strong>Cartas en Cementerio:</strong> En el juego moderno, el cementerio es un recurso activo, no solo un descarte.</li>
            <li><strong>LP:</strong> Margen de error antes de perder.</li>
            <li><strong>Turno:</strong> Cuántos turnos lleva el duelo y si la posición es sostenible.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚖️ Cuándo Vale la Pena Pagar LP</h3>
        <ul class="form-nb-list">
            <li><strong>Siempre vale:</strong> Pagas para negar algo irrecuperable, el costo es pequeño vs la amenaza, o estás ganando y solo necesitas cerrar.</li>
            <li><strong>Evalúa cuidadosamente:</strong> Ya estás por debajo de 4000 LP, el efecto no cambia el resultado, o el oponente podría tener otro golpe.</li>
            <li><strong>No vale:</strong> Pagas para salvar una situación que perderás de todas formas, o estás en 2000 LP o menos.</li>
        </ul>

        <h3 class="form-nb-subtitle">🃏 Gestión del Campo</h3>
        <ul class="form-nb-list">
            <li><strong>No sobreconstruyas:</strong> Invocar más monstruos de los necesarios gasta recursos para el turno siguiente. ¿Necesito este quinto monstruo para ganar este turno?</li>
            <li><strong>Protege lo necesario, no todo:</strong> Identifica cuál es la carta más crítica y protege esa. Las demás son prescindibles si el núcleo sobrevive.</li>
            <li><strong>Cierra si puedes:</strong> "El oponente con 100 LP es tan peligroso como con 8000." No desperdicies un combo completo sin cerrar el duelo.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Al final de cada turno, pregúntate: "¿Tengo más recursos que al inicio de mi turno, menos, o igual?" Si consistentemente tienes menos sin estar más cerca de ganar, estás siendo outresourced. El jugador que mejor gestiona sus recursos en el largo plazo gana los duelos ajustados.</p>
    `; },

    _topicLeerCampo: function () { return `
        <h2 class="form-nb-title">Leer el Campo del Oponente</h2>
        <p class="form-nb-text">La habilidad más subestimada del juego no es memorizar combos — es leer lo que el oponente tiene antes de que lo revele. Los jugadores de alto nivel toman decisiones basadas en información deducida, no solo en lo que ven.</p>

        <h3 class="form-nb-subtitle">🔎 Señales que Dan Información</h3>
        <ul class="form-nb-list">
            <li><strong>Número de cartas en mano:</strong> 5+ cartas = mano llena, posibles múltiples Handtraps. 1-2 cartas = mano comprometida, menor amenaza inmediata.</li>
            <li><strong>Cómo manejó el turno anterior:</strong> ¿Pasó rápido? → Mano débil o tiene trampas ya colocadas. ¿Jugó despacio? → Mano compleja o preservando opciones.</li>
            <li><strong>Cartas boca abajo:</strong> 1 carta = precaución. 3+ cartas = deck de Control o Trampas. 0 cartas = puede tener Handtraps en mano.</li>
            <li><strong>El deck que está jugando:</strong> Si sabes cuál es, ya sabes sus Handtraps probables, sus combos y sus puntos débiles.</li>
        </ul>

        <h3 class="form-nb-subtitle">🧩 Deducir las Handtraps</h3>
        <ul class="form-nb-list">
            <li>¿Pasó su turno sin usar Handtraps? → Probablemente no tiene en mano o está guardando algo específico.</li>
            <li>Si ya activó una Handtrap: los decks con 3+ Handtraps pueden tener otra. Los más agresivos ya la gastaron.</li>
            <li><strong>Ash Blossom:</strong> Si no la activó cuando buscaste, probablemente no la tiene.</li>
            <li><strong>Nibiru:</strong> Cuenta tus invocaciones especiales. Si llegas a 5 sin que la activen, probablemente no la tiene.</li>
            <li><strong>Droll:</strong> Si ya agregaste 1 carta del deck a tu mano y no la activaron, probablemente no la tienen.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚡ Cómo Responder a lo que Deduces</h3>
        <ul class="form-nb-list">
            <li><strong>Si crees que tiene Handtrap:</strong> Activa primero la carta menos crítica como "cebo". Si la gastan en el cebo, tu pieza clave queda libre.</li>
            <li><strong>Si crees que no tiene nada:</strong> Ejecuta el combo sin rodeos y maximiza el endboard. Pero no asumas al 100%.</li>
            <li><strong>Si hay backrow desconocido:</strong> Actúa como si fuera la peor trampa para tu combo. Si tienes destructor de trampas, úsalo primero.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚠️ Errores Comunes</h3>
        <ul class="form-nb-list">
            <li>Asumir que tiene X carta porque perdiste contra ella antes — cada duelo es nuevo.</li>
            <li>Jugar mecánicamente sin observar al oponente — su comportamiento da información.</li>
            <li>Ignorar lo que NO hizo — la información más valiosa a veces es que el oponente no activó nada.</li>
            <li>Paralizarte por sobre-pensar — analiza, decide, actúa.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Al inicio de cada turno del oponente hazte 3 preguntas: ¿Cuántas cartas tiene en mano y qué dice eso? ¿Qué hizo (o no hizo) en mi último turno? ¿Qué necesita hacer en este turno para ganar? La tercera es la más poderosa: si sabes qué necesita para ganar, puedes centrar todos tus recursos en negarlo exactamente.</p>
    `; },

    _topicVelocidadEfectos: function () { return `
        <h2 class="form-nb-title">Velocidad de Efectos y Cadenas</h2>
        <p class="form-nb-text">El sistema de cadenas es el motor técnico del juego. Entenderlo completamente es lo que te permite activar tus cartas en el momento correcto y ganar disputas que un jugador sin este conocimiento perdería.</p>

        <h3 class="form-nb-subtitle">⚡ Spell Speed (Velocidad de Hechizo)</h3>
        <ul class="form-nb-list">
            <li><strong>Velocidad 1:</strong> No puede ser activado como respuesta directa. Efectos de tipo Ignition, efectos Continuos, Magias normales/campo/equipo/ritual. Base de la cadena, nunca el eslabón reactivo.</li>
            <li><strong>Velocidad 2:</strong> Puede responder a velocidad 1 y 2. Quick Effects de monstruos, Magias de Juego Rápido, Trampas normales y continuas, Handtraps.</li>
            <li><strong>Velocidad 3:</strong> Solo responde a velocidad 3. Counter Traps (Solemn Judgment, Solemn Warning, etc.). La única respuesta a una Counter Trap es otra Counter Trap.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔧 Tipos de Efectos</h3>
        <ul class="form-nb-list">
            <li><strong>Trigger Effect (Gatillo):</strong> Se activa automáticamente al ocurrir un evento. <em>Mandatorio</em>: DEBE activarse. <em>Opcional</em>: puede activarse — pero puede "miss the timing".</li>
            <li><strong>Ignition Effect (Ignición):</strong> Lo activas voluntariamente durante una ventana en tu turno. Velocidad 1. No puede activarse como respuesta.</li>
            <li><strong>Quick Effect (Efecto Rápido):</strong> Velocidad 2. Puede activarse en el turno del oponente o en respuesta a sus efectos. Indicado con "(Quick Effect):" en el texto.</li>
            <li><strong>Continuous Effect (Continuo):</strong> Aplica automáticamente mientras la carta esté en campo. No genera cadena — simplemente está activo.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔗 Cómo Funciona una Cadena (LIFO)</h3>
        <p class="form-nb-text">Una cadena es una secuencia de efectos activados en respuesta mutua. Se resuelve al revés: el último activado resuelve primero (Last In, First Out). Las cadenas se construyen completamente ANTES de resolverse.</p>
        <ul class="form-nb-list">
            <li>Jugador A activa Ash Blossom (Vel. 2) — Eslabón 1.</li>
            <li>Jugador B responde con Called by the Grave (Vel. 2) — Eslabón 2.</li>
            <li>Called by the Grave resuelve primero → niega Ash. Ash intenta resolver → ya fue negada.</li>
        </ul>

        <h3 class="form-nb-subtitle">🪟 Ventana de Interacción</h3>
        <p class="form-nb-text">La ventana se abre cuando el jugador activo activa un efecto, realiza una invocación, o ejecuta una acción visible. Se cierra cuando ambos jugadores pasan sin agregar nada a la cadena. El jugador sin nada que activar debe ceder prioridad.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El 80% de las disputas en torneo vienen de no entender cuándo hay ventana. Si tienes dudas: ¿hubo una acción o efecto del oponente que abrió la ventana? Si la respuesta es no, espera.</p>
    `; },

    _topicRulingsInvocaciones: function () { return `
        <h2 class="form-nb-title">Rulings de Invocaciones</h2>
        <p class="form-nb-text">Saber qué tipo de invocación realizas, cuándo puede ser negada, y qué consecuencias tiene la negación, determina si puedes continuar el combo o no.</p>

        <h3 class="form-nb-subtitle">⚔️ Inherente vs Por Efecto</h3>
        <ul class="form-nb-list">
            <li><strong>Invocación Inherente:</strong> La realizas directamente por las reglas del juego, sin necesitar un efecto de carta. Se coloca en el Eslabón 1 o sin cadena. Ej: Invocación Normal, XYZ con 2 del mismo nivel, Sincro con Tuner.</li>
            <li><strong>Invocación por Efecto:</strong> La realiza un efecto de carta. La cadena ya está en marcha. No puedes responder a la invocación misma, solo al efecto.</li>
        </ul>
        <p class="form-nb-text">"Negar una invocación" solo aplica a invocaciones inherentes. No puedes negar una invocación que sea el resultado de resolver un efecto.</p>

        <h3 class="form-nb-subtitle">🚫 Negar la Invocación y sus Consecuencias</h3>
        <ul class="form-nb-list">
            <li>El monstruo va al cementerio (o fuera del juego según la regla).</li>
            <li>Efectos de "si fue invocado exitosamente" NO se activan.</li>
            <li>Efectos de "si fue enviado al cementerio" SÍ pueden activarse.</li>
            <li>Los materiales ya enviados NO regresan — van al cementerio normalmente.</li>
        </ul>

        <h3 class="form-nb-subtitle">📝 Diferencias Clave por Tipo</h3>
        <ul class="form-nb-list">
            <li><strong>XYZ y materiales:</strong> Los materiales debajo del XYZ no están en el cementerio. Los efectos de cementerio no los afectan. Solo van al cementerio cuando el XYZ es destruido.</li>
            <li><strong>Fichas (Tokens):</strong> Son monstruos. Pueden ser materiales. Pero al dejar el campo desaparecen — no van al cementerio.</li>
            <li><strong>Link y zonas:</strong> Si no hay zonas del Extra Deck habilitadas, la invocación no puede realizarse aunque tengas los materiales.</li>
            <li><strong>Péndulo:</strong> Para Invocar Péndulo necesitas ambas escalas activas. Si te niegan una escala durante la colocación, la otra queda pero no puedes invocar.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Antes de intentar una invocación de Extra Deck, confirma: ¿Los materiales son válidos? ¿Hay zona disponible? ¿Mi combo tiene restricciones que bloqueen esta invocación? Muchos combos se rompen porque el jugador no leyó la restricción de una carta que ya resolvió ese mismo turno.</p>
    `; },

    _topicRulingsBatalla: function () { return `
        <h2 class="form-nb-title">Rulings en Fase de Batalla</h2>
        <p class="form-nb-text">La Fase de Batalla tiene más reglas específicas que cualquier otra fase. Los rulings de esta fase determinan partidas enteras en torneo.</p>

        <h3 class="form-nb-subtitle">📋 Las Subfases del Damage Step</h3>
        <ul class="form-nb-list">
            <li><strong>A. Start of Damage Step:</strong> Se pueden activar efectos que modifican ATK/DEF o cambian posición. Los monstruos boca abajo se voltean aquí.</li>
            <li><strong>B. Before Damage Calculation:</strong> Último momento para cambiar ATK/DEF antes del cálculo. Solo efectos de velocidad 2 que modifican ATK/DEF o que aplican explícitamente aquí.</li>
            <li><strong>C. Damage Calculation:</strong> Los LP cambian. Se compara ATK vs ATK (o ATK vs DEF).</li>
            <li><strong>D. After Damage Calculation:</strong> Efectos "después del cálculo de daño". Efectos Flip de monstruos volteados.</li>
            <li><strong>E. End of Damage Step:</strong> Los monstruos destruidos por combate van al cementerio. Efectos "cuando sea destruido por combate" se activan aquí.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚡ Daño de Batalla vs Daño de Efecto</h3>
        <ul class="form-nb-list">
            <li><strong>Daño de Batalla:</strong> Ocurre cuando un monstruo ataca. Puede ser modificado por cartas durante la Battle Phase o el Damage Step.</li>
            <li><strong>Daño de Efecto:</strong> "Inflige X de daño" por efecto. No puede ser negado por cartas que solo aplican a daño de batalla. Funciona fuera del Damage Step.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔄 Replay Attacks</h3>
        <p class="form-nb-text">Un Replay ocurre cuando el objetivo de un ataque desaparece durante el Battle Step. El monstruo atacante puede elegir un nuevo objetivo o no atacar. Solo ocurre en el Battle Step, no durante el Damage Step.</p>

        <h3 class="form-nb-subtitle">🚫 Restricciones en el Damage Step</h3>
        <p class="form-nb-text">Durante el Damage Step SOLO puedes activar: efectos de velocidad 2+ que modifiquen ATK/DEF, efectos que aplican explícitamente durante el Damage Step, Counter Traps (velocidad 3), y efectos mandatorios. Casi todas las Handtraps y Trampas Normales NO pueden activarse aquí.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">En torneo, siempre anuncia "declaro ataque con X contra Y" y espera antes de calcular el daño. Esa pausa es la ventana de tu oponente para responder. Entrar al Damage Step sin dar esa ventana es un error que puede costarte la partida.</p>
    `; },

    _topicIfWhen: function () { return `
        <h2 class="form-nb-title">IF vs WHEN y Timing Avanzado</h2>
        <p class="form-nb-text">"Miss the timing" es uno de los conceptos más mal entendidos en Yu-Gi-Oh!. Un jugador que no entiende la diferencia entre IF y WHEN perderá efectos clave en momentos críticos.</p>

        <h3 class="form-nb-subtitle">🔍 La Diferencia Fundamental</h3>
        <ul class="form-nb-list">
            <li><strong>WHEN (opcional):</strong> El efecto tiene una ventana muy específica. Si el evento que lo activa NO fue "lo último que ocurrió" antes de la nueva ventana de activación, el efecto pierde el timing y NO puede activarse. "When X: you can do Y" = riesgo de miss the timing.</li>
            <li><strong>IF (opcional):</strong> Más flexible. Solo necesita que la condición se haya cumplido en algún momento del proceso. Generalmente no pierde el timing. "If X: you can do Y" = generalmente seguro.</li>
            <li><strong>WHEN/IF Mandatorios:</strong> NUNCA pierden el timing. Siempre se activan si la condición ocurre.</li>
        </ul>

        <h3 class="form-nb-subtitle">❌ Qué Significa "Miss the Timing"</h3>
        <p class="form-nb-text">Ocurre cuando: (1) el efecto usa WHEN y es opcional, y (2) la condición de activación ocurrió, pero NO fue el último evento antes de que se abra la nueva ventana.</p>
        <ul class="form-nb-list">
            <li><strong>No miss:</strong> La carta X fue enviada al cementerio como el ÚLTIMO paso de un efecto. → El efecto puede activarse.</li>
            <li><strong>Sí miss:</strong> La carta X fue enviada al cementerio pero después el efecto hizo otras cosas (ej: "envía X al cementerio, LUEGO invoca especialmente Y"). El envío no fue lo último. → El efecto pierde el timing.</li>
        </ul>

        <h3 class="form-nb-subtitle">📋 Orden de Activación en la Ventana</h3>
        <ul class="form-nb-list">
            <li>1. Efectos mandatorios (siempre primero).</li>
            <li>2. Efectos Trigger opcionales del jugador activo.</li>
            <li>3. Efectos Trigger opcionales del jugador no activo.</li>
            <li>4. Quick Effects de ambos jugadores.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔄 "EACH TIME" — Sin Límite de Activaciones</h3>
        <p class="form-nb-text">"Each time X happens: do Y" puede activarse múltiples veces en el mismo turno si la condición se repite. No está limitado a una vez por turno implícitamente.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Cuando no estés seguro: ¿Dice "when" y "you can"? → Potencial miss. ¿El evento fue lo último que ocurrió? → No miss. ¿El efecto es mandatorio? → Nunca miss. En torneo, ante la duda, declara el efecto y deja que el juez decida.</p>
    `; },

    _topicFormatos: function () { return `
        <h2 class="form-nb-title">Formatos y sus Diferencias</h2>
        <p class="form-nb-text">Yu-Gi-Oh! no es un solo juego — es varios juegos con las mismas cartas pero reglas distintas. Saber en qué formato estás jugando cambia completamente qué estrategias funcionan y qué rulings aplican.</p>

        <h3 class="form-nb-subtitle">🌍 Formato Avanzado (TCG / OCG — Actual)</h3>
        <ul class="form-nb-list">
            <li>El formato estándar moderno. Basado en la Master Rule 5 (vigente desde 2020).</li>
            <li>Banlist actualizada ~cada 3 meses. Deck: 40-60 cartas. Extra: hasta 15. Side: hasta 15.</li>
            <li><strong>TCG vs OCG:</strong> Banlists DIFERENTES. Cartas prohibidas en TCG pueden estar libres en OCG. El OCG tiene diferencias de timing y prioridad en casos específicos (efectos en zona privada tienen menor prioridad que en zona pública).</li>
        </ul>

        <h3 class="form-nb-subtitle">💻 Master Duel (Digital Oficial)</h3>
        <p class="form-nb-text">Versión digital de Konami con su propia banlist, diferente a TCG y OCG. El pool de cartas va atrasado respecto al físico. Gratuito en PC, consolas y móvil.</p>

        <h3 class="form-nb-subtitle">🐐 GOAT Format (2005)</h3>
        <ul class="form-nb-list">
            <li>Simula el meta de 2005 con las reglas originales.</li>
            <li>1 sola zona de campo (sin Extra Monster Zones, sin Links ni Sincro ni XYZ ni Péndulos).</li>
            <li>Los Ignition Effects tenían prioridad al invocar (podías activar un efecto junto con la invocación).</li>
            <li>Jugadas ilegales = pérdida de la carta y rebarajeo (no solo deshacer).</li>
            <li>Ritmo completamente diferente al formato moderno.</li>
        </ul>

        <h3 class="form-nb-subtitle">🎮 Genesys Format</h3>
        <p class="form-nb-text">Sin banlist — cada carta tiene un valor en puntos y construyes con un presupuesto máximo. No se permiten monstruos Link ni Péndulo. Diseñado para equilibrar sin restricciones directas.</p>

        <h3 class="form-nb-subtitle">⏱️ Time Wizard Format</h3>
        <p class="form-nb-text">Torneos nostálgicos donde ambos jugadores acuerdan jugar con el cardpool y las reglas de una fecha específica del pasado. Cada "Time Wizard" es un formato diferente según la fecha elegida.</p>

        <h3 class="form-nb-subtitle">📝 Erratas y Terminología</h3>
        <ul class="form-nb-list">
            <li>Las erratas cambian el texto oficial de cartas antiguas. Siempre aplica el texto actual, no el de la impresión antigua.</li>
            <li>"cards you control" = cartas en tu campo · "add" ≠ "draw" · "unaffected" = inafectado · "send to GY" ≠ "discard"</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Cuando veas un decklist de internet, siempre confirma en qué formato fue construido. Un deck de OCG puede tener cartas prohibidas en TCG. El formato cambia todo: las cartas, las estrategias y el ritmo del juego.</p>
    `; },

};

window.Formacion = Formacion;



// ── Meta — renderiza secciones Maestros del Juego y Fuentes Externas; usado como delegado por Formacion ──

const Meta = {

    container: null,

    FORMATS: ['TCG', 'OCG', 'Genesys', 'Master Duel', 'Duel Links', 'Time Wizard', 'Todos'],

    init: function () {
        this.container = document.getElementById('meta-content');
        if (!this.container) return;
        this.render();
    },

    render: function () {
        if (!this.container) return;
        this.container.innerHTML = `
            <h2>Meta</h2>

            <!-- Sección: Maestros del Juego (desplegada por defecto) -->
            <div class="meta-section">
                <h3 class="meta-section-title" onclick="Meta.toggleSection('meta-maestros-section')">
                    ▼ Maestros del Juego
                </h3>
                <div id="meta-maestros-section" class="meta-section-content">
                    ${this._renderMaestrosSection()}
                </div>
            </div>

            <!-- Sección: Fuentes Externas -->
            <div class="meta-section" data-section-id="meta-fuentes">
                <h3 class="meta-section-title" onclick="Meta.toggleSection('meta-fuentes-section')">
                    ▶ Fuentes Externas
                </h3>
                <div id="meta-fuentes-section" class="meta-section-content" style="display:none;">
                    ${this._renderFuentesSection()}
                </div>
            </div>
        `;
    },

    toggleSection: function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        const title = el.previousElementSibling;
        if (el.style.display === 'none') {
            el.style.display = 'block';
            if (title) title.textContent = title.textContent.replace('▶', '▼');
        } else {
            el.style.display = 'none';
            if (title) title.textContent = title.textContent.replace('▼', '▶');
        }
    },

    // ===============================

    _renderMaestrosSection: function () {
        const masters = window.ConfigManager?.getMetaMasters?.() ?? [];
        if (!masters.length) {
            return '<p class="meta-empty">No hay maestros configurados. Ve a Configuración → Maestros del Juego.</p>';
        }
        return `
            <div class="meta-maestros-grid">
                ${masters.map(m => this._renderMasterCard(m)).join('')}
            </div>
        `;
    },

    _renderMasterCard: function (m) {
        const videoId  = this._extractYoutubeId(m.videoUrl || '');
        const embedUrl = videoId
            ? `https://www.youtube-nocookie.com/embed/${videoId}`
            : null;
        const formats  = Array.isArray(m.formats) ? m.formats : [];

        const formatBadges = formats.length
            ? formats.map(f => `<span class="meta-format-badge">${this._escHtml(f)}</span>`).join('')
            : '<span class="meta-format-badge meta-format-none">Sin formato</span>';

        const fallback = m.fallbackUrl ? m.fallbackUrl.trim() : '';
        const resolvedFallback = fallback.startsWith('local:')
    ? (ConfigManager.getMetaFallbacks()[fallback.replace('local:', '')] || '')
    : fallback;
        const isMp4 = resolvedFallback.toLowerCase().endsWith('.mp4');

        const fallbackContent = fallback
            ? (isMp4
                ? `<video class="meta-master-fallback-media" autoplay muted loop playsinline>
                    <source src="${this._escAttr(fallback)}" type="video/mp4">
                </video>`
                : `<img class="meta-master-fallback-media" src="${this._escAttr(fallback)}" alt="${this._escAttr(m.name || '')}">`)
            : `<div class="meta-master-video--empty"><span>Sin video configurado</span></div>`;

        const videoBlock = embedUrl
            ? `<div class="meta-master-video">
                <iframe
                    src="${embedUrl}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen loading="lazy"
                    title="${this._escAttr(m.name || 'Video')}"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                </iframe>
                <div class="meta-master-fallback" style="display:none;">${fallbackContent}</div>
            </div>`
            : `<div class="meta-master-video">${fallbackContent}</div>`;

                const channelBtn = m.channelUrl
            ? `<a class="meta-master-channel-btn"
                href="${this._escAttr(m.channelUrl)}"
                target="_blank" rel="noopener noreferrer">
                📺 Ir al canal
            </a>`
            : '';

const videoFallbackBtn = videoId
    ? `<a class="meta-master-yt-fallback"
          href="https://www.youtube.com/watch?v=${videoId}"
          target="_blank" rel="noopener noreferrer">
           ▶ Ver en YouTube si no carga
       </a>`
    : '';

        return `
            <div class="meta-master-card">
                ${videoBlock}
                <div class="meta-master-info">
                    <div class="meta-master-name">${this._escHtml(m.name || 'Sin nombre')}</div>
                    ${m.title ? `<div class="meta-master-title">${this._escHtml(m.title)}</div>` : ''}
                    <div class="meta-master-formats">
                        <span class="meta-formats-label">Formato Especializado:</span>
                        <div class="meta-formats-row">${formatBadges}</div>
                    </div>
                    ${channelBtn}
                    ${videoFallbackBtn}
                </div>
            </div>
        `;
    },

    // Extrae el ID de YouTube desde múltiples formatos de URL
    _extractYoutubeId: function (url) {
        if (!url) return null;
        const patterns = [
            /[?&]v=([^&#]+)/,
            /youtu\.be\/([^?&#]+)/,
            /youtube\.com\/embed\/([^?&#]+)/,
            /youtube\.com\/shorts\/([^?&#]+)/
        ];
        for (const p of patterns) {
            const m = url.match(p);
            if (m) return m[1];
        }
        return null;
    },

    // ===============================

    _renderFuentesSection: function () {
        const links = window.ConfigManager?.getMetaLinks?.() ?? [];
        if (!links.length) {
            return '<p class="meta-empty">No hay fuentes configuradas. Ve a Configuración → Fuentes Externas del Meta.</p>';
        }

        return `
            <div class="meta-fuentes-tabs">
                <div class="meta-tabs-nav" id="meta-tabs-nav">
                    ${links.map((lk, i) => `
                        <button class="meta-tab-btn${i === 0 ? ' active' : ''}"
                                onclick="Meta.showFrame(${i})"
                                id="meta-tab-btn-${i}">
                            ${this._escHtml(lk.title || `Fuente ${i + 1}`)}
                        </button>
                    `).join('')}
                </div>
                <div class="meta-frames-container" id="meta-frames-container">
                    ${links.map((lk, i) => `
                        <div class="meta-frame-pane${i === 0 ? ' active' : ''}" id="meta-frame-pane-${i}">
                            ${lk.desc ? `<p class="meta-frame-desc">${this._escHtml(lk.desc)}</p>` : ''}
                            <div class="meta-frame-toolbar">
                                <span class="meta-frame-url">${this._escHtml(lk.url)}</span>
                                <a class="meta-frame-open-btn" href="${this._escAttr(lk.url)}" target="_blank" rel="noopener noreferrer">
                                    ↗ Abrir en nueva pestaña
                                </a>
                            </div>
                            <div class="meta-iframe-wrapper" id="meta-iframe-wrapper-${i}">
                                <iframe
                                    src="${this._escAttr(lk.url)}"
                                    class="meta-iframe"
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
                                    referrerpolicy="no-referrer"
                                    loading="lazy"
                                    onload="Meta._onFrameLoad(${i}, this)"
                                    onerror="Meta._onFrameError(${i})"
                                    title="${this._escAttr(lk.title || 'Fuente externa')}">
                                </iframe>
                                <div class="meta-iframe-blocked" id="meta-iframe-blocked-${i}" style="display:none;">
                                    <div class="meta-blocked-content">
                                        <span class="meta-blocked-icon">🚫</span>
                                        <p>Este sitio no permite ser embebido.</p>
                                        <a class="btn btn-primary meta-blocked-link"
                                           href="${this._escAttr(lk.url)}"
                                           target="_blank" rel="noopener noreferrer">
                                            ↗ Abrir ${this._escHtml(lk.title || 'enlace')}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    showFrame: function (index) {
        document.querySelectorAll('.meta-frame-pane').forEach((p, i) => p.classList.toggle('active', i === index));
        document.querySelectorAll('.meta-tab-btn').forEach((b, i)  => b.classList.toggle('active',  i === index));
    },

    _onFrameLoad: function (index, iframe) {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc && doc.body) return;
        } catch (_) {}
        const wrapper  = document.getElementById(`meta-iframe-wrapper-${index}`);
        const existing = document.getElementById(`meta-iframe-hint-${index}`);
        if (!wrapper || existing) return;
        const hint = document.createElement('div');
        hint.id        = `meta-iframe-hint-${index}`;
        hint.className = 'meta-iframe-hint';
        hint.innerHTML = `
            <span>¿No ves el contenido?</span>
            <button onclick="Meta._showBlocked(${index})">Ver enlace externo</button>
            <button class="meta-hint-close" onclick="this.parentElement.remove()">✕</button>
        `;
        wrapper.appendChild(hint);
    },

    _onFrameError: function (index) { this._showBlocked(index); },

    _showBlocked: function (index) {
        const blocked = document.getElementById(`meta-iframe-blocked-${index}`);
        const iframe  = document.querySelector(`#meta-frame-pane-${index} .meta-iframe`);
        if (blocked) blocked.style.display = 'flex';
        if (iframe)  iframe.style.display  = 'none';
    },

    // ===============================

    _escHtml: function (str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    _escAttr: function (str) {
        return String(str).replace(/"/g, '&quot;');
    }
};

window.Meta = Meta;



// ── Config — UI de configuración: roles, staples, nomenclatura, pilares, maestros, fuentes, música, borrado de datos ──

const Config = {
    container: null,

    init: function () {
        this.container = document.getElementById('config-content');
        if (!this.container) { 
            console.error('Config: contenedor no encontrado'); 
            return; 
        }
        this.render();
        if (window.ConfigManager) ConfigManager.renderStaplesPanel();
    },

    render: function () {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <h2>Configuración</h2>

            ${window.ContentManager ? ContentManager.renderConfigSection() : ''}

            <!-- Sección: Roles y Palabras Asociadas -->
            <div class="config-section" data-section-id="config-roles" id="roles-section-wrap">
                <h3 class="config-section-title" onclick="Config.toggleSection('roles-section')">
                    ▶ Roles y Palabras Asociadas
                </h3>
                <div id="roles-section" class="config-section-content" style="display:none;">
                    ${this.renderRolesSection()}
                </div>
            </div>

            <!-- Sección: Mecánicas y Counters -->
            <div class="config-section" data-section-id="config-specialties">
                <h3 class="config-section-title" onclick="Config.toggleSection('specialties-section')">
                    ▶ Mecánicas y Counters
                </h3>
                <div id="specialties-section" class="config-section-content" style="display:none;">
                    ${this.renderSpecialtiesSection()}
                </div>
            </div>

            <!-- Sección: Lista de Staples -->
            <div class="config-section" data-section-id="config-staples">
                <h3 class="config-section-title" onclick="Config.toggleSection('staples-section')">
                    ▶ Lista de Staples
                </h3>
                <div id="staples-section" class="config-section-content" style="display:none;">
                    ${this.renderStaplesSection()}
                </div>
            </div>

            <!-- Sección: Nomenclatura de Efectos -->
            <div class="config-section" data-section-id="config-nomenclature">
                <h3 class="config-section-title" onclick="Config.toggleSection('nomenclature-section')">
                    ▶ Nomenclatura de Efectos
                </h3>
                <div id="nomenclature-section" class="config-section-content" style="display:none;">
                    ${this.renderNomenclatureSection()}
                </div>
            </div>

            <!-- Sección: Pilares del Internal Score -->
            <div class="config-section" data-section-id="config-pillars">
                <h3 class="config-section-title" onclick="Config.toggleSection('pillars-section')">
                    ▶ Pilares del Internal Score
                </h3>
                <div id="pillars-section" class="config-section-content" style="display:none;">
                    ${this.renderPillarsSection()}
                </div>
            </div>

            <!-- Sección: Rendimientos Decrecientes -->
            <div class="config-section" data-section-id="config-diminishing">
                <h3 class="config-section-title" onclick="Config.toggleSection('diminishing-section')">
                    ▶ Rendimientos Decrecientes
                </h3>
                <div id="diminishing-section" class="config-section-content" style="display:none;">
                    ${this.renderDiminishingSection()}
                </div>
            </div>

            <!-- Sección: Atajos Rápidos -->
            <div class="config-section" data-section-id="config-shortcuts">
                <h3 class="config-section-title" onclick="Config.toggleSection('shortcuts-section')">
                    ▶ Atajos Rápidos
                </h3>
                <div id="shortcuts-section" class="config-section-content" style="display:none;">
                    ${this.renderShortcutsSection()}
                </div>
            </div>

            <!-- Sección: Banlist del Formato -->
            <div class="config-section" data-section-id="config-banlist">
                <h3 class="config-section-title" onclick="Config.toggleSection('banlist-section'); if(window.Banlist) Banlist.renderSection();">
                    ▶ Banlist del Formato
                </h3>
                <div id="banlist-section" class="config-section-content" style="display:none;">
                    <p class="stats-empty">Abre la sección para ver la banlist.</p>
                </div>
                
            </div>
            <!-- Sección: Ajustes de Música -->
            <div class="config-section" data-section-id="config-music">
                <h3 class="config-section-title" onclick="Config.toggleSection('music-section')">
                    ▶ Ajustes de Música
                </h3>
                <div id="music-section" class="config-section-content" style="display:none;">
                    ${this.renderMusicSection()}
                </div>
            </div>

            <!-- Sección: Maestros del Duelo -->
            <div class="config-section" data-section-id="config-meta-masters">
                <h3 class="config-section-title" onclick="Config.toggleSection('meta-masters-config-section')">
                    ▶ Maestros del Duelo
                </h3>
                <div id="meta-masters-config-section" class="config-section-content" style="display:none;">
                    ${this.renderMetaMastersSection()}
                </div>
            </div>

            <!-- Sección: Fuentes Externas del Meta -->
            <div class="config-section" data-section-id="config-meta-links">
                <h3 class="config-section-title" onclick="Config.toggleSection('meta-links-config-section')">
                    ▶ Fuentes Externas del Meta
                </h3>
                <div id="meta-links-config-section" class="config-section-content" style="display:none;">
                    ${this.renderMetaLinksSection()}
                </div>
            </div>


            <!-- Sección: Juegos Alternativos -->
            <div class="config-section" data-section-id="config-formacion-games">
                <h3 class="config-section-title" onclick="Config.toggleSection('formacion-games-config-section')">
                    ▶ Juegos Alternativos de Yu-Gi-Oh!
                </h3>
                <div id="formacion-games-config-section" class="config-section-content" style="display:none;">
                    ${this.renderFormacionGamesSection()}
                </div>
            </div>

            <!-- Sección: Temas de Formación -->
            <div class="config-section" data-section-id="config-formacion-topics">
                <h3 class="config-section-title" onclick="Config.toggleSection('formacion-topics-section')">
                    ▶ Temas de Formación
                </h3>
                <div id="formacion-topics-section" class="config-section-content" style="display:none;">
                    ${this.renderFormacionTopicsSection()}
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="config-actions">
                <button class="btn btn-success" onclick="Config.generarReporte()" style="background:#4a0015;border-color:#9b1030;" title="Exporta un .txt con el log de ejecución de esta sesión">📋 Generar Reporte</button>
                <button class="btn btn-primary" onclick="Config.exportConfig()">📥 Exportar Data</button>
                <button class="btn btn-primary" onclick="Config.importConfig()">📤 Importar Data</button>
                <button class="btn btn-success" onclick="Config.resetToDefault()" style="background:#27ae60;border-color:#27ae60;">🔄 Restaurar Configuración</button>
            </div>

            <!-- Zona de borrado -->
            <div class="config-danger-zone" data-section-id="config-danger-zone">
                <div class="config-danger-title">⚠️ Zona de borrado</div>
                <div class="config-danger-buttons">
                    <button class="btn btn-danger" onclick="Config.borrarTodo()" style="background:#c0392b;">
                        🗑️ Borrar Data
                        <small style="display:block;font-weight:normal;font-size:0.7rem;opacity:0.75;">
                            Toda la configuración de la app
                        </small>
                    </button>
                    <button class="btn btn-danger" data-section-id="config-danger-delete" onclick="Config.borrarDeck()">
                        🗑️ Borrar Decks & Juego
                        <small style="display:block;font-weight:normal;font-size:0.7rem;opacity:0.75;">
                            Decks guardados, winrates, notas, cache de scores
                        </small>
                    </button>

                </div>
            </div>
            
            <input type="file" id="config-import-file" accept=".txt" style="display:none;" onchange="Config.handleFileImport(this)">
        `;
    },

    // ===============================
    renderRolesSection: function () {
        const roles = ConfigManager.getRoles();
        
        let html = `
            <div class="config-new-role">
                <input type="text" id="new-role-input" class="config-input" placeholder="Nombre del nuevo rol...">
                <button class="btn btn-primary" onclick="Config.createNewRole()">+ Crear Rol</button>
            </div>
            <div class="roles-list">`;

        for (const [roleName] of Object.entries(roles)) {
            html += this.renderRoleCard(roleName);
        }
        
        html += '</div>';
        return html;
    },

    renderRoleCard: function (roleName) {
        const roleCondition = ConfigManager.getRoleCondition(roleName);
        const keywords     = roleCondition ? (roleCondition.keywords || []) : [];
        const conditionals = roleCondition ? (roleCondition.conditionals || []) : [];

      const kwChips = keywords.map((kw, idx) => `
            <div class="keyword-chip">
                <span class="chip-text">${kw}</span>
                <span class="chip-remove" onclick="Config.removeCondKeywordByIndex('${roleName}',${idx})">×</span>
            </div>`).join('');

        const condChips = conditionals.map((c, idx) => `
            <div class="keyword-chip conditional-chip">
                <span class="chip-text">${c}</span>
                <span class="chip-remove" onclick="Config.removeConditionalByIndex('${roleName}',${idx})">×</span>
            </div>`).join('');

        return `
            <div class="role-card" data-role="${roleName}" id="role-anchor-${roleName}">
                <div class="role-card-header">
                    <input type="text" class="role-name-input" value="${roleName}"
                        data-original="${roleName}"
                        onblur="Config.renameRole(this)"
                        onkeydown="if(event.key==='Enter')this.blur()">
                    <button class="btn-duplicate-role" onclick="Config.duplicateRole('${roleName}')" title="Duplicar rol" style="background:none;border:none;cursor:pointer;font-size:1rem;margin-right:4px;">⧉</button>
                    <button class="btn-delete-role" onclick="Config.deleteRole('${roleName}')" title="Eliminar rol">🗑️</button>
                </div>
                <div class="role-card-body">

                    <label class="config-label">
                        Keyword
                        <small style="font-weight:normal;color:rgba(241,241,241,0.55);">
                            — sin condicional actúa sola; con condicional ambas deben cumplirse
                        </small>
                    </label>
                    <div class="keywords-container">
                        ${kwChips || '<span class="empty-chips">Sin keywords asignadas</span>'}
                    </div>
                    <div class="add-keyword-container">
                        <input type="text" class="keyword-input" placeholder="Nueva keyword..."
                            data-role="${roleName}"
                            onkeydown="if(event.key==='Enter')Config.addCondKeywordFromInput(this)">
                        <button class="btn btn-sm" onclick="Config.addCondKeywordFromInput(this.previousElementSibling)">+ Agregar</button>
                    </div>

                    <label class="config-label conditional-label">
                        Condicional
                        <small style="font-weight:normal;">— opcional, DEBE estar presente junto a la keyword</small>
                    </label>
                    <div class="keywords-container">
                        ${condChips || '<span class="empty-chips">Sin condicionales (rol simple)</span>'}
                    </div>
                    <div class="add-keyword-container">
                        <input type="text" class="keyword-input conditional-input"
                            placeholder="Nueva condicional..."
                            data-role="${roleName}"
                            onkeydown="if(event.key==='Enter')Config.addConditionalFromInput(this)">
                        <button class="btn btn-sm btn-danger" onclick="Config.addConditionalFromInput(this.previousElementSibling)">+ Agregar</button>
                    
                    </div>
                    <div class="role-nom-filter-row">
                        <label class="config-label" style="margin-bottom:4px;">
                            Restringir detección a Nomenclatura
                            <small style="font-weight:normal;color:rgba(241,241,241,0.45);">
                                — busca keywords solo en esas oraciones del efecto (vacío = todo el efecto)
                            </small>
                        </label>
                        <div class="keywords-container">
                            ${(() => {
                                const selected = ConfigManager.getRoleNomenclatureCategories(roleName);
                                const cats = ConfigManager.getNomenclature().categories || [];
                                if (selected.length === 0) return '<span class="empty-chips">Sin restricción (todo el efecto)</span>';
                                return selected.map(catId => {
                                    const cat = cats.find(c => c.id === catId);
                                    const label = cat ? cat.name : catId;
                                    const borderColor = cat?.color || '#888';
                                    return `<div class="keyword-chip" style="border-color:${borderColor}">
                                        <span class="chip-text">${label}</span>
                                        <span class="chip-remove" onclick="Config.removeRoleNomCat('${roleName}','${catId}')">×</span>
                                    </div>`;
                                }).join('');
                            })()}
                        </div>
                        <div class="add-keyword-container">
                            <select class="role-nom-select" id="nom-cat-select-${roleName}">
                                ${Config.renderNomCategoryOptionsAdd(roleName)}
                            </select>
                            <button class="btn btn-sm" onclick="Config.addRoleNomCat('${roleName}')">+ Agregar</button>
                        </div>
                    </div>
                    <div class="role-weight-row">
                        <label class="role-weight-label" title="1.0 = genérico (máximo aporte) · 0.1 = arquetípico (aporte reducido)">
                            Peso del rol
                            <span class="role-weight-display" id="rw-${roleName}">${ConfigManager.getRoleWeight(roleName).toFixed(1)}</span>
                        </label>
                        <input type="range" class="role-weight-input"
                            min="0.1" max="1.0" step="0.1"
                            value="${ConfigManager.getRoleWeight(roleName)}"
                            oninput="document.getElementById('rw-${roleName}').textContent=parseFloat(this.value).toFixed(1)"
                            onchange="ConfigManager.setRoleWeight('${roleName}', parseFloat(this.value))">
                    </div>
                </div>
            </div>`;
    },
    removeCondKeywordByIndex: function (roleName, index) {
        const cond = ConfigManager.getRoleCondition(roleName);
        if (!cond?.keywords) return;
        const kw = cond.keywords[index];
        if (kw !== undefined) {
            ConfigManager.removeKeywordFromRoleCondition(roleName, kw);
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        }
    },

    removeConditionalByIndex: function (roleName, index) {
        const cond = ConfigManager.getRoleCondition(roleName);
        if (!cond?.conditionals) return;
        const c = cond.conditionals[index];
        if (c !== undefined) {
            ConfigManager.removeConditionalFromRole(roleName, c);
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        }
    },

    // ===============================
    renderSpecialtiesSection: function() {
    const pairs = ConfigManager.getSpecialties();
    const roles = ConfigManager.getRoleNames();
    const roleOpts = (selected) => ['', ...roles].map(r =>
        `<option value="${r}" ${r === (selected||'') ? 'selected' : ''}>${r || '-- Sin rol --'}</option>`
    ).join('');

    let html = `
        <div class="config-help-text">
            <p><strong>Mecánicas y Counters:</strong> Conecta roles entre sí. El sistema detectará automáticamente qué cartas ejecutan cada mecánica y cuáles la contrarrestan según los roles asignados.</p>
            <small>Ejemplo: <em>Searcher ⟷ Handtrap</em> — cualquier carta con rol Handtrap countera a cualquier carta con rol Searcher.</small>
        </div>
        <div style="margin-bottom:var(--spacing-md);">
            <button class="btn btn-primary" onclick="Config.createSpecialtyPair()">➕ Nuevo Par</button>
        </div>
        <div class="specialty-pairs-list">`;

    if (pairs.length === 0) {
        html += '<p class="empty-chips" style="padding:var(--spacing-md);">No hay pares configurados</p>';
    }

    pairs.forEach(pair => {
        html += `
            <div class="specialty-pair-row" id="spec-anchor-${pair.id}" style="position:relative;">
                <div class="specialty-half spec-side">
                    <div class="specialty-half-header">
                        <span class="spec-badge">Mecánica</span>
                    </div>
                    <select class="keyword-input" id="mech-role-${pair.id}"
                        onchange="ConfigManager.updateSpecialtyPair('${pair.id}', this.value, document.getElementById('ctr-role-${pair.id}').value)">
                        ${roleOpts(pair.mechanicRole)}
                    </select>
                </div>
                <div class="specialty-connector">⟷</div>
                <div class="specialty-half counter-side">
                    <div class="specialty-half-header">
                        <span class="counter-badge">Counter</span>
                    </div>
                    <select class="keyword-input" id="ctr-role-${pair.id}"
                        onchange="ConfigManager.updateSpecialtyPair('${pair.id}', document.getElementById('mech-role-${pair.id}').value, this.value)">
                        ${roleOpts(pair.counterRole)}
                    </select>
                </div>
                <button class="btn-delete-role" onclick="Config.deleteSpecialtyPair('${pair.id}')"
                    style="position:absolute;top:8px;right:8px;" title="Eliminar par">🗑️</button>
            </div>`;
    });

    html += '</div>';
    return html;
},

    // ===============================
    renderStaplesSection: function () {
        const staples  = ConfigManager.getStaples();
        const entries  = Object.entries(staples);

        let html = `
            <div class="config-help-text">
                <p><strong>Staples:</strong> Cartas genéricas usadas en múltiples decks. Solo ingresa el ID — los datos se obtienen automáticamente.</p>
                <small>Haz click en cualquier imagen para ver los detalles de la carta.</small>
            </div>
            <div class="config-new-role">
                <input type="text" id="new-staple-id" class="config-input" placeholder="ID de la carta (ej: 83764718)">
                <button class="btn btn-primary" onclick="Config.createNewStaple()">+ Agregar</button>
            </div>
            <div class="staples-grid">`;

        if (entries.length === 0) {
            html += '<p class="empty-chips" style="grid-column:1/-1;padding:var(--spacing-md);">No hay staples configurados</p>';
        }
        
        entries.forEach(([id, data]) => {
            html += `
                <div class="staple-img-card" title="${data.name || id}">
                    <img src="${data.imageUrl}"
                         alt="${data.name || id}"
                         onclick="Config.openStapleCard('${id}')"
                         onerror="this.src='';this.style.background='#002b4d';this.style.minHeight='120px';">
                    <button class="staple-delete-btn" onclick="Config.deleteStaple('${id}')" title="Eliminar">✕</button>
                    <div class="staple-img-name">${data.name || id}</div>
                </div>`;
        });

        html += '</div>';
        return html;
    },

    // ===============================
    renderNomenclatureSection: function () {
        const nomenclature = ConfigManager.getNomenclature();

        let html = `
            <div class="config-help-text">
                <p><strong>Nomenclatura de Efectos:</strong> Define cómo se detecta y colorea cada parte del efecto de una carta.</p>
                <small>Cada categoría tiene UNA configuración con 4 campos. Los campos vacíos no se verifican.</small>
            </div>
            <div class="config-help-text" style="margin-bottom:var(--spacing-md);padding:var(--spacing-sm);background:rgba(255,215,0,0.07);border-left:3px solid var(--gold-color);border-radius:4px;">
    <p style="margin:0 0 6px 0;"><strong>¿Qué es la Nomenclatura?</strong></p>
    <p style="margin:0;line-height:1.6;opacity:0.85;">
        El texto de cada carta YGO sigue una estructura fija: primero indica 
        <em>cuándo</em> se activa (Timing), luego <em>qué necesitas</em> (Requisito/Costo), 
        y finalmente <em>qué hace</em> (Efecto). Las nomenclaturas te permiten colorear 
        cada parte del texto para leerla más rápido.<br>
        <strong>Ejemplo:</strong> <em>"During your opponent's turn (Timing) · send 1 card from your hand (Costo): negate the activation (Efecto)"</em><br>
        Usa <code>contains</code> para detectar palabras clave dentro de una cláusula, 
        <code>startsWith</code> si siempre empieza igual, y <code>notContains</code> para excluir falsos positivos.
    </p>
</div>
            <button class="btn btn-primary" onclick="Config.addNomenclatureCategory()" 
                style="margin-bottom:var(--spacing-md);">➕ Nueva Categoría</button>
            <div class="roles-list">`;

        (nomenclature.categories || []).forEach(cat => {
            html += this.renderNomenclatureCategory(cat);
        });

        html += '</div>';
        return html;
    },
// ===============================

renderDiminishingSection: function() {
    const config = ConfigManager.getDiminishingReturns();
    const roles = Object.keys(ConfigManager.getRoles() || {});
    
    let html = `
        <div class="config-section">
            <h3>⚖️ Rendimientos Decrecientes</h3>
            <p class="config-help-text">
                Define cuántas cartas de cada rol aportan de manera óptima antes de 
                que su valor marginal disminuya. Esto no penaliza Mecánica, 
                solo refleja que carta #1 vale más que carta #20.
            </p>
            
            <label class="config-checkbox">
                <input type="checkbox" id="diminishing-enabled" 
                    ${config.enabled ? 'checked' : ''} 
                    onchange="Config.toggleDiminishing()">
                Activar sistema de rendimientos decrecientes
            </label>
            
            <div id="diminishing-roles-config" style="${config.enabled ? '' : 'display:none'}">
    `;
    
    roles.forEach(role => {
    const threshold = config.roleThresholds[role] || { optimal: 10, max: 15, curve: 0.5, crossPenalty: false };
    html += `
        <div class="diminishing-role-card">
            <h4>${role}</h4>
            <div class="diminishing-inputs">
                <label>
                    Cantidad óptima: 
                    <input type="number" min="1" max="40" value="${threshold.optimal}" 
                        id="dim-optimal-${role}">
                </label>
                <label>
                    Umbral máximo: 
                    <input type="number" min="1" max="40" value="${threshold.max}" 
                        id="dim-max-${role}">
                </label>
                <label>
                    Severidad curva (0.1-1.0): 
                    <input type="number" min="0.1" max="1" step="0.1" value="${threshold.curve}" 
                        id="dim-curve-${role}">
                </label>
                <label class="config-checkbox" style="grid-column: 1 / -1;">
                    <input type="checkbox" id="dim-cross-${role}" 
                        ${threshold.crossPenalty ? 'checked' : ''}>
                    ⚠️ Exceso reduce otros pilares (penalización cruzada)
                </label>
                <button class="btn btn-success" onclick="Config.saveDiminishingRole('${role}')">
                    Guardar
                </button>
            </div>
        </div>
    `;
});
    
    html += `
            </div>
        </div>
    `;
    
    return html;
},

toggleDiminishing: function() {
    const enabled = document.getElementById('diminishing-enabled').checked;
    const config = ConfigManager.getDiminishingReturns();
    config.enabled = enabled;
    ConfigManager.saveDiminishingReturns(config);
    
    document.getElementById('diminishing-roles-config').style.display = 
        enabled ? '' : 'none';
},

saveDiminishingRole: function(role) {
    const optimal = parseFloat(document.getElementById(`dim-optimal-${role}`).value);
    const max = parseFloat(document.getElementById(`dim-max-${role}`).value);
    const curve = parseFloat(document.getElementById(`dim-curve-${role}`).value);
    const crossPenalty = document.getElementById(`dim-cross-${role}`).checked;
    
    ConfigManager.updateRoleThreshold(role, { optimal, max, curve, crossPenalty });
    alert(`✓ Configuración de ${role} guardada`);
},
   renderNomenclatureCategory: function (cat) {
        const cond = cat.conditions || {};

        const toArr = (v) => Array.isArray(v) ? v : (v ? [v] : []);
        const startsArr    = toArr(cond.startsWith);
        const containsArr  = toArr(cond.contains);
        const notContArr   = toArr(cond.notContains);
        const endsArr      = toArr(cond.endsWith);

        const makeChips = (arr, field, chipClass = '') => arr.map((kw, idx) => `
            <div class="keyword-chip ${chipClass}">
                <span class="chip-text">${kw}</span>
                <span class="chip-remove"
                    onclick="Config.removeNomCondKwByIndex('${cat.id}','${field}',${idx})">×</span>
            </div>`).join('');

        return `
        <div class="role-card" id="nom-anchor-${cat.id}">
            <div class="role-card-header">
                <input type="color" value="${cat.color}" title="Color de la categoría"
                    style="width:36px;height:36px;min-width:36px;border:2px solid var(--border-color);border-radius:6px;cursor:pointer;padding:2px;background:transparent;appearance:none;-webkit-appearance:none;"
                    onchange="ConfigManager.updateNomenclatureCategory('${cat.id}',{color:this.value});Config.render()">
                <input type="text" class="role-name-input" value="${cat.name}"
                    onblur="ConfigManager.updateNomenclatureCategory('${cat.id}',{name:this.value})"
                    onkeydown="if(event.key==='Enter')this.blur()">
                <button class="btn-delete-role" style="margin-left:auto;"
                    onclick="Config.deleteNomCategory('${cat.id}')">🗑️</button>
            </div>
            <div class="role-card-body" style="gap:12px;">

                <label class="config-label">
                    Empieza con:
                    <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— AL MENOS UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(startsArr, 'startsWith') || '<span class="empty-chips">Sin restricción de inicio</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-starts-${cat.id}" placeholder="Agregar inicio...">
                    <button class="btn btn-sm"
                        onclick="Config.addNomCondKw('${cat.id}','startsWith',document.getElementById('nom-starts-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label">
                    Contiene:
                    <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— AL MENOS UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(containsArr, 'contains') || '<span class="empty-chips">Sin keywords (cualquier texto)</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-contains-${cat.id}" placeholder="Agregar opción...">
                    <button class="btn btn-sm"
                        onclick="Config.addNomCondKw('${cat.id}','contains',document.getElementById('nom-contains-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label conditional-label">
                    NO contiene:
                    <small style="font-weight:normal;">— NINGUNA debe estar presente</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(notContArr, 'notContains', 'conditional-chip') || '<span class="empty-chips">Sin restricciones</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input conditional-input" id="nom-notcontains-${cat.id}" placeholder="Agregar exclusión...">
                    <button class="btn btn-sm btn-danger"
                        onclick="Config.addNomCondKw('${cat.id}','notContains',document.getElementById('nom-notcontains-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label">
                    Termina en:
                    <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— AL MENOS UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(endsArr, 'endsWith') || '<span class="empty-chips">Sin restricción de cierre</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-ends-${cat.id}" placeholder="Agregar cierre...">
                    <button class="btn btn-sm"
                        onclick="Config.addNomCondKw('${cat.id}','endsWith',document.getElementById('nom-ends-${cat.id}'))">+ Agregar</button>
                </div>

                <div class="config-help-text" style="margin-top:8px;">
                    <small><strong>Cómo funciona:</strong> Un segmento se detecta si empieza con AL MENOS UNA de "Empieza con", contiene AL MENOS UNA de "Contiene", NO contiene NINGUNA de "NO contiene", y termina con AL MENOS UNA de "Termina en". Los campos vacíos no se verifican.</small>
                </div>
            </div>
        </div>`;
    },
renderNomCategoryOptions: function (selectedId) {
        const cats = (ConfigManager.getNomenclature().categories || []);
        const none = `<option value="—" ${!selectedId ? 'selected' : ''}>— Todo el efecto (sin filtro)</option>`;
        const opts = cats.map(cat =>
            `<option value="${cat.id}" ${selectedId === cat.id ? 'selected' : ''}>
                ${cat.name}
            </option>`
        ).join('');
        return none + opts;
    },
    // ===============================
    createNewRole: function () {
        const input = document.getElementById('new-role-input');
        const name  = input.value.trim();
        if (!name) { alert('⚠️ Escribe un nombre para el rol'); return; }
        if (ConfigManager.createRole(name)) { 
            input.value = ''; 
            this.render(); 
        } else {
            alert('❌ No se pudo crear el rol (puede que ya exista)');
        }
    },

    renameRole: function (el) {
        const oldName = el.dataset.original;
        const newName = el.value.trim();
        if (newName === oldName) return;
        if (!newName) { 
            alert('⚠️ El nombre no puede estar vacío'); 
            el.value = oldName; 
            return; 
        }
        if (ConfigManager.renameRole(oldName, newName)) {
            this.render();
        } else { 
            alert('❌ No se pudo renombrar'); 
            el.value = oldName; 
        }
    },

    deleteRole: function (roleName) {
        if (!confirm(`¿Eliminar el rol "${roleName}"?`)) return;
        if (ConfigManager.deleteRole(roleName)) {
            this.render();
        } else {
            alert('❌ No se pudo eliminar el rol');
        }
    },

    addCondKeywordFromInput: function (el) {
        const roleName = el.dataset.role;
        const kw       = el.value.trim().toLowerCase();
        if (!kw) { alert('⚠️ Escribe una keyword'); return; }
        if (ConfigManager.addKeywordToRoleCondition(roleName, kw)) { 
            el.value = ''; 
            this.render(); 
        } else {
            alert('❌ No se pudo agregar (puede que ya exista)');
        }
    },

    removeCondKeyword: function (roleName, keyword) {
        if (ConfigManager.removeKeywordFromRoleCondition(roleName, keyword)) {
            this.render();
        }
    },

    addConditionalFromInput: function (el) {
        const roleName = el.dataset.role;
        const val      = el.value.trim().toLowerCase();
        if (!val) { alert('⚠️ Escribe una condicional'); return; }
        if (ConfigManager.addConditionalToRole(roleName, val)) { 
            el.value = ''; 
            this.render(); 
        } else {
            alert('❌ No se pudo agregar (puede que ya exista)');
        }
    },

    removeConditional: function (roleName, conditional) {
        if (ConfigManager.removeConditionalFromRole(roleName, conditional)) {
            this.render();
        }
    },

    // ===============================
    createSpecialtyPair: function() {
    const id = ConfigManager.createSpecialtyPair('', '');
    this.render();
    this._restoreAndScroll('specialties-section', `spec-anchor-${id}`);
},

    deleteSpecialtyPair: function (id) {
        if (!confirm('¿Eliminar este par?')) return;
        if (ConfigManager.deleteSpecialtyPair(id)) {
            this.render();
        }
    },

    addSpecKw: function (id, side, el) {
        const kw = el.value.trim().toLowerCase();
        if (!kw) return;
        if (ConfigManager.addKeywordToSpecialtyPair(id, side, kw)) { 
            el.value = ''; 
            this.render(); 
        } else {
            alert('❌ Keyword ya existe');
        }
    },

    removeSpecKw: function (id, side, keyword) {
        if (ConfigManager.removeKeywordFromSpecialtyPair(id, side, keyword)) {
            this.render();
        }
    },

    createNewStaple: async function () {
        const input  = document.getElementById('new-staple-id');
        const cardId = input.value.trim();
        if (!cardId) { alert('⚠️ Ingresa un ID de carta'); return; }
        if (ConfigManager.isStaple(cardId)) { 
            alert('⚠️ Esta carta ya está en la lista'); 
            return; 
        }

        const btn = input.nextElementSibling;
        const originalText = btn.textContent;
        btn.textContent = '⏳';
        btn.disabled = true;

        try {
            const resp = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}`);
            if (!resp.ok) throw new Error('not found');
            const data = await resp.json();
            if (!data.data || data.data.length === 0) { 
                alert('❌ Carta no encontrada'); 
                return; 
            }
            const card = data.data[0];
            ConfigManager.createStaple(String(card.id), {
                name:     card.name,
                imageUrl: card.card_images[0]?.image_url_small || `https://images.ygoprodeck.com/images/cards_small/${card.id}.jpg`,
                type:     card.type
            });
            input.value = '';
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
            console.log(`✅ Carta agregada: ${card.name} (ID: ${card.id})`);
        } catch (e) {
            
            console.error('❌ No se encontró la carta. Verifica el ID.' + card.name);
            
        } finally {
            btn.textContent = originalText;
            btn.disabled    = false;
        }
    },

    deleteStaple: function (cardId) {
        if (!confirm('¿Eliminar este staple?')) return;
        if (ConfigManager.deleteStaple(cardId)) {
            this.render();
        }
    },

    openStapleCard: async function (cardId) {
        try {
            const resp = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}`);
            const data = await resp.json();
            if (data.data && data.data[0]) {
                if (window.CardViewer && typeof CardViewer.open === 'function') {
                    CardViewer.open(data.data[0]);
                } else if (window.Buscador && typeof Buscador.openCardModal === 'function') {
                    Buscador.openCardModal(data.data[0]);
                }
            }
        } catch (e) { 
            console.error('Error abriendo staple:', e); 
        }
    },

    // ===============================
    addNomenclatureCategory: function() {
    ConfigManager.addNomenclatureCategory();
    this.render();
    this._restoreAndScroll('nomenclature-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('nomenclature-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
},

    deleteNomCategory: function (categoryId) {
        if (!confirm('¿Eliminar esta categoría?')) return;
        if (ConfigManager.deleteNomenclatureCategory(categoryId)) {
            this.render();
        }
    },

    // ===============================
    resetToDefault: function () {
        if (!confirm(
            '🔄 RESTAURAR DE FÁBRICA\n\n' +
            'Esto borrará TODA la data actual (decks, engines, matchups, winrates, etc.)\n' +
            'y restaurará la configuración al estado original de la app.\n\n' +
            'Esta acción NO se puede deshacer.'
        )) return;
        // Limpiar todo el localStorage
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k) allKeys.push(k);
        }
        allKeys.forEach(k => localStorage.removeItem(k));
        // Poner config de fábrica
        if (window.ConfigManager) ConfigManager.resetToDefault();
        // Resetear módulos en memoria
        this._resetModulesInMemory();
        this.render();
        alert('✅ App restaurada a valores de fábrica.');
    },

    exportConfig: function () {
        if (ConfigManager.exportConfig()) {
            alert('✅ Backup exportado (decks, engines, matchups, winrates, config y más).');
        } else {
            alert('❌ No se pudo exportar el backup.');
        }
    },

    generarReporte: function () {
        if (typeof window.DDLogger === 'undefined') {
            alert('❌ Logger no disponible en esta sesión.');
            return;
        }
        const total  = window.DDLogger.getLogs().length;
        const errors = window.DDLogger.getLogs().filter(e => !e.ok).length;
        if (!confirm(`📋 Generar reporte de log?\n\nEntradas: ${total}\nErrores: ${errors}\n\nSe descargará un archivo .txt.`)) return;
        window.DDLogger.exportReport();
    },

    importConfig: function () {
        document.getElementById('config-import-file')?.click();
    },

    handleFileImport: async function (el) {
        const file = el.files[0];
        if (!file) return;
        try {
            await ConfigManager.importConfig(file);
            alert('✅ Backup importado correctamente. La app se recargará para aplicar los cambios.');
            location.reload();
        } catch (err) {
            alert('❌ Error al importar: ' + err);
            el.value = '';
        }
    },
    
    addNomCondKw: function (catId, field, el) {
    const kw = el.value.trim().toLowerCase();
    if (!kw) { alert('⚠️ Escribe una keyword'); return; }
    if (ConfigManager.addNomCondKw(catId, field, kw)) {
        el.value = '';
        this.render();
        this._restoreAndScroll('nomenclature-section', `nomenclature-category-anchor-${catId}`);
    } else {
        alert('❌ Ya existe esa keyword');
    }
},

removeNomCondKw: function (catId, field, kw) {
        if (ConfigManager.removeNomCondKw(catId, field, kw)) {
            this.render();
            this._restoreAndScroll('nomenclature-section', `nomenclature-category-anchor-${catId}`);
        }
    },
    removeNomCondKwByIndex: function (catId, field, index) {
        if (ConfigManager.removeNomCondKwByIndex(catId, field, index)) {
            this.render();
            this._restoreAndScroll('nomenclature-section', `nomenclature-category-anchor-${catId}`);
        }
    },renderNomCategoryOptionsAdd: function(roleName) {
    const cats     = ConfigManager.getNomenclature().categories || [];
    const selected = ConfigManager.getRoleNomenclatureCategories(roleName);
    const available = cats.filter(c => !selected.includes(c.id));
    if (available.length === 0)
        return '<option value="">Sin más categorías</option>';
    return '<option value="">-- Seleccionar --</option>' +
        available.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
},

addRoleNomCat: function(roleName) {
    const sel = document.getElementById(`nom-cat-select-${roleName}`);
    if (!sel || !sel.value) return;
    if (ConfigManager.addRoleNomenclatureCategory(roleName, sel.value)) {
        this.render();
        this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
    }
},

removeRoleNomCat: function(roleName, catId) {
    if (ConfigManager.removeRoleNomenclatureCategory(roleName, catId)) {
        this.render();
        this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
    }
},
_restoreAndScroll: function(sectionId, anchorId) {
    requestAnimationFrame(() => {
        const sec = document.getElementById(sectionId);
        if (sec) sec.style.display = 'block';
        if (anchorId) {
            const el = document.getElementById(anchorId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
},
    toggleSection: function (sectionId) {
        const sec = document.getElementById(sectionId);
        if (sec) {
            sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
        }
        
    },
    
    borrarDeck: function () {
        if (!confirm(
            '¿Borrar TODOS los decks, engines, matchups, winrates, favoritas y estados de práctica?\n' +
            'La configuración (roles, staples, etc.) no se tocará.\n' +
            'Esta acción no se puede deshacer.'
        )) return;

        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;
            if (k.startsWith('deck_') || k.startsWith('matchup_') || k.startsWith('pz_states_'))
                keysToRemove.push(k);
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.removeItem('yugioh_engines');
        localStorage.removeItem('yugioh_winrates');
        localStorage.removeItem('pz_winrate_standalone');
        localStorage.removeItem('yugioh_favoritas');
        localStorage.removeItem('yugioh_torneo_actual');
        localStorage.removeItem('yugioh_power_cache');
        localStorage.removeItem('yugioh_cross_scores');

        if (window.Deck) { Deck.cards = {}; Deck.name = 'Mi Deck'; Deck.notes = ''; Deck.render(); }
        if (window.Engines && document.getElementById('mideck-content')) Engines._renderSidebar();
        if (window.Favoritas) Favoritas.render?.();
        if (window.Winrate)   Winrate.refreshSection();
        if (window.Duelista)  Duelista.refreshSection();
        if (window.Torneo)    Torneo._initialized = false;
        if (window.Estadisticas) {
            Estadisticas.powerScoreCache = null;
            if (typeof Estadisticas.updateFloatingWidget === 'function') Estadisticas.updateFloatingWidget();
        }

        alert(`✅ ${keysToRemove.length} deck(s) y toda la data de juego eliminados.`);
    },

    // borrarMeta eliminado — pestaña Meta ya no existe
    borrarTodo: function () {
        if (!confirm(
            '⚠️ BORRAR TODO ⚠️\n\n' +
            'Esto eliminará ABSOLUTAMENTE TODA la data:\n' +
            '• Decks guardados y estados de práctica\n' +
            '• Engines y Staples\n' +
            '• Matchups, winrates e historial\n' +
            '• Favoritas y banlist personalizada\n' +
            '• Notas y temas de Formación\n' +
            '• Torneo activo\n' +
            '• Cache de Estadísticas y Meta\n' +
            '• Toda la Configuración (roles, mecánicas, nomenclatura, pilares)\n\n' +
            'La app quedará completamente vacía.\n' +
            'Esta acción NO se puede deshacer.'
        )) return;

        // Borrar absolutamente todo el localStorage
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k) allKeys.push(k);
        }
        allKeys.forEach(k => localStorage.removeItem(k));

        // Resetear módulos en memoria
        this._resetModulesInMemory();
        this.render();
        if (window.Welcome) Welcome.init();
        alert('✅ Todo borrado. La app está completamente vacía.');
    },

    // Resetea todos los módulos en memoria tras un clear total
    _resetModulesInMemory: function () {
        if (window.Deck) {
            Deck.cards = {};
            Deck.name  = 'Mi Deck';
            Deck.notes = '';
            if (document.getElementById('deck-content')) Deck.render();
        }
        if (window.Engines) {
            if (document.getElementById('mideck-content')) Engines._renderSidebar();
        }
        if (window.Matchups) {
            if (document.getElementById('historial-content')) Matchups.refreshSection?.();
        }
        if (window.Duelista) {
            const el = document.getElementById('duelista-content');
            if (el) Duelista.refreshSection();
        }
        if (window.Estadisticas) {
            Estadisticas.powerScoreCache  = null;
            Estadisticas.metaDecks        = {};
            Estadisticas.metaFolders      = [];
            Estadisticas.metaCardLibrary  = {};
            Estadisticas.metaDeckScores   = {};
            Estadisticas.crossScores      = {};
            if (document.getElementById('estadisticas-content')) Estadisticas.render();
            if (typeof Estadisticas.updateFloatingWidget === 'function')
                Estadisticas.updateFloatingWidget();
        }
        if (window.Favoritas) {
            const el = document.getElementById('favoritas-panel');
            if (el) Favoritas.render();
        }
        if (window.Winrate) Winrate.refreshSection();
        if (window.Torneo) {
            Torneo._initialized = false;
        }
        if (window.ContentManager) ContentManager.applyAll();
    },
renderPillarsSection: function() {
    const pillars   = ConfigManager.getPillars();
    const allRoles  = ConfigManager.getRoleNames();

    const pillarDefs = [
        { key: 'consistency', label: '🎯 Consistencia', color: '#00b894',
          hint: 'Arranque y búsqueda — roles que garantizan la mano inicial.' },
        { key: 'power',       label: '⚡ Potencia',      color: '#d63031',
          hint: 'Cierre y rompedoras — roles que ganan el juego.' },
        { key: 'resilience',  label: '🛡️ Resiliencia',   color: '#0066cc',
          hint: 'Negación y extensión — roles que sostienen la estrategia.' }
    ];

    const pillarCard = (def) => {
        const assigned = pillars[def.key] || [];
        const available = allRoles.filter(r => !assigned.includes(r));

        const chips = assigned.length > 0
            ? assigned.map(role => {
                const w = ConfigManager.getRoleWeight(role).toFixed(1);
                return `<div class="keyword-chip" style="border-color:${def.color}">
                    <span class="chip-text">${role} <small style="opacity:0.6">(${w})</small></span>
                    <span class="chip-remove"
                        onclick="Config.removePillarRole('${def.key}','${role}')">×</span>
                </div>`;
            }).join('')
            : '<span class="empty-chips">Sin roles asignados</span>';

        const opts = available.length > 0
            ? '<option value="">-- Agregar rol --</option>' +
              available.map(r => `<option value="${r}">${r}</option>`).join('')
            : '<option value="">Sin roles disponibles</option>';

        return `
            <div class="role-card" style="border-top:3px solid ${def.color}">
                <div class="role-card-header" style="background:${def.color}22">
                    <span style="font-weight:bold;color:${def.color}">${def.label}</span>
                </div>
                <div class="role-card-body">
                    <small class="config-help-text" style="display:block;margin-bottom:8px;">${def.hint}</small>
                    <div class="keywords-container">${chips}</div>
                    <div class="add-keyword-container" style="margin-top:8px;">
                        <select class="keyword-input" id="pillar-add-${def.key}">${opts}</select>
                        <button class="btn btn-sm"
                            onclick="Config.addPillarRole('${def.key}')">+ Agregar</button>
                    </div>
                </div>
            </div>`;
    };

   const PILLAR_LABELS = { consistency: 'Consistencia', power: 'Potencia', resilience: 'Resiliencia' };
    const rps = ConfigManager.getPillarRPS();

    const rpsRows = rps.map((pair, i) => `
        <div class="rps-config-row">
            <select class="keyword-input rps-select" onchange="Config.updateRPSRule(${i}, 0, this.value)">
                ${['consistency','power','resilience'].map(p =>
                    `<option value="${p}" ${pair[0]===p?'selected':''}>${PILLAR_LABELS[p]}</option>`
                ).join('')}
            </select>
            <span class="rps-arrow">vence a</span>
            <select class="keyword-input rps-select" onchange="Config.updateRPSRule(${i}, 1, this.value)">
                ${['consistency','power','resilience'].map(p =>
                    `<option value="${p}" ${pair[1]===p?'selected':''}>${PILLAR_LABELS[p]}</option>`
                ).join('')}
            </select>
        </div>`).join('');

    return `
        <div class="config-help-text">
            <p>Define qué roles de tu configuración aportan a cada pilar. El <strong>peso del rol</strong> (definido en Roles) determina cuánto aporta cada uno.</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--spacing-md);">
            ${pillarDefs.map(d => pillarCard(d)).join('')}
        </div>
        <div style="margin-top:var(--spacing-md);">
            <div class="config-help-text" style="margin-bottom:8px;">
                <strong>Relación entre pilares (RPS)</strong> — define qué pilar vence a cuál en match-ups. Afecta el External Score cuando los pilares dominantes se enfrentan.
            </div>
            <div class="rps-config-grid">${rpsRows}</div>
        </div>`;
},
renderShortcutsSection: function () {
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    const catalog   = window.Shortcuts?.CATALOG || [];
    const MAX       = 6;

    const rows = shortcuts.map((s, i) => `
        <div class="shortcut-row">
            <span class="shortcut-label">⚡ ${s.label}</span>
            <div class="shortcut-row-actions">
                ${i > 0 ? `<button class="btn btn-sm" onclick="Config.moveShortcut(${i}, -1)" title="Subir">↑</button>` : '<span style="width:32px"></span>'}
                ${i < shortcuts.length - 1 ? `<button class="btn btn-sm" onclick="Config.moveShortcut(${i}, 1)" title="Bajar">↓</button>` : '<span style="width:32px"></span>'}
                <button class="btn btn-sm btn-danger" onclick="Config.removeShortcut(${i})" title="Quitar">✕</button>
            </div>
        </div>`).join('');

    const available = catalog.filter(c => !shortcuts.some(s => s.label === c.label));
    const opts = available.length > 0
        ? '<option value="">-- Agregar atajo --</option>' +
          available.map((c, i) => `<option value="${i}">${c.label}</option>`).join('')
        : '<option value="">Todos los atajos ya están agregados</option>';

    const canAdd = shortcuts.length < MAX && available.length > 0;

    return `
        <div class="config-help-text">
            <p>Configura hasta <strong>${MAX} atajos</strong> para el botón flotante ⚡. El orden determina cómo aparecen en el menú.</p>
        </div>
        <div class="shortcuts-config-list">
            ${rows || '<p class="stats-empty" style="margin:0">No hay atajos configurados.</p>'}
        </div>
        ${canAdd ? `
        <div class="add-keyword-container" style="margin-top:12px;">
            <select class="keyword-input" id="shortcut-add-select">${opts}</select>
            <button class="btn btn-sm" onclick="Config.addShortcut()">+ Agregar</button>
        </div>` : `<p style="opacity:0.4;font-size:0.8rem;margin-top:8px;">Máximo de ${MAX} atajos alcanzado.</p>`}`;
},

addShortcut: function () {
    const sel = document.getElementById('shortcut-add-select');
    if (!sel || !sel.value) return;
    const catalog   = window.Shortcuts?.CATALOG || [];
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    const available = catalog.filter(c => !shortcuts.some(s => s.label === c.label));
    const entry     = available[parseInt(sel.value)];
    if (!entry || shortcuts.length >= 6) return;
    shortcuts.push(entry);
    window.ConfigManager.saveShortcuts(shortcuts);
    this.render();
    this._restoreAndScroll('shortcuts-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('shortcuts-section');
        if (sec) sec.style.display = 'block';
    });
},

removeShortcut: function (index) {
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    shortcuts.splice(index, 1);
    window.ConfigManager.saveShortcuts(shortcuts);
    this.render();
    requestAnimationFrame(() => {
        const sec = document.getElementById('shortcuts-section');
        if (sec) sec.style.display = 'block';
    });
},

moveShortcut: function (index, dir) {
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    const newIndex  = index + dir;
    if (newIndex < 0 || newIndex >= shortcuts.length) return;
    [shortcuts[index], shortcuts[newIndex]] = [shortcuts[newIndex], shortcuts[index]];
    window.ConfigManager.saveShortcuts(shortcuts);
    this.render();
    requestAnimationFrame(() => {
        const sec = document.getElementById('shortcuts-section');
        if (sec) sec.style.display = 'block';
    });
},
addPillarRole: function(pillar) {
    const sel = document.getElementById(`pillar-add-${pillar}`);
    if (!sel || !sel.value) return;
    if (ConfigManager.addRoleToPillar(pillar, sel.value)) {
        this.render();
    this._restoreAndScroll('pillar-section', `pillar-anchor-${pillar}`);
    }
},

removePillarRole: function(pillar, role) {
    if (ConfigManager.removeRoleFromPillar(pillar, role)) {
        this.render();
        this._restoreAndScroll('pillar-section', `pillar-anchor-${pillar}`);
    }
},
updateRPSRule: function (index, position, value) {
    const rps = ConfigManager.getPillarRPS();
    if (!rps[index]) return;
    rps[index][position] = value;
    ConfigManager.savePillarRPS(rps);
},
duplicateRole: function(roleName) {
    const newName = ConfigManager.duplicateRole(roleName);
    if (!newName) return;
    this.render();
    this._restoreAndScroll('roles-section', `role-anchor-${CSS.escape(newName)}`);
},
renderMusicSection: function () {
    const cfg    = window.ConfigManager ? ConfigManager.getMusicConfig() : ConfigManager.defaultMusicConfig;
    const tracks = cfg.tracks || {};
    const volume = cfg.volume ?? 0.40;
    const enabled = cfg.enabled !== false;

    const row = (key, label) => `
        <div class="music-track-row">
            <label class="music-track-label">${label}</label>
            <input type="text" class="config-input music-track-input"
                   id="music-track-${key}"
                   value="${tracks[key] || ''}"
                   placeholder="ots/nombre.mp3">
        </div>`;

    return `
        <div class="music-config-block">
            <label class="music-enable-label">
                <input type="checkbox" id="music-enabled-cb" ${enabled ? 'checked' : ''}>
                Activar música de fondo
            </label>

            <div class="music-volume-row">
                <span class="music-track-label">Volumen</span>
                <input type="range" id="music-volume-slider"
                       min="0" max="1" step="0.05" value="${volume}"
                       oninput="Config.onVolumeChange(this.value)">
                <span id="music-volume-display" class="music-volume-display">
                    ${Math.round(volume * 100)}%
                </span>
            </div>

            <div class="music-tracks-block">
                <div class="music-tracks-title">Pistas por Perfil</div>
                ${row('default',     '🎵 Por defecto')}
                ${row('novato',      '🌱 Novato')}
                ${row('casual',      '🃏 Casual')}
                ${row('competitivo', '⚔️ Competitivo')}
            </div>

            <button class="btn btn-primary" onclick="Config.saveMusicConfig()" style="margin-top:12px;">
                Guardar Ajustes de Música
            </button>
        </div>`;
},

saveMusicConfig: function () {
    const enabled = document.getElementById('music-enabled-cb')?.checked !== false;
    const volume  = parseFloat(document.getElementById('music-volume-slider')?.value ?? 0.40);
    const tracks  = {
        default:     (document.getElementById('music-track-default')?.value     || 'ots/Climax Theme 2.mp3').trim(),
        novato:      (document.getElementById('music-track-novato')?.value      || 'ots/Climax Theme 5.mp3').trim(),
        casual:      (document.getElementById('music-track-casual')?.value      || 'ots/Climax Theme 5.mp3').trim(),
        competitivo: (document.getElementById('music-track-competitivo')?.value || 'ots/Climax Theme 5.mp3').trim()
    };
    const cfg = { enabled, volume, tracks };
    if (window.ConfigManager) ConfigManager.saveMusicConfig(cfg);
    if (window.MusicPlayer) {
        MusicPlayer.setVolume(volume);
        MusicPlayer.setEnabled(enabled);
    }
    const disp = document.getElementById('music-volume-display');
    if (disp) disp.textContent = Math.round(volume * 100) + '%';
},

onVolumeChange: function (val) {
    const disp = document.getElementById('music-volume-display');
    if (disp) disp.textContent = Math.round(parseFloat(val) * 100) + '%';
    if (window.MusicPlayer) MusicPlayer.setVolume(parseFloat(val));
},
renderPlayerLevelSection: function () {
    const current = window.ConfigManager ? ConfigManager.getPlayerLevel() : 'default';
    const levels = [
        { key: 'novato',      icon: '🌱', label: 'Novato',      desc: 'Aprende las bases del juego y la app',           color: '#00b894' },
        { key: 'casual',      icon: '🃏', label: 'Casual',      desc: 'Construye decks y juega por diversión',           color: '#fdcb6e' },
        { key: 'competitivo', icon: '⚔️', label: 'Competitivo', desc: 'Analiza el meta y optimiza tu estrategia',        color: '#d63031' },
    ];

    const buttons = levels.map(l => {
        const isActive = current === l.key;
        const border   = isActive ? `2px solid ${l.color}` : '1px solid rgba(255,255,255,0.1)';
        const bg       = isActive ? `${l.color}18` : 'transparent';
        return `
            <button class="welcome-btn"
                    style="border:${border};background:${bg};cursor:pointer;"
                    onclick="Config.selectPlayerLevel('${l.key}')">
                <span class="wb-icon">${l.icon}</span>
                <span>
                    <span class="wb-label" style="color:${l.color}">${l.label}${isActive ? ' ✓' : ''}</span>
                    <span class="wb-desc">${l.desc}</span>
                </span>
            </button>`;
    }).join('');

    return `
        <div class="config-help-text">
            <p>Cambia tu perfil en cualquier momento. Activa automáticamente la pista musical asociada.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;max-width:480px;">
            ${buttons}
        </div>`;
},

selectPlayerLevel: function (levelKey) {
    if (window.ConfigManager) ConfigManager.savePlayerLevel(levelKey);
    if (window.ContentManager) ContentManager.applyProfile(levelKey);
    if (window.MusicPlayer) {
        const cfg  = window.ConfigManager ? ConfigManager.getMusicConfig() : {};
        const path = cfg.tracks?.[levelKey] || 'ots/Climax Theme 2.mp3';
        MusicPlayer.setTrack(path);
    }
    this.render();
    this._restoreAndScroll('player-level-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('player-level-section');
        if (sec) sec.style.display = 'block';
    });
},
// ===============================
renderMetaLinksSection: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Define los enlaces que se mostrarán en la pestaña Meta. Cada fuente tiene título, URL y descripción opcional.
        </p>
        <div class="meta-links-list" id="config-meta-links-list">
            ${links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('')}
        </div>
        <button class="meta-links-add-btn" onclick="Config.addMetaLink()">+ Agregar fuente</button>
        <br>
        <button class="meta-links-save-btn" onclick="Config.saveMetaLinks()">💾 Guardar fuentes</button>
    `;
},

_renderMetaLinkItem: function (lk, i) {
    return `
        <div class="meta-link-item" id="meta-link-item-${i}">
            <div class="meta-link-item-header">
                <span class="meta-link-index">#${i + 1}</span>
                <button class="meta-link-del-btn" onclick="Config.removeMetaLink(${i})">✕ Eliminar</button>
            </div>
            <div class="meta-link-field">
                <label>Título</label>
                <input type="text" id="ml-title-${i}" value="${this._escVal(lk.title)}" placeholder="Ej: Master Duel Meta – Tier List">
            </div>
            <div class="meta-link-field">
                <label>URL</label>
                <input type="url" id="ml-url-${i}" value="${this._escVal(lk.url)}" placeholder="https://...">
            </div>
            <div class="meta-link-field">
                <label>Descripción</label>
                <textarea id="ml-desc-${i}" placeholder="Descripción breve de la fuente...">${this._escVal(lk.desc)}</textarea>
            </div>
        </div>
    `;
},

_escVal: function (str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
},

addMetaLink: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.push({ id: 'ml_' + Date.now(), title: '', url: '', desc: '' });
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

removeMetaLink: function (index) {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.splice(index, 1);
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

saveMetaLinks: function () {
    const list = document.getElementById('config-meta-links-list');
    if (!list || !window.ConfigManager) return;
    const items = list.querySelectorAll('.meta-link-item');
    const links = [];
    items.forEach((item, i) => {
        links.push({
            id:    document.getElementById(`ml-title-${i}`) ? ('ml_' + i) : ('ml_' + Date.now() + i),
            title: (document.getElementById(`ml-title-${i}`)?.value || '').trim(),
            url:   (document.getElementById(`ml-url-${i}`)?.value   || '').trim(),
            desc:  (document.getElementById(`ml-desc-${i}`)?.value  || '').trim()
        });
    });
    ConfigManager.saveMetaLinks(links);
    alert('Fuentes guardadas. Los cambios se verán la próxima vez que abras la pestaña Meta.');
},

_reRenderMetaLinks: function (links) {
    const list = document.getElementById('config-meta-links-list');
    if (!list) return;
    list.innerHTML = links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('');
},
// ===============================
_META_FORMATS: ['TCG', 'OCG', 'Genesys', 'Master Duel', 'Duel Links', 'Time Wizard', 'Todos'],

renderMetaMastersSection: function () {
    const masters = window.ConfigManager ? ConfigManager.getMetaMasters() : [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Configura los creadores de contenido que aparecen en la pestaña Meta. Pega la URL del video de YouTube que quieras mostrar.
        </p>
        <div class="meta-masters-list" id="config-meta-masters-list">
            ${masters.map((m, i) => this._renderMetaMasterItem(m, i)).join('')}
        </div>
        <div class="meta-masters-btns">
            <button class="meta-masters-add-btn" onclick="Config.addMetaMaster()">+ Agregar maestro</button>
            <button class="meta-masters-save-btn" onclick="Config.saveMetaMasters()">💾 Guardar maestros</button>
        </div>
    `;
},

_renderMetaMasterItem: function (m, i) {
    const formats   = Array.isArray(m.formats) ? m.formats : [];
    const allFmts   = this._META_FORMATS;
    const checkboxes = allFmts.map(f => {
        const checked = formats.includes(f) ? 'checked' : '';
        return `<label class="meta-format-check-label">
            <input type="checkbox" value="${f}" ${checked} class="mm-fmt-${i}"> ${f}
        </label>`;
    }).join('');

    return `
        <div class="meta-master-item" id="meta-master-item-${i}">
            <div class="meta-master-item-header">
                <span class="meta-master-index">#${i + 1}</span>
                <button class="meta-master-del-btn" onclick="Config.removeMetaMaster(${i})">✕ Eliminar</button>
            </div>
            <div class="meta-master-field">
                <label>Nombre del Canal / Creador</label>
                <input type="text" id="mm-name-${i}" value="${this._escVal(m.name)}" placeholder="Ej: Team APS">
            </div>
            <div class="meta-master-field">
                <label>Título / Descripción corta</label>
                <input type="text" id="mm-title-${i}" value="${this._escVal(m.title)}" placeholder="Ej: El mejor canal de meta TCG">
            </div>
            <div class="meta-master-field">
                <label>URL del Video (YouTube)</label>
                <input type="url" id="mm-video-${i}" value="${this._escVal(m.videoUrl)}" placeholder="https://www.youtube.com/watch?v=...">
            </div>
            <div class="meta-master-field">
                <label>URL del Canal</label>
                <input type="url" id="mm-channel-${i}" value="${this._escVal(m.channelUrl)}" placeholder="https://www.youtube.com/@...">
            </div>
            <div class="meta-master-field">
                <label>Imagen/Video alternativo si el video no carga</label>
                <input type="url" id="mm-fallback-${i}" value="${this._escVal(m.fallbackUrl)}" placeholder="https://... o usa el botón para elegir archivo">
                <div style="display:flex;align-items:center;gap:8px;margin-top:5px;">
                    <button class="meta-master-file-btn" onclick="Config._pickFallbackFile(${i})">📁 Elegir archivo local</button>
                    ${m.fallbackUrl && m.fallbackUrl.startsWith('data:')
                        ? `<span style="font-size:0.72rem;color:rgba(255,215,0,0.6);">✔ Archivo local cargado</span>`
                        : ''}
                </div>
                <input type="file" id="mm-fallback-file-${i}" accept="image/*,video/mp4"
                    style="display:none;" onchange="Config._onFallbackFileChange(${i}, this)">
            </div>     
            <div class="meta-master-field">
                <label>Formato Especializado</label>
                <div class="meta-formats-check-grid">${checkboxes}</div>
            </div>
        </div>
    `;
},
_pickFallbackFile: function (i) {
    document.getElementById(`mm-fallback-file-${i}`)?.click();
},

_onFallbackFileChange: function (i, input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
        alert('El archivo es demasiado grande (máx. 1.5 MB). Usa una URL externa para archivos más pesados.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const urlInput = document.getElementById(`mm-fallback-${i}`);
        if (urlInput) {
            urlInput.value = e.target.result;
            urlInput.dispatchEvent(new Event('input'));
        }
        // Feedback visual
        const btn = input.previousElementSibling?.querySelector('.meta-master-file-btn');
        if (btn) btn.textContent = `✔ ${file.name}`;
    };
    reader.readAsDataURL(file);
},
addMetaMaster: function () {
    const list = document.getElementById('config-meta-masters-list');
    if (!list) return;
    const currentCount = list.querySelectorAll('.meta-master-item').length;
    const emptyMaster  = { id: 'mm_' + Date.now(), name: '', title: '', videoUrl: '', channelUrl: '', formats: [], fallbackUrl: '' };
    list.insertAdjacentHTML('beforeend', this._renderMetaMasterItem(emptyMaster, currentCount));
},

removeMetaMaster: function (index) {
    const item = document.getElementById(`meta-master-item-${index}`);
    if (!item) return;
    item.remove();
    // Re-indexar los items restantes en el DOM
    const list  = document.getElementById('config-meta-masters-list');
    if (!list) return;
    const items = list.querySelectorAll('.meta-master-item');
    items.forEach((el, i) => {
        el.id = `meta-master-item-${i}`;
        const idx = el.querySelector('.meta-master-index');
        if (idx) idx.textContent = `#${i + 1}`;
    });
},
saveMetaMasters: function () {
    const list = document.getElementById('config-meta-masters-list');
    if (!list || !window.ConfigManager) return;
    const items   = list.querySelectorAll('.meta-master-item');
    const masters = [];
    items.forEach((item, i) => {
        const fmtChecks = item.querySelectorAll(`.mm-fmt-${i}:checked`);
        const formats   = Array.from(fmtChecks).map(cb => cb.value);
        masters.push({
            id:         'mm_' + i,
            name:       (document.getElementById(`mm-name-${i}`)?.value    || '').trim(),
            title:      (document.getElementById(`mm-title-${i}`)?.value   || '').trim(),
            videoUrl:   (document.getElementById(`mm-video-${i}`)?.value   || '').trim(),
            channelUrl: (document.getElementById(`mm-channel-${i}`)?.value || '').trim(),
            fallbackUrl: (document.getElementById(`mm-fallback-${i}`)?.value || '').trim(),
            formats
        });
    });
    ConfigManager.saveMetaMasters(masters);
    alert('Maestros guardados. Los cambios se verán la próxima vez que abras la pestaña Meta.');
},

_reRenderMetaMasters: function (masters) {
    const list = document.getElementById('config-meta-masters-list');
    if (!list) return;
    list.innerHTML = masters.map((m, i) => this._renderMetaMasterItem(m, i)).join('');
},

// ===============================
renderMetaLinksSection: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Define los enlaces que se mostrarán en la pestaña Meta como frames de navegación.
        </p>
        <div class="meta-links-list" id="config-meta-links-list">
            ${links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('')}
        </div>
        <button class="meta-links-add-btn" onclick="Config.addMetaLink()">+ Agregar fuente</button>
        <br>
        <button class="meta-links-save-btn" onclick="Config.saveMetaLinks()">💾 Guardar fuentes</button>
    `;
},

_renderMetaLinkItem: function (lk, i) {
    return `
        <div class="meta-link-item" id="meta-link-item-${i}">
            <div class="meta-link-item-header">
                <span class="meta-link-index">#${i + 1}</span>
                <button class="meta-link-del-btn" onclick="Config.removeMetaLink(${i})">✕ Eliminar</button>
            </div>
            <div class="meta-link-field">
                <label>Título</label>
                <input type="text" id="ml-title-${i}" value="${this._escVal(lk.title)}" placeholder="Ej: Master Duel Meta – Tier List">
            </div>
            <div class="meta-link-field">
                <label>URL</label>
                <input type="url" id="ml-url-${i}" value="${this._escVal(lk.url)}" placeholder="https://...">
            </div>
            <div class="meta-link-field">
                <label>Descripción</label>
                <textarea id="ml-desc-${i}" placeholder="Descripción breve...">${this._escVal(lk.desc)}</textarea>
            </div>
        </div>
    `;
},

_escVal: function (str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
},

addMetaLink: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.push({ id: 'ml_' + Date.now(), title: '', url: '', desc: '' });
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

removeMetaLink: function (index) {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.splice(index, 1);
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

saveMetaLinks: function () {
    const list = document.getElementById('config-meta-links-list');
    if (!list || !window.ConfigManager) return;
    const links = [];
    list.querySelectorAll('.meta-link-item').forEach((item, i) => {
        links.push({
            id:    'ml_' + i,
            title: (document.getElementById(`ml-title-${i}`)?.value || '').trim(),
            url:   (document.getElementById(`ml-url-${i}`)?.value   || '').trim(),
            desc:  (document.getElementById(`ml-desc-${i}`)?.value  || '').trim()
        });
    });
    ConfigManager.saveMetaLinks(links);
    alert('Fuentes guardadas. Los cambios se verán la próxima vez que abras la pestaña Meta.');
},

_reRenderMetaLinks: function (links) {
    const list = document.getElementById('config-meta-links-list');
    if (!list) return;
    list.innerHTML = links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('');
},
// ===============================
_FORM_PLATFORMS: ['PC', 'GBC', 'GBA', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'Físico'],

renderFormacionGamesSection: function () {
    const games = window.ConfigManager?.getFormacionGames?.() ?? [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Configura los juegos alternativos de Yu-Gi-Oh! que aparecen en la pestaña Formación.
        </p>
        <div class="form-games-list" id="config-form-games-list">
            ${games.map((g, i) => this._renderFormGameItem(g, i)).join('')}
        </div>
        <button class="form-games-add-btn" onclick="Config.addFormGame()">+ Agregar juego</button>
        <br>
        <button class="form-games-save-btn" onclick="Config.saveFormGames()">💾 Guardar juegos</button>
    `;
},

_renderFormGameItem: function (g, i) {
    const platforms  = Array.isArray(g.platforms) ? g.platforms : [];
    const checkboxes = this._FORM_PLATFORMS.map(p => {
        const checked = platforms.includes(p) ? 'checked' : '';
        return `<label class="form-platform-check-label">
            <input type="checkbox" value="${p}" ${checked} class="fg-plt-${i}"> ${p}
        </label>`;
    }).join('');

    return `
        <div class="form-game-item" id="form-game-item-${i}">
            <div class="form-game-item-header">
                <span class="form-game-index">#${i + 1}</span>
                <button class="form-game-del-btn" onclick="Config.removeFormGame(${i})">✕ Eliminar</button>
            </div>
            <div class="form-game-field">
                <label>Nombre del juego</label>
                <input type="text" id="fg-name-${i}" value="${this._escVal(g.name)}" placeholder="Ej: Yu-Gi-Oh! Forbidden Memories">
            </div>
            <div class="form-game-field">
                <label>Descripción corta</label>
                <input type="text" id="fg-title-${i}" value="${this._escVal(g.title)}" placeholder="Ej: Clásico de PS1">
            </div>
            <div class="form-game-field">
                <label>Link (al hacer click en la tarjeta)</label>
                <input type="url" id="fg-link-${i}" value="${this._escVal(g.link)}" placeholder="https://...">
            </div>
            <div class="form-game-field">
                <label>Imagen de portada (URL o archivo local)</label>
                <input type="url" id="fg-fallback-${i}" value="${this._escVal(g.fallbackUrl)}" placeholder="https://... o usa el botón">
                <div style="display:flex;align-items:center;gap:8px;margin-top:5px;">
                    <button class="form-game-file-btn" onclick="Config._pickFormGameFile(${i})">📁 Elegir archivo local</button>
                    ${g.fallbackUrl?.startsWith('local:') ? `<span style="font-size:0.72rem;color:rgba(255,215,0,0.6);">✔ Archivo local cargado</span>` : ''}
                </div>
                <input type="file" id="fg-fallback-file-${i}" accept="image/*"
                       style="display:none;" onchange="Config._onFormGameFileChange(${i}, this)">
            </div>
            <div class="form-game-field">
                <label>Plataforma</label>
                <div class="form-platforms-check-grid">${checkboxes}</div>
            </div>
        </div>
    `;
},

addFormGame: function () {
    const list = document.getElementById('config-form-games-list');
    if (!list) return;
    const i     = list.querySelectorAll('.form-game-item').length;
    const empty = { id: 'fg_' + Date.now(), name: '', title: '', link: '', fallbackUrl: '', platforms: [] };
    list.insertAdjacentHTML('beforeend', this._renderFormGameItem(empty, i));
},

removeFormGame: function (index) {
    const item = document.getElementById(`form-game-item-${index}`);
    if (!item) return;
    item.remove();
    const list  = document.getElementById('config-form-games-list');
    if (!list) return;
    list.querySelectorAll('.form-game-item').forEach((el, i) => {
        el.id = `form-game-item-${i}`;
        const idx = el.querySelector('.form-game-index');
        if (idx) idx.textContent = `#${i + 1}`;
    });
},

saveFormGames: function () {
    const list = document.getElementById('config-form-games-list');
    if (!list || !window.ConfigManager) return;
    const games = [];
    list.querySelectorAll('.form-game-item').forEach((item, i) => {
        const fmtChecks = item.querySelectorAll(`.fg-plt-${i}:checked`);
        games.push({
            id:          'fg_' + i,
            name:        (document.getElementById(`fg-name-${i}`)?.value     || '').trim(),
            title:       (document.getElementById(`fg-title-${i}`)?.value    || '').trim(),
            link:        (document.getElementById(`fg-link-${i}`)?.value     || '').trim(),
            fallbackUrl: (document.getElementById(`fg-fallback-${i}`)?.value || '').trim(),
            platforms:   Array.from(fmtChecks).map(cb => cb.value)
        });
    });
    ConfigManager.saveFormacionGames(games);
    alert('Juegos guardados. Los cambios se verán la próxima vez que abras la pestaña Formación.');
},

_pickFormGameFile: function (i) {
    document.getElementById(`fg-fallback-file-${i}`)?.click();
},

_onFormGameFileChange: function (i, input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
        alert('Máx. 1.5 MB. Usa una URL externa para archivos más pesados.');
        return;
    }
    const reader  = new FileReader();
    reader.onload = (e) => {
        const gameId = `fg_${i}`;
        const ok     = ConfigManager.saveFormacionFallback(gameId, e.target.result);
        if (!ok) { alert('Almacenamiento lleno. Usa una URL externa.'); return; }
        const urlInput = document.getElementById(`fg-fallback-${i}`);
        if (urlInput) urlInput.value = `local:${gameId}`;
        const btn = document.querySelector(`#form-game-item-${i} .form-game-file-btn`);
        if (btn) btn.textContent = `✔ ${file.name}`;
    };
    reader.readAsDataURL(file);
},
renderFormacionTopicsSection: function () {
    const allTopics = window.Formacion?.TOPICS ?? [{ id: 'que-es-yugioh', label: '¿Qué es Yu-Gi-Oh!?' }];
    const cfg       = window.ConfigManager?.getFormacionTopicsConfig?.() ?? {};
    const mastered  = JSON.parse(localStorage.getItem('yugioh_formacion_mastered') || '[]');

    const rows = allTopics.map(t => {
        const topicCfg     = cfg[t.id] || {};
        const isActive     = topicCfg.active !== false;
        const hideOnMaster = topicCfg.hideOnMaster !== false;
        const isMastered   = mastered.includes(t.id);
        return `
            <div style="display:flex;align-items:center;justify-content:space-between;
                        padding:10px 12px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,215,0,0.1);
                        border-radius:8px;gap:12px;flex-wrap:wrap;">
                <div>
                    <span style="font-size:0.88rem;color:#f1f1f1;font-weight:600;">${t.label}</span>
                    ${isMastered ? '<span style="font-size:0.72rem;color:#2ecc71;margin-left:8px;">✅ Dominado</span>' : ''}
                </div>
                <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
                    <label style="font-size:0.78rem;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" ${isActive ? 'checked' : ''}
                               onchange="Config._saveTopicCfg('${t.id}','active',this.checked)"
                               style="accent-color:#FFD700;">
                        Activo (visible)
                    </label>
                    <label style="font-size:0.78rem;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" ${hideOnMaster ? 'checked' : ''}
                               onchange="Config._saveTopicCfg('${t.id}','hideOnMaster',this.checked)"
                               style="accent-color:#FFD700;">
                        Ocultar al dominar
                    </label>
                    ${isMastered ? `
                        <button onclick="Config._resetTopicMastered('${t.id}')"
                                style="background:rgba(214,48,49,0.15);border:1px solid rgba(214,48,49,0.3);
                                       color:#ff7675;border-radius:5px;padding:3px 9px;font-size:0.72rem;cursor:pointer;">
                            Restablecer
                        </button>` : ''}
                </div>
            </div>
        `;
    }).join('');

    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Activa/desactiva temas y controla si se ocultan al ser dominados.
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
    `;
},

_saveTopicCfg: function (topicId, key, value) {
    if (!window.ConfigManager) return;
    const cfg         = ConfigManager.getFormacionTopicsConfig();
    if (!cfg[topicId]) cfg[topicId] = {};
    cfg[topicId][key] = value;
    ConfigManager.saveFormacionTopicsConfig(cfg);
},

_resetTopicMastered: function (topicId) {
    const mastered = JSON.parse(localStorage.getItem('yugioh_formacion_mastered') || '[]')
        .filter(id => id !== topicId);
    localStorage.setItem('yugioh_formacion_mastered', JSON.stringify(mastered));
    this.render();
    this._restoreAndScroll('formacion-topics-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('formacion-topics-section');
        if (sec) sec.style.display = 'block';
    });
},
};

window.Config = Config;
document.addEventListener('DOMContentLoaded', () => Config.init());



// ── Welcome — panel overlay de bienvenida con selección de perfil; MusicPlayer para música de fondo ──

const Welcome = {

    audio: null,
    shown: false,
    dismissed: false,
init: function () {
    if (localStorage.getItem('dd_welcome_dismissed') === 'true') return;
    if (this.dismissed) return;
    this.createPanel();
},
    createPanel: function () {
        const overlay = document.createElement('div');
        overlay.id = 'welcome-overlay';
        overlay.innerHTML = `
            <div class="welcome-panel">

                <div class="welcome-logo-wrap">
                    <img src="img/LOGO - Destiny Draw Yugioh APP.png"
                         alt="Destiny Draw"
                         class="welcome-logo"
                         onerror="this.style.display='none'; document.getElementById('welcome-title-fallback').style.display='block';">
                    <h1 id="welcome-title-fallback" class="welcome-title-fallback" style="display:none;">
                        ✦ Destiny Draw ✦
                    </h1>
                </div>

                <p class="welcome-subtitle">Tu compañero estratégico para Yu-Gi-Oh!</p>
                <p class="welcome-desc">
                    Busca cartas, construye tu deck, analiza el meta y lleva tu juego al siguiente nivel.
                    ¿Cómo describes tu experiencia?
                </p>

                <div class="welcome-buttons">

                    <button class="welcome-btn welcome-btn-novato"
                        onclick="Welcome.enter('formacion', 'novato')"
                    <span class="wb-icon">🌱</span>
                    <span class="wb-label">Novato</span>
                    <span class="wb-desc">Aprende las bases del juego y la app</span>
                </button>

                <button class="welcome-btn welcome-btn-casual"
                        onclick="Welcome.enter('mideck', 'casual')"
                    <span class="wb-icon">🃏</span>
                    <span class="wb-label">Casual</span>
                    <span class="wb-desc">Construye decks y juega por diversión</span>
                </button>

                <button class="welcome-btn welcome-btn-competitivo"
                        onclick="Welcome.enter('buscador', 'competitivo')"
                    <span class="wb-icon">⚔️</span>
                    <span class="wb-label">Competitivo</span>
                    <span class="wb-desc">Analiza el meta y optimiza tu estrategia</span>
                </button>

                </div>

               <button class="welcome-skip" onclick="Welcome.enter('buscador', 'default')">
                    Entrar sin seleccionar
                </button>

                <div class="welcome-music-ctrl">
                    <button onclick="Welcome.toggleMusic()" id="welcome-music-btn" title="Silenciar/Activar música">
                        🔊
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add('welcome-visible');
            });
        });
    },


    toggleMusic: function () {
        const btn = document.getElementById('welcome-music-btn');
        if (!this.audio) return;
        if (this.audio.paused) {
            this.audio.play().catch(() => {});
            if (btn) btn.textContent = '🔊';
        } else {
            this.audio.pause();
            if (btn) btn.textContent = '🔇';
        }
    },
enter: function (tabName, levelKey) {
    if (window.ContentManager && levelKey) ContentManager.applyProfile(levelKey);
    if (window.ConfigManager  && levelKey) ConfigManager.savePlayerLevel(levelKey);
    if (window.MusicPlayer) {
        const cfg   = window.ConfigManager ? ConfigManager.getMusicConfig() : {};
        const path  = cfg.tracks?.[levelKey] || 'ots/Climax Theme 2.mp3';
        MusicPlayer.setTrack(path);
    }
    this.dismiss();
    if (window.ContentManager) ContentManager.applyProfile(levelKey);
    if (window.Navigation) Navigation.showTab(tabName);
},


startMusic: function (path) {
    if (this.audio && !this.audio.paused && this.audio._path === path) return;
    if (this.audio) {
        this.audio.stop();
        this.audio.currentTime = 0;
    }
    try {
        this.audio = new Audio(path);
        this.audio._path = path;
        this.audio.loop   = true;
        this.audio.volume = 0.40;
        this.audio.play().catch(() => {});
    } catch (_) {}
},

stopMusic: function () {
    if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio = null;
    }
},

dismiss: function () {
    localStorage.setItem('dd_welcome_dismissed', 'true');
    Welcome.dismissed = true;
    // NO se llama stopMusic — la música sigue sonando

    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;

    overlay.classList.remove('welcome-visible');
    overlay.classList.add('welcome-hiding');

    setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 500);
},
};
const MusicPlayer = {
    audio:       null,
    currentPath: null,

    init: function () {
        const cfg = window.ConfigManager ? ConfigManager.getMusicConfig() : { enabled: true, volume: 0.40, tracks: {} };
        const level = window.ConfigManager ? ConfigManager.getPlayerLevel() : 'default';
        this.currentPath = cfg.tracks?.[level] || cfg.tracks?.default || 'ots/Climax Theme 2.mp3';
        this._buildAudio(this.currentPath, cfg.volume ?? 0.40);
        if (cfg.enabled !== false) this._createButton();
    },

    setTrack: function (path) {
        const cfg      = window.ConfigManager ? ConfigManager.getMusicConfig() : {};
        if (cfg.enabled === false) return;
        const playing  = this.audio && !this.audio.paused;
        this.currentPath = path;
        this._buildAudio(path, cfg.volume ?? 0.40);
        if (playing) this.audio.play().catch(() => {});
        this._updateButton();
    },

    _buildAudio: function (path, volume) {
        if (this.audio) { this.audio.pause(); this.audio = null; }
        try {
            this.audio        = new Audio(path);
            this.audio.loop   = true;
            this.audio.volume = Math.min(1, Math.max(0, volume ?? 0.40));
        } catch (_) {}
    },

    toggle: function () {
        const cfg = window.ConfigManager ? ConfigManager.getMusicConfig() : {};
        if (cfg.enabled === false || !this.audio) return;
        if (this.audio.paused) {
            this.audio.play().catch(() => {});
        } else {
            this.audio.pause();
        }
        this._updateButton();
    },

    setVolume: function (vol) {
        if (this.audio) this.audio.volume = Math.min(1, Math.max(0, parseFloat(vol)));
    },

    setEnabled: function (enabled) {
        if (!enabled && this.audio) this.audio.pause();
        const btn = document.getElementById('music-float-btn');
        if (btn) btn.style.display = enabled ? '' : 'none';
        this._updateButton();
    },

    _createButton: function () {
        if (document.getElementById('music-float-btn')) return;
        const btn     = document.createElement('button');
        btn.id        = 'music-float-btn';
        btn.className = 'music-float-btn';
        btn.onclick = function () { MusicPlayer.toggle(); };
        document.body.appendChild(btn);
        this._updateButton();
    },

    _updateButton: function () {
        const btn = document.getElementById('music-float-btn');
        if (!btn) return;
        const playing   = this.audio && !this.audio.paused;
        btn.textContent = playing ? '⏸' : '▶';
        btn.title       = playing ? 'Pausar música' : 'Reproducir música';
    }
};

window.MusicPlayer = MusicPlayer;
document.addEventListener('DOMContentLoaded', () => MusicPlayer.init());

window.Welcome = Welcome;
document.addEventListener('DOMContentLoaded', () => Welcome.init());



// ── HelpPanel — botón flotante ? con panel de ayuda contextual por pestaña y FAQ ──

const HelpPanel = {
    activeTab: 'help',
    isOpen: false,

    // Contenido de ayuda por pestaña activa
    tabContent: {
        buscador: `
            <h4>🔍 Buscador de Cartas</h4>
            <p>Aquí puedes buscar cualquier carta de Yu-Gi-Oh! por nombre. Al encontrarla, puedes ver su efecto completo, sus estadísticas y agregarla directamente a tu deck activo.</p>
            <ul>
                <li>Escribe el nombre (o parte de él) y presiona Enter o el botón Buscar.</li>
                <li>Toca la imagen de la carta para abrir su vista detallada.</li>
                <li>Desde la vista detallada puedes agregarla al Main Deck, Extra Deck o Side Deck.</li>
                <li>El sistema resalta automáticamente las palabras clave según la nomenclatura que configures.</li>
            </ul>`,

        mideck: `
            <h4>🃏 Mi Deck</h4>
            <p>Este es tu espacio de construcción. Aquí ves todas las cartas de tu deck activo organizadas por sección.</p>
            <ul>
                <li><strong>Composición:</strong> el bloque superior muestra un resumen de tipos, atributos, niveles y más de tu deck actual.</li>
                <li><strong>Roles:</strong> asigna roles a cada carta (Starter, Negadora, Boss, etc.) para que el Internal Score los tome en cuenta.</li>
                <li><strong>Carta As:</strong> puedes marcar una carta como insignia de tu deck — será la imagen que representa al deck guardado.</li>
                <li><strong>Acciones:</strong> guarda, limpia, exporta o importa tu deck en formato .ydk compatible con otras plataformas.</li>
            </ul>`,

        estadisticas: `
            <h4>📊 Estadísticas</h4>
            <p>El centro de análisis de la app. Cada sección te da una perspectiva distinta sobre tu deck y el meta:</p>
            <ul>
                <li><strong>Análisis del Deck vs Meta:</strong> comparativa entre el poder teórico de tu deck y qué tan bien sobrevive frente al meta seleccionado. Incluye las mecánicas detectadas, cartas amenaza y decks que más te contrarrestan.</li>
                <li><strong>Internal Score:</strong> mide la calidad técnica de tu deck en tres pilares — Consistencia, Potencia y Resiliencia — basado en los roles asignados.</li>
                <li><strong>Counter-Deck Score:</strong> indica qué tan capaz es tu deck de interrumpir las estrategias del meta. A mayor puntaje, más disruptivo es tu deck contra el formato.</li>
                <li><strong>Gestión de Carpetas:</strong> aquí importas los decks del meta en formato .ydk, organizados por fecha de formato.</li>
                <li><strong>Decks del Meta:</strong> visualiza todos los decks importados. Usa los chips de carpeta para filtrar por uno o varios formatos a la vez.</li>
                <li><strong>Recurrencia de Cartas:</strong> muestra qué cartas aparecen más veces en el meta y con qué frecuencia promedio por deck.</li>
                <li><strong>Poder de Cartas del Meta:</strong> calcula un puntaje de poder para cada carta del meta basado en su presencia, mecánicas y capacidad de counter.</li>
                <li><strong>Counter-Cards del Meta:</strong> lista las cartas del meta que tienen función de interrupción activa contra mecánicas específicas.</li>
                <li><strong>Exportar:</strong> descarga reportes de tu deck o rankings del meta en .txt y .csv.</li>
            </ul>`,

        config: `
            <h4>⚙️ Configuración</h4>
            <p>Aquí personalizas cómo la app analiza las cartas y los decks. Lo que configures aquí afecta directamente a los scores y al resaltado del Buscador.</p>
            <ul>
                <li><strong>Roles:</strong> define los roles que puedes asignar a las cartas (Starter, Boss, etc.), sus keywords de detección, y el peso de valor (1.0 = rol genérico de máximo aporte · 0.1 = rol arquetípico de menor aporte general).</li>
                <li><strong>Especialidades y Counters:</strong> configura pares de mecánicas de juego y sus contrapartes. Esto activa el sistema de Power Score y External Score.</li>
                <li><strong>Staples del Formato:</strong> agrega cartas que consideras esenciales en el formato actual. El sistema las sugerirá si no las tienes en tu deck.</li>
                <li><strong>Nomenclatura:</strong> define categorías de texto para que el Buscador resalte partes del efecto de las cartas por color.</li>
            </ul>`,

        default: `
            <h4>❓ Ayuda</h4>
            <p>Esta pestaña es para ayudarte a ser mejor jugador de Yu-Gi-Oh!.</p>
            <p>Navega entre las pestañas de la app y vuelve a abrir este panel para ver la ayuda específica de cada sección.</p>`
    },

    faqContent: [
        {
            q: '¿Para qué es esta app?',
            a: 'Es una app que ayuda a los jugadores del juego de cartas Yu-Gi-Oh! — ya sean nuevos, casuales, competitivos, profesionales, incluso curiosos — a tomar el juego en sus propias manos y analizar con números sus decisiones a la hora de buscar cartas, construir decks, analizar el META, practicar sus estrategias, aprender mejor rulings básicos, intermedios y avanzados, crear su propia versión del metagame y hasta importar o exportar sus propios decks para abrirlos en otras plataformas o compartirlos con amigos.'
        },
        {
            q: '¿Qué es el Internal Score?',
            a: 'Es una puntuación de 0 a 10 que mide la calidad técnica de tu deck basándose en los roles que le asignas a cada carta. Evalúa tres pilares con el mismo peso: Consistencia (qué tan bien arrancas), Potencia (qué tan bien cierras) y Resiliencia (qué tan bien aguantas). No mide si el deck gana torneos — mide qué tan bien construido está a nivel de diseño.'
        },
        {
            q: '¿Qué es el External Score?',
            a: 'Mide qué tan bien sobrevive tu deck frente al meta actualmente cargado. Toma las mecánicas de tu deck y las cruza contra las cartas del meta que las contrarrestan. A más cartas del meta que te amenazan y mayor su presencia, menor será tu External Score. Es relativo al meta que selecciones, no a un valor fijo.'
        },
        {
            q: '¿Qué es el Counter-Deck Score?',
            a: 'Indica qué tan capaz es tu deck de interrumpir las estrategias del meta. Las cartas de tu deck que tienen función de counter acumulan puntos. Las cartas "brick" (sin uso práctico en mano) generan una penalización proporcional porque reducen la probabilidad de ejecutar esas interrupciones.'
        },
        {
            q: '¿Cómo funciona el peso de los roles?',
            a: 'Cada rol tiene un peso de 0.1 a 1.0. Un peso de 1.0 significa que la carta aporta el 100% de su valor al pilar (rol genérico, útil en cualquier situación). Un peso menor significa que aporta menos (rol arquetípico, útil solo en contexto específico). Esto te permite distinguir un buscador genérico de uno que solo busca cartas de tu arquetipo.'
        },
        {
            q: '¿Qué son las Especialidades y Counters?',
            a: 'Son pares de mecánicas configurables. Una Especialidad es un patrón de juego que un deck ejecuta (por ejemplo: "búsqueda de deck"). Un Counter es lo que lo interrumpe (por ejemplo: "niega la búsqueda"). Configurar estos pares activa el Power Score del meta y el External Score de tu deck.'
        }
    ],

    init: function () {
        this.createButton();
        this.createPanel();
    },

    createButton: function () {
        if (document.getElementById('help-float-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'help-float-btn';
        btn.className = 'help-float-btn';
        btn.innerHTML = '?';
        btn.title = 'Ayuda';
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
    },

    createPanel: function () {
        if (document.getElementById('help-panel-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'help-panel-overlay';
        overlay.className = 'help-panel-overlay';
        overlay.innerHTML = `
            <div class="help-panel" id="help-panel">
                <div class="help-panel-header">
                    <div class="help-panel-tabs">
                        <button class="help-tab-btn active" id="htab-help"
                                onclick="HelpPanel.showTab('help')">Ayuda</button>
                        <button class="help-tab-btn" id="htab-faq"
                                onclick="HelpPanel.showTab('faq')">FAQ</button>
                    </div>
                    <button class="help-panel-close" onclick="HelpPanel.close()">×</button>
                </div>
                <div class="help-panel-body" id="help-panel-body"></div>
            </div>`;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });
        document.body.appendChild(overlay);
    },

    getActiveTab: function () {
        if (window.Navigation && Navigation.currentTab) {
            return Navigation.currentTab;
        }
        // Fallback: busca el tab activo por clase
        const active = document.querySelector('.nav-tab.active, .tab-btn.active, [data-tab].active');
        return active?.dataset?.tab || 'default';
    },

    showTab: function (tab) {
        this.activeTab = tab;

        document.querySelectorAll('.help-tab-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`htab-${tab}`);
        if (btn) btn.classList.add('active');

        const body = document.getElementById('help-panel-body');
        if (!body) return;

        if (tab === 'faq') {
            body.innerHTML = this.renderFAQ();
        } else {
            const pageTab = this.getActiveTab();
            const content = this.tabContent[pageTab] || this.tabContent.default;
            body.innerHTML = `<div class="help-content">${content}</div>`;
        }
    },

    renderFAQ: function () {
        const items = this.faqContent.map((item, i) => `
            <div class="faq-item" id="faq-${i}">
                <button class="faq-question" onclick="HelpPanel.toggleFAQ(${i})">
                    <span>${item.q}</span>
                    <span class="faq-arrow" id="faq-arrow-${i}">▶</span>
                </button>
                <div class="faq-answer" id="faq-answer-${i}" style="display:none;">
                    ${item.a}
                </div>
            </div>`).join('');
        return `<div class="faq-list">${items}</div>`;
    },

    toggleFAQ: function (i) {
        const answer = document.getElementById(`faq-answer-${i}`);
        const arrow  = document.getElementById(`faq-arrow-${i}`);
        if (!answer) return;
        const open = answer.style.display !== 'none';
        answer.style.display = open ? 'none' : 'block';
        if (arrow) arrow.textContent = open ? '▶' : '▼';
    },

    open: function () {
        this.isOpen = true;
        const overlay = document.getElementById('help-panel-overlay');
        if (overlay) overlay.classList.add('active');
        this.showTab('help');
    },

    close: function () {
        this.isOpen = false;
        const overlay = document.getElementById('help-panel-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    toggle: function () {
        this.isOpen ? this.close() : this.open();
    }
};
console.log('ESTADO: Actualizacion de lo que se esta haciendo')
window.HelpPanel = HelpPanel;
document.addEventListener('DOMContentLoaded', () => HelpPanel.init());