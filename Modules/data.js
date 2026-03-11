/* data.js — Capa de datos: config, scores, análisis de especialidades y nomenclatura */
/* Absorbe: configmanager.js, stats.js, specialty-analyzer.js, nomenclature-analyzer.js */


// ── ConfigManager — config persistente: roles, staples, mecánicas, música, maestros, fuentes, shortcuts ──

const ConfigManager = {

    defaultConfig: {
        // Roles: estructura compatible con OLD VERSION
        roles: {
            'Starter':               ['this card is special', 'this card is normal or', "in its owner's possession is banished"],
            'Starter (normal summon)':['this card is normal summoned'],
            'Extender':              ['you can special summon', 'in addition to your', 'normal summon 1', 'immediately after this effect resolves', 'monster from your hand'],
            'Booster':               ['it gains', 'monsters you control gain', 'atk for each', 'this card gains', 'monster gains', 'this card gain', 'atk becomes', 'def becomes', 'level becomes', 'increase', "card's level by", 'target gains', 'increase or decrease its', 'double the atk', 'double the def', 'double piercing'],
            'Boardbreaker':          ['by tributing', 'tribute', 'destroy them', 'banish it', 'banish them', 'destroy it', 'banish all', 'destroy all', 'tribute it', 'tribute them', 'banish 1', 'banish 2', 'banish 3', 'destroy 1', 'destroy 2', 'destroy 3', 'banish card', 'destroy card', 'shuffle all', 'shuffle them', 'return it', 'return them', 'return 1', 'return 2', 'return 3', 'using monsters', 'attach 1', 'attach 2', 'attach 3', 'attach them', 'attach it', 'you can shuffle 1', 'destroy that', 'banish that', 'return that', 'tribute that', 'shuffle that', 'shuffle it', 'destroy as many', 'take control of', 'banish up to', 'destroy up to', 'your opponent shuffle monsters they control', 'your opponent shuffle cards they control', 'tributing 1', 'tributing 2', 'tributing 3', 'tributing many', 'you can banish all monsters on the field'],
            'Handtrap':              ['you can send this card from your hand', 'you can discard this card', 'you can activate this card from your hand', 'this card from your hand'],
            'Burner':                ['must pay', 'your opponent lose', 'takes damage equal to', 'becomes halved', 'damage to', 'inflict damage', 'controller takes damage equal'],
            'Draw-engine':           ['draw 1', 'draw 2', 'draw 3', 'draw the same', 'you can draw'],
            'Searcher':              ['you can add', 'add 1', 'add 2', 'add 3', 'from your deck to', 'from your extra deck to', 'from your deck in', 'special summon 1', 'special summon 2', 'special summon 3', 'special summon up to', 'special summon any', 'up to the number', 'send 1', 'send 2', 'you can set', 'banish 1 monster from your deck', 'banish 1'],
            'Recycler':              ['you can add this card', 'return all', 'from your monsters on', 'return them', 'return it', 'return 1', 'return 2', 'return 3', 'place', 'special summon that', 'special summon it', 'special summon the', 'special summon 1 monster from your gy', 'special summon 1 monster from the banishment', 'special summon both monsters', 'special summon as many monsters', 'special summon 1', 'return the'],
            'Searcher (milling)':    ['send 1', 'send 2', 'send 3', 'cards of your deck', 'cards of your extra deck', 'top'],
            'LP Restore':            ['you gain', 'your opponent gains', 'gain lp equal', 'gain for each', 'you can gain', 'lp for each', 'amount of lp'],
            'Protector':             ['your opponent cannot target', 'your opponent cannot banish', 'cannot target monsters for attacks', 'in your monster zone is unaffected', 'is unaffected', 'cannot be', 'destroy the attacking monster', 'you control are unaffected'],
            'Negater':               ['the effect', "it's effects", 'its effects', 'that effect', 'the activation', 'their effects are negated', 'have their effects negated', 'that activation', 'on the field are negated', 'negate the'],
            'Boss Monster':          ['inflict piercing', 'cannot be targeted', 'cannot be destroyed', 'opponent cannot target', 'opponent cannot destroy', 'must be fusion', 'must be tribute', 'must be synchro', 'must be xyz', 'must be link', 'must be pendulum', 'must be ritual', 'must first be', 'must be special'],
            'Stun':                  ['neither player can special', 'cannot activate their effects', 'neither player can activate', 'both players must', 'your opponent cannot activate', 'cannot activate them', 'cards cannot be activated', 'any card sent to the', 'any'],
            'Speed-4':               ["in response to this card's activation", 'cannot activate cards or effects in response to this', 'by your opponent resolves'],
            'Tower':                 ['it is unaffected', 'unaffected by spell/trap effects', 'unaffected by card effects,', "unaffected by other cards' effects.", 'unaffected by other card effects.', 'card is unaffected by trap effects', 'card is unaffected by spell effects'],
            'Token Summoner':        ['special summon'],
            'Handloop':              ["look at your opponent's hand", 'each player discards', 'from their hand to', "send 1 random card from your opponent's hand"],
            'Anti-damage':           ['you take no battle damage', 'you take no effect damage'],
            'Disruptor':             ["when your opponent", "look at your opponent's extra deck", 'if your opponent activate', "from the main deck to your opponent's hand", 'each player send', 'each player discard', 'target 1 card on the field', 'target 1 monster on the field', 'both players', 'neither player can', 'opponent controls lose'],
            'Removal':               ["in your opponent's gy", "in your opponent's graveyard", "your opponent controls or in their gy", 'your opponent controls', 'gy is banished instead', 'banished instead', 'target', 'by banishing', 'banish'],
            'Grinding Card':         ['if this card is in your gy', 'if this card is in the banishment', 'you can banish this card from your gy', 'while this card is in your gy', 'if this card is sent to the gy', 'this card from your field or gy', 'this card from your field or graveyard', 'if this card is sent to the graveyard', 'while this card is in your graveyard', 'you can banish this card from your graveyard', 'if this card is in your graveyard', 'you control is sent to your gy', 'you control is sent to your graveyard', 'this card leaves the field', 'is sent from the field to the gy'],
            'Banished Card':         ['if this card is banished', 'the banished monster', 'the banished card', 'of your banished monsters', 'this card is sent to the gy, or banished', '1 of your banished', 'you can banish this card'],
            'Negate-activation':     ['the activation', 'that activation', 'negate the'],
            'Negate-effect':         ['the effect', "it's effects", 'its effects', 'its effect', 'that effect', 'their effects are negated', 'have their effects negated', 'on the field are negated'],
            'HARD-once-per-turn':    ['only activate 1', 'only use this effect of', 'only use the previous effect of', 'each effect of'],
            'SOFT-once-per-turn':    ['once', 'only use this', 'only use those', 'only use each'],
            'Stun-Banish':           ['cannot banish', 'neither player can banish', 'your opponent cannot banish'],
            'Stun-Special':          ['neither player can special', 'your opponent cannot special', 'you cannot special summon'],
            'Stun-GY':               ['neither player can special', 'cannot activate their effects', 'neither player can activate', 'your opponent cannot activate', 'cannot activate them', 'cards cannot be activated', 'any card sent to the', 'is banished instead'],
            'Stun-Effect':           ['cannot activate their effects', 'neither player can activate', 'your opponent cannot activate', 'cannot activate them', 'cards cannot be activated', 'player must', 'they must'],
            'Stun-Draw':             ['neither player can draw', 'neither player can add', 'your opponent cannot draw', 'your opponent cannot add', 'if a card(s) is added', 'if a card(s) is draw'],
            'Quick-effect':          ['quick-effect'],
            'Ignition':              ['once per turn: you can', 'once per turn: you may', 'once per turn:', 'ignition effect'],
            'Searcher (archetype)':  ['you can add', 'add 1', 'add 2', 'add 3', 'from your deck to', 'from your extra deck to', 'special summon 1', 'special summon 2', 'special summon 3', 'special summon up to'],
            'LP Restore':            ['you gain', 'your opponent gains', 'gain lp equal', 'gain for each', 'you can gain', 'lp for each', 'amount of lp'],
            'Send':                  ['send 1', 'send 2', 'send 3', 'send this card', 'to the gy', 'to your gy'],
            'Discard':               ['you can discard', 'discard 1', 'discard 2', 'discard this card', 'by discarding'],
            'Pay':                   ['must pay', 'by paying', 'pay 1000', 'pay 2000', 'pay lp', 'pay lifepoints', 'life points'],
            'Target':                ['target 1 card', 'target 2 cards', 'target 1 monster', 'target 1 spell', 'target 1 trap', 'target 1 face-up', 'target up to'],
            'Non-target':            ['destroy all', 'banish all', 'shuffle all', 'tribute all', 'send all', 'destroy them', 'banish them', 'shuffle them', 'tribute them'],
            'Untargetable':          ['cannot be targeted by', 'cannot be targeted', 'your opponent cannot target'],
            'Undestroyable':         ['cannot be destroyed by', 'cannot be destroyed', 'is unaffected by destruction'],
            'Destroyer':             ['destroy 1', 'destroy 2', 'destroy 1 monster', 'destroy 1 spell', 'destroy 1 trap', 'destroy 1 card', 'destroy up to 2'],
            'Brick':                 [],
            'Bridge':                []
        },

        // RoleConditions: keywords (actúan solos O con condicional)
        roleConditions: {
            'Starter':               { conditionals: [], keywords: ['this card is special', 'this card is normal or', "in its owner's possession is banished"] },
            'Starter (normal summon)': { conditionals: [], keywords: ['this card is normal summoned'] },
            'Extender':              { conditionals: [], keywords: ['you can special summon', 'in addition to your', 'normal summon 1', 'immediately after this effect resolves', 'monster from your hand'] },
            'Booster':               { conditionals: [], keywords: ['it gains', 'monsters you control gain', 'atk for each', 'this card gains', 'monster gains', 'this card gain', 'atk becomes', 'def becomes', 'level becomes', 'increase', "card's level by", 'target gains', 'increase or decrease its', 'double the atk', 'double the def', 'double piercing'] },
            'Boardbreaker':          { conditionals: ['you control'], keywords: ['by tributing', 'tribute', 'destroy them', 'banish it', 'banish them', 'destroy it', 'banish all', 'destroy all', 'tribute it', 'tribute them', 'banish 1', 'banish 2', 'banish 3', 'destroy 1', 'destroy 2', 'destroy 3', 'banish card', 'destroy card', 'shuffle all', 'shuffle them', 'return it', 'return them', 'return 1', 'return 2', 'return 3', 'using monsters', 'attach 1', 'attach 2', 'attach 3', 'attach them', 'attach it', 'you can shuffle 1', 'destroy that', 'banish that', 'return that', 'tribute that', 'shuffle that', 'shuffle it', 'destroy as many', 'take control of', 'banish up to', 'destroy up to', 'your opponent shuffle monsters they control', 'your opponent shuffle cards they control', 'tributing 1', 'tributing 2', 'tributing 3', 'tributing many', 'you can banish all monsters on the field'] },
            'Handtrap':              { conditionals: [], keywords: ['you can send this card from your hand', 'you can discard this card', 'you can activate this card from your hand', 'this card from your hand'] },
            'Burner':                { conditionals: [], keywords: ['must pay', 'your opponent lose', 'takes damage equal to', 'becomes halved', 'damage to', 'inflict damage', 'controller takes damage equal'] },
            'Draw-engine':           { conditionals: [], keywords: ['draw 1', 'draw 2', 'draw 3', 'draw the same', 'you can draw'] },
            'Searcher':              { conditionals: [], keywords: ['you can add', 'add 1', 'add 2', 'add 3', 'from your deck to', 'from your extra deck to', 'from your deck in', 'special summon 1', 'special summon 2', 'special summon 3', 'special summon up to', 'special summon any', 'up to the number', 'send 1', 'send 2', 'you can set', 'banish 1 monster from your deck', 'banish 1'] },
            'Recycler':              { conditionals: [], keywords: ['you can add this card', 'return all', 'from your monsters on', 'return them', 'return it', 'return 1', 'return 2', 'return 3', 'place', 'special summon that', 'special summon it', 'special summon the', 'special summon 1 monster from your gy', 'special summon 1 monster from the banishment', 'special summon both monsters', 'special summon as many monsters', 'special summon 1', 'return the'] },
            'Searcher (milling)':    { conditionals: [], keywords: ['send 1', 'send 2', 'send 3', 'cards of your deck', 'cards of your extra deck', 'top'] },
            'LP Restore':            { conditionals: [], keywords: ['you gain', 'your opponent gains', 'gain lp equal', 'gain for each', 'you can gain', 'lp for each', 'amount of lp'] },
            'Protector':             { conditionals: [], keywords: ['your opponent cannot target', 'your opponent cannot banish', 'cannot target monsters for attacks', 'in your monster zone is unaffected', 'is unaffected', 'cannot be', 'destroy the attacking monster', 'you control are unaffected'] },
            'Negater':               { conditionals: [], keywords: ['the effect', "it's effects", 'its effects', 'that effect', 'the activation', 'their effects are negated', 'have their effects negated', 'that activation', 'on the field are negated', 'negate the'] },
            'Boss Monster':          { conditionals: [], keywords: ['inflict piercing', 'cannot be targeted', 'cannot be destroyed', 'opponent cannot target', 'opponent cannot destroy', 'must be fusion', 'must be tribute', 'must be synchro', 'must be xyz', 'must be link', 'must be pendulum', 'must be ritual', 'must first be', 'must be special'] },
            'Stun':                  { conditionals: [], keywords: ['neither player can special', 'cannot activate their effects', 'neither player can activate', 'both players must', 'your opponent cannot activate', 'cannot activate them', 'cards cannot be activated', 'any card sent to the', 'any'] },
            'Speed-4':               { conditionals: [], keywords: ["in response to this card's activation", 'cannot activate cards or effects in response to this', 'by your opponent resolves'] },
            'Tower':                 { conditionals: [], keywords: ['it is unaffected', 'unaffected by spell/trap effects', 'unaffected by card effects,', "unaffected by other cards' effects.", 'unaffected by other card effects.', 'card is unaffected by trap effects', 'card is unaffected by spell effects'] },
            'Token Summoner':        { conditionals: [], keywords: ['special summon'] },
            'Handloop':              { conditionals: [], keywords: ["look at your opponent's hand", 'each player discards', 'from their hand to', "send 1 random card from your opponent's hand"] },
            'Anti-damage':           { conditionals: [], keywords: ['you take no battle damage', 'you take no effect damage'] },
            'Disruptor':             { conditionals: ["when your opponent", 'if your opponent activate', "during your opponent's"], keywords: ["look at your opponent's extra deck", "from the main deck to your opponent's hand", 'each player send', 'each player discard', 'target 1 card on the field', 'target 1 monster on the field', 'both players', 'neither player can', 'opponent controls lose'] },
            'Removal':               { conditionals: [], keywords: ["in your opponent's gy", "in your opponent's graveyard", "your opponent controls or in their gy", 'your opponent controls', 'gy is banished instead', 'banished instead', 'target', 'by banishing', 'banish'] },
            'Grinding Card':         { conditionals: [], keywords: ['if this card is in your gy', 'if this card is in the banishment', 'you can banish this card from your gy', 'while this card is in your gy', 'if this card is sent to the gy', 'this card from your field or gy', 'this card from your field or graveyard', 'if this card is sent to the graveyard', 'while this card is in your graveyard', 'you can banish this card from your graveyard', 'if this card is in your graveyard', 'you control is sent to your gy', 'you control is sent to your graveyard', 'this card leaves the field', 'is sent from the field to the gy'] },
            'Banished Card':         { conditionals: [], keywords: ['if this card is banished', 'the banished monster', 'the banished card', 'of your banished monsters', 'this card is sent to the gy, or banished', '1 of your banished', 'you can banish this card'] },
            'Negate-activation':     { conditionals: [], keywords: ['the activation', 'that activation', 'negate the'] },
            'Negate-effect':         { conditionals: [], keywords: ['the effect', "it's effects", 'its effects', 'that effect', 'their effects are negated', 'have their effects negated', 'on the field are negated'] },
            'HARD-once-per-turn':    { conditionals: [], keywords: ['only activate 1', 'only use this effect of', 'only use the previous effect of', 'each effect of'] },
            'SOFT-once-per-turn':    { conditionals: [], keywords: ['once', 'only use this', 'only use those', 'only use each'] },
            'Stun-Banish':           { conditionals: [], keywords: ['cannot banish', 'neither player can banish', 'your opponent cannot banish'] },
            'Stun-Special':          { conditionals: [], keywords: ['neither player can special', 'your opponent cannot special', 'you cannot special summon'] },
            'Stun-GY':               { conditionals: [], keywords: ['neither player can special', 'cannot activate their effects', 'neither player can activate', 'your opponent cannot activate', 'cannot activate them', 'cards cannot be activated', 'any card sent to the', 'is banished instead'] },
            'Stun-Effect':           { conditionals: [], keywords: ['cannot activate their effects', 'neither player can activate', 'your opponent cannot activate', 'cannot activate them', 'cards cannot be activated', 'player must', 'they must'] },
            'Stun-Draw':             { conditionals: [], keywords: ['neither player can draw', 'neither player can add', 'your opponent cannot draw', 'your opponent cannot add', 'if a card(s) is added', 'if a card(s) is draw'] },
            'Quick-effect':          { conditionals: ['quick-effect'], keywords: ['once per turn', 'when', 'if'] },
            'Ignition':              { conditionals: [], keywords: ['once per turn: you can', 'once per turn: you may', 'once per turn:', 'ignition effect'] },
            'Searcher (archetype)':  { conditionals: [], keywords: ['you can add', 'add 1', 'add 2', 'add 3', 'from your deck to', 'from your extra deck to', 'special summon 1', 'special summon 2', 'special summon 3', 'special summon up to'] },
            'LP Restore':            { conditionals: [], keywords: ['you gain', 'your opponent gains', 'gain lp equal', 'gain for each', 'you can gain', 'lp for each', 'amount of lp'] },
            'Send':                  { conditionals: [], keywords: ['send 1', 'send 2', 'send 3', 'send this card', 'to the gy', 'to your gy'] },
            'Discard':               { conditionals: [], keywords: ['you can discard', 'discard 1', 'discard 2', 'discard this card', 'by discarding'] },
            'Pay':                   { conditionals: [], keywords: ['must pay', 'by paying', 'pay 1000', 'pay 2000', 'pay lp', 'pay lifepoints', 'life points'] },
            'Target':                { conditionals: [], keywords: ['target 1 card', 'target 2 cards', 'target 1 monster', 'target 1 spell', 'target 1 trap', 'target 1 face-up', 'target up to'] },
            'Non-target':            { conditionals: [], keywords: ['destroy all', 'banish all', 'shuffle all', 'tribute all', 'send all', 'destroy them', 'banish them', 'shuffle them', 'tribute them'] },
            'Untargetable':          { conditionals: [], keywords: ['cannot be targeted by', 'cannot be targeted', 'your opponent cannot target'] },
            'Undestroyable':         { conditionals: [], keywords: ['cannot be destroyed by', 'cannot be destroyed', 'is unaffected by destruction'] },
            'Destroyer':             { conditionals: [], keywords: ['destroy 1', 'destroy 2', 'destroy 1 monster', 'destroy 1 spell', 'destroy 1 trap', 'destroy 1 card', 'destroy up to 2'] },
            // ⭐ FORMACION GAMES
            formacionGames: [],
        },

                // Specialties: array de pares
        specialties: [],

        // Staples: estructura simplificada
        staples: {},
        roleWeights: {
            'Starter':               1.0,
            'Starter (normal summon)': 0.5,
            'Extender':              0.7,
            'Booster':               0.5,
            'Boardbreaker':          1.0,
            'Handtrap':              1.0,
            'Burner':                0.5,
            'Draw-engine':           0.7,
            'Searcher':              1.0,
            'Searcher (archetype)':  0.7,
            'Searcher (milling)':    0.5,
            'Recycler':              0.5,
            'LP Restore':            0.5,
            'Protector':             0.7,
            'Negater':               1.0,
            'Boss Monster':          0.7,
            'Stun':                  0.7,
            'Speed-4':               1.0,
            'Tower':                 1.0,
            'Token Summoner':        0.3,
            'Handloop':              0.7,
            'Anti-damage':           0.5,
            'Disruptor':             0.7,
            'Removal':               0.7,
            'Grinding Card':         0.7,
            'Banished Card':         0.7,
            'Negate-activation':     0.8,
            'Negate-effect':         1.0,
            'HARD-once-per-turn':    0.5,
            'SOFT-once-per-turn':    0.7,
            'Stun-Banish':           0.5,
            'Stun-Special':          1.0,
            'Stun-GY':               0.7,
            'Stun-Effect':           1.0,
            'Stun-Draw':             1.0,
            'Quick-effect':          1.0,
            'Ignition':              0.5,
            'Send':                  0.7,
            'Discard':               1.0,
            'Pay':                   0.3,
            'Target':                0.7,
            'Non-target':            1.0,
            'Untargetable':          1.0,
            'Undestroyable':         1.0,
            'Destroyer':             0.7,
            'Brick':                 0.2,
            'Bridge':                0.7
        },

        // Cada categoría tiene UNA configuración directa con 4 campos
        nomenclature: {
    categories: [
        {
            id: 'invocacionInherente',
            name: 'Invocación Inherente',
            color: '#d7a3ef',
            conditions: {
                startsWith: ['you can special summon this card', 'you can normal summon this card', 'you can tribute summon this card', 'must be', 'must first be'],
                contains: ['summon', '(', 'by'],
                notContains: [';', ':'],
                endsWith: ['.', ',']
            }
        },
        {
            id: 'condicionActivacion',
            name: 'Condición - Activación',
            color: '#fcff38',
            conditions: {
                startsWith: [],
                contains: [':'],
                notContains: [';', '.', '●'],
                endsWith: [':']
            }
        },
        {
            id: 'costoActivacion',
            name: 'Costo - Activación',
            color: '#fda858',
            conditions: {
                startsWith: [],
                contains: [';'],
                notContains: ['.', ':', '●'],
                endsWith: [';']
            }
        },
        {
            id: 'efectosMultiple',
            name: 'Efectos Múltiple',
            color: '#83d7ec',
            conditions: {
                startsWith: ['●'],
                contains: ['●'],
                notContains: [';'],
                endsWith: [':', '.']
            }
        },
        {
            id: 'restriccion',
            name: 'Restricción',
            color: '#f07a7a',
            conditions: {
                startsWith: ['you cannot', 'you can only use', 'except', 'cannot be', 'you can only', 'neither player'],
                contains: ['also', ',', 'you cannot', 'only', 'use', 'follow', 'cannot be used as', 'be', 'in response', 'per turn', 'per duel'],
                notContains: [';', '●'],
                endsWith: []
            }
        },
        {
            id: 'efectoGenerico',
            name: 'Efecto Genérico',
            color: '#4bf77e',
            conditions: {
                startsWith: [],
                contains: [',', '.', 'you can'],
                notContains: [':', '●', 'can only', ';', '"'],
                endsWith: ['.', ',']
            }
        },
        {
            id: 'efectoArquetipico',
            name: 'Efecto Arquetípico',
            color: '#8fdb9c',
            conditions: {
                startsWith: [],
                contains: [',', '"', '.', 'you can'],
                notContains: ['●', ':', 'can only', 'except "', ';'],
                endsWith: [',', '.']
            }
        }
    ]
},
// ⭐ RENDIMIENTOS DECRECIENTES - parte de la config principal
        diminishingReturns: {
            enabled: true,
            crossPenalty: false,
            roleThresholds: {
                'starter':                 { optimal: 13, max: 16, curve: 0.5, crossPenalty: false },
                'discard':                 { optimal: 12, max: 20, curve: 0.5, crossPenalty: false },
                'searcher':                { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'booster':                 { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'handtrap':                { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'burner':                  { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'draw-engine':             { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'searcher (archetype)':    { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'starter (normal summon)': { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'disruptor':               { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'recycler':                { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'LP restore':              { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'searcher (milling)':      { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'negater':                 { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'protector':               { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'Stun':                    { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'Speed-4':                 { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'Tower':                   { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'token summoner':          { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'handloop':                { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'anti-damage':             { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'grinding card':           { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'banished card':           { optimal: 10, max: 15, curve: 0.5, crossPenalty: false },
                'negator':                 { optimal: 9,  max: 15, curve: 0.5, crossPenalty: false },
                'extender':                { optimal: 9,  max: 12, curve: 0.6, crossPenalty: false },
                'boardbreaker':            { optimal: 8,  max: 13, curve: 0.6, crossPenalty: false },
                'removal':                 { optimal: 8,  max: 12, curve: 0.6, crossPenalty: false },
                'boss monster':            { optimal: 6,  max: 10, curve: 0.7, crossPenalty: false },
                'recycle':                 { optimal: 6,  max: 10, curve: 0.7, crossPenalty: false }
            }
        },
        pillars: {
            consistency: ['searcher (archetype)', 'searcher', 'searcher (milling)', 'starter', 'draw-engine', 'starter (normal summon)', 'recycler'],
            power:       ['boardbreaker', 'booster', 'burner', 'boss monster', 'removal', 'Speed-4', 'handloop', 'token summoner', 'untargetable', 'undestroyable'],
            resilience:  ['negater', 'handtrap', 'protector', 'LP restore', 'disruptor', 'Tower', 'anti-damage', 'Stun', 'extender', 'grinding card', 'banished card']
        },
        // Formato: [pilar que vence, pilar que pierde]
        pillarRPS: [
            ['resilience',  'power'],
            ['power',       'consistency'],
            ['consistency', 'resilience']
        ],
        // ⭐ META LINKS - Fuentes externas de la pestaña Meta
        metaLinks: [
            { id: 'ml_1', title: 'Master Duel Meta – Tier List',      url: 'https://www.masterduelmeta.com/tier-list#power-rankings', desc: 'Tier list y power rankings de Master Duel' },
            { id: 'ml_2', title: 'YugiohMeta – Tier List',            url: 'https://www.yugiohmeta.com/tier-list',                  desc: 'Tier list TCG competitivo actualizada' },
            { id: 'ml_3', title: 'YGOProDeck',                        url: 'https://ygoprodeck.com/',                               desc: 'Base de datos y decklists de la comunidad' },
            { id: 'ml_4', title: 'Wiki Yu-Gi-Oh! (ES)',               url: 'https://yugioh.fandom.com/es/wiki/Mago_Oscuro',         desc: 'Wiki en español de Yu-Gi-Oh!' },
            { id: 'ml_5', title: 'Road of the King – Master Duel',    url: 'https://roadoftheking.com/tag/master-duel/',             desc: 'Análisis y reportes del meta de Master Duel' },
            { id: 'ml_6', title: 'Road of the King – OCG Weekly',     url: 'https://roadoftheking.com/tag/ocg-metagame-weekly/',     desc: 'Reportes semanales del meta OCG' },
        ],
        // ⭐ META MASTERS - Maestros del Juego
        metaMasters: [],
        shortcuts: [
            { label: 'Winrate',              tab: 'estadisticas', sectionId: 'winrate-sec',                  module: 'Estadisticas' },
            { label: 'Formación - Apuntes',  tab: 'formacion',    sectionId: null,                           module: null },
            { label: 'Banlist del Formato',  tab: 'config',       sectionId: 'banlist-section',              module: 'Config' },
            { label: 'Maestros del Duelo',   tab: 'config',       sectionId: 'meta-masters-config-section',  module: 'Config' },
            { label: 'Campo de Práctica',    tab: 'simuladores',  sectionId: null,                           module: null }
        ],

        // ⭐ SCORING G1/G2 — Clasificación de roles por contexto de juego
        g1g2Roles: {
            'Starter':                  'g1',
            'Starter (normal summon)':  'g1',
            'Extender':                 'g1',
            'Booster':                  'g1',
            'Boss Monster':             'g1',
            'Tower':                    'g1',
            'Token Summoner':           'g1',
            'Ignition':                 'g1',
            'Stun':                     'g1',
            'Stun-Banish':              'g1',
            'Stun-Special':             'g1',
            'Stun-GY':                  'g1',
            'Stun-Effect':              'g1',
            'Stun-Draw':                'g1',
            'Handtrap':                 'g2',
            'Boardbreaker':             'g2',
            'Disruptor':                'g2',
            'Removal':                  'g2',
            'Negate-activation':        'g2',
            'Negate-effect':            'g2',
            'Negater':                  'g2',
            'Handloop':                 'g2',
            'Speed-4':                  'g2',
            'Anti-damage':              'g2',
            'Searcher':                 'neutral',
            'Searcher (archetype)':     'neutral',
            'Searcher (milling)':       'neutral',
            'Recycler':                 'neutral',
            'Draw-engine':              'neutral',
            'LP Restore':               'neutral',
            'Protector':                'neutral',
            'Grinding Card':            'neutral',
            'Banished Card':            'neutral',
            'HARD-once-per-turn':       'neutral',
            'SOFT-once-per-turn':       'neutral',
            'Quick-effect':             'neutral',
            'Burner':                   'neutral',
            'Send':                     'neutral',
            'Discard':                  'neutral',
            'Pay':                      'neutral',
            'Target':                   'neutral',
            'Non-target':               'neutral',
            'Untargetable':             'neutral',
            'Undestroyable':            'neutral',
            'Destroyer':                'neutral',
            'Brick':                    'neutral',
            'Bridge':                   'neutral'
        },

        // ⭐ ROLE BASE POWER — Poder base L3 por rol (configurable)
        roleBasePower: {
            'Negate-activation':        10,
            'Boardbreaker':             9,
            'Negate-effect':            8,
            'Negater':                  8,
            'Tower':                    8,
            'Protector':                7,
            'Stun':                     7,
            'Stun-Effect':              7,
            'Stun-Special':             7,
            'Stun-Draw':                7,
            'Stun-Banish':              6,
            'Stun-GY':                  6,
            'Starter':                  6,
            'Searcher':                 6,
            'Searcher (archetype)':     6,
            'Handtrap':                 6,
            'Disruptor':                6,
            'Removal':                  6,
            'Extender':                 5,
            'Starter (normal summon)':  5,
            'Searcher (milling)':       5,
            'Recycler':                 5,
            'Boss Monster':             5,
            'Speed-4':                  5,
            'Handloop':                 5,
            'Draw-engine':              4,
            'Booster':                  4,
            'Destroyer':                4,
            'Non-target':               4,
            'Untargetable':             4,
            'Undestroyable':            4,
            'Grinding Card':            4,
            'Banished Card':            4,
            'Token Summoner':           3,
            'Send':                     3,
            'Discard':                  3,
            'Target':                   3,
            'LP Restore':               3,
            'Quick-effect':             3,
            'Ignition':                 3,
            'Anti-damage':              3,
            'HARD-once-per-turn':       2,
            'SOFT-once-per-turn':       2,
            'Burner':                   2,
            'Pay':                      2,
            'Bridge':                   2,
            'Brick':                    1
        },

        // ⭐ SCORING LAYERS — Capas L1, L2, L4, L5 (multiplicadores por keywords en nomenclatura)
        scoringLayers: {
            L1: {
                nomenclatureCategory: 'condicionActivacion',
                entries: [
                    { keywords: ['quick effect', 'during either player', "during your opponent's turn", 'when your opponent'], multiplier: 1.30 },
                    { keywords: ["during your opponent's", 'when your opponent activates', 'if your opponent activates'], multiplier: 1.20 },
                    { keywords: ['when this card is normal summoned', 'when this card is special summoned', 'when this card is summoned'], multiplier: 1.00 },
                    { keywords: ['continuous', 'as long as', 'while this card'], multiplier: 0.90 }
                ]
            },
            L2: {
                nomenclatureCategory: 'costoActivacion',
                entries: [
                    { keywords: ['discard', 'by discarding', 'send from your hand'], multiplier: 0.85 },
                    { keywords: ['tribute', 'by tributing', 'send from your field', 'send 1 monster you control'], multiplier: 0.80 },
                    { keywords: ['pay', 'by paying', 'pay lp', 'life points'], multiplier: 0.95 }
                ]
            },
            L4: {
                nomenclatureCategory: 'restriccion',
                entries: [
                    { keywords: ['once per duel', 'only once while'], multiplier: 0.50 },
                    { keywords: ['you cannot use other effects', 'you cannot activate', 'you cannot special summon except', 'only from the extra deck'], multiplier: 0.75 },
                    { keywords: ['once per turn', 'only use this effect once', 'only activate 1'], multiplier: 0.85 }
                ]
            },
            L5: {
                nomenclatureCategory: 'efectoGenerico',
                entries: [
                    { keywords: ['any card your opponent activates', 'any effect', 'any card or effect'], multiplier: 1.00 },
                    { keywords: ['1 monster', '1 spell', '1 trap', 'target 1', 'one monster your opponent'], multiplier: 0.90 },
                    { keywords: ['only if', 'only when', 'that includes', 'if it includes'], multiplier: 0.80 },
                    { keywords: ['"', 'archetype', 'only for'], multiplier: 0.65 }
                ]
            }
        },

        // ⭐ RELIABILITY TABLE — Fiabilidad por copias en mano de apertura (deck 40, mano 5)
        reliabilityTable: { 1: 0.40, 2: 0.65, 3: 0.85, 4: 0.90, 5: 0.95 }
    },
    

    // ===============================

    getConfig: function () {
        try {
            const saved = localStorage.getItem('yugioh_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                
                if (parsed.specialties && !Array.isArray(parsed.specialties)) {
                    console.log('Migrando specialties de objeto a array');
                    parsed.specialties = JSON.parse(JSON.stringify(this.defaultConfig.specialties));
                }
                
                if (parsed.staples) {
                    Object.keys(parsed.staples).forEach(id => {
                        const s = parsed.staples[id];
                        if (s.roles !== undefined || s.specialtyKeywords !== undefined) {
                            parsed.staples[id] = {
                                id: s.id || id,
                                name: s.nameEn || s.name || '',
                                imageUrl: s.imageUrl || `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`,
                                type: s.type || ''
                            };
                        }
                    });
                }
                
                if (parsed.nomenclature) {
                    if (!parsed.nomenclature.categories && (parsed.nomenclature.effectSpeed || parsed.nomenclature.effectType)) {
                        console.log('Migrando nomenclature OLD a NUEVA estructura');
                        parsed.nomenclature = JSON.parse(JSON.stringify(this.defaultConfig.nomenclature));
                    }
                }
                if (parsed.nomenclature && parsed.nomenclature.categories) {
                    parsed.nomenclature.categories.forEach(cat => {
                        if (cat.conditions) {
                            if (typeof cat.conditions.contains === 'string') {
                                cat.conditions.contains = cat.conditions.contains.trim() ? [cat.conditions.contains.trim()] : [];
                            }
                            if (typeof cat.conditions.notContains === 'string') {
                                cat.conditions.notContains = cat.conditions.notContains.trim() ? [cat.conditions.notContains.trim()] : [];
                            }
                        }
                    });
                }
                if (Array.isArray(parsed.specialties)) {
                    parsed.specialties = parsed.specialties.map(pair => {
                        if (pair.specialization !== undefined) {
                            return {
                                id:           pair.id,
                                mechanicRole: pair.specialization?.rol || '',
                                counterRole:  pair.counter?.rol        || ''
                            };
                        }
                        return pair;
                    });
                }
                return parsed;
            }
        } catch (err) {
            console.error('Error cargando configuración:', err);
        }
        return JSON.parse(JSON.stringify(this.defaultConfig));
    },

    saveConfig: function (config) {
        try {
            localStorage.setItem('yugioh_config', JSON.stringify(config));
            return true;
        } catch (err) {
            console.error('Error guardando configuración:', err);
            return false;
        }
    },

    resetToDefault: function () {
        this.saveConfig(JSON.parse(JSON.stringify(this.defaultConfig)));
        return true;
    },

    exportConfig: function () {
        try {
            const snapshot = {};
            // Claves estáticas conocidas
            const staticKeys = [
                'yugioh_config', 'yugioh_banlist_data', 'yugioh_engines',
                'yugioh_winrates', 'pz_winrate_standalone', 'yugioh_power_cache',
                'yugioh_cross_scores', 'yugioh_meta_decks', 'yugioh_meta_card_library',
                'yugioh_meta_deck_scores', 'yugioh_favoritas', 'yugioh_formacion_notes',
                'yugioh_formacion_mastered', 'yugioh_torneo_actual',
                'dd_content_visibility', 'dd_player_profile'
            ];
            staticKeys.forEach(k => {
                const v = localStorage.getItem(k);
                if (v !== null) snapshot[k] = v;
            });
            // Claves dinámicas: deck_, matchup_, pz_states_
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k) continue;
                if (k.startsWith('deck_') || k.startsWith('matchup_') || k.startsWith('pz_states_')) {
                    snapshot[k] = localStorage.getItem(k);
                }
            }
            const json = JSON.stringify(snapshot, null, 2);
            const blob = new Blob([json], { type: 'text/plain' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url;
            a.download = `destiny_draw_backup_${new Date().toISOString().slice(0,10)}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (err) {
            console.error('Error exportando:', err);
            return false;
        }
    },

    importConfig: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const snapshot = JSON.parse(e.target.result);
                    if (typeof snapshot !== 'object' || Array.isArray(snapshot))
                        throw new Error('Formato inválido');
                    // Limpiar todo primero
                    const allKeys = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k) allKeys.push(k);
                    }
                    allKeys.forEach(k => localStorage.removeItem(k));
                    // Restaurar cada clave del backup
                    Object.entries(snapshot).forEach(([k, v]) => {
                        if (v !== null && v !== undefined) localStorage.setItem(k, v);
                    });
                    resolve(true);
                } catch (err) {
                    reject('Archivo inválido: ' + err.message);
                }
            };
            reader.onerror = () => reject('Error al leer el archivo');
            reader.readAsText(file);
        });
    },

    // ===============================

    getRoles: function () {
        return this.getConfig().roles || {};
    },
    setRoleWeight: function (roleName, weight) {
        const config = this.getConfig();
        if (!config.roleWeights) config.roleWeights = {};
        config.roleWeights[roleName] = Math.max(0.1, Math.min(2.0, weight));
        this.saveConfig(config);
    },

    getRoleWeight: function (roleName) {
        const w = this.getConfig().roleWeights?.[roleName];
        return (w !== undefined && w > 0) ? w : 1.0;
    },

    getRoleNames: function () {
        return Object.keys(this.getRoles());
    },

    getRoleKeywords: function (roleName) {
        return (this.getRoles()[roleName] || []);
    },

   createRole: function(roleName) {
    const config = this.getConfig();
    const name = roleName.trim();
    if (!name || config.roles[name] !== undefined) return false;
    config.roles = Object.assign({ [name]: [] }, config.roles);
    if (!config.roleWeights) config.roleWeights = {};
    config.roleWeights[name] = 1.0;
    this.saveConfig(config);
    return true;
},
duplicateRole: function(roleName) {
    const config   = this.getConfig();
    const original = config.roles[roleName];
    if (original === undefined) return null;

    let copyName = roleName + ' (copia)';
    let counter  = 2;
    while (config.roles[copyName] !== undefined) {
        copyName = roleName + ` (copia ${counter++})`;
    }

    config.roles = Object.assign({ [copyName]: [...original] }, config.roles);

    if (!config.roleWeights) config.roleWeights = {};
    config.roleWeights[copyName] = config.roleWeights[roleName] ?? 1.0;

    if (config.roleConditions?.[roleName]) {
        if (!config.roleConditions) config.roleConditions = {};
        config.roleConditions[copyName] = JSON.parse(
            JSON.stringify(config.roleConditions[roleName])
        );
    }

    this.saveConfig(config);
    return copyName;
},
    renameRole: function (oldName, newName) {
        const config = this.getConfig();
        const trimmed = newName.trim();
        if (config.roles[oldName] !== undefined && trimmed && config.roles[trimmed] === undefined) {
            config.roles[trimmed] = config.roles[oldName];
            delete config.roles[oldName];
            if (config.roleWeights?.[oldName] !== undefined) {
                config.roleWeights[trimmed] = config.roleWeights[oldName];
                delete config.roleWeights[oldName];
            }
            if (config.roleConditions && config.roleConditions[oldName]) {
                config.roleConditions[trimmed] = config.roleConditions[oldName];
                delete config.roleConditions[oldName];
            }
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    deleteRole: function (roleName) {
        const config = this.getConfig();
        if (config.roles[roleName] !== undefined) {
            delete config.roles[roleName];
            if (config.roleWeights) delete config.roleWeights[roleName];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    addKeywordToRole: function (roleName, keyword) {
        const config = this.getConfig();
        if (!config.roles[roleName]) config.roles[roleName] = [];
        const kw = keyword.toLowerCase().trim();
        if (kw && !config.roles[roleName].includes(kw)) {
            config.roles[roleName].push(kw);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    removeKeywordFromRole: function (roleName, keyword) {
        const config = this.getConfig();
        if (config.roles[roleName]) {
            const idx = config.roles[roleName].indexOf(keyword);
            if (idx > -1) {
                config.roles[roleName].splice(idx, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // ===============================

    getRoleConditions: function () {
        return this.getConfig().roleConditions || {};
    },

    getRoleCondition: function (roleName) {
        return (this.getConfig().roleConditions || {})[roleName] || null;
    },
getG1G2Roles: function () {
        return this.getConfig().g1g2Roles || {};
    },

    getRoleG1G2: function (roleName) {
        return (this.getG1G2Roles()[roleName]) || 'neutral';
    },

    getRoleBasePowers: function () {
        return this.getConfig().roleBasePower || {};
    },

    getRoleBasePower: function (roleName) {
        const table = this.getRoleBasePowers();
        return (table[roleName] !== undefined) ? table[roleName] : 3;
    },

    getScoringLayers: function () {
        return this.getConfig().scoringLayers || {};
    },

    getReliabilityTable: function () {
        return this.getConfig().reliabilityTable || { 1: 0.40, 2: 0.65, 3: 0.85, 4: 0.90, 5: 0.95 };
    },

    getReliability: function (copies) {
        const table = this.getReliabilityTable();
        const n = Math.min(Math.max(Math.round(copies), 1), 5);
        if (table[n] !== undefined) return table[n];
        // Interpolación para valores fuera de tabla
        const keys = Object.keys(table).map(Number).sort((a,b) => a-b);
        const last = keys[keys.length - 1];
        return table[last] || 0.95;
    },
    hasConditions: function (roleName) {
        const condition = this.getRoleCondition(roleName);
        return condition && condition.conditionals && condition.conditionals.length > 0;
    },

    setRoleCondition: function (roleName, conditionals, keywords) {
        const config = this.getConfig();
        if (!config.roleConditions) config.roleConditions = {};
        config.roleConditions[roleName] = {
            conditionals: conditionals || [],
            keywords: keywords || []
        };
        this.saveConfig(config);
        return true;
    },

    removeRoleCondition: function (roleName) {
        const config = this.getConfig();
        if (config.roleConditions && config.roleConditions[roleName]) {
            delete config.roleConditions[roleName];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    addConditionalToRole: function (roleName, conditional) {
        const config = this.getConfig();
        if (!config.roleConditions) config.roleConditions = {};
        if (!config.roleConditions[roleName]) {
            config.roleConditions[roleName] = { conditionals: [], keywords: [] };
        }
        const val = conditional.toLowerCase().trim();
        if (val && !config.roleConditions[roleName].conditionals.includes(val)) {
            config.roleConditions[roleName].conditionals.push(val);
            this.saveConfig(config);
            return true;
        }
        return false;
    },
    setRoleNomenclatureCategory: function (roleName, categoryId) {
        const config = this.getConfig();
        if (!config.roleConditions) config.roleConditions = {};
        if (!config.roleConditions[roleName]) {
            config.roleConditions[roleName] = { conditionals: [], keywords: [] };
        }
        config.roleConditions[roleName].nomenclatureCategory =
            (!categoryId || categoryId === '—') ? null : categoryId;
        this.saveConfig(config);
    },
getRoleNomenclatureCategories: function(roleName) {
    const cond = this.getRoleCondition(roleName);
    if (!cond) return [];
    if (Array.isArray(cond.nomenclatureCategories)) return cond.nomenclatureCategories;
    if (cond.nomenclatureCategory && cond.nomenclatureCategory !== '—')
        return [cond.nomenclatureCategory];
    return [];
},

addRoleNomenclatureCategory: function(roleName, catId) {
    if (!catId || catId === '—') return false;
    const config = this.getConfig();
    if (!config.roleConditions) config.roleConditions = {};
    if (!config.roleConditions[roleName])
        config.roleConditions[roleName] = { conditionals: [], keywords: [] };
    const cats = config.roleConditions[roleName].nomenclatureCategories || [];
    if (cats.includes(catId)) return false;
    cats.push(catId);
    config.roleConditions[roleName].nomenclatureCategories = cats;
    this.saveConfig(config);
    return true;
},

removeRoleNomenclatureCategory: function(roleName, catId) {
    const config = this.getConfig();
    if (!config.roleConditions?.[roleName]) return false;
    const cats = config.roleConditions[roleName].nomenclatureCategories || [];
    const idx  = cats.indexOf(catId);
    if (idx === -1) return false;
    cats.splice(idx, 1);
    config.roleConditions[roleName].nomenclatureCategories = cats;
    this.saveConfig(config);
    return true;
},
    removeConditionalFromRole: function (roleName, conditional) {
        const config = this.getConfig();
        if (config.roleConditions && config.roleConditions[roleName]) {
            const idx = config.roleConditions[roleName].conditionals.indexOf(conditional);
            if (idx > -1) {
                config.roleConditions[roleName].conditionals.splice(idx, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    addKeywordToRoleCondition: function (roleName, keyword) {
        const config = this.getConfig();
        if (!config.roleConditions) config.roleConditions = {};
        if (!config.roleConditions[roleName]) {
            config.roleConditions[roleName] = { conditionals: [], keywords: [] };
        }
        const kw = keyword.toLowerCase().trim();
        if (kw && !config.roleConditions[roleName].keywords.includes(kw)) {
            config.roleConditions[roleName].keywords.push(kw);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    removeKeywordFromRoleCondition: function (roleName, keyword) {
        const config = this.getConfig();
        if (config.roleConditions && config.roleConditions[roleName]) {
            const idx = config.roleConditions[roleName].keywords.indexOf(keyword);
            if (idx > -1) {
                config.roleConditions[roleName].keywords.splice(idx, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    addNotContainsToRole: function (roleName, kw) {
        const config = this.getConfig();
        if (!config.roleConditions) config.roleConditions = {};
        if (!config.roleConditions[roleName])
            config.roleConditions[roleName] = { conditionals: [], keywords: [], notContains: [] };
        if (!config.roleConditions[roleName].notContains) config.roleConditions[roleName].notContains = [];
        const val = kw.toLowerCase().trim();
        if (val && !config.roleConditions[roleName].notContains.includes(val)) {
            config.roleConditions[roleName].notContains.push(val);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    removeNotContainsFromRole: function (roleName, index) {
        const config = this.getConfig();
        if (!config.roleConditions?.[roleName]?.notContains) return false;
        if (index < 0 || index >= config.roleConditions[roleName].notContains.length) return false;
        config.roleConditions[roleName].notContains.splice(index, 1);
        this.saveConfig(config);
        return true;
    },

    // ===============================

    getSpecialties: function () {
        const config = this.getConfig();
        return Array.isArray(config.specialties) ? config.specialties : [];
    },

    getSpecialtyPairById: function (id) {
        return this.getSpecialties().find(p => p.id === id) || null;
    },

    createSpecialtyPair: function(mechanicRole, counterRole) {
    const config = this.getConfig();
    if (!Array.isArray(config.specialties)) config.specialties = [];
    const newPair = {
        id: 'spec_' + Date.now(),
        mechanicRole: mechanicRole || '',
        counterRole:  counterRole  || ''
    };
    config.specialties.unshift(newPair);
    this.saveConfig(config);
    return newPair.id;
},

updateSpecialtyPair: function(id, mechanicRole, counterRole) {
    const config = this.getConfig();
    const pair = (config.specialties || []).find(p => p.id === id);
    if (!pair) return false;
    pair.mechanicRole = mechanicRole;
    pair.counterRole  = counterRole;
    this.saveConfig(config);
    return true;
},

    deleteSpecialtyPair: function (id) {
        const config = this.getConfig();
        if (!Array.isArray(config.specialties)) return false;
        const idx = config.specialties.findIndex(p => p.id === id);
        if (idx > -1) {
            config.specialties.splice(idx, 1);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    updateSpecialtyPairField: function (id, side, field, value) {
        const config = this.getConfig();
        const pair = (config.specialties || []).find(p => p.id === id);
        if (pair && pair[side]) {
            pair[side][field] = value;
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    addKeywordToSpecialtyPair: function (id, side, keyword) {
        const config = this.getConfig();
        const pair = (config.specialties || []).find(p => p.id === id);
        if (pair && pair[side]) {
            const kw = keyword.toLowerCase().trim();
            if (kw && !pair[side].keywords.includes(kw)) {
                pair[side].keywords.push(kw);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    removeKeywordFromSpecialtyPair: function (id, side, keyword) {
        const config = this.getConfig();
        const pair = (config.specialties || []).find(p => p.id === id);
        if (pair && pair[side]) {
            const idx = pair[side].keywords.indexOf(keyword);
            if (idx > -1) {
                pair[side].keywords.splice(idx, 1);
                this.saveConfig(config);
                return true;
            }
        }
        return false;
    },

    // ===============================

    getStaples: function () {
        return this.getConfig().staples || {};
    },

    getStapleIds: function () {
        return Object.keys(this.getStaples());
    },

    getStaple: function (cardId) {
        return (this.getConfig().staples || {})[String(cardId)] || null;
    },

    isStaple: function (cardId) {
        return this.getStaple(String(cardId)) !== null;
    },

    createStaple: function (cardId, data) {
        const config = this.getConfig();
        if (!config.staples) config.staples = {};
        const id = String(cardId).trim();
        if (!id || config.staples[id]) return false;
        config.staples[id] = {
            id: id,
            name: data.name || '',
            imageUrl: data.imageUrl || `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`,
            type: data.type || ''
        };
        this.saveConfig(config);
        return true;
    },

    deleteStaple: function (cardId) {
        const config = this.getConfig();
        const id = String(cardId);
        if (config.staples && config.staples[id]) {
            delete config.staples[id];
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // ===============================

    getNomenclature: function () {
        const config = this.getConfig();
        return config.nomenclature || this.defaultConfig.nomenclature;
    },

    getNomenclatureColors: function () {
        const cats = this.getNomenclature().categories || [];
        const colors = {};
        cats.forEach(c => { colors[c.id] = c.color; });
        return colors;
    },

    updateNomenclatureColor: function (categoryId, color) {
        return this.updateNomenclatureCategory(categoryId, { color: color });
    },

    updateNomenclatureCategory: function (categoryId, updates) {
        const config = this.getConfig();
        if (!config.nomenclature || !config.nomenclature.categories) {
            config.nomenclature = JSON.parse(JSON.stringify(this.defaultConfig.nomenclature));
        }
        const cat = config.nomenclature.categories.find(c => c.id === categoryId);
        if (cat) {
            Object.assign(cat, updates);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    addNomenclatureCategory: function () {
        const config = this.getConfig();
        if (!config.nomenclature || !config.nomenclature.categories) {
            config.nomenclature = JSON.parse(JSON.stringify(this.defaultConfig.nomenclature));
        }
       config.nomenclature.categories.unshift({
            id: 'custom_' + Date.now(),
            name: 'Nueva Categoría',
            color: '#FFFFFF',
            conditions: { startsWith: '', contains: [], notContains: [], endsWith: '.' }
        });
        this.saveConfig(config);
        return true;
    },

    deleteNomenclatureCategory: function (categoryId) {
        const config = this.getConfig();
        if (!config.nomenclature || !config.nomenclature.categories) return false;
        const idx = config.nomenclature.categories.findIndex(c => c.id === categoryId);
        if (idx > -1) {
            config.nomenclature.categories.splice(idx, 1);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    updateNomenclatureCategoryCondition: function (categoryId, conditionField, value) {
        const config = this.getConfig();
        if (!config.nomenclature || !config.nomenclature.categories) return false;
        const cat = config.nomenclature.categories.find(c => c.id === categoryId);
        if (cat && cat.conditions) {
            cat.conditions[conditionField] = value;
            this.saveConfig(config);
            return true;
        }
        return false;
    },
 addNomCondKw: function (categoryId, field, keyword) {
        const config = this.getConfig();
        const cat = (config.nomenclature?.categories || []).find(c => c.id === categoryId);
        if (!cat || !cat.conditions) return false;
        if (!Array.isArray(cat.conditions[field])) {
            cat.conditions[field] = cat.conditions[field]
                ? [String(cat.conditions[field])]
                : [];
        }
        const kw = keyword.trim();
        if (kw && !cat.conditions[field].includes(kw)) {
            cat.conditions[field].push(kw);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

removeNomCondKw: function (categoryId, field, keyword) {
        const config = this.getConfig();
        const cat = (config.nomenclature?.categories || []).find(c => c.id === categoryId);
        if (!cat || !cat.conditions || !Array.isArray(cat.conditions[field])) return false;
        const idx = cat.conditions[field].indexOf(keyword);
        if (idx > -1) {
            cat.conditions[field].splice(idx, 1);
            this.saveConfig(config);
            return true;
        }
        return false;
    },

    // Eliminar por índice — evita bugs con comillas en el onclick
    removeNomCondKwByIndex: function (categoryId, field, index) {
        const config = this.getConfig();
        const cat = (config.nomenclature?.categories || []).find(c => c.id === categoryId);
        if (!cat || !cat.conditions || !Array.isArray(cat.conditions[field])) return false;
        if (index >= 0 && index < cat.conditions[field].length) {
            cat.conditions[field].splice(index, 1);
            this.saveConfig(config);
            return true;
        }
        return false;
    },
// ===============================

getDiminishingReturns: function () {
    const config = this.getConfig();
    return config.diminishingReturns || this.getDefaultDiminishingReturns();
},

getDefaultDiminishingReturns: function () {
    return JSON.parse(JSON.stringify(this.defaultConfig.diminishingReturns));
},

saveDiminishingReturns: function (diminishing) {
    const config = this.getConfig();
    config.diminishingReturns = diminishing;
    return this.saveConfig(config);
},

updateRoleThreshold: function (roleName, threshold) {
    const config = this.getDiminishingReturns();
    config.roleThresholds[roleName] = threshold;
    return this.saveDiminishingReturns(config);
},
getPillars: function() {
    const config = this.getConfig();
    return config.pillars || JSON.parse(JSON.stringify(this.defaultConfig.pillars));
},

addRoleToPillar: function(pillar, role) {
    const config = this.getConfig();
    if (!config.pillars) config.pillars = { consistency: [], power: [], resilience: [] };
    if (!config.pillars[pillar]) config.pillars[pillar] = [];
    if (config.pillars[pillar].includes(role)) return false;
    config.pillars[pillar].push(role);
    this.saveConfig(config);
    return true;
},

removeRoleFromPillar: function(pillar, role) {
    const config = this.getConfig();
    if (!config.pillars?.[pillar]) return false;
    const idx = config.pillars[pillar].indexOf(role);
    if (idx === -1) return false;
    config.pillars[pillar].splice(idx, 1);
    this.saveConfig(config);
    return true;
},
getPillarRPS: function () {
    const config = this.getConfig();
    return config.pillarRPS || JSON.parse(JSON.stringify(this.defaultConfig.pillarRPS));
},

savePillarRPS: function (rps) {
    const config = this.getConfig();
    config.pillarRPS = rps;
    this.saveConfig(config);
},
getShortcuts: function () {
    const config = this.getConfig();
    return config.shortcuts || JSON.parse(JSON.stringify(this.defaultConfig.shortcuts));
},

saveShortcuts: function (shortcuts) {
    const config = this.getConfig();
    config.shortcuts = shortcuts;
    this.saveConfig(config);
},
renderStaplesPanel: function () {
    if (window.Engines && Engines._activeTab === 'staples') {
        Engines._renderSidebar();
        return;
    }
    const panel = document.getElementById('staples-panel');
    const list  = document.getElementById('staples-list');
    if (!panel || !list) return;

    const staples = this.getStaples();
    const cards   = Object.values(staples)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    if (cards.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = '';

    this._staplePanelCards = cards;

    list.innerHTML = cards.map((c, i) => `
        <div class="fav-item" onclick="ConfigManager.showStapleActions(${i}, this)">
            <img src="${c.imageUrl || ''}" class="fav-img" loading="lazy" alt="${c.name}"
                 onerror="this.style.background='#002b4d';this.src='';">
            <div class="fav-info">
                <div class="fav-name">${c.name}</div>
                <div class="fav-type">${c.type || ''}</div>
            </div>
            <button class="fav-remove"
                onclick="event.stopPropagation(); ConfigManager.deleteStaple('${c.id}'); ConfigManager.renderStaplesPanel();"
                title="Quitar staple">✕</button>
        </div>
    `).join('');
},

showStapleActions: function (index, el) {
    document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
    document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));

    const cards = this._staplePanelCards;
    if (!cards) return;

    const overlay = document.createElement('div');
    overlay.className = 'fav-actions-overlay';
    overlay.innerHTML = `
        <button class="card-action-btn btn-view"
            onclick="event.stopPropagation(); ConfigManager.openStapleCard(${index});">Ver</button>
        <button class="card-action-btn btn-add"
            onclick="event.stopPropagation(); ConfigManager.addStapleToDeck(${index});">Añadir</button>
    `;
    el.appendChild(overlay);
    el.classList.add('fav-item-active');
},

openStapleCard: function (index) {
    document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
    document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));
    const c = this._staplePanelCards?.[index];
    if (!c?.id || !window.CardViewer) return;
    // Buscar datos completos en el powerCache o hacer fetch
    const cached = window.Estadisticas?.powerScoreCache?.cards
        ?.find(pc => String(pc.cardId) === String(c.id));
    if (cached?.cardData) {
        CardViewer.open(cached.cardData);
    } else {
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${c.id}`)
            .then(r => r.json())
            .then(d => { if (d.data?.[0]) CardViewer.open(d.data[0]); })
            .catch(() => {});
    }
},

addStapleToDeck: function (index) {
    document.querySelectorAll('.fav-actions-overlay').forEach(o => o.remove());
    document.querySelectorAll('.fav-item-active').forEach(i => i.classList.remove('fav-item-active'));
    const c = this._staplePanelCards?.[index];
    if (!c?.id || !window.Deck) return;
    const cached = window.Estadisticas?.powerScoreCache?.cards
        ?.find(pc => String(pc.cardId) === String(c.id));
    if (cached?.cardData) {
        Deck.syncFromViewer(c.id, cached.cardData, 1);
    } else {
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${c.id}`)
            .then(r => r.json())
            .then(d => { if (d.data?.[0]) Deck.syncFromViewer(c.id, d.data[0], 1); })
            .catch(() => {});
    }
},

MUSIC_KEY: 'yugioh_music_config',
PLAYER_LEVEL_KEY: 'yugioh_player_level',

getPlayerLevel: function () {
    return localStorage.getItem(this.PLAYER_LEVEL_KEY) || 'default';
},

savePlayerLevel: function (level) {
    localStorage.setItem(this.PLAYER_LEVEL_KEY, level);
},

defaultMusicConfig: {
    enabled: true,
    volume: 0.40,
    tracks: {
        default:     'ots/Climax_Theme_6.mp3',
        novato:      'ots/Climax_Theme_7.mp3',
        casual:      'ots/Climax_Theme_5.mp3',
        competitivo: 'ots/Climax_Theme_1.mp3'
    }
},

getMusicConfig: function () {
    try {
        const saved = JSON.parse(localStorage.getItem(this.MUSIC_KEY));
        if (!saved) return { ...this.defaultMusicConfig };
        return { ...this.defaultMusicConfig, ...saved, tracks: { ...this.defaultMusicConfig.tracks, ...(saved.tracks || {}) } };
    } catch (_) { return { ...this.defaultMusicConfig }; }
},

saveMusicConfig: function (cfg) {
    localStorage.setItem(this.MUSIC_KEY, JSON.stringify(cfg));
},
// ===============================
getMetaLinks: function () {
    const config = this.getConfig();
    return config.metaLinks || JSON.parse(JSON.stringify(this.defaultConfig.metaLinks));
},

saveMetaLinks: function (links) {
    const config = this.getConfig();
    config.metaLinks = links;
    this.saveConfig(config);
},
// ===============================
getMetaMasters: function () {
    const config = this.getConfig();
    return config.metaMasters || JSON.parse(JSON.stringify(this.defaultConfig.metaMasters));
},
saveMetaMasters: function (masters) {
    const config = this.getConfig();
    config.metaMasters = masters;
    this.saveConfig(config);
},
META_FALLBACKS_KEY: 'yugioh_meta_fallbacks',

getMetaFallbacks: function () {
    try {
        return JSON.parse(localStorage.getItem(this.META_FALLBACKS_KEY)) || {};
    } catch (_) { return {}; }
},

saveMetaFallback: function (masterId, dataUrl) {
    try {
        const all = this.getMetaFallbacks();
        if (dataUrl) all[masterId] = dataUrl;
        else delete all[masterId];
        localStorage.setItem(this.META_FALLBACKS_KEY, JSON.stringify(all));
        return true;
    } catch (e) {
        console.error('Error guardando fallback:', e);
        return false;
    }
},

removeMetaFallback: function (masterId) {
    this.saveMetaFallback(masterId, null);
},
// ===============================
getMetaLinks: function () {
    const config = this.getConfig();
    return config.metaLinks || JSON.parse(JSON.stringify(this.defaultConfig.metaLinks));
},
saveMetaLinks: function (links) {
    const config = this.getConfig();
    config.metaLinks = links;
    this.saveConfig(config);
},
FORMACION_FALLBACKS_KEY: 'yugioh_formacion_fallbacks',

getFormacionGames: function () {
    const config = this.getConfig();
    return config.formacionGames || [];
},
saveFormacionGames: function (games) {
    const config = this.getConfig();
    config.formacionGames = games;
    this.saveConfig(config);
},
getFormacionFallbacks: function () {
    try {
        return JSON.parse(localStorage.getItem(this.FORMACION_FALLBACKS_KEY)) || {};
    } catch (_) { return {}; }
},
saveFormacionFallback: function (gameId, dataUrl) {
    try {
        const all = this.getFormacionFallbacks();
        if (dataUrl) all[gameId] = dataUrl;
        else delete all[gameId];
        localStorage.setItem(this.FORMACION_FALLBACKS_KEY, JSON.stringify(all));
        return true;
    } catch (e) {
        console.error('Error guardando fallback:', e);
        return false;
    }
},
// ===============================
getFormacionTopicsConfig: function () {
    const config = this.getConfig();
    return config.formacionTopicsConfig || {};
},
saveFormacionTopicsConfig: function (cfg) {
    const config = this.getConfig();
    config.formacionTopicsConfig = cfg;
    this.saveConfig(config);
},
};

window.ConfigManager = ConfigManager;



// ── Stats — motor de scores: Internal, External, CounterDeck, RPS, DiminishingReturns ──

const Stats = {

    // DESPUÉS:
    calculateDiminishingReturns: function(roleName, count) {
        const config = window.ConfigManager?.getDiminishingReturns?.();
        if (!config || !config.enabled) {
            return count;
        }
        
        const threshold = config.roleThresholds?.[roleName];
        if (!threshold) {
            return Math.sqrt(count);
        }
        
        if (count <= threshold.optimal) {
            return count;
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

    // ── Scores absolutos (sin normalización ni ponderación) ──────
    const consistency = Math.max(0, consistencyScore);
    const power       = Math.max(0, powerScore);
    const resilience  = Math.max(0, resilienceScore);

    let penalty = 0;
    if (mainCards > 43) penalty = (mainCards - 43) * 0.5;

    const internalScore = Math.max(0, consistency + power + resilience - penalty);

    // ── G1/G2 Score — loop paralelo con sistema de capas ──────────
    const g1g2Map       = window.ConfigManager?.getG1G2Roles?.()   || {};
    const layers        = window.ConfigManager?.getScoringLayers?.() || {};
    const relTable      = window.ConfigManager?.getReliabilityTable?.() || { 1:0.40, 2:0.65, 3:0.85, 4:0.90, 5:0.95 };

    // Función local: fiabilidad por copias con pool efectivo
    const getReliability = (copies) => {
        const n = Math.min(Math.max(Math.round(copies), 1), 5);
        return relTable[n] ?? relTable[Object.keys(relTable).map(Number).sort((a,b)=>b-a)[0]] ?? 0.95;
    };

    // Pre-calcular pool efectivo de searchers por arquetipo
    const archetypeSearcherPool = {};
    for (const [, item] of Object.entries(cards)) {
        if (item.location !== 'main') continue;
        const itemRoles = (item.roles || []).map(r => r.toLowerCase());
        if (!itemRoles.includes('searcher') && !itemRoles.includes('searcher (archetype)')) continue;
        const arch = (item.data?.archetype || '').toLowerCase().trim();
        if (!arch) continue;
        archetypeSearcherPool[arch] = (archetypeSearcherPool[arch] || 0) + (item.qty || 1);
    }

    // Función local: aplicar capas L1, L2, L4, L5
    const applyLayers = (desc, segments) => {
        let mult = 1.0;
        ['L1','L2','L4','L5'].forEach(lKey => {
            const layer = layers[lKey];
            if (!layer) return;
            const catId    = layer.nomenclatureCategory;
            const texts    = (segments[catId] || []).join(' ');
            if (!texts) return;
            for (const entry of (layer.entries || [])) {
                const hit = (entry.keywords || []).some(kw => texts.includes(kw.toLowerCase()));
                if (hit) { mult *= entry.multiplier; break; }
            }
        });
        return mult;
    };

    let g1Score = 0;
    let g2Score = 0;

    for (const [, item] of Object.entries(cards)) {
        if (item.location !== 'main') continue;
        const qty   = item.qty || 1;
        const roles = (item.roles || []);
        if (roles.length === 0) continue;

        const desc     = item.data?.desc || '';
        const arch     = (item.data?.archetype || '').toLowerCase().trim();
        const segments = window.NomenclatureAnalyzer?.segmentDescription?.(desc) || {};

        // Pool efectivo: copias directas + searchers del mismo arquetipo (otros)
        const indirectPool = arch ? (archetypeSearcherPool[arch] || 0) : 0;
        const effectivePool = Math.min(qty + indirectPool, 5);
        const reliability   = getReliability(effectivePool);

        // Calcular CardScore para el rol de mayor base power de esta carta
        const basePowers = roles.map(r => window.ConfigManager?.getRoleBasePower?.(r) ?? 3);
        const basePower  = Math.max(...basePowers);
        const layerMult  = applyLayers(desc, segments);
        const cardScore  = basePower * layerMult * reliability;

        // Clasificar en G1, G2 o neutral según el rol de mayor peso
        const dominantRole = roles[basePowers.indexOf(basePower)];
        const g1g2 = g1g2Map[dominantRole] || 'neutral';

        if (g1g2 === 'g1')      g1Score += cardScore;
        else if (g1g2 === 'g2') g2Score += cardScore;
        else { g1Score += cardScore * 0.5; g2Score += cardScore * 0.5; }
    }

    return {
        internalScore: parseFloat(internalScore.toFixed(2)),
        consistency:   parseFloat(consistency.toFixed(2)),
        power:         parseFloat(power.toFixed(2)),
        resilience:    parseFloat(resilience.toFixed(2)),
        totalCards,
        mainCards,
        penalty:       parseFloat(penalty.toFixed(2)),
        g1Score:       parseFloat(g1Score.toFixed(2)),
        g2Score:       parseFloat(g2Score.toFixed(2))
    };
},
    // ===============================
    getDominantPillar: function (internalResult) {
        const c = parseFloat(internalResult.consistency) || 0;
        const p = parseFloat(internalResult.power)       || 0;
        const r = parseFloat(internalResult.resilience)  || 0;
        if (c === 0 && p === 0 && r === 0) return null;
        if (c >= p && c >= r) return 'consistency';
        if (p >= c && p >= r) return 'power';
        return 'resilience';
    },

    // ===============================
    calculateRPSModifier: function (deckPillar, metaPillar) {
        if (!deckPillar || !metaPillar || deckPillar === metaPillar) {
            return { modifier: 1.0, relation: 'neutral' };
        }
        // Leer ciclo desde Config — permite al usuario reordenarlo
        const rpsRules = window.ConfigManager?.getPillarRPS?.()
            || [['resilience','power'],['power','consistency'],['consistency','resilience']];
        const BEATS = {};
        rpsRules.forEach(([winner, loser]) => { BEATS[winner] = loser; });

        if (BEATS[deckPillar] === metaPillar) return { modifier: 1.25, relation: 'advantage' };
        if (BEATS[metaPillar] === deckPillar) return { modifier: 0.75, relation: 'disadvantage' };
        return { modifier: 1.0, relation: 'neutral' };
    },
        // ===============================
        calculateComponent: function (count, threshold) {
            if (count >= threshold) {
                return 10;
            }
            return (count / threshold) * 10;
        },

        // ===============================
        renderStatsCard: function (stats) {
            // Determinar color del score (verde > 7, amarillo 5-7, rojo < 5)
            let scoreColor = '#00b894';
            if (stats.internalScore < 5) {
                scoreColor = '#d63031';
            } else if (stats.internalScore < 7) {
                scoreColor = '#fdcb6e';
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
        getDeckStats: function (deckCards) {
            if (!deckCards || Object.keys(deckCards).length === 0) {
                return null;
            }

            return this.calculateInternalScore(deckCards);
        },
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
            threatPct:        0,
            g1Vulnerability:  null,
            g2Vulnerability:  null
        };

if (window.SpecialtyAnalyzer) {
    const pairs     = ConfigManager.getSpecialties();
    const specCount = {};

    for (const [, item] of Object.entries(deckCards)) {
        if (!item.data) continue;
        const cardRoles = (item.roles || []).map(r => r.toLowerCase());

        // Método 1: keywords (pares con estructura antigua — defaultConfig)
        const analysis = SpecialtyAnalyzer.analyzeCard(item.data);
        (analysis.specializations || []).forEach(s => {
            specCount[s.name] = (specCount[s.name] || 0) + (item.qty || 1);
        });

        pairs.forEach(pair => {
            if (!pair.mechanicRole) return;
            const pairRoleLower = pair.mechanicRole.toLowerCase();
            if (cardRoles.includes(pairRoleLower)) {
                const label = pair.mechanicRole;
                specCount[label] = (specCount[label] || 0) + (item.qty || 1);
            }
        });
    }

    result.deckSpecs = Object.entries(specCount)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
    result.hasSpecData = result.deckSpecs.length > 0;
}

if (powerScoreCache && powerScoreCache.cards) {
    result.hasPowerData = true;
    const deckSpecNames = new Set(result.deckSpecs.map(s => s.name));
    const pairs         = ConfigManager.getSpecialties();

    // Roles del deck activo (para cruzar con counterRole de pares nuevos)
    const deckRoles = new Set();
    for (const [, item] of Object.entries(deckCards)) {
        (item.roles || []).forEach(r => deckRoles.add(r.toLowerCase()));
    }

    powerScoreCache.cards.forEach(card => {
        const overlap = [];

        if (card.isCounter && card.counterBonus > 0) {
            const countersSpecs = (card.specAnalysis?.counters || [])
                .map(c => c.countersSpec).filter(Boolean);
            countersSpecs.filter(s => deckSpecNames.has(s))
                .forEach(s => overlap.push(s));
        }

        // Método 2: roles — pares nuevos {mechanicRole, counterRole}
        const cardRoles = (card.detectedRoles || []).map(r => r.toLowerCase());
        pairs.forEach(pair => {
            if (!pair.counterRole || !pair.mechanicRole) return;
            const counterRoleLower  = pair.counterRole.toLowerCase();
            const mechanicRoleLower = pair.mechanicRole.toLowerCase();
            if (cardRoles.includes(counterRoleLower) && deckRoles.has(mechanicRoleLower)) {
                const label = pair.mechanicRole;
                if (!overlap.includes(label)) overlap.push(label);
            }
        });

        if (overlap.length > 0) {
            const counterBonus = card.counterBonus || 0;
            result.threatCards.push({
                cardId:       card.cardId,
                name:         card.cardData?.name || String(card.cardId),
                presencePct:  card.presencePct,
                counterBonus,
                countersSpecs: overlap,
                specAnalysis:  card.specAnalysis,
                threatLevel:   Math.round(counterBonus * (card.presencePct / 100))
            });
        }
    });

    result.threatCards.sort((a, b) => b.threatLevel - a.threatLevel);
}

        if (result.hasPowerData && result.hasSpecData) {
            const maxTheoreticalThreat = (powerScoreCache.cards || [])
                .filter(c => c.isCounter && c.counterBonus > 0)
                .reduce((sum, c) => sum + c.counterBonus, 0);

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

                // ── G1 / G2 Vulnerability ─────────────────────────────
                const g1g2Map = window.ConfigManager?.getG1G2Roles?.() || {};
                const deckRolesG1G2 = {};
                for (const [, item] of Object.entries(deckCards)) {
                    (item.roles || []).forEach(r => {
                        const ctx = g1g2Map[r] || 'neutral';
                        deckRolesG1G2[r.toLowerCase()] = ctx;
                    });
                }

                let g1Threat = 0, g2Threat = 0, g1Base = 0, g2Base = 0;
                result.threatCards.forEach(tc => {
                    const specs = tc.countersSpecs || [];
                    specs.forEach(specName => {
                        // Buscar el rol del deck que corresponde a esta spec amenazada
                        const matchedRole = Object.keys(deckRolesG1G2).find(r => r === specName.toLowerCase());
                        const ctx = matchedRole ? deckRolesG1G2[matchedRole] : 'neutral';
                        if (ctx === 'g1')      { g1Threat += tc.threatLevel; g1Base += tc.counterBonus; }
                        else if (ctx === 'g2') { g2Threat += tc.threatLevel; g2Base += tc.counterBonus; }
                        else {
                            g1Threat += tc.threatLevel * 0.5; g1Base += tc.counterBonus * 0.5;
                            g2Threat += tc.threatLevel * 0.5; g2Base += tc.counterBonus * 0.5;
                        }
                    });
                });

                result.g1Vulnerability = g1Base > 0
                    ? parseFloat(Math.min(10, (g1Threat / g1Base) * 10).toFixed(1)) : 0;
                result.g2Vulnerability = g2Base > 0
                    ? parseFloat(Math.min(10, (g2Threat / g2Base) * 10).toFixed(1)) : 0;
            }

        } else if (result.hasPowerData) {
            result.externalScore = 0;
        }

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
        const presencePct = decksWith / deckCount;

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
        const pZero      = hypergeometric(deckSize, copies, 5);
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



// ── SpecialtyAnalyzer — detección de mecánicas en cartas/decks para External Score ──

const SpecialtyAnalyzer = {

    // Detección interna de roles desde descripción (sin depender de Deck)
    _detectRoles: function(card) {
        if (!window.ConfigManager) return [];
        const desc = (card.desc || '').replace(/\r\n|\r|\n/g, ' ').toLowerCase();
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
            // notContains: si alguna de estas palabras está en el desc, cancela la asignación
            if (shouldAssign && roleConditions[roleName]) {
                const notKws = roleConditions[roleName].notContains || [];
                if (notKws.some(nk => nk && desc.includes(nk.toLowerCase()))) {
                    shouldAssign = false;
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



// ── NomenclatureAnalyzer — segmentación del efecto por categorías para highlight en CardViewer ──

const NomenclatureAnalyzer = {

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

// Si se pasa un delimiter, divide por él.
splitIntoParagraphs: function (text, delimiter) {
    if (!text) return [];
    const normalized = text.replace(/\r\n/g, '\n').replace(/\n+/g, ' ').trim();
    if (!delimiter) return [normalized];
    const parts = normalized.split(delimiter);
    return parts.map(p => p.trim()).filter(p => p.length > 0);
},

// Si no tiene ningún delimitador configurado, usa null (bloque completo).
_getCategoryDelimiter: function (cat) {
    const ew = cat.conditions?.endsWith;
    if (!ew) return null;
    const chars = (Array.isArray(ew) ? ew : [ew])
        .map(c => c.trim())
        .filter(Boolean);
    if (chars.length === 0) return null;
    return new RegExp(`(?<=[${chars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')}])\\s*`);
},

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
    },
    // Devuelve un mapa { categoryId: [textFragment, ...] }
    // Usado por el sistema de scoring para leer solo el fragmento correcto de la carta en cada Capa
    segmentDescription: function (desc) {
        if (!desc) return {};
        const nomenclature = window.ConfigManager.getNomenclature();
        const categories   = nomenclature.categories || [];
        const result       = {};

        categories.forEach(cat => {
            result[cat.id] = [];
            const delimiter = this._getCategoryDelimiter(cat);
            const segments  = this.splitIntoParagraphs(desc, delimiter);
            segments.forEach(seg => {
                if (this.matchesConditions(seg, cat.conditions)) {
                    result[cat.id].push(seg.toLowerCase().trim());
                }
            });
        });

        return result;
    },
};

window.NomenclatureAnalyzer = NomenclatureAnalyzer;