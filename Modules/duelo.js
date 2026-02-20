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

    // Cronómetro Estándar independiente
    std: {
        defaultMins: 50,
        remaining:   50 * 60,
        running:     false,
        _interval:   null
    },

    // Estado Master Duel (todo en memoria)
    md: {
        // Cronómetro estándar dentro de Master Duel (independiente del de arriba)
        std: {
            defaultMins: 50,
            remaining:   50 * 60,
            running:     false,
            _interval:   null
        },
        // Timers de jugador
        timerA: { defaultSecs: 300, remaining: 300, running: false, _interval: null },
        timerB: { defaultSecs: 300, remaining: 300, running: false, _interval: null },
        // Turno de juego
        currentTurn:     'A',
        turnNumber:      1,
        // Interacción (switch visual, independiente de turno)
        activeInteract:  null,   // 'A' | 'B' | null
        // Life Points
        lpA: 8000,
        lpB: 8000
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
                <button class="duelo-sub-tab ${this.subTab === 'estandar' ? 'active' : ''}"
                        onclick="DueloEnVivo.showSubTab('estandar')">⏱ Cronómetro Estándar</button>
                <button class="duelo-sub-tab ${this.subTab === 'masterduel' ? 'active' : ''}"
                        onclick="DueloEnVivo.showSubTab('masterduel')">👑 Cronómetro Master Duel</button>
            </div>
            <div id="duelo-pane-estandar" style="${this.subTab !== 'estandar' ? 'display:none' : ''}">
                ${this._buildStdPane()}
            </div>
            <div id="duelo-pane-masterduel" style="${this.subTab !== 'masterduel' ? 'display:none' : ''}">
                ${this._buildMDPane()}
            </div>
        </div>`;
    },

    showSubTab: function (tab) {
        this.subTab = tab;
        document.querySelectorAll('.duelo-sub-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.duelo-sub-tab').forEach(b => {
            if (b.textContent.includes('Estándar') && tab === 'estandar') b.classList.add('active');
            if (b.textContent.includes('Master')   && tab === 'masterduel') b.classList.add('active');
        });
        const estEl = document.getElementById('duelo-pane-estandar');
        const mdEl  = document.getElementById('duelo-pane-masterduel');
        if (estEl) estEl.style.display = tab === 'estandar'   ? '' : 'none';
        if (mdEl)  mdEl.style.display  = tab === 'masterduel' ? '' : 'none';
    },

    // ─── HELPERS ─────────────────────────────────────────────
    _fmt: function (secs) {
        const s = Math.max(0, secs);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const ss = s % 60;
        if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
        return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    },

    _setDisplay: function (id, secs) {
        const el = document.getElementById(id);
        if (el) el.textContent = this._fmt(secs);
    },

    _flashAlert: function (msg) {
        const el = document.createElement('div');
        el.className = 'duelo-alert-flash';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3500);
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
        </div>`;
    },

    stdStart: function (scope) {
        const state   = scope === 'md' ? this.md.std : this.std;
        const inputId = scope === 'md' ? 'std-mins-md' : 'std-mins-main';
        const dispId  = scope === 'md' ? 'std-md-display' : 'std-main-display';
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
                this._flashAlert('⏰ ¡Tiempo agotado!');
                return;
            }
            state.remaining--;
            this._setDisplay(dispId, state.remaining);
        }, 1000);
    },

    stdStop: function (scope) {
        const state = scope === 'md' ? this.md.std : this.std;
        clearInterval(state._interval);
        state.running = false;
    },

    stdReset: function (scope) {
        this.stdStop(scope);
        const state   = scope === 'md' ? this.md.std : this.std;
        const inputId = scope === 'md' ? 'std-mins-md' : 'std-mins-main';
        const dispId  = scope === 'md' ? 'std-md-display' : 'std-main-display';
        const inp = document.getElementById(inputId);
        const m = inp ? (Math.max(1, parseInt(inp.value) || state.defaultMins)) : state.defaultMins;
        state.remaining = m * 60;
        this._setDisplay(dispId, state.remaining);
    },

    // ═══════════════════════════════════════════════════════
    // MASTER DUEL PANE
    // ═══════════════════════════════════════════════════════
    _buildMDPane: function () {
        const md      = this.md;
        const turnCol = md.currentTurn === 'A' ? '#1a6bbd' : '#bd1a1a';
        const iA      = md.activeInteract === 'A';
        const iB      = md.activeInteract === 'B';

        return `
        <div class="duelo-md-wrap">

            <!-- Cronómetro Estándar centrado arriba -->
            <div class="duelo-md-std-row">
                <div class="duelo-md-std-display-wrap">
                    <div class="duelo-std-display duelo-std-display-md" id="std-md-display">${this._fmt(md.std.remaining)}</div>
                    <div class="duelo-std-config-row duelo-std-config-row-sm">
                        <label class="duelo-label">Mins:</label>
                        <input type="number" id="std-mins-md" class="duelo-time-input duelo-time-input-sm"
                               value="${md.std.defaultMins}" min="1" max="999">
                        <button class="btn btn-primary duelo-duel-btn duelo-duel-btn-sm"
                                onclick="DueloEnVivo.stdStart('md')">⚔️ Duelo!</button>
                        <button class="btn btn-secondary duelo-ctrl-btn-sm"
                                onclick="DueloEnVivo.stdStop('md')">⏹</button>
                        <button class="btn btn-secondary duelo-ctrl-btn-sm"
                                onclick="DueloEnVivo.stdReset('md')">↺</button>
                    </div>
                </div>
            </div>

            <!-- Timers de jugador (rotados) + fila de interacción -->
            <div class="duelo-md-players-row">

                <!-- Jugador A (izquierda, rotado 90°) -->
                <div class="duelo-md-player-col duelo-md-player-col-a">
                    <div class="duelo-md-player-rotated">
                        <div class="duelo-timer-player" id="md-timer-a">${this._fmt(md.timerA.remaining)}</div>
                        <div class="duelo-player-tag">Jugador A</div>
                        <div class="duelo-player-ctrl-row">
                            <button class="duelo-ptimer-btn" onclick="DueloEnVivo.playerTimerStart('A')">▶</button>
                            <button class="duelo-ptimer-btn" onclick="DueloEnVivo.playerTimerStop('A')">⏹</button>
                            <button class="duelo-ptimer-btn" onclick="DueloEnVivo.playerTimerReset('A')">↺</button>
                            <input type="number" id="ptimer-a-secs" class="duelo-time-input duelo-time-input-sm"
                                   value="${md.timerA.defaultSecs}" min="10" max="9999">s
                        </div>
                    </div>
                </div>

                <!-- Centro: botón de turno -->
                <div class="duelo-md-center-col">
                    <div class="duelo-turn-indicator" id="duelo-turn-ind"
                         style="background:${turnCol}">
                        Turno: Jugador ${md.currentTurn}
                    </div>
                    <div class="duelo-turn-count" id="duelo-turn-count">Turno ${md.turnNumber}</div>
                    <button class="btn duelo-change-turn-btn" onclick="DueloEnVivo.nextTurn()">
                        ⇄ Cambiar Turno
                    </button>
                </div>

                <!-- Jugador B (derecha, rotado -90°) -->
                <div class="duelo-md-player-col duelo-md-player-col-b">
                    <div class="duelo-md-player-rotated duelo-md-player-rotated-b">
                        <div class="duelo-timer-player" id="md-timer-b">${this._fmt(md.timerB.remaining)}</div>
                        <div class="duelo-player-tag">Jugador B</div>
                        <div class="duelo-player-ctrl-row">
                            <button class="duelo-ptimer-btn" onclick="DueloEnVivo.playerTimerStart('B')">▶</button>
                            <button class="duelo-ptimer-btn" onclick="DueloEnVivo.playerTimerStop('B')">⏹</button>
                            <button class="duelo-ptimer-btn" onclick="DueloEnVivo.playerTimerReset('B')">↺</button>
                            <input type="number" id="ptimer-b-secs" class="duelo-time-input duelo-time-input-sm"
                                   value="${md.timerB.defaultSecs}" min="10" max="9999">s
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fila de interacción (botones amarillos grandes) -->
            <div class="duelo-md-interact-row">
                <button class="duelo-interact-btn ${iA ? 'duelo-interact-active' : ''}"
                        id="duelo-ibtn-a"
                        onclick="DueloEnVivo.setInteraction('A')">
                    ⚡<br><span>Jugador A</span>
                </button>

                <div class="duelo-interact-spacer"></div>

                <button class="duelo-interact-btn ${iB ? 'duelo-interact-active' : ''}"
                        id="duelo-ibtn-b"
                        onclick="DueloEnVivo.setInteraction('B')">
                    ⚡<br><span>Jugador B</span>
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
                        <button class="duelo-op-btn duelo-op-multi"  onclick="DueloEnVivo.openLP('A','multi')">Multi</button>
                        <button class="duelo-op-btn duelo-op-half"   onclick="DueloEnVivo.openLP('A','half')">Half</button>
                    </div>
                </div>

                <div class="duelo-lp-vs">VS</div>

                <div class="duelo-lp-block">
                    <div class="duelo-lp-name">Jugador B</div>
                    <div class="duelo-lp-val" id="lp-b">${md.lpB.toLocaleString()}</div>
                    <div class="duelo-lp-ops">
                        <button class="duelo-op-btn duelo-op-gain"   onclick="DueloEnVivo.openLP('B','gain')">Gain</button>
                        <button class="duelo-op-btn duelo-op-damage" onclick="DueloEnVivo.openLP('B','damage')">Damage</button>
                        <button class="duelo-op-btn duelo-op-multi"  onclick="DueloEnVivo.openLP('B','multi')">Multi</button>
                        <button class="duelo-op-btn duelo-op-half"   onclick="DueloEnVivo.openLP('B','half')">Half</button>
                    </div>
                </div>
            </div>

            <div class="duelo-lp-reset-row">
                <button class="btn btn-secondary duelo-ctrl-btn"
                        onclick="DueloEnVivo.resetLP()">↺ Resetear LPs (8000)</button>
            </div>

        </div>`;
    },

    // ─── PLAYER TIMERS ───────────────────────────────────────
    playerTimerStart: function (p) {
        const state  = p === 'A' ? this.md.timerA : this.md.timerB;
        const dispId = p === 'A' ? 'md-timer-a' : 'md-timer-b';
        const inpId  = p === 'A' ? 'ptimer-a-secs' : 'ptimer-b-secs';
        if (state.running) return;
        const inp = document.getElementById(inpId);
        if (inp) {
            const s = Math.max(10, parseInt(inp.value) || state.defaultSecs);
            state.defaultSecs = s;
            if (state.remaining <= 0) state.remaining = s;
        }
        state.running   = true;
        state._interval = setInterval(() => {
            if (state.remaining <= 0) {
                clearInterval(state._interval);
                state.running = false;
                this._setDisplay(dispId, 0);
                this._flashAlert(`⏰ ¡Tiempo agotado — Jugador ${p}!`);
                return;
            }
            state.remaining--;
            this._setDisplay(dispId, state.remaining);
        }, 1000);
    },

    playerTimerStop: function (p) {
        const state = p === 'A' ? this.md.timerA : this.md.timerB;
        clearInterval(state._interval);
        state.running = false;
    },

    playerTimerReset: function (p) {
        this.playerTimerStop(p);
        const state  = p === 'A' ? this.md.timerA : this.md.timerB;
        const dispId = p === 'A' ? 'md-timer-a'    : 'md-timer-b';
        const inpId  = p === 'A' ? 'ptimer-a-secs' : 'ptimer-b-secs';
        const inp = document.getElementById(inpId);
        const s = inp ? (Math.max(10, parseInt(inp.value) || state.defaultSecs)) : state.defaultSecs;
        state.remaining = s;
        this._setDisplay(dispId, s);
    },

    // ─── TURNO ───────────────────────────────────────────────
    nextTurn: function () {
        const md = this.md;
        md.currentTurn  = md.currentTurn === 'A' ? 'B' : 'A';
        md.turnNumber++;
        const color = md.currentTurn === 'A' ? '#1a6bbd' : '#bd1a1a';
        const indEl   = document.getElementById('duelo-turn-ind');
        const countEl = document.getElementById('duelo-turn-count');
        if (indEl)   { indEl.textContent = `Turno: Jugador ${md.currentTurn}`; indEl.style.background = color; }
        if (countEl) countEl.textContent = `Turno ${md.turnNumber}`;
    },

    // ─── INTERACCIÓN (switch visual, sin conteo) ─────────────
    setInteraction: function (p) {
        this.md.activeInteract = this.md.activeInteract === p ? null : p;
        const ia = this.md.activeInteract;
        const btnA = document.getElementById('duelo-ibtn-a');
        const btnB = document.getElementById('duelo-ibtn-b');
        if (btnA) btnA.classList.toggle('duelo-interact-active', ia === 'A');
        if (btnB) btnB.classList.toggle('duelo-interact-active', ia === 'B');
    },

    // ─── LIFE POINTS ─────────────────────────────────────────
    openLP: function (player, type) {
        document.getElementById('duelo-lp-panel')?.remove();

        const presets  = [100, 300, 500, 1000, 1500, 2000, 4000, 8000];
        const labels   = { gain: 'Gain ＋', damage: 'Damage －', multi: 'Multi ×', half: 'Half ÷' };
        const opLabel  = labels[type] || type;

        const panel = document.createElement('div');
        panel.id    = 'duelo-lp-panel';
        panel.className = 'duelo-lp-panel-overlay';
        panel.innerHTML = `
            <div class="duelo-lp-panel-box">
                <button class="duelo-lp-panel-close" onclick="document.getElementById('duelo-lp-panel').remove()">✕</button>
                <div class="duelo-lp-panel-title">
                    ${opLabel} — Jugador ${player}
                </div>
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
                            onclick="document.getElementById('duelo-lp-input').value=''">
                        ✕ Borrar
                    </button>
                </div>
                <button class="btn btn-primary duelo-lp-calc-btn"
                        onclick="DueloEnVivo.calcLP('${player}','${type}')">
                    ✓ Calcular
                </button>
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
        if (type === 'multi')  current = current * val;
        if (type === 'half')   current = val === 0 ? current : Math.floor(current / val);

        if (player === 'A') md.lpA = current;
        else                md.lpB = current;

        const dispId = player === 'A' ? 'lp-a' : 'lp-b';
        const dispEl = document.getElementById(dispId);
        if (dispEl) dispEl.textContent = current.toLocaleString();

        document.getElementById('duelo-lp-panel')?.remove();
    },

    resetLP: function () {
        this.md.lpA = 8000;
        this.md.lpB = 8000;
        const elA = document.getElementById('lp-a');
        const elB = document.getElementById('lp-b');
        if (elA) elA.textContent = '8,000';
        if (elB) elB.textContent = '8,000';
    }
};

window.DueloEnVivo = DueloEnVivo;
