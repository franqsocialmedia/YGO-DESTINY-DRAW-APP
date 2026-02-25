/* ====================================
   EXPERIMENTACIÓN MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Lienzo libre con drag & drop de cartas
   ==================================== */

const Experimentacion = {

    CARD_BACK: 'https://images.ygoprodeck.com/images/cards/back.jpg',
    API_URL:   'https://db.ygoprodeck.com/api/v7/cardinfo.php',

    _container:    null,
    _rendered:     false,
    _zoom:         1,
    _instanceId:   0,
    _instances:    [],   // [{ iid, card, x, y }]
    _dragging:     null, // { iid, ox, oy }
    _dsCache:      { saved: [], engines: [], meta: [] },
    _listGroups: [],

    // ── Punto de entrada ────────────────────────────────────────
    renderInto: function (container) {
        if (!container) return;
        this._container = container;
        if (this._rendered) return;   // solo construir el shell una vez
        this._rendered = true;
        container.innerHTML = this._buildShell();
        this._bindEvents();
        this._refreshList();
    },

    _buildShell: function () {
        return `
<div class="exp-wrap">

  <!-- Barra superior -->
  <div class="exp-toolbar">
    <button class="exp-btn exp-btn-search"  onclick="Experimentacion.openSearch()">🔍 Buscar Carta</button>
    <button class="exp-btn exp-btn-import"  onclick="Experimentacion.importYDK()">📥 Importar .ydk</button>
    <button class="exp-btn exp-btn-deck"    onclick="Experimentacion.openDeckPicker()">🃏 Elegir Deck</button>
    <button class="exp-btn exp-btn-clear"   onclick="Experimentacion.clearCanvas()">🗑 Limpiar</button>
    <div class="exp-zoom-group">
      <span class="exp-zoom-lbl">🔍</span>
      <input type="range" class="exp-zoom-slider" id="exp-zoom-slider"
             min="0.3" max="2" step="0.05" value="1"
             oninput="Experimentacion._setZoom(this.value)">
      <span class="exp-zoom-val" id="exp-zoom-val">100%</span>
    </div>
  </div>

  <!-- Cuerpo: lista izquierda + canvas -->
  <div class="exp-body">

    <!-- Lista lateral -->
    <div class="exp-sidebar" id="exp-sidebar">
      <div class="exp-sidebar-title">🃏 Cartas</div>
      <div class="exp-card-list" id="exp-card-list">
        <div class="exp-list-empty">Sin cartas añadidas.</div>
      </div>
    </div>

    <!-- Lienzo -->
    <div class="exp-canvas-wrap" id="exp-canvas-wrap">
      <div class="exp-canvas" id="exp-canvas"></div>
    </div>

  </div>
</div>`;
    },

    // ── Zoom ────────────────────────────────────────────────────
    _setZoom: function (val) {
        this._zoom = parseFloat(val);
        const canvas = document.getElementById('exp-canvas');
        if (canvas) canvas.style.transform = `scale(${this._zoom})`;
        const lbl = document.getElementById('exp-zoom-val');
        if (lbl) lbl.textContent = `${Math.round(this._zoom * 100)}%`;
    },

    // ── Añadir carta ────────────────────────────────────────────
    _addCard: function (card) {
        const CARD_W = 86, CARD_H = 124, GAP = 10, COLS = 8;
        const idx = this._instances.length;
        const col = idx % COLS;
        const row = Math.floor(idx / COLS);
        const x   = col * (CARD_W + GAP) + 10;
        const y   = row * (CARD_H + GAP) + 10;
        this._instanceId++;
        this._instances.push({ iid: this._instanceId, card, x, y });
        this._renderCard(this._instances[this._instances.length - 1]);
        this._refreshList();
    },
_removeCard: function (card) {
        const key = String(card.id || card.name);
        // Buscar la última instancia de esta carta en el array
        let lastIdx = -1;
        this._instances.forEach((inst, i) => {
            if (String(inst.card.id || inst.card.name) === key) lastIdx = i;
        });
        if (lastIdx === -1) return;
        const iid = this._instances[lastIdx].iid;
        this._instances.splice(lastIdx, 1);
        document.getElementById(`exp-card-${iid}`)?.remove();
        this._refreshList();
    },
    _renderCard: function (inst) {
        const canvas = document.getElementById('exp-canvas');
        if (!canvas) return;
        const img = inst.card.card_images?.[0]?.image_url_small || this.CARD_BACK;
        const el  = document.createElement('div');
        el.className     = 'exp-card';
        el.id            = `exp-card-${inst.iid}`;
        el.style.left    = `${inst.x}px`;
        el.style.top     = `${inst.y}px`;
        el.title         = inst.card.name;
        el.innerHTML     = `<img src="${img}" onerror="this.src='${this.CARD_BACK}'" draggable="false">`;
        el.addEventListener('mousedown',  (e) => this._startDrag(e, inst.iid));
        el.addEventListener('touchstart', (e) => this._startDragTouch(e, inst.iid), { passive: false });
        el.addEventListener('dblclick',     () => this._viewCard(inst.iid));
        el.addEventListener('contextmenu',  (e) => { e.preventDefault(); this._removeCard(inst.card); });
        canvas.appendChild(el);
        // Expandir canvas si es necesario
        this._expandCanvas(inst.x + 96, inst.y + 134);
    },

    _expandCanvas: function (minW, minH) {
        const canvas = document.getElementById('exp-canvas');
        if (!canvas) return;
        const curW = parseInt(canvas.style.width)  || 1200;
        const curH = parseInt(canvas.style.height) || 800;
        if (minW > curW - 20) canvas.style.width  = `${minW + 40}px`;
        if (minH > curH - 20) canvas.style.height = `${minH + 40}px`;
    },

    // ── Drag & Drop (mouse) ─────────────────────────────────────
    _bindEvents: function () {
        document.addEventListener('mousemove', (e) => this._onDragMove(e));
        document.addEventListener('mouseup',   ()  => this._stopDrag());
        document.addEventListener('touchmove', (e) => this._onDragMoveTouch(e), { passive: false });
        document.addEventListener('touchend',  ()  => this._stopDrag());
    },

    _startDrag: function (e, iid) {
        if (e.button !== 0) return;
        e.preventDefault();
        const inst = this._instances.find(i => i.iid === iid);
        if (!inst) return;
        const el   = document.getElementById(`exp-card-${iid}`);
        if (!el) return;
        el.classList.add('exp-card-dragging');
        const rect = el.getBoundingClientRect();
        this._dragging = {
            iid,
            ox: (e.clientX - rect.left) / this._zoom,
            oy: (e.clientY - rect.top)  / this._zoom
        };
        // Bring to front
        el.style.zIndex = ++this._instanceId;
    },

    _startDragTouch: function (e, iid) {
        e.preventDefault();
        const touch = e.touches[0];
        const fakeEv = { button: 0, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} };
        this._startDrag(fakeEv, iid);
    },

    _onDragMove: function (e) {
        if (!this._dragging) return;
        const { iid, ox, oy } = this._dragging;
        const canvas = document.getElementById('exp-canvas');
        const inst   = this._instances.find(i => i.iid === iid);
        const el     = document.getElementById(`exp-card-${iid}`);
        if (!canvas || !inst || !el) return;
        const canvasRect = canvas.getBoundingClientRect();
        const nx = (e.clientX - canvasRect.left) / this._zoom - ox;
        const ny = (e.clientY - canvasRect.top)  / this._zoom - oy;
        inst.x = Math.max(0, nx);
        inst.y = Math.max(0, ny);
        el.style.left = `${inst.x}px`;
        el.style.top  = `${inst.y}px`;
        this._expandCanvas(inst.x + 96, inst.y + 134);
    },

    _onDragMoveTouch: function (e) {
        if (!this._dragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        this._onDragMove({ clientX: touch.clientX, clientY: touch.clientY });
    },

    _stopDrag: function () {
        if (!this._dragging) return;
        const el = document.getElementById(`exp-card-${this._dragging.iid}`);
        if (el) el.classList.remove('exp-card-dragging');
        this._dragging = null;
    },

    // ── Ver carta (dblclick o desde lista) ──────────────────────
    _viewCard: function (iid) {
        const inst = this._instances.find(i => i.iid === iid);
        if (!inst) return;
        if (window.ZonaPractica) ZonaPractica._openMiniCV(inst.card);
    },

    _viewCardFromList: function () { /* obsoleto — mantenido por compatibilidad */ },

    // ── Lista lateral ────────────────────────────────────────────
    _refreshList: function () {
        const el = document.getElementById('exp-card-list');
        if (!el) return;
        const groups = {};
        this._instances.forEach(inst => {
            const key = String(inst.card.id || inst.card.name);
            if (!groups[key]) groups[key] = { card: inst.card, count: 0 };
            groups[key].count++;
        });
        const entries = Object.values(groups);
        if (!entries.length) {
            el.innerHTML = '<div class="exp-list-empty">Sin cartas añadidas.</div>';
            return;
        }
        // Limpiar y reconstruir con event listeners directos (sin inline onclick)
        el.innerHTML = '';
        entries.forEach(g => {
            const img  = g.card.card_images?.[0]?.image_url_small || this.CARD_BACK;
            const row  = document.createElement('div');
            row.className = 'exp-list-item';

            const thumb = document.createElement('img');
            thumb.className = 'exp-list-thumb';
            thumb.src   = img;
            thumb.title = g.card.name;
            thumb.onerror = () => { thumb.src = this.CARD_BACK; };
            thumb.addEventListener('click', () => { if (window.ZonaPractica) ZonaPractica._openMiniCV(g.card); });

            const name = document.createElement('span');
            name.className   = 'exp-list-name';
            name.textContent = g.card.name;
            name.addEventListener('click', () => { if (window.ZonaPractica) ZonaPractica._openMiniCV(g.card); });

            const count = document.createElement('span');
            count.className   = 'exp-list-count';
            count.textContent = g.count;

            const addBtn = document.createElement('button');
            addBtn.className   = 'exp-list-add';
            addBtn.title       = 'Añadir copia';
            addBtn.textContent = '＋';
            addBtn.addEventListener('click', () => { this._addCard(g.card); });

            const removeBtn = document.createElement('button');
            removeBtn.className   = 'exp-list-remove';
            removeBtn.title       = 'Quitar copia';
            removeBtn.textContent = '—';
            removeBtn.addEventListener('click', () => { this._removeCard(g.card); });

            row.appendChild(thumb);
            row.appendChild(name);
            row.appendChild(count);
            row.appendChild(addBtn);
            row.appendChild(removeBtn);
            el.appendChild(row);
        });
    },

    _addCopyFromList: function () { /* obsoleto — mantenido por compatibilidad */ },

    _addCopyFromList: function (idx) {
        const g = this._listGroups?.[idx];
        if (!g) return;
        this._addCard(g.card);
    },

    _addCopyFromList: function (cardId) {
        const inst = this._instances.find(i => (i.card.id || i.card.name) === cardId);
        if (!inst) return;
        this._addCard(inst.card);
    },

    // ── Buscar Carta (reutiliza panel de ZonaPractica) ──────────
    openSearch: function () {
        if (!window.ZonaPractica) return;
        // Temporalmente parchear _addSearchCard para redirigir aquí
        this._prevAddSearch = ZonaPractica._addSearchCard.bind(ZonaPractica);
        ZonaPractica._addSearchCard = (index) => {
            const card = ZonaPractica._lastSearchResults[index];
            if (!card) return;
            this._addCard(card);
            // Feedback sin cerrar
            const btns = document.querySelectorAll('#pz-search-results .pz-search-add-btn');
            const btn  = btns[index];
            if (btn) {
                const orig = btn.textContent;
                btn.textContent = '✓';
                btn.disabled = true;
                setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 900);
            }
        };
        ZonaPractica.openCardSearch();
        // Restaurar al cerrar el overlay
        const restore = () => {
            if (this._prevAddSearch) ZonaPractica._addSearchCard = this._prevAddSearch;
            document.getElementById('pz-search-overlay')?.removeEventListener('remove', restore);
        };
        const observer = new MutationObserver((muts, obs) => {
            if (!document.getElementById('pz-search-overlay')) {
                restore();
                obs.disconnect();
            }
        });
        observer.observe(document.body, { childList: true });
    },

    // ── Importar YDK ────────────────────────────────────────────
    importYDK: function () {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.ydk';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text  = await file.text();
        const lines = text.split(/\r?\n/).map(l => l.trim());
        const ids   = [];
        lines.forEach(l => {
            if (l.startsWith('#') || l.startsWith('!')) return;
            if (/^\d+$/.test(l)) ids.push(l);
        });
        if (!ids.length) { alert('YDK vacío o inválido.'); return; }

        const uniqueIds = [...new Set(ids)];
        try {
            const url  = `${this.API_URL}?id=${uniqueIds.join(',')}`;
            const res  = await fetch(url);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            const byId = {};
            (data.data || []).forEach(c => { byId[String(c.id)] = c; });

            const CARD_W = 86, CARD_H = 124, GAP = 10, COLS = 8;
            ids.forEach(id => {
                const card = byId[id];
                if (!card) return;
                const col = this._instances.length % COLS;
                const row = Math.floor(this._instances.length / COLS);
                this._instanceId++;
                const inst = {
                    iid:  this._instanceId,
                    card,
                    x: col * (CARD_W + GAP) + 10,
                    y: row * (CARD_H + GAP) + 10
                };
                this._instances.push(inst);
                this._renderCard(inst);
            });
            this._refreshList();
        } catch (_) { alert('Error al importar YDK.'); }
    };
    input.click();
},

    // ── Elegir Deck ─────────────────────────────────────────────
    openDeckPicker: function () {
        document.getElementById('exp-deck-overlay')?.remove();

        const saved   = window.Deck    ? Deck.getSavedDecks()   : [];
        const engines = window.Engines ? Engines.getAll()        : [];
        let   meta    = [];
        try {
            const raw = localStorage.getItem('yugioh_meta_decks');
            if (raw) Object.values(JSON.parse(raw)).forEach(f => (f.decks||[]).forEach(d => meta.push(d)));
        } catch (_) {}
        this._dsCache = { saved, engines, meta };

        const buildSec = (title, items, type) => {
            if (!items.length) return '';
            return `<div class="exp-dp-section">
                <div class="exp-dp-sec-title">${title}</div>
                ${items.map((item, i) => {
                    const name  = item.name || '(sin nombre)';
                    const cards = item.cards || {};
                    const cover = Object.values(cards).find(c => c.roles?.includes('Carta As'));
                    const img   = cover
                        ? (cover.data?.card_images?.[0]?.image_url_small || this.CARD_BACK)
                        : this.CARD_BACK;
                    const mN = Object.values(cards).filter(c => c.location === 'main').reduce((s,c) => s+c.qty, 0);
                    const eN = Object.values(cards).filter(c => c.location === 'extra').reduce((s,c) => s+c.qty, 0);
                    return `<div class="exp-dp-item" onclick="Experimentacion._loadDeck('${type}',${i})">
                        <img src="${img}" onerror="this.src='${this.CARD_BACK}'" class="exp-dp-thumb">
                        <div class="exp-dp-info">
                            <div class="exp-dp-name">${name}</div>
                            <div class="exp-dp-counts">Main:${mN} · Extra:${eN}</div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        };

        const overlay = document.createElement('div');
        overlay.id        = 'exp-deck-overlay';
        overlay.className = 'pz-modal-overlay';
        overlay.onclick   = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
<div class="pz-modal-box pz-ds-box">
  <div class="pz-modal-title">🃏 Elegir Deck</div>
  <button class="pz-modal-close" onclick="document.getElementById('exp-deck-overlay').remove()">✕</button>
  <div class="pz-ds-body">
    ${saved.length || engines.length || meta.length
        ? buildSec('📁 Decks Guardados', saved,   'saved') +
          buildSec('⚙️ Engines',          engines, 'engines') +
          buildSec('🌐 Meta',              meta,    'meta')
        : '<p class="pz-search-hint">No hay decks disponibles.</p>'}
  </div>
</div>`;
        document.body.appendChild(overlay);
    },

    _loadDeck: function (type, idx) {
        const dk = this._dsCache[type]?.[idx];
        if (!dk) return;
        document.getElementById('exp-deck-overlay')?.remove();
        const cards = dk.cards || {};
        Object.values(cards).forEach(item => {
            const qty  = item.qty || 1;
            const card = item.data || item;
            for (let i = 0; i < qty; i++) this._addCard(card);
        });
    },

    // ── Limpiar lienzo ──────────────────────────────────────────
    clearCanvas: function () {
        this._instances  = [];
        this._instanceId = 0;
        const canvas = document.getElementById('exp-canvas');
        if (canvas) { canvas.innerHTML = ''; canvas.style.width = '1200px'; canvas.style.height = '800px'; }
        this._refreshList();
    },
};

window.Experimentacion = Experimentacion;
