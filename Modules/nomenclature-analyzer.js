/* ====================================
   NOMENCLATURE ANALYZER
   Destiny Draw - Yu-Gi-Oh! App
   Análisis de nomenclatura de efectos de cartas
   ==================================== */

const NomenclatureAnalyzer = {

    // ===============================
    // ANALIZAR CARTA COMPLETA
    // ===============================
    analyzeCard: function(card) {
        if (!card || !card.desc) {
            return null;
        }

        const desc = card.desc;
        const config = window.ConfigManager.getNomenclature();

        return {
            effectSpeed: this.detectEffectSpeed(desc, config.effectSpeed),
            effectType: this.detectEffectType(desc, config.effectType),
            timing: this.detectTiming(desc, config.timing),
            hasRequirements: this.detectRequirements(desc, config.requirements),
            hasConditions: this.detectConditions(desc, config.conditions),
            hasCost: this.detectCost(desc, config.cost),
            effects: this.detectEffects(desc, config.effects),
            duration: this.detectDuration(desc, config.duration),
            restrictions: this.detectRestrictions(desc, config.restrictions)
        };
    },

    // ===============================
    // DETECTORES INDIVIDUALES
    // ===============================
    
    detectEffectSpeed: function(desc, keywords) {
        const descLower = desc.toLowerCase();
        const detected = [];
        
        for (const [name, kws] of Object.entries(keywords)) {
            for (const kw of kws) {
                if (descLower.includes(kw.toLowerCase())) {
                    detected.push(name);
                    break;
                }
            }
        }
        
        return detected;
    },

    detectEffectType: function(desc, keywords) {
        const descLower = desc.toLowerCase();
        const detected = [];
        
        for (const [name, kws] of Object.entries(keywords)) {
            for (const kw of kws) {
                if (descLower.includes(kw.toLowerCase())) {
                    detected.push(name);
                    break;
                }
            }
        }
        
        return detected;
    },

    detectTiming: function(desc, keywords) {
        const descLower = desc.toLowerCase();
        const detected = [];
        
        for (const [name, kws] of Object.entries(keywords)) {
            for (const kw of kws) {
                if (descLower.includes(kw.toLowerCase())) {
                    detected.push(name);
                    break;
                }
            }
        }
        
        return detected;
    },

    detectRequirements: function(desc, keywords) {
        const descLower = desc.toLowerCase();
        
        for (const kw of keywords) {
            if (descLower.includes(kw.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    },

    detectConditions: function(desc, keywords) {
        const descLower = desc.toLowerCase();
        
        for (const kw of keywords) {
            if (descLower.includes(kw.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    },

    detectCost: function(desc, keywords) {
        const descLower = desc.toLowerCase();
        
        for (const kw of keywords) {
            if (descLower.includes(kw.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    },

    detectEffects: function(desc, keywords) {
        const descLower = desc.toLowerCase();
        const detected = [];
        
        for (const [name, kws] of Object.entries(keywords)) {
            for (const kw of kws) {
                if (descLower.includes(kw.toLowerCase())) {
                    detected.push(name);
                    break;
                }
            }
        }
        
        return detected;
    },

    detectDuration: function(desc, keywords) {
        const descLower = desc.toLowerCase();
        const detected = [];
        
        for (const [name, kws] of Object.entries(keywords)) {
            for (const kw of kws) {
                if (descLower.includes(kw.toLowerCase())) {
                    detected.push(name);
                    break;
                }
            }
        }
        
        return detected;
    },

    detectRestrictions: function(desc, keywords) {
        const descLower = desc.toLowerCase();
        const detected = [];
        
        for (const [name, kws] of Object.entries(keywords)) {
            for (const kw of kws) {
                if (descLower.includes(kw.toLowerCase())) {
                    detected.push(name);
                    break;
                }
            }
        }
        
        return detected;
    },

    // ===============================
    // UTILIDADES
    // ===============================
    
    hasNomenclatureData: function(nomenclature) {
        if (!nomenclature) return false;
        
        return (
            nomenclature.effectSpeed.length > 0 ||
            nomenclature.effectType.length > 0 ||
            nomenclature.timing.length > 0 ||
            nomenclature.hasRequirements ||
            nomenclature.hasConditions ||
            nomenclature.hasCost ||
            nomenclature.effects.length > 0 ||
            nomenclature.duration.length > 0 ||
            nomenclature.restrictions.length > 0
        );
    }
};

window.NomenclatureAnalyzer = NomenclatureAnalyzer;
