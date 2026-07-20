/* default_data.js — Datos por defecto: decks, apuntes, staples, mecánicas counter, engines
   Solo inyecta cada bloque una vez (flag individual por tipo).
   Restaurar Configuración limpia todo → re-inyecta todo.
   Ejecutar Borrado elimina datos → flags sobreviven → no re-inyecta.
*/

const DefaultData = {

    // ── Flags de localStorage ────────────────────────────────────────────────
    _FLAGS: {
        decks:       'dd_default_decks_loaded',
        notes:       'dd_default_notes_loaded',
        staples:     'dd_default_staples_loaded',
        specialties: 'dd_default_specialties_loaded',
        engines:     'dd_default_engines_loaded',
        games:       'dd_default_games_loaded',
        masters:     'dd_default_masters_loaded',
        genesys:     'dd_default_genesys_loaded'
    },

    // ── YDK raw strings ──────────────────────────────────────────────────────
    _ydks: {
        'Yugi - Nivel 1': `#created by Destiny Draw
#main
2903036
5318639
6368038
10667321
10667321
13039848
14883228
15025844
24094653
24094653
28279543
30683373
32452818
38033121
40374923
40640057
40640057
41392891
42534368
44095762
46986417
47222536
52077741
52097679
52112003
52112003
59197169
59197169
62279055
64047146
67227834
70781052
74677425
83764719
87796900
91152256
98645731
99789342
99789342
99789342
#extra
11901678
21140872
32775808
43892408
50237654
66889139
73452089
75380687
!side
`,
        'Yugi - Nivel 2': `#created by Destiny Draw
#main
6172122
7913375
7913375
7913375
10667321
10667321
10667321
15025844
15025844
21082832
21082832
24094653
27657173
28958464
34130561
38590361
38590361
40640057
44095762
46052429
46986417
47222536
47963370
48680970
49328340
52077741
52077741
52112003
52112003
52112003
61525276
62279055
70551291
70781052
71703785
74677425
83764719
99789342
99789342
99789342
#extra
2519690
5829717
12014404
15989522
30086349
32775808
37818794
41999284
44405066
45349196
49202162
73452089
77637979
85551711
96471335
!side
`,
        'Yugi - Nivel 3': `#created by Destiny Draw
#main
2333466
3428069
6172122
7913375
7913375
7913375
14558127
14558127
14558127
22283204
23434538
24094653
24224830
28958464
28958464
32104431
33280639
33280639
34130561
34130561
34130561
38590361
38590361
42141493
42141493
46986417
47222536
48680970
49823708
49823708
61525276
74677425
79791878
79791878
84192580
84192580
97631303
#extra
2519690
5829717
11790356
12067160
13722870
15989522
29301450
37818794
44405066
59400890
65741786
70369116
85059922
86240887
89851827
!side
`
    },

    /* ── Default Notes ────────────────────────────────────────────────────────*/
    _defaultNotes: "",

    // ── Mechanic Counter Pairs (Specialties) ─────────────────────────────────
_defaultSpecialties: [
    {"id": "spec_def_001", "mechanicRole": "Starter",             "counterRole": "Handtrap"},
    {"id": "spec_def_002", "mechanicRole": "Token Summoner",      "counterRole": "Stun-Special"},
    {"id": "spec_def_003", "mechanicRole": "Pay",                 "counterRole": "Burner"},
    {"id": "spec_def_004", "mechanicRole": "Recycler",            "counterRole": "Removal"},
    {"id": "spec_def_005", "mechanicRole": "Recycler",            "counterRole": "Stun-GY"},
    {"id": "spec_def_006", "mechanicRole": "Send",                "counterRole": "Stun-GY"},
    {"id": "spec_def_007", "mechanicRole": "Undestroyable",       "counterRole": "Send"},
    {"id": "spec_def_008", "mechanicRole": "Destroyer",           "counterRole": "Protector"},
    {"id": "spec_def_009", "mechanicRole": "Quick-effect",        "counterRole": "Negate-effect"},
    {"id": "spec_def_010", "mechanicRole": "Quick-effect",        "counterRole": "Negate-activation"},
    {"id": "spec_def_011", "mechanicRole": "Discard",             "counterRole": "Handloop"},
    {"id": "spec_def_012", "mechanicRole": "Handloop",            "counterRole": "Draw-engine"},
    {"id": "spec_def_013", "mechanicRole": "Extender",            "counterRole": "Stun-Special"},
    {"id": "spec_def_014", "mechanicRole": "Untargetable",        "counterRole": "Non-target"},
    {"id": "spec_def_015", "mechanicRole": "Ignition",            "counterRole": "Disruptor"},
    {"id": "spec_def_016", "mechanicRole": "Ignition",            "counterRole": "Stun-Effect"},
    {"id": "spec_def_017", "mechanicRole": "LP Restore",          "counterRole": "Extender"},
    {"id": "spec_def_018", "mechanicRole": "Burner",              "counterRole": "Anti-damage"},
    {"id": "spec_def_019", "mechanicRole": "Removal",             "counterRole": "Stun-Banish"},
    {"id": "spec_def_020", "mechanicRole": "Handtrap",            "counterRole": "Negate-effect"},
    {"id": "spec_def_021", "mechanicRole": "Boss Monster",        "counterRole": "Boardbreaker"},
    {"id": "spec_def_022", "mechanicRole": "Stun",                "counterRole": "Boardbreaker"},
    {"id": "spec_def_023", "mechanicRole": "Tower",               "counterRole": "Booster"},
    {"id": "spec_def_024", "mechanicRole": "Grinding Card",       "counterRole": "Recycler"},
    {"id": "spec_def_025", "mechanicRole": "Grinding Card",       "counterRole": "Stun-GY"},
    {"id": "spec_def_026", "mechanicRole": "Banished Card",       "counterRole": "Negate-effect"},
    {"id": "spec_def_027", "mechanicRole": "Speed-4",             "counterRole": "Tower"},
    {"id": "spec_def_028", "mechanicRole": "Searcher",            "counterRole": "Stun-Draw"},
    {"id": "spec_def_029", "mechanicRole": "Searcher (archetype)","counterRole": "Stun-Draw"},
    {"id": "spec_def_030", "mechanicRole": "Draw-engine",         "counterRole": "Stun-Draw"},
    {"id": "spec_def_031", "mechanicRole": "Target",              "counterRole": "Untargetable"},
    {"id": "spec_def_032", "mechanicRole": "Tower",               "counterRole": "Stats reducer"},
    {"id": "spec_def_033", "mechanicRole": "Token Summoner",      "counterRole": "Boardbreaker"},
    {"id": "spec_def_034", "mechanicRole": "Stats reducer",       "counterRole": "Handtrap"}
],
    // ── Staple IDs ───────────────────────────────────────────────────────────
    _stapleIds: ["4031928", "5556668", "6351147", "10045474", "11110587", "12580477", "14087893", "14532163", "14558127", "15693423", "15735108", "18144507", "19613556", "19619755", "23002292", "23434538", "23924608", "24081957", "24094653", "24207889", "24224830", "24299458", "24508238", "24940422", "25311006", "26202165", "27204311", "27308231", "27918365", "28674152", "28958464", "29301450", "29762407", "31044787", "31834488", "32296881", "32909498", "35261759", "35269904", "35405755", "35480699", "35726888", "40366667", "40605147", "40640057", "41420027", "42091632", "42141493", "43250041", "46502744", "48130397", "48976825", "49238328", "49299410", "50277355", "52038441", "52417194", "53334471", "53493204", "54693926", "55063751", "55623480", "56506740", "57995165", "58053438", "58570206", "58707981", "59438930", "60303245", "60643553", "63542003", "64964750", "65681983", "65741786", "67169062", "68304193", "68937720", "69162969", "70368879", "72270339", "72302403", "72892473", "73599290", "73642296", "74997493", "75452921", "75500286", "78114463", "78661338", "79844764", "80532587", "81439173", "81587028", "81674782", "82732705", "82956214", "83326048", "84192580", "84211599", "84271823", "84749824", "86066372", "87126721", "87170768", "87910978", "90846359", "91800273", "92107604", "92248362", "92512625", "93039339", "93125329", "94145021", "96633955", "96729612", "97045737", "97268402", "98127546", "98338152", "98645731", "98672567", "99937011"],

    // ── Default Engines ──────────────────────────────────────────────────────
    _defaultEngines: [
        { name: 'Basic Non-Engine', ids: ["10045474", "12580477", "14558127", "18144507", "23002292", "23434538", "24224830", "24508238", "25311006", "27204311", "29301450", "35269904", "42141493", "65681983", "65741786", "73642296", "84192580", "93039339", "94145021", "97268402", "98978921"] },
        { name: 'Primite Engine',   ids: ["29095457", "56506740", "62514770", "63198739", "84815190"] }
    ],

    // ── Helpers ──────────────────────────────────────────────────────────────
    _parseYdk: function (ydkStr) {
        const result = { main: [], extra: [], side: [] };
        let section = null;
        ydkStr.split('\n').forEach(raw => {
            const line = raw.trim();
            if (line === '#main')  { section = 'main';  return; }
            if (line === '#extra') { section = 'extra'; return; }
            if (line === '!side')  { section = 'side';  return; }
            if (section && /^\d+$/.test(line)) result[section].push(line);
        });
        return result;
    },

    _fetchCards: async function (ids) {
        const map = {};
        const unique = [...new Set(ids)];
        const batchSize = 60;
        for (let i = 0; i < unique.length; i += batchSize) {
            const batch = unique.slice(i, i + batchSize);
            try {
                const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${batch.join(',')}`);
                const json = await res.json();
                (json.data || []).forEach(c => { map[String(c.id)] = c; });
            } catch (e) {
                console.warn('[DefaultData] fetch error:', e);
            }
        }
        return map;
    },

    _isExtra: function (card) {
        if (window.Deck && typeof Deck.isExtraDeckCard === 'function')
            return Deck.isExtraDeckCard(card);
        const t = (card.type || '').toLowerCase();
        return t.includes('fusion') || t.includes('synchro') || t.includes('xyz') || t.includes('link');
    },

    // ── Decks ────────────────────────────────────────────────────────────────
    _buildCardsObj: function (sections, cardMap) {
        const cards = {};
        ['main', 'extra', 'side'].forEach(loc => {
            const counts = {};
            sections[loc].forEach(id => { counts[id] = (counts[id] || 0) + 1; });
            Object.entries(counts).forEach(([id, qty]) => {
                const card = cardMap[id];
                if (!card) return;
                cards[id] = { data: card, qty, location: loc, roles: [], specialties: [], nomenclature: [] };
            });
        });
        return cards;
    },

    _injectDeck: async function (name, ydkStr) {
        const key = `deck_${name}`;
        if (localStorage.getItem(key)) return;
        const sections = this._parseYdk(ydkStr);
        const allIds   = [...sections.main, ...sections.extra, ...sections.side];
        const cardMap  = await this._fetchCards(allIds);
        const cards    = this._buildCardsObj(sections, cardMap);
        if (!Object.keys(cards).length) { console.warn(`[DefaultData] Sin cartas para "${name}"`); return; }
        localStorage.setItem(key, JSON.stringify({ cards, notes: '', savedAt: Date.now() }));
        console.log(`[DefaultData] ✅ Deck "${name}" inyectado`);
    },

    // ── Notes ────────────────────────────────────────────────────────────────
    _initNotes: function () {
        if (localStorage.getItem(this._FLAGS.notes)) return;
        const existing      = JSON.parse(localStorage.getItem('yugioh_formacion_notes') || '[]');
        const existingTitles = new Set(existing.map(n => n.title));
        const toAdd         = this._defaultNotes.filter(n => !existingTitles.has(n.title));
        localStorage.setItem('yugioh_formacion_notes', JSON.stringify([...toAdd, ...existing]));
        localStorage.setItem(this._FLAGS.notes, '1');
        console.log(`[DefaultData] ${toAdd.length} apuntes inyectados`);
    },

    // ── Specialties (Mechanic Counters) ──────────────────────────────────────
    _initSpecialties: function () {
        if (localStorage.getItem(this._FLAGS.specialties)) return;
        if (!window.ConfigManager) return;
        const config = ConfigManager.getConfig();
        if (!Array.isArray(config.specialties)) config.specialties = [];
        const existingIds = new Set(config.specialties.map(p => p.id));
        const toAdd = this._defaultSpecialties.filter(p => !existingIds.has(p.id));
        config.specialties = [...toAdd, ...config.specialties];
        ConfigManager.saveConfig(config);
        localStorage.setItem(this._FLAGS.specialties, '1');
        console.log(`[DefaultData] ${toAdd.length} mecánicas counter inyectadas`);
    },

    // ── Staples ───────────────────────────────────────────────────────────────
    _initStaples: async function () {
        if (localStorage.getItem(this._FLAGS.staples)) return;
        if (!window.ConfigManager) return;
        const config  = ConfigManager.getConfig();
        if (!config.staples) config.staples = {};
        const missing = this._stapleIds.filter(id => !config.staples[id]);
        if (!missing.length) {
            localStorage.setItem(this._FLAGS.staples, '1');
            return;
        }
        const cardMap = await this._fetchCards(missing);
        Object.values(cardMap).forEach(card => {
            const id = String(card.id);
            config.staples[id] = {
                id,
                name:     card.name,
                imageUrl: `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`,
                type:     card.type || ''
            };
        });
        ConfigManager.saveConfig(config);
        localStorage.setItem(this._FLAGS.staples, '1');
        console.log(`[DefaultData] ${Object.keys(cardMap).length} staples inyectados`);
    },

    // ── Engines ───────────────────────────────────────────────────────────────
    _initEngines: async function () {
        if (localStorage.getItem(this._FLAGS.engines)) return;
        const existing = JSON.parse(localStorage.getItem('yugioh_engines') || '[]');
        const existingNames = new Set(existing.map(e => e.name));
        const toAdd = this._defaultEngines.filter(e => !existingNames.has(e.name));
        if (!toAdd.length) { localStorage.setItem(this._FLAGS.engines, '1'); return; }

        const allIds  = [...new Set(toAdd.flatMap(e => e.ids))];
        const cardMap = await this._fetchCards(allIds);

        const newEngines = toAdd.map(eng => {
            const cards = {};
            eng.ids.forEach(id => {
                const card = cardMap[id];
                if (!card) return;
                const loc = this._isExtra(card) ? 'extra' : 'main';
                if (cards[id]) cards[id].qty = Math.min(3, cards[id].qty + 1);
                else cards[id] = { data: card, qty: 1, location: loc };
            });
            const firstId  = eng.ids.find(id => cardMap[id]);
            const coverImg = firstId
                ? `https://images.ygoprodeck.com/images/cards_small/${firstId}.jpg`
                : 'https://images.ygoprodeck.com/images/cards/back.jpg';
            return {
                name:        eng.name,
                coverCardId:  firstId || null,
                coverCardImg: coverImg,
                cards,
                roles:     [],
                notes:     '',
                stats:     { consistency: 0, power: 0, resilience: 0 },
                createdAt: 1738368000000
            };
        });

        const merged = [...newEngines, ...existing];
        localStorage.setItem('yugioh_engines', JSON.stringify(merged));
        localStorage.setItem(this._FLAGS.engines, '1');
        console.log(`[DefaultData] ${newEngines.length} engines inyectados`);
    },

    // ── Default Games (Formación → Juegos) ──────────────────────────────────
    _defaultGames: [{"id": "fg_0", "name": "Yu-Gi-Oh! – World Championship Tournament 2004", "title": "Juego 2004.", "link": "https://www.emulatorgamesx.net/roms/gameboy-advance/yu-gi-oh-world-championship-tournament-2004-gba/", "fallbackUrl": "https://www.emulatorgamesx.net/wp-content/uploads/2026/02/image-197.webp", "platforms": ["GBA"]}, {"id": "fg_1", "name": "Yu-Gi-Oh The Duelists Of The Roses", "title": "", "link": "https://www.romspedia.com/roms/playstation-2/yu-gi-oh-the-duelists-of-the-roses", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-the-duelists-of-the-roses-ps2-cover-340x483.webp", "platforms": ["PS2"]}, {"id": "fg_2", "name": "Yu-Gi-Oh! - The Eternal Duelist Soul", "title": "", "link": "https://www.romspedia.com/roms/gameboy-advance/yu-gi-oh-the-eternal-duelist-soul", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh!-the-eternal-duelist-soul-gba-cover-340x483.webp", "platforms": ["GBA"]}, {"id": "fg_3", "name": "Yu-Gi-Oh! - The Sacred Cards", "title": "", "link": "https://www.romspedia.com/roms/gameboy-advance/yu-gi-oh-the-sacred-cards", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh!-the-sacred-cards-gba-cover-340x483.webp", "platforms": ["GBA"]}, {"id": "fg_4", "name": "Yu-Gi-Oh! - Nightmare Troubadour", "title": "", "link": "https://www.romspedia.com/roms/nintendo-ds/yu-gi-oh-nightmare-troubadour", "fallbackUrl": "https://static.romspedia.com/webp/roms/nds-yu-gi-oh-nightmare-troubadour-cover-340x483.webp", "platforms": ["PC"]}, {"id": "fg_5", "name": "Yu-Gi-Oh! Dark Duel Stories", "title": "", "link": "https://www.romspedia.com/roms/gameboy-color/yu-gi-oh-dark-duel-stories", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh!-dark-duel-stories-gbc-cover-340x483.webp", "platforms": ["GBC"]}, {"id": "fg_6", "name": "Yu-Gi-Oh! - Reshef Of Destruction", "title": "", "link": "https://www.romspedia.com/roms/gameboy-advance/yu-gi-oh-reshef-of-destruction", "fallbackUrl": "https://static.romspedia.com/webp/roms/Yu-Gi-Oh!_Reshef_of_Destruction-gba-340x483.webp", "platforms": ["GBA"]}, {"id": "fg_7", "name": "Yu-Gi-Oh! - Dungeon Dice Monsters", "title": "", "link": "https://www.romspedia.com/roms/gameboy-advance/yu-gi-oh-dungeon-dice-monsters", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-dungeon-dice-monsters-gba-340x483.webp", "platforms": ["GBA"]}, {"id": "fg_8", "name": "Yu-Gi-Oh! - Forbidden Memories", "title": "", "link": "https://www.romspedia.com/roms/playstation-1/yu-gi-oh-forbidden-memories", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh!-forbidden-memories-psx-340x483.webp", "platforms": ["PS1"]}, {"id": "fg_9", "name": "Yu-Gi-Oh GX - Tag Force", "title": "", "link": "https://www.romspedia.com/roms/playstation-portable/yu-gi-oh-gx-tag-force", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-gx-tag-force-psp-cover-340x483.webp", "platforms": ["PSP"]}, {"id": "fg_10", "name": "Yu-Gi-Oh! GX - Tag Force 2", "title": "", "link": "https://www.romspedia.com/roms/playstation-portable/yu-gi-oh-gx-tag-force-2-europe", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-gx-tag-force-2-psp-cover-europe-340x483.webp", "platforms": ["PSP"]}, {"id": "fg_11", "name": "Yu-Gi-Oh GX - Tag Force 3", "title": "", "link": "https://www.romspedia.com/roms/playstation-portable/yu-gi-oh-gx-tag-force-3-e", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-gx-tag-force-3-psp-cover-europe-340x483.webp", "platforms": ["PSP"]}, {"id": "fg_12", "name": "Yu-Gi-Oh! GX - Duel Academy", "title": "", "link": "https://www.romspedia.com/roms/gameboy-advance/yu-gi-oh-gx-duel-academy", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-duel-cover-340x483.webp", "platforms": ["GBA"]}, {"id": "fg_13", "name": "Yu-Gi-Oh! 5D's - Stardust Accelerator - World Championship 2009", "title": "", "link": "", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-5D's-sardust-accelerator-world-championship-2009-nds-eu-340x483.webp", "platforms": ["PC"]}, {"id": "fg_14", "name": "Yu-Gi-Oh! 5D's - World Championship 2010 - Reverse Of Arcadia", "title": "", "link": "", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-5ds-world-championship-2010-reverse-of-arcadia-nds-eu-340x483.webp", "platforms": ["PC"]}, {"id": "fg_15", "name": "Yu-Gi-Oh! 5D's World Championship 2011 - Over The Nexus", "title": "", "link": "https://www.romspedia.com/roms/nintendo-ds/yu-gi-oh-5ds-world-championship-2011-over-the-nexus-eu", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-5ds-world-championship-2011-over-the-nexus-nds-eu-340x483.webp", "platforms": ["PC"]}, {"id": "fg_16", "name": "Yu-Gi-Oh 5D's - Tag Force 5", "title": "", "link": "", "fallbackUrl": "https://static.romspedia.com/webp/roms/yu-gi-oh-5D's-tag-force-5-psp-cover-340x483.webp", "platforms": ["PSP"]}, {"id": "fg_17", "name": "Yu-Gi-Oh! DUEL LINKS", "title": "Smartphone.", "link": "https://www.konami.com/yugioh/duel_links/en/", "fallbackUrl": "https://mnd-assets.mynewsdesk.com/image/upload/c_fill,dpr_auto,f_auto,g_auto,q_auto:good,w_1782/bkfq2jleijhu0aulil2d", "platforms": ["PC"]}, {"id": "fg_18", "name": "Yu-Gi-Oh! Master Duel", "title": "PC y Smartphone.", "link": "https://store.steampowered.com/app/1449850/YuGiOh_Master_Duel/", "fallbackUrl": "https://i.blogs.es/e495af/ogimage/1366_521.jpeg", "platforms": ["PC"]}, {"id": "fg_19", "name": "Yu-Gi-Oh! ARC-V Tag Force Special", "title": "", "link": "", "fallbackUrl": "https://romsfun.com/wp-content/uploads/2023/09/Yu-Gi-Oh-ARC-V-Tag-Force-Special.jpg", "platforms": ["PSP"]}, {"id": "fg_20", "name": "Dueling Nexus", "title": "Página para jugar online.", "link": "https://duelingnexus.com/welcome", "fallbackUrl": "https://duelingnexus.com/static/img/dn-logo.0468c98.png", "platforms": ["PC"]}, {"id": "fg_21", "name": "Dueling Book", "title": "Página para jugar Yugioh! En diferentes formatos online.", "link": "https://www.duelingbook.com/", "fallbackUrl": "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co4sjv.jpg", "platforms": ["PC"]}, {"id": "fg_22", "name": "YGO Omega", "title": "Página para descargar y jugar Yugioh online.", "link": "https://omega.duelistsunite.org/", "fallbackUrl": "https://i1.sndcdn.com/artworks-UAWaA5GkbFnbmL3X-xwlJEQ-t500x500.jpg", "platforms": ["PC"]}, {"id": "fg_23", "name": "EDOPRO", "title": "Página para descargar y jugar Yugioh online.", "link": "https://projectignis.github.io/download.html", "fallbackUrl": "https://images.igdb.com/igdb/image/upload/t_cover_big/co62n0.jpg", "platforms": ["PC"]}],

    // ── Default Masters (Meta → Maestros del Duelo) ──────────────────────────
    _defaultMasters: [{"id": "mm_0", "name": "Hyliank", "title": "El mejor canal de todos.", "videoUrl": "https://www.youtube.com/live/hQJSL-JFtEY?si=nlxnrSTaUF1EhGS_", "channelUrl": "https://www.youtube.com/@hyliank", "fallbackUrl": "", "formats": ["Master Duel"]}, {"id": "mm_1", "name": "Icarus", "title": "El mejor acariciador del formato", "videoUrl": "", "channelUrl": "https://www.youtube.com/@IcarusYGO", "fallbackUrl": "", "formats": ["Master Duel"]}, {"id": "mm_2", "name": "Masked Hero Vic", "title": "El don cangreso mas perron de los plantons", "videoUrl": "https://www.youtube.com/watch?v=HHbf1iVbzHc", "channelUrl": "https://www.youtube.com/watch?v=HHbf1iVbzHc", "fallbackUrl": "", "formats": ["TCG", "OCG"]}, {"id": "mm_3", "name": "Jorgito Mendias", "title": "El guapucho mas perron de aqui", "videoUrl": "", "channelUrl": "https://www.youtube.com/@jorgitomendias", "fallbackUrl": "", "formats": ["TCG"]}, {"id": "mm_4", "name": "Tio Derpy", "title": "El tio de tu tia", "videoUrl": "", "channelUrl": "https://www.youtube.com/@TioDerpy", "fallbackUrl": "", "formats": ["TCG", "OCG", "Master Duel", "Goat"]}, {"id": "mm_5", "name": "Cuca Team", "title": "El verdadero cucarachon cucaracho", "videoUrl": "", "channelUrl": "https://www.youtube.com/@CucaTeamMX", "fallbackUrl": "", "formats": ["TCG", "OCG", "Master Duel", "Goat"]}, {"id": "mm_6", "name": "Dread TCG", "title": "Los hermanos de sangre de alguno de sus padres", "videoUrl": "", "channelUrl": "https://www.youtube.com/@DREADTCG/videos", "fallbackUrl": "", "formats": ["TCG", "OCG", "Genesys", "Time Wizard"]}, {"id": "mm_7", "name": "Julio Valls", "title": "El campeon mas champion", "videoUrl": "", "channelUrl": "https://www.youtube.com/@Julio_Valls", "fallbackUrl": "", "formats": ["TCG", "OCG", "Genesys"]}, {"id": "mm_8", "name": "Ready for Duel", "title": "El pana bien pana.", "videoUrl": "", "channelUrl": "https://www.youtube.com/@ReadyForDuel", "fallbackUrl": "", "formats": ["TCG", "Master Duel"]}, {"id": "mm_9", "name": "Duelista Aprendiz", "title": "El aprendiz más maestro de todo el curso.", "videoUrl": "", "channelUrl": "https://www.youtube.com/@ElDuelistaAprendiz", "fallbackUrl": "", "formats": ["TCG", "OCG", "Master Duel", "Goat"]}, {"id": "mm_10", "name": "Team Seto X", "title": "El gato brujo", "videoUrl": "", "channelUrl": "https://www.youtube.com/@teamsetox1065", "fallbackUrl": "", "formats": ["TCG", "Master Duel"]}, {"id": "mm_11", "name": "Farfa", "title": "The cool guy that talks as a cool guy.", "videoUrl": "", "channelUrl": "https://www.youtube.com/@FarfaHighlights/videos", "fallbackUrl": "", "formats": ["TCG", "OCG", "Master Duel", "Goat"]}, {"id": "mm_12", "name": "Team Samurai X", "title": "A crazy guy but cool guy too.", "videoUrl": "", "channelUrl": "https://www.youtube.com/@TeamSamuraiX1/videos", "fallbackUrl": "", "formats": ["TCG", "OCG", "Genesys", "Master Duel"]}, {"id": "mm_13", "name": "Dkayed", "title": "Just a Yugioh's guy. NEGATED!!!", "videoUrl": "", "channelUrl": "https://www.youtube.com/@Dkayed/videos", "fallbackUrl": "", "formats": ["Master Duel"]}],

    // ── Init Games ───────────────────────────────────────────────────────────
    _initGames: function () {
        if (localStorage.getItem(this._FLAGS.games)) return;
        if (!window.ConfigManager) return;
        const existing     = ConfigManager.getFormacionGames();
        const existingNames = new Set(existing.map(g => g.name));
        const toAdd        = this._defaultGames.filter(g => !existingNames.has(g.name));
        ConfigManager.saveFormacionGames([...toAdd, ...existing]);
        localStorage.setItem(this._FLAGS.games, '1');
        console.log(`[DefaultData] ${toAdd.length} juegos inyectados`);
    },

    // ── Init Masters ─────────────────────────────────────────────────────────
    _initMasters: function () {
        if (localStorage.getItem(this._FLAGS.masters)) return;
        if (!window.ConfigManager) return;
        const existing      = ConfigManager.getMetaMasters();
        const existingNames = new Set(existing.map(m => m.name));
        const toAdd         = this._defaultMasters.filter(m => !existingNames.has(m.name));
        ConfigManager.saveMetaMasters([...toAdd, ...existing]);
        localStorage.setItem(this._FLAGS.masters, '1');
        console.log(`[DefaultData] ${toAdd.length} maestros inyectados`);
    },

    // ── Genesys Points (nombre → puntos) ─────────────────────────────────────
    _genesysPoints: {
        '"A Case for K9"': 20,
        'Abyss Dweller': 100,
        'Adamancipator Risen - Dragite': 20,
        'Agido the Ancient Sentinel': 50,
        'Albion the Branded Dragon': 5,
        'Albion the Sanctifire Dragon': 33,
        'Allure of Darkness': 5,
        'Ame no Habakiri no Mitsurugi': 100,
        'Amorphactor Pain, the Imagination Dracoverlord': 100,
        'Ancient Gear Advance': 33,
        'Ancient Gear Statue': 33,
        'And the Band Played On': 100,
        'Angel O7': 100,
        'Anti-Spell Fragrance': 100,
        'Appointer of the Red Lotus': 50,
        'Arcana Force XXI - The World': 100,
        'Archlord Kristya': 100,
        'Archnemeses Eschatos': 100,
        'Archnemeses Protos': 100,
        'Artifact Scythe': 100,
        'Artmage Non-Finito': 15,
        'Artmage Vandalism -Assault-': 3,
        'Artmage Varnish -Alteration-': 3,
        'Ash Blossom & Joyous Spring': 20,
        'Assault Synchron': 1,
        'Astral Kuriboh': 3,
        'Atlantean Dragoons': 40,
        'Azamina Ilia Silvia': 20,
        'Azamina Mu Rcielago': 33,
        'Bahamut Shark': 81,
        'Banquet of Millions': 51,
        'Baronne de Fleur': 80,
        'Barrier of the Voiceless Voice': 15,
        'Barrier Statue of the Abyss': 70,
        'Barrier Statue of the Drought': 70,
        'Barrier Statue of the Heavens': 70,
        'Barrier Statue of the Inferno': 70,
        'Barrier Statue of the Stormwinds': 70,
        'Barrier Statue of the Torrent': 70,
        'Beatrice, Lady of the Eternal': 100,
        'Beelze of the Diabolic Dragons': 100,
        'Big Welcome Labrynth': 20,
        'Black Garden': 51,
        'Blackwing - Boreastorm the Wicked Wind': 20,
        'Blackwing - Zephyros the Elite': 13,
        'Black-Winged Assault Dragon': 1,
        'Blaster, Dragon Ruler of Infernos': 5,
        'Blaze Fenix, the Burning Bombardment Bird': 70,
        'Blazing Cartesia, the Virtuous': 3,
        'Block Dragon': 33,
        'Bonfire': 33,
        'Book of Eclipse': 3,
        'Book of Moon': 4,
        'Brain Research Lab': 100,
        'Bramble Rose Dragon': 1,
        'Branded Expulsion': 33,
        'Branded Fusion': 40,
        'Branded Lost': 66,
        'Brilliant Fusion': 33,
        'Broww, Huntsman of Dark World': 3,
        'Butterfly Dagger - Elma': 1,
        'Bystial Baldrake': 30,
        'Bystial Dis Pater': 10,
        'Bystial Druiswurm': 30,
        'Bystial Magnamhut': 33,
        'Bystial Saronir': 20,
        'Called by the Grave': 20,
        'Card Destruction': 40,
        'Card of Demise': 40,
        'Card of Safe Return': 33,
        'Catapult Turtle': 100,
        'Celestial Observatory': 5,
        'Centur-Ion Auxila': 33,
        'Centur-Ion Primera': 2,
        'Centur-Ion Trudea': 1,
        'Chain Strike': 50,
        'Change of Heart': 6,
        'Chaofeng, Phantom of the Yang Zing': 13,
        'Chaos Angel': 20,
        'Chaos Ruler, the Chaotic Magical Dragon': 50,
        'Chaos Space': 40,
        'Charge of the Light Brigade': 25,
        'Chicken Game': 7,
        'Cold Wave': 100,
        'Confiscation': 100,
        'Contact "C"': 100,
        'Cornfield Coatl': 33,
        'Cosmic Blazar Dragon': 21,
        'Cosmic Cyclone': 1,
        'Creature Swap': 1,
        'Crimson Dragon': 80,
        'Crossout Designator': 20,
        'Crystron Inclusion': 25,
        'Crystron Sulfador': 5,
        'CXyz Gimmick Puppet Fanatix Machinix': 100,
        'Cyber Angel Benten': 40,
        'Cyber Dragon Infinity': 20,
        'Cyber Jar': 33,
        'Cyber-Stein': 27,
        'D.D. Crow': 1,
        'D.D. Dynamite': 51,
        'D/D/D Duo-Dawn King Kali Yuga': 77,
        'D/D/D Wave High King Caesar': 20,
        'Daigusto Emeral': 1,
        'Danger! Bigfoot!': 3,
        'Danger! Chupacabra!': 3,
        'Danger! Dogman!': 3,
        'Danger! Mothman!': 3,
        'Danger! Nessie!': 7,
        'Danger! Ogopogo!': 3,
        'Danger! Thunderbird!': 3,
        'Danger!? Jackalope?': 7,
        'Danger!? Tsuchinoko?': 7,
        'Dark End Evaporation Dragon': 1,
        'Dark Eradicator Warlock': 100,
        'Dark Hole': 1,
        'Dark Magician of Destruction': 15,
        'Dark Ruler No More': 2,
        'Dark World Archives': 5,
        'Dark World Dealings': 5,
        'Darklord Ixchel': 5,
        'Deception of the Sinful Spoils': 40,
        'Deck Lockdown': 100,
        'Deep Sea Aria': 33,
        'Delinquent Duo': 100,
        'Demise of the Land': 1,
        'Denglong, First of the Yang Zing': 20,
        'Denko Sekka': 20,
        'Destiny HERO - Destroyer Phoenix Enforcer': 20,
        'Destiny HERO - Plasma': 20,
        'Destructive Daruma Karma Cannon': 1,
        'Diabell, Queen of the White Forest': 25,
        'Diabellstar the Black Witch': 20,
        'Different Dimension Ground': 10,
        'Dimension Fusion': 40,
        'Dimension Shifter': 10,
        'Dimensional Barrier': 100,
        'Dinomorphia Domain': 1,
        'Dinomorphia Frenzy': 1,
        'Dinomorphia Intact': 1,
        'Dinomorphia Rexterm': 91,
        'Dinowrestler Pankratops': 5,
        'Divine Arsenal AA-ZEUS - Sky Thunder': 20,
        'Diviner of the Herald': 33,
        'Djinn Releaser of Rituals': 100,
        'Dodododo Warrior': 70,
        'Dogmatika Ecclesia, the Virtuous': 3,
        'Domain of the True Monarchs': 50,
        'Dominus Impulse': 20,
        'Dominus Purge': 10,
        'Dracotail Arthalion': 20,
        'Dracotail Faimena': 30,
        'Dracotail Flame': 3,
        'Dracotail Mululu': 7,
        'Dragon Master Magia': 100,
        'Dragonic Diagram': 15,
        'Dragonmaid Sheou': 10,
        'Dragonmaid Tidying': 5,
        'Dragon\'s Bind': 100,
        'Dragon\'s Light and Darkness': 3,
        'Dragon\'s Mind': 7,
        'Droll & Lock Bird': 20,
        'Drytron Alpha Thuban': 33,
        'Drytron Mu Beta Fafnir': 33,
        'Duality': 3,
        'Earthbound Immortal Aslla piscu': 51,
        'Ecclesia and the Dark Dragon': 3,
        'Eclipse Wyvern': 33,
        'Effect Veiler': 8,
        'El Shaddoll Apkallone': 10,
        'El Shaddoll Winda': 60,
        'Elder Entity Norden': 91,
        'Elder Entity N\'tss': 7,
        'Elfnote Power Patron': 15,
        'Elzette, Azamina of the White Forest': 22,
        'Emergency Teleport': 35,
        'EMERGENCY!': 33,
        'Eva': 1,
        'Evenly Matched': 7,
        'Evigishki Gustkraken': 100,
        'Evigishki Mind Augus': 1,
        'Evilswarm Ouroboros': 100,
        'Evolzar Lars': 20,
        'Exosister Betrayal': 7,
        'Exosister Mikailis': 10,
        'Exosister Pax': 5,
        'Expurrely Noir': 33,
        'Ext Ryzeal': 25,
        'F.A. Dawn Dragster': 20,
        'Fairy Tail - Snow': 85,
        'Fallen of the White Dragon': 30,
        'Fiber Jar': 30,
        'Filia Regis': 10,
        'Final Countdown': 100,
        'Fire Formation - Tenki': 35,
        'Fire King Courtier Ulcanix': 18,
        'Fire King High Avatar Kirin': 7,
        'Fishborg Blaster': 33,
        'Floowandereeze & Robina': 33,
        'Floowandereeze and the Advent of Adventure': 33,
        'Floowandereeze and the Magnificent Map': 33,
        'Flying "C"': 7,
        'Foolish Burial': 33,
        'Foolish Burial Goods': 7,
        'Forbidden Chalice': 5,
        'Forbidden Crown': 10,
        'Forbidden Droplet': 10,
        'Forbidden Lance': 3,
        'Fossil Dig': 33,
        'Fossil Dyna Pachycephalo': 100,
        'Frightfur Patchwork': 33,
        'Fusion Destiny': 33,
        'Gagagaga Girl': 15,
        'Galaxy Photon Dragon': 15,
        'Gallant Granite': 33,
        'Garura, Wings of Resonant Life': 4,
        'Gateway of the Six': 100,
        'Gem-Knight Lady Lapis Lazuli': 51,
        'Gem-Knight Master Diamond': 66,
        'Ghost Belle & Haunted Mansion': 6,
        'Ghost Meets Girl - A Masterful Mayakashi Shiranui Saga': 100,
        'Ghost Mourner & Moonlit Chill': 5,
        'Ghost Ogre & Snow Rabbit': 4,
        'Ghost Sister & Spooky Dogwood': 3,
        'Giant Trunade': 40,
        'Gigantic Spright': 15,
        'Gimmick Puppet Nightmare': 70,
        'Gishki Aquamirror': 1,
        'Gishki Nekromirror': 1,
        'Give and Take': 91,
        'Gladiator Beast Tamer Editor': 80,
        'Glow-Up Bulb': 21,
        'Goblin Biker Big Gabonga': 15,
        'Goblin Biker Grand Breakout': 7,
        'Goblin Biker Grand Entrance': 20,
        'Gold Sarcophagus': 10,
        'Golden Cloud Beast - Malong': 4,
        'Gozen Match': 100,
        'Graceful Charity': 40,
        'Grapha, Dragon Lord of Dark World': 5,
        'Grapha, Dragon Overlord of Dark World': 5,
        'Grisaille Prison': 10,
        'Guardian Chimera': 33,
        'Guiding Quem, the Virtuous': 3,
        'Harpie\'s Feather Duster': 9,
        'Harpie\'s Feather Storm': 100,
        'Heart of the Blue-Eyes': 5,
        'Heat Wave': 100,
        'Heavy Storm': 6,
        'Herald of the Arc Light': 50,
        'Hot Red Dragon Archfiend Abyss': 20,
        'Hot Red Dragon Archfiend King Calamity': 21,
        'Hyper Rank-Up-Magic Utopiforce': 1,
        'Ice Ryzeal': 20,
        'Ichiki Sayori-Hime': 5,
        'Ido the Supreme Magical Force': 100,
        'Imperial Order': 100,
        'Imsety, Glory of Horus': 33,
        'Incredible Ecclesia, the Virtuous': 3,
        'Infernal Flame Banshee': 33,
        'Infernity Launcher': 88,
        'Infinite Impermanence': 12,
        'Inspector Boarder': 20,
        'Instant Fusion': 100,
        'Interrupted Kaiju Slumber': 10,
        'Into the Void': 7,
        'Invoked Caliga': 100,
        'Iron Thunder': 5,
        'Jet Synchron': 1,
        'Jowgen the Spiritualist': 100,
        'Junk Speeder': 100,
        'K9-04 Noroi': 15,
        'K9-17 "Ripper"': 30,
        'K9-17 Izuna': 20,
        'K9-66a Jokul': 33,
        'K9-   Lupis': 5,
        'K9-X "Ripper/M"': 10,
        'K9-X "Werewolf"': 10,
        'Kaiser Colosseum': 100,
        'Kashtira Arise-Heart': 97,
        'Kashtira Fenrir': 30,
        'Kashtira Unicorn': 30,
        'Kelbek the Ancient Vanguard': 50,
        'Keldo the Sacred Protector': 1,
        'Ketu Dracotail': 15,
        'Kewl Tune Clip': 6,
        'Kewl Tune Cue': 6,
        'Kewl Tune Synchro': 10,
        'King of the Feral Imps': 33,
        'King\'s Sarcophagus': 33,
        'Knight Armed Dragon, the Armored Knight Dragon': 3,
        'Knightmare Corruptor Iblee': 100,
        'Koa\'ki Meiru Drago': 75,
        'Koa\'ki Meiru Guardian': 3,
        'Koa\'ki Meiru Overload': 3,
        'Koa\'ki Meiru Sandman': 3,
        'Koa\'ki Meiru Wall': 3,
        'Lady Labrynth of the Silver Castle': 40,
        'Lady\'s Dragonmaid': 10,
        'Laevatein, Generaider Boss of Shadows': 1,
        'Last Turn': 100,
        'Last Will': 100,
        'Lavalval Chain': 80,
        'Left Arm Offering': 7,
        'Legendary Fire King Ponix': 10,
        'Legendary Lord Six Samurai - Shi En': 10,
        'Legendary Six Samurai - Shi En': 10,
        'Level Eater': 100,
        'Life Equalizer': 100,
        'Light and Darkness Dragonlord': 20,
        'Light Barrier': 1,
        'Light End Sublimation Dragon': 1,
        'Lightning Storm': 12,
        'Lightsworn Dragonling': 10,
        'Lonefire Blossom': 33,
        'Lose 1 Turn': 100,
        'Lubellion the Searing Dragon': 10,
        'Lunalight Liger Dancer': 51,
        'Lyrilusc - Beryl Canary': 5,
        'Lyrilusc - Bird Call': 20,
        'Lyrilusc - Independent Nightingale': 1,
        'Magical Explosion': 75,
        'Magical Mid-Breaker Field': 60,
        'Magical Scientist': 95,
        'Magician of Black Chaos MAX': 100,
        'Magicians\' Souls': 15,
        'Majesty\'s Fiend': 100,
        'Manju of the Ten Thousand Hands': 1,
        'Mansion of the Dreadful Dolls': 100,
        'Masked HERO Dark Law': 70,
        'Masquerade the Blazing Dragon': 16,
        'Mass Driver': 100,
        'Master Peace, the True Dracoslaying King': 33,
        'Mathmech Circular': 15,
        'Mathmech Sigma': 7,
        'Maxx "C"': 50,
        'Medius the Pure': 5,
        'Megalith Anastasis': 33,
        'Mementomictlan Tecuhtlica - Creation King': 33,
        'Mementotlan Bone Party': 33,
        'Mementotlan Twin Dragon': 33,
        'Mercurium the Living Quicksilver': 10,
        'Mereologic Aggregator': 4,
        'Metamorphosis': 5,
        'Metaverse': 3,
        'Mikanko Shinbu - Noble Twins': 18,
        'Mikanko Water Arabesque': 10,
        'Millennium Ankh': 3,
        'Mind Drain': 100,
        'Mind Master': 1,
        'Mirrorjade the Iceblade Dragon': 10,
        'Miscellaneousaurus': 67,
        'Mistake': 100,
        'Mistaken Arrest': 10,
        'Mitsurugi Prayers': 51,
        'Mitsurugi Ritual': 51,
        'Monster Gate': 50,
        'Monster Reborn': 4,
        'Morphing Jar': 33,
        'Morphtronic Telefon': 55,
        'Moulinglacia the Elemental Lord': 100,
        'Mudora the Sword Oracle': 1,
        'Mulcharmy Fuwalos': 7,
        'Mulcharmy Meowls': 2,
        'Mulcharmy Purulia': 9,
        'Multi-Universe': 3,
        'M-X-Saber Invoker': 33,
        'Mystic Mine': 100,
        'N.As.H. Knight': 15,
        'Nadir Servant': 20,
        'Naturia Barkion': 10,
        'Naturia Beast': 50,
        'Naturia Exterio': 100,
        'Necrovalley': 40,
        'Neptabyss, the Atlantean Prince': 33,
        'Nerva the Power Patron of Creation': 5,
        'Nibiru, the Primal Being': 6,
        'Nightmare Apprentice': 20,
        'Nightmare Throne': 25,
        'Noh-P.U.N.K. Foxy Tune': 7,
        'Noh-P.U.N.K. Rising Scale': 3,
        'Number 1: Infection Buzzking': 85,
        'Number 1: Numeron Gate Ekam': 10,
        'Number 100: Numeron Dragon': 21,
        'Number 16: Shock Master': 100,
        'Number 2: Numeron Gate Dve': 10,
        'Number 3: Cicada King': 10,
        'Number 3: Numeron Gate Trini': 10,
        'Number 38: Hope Harbinger Dragon Titanic Galaxy': 20,
        'Number 39: Utopia Double': 80,
        'Number 4: Numeron Gate Catvari': 10,
        'Number 40: Gimmick Puppet of Strings': 50,
        'Number 41: Bagooska the Terribly Tired Tapir': 100,
        'Number 43: Manipulator of Souls': 100,
        'Number 59: Crooked Cook': 100,
        'Number 60: Dugares the Timeless': 10,
        'Number 67: Pair-a-Dice Smasher': 67,
        'Number 69: Heraldry Crest': 1,
        'Number 75: Bamboozling Gossip Shadow': 70,
        'Number 86: Heroic Champion - Rhongomyniad': 68,
        'Number 89: Diablosis the Mind Hacker': 85,
        'Number 90: Galaxy-Eyes Photon Lord': 10,
        'Number 95: Galaxy-Eyes Dark Matter Dragon': 50,
        'Number 97: Draglubion': 80,
        'Number 99: Utopia Dragonar': 80,
        'Number C1: Numeron Chaos Gate Sunya': 10,
        'Number C40: Gimmick Puppet of Dark Strings': 50,
        'Number F0: Utopic Draco Future': 20,
        'Number S0: Utopic ZEXAL': 100,
        'Numbers Eveil': 70,
        'Numeron Calling': 30,
        'Numeron Network': 33,
        'Obedience Schooled': 40,
        'Ohime the Manifested Mikanko': 33,
        'Ojama Duo': 2,
        'Ojama Trio': 3,
        'One Day of Peace': 11,
        'One for One': 91,
        'Onomatopaira': 33,
        'Original Sinful Spoils - Snake-Eye': 100,
        'Outer Entity Azathot': 100,
        'P.U.N.K. JAM Dragon Drive': 15,
        'Painful Choice': 95,
        'Phantom Fortress Enterblathnir': 13,
        'Phantom Knights\' Rank-Up-Magic Force': 1,
        'Phantom of Yubel': 76,
        'Pilgrim Reaper': 50,
        'Planet Pathfinder': 3,
        'Pot of Desires': 20,
        'Pot of Extravagance': 10,
        'Pot of Greed': 30,
        'Pot of Prosperity': 40,
        'Powersink Stone': 100,
        'Premature Burial': 3,
        'Preparation of Rites': 5,
        'Pre-Preparation of Rites': 10,
        'Pressured Planet Wraitsoth': 33,
        'Primathmech Alembertian': 20,
        'Primeval Planet Perlereino': 50,
        'Primite Lordly Lode': 33,
        'Prohibition': 100,
        'Pseudo Space': 3,
        'Psi-Blocker': 61,
        'Psychic End Punisher': 20,
        'PSY-Framegear Delta': 7,
        'PSY-Framegear Epsilon': 7,
        'PSY-Framegear Gamma': 15,
        'PSY-Framelord Omega': 100,
        'Purrely': 10,
        'Purrely Sleepy Memory': 10,
        'Purrelyly': 7,
        'QQ Enneagon': 1,
        'Question': 11,
        'Quick Launch': 33,
        'Radiant Typhoon Chant': 10,
        'Radiant Typhoon Eldam': 7,
        'Radiant Typhoon Vision': 10,
        'Rahu Dracotail': 10,
        'Raider\'s Knight': 80,
        'Raigeki': 4,
        'Rank-Up-Magic - The Seventh One': 1,
        'Rank-Up-Magic Admiration of the Thousands': 1,
        'Rank-Up-Magic Argent Chaos Force': 5,
        'Rank-Up-Magic Astral Force': 1,
        'Rank-Up-Magic Barian\'s Force': 1,
        'Rank-Up-Magic Cipher Ascension': 1,
        'Rank-Up-Magic Doom Double Force': 1,
        'Rank-Up-Magic Limited Barian\'s Force': 1,
        'Rank-Up-Magic Magical Force': 1,
        'Rank-Up-Magic Numeron Force': 1,
        'Rank-Up-Magic Quick Chaos': 1,
        'Rank-Up-Magic Raid Force': 1,
        'Rank-Up-Magic Raptor\'s Force': 1,
        'Rank-Up-Magic Revolution Force': 1,
        'Rank-Up-Magic Skip Force': 5,
        'Rank-Up-Magic Soul Shave Force': 5,
        'Rank-Up-Magic Zexal Force': 1,
        'Ra\'s Disciple': 1,
        'Reasoning': 50,
        'Red Reboot': 50,
        'Red-Eyes Black Fullmetal Dragon': 33,
        'Red-Eyes Dark Dragoon': 100,
        'Red-Eyes Flare Metal Dragon': 1,
        'Redox, Dragon Ruler of Boulders': 5,
        'Regenesis': 10,
        'Regenesis Archfiend': 10,
        'Regenesis Code': 10,
        'Regenesis Sage': 7,
        'Regenesis Warrior': 3,
        'Reinforcement of the Army': 33,
        'Rescue-ACE Air Lifter': 5,
        'Rescue-ACE Impulse': 5,
        'Rescue-ACE Preventer': 10,
        'Retaliating "C"': 5,
        'Return from the Different Dimension': 40,
        'Return of the Dragon Lords': 7,
        'Reversal Quiz': 100,
        'Rise Rank-Up-Magic Raidraptor\'s Force': 1,
        'Ritual Beast Tamer Elder': 10,
        'Rivalry of Warlords': 100,
        'Ronintoadin': 60,
        'Royal Decree': 10,
        'Royal Magical Library': 100,
        'Royal Oppression': 100,
        'Runick Tip': 10,
        'Ryzeal Detonator': 20,
        'Ryzeal Duo Drive': 20,
        'Sales Ban': 100,
        'Sandwich Day': 3,
        'Sangen Kaimen': 50,
        'Sangen Summoning': 100,
        'Sauravis, the Ancient and Ascended': 3,
        'Schwarzschild Infinity Dragon': 33,
        'Secret Village of the Spellcasters': 100,
        'Self-Destruct Button': 100,
        'Sengenjin Wakes from a Millennium': 33,
        'Senju of the Thousand Hands': 1,
        'Set Rotation': 33,
        'Shaddoll Schism': 10,
        'Shien\'s Smoke Signal': 33,
        'Shiina, Twin Tempests of Celestial Thunder': 10,
        'Shooting Riser Dragon': 33,
        'Sillva, Warlord of Dark World': 100,
        'Silvy of the White Forest': 5,
        'Sixth Sense': 65,
        'Skill Drain': 100,
        'Sky Striker Mobilize - Engage!': 7,
        'Smoke Grenade of the Thief': 87,
        'Snatch Steal': 4,
        'Snoww, Unlight of Dark World': 33,
        'Solemn Judgment': 7,
        'Solemn Scolding': 5,
        'Solemn Strike': 5,
        'Solemn Warning': 5,
        'Songs of the Dominators': 10,
        'Soul Charge': 50,
        'Soul Drain': 100,
        'Speedroid Terrortop': 7,
        'Spell Canceller': 20,
        'Spell Card "Soul Exchange"': 3,
        'Spenta, the Magistus Sealer': 15,
        'Spiritual Beast Tamer Lara': 10,
        'Spright Starter': 10,
        'Stand Up Centur-Ion!': 5,
        'Star Seraph Scepter': 5,
        'Star Seraph Sovereignty': 5,
        'Stardust Sifr Divine Dragon': 21,
        'Starliege Seyfert': 33,
        'Steel-Stringed Sacrifice': 3,
        'Stray Purrely Street': 5,
        'Substitoad': 60,
        'Subterror Guru': 5,
        'Summon Limit': 100,
        'Super Polymerization': 13,
        'Super Quantal Mech King Great Magnus': 33,
        'Super Starslayer TY-PHON - Sky Crisis': 10,
        'Supreme King Dragon Starving Venom': 1,
        'Swap Frog': 33,
        'Sword Ryzeal': 20,
        'Swordsoul Emergence': 10,
        'Swordsoul Grandmaster - Chixiao': 20,
        'Swordsoul Strategist Longyuan': 5,
        'T.G. Hyper Librarian': 33,
        'Tearlaments Havnis': 50,
        'Tearlaments Kitkallos': 50,
        'Tearlaments Merrli': 50,
        'Tearlaments Reinoheart': 50,
        'Tearlaments Scheiren': 50,
        'Telekinetic Charging Cell': 100,
        'Tellarknight Ptolemaeus': 100,
        'Tempest, Dragon Ruler of Storms': 5,
        'Tenpai Dragon Chundra': 50,
        'Tenpai Dragon Genroku': 25,
        'Tenyi Spirit - Ashuna': 3,
        'Terraforming': 33,
        'That Grass Looks Greener': 50,
        'The Black Goat Laughs': 10,
        'The Bystial Lubellion': 30,
        'The Dragon that Devours the Dogma': 5,
        'The Fallen & The Virtuous': 40,
        'The Forceful Sentry': 100,
        'The Gates of Dark World': 5,
        'The Gaze of Timaeus': 1,
        'The Last Warrior from Another Planet': 100,
        'The Melody of Awakening Dragon': 25,
        'The Monarchs Erupt': 50,
        'The Phantom Knights\' Rank-Up-Magic Launch': 1,
        'The Tyrant Neptune': 100,
        'The Unstoppable Exodia Incarnate': 20,
        'The Zombie Vampire': 50,
        'Theorealize': 5,
        'There Can Be Only One': 100,
        'Therion "King" Regulus': 20,
        'Thunder Dragon Colossus': 67,
        'Thunder King Rai-Oh': 20,
        'Tidal, Dragon Ruler of Waterfalls': 5,
        'Toadally Awesome': 20,
        'Toon Table of Contents': 7,
        'Totem Bird': 10,
        'Tour Guide From the Underworld': 3,
        'Trade-In': 5,
        'Transaction Rollback': 7,
        'Trap Dustshoot': 94,
        'Trap Holic': 7,
        'Trap Trick': 3,
        'Traptrix Rafflesia': 20,
        'Treasures of the Kings': 5,
        'Tri-Brigade Mercourier': 5,
        'Triple Tactics Talent': 93,
        'Triple Tactics Thrust': 13,
        'Trishula, Dragon of the Ice Barrier': 13,
        'True King of All Calamities': 100,
        'Tyrant\'s Tirade': 100,
        'Ultimate Slayer': 1,
        'Ultimaya Tzolkin': 100,
        'Union Hangar': 15,
        'Upstart Goblin': 7,
        'Uzuhime the Manifested Mikanko': 18,
        'Vanity\'s Emptiness': 100,
        'Vanity\'s Fiend': 100,
        'Vanity\'s Ruler': 100,
        'Vanquish Soul Hollie Sue': 33,
        'Vanquish Soul Jiaolong': 11,
        'Vanquish Soul Razen': 11,
        'Varudras, the Final Bringer of the End Times': 20,
        'Virtual World Kyubi - Shenshen': 20,
        'Virtual World Mai-Hime - Lulu': 3,
        'Wandering Gryphon Rider': 50,
        'WANTED: Seeker of Sinful Spoils': 33,
        'Welcome Labrynth': 20,
        'Wind-Up Carrier Zenmaity': 15,
        'Wind-Up Hunter': 86,
        'Wishes for Eyes of Blue': 33,
        'Witch of the White Forest': 33,
        'World Legacy Monstrosity': 1,
        'Zaborg the Mega Monarch': 100,
        'Zalen the Shackled Dragon': 10,
        'Zoodiac Barrage': 33,
        'Zoodiac Broadbull': 66,
        'Zoodiac Drident': 20,
        'Zoodiac Ratpier': 50
    },

    // ── Genesys banlist init ──────────────────────────────────────────────────
    _initGenesys: async function () {
        if (localStorage.getItem(this._FLAGS.genesys)) return;

        const STORAGE_KEY = 'yugioh_banlist_data';
        const pointsMap   = this._genesysPoints;
        const names       = Object.keys(pointsMap);

        // Leer/construir estructura de banlist
        let data;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            data = raw ? JSON.parse(raw) : null;
        } catch (_) { data = null; }

        if (!data || typeof data.formats !== 'object') {
            data = {
                activeFormats: ['TCG'],
                formats: {
                    TCG:     { cards: {}, lastUpdated: null, isCustom: false },
                    OCG:     { cards: {}, lastUpdated: null, isCustom: false },
                    Genesys: { cards: {}, isCustom: false, isGenesys: true }
                }
            };
        }
        if (!data.formats.Genesys) {
            data.formats.Genesys = { cards: {}, isCustom: false, isGenesys: true };
        }

        // Si ya tiene cartas inyectadas previamente, solo poner el flag y salir
        if (Object.keys(data.formats.Genesys.cards).length > 0) {
            localStorage.setItem(this._FLAGS.genesys, '1');
            return;
        }

        // Fetch DB completa una sola vez, construir mapa nombre→card
        let nameToCard = {};
        try {
            const res  = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php');
            const json = await res.json();
            (json.data || []).forEach(c => { nameToCard[c.name] = c; });
        } catch (e) {
            console.warn('[DefaultData] _initGenesys: fallo fetch DB:', e);
            return; // Reintentar en próxima carga
        }

        // Inyectar cartas encontradas
        let injected = 0;
        let missing  = [];
        for (const name of names) {
            const card = nameToCard[name];
            if (!card) { missing.push(name); continue; }
            const id  = String(card.id);
            const pts = pointsMap[name];
            data.formats.Genesys.cards[id] = {
                name:   card.name,
                img:    `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`,
                points: pts
            };
            injected++;
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[DefaultData] _initGenesys: fallo guardar:', e);
            return;
        }

        localStorage.setItem(this._FLAGS.genesys, '1');
        console.log(`[DefaultData] Genesys: ${injected} cartas inyectadas.${missing.length ? ' Sin match: ' + missing.join(', ') : ''}`);

        // Refrescar UI si la sección de banlist está abierta
        if (window.Banlist && typeof Banlist.renderSection === 'function') {
            const sec = document.getElementById('banlist-section');
            if (sec && sec.style.display !== 'none') Banlist.renderSection();
        }
    },

        // ── Core init ─────────────────────────────────────────────────────────────
    init: async function () {
        // Síncronos primero (sin API)
        this._initNotes();
        this._initSpecialties();
        this._initGames();
        this._initMasters();

        // Asincrónos (con API)
        if (!localStorage.getItem(this._FLAGS.decks)) {
            console.log('[DefaultData] Cargando decks...');
            for (const [name, ydk] of Object.entries(this._ydks)) {
                await this._injectDeck(name, ydk);
            }
            localStorage.setItem(this._FLAGS.decks, '1');
            if (window.Engines) Engines._renderSidebar();
        }

        if (!localStorage.getItem(this._FLAGS.staples))  await this._initStaples();
        if (!localStorage.getItem(this._FLAGS.engines))  await this._initEngines();
        if (!localStorage.getItem(this._FLAGS.genesys))  await this._initGenesys();

        if (window.Engines) Engines._renderSidebar();
    },

    // ── Parche de Config (sin tocar formacion.js) ─────────────────────────────
    _patchConfig: function () {
        if (!window.Config) return;

        // resetToDefault: limpia TODO el localStorage → todos los flags desaparecen → re-init total
        const origReset = Config.resetToDefault.bind(Config);
        Config.resetToDefault = async function () {
            origReset();
            await DefaultData.init();
            if (window.Engines) Engines._renderSidebar();
            if (typeof Config.render === 'function') Config.render();
        };

           // borrarSeleccion: cuando 'config' está seleccionado, tras el borrado guardamos
        // una config con roles/specialties/staples vacíos para que getConfig() no caiga
        // en el fallback del defaultConfig en memoria → el usuario ve datos vacíos.
        const origBorrar = Config.borrarSeleccion.bind(Config);
        Config.borrarSeleccion = function () {
            const selected = [...document.querySelectorAll('.borrar-opcion-cb:checked')]
                .map(cb => cb.dataset.key);
            origBorrar();
            if (selected.includes('config') && window.ConfigManager) {
                // Guardar config limpia para evitar fallback al defaultConfig en memoria
                const empty = JSON.parse(JSON.stringify(ConfigManager.defaultConfig));
                empty.roles          = {};
                empty.roleConditions = { formacionGames: [] };
                empty.specialties    = [];
                empty.staples        = {};
                empty.pillars        = { consistency: [], power: [], resilience: [] };
                empty.shortcuts      = [];
                empty.nomenclature   = { categories: [] };
                ConfigManager.saveConfig(empty);
                // Refrescar UI inmediatamente
                if (typeof Config.render === 'function') Config.render();
            }
            if (selected.includes('banlist')) {
                localStorage.removeItem('yugioh_banlist_data');
                if (window.Banlist) Banlist.data = {};
            }
        };

        console.log('[DefaultData] Config parchado.');
    }
};

window.addEventListener('load', async () => {
    await DefaultData.init();
    DefaultData._patchConfig();
});