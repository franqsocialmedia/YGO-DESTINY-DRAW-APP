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

 // Normaliza saltos de línea y retorna el texto como bloque único por defecto.
// Si se pasa un delimiter, divide por él.
splitIntoParagraphs: function (text, delimiter) {
    if (!text) return [];
    const normalized = text.replace(/\r\n/g, '\n').replace(/\n+/g, ' ').trim();
    if (!delimiter) return [normalized];
    const parts = normalized.split(delimiter);
    return parts.map(p => p.trim()).filter(p => p.length > 0);
},

// Infiere el delimiter de la categoría a partir de sus conditions.
// Si tiene endsWith definido, divide por esos caracteres.
// Si no tiene ningún delimitador configurado, usa null (bloque completo).
_getCategoryDelimiter: function (cat) {
    const ew = cat.conditions?.endsWith;
    if (!ew) return null;
    const chars = (Array.isArray(ew) ? ew : [ew])
        .map(c => c.trim())
        .filter(Boolean);
    if (chars.length === 0) return null;
    // Regex que divide CONSERVANDO el delimitador al final del segmento
    return new RegExp(`(?<=[${chars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')}])\\s*`);
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

/*
// ===============================
// PRUEBAS
// ===============================
// Ejemplo para ver la descripción de una carta por ID (usa API pública de YGOProDeck).

async function verDesc(id) {
  const r = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`);
  const d = await r.json();
  alert(JSON.stringify(d.data[0].desc));
}

verDesc(19899073);
window.NomenclatureAnalyzer = NomenclatureAnalyzer;
*/