/* ====================================
   STATS MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Sistema de puntuación y estadísticas de decks
   ==================================== */

const Stats = {

    // ===============================
    // CÁLCULO DE INTERNAL SCORE
    // ===============================
    calculateInternalScore: function (cards) {
        // cards es el objeto de cartas del deck: { id: { data, qty, location, roles } }
        
        // Contadores por categoría
        let consistencyCount = 0;
        let powerCount = 0;
        let resilienceCount = 0;
        
        let totalCards = 0;
        let mainCards = 0;
        
        for (const [id, item] of Object.entries(cards)) {
            const roles = item.roles || [];
            const qty = item.qty || 1;
            
            if (item.location === 'main' || item.location === 'extra') {
                totalCards += qty;
            }
            if (item.location === 'main') {
                mainCards += qty;
            }

            // Procesar solo cartas del Main y Extra Deck
            if (item.location !== 'main' && item.location !== 'extra') {
                continue;
            }

            // Contar roles por categoría (cada carta cuenta según su cantidad)
            roles.forEach(role => {
                const roleLower = role.toLowerCase();

                // CONSISTENCIA: starter, searcher, draw-engine (suma) - brick (resta)
                if (roleLower === 'starter' || roleLower === 'searcher' || roleLower === 'draw-engine') {
                    consistencyCount += qty;
                }
                if (roleLower === 'brick') {
                    consistencyCount -= qty; // Brick RESTA de la consistencia
                }

                // POTENCIA: boss-monster, negater, burner, booster
                if (roleLower === 'boss monster' || roleLower === 'boss-monster' || 
                    roleLower === 'negater' || roleLower === 'burner' || roleLower === 'booster') {
                    powerCount += qty;
                }

                // RESILIENCIA: extender, recovery, bridge
                if (roleLower === 'extender' || roleLower === 'recovery' || roleLower === 'bridge') {
                    resilienceCount += qty;
                }
            });
        }

        // Calcular componentes del score (escala de 0-10)
        const consistency = this.calculateComponent(consistencyCount, 12);
        const power = this.calculateComponent(powerCount, 6);
        const resilience = this.calculateComponent(resilienceCount, 6);

        // Fórmula del Internal Score
        let internalScore = (consistency * 0.5) + (power * 0.3) + (resilience * 0.2);

        // Penalización por exceso de cartas (> 45)
        let penalty = 0;
        if (mainCards > 45) {
            penalty = (mainCards - 45) * 0.5;
            internalScore -= penalty;
        }
        if (internalScore < 0) internalScore = 0;

        return {
            internalScore: internalScore.toFixed(2),
            consistency: consistency.toFixed(2),
            power: power.toFixed(2),
            resilience: resilience.toFixed(2),
            totalCards: totalCards,
            mainCards: mainCards,
            penalty: penalty.toFixed(2),
            consistencyCount: consistencyCount,
            powerCount: powerCount,
            resilienceCount: resilienceCount
        };
    },

    // ===============================
    // CALCULAR COMPONENTE INDIVIDUAL
    // ===============================
    calculateComponent: function (count, threshold) {
        // Si la cuenta es >= al umbral, devuelve 10
        // Si es < al umbral, devuelve (count / threshold) * 10
        if (count >= threshold) {
            return 10;
        }
        return (count / threshold) * 10;
    },

    // ===============================
    // RENDERIZAR ESTADÍSTICAS
    // ===============================
    renderStatsCard: function (stats) {
        // Determinar color del score (verde > 7, amarillo 5-7, rojo < 5)
        let scoreColor = '#00b894'; // Verde
        if (stats.internalScore < 5) {
            scoreColor = '#d63031'; // Rojo
        } else if (stats.internalScore < 7) {
            scoreColor = '#fdcb6e'; // Amarillo
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
    // OBTENER ESTADÍSTICAS DEL DECK ACTUAL
    // ===============================
    getDeckStats: function (deckCards) {
        if (!deckCards || Object.keys(deckCards).length === 0) {
            return null;
        }

        return this.calculateInternalScore(deckCards);
    },
    // ===============================
// COUNTER-DECK SCORE
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

        // BRICK: cuenta para penalización, no suma counter
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
    if (finalScore === 0)       { level = 'Sin Counter';   levelColor = '#636e72'; }
    else if (finalScore <= 30)  { level = 'Bajo';          levelColor = '#fdcb6e'; }
    else if (finalScore <= 70)  { level = 'Medio';         levelColor = '#0066cc'; }
    else if (finalScore <= 120) { level = 'Alto';          levelColor = '#00b894'; }
    else                        { level = 'Meta Counter';  levelColor = '#ffd700'; }

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
}
};

window.Stats = Stats;
