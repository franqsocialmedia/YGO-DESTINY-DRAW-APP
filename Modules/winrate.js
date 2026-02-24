/* ====================================
   WINRATE MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Registro de victorias/derrotas por deck
   Going 1st y Going 2nd
   ==================================== */

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

    // ── Modificar contadores ─────────────────────────────────────
    // going: '1st' | '2nd'
    // type:  'wins' | 'losses'
    // delta: +1 | -1

    change: function (going, type, delta) {
        const deckName = window.Deck?.name;
        if (!deckName) return;

        const rec = this.getRecord(deckName);
        const key = type + going; // 'wins1st' | 'losses2nd' etc.

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
        // ── Leer desde storage independiente (no ligado a deck) ──
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
            <button class="wr-reset-btn" onclick="Winrate.resetStandalone()">↺ Reiniciar contadores</button>`;
    },

    refreshSection: function () {
        const el = document.getElementById('winrate-sec');
        if (el) el.innerHTML = this.renderSection();
    },
    // ── Winrate standalone (Simuladores — independiente de deck) ─
    STANDALONE_KEY: 'pz_winrate_standalone',

    _getStandaloneRecord: function () {
        try {
            return JSON.parse(localStorage.getItem(this.STANDALONE_KEY)) || {
                wins1st: 0, losses1st: 0, wins2nd: 0, losses2nd: 0
            };
        } catch (_) {
            return { wins1st: 0, losses1st: 0, wins2nd: 0, losses2nd: 0 };
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
        this._saveStandaloneRecord({ wins1st: 0, losses1st: 0, wins2nd: 0, losses2nd: 0 });
        this.refreshSection();
    },
};

window.Winrate = Winrate;