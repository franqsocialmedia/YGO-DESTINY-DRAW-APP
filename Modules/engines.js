/* ====================================
   ENGINES MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Sistema de Motores (Engines) de cartas
   ==================================== */

const Engines = {

    STORAGE_KEY: 'yugioh_engines',
    CARD_BACK:   'https://images.ygoprodeck.com/images/cards/back.jpg',
    _activeTab: 'saved', // 'engines' | 'saved'

    // Estado del panel de creación
    _creating: {
        name:        '',
        cards:       {},   // id → { data, qty, location }
        roles:       [],
        notes:       '',
        coverCardId: null,
        coverCardImg: null
    },
    _searchTimeout: null,
    _searchResults: [],

    // ═══════════════════════════════════════════════════
    //  PERSISTENCIA
    // ═══════════════════════════════════════════════════

    getAll: function () {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
        catch (_) { return []; }
    },

    saveAll: function (engines) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(engines)); }
        catch (_) {}
    },

    // ═══════════════════════════════════════════════════
    //  INICIALIZACIÓN — inyecta el panel en Mi Deck
    // ═══════════════════════════════════════════════════

    init: function () {
    if (document.getElementById('engines-sidebar')) return;

    const deckContainer = document.getElementById('deck-container');
    if (!deckContainer) return;

    // Crear wrapper flex DENTRO de mideck-content, sin tocar su display
    let wrapper = document.getElementById('mideck-flex-wrap');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id        = 'mideck-flex-wrap';
        wrapper.className = 'mideck-flex-wrap';
        deckContainer.parentNode.insertBefore(wrapper, deckContainer);
        wrapper.appendChild(deckContainer);
    }

    const sidebar = document.createElement('div');
    sidebar.id        = 'engines-sidebar';
    sidebar.className = 'engines-sidebar';
    wrapper.appendChild(sidebar);

    this._renderSidebar();
},
    // ═══════════════════════════════════════════════════
    //  RENDER SIDEBAR
    // ═══════════════════════════════════════════════════

    _renderSidebar: function () {
        const sidebar = document.getElementById('engines-sidebar');
        if (!sidebar) return;
        const engines  = this.getAll();
        const isEng    = this._activeTab === 'engines';

        sidebar.innerHTML = `
<div class="eng-tabs">
    <button class="eng-tab-btn ${isEng ? 'eng-tab-active' : ''}"
            onclick="Engines._switchTab('engines')">⚙️ Engines</button>
    <button class="eng-tab-btn ${!isEng ? 'eng-tab-active' : ''}"
            onclick="Engines._switchTab('saved')">📁 Decks</button>
</div>

<div id="eng-panel-engines" style="display:${isEng ? 'flex' : 'none'};flex-direction:column;gap:8px;">
    <div class="eng-sidebar-actions">
        <button class="eng-action-btn eng-btn-primary"
                onclick="Engines.openCreatePanel()">＋ Añadir Engine</button>
        <button class="eng-action-btn eng-btn-secondary"
                onclick="Engines.importYDK()">📥 Importar .ydk</button>
    </div>
    <div class="eng-list" id="eng-list">
        ${engines.length ? engines.map((e, i) => this._renderEngineItem(e, i)).join('') :
          '<div class="eng-empty">Sin engines guardados</div>'}
    </div>
</div>

<div id="eng-panel-saved" style="display:${!isEng ? 'flex' : 'none'};flex-direction:column;gap:8px;">
    <div class="eng-list" id="eng-saved-list">
        ${this._renderSavedDeckItems()}
    </div>
</div>`;
    },

    _switchTab: function (tab) {
        this._activeTab = tab;
        this._renderSidebar();
    },

_renderSavedDeckItems: function () {
        if (!window.Deck) return '<div class="eng-empty">Módulo de decks no disponible.</div>';
        const saved = Deck.getSavedDecks();
        if (!saved.length) return '<div class="eng-empty">Sin decks guardados.</div>';

        return saved.map(deck => {
            const cartaAs = Object.values(deck.cards).find(c => c.roles?.includes('Carta As'));
            const cover   = cartaAs || (window.Deck ? Deck.getMostRepeatedCard(deck.cards) : null);
            const img     = cover
                ? (cover.data?.card_images?.[0]?.image_url_small || cover.card_images?.[0]?.image_url_small || this.CARD_BACK)
                : this.CARD_BACK;

            const mainCount = Object.values(deck.cards)
                .filter(c => c.location === 'main').reduce((s, c) => s + c.qty, 0);
            const extraCount = Object.values(deck.cards)
                .filter(c => c.location === 'extra').reduce((s, c) => s + c.qty, 0);

            // Winrate si está disponible
            let wrHtml = '';
            if (window.Winrate) {
                const wr    = Winrate.getRecord(deck.name);
                const total = wr.wins1st + wr.wins2nd + wr.losses1st + wr.losses2nd;
                if (total > 0) {
                    const pct = Winrate.calcWinrate(wr.wins1st + wr.wins2nd, wr.losses1st + wr.losses2nd);
                    const col = pct >= 60 ? '#00b894' : pct >= 45 ? '#fdcb6e' : '#d63031';
                    wrHtml = `<div class="eng-item-stats" style="color:${col}">WR ${pct}% (${total})</div>`;
                }
            }

            return `
<div class="eng-item">
    <img src="${img}" class="eng-item-img" onerror="this.src='${this.CARD_BACK}'"
         onclick="Deck.openLoadDeckPanel('${deck.name}')">
    <div class="eng-item-info">
        <div class="eng-item-name">${deck.name}</div>
        <div class="eng-item-counts">M:${mainCount} · E:${extraCount}</div>
        ${wrHtml}
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Ver / Cargar"
                onclick="Deck.openLoadDeckPanel('${deck.name}')">📂</button>
        <button class="eng-item-delete" title="Eliminar"
                onclick="Deck.openDeleteDeckPanel('${deck.name}');Engines._renderSidebar()">✖</button>
    </div>
</div>`;
        }).join('');
    },

    _renderEngineItem: function (engine, idx) {
    const img  = engine.coverCardImg || this.CARD_BACK;
    const s    = engine.stats || {};
    const mainCount  = Object.values(engine.cards || {})
        .filter(c => c.location === 'main')
        .reduce((sum, c) => sum + (c.qty || 1), 0);
    const extraCount = Object.values(engine.cards || {})
        .filter(c => c.location === 'extra')
        .reduce((sum, c) => sum + (c.qty || 1), 0);

    const statLine = [
        s.consistency > 0 ? `Cons: <b>+${s.consistency.toFixed(1)}</b>` : '',
        s.power       > 0 ? `Pot: <b>+${s.power.toFixed(1)}</b>`        : '',
        s.resilience  > 0 ? `Res: <b>+${s.resilience.toFixed(1)}</b>`   : ''
    ].filter(Boolean).join(' · ');

    return `
<div class="eng-item" onclick="Engines.clickEngine(${idx})">
    <img src="${img}" class="eng-item-img" onerror="this.src='${this.CARD_BACK}'">
    <div class="eng-item-info">
        <div class="eng-item-name">${engine.name}</div>
        <div class="eng-item-counts">M:${mainCount} · E:${extraCount}</div>
        ${statLine ? `<div class="eng-item-stats">${statLine}</div>` : ''}
        ${engine.roles?.length ? `<div class="eng-item-roles">${engine.roles.map(r =>
            `<span class="eng-role-chip">${r}</span>`).join('')}</div>` : ''}
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Editar"
                onclick="event.stopPropagation(); Engines.openEditPanel(${idx})">✏️</button>
        <button class="eng-item-delete" title="Eliminar"
                onclick="event.stopPropagation(); Engines.deleteEngine(${idx})">✕</button>
    </div>
</div>`;
},

    // ═══════════════════════════════════════════════════
    //  CLICK EN ENGINE EXISTENTE — añadir al deck activo
    // ═══════════════════════════════════════════════════

    clickEngine: function (idx) {
        const engines = this.getAll();
        const engine  = engines[idx];
        if (!engine) return;

        if (!window.Deck || Object.keys(Deck.cards).length === 0) {
            alert(`Engine "${engine.name}" seleccionado, pero no hay ningún deck cargado. Carga primero un deck desde Decks Guardados.`);
            return;
        }

        if (!confirm(`¿Agregar el engine "${engine.name}" al deck "${Deck.name}"?\n\nSe respetará el límite de 3 copias por carta.`)) return;

        let added = 0;
        Object.entries(engine.cards || {}).forEach(([id, item]) => {
            const current = Deck.cards[id];
            const currentQty = current ? current.qty : 0;
            const canAdd  = Math.min(item.qty || 1, 3 - currentQty);
            if (canAdd <= 0) return;

            if (current) {
                current.qty += canAdd;
            } else {
                Deck.cards[id] = {
                    data:     item.data,
                    qty:      canAdd,
                    location: item.location,
                    roles:    window.Deck ? Deck.autoAssignRoles(item.data) : []
                };
            }
            added++;
        });

        Deck.render();
        alert(`Engine "${engine.name}" añadido. ${added} cartas actualizadas.`);
    },

    // ═══════════════════════════════════════════════════
    //  ELIMINAR ENGINE
    // ═══════════════════════════════════════════════════

    deleteEngine: function (idx) {
        const engines = this.getAll();
        if (!confirm(`¿Eliminar el engine "${engines[idx]?.name}"?`)) return;
        engines.splice(idx, 1);
        this.saveAll(engines);
        this._renderSidebar();
    },

    // ═══════════════════════════════════════════════════
    //  PANEL DE CREACIÓN
    // ═══════════════════════════════════════════════════

    openCreatePanel: function () {
        this._creating = {
            name: '', cards: {}, roles: [], notes: '',
            coverCardId: null, coverCardImg: null
        };
        this._showCreateModal();
    },

    _showCreateModal: function () {
        document.getElementById('eng-modal')?.remove();

        const roles    = window.ConfigManager ? ConfigManager.getRoleNames() : [];
        const specs    = window.ConfigManager ? ConfigManager.getSpecialties() : [];
        const allTags  = [...new Set([
            ...roles,
            ...specs.map(s => s.mechanicRole).filter(Boolean),
            ...specs.map(s => s.counterRole).filter(Boolean)
        ])].filter(Boolean).sort();

        const overlay = document.createElement('div');
        overlay.id        = 'eng-modal';
        overlay.className = 'eng-modal';
        overlay.onclick   = e => { if (e.target === overlay) this.closeCreatePanel(); };

        overlay.innerHTML = `
<div class="eng-modal-box">
    <div class="eng-modal-header">
        <span>Nuevo Engine</span>
        <button class="eng-modal-close" onclick="Engines.closeCreatePanel()">✕</button>
    </div>

    <!-- Nombre -->
    <label class="eng-label">Nombre del Engine</label>
    <input type="text" id="eng-name-input" class="eng-input"
           placeholder="Ej: Paquete de búsqueda Infernoble..."
           oninput="Engines._creating.name = this.value">

    <!-- Layout principal: buscador + preview -->
    <div class="eng-create-layout">

        <!-- Columna izquierda: buscador + cartas -->
        <div class="eng-create-left">
            <label class="eng-label">Buscar cartas</label>
            <div class="eng-search-row">
                <input type="text" id="eng-search-input" class="eng-input"
                       placeholder="Nombre de la carta..."
                       oninput="Engines._onSearchInput()">
            </div>
            <div id="eng-search-results" class="eng-search-results">
                <div class="eng-search-hint">Escribe para buscar</div>
            </div>

            <!-- Cartas del engine -->
            <div class="eng-cards-header">
                <span class="eng-label">Cartas del Engine</span>
                <span class="eng-counters">
                    Main: <strong id="eng-count-main">0</strong> ·
                    Extra: <strong id="eng-count-extra">0</strong>
                </span>
            </div>
            <div id="eng-cards-grid" class="eng-cards-grid">
                <div class="eng-cards-empty">Sin cartas añadidas</div>
            </div>
        </div>

        <!-- Columna derecha: portada + tags + notas -->
        <div class="eng-create-right">

            <!-- Carta portada -->
            <label class="eng-label">Carta de Portada</label>
            <div class="eng-cover-slot" onclick="Engines.openCoverPicker()">
                <img id="eng-cover-img" src="${this.CARD_BACK}"
                     class="eng-cover-img" alt="Portada">
                <div class="eng-cover-hint">Toca para elegir</div>
            </div>

            <!-- Roles / mecánicas -->
            <label class="eng-label" style="margin-top:12px">Roles / Mecánicas que apoya</label>
            <div class="eng-roles-dropdown-wrap">
                <button class="eng-dropdown-btn"
                        onclick="Engines.toggleRolesDropdown()">
                    Seleccionar roles ▼
                </button>
                <div id="eng-roles-dropdown" class="eng-roles-dropdown" style="display:none">
                    ${allTags.map(tag => `
                    <label class="eng-role-opt">
                        <input type="checkbox" value="${tag}"
                               onchange="Engines._toggleRole('${tag}', this.checked)">
                        ${tag}
                    </label>`).join('')}
                    ${!allTags.length ? '<span class="eng-search-hint">No hay roles definidos en Config</span>' : ''}
                </div>
            </div>
            <div id="eng-selected-roles" class="eng-selected-roles"></div>

            <!-- Notas -->
            <label class="eng-label" style="margin-top:12px">Notas</label>
            <textarea id="eng-notes-input" class="eng-notes"
                      placeholder="Combos, sinergias, cómo usar este engine..."
                      oninput="Engines._creating.notes = this.value"></textarea>
        </div>
    </div>

    <!-- Botones de acción -->
    <div class="eng-modal-footer">
        <button class="eng-action-btn eng-btn-secondary"
                onclick="Engines.downloadCreatingYDK()">⬇️ Descargar .ydk</button>
        <button class="eng-action-btn eng-btn-primary"
                onclick="Engines.saveEngine()">✅ Crear Engine</button>
    </div>
</div>`;

        document.body.appendChild(overlay);
    },

    closeCreatePanel: function () {
        document.getElementById('eng-modal')?.remove();
        document.getElementById('eng-cover-picker')?.remove();
    },

    // ═══════════════════════════════════════════════════
    //  BÚSQUEDA DE CARTAS EN PANEL DE CREACIÓN
    // ═══════════════════════════════════════════════════

    _onSearchInput: function () {
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => this._doSearch(), 380);
    },

    _doSearch: async function () {
        const q   = document.getElementById('eng-search-input')?.value?.trim();
        const box = document.getElementById('eng-search-results');
        if (!box) return;
        if (!q || q.length < 2) {
            box.innerHTML = '<div class="eng-search-hint">Escribe al menos 2 caracteres</div>';
            return;
        }
        box.innerHTML = '<div class="eng-search-hint">Buscando...</div>';
        try {
            const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}&num=30&offset=0`);
            const data = await res.json();
            if (!data.data?.length) { box.innerHTML = '<div class="eng-search-hint">Sin resultados</div>'; return; }
            this._searchResults = data.data;
            box.innerHTML = data.data.map((card, i) => {
                const img      = card.card_images?.[0]?.image_url_small || this.CARD_BACK;
                const existing = this._creating.cards[String(card.id)]?.qty || 0;
                return `
<div class="eng-sitem">
    <img src="${img}" class="eng-sitem-img" loading="lazy">
    <div class="eng-sitem-name">${card.name}</div>
    <div class="eng-sitem-btns">
        <button class="eng-qty-btn ${existing >= 1 ? 'eng-qty-active' : ''}"
                ${existing >= 3 ? 'disabled' : ''}
                onclick="Engines.addCard(${i}, 1)">x1</button>
        <button class="eng-qty-btn ${existing >= 2 ? 'eng-qty-active' : ''}"
                ${existing >= 2 ? 'disabled' : ''}
                onclick="Engines.addCard(${i}, 2)">x2</button>
        <button class="eng-qty-btn ${existing >= 3 ? 'eng-qty-active' : ''}"
                ${existing >= 1 ? 'disabled' : ''}
                onclick="Engines.addCard(${i}, 3)">x3</button>
    </div>
</div>`;
            }).join('');
        } catch (_) { box.innerHTML = '<div class="eng-search-hint">Error de conexión</div>'; }
    },

    addCard: function (searchIdx, qty) {
        const card = this._searchResults[searchIdx];
        if (!card) return;
        const id       = String(card.id);
        const isExtra  = window.Deck ? Deck.isExtraDeckCard(card) : this._isExtraCard(card);
        const location = isExtra ? 'extra' : 'main';
        const existing = this._creating.cards[id]?.qty || 0;
        const final    = Math.min(3, existing + qty);
        if (final <= existing) return;

        this._creating.cards[id] = {
            data: card,
            qty:  final,
            location
        };
        this._refreshCardsGrid();
        this._doSearch(); // refrescar botones
    },

    removeCard: function (cardId) {
        const item = this._creating.cards[cardId];
        if (!item) return;
        if (item.qty > 1) item.qty--;
        else delete this._creating.cards[cardId];
        this._refreshCardsGrid();
        this._doSearch();
    },

    _isExtraCard: function (card) {
        const t = (card.type || '').toLowerCase();
        return t.includes('fusion') || t.includes('synchro') || t.includes('xyz') || t.includes('link');
    },

    _refreshCardsGrid: function () {
        const grid = document.getElementById('eng-cards-grid');
        if (!grid) return;

        const entries = Object.entries(this._creating.cards);
        if (!entries.length) {
            grid.innerHTML = '<div class="eng-cards-empty">Sin cartas añadidas</div>';
        } else {
            grid.innerHTML = entries.map(([id, item]) => {
                const img = item.data?.card_images?.[0]?.image_url_small || this.CARD_BACK;
                return `
<div class="eng-card-thumb">
    <img src="${img}" class="eng-card-thumb-img" loading="lazy">
    <div class="eng-card-qty">x${item.qty}</div>
    <button class="eng-card-remove" onclick="Engines.removeCard('${id}')">✕</button>
</div>`;
            }).join('');
        }

        // Actualizar contadores
        const mainCount  = entries.filter(([,c]) => c.location === 'main') .reduce((s,[,c]) => s+c.qty,0);
        const extraCount = entries.filter(([,c]) => c.location === 'extra').reduce((s,[,c]) => s+c.qty,0);
        const mEl = document.getElementById('eng-count-main');
        const eEl = document.getElementById('eng-count-extra');
        if (mEl) mEl.textContent  = mainCount;
        if (eEl) eEl.textContent  = extraCount;
    },

    // ═══════════════════════════════════════════════════
    //  PORTADA
    // ═══════════════════════════════════════════════════

    openCoverPicker: function () {
        document.getElementById('eng-cover-picker')?.remove();

        const entries = Object.entries(this._creating.cards);
        if (!entries.length) { alert('Añade cartas al engine primero.'); return; }

        const picker = document.createElement('div');
        picker.id        = 'eng-cover-picker';
        picker.className = 'eng-cover-picker';
        picker.onclick   = e => { if (e.target === picker) picker.remove(); };

        picker.innerHTML = `
<div class="eng-cover-picker-box">
    <div class="eng-modal-header">
        <span>Elegir Portada</span>
        <button class="eng-modal-close" onclick="document.getElementById('eng-cover-picker').remove()">✕</button>
    </div>
    <div class="eng-cover-picker-grid">
        ${entries.map(([id, item]) => {
            const img = item.data?.card_images?.[0]?.image_url_small || this.CARD_BACK;
            return `
<div class="eng-cover-option" onclick="Engines.setCover('${id}', '${img}')">
    <img src="${img}" class="eng-cover-option-img">
    <div class="eng-cover-option-name">${item.data?.name || id}</div>
</div>`;
        }).join('')}
    </div>
</div>`;

        document.body.appendChild(picker);
    },

    setCover: function (cardId, imgUrl) {
        this._creating.coverCardId  = cardId;
        this._creating.coverCardImg = imgUrl;
        const img = document.getElementById('eng-cover-img');
        if (img) img.src = imgUrl;
        document.getElementById('eng-cover-picker')?.remove();
    },

    // ═══════════════════════════════════════════════════
    //  ROLES
    // ═══════════════════════════════════════════════════

    toggleRolesDropdown: function () {
        const dd = document.getElementById('eng-roles-dropdown');
        if (dd) dd.style.display = dd.style.display === 'none' ? '' : 'none';
    },

    _toggleRole: function (role, checked) {
        if (checked) {
            if (!this._creating.roles.includes(role)) this._creating.roles.push(role);
        } else {
            this._creating.roles = this._creating.roles.filter(r => r !== role);
        }
        this._refreshSelectedRoles();
    },

    _refreshSelectedRoles: function () {
        const el = document.getElementById('eng-selected-roles');
        if (!el) return;
        el.innerHTML = this._creating.roles.map(r =>
            `<span class="eng-role-chip">${r}</span>`).join('') ||
            '<span class="eng-search-hint">Sin roles seleccionados</span>';
    },

    // ═══════════════════════════════════════════════════
    //  GUARDAR ENGINE
    // ═══════════════════════════════════════════════════

    saveEngine: function () {
        const name = (document.getElementById('eng-name-input')?.value || this._creating.name).trim();
        if (!name) { alert('Escribe un nombre para el engine.'); return; }
        if (!Object.keys(this._creating.cards).length) { alert('Añade al menos una carta.'); return; }

        // Calcular stats con Stats.calculateInternalScore si disponible
        let stats = { consistency: 0, power: 0, resilience: 0 };
        if (window.Stats) {
            // Preparar cards con autoAssignRoles
            const cardsForStats = {};
            Object.entries(this._creating.cards).forEach(([id, item]) => {
                const roles = window.Deck ? Deck.autoAssignRoles(item.data) : [];
                cardsForStats[id] = { ...item, roles };
            });
            const result = Stats.calculateInternalScore(cardsForStats);
            stats = { consistency: result.consistency, power: result.power, resilience: result.resilience };
        }

        const engines = this.getAll();
        engines.push({
            name,
            coverCardId:  this._creating.coverCardId,
            coverCardImg: this._creating.coverCardImg || this.CARD_BACK,
            cards:        this._creating.cards,
            roles:        this._creating.roles,
            notes:        this._creating.notes,
            stats,
            createdAt:    Date.now()
        });

        this.saveAll(engines);
        this.closeCreatePanel();
        this._renderSidebar();
    },

    // ═══════════════════════════════════════════════════
    //  DESCARGAR .YDK (creando / guardado)
    // ═══════════════════════════════════════════════════

    downloadCreatingYDK: function () {
        this._downloadCardsAsYDK(this._creating.cards,
            (document.getElementById('eng-name-input')?.value || 'engine').trim() || 'engine');
    },

    downloadEngineYDK: function (idx) {
        const engine = this.getAll()[idx];
        if (!engine) return;
        this._downloadCardsAsYDK(engine.cards, engine.name);
    },

    _downloadCardsAsYDK: function (cards, filename) {
        let main = '', extra = '', side = '';
        Object.entries(cards || {}).forEach(([id, item]) => {
            for (let i = 0; i < (item.qty || 1); i++) {
                if (item.location === 'main')  main  += id + '\n';
                if (item.location === 'extra') extra += id + '\n';
                if (item.location === 'side')  side  += id + '\n';
            }
        });
        const content = `#created by Destiny Draw\n#main\n${main}#extra\n${extra}!side\n${side}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = `${filename.replace(/[^a-z0-9]/gi, '_')}.ydk`;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    // ═══════════════════════════════════════════════════
    //  IMPORTAR .YDK
    // ═══════════════════════════════════════════════════

    importYDK: function () {
        const input   = document.createElement('input');
        input.type    = 'file';
        input.accept  = '.ydk';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            await this._parseAndOpenYDK(text, file.name.replace('.ydk', ''));
        };
        input.click();
    },

    _parseAndOpenYDK: async function (content, defaultName) {
        const lines   = content.split('\n').map(l => l.trim()).filter(l => l);
        const cardIds = { main: [], extra: [], side: [] };
        let section   = 'main';

        lines.forEach(line => {
            if (line.startsWith('#main'))  { section = 'main';  return; }
            if (line.startsWith('#extra')) { section = 'extra'; return; }
            if (line.startsWith('!side'))  { section = 'side';  return; }
            if (line.startsWith('#') || line.startsWith('!')) return;
            if (/^\d+$/.test(line)) cardIds[section].push(line);
        });

        const counts = {};
        const locs   = {};
        ['main','extra','side'].forEach(loc => {
            cardIds[loc].forEach(id => {
                counts[id] = Math.min(3, (counts[id] || 0) + 1);
                if (!locs[id]) locs[id] = loc;
            });
        });

        const uniqueIds = Object.keys(counts);
        if (!uniqueIds.length) { alert('No se encontraron cartas en el archivo.'); return; }

        // Abrir panel de creación con el nombre del archivo
        this.openCreatePanel();
        document.getElementById('eng-name-input').value = defaultName;
        this._creating.name = defaultName;

        const loadingEl = document.getElementById('eng-cards-grid');
        if (loadingEl) loadingEl.innerHTML = '<div class="eng-cards-empty">Cargando cartas...</div>';

        try {
            const chunks = [];
            for (let i = 0; i < uniqueIds.length; i += 50) chunks.push(uniqueIds.slice(i, i+50));

            for (const chunk of chunks) {
                const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${chunk.join(',')}`);
                const data = await res.json();
                (data.data || []).forEach(card => {
                    const id  = String(card.id);
                    this._creating.cards[id] = {
                        data:     card,
                        qty:      counts[id] || 1,
                        location: locs[id]  || 'main'
                    };
                });
            }
        } catch (_) { alert('Error al cargar cartas de la API.'); }

        this._refreshCardsGrid();
    },
    openEditPanel: function (idx) {
    const engines = this.getAll();
    const engine  = engines[idx];
    if (!engine) return;

    // Cargar estado del engine en _creating
    this._creating = {
        name:         engine.name,
        cards:        JSON.parse(JSON.stringify(engine.cards || {})),
        roles:        [...(engine.roles || [])],
        notes:        engine.notes || '',
        coverCardId:  engine.coverCardId  || null,
        coverCardImg: engine.coverCardImg || null,
        _editIdx:     idx   // marcador para saber que es edición
    };

    this._showCreateModal();

    // Rellenar campos tras render
    requestAnimationFrame(() => {
        const nameInput = document.getElementById('eng-name-input');
        if (nameInput) nameInput.value = engine.name;

        const coverImg = document.getElementById('eng-cover-img');
        if (coverImg && engine.coverCardImg) coverImg.src = engine.coverCardImg;

        // Marcar roles seleccionados
        document.querySelectorAll('#eng-roles-dropdown input[type=checkbox]').forEach(cb => {
            cb.checked = this._creating.roles.includes(cb.value);
        });
        this._refreshSelectedRoles();

        const notesInput = document.getElementById('eng-notes-input');
        if (notesInput) notesInput.value = engine.notes || '';

        this._refreshCardsGrid();

        // Cambiar texto del botón de crear
        const footer = document.querySelector('#eng-modal .eng-modal-footer');
        if (footer) {
            const saveBtn = footer.querySelector('.eng-btn-primary');
            if (saveBtn) {
                saveBtn.textContent = '💾 Guardar Cambios';
                saveBtn.onclick     = () => Engines.saveEditEngine();
            }
        }
    });
},

saveEditEngine: function () {
    const idx = this._creating._editIdx;
    if (idx === undefined || idx === null) { this.saveEngine(); return; }

    const name = (document.getElementById('eng-name-input')?.value || this._creating.name).trim();
    if (!name) { alert('Escribe un nombre para el engine.'); return; }
    if (!Object.keys(this._creating.cards).length) { alert('Añade al menos una carta.'); return; }

    let stats = { consistency: 0, power: 0, resilience: 0 };
    if (window.Stats) {
        const cardsForStats = {};
        Object.entries(this._creating.cards).forEach(([id, item]) => {
            cardsForStats[id] = { ...item, roles: window.Deck ? Deck.autoAssignRoles(item.data) : [] };
        });
        const result = Stats.calculateInternalScore(cardsForStats);
        stats = { consistency: result.consistency, power: result.power, resilience: result.resilience };
    }

    const engines = this.getAll();
    engines[idx] = {
        ...engines[idx],
        name,
        coverCardId:  this._creating.coverCardId,
        coverCardImg: this._creating.coverCardImg || this.CARD_BACK,
        cards:        this._creating.cards,
        roles:        this._creating.roles,
        notes:        this._creating.notes,
        stats
    };

    this.saveAll(engines);
    this.closeCreatePanel();
    this._renderSidebar();
},
};

window.Engines = Engines;
document.addEventListener('DOMContentLoaded', () => {
    // Se inicializa desde navigation.js al entrar a Mi Deck
});
