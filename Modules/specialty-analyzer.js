/* ====================================
   SPECIALTY ANALYZER MODULE - Destiny Draw
   Sistema basado en roles — sin keywords propias
   ==================================== */

const SpecialtyAnalyzer = {

    // Detección interna de roles desde descripción (sin depender de Deck)
    _detectRoles: function(card) {
        if (!window.ConfigManager) return [];
        const desc = (card.desc || '').toLowerCase();
        const type = (card.type || '').toLowerCase();
        if (type.includes('normal monster')) return [];

        const config         = ConfigManager.getConfig();
        const roleConditions = config.roleConditions || {};
        const roleKeywords   = config.roles          || {};
        const roles          = [];

        for (const [roleName, keywords] of Object.entries(roleKeywords)) {
            let shouldAssign = false;
            if (roleConditions[roleName]) {
                const cond         = roleConditions[roleName];
                const conditionals = cond.conditionals || [];
                const condKws      = cond.keywords     || [];
                let allMet = true;
                if (conditionals.length > 0) {
                    for (const c of conditionals) {
                        if (!c || !desc.includes(c.toLowerCase())) { allMet = false; break; }
                    }
                }
                if (allMet) {
                    for (const kw of condKws) {
                        if (kw && desc.includes(kw.toLowerCase())) { shouldAssign = true; break; }
                    }
                }
            } else {
                for (const kw of keywords) {
                    if (kw && desc.includes(kw.toLowerCase())) { shouldAssign = true; break; }
                }
            }
            if (shouldAssign && !roles.includes(roleName)) roles.push(roleName);
        }
        return roles;
    },

    // Analiza una carta: usa roles pre-asignados o los auto-detecta
    analyzeCard: function(card) {
        const pairs = window.ConfigManager ? ConfigManager.getSpecialties() : [];

        const roles = (card.roles && card.roles.length > 0)
            ? card.roles
            : this._detectRoles(card);

        const rolesLower = roles.map(r => r.toLowerCase());
        const result = { specializations: [], counters: [] };

        pairs.forEach(pair => {
            const mechRole = (pair.mechanicRole || '').toLowerCase().trim();
            const ctrRole  = (pair.counterRole  || '').toLowerCase().trim();

            if (mechRole && rolesLower.includes(mechRole)) {
                result.specializations.push({
                    pairId:      pair.id,
                    name:        pair.mechanicRole,
                    rol:         pair.mechanicRole,
                    counterName: pair.counterRole,
                    matchedKw:   pair.mechanicRole
                });
            }

            if (ctrRole && rolesLower.includes(ctrRole)) {
                result.counters.push({
                    pairId:       pair.id,
                    name:         pair.counterRole,
                    rol:          pair.counterRole,
                    countersSpec: pair.mechanicRole,
                    matchedKw:    pair.counterRole
                });
            }
        });

        return result;
    },

    // Analiza deck completo
    analyzeDeck: function(cards) {
        const deckSpecs    = {};
        const deckCounters = {};

        for (const [id, item] of Object.entries(cards)) {
            if (item.location !== 'main' && item.location !== 'extra') continue;
            const qty      = item.qty || 1;
            const cardData = item.data || item;
            const cardWithRoles = item.roles
                ? { ...cardData, roles: item.roles }
                : cardData;

            const analysis = this.analyzeCard(cardWithRoles);

            (analysis.specializations || []).forEach(spec => {
                if (!deckSpecs[spec.name]) {
                    deckSpecs[spec.name] = { count: 0, cardIds: [], counterName: spec.counterName, pairId: spec.pairId };
                }
                deckSpecs[spec.name].count += qty;
                if (!deckSpecs[spec.name].cardIds.includes(id)) deckSpecs[spec.name].cardIds.push(id);
            });

            (analysis.counters || []).forEach(ctr => {
                if (!deckCounters[ctr.name]) {
                    deckCounters[ctr.name] = { count: 0, cardIds: [], countersSpec: ctr.countersSpec, pairId: ctr.pairId };
                }
                deckCounters[ctr.name].count += qty;
                if (!deckCounters[ctr.name].cardIds.includes(id)) deckCounters[ctr.name].cardIds.push(id);
            });
        }

        return { specializations: deckSpecs, counters: deckCounters };
    },

    getPrimarySpecialization: function(deckAnalysis) {
        if (!deckAnalysis || !deckAnalysis.specializations) return null;
        let max = 0, primary = null;
        for (const [name, data] of Object.entries(deckAnalysis.specializations)) {
            if (data.count > max) { max = data.count; primary = { name, count: data.count, counterName: data.counterName }; }
        }
        return primary;
    },

    cardCountersCard: function() { return 0; },

    renderDeckSpecializations: function(deckAnalysis) {
        if (!deckAnalysis || !deckAnalysis.specializations) {
            return '<p class="stats-empty">Sin especializaciones detectadas</p>';
        }
        let html = '<div class="specializations-list">';
        Object.entries(deckAnalysis.specializations)
            .sort((a, b) => b[1].count - a[1].count)
            .forEach(([name, data]) => {
                html += `<div class="specialization-item">
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