/* ====================================
   BUSCADOR MODULE
   Destiny Draw - Yu-Gi-Oh! App
   ==================================== */

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
    cardCategory:   '',  // 'monster' | 'spell' | 'trap'
    attribute:      '',  // DARK, LIGHT, etc.
    monsterType:    '',  // Dragon, Warrior, etc. (race en API)
    monsterSubtype: '',  // Effect, Fusion, Synchro, XYZ, Link, Pendulum, etc.
    spellSubtype:   '',  // Normal, Field, Quick-Play, etc. (race en API)
    trapSubtype:    '',  // Normal, Continuous, Counter (race en API)
    level:          '',  // nivel / rango
    linkval:        '',  // rating link
    scale:          '',  // escala péndulo
    atk:            '',
    def:            '',
},


FILTER_DATA: {
    attributes:       ['DARK','LIGHT','EARTH','WATER','FIRE','WIND','DIVINE'],
    monsterTypes:     ['Dragon','Warrior','Spellcaster','Zombie','Fiend','Machine','Fairy',
                       'Beast','Beast-Warrior','Winged Beast','Fish','Sea Serpent','Rock',
                       'Dinosaur','Thunder','Insect','Plant','Psychic','Reptile','Aqua',
                       'Cyberse','Wyrm','Divine-Beast'],
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
    'Pendulum': null,            // múltiples tipos en API → filtro local
    'Tuner':   'Tuner Monster',
    'Flip':    'Flip Effect Monster',
    'Gemini':  'Gemini Monster',
    'Union':   'Union Effect Monster',
    'Spirit':  'Spirit Monster',
},


    init: function () {

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
    },

    setupEvents: function () {

        this.searchBtn.addEventListener('click', () => this.search());
        this.clearBtn.addEventListener('click', () => this.clear());

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.search();
        });

        if (this.filterInput) {
            // Detectar cuando se presiona coma o Enter para agregar chip
            this.filterInput.addEventListener('keydown', (e) => {
                if (e.key === ',' || e.key === 'Enter') {
                    e.preventDefault();
                    this.addChipFromInput();
                }
            });

            // También buscar automáticamente cuando cambian los chips
            this.filterInput.addEventListener('input', (e) => {
                // Si el usuario borra todo, también actualizar
                if (e.target.value === '' && this.filterWords.length > 0) {
                    this.autoSearch();
                }
            });
        }
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

            // Evento click para eliminar chip
            chip.querySelector('.chip-remove').addEventListener('click', () => {
                this.removeChip(index);
            });

            this.chipsContainer.appendChild(chip);
        });
    },

    // NUEVO: Eliminar un chip específico
    removeChip: function (index) {
        this.filterWords.splice(index, 1);
        this.renderChips();
        this.autoSearch();
    },

    // NUEVO: Buscar automáticamente cuando hay chips (incluso sin nombre)
    autoSearch: async function () {
        // Si no hay chips y no hay nombre, no buscar
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
                // Búsqueda solo por filtros (obtener todas las cartas y filtrar)
                // Usamos un nombre genérico para obtener un conjunto amplio
                const url = `${this.apiUrl}`;
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

        // Permitir buscar solo con filtros (sin nombre)
        if (!mainTerm && this.filterWords.length === 0) {
            this.showMessage('⚠️ Escribe un nombre de carta o agrega palabras clave');
            return;
        }

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
                card.desc,
                card.race,
                card.attribute
            ].join(' ').toLowerCase();

            return this.filterWords.every(word => text.includes(word));
        });
    },

    displayResults: function (cards) {

        let html = '<div class="results-grid">';
        this.currentCards = cards;

           cards.forEach((card, index) => {
    const img = card.card_images?.[0]?.image_url_small || '';

    html += `
        <div class="card-item" onclick="Buscador.showCardActions(${index}, this)">
            <img src="${img}" class="card-image">
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
        </div>
    `;
});


        html += '</div>';
        this.resultsContainer.innerHTML = html;
    },

    clear: function () {

        this.searchInput.value = '';
        if (this.filterInput) this.filterInput.value = '';
        
        // NUEVO: Limpiar también los chips
        this.filterWords = [];
        this.renderChips();

        this.resultsContainer.innerHTML =
            '<p class="results-placeholder">Utiliza el buscador para encontrar cartas de Yu-Gi-Oh!</p>';

        this.searchInput.focus();
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
        // Remover cualquier overlay previo
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
    const summary  = document.getElementById('adv-filters-summary');
    const resetBtn = document.getElementById('adv-reset-btn');
    if (summary)  summary.textContent = parts.length ? parts.join(' · ') : '';
    if (resetBtn) resetBtn.style.display = parts.length ? 'inline-block' : 'none';
},

hasAdvancedFilters: function() {
    const f = this.advancedFilters;
    return !!(f.cardCategory || f.attribute || f.monsterType || f.monsterSubtype ||
              f.spellSubtype || f.trapSubtype || f.level || f.linkval || f.scale ||
              f.atk || f.def);
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

        // ── Categoría de carta ──
        if (f.cardCategory === 'monster' && !type.includes('monster'))    return false;
        if (f.cardCategory === 'spell'   && !type.includes('spell card')) return false;
        if (f.cardCategory === 'trap'    && !type.includes('trap card'))  return false;

        // ── Filtros de monstruo ──
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

        // ── Filtros de mágica ──
        if (f.cardCategory === 'spell' && f.spellSubtype) {
            if (race !== f.spellSubtype.toLowerCase()) return false;
        }

        // ── Filtros de trampa ──
        if (f.cardCategory === 'trap' && f.trapSubtype) {
            if (race !== f.trapSubtype.toLowerCase()) return false;
        }

        return true;
    });
},

resetAdvancedFilters: function() {
    Object.assign(this.advancedFilters, {
        cardCategory:'', attribute:'', monsterType:'', monsterSubtype:'',
        spellSubtype:'', trapSubtype:'', level:'', linkval:'', scale:'', atk:'', def:''
    });
    this._updateFilterSummary();
    if (this.filterPanelOpen) this.renderFilterPanel();
    this.autoSearch();
},
    
};

document.addEventListener('DOMContentLoaded', () => Buscador.init());
window.Buscador = Buscador;