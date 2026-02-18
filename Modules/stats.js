    /* ====================================
    STATS MODULE
    Destiny Draw - Yu-Gi-Oh! App
    Sistema de puntuación y estadísticas de decks
    ==================================== */

    const Stats = {

        // ===============================
        // RENDIMIENTOS DECRECIENTES
        // ===============================
    // DESPUÉS:
    calculateDiminishingReturns: function(roleName, count) {
        const config = window.ConfigManager?.getDiminishingReturns?.();
        if (!config || !config.enabled) {
            return count; // Sin rendimientos decrecientes
        }
        
        const threshold = config.roleThresholds?.[roleName];
        if (!threshold) {
            return Math.sqrt(count); // Default: raíz cuadrada
        }
        
        // Aplicar curva según configuración
        if (count <= threshold.optimal) {
            return count; // 100% eficiencia
        } else if (count <= threshold.max) {
            // Rendimientos decrecientes entre optimal y max
            const excess = count - threshold.optimal;
            const range = threshold.max - threshold.optimal;
            const factor = 1 - (excess / range) * (1 - threshold.curve);
            return threshold.optimal + (excess * factor);
        } else {
            // Más allá del máximo: curva más agresiva
            const baseValue = threshold.optimal + 
                (threshold.max - threshold.optimal) * threshold.curve;
            const excess = count - threshold.max;
            return baseValue + (excess * threshold.curve * 0.5);
        }
    },

        // ===============================
        // CÁLCULO DE INTERNAL SCORE
        // ===============================
        calculateInternalScore: function (cards) {
    // Pilares desde Config (usuario configura qué roles aportan a cada uno)
            const pillars = window.ConfigManager?.getPillars?.()
                || { consistency: [], power: [], resilience: [] };

            const consistencyRoles = pillars.consistency.map(r => r.toLowerCase());
            const powerRoles       = pillars.power.map(r => r.toLowerCase());
            const resilienceRoles  = pillars.resilience.map(r => r.toLowerCase());
            const restrictionTerms = ['per turn', 'per duel', 'next turn', 'you can only', 'only once', 'cannot be used'];

    const roleCounters = {};
    const roleWeights  = {};
    let mainCards = 0;
    let totalCards = 0;

    const getRoleWeight = (roleName) => window.ConfigManager?.getRoleWeight?.(roleName) ?? 1.0;

    // ── Acumular contadores por rol ──────────────────────────────
    for (const [, item] of Object.entries(cards)) {
        const loc   = item.location;
        const qty   = item.qty || 1;
        const roles = (item.roles || []).map(r => r.toLowerCase());
        const desc  = (item.data?.desc || '').toLowerCase();

       if (loc === 'main' || loc === 'extra') totalCards += qty;
        if (loc !== 'main') continue;

        mainCards += qty;

        const isRestricted  = restrictionTerms.some(t => desc.includes(t));
        const effectiveQty  = isRestricted ? 1 + (qty - 1) * 0.5 : qty;

        roles.forEach(r => {
            const weight = getRoleWeight(r);
            if (!roleCounters[r]) { roleCounters[r] = 0; roleWeights[r] = weight; }
            roleCounters[r] += effectiveQty;
        });
    }

    // ── Sumar a pilares con rendimientos decrecientes ────────────
    let consistencyScore = 0;
    let powerScore       = 0;
    let resilienceScore  = 0;

    Object.entries(roleCounters).forEach(([role, count]) => {
        const diminishedValue = this.calculateDiminishingReturns(role, count);
        const weight          = roleWeights[role] ?? 1.0;
        const contribution    = diminishedValue * weight;

        if (consistencyRoles.includes(role)) consistencyScore += contribution;
        if (powerRoles.includes(role))       powerScore       += contribution;
        if (resilienceRoles.includes(role))  resilienceScore  += contribution;
    });

    // ── Penalización cruzada (opcional, por rol) ─────────────────
    const dimCfg = window.ConfigManager?.getDiminishingReturns?.();
    if (dimCfg && dimCfg.enabled) {
        Object.entries(roleCounters).forEach(([role, count]) => {
            const threshold = dimCfg.roleThresholds?.[role];
            if (!threshold || !threshold.crossPenalty) return;
            const excess = count - threshold.max;
            if (excess <= 0) return;
            const penalty = excess * threshold.curve * 0.3;
            if (consistencyRoles.includes(role)) { powerScore      -= penalty; resilienceScore -= penalty; }
            if (powerRoles.includes(role))       { consistencyScore -= penalty; resilienceScore -= penalty; }
            if (resilienceRoles.includes(role))  { consistencyScore -= penalty; powerScore      -= penalty; }
        });
    }

    if (mainCards === 0) mainCards = 1;

    // ── Normalizar a 0–10 ────────────────────────────────────────
    const consistency = Math.min(10, (consistencyScore / mainCards) * 15);
    const power       = Math.min(10, (powerScore        / mainCards) * 20);
    const resilience  = Math.min(10, (resilienceScore   / mainCards) * 18);

    const lucky    = 1;
    const rawScore = (consistency * 0.33 + power * 0.33 + resilience * 0.33) * lucky;

    let penalty = 0;
    if (mainCards > 43) penalty = (mainCards - 43) * 0.5;

    const internalScore = Math.max(0, rawScore - penalty);

    return {
        internalScore: internalScore.toFixed(2),
        consistency:   consistency.toFixed(2),
        power:         power.toFixed(2),
        resilience:    resilience.toFixed(2),
        totalCards,
        mainCards,
        penalty:       penalty.toFixed(2),
        lucky
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
    if (finalScore === 0)       { level = 'Sin capacidad Anti-META';  levelColor = '#636e72'; }
        else if (finalScore <= 30)  { level = 'Anti-META Bajo';           levelColor = '#fdcb6e'; }
        else if (finalScore <= 70)  { level = 'Anti-META Medio';          levelColor = '#0066cc'; }
        else if (finalScore <= 120) { level = 'Anti-META Alto';           levelColor = '#00b894'; }
        else                        { level = '⚡ Anti-META Élite';        levelColor = '#ffd700'; }                    { level = 'Meta Counter';  levelColor = '#ffd700'; }

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
    },
    // ===============================
    // EXTERNAL SCORE Y ANÁLISIS DEL DECK
    // ===============================
    calculateExternalScore: function (deckCards, powerScoreCache, metaDecks) {
        const result = {
            externalScore:    null,
            deckSpecs:        [],
            threatCards:      [],
            counterDecks:     [],
            missingStaples:   [],
            hasPowerData:     false,
            hasSpecData:      false,
            baseline:         null,
            totalThreat:      0,
            threatPct:        0
        };

        // PASO 1: Mecánicas del deck activo
        if (window.SpecialtyAnalyzer) {
            const specCount = {};
            for (const [, item] of Object.entries(deckCards)) {
                if (!item.data) continue;
                const analysis = SpecialtyAnalyzer.analyzeCard(item.data);
                (analysis.specializations || []).forEach(s => {
                    specCount[s.name] = (specCount[s.name] || 0) + (item.qty || 1);
                });
            }
            result.deckSpecs = Object.entries(specCount)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => ({ name, count }));
            result.hasSpecData = result.deckSpecs.length > 0;
        }

        // PASO 2: Cartas del meta que amenazan este deck
        if (powerScoreCache && powerScoreCache.cards) {
            result.hasPowerData = true;
            const deckSpecNames = new Set(result.deckSpecs.map(s => s.name));

            powerScoreCache.cards.forEach(card => {
                if (!card.isCounter || card.counterBonus <= 0) return;
                const countersSpecs = (card.specAnalysis?.counters || [])
                    .map(c => c.countersSpec).filter(Boolean);
                const overlap = countersSpecs.filter(s => deckSpecNames.has(s));
                if (overlap.length > 0) {
                    result.threatCards.push({
                        cardId:        card.cardId,
                        name:          card.cardData?.name || String(card.cardId),
                        presencePct:   card.presencePct,
                        counterBonus:  card.counterBonus,
                        countersSpecs: overlap,
                        specAnalysis:  card.specAnalysis,
                        threatLevel:   Math.round(card.counterBonus * (card.presencePct / 100))
                    });
                }
            });
            result.threatCards.sort((a, b) => b.threatLevel - a.threatLevel);
        }

        // PASO 3: External Score con BASELINE RELATIVO
        //
        // En lugar del número fijo 120, el denominador es la suma del counterBonus
        // de TODAS las cartas counter del meta actualmente calculado.
        // Esto calibra el score al formato: si el meta actual es muy agresivo con
        // counters, la escala se expande; si tiene pocas counters, se comprime.
        // Un deck no puede ser castigado injustamente por un meta con pocas counters,
        // ni protegido artificialmente en uno con muchas.
        if (result.hasPowerData && result.hasSpecData) {
            const maxTheoreticalThreat = (powerScoreCache.cards || [])
                .filter(c => c.isCounter && c.counterBonus > 0)
                .reduce((sum, c) => sum + c.counterBonus, 0);

            // Si no hay pares de Mecánicas/Counters configurados,
            // el sistema no tiene base para medir amenazas → score null (0 visible).
            // Esto asegura que sin configuración no se genera un número falso.
            if (maxTheoreticalThreat === 0) {
                result.externalScore = null;
            } else {
                const totalThreat = result.threatCards.reduce((s, c) => s + c.threatLevel, 0);
                result.externalScore = parseFloat(
                    Math.max(0, (1 - Math.min(1, totalThreat / maxTheoreticalThreat)) * 10).toFixed(1)
                );
                result.baseline    = maxTheoreticalThreat;
                result.totalThreat = totalThreat;
                result.threatPct   = Math.round((totalThreat / maxTheoreticalThreat) * 100);
            }

        // Sin mecánicas configuradas o sin power data → externalScore queda null
        }else if (result.hasPowerData) {
            result.externalScore = 0;
        }

        // PASO 4: Decks del meta que más amenazan (cross-ref con cardFrequency)
        if (result.threatCards.length > 0 && metaDecks) {
            const threatIds = new Set(result.threatCards.map(c => String(c.cardId)));
            const allDecks  = [];

            for (const [folder, decks] of Object.entries(metaDecks)) {
                (decks || []).forEach(deck => {
                    if (!deck.cardFrequency) return;
                    let unique = 0, copies = 0;
                    Object.entries(deck.cardFrequency).forEach(([id, qty]) => {
                        if (threatIds.has(String(id))) { unique++; copies += qty; }
                    });
                    if (unique > 0) {
                        allDecks.push({
                            name: deck.filename, folder,
                            unique, copies,
                            score: unique * 3 + copies
                        });
                    }
                });
            }
            allDecks.sort((a, b) => b.score - a.score);
            result.counterDecks = allDecks.slice(0, 5);
        }

        // PASO 5: Staples inteligentes — prioriza los que hacen counter a las amenazas
        if (window.ConfigManager) {
            try {
                const staples  = ConfigManager.getStaples() || {};
                const deckIds  = new Set(Object.keys(deckCards).map(String));

                // Specs de las cartas que ME amenazan (mecánicas del oponente)
                const threatEnemySpecs = new Set();
                result.threatCards.forEach(tc => {
                    (tc.specAnalysis?.specializations || []).forEach(s => {
                        threatEnemySpecs.add(s.name);
                    });
                });

                Object.values(staples).forEach(staple => {
                    if (!staple || !staple.id) return;
                    if (deckIds.has(String(staple.id))) return;

                    // ¿Esta staple hace counter a alguna mecánica de las cartas que me amenazan?
                    let isCounterOfThreat = false;
                    if (powerScoreCache) {
                        const cached = powerScoreCache.cards?.find(
                            c => String(c.cardId) === String(staple.id)
                        );
                        if (cached?.isCounter) {
                            const countersSpecs = (cached.specAnalysis?.counters || [])
                                .map(c => c.countersSpec);
                            isCounterOfThreat = countersSpecs.some(s => threatEnemySpecs.has(s));
                        }
                    }

                    result.missingStaples.push({
                        cardId:           staple.id,
                        name:             staple.name,
                        type:             staple.type || '',
                        isCounterOfThreat
                    });
                });

                // Anti-threat primero, luego el resto
                result.missingStaples.sort((a, b) =>
                    (b.isCounterOfThreat ? 1 : 0) - (a.isCounterOfThreat ? 1 : 0)
                );
            } catch (e) {
                console.warn('[ExternalScore] Staples error:', e);
            }
        }

        return result;
    },
    // ===============================
    // PROBABILIDAD DE ENCUENTRO EN META
    // ===============================
    calculateEncounterRate: function (cardId, powerScoreCache, metaDecks) {
        // avgCopies del meta para esta carta
        let totalCopies = 0;
        let deckCount   = 0;
        let totalMainSizes = 0;
        let decksWith = 0;

        for (const decks of Object.values(metaDecks || {})) {
            for (const deck of decks) {
                if (!deck.cardFrequency) continue;
                const deckTotal = Object.values(deck.cardFrequency)
                    .reduce((s, c) => s + c, 0);
                totalMainSizes += deckTotal;
                deckCount++;

                const copies = deck.cardFrequency[String(cardId)] || 0;
                if (copies > 0) {
                    totalCopies += copies;
                    decksWith++;
                }
            }
        }

        if (deckCount === 0 || decksWith === 0) return null;

        const avgCopies   = totalCopies / decksWith;
        const avgDeckSize = totalMainSizes / deckCount;
        const presencePct = decksWith / deckCount;  // probabilidad de enfrentar un deck que la usa

        // P(ver al menos 1 copia en mano inicial de 5) usando hipergeométrica:
        // P = 1 - C(deckSize-copies, 5) / C(deckSize, 5)
        const hypergeometric = (N, K, n) => {
            // P(X=0) = C(N-K,n) / C(N,n)
            const comb = (a, b) => {
                if (b > a) return 0;
                let r = 1;
                for (let i = 0; i < b; i++) {
                    r = r * (a - i) / (i + 1);
                }
                return r;
            };
            return comb(N - K, n) / comb(N, n);
        };

        const deckSize   = Math.round(avgDeckSize);
        const copies     = Math.min(Math.round(avgCopies), deckSize);
        const pZero      = hypergeometric(deckSize, copies, 5); // P(no ver ninguna)
        const pAtLeastOne = 1 - pZero;

        // Probabilidad ajustada: solo si el oponente lleva ese deck
        const pAdjusted = pAtLeastOne * presencePct;

        // En 10 duelos esperados, cuántas veces verás esta carta en mano inicial del oponente
        const encountersIn10 = parseFloat((pAdjusted * 10).toFixed(2));

        return {
            avgCopies:      parseFloat(avgCopies.toFixed(2)),
            avgDeckSize:    Math.round(avgDeckSize),
            presencePct:    Math.round(presencePct * 100),
            pAtLeastOne:    Math.round(pAtLeastOne * 100),
            pAdjusted:      Math.round(pAdjusted * 100),
            encountersIn10
        };
    }
    };

    window.Stats = Stats;