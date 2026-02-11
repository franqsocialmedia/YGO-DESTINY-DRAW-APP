/* ====================================
   SPECIALTY ANALYZER MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Sistema de detección y análisis de especialidades
   ==================================== */

const SpecialtyAnalyzer = {

    // ===============================
    // ANÁLISIS DE CARTA INDIVIDUAL
    // ===============================
    
    // Analizar especialidades de una carta
    analyzeCard: function (card) {
        const desc = (card.desc || '').toLowerCase();
        const cardId = String(card.id);
        const specialties = ConfigManager.getSpecialties();
        const detectedSpecialties = [];
        
        // PASO 2: Verificar si es staple y aplicar keywords predefinidas
        if (typeof ConfigManager.isStaple === 'function' && ConfigManager.isStaple(cardId)) {
            const staple = ConfigManager.getStaple(cardId);
            if (staple && staple.specialtyKeywords) {
                // Buscar especialidades basadas en los keywords del staple
                staple.specialtyKeywords.forEach(keyword => {
                    const specialtyData = specialties[keyword];
                    if (specialtyData) {
                        detectedSpecialties.push({
                            keyword: keyword,
                            cardLevel: specialtyData.cardLevel,
                            deckLevel: specialtyData.deckLevel,
                            linkedRole: specialtyData.linkedRole,
                            counters: specialtyData.counters || [],
                            counteredBy: specialtyData.counteredBy || [],
                            fromStaple: true  // Marcador para identificar que viene de staple
                        });
                    }
                });
            }
        }
        
        // Buscar cada keyword de especialidad en la descripción
        for (const [keyword, data] of Object.entries(specialties)) {
            if (desc.includes(keyword)) {
                // Evitar duplicados si ya se agregó desde staple
                const alreadyAdded = detectedSpecialties.some(s => s.keyword === keyword);
                if (!alreadyAdded) {
                    detectedSpecialties.push({
                        keyword: keyword,
                        cardLevel: data.cardLevel,
                        deckLevel: data.deckLevel,
                        linkedRole: data.linkedRole,
                        counters: data.counters || [],
                        counteredBy: data.counteredBy || [],
                        fromStaple: false
                    });
                }
            }
        }
        
        return detectedSpecialties;
    },

    // ===============================
    // GESTIÓN DE ROLES PARA STAPLES (PASO 2)
    // ===============================
    
    // Obtener roles predefinidos para un staple
    getStapleRoles: function (cardId) {
        if (typeof ConfigManager.isStaple === 'function' && ConfigManager.isStaple(String(cardId))) {
            const staple = ConfigManager.getStaple(String(cardId));
            return staple ? (staple.roles || []) : [];
        }
        return [];
    },

    // ===============================
    // ANÁLISIS DE DECK COMPLETO
    // ===============================
    
    // Analizar especialización del deck
    analyzeDeck: function (cards) {
        // cards es el objeto de cartas del deck: { id: { data, qty, location, roles, specialties } }
        
        const deckSpecialties = {};
        const cardCount = {};
        
        // Contar especialidades por carta
        for (const [id, item] of Object.entries(cards)) {
            // Solo analizar Main y Extra Deck
            if (item.location !== 'main' && item.location !== 'extra') {
                continue;
            }
            
            const specialties = item.specialties || [];
            const qty = item.qty || 1;
            
            specialties.forEach(specialty => {
                const deckLevel = specialty.deckLevel;
                
                // Contar cuántas cartas tienen esta especialidad
                if (!cardCount[deckLevel]) {
                    cardCount[deckLevel] = 0;
                }
                cardCount[deckLevel] += qty;
                
                // Almacenar datos completos de la especialidad
                if (!deckSpecialties[deckLevel]) {
                    deckSpecialties[deckLevel] = {
                        deckLevel: deckLevel,
                        cardCount: 0,
                        counters: specialty.counters || [],
                        counteredBy: specialty.counteredBy || [],
                        linkedKeywords: []
                    };
                }
                
                deckSpecialties[deckLevel].cardCount += qty;
                
                // Registrar keywords únicos
                if (!deckSpecialties[deckLevel].linkedKeywords.includes(specialty.keyword)) {
                    deckSpecialties[deckLevel].linkedKeywords.push(specialty.keyword);
                }
            });
        }
        
        return {
            specializations: deckSpecialties,
            rawCount: cardCount
        };
    },

    // ===============================
    // DETERMINACIÓN DE ESPECIALIZACIÓN PRINCIPAL
    // ===============================
    
    // Obtener la especialización principal del deck
    getPrimarySpecialization: function (deckAnalysis) {
        if (!deckAnalysis || !deckAnalysis.specializations) {
            return null;
        }
        
        let maxCount = 0;
        let primarySpec = null;
        
        for (const [deckLevel, data] of Object.entries(deckAnalysis.specializations)) {
            if (data.cardCount > maxCount) {
                maxCount = data.cardCount;
                primarySpec = {
                    name: deckLevel,
                    count: data.cardCount,
                    counters: data.counters,
                    counteredBy: data.counteredBy
                };
            }
        }
        
        return primarySpec;
    },

    // ===============================
    // SISTEMA DE COUNTERS (Preparado para Paso 6-7)
    // ===============================
    
    // Calcular counters de una carta contra otra
    calculateCardVsCard: function (card1, card2) {
        const spec1 = card1.specialties || [];
        const spec2 = card2.specialties || [];
        
        let counterScore = 0;
        
        // Verificar si card1 contrarresta a card2
        spec1.forEach(s1 => {
            spec2.forEach(s2 => {
                // Si s1 está en los counters de s2, entonces card1 contrarresta a card2
                if (s1.counters && s1.counters.includes(s2.cardLevel.toLowerCase())) {
                    counterScore++;
                }
            });
        });
        
        return counterScore;
    },

    // Calcular nivel de counter de un deck contra otro
    calculateDeckVsDeck: function (deck1Cards, deck2Cards) {
        let counterScore = 0;
        let totalInteractions = 0;
        
        // Comparar cada carta de deck1 contra cada carta de deck2
        for (const [id1, item1] of Object.entries(deck1Cards)) {
            if (item1.location !== 'main' && item1.location !== 'extra') continue;
            
            for (const [id2, item2] of Object.entries(deck2Cards)) {
                if (item2.location !== 'main' && item2.location !== 'extra') continue;
                
                const cardCounter = this.calculateCardVsCard(item1, item2);
                if (cardCounter > 0) {
                    counterScore += cardCounter * item1.qty;
                    totalInteractions++;
                }
            }
        }
        
        return {
            counterScore: counterScore,
            interactions: totalInteractions,
            avgCounter: totalInteractions > 0 ? (counterScore / totalInteractions).toFixed(2) : 0
        };
    },

    // ===============================
    // RENDERIZADO DE ESPECIALIDADES (Para UI futuro)
    // ===============================
    
    renderDeckSpecializations: function (deckAnalysis) {
        if (!deckAnalysis || !deckAnalysis.specializations) {
            return '<p class="stats-empty">Sin especialidades detectadas</p>';
        }
        
        let html = '<div class="specializations-list">';
        
        // Ordenar por cantidad de cartas
        const sorted = Object.entries(deckAnalysis.specializations)
            .sort((a, b) => b[1].cardCount - a[1].cardCount);
        
        sorted.forEach(([deckLevel, data]) => {
            html += `
                <div class="specialization-item">
                    <div class="spec-name">${deckLevel}</div>
                    <div class="spec-count">${data.cardCount} cartas</div>
                    <div class="spec-keywords">${data.linkedKeywords.join(', ')}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
};

window.SpecialtyAnalyzer = SpecialtyAnalyzer;