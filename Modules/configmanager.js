/* ====================================
   CONFIG MANAGER
   Destiny Draw - Yu-Gi-Oh! App
   Gestor centralizado de configuración
   ==================================== */

const ConfigManager = {

    // Configuración por defecto
    defaultConfig: {
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
        
        // NUEVO: Sistema de Especialidades (Paso 1)
        // Estructura: keyword -> { cardLevel, deckLevel, linkedRole, counters, counteredBy }
        specialties: {
            "return": {
                cardLevel: "Recycle",
                deckLevel: "Bounce",
                linkedRole: "Recovery",
                counters: ["spell-negate"],
                counteredBy: ["anti-spell"]
            },
            "negate": {
                cardLevel: "Negation",
                deckLevel: "Control",
                linkedRole: "Negater",
                counters: ["effect-activation"],
                counteredBy: ["spell-negate"]
            },
            "destroy": {
                cardLevel: "Removal",
                deckLevel: "Destruction",
                linkedRole: "Boardbreaker",
                counters: ["monster-effect", "backrow"],
                counteredBy: ["destruction-protection"]
            },
            "banish": {
                cardLevel: "Banish",
                deckLevel: "Exile",
                linkedRole: "Banisher",
                counters: ["graveyard-effect"],
                counteredBy: ["banish-protection"]
            },
            "search": {
                cardLevel: "Search",
                deckLevel: "Consistency",
                linkedRole: "Searcher",
                counters: [],
                counteredBy: ["search-lock"]
            },
            "draw": {
                cardLevel: "Draw",
                deckLevel: "Card Advantage",
                linkedRole: "Draw-Engine",
                counters: [],
                counteredBy: ["hand-limit"]
            }
        },
        
        // NUEVO: Roles Compuestos con Condicionales (Preparado para Paso 3)
        roleConditions: {
            "Handtrap": {
                conditionals: [],  // Vacío = sin condicionales
                keywords: ["from your hand", "from the hand", "from their hand"]
            },
            "Disruption": {
                conditionals: ["quick-effect", "during either player"],
                keywords: ["negate", "destroy"]
            }
        },

        // NUEVO: Lista de Staples (Paso 2)
        // Cartas genéricas que se usan en múltiples decks
        // Estructura: id -> { id, name, roles, specialtyKeywords, notes }
        staples: {
            "83764718": {
                id: "83764718",
                name: "Renace al monstruo",
                nameEn: "Monster Reborn",
                roles: ["Recovery", "Extender"],
                specialtyKeywords: ["special summon", "from the graveyard"],
                notes: "Staple universal de recuperación"
            },
            "5318639": {
                id: "5318639",
                name: "Tifón Místico Espacial",
                nameEn: "Mystical Space Typhoon",
                roles: ["Backrow-Removal"],
                specialtyKeywords: ["destroy", "spell", "trap"],
                notes: "Remoción de backrow estándar"
            },
            "44095762": {
                id: "44095762",
                name: "Fuerza del Espejo",
                nameEn: "Mirror Force",
                roles: ["Boardbreaker", "Disruption"],
                specialtyKeywords: ["destroy all", "attack position"],
                notes: "Trampa de remoción masiva"
            }
        },

        // NUEVO: Sistema de Nomenclatura (Paso 4)
        // Análisis de estructura de efectos de cartas
        nomenclature: {
            effectSpeed: {
                "Quick Effect": ["quick effect", "(quick effect)"],
                "Trigger": ["when", "if"],
                "Ignition": ["activate", "use"]
            },
            effectType: {
                "Targeting": ["target"],
                "Non-Targeting": ["choose", "select without targeting"]
            },
            timing: {
                "On Summon": ["when this card is summoned", "if this card is summoned"],
                "On Activation": ["when this card is activated"],
                "During Battle": ["during the battle phase", "during damage calculation"],
                "End Phase": ["during the end phase", "at the end phase"]
            },
            requirements: [
                "if you control",
                "if your opponent",
                "if you have",
                "only if"
            ],
            conditions: [
                "while",
                "during",
                "as long as"
            ],
            cost: [
                "discard",
                "banish",
                "tribute",
                "pay",
                "detach",
                "send"
            ],
            effects: {
                "Destruction": ["destroy"],
                "Negation": ["negate"],
                "Banish": ["banish"],
                "Special Summon": ["special summon"],
                "Search": ["add", "search"],
                "Draw": ["draw"],
                "Burn": ["inflict damage"],
                "Gain": ["gain"]
            },
            duration: {
                "Until End Phase": ["until the end of this turn", "until the end phase"],
                "Permanent": ["cannot", "must always"],
                "Once While Face-up": ["once while face-up", "once while this card"]
            },
            restrictions: {
                "Once Per Turn": ["once per turn", "only once per turn"],
                "Hard Once Per Turn": ["you can only", "only once that turn"],
                "Cannot Summon": ["you cannot summon", "you cannot special summon"],
                "Cannot Activate": ["you cannot activate"]
            }
        }
    },

    // Obtener configuración actual
    getConfig: function () {
        try {
            const saved = localStorage.getItem('yugioh_config');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (err) {
            console.error('Error cargando configuración:', err);
        }
        return JSON.parse(JSON.stringify(this.defaultConfig));
    },

    // Guardar configuración
    saveConfig: function (config) {
        try {
            localStorage.setItem('yugioh_config', JSON.stringify(config));
            return true;
        } catch (err) {
            console.error('Error guardando configuración:', err);
            return false;
        }
    },

    // Obtener solo los roles
    getRoles: function () {
        const config = this.getConfig();
        return config.roles || {};
    },

    // Obtener lista de nombres de roles
    getRoleNames: function () {
        return Object.keys(this.getRoles());
    },

    // Obtener palabras clave de un rol específico
    getRoleKeywords: function (roleName) {
        const roles = this.getRoles();
        return roles[roleName] || [];
    },

    // Agregar palabra clave a un rol
    addKeywordToRole: function (roleName, keyword) {
        const config = this.getConfig();
        if (!config.roles[roleName]) {
            config.roles[roleName] = [];
        }
        
        const lowerKeyword = keyword.toLowerCase().trim();
        if (lowerKeyword && !config.roles[roleName].includes(lowerKeyword)) {
            config.roles[roleName].push(lowerKeyword);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Eliminar palabra clave de un rol
    removeKeywordFromRole: function (roleName, keyword) {
        const config = this.getConfig();
        if (config.roles[roleName]) {
            const index = config.roles[roleName].indexOf(keyword);
            if (index > -1) {
                config.roles[roleName].splice(index, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // Crear nuevo rol
    createRole: function (roleName) {
        const config = this.getConfig();
        const trimmedName = roleName.trim();
        
        if (trimmedName && !config.roles[trimmedName]) {
            config.roles[trimmedName] = [];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Renombrar rol
    renameRole: function (oldName, newName) {
        const config = this.getConfig();
        const trimmedNewName = newName.trim();
        
        if (config.roles[oldName] && trimmedNewName && !config.roles[trimmedNewName]) {
            config.roles[trimmedNewName] = config.roles[oldName];
            delete config.roles[oldName];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Eliminar rol
    deleteRole: function (roleName) {
        const config = this.getConfig();
        if (config.roles[roleName]) {
            delete config.roles[roleName];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Restaurar configuración por defecto
    resetToDefault: function () {
        this.saveConfig(JSON.parse(JSON.stringify(this.defaultConfig)));
        return true;
    },

    // Exportar configuración completa a archivo .txt
    exportConfig: function () {
        try {
            const config = this.getConfig();
            const configText = JSON.stringify(config, null, 2);
            const blob = new Blob([configText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'yugioh_config_backup.txt';
            a.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (err) {
            console.error('Error exportando configuración:', err);
            return false;
        }
    },

    // Importar configuración desde archivo .txt
    importConfig: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const configText = e.target.result;
                    const config = JSON.parse(configText);
                    
                    // Validar que tenga la estructura básica
                    if (!config.roles || typeof config.roles !== 'object') {
                        reject('Archivo de configuración inválido');
                        return;
                    }
                    
                    // Guardar configuración importada
                    this.saveConfig(config);
                    resolve(true);
                    
                } catch (err) {
                    console.error('Error parseando configuración:', err);
                    reject('Error al leer el archivo de configuración');
                }
            };
            
            reader.onerror = () => {
                reject('Error al leer el archivo');
            };
            
            reader.readAsText(file);
        });
    },

    // ===============================
    // GESTIÓN DE ESPECIALIDADES (PASO 1)
    // ===============================
    
    // Obtener todas las especialidades
    getSpecialties: function () {
        const config = this.getConfig();
        return config.specialties || {};
    },

    // Obtener nombres de especialidades
    getSpecialtyNames: function () {
        return Object.keys(this.getSpecialties());
    },

    // Obtener especialidad específica
    getSpecialty: function (keyword) {
        const specialties = this.getSpecialties();
        return specialties[keyword] || null;
    },

    // Crear nueva especialidad
    createSpecialty: function (keyword, data) {
        const config = this.getConfig();
        if (!config.specialties) {
            config.specialties = {};
        }
        
        const trimmedKeyword = keyword.toLowerCase().trim();
        
        if (trimmedKeyword && !config.specialties[trimmedKeyword]) {
            config.specialties[trimmedKeyword] = {
                cardLevel: data.cardLevel || trimmedKeyword,
                deckLevel: data.deckLevel || trimmedKeyword,
                linkedRole: data.linkedRole || '',
                counters: data.counters || [],
                counteredBy: data.counteredBy || []
            };
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Actualizar especialidad
    updateSpecialty: function (keyword, data) {
        const config = this.getConfig();
        if (config.specialties && config.specialties[keyword]) {
            config.specialties[keyword] = {
                cardLevel: data.cardLevel || keyword,
                deckLevel: data.deckLevel || keyword,
                linkedRole: data.linkedRole || '',
                counters: data.counters || [],
                counteredBy: data.counteredBy || []
            };
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Eliminar especialidad
    deleteSpecialty: function (keyword) {
        const config = this.getConfig();
        if (config.specialties && config.specialties[keyword]) {
            delete config.specialties[keyword];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Renombrar keyword de especialidad
    renameSpecialtyKeyword: function (oldKeyword, newKeyword) {
        const config = this.getConfig();
        const trimmedNewKeyword = newKeyword.toLowerCase().trim();
        
        if (config.specialties && config.specialties[oldKeyword] && 
            trimmedNewKeyword && !config.specialties[trimmedNewKeyword]) {
            config.specialties[trimmedNewKeyword] = config.specialties[oldKeyword];
            delete config.specialties[oldKeyword];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // ===============================
    // GESTIÓN DE STAPLES (PASO 2)
    // ===============================
    
    // Obtener todas las staples
    getStaples: function () {
        const config = this.getConfig();
        return config.staples || {};
    },

    // Obtener IDs de staples
    getStapleIds: function () {
        return Object.keys(this.getStaples());
    },

    // Obtener staple específico por ID
    getStaple: function (cardId) {
        const staples = this.getStaples();
        return staples[cardId] || null;
    },

    // Verificar si una carta es staple
    isStaple: function (cardId) {
        return this.getStaple(cardId) !== null;
    },

    // Crear nuevo staple
    createStaple: function (cardId, data) {
        const config = this.getConfig();
        if (!config.staples) {
            config.staples = {};
        }
        
        const trimmedId = String(cardId).trim();
        
        if (trimmedId && !config.staples[trimmedId]) {
            config.staples[trimmedId] = {
                id: trimmedId,
                name: data.name || '',
                nameEn: data.nameEn || '',
                roles: data.roles || [],
                specialtyKeywords: data.specialtyKeywords || [],
                notes: data.notes || ''
            };
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Actualizar staple
    updateStaple: function (cardId, data) {
        const config = this.getConfig();
        if (config.staples && config.staples[cardId]) {
            config.staples[cardId] = {
                id: cardId,
                name: data.name || '',
                nameEn: data.nameEn || '',
                roles: data.roles || [],
                specialtyKeywords: data.specialtyKeywords || [],
                notes: data.notes || ''
            };
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Eliminar staple
    deleteStaple: function (cardId) {
        const config = this.getConfig();
        if (config.staples && config.staples[cardId]) {
            delete config.staples[cardId];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Agregar rol a staple
    addRoleToStaple: function (cardId, roleName) {
        const config = this.getConfig();
        if (config.staples && config.staples[cardId]) {
            if (!config.staples[cardId].roles.includes(roleName)) {
                config.staples[cardId].roles.push(roleName);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // Eliminar rol de staple
    removeRoleFromStaple: function (cardId, roleName) {
        const config = this.getConfig();
        if (config.staples && config.staples[cardId]) {
            const index = config.staples[cardId].roles.indexOf(roleName);
            if (index > -1) {
                config.staples[cardId].roles.splice(index, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // Agregar specialty keyword a staple
    addSpecialtyKeywordToStaple: function (cardId, keyword) {
        const config = this.getConfig();
        if (config.staples && config.staples[cardId]) {
            const lowerKeyword = keyword.toLowerCase().trim();
            if (lowerKeyword && !config.staples[cardId].specialtyKeywords.includes(lowerKeyword)) {
                config.staples[cardId].specialtyKeywords.push(lowerKeyword);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // Eliminar specialty keyword de staple
    removeSpecialtyKeywordFromStaple: function (cardId, keyword) {
        const config = this.getConfig();
        if (config.staples && config.staples[cardId]) {
            const index = config.staples[cardId].specialtyKeywords.indexOf(keyword);
            if (index > -1) {
                config.staples[cardId].specialtyKeywords.splice(index, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // ===============================
    // GESTIÓN DE NOMENCLATURE (PASO 4)
    // ===============================
    
    // Obtener configuración completa de nomenclature
    getNomenclature: function () {
        const config = this.getConfig();
        return config.nomenclature || this.defaultConfig.nomenclature;
    },

    // Obtener categoría específica
    getNomenclatureCategory: function (category) {
        const nomenclature = this.getNomenclature();
        return nomenclature[category] || {};
    },

    // Agregar palabra clave a categoría
    addNomenclatureKeyword: function (category, subcategory, keyword) {
        const config = this.getConfig();
        if (!config.nomenclature) {
            config.nomenclature = JSON.parse(JSON.stringify(this.defaultConfig.nomenclature));
        }

        const lowerKeyword = keyword.toLowerCase().trim();
        
        // Para categorías con subcategorías (objetos)
        if (typeof config.nomenclature[category] === 'object' && !Array.isArray(config.nomenclature[category])) {
            if (!config.nomenclature[category][subcategory]) {
                config.nomenclature[category][subcategory] = [];
            }
            if (!config.nomenclature[category][subcategory].includes(lowerKeyword)) {
                config.nomenclature[category][subcategory].push(lowerKeyword);
                this.saveConfig(config);
                return true;
            }
        }
        // Para categorías simples (arrays)
        else if (Array.isArray(config.nomenclature[category])) {
            if (!config.nomenclature[category].includes(lowerKeyword)) {
                config.nomenclature[category].push(lowerKeyword);
                this.saveConfig(config);
                return true;
            }
        }
        
        return false;
    },

    // Eliminar palabra clave de categoría
    removeNomenclatureKeyword: function (category, subcategory, keyword) {
        const config = this.getConfig();
        if (!config.nomenclature) return false;

        // Para categorías con subcategorías
        if (typeof config.nomenclature[category] === 'object' && !Array.isArray(config.nomenclature[category])) {
            if (config.nomenclature[category][subcategory]) {
                const index = config.nomenclature[category][subcategory].indexOf(keyword);
                if (index > -1) {
                    config.nomenclature[category][subcategory].splice(index, 1);
                    this.saveConfig(config);
                    return true;
                }
            }
        }
        // Para categorías simples
        else if (Array.isArray(config.nomenclature[category])) {
            const index = config.nomenclature[category].indexOf(keyword);
            if (index > -1) {
                config.nomenclature[category].splice(index, 1);
                this.saveConfig(config);
                return true;
            }
        }
        
        return false;
    },

    // Crear nueva subcategoría
    createNomenclatureSubcategory: function (category, subcategoryName) {
        const config = this.getConfig();
        if (!config.nomenclature) {
            config.nomenclature = JSON.parse(JSON.stringify(this.defaultConfig.nomenclature));
        }

        if (typeof config.nomenclature[category] === 'object' && !Array.isArray(config.nomenclature[category])) {
            const trimmedName = subcategoryName.trim();
            if (trimmedName && !config.nomenclature[category][trimmedName]) {
                config.nomenclature[category][trimmedName] = [];
                this.saveConfig(config);
                return true;
            }
        }
        
        return false;
    },

    // Eliminar subcategoría
    deleteNomenclatureSubcategory: function (category, subcategoryName) {
        const config = this.getConfig();
        if (config.nomenclature && config.nomenclature[category]) {
            if (config.nomenclature[category][subcategoryName]) {
                delete config.nomenclature[category][subcategoryName];
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // ===============================
    // GESTIÓN DE ROLE CONDITIONS (PASO 3)
    // ===============================
    
    // Obtener todas las roleConditions
    getRoleConditions: function () {
        const config = this.getConfig();
        return config.roleConditions || {};
    },

    // Obtener condition de un rol específico
    getRoleCondition: function (roleName) {
        const conditions = this.getRoleConditions();
        return conditions[roleName] || null;
    },

    // Verificar si un rol tiene condicionales
    hasConditions: function (roleName) {
        const condition = this.getRoleCondition(roleName);
        return condition && condition.conditionals && condition.conditionals.length > 0;
    },

    // Crear/actualizar roleCondition para un rol
    setRoleCondition: function (roleName, conditionals, keywords) {
        const config = this.getConfig();
        if (!config.roleConditions) {
            config.roleConditions = {};
        }
        
        config.roleConditions[roleName] = {
            conditionals: conditionals || [],
            keywords: keywords || []
        };
        
        this.saveConfig(config);
        return true;
    },

    // Eliminar roleCondition de un rol
    removeRoleCondition: function (roleName) {
        const config = this.getConfig();
        if (config.roleConditions && config.roleConditions[roleName]) {
            delete config.roleConditions[roleName];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Agregar condicional a un rol
    addConditionalToRole: function (roleName, conditional) {
        const config = this.getConfig();
        if (!config.roleConditions) {
            config.roleConditions = {};
        }
        
        if (!config.roleConditions[roleName]) {
            config.roleConditions[roleName] = {
                conditionals: [],
                keywords: []
            };
        }
        
        const lowerConditional = conditional.toLowerCase().trim();
        if (lowerConditional && !config.roleConditions[roleName].conditionals.includes(lowerConditional)) {
            config.roleConditions[roleName].conditionals.push(lowerConditional);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Eliminar condicional de un rol
    removeConditionalFromRole: function (roleName, conditional) {
        const config = this.getConfig();
        if (config.roleConditions && config.roleConditions[roleName]) {
            const index = config.roleConditions[roleName].conditionals.indexOf(conditional);
            if (index > -1) {
                config.roleConditions[roleName].conditionals.splice(index, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // Agregar keyword a roleCondition
    addKeywordToRoleCondition: function (roleName, keyword) {
        const config = this.getConfig();
        if (!config.roleConditions) {
            config.roleConditions = {};
        }
        
        if (!config.roleConditions[roleName]) {
            config.roleConditions[roleName] = {
                conditionals: [],
                keywords: []
            };
        }
        
        const lowerKeyword = keyword.toLowerCase().trim();
        if (lowerKeyword && !config.roleConditions[roleName].keywords.includes(lowerKeyword)) {
            config.roleConditions[roleName].keywords.push(lowerKeyword);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Eliminar keyword de roleCondition
    removeKeywordFromRoleCondition: function (roleName, keyword) {
        const config = this.getConfig();
        if (config.roleConditions && config.roleConditions[roleName]) {
            const index = config.roleConditions[roleName].keywords.indexOf(keyword);
            if (index > -1) {
                config.roleConditions[roleName].keywords.splice(index, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    }
};

window.ConfigManager = ConfigManager;