/* buscador.js — Búsqueda de cartas, visor de detalle y lista de favoritas */
/* Absorbe: buscador.js, cardviewer.js, favoritas.js */


// ── Buscador — búsqueda en YGOProDeck API con filtros avanzados, arquetipos y sets ──

const Buscador = {

    apiUrl: 'https://db.ygoprodeck.com/api/v7/cardinfo.php',

    searchInput: null,
    filterInput: null,
    searchBtn: null,
    clearBtn: null,
    resultsContainer: null,
    chipsContainer: null,
    filterWords: [],
    currentCards: [],
    filterPanelOpen: false,

    advancedFilters: {
    cardCategory:   '',
    attribute:      '',
    monsterType:    '',
    monsterSubtype: '',
    spellSubtype:   '',
    trapSubtype:    '',
    level:          '',
    linkval:        '',
    scale:          '',
    atk:            '',
    def:            '',
    archetype:      '',
    cardset:        '',

},
    _archetypeList: [],
    _cardsetList:   [],


FILTER_DATA: {
    attributes:       ['DARK','LIGHT','EARTH','WATER','FIRE','WIND','DIVINE'],
    monsterTypes:     ['Dragon','Warrior','Spellcaster','Zombie','Fiend','Machine','Fairy',
                       'Beast','Beast-Warrior','Winged Beast','Fish','Sea Serpent','Rock',
                       'Dinosaur','Thunder','Insect','Plant','Psychic','Reptile','Aqua',
                       'Pyro','Cyberse','Wyrm','Divine-Beast'],
    monsterSubtypes:  ['Effect','Normal','Ritual','Fusion','Synchro','XYZ','Link','Pendulum',
                       'Tuner','Flip','Gemini','Union','Spirit'],
    spellSubtypes:    ['Normal','Campo','Equipo','Continua','Juego Rápido','Ritual'],
    spellSubtypesEn:  ['Normal','Field','Equip','Continuous','Quick-Play','Ritual'],
    trapSubtypes:     ['Normal','Continua','Contraefecto'],
    trapSubtypesEn:   ['Normal','Continuous','Counter'],
    levels:           ['1','2','3','4','5','6','7','8','9','10','11','12'],
    linkvals:         ['1','2','3','4','5','6'],
    scales:           ['0','1','2','3','4','5','6','7','8','9','10','11','12','13'],
},

SUBTYPE_API_MAP: {
    'Effect':  'Effect Monster',
    'Normal':  'Normal Monster',
    'Ritual':  'Ritual Effect Monster',
    'Fusion':  'Fusion Monster',
    'Synchro': 'Synchro Monster',
    'XYZ':     'XYZ Monster',
    'Link':    'Link Monster',
    'Pendulum': null,
    'Tuner':   'Tuner Monster',
    'Flip':    'Flip Effect Monster',
    'Gemini':  'Gemini Monster',
    'Union':   'Union Effect Monster',
    'Spirit':  'Spirit Monster',
},

// ── IMAGEN LATERAL (Config > Contenido de la App) ──
    SIDEBAR_IMG_KEY: 'dd_buscador_sidebar_img',
    SIDEBAR_IMAGES: [
        'Protagonistas', 'Kaiba', 'Joe', 'Main Monsters', 'Protas', 'Antagonistas',
        'Jaiden', 'Jesse', 'Jazz', 'Playmaker', 'Borre', 'Burner', 'Revolution', 'Puppet'
    ],

    getSidebarImage: function () {
        const stored = localStorage.getItem(this.SIDEBAR_IMG_KEY);
        return this.SIDEBAR_IMAGES.includes(stored) ? stored : 'Protagonistas';
    },

    setSidebarImage: function (name) {
        if (!this.SIDEBAR_IMAGES.includes(name)) name = 'Protagonistas';
        localStorage.setItem(this.SIDEBAR_IMG_KEY, name);
        this._applySidebarImage();
    },

    _applySidebarImage: function () {
        const name = this.getSidebarImage();
        document.querySelectorAll('.buscador-cover-img, .deck-empty-mobile-img, .mideck-mobile-banner-img').forEach(el => {
            el.src = `img/${name}.webp`;
            el.alt = `Yu-Gi-Oh! ${name}`;
        });
    },

    renderSidebarImagePicker: function () {
        const current = this.getSidebarImage();
        return `
            <div id="cm-sidebarimg-wrap" class="cm-sidebarimg-row">
                ${this.SIDEBAR_IMAGES.map(name => `
                    <button class="cm-sidebarimg-thumb ${current === name ? 'cm-sidebarimg-active' : ''}"
                            onclick="Buscador.setSidebarImage('${name}'); Buscador._refreshSidebarImageUI();"
                            title="${name}">
                        <img src="img/${name}.webp" alt="${name}" loading="lazy">
                        <span>${name}</span>
                    </button>
                `).join('')}
            </div>`;
    },

    _refreshSidebarImageUI: function () {
        const wrap = document.getElementById('cm-sidebarimg-wrap');
        if (wrap) wrap.outerHTML = this.renderSidebarImagePicker();
    },
    init: function () {

        this._applySidebarImage();
        this.searchInput = document.getElementById('card-search-input');
        this.filterInput = document.getElementById('additional-filters');
        this.searchBtn = document.getElementById('search-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.resultsContainer = document.getElementById('search-results');
        this.chipsContainer = document.getElementById('filter-chips-container');

        if (!this.searchInput || !this.searchBtn || !this.clearBtn || !this.resultsContainer) {
            console.error('Buscador: Elementos no encontrados');
            return;
        }

        this.setupEvents();
        this._setupCompactBar();
    },

    setupEvents: function () {

        this.searchBtn.addEventListener('click', () => this.search());
        this.clearBtn.addEventListener('click', () => this.clear());

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.search();
        });

        if (this.filterInput) {
            this.filterInput.addEventListener('keydown', (e) => {
                if (e.key === ',' || e.key === 'Enter') {
                    e.preventDefault();
                    this.addChipFromInput();
                }
            });

            this.filterInput.addEventListener('input', (e) => {
                if (e.target.value === '' && this.filterWords.length > 0) {
                    this.autoSearch();
                }
            });
        }
    },
// ── Barra de búsqueda compacta (colapsada por defecto) ──
    _setupCompactBar: function () {
        const compactInput  = document.getElementById('compact-search-input');
        const compactSearch = document.getElementById('compact-search-btn');
        const compactClear  = document.getElementById('compact-clear-btn');
        const compactRandom = document.getElementById('compact-random-btn');
        const expandBtn     = document.getElementById('compact-expand-btn');
        const collapseBtn   = document.getElementById('buscador-collapse-btn');

        if (compactInput) {
            compactInput.addEventListener('input', () => {
                this.searchInput.value = compactInput.value;
            });
            compactInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.search();
            });
        }
        if (compactSearch) compactSearch.addEventListener('click', () => this.search());
        if (compactClear)  compactClear.addEventListener('click',  () => this.clear());
        if (compactRandom) compactRandom.addEventListener('click', () => this.randomCard());
        if (expandBtn)   expandBtn.addEventListener('click',   () => this.toggleSearchExpanded(true));
        if (collapseBtn) collapseBtn.addEventListener('click', () => this.toggleSearchExpanded(false));

        window.addEventListener('resize', () => this._positionCompactBar());
        this._syncCompactInput();
        this._syncCompactChips();
        this._positionCompactBar();
    },

    toggleSearchExpanded: function (expand) {
        const main = document.querySelector('.buscador-main');
        if (!main) return;
        const willExpand = (expand !== undefined) ? expand : !main.classList.contains('search-expanded');
        main.classList.toggle('search-expanded', willExpand);
        if (!willExpand) {
            this._syncCompactInput();
            this._syncCompactChips();
        }
        this._positionCompactBar();
    },

    _syncCompactInput: function () {
        const compactInput = document.getElementById('compact-search-input');
        if (compactInput && this.searchInput) compactInput.value = this.searchInput.value;
    },

    _syncCompactChips: function () {
        const chipsWrap = document.getElementById('compact-chips-row');
        if (!chipsWrap) return;
        chipsWrap.innerHTML = this.filterWords
            .map(w => `<span class="compact-chip">${w}</span>`)
            .join('');
    },

    _positionCompactBar: function () {
        const bar = document.getElementById('buscador-compact-bar');
        const nav = document.querySelector('.main-navigation');
        if (!bar || !nav) return;
        bar.style.top = nav.offsetHeight + 'px';
    },
    // NUEVO: Agregar chip desde el input
    addChipFromInput: function () {
        if (!this.filterInput) return;

        const value = this.filterInput.value.trim().toLowerCase();
        
        if (value && !this.filterWords.includes(value)) {
            this.filterWords.push(value);
            this.filterInput.value = '';
            this.renderChips();
            this.autoSearch();
        }
    },

    // NUEVO: Renderizar los chips visuales
    renderChips: function () {
        if (!this.chipsContainer) return;

        this.chipsContainer.innerHTML = '';

        this.filterWords.forEach((word, index) => {
            const chip = document.createElement('div');
            chip.className = 'filter-chip';
            chip.innerHTML = `
                <span class="chip-text">${word}</span>
                <span class="chip-remove" data-index="${index}">×</span>
            `;

            chip.querySelector('.chip-remove').addEventListener('click', () => {
                this.removeChip(index);
            });

            this.chipsContainer.appendChild(chip);
        });

        this._syncCompactChips();
    },

    // NUEVO: Eliminar un chip específico
    removeChip: function (index) {
        this.filterWords.splice(index, 1);
        this.renderChips();
        this.autoSearch();
    },

    autoSearch: async function () {
        if (this.filterWords.length === 0 && !this.searchInput.value.trim() && !this.hasAdvancedFilters()) {
            this.resultsContainer.innerHTML =
                '<p class="results-placeholder">Utiliza el buscador para encontrar cartas de Yu-Gi-Oh!</p>';
            return;
        }

        this.showLoading();

        try {
            let cards = [];

            const mainTerm = this.searchInput.value.trim();

            if (mainTerm) {
                // Búsqueda normal por nombre
                const url = `${this.apiUrl}?fname=${encodeURIComponent(mainTerm)}`;
                const response = await fetch(url);

                if (!response.ok) throw new Error('Error HTTP');

                const data = await response.json();
                cards = data.data || [];
            } else {
                this.showMessage('🔍 Buscando en la base de datos. Puede tardar unos segundos...');
await new Promise(resolve => setTimeout(resolve, 0));
                // Búsqueda solo por filtros
                const url = this.buildApiUrl('');
                const response = await fetch(url);

                if (!response.ok) throw new Error('Error HTTP');

                const data = await response.json();
                cards = data.data || [];
            }

            if (cards.length === 0) {
                this.showMessage('😕 No se encontraron cartas');
                return;
            }

            const filteredCards = this.applyWordFilters(this.applyAdvancedLocalFilter(cards));

            if (filteredCards.length === 0) {
                this.showMessage('😕 No coinciden los filtros');
                return;
            }

            this.displayResults(filteredCards);

        } catch (err) {
            console.error(err);
            this.showMessage('❌ Error al buscar cartas');
        }
    },

    search: async function () {

        const mainTerm = this.searchInput.value.trim();


        this.showLoading();

        try {
            let cards = [];

            if (mainTerm) {
                // Búsqueda normal por nombre
                const url = `${this.apiUrl}?fname=${encodeURIComponent(mainTerm)}`;
                const response = await fetch(url);

                if (!response.ok) throw new Error('Error HTTP');

                const data = await response.json();
                cards = data.data || [];
            } else {
                this.showMessage('🔍 Buscando en la base de datos. Puede tardar unos segundos...');
await new Promise(resolve => setTimeout(resolve, 0));
                // Búsqueda solo por filtros (obtener todas las cartas)
                const url = this.buildApiUrl('');
                const response = await fetch(url);

                if (!response.ok) throw new Error('Error HTTP');

                const data = await response.json();
                cards = data.data || [];
            }

            if (cards.length === 0) {
                this.showMessage('😕 No se encontraron cartas');
                return;
            }

            const filteredCards = this.applyWordFilters(this.applyAdvancedLocalFilter(cards));

            if (filteredCards.length === 0) {
                this.showMessage('😕 No coinciden los filtros');
                return;
            }

            this.displayResults(filteredCards);

        } catch (err) {
            console.error(err);
            this.showMessage('❌ Error al buscar cartas');
        }
    },

    applyWordFilters: function (cards) {

        if (!this.filterWords.length) return cards;

        return cards.filter(card => {

            const text = [
                card.name,
                card.type,
                (card.desc || '').replace(/\r\n|\r|\n/g, ' '),
                card.race,
                card.attribute
            ].join(' ').toLowerCase();

            return this.filterWords.every(word => text.includes(word));
        });
    },

    resultsPageSize: 100,
currentResultsPage: 0,

displayResults: function (cards) {
    this.currentCards = cards;
    this.currentResultsPage = 0;
    this._renderResultsPage();
},

_renderResultsPage: function () {
    const cards = this.currentCards;
    const PAGE_SIZE = this.resultsPageSize;
    const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));

    if (this.currentResultsPage >= totalPages) this.currentResultsPage = totalPages - 1;
    if (this.currentResultsPage < 0) this.currentResultsPage = 0;

    const start = this.currentResultsPage * PAGE_SIZE;
    const pageCards = cards.slice(start, start + PAGE_SIZE);

    let html = this._buildResultsSummary(cards);

    html += '<div class="results-grid">';
    pageCards.forEach((card, i) => {
        const index = start + i;
        const img = card.card_images?.[0]?.image_url_small || '';
        html += `
            <div class="card-item" onclick="Buscador.showCardActions(${index}, this)">
                <img src="${img}" class="card-image">
                <div class="card-name">${card.name}</div>
                <div class="card-type">${card.type}</div>
            </div>`;
    });
    html += '</div>';

    if (totalPages > 1) {
        html += '<div class="results-pagination">';
        for (let p = 0; p < totalPages; p++) {
            const from = p * PAGE_SIZE + 1;
            const to = Math.min((p + 1) * PAGE_SIZE, cards.length);
            html += `<button class="results-page-btn ${p === this.currentResultsPage ? 'results-page-active' : ''}"
                        onclick="Buscador.goToResultsPage(${p})">${from}-${to}</button>`;
        }
        html += '</div>';
    }

    this.resultsContainer.innerHTML = html;
},

goToResultsPage: function (page) {
    this.currentResultsPage = page;
    this._renderResultsPage();
    this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
},

_buildResultsSummary: function (cards) {
    const monsterCounts = {}, spellCounts = {}, trapCounts = {};

    cards.forEach(card => {
        const type = card.type || '';
        if (type.includes('Monster')) {
            const cat = this._classifyMonster(type);
            monsterCounts[cat] = (monsterCounts[cat] || 0) + 1;
        } else if (type.includes('Spell')) {
            const label = this._raceLabel('spell', card.race);
            spellCounts[label] = (spellCounts[label] || 0) + 1;
        } else if (type.includes('Trap')) {
            const label = this._raceLabel('trap', card.race);
            trapCounts[label] = (trapCounts[label] || 0) + 1;
        }
    });

    const fmt = (counts, order) => order.filter(k => counts[k]).map(k => `${k} ${counts[k]}`).join(', ');

    const parts = [];
    const monsterStr = fmt(monsterCounts, ['Normales','Efecto','Péndulo','Ritual','Fusión','Sincro','XYZ','Link']);
    if (monsterStr) parts.push(`Monstruos: ${monsterStr}`);
    const spellStr = fmt(spellCounts, ['Normal','Juego Rápido','Continua','Ritual','Equipo','Campo']);
    if (spellStr) parts.push(`Mágicas: ${spellStr}`);
    const trapStr = fmt(trapCounts, ['Normal','Continua','Contraefecto']);
    if (trapStr) parts.push(`Trampas: ${trapStr}`);

    const breakdown = parts.length ? ` (${parts.join(' · ')})` : '';
    return `<p class="results-count-summary"><b>Cartas encontradas:</b> ${cards.length}${breakdown}</p>`;
},

_classifyMonster: function (type) {
    if (type.includes('Link')) return 'Link';
    if (type.includes('XYZ')) return 'XYZ';
    if (type.includes('Synchro')) return 'Sincro';
    if (type.includes('Fusion')) return 'Fusión';
    if (type.includes('Ritual')) return 'Ritual';
    if (type.includes('Pendulum')) return 'Péndulo';
    if (type.includes('Normal')) return 'Normales';
    return 'Efecto';
},

_raceLabel: function (kind, race) {
    const en = kind === 'spell' ? this.FILTER_DATA.spellSubtypesEn : this.FILTER_DATA.trapSubtypesEn;
    const es = kind === 'spell' ? this.FILTER_DATA.spellSubtypes   : this.FILTER_DATA.trapSubtypes;
    const idx = en.indexOf(race);
    return idx >= 0 ? es[idx] : (race || 'Otro');
},

    clear: function () {

        this.searchInput.value = '';
        if (this.filterInput) this.filterInput.value = '';
        
        this.filterWords = [];
        this.renderChips();
        this.resetAdvancedFilters(true);
        
        this.resultsContainer.innerHTML =
            '<p class="results-placeholder">Utiliza el buscador para encontrar cartas de Yu-Gi-Oh!</p>';

        this.searchInput.focus();
        this._syncCompactInput();
    },
randomCard: async function () {
        this.showLoading();
        try {
            const url = this.buildApiUrl('');
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error HTTP');
            const data = await response.json();
            let cards = data.data || [];

            cards = this.applyWordFilters(this.applyAdvancedLocalFilter(cards));

            if (cards.length === 0) {
                this.showMessage('😕 No hay cartas que cumplan los filtros actuales');
                return;
            }

            const picked = cards[Math.floor(Math.random() * cards.length)];
            this.displayResults([picked]);

            const notice = document.createElement('p');
            notice.className = 'results-cap-notice';
            notice.textContent = `🎲 Carta aleatoria de un pool de ${cards.length} cartas.`;
            this.resultsContainer.appendChild(notice);

        } catch (err) {
            console.error(err);
            this.showMessage('❌ Error al obtener carta aleatoria');
        }
    },
    showLoading: function () {
        this.resultsContainer.innerHTML =
            '<p class="results-placeholder">⏳ Buscando...</p>';
    },

    showMessage: function (msg) {
        this.resultsContainer.innerHTML =
            `<p class="results-placeholder">${msg}</p>`;
    },
    showCardActions: function(index, element) {
        this.removeCardActions();
        
        // Crear overlay con botones
        const overlay = document.createElement('div');
        overlay.className = 'card-actions-overlay';
        overlay.innerHTML = `
            <button class="card-action-btn btn-view" onclick="Buscador.viewCard(${index}); event.stopPropagation();">Ver</button>
            <button class="card-action-btn btn-add" onclick="Buscador.addCard(${index}); event.stopPropagation();">Añadir</button>
        `;
        
        element.appendChild(overlay);
        element.classList.add('card-item-active');
    },

    removeCardActions: function() {
        const activeItems = document.querySelectorAll('.card-item-active');
        activeItems.forEach(item => {
            const overlay = item.querySelector('.card-actions-overlay');
            if (overlay) overlay.remove();
            item.classList.remove('card-item-active');
        });
    },

    viewCard: function(index) {
        this.removeCardActions();
        CardViewer.openFromIndex(index);
    },

    addCard: function(index) {
        this.removeCardActions();
        const card = this.currentCards[index];
        if (window.Deck && card) {
            const currentQty = Deck.cards[card.id] ? Deck.cards[card.id].qty : 0;
            Deck.syncFromViewer(card.id, card, currentQty + 1);
        }
    },
    // ── FILTROS AVANZADOS ──────────────────────────────────────────

toggleFilterPanel: function() {
    this.filterPanelOpen = !this.filterPanelOpen;
    const panel = document.getElementById('advanced-filters-panel');
    const arrow = document.getElementById('adv-filters-arrow');
    if (!panel) return;
    panel.style.display = this.filterPanelOpen ? 'block' : 'none';
    if (arrow) arrow.textContent = this.filterPanelOpen ? '▲' : '▼';
    if (this.filterPanelOpen) this.renderFilterPanel();
},

renderFilterPanel: function() {
    const panel = document.getElementById('advanced-filters-panel');
    if (!panel) return;
    const f  = this.advancedFilters;
    const fd = this.FILTER_DATA;

    const chip = (val, key, current, label) => {
        const active = current === val ? ' adv-chip-active' : '';
        return `<span class="adv-chip${active}" onclick="Buscador.setFilter('${key}','${val}')">${label || val}</span>`;
    };

    let html = `<div class="adv-row">
        <span class="adv-label">Tipo de carta</span>
        <div class="adv-chips">
            ${chip('monster','cardCategory',f.cardCategory,'Monstruo')}
            ${chip('spell','cardCategory',f.cardCategory,'Mágica')}
            ${chip('trap','cardCategory',f.cardCategory,'Trampa')}
        </div>
    </div>`;

    if (f.cardCategory === 'monster') {
        html += `<div class="adv-row">
            <span class="adv-label">Atributo</span>
            <div class="adv-chips">${fd.attributes.map(a => chip(a,'attribute',f.attribute)).join('')}</div>
        </div>`;

        html += `<div class="adv-row">
            <span class="adv-label">Subtipo</span>
            <div class="adv-chips">${fd.monsterSubtypes.map(s => chip(s,'monsterSubtype',f.monsterSubtype)).join('')}</div>
        </div>`;

        html += `<div class="adv-row">
            <span class="adv-label">Tipo monstruo</span>
            <div class="adv-chips adv-chips-wrap">${fd.monsterTypes.map(t => chip(t,'monsterType',f.monsterType)).join('')}</div>
        </div>`;

        const isLink     = f.monsterSubtype === 'Link';
        const isPendulum = f.monsterSubtype === 'Pendulum';
        const isXYZ      = f.monsterSubtype === 'XYZ';

        if (!isLink) {
            const levelLabel = isXYZ ? 'Rango' : 'Nivel';
            html += `<div class="adv-row">
                <span class="adv-label">${levelLabel}</span>
                <div class="adv-chips">${fd.levels.map(l => chip(l,'level',f.level)).join('')}</div>
            </div>`;
        }

        if (isLink) {
            html += `<div class="adv-row">
                <span class="adv-label">Rating Link</span>
                <div class="adv-chips">${fd.linkvals.map(l => chip(l,'linkval',f.linkval)).join('')}</div>
            </div>`;
        }

        if (isPendulum) {
            html += `<div class="adv-row">
                <span class="adv-label">Escala</span>
                <div class="adv-chips">${fd.scales.map(s => chip(s,'scale',f.scale)).join('')}</div>
            </div>`;
        }

        html += `<div class="adv-row adv-row-inputs">
            <div class="adv-input-group">
                <span class="adv-label">ATK</span>
                <input type="number" class="adv-input" placeholder="ej: 2500"
                    value="${f.atk}" min="0" max="99999"
                    onchange="Buscador.setFilter('atk', this.value)">
            </div>
            <div class="adv-input-group">
                <span class="adv-label">DEF</span>
                <input type="number" class="adv-input" placeholder="ej: 2000"
                    value="${f.def}" min="0" max="99999"
                    onchange="Buscador.setFilter('def', this.value)">
            </div>
        </div>`;

    } else if (f.cardCategory === 'spell') {
        html += `<div class="adv-row">
            <span class="adv-label">Tipo mágica</span>
            <div class="adv-chips">${fd.spellSubtypes.map((s,i) =>
                chip(fd.spellSubtypesEn[i],'spellSubtype',f.spellSubtype,s)).join('')}
            </div>
        </div>`;

    } else if (f.cardCategory === 'trap') {
        html += `<div class="adv-row">
            <span class="adv-label">Tipo trampa</span>
            <div class="adv-chips">${fd.trapSubtypes.map((s,i) =>
                chip(fd.trapSubtypesEn[i],'trapSubtype',f.trapSubtype,s)).join('')}
            </div>
        </div>`;
    }

    panel.innerHTML = html;
},

setFilter: function(key, value) {
    if (this.advancedFilters[key] === value) {
        this.advancedFilters[key] = '';
    } else {
        this.advancedFilters[key] = value;
        if (key === 'cardCategory') {
            Object.assign(this.advancedFilters, {
                attribute:'', monsterType:'', monsterSubtype:'',
                spellSubtype:'', trapSubtype:'', level:'', linkval:'', scale:'', atk:'', def:''
            });
        }
        if (key === 'monsterSubtype') {
            Object.assign(this.advancedFilters, { level:'', linkval:'', scale:'' });
        }
    }
    this._updateFilterSummary();
    this.renderFilterPanel();
    this.autoSearch();
},

_updateFilterSummary: function() {
    const f = this.advancedFilters;
    const parts = [];
    if (f.cardCategory)   parts.push(f.cardCategory === 'monster' ? 'Monstruo' : f.cardCategory === 'spell' ? 'Mágica' : 'Trampa');
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
    if (f.archetype)      parts.push(`⚔ ${f.archetype}`);
    if (f.cardset)        parts.push(`📦 ${f.cardset}`);
    const summary  = document.getElementById('adv-filters-summary');
    const resetBtn = document.getElementById('adv-reset-btn');
    if (summary)  summary.textContent = parts.length ? parts.join(' · ') : '';
    if (resetBtn) resetBtn.style.display = parts.length ? 'inline-block' : 'none';
},

hasAdvancedFilters: function() {
    const f = this.advancedFilters;
    return !!(f.cardCategory || f.attribute || f.monsterType || f.monsterSubtype ||
              f.spellSubtype || f.trapSubtype || f.level || f.linkval || f.scale ||
              f.atk || f.def || f.archetype || f.cardset);
},

buildApiUrl: function(mainTerm) {
    const f      = this.advancedFilters;
    const params = new URLSearchParams();

    if (mainTerm) params.set('fname', mainTerm);

    if (f.cardCategory === 'monster') {
        const sub = f.monsterSubtype;
        if (sub && sub !== 'Pendulum') {
            const mapped = this.SUBTYPE_API_MAP[sub];
            if (mapped) params.set('type', mapped);
        }
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
if (f.archetype) params.set('archetype', f.archetype);
if (f.cardset)   params.set('cardset',   f.cardset);
    const qs = params.toString();
    return qs ? `${this.apiUrl}?${qs}` : this.apiUrl;
},

// En buscador.js — reemplazar applyAdvancedLocalFilter completo:

applyAdvancedLocalFilter: function(cards) {
    const f = this.advancedFilters;
    if (!this.hasAdvancedFilters()) return cards;

    return cards.filter(card => {
        const type      = (card.type      || '').toLowerCase();
        const race      = (card.race      || '').toLowerCase();
        const attribute = (card.attribute || '').toUpperCase();

        if (f.cardCategory === 'monster' && !type.includes('monster'))    return false;
        if (f.cardCategory === 'spell'   && !type.includes('spell card')) return false;
        if (f.cardCategory === 'trap'    && !type.includes('trap card'))  return false;

        if (f.cardCategory === 'monster') {

            if (f.attribute && attribute !== f.attribute.toUpperCase()) return false;

            if (f.monsterType && race !== f.monsterType.toLowerCase()) return false;

            if (f.monsterSubtype) {
                const sub = f.monsterSubtype.toLowerCase();
                if (sub === 'pendulum' && !type.includes('pendulum'))   return false;
                if (sub === 'tuner'    && !type.includes('tuner'))      return false;
                if (sub === 'flip'     && !type.includes('flip'))       return false;
                if (sub === 'gemini'   && !type.includes('gemini'))     return false;
                if (sub === 'union'    && !type.includes('union'))      return false;
                if (sub === 'spirit'   && !type.includes('spirit'))     return false;
                if (sub === 'fusion'   && !type.includes('fusion'))     return false;
                if (sub === 'synchro'  && !type.includes('synchro'))    return false;
                if (sub === 'xyz'      && !type.includes('xyz'))        return false;
                if (sub === 'link'     && !type.includes('link'))       return false;
                if (sub === 'ritual'   && !type.includes('ritual'))     return false;
                if (sub === 'normal'   && !type.includes('normal monster')) return false;
                if (sub === 'effect'   && !type.includes('effect monster') && !type.includes('flip effect') && !type.includes('pendulum effect')) return false;
            }

            if (f.level) {
                const lvl = parseInt(f.level);
                if ((card.level || card.rank) !== lvl) return false;
            }

            if (f.linkval) {
                if (card.linkval !== parseInt(f.linkval)) return false;
            }

            if (f.scale) {
                if (card.scale !== parseInt(f.scale)) return false;
            }

            if (f.atk !== '' && f.atk !== null && f.atk !== undefined) {
                if (card.atk !== parseInt(f.atk)) return false;
            }

            if (f.def !== '' && f.def !== null && f.def !== undefined) {
                if (card.def !== parseInt(f.def)) return false;
            }
        }

        if (f.cardCategory === 'spell' && f.spellSubtype) {
            if (race !== f.spellSubtype.toLowerCase()) return false;
        }

        if (f.cardCategory === 'trap' && f.trapSubtype) {
            if (race !== f.trapSubtype.toLowerCase()) return false;
        }

        return true;
    });
},
_loadArchetypes: async function () {
    if (this._archetypeList.length) return;
    try {
        const res  = await fetch('https://db.ygoprodeck.com/api/v7/archetypes.php');
        const data = await res.json();
        this._archetypeList = (data || []).map(a => a.archetype_name).sort();
        const sel = document.getElementById('buscador-archetype-sel');
        if (sel) this._populateArchetypeSel(sel);
    } catch (_) {}
},

_populateArchetypeSel: function (sel) {
    while (sel.options.length > 1) sel.remove(1);
    this._archetypeList.forEach(name => {
        const opt     = document.createElement('option');
        opt.value     = name;
        opt.textContent = name;
        if (name === this.advancedFilters.archetype) opt.selected = true;
        sel.appendChild(opt);
    });
},
_loadCardsets: async function () {
    if (this._cardsetList.length) return;
    try {
        const res  = await fetch('https://db.ygoprodeck.com/api/v7/cardsets.php');
        const data = await res.json();
        this._cardsetList = (data || [])
            .filter(s => s.tcg_date)
            .sort((a, b) => b.tcg_date.localeCompare(a.tcg_date));
        const sel = document.getElementById('buscador-set-sel');
        if (sel) this._populateCardsetSel(sel);
    } catch (_) {}
},

_populateCardsetSel: function (sel) {
    while (sel.options.length > 1) sel.remove(1);
    this._cardsetList.forEach(s => {
        const year = s.tcg_date ? s.tcg_date.substring(0, 4) : '';
        const opt  = document.createElement('option');
        opt.value  = s.set_name;
        opt.textContent = year ? `${s.set_name} (${year})` : s.set_name;
        if (s.set_name === this.advancedFilters.cardset) opt.selected = true;
        sel.appendChild(opt);
    });
},

resetAdvancedFilters: function(skipSearch) {
    Object.assign(this.advancedFilters, {
        cardCategory:'', attribute:'', monsterType:'', monsterSubtype:'',
        spellSubtype:'', trapSubtype:'', level:'', linkval:'', scale:'', atk:'', def:'',
        archetype: '',
        cardset:   ''
    });
    const arcSel = document.getElementById('buscador-archetype-sel');
    if (arcSel) arcSel.value = '';
    const setSel = document.getElementById('buscador-set-sel');
    if (setSel) setSel.value = '';
    this._updateFilterSummary();
    if (this.filterPanelOpen) this.renderFilterPanel();
    this.autoSearch();
    if (!skipSearch) this.autoSearch();
},
    
};

document.addEventListener('DOMContentLoaded', () => Buscador.init());
window.Buscador = Buscador;



// ── CardViewer — panel overlay de detalle de carta: imagen, efecto, roles, aporte al deck, acciones ──

const CardViewer = {
    quantities: {},

    _imgQuality: localStorage.getItem('yugioh_img_quality') || 'low',

    setImgQuality(q) {
        this._imgQuality = q;
        localStorage.setItem('yugioh_img_quality', q);
    },
// Abre el visor a partir de un NOMBRE de carta (no requiere que esté ya
    // en resultados del Buscador). Usado por los links interactivos dentro
    // de las lecciones de Formación para mostrar cartas de ejemplo al vuelo.
    openByName(name) {
        let toast = document.getElementById('cv-loading-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cv-loading-toast';
            toast.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);'
                + 'background:rgba(0,0,0,0.85);color:var(--gold-color,#FFD700);padding:8px 16px;'
                + 'border-radius:8px;font-size:0.85rem;z-index:10000;pointer-events:none;';
            document.body.appendChild(toast);
        }
        toast.textContent = `⏳ Buscando "${name}"...`;
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}&misc=yes`)
            .then(r => r.json())
            .then(json => {
                toast.remove();
                const card = json.data?.[0];
                if (!card) { alert(`No se encontró la carta "${name}".`); return; }
                this.open(card);
            })
            .catch(() => { toast.remove(); alert('Error de red al buscar la carta.'); });
    },
    open(card) {
        this._loreData = null;
        console.log('🔍 [CardViewer] Abriendo carta:', card.name, 'ID:', card.id);
        
        const quantity = this.quantities[card.id] || 0;
        console.log('📊 [CardViewer] Cantidad actual en quantities:', quantity);

        const images = card.card_images || [];
        const quality = CardViewer._imgQuality;
        const mainImg = quality === 'hd'
            ? (images[0]?.image_url || '')
            : (images[0]?.image_url_small || images[0]?.image_url || '');

        const thumbsHtml = images.map(img =>
            `<img src="${img.image_url_small}" class="cv-thumb">`
        ).join('');

        const isMonster = (card.type || '').includes('Monster');

const statsHtml = card.atk !== undefined ? `
    <p><b>Nivel:</b> ${card.level || '-'}</p>
    <p><b>Atributo:</b> ${card.attribute || '-'}</p>
    <p><b>Tipo:</b> ${isMonster ? (card.race || '-') : '—'}</p>
    <p><b>ATK:</b> ${card.atk}</p>
    <p><b>DEF:</b> ${card.def}</p>
    <p><b>Arquetipo:</b> ${card.archetype
        ? `<a href="#" class="cv-archetype-link" onclick="CardViewer.openArchetypeInBuscador('${card.archetype.replace(/'/g,"\\'")}'); return false;">${card.archetype}</a>`
        : '—'}</p>
` : '';

        const ban = card.banlist_info || {};

        const showNomenclature = !window.ContentManager || ContentManager.isVisible('cv-nomenclature');
        const highlightedDesc  = showNomenclature
            ? this.highlightNomenclature(card.desc)
            : (card.desc || '');

const html = `
    <div id="cv-overlay" class="cv-overlay">
        <div id="cv-modal" class="cv-modal">

            <button id="cv-close" class="cv-close-btn">✕</button>

            <div class="cv-name">${card.name}</div>

            <img id="cv-main-img" src="${mainImg}" class="cv-main-img">

            <div id="cv-quality-switch" class="cv-quality-switch">
                <span class="cv-quality-label">HD</span>
                <label class="cv-quality-toggle" title="Cambiar calidad de imagen">
                    <input type="checkbox" id="cv-quality-check" ${quality === 'low' ? 'checked' : ''}>
                    <span class="cv-quality-slider"></span>
                </label>
                <span class="cv-quality-label">Low</span>
            </div>

            <div id="cv-thumbs" class="cv-thumbs">${thumbsHtml}</div>
            <div id="cv-ban-btns" class="cv-ban-area"></div>

            <hr class="cv-hr">

            <div class="cv-stats-block">
                <p><b>Carta:</b> ${card.type}</p>
                ${statsHtml}
            </div>

            <div class="cv-desc-block">${highlightedDesc}</div>

            <hr class="cv-hr">

            <div class="cv-qty-block">
                <span class="cv-qty-label">Cantidad en Deck:</span>
                <div class="cv-qty-controls">
                    <button id="cv-minus" class="cv-qty-btn">◀</button>
                    <span id="cv-count" class="cv-qty-count">${quantity}</span>
                    <button id="cv-plus" class="cv-qty-btn">▶</button>
                </div>
            </div>

            ${(!window.ContentManager || ContentManager.isVisible('cv-contribution') || ContentManager.isVisible('cv-roles'))
                ? this.renderCardContribution(card) : ''}

            <hr class="cv-hr">

            <div class="cv-release-block">
                <p><b>Lanzamiento TCG:</b> <span id="cv-tcg-date">Cargando...</span></p>
                <p><b>Lanzamiento OCG:</b> <span id="cv-ocg-date">Cargando...</span></p>
                <p id="cv-availability-row" style="display:none"><b>Disponible en:</b> <span id="cv-availability"></span></p>
            </div>

            <div id="cv-lore-btn-wrap" class="cv-lore-btn-wrap">
            </div>

            <hr class="cv-hr">

            <div class="cv-sets-block">
            <hr class="cv-hr">

            <div class="cv-sets-block">
                <span class="cv-sets-label">📦 Pack / Set</span>
                <div id="cv-sets-list" class="cv-sets-list">Cargando...</div>
                <span class="cv-card-id">ID: ${card.id}</span>
            </div>

            <hr class="cv-hr">

            <div class="cv-action-row">
                <button id="cv-open-image" class="cv-action-btn">🖼 Ver HD</button>
                <button id="cv-staple-btn" class="cv-action-btn"></button>
                <button id="cv-fav-btn" class="cv-action-btn"></button>
            </div>

        </div>
    </div>
`;

        document.body.insertAdjacentHTML('beforeend', html);

        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${card.id}&misc=yes`)
            .then(r => r.json())
            .then(data => {
                const info = data?.data?.[0];
                const misc = info?.misc_info?.[0] || {};

                const sets = info?.card_sets;
                const el   = document.getElementById('cv-sets-list');
                if (el) {
                    if (!sets?.length) { el.textContent = 'No disponible'; }
                    else {
                        const unique = [...new Map(sets.map(s => [s.set_name, s])).values()];
                        el.innerHTML = unique.map(s => {
                            const year = s.set_release_date ? s.set_release_date.substring(0,4) : '';
                            return `<span onclick="CardViewer.openSetInBuscador('${s.set_name.replace(/'/g,"\\'")}'); return false;" style="display:inline-block;background:rgba(0,51,102,0.5);border:1px solid rgba(255,215,0,0.2);border-radius:4px;padding:2px 7px;margin:2px 3px 2px 0;font-size:0.75rem;cursor:pointer;transition:border-color 0.15s;" onmouseover="this.style.borderColor='rgba(255,215,0,0.6)'" onmouseout="this.style.borderColor='rgba(255,215,0,0.2)'">${s.set_name}${year ? ` (${year})` : ''}</span>`;
                        }).join('');
                    }
                }

                const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : 'No disponible';
                const tcgEl = document.getElementById('cv-tcg-date');
                const ocgEl = document.getElementById('cv-ocg-date');
                if (tcgEl) tcgEl.textContent = fmtDate(misc.tcg_date);
                if (ocgEl) ocgEl.textContent = fmtDate(misc.ocg_date);

                const formats = (misc.formats || []).map(f => f.toLowerCase());
                const availability = [];
                if (formats.includes('master duel')) availability.push('Master Duel');
                if (formats.includes('duel links'))   availability.push('Duel Links');

                const availRow = document.getElementById('cv-availability-row');
                const availEl  = document.getElementById('cv-availability');
                if (availRow && availEl && availability.length) {
                    availEl.textContent = availability.join(' / ');
                    availRow.style.display = '';
                }
            })
            .catch(() => {
                const el = document.getElementById('cv-sets-list');
                if (el) el.textContent = 'No disponible';
                const tcgEl = document.getElementById('cv-tcg-date');
                const ocgEl = document.getElementById('cv-ocg-date');
                if (tcgEl) tcgEl.textContent = 'No disponible';
                if (ocgEl) ocgEl.textContent = 'No disponible';
            });

        CardViewer._loadLore(card);

        const overlay = document.getElementById('cv-overlay');
        const close = document.getElementById('cv-close');

        close.onclick = () => { overlay.remove(); document.getElementById('cv-lore-overlay')?.remove(); };
        overlay.onclick = (e) => {
            if (e.target === overlay) { overlay.remove(); document.getElementById('cv-lore-overlay')?.remove(); }
        };

        const thumbs = document.querySelectorAll('.cv-thumb');
        const mainImage = document.getElementById('cv-main-img');
        let cvCurrentImageIndex = 0;

        const cvRenderMainImage = () => {
            const img = images[cvCurrentImageIndex] || images[0];
            if (!img) return;
            mainImage.src = CardViewer._imgQuality === 'hd'
                ? (img.image_url || '')
                : (img.image_url_small || img.image_url || '');
        };

        thumbs.forEach((t, index) => {
            t.onclick = () => {
                cvCurrentImageIndex = index;
                cvRenderMainImage();
            };
        });

        const qualityCheck = document.getElementById('cv-quality-check');
        if (qualityCheck) {
            qualityCheck.onchange = () => {
                CardViewer.setImgQuality(qualityCheck.checked ? 'low' : 'hd');
                cvRenderMainImage();
            };
        }

        const plus = document.getElementById('cv-plus');
        const minus = document.getElementById('cv-minus');
        const count = document.getElementById('cv-count');

        plus.onclick = () => {
            console.log('➕ [CardViewer] Click en botón PLUS');
            
            if (!window.Deck) {
                console.error('❌ [CardViewer] ERROR: window.Deck no existe');
                alert('ERROR: El módulo Deck no está cargado. Verifica que deck.js esté incluido en index.html');
                return;
            }
            
            if (typeof Deck.syncFromViewer !== 'function') {
                console.error('❌ [CardViewer] ERROR: Deck.syncFromViewer no es una función');
                alert('ERROR: Deck.syncFromViewer no está implementado. Verifica deck.js');
                return;
            }
            
            this.quantities[card.id] = (this.quantities[card.id] || 0) + 1;
            const newQty = this.quantities[card.id];
            
            console.log('📈 [CardViewer] Nueva cantidad:', newQty);
            
            count.textContent = newQty;
            
            console.log('🔄 [CardViewer] Llamando a Deck.syncFromViewer...');
            console.log('   ID:', card.id);
            console.log('   Card:', card.name);
            console.log('   Qty:', newQty);
            
            try {
                Deck.syncFromViewer(card.id, card, newQty);
                console.log('✅ [CardViewer] Deck.syncFromViewer ejecutado correctamente');
            } catch (error) {
                console.error('❌ [CardViewer] ERROR al ejecutar Deck.syncFromViewer:', error);
                alert('ERROR: ' + error.message);
            }
        };

        minus.onclick = () => {
            console.log('➖ [CardViewer] Click en botón MINUS');
            
            if (!window.Deck) {
                console.error('❌ [CardViewer] ERROR: window.Deck no existe');
                alert('ERROR: El módulo Deck no está cargado');
                return;
            }
            
            if (typeof Deck.syncFromViewer !== 'function') {
                console.error('❌ [CardViewer] ERROR: Deck.syncFromViewer no es una función');
                alert('ERROR: Deck.syncFromViewer no está implementado');
                return;
            }
            
            this.quantities[card.id] = Math.max(0, (this.quantities[card.id] || 0) - 1);
            const newQty = this.quantities[card.id];
            
            console.log('📉 [CardViewer] Nueva cantidad:', newQty);
            
            count.textContent = newQty;
            
            console.log('🔄 [CardViewer] Llamando a Deck.syncFromViewer...');
            
            try {
                Deck.syncFromViewer(card.id, card, newQty);
                console.log('✅ [CardViewer] Deck.syncFromViewer ejecutado correctamente');
            } catch (error) {
                console.error('❌ [CardViewer] ERROR al ejecutar Deck.syncFromViewer:', error);
                alert('ERROR: ' + error.message);
            }
        };

        // Botón: Ver Imagen HD en nueva pestaña
        const openImageBtn = document.getElementById('cv-open-image');
        openImageBtn.onclick = () => {
            const imgUrl = mainImage.src;
            window.open(imgUrl, '_blank');
        };

        // Botón: Volver Staple
        const stapleBtn = document.getElementById('cv-staple-btn');
        if (window.ContentManager && !ContentManager.isVisible('cv-staple-btn')) {
    stapleBtn.style.display = 'none';
}
        const isStaple  = () => window.ConfigManager?.isStaple?.(card.id);
        const updateStapleBtn = () => {
            stapleBtn.textContent      = isStaple() ? '⭐ Es Staple' : '☆ Volver Staple';
            stapleBtn.style.background = isStaple() ? '#FFD700' : '#4a4a4a';
            stapleBtn.style.color      = isStaple() ? '#000'    : '#fff';
        };
        updateStapleBtn();
        stapleBtn.onclick = () => {
            if (!window.ConfigManager) return;
            if (isStaple()) {
                ConfigManager.deleteStaple(card.id);
            } else {
                ConfigManager.createStaple(card.id, {
                    name:     card.name,
                    type:     card.type,
                    imageUrl: card.card_images?.[0]?.image_url_small || ''
                });
            }
            updateStapleBtn();
            
        };
            ConfigManager.renderStaplesPanel();


        // Botón: Marcar / desmarcar Favorita
        const favBtn    = document.getElementById('cv-fav-btn');
        const isFav     = () => window.Favoritas?.has(card.id);
        const updateFav = () => {
            favBtn.textContent      = isFav() ? '★ Favorita' : '☆ Favorita';
            favBtn.style.background = isFav() ? '#FFD700' : '';
            favBtn.style.color      = isFav() ? '#000'    : '';
        };
        updateFav();
        favBtn.onclick = () => {
            if (window.Favoritas) {
                Favoritas.toggle(card);
                updateFav();
            }
        };
// ── Botones de Banlist / Genesys ────────────────────────────
const banContainer = document.getElementById('cv-ban-btns');
if (banContainer && window.Banlist) {
    const data          = Banlist.getData();
    const genesysActive = data.activeFormats.some(f => data.formats[f]?.isGenesys);

    if (genesysActive) {
        // ── Modo Genesys: contador de puntos ────────────────
        const genFmtName = Banlist.getGenesysFormatName();

        const renderGPts = () => {
            const pts = Banlist.getCardPoints(card.id);
            banContainer.innerHTML = `
                <div style="font-size:0.7rem;color:rgba(255,255,255,0.35);width:100%;margin-bottom:5px;">
                    ⚙ Genesys — Puntos de costo
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <button onclick="(()=>{const i=document.getElementById('cv-gpts');i.value=Math.max(0,(parseInt(i.value)||0)-1);})()"
                            style="width:30px;height:30px;background:rgba(255,255,255,0.1);
                                   border:1px solid rgba(255,255,255,0.2);color:#fff;
                                   border-radius:5px;cursor:pointer;font-size:1.1rem;line-height:1;">−</button>
                    <input id="cv-gpts" type="number" min="0" value="${pts}"
                           style="width:64px;text-align:center;background:rgba(255,255,255,0.08);
                                  border:1px solid rgba(255,255,255,0.2);color:#fff;
                                  border-radius:5px;padding:5px;font-size:0.95rem;">
                    <button onclick="(()=>{const i=document.getElementById('cv-gpts');i.value=(parseInt(i.value)||0)+1;})()"
                            style="width:30px;height:30px;background:rgba(255,255,255,0.1);
                                   border:1px solid rgba(255,255,255,0.2);color:#fff;
                                   border-radius:5px;cursor:pointer;font-size:1.1rem;line-height:1;">＋</button>
                    <button onclick="window._cvSaveGPts()"
                            style="padding:5px 14px;background:#0066cc;border:none;
                                   color:#fff;border-radius:5px;cursor:pointer;font-size:0.82rem;">
                        Guardar
                    </button>
                    <span id="cv-gpts-saved" style="font-size:0.72rem;color:#00b894;display:none;">✓ Guardado</span>
                </div>`;
        };

        window._cvSaveGPts = () => {
            const inp = document.getElementById('cv-gpts');
            if (!inp) return;
            const pts = Math.max(0, parseInt(inp.value) || 0);
            Banlist.setCardPoints(genFmtName, card.id,
                { name: card.name, img: card.card_images?.[0]?.image_url_small || '' }, pts);
            const listEl  = document.getElementById(`banlist-cards-${genFmtName}`);
            if (listEl) listEl.innerHTML = Banlist.renderFormatList(genFmtName);
            const countEl = document.getElementById(`ban-count-${genFmtName}`);
            if (countEl) {
                const d = Banlist.getData();
                countEl.textContent = Object.keys(d.formats[genFmtName]?.cards || {}).length + ' cartas';
            }
            const saved = document.getElementById('cv-gpts-saved');
            if (saved) { saved.style.display = 'inline'; setTimeout(() => { saved.style.display = 'none'; }, 1800); }
        };

        renderGPts();

    } else {
        // ── Modo normal: botones de ban status ──────────────
        const BAN_BTNS = [
            { label: 'Free',       status: 'free',         activeColor: '#dfe6e9', activeText: '#000' },
            { label: 'Semi-Limit', status: 'semi-limited', activeColor: '#fdcb6e', activeText: '#000' },
            { label: 'Limit',      status: 'limited',      activeColor: '#e17055', activeText: '#fff' },
            { label: 'Ban',        status: 'forbidden',    activeColor: '#d63031', activeText: '#fff' },
        ];

        const activeFormats  = Banlist.getActiveFormats();
        const writeFormat    = activeFormats[0] || 'TCG';

        const renderBanBtns = () => {
            const current = Banlist.getEffectiveBanStatus(card.id);
            banContainer.innerHTML = `
                <div style="font-size:0.7rem;color:rgba(255,255,255,0.35);width:100%;margin-bottom:3px;">
                    Banlist: ${writeFormat}
                </div>
                ${BAN_BTNS.map(b => {
                    const isActive = b.status === current;
                    const bg    = isActive ? b.activeColor : 'rgba(255,255,255,0.08)';
                    const color = isActive ? b.activeText  : '#aaa';
                    const border = isActive ? b.activeColor : 'rgba(255,255,255,0.2)';
                    return `<button
                        class="cv-ban-btn"
                        data-status="${b.status}"
                        style="background:${bg};color:${color};border:1px solid ${border};
                               padding:4px 10px;border-radius:5px;cursor:pointer;font-size:0.78rem;">
                        ${b.label}
                    </button>`;
                }).join('')}`;

            banContainer.querySelectorAll('.cv-ban-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const status = btn.dataset.status;
                    const meta   = { name: card.name, img: card.card_images?.[0]?.image_url_small || '' };
                    Banlist.setCardStatus(writeFormat, card.id, meta, status);
                    const listEl  = document.getElementById(`banlist-cards-${writeFormat}`);
                    if (listEl) listEl.innerHTML = Banlist.renderFormatList(writeFormat);
                    const countEl = document.getElementById(`ban-count-${writeFormat}`);
                    if (countEl) {
                        const d = Banlist.getData();
                        countEl.textContent = Object.keys(d.formats[writeFormat]?.cards || {}).length + ' cartas';
                    }
                    renderBanBtns();
                });
            });
        };

        renderBanBtns();
    }
}
    },
    generateCardDecklistHTML2Canvas: async function(card) {
        try {
            if (typeof html2canvas === 'undefined') {
                alert('⚠️ html2canvas no está cargado.\n\nVerifica que esté en index.html');
                return;
            }

            console.log('📸 [CardViewer] Generando decklist con html2canvas');

            // Obtener URL de imagen
            const imgUrl = card.card_images[0].image_url || card.card_images[0].image_url_small;

            // Crear HTML temporal
            const html = `
                <div style="font-family: Arial, sans-serif; background: white; padding: 30px; text-align: center; display: inline-block;">
                    <img src="${imgUrl}" 
                         style="max-width: 400px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"
                         crossorigin="anonymous">
                    <div style="margin-top: 20px; font-size: 24px; font-weight: bold; color: #333;">
                        ${card.name}
                    </div>
                </div>
            `;

            // Crear contenedor temporal
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            tempContainer.style.cssText = 'position:absolute;left:-9999px;top:0;';
            document.body.appendChild(tempContainer);

            await new Promise(resolve => setTimeout(resolve, 500));

            // Generar canvas con html2canvas
            const canvas = await html2canvas(tempContainer.firstElementChild, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_card.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                document.body.removeChild(tempContainer);
                console.log('✅ [CardViewer] Descarga completada');
            });

        } catch (error) {
            console.error('❌ [CardViewer] Error:', error);
            alert('Error al generar la imagen. Intenta con "Ver Imagen HD"');
        }
    },

    generateCardDecklistCanvas: async function(card) {
        try {
            console.log('📸 [CardViewer] Método Canvas manual');
            
            const imgUrl = card.card_images[0].image_url;
            
            // Cargar imagen sin CORS
            const img = new Image();
            img.src = imgUrl;
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            
            const padding = 40;
            const nameHeight = 80;
            const canvas = document.createElement('canvas');
            canvas.width = img.width + (padding * 2);
            canvas.height = img.height + nameHeight + (padding * 2);
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, padding, padding);
            
            ctx.fillStyle = '#333';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(card.name, canvas.width / 2, padding + img.height + 40);
            
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = card.name.replace(/[^a-z0-9]/gi, '_') + '_card.png';
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (error) {
            console.error('❌ Error:', error);
            this.generateCardDecklistFallback(card);
        }
    },

    // Método 3: Fallback - descarga directa
    generateCardDecklistFallback: function(card) {
        const imgUrl = card.card_images[0].image_url;
        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = card.name.replace(/[^a-z0-9]/gi, '_') + '.jpg';
        a.target = '_blank';
        a.click();
    },

   highlightNomenclature: function(desc) {
    if (!desc || !window.ConfigManager) return desc;
    desc = desc.replace(/\r\n|\r|\n/g, ' ');

    const nomenclature = ConfigManager.getNomenclature();
        
        if (nomenclature && nomenclature.categories) {
            const paragraphs = this.splitIntoParagraphs(desc);
            const highlightedParagraphs = paragraphs.map(para => {
                return this.highlightParagraphNew(para.text, nomenclature.categories);
            });
            return highlightedParagraphs.join('');
        } 
        else if (nomenclature && nomenclature.effectSpeed) {
            const colors = ConfigManager.getNomenclatureColors();
            const paragraphs = this.splitIntoParagraphs(desc);
            const highlightedParagraphs = paragraphs.map(para => {
                return this.highlightParagraphOld(para.text, nomenclature, colors);
            });
            return highlightedParagraphs.join('');
        }
        
        return desc;
    },

    splitIntoParagraphs: function(text) {
    const paragraphs = [];
    let currentStart = 0;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (ch === '\n') {
    if (i > currentStart) {
        const raw = text.substring(currentStart, i);
        if (raw.trim()) {
            paragraphs.push({
                text:  raw.trim(),
                start: currentStart,
                end:   i
            });
        }
    }
            paragraphs.push({ text: '\n', start: i, end: i + 1 });
            currentStart = i + 1;
            continue;
        }

        if (ch === '.' || ch === ':' || ch === ';') {
    const raw = text.substring(currentStart, i + 1);
    if (raw.trim()) {
        paragraphs.push({
            text:  raw.trim(),
            start: currentStart,
            end:   i + 1
        });
    }
    currentStart = i + 1;
}
    }

    if (currentStart < text.length) {
    const raw = text.substring(currentStart);
    if (raw.trim()) {
        paragraphs.push({
            text:  raw.trim(),
            start: currentStart,
            end:   text.length
        });
    }
}

    return paragraphs;
},

    highlightParagraphNew: function(paragraph, categories) {
    if (!paragraph || paragraph.trim() === '') return paragraph;
    if (!categories || categories.length === 0) return paragraph;

    const paraLower = paragraph.toLowerCase().trim();
    const toArr = (v) => Array.isArray(v) ? v.filter(s => s && s.trim())
                       : (v && String(v).trim() ? [String(v).trim()] : []);

    for (const category of categories) {
        if (!category.conditions) continue;
        const cond = category.conditions;
        let matches = true;

        const swArr = toArr(cond.startsWith);
        if (swArr.length > 0 && !swArr.some(sw => paraLower.startsWith(sw.toLowerCase()))) {
            matches = false;
        }

        if (matches) {
            const cArr = toArr(cond.contains);
            if (cArr.length > 0 && !cArr.some(kw => paraLower.includes(kw.toLowerCase()))) {
                matches = false;
            }
        }

        if (matches) {
            const ncArr = toArr(cond.notContains);
            if (ncArr.length > 0 && ncArr.some(kw => paraLower.includes(kw.toLowerCase()))) {
                matches = false;
            }
        }

        if (matches) {
            const ewArr = toArr(cond.endsWith);
            if (ewArr.length > 0) {
                // Strip trailing quotes/decorative chars before checking
                const stripped = paraLower.replace(/["""''\u2018\u2019\u201C\u201D\s]+$/, '');
                if (!ewArr.some(ew => stripped.endsWith(ew.toLowerCase()))) {
                    matches = false;
                }
            }
        }

        if (matches) {
            const color = category.color || '#FFFFFF';
            const categoryName = category.name || category.id;
            return `<mark style="background-color:${color};padding:2px 4px;border-radius:3px;cursor:help;opacity:0.6;" title="${categoryName}">${paragraph}</mark>`;
        }
    }
    return paragraph;
},

    highlightParagraphOld: function(paragraph, nomenclature, colors) {
        const categoryNames = {
            effectSpeed: 'Velocidad de Efecto',
            effectType: 'Tipo de Efecto',
            timing: 'Timing del Efecto',
            requirements: 'Requisitos',
            conditions: 'Condicion de Activacion',
            cost: 'Costo de Activacion',
            effects: 'Efecto',
            duration: 'Duracion del Efecto',
            restrictions: 'Restriccion'
        };

        let matchedCategory = null;

        const checkMatch = (category, keywords, isObject = false) => {
            if (isObject) {
                for (const [name, kwList] of Object.entries(keywords)) {
                    for (const kw of kwList) {
                        if (paragraph.toLowerCase().includes(kw.toLowerCase())) {
                            matchedCategory = category;
                            return true;
                        }
                    }
                }
            } else {
                for (const kw of keywords) {
                    if (paragraph.toLowerCase().includes(kw.toLowerCase())) {
                        matchedCategory = category;
                        return true;
                    }
                }
            }
            return false;
        };

        checkMatch('effectSpeed', nomenclature.effectSpeed, true) ||
        checkMatch('effectType', nomenclature.effectType, true) ||
        checkMatch('timing', nomenclature.timing, true) ||
        checkMatch('requirements', nomenclature.requirements, false) ||
        checkMatch('conditions', nomenclature.conditions, false) ||
        checkMatch('cost', nomenclature.cost, false) ||
        checkMatch('effects', nomenclature.effects, true) ||
        checkMatch('duration', nomenclature.duration, true) ||
        checkMatch('restrictions', nomenclature.restrictions, true);

        if (matchedCategory) {
            const color = colors[matchedCategory] || '#FFFFFF';
            const categoryName = categoryNames[matchedCategory] || matchedCategory;
            return `<mark style="background-color: ${color}; opacity: 0.6; padding: 2px 4px; border-radius: 3px; cursor: help;" title="${categoryName}">${paragraph}</mark>`;
        }

        return paragraph;
    },

    openFromDeck: function(id) {
        if (!window.Deck) return;

        const item = Deck.cards[id];
        if (!item) return;

        this.open(item.data);
    },

    openFromIndex(index) {
        const card = window.Buscador.currentCards[index];
        if (!card) return;
        this.open(card);
    },

// ===============================
detectPossibleRoles: function(card) {
    if (!window.ConfigManager) return [];
    const desc  = (card.desc || '').toLowerCase();
    const roles = ConfigManager.getRoleNames();
    const found = [];

    roles.forEach(roleName => {
        const cond = ConfigManager.getRoleCondition(roleName);
        if (!cond) return;
        const keywords     = cond.keywords     || [];
        const conditionals = cond.conditionals || [];

        // Multi-nomenclature filter
        const nomCatIds = window.ConfigManager?.getRoleNomenclatureCategories?.(roleName) || [];
        let searchText = desc;
        if (nomCatIds.length > 0 && window.NomenclatureAnalyzer) {
            const segments = NomenclatureAnalyzer.analyzeCard(card) || [];
            const filtered = segments
                .filter(s => nomCatIds.includes(s.category))
                .map(s => s.text.toLowerCase())
                .join(' ');
            searchText = filtered || '';
        }

        const kwMatch = keywords.length > 0 &&
            keywords.some(kw => searchText.includes(kw.toLowerCase()));
        if (!kwMatch) return;

        if (conditionals.length > 0) {
            const condMatch = conditionals.some(c => searchText.includes(c.toLowerCase()));
            if (!condMatch) return;
        }
        found.push(roleName);
    });

    return found;
},

// ===============================
calculateCardContribution: function (card, detectedRoles) {
    if (!window.Deck || !window.Stats) return null;
    if (Object.keys(Deck.cards).length === 0) return null;

    const cardId = String(card.id);

    const before = Stats.calculateInternalScore(Deck.cards);

    const simCards = { ...Deck.cards };
    if (simCards[cardId]) {
        simCards[cardId] = {
            ...simCards[cardId],
            qty: simCards[cardId].qty + 1
        };
    } else {
        simCards[cardId] = {
            data:     card,
            qty:      1,
            location: 'main',
            roles:    detectedRoles
        };
    }

    const after = Stats.calculateInternalScore(simCards);

    const delta = (a, b) => parseFloat((parseFloat(a) - parseFloat(b)).toFixed(2));

    return {
        consistency: {
            before: parseFloat(before.consistency),
            after:  parseFloat(after.consistency),
            delta:  delta(after.consistency, before.consistency)
        },
        power: {
            before: parseFloat(before.power),
            after:  parseFloat(after.power),
            delta:  delta(after.power, before.power)
        },
        resilience: {
            before: parseFloat(before.resilience),
            after:  parseFloat(after.resilience),
            delta:  delta(after.resilience, before.resilience)
        },
        internalScore: {
            before: parseFloat(before.internalScore),
            after:  parseFloat(after.internalScore),
            delta:  delta(after.internalScore, before.internalScore)
        }
    };
},

// ===============================
renderCardContribution: function (card) {
    const hasDeck = window.Deck && Object.keys(Deck.cards || {}).length > 0;
    if (!hasDeck) return '';

    const detectedRoles  = this.detectPossibleRoles(card);
    const contribution   = this.calculateCardContribution(card, detectedRoles);

    const rolesHTML = detectedRoles.length > 0
        ? detectedRoles.map(r =>
            `<span class="cv-role-chip">${r} | </span>`).join('')
        : `<span class="cv-role-none">No se detectaron roles con la configuración actual</span>`;

    let contribHTML = '';
    if (contribution) {
        const row = (label, data, color) => {
            const sign  = data.delta > 0 ? '+' : '';
            const dColor = data.delta > 0 ? '#00b894'
                         : data.delta < 0 ? '#d63031' : '#636e72';
            const pct   = Math.min(100, (data.after / 20) * 100);
            return `
                <div class="cv-contrib-row">
                    <span class="cv-contrib-label">${label}</span>
                    <div class="cv-contrib-bar-track">
                        <div class="cv-contrib-bar"
                             style="width:${pct}%;background:${color};"></div>
                    </div>
                    <span class="cv-contrib-val">${data.after.toFixed(1)}</span>
                    <span class="cv-contrib-delta" style="color:${dColor}">
                        ${data.delta !== 0 ? sign + data.delta : '—'}
                    </span>
                </div>`;
        };

        const totalSign  = contribution.internalScore.delta > 0 ? '+' : '';
        const totalColor = contribution.internalScore.delta > 0 ? '#00b894'
                         : contribution.internalScore.delta < 0 ? '#d63031' : '#636e72';

        contribHTML = `
            <div class="cv-contrib-grid">
                ${row('Consistencia:', contribution.consistency,  '#00b894')}
                ${row('Potencia:',     contribution.power,        '#d63031')}
                ${row('Resiliencia:',  contribution.resilience,   '#0066cc')}
            </div>
            <div class="cv-contrib-total">
                Internal Score: <strong>${contribution.internalScore.after.toFixed(2)}</strong>
                <span style="color:${totalColor};margin-left:6px;">
                    (${totalSign}${contribution.internalScore.delta})
                </span>
            </div>`;
    } else {
        contribHTML = `<p class="cv-contrib-empty">Agrega roles a las cartas del deck para ver el impacto.</p>`;
    }

    const showRoles   = !window.ContentManager || ContentManager.isVisible('cv-roles');
    const showContrib = !window.ContentManager || ContentManager.isVisible('cv-contribution');
    if (!showRoles && !showContrib) return '';

    const rolesSection = showRoles ? `
            <div class="cv-contrib-section-title">🎯 Posibles Roles</div>
            <div class="cv-roles-row">${rolesHTML}</div>` : '';

    const contribSection = showContrib ? `
            <div class="cv-contrib-section-title" style="margin-top:10px;">
                📊 Aporte al deck activo
                <span class="cv-deck-name">${Deck.name}</span>
            </div>
            ${contribHTML}` : '';

    return `
        <hr>
        <div class="cv-contribution-block">
            ${rolesSection}
            ${contribSection}
        </div>`;
},

// ── Mini buscador para agregar cartas a banlist / Genesys ────────
openCardSearch: function (formatName, prefillName, mode) {
    // mode: 'points' para Genesys; auto-detecta si el formato es isGenesys
    const isPointsMode = mode === 'points' ||
        !!(window.Banlist?.getData?.()?.formats?.[formatName]?.isGenesys);

    if (document.getElementById('cv-search-overlay')) return;

    const STATUS_OPTS = [
        { val: 'forbidden',    label: 'Ban',        color: '#d63031' },
        { val: 'limited',      label: 'Limitada',   color: '#e17055' },
        { val: 'semi-limited', label: 'Semi-Limit', color: '#fdcb6e' },
    ];

    const overlay = document.createElement('div');
    overlay.id = 'cv-search-overlay';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.82);
        z-index:99999;display:flex;align-items:center;justify-content:center;`;

    overlay.innerHTML = `
        <div style="background:#111;border:1px solid rgba(255,255,255,0.15);
                    border-radius:12px;padding:20px;width:340px;max-height:85vh;
                    overflow:auto;position:relative;">
            <button onclick="document.getElementById('cv-search-overlay').remove()"
                    style="position:absolute;top:10px;right:10px;background:none;
                           border:none;color:#fff;font-size:1.2rem;cursor:pointer;">✕</button>
            <h4 style="margin:0 0 12px;color:#FFD700;">
                ${isPointsMode ? '⚙ Genesys — ' : ''}Agregar carta a ${formatName}
            </h4>
            <div style="display:flex;gap:6px;margin-bottom:10px;">
                <input id="cvs-input" type="text" placeholder="Nombre de carta..."
                       style="flex:1;padding:6px 10px;background:rgba(255,255,255,0.08);
                              border:1px solid rgba(255,255,255,0.2);border-radius:6px;
                              color:#fff;font-size:0.9rem;"
                       autocomplete="off">
                <button id="cvs-btn"
                        style="padding:6px 12px;background:#0066cc;border:none;
                               border-radius:6px;color:#fff;cursor:pointer;">🔍</button>
            </div>
            <div id="cvs-status-row"
                 style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">
                ${isPointsMode
                    ? `<span style="font-size:0.78rem;color:rgba(255,255,255,0.4);">Puntos:</span>
                       <button id="cvs-pts-minus"
                               style="width:26px;height:26px;background:rgba(255,255,255,0.08);
                                      border:1px solid rgba(255,255,255,0.2);color:#fff;
                                      border-radius:5px;cursor:pointer;">−</button>
                       <input id="cvs-pts-input" type="number" min="0" value="1"
                              style="width:56px;text-align:center;background:rgba(255,255,255,0.08);
                                     border:1px solid rgba(255,255,255,0.2);color:#fff;
                                     border-radius:5px;padding:3px;font-size:0.9rem;">
                       <button id="cvs-pts-plus"
                               style="width:26px;height:26px;background:rgba(255,255,255,0.08);
                                      border:1px solid rgba(255,255,255,0.2);color:#fff;
                                      border-radius:5px;cursor:pointer;">＋</button>`
                    : STATUS_OPTS.map(s => `
                        <button class="cvs-status-btn"
                                data-status="${s.val}"
                                data-activecolor="${s.color}"
                                style="padding:3px 10px;border-radius:14px;
                                       border:1px solid rgba(255,255,255,0.25);
                                       background:rgba(0,0,0,0);color:#ccc;
                                       cursor:pointer;font-size:0.78rem;">
                            ${s.label}
                        </button>`).join('')}
            </div>
            <i style="font-size:0.78rem;color:rgba(255,255,255,0.35);">
                ${isPointsMode
                    ? 'Ajusta los puntos y haz clic en la carta.'
                    : 'Selecciona una restricción y haz clic en la carta.'}
            </i>
            <div id="cvs-results"
                 style="display:flex;flex-direction:column;gap:6px;
                        max-height:50vh;overflow:auto;margin-top:8px;"></div>
        </div>`;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    // ── Status chips (modo normal) ────────────────────────────────
    let selectedStatus = 'forbidden';
    if (!isPointsMode) {
        const statusBtns = overlay.querySelectorAll('.cvs-status-btn');
        const updateStatusUI = () => {
            statusBtns.forEach(btn => {
                const active      = btn.dataset.status === selectedStatus;
                const activeColor = btn.dataset.activecolor || '#fff';
                btn.style.color       = active ? activeColor : '#ccc';
                btn.style.borderColor = active ? activeColor : 'rgba(255,255,255,0.25)';
                btn.style.background  = active ? `${activeColor}22` : 'rgba(0,0,0,0)';
                btn.style.fontWeight  = active ? '700' : '400';
            });
        };
        statusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedStatus = btn.dataset.status;
                updateStatusUI();
            });
        });
        updateStatusUI();
    }

    if (isPointsMode) {
        const pInp = document.getElementById('cvs-pts-input');
        document.getElementById('cvs-pts-minus')?.addEventListener('click', () => {
            pInp.value = Math.max(0, (parseInt(pInp.value) || 0) - 1);
        });
        document.getElementById('cvs-pts-plus')?.addEventListener('click', () => {
            pInp.value = (parseInt(pInp.value) || 0) + 1;
        });
    }

    // ── Búsqueda limpia con data-attributes ───────────────────────
    const inp   = document.getElementById('cvs-input');
    const btn   = document.getElementById('cvs-btn');
    const resEl = document.getElementById('cvs-results');

    const cleanSearch = async () => {
        const term = inp?.value?.trim();
        if (!term) return;
        resEl.innerHTML = '<p style="color:#aaa;font-size:0.85rem;">⏳ Buscando...</p>';
        try {
            const r     = await fetch(
                `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(term)}`
            );
            const json  = await r.json();
            const cards = (json.data || []).slice(0, 15);
            if (!cards.length) {
                resEl.innerHTML = '<p style="color:#aaa;font-size:0.85rem;">Sin resultados.</p>';
                return;
            }
            resEl.innerHTML = cards.map(c => `
                <div data-cardid="${c.id}"
                     data-name="${(c.name || '').replace(/"/g, '&quot;')}"
                     data-img="${c.card_images?.[0]?.image_url_small || ''}"
                     style="display:flex;align-items:center;gap:8px;padding:7px;
                            border-radius:7px;cursor:pointer;background:rgba(255,255,255,0.04);"
                     onmouseenter="this.style.background='rgba(255,255,255,0.09)'"
                     onmouseleave="this.style.background='rgba(255,255,255,0.04)'">
                    <img src="${c.card_images?.[0]?.image_url_small || ''}"
                         style="width:36px;border-radius:3px;" onerror="this.style.display='none'">
                    <div>
                        <div style="font-size:0.83rem;color:#fff;">${c.name}</div>
                        <div style="font-size:0.72rem;color:#aaa;">${c.type}</div>
                    </div>
                </div>`).join('');
        } catch (_) {
            resEl.innerHTML = '<p style="color:#d63031;font-size:0.85rem;">Error de red.</p>';
        }
    };

    resEl.addEventListener('click', e => {
        const row = e.target.closest('[data-cardid]');
        if (!row) return;
        const cid  = row.dataset.cardid;
        const name = row.dataset.name;
        const img  = row.dataset.img;
        if (!window.Banlist) return;

        if (isPointsMode) {
            const pInp = document.getElementById('cvs-pts-input');
            const pts  = Math.max(0, parseInt(pInp?.value) || 1);
            Banlist.setCardPoints(formatName, cid, { name, img }, pts);
        } else {
            Banlist.setCardStatus(formatName, cid, { name, img }, selectedStatus);
        }

        const listEl  = document.getElementById(`banlist-cards-${formatName}`);
        if (listEl) listEl.innerHTML = Banlist.renderFormatList(formatName);
        const countEl = document.getElementById(`ban-count-${formatName}`);
        if (countEl) {
            const d = Banlist.getData();
            countEl.textContent =
                Object.keys(d.formats[formatName]?.cards || {}).length + ' cartas';
        }

        row.style.background = 'rgba(255,215,0,0.18)';
        setTimeout(() => { row.style.background = 'rgba(255,255,255,0.04)'; }, 900);
    });

    btn.addEventListener('click', cleanSearch);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') cleanSearch(); });
    inp.focus();

    if (prefillName) {
        inp.value = prefillName;
        cleanSearch();
    }
},

openPointsEditor: function (formatName, cardId, cardName, currentPoints) {
    if (document.getElementById('cv-pts-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cv-pts-overlay';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.82);
        z-index:99999;display:flex;align-items:center;justify-content:center;`;

    overlay.innerHTML = `
        <div style="background:#111;border:1px solid rgba(255,255,255,0.15);
                    border-radius:12px;padding:24px;width:300px;position:relative;">
            <button onclick="document.getElementById('cv-pts-overlay').remove()"
                    style="position:absolute;top:10px;right:12px;background:none;
                           border:none;color:#fff;font-size:1.2rem;cursor:pointer;">✕</button>
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);margin-bottom:6px;
                        text-transform:uppercase;letter-spacing:0.05em;">⚙ Genesys · ${formatName}</div>
            <div style="font-size:0.98rem;color:#fff;margin-bottom:16px;font-weight:600;">
                ${cardName}
            </div>
            <div style="display:flex;align-items:center;gap:10px;justify-content:center;">
                <button id="pts-minus"
                        style="width:36px;height:36px;background:rgba(255,255,255,0.1);
                               border:1px solid rgba(255,255,255,0.2);color:#fff;
                               border-radius:6px;cursor:pointer;font-size:1.3rem;line-height:1;">−</button>
                <input id="pts-input" type="number" min="0" value="${currentPoints || 0}"
                       style="width:80px;text-align:center;font-size:1.3rem;font-weight:700;
                              background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.25);
                              color:#fff;border-radius:7px;padding:6px;">
                <button id="pts-plus"
                        style="width:36px;height:36px;background:rgba(255,255,255,0.1);
                               border:1px solid rgba(255,255,255,0.2);color:#fff;
                               border-radius:6px;cursor:pointer;font-size:1.3rem;line-height:1;">＋</button>
            </div>
            <button id="pts-save"
                    style="margin-top:18px;width:100%;padding:9px;background:#0066cc;border:none;
                           color:#fff;border-radius:7px;cursor:pointer;font-size:0.9rem;font-weight:600;">
                Guardar puntos
            </button>
            <div id="pts-feedback" style="text-align:center;font-size:0.78rem;color:#00b894;
                                          min-height:18px;margin-top:6px;"></div>
        </div>`;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    const inp  = document.getElementById('pts-input');
    document.getElementById('pts-minus').addEventListener('click', () => {
        inp.value = Math.max(0, (parseInt(inp.value) || 0) - 1);
    });
    document.getElementById('pts-plus').addEventListener('click', () => {
        inp.value = (parseInt(inp.value) || 0) + 1;
    });
    document.getElementById('pts-save').addEventListener('click', () => {
        const pts = Math.max(0, parseInt(inp.value) || 0);
        Banlist.setCardPoints(formatName, cardId,
            { name: cardName, img: '' }, pts);
        const listEl  = document.getElementById(`banlist-cards-${formatName}`);
        if (listEl) listEl.innerHTML = Banlist.renderFormatList(formatName);
        const countEl = document.getElementById(`ban-count-${formatName}`);
        if (countEl) {
            const d = Banlist.getData();
            countEl.textContent = Object.keys(d.formats[formatName]?.cards || {}).length + ' cartas';
        }
        const fb = document.getElementById('pts-feedback');
        if (fb) fb.textContent = '✓ Guardado';
        setTimeout(() => overlay.remove(), 900);
    });
},
    openSetInBuscador: function (setName) {
        document.getElementById('cv-overlay')?.remove();
        if (window.Navigation) Navigation.showTab('buscador');
        setTimeout(() => {
            if (!window.Buscador) return;
            Buscador.clear();
            Buscador._loadCardsets().then(() => {
                Buscador.advancedFilters.cardset = setName;
                const sel = document.getElementById('buscador-set-sel');
                if (sel) sel.value = setName;
                Buscador._updateFilterSummary();
                Buscador.autoSearch();
            });
        }, 80);
    },
    openArchetypeInBuscador: function (archetypeName) {
        document.getElementById('cv-overlay')?.remove();
        if (window.Navigation) Navigation.showTab('buscador');
        setTimeout(() => {
            if (!window.Buscador) return;
            Buscador.clear();
            Buscador._loadArchetypes().then(() => {
                Buscador.advancedFilters.archetype = archetypeName;
                const sel = document.getElementById('buscador-archetype-sel');
                if (sel) sel.value = archetypeName;
                Buscador._updateFilterSummary();
                Buscador.autoSearch();
            });
        }, 80);
    },

    // ── Lore de la carta/arquetipo (Yugipedia API) ──
    _loadLore: function (card) {
        const wrap = document.getElementById('cv-lore-btn-wrap');
        if (!wrap) return;
        const YP_API = 'https://yugipedia.com/api.php';

        const fetchLore = (pageTitle) => {
            const url = `${YP_API}?action=parse&page=${encodeURIComponent(pageTitle)}&prop=wikitext&format=json&origin=*`;
            return fetch(url)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    const wikitext = data?.parse?.wikitext?.['*'];
                    return wikitext ? CardViewer._extractLoreSections(wikitext) : null;
                })
                .catch(() => null);
        };

        fetchLore(card.name).then(sections => {
            if (!document.getElementById('cv-overlay')) return; // visor ya cerrado
            if (sections && sections.length) {
                CardViewer._loreData = { title: card.name, sections };
                CardViewer._renderLoreButton(wrap);
                return;
            }
            if (card.archetype) {
                fetchLore(card.archetype).then(archSections => {
                    if (!document.getElementById('cv-overlay')) return;
                    if (archSections && archSections.length) {
                        CardViewer._loreData = { title: card.archetype, sections: archSections };
                        CardViewer._renderLoreButton(wrap);
                    }
                });
            }
        });
    },

    _renderLoreButton: function (wrap) {
        wrap.innerHTML = `<button id="cv-lore-btn" class="cv-action-btn cv-lore-btn" onclick="CardViewer.openLorePanel(); return false;">📖 El Lore de esta carta</button>`;
    },

    _extractLoreSections: function (wikitext) {
        const headingRe = /^(={2,6})\s*(.+?)\s*\1\s*$/gm;
        const headings = [];
        let m;
        while ((m = headingRe.exec(wikitext)) !== null) {
            headings.push({ level: m[1].length, title: m[2].trim(), start: m.index, end: headingRe.lastIndex });
        }
        const loreIdx = headings.findIndex(h => h.level === 2 && /^lore$/i.test(h.title));
        if (loreIdx === -1) return null;

        const loreHeading = headings[loreIdx];
        let nextHeading = null;
        for (let i = loreIdx + 1; i < headings.length; i++) {
            if (headings[i].level <= 2) { nextHeading = headings[i]; break; }
        }
        const blockStart = loreHeading.end;
        const blockEnd   = nextHeading ? nextHeading.start : wikitext.length;
        const block = wikitext.slice(blockStart, blockEnd);

        const subHeadings = headings
            .filter(h => h.level === 3 && h.start >= blockStart && h.start < blockEnd)
            .map(h => ({ title: h.title, start: h.start - blockStart, end: h.end - blockStart }));

        if (!subHeadings.length) {
            const text = CardViewer._wikitextToPlain(block);
            return text ? [{ title: null, text }] : null;
        }

        const sections = [];
        const intro = CardViewer._wikitextToPlain(block.slice(0, subHeadings[0].start));
        if (intro) sections.push({ title: null, text: intro });

        subHeadings.forEach((sh, i) => {
            const end = i + 1 < subHeadings.length ? subHeadings[i + 1].start : block.length;
            const text = CardViewer._wikitextToPlain(block.slice(sh.end, end));
            if (text) sections.push({ title: sh.title, text });
        });
        return sections.length ? sections : null;
    },

    _wikitextToPlain: function (wt) {
        if (!wt) return '';
        let t = wt;
        t = t.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
        t = t.replace(/<ref[^>]*\/>/gi, '');
        t = t.replace(/<!--[\s\S]*?-->/g, '');
        for (let i = 0; i < 3; i++) t = t.replace(/\{\{[^{}]*\}\}/g, '');
        t = t.replace(/\[\[File:[^\]]*\]\]/gi, '');
        t = t.replace(/\[\[Image:[^\]]*\]\]/gi, '');
        t = t.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2');
        t = t.replace(/\[\[([^\]]*)\]\]/g, '$1');
        t = t.replace(/\[https?:\/\/[^\s\]]+\s+([^\]]*)\]/g, '$1');
        t = t.replace(/\[https?:\/\/[^\s\]]+\]/g, '');
        t = t.replace(/'''''(.*?)'''''/g, '<b><i>$1</i></b>');
        t = t.replace(/'''(.*?)'''/g, '<b>$1</b>');
        t = t.replace(/''(.*?)''/g, '<i>$1</i>');
        t = t.replace(/^\*+\s*/gm, '• ');
        t = t.replace(/\n{3,}/g, '\n\n');
        return t.trim();
    },

    openLorePanel: function () {
        const data = CardViewer._loreData;
        if (!data || document.getElementById('cv-lore-overlay')) return;

        const multi = data.sections.length > 1;
        const tabsHtml = multi ? `<div class="cv-lore-tabs">${
            data.sections.map((s, i) =>
                `<button class="cv-lore-tab${i === 0 ? ' active' : ''}" data-idx="${i}" onclick="CardViewer._switchLoreTab(${i})">${s.title || 'General'}</button>`
            ).join('')
        }</div>` : '';

        const panesHtml = data.sections.map((s, i) =>
            `<div class="cv-lore-pane${i === 0 ? ' active' : ''}" data-idx="${i}">${s.text.replace(/\n/g, '<br>')}</div>`
        ).join('');

        const overlay = document.createElement('div');
        overlay.id = 'cv-lore-overlay';
        overlay.className = 'cv-lore-overlay';
        overlay.innerHTML = `
            <div class="cv-lore-modal">
                <button class="cv-lore-close" onclick="document.getElementById('cv-lore-overlay').remove()">✕</button>
                <div class="cv-lore-title">📖 ${data.title}</div>
                ${tabsHtml}
                <div class="cv-lore-body">${panesHtml}</div>
                <div class="cv-lore-source">Fuente: Yugipedia</div>
            </div>`;
        document.body.appendChild(overlay);
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    },

    _switchLoreTab: function (idx) {
        document.querySelectorAll('.cv-lore-tab').forEach(el => el.classList.toggle('active', +el.dataset.idx === idx));
        document.querySelectorAll('.cv-lore-pane').forEach(el => el.classList.toggle('active', +el.dataset.idx === idx));
    },
};

window.CardViewer = CardViewer;



// ── Favoritas — lista persistente de cartas favoritas; render delega a Engines si el sidebar está activo ──

const Favoritas = {

    STORAGE_KEY: 'yugioh_favoritas',

    // ── Persistencia ────────────────────────────────────────────

    getAll: function () {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
        } catch (_) { return {}; }
    },

    has: function (cardId) {
        return !!this.getAll()[String(cardId)];
    },

    toggle: function (card) {
        const all = this.getAll();
        const id  = String(card.id);
        if (all[id]) {
            delete all[id];
        } else {
            all[id] = {
                id:    card.id,
                name:  card.name,
                type:  card.type,
                img:   card.card_images?.[0]?.image_url_small || '',
                data:  card
            };
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
        this.render();
    },

    // ── Render ────────────────────────────────────────────────────

    render: function () {
    if (window.Engines) {
        if (Engines._activeTab === 'favoritas') {
            Engines._renderSidebar();
        }
        return;
    }

    // Fallback legacy (si no hay sidebar)
    const panel = document.getElementById('favoritas-panel');
    const list  = document.getElementById('favoritas-list');
    if (!panel || !list) return;
    const all   = this.getAll();
    const cards = Object.values(all).sort((a, b) => a.name.localeCompare(b.name));
    if (cards.length === 0) { panel.style.display = 'none'; return; }
    panel.style.display = '';
    list.innerHTML = cards.map((c, i) => `
        <div class="fav-item" onclick="Favoritas.showActions(${i}, this)">
            <img src="${c.img}" class="fav-img" loading="lazy" alt="${c.name}">
            <div class="fav-info">
                <div class="fav-name">${c.name}</div>
                <div class="fav-type">${c.type}</div>
            </div>
            <button class="fav-remove" onclick="event.stopPropagation(); Favoritas.remove('${c.id}')" title="Quitar">✕</button>
        </div>
    `).join('');
    this._cards = cards;
},

    showActions: function (index, el) {
        document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
        document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));

        const overlay = document.createElement('div');
        overlay.className = 'fav-actions-overlay';
        overlay.innerHTML = `
            <button class="card-action-btn btn-view"
                onclick="Favoritas.viewCard(${index}); event.stopPropagation();">Ver</button>
            <button class="card-action-btn btn-add"
                onclick="Favoritas.addCard(${index}); event.stopPropagation();">Añadir</button>
        `;
        el.appendChild(overlay);
        el.classList.add('fav-item-active');
    },

    viewCard: function (index) {
        document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
        document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));
        const card = this._cards?.[index];
        if (card?.data && window.CardViewer) CardViewer.open(card.data);
    },

    addCard: function (index) {
        document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
        document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));
        const card = this._cards?.[index];
        if (card?.data && window.Deck) Deck.syncFromViewer(card.id, card.data, 1);
    },

    remove: function (cardId) {
        const all = this.getAll();
        delete all[String(cardId)];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
        this.render();
    },

    init: function () {
        this.render();
    }
};

window.Favoritas = Favoritas;
document.addEventListener('DOMContentLoaded', () => Favoritas.init());