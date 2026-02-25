/* ====================================
   CONFIG MANAGER - Destiny Draw
   Versión Unificada CORRECTA
   ==================================== */

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

        // ⭐ NOMENCLATURA - Compatible con cardviewer.js y nomenclature-analyzer.js
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
        // Ciclo RPS: cada pilar vence al siguiente en la lista (circular)
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

        // ⭐ META LINKS - Fuentes externas de la pestaña Meta
        metaLinks: [
            { id: 'ml_1', title: 'Road of the King – Master Duel',      url: 'https://roadoftheking.com/tag/master-duel/',              desc: 'Análisis y reportes del meta de Master Duel' },
            { id: 'ml_2', title: 'Road of the King – OCG Weekly',       url: 'https://roadoftheking.com/tag/ocg-metagame-weekly/',      desc: 'Reportes semanales del meta OCG' },
            { id: 'ml_3', title: 'YGOProDeck',                          url: 'https://ygoprodeck.com/',                                desc: 'Base de datos y decklists de la comunidad' },
            { id: 'ml_4', title: 'Wiki Yu-Gi-Oh! (ES)',                 url: 'https://yugioh.fandom.com/es/wiki/Mago_Oscuro',          desc: 'Wiki en español de Yu-Gi-Oh!' },
            { id: 'ml_5', title: 'Master Duel Meta – Tier List',        url: 'https://www.masterduelmeta.com/tier-list#power-rankings', desc: 'Tier list y power rankings de Master Duel' },
            { id: 'ml_6', title: 'YugiohMeta – Tier List',             url: 'https://www.yugiohmeta.com/tier-list',                   desc: 'Tier list TCG competitivo actualizada' }
        ],
        shortcuts: [
            { label: 'Decks Guardados', tab: 'mideck',       sectionId: 'saved-decks-sec',  module: 'Deck' },
            { label: 'Winrate',          tab: 'estadisticas', sectionId: 'winrate-sec',       module: 'Estadisticas' },
            { label: 'Staples',          tab: 'config',       sectionId: 'staples-section',   module: 'Config' },
            { label: 'Buscador',         tab: 'buscador',     sectionId: null,                module: null }
        ]
    },
    

    // ===============================
    // CORE: CARGAR / GUARDAR
    // ===============================

    getConfig: function () {
        try {
            const saved = localStorage.getItem('yugioh_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Migración: specialties objeto -> array de pares
                if (parsed.specialties && !Array.isArray(parsed.specialties)) {
                    console.log('Migrando specialties de objeto a array');
                    parsed.specialties = JSON.parse(JSON.stringify(this.defaultConfig.specialties));
                }
                
                // Migración: staples con campos legacy -> estructura simplificada
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
                
                // Migración: nomenclature OLD estructura -> NUEVA
                if (parsed.nomenclature) {
                    // Si tiene la estructura OLD (con efectSpeed, effectType como objetos)
                    if (!parsed.nomenclature.categories && (parsed.nomenclature.effectSpeed || parsed.nomenclature.effectType)) {
                        console.log('Migrando nomenclature OLD a NUEVA estructura');
                        parsed.nomenclature = JSON.parse(JSON.stringify(this.defaultConfig.nomenclature));
                    }
                }
                // Migración: contains/notContains de string a array
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
                // Migración: specialty formato antiguo (con specialization.keywords) → nuevo (solo roles)
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
            const config = this.getConfig();
            const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'destiny_draw_config.txt';
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
            const dataUrl   = e.target.result;
            const masterId  = `mm_${i}`;
            const urlInput  = document.getElementById(`mm-fallback-${i}`);
            // Guardar en clave separada
            const ok = ConfigManager.saveMetaFallback(masterId, dataUrl);
            if (!ok) {
                alert('No se pudo guardar la imagen (almacenamiento lleno). Usa una URL externa.');
                return;
            }
            // En el input guardar solo una referencia, no el base64
            if (urlInput) urlInput.value = `local:${masterId}`;
            const btn = document.getElementById(`mm-fallback-file-${i}`)
                ?.previousElementSibling?.querySelector?.('.meta-master-file-btn')
                || document.querySelector(`#meta-master-item-${i} .meta-master-file-btn`);
            if (btn) btn.textContent = `✔ ${file.name}`;
        };
            reader.onerror = () => reject('Error al leer el archivo');
            reader.readAsText(file);
        });
    },

    // ===============================
    // ROLES
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
    // Insertar al inicio reconstruyendo el objeto
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

    // Insertar al inicio
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
    // ROLE CONDITIONS
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
        // null o '—' = sin filtro (busca en todo el efecto)
        config.roleConditions[roleName].nomenclatureCategory =
            (!categoryId || categoryId === '—') ? null : categoryId;
        this.saveConfig(config);
    },
getRoleNomenclatureCategories: function(roleName) {
    const cond = this.getRoleCondition(roleName);
    if (!cond) return [];
    if (Array.isArray(cond.nomenclatureCategories)) return cond.nomenclatureCategories;
    // Backward compat: single value → array
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
    // SPECIALTIES (pares)
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
    // STAPLES
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
    // NOMENCLATURA (Compatible con cardviewer y nomenclature-analyzer)
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
        // Migrar strings sueltos heredados a array
        if (!Array.isArray(cat.conditions[field])) {
            cat.conditions[field] = cat.conditions[field]
                ? [String(cat.conditions[field])]
                : [];
        }
        const kw = keyword.trim();  // no forzar lowercase para preservar exactitud
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
// RENDIMIENTOS DECRECIENTES
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

    // Guardar para índice igual que Favoritas
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

// ===============================
// MÚSICA CONFIG
// ===============================
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
        // Merge tracks para no perder defaults si faltan claves
        return { ...this.defaultMusicConfig, ...saved, tracks: { ...this.defaultMusicConfig.tracks, ...(saved.tracks || {}) } };
    } catch (_) { return { ...this.defaultMusicConfig }; }
},

saveMusicConfig: function (cfg) {
    localStorage.setItem(this.MUSIC_KEY, JSON.stringify(cfg));
},
// ===============================
// META LINKS
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
// META MASTERS
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
// Fallbacks se guardan aparte para no saturar yugioh_config
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
// META LINKS
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
};

window.ConfigManager = ConfigManager;