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
    }
};

window.ConfigManager = ConfigManager;