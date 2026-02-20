/* ====================================
   MATCHUPS MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Historial de enfrentamientos por deck
   ==================================== */

const Matchups = {

    STORAGE_PREFIX: 'matchup_',

    // ─── PERSISTENCIA ────────────────────────────────────────
    _key: function () {
        return this.STORAGE_PREFIX + (window.Deck?.name || '');
    },

    getAll: function () {
        try { return JSON.parse(localStorage.getItem(this._key())) || []; }
        catch (_) { return []; }
    },

    save: function (list) {
        try { localStorage.setItem(this._key(), JSON.stringify(list)); }
        catch (_) {}
    },

    _uid: function () {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    },

    // ─── RENDER DE SECCIÓN (llamado desde deck.js render) ────
    renderSection: function () {
        if (!window.Deck?.name) return '';

        const list = this.getAll();
        const count = list.length;

        let rows = '';
        if (count === 0) {
            rows = `<p class="matchup-empty">Sin enfrentamientos registrados aún.</p>`;
        } else {
            list.forEach((m, i) => {
                const total = (m.wins || 0) + (m.losses || 0);
                const pct   = total > 0 ? Math.round((m.wins / total) * 100) : null;
                const col   = pct === null ? 'rgba(255,255,255,0.3)' : pct >= 60 ? '#00b894' : pct >= 45 ? '#fdcb6e' : '#d63031';
                const hasDeck = m.cardData && Object.keys(m.cardData).length > 0;

                rows += `
                <div class="matchup-row" id="matchup-row-${i}">
                    <div class="matchup-row-main">
                        <div class="matchup-opponent-name">${m.opponentName || '—'}</div>
                        <div class="matchup-stats">
                            <span class="matchup-wr" style="color:${col}">
                                ${m.wins}W – ${m.losses}L${pct !== null ? ` · ${pct}%` : ''}
                            </span>
                        </div>
                        <div class="matchup-row-btns">
                            ${hasDeck ? `<button class="matchup-btn matchup-btn-deck"
                                onclick="Matchups.openDeckPanel(${i})">🃏 Ver Deck</button>` : ''}
                            <button class="matchup-btn matchup-btn-edit"
                                    onclick="Matchups.openEditPanel(${i})">✏️ Editar</button>
                            <button class="matchup-btn matchup-btn-del"
                                    onclick="Matchups.deleteRecord(${i})">✕</button>
                        </div>
                    </div>
                    ${m.notes ? `<div class="matchup-notes-preview">${m.notes}</div>` : ''}
                </div>`;
            });
        }

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
                </div>
                <div class="matchup-list" id="matchup-list">
                    ${rows}
                </div>
            </div>`;
    },

    // Refresca solo la lista interna (evita re-render completo del deck)
    _refreshList: function () {
        const listEl = document.getElementById('matchup-list');
        const badgeEl = document.querySelector('.matchup-count-badge');
        if (!listEl) { if (window.Deck) Deck.render(); return; }

        const list  = this.getAll();
        const count = list.length;

        if (badgeEl) badgeEl.textContent = count;

        if (count === 0) {
            listEl.innerHTML = `<p class="matchup-empty">Sin enfrentamientos registrados aún.</p>`;
            return;
        }

        let rows = '';
        list.forEach((m, i) => {
            const total = (m.wins || 0) + (m.losses || 0);
            const pct   = total > 0 ? Math.round((m.wins / total) * 100) : null;
            const col   = pct === null ? 'rgba(255,255,255,0.3)' : pct >= 60 ? '#00b894' : pct >= 45 ? '#fdcb6e' : '#d63031';
            const hasDeck = m.cardData && Object.keys(m.cardData).length > 0;

            rows += `
            <div class="matchup-row" id="matchup-row-${i}">
                <div class="matchup-row-main">
                    <div class="matchup-opponent-name">${m.opponentName || '—'}</div>
                    <div class="matchup-stats">
                        <span class="matchup-wr" style="color:${col}">
                            ${m.wins}W – ${m.losses}L${pct !== null ? ` · ${pct}%` : ''}
                        </span>
                    </div>
                    <div class="matchup-row-btns">
                        ${hasDeck ? `<button class="matchup-btn matchup-btn-deck"
                            onclick="Matchups.openDeckPanel(${i})">🃏 Ver Deck</button>` : ''}
                        <button class="matchup-btn matchup-btn-edit"
                                onclick="Matchups.openEditPanel(${i})">✏️ Editar</button>
                        <button class="matchup-btn matchup-btn-del"
                                onclick="Matchups.deleteRecord(${i})">✕</button>
                    </div>
                </div>
                ${m.notes ? `<div class="matchup-notes-preview">${m.notes}</div>` : ''}
            </div>`;
        });

        listEl.innerHTML = rows;
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

                <!-- Winrate -->
                <div class="matchup-wr-row">
                    <div class="matchup-wr-field">
                        <label class="matchup-label">Victorias</label>
                        <input type="number" id="mu-wins" class="matchup-input matchup-input-sm"
                               value="0" min="0">
                    </div>
                    <div class="matchup-wr-field">
                        <label class="matchup-label">Derrotas</label>
                        <input type="number" id="mu-losses" class="matchup-input matchup-input-sm"
                               value="0" min="0">
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
            wins:         Math.max(0, parseInt(winsEl?.value) || 0),
            losses:       Math.max(0, parseInt(lossesEl?.value) || 0),
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

                <div class="matchup-wr-row">
                    <div class="matchup-wr-field">
                        <label class="matchup-label">Victorias</label>
                        <input type="number" id="mu-edit-wins" class="matchup-input matchup-input-sm"
                               value="${m.wins || 0}" min="0">
                    </div>
                    <div class="matchup-wr-field">
                        <label class="matchup-label">Derrotas</label>
                        <input type="number" id="mu-edit-losses" class="matchup-input matchup-input-sm"
                               value="${m.losses || 0}" min="0">
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
