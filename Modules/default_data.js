/* default_data.js — Decks de ejemplo precargados al primer inicio
   Requiere: mideck.js (Deck) cargado antes.
   No toca ningún módulo fuente — parchea Config desde afuera via window.load.
*/

const DefaultData = {

    // ── YDK raw strings ─────────────────────────────────────────────────────
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
                const res  = await fetch(
                    `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${batch.join(',')}`
                );
                const json = await res.json();
                (json.data || []).forEach(c => { map[String(c.id)] = c; });
            } catch (e) {
                console.warn('[DefaultData] fetch error:', e);
            }
        }
        return map;
    },

    _buildCardsObj: function (sections, cardMap) {
        const cards = {};
        ['main', 'extra', 'side'].forEach(loc => {
            const counts = {};
            sections[loc].forEach(id => { counts[id] = (counts[id] || 0) + 1; });
            Object.entries(counts).forEach(([id, qty]) => {
                const card = cardMap[id];
                if (!card) return;
                cards[id] = {
                    data: card,
                    qty,
                    location: loc,
                    roles:        [],
                    specialties:  [],
                    nomenclature: []
                };
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

        if (!Object.keys(cards).length) {
            console.warn(`[DefaultData] Sin cartas para "${name}"`);
            return;
        }

        localStorage.setItem(key, JSON.stringify({
            cards,
            notes:   '',
            savedAt: Date.now()
        }));
        console.log(`[DefaultData] ✅ "${name}" inyectado`);
    },

    // ── Core ─────────────────────────────────────────────────────────────────
    init: async function () {
        if (localStorage.getItem('dd_default_decks_loaded')) return;

        console.log('[DefaultData] Cargando decks de ejemplo...');
        for (const [name, ydk] of Object.entries(this._ydks)) {
            await this._injectDeck(name, ydk);
        }
        localStorage.setItem('dd_default_decks_loaded', '1');
        console.log('[DefaultData] Decks listos.');

        if (window.Engines) Engines._renderSidebar();
    },

    // ── Parche de Config (sin tocar formacion.js) ────────────────────────────
    _patchConfig: function () {
        if (!window.Config) return;

        // resetToDefault limpia TODO el localStorage → flag desaparece → re-init
        const origReset = Config.resetToDefault.bind(Config);
        Config.resetToDefault = async function () {
            origReset();
            await DefaultData.init();
            if (window.Engines) Engines._renderSidebar();
        };

        // borrarSeleccion: delegamos directamente, la flag NO se toca
        // → los deck_* se eliminan pero init() no re-inyecta en el próximo reload
        const origBorrar = Config.borrarSeleccion.bind(Config);
        Config.borrarSeleccion = function () { origBorrar(); };

        console.log('[DefaultData] Config parchado.');
    }
};

window.addEventListener('load', async () => {
    await DefaultData.init();
    DefaultData._patchConfig();
});