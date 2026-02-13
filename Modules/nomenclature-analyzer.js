/* ====================================
   NOMENCLATURE ANALYZER - Destiny Draw
   Análisis de estructura de efectos de cartas
   ==================================== */

const NomenclatureAnalyzer = {

    // ===============================
    // ANALIZAR CARTA COMPLETA
    // ===============================

    analyzeCard: function (card) {
        if (!card || !card.desc) return null;
        const nomenclature = window.ConfigManager.getNomenclature();
        const categories   = nomenclature.categories || [];
        const paragraphs   = this.splitIntoParagraphs(card.desc);

        const result = [];
        paragraphs.forEach(para => {
            const cat = this.detectCategory(para, categories);
            result.push({
                text:     para,
                category: cat ? cat.id   : null,
                name:     cat ? cat.name : null,
                color:    cat ? cat.color: null
            });
        });

        return result;
    },

    // ===============================
    // DETECCIÓN DE CATEGORÍA
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

        if (conditions.startsWith && conditions.startsWith.trim() !== '') {
            if (!p.startsWith(conditions.startsWith.toLowerCase().trim())) return false;
        }
        if (conditions.contains && conditions.contains.trim() !== '') {
            if (!p.includes(conditions.contains.toLowerCase().trim())) return false;
        }
        if (conditions.notContains && conditions.notContains.trim() !== '') {
            if (p.includes(conditions.notContains.toLowerCase().trim())) return false;
        }
        if (conditions.endsWith && conditions.endsWith.trim() !== '') {
            if (!p.endsWith(conditions.endsWith.toLowerCase().trim())) return false;
        }
        return true;
    },

    // ===============================
    // DIVISIÓN EN PÁRRAFOS
    // ===============================

    splitIntoParagraphs: function (text) {
        if (!text) return [];
        // Dividir por . : ; manteniendo el delimitador al final de cada segmento
        const parts = text.split(/(?<=[.;:])\s+/);
        return parts
            .map(p => p.trim())
            .filter(p => p.length > 0);
    },

    // ===============================
    // UTILIDADES
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