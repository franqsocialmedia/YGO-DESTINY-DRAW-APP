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

    // ── Default Notes ────────────────────────────────────────────────────────
    _defaultNotes: [{"title": "TEMA 6: FUNCIONES DE LAS CARTAS (ROLES)", "content": "================================================================\n  TEMA 6: FUNCIONES DE LAS CARTAS (ROLES)\n  Nivel: Novato → Casual\n================================================================\n\nUna carta no vale por sus estadísticas ni por su rareza — vale por lo que\nhace dentro de tu deck. Aprender a identificar la función de cada carta\nes lo que distingue a alguien que \"tiene cartas\" de alguien que \"juega\".\n\n----------------------------------------------------------------\n  CARTAS ENGINE (LAS QUE ARMAN TU COMBO)\n----------------------------------------------------------------\n\nSTARTER (Arrancadora)\n  La carta que inicia tu combo desde la mano sin necesitar otra carta previa.\n  Es la pieza más valiosa del engine. Perder una Starter a una Handtrap es\n  el golpe más duro que te pueden dar al inicio del turno.\n  Ej: Una carta que busca otra al ser invocada normalmente.\n\nEXTENDER (Extendedora)\n  Carta que continúa o amplía tu combo después de que ya está en marcha.\n  No puede iniciar la línea sola, pero sin ella el combo no termina bien.\n  Es la respuesta a las interrupciones: si te niegan el starter y tienes\n  un extender que puede funcionar independiente, puedes seguir.\n  Ej: Un monstruo que puede invocarse especialmente si tienes otro en campo.\n\nSEARCHER (Buscadora)\n  Busca cartas específicas del deck y las lleva a la mano. No invoca\n  directamente, pero garantiza que tengas la pieza que necesitas.\n  Los mejores buscadores buscan al activar su efecto, no al ser destruidos.\n  Ej: Una magia que agrega 1 carta de un nombre específico a la mano.\n\nBRIDGE (Puente)\n  Carta que conecta dos piezas que normalmente no interactúan.\n  No inicia ni cierra — transforma el estado del campo para habilitar\n  lo que viene después.\n\nGARNET / BRICK (Ladrillo)\n  Carta que necesitas en el deck para que otro efecto la busque, pero que\n  en mano no sirve de nada (o sirve muy poco). Tenerla en la mano inicial\n  \"ladrilla\" la mano.\n  Regla general: no más de 2 Garnets en un deck. Si hay más, la consistencia\n  del deck cae drásticamente.\n\n----------------------------------------------------------------\n  CARTAS DEFENSIVAS (LAS QUE INTERRUMPEN)\n----------------------------------------------------------------\n\nHANDTRAP (Trampa de Mano)\n  Monstruo que activa su efecto desde la mano en respuesta a algo del oponente.\n  La diferencia clave: no necesita estar en campo para funcionar.\n  Son la interrupción estándar del formato moderno.\n  Ej: Ash Blossom, Impermanence, Nibiru.\n\nBOARDBREAKER (Rompe-Campo)\n  Carta diseñada para destruir, regresar o neutralizar el campo ya construido\n  del oponente. Se usan principalmente cuando vas segundo.\n  Ej: Raigeki, Dark Ruler No More, Evenly Matched.\n\nANTI-HANDTRAP (Anti-Trampa de Mano)\n  Cartas que protegen tu combo de las Handtraps del oponente.\n  \"Crossout Designator\" y \"Called by the Grave\" son los ejemplos más claros.\n  En decks combo, son tan importantes como el combo mismo.\n\n----------------------------------------------------------------\n  CARTAS DE FINALIZACIÓN (LO QUE GANA EL DUELO)\n----------------------------------------------------------------\n\nBOSS MONSTER (Monstruo Jefe)\n  La amenaza final del combo. Es el monstruo que el oponente necesita resolver\n  para sobrevivir — y si tiene buenas protecciones, hacerlo es muy difícil.\n  Un buen Boss Monster niega, destruye, es indestructible o tiene alta ATK.\n\nENDBOARD (Campo Final)\n  No es una carta — es el estado completo de tu campo cuando terminas tu turno.\n  Un endboard fuerte = varios Boss Monsters con diferentes tipos de negación.\n  El objetivo de cualquier combo es llegar al mejor endboard posible con las\n  cartas que tenías en la mano inicial.\n\n----------------------------------------------------------------\n  LAS 4 FUNCIONES UNIVERSALES\n----------------------------------------------------------------\n\nMás allá de los nombres específicos, toda carta en el juego hace una de estas:\n\n  • MOTOR: te ayuda a generar recursos, buscar o invocar más cartas.\n  • INTERACCIÓN: interrumpe o responde al oponente.\n  • PROTECCIÓN: mantiene tu campo o tus cartas en el juego.\n  • VENTAJA DE RECURSOS: te da más cartas, monstruos o LP que el oponente.\n\nCuando no sepas dónde clasificar una carta, usa estas 4 categorías.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nEl error más frecuente del novato es evaluar una carta por su ATK o porque\n\"se ve poderosa\". La pregunta correcta es: ¿qué función cumple en mi deck?\n\nUna carta que no cumple ninguna función concreta es una carta que no debería\nestar en el deck, sin importar qué tan impresionante parezca en papel.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 7: MENTALIDAD DEL JUGADOR", "content": "================================================================\n  TEMA 7: MENTALIDAD DEL JUGADOR\n  Nivel: Novato (se aplica siempre)\n================================================================\n\nLas reglas se aprenden en semanas. Los combos se memorizan en días.\nPero la mentalidad correcta tarda meses o años en instalarse — y es\nlo que determina si realmente mejorarás como jugador.\n\n----------------------------------------------------------------\n  EL JUEGO YA NO ES PARA NIÑOS (Y ESO ES BUENO)\n----------------------------------------------------------------\n\nInvocar un monstruo, subirle el ATK y atacar era la estrategia estándar\nhace 20 años. Hoy, esa jugada en turno 1 es básicamente pasar el turno.\n\nEl juego creció porque adultos con mentalidad estratégica entraron a la\ncomunidad y elevaron el nivel. No tienes que llegar a ese nivel de golpe,\npero sí tienes que entender que el estándar de juego promedio ya no es\nel que ves en el anime.\n\n----------------------------------------------------------------\n  LAS MENTALIDADES CORRECTAS — UNA POR UNA\n----------------------------------------------------------------\n\n\"Hay cartas para todo, pero siempre habrá una mejor para mi estrategia\"\n  No todas las cartas que hacen lo mismo son iguales en tu deck.\n  El contexto importa. La mejor carta genérica puede ser peor que una\n  específica si la específica encaja exactamente con tu plan de juego.\n\n\"Muchas cartas hacen cosas parecidas, pero siempre habrá la mejor para mi deck\"\n  Cuando tengas que elegir entre dos cartas similares, no elijas por gusto.\n  Elige por qué funciona mejor con el resto del deck y contra el meta actual.\n\n\"Las cartas no se evalúan solas — se evalúan en conjunto\"\n  Una carta poderosa puede arruinar un deck si contradice su estrategia.\n  Antes de agregar una carta nueva, pregúntate: ¿qué hace en mano vacía?\n  ¿Ayuda al combo o lo interrumpe?\n\n\"Cada carta fue creada con una función específica — encuéntrala\"\n  No existe la carta inútil. Existe la carta usada en el deck equivocado.\n  Incluso las cartas que parecen malas tienen un deck donde brillan.\n  Antes de descartar una carta, pregunta: ¿para qué fue diseñada?\n\n\"Gusto vs conveniencia\"\n  Si quieres ser competitivo, la conveniencia gana siempre.\n  Puedes tener decks de gusto Y decks competitivos — no tienes que elegir uno.\n  Pero cuando sientas el deck de torneo, las decisiones deben ser funcionales.\n\n\"Los costos altos no son malos — depende del deck\"\n  Hay cartas que parecen terribles porque descartan 2 o tributan 1000 LP.\n  Pero en el deck correcto, ese costo es exactamente lo que necesitan para\n  activar otra cosa. El \"disadvantage\" de una carta es el \"advantage\" de otra.\n\n\"Practicar un deck es lo que lo hace bueno, no las cartas solas\"\n  El deck en papel es una hipótesis. El deck jugado 50 veces es la respuesta.\n  Muchos decks considerados débiles son fuertes en manos de quien los conoce\n  profundamente. La práctica revela las líneas de combo que nadie más encontró.\n\n\"El META es el conjunto de las mejores cartas descubiertas hasta ahora\"\n  No es permanente. No es definitivo. Es el mejor entendimiento colectivo\n  del momento. En 3 meses puede cambiar completamente.\n\n\"Todo deck tiene puntos débiles — incluyendo el meta\"\n  No hay deck invencible. Hay decks que los jugadores no saben cómo vencer\n  porque aún no han encontrado el counter correcto.\n  Conocer los puntos débiles del meta es la clave para vencer a los decks meta.\n\n\"Los decks no-meta pueden ganar — pero les falta consistencia\"\n  Un deck no-meta puede vencer a cualquier deck meta en una partida.\n  El problema es hacerlo consistentemente en un torneo de 7 o más rondas.\n  No es imposible, pero requiere mucho más conocimiento del meta para compensar.\n\n\"Yu-Gi-Oh! es un juego de probabilidad y estadística\"\n  Las cartas salen de un deck barajado. La mano inicial es aleatoria.\n  Entender esto te evita frustraciones cuando \"no te salió lo que necesitabas\"\n  y te ayuda a construir decks que maximicen las probabilidades de éxito.\n\n\"Consistencia vs Potencia — siempre hay que elegir\"\n  No puedes maximizar ambas al mismo tiempo. Un deck muy consistente\n  (muchas copias de las piezas clave) puede ser predecible.\n  Un deck muy potente puede ser inconsistente (mucho depends de la mano inicial).\n  Saber qué necesita tu deck es una decisión estratégica, no técnica.\n\n----------------------------------------------------------------\n  CÓMO USAR EL TIPO DE CARTA CORRECTAMENTE\n----------------------------------------------------------------\n\nAntes de activar cualquier carta, pregúntate:\n\n  ¿Es mi turno o el del oponente?\n    → Determina qué cartas puedes usar activamente.\n\n  ¿Cuántas interacciones tiene el oponente (que yo sepa)?\n    → Si tiene muchas, no gastes tu combo principal todavía.\n\n  ¿Cómo empezó el oponente?\n    → Un oponente con mano llena y campo vacío probablemente tiene Handtraps.\n\n  ¿Cuántas partidas llevamos en el match?\n    → En la 2da y 3ra partida, el Side Deck cambia todo.\n\n  ¿Voy ganando o perdiendo?\n    → Si vas perdiendo, vale asumir más riesgos. Si vas ganando, juega seguro.\n\n  ¿El oponente hizo un missplay o jugada ilegal?\n    → Detén el juego con calma. En torneo, hay un juez para eso.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nLa mentalidad es lo que convierte el conocimiento técnico en victoria real.\nPuedes saber todos los combos del meta y perder constantemente si tu toma\nde decisiones bajo presión es mala.\n\nEl mejor entrenamiento no es aprender más combos — es aprender a pensar\nmejor en los momentos donde la jugada correcta no es obvia.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 8: ANATOMÍA DE UN DECK COMPETITIVO", "content": "================================================================\n  TEMA 8: ANATOMÍA DE UN DECK COMPETITIVO\n  Nivel: Casual → Competitivo\n================================================================\n\nTodo deck competitivo puede diseccionarse en los mismos componentes.\nAprende a leer estas métricas y podrás evaluar cualquier deck que veas,\nincluso uno que nunca hayas jugado.\n\n----------------------------------------------------------------\n  LOS 6 EJES DE EVALUACIÓN\n----------------------------------------------------------------\n\n1. ENGINE — CONSISTENCIA\n   El conjunto de cartas que forma el combo principal del deck.\n   Mide qué tan probable es que el deck arme su estrategia desde la mano inicial.\n   \n   IDEAL: 85% o más de las partidas abrir con al menos 1 Starter (13+ cartas del engine).\n   \n   Un engine pequeño = deck más inconsistente pero con más espacio para non-engine.\n   Un engine grande = más consistente pero menos flexible.\n   \n   Pregunta clave: ¿Cuántas cartas del deck \"activan\" el plan de juego?\n\n2. TECHO DE PODER (THE CEILING)\n   Qué tan poderoso es el endboard si el oponente no interrumpió nada.\n   \n   IDEAL: Más de 2 negaciones en campo, con Boardbreakers disponibles y al menos\n   1 carta anti-meta o Tower que el oponente no pueda remover fácilmente.\n   \n   Un deck con techo bajo puede ser consistente pero fácil de vencer una vez\n   que el oponente aprende a manejar su campo final.\n\n3. THE FLOOR — RESILIENCIA\n   Qué pasa cuando el oponente interrumpe el combo.\n   ¿Puede el deck seguir jugando con 1 o 2 negaciones recibidas?\n   \n   IDEAL: Sobrepasar 2 negaciones corridas y aun así tener una amenaza en campo.\n   \n   El deck que no tiene Floor es conocido como \"Glass Cannon\" (Cañón de Cristal):\n   lo interrumpes y queda muerto. La solución son los Extenders.\n   \n   Pregunta clave: Si me niegan la primera pieza, ¿tengo una segunda línea?\n\n4. SLOT NON-ENGINE — EFICIENCIA\n   El espacio que le queda al deck después del engine para meter cartas \"libres\":\n   Handtraps, Boardbreakers, tech cards.\n   \n   Un engine que ocupa 30 cartas deja 10 para non-engine en un deck de 40.\n   Eso es poco. Un engine de 18 deja 22 para non-engine. Eso da mucha libertad.\n   \n   Pregunta clave: ¿Cuántas cartas fuera del engine puedes meter sin dañar la consistencia?\n\n5. GRIND GAME / FOLLOW-UP\n   Qué hace el deck en los turnos 3, 4 y 5 si el duelo se extiende.\n   ¿Puede rearmar el combo? ¿Tiene una segunda línea? ¿Recupera recursos?\n   \n   IDEAL: Tener jugadas para turno 3, 4 y 5.\n   \n   Un deck sin Grind Game pierde automáticamente si no cierra en los primeros turnos.\n   Un deck con buen Grind Game puede jugar \"lento\" y seguir siendo viable.\n\n6. FRAGILIDAD / CHOKE POINT\n   Qué tan vulnerable es el deck a una sola carta o combo del oponente.\n   Si existe 1 sola carta en el meta que apaga completamente al deck,\n   ese deck tiene un Choke Point crítico.\n   \n   Ejemplos: decks que no pueden jugar si Shifter está en campo, o decks\n   que se mueren si le niegan el primer Searcher.\n   \n   Pregunta clave: ¿Qué carta del meta me destruye completamente?\n\n----------------------------------------------------------------\n  OTRAS MÉTRICAS IMPORTANTES\n----------------------------------------------------------------\n\nLINEABILIDAD\n  Qué tan fijo es el camino del combo. Un deck muy lineal hace siempre el\n  mismo combo — predecible pero poderoso. Un deck no-lineal tiene múltiples\n  caminos — menos predecible pero más complejo de aprender.\n\nVERSATILIDAD\n  Cuántas formas distintas de jugar tiene el deck.\n  Un deck versátil puede adaptar su estrategia según la mano y el oponente.\n\nCARTAS MULTIFUNCIONALES\n  Cartas que cumplen más de un rol dentro del mismo deck.\n  Son oro: reducen el tamaño efectivo del engine sin perder funciones.\n  Ej: una carta que es Starter Y extender según el contexto.\n\nTIPO DE INTERACCIÓN\n  Qué hace tu deck cuando interrumpe: ¿destruye, destierra, regresa al deck,\n  niega activaciones, niega efectos? El tipo importa porque el oponente puede\n  tener protecciones contra uno u otro.\n\nNOVEDAD\n  Qué tan expuesta está la mecánica del deck al meta.\n  Un deck nuevo sorprende porque nadie tiene counters preparados.\n  Un deck viejo es conocido — todos ya saben cómo manejarlo.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nCuando evalúes tu deck, no preguntes solo \"¿es poderoso?\".\nPregunta: ¿es consistente? ¿qué pasa si me niegan? ¿puedo seguir jugando?\n\nUn deck con 10/10 de techo de poder pero 2/10 de Floor es un deck\nque perderá contra cualquier jugador que haya estudiado sus weaknesses.\nEl balance entre estos 6 ejes es lo que hace a un deck realmente competitivo.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 10: CÓMO ELEGIR Y CONSTRUIR TU DECK", "content": "================================================================\n  TEMA 10: CÓMO ELEGIR Y CONSTRUIR TU DECK\n  Nivel: Casual → Competitivo\n================================================================\n\nElegir mal un deck es el error más costoso en tiempo, dinero y motivación.\nConstruirlo mal es el segundo. Este tema te da el proceso completo, desde\ncero hasta tener algo funcional que puedas mejorar.\n\n----------------------------------------------------------------\n  PARTE 1: ELEGIR TU DECK\n----------------------------------------------------------------\n\nPASO 1 — Define qué quieres del deck\n  Antes de buscar cartas, responde:\n  • ¿Quiero un deck para torneos o para jugar casual?\n  • ¿Prefiero combos largos, control lento o agresión rápida?\n  • ¿Tengo presupuesto limitado?\n  • ¿Quiero un deck fácil de aprender o difícil pero poderoso?\n\nPASO 2 — Investiga antes de comprar\n  • Busca un simulador (EDOPro, Master Duel, Dueling Nexus) y prueba el deck\n    con un decklist de alguien más. Al menos 10 duelos antes de decidir.\n  • Revisa tutoriales del deck y lee los comentarios: los jugadores experimentados\n    suelen señalar las debilidades reales.\n  • Analiza si el deck fue o es meta, y cuánto tiempo le queda antes de la\n    próxima banlist o caja de expansión importante.\n\nPASO 3 — Evalúa la curva de aprendizaje\n  Decks fáciles: línea de combo fija, pocas decisiones, fácil de ejecutar.\n  Decks difíciles: múltiples líneas, muchas decisiones en cada paso,\n    la diferencia entre un buen y mal piloto es enorme.\n  \n  Un deck difícil en manos inexpertas pierde donde uno fácil ganaría.\n  Empieza con algo que puedas ejecutar correctamente antes de subir dificultad.\n\nPASO 4 — Considera la rareza y el precio\n  Un deck meta de alto nivel puede costar cientos de dólares.\n  Existen opciones budget que juegan al 70-80% del nivel original.\n  La versión budget sacrifica algo (consistencia, un endboard pieza, velocidad).\n  Evalúa si ese sacrificio es aceptable para tu objetivo.\n\n----------------------------------------------------------------\n  PARTE 2: ENTENDER LAS PIEZAS\n----------------------------------------------------------------\n\nCORE\n  Las cartas que definen al arquetipo. Sin ellas, el deck no es el deck.\n  Son fijas e irremplazables. Siempre en 3 copias si es posible.\n\nENGINE\n  El conjunto funcional que arma el combo. Puede incluir cartas de otros\n  arquetipos que sirven de complemento.\n\nNON-ENGINE\n  Todo lo que no forma parte del combo pero protege, interrumpe o cierra.\n  Handtraps, Boardbreakers, tech cards. El non-engine define tu adaptación al meta.\n\nTECH CARD\n  Una carta no-Staple específica para combatir una amenaza del meta local.\n  Puede ser 1 copia. No siempre aparece en los decklists genéricos.\n\n----------------------------------------------------------------\n  PARTE 3: CONSTRUIR DESDE CERO\n----------------------------------------------------------------\n\nPASO 1 — Define el plan de juego o endboard\n  ¿Qué quieres tener en campo al final de tu primer turno?\n  Trabaja hacia atrás: para ese endboard, ¿qué necesitas invocar?\n  Para eso, ¿qué piezas necesitas en mano?\n\nPASO 2 — Arma el engine mínimo\n  Empieza con las cartas que más directamente llevan al endboard.\n  Sin preocuparte por el tamaño del deck todavía.\n\nPASO 3 — Agrega consistencia\n  Buscadores, searchers, extenders. Todo lo que hace más probable\n  que llegues al starter en la mano inicial.\n\nPASO 4 — Mira el espacio libre\n  ¿Cuántas cartas te quedan de 40? ¿Puedes recortar el engine sin\n  sacrificar consistencia? El objetivo es maximizar el non-engine.\n\nPASO 5 — Elige el non-engine según el meta\n  ¿Contra qué decks juegas? ¿Qué Handtraps los afectan más?\n  ¿Cuántos Boardbreakers necesito? ¿El deck necesita anti-handtraps?\n\nPASO 6 — Prueba y ajusta\n  Juega 10 partidas contra lo que esperas encontrar.\n  Anota qué cartas nunca usaste y cuáles te hicieron falta.\n  Cada ajuste debe tener una razón clara.\n\n----------------------------------------------------------------\n  HIPERGEOMETRÍA BÁSICA\n----------------------------------------------------------------\n\nLa probabilidad de robar al menos 1 copia de una carta en la mano inicial\n(5 cartas de un deck de 40) según cuántas copias tienes:\n\n  1 copia  → ~11% de probabilidad\n  2 copias → ~21%\n  3 copias → ~30%\n\nSi necesitas tener la carta en mano al menos 50% de las veces,\nnecesitas al menos 8-9 copias (contando searchers que buscan esa carta).\n\nEsto explica por qué los Starters siempre van en 3, más todos sus buscadores:\npara maximizar la probabilidad de abrir con la pieza que activa todo.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nEl deck no termina en la construcción — termina en el conocimiento.\nEl mejor deck del mundo en manos de alguien que no lo conoce profundamente\npierde contra un deck mediocre en manos de quien lo domina completamente.\n\nElige un deck que puedas comprometerte a practicar durante meses,\nno el que está de moda esta semana.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 11: CÓMO OPTIMIZAR TU DECK", "content": "================================================================\n  TEMA 11: CÓMO OPTIMIZAR TU DECK\n  Nivel: Casual → Competitivo\n================================================================\n\nUn deck construido y un deck optimizado son cosas distintas.\nLa construcción es el primer borrador. La optimización es el proceso\ncontinuo de pulirlo hasta que cada carta en el deck tiene una razón clara\nde estar ahí, y cada carta fuera del deck tiene una razón clara de no estar.\n\n----------------------------------------------------------------\n  LOS 6 TIPOS DE OPTIMIZACIÓN\n----------------------------------------------------------------\n\n1. OPTIMIZACIÓN DE CONSISTENCIA\n   Objetivo: Reducir bricks, aumentar probabilidad de abrir con Starter.\n   \n   Cómo se hace:\n   • Reduce cartas Garnet al mínimo absoluto (idealmente 0-2).\n   • Agrega buscadores de los buscadores (si el deck los tiene).\n   • Recorta cartas de situacional alta que no sirven en la mano inicial.\n   • Evalúa si copias únicas de cartas que nunca llegarás a robar en turno 1\n     tienen sentido o si es mejor sacarlas.\n   \n   Señal de que la necesitas: estás brickeando frecuentemente,\n   o hay turnos donde no puedes hacer nada con la mano que te llegó.\n\n2. OPTIMIZACIÓN DE POTENCIA (COMBO)\n   Objetivo: Mejorar la línea de combo principal o agregar una nueva línea.\n   \n   Cómo se hace:\n   • Estudia si hay un extender que habilite un endboard más fuerte.\n   • Busca si una carta extra del engine mejora la consistencia del combo\n     sin gastar más espacio del justificado.\n   • Revisa si el extra deck está completamente optimizado para las líneas\n     que realmente usas (muchos decks tienen monstruos de extra que nunca invocan).\n   \n   Señal de que la necesitas: el endboard final es débil o el oponente\n   lo rompe con recursos normales sin mucho esfuerzo.\n\n3. OPTIMIZACIÓN DE TECHO DE PODER (ENDBOARD)\n   Objetivo: Hacer que el campo final sea más difícil de romper.\n   \n   Cómo se hace:\n   • Agrega protecciones al Boss Monster (escudo, inmunidad, reconstrucción).\n   • Busca un Lock más específico que limite las opciones del oponente.\n   • Considera cartas de Extra Deck con efectos continuos además del Boss.\n   \n   Señal de que la necesitas: el oponente rompe tu campo consistentemente\n   con una sola carta o con recursos básicos.\n\n4. OPTIMIZACIÓN DE DEFENSA\n   Objetivo: Mejorar la respuesta a lo que el meta te está haciendo.\n   \n   Cómo se hace:\n   • Analiza con qué cartas estás perdiendo más seguido.\n   • Agrega la Handtrap o counter específico para esa amenaza.\n   • Ajusta el ratio de Handtraps (¿cuántas son suficientes para este meta?).\n   \n   Señal de que la necesitas: estás perdiendo al mismo tipo de jugada\n   repetidamente sin poder responder.\n\n5. OPTIMIZACIÓN DE VERSATILIDAD\n   Objetivo: Tener más de 1 ruta posible para llegar al endboard.\n   \n   Cómo se hace:\n   • Busca Extenders alternativos que funcionen desde diferentes estados del campo.\n   • Agrega cartas que sirvan de \"Plan B\" si el combo principal es interrumpido.\n   • Considera Bridges que conecten piezas que normalmente no interactúan.\n   \n   Señal de que la necesitas: el deck es muy lineal y cuando le niegan\n   el primer paso, no tiene segunda opción.\n\n6. OPTIMIZACIÓN DE RESILIENCIA (FLOOR)\n   Objetivo: Que el deck pueda sobrevivir y responder con 1 o 2 negaciones recibidas.\n   \n   Cómo se hace:\n   • Agrega Extenders que puedan activarse después de una negación.\n   • Busca cartas que funcionen como \"recovery\" si el primer intento falló.\n   • Considera si el deck puede hacer un endboard mínimo digno incluso\n     con 2 interrupciones.\n   \n   Señal de que la necesitas: con 1 Handtrap encima, el deck queda muerto.\n\n----------------------------------------------------------------\n  EL PROCESO DE OPTIMIZACIÓN\n----------------------------------------------------------------\n\nPASO 1 — Identifica el problema específico\n  No optimices \"en general\". Identifica: ¿pierdo por inconsistencia,\n  porque el endboard es débil, o porque no tengo respuesta a X del meta?\n\nPASO 2 — Haz 1 cambio a la vez\n  Si cambias 3 cosas al mismo tiempo y mejoras (o empeoras), no sabes cuál\n  de los 3 cambios causó qué. Un cambio = una variable.\n\nPASO 3 — Prueba con suficientes partidas\n  Un cambio necesita al menos 10-15 partidas para evaluarse correctamente.\n  1 partida no es suficiente muestra estadística.\n\nPASO 4 — Documenta\n  Anota qué cambiaste y qué efecto tuvo. La memoria no es confiable\n  cuando estás haciendo varios ajustes a lo largo de semanas.\n\n----------------------------------------------------------------\n  SEÑALES DE UN DECK BIEN OPTIMIZADO\n----------------------------------------------------------------\n\n• Rara vez tienes cartas \"muertas\" en mano (que no sirven de nada en esa situación).\n• El non-engine se siente exactamente calibrado para el meta local.\n• Las líneas de combo son fluidas sin mucho pensamiento porque las conoces.\n• Puedes responder a la mayoría de las amenazas comunes del meta.\n• El deck se siente \"tuyo\" — no es la lista de YouTube, es la versión\n  ajustada a tu estilo y a tu entorno de juego.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nLa optimización nunca termina mientras el meta cambie.\nUn deck optimizado para el meta de hace 3 meses puede ser mediocre hoy.\nTrata tu deck como un proyecto en evolución, no como algo terminado.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 12: VELOCIDAD DE EFECTOS Y CADENAS", "content": "================================================================\n  TEMA 12: VELOCIDAD DE EFECTOS Y CADENAS\n  Nivel: Competitivo\n================================================================\n\nEl sistema de cadenas es el motor del juego a nivel técnico.\nEntenderlo completamente es lo que te permite activar tus cartas en el\nmomento correcto, responder al oponente sin cometer errores y ganar\ndisputas que un jugador sin este conocimiento perdería.\n\n----------------------------------------------------------------\n  SPELL SPEED (VELOCIDAD DE HECHIZO)\n----------------------------------------------------------------\n\nCada efecto tiene una velocidad. Una cadena solo puede subir de velocidad,\nnunca bajar. Es decir: un efecto de velocidad 2 puede responder a uno de\nvelocidad 2 o 1, pero no a uno de velocidad 3.\n\nVELOCIDAD 1\n  Efectos que NO pueden ser activados como respuesta directa a otro efecto.\n  Son la base de la cadena, nunca el eslabón reactivo.\n  • Efectos de monstruo de tipo Activación (Ignition Effects).\n  • Efectos continuos (Continuous Effects) — ni siquiera generan cadena,\n    simplemente aplican mientras la carta esté en campo.\n  • Magias normales, de campo, de equipo, de ritual.\n\nVELOCIDAD 2\n  Pueden responder a velocidad 1 y a velocidad 2.\n  • Quick Effects de monstruos (efectos rápidos que se activan en respuesta).\n  • Magias de Juego Rápido (Quick-Play Spells).\n  • Trampas normales y trampas continuas.\n  • Handtraps (se activan desde la mano como velocidad 2).\n\nVELOCIDAD 3\n  Solo puede responder a velocidad 3.\n  • Trampas Counter (Counter Traps) — Solemn Judgment, Solemn Warning, etc.\n  La única forma de responder a una Counter Trap es con otra Counter Trap.\n\n----------------------------------------------------------------\n  TIPOS DE EFECTOS\n----------------------------------------------------------------\n\nTRIGGER EFFECT (Efecto Gatillo)\n  Se activa automáticamente cuando ocurre un evento específico.\n  \n  Mandatorio: DEBE activarse. No puedes elegir no activarlo.\n    Ej: un efecto que dice \"cuando esta carta es destruida, haz X\".\n  \n  Opcional: PUEDE activarse si quieres.\n    Ej: \"cuando esta carta es enviada al cementerio, puedes...\"\n    Ojo: los opcionales pueden \"miss the timing\" (ver Tema 18).\n\nIGNITION EFFECT (Efecto Ignición)\n  Lo activas voluntariamente durante una ventana abierta en tu turno.\n  Velocidad 1. No puede activarse como respuesta.\n  Ej: \"Una vez por turno: puedes...\" en la descripción de un monstruo.\n\nQUICK EFFECT (Efecto Rápido)\n  Velocidad 2. Puede activarse en el turno del oponente o en respuesta\n  a sus efectos. Suelen indicarse con \"(Quick Effect):\" en el texto.\n\nCONTINUOUS EFFECT (Efecto Continuo)\n  Aplica automáticamente mientras la carta esté en campo.\n  No genera cadena — simplemente está activo.\n  Ej: \"Los monstruos que controla tu oponente no pueden activar efectos.\"\n\n----------------------------------------------------------------\n  CÓMO FUNCIONA UNA CADENA\n----------------------------------------------------------------\n\nUna cadena es una secuencia de efectos activados en respuesta mutua.\nSe resuelve al revés: el último activado resuelve primero (LIFO — Last In, First Out).\n\nEJEMPLO:\n  1. Jugador A activa \"Ash Blossom\" (Vel. 2) — Eslabón 1.\n  2. Jugador B responde con \"Called by the Grave\" (Vel. 2) — Eslabón 2.\n  \n  Resolución:\n  • \"Called by the Grave\" resuelve primero (eslabón 2) → destierra Ash del cementerio\n    y la niega.\n  • \"Ash Blossom\" intenta resolver (eslabón 1) → pero ya no puede porque fue negada.\n\nNota: Las cadenas siempre se construyen completamente ANTES de resolverse.\nNo puedes activar un nuevo efecto a mitad de la resolución.\n\n----------------------------------------------------------------\n  VENTANA DE INTERACCIÓN\n----------------------------------------------------------------\n\nLa ventana de interacción es el momento en que puedes activar efectos\nde velocidad 2 o superior como respuesta a lo que el oponente está haciendo.\n\nSE ABRE cuando:\n  • El jugador activo activa un efecto (hechizo, trampa, efecto de monstruo).\n  • El jugador activo realiza una invocación (especial o normal).\n  • El jugador activo realiza una acción visible (cambiar de posición, atacar).\n\nSE CIERRA cuando:\n  • Ambos jugadores pasan sin agregar nada a la cadena.\n  • Cuando la cadena resuelve y ningún jugador agrega otro efecto.\n\nPRIORIDAD EN LA VENTANA:\n  Primero los efectos mandatorios, luego los trigger opcionales del jugador\n  activo, luego los trigger opcionales del oponente, luego los efectos rápidos.\n  El jugador sin nada que activar debe ceder prioridad.\n\n----------------------------------------------------------------\n  ERROR FRECUENTE: ACTIVAR SIN VENTANA\n----------------------------------------------------------------\n\nSi el oponente no ha hecho nada que genere una ventana, no puedes\nactivar tu Handtrap. Solo puedes activarla en respuesta a algo.\n\nUn Quick Effect de monstruo tampoco puede activarse en cualquier momento —\nnecesita que haya una ventana abierta o que sea tu turno en una fase válida.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nEl 80% de las disputes en torneo vienen de no entender cuándo hay ventana.\nSi tienes dudas sobre si puedes activar algo, pregunta: ¿hubo una acción o\nefecto de mi oponente que abrió la ventana? Si la respuesta es no, espera.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 13: RULINGS DE INVOCACIONES", "content": "================================================================\n  TEMA 13: RULINGS DE INVOCACIONES\n  Nivel: Competitivo\n================================================================\n\nLas invocaciones son el corazón de cada jugada. Saber exactamente qué tipo\nde invocación estás realizando, cuándo puede ser negada, y qué consecuencias\ntiene la negación, es lo que determina si puedes o no continuar el combo.\n\n----------------------------------------------------------------\n  INVOCACIÓN INHERENTE vs INVOCACIÓN POR EFECTO\n----------------------------------------------------------------\n\nINVOCACIÓN INHERENTE\n  Es la que realizas directamente por las reglas del juego, sin necesitar\n  que un efecto de carta la active. Se coloca en el Eslabón 1 de una cadena\n  o directamente sin cadena.\n  Ej: Invocación Normal, Invocación Especial de un XYZ con 2 monstruos del mismo nivel,\n  Invocación Sincro con Tuner + no-Tuner, Invocación Link.\n\nINVOCACIÓN POR EFECTO\n  Es la que realiza un efecto de carta. La cadena ya está en marcha cuando\n  la invocación ocurre — no puedes responder a la invocación misma, solo al efecto.\n  Ej: \"Invoca especialmente esta carta desde el cementerio\" como parte de un efecto.\n\n¿Por qué importa?\n  Porque \"negar una invocación\" solo aplica a invocaciones inherentes.\n  No puedes \"negar una invocación\" que sea el resultado de resolver un efecto\n  (ya fue demasiado tarde — el efecto ya resolvió).\n\n----------------------------------------------------------------\n  NEGAR LA INVOCACIÓN Y SUS CONSECUENCIAS\n----------------------------------------------------------------\n\nCuando niegas una invocación (con Solemn Warning, por ejemplo):\n  • El monstruo va al cementerio (o fuera del juego según la regla específica).\n  • La invocación cuenta como \"negada\" — el monstruo nunca llegó al campo.\n  • Efectos que dicen \"si fue invocado exitosamente\" NO se activarán.\n  • Efectos que dicen \"si fue enviado al cementerio\" SÍ pueden activarse.\n\nSi el monstruo iba a ser usado como material, y la invocación es negada:\n  Los materiales que ya fueron enviados NO regresan. Se van al cementerio\n  normalmente. La negación aplica al monstruo invocado, no a los materiales.\n\n----------------------------------------------------------------\n  DIFERENCIAS CLAVE POR TIPO DE INVOCACIÓN\n----------------------------------------------------------------\n\nTRIBUTO vs INVOCACIÓN ESPECIAL POR TRIBUTO\n  La Invocación Normal por tributo (monstruo de nivel 5+) es una invocación\n  normal que puede ser negada igual que cualquier otra.\n  \n  La Invocación Especial por tributo (Kaijus, Nibiru, Esfera de Ra) es una\n  invocación especial que ocurre como parte del efecto — el tributo es el costo,\n  no la invocación en sí.\n\nRITUAL vs FUSIÓN\n  El Ritual requiere la Magia de Ritual como efecto que realiza la invocación.\n  La invocación no es inherente — si niegas el efecto de la magia, el Ritual no sale.\n  \n  La Fusión es similar: la magia de fusión realiza la fusión como efecto.\n  La \"Fusión de Contacto\" en cambio es inherente — no usa magia de fusión.\n\nXYZ Y MATERIALES DEBAJO\n  Los materiales de un XYZ no están en el cementerio — están \"adjuntos\".\n  Los efectos del cementerio no los afectan.\n  Cuando un XYZ es destruido, sus materiales van al cementerio solo entonces.\n\nPÉNDULO Y LA NEGACIÓN DE ESCALA\n  Si te niegan 1 de las 2 cartas Péndulo que estás colocando como escala,\n  la otra queda colocada. Pero si no tienes la segunda escala ya puesta,\n  la Invocación Péndulo no puede realizarse sin ambas escalas activas.\n\nLINK Y ZONAS\n  Si no hay zonas del Extra Deck habilitadas para invocar un monstruo del Extra,\n  la invocación no puede realizarse aunque tengas los materiales.\n  Los Links habilitan zonas — sin ellas, solo tienes la zona central del Extra.\n\nFICHAS (TOKENS)\n  Son monstruos. Tienen tipo, atributo, nivel. Pueden ser materiales de\n  Sincro, XYZ, Link, Fusión. Pero no pueden ir al Extra Deck ni al deck.\n  Cuando dejan el campo, desaparecen — no van al cementerio.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nAntes de intentar una invocación de Extra Deck, confirma:\n  1. ¿Los materiales son válidos? (niveles, tipos, atributos según la carta)\n  2. ¿Hay zona disponible?\n  3. ¿Mi combo tiene restricciones que bloqueen esta invocación?\n  \nMuchos combos se rompen porque el jugador no leyó la restricción\nde una carta anterior que ya resolvió ese mismo turno.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 14: RULINGS EN FASE DE BATALLA", "content": "================================================================\n  TEMA 14: RULINGS EN FASE DE BATALLA\n  Nivel: Competitivo\n================================================================\n\nLa Fase de Batalla tiene más reglas específicas que cualquier otra fase.\nLa mayoría de los jugadores la tratan como \"declaro ataque y listo\",\npero los rulings de esta fase determinan partidas enteras en torneo.\n\n----------------------------------------------------------------\n  LAS SUBFASES DE LA BATALLA\n----------------------------------------------------------------\n\nSTART OF BATTLE PHASE\n  El momento en que la Fase de Batalla comienza.\n  Algunos efectos se activan aquí específicamente.\n  Ambos jugadores pueden activar efectos de velocidad 2.\n\nBATTLE STEP (Declaración de Ataque)\n  Declaras qué monstruo ataca y a quién (o ataque directo).\n  El oponente puede responder con Quick Effects o trampas aquí.\n  Si el objetivo del ataque desaparece, ocurre un \"Replay\".\n\nDAMAGE STEP — LAS 5 SUBFASES DEL DAÑO\n  Son las más importantes y las que más confusión generan:\n  \n  A. Start of Damage Step\n     Se pueden activar efectos que modifican ATK/DEF o cambian posición\n     de los monstruos. También es cuando se voltean los monstruos boca abajo.\n  \n  B. Before Damage Calculation\n     El último momento para cambiar ATK/DEF antes de que se calcule el daño.\n     Aquí se activan cartas como \"Rush Recklessly\" o similares.\n     SOLO pueden activarse efectos de velocidad 2 que modifican ATK/DEF\n     o que se activan específicamente \"en el Damage Step\".\n  \n  C. Damage Calculation\n     Los puntos de vida cambian. Se compara ATK vs ATK (o ATK vs DEF).\n     Aquí ocurre el daño de batalla.\n  \n  D. After Damage Calculation\n     Efectos que se activan \"después del cálculo de daño\" van aquí.\n     También los efectos Flip de monstruos volteados.\n  \n  E. End of Damage Step\n     Los monstruos destruidos por combate son enviados al cementerio aquí.\n     Efectos de \"cuando sea destruido por combate\" se activan en este punto.\n\nEND OF BATTLE PHASE\n  Todos los efectos temporales de la Battle Phase expiran.\n  El juego pasa obligatoriamente a Main Phase 2.\n\n----------------------------------------------------------------\n  DAÑO DE BATALLA vs DAÑO DE EFECTO\n----------------------------------------------------------------\n\nDAÑO DE BATALLA\n  Ocurre cuando un monstruo ataca y los LP cambian por esa razón.\n  Puede ser negado o modificado por cartas específicas que aplican\n  durante la Battle Phase o el Damage Step.\n\nDAÑO DE EFECTO\n  Ocurre cuando un efecto de carta dice \"inflige X de daño\".\n  No puede ser negado por cartas que solo aplican a daño de batalla.\n  Funciona fuera del Damage Step, en cualquier fase.\n\nCONVERSIÓN DE DAÑO\n  Algunas cartas convierten el daño de batalla en daño de efecto,\n  o hacen que el oponente tome el daño en vez de tú.\n  El orden de prioridad cuando múltiples cartas afectan el daño\n  (de menor a mayor número, el de número más bajo se ejecuta):\n  \n  01. Infligir doble daño de batalla al oponente\n  02. Ambos jugadores toman el daño\n  03. El oponente toma el daño (de alguna forma no estándar)\n  04. El daño de batalla se trata como daño de efecto\n  05. El jugador gana LP en vez de tomar daño\n  06. El daño de batalla se convierte en 0\n  07. El daño de batalla se divide\n  08. El daño de batalla se dobla\n  09. El daño se convierte en una cantidad específica\n  10. No tomas daño bajo ciertas condiciones\n\n  Cuando dos efectos del mismo número se aplican, el daño ocurre\n  1 sola vez y tiene prioridad el jugador cuyo turno es.\n\n----------------------------------------------------------------\n  REPLAY ATTACKS\n----------------------------------------------------------------\n\nUn Replay ocurre cuando el objetivo de un ataque desaparece del campo\ndurante el Battle Step (antes de entrar al Damage Step).\n\nCuando hay un Replay:\n  • El monstruo atacante puede elegir un nuevo objetivo.\n  • O puede elegir no atacar en absoluto.\n  • Si hay nuevos monstruos que aparecieron en campo (por una invocación\n    en respuesta), pueden ser seleccionados como nuevo objetivo.\n\nEl Replay solo ocurre en el Battle Step, no durante el Damage Step.\nSi el objetivo desaparece ya dentro del Damage Step, el ataque continúa\npero no inflige daño de batalla (el objetivo ya no está).\n\n----------------------------------------------------------------\n  LO QUE SOLO PUEDES HACER EN EL DAMAGE STEP\n----------------------------------------------------------------\n\nDurante el Damage Step, hay restricciones muy específicas sobre qué puedes activar.\nEn general, SOLO puedes activar:\n  • Efectos de velocidad 2+ que modifiquen ATK/DEF.\n  • Efectos que se activan explícitamente \"durante el Damage Step\".\n  • Counter Traps (velocidad 3).\n  • Efectos mandatorios.\n\nCasi todas las Handtraps NO pueden activarse durante el Damage Step.\nCasi todas las Trampas Normales tampoco.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nEn torneo, declarar el ataque y entrar al Damage Step sin dar ventana\nal oponente es un error que puede costarte la partida.\nSiempre anuncia \"declaro ataque con X contra Y\" y espera antes de pasar\na calcular el daño. Esa pausa es la ventana de tu oponente para responder.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 15: IF vs WHEN Y TIMING AVANZADO", "content": "================================================================\n  TEMA 15: IF vs WHEN Y TIMING AVANZADO\n  Nivel: Competitivo\n================================================================\n\n\"Miss the timing\" es uno de los conceptos más mal entendidos en Yu-Gi-Oh!.\nUn jugador que no entiende la diferencia entre IF y WHEN perderá efectos\nclave en momentos críticos — o los usará fuera de tiempo sin saberlo.\n\n----------------------------------------------------------------\n  LA DIFERENCIA FUNDAMENTAL\n----------------------------------------------------------------\n\nWHEN (cuando) — Efectos OPCIONALES\n  El efecto tiene una ventana muy específica para activarse.\n  Si el evento que lo activa NO fue \"lo último que ocurrió\" antes de\n  que se abra la nueva ventana de activación, el efecto \"miss the timing\"\n  y NO puede activarse.\n  \n  \"When X: you can do Y\" = tiene posibilidad de miss the timing.\n\nIF (si) — Efectos OPCIONALES\n  Más flexible que WHEN. Solo necesita que la condición se haya cumplido\n  en algún momento del proceso, no necesariamente ser lo \"último\".\n  Menos propenso a miss the timing.\n  \n  \"If X: you can do Y\" = generalmente no pierde el timing.\n\nWHEN/IF — Efectos MANDATORIOS\n  Si dice \"must\" o es claramente mandatorio (sin \"you can\"),\n  NUNCA pierde el timing. Siempre se activa si la condición ocurre.\n\n----------------------------------------------------------------\n  QUÉ SIGNIFICA \"MISS THE TIMING\"\n----------------------------------------------------------------\n\nOcurre cuando:\n1. El efecto usa WHEN (opcional).\n2. La condición de activación ocurrió, pero NO fue el último evento antes\n   de que se abra la nueva ventana de activación.\n\nEJEMPLO:\n  La carta X dice: \"When this card is sent to the GY: you can add 1 card...\"\n  \n  Escenario A: La carta X fue enviada al cementerio como el último paso de\n  un efecto que resolvió. → El efecto PUEDE activarse. No miss the timing.\n  \n  Escenario B: La carta X fue enviada al cementerio como parte de un efecto\n  que también hizo otras cosas después (ej: \"envía X al cementerio, luego\n  invoca especialmente Y\"). El envío al cementerio NO fue lo último que pasó.\n  → El efecto PIERDE el timing. No puede activarse.\n\n----------------------------------------------------------------\n  EFECTOS MANDATORIOS NUNCA PIERDEN EL TIMING\n----------------------------------------------------------------\n\nSi una carta dice \"When X: do Y\" sin \"you can\", es mandatorio.\nLos efectos mandatorios se activan sin importar qué fue \"lo último\".\nSolo los opcionales tienen el problema del timing.\n\n----------------------------------------------------------------\n  EL TIMING DE ACTIVACIÓN GENERAL\n----------------------------------------------------------------\n\nAl final de una cadena que resuelve, se abre una nueva ventana.\nEn esa ventana, los efectos se activan en este orden de prioridad:\n\n1. Efectos mandatorios (SIEMPRE primero).\n2. Efectos Trigger opcionales del jugador activo.\n3. Efectos Trigger opcionales del jugador no activo.\n4. Efectos rápidos (Quick Effects) de ambos jugadores.\n\nSi en ese momento hay múltiples triggers opcionales del mismo jugador,\nese jugador elige el orden en que los activan.\n\n----------------------------------------------------------------\n  EFECTOS EN ZONA DE CONOCIMIENTO PRIVADO\n----------------------------------------------------------------\n\nLas cartas en la mano y el deck son \"conocimiento privado\" — el oponente\nno sabe qué hay ahí. Los efectos que se activan desde esas zonas tienen\nuna prioridad menor en ciertas reglas del OCG (aunque en TCG aplica igual).\n\nEj: Ash Blossom activa su efecto desde la mano (conocimiento privado).\n    Después de que la cadena se construye, se revela.\n\n----------------------------------------------------------------\n  \"EACH TIME\" — SIN LIMITE DE ACTIVACIONES\n----------------------------------------------------------------\n\nCuando un efecto dice \"each time X happens: do Y\", puede activarse\nmúltiples veces en el mismo turno si la condición se repite.\nNo está limitado a \"once per turn\" implícitamente.\n\nEj: \"Each time a Spell Card is activated: gain 500 LP.\"\n    Si tu oponente activa 3 hechizos en un turno, ganas 1500 LP total.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nCuando no estés seguro de si tu efecto \"miss the timing\":\n  1. ¿Dice \"when\" y \"you can\"? → Potencial miss.\n  2. ¿El evento que activa el efecto fue lo último que ocurrió? → No miss.\n  3. ¿El efecto es mandatorio? → Nunca miss.\n\nEn torneo, ante la duda, declara el efecto y deja que el juez decida.\nNo asumir que se puede activar y no asumir que no se puede — preguntar.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 16: FORMATOS Y SUS DIFERENCIAS", "content": "================================================================\n  TEMA 16: FORMATOS Y SUS DIFERENCIAS\n  Nivel: Casual → Competitivo\n================================================================\n\nYu-Gi-Oh! no es un solo juego — es varios juegos con las mismas cartas\npero reglas distintas. Saber en qué formato estás jugando cambia\ncompletamente qué cartas son válidas, qué estrategias funcionan\ny qué rulings aplican.\n\n----------------------------------------------------------------\n  FORMATO AVANZADO (TCG / OCG — ACTUAL)\n----------------------------------------------------------------\n\nEl formato estándar moderno. Se basa en la Master Rule 5 (vigente desde 2020).\nEs el que usa la mayoría de los torneos oficiales de Konami.\n\nCaracterísticas principales:\n  • Banlist actualizada ~cada 3 meses (Prohibidas, Limitadas, Semi-Limitadas).\n  • Sistema de zonas con Extra Monster Zones — solo 2 zonas del Extra\n    disponibles por defecto. Los Links habilitan más zonas.\n  • Deck: 40-60 cartas. Extra Deck: hasta 15. Side Deck: hasta 15.\n  • Match de 3 partidas (Best of 3), con Side Deck entre partidas.\n\nTCG vs OCG\n  TCG (Trading Card Game): Versión occidental (América, Europa).\n  OCG (Original Card Game): Versión oriental (Japón, Asia).\n  \n  Diferencias reales:\n  • La banlist es DIFERENTE. Cartas prohibidas en TCG pueden estar libres en OCG.\n  • Algunas cartas son exclusivas de OCG o llegaron antes allá.\n  • Reglas de timing y prioridad tienen diferencias menores en casos específicos\n    (especialmente en zonas de conocimiento privado).\n  • En OCG: efectos activados en zona privada (mano) tienen menor prioridad\n    que los de zona pública (campo) en ciertas ventanas.\n\n----------------------------------------------------------------\n  MASTER DUEL (DIGITAL OFICIAL)\n----------------------------------------------------------------\n\nVersión digital de Konami. Tiene su propia banlist, diferente a TCG y OCG.\nGratuito en PC, consolas y móvil.\n  \n  Características:\n  • Banlist propia — puede estar más o menos restrictiva que TCG.\n  • Tiendas de cartas con gemas (moneda del juego).\n  • Torneos con clasificatorias oficiales.\n  • El pool de cartas va atrasado respecto al físico.\n\n----------------------------------------------------------------\n  GOAT FORMAT\n----------------------------------------------------------------\n\nFormato nostálgico que simula el meta de 2005 (la época del \"GOAT\" o meta óptimo).\nNo se usan las Master Rules modernas — las reglas son las originales de 2005.\n\nDiferencias clave respecto al formato moderno:\n  • 6 cartas en mano máximo (igual que ahora, pero con muchas más diferencias).\n  • 1 sola zona de campo (sin Extra Monster Zones, sin Link mechanics).\n  • Los Ignition Effects del jugador activo tienen prioridad al invocar\n    (podías activar un efecto al mismo tiempo que invocabas, antes de que\n    el oponente pudiera responder).\n  • Las jugadas ilegales resultan en la pérdida de la carta y un rebarajeo\n    (no simplemente se deshacen).\n  • Los monstruos trampa ocupan tanto el backrow original como la zona de monstruos.\n  • Los monstruos robados/controlados por el oponente pueden cambiar de posición.\n  • Si no puedes pagar el costo de LP de un efecto, la carta se destruye.\n  • Las trampas continuas no dividen su activación del inicio del efecto.\n  \n  Sin Extra Deck, sin Links, sin Sincro, sin XYZ ni Péndulos.\n  Se juega con el pool de cartas de 2005. Formato muy diferente en ritmo y estrategia.\n\n----------------------------------------------------------------\n  GENESYS FORMAT\n----------------------------------------------------------------\n\nFormato alternativo independiente de Konami.\n  \n  Características:\n  • No hay banlist — en cambio, cada carta tiene un valor en puntos.\n  • Construyes tu deck con un presupuesto de puntos máximo.\n  • Las cartas que no aparecen en la lista de puntos valen 0 (libres).\n  • NO se permiten monstruos Link ni Péndulo.\n  • Diseñado para equilibrar el juego sin restricciones directas.\n\n----------------------------------------------------------------\n  TIME WIZARD FORMAT\n----------------------------------------------------------------\n\nNo es un meta fijo — es una categoría de torneos nostálgicos donde ambos\njugadores acuerdan jugar con el cardpool y las reglas de una fecha específica\ndel pasado. Ej: \"Format de Octubre 2010\".\n  \n  Cada \"Time Wizard\" es un formato diferente según la fecha elegida.\n\n----------------------------------------------------------------\n  ERRATAS EN LAS CARTAS\n----------------------------------------------------------------\n\nAlgunas cartas tuvieron cambios en su texto oficial a lo largo de los años.\nLas versiones más antiguas pueden tener texto diferente al actual — pero\nsiempre aplica el texto oficial más reciente, no el de la impresión antigua.\n\nEj: \"Monster Reborn\" fue erratada para especificar que invoca del cementerio\nde cualquier jugador, no solo el tuyo. En una impresión vieja, podría leerse\ndiferente.\n\nSi hay discrepancia, el texto actual en el ruling oficial de Konami prevalece.\n\n----------------------------------------------------------------\n  TERMINOLOGÍA: DIFERENCIAS TCG vs OCG\n----------------------------------------------------------------\n\n  \"cards you control\"    = cartas en tu campo (no en mano)\n  \"add\"                  = agregar a la mano (no robar del deck)\n  \"draw\"                 = robar del deck específicamente\n  \"unaffected\"           = inafectado por efectos\n  \"cannot be destroyed\"  = indestructible\n  \"negate the effect\"    ≠ \"negate the activation\" (son cosas distintas)\n  \"special summon\"       ≠ \"normal summon\"\n  \"send to the GY\"       ≠ \"discard\" (enviar desde campo ≠ descartar desde mano)\n  \"any player\"           = ambos jugadores, no solo uno\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nCuando veas un decklist de internet, siempre confirma en qué formato\nfue construido. Un deck de OCG puede tener cartas prohibidas en TCG.\nUn deck de Goat no tiene sentido en el formato moderno.\nEl formato cambia todo: las cartas, las estrategias, los rulings y el ritmo del juego.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 17: EL SIDE DECK", "content": "================================================================\n  TEMA 17: EL SIDE DECK\n  Nivel: Casual → Competitivo\n================================================================\n\nEl Side Deck es la diferencia entre un jugador que \"juega el deck\" y uno\nque \"juega el match\". Un deck sin Side Deck pensado es un deck que renuncia\na la mitad de la estrategia competitiva antes de empezar.\n\n----------------------------------------------------------------\n  QUÉ ES EL SIDE DECK\n----------------------------------------------------------------\n\nEs una zona de hasta 15 cartas que puedes intercambiar libremente con tu Main Deck\ny Extra Deck entre partidas del mismo match.\n\nReglas básicas:\n  • La cantidad de cartas en tu Main Deck y Extra Deck no puede cambiar\n    entre partidas (si empezaste con 40 en Main, terminas con 40).\n  • Puedes hacer todos los intercambios que quieras, pero siempre 1 a 1.\n  • El oponente ve qué cambias visualmente (sabe que cambiaste X cartas),\n    pero no sabe exactamente qué metiste o sacaste.\n  • Solo puedes sidear entre partidas 2 y 3, no antes de la 1.\n\n----------------------------------------------------------------\n  PARA QUÉ SIRVE\n----------------------------------------------------------------\n\nEl Side Deck te permite:\n\n1. AGREGAR COUNTERS ESPECÍFICOS\n   Si en la partida 1 descubres o confirmas que el oponente juega un deck\n   específico, puedes meter las cartas que más lo afectan.\n   Ej: Si juega Labrynth, metes Anti-Spell Fragrance o Spell Canceller.\n\n2. QUITAR CARTAS QUE NO SIRVEN\n   Algunas cartas de tu main deck no tienen uso en ciertos matchups.\n   Ej: Anti-Handtraps contra un deck sin Handtraps — sabes que no necesitas\n   \"Crossout Designator\" porque el oponente no las usa.\n\n3. CAMBIAR EL PLAN DE JUEGO COMPLETAMENTE\n   Algunos decks tienen un \"plan B\" de Side Deck tan poderoso que\n   la partida 2 es casi un deck diferente.\n   Ej: Meter un engine de \"Going Second\" cards si el oponente ganó el coin\n   flip y elige ir primero.\n\n----------------------------------------------------------------\n  CÓMO CONSTRUIR EL SIDE DECK\n----------------------------------------------------------------\n\nPASO 1 — Identifica los 3-4 decks más comunes del meta local\n  No el meta global de internet — el meta de tu torneo específico.\n  Las cartas que funcionan en tu meta local > las que funcionan en el meta mundial.\n\nPASO 2 — Para cada deck, identifica su punto débil\n  ¿Qué carta o efecto lo apaga completamente?\n  ¿Qué lo hace más lento o más inconsistente?\n\nPASO 3 — Busca cartas que cubran múltiples matchups\n  Una carta que sirve contra 3 decks es mejor que una que solo sirve contra 1.\n  Maximiza la cobertura por carta de Side Deck.\n\nPASO 4 — Define cuántas copias incluir\n  • 3 copias: si el matchup es crítico y necesitas verla casi siempre.\n  • 2 copias: si es útil pero no urgente.\n  • 1 copia: si es muy situacional o ya la tienes en el Main.\n\nPASO 5 — Decide qué sacas del Main para cada situación\n  Cada carta que metes del Side implica una que sale del Main.\n  Tener esto definido de antemano (sin improvisar) es la clave del siding efectivo.\n\n----------------------------------------------------------------\n  CUÁNDO SIDEAR Y CUÁNDO NO\n----------------------------------------------------------------\n\nSIDEAR MUCHO\n  Si el oponente tiene un mecanismo central que debes apagar.\n  Si tu plan A claramente no funcionó en la partida 1.\n  Si el oponente sideó también — asume que tiene counters para tu plan A.\n\nSIDEAR POCO O NADA\n  Si ganaste la partida 1 cómodamente — tu plan A funcionó.\n  Si tus Side Cards no son relevantes para este matchup específico.\n  Si cambiar mucho rompe la consistencia de tu deck.\n\n¿SIDEAR CONTRA TU PROPIO ESTILO?\n  A veces, si ganaste la partida 1 y el oponente sideó agresivamente contra ti,\n  meter algunas cartas \"inesperadas\" puede sorprenderlo.\n  Ej: Si eres un deck combo y el oponente mete Anti-Combo cards, podrías\n  sidear un engine de Control alternativo que no esperan.\n\n----------------------------------------------------------------\n  ANTI-METAS COMUNES POR TIPO DE DECK\n----------------------------------------------------------------\n\nContra Combo Decks:\n  • Nibiru (si invocan 5+ en turno 1)\n  • Dimensional Barrier (declara el tipo de invocación especial del combo)\n  • Summon Limit (limita las invocaciones especiales por turno)\n  • Skill Drain (niega efectos de monstruos en campo)\n\nContra Control Decks:\n  • Monstruos con efectos que no pueden ser negados\n  • Cartas de robo masivo para superar las interrupciones\n  • Twin Twisters / Cosmic Cyclone (destruye backrow)\n\nContra Decks de Cementerio:\n  • Dimensional Shifter (todo va desterrado ese turno)\n  • Macro Cosmos / Dimensional Fissure (desterrar en vez de al cementerio)\n  • D.D. Crow / Ghost Belle (responde efectos de cementerio)\n\nContra Graveyard Recursion:\n  • Necrovalley (el campo que bloquea el uso del cementerio)\n  • Imperial Iron Wall (nada puede ser desterrado — frena Outs al cementerio)\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nEl mejor Side Deck no es el que tiene las cartas más poderosas —\nes el que tiene las cartas más específicas para lo que vas a enfrentar.\n\nUn jugador con 15 cartas bien pensadas para su meta local gana más\nque uno con 15 Staples genéricos que sirven para \"todo pero no para nada específico\".", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 18: GESTIÓN DE LP Y RECURSOS EN EL DUELO", "content": "================================================================\n  TEMA 18: GESTIÓN DE LP Y RECURSOS EN EL DUELO\n  Nivel: Casual → Competitivo\n================================================================\n\nLos LP (Life Points) son el recurso más mal gestionado por jugadores intermedios.\nEl jugador novato teme perder LP. El jugador avanzado los usa como herramienta.\nLa diferencia entre ambos determina quién gana los duelos ajustados.\n\n----------------------------------------------------------------\n  LOS LP NO SON EL OBJETIVO — SON UN RECURSO\n----------------------------------------------------------------\n\nEn Yu-Gi-Oh!, perder LP no te hace perder el duelo si no llegas a 0.\nIr de 8000 a 4000 es exactamente tan válido como estar en 8000 —\nen ambos casos sigues en el juego.\n\nEl error del novato: evitar perder LP a cualquier costo, incluso a costa\nde no activar efectos o de no jugar de forma óptima.\n\nEl enfoque correcto: los LP son un recurso que se invierte para ganar ventaja.\nA veces, pagar 2000 LP por activar Solemn Judgment es la mejor inversión\ndel duelo porque niegas algo que te habría costado el juego.\n\n----------------------------------------------------------------\n  TIPOS DE \"RECURSOS\" EN EL DUELO\n----------------------------------------------------------------\n\nEn Yu-Gi-Oh! los recursos no son solo LP — son todo lo que tienes disponible:\n\n1. CARTAS EN MANO\n   El recurso más importante del turno. Cada carta que tienes en mano es\n   una opción potencial. Cuando los tienes muchos, tienes libertad.\n   Cuando los tienes pocos, cada decisión pesa más.\n\n2. CARTAS EN CAMPO\n   Los monstruos y mágicas/trampas activas. Representan amenazas actuales\n   y protecciones presentes.\n\n3. CARTAS EN CEMENTERIO\n   En el juego moderno, el cementerio es un recurso activo, no solo un descarte.\n   Muchos decks \"gastan\" recursos al cementerio para recuperarlos después.\n\n4. CARTAS DESTERRADAS\n   Generalmente el \"recurso muerto\" — pero algunos decks usan el destierro\n   activamente (Kashtira, decks de Bystial, etc.).\n\n5. LP\n   Cuánto margen de error tienes antes de perder.\n   4000 LP = aguantas un ataque de 4000 más.\n   1000 LP = cualquier ataque directamente te mata.\n\n6. TURNO\n   El tiempo — cuántos turnos lleva el duelo y si la posición actual es\n   sostenible o está empeorando con el tiempo.\n\n----------------------------------------------------------------\n  CUÁNDO VALE LA PENA PAGAR LP\n----------------------------------------------------------------\n\nSIEMPRE vale la pena cuando:\n  • Pagas LP para negar algo que no puedes recuperar de otra forma.\n  • El costo es pequeño comparado con la amenaza que niegas.\n  • Estás en posición ganadora y solo necesitas cerrar el duelo.\n\nEVALÚA CUIDADOSAMENTE cuando:\n  • Ya estás por debajo de 4000 LP — cada pago te acerca al rango mortal.\n  • El efecto que pagas podría no cambiar el resultado del duelo.\n  • El oponente podría tener otro golpe de seguimiento.\n\nNO vale la pena cuando:\n  • Pagas LP para salvar una situación que de todas formas perderás.\n  • Estás en 2000 LP o menos — el margen de error es casi nulo.\n  • El gasto no te da ventaja concreta, solo tiempo.\n\n----------------------------------------------------------------\n  GESTIÓN DE CARTAS EN MANO\n----------------------------------------------------------------\n\nHAND ADVANTAGE (Ventaja de Mano)\n  Tener más cartas que el oponente es ventaja. Pero no es absoluto —\n  5 cartas malas valen menos que 2 cartas buenas.\n  \n  CALIDAD > CANTIDAD en mano.\n\nCUANDO DESCARTAR\n  Algunos efectos te piden descartar como costo. Evalúa:\n  • ¿La carta que descarto tiene utilidad desde el cementerio?\n  • ¿Es una carta que no sirve en esta situación de todas formas?\n  • ¿Vale la pena lo que obtengo a cambio?\n\nNO desperdicies cartas en cadenas que no van a cambiar el resultado.\nCada carta que gastas innecesariamente es un recurso menos para el turno siguiente.\n\n----------------------------------------------------------------\n  GESTIÓN DEL CAMPO\n----------------------------------------------------------------\n\nSOBRECONSTRUIR EL CAMPO\n  Un error común: invocar más monstruos de los necesarios para ganar.\n  Cada monstruo adicional es un recurso gastado que podría ser necesario después.\n  Pregunta: ¿necesito invocar este quinto monstruo para ganar este turno?\n  Si la respuesta es no, considera guardarlo.\n\nPROTEGER LO NECESARIO, NO TODO\n  Proteger cada carta en campo con una trampa o efecto consume recursos rápidamente.\n  Identifica cuál es la carta más crítica y protege esa.\n  Las demás son prescindibles si el núcleo de la estrategia sobrevive.\n\nDEJAR LP DEL OPONENTE EN 100\n  \"El oponente con 100 LP es tan peligroso como con 8000.\"\n  No desperdicies un combo completo para dejar al oponente en LP bajos sin cerrar.\n  Si no cierras el duelo, ese recurso gastado fue en vano.\n\n----------------------------------------------------------------\n  GESTIÓN DEL DUELO LARGO (GRIND GAME)\n----------------------------------------------------------------\n\nSi el duelo llega al turno 4 o 5:\n  • Evalúa quién tiene más recursos totales (cartas + campo + cementerio + LP).\n  • Si vas arriba en recursos, juega conservador — el tiempo trabaja a tu favor.\n  • Si vas abajo, necesitas asumir riesgos para recuperar ventaja.\n\nDECKOUT (quedarte sin cartas)\n  Si el duelo se extiende mucho, quedarte sin cartas significa perder.\n  Algunos decks usan esto como victoria alternativa (mill).\n  Si tu deck tiene pocos recursos de recuperación, evita dibujar de más.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nAl final de cada turno, hazte esta pregunta:\n\"¿Tengo más recursos que al inicio de mi turno, menos, o igual?\"\n\nSi consistentemente tienes menos recursos cada turno sin estar más cerca\nde ganar, estás siendo outresourced. Necesitas cambiar el plan.\n\nEl jugador que mejor gestiona sus recursos en el largo plazo,\nno el que hace los combos más espectaculares, gana los duelos ajustados.", "date": "2026-02-01T00:00:00.000Z"}, {"title": "TEMA 19: LEER EL CAMPO DEL OPONENTE", "content": "================================================================\n  TEMA 19: LEER EL CAMPO DEL OPONENTE\n  Nivel: Casual → Competitivo\n================================================================\n\nLa habilidad más subestimada del juego no es memorizar combos —\nes leer lo que el oponente tiene antes de que lo revele.\nLos jugadores de alto nivel toman decisiones basadas en información\ndeducida, no solo en lo que ven directamente. Este tema te enseña cómo.\n\n----------------------------------------------------------------\n  POR QUÉ LEER EL CAMPO IMPORTA\n----------------------------------------------------------------\n\nCada vez que activas una carta sin leer al oponente, estás tomando\nuna decisión a ciegas. A veces funciona. Pero el jugador consistente\nno depende de la suerte — deduce y actúa con información.\n\nLeer el campo te permite:\n  • Saber si es seguro activar tu combo o esperar.\n  • Identificar qué Handtrap o trampa probablemente tiene el oponente.\n  • Decidir si gastas tus recursos anti-handtrap ahora o los guardas.\n  • Adaptar tu plan de juego en tiempo real.\n\n----------------------------------------------------------------\n  SEÑALES QUE DAN INFORMACIÓN\n----------------------------------------------------------------\n\nEL NÚMERO DE CARTAS EN MANO\n  • 5+ cartas al inicio del turno del oponente = mano llena, muchas opciones.\n    Posibles múltiples Handtraps o combo completo.\n  • 1-2 cartas = mano comprometida. Probablemente ya gastó sus Handtraps\n    o fue afectado por algún efecto. Menor amenaza inmediata.\n\nCÓMO MANEJÓ EL TURNO ANTERIOR\n  • ¿Pasó el turno rápido? → Probablemente tiene una mano débil o planea\n    interrumpirte con trampas ya colocadas.\n  • ¿Jugó despacio y deliberadamente? → Está calculando — su mano es compleja\n    o tiene opciones que quiere preservar.\n  • ¿No activó nada durante tu turno? → Puede que no tenga Handtraps, o está\n    guardando respuesta para algo específico.\n\nCARTAS BOCA ABAJO EN EL BACKROW\n  • 1 carta boca abajo = puede ser trampa o Quick-Play. Juega con precaución.\n  • 3+ cartas boca abajo = deck de Control o Trampas. Alto riesgo al combo.\n  • 0 cartas boca abajo = más libre para actuar, pero puede tener\n    Handtraps en mano.\n\nEL DECK QUE ESTÁ JUGANDO\n  • Si sabes qué deck es, ya sabes sus Handtraps probables, sus combos,\n    sus puntos débiles y qué busca hacer.\n  • Si no lo sabes, los primeros 2-3 efectos activados te lo revelan.\n    Guarda esa información.\n\n----------------------------------------------------------------\n  DEDUCIR LAS HANDTRAPS\n----------------------------------------------------------------\n\n¿PASÓ SU TURNO SIN USAR HANDTRAPS?\n  → Probablemente no tiene en mano o está guardando algo específico.\n  → Más seguro para ejecutar combo.\n\n¿YA ACTIVÓ UNA HANDTRAP ESTE TURNO?\n  → Los decks que juegan 3+ Handtraps pueden tener otra.\n  → Los decks más agresivos pueden haberla gastado ya.\n\n¿QUÉ HANDTRAP ESPECÍFICA USARÍA CONTRA MI DECK?\n  • Ash Blossom: el oponente que sabe tu deck la usará contra tu buscador.\n    Si no la activó cuando buscaste, probablemente no la tiene.\n  • Nibiru: solo importa si estás en tu quinta invocación especial.\n    Puedes contar tus invocaciones y decidir si vale continuar o cerrar antes.\n  • Droll: si ya agregaste una carta a tu mano desde el deck este turno\n    y no te la activaron, probablemente no la tiene.\n  • Impermanence: si no la activaron cuando invocaste el primer monstruo con\n    efecto, puede que no la tengan (o estén esperando algo más importante).\n\n----------------------------------------------------------------\n  CÓMO RESPONDER A LO QUE DEDUCES\n----------------------------------------------------------------\n\nSI CREES QUE TIENE HANDTRAP\n  • Activa primero la carta menos crítica — sirve como \"cebo\".\n  • Si gastan la Handtrap en el cebo, tu pieza clave queda libre.\n  • Si no la usan en el cebo, avanza con más confianza.\n\nSI CREES QUE NO TIENE NADA\n  • Puedes ejecutar el combo sin rodeos y maximizar el endboard.\n  • Pero no asumas al 100% — el oponente podría estar esperando un momento\n    específico para activar su respuesta.\n\nSI HAY BACKROW Y NO SABES QUÉ ES\n  • Actúa como si fuera la peor trampa posible para tu combo.\n  • Si tienes destructor de trampas en mano, úsalo primero.\n  • Si no tienes respuesta a trampas, considera si vale más atacar con\n    un monstruo menor primero para \"revelar\" qué hay boca abajo.\n\n----------------------------------------------------------------\n  LEER EL CAMPO EN PARTIDAS 2 Y 3 (SIDE DECK)\n----------------------------------------------------------------\n\nDespués de la partida 1, ya sabes:\n  • Qué deck juega el oponente.\n  • Qué Handtraps usó (o no usó).\n  • Si tiene mucho backrow o juega más en mano.\n  • Qué le costó más trabajo hacer contra tu deck.\n\nUsa esa información para sidear y para adaptar cómo juegas la partida 2.\nSi sideó agresivamente contra tu combo (lo notarás si su comportamiento\ncambia drásticamente), puede que tenga cartas anti-combo que no te esperabas.\n\n----------------------------------------------------------------\n  ERRORES COMUNES AL LEER EL CAMPO\n----------------------------------------------------------------\n\n• Asumir que tiene X carta porque perdiste contra ella antes.\n  → Cada duelo es nuevo. La experiencia informa, pero no determina.\n\n• Jugar mecánicamente sin observar al oponente.\n  → La velocidad a la que mueve cartas, dónde pone la vista, cuándo\n    vacila — todo da información.\n\n• Ignorar lo que NO hizo.\n  → La información más valiosa a veces es que el oponente no activó nada.\n\n• Sobre-pensar y quedarte paralizado.\n  → Leer el campo debe hacerse rápido. Analizas, decides, actúas.\n    La parálisis por análisis también te hace perder.\n\n----------------------------------------------------------------\n  CONSEJO CLAVE\n----------------------------------------------------------------\n\nAl inicio de cada turno del oponente hazte 3 preguntas:\n  1. ¿Cuántas cartas tiene en mano y qué dice eso?\n  2. ¿Qué hizo (o no hizo) en MI último turno?\n  3. ¿Qué necesita hacer en este turno para ganar?\n\nLa tercera pregunta es la más poderosa — si sabes qué necesita tu oponente\npara ganar, puedes centrar todos tus recursos en negarlo exactamente.", "date": "2026-02-01T00:00:00.000Z"}],

    // ── Mechanic Counter Pairs (Specialties) ─────────────────────────────────
    _defaultSpecialties: [{"id": "spec_def_{i+1:03d}", "mechanicRole": "Starter", "counterRole": "Handtrap"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Token Summoner", "counterRole": "Stun-Special"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Pay", "counterRole": "Burner"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Recycler", "counterRole": "Removal"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Recycler", "counterRole": "Stun-GY"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Send", "counterRole": "Stun-GY"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Undestroyable", "counterRole": "Send"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Destroyer", "counterRole": "Protector"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Quick-effect", "counterRole": "Negate-effect"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Quick-effect", "counterRole": "Negate-activation"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Discard", "counterRole": "Handloop"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Handloop", "counterRole": "Draw-engine"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Extender", "counterRole": "Stun-Special"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Untargetable", "counterRole": "Non-target"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Ignition", "counterRole": "Disruptor"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Ignition", "counterRole": "Stun-Effect"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "LP Restore", "counterRole": "Extender"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Burner", "counterRole": "Anti-damage"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Removal", "counterRole": "Stun-Banish"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Handtrap", "counterRole": "Negate-effect"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Boss Monster", "counterRole": "Boardbreaker"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Stun", "counterRole": "Boardbreaker"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Tower", "counterRole": "Booster"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Grinding Card", "counterRole": "Recycler"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Grinding Card", "counterRole": "Stun-GY"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Banished Card", "counterRole": "Negate-effect"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Speed-4", "counterRole": "Tower"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Searcher", "counterRole": "Stun-Draw"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Searcher (archetype)", "counterRole": "Stun-Draw"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Draw-engine", "counterRole": "Stun-Draw"}, {"id": "spec_def_{i+1:03d}", "mechanicRole": "Target", "counterRole": "Untargetable"}, {"id": "spec_def_032", "mechanicRole": "Tower", "counterRole": "Stats reducer"}, {"id": "spec_def_033", "mechanicRole": "Token Summoner", "counterRole": "Boardbreaker"}, {"id": "spec_def_034", "mechanicRole": "Stats reducer", "counterRole": "Handtrap"}],

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