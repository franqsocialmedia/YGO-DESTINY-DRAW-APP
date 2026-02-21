/* ====================================
   DUELO EN VIVO MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Cronómetros y Life Points para duelos
   Sin persistencia en localStorage
   ==================================== */

const DueloEnVivo = {

    // ─── ESTADO (sin localStorage) ────────────────────────────
    subTab: 'estandar',
    _container: null,

    // Cronómetro Estándar (pestaña independiente)
    std: {
        defaultMins: 50,
        remaining:   50 * 60,
        running:     false,
        _interval:   null
    },

    // Estado Master Duel (todo en memoria)
    md: {
        std: {
            defaultMins: 50,
            remaining:   50 * 60,
            running:     false,
            _interval:   null
        },
        timerA: { remaining: 300, running: false, _interval: null },
        timerB: { remaining: 300, running: false, _interval: null },
        defaultPlayerSecs: 300,
        currentTurn:    'A',
        turnNumber:     1,
        activeInteract: null,   // 'A' | 'B' | null
        lpA: 8000,
        lpB: 8000,
        winsA: 0,
        winsB: 0
    },
// ─── ESTADO HERRAMIENTAS ──────────────────────────────────
herr: {
    coinSide: null,
    diceCount: 1,
    rolling: false
},
    // ─── ENTRY POINT ─────────────────────────────────────────
    renderInto: function (container) {
        if (!container) return;
        this._container = container;
        container.innerHTML = this._buildShell();
    },

    _buildShell: function () {
        return `
        <div class="duelo-section">
            <div class="duelo-sub-tabs">
                <button class="duelo-sub-tab ${this.subTab === 'estandar'   ? 'active' : ''}"
                        onclick="DueloEnVivo.showSubTab('estandar')">⏱ Cronómetro Estándar</button>
                <button class="duelo-sub-tab ${this.subTab === 'masterduel' ? 'active' : ''}"
                        onclick="DueloEnVivo.showSubTab('masterduel')">👑 Cronómetro Master Duel</button>
                <button class="duelo-sub-tab ${this.subTab === 'herramientas' ? 'active' : ''}"
        onclick="DueloEnVivo.showSubTab('herramientas')">🎲 Herramientas</button>
            </div>
            
            <div id="duelo-pane-estandar"   style="${this.subTab !== 'estandar'   ? 'display:none' : ''}">
                ${this._buildStdPane()}
            </div>
            <div id="duelo-pane-masterduel" style="${this.subTab !== 'masterduel' ? 'display:none' : ''}">
                ${this._buildMDPane()}
            </div>
            <div id="duelo-pane-herramientas" style="${this.subTab !== 'herramientas' ? 'display:none' : ''}">
    ${this._buildHerrPane()}
            </div>
        </div>`;
    },

    showSubTab: function (tab) {
    this.subTab = tab;
    document.querySelectorAll('.duelo-sub-tab').forEach((b, i) => {
        b.classList.toggle('active',
            (tab === 'estandar'     && b.textContent.includes('Estándar'))  ||
            (tab === 'masterduel'   && b.textContent.includes('Master'))    ||
            (tab === 'herramientas' && b.textContent.includes('Herramientas')));
    });
    const panes = {
        'estandar':     'duelo-pane-estandar',
        'masterduel':   'duelo-pane-masterduel',
        'herramientas': 'duelo-pane-herramientas'
    };
    Object.entries(panes).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = (tab === key) ? '' : 'none';
    });
},

    // ─── HELPERS ─────────────────────────────────────────────
    _fmt: function (secs) {
        const s  = Math.max(0, Math.floor(secs));
        const h  = Math.floor(s / 3600);
        const m  = Math.floor((s % 3600) / 60);
        const ss = s % 60;
        if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
        return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    },

    _setDisplay: function (id, secs) {
        const el = document.getElementById(id);
        if (el) el.textContent = this._fmt(secs);
    },

    _flashAlert: function (msg, duration) {
        const el = document.createElement('div');
        el.className = 'duelo-alert-flash';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), duration || 3500);
    },

    // ═══════════════════════════════════════════════════════
    // CRONÓMETRO ESTÁNDAR (pestaña independiente)
    // ═══════════════════════════════════════════════════════
    _buildStdPane: function () {
        return `
        <div class="duelo-std-panel">
            <div class="duelo-std-display" id="std-main-display">${this._fmt(this.std.remaining)}</div>
            <div class="duelo-std-config-row">
                <label class="duelo-label">Minutos:</label>
                <input type="number" id="std-mins-main" class="duelo-time-input"
                       value="${this.std.defaultMins}" min="1" max="999">
                <button class="btn btn-primary duelo-duel-btn"
                        onclick="DueloEnVivo.stdStart('main')">⚔️ Duelo!</button>
                <button class="btn btn-secondary duelo-ctrl-btn"
                        onclick="DueloEnVivo.stdStop('main')">⏹ Detener</button>
                <button class="btn btn-secondary duelo-ctrl-btn"
                        onclick="DueloEnVivo.stdReset('main')">↺ Resetear</button>
            </div>

            <div class="duelo-lp-section" style="margin-top:14px">
            <div class="duelo-lp-block">
                <div class="duelo-lp-name">Jugador A</div>
                <div class="duelo-lp-val" id="std-lp-a">8,000</div>
                <div class="duelo-lp-ops">
                    <button class="duelo-op-btn duelo-op-gain"   onclick="DueloEnVivo.openLPStd('A','gain')">Gain</button>
                    <button class="duelo-op-btn duelo-op-damage" onclick="DueloEnVivo.openLPStd('A','damage')">Damage</button>
                </div>
            </div>
            <div class="duelo-lp-vs">VS</div>
            <div class="duelo-lp-block">
                <div class="duelo-lp-name">Jugador B</div>
                <div class="duelo-lp-val" id="std-lp-b">8,000</div>
                <div class="duelo-lp-ops">
                    <button class="duelo-op-btn duelo-op-gain"   onclick="DueloEnVivo.openLPStd('B','gain')">Gain</button>
                    <button class="duelo-op-btn duelo-op-damage" onclick="DueloEnVivo.openLPStd('B','damage')">Damage</button>
                </div>
            </div>
        </div>
        <div class="duelo-lp-reset-row">
            <button class="btn btn-secondary duelo-ctrl-btn"
                    onclick="DueloEnVivo.resetLPStd()">↺ Resetear LPs (8000)</button>
        </div>
        </div>`;
    },

    // ─── CRONÓMETRO ESTÁNDAR (lógica compartida main/md) ─────
    stdStart: function (scope) {
        const state   = scope === 'md' ? this.md.std : this.std;
        const inputId = scope === 'md' ? 'std-mins-md'    : 'std-mins-main';
        const dispId  = scope === 'md' ? 'std-md-display'  : 'std-main-display';
        if (state.running) return;

        const inp = document.getElementById(inputId);
        if (inp) {
            const m = Math.max(1, parseInt(inp.value) || state.defaultMins);
            state.defaultMins = m;
            if (state.remaining <= 0) state.remaining = m * 60;
        }

        state.running   = true;
        state._interval = setInterval(() => {
            if (state.remaining <= 0) {
                clearInterval(state._interval);
                state.running = false;
                this._setDisplay(dispId, 0);
                this._flashAlert('⏰ ¡Tiempo de ronda agotado!');
                return;
            }
            state.remaining--;
            this._setDisplay(dispId, state.remaining);
        }, 1000);

        // Si es MD, también reanudar el timer del jugador activo
        if (scope === 'md' && this.md.activeInteract) {
            this._startPlayerTimer(this.md.activeInteract);
        }
    },

    stdStop: function (scope) {
        const state = scope === 'md' ? this.md.std : this.std;
        clearInterval(state._interval);
        state.running = false;

        // Si es MD, también pausar el timer del jugador activo
        if (scope === 'md' && this.md.activeInteract) {
            this._stopPlayerTimer(this.md.activeInteract);
        }
    },

    stdReset: function (scope) {
        this.stdStop(scope);
        const state   = scope === 'md' ? this.md.std : this.std;
        const inputId = scope === 'md' ? 'std-mins-md'    : 'std-mins-main';
        const dispId  = scope === 'md' ? 'std-md-display'  : 'std-main-display';
        const inp = document.getElementById(inputId);
        const m = inp ? Math.max(1, parseInt(inp.value) || state.defaultMins) : state.defaultMins;
        state.remaining = m * 60;
        this._setDisplay(dispId, state.remaining);
    },

    // ═══════════════════════════════════════════════════════
    // MASTER DUEL PANE
    // ═══════════════════════════════════════════════════════
    _buildMDPane: function () {
        const md      = this.md;
        const turnCol = md.currentTurn === 'A' ? '#1a6bbd' : '#bd1a1a';

        return `
        <div class="duelo-md-wrap">

            <!-- Fila superior: Cronómetro Estándar + Marcador -->
            <div class="duelo-md-std-row">
                <div class="duelo-md-std-main">
                    <div class="duelo-md-clock-score-row">
                        <div class="duelo-std-display duelo-std-display-md" id="std-md-display">${this._fmt(md.std.remaining)}</div>
                        <div class="duelo-md-scoreboard">
                            <span class="md-score-label">B</span>
                            <span class="md-score-val" id="md-score-b">${md.winsB}</span>
                            <span class="md-score-dash">–</span>
                            <span class="md-score-val" id="md-score-a">${md.winsA}</span>
                            <span class="md-score-label">A</span>
                        </div>
                    </div>
                    <!-- Controles del cronómetro estándar MD -->
                    <div class="duelo-std-config-row duelo-std-config-row-sm">
                        <label class="duelo-label">Mins:</label>
                        <input type="number" id="std-mins-md" class="duelo-time-input duelo-time-input-sm"
                               value="${md.std.defaultMins}" min="1" max="999">
                        <button class="btn btn-primary duelo-duel-btn duelo-duel-btn-sm"
                                onclick="DueloEnVivo.stdStart('md')">⚔️ Duelo!</button>
                        <button class="btn btn-secondary duelo-ctrl-btn-sm"
                                onclick="DueloEnVivo.stdStop('md')">⏹ Detener</button>
                        <button class="btn btn-secondary duelo-ctrl-btn-sm"
                                onclick="DueloEnVivo.stdReset('md')">↺ Resetear</button>
                    </div>
                    <!-- Config de segundos de jugadores (compartida) -->
                    <div class="duelo-player-secs-row">
                        <label class="duelo-label">Segs. por jugador:</label>
                        <input type="number" id="ptimer-player-secs" class="duelo-time-input duelo-time-input-sm"
                               value="${md.defaultPlayerSecs}" min="10" max="9999">
                        <button class="btn btn-secondary duelo-ctrl-btn-sm"
                                onclick="DueloEnVivo.resetPlayerTimers()">↺ Resetear contadores</button>
                    </div>
                </div>
            </div>

            <!-- Fila de jugadores: timers rotados + centro -->
            <div class="duelo-md-players-row">

                <!-- Jugador A (izquierda, rotado 90°) -->
                <div class="duelo-md-player-col">
                    <div class="duelo-md-player-rotated">
                        <div class="duelo-timer-player" id="md-timer-a">${this._fmt(md.timerA.remaining)}</div>
                        <div class="duelo-player-tag">Jugador A</div>
                    </div>
                </div>

                <!-- Centro: turno + rendirse + cambiar turno -->
                <div class="duelo-md-center-col">
                    <div class="duelo-turn-row">
                        <button class="btn duelo-surrender-btn"
                                onclick="DueloEnVivo.surrender('A')" title="Jugador A se rinde">🏳 A</button>
                        <div class="duelo-turn-block">
                            <div class="duelo-turn-indicator" id="duelo-turn-ind"
                                 style="background:${turnCol}">Turno: Jugador ${md.currentTurn}</div>
                            <div class="duelo-turn-count" id="duelo-turn-count">Turno ${md.turnNumber}</div>
                        </div>
                        <button class="btn duelo-surrender-btn"
                                onclick="DueloEnVivo.surrender('B')" title="Jugador B se rinde">🏳 B</button>
                    </div>
                    <button class="btn btn-primary duelo-change-turn-btn"
                            onclick="DueloEnVivo.nextTurn()">⇄ Cambiar Turno</button>
                </div>

                <!-- Jugador B (derecha, rotado -90°) -->
                <div class="duelo-md-player-col">
                    <div class="duelo-md-player-rotated duelo-md-player-rotated-b">
                        <div class="duelo-timer-player" id="md-timer-b">${this._fmt(md.timerB.remaining)}</div>
                        <div class="duelo-player-tag">Jugador B</div>
                    </div>
                </div>
            </div>

            <!-- Fila de interacción (chess clock) -->
            <div class="duelo-md-interact-row">
                <button class="duelo-interact-btn ${md.activeInteract === 'A' ? 'duelo-interact-active' : ''}"
                        id="duelo-ibtn-a"
                        onclick="DueloEnVivo.setInteraction('A')">
                    <br><span>¿Algo ahí?</span>
                </button>
                <div class="duelo-interact-spacer"></div>
                <button class="duelo-interact-btn ${md.activeInteract === 'B' ? 'duelo-interact-active' : ''}"
                        id="duelo-ibtn-b"
                        onclick="DueloEnVivo.setInteraction('B')">
                    <br><span>¿Algo ahí?</span>
                </button>
            </div>

            <!-- Life Points -->
            <div class="duelo-lp-section">
                <div class="duelo-lp-block">
                    <div class="duelo-lp-name">Jugador A</div>
                    <div class="duelo-lp-val" id="lp-a">${md.lpA.toLocaleString()}</div>
                    <div class="duelo-lp-ops">
                        <button class="duelo-op-btn duelo-op-gain"   onclick="DueloEnVivo.openLP('A','gain')">Gain</button>
                        <button class="duelo-op-btn duelo-op-damage" onclick="DueloEnVivo.openLP('A','damage')">Damage</button>
                    </div>
                </div>
                <div class="duelo-lp-vs">VS</div>
                <div class="duelo-lp-block">
                    <div class="duelo-lp-name">Jugador B</div>
                    <div class="duelo-lp-val" id="lp-b">${md.lpB.toLocaleString()}</div>
                    <div class="duelo-lp-ops">
                        <button class="duelo-op-btn duelo-op-gain"   onclick="DueloEnVivo.openLP('B','gain')">Gain</button>
                        <button class="duelo-op-btn duelo-op-damage" onclick="DueloEnVivo.openLP('B','damage')">Damage</button>
                    </div>
                </div>
            </div>

            <div class="duelo-lp-reset-row">
                <button class="btn btn-secondary duelo-ctrl-btn"
                        onclick="DueloEnVivo.resetLP()">↺ Resetear LPs (8000)</button>
            </div>

        </div>`;
    },

    // ─── PLAYER TIMERS (controlados por botones de interacción) ──
    _startPlayerTimer: function (p) {
        const state  = p === 'A' ? this.md.timerA : this.md.timerB;
        const dispId = p === 'A' ? 'md-timer-a'   : 'md-timer-b';
        if (state.running) return;
        state.running   = true;
        state._interval = setInterval(() => {
            if (state.remaining <= 0) {
                clearInterval(state._interval);
                state.running   = false;
                state.remaining = 0;
                this._setDisplay(dispId, 0);
                this._declareWinner(p === 'A' ? 'B' : 'A', 'tiempo');
                return;
            }
            state.remaining--;
            this._setDisplay(dispId, state.remaining);
        }, 1000);
    },

    _stopPlayerTimer: function (p) {
        const state = p === 'A' ? this.md.timerA : this.md.timerB;
        clearInterval(state._interval);
        state.running = false;
    },

    resetPlayerTimers: function () {
        this._stopPlayerTimer('A');
        this._stopPlayerTimer('B');
        this.md.activeInteract = null;
        this._updateInteractButtons();
        const inp = document.getElementById('ptimer-player-secs');
        const s   = inp ? Math.max(10, parseInt(inp.value) || this.md.defaultPlayerSecs) : this.md.defaultPlayerSecs;
        this.md.defaultPlayerSecs = s;
        this.md.timerA.remaining  = s;
        this.md.timerB.remaining  = s;
        this._setDisplay('md-timer-a', s);
        this._setDisplay('md-timer-b', s);
    },

    // ─── INTERACCIÓN — Chess clock ────────────────────────────
    // Presionar tu botón ACTIVO → pasas al rival (+30s si aplica al turno)
    // Presionar tu botón INACTIVO → tomas el turno de interacción
    setInteraction: function (p) {
        const md    = this.md;
        const other = p === 'A' ? 'B' : 'A';

        if (md.activeInteract === p) {
            // Terminas tu interacción → pasa al rival
            this._stopPlayerTimer(p);
            md.activeInteract = other;
            this._startPlayerTimer(other);
        } else if (md.activeInteract === other) {
            // El rival estaba activo → tomas el turno
            this._stopPlayerTimer(other);
            md.activeInteract = p;
            this._startPlayerTimer(p);
        } else {
            // Nadie activo → te activas
            md.activeInteract = p;
            this._startPlayerTimer(p);
        }
        this._updateInteractButtons();
    },

    _updateInteractButtons: function () {
        const ia   = this.md.activeInteract;
        const btnA = document.getElementById('duelo-ibtn-a');
        const btnB = document.getElementById('duelo-ibtn-b');
        if (btnA) btnA.classList.toggle('duelo-interact-active', ia === 'A');
        if (btnB) btnB.classList.toggle('duelo-interact-active', ia === 'B');
    },

    // ─── TURNO DE JUEGO ──────────────────────────────────────
    // +30s al jugador que acaba de terminar su turno
    nextTurn: function () {
        const md           = this.md;
        const justFinished = md.currentTurn;

        // +30s al jugador cuyo turno termina
        if (justFinished === 'A') {
            md.timerA.remaining += 30;
            this._setDisplay('md-timer-a', md.timerA.remaining);
        } else {
            md.timerB.remaining += 30;
            this._setDisplay('md-timer-b', md.timerB.remaining);
        }

        md.currentTurn = justFinished === 'A' ? 'B' : 'A';
        md.turnNumber++;

        const color   = md.currentTurn === 'A' ? '#1a6bbd' : '#bd1a1a';
        const indEl   = document.getElementById('duelo-turn-ind');
        const countEl = document.getElementById('duelo-turn-count');
        if (indEl)   { indEl.textContent = `Turno: Jugador ${md.currentTurn}`; indEl.style.background = color; }
        if (countEl) countEl.textContent = `Turno ${md.turnNumber}`;
    },

    // ─── RENDIRSE ────────────────────────────────────────────
    surrender: function (loser) {
        this._declareWinner(loser === 'A' ? 'B' : 'A', 'rendición');

    },

    // ─── DECLARAR GANADOR ─────────────────────────────────────
    _declareWinner: function (winner, reason) {
        const md = this.md;
        this._stopPlayerTimer('A');
        this._stopPlayerTimer('B');
        md.activeInteract = null;
        this._updateInteractButtons();

        if (winner === 'A') md.winsA++;
        else                md.winsB++;

        const sA = document.getElementById('md-score-a');
        const sB = document.getElementById('md-score-b');
        if (sA) sA.textContent = md.winsA;
        if (sB) sB.textContent = md.winsB;

        const reasonText = { tiempo: 'por tiempo', 'rendición': 'por rendición', LP: 'por LP' }[reason] || '';
        this._flashAlert(`🏆 ¡Jugador ${winner} gana ${reasonText}!  (B ${md.winsB} – ${md.winsA} A)`, 5000);
        

        // Reiniciar para el próximo duelo
        this.resetPlayerTimers();
        DueloEnVivo.resetLP();
        md.turnNumber = 1;
        document.getElementById('duelo-turn-count').textContent = `Turno ${md.turnNumber}`;
        },

    // ─── LIFE POINTS ─────────────────────────────────────────
    openLP: function (player, type) {
        document.getElementById('duelo-lp-panel')?.remove();
        const presets = [100, 300, 500, 1000, 1500, 2000, 4000, 8000];
        const labels  = { gain: 'Gain ＋', damage: 'Damage －' };

        const panel = document.createElement('div');
        panel.id    = 'duelo-lp-panel';
        panel.className = 'duelo-lp-panel-overlay';
        panel.innerHTML = `
            <div class="duelo-lp-panel-box">
                <button class="duelo-lp-panel-close"
                        onclick="document.getElementById('duelo-lp-panel').remove()">✕</button>
                <div class="duelo-lp-panel-title">${labels[type]} — Jugador ${player}</div>
                <div class="duelo-lp-presets">
                    ${presets.map(v => `
                        <button class="duelo-lp-preset"
                                onclick="document.getElementById('duelo-lp-input').value='${v}'">
                            ${v.toLocaleString()}
                        </button>`).join('')}
                </div>
                <div class="duelo-lp-input-row">
                    <input type="number" id="duelo-lp-input" class="duelo-time-input"
                           placeholder="Ingresa cifra..." min="0" style="flex:1">
                    <button class="btn btn-secondary duelo-ctrl-btn"
                            onclick="document.getElementById('duelo-lp-input').value=''">✕ Borrar</button>
                </div>
                <button class="btn btn-primary duelo-lp-calc-btn"
                        onclick="DueloEnVivo.calcLP('${player}','${type}')">✓ Calcular</button>
            </div>`;

        panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
        document.body.appendChild(panel);
        document.getElementById('duelo-lp-input')?.focus();
    },

    calcLP: function (player, type) {
        const inp = document.getElementById('duelo-lp-input');
        const val = parseInt(inp?.value);
        if (isNaN(val) || val < 0) return;

        const md    = this.md;
        let current = player === 'A' ? md.lpA : md.lpB;

        if (type === 'gain')   current = current + val;
        if (type === 'damage') current = Math.max(0, current - val);

        if (player === 'A') md.lpA = current;
        else                md.lpB = current;

        const el = document.getElementById(player === 'A' ? 'lp-a' : 'lp-b');
        if (el) el.textContent = current.toLocaleString();

        document.getElementById('duelo-lp-panel')?.remove();

        if (current <= 0) {
            this._declareWinner(player === 'A' ? 'B' : 'A', 'LP');
        }
    },

    resetLP: function () {
        this.md.lpA = 8000;
        this.md.lpB = 8000;
        const elA = document.getElementById('lp-a');
        const elB = document.getElementById('lp-b');
        if (elA) elA.textContent = '8,000';
        if (elB) elB.textContent = '8,000';
    },
    // ── LP Cronómetro Estándar ───────────────────────────────
    openLPStd: function (player, type) {
        document.getElementById('duelo-lp-panel')?.remove();
        const presets = [100, 300, 500, 1000, 1500, 2000, 4000, 8000];
        const labels  = { gain: 'Gain ＋', damage: 'Damage －' };
        const panel   = document.createElement('div');
        panel.id      = 'duelo-lp-panel';
        panel.className = 'duelo-lp-panel-overlay';
        panel.innerHTML = `
            <div class="duelo-lp-panel-box">
                <button class="duelo-lp-panel-close"
                        onclick="document.getElementById('duelo-lp-panel').remove()">✕</button>
                <div class="duelo-lp-panel-title">${labels[type]} — Jugador ${player}</div>
                <div class="duelo-lp-presets">
                    ${presets.map(v => `
                        <button class="duelo-lp-preset"
                                onclick="document.getElementById('duelo-lp-input').value='${v}'">
                            ${v.toLocaleString()}
                        </button>`).join('')}
                </div>
                <div class="duelo-lp-input-row">
                    <input type="number" id="duelo-lp-input" class="duelo-time-input"
                        placeholder="Ingresa cifra..." min="0" style="flex:1">
                    <button class="btn btn-secondary duelo-ctrl-btn"
                            onclick="document.getElementById('duelo-lp-input').value=''">✕ Borrar</button>
                </div>
                <button class="btn btn-primary duelo-lp-calc-btn"
                        onclick="DueloEnVivo.calcLPStd('${player}','${type}')">✓ Calcular</button>
            </div>`;
        panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
        document.body.appendChild(panel);
        document.getElementById('duelo-lp-input')?.focus();
    },

    calcLPStd: function (player, type) {
        const val = parseInt(document.getElementById('duelo-lp-input')?.value);
        if (isNaN(val) || val < 0) return;
        let current = player === 'A' ? this.std.lpA : this.std.lpB;
        if (type === 'gain')   current = current + val;
        if (type === 'damage') current = Math.max(0, current - val);
        if (player === 'A') this.std.lpA = current;
        else                this.std.lpB = current;
        const el = document.getElementById(player === 'A' ? 'std-lp-a' : 'std-lp-b');
        if (el) el.textContent = current.toLocaleString();
        document.getElementById('duelo-lp-panel')?.remove();
    },

    resetLPStd: function () {
        this.std.lpA = 8000;
        this.std.lpB = 8000;
        const elA = document.getElementById('std-lp-a');
        const elB = document.getElementById('std-lp-b');
        if (elA) elA.textContent = '8,000';
        if (elB) elB.textContent = '8,000';
    },
    // ═══════════════════════════════════════════════════════
// HERRAMIENTAS — MONEDA Y DADOS
// ═══════════════════════════════════════════════════════
_buildHerrPane: function () {
    return `
    <div class="herr-two-col">

        <!-- MONEDA -->
        <div class="herr-panel">
            <div class="herr-panel-title">🪙 Lanzamiento de Moneda</div>
            <div class="herr-coin-choice">
                <button class="herr-side-btn" id="herr-btn-cara"
                        onclick="DueloEnVivo.chooseSide('cara')">Cara</button>
                <button class="herr-side-btn" id="herr-btn-sello"
                        onclick="DueloEnVivo.chooseSide('sello')">Sello</button>
            </div>
            <div class="herr-choice-label" id="herr-choice-label">Sin elección</div>
            <div class="herr-coin-area">
                <div class="herr-coin" id="herr-coin">
                    <div class="herr-coin-face herr-coin-front">☀️</div>
                    <div class="herr-coin-face herr-coin-back">🌙</div>
                </div>
            </div>
            <button class="herr-launch-btn" onclick="DueloEnVivo.flipCoin()">Lanzar</button>
            <div class="herr-result" id="herr-coin-result"></div>
        </div>

        <!-- DADOS -->
        <div class="herr-panel">
            <div class="herr-panel-title">🎲 Tirar Dados</div>
            <div class="herr-dice-choice">
                <label class="herr-label">¿Cuántos dados?</label>
                <div class="herr-dice-stepper">
                    <button class="herr-step-btn" onclick="DueloEnVivo.changeDice(-1)">◀</button>
                    <span class="herr-dice-count" id="herr-dice-count">1</span>
                    <button class="herr-step-btn" onclick="DueloEnVivo.changeDice(1)">▶</button>
                </div>
            </div>
            <div class="herr-dice-area" id="herr-dice-area">
                <div class="herr-die herr-die-idle">⚀</div>
            </div>
            <button class="herr-launch-btn" onclick="DueloEnVivo.rollDice()">Tirar</button>
            <div class="herr-result" id="herr-dice-result"></div>
        </div>

    </div>`;
},

chooseSide: function (side) {
    this.herr.coinSide = side;
    document.getElementById('herr-btn-cara').classList.toggle('herr-side-active', side === 'cara');
    document.getElementById('herr-btn-sello').classList.toggle('herr-side-active', side === 'sello');
    document.getElementById('herr-choice-label').textContent =
        `Tu elección: ${side.charAt(0).toUpperCase() + side.slice(1)}`;
    document.getElementById('herr-coin-result').innerHTML = '';
},

flipCoin: function () {
    const coin  = document.getElementById('herr-coin');
    const resEl = document.getElementById('herr-coin-result');
    if (!coin || this.herr.rolling) return;
    this.herr.rolling = true;
    resEl.innerHTML   = '';
    coin.classList.remove('herr-coin-heads', 'herr-coin-tails', 'herr-coin-spin');
    void coin.offsetWidth;
    coin.classList.add('herr-coin-spin');

    setTimeout(() => {
        const result = Math.random() < 0.5 ? 'cara' : 'sello';
        coin.classList.remove('herr-coin-spin');
        coin.classList.add(result === 'cara' ? 'herr-coin-heads' : 'herr-coin-tails');
        const chosen = this.herr.coinSide;
        const won    = chosen === null || chosen === result;
        const label  = result.charAt(0).toUpperCase() + result.slice(1);
        resEl.innerHTML = chosen === null
            ? `Resultado: <strong>${label}</strong>`
            : won
                ? `<span class="herr-win">✅ ${label} — ¡Ganaste el lanzamiento!</span>`
                : `<span class="herr-lose">❌ ${label} — Tu rival decide.</span>`;
        this.herr.rolling = false;
    }, 900);
},

changeDice: function (delta) {
    this.herr.diceCount = Math.min(6, Math.max(1, this.herr.diceCount + delta));
    document.getElementById('herr-dice-count').textContent = this.herr.diceCount;
    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    const area  = document.getElementById('herr-dice-area');
    if (area) area.innerHTML = Array.from({ length: this.herr.diceCount })
        .map(() => `<div class="herr-die herr-die-idle">${faces[0]}</div>`).join('');
    document.getElementById('herr-dice-result').innerHTML = '';
},

rollDice: function () {
    const area  = document.getElementById('herr-dice-area');
    const resEl = document.getElementById('herr-dice-result');
    if (!area || this.herr.rolling) return;
    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    const count = this.herr.diceCount;
    this.herr.rolling = true;
    resEl.innerHTML   = '';
    area.innerHTML    = Array.from({ length: count })
        .map(() => `<div class="herr-die herr-die-rolling">${faces[Math.floor(Math.random()*6)]}</div>`).join('');

    let ticks = 0;
    const rattle = setInterval(() => {
        ticks++;
        area.querySelectorAll('.herr-die').forEach(d => {
            d.textContent = faces[Math.floor(Math.random() * 6)];
        });
        if (ticks >= 8) {
            clearInterval(rattle);
            const results = Array.from({ length: count }).map(() => Math.floor(Math.random() * 6) + 1);
            area.innerHTML = results
                .map(v => `<div class="herr-die herr-die-result">${faces[v - 1]}</div>`).join('');
            const total = results.reduce((s, v) => s + v, 0);
            resEl.innerHTML = count > 1
                ? `Valores: <strong>${results.join(' + ')}</strong> · Total: <strong class="herr-total">${total}</strong>`
                : `Resultado: <strong class="herr-total">${total}</strong>`;
            this.herr.rolling = false;
        }
    }, 80);
},
std: {
    defaultMins: 50,
    remaining:   50 * 60,
    running:     false,
    _interval:   null,
    lpA: 8000,
    lpB: 8000
},
};

window.DueloEnVivo = DueloEnVivo;