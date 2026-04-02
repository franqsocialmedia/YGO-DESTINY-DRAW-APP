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