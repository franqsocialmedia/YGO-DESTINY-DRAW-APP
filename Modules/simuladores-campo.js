/* simuladores-campo.js — Campo de práctica visual e modo experimentación */
/* Absorbe: zonapractica.js, experimentacion.js */


// ── ZonaPractica — campo visual interactivo; estados guardados incluyen LP del momento ──

const ZonaPractica = {

    CARD_BACK:      'https://images.ygoprodeck.com/images/cards/back.jpg',
    API_URL:        'https://db.ygoprodeck.com/api/v7/cardinfo.php',
    MAX_RESULTS:    100,

    _container:     null,
    _hasOpened:     false,
    _searchTimeout: null,
    _activeMove:    null,
    _lastSearchResults: [],
    _dsCache:       { saved: [], engines: [], meta: [] },

    phase:               'draw',
    turnNumber:          1,
    changePositionMode:  false,
    cardsHidden:         false,
    hiddenHand:          false,
    hiddenMain:          false,
    hiddenExtra:         false,
    statusWidgetVisible: false,
    logEntries:          [],
    gameStates:          [],
    _chainCounter: 0,
    _chainedCards: [],
    _chainResolving: false, // true entre "Resolver Cadena" (muestra SEGOC) y "Cerrar Cadena"
    _tokenCounter: 0,
    lp: 8000,
    _activeDeckName: null,
    _activePlacement: null,
    _activePlayer: 'P1',
    _dualMode: false,
    _players: { P1: null, P2: null },
    _STATE_KEYS: [
        'field','hand','main','extra','gy','banish','other','lp',
        '_activeDeckName','changePositionMode','cardsHidden',
        'hiddenHand','hiddenMain','hiddenExtra','_tokenCounter'
    ],
    _longPressTimer: null,
    _longPressPreventClick: false,
    

    // ── Player A ──────────────────────────────────────────────────
    field: {
        'A':null,'B':null,'C':null,
        '1':null,'2':null,'3':null,'4':null,'5':null,
        '6':null,'7':null,'8':null,'9':null,'10':null
    },
    hand:[], main:[], extra:[], gy:[], banish:[], other:[],


    // ─── Filtros mini-buscador (independientes de Buscador) ───────
    pzFilterWords:    [],
    pzFilterPanelOpen: false,
    pzFilters: {
            cardCategory:'', attribute:'', monsterType:'', monsterSubtype:'',
            spellSubtype:'', trapSubtype:'', level:'', linkval:'', scale:'', atk:'', def:'',
            archetype: ''
        },
        _archetypeList: [],
    FILTER_DATA: {
        attributes:      ['DARK','LIGHT','EARTH','WATER','FIRE','WIND','DIVINE'],
        monsterTypes:    ['Dragon','Warrior','Spellcaster','Zombie','Fiend','Machine','Fairy',
                          'Beast','Beast-Warrior','Winged Beast','Fish','Sea Serpent','Rock',
                          'Dinosaur','Thunder','Insect','Plant','Psychic','Reptile','Aqua',
                          'Cyberse','Wyrm','Divine-Beast'],
        monsterSubtypes: ['Effect','Normal','Ritual','Fusion','Synchro','XYZ','Link','Pendulum',
                          'Tuner','Flip','Gemini','Union','Spirit'],
        spellSubtypes:   ['Normal','Campo','Equipo','Continua','Juego Rápido','Ritual'],
        spellSubtypesEn: ['Normal','Field','Equip','Continuous','Quick-Play','Ritual'],
        trapSubtypes:    ['Normal','Continua','Contraefecto'],
        trapSubtypesEn:  ['Normal','Continuous','Counter'],
        levels:          ['1','2','3','4','5','6','7','8','9','10','11','12'],
        linkvals:        ['1','2','3','4','5','6'],
        scales:          ['0','1','2','3','4','5','6','7','8','9','10','11','12','13']
    },
    SUBTYPE_API_MAP: {
        'Effect':'Effect Monster','Normal':'Normal Monster','Ritual':'Ritual Effect Monster',
        'Fusion':'Fusion Monster','Synchro':'Synchro Monster','XYZ':'XYZ Monster',
        'Link':'Link Monster','Pendulum':null,'Tuner':'Tuner Monster',
        'Flip':'Flip Effect Monster','Gemini':'Gemini Monster',
        'Union':'Union Effect Monster','Spirit':'Spirit Monster'
    },
// Zonas donde se permite el acoplamiento XYZ
OVERLAY_ZONES: ['1','2','3','4','5','A','B'],
    // ═══════════════════════════════════════════════════════
    renderInto: function (container) {
        if (!container) return;
        this._container = container;
        this._hasOpened = true; 
        if (!container.querySelector('.pz-wrap')) {
            container.innerHTML = this._buildShell();
        }
        this._renderAllZones();
    },

    closeFloating: function () {
        if (this._container) this._container.style.display = 'none';
        this._updateFloatingBtns();
    },

    _buildShell: function () {
        return `<div class="pz-wrap">

            <div class="pz-float-header">
                <span class="pz-float-title">🎴 Zona de Práctica</span>
            </div>

            <div class="pz-controls-bar">
                    <button class="pz-ctrl-btn pz-ctrl-search"
                            onclick="ZonaPractica.openCardSearch()">🔍 Buscar Carta</button>
                    <button class="pz-ctrl-btn pz-ctrl-deck"
                            onclick="ZonaPractica.openUseDeckPrompt()">🃏 Usar Deck</button>
                    
                    <button class="pz-ctrl-btn pz-ctrl-historia" data-section-id="sim-practica-history"
                            onclick="ZonaPractica.openStateNavigator()">📜 Historial</button>
                    <button class="pz-ctrl-btn pz-ctrl-widget"
                            id="pz-sw-toggle-btn"
                            onclick="ZonaPractica.toggleStatusWidget()"
                            style="display:none">📊 Estado</button>
                    
                    <button class="pz-ctrl-btn pz-ctrl-clear"
                            onclick="ZonaPractica.clearBoard()">🗑 Limpiar</button>
                </div>

                <div class="pz-lp-bar">
                    <span class="pz-lp-label">❤️ LP</span>
                    <span class="pz-lp-val" id="pz-lp-val">8,000</span>
                    <div class="pz-lp-ops">
                        <button class="pz-lp-btn pz-lp-gain"  onclick="ZonaPractica._openPzLP('gain')">＋ Gain</button>
                        <button class="pz-lp-btn pz-lp-dmg"   onclick="ZonaPractica._openPzLP('damage')">－ Damage</button>
                        <button class="pz-lp-btn pz-lp-reset" onclick="ZonaPractica._resetPzLP()">↺ 8000</button>
                    </div>
                </div>

                <div class="pz-phase-bar">
                <button class="pz-phase-btn pz-phase-draw pz-phase-active" data-phase="draw"
                        onclick="ZonaPractica.setPhase('draw')">Draw</button>
                <button class="pz-phase-btn pz-phase-standby" data-phase="standby"
                        onclick="ZonaPractica.setPhase('standby')">Standby</button>
                <button class="pz-phase-btn pz-phase-main" data-phase="main1"
                        onclick="ZonaPractica.setPhase('main1')">Main 1</button>
                <button class="pz-phase-btn pz-phase-battle" data-phase="battle"
                        onclick="ZonaPractica.setPhase('battle')">Battle</button>
                <button class="pz-phase-btn pz-phase-main" data-phase="main2"
                        onclick="ZonaPractica.setPhase('main2')">Main 2</button>
                <button class="pz-phase-btn pz-phase-end" data-phase="end"
                        onclick="ZonaPractica.setPhase('end')">End</button>
            </div>

            <div class="pz-board-outer" id="pz-board-outer">

                <!-- ── CAMPO + LATERAL (GY / BANISH) ── -->
                <div class="pz-field-area-wrap">

                <!-- ── COLUMNA OTHER (izquierda) ── -->
                <div class="pz-field-other-side">
                    <div class="pz-multi-zone pz-other-zone pz-side-zone" id="pz-zone-other"
                        onclick="ZonaPractica._onMultiZoneClick(event,'other')"></div>
                    <div class="pz-field-side-btns">
                        <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('other')">👁</button>
                        <span class="pz-row-label">Other</span>
                    </div>
                </div>
                <!-- Campo escalado al 60% -->
                <div class="pz-field-grid-wrap">
                        <div class="pz-field-grid">

                            <!-- Fila EMZ -->
                            
                            <div class="pz-zone pz-zone-emz pz-fg-emz-a" id="pz-zone-A" data-zone="A"
                                 onclick="ZonaPractica.onZoneClick('A')" onpointerdown="ZonaPractica._startLongPress('A', event)" onpointerup="ZonaPractica._cancelLongPress()" onpointerleave="ZonaPractica._cancelLongPress()" onpointercancel="ZonaPractica._cancelLongPress()" oncontextmenu="return false;"ondragstart="return false;"><span class="pz-zone-lbl">A</span></div>
                            <div class="pz-logo-cell pz-fg-logo">
                                <img src="img/LOGO - Destiny Draw Yugioh APP.png" class="pz-logo-img"
                                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                                <div class="pz-logo-fallback" style="display:none">🃏</div>
                            </div>
                            <div class="pz-zone pz-zone-emz pz-fg-emz-b" id="pz-zone-B" data-zone="B"
                                 onclick="ZonaPractica.onZoneClick('B')" onpointerdown="ZonaPractica._startLongPress('B', event)" onpointerup="ZonaPractica._cancelLongPress()" onpointerleave="ZonaPractica._cancelLongPress()" onpointercancel="ZonaPractica._cancelLongPress()" oncontextmenu="return false;"ondragstart="return false;"><span class="pz-zone-lbl">B</span></div>
                            
                            <div class="pz-zone pz-zone-field pz-fg-c" id="pz-zone-C" data-zone="C"
                                 onclick="ZonaPractica.onZoneClick('C')" onpointerdown="ZonaPractica._startLongPress('C', event)" onpointerup="ZonaPractica._cancelLongPress()" onpointerleave="ZonaPractica._cancelLongPress()" onpointercancel="ZonaPractica._cancelLongPress()" oncontextmenu="return false;"ondragstart="return false;"><span class="pz-zone-lbl">C</span></div>
                            ${[1,2,3,4,5].map(n=>`
                            <div class="pz-zone pz-zone-monster" id="pz-zone-${n}" data-zone="${n}"
                                 onclick="ZonaPractica.onZoneClick('${n}')" onpointerdown="ZonaPractica._startLongPress('${n}', event)" onpointerup="ZonaPractica._cancelLongPress()" onpointerleave="ZonaPractica._cancelLongPress()" onpointercancel="ZonaPractica._cancelLongPress()" oncontextmenu="return false;"ondragstart="return false;"><span class="pz-zone-lbl">${n}</span></div>`).join('')}

                            <!-- Fila S/T -->
                            <div class="pz-fg-st-spacer"></div>
                            ${[6,7,8,9,10].map(n=>`
                            <div class="pz-zone ${n==6||n==10?'pz-zone-pendulum':'pz-zone-st'}" id="pz-zone-${n}" data-zone="${n}"
                                 onclick="ZonaPractica.onZoneClick('${n}')" onpointerdown="ZonaPractica._startLongPress('${n}', event)" onpointerup="ZonaPractica._cancelLongPress()" onpointerleave="ZonaPractica._cancelLongPress()" onpointercancel="ZonaPractica._cancelLongPress()" oncontextmenu="return false;"ondragstart="return false;"><span class="pz-zone-lbl">${n}</span></div>`).join('')}
                            <!-- ARREGLAR AQUI-->

                        </div>
                    </div>

                    <!-- Panel lateral: GY + Banish -->
                    <div class="pz-field-side">
                        <div class="pz-field-side-zone">
                            <div class="pz-multi-zone pz-banish-zone pz-side-zone" id="pz-zone-banish"
                                 onclick="ZonaPractica._onMultiZoneClick(event,'banish')"></div>
                            <div class="pz-field-side-btns">
                                <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('banish')">👁</button>
                                <span class="pz-row-label" id="pz-label-banish">Banish</span>
                            </div>
                        </div>
                        <div class="pz-field-side-zone">
                            <div class="pz-multi-zone pz-gy-zone pz-side-zone" id="pz-zone-gy"
                                 onclick="ZonaPractica._onMultiZoneClick(event,'gy')"></div>
                            <div class="pz-field-side-btns">
                                <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('gy')">👁</button>
                                <span class="pz-row-label" id="pz-label-gy">GY</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- ── ZONAS INFERIORES ── -->

                <!-- Mano -->
                <div class="pz-zone-row pz-hand-row" style="flex-direction:column;align-items:stretch;">
                    <div style="display:flex;align-items:center;gap:6px;width:100%;">
                        <span class="pz-row-label" id="pz-label-hand">Hand</span>
                        <div class="pz-multi-zone pz-hand-zone" id="pz-zone-hand" style="flex:1;"
                             onclick="ZonaPractica._onMultiZoneClick(event,'hand')"></div>
                    </div>
                    <div class="pz-hand-actions-row" style="display:flex;justify-content:center;gap:10px;margin-top:6px;">
                        <button class="pz-mini-btn" title="Ver lista de Mano"
                                onclick="ZonaPractica.openDeckViewer('hand')">👁</button>
                        <button class="pz-mini-btn pz-zone-eye-btn"
                                id="pz-hide-btn-hand" title="Ocultar/Mostrar Hand"
                                onclick="ZonaPractica.toggleHideZone('hand')">🙈</button>
                        <button class="pz-mini-btn" title="Barajar mano"
                                onclick="ZonaPractica.shuffleHand()">🔀</button>
                        <button class="pz-mini-btn" title="Robar carta"
                                onclick="ZonaPractica.drawCard()">⬆</button>
                    </div>
                </div>

                <!-- Main Deck -->
                <div class="pz-zone-row pz-deck-row">
                    <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('main')">👁</button>
                    <button class="pz-mini-btn pz-zone-eye-btn"
                            id="pz-hide-btn-main" title="Voltear todas (Main)"
                            onclick="ZonaPractica._flipAllInZone('main')">🔄</button>
                    <span class="pz-row-label" id="pz-label-main">Main</span>
                    <div class="pz-multi-zone pz-main-zone" id="pz-zone-main"
                         onclick="ZonaPractica._onMultiZoneClick(event,'main')"></div>
                </div>

                <!-- Extra Deck -->
                <div class="pz-zone-row pz-deck-row">
                    <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('extra')">👁</button>
                    <button class="pz-mini-btn pz-zone-eye-btn"
                            id="pz-hide-btn-extra" title="Voltear todas (Extra)"
                            onclick="ZonaPractica._flipAllInZone('extra')">🔄</button>
                    <span class="pz-row-label" id="pz-label-extra">Extra</span>
                    <div class="pz-multi-zone pz-extra-zone" id="pz-zone-extra"
                         onclick="ZonaPractica._onMultiZoneClick(event,'extra')"></div>
                </div>

                
            </div>

            <div class="pz-action-bar">
                <button class="pz-action-btn" onclick="ZonaPractica.shuffleDeck()">🔀 Barajar Deck</button>
                <button class="pz-action-btn" onclick="ZonaPractica.drawCard()">⬆ Robar</button>
                <button class="pz-action-btn" id="pz-btn-chgpos"
                        onclick="ZonaPractica.toggleChangePosition()">↕ Cambiar Pos.</button>
                
                <button class="pz-action-btn" data-section-id="sim-practica-history" onclick="ZonaPractica.saveGameState()">📌 Marcar Estado</button>
                <button class="pz-action-btn" id="pz-btn-hide"
                        onclick="ZonaPractica.toggleHideCards()">🙈 Ocultar Cartas</button>
                <button class="pz-action-btn" onclick="ZonaPractica.openLog()">📋 Log</button>
                <button class="pz-action-btn" onclick="ZonaPractica.flipCoin()">🪙 Moneda</button>
                <button class="pz-action-btn" onclick="ZonaPractica.rollDice()">🎲 Dados</button>
                <button class="pz-action-btn" onclick="ZonaPractica.createToken()">🔘 Token</button>
            </div>
`;
    },

    // ═══════════════════════════════════════════════════════
   setPhase: function (p) {
        if (this.phase === 'end' && p === 'draw') {
            this.turnNumber++;
            if (this._dualMode) {
                const next = this._activePlayer === 'P1' ? 'P2' : 'P1';
                this.switchPlayer(next, { silent: true });
            }
            this._addLog(`--- Turno: ${this.turnNumber} ---`);
        } else {
            const prev = this._phaseLabel(this.phase);
            const next = this._phaseLabel(p);
            this._addLog(`${prev} → <span style="color:#e17055;font-weight:700">${next}</span>`);
        }
        this.phase = p;
        document.querySelectorAll('.pz-phase-btn').forEach(btn => {
            btn.classList.toggle('pz-phase-active', btn.dataset.phase === p);
        });
    },


    _renderZoneInEl: function (el, cards, zoneName) {
        const isHand = zoneName === 'hand';
        const isBanish = zoneName === 'banish';
        el.innerHTML = '';
        if (!Array.isArray(cards) || !cards.length) return;
        const CARD_W = 56;
        const n      = cards.length;
        const maxGap = isHand ? 8 : 6;
        const minGap = isHand ? -52 : -18;
        const avail  = (el.getBoundingClientRect().width || el.offsetWidth || 280) - CARD_W;
        const gap    = Math.max(minGap, Math.min(maxGap, n > 1 ? avail / (n - 1) : maxGap));
        const BACK   = this.CARD_BACK;
        const hiddenZone = this.cardsHidden || (isHand && this.hiddenHand);

        cards.forEach((entry, i) => {
            const slot = document.createElement('div');
            slot.className = 'pz-card-slot';
            slot.style.left = `${i * (CARD_W + gap)}px`;
            const img = document.createElement('img');
            img.className = 'pz-card-img';
            const showFace = entry.faceUp && !hiddenZone;
            img.src = showFace ? (entry.card?.card_images?.[0]?.image_url_small || BACK) : BACK;
            img.onerror = () => { img.src = BACK; };
            if (entry.rotation) img.style.transform = `rotate(${entry.rotation}deg)`;
            if (isBanish && entry.faceUp === false) img.style.opacity = '0.55';
            slot.appendChild(img);
            if (isHand) {
                const iIdx = i;
                slot.addEventListener('pointerdown',  (ev) => { if (ev.button !== 0 && ev.type !== 'pointerdown') return; if (!this.hand[iIdx]?.card) return; this._cancelLongPress(); this._longPressTimer = setTimeout(() => { this._longPressPreventClick = true; if (navigator.vibrate) navigator.vibrate(50); this._showHandQuickMenu(iIdx); }, 250); });
                slot.addEventListener('pointerup',     () => this._cancelLongPress());
                slot.addEventListener('pointerleave',  () => this._cancelLongPress());
                slot.addEventListener('pointercancel', () => this._cancelLongPress());
                slot.addEventListener('contextmenu',   (ev) => ev.preventDefault());
            }
            el.appendChild(slot);
        });
    },

    // ═══════════════════════════════════════════════════════
    openCardSearch: function () {
        document.getElementById('pz-search-overlay')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'pz-search-overlay';
        overlay.className = 'pz-modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) this._closeSearch(); };
        overlay.innerHTML = `
            <div class="pz-modal-box pz-search-box">
                <div class="pz-modal-title">🔍 Buscar Carta</div>
                <button class="pz-modal-close" onclick="ZonaPractica._closeSearch()">✕</button>
                <div class="pz-search-row">
                    <input type="text" id="pz-search-input" class="pz-search-input"
                           placeholder="Nombre de la carta..." autocomplete="off">
                    <button class="pz-search-btn" onclick="ZonaPractica._runSearch()">Buscar</button>
                </div>
                <div class="pz-chip-add-row">
                    <input type="text" id="pz-chip-input" class="pz-chip-input"
                           placeholder="Keyword (Enter o , para añadir)..." autocomplete="off">
                </div>
                <div id="pz-chip-row" class="pz-chip-row"></div>
                <div class="pz-adv-toggle-row">
                    <button class="pz-adv-toggle-btn" onclick="ZonaPractica._toggleAdvPanel()">
                        ⚙ Filtros avanzados <span id="pz-adv-arrow">▼</span>
                    </button>
                    <span id="pz-adv-summary" class="pz-adv-summary"></span>
                    <button id="pz-adv-reset-btn" class="pz-adv-reset-btn"
                            onclick="ZonaPractica._resetAdvFilters()" style="display:none">✕ Limpiar</button>
                    <select id="pz-archetype-sel" class="pz-archetype-sel"
                            onchange="ZonaPractica._setPzFilter('archetype',this.value)">
                        <option value="">— cualquier carta —</option>
                    </select>
                </div>
                <div id="pz-adv-panel" class="adv-filter-panel-inner" style="display:none"></div>
                <div id="pz-search-results" class="pz-search-results">
                    <p class="pz-search-hint">Escribe un nombre o usa filtros (máx. ${this.MAX_RESULTS})</p>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        if (!this._archetypeList.length) {
            fetch('https://db.ygoprodeck.com/api/v7/archetypes.php')
                .then(r => r.json())
                .then(data => {
                    this._archetypeList = (data || []).map(a => a.archetype_name).sort();
                    const sel = document.getElementById('pz-archetype-sel');
                    if (sel) {
                        this._archetypeList.forEach(name => {
                            const opt = document.createElement('option');
                            opt.value       = name;
                            opt.textContent = name;
                            if (name === this.pzFilters.archetype) opt.selected = true;
                            sel.appendChild(opt);
                        });
                    }
                }).catch(() => {});
        } else {
            setTimeout(() => {
                const sel = document.getElementById('pz-archetype-sel');
                if (!sel || sel.options.length > 1) return;
                this._archetypeList.forEach(name => {
                    const opt = document.createElement('option');
                    opt.value       = name;
                    opt.textContent = name;
                    if (name === this.pzFilters.archetype) opt.selected = true;
                    sel.appendChild(opt);
                });
            }, 0);
        }

        const inp = document.getElementById('pz-search-input');
        inp?.focus();
        inp?.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._runSearch(); });
        const chipInp = document.getElementById('pz-chip-input');
        chipInp?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const v = chipInp.value.trim().toLowerCase();
                if (v) { this._addChip(v); chipInp.value = ''; }
            }
        });
    },

    _closeSearch: function () {
        document.getElementById('pz-search-overlay')?.remove();
        this.pzFilterWords = [];
        this.pzFilters = {
            cardCategory:'', attribute:'', monsterType:'', monsterSubtype:'',
            spellSubtype:'', trapSubtype:'', level:'', linkval:'', scale:'', atk:'', def:''
        };
        this.pzFilterPanelOpen = false;
        this._lastSearchResults = [];
    },

    _addChip: function (word) {
        if (!word || this.pzFilterWords.includes(word)) return;
        this.pzFilterWords.push(word);
        this._renderChips();
    },
    _removeChip: function (i) { this.pzFilterWords.splice(i,1); this._renderChips(); },
    _renderChips: function () {
        const el = document.getElementById('pz-chip-row');
        if (!el) return;
        el.innerHTML = this.pzFilterWords.map((w,i) =>
            `<span class="pz-chip">${w}<span class="pz-chip-x" onclick="ZonaPractica._removeChip(${i})">×</span></span>`
        ).join('');
    },

    // ── Filtros avanzados ──────────────────────────────────────────
    _toggleAdvPanel: function () {
        this.pzFilterPanelOpen = !this.pzFilterPanelOpen;
        const panel = document.getElementById('pz-adv-panel');
        const arrow = document.getElementById('pz-adv-arrow');
        if (!panel) return;
        panel.style.display = this.pzFilterPanelOpen ? 'block' : 'none';
        if (arrow) arrow.textContent = this.pzFilterPanelOpen ? '▲' : '▼';
        if (this.pzFilterPanelOpen) this._renderAdvPanel();
    },

    _renderAdvPanel: function () {
        const panel = document.getElementById('pz-adv-panel');
        if (!panel) return;
        const f = this.pzFilters, fd = this.FILTER_DATA;
        const chip = (val, key, cur, label) => {
            const a = cur === val ? ' adv-chip-active' : '';
            return `<span class="adv-chip${a}" onclick="ZonaPractica._setPzFilter('${key}','${val}')">${label||val}</span>`;
        };
        let h = `<div class="adv-row"><span class="adv-label">Tipo</span><div class="adv-chips">
            ${chip('monster','cardCategory',f.cardCategory,'Monstruo')}
            ${chip('spell','cardCategory',f.cardCategory,'Mágica')}
            ${chip('trap','cardCategory',f.cardCategory,'Trampa')}</div></div>`;

        if (f.cardCategory === 'monster') {
            h += `<div class="adv-row"><span class="adv-label">Atributo</span><div class="adv-chips">${fd.attributes.map(a=>chip(a,'attribute',f.attribute)).join('')}</div></div>`;
            h += `<div class="adv-row"><span class="adv-label">Subtipo</span><div class="adv-chips">${fd.monsterSubtypes.map(s=>chip(s,'monsterSubtype',f.monsterSubtype)).join('')}</div></div>`;
            h += `<div class="adv-row"><span class="adv-label">Tipo monstruo</span><div class="adv-chips adv-chips-wrap">${fd.monsterTypes.map(t=>chip(t,'monsterType',f.monsterType)).join('')}</div></div>`;
            const isLink = f.monsterSubtype==='Link', isXYZ=f.monsterSubtype==='XYZ', isPend=f.monsterSubtype==='Pendulum';
            if (!isLink) h += `<div class="adv-row"><span class="adv-label">${isXYZ?'Rango':'Nivel'}</span><div class="adv-chips">${fd.levels.map(l=>chip(l,'level',f.level)).join('')}</div></div>`;
            if (isLink)  h += `<div class="adv-row"><span class="adv-label">Link</span><div class="adv-chips">${fd.linkvals.map(l=>chip(l,'linkval',f.linkval)).join('')}</div></div>`;
            if (isPend)  h += `<div class="adv-row"><span class="adv-label">Escala</span><div class="adv-chips">${fd.scales.map(s=>chip(s,'scale',f.scale)).join('')}</div></div>`;
            h += `<div class="adv-row adv-row-inputs">
                <div class="adv-input-group"><span class="adv-label">ATK</span>
                    <input type="number" class="adv-input" value="${f.atk}" placeholder="ej:2500" min="0"
                           onchange="ZonaPractica._setPzFilter('atk',this.value)"></div>
                <div class="adv-input-group"><span class="adv-label">DEF</span>
                    <input type="number" class="adv-input" value="${f.def}" placeholder="ej:2000" min="0"
                           onchange="ZonaPractica._setPzFilter('def',this.value)"></div></div>`;
        } else if (f.cardCategory === 'spell') {
            h += `<div class="adv-row"><span class="adv-label">Tipo mágica</span><div class="adv-chips">${fd.spellSubtypes.map((s,i)=>chip(fd.spellSubtypesEn[i],'spellSubtype',f.spellSubtype,s)).join('')}</div></div>`;
        } else if (f.cardCategory === 'trap') {
            h += `<div class="adv-row"><span class="adv-label">Tipo trampa</span><div class="adv-chips">${fd.trapSubtypes.map((s,i)=>chip(fd.trapSubtypesEn[i],'trapSubtype',f.trapSubtype,s)).join('')}</div></div>`;
        }
        panel.innerHTML = h;
    },

    _setPzFilter: function (key, value) {
        if (this.pzFilters[key] === value) {
            this.pzFilters[key] = '';
        } else {
            this.pzFilters[key] = value;
            if (key === 'cardCategory') Object.assign(this.pzFilters, {
                attribute:'', monsterType:'', monsterSubtype:'',
                spellSubtype:'', trapSubtype:'', level:'', linkval:'', scale:'', atk:'', def:''
            });
            if (key === 'monsterSubtype') Object.assign(this.pzFilters, {level:'',linkval:'',scale:''});
        }
        this._updateAdvSummary();
        if (this.pzFilterPanelOpen) this._renderAdvPanel();
    },

    _resetAdvFilters: function () {
        Object.assign(this.pzFilters, {
            cardCategory:'', attribute:'', monsterType:'', monsterSubtype:'',
            spellSubtype:'', trapSubtype:'', level:'', linkval:'', scale:'', atk:'', def:'',
            archetype: ''
        });
        const sel = document.getElementById('pz-archetype-sel');
        if (sel) sel.value = '';
        this._updateAdvSummary();
        if (this.pzFilterPanelOpen) this._renderAdvPanel();
    },

    _updateAdvSummary: function () {
        const f = this.pzFilters, parts = [];
        if (f.cardCategory)   parts.push(f.cardCategory==='monster'?'Monstruo':f.cardCategory==='spell'?'Mágica':'Trampa');
        if (f.attribute)      parts.push(f.attribute);
        if (f.monsterSubtype) parts.push(f.monsterSubtype);
        if (f.monsterType)    parts.push(f.monsterType);
        if (f.spellSubtype)   parts.push(f.spellSubtype);
        if (f.trapSubtype)    parts.push(f.trapSubtype);
        if (f.level)          parts.push(`Nv.${f.level}`);
        if (f.linkval)        parts.push(`Link ${f.linkval}`);
        if (f.scale)          parts.push(`Esc.${f.scale}`);
        if (f.atk)            parts.push(`ATK ${f.atk}`);
        if (f.def)            parts.push(`DEF ${f.def}`);
        const s = document.getElementById('pz-adv-summary');
        const r = document.getElementById('pz-adv-reset-btn');
        if (s) s.textContent = parts.join(' · ');
        if (r) r.style.display = parts.length ? 'inline-block' : 'none';
    },

    _hasPzAdvFilters: function () {
        const f = this.pzFilters;
        return !!(f.cardCategory||f.attribute||f.monsterType||f.monsterSubtype||
                  f.spellSubtype||f.trapSubtype||f.level||f.linkval||f.scale||f.atk||f.def||f.archetype);
    },

    _buildApiUrl: function (term) {
        const f = this.pzFilters, params = new URLSearchParams();
        if (term) params.set('fname', term);
        if (f.cardCategory === 'monster') {
            const sub = f.monsterSubtype;
            if (sub && sub !== 'Pendulum') { const m = this.SUBTYPE_API_MAP[sub]; if (m) params.set('type', m); }
            if (f.attribute)   params.set('attribute', f.attribute);
            if (f.monsterType) params.set('race',      f.monsterType);
            if (f.level)       params.set('level',     f.level);
            if (f.linkval)     params.set('linkval',   f.linkval);
            if (f.scale)       params.set('scale',     f.scale);
            if (f.atk)         params.set('atk',       f.atk);
            if (f.def)         params.set('def',       f.def);
        } else if (f.cardCategory === 'spell') {
            params.set('type', 'Spell Card');
            if (f.spellSubtype) params.set('race', f.spellSubtype);
        } else if (f.cardCategory === 'trap') {
            params.set('type', 'Trap Card');
            if (f.trapSubtype) params.set('race', f.trapSubtype);
        }

        if (this.pzFilters.archetype) params.set('archetype', this.pzFilters.archetype);
        const qs = params.toString();
        return qs ? `${this.API_URL}?${qs}` : this.API_URL;
    },

    _applyLocalFilters: function (cards) {
        let r = cards;
        if (this.pzFilterWords.length) {
            r = r.filter(c => {
                const t = [c.name,c.type,c.desc,c.race,c.attribute].join(' ').toLowerCase();
                return this.pzFilterWords.every(w => t.includes(w));
            });
        }
        if (!this._hasPzAdvFilters()) return r;
        const f = this.pzFilters;
        return r.filter(c => {
            const type = (c.type||'').toLowerCase(), race = (c.race||'').toLowerCase(), attr = (c.attribute||'').toUpperCase();
            if (f.cardCategory==='monster' && !type.includes('monster'))    return false;
            if (f.cardCategory==='spell'   && !type.includes('spell card')) return false;
            if (f.cardCategory==='trap'    && !type.includes('trap card'))  return false;
            if (f.cardCategory === 'monster') {
                if (f.attribute   && attr !== f.attribute.toUpperCase())    return false;
                if (f.monsterType && race !== f.monsterType.toLowerCase())  return false;
                if (f.monsterSubtype) {
                    const s = f.monsterSubtype.toLowerCase();
                    if (s==='pendulum'&&!type.includes('pendulum')) return false;
                    if (s==='tuner'   &&!type.includes('tuner'))    return false;
                    if (s==='flip'    &&!type.includes('flip'))     return false;
                    if (s==='gemini'  &&!type.includes('gemini'))   return false;
                    if (s==='union'   &&!type.includes('union'))    return false;
                    if (s==='spirit'  &&!type.includes('spirit'))   return false;
                    if (s==='fusion'  &&!type.includes('fusion'))   return false;
                    if (s==='synchro' &&!type.includes('synchro'))  return false;
                    if (s==='xyz'     &&!type.includes('xyz'))      return false;
                    if (s==='link'    &&!type.includes('link'))     return false;
                    if (s==='ritual'  &&!type.includes('ritual'))   return false;
                    if (s==='normal'  &&!type.includes('normal monster')) return false;
                    if (s==='effect'  &&!type.includes('effect monster')&&!type.includes('flip effect')&&!type.includes('pendulum effect')) return false;
                }
                if (f.level   && (c.level||c.rank)!==parseInt(f.level))  return false;
                if (f.linkval && c.linkval!==parseInt(f.linkval))         return false;
                if (f.scale   && c.scale  !==parseInt(f.scale))          return false;
                if (f.atk!=='' && c.atk!==parseInt(f.atk))               return false;
                if (f.def!=='' && c.def!==parseInt(f.def))               return false;
            }
            if (f.cardCategory==='spell' && f.spellSubtype && race!==f.spellSubtype.toLowerCase()) return false;
            if (f.cardCategory==='trap'  && f.trapSubtype  && race!==f.trapSubtype.toLowerCase())  return false;
            return true;
        });
    },

    _runSearch: async function () {
        const query = (document.getElementById('pz-search-input')?.value || '').trim();
        const resultsEl = document.getElementById('pz-search-results');
        if (!resultsEl) return;
        const hasFilters = this._hasPzAdvFilters() || this.pzFilterWords.length > 0;
        if (!query && !hasFilters) {
            resultsEl.innerHTML = '<p class="pz-search-hint">Escribe un nombre o usa filtros.</p>';
            return;
        }
        resultsEl.innerHTML = '<p class="pz-search-hint">⏳ Buscando...</p>';
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(async () => {
            try {
                const res  = await fetch(this._buildApiUrl(query));
                const data = await res.json();
                let cards  = this._applyLocalFilters(data.data || []).slice(0, this.MAX_RESULTS);
                if (!cards.length) {
                    resultsEl.innerHTML = '<p class="pz-search-hint">Sin resultados.</p>';
                    return;
                }
                this._lastSearchResults = cards;
                resultsEl.innerHTML = cards.map((c,i) => `
                    <div class="pz-search-item">
                        <img src="${c.card_images[0].image_url_small}" class="pz-search-thumb"
                             onerror="this.src='${this.CARD_BACK}'">
                        <div class="pz-search-info">
                            <div class="pz-search-name">${c.name}</div>
                            <div class="pz-search-type">${c.type}</div>
                        </div>
                        <div class="pz-search-btns">
                            <button class="pz-search-view-btn"
                                    onclick="ZonaPractica._openMiniCV(${i})">Ver</button>
                            <button class="pz-search-add-btn"
                                    onclick="ZonaPractica._addSearchCard(${i})">Añadir</button>
                        </div>
                    </div>`).join('');
            } catch (err) {
                resultsEl.innerHTML = '<p class="pz-search-hint">❌ Error de conexión.</p>';
            }
        }, 250);
    },

    _addSearchCard: function (index) {
        const card = this._lastSearchResults[index];
        if (!card) return;
        this.other.push({ card, faceUp: true, rotation: 0 });
        this._renderZone('other');
        this._addLog(`Añadida a Other: ${card.name}`, card);
        // Feedback visual en el botón sin cerrar el buscador
        const btns = document.querySelectorAll('#pz-search-results .pz-search-add-btn');
        const btn  = btns[index];
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = '✓';
            btn.disabled = true;
            setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 900);
        }
    },

    // ═══════════════════════════════════════════════════════
    _openMiniCV: function (indexOrCard) {
        document.getElementById('pz-minicv-overlay')?.remove();
        const card = typeof indexOrCard === 'number' ? this._lastSearchResults[indexOrCard] : indexOrCard;
        if (!card) return;

        const imgSrc  = card.card_images?.[0]?.image_url_small || this.CARD_BACK;
        const ban     = card.banlist_info || {};
        const bColors = { 'Forbidden':'#d63031','Limited':'#e67e22','Semi-Limited':'#fdcb6e','Unlimited':'#00b894' };
        const fmtBan  = (lbl, val) => {
            const v = val || 'Unlimited';
            const c = bColors[v] || '#00b894';
            return `<span class="pz-mcv-ban" style="background:${c}22;border-color:${c};color:${c}">${lbl}: ${v}</span>`;
        };
        let statsHtml = '';
        if (card.atk !== undefined) {
            const parts = [];
            if (card.attribute) parts.push(`⚡ ${card.attribute}`);
            if (card.level)     parts.push(`★ Nv.${card.level}`);
            if (card.rank)      parts.push(`★ Rg.${card.rank}`);
            if (card.linkval)   parts.push(`🔗 Link ${card.linkval}`);
            if (card.race)      parts.push(`🐉 ${card.race}`);
            parts.push(`ATK ${card.atk ?? '?'}`);
            if (card.def != null) parts.push(`DEF ${card.def}`);
            statsHtml = `<div class="pz-mcv-stats">${parts.map(p=>`<span>${p}</span>`).join('')}</div>`;
        } else if (card.race) {
            statsHtml = `<div class="pz-mcv-stats"><span>${card.race}</span></div>`;
        }

        const addIdx = typeof indexOrCard === 'number' ? indexOrCard : -1;

        const overlay = document.createElement('div');
        overlay.id = 'pz-minicv-overlay';
        overlay.className = 'pz-modal-overlay pz-mcv-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="pz-modal-box pz-mcv-box">
                <button class="pz-modal-close"
                        onclick="document.getElementById('pz-minicv-overlay').remove()">✕</button>
                <div class="pz-mcv-name">${card.name}</div>
                <div class="pz-mcv-layout">
                    <div class="pz-mcv-img-col">
                        <img src="${imgSrc}" class="pz-mcv-img"
                             onerror="this.src='${this.CARD_BACK}'">
                        <div class="pz-mcv-ban-row">
                            ${fmtBan('TCG', ban.ban_tcg)}
                            ${fmtBan('OCG', ban.ban_ocg)}
                        </div>
                    </div>
                    <div class="pz-mcv-info-col">
                        <div class="pz-mcv-type">${card.type || ''}</div>
                        ${statsHtml}
                        <div class="pz-mcv-desc" id="pz-mcv-desc-text">${card.desc || (card.id ? 'Cargando descripción...' : '')}</div>
                    </div>
                </div>
                ${addIdx >= 0 ? `<button class="pz-mcv-add-btn"
                    onclick="ZonaPractica._addSearchCard(${addIdx});document.getElementById('pz-minicv-overlay')?.remove()">
                    ➕ Añadir a Other Options</button>` : ''}
            </div>`;
        document.body.appendChild(overlay);

        // Las cartas restauradas desde una Marca de Estado (recargadas vía
        // _loadStatesFromDeck) vienen "slim" — sin `desc` ni `banlist_info`, para no
        // saturar localStorage (ver _slimEntry/_saveStatesToDeck). Si falta el desc,
        // se completa aquí mismo con un fetch puntual por ID, sin tocar el guardado slim.
        if (!card.desc && card.id) {
            fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${card.id}`)
                .then(r => r.json())
                .then(data => {
                    const full = data?.data?.[0];
                    const descEl = document.getElementById('pz-mcv-desc-text');
                    if (descEl) descEl.textContent = full?.desc || 'Descripción no disponible.';
                    if (full?.banlist_info) {
                        const banRow = document.querySelector('#pz-minicv-overlay .pz-mcv-ban-row');
                        if (banRow) {
                            banRow.innerHTML = `${fmtBan('TCG', full.banlist_info.ban_tcg)}${fmtBan('OCG', full.banlist_info.ban_ocg)}`;
                        }
                    }
                })
                .catch(() => {
                    const descEl = document.getElementById('pz-mcv-desc-text');
                    if (descEl) descEl.textContent = 'No se pudo cargar la descripción.';
                });
        }
    },
// ═══════════════════════════════════════════════════════
    // Prompt previo: ¿a qué jugador va el deck? (antes de listar decks)
    openUseDeckPrompt: function () {
        document.getElementById('pz-player-prompt-overlay')?.remove();
        const cur = this._activePlayer;
        const overlay = document.createElement('div');
        overlay.id        = 'pz-player-prompt-overlay';
        overlay.className = 'pz-modal-overlay';
        overlay.onclick   = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="pz-modal-box pz-pp-box">
                <div class="pz-modal-title">🃏 ¿Deck para qué jugador?</div>
                <button class="pz-modal-close"
                        onclick="document.getElementById('pz-player-prompt-overlay').remove()">✕</button>
                <div class="pz-pp-body">
                    <button class="pz-pp-btn pz-pp-p1 ${cur==='P1' ? 'pz-pp-active' : ''}"
                            onclick="ZonaPractica._confirmDeckTarget('P1')">
                        Jugador P1${cur==='P1' ? ' <span class="pz-pp-tag">(activo)</span>' : ''}
                    </button>
                    <button class="pz-pp-btn pz-pp-p2 ${cur==='P2' ? 'pz-pp-active' : ''}"
                            onclick="ZonaPractica._confirmDeckTarget('P2')">
                        Jugador P2${cur==='P2' ? ' <span class="pz-pp-tag">(activo)</span>' : ''}
                    </button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    _confirmDeckTarget: function (target) {
        document.getElementById('pz-player-prompt-overlay')?.remove();
        if (target !== this._activePlayer) this.switchPlayer(target);
        this.openDeckSelector();
    },
    // ═══════════════════════════════════════════════════════
    openDeckSelector: function () {
        document.getElementById('pz-deck-overlay')?.remove();
        const saved   = window.Deck    ? Deck.getSavedDecks() : [];
        const engines = window.Engines ? Engines.getAll()     : [];
        let meta = [];
        try {
            const raw = localStorage.getItem('yugioh_meta_decks');
            if (raw) { const folders = JSON.parse(raw); Object.values(folders).forEach(f => (f.decks||[]).forEach(d => meta.push(d))); }
        } catch (_) {}
        this._dsCache = { saved, engines, meta };

        const buildSec = (title, items, type) => {
            if (!items.length) return '';
            return `<div class="pz-ds-section"><div class="pz-ds-section-title">${title}</div><div class="pz-ds-list">
                ${items.map((item,i) => {
                    const name  = item.name || '(Sin nombre)';
                    const cards = item.cards || {};
                    const as    = Object.values(cards).find(c=>c.roles?.includes('Carta As'));
                    const cover = as ? (as.data?.card_images?.[0]?.image_url_small || this.CARD_BACK) : this.CARD_BACK;
                    const mN    = Object.values(cards).filter(c=>c.location==='main').reduce((s,c)=>s+c.qty,0);
                    const eN    = Object.values(cards).filter(c=>c.location==='extra').reduce((s,c)=>s+c.qty,0);
                    return `<div class="pz-ds-item" onclick="ZonaPractica._loadDeck('${type}',${i})">
                        <img src="${cover}" class="pz-ds-thumb" onerror="this.src='${this.CARD_BACK}'">
                        <div class="pz-ds-info">
                            <div class="pz-ds-name">${name}</div>
                            <div class="pz-ds-counts">Main: ${mN} · Extra: ${eN}</div>
                        </div></div>`;
                }).join('')}</div></div>`;
        };

        const overlay = document.createElement('div');
overlay.id = 'pz-deck-overlay';
overlay.className = 'pz-modal-overlay';
overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
overlay.innerHTML = `
    <div class="pz-modal-box pz-ds-box">
        <div class="pz-modal-title">🃏 Seleccionar Deck</div>
        <button class="pz-modal-close"
                onclick="document.getElementById('pz-deck-overlay').remove()">✕</button>
        <div class="pz-ds-body">
            <div class="pz-ds-section">
                <button class="pz-ctrl-btn pz-ctrl-deck" style="width:100%;margin-bottom:4px"
                        onclick="ZonaPractica._importYDK()">📥 Importar deck (.ydk)</button>
            </div>
            ${saved.length||engines.length||meta.length
                ? buildSec('📁 Decks Guardados',saved,'saved') +
                  buildSec('⚙️ Engines',engines,'engines') +
                  buildSec('🌐 Meta Decks',meta,'meta')
                : '<p class="pz-search-hint">No hay decks disponibles.</p>'}
        </div>
    </div>`;
        document.body.appendChild(overlay);
    },

    _loadDeck: function (type, indexStr) {
    const src = this._dsCache[type];
    const dk  = src?.[parseInt(indexStr)];
    if (!dk) return;
    const cards = dk.cards || {};
    this._resetState();
    this.logEntries    = [];
    this.gameStates    = [];
    this._chainCounter = 0;
    this._chainedCards = [];
    this._chainResolving = false;
    this._tokenCounter = 0;
    this.lp = 8000;
    const lpEl = document.getElementById('pz-lp-val');
    if (lpEl) lpEl.textContent = '8,000';
    document.getElementById('pz-chain-resolve-btn')?.remove();
    document.getElementById('pz-log-panel')?.remove();
    document.getElementById('pz-nav-panel')?.remove();
    const swBtn = document.getElementById('pz-sw-toggle-btn');
    if (swBtn) swBtn.style.display = 'none';
    if (this.statusWidgetVisible) {
        this.statusWidgetVisible = false;
        document.getElementById('pz-status-widget')?.remove();
    }
        const main=[], extra=[], side=[];
        Object.values(cards).forEach(item => {
            for (let i=0; i<(item.qty||1); i++) {
                const e = { card: item.data||item, faceUp:false, rotation:0 };
                if      (item.location==='main')  main.push(e);
                else if (item.location==='extra') extra.push({...e});
                else if (item.location==='side')  side.push({...e, faceUp:true});
            }
        });
        for (let i=main.length-1; i>0; i--) {
            const j = Math.floor(Math.random()*(i+1));
            [main[i],main[j]] = [main[j],main[i]];
        }
        this.main=main; this.extra=extra; this.other=side;
        this._addLog(`Deck: ${dk.name||'(sin nombre)'} — Main:${main.length} Extra:${extra.length} Side→Other:${side.length}`);
        if (type === 'saved' && dk.name) {
            this._activeDeckName = dk.name;
            const saved = this._loadStatesFromDeck(dk.name);
            if (saved && saved.length) {
                this.gameStates = saved;
                const swBtn = document.getElementById('pz-sw-toggle-btn');
                if (swBtn) swBtn.style.display = '';
                this._addLog(`📌 ${saved.length} estado(s) restaurado(s) del deck "${dk.name}".`);
            }
        } else {
            this._activeDeckName = null;
        }
        document.getElementById('pz-deck-overlay')?.remove();
        this._renderAllZones();
       
    },

    clearBoard: function () {
    this._resetState(); this._cancelMoveMode();
    if (this.changePositionMode) this.toggleChangePosition();
    if (this.cardsHidden)        this.toggleHideCards();
    this.hiddenHand  = false;
    this.hiddenMain  = false;
    this.hiddenExtra = false;
    this._syncZoneHideBtns();
    this.phase='draw'; this.turnNumber=1;
    this.logEntries    = [];
    this.gameStates    = [];
    this._chainCounter = 0;
    this._chainedCards = [];
    this._tokenCounter = 0;
    this.lp = 8000;
    const lpEl = document.getElementById('pz-lp-val');
    if (lpEl) lpEl.textContent = '8,000';
    document.getElementById('pz-log-panel')?.remove();
    document.getElementById('pz-nav-panel')?.remove();
    document.getElementById('pz-chain-resolve-btn')?.remove();
    if (this.statusWidgetVisible) {
        this.statusWidgetVisible = false;
        document.getElementById('pz-status-widget')?.remove();
    }
    const swBtn = document.getElementById('pz-sw-toggle-btn');
    if (swBtn) swBtn.style.display = 'none';
    document.querySelectorAll('.pz-phase-btn').forEach(b => b.classList.toggle('pz-phase-active', b.dataset.phase==='draw'));
    this._renderAllZones();
    this._addLog('Tablero limpiado.');
    this._saveStatesToDeck();
    },

   _resetState: function () {
    Object.keys(this.field).forEach(k => this.field[k]=null);
    this.hand=[]; this.main=[]; this.extra=[]; this.gy=[]; this.banish=[]; this.other=[];
},
_defaultPlayerState: function () {
        return {
            field: { 'A':null,'B':null,'C':null,'1':null,'2':null,'3':null,'4':null,'5':null,
                      '6':null,'7':null,'8':null,'9':null,'10':null },
            hand:[], main:[], extra:[], gy:[], banish:[], other:[],
            lp: 8000,
            _activeDeckName: null,
            changePositionMode: false,
            cardsHidden: false,
            hiddenHand: false, hiddenMain: false, hiddenExtra: false,
            _tokenCounter: 0
        };
    },

    _snapshotPlayerState: function () {
        const s = {};
        this._STATE_KEYS.forEach(k => {
            const v = this[k];
            s[k] = Array.isArray(v) ? v.map(e => ({...e}))
                 : (v && typeof v === 'object' ? {...v} : v);
        });
        return s;
    },

    _applyPlayerState: function (state) {
        const src = state || this._defaultPlayerState();
        this._STATE_KEYS.forEach(k => {
            const v = src[k];
            this[k] = Array.isArray(v) ? v.map(e => ({...e}))
                    : (v && typeof v === 'object' ? {...v} : v);
        });
    },

    // Reconcilia botones/clases que dependen de flags del jugador activo
    // (no dispara logs ni toasts, solo sincroniza UI tras el swap de datos)
    _syncModeUI: function () {
        document.getElementById('pz-btn-chgpos')?.classList.toggle('pz-action-active', this.changePositionMode);
        document.getElementById('pz-board-outer')?.classList.toggle('pz-chgpos-mode', this.changePositionMode);
        const hideBtn = document.getElementById('pz-btn-hide');
        if (hideBtn) {
            hideBtn.innerHTML = this.cardsHidden ? '👁 Mostrar Cartas' : '🙈 Ocultar Cartas';
            hideBtn.classList.toggle('pz-action-active', this.cardsHidden);
        }
        document.getElementById('pz-hide-widget')?.remove();
        if (this.cardsHidden) this._showHideWidget();
        this._syncZoneHideBtns();
    },

    // ═══════════════════════════════════════════════════════
    switchPlayer: function (target, opts) {
        if (target !== 'P1' && target !== 'P2') return;
        if (target === this._activePlayer) return;

        this._dualMode = true;
        this._cancelMoveMode();
        this._cancelPlacement();
        document.getElementById('pz-log-panel')?.remove();
        document.getElementById('pz-nav-panel')?.remove();
        document.getElementById('pz-chain-resolve-btn')?.remove();
        document.getElementById('pz-toast')?.remove();
        if (this.statusWidgetVisible) {
            this.statusWidgetVisible = false;
            document.getElementById('pz-status-widget')?.remove();
        }

        this._players[this._activePlayer] = this._snapshotPlayerState();
        this._activePlayer = target;
        this._applyPlayerState(this._players[target]);

        const lpEl = document.getElementById('pz-lp-val');
        if (lpEl) lpEl.textContent = (this.lp ?? 8000).toLocaleString();

        this._syncModeUI();

        const wrap = this._container?.querySelector('.pz-wrap');
        if (wrap) wrap.classList.toggle('pz-wrap-p2', target === 'P2');

        this._renderAllZones();
        if (!opts || !opts.silent) this._addLog(`--- Jugador activo: ${target} ---`);
        this._updatePlayerToggleBtn();
    },

    _updatePlayerToggleBtn: function () {
        const btn = document.getElementById('pz-float-player-btn');
        if (!btn) return;
        btn.textContent = this._activePlayer;
        btn.classList.toggle('pz-float-btn-p2', this._activePlayer === 'P2');
    },
    // ═══════════════════════════════════════════════════════
    onZoneClick: function (zone) {
    if (this._longPressPreventClick) { this._longPressPreventClick = false; return; }
    if (this._activePlacement) { this._completePlacement(zone); return; }
    if (this._activeMove) { this._completeMoveToField(zone); return; }
        if (this.changePositionMode) {
            const entry = this.field[zone];
            if (entry?.card) {
                const pos = this._cyclePosition(entry, zone);
                this._addLog(`${entry.card.name}: ${pos}`, entry.card);
                this._renderFieldZone(zone);
            }
            return;
        }
        if (!this.field[zone]) return;
        this._showZoneMenu(zone, null, 'field');
    },

    _showZoneMenu: function (zone, slotIndex, zoneType) {
    // Si hay un menú activo en esta misma zona, solo cerrarlo
    const existing = document.getElementById('pz-zone-menu-active');
    if (existing) {
        this._closeZoneMenus();
        return;
    }
    const elId = `pz-zone-${zone}`;
    const containerEl = document.getElementById(elId);
    if (!containerEl) return;
    containerEl.classList.add('pz-menu-open');

    let anchor = containerEl;
    if (zoneType === 'multi' && slotIndex !== null) {
        const slots = containerEl.querySelectorAll('.pz-card-slot');
        if (slots[slotIndex]) anchor = slots[slotIndex];
    }

    const menu = document.createElement('div');
    menu.className = 'pz-zone-menu';
    menu.id = 'pz-zone-menu-active';
    if (zone === 'hand') {
        menu.innerHTML = `
            <button class="pz-zmenu-btn pz-zmenu-ver"
                    onclick="ZonaPractica._zmView('hand',${slotIndex},event)">Ver</button>
            <button class="pz-zmenu-btn pz-zmenu-activate"
                    onclick="ZonaPractica._zmActivate('hand',${slotIndex},'multi',event)">Activar</button>
            <button class="pz-zmenu-btn pz-zmenu-move"
                    onclick="ZonaPractica._zmStartMove('hand',${slotIndex},'multi',event)" onmouseup="ZonaPractica._zmStartMove('hand',${slotIndex},'multi',event)">Mover</button>`;
    } else {
        menu.innerHTML = `
            <button class="pz-zmenu-btn pz-zmenu-ver"
                    onclick="ZonaPractica._zmView('${zone}',${slotIndex},event)">Ver</button>
            <button class="pz-zmenu-btn pz-zmenu-accion"
                    onclick="ZonaPractica._zmShowAction('${zone}',${slotIndex},'${zoneType}',event)">Acción</button>`;
    }
    anchor.appendChild(menu);

    const close = (e) => {
        if (!menu.contains(e.target)) {
            this._closeZoneMenus();
            document.removeEventListener('click', close, true);
        }
    };
    setTimeout(() => document.addEventListener('click', close, true), 50);
},
_startLongPress: function (zone, e) {
        if (e.button !== 0 && e.type !== 'pointerdown') return;
        if (!this.field[zone] || !this.field[zone].card) return;
        this._cancelLongPress();
        this._longPressTimer = setTimeout(() => {
            this._longPressPreventClick = true;
            this._showQuickActionMenu(zone, e);
        }, 250);
    },

    _cancelLongPress: function () {
        if (this._longPressTimer) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
    },

    _showHandQuickMenu: function (idx) {
        this._closeZoneMenus();
        const containerEl = document.getElementById('pz-zone-hand');
        if (!containerEl) return;
        containerEl.classList.add('pz-menu-open');
        const slots = containerEl.querySelectorAll('.pz-card-slot');
        const anchor = slots[idx] || containerEl;
        const sub = document.createElement('div');
        sub.className = 'pz-action-submenu pz-quick-action';
        sub.innerHTML = `
            <button class="pz-zmenu-btn pz-zmenu-ver"
                    onclick="ZonaPractica._zmView('hand',${idx},event)">Ver</button>
            <button class="pz-zmenu-btn pz-zmenu-activate"
                    onclick="ZonaPractica._zmActivate('hand',${idx},'multi',event)">Activar</button>
            <button class="pz-zmenu-btn pz-zmenu-move"
                    onclick="ZonaPractica._zmStartMove('hand',${idx},'multi',event)" onmouseup="ZonaPractica._zmStartMove('hand',${idx},'multi',event)">Mover</button>`;
        anchor.appendChild(sub);
        const close = (e2) => { if (!sub.contains(e2.target)) { sub.remove(); containerEl.classList.remove('pz-menu-open'); document.removeEventListener('click', close, true); } };
        setTimeout(() => document.addEventListener('click', close, true), 50);
    },
_startLongPressMulti: function (zone, idx, e) {
        if (e.button !== 0 && e.type !== 'pointerdown') return;
        const arr = this._getMultiArray(zone);
        if (!arr[idx]?.card) return;
        this._cancelLongPress();
        this._longPressTimer = setTimeout(() => {
            this._longPressPreventClick = true;
            this._zmShowAction(zone, idx, 'multi', e);
        }, 250);
    },
    _showQuickActionMenu: function (zone, e) {
        this._closeZoneMenus();
        const elId = `pz-zone-${zone}`;
        const containerEl = document.getElementById(elId);
        if (!containerEl) return;
        containerEl.classList.add('pz-menu-open');

        if (navigator.vibrate) navigator.vibrate(20);

        const hasMats = this.OVERLAY_ZONES.includes(String(zone)) && (this.field[zone]?._materials?.length > 0);
        const canAttack = this._canAttack(zone, 'field');

        const sub = document.createElement('div');
        sub.className = 'pz-action-submenu pz-quick-action';
        sub.innerHTML = `
            <button class="pz-zmenu-btn pz-zmenu-activate"
                    onclick="ZonaPractica._zmActivate('${zone}',null,'field',event)">Activar</button>
            ${canAttack ? `<button class="pz-zmenu-btn pz-zmenu-attack"
                    onclick="ZonaPractica._zmAttack('${zone}',event)">Atacar</button>` : ''}
            ${hasMats ? `<button class="pz-zmenu-btn"
                    onclick="ZonaPractica._showDetachMenu('${zone}',event)" onmouseup="ZonaPractica._showDetachMenu('${zone}',event)">⛓ Desacoplar</button>` : ''}
            <button class="pz-zmenu-btn pz-zmenu-move"
                    onclick="ZonaPractica._zmStartMove('${zone}',null,'field',event)" onmouseup="ZonaPractica._zmStartMove('${zone}',null,'field',event)">Mover</button>`;
        
        containerEl.appendChild(sub);

        const close = (e2) => { if (!sub.contains(e2.target)) { sub.remove(); containerEl.classList.remove('pz-menu-open'); document.removeEventListener('click', close, true); } };
        setTimeout(() => document.addEventListener('click', close, true), 10);
    },
   _closeZoneMenus: function () {
        document.querySelectorAll('.pz-zone-menu, .pz-action-submenu').forEach(m => m.remove());
        document.querySelectorAll('.pz-menu-open').forEach(el => el.classList.remove('pz-menu-open'));
    },
    _zmView: function (zone, slotIndex, e) {
        e?.stopPropagation();
        this._closeZoneMenus();
        let entry = null;
        if (slotIndex === null || slotIndex === 'null' || slotIndex === undefined) {
            entry = this.field[zone];
        } else {
            entry = this._getMultiArray(zone)[parseInt(slotIndex)];
        }
        const card = entry?.card;
        if (!card) return;
        this._openMiniCV(card);
        if ((slotIndex === null || slotIndex === 'null' || slotIndex === undefined) && this.OVERLAY_ZONES.includes(String(zone))) {
            const mats = this.field[zone]?._materials;
            if (mats?.length) {
                setTimeout(() => this._appendMaterialsPanel(zone, mats), 60);
            }
        }
    },

    _appendMaterialsPanel: function (zone, mats) {
        const box = document.querySelector('#pz-minicv-overlay .pz-mcv-box');
        if (!box || document.getElementById('pz-xyz-mats-panel')) return;
        const panel = document.createElement('div');
        panel.id        = 'pz-xyz-mats-panel';
        panel.className = 'pz-xyz-materials-panel';
        panel.innerHTML = `<div class="pz-xyz-materials-title">⛓ Materiales Acoplados (${mats.length}):</div>` +
            mats.map((m, i) => {
                const img  = m.card?.card_images?.[0]?.image_url_small || this.CARD_BACK;
                const name = m.card?.name || '?';
                return `<div class="pz-xyz-mat-row">
                    <img src="${img}" class="pz-xyz-mat-thumb"
                         onerror="this.src='${this.CARD_BACK}'"
                         onclick="ZonaPractica._openMiniCV(ZonaPractica.field['${zone}']._materials[${i}]?.card)"
                         title="${name}">
                    <span class="pz-xyz-mat-name">${name}</span>
                    <button class="pz-xyz-detach-btn"
                            onclick="ZonaPractica._detachMaterial('${zone}',${i})">Desacoplar</button>
                </div>`;
            }).join('');
        box.appendChild(panel);
    },

    _zmShowAction: function (zone, slotIndex, zoneType, e) {
        e?.stopPropagation();
        this._closeZoneMenus();
        const elId = `pz-zone-${zone}`;
        const containerEl = document.getElementById(elId);
        if (!containerEl) return;
        let anchor = containerEl;
        if (zoneType === 'multi' && slotIndex !== null) {
            const slots = containerEl.querySelectorAll('.pz-card-slot');
            if (slots[slotIndex]) anchor = slots[slotIndex];
        }
        const hasMats = zoneType === 'field' && this.OVERLAY_ZONES.includes(String(zone)) && (this.field[zone]?._materials?.length > 0);
        const canAttack = this._canAttack(zone, zoneType);
        const sub = document.createElement('div');
        sub.className = 'pz-action-submenu';
        sub.innerHTML = `
            <button class="pz-zmenu-btn pz-zmenu-activate"
                    onclick="ZonaPractica._zmActivate('${zone}',${slotIndex},'${zoneType}',event)">Activar</button>
            ${canAttack ? `<button class="pz-zmenu-btn pz-zmenu-attack"
                    onclick="ZonaPractica._zmAttack('${zone}',event)">Atacar</button>` : ''}
            ${hasMats ? `<button class="pz-zmenu-btn"
                    onclick="ZonaPractica._showDetachMenu('${zone}',event)">⛓ Desacoplar</button>` : ''}
            <button class="pz-zmenu-btn pz-zmenu-move"
                    onclick="ZonaPractica._zmStartMove('${zone}',${slotIndex},'${zoneType}',event)">Mover</button>`;

        // Flotante fuera del contenedor (fixed, calculado desde el anchor real):
        // GY/Banish/Others son contenedores angostos y el submenu quedaba
        // recortado/oculto entre las cartas al anclarlo dentro de ellos.
        document.body.appendChild(sub);
        const rect = anchor.getBoundingClientRect();
        sub.style.position  = 'fixed';
        sub.style.zIndex    = '99999';
        sub.style.left      = (rect.left + rect.width / 2) + 'px';
        sub.style.top       = (rect.bottom + 6) + 'px';
        sub.style.transform = 'translateX(-50%)';
        requestAnimationFrame(() => {
            const sr = sub.getBoundingClientRect();
            if (sr.bottom > window.innerHeight) sub.style.top = (rect.top - sr.height - 6) + 'px';
            if (sr.left < 4)                    sub.style.left = (sr.width / 2 + 4) + 'px';
            if (sr.right > window.innerWidth)   sub.style.left = (window.innerWidth - sr.width / 2 - 4) + 'px';
        });

        const close = (e2) => { if (!sub.contains(e2.target)) { sub.remove(); document.removeEventListener('click', close); } };
        setTimeout(() => document.addEventListener('click', close), 0);
    },

    _zmActivate: function (zone, slotIndex, zoneType, e) {
        e?.stopPropagation();
        this._closeZoneMenus();
        let entry = null;
        if (zoneType === 'field') {
            entry = this.field[zone];
        } else {
            entry = this._getMultiArray(zone)[parseInt(slotIndex)];
        }
        const card = entry?.card;
        if (!card) return;

        // Flash de 900ms
        const elId = `pz-zone-${zone}`;
        const el = document.getElementById(elId);
        if (el) {
            el.classList.add('pz-activate-flash');
            setTimeout(() => el.classList.remove('pz-activate-flash'), 900);
        }

        this._chainCounter++;
        const chainNum = this._chainCounter;
        this._chainedCards.push({ zone, slotIndex, zoneType, chainNum, cardName: card.name });

        if (entry) entry._chainNum = chainNum;

        this._renderAllZones();
        this._showChainResolveBtn();
        this._addLog(`${card.name} activa efecto [en la zona: ${zone}].`, card);
    },

    // Monstruo en zona de monstruos (A/B/1-5), boca arriba y en ATK, solo en Fase de Batalla
    _canAttack: function (zone, zoneType) {
        if (zoneType !== 'field') return false;
        if (this.phase !== 'battle') return false;
        if (!['A','B','1','2','3','4','5'].includes(String(zone))) return false;
        const entry = this.field[zone];
        return !!(entry?.card && entry.faceUp && !entry.rotation);
    },

    _zmAttack: function (zone, e) {
        e?.stopPropagation();
        this._closeZoneMenus();
        const entry = this.field[zone];
        const card = entry?.card;
        if (!card) return;
        this._addLog(`${card.name} → <span style="color:#d63031;font-weight:700">Ataca</span>`, card);
    },
    // ═══════════════════════════════════════════════════════
    _showChainResolveBtn: function () {
        if (document.getElementById('pz-chain-resolve-btn')) return;
        const btn = document.createElement('button');
        btn.id        = 'pz-chain-resolve-btn';
        btn.className = 'pz-chain-resolve-btn';
        btn.innerHTML = '⛓ Resolver';
        btn.title     = 'Resolver Cadena';
        btn.onclick   = () => ZonaPractica.resolveChain();
        document.body.appendChild(btn);
        // Activar zona logo
        const logoCell = document.querySelector('.pz-logo-cell');
        if (logoCell) {
            logoCell.classList.add('pz-logo-chain-active');
            logoCell.onclick = () => ZonaPractica.resolveChain();
        }
    },

    resolveChain: function () {
        const count = this._chainCounter;
        if (count === 0) {
            this._showToast('Sin cadena activa.', 1500);
            return;
        }
        // Lista SEGOC (LIFO: último efecto al primero)
        const segocLines = [...this._chainedCards]
            .reverse()
            .map(c => `&nbsp;&nbsp;${c.chainNum}. ${c.cardName}`)
            .join('<br>');

        Object.values(this.field).forEach(e => { if (e) delete e._chainNum; });
        ['hand','main','extra','gy','banish','other'].forEach(z => {
            this._getMultiArray(z).forEach(e => { if (e) delete e._chainNum; });
        });

        const msg = `⛓ Cadena resuelta — ${count} efecto${count !== 1 ? 's' : ''}. SEGOC:<br>${segocLines}`;
        this._addLog(msg);
        console.info(`[PZ] Cadena resuelta: ${count} efectos SEGOC: ${[...this._chainedCards].reverse().map(c=>c.cardName).join(' → ')}`);
        this._chainCounter = 0;
        this._chainedCards = [];

        // Entra en modo "resolviendo": los botones pasan a Cerrar Cadena y todo
        // lo que se registre a partir de aquí queda anidado en el Log hasta cerrarla.
        this._chainResolving = true;

        const floatBtn = document.getElementById('pz-chain-resolve-btn');
        if (floatBtn) {
            floatBtn.innerHTML = '🔒 Cerrar Cadena';
            floatBtn.title     = 'Cerrar Cadena';
            floatBtn.classList.add('pz-chain-resolve-btn-closing');
            floatBtn.onclick   = () => ZonaPractica.closeChainResolution();
        }
        const logoCell = document.querySelector('.pz-logo-cell');
        if (logoCell) {
            logoCell.classList.remove('pz-logo-chain-active');
            logoCell.classList.add('pz-logo-chain-resolving');
            logoCell.onclick = () => ZonaPractica.closeChainResolution();
        }

        this._renderAllZones();
        this._showToast(`⛓ SEGOC registrado — resolviendo cadena`, 2000);
    },

    // Cierra el modo "resolviendo": deja de anidar el Log y vuelve todo a su estado normal.
    closeChainResolution: function () {
        if (!this._chainResolving) return;
        this._chainResolving = false;
        this._addLog('🔒 Cadena cerrada.');

        document.getElementById('pz-chain-resolve-btn')?.remove();
        const logoCell = document.querySelector('.pz-logo-cell');
        if (logoCell) {
            logoCell.classList.remove('pz-logo-chain-active', 'pz-logo-chain-resolving');
            logoCell.onclick = null;
        }
        const chainBtn = document.getElementById('pz-log-chain-btn');
        if (chainBtn) {
            chainBtn.className = 'pz-log-sc-btn pz-log-sc-chain-btn';
            chainBtn.title     = 'Resolver Cadena';
            chainBtn.onclick   = () => ZonaPractica.resolveChain();
            chainBtn.innerHTML = `<span class="pz-log-sc-icon">⛓️</span><span class="pz-log-sc-label">Resolver Cadena</span>`;
        }
        this._showToast('🔒 Cadena cerrada', 1500);
    },

        // ═══════════════════════════════════════════════════════
        flipCoin: function () {
            const result = Math.random() < 0.5 ? 'Cara' : 'Cruz';
            this._addLog(`🪙 Lanza moneda: ${result}`);
            this._showToast(`🪙 ${result}`, 1800);
        },

        // ═══════════════════════════════════════════════════════
        rollDice: function () {
            document.getElementById('pz-dice-overlay')?.remove();
            const overlay = document.createElement('div');
            overlay.id = 'pz-dice-overlay';
            overlay.className = 'pz-modal-overlay';
            overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

            const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
            let rolling = true;
            let intervalId = null;

            overlay.innerHTML = `
                <div class="pz-modal-box pz-dice-box">
                    <button class="pz-modal-close" onclick="document.getElementById('pz-dice-overlay').remove()">✕</button>
                    <div class="pz-modal-title">🎲 Tiro de Dado</div>
                    <div id="pz-dice-face" class="pz-dice-face">⚀</div>
                    <div id="pz-dice-result" class="pz-dice-result"></div>
                    <button class="pz-dice-roll-btn" id="pz-dice-roll-btn"
                            onclick="ZonaPractica._diceRoll()">Lanzar</button>
                </div>`;
            document.body.appendChild(overlay);
        },

        _diceRoll: function () {
            const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
            const faceEl   = document.getElementById('pz-dice-face');
            const resultEl = document.getElementById('pz-dice-result');
            const btn      = document.getElementById('pz-dice-roll-btn');
            if (!faceEl) return;
            btn.disabled = true;
            let count = 0;
            const total = 14 + Math.floor(Math.random() * 8);
            const iv = setInterval(() => {
                faceEl.textContent = faces[Math.floor(Math.random() * 6)];
                count++;
                if (count >= total) {
                    clearInterval(iv);
                    const val = Math.floor(Math.random() * 6) + 1;
                    faceEl.textContent = faces[val - 1];
                    if (resultEl) resultEl.textContent = `Resultado: ${val}`;
                    btn.disabled = false;
                    this._addLog(`🎲 Tiro de dado: ${val}`);
                }
            }, 80);
        },

        // ═══════════════════════════════════════════════════════
      createToken: function () {
        const counter = ++this._tokenCounter;
        const tokenCard = {
            id:   `token_${counter}`,
            name: `Token ${counter}`,
            type: 'Token',
            desc: 'Token',
            card_images: [{ image_url_small: 'https://images.ygoprodeck.com/images/cards_small/60764582.jpg', image_url: 'https://images.ygoprodeck.com/images/cards/60764582.jpg' }],
            _isToken: true
        };
        this.other.push({ card: tokenCard, faceUp: true, rotation: 0, _isToken: true });
        this._renderZone('other');
        this._addLog(`Invocación de Token — Token ${counter}`);
        this._showToast(`🔘 Token ${counter} creado`, 1200);
    },

    // ═══════════════════════════════════════════════════════
    downloadLog: function () {
        if (!this.logEntries.length) { this._showToast('El log está vacío.', 1500); return; }
        const lines = this.logEntries.map(e => `[T${e.turn} ${e.time}][${e.player || 'P1'}] ${e.msg}`);
        const blob  = new Blob([lines.join('\n')], { type: 'text/plain' });
        const a     = document.createElement('a');
        a.href      = URL.createObjectURL(blob);
        a.download  = `pz-log-T${this.turnNumber}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    // ═══════════════════════════════════════════════════════
    _downloadStatePng: function (id) {
        const cardEl = document.getElementById(`pz-nav-card-${id}`);
        if (!cardEl) { this._showToast('Abre el detalle del estado primero.', 1800); return; }
        // Asegurar que el detalle esté expandido
        const detail = document.getElementById(`pz-nav-detail-${id}`);
        const wasHidden = detail && detail.style.display === 'none';
        if (wasHidden) { detail.style.display = ''; }

        if (typeof html2canvas === 'undefined') {
            this._showToast('html2canvas no disponible.', 2000); return;
        }
        html2canvas(cardEl, {
            backgroundColor: '#001a33',
            scale: 2,
            useCORS: true,
            logging: false
        }).then(canvas => {
            const a      = document.createElement('a');
            a.href       = canvas.toDataURL('image/png');
            a.download   = `estado-${id}.png`;
            a.click();
            if (wasHidden && detail) detail.style.display = 'none';
        }).catch(() => this._showToast('Error al generar imagen.', 2000));
    },
    // ═══════════════════════════════════════════════════════
   _zmStartMove: function (zone, slotIndex, zoneType, e) {
        e?.stopPropagation();
        this._closeZoneMenus();
        this._activeMove = {
            sourceZone: zone,
            sourceSlot: (slotIndex === null || slotIndex === 'null') ? null : parseInt(slotIndex),
            sourceType: zoneType
        };
        document.getElementById('pz-board-outer')?.classList.add('pz-move-mode');
        let card = null;
        if (zoneType === 'field') {
            card = this.field[zone]?.card;
        } else {
            card = this._getMultiArray(zone)[parseInt(slotIndex)]?.card;
        }
        this._showMoveHint(card?.name || 'carta');
    },

    _showMoveHint: function (name) {
        document.getElementById('pz-move-hint')?.remove();
        const hint = document.createElement('div');
        hint.id = 'pz-move-hint';
        hint.className = 'pz-move-hint';
        hint.innerHTML = `Moviendo: <strong>${name}</strong> — Toca la zona destino &nbsp;
            <button onclick="ZonaPractica._cancelMoveMode()">✕ Cancelar</button>`;
        const wrap = this._container?.querySelector('.pz-wrap');
        if (wrap) wrap.insertBefore(hint, wrap.querySelector('.pz-board-outer'));
        else document.body.appendChild(hint);
    },

    _cancelMoveMode: function () {
        this._activeMove = null;
        document.getElementById('pz-board-outer')?.classList.remove('pz-move-mode');
        document.getElementById('pz-move-hint')?.remove();
    },
// ─── MODO PUT/SET ─────────────────────────────────────────────────────────────
_startPlacement: function (sourceZone, idx, faceUp) {
    this._activePlacement = { sourceZone, idx, faceUp };
    document.getElementById('pz-dv-overlay')?.remove();
    document.getElementById('pz-board-outer')?.classList.add('pz-move-mode');
    const card   = this._getMultiArray(sourceZone)[idx]?.card;
    const action = faceUp ? 'boca arriba (Put)' : 'boca abajo (Set)';
    const hint   = document.getElementById('pz-move-hint') || document.createElement('div');
    hint.id        = 'pz-move-hint';
    hint.className = 'pz-move-hint';
    hint.innerHTML = `Colocando: <strong>${card?.name || 'carta'}</strong> — ${action} — Elige zona del campo &nbsp;
        <button onclick="ZonaPractica._cancelPlacement()">✕ Cancelar</button>`;
    const wrap = this._container?.querySelector('.pz-wrap');
    if (!document.getElementById('pz-move-hint')) {
        if (wrap) wrap.insertBefore(hint, wrap.querySelector('.pz-board-outer'));
        else document.body.appendChild(hint);
    }
},

_completePlacement: function (targetZone) {
    const pl = this._activePlacement;
    if (!pl) return;
    const arr   = this._getMultiArray(pl.sourceZone);
        const entry = arr[pl.idx];
        if (!entry) { this._cancelPlacement(); return; }
        if (this.field[targetZone]) {
            if (this.OVERLAY_ZONES.includes(String(targetZone))) {
                arr.splice(pl.idx, 1);
                this._attachMaterial(targetZone, entry, pl.sourceZone);
                this._cancelPlacement();
                this._renderAllZones();
            } else {
                this._showToast('⚠️ Zona ocupada.', 1400);
                this._cancelPlacement();
            }
            return;
        }
        arr.splice(pl.idx, 1);
        const isSTZone = ['6','7','8','9','10','C'].includes(String(targetZone));
        const setRotation = pl.faceUp ? 0 : (isSTZone ? 0 : 90);
        this.field[targetZone] = { ...entry, faceUp: pl.faceUp, rotation: setRotation, _materials: entry._materials || [] };
    if (pl.sourceZone !== 'other') {
        const action = pl.faceUp ? 'Put' : 'Set';
        this._addLog(`${entry.card?.name || '?'} [${this._zoneName(pl.sourceZone)} → Zona ${targetZone}] — ${action}`, entry.card);
    }
    this._cancelPlacement();
    this._renderAllZones();
},

_cancelPlacement: function () {
    this._activePlacement = null;
    document.getElementById('pz-board-outer')?.classList.remove('pz-move-mode');
    document.getElementById('pz-move-hint')?.remove();
},

// ─── XYZ OVERLAY ─────────────────────────────────────────────────────────────
_attachMaterial: function (zone, entry, sourceZone) {
    const host = this.field[zone];
    if (!host) return;
    if (!host._materials) host._materials = [];
    const matEntry = { ...entry, faceUp: true, rotation: 0 };
        if (entry._materials && entry._materials.length) {
            entry._materials.forEach(mat => host._materials.push({ ...mat }));
        }
    host._materials.push(matEntry);
    const hostName = host.card?.name  || '?';
    const matName  = entry.card?.name || '?';
    if (sourceZone !== 'other') {
        this._addLog(`${matName} se acopla a ${hostName}`, entry.card);
    }
},
_detachMaterial: function (zone, matIdx) {
    const host = this.field[zone];
    if (!host?._materials?.length) return;
    const [mat] = host._materials.splice(matIdx, 1);
    if (!mat) return;
    this.gy.push({ ...mat, faceUp: true, rotation: 0 });
    this._addLog(`${mat.card?.name || '?'} desacoplada y enviada al GY`, mat.card);
    if (!host._materials.length) host._materials = [];
    this._renderAllZones();
    document.getElementById('pz-minicv-overlay')?.remove();
},
// Desacopla todos los materiales de una zona y los manda al GY
_detachAllMaterials: function (zone, entryOverride) {
    const entry = entryOverride || this.field[zone];
    if (!entry?._materials?.length) return;
    [...entry._materials].forEach(m => {
        this.gy.push({ ...m, faceUp: true, rotation: 0 });
        this._addLog(`${m.card?.name || '?'} desacoplada y enviada al GY`, m.card);
    });
    entry._materials = [];
},
_showDetachMenu: function (zone, e) {
    e?.stopPropagation();
    this._closeZoneMenus();
    const mats = this.field[zone]?._materials;
    if (!mats?.length) return;
    const el  = document.getElementById(`pz-zone-${zone}`);
    if (!el) return;
    const menu = document.createElement('div');
    menu.className = 'pz-detach-submenu';
    menu.innerHTML = `<div class="pz-detach-submenu-title">Selecciona material:</div>` +
        mats.map((m, i) => {
            const img  = m.card?.card_images?.[0]?.image_url_small || this.CARD_BACK;
            const name = m.card?.name || '?';
            return `<div class="pz-detach-submenu-item"
                         onclick="ZonaPractica._detachMaterial('${zone}',${i})">
                <img src="${img}" class="pz-detach-sub-thumb" onerror="this.src='${this.CARD_BACK}'">
                <span class="pz-detach-sub-name">${name}</span>
            </div>`;
        }).join('');
    el.appendChild(menu);
    const close = (ev) => {
        if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', close, true); }
    };
    setTimeout(() => document.addEventListener('click', close, true), 50);
},
    _completeMoveToField: function (targetZone) {
        const mv = this._activeMove;
        if (!mv) return;
        let entry = mv.sourceType === 'field'
            ? this.field[mv.sourceZone]
            : this._getMultiArray(mv.sourceZone)[mv.sourceSlot];
        if (!entry) { this._cancelMoveMode(); return; }
        if (this.field[targetZone]) {
            if (this.OVERLAY_ZONES.includes(String(targetZone))) {
                if (mv.sourceType === 'field') this.field[mv.sourceZone] = null;
                else this._getMultiArray(mv.sourceZone).splice(mv.sourceSlot, 1);
                this._attachMaterial(targetZone, entry, mv.sourceZone);
                this._cancelMoveMode();
                this._renderAllZones();
            } else {
                this._cancelMoveMode();
            }
            return;
        }
        if (mv.sourceType === 'field') this.field[mv.sourceZone] = null;
        else this._getMultiArray(mv.sourceZone).splice(mv.sourceSlot, 1);
        this.field[targetZone] = { ...entry, _materials: entry._materials || [], faceUp: true };
        this._addLog(`${entry.card.name} → Zona ${targetZone}`, entry.card);
        this._cancelMoveMode();
        this._renderAllZones();
    },

    _onMultiZoneClick: function (e, zone) {
        if (this._longPressPreventClick) { this._longPressPreventClick = false; return; }
        const slot = e.target.closest('.pz-card-slot');
        if (this._activePlacement) { this._cancelPlacement(); return; }
        if (this._activeMove) {
            const idx = slot ? Array.from(slot.parentElement.children).indexOf(slot) : undefined;
            this._completeMoveToMulti(zone, idx);
            return;
        }
        if (this.changePositionMode && slot) {
            const idx   = Array.from(slot.parentElement.children).indexOf(slot);
            const arr   = this._getMultiArray(zone);
            const entry = arr[idx];
            if (entry?.card) {
                const pos = this._cyclePosition(entry, zone);
                this._addLog(`${entry.card.name}: ${pos}`, entry.card);
                this._renderZone(zone);
            }
            return;
        }
        if (!slot) return;
        e.stopPropagation();
        const idx = Array.from(slot.parentElement.children).indexOf(slot);
        this._showZoneMenu(zone, idx, 'multi');
    },

    _completeMoveToMulti: function (targetZone, targetSlot) {
        const mv = this._activeMove;
        if (!mv) return;
        let entry = mv.sourceType === 'field'
            ? this.field[mv.sourceZone]
            : this._getMultiArray(mv.sourceZone)[mv.sourceSlot];
        if (!entry) { this._cancelMoveMode(); return; }
        if (entry._isToken && ['hand','gy','banish'].includes(targetZone)) {
            if (mv.sourceType === 'field') this.field[mv.sourceZone] = null;
            else this._getMultiArray(mv.sourceZone).splice(mv.sourceSlot, 1);
            const tNum = entry.card?.name?.replace('Token ','') || '';
            this._addLog(`Token ${tNum} desaparece`);
            this._cancelMoveMode();
            this._renderAllZones();
            return;
        }
        if (entry._materials?.length) {
            this._detachAllMaterials(null, entry);
        }
        if (mv.sourceType === 'field') this.field[mv.sourceZone] = null;
        else this._getMultiArray(mv.sourceZone).splice(mv.sourceSlot, 1);
        const entryClean = { ...entry, _materials: [] };
        const arr = this._getMultiArray(targetZone);
        (targetSlot !== undefined && targetSlot < arr.length)
            ? arr.splice(targetSlot, 0, entryClean)
            : arr.push(entryClean);
        if (mv.sourceZone !== 'other') {
            this._addLog(`${entry.card.name} → ${targetZone}`, entry.card);
        }
        this._cancelMoveMode();
        this._renderAllZones();
    },

    _removeFromSource: function (mv) {
        if (mv.sourceType === 'field') {
            this.field[mv.sourceZone] = null;
        } else {
            const arr = this._getMultiArray(mv.sourceZone);
            if (mv.sourceSlot !== null) arr.splice(mv.sourceSlot, 1);
        }
    },

    _getMultiArray: function (zone) {
        return this[{ hand:'hand',main:'main',extra:'extra',gy:'gy',banish:'banish',other:'other' }[zone]] || [];
    },

    // ═══════════════════════════════════════════════════════
    openDeckViewer: function (zoneName) {
        document.getElementById('pz-dv-overlay')?.remove();
        const labels = { main:'Main Deck', extra:'Extra Deck', hand:'Mano',
                         gy:'Cementerio', banish:'Destierro', other:'Other Options' };
        const label = labels[zoneName] || zoneName;

        const overlay = document.createElement('div');
        overlay.id = 'pz-dv-overlay';
        overlay.className = 'pz-modal-overlay';
        overlay.setAttribute('data-zone', zoneName);
        overlay.setAttribute('data-player', 'A');
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        overlay.innerHTML = `
            <div class="pz-modal-box pz-dv-box pz-dv-box-v5">
                <div class="pz-dv-header">
                    <div class="pz-modal-title">
                        👁 ${label}
                        <span class="pz-dv-count" id="pz-dv-count">0</span>
                    </div>
                    <button class="pz-modal-close" onclick="document.getElementById('pz-dv-overlay').remove()">✕</button>
                </div>

                <!-- Barra de búsqueda y filtros -->
                <div class="pz-dv-toolbar">
                    <input type="text" id="pz-dv-search" class="pz-dv-search"
                           placeholder="Buscar por nombre..." autocomplete="off"
                           oninput="ZonaPractica._refreshDV('${zoneName}')">
                    <div class="pz-dv-type-tabs" id="pz-dv-type-tabs">
                        <button class="pz-dv-tab pz-dv-tab-active" data-filter="all"
                                onclick="ZonaPractica._setDvFilter(this,'${zoneName}')">Todas</button>
                        <button class="pz-dv-tab" data-filter="monster"
                                onclick="ZonaPractica._setDvFilter(this,'${zoneName}')">Monstruos</button>
                        <button class="pz-dv-tab" data-filter="spell"
                                onclick="ZonaPractica._setDvFilter(this,'${zoneName}')">Mágicas</button>
                        <button class="pz-dv-tab" data-filter="trap"
                                onclick="ZonaPractica._setDvFilter(this,'${zoneName}')">Trampas</button>
                    </div>
                </div>

                <div class="pz-dv-grid pz-dv-grid-v5" id="pz-dv-grid">
                </div>
            </div>`;

        document.body.appendChild(overlay);
        this._dvCurrentFilter = 'all';
        this._refreshDV(zoneName);
    },

    _dvCurrentFilter: 'all',

    _setDvFilter: function (btn, zoneName) {
        document.querySelectorAll('.pz-dv-tab').forEach(b => b.classList.remove('pz-dv-tab-active'));
        btn.classList.add('pz-dv-tab-active');
        this._dvCurrentFilter = btn.dataset.filter;
        this._refreshDV(zoneName);
    },

    _refreshDV: function (zoneName) {
        const grid    = document.getElementById('pz-dv-grid');
        const countEl = document.getElementById('pz-dv-count');
        if (!grid) return;

        const searchQ  = (document.getElementById('pz-dv-search')?.value || '').toLowerCase().trim();
        const filter   = this._dvCurrentFilter || 'all';
        const allCards = this._getMultiArray(zoneName);
        const isMain   = zoneName === 'main';

        const filtered = allCards.map((e, i) => ({ e, i })).filter(({ e }) => {
            if (!e?.card) return false;
            const type = (e.card.type || '').toLowerCase();
            if (filter === 'monster' && !type.includes('monster'))    return false;
            if (filter === 'spell'   && !type.includes('spell card')) return false;
            if (filter === 'trap'    && !type.includes('trap card'))  return false;
            if (searchQ && !e.card.name.toLowerCase().includes(searchQ)) return false;
            return true;
        });

        if (countEl) countEl.textContent = filtered.length;

        if (!filtered.length) {
            grid.innerHTML = '<p class="pz-search-hint">Sin cartas en esta vista.</p>';
            return;
        }

        const dvActions = (zoneName, idx, e) => {
            const isFaceUp = e.faceUp;
            const mainBtns = isMain
                ? `<button class="pz-dvc-act pz-dvc-top"
                           onclick="ZonaPractica._dvMoveInZone('${zoneName}',${idx},'top')">🔝</button>
                   <button class="pz-dvc-act pz-dvc-bot"
                           onclick="ZonaPractica._dvMoveInZone('${zoneName}',${idx},'bot')">🔚</button>`
                : '';
            const flipBtn = `<button class="pz-dvc-act pz-dvc-flip"
                           onclick="ZonaPractica._dvFlip('${zoneName}',${idx})"
                           title="${isFaceUp?'Voltear boca abajo':'Voltear boca arriba'}">
                           ${isFaceUp?'▽':'▲'}</button>`;
            return `
                <button class="pz-dvc-act pz-dvc-ver"
                        onclick="ZonaPractica._openMiniCV(ZonaPractica._getMultiArray('${zoneName}')[${idx}]?.card)">👁</button>
                <button class="pz-dvc-act pz-dvc-hand"
                        onclick="ZonaPractica._dvSendCard('${zoneName}',${idx},'hand')">✋</button>
                <button class="pz-dvc-act pz-dvc-gy"
                        onclick="ZonaPractica._dvSendCard('${zoneName}',${idx},'gy')">🪦</button>
                <button class="pz-dvc-act pz-dvc-ban"
                        onclick="ZonaPractica._dvSendCard('${zoneName}',${idx},'banish')">🚀</button>
                <button class="pz-dvc-act pz-dvc-other"
                        onclick="ZonaPractica._dvSendCard('${zoneName}',${idx},'other')">📌</button>
                ${flipBtn}
            ${mainBtns}
            <button class="pz-dvc-act pz-dvc-put"
                    onclick="ZonaPractica._startPlacement('${zoneName}',${idx},true)"
                    title="Poner boca arriba en el campo">Put</button>
            <button class="pz-dvc-act pz-dvc-set"
                    onclick="ZonaPractica._startPlacement('${zoneName}',${idx},false)"
                    title="Setear boca abajo en el campo">Set</button>
            <button class="pz-dvc-act pz-dvc-del"
                        onclick="ZonaPractica._dvRemoveCard('${zoneName}',${idx})">✕</button>
            <button class="pz-dvc-act pz-dvc-activate"
                        onclick="ZonaPractica._zmActivate('${zoneName}',${idx},'multi',event)"
                        title="Activar efecto">🚨</button>`;
        };

        grid.innerHTML = filtered.map(({ e, i }) => {
            const img  = e.card.card_images?.[0]?.image_url_small || this.CARD_BACK;
            const face = e.faceUp ? img : this.CARD_BACK;
            const type = (e.card.type || '').toLowerCase();
            let typeClass = 'pz-dvcard-spell';
            if (type.includes('monster')) typeClass = 'pz-dvcard-monster';
            if (type.includes('trap'))    typeClass = 'pz-dvcard-trap';
            const posLabel = e.faceUp ? (e.rotation ? 'DEF' : 'ATK') : 'SET';
            const posClass = e.faceUp ? (e.rotation ? 'pz-dvc-pos-def' : 'pz-dvc-pos-atk') : 'pz-dvc-pos-set';

            return `<div class="pz-dv-card-row ${typeClass}" data-idx="${i}">
                <img src="${face}" class="pz-dv-card-img"
                     onerror="this.src='${this.CARD_BACK}'"
                     onclick="ZonaPractica._openMiniCV(ZonaPractica._getMultiArray('${zoneName}')[${i}]?.card)">
                <div class="pz-dv-card-info">
                    <div class="pz-dv-card-name">${e.card.name || '?'}</div>
                    <div class="pz-dv-card-meta">
                        <span class="pz-dvc-pos-badge ${posClass}">${posLabel}</span>
                        <span class="pz-dvc-idx">#${i + 1}</span>
                    </div>
                    <div class="pz-dvc-actions">${dvActions(zoneName, i, e)}</div>
                </div>
            </div>`;
        }).join('');
    },

    // Acciones del DV
    _dvSendCard: function (zone, idx, target) {
        const arr   = this._getMultiArray(zone);
        const entry = arr[idx];
        if (!entry) return;

        if (entry._isToken && ['hand','gy','banish'].includes(target)) {
            arr.splice(idx, 1);
            const tNum = entry.card?.name?.replace('Token ','') || '';
            this._addLog(`Token ${tNum} desaparece`);
            this._renderZone(zone);
            this._updateStatusWidget();
            this._refreshDV(zone);
            return;
        }

        arr.splice(idx, 1);

        const dest = this._getMultiArray(target);
        const forceFaceUp = target === 'hand' || target === 'other';
        dest.push({ ...entry, faceUp: forceFaceUp ? true : entry.faceUp, rotation: 0 });

      if (zone !== 'other') {
            this._addLog(`${entry.card?.name||'?'} [${this._zoneName(zone)} → ${this._zoneName(target)}]`, entry.card);
        }

        this._renderAllZones();
        this._refreshDV(zone);
        this._renderZone(target);
        this._updateStatusWidget();

        // Refrescar el DV con la zona actualizada
        const overlay = document.getElementById('pz-dv-overlay');
        if (overlay) {
            this._refreshDV(zone);
        }
    },

    _dvFlip: function (zone, idx) {
        const arr   = this._getMultiArray(zone);
        const entry = arr[idx];
        if (!entry) return;
        entry.faceUp = !entry.faceUp;
        this._renderZone(zone);
        this._refreshDV(zone);
        this._addLog(`${entry.card?.name||'?'}: ${entry.faceUp ? 'boca arriba' : 'boca abajo'}`, entry.card);
    },

    _dvMoveInZone: function (zone, idx, direction) {
        const arr = this._getMultiArray(zone);
        if (!arr[idx]) return;
        const [entry] = arr.splice(idx, 1);
        if (direction === 'top') {
            arr.unshift(entry);
        } else {
            arr.push(entry);
        }
        this._renderZone(zone);
        this._refreshDV(zone);
        if (zone !== 'other') {
    this._addLog(`${entry.card?.name||'?'} [${this._zoneName(zone)}] → ${direction === 'top' ? 'tope' : 'fondo'} del deck.`, entry.card);
}
    },

    _dvRemoveCard: function (zone, idx) {
        const arr   = this._getMultiArray(zone);
        const entry = arr[idx];
        if (!entry) return;
        arr.splice(idx, 1);
        if (zone !== 'other') {
    this._addLog(`${entry.card?.name||'?'} [${this._zoneName(zone)} → eliminada]`, entry.card);
}
        this._renderZone(zone);
        this._updateStatusWidget();
        this._refreshDV(zone);
    },

    // ═══════════════════════════════════════════════════════
    shuffleHand: function () {
        for (let i=this.hand.length-1; i>0; i--) {
            const j = Math.floor(Math.random()*(i+1));
            [this.hand[i],this.hand[j]] = [this.hand[j],this.hand[i]];
        }
        this._renderZone('hand');
        this._addLog('Mano barajada.');
    },

    // ═══════════════════════════════════════════════════════
    
    shuffleDeck: function () {
        for (let i=this.main.length-1;i>0;i--) {
            const j=Math.floor(Math.random()*(i+1));
            [this.main[i],this.main[j]]=[this.main[j],this.main[i]];
        }
        this._renderAllZones();
    },

    // ═══════════════════════════════════════════════════════
    drawCard: function () {
        if (!this.main.length) { this._showToast('No hay cartas en el deck.', 1400); return; }
        const card = this.main.pop();
        this.hand.push({ ...card, faceUp: true });
        this._renderAllZones();
        this._addLog('Carta robada.');
    },


    // ═══════════════════════════════════════════════════════
    toggleChangePosition: function () {
        this.changePositionMode = !this.changePositionMode;
        const btn = document.getElementById('pz-btn-chgpos');
        if (btn) btn.classList.toggle('pz-action-active', this.changePositionMode);
        document.getElementById('pz-board-outer')?.classList.toggle('pz-chgpos-mode', this.changePositionMode);
        if (this.changePositionMode) {
            this._showToast('↕ Modo Cambiar Posición — click en una carta del campo');
        } else {
            document.getElementById('pz-toast')?.remove();
        }
        this._updateFloatingBtns();
    },

    // Para S/T: Activa → Set → Activa
    _cyclePosition: function (entry, zone) {
        const isMonsterZone = ['1','2','3','4','5','A','B'].includes(String(zone));

        if (isMonsterZone) {
            if (entry.faceUp && entry.rotation === 0) {
                entry.faceUp = true;  entry.rotation = 90;  return 'DEF';
            } else if (entry.faceUp && entry.rotation === 90) {
                entry.faceUp = false; entry.rotation = 90;  return 'Boca abajo';
            } else {
                entry.faceUp = true;  entry.rotation = 0;   return 'ATK';
            }
        } else {
            if (entry.faceUp) {
                entry.faceUp = false; entry.rotation = 0;   return 'Set';
            } else {
                entry.faceUp = true;  entry.rotation = 0;   return 'Activada';
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // Tablero de un jugador para Marcar Estado: si es el activo lee "this";
    // si es el otro, lee su snapshot en _players (o default si nunca se usó).
    _captureBoardOf: function (key) {
        const src = (key === this._activePlayer) ? this : (this._players[key] || this._defaultPlayerState());
        return {
            lp:     src.lp ?? 8000,
            field:  JSON.parse(JSON.stringify(src.field)),
            hand:   JSON.parse(JSON.stringify(src.hand)),
            main:   JSON.parse(JSON.stringify(src.main)),
            extra:  JSON.parse(JSON.stringify(src.extra)),
            gy:     JSON.parse(JSON.stringify(src.gy)),
            banish: JSON.parse(JSON.stringify(src.banish)),
            other:  JSON.parse(JSON.stringify(src.other)),
        };
    },

    // Lee el tablero de un estado guardado. Compatible con estados viejos
    // (pre-Etapa 4, planos = tablero único, siempre equivalente a P1).
    _stateBoardOf: function (s, key) {
        if (s.players) return s.players[key] || this._defaultPlayerState();
        return key === 'P1' ? s : this._defaultPlayerState();
    },
    saveGameState: function () {
        const snap = {
            id:           this.gameStates.length + 1,
            turn:         this.turnNumber,
            phase:        this.phase,
            timestamp:    new Date().toLocaleTimeString('es-ES', { hour12: false }),
            activePlayer: this._activePlayer,
            players: {
                P1: this._captureBoardOf('P1'),
                P2: this._captureBoardOf('P2'),
            },
        };
        this.gameStates.push(snap);
        const swBtn = document.getElementById('pz-sw-toggle-btn');
        if (swBtn) swBtn.style.display = '';

        const active = snap.players[snap.activePlayer];
        this._addLog(`📌 Estado #${snap.id} guardado — T${snap.turn} · ${snap.phase} · [${snap.activePlayer}] Mano:${active.hand.length} · GY:${active.gy.length}`);
        this._showToast(`📌 Estado #${snap.id} guardado`);
        this._saveStatesToDeck();
        const logEntries = document.getElementById('pz-log-entries');
        if (logEntries) logEntries.innerHTML = this._renderLogEntries();
        const navList = document.getElementById('pz-nav-list');
        if (navList) navList.innerHTML = this._renderNavList();
        this._updateStatusWidget();
        this._updateFloatingBtns();
    },

    // ═══════════════════════════════════════════════════════
    toggleHideCards: function () {
        this.cardsHidden = !this.cardsHidden;
        const btn = document.getElementById('pz-btn-hide');
        if (btn) {
            btn.innerHTML = this.cardsHidden ? '👁 Mostrar Cartas' : '🙈 Ocultar Cartas';
            btn.classList.toggle('pz-action-active', this.cardsHidden);
        }
        this.hiddenHand  = this.cardsHidden;
        this.hiddenMain  = this.cardsHidden;
        this.hiddenExtra = this.cardsHidden;
        this._syncZoneHideBtns();

        if (this.cardsHidden) {
            this._showHideWidget();
        } else {
            document.getElementById('pz-hide-widget')?.remove();
        }
        this._renderZone('hand');
        this._renderZone('main');
        this._renderZone('extra');
        this._addLog(this.cardsHidden ? 'Cartas ocultas (hand, main, extra).' : 'Cartas reveladas.');
    },

    // Ocultar/mostrar por zona individualmente
    toggleHideZone: function (zone) {
        const flagMap = { hand:'hiddenHand', main:'hiddenMain', extra:'hiddenExtra' };
        const flag = flagMap[zone];
        if (!flag) return;
        this[flag] = !this[flag];
        this._syncZoneHideBtns();
        this._renderZone(zone);
        this._addLog(`${zone}: ${this[flag] ? 'oculta' : 'visible'}.`);
    },
// Voltear todas las cartas de una zona (equivale a flip individual en masa)
    _flipAllInZone: function (zone) {
        const arr = this._getMultiArray(zone);
        if (!arr.length) { this._showToast(`${zone} está vacío.`, 1400); return; }
        const allFaceUp = arr.every(e => e.faceUp);
        if (zone === 'main' && allFaceUp) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        arr.forEach(e => { e.faceUp = !allFaceUp; });
        this._renderZone(zone);
        this._addLog(`${zone}: ${allFaceUp ? 'todas boca abajo (barajado)' : 'todas boca arriba'}.`);
    },
    // Sincroniza el ícono de los botones de ojo por zona
    _syncZoneHideBtns: function () {
        const map = { hand:'hiddenHand', main:'hiddenMain', extra:'hiddenExtra' };
        Object.entries(map).forEach(([zone, flag]) => {
            const btn = document.getElementById(`pz-hide-btn-${zone}`);
            if (btn) btn.textContent = this[flag] ? '👁' : '🙈';
        });
    },

    _showHideWidget: function () {
        document.getElementById('pz-hide-widget')?.remove();
        const w = document.createElement('div');
        w.id        = 'pz-hide-widget';
        w.className = 'pz-hide-widget';
        const n = this.hand.length;
        w.innerHTML = `
            <span class="pz-hw-icon">🙈</span>
            <span class="pz-hw-label" id="pz-hw-count">${n} carta${n !== 1 ? 's' : ''} oculta${n !== 1 ? 's' : ''}</span>
            <button class="pz-hw-reveal-btn" onclick="ZonaPractica.toggleHideCards()">Revelar</button>`;
        document.body.appendChild(w);
    },

    _updateHideWidget: function () {
        const el = document.getElementById('pz-hw-count');
        if (!el) return;
        const n = this.hand.length;
        el.textContent = `${n} carta${n !== 1 ? 's' : ''} oculta${n !== 1 ? 's' : ''}`;
    },

    // ═══════════════════════════════════════════════════════
    openLog: function () {
        if (document.getElementById('pz-log-panel')) {
            document.getElementById('pz-log-panel').classList.remove('pz-log-panel-open');
            setTimeout(() => document.getElementById('pz-log-panel')?.remove(), 300);
            return;
        }

        const panel = document.createElement('div');
        panel.id        = 'pz-log-panel';
        panel.className = 'pz-log-panel';

        const shortcuts = [
    { icon:'👆', label:'Normal',        msg:'Invocar Normal:'        },
    { icon:'🙏', label:'Tributar',       msg:'Tributar Carta:'        },
    { icon:'✨', label:'Especial',       msg:'Invocar Especial:'      },
    { icon:'🔮', label:'Péndulo S.',     msg:'Invocar por Péndulo:'   },
    { icon:'⚔️', label:'Daño de Batalla',         msg:'Damage Step'       },
    { icon:'💥', label:'Destruir',       msg:'Destruir Carta:'        },
    { icon:'🚫', label:'Negar',          msg:'Efecto Negado'          },
    { icon:'👀', label:'Revelar Carta',  msg:'Revelar Carta:'         },
    { icon:'🔍', label:'Mirar Carta',    msg:'Mirar Cartas'           },
    { icon:'⛏️', label:'Excavate',        msg:'Excavar Carta:'        },
    { icon:'⛓️', label:'Resolver Cadena', msg:'__RESOLVE_CHAIN__'      },
];
// Pre-calcular chips de estados con onclick de scroll
        const statesBarHtml = this.gameStates.length ? (() => {
            const chips = this.gameStates.map(s => {
                const targetIdx = this.logEntries.findIndex(e =>
                    e.msg.includes(`Estado #${s.id} guardado`));
                const scrollCall = targetIdx >= 0
                    ? `var c=document.getElementById('pz-log-entries');var t=document.getElementById('pz-log-entry-${targetIdx}');if(c&&t){c.scrollTo({top:t.offsetTop-8,behavior:'smooth'});}`
                    : '';
                const lp = this._stateBoardOf(s, s.activePlayer || 'P1').lp ?? 8000;
                return `<div class="pz-log-state-chip pz-log-state-chip-link"
                             title="T${s.turn} · ${s.phase} · [${s.activePlayer||'P1'}] LP:${lp.toLocaleString()} · ${s.timestamp} — Ir al registro"
                             onclick="${scrollCall}">
                    #${s.id} <span>T${s.turn}·${lp.toLocaleString()}LP·${s.timestamp}</span>
                </div>`;
            }).join('');
            return `<div class="pz-log-states-bar">
                <span class="pz-log-states-title">📌 Estados guardados (${this.gameStates.length})</span>
                <div class="pz-log-states-list" id="pz-log-states-list">${chips}</div>
            </div>`;
        })() : '';
        panel.innerHTML = `
            <div class="pz-log-header">
                <div class="pz-log-title">
                    📋 Log
                    <span class="pz-log-turn-badge">T${this.turnNumber}</span>
                    <span class="pz-log-phase-badge pz-log-phase-${this.phase}">${this._phaseLabel(this.phase)}</span>
                </div>
                <div class="pz-log-header-btns">
                    <button class="pz-log-dl-btn" onclick="ZonaPractica.downloadLog()" title="Descargar log">⬇ Log</button>
                    <button class="pz-log-clear-btn" onclick="ZonaPractica._clearLog()" title="Limpiar log">🗑</button>
                    <button class="pz-modal-close" onclick="ZonaPractica._closeLog()">✕</button>
                </div>
            </div>

            <div class="pz-log-shortcuts">
                ${shortcuts.map(s => {
                    if (s.msg === '__RESOLVE_CHAIN__') {
                        const closing = this._chainResolving;
                        return `<button id="pz-log-chain-btn" class="pz-log-sc-btn pz-log-sc-chain-btn${closing ? ' pz-log-sc-chain-btn-closing' : ''}"
                            onclick="ZonaPractica.${closing ? 'closeChainResolution' : 'resolveChain'}()"
                            title="${closing ? 'Cerrar Cadena' : s.label}">
                            <span class="pz-log-sc-icon">${closing ? '🔒' : s.icon}</span>
                            <span class="pz-log-sc-label">${closing ? 'Cerrar Cadena' : s.label}</span>
                        </button>`;
                    }
                    return `<button class="pz-log-sc-btn" onclick="ZonaPractica._logShortcut('${s.msg}')" title="${s.label}">
                        <span class="pz-log-sc-icon">${s.icon}</span>
                        <span class="pz-log-sc-label">${s.label}</span>
                    </button>`;
                }).join('')}
            </div>

            <div class="pz-log-input-row">
                <button class="pz-log-like-btn" onclick="ZonaPractica._logLike()" title="¡Prosigue!">👍</button>
                <input type="text" id="pz-log-custom-input" class="pz-log-custom-input"
                    placeholder="Entrada manual..." autocomplete="off">
                <button class="pz-log-add-btn" onclick="ZonaPractica._addCustomLog()">+</button>
            </div>

            ${statesBarHtml}

            <div class="pz-log-entries" id="pz-log-entries">
                ${this._renderLogEntries()}
            </div>`;

        document.body.appendChild(panel);
        requestAnimationFrame(() => panel.classList.add('pz-log-panel-open'));

        setTimeout(() => {
            const el = document.getElementById('pz-log-entries');
            if (el) el.scrollTop = el.scrollHeight;
        }, 50);

        document.getElementById('pz-log-custom-input')?.addEventListener('keydown', e => {
            if (e.key === 'Enter') this._addCustomLog();
        });
    },

    _phaseLabel: function (p) {
        return { draw:'Draw', standby:'Standby', main1:'Main 1', battle:'Battle', main2:'Main 2', end:'End' }[p] || p;
    },

    _logShortcut: function (msg) {
        this._addLog(msg);
    },

    _addCustomLog: function () {
        const inp = document.getElementById('pz-log-custom-input');
        const msg = inp?.value?.trim();
        if (!msg) return;
        this._addLog(msg, null, true);
        inp.value = '';
    },

    _closeLog: function () {
    const panel = document.getElementById('pz-log-panel');
    if (!panel) return;
    panel.classList.remove('pz-log-panel-open');
    setTimeout(() => panel.remove(), 300);
},

_clearLog: function () {
    this.logEntries = [];
    const el = document.getElementById('pz-log-entries');
    if (el) el.innerHTML = this._renderLogEntries();
},
    // ═══════════════════════════════════════════════════════
    openStateNavigator: function () {
        if (document.getElementById('pz-nav-panel')) {
            document.getElementById('pz-nav-panel').classList.remove('pz-nav-panel-open');
            setTimeout(() => document.getElementById('pz-nav-panel')?.remove(), 280);
            return;
        }

        const panel = document.createElement('div');
        panel.id        = 'pz-nav-panel';
        panel.className = 'pz-nav-panel';

        panel.innerHTML = `
            <div class="pz-nav-header">
                <div class="pz-nav-title">📜 Historial de Estados</div>
                <div class="pz-nav-header-btns">
                    <button class="pz-log-clear-btn"
                            onclick="ZonaPractica._clearAllStates()" title="Eliminar todos">🗑</button>
                    <button class="pz-modal-close" onclick="ZonaPractica.openStateNavigator()">✕</button>
                </div>
            </div>
            <div class="pz-nav-hint">
                Guarda estados con 📌 Marcar Estado.<br>
                Toca un estado para ver detalles y restaurarlo.
            </div>
            <div id="pz-nav-list" class="pz-nav-list">
                ${this._renderNavList()}
            </div>`;

        document.body.appendChild(panel);
        requestAnimationFrame(() => panel.classList.add('pz-nav-panel-open'));
    },

    _renderNavList: function () {
        if (!this.gameStates.length) {
            return '<p class="pz-log-empty">Sin estados guardados.</p>';
        }
        return [...this.gameStates].reverse().map(s => {
            const activeKey = s.activePlayer || 'P1';
            const b = this._stateBoardOf(s, activeKey);
            const fieldCount = Object.values(b.field).filter(Boolean).length;
            const phaseColors = {
                draw:'#8B6914', standby:'#1a78bd',
                main1:'#1a7a2e', main2:'#1a7a2e', battle:'#bd3b1a', end:'#7a1a2e'
            };
            const phaseColor = phaseColors[s.phase] || '#888';

            return `
            <div class="pz-nav-card" id="pz-nav-card-${s.id}">
                <div class="pz-nav-card-header"
                     onclick="ZonaPractica._toggleNavCard(${s.id})">
                    <div class="pz-nav-card-meta">
                        <span class="pz-nav-id">#${s.id}</span>
                        <span class="pz-nav-turn">T${s.turn}</span>
                        <span class="pz-log-ptag pz-log-ptag-${activeKey}">${activeKey}</span>
                        <span class="pz-nav-phase"
                              style="background:${phaseColor}33;border-color:${phaseColor};color:${phaseColor}">
                            ${this._phaseLabel(s.phase)}
                        </span>
                        <span class="pz-nav-time">${s.timestamp}</span>
                    </div>
                    <span class="pz-nav-chevron" id="pz-nav-chv-${s.id}">▼</span>
                </div>

                <!-- Resumen rápido siempre visible -->
                <div class="pz-nav-summary">
                    ${this._renderNavCounts(b)}
                </div>

                <!-- Detalle expandible -->
                <div class="pz-nav-detail" id="pz-nav-detail-${s.id}" style="display:none">
                    ${this._renderNavFieldPreview(b)}
                    <div class="pz-nav-actions">
                        <button class="pz-nav-download-btn"
                                onclick="ZonaPractica._downloadStatePng(${s.id})">
                            📥 PNG
                        </button>
                        <button class="pz-nav-restore-btn"
                                onclick="ZonaPractica._restoreState(${s.id})">
                            ↩ Restaurar este estado
                        </button>
                        <button class="pz-nav-del-btn"
                                onclick="ZonaPractica._deleteState(${s.id})">
                            🗑 Eliminar
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    _renderNavCounts: function (s) {
        const zones = [
            { icon:'✋', label:'Mano',     count: s.hand.length   },
            { icon:'📦', label:'Main',     count: s.main.length   },
            { icon:'⚡', label:'Extra',    count: s.extra.length  },
            { icon:'🪦', label:'GY',       count: s.gy.length     },
            { icon:'🚀', label:'Destierro',count: s.banish.length },
            { icon:'🃏', label:'Campo',    count: Object.values(s.field).filter(Boolean).length },
        ];
        return `<div class="pz-nav-counts">
            ${zones.map(z =>
                `<span class="pz-nav-count-chip ${z.count > 0 ? 'pz-nav-count-active' : ''}">
                    ${z.icon} ${z.count}
                </span>`
            ).join('')}
        </div>`;
    },

    _renderNavFieldPreview: function (s) {
    const BACK = this.CARD_BACK;
    const buildZone = (z) => {
        if (!z) return `<div class="pz-nav-fz pz-nav-fz-empty"></div>`;
        const entry = s.field[z];
        if (!entry?.card) return `<div class="pz-nav-fz pz-nav-fz-empty"><span class="pz-nav-fz-lbl">${z}</span></div>`;
        const img = entry.card.card_images?.[0]?.image_url_small || BACK;
        const isMonster = ['1','2','3','4','5','A','B'].includes(String(z));
        let pos, posClass;
        if (isMonster) {
            if (entry.faceUp && !entry.rotation)     { pos = 'ATK';    posClass = 'pz-nav-fz-atk'; }
            else if (entry.faceUp && entry.rotation) { pos = 'DEF';    posClass = 'pz-nav-fz-def'; }
            else                                     { pos = 'SET';    posClass = 'pz-nav-fz-set'; }
        } else {
            pos      = entry.faceUp ? 'Face-up' : 'Set';
            posClass = entry.faceUp ? 'pz-nav-fz-atk' : 'pz-nav-fz-set';
        }
        return `<div class="pz-nav-fz ${posClass}" title="${entry.card.name} · ${pos}">
            <span class="pz-nav-fz-lbl">${z}</span>
            <img src="${entry.faceUp ? img : BACK}" class="pz-nav-fz-img"
                 ${entry.rotation ? `style="transform:rotate(${entry.rotation}deg)"` : ''}
                 onerror="this.src='${BACK}'">
            <span class="pz-nav-fz-pos">${pos}</span>
        </div>`;
    };

    return `
        <div class="pz-nav-field-preview pz-nav-field-grid5">
            ${buildZone('C')}${buildZone('A')}<div class="pz-nav-fz pz-nav-fz-empty"></div>${buildZone('B')}<div class="pz-nav-fz pz-nav-fz-empty"></div>
            ${['1','2','3','4','5'].map(buildZone).join('')}
            <div class="pz-nav-fz pz-nav-fz-empty"></div>${['6','7','8','9','10'].map(buildZone).join('')}
        </div>
        <div class="pz-nav-extra-zones">
            <div class="pz-nav-zone-block">
                <span class="pz-nav-zone-title">✋ Mano (${s.hand.length})</span>
                <div class="pz-nav-hand-imgs">
                    ${s.hand.slice(0,8).map(e=>{const img=e.card?.card_images?.[0]?.image_url_small||BACK;return`<img src="${img}" class="pz-nav-hand-img" onerror="this.src='${BACK}'" title="${e.card?.name||'?'}">`;}).join('')}
                    ${s.hand.length>8?`<span class="pz-nav-hand-more">+${s.hand.length-8}</span>`:''}
                </div>
            </div>
            <div class="pz-nav-zone-block">
                <span class="pz-nav-zone-title">🪦 GY (${s.gy.length})</span>
                <div class="pz-nav-hand-imgs">
                    ${s.gy.slice(0,6).map(e=>{const img=e.card?.card_images?.[0]?.image_url_small||BACK;return`<img src="${img}" class="pz-nav-hand-img" onerror="this.src='${BACK}'" title="${e.card?.name||'?'}">`;}).join('')}
                    ${s.gy.length>6?`<span class="pz-nav-hand-more">+${s.gy.length-6}</span>`:''}
                </div>
            </div>
            <div class="pz-nav-zone-block">
                <span class="pz-nav-zone-title">🚀 Banish (${s.banish.length})</span>
                <div class="pz-nav-hand-imgs">
                    ${s.banish.slice(0,6).map(e=>{const img=e.card?.card_images?.[0]?.image_url_small||BACK;return`<img src="${img}" class="pz-nav-hand-img" onerror="this.src='${BACK}'" title="${e.card?.name||'?'}">`;}).join('')}
                    ${s.banish.length>6?`<span class="pz-nav-hand-more">+${s.banish.length-6}</span>`:''}
                </div>
            </div>
        </div>`;
},

    _toggleNavCard: function (id) {
        const detail = document.getElementById(`pz-nav-detail-${id}`);
        const chv    = document.getElementById(`pz-nav-chv-${id}`);
        if (!detail) return;
        const open = detail.style.display === 'none';
        detail.style.display = open ? '' : 'none';
        if (chv) chv.textContent = open ? '▲' : '▼';
    },

    _restoreState: function (id) {
        const s = this.gameStates.find(x => x.id === id);
        if (!s) return;

        if (!confirm(`¿Restaurar el Estado #${s.id} (T${s.turn} · ${this._phaseLabel(s.phase)})? Esto restaura el tablero de ambos jugadores.`)) return;

        this.phase      = s.phase;
        this.turnNumber = s.turn;
        if (s.players) this._dualMode = true;

        ['P1','P2'].forEach(key => {
            const b = this._stateBoardOf(s, key);
            this._players[key] = {
                field:  JSON.parse(JSON.stringify(b.field)),
                hand:   JSON.parse(JSON.stringify(b.hand)),
                main:   JSON.parse(JSON.stringify(b.main)),
                extra:  JSON.parse(JSON.stringify(b.extra)),
                gy:     JSON.parse(JSON.stringify(b.gy)),
                banish: JSON.parse(JSON.stringify(b.banish)),
                other:  JSON.parse(JSON.stringify(b.other)),
                lp:     b.lp ?? 8000,
                _activeDeckName:    this._players[key]?._activeDeckName ?? this._activeDeckName ?? null,
                changePositionMode: false,
                cardsHidden:        false,
                hiddenHand:         false,
                hiddenMain:         false,
                hiddenExtra:        false,
                _tokenCounter:      this._players[key]?._tokenCounter ?? 0,
            };
        });

        this._activePlayer = s.activePlayer || 'P1';
        this._applyPlayerState(this._players[this._activePlayer]);

        const lpEl = document.getElementById('pz-lp-val');
        if (lpEl) lpEl.textContent = (this.lp ?? 8000).toLocaleString();
        this._syncModeUI();

        const wrap = this._container?.querySelector('.pz-wrap');
        if (wrap) wrap.classList.toggle('pz-wrap-p2', this._activePlayer === 'P2');

        document.querySelectorAll('.pz-phase-btn').forEach(btn => {
            btn.classList.toggle('pz-phase-active', btn.dataset.phase === s.phase);
        });

        this._addLog(`↩ Estado #${s.id} restaurado (ambos jugadores) — T${s.turn} · ${this._phaseLabel(s.phase)}`);
        this._showToast(`↩ Estado #${s.id} restaurado`);
        this._renderAllZones();
        this._updatePlayerToggleBtn();
        this.openStateNavigator();
    },

    _deleteState: function (id) {
    this.gameStates = this.gameStates.filter(s => s.id !== id);
    const navList = document.getElementById('pz-nav-list');
    if (navList) navList.innerHTML = this._renderNavList();
    this._addLog(`Estado #${id} eliminado.`);
    this._saveStatesToDeck();
},

    _clearAllStates: function () {
    if (!this.gameStates.length) return;
    if (!confirm('¿Eliminar todos los estados guardados?')) return;
    this.gameStates = [];
    const navList = document.getElementById('pz-nav-list');
    if (navList) navList.innerHTML = this._renderNavList();
    this._saveStatesToDeck();
},

    // ═══════════════════════════════════════════════════════
    toggleStatusWidget: function () {
        this.statusWidgetVisible = !this.statusWidgetVisible;
        const btn = document.getElementById('pz-sw-toggle-btn');
        if (btn) btn.classList.toggle('pz-action-active', this.statusWidgetVisible);

        if (this.statusWidgetVisible) {
            this._createStatusWidget();
        } else {
            document.getElementById('pz-status-widget')?.remove();
        }
    },

    _createStatusWidget: function () {
        document.getElementById('pz-status-widget')?.remove();
        const w = document.createElement('div');
        w.id        = 'pz-status-widget';
        w.className = 'pz-status-widget';

        // Hacer draggable
        let dragging = false, ox = 0, oy = 0;
        const header = () => document.getElementById('pz-sw-drag-handle');
        const onMouseDown = (e) => {
            dragging = true;
            const rect = w.getBoundingClientRect();
            ox = e.clientX - rect.left;
            oy = e.clientY - rect.top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup',   onMouseUp);
            e.preventDefault();
        };
        const onMouseMove = (e) => {
            if (!dragging) return;
            w.style.left   = `${e.clientX - ox}px`;
            w.style.top    = `${e.clientY - oy}px`;
            w.style.right  = 'auto';
            w.style.bottom = 'auto';
        };
        const onMouseUp = () => {
            dragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup',   onMouseUp);
        };

        document.body.appendChild(w);
        this._updateStatusWidget();

        setTimeout(() => {
            const h = document.getElementById('pz-sw-drag-handle');
            if (h) h.addEventListener('mousedown', onMouseDown);
        }, 50);
    },

    _updateStatusWidget: function () {
        const w = document.getElementById('pz-status-widget');
        if (!w) return;

        const fieldOcc = Object.values(this.field).filter(Boolean).length;
        const phaseCols = {
            draw:'#8B6914', standby:'#1a78bd',
            main1:'#1a7a2e', main2:'#1a7a2e', battle:'#bd3b1a', end:'#7a1a2e'
        };
        const pc = phaseCols[this.phase] || '#888';

        w.innerHTML = `
            <div class="pz-sw-drag" id="pz-sw-drag-handle" title="Arrastrar">⠿</div>
            <div class="pz-sw-body">
                <div class="pz-sw-turn-row">
                    <span class="pz-sw-turn">T${this.turnNumber}</span>
                    <span class="pz-sw-phase"
                          style="background:${pc}33;border-color:${pc};color:${pc}">
                        ${this._phaseLabel(this.phase)}
                    </span>
                </div>
                <div class="pz-sw-counts">
                    <span class="pz-sw-chip ${this.hand.length?'pz-sw-chip-on':''}">✋ ${this.hand.length}</span>
                    <span class="pz-sw-chip ${this.main.length?'pz-sw-chip-on':''}">📦 ${this.main.length}</span>
                    <span class="pz-sw-chip ${this.extra.length?'pz-sw-chip-on':''}">⚡ ${this.extra.length}</span>
                    <span class="pz-sw-chip ${this.gy.length?'pz-sw-chip-on':''}">🪦 ${this.gy.length}</span>
                    <span class="pz-sw-chip ${this.banish.length?'pz-sw-chip-on':''}">🚀 ${this.banish.length}</span>
                    <span class="pz-sw-chip ${fieldOcc?'pz-sw-chip-on':''}">🃏 ${fieldOcc}</span>
                </div>
                <div class="pz-sw-states-row">
                    <span class="pz-sw-states-lbl">📌 ${this.gameStates.length} estado${this.gameStates.length!==1?'s':''}</span>
                    <button class="pz-sw-nav-btn"
                            onclick="ZonaPractica.openStateNavigator()">Historia</button>
                </div>
            </div>`;

        // Re-attach drag after re-render
        const h = document.getElementById('pz-sw-drag-handle');
        if (h && !h._dragBound) {
            h._dragBound = true;
            let dragging2 = false, ox2 = 0, oy2 = 0;
            h.addEventListener('mousedown', (e) => {
                dragging2 = true;
                const r = w.getBoundingClientRect();
                ox2 = e.clientX - r.left; oy2 = e.clientY - r.top;
                document.addEventListener('mousemove', mm);
                document.addEventListener('mouseup',   mu);
                e.preventDefault();
            });
            const mm = (e) => {
                if (!dragging2) return;
                w.style.left = `${e.clientX - ox2}px`;
                w.style.top  = `${e.clientY - oy2}px`;
                w.style.right = 'auto'; w.style.bottom = 'auto';
            };
            const mu = () => { dragging2 = false; document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
        }
    },
    // ═══════════════════════════════════════════════════════
    _updateFloatingBtns: function () {
        const inSim      = window.Navigation?.currentTab === 'simuladores';
const inPractica = inSim && (window.Torneo?.simTab === 'practica')
                   && this._hasOpened
                   && this._container && this._container.style.display !== 'none';

        // Ocultar por completo Atajos (y Helper, si existe) mientras se esta en Zona de Practica
        const scBtn = document.getElementById('shortcuts-float-btn');
        if (scBtn) scBtn.style.display = inPractica ? 'none' : '';
        const helpBtn = document.getElementById('help-float-btn');
        if (helpBtn) helpBtn.style.display = inPractica ? 'none' : '';

        if (!inPractica) { this._cleanupFloatBtns(); return; }

        // ── Log flotante (solo si hay entradas) ─────────────
        let logBtn = document.getElementById('pz-float-log-btn');
        if (this.logEntries.length > 0) {
            if (!logBtn) {
                logBtn = document.createElement('button');
                logBtn.id        = 'pz-float-log-btn';
                logBtn.className = 'pz-float-btn';
                logBtn.innerHTML = '📋';
                logBtn.title     = 'Log';
                logBtn.onclick   = () => ZonaPractica.openLog();
                document.body.appendChild(logBtn);
            }
        } else {
            logBtn?.remove();
        }

        // ── Cambiar Pos flotante (solo si hay cartas en campo) ──
        const fieldHasCards = Object.values(this.field).some(Boolean);
        let cpBtn = document.getElementById('pz-float-chgpos-btn');
        if (fieldHasCards) {
            if (!cpBtn) {
                cpBtn = document.createElement('button');
                cpBtn.id        = 'pz-float-chgpos-btn';
                cpBtn.className = 'pz-float-btn';
                cpBtn.innerHTML = '↕';
                cpBtn.title     = 'Cambiar Posición';
                cpBtn.onclick   = () => ZonaPractica.toggleChangePosition();
                document.body.appendChild(cpBtn);
            }
            cpBtn.classList.toggle('pz-float-btn-active', this.changePositionMode);
        } else {
            cpBtn?.remove();
        }

        if (!document.getElementById('pz-float-markstate-btn')) {
            const btn = document.createElement('button');
            btn.id        = 'pz-float-markstate-btn';
            btn.className = 'pz-float-btn pz-float-btn-state';
            btn.innerHTML = '📌';
            btn.title     = 'Marcar Estado';
            btn.dataset.sectionId = 'pz-markstate-btn';
            btn.onclick   = () => ZonaPractica.saveGameState();
            document.body.appendChild(btn);
        }
        if (!document.getElementById('pz-float-player-btn')) {
            const playerBtn = document.createElement('button');
            playerBtn.id        = 'pz-float-player-btn';
            playerBtn.className = 'pz-float-btn pz-float-btn-player';
            playerBtn.title     = 'Cambiar jugador activo';
            playerBtn.onclick   = () => ZonaPractica.switchPlayer(ZonaPractica._activePlayer === 'P1' ? 'P2' : 'P1');
            document.body.appendChild(playerBtn);
        }
        this._updatePlayerToggleBtn();
          if (!document.getElementById('pz-float-close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.id        = 'pz-float-close-btn';
            closeBtn.className = 'pz-float-btn pz-float-btn-close';
            closeBtn.innerHTML = '✕';
            closeBtn.title     = 'Ocultar Zona de Práctica';
            closeBtn.onclick   = () => ZonaPractica.closeFloating();
            document.body.appendChild(closeBtn);
        }
    },

    _cleanupFloatBtns: function () {
        ['pz-float-log-btn', 'pz-float-markstate-btn','pz-float-chgpos-btn', 'pz-float-close-btn',
         'pz-float-player-btn', 'pz-chain-resolve-btn'].forEach(id => document.getElementById(id)?.remove());
        const scBtn = document.getElementById('shortcuts-float-btn');
        if (scBtn) { scBtn.style.bottom = ''; scBtn.style.display = ''; }
        const helpBtn = document.getElementById('help-float-btn');
        if (helpBtn) helpBtn.style.display = '';

        
    },
    // ═══════════════════════════════════════════════════════
    _showToast: function (msg, duration = 2000) {
        document.getElementById('pz-toast')?.remove();
        const t = document.createElement('div');
        t.id        = 'pz-toast';
        t.className = 'pz-toast';
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('pz-toast-show'));
        setTimeout(() => {
            t.classList.remove('pz-toast-show');
            setTimeout(() => t.remove(), 350);
        }, duration);
    },

    // ═══════════════════════════════════════════════════════
    _renderAllZones: function () {
        ['A','B','C','1','2','3','4','5','6','7','8','9','10'].forEach(z => this._renderFieldZone(z));
        ['hand','main','extra','gy','banish','other'].forEach(z => this._renderZone(z));
        this._updateStatusWidget();
        this._updateFloatingBtns();
    },

    _renderFieldZone: function (zone) {
    const el = document.getElementById(`pz-zone-${zone}`);
    if (!el) return;
    el.querySelectorAll('.pz-card-img, .pz-card-ghost').forEach(e => e.remove());
    el.querySelector('.pz-pos-badge')?.remove();
    el.querySelector('.pz-chain-badge')?.remove();
    el.querySelector('.pz-xyz-stack')?.remove();
    el.querySelector('.pz-xyz-count-badge')?.remove();
        const entry = this.field[zone];
        if (!entry?.card) return;

        const img = document.createElement('img');
        img.className = 'pz-card-img';
        img.src = entry.faceUp
            ? (entry.card.card_images?.[0]?.image_url_small || this.CARD_BACK)
            : this.CARD_BACK;
        img.onerror = () => { img.src = this.CARD_BACK; };
        if (entry.rotation) img.style.transform = `rotate(${entry.rotation}deg)`;
        el.insertBefore(img, el.querySelector('.pz-zone-lbl'));

        if (!entry.faceUp && entry.card.card_images?.[0]?.image_url_small) {
            const ghost = document.createElement('img');
            ghost.className = 'pz-card-ghost';
            ghost.src = entry.card.card_images[0].image_url_small;
            ghost.onerror = () => { ghost.remove(); };
            ghost.style.cssText = 'position:absolute;inset:0; top:11px; left:12px; width:80%;height:auto; max-height:80%;opacity:0.45; z-index:2;pointer-events:none;object-fit:contain;';
            el.style.position = 'relative';
            if (entry.rotation) ghost.style.transform = `rotate(${entry.rotation}deg)`;
            el.insertBefore(ghost, el.querySelector('.pz-zone-lbl'));
        }

        if (this.changePositionMode) {
            const badge = document.createElement('span');
            badge.className = 'pz-pos-badge';
            const isMonsterZone = ['1','2','3','4','5','A','B'].includes(String(zone));
            if (isMonsterZone) {
                if (entry.faceUp && entry.rotation === 0)  { badge.textContent = 'ATK'; badge.classList.add('pz-pos-atk'); }
                else if (entry.faceUp && entry.rotation)   { badge.textContent = 'DEF'; badge.classList.add('pz-pos-def'); }
                else                                        { badge.textContent = 'SET'; badge.classList.add('pz-pos-set'); }
            } else {
                badge.textContent = entry.faceUp ? 'ACT' : 'SET';
                badge.classList.add(entry.faceUp ? 'pz-pos-atk' : 'pz-pos-set');
            }
            el.appendChild(badge);
        }
        if (entry._chainNum) {
            const existing = el.querySelector('.pz-chain-badge');
            if (!existing) {
                const badge = document.createElement('span');
                badge.className = 'pz-chain-badge';
                badge.textContent = entry._chainNum;
                el.appendChild(badge);
            }
        }
        // Materiales XYZ — solo muestra la última carta acoplada visualmente
        const mats = entry._materials;
        if (mats?.length) {
            const lastMat = mats[mats.length - 1];
            const stack = document.createElement('div');
            stack.className = 'pz-xyz-stack';
            const mi = document.createElement('img');
            mi.className = 'pz-xyz-mat-img';
            mi.src = lastMat.card?.card_images?.[0]?.image_url_small || this.CARD_BACK;
            mi.onerror = () => { mi.src = this.CARD_BACK; };
            stack.appendChild(mi);
            el.appendChild(stack);
            const badge = document.createElement('span');
            badge.className = 'pz-xyz-count-badge';
            badge.textContent = `×${mats.length}`;
            el.appendChild(badge);
        }
    },
_updateZoneCount: function (zoneName, count) {
        const labels = { hand:['pz-label-hand','Hand'], main:['pz-label-main','Main'],
                          extra:['pz-label-extra','Extra'], gy:['pz-label-gy','GY'],
                          banish:['pz-label-banish','Banish'] };
        const entry = labels[zoneName];
        if (!entry) return;
        const labelEl = document.getElementById(entry[0]);
        if (labelEl) labelEl.textContent = `${entry[1]} (${count})`;
    },

    _renderZone: function (zoneName) {
        const el = document.getElementById(`pz-zone-${zoneName}`);
        if (!el) return;
        const cards = this[zoneName];
        if (!Array.isArray(cards)) return;
        el.innerHTML = '';
        this._updateZoneCount(zoneName, cards.length);
        if (!cards.length) return;

        const isBanish  = zoneName === 'banish';
        const isHand    = zoneName === 'hand';
        const isPile    = zoneName === 'gy' || zoneName === 'banish';
        // Ocultar si el switch global o el per-zona está activo
        const isPrivate = (zoneName === 'hand'  && (this.cardsHidden || this.hiddenHand))  ||
                          (zoneName === 'main'  && (this.cardsHidden || this.hiddenMain))  ||
                          (zoneName === 'extra' && (this.cardsHidden || this.hiddenExtra));

        const maxGap = isHand ? 8 : 6;
const minGap = isHand ? -52 : -18;
        const gap = cards.length <= 7
            ? maxGap
            : Math.max(minGap, maxGap - (cards.length - 7) * (isHand ? 9 : 6));

        cards.forEach((entry, i) => {
            if (!entry?.card) return;
            const slot = document.createElement('div');
            slot.className = 'pz-card-slot';
            // GY/Banish: apiladas — la última en llegar (pintada al final) queda
            // visualmente al frente. El offset real (vertical en desktop,
            // horizontal en responsive) lo define el CSS vía esta clase.
            if (isPile) {
                if (i > 0) slot.classList.add('pz-pile-stacked');
            } else if (i > 0) {
                slot.style.marginLeft = `${gap}px`;
            }

            const img = document.createElement('img');
            if (isPrivate) {
                img.src = this.CARD_BACK;
            } else {
                img.src = entry.faceUp
                    ? (entry.card.card_images?.[0]?.image_url_small || this.CARD_BACK)
                    : this.CARD_BACK;
            }
            img.onerror  = () => { img.src = this.CARD_BACK; };
            img.draggable = false;

            if (isBanish && entry.faceUp) img.style.transform = 'rotate(90deg)';
            else if (entry.rotation) img.style.transform = `rotate(${entry.rotation}deg)`;

            slot.appendChild(img);
            

            if (entry._chainNum) {
                const badge = document.createElement('span');
                badge.className = 'pz-chain-badge';
                badge.textContent = entry._chainNum;
                slot.appendChild(badge);
            }
            el.appendChild(slot);
        });
    },

    _addLog: function (msg, card, isManual, isLike) {
    const now  = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour12:false });
    const imgUrl = card?.card_images?.[0]?.image_url_small || null;
    const cardSlim = card ? { id: card.id, name: card.name, type: card.type, desc: card.desc,
    atk: card.atk, def: card.def, race: card.race, attribute: card.attribute,
    level: card.level, rank: card.rank, linkval: card.linkval,
    banlist_info: card.banlist_info,
    card_images: card.card_images || [] } : null;
    this.logEntries.push({ msg, time, turn: this.turnNumber, imgUrl, isManual: !!isManual, isLike: !!isLike, cardName: card?.name || null, card: cardSlim, isChainStep: !!this._chainResolving, player: this._activePlayer });
        console.info(`[PZ][${this._activePlayer}] T${this.turnNumber} ${time} — ${isManual ? '[Manual] ' : ''}${msg}`);
        // Actualizar Log en tiempo real si está abierto
        const el = document.getElementById('pz-log-entries');
        if (el) { el.innerHTML = this._renderLogEntries(); el.scrollTop = el.scrollHeight; }
        this._updateFloatingBtns();
    },
_fmtLogMsg: function (msg, cardName, entryIdx, isSpecial) {
    if (!cardName) return isSpecial ? msg : `<span class="pz-log-action">${msg}</span>`;
    const idx = msg.indexOf(cardName);
    if (idx === -1) return isSpecial ? msg : `<span class="pz-log-action">${msg}</span>`;
    const before = msg.slice(0, idx);
    const after  = msg.slice(idx + cardName.length);
    const nameSpan = entryIdx !== null
        ? `<span class="pz-log-cardname pz-log-cardname-link" onclick="ZonaPractica._openLogCard(${entryIdx})">${cardName}</span>`
        : `<span class="pz-log-cardname">${cardName}</span>`;
    if (isSpecial) return `${before}${nameSpan}${after}`;
    return `${before ? `<span class="pz-log-action">${before}</span>` : ''}${nameSpan}${after ? `<span class="pz-log-action">${after}</span>` : ''}`;
},
_openLogCard: function (idx) {
    const entry = this.logEntries[idx];
    if (!entry?.card) return;
    this._closeLog();
    setTimeout(() => this._openMiniCV(entry.card), 320);
},
    _renderLogEntries: function () {
        if (!this.logEntries.length) {
            return '<p class="pz-log-empty">Sin entradas aún.</p>';
        }
        return this.logEntries.map((e, i) => {
            const isChainRes = e.msg.startsWith('⛓ Cadena resuelta');
            const isActivate = e.msg.includes('activa efecto [en la zona:');
            let extraClass = '';
            if (e.msg.startsWith('---'))  extraClass = 'pz-log-turn-sep';
            else if (e.isLike)             extraClass = 'pz-log-prosigue';
            else if (isChainRes)           extraClass = 'pz-log-chain-resolve';
            else if (isActivate)           extraClass = 'pz-log-activate';
            if (e.isChainStep) extraClass += ' pz-log-chain-step';
            const p = e.player || 'P1';
            return `
            <div class="pz-log-entry ${extraClass}" id="pz-log-entry-${i}">
                <span class="pz-log-entry-idx">${i + 1}</span>
                <span class="pz-log-entry-meta">T${e.turn}&nbsp;${e.time}</span>
                <span class="pz-log-ptag pz-log-ptag-${p}">${p}</span>
                ${e.isManual ? `<span class="pz-log-player-tag">Jugador:</span>` : ''}
                ${e.imgUrl ? `<img src="${e.imgUrl}" class="pz-log-card-thumb"
                    onerror="this.style.display='none'" title="${e.msg}">` : ''}
                <span class=\"pz-log-entry-msg\">${ZonaPractica._fmtLogMsg(e.msg, e.cardName, i, !!(e.isLike || isChainRes || isActivate))}</span>
            </div>`}).join('');

            
    },
    // ── Like / Prosigue ──────────────────────────────────────
_logLike: function () {
    this._addLog('✅ ¡Prosigue!', null, false, true);
},

// ── LP de Zona de Práctica ───────────────────────────────
_openPzLP: function (type) {
    document.getElementById('pz-lp-panel')?.remove();
    const presets = [100, 300, 500, 1000, 1500, 2000, 4000, 8000];
    const label   = type === 'gain' ? 'Gain ＋' : 'Damage －';
    const panel   = document.createElement('div');
    panel.id      = 'pz-lp-panel';
    panel.className = 'pz-modal-overlay';
    panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
    panel.innerHTML = `
        <div class="pz-modal-box" style="max-width:320px;text-align:center">
            <button class="pz-modal-close" onclick="document.getElementById('pz-lp-panel').remove()">✕</button>
            <div class="pz-modal-title">${label} — Life Points</div>
            <div class="pz-lp-presets">
                ${presets.map(v => `<button class="pz-lp-preset-btn"
                    onclick="document.getElementById('pz-lp-input').value='${v}'">${v.toLocaleString()}</button>`).join('')}
            </div>
            <div style="display:flex;gap:6px;margin-top:10px">
                <input type="number" id="pz-lp-input" class="pz-search-input"
                       placeholder="Cantidad..." min="0" style="flex:1">
                <button class="pz-zmenu-ver" style="padding:7px 12px;border-radius:6px;border:none;cursor:pointer"
                        onclick="document.getElementById('pz-lp-input').value=''">✕</button>
            </div>
            <button class="pz-ctrl-btn pz-ctrl-deck" style="width:100%;margin-top:10px"
                    onclick="ZonaPractica._calcPzLP('${type}')">✓ Aplicar</button>
        </div>`;
    document.body.appendChild(panel);
    setTimeout(() => document.getElementById('pz-lp-input')?.focus(), 50);
},

_calcPzLP: function (type) {
    const val = parseInt(document.getElementById('pz-lp-input')?.value);
    if (isNaN(val) || val < 0) return;
    if (type === 'gain')   this.lp = (this.lp || 8000) + val;
    if (type === 'damage') this.lp = Math.max(0, (this.lp || 8000) - val);
    const el = document.getElementById('pz-lp-val');
    if (el) el.textContent = this.lp.toLocaleString();
    this._addLog(`❤️ LP ${type === 'gain' ? '+' : '-'}${val} → ${this.lp.toLocaleString()}`);
    document.getElementById('pz-lp-panel')?.remove();
},
_importYDK: function () {
    document.getElementById('pz-deck-overlay')?.remove();
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.ydk';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        const lines = text.split(/\r?\n/).map(l => l.trim());
        let section = 'main';
        const ids   = { main: [], extra: [], side: [] };
        lines.forEach(l => {
            if (l === '#main')    { section = 'main';  return; }
            if (l === '#extra')   { section = 'extra'; return; }
            if (l === '!side')    { section = 'side';  return; }
            if (/^\d+$/.test(l)) ids[section].push(l);
        });
        const allIds = [...new Set([...ids.main, ...ids.extra, ...ids.side])];
        if (!allIds.length) { this._showToast('YDK vacío o inválido.', 2000); return; }
        this._showToast('⏳ Cargando cartas...', 2500);
        try {
            const res   = await fetch(`${this.API_URL}?id=${allIds.join('%7C')}`);
            const data  = await res.json();
            const byId  = {};
            (data.data || []).forEach(c => { byId[String(c.id)] = c; });
            const makeEntries = (section) =>
                ids[section].map(id => ({ card: byId[id] || { id, name:`#${id}`, type:'', desc:'', card_images:[{image_url_small:this.CARD_BACK,image_url:this.CARD_BACK}] }, faceUp: false, rotation: 0 }));
            this._resetState();
            const main  = makeEntries('main');
            const extra = makeEntries('extra');
            const side  = makeEntries('side').map(e => ({...e, faceUp:true}));
            for (let i = main.length-1; i > 0; i--) {
                const j = Math.floor(Math.random()*(i+1));
                [main[i],main[j]] = [main[j],main[i]];
            }
            this.main  = main;
            this.extra = extra;
            this.other = side;
            this._activeDeckName = null;
            this._addLog(`Importado YDK: ${file.name} — Main:${main.length} Extra:${extra.length} Side→Other:${side.length}`);
            this._renderAllZones();
            this._showToast(`✅ Deck importado (${main.length} main / ${extra.length} extra)`);
        } catch (err) {
            this._showToast('❌ Error al importar YDK.', 2500);
            console.error('[PZ] YDK import error:', err);
        }
    };
    input.click();
},
_zoneName: function (zone) {
    const map = { hand:'Hand', main:'Main', extra:'Extra', gy:'GY', banish:'Banish', other:'Other' };
    return map[zone] || `Zona ${zone}`;
},

_resetPzLP: function () {
    this.lp = 8000;
    const el = document.getElementById('pz-lp-val');
    if (el) el.textContent = '8,000';
},

// Guarda versión "slim" (sin card_images ni desc) para no saturar localStorage.
// Guarda versión "slim" (sin card_images ni desc) para no saturar localStorage.
_slimBoard: function (b) {
    return {
        lp:     b.lp ?? 8000,
        field:  this._slimField(b.field),
        hand:   b.hand.map(e => this._slimEntry(e)),
        main:   b.main.map(e => this._slimEntry(e)),
        extra:  b.extra.map(e => this._slimEntry(e)),
        gy:     b.gy.map(e => this._slimEntry(e)),
        banish: b.banish.map(e => this._slimEntry(e)),
        other:  b.other.map(e => this._slimEntry(e)),
    };
},

_saveStatesToDeck: function () {
    if (!this._activeDeckName) return;
    const slim = this.gameStates.map(s => ({
        id:           s.id,
        turn:         s.turn,
        phase:        s.phase,
        timestamp:    s.timestamp,
        activePlayer: s.activePlayer || 'P1',
        players: {
            P1: this._slimBoard(this._stateBoardOf(s, 'P1')),
            P2: this._slimBoard(this._stateBoardOf(s, 'P2')),
        },
    }));
    try {
        localStorage.setItem(`pz_states_${this._activeDeckName}`, JSON.stringify(slim));
    } catch (e) {
        console.warn('[PZ] No se pudieron guardar estados (localStorage lleno):', e);
    }
},

_loadStatesFromDeck: function (deckName) {
    try {
        const raw = localStorage.getItem(`pz_states_${deckName}`);
        return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
},

// Versión slim de un entry: conserva posición y datos identificativos, descarta imágenes
_slimEntry: function (e) {
    if (!e?.card) return e;
    const { id, name, type, atk, def, race, attribute, level, rank, linkval, _isToken } = e.card;
    const imgSmall = e.card.card_images?.[0]?.image_url_small || '';
    return {
        faceUp:    e.faceUp,
        rotation:  e.rotation,
        _isToken:  e._isToken,
        card: { id, name, type, atk, def, race, attribute, level, rank, linkval,
                _isToken,
                card_images: imgSmall ? [{ image_url_small: imgSmall }] : [] }
    };
},

_slimField: function (field) {
    const slim = {};
    Object.entries(field).forEach(([k, v]) => {
        if (!v) { slim[k] = null; return; }
        const s = this._slimEntry(v);
        s._materials = (v._materials || []).map(m => this._slimEntry(m));
        slim[k] = s;
    });
    return slim;
},

};

window.ZonaPractica = ZonaPractica;



// ── Experimentacion — modo experimentación del deck activo desde Mi Deck ──

const Experimentacion = {

    CARD_BACK: 'https://images.ygoprodeck.com/images/cards/back.jpg',
    API_URL:   'https://db.ygoprodeck.com/api/v7/cardinfo.php',

    _container:    null,
    _rendered:     false,
    _zoom:         1,
    _instanceId:   0,
    _instances:    [],
    _dragging:     null,
    _dsCache:      { saved: [], engines: [], meta: [] },
    _listGroups: [],

    // ── Punto de entrada ────────────────────────────────────────
    renderInto: function (container) {
        if (!container) return;
        this._container = container;
        this._hasOpened = true;
        if (this._rendered) return;
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

    _viewCardFromList: function () {  },

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

    _addCopyFromList: function () {  },

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