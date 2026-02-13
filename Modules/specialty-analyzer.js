/* ====================================
   SPECIALTY ANALYZER MODULE - Destiny Draw
   Sistema de análisis de especialidades (pares Especialización <-> Counter)
   ==================================== */

const SpecialtyAnalyzer = {

    // ===============================
    // ANÁLISIS DE CARTA INDIVIDUAL
    // ===============================

    analyzeCard: function (card) {
        const desc   = (card.desc || '').toLowerCase();
        const cardId = String(card.id);
        const pairs  = ConfigManager.getSpecialties(); // array de pares
        const result = {
            specializations: [],  // Especializaciones detectadas en esta carta
            counters:        []   // Funciones de counter detectadas en esta carta
        };

        pairs.forEach(pair => {
            // Verificar si la carta cumple la especialización
            const specMatch = this._matchesSide(desc, pair.specialization);
            if (specMatch) {
                result.specializations.push({
                    pairId:       pair.id,
                    name:         pair.specialization.name,
                    rol:          pair.specialization.rol,
                    counterName:  pair.counter.name,     // Su counter asociado
                    matchedKw:    specMatch.keyword
                });
            }

            // Verificar si la carta cumple la función de counter
            const counterMatch = this._matchesSide(desc, pair.counter);
            if (counterMatch) {
                result.counters.push({
                    pairId:        pair.id,
                    name:          pair.counter.name,
                    rol:           pair.counter.rol,
                    countersSpec:  pair.specialization.name,  // A qué especialización hace counter
                    matchedKw:     counterMatch.keyword
                });
            }
        });

        return result;
    },

    // Verifica si una descripción cumple los keywords de un lado (spec o counter)
    _matchesSide: function (descLower, side) {
        if (!side || !side.keywords || side.keywords.length === 0) return null;
        for (const kw of side.keywords) {
            if (descLower.includes(kw.toLowerCase())) {
                return { keyword: kw };
            }
        }
        return null;
    },

    // ===============================
    // ANÁLISIS DE DECK COMPLETO
    // ===============================

    analyzeDeck: function (cards) {
        const deckSpecs     = {};  // especialización -> { count, cardIds }
        const deckCounters  = {};  // counter -> { count, cardIds }

        for (const [id, item] of Object.entries(cards)) {
            if (item.location !== 'main' && item.location !== 'extra') continue;

            const analysis = item.specialtyAnalysis || this.analyzeCard(item.data || item);
            const qty      = item.qty || 1;

            // Acumular especializaciones
            (analysis.specializations || []).forEach(spec => {
                if (!deckSpecs[spec.name]) {
                    deckSpecs[spec.name] = { count: 0, cardIds: [], counterName: spec.counterName, pairId: spec.pairId };
                }
                deckSpecs[spec.name].count += qty;
                if (!deckSpecs[spec.name].cardIds.includes(id)) {
                    deckSpecs[spec.name].cardIds.push(id);
                }
            });

            // Acumular counters
            (analysis.counters || []).forEach(ctr => {
                if (!deckCounters[ctr.name]) {
                    deckCounters[ctr.name] = { count: 0, cardIds: [], countersSpec: ctr.countersSpec, pairId: ctr.pairId };
                }
                deckCounters[ctr.name].count += qty;
                if (!deckCounters[ctr.name].cardIds.includes(id)) {
                    deckCounters[ctr.name].cardIds.push(id);
                }
            });
        }

        return { specializations: deckSpecs, counters: deckCounters };
    },

    // Obtener la especialización principal del deck
    getPrimarySpecialization: function (deckAnalysis) {
        if (!deckAnalysis || !deckAnalysis.specializations) return null;
        let max  = 0;
        let primary = null;
        for (const [name, data] of Object.entries(deckAnalysis.specializations)) {
            if (data.count > max) {
                max     = data.count;
                primary = { name, count: data.count, counterName: data.counterName };
            }
        }
        return primary;
    },

    // ===============================
    // SISTEMA DE COUNTERS (preparado para pasos futuros)
    // ===============================

    // Determina si una carta actúa como counter de otra
    cardCountersCard: function (attackerCard, defenderCard) {
        const atkDesc = (attackerCard.desc || '').toLowerCase();
        const defPairs = ConfigManager.getSpecialties();
        let score = 0;

        defPairs.forEach(pair => {
            // Si el defensor tiene la especialización Y el atacante tiene el counter de esa especialización
            const defHasSpec     = this._matchesSide(atkDesc.replace(atkDesc, (defenderCard.desc || '').toLowerCase()), pair.specialization);
            const atkHasCounter  = this._matchesSide(atkDesc, pair.counter);
            if (defHasSpec && atkHasCounter) score++;
        });

        return score;
    },

    // Renderizado de especializaciones de deck (para UI futura)
    renderDeckSpecializations: function (deckAnalysis) {
        if (!deckAnalysis || !deckAnalysis.specializations) {
            return '<p class="stats-empty">Sin especializaciones detectadas</p>';
        }
        let html = '<div class="specializations-list">';
        const sorted = Object.entries(deckAnalysis.specializations)
            .sort((a, b) => b[1].count - a[1].count);
        sorted.forEach(([name, data]) => {
            html += `
                <div class="specialization-item">
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