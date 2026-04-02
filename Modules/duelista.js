/* ====================================
   DUELISTA MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Perfil del jugador: nivel, winrate global,
   mejores decks. Basado en datos de Winrate.
   ==================================== */

const Duelista = {

    // Niveles por duelos totales
    LEVELS: [
        { min: 0,    label: 'Novato',         icon: '🥚' },
        { min: 10,   label: 'Aprendiz',        icon: '🌱' },
        { min: 25,   label: 'Duelista',        icon: '⚡' },
        { min: 50,   label: 'Rival',           icon: '🔥' },
        { min: 100,  label: 'Competidor',      icon: '🏅' },
        { min: 200,  label: 'Semi-Pro',        icon: '💎' },
        { min: 400,  label: 'Pro',             icon: '👑' },
        { min: 800,  label: 'Élite',           icon: '🌟' },
        { min: 1500, label: 'Legendario',      icon: '🐉' },
    ],

    getLevel: function (totalDuels) {
        let level = this.LEVELS[0];
        for (const l of this.LEVELS) {
            if (totalDuels >= l.min) level = l;
            else break;
        }
        // Próximo nivel
        const idx  = this.LEVELS.indexOf(level);
        const next = this.LEVELS[idx + 1] || null;
        return { ...level, next, totalDuels };
    },

    // Agrega todos los records de todos los decks guardados
    getGlobalStats: function () {
        if (!window.Winrate) return null;
        const all    = Winrate.getAllRecords();
        let w1 = 0, l1 = 0, w2 = 0, l2 = 0;

        Object.values(all).forEach(r => {
            w1 += r.wins1st   || 0;
            l1 += r.losses1st || 0;
            w2 += r.wins2nd   || 0;
            l2 += r.losses2nd || 0;
        });

        return {
            wins1st:   w1, losses1st: l1,
            wins2nd:   w2, losses2nd: l2,
            totalWins:   w1 + w2,
            totalLosses: l1 + l2,
            totalDuels:  w1 + l1 + w2 + l2,
            wr1st:  Winrate.calcWinrate(w1, l1),
            wr2nd:  Winrate.calcWinrate(w2, l2),
            wrAll:  Winrate.calcWinrate(w1 + w2, l1 + l2)
        };
    },

    getBestDecks: function () {
        if (!window.Winrate || !window.Deck) return null;
        const all    = Winrate.getAllRecords();
        const result = { general: null, going1st: null, going2nd: null };

        let bestAll = -1, best1st = -1, best2nd = -1;

        Object.entries(all).forEach(([name, r]) => {
            const total = r.wins1st + r.losses1st + r.wins2nd + r.losses2nd;
            if (total < 5) return; // mínimo de duelos para ser significativo

            const all  = Winrate.calcWinrate(r.wins1st + r.wins2nd, r.losses1st + r.losses2nd);
            const go1  = Winrate.calcWinrate(r.wins1st, r.losses1st);
            const go2  = Winrate.calcWinrate(r.wins2nd, r.losses2nd);

            if (all !== null && all > bestAll) { bestAll = all; result.general  = { name, pct: all,  duels: total }; }
            if (go1 !== null && go1 > best1st) { best1st = go1; result.going1st = { name, pct: go1, duels: r.wins1st + r.losses1st }; }
            if (go2 !== null && go2 > best2nd) { best2nd = go2; result.going2nd = { name, pct: go2, duels: r.wins2nd + r.losses2nd }; }
        });

        return result;
    },

    renderSection: function () {
        if (!window.Winrate) {
            return `<p class="stats-empty">Módulo de Winrate no disponible.</p>`;
        }

        const g = this.getGlobalStats();
        if (!g || g.totalDuels === 0) {
            return `
                <div class="duelista-empty">
                    <div class="duelista-empty-icon">🥚</div>
                    <p>Aún no tienes duelos registrados.</p>
                    <small>Ve a <strong>Estadísticas → Winrate del Deck</strong> y empieza a registrar tus partidas.</small>
                </div>`;
        }

        const lv    = this.getLevel(g.totalDuels);
        const best  = this.getBestDecks();
        const wrCol = (p) => p === null ? 'rgba(255,255,255,0.3)' : p >= 60 ? '#00b894' : p >= 45 ? '#fdcb6e' : '#d63031';

        // Barra de progreso al siguiente nivel
        const progressBar = lv.next
            ? `<div class="duelista-progress-track">
                   <div class="duelista-progress-bar"
                        style="width:${Math.min(100, Math.round(((g.totalDuels - lv.min) / (lv.next.min - lv.min)) * 100))}%">
                   </div>
               </div>
               <div class="duelista-progress-label">
                   ${g.totalDuels - lv.min} / ${lv.next.min - lv.min} para ${lv.next.icon} ${lv.next.label}
               </div>`
            : `<div class="duelista-progress-label">Nivel máximo alcanzado 🏆</div>`;

        const bestDeckRow = (deck, label) => deck
            ? `<div class="duelista-best-row">
                   <span class="duelista-best-label">${label}</span>
                   <span class="duelista-best-name">${deck.name}</span>
                   <span class="duelista-best-pct" style="color:${wrCol(deck.pct)}">${deck.pct}%</span>
                   <span class="duelista-best-duels">(${deck.duels})</span>
               </div>`
            : `<div class="duelista-best-row"><span class="duelista-best-label">${label}</span><span class="duelista-best-duels">Sin datos suficientes (mín. 5 duelos)</span></div>`;

        return `
            <div class="duelista-card">

                <!-- Nivel -->
                <div class="duelista-level-block">
                    <div class="duelista-level-icon">${lv.icon}</div>
                    <div class="duelista-level-info">
                        <div class="duelista-level-label">${lv.label}</div>
                        <div class="duelista-level-duels">${g.totalDuels} duelos totales</div>
                    </div>
                </div>
                ${progressBar}

                <div class="duelista-divider"></div>

                <!-- Winrate como jugador -->
                <div class="duelista-subtitle">Winrate como Jugador</div>
                <div class="duelista-wr-grid">
                    <div class="duelista-wr-cell">
                        <div class="duelista-wr-val" style="color:${wrCol(g.wrAll)}">
                            ${g.wrAll !== null ? g.wrAll + '%' : '—'}
                        </div>
                        <div class="duelista-wr-tag">General</div>
                        <div class="duelista-wr-detail">${g.totalWins}V · ${g.totalLosses}D</div>
                    </div>
                    <div class="duelista-wr-cell">
                        <div class="duelista-wr-val" style="color:${wrCol(g.wr1st)}">
                            ${g.wr1st !== null ? g.wr1st + '%' : '—'}
                        </div>
                        <div class="duelista-wr-tag">Going 1st</div>
                        <div class="duelista-wr-detail">${g.wins1st}V · ${g.losses1st}D</div>
                    </div>
                    <div class="duelista-wr-cell">
                        <div class="duelista-wr-val" style="color:${wrCol(g.wr2nd)}">
                            ${g.wr2nd !== null ? g.wr2nd + '%' : '—'}
                        </div>
                        <div class="duelista-wr-tag">Going 2nd</div>
                        <div class="duelista-wr-detail">${g.wins2nd}V · ${g.losses2nd}D</div>
                    </div>
                </div>

                <div class="duelista-divider"></div>

                <!-- Mejores decks -->
                <div class="duelista-subtitle">Winrate del Deck</div>
                <div class="duelista-best-list">
                    ${bestDeckRow(best?.general,  '🏆 Mayor WR')}
                    ${bestDeckRow(best?.going1st, '⚡ Mejor 1st')}
                    ${bestDeckRow(best?.going2nd, '🛡️ Mejor 2nd')}
                </div>

            </div>`;
    },

    refreshSection: function () {
        const el = document.getElementById('duelista-content');
        if (el) el.innerHTML = this.renderSection();
    }
};

window.Duelista = Duelista;