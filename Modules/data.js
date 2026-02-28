/* data.js — Capa de datos: config, scores, análisis de especialidades y nomenclatura */
/* Absorbe: configmanager.js, stats.js, specialty-analyzer.js, nomenclature-analyzer.js */


// ── ConfigManager — config persistente: roles, staples, mecánicas, música, maestros, fuentes, shortcuts ──

const ConfigManager = {

    defaultConfig: {
        // Roles: estructura compatible con OLD VERSION
        roles: {
            'Handtrap': ['from your hand'],
            'Boardbreaker': ['destroy all', 'destroy'],
            'Extender': ['special summon this'],
            'Starter': ['summoned'],
            'Booster': ['gain'],
            'Draw-Engine': ['draw 1'],
            'Burner': ['inflict'],
            'Recovery': ['from the gy', 'from the graveyard', 'from the banish'],
            'Negater': ['negate'],
            'Searcher': ['add', 'from your deck'],
            'Backrow-Removal': ['destroy', 'remove'],
            'Banisher': ['remove', 'banish 1', 'banish it'],
            'Disruption': ['quick-effect'],
            'Boss Monster': [],
            'Brick': [],
            'Bridge': []
        },
        
        // RoleConditions: keywords (actúan solos O con condicional)
        roleConditions: {
            'Handtrap': {
                conditionals: [],
                keywords: ['from your hand', 'from the hand', 'from their hand']
            },
            'Disruption': {
                conditionals: ['quick-effect', 'during either player'],
                keywords: ['negate', 'destroy']
            },
            'Boardbreaker': {
                conditionals: [],
                keywords: ['destroy all', 'destroy']
            },
            'Recovery': {
                conditionals: [],
                keywords: ['from the gy', 'from the graveyard', 'from the banish']
            },
            'Negater': {
                conditionals: [],
                keywords: ['negate']
            },
            'Searcher': {
                conditionals: [],
                keywords: ['add', 'from your deck']
            },
            'Banisher': {
                conditionals: [],
                keywords: ['remove', 'banish 1', 'banish it']
            },
            'Draw-Engine': {
                conditionals: [],
                keywords: ['draw 1']
            },
            'Extender': {
                conditionals: [],
                keywords: ['special summon this']
            },
            'Starter': {
                conditionals: [],
                keywords: ['summoned']
            },
            // ⭐ FORMACION GAMES
            formacionGames: [],
        },

        // Specialties: array de pares
        specialties: [
            {
                id: 'spec_001',
                specialization: {
                    name: 'Recursion',
                    rol: 'Recovery',
                    keywords: ['from the gy', 'from the graveyard']
                },
                counter: {
                    name: 'Anti-Recursion',
                    rol: 'Banisher',
                    keywords: ['banish', 'remove from play']
                }
            },
            {
                id: 'spec_002',
                specialization: {
                    name: 'Negation',
                    rol: 'Negater',
                    keywords: ['negate']
                },
                counter: {
                    name: 'Anti-Negate',
                    rol: '',
                    keywords: ['cannot be negated', 'unaffected by']
                }
            },
            {
                id: 'spec_003',
                specialization: {
                    name: 'Search',
                    rol: 'Searcher',
                    keywords: ['add', 'from your deck to your hand']
                },
                counter: {
                    name: 'Search-Lock',
                    rol: '',
                    keywords: ['cannot add', 'cannot search']
                }
            }
        ],

        // Staples: estructura simplificada
        staples: {
            "83764718": {
                id: "83764718",
                name: "Monster Reborn",
                imageUrl: "https://images.ygoprodeck.com/images/cards_small/83764718.jpg",
                type: "Spell Card"
            },
            "5318639": {
                id: "5318639",
                name: "Mystical Space Typhoon",
                imageUrl: "https://images.ygoprodeck.com/images/cards_small/5318639.jpg",
                type: "Spell Card"
            },
            "44095762": {
                id: "44095762",
                name: "Mirror Force",
                imageUrl: "https://images.ygoprodeck.com/images/cards_small/44095762.jpg",
                type: "Trap Card"
            }
        },

        // Cada categoría tiene UNA configuración directa con 4 campos
        nomenclature: {
    categories: [
        {
            id: 'effectSpeed',
            name: 'Velocidad de Efecto',
            color: '#FF6B6B',
            conditions: { startsWith: '', contains: ['quick effect'], notContains: [], endsWith: ':' }
        },
        {
            id: 'effectType',
            name: 'Tipo de Efecto',
            color: '#4ECDC4',
            conditions: { startsWith: '', contains: ['target'], notContains: [], endsWith: ';' }
        },
        {
            id: 'timing',
            name: 'Momento de Activación',
            color: '#FFE66D',
            conditions: { startsWith: 'when', contains: ['summoned'], notContains: [], endsWith: ':' }
        },
        {
            id: 'conditions',
            name: 'Condición de Activación',
            color: '#F38181',
            conditions: { startsWith: 'while', contains: [], notContains: [], endsWith: ':' }
        },
        {
            id: 'cost',
            name: 'Costo de Activación',
            color: '#AA96DA',
            conditions: { startsWith: '', contains: ['discard'], notContains: [], endsWith: ';' }
        },
        {
            id: 'effects',
            name: 'Efectos',
            color: '#FCBAD3',
            conditions: { startsWith: '', contains: ['destroy'], notContains: [], endsWith: '.' }
        },
        {
            id: 'restrictions',
            name: 'Restricciones',
            color: '#FFD3B6',
            conditions: { startsWith: 'you can only', contains: [], notContains: [], endsWith: 'that turn' }
        }
    ]
},
// ⭐ RENDIMIENTOS DECRECIENTES - parte de la config principal
        diminishingReturns: {
            enabled: true,
            crossPenalty: false,
            roleThresholds: {
                'starter':      { optimal: 13, max: 16, curve: 0.5, crossPenalty: false },
                'searcher':     { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'boss monster': { optimal: 6,  max: 10, curve: 0.7, crossPenalty: false },
                'boardbreaker': { optimal: 8,  max: 13, curve: 0.6, crossPenalty: false },
                'removal':      { optimal: 8,  max: 12, curve: 0.6, crossPenalty: false },
                'negator':      { optimal: 9,  max: 15, curve: 0.5, crossPenalty: false },
                'extender':     { optimal: 9,  max: 12, curve: 0.6, crossPenalty: false },
                'recycle':      { optimal: 6,  max: 10, curve: 0.7, crossPenalty: false }
            }
        },
        pillars: {
            consistency: ['Searcher', 'Starter'],
            power:       ['Boss Monster', 'Boardbreaker', 'Booster', 'Removal', 'Disruption'],
            resilience:  ['Negater', 'Handtrap', 'Extender', 'Recycle']
        },
        // Formato: [pilar que vence, pilar que pierde]
        pillarRPS: [
            ['resilience',  'power'],
            ['power',       'consistency'],
            ['consistency', 'resilience']
        ],
        // ⭐ META LINKS - Fuentes externas de la pestaña Meta
        metaLinks: [
            { id: 'ml_1', title: 'Master Duel Meta – Tier List',      url: 'https://www.masterduelmeta.com/tier-list#power-rankings', desc: 'Tier list y power rankings de Master Duel' },
            { id: 'ml_2', title: 'YugiohMeta – Tier List',            url: 'https://www.yugiohmeta.com/tier-list',                  desc: 'Tier list TCG competitivo actualizada' },
            { id: 'ml_3', title: 'YGOProDeck',                        url: 'https://ygoprodeck.com/',                               desc: 'Base de datos y decklists de la comunidad' },
            { id: 'ml_4', title: 'Wiki Yu-Gi-Oh! (ES)',               url: 'https://yugioh.fandom.com/es/wiki/Mago_Oscuro',         desc: 'Wiki en español de Yu-Gi-Oh!' },
            { id: 'ml_5', title: 'Road of the King – Master Duel',    url: 'https://roadoftheking.com/tag/master-duel/',             desc: 'Análisis y reportes del meta de Master Duel' },
            { id: 'ml_6', title: 'Road of the King – OCG Weekly',     url: 'https://roadoftheking.com/tag/ocg-metagame-weekly/',     desc: 'Reportes semanales del meta OCG' },
        ],
        // ⭐ META MASTERS - Maestros del Juego
        metaMasters: [],
        shortcuts: [
            { label: 'Decks Guardados', tab: 'mideck',       sectionId: 'saved-decks-sec',  module: 'Deck' },
            { label: 'Winrate',          tab: 'estadisticas', sectionId: 'winrate-sec',       module: 'Estadisticas' },
            { label: 'Staples',          tab: 'config',       sectionId: 'staples-section',   module: 'Config' },
            { label: 'Buscador',         tab: 'buscador',     sectionId: null,                module: null }
        ]
    },
    

    // ===============================

    getConfig: function () {
        try {
            const saved = localStorage.getItem('yugioh_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                
                if (parsed.specialties && !Array.isArray(parsed.specialties)) {
                    console.log('Migrando specialties de objeto a array');
                    parsed.specialties = JSON.parse(JSON.stringify(this.defaultConfig.specialties));
                }
                
                if (parsed.staples) {
                    Object.keys(parsed.staples).forEach(id => {
                        const s = parsed.staples[id];
                        if (s.roles !== undefined || s.specialtyKeywords !== undefined) {
                            parsed.staples[id] = {
                                id: s.id || id,
                                name: s.nameEn || s.name || '',
                                imageUrl: s.imageUrl || `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`,
                                type: s.type || ''
                            };
                        }
                    });
                }
                
                if (parsed.nomenclature) {
                    if (!parsed.nomenclature.categories && (parsed.nomenclature.effectSpeed || parsed.nomenclature.effectType)) {
                        console.log('Migrando nomenclature OLD a NUEVA estructura');
                        parsed.nomenclature = JSON.parse(JSON.stringify(this.defaultConfig.nomenclature));
                    }
                }
                if (parsed.nomenclature && parsed.nomenclature.categories) {
                    parsed.nomenclature.categories.forEach(cat => {
                        if (cat.conditions) {
                            if (typeof cat.conditions.contains === 'string') {
                                cat.conditions.contains = cat.conditions.contains.trim() ? [cat.conditions.contains.trim()] : [];
                            }
                            if (typeof cat.conditions.notContains === 'string') {
                                cat.conditions.notContains = cat.conditions.notContains.trim() ? [cat.conditions.notContains.trim()] : [];
                            }
                        }
                    });
                }
                if (Array.isArray(parsed.specialties)) {
                    parsed.specialties = parsed.specialties.map(pair => {
                        if (pair.specialization !== undefined) {
                            return {
                                id:           pair.id,
                                mechanicRole: pair.specialization?.rol || '',
                                counterRole:  pair.counter?.rol        || ''
                            };
                        }
                        return pair;
                    });
                }
                return parsed;
            }
        } catch (err) {
            console.error('Error cargando configuración:', err);
        }
        return JSON.parse(JSON.stringify(this.defaultConfig));
    },

    saveConfig: function (config) {
        try {
            localStorage.setItem('yugioh_config', JSON.stringify(config));
            return true;
        } catch (err) {
            console.error('Error guardando configuración:', err);
            return false;
        }
    },

    resetToDefault: function () {
        this.saveConfig(JSON.parse(JSON.stringify(this.defaultConfig)));
        return true;
    },

    exportConfig: function () {
        try {
            const snapshot = {};
            // Claves estáticas conocidas
            const staticKeys = [
                'yugioh_config', 'yugioh_banlist_data', 'yugioh_engines',
                'yugioh_winrates', 'pz_winrate_standalone', 'yugioh_power_cache',
                'yugioh_cross_scores', 'yugioh_meta_decks', 'yugioh_meta_card_library',
                'yugioh_meta_deck_scores', 'yugioh_favoritas', 'yugioh_formacion_notes',
                'yugioh_formacion_mastered', 'yugioh_torneo_actual',
                'dd_content_visibility', 'dd_player_profile'
            ];
            staticKeys.forEach(k => {
                const v = localStorage.getItem(k);
                if (v !== null) snapshot[k] = v;
            });
            // Claves dinámicas: deck_, matchup_, pz_states_
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k) continue;
                if (k.startsWith('deck_') || k.startsWith('matchup_') || k.startsWith('pz_states_')) {
                    snapshot[k] = localStorage.getItem(k);
                }
            }
            const json = JSON.stringify(snapshot, null, 2);
            const blob = new Blob([json], { type: 'text/plain' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url;
            a.download = `destiny_draw_backup_${new Date().toISOString().slice(0,10)}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (err) {
            console.error('Error exportando:', err);
            return false;
        }
    },

    importConfig: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const snapshot = JSON.parse(e.target.result);
                    if (typeof snapshot !== 'object' || Array.isArray(snapshot))
                        throw new Error('Formato inválido');
                    // Limpiar todo primero
                    const allKeys = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k) allKeys.push(k);
                    }
                    allKeys.forEach(k => localStorage.removeItem(k));
                    // Restaurar cada clave del backup
                    Object.entries(snapshot).forEach(([k, v]) => {
                        if (v !== null && v !== undefined) localStorage.setItem(k, v);
                    });
                    resolve(true);
                } catch (err) {
                    reject('Archivo inválido: ' + err.message);
                }
            };
            reader.onerror = () => reject('Error al leer el archivo');
            reader.readAsText(file);
        });
    },

    // ===============================

    getRoles: function () {
        return this.getConfig().roles || {};
    },
    setRoleWeight: function (roleName, weight) {
        const config = this.getConfig();
        if (!config.roleWeights) config.roleWeights = {};
        config.roleWeights[roleName] = Math.max(0.1, Math.min(2.0, weight));
        this.saveConfig(config);
    },

    getRoleWeight: function (roleName) {
        const w = this.getConfig().roleWeights?.[roleName];
        return (w !== undefined && w > 0) ? w : 1.0;
    },

    getRoleNames: function () {
        return Object.keys(this.getRoles());
    },

    getRoleKeywords: function (roleName) {
        return (this.getRoles()[roleName] || []);
    },

   createRole: function(roleName) {
    const config = this.getConfig();
    const name = roleName.trim();
    if (!name || config.roles[name] !== undefined) return false;
    config.roles = Object.assign({ [name]: [] }, config.roles);
    if (!config.roleWeights) config.roleWeights = {};
    config.roleWeights[name] = 1.0;
    this.saveConfig(config);
    return true;
},
duplicateRole: function(roleName) {
    const config   = this.getConfig();
    const original = config.roles[roleName];
    if (original === undefined) return null;

    let copyName = roleName + ' (copia)';
    let counter  = 2;
    while (config.roles[copyName] !== undefined) {
        copyName = roleName + ` (copia ${counter++})`;
    }

    config.roles = Object.assign({ [copyName]: [...original] }, config.roles);

    if (!config.roleWeights) config.roleWeights = {};
    config.roleWeights[copyName] = config.roleWeights[roleName] ?? 1.0;

    if (config.roleConditions?.[roleName]) {
        if (!config.roleConditions) config.roleConditions = {};
        config.roleConditions[copyName] = JSON.parse(
            JSON.stringify(config.roleConditions[roleName])
        );
    }

    this.saveConfig(config);
    return copyName;
},
    renameRole: function (oldName, newName) {
        const config = this.getConfig();
        const trimmed = newName.trim();
        if (config.roles[oldName] !== undefined && trimmed && config.roles[trimmed] === undefined) {
            config.roles[trimmed] = config.roles[oldName];
            delete config.roles[oldName];
            if (config.roleWeights?.[oldName] !== undefined) {
                config.roleWeights[trimmed] = config.roleWeights[oldName];
                delete config.roleWeights[oldName];
            }
            if (config.roleConditions && config.roleConditions[oldName]) {
                config.roleConditions[trimmed] = config.roleConditions[oldName];
                delete config.roleConditions[oldName];
            }
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    deleteRole: function (roleName) {
        const config = this.getConfig();
        if (config.roles[roleName] !== undefined) {
            delete config.roles[roleName];
            if (config.roleWeights) delete config.roleWeights[roleName];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    addKeywordToRole: function (roleName, keyword) {
        const config = this.getConfig();
        if (!config.roles[roleName]) config.roles[roleName] = [];
        const kw = keyword.toLowerCase().trim();
        if (kw && !config.roles[roleName].includes(kw)) {
            config.roles[roleName].push(kw);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    removeKeywordFromRole: function (roleName, keyword) {
        const config = this.getConfig();
        if (config.roles[roleName]) {
            const idx = config.roles[roleName].indexOf(keyword);
            if (idx > -1) {
                config.roles[roleName].splice(idx, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // ===============================

    getRoleConditions: function () {
        return this.getConfig().roleConditions || {};
    },

    getRoleCondition: function (roleName) {
        return (this.getConfig().roleConditions || {})[roleName] || null;
    },

    hasConditions: function (roleName) {
        const condition = this.getRoleCondition(roleName);
        return condition && condition.conditionals && condition.conditionals.length > 0;
    },

    setRoleCondition: function (roleName, conditionals, keywords) {
        const config = this.getConfig();
        if (!config.roleConditions) config.roleConditions = {};
        config.roleConditions[roleName] = {
            conditionals: conditionals || [],
            keywords: keywords || []
        };
        this.saveConfig(config);
        return true;
    },

    removeRoleCondition: function (roleName) {
        const config = this.getConfig();
        if (config.roleConditions && config.roleConditions[roleName]) {
            delete config.roleConditions[roleName];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    addConditionalToRole: function (roleName, conditional) {
        const config = this.getConfig();
        if (!config.roleConditions) config.roleConditions = {};
        if (!config.roleConditions[roleName]) {
            config.roleConditions[roleName] = { conditionals: [], keywords: [] };
        }
        const val = conditional.toLowerCase().trim();
        if (val && !config.roleConditions[roleName].conditionals.includes(val)) {
            config.roleConditions[roleName].conditionals.push(val);
            this.saveConfig(config);
            return true;
        }
        return false;
    },
    setRoleNomenclatureCategory: function (roleName, categoryId) {
        const config = this.getConfig();
        if (!config.roleConditions) config.roleConditions = {};
        if (!config.roleConditions[roleName]) {
            config.roleConditions[roleName] = { conditionals: [], keywords: [] };
        }
        config.roleConditions[roleName].nomenclatureCategory =
            (!categoryId || categoryId === '—') ? null : categoryId;
        this.saveConfig(config);
    },
getRoleNomenclatureCategories: function(roleName) {
    const cond = this.getRoleCondition(roleName);
    if (!cond) return [];
    if (Array.isArray(cond.nomenclatureCategories)) return cond.nomenclatureCategories;
    if (cond.nomenclatureCategory && cond.nomenclatureCategory !== '—')
        return [cond.nomenclatureCategory];
    return [];
},

addRoleNomenclatureCategory: function(roleName, catId) {
    if (!catId || catId === '—') return false;
    const config = this.getConfig();
    if (!config.roleConditions) config.roleConditions = {};
    if (!config.roleConditions[roleName])
        config.roleConditions[roleName] = { conditionals: [], keywords: [] };
    const cats = config.roleConditions[roleName].nomenclatureCategories || [];
    if (cats.includes(catId)) return false;
    cats.push(catId);
    config.roleConditions[roleName].nomenclatureCategories = cats;
    this.saveConfig(config);
    return true;
},

removeRoleNomenclatureCategory: function(roleName, catId) {
    const config = this.getConfig();
    if (!config.roleConditions?.[roleName]) return false;
    const cats = config.roleConditions[roleName].nomenclatureCategories || [];
    const idx  = cats.indexOf(catId);
    if (idx === -1) return false;
    cats.splice(idx, 1);
    config.roleConditions[roleName].nomenclatureCategories = cats;
    this.saveConfig(config);
    return true;
},
    removeConditionalFromRole: function (roleName, conditional) {
        const config = this.getConfig();
        if (config.roleConditions && config.roleConditions[roleName]) {
            const idx = config.roleConditions[roleName].conditionals.indexOf(conditional);
            if (idx > -1) {
                config.roleConditions[roleName].conditionals.splice(idx, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    addKeywordToRoleCondition: function (roleName, keyword) {
        const config = this.getConfig();
        if (!config.roleConditions) config.roleConditions = {};
        if (!config.roleConditions[roleName]) {
            config.roleConditions[roleName] = { conditionals: [], keywords: [] };
        }
        const kw = keyword.toLowerCase().trim();
        if (kw && !config.roleConditions[roleName].keywords.includes(kw)) {
            config.roleConditions[roleName].keywords.push(kw);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    removeKeywordFromRoleCondition: function (roleName, keyword) {
        const config = this.getConfig();
        if (config.roleConditions && config.roleConditions[roleName]) {
            const idx = config.roleConditions[roleName].keywords.indexOf(keyword);
            if (idx > -1) {
                config.roleConditions[roleName].keywords.splice(idx, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // ===============================

    getSpecialties: function () {
        const config = this.getConfig();
        return Array.isArray(config.specialties) ? config.specialties : [];
    },

    getSpecialtyPairById: function (id) {
        return this.getSpecialties().find(p => p.id === id) || null;
    },

    createSpecialtyPair: function(mechanicRole, counterRole) {
    const config = this.getConfig();
    if (!Array.isArray(config.specialties)) config.specialties = [];
    const newPair = {
        id: 'spec_' + Date.now(),
        mechanicRole: mechanicRole || '',
        counterRole:  counterRole  || ''
    };
    config.specialties.unshift(newPair);
    this.saveConfig(config);
    return newPair.id;
},

updateSpecialtyPair: function(id, mechanicRole, counterRole) {
    const config = this.getConfig();
    const pair = (config.specialties || []).find(p => p.id === id);
    if (!pair) return false;
    pair.mechanicRole = mechanicRole;
    pair.counterRole  = counterRole;
    this.saveConfig(config);
    return true;
},

    deleteSpecialtyPair: function (id) {
        const config = this.getConfig();
        if (!Array.isArray(config.specialties)) return false;
        const idx = config.specialties.findIndex(p => p.id === id);
        if (idx > -1) {
            config.specialties.splice(idx, 1);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    updateSpecialtyPairField: function (id, side, field, value) {
        const config = this.getConfig();
        const pair = (config.specialties || []).find(p => p.id === id);
        if (pair && pair[side]) {
            pair[side][field] = value;
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    addKeywordToSpecialtyPair: function (id, side, keyword) {
        const config = this.getConfig();
        const pair = (config.specialties || []).find(p => p.id === id);
        if (pair && pair[side]) {
            const kw = keyword.toLowerCase().trim();
            if (kw && !pair[side].keywords.includes(kw)) {
                pair[side].keywords.push(kw);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    removeKeywordFromSpecialtyPair: function (id, side, keyword) {
        const config = this.getConfig();
        const pair = (config.specialties || []).find(p => p.id === id);
        if (pair && pair[side]) {
            const idx = pair[side].keywords.indexOf(keyword);
            if (idx > -1) {
                pair[side].keywords.splice(idx, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // ===============================

    getStaples: function () {
        return this.getConfig().staples || {};
    },

    getStapleIds: function () {
        return Object.keys(this.getStaples());
    },

    getStaple: function (cardId) {
        return (this.getConfig().staples || {})[String(cardId)] || null;
    },

    isStaple: function (cardId) {
        return this.getStaple(String(cardId)) !== null;
    },

    createStaple: function (cardId, data) {
        const config = this.getConfig();
        if (!config.staples) config.staples = {};
        const id = String(cardId).trim();
        if (!id || config.staples[id]) return false;
        config.staples[id] = {
            id: id,
            name: data.name || '',
            imageUrl: data.imageUrl || `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`,
            type: data.type || ''
        };
        this.saveConfig(config);
        return true;
    },

    deleteStaple: function (cardId) {
        const config = this.getConfig();
        const id = String(cardId);
        if (config.staples && config.staples[id]) {
            delete config.staples[id];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // ===============================

    getNomenclature: function () {
        const config = this.getConfig();
        return config.nomenclature || this.defaultConfig.nomenclature;
    },

    getNomenclatureColors: function () {
        const cats = this.getNomenclature().categories || [];
        const colors = {};
        cats.forEach(c => { colors[c.id] = c.color; });
        return colors;
    },

    updateNomenclatureColor: function (categoryId, color) {
        return this.updateNomenclatureCategory(categoryId, { color: color });
    },

    updateNomenclatureCategory: function (categoryId, updates) {
        const config = this.getConfig();
        if (!config.nomenclature || !config.nomenclature.categories) {
            config.nomenclature = JSON.parse(JSON.stringify(this.defaultConfig.nomenclature));
        }
        const cat = config.nomenclature.categories.find(c => c.id === categoryId);
        if (cat) {
            Object.assign(cat, updates);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    addNomenclatureCategory: function () {
        const config = this.getConfig();
        if (!config.nomenclature || !config.nomenclature.categories) {
            config.nomenclature = JSON.parse(JSON.stringify(this.defaultConfig.nomenclature));
        }
       config.nomenclature.categories.unshift({
            id: 'custom_' + Date.now(),
            name: 'Nueva Categoría',
            color: '#FFFFFF',
            conditions: { startsWith: '', contains: [], notContains: [], endsWith: '.' }
        });
        this.saveConfig(config);
        return true;
    },

    deleteNomenclatureCategory: function (categoryId) {
        const config = this.getConfig();
        if (!config.nomenclature || !config.nomenclature.categories) return false;
        const idx = config.nomenclature.categories.findIndex(c => c.id === categoryId);
        if (idx > -1) {
            config.nomenclature.categories.splice(idx, 1);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    updateNomenclatureCategoryCondition: function (categoryId, conditionField, value) {
        const config = this.getConfig();
        if (!config.nomenclature || !config.nomenclature.categories) return false;
        const cat = config.nomenclature.categories.find(c => c.id === categoryId);
        if (cat && cat.conditions) {
            cat.conditions[conditionField] = value;
            this.saveConfig(config);
            return true;
        }
        return false;
    },
 addNomCondKw: function (categoryId, field, keyword) {
        const config = this.getConfig();
        const cat = (config.nomenclature?.categories || []).find(c => c.id === categoryId);
        if (!cat || !cat.conditions) return false;
        if (!Array.isArray(cat.conditions[field])) {
            cat.conditions[field] = cat.conditions[field]
                ? [String(cat.conditions[field])]
                : [];
        }
        const kw = keyword.trim();
        if (kw && !cat.conditions[field].includes(kw)) {
            cat.conditions[field].push(kw);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

removeNomCondKw: function (categoryId, field, keyword) {
        const config = this.getConfig();
        const cat = (config.nomenclature?.categories || []).find(c => c.id === categoryId);
        if (!cat || !cat.conditions || !Array.isArray(cat.conditions[field])) return false;
        const idx = cat.conditions[field].indexOf(keyword);
        if (idx > -1) {
            cat.conditions[field].splice(idx, 1);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Eliminar por índice — evita bugs con comillas en el onclick
    removeNomCondKwByIndex: function (categoryId, field, index) {
        const config = this.getConfig();
        const cat = (config.nomenclature?.categories || []).find(c => c.id === categoryId);
        if (!cat || !cat.conditions || !Array.isArray(cat.conditions[field])) return false;
        if (index >= 0 && index < cat.conditions[field].length) {
            cat.conditions[field].splice(index, 1);
            this.saveConfig(config);
            return true;
        }
        return false;
    },
// ===============================

getDiminishingReturns: function () {
    const config = this.getConfig();
    return config.diminishingReturns || this.getDefaultDiminishingReturns();
},

getDefaultDiminishingReturns: function () {
    return JSON.parse(JSON.stringify(this.defaultConfig.diminishingReturns));
},

saveDiminishingReturns: function (diminishing) {
    const config = this.getConfig();
    config.diminishingReturns = diminishing;
    return this.saveConfig(config);
},

updateRoleThreshold: function (roleName, threshold) {
    const config = this.getDiminishingReturns();
    config.roleThresholds[roleName] = threshold;
    return this.saveDiminishingReturns(config);
},
getPillars: function() {
    const config = this.getConfig();
    return config.pillars || JSON.parse(JSON.stringify(this.defaultConfig.pillars));
},

addRoleToPillar: function(pillar, role) {
    const config = this.getConfig();
    if (!config.pillars) config.pillars = { consistency: [], power: [], resilience: [] };
    if (!config.pillars[pillar]) config.pillars[pillar] = [];
    if (config.pillars[pillar].includes(role)) return false;
    config.pillars[pillar].push(role);
    this.saveConfig(config);
    return true;
},

removeRoleFromPillar: function(pillar, role) {
    const config = this.getConfig();
    if (!config.pillars?.[pillar]) return false;
    const idx = config.pillars[pillar].indexOf(role);
    if (idx === -1) return false;
    config.pillars[pillar].splice(idx, 1);
    this.saveConfig(config);
    return true;
},
getPillarRPS: function () {
    const config = this.getConfig();
    return config.pillarRPS || JSON.parse(JSON.stringify(this.defaultConfig.pillarRPS));
},

savePillarRPS: function (rps) {
    const config = this.getConfig();
    config.pillarRPS = rps;
    this.saveConfig(config);
},
getShortcuts: function () {
    const config = this.getConfig();
    return config.shortcuts || JSON.parse(JSON.stringify(this.defaultConfig.shortcuts));
},

saveShortcuts: function (shortcuts) {
    const config = this.getConfig();
    config.shortcuts = shortcuts;
    this.saveConfig(config);
},
renderStaplesPanel: function () {
    if (window.Engines && Engines._activeTab === 'staples') {
        Engines._renderSidebar();
        return;
    }
    const panel = document.getElementById('staples-panel');
    const list  = document.getElementById('staples-list');
    if (!panel || !list) return;

    const staples = this.getStaples();
    const cards   = Object.values(staples)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    if (cards.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = '';

    this._staplePanelCards = cards;

    list.innerHTML = cards.map((c, i) => `
        <div class="fav-item" onclick="ConfigManager.showStapleActions(${i}, this)">
            <img src="${c.imageUrl || ''}" class="fav-img" loading="lazy" alt="${c.name}"
                 onerror="this.style.background='#002b4d';this.src='';">
            <div class="fav-info">
                <div class="fav-name">${c.name}</div>
                <div class="fav-type">${c.type || ''}</div>
            </div>
            <button class="fav-remove"
                onclick="event.stopPropagation(); ConfigManager.deleteStaple('${c.id}'); ConfigManager.renderStaplesPanel();"
                title="Quitar staple">✕</button>
        </div>
    `).join('');
},

showStapleActions: function (index, el) {
    document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
    document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));

    const cards = this._staplePanelCards;
    if (!cards) return;

    const overlay = document.createElement('div');
    overlay.className = 'fav-actions-overlay';
    overlay.innerHTML = `
        <button class="card-action-btn btn-view"
            onclick="event.stopPropagation(); ConfigManager.openStapleCard(${index});">Ver</button>
        <button class="card-action-btn btn-add"
            onclick="event.stopPropagation(); ConfigManager.addStapleToDeck(${index});">Añadir</button>
    `;
    el.appendChild(overlay);
    el.classList.add('fav-item-active');
},

openStapleCard: function (index) {
    document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
    document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));
    const c = this._staplePanelCards?.[index];
    if (!c?.id || !window.CardViewer) return;
    // Buscar datos completos en el powerCache o hacer fetch
    const cached = window.Estadisticas?.powerScoreCache?.cards
        ?.find(pc => String(pc.cardId) === String(c.id));
    if (cached?.cardData) {
        CardViewer.open(cached.cardData);
    } else {
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${c.id}`)
            .then(r => r.json())
            .then(d => { if (d.data?.[0]) CardViewer.open(d.data[0]); })
            .catch(() => {});
    }
},

addStapleToDeck: function (index) {
    document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
    document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));
    const c = this._staplePanelCards?.[index];
    if (!c?.id || !window.Deck) return;
    const cached = window.Estadisticas?.powerScoreCache?.cards
        ?.find(pc => String(pc.cardId) === String(c.id));
    if (cached?.cardData) {
        Deck.syncFromViewer(c.id, cached.cardData, 1);
    } else {
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${c.id}`)
            .then(r => r.json())
            .then(d => { if (d.data?.[0]) Deck.syncFromViewer(c.id, d.data[0], 1); })
            .catch(() => {});
    }
},

MUSIC_KEY: 'yugioh_music_config',
PLAYER_LEVEL_KEY: 'yugioh_player_level',

getPlayerLevel: function () {
    return localStorage.getItem(this.PLAYER_LEVEL_KEY) || 'default';
},

savePlayerLevel: function (level) {
    localStorage.setItem(this.PLAYER_LEVEL_KEY, level);
},

defaultMusicConfig: {
    enabled: true,
    volume: 0.40,
    tracks: {
        default:     'ots/Climax Theme 2.mp3',
        novato:      'ots/Climax Theme 5.mp3',
        casual:      'ots/Climax Theme 5.mp3',
        competitivo: 'ots/Climax Theme 5.mp3'
    }
},

getMusicConfig: function () {
    try {
        const saved = JSON.parse(localStorage.getItem(this.MUSIC_KEY));
        if (!saved) return { ...this.defaultMusicConfig };
        return { ...this.defaultMusicConfig, ...saved, tracks: { ...this.defaultMusicConfig.tracks, ...(saved.tracks || {}) } };
    } catch (_) { return { ...this.defaultMusicConfig }; }
},

saveMusicConfig: function (cfg) {
    localStorage.setItem(this.MUSIC_KEY, JSON.stringify(cfg));
},
// ===============================
getMetaLinks: function () {
    const config = this.getConfig();
    return config.metaLinks || JSON.parse(JSON.stringify(this.defaultConfig.metaLinks));
},

saveMetaLinks: function (links) {
    const config = this.getConfig();
    config.metaLinks = links;
    this.saveConfig(config);
},
// ===============================
getMetaMasters: function () {
    const config = this.getConfig();
    return config.metaMasters || JSON.parse(JSON.stringify(this.defaultConfig.metaMasters));
},
saveMetaMasters: function (masters) {
    const config = this.getConfig();
    config.metaMasters = masters;
    this.saveConfig(config);
},
META_FALLBACKS_KEY: 'yugioh_meta_fallbacks',

getMetaFallbacks: function () {
    try {
        return JSON.parse(localStorage.getItem(this.META_FALLBACKS_KEY)) || {};
    } catch (_) { return {}; }
},

saveMetaFallback: function (masterId, dataUrl) {
    try {
        const all = this.getMetaFallbacks();
        if (dataUrl) all[masterId] = dataUrl;
        else delete all[masterId];
        localStorage.setItem(this.META_FALLBACKS_KEY, JSON.stringify(all));
        return true;
    } catch (e) {
        console.error('Error guardando fallback:', e);
        return false;
    }
},

removeMetaFallback: function (masterId) {
    this.saveMetaFallback(masterId, null);
},
// ===============================
getMetaLinks: function () {
    const config = this.getConfig();
    return config.metaLinks || JSON.parse(JSON.stringify(this.defaultConfig.metaLinks));
},
saveMetaLinks: function (links) {
    const config = this.getConfig();
    config.metaLinks = links;
    this.saveConfig(config);
},
FORMACION_FALLBACKS_KEY: 'yugioh_formacion_fallbacks',

getFormacionGames: function () {
    const config = this.getConfig();
    return config.formacionGames || [];
},
saveFormacionGames: function (games) {
    const config = this.getConfig();
    config.formacionGames = games;
    this.saveConfig(config);
},
getFormacionFallbacks: function () {
    try {
        return JSON.parse(localStorage.getItem(this.FORMACION_FALLBACKS_KEY)) || {};
    } catch (_) { return {}; }
},
saveFormacionFallback: function (gameId, dataUrl) {
    try {
        const all = this.getFormacionFallbacks();
        if (dataUrl) all[gameId] = dataUrl;
        else delete all[gameId];
        localStorage.setItem(this.FORMACION_FALLBACKS_KEY, JSON.stringify(all));
        return true;
    } catch (e) {
        console.error('Error guardando fallback:', e);
        return false;
    }
},
// ===============================
getFormacionTopicsConfig: function () {
    const config = this.getConfig();
    return config.formacionTopicsConfig || {};
},
saveFormacionTopicsConfig: function (cfg) {
    const config = this.getConfig();
    config.formacionTopicsConfig = cfg;
    this.saveConfig(config);
},
};

window.ConfigManager = ConfigManager;



// ── Stats — motor de scores: Internal, External, CounterDeck, RPS, DiminishingReturns ──

const Stats = {

    // DESPUÉS:
    calculateDiminishingReturns: function(roleName, count) {
        const config = window.ConfigManager?.getDiminishingReturns?.();
        if (!config || !config.enabled) {
            return count;
        }
        
        const threshold = config.roleThresholds?.[roleName];
        if (!threshold) {
            return Math.sqrt(count);
        }
        
        if (count <= threshold.optimal) {
            return count;
        } else if (count <= threshold.max) {
            // Rendimientos decrecientes entre optimal y max
            const excess = count - threshold.optimal;
            const range = threshold.max - threshold.optimal;
            const factor = 1 - (excess / range) * (1 - threshold.curve);
            return threshold.optimal + (excess * factor);
        } else {
            // Más allá del máximo: curva más agresiva
            const baseValue = threshold.optimal + 
                (threshold.max - threshold.optimal) * threshold.curve;
            const excess = count - threshold.max;
            return baseValue + (excess * threshold.curve * 0.5);
        }
    },

        // ===============================
        calculateInternalScore: function (cards) {
    // Pilares desde Config (usuario configura qué roles aportan a cada uno)
            const pillars = window.ConfigManager?.getPillars?.()
                || { consistency: [], power: [], resilience: [] };

            const consistencyRoles = pillars.consistency.map(r => r.toLowerCase());
            const powerRoles       = pillars.power.map(r => r.toLowerCase());
            const resilienceRoles  = pillars.resilience.map(r => r.toLowerCase());
            const restrictionTerms = ['per turn', 'per duel', 'next turn', 'you can only', 'only once', 'cannot be used'];

    const roleCounters = {};
    const roleWeights  = {};
    let mainCards = 0;
    let totalCards = 0;

    const getRoleWeight = (roleName) => window.ConfigManager?.getRoleWeight?.(roleName) ?? 1.0;

    for (const [, item] of Object.entries(cards)) {
        const loc   = item.location;
        const qty   = item.qty || 1;
        const roles = (item.roles || []).map(r => r.toLowerCase());
        const desc  = (item.data?.desc || '').toLowerCase();

       if (loc === 'main' || loc === 'extra') totalCards += qty;
        if (loc !== 'main') continue;

        mainCards += qty;

        const isRestricted  = restrictionTerms.some(t => desc.includes(t));
        const effectiveQty  = isRestricted ? 1 + (qty - 1) * 0.5 : qty;

        roles.forEach(r => {
            const weight = getRoleWeight(r);
            if (!roleCounters[r]) { roleCounters[r] = 0; roleWeights[r] = weight; }
            roleCounters[r] += effectiveQty;
        });
    }

    // ── Sumar a pilares con rendimientos decrecientes ────────────
    let consistencyScore = 0;
    let powerScore       = 0;
    let resilienceScore  = 0;

    Object.entries(roleCounters).forEach(([role, count]) => {
        const diminishedValue = this.calculateDiminishingReturns(role, count);
        const weight          = roleWeights[role] ?? 1.0;
        const contribution    = diminishedValue * weight;

        if (consistencyRoles.includes(role)) consistencyScore += contribution;
        if (powerRoles.includes(role))       powerScore       += contribution;
        if (resilienceRoles.includes(role))  resilienceScore  += contribution;
    });

    // ── Penalización cruzada (opcional, por rol) ─────────────────
    const dimCfg = window.ConfigManager?.getDiminishingReturns?.();
    if (dimCfg && dimCfg.enabled) {
        Object.entries(roleCounters).forEach(([role, count]) => {
            const threshold = dimCfg.roleThresholds?.[role];
            if (!threshold || !threshold.crossPenalty) return;
            const excess = count - threshold.max;
            if (excess <= 0) return;
            const penalty = excess * threshold.curve * 0.3;
            if (consistencyRoles.includes(role)) { powerScore      -= penalty; resilienceScore -= penalty; }
            if (powerRoles.includes(role))       { consistencyScore -= penalty; resilienceScore -= penalty; }
            if (resilienceRoles.includes(role))  { consistencyScore -= penalty; powerScore      -= penalty; }
        });
    }

    if (mainCards === 0) mainCards = 1;

    // ── Scores absolutos (sin normalización ni ponderación) ──────
    const consistency = Math.max(0, consistencyScore);
    const power       = Math.max(0, powerScore);
    const resilience  = Math.max(0, resilienceScore);

    let penalty = 0;
    if (mainCards > 43) penalty = (mainCards - 43) * 0.5;

    const internalScore = Math.max(0, consistency + power + resilience - penalty);

    return {
        internalScore: parseFloat(internalScore.toFixed(2)),
        consistency:   parseFloat(consistency.toFixed(2)),
        power:         parseFloat(power.toFixed(2)),
        resilience:    parseFloat(resilience.toFixed(2)),
        totalCards,
        mainCards,
        penalty:       parseFloat(penalty.toFixed(2))
    };
},// ===============================
    // ===============================
    getDominantPillar: function (internalResult) {
        const c = parseFloat(internalResult.consistency) || 0;
        const p = parseFloat(internalResult.power)       || 0;
        const r = parseFloat(internalResult.resilience)  || 0;
        if (c === 0 && p === 0 && r === 0) return null;
        if (c >= p && c >= r) return 'consistency';
        if (p >= c && p >= r) return 'power';
        return 'resilience';
    },

    // ===============================
    calculateRPSModifier: function (deckPillar, metaPillar) {
        if (!deckPillar || !metaPillar || deckPillar === metaPillar) {
            return { modifier: 1.0, relation: 'neutral' };
        }
        // Leer ciclo desde Config — permite al usuario reordenarlo
        const rpsRules = window.ConfigManager?.getPillarRPS?.()
            || [['resilience','power'],['power','consistency'],['consistency','resilience']];
        const BEATS = {};
        rpsRules.forEach(([winner, loser]) => { BEATS[winner] = loser; });

        if (BEATS[deckPillar] === metaPillar) return { modifier: 1.25, relation: 'advantage' };
        if (BEATS[metaPillar] === deckPillar) return { modifier: 0.75, relation: 'disadvantage' };
        return { modifier: 1.0, relation: 'neutral' };
    },
        // ===============================
        calculateComponent: function (count, threshold) {
            if (count >= threshold) {
                return 10;
            }
            return (count / threshold) * 10;
        },

        // ===============================
        renderStatsCard: function (stats) {
            // Determinar color del score (verde > 7, amarillo 5-7, rojo < 5)
            let scoreColor = '#00b894';
            if (stats.internalScore < 5) {
                scoreColor = '#d63031';
            } else if (stats.internalScore < 7) {
                scoreColor = '#fdcb6e';
            }

            return `
                <div class="stats-card">
                    <div class="stats-header">
                        <h3>Internal Score</h3>
                        <div class="stats-score" style="color: ${scoreColor}">
                            ${stats.internalScore} / 10
                        </div>
                    </div>
                    
                    <div class="stats-breakdown">
                        <div class="stat-row">
                            <span class="stat-label">Consistencia (50%):</span>
                            <span class="stat-value">${stats.consistency} / 10</span>
                            <span class="stat-count">(${stats.consistencyCount} cartas)</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Potencia (30%):</span>
                            <span class="stat-value">${stats.power} / 10</span>
                            <span class="stat-count">(${stats.powerCount} cartas)</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Resiliencia (20%):</span>
                            <span class="stat-value">${stats.resilience} / 10</span>
                            <span class="stat-count">(${stats.resilienceCount} cartas)</span>
                        </div>
                    </div>

                    <div class="stats-footer">
                        <div class="stat-info">
                            <span>Total de cartas: ${stats.totalCards}</span>
                        </div>
                        ${stats.penalty > 0 ? `
                            <div class="stat-penalty">
                                ⚠️ Penalización por exceso: -${stats.penalty}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        },

        // ===============================
        getDeckStats: function (deckCards) {
            if (!deckCards || Object.keys(deckCards).length === 0) {
                return null;
            }

            return this.calculateInternalScore(deckCards);
        },
    // ===============================
    calculateCounterDeckScore: function (cards, powerData) {
        // powerData = powerScoreCache de Estadisticas (puede ser null)
        const powerMap = {};
        if (powerData && powerData.cards) {
            powerData.cards.forEach(pc => { powerMap[String(pc.cardId)] = pc; });
        }
        const hasPowerData = Object.keys(powerMap).length > 0;

        let rawCounter    = 0;
        let brickCount    = 0;
        let totalCards    = 0;
        let counterCards  = 0;
        const breakdown   = [];

        for (const [id, item] of Object.entries(cards)) {
            if (item.location !== 'main' && item.location !== 'extra') continue;
            const qty   = item.qty || 1;
            const roles = (item.roles || []).map(r => r.toLowerCase());
            totalCards += qty;

            if (roles.includes('brick')) {
                brickCount += qty;
                continue;
            }

            const cached = powerMap[String(id)];

            if (cached && cached.isCounter && cached.counterBonus > 0) {
                const contrib = cached.counterBonus * qty;
                rawCounter   += contrib;
                counterCards += qty;
                breakdown.push({
                    name:    cached.cardData?.name || id,
                    bonus:   cached.counterBonus,
                    qty,
                    contrib
                });
            } else if (!cached && window.SpecialtyAnalyzer && item.data) {
                // Fallback sin cache: detección binaria
                const analysis = SpecialtyAnalyzer.analyzeCard(item.data);
                if (analysis.counters && analysis.counters.length > 0) {
                    const contrib = 5 * qty;
                    rawCounter   += contrib;
                    counterCards += qty;
                    breakdown.push({
                        name:    item.data.name || id,
                        bonus:   5,
                        qty,
                        contrib,
                        estimated: true
                    });
                }
            }
        }

        // Penalización por Bricks: proporcional a su presencia en el deck
        const brickRatio   = totalCards > 0 ? brickCount / totalCards : 0;
        const brickPenalty = Math.round(rawCounter * brickRatio * 0.6);
        const finalScore   = Math.max(0, rawCounter - brickPenalty);

        // Nivel descriptivo
        let level, levelColor;
    if (finalScore === 0)       { level = 'Sin capacidad Anti-META';  levelColor = '#636e72'; }
        else if (finalScore <= 30)  { level = 'Anti-META Bajo';           levelColor = '#fdcb6e'; }
        else if (finalScore <= 70)  { level = 'Anti-META Medio';          levelColor = '#0066cc'; }
        else if (finalScore <= 120) { level = 'Anti-META Alto';           levelColor = '#00b894'; }
        else                        { level = '⚡ Anti-META Élite';        levelColor = '#ffd700'; }                    { level = 'Meta Counter';  levelColor = '#ffd700'; }

        return {
            finalScore,
            rawCounter,
            brickPenalty,
            brickCount,
            counterCards,
            totalCards,
            breakdown: breakdown.sort((a, b) => b.contrib - a.contrib),
            level,
            levelColor,
            hasPowerData
        };
    },
    // ===============================
    calculateExternalScore: function (deckCards, powerScoreCache, metaDecks) {
        const result = {
            externalScore:    null,
            deckSpecs:        [],
            threatCards:      [],
            counterDecks:     [],
            missingStaples:   [],
            hasPowerData:     false,
            hasSpecData:      false,
            baseline:         null,
            totalThreat:      0,
            threatPct:        0
        };

if (window.SpecialtyAnalyzer) {
    const pairs     = ConfigManager.getSpecialties();
    const specCount = {};

    for (const [, item] of Object.entries(deckCards)) {
        if (!item.data) continue;
        const cardRoles = (item.roles || []).map(r => r.toLowerCase());

        // Método 1: keywords (pares con estructura antigua — defaultConfig)
        const analysis = SpecialtyAnalyzer.analyzeCard(item.data);
        (analysis.specializations || []).forEach(s => {
            specCount[s.name] = (specCount[s.name] || 0) + (item.qty || 1);
        });

        pairs.forEach(pair => {
            if (!pair.mechanicRole) return;
            const pairRoleLower = pair.mechanicRole.toLowerCase();
            if (cardRoles.includes(pairRoleLower)) {
                const label = pair.mechanicRole;
                specCount[label] = (specCount[label] || 0) + (item.qty || 1);
            }
        });
    }

    result.deckSpecs = Object.entries(specCount)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
    result.hasSpecData = result.deckSpecs.length > 0;
}

if (powerScoreCache && powerScoreCache.cards) {
    result.hasPowerData = true;
    const deckSpecNames = new Set(result.deckSpecs.map(s => s.name));
    const pairs         = ConfigManager.getSpecialties();

    // Roles del deck activo (para cruzar con counterRole de pares nuevos)
    const deckRoles = new Set();
    for (const [, item] of Object.entries(deckCards)) {
        (item.roles || []).forEach(r => deckRoles.add(r.toLowerCase()));
    }

    powerScoreCache.cards.forEach(card => {
        const overlap = [];

        if (card.isCounter && card.counterBonus > 0) {
            const countersSpecs = (card.specAnalysis?.counters || [])
                .map(c => c.countersSpec).filter(Boolean);
            countersSpecs.filter(s => deckSpecNames.has(s))
                .forEach(s => overlap.push(s));
        }

        // Método 2: roles — pares nuevos {mechanicRole, counterRole}
        const cardRoles = (card.detectedRoles || []).map(r => r.toLowerCase());
        pairs.forEach(pair => {
            if (!pair.counterRole || !pair.mechanicRole) return;
            const counterRoleLower  = pair.counterRole.toLowerCase();
            const mechanicRoleLower = pair.mechanicRole.toLowerCase();
            if (cardRoles.includes(counterRoleLower) && deckRoles.has(mechanicRoleLower)) {
                const label = pair.mechanicRole;
                if (!overlap.includes(label)) overlap.push(label);
            }
        });

        if (overlap.length > 0) {
            const counterBonus = card.counterBonus || 0;
            result.threatCards.push({
                cardId:       card.cardId,
                name:         card.cardData?.name || String(card.cardId),
                presencePct:  card.presencePct,
                counterBonus,
                countersSpecs: overlap,
                specAnalysis:  card.specAnalysis,
                threatLevel:   Math.round(counterBonus * (card.presencePct / 100))
            });
        }
    });

    result.threatCards.sort((a, b) => b.threatLevel - a.threatLevel);
}

        if (result.hasPowerData && result.hasSpecData) {
            const maxTheoreticalThreat = (powerScoreCache.cards || [])
                .filter(c => c.isCounter && c.counterBonus > 0)
                .reduce((sum, c) => sum + c.counterBonus, 0);

            if (maxTheoreticalThreat === 0) {
                result.externalScore = null;
            } else {
                const totalThreat = result.threatCards.reduce((s, c) => s + c.threatLevel, 0);
                result.externalScore = parseFloat(
                    Math.max(0, (1 - Math.min(1, totalThreat / maxTheoreticalThreat)) * 10).toFixed(1)
                );
                result.baseline    = maxTheoreticalThreat;
                result.totalThreat = totalThreat;
                result.threatPct   = Math.round((totalThreat / maxTheoreticalThreat) * 100);
            }

        }else if (result.hasPowerData) {
            result.externalScore = 0;
        }

        if (result.threatCards.length > 0 && metaDecks) {
            const threatIds = new Set(result.threatCards.map(c => String(c.cardId)));
            const allDecks  = [];

            for (const [folder, decks] of Object.entries(metaDecks)) {
                (decks || []).forEach(deck => {
                    if (!deck.cardFrequency) return;
                    let unique = 0, copies = 0;
                    Object.entries(deck.cardFrequency).forEach(([id, qty]) => {
                        if (threatIds.has(String(id))) { unique++; copies += qty; }
                    });
                    if (unique > 0) {
                        allDecks.push({
                            name: deck.filename, folder,
                            unique, copies,
                            score: unique * 3 + copies
                        });
                    }
                });
            }
            allDecks.sort((a, b) => b.score - a.score);
            result.counterDecks = allDecks.slice(0, 5);
        }

        if (window.ConfigManager) {
            try {
                const staples  = ConfigManager.getStaples() || {};
                const deckIds  = new Set(Object.keys(deckCards).map(String));

                // Specs de las cartas que ME amenazan (mecánicas del oponente)
                const threatEnemySpecs = new Set();
                result.threatCards.forEach(tc => {
                    (tc.specAnalysis?.specializations || []).forEach(s => {
                        threatEnemySpecs.add(s.name);
                    });
                });

                Object.values(staples).forEach(staple => {
                    if (!staple || !staple.id) return;
                    if (deckIds.has(String(staple.id))) return;

                    // ¿Esta staple hace counter a alguna mecánica de las cartas que me amenazan?
                    let isCounterOfThreat = false;
                    if (powerScoreCache) {
                        const cached = powerScoreCache.cards?.find(
                            c => String(c.cardId) === String(staple.id)
                        );
                        if (cached?.isCounter) {
                            const countersSpecs = (cached.specAnalysis?.counters || [])
                                .map(c => c.countersSpec);
                            isCounterOfThreat = countersSpecs.some(s => threatEnemySpecs.has(s));
                        }
                    }

                    result.missingStaples.push({
                        cardId:           staple.id,
                        name:             staple.name,
                        type:             staple.type || '',
                        isCounterOfThreat
                    });
                });

                result.missingStaples.sort((a, b) =>
                    (b.isCounterOfThreat ? 1 : 0) - (a.isCounterOfThreat ? 1 : 0)
                );
            } catch (e) {
                console.warn('[ExternalScore] Staples error:', e);
            }
        }

        return result;
    },
    // ===============================
    calculateEncounterRate: function (cardId, powerScoreCache, metaDecks) {
        // avgCopies del meta para esta carta
        let totalCopies = 0;
        let deckCount   = 0;
        let totalMainSizes = 0;
        let decksWith = 0;

        for (const decks of Object.values(metaDecks || {})) {
            for (const deck of decks) {
                if (!deck.cardFrequency) continue;
                const deckTotal = Object.values(deck.cardFrequency)
                    .reduce((s, c) => s + c, 0);
                totalMainSizes += deckTotal;
                deckCount++;

                const copies = deck.cardFrequency[String(cardId)] || 0;
                if (copies > 0) {
                    totalCopies += copies;
                    decksWith++;
                }
            }
        }

        if (deckCount === 0 || decksWith === 0) return null;

        const avgCopies   = totalCopies / decksWith;
        const avgDeckSize = totalMainSizes / deckCount;
        const presencePct = decksWith / deckCount;

        // P = 1 - C(deckSize-copies, 5) / C(deckSize, 5)
        const hypergeometric = (N, K, n) => {
            // P(X=0) = C(N-K,n) / C(N,n)
            const comb = (a, b) => {
                if (b > a) return 0;
                let r = 1;
                for (let i = 0; i < b; i++) {
                    r = r * (a - i) / (i + 1);
                }
                return r;
            };
            return comb(N - K, n) / comb(N, n);
        };

        const deckSize   = Math.round(avgDeckSize);
        const copies     = Math.min(Math.round(avgCopies), deckSize);
        const pZero      = hypergeometric(deckSize, copies, 5);
        const pAtLeastOne = 1 - pZero;

        // Probabilidad ajustada: solo si el oponente lleva ese deck
        const pAdjusted = pAtLeastOne * presencePct;

        // En 10 duelos esperados, cuántas veces verás esta carta en mano inicial del oponente
        const encountersIn10 = parseFloat((pAdjusted * 10).toFixed(2));

        return {
            avgCopies:      parseFloat(avgCopies.toFixed(2)),
            avgDeckSize:    Math.round(avgDeckSize),
            presencePct:    Math.round(presencePct * 100),
            pAtLeastOne:    Math.round(pAtLeastOne * 100),
            pAdjusted:      Math.round(pAdjusted * 100),
            encountersIn10
        };
    }
    };

    window.Stats = Stats;



// ── SpecialtyAnalyzer — detección de mecánicas en cartas/decks para External Score ──

const SpecialtyAnalyzer = {

    // Detección interna de roles desde descripción (sin depender de Deck)
    _detectRoles: function(card) {
        if (!window.ConfigManager) return [];
        const desc = (card.desc || '').toLowerCase();
        const type = (card.type || '').toLowerCase();
        if (type.includes('normal monster')) return [];

        const config         = ConfigManager.getConfig();
        const roleConditions = config.roleConditions || {};
        const roleKeywords   = config.roles          || {};
        const roles          = [];

        for (const [roleName, keywords] of Object.entries(roleKeywords)) {
            let shouldAssign = false;
            if (roleConditions[roleName]) {
                const cond         = roleConditions[roleName];
                const conditionals = cond.conditionals || [];
                const condKws      = cond.keywords     || [];
                let allMet = true;
                if (conditionals.length > 0) {
                    for (const c of conditionals) {
                        if (!c || !desc.includes(c.toLowerCase())) { allMet = false; break; }
                    }
                }
                if (allMet) {
                    for (const kw of condKws) {
                        if (kw && desc.includes(kw.toLowerCase())) { shouldAssign = true; break; }
                    }
                }
            } else {
                for (const kw of keywords) {
                    if (kw && desc.includes(kw.toLowerCase())) { shouldAssign = true; break; }
                }
            }
            if (shouldAssign && !roles.includes(roleName)) roles.push(roleName);
        }
        return roles;
    },

    // Analiza una carta: usa roles pre-asignados o los auto-detecta
    analyzeCard: function(card) {
        const pairs = window.ConfigManager ? ConfigManager.getSpecialties() : [];

        const roles = (card.roles && card.roles.length > 0)
            ? card.roles
            : this._detectRoles(card);

        const rolesLower = roles.map(r => r.toLowerCase());
        const result = { specializations: [], counters: [] };

        pairs.forEach(pair => {
            const mechRole = (pair.mechanicRole || '').toLowerCase().trim();
            const ctrRole  = (pair.counterRole  || '').toLowerCase().trim();

            if (mechRole && rolesLower.includes(mechRole)) {
                result.specializations.push({
                    pairId:      pair.id,
                    name:        pair.mechanicRole,
                    rol:         pair.mechanicRole,
                    counterName: pair.counterRole,
                    matchedKw:   pair.mechanicRole
                });
            }

            if (ctrRole && rolesLower.includes(ctrRole)) {
                result.counters.push({
                    pairId:       pair.id,
                    name:         pair.counterRole,
                    rol:          pair.counterRole,
                    countersSpec: pair.mechanicRole,
                    matchedKw:    pair.counterRole
                });
            }
        });

        return result;
    },

    // Analiza deck completo
    analyzeDeck: function(cards) {
        const deckSpecs    = {};
        const deckCounters = {};

        for (const [id, item] of Object.entries(cards)) {
            if (item.location !== 'main' && item.location !== 'extra') continue;
            const qty      = item.qty || 1;
            const cardData = item.data || item;
            const cardWithRoles = item.roles
                ? { ...cardData, roles: item.roles }
                : cardData;

            const analysis = this.analyzeCard(cardWithRoles);

            (analysis.specializations || []).forEach(spec => {
                if (!deckSpecs[spec.name]) {
                    deckSpecs[spec.name] = { count: 0, cardIds: [], counterName: spec.counterName, pairId: spec.pairId };
                }
                deckSpecs[spec.name].count += qty;
                if (!deckSpecs[spec.name].cardIds.includes(id)) deckSpecs[spec.name].cardIds.push(id);
            });

            (analysis.counters || []).forEach(ctr => {
                if (!deckCounters[ctr.name]) {
                    deckCounters[ctr.name] = { count: 0, cardIds: [], countersSpec: ctr.countersSpec, pairId: ctr.pairId };
                }
                deckCounters[ctr.name].count += qty;
                if (!deckCounters[ctr.name].cardIds.includes(id)) deckCounters[ctr.name].cardIds.push(id);
            });
        }

        return { specializations: deckSpecs, counters: deckCounters };
    },

    getPrimarySpecialization: function(deckAnalysis) {
        if (!deckAnalysis || !deckAnalysis.specializations) return null;
        let max = 0, primary = null;
        for (const [name, data] of Object.entries(deckAnalysis.specializations)) {
            if (data.count > max) { max = data.count; primary = { name, count: data.count, counterName: data.counterName }; }
        }
        return primary;
    },

    cardCountersCard: function() { return 0; },

    renderDeckSpecializations: function(deckAnalysis) {
        if (!deckAnalysis || !deckAnalysis.specializations) {
            return '<p class="stats-empty">Sin especializaciones detectadas</p>';
        }
        let html = '<div class="specializations-list">';
        Object.entries(deckAnalysis.specializations)
            .sort((a, b) => b[1].count - a[1].count)
            .forEach(([name, data]) => {
                html += `<div class="specialization-item">
                    <div class="spec-name">${name}</div>
                    <div class="spec-count">${data.count} cartas</div>
                    <div class="spec-counter-ref">Counter: ${data.counterName || '-'}</div>
                </div>`;
            });
        html += '</div>';
        return html;
    }
};

window.SpecialtyAnalyzer = SpecialtyAnalyzer;



// ── NomenclatureAnalyzer — segmentación del efecto por categorías para highlight en CardViewer ──

const NomenclatureAnalyzer = {

    // ===============================

   analyzeCard: function (card) {
    if (!card || !card.desc) return null;
    const nomenclature = window.ConfigManager.getNomenclature();
    const categories   = nomenclature.categories || [];
    const result       = [];

    categories.forEach(cat => {
        const delimiter = this._getCategoryDelimiter(cat);
        const segments  = this.splitIntoParagraphs(card.desc, delimiter);

        segments.forEach(seg => {
            // Evitar duplicar segmentos ya capturados por otra categoría
            const alreadyCaptured = result.find(r => r.text === seg && r.category !== null);
            if (alreadyCaptured) return;

            if (this.matchesConditions(seg, cat.conditions)) {
                // Si ya existe sin categoría, actualizar
                const existing = result.find(r => r.text === seg);
                if (existing) {
                    existing.category = cat.id;
                    existing.name     = cat.name;
                    existing.color    = cat.color;
                } else {
                    result.push({ text: seg, category: cat.id, name: cat.name, color: cat.color });
                }
            } else if (!result.find(r => r.text === seg)) {
                result.push({ text: seg, category: null, name: null, color: null });
            }
        });
    });

    return result;
},

    // ===============================

    detectCategory: function (paragraph, categories) {
        for (const cat of categories) {
            if (this.matchesConditions(paragraph, cat.conditions)) {
                return cat;
            }
        }
        return null;
    },

    matchesConditions: function (paragraph, conditions) {
        if (!conditions) return false;
        const p = paragraph.toLowerCase().trim();

        // startsWith — array: AL MENOS UNA debe cumplirse
        const swArr = Array.isArray(conditions.startsWith)
            ? conditions.startsWith
            : (conditions.startsWith ? [conditions.startsWith] : []);
        if (swArr.length > 0) {
            const ok = swArr.some(sw => sw && p.startsWith(sw.toLowerCase().trim()));
            if (!ok) return false;
        }

        // contains — array: AL MENOS UNA debe cumplirse
        const cArr = Array.isArray(conditions.contains)
            ? conditions.contains
            : (conditions.contains ? [conditions.contains] : []);
        if (cArr.length > 0) {
            const ok = cArr.some(kw => kw && p.includes(kw.toLowerCase().trim()));
            if (!ok) return false;
        }

        // notContains — array: NINGUNA debe cumplirse
        const ncArr = Array.isArray(conditions.notContains)
            ? conditions.notContains
            : (conditions.notContains ? [conditions.notContains] : []);
        if (ncArr.length > 0) {
            const fail = ncArr.some(kw => kw && p.includes(kw.toLowerCase().trim()));
            if (fail) return false;
        }

        // endsWith — array: AL MENOS UNA debe cumplirse
        const ewArr = Array.isArray(conditions.endsWith)
            ? conditions.endsWith
            : (conditions.endsWith ? [conditions.endsWith] : []);
        if (ewArr.length > 0) {
            const ok = ewArr.some(ew => ew && p.endsWith(ew.toLowerCase().trim()));
            if (!ok) return false;
        }

        return true;
    },

// Si se pasa un delimiter, divide por él.
splitIntoParagraphs: function (text, delimiter) {
    if (!text) return [];
    const normalized = text.replace(/\r\n/g, '\n').replace(/\n+/g, ' ').trim();
    if (!delimiter) return [normalized];
    const parts = normalized.split(delimiter);
    return parts.map(p => p.trim()).filter(p => p.length > 0);
},

// Si no tiene ningún delimitador configurado, usa null (bloque completo).
_getCategoryDelimiter: function (cat) {
    const ew = cat.conditions?.endsWith;
    if (!ew) return null;
    const chars = (Array.isArray(ew) ? ew : [ew])
        .map(c => c.trim())
        .filter(Boolean);
    if (chars.length === 0) return null;
    return new RegExp(`(?<=[${chars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')}])\\s*`);
},

    // ===============================

    hasNomenclatureData: function (analysis) {
        return Array.isArray(analysis) && analysis.some(p => p.category !== null);
    },

    // Obtener resumen de categorías presentes
    getSummary: function (analysis) {
        if (!Array.isArray(analysis)) return {};
        const summary = {};
        analysis.forEach(p => {
            if (p.category) {
                if (!summary[p.category]) summary[p.category] = { name: p.name, count: 0 };
                summary[p.category].count++;
            }
        });
        return summary;
    }
};

window.NomenclatureAnalyzer = NomenclatureAnalyzer;