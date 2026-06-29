/* simuladores.js — Simuladores de partida: torneo Swiss, duelo y probabilidades */
/* Absorbe: torneo.js, duelo.js, hipergeometria.js */

// ── Winrate — registro de W/L por deck; standalone y vinculado al deck activo ──
const Winrate = {

    STORAGE_KEY: 'yugioh_winrates',

    // ── Persistencia ────────────────────────────────────────────

    getAllRecords: function () {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
        } catch (_) { return {}; }
    },

    getRecord: function (deckName) {
        if (!deckName) return null;
        const all = this.getAllRecords();
        return all[deckName] || {
            wins1st:   0,
            losses1st: 0,
            wins2nd:   0,
            losses2nd: 0
        };
    },

    saveRecord: function (deckName, data) {
        if (!deckName) return;
        const all = this.getAllRecords();
        all[deckName] = data;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    },

    // delta: +1 | -1

    change: function (going, type, delta) {
        const deckName = window.Deck?.name;
        if (!deckName) return;

        const rec = this.getRecord(deckName);
        const key = type + going;

        rec[key] = Math.max(0, (rec[key] || 0) + delta);
        this.saveRecord(deckName, rec);
        this.refreshSection();
    },

    // ── Cálculos ──────────────────────────────────────────────────

    calcWinrate: function (wins, losses) {
        const total = wins + losses;
        if (total === 0) return null;
        return Math.round((wins / total) * 100);
    },

    // ── Render ────────────────────────────────────────────────────

    renderSection: function () {
    const r = this._getStandaloneRecord();

    const wr1   = this.calcWinrate(r.wins1st,   r.losses1st);
    const wr2   = this.calcWinrate(r.wins2nd,   r.losses2nd);
    const wrAll = this.calcWinrate(r.wins1st + r.wins2nd, r.losses1st + r.losses2nd);
    const totalDuels = r.wins1st + r.losses1st + r.wins2nd + r.losses2nd;

    const wrColor = (pct) => {
        if (pct === null) return 'rgba(255,255,255,0.3)';
        if (pct >= 60)   return '#00b894';
        if (pct >= 45)   return '#fdcb6e';
        return '#d63031';
    };

    const counterHTML = (going, label) => {
        const wins   = r[`wins${going}`];
        const losses = r[`losses${going}`];
        const wr     = this.calcWinrate(wins, losses);
        const pct    = wr !== null ? `${wr}%` : '—';
        return `
            <div class="wr-half">
                <div class="wr-going-label">${label}</div>
                <div class="wr-score-row">
                    <div class="wr-counter-block">
                        <div class="wr-counter-btns">
                            <button class="wr-btn wr-btn-up"
                                onclick="Winrate.changeStandalone('${going}','wins',1)">＋</button>
                            <div class="wr-number" style="color:#00b894">${wins}</div>
                            <button class="wr-btn wr-btn-down"
                                onclick="Winrate.changeStandalone('${going}','wins',-1)">－</button>
                        </div>
                        <div class="wr-counter-label">Victorias</div>
                    </div>
                    <div class="wr-separator">—</div>
                    <div class="wr-counter-block">
                        <div class="wr-counter-btns">
                            <button class="wr-btn wr-btn-up"
                                onclick="Winrate.changeStandalone('${going}','losses',1)">＋</button>
                            <div class="wr-number" style="color:#d63031">${losses}</div>
                            <button class="wr-btn wr-btn-down"
                                onclick="Winrate.changeStandalone('${going}','losses',-1)">－</button>
                        </div>
                        <div class="wr-counter-label">Derrotas</div>
                    </div>
                </div>
                <div class="wr-sub-pct" style="color:${wrColor(wr)}">
                    ${pct}
                    ${wr !== null ? `<span class="wr-sub-duels">${wins + losses} duelos</span>` : ''}
                </div>
            </div>`;
    };

    return `
        <div class="wr-halves">
            ${counterHTML('1st', 'Going 1st')}
            ${counterHTML('2nd', 'Going 2nd')}
        </div>
        <div class="wr-general">
            <div class="wr-general-label">Winrate General</div>
            <div class="wr-general-pct" style="color:${wrColor(wrAll)}">
                ${wrAll !== null ? wrAll + '%' : '—'}
            </div>
            <div class="wr-general-duels">
                ${totalDuels > 0
                    ? `${r.wins1st + r.wins2nd}V · ${r.losses1st + r.losses2nd}D · ${totalDuels} duelos totales`
                    : 'Sin duelos registrados aún.'}
            </div>
        </div>
        <button class="wr-reset-btn" onclick="Winrate.resetStandalone()">↺ Reiniciar contadores</button>
        <hr class="wr-divider">
        ${this._renderRoundsForm()}
        <div class="wr-rounds-section-title">📋 Historial de Rondas de Duelo</div>
        ${this._renderRoundsHistory(r.rounds)}`;
},

    refreshSection: function () {
        const el = document.getElementById('winrate-sec');
        if (el) el.innerHTML = this.renderSection();
    },
    STANDALONE_KEY: 'pz_winrate_standalone',

    _getStandaloneRecord: function () {
    try {
        const base = { wins1st: 0, losses1st: 0, wins2nd: 0, losses2nd: 0, rounds: [] };
        return Object.assign({}, base, JSON.parse(localStorage.getItem(this.STANDALONE_KEY)) || {});
    } catch (_) {
        return { wins1st: 0, losses1st: 0, wins2nd: 0, losses2nd: 0, rounds: [] };
    }
},

    _saveStandaloneRecord: function (r) {
        localStorage.setItem(this.STANDALONE_KEY, JSON.stringify(r));
    },

    changeStandalone: function (going, type, delta) {
        const r   = this._getStandaloneRecord();
        const key = type + going;
        r[key] = Math.max(0, (r[key] || 0) + delta);
        this._saveStandaloneRecord(r);
        this.refreshSection();
    },

    resetStandalone: function () {
    this._saveStandaloneRecord({ wins1st: 0, losses1st: 0, wins2nd: 0, losses2nd: 0, rounds: [] });
    this.refreshSection();
},
// ── Rondas de Duelo ─────────────────────────────────────
    addRound: function () {
        const r     = this._getStandaloneRecord();
        const going = document.getElementById('wr-round-going')?.value || '1st';
        const result= document.getElementById('wr-round-result')?.value || 'win';
        const turns = parseInt(document.getElementById('wr-round-turns')?.value) || 0;
        const winTurn = parseInt(document.getElementById('wr-round-winturn')?.value) || 0;
        const fieldBreaks  = parseInt(document.getElementById('wr-round-fieldbreaks')?.value) || 0;
        const interrupts   = parseInt(document.getElementById('wr-round-interrupts')?.value) || 0;

        if (!r.rounds) r.rounds = [];
        r.rounds.push({
            num:          r.rounds.length + 1,
            going,
            result,
            turns:        Math.max(0, turns),
            winTurn:      Math.max(0, winTurn),
            fieldBreaks:  Math.max(0, fieldBreaks),
            interrupts:   Math.max(0, interrupts),
            ts:           Date.now()
        });

        // Actualizar contadores globales
        const key = result === 'win' ? 'wins' : 'losses';
        r[key + going] = (r[key + going] || 0) + 1;

        this._saveStandaloneRecord(r);
        this.refreshSection();
    },

    deleteRound: function (idx) {
        const r = this._getStandaloneRecord();
        if (!r.rounds || !r.rounds[idx]) return;
        const round = r.rounds[idx];

        // Revertir contador global
        const key = round.result === 'win' ? 'wins' : 'losses';
        r[key + round.going] = Math.max(0, (r[key + round.going] || 1) - 1);

        r.rounds.splice(idx, 1);
        // Renumerar
        r.rounds.forEach((rd, i) => { rd.num = i + 1; });

        this._saveStandaloneRecord(r);
        this.refreshSection();
    },

    _renderRoundsForm: function () {
        return `
        <div class="wr-round-form">
            <div class="wr-round-form-title">＋ Nueva Ronda de Duelo</div>
            <div class="wr-round-fields">
                <div class="wr-round-field">
                    <label class="wr-round-label">Turno</label>
                    <select id="wr-round-going" class="wr-round-select">
                        <option value="1st">Going 1st</option>
                        <option value="2nd">Going 2nd</option>
                    </select>
                </div>
                <div class="wr-round-field">
                    <label class="wr-round-label">Resultado</label>
                    <select id="wr-round-result" class="wr-round-select">
                        <option value="win">Victoria</option>
                        <option value="loss">Derrota</option>
                    </select>
                </div>
                <div class="wr-round-field">
                    <label class="wr-round-label">Turnos totales del duelo</label>
                    <input type="number" id="wr-round-turns" class="wr-round-input"
                           min="1" max="30" placeholder="Ej: 5">
                </div>
                <div class="wr-round-field">
                    <label class="wr-round-label">Turno en que se ganó</label>
                    <input type="number" id="wr-round-winturn" class="wr-round-input"
                           min="1" max="30" placeholder="Ej: 3">
                </div>
                <div class="wr-round-field">
                    <label class="wr-round-label">⚔️ Veces que rompí campo</label>
                    <input type="number" id="wr-round-fieldbreaks" class="wr-round-input"
                           min="0" max="20" placeholder="0">
                </div>
                <div class="wr-round-field">
                    <label class="wr-round-label">🛡️ Interrupciones exitosas</label>
                    <input type="number" id="wr-round-interrupts" class="wr-round-input"
                           min="0" max="20" placeholder="0">
                </div>
            </div>
            <button class="wr-add-round-btn" onclick="Winrate.addRound()">＋ Registrar Ronda</button>
        </div>`;
    },

    _renderRoundsHistory: function (rounds) {
        if (!rounds || !rounds.length) return `<p class="wr-rounds-empty">Sin rondas registradas aún.</p>`;
        const goingLabel = { '1st': '1ro', '2nd': '2do' };
        return `
        <div class="wr-rounds-list">
            ${rounds.slice().reverse().map((rd, revIdx) => {
                const origIdx = rounds.length - 1 - revIdx;
                const isWin   = rd.result === 'win';
                return `
                <div class="wr-round-item ${isWin ? 'wr-round-win' : 'wr-round-loss'}">
                    <div class="wr-round-item-head">
                        <span class="wr-round-num">R${rd.num}</span>
                        <span class="wr-round-going-badge">${goingLabel[rd.going] || rd.going}</span>
                        <span class="wr-round-result-badge ${isWin ? 'wr-badge-win' : 'wr-badge-loss'}">
                            ${isWin ? '✅ Victoria' : '❌ Derrota'}
                        </span>
                        <button class="wr-round-del-btn" onclick="Winrate.deleteRound(${origIdx})" title="Eliminar">✕</button>
                    </div>
                    <div class="wr-round-item-stats">
                        ${rd.turns    ? `<span>⏱ ${rd.turns} turnos</span>` : ''}
                        ${rd.winTurn  ? `<span>🏁 Ganó T${rd.winTurn}</span>` : ''}
                        ${rd.fieldBreaks !== undefined ? `<span>⚔️ Campo: ${rd.fieldBreaks}x</span>` : ''}
                        ${rd.interrupts  !== undefined ? `<span>🛡️ Interrup: ${rd.interrupts}x</span>` : ''}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    },
};

window.Winrate = Winrate;



// ── Torneo — simulador Swiss/Mulligan/Cronómetro/Winrate/Práctica; se inicializa lazy al entrar a Simuladores ──

const Torneo = {
    STORAGE_KEY: 'yugioh_torneo_actual',
    data:        null,
    viewRound:   1,
    _pendingYDK: null,
    simTab: 'mulligan',

    // ─────────────────────────────────────────────
    _empty: function (name) {
        return {
            name:         name || 'Mi Torneo',
            createdAt:    Date.now(),
            participants: [],
            rounds:       [{ number: 1, matches: [], finalized: false, winners: [], losers: [] }],
            historial:    [],
            points:       {},
            status:       'setup'
        };
    },

    // ─────────────────────────────────────────────
    load: function () {
        try {
            const raw  = localStorage.getItem(this.STORAGE_KEY);
            this.data  = raw ? JSON.parse(raw) : this._empty('Mi Torneo');
            if (!this.data.rounds)      this.data.rounds      = [{ number:1, matches:[], finalized:false, winners:[], losers:[] }];
            if (!this.data.historial)   this.data.historial   = [];
            if (!this.data.points)      this.data.points      = {};
            if (!this.data.participants) this.data.participants = [];
        } catch (_) {
            this.data = this._empty('Mi Torneo');
        }
    },

    save: function () {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data)); } catch (_) {}
    },

    // ─────────────────────────────────────────────
    init: function () {
        this.container = document.getElementById('simuladores-content');
        if (!this.container) return;
        this.load();
        this.viewRound = this.data.rounds.length;
        this.render();
    },

    render: function () {
        if (!this.container) return;
        const d       = this.data;
        const isLocked = d.rounds.some(r => r.finalized);

        const roundTabs = d.rounds.map(r => `
            <button class="torneo-round-tab ${this.viewRound === r.number ? 'active' : ''}"
                    onclick="Torneo.setViewRound(${r.number})">
                R${r.number}${r.finalized ? ' ✓' : ''}
            </button>`).join('');

    if (!document.getElementById('sim-torneo-content')) {
        this.container.innerHTML = `
        <h2>Simuladores</h2>
        <div class="sim-main-tabs">
            <button class="sim-tab-btn active" data-simtab="mulligan" data-section-id="sim-mulligan"
                    onclick="Torneo.showSimTab('mulligan')">🎲 Mulligan</button>
            <button class="sim-tab-btn" data-simtab="winrate"
                    onclick="Torneo.showSimTab('winrate')">📊 Winrate</button>
            <button class="sim-tab-btn" data-simtab="torneo" data-section-id="sim-torneo"
                    onclick="Torneo.showSimTab('torneo')">🏆 Torneo</button>
            <button class="sim-tab-btn" data-simtab="duelo"
                    onclick="Torneo.showSimTab('duelo')">⚔️ Duelo en Vivo</button>
            <button class="sim-tab-btn" data-simtab="experimentacion" data-section-id="sim-experimentacion"
                    onclick="Torneo.showSimTab('experimentacion')">🧪 Experimentación</button>
            <button class="sim-tab-btn" data-simtab="practica"
                    onclick="Torneo.showSimTab('practica')">🎴 Zona de Práctica</button>
        </div>
        <div id="sim-mulligan-content"        style="display:none;"></div>
        <div id="sim-torneo-content"></div>
        <div id="sim-duelo-content"           style="display:none;"></div>
        <div id="sim-experimentacion-content" style="display:none;"></div>
        <div id="sim-practica-content"        style="display:none;"></div>
        <div id="sim-winrate-content"         style="display:none;"></div>`;
    }
    document.querySelectorAll('.sim-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.simtab === this.simTab);
    });
    const torneoEl = document.getElementById('sim-torneo-content');
    if (!torneoEl) return;
    torneoEl.innerHTML = `
            <div class="torneo-section">

                <div class="torneo-top-bar">
                    <div class="torneo-title-row">
                        <span class="torneo-title-name">${d.name}</span>
                        <button class="torneo-icon-btn" onclick="Torneo.renameTorneo()" title="Renombrar">✏️</button>
                    </div>
                    <div class="torneo-top-btns">
                        <button class="btn btn-sm torneo-new-btn" onclick="Torneo.newTorneo()">🏆 Nuevo Torneo</button>
                        <button class="btn btn-sm torneo-export-btn" onclick="Torneo.exportTxt()">📄 Exportar .txt</button>
                    </div>
                </div>

                <!-- Tabs principales -->
                <div class="torneo-main-tabs">
                    <button class="torneo-tab-btn active" id="ttab-participantes" onclick="Torneo.showMainTab('participantes')">
                        👥 Participantes
                        <span class="torneo-tab-count">${d.participants.length}</span>
                    </button>
                    <button class="torneo-tab-btn" id="ttab-matches"  onclick="Torneo.showMainTab('matches')">⚔️ Enfrentamientos</button>
                    <button class="torneo-tab-btn" id="ttab-brackets" onclick="Torneo.showMainTab('brackets')">🏅 Brackets</button>
                    <button class="torneo-tab-btn" id="ttab-historial" onclick="Torneo.showMainTab('historial')">📋 Historial</button>
                    <button class="torneo-tab-btn" id="ttab-puntos"   onclick="Torneo.showMainTab('puntos')">🥇 Puntos</button>
                </div>

                <!-- Sub-tabs de ronda (matches + brackets) -->
                <div class="torneo-round-tabs" id="torneo-round-tabs" style="display:none;">
                    ${roundTabs}
                </div>

                <!-- Contenidos -->
                <div id="torneo-tab-participantes" class="torneo-tab-content">${this.renderParticipantes()}</div>
                <div id="torneo-tab-matches"       class="torneo-tab-content" style="display:none;">${this.renderMatches()}</div>
                <div id="torneo-tab-brackets"      class="torneo-tab-content" style="display:none;">${this.renderBrackets()}</div>
                <div id="torneo-tab-historial"     class="torneo-tab-content" style="display:none;">${this.renderHistorial()}</div>
                <div id="torneo-tab-puntos"        class="torneo-tab-content" style="display:none;">${this.renderPuntos()}</div>

            </div>`;
        if (this.simTab !== 'torneo') {
            this.showSimTab(this.simTab);
        }
    },

    showMainTab: function (tab) {
        document.querySelectorAll('.torneo-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.torneo-tab-content').forEach(c => c.style.display = 'none');
        const btn = document.getElementById(`ttab-${tab}`);
        if (btn) btn.classList.add('active');
        const el = document.getElementById(`torneo-tab-${tab}`);
        if (el) el.style.display = '';
        const roundTabsEl = document.getElementById('torneo-round-tabs');
        if (roundTabsEl) roundTabsEl.style.display = (tab === 'matches' || tab === 'brackets') ? 'flex' : 'none';
    },
    _renderSimMatchups: function () {
        const el = document.getElementById('sim-matchups-sec');
        if (!el) return;
        if (!window.Matchups || !window.Deck?.name) {
            el.innerHTML = '<p class="stats-empty" style="padding:16px">Carga un deck para ver su historial.</p>';
            return;
        }
        // Reutiliza el HTML de Matchups pero sin el wrapper de deck.js
        const list  = Matchups.getAll();
        if (!list.length) {
            el.innerHTML = `
                <div class="matchup-toolbar">
                    <button class="matchup-btn matchup-btn-add" onclick="Matchups.openAddPanel();setTimeout(()=>Torneo._renderSimMatchups(),400)">＋ Agregar enfrentamiento</button>
                </div>
                <p class="matchup-empty" style="padding:16px">Sin enfrentamientos registrados.</p>`;
            return;
        }
        let rows = '';
        list.forEach((m, i) => {
            const { w, l, total } = Matchups._totals(m);
            const pct   = total > 0 ? Math.round((w / total) * 100) : null;
            const col   = pct === null ? 'rgba(255,255,255,0.3)' : pct >= 60 ? '#00b894' : pct >= 45 ? '#fdcb6e' : '#d63031';
            const wr1pct = (m.wins1st||0)+(m.losses1st||0) > 0
                ? Math.round(((m.wins1st||0)/((m.wins1st||0)+(m.losses1st||0)))*100) : null;
            const wr2pct = (m.wins2nd||0)+(m.losses2nd||0) > 0
                ? Math.round(((m.wins2nd||0)/((m.wins2nd||0)+(m.losses2nd||0)))*100) : null;
            const hasDeck = m.cardData && Object.keys(m.cardData).length > 0;
            rows += `
            <div class="matchup-row">
                <div class="matchup-row-main">
                    <div class="matchup-opponent-name">${m.opponentName || '—'}</div>
                    <div class="matchup-stats">
                        <span class="matchup-wr" style="color:${col}">${w}W – ${l}L${pct!==null?` · ${pct}%`:''}</span>
                        <span class="matchup-wr-detail">
                            1ro: ${m.wins1st||0}W/${m.losses1st||0}L${wr1pct!==null?` (${wr1pct}%)`:''}
                            &nbsp;·&nbsp;
                            2do: ${m.wins2nd||0}W/${m.losses2nd||0}L${wr2pct!==null?` (${wr2pct}%)`:''}
                        </span>
                    </div>
                    <div class="matchup-row-btns">
                        ${hasDeck ? `<button class="matchup-btn matchup-btn-deck" onclick="Matchups.openDeckPanel(${i})">🃏 Ver Deck</button>` : ''}
                        <button class="matchup-btn matchup-btn-edit"
                                onclick="Matchups.openEditPanel(${i});setTimeout(()=>Torneo._renderSimMatchups(),400)">✏️</button>
                        <button class="matchup-btn matchup-btn-del"
                                onclick="Matchups.deleteRecord(${i});Torneo._renderSimMatchups()">✕</button>
                    </div>
                </div>
                ${m.notes ? `<div class="matchup-notes-preview">${m.notes}</div>` : ''}
            </div>`;
        });
        el.innerHTML = `
            <div class="matchup-toolbar">
                <button class="matchup-btn matchup-btn-add"
                        onclick="Matchups.openAddPanel();setTimeout(()=>Torneo._renderSimMatchups(),400)">＋ Agregar</button>
                <button class="matchup-btn matchup-btn-clear"
                        onclick="Matchups.clearAll();Torneo._renderSimMatchups()">🗑 Borrar todo</button>
            </div>
            <div class="matchup-list">${rows}</div>`;
    },
    showSimTab: function (tab) {
    if (window.ContentManager) {
        const secMap = { mulligan:'sim-mulligan', torneo:'sim-torneo', experimentacion:'sim-experimentacion' };
        if (secMap[tab] && !ContentManager.isVisible(secMap[tab])) return;
    }
    this.simTab = tab;
    document.querySelectorAll('.sim-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.simtab === tab);
    });
    const mulliganEl = document.getElementById('sim-mulligan-content');
    const torneoEl   = document.getElementById('sim-torneo-content');
    const dueloEl    = document.getElementById('sim-duelo-content');
    const practicaEl = document.getElementById('sim-practica-content');
    if (mulliganEl) {
        mulliganEl.style.display = tab === 'mulligan' ? '' : 'none';
        if (tab === 'mulligan' && window.Hipergeometria) Hipergeometria.renderInto(mulliganEl);
    }
    if (torneoEl)   torneoEl.style.display = tab === 'torneo' ? '' : 'none';
    if (dueloEl) {
        dueloEl.style.display = tab === 'duelo' ? '' : 'none';
        if (tab === 'duelo' && window.DueloEnVivo) DueloEnVivo.renderInto(dueloEl);
    }
    const expEl = document.getElementById('sim-experimentacion-content');
    if (expEl) {
        expEl.style.display = tab === 'experimentacion' ? '' : 'none';
        if (tab === 'experimentacion' && window.Experimentacion) Experimentacion.renderInto(expEl);
    }
    const wrEl = document.getElementById('sim-winrate-content');
    if (wrEl) {
        wrEl.style.display = tab === 'winrate' ? '' : 'none';
        if (tab === 'winrate') {
            wrEl.innerHTML = `
                <div style="padding:16px 0;max-width:520px">
                    <div class="sim-wr-col-title" style="margin-bottom:12px">📊 Winrate del Deck</div>
                    <div id="winrate-sec"></div>
                </div>`;
            if (window.Winrate) Winrate.refreshSection();
        }
    }
    if (practicaEl) {
        practicaEl.style.display = tab === 'practica' ? '' : 'none';
        if (tab === 'practica' && window.ZonaPractica) ZonaPractica.renderInto(practicaEl);
    }
    if (window.ZonaPractica) {
        tab === 'practica'
            ? ZonaPractica._updateFloatingBtns()
            : ZonaPractica._cleanupFloatBtns();
    }
},


    setViewRound: function (num) {
        this.viewRound = num;
        const matchEl  = document.getElementById('torneo-tab-matches');
        const brackEl  = document.getElementById('torneo-tab-brackets');
        if (matchEl) matchEl.innerHTML = this.renderMatches();
        if (brackEl) brackEl.innerHTML = this.renderBrackets();
        const roundTabsEl = document.getElementById('torneo-round-tabs');
        if (roundTabsEl) roundTabsEl.innerHTML = this.data.rounds.map(r => `
            <button class="torneo-round-tab ${this.viewRound === r.number ? 'active' : ''}"
                    onclick="Torneo.setViewRound(${r.number})">
                R${r.number}${r.finalized ? ' ✓' : ''}
            </button>`).join('');
    },

    // ─────────────────────────────────────────────
    renderParticipantes: function () {
        const d       = this.data;
        const isLocked = d.rounds.some(r => r.finalized);
        const curRound = this._currentRound();
        const inMatchSet = new Set(curRound.matches.flatMap(m => [m.idA, m.idB]));

        const savedNames = this._getSavedDeckNames();
        const metaList   = this._getMetaDeckList();

        const savedOpts = savedNames.map(n => `<option value="saved::${n}">🃏 ${n}</option>`).join('');
        const metaOpts  = metaList.map(({ folder, name }) =>
            `<option value="meta::${folder}::${name}">⚔️ ${name} (${folder})</option>`).join('');

        const form = isLocked ? '' : `
            <div class="torneo-add-participant">
                <div class="torneo-add-row">
                    <input type="text" id="torneo-player-name" class="config-input"
                           placeholder="Nombre del jugador..." style="flex:1.2">
                    <select id="torneo-deck-select" class="config-input" style="flex:2"
                            onchange="Torneo.onDeckSelectChange()">
                        <option value="">— Deck (opcional) —</option>
                        ${savedOpts ? `<optgroup label="Mis Decks">${savedOpts}</optgroup>` : ''}
                        ${metaOpts  ? `<optgroup label="Meta">${metaOpts}</optgroup>`       : ''}
                    </select>
                    <button class="btn btn-sm torneo-ydk-btn" onclick="Torneo.triggerYDK()" title="Subir .ydk">📁</button>
                    <button class="btn btn-primary torneo-add-btn" onclick="Torneo.addParticipant()">+ Agregar</button>
                </div>
                <input type="file" id="torneo-ydk-input" accept=".ydk" style="display:none;"
                       onchange="Torneo.handleYDKUpload(this)">
                <div id="torneo-ydk-status" class="torneo-ydk-status" style="display:none;"></div>
            </div>`;

        const list = d.participants.length === 0
            ? `<p class="stats-empty" style="margin-top:12px;">Aún no hay participantes.</p>`
            : `<div class="torneo-participants-list">
                ${d.participants.map((p, i) => {
                    const inMatch = !isLocked && !curRound.finalized && inMatchSet.has(p.id);
                    const lost    = d.rounds.filter(r => r.finalized && r.losers?.includes(p.id)).length > 0;
                    return `
                    <div class="torneo-participant-item ${inMatch ? 'torneo-in-match' : ''} ${lost ? 'torneo-eliminated' : ''}">
                        <span class="torneo-p-num">#${i + 1}</span>
                        ${this._renderThumb(p, true)}
                        <div class="torneo-p-info">
                            <span class="torneo-p-name">${p.name}</span>
                            <span class="torneo-p-deck">${p.deckName || '—'}</span>
                        </div>
                        ${inMatch ? '<span class="torneo-badge-match">En match</span>' : ''}
                        ${lost    ? '<span class="torneo-badge-elim">Eliminado</span>' : ''}
                        ${!isLocked ? `<button class="torneo-remove-btn" onclick="Torneo.removeParticipant('${p.id}')" title="Quitar">✕</button>` : ''}
                    </div>`;
                }).join('')}
               </div>`;

        return `${form}<div class="torneo-p-total">${d.participants.length} participante(s)</div>${list}`;
    },

    _renderThumb: function (p, clickable) {
        if (!p.cartaAs) return `<div class="torneo-thumb-ph">🃏</div>`;
        const click = clickable ? `onclick="Torneo.openDeckPanel('${p.id}')" title="Ver decklist" style="cursor:pointer;"` : '';
        return `<img class="torneo-deck-thumb" ${click}
                     src="https://images.ygoprodeck.com/images/cards_small/${p.cartaAs}.jpg"
                     onerror="this.parentNode.innerHTML='<div class=torneo-thumb-ph>🃏</div>'">`;
    },

    onDeckSelectChange: function () {
        const sel  = document.getElementById('torneo-deck-select');
        const inp  = document.getElementById('torneo-player-name');
        if (!sel?.value || !inp) return;
        const parts = sel.value.split('::');
        if (!inp.value.trim()) inp.value = parts[0] === 'saved' ? parts[1] : parts[2];
    },

    triggerYDK: function () {
        document.getElementById('torneo-ydk-input')?.click();
    },

    handleYDKUpload: function (input) {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            const sections  = this._parseYDK(e.target.result);
            const deckName  = file.name.replace(/\.ydk$/i, '');
            this._pendingYDK = { sections, deckName, firstCard: sections.main[0] || null };
            const nameEl    = document.getElementById('torneo-player-name');
            if (nameEl && !nameEl.value.trim()) nameEl.value = deckName;
            const status = document.getElementById('torneo-ydk-status');
            if (status) {
                status.style.display = '';
                status.textContent   = `✓ YDK cargado: ${sections.main.length}M · ${sections.extra.length}E · ${sections.side.length}S`;
            }
        };
        reader.readAsText(file);
    },

    _parseYDK: function (text) {
        const result  = { main: [], extra: [], side: [] };
        let   section = null;
        text.split('\n').forEach(l => {
            l = l.trim();
            if (l === '#main')   { section = 'main';  return; }
            if (l === '#extra')  { section = 'extra'; return; }
            if (l === '!side')   { section = 'side';  return; }
            if (section && /^\d+$/.test(l)) result[section].push(l);
        });
        return result;
    },

    addParticipant: function () {
        const nameEl = document.getElementById('torneo-player-name');
        const selEl  = document.getElementById('torneo-deck-select');
        const name   = nameEl?.value?.trim();
        if (!name) { alert('Ingresa el nombre del jugador.'); return; }

        const p = {
            id:          'p_' + Date.now() + Math.random().toString(36).slice(2, 5),
            name,
            deckName:    '',
            cartaAs:     null,
            sections:    null,
            cardData:    {},
            deckHistory: []
        };

        const sel = selEl?.value || '';
        if (sel) {
            const parts = sel.split('::');
            if (parts[0] === 'saved') this._applyDeckFromSaved(p, parts[1]);
            else if (parts[0] === 'meta') this._applyDeckFromMeta(p, parts[1], parts[2]);
        } else if (this._pendingYDK) {
            this._applyDeckFromYDK(p, this._pendingYDK);
            this._pendingYDK = null;
            const status = document.getElementById('torneo-ydk-status');
            if (status) status.style.display = 'none';
        }

        this.data.participants.push(p);
        this.save();
        if (nameEl) nameEl.value = '';
        if (selEl)  selEl.value  = '';
        this._refreshParticipantes();
    },

    _applyDeckFromSaved: function (p, deckName) {
        try {
            const raw  = localStorage.getItem(`deck_${deckName}`);
            if (!raw) return;
            const data = JSON.parse(raw);
            const cards = data.cards || {};
            p.deckName = deckName;
            if (!p.deckHistory.includes(deckName)) p.deckHistory.push(deckName);
            p.sections = {
                main:  [],
                extra: [],
                side:  []
            };
            p.cardData = {};
            Object.entries(cards).forEach(([id, v]) => {
                const loc = v.location || 'main';
                for (let i = 0; i < (v.qty || 1); i++) p.sections[loc]?.push(id);
                p.cardData[id] = {
                    name:     v.data?.name  || id,
                    qty:      v.qty || 1,
                    location: loc,
                    img:      v.data?.card_images?.[0]?.image_url_small || null
                };
                if (v.roles?.includes('Carta As') || v.isCartaAs) p.cartaAs = id;
            });
            if (!p.cartaAs) p.cartaAs = Object.keys(cards)[0] || null;
        } catch (_) {}
    },

    _applyDeckFromMeta: function (p, folder, deckName) {
        p.deckName = deckName;
        if (!p.deckHistory.includes(deckName)) p.deckHistory.push(deckName);
        const metaDecks = window.Estadisticas?.metaDecks || {};
        const deck      = (metaDecks[folder] || []).find(d => d.filename === deckName);
        if (!deck) return;
        p.sections = deck.sections ? { ...deck.sections } : { main: [], extra: [], side: [] };
        const freq  = deck.cardFrequency || {};
        const lib   = window.Estadisticas?.metaCardLibrary || {};
        const allIds = [...(p.sections.main||[]), ...(p.sections.extra||[]), ...(p.sections.side||[])];
        p.cardData = {};
        const seen = {};
        allIds.forEach(id => {
            if (seen[id]) return;
            seen[id] = true;
            const loc = (p.sections.main||[]).includes(id) ? 'main'
                      : (p.sections.extra||[]).includes(id) ? 'extra' : 'side';
            p.cardData[id] = {
                name:     lib[String(id)]?.name || String(id),
                qty:      freq[String(id)] || 1,
                location: loc,
                img:      null
            };
        });
        p.cartaAs = (p.sections.main || [])[0] || null;
    },

    _applyDeckFromYDK: function (p, ydk) {
        p.deckName = ydk.deckName;
        if (!p.deckHistory.includes(ydk.deckName)) p.deckHistory.push(ydk.deckName);
        p.sections = { main: ydk.sections.main, extra: ydk.sections.extra, side: ydk.sections.side };
        p.cartaAs  = ydk.firstCard || null;
        p.cardData = {};
        ['main', 'extra', 'side'].forEach(loc => {
            const freq = {};
            (ydk.sections[loc] || []).forEach(id => { freq[id] = (freq[id] || 0) + 1; });
            Object.entries(freq).forEach(([id, qty]) => {
                p.cardData[id] = { name: id, qty, location: loc, img: null };
            });
        });
    },

    removeParticipant: function (id) {
        if (this.data.rounds.some(r => r.finalized)) return;
        this.data.participants = this.data.participants.filter(p => p.id !== id);
        this._currentRound().matches = this._currentRound().matches.filter(m => m.idA !== id && m.idB !== id);
        this.save();
        this._refreshParticipantes();
        this._refreshMatches();
    },

    // ─────────────────────────────────────────────
    renderMatches: function () {
        const round  = this._getRound(this.viewRound);
        if (!round) return `<p class="stats-empty">Sin ronda.</p>`;
        const locked = round.finalized;

        let available;
        if (round.number === 1) {
            available = this.data.participants;
        } else {
            const prev = this._getRound(round.number - 1);
            available  = this.data.participants.filter(p => prev?.winners?.includes(p.id));
        }
        const inMatchSet = new Set(round.matches.flatMap(m => [m.idA, m.idB]));
        const free       = available.filter(p => !inMatchSet.has(p.id));

        const freeOpts = free.map(p =>
            `<option value="${p.id}">${p.name}${p.deckName ? ' · ' + p.deckName : ''}</option>`).join('');

        const form = locked ? `<p class="torneo-round-done">✅ Ronda ${round.number} finalizada — ver Brackets para siguiente ronda</p>` : `
            <div class="torneo-add-match-form">
                <div class="torneo-add-match-row">
                    <select id="torneo-match-a" class="config-input">
                        <option value="">Jugador A...</option>${freeOpts}
                    </select>
                    <span class="torneo-vs-label">VS</span>
                    <select id="torneo-match-b" class="config-input">
                        <option value="">Jugador B...</option>${freeOpts}
                    </select>
                    <button class="btn btn-primary" onclick="Torneo.addMatch()">+ Match</button>
                </div>
                <button class="btn btn-sm torneo-swiss-btn" onclick="Torneo.runSwiss()">🎲 Swiss (Aleatorio)</button>
            </div>`;

        const matchesHTML = round.matches.length === 0
            ? `<p class="stats-empty">Sin enfrentamientos en esta ronda.</p>`
            : round.matches.map((m, i) => this._renderMatchItem(m, i, locked, round)).join('');

        return `${form}<div class="torneo-matches-list" id="torneo-matches-list">${matchesHTML}</div>`;
    },

    _renderMatchItem: function (m, idx, locked, round) {
        const pA = this.data.participants.find(p => p.id === m.idA);
        const pB = this.data.participants.find(p => p.id === m.idB);
        if (!pA || !pB) return '';

        const aWin = m.winsA > m.winsB, bWin = m.winsB > m.winsA;
        const aCol = aWin ? '#00b894' : m.winsA < m.winsB ? '#d63031' : '#fdcb6e';
        const bCol = bWin ? '#00b894' : m.winsB < m.winsA ? '#d63031' : '#fdcb6e';

        // Deck selector for round 2+
        const deckSelA = round.number > 1 && !locked
            ? `<select class="config-input torneo-deck-mini"
                       onchange="Torneo.changeMatchDeck('${m.id}','A',this.value)">
                   ${this._buildDeckOptions(m.deckNameA || pA.deckName)}
               </select>`
            : `<span class="torneo-p-deck">${m.deckNameA || pA.deckName || '—'}</span>`;

        const deckSelB = round.number > 1 && !locked
            ? `<select class="config-input torneo-deck-mini"
                       onchange="Torneo.changeMatchDeck('${m.id}','B',this.value)">
                   ${this._buildDeckOptions(m.deckNameB || pB.deckName)}
               </select>`
            : `<span class="torneo-p-deck">${m.deckNameB || pB.deckName || '—'}</span>`;

        return `
            <div class="torneo-match-item">
                <!-- Jugador A -->
                <div class="torneo-match-side torneo-match-left">
                    ${this._renderThumb(pA, true)}
                    <div class="torneo-p-info">
                        <span class="torneo-p-name">${pA.name}</span>
                        ${deckSelA}
                    </div>
                </div>

                <!-- Centro: scores -->
                <div class="torneo-match-center">
                    ${locked
                        ? `<span class="torneo-score-final">${m.winsA}–${m.winsB}</span>`
                        : `<div class="torneo-score-controls">
                               <div class="torneo-score-col">
                                   <button class="ts-btn ts-up"   onclick="Torneo.changeWins('${m.id}','A', 1)">＋</button>
                                   <span class="ts-num" style="color:${aCol}">${m.winsA}</span>
                                   <button class="ts-btn ts-down" onclick="Torneo.changeWins('${m.id}','A',-1)">－</button>
                               </div>
                               <span class="torneo-vs-label">–</span>
                               <div class="torneo-score-col">
                                   <button class="ts-btn ts-up"   onclick="Torneo.changeWins('${m.id}','B', 1)">＋</button>
                                   <span class="ts-num" style="color:${bCol}">${m.winsB}</span>
                                   <button class="ts-btn ts-down" onclick="Torneo.changeWins('${m.id}','B',-1)">－</button>
                               </div>
                           </div>
                           <button class="torneo-remove-match-btn" onclick="Torneo.removeMatch('${m.id}')" title="Eliminar match">✕</button>`}
                </div>

                <!-- Jugador B -->
                <div class="torneo-match-side torneo-match-right">
                    <div class="torneo-p-info" style="text-align:right;">
                        <span class="torneo-p-name">${pB.name}</span>
                        ${deckSelB}
                    </div>
                    ${this._renderThumb(pB, true)}
                </div>
            </div>`;
    },

    _buildDeckOptions: function (currentDeck) {
        const saved = this._getSavedDeckNames();
        const meta  = this._getMetaDeckList();
        const opts  = [
            ...saved.map(n    => ({ val: `saved::${n}`, label: `🃏 ${n}`, sel: n === currentDeck })),
            ...meta.map(({ folder, name }) => ({ val: `meta::${folder}::${name}`, label: `⚔️ ${name}`, sel: name === currentDeck }))
        ];
        return opts.map(o => `<option value="${o.val}" ${o.sel ? 'selected' : ''}>${o.label}</option>`).join('');
    },

    addMatch: function () {
        const selA = document.getElementById('torneo-match-a');
        const selB = document.getElementById('torneo-match-b');
        const idA  = selA?.value, idB = selB?.value;
        if (!idA || !idB || idA === idB) { alert('Selecciona dos jugadores distintos.'); return; }
        const round = this._currentRound();
        if (round.finalized) return;
        const used = round.matches.flatMap(m => [m.idA, m.idB]);
        if (used.includes(idA) || used.includes(idB)) { alert('Uno o ambos jugadores ya están en un match.'); return; }
        const pA = this.data.participants.find(p => p.id === idA);
        const pB = this.data.participants.find(p => p.id === idB);
        round.matches.push({
            id: 'm_' + Date.now() + Math.random().toString(36).slice(2, 5),
            idA, idB, winsA: 0, winsB: 0,
            deckNameA: pA?.deckName || '',
            deckNameB: pB?.deckName || ''
        });
        this.save();
        this._refreshMatches();
        this._refreshParticipantes();
    },

    removeMatch: function (matchId) {
        const round = this._currentRound();
        if (round.finalized) return;
        round.matches = round.matches.filter(m => m.id !== matchId);
        this.save();
        this._refreshMatches();
        this._refreshParticipantes();
    },

    changeWins: function (matchId, side, delta) {
        const round = this._currentRound();
        if (round.finalized) return;
        const m = round.matches.find(m => m.id === matchId);
        if (!m) return;
        if (side === 'A') m.winsA = Math.max(0, m.winsA + delta);
        else              m.winsB = Math.max(0, m.winsB + delta);
        this.save();
        this._refreshMatches();
    },

    changeMatchDeck: function (matchId, side, val) {
        const round = this._currentRound();
        const m     = round.matches.find(m => m.id === matchId);
        if (!m) return;
        const parts  = val.split('::');
        const dName  = parts[0] === 'saved' ? parts[1] : parts[2];
        const pId    = side === 'A' ? m.idA : m.idB;
        if (side === 'A') m.deckNameA = dName;
        else              m.deckNameB = dName;
        const p = this.data.participants.find(p => p.id === pId);
        if (p) {
            if (!p.deckHistory.includes(dName)) p.deckHistory.push(dName);
            if (parts[0] === 'saved') this._applyDeckFromSaved(p, dName);
            else if (parts[0] === 'meta') this._applyDeckFromMeta(p, parts[1], parts[2]);
        }
        this.save();
    },

    runSwiss: function () {
        const round = this._currentRound();
        if (round.finalized) return;
        let available;
        if (round.number === 1) {
            available = this.data.participants;
        } else {
            const prev = this._getRound(round.number - 1);
            available  = this.data.participants.filter(p => prev?.winners?.includes(p.id));
        }
        const inMatch = new Set(round.matches.flatMap(m => [m.idA, m.idB]));
        const free    = available.filter(p => !inMatch.has(p.id));

        if (free.length < 2)      { alert('No hay suficientes jugadores disponibles.'); return; }
        if (free.length % 2 !== 0) {
            alert(`⚠️ Hay ${free.length} jugadores disponibles (número impar).\nDeben ser un número par para usar Swiss.`);
            return;
        }
        const shuffled = [...free].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length; i += 2) {
            const pA = shuffled[i], pB = shuffled[i + 1];
            round.matches.push({
                id: 'm_' + Date.now() + '_' + i,
                idA: pA.id, idB: pB.id,
                winsA: 0, winsB: 0,
                deckNameA: pA.deckName || '',
                deckNameB: pB.deckName || ''
            });
        }
        this.save();
        this._refreshMatches();
        this._refreshParticipantes();
    },

    // ─────────────────────────────────────────────
    renderBrackets: function () {
        const d = this.data;
        if (d.participants.length === 0) return `<p class="stats-empty">Sin participantes.</p>`;
        const round   = this._getRound(this.viewRound);
        if (!round)   return `<p class="stats-empty">Sin ronda.</p>`;
        const locked  = round.finalized;

        // Build all rounds as columns
        let bracketHTML = '<div class="torneo-bracket-scroll"><div class="torneo-bracket-inner">';
        for (let rn = 1; rn <= this.viewRound; rn++) {
            const r = this._getRound(rn);
            if (!r || r.matches.length === 0) continue;
            bracketHTML += `<div class="bracket-col">
                <div class="bracket-col-label">Ronda ${rn}</div>
                <div class="bracket-col-matches">`;
            r.matches.forEach(m => {
                const pA = d.participants.find(p => p.id === m.idA);
                const pB = d.participants.find(p => p.id === m.idB);
                if (!pA || !pB) return;
                const aWon = m.winsA > m.winsB, bWon = m.winsB > m.winsA;
                bracketHTML += `
                    <div class="bracket-match-box">
                        <div class="bracket-player ${r.finalized ? (aWon ? 'bp-winner' : 'bp-loser') : ''}">
                            <span class="bp-name">${pA.name}</span>
                            <span class="bp-score">${m.winsA}</span>
                        </div>
                        <div class="bracket-player ${r.finalized ? (bWon ? 'bp-winner' : 'bp-loser') : ''}">
                            <span class="bp-name">${pB.name}</span>
                            <span class="bp-score">${m.winsB}</span>
                        </div>
                    </div>`;
            });
            bracketHTML += `</div></div>`;
        }
        bracketHTML += '</div></div>';

        const finalizeBtn = !locked ? `
            <button class="btn btn-primary torneo-finalize-btn" onclick="Torneo.finalizeRound()">
                🏁 Finalizar Ronda ${round.number}
            </button>` : `<div class="torneo-round-done">✓ Ronda ${round.number} finalizada</div>`;

        return `<div class="torneo-brackets-wrap">${finalizeBtn}${bracketHTML}</div>`;
    },

    finalizeRound: function () {
        const round = this._currentRound();
        if (round.finalized) return;
        if (round.matches.length === 0) { alert('No hay matches en esta ronda.'); return; }
        if (!confirm(`¿Finalizar Ronda ${round.number}? Esta acción no se puede deshacer.`)) return;

        const winners = [], losers = [];
        round.matches.forEach(m => {
            if (m.winsA > m.winsB)      { winners.push(m.idA); losers.push(m.idB); }
            else if (m.winsB > m.winsA) { winners.push(m.idB); losers.push(m.idA); }
            else                         { losers.push(m.idA, m.idB); }
        });

        round.finalized = true;
        round.winners   = winners;
        round.losers    = losers;

        this._updatePoints(round);
        this._addToHistorial(round);

        if (winners.length >= 2) {
            this.data.rounds.push({
                number: round.number + 1,
                matches: [], finalized: false, winners: [], losers: []
            });
            this.viewRound = round.number + 1;
        } else {
            this.data.status = 'finished';
        }

        this.save();
        this.render();
        this.showMainTab('brackets');
        this.setViewRound(this.viewRound);
    },

    _updatePoints: function (round) {
        if (!this.data.points) this.data.points = {};
        round.matches.forEach(m => {
            const a = this.data.points[m.idA] || { wins:0, losses:0, gameWins:0, gameLosses:0, pts:0 };
            const b = this.data.points[m.idB] || { wins:0, losses:0, gameWins:0, gameLosses:0, pts:0 };
            a.gameWins   += m.winsA; a.gameLosses += m.winsB;
            b.gameWins   += m.winsB; b.gameLosses += m.winsA;
            if (m.winsA > m.winsB)      { a.wins++; a.pts += 3; b.losses++; }
            else if (m.winsB > m.winsA) { b.wins++; b.pts += 3; a.losses++; }
            else                         { a.losses++; b.losses++; }
            this.data.points[m.idA] = a;
            this.data.points[m.idB] = b;
        });
    },

    _addToHistorial: function (round) {
        round.matches.forEach(m => {
            const pA   = this.data.participants.find(p => p.id === m.idA);
            const pB   = this.data.participants.find(p => p.id === m.idB);
            const win  = m.winsA > m.winsB ? 'A' : m.winsB > m.winsA ? 'B' : 'draw';
            this.data.historial.push({
                round:  round.number,
                nameA:  pA?.name || '?', deckA: m.deckNameA || pA?.deckName || '—',
                nameB:  pB?.name || '?', deckB: m.deckNameB || pB?.deckName || '—',
                winsA:  m.winsA, winsB: m.winsB, winner: win,
                ptsWon: win === 'draw' ? 0 : 3
            });
        });
    },

    // ─────────────────────────────────────────────
    renderHistorial: function () {
        const h = this.data.historial || [];
        if (h.length === 0) return `<p class="stats-empty">Sin historial. Finaliza una ronda para registrar resultados.</p>`;

        const byRound = {};
        h.forEach(e => { if (!byRound[e.round]) byRound[e.round] = []; byRound[e.round].push(e); });

        return Object.entries(byRound).map(([rn, entries]) => `
            <div class="historial-round-block">
                <div class="historial-round-label">Ronda ${rn}</div>
                ${entries.map(e => {
                    const resTag = e.winner === 'draw'
                        ? `<span class="historial-tag historial-draw">Empate</span>`
                        : `<span class="historial-tag historial-win">+${e.ptsWon} pts → ${e.winner === 'A' ? e.nameA : e.nameB}</span>`;
                    return `
                    <div class="historial-row">
                        <div class="historial-side ${e.winner === 'A' ? 'hs-winner' : e.winner === 'draw' ? 'hs-draw' : 'hs-loser'}">
                            <span class="historial-name">${e.nameA}</span>
                            <span class="historial-deck">${e.deckA}</span>
                            <span class="historial-score">${e.winsA}</span>
                        </div>
                        <div class="historial-center">${resTag}</div>
                        <div class="historial-side hs-right ${e.winner === 'B' ? 'hs-winner' : e.winner === 'draw' ? 'hs-draw' : 'hs-loser'}">
                            <span class="historial-score">${e.winsB}</span>
                            <span class="historial-deck">${e.deckB}</span>
                            <span class="historial-name">${e.nameB}</span>
                        </div>
                    </div>`; }).join('')}
            </div>`).join('');
    },

    // ─────────────────────────────────────────────
    renderPuntos: function () {
        const pts   = this.data.points || {};
        const parts = this.data.participants;
        if (Object.keys(pts).length === 0)
            return `<p class="stats-empty">Sin datos de puntos. Finaliza al menos una ronda.</p>`;

        const ranked = parts.map(p => ({
            ...p, stats: pts[p.id] || { wins:0, losses:0, gameWins:0, gameLosses:0, pts:0 }
        })).sort((a, b) => b.stats.pts !== a.stats.pts ? b.stats.pts - a.stats.pts : b.stats.gameWins - a.stats.gameWins);

        const top = (i) => {
            const n = i + 1;
            if (n === 1) return '🥇'; if (n === 2) return '🥈'; if (n === 3) return '🥉';
            if (n <= 4)   return `<span class="top-label top-4">Top 4</span>`;
            if (n <= 8)   return `<span class="top-label top-8">Top 8</span>`;
            if (n <= 16)  return `<span class="top-label top-16">Top 16</span>`;
            if (n <= 32)  return `<span class="top-label top-32">Top 32</span>`;
            return `#${n}`;
        };

        return `
            <div class="puntos-table">
                <div class="puntos-header">
                    <span>Pos</span><span>Jugador</span><span>Deck(s)</span>
                    <span>W</span><span>L</span><span>GW</span><span>GL</span><span>Pts</span>
                </div>
                ${ranked.map((p, i) => {
                    const decks = [p.deckName, ...(p.deckHistory||[])].filter(Boolean).filter((v,j,a) => a.indexOf(v)===j).join(', ');
                    const cls   = i < 4 ? 'puntos-row puntos-top4' : i < 8 ? 'puntos-row puntos-top8' : 'puntos-row';
                    return `
                    <div class="${cls}">
                        <span class="puntos-pos">${top(i)}</span>
                        <span class="puntos-name">${p.name}</span>
                        <span class="puntos-decks">${decks || '—'}</span>
                        <span class="puntos-val pv-green">${p.stats.wins}</span>
                        <span class="puntos-val pv-red">${p.stats.losses}</span>
                        <span class="puntos-val">${p.stats.gameWins}</span>
                        <span class="puntos-val">${p.stats.gameLosses}</span>
                        <span class="puntos-pts">${p.stats.pts}</span>
                    </div>`; }).join('')}
            </div>`;
    },

    // ─────────────────────────────────────────────
    openDeckPanel: function (playerId) {
        const p = this.data.participants.find(p => p.id === playerId);
        if (!p) return;
        document.getElementById('torneo-deck-panel-overlay')?.remove();

        const cardData = p.cardData || {};
        const byLoc    = { main: [], extra: [], side: [] };
        Object.entries(cardData).forEach(([id, v]) => {
            if (byLoc[v.location]) byLoc[v.location].push([id, v]);
        });

        const countMain  = byLoc.main.reduce((s,[,v]) => s + v.qty, 0);
        const countExtra = byLoc.extra.reduce((s,[,v]) => s + v.qty, 0);
        const countSide  = byLoc.side.reduce((s,[,v]) => s + v.qty, 0);

        const renderGrid = (cards) => cards.length === 0 ? '' : `
            <div class="tdp-cards-grid">${cards.map(([id, v]) => `
                <div class="tdp-card">
                    <img src="${v.img || `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`}"
                         alt="${v.name}" onerror="this.src=''">
                    <span class="tdp-qty">x${v.qty}</span>
                </div>`).join('')}
            </div>`;

        const ov = document.createElement('div');
        ov.id    = 'torneo-deck-panel-overlay';
        ov.className = 'tdp-overlay';
        ov.innerHTML = `
            <div class="tdp-panel">
                <button class="tdp-close" onclick="document.getElementById('torneo-deck-panel-overlay').remove()">✕</button>
                <h3 class="tdp-title">${p.deckName || 'Deck'}</h3>
                <div class="tdp-subtitle">${p.name}</div>
                <div class="tdp-counts">Main: ${countMain} · Extra: ${countExtra} · Side: ${countSide}</div>
                ${byLoc.main.length  ? `<div class="tdp-loc-label">Main Deck</div>${renderGrid(byLoc.main)}`   : ''}
                ${byLoc.extra.length ? `<div class="tdp-loc-label">Extra Deck</div>${renderGrid(byLoc.extra)}` : ''}
                ${byLoc.side.length  ? `<div class="tdp-loc-label">Side Deck</div>${renderGrid(byLoc.side)}`   : ''}
                ${!countMain && !countExtra && !countSide ? '<p class="stats-empty">Sin datos de cartas para este deck.</p>' : ''}
            </div>`;
        ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
        document.body.appendChild(ov);
    },

    // ─────────────────────────────────────────────
    newTorneo: function () {
        if (!confirm('⚠️ ¿Crear nuevo torneo? Se borrarán todos los datos del torneo actual (incluyendo localStorage). Esta acción no se puede deshacer.')) return;
        const name     = prompt('Nombre del nuevo torneo:', 'Mi Torneo') || 'Mi Torneo';
        this.data      = this._empty(name.trim());
        this.viewRound = 1;
        this.save();
        this.render();
    },

    renameTorneo: function () {
        const name = prompt('Nombre del torneo:', this.data.name);
        if (name?.trim()) { this.data.name = name.trim(); this.save(); this.render(); }
    },

    exportTxt: function () {
        const d   = this.data;
        const pts = d.points   || {};
        const h   = d.historial || [];
        const S   = '='.repeat(60);

        const ranked = d.participants.map(p => ({
            ...p, stats: pts[p.id] || { wins:0, losses:0, gameWins:0, gameLosses:0, pts:0 }
        })).sort((a, b) => b.stats.pts !== a.stats.pts ? b.stats.pts - a.stats.pts : b.stats.gameWins - a.stats.gameWins);

        let txt = `DESTINY DRAW – REPORTE DE TORNEO\n`;
        txt += `Torneo:      ${d.name}\n`;
        txt += `Fecha:       ${new Date().toLocaleDateString('es-ES')}\n`;
        txt += `Participantes: ${d.participants.length}\n`;
        txt += `Rondas:      ${d.rounds.filter(r => r.finalized).length}\n\n`;

        txt += `${S}\nRANKING FINAL\n${S}\n`;
        ranked.forEach((p, i) => {
            const decks = [p.deckName, ...(p.deckHistory||[])].filter(Boolean).filter((v,j,a)=>a.indexOf(v)===j).join(', ');
            txt += `#${i+1}  ${p.name}  |  ${decks||'—'}  |  Pts: ${p.stats.pts}  W:${p.stats.wins} L:${p.stats.losses}  GW:${p.stats.gameWins} GL:${p.stats.gameLosses}\n`;
        });

        txt += `\n${S}\nHISTORIAL DE RONDAS\n${S}\n`;
        let lastR = 0;
        h.forEach(e => {
            if (e.round !== lastR) { txt += `\n--- Ronda ${e.round} ---\n`; lastR = e.round; }
            const res = e.winner === 'draw' ? 'Empate' : e.winner === 'A' ? `Ganó ${e.nameA}` : `Ganó ${e.nameB}`;
            txt += `  ${e.nameA} (${e.deckA})  ${e.winsA}–${e.winsB}  ${e.nameB} (${e.deckB})  → ${res}\n`;
        });

        txt += `\n${S}\nGenerado con Destiny Draw\n${S}\n`;

        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = `${d.name.replace(/[^a-z0-9]/gi,'_')}_torneo.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    // ─────────────────────────────────────────────
    _currentRound: function () { return this.data.rounds[this.data.rounds.length - 1]; },
    _getRound:     function (n) { return this.data.rounds.find(r => r.number === n) || null; },

    _getSavedDeckNames: function () {
        const names = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k?.startsWith('deck_')) names.push(k.replace('deck_', ''));
        }
        return names.sort((a, b) => a.localeCompare(b));
    },

    _getMetaDeckList: function () {
        const m = window.Estadisticas?.metaDecks || {};
        const r = [];
        for (const [folder, decks] of Object.entries(m)) (decks||[]).forEach(d => r.push({ folder, name: d.filename }));
        return r.sort((a, b) => a.name.localeCompare(b.name));
    },

    _refreshParticipantes: function () {
        const el  = document.getElementById('torneo-tab-participantes');
        if (el) el.innerHTML = this.renderParticipantes();
        const btn = document.getElementById('ttab-participantes');
        if (btn) btn.innerHTML = `👥 Participantes <span class="torneo-tab-count">${this.data.participants.length}</span>`;
    },

    _refreshMatches: function () {
        const el = document.getElementById('torneo-tab-matches');
        if (el) el.innerHTML = this.renderMatches();
    }
};

window.Torneo = Torneo;
document.addEventListener('DOMContentLoaded', () => Torneo.init());



// ── Duelo — simulador de duelo por turnos con control de LP ──

const DueloEnVivo = {

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
        activeInteract: null,
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
                        data-section-id="sim-timer"
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

        if (scope === 'md' && this.md.activeInteract) {
            this._startPlayerTimer(this.md.activeInteract);
        }
    },

    stdStop: function (scope) {
        const state = scope === 'md' ? this.md.std : this.std;
        clearInterval(state._interval);
        state.running = false;

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
    _buildMDPane: function () {
        const md      = this.md;
        const turnCol = md.currentTurn === 'A' ? '#1a6bbd' : '#bd1a1a';

        return `
        <div class="duelo-md-wrap">

            <!-- Fila superior: Cronómetro Estándar + Marcador -->
            <div class="duelo-md-std-row">
                <div class="duelo-md-std-main">

                ${!window.ContentManager || ContentManager.isVisible('sim-timer')
                    ? `<div class="duelo-md-clock-score-row">
                    <div class="duelo-std-display" id="std-md-display">${this._fmt(this.md.std.remaining)}</div>
                    <div class="duelo-md-score-block">
                        <span class="duelo-md-score" id="md-score-a">${this.md.winsA ?? 0}</span>
                        <span class="duelo-md-score-sep"> — </span>
                        <span class="duelo-md-score" id="md-score-b">${this.md.winsB ?? 0}</span>
                    </div>
                </div>`
                    : ''}
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

    // Presionar tu botón INACTIVO → tomas el turno de interacción
    setInteraction: function (p) {
        const md    = this.md;
        const other = p === 'A' ? 'B' : 'A';

        if (md.activeInteract === p) {
            this._stopPlayerTimer(p);
            md.activeInteract = other;
            this._startPlayerTimer(other);
        } else if (md.activeInteract === other) {
            this._stopPlayerTimer(other);
            md.activeInteract = p;
            this._startPlayerTimer(p);
        } else {
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

    // +30s al jugador que acaba de terminar su turno
    nextTurn: function () {
        const md           = this.md;
        const justFinished = md.currentTurn;

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



// ── Hipergeometria — calculadora de probabilidades hipergeométricas para análisis de mano inicial ──

const Hipergeometria = {

    CARD_BACK: 'https://images.ygoprodeck.com/images/cards/back.jpg',

    // ── ESTADO ───────────────────────────────────────────────────
    _searchResults:   [],
    _searchTimeout:   null,
    _allDecks:        [],
    _deckCardsCopy:   {},
    _targetCardIds:   {},
    _drawnCards:      [],
    _deckRemaining:   0,
    _selectedDeckIdx: null,
    // Estado Mulligan
_mul: {
    pool:      [],
    hand:      [],
    outside:   [],
    deckMeta:  null
},

    // ═══════════════════════════════════════════════════

    combination: function (n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n - k) k = n - k;
        let r = 1;
        for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
        return r;
    },

    // P(X = k)
    hyperExact: function (N, n, M, k) {
        if (k < 0 || k > n || k > M || (M - k) > (N - n)) return 0;
        return (this.combination(n, k) * this.combination(N - n, M - k)) / this.combination(N, M);
    },

    // P(X ≥ x)
    hyperAtLeast: function (N, n, M, x) {
        let p = 0;
        const maxK = Math.min(n, M);
        for (let k = x; k <= maxK; k++) p += this.hyperExact(N, n, M, k);
        return Math.min(1, Math.max(0, p));
    },

    // ═══════════════════════════════════════════════════

    init: function () {
},

renderInto: function (container) {
    if (!container) return;
    if (container.querySelector('#hiper-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'hiper-wrapper';
    wrapper.innerHTML = this._buildHTML();
    container.appendChild(wrapper);
    this._calcQuick();
},

    // ═══════════════════════════════════════════════════

    _buildHTML: function () {
        const back = this.CARD_BACK;
        return `
<div class="hiper-header">
    🎲 Probabilidad de Robo — Calculadora de Hipergeometria <span id="hiper-arrow">▼</span>
</div>
<div id="hiper-sec">

    <p class="hiper-intro">
        Basado en la <strong>distribución hipergeométrica</strong>, este calculador determina la probabilidad
        exacta de robar una carta específica. La fórmula es
        <em>P(X ≥ x) = Σ C(n,k)·C(N−n, M−k) / C(N,M)</em> — sin reemplazo, al contrario de la binomial,
        por lo que es matemáticamente exacta para barajas finitas como en Yu-Gi-Oh!.
        N = tamaño del deck, n = copias de la carta, M = cartas robadas, x = mínimo deseado.
    </p>

    <div class="hiper-tabs">
        <button class="hiper-tab-btn active" id="hiper-tb-quick" onclick="Hipergeometria.switchTab('quick')">⚡ Cálculo Estandar</button>
        <button class="hiper-tab-btn" id="hiper-tb-deck" onclick="Hipergeometria.switchTab('deck')">🗂️ Calculo con Mis Decks</button>
        <button class="hiper-tab-btn" id="hiper-tb-mul" onclick="Hipergeometria.switchTab('mul')">🃏 Prueba Mulligan</button>
    </div>

    <!-- ══════════ TAB CÁLCULO RÁPIDO ══════════ -->
    <div id="hiper-pane-quick" class="hiper-pane">

        <div class="hiper-quick-layout">

            <!-- Carta objetivo -->
            <div class="hiper-card-slot" onclick="Hipergeometria.openSearch()">
                <img id="hq-card-img" src="${back}" class="hiper-card-img" alt="Carta A">
                <div id="hq-card-name" class="hiper-card-label">Carta A</div>
                <div class="hiper-card-hint">Toca para buscar</div>
            </div>

            <!-- Campos numéricos -->
            <div class="hiper-inputs-col">
                <label class="hiper-label">
                    📦 Tamaño del Main Deck (N)
                    <input type="number" id="hq-N" class="hiper-input"
                           value="40" min="1" max="60" oninput="Hipergeometria._calcQuick()">
                </label>
                <label class="hiper-label">
                    🃏 Copias en el deck (n)
                    <input type="number" id="hq-n" class="hiper-input"
                           value="3" oninput="Hipergeometria._calcQuick()">
                </label>
                <label class="hiper-label">
                    ✋ Cartas en mano inicial (M)
                    <input type="number" id="hq-M" class="hiper-input"
                           value="5" oninput="Hipergeometria._calcQuick()">
                </label>
                <label class="hiper-label hiper-label-hl">
                    🎯 ¿Cuántas mínimo quisieras ver? (x)
                    <input type="number" id="hq-x" class="hiper-input"
                           value="1"oninput="Hipergeometria._calcQuick()">
                </label>
            </div>
        </div>

        <div id="hq-results" class="hiper-results"></div>
        <div id="hq-chart"   class="hiper-chart-area"></div>
    </div>

    <!-- ══════════ TAB CON MIS DECKS ══════════ -->
    <div id="hiper-pane-deck" class="hiper-pane" style="display:none">
        <div class="hiper-deck-layout">

            <!-- Sidebar lista de decks -->
            <div class="hiper-deck-sidebar">
                <div class="hiper-deck-sidebar-title">Selecciona un Deck</div>
                <div id="hiper-deck-list" class="hiper-deck-list">
                    <div class="hiper-deck-empty">Cargando decks...</div>
                </div>
            </div>

            <!-- Panel principal (visible tras elegir deck) -->
            <div id="hiper-deck-panel" class="hiper-deck-panel" style="display:none">

                <!-- Fila superior: decklist + simulación de mano -->
                <div class="hiper-deck-two-col">

                    <!-- Mini decklist -->
                    <div class="hiper-minideck-wrap">
                        <div class="hiper-minideck-title" id="hiper-minideck-title">Main Deck</div>
                        <div class="hiper-field-info">
                            Objetivo seleccionado (n): <strong id="hd-n-val">0</strong>
                            <br><small>Toca una carta para añadirla como objetivo. Se acumula con cada tap.</small>
                        </div>
                        <div id="hiper-minideck-grid" class="hiper-minideck-grid"></div>
                    </div>

                    <!-- Simulación de mano -->
                    <div class="hiper-handsim">
                        <div class="hiper-handsim-title">Simula tu mano inicial</div>

                        <div class="hiper-pile-area">
                            <img src="${back}" class="hiper-pile-img"
                                 onclick="Hipergeometria.drawCard()" title="Toca para robar una carta">
                            <div class="hiper-pile-count" id="hd-pile-count">Main Deck: 0</div>
                        </div>

                        <div class="hiper-hand-label">
                            Mano (M = <strong><span id="hd-M-val">0</span></strong>):
                        </div>
                        <div id="hiper-hand-area" class="hiper-hand-area">
                            <div class="hiper-hand-empty">Toca el deck para robar</div>
                        </div>

                        <button class="hiper-reset-btn" onclick="Hipergeometria._resetHandSim()">
                            🔄 Resetear
                        </button>
                    </div>
                </div>

                <!-- Controles de cálculo + resultados -->
                <div class="hiper-deck-bottom">
                    <div class="hiper-field-info">
                        Main Deck (N): <strong id="hd-N-val">0</strong>
                    </div>
                    <label class="hiper-label hiper-label-hl">
                        🎯 ¿Cuántas mínimo quisieras ver? (x)
                        <input type="number" id="hd-x" class="hiper-input"
                               value="1" min="1" max="3" oninput="Hipergeometria._calcDeck()">
                    </label>
                    <div id="hd-results" class="hiper-results"></div>
                    <div id="hd-chart"   class="hiper-chart-area"></div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- ══════════ TAB PRUEBA MULLIGAN ══════════ -->
    <div id="hiper-pane-mul" class="hiper-pane" style="display:none">
        <div class="hiper-deck-layout">

            <!-- Lista de decks -->
            <div class="hiper-deck-sidebar">
                <div class="hiper-deck-sidebar-title">Selecciona un Deck</div>
                <div id="hiper-mul-deck-list" class="hiper-deck-list">
                    <div class="hiper-deck-empty">Cargando decks...</div>
                </div>
            </div>

            <!-- Panel mulligan -->
            <div id="hiper-mul-panel" class="hiper-deck-panel" style="display:none">

                <div class="mul-deck-info" id="mul-deck-info"></div>

                <!-- Deck (carta boca abajo clickeable) + mano -->
                <div class="mul-play-area">

                    <div class="mul-col-deck">
                        <div class="mul-zone-title">Deck</div>
                        <img src="https://images.ygoprodeck.com/images/cards/back.jpg"
                             class="mul-deck-pile"
                             onclick="Hipergeometria.mulDrawOne()"
                             title="Robar una carta">
                        <div class="mul-pile-count" id="mul-pile-count">0</div>
                    </div>

                    <div class="mul-col-hand">
                        <div class="mul-zone-title">Mano (<span id="mul-hand-count">0</span>)</div>
                        <div id="mul-hand-area" class="mul-hand-area"></div>
                    </div>

                </div>

                <!-- Zona fuera de juego -->
                <div class="mul-outside-wrap">
                    <div class="mul-zone-title">
                        Cementerio / Banishment
                        <span class="mul-outside-hint">(toca una carta para devolverla al deck)</span>
                    </div>
                    <div id="mul-outside-area" class="mul-outside-area">
                        <div class="hiper-hand-empty">Vacío</div>
                    </div>
                </div>

                <button class="hiper-reset-btn" style="margin-top:10px"
                        onclick="Hipergeometria.mulReset()">🔄 Resetear</button>
            </div>
        </div>
    </div>
<!-- ══════════ MODAL BUSCADOR ══════════ -->
<div id="hiper-modal" class="hiper-modal" style="display:none"
     onclick="Hipergeometria._modalBgClose(event)">
    <div class="hiper-modal-box">
        <div class="hiper-modal-header">
            <span>Buscar Carta</span>
            <button class="hiper-modal-close" onclick="Hipergeometria.closeSearch()">✕</button>
        </div>
        <input type="text" id="hiper-search-input" class="hiper-search-input"
               placeholder="Nombre de la carta..."
               oninput="Hipergeometria._onSearchInput()">
        <div id="hiper-search-results" class="hiper-search-results">
            <div class="hiper-search-hint">Escribe al menos 2 caracteres</div>
        </div>
    </div>
</div>`;
    },

    // ═══════════════════════════════════════════════════

    toggleSection: function () {
        const sec   = document.getElementById('hiper-sec');
        const arrow = document.getElementById('hiper-arrow');
        if (!sec) return;
        const show = sec.style.display === 'none';
        sec.style.display = show ? '' : 'none';
        if (arrow) arrow.textContent = show ? '▲' : '▼';
        if (show) this._loadDeckList();
    },

    switchTab: function (tab) {
    const tabs = ['quick', 'deck', 'mul'];
    tabs.forEach(t => {
        const pane = document.getElementById(`hiper-pane-${t}`);
        const btn  = document.getElementById(`hiper-tb-${t}`);
        if (pane) pane.style.display = (t === tab) ? '' : 'none';
        if (btn)  btn.classList.toggle('active', t === tab);
    });
    if (tab === 'deck') this._loadDeckList();
    if (tab === 'mul')  this._loadMulDeckList();
},

    // ═══════════════════════════════════════════════════

    _calcQuick: function () {
        const N = parseInt(document.getElementById('hq-N')?.value) || 40;
        const n = parseInt(document.getElementById('hq-n')?.value) || 3;
        const M = parseInt(document.getElementById('hq-M')?.value) || 5;
        const x = parseInt(document.getElementById('hq-x')?.value) || 1;
        this._renderResults('hq-results', 'hq-chart', N, n, M, x);
    },

    // ═══════════════════════════════════════════════════

    _renderResults: function (resId, chartId, N, n, M, x) {
        const resEl   = document.getElementById(resId);
        const chartEl = document.getElementById(chartId);
        if (!resEl) return;

        if (x > n || x > M || n > N || N < 1 || n < 1 || M < 1) {
            resEl.innerHTML = '<div class="hiper-warn">⚠️ Parámetros inválidos. Verifica que x ≤ n, x ≤ M y n ≤ N.</div>';
            if (chartEl) chartEl.innerHTML = '';
            return;
        }

        const prob    = this.hyperAtLeast(N, n, M, x);
        const pct     = (prob * 100).toFixed(1);
        const in10    = (prob * 10).toFixed(1);

        // Duelo completo: deck empieza en N-M cartas, termina en ~25 (aprox 15 cartas robadas durante el duelo)
        const extraDraws = Math.min(15, N - M);
        const Mfull      = Math.min(N, M + extraDraws);
        const probFull   = this.hyperAtLeast(N, n, Mfull, x);
        const pctFull    = (probFull * 100).toFixed(1);

        const col = p => p >= 0.70 ? '#00b894' : p >= 0.45 ? '#fdcb6e' : '#d63031';

        resEl.innerHTML = `
<div class="hiper-res-grid">
    <div class="hiper-res-card" style="border-color:${col(prob)}">
        <div class="hiper-res-val" style="color:${col(prob)}">${pct}%</div>
        <div class="hiper-res-label">Probabilidad de ver al menos ${x} en la mano inicial (M=${M})</div>
    </div>
    <div class="hiper-res-card">
        <div class="hiper-res-val">${in10}</div>
        <div class="hiper-res-label">Lo verías en ~${in10} de cada 10 duelos</div>
    </div>
    <div class="hiper-res-card" style="border-color:${col(probFull)}">
        <div class="hiper-res-val" style="color:${col(probFull)}">${pctFull}%</div>
        <div class="hiper-res-label">Durante el duelo completo (~${Mfull} cartas robadas)</div>
    </div>
</div>`;

        if (chartEl) this._renderTurnChart(chartEl, N, n, M, x);
    },

    _renderTurnChart: function (container, N, n, M, x) {
        const maxM   = Math.min(N - n, M + 20);
        const points = [];
        for (let m = 1; m <= maxM; m++) {
            points.push({ m, p: this.hyperAtLeast(N, n, m, x) });
        }

        const H    = 72;
        const bars = points.map(pt => {
            const h   = Math.round(pt.p * H);
            const pct = (pt.p * 100).toFixed(0);
            const c   = pt.p >= 0.70 ? '#00b894' : pt.p >= 0.45 ? '#fdcb6e' : '#d63031';
            const cur = pt.m === M;
            return `
<div class="hiper-tbar ${cur ? 'hiper-tbar-cur' : ''}">
    <div class="hiper-tbar-pct">${pct}%</div>
    <div class="hiper-tbar-fill" style="height:${h}px;background:${c}"></div>
    <div class="hiper-tbar-lbl">${pt.m}</div>
</div>`;
        }).join('');

        container.innerHTML = `
<div class="hiper-chart-title">📈 Probabilidad acumulada según cartas robadas</div>
<div class="hiper-chart-scroll">
    <div class="hiper-chart-bars" style="height:${H + 44}px">${bars}</div>
</div>
<div class="hiper-chart-legend">
    Eje X = total de cartas robadas del deck · El recuadro blanco marca tu M actual
</div>`;
    },

    // ═══════════════════════════════════════════════════

    openSearch: function () {
        document.getElementById('hiper-modal').style.display = 'flex';
        const inp = document.getElementById('hiper-search-input');
        if (inp) { inp.value = ''; inp.focus(); }
        document.getElementById('hiper-search-results').innerHTML =
            '<div class="hiper-search-hint">Escribe al menos 2 caracteres</div>';
    },

    closeSearch: function () {
        document.getElementById('hiper-modal').style.display = 'none';
    },

    _modalBgClose: function (e) {
        if (e.target.id === 'hiper-modal') this.closeSearch();
    },

    _onSearchInput: function () {
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => this._doSearch(), 380);
    },

    _doSearch: async function () {
        const q   = document.getElementById('hiper-search-input')?.value?.trim();
        const box = document.getElementById('hiper-search-results');
        if (!box || !q || q.length < 2) return;

        box.innerHTML = '<div class="hiper-search-loading">Buscando...</div>';

        try {
            const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}&num=10&offset=0`);
            const data = await res.json();

            if (!data.data?.length) {
                box.innerHTML = '<div class="hiper-search-empty">Sin resultados</div>';
                return;
            }

            this._searchResults = data.data;

            box.innerHTML = data.data.map((card, i) => {
                const img = card.card_images?.[0]?.image_url_small || this.CARD_BACK;
                return `
<div class="hiper-sitem">
    <img src="${img}" class="hiper-sitem-img" loading="lazy">
    <div class="hiper-sitem-name">${card.name}</div>
    <button class="hiper-add-btn" onclick="Hipergeometria._selectCard(${i})">Agregar</button>
</div>`;
            }).join('');

        } catch (e) {
            box.innerHTML = '<div class="hiper-search-empty">Error de conexión</div>';
        }
    },

    _selectCard: function (idx) {
        const card = this._searchResults[idx];
        if (!card) return;
        const img = card.card_images?.[0]?.image_url_small || this.CARD_BACK;
        document.getElementById('hq-card-img').src          = img;
        document.getElementById('hq-card-name').textContent = card.name;
        if (window.Banlist) {
            const st = Banlist.getStatus?.(card.id);
            const copiesMap = { banned: 0, limited: 1, 'semi-limited': 2 };
            const copies = copiesMap[st] ?? 3;
            if (copies > 0) document.getElementById('hq-n').value = copies;
        }
        this.closeSearch();
        this._calcQuick();
    },

    // ═══════════════════════════════════════════════════

    _loadDeckList: function () {
        const container = document.getElementById('hiper-deck-list');
        if (!container) return;

        const saved = window.Deck ? Deck.getSavedDecks() : [];
        const meta  = this._getMetaDeckList();
        const all   = [
            ...saved.map(d => ({ name: d.name, cards: d.cards, tag: '💾', isMeta: false })),
            ...meta
        ];
        this._allDecks = all;

        if (!all.length) {
            container.innerHTML = '<div class="hiper-deck-empty">No hay decks disponibles</div>';
            return;
        }

        container.innerHTML = all.map((deck, i) => {
            const mainN = Object.values(deck.cards || {})
                .filter(c => c.location === 'main')
                .reduce((s, c) => s + (c.qty || 1), 0);
            return `
<div class="hiper-deck-item" onclick="Hipergeometria._selectDeck(${i})">
    <span class="hiper-deck-tag">${deck.tag}</span>
    <span class="hiper-dname">${deck.name}</span>
    <span class="hiper-dtag">${mainN}</span>
</div>`;
        }).join('');
    },

    _getMetaDeckList: function () {
        const result = [];
        if (!window.Estadisticas?.metaDecks) return result;
        Object.entries(Estadisticas.metaDecks).forEach(([folder, decks]) => {
            (decks || []).forEach(deck => {
                if (!deck.sections) return;
                const freq  = deck.cardFrequency || {};
                const cards = {};
                const seen  = new Set();
                const addCards = (ids, loc) => ids.forEach(id => {
                    const sid = String(id);
                    if (!seen.has(sid)) {
                        seen.add(sid);
                        cards[sid] = {
                            qty:      freq[sid] || 1,
                            location: loc,
                            data:     { id: sid, name: `#${sid}`, type: 'Unknown',
                                        card_images: [{ image_url_small: this.CARD_BACK }] }
                        };
                    }
                });
                addCards(deck.sections.main  || [], 'main');
                addCards(deck.sections.extra || [], 'extra');
                addCards(deck.sections.side  || [], 'side');
                result.push({
                    name:   `${deck.filename}`,
                    cards,
                    tag:    '🌐',
                    isMeta: true,
                    _raw:   deck
                });
            });
        });
        return result;
    },


    _selectDeck: async function (idx) {
        const deck = this._allDecks[idx];
        if (!deck) return;

        this._selectedDeckIdx = idx;
        this._targetCardIds   = {};
        this._drawnCards      = [];

        document.getElementById('hiper-deck-panel').style.display = '';
        document.getElementById('hiper-minideck-title').textContent = deck.name;
        document.getElementById('hd-n-val').textContent  = '0';
        document.getElementById('hd-M-val').textContent  = '0';
        document.getElementById('hd-results').innerHTML  = '';
        document.getElementById('hd-chart').innerHTML    = '';

        this._deckCardsCopy = {};
        Object.entries(deck.cards || {}).forEach(([id, item]) => {
            if (item.location !== 'main') return;
            this._deckCardsCopy[String(id)] = {
                data:        item.data || { id, name: `#${id}`, card_images: [{ image_url_small: this.CARD_BACK }] },
                originalQty: item.qty || 1,
                remaining:   item.qty || 1
            };
        });

        if (deck.isMeta) {
            await this._fetchMetaCardData();
        }

        const mainN = Object.values(this._deckCardsCopy)
            .reduce((s, c) => s + c.originalQty, 0);
        this._deckRemaining = mainN;

        document.getElementById('hd-N-val').textContent    = mainN;
        document.getElementById('hd-pile-count').textContent = `Main Deck: ${mainN}`;

        document.querySelectorAll('.hiper-deck-item').forEach((el, i) => {
            el.classList.toggle('hiper-deck-item-active', i === idx);
        });

        this._renderMiniDecklist();
        this._renderHandArea();
        this._calcDeck();
    },

    _fetchMetaCardData: async function () {
        const ids = Object.keys(this._deckCardsCopy);
        if (!ids.length) return;

        const loading = document.getElementById('hiper-minideck-grid');
        if (loading) loading.innerHTML = '<div class="hiper-loading">Cargando cartas...</div>';

        const chunks = [];
        for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));

        try {
            for (const chunk of chunks) {
                const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${chunk.join(',')}`);
                const data = await res.json();
                (data.data || []).forEach(card => {
                    const sid = String(card.id);
                    if (this._deckCardsCopy[sid]) this._deckCardsCopy[sid].data = card;
                });
            }
        } catch (e) {
            console.warn('[Hipergeometria] Error fetcheando cartas del meta:', e);
        }
    },

    // ═══════════════════════════════════════════════════

    _renderMiniDecklist: function () {
        const grid = document.getElementById('hiper-minideck-grid');
        if (!grid) return;

        const entries = Object.entries(this._deckCardsCopy)
            .sort((a, b) => (a[1].data?.name || '').localeCompare(b[1].data?.name || ''));

        grid.innerHTML = entries.map(([id, item]) => {
            const img  = item.data?.card_images?.[0]?.image_url_small || this.CARD_BACK;
            const rem  = item.remaining;
            const sel  = this._targetCardIds[id] || 0;
            const gray = rem <= 0;
            return `
<div class="hiper-mc ${gray ? 'hiper-mc-gray' : ''}"
     onclick="${gray ? '' : `Hipergeometria._tapTargetCard('${id}')`}"
     title="${item.data?.name || id}">
    <img src="${img}" class="hiper-mc-img" loading="lazy">
    <div class="hiper-mc-rem ${rem === 0 ? 'hiper-mc-rem-zero' : ''}">x${rem}</div>
    ${sel > 0 ? `<div class="hiper-mc-sel">▶${sel}</div>` : ''}
</div>`;
        }).join('');
    },

    _tapTargetCard: function (id) {
        const item = this._deckCardsCopy[id];
        if (!item || item.remaining <= 0) return;

        item.remaining--;
        this._targetCardIds[id] = (this._targetCardIds[id] || 0) + 1;

        const total = Object.values(this._targetCardIds).reduce((s, v) => s + v, 0);
        document.getElementById('hd-n-val').textContent = total;

        this._renderMiniDecklist();
        this._calcDeck();
    },

    // ═══════════════════════════════════════════════════

    drawCard: function () {
        if (this._deckRemaining <= 0) return;

        // Probabilidad de robar una carta objetivo (sin reemplazo)
        const totalTarget = Object.values(this._targetCardIds).reduce((s, v) => s + v, 0);
        const drawnTarget = this._drawnCards.filter(c => c.isTarget).length;
        const targLeft    = Math.max(0, totalTarget - drawnTarget);
        const prob        = targLeft / this._deckRemaining;
        const isTarget    = Math.random() < prob;

        this._drawnCards.push({ isTarget });
        this._deckRemaining--;

        document.getElementById('hd-pile-count').textContent = `Main Deck: ${this._deckRemaining}`;
        document.getElementById('hd-M-val').textContent       = this._drawnCards.length;

        this._renderHandArea();
        this._calcDeck();
    },

    _renderHandArea: function () {
        const container = document.getElementById('hiper-hand-area');
        if (!container) return;

        if (!this._drawnCards.length) {
            container.innerHTML = '<div class="hiper-hand-empty">Toca el deck para robar</div>';
            return;
        }

        // Imagen de la primera carta objetivo (si hay una seleccionada)
        const firstTargetId = Object.keys(this._targetCardIds).find(id => this._targetCardIds[id] > 0);
        const targetImg = firstTargetId
            ? (this._deckCardsCopy[firstTargetId]?.data?.card_images?.[0]?.image_url_small || this.CARD_BACK)
            : this.CARD_BACK;

        container.innerHTML = this._drawnCards.map(c => `
<div class="hiper-hcard ${c.isTarget ? 'hiper-hcard-target' : ''}">
    <img src="${c.isTarget ? targetImg : this.CARD_BACK}" class="hiper-hcard-img">
    ${c.isTarget ? '<div class="hiper-hcard-star">★</div>' : ''}
</div>`).join('');
    },

    _resetHandSim: function () {
        if (this._selectedDeckIdx === null) return;
        this._selectDeck(this._selectedDeckIdx);
    },

    // ═══════════════════════════════════════════════════

    _calcDeck: function () {
        const N = parseInt(document.getElementById('hd-N-val')?.textContent) || 0;
        const n = Object.values(this._targetCardIds).reduce((s, v) => s + v, 0);
        const M = this._drawnCards.length || 5;
        const x = parseInt(document.getElementById('hd-x')?.value) || 1;

        const resEl = document.getElementById('hd-results');
        if (!resEl) return;

        if (N === 0 || n === 0) {
            resEl.innerHTML = '<div class="hiper-warn">Selecciona al menos una carta objetivo.</div>';
            document.getElementById('hd-chart').innerHTML = '';
            return;
        }

        this._renderResults('hd-results', 'hd-chart', N, n, Math.max(M, 1), x);
    },
// ═══════════════════════════════════════════════════

_loadMulDeckList: function () {
    const container = document.getElementById('hiper-mul-deck-list');
    if (!container) return;

    const saved = window.Deck ? Deck.getSavedDecks() : [];
    const meta  = this._getMetaDeckList();
    const all   = [
        ...saved.map(d => ({ name: d.name, cards: d.cards, tag: '💾', isMeta: false })),
        ...meta
    ];
    this._allDecks = this._allDecks?.length ? this._allDecks : all;

    if (!all.length) {
        container.innerHTML = '<div class="hiper-deck-empty">No hay decks disponibles</div>';
        return;
    }

    container.innerHTML = all.map((deck, i) => {
        const mainN = Object.values(deck.cards || {})
            .filter(c => c.location === 'main')
            .reduce((s, c) => s + (c.qty || 1), 0);
        return `
<div class="hiper-deck-item" onclick="Hipergeometria.mulSelectDeck(${i})">
    <span class="hiper-deck-tag">${deck.tag}</span>
    <span class="hiper-dname">${deck.name}</span>
    <span class="hiper-dtag">${mainN}</span>
</div>`;
    }).join('');
},

mulSelectDeck: async function (idx) {
    if (!this._allDecks?.length) this._loadMulDeckList();
    const deck = this._allDecks[idx];
    if (!deck) return;

    document.getElementById('hiper-mul-panel').style.display = '';
    document.querySelectorAll('#hiper-mul-deck-list .hiper-deck-item')
        .forEach((el, i) => el.classList.toggle('hiper-deck-item-active', i === idx));

    // Construir pool: una entrada por copia
    const pool = [];
    Object.entries(deck.cards || {}).forEach(([id, item]) => {
        if (item.location !== 'main') return;
        const qty  = item.qty || 1;
        const data = item.data || { id, name: `#${id}`,
                        card_images: [{ image_url_small: this.CARD_BACK }] };
        for (let i = 0; i < qty; i++) pool.push({ ...data });
    });

    if (deck.isMeta && pool.length) {
        const missing = pool.filter(c => !c.card_images?.[0]?.image_url_small ||
                                         c.card_images[0].image_url_small === this.CARD_BACK);
        if (missing.length) {
            const ids = [...new Set(missing.map(c => String(c.id)))];
            try {
                const chunks = [];
                for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i+50));
                for (const chunk of chunks) {
                    const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${chunk.join(',')}`);
                    const data = await res.json();
                    (data.data || []).forEach(card => {
                        pool.forEach(c => { if (String(c.id) === String(card.id)) Object.assign(c, card); });
                    });
                }
            } catch (e) { console.warn('[Mulligan] Error fetch:', e); }
        }
    }

    this._mulShuffle(pool);
    this._mul.pool    = pool;
    this._mul.hand    = [];
    this._mul.outside = [];
    this._mul.deckMeta = { name: deck.name, totalMain: pool.length };

    for (let i = 0; i < Math.min(5, pool.length); i++) {
        this._mul.hand.push(this._mul.pool.shift());
    }

    document.getElementById('mul-deck-info').textContent = deck.name;
    this._mulRenderAll();
},

_mulShuffle: function (arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
},

mulDrawOne: function () {
    if (!this._mul.pool.length) return;
    const card = this._mul.pool.shift();
    this._mul.hand.push(card);
    this._mulRenderAll();
},

mulTapCard: function (zone, idx) {
    document.querySelectorAll('.mul-card-overlay').forEach(o => o.remove());
    document.querySelectorAll('.mul-card-active').forEach(c => c.classList.remove('mul-card-active'));

    const el = document.querySelector(`[data-mul-zone="${zone}"][data-mul-idx="${idx}"]`);
    if (!el) return;

    el.classList.add('mul-card-active');

    const overlay = document.createElement('div');
    overlay.className = 'mul-card-overlay';

    if (zone === 'hand') {
        overlay.innerHTML = `
<button class="mul-action-btn mul-btn-return"
        onclick="Hipergeometria.mulReturn('hand',${idx}); event.stopPropagation();">Devolver</button>
<button class="mul-action-btn mul-btn-discard"
        onclick="Hipergeometria.mulDiscard(${idx}); event.stopPropagation();">Descartar</button>`;
    } else if (zone === 'outside') {
        overlay.innerHTML = `
<button class="mul-action-btn mul-btn-return"
        onclick="Hipergeometria.mulReturn('outside',${idx}); event.stopPropagation();">↩ Al Deck</button>`;
    }

    el.appendChild(overlay);

    setTimeout(() => {
        document.addEventListener('click', function close(e) {
            if (!el.contains(e.target)) {
                overlay.remove();
                el.classList.remove('mul-card-active');
                document.removeEventListener('click', close);
            }
        });
    }, 10);
},

mulReturn: function (zone, idx) {
    const arr  = zone === 'hand' ? this._mul.hand : this._mul.outside;
    const card = arr.splice(idx, 1)[0];
    if (card) {
        this._mul.pool.push(card);
        this._mulShuffle(this._mul.pool);
    }
    document.querySelectorAll('.mul-card-overlay').forEach(o => o.remove());
    document.querySelectorAll('.mul-card-active').forEach(c => c.classList.remove('mul-card-active'));
    this._mulRenderAll();
},

mulDiscard: function (idx) {
    const card = this._mul.hand.splice(idx, 1)[0];
    if (card) this._mul.outside.push(card);
    document.querySelectorAll('.mul-card-overlay').forEach(o => o.remove());
    document.querySelectorAll('.mul-card-active').forEach(c => c.classList.remove('mul-card-active'));
    this._mulRenderAll();
},

mulReset: function () {
    if (!this._mul.deckMeta) return;
    // Reunir todas las cartas
    const all = [...this._mul.pool, ...this._mul.hand, ...this._mul.outside];
    this._mulShuffle(all);
    this._mul.pool    = all;
    this._mul.hand    = [];
    this._mul.outside = [];
    for (let i = 0; i < Math.min(5, this._mul.pool.length); i++) {
        this._mul.hand.push(this._mul.pool.shift());
    }
    this._mulRenderAll();
},

_mulRenderAll: function () {
    // Contador deck
    const pileEl = document.getElementById('mul-pile-count');
    if (pileEl) pileEl.textContent = this._mul.pool.length;

    // Contador mano
    const handCountEl = document.getElementById('mul-hand-count');
    if (handCountEl) handCountEl.textContent = this._mul.hand.length;

    // Mano
    const handEl = document.getElementById('mul-hand-area');
    if (handEl) {
        if (!this._mul.hand.length) {
            handEl.innerHTML = '<div class="hiper-hand-empty">Sin cartas en mano</div>';
        } else {
            handEl.innerHTML = this._mul.hand.map((card, i) => {
                const img = card.card_images?.[0]?.image_url_small || this.CARD_BACK;
                return `
<div class="mul-card" data-mul-zone="hand" data-mul-idx="${i}"
     onclick="Hipergeometria.mulTapCard('hand',${i})" title="${card.name || ''}">
    <img src="${img}" class="mul-card-img">
</div>`;
            }).join('');
        }
    }

    // Cementerio / Banishment
    const outsideEl = document.getElementById('mul-outside-area');
    if (outsideEl) {
        if (!this._mul.outside.length) {
            outsideEl.innerHTML = '<div class="hiper-hand-empty">Vacío</div>';
        } else {
            outsideEl.innerHTML = this._mul.outside.map((card, i) => {
                const img = card.card_images?.[0]?.image_url_small || this.CARD_BACK;
                return `
<div class="mul-card mul-card-outside" data-mul-zone="outside" data-mul-idx="${i}"
     onclick="Hipergeometria.mulTapCard('outside',${i})" title="${card.name || ''}">
    <img src="${img}" class="mul-card-img">
</div>`;
            }).join('');
        }
    }
},
};

window.Hipergeometria = Hipergeometria;
document.addEventListener('DOMContentLoaded', () => {
});