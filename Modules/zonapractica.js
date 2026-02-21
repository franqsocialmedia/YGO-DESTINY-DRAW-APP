/* ====================================
   ZONA DE PRÁCTICA MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Fases 1 · 2 · 3 · 4 · 5
   ==================================== */

const ZonaPractica = {

    CARD_BACK:      'https://images.ygoprodeck.com/images/cards/back.jpg',
    API_URL:        'https://db.ygoprodeck.com/api/v7/cardinfo.php',
    MAX_RESULTS:    100,

    _container:     null,
    _searchTimeout: null,
    _activeMove:    null,
    _lastSearchResults: [],
    _dsCache:       { saved: [], engines: [], meta: [] },

    // ─── Estado ───────────────────────────────────────────────────
    phase:               'draw',
    turnNumber:          1,
    changePositionMode:  false,
    cardsHidden:         false,          // global: oculta hand+main
    hiddenHand:          false,          // per-zone: solo hand
    hiddenMain:          false,          // per-zone: solo main
    hiddenExtra:         false,          // per-zone: solo extra
    statusWidgetVisible: false,
    logEntries:          [],
    gameStates:          [],
    _chainCounter: 0,
    _chainedCards: [],   // [{zone, slotIndex, zoneType}]

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
        spellSubtype:'', trapSubtype:'', level:'', linkval:'', scale:'', atk:'', def:''
    },
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

    // ═══════════════════════════════════════════════════════
    // ENTRY POINT
    // ═══════════════════════════════════════════════════════
    renderInto: function (container) {
        if (!container) return;
        this._container = container;
        if (!container.querySelector('.pz-wrap')) {
            container.innerHTML = this._buildShell();
        }
        this._renderAllZones();
    },

    _buildShell: function () {
        return `<div class="pz-wrap">

           <div class="pz-controls-bar">
                <button class="pz-ctrl-btn pz-ctrl-search"
                        onclick="ZonaPractica.openCardSearch()">🔍 Buscar Carta</button>
                <button class="pz-ctrl-btn pz-ctrl-deck"
                        onclick="ZonaPractica.openDeckSelector()">🃏 Usar Deck</button>
                <button class="pz-ctrl-btn pz-ctrl-historia"
                        onclick="ZonaPractica.openStateNavigator()">📜 Historial</button>
                <button class="pz-ctrl-btn pz-ctrl-widget"
                        id="pz-sw-toggle-btn"
                        onclick="ZonaPractica.toggleStatusWidget()"
                        style="display:none">📊 Estado</button>
                
                <button class="pz-ctrl-btn pz-ctrl-clear"
                        onclick="ZonaPractica.clearBoard()">🗑 Limpiar</button>
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

                    <!-- Campo escalado al 60% -->
                    <div class="pz-field-grid-wrap">
                        <div class="pz-field-grid">

                            <!-- Fila EMZ -->
                            <div class="pz-fg-emz-spacer"></div>
                            <div class="pz-zone pz-zone-emz pz-fg-emz-a" id="pz-zone-A" data-zone="A"
                                 onclick="ZonaPractica.onZoneClick('A')"><span class="pz-zone-lbl">A</span></div>
                            <div class="pz-logo-cell pz-fg-logo">
                                <img src="img/LOGO - Destiny Draw Yugioh APP.png" class="pz-logo-img"
                                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                                <div class="pz-logo-fallback" style="display:none">🃏</div>
                            </div>
                            <div class="pz-zone pz-zone-emz pz-fg-emz-b" id="pz-zone-B" data-zone="B"
                                 onclick="ZonaPractica.onZoneClick('B')"><span class="pz-zone-lbl">B</span></div>
                            <div class="pz-fg-emz-spacer"></div>

                            <!-- Fila Monstruos + Zona C (izquierda) -->
                            <div class="pz-zone pz-zone-field pz-fg-c" id="pz-zone-C" data-zone="C"
                                 onclick="ZonaPractica.onZoneClick('C')"><span class="pz-zone-lbl">C</span></div>
                            ${[1,2,3,4,5].map(n=>`
                            <div class="pz-zone pz-zone-monster" id="pz-zone-${n}" data-zone="${n}"
                                 onclick="ZonaPractica.onZoneClick('${n}')"><span class="pz-zone-lbl">${n}</span></div>`).join('')}

                            <!-- Fila S/T -->
                            <div class="pz-fg-st-spacer"></div>
                            <div class="pz-zone pz-zone-pendulum" id="pz-zone-6" data-zone="6"
                                 onclick="ZonaPractica.onZoneClick('6')"><span class="pz-zone-lbl">6</span></div>
                            <div class="pz-zone pz-zone-st" id="pz-zone-7" data-zone="7"
                                 onclick="ZonaPractica.onZoneClick('7')"><span class="pz-zone-lbl">7</span></div>
                            <div class="pz-zone pz-zone-st" id="pz-zone-8" data-zone="8"
                                 onclick="ZonaPractica.onZoneClick('8')"><span class="pz-zone-lbl">8</span></div>
                            <div class="pz-zone pz-zone-st" id="pz-zone-9" data-zone="9"
                                 onclick="ZonaPractica.onZoneClick('9')"><span class="pz-zone-lbl">9</span></div>
                            <div class="pz-zone pz-zone-pendulum" id="pz-zone-10" data-zone="10"
                                 onclick="ZonaPractica.onZoneClick('10')"><span class="pz-zone-lbl">10</span></div>

                        </div>
                    </div>

                    <!-- Panel lateral: GY + Banish -->
                    <div class="pz-field-side">
                        <div class="pz-field-side-zone">
                            <div class="pz-multi-zone pz-gy-zone pz-side-zone" id="pz-zone-gy"
                                 onclick="ZonaPractica._onMultiZoneClick(event,'gy')"></div>
                            <div class="pz-field-side-btns">
                                <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('gy')">👁</button>
                                <span class="pz-row-label">GY</span>
                            </div>
                        </div>
                        <div class="pz-field-side-zone">
                            <div class="pz-multi-zone pz-banish-zone pz-side-zone" id="pz-zone-banish"
                                 onclick="ZonaPractica._onMultiZoneClick(event,'banish')"></div>
                            <div class="pz-field-side-btns">
                                <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('banish')">👁</button>
                                <span class="pz-row-label">Banish</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- ── ZONAS INFERIORES ── -->

                <!-- Mano -->
                <div class="pz-zone-row pz-hand-row">
                    <span class="pz-row-label">Hand</span>
                    <div class="pz-multi-zone pz-hand-zone" id="pz-zone-hand"
                         onclick="ZonaPractica._onMultiZoneClick(event,'hand')"></div>
                    <button class="pz-mini-btn pz-zone-eye-btn"
                            id="pz-hide-btn-hand" title="Ocultar/Mostrar Hand"
                            onclick="ZonaPractica.toggleHideZone('hand')">🙈</button>
                    <button class="pz-mini-btn" title="Barajar mano"
                            onclick="ZonaPractica.shuffleHand()">🔀</button>
                    <button class="pz-mini-btn" title="Robar carta"
                            onclick="ZonaPractica.drawCard()">⬆</button>
                </div>

                <!-- Main Deck -->
                <div class="pz-zone-row pz-deck-row">
                    <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('main')">👁</button>
                    <button class="pz-mini-btn pz-zone-eye-btn"
                            id="pz-hide-btn-main" title="Voltear todas (Main)"
                            onclick="ZonaPractica._flipAllInZone('main')">🔄</button>
                    <span class="pz-row-label">Main</span>
                    <div class="pz-multi-zone pz-main-zone" id="pz-zone-main"
                         onclick="ZonaPractica._onMultiZoneClick(event,'main')"></div>
                </div>

                <!-- Extra Deck -->
                <div class="pz-zone-row pz-deck-row">
                    <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('extra')">👁</button>
                    <button class="pz-mini-btn pz-zone-eye-btn"
                            id="pz-hide-btn-extra" title="Voltear todas (Extra)"
                            onclick="ZonaPractica._flipAllInZone('extra')">🔄</button>
                    <span class="pz-row-label">Extra</span>
                    <div class="pz-multi-zone pz-extra-zone" id="pz-zone-extra"
                         onclick="ZonaPractica._onMultiZoneClick(event,'extra')"></div>
                </div>

                <!-- Other Options -->
                <div class="pz-zone-row pz-other-row">
                    <button class="pz-mini-btn" onclick="ZonaPractica.openDeckViewer('other')">👁</button>
                    <span class="pz-row-label">Other</span>
                    <div class="pz-multi-zone pz-other-zone" id="pz-zone-other"
                         onclick="ZonaPractica._onMultiZoneClick(event,'other')"></div>
                </div>

            </div>

            <div class="pz-action-bar">
                <button class="pz-action-btn" onclick="ZonaPractica.shuffleDeck()">🔀 Barajar Deck</button>
                <button class="pz-action-btn" onclick="ZonaPractica.drawCard()">⬆ Robar</button>
                <button class="pz-action-btn" id="pz-btn-chgpos"
                        onclick="ZonaPractica.toggleChangePosition()">↕ Cambiar Pos.</button>
                <button class="pz-action-btn" onclick="ZonaPractica.saveGameState()">📌 Marcar Estado</button>
                <button class="pz-action-btn" id="pz-btn-hide"
                        onclick="ZonaPractica.toggleHideCards()">🙈 Ocultar Cartas</button>
                <button class="pz-action-btn" onclick="ZonaPractica.openLog()">📋 Log</button>
            </div>
        </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // FASES
    // ═══════════════════════════════════════════════════════
    setPhase: function (p) {
        if (this.phase === 'end' && p === 'draw') {
            this.turnNumber++;
            this._addLog(`--- Turno: ${this.turnNumber} ---`);
        }
        this.phase = p;
        document.querySelectorAll('.pz-phase-btn').forEach(btn => {
            btn.classList.toggle('pz-phase-active', btn.dataset.phase === p);
        });
    },

    // ═══════════════════════════════════════════════════════
    // BUSCAR CARTA — con filtros avanzados + límite 100
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
                </div>
                <div id="pz-adv-panel" class="adv-filter-panel-inner" style="display:none"></div>
                <div id="pz-search-results" class="pz-search-results">
                    <p class="pz-search-hint">Escribe un nombre o usa filtros (máx. ${this.MAX_RESULTS})</p>
                </div>
            </div>`;
        document.body.appendChild(overlay);

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
            spellSubtype:'', trapSubtype:'', level:'', linkval:'', scale:'', atk:'', def:''
        });
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
                  f.spellSubtype||f.trapSubtype||f.level||f.linkval||f.scale||f.atk||f.def);
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
        this._closeSearch();
    },

    // ═══════════════════════════════════════════════════════
    // MINI CARD VIEWER COMPACTO
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
                        <div class="pz-mcv-desc">${card.desc || ''}</div>
                    </div>
                </div>
                ${addIdx >= 0 ? `<button class="pz-mcv-add-btn"
                    onclick="ZonaPractica._addSearchCard(${addIdx});document.getElementById('pz-minicv-overlay')?.remove()">
                    ➕ Añadir a Other Options</button>` : ''}
            </div>`;
        document.body.appendChild(overlay);
    },

    // ═══════════════════════════════════════════════════════
    // USAR DECK
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
                    return `<div class="pz-ds-item" onclick="ZonaPractica._loadDeck('${type}','${i}')">
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
                    ${saved.length||engines.length||meta.length
                        ? buildSec('📁 Decks Guardados',saved,'saved') + buildSec('⚙️ Engines',engines,'engines') + buildSec('🌐 Meta',meta,'meta')
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
        const main=[], extra=[], side=[];
        Object.values(cards).forEach(item => {
            for (let i=0; i<(item.qty||1); i++) {
                const e = { card: item.data||item, faceUp:false, rotation:0 };
                if      (item.location==='main')  main.push(e);
                else if (item.location==='extra') extra.push({...e});
                else if (item.location==='side')  side.push({...e, faceUp:true});
            }
        });
        // Fisher-Yates
        for (let i=main.length-1; i>0; i--) {
            const j = Math.floor(Math.random()*(i+1));
            [main[i],main[j]] = [main[j],main[i]];
        }
        this.main=main; this.extra=extra; this.other=side;
        this._addLog(`Deck: ${dk.name||'(sin nombre)'} — Main:${main.length} Extra:${extra.length} Side→Other:${side.length}`);
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
        document.querySelectorAll('.pz-phase-btn').forEach(b => b.classList.toggle('pz-phase-active', b.dataset.phase==='draw'));
        this._renderAllZones();
        this._addLog('Tablero limpiado.');
    },

    _resetState: function () {
        Object.keys(this.field).forEach(k => this.field[k]=null);
        this.hand=[]; this.main=[]; this.extra=[]; this.gy=[]; this.banish=[]; this.other=[];
    },

    // ═══════════════════════════════════════════════════════
    // INTERACCIÓN — ZONAS MONO (CAMPO PÚBLICO)
    // ═══════════════════════════════════════════════════════
    onZoneClick: function (zone) {
        if (this._activeMove) { this._completeMoveToField(zone); return; }
        // Modo cambiar posición
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

    let anchor = containerEl;
    if (zoneType === 'multi' && slotIndex !== null) {
        const slots = containerEl.querySelectorAll('.pz-card-slot');
        if (slots[slotIndex]) anchor = slots[slotIndex];
    }

    const menu = document.createElement('div');
    menu.className = 'pz-zone-menu';
    menu.id = 'pz-zone-menu-active';
    menu.innerHTML = `
        <button class="pz-zmenu-btn pz-zmenu-ver"
                onclick="ZonaPractica._zmView('${zone}',${slotIndex},event)">Ver</button>
        <button class="pz-zmenu-btn pz-zmenu-accion"
                onclick="ZonaPractica._zmShowAction('${zone}',${slotIndex},'${zoneType}',event)">Acción</button>`;
    anchor.appendChild(menu);

    const close = (e) => {
        if (!menu.contains(e.target)) {
            this._closeZoneMenus();
            document.removeEventListener('click', close, true);
        }
    };
    setTimeout(() => document.addEventListener('click', close, true), 50);
},

    _closeZoneMenus: function () {
        document.querySelectorAll('.pz-zone-menu, .pz-action-submenu').forEach(m => m.remove());
    },

    _zmView: function (zone, slotIndex, e) {
        e?.stopPropagation();
        this._closeZoneMenus();
        let card = null;
        if (slotIndex === null || slotIndex === undefined || slotIndex === 'null') {
            card = this.field[zone]?.card;
        } else {
            card = this._getMultiArray(zone)[parseInt(slotIndex)]?.card;
        }
        if (card) this._openMiniCV(card);
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
        const sub = document.createElement('div');
        sub.className = 'pz-action-submenu';
        sub.innerHTML = `
            <button class="pz-zmenu-btn pz-zmenu-activate"
                    onclick="ZonaPractica._zmActivate('${zone}',${slotIndex},'${zoneType}',event)">Activar</button>
            <button class="pz-zmenu-btn pz-zmenu-move"
                    onclick="ZonaPractica._zmStartMove('${zone}',${slotIndex},'${zoneType}',event)">Mover</button>`;
        anchor.appendChild(sub);
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

        // ── Cartas Encadenadas ──────────────────────────────
        this._chainCounter++;
        const chainNum = this._chainCounter;
        this._chainedCards.push({ zone, slotIndex, zoneType, chainNum, cardName: card.name });

        // Guardar chainNum EN el entry para que persista tras renders/moves
        if (entry) entry._chainNum = chainNum;

        this._renderAllZones(); // re-renders badges
        this._showChainResolveBtn();
        this._addLog(`${card.name} activa efecto [en la zona: ${zone}].`, card);
    },
// ═══════════════════════════════════════════════════════
    // CARTAS ENCADENADAS — botón flotante + resolución
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

        // Limpiar _chainNum de todos los entries
        Object.values(this.field).forEach(e => { if (e) delete e._chainNum; });
        ['hand','main','extra','gy','banish','other'].forEach(z => {
            this._getMultiArray(z).forEach(e => { if (e) delete e._chainNum; });
        });

        const msg = `⛓ Cadena resuelta — ${count} efecto${count !== 1 ? 's' : ''}. SEGOC:<br>${segocLines}`;
        this._addLog(msg);
        console.info(`[PZ] Cadena resuelta: ${count} efectos SEGOC: ${[...this._chainedCards].reverse().map(c=>c.cardName).join(' → ')}`);
        this._chainCounter = 0;
        this._chainedCards = [];
        document.getElementById('pz-chain-resolve-btn')?.remove();
        this._renderAllZones();
        this._showToast(`⛓ Cadena resuelta (${count} efectos)`, 2000);
    },

    // ═══════════════════════════════════════════════════════
    // DESCARGAR LOG
    // ═══════════════════════════════════════════════════════
    downloadLog: function () {
        if (!this.logEntries.length) { this._showToast('El log está vacío.', 1500); return; }
        const lines = this.logEntries.map(e => `[T${e.turn} ${e.time}] ${e.msg}`);
        const blob  = new Blob([lines.join('\n')], { type: 'text/plain' });
        const a     = document.createElement('a');
        a.href      = URL.createObjectURL(blob);
        a.download  = `pz-log-T${this.turnNumber}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    // ═══════════════════════════════════════════════════════
    // DESCARGAR ESTADO COMO PNG
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
    // MODO MOVER
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

    _completeMoveToField: function (targetZone) {
        const mv = this._activeMove;
        if (!mv) return;
        let entry = mv.sourceType === 'field'
            ? this.field[mv.sourceZone]
            : this._getMultiArray(mv.sourceZone)[mv.sourceSlot];
        if (!entry) { this._cancelMoveMode(); return; }
        if (this.field[targetZone]) { this._cancelMoveMode(); return; } // ocupada
        this._removeFromSource(mv);
        this.field[targetZone] = { ...entry, faceUp: true };
        this._addLog(`${entry.card.name} → Zona ${targetZone}`, entry.card);
        this._cancelMoveMode();
        this._renderAllZones();
    },

    _onMultiZoneClick: function (e, zone) {
        const slot = e.target.closest('.pz-card-slot');
        if (this._activeMove) {
            const idx = slot ? Array.from(slot.parentElement.children).indexOf(slot) : undefined;
            this._completeMoveToMulti(zone, idx);
            return;
        }
        // Modo cambiar posición en multi-zona
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
        this._removeFromSource(mv);
        const arr = this._getMultiArray(targetZone);
        (targetSlot !== undefined && targetSlot < arr.length)
            ? arr.splice(targetSlot, 0, {...entry})
            : arr.push({...entry});
        this._addLog(`${entry.card.name} → ${targetZone}`, entry.card);
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
    // DECK VIEWER MEJORADO (Fase 5)
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
                <button class="pz-dvc-act pz-dvc-del"
                        onclick="ZonaPractica._dvRemoveCard('${zoneName}',${idx})">✕</button>`;
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

        arr.splice(idx, 1);

        const dest = this._getMultiArray(target);
        dest.push({ ...entry, faceUp: (target === 'hand' || target === 'other'), rotation: 0 });

        this._addLog(`${entry.card?.name||'?'}: ${zone} → ${target}`, entry.card);
        this._renderZone(zone);
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
        this._addLog(`${entry.card?.name||'?'}: movida al ${direction === 'top' ? 'tope' : 'fondo'} del deck.`, entry.card);
    },

    _dvRemoveCard: function (zone, idx) {
        const arr   = this._getMultiArray(zone);
        const entry = arr[idx];
        if (!entry) return;
        arr.splice(idx, 1);
        this._addLog(`${entry.card?.name||'?'} eliminada de ${zone}.`, entry.card);
        this._renderZone(zone);
        this._updateStatusWidget();
        this._refreshDV(zone);
    },

    // ═══════════════════════════════════════════════════════
    // BARAJAR MANO
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
    // FASE 4 — BARAJAR DECK
    // ═══════════════════════════════════════════════════════
    shuffleDeck: function () {
        if (!this.main.length) { this._showToast('⚠️ El Main Deck está vacío.'); return; }
        for (let i = this.main.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.main[i], this.main[j]] = [this.main[j], this.main[i]];
        }
        this._renderZone('main');
        this._addLog('Deck barajado.');
        this._showToast(`🔀 Deck barajado (${this.main.length} cartas)`);
    },

    // ═══════════════════════════════════════════════════════
    // FASE 4 — ROBAR CARTA
    // ═══════════════════════════════════════════════════════
    drawCard: function () {
        if (!this.main.length) {
            this._showToast('⚠️ No quedan cartas en el Deck.', 2500);
            this._addLog('Intento de robo fallido: deck vacío.');
            return;
        }
        const entry = this.main.shift();
        entry.faceUp = true;
        this.hand.push(entry);
        this._renderZone('main');
        this._renderZone('hand');
        this._addLog(`Draw: ${entry.card?.name || '?'}`, entry.card);
        this._showToast(`⬆ Robada: ${entry.card?.name || '?'}`);
        // Actualizar widget de ocultar si está activo
        if (this.cardsHidden) this._updateHideWidget();
    },

    // ═══════════════════════════════════════════════════════
    // FASE 4 — CAMBIAR POSICIÓN
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

    // Cicla la posición de una entry: ATK → DEF → Boca abajo → ATK
    // Para S/T: Activa → Set → Activa
    _cyclePosition: function (entry, zone) {
        const isMonsterZone = ['1','2','3','4','5','A','B'].includes(String(zone));

        if (isMonsterZone) {
            // ATK (faceUp, 0) → DEF (faceUp, 90) → Boca abajo (faceDown, 90) → ATK
            if (entry.faceUp && entry.rotation === 0) {
                entry.faceUp = true;  entry.rotation = 90;  return 'DEF';
            } else if (entry.faceUp && entry.rotation === 90) {
                entry.faceUp = false; entry.rotation = 90;  return 'Boca abajo';
            } else {
                entry.faceUp = true;  entry.rotation = 0;   return 'ATK';
            }
        } else {
            // Hechizo/Trampa: Activada → Set → Activada
            if (entry.faceUp) {
                entry.faceUp = false; entry.rotation = 0;   return 'Set';
            } else {
                entry.faceUp = true;  entry.rotation = 0;   return 'Activada';
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FASE 4 — MARCAR ESTADO
    // ═══════════════════════════════════════════════════════
    saveGameState: function () {
        const snap = {
            id:        this.gameStates.length + 1,
            turn:      this.turnNumber,
            phase:     this.phase,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
            field:     JSON.parse(JSON.stringify(this.field)),
            hand:      JSON.parse(JSON.stringify(this.hand)),
            main:      JSON.parse(JSON.stringify(this.main)),
            extra:     JSON.parse(JSON.stringify(this.extra)),
            gy:        JSON.parse(JSON.stringify(this.gy)),
            banish:    JSON.parse(JSON.stringify(this.banish)),
            other:     JSON.parse(JSON.stringify(this.other)),
        };
        this.gameStates.push(snap);
        // Mostrar botón Estado la primera vez que se guarda un estado
        const swBtn = document.getElementById('pz-sw-toggle-btn');
        if (swBtn) swBtn.style.display = '';

        this._addLog(`📌 Estado #${snap.id} guardado — T${snap.turn} · ${snap.phase} · Mano:${snap.hand.length} · GY:${snap.gy.length}`);
        this._showToast(`📌 Estado #${snap.id} guardado`);
        // Actualizar panel de log si está abierto
        const logEntries = document.getElementById('pz-log-entries');
        if (logEntries) logEntries.innerHTML = this._renderLogEntries();
        // Actualizar navegador si está abierto
        const navList = document.getElementById('pz-nav-list');
        if (navList) navList.innerHTML = this._renderNavList();
        // Actualizar widget
        this._updateStatusWidget();
        this._updateFloatingBtns();
    },

    // ═══════════════════════════════════════════════════════
    // FASE 4 — OCULTAR CARTAS (global)
    // ═══════════════════════════════════════════════════════
    toggleHideCards: function () {
        this.cardsHidden = !this.cardsHidden;
        const btn = document.getElementById('pz-btn-hide');
        if (btn) {
            btn.innerHTML = this.cardsHidden ? '👁 Mostrar Cartas' : '🙈 Ocultar Cartas';
            btn.classList.toggle('pz-action-active', this.cardsHidden);
        }
        // Sincronizar flags per-zona con el estado global
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
        arr.forEach(e => { e.faceUp = !allFaceUp; });
        this._renderZone(zone);
        this._addLog(`${zone}: ${allFaceUp ? 'todas boca abajo' : 'todas boca arriba'}.`);
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
    // FASE 4 — LOG PANEL
    // ═══════════════════════════════════════════════════════
    openLog: function () {
        // Toggle: si ya está abierto, cerrar
        if (document.getElementById('pz-log-panel')) {
            document.getElementById('pz-log-panel').classList.remove('pz-log-panel-open');
            setTimeout(() => document.getElementById('pz-log-panel')?.remove(), 300);
            return;
        }

        const panel = document.createElement('div');
        panel.id        = 'pz-log-panel';
        panel.className = 'pz-log-panel';

        const shortcuts = [
            { icon:'👆', label:'Normal',         msg:'Invocación normal.'   },
            { icon:'✨', label:'Especial',        msg:'Invocación especial.' },
            { icon:'⚔️', label:'Ataque',          msg:'Declara ataque.'     },
            { icon:'🚫', label:'Negar',           msg:'Efecto negado.'      },
            { icon:'💥', label:'Destruir',        msg:'Carta destruida.'    },
            { icon:'↩️', label:'Devolver',        msg:'Carta devuelta al deck.' },
            { icon:'👀', label:'Revelar Carta',   msg:'Carta revelada.'     },
            { icon:'🔍', label:'Mirar Carta',     msg:'Carta mirada.'       },
            { icon:'⛓️', label:'Resolver Cadena', msg:'__RESOLVE_CHAIN__' },
        ];
// Pre-calcular chips de estados con onclick de scroll
        const statesBarHtml = this.gameStates.length ? (() => {
            const chips = this.gameStates.map(s => {
                const targetIdx = this.logEntries.findIndex(e =>
                    e.msg.includes(`Estado #${s.id} guardado`));
                const scrollCall = targetIdx >= 0
                    ? `var c=document.getElementById('pz-log-entries');var t=document.getElementById('pz-log-entry-${targetIdx}');if(c&&t){c.scrollTo({top:t.offsetTop-8,behavior:'smooth'});}`
                    : '';
                return `<div class="pz-log-state-chip pz-log-state-chip-link"
                             title="T${s.turn} · ${s.phase} · ${s.timestamp} — Ir al registro"
                             onclick="${scrollCall}">
                    #${s.id} <span>T${s.turn}·${s.timestamp}</span>
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
                    <button class="pz-modal-close" onclick="ZonaPractica.openLog()">✕</button>
                </div>
            </div>

            <div class="pz-log-shortcuts">
                ${shortcuts.map(s =>
                    `<button class="pz-log-sc-btn"
                        onclick="${s.msg === '__RESOLVE_CHAIN__' ? 'ZonaPractica.resolveChain()' : `ZonaPractica._logShortcut('${s.msg}')`}"
                        title="${s.label}">
                        <span class="pz-log-sc-icon">${s.icon}</span>
                        <span class="pz-log-sc-label">${s.label}</span>
                    </button>`).join('')}
            </div>

            <div class="pz-log-input-row">
                <input type="text" id="pz-log-custom-input" class="pz-log-custom-input"
                       placeholder="Entrada manual..." autocomplete="off">
                <button class="pz-log-add-btn" onclick="ZonaPractica._addCustomLog()">+</button>
            </div>

            ${statesBarHtml}

            <div class="pz-log-entries" id="pz-log-entries">
                ${this._renderLogEntries()}
            </div>`;

        document.body.appendChild(panel);
        // Animar entrada
        requestAnimationFrame(() => panel.classList.add('pz-log-panel-open'));

        // Scroll al final
        setTimeout(() => {
            const el = document.getElementById('pz-log-entries');
            if (el) el.scrollTop = el.scrollHeight;
        }, 50);

        // Enter en el input
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

    _clearLog: function () {
        this.logEntries = [];
        const el = document.getElementById('pz-log-entries');
        if (el) el.innerHTML = this._renderLogEntries();
    },

    // ═══════════════════════════════════════════════════════
    // FASE 5 — ESTADO NAVIGATOR (drawer izquierdo)
    // ═══════════════════════════════════════════════════════
    openStateNavigator: function () {
        // Toggle
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
            const fieldCount = Object.values(s.field).filter(Boolean).length;
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
                    ${this._renderNavCounts(s)}
                </div>

                <!-- Detalle expandible -->
                <div class="pz-nav-detail" id="pz-nav-detail-${s.id}" style="display:none">
                    ${this._renderNavFieldPreview(s)}
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
    // Estructura igual al campo real: EMZ (A,B), Monstruos (C,1-5), S/T (6-10)
    const emzZones      = ['A','B'];
    const monsterZones  = ['C','1','2','3','4','5'];
    const stZones       = ['6','7','8','9','10'];
    const stOnlyZones   = ['6','7','8','9','10'];

    const buildZone = (z) => {
        const entry = s.field[z];
        if (!entry?.card) return `<div class="pz-nav-fz pz-nav-fz-empty" title="${z}">${z}</div>`;
        const img  = entry.card.card_images?.[0]?.image_url_small || this.CARD_BACK;
        const isMonster = ['1','2','3','4','5','A','B'].includes(String(z));
        let pos, posClass;
        if (isMonster) {
            if (entry.faceUp && !entry.rotation)       { pos = 'ATK'; posClass = 'pz-nav-fz-atk'; }
            else if (entry.faceUp && entry.rotation)   { pos = 'DEF'; posClass = 'pz-nav-fz-def'; }
            else                                        { pos = 'SET'; posClass = 'pz-nav-fz-set'; }
        } else {
            pos      = entry.faceUp ? 'Face-up' : 'Set';
            posClass = entry.faceUp ? 'pz-nav-fz-atk' : 'pz-nav-fz-set';
        }
        const rotation = entry.rotation ? `rotate(${entry.rotation}deg)` : '';
        return `<div class="pz-nav-fz ${posClass}" title="${entry.card.name} · ${pos}">
            <span class="pz-nav-fz-lbl">${z}</span>
            <img src="${entry.faceUp ? img : this.CARD_BACK}"
                 class="pz-nav-fz-img"
                 style="${rotation ? `transform:${rotation}` : ''}"
                 onerror="this.src='${this.CARD_BACK}'">
            <span class="pz-nav-fz-pos">${pos}</span>
        </div>`;
    };

    const emzRow      = emzZones.map(buildZone).join('');
    const monsterRow  = monsterZones.map(buildZone).join('');
    const stRow       = stOnlyZones.map(buildZone).join('');

    return `
        <div class="pz-nav-field-preview">
            <div class="pz-nav-field-row pz-nav-field-emz">${emzRow}</div>
            <div class="pz-nav-field-row">${monsterRow}</div>
            <div class="pz-nav-field-row">${stRow}</div>
        </div>
        <div class="pz-nav-extra-zones">
            <div class="pz-nav-zone-block">
                <span class="pz-nav-zone-title">✋ Mano (${s.hand.length})</span>
                <div class="pz-nav-hand-imgs">
                    ${s.hand.slice(0, 8).map(e => {
                        const img = e.card?.card_images?.[0]?.image_url_small || this.CARD_BACK;
                        return `<img src="${img}" class="pz-nav-hand-img"
                                    onerror="this.src='${this.CARD_BACK}'"
                                    title="${e.card?.name||'?'}">`;
                    }).join('')}
                    ${s.hand.length > 8 ? `<span class="pz-nav-hand-more">+${s.hand.length - 8}</span>` : ''}
                </div>
            </div>
            <div class="pz-nav-zone-block">
                <span class="pz-nav-zone-title">🪦 GY (${s.gy.length})</span>
                <div class="pz-nav-hand-imgs">
                    ${s.gy.slice(0, 6).map(e => {
                        const img = e.card?.card_images?.[0]?.image_url_small || this.CARD_BACK;
                        return `<img src="${img}" class="pz-nav-hand-img"
                                    onerror="this.src='${this.CARD_BACK}'"
                                    title="${e.card?.name||'?'}">`;
                    }).join('')}
                    ${s.gy.length > 6 ? `<span class="pz-nav-hand-more">+${s.gy.length - 6}</span>` : ''}
                </div>
            </div>
            <div class="pz-nav-zone-block">
                <span class="pz-nav-zone-title">🚀 Banish (${s.banish.length})</span>
                <div class="pz-nav-hand-imgs">
                    ${s.banish.slice(0, 6).map(e => {
                        const img = e.card?.card_images?.[0]?.image_url_small || this.CARD_BACK;
                        return `<img src="${img}" class="pz-nav-hand-img"
                                    onerror="this.src='${this.CARD_BACK}'"
                                    title="${e.card?.name||'?'}">`;
                    }).join('')}
                    ${s.banish.length > 6 ? `<span class="pz-nav-hand-more">+${s.banish.length - 6}</span>` : ''}
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

        // Confirmar
        if (!confirm(`¿Restaurar el Estado #${s.id} (T${s.turn} · ${this._phaseLabel(s.phase)})?`)) return;

        // Restaurar todo del snapshot
        this.phase      = s.phase;
        this.turnNumber = s.turn;
        this.field      = JSON.parse(JSON.stringify(s.field));
        this.hand       = JSON.parse(JSON.stringify(s.hand));
        this.main       = JSON.parse(JSON.stringify(s.main));
        this.extra      = JSON.parse(JSON.stringify(s.extra));
        this.gy         = JSON.parse(JSON.stringify(s.gy));
        this.banish     = JSON.parse(JSON.stringify(s.banish));
        this.other      = JSON.parse(JSON.stringify(s.other));

        // Actualizar barra de fases visualmente
        document.querySelectorAll('.pz-phase-btn').forEach(btn => {
            btn.classList.toggle('pz-phase-active', btn.dataset.phase === s.phase);
        });

        this._addLog(`↩ Estado #${s.id} restaurado — T${s.turn} · ${this._phaseLabel(s.phase)}`);
        this._showToast(`↩ Estado #${s.id} restaurado`);
        this._renderAllZones();
        this.openStateNavigator(); // cerrar el navigator
    },

    _deleteState: function (id) {
        this.gameStates = this.gameStates.filter(s => s.id !== id);
        const navList = document.getElementById('pz-nav-list');
        if (navList) navList.innerHTML = this._renderNavList();
        this._addLog(`Estado #${id} eliminado.`);
    },

    _clearAllStates: function () {
        if (!this.gameStates.length) return;
        if (!confirm('¿Eliminar todos los estados guardados?')) return;
        this.gameStates = [];
        const navList = document.getElementById('pz-nav-list');
        if (navList) navList.innerHTML = this._renderNavList();
    },

    // ═══════════════════════════════════════════════════════
    // FASE 5 — WIDGET FLOTANTE DE ESTADO
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

        // Attach drag after first render
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
    // BOTONES FLOTANTES CONTEXTUALES
    // ═══════════════════════════════════════════════════════
    _updateFloatingBtns: function () {
        const inSim = window.Navigation?.currentTab === 'simuladores';

        // Ajustar posición del shortcuts-float-btn para hacer hueco
        const scBtn = document.getElementById('shortcuts-float-btn');
        if (scBtn) scBtn.style.bottom = inSim ? '260px' : '';

        if (!inSim) { this._cleanupFloatBtns(); return; }

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

        // ── Marcar Estado flotante (siempre en simuladores) ──
        if (!document.getElementById('pz-float-markstate-btn')) {
            const btn = document.createElement('button');
            btn.id        = 'pz-float-markstate-btn';
            btn.className = 'pz-float-btn pz-float-btn-state';
            btn.innerHTML = '📌';
            btn.title     = 'Marcar Estado';
            btn.onclick   = () => ZonaPractica.saveGameState();
            document.body.appendChild(btn);
        }
    },

    _cleanupFloatBtns: function () {
        ['pz-float-log-btn', 'pz-float-markstate-btn','pz-float-chgpos-btn',
         'pz-chain-resolve-btn'].forEach(id => document.getElementById(id)?.remove());
        const scBtn = document.getElementById('shortcuts-float-btn');
        if (scBtn) scBtn.style.bottom = '';
    },
    // ═══════════════════════════════════════════════════════
    // TOAST NOTIFICATION
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
    // RENDER DE ZONAS
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
    el.querySelector('.pz-card-img')?.remove();
    el.querySelector('.pz-pos-badge')?.remove();
    el.querySelector('.pz-chain-badge')?.remove();
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

        // Badge de posición cuando está activo el modo cambiar posición
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
        // Re-añadir badge de cadena si corresponde
        if (entry._chainNum) {
            const existing = el.querySelector('.pz-chain-badge');
            if (!existing) {
                const badge = document.createElement('span');
                badge.className = 'pz-chain-badge';
                badge.textContent = entry._chainNum;
                el.appendChild(badge);
            }
        }
    },

    _renderZone: function (zoneName) {
        const el = document.getElementById(`pz-zone-${zoneName}`);
        if (!el) return;
        const cards = this[zoneName];
        if (!Array.isArray(cards)) return;
        el.innerHTML = '';
        if (!cards.length) return;

        const isBanish  = zoneName === 'banish';
        const isHand    = zoneName === 'hand';
        // Ocultar si el switch global o el per-zona está activo
        const isPrivate = (zoneName === 'hand'  && (this.cardsHidden || this.hiddenHand))  ||
                          (zoneName === 'main'  && (this.cardsHidden || this.hiddenMain))  ||
                          (zoneName === 'extra' && (this.cardsHidden || this.hiddenExtra));

        const maxGap = isHand ? 8 : 4;
        const minGap = isHand ? -52 : -36;
        const gap = cards.length <= 7
            ? maxGap
            : Math.max(minGap, maxGap - (cards.length - 7) * (isHand ? 9 : 6));

        cards.forEach((entry, i) => {
            if (!entry?.card) return;
            const slot = document.createElement('div');
            slot.className = 'pz-card-slot';
            if (i > 0) slot.style.marginLeft = `${gap}px`;

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
            // Re-añadir badge de cadena si corresponde
            if (entry._chainNum) {
                const badge = document.createElement('span');
                badge.className = 'pz-chain-badge';
                badge.textContent = entry._chainNum;
                slot.appendChild(badge);
            }
            el.appendChild(slot);
        });
    },

    _addLog: function (msg, card, isManual) {
        const now  = new Date();
        const time = now.toLocaleTimeString('es-ES', { hour12:false });
        const imgUrl = card?.card_images?.[0]?.image_url_small || null;
        this.logEntries.push({ msg, time, turn: this.turnNumber, imgUrl, isManual: !!isManual });
        console.info(`[PZ] T${this.turnNumber} ${time} — ${isManual ? '[Jugador A] ' : ''}${msg}`);
        // Actualizar Log en tiempo real si está abierto
        const el = document.getElementById('pz-log-entries');
        if (el) { el.innerHTML = this._renderLogEntries(); el.scrollTop = el.scrollHeight; }
        this._updateFloatingBtns();
    },

    _renderLogEntries: function () {
        if (!this.logEntries.length) {
            return '<p class="pz-log-empty">Sin entradas aún.</p>';
        }
        return this.logEntries.map((e, i) => `
            <div class="pz-log-entry ${e.msg.startsWith('---') ? 'pz-log-turn-sep' : ''}"
                 id="pz-log-entry-${i}">
                <span class="pz-log-entry-idx">${i + 1}</span>
                <span class="pz-log-entry-meta">T${e.turn}&nbsp;${e.time}</span>
                ${e.isManual ? '<span class="pz-log-player-tag">Jugador A:</span>' : ''}
                ${e.imgUrl ? `<img src="${e.imgUrl}" class="pz-log-card-thumb"
                    onerror="this.style.display='none'" title="${e.msg}">` : ''}
                <span class="pz-log-entry-msg">${e.msg}</span>
            </div>`).join('');
    }
};

window.ZonaPractica = ZonaPractica;