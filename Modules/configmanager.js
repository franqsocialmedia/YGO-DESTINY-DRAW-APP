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
            }
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
        }
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
                try {
                    const config = JSON.parse(e.target.result);
                    if (!config.roles || typeof config.roles !== 'object') {
                        reject('Archivo de configuración inválido');
                        return;
                    }
                    this.saveConfig(config);
                    resolve(true);
                } catch (err) {
                    console.error('Error parseando configuración:', err);
                    reject('Error al leer el archivo de configuración');
                }
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

   createRole: function (roleName) {
        const config = this.getConfig();
        const name = roleName.trim();
        if (name && config.roles[name] === undefined) {
            config.roles[name] = [];
            // Peso por defecto al crear
            if (!config.roleWeights) config.roleWeights = {};
            config.roleWeights[name] = 1.0;
            this.saveConfig(config);
            return true;
        }
        return false;
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

    createSpecialtyPair: function (specName, specRol, counterName, counterRol) {
        const config = this.getConfig();
        if (!Array.isArray(config.specialties)) config.specialties = [];
        const newPair = {
            id: 'spec_' + Date.now(),
            specialization: {
                name: specName || 'Nueva Mecánica',
                rol: specRol || '',
                keywords: []
            },
            counter: {
                name: counterName || 'Nuevo Counter',
                rol: counterRol || '',
                keywords: []
            }
        };
        config.specialties.push(newPair);
        this.saveConfig(config);
        return newPair.id;
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
        config.nomenclature.categories.push({
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
}
};

window.ConfigManager = ConfigManager;