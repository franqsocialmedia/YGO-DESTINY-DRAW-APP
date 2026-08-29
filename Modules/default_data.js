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
        genesys:     'dd_default_genesys_loaded',
        metaJulio2026: 'dd_default_meta_julio2026_loaded'
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

    // ── Carpeta del Meta por defecto: Julio 2026 (100 decks) ───────────────────
    _metaJulio2026Decks: [{"filename":"Archifiend","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"2463794":1,"2857636":1,"5168381":1,"11248645":2,"12067160":1,"13379114":1,"14558127":3,"23434538":1,"24224830":1,"28803166":1,"29301450":1,"30271097":2,"32991300":1,"42141493":1,"46640168":1,"48469380":2,"49867899":1,"58071334":1,"58769832":3,"60764609":2,"63679166":1,"65403020":1,"66540884":2,"71607202":1,"71818935":1,"73642296":1,"78397661":1,"78744660":1,"79559912":1,"82135803":1,"82997779":3,"85154941":3,"87746184":1,"87985506":1,"90764871":3,"93039339":1,"94423983":1,"97651498":1,"98567237":2},"sections":{"main":["97651498","23434538","66540884","66540884","14558127","14558127","14558127","73642296","11248645","11248645","42141493","28803166","85154941","85154941","85154941","65403020","60764609","60764609","58769832","58769832","58769832","48469380","48469380","78744660","98567237","98567237","90764871","90764871","90764871","63679166","24224830","82997779","82997779","82997779","30271097","30271097","94423983","5168381","87985506","13379114"],"extra":["46640168","87746184","58071334","82135803","78397661","79559912","93039339","32991300","2463794","2857636","71607202","29301450","71818935","49867899","12067160"],"side":[]}},{"filename":"Argostar","mostFrequentCard":"10045474","cardCount":57,"cardFrequency":{"1528054":2,"2674965":1,"10045474":3,"11765832":1,"14558127":3,"23434538":1,"29301450":2,"30964246":3,"32807846":1,"38379052":2,"40706444":3,"48130397":3,"49238328":1,"54757758":1,"58053438":3,"60411677":1,"65889305":1,"66532962":1,"69299029":2,"81674782":3,"85888377":3,"90448279":1,"91284003":1,"91438674":3,"91800273":1,"93039339":1,"95561146":2,"96334243":1,"97045737":3,"97522863":1,"97800311":1,"98978921":1},"sections":{"main":["23434538","14558127","14558127","14558127","91438674","91438674","91438674","97522863","91800273","60411677","32807846","49238328","2674965","69299029","69299029","81674782","81674782","81674782","30964246","30964246","30964246","48130397","48130397","48130397","10045474","10045474","10045474","97045737","97045737","97045737","58053438","58053438","58053438","85888377","85888377","85888377","65889305","38379052","38379052","91284003","95561146","95561146"],"extra":["54757758","66532962","96334243","11765832","97800311","40706444","40706444","40706444","90448279","93039339","98978921","29301450","29301450","1528054","1528054"],"side":[]}},{"filename":"Aromage","mostFrequentCard":"911883","cardCount":67,"cardFrequency":{"911883":3,"10045474":3,"10604644":1,"14169843":1,"14558127":3,"15177750":1,"16759958":1,"21200905":2,"21903613":1,"24224830":2,"24299458":3,"24689197":3,"25861589":3,"27520594":3,"28279365":3,"29095457":1,"29177818":1,"29301450":1,"30989084":1,"38814750":1,"40663548":1,"44478599":1,"48686504":1,"49036338":1,"53286626":2,"56506740":3,"61049315":1,"65563871":2,"66407907":1,"73167098":1,"73345237":1,"74586817":1,"79656239":1,"83610035":3,"83764719":1,"84792926":1,"91557476":1,"92266279":1,"92501449":3,"93896655":2},"sections":{"main":["27520594","27520594","27520594","49036338","16759958","14169843","24689197","24689197","24689197","38814750","66407907","48686504","61049315","14558127","14558127","14558127","29177818","40663548","10604644","83610035","83610035","83610035","83764719","911883","911883","911883","53286626","53286626","25861589","25861589","25861589","84792926","56506740","56506740","56506740","24224830","24224830","24299458","24299458","24299458","28279365","28279365","28279365","29095457","92501449","92501449","92501449","10045474","10045474","10045474","92266279","15177750"],"extra":["73167098","79656239","74586817","30989084","93896655","93896655","65563871","65563871","91557476","21200905","21200905","21903613","29301450","44478599","73345237"],"side":[]}},{"filename":"Artmage","mostFrequentCard":"1122030","cardCount":55,"cardFrequency":{"1122030":3,"11321089":1,"11765832":1,"14532163":2,"14558127":3,"17719582":1,"18144507":1,"23434538":1,"23599634":1,"23829452":2,"24224830":1,"27118421":1,"27184601":2,"29301450":1,"30271097":3,"34541940":3,"37517035":1,"42141493":3,"44654994":1,"48130397":2,"53589300":1,"54757758":1,"60946049":2,"69946549":1,"74011784":3,"74631897":2,"74733322":3,"78397661":1,"87746184":1,"89851827":1,"96334243":1,"97434754":2,"97556336":2},"sections":{"main":["23829452","23829452","23434538","14558127","14558127","14558127","97434754","97434754","42141493","42141493","42141493","97556336","97556336","60946049","60946049","34541940","34541940","34541940","74011784","74011784","74011784","18144507","14532163","14532163","74733322","74733322","74733322","1122030","1122030","1122030","37517035","48130397","48130397","24224830","30271097","30271097","30271097","23599634","17719582","44654994"],"extra":["54757758","96334243","11765832","74631897","74631897","69946549","87746184","27184601","27184601","89851827","27118421","11321089","53589300","78397661","29301450"],"side":[]}},{"filename":"Ashened","mostFrequentCard":"3055018","cardCount":55,"cardFrequency":{"3055018":3,"4271596":1,"8264361":1,"8540986":1,"10045474":2,"11765832":1,"14558127":3,"23434538":3,"24224830":2,"29301450":1,"29423048":2,"30453613":3,"30676200":1,"34813443":1,"35035985":3,"35151572":1,"46412900":1,"48130397":1,"49238328":1,"54757758":1,"58143766":1,"61434639":1,"62111090":1,"62156277":1,"64182380":1,"65681983":1,"65741786":1,"66848311":1,"67660909":3,"69946549":1,"78783557":3,"85106525":2,"90846359":1,"93039339":1,"98828338":3},"sections":{"main":["23434538","23434538","23434538","14558127","14558127","14558127","67660909","67660909","67660909","35151572","62156277","30676200","46412900","4271596","78783557","78783557","78783557","98828338","98828338","98828338","49238328","85106525","85106525","3055018","3055018","3055018","61434639","48130397","24224830","24224830","65681983","30453613","30453613","30453613","10045474","10045474","58143766","34813443","90846359","66848311"],"extra":["54757758","11765832","62111090","69946549","35035985","35035985","35035985","8540986","29423048","29423048","64182380","93039339","65741786","8264361","29301450"],"side":[]}},{"filename":"Blackwing","mostFrequentCard":"41371602","cardCount":60,"cardFrequency":{"3298689":1,"4731783":1,"7459919":1,"7602800":2,"8571567":1,"8617563":1,"9012916":1,"10602628":1,"14558127":2,"14785765":1,"15005145":1,"15693423":1,"15939229":1,"22850702":1,"23434538":1,"24224830":1,"24299458":1,"27548199":1,"28674152":1,"28781003":1,"34976176":1,"36429703":1,"38342335":1,"40366667":1,"41371602":3,"42141493":2,"42493140":1,"49003716":1,"54594017":1,"54693926":1,"58988903":1,"65681983":1,"70456282":1,"70465810":3,"71187462":3,"71858682":1,"73218989":1,"73347079":1,"79415624":1,"81470373":3,"89558743":3,"91351370":2,"94145021":2,"96157835":1,"97698279":1},"sections":{"main":["94145021","94145021","23434538","34976176","71187462","71187462","71187462","54594017","14558127","14558127","49003716","14785765","8571567","70465810","70465810","70465810","15005145","42493140","42141493","42141493","70456282","81470373","81470373","81470373","7459919","28674152","97698279","58988903","54693926","89558743","89558743","89558743","41371602","41371602","41371602","91351370","91351370","7602800","7602800","3298689","24224830","65681983","24299458","15693423","40366667"],"extra":["10602628","9012916","27548199","73218989","22850702","71858682","79415624","73347079","28781003","8617563","96157835","15939229","36429703","38342335","4731783"],"side":[]}},{"filename":"Blue-Eyes","mostFrequentCard":"8240199","cardCount":55,"cardFrequency":{"8240199":3,"10045474":3,"10515412":1,"11443677":1,"14558127":3,"17725109":1,"17947697":3,"23434538":1,"24361622":1,"24382602":1,"26268488":1,"29095457":1,"33854624":1,"33907039":2,"42097666":2,"43219114":1,"43321985":1,"56506740":2,"56532353":1,"59822133":3,"62089826":1,"63198739":2,"63436931":1,"70088809":2,"80326401":2,"84815190":1,"88901994":1,"89604813":1,"89631139":2,"93125329":1,"94145021":2,"97045737":3,"97268402":3},"sections":{"main":["89631139","89631139","97268402","97268402","97268402","94145021","94145021","8240199","8240199","8240199","17947697","17947697","17947697","23434538","14558127","14558127","14558127","63198739","63198739","33854624","70088809","70088809","17725109","80326401","80326401","33907039","33907039","88901994","24382602","56506740","56506740","29095457","43219114","10045474","10045474","10045474","97045737","97045737","97045737","62089826"],"extra":["11443677","56532353","93125329","43321985","59822133","59822133","59822133","10515412","84815190","26268488","63436931","89604813","42097666","42097666","24361622"],"side":[]}},{"filename":"Branded","mostFrequentCard":"1984618","cardCount":75,"cardFrequency":{"1984618":3,"3410461":1,"5318639":2,"14558127":3,"16922142":1,"17751597":1,"19096726":1,"19304410":1,"20508881":2,"23434538":1,"24224830":1,"24299458":3,"24915933":1,"29948294":3,"30271097":3,"36637374":1,"39341885":1,"41373230":1,"42141493":3,"44146295":1,"44362883":1,"45484331":1,"45883110":1,"51409648":1,"53813120":1,"53927851":1,"54143349":3,"55273560":1,"60303688":1,"62962630":3,"67115133":2,"68468459":1,"70369116":1,"70534340":1,"72578374":1,"73819701":2,"74405783":1,"75500286":1,"76666602":2,"78397661":1,"80538047":3,"82489470":1,"84192580":3,"85315450":1,"87746184":2,"94145021":2,"94395649":1,"95515789":1},"sections":{"main":["94145021","94145021","23434538","14558127","14558127","14558127","54143349","54143349","54143349","80538047","80538047","80538047","19304410","60303688","68468459","94395649","62962630","62962630","62962630","55273560","45484331","82489470","19096726","95515789","45883110","42141493","42141493","42141493","84192580","84192580","84192580","73819701","73819701","16922142","85315450","53927851","75500286","1984618","1984618","1984618","44362883","5318639","5318639","24224830","24299458","24299458","24299458","36637374","29948294","29948294","29948294","67115133","67115133","20508881","20508881","30271097","30271097","30271097","53813120","17751597"],"extra":["41373230","87746184","87746184","44146295","3410461","70534340","24915933","51409648","72578374","76666602","76666602","78397661","74405783","70369116","39341885"],"side":[]}},{"filename":"Buster Blader","mostFrequentCard":"14558127","cardCount":65,"cardFrequency":{"3428069":1,"6172122":1,"6637331":1,"8264361":1,"11790356":2,"12266229":2,"14558127":3,"15693423":3,"23434538":2,"24224830":1,"24361622":1,"24382602":1,"25311006":1,"27204311":1,"29095457":1,"29301450":1,"31226177":1,"32104431":1,"32731036":3,"33280639":3,"33854624":1,"34090915":1,"35269904":1,"37818794":1,"41999284":1,"42097666":1,"42141493":3,"45819647":1,"46986417":1,"47158777":1,"49823708":3,"56506740":3,"63198739":3,"70369116":1,"72656408":1,"74677425":1,"78193831":1,"86066372":1,"86240887":1,"89558743":3,"93039339":1,"94145021":1,"97631303":2},"sections":{"main":["46986417","74677425","94145021","49823708","49823708","49823708","97631303","97631303","23434538","23434538","14558127","14558127","14558127","63198739","63198739","63198739","42141493","42141493","42141493","6637331","33854624","72656408","78193831","3428069","32731036","32731036","32731036","27204311","12266229","12266229","6172122","25311006","89558743","89558743","89558743","35269904","24382602","34090915","56506740","56506740","56506740","24224830","29095457","32104431","33280639","33280639","33280639","15693423","15693423","15693423"],"extra":["86240887","37818794","11790356","11790356","93039339","42097666","31226177","41999284","24361622","70369116","47158777","8264361","29301450","45819647","86066372"],"side":[]}},{"filename":"Centur-Ion","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"8841431":1,"14558127":3,"15005145":3,"15693423":3,"15982593":1,"21123811":1,"24224830":1,"24915933":1,"26268488":1,"29948294":2,"30271097":3,"40155014":2,"41371602":3,"41373230":1,"42141493":3,"42493140":3,"44146295":1,"51409648":1,"53971455":1,"55273560":2,"63436931":1,"65681983":1,"68468459":1,"71858682":1,"73819701":2,"74586817":1,"76666602":1,"77765207":1,"78397661":1,"82489470":1,"87746184":1,"92907248":1,"94145021":2,"95515789":1,"96030710":1,"97698279":1},"sections":{"main":["94145021","94145021","14558127","14558127","14558127","68468459","55273560","55273560","82489470","95515789","15005145","15005145","15005145","42493140","42493140","42493140","42141493","42141493","42141493","96030710","73819701","73819701","97698279","41371602","41371602","41371602","24224830","65681983","29948294","29948294","77765207","92907248","30271097","30271097","30271097","15693423","15693423","15693423","40155014","40155014"],"extra":["41373230","87746184","44146295","24915933","51409648","76666602","74586817","8841431","78397661","26268488","21123811","53971455","63436931","71858682","15982593"],"side":[]}},{"filename":"Cyber Dragon","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"1142880":1,"1546123":1,"5370235":1,"8963089":1,"10443957":1,"10604644":1,"14558127":3,"19715246":1,"23434538":1,"23893227":3,"24094653":1,"24224830":1,"24701066":1,"37630732":1,"41739381":2,"42141493":2,"46724542":1,"48626373":1,"56100345":1,"56364287":1,"58069384":1,"60600126":3,"63031396":3,"64753988":3,"65681983":1,"70095154":1,"79229522":1,"82315403":1,"82428674":1,"82562802":3,"84058253":2,"84797028":1,"87116928":1,"94145021":2,"96462121":1,"98439949":1,"98462037":1,"98829635":2},"sections":{"main":["94145021","94145021","56364287","1142880","23434538","23893227","23893227","23893227","14558127","14558127","14558127","82562802","82562802","82562802","5370235","42141493","42141493","70095154","98439949","19715246","56100345","10604644","24094653","37630732","60600126","60600126","60600126","63031396","63031396","63031396","96462121","64753988","64753988","64753988","84797028","24224830","65681983","98829635","98829635","82428674"],"extra":["84058253","84058253","8963089","79229522","1546123","87116928","82315403","58069384","24701066","10443957","48626373","41739381","41739381","46724542","98462037"],"side":[]}},{"filename":"Dark World","mostFrequentCard":"1475311","cardCount":55,"cardFrequency":{"1475311":3,"4280258":1,"7623640":1,"8264361":1,"9763474":1,"16209941":2,"17535764":1,"25311006":1,"29301450":1,"32619583":2,"34230233":1,"39552584":1,"41406613":3,"43694650":3,"52350806":3,"58699500":1,"60228941":3,"64034255":3,"65956182":1,"66011101":1,"70368879":3,"70711847":3,"72892473":1,"73082255":1,"74117290":1,"74997493":1,"84815190":1,"94151981":1,"98095162":1,"98127546":1,"98462037":1,"98696958":2,"99111753":1,"99745551":3},"sections":{"main":["7623640","64034255","64034255","64034255","17535764","43694650","43694650","43694650","99745551","99745551","99745551","60228941","60228941","60228941","16209941","16209941","52350806","52350806","52350806","32619583","32619583","70711847","70711847","70711847","34230233","41406613","41406613","41406613","70368879","70368879","70368879","72892473","74117290","1475311","1475311","1475311","25311006","98696958","98696958","65956182"],"extra":["39552584","84815190","94151981","66011101","73082255","99111753","58699500","8264361","98462037","29301450","9763474","98095162","74997493","4280258","98127546"],"side":[]}},{"filename":"Darklords","mostFrequentCard":"10426067","cardCount":55,"cardFrequency":{"4167084":1,"10136446":2,"10426067":3,"11688916":3,"12500059":3,"14517422":1,"14558127":3,"17266660":1,"22850702":1,"23434538":1,"24224830":1,"24299458":1,"25311006":1,"25451652":1,"29301450":1,"30271097":2,"35306215":2,"42141493":3,"46935289":1,"48152161":1,"48589580":1,"50501121":1,"52840267":3,"53904087":1,"55226153":1,"78397661":1,"84031359":2,"84521924":1,"84693918":1,"87112784":3,"87746184":1,"90290572":1,"91434602":1,"93039339":1,"93481594":1,"98829635":1,"99941223":1},"sections":{"main":["55226153","12500059","12500059","12500059","11688916","11688916","11688916","17266660","23434538","84693918","14558127","14558127","14558127","42141493","42141493","42141493","10426067","10426067","10426067","84031359","84031359","91434602","52840267","52840267","52840267","25451652","87112784","87112784","87112784","14517422","25311006","93481594","99941223","24224830","24299458","30271097","30271097","98829635","50501121","48152161"],"extra":["87746184","4167084","10136446","10136446","78397661","22850702","93039339","35306215","35306215","46935289","90290572","29301450","53904087","48589580","84521924"],"side":[]}},{"filename":"DDD","mostFrequentCard":"11609969","cardCount":55,"cardFrequency":{"3758046":1,"5997110":1,"6325660":2,"9024198":2,"9030160":1,"10045474":1,"11609969":3,"11852093":1,"14558127":3,"15939229":1,"20715411":3,"23434538":1,"24224830":1,"28406301":3,"30998403":1,"32232538":1,"32665564":1,"40366667":3,"42141493":3,"42382265":2,"44852429":1,"46372010":3,"46593546":2,"46796664":1,"65681983":1,"67322708":1,"70576413":1,"71398055":1,"71612253":1,"72181263":1,"72291412":1,"74069667":1,"74583607":1,"79559912":1,"89558743":1,"94145021":2},"sections":{"main":["94145021","94145021","11609969","11609969","11609969","72291412","23434538","42382265","42382265","67322708","14558127","14558127","14558127","72181263","46796664","28406301","28406301","28406301","42141493","42141493","42141493","74069667","5997110","20715411","20715411","20715411","89558743","32665564","46372010","46372010","46372010","24224830","65681983","10045474","40366667","40366667","40366667","6325660","6325660","9030160"],"extra":["74583607","11852093","71398055","70576413","44852429","3758046","32232538","71612253","79559912","15939229","46593546","46593546","30998403","9024198","9024198"],"side":[]}},{"filename":"Dinomorphia","mostFrequentCard":"12682213","cardCount":55,"cardFrequency":{"7336745":2,"12682213":3,"14558127":3,"22850702":1,"23434538":1,"26631975":3,"29301450":1,"31044787":3,"38628859":1,"40366667":3,"40605147":1,"41420027":1,"42752141":1,"48832775":2,"52020510":2,"60465049":1,"70088809":3,"74936480":2,"78114463":1,"78397661":1,"78420796":3,"80101899":3,"91800273":1,"92133240":3,"92798873":3,"93039339":1,"93125329":1,"94145021":2,"98506199":1,"98645731":1},"sections":{"main":["94145021","94145021","23434538","14558127","14558127","14558127","38628859","92133240","92133240","92133240","91800273","70088809","70088809","70088809","98645731","31044787","31044787","31044787","80101899","80101899","80101899","52020510","52020510","26631975","26631975","26631975","78420796","78420796","78420796","40366667","40366667","40366667","41420027","40605147","7336745","7336745","12682213","12682213","12682213","78114463"],"extra":["48832775","48832775","74936480","74936480","92798873","92798873","92798873","93125329","98506199","78397661","22850702","60465049","42752141","93039339","29301450"],"side":[]}},{"filename":"Dogmatik","mostFrequentCard":"1984618","cardCount":55,"cardFrequency":{"1984618":3,"14558127":3,"23434538":1,"24915933":1,"25311006":1,"29301450":1,"29948294":3,"30271097":3,"30394645":1,"31002402":1,"33854624":1,"35569555":1,"41373230":1,"42141493":3,"51409648":1,"51522296":1,"53971455":1,"55273560":1,"60303688":3,"69680031":1,"70088809":3,"72444406":1,"73355772":1,"73819701":3,"74405783":1,"74586817":1,"76666602":1,"78397661":1,"79415624":1,"80532587":1,"82956214":2,"87746184":1,"93125329":1,"94145021":2,"95515789":1,"95679145":1,"98506199":1},"sections":{"main":["94145021","94145021","23434538","14558127","14558127","14558127","60303688","60303688","60303688","55273560","95515789","42141493","42141493","42141493","73819701","73819701","73819701","33854624","70088809","70088809","70088809","69680031","95679145","73355772","30394645","51522296","1984618","1984618","1984618","25311006","31002402","35569555","29948294","29948294","29948294","30271097","30271097","30271097","82956214","82956214"],"extra":["80532587","41373230","87746184","24915933","51409648","76666602","93125329","98506199","74586817","72444406","78397661","74405783","53971455","79415624","29301450"],"side":[]}},{"filename":"Dracotail Branded","mostFrequentCard":"1498449","cardCount":55,"cardFrequency":{"1498449":3,"3410461":1,"5431722":1,"6153210":3,"7375867":3,"18666161":1,"23434538":1,"24224830":1,"24299458":2,"24915933":1,"27118421":1,"29948294":3,"30271097":2,"32548318":1,"33760966":2,"33854624":1,"36637374":1,"41373230":1,"42141493":3,"44146295":1,"44362883":1,"44482554":1,"45883110":1,"48130397":2,"51409648":1,"55273560":1,"62962630":1,"68468459":1,"70534340":1,"70871153":1,"72578374":1,"73819701":2,"75003700":1,"76666602":1,"78397661":1,"80208225":1,"87746184":1,"89851827":1,"95515789":2},"sections":{"main":["23434538","7375867","7375867","7375867","68468459","62962630","55273560","95515789","95515789","45883110","42141493","42141493","42141493","75003700","73819701","73819701","1498449","1498449","1498449","33854624","70871153","44482554","44362883","6153210","6153210","6153210","32548318","48130397","48130397","24224830","24299458","24299458","36637374","29948294","29948294","29948294","30271097","30271097","5431722","80208225"],"extra":["41373230","87746184","44146295","3410461","70534340","24915933","51409648","72578374","33760966","33760966","89851827","76666602","27118421","18666161","78397661"],"side":[]}},{"filename":"Egypcian God","mostFrequentCard":"15771991","cardCount":60,"cardFrequency":{"2530830":1,"8165596":1,"10000010":1,"10000080":2,"11335209":1,"11587414":2,"12580477":1,"14532163":1,"15735108":2,"15771991":3,"16528181":3,"18144507":1,"19613556":1,"23434538":1,"24224830":1,"24299458":3,"25311006":2,"26984177":3,"28400508":1,"29301450":1,"30271097":2,"35261759":2,"35269904":1,"39030163":1,"42141493":3,"42166000":1,"47330808":1,"50357013":1,"52119435":1,"57314798":1,"63767246":1,"64182380":1,"73082255":1,"74725513":1,"78397661":1,"78665705":1,"84192580":2,"84941194":3,"87746184":1,"88177324":1,"93039339":1},"sections":{"main":["23434538","42141493","42141493","42141493","84192580","84192580","11335209","47330808","84941194","84941194","84941194","74725513","10000010","10000080","10000080","15771991","15771991","15771991","12580477","18144507","19613556","35261759","35261759","14532163","25311006","25311006","78665705","35269904","50357013","15735108","15735108","26984177","26984177","26984177","11587414","11587414","16528181","16528181","16528181","24224830","24299458","24299458","24299458","30271097","30271097"],"extra":["87746184","42166000","78397661","57314798","88177324","39030163","63767246","8165596","28400508","73082255","64182380","2530830","93039339","52119435","29301450"],"side":[]}},{"filename":"Egypcian Gods","mostFrequentCard":"14087893","cardCount":53,"cardFrequency":{"911883":2,"10000000":1,"10000020":1,"10000080":1,"14087893":3,"25652259":2,"26329679":1,"28150174":1,"28340377":1,"29284413":2,"31386180":1,"32807846":1,"37742478":3,"37926346":1,"48009503":1,"55557574":2,"56673112":3,"62517849":1,"63746411":1,"64454614":1,"64788463":3,"67750322":2,"68300121":1,"80796456":1,"81945678":3,"84013237":1,"90876561":2,"92067220":3,"93880808":1,"94770493":1,"97268402":3,"97453744":2},"sections":{"main":["25652259","25652259","90876561","90876561","97268402","97268402","97268402","64788463","64788463","64788463","37742478","37742478","37742478","67750322","67750322","56673112","56673112","56673112","29284413","29284413","10000000","10000020","10000080","93880808","32807846","911883","911883","92067220","92067220","92067220","14087893","14087893","14087893","94770493","55557574","55557574","81945678","81945678","81945678","28340377"],"extra":["84013237","37926346","26329679","28150174","48009503","63746411","80796456","62517849","68300121","97453744","97453744","31386180","64454614"],"side":[]}},{"filename":"Eldich","mostFrequentCard":"20590515","cardCount":55,"cardFrequency":{"102380":1,"1528054":1,"3129133":2,"4064256":1,"20590515":3,"20612097":3,"22669793":1,"22850702":1,"24207889":1,"24224830":1,"29301450":1,"31434645":2,"37129797":1,"39185163":1,"39767432":1,"40605147":1,"41420027":2,"43143567":3,"49238328":1,"49299410":2,"53334471":1,"56984514":1,"59305593":2,"66570171":1,"67234805":2,"68829754":1,"70636044":2,"74889525":2,"82732705":1,"83326048":1,"84749824":1,"85442146":1,"90846359":1,"93039339":1,"93191801":2,"94224458":1,"95440946":2,"95784714":1,"98978921":1},"sections":{"main":["66570171","102380","39185163","95440946","95440946","49238328","68829754","3129133","3129133","4064256","31434645","31434645","24224830","94224458","83326048","20612097","20612097","20612097","49299410","49299410","22669793","90846359","82732705","53334471","67234805","67234805","59305593","59305593","24207889","20590515","20590515","20590515","93191801","93191801","41420027","41420027","84749824","40605147","56984514","85442146"],"extra":["74889525","74889525","43143567","43143567","43143567","22850702","70636044","70636044","93039339","95784714","98978921","37129797","29301450","39767432","1528054"],"side":[]}},{"filename":"Elfnotes","mostFrequentCard":"10045474","cardCount":55,"cardFrequency":{"10045474":3,"11765832":1,"12375297":2,"13597785":3,"14558127":3,"22850702":1,"23434538":1,"24092792":1,"24224830":1,"27118421":1,"30271097":3,"33854624":1,"42302563":1,"44146295":1,"48130397":2,"48739627":2,"51409648":1,"54757758":1,"55273560":1,"56651978":1,"59581480":3,"60465049":1,"64491754":1,"68468459":1,"70088809":3,"72444406":1,"73819701":2,"74586817":1,"76666602":1,"78397661":1,"84815190":1,"85976588":1,"87746184":1,"93125329":1,"94145021":2,"97556336":3},"sections":{"main":["94145021","94145021","12375297","12375297","23434538","14558127","14558127","14558127","68468459","55273560","97556336","97556336","97556336","73819701","73819701","33854624","85976588","13597785","13597785","13597785","56651978","59581480","59581480","59581480","70088809","70088809","70088809","48739627","48739627","64491754","48130397","48130397","24224830","30271097","30271097","30271097","10045474","10045474","10045474","24092792"],"extra":["54757758","11765832","87746184","44146295","51409648","76666602","27118421","93125329","42302563","74586817","72444406","78397661","84815190","22850702","60465049"],"side":[]}},{"filename":"Enneacraft","mostFrequentCard":"10045474","cardCount":75,"cardFrequency":{"10045474":3,"17621695":2,"19504025":3,"23434538":1,"28454232":3,"29570824":3,"30271097":3,"35261759":3,"35480699":3,"44716748":3,"48608796":1,"50793215":1,"54020393":3,"54842941":3,"55965529":3,"56187077":3,"60465049":1,"67098897":1,"70088809":3,"71801447":3,"72167543":1,"72444406":1,"74586817":1,"76666602":1,"78397661":1,"80015408":3,"81237046":3,"82359538":3,"87746184":1,"90448279":1,"92171126":3,"93039339":1,"93125329":1,"94259633":1,"97268402":3,"98506199":1},"sections":{"main":["97268402","97268402","97268402","92171126","92171126","92171126","29570824","29570824","29570824","55965529","55965529","55965529","56187077","56187077","56187077","44716748","44716748","44716748","23434538","70088809","70088809","70088809","82359538","82359538","82359538","81237046","81237046","81237046","28454232","28454232","28454232","71801447","71801447","71801447","54842941","54842941","54842941","35261759","35261759","35261759","54020393","54020393","54020393","19504025","19504025","19504025","80015408","80015408","80015408","17621695","17621695","35480699","35480699","35480699","30271097","30271097","30271097","10045474","10045474","10045474"],"extra":["87746184","76666602","67098897","93125329","98506199","50793215","74586817","72444406","78397661","60465049","48608796","72167543","90448279","93039339","94259633"],"side":[]}},{"filename":"Exodia","mostFrequentCard":"102380","cardCount":65,"cardFrequency":{"102380":3,"1164211":3,"1528054":1,"2857636":3,"5402805":3,"7902349":1,"8124921":1,"14558127":3,"15693423":3,"23434538":1,"23617756":2,"24207889":1,"24224830":1,"29301450":1,"30241314":3,"33396948":1,"37613663":3,"38775407":3,"44519536":1,"44822037":2,"54475145":3,"58071334":1,"63017368":3,"63947968":1,"70903634":1,"73129314":1,"74169516":3,"75452921":2,"81674782":2,"83257450":3,"91800273":1,"93039339":1,"94145021":2,"00402416":1},"sections":{"main":["44519536","70903634","8124921","7902349","94145021","94145021","23434538","33396948","14558127","14558127","14558127","63947968","1164211","1164211","1164211","91800273","74169516","74169516","74169516","73129314","102380","102380","102380","54475145","54475145","54475145","38775407","38775407","38775407","37613663","37613663","37613663","63017368","63017368","63017368","81674782","81674782","24224830","00402416","15693423","15693423","15693423","23617756","23617756","30241314","30241314","30241314","24207889","44822037","44822037"],"extra":["58071334","83257450","83257450","83257450","93039339","75452921","75452921","2857636","2857636","2857636","29301450","1528054","5402805","5402805","5402805"],"side":[]}},{"filename":"Fable","mostFrequentCard":"14558127","cardCount":56,"cardFrequency":{"2463794":2,"9061682":1,"10045474":2,"11464648":1,"14558127":3,"19439119":2,"21281085":1,"22555834":1,"23434538":1,"24040093":3,"24224830":1,"26434972":1,"28803166":1,"29301450":1,"30983281":1,"32991300":1,"38814750":1,"39477584":1,"42141493":2,"46640168":1,"47217354":3,"49036338":1,"49633574":1,"49867899":1,"57630503":1,"57775790":1,"58071334":1,"60764609":2,"65681983":1,"65741786":1,"68897338":3,"73642296":1,"84815190":1,"94145021":2,"94292987":1,"97045737":3,"97439806":1,"97651498":1,"98567237":2},"sections":{"main":["49036338","97651498","94145021","94145021","47217354","47217354","47217354","19439119","19439119","49633574","23434538","38814750","68897338","68897338","68897338","97439806","14558127","14558127","14558127","73642296","24040093","24040093","24040093","57630503","42141493","42141493","28803166","60764609","60764609","98567237","98567237","22555834","57775790","24224830","65681983","26434972","10045474","10045474","97045737","97045737","97045737"],"extra":["46640168","58071334","11464648","94292987","9061682","30983281","39477584","84815190","21281085","32991300","2463794","2463794","65741786","29301450","49867899"],"side":[]}},{"filename":"Fairy Tail Magistus","mostFrequentCard":"14558127","cardCount":56,"cardFrequency":{"875572":1,"1845204":1,"4026187":1,"8660395":1,"14558127":3,"19144622":2,"19326613":1,"20714553":1,"22623509":1,"23434538":1,"24224830":1,"27548199":1,"27632520":1,"29301450":1,"34041788":1,"34755994":2,"35877582":1,"36099130":1,"37260677":1,"38943357":1,"40041559":1,"42141493":3,"42544773":2,"45819647":1,"55623480":1,"56725612":2,"64756282":1,"66532962":2,"73642296":2,"73664385":3,"74689476":1,"78021082":1,"82119326":1,"86937530":3,"94145021":2,"96228804":3,"98829635":3},"sections":{"main":["94145021","94145021","64756282","23434538","14558127","14558127","14558127","73642296","73642296","55623480","86937530","86937530","86937530","36099130","42141493","42141493","42141493","875572","42544773","42544773","19144622","19144622","40041559","96228804","96228804","96228804","22623509","1845204","38943357","82119326","56725612","56725612","34041788","73664385","73664385","73664385","24224830","19326613","98829635","98829635","98829635"],"extra":["66532962","66532962","4026187","78021082","35877582","37260677","27548199","8660395","74689476","27632520","34755994","34755994","29301450","20714553","45819647"],"side":[]}},{"filename":"Fiendsmith","mostFrequentCard":"10045474","cardCount":60,"cardFrequency":{"2295440":1,"2463794":2,"3557275":1,"6637331":1,"10045474":3,"11464648":1,"14558127":3,"22850702":1,"23434538":1,"24224830":1,"25311006":1,"26434972":1,"27204311":1,"28803166":2,"29095457":1,"29301450":1,"32731036":1,"32991300":1,"33854624":1,"34090915":1,"38814750":1,"42141493":2,"46533533":1,"46640168":1,"49036338":1,"49867899":1,"56506740":3,"59438930":1,"60764609":2,"63198739":3,"65681983":1,"65741786":1,"67630394":1,"71100270":1,"71818935":1,"72656408":1,"73642296":1,"79559912":1,"81418467":1,"82135803":1,"92501449":1,"93860227":1,"94145021":2,"97651498":1,"98567237":2,"99989863":1},"sections":{"main":["3557275","46533533","49036338","97651498","94145021","94145021","23434538","38814750","59438930","14558127","14558127","14558127","73642296","63198739","63198739","63198739","42141493","42141493","28803166","28803166","6637331","33854624","72656408","60764609","60764609","81418467","32731036","27204311","2295440","25311006","98567237","98567237","34090915","56506740","56506740","56506740","24224830","65681983","29095457","92501449","26434972","10045474","10045474","10045474","99989863"],"extra":["46640168","93860227","82135803","11464648","22850702","79559912","71100270","67630394","32991300","2463794","2463794","65741786","29301450","71818935","49867899"],"side":[]}},{"filename":"Fire King","mostFrequentCard":"2526224","cardCount":55,"cardFrequency":{"2526224":3,"2772337":1,"10045474":2,"14558127":3,"17548456":2,"18621798":1,"23015896":1,"23434538":1,"29301450":1,"30271097":2,"38572779":1,"40366667":3,"42141493":2,"44455560":3,"48815792":1,"52553102":3,"57554544":2,"60303245":1,"64182380":1,"65305978":1,"66431519":2,"70088809":3,"73082255":1,"78397661":1,"84192580":2,"87746184":1,"90681088":3,"91703676":1,"93125329":1,"93170499":3,"94259633":1,"96594609":1},"sections":{"main":["90681088","90681088","90681088","93170499","93170499","93170499","23434538","96594609","14558127","14558127","14558127","38572779","18621798","44455560","44455560","44455560","42141493","42141493","84192580","84192580","70088809","70088809","70088809","23015896","2526224","2526224","2526224","66431519","66431519","57554544","57554544","65305978","91703676","30271097","30271097","10045474","10045474","40366667","40366667","40366667"],"extra":["87746184","93125329","78397661","17548456","17548456","52553102","52553102","52553102","73082255","64182380","2772337","94259633","60303245","48815792","29301450"],"side":[]}},{"filename":"Flower Canadian","mostFrequentCard":"3966653","cardCount":55,"cardFrequency":{"3966653":3,"5489987":3,"7811875":1,"16780318":2,"17141718":3,"21915012":3,"30382214":3,"30786387":1,"32441317":3,"32807846":1,"33541430":3,"42291297":3,"54135423":3,"57261568":3,"66171432":1,"73271204":3,"78785392":1,"80630522":3,"81752019":3,"87460579":3,"89818984":3,"94388754":3},"sections":{"main":["81752019","81752019","81752019","5489987","5489987","5489987","30382214","30382214","30382214","57261568","57261568","57261568","94388754","94388754","94388754","17141718","17141718","17141718","54135423","54135423","54135423","89818984","89818984","89818984","80630522","80630522","80630522","32807846","32441317","32441317","32441317","78785392","30786387","66171432","73271204","73271204","73271204","16780318","16780318","7811875"],"extra":["21915012","21915012","21915012","3966653","3966653","3966653","33541430","33541430","33541430","42291297","42291297","42291297","87460579","87460579","87460579"],"side":[]}},{"filename":"Fossil","mostFrequentCard":"11302671","cardCount":55,"cardFrequency":{"4280258":1,"9464441":1,"10286023":1,"11302671":3,"12015000":1,"14558127":3,"21225115":1,"23147658":2,"23434538":3,"27548199":1,"32530043":1,"36187051":1,"38342335":1,"42143067":3,"44297127":3,"44440058":1,"45041488":3,"47606319":2,"48519867":3,"50277355":1,"57157964":1,"59419719":3,"59531356":1,"65741786":1,"73079836":1,"76218313":1,"83152482":1,"84778110":2,"85808813":1,"85914562":3,"86520461":1,"94689206":2,"96897184":1},"sections":{"main":["76218313","44440058","23434538","23434538","23434538","42143067","42143067","42143067","85914562","85914562","85914562","48519867","48519867","48519867","14558127","14558127","14558127","84778110","84778110","47606319","47606319","45041488","45041488","45041488","11302671","11302671","11302671","10286023","23147658","23147658","36187051","94689206","94689206","59419719","59419719","59419719","44297127","44297127","44297127","85808813"],"extra":["12015000","86520461","59531356","21225115","96897184","57157964","73079836","27548199","9464441","32530043","65741786","50277355","83152482","38342335","4280258"],"side":[]}},{"filename":"Gaia","mostFrequentCard":"2106266","cardCount":57,"cardFrequency":{"2106266":3,"2519690":3,"7913375":2,"8802510":1,"14532163":3,"14558127":3,"15989522":3,"18144507":1,"23434538":3,"24224830":2,"24299458":3,"24842059":1,"29726552":2,"33318980":1,"34130561":3,"35480699":3,"38590361":2,"40089744":3,"41209827":1,"49238328":3,"49328340":1,"54757758":1,"61525276":3,"69946549":1,"72064891":3,"73628505":1,"74586817":1},"sections":{"main":["23434538","23434538","23434538","14558127","14558127","14558127","7913375","7913375","61525276","61525276","61525276","29726552","29726552","34130561","34130561","34130561","33318980","18144507","73628505","49238328","49238328","49238328","14532163","14532163","14532163","38590361","38590361","40089744","40089744","40089744","2106266","2106266","2106266","49328340","35480699","35480699","35480699","24224830","24224830","24299458","24299458","24299458"],"extra":["54757758","72064891","72064891","72064891","2519690","2519690","2519690","15989522","15989522","15989522","41209827","69946549","74586817","24842059","8802510"],"side":[]}},{"filename":"Galaxy-Eyes","mostFrequentCard":"42141493","cardCount":55,"cardFrequency":{"897409":2,"2530830":2,"3356494":2,"4031928":1,"8165596":1,"14532163":2,"16643334":1,"18963306":1,"23434538":1,"24299458":2,"25311006":2,"27204311":2,"31801517":2,"32807846":1,"39030163":2,"42141493":3,"43147039":2,"46659709":2,"47051709":2,"48348921":1,"49238328":1,"60222582":1,"62968263":1,"63956833":1,"65367484":1,"66236707":2,"73478096":1,"84192580":2,"85747929":2,"89132148":2,"90448279":1,"93717133":2,"97639441":2,"98555327":2},"sections":{"main":["23434538","65367484","98555327","98555327","89132148","89132148","43147039","43147039","97639441","97639441","47051709","47051709","42141493","42141493","42141493","84192580","84192580","46659709","46659709","93717133","93717133","62968263","73478096","27204311","27204311","4031928","32807846","60222582","63956833","49238328","14532163","14532163","25311006","25311006","66236707","66236707","897409","897409","24299458","24299458"],"extra":["16643334","85747929","85747929","31801517","31801517","39030163","39030163","18963306","8165596","48348921","2530830","2530830","90448279","3356494","3356494"],"side":[]}},{"filename":"Gate Guardian","mostFrequentCard":"14558127","cardCount":65,"cardFrequency":{"2463794":1,"8165596":1,"8505920":1,"11335209":1,"14558127":3,"16528181":3,"22283204":1,"24224830":1,"25955164":2,"26984177":3,"27204311":1,"28803166":1,"29301450":1,"33055499":1,"34771947":3,"34904525":1,"35480699":3,"35552985":1,"37818794":1,"46396218":1,"47330808":1,"58071334":1,"59400890":1,"60176682":2,"60764609":2,"61398234":1,"62340868":2,"62411811":1,"66328392":2,"71818935":1,"72270339":3,"73082255":1,"73391962":1,"74725513":1,"79559912":1,"80845034":1,"84941194":3,"89312388":2,"93860227":1,"94845588":1,"96661780":1,"97631303":2,"98434877":2},"sections":{"main":["97631303","97631303","14558127","14558127","14558127","89312388","89312388","28803166","62411811","60764609","60764609","62340868","62340868","25955164","25955164","98434877","98434877","72270339","72270339","72270339","11335209","47330808","84941194","84941194","84941194","74725513","27204311","94845588","96661780","34771947","34771947","34771947","26984177","26984177","26984177","66328392","66328392","16528181","16528181","16528181","80845034","35480699","35480699","35480699","24224830","22283204","60176682","60176682","35552985","33055499"],"extra":["46396218","73391962","93860227","59400890","37818794","58071334","34904525","61398234","8505920","79559912","8165596","73082255","2463794","29301450","71818935"],"side":[]}},{"filename":"Gem-Knight","mostFrequentCard":"7394770","cardCount":55,"cardFrequency":{"1264319":1,"3113836":1,"7394770":3,"11765832":1,"12580477":1,"13108445":1,"14532163":2,"18144507":1,"19355597":1,"19613556":1,"23434538":1,"24220368":3,"24224830":1,"24299458":3,"24484270":2,"25311006":1,"25342956":1,"27004302":1,"35269904":2,"35622739":3,"39512984":1,"40597694":1,"42141493":3,"47611119":1,"48130397":2,"49597193":1,"51831560":3,"54757758":1,"55610199":1,"69946549":1,"76614340":1,"84192580":3,"88225269":2,"94145021":2,"96334243":1},"sections":{"main":["94145021","94145021","23434538","51831560","51831560","51831560","27004302","35622739","35622739","35622739","42141493","42141493","42141493","84192580","84192580","84192580","88225269","88225269","24220368","24220368","24220368","12580477","18144507","19613556","1264319","14532163","14532163","25311006","35269904","35269904","7394770","7394770","7394770","40597694","48130397","48130397","24224830","24299458","24299458","24299458"],"extra":["54757758","3113836","47611119","96334243","13108445","76614340","49597193","11765832","69946549","55610199","25342956","39512984","19355597","24484270","24484270"],"side":[]}},{"filename":"Generaider","mostFrequentCard":"20508881","cardCount":56,"cardFrequency":{"744887":1,"2665273":2,"4227096":2,"5318639":2,"11765832":1,"13903402":1,"14604710":1,"20508881":3,"24224830":1,"24299458":3,"29301450":1,"38053381":3,"39341885":1,"41522092":1,"48130397":3,"49275969":1,"53466722":1,"53813120":1,"53927851":1,"54143349":3,"54757758":1,"67115133":3,"68199168":1,"74615388":2,"75660578":1,"79864860":1,"80538047":3,"85315450":1,"89851827":1,"90303227":1,"90448279":1,"91749600":3,"94183877":3,"95113856":1},"sections":{"main":["54143349","54143349","54143349","80538047","80538047","80538047","94183877","94183877","94183877","75660578","13903402","49275969","744887","68199168","91749600","91749600","91749600","85315450","53927851","38053381","38053381","38053381","5318639","5318639","48130397","48130397","48130397","4227096","4227096","24224830","14604710","24299458","24299458","24299458","67115133","67115133","67115133","20508881","20508881","20508881","53813120"],"extra":["54757758","11765832","89851827","79864860","53466722","41522092","95113856","2665273","2665273","74615388","74615388","90303227","90448279","29301450","39341885"],"side":[]}},{"filename":"Ghostick","mostFrequentCard":"23434538","cardCount":61,"cardFrequency":{"23434538":3,"24207889":3,"26973555":1,"27170599":1,"29400787":1,"32224143":1,"35261759":3,"35871958":2,"36239585":1,"40605147":3,"40838625":2,"41420027":3,"46895036":1,"46925518":2,"48608796":1,"53334641":1,"54512827":2,"60303245":1,"61818176":1,"64804316":2,"65305468":1,"69809989":2,"72167543":1,"75367227":2,"80885284":3,"81907872":1,"85289965":1,"85827713":3,"86516889":3,"90448279":1,"90664857":1,"97584500":1,"98707192":3,"99795159":3},"sections":{"main":["54512827","54512827","81907872","98707192","98707192","98707192","23434538","23434538","23434538","46925518","46925518","36239585","80885284","80885284","80885284","97584500","64804316","64804316","35261759","35261759","35261759","69809989","69809989","99795159","99795159","99795159","29400787","86516889","86516889","86516889","40838625","40838625","61818176","27170599","85827713","85827713","85827713","24207889","24207889","24207889","41420027","41420027","41420027","40605147","40605147","40605147"],"extra":["65305468","26973555","46895036","48608796","32224143","75367227","75367227","90664857","72167543","53334641","90448279","60303245","35871958","35871958","85289965"],"side":[]}},{"filename":"Ghoti","mostFrequentCard":"8794055","cardCount":55,"cardFrequency":{"1980574":1,"5614808":1,"6625096":1,"8794055":3,"9464441":1,"12888461":3,"21147203":1,"23434538":1,"26400609":1,"26523337":3,"29301450":1,"39522887":3,"46037983":3,"46815301":2,"48882106":1,"57420265":2,"60643553":1,"61496006":1,"65910922":1,"65961304":1,"68756810":1,"72309040":1,"73421698":3,"75500286":1,"76133574":3,"81439174":1,"82184400":1,"86682165":1,"87188910":1,"88307361":1,"89617515":2,"90303176":1,"93039339":1,"96633955":1,"98127546":1,"99529628":3},"sections":{"main":["6625096","76133574","76133574","76133574","23434538","1980574","46037983","46037983","46037983","73421698","73421698","73421698","99529628","99529628","99529628","60643553","90303176","89617515","89617515","57420265","57420265","21147203","12888461","12888461","12888461","61496006","68756810","39522887","39522887","39522887","26523337","26523337","26523337","88307361","26400609","75500286","81439174","8794055","8794055","8794055"],"extra":["48882106","65910922","5614808","9464441","46815301","46815301","87188910","96633955","72309040","86682165","65961304","93039339","82184400","29301450","98127546"],"side":[]}},{"filename":"Gimmick Puppet","mostFrequentCard":"10045474","cardCount":58,"cardFrequency":{"1475311":1,"3685372":2,"4145915":1,"6325660":2,"7593748":1,"10045474":3,"14558127":3,"23434538":1,"24224830":1,"29216967":2,"33776843":2,"36400569":1,"36436372":3,"36890111":3,"40366667":3,"43598843":2,"48333324":1,"57093995":3,"63825486":3,"65681983":1,"69170557":3,"75433814":2,"76290637":2,"78114463":1,"79086452":1,"81439174":1,"88120966":1,"94145021":2,"94220427":1,"97520532":2,"98829635":2,"99229085":1},"sections":{"main":["94145021","94145021","23434538","14558127","14558127","14558127","29216967","29216967","43598843","43598843","4145915","36436372","36436372","36436372","79086452","99229085","63825486","63825486","63825486","1475311","48333324","94220427","57093995","57093995","57093995","81439174","36890111","36890111","36890111","24224830","65681983","98829635","98829635","10045474","10045474","10045474","36400569","40366667","40366667","40366667","6325660","6325660","78114463"],"extra":["7593748","88120966","75433814","75433814","76290637","76290637","33776843","33776843","69170557","69170557","69170557","3685372","3685372","97520532","97520532"],"side":[]}},{"filename":"Gouki","mostFrequentCard":"10045474","cardCount":55,"cardFrequency":{"7540107":1,"10045474":3,"10552026":2,"11516241":1,"12097275":1,"12580477":1,"14558127":3,"18144507":1,"20191720":1,"24073068":3,"29099860":3,"30010480":1,"30286474":1,"32807846":1,"35870016":1,"47946130":1,"50546029":1,"54088068":3,"59644128":2,"60461077":2,"62376646":2,"78437364":1,"85008676":2,"86066372":1,"88406570":1,"95448372":3,"97045737":3,"97268402":3,"97661969":1,"97688360":3,"07782069":1,"07382007":1},"sections":{"main":["97268402","97268402","97268402","85008676","85008676","7540107","54088068","54088068","54088068","14558127","14558127","14558127","97688360","97688360","97688360","24073068","24073068","24073068","29099860","29099860","29099860","60461077","60461077","12097275","20191720","12580477","18144507","32807846","62376646","62376646","35870016","95448372","95448372","95448372","10045474","10045474","10045474","97045737","97045737","97045737"],"extra":["07782069","07382007","59644128","59644128","10552026","10552026","97661969","78437364","30010480","88406570","30286474","47946130","86066372","11516241","50546029"],"side":[]}},{"filename":"HEROs","mostFrequentCard":"8949584","cardCount":65,"cardFrequency":{"1948619":1,"8949584":3,"9411399":3,"10186633":1,"10808715":1,"16605586":1,"17955766":1,"18094166":3,"19222426":1,"19324993":1,"21143940":2,"22865492":1,"22908820":1,"23204029":2,"24094653":2,"24299458":3,"25311006":2,"27780618":3,"30875635":3,"35480699":2,"40044918":3,"40237839":3,"45906428":1,"46759931":1,"50720316":1,"52947044":3,"56733747":1,"58004362":2,"58288218":1,"58481572":2,"60461804":1,"63060238":1,"66206748":1,"70369116":1,"75047173":1,"89943723":1,"93347961":1,"98829635":3},"sections":{"main":["89943723","17955766","22865492","16605586","30875635","30875635","30875635","40044918","40044918","40044918","50720316","63060238","27780618","27780618","27780618","10808715","66206748","18094166","18094166","18094166","9411399","9411399","9411399","58288218","40237839","40237839","40237839","24094653","24094653","45906428","8949584","8949584","8949584","52947044","52947044","52947044","25311006","25311006","10186633","35480699","35480699","21143940","21143940","24299458","24299458","24299458","98829635","98829635","98829635","75047173"],"extra":["58481572","58481572","19222426","22908820","93347961","46759931","60461804","56733747","23204029","23204029","1948619","58004362","58004362","70369116","19324993"],"side":[]}},{"filename":"Horus","mostFrequentCard":"5611760","cardCount":55,"cardFrequency":{"1984618":2,"5611760":3,"8165596":1,"10019086":1,"11335209":1,"11765832":1,"14558127":1,"16528181":3,"21698716":1,"23434538":1,"24224830":1,"24299458":2,"26984177":3,"29301450":1,"35726888":1,"38814750":1,"41373230":1,"42141493":3,"47330808":1,"49036338":1,"49299410":2,"59400890":1,"63542003":1,"63767246":1,"64182380":1,"65681983":1,"72444406":1,"73355772":3,"74725513":1,"80532587":2,"82956214":2,"84941194":3,"90448279":1,"93039339":1,"93125329":1,"93854893":1,"99307040":1,"99937011":1},"sections":{"main":["49036338","23434538","38814750","14558127","21698716","63542003","99937011","42141493","42141493","42141493","11335209","47330808","99307040","84941194","84941194","84941194","74725513","73355772","73355772","73355772","35726888","1984618","1984618","26984177","26984177","26984177","16528181","16528181","16528181","24224830","65681983","24299458","24299458","82956214","82956214","5611760","5611760","5611760","49299410","49299410"],"extra":["80532587","80532587","11765832","59400890","41373230","93125329","72444406","63767246","8165596","93854893","64182380","90448279","93039339","10019086","29301450"],"side":[]}},{"filename":"Ice Barrier","mostFrequentCard":"9126351","cardCount":57,"cardFrequency":{"5614808":1,"9126351":3,"9396662":2,"9464441":1,"10045474":3,"14558127":1,"17197110":1,"18319762":3,"23434538":1,"24224830":1,"25311006":1,"26400609":2,"32991027":2,"40366667":3,"42141493":2,"42566602":1,"43582229":1,"44308317":1,"50793215":1,"52687916":1,"53325667":1,"65681983":1,"69385019":1,"70088809":3,"70703416":1,"70980824":1,"72444406":1,"73061465":1,"79130389":1,"81275309":1,"81439174":1,"84192580":2,"84206435":3,"86682165":1,"93125329":1,"94145021":2,"96402918":2,"96633955":1},"sections":{"main":["94145021","94145021","70703416","9126351","9126351","9126351","23434538","9396662","9396662","14558127","73061465","18319762","18319762","18319762","44308317","42141493","42141493","84192580","84192580","81275309","32991027","32991027","26400609","26400609","70088809","70088809","70088809","84206435","84206435","84206435","25311006","17197110","81439174","43582229","24224830","65681983","10045474","10045474","10045474","40366667","40366667","40366667"],"extra":["53325667","42566602","93125329","50793215","5614808","9464441","72444406","52687916","96633955","86682165","96402918","96402918","70980824","69385019","79130389"],"side":[]}},{"filename":"Invoked","mostFrequentCard":"10045474","cardCount":56,"cardFrequency":{"5821478":1,"8264361":1,"9839945":1,"10045474":3,"12307878":1,"12580477":1,"14558127":3,"18144507":1,"18666161":1,"24915933":1,"25311006":1,"27204311":3,"30394645":3,"34755994":1,"35261759":3,"38339996":2,"42141493":3,"47679935":3,"52947044":3,"60303245":1,"60461804":1,"63362460":1,"64612053":1,"67288539":1,"74063034":3,"75286621":2,"81866673":1,"86120751":3,"89851827":1,"97268402":3,"97300502":2},"sections":{"main":["97268402","97268402","97268402","14558127","14558127","14558127","38339996","38339996","63362460","86120751","86120751","86120751","42141493","42141493","42141493","81866673","64612053","30394645","30394645","30394645","27204311","27204311","27204311","12580477","18144507","35261759","35261759","35261759","74063034","74063034","74063034","52947044","52947044","52947044","25311006","47679935","47679935","47679935","10045474","10045474","10045474"],"extra":["12307878","97300502","97300502","60461804","24915933","89851827","75286621","75286621","18666161","60303245","34755994","9839945","8264361","67288539","5821478"],"side":[]}},{"filename":"Junk Synchron","mostFrequentCard":"10045474","cardCount":65,"cardFrequency":{"9742784":2,"10045474":3,"11069680":2,"14558127":3,"16449363":2,"17201951":3,"18711696":2,"21123811":1,"23002292":2,"23434538":1,"24224830":1,"26387390":1,"27572350":1,"30983281":1,"32807846":1,"35952884":1,"36742774":1,"37675907":1,"37750912":1,"37799519":2,"42141493":3,"42711820":1,"43834302":2,"44508094":1,"52687916":1,"53325667":1,"57458399":1,"60283232":2,"63184227":2,"63436931":1,"63977008":2,"65681983":1,"70088809":2,"72444406":1,"73218792":3,"73642296":1,"77075360":1,"77202120":1,"84815190":1,"90953320":1,"91215724":1,"93125329":1,"94145021":1,"97682931":1},"sections":{"main":["94145021","9742784","9742784","16449363","16449363","17201951","17201951","17201951","23434538","11069680","11069680","57458399","77202120","91215724","18711696","18711696","63977008","63977008","14558127","14558127","14558127","73642296","97682931","37799519","37799519","63184227","63184227","42141493","42141493","42141493","73218792","73218792","73218792","60283232","60283232","70088809","70088809","43834302","43834302","32807846","37750912","36742774","24224830","65681983","26387390","10045474","10045474","10045474","23002292","23002292"],"extra":["42711820","90953320","37675907","53325667","77075360","93125329","44508094","30983281","72444406","52687916","84815190","27572350","35952884","21123811","63436931"],"side":[]}},{"filename":"K9","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"2061963":1,"14558127":3,"23434538":1,"24299458":2,"25311006":1,"27308231":1,"27420823":1,"28642461":2,"30271097":3,"34876719":1,"35261759":2,"35595518":2,"40673853":1,"42141493":3,"47960073":3,"49456901":1,"53792930":1,"54919528":1,"55031170":3,"61374414":1,"67515699":2,"73642296":2,"76666602":1,"78397661":1,"80181649":3,"87746184":1,"90303227":1,"90448279":1,"91025875":2,"92221402":3,"92248362":3,"93039339":1},"sections":{"main":["23434538","14558127","14558127","14558127","73642296","73642296","42141493","42141493","42141493","35595518","35595518","47960073","47960073","47960073","92248362","92248362","92248362","28642461","28642461","55031170","55031170","55031170","91025875","91025875","35261759","35261759","25311006","92221402","92221402","92221402","80181649","80181649","80181649","24299458","24299458","27308231","53792930","30271097","30271097","30271097"],"extra":["87746184","76666602","78397661","2061963","49456901","34876719","27420823","67515699","67515699","54919528","40673853","61374414","90303227","90448279","93039339"],"side":[]}},{"filename":"Kaiju","mostFrequentCard":"102380","cardCount":75,"cardFrequency":{"102380":3,"899287":1,"1475311":2,"8165596":1,"8264361":1,"12580477":2,"14532163":3,"23085002":1,"23434538":3,"26556950":1,"28400508":1,"33420078":2,"35261759":3,"36584821":3,"36956512":3,"38120068":3,"40139997":1,"43316238":3,"46294982":2,"53129443":3,"54693926":3,"55063751":3,"57314798":1,"62541668":1,"63767246":1,"63845230":2,"71197066":3,"72283691":3,"73082255":1,"73304257":2,"83764719":1,"84815190":1,"90448279":1,"90807199":3,"91800273":2,"93854893":1,"94259633":1,"96633955":1,"99330325":2},"sections":{"main":["63845230","63845230","33420078","33420078","23434538","23434538","23434538","36584821","36584821","36584821","899287","91800273","91800273","102380","102380","102380","36956512","36956512","36956512","55063751","55063751","55063751","46294982","46294982","71197066","71197066","71197066","43316238","43316238","43316238","90807199","90807199","90807199","73304257","73304257","53129443","53129443","53129443","12580477","12580477","83764719","38120068","38120068","38120068","1475311","1475311","35261759","35261759","35261759","99330325","99330325","54693926","54693926","54693926","14532163","14532163","14532163","72283691","72283691","72283691"],"extra":["40139997","84815190","96633955","57314798","63767246","23085002","8165596","93854893","28400508","73082255","26556950","62541668","90448279","94259633","8264361"],"side":[]}},{"filename":"Kashtira","mostFrequentCard":"24299458","cardCount":55,"cardFrequency":{"4810828":1,"4928565":1,"11765832":1,"13243124":1,"18666161":1,"21639276":1,"23434538":1,"24299458":3,"29301450":1,"31149212":3,"32807846":1,"32909498":3,"33171768":1,"33925864":1,"34447918":3,"35261759":3,"42141493":3,"48130397":2,"48626373":2,"48770333":1,"54757758":1,"60195675":1,"68304193":2,"69540484":3,"71832012":1,"73542331":2,"76666602":1,"78144171":1,"89558743":3,"90448279":1,"91800273":1,"93039339":1,"94145021":2,"94392192":1},"sections":{"main":["94145021","94145021","23434538","31149212","31149212","31149212","42141493","42141493","42141493","91800273","32909498","32909498","32909498","94392192","68304193","68304193","4928565","48770333","4810828","32807846","35261759","35261759","35261759","89558743","89558743","89558743","34447918","34447918","34447918","71832012","69540484","69540484","69540484","48130397","48130397","24299458","24299458","24299458","33925864","21639276"],"extra":["54757758","11765832","13243124","76666602","33171768","18666161","78144171","60195675","73542331","73542331","48626373","48626373","90448279","93039339","29301450"],"side":[]}},{"filename":"Kewl Tune Elfnotes","mostFrequentCard":"10045474","cardCount":75,"cardFrequency":{"4891376":1,"10045474":3,"12375297":3,"13597785":3,"14442329":1,"14558127":3,"15665977":1,"16387555":2,"16509007":2,"17209452":1,"23434538":1,"24092792":1,"24224830":1,"30983281":1,"33158448":1,"41069676":1,"42141493":3,"42302563":1,"42781164":2,"43904702":1,"44508094":1,"56651978":2,"59438930":3,"59581480":3,"64491754":3,"65681983":1,"65961304":1,"68431965":1,"70088809":3,"72270339":1,"72323266":1,"73642296":3,"78058681":2,"80845034":1,"84192580":3,"84815190":1,"85976588":1,"87188910":1,"88170262":1,"89023486":1,"89392810":2,"93125329":1,"97268402":3,"97474300":1,"99243014":1},"sections":{"main":["97268402","97268402","97268402","17209452","12375297","12375297","12375297","23434538","43904702","16509007","16509007","59438930","59438930","59438930","14558127","14558127","14558127","73642296","73642296","73642296","16387555","16387555","89392810","89392810","42141493","42141493","42141493","84192580","84192580","84192580","72323266","85976588","13597785","13597785","13597785","56651978","56651978","59581480","59581480","59581480","72270339","70088809","70088809","70088809","89023486","99243014","97474300","14442329","64491754","64491754","64491754","80845034","24224830","65681983","78058681","78058681","10045474","10045474","10045474","24092792"],"extra":["42781164","42781164","15665977","88170262","93125329","41069676","68431965","33158448","4891376","42302563","44508094","30983281","87188910","84815190","65961304"],"side":[]}},{"filename":"Kewl Tune","mostFrequentCard":"10045474","cardCount":55,"cardFrequency":{"613496":1,"821049":1,"4891376":1,"10045474":3,"14442329":2,"14558127":3,"15665977":2,"16387555":2,"16509007":2,"17209452":1,"23434538":1,"24224830":1,"32807846":1,"39576656":1,"41069676":1,"42141493":3,"42781164":2,"43904702":1,"59438930":1,"65961304":1,"70088809":3,"72323266":1,"72444406":1,"73642296":3,"78058681":2,"88170262":2,"89392810":2,"93039339":1,"93125329":1,"97268402":3,"97474300":3,"98506199":1,"99243014":1},"sections":{"main":["97268402","97268402","97268402","17209452","23434538","43904702","16509007","16509007","59438930","14558127","14558127","14558127","73642296","73642296","73642296","16387555","16387555","89392810","89392810","42141493","42141493","42141493","72323266","70088809","70088809","70088809","32807846","99243014","97474300","97474300","97474300","613496","14442329","14442329","24224830","78058681","78058681","10045474","10045474","10045474"],"extra":["42781164","42781164","39576656","15665977","15665977","88170262","88170262","93125329","41069676","98506199","4891376","821049","72444406","65961304","93039339"],"side":[]}},{"filename":"Lightsworns","mostFrequentCard":"691925","cardCount":58,"cardFrequency":{"572850":2,"691925":3,"2463794":1,"4928565":1,"5014629":2,"9839945":1,"15693423":2,"18843291":1,"23434538":1,"24224830":1,"25311006":1,"28803166":1,"29301450":1,"30100551":1,"45742626":1,"45819647":2,"46565218":1,"46640168":1,"49867899":1,"55623480":1,"56166150":2,"57232301":1,"58996430":3,"59481082":3,"60764609":2,"63542003":1,"66011101":1,"73176465":1,"73956664":2,"84192580":2,"92731385":1,"94145021":2,"94886282":3,"95503687":1,"96576187":3,"97651498":1,"98095162":1,"98567237":1,"99937011":1},"sections":{"main":["97651498","94145021","94145021","23434538","95503687","56166150","56166150","58996430","58996430","58996430","73176465","55623480","73956664","73956664","572850","572850","63542003","99937011","59481082","59481082","59481082","96576187","96576187","96576187","84192580","84192580","28803166","46565218","60764609","60764609","4928565","691925","691925","691925","94886282","94886282","94886282","25311006","98567237","57232301","24224830","15693423","15693423"],"extra":["92731385","46640168","18843291","5014629","5014629","30100551","66011101","45742626","2463794","9839945","29301450","49867899","98095162","45819647","45819647"],"side":[]}},{"filename":"Lunalights","mostFrequentCard":"8379983","cardCount":55,"cardFrequency":{"2344618":2,"8379983":3,"11317977":2,"14152693":1,"14558127":3,"23434538":1,"24094653":2,"24224830":1,"24299458":2,"24550676":2,"27204311":1,"29301450":1,"32530043":1,"35618217":2,"35763582":2,"40366667":2,"42141493":3,"47705572":1,"48444114":2,"50277355":1,"50546208":1,"54701958":2,"57103969":2,"58570206":2,"66011101":1,"81196066":3,"81439174":1,"83190280":1,"84192580":1,"85115440":1,"87209160":1,"87931906":1,"88753594":1,"96381979":1,"97165977":1},"sections":{"main":["23434538","11317977","11317977","83190280","14558127","14558127","14558127","35763582","35763582","35618217","35618217","14152693","50546208","87209160","42141493","42141493","42141493","84192580","8379983","8379983","8379983","47705572","27204311","58570206","58570206","24094653","24094653","48444114","48444114","87931906","81439174","2344618","2344618","57103969","57103969","24224830","24299458","24299458","40366667","40366667"],"extra":["81196066","81196066","81196066","97165977","88753594","24550676","24550676","54701958","54701958","96381979","85115440","66011101","32530043","50277355","29301450"],"side":[]}},{"filename":"Magikey","mostFrequentCard":"14558127","cardCount":57,"cardFrequency":{"5041348":1,"9464441":1,"11765832":1,"14558127":3,"15983048":1,"19489718":1,"22850702":1,"23434538":3,"23516703":3,"24207889":1,"24224830":2,"25311006":2,"30765615":1,"30983281":1,"35815783":3,"38814750":2,"41209827":1,"41420027":3,"46052429":1,"48130397":3,"49036338":1,"49161188":1,"50954680":1,"54757758":1,"64880894":1,"65681983":1,"69522668":1,"84815190":1,"85639257":1,"90448279":1,"90590304":1,"94145021":3,"95492061":3,"96633955":1,"96729612":1,"98234196":1,"98904974":1,"99426088":1},"sections":{"main":["85639257","98234196","49036338","94145021","94145021","94145021","23434538","23434538","23434538","38814750","38814750","30765615","14558127","14558127","14558127","95492061","95492061","95492061","15983048","19489718","96729612","25311006","25311006","99426088","35815783","35815783","35815783","46052429","48130397","48130397","48130397","24224830","24224830","65681983","23516703","23516703","23516703","24207889","41420027","41420027","41420027","98904974"],"extra":["54757758","11765832","41209827","49161188","64880894","50954680","5041348","9464441","69522668","30983281","84815190","96633955","22850702","90590304","90448279"],"side":[]}},{"filename":"Magnets Warrior","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"12450071":1,"14558127":3,"21861412":1,"23434538":1,"24224830":1,"24431911":1,"25311006":1,"27204311":1,"29301450":1,"30271097":3,"32530043":1,"33198837":1,"34989413":1,"42021064":1,"42141493":3,"43017476":2,"44839512":3,"45041488":1,"46772449":1,"47247792":1,"50277355":1,"51826619":1,"52566270":1,"63941210":1,"65514302":3,"78397661":1,"79418928":2,"84815190":1,"85914562":1,"86289475":1,"87746184":1,"87814728":3,"89693655":3,"94076521":1,"94145021":2,"94689206":1,"97661969":1,"98095162":1},"sections":{"main":["94145021","94145021","23434538","85914562","94076521","79418928","79418928","14558127","14558127","14558127","87814728","87814728","87814728","51826619","45041488","52566270","42141493","42141493","42141493","86289475","43017476","43017476","44839512","44839512","44839512","24431911","94689206","63941210","27204311","89693655","89693655","89693655","25311006","65514302","65514302","65514302","24224830","30271097","30271097","30271097"],"extra":["47247792","21861412","87746184","33198837","78397661","84815190","46772449","32530043","42021064","34989413","97661969","50277355","12450071","29301450","98095162"],"side":[]}},{"filename":"Maliss","mostFrequentCard":"2501624","cardCount":55,"cardFrequency":{"2333466":1,"2501624":3,"3723262":1,"5043010":1,"6325660":2,"6637331":1,"9763474":1,"10045474":3,"14558127":3,"20726052":1,"20938824":3,"21848500":1,"23434538":1,"24224830":1,"24842059":1,"29301450":1,"30118811":3,"30342076":1,"32061192":1,"33854624":1,"39138610":1,"40366667":3,"46947713":1,"52698008":1,"57111661":1,"59400890":1,"59859086":1,"60303245":1,"68337209":1,"69272449":1,"73082255":1,"75500286":1,"78679226":2,"79791878":2,"86066372":1,"91800273":1,"94722358":1,"95454996":1,"96676583":1,"97631303":1},"sections":{"main":["97631303","23434538","14558127","14558127","14558127","96676583","32061192","20938824","20938824","20938824","69272449","30118811","30118811","30118811","3723262","91800273","6637331","33854624","2501624","2501624","2501624","2333466","75500286","68337209","79791878","79791878","24224830","78679226","78679226","20726052","94722358","57111661","10045474","10045474","10045474","40366667","40366667","40366667","6325660","6325660"],"extra":["59400890","73082255","21848500","39138610","60303245","24842059","30342076","52698008","59859086","29301450","9763474","46947713","95454996","5043010","86066372"],"side":[]}},{"filename":"Mathmetch","mostFrequentCard":"10045474","cardCount":57,"cardFrequency":{"2347477":1,"3723262":1,"6552971":1,"7403341":1,"10045474":3,"14558127":3,"15808381":1,"16020923":2,"16360142":1,"16926971":1,"17946349":1,"23434538":1,"24224830":1,"24842059":1,"25311006":1,"27182739":1,"27204311":1,"30118811":3,"30342076":1,"36521307":3,"39138610":1,"42141493":3,"46947713":1,"52698008":1,"59054773":1,"59859086":1,"60303245":1,"61245672":1,"61668670":1,"64211118":1,"65681983":1,"71278040":3,"73642296":1,"74567889":1,"79015062":1,"84192580":1,"85692042":1,"86066372":1,"87804365":1,"88021907":1,"89558743":1,"94145021":2,"97268402":1},"sections":{"main":["97268402","94145021","94145021","2347477","23434538","15808381","14558127","14558127","14558127","73642296","30118811","30118811","30118811","27182739","16360142","16020923","16020923","17946349","36521307","36521307","36521307","42141493","42141493","42141493","84192580","3723262","71278040","71278040","71278040","27204311","79015062","25311006","6552971","89558743","59054773","24224830","65681983","10045474","10045474","10045474","87804365","7403341"],"extra":["16926971","88021907","85692042","39138610","60303245","24842059","74567889","30342076","52698008","59859086","61668670","46947713","61245672","86066372","64211118"],"side":[]}},{"filename":"Megalith","mostFrequentCard":"13048472","cardCount":67,"cardFrequency":{"8805651":1,"11398059":1,"13048472":3,"13332685":2,"17954937":1,"18176525":1,"19899073":3,"23434538":1,"24224830":1,"24299458":3,"25311006":1,"25726386":3,"29301450":1,"29876299":3,"32530043":1,"40543231":1,"41375811":1,"44293356":1,"44376395":1,"45171524":1,"49721684":1,"55397172":3,"60465049":1,"63056220":1,"63233638":1,"65741786":1,"69003792":3,"70088809":3,"72444406":1,"73898890":1,"74393852":1,"74586817":1,"78990927":3,"79606837":1,"81560239":3,"82782870":1,"90444325":2,"90448279":1,"93125329":1,"95492061":3,"98506199":1,"99628747":2},"sections":{"main":["23434538","82782870","18176525","95492061","95492061","95492061","40543231","70088809","70088809","70088809","78990927","78990927","78990927","90444325","90444325","63056220","8805651","19899073","19899073","19899073","55397172","55397172","55397172","25726386","25726386","25726386","99628747","99628747","63233638","13332685","13332685","44293356","13048472","13048472","13048472","25311006","81560239","81560239","81560239","49721684","29876299","29876299","29876299","45171524","24224830","69003792","69003792","69003792","24299458","24299458","24299458","17954937"],"extra":["79606837","93125329","98506199","74586817","72444406","60465049","11398059","74393852","41375811","32530043","90448279","73898890","44376395","65741786","29301450"],"side":[]}},{"filename":"Mekk-Knight","mostFrequentCard":"10045474","cardCount":75,"cardFrequency":{"9617996":1,"10045474":3,"14558127":3,"18144507":1,"20537097":3,"21887175":1,"23434538":3,"24224830":2,"24299458":3,"25311006":1,"27204311":1,"27705190":1,"28031913":2,"28692962":3,"29301450":1,"30741503":1,"32807846":1,"38342335":1,"39752820":2,"42141493":3,"45002991":1,"54525057":1,"55241609":2,"55838342":1,"57288708":1,"60303245":1,"62587693":1,"65741786":1,"68191756":3,"69811710":3,"72006609":1,"72228247":1,"73642296":1,"81524756":3,"87571563":1,"89320376":1,"91646304":3,"92204263":1,"93854893":1,"94145021":1,"94677445":1,"97268402":3,"98935722":1,"98978921":1,"99674361":3},"sections":{"main":["97268402","97268402","97268402","94145021","23434538","23434538","23434538","14558127","14558127","14558127","73642296","91646304","91646304","91646304","28031913","28031913","55241609","55241609","54525057","81524756","81524756","81524756","69811710","69811710","69811710","42141493","42141493","42141493","57288708","20537097","20537097","20537097","92204263","28692962","28692962","28692962","62587693","27204311","18144507","32807846","99674361","99674361","99674361","25311006","87571563","24224830","24224830","68191756","68191756","68191756","24299458","24299458","24299458","10045474","10045474","10045474","27705190","89320376","98935722","55838342"],"extra":["94677445","93854893","98978921","72228247","60303245","9617996","72006609","30741503","65741786","39752820","39752820","29301450","38342335","45002991","21887175"],"side":[]}},{"filename":"Melffy","mostFrequentCard":"4215180","cardCount":61,"cardFrequency":{"1980574":1,"4215180":3,"10966439":2,"14558127":3,"15693423":3,"18144507":1,"20003027":1,"23002292":2,"23434538":2,"24224830":1,"25311006":2,"27204311":1,"27381364":1,"29369059":1,"30439101":1,"30581601":2,"31425736":3,"31603289":1,"33907039":2,"34800281":1,"41924516":1,"42141493":3,"46057733":1,"53054164":1,"56401775":1,"57523313":1,"60303245":1,"63644830":1,"65681983":1,"66975205":1,"67098897":1,"68810435":3,"79606837":1,"81019803":1,"84815190":1,"93018428":1,"93192592":1,"93360904":1,"97317530":1,"98416533":3,"98978921":1},"sections":{"main":["68810435","68810435","68810435","31425736","31425736","31425736","4215180","4215180","4215180","10966439","10966439","23434538","23434538","97317530","1980574","93018428","57523313","56401775","20003027","34800281","98416533","98416533","98416533","14558127","14558127","14558127","42141493","42141493","42141493","27204311","18144507","25311006","25311006","33907039","33907039","93360904","66975205","63644830","24224830","65681983","29369059","15693423","15693423","15693423","23002292","23002292"],"extra":["67098897","31603289","93192592","46057733","79606837","81019803","41924516","84815190","30439101","53054164","30581601","30581601","98978921","60303245","27381364"],"side":[]}},{"filename":"Mementotlan","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"2061963":1,"4993187":1,"11321089":1,"14529511":2,"14558127":3,"17943271":2,"18165869":1,"19181420":1,"23288411":1,"23434538":1,"24224830":1,"24299458":3,"27381364":1,"27420823":1,"29111045":1,"29301450":1,"34876719":1,"42141493":3,"43338320":1,"49456901":1,"50042011":1,"50277355":1,"52918032":1,"54207171":1,"54550967":3,"55272555":1,"61374414":1,"65741786":1,"66518509":3,"69946549":1,"80722024":3,"81677154":3,"81945676":1,"91025875":1,"92248362":3,"94145021":2},"sections":{"main":["94145021","94145021","17943271","17943271","81945676","23434538","52918032","14558127","14558127","14558127","54550967","54550967","54550967","50042011","18165869","42141493","42141493","42141493","81677154","81677154","81677154","54207171","92248362","92248362","92248362","91025875","55272555","23288411","43338320","80722024","80722024","80722024","29111045","24224830","24299458","24299458","24299458","66518509","66518509","66518509"],"extra":["19181420","69946549","11321089","14529511","14529511","2061963","49456901","34876719","27420823","61374414","65741786","50277355","27381364","29301450","4993187"],"side":[]}},{"filename":"Mermail","mostFrequentCard":"12975671","cardCount":65,"cardFrequency":{"440556":1,"2295440":1,"8576764":1,"9453320":1,"9464441":1,"10045474":1,"10963799":1,"12975671":3,"13959634":1,"14558127":3,"17080584":3,"21565445":3,"22446869":3,"23434538":1,"23545031":1,"24224830":1,"33113958":1,"33467872":1,"37104630":1,"40366667":3,"42141493":2,"48882106":1,"50793215":1,"53085623":3,"58471134":2,"60517697":1,"63731062":1,"65681983":1,"69385019":1,"71978434":1,"74311226":3,"74371660":1,"78868119":1,"79130389":1,"84192580":3,"86682165":1,"88307361":1,"89558743":3,"94145021":1,"96633955":1,"99193444":3},"sections":{"main":["94145021","21565445","21565445","21565445","12975671","12975671","12975671","78868119","23434538","37104630","14558127","14558127","14558127","71978434","8576764","17080584","17080584","17080584","53085623","53085623","53085623","10963799","74311226","74311226","74311226","58471134","58471134","42141493","42141493","84192580","84192580","84192580","88307361","22446869","22446869","22446869","99193444","99193444","99193444","13959634","2295440","89558743","89558743","89558743","24224830","65681983","10045474","40366667","40366667","40366667"],"extra":["48882106","33467872","63731062","50793215","9464441","96633955","86682165","33113958","440556","74371660","9453320","60517697","69385019","23545031","79130389"],"side":[]}},{"filename":"Metaphys","mostFrequentCard":"19476824","cardCount":72,"cardFrequency":{"2857636":1,"10045474":1,"12196873":1,"14558127":2,"14821890":2,"15693423":1,"18144507":1,"18743376":2,"19476824":3,"20720928":1,"20994205":1,"23434538":2,"24224830":1,"27204311":1,"28297833":3,"30241314":2,"36898537":2,"38342335":1,"45960523":3,"47355498":1,"47710198":1,"47805931":1,"52714670":2,"53701457":1,"54199839":3,"54693926":1,"55623480":1,"61650133":3,"63504681":1,"64014615":2,"65681983":1,"65741786":1,"66719533":3,"69248256":1,"72355272":3,"72892473":1,"73628505":1,"73642296":1,"75500286":1,"78625448":1,"80280944":1,"81674782":1,"86066372":1,"90162951":1,"92998610":3,"96633955":1,"98127546":1,"98645731":1},"sections":{"main":["23434538","23434538","12196873","14558127","14558127","73642296","28297833","28297833","28297833","55623480","80280944","19476824","19476824","19476824","92998610","92998610","92998610","45960523","45960523","45960523","72355272","72355272","72355272","18743376","18743376","27204311","18144507","72892473","73628505","75500286","98645731","54693926","20994205","47355498","20720928","81674782","61650133","61650133","61650133","66719533","66719533","66719533","64014615","64014615","24224830","65681983","15693423","10045474","54199839","54199839","54199839","14821890","14821890","30241314","30241314","52714670","52714670"],"extra":["36898537","36898537","69248256","96633955","47710198","78625448","47805931","63504681","53701457","90162951","2857636","65741786","38342335","86066372","98127546"],"side":[]}},{"filename":"Mikanko","mostFrequentCard":"1984618","cardCount":61,"cardFrequency":{"1984618":3,"6327734":3,"11161666":1,"14558127":3,"18377261":1,"23434538":1,"23656668":1,"25311006":1,"29301450":1,"30271097":2,"33854624":1,"40673853":1,"40678060":1,"41927278":1,"42141493":3,"43527730":3,"44649322":1,"53174748":1,"53971455":1,"57566760":1,"57736667":1,"58996839":1,"60303245":1,"60303688":2,"70088809":3,"72444406":1,"78199891":1,"78397661":1,"79606837":1,"80044027":1,"80532587":1,"81260679":3,"84550369":3,"84815190":1,"87746184":1,"90448279":1,"93125329":1,"94145021":2,"96729612":3,"98506199":1},"sections":{"main":["94145021","94145021","23434538","11161666","14558127","14558127","14558127","18377261","6327734","6327734","6327734","58996839","60303688","60303688","42141493","42141493","42141493","33854624","70088809","70088809","70088809","81260679","81260679","81260679","84550369","84550369","84550369","96729612","96729612","96729612","1984618","1984618","1984618","25311006","41927278","57736667","80044027","43527730","43527730","43527730","40678060","44649322","30271097","30271097","78199891","53174748"],"extra":["80532587","87746184","79606837","93125329","98506199","72444406","78397661","84815190","53971455","57566760","40673853","90448279","60303245","23656668","29301450"],"side":[]}},{"filename":"Mimighoul","mostFrequentCard":"10045474","cardCount":56,"cardFrequency":{"2263869":1,"8487449":2,"9940036":1,"10045474":3,"11677278":1,"11765832":1,"12067160":1,"13204145":3,"14558127":3,"16955631":2,"18144507":1,"19369609":1,"25311006":2,"27204311":1,"27240101":1,"29301450":1,"35269904":3,"42940335":1,"43066927":2,"45951104":1,"50415441":3,"55537983":1,"56410769":1,"59293853":2,"65741786":1,"72971064":1,"80551022":1,"81522098":3,"82933935":2,"86809440":3,"93125329":1,"94016752":1,"94145021":2,"94259633":1,"98127546":1},"sections":{"main":["8487449","8487449","94145021","94145021","50415441","50415441","50415441","11677278","81522098","81522098","81522098","43066927","43066927","80551022","82933935","82933935","14558127","14558127","14558127","55537983","27204311","13204145","13204145","13204145","18144507","94016752","25311006","25311006","2263869","35269904","35269904","35269904","45951104","86809440","86809440","86809440","59293853","59293853","10045474","10045474","10045474"],"extra":["11765832","93125329","27240101","72971064","19369609","16955631","16955631","42940335","56410769","9940036","94259633","65741786","29301450","12067160","98127546"],"side":[]}},{"filename":"Monarch","mostFrequentCard":"5795980","cardCount":48,"cardFrequency":{"5795980":3,"7166709":1,"9283801":3,"9748752":1,"22842126":3,"23064604":3,"23434538":1,"24224830":1,"31596518":3,"33609262":3,"35726888":1,"42141493":3,"48716527":1,"54241725":1,"59463312":2,"63899196":3,"67584223":2,"79844764":3,"84171830":3,"84192580":3,"95457011":1,"96570609":3},"sections":{"main":["95457011","67584223","67584223","7166709","23434538","59463312","59463312","42141493","42141493","42141493","84192580","84192580","84192580","9748752","31596518","31596518","31596518","96570609","96570609","96570609","23064604","23064604","23064604","33609262","33609262","33609262","22842126","22842126","22842126","35726888","63899196","63899196","63899196","9283801","9283801","9283801","84171830","84171830","84171830","79844764","79844764","79844764","5795980","5795980","5795980","24224830","48716527","54241725"],"extra":[],"side":[]}},{"filename":"Naturia","mostFrequentCard":"3734202","cardCount":55,"cardFrequency":{"3734202":3,"7478431":1,"20618850":2,"23434538":1,"24299458":3,"25311006":2,"28373620":2,"29301450":1,"29942771":3,"30430448":2,"31562086":2,"33198837":1,"34813545":3,"35726888":1,"42141493":3,"42566602":1,"46772449":1,"52445243":1,"55990317":2,"66011101":1,"66712905":2,"67835547":2,"68957034":3,"74659582":1,"84815190":1,"92107604":1,"93039339":1,"93229151":2,"93454062":3,"94445733":1,"96633955":1,"98127546":1},"sections":{"main":["93454062","93454062","93454062","7478431","23434538","29942771","29942771","29942771","42141493","42141493","42141493","35726888","25311006","25311006","92107604","24299458","24299458","24299458","94445733","66712905","66712905","68957034","68957034","68957034","30430448","30430448","20618850","20618850","67835547","67835547","93229151","93229151","31562086","31562086","34813545","34813545","34813545","3734202","3734202","3734202"],"extra":["55990317","55990317","28373620","28373620","74659582","33198837","42566602","52445243","84815190","96633955","46772449","66011101","93039339","29301450","98127546"],"side":[]}},{"filename":"Nemleria","mostFrequentCard":"102380","cardCount":55,"cardFrequency":{"102380":3,"2857636":1,"3814632":1,"10045474":1,"14558127":1,"15693423":1,"17550376":1,"18458255":1,"21858819":1,"22812963":1,"22938501":1,"23434538":1,"25311006":1,"26556950":2,"27781371":1,"31786838":2,"33499794":1,"35480699":3,"43944080":1,"44405066":1,"44843954":2,"49238328":1,"52382379":2,"59323650":1,"62541668":2,"66547759":1,"67171933":3,"70155677":3,"70636044":1,"78144171":1,"80117527":1,"85442146":2,"90162951":3,"94145021":2,"95718355":3,"96540807":1},"sections":{"main":["94145021","94145021","70155677","70155677","70155677","23434538","14558127","22938501","96540807","102380","102380","102380","95718355","95718355","95718355","59323650","43944080","17550376","52382379","52382379","22812963","31786838","31786838","49238328","25311006","44843954","44843954","18458255","67171933","67171933","67171933","35480699","35480699","35480699","15693423","10045474","27781371","33499794","85442146","85442146"],"extra":["80117527","44405066","78144171","66547759","3814632","90162951","90162951","90162951","21858819","70636044","26556950","26556950","62541668","62541668","2857636"],"side":[]}},{"filename":"Ninja","mostFrequentCard":"14558127","cardCount":63,"cardFrequency":{"11825276":2,"13298352":2,"14558127":3,"15198996":1,"16272453":1,"19333131":1,"20065259":1,"23434538":1,"26232916":1,"27420823":1,"28642461":2,"29301450":1,"31887806":3,"32807846":1,"32939238":1,"37354507":1,"40673853":1,"42141493":3,"47960073":1,"50766506":1,"53792930":1,"54693926":3,"54919528":1,"55031170":1,"67282505":3,"67515699":1,"68038375":2,"69840739":1,"79324191":2,"80181649":1,"90303227":1,"90448279":1,"91025875":1,"92221402":2,"92248362":3,"92962242":1,"93039339":1,"94145021":2,"94670654":1,"95027497":3,"95545183":2},"sections":{"main":["94145021","94145021","31887806","31887806","31887806","23434538","67282505","67282505","67282505","15198996","14558127","14558127","14558127","94670654","95027497","95027497","95027497","20065259","42141493","42141493","42141493","47960073","92248362","92248362","92248362","28642461","28642461","55031170","91025875","92962242","32807846","16272453","54693926","54693926","54693926","92221402","92221402","32939238","26232916","79324191","79324191","80181649","95545183","95545183","53792930","50766506","68038375","68038375"],"extra":["13298352","13298352","11825276","11825276","19333131","69840739","27420823","67515699","54919528","40673853","90303227","90448279","93039339","37354507","29301450"],"side":[]}},{"filename":"Nouvelles","mostFrequentCard":"13048472","cardCount":75,"cardFrequency":{"2857636":1,"4731783":1,"10045474":1,"13048472":3,"13332685":2,"14166715":1,"14283055":3,"14558127":3,"15001940":1,"15388353":2,"17954937":1,"18176525":1,"18988396":1,"19899073":1,"22850702":1,"23434538":1,"24224830":1,"24299458":2,"26223582":1,"26435595":2,"28306253":2,"29251488":3,"29301450":1,"30243636":1,"40543231":1,"41773061":3,"42141493":3,"45171524":3,"46485778":2,"49721684":1,"52495649":1,"53618197":1,"55397172":1,"61944066":1,"65741786":1,"71818935":1,"73898890":2,"79606837":1,"80532587":1,"81560239":1,"82782870":1,"84815190":1,"87778106":1,"87955518":1,"88890658":1,"89016236":1,"92919429":3,"96729612":3,"98127546":1,"98978921":1},"sections":{"main":["46485778","46485778","23434538","92919429","92919429","92919429","14558127","14558127","14558127","29251488","29251488","29251488","82782870","18176525","42141493","42141493","42141493","40543231","26223582","18988396","53618197","89016236","15001940","52495649","30243636","88890658","28306253","28306253","19899073","55397172","13332685","13332685","96729612","96729612","96729612","13048472","13048472","13048472","41773061","41773061","41773061","15388353","15388353","81560239","49721684","87778106","14166715","61944066","45171524","45171524","45171524","14283055","14283055","14283055","24224830","24299458","24299458","17954937","10045474","87955518"],"extra":["80532587","26435595","26435595","79606837","84815190","22850702","73898890","73898890","98978921","2857636","65741786","29301450","71818935","4731783","98127546"],"side":[]}},{"filename":"Onomat","mostFrequentCard":"6595475","cardCount":55,"cardFrequency":{"4647954":1,"6595475":3,"8165596":1,"9491461":2,"14532163":1,"14558127":3,"15693423":1,"23434538":1,"23720856":1,"24224830":1,"24299458":3,"25311006":1,"26973555":1,"27204311":1,"31123642":1,"32530043":1,"32807846":1,"35886170":3,"41522092":1,"42141493":3,"55088578":2,"56840427":1,"59724555":1,"62880279":3,"63746411":1,"63767246":1,"65305468":1,"65681983":1,"66011101":1,"67517351":1,"84013237":1,"85119159":3,"86331741":1,"88917691":1,"90448279":1,"94145021":2,"95134948":1,"96004535":1},"sections":{"main":["94145021","94145021","23434538","14558127","14558127","14558127","59724555","23720856","4647954","42141493","42141493","42141493","9491461","9491461","35886170","35886170","35886170","55088578","55088578","62880279","62880279","62880279","27204311","32807846","6595475","6595475","6595475","14532163","25311006","67517351","85119159","85119159","85119159","24224830","65681983","24299458","24299458","24299458","15693423","96004535"],"extra":["65305468","26973555","41522092","84013237","56840427","63746411","66011101","32530043","86331741","31123642","88917691","63767246","8165596","90448279","95134948"],"side":[]}},{"filename":"Orcust","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"703897":1,"2857636":1,"3679218":1,"4055337":1,"4993187":1,"5318639":1,"10045474":2,"13117073":1,"14558127":3,"20508881":1,"21441617":1,"23434538":1,"24224830":1,"24299458":2,"27204311":1,"27918365":1,"29301450":1,"30741503":2,"42141493":3,"45488703":1,"48835607":2,"54143349":3,"57835716":2,"65681983":1,"65741786":1,"67115133":2,"69811710":3,"71166481":1,"74820316":1,"76145142":1,"80538047":3,"81439174":1,"84192580":1,"85289965":1,"90351981":1,"93854893":1,"93920420":1,"94145021":2},"sections":{"main":["94145021","94145021","23434538","14558127","14558127","14558127","21441617","54143349","54143349","54143349","80538047","80538047","80538047","57835716","57835716","69811710","69811710","69811710","42141493","42141493","42141493","84192580","27918365","4055337","93920420","45488703","27204311","81439174","90351981","5318639","24224830","65681983","24299458","24299458","67115133","67115133","20508881","10045474","10045474","703897"],"extra":["71166481","93854893","48835607","48835607","74820316","3679218","2857636","30741503","30741503","65741786","13117073","29301450","76145142","4993187","85289965"],"side":[]}},{"filename":"Pendulum Magician","mostFrequentCard":"14513273","cardCount":55,"cardFrequency":{"4280258":1,"13331639":1,"14105623":1,"14513273":3,"14558127":3,"15693423":3,"16306932":3,"22125101":1,"23434538":2,"24094258":1,"24224830":2,"30095833":1,"35269904":1,"41209827":1,"41620959":1,"41908872":3,"42141493":1,"43387895":1,"48654267":1,"55795155":2,"65681983":1,"69610326":3,"69840739":1,"70771599":1,"76794549":3,"76840111":1,"81439174":1,"82190203":3,"84343351":1,"84815190":1,"90590304":1,"92812851":1,"93039339":1,"94415058":1,"96227613":2},"sections":{"main":["14105623","23434538","23434538","14558127","14558127","14558127","69610326","69610326","69610326","41908872","41908872","41908872","42141493","94415058","76794549","76794549","76794549","96227613","96227613","14513273","14513273","14513273","16306932","16306932","16306932","41620959","81439174","35269904","55795155","55795155","24224830","24224830","65681983","82190203","82190203","82190203","15693423","15693423","15693423","76840111"],"extra":["41209827","43387895","13331639","70771599","84815190","48654267","84343351","90590304","69840739","30095833","93039339","24094258","22125101","92812851","4280258"],"side":[]}},{"filename":"Predaplant","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"1845204":1,"2295440":1,"5148778":1,"6560411":1,"14463695":1,"14558127":3,"17825378":1,"18595008":2,"23434538":1,"24224830":1,"27118421":1,"30271097":2,"35272499":3,"39915560":1,"41763141":1,"42141493":3,"44536921":1,"44886582":1,"44932065":2,"44994712":3,"48130397":2,"50954680":1,"54603525":1,"61677004":1,"65681983":1,"66309175":1,"66787942":1,"69946549":1,"70427670":1,"73580471":1,"74335036":1,"78397661":1,"79864860":1,"79966218":3,"82370493":1,"87746184":1,"89176044":3,"94145021":2},"sections":{"main":["94145021","94145021","70427670","44932065","44932065","44994712","44994712","44994712","79966218","79966218","79966218","23434538","14558127","14558127","14558127","61677004","35272499","35272499","35272499","18595008","18595008","42141493","42141493","42141493","17825378","1845204","2295440","74335036","89176044","89176044","89176044","44886582","14463695","48130397","48130397","24224830","65681983","30271097","30271097","44536921"],"extra":["66309175","41763141","82370493","69946549","87746184","27118421","79864860","39915560","5148778","66787942","73580471","6560411","54603525","50954680","78397661"],"side":[]}},{"filename":"PUNK","mostFrequentCard":"14558127","cardCount":56,"cardFrequency":{"2463794":1,"6609736":1,"9464441":1,"10045474":1,"11441009":1,"13258285":1,"14558127":3,"18313046":1,"19535693":3,"23434538":1,"24224830":1,"28403802":1,"28803166":1,"29301450":1,"32909498":1,"32991300":1,"42141493":3,"46640168":1,"49370016":1,"49867899":1,"50642380":1,"55920742":3,"60465049":1,"60764609":2,"65681983":1,"67723438":3,"68304193":2,"69540484":1,"70070211":1,"71818935":1,"75046994":3,"78693036":1,"79559912":1,"81914447":1,"82041999":1,"82135803":1,"84192580":1,"84815190":1,"94145021":2,"97651498":1,"98567237":1},"sections":{"main":["97651498","94145021","94145021","23434538","14558127","14558127","14558127","50642380","82041999","19535693","19535693","19535693","13258285","42141493","42141493","42141493","84192580","28803166","6609736","60764609","60764609","32909498","68304193","68304193","55920742","55920742","55920742","81914447","75046994","75046994","75046994","98567237","49370016","69540484","67723438","67723438","67723438","24224830","65681983","10045474","70070211"],"extra":["46640168","18313046","82135803","9464441","28403802","84815190","60465049","78693036","79559912","11441009","32991300","2463794","29301450","71818935","49867899"],"side":[]}},{"filename":"Purrely","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"12500059":2,"14558127":3,"20212491":3,"21347668":3,"23434538":1,"24224830":1,"24434049":2,"25311006":1,"25550531":3,"29301450":1,"29599813":3,"33909817":1,"41999284":1,"42141493":2,"48608796":1,"51822687":1,"52645235":2,"55584558":3,"56700100":3,"62592805":1,"65681983":1,"72167543":1,"79126789":2,"79933029":2,"82105704":3,"82983267":2,"83827392":2,"90448279":1,"94145021":1,"97268402":1,"98049934":1},"sections":{"main":["97268402","94145021","25550531","25550531","25550531","79933029","79933029","12500059","12500059","23434538","79126789","79126789","14558127","14558127","14558127","42141493","42141493","25311006","20212491","20212491","20212491","56700100","56700100","56700100","24224830","65681983","55584558","55584558","55584558","82105704","82105704","82105704","29599813","29599813","29599813","21347668","21347668","21347668","82983267","82983267"],"extra":["33909817","48608796","98049934","52645235","52645235","24434049","24434049","62592805","72167543","51822687","83827392","83827392","90448279","41999284","29301450"],"side":[]}},{"filename":"Radiant Typhoon","mostFrequentCard":"5318639","cardCount":55,"cardFrequency":{"5318639":3,"12496261":1,"14558127":3,"15693423":2,"16922142":3,"20508881":2,"23434538":1,"24224830":1,"24299458":3,"25940932":1,"27755794":1,"30271097":3,"30674956":1,"39341885":2,"49105782":1,"50482813":1,"53813120":1,"53927851":1,"54143349":3,"59640711":1,"65681983":1,"67115133":2,"70522875":1,"71068247":1,"72813401":1,"78397661":1,"80159717":1,"80538047":3,"84815190":1,"85315450":1,"87746184":1,"88234821":1,"90512490":1,"94103142":1,"94145021":2,"95113856":1},"sections":{"main":["94145021","94145021","23434538","59640711","14558127","14558127","14558127","54143349","54143349","54143349","27755794","80538047","80538047","80538047","50482813","16922142","16922142","16922142","85315450","53927851","5318639","5318639","5318639","24224830","65681983","24299458","24299458","24299458","25940932","67115133","67115133","94103142","20508881","20508881","30271097","30271097","30271097","15693423","15693423","53813120"],"extra":["87746184","12496261","80159717","78397661","88234821","84815190","71068247","95113856","90512490","72813401","30674956","39341885","39341885","49105782","70522875"],"side":[]}},{"filename":"RB","mostFrequentCard":"4334811","cardCount":60,"cardFrequency":{"4334811":3,"5109321":3,"6043161":1,"6821579":2,"8491308":1,"10045474":3,"13117073":1,"14558127":3,"17188206":1,"23434538":1,"24224830":1,"24299458":3,"25072579":1,"25274141":2,"25311006":1,"32216688":2,"33438265":1,"41739381":1,"42141493":3,"43450363":1,"44573911":1,"45116390":1,"52340444":1,"52782439":3,"63013339":1,"63288573":1,"75147529":1,"76136345":1,"78710386":3,"79436874":1,"79859067":1,"80071619":2,"81101309":1,"81794107":1,"87074380":1,"88875132":1,"90673288":1,"93039339":1,"94145021":2},"sections":{"main":["94145021","94145021","23434538","4334811","4334811","4334811","14558127","14558127","14558127","6043161","88875132","42141493","42141493","42141493","33438265","79436874","81794107","17188206","44573911","87074380","45116390","81101309","5109321","5109321","5109321","25311006","52782439","52782439","52782439","78710386","78710386","78710386","76136345","24224830","52340444","25274141","25274141","24299458","24299458","24299458","43450363","10045474","10045474","10045474","79859067"],"extra":["93039339","6821579","6821579","80071619","80071619","32216688","32216688","63288573","90673288","8491308","41739381","25072579","75147529","13117073","63013339"],"side":[]}},{"filename":"Red Dragon Archifiend","mostFrequentCard":"10045474","cardCount":75,"cardFrequency":{"6637331":2,"8841431":1,"9753964":1,"10045474":3,"14558127":3,"15005145":1,"15982593":1,"23434538":1,"24224830":1,"25311006":1,"25784595":3,"27204311":1,"27572350":1,"32731036":3,"33854624":1,"34090915":1,"34761841":1,"40155014":1,"41371602":3,"42141493":3,"42493140":1,"50056656":1,"59438930":2,"62991792":2,"63436931":1,"65681983":1,"66141736":1,"70088809":3,"70902743":2,"71858682":1,"72323266":3,"72656408":1,"73642296":3,"77360173":1,"77765207":3,"80666118":1,"81439174":1,"84815190":1,"87451661":1,"92907248":1,"93125329":1,"94145021":2,"96030710":1,"98173209":2,"98396890":2,"98506199":1,"98806751":1,"99585850":1},"sections":{"main":["94145021","94145021","77360173","23434538","34761841","98396890","98396890","59438930","59438930","14558127","14558127","14558127","73642296","73642296","73642296","62991792","62991792","98806751","25784595","25784595","25784595","15005145","42493140","42141493","42141493","42141493","96030710","72323266","72323266","72323266","6637331","6637331","33854624","72656408","70088809","70088809","70088809","32731036","32731036","32731036","27204311","25311006","81439174","41371602","41371602","41371602","34090915","98173209","98173209","24224830","65681983","77765207","77765207","77765207","92907248","10045474","10045474","10045474","40155014","50056656"],"extra":["66141736","93125329","98506199","70902743","70902743","80666118","87451661","8841431","9753964","84815190","27572350","99585850","63436931","71858682","15982593"],"side":[]}},{"filename":"Rescue-Ace","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"2463794":1,"2725599":1,"2772337":1,"2857636":1,"4993187":1,"6260560":1,"14558127":3,"23434538":1,"24224830":1,"26372118":1,"28803166":1,"29301450":1,"30271097":3,"32807846":1,"37495766":1,"37617348":1,"38339996":3,"40366667":3,"41443249":1,"41999284":1,"42141493":3,"46640168":1,"49867899":1,"60764609":2,"61292243":3,"62777823":1,"63899465":1,"64612053":1,"65734501":3,"71818935":1,"76666602":1,"78397661":1,"79559912":1,"87746184":1,"94145021":2,"97651498":1,"98567237":1,"99162522":1,"99984170":1},"sections":{"main":["97651498","94145021","94145021","37617348","23434538","14558127","14558127","14558127","38339996","38339996","38339996","65734501","65734501","65734501","42141493","42141493","42141493","28803166","64612053","60764609","60764609","41443249","37495766","32807846","98567237","63899465","24224830","99984170","26372118","61292243","61292243","61292243","30271097","30271097","30271097","62777823","99162522","40366667","40366667","40366667"],"extra":["46640168","87746184","76666602","78397661","79559912","6260560","2772337","41999284","2463794","2857636","29301450","71818935","49867899","4993187","2725599"],"side":[]}},{"filename":"RItual Beast","mostFrequentCard":"14558127","cardCount":56,"cardFrequency":{"6728559":1,"11556339":1,"14513016":2,"14558127":3,"19211362":1,"22501005":1,"23434538":1,"23623653":3,"24224830":1,"29301450":1,"29423048":1,"33171768":1,"40907115":1,"42141493":3,"46502744":2,"46772449":1,"48063985":2,"48130397":2,"49885567":3,"50277355":1,"54757758":1,"56655675":1,"58811192":1,"65193366":1,"67723438":3,"69718652":2,"81674782":3,"86274272":1,"86396750":1,"87118301":1,"88123329":3,"89558743":2,"89851827":1,"91800273":1,"94145021":1,"96113307":1},"sections":{"main":["94145021","87118301","23623653","23623653","23623653","23434538","14513016","14513016","19211362","40907115","14558127","14558127","14558127","86396750","49885567","49885567","49885567","88123329","88123329","88123329","46502744","46502744","65193366","42141493","42141493","42141493","91800273","6728559","89558743","89558743","81674782","81674782","81674782","22501005","48130397","48130397","67723438","67723438","67723438","24224830","11556339"],"extra":["54757758","86274272","48063985","48063985","69718652","69718652","89851827","33171768","56655675","46772449","29423048","96113307","58811192","50277355","29301450"],"side":[]}},{"filename":"Salamangreat","mostFrequentCard":"12682213","cardCount":55,"cardFrequency":{"1295111":1,"2772337":1,"9070454":2,"11962031":1,"12682213":3,"14558127":3,"14812471":3,"14934922":1,"20665527":1,"23434538":1,"24224830":1,"26889158":3,"40366667":3,"40605147":1,"41420027":1,"48815792":1,"51339637":1,"52155219":3,"52277807":1,"56003780":1,"57134592":3,"57160136":2,"57357130":1,"59859086":1,"61245672":1,"74168099":1,"74652966":1,"80794697":3,"83533296":1,"84749824":1,"87327776":1,"87871125":2,"89484053":1,"94145021":2,"94620082":1},"sections":{"main":["94145021","94145021","89484053","23434538","11962031","57357130","14558127","14558127","14558127","80794697","80794697","80794697","94620082","26889158","26889158","26889158","52277807","74652966","56003780","57160136","57160136","1295111","24224830","52155219","52155219","52155219","83533296","14934922","40366667","40366667","40366667","41420027","84749824","40605147","51339637","9070454","9070454","12682213","12682213","12682213"],"extra":["74168099","87327776","2772337","57134592","57134592","57134592","14812471","14812471","14812471","48815792","87871125","87871125","59859086","61245672","20665527"],"side":[]}},{"filename":"S-Force","mostFrequentCard":"14558127","cardCount":60,"cardFrequency":{"2857636":1,"4280258":1,"6637331":1,"8264361":1,"9839945":1,"12580477":1,"14558127":3,"18144507":1,"20515672":3,"21368442":3,"22180094":3,"22850702":1,"23377425":3,"23434538":3,"24224830":2,"25311006":1,"27383719":1,"30748475":1,"32807846":1,"33854624":1,"35269904":2,"38342335":1,"45819647":1,"49238328":1,"53782828":2,"55049722":3,"58363151":1,"65479980":1,"65741786":1,"69761020":2,"75452921":1,"81674782":3,"82977464":1,"84211599":1,"86066372":1,"90448279":1,"91864689":2,"95974848":1,"98127546":1},"sections":{"main":["53782828","53782828","23434538","23434538","23434538","22180094","22180094","22180094","14558127","14558127","14558127","95974848","91864689","91864689","21368442","21368442","21368442","65479980","58363151","27383719","6637331","33854624","12580477","18144507","32807846","49238328","25311006","84211599","35269904","35269904","23377425","23377425","23377425","81674782","81674782","81674782","24224830","24224830","69761020","69761020","82977464","55049722","55049722","55049722","30748475"],"extra":["22850702","90448279","20515672","20515672","20515672","75452921","2857636","65741786","9839945","8264361","38342335","45819647","4280258","86066372","98127546"],"side":[]}},{"filename":"Shaddoll","mostFrequentCard":"14558127","cardCount":57,"cardFrequency":{"572850":2,"1498449":2,"3717252":1,"4939890":1,"6417578":2,"8852158":1,"14558127":3,"20366274":2,"21011044":1,"23434538":1,"23912837":1,"24224830":1,"28985331":3,"30271097":2,"30328508":3,"32467459":3,"34950192":3,"37961969":1,"42141493":3,"44394295":1,"50907446":2,"51023024":1,"61345801":2,"73642296":1,"74822425":1,"77723643":1,"78397661":1,"81196066":1,"81439174":1,"87746184":1,"94145021":2,"94977269":2,"95072744":2,"97051536":1,"97518132":1},"sections":{"main":["94145021","94145021","23434538","4939890","14558127","14558127","14558127","73642296","51023024","37961969","28985331","28985331","28985331","77723643","30328508","30328508","30328508","97518132","572850","572850","42141493","42141493","42141493","3717252","1498449","1498449","95072744","95072744","44394295","81439174","61345801","61345801","34950192","34950192","34950192","6417578","6417578","24224830","30271097","30271097","23912837","21011044"],"extra":["97051536","94977269","94977269","50907446","50907446","81196066","8852158","20366274","20366274","87746184","74822425","32467459","32467459","32467459","78397661"],"side":[]}},{"filename":"Shark","mostFrequentCard":"7150545","cardCount":55,"cardFrequency":{"440556":1,"613013":1,"1269512":1,"7150545":3,"7477101":3,"7628844":1,"10963799":1,"14558127":3,"20145685":1,"23153227":3,"23434538":1,"24224830":1,"32278723":1,"33113958":1,"34876719":1,"39733924":1,"40366667":3,"42141493":2,"43138260":1,"48739166":1,"55697723":3,"57420265":1,"61496006":3,"65676461":1,"65681983":1,"67557908":1,"67630394":1,"73046708":1,"80534031":1,"81096431":1,"82184400":1,"84192580":2,"90315086":1,"94380860":1,"94942656":2,"96004535":1,"98881700":1,"99469936":1},"sections":{"main":["23434538","14558127","14558127","14558127","10963799","43138260","7150545","7150545","7150545","57420265","42141493","42141493","84192580","84192580","81096431","90315086","55697723","55697723","55697723","613013","61496006","61496006","61496006","98881700","73046708","23153227","23153227","23153227","7477101","7477101","7477101","32278723","24224830","65681983","39733924","40366667","40366667","40366667","80534031","96004535"],"extra":["33113958","65676461","440556","48739166","94380860","67557908","94942656","94942656","1269512","34876719","20145685","7628844","99469936","67630394","82184400"],"side":[]}},{"filename":"Shining Sarcophagus","mostFrequentCard":"2501624","cardCount":56,"cardFrequency":{"2333466":2,"2463794":1,"2501624":3,"4280258":1,"5786513":2,"10045474":3,"14558127":3,"20747792":1,"22850702":1,"23434538":2,"24224830":2,"28803166":1,"29301450":1,"32270212":1,"32991300":1,"35552985":1,"39321065":1,"42141493":3,"45819647":1,"46640168":1,"49867899":1,"60764609":2,"65726770":1,"65741786":1,"71818935":1,"78679226":3,"79559912":1,"79791878":3,"82135803":1,"86066372":1,"92110878":3,"93039339":1,"93860227":1,"94145021":3,"00342673":1},"sections":{"main":["94145021","94145021","94145021","20747792","23434538","23434538","14558127","14558127","14558127","92110878","92110878","92110878","65726770","39321065","42141493","42141493","42141493","28803166","60764609","60764609","2501624","2501624","2501624","00342673","2333466","2333466","32270212","79791878","79791878","79791878","24224830","24224830","78679226","78679226","78679226","5786513","5786513","35552985","10045474","10045474","10045474"],"extra":["46640168","93860227","82135803","22850702","79559912","93039339","32991300","2463794","65741786","29301450","71818935","49867899","45819647","4280258","86066372"],"side":[]}},{"filename":"Shiranui","mostFrequentCard":"2364438","cardCount":75,"cardFrequency":{"2364438":3,"2645637":1,"4064256":3,"4333086":2,"5133471":1,"5560911":2,"8198620":1,"11110587":3,"14558127":3,"18144507":1,"21887175":1,"23434538":3,"24224830":2,"27548199":1,"36016907":1,"36630403":2,"37129797":1,"39185163":2,"41562624":1,"41729254":3,"41999284":1,"48130397":2,"49959355":3,"50091196":1,"50588353":1,"52467217":2,"54757758":1,"55623480":1,"58577036":3,"59843383":1,"65741786":1,"66570171":2,"66870733":1,"68431965":1,"72700231":1,"79783880":1,"83283063":1,"84211599":1,"84815190":1,"86541496":2,"92826944":3,"92964816":2,"94801854":3,"99423156":2},"sections":{"main":["41729254","41729254","41729254","92964816","92964816","72700231","23434538","23434538","23434538","36630403","36630403","49959355","49959355","49959355","14558127","14558127","14558127","79783880","92826944","92826944","92826944","99423156","99423156","55623480","94801854","94801854","94801854","52467217","52467217","66570171","66570171","41562624","5560911","5560911","36016907","39185163","39185163","18144507","58577036","58577036","58577036","5133471","86541496","86541496","11110587","11110587","11110587","2364438","2364438","2364438","84211599","4064256","4064256","4064256","48130397","48130397","24224830","24224830","4333086","4333086"],"extra":["54757758","8198620","50091196","68431965","83283063","27548199","59843383","84815190","41999284","50588353","37129797","66870733","65741786","21887175","2645637"],"side":[]}},{"filename":"Six Samurai","mostFrequentCard":"10045474","cardCount":55,"cardFrequency":{"2511717":2,"10045474":3,"10204849":1,"14558127":3,"16968936":3,"23434538":1,"24224830":1,"25862681":1,"27178262":2,"27548199":1,"27821104":1,"27970830":3,"28273805":2,"29301450":1,"29981921":1,"32807846":1,"33872334":1,"34235530":2,"42209438":1,"44686185":1,"45986603":1,"47436247":2,"49721904":3,"54031490":3,"59934749":1,"65685470":1,"66011101":1,"70634245":1,"71207871":1,"74752631":2,"74997493":1,"80570228":3,"83039729":1,"84815190":1,"86066372":1},"sections":{"main":["71207871","23434538","16968936","16968936","16968936","65685470","2511717","2511717","14558127","14558127","14558127","44686185","80570228","80570228","80570228","49721904","49721904","49721904","83039729","32807846","54031490","54031490","54031490","33872334","45986603","10204849","27970830","27970830","27970830","47436247","47436247","27178262","27178262","27821104","24224830","28273805","28273805","10045474","10045474","10045474"],"extra":["29981921","70634245","42209438","34235530","34235530","25862681","27548199","84815190","66011101","59934749","74752631","74752631","29301450","74997493","86066372"],"side":[]}},{"filename":"Sky Striker Radiant","mostFrequentCard":"9726840","cardCount":56,"cardFrequency":{"5318639":1,"8491308":1,"9726840":3,"14558127":2,"20508881":2,"23434538":1,"24224830":1,"24299458":2,"25072579":1,"25311006":1,"26077387":3,"30271097":3,"32807846":1,"34433770":2,"35261759":1,"37351133":2,"46772449":1,"51227866":1,"52340444":1,"54143349":1,"63013339":1,"63166095":3,"63288573":2,"67115133":2,"73642296":1,"75147529":1,"76072561":3,"78397661":1,"80538047":1,"87746184":1,"90673288":1,"93039339":1,"94145021":2,"98338152":3,"98462037":1,"98829635":1},"sections":{"main":["94145021","94145021","23434538","14558127","14558127","73642296","54143349","80538047","26077387","26077387","26077387","37351133","37351133","32807846","35261759","63166095","63166095","63166095","25311006","34433770","34433770","5318639","24224830","52340444","51227866","98338152","98338152","98338152","24299458","24299458","9726840","9726840","9726840","67115133","67115133","20508881","20508881","30271097","30271097","30271097","98829635"],"extra":["87746184","78397661","46772449","93039339","76072561","76072561","76072561","63288573","63288573","90673288","8491308","25072579","75147529","98462037","63013339"],"side":[]}},{"filename":"Snake-Eyes","mostFrequentCard":"14558127","cardCount":60,"cardFrequency":{"2463794":1,"2772337":1,"4280258":1,"6637331":1,"9674034":1,"11765832":1,"14532163":2,"14558127":3,"15693423":3,"20665527":1,"23434538":2,"24224830":2,"24299458":3,"25311006":2,"27260347":1,"28803166":1,"33854624":1,"45663742":1,"46396218":1,"46640168":1,"48130397":3,"48452496":1,"49867899":1,"53639887":1,"54757758":1,"59438930":2,"60764609":2,"65681983":1,"65741786":1,"66328392":1,"71818935":1,"72270339":3,"73391962":1,"79559912":1,"80845034":1,"82135803":1,"85106525":1,"89023486":1,"90241276":1,"93860227":1,"94845588":1,"97651498":1,"98567237":1,"99989863":1},"sections":{"main":["97651498","9674034","45663742","90241276","23434538","23434538","59438930","59438930","14558127","14558127","14558127","28803166","6637331","33854624","60764609","60764609","72270339","72270339","72270339","48452496","27260347","89023486","94845588","14532163","14532163","25311006","25311006","85106525","98567237","53639887","66328392","80845034","48130397","48130397","48130397","24224830","24224830","65681983","24299458","24299458","24299458","15693423","15693423","15693423","99989863"],"extra":["54757758","11765832","46396218","73391962","46640168","93860227","82135803","79559912","2772337","2463794","65741786","71818935","49867899","20665527","4280258"],"side":[]}},{"filename":"Spright","mostFrequentCard":"9126351","cardCount":55,"cardFrequency":{"1357146":1,"2311090":1,"4993187":1,"9126351":3,"9486959":1,"13533678":3,"14558127":3,"15443125":3,"23434538":1,"24224830":1,"25311006":1,"27381364":2,"29301450":1,"32453837":1,"40366667":3,"42141493":2,"42431833":1,"47759571":1,"49928686":1,"54498517":2,"59438930":1,"60303245":1,"65681983":1,"65741786":1,"68250822":1,"68353324":3,"72167543":1,"72329844":1,"73642296":1,"75922381":1,"76145933":3,"88686573":2,"90448279":1,"91800273":1,"94145021":2,"98127546":1},"sections":{"main":["94145021","94145021","9126351","9126351","9126351","1357146","23434538","88686573","88686573","68353324","68353324","68353324","76145933","76145933","76145933","2311090","13533678","13533678","13533678","49928686","75922381","59438930","14558127","14558127","14558127","73642296","42141493","42141493","91800273","25311006","24224830","65681983","42431833","15443125","15443125","15443125","68250822","40366667","40366667","40366667"],"extra":["9486959","54498517","54498517","32453837","72167543","90448279","60303245","65741786","27381364","27381364","72329844","47759571","29301450","4993187","98127546"],"side":[]}},{"filename":"Swordsoul","mostFrequentCard":"14558127","cardCount":58,"cardFrequency":{"5041348":1,"6728559":2,"10045474":1,"14532163":1,"14558127":3,"14821890":1,"19048328":1,"20001443":3,"23431858":2,"23434538":1,"24224830":1,"24299458":1,"24557335":1,"27204311":1,"32519092":2,"35261759":2,"38030232":1,"39730727":1,"42141493":2,"47710198":1,"51684157":1,"52854600":2,"54693926":1,"55273560":2,"56465981":3,"56495147":2,"60465049":1,"65124425":1,"69248256":2,"73121813":1,"77946022":1,"78917791":1,"83755611":2,"84815190":1,"87052196":3,"93490856":3,"96633955":1,"98159737":1},"sections":{"main":["98159737","23434538","14558127","14558127","14558127","24557335","55273560","55273560","20001443","20001443","20001443","56495147","56495147","42141493","42141493","52854600","52854600","93490856","93490856","93490856","23431858","23431858","87052196","87052196","87052196","27204311","6728559","6728559","35261759","35261759","65124425","54693926","14532163","56465981","56465981","56465981","77946022","39730727","24224830","24299458","51684157","10045474","14821890"],"extra":["83755611","83755611","5041348","69248256","69248256","73121813","19048328","84815190","96633955","47710198","60465049","32519092","32519092","78917791","38030232"],"side":[]}},{"filename":"Tearlaments","mostFrequentCard":"6767771","cardCount":55,"cardFrequency":{"572850":2,"1329620":1,"1845204":1,"4928565":1,"5560911":2,"6767771":3,"7394770":3,"7436169":2,"11765832":1,"14558127":3,"23151193":1,"23434538":1,"24299458":2,"28226490":1,"29301450":1,"31259606":1,"33878367":1,"35726888":1,"37961969":1,"40366667":3,"45662855":1,"46772449":1,"48130397":2,"49299410":1,"50793215":1,"51831560":1,"54757758":1,"60362066":1,"66011101":1,"69946549":1,"70369116":1,"71616908":1,"73956664":3,"74920585":1,"78693036":1,"79130389":1,"84330567":1,"87758525":1,"92731385":1,"99937011":1},"sections":{"main":["23434538","14558127","14558127","14558127","37961969","51831560","45662855","31259606","73956664","73956664","73956664","572850","572850","99937011","5560911","5560911","4928565","23151193","1845204","35726888","33878367","7394770","7394770","7394770","6767771","6767771","6767771","48130397","48130397","24299458","24299458","60362066","7436169","7436169","49299410","40366667","40366667","40366667","74920585","1329620"],"extra":["54757758","92731385","11765832","71616908","69946549","84330567","87758525","28226490","50793215","78693036","46772449","66011101","79130389","70369116","29301450"],"side":[]}},{"filename":"Tenpai","mostFrequentCard":"10045474","cardCount":55,"cardFrequency":{"2772337":1,"10045474":3,"11590299":1,"14532163":1,"14558127":3,"18144507":1,"18969888":1,"19613556":1,"23434538":1,"23657016":2,"24224830":1,"24299458":2,"24361622":1,"29301450":1,"30336082":1,"33854624":1,"39402797":1,"39931513":3,"40366667":3,"42141493":3,"48815792":1,"63533837":1,"64697431":1,"65326118":1,"65681983":1,"66730191":1,"70088809":3,"72444406":1,"73539069":1,"80696379":1,"82570174":2,"84192580":3,"87837090":1,"91800273":1,"91810826":1,"93125329":1,"94145021":1,"98506199":1},"sections":{"main":["94145021","23434538","14558127","14558127","14558127","11590299","65326118","23657016","23657016","39931513","39931513","39931513","91810826","42141493","42141493","42141493","84192580","84192580","84192580","91800273","33854624","70088809","70088809","70088809","18144507","19613556","64697431","14532163","30336082","24224830","65681983","24299458","24299458","66730191","10045474","10045474","10045474","40366667","40366667","40366667"],"extra":["93125329","80696379","63533837","98506199","87837090","82570174","82570174","72444406","39402797","18969888","2772337","73539069","24361622","48815792","29301450"],"side":[]}},{"filename":"Trapticks","mostFrequentCard":"10045474","cardCount":57,"cardFrequency":{"1688285":1,"2834264":1,"6511113":1,"10045474":3,"11510448":1,"12801833":1,"14558127":3,"24224830":1,"29301450":1,"29616929":1,"31548215":2,"32909498":2,"41375811":1,"42091632":3,"45803070":1,"46060017":3,"48183890":2,"48905153":1,"49027020":1,"58053438":3,"59071624":1,"69599136":2,"73639099":2,"74393852":1,"74577599":2,"75416738":2,"78872731":3,"82738277":3,"90448279":1,"91812341":3,"93039339":1,"97045737":3},"sections":{"main":["14558127","14558127","14558127","91812341","91812341","91812341","45803070","78872731","78872731","78872731","82738277","82738277","82738277","75416738","75416738","49027020","32909498","32909498","12801833","46060017","46060017","46060017","24224830","29616929","69599136","69599136","10045474","10045474","10045474","31548215","31548215","74577599","74577599","97045737","97045737","97045737","58053438","58053438","58053438","42091632","42091632","42091632"],"extra":["6511113","74393852","48905153","11510448","41375811","59071624","1688285","90448279","93039339","73639099","73639099","2834264","29301450","48183890","48183890"],"side":[]}},{"filename":"Trickstar","mostFrequentCard":"10045474","cardCount":60,"cardFrequency":{"298846":2,"1410324":2,"3792766":1,"9952083":2,"10045474":3,"12580477":1,"14365823":1,"18144507":1,"19613556":1,"21076084":1,"23434538":2,"24224830":2,"25311006":1,"32448765":1,"35199656":3,"35269904":1,"35371948":3,"37405032":1,"37683441":2,"37812118":3,"41302052":1,"51011872":1,"51208046":1,"61283655":2,"62481203":3,"63492244":1,"64804137":1,"77307161":2,"85562745":3,"86750474":1,"86825114":1,"88693151":2,"91272072":1,"91706817":1,"94626871":1,"98169343":2,"98700941":1,"99176254":1},"sections":{"main":["86825114","23434538","23434538","98700941","1410324","1410324","35199656","35199656","35199656","61283655","61283655","37405032","98169343","98169343","12580477","18144507","19613556","37812118","37812118","37812118","88693151","88693151","62481203","62481203","62481203","25311006","91706817","35269904","35371948","35371948","35371948","63492244","51208046","85562745","85562745","85562745","9952083","9952083","24224830","24224830","21076084","10045474","10045474","10045474","99176254"],"extra":["64804137","91272072","32448765","77307161","77307161","298846","298846","94626871","51011872","14365823","37683441","37683441","86750474","3792766","41302052"],"side":[]}},{"filename":"True Draco","mostFrequentCard":"1984618","cardCount":55,"cardFrequency":{"1984618":3,"9940036":1,"11765832":2,"13035077":3,"22499034":1,"24207889":1,"29301450":1,"30271097":3,"32181268":1,"35125879":1,"35261759":2,"40366667":3,"41209827":1,"48130397":3,"49430782":2,"53334471":1,"54757758":1,"58053438":3,"58984738":3,"60303688":1,"61529473":2,"66092596":2,"75425320":1,"76666602":2,"78397661":1,"80532587":2,"82732705":1,"82956214":1,"87746184":1,"90846359":1,"93039339":1,"93125329":1,"96334243":1,"98645731":1},"sections":{"main":["32181268","60303688","22499034","58984738","58984738","58984738","98645731","35261759","35261759","1984618","1984618","1984618","13035077","13035077","13035077","75425320","49430782","49430782","66092596","66092596","48130397","48130397","48130397","30271097","30271097","30271097","82956214","40366667","40366667","40366667","58053438","58053438","58053438","90846359","82732705","53334471","61529473","61529473","35125879","24207889"],"extra":["80532587","80532587","54757758","96334243","11765832","11765832","41209827","87746184","76666602","76666602","93125329","78397661","9940036","93039339","29301450"],"side":[]}},{"filename":"Vaalmonica","mostFrequentCard":"3048768","cardCount":55,"cardFrequency":{"2463794":1,"2815176":2,"3048768":3,"4582942":1,"5605529":3,"14558127":3,"14972952":1,"22850702":1,"23093373":3,"23434538":1,"24224830":1,"24299458":3,"25311006":1,"28803166":1,"29301450":1,"30432463":3,"32991300":1,"34755994":1,"38491852":1,"39210885":3,"42141493":3,"42193638":1,"49867899":1,"60764609":2,"65496951":1,"65741786":1,"71818935":1,"73642296":1,"76821171":1,"79559912":1,"82135803":1,"93860227":1,"94145021":2,"97651498":1,"98567237":1,"01340142":1},"sections":{"main":["97651498","94145021","94145021","23434538","14558127","14558127","14558127","73642296","3048768","3048768","3048768","30432463","30432463","30432463","23093373","23093373","23093373","42141493","42141493","42141493","28803166","60764609","60764609","65496951","25311006","5605529","5605529","5605529","42193638","98567237","39210885","39210885","39210885","38491852","24224830","24299458","24299458","24299458","4582942","14972952"],"extra":["93860227","82135803","22850702","79559912","76821171","2815176","2815176","01340142","32991300","34755994","2463794","65741786","29301450","71818935","49867899"],"side":[]}},{"filename":"Vanquish Soul","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"6637331":1,"8264361":1,"9091064":2,"14558127":3,"23434538":1,"24224830":1,"28168628":3,"29280200":3,"29301450":1,"29302858":2,"32807846":1,"33854624":1,"35550352":1,"38339996":3,"42141493":3,"46502744":1,"49238328":1,"54562327":1,"55285840":1,"60465049":1,"60883493":1,"64612053":1,"70088809":3,"72444406":1,"78693036":1,"81916745":1,"86066372":1,"90448279":1,"91073013":2,"91800273":1,"92895501":3,"93039339":1,"93125329":1,"93156774":3,"93332803":1,"98506199":1},"sections":{"main":["23434538","14558127","14558127","14558127","38339996","38339996","38339996","46502744","29280200","29280200","29280200","29302858","29302858","42141493","42141493","42141493","9091064","9091064","93156774","93156774","93156774","91800273","6637331","33854624","64612053","92895501","92895501","92895501","70088809","70088809","70088809","93332803","91073013","91073013","32807846","49238328","54562327","35550352","24224830","60883493"],"extra":["81916745","93125329","98506199","72444406","60465049","78693036","55285840","90448279","93039339","28168628","28168628","28168628","8264361","29301450","86066372"],"side":[]}},{"filename":"Voiceless Voice","mostFrequentCard":"13048472","cardCount":58,"cardFrequency":{"2295440":1,"2463794":1,"4731783":1,"4810828":1,"4993187":1,"10774240":2,"13048472":3,"14558127":3,"23434538":1,"24224830":1,"25801745":3,"26866984":1,"28803166":1,"29301450":1,"32991300":1,"33854624":1,"35480699":2,"35552985":1,"38495396":1,"38814750":1,"39114494":1,"42141493":3,"46640168":1,"49036338":1,"49867899":1,"51296484":2,"52472775":2,"58071334":1,"60764609":2,"65741786":1,"71818935":1,"73642296":1,"74997493":1,"79606837":1,"82135803":1,"86310763":1,"88284599":1,"92919429":3,"93860227":1,"97651498":1,"98477480":2,"98567237":1},"sections":{"main":["49036338","97651498","25801745","25801745","25801745","23434538","38814750","92919429","92919429","92919429","14558127","14558127","14558127","73642296","42141493","42141493","42141493","28803166","33854624","51296484","51296484","60764609","60764609","88284599","26866984","4810828","10774240","10774240","2295440","13048472","13048472","13048472","98567237","52472775","52472775","39114494","98477480","98477480","35480699","35480699","24224830","35552985","86310763"],"extra":["46640168","93860227","58071334","82135803","79606837","38495396","32991300","2463794","65741786","29301450","71818935","49867899","4993187","74997493","4731783"],"side":[]}},{"filename":"Wind-Up","mostFrequentCard":"14558127","cardCount":55,"cardFrequency":{"581014":1,"1735088":1,"3233859":2,"4280258":1,"10604644":1,"11132674":1,"14558127":3,"23434538":3,"24224830":2,"25484449":3,"26973555":1,"30227494":1,"30915572":3,"32530043":1,"33198837":1,"38342335":1,"42874792":1,"43694650":3,"45894482":2,"48285768":1,"53932291":1,"56410040":3,"57962537":3,"59297550":3,"65305468":1,"65681983":1,"81122844":3,"81275020":1,"85914562":1,"86066372":1,"90448279":1,"99745551":3},"sections":{"main":["23434538","23434538","23434538","85914562","45894482","45894482","30915572","30915572","30915572","56410040","56410040","56410040","57962537","57962537","57962537","42874792","53932291","81275020","14558127","14558127","14558127","30227494","3233859","3233859","43694650","43694650","43694650","99745551","99745551","99745551","59297550","59297550","59297550","25484449","25484449","25484449","10604644","24224830","24224830","65681983"],"extra":["33198837","65305468","26973555","81122844","81122844","81122844","581014","32530043","48285768","11132674","90448279","1735088","38342335","4280258","86066372"],"side":[]}},{"filename":"Yubel","mostFrequentCard":"14558127","cardCount":65,"cardFrequency":{"4779091":1,"4993187":1,"11765832":1,"14558127":3,"18144507":1,"23434538":1,"24215921":2,"24224830":1,"24269961":1,"24299458":1,"25311006":1,"26913989":1,"27204311":1,"29301450":1,"30271097":2,"31764700":1,"40366667":2,"41165831":1,"42141493":1,"47172959":1,"48130397":3,"53417695":1,"54757758":1,"62318994":3,"65261141":2,"65681983":1,"67680512":1,"70636044":1,"73642296":2,"78371393":1,"80312545":2,"80453041":3,"81034083":3,"81439174":1,"86066372":1,"87532344":1,"87746184":2,"90829280":3,"92650749":1,"93729896":3,"94145021":2,"96334243":1,"97268402":1},"sections":{"main":["97268402","94145021","94145021","24215921","24215921","62318994","62318994","62318994","23434538","81034083","81034083","81034083","14558127","14558127","14558127","73642296","73642296","42141493","41165831","26913989","78371393","90829280","90829280","90829280","4779091","27204311","31764700","18144507","25311006","81439174","93729896","93729896","93729896","80312545","80312545","92650749","65261141","65261141","48130397","48130397","48130397","24224830","65681983","24299458","30271097","30271097","53417695","40366667","40366667","87532344"],"extra":["54757758","96334243","11765832","87746184","87746184","80453041","80453041","80453041","47172959","70636044","24269961","67680512","29301450","4993187","86066372"],"side":[]}},{"filename":"Yummy","mostFrequentCard":"10045474","cardCount":55,"cardFrequency":{"2463794":1,"4215180":1,"10045474":3,"10966439":2,"14558127":3,"23434538":1,"24224830":1,"28803166":1,"29301450":1,"29369059":1,"30581601":2,"31425736":1,"31603289":1,"42141493":3,"46640168":1,"49867899":1,"52340444":1,"60764609":2,"63013339":1,"63288573":1,"65681983":1,"66975205":1,"67098897":1,"68810435":3,"71818935":1,"73642296":3,"79559912":1,"82135803":1,"93192592":1,"93860227":1,"94145021":2,"97045737":3,"97268402":3,"97651498":1,"98567237":3},"sections":{"main":["97651498","97268402","97268402","97268402","94145021","94145021","68810435","68810435","68810435","31425736","4215180","10966439","10966439","23434538","14558127","14558127","14558127","73642296","73642296","73642296","42141493","42141493","42141493","28803166","60764609","60764609","98567237","98567237","98567237","66975205","24224830","52340444","65681983","29369059","10045474","10045474","10045474","97045737","97045737","97045737"],"extra":["46640168","93860227","82135803","67098897","31603289","93192592","79559912","30581601","30581601","63288573","2463794","29301450","63013339","71818935","49867899"],"side":[]}}],

    _initMetaJulio2026: function () {
        const folderName = 'Julio 2026';
        const decks = this._metaJulio2026Decks;
        if (!decks || !decks.length) return;
        let data = {};
        try {
            const saved = localStorage.getItem('yugioh_meta_decks');
            data = saved ? JSON.parse(saved) : {};
        } catch (_) { data = {}; }
        if (!data.decks) data.decks = {};
        if (!data.decks[folderName]) data.decks[folderName] = [];
        decks.forEach(deckInfo => {
            const list = data.decks[folderName];
            const idx  = list.findIndex(d => d.filename === deckInfo.filename);
            if (idx >= 0) list[idx] = deckInfo; else list.push(deckInfo);
        });
        try { localStorage.setItem('yugioh_meta_decks', JSON.stringify(data)); } catch (_) {}
        if (window.Estadisticas && typeof Estadisticas.loadMetaData === 'function') {
            Estadisticas.loadMetaData();
        }
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
        if (!localStorage.getItem(this._FLAGS.metaJulio2026)) {
            this._initMetaJulio2026();
            localStorage.setItem(this._FLAGS.metaJulio2026, '1');
        }

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
window.DefaultData = DefaultData;

window.addEventListener('load', async () => {
    await DefaultData.init();
    DefaultData._patchConfig();
});