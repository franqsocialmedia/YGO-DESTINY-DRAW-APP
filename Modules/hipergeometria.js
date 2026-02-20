/* ====================================
   HIPERGEOMETRÍA MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Calculadora de Probabilidad de Robo
   Sección: Simuladores
   ==================================== */

const Hipergeometria = {

    CARD_BACK: 'https://images.ygoprodeck.com/images/cards/back.jpg',

    // ── ESTADO ───────────────────────────────────────────────────
    _searchResults:   [],
    _searchTimeout:   null,
    _allDecks:        [],
    _deckCardsCopy:   {},   // id → { data, originalQty, remaining }
    _targetCardIds:   {},   // id → copias marcadas como objetivo
    _drawnCards:      [],   // [{ isTarget: bool }]
    _deckRemaining:   0,
    _selectedDeckIdx: null,

    // ═══════════════════════════════════════════════════
    //  MATEMÁTICA HIPERGEOMÉTRICA
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
    //  INICIALIZACIÓN
    // ═══════════════════════════════════════════════════

    init: function () {
        if (document.getElementById('hiper-wrapper')) return;
        this._render();
    },

    _render: function () {
        const container = document.getElementById('simuladores-content');
        if (!container) return;
        const wrapper = document.createElement('div');
        wrapper.id = 'hiper-wrapper';
        wrapper.innerHTML = this._buildHTML();
        container.appendChild(wrapper);
        this._calcQuick();
    },

    // ═══════════════════════════════════════════════════
    //  HTML
    // ═══════════════════════════════════════════════════

    _buildHTML: function () {
        const back = this.CARD_BACK;
        return `
<div class="hiper-header" onclick="Hipergeometria.toggleSection()">
    🎲 Probabilidad de Robo <span id="hiper-arrow">▼</span>
</div>
<div id="hiper-sec" style="display:none">

    <p class="hiper-intro">
        Basado en la <strong>distribución hipergeométrica</strong>, este calculador determina la probabilidad
        exacta de robar una carta específica. La fórmula es
        <em>P(X ≥ x) = Σ C(n,k)·C(N−n, M−k) / C(N,M)</em> — sin reemplazo, al contrario de la binomial,
        por lo que es matemáticamente exacta para barajas finitas como en Yu-Gi-Oh!.
        N = tamaño del deck, n = copias de la carta, M = cartas robadas, x = mínimo deseado.
    </p>

    <div class="hiper-tabs">
        <button class="hiper-tab-btn active" id="hiper-tb-quick"
                onclick="Hipergeometria.switchTab('quick')">⚡ Cálculo Rápido</button>
        <button class="hiper-tab-btn"        id="hiper-tb-deck"
                onclick="Hipergeometria.switchTab('deck')">🗂️ Con Mis Decks</button>
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
    //  NAVEGACIÓN SECCIÓN / PESTAÑAS
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
        const isQuick = tab === 'quick';
        document.getElementById('hiper-pane-quick').style.display = isQuick ? '' : 'none';
        document.getElementById('hiper-pane-deck').style.display  = isQuick ? 'none' : '';
        document.getElementById('hiper-tb-quick').classList.toggle('active', isQuick);
        document.getElementById('hiper-tb-deck').classList.toggle('active', !isQuick);
        if (!isQuick) this._loadDeckList();
    },

    // ═══════════════════════════════════════════════════
    //  CÁLCULO RÁPIDO
    // ═══════════════════════════════════════════════════

    _calcQuick: function () {
        const N = parseInt(document.getElementById('hq-N')?.value) || 40;
        const n = parseInt(document.getElementById('hq-n')?.value) || 3;
        const M = parseInt(document.getElementById('hq-M')?.value) || 5;
        const x = parseInt(document.getElementById('hq-x')?.value) || 1;
        this._renderResults('hq-results', 'hq-chart', N, n, M, x);
    },

    // ═══════════════════════════════════════════════════
    //  RESULTADOS Y GRÁFICO (compartido entre tabs)
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
    //  BUSCADOR MODAL (Cálculo Rápido)
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
        // Sugerir el límite actual de copias según banlist si está disponible
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
    //  CON MIS DECKS — LISTA DE DECKS
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
                    name:   `[${folder}] ${deck.filename}`,
                    cards,
                    tag:    '🌐',
                    isMeta: true,
                    _raw:   deck
                });
            });
        });
        return result;
    },

    // ═══════════════════════════════════════════════════
    //  CON MIS DECKS — SELECCIÓN DE DECK
    // ═══════════════════════════════════════════════════

    _selectDeck: async function (idx) {
        const deck = this._allDecks[idx];
        if (!deck) return;

        this._selectedDeckIdx = idx;
        this._targetCardIds   = {};
        this._drawnCards      = [];

        // Reset UI
        document.getElementById('hiper-deck-panel').style.display = '';
        document.getElementById('hiper-minideck-title').textContent = deck.name;
        document.getElementById('hd-n-val').textContent  = '0';
        document.getElementById('hd-M-val').textContent  = '0';
        document.getElementById('hd-results').innerHTML  = '';
        document.getElementById('hd-chart').innerHTML    = '';

        // Construir copia de trabajo del deck
        this._deckCardsCopy = {};
        Object.entries(deck.cards || {}).forEach(([id, item]) => {
            if (item.location !== 'main') return;
            this._deckCardsCopy[String(id)] = {
                data:        item.data || { id, name: `#${id}`, card_images: [{ image_url_small: this.CARD_BACK }] },
                originalQty: item.qty || 1,
                remaining:   item.qty || 1
            };
        });

        // Meta decks: fetchear datos reales de la API
        if (deck.isMeta) {
            await this._fetchMetaCardData();
        }

        const mainN = Object.values(this._deckCardsCopy)
            .reduce((s, c) => s + c.originalQty, 0);
        this._deckRemaining = mainN;

        document.getElementById('hd-N-val').textContent    = mainN;
        document.getElementById('hd-pile-count').textContent = `Main Deck: ${mainN}`;

        // Marcar item activo
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
    //  CON MIS DECKS — MINI DECKLIST
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
    //  CON MIS DECKS — SIMULACIÓN DE MANO
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
    //  CON MIS DECKS — CÁLCULO
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
    }
};

window.Hipergeometria = Hipergeometria;
document.addEventListener('DOMContentLoaded', () => {
    // Lazy init — llamado desde navigation.js al entrar a la pestaña Simuladores
});
