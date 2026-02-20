/* ====================================
   TORNEO MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Sistema de Torneo de Duelos
   ==================================== */

const Torneo = {
    STORAGE_KEY: 'yugioh_torneo_actual',
    data:        null,
    viewRound:   1,
    _pendingYDK: null,   // datos de .ydk esperando ser asignados a un participante
    simTab: 'torneo',

    // ─────────────────────────────────────────────
    // ESTRUCTURA VACÍA
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
    // PERSISTENCIA
    // ─────────────────────────────────────────────
    load: function () {
        try {
            const raw  = localStorage.getItem(this.STORAGE_KEY);
            this.data  = raw ? JSON.parse(raw) : this._empty('Mi Torneo');
            // Asegurar estructura mínima ante datos viejos
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
    // INIT & RENDER PRINCIPAL
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

        // Shell de Simuladores: se crea una sola vez para no destruir DueloEnVivo
    if (!document.getElementById('sim-torneo-content')) {
        this.container.innerHTML = `
            <h2>Simuladores</h2>
            <div class="sim-main-tabs">
                <button class="sim-tab-btn active" data-simtab="torneo"
                        onclick="Torneo.showSimTab('torneo')">🏆 Torneo</button>
                <button class="sim-tab-btn" data-simtab="duelo"
                        onclick="Torneo.showSimTab('duelo')">⚔️ Duelo en Vivo</button>
            </div>
            <div id="sim-torneo-content"></div>
            <div id="sim-duelo-content" style="display:none;"></div>`;
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

    showSimTab: function (tab) {
    this.simTab = tab;
    document.querySelectorAll('.sim-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.simtab === tab);
    });
    const torneoEl = document.getElementById('sim-torneo-content');
    const dueloEl  = document.getElementById('sim-duelo-content');
    if (torneoEl) torneoEl.style.display = tab === 'torneo' ? '' : 'none';
    if (dueloEl) {
        dueloEl.style.display = tab === 'duelo' ? '' : 'none';
        if (tab === 'duelo' && window.DueloEnVivo) DueloEnVivo.renderInto(dueloEl);
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
    // PARTICIPANTES
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
            cardData:    {},    // id → { name, qty, location }
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
    // LISTA DE ENFRENTAMIENTOS
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
    // BRACKETS
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
            else                         { losers.push(m.idA, m.idB); }   // empate = doble derrota
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
    // HISTORIAL
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
    // PUNTOS
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
    // DECK PANEL FLOTANTE
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
    // TORNEO: NUEVO / RENOMBRAR / EXPORTAR
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
    // HELPERS
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
