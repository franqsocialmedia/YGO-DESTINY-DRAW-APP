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
                    ${count > 1 ? `<select class="matchup-sort-sel" onchange="Matchups.setSortBy(this.value)">
                        <option value="duelos"    ${this._sortBy==='duelos'?'selected':''}>Ordenar: Duelos</option>
                        <option value="victorias" ${this._sortBy==='victorias'?'selected':''}>Ordenar: Victorias</option>
                        <option value="derrotas"  ${this._sortBy==='derrotas'?'selected':''}>Ordenar: Derrotas</option>
                    </select>` : ''}
                    <button class="matchup-btn matchup-btn-ydk" onclick="Matchups.exportTXT()" title="Descargar Historial de Enfrentamientos">⬇️ Exportar</button>
                    <button class="matchup-btn matchup-btn-ydk" onclick="Matchups.importTXT()" title="Importar Historial de Enfrentamientos">⬆️ Importar</button>
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
                        <button class="matchup-btn matchup-btn-del"
                                onclick="event.stopPropagation();Matchups.deleteRecord(${i})">✕</button>
                    </div>
                </div>
                ${m.notes ? `<div class="matchup-notes-preview">${m.notes}
                    <button type="button" class="matchup-notes-expand-btn" title="Ver notas completas"
                            style="background:none;border:none;cursor:pointer;font-size:13px;margin-left:6px;vertical-align:middle;"
                            onclick="event.stopPropagation();Matchups.showNotesPopover(event, ${i})">🔍</button>
                </div>` : ''}
            </div>`;
        });
        return rows;
    },

    // ── Popover flotante de notas — click/tap ademas del hover ya existente ──
    // Necesario en movil, donde no existe :hover para leer notas largas.
    showNotesPopover: function (event, index) {
        const list = this.getAll();
        const rec  = list[index];
        if (!rec || !rec.notes) return;
        this._closeNotesPopover();

        const pop = document.createElement('div');
        pop.id = 'matchup-notes-popover';
        pop.innerHTML = `
            <div class="matchup-notes-popover-hdr" style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;font-weight:600;color:var(--gold-color,#FFD700);">
                <span>📝 ${(rec.opponentName || 'Notas').replace(/</g,'&lt;')}</span>
                <button type="button" onclick="Matchups._closeNotesPopover()"
                        style="background:none;border:none;color:var(--text-light,#eee);cursor:pointer;font-size:14px;line-height:1;">✕</button>
            </div>
            <div class="matchup-notes-popover-body" style="white-space:pre-wrap;word-break:break-word;max-height:200px;overflow-y:auto;">${rec.notes.replace(/</g,'&lt;')}</div>`;
        pop.style.cssText = `
            position:fixed; z-index:99999; max-width:280px; min-width:200px;
            background:var(--bg-card,#1a1a2e); color:var(--text-light,#eee);
            border:1px solid var(--gold-color,#FFD700); border-radius:8px;
            box-shadow:0 6px 20px rgba(0,0,0,.5); padding:10px 12px; font-size:13px;
        `;
        document.body.appendChild(pop);

        const btn  = event.currentTarget;
        const rect = btn.getBoundingClientRect();
        let left = rect.left;
        if (left + 280 > window.innerWidth) left = window.innerWidth - 290;
        if (left < 8) left = 8;
        let top = rect.bottom + 6;
        if (top + 150 > window.innerHeight) top = rect.top - 6 - 150;
        pop.style.left = left + 'px';
        pop.style.top  = top + 'px';

        setTimeout(() => document.addEventListener('click', Matchups._onOutsideNotesClick), 0);
    },

    _onOutsideNotesClick: function (e) {
        const pop = document.getElementById('matchup-notes-popover');
        if (pop && !pop.contains(e.target)) Matchups._closeNotesPopover();
    },

    _closeNotesPopover: function () {
        document.getElementById('matchup-notes-popover')?.remove();
        document.removeEventListener('click', Matchups._onOutsideNotesClick);
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

    // ─── EXPORTAR / IMPORTAR HISTORIAL DE ENFRENTAMIENTOS (.txt) ─────
    exportTXT: function () {
        const list = this.getAll();
        const sessions = window.Deck ? (Deck.getOptimizacion().sessions || []) : [];
        if (!list.length && !sessions.length) { alert('Sin enfrentamientos ni sesiones para exportar.'); return; }

        const payload = { matchups: list, sessions };
        const header = `# Destiny Draw - Historial de Enfrentamientos + Sesiones\n# Deck: ${window.Deck?.name || ''}\n# Exportado: ${new Date().toLocaleString('es-ES')}\n`;
        const blob = new Blob([header + JSON.stringify(payload, null, 2)], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${(window.Deck?.name || 'deck').replace(/[^a-z0-9]/gi, '_')}_enfrentamientos.txt`;
        a.click();
    },
// Copia las sesiones COMPLETAS (rondas reales: turnos, starters, extenders,
    // bricks, etc.) tal como están en el deck de origen — nada sintético, para
    // que el score de Optimización coincida exactamente con el deck original.
    // Si todas las rondas de una sesión son contra el mismo rival, se etiqueta
    // para el borrado vinculado con Historial de Enfrentamientos.
    _importRealSessions: function (sessions) {
        if (!Array.isArray(sessions) || !sessions.length || !window.Deck?.name) return 0;
        const deckName = window.Deck.name;
        let raw;
        try { raw = JSON.parse(localStorage.getItem(`optimization_${deckName}`)) || {}; } catch (_) { raw = {}; }
        if (!raw.sessions) raw.sessions = [];

        const now = Date.now();
        const newSessions = [];

        sessions.forEach((sess, idx) => {
            if (!sess?.rounds?.length) return;
            const oppNames  = new Set(sess.rounds.map(r => r.oppDeck).filter(Boolean));
            const singleOpp = oppNames.size === 1 ? [...oppNames][0] : null;

            newSessions.push({
                id: now + idx,
                date: sess.date || new Date().toLocaleDateString('es-ES'),
                label: sess.label ? `📥 ${sess.label}` : '📥 Sesión importada',
                _importedMatchup: singleOpp || undefined,
                rounds: sess.rounds.map(r => ({ ...r, id: `${now}-${idx}-${r.id}` }))
            });
        });

        if (!newSessions.length) return 0;
        // Se antepone el bloque completo de una sola vez (sin unshift por iteración)
        // para conservar el mismo orden que traía el archivo exportado.
        raw.sessions = newSessions.concat(raw.sessions);
        localStorage.setItem(`optimization_${deckName}`, JSON.stringify(raw));
        return newSessions.length;
    },

    importTXT: function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            this._mergeImported(await file.text());
        };
        input.click();
    },

    // Fusiona por nombre de rival (sin distinguir mayúsc./minúsc.): si existe, suma W/L;
    // si no existe, se agrega como registro nuevo con id propio. No toca Historial de
    // Sesiones ni Nivel como Piloto del Deck.
    _mergeImported: function (text) {
        const jsonStr = text.split('\n').filter(l => !l.trim().startsWith('#')).join('\n');
        let payload;
        try {
            payload = JSON.parse(jsonStr);
        } catch (_) {
            alert('❌ Archivo inválido. Debe ser un .txt exportado desde Destiny Draw.');
            return;
        }

        // Compatibilidad con exports viejos (array plano, sin sesiones completas)
        const importedMatchups = Array.isArray(payload) ? payload : (payload.matchups || []);
        const importedSessions = Array.isArray(payload) ? [] : (payload.sessions || []);

        if (!importedMatchups.length && !importedSessions.length) {
            alert('❌ El archivo no contiene enfrentamientos ni sesiones.');
            return;
        }

        const list = this.getAll();
        let added = 0, merged = 0;

        importedMatchups.forEach(rec => {
            const name = (rec.opponentName || '').trim();
            if (!name) return;
            const existing = list.find(m => (m.opponentName || '').trim().toLowerCase() === name.toLowerCase());

            if (existing) {
                existing.wins1st   = (existing.wins1st   || 0) + (rec.wins1st   || 0);
                existing.losses1st = (existing.losses1st || 0) + (rec.losses1st || 0);
                existing.wins2nd   = (existing.wins2nd   || 0) + (rec.wins2nd   || 0);
                existing.losses2nd = (existing.losses2nd || 0) + (rec.losses2nd || 0);
                if (rec.notes && !(existing.notes || '').includes(rec.notes)) {
                    existing.notes = existing.notes ? `${existing.notes}\n${rec.notes}` : rec.notes;
                }
                if (!existing.cardData && rec.cardData) existing.cardData = rec.cardData;
                merged++;
            } else {
                list.push({
                    id:           this._uid(),
                    opponentName: name,
                    wins1st:      rec.wins1st   || 0,
                    losses1st:    rec.losses1st || 0,
                    wins2nd:      rec.wins2nd   || 0,
                    losses2nd:    rec.losses2nd || 0,
                    notes:        rec.notes || '',
                    cardData:     rec.cardData || null,
                    createdAt:    Date.now()
                });
                added++;
            }
        });

        this.save(list);
        const sessionsAdded = this._importRealSessions(importedSessions);
        this._activeFilterDeck = null; // evita que un filtro previo oculte las sesiones recién importadas

        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane && window.Deck) pane.innerHTML = Deck.renderOptimizacionPane();
        else this._refreshList();

        alert(`✅ Importado: ${added} nuevo(s), ${merged} fusionado(s) en Enfrentamientos.\n📊 ${sessionsAdded} sesión(es) completa(s) copiada(s) a Historial de Sesiones — mismas rondas, turnos y métricas que en el deck de origen.`);
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
        const name = list[index].opponentName;
        if (!confirm(`¿Eliminar el registro de "${name}"?`)) return;
        list.splice(index, 1);
        this.save(list);
        if (window.Deck) Deck.regenerateUid();
        this._removeImportedSessions(name);

        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane && window.Deck) pane.innerHTML = Deck.renderOptimizacionPane();
        else this._refreshList();
    },

    // Borra las sesiones que este import generó para ese rival (no toca sesiones
    // registradas a mano, aunque compartan nombre de rival).
    _removeImportedSessions: function (opponentName) {
        if (!window.Deck?.name || !opponentName) return;
        const deckName = window.Deck.name;
        let raw;
        try { raw = JSON.parse(localStorage.getItem(`optimization_${deckName}`)) || {}; } catch (_) { raw = {}; }
        if (!raw.sessions?.length) return;
        const target = opponentName.trim().toLowerCase();
        const before = raw.sessions.length;
        raw.sessions = raw.sessions.filter(s => (s._importedMatchup || '').trim().toLowerCase() !== target);
        if (raw.sessions.length !== before) {
            localStorage.setItem(`optimization_${deckName}`, JSON.stringify(raw));
        }
    },

    // Borra el registro de Enfrentamientos que corresponde a un rival (llamado
    // desde mideck.js al borrar una sesión importada).
    _removeRecordByName: function (opponentName) {
        if (!opponentName) return;
        const target = opponentName.trim().toLowerCase();
        const list = this.getAll().filter(m => (m.opponentName || '').trim().toLowerCase() !== target);
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



// ── Duelista — "Nivel como Piloto del Deck": nivel de dominio del deck activo,
//    calculado EXCLUSIVAMENTE con las rondas registradas en Historial de Sesiones
//    (Deck.getOptimizacion() → optimization_${deckName}, pestaña Optimización).
//    Ya no tiene relación con Matchups / Historial de Enfrentamientos (winrate manual
//    por rival) ni con datos agregados de otros decks: es el nivel del deck cargado.
//    Se renderiza en dos lugares con el mismo contenido: Estadísticas (#duelista-content)
//    y Mi Deck → Optimización, arriba de Complejidad del Deck (#duelista-content-opt).
const Duelista = {

    // Niveles por rondas totales registradas en Historial de Sesiones del deck activo.
    // Escala reducida respecto a la versión anterior (que sumaba TODOS los decks a lo
    // largo de toda la vida de la app): aquí solo cuentan las rondas de prueba de un
    // único deck, un volumen naturalmente mucho menor.
    LEVELS: [
        { min: 0,   label: 'Novato',         icon: '🥚' },
        { min: 5,   label: 'Aprendiz',       icon: '🌱' },
        { min: 15,  label: 'Piloto',         icon: '⚡' },
        { min: 30,  label: 'Rival',          icon: '🔥' },
        { min: 50,  label: 'Competidor',     icon: '🏅' },
        { min: 100, label: 'Semi-Pro',       icon: '💎' },
        { min: 200, label: 'Pro',            icon: '👑' },
        { min: 400, label: 'Élite',          icon: '🌟' },
        { min: 800, label: 'Legendario',     icon: '🐉' },
    ],

    getLevel: function (totalDuels) {
        let level = this.LEVELS[0];
        for (const l of this.LEVELS) {
            if (totalDuels >= l.min) level = l;
            else break;
        }
        const idx  = this.LEVELS.indexOf(level);
        const next = this.LEVELS[idx + 1] || null;
        return { ...level, next, totalDuels };
    },

    _calcWR: function (w, l) {
        const t = w + l;
        return t === 0 ? null : Math.round((w / t) * 100);
    },

    // Todas las rondas de todas las sesiones del deck activo (o el indicado por nombre)
    _getAllRounds: function (deckName) {
        if (!window.Deck) return [];
        const data = Deck.getOptimizacion(deckName);
        const rounds = [];
        (data.sessions || []).forEach(s => (s.rounds || []).forEach(r => rounds.push(r)));
        return rounds;
    },

    getDeckStats: function (deckName) {
        if (!window.Deck) return null;
        const rounds = this._getAllRounds(deckName);
        let w1 = 0, l1 = 0, w2 = 0, l2 = 0;
        rounds.forEach(r => {
            const isWin = r.resultado === 'victoria';
            if (r.orden === 'primero') { isWin ? w1++ : l1++; }
            else if (r.orden === 'segundo') { isWin ? w2++ : l2++; }
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

    renderSection: function () {
        const deckName = window.Deck?.name;
        if (!window.Deck || !deckName || !Object.keys(Deck.cards || {}).length) {
            return `<p class="stats-empty">Carga un deck para ver su Nivel como Piloto.</p>`;
        }

        const g = this.getDeckStats(deckName);
        if (!g || g.totalDuels === 0) {
            return `
                <div class="duelista-empty">
                    <div class="duelista-empty-icon">🥚</div>
                    <p>Este deck aún no tiene rondas registradas.</p>
                    <small>Ve a <strong>Mi Deck → Optimización</strong> y registra rondas en Historial de Sesiones.</small>
                </div>`;
        }

        const lv    = this.getLevel(g.totalDuels);
        const wrCol = (p) => p === null ? 'rgba(255,255,255,0.3)' : p >= 60 ? '#00b894' : p >= 45 ? '#fdcb6e' : '#d63031';

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

        return `
            <div class="duelista-card">

                <!-- Nivel -->
                <div class="duelista-level-block">
                    <div class="duelista-level-icon">${lv.icon}</div>
                    <div class="duelista-level-info">
                        <div class="duelista-level-label">${lv.label}</div>
                        <div class="duelista-level-duels">${g.totalDuels} rondas registradas · ${deckName}</div>
                    </div>
                </div>
                ${progressBar}

                <div class="duelista-divider"></div>

                <!-- Winrate del deck activo (Historial de Sesiones) -->
                <div class="duelista-subtitle">Winrate del Deck (Historial de Sesiones)</div>
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

            </div>`;
    },

    // Refresca todas las instancias visibles del bloque (Estadísticas + Mi Deck → Optimización)
    refreshSection: function () {
        ['duelista-content', 'duelista-content-opt'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = this.renderSection();
        });
    }
};

window.Duelista = Duelista;