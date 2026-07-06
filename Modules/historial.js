/* historial.js — Registro de partidas, winrate por deck y perfil del duelista */
/* Absorbe: matchups.js, duelista.js */


// ── Matchups — historial de enfrentamientos por deck: W/L going 1st/2nd, overlay panel, persistencia por matchup_${deckName} ──

const Matchups = {

    STORAGE_PREFIX: 'matchup_',
    _sortBy: 'duelos',           // 'duelos' | 'victorias' | 'derrotas'
    _activeFilterDeck: null,     // nombre exacto del deck seleccionado para filtrar Historial de Sesiones

    // ─── PERSISTENCIA ────────────────────────────────────────
    _key: function () {
        return this.STORAGE_PREFIX + (window.Deck?.name || '');
    },

    getAll: function () {
        try {
            const list = JSON.parse(localStorage.getItem(this._key())) || [];
            return list.map(m => {
                if (m.wins1st !== undefined) return m;
                return {
                    ...m,
                    wins1st:   m.wins   || 0,
                    losses1st: m.losses || 0,
                    wins2nd:   0,
                    losses2nd: 0,
                };
            });
        } catch (_) { return []; }
    },

    save: function (list) {
        try { localStorage.setItem(this._key(), JSON.stringify(list)); }
        catch (_) {}
    },

    _uid: function () {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    },
_totals: function (m) {
        const w = (m.wins1st||0) + (m.wins2nd||0);
        const l = (m.losses1st||0) + (m.losses2nd||0);
        return { w, l, total: w + l };
    },
    // ─── RENDER DE SECCIÓN (llamado desde deck.js render) ────
    renderSection: function () {
        if (!window.Deck?.name) return '';

        const count = this.getAll().length;
        const rows  = this._renderRows();

        return `
            <h3 class="deck-section-title" onclick="Deck.toggleSection('matchups-sec')">
                ⚔️ Historial de Enfrentamientos <span class="matchup-count-badge">${count}</span>
            </h3>
            <div id="matchups-sec" class="deck-section-content" style="display:none;">
                <div class="matchup-toolbar">
                    <button class="matchup-btn matchup-btn-add"
                            onclick="Matchups.openAddPanel()">＋ Agregar enfrentamiento</button>
                    ${count > 0 ? `<button class="matchup-btn matchup-btn-clear"
                            onclick="Matchups.clearAll()">🗑 Borrar todo</button>` : ''}
                    ${count > 1 ? `<select class="matchup-sort-sel" onchange="Matchups.setSortBy(this.value)">
                        <option value="duelos"    ${this._sortBy==='duelos'?'selected':''}>Ordenar: Duelos</option>
                        <option value="victorias" ${this._sortBy==='victorias'?'selected':''}>Ordenar: Victorias</option>
                        <option value="derrotas"  ${this._sortBy==='derrotas'?'selected':''}>Ordenar: Derrotas</option>
                    </select>` : ''}
                </div>
                <div class="matchup-list" id="matchup-list">
                    ${rows}
                </div>
            </div>`;
    },

    // Genera las filas ordenadas según _sortBy, resaltando el deck filtrado si aplica
    _renderRows: function () {
        const list = this.getAll();
        if (!list.length) return `<p class="matchup-empty">Sin enfrentamientos registrados aún.</p>`;

        const sorted = list
            .map((m, i) => ({ m, i, ...this._totals(m) }))
            .sort((a, b) => {
                if (this._sortBy === 'victorias') return b.w - a.w;
                if (this._sortBy === 'derrotas')  return b.l - a.l;
                return b.total - a.total;
            });

        let rows = '';
        sorted.forEach(({ m, i, w, l, total }) => {
            const pct   = total > 0 ? Math.round((w / total) * 100) : null;
            const col   = pct === null ? 'rgba(255,255,255,0.3)' : pct >= 60 ? '#00b894' : pct >= 45 ? '#fdcb6e' : '#d63031';
            const hasDeck = m.cardData && Object.keys(m.cardData).length > 0;
            const wr1pct = (m.wins1st||0)+(m.losses1st||0) > 0
                ? Math.round(((m.wins1st||0) / ((m.wins1st||0)+(m.losses1st||0))) * 100) : null;
            const wr2pct = (m.wins2nd||0)+(m.losses2nd||0) > 0
                ? Math.round(((m.wins2nd||0) / ((m.wins2nd||0)+(m.losses2nd||0))) * 100) : null;
            const isSelected = this._activeFilterDeck === m.opponentName;
            const safeName = (m.opponentName || '').replace(/'/g, "\\'");

            rows += `
            <div class="matchup-row${isSelected ? ' matchup-row-selected' : ''}" id="matchup-row-${i}">
                <div class="matchup-row-main" onclick="Matchups.selectDeckFilter('${safeName}')">
                    <div class="matchup-opponent-name">${m.opponentName || '—'}</div>
                    <div class="matchup-stats">
                        <span class="matchup-wr" style="color:${col}">
                            ${w}W – ${l}L${pct !== null ? ` · ${pct}%` : ''}
                        </span>
                        <span class="matchup-wr-detail">
                            1ro: ${m.wins1st||0}W/${m.losses1st||0}L${wr1pct!==null?` (${wr1pct}%)`:''}
                            &nbsp;·&nbsp;
                            2do: ${m.wins2nd||0}W/${m.losses2nd||0}L${wr2pct!==null?` (${wr2pct}%)`:''}
                        </span>
                    </div>
                    <div class="matchup-row-btns">
                        ${hasDeck ? `<button class="matchup-btn matchup-btn-deck"
                            onclick="event.stopPropagation();Matchups.openDeckPanel(${i})">🃏 Ver Deck</button>` : ''}
                        <button class="matchup-btn matchup-btn-edit"
                                onclick="event.stopPropagation();Matchups.openEditPanel(${i})">✏️ Editar</button>
                        <button class="matchup-btn matchup-btn-del"
                                onclick="event.stopPropagation();Matchups.deleteRecord(${i})">✕</button>
                    </div>
                </div>
                ${m.notes ? `<div class="matchup-notes-preview">${m.notes}</div>` : ''}
            </div>`;
        });
        return rows;
    },

    setSortBy: function (key) {
        this._sortBy = key;
        this._refreshList();
    },

    // Selección exclusiva de deck: filtra "Historial de Sesiones" en Optimización
    selectDeckFilter: function (name) {
        this._activeFilterDeck = (this._activeFilterDeck === name) ? null : name;
        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane && window.Deck) pane.innerHTML = Deck.renderOptimizacionPane();
    },

    clearDeckFilter: function () {
        this._activeFilterDeck = null;
        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane && window.Deck) pane.innerHTML = Deck.renderOptimizacionPane();
    },

    // Refresca solo la lista interna (evita re-render completo del deck)
    _refreshList: function () {
        const listEl  = document.getElementById('matchup-list');
        const badgeEl = document.querySelector('.matchup-count-badge');
        if (!listEl) { if (window.Deck) Deck.render(); return; }

        badgeEl && (badgeEl.textContent = this.getAll().length);
        listEl.innerHTML = this._renderRows();
    },

    // ─── PANEL AGREGAR ────────────────────────────────────────
    openAddPanel: function () {
        this._closeOverlay();

        // Decks guardados y del meta disponibles
        const savedNames = this._getSavedDeckNames();
        const metaList   = this._getMetaDeckList();

        const savedOpts = savedNames.map(n =>
            `<option value="saved::${n}">🃏 ${n}</option>`).join('');
        const metaOpts = metaList.map(({ folder, name }) =>
            `<option value="meta::${folder}::${name}">⚔️ ${name} (${folder})</option>`).join('');

        const ov = document.createElement('div');
        ov.id = 'matchup-overlay';
        ov.className = 'matchup-overlay';
        ov.innerHTML = `
            <div class="matchup-panel">
                <button class="matchup-panel-close"
                        onclick="Matchups._closeOverlay()">✕</button>
                <h3 class="matchup-panel-title">Agregar Enfrentamiento</h3>

                <!-- Nombre del oponente -->
                <label class="matchup-label">Nombre del deck/oponente</label>
                <input type="text" id="mu-name" class="matchup-input"
                       placeholder="Ej: Dragon Link, Snake-Eye Fire King...">

                <!-- Resultado yendo primero -->
                <label class="matchup-label">Yendo 1ro</label>
                <div class="matchup-wr-row">
                    <div class="matchup-wr-field">
                        <label class="matchup-label matchup-label-sm">Victorias</label>
                        <input type="number" id="mu-w1" class="matchup-input matchup-input-sm" value="0" min="0">
                    </div>
                    <div class="matchup-wr-field">
                        <label class="matchup-label matchup-label-sm">Derrotas</label>
                        <input type="number" id="mu-l1" class="matchup-input matchup-input-sm" value="0" min="0">
                    </div>
                </div>
                <!-- Resultado yendo segundo -->
                <label class="matchup-label">Yendo 2do</label>
                <div class="matchup-wr-row">
                    <div class="matchup-wr-field">
                        <label class="matchup-label matchup-label-sm">Victorias</label>
                        <input type="number" id="mu-w2" class="matchup-input matchup-input-sm" value="0" min="0">
                    </div>
                    <div class="matchup-wr-field">
                        <label class="matchup-label matchup-label-sm">Derrotas</label>
                        <input type="number" id="mu-l2" class="matchup-input matchup-input-sm" value="0" min="0">
                    </div>
                </div>
                </div>

                <!-- Deck del oponente (opcional) -->
                <label class="matchup-label">Deck del oponente (opcional)</label>
                <div class="matchup-deck-src-row">
                    <select id="mu-deck-select" class="matchup-input-history matchup-select"
                            onchange="Matchups._onDeckSelectChange()">
                        <option value="">— Sin deck asociado —</option>
                        ${savedOpts ? `<optgroup label="Mis Decks">${savedOpts}</optgroup>` : ''}
                        ${metaOpts  ? `<optgroup label="Decks del Meta">${metaOpts}</optgroup>` : ''}
                    </select>
                    <button class="matchup-btn matchup-btn-ydk"
                            onclick="Matchups._importYDK()">📂 .ydk</button>
                </div>
                <div id="mu-deck-status" class="matchup-deck-status"></div>

                <!-- Notas -->
                <label class="matchup-label">Notas</label>
                <textarea id="mu-notes" class="matchup-textarea"
                          placeholder="Estrategias clave, debilidades observadas, side deck ideal..."></textarea>

                <button class="btn btn-primary matchup-save-btn"
                        onclick="Matchups._saveNew()">Guardar</button>
            </div>`;

        ov.addEventListener('click', e => { if (e.target === ov) this._closeOverlay(); });
        document.body.appendChild(ov);
    },

    _onDeckSelectChange: function () {
        const sel = document.getElementById('mu-deck-select');
        const val = sel?.value;
        if (!val) { this._clearPendingDeck(); return; }

        if (val.startsWith('saved::')) {
            const name = val.replace('saved::', '');
            try {
                const data = JSON.parse(localStorage.getItem(`deck_${name}`));
                const cards = data.cards || data;
                this._pendingCardData = cards;
                this._setPendingStatus(`✅ Deck "${name}" cargado (${Object.keys(cards).length} cartas)`);
                // Auto-fill nombre si está vacío
                const nameEl = document.getElementById('mu-name');
                if (nameEl && !nameEl.value.trim()) nameEl.value = name;
            } catch (_) { this._setPendingStatus('❌ Error al cargar el deck'); }

        } else if (val.startsWith('meta::')) {
            const parts = val.split('::');
            const folder = parts[1], deckName = parts[2];
            const metaDeck = this._findMetaDeck(folder, deckName);
            if (metaDeck && metaDeck.cards) {
                this._pendingCardData = metaDeck.cards;
                this._setPendingStatus(`✅ Meta deck "${deckName}" cargado (${Object.keys(metaDeck.cards).length} cartas)`);
                const nameEl = document.getElementById('mu-name');
                if (nameEl && !nameEl.value.trim()) nameEl.value = deckName;
            } else {
                this._setPendingStatus('❌ No se encontró el deck del meta');
            }
        }
    },

    _importYDK: function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.ydk';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            this._setPendingStatus('⏳ Importando .ydk...');
            try {
                const text  = await file.text();
                const cards = await this._parseYDKToCards(text);
                if (!cards || Object.keys(cards).length === 0) {
                    this._setPendingStatus('❌ No se pudieron resolver las cartas');
                    return;
                }
                this._pendingCardData = cards;
                const nameEl = document.getElementById('mu-name');
                if (nameEl && !nameEl.value.trim()) nameEl.value = file.name.replace('.ydk','');
                this._setPendingStatus(`✅ YDK importado (${Object.keys(cards).length} cartas únicas)`);
            } catch (_) {
                this._setPendingStatus('❌ Error al procesar el archivo');
            }
        };
        input.click();
    },

    _parseYDKToCards: async function (text) {
        const lines   = text.split('\n').map(l => l.trim()).filter(Boolean);
        let section   = '';
        const ids     = { main: [], extra: [], side: [] };

        lines.forEach(line => {
            if (line.startsWith('#main'))  { section = 'main';  return; }
            if (line.startsWith('#extra')) { section = 'extra'; return; }
            if (line.startsWith('!side'))  { section = 'side';  return; }
            if (line.startsWith('#') || line.startsWith('!')) return;
            if (/^\d+$/.test(line) && section) ids[section].push(line);
        });

        // Contar cantidades
        const qtys = {};
        const locs = {};
        ['main','extra','side'].forEach(loc => {
            ids[loc].forEach(id => {
                qtys[id] = (qtys[id] || 0) + 1;
                if (!locs[id]) locs[id] = loc;
            });
        });

        const uniqueIds = Object.keys(qtys);
        if (!uniqueIds.length) return {};

        // Resolver contra API (en bloques de 10 para no saturar)
        const cards = {};
        const chunk = 10;
        for (let i = 0; i < uniqueIds.length; i += chunk) {
            const batch = uniqueIds.slice(i, i + chunk);
            try {
                const url  = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${batch.join(',')}`;
                const resp = await fetch(url);
                const json = await resp.json();
                (json.data || []).forEach(card => {
                    const id = String(card.id);
                    cards[id] = {
                        name: card.name,
                        type: card.type,
                        qty:  qtys[id] || 1,
                        location: locs[id] || 'main',
                        img: card.card_images?.[0]?.image_url_small || ''
                    };
                });
            } catch (_) {}
        }
        return cards;
    },

    _pendingCardData: null,

    _setPendingStatus: function (msg) {
        const el = document.getElementById('mu-deck-status');
        if (el) el.textContent = msg;
    },
    _clearPendingDeck: function () {
        this._pendingCardData = null;
        this._setPendingStatus('');
    },

    _saveNew: function () {
        const nameEl   = document.getElementById('mu-name');
        const winsEl   = document.getElementById('mu-wins');
        const lossesEl = document.getElementById('mu-losses');
        const notesEl  = document.getElementById('mu-notes');

        const name = nameEl?.value.trim();
        if (!name) { nameEl?.focus(); return; }

        const record = {
            id:           this._uid(),
            opponentName: name,
            wins1st:      Math.max(0, parseInt(document.getElementById('mu-w1')?.value) || 0),
            losses1st:    Math.max(0, parseInt(document.getElementById('mu-l1')?.value) || 0),
            wins2nd:      Math.max(0, parseInt(document.getElementById('mu-w2')?.value) || 0),
            losses2nd:    Math.max(0, parseInt(document.getElementById('mu-l2')?.value) || 0),
            notes:        notesEl?.value.trim() || '',
            cardData:     this._pendingCardData || null,
            createdAt:    Date.now()
        };

        const list = this.getAll();
        list.push(record);
        this.save(list);
        this._pendingCardData = null;
        this._closeOverlay();
        this._refreshList();
    },

    // ─── PANEL EDITAR ─────────────────────────────────────────
    openEditPanel: function (index) {
        const list = this.getAll();
        const m    = list[index];
        if (!m) return;
        this._closeOverlay();

        const total = (m.wins || 0) + (m.losses || 0);
        const pct   = total > 0 ? Math.round((m.wins / total) * 100) : null;

        const ov = document.createElement('div');
        ov.id = 'matchup-overlay';
        ov.className = 'matchup-overlay';
        ov.innerHTML = `
            <div class="matchup-panel">
                <button class="matchup-panel-close"
                        onclick="Matchups._closeOverlay()">✕</button>
                <h3 class="matchup-panel-title">Editar: ${m.opponentName}</h3>

                <label class="matchup-label">Nombre del deck/oponente</label>
                <input type="text" id="mu-edit-name" class="matchup-input"
                       value="${m.opponentName || ''}">

                <label class="matchup-label">Yendo 1ro</label>
                    <div class="matchup-wr-row">
                        <div class="matchup-wr-field">
                            <label class="matchup-label matchup-label-sm">Victorias</label>
                            <input type="number" id="mu-w1" class="matchup-input matchup-input-sm"
                                   value="${m.wins1st || 0}" min="0">
                        </div>
                        <div class="matchup-wr-field">
                            <label class="matchup-label matchup-label-sm">Derrotas</label>
                            <input type="number" id="mu-l1" class="matchup-input matchup-input-sm"
                                   value="${m.losses1st || 0}" min="0">
                        </div>
                    </div>
                    <label class="matchup-label">Yendo 2do</label>
                    <div class="matchup-wr-row">
                        <div class="matchup-wr-field">
                            <label class="matchup-label matchup-label-sm">Victorias</label>
                            <input type="number" id="mu-w2" class="matchup-input matchup-input-sm"
                                   value="${m.wins2nd || 0}" min="0">
                        </div>
                        <div class="matchup-wr-field">
                            <label class="matchup-label matchup-label-sm">Derrotas</label>
                            <input type="number" id="mu-l2" class="matchup-input matchup-input-sm"
                                   value="${m.losses2nd || 0}" min="0">
                        </div>
                    </div>
                ${pct !== null ? `<div class="matchup-wr-preview">Winrate actual: ${m.wins}W – ${m.losses}L · ${pct}%</div>` : ''}

                <label class="matchup-label">Notas</label>
                <textarea id="mu-edit-notes" class="matchup-textarea">${m.notes || ''}</textarea>

                <button class="btn btn-primary matchup-save-btn"
                        onclick="Matchups._saveEdit(${index})">Guardar cambios</button>
            </div>`;

        ov.addEventListener('click', e => { if (e.target === ov) this._closeOverlay(); });
        document.body.appendChild(ov);
    },

    _saveEdit: function (index) {
        const list = this.getAll();
        if (!list[index]) return;

        const nameEl   = document.getElementById('mu-edit-name');
        const winsEl   = document.getElementById('mu-edit-wins');
        const lossesEl = document.getElementById('mu-edit-losses');
        const notesEl  = document.getElementById('mu-edit-notes');

        const name = nameEl?.value.trim();
        if (!name) { nameEl?.focus(); return; }

        list[index].opponentName = name;
        list[index].wins    = Math.max(0, parseInt(winsEl?.value)   || 0);
        list[index].losses  = Math.max(0, parseInt(lossesEl?.value) || 0);
        list[index].notes   = notesEl?.value.trim() || '';

        this.save(list);
        this._closeOverlay();
        this._refreshList();
    },

    // ─── VER DECK DEL OPONENTE ────────────────────────────────
    openDeckPanel: function (index) {
        const list = this.getAll();
        const m    = list[index];
        if (!m || !m.cardData) return;
        document.getElementById('matchup-deck-overlay')?.remove();

        const cards = m.cardData;
        const byLoc = { main: [], extra: [], side: [] };

        Object.entries(cards).forEach(([id, v]) => {
            const loc = v.location || 'main';
            if (byLoc[loc]) byLoc[loc].push({ id, ...v });
        });

        const countMain  = byLoc.main.reduce( (s, v) => s + (v.qty || 1), 0);
        const countExtra = byLoc.extra.reduce((s, v) => s + (v.qty || 1), 0);
        const countSide  = byLoc.side.reduce( (s, v) => s + (v.qty || 1), 0);

        const renderGrid = (cards) => {
            if (!cards.length) return '';
            return `<div class="tdp-cards-grid">${cards.map(v => `
                <div class="tdp-card">
                    <img src="${v.img || `https://images.ygoprodeck.com/images/cards_small/${v.id}.jpg`}"
                         alt="${v.name}" onerror="this.src=''">
                    <span class="tdp-qty">x${v.qty || 1}</span>
                </div>`).join('')}</div>`;
        };

        const ov = document.createElement('div');
        ov.id = 'matchup-deck-overlay';
        ov.className = 'tdp-overlay';
        ov.innerHTML = `
            <div class="tdp-panel">
                <button class="tdp-close"
                        onclick="document.getElementById('matchup-deck-overlay').remove()">✕</button>
                <h3 class="tdp-title">${m.opponentName}</h3>
                <div class="tdp-counts">Main: ${countMain} · Extra: ${countExtra} · Side: ${countSide}</div>
                ${byLoc.main.length  ? `<div class="tdp-loc-label">Main Deck</div>${renderGrid(byLoc.main)}`   : ''}
                ${byLoc.extra.length ? `<div class="tdp-loc-label">Extra Deck</div>${renderGrid(byLoc.extra)}` : ''}
                ${byLoc.side.length  ? `<div class="tdp-loc-label">Side Deck</div>${renderGrid(byLoc.side)}`   : ''}
                ${!countMain && !countExtra && !countSide ? '<p class="stats-empty">Sin datos de cartas.</p>' : ''}
            </div>`;

        ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
        document.body.appendChild(ov);
    },

    // ─── ELIMINAR ─────────────────────────────────────────────
    deleteRecord: function (index) {
        const list = this.getAll();
        if (!list[index]) return;
        if (!confirm(`¿Eliminar el registro de "${list[index].opponentName}"?`)) return;
        list.splice(index, 1);
        this.save(list);
        this._refreshList();
    },

    clearAll: function () {
        if (!confirm('¿Borrar todo el historial de enfrentamientos de este deck?')) return;
        this.save([]);
        this._refreshList();
    },

    // ─── HELPERS ─────────────────────────────────────────────
    _closeOverlay: function () {
        document.getElementById('matchup-overlay')?.remove();
        this._pendingCardData = null;
    },

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
        for (const [folder, decks] of Object.entries(m)) {
            (decks || []).forEach(d => r.push({ folder, name: d.filename, deck: d }));
        }
        return r.sort((a, b) => a.name.localeCompare(b.name));
    },

    _findMetaDeck: function (folder, name) {
        const m = window.Estadisticas?.metaDecks || {};
        return (m[folder] || []).find(d => d.filename === name) || null;
    }
};

window.Matchups = Matchups;



// ── Duelista — perfil del jugador: nivel por duelos totales, WR global, mejores decks (mín. 5 duelos) ──

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
    _calcWR: function (w, l) {
        const t = w + l;
        return t === 0 ? null : Math.round((w / t) * 100);
    },

    _getAllMatchupRecords: function () {
        if (!window.Deck) return [];
        const decks = Deck.getSavedDecks();
        const all   = [];
        decks.forEach(deck => {
            try {
                const raw = localStorage.getItem(`matchup_${deck.name}`);
                const records = JSON.parse(raw) || [];
                records.forEach(m => {
                    if (m.wins1st !== undefined) { all.push({ ...m, _deckName: deck.name }); }
                    else all.push({ ...m, wins1st: m.wins||0, losses1st: m.losses||0, wins2nd: 0, losses2nd: 0, _deckName: deck.name });
                });
            } catch (_) {}
        });
        return all;
    },

    getGlobalStats: function () {
        if (!window.Deck) return null;
        const all = this._getAllMatchupRecords();
        let w1 = 0, l1 = 0, w2 = 0, l2 = 0;
        all.forEach(m => {
            w1 += m.wins1st   || 0;
            l1 += m.losses1st || 0;
            w2 += m.wins2nd   || 0;
            l2 += m.losses2nd || 0;
        });
        return {
            wins1st: w1, losses1st: l1,
            wins2nd: w2, losses2nd: l2,
            totalWins:   w1 + w2,
            totalLosses: l1 + l2,
            totalDuels:  w1 + l1 + w2 + l2,
            wr1st: this._calcWR(w1, l1),
            wr2nd: this._calcWR(w2, l2),
            wrAll: this._calcWR(w1 + w2, l1 + l2)
        };
    },
    getBestDecks: function () {
        if (!window.Deck) return null;
        const allRecords = this._getAllMatchupRecords();
        const result     = { general: null, going1st: null, going2nd: null };
        let bestAll = -1, best1st = -1, best2nd = -1;

        // Agrupar por deck del jugador
        const byDeck = {};
        allRecords.forEach(m => {
            const dk = m._deckName;
            if (!byDeck[dk]) byDeck[dk] = { w1:0, l1:0, w2:0, l2:0 };
            byDeck[dk].w1 += m.wins1st   || 0;
            byDeck[dk].l1 += m.losses1st || 0;
            byDeck[dk].w2 += m.wins2nd   || 0;
            byDeck[dk].l2 += m.losses2nd || 0;
        });

        Object.entries(byDeck).forEach(([name, r]) => {
            const total = r.w1 + r.l1 + r.w2 + r.l2;
            if (total < 5) return;
            const pAll = this._calcWR(r.w1+r.w2, r.l1+r.l2);
            const p1st = this._calcWR(r.w1, r.l1);
            const p2nd = this._calcWR(r.w2, r.l2);
            if (pAll !== null && pAll > bestAll) { bestAll = pAll; result.general  = { name, pct: pAll, duels: total }; }
            if (p1st !== null && p1st > best1st) { best1st = p1st; result.going1st = { name, pct: p1st, duels: r.w1+r.l1 }; }
            if (p2nd !== null && p2nd > best2nd) { best2nd = p2nd; result.going2nd = { name, pct: p2nd, duels: r.w2+r.l2 }; }
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
                    <small>Ve a <strong>Mi Deck → Historial de Enfrentamientos</strong> y registra tus partidas.</small>
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

