/* formacion.js — Formación, Meta, Config, Welcome, MusicPlayer y ayuda contextual */
/* Absorbe: formacion.js, meta.js, config.js, welcome.js, help.js */


// ── Formacion — sub-tabs: Apuntes, Temas, Juegos, Fuentes (→Meta), Maestros (→Meta) ──

const Formacion = {

    container:     null,
    activeTab:     'apuntes',
    activeLevel:   null,
    activeTestCat: null,
    activeTestId:  null,
    _pt: null,   // estado del Test Práctico activo (tablero aislado, no toca ZonaPractica)
    NOTES_KEY:     'yugioh_formacion_notes',
    MASTERED_KEY:  'yugioh_formacion_mastered',
    ESTILO_KEY:    'yugioh_estilo_juego',

    TOPICS: [
        // ── MÓDULO 1 — Fundamentos del Juego ──
        { id: 'que-es-yugioh',           label: '¿Qué es Yu-Gi-Oh!?',               level: 'Básico' },
        { id: 'vocabulario-legal',       label: 'Vocabulario Legal del Juego',      level: 'Básico' },
        { id: 'fases-del-duelo',         label: 'Las Fases del Duelo',              level: 'Básico' },
        { id: 'tipos-cartas-basicas',    label: 'Tipos de Cartas Básicas',          level: 'Básico' },
        { id: 'tipos-cartas-especiales', label: 'Tipos de Cartas Especiales',       level: 'Intermedio' },
        // ── MÓDULO 2 — Lectura de Cartas y Mentalidad ──
        { id: 'estructura-efecto-carta', label: 'Estructura de un Efecto de Carta', level: 'Intermedio' },
        { id: 'funciones-de-las-cartas', label: 'Funciones de las Cartas (Roles)',  level: 'Intermedio' },
        { id: 'palabras-tecnicas-juego', label: 'Palabras Clave y Técnicas del Juego', level: 'Intermedio' },
        { id: 'estructura-arquetipos', label: 'Estructura de un Arquetipo (Diseño TCG)', level: 'Intermedio' },
        { id: 'mentalidad-del-jugador',  label: 'Mentalidad del Jugador',           level: 'Intermedio' },
        { id: 'secuenciacion',           label: 'Secuenciación: El Orden Importa', level: 'Avanzado' },
        // ── MÓDULO 3 — Construcción y Optimización de Mazo ──
        { id: 'elegir-construir-deck',      label: 'Elegir y Construir tu Deck',        level: 'Competitivo' },
{ id: 'pet-deck-dominar',           label: 'Pet Deck: De Jugarlo a Dominarlo',  level: 'Competitivo' },
{ id: 'valorar-carta',              label: 'Cómo Valorar una Carta',            level: 'Competitivo' },
{ id: 'staples-formato',            label: 'Staples del Formato',               level: 'Competitivo' },
        { id: 'anatomia-deck-competitivo',  label: 'Anatomía de un Deck Competitivo',   level: 'Competitivo' },
        { id: 'debilidades-deck',           label: 'Qué Hace Débil a un Deck o Arquetipo', level: 'Competitivo' },
        { id: 'optimizar-deck',             label: 'Cómo Optimizar tu Deck',            level: 'Competitivo' },
{ id: 'equilibrio-deck',            label: 'Equilibrio del Deck: Detectando Excesos', level: 'Competitivo' },
// ── MÓDULO 4 — Motor Técnico del Juego ──
        { id: 'cadenas-prioridad',       label: 'Cadenas, Prioridad y Spell Speed', level: 'Avanzado' },
        { id: 'rulings-invocaciones',    label: 'Rulings de Invocaciones',          level: 'Avanzado' },
        { id: 'rulings-batalla',         label: 'Rulings en Fase de Batalla',       level: 'Avanzado' },
        { id: 'if-when-timing',          label: 'IF vs WHEN y Timing Avanzado',     level: 'Avanzado' },
        // ── MÓDULO 5 — Metajuego y Torneo ──
        { id: 'leer-campo-oponente',     label: 'Leer el Campo del Oponente',       level: 'Competitivo' },
        { id: 'gestion-lp-recursos',     label: 'Gestión de LP y Recursos',         level: 'Competitivo' },
        { id: 'formatos-diferencias',    label: 'Formatos y sus Diferencias',       level: 'Competitivo' },
        { id: 'side-deck',               label: 'El Side Deck',                    level: 'Competitivo' },
{ id: 'bo1-vs-bo3',              label: 'Bo1 vs Bo3: Diferencias Estratégicas', level: 'Competitivo' },
{ id: 'practicar-evento',        label: 'Practicar Antes de un Evento',     level: 'Competitivo' },
{ id: 'meta-tiers',              label: 'El Meta y los Tiers de Poder',     level: 'Competitivo' },
    ],

    PLATFORMS: ['PC', 'GBC', 'GBA', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'Físico'],
    TEST_CATEGORIES: [
        { id: 'teoricos',  label: 'Teóricos',  icon: '📖' },
        { id: 'practicos', label: 'Prácticos', icon: '🎯' },
    ],
// ── Tu Estilo de Juego — ejes de preferencia y catálogo de arquetipos ──
    AXES: ['agresion', 'planificacion', 'riesgo', 'interaccion', 'complejidad'],

    ESTILO_PREGUNTAS: [
        { q: '¿Qué sensación buscas al final de un duelo ganado?', options: [
            { text: 'Que fue rapidísimo, casi no le di tiempo a reaccionar.', delta: { agresion: 2, riesgo: 1 } },
            { text: 'Que resistí toda la partida y terminé ganando por desgaste.', delta: { agresion: -2, riesgo: -1 } },
            { text: 'Que ejecuté un combo largo sin errores.', delta: { planificacion: 2, complejidad: 1 } },
            { text: 'Que leí bien la partida y me adapté sobre la marcha.', delta: { planificacion: -2, interaccion: 1 } }
        ]},
        { q: 'Al armar tu deck, ¿qué disfrutas más?', options: [
            { text: 'Optimizar cada copia para que el combo nunca falle.', delta: { planificacion: 2, complejidad: 2 } },
            { text: 'Meter la mayor cantidad de handtraps e interacción posible.', delta: { interaccion: 2 } },
            { text: 'Buscar el mayor daño posible en el menor número de turnos.', delta: { agresion: 2, riesgo: 1 } },
            { text: 'Tener respuestas para todo, aunque sea más lento.', delta: { agresion: -1, interaccion: 1, riesgo: -1 } }
        ]},
        { q: 'Si tu jugada principal es negada, ¿qué prefieres que pase después?', options: [
            { text: 'Tener un plan B inmediato para seguir combeando.', delta: { planificacion: 2 } },
            { text: 'Que no importe mucho, porque igual dejé un buen board defensivo.', delta: { agresion: -1, riesgo: -1 } },
            { text: 'Que el rival pague un precio por negarme (2-for-1).', delta: { interaccion: 1, riesgo: 1 } },
            { text: 'Aceptar el turno perdido y esperar mi momento.', delta: { riesgo: -2, agresion: -1 } }
        ]},
        { q: '¿Qué tipo de victoria se siente más satisfactoria?', options: [
            { text: 'Ganar en el primer turno sin que el rival juegue.', delta: { agresion: 2, riesgo: 2 } },
            { text: 'Ganar tras aguantar varias interrupciones del rival.', delta: { interaccion: 1, riesgo: -1, complejidad: 1 } },
            { text: 'Ganar por agotamiento de recursos del rival.', delta: { agresion: -2, riesgo: -1 } },
            { text: 'Ganar ejecutando algo técnico que pocos saben hacer.', delta: { complejidad: 2, planificacion: 1 } }
        ]},
        { q: 'En redes o videos de Yu-Gi-Oh!, ¿qué contenido te llama más?', options: [
            { text: 'Combos largos y líneas de juego complejas.', delta: { complejidad: 2, planificacion: 1 } },
            { text: 'Tier lists y qué está rompiendo el formato.', delta: { agresion: 1, riesgo: 1 } },
            { text: 'Guías de counters y cómo vencer al meta.', delta: { interaccion: 2 } },
            { text: 'Historias de decks poco convencionales (rogue).', delta: { complejidad: 1, riesgo: 1, interaccion: -1 } }
        ]},
        { q: '¿Qué te frustra más como jugador?', options: [
            { text: 'Que mi combo se caiga por 1 sola handtrap.', delta: { planificacion: 1, riesgo: 1 } },
            { text: 'No tener respuesta cuando el rival arma un board enorme.', delta: { interaccion: 2 } },
            { text: 'Que la partida se alargue demasiado sin definirse.', delta: { agresion: 1, riesgo: 1 } },
            { text: 'Cometer un error de secuencia por ir muy rápido.', delta: { complejidad: 1, planificacion: -1 } }
        ]},
        { q: 'Yendo de segundo contra un board completo, ¿cuál es tu plan ideal?', options: [
            { text: 'Romper el campo con boardbreakers y tomar control.', delta: { interaccion: 2, agresion: 1 } },
            { text: 'Negar lo importante y hacer mi propio combo encima.', delta: { planificacion: 2, interaccion: 1 } },
            { text: 'Jugar seguro, esperar recursos y ganar más tarde.', delta: { riesgo: -2, agresion: -1 } },
            { text: 'Ir con todo aunque sea arriesgado, buscando el OTK.', delta: { riesgo: 2, agresion: 2 } }
        ]},
        { q: '¿Qué tan importante es que tu deck sea difícil de pilotar?', options: [
            { text: 'Mucho, disfruto el reto técnico.', delta: { complejidad: 2 } },
            { text: 'Prefiero algo directo, que gane sin vueltas.', delta: { complejidad: -2, agresion: 1 } },
            { text: 'Me da igual, mientras sea consistente.', delta: { riesgo: -1, planificacion: -1 } },
            { text: 'Prefiero que sea flexible y se adapte a lo que enfrente.', delta: { interaccion: 1, planificacion: -1 } }
        ]},
        { q: 'Cuando pierdes, ¿en qué piensas primero?', options: [
            { text: 'En qué punto del combo me equivoqué.', delta: { complejidad: 1, planificacion: 1 } },
            { text: 'Qué handtrap o carta me faltó para responder.', delta: { interaccion: 1 } },
            { text: 'Que jugué muy pasivo y debí arriesgar más.', delta: { riesgo: 1, agresion: 1 } },
            { text: 'Que el rival tuvo la mano perfecta, mala suerte.', delta: { riesgo: -1 } }
        ]},
        { q: 'Si tuvieras que elegir solo una cosa para tu deck ideal, ¿cuál sería?', options: [
            { text: 'Un combo que nadie pueda replicar fácil.', delta: { complejidad: 2, planificacion: 1 } },
            { text: 'La mayor cantidad de interacción posible.', delta: { interaccion: 2 } },
            { text: 'El mayor daño posible en el menor tiempo.', delta: { agresion: 2, riesgo: 1 } },
            { text: 'Recursos infinitos para nunca quedarme sin jugadas.', delta: { agresion: -1, riesgo: -2, interaccion: -1 } }
        ]}
    ],

    // vector: -1..1 por eje. Ajustable con el tiempo según cambie el meta.
    ESTILO_ARQUETIPOS: [
        { id: 'spright',        name: 'Spright',        desc: 'Swarm de Links pequeños con mucha autonomía y velocidad; combo corto pero constante.', vector: { agresion: 0.6, planificacion: 0.7, riesgo: 0.3, interaccion: -0.4, complejidad: 0.5 } },
        { id: 'kashtira',       name: 'Kashtira',       desc: 'Control por desterrado: incomoda al rival negando recursos antes de que los use.', vector: { agresion: 0.2, planificacion: 0.2, riesgo: 0.1, interaccion: 0.8, complejidad: 0.4 } },
        { id: 'branded',        name: 'Branded',        desc: 'Payoffs grandes de Fusión desde el cementerio; combo denso con mucho poder final.', vector: { agresion: 0.7, planificacion: 0.8, riesgo: 0.5, interaccion: -0.2, complejidad: 0.7 } },
        { id: 'floowandereeze', name: 'Floowandereeze', desc: 'Stun/lock: reduce las opciones del rival y gana por asfixia, no por daño rápido.', vector: { agresion: -0.6, planificacion: -0.3, riesgo: -0.7, interaccion: 0.6, complejidad: 0.2 } },
        { id: 'eldlich',        name: 'Eldlich',        desc: 'Backrow y grind puro: prioriza la consistencia y el desgaste sobre la velocidad.', vector: { agresion: -0.7, planificacion: -0.5, riesgo: -0.8, interaccion: 0.5, complejidad: 0.1 } },
        { id: 'labrynth',       name: 'Labrynth',       desc: 'Control por trampas y floodgates; castiga cualquier jugada del rival que no se cuide.', vector: { agresion: -0.5, planificacion: -0.2, riesgo: -0.6, interaccion: 0.7, complejidad: 0.5 } },
        { id: 'tenpai',         name: 'Tenpai Dragon',  desc: 'Burn/OTK agresivo: busca cerrar el duelo en el menor número de turnos posible.', vector: { agresion: 0.9, planificacion: 0.4, riesgo: 0.8, interaccion: -0.5, complejidad: 0.3 } },
        { id: 'yubel',          name: 'Yubel',          desc: 'Resiliencia y recursión: es difícil de matar de verdad, gana por desgaste técnico.', vector: { agresion: -0.3, planificacion: 0.1, riesgo: -0.4, interaccion: 0.3, complejidad: 0.6 } },
        { id: 'ryzeal',         name: 'Ryzeal',         desc: 'Combo extenso con muchos extenders; recompensa la ejecución precisa y técnica.', vector: { agresion: 0.5, planificacion: 0.9, riesgo: 0.4, interaccion: -0.6, complejidad: 0.8 } },
        { id: 'centurion',      name: 'Centur-Ion',     desc: 'Toolbox flexible: se adapta a lo que enfrenta más que seguir una sola línea fija.', vector: { agresion: 0.4, planificacion: 0.6, riesgo: 0.2, interaccion: 0.1, complejidad: 0.6 } },
        { id: 'fireking',       name: 'Fire King',      desc: 'Midrange con recursión constante; juega el largo plazo sin depender de un solo turno.', vector: { agresion: 0.1, planificacion: 0.3, riesgo: -0.2, interaccion: 0.4, complejidad: 0.5 } },
        { id: 'exosister',      name: 'Exosister',      desc: 'Swarm pequeño con handtraps integradas; control temprano con presión moderada.', vector: { agresion: -0.2, planificacion: -0.4, riesgo: -0.5, interaccion: 0.6, complejidad: 0.2 } },
        { id: 'purrely',        name: 'Purrely',        desc: 'Combo de Links con mucha autonomía; prioriza cerrar su propia línea sobre reaccionar.', vector: { agresion: 0.6, planificacion: 0.7, riesgo: 0.6, interaccion: -0.5, complejidad: 0.6 } },
        { id: 'runick',         name: 'Runick',         desc: 'Denegación vía hechizos desde el cementerio rival; híbrido de control y combo técnico.', vector: { agresion: -0.4, planificacion: 0.2, riesgo: -0.3, interaccion: 0.7, complejidad: 0.7 } },
        { id: 'vanquishsoul',   name: 'Vanquish Soul',  desc: 'Beatdown midrange equilibrado: sin extremos, gana por presión constante y pareja.', vector: { agresion: 0.5, planificacion: 0.3, riesgo: 0.3, interaccion: 0.3, complejidad: 0.4 } }
    ],

// ── Tu Personaje de Yu-Gi-Oh! — personalidad, motivaciones y objetivos ──
    PERSONAJE_KEY: 'yugioh_personaje_resultado',
    PERSONAJE_AXES: ['vinculo', 'ambicion', 'instinto', 'resiliencia', 'moralidad'],

    PERSONAJE_PREGUNTAS: [
        { q: '¿Qué te motiva a seguir jugando cuando vas perdiendo?', options: [
            { text: 'Mis amigos confían en mí, no puedo rendirme.', delta: { vinculo: 2, resiliencia: 2 } },
            { text: 'Demostrar que soy el mejor, sin importar el precio.', delta: { ambicion: 2, moralidad: -1 } },
            { text: 'La emoción del riesgo, algo va a pasar.', delta: { instinto: 2 } },
            { text: 'Un plan de respaldo calculado fríamente.', delta: { instinto: -2, ambicion: 1 } }
        ]},
        { q: 'Cuando un rival te reta, ¿cómo reaccionas?', options: [
            { text: 'Acepto con respeto, quiero un buen duelo.', delta: { moralidad: 2, vinculo: 1 } },
            { text: 'Lo tomo como una oportunidad para probar mi poder.', delta: { ambicion: 2 } },
            { text: 'Sigo mi instinto, improviso en el momento.', delta: { instinto: 2 } },
            { text: 'Calculo cada variable antes de aceptar.', delta: { instinto: -2 } }
        ]},
        { q: 'Tu objetivo final en el juego es...', options: [
            { text: 'Proteger a quienes quiero.', delta: { vinculo: 2, moralidad: 1 } },
            { text: 'Ser el número uno, superar a todos.', delta: { ambicion: 2, vinculo: -1 } },
            { text: 'Vivir la aventura, cada duelo es una historia.', delta: { instinto: 1, resiliencia: 1 } },
            { text: 'Dominar el juego a un nivel técnico superior.', delta: { instinto: -2, ambicion: 1 } }
        ]},
        { q: 'Si un amigo comete un error crucial en su turno, tú...', options: [
            { text: 'Lo apoyo, todos nos equivocamos.', delta: { vinculo: 2, moralidad: 1 } },
            { text: 'Se lo hago notar, el error tiene consecuencias.', delta: { moralidad: -1, ambicion: 1 } },
            { text: 'Confío en que lo resolverá solo.', delta: { vinculo: -1, resiliencia: 1 } },
            { text: 'Ya estoy pensando en cómo aprovecharlo.', delta: { moralidad: -2, ambicion: 1 } }
        ]},
        { q: '¿Qué tipo de rival disfrutas enfrentar?', options: [
            { text: 'Uno que también valora la amistad y el juego limpio.', delta: { vinculo: 2, moralidad: 1 } },
            { text: 'Uno poderoso que me obligue a superarme.', delta: { ambicion: 2 } },
            { text: 'Uno impredecible, que no siga ningún patrón.', delta: { instinto: 2 } },
            { text: 'Uno frío y estratégico, un desafío mental.', delta: { instinto: -2 } }
        ]},
        { q: 'Cuando pierdes un duelo importante...', options: [
            { text: 'Me duele, pero vuelvo a intentarlo las veces que sea necesario.', delta: { resiliencia: 2 } },
            { text: 'Analizo cada error con frialdad para no repetirlo.', delta: { instinto: -2, resiliencia: 1 } },
            { text: 'Me frustro, pero mis amigos me ayudan a seguir.', delta: { vinculo: 2 } },
            { text: 'Lo tomo como una afrenta personal, necesito revancha.', delta: { ambicion: 2, moralidad: -1 } }
        ]},
        { q: '¿Qué representan para ti tus cartas más poderosas?', options: [
            { text: 'El vínculo con las cartas que me acompañaron desde el inicio.', delta: { vinculo: 1, moralidad: 1 } },
            { text: 'Las herramientas de mi ambición, mi camino a la cima.', delta: { ambicion: 2 } },
            { text: 'Sorpresas que uso cuando el momento se siente correcto.', delta: { instinto: 2 } },
            { text: 'Piezas de un plan ya definido de antemano.', delta: { instinto: -2 } }
        ]},
        { q: 'En un torneo, ¿qué te importa más al final del día?', options: [
            { text: 'Que mis amigos y yo lo disfrutamos juntos.', delta: { vinculo: 2 } },
            { text: 'El trofeo, el reconocimiento del logro.', delta: { ambicion: 2 } },
            { text: 'Los momentos intensos que viví duelo a duelo.', delta: { instinto: 1, resiliencia: 1 } },
            { text: 'Haber jugado con honor, gane o pierda.', delta: { moralidad: 2 } }
        ]}
    ],

    // vector: -1..1 por eje (vinculo, ambicion, instinto, resiliencia, moralidad)
    PERSONAJE_CATALOGO: [
        { id: 'yugi-muto',      name: 'Yugi Muto',       img: 'img/personajes/yugi-muto.jpg',      desc: 'Cree en el poder de la amistad y en el corazón de las cartas; nunca se rinde aunque el duelo esté en su contra.', vector: { vinculo: 0.9, ambicion: -0.3, instinto: 0.4, resiliencia: 0.9, moralidad: 0.9 } },
        { id: 'seto-kaiba',     name: 'Seto Kaiba',      img: 'img/personajes/seto-kaiba.jpg',     desc: 'Obsesionado con ser el mejor duelista del mundo; confía únicamente en su propia habilidad y estrategia.', vector: { vinculo: -0.5, ambicion: 0.9, instinto: 0.2, resiliencia: 0.8, moralidad: 0.1 } },
        { id: 'joey-wheeler',   name: 'Joey Wheeler',    img: 'img/personajes/joey-wheeler.jpg',   desc: 'Duelista de corazón que juega por instinto y por sus amigos; su determinación compensa lo que le falta en cálculo.', vector: { vinculo: 0.8, ambicion: 0.3, instinto: 0.8, resiliencia: 0.7, moralidad: 0.6 } },
        { id: 'yusei-fudo',     name: 'Yusei Fudo',      img: 'img/personajes/yusei-fudo.jpg',     desc: 'Ingeniero y estratega que duelea con la cabeza fría, pero siempre en función de proteger a los suyos.', vector: { vinculo: 0.7, ambicion: 0.1, instinto: -0.2, resiliencia: 0.8, moralidad: 0.8 } },
        { id: 'jaden-yuki',     name: 'Jaden Yuki',      img: 'img/personajes/jaden-yuki.jpg',     desc: 'Duelea por diversión y por sus cartas-espíritu; espontáneo, alegre y leal a sus amigos por encima de todo.', vector: { vinculo: 0.6, ambicion: -0.4, instinto: 0.7, resiliencia: 0.5, moralidad: 0.7 } },
        { id: 'zane-truesdale', name: 'Zane Truesdale',  img: 'img/personajes/zane-truesdale.jpg', desc: 'Perfeccionista solitario que mide su valor por el resultado; la victoria a cualquier costo lo consume.', vector: { vinculo: -0.2, ambicion: 0.7, instinto: -0.3, resiliencia: 0.6, moralidad: 0.4 } },
        { id: 'bakura-ryou',    name: 'Bakura (Yami)',   img: 'img/personajes/bakura-ryou.jpg',    desc: 'Manipulador y frío, ve el duelo como un juego de poder donde el fin siempre justifica los medios.', vector: { vinculo: -0.8, ambicion: 0.8, instinto: -0.4, resiliencia: 0.5, moralidad: -0.9 } },
        { id: 'marik-ishtar',   name: 'Marik Ishtar',    img: 'img/personajes/marik-ishtar.jpg',   desc: 'Impulsivo y ambicioso, busca poder sin ataduras y no le tiembla la mano para conseguirlo.', vector: { vinculo: -0.6, ambicion: 0.6, instinto: 0.6, resiliencia: 0.4, moralidad: -0.6 } },
        { id: 'mai-valentine',  name: 'Mai Valentine',   img: 'img/personajes/mai-valentine.jpg',  desc: 'Independiente y orgullosa, juega para sí misma pero termina encontrando valor en los lazos que crea.', vector: { vinculo: 0.2, ambicion: 0.5, instinto: 0.3, resiliencia: 0.6, moralidad: 0.3 } },
        { id: 'aster-phoenix',  name: 'Aster Phoenix',   img: 'img/personajes/aster-phoenix.jpg',  desc: 'Profesional calculador, cada duelo es un paso hacia un objetivo personal que persigue con frialdad.', vector: { vinculo: -0.1, ambicion: 0.6, instinto: -0.5, resiliencia: 0.7, moralidad: 0.5 } },
        { id: 'yuma-tsukumo',   name: 'Yuma Tsukumo',    img: 'img/personajes/yuma-tsukumo.jpg',   desc: 'Puro corazón y adrenalina; salta al riesgo sin pensarlo dos veces, siempre por sus amigos.', vector: { vinculo: 0.9, ambicion: -0.5, instinto: 0.9, resiliencia: 0.8, moralidad: 0.8 } },
        { id: 'kaito-tenjo',    name: 'Kaito Tenjo',     img: 'img/personajes/kaito-tenjo.jpg',    desc: 'Reservado y metódico, duelea con un objetivo mayor en mente que rara vez comparte con nadie.', vector: { vinculo: 0.1, ambicion: 0.4, instinto: -0.6, resiliencia: 0.7, moralidad: 0.6 } }
    ],

    TESTS: {
        teoricos: [
            { id: 'test-rulings-torneo', label: 'Rulings y Toma de Decisiones en Torneo', level: 'Avanzado',
              desc: '15 situaciones reales de torneo sobre timing, cadenas, costos e Invocaciones Especiales. Pensado para nivel Avanzado/Competitivo.' },
        ],
        practicos: [
    { id: 'test-endboard-1', label: 'El Endboard Correcto', level: 'Competitivo', type: 'board',
      desc: 'Terminaste tu combo. No todo se juega igual: hay que decidir qué queda en el campo, qué se guarda y qué ya no sirve.',
      scenario: 'Es tu Main Phase 1, vas primero, y acabas de terminar tu línea de combo. Estas son las 5 piezas que te quedaron en la mano. Coloca cada una donde corresponda antes de pasar el turno.',
      board: {
          hand: [
    { iid: 'c1', label: 'Baronne de Fleur',            imgId: 84815190, desc: 'Monstruo protector que resultó de tu combo — necesitas que quede en el campo.' },
    { iid: 'c2', label: 'I:P Masquerena',              imgId: 65741786, desc: 'Segundo cuerpo protector del combo — también debe quedar en el campo.' },
    { iid: 'c3', label: 'Infinite Impermanence',       imgId: 10045474, desc: 'Una interrupción para el turno del rival — necesitas dejarla activa en el campo.' },
    { iid: 'c4', label: 'Ash Blossom & Joyous Spring', imgId: 14558127, desc: 'No la necesitaste este turno — consérvala en mano para el turno del rival.' },
    { iid: 'c5', label: 'Terraforming',                imgId: 73628505, desc: 'Ya cumplió su función esta ronda — no aporta nada más si se queda en mano.' },
],
          gy: [],
      },
      solution: { c1: 'monster', c2: 'monster', c3: 'st', c4: 'hand', c5: 'gy' },
      hint: 'Pregúntate con cada carta: ¿la necesito ahora en el campo, la necesito guardada para el turno del rival, o ya no me sirve?' },
],
    },

    // ===============================
// ── Enlaces interactivos de las lecciones (cartas, decks, pestañas) ──

    openCard: function (name) {
        if (window.CardViewer?.openByName) CardViewer.openByName(name);
    },

    // subTab se resuelve según destino: 'mideck' → Deck.switchMiDeckTab · 'simuladores' → Torneo.showSimTab
    goToTab: function (tab, subTab) {
        if (!window.Navigation) return;
        Navigation.showTab(tab);
        if (!subTab) return;
        setTimeout(() => {
            if (tab === 'mideck' && window.Deck?.switchMiDeckTab) Deck.switchMiDeckTab(subTab);
            else if (tab === 'simuladores' && window.Torneo?.showSimTab) Torneo.showSimTab(subTab);
        }, 60);
    },
// Abre Config, despliega la sección (si estaba cerrada) y hace scroll hasta ella.
    goToConfigSection: function (sectionId) {
        if (!window.Navigation) return;
        Navigation.showTab('config');
        setTimeout(() => {
            const sec = document.getElementById(sectionId);
            if (sec && sec.style.display === 'none' && window.Config?.toggleSection) {
                Config.toggleSection(sectionId);
                if (sectionId === 'banlist-section' && window.Banlist) Banlist.renderSection();
            }
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    },

    // Carga un deck pre-cargado por DefaultData ('Yugi - Nivel 1/2/3') en Mi Deck y navega ahí.
    tryExampleDeck: function (deckName) {
        if (!window.Deck || !window.Navigation) return;
        if (!localStorage.getItem(`deck_${deckName}`)) {
            alert(`El deck de ejemplo "${deckName}" no está disponible ahora mismo (¿fue borrado o restaurado?). Puedes armar el tuyo en Mi Deck → 📥 Importar Deck.`);
            return;
        }
        Navigation.showTab('mideck');
        setTimeout(() => {
            Deck.confirmLoadDeck(deckName);
            Deck.switchMiDeckTab?.('decklist');
        }, 60);
    },

    // ── Mini-test avanzado por lección ──
    QUIZZES: {
        'que-es-yugioh': [
            { q: '¿Con cuántos LP empieza cada jugador en un duelo estándar?',
              options: ['4000', '2000', '8000', '1000'], correct: 2,
              explain: 'Ambos jugadores inician con 8000 LP en TCG/OCG/Master Duel.' },
            { q: '¿Cuál de estas NO es una de las 3 categorías principales de carta?',
              options: ['Monstruo', 'Hechizo', 'Trampa', 'Ritual'], correct: 3,
              explain: '"Ritual" es un sub-tipo (existen Monstruos Ritual y Hechizos Rituales), no una categoría principal.' },
            { q: 'Además de reducir LP a 0, ¿qué otra condición de victoria clásica existe?',
              options: ['Ganar 3 rondas de batalla', 'Completar Exodia', 'Invocar un Ritual', 'Llenar el Extra Deck'], correct: 1,
              explain: 'Cumplir una condición especial de carta (como reunir las 5 piezas de Exodia) también gana el duelo.' },
            { q: '¿Cuál formato es 100% digital, desarrollado por Konami?',
              options: ['TCG', 'OCG', 'Master Duel', 'Genesys'], correct: 2,
              explain: 'Master Duel es el cliente digital oficial; TCG/OCG son físicos y Genesys es un formato alternativo con puntos.' },
            { q: '¿Mínimo de cartas en el Deck Principal?',
              options: ['20', '30', '40', '60'], correct: 2,
              explain: 'El Main Deck va de 40 a 60 cartas; el mínimo competitivo estándar es 40.' },
        ],
        'vocabulario-legal': [
            { q: 'Si una carta "envía" (send/mill) otra al cementerio, ¿cuenta como "destruida"?',
              options: ['Sí, siempre', 'No, son acciones distintas', 'Solo si es monstruo', 'Solo en Master Duel'], correct: 1,
              explain: 'Enviar y destruir son acciones legales distintas — un efecto que reacciona a "destrucción" no se activa si solo fue enviada.' },
            { q: 'Un efecto con "Selecciona 1 carta... y destrúyela". ¿Qué puede hacer el rival antes de que resuelva?',
              options: ['Nada, es automático', 'Remover o proteger el objetivo', 'Ganar LP extra', 'Robar una carta'], correct: 1,
              explain: 'Al tener "target", el rival tiene ventana para reaccionar sobre esa carta antes de la resolución.' },
            { q: '¿Qué pasa con el costo ya pagado si tu efecto es negado?',
              options: ['Se devuelve siempre', 'Se pierde en ambos casos (activación o efecto)', 'Solo se pierde si negaron la activación', 'Solo si negaron el efecto'], correct: 1,
              explain: 'Un costo ya pagado nunca se recupera, sin importar qué fue negado.' },
            { q: '"Tributar" es...',
              options: ['Sinónimo de destruir', 'Un costo que manda una carta al cementerio como parte de una invocación', 'Lo mismo que desterrar', 'Un tipo de Invocación Especial'], correct: 1,
              explain: 'Tributar es un costo de invocación — no es destrucción ni cuenta como "enviada por efecto".' },
            { q: '¿Qué acción saca una carta del juego SIN pasar por el cementerio?',
              options: ['Destruir', 'Enviar', 'Tributar', 'Desterrar'], correct: 3,
              explain: 'Desterrar (Banish) remueve la carta del juego directamente.' },
        ],
        'fases-del-duelo': [
            { q: '¿En qué fase robas tu carta del turno?',
              options: ['Standby Phase', 'Draw Phase', 'Main Phase 1', 'End Phase'], correct: 1,
              explain: 'La Draw Phase es la primera fase, donde robas 1 carta (salvo quien va primero en el turno 1).' },
            { q: 'El jugador que va primero en el turno 1, ¿puede atacar ese turno?',
              options: ['Sí, sin restricciones', 'No, su Battle Phase se omite', 'Solo con 1 monstruo', 'Solo con un Ritual'], correct: 1,
              explain: 'Quien va primero no roba en su primer Draw Phase ni ataca en su primera Battle Phase.' },
            { q: '¿Qué fase conviene para poner una trampa ya protegida ese mismo turno?',
              options: ['Main Phase 1', 'Battle Phase', 'Main Phase 2', 'End Phase'], correct: 2,
              explain: 'Una trampa puesta en MP2 no puede ser destruida ese turno, a diferencia de una puesta en MP1.' },
            { q: '¿Invocaciones Normales por turno según la regla base?',
              options: ['0', '1', '2', 'Ilimitadas'], correct: 1,
              explain: 'La regla base permite 1 Invocación Normal (o Set) por turno.' },
            { q: '¿En qué fase descartas si tienes más de 6 cartas en mano?',
              options: ['Main Phase 2', 'Battle Phase', 'End Phase', 'Standby Phase'], correct: 2,
              explain: 'En la End Phase ambos jugadores descartan hasta quedar con 6 cartas máximo.' },
        ],
        'tipos-cartas-basicas': [
            { q: '¿Qué diferencia a un Monstruo Normal (Vainilla) de uno de Efecto?',
              options: ['Tiene mayor Nivel', 'No tiene texto de efecto, solo ATK/DEF', 'Siempre tiene mayor ATK', 'Puede invocarse 2 veces por turno'], correct: 1,
              explain: 'Los Monstruos Normales solo tienen ATK/DEF y texto de lore — ningún efecto activable.' },
            { q: '¿Qué tipo de Hechizo puede activarse en el turno del rival si fue colocado boca abajo el turno anterior?',
              options: ['Normal', 'Continuo', 'Ritual', 'Juego Rápido (Quick-Play)'], correct: 3,
              explain: 'El Quick-Play es el único Hechizo que puede activarse en el turno del rival, y solo si se colocó boca abajo antes.' },
            { q: '¿Qué tipo de Trampa es la única que puede responder a otra Counter Trap?',
              options: ['Normal', 'Continua', 'Otra Counter Trap', 'Ninguna puede'], correct: 2,
              explain: 'Las Counter Traps son Velocidad 3 — solo otra Counter Trap puede responderles en cadena.' },
            { q: 'Colocas una trampa boca abajo en tu Main Phase 1. ¿Cuándo puede activarse (regla general)?',
              options: ['Ese mismo turno', 'Desde el turno del rival en adelante', 'Nunca', 'Solo en Battle Phase'], correct: 1,
              explain: 'Una trampa no puede activarse el mismo turno en que fue colocada — "madura" a partir del turno siguiente.' },
            { q: '¿Cuántas cartas de Campo (Field Spell) puede tener activas cada jugador al mismo tiempo?',
              options: ['0', '1', '2', 'Ilimitadas'], correct: 1,
              explain: 'Solo puede haber 1 Field Spell activa por lado del campo; activar una nueva manda la anterior al cementerio.' },
        ],
        'tipos-cartas-especiales': [
            { q: '¿Qué invocación requiere 1 Tuner + 1 o más no-Tuner cuya suma de niveles sea exacta?',
              options: ['Fusión', 'Sincronía', 'XYZ', 'Link'], correct: 1,
              explain: 'La Invocación Sincro exige que la suma de niveles de los materiales (con al menos 1 Tuner) sea exactamente igual al Nivel del Sincro.' },
            { q: '¿Qué mecánica especial se coloca en el Deck Principal en vez del Extra Deck?',
              options: ['Fusión', 'Ritual', 'XYZ', 'Péndulo'], correct: 1,
              explain: 'Los Monstruos Ritual son la única excepción — viven en el Deck Principal, no en el Extra Deck.' },
            { q: '¿Dónde quedan los materiales usados para invocar un XYZ mientras el XYZ sigue en campo?',
              options: ['Van al cementerio', 'Quedan debajo del monstruo XYZ', 'Vuelven a la mano', 'Se desx1jan del juego'], correct: 1,
              explain: 'Los materiales XYZ quedan debajo del monstruo como recurso — no van al cementerio hasta que el XYZ se destruye.' },
            { q: '¿Qué mecánica usa "Flechas" en vez de Nivel o Rango?',
              options: ['Sincronía', 'XYZ', 'Link', 'Ritual'], correct: 2,
              explain: 'Los monstruos Link no tienen Nivel ni DEF — tienen Flechas de Link que habilitan zonas del Extra Deck.' },
            { q: '¿Qué representa "Odd-Eyes Pendulum Dragon"?',
              options: ['Fusión', 'Sincronía', 'Péndulo', 'XYZ'], correct: 2,
              explain: 'Es un monstruo Péndulo icónico — su marco mitad verde/naranja lo identifica de inmediato.' },
        ],
        'valorar-carta': [
    { q: 'Según la lección, ¿cuál es la pregunta correcta al evaluar una carta?',
      options: ['¿Es fuerte?', '¿Qué trabajo hace esta carta en mi deck?', '¿Cuánto cuesta en el mercado?', '¿Es rara?'], correct: 1,
      explain: 'Una carta nunca se evalúa aislada — siempre dentro del sistema completo del deck.' },
    { q: '¿Qué función cumple una carta si "el deck casi no funciona" cuando no la robas?',
      options: ['Finalizador', 'Motor (Engine)', 'Recuperación', 'Flex'], correct: 1,
      explain: 'El Motor es la función cuya ausencia impide que el deck ejecute su plan de juego.' },
    { q: 'En el Test de 5 Preguntas, ¿qué pregunta "destruye malos hábitos" según la lección?',
      options: ['¿Cuánto ATK tiene?', '¿Qué carta sale para hacerle espacio?', '¿Es una carta nueva?', '¿La tengo en Extra Deck?'], correct: 1,
      explain: 'Decir que una carta es buena no basta — hay que poder señalar cuál de las 40 actuales es peor.' },
    { q: '¿Qué es el "costo oculto" de una carta?',
      options: ['El precio de mercado', 'La inconsistencia que genera un efecto poderoso pero muy condicionado', 'El costo de LP que paga', 'Un tipo de Trampa Continua'], correct: 1,
      explain: 'Un efecto fuerte con muchas condiciones puede valer menos en la práctica que uno modesto pero siempre disponible.' },
    { q: 'Al elegir entre dos cartas similares (ej. dos Handtraps), ¿qué NO recomienda esta lección?',
      options: ['Comparar cuál depende de menos condiciones', 'Elegir solo por cuál "se ve más poderosa" en su texto', 'Ver en qué % de manos sería una carta muerta', 'Evaluar cuál te acerca más a tu condición de victoria'], correct: 1,
      explain: 'El criterio siempre debe ser el trabajo real que cumple en tu deck, no la impresión superficial de poder.' },
],
        'estructura-efecto-carta': [
            { q: 'En "Descarta 1 carta: roba 2 cartas", ¿qué parte es el Costo?',
              options: ['"roba 2 cartas"', '"Descarta 1 carta"', 'Ambas por igual', 'Ninguna, es solo Efecto'], correct: 1,
              explain: 'Todo lo que va ANTES de los dos puntos y se paga de inmediato es el Costo — aquí, descartar 1 carta.' },
            { q: 'Si tu efecto es negado después de pagar el costo, ¿recuperas lo que pagaste?',
              options: ['Sí, siempre', 'No, nunca', 'Solo si niegan la activación', 'Solo si niegan el efecto'], correct: 1,
              explain: 'Un costo ya pagado nunca se devuelve, sin importar qué parte del efecto haya sido negada.' },
            { q: '¿Qué palabra clave indica que un efecto es opcional?',
              options: ['Must (debes)', 'You can (puedes)', 'Always (siempre)', 'Never (nunca)'], correct: 1,
              explain: '"You can" / "Puedes" marca que no estás obligado a activar ni resolver esa parte del efecto.' },
            { q: 'Si un efecto dice "hasta el final de este turno", ¿qué parte estás identificando?',
              options: ['Costo', 'Requisito', 'Duración', 'Restricción'], correct: 2,
              explain: 'La Duración indica por cuánto tiempo se mantiene un efecto aplicado antes de expirar.' },
            { q: 'Un efecto dice "Selecciona 1 carta...". ¿Qué le permite hacer esto al rival antes de que resuelva?',
              options: ['Nada', 'Reaccionar o remover el objetivo', 'Ganar LP', 'Robar una carta extra'], correct: 1,
              explain: 'Tener "target" abre una ventana de reacción — el rival puede proteger o mover esa carta específica.' },
        ],
        'funciones-de-las-cartas': [
            { q: '¿Qué puede hacer un Extender que un Starter no puede?',
              options: ['Iniciar el combo sin ayuda', 'Continuar el combo después de que ya está en marcha', 'Buscar cartas del deck', 'Ser indestructible'], correct: 1,
              explain: 'El Extender no inicia la línea por sí solo, pero permite seguir el combo si el starter fue negado.' },
            { q: '¿Cuál es el problema de tener demasiados Garnets en un deck?',
              options: ['Suben el costo del deck', 'Son cartas muertas en mano si no se buscan', 'Solo funcionan en Extra Deck', 'Niegan tus propios efectos'], correct: 1,
              explain: 'Un Garnet no aporta nada por sí mismo en mano — depende 100% de ser buscado por otro efecto.' },
            { q: '¿Qué caracteriza a una Handtrap frente a otras interrupciones?',
              options: ['Necesita estar en el campo para activarse', 'Se activa desde la mano en respuesta al rival', 'Solo funciona en tu propio turno', 'Es siempre una carta Trampa'], correct: 1,
              explain: 'Las Handtraps son monstruos que activan su efecto directamente desde la mano — no requieren estar en campo.' },
            { q: '¿Cuándo se usa principalmente un Boardbreaker?',
              options: ['Jugando de primero para armar el endboard', 'Jugando de segundo para destruir el campo ya construido del rival', 'Solo en el Side Deck', 'Nunca, es un rol obsoleto'], correct: 1,
              explain: 'Los Boardbreakers brillan yendo de segundo: su función es destruir o neutralizar lo que el rival ya armó.' },
            { q: 'Según las 4 funciones universales, ¿cuál corresponde a un Handtrap que niega la activación de una carta rival?',
              options: ['Motor', 'Interacción', 'Ventaja de Recursos', 'Ninguna'], correct: 1,
              explain: 'Negar o responder a la jugada del rival es la función de Interacción — la categoría de Handtraps y Boardbreakers.' },
        ],
        'palabras-tecnicas-juego': [
            { q: '¿Qué distingue a un efecto "floater" (flotante)?',
              options: ['Solo funciona si está en el cementerio', 'Se activa incluso cuando la carta sale del campo, generando valor pese a la remoción', 'Nunca puede ser destruido', 'Requiere 2 tributos para activarse'], correct: 1,
              explain: 'Un floater da valor precisamente cuando deja el campo (destruido, tributado, usado como material) — remover la carta no elimina su aporte.' },
            { q: 'Además de quitar un monstruo del campo, ¿para qué se usa comúnmente un "bounce" sobre tu propia carta?',
              options: ['Para reiniciar el LP del duelo', 'Para reutilizar un efecto que se dispara al ser invocada (recursión)', 'Para cambiarla de posición de batalla sin gastar recursos', 'Para evitar pagar su costo de invocación original'], correct: 1,
              explain: 'Regresar tu propia carta a la mano permite volver a invocarla y disparar de nuevo efectos "al ser invocada".' },
            { q: 'Un efecto rival selecciona ("target") tu monstruo para destruirlo. ¿Qué es "esquivar" (dodge) esa remoción?',
              options: ['Sumar LP antes de que resuelva', 'Quitar tu propio monstruo del campo (bounce, tributo, material) antes de que el efecto resuelva, dejándolo sin objetivo válido', 'Declarar Chain Block antes que el rival', 'Robar una carta extra en Draw Phase'], correct: 1,
              explain: 'Si el objetivo ya no está en el campo cuando el efecto intenta resolver, falla por falta de objetivo válido ("whiff").' },
            { q: '¿Qué diferencia clave hay entre "bounce" y "destruir" en cuanto a los disparadores que activan?',
              options: ['Ninguna, son sinónimos', 'Bounce regresa la carta a la mano (recuperable); destruir la manda al cementerio y puede activar efectos "si es destruida"', 'Bounce solo aplica a Hechizos y Trampas', 'Destruir siempre cuesta una carta adicional'], correct: 1,
              explain: 'Son acciones legales distintas (ver Vocabulario Legal del Juego): cada una activa disparadores diferentes.' },
            { q: '¿Por qué el "Estado del Juego" importa más que el poder bruto (ATK/DEF) de una carta aislada?',
              options: ['Porque el ATK nunca influye en el resultado', 'Porque la jugada correcta depende del contexto completo (mano, campo, LP, recursos, fase), no solo de una carta aislada', 'Porque las Trampas siempre superan a los Monstruos', 'Porque el Estado del Juego solo aplica en Master Duel'], correct: 1,
              explain: 'La misma carta puede ser correcta o un error según el contexto completo del duelo en ese momento.' },
        ],
        'mentalidad-del-jugador': [
            { q: '¿Qué significa la mentalidad "las cartas no se evalúan solas"?',
              options: ['Se evalúan por su rareza', 'Se evalúan en conjunto con el resto del deck y su plan de juego', 'Solo importan en el Side Deck', 'Se evalúan por su ATK'], correct: 1,
              explain: 'Una carta poderosa puede arruinar un deck si contradice su estrategia — el contexto siempre importa.' },
            { q: '¿Qué significa "gusto vs conveniencia" en un deck competitivo?',
              options: ['Nunca puedes tener un deck de gusto', 'Si buscas competir, la conveniencia (lo funcional) debe pesar más que el gusto', 'Son lo mismo siempre', 'Solo aplica al Extra Deck'], correct: 1,
              explain: 'Puedes tener decks de gusto y competitivos, pero en el de torneo las decisiones deben ser funcionales.' },
            { q: '¿Qué NO puedes maximizar al mismo tiempo según esta lección?',
              options: ['Consistencia y Potencia', 'ATK y DEF', 'Nivel y Rango', 'Main Deck y Extra Deck'], correct: 0,
              explain: 'Consistencia vs Potencia siempre implica una elección estratégica según lo que tu deck necesita.' },
            { q: '¿Puede un deck no-meta ganarle a un deck meta?',
              options: ['Nunca', 'Sí en una partida puntual, pero le falta consistencia a 7+ rondas', 'Solo con más copias de una carta', 'Solo en Master Duel'], correct: 1,
              explain: 'Un deck no-meta puede vencer en una partida, pero sostener eso en un torneo largo requiere mucho más conocimiento.' },
            { q: 'Si vas ganando el duelo, ¿qué recomienda la mentalidad correcta?',
              options: ['Arriesgar todo para terminar rápido', 'Jugar seguro y no exponerte a riesgos innecesarios', 'Activar todos tus efectos sin pensar', 'Rendirte'], correct: 1,
              explain: 'Si vas ganando, jugar seguro protege tu ventaja; el riesgo se asume cuando vas perdiendo.' },
        ],
        'elegir-construir-deck': [
            { q: '¿Qué es el "Core" de un deck?',
              options: ['Cartas genéricas de cualquier formato', 'Las cartas que definen al arquetipo, irremplazables', 'Solo las Handtraps', 'El Extra Deck completo'], correct: 1,
              explain: 'Sin las cartas Core, el deck deja de ser el arquetipo — por eso van en 3 copias siempre que se pueda.' },
            { q: '¿Qué diferencia a una Tech Card de una carta Non-Engine estándar?',
              options: ['La Tech Card es siempre Staple', 'Ataca una amenaza específica del meta local, a veces en 1 copia', 'No hay diferencia', 'Va obligatoriamente en el Extra Deck'], correct: 1,
              explain: 'La Tech Card es una respuesta puntual a algo que ves en tu meta local, no una inclusión genérica.' },
            { q: 'Al construir desde cero, ¿por dónde se empieza según el proceso de esta lección?',
              options: ['Por el non-engine', 'Por el endboard/plan de juego, trabajando hacia atrás', 'Por el Side Deck', 'Por el precio de las cartas'], correct: 1,
              explain: 'Defines primero qué quieres tener en campo al final del combo, y desde ahí armas el engine necesario.' },
            { q: 'Con 3 copias de una carta en un deck de 40, ¿qué probabilidad aproximada hay de abrirla en la mano inicial de 5?',
              options: ['~11%', '~21%', '~30%', '~50%'], correct: 2,
              explain: '3 copias en 40 cartas dan aproximadamente 30% de probabilidad de abrir al menos 1 copia en la mano inicial.' },
            { q: '¿Cuántos duelos mínimo sugiere esta lección probar un deck en simulador antes de invertir en él?',
              options: ['1 duelo', 'Al menos 10 duelos', '100 duelos', 'No hace falta probarlo'], correct: 1,
              explain: 'Probarlo al menos 10 duelos te da una muestra real de cómo se siente jugarlo antes de gastar dinero.' },
        ],
        'staples-formato': [
            { q: '¿Qué hace que una carta sea Staple?',
              options: ['Ser la carta más fuerte del juego', 'Ser útil de forma generalizada, sin depender de un arquetipo', 'Solo servir en un arquetipo específico', 'Estar prohibida en TCG'], correct: 1,
              explain: 'Un Staple es versátil y funciona en la mayoría de los decks — no es exclusivo de un arquetipo.' },
            { q: '¿Cuál Handtrap niega efectos que buscan, roban o invocan especialmente desde el deck?',
              options: ['Effect Veiler', 'Ash Blossom & Joyous Spring', 'D.D. Crow', 'Maxx "C"'], correct: 1,
              explain: 'Ash Blossom & Joyous Spring es de las Handtraps más versátiles por cubrir 3 tipos de efecto distintos.' },
            { q: '¿Qué hace Crossout Designator?',
              options: ['Destruye todos los monstruos rivales', 'Declara un nombre de carta en tu deck y niega efectos de cartas con ese nombre ese turno', 'Roba 2 cartas', 'Niega solo Trampas Counter'], correct: 1,
              explain: 'Es una respuesta genérica a casi cualquier Handtrap, siempre que tengas una copia de ese nombre en tu deck.' },
            { q: '¿Cuándo conviene usar un Boardbreaker como Raigeki o Lightning Storm?',
              options: ['Siempre en tu primer turno', 'Cuando vas segundo y el rival ya construyó su campo', 'Solo en el Side Deck', 'Nunca, están prohibidos'], correct: 1,
              explain: 'Los Boardbreakers están pensados para destruir un campo ya armado — brillan yendo de segundo.' },
            { q: 'Antes de meter un Staple "porque es bueno", ¿qué deberías preguntarte según esta lección?',
              options: ['Nada, siempre se incluye', 'Si su efecto sirve en el meta actual y no rompe tu propio combo', 'Si es la carta más cara del set', 'Si tiene buena ilustración'], correct: 1,
              explain: 'Un Staple mal incluido, que rompe tu propio combo, es peor que no incluirlo.' },
        ],
        'pet-deck-dominar': [
    { q: 'Según la analogía del ajedrez, ¿qué logra fijar un solo deck durante mucho tiempo?',
      options: ['Aburrir al jugador', 'Aislar los errores como errores de decisión puros, no de falta de experiencia', 'Reducir el número de partidas posibles', 'Nada relevante para el nivel competitivo'], correct: 1,
      explain: 'Al eliminar la variable "cambiar de deck", los errores que quedan son de razonamiento, que es lo que realmente se puede corregir.' },
    { q: '¿Cuál es la diferencia clave entre "jugar" un deck y "pilotarlo"?',
      options: ['No hay ninguna diferencia real', 'Pilotarlo implica conocer líneas alternativas y matchups específicos, no solo el combo principal', 'Pilotar significa tener más copias del deck', 'Jugarlo es más rápido que pilotarlo'], correct: 1,
      explain: 'Pilotar implica profundidad de decisión: saber qué hacer cuando el plan A falla, no solo ejecutar el combo ideal.' },
    { q: '¿Contra qué matchups recomienda la lección practicar con más repetición?',
      options: ['Contra los que ya dominas', 'Contra los 2-3 arquetipos donde peor te va', 'Solo contra bots', 'Contra cualquier deck al azar'], correct: 1,
      explain: 'El mayor aprendizaje viene de repetir el matchup más difícil, no de reforzar lo que ya sabes hacer bien.' },
    { q: '¿Cómo se mide el dominio real de un pet deck, según la lección?',
      options: ['Por cuántas gemas se gastaron en él', 'Con métricas concretas: Winrate, Brick Rate, Nivel como Piloto a lo largo del tiempo', 'Solo por la opinión de otros jugadores', 'No se puede medir, es subjetivo'], correct: 1,
      explain: 'El progreso real debe reflejarse en números que mejoran con el tiempo, no solo en una sensación de comodidad.' },
    { q: '¿Qué se recomienda confirmar ANTES de comprometerse a dominar un deck?',
      options: ['Que sea el deck más caro del meta', 'Que realmente disfrutes jugarlo y que su Complejidad sea la que estás dispuesto a asumir', 'Que tenga el mayor ATK posible', 'Que no tenga ninguna Handtrap'], correct: 1,
      explain: 'Comprometerse con el deck equivocado hace que la inversión de tiempo en dominarlo se sienta como una carga, no como progreso.' },
],
        'anatomia-deck-competitivo': [
            { q: '¿Qué mide el eje "Engine — Consistencia"?',
              options: ['Qué tan poderoso es el endboard', 'Qué tan probable es armar la estrategia desde la mano inicial', 'Cuántas Handtraps tiene el rival', 'El precio del deck'], correct: 1,
              explain: 'Consistencia mide la probabilidad de abrir con al menos 1 Starter y ejecutar tu plan de juego.' },
            { q: '¿Qué significa que un deck sea "Glass Cannon"?',
              options: ['Que tiene mucho Floor', 'Que tiene alto Techo de Poder pero baja Resiliencia — interrumpido, queda muerto', 'Que es muy barato', 'Que no tiene engine'], correct: 1,
              explain: 'Sin Floor, una sola interrupción del rival deja al deck sin ningún plan B.' },
            { q: '¿Qué son las "cartas multifuncionales" según esta lección?',
              options: ['Cartas prohibidas', 'Cartas que cumplen más de un rol (ej. Starter y Extender) según el contexto', 'Cartas que solo sirven en el Extra Deck', 'Cartas sin efecto'], correct: 1,
              explain: 'Reducen el tamaño efectivo del engine sin perder funciones — son muy valiosas para el espacio del deck.' },
            { q: '¿Qué pregunta corresponde al eje "Fragilidad / Choke Point"?',
              options: ['¿Cuánto cuesta el deck?', '¿Qué carta del meta me destruye completamente?', '¿Cuántas copias tengo de mi Starter?', '¿Cuál es mi Boss Monster?'], correct: 1,
              explain: 'Fragilidad mide qué tan vulnerable es el deck a una sola carta o combo específico del rival.' },
            { q: 'Según el Consejo Clave, ¿qué determina realmente si un deck es competitivo?',
              options: ['Solo el techo de poder', 'El balance entre los 6 ejes, no solo el poder bruto', 'La cantidad de Staples', 'El nombre del arquetipo'], correct: 1,
              explain: 'Un deck con techo altísimo pero Floor bajo pierde igual contra un rival que estudió sus debilidades.' },
        ],
        'debilidades-deck': [
            { q: '¿Qué es un "Single Point of Failure" en el diseño de un arquetipo?',
              options: ['Una carta prohibida', 'Una única pieza de la que depende todo el combo, sin redundancia ni buscador alternativo', 'El monstruo con más ATK del deck', 'Una carta que solo sirve en el Side Deck'], correct: 1,
              explain: 'Si esa única pieza es negada, desterrada o no aparece en mano, el deck entero se detiene — es la debilidad de diseño más peligrosa.' },
            { q: '¿Por qué un combo con muchos pasos (5+) suele ser más débil que uno corto, aunque termine en el mismo endboard?',
              options: ['Porque tarda más en jugarse', 'Porque cada paso es un Choke Point donde una sola Handtrap puede romper toda la línea', 'Porque usa más cartas del Extra Deck', 'Los combos largos siempre son mejores'], correct: 1,
              explain: 'Cada eslabón adicional del combo es una ventana extra donde el rival puede negar y detener todo lo que viene después.' },
            { q: '¿Qué señala que un deck tiene "Garnets" en exceso?',
              options: ['Que tiene muchas Handtraps', 'Que carga cartas situacionales que son inútiles en la mano inicial y solo sirven combadas con otra pieza específica', 'Que tiene un buen Techo de Poder', 'Que el Extra Deck está lleno'], correct: 1,
              explain: 'Un Garnet en la mano inicial (sin la pieza que lo activa) es una carta muerta — reducirlos al mínimo mejora la Consistencia real.' },
            { q: 'Un deck sin ningún Extender ni forma de responder tras una Handtrap del rival es...',
              options: ['Un deck de control', 'Un "Glass Cannon" — techo alto pero Floor nulo, muere a la primera interrupción', 'Un deck con buen Grind Game', 'Un deck imposible de construir'], correct: 1,
              explain: 'Sin Resiliencia (Floor), basta 1 sola negación bien puesta para dejar al jugador sin plan alguno.' },
            { q: '¿Qué hace especialmente débil a un arquetipo frente al meta según esta lección?',
              options: ['Tener pocas cartas de Extra Deck', 'Que exista 1 sola carta común del formato que anule su plan de juego por completo, sin alternativa', 'Que sea un arquetipo nuevo', 'Que tenga Field Spell'], correct: 1,
              explain: 'Un Choke Point tan amplio como "1 carta me gana el duelo" es la máxima expresión de Fragilidad — el rival ni siquiera necesita tech específica.' },
        ],
        'secuenciacion': [
    { q: '¿Cuál es la pregunta que hace un jugador de nivel Master antes de jugar su mejor carta?',
      options: ['¿Cómo la juego más rápido?', '¿Qué quiero averiguar antes de comprometerla?', '¿Cuánto ATK tiene?', '¿Puedo jugarla dos veces?'], correct: 1,
      explain: 'La secuenciación empieza por decidir qué información necesitas antes de exponer tu pieza más valiosa.' },
    { q: '¿Qué es una "carta de prueba"?',
      options: ['Una carta prohibida en torneo', 'Una carta de valor medio jugada primero para hacer hablar al rival', 'Una carta que solo funciona en Master Duel', 'Un tipo de Handtrap específico'], correct: 1,
      explain: 'Si el rival gasta una negación importante sobre ella, obtienes información valiosa antes de arriesgar tu pieza clave.' },
    { q: 'Según la lección, ¿cuál es el error del 90% de los jugadores con una mano de 2 motores, 1 extensor, 1 handtrap y 1 buscador?',
      options: ['No jugar ninguna carta', 'Empezar con el motor más fuerte sin evaluar alternativas', 'Guardar todo para el turno 2', 'Usar la Handtrap primero'], correct: 1,
      explain: 'Muchas veces conviene más empezar con la jugada menos comprometida para observar la respuesta del rival.' },
    { q: '¿Qué distingue a una "amenaza latente" de una "amenaza inmediata"?',
      options: ['La latente no existe realmente', 'La latente no hace nada ahora pero será un problema en turnos siguientes', 'Son exactamente lo mismo', 'La latente solo aplica en GOAT Format'], correct: 1,
      explain: 'Los jugadores promedio ignoran las amenazas latentes; los buenos las identifican antes de que crezcan.' },
    { q: 'Al leer manos por deducción, ¿qué logras cuando el rival no usa Ash Blossom en tu buscador?',
      options: ['Saber con certeza que no la tiene', 'Reducir las posibilidades de lo que tiene en mano, sin certeza absoluta', 'Nada, es información inútil', 'Confirmar que ganaste el duelo'], correct: 1,
      explain: 'No es certeza total, pero reduces el abanico de posibilidades de forma significativa — de 100 opciones a unas pocas.' },
],
        'optimizar-deck': [
            { q: '¿Cuál es la señal de que te falta Consistencia?',
              options: ['El endboard es débil', 'Brickeas frecuentemente o hay turnos sin nada que hacer', 'Pierdes contra la misma jugada repetida', 'Tienes demasiados Handtraps'], correct: 1,
              explain: 'Brickear seguido es la señal clásica de un problema de Consistencia, no de Potencia ni Defensa.' },
            { q: '¿Qué tipo de optimización corresponde a "agregar protecciones al Boss Monster"?',
              options: ['Consistencia', 'Techo de Poder (Endboard)', 'Defensa', 'Versatilidad'], correct: 1,
              explain: 'Reforzar el endboard para que sea más difícil de romper es optimización de Techo de Poder.' },
            { q: 'Según el proceso de optimización, ¿cuántos cambios deberías probar a la vez?',
              options: ['Todos los que se te ocurran', 'Uno a la vez, para saber qué causó qué', 'Ninguno, se prueba el deck completo', 'Solo cambios de Extra Deck'], correct: 1,
              explain: 'Un cambio = una variable. Cambiar varias cosas a la vez impide saber qué funcionó.' },
            { q: '¿Cuántas partidas mínimo sugiere esta lección para evaluar un cambio correctamente?',
              options: ['1-2', '10-15', '50', 'No hace falta jugarlas'], correct: 1,
              explain: 'Menos de 10-15 partidas no es una muestra confiable para juzgar si un cambio funcionó.' },
            { q: '¿Por qué la optimización "nunca termina" según el Consejo Clave?',
              options: ['Porque siempre hay más dinero que gastar', 'Porque el meta cambia constantemente', 'Porque las cartas se dañan', 'Porque el Extra Deck es ilimitado'], correct: 1,
              explain: 'Un deck optimizado para el meta de hace 3 meses puede ser mediocre hoy — el meta nunca es estático.' },
        ],
        'cadenas-prioridad': [
            { q: '¿Puede un efecto de Velocidad 2 responder a uno de Velocidad 3?',
              options: ['Sí, siempre', 'No, una cadena solo puede subir de velocidad, nunca bajar', 'Solo si es una Handtrap', 'Solo en el turno propio'], correct: 1,
              explain: 'Solo una Counter Trap (Velocidad 3) puede responder a otra Velocidad 3.' },
            { q: '¿Qué tipo de efecto NO puede activarse como respuesta directa a otro efecto?',
              options: ['Quick Effect', 'Ignition Effect', 'Trigger Effect obligatorio', 'Trampa Normal'], correct: 1,
              explain: 'El Ignition Effect es Velocidad 1 — solo se activa voluntariamente en una ventana abierta de tu turno.' },
            { q: 'En una cadena, ¿en qué orden se resuelven los efectos?',
              options: ['En el orden en que se activaron (FIFO)', 'Al revés — el último activado resuelve primero (LIFO)', 'Todos a la vez', 'Lo decide un dado'], correct: 1,
              explain: 'LIFO: Last In, First Out. El último eslabón agregado resuelve primero.' },
            { q: 'Si el eslabón 1 (el efecto original) de una cadena es negado, ¿qué pasa con el resto?',
              options: ['Se cancela toda la cadena', 'Resuelve igual desde el eslabón más alto hacia abajo', 'Se repite desde el inicio', 'Ambos jugadores pierden el turno'], correct: 1,
              explain: 'Negar el eslabón 1 no cancela la cadena completa — el resto resuelve normalmente.' },
            { q: '¿Cuándo se abre una ventana de interacción?',
              options: ['Solo en la End Phase', 'Cuando el jugador activo activa un efecto, invoca, o hace una acción visible', 'Nunca, siempre puedes activar lo que quieras', 'Solo si tienes una Trampa boca abajo'], correct: 1,
              explain: 'La ventana se abre con cualquier acción del jugador activo — activación, invocación o acción visible.' },
        ],
        'equilibrio-deck': [
    { q: '¿Cuál es el enfoque correcto para juzgar si tienes "demasiadas" Handtraps?',
      options: ['Contar el número absoluto de copias', 'Ver el porcentaje del deck que ocupan y qué le restaron al engine', 'Nunca se puede tener demasiadas Handtraps', 'Depende solo del precio de las cartas'], correct: 1,
      explain: 'Un número absoluto no dice nada por sí solo — importa qué proporción del deck ocupa y qué sacrificaste por ello.' },
    { q: '¿Qué problema genera un exceso de Boardbreakers en un deck que suele ir primero?',
      options: ['Ninguno, siempre son útiles', 'Se vuelven cartas muertas en mano la mayoría de las partidas', 'Bajan el Internal Score automáticamente', 'Solo afectan en Master Duel'], correct: 1,
      explain: 'Los Boardbreakers brillan yendo segundo — un exceso en un deck que va primero resta espacio útil sin retorno frecuente.' },
    { q: 'Según la lección, ¿qué es tan problemático como un exceso de un rol?',
      options: ['Tener 40 cartas exactas', 'Tener 0 copias de un rol crítico (ej. 0 Extenders)', 'Jugar solo un arquetipo', 'Usar el Buscador de la app'], correct: 1,
      explain: 'El desbalance tiene dos direcciones: exceso y ausencia total de un rol necesario son la misma falla, en sentido contrario.' },
    { q: '¿Cuál es la pregunta recomendada para detectar una copia sobrante de un rol?',
      options: ['¿Cuánto cuesta la carta?', '¿Qué perdería realmente si sacara 1 copia de este rol?', '¿Es una carta rara?', '¿La usa el meta actual?'], correct: 1,
      explain: 'Si sacar una copia no cambia casi nada porque ya hay redundancia, ese espacio probablemente rinde más en otro rol.' },
    { q: '¿Existe una proporción universal correcta de Starters/Extenders/Handtraps para todo deck?',
      options: ['Sí, siempre 4/4/9', 'No, depende de la identidad del deck y el meta que enfrenta', 'Sí, la que usa el deck top 1 del formato', 'No importa, cualquier proporción funciona igual'], correct: 1,
      explain: 'Un deck combo largo, uno lineal y uno de control tienen necesidades de balance distintas — no hay fórmula fija.' },
],
        'rulings-invocaciones': [
            { q: '¿Qué diferencia a una Invocación Inherente de una Invocación por Efecto?',
              options: ['No hay diferencia', 'La Inherente ocurre por las reglas del juego; la de Efecto la realiza un efecto de carta y no puede negarse la invocación misma', 'La de Efecto siempre es más fuerte', 'La Inherente solo aplica a Fusión'], correct: 1,
              explain: 'Solo puedes "negar la invocación" cuando es Inherente — una invocación por efecto ya resolvió cuando ocurre.' },
            { q: 'Si niegan una invocación con Solemn Warning, ¿se activan los efectos "si fue invocado exitosamente"?',
              options: ['Sí, siempre', 'No — la invocación negada nunca llegó al campo', 'Solo si es un Sincro', 'Solo en el turno del rival'], correct: 1,
              explain: 'Una invocación negada nunca ocurrió legalmente — los triggers de invocación exitosa no se activan.' },
            { q: '¿Qué pasa con los materiales ya enviados si la invocación resultante es negada?',
              options: ['Regresan a la mano', 'No regresan — se van al cementerio normalmente', 'Vuelven al Extra Deck', 'Se destierran automáticamente'], correct: 1,
              explain: 'La negación aplica al monstruo invocado, no a los materiales ya gastados como costo.' },
            { q: '¿Dónde están los materiales de un monstruo XYZ mientras este sigue en campo?',
              options: ['En el cementerio', 'Adjuntos debajo del monstruo, no en el cementerio', 'En el Extra Deck', 'Desterrados'], correct: 1,
              explain: 'Los materiales XYZ quedan "adjuntos" — los efectos de cementerio no los pueden tocar mientras estén ahí.' },
            { q: '¿Qué ocurre con un Token cuando sale del campo?',
              options: ['Va al cementerio', 'Va al Extra Deck', 'Desaparece — no va al cementerio ni al deck', 'Vuelve a la mano'], correct: 2,
              explain: 'Los Tokens dejan de existir al salir del campo; nunca ocupan cementerio, deck ni Extra Deck.' },
        ],
        'rulings-batalla': [
            { q: '¿Cuándo ocurre un "Replay"?',
              options: ['Cuando el Damage Step termina', 'Cuando el objetivo de un ataque desaparece durante el Battle Step, antes del Damage Step', 'Cuando ambos monstruos tienen el mismo ATK', 'Cuando activas una Trampa Counter'], correct: 1,
              explain: 'El Replay solo ocurre en el Battle Step; si el objetivo ya desapareció dentro del Damage Step, no hay Replay.' },
            { q: '¿Qué tipo de cartas pueden activarse normalmente durante el Damage Step?',
              options: ['Cualquier Trampa Normal', 'Casi ninguna Handtrap ni Trampa Normal — solo efectos Vel.2+ que modifiquen ATK/DEF, los que digan "durante el Damage Step", y Counter Traps', 'Solo Hechizos Rápidos', 'Solo Ignition Effects'], correct: 1,
              explain: 'El Damage Step tiene restricciones muy específicas sobre qué puede activarse.' },
            { q: '¿Qué diferencia hay entre Daño de Batalla y Daño de Efecto?',
              options: ['Son lo mismo siempre', 'El de batalla ocurre por combate y puede negarse con cartas de batalla; el de efecto lo inflige una carta directamente', 'El de efecto solo ocurre en la Battle Phase', 'El de batalla nunca puede negarse'], correct: 1,
              explain: 'Una carta que protege de "daño de batalla" no detiene el "daño de efecto" y viceversa.' },
            { q: 'Si el objetivo de tu ataque desaparece DENTRO del Damage Step, ¿qué pasa?',
              options: ['Se activa un Replay', 'El ataque continúa pero no inflige daño de batalla', 'El atacante vuelve a la mano', 'El duelo termina'], correct: 1,
              explain: 'El Replay solo aplica en el Battle Step, no dentro del Damage Step.' },
            { q: '¿Qué recomienda el Consejo Clave sobre declarar un ataque?',
              options: ['Pasar directo al cálculo de daño sin avisar', 'Anunciar el ataque y esperar antes de pasar al Damage Step', 'Nunca anunciar nada', 'Solo anunciar si el rival lo pide'], correct: 1,
              explain: 'Esa pausa es la ventana legal del rival para responder antes del cálculo de daño.' },
        ],
        'if-when-timing': [
            { q: '¿Qué diferencia principal hay entre WHEN e IF?',
              options: ['Son exactamente lo mismo', 'WHEN exige que el evento sea "lo último que pasó" o se pierde el timing; IF es más flexible', 'IF siempre es mandatorio', 'WHEN nunca puede perder el timing'], correct: 1,
              explain: 'WHEN es mucho más estricto en su ventana de activación que IF.' },
            { q: '¿Un efecto mandatorio (sin "you can") puede perder el timing?',
              options: ['Sí, siempre', 'No, nunca — se activa si la condición ocurre', 'Solo si es WHEN', 'Solo si es IF'], correct: 1,
              explain: 'Los efectos mandatorios no dependen de la ventana de la misma forma que los opcionales.' },
            { q: 'Si "WHEN X: you can do Y" y X no fue lo último que pasó, ¿qué ocurre?',
              options: ['Se activa igual', 'El efecto "miss the timing" y no puede activarse', 'Se activa automáticamente sin elegir', 'Se convierte en IF'], correct: 1,
              explain: 'Perder el timing significa que la ventana específica de WHEN ya se cerró.' },
            { q: '¿Qué permite un efecto que dice "Each Time"?',
              options: ['Activarse solo 1 vez por turno', 'Activarse múltiples veces en el mismo turno si la condición se repite', 'Nunca activarse en el turno del rival', 'Negar cualquier efecto'], correct: 1,
              explain: '"Each Time" no tiene límite implícito de una vez por turno.' },
            { q: 'En la ventana tras resolver una cadena, ¿qué se activa primero?',
              options: ['Los Quick Effects', 'Los efectos mandatorios', 'Los triggers opcionales del rival', 'Se decide al azar'], correct: 1,
              explain: 'El orden de prioridad siempre pone primero los efectos mandatorios.' },
        ],
        'leer-campo-oponente': [
            { q: '¿Qué indica que el oponente tenga 5+ cartas en mano al inicio de su turno?',
              options: ['Mano débil, sin opciones', 'Mano llena, posibles múltiples Handtraps o combo completo', 'Que ya perdió el duelo', 'Que no tiene backrow'], correct: 1,
              explain: 'Una mano llena es señal de más recursos y más amenazas potenciales.' },
            { q: 'Si el oponente pasó su turno sin activar nada en el tuyo, ¿qué sugiere la lección?',
              options: ['Que definitivamente no tiene nada', 'Que probablemente no tiene Handtraps, o guarda algo específico', 'Que ganó el duelo', 'Que debes rendirte'], correct: 1,
              explain: 'No es garantía absoluta, pero es información deducida útil para tu siguiente jugada.' },
            { q: '¿Qué es un "cebo" al leer el campo?',
              options: ['La carta más poderosa de tu combo', 'Activar primero la carta menos crítica para hacer gastar la Handtrap rival antes de tu pieza clave', 'Un tipo de Trampa Counter', 'Un monstruo Token'], correct: 1,
              explain: 'El cebo protege tu pieza clave forzando al rival a gastar su interrupción antes de tiempo.' },
            { q: '¿Cuál es la pregunta más poderosa según el Consejo Clave de esta lección?',
              options: ['¿Cuánto ATK tiene su monstruo?', '¿Qué necesita hacer el oponente en este turno para ganar?', '¿Cuántas cartas tiene en el Extra Deck?', '¿De qué color es su mazo?'], correct: 1,
              explain: 'Saber qué necesita el rival te permite enfocar tus recursos exactamente en negarlo.' },
            { q: '¿Qué error común señala esta lección sobre leer el campo?',
              options: ['Observar demasiado al rival', 'Asumir que tiene la misma carta que te ganó una vez antes, sin evidencia en este duelo', 'Analizar rápido y actuar', 'Ignorar el backrow'], correct: 1,
              explain: 'Cada duelo es nuevo — la experiencia informa pero no determina lo que el rival tiene ahora.' },
        ],
        'gestion-lp-recursos': [
            { q: '¿Qué son realmente los LP según esta lección?',
              options: ['El objetivo final del duelo', 'Un recurso que se invierte para ganar ventaja, no algo a proteger a toda costa', 'Algo que nunca debes gastar', 'Solo importan en Master Duel'], correct: 1,
              explain: 'Pagar LP por la jugada correcta suele ser mejor inversión que evitarlo por miedo.' },
            { q: '¿Cuándo NO vale la pena pagar LP según la lección?',
              options: ['Cuando niegas algo irrecuperable', 'Cuando estás en 2000 LP o menos y el gasto no da ventaja concreta', 'Cuando vas ganando cómodo', 'Nunca vale la pena pagar LP'], correct: 1,
              explain: 'En rango de LP bajo, cada pago sin ventaja concreta te acerca más a perder.' },
            { q: '¿Qué es "Hand Advantage" según esta lección?',
              options: ['Tener más cartas en mano siempre es mejor sin importar cuáles', 'Tener más cartas que el rival, aunque calidad importa más que cantidad', 'Solo aplica al Extra Deck', 'Nunca es relevante'], correct: 1,
              explain: '5 cartas malas valen menos que 2 cartas buenas — calidad sobre cantidad.' },
            { q: '¿Qué error señala la lección sobre "sobreconstruir el campo"?',
              options: ['Invocar monstruos de más gasta recursos que podrías necesitar después', 'Nunca hay que invocar más de 1 monstruo', 'Es obligatorio llenar todo el campo', 'El campo no consume recursos'], correct: 0,
              explain: 'Cada monstruo adicional invocado sin necesidad es un recurso gastado de más.' },
            { q: 'Según el Consejo Clave, ¿qué deberías preguntarte al final de cada turno?',
              options: ['¿Gané ya?', '¿Tengo más, menos o igual cantidad de recursos que al inicio de mi turno?', '¿Cuánto ATK tiene mi monstruo?', '¿Debo rendirme?'], correct: 1,
              explain: 'Ser consistentemente "outresourced" turno a turno es la señal de que algo debe cambiar.' },
        ],
        'formatos-diferencias': [
            { q: '¿Qué regla base rige el Formato Avanzado (TCG/OCG) actual?',
              options: ['Master Rule 3', 'Master Rule 5 (vigente desde 2020)', 'GOAT Rules', 'No tiene reglas fijas'], correct: 1,
              explain: 'La Master Rule 5 introdujo las Extra Monster Zones y sigue vigente en el formato moderno.' },
            { q: '¿La banlist de TCG y OCG es la misma?',
              options: ['Sí, siempre idéntica', 'No, son diferentes — una carta prohibida en TCG puede estar libre en OCG', 'Solo cambia el idioma', 'OCG no tiene banlist'], correct: 1,
              explain: 'Konami gestiona banlists separadas para cada región.' },
            { q: '¿Cómo construyes un deck en Genesys Format?',
              options: ['Con banlist normal de TCG', 'Sin banlist — cada carta tiene un valor en puntos y hay un presupuesto máximo', 'Solo con cartas GOAT', 'Con Extra Deck ilimitado'], correct: 1,
              explain: 'Genesys reemplaza la banlist por un sistema de puntos con presupuesto máximo.' },
            { q: '¿Qué caracteriza al GOAT Format?',
              options: ['Usa Master Rule 5 completa', 'Simula el meta de 2005: sin Extra Monster Zones, sin Links/Sincro/XYZ/Péndulo', 'Es el formato más nuevo', 'Solo existe en Master Duel'], correct: 1,
              explain: 'GOAT usa reglas y cardpool de una época específica, previa a las mecánicas modernas.' },
            { q: '¿Qué prevalece si una carta antigua tiene texto distinto al actual (errata)?',
              options: ['El texto de la impresión más antigua', 'El texto oficial más reciente según Konami', 'Lo que diga el juez local sin revisar nada', 'Ambos textos aplican a la vez'], correct: 1,
              explain: 'Siempre aplica el ruling oficial más reciente, sin importar qué diga la impresión física.' },
        ],
        'side-deck': [
            { q: '¿Cuántas cartas puede tener el Side Deck como máximo?',
              options: ['5', '10', '15', '20'], correct: 2,
              explain: 'El Side Deck tiene un máximo de 15 cartas, igual que el límite del Extra Deck.' },
            { q: '¿En qué punto del match puedes usar el Side Deck?',
              options: ['Antes de la partida 1', 'Entre partidas 2 y 3, no antes de la 1', 'En cualquier momento incluso a mitad de partida', 'Solo si pierdes la partida 1'], correct: 1,
              explain: 'El siding ocurre exclusivamente entre partidas del mismo match, nunca antes de la primera.' },
            { q: '¿Qué debe mantenerse constante entre partidas al sidear?',
              options: ['El orden de las cartas', 'La cantidad total de cartas en Main Deck y Extra Deck', 'El nombre del deck', 'El color de las cartas'], correct: 1,
              explain: 'Puedes cambiar qué cartas están, pero el conteo total de Main y Extra debe ser el mismo.' },
            { q: 'Según el proceso de esta lección, ¿qué deberías identificar primero al construir tu Side Deck?',
              options: ['Las cartas más caras del mercado', 'Los 3-4 decks más comunes de tu meta local', 'Solo cartas Prohibidas', 'El Extra Deck del rival'], correct: 1,
              explain: 'El Side Deck se construye pensando en el meta local real, no en el meta genérico de internet.' },
            { q: '¿Qué recomienda el Consejo Clave sobre el mejor Side Deck?',
              options: ['El que tiene las cartas más poderosas en general', 'El que tiene cartas específicas y pensadas para lo que vas a enfrentar', 'El que nunca cambia entre partidas', 'El que copia el de un pro sin adaptarlo'], correct: 1,
              explain: '15 cartas específicas para tu meta local superan a 15 Staples genéricos.' },
        ],
        'bo1-vs-bo3': [
    { q: '¿Qué característica tiene Bo1 (Master Duel Ranked) que no tiene Bo3?',
      options: ['Side Deck disponible', 'Ningún ajuste posible entre partidas — es un ambiente ciego', 'Partidas ilimitadas', 'Elección de quién va primero siempre'], correct: 1,
      explain: 'En Bo1 no hay Game 2/3 ni Side Deck: la lista con la que empiezas es la única disponible.' },
    { q: '¿Por qué el tech card muy específico pierde valor relativo en Bo1?',
      options: ['Porque está prohibido en Ranked', 'Porque puede ser carta muerta en la mayoría de tus duelos, al no haber Side Deck para reservarlo', 'Porque cuesta más gemas', 'Porque no se puede jugar en Extra Deck'], correct: 1,
      explain: 'Sin Side Deck, cada carta del Main debe defenderse en todos los matchups posibles, no solo en el ideal.' },
    { q: '¿Qué ventaja da el formato Bo3 que no existe en Bo1?',
      options: ['Mazos ilimitados', 'Poder observar la lista del rival en Game 1 y ajustar con el Side Deck', 'Jugar siempre de primero', 'Cartas prohibidas habilitadas'], correct: 1,
      explain: 'El Side Deck permite corregir matchups específicos después de ver qué juega el rival.' },
    { q: 'Según la lección, ¿qué tipo de cartas conviene priorizar en un Main Deck pensado para Bo1?',
      options: ['Solo tech extremadamente específico', 'Cartas genéricas y flexibles (rol Flex)', 'Solo cartas caras', 'Cartas prohibidas en Banlist'], correct: 1,
      explain: 'Sin oportunidad de ajustar, las cartas versátiles rinden mejor contra el pool completo de rivales posibles.' },
    { q: '¿Qué recomienda la lección antes de copiar una lista de internet?',
      options: ['Nada, cualquier lista sirve igual en cualquier formato', 'Confirmar para qué formato (Bo1 o Bo3) fue diseñada originalmente', 'Solo copiarla si es del Tier 1', 'Ignorar el Side Deck siempre'], correct: 1,
      explain: 'Una lista pensada para Ranked suele ser más segura/genérica que una pensada para torneo físico con Side.' },
],
'practicar-evento': [
    { q: '¿Qué caracteriza a una buena rutina de práctica pre-torneo, según la lección?',
      options: ['Jugar solo contra bots fáciles', 'Practicar contra las listas más probables del meta, bajo presión real', 'Evitar jugar de segundo', 'Cambiar la lista constantemente hasta el día del evento'], correct: 1,
      explain: 'Practicar contra amenazas realistas y en ambos turnos es lo que realmente prepara para el torneo.' },
    { q: '¿Qué significa "congelar la lista"?',
      options: ['Guardarla en el navegador', 'Fijar un punto de corte para dejar de tocar el Main Deck antes del evento', 'Prohibir jugar con ella', 'Eliminarla al terminar el torneo'], correct: 1,
      explain: 'Cambiar cartas hasta último momento genera un deck que nunca se practicó realmente.' },
    { q: 'En el Método AAR, ¿cuál de estas NO es una de las 5 preguntas post-duelo?',
      options: ['¿Cuál era mi plan al empezar?', '¿Qué decisión me dio más dudas?', '¿Cuánto ATK tenía mi monstruo más fuerte?', 'Si jugara otra vez, ¿qué haría diferente?'], correct: 2,
      explain: 'El AAR se enfoca en el proceso de decisión, no en estadísticas de cartas individuales.' },
    { q: '¿Cuál es el objetivo real de practicar antes de un evento, según la lección?',
      options: ['Ganar el 100% de las prácticas', 'Descubrir fallas de decisión antes de que cuesten un torneo real', 'Memorizar el combo más largo posible', 'Evitar jugar contra rivales fuertes'], correct: 1,
      explain: 'Si nunca pierdes en la práctica, probablemente no estás practicando contra la presión correcta.' },
    { q: '¿Por qué es importante practicar tanto yendo primero como yendo segundo?',
      options: ['Es una regla obligatoria del torneo', 'Muchos jugadores solo ensayan ir primero y llegan sin plan real yendo segundo', 'Yendo segundo nunca importa', 'Solo aplica en Master Duel'], correct: 1,
      explain: 'Un plan de juego incompleto para uno de los dos turnos es una de las causas más comunes de derrotas evitables.' },
],
        'meta-tiers': [
            { q: '¿Cuál es la diferencia principal entre "Meta global" y "Meta local"?',
              options: ['No hay diferencia', 'El Meta local refleja lo que realmente juega tu región/tienda, el global es la referencia mundial', 'El Meta global siempre es más útil para el Side Deck', 'El Meta local nunca cambia'], correct: 1,
              explain: 'Para preparar un evento específico, el Meta local (lo que tu mesa realmente juega) suele ser más accionable que el Meta global.' },
            { q: '¿Qué indica "presencia sin conversión" en un arquetipo?',
              options: ['Que domina el formato', 'Que es popular pero no necesariamente fuerte, pues pocos llegan a Top Cut con él', 'Que está prohibido', 'Que no existe en el meta'], correct: 1,
              explain: 'Meta Share alto pero baja conversión a Top Cut sugiere un deck jugado por su popularidad, no por su rendimiento real.' },
            { q: 'Según la "relevancia de atención", ¿qué matchup merece máxima prioridad de preparación?',
              options: ['Baja presencia y ya eres fuerte contra él', 'Alta presencia y eres débil contra él', 'Cualquier deck Tier 3', 'Ninguno, se prepara todo por igual'], correct: 1,
              explain: 'Alta probabilidad de encontrarlo + mal matchup es la combinación que más partidas te puede costar si se ignora.' },
            { q: '¿Qué mide la "conversión" de un arquetipo en el análisis de Tiers?',
              options: ['Cuántas copias tiene cada carta', 'De los jugadores que lo usan, cuántos llegan a premiar/Top Cut', 'El precio de mercado del deck', 'Su nivel de complejidad de piloto'], correct: 1,
              explain: 'La conversión conecta presencia con resultados reales: cuántos de los que juegan ese deck efectivamente ganan.' },
            { q: 'En Destiny Draw!, ¿qué botón recalcula el Top Tier y el Poder de Cartas del meta importado?',
              options: ['Guardar Deck', 'Actualizar Data', 'Restaurar Configuración', 'Exportar Reporte'], correct: 1,
              explain: '"Actualizar Data" descarga cartas faltantes y recalcula de una vez los scores de Decks del Meta y el Poder de Cartas del Meta.' },
        ],
        'estructura-arquetipos': [
            { q: '¿Cuál es la diferencia oficial entre "Arquetipo" y "Serie" en Yu-Gi-Oh!?',
              options: ['No hay diferencia, son sinónimos', 'Un Arquetipo comparte el mismo nombre/término tratado como tal en el texto; una Serie comparte solo un tema sin ese requisito', 'Una Serie siempre tiene más cartas que un Arquetipo', 'Un Arquetipo solo puede tener monstruos'], correct: 1,
              explain: 'El Arquetipo exige nombre compartido o texto que las declare "tratadas como" tal; una Serie es solo una relación temática, sin ese requisito.' },
            { q: '¿Cuál es la función típica del Hechizo de Campo de un arquetipo nuevo?',
              options: ['Solo sube el ATK de los monstruos', 'Resumir la mecánica del arquetipo y buscar la pieza que falta', 'Prohibir invocaciones especiales del rival', 'Sustituir al As del arquetipo'], correct: 1,
              explain: 'El Field Spell suele ser la carta más clara para entender de un vistazo qué hace el arquetipo y qué busca.' },
            { q: '¿Para qué sirve un "Hard Once Per Turn" en el diseño de un arquetipo?',
              options: ['Para hacer la carta más fuerte', 'Para limitar cuántas veces se repite un mismo efecto en el turno, sin importar la fuente, evitando loops infinitos', 'Para que la carta no pueda destruirse', 'Para permitir usar el efecto en el turno rival'], correct: 1,
              explain: 'El Hard OPT es una válvula de balance: limita la repetición del mismo efecto sin importar cuántas copias distintas lo generen.' },
            { q: 'Al leer un arquetipo nuevo, ¿qué carta conviene identificar primero según el checklist de esta lección?',
              options: ['La carta más cara del mercado', 'El Hechizo de Campo o la primera carta de soporte revelada', 'Cualquier carta al azar de la lista', 'Solo el As, ignorando el resto'], correct: 1,
              explain: 'El Field Spell (o la primera carta de soporte) suele resumir la mecánica y el objetivo de búsqueda antes que ninguna otra carta.' },
            { q: '¿Qué identifica normalmente al "As" (Boss Monster) de un arquetipo?',
              options: ['Es el monstruo más barato de invocar', 'Suele dar nombre al arquetipo y requiere la Invocación más compleja o de mayor Nivel/Rango', 'Siempre es una Magia Continua', 'Nunca aparece en el arte de portada del producto'], correct: 1,
              explain: 'El As casi siempre da nombre al arquetipo y representa el punto más alto de la curva de invocación del mazo.' },
        ],
    },

    // ── Test Teórico Avanzado — situaciones de torneo ──
    TEST_QUESTIONS: {
        'test-rulings-torneo': [
            { q: '¿Puedes activar una Trampa durante tu propia Battle Phase, si la seteaste en tu Main Phase 1 de ese mismo turno?',
              scenario: 'Seteas una Trampa Normal en Main Phase 1. Nada la remueve. Avanzas a tu Battle Phase, mismo turno.',
              options: ['Sí, porque ya es una fase distinta', 'No, no puede activarse durante el turno en que fue seteada', 'Sí, pero solo si es Trampa Continua', 'Solo si el rival declara un ataque'], correct: 1,
              explain: 'La restricción "no se puede activar el turno en que fue seteada" es por turno completo, no por fase — Main Phase o Battle Phase da igual.' },
            { q: '¿Qué ocurre con tu ataque?',
              scenario: 'Declaras ataque contra el único monstruo boca arriba del rival. Antes de la Damage Step, el rival devuelve ese monstruo a la mano con un efecto.',
              options: ['Se cancela sin más', 'Ocurre un Battle Replay: puedes elegir un nuevo objetivo, atacar directo o no atacar', 'El ataque golpea directo a LP automáticamente', 'Pierdes la Battle Phase completa'], correct: 1,
              explain: 'Al desaparecer el objetivo original antes de la Damage Step se dispara un Battle Replay: el atacante decide si redirige el ataque, ataca directo (si no quedan monstruos) o cancela.' },
            { q: '¿Qué pasa con la carta que descartaste como costo?',
              scenario: 'Activas una carta cuyo costo es descartar 1 carta de tu mano. El rival responde con una Trampa de Contraataque que niega la activación y la destruye.',
              options: ['Vuelve a tu mano porque la activación fue negada', 'Se queda en el Cementerio; los costos nunca se recuperan por una negación', 'Se destierra en vez de ir al Cementerio', 'Puedes elegir si se recupera o no'], correct: 1,
              explain: 'Los costos se pagan en el momento de la activación, antes de cualquier ventana de negación. Ninguna negación revierte un costo ya pagado.' },
            { q: '¿Qué sucede con los 2 monstruos usados como material?',
              scenario: 'Intentas una Invocación de Sincronía usando 2 monstruos como material. El rival activa una Trampa de Contraataque que niega esa Invocación.',
              options: ['Vuelven al campo en Posición de Ataque', 'Se quedan en el Cementerio; los materiales no vuelven aunque se niegue la Invocación', 'Vuelven a la mano de su dueño', 'Permanecen desterrados hasta el End Phase'], correct: 1,
              explain: 'Los materiales se envían al Cementerio como parte del procedimiento de invocación, antes de que la Invocación en sí resuelva. Negar la Invocación evita que el monstruo salga, pero no revierte el uso de los materiales.' },
            { q: '¿Puede la segunda copia en campo usar el mismo efecto este mismo turno?',
              scenario: 'Controlas 2 copias de un monstruo cuyo efecto dice: "Solo puedes usar este efecto de \'Carta X\' una vez por turno." Ya usaste ese efecto con la primera copia este turno.',
              options: ["Sí, cada copia tiene su propio 'una vez por turno'", 'No, la restricción menciona el nombre de la carta y aplica a todas las copias por igual (Hard OPT)', 'Sí, pero solo si la primera fue negada', 'Depende de si están en la misma columna'], correct: 1,
              explain: 'Cuando el texto dice "una vez por turno" + nombre de carta específico, la restricción es por NOMBRE (Hard OPT) y cubre todas las copias. Sin el nombre, sería una restricción por copia individual (Soft OPT).' },
            { q: '¿En qué orden se resuelven ambos efectos Trigger?',
              scenario: 'Activas una Trampa que destruye simultáneamente 1 monstruo tuyo y 1 del rival. Ambos tienen un Trigger opcional "Cuando esta carta es destruida y enviada al Cementerio: [efecto]".',
              options: ['En el orden en que fueron destruidos físicamente', 'El jugador en turno decide el orden de ambos', 'Tu efecto entra primero a la cadena y el del rival se añade después, así que el del rival resuelve primero (LIFO)', 'Ambos resuelven simultáneamente sin cadena'], correct: 2,
              explain: 'Por SEGOC (Simultaneous Effects Go On Chain): el jugador en turno coloca primero sus triggers simultáneos, luego el rival añade los suyos por encima. Como la cadena resuelve en orden inverso, el efecto del NO-turno resuelve primero.' },
            { q: '¿Puede el rival responder con un efecto de Velocidad de Conjuro 2 inmediatamente después de tu Invocación Normal?',
              scenario: 'Haces tu Invocación Normal en Main Phase 1 y quieres pasar directo a Battle Phase.',
              options: ['No, solo puede responder en su propio turno', 'Sí, ambos jugadores reciben una ventana de prioridad después de cada acción antes de continuar', 'Solo si tú activas otra carta primero', 'No, las Invocaciones Normales no dan prioridad al rival'], correct: 1,
              explain: 'Después de cualquier acción del juego, incluida una Invocación Normal, ambos jugadores reciben prioridad antes de que el turno continúe.' },
            { q: '¿Cuándo puedes activar ese Hechizo Rápido?',
              scenario: 'Tienes un Hechizo Rápido en la mano; nunca fue seteado.',
              options: ['Solo en tu propia Main Phase, como cualquier Hechizo', 'En cualquier momento en que tengas prioridad, en cualquier turno — igual que una Trampa', 'Solo si primero lo seteas un turno', 'Nunca puede activarse desde la mano'], correct: 1,
              explain: 'La restricción de "turno en que fue seteado" solo aplica a cartas que estuvieron Set. Activado directo desde la mano, un Hechizo Rápido se comporta como Velocidad de Conjuro 2 en cualquier ventana de prioridad.' },
            { q: '¿Puede el rival activar esa Trampa Normal genérica en ese momento?',
              scenario: 'Declaras ataque y entras a la Damage Step. Antes del cálculo de daño, el rival intenta activar una Trampa Normal genérica (sin texto que mencione la Damage Step) para destruir tu atacante.',
              options: ['Sí, cualquier Trampa puede activarse en cualquier momento de la batalla', 'No, durante la Damage Step solo se permiten cartas cuyo texto indique explícitamente que pueden usarse ahí', 'Solo si la Trampa es de Contraataque', 'Solo si el atacante tiene menos ATK que el defensor'], correct: 1,
              explain: 'La Damage Step restringe activaciones: solo se permite lo que el texto de la carta habilite explícitamente para ese momento. Una Trampa genérica sin esa cláusula debía activarse antes, durante el Battle Step.' },
            { q: '¿Se activa el efecto Trigger de tu monstruo?',
              scenario: 'Controlas un monstruo con "Cuando esta carta es enviada al Cementerio: [efecto]". El rival lo destierra DIRECTAMENTE desde el campo, sin mencionar enviarlo antes al Cementerio.',
              options: ['Sí, desterrar siempre cuenta como ser enviado al Cementerio', 'No — si nunca fue enviado al Cementerio, un trigger que exige exactamente eso no se activa', 'Solo si el monstruo es Effect Monster', 'Depende del ATK del monstruo'], correct: 1,
              explain: 'Desterrar y enviar al Cementerio son destinos distintos. Sí se activaría si el efecto dijera "en vez de enviarla al Cementerio, destiérrala", porque ahí se trata como si hubiese sido enviada.' },
            { q: '¿Qué pasa con esa Trampa Continua del rival?',
              scenario: 'El rival controla una Trampa Continua ya resuelta en el campo. Activas una carta que "niega los efectos de 1 carta boca arriba en el campo" (no dice "niega la activación").',
              options: ['Se destruye y va al Cementerio de inmediato', 'Se queda en el campo boca arriba, pero sin efecto mientras dure la negación', 'Vuelve a la mano del rival', 'Se destierra automáticamente'], correct: 1,
              explain: 'Negar el EFECTO deja la carta físicamente en el campo, ya resuelta, solo inactiva mientras la negación esté vigente. Negar la ACTIVACIÓN es distinto: ahí la carta ni siquiera llega a resolver y va al Cementerio.' },
            { q: '¿Puedes activarlo?',
              scenario: 'Tu monstruo tiene un Trigger opcional "Cuando esta carta sea destruida por batalla y enviada al Cementerio: puedes Invocar de Especial...". Es destruido en batalla. En vez de resolverlo de inmediato, activas y resuelves primero otra carta tuya sin relación. Después intentas activar el trigger.',
              options: ['Sí, mientras sigas en la misma Battle Phase puedes activarlo cuando quieras', "No — al dejar pasar la primera oportunidad para resolver algo no relacionado, el trigger 'perdió el timing' y ya no puede activarse ese turno", 'Sí, pero solo en tu próxima Main Phase', 'No, nunca más en el resto de la partida'], correct: 1,
              explain: 'Un Trigger opcional debe activarse en la primera oportunidad disponible. Elegir resolver otra acción no relacionada en su lugar causa Missing the Timing: el efecto queda inutilizable el resto del turno.' },
            { q: '¿Sobrevive tu monstruo?',
              scenario: 'Tu monstruo tiene "Esta carta no puede ser destruida por batalla". El rival activa Raigeki (destruye todos tus monstruos por efecto, sin batalla).',
              options: ['Sí, porque tiene inmunidad a destrucción', "No — la inmunidad dice 'por batalla'; Raigeki destruye por efecto, así que no aplica", 'Sí, porque Raigeki no hace target', 'Depende de si está en Posición de Defensa'], correct: 1,
              explain: 'El texto de protección importa literal: "no destruida por batalla" no cubre destrucción por efecto de carta. Solo un "no destruida por efectos de cartas" protegería contra Raigeki.' },
            { q: '¿En qué orden resuelven los 3 eslabones de la cadena?',
              scenario: 'Chain Link 1: activas la carta A. Chain Link 2 (respuesta): el rival activa B. Chain Link 3 (respuesta a B): activas C.',
              options: ['A, luego B, luego C', 'C, luego B, luego A (orden inverso — LIFO)', 'B, luego A, luego C', 'Resuelven todas a la vez'], correct: 1,
              explain: 'Las cadenas resuelven en orden inverso al de activación (LIFO): el último eslabón activado resuelve primero.' },
            { q: '¿Tu monstruo se salva por su protección anti-target?',
              scenario: 'Tu monstruo tiene "no puede ser elegido como objetivo por efectos de cartas del rival". El rival activa Dark Hole (destruye todos los monstruos en el campo, sin hacer target a ninguno).',
              options: ['Sí, la protección anti-target lo salva de cualquier carta del rival', 'No — Dark Hole no hace target a nadie en específico, así que esa protección no aplica y el monstruo es destruido igual', 'Solo se salva si es el único monstruo en el campo', 'Se salva solo si está boca abajo'], correct: 1,
              explain: '"No puede ser elegido como objetivo" solo protege de efectos que targetean esa carta específicamente. Efectos masivos como Dark Hole o Raigeki afectan "todos los monstruos" como categoría, sin target — la protección no aplica.' },
        ],
    },

    _renderQuiz: function (topicId) {
        const qs = this.QUIZZES[topicId];
        if (!qs || !qs.length) return '';
        return `
            <div class="form-quiz" id="quiz-${topicId}">
                ${qs.map((item, qi) => `
                    <div class="form-quiz-q">
                        <p class="form-quiz-question">${qi + 1}. ${item.q}</p>
                        <div class="form-quiz-opts">
                            ${item.options.map((op, oi) => `
                                <label class="form-quiz-opt">
                                    <input type="radio" name="quiz-${topicId}-${qi}" value="${oi}">
                                    <span>${op}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="form-quiz-feedback" id="quiz-${topicId}-${qi}-fb"></div>
                    </div>
                `).join('')}
                <button class="form-quiz-check-btn" onclick="Formacion.checkQuiz('${topicId}')">✅ Corregir Respuestas</button>
                <div class="form-quiz-score" id="quiz-${topicId}-score"></div>
            </div>
        `;
    },
// ── Historia del Meta (TCG / OCG / Mundiales) ──────────────
META_HISTORY: {
        tcg: [
            { period: '2002 – 2004', title: 'Chaos Control / Yata-Garasu', desc: 'Formato definido por Chaos Emperor Dragon, Yata-Garasu y Imperial Order — partidas cortas resueltas por ventaja de recursos brutal antes de que la Lista Prohibida golpeara fuerte estas piezas.', decks: 'Chaos Control, Yata-lock' },
            { period: '2005 – 2006', title: 'Goat Format', desc: 'El formato más nostálgico y todavía jugado hoy como modalidad retro. Ritmo lento, control de campo con Monarchs tempranos, Scapegoat y trampas de respuesta.', decks: 'Metamorphosis, Magician of Faith, Exiled Force, Scapegoat, Mystic Tomato' },
            { period: '2006 – 2008', title: 'Era de los Monarcas', desc: 'Sin Chaos dominando, los Monarchs (Caius, Raiza, Mobius) se vuelven el pilar de control de campo y ventaja de cartas del formato.', decks: 'Monarchs, Destiny Hero' },
            { period: '2008 – 2011', title: 'Era Synchro', desc: 'Llegada de la Extra Deck Synchro (5D\'s). El formato acelera con extensores y bosses de nivel 8, y aparecen los primeros OTK consistentes vía Synchron.', decks: 'Dark Armed Dragon, Six Samurai, Blackwing, Plants, Turbo/Formula Synchron' },
            { period: '2011 – 2013', title: 'Inzektor, Dino Rabbit, Wind-Up', desc: 'Combos explosivos de bajo costo de recursos previos a Pendulum; alto poder por carta individual con menos piezas necesarias para armar un tablero fuerte.', decks: 'Inzektor, Dino Rabbit, Wind-Up' },
            { period: '2013 – 2014', title: 'Dragon Rulers', desc: 'Uno de los formatos más dominantes de la historia competitiva: ventaja de material casi gratuita vía descarte para invocar dragones nivel 7-8. Terminó en uno de los baneos más agresivos jamás aplicados.', decks: 'Dragon Ruler' },
            { period: '2014 – 2015', title: 'Burning Abyss / Shaddoll / Qliphort', desc: 'Formato de mid-range consistente, con menos combos explosivos y más intercambio de recursos e interacción.', decks: 'Burning Abyss, Shaddoll, Qliphort' },
            { period: '2015 – 2017', title: 'Era Pendulum', desc: 'Cambio de paradigma: invocación Péndulo permite armar tableros enormes en un solo turno. Formato de alta velocidad hasta que Pendulum recibe baneos severos.', decks: 'Performapal/Odd-Eyes, Kozmo, Metalfoes' },
            { period: '2017 – 2019', title: 'Llegada de los Links (Master Rule 4)', desc: 'Nueva mecánica Link reestructura por completo la Extra Deck: solo se permite 1 monstruo Link antes de acceder a Fusión/Synchro/Xyz. Formato de alta interacción y negación.', decks: 'SPYRAL, Orcust, Salamangreat, Zoodiac' },
            { period: '2019 – 2020', title: 'Master Rule 5', desc: 'Regreso de las Zonas de Monstruo Extra (2, compartidas), corrigiendo la rigidez de Master Rule 4. Formato de control de campo y grind mid-range.', decks: 'Eldlich, Adamancipator, Dragon Link' },
            { period: '2020 – 2022', title: 'Pandemia / Torneos Online', desc: 'Sin eventos presenciales grandes durante la pandemia; el metagame se define en gran parte por Master Duel (lanzado 2022) y torneos online.', decks: 'Tri-Brigade, Drytron, Virtual World, Springans' },
            { period: '2022 – 2023', title: 'Kashtira, Tearlaments, Spright', desc: 'Formato de altísima interacción: combos de cementerio, negaciones en cadena y decks capaces de ganar desde la mano del rival.', decks: 'Kashtira, Tearlaments, Spright, Purrely, Branded Despia' },
            { period: '2023 – 2025', title: 'Snake-Eye / Fiendsmith / Yubel', desc: 'Dominancia de arquetipos de Fusión/Link rápida sostenidos por handtraps genéricos como pilar constante del formato (Ash Blossom, Nibiru, Effect Veiler).', decks: 'Snake-Eye, Fiendsmith, Yubel, Ryzeal' },
        ],
        ocg: [
            { period: '2002 – 2005', title: 'Era temprana / Chaos', desc: 'Paralelo al TCG pero con acceso más temprano a las mismas piezas (Chaos Emperor Dragon, Yata-Garasu); Japón define gran parte del metagame mundial en esta era.', decks: 'Chaos Control' },
            { period: '2005 – 2008', title: 'Monarcas / Control de campo', desc: 'Igual que TCG pero con card pool más amplio antes por diferencia de releases entre regiones.', decks: 'Monarchs, Dark World' },
            { period: '2008 – 2012', title: 'Synchro temprano', desc: 'OCG suele recibir los arquetipos Synchro con semanas/meses de anticipación al TCG, marcando tendencia sobre qué se banea después en occidente.', decks: 'Six Samurai, Blackwing, Plants' },
            { period: '2015 – 2017', title: 'Pendulum OCG', desc: 'Igual que TCG, pero el impacto de Pendulum se siente primero en Japón, generando los baneos que luego llegan a TCG.', decks: 'Performapal, Kozmo' },
            { period: '2019 – 2021', title: 'Numeron / Virtual World / Adamancipator', desc: 'Formatos de combo extremo, algunos nunca tan dominantes en TCG por diferencias de banlist regional.', decks: 'Numeron, Virtual World, Adamancipator' },
            { period: '2024', title: 'Tenpai Dragon', desc: 'Uno de los OTK/board-building más opresivos que ha visto el OCG en años recientes — dominó torneos antes de su lanzamiento en TCG y recibió un baneo severo casi inmediato.', decks: 'Tenpai Dragon' },
            { period: '2024 – 2025', title: 'Fiendsmith / Yubel / Snake-Eye (OCG)', desc: 'Meta compartido con TCG pero con timing de banlist distinto — el OCG suele reaccionar más rápido y agresivo a formatos dominantes.', decks: 'Fiendsmith, Yubel, Snake-Eye' },
        ],md: [
            { period: 'Ene 2022', title: 'Lanzamiento', desc: 'Master Duel se lanza el 19 de enero de 2022 como simulador oficial gratuito con más de 10.000 cartas disponibles desde el día uno. El meta inicial hereda gran parte del formato TCG/OCG de ese momento.', decks: 'Adamancipator, Eldlich, Sky Striker, Tri-Brigade/Lyrilusc ("Bird-Up"), Virtual World, Drytron' },
            { period: '2022', title: 'Primer año — expansión y primeros hits', desc: 'El pool de cartas crece con nuevos packs y Konami aplica su propia banlist de Master Duel, con timing separado de la banlist de papel — un mismo período puede tener metas distintos entre TCG/OCG físico y Master Duel.', decks: 'Kashtira, Tearlaments, Branded Despia, Spright, Purrely' },
            { period: '2023', title: 'Snake-Eye y el techo de poder sube', desc: 'Snake-Eye se vuelve uno de los arquetipos más dominantes que ha tenido el juego, tanto en papel como en Master Duel, forzando baneos agresivos.', decks: 'Snake-Eye, Kashtira, Branded' },
            { period: '2024', title: 'Fiendsmith / Yubel', desc: 'Dominancia sostenida de estrategias de Fusión/Link rápida apoyadas en handtraps genéricos como pilar constante del ladder competitivo.', decks: 'Fiendsmith, Yubel, Ryzeal' },
            { period: '2025', title: 'Kashtira y Branded Despia vuelven al frente', desc: 'Tras varias rondas de banlist, el ladder de Master Duel se estabiliza con estos dos arquetipos como referentes, además de opciones más accesibles para F2P como Sky Striker y Labrynth.', decks: 'Kashtira, Branded Despia, Sky Striker, Labrynth' },
            { period: 'Dic 2025 – Ene 2026', title: 'Aerial Superiority / Season 49', desc: 'Actualización de banlist tras el pack "Aerial Superiority Selection" reordena el tier list de nuevo — el ladder de Master Duel sigue moviéndose cada 1-2 meses con cada banlist o pack nuevo.', decks: 'Meta en movimiento — consultar tier list vigente' },
        ],
        mdChampions: [
            { year: 2025, team: 'Ragnarok', players: 'Antonio "N3sh" Papa (Italia), Herman "Mist" Hansson (Suecia), Luka Forjan (Croacia)' },
            { year: 2023, team: 'snipehunters', players: 'Josh, QuantalThink, Emre — primeros campeones mundiales de Master Duel (formato 3v3, inaugurado en WCS 2023)' },
        ],
        worlds: [
            { year: 2025, champion: 'Julien Leo Kehon', country: 'Estados Unidos', deck: 'K9 Vanquish Soul' },
            { year: 2024, champion: 'Ruben Andres Penaranda', country: 'Estados Unidos', deck: 'Fiendsmith Yubel' },
            { year: 2023, champion: 'Paul Stephen Aronson', country: 'Estados Unidos', deck: 'Bystial Dragon Link' },
            { year: 2019, champion: 'Kosaka Kouki', country: 'Japón', deck: 'Salamangreat' },
            { year: 2018, champion: 'Wang Chia Ching', country: 'Taipéi Chino', deck: 'Trickstar' },
            { year: 2017, champion: 'Tsujimura Ryosuke', country: 'Japón', deck: 'True King Yang Zing Dinosaur' },
            { year: 2016, champion: 'Hiyama Shunsuke', country: 'Japón', deck: 'Blue-Eyes' },
            { year: 2015, champion: 'Hiyama Shunsuke', country: 'Japón', deck: 'Tellarknight' },
            { year: 2014, champion: 'Sehabi Kheireddine', country: 'Canadá', deck: 'Infernity' },
            { year: 2013, champion: 'Huang Shin En', country: 'Taipéi Chino', deck: 'Dragon Ruler' },
            { year: 2012, champion: 'Saito Akikazu', country: 'Japón', deck: 'Inzektor' },
            { year: 2011, champion: 'Ogawa Takashi', country: 'Japón', deck: 'Agent Fairy' },
            { year: 2010, champion: 'Galileo Mauricio De Obaldia Soza', country: 'Panamá', deck: 'Frog FTK' },
            { year: 2009, champion: 'Benjamin Tan Hong Hwee', country: 'Singapur', deck: 'Blackwing' },
            { year: 2008, champion: 'Mutsuoka Kazuki', country: 'Japón', deck: 'Gladiator Beast' },
            { year: 2007, champion: 'Patricio Andrés Toro Valenzuela', country: 'Chile', deck: 'Trooper Monarch' },
            { year: 2006, champion: 'Dario Longo', country: 'Italia', deck: 'Chaos' },
            { year: 2005, champion: 'Miltiadis Markou', country: 'Grecia', deck: 'Metamorphosis Chaos' },
            { year: 2004, champion: 'Togawa Masatoshi', country: 'Japón', deck: 'Chaos' },
            { year: 2003, champion: 'Ng Yu Leung', country: 'Hong Kong', deck: 'Hand Destruction' },
        ],
    },
    _renderHistoriaTab: function () {
        if (!this.historiaSubTab) this.historiaSubTab = 'tcg';
        const sub = this.historiaSubTab;
        return `
            <div class="form-topic-container">
                <div class="form-notebook form-notebook--test">
                    <h2 class="form-nb-title">📜 Historia del Meta</h2>
                    <p class="form-nb-text">Recorrido del metagame competitivo de Yu-Gi-Oh!, dividido en TCG, OCG y Campeonato Mundial. No existe una API para esto — es un registro curado a mano. Fechas y descripciones de eras son aproximadas (consenso de la comunidad competitiva); el listado de Mundiales sí son resultados verificados. Se puede ampliar editando <code>Formacion.META_HISTORY</code> en el código.</p>
                    <div class="form-level-nav">
                        <button class="form-level-btn${sub === 'tcg' ? ' active' : ''}" onclick="Formacion.switchHistoriaSub('tcg')">🇺🇸 TCG</button>
                        <button class="form-level-btn${sub === 'ocg' ? ' active' : ''}" onclick="Formacion.switchHistoriaSub('ocg')">🇯🇵 OCG</button>
                        <button class="form-level-btn${sub === 'md' ? ' active' : ''}" onclick="Formacion.switchHistoriaSub('md')">🎮 Master Duel</button>
                        <button class="form-level-btn${sub === 'worlds' ? ' active' : ''}" onclick="Formacion.switchHistoriaSub('worlds')">🏆 Mundiales</button>
                    </div>
                    ${sub === 'worlds' ? this._renderWorldsHistory()
                        : sub === 'md' ? this._renderEraHistory('md') + this._renderMDChampions()
                        : this._renderEraHistory(sub)}
                </div>
            </div>
        `;
    },

    switchHistoriaSub: function (sub) {
        this.historiaSubTab = sub;
        const content = document.getElementById('form-tab-content');
        if (content) content.innerHTML = this._renderCurrentTab();
    },

    _renderEraHistory: function (region) {
        const eras = this.META_HISTORY[region] || [];
        return `
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
                ${eras.map(e => `
                    <div style="border-left:3px solid #FFD700;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:0 8px 8px 0;">
                        <div style="color:#FFD700;font-size:0.75rem;font-weight:700;margin-bottom:2px;">${e.period}</div>
                        <h3 style="margin:0 0 4px;font-size:1rem;color:#eee;">${e.title}</h3>
                        <p style="margin:0;font-size:0.85rem;color:rgba(255,255,255,0.75);line-height:1.4;">${e.desc}</p>
                        ${e.decks ? `<p style="margin:6px 0 0;font-size:0.78rem;color:rgba(255,255,255,0.55);"><strong style="color:rgba(255,255,255,0.7);">Decks/cartas clave:</strong> ${e.decks}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    _renderWorldsHistory: function () {
        const rows = this.META_HISTORY.worlds;
        return `
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:12px;">
                ${rows.map(r => `
                    <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(255,255,255,0.04);border-radius:6px;flex-wrap:wrap;">
                        <span style="min-width:44px;font-weight:700;color:#FFD700;font-size:0.85rem;">${r.year}</span>
                        <span style="flex:1;font-size:0.85rem;color:#eee;">${r.champion} <em style="color:rgba(255,255,255,0.45);">(${r.country})</em></span>
                        <span style="font-size:0.8rem;color:rgba(255,255,255,0.65);">${r.deck}</span>
                    </div>
                `).join('')}
                <p style="margin-top:10px;font-size:0.78rem;color:rgba(255,255,255,0.5);">Sin edición presencial en 2020-2022 (pandemia). Fuente: resultados públicos históricos del Campeonato Mundial.</p>
            </div>
        `;
    },
    _renderMDChampions: function () {
        const rows = this.META_HISTORY.mdChampions || [];
        if (!rows.length) return '';
        return `
            <div style="margin-top:16px;">
                <h3 style="margin:0 0 8px;font-size:0.95rem;color:#FFD700;">🏆 Campeones del Mundial de Master Duel (formato 3v3)</h3>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    ${rows.map(r => `
                        <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(255,255,255,0.04);border-radius:6px;flex-wrap:wrap;">
                            <span style="min-width:44px;font-weight:700;color:#FFD700;font-size:0.85rem;">${r.year}</span>
                            <span style="flex:1;font-size:0.85rem;color:#eee;">${r.team}</span>
                            <span style="font-size:0.8rem;color:rgba(255,255,255,0.65);">${r.players}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    checkQuiz: function (topicId) {
        const qs = this.QUIZZES[topicId];
        if (!qs) return;
        let correct = 0;
        qs.forEach((item, qi) => {
            const sel = document.querySelector(`input[name="quiz-${topicId}-${qi}"]:checked`);
            const fb  = document.getElementById(`quiz-${topicId}-${qi}-fb`);
            if (!fb) return;
            if (!sel) { fb.innerHTML = '<span class="form-quiz-fb-empty">⚠ Sin responder</span>'; return; }
            const ok = parseInt(sel.value) === item.correct;
            if (ok) correct++;
            fb.innerHTML = ok
                ? `<span class="form-quiz-fb-ok">✔ Correcto — ${item.explain}</span>`
                : `<span class="form-quiz-fb-bad">✘ Incorrecto — ${item.explain}</span>`;
        });
        const scoreEl = document.getElementById(`quiz-${topicId}-score`);
        if (scoreEl) scoreEl.textContent = `Puntaje: ${correct}/${qs.length}`;
    },

    init: function () {
        this.container = document.getElementById('formacion-content');
        if (!this.container) return;
        this.render();
    },

    render: function () {
        if (!this.container) return;
        const activeTopics = this._getActiveTopics();

        this.container.innerHTML = `
            <h2>Formación</h2>

            <!-- Sub-nav estilo Simuladores -->
            <div class="form-subnav" id="form-subnav">
                <button class="form-subnav-btn${this.activeTab === 'apuntes' ? ' active' : ''}"
                        data-tab="apuntes" onclick="Formacion.switchTab('apuntes')">📓 Apuntes</button>
                <button class="form-subnav-btn form-subnav-btn--green${(this.activeTab === 'temas' || this.TOPICS.some(t => t.id === this.activeTab)) ? ' active' : ''}"
                        data-tab="temas" onclick="Formacion.switchTab('temas')">📚 Temas</button>
                <button class="form-subnav-btn${this.activeTab === 'historia' ? ' active' : ''}"
                        data-tab="historia" onclick="Formacion.switchTab('historia')">📜 Historia del Meta</button>
                <button class="form-subnav-btn form-subnav-btn--green${this.activeTab === 'test' ? ' active' : ''}"
                        data-tab="test" onclick="Formacion.switchTab('test')">🧪 Test</button>
                <button class="form-subnav-btn form-subnav-btn--green${this.activeTab === 'estilo' ? ' active' : ''}"
                        data-tab="estilo" onclick="Formacion.switchTab('estilo')">🧭 Tu Estilo</button>
                <button class="form-subnav-btn form-subnav-btn--green${this.activeTab === 'personaje' ? ' active' : ''}"
                        data-tab="personaje" onclick="Formacion.switchTab('personaje')">🎭 Tu Personaje</button>
                <button class="form-subnav-btn${this.activeTab === 'decks' ? ' active' : ''}"
                        data-tab="decks" onclick="Formacion.switchTab('decks')">🃏 Primeros Decks</button>
                <button class="form-subnav-btn${this.activeTab === 'juegos' ? ' active' : ''}"
                        data-tab="juegos" onclick="Formacion.switchTab('juegos')">🎮 Juegos</button>
                <button class="form-subnav-btn${this.activeTab === 'fuentes' ? ' active' : ''}"
                        data-tab="fuentes" onclick="Formacion.switchTab('fuentes')">🔗 Fuentes</button>
                <button class="form-subnav-btn${this.activeTab === 'maestros' ? ' active' : ''}"
                        data-tab="maestros" onclick="Formacion.switchTab('maestros')">🎓 Maestros</button>
                
            </div>

            <!-- Contenido de sub-pestañas -->
            <div id="form-tab-content">
                ${this._renderCurrentTab()}
            </div>
        `;
    },

    switchTab: function (tabId) {
        this.activeTab = tabId;
        const topic = this.TOPICS.find(t => t.id === tabId);
        if (topic) this.activeLevel = topic.level || this.activeLevel;
        const content = document.getElementById('form-tab-content');
        if (!content) return;
        content.innerHTML = this._renderCurrentTab();
        const outerKey = topic ? 'temas' : tabId;
        document.querySelectorAll('.form-subnav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === outerKey);
        });
    },

    switchLevel: function (level) {
        this.activeLevel = level;
        const current = this.TOPICS.find(t => t.id === this.activeTab);
        if (!current || current.level !== level) this.activeTab = 'temas';
        const content = document.getElementById('form-tab-content');
        if (content) content.innerHTML = this._renderCurrentTab();
    },

    _renderCurrentTab: function () {
        if (this.activeTab === 'apuntes')  return this._renderApuntesTab();
        if (this.activeTab === 'test')     return this._renderTestTab();
        if (this.activeTab === 'estilo')     return this._renderEstiloTab();
        if (this.activeTab === 'personaje')  return this._renderPersonajeTab();
        if (this.activeTab === 'decks')      return this._renderDecksTab();
        if (this.activeTab === 'juegos')     return this._renderJuegosTab();
        if (this.activeTab === 'fuentes')  return this._renderFuentesTab();
        if (this.activeTab === 'maestros') return this._renderMaestrosTab();
        if (this.activeTab === 'historia') return this._renderHistoriaTab();
        return this._renderTemasTab(); // 'temas' o cualquier id de TOPICS
    },

    _renderTemasTab: function () {
        const LEVEL_ORDER = ['Básico', 'Intermedio', 'Competitivo', 'Avanzado'];
        const LEVEL_ICONS = { 'Básico':'🌱', 'Intermedio':'⚔️', 'Competitivo':'🏆', 'Avanzado':'🔬' };
        const activeTopics  = this._getActiveTopics();
        const levelsPresent = LEVEL_ORDER.filter(lv => activeTopics.some(t => t.level === lv));
        const currentTopic  = this.TOPICS.find(t => t.id === this.activeTab);

        if (this.activeLevel == null) {
            this.activeLevel = (currentTopic && currentTopic.level) || levelsPresent[0] || 'Básico';
        }
        const topicsOfLevel = activeTopics.filter(t => t.level === this.activeLevel);

        return `
            <div class="form-level-nav">
                ${levelsPresent.map(lv => `
                    <button class="form-level-btn${this.activeLevel === lv ? ' active' : ''}"
                            onclick="Formacion.switchLevel('${lv}')">${LEVEL_ICONS[lv] || '📖'} ${lv}</button>
                `).join('')}
            </div>
            <div class="form-topics-nav">
                ${topicsOfLevel.length ? topicsOfLevel.map(t => `
                    <button class="form-topic-btn${this.activeTab === t.id ? ' active' : ''}"
                            onclick="Formacion.switchTab('${t.id}')">📖 ${t.label}</button>
                `).join('') : '<p class="form-empty">No hay lecciones activas en este nivel.</p>'}
            </div>
            ${currentTopic && currentTopic.level === this.activeLevel
                ? this._renderTopicTab(currentTopic)
                : '<p class="form-empty">Selecciona una lección arriba para comenzar.</p>'}
        `;
    },

    // ── Test (sub-tab: Teóricos / Prácticos) ──

    _renderTestTab: function () {
        if (this.activeTestCat == null) this.activeTestCat = 'teoricos';
        const testsOfCat  = [...(this.TESTS[this.activeTestCat] || []), ...TestDuelo.getByCategory(this.activeTestCat)];
        const currentTest = testsOfCat.find(t => t.id === this.activeTestId);

        return `
            <div class="form-level-nav">
                ${this.TEST_CATEGORIES.map(c => `
                    <button class="form-level-btn form-level-btn--green${this.activeTestCat === c.id ? ' active' : ''}"
                            onclick="Formacion.switchTestCat('${c.id}')">${c.icon} ${c.label}</button>
                `).join('')}
            </div>
            <div class="form-topics-nav">
                ${testsOfCat.length ? testsOfCat.map(t => `
                    <button class="form-topic-btn form-topic-btn--green${this.activeTestId === t.id ? ' active' : ''}"
                            onclick="Formacion.switchTestItem('${t.id}')">🧪 ${t.label}</button>
                `).join('') : '<p class="form-empty">Próximamente — sin tests disponibles en esta categoría.</p>'}
            </div>
            ${currentTest ? this._renderTestContent(currentTest)
                : (testsOfCat.length ? '<p class="form-empty">Selecciona un test arriba para comenzar.</p>' : '')}
        `;
    },

    switchTestCat: function (catId) {
        this.activeTestCat = catId;
        this.activeTestId  = null;
        const content = document.getElementById('form-tab-content');
        if (content) content.innerHTML = this._renderCurrentTab();
    },

    switchTestItem: function (testId) {
        this.activeTestId = testId;
        const content = document.getElementById('form-tab-content');
        if (content) content.innerHTML = this._renderCurrentTab();
    },

   _renderTestContent: function (test) {
    if (test.type === 'board') return this._renderPracticalTest(test);
    return `
        <div class="form-topic-container">
            <div class="form-notebook form-notebook--test">
                <span class="form-nb-level-badge form-nb-level-badge--green">Nivel: ${test.level || 'Avanzado'}</span>
                <h2 class="form-nb-title">${test.label}</h2>
                ${test.desc ? `<p class="form-nb-text">${test.desc}</p>` : ''}
                ${this._renderTestQuiz(test)}
            </div>
        </div>
    `;
},

    _renderTestQuiz: function (test) {
        const testId = test.id;
        const qs = test.questions || this.TEST_QUESTIONS[testId];
        if (!qs || !qs.length) return '<p class="form-empty">Preguntas próximamente.</p>';
        return `
            <div class="form-quiz form-quiz--test" id="test-${testId}">
                ${qs.map((item, qi) => {
                    const opts = item.options.map(op => typeof op === 'string' ? { text: op, card: null } : op);
                    return `
                    <div class="form-quiz-q">
                        <p class="form-quiz-question">${qi + 1}. ${item.q}</p>
                        ${item.scenario ? `<p class="form-quiz-scenario">${item.scenario}</p>` : ''}
                        ${item.card ? `<img src="https://images.ygoprodeck.com/images/cards_small/${item.card.id}.jpg"
                                            alt="${item.card.name}" style="width:64px;border-radius:4px;margin:4px 0;display:block;">` : ''}
                        <div class="form-quiz-opts">
                            ${opts.map((op, oi) => `
                                <label class="form-quiz-opt">
                                    <input type="radio" name="test-${testId}-${qi}" value="${oi}">
                                    ${op.card ? `<img src="https://images.ygoprodeck.com/images/cards_small/${op.card.id}.jpg"
                                                      alt="${op.card.name}" style="width:28px;border-radius:3px;vertical-align:middle;margin-right:6px;">` : ''}
                                    <span>${op.text}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="form-quiz-feedback" id="test-${testId}-${qi}-fb"></div>
                    </div>`;
                }).join('')}
                <button class="form-quiz-check-btn form-quiz-check-btn--green" onclick="Formacion.checkTest('${testId}')">✅ Corregir Test</button>
                <div class="form-quiz-score" id="test-${testId}-score"></div>
            </div>
        `;
    },

// ── Tu Estilo de Juego ────────────────────────────────────
    _renderEstiloTab: function () {
        const result = this.getEstiloResult();
        return `
            <div class="form-topic-container">
                <div class="form-notebook form-notebook--test">
                    <h2 class="form-nb-title">🧭 Tu Estilo de Juego</h2>
                    <p class="form-nb-text">Este test no mide conocimiento ni habilidad — explora qué es lo que realmente te atrae del juego a un nivel más instintivo, para sugerirte arquetipos que puedan encajar con tu forma natural de jugar.</p>
                    ${result ? this._renderEstiloResult(result) : this._renderEstiloQuiz()}
                </div>
            </div>`;
    },

    _renderEstiloQuiz: function () {
        return `
            <div class="form-quiz form-quiz--test festilo-quiz" id="festilo-quiz">
                ${this.ESTILO_PREGUNTAS.map((q, qi) => `
                    <div class="form-quiz-q">
                        <p class="form-quiz-question">${qi + 1}. ${q.q}</p>
                        <div class="form-quiz-opts">
                            ${q.options.map((op, oi) => `
                                <label class="form-quiz-opt">
                                    <input type="radio" name="festilo-q-${qi}" value="${oi}">
                                    <span>${op.text}</span>
                                </label>`).join('')}
                        </div>
                    </div>`).join('')}
                <button class="form-quiz-check-btn form-quiz-check-btn--green" onclick="Formacion.checkEstilo()">🧭 Descubrir mi Estilo</button>
            </div>`;
    },

    _computeEstiloAxes: function () {
        const axes = {};
        this.AXES.forEach(a => axes[a] = { raw: 0, max: 0 });
        this.ESTILO_PREGUNTAS.forEach((q, qi) => {
            const sel = document.querySelector(`input[name="festilo-q-${qi}"]:checked`);
            const chosenIdx = sel ? Number(sel.value) : null;
            this.AXES.forEach(axis => {
                const maxAbs = Math.max(...q.options.map(op => Math.abs(op.delta?.[axis] || 0)));
                axes[axis].max += maxAbs;
            });
            if (chosenIdx !== null) {
                const delta = q.options[chosenIdx].delta || {};
                Object.entries(delta).forEach(([axis, val]) => { if (axes[axis]) axes[axis].raw += val; });
            }
        });
        return axes;
    },

    checkEstilo: function () {
        const total = this.ESTILO_PREGUNTAS.length;
        let answered = 0;
        for (let qi = 0; qi < total; qi++) {
            if (document.querySelector(`input[name="festilo-q-${qi}"]:checked`)) answered++;
        }
        if (answered < total) {
            alert(`Responde las ${total} preguntas antes de descubrir tu estilo (llevas ${answered}).`);
            return;
        }

        const axesRaw = this._computeEstiloAxes();
        const perfil = {};
        this.AXES.forEach(a => { perfil[a] = axesRaw[a].max ? +(axesRaw[a].raw / axesRaw[a].max).toFixed(3) : 0; });

        const scored = this.ESTILO_ARQUETIPOS.map(arch => {
            let distSq = 0;
            this.AXES.forEach(a => { const d = (perfil[a] || 0) - (arch.vector[a] || 0); distSq += d * d; });
            return { arch, dist: Math.sqrt(distSq) };
        }).sort((a, b) => a.dist - b.dist);

        const top4 = scored.slice(0, 4).map(s => s.arch.id);

        this._saveEstiloResult({ perfil, top4, evaluatedAt: Date.now() });
        const content = document.getElementById('form-tab-content');
        if (content) content.innerHTML = this._renderCurrentTab();
    },

    getEstiloResult: function () {
        try { return JSON.parse(localStorage.getItem(this.ESTILO_KEY)) || null; }
        catch (_) { return null; }
    },

    _saveEstiloResult: function (data) {
        try { localStorage.setItem(this.ESTILO_KEY, JSON.stringify(data)); } catch (_) {}
    },

    resetEstilo: function () {
        if (!confirm('¿Rehacer el Test de Estilo de Juego? Se reemplazará tu resultado actual.')) return;
        localStorage.removeItem(this.ESTILO_KEY);
        const content = document.getElementById('form-tab-content');
        if (content) content.innerHTML = this._renderCurrentTab();
    },

    _renderEstiloResult: function (result) {
        const AXIS_LABELS = {
            agresion:      { low: 'Control / Grind',         high: 'Agresión / OTK' },
            planificacion: { low: 'Reactivo / Adaptable',     high: 'Combo / Planificado' },
            riesgo:        { low: 'Seguridad / Consistencia', high: 'Riesgo / All-in' },
            interaccion:   { low: 'Autonomía / Solitario',    high: 'Interacción / Disrupción' },
            complejidad:   { low: 'Simple / Directo',         high: 'Técnico / Complejo' }
        };
        const barsHtml = this.AXES.map(a => {
            const v = result.perfil[a] || 0;
            const pct = Math.round(((v + 1) / 2) * 100);
            return `
            <div class="festilo-axis-row">
                <div class="festilo-axis-labels">
                    <span>${AXIS_LABELS[a].low}</span>
                    <span>${AXIS_LABELS[a].high}</span>
                </div>
                <div class="festilo-axis-track">
                    <div class="festilo-axis-fill" style="width:${pct}%"></div>
                    <div class="festilo-axis-marker" style="left:${pct}%"></div>
                </div>
            </div>`;
        }).join('');

        const recsHtml = result.top4.map(id => {
            const arch = this.ESTILO_ARQUETIPOS.find(a => a.id === id);
            if (!arch) return '';
            return `
            <div class="festilo-rec-card">
                <div class="festilo-rec-name">${arch.name}</div>
                <p class="festilo-rec-desc">${arch.desc}</p>
                <button class="form-quiz-check-btn festilo-rec-btn" onclick="Formacion.viewEstiloArchetype('${arch.name.replace(/'/g, "\\'")}')">🔍 Ver cartas en Buscador</button>
            </div>`;
        }).join('');

        return `
            <div class="festilo-result">
                <h3 class="festilo-result-title">Tu perfil</h3>
                <div class="festilo-axes">${barsHtml}</div>
                <h3 class="festilo-result-title">Arquetipos que podrían encajar contigo</h3>
                <div class="festilo-recs">${recsHtml}</div>
                <button class="form-quiz-check-btn fpt-reset-btn" onclick="Formacion.resetEstilo()">↺ Rehacer Test</button>
            </div>`;
    },

    viewEstiloArchetype: function (name) {
        if (window.CardViewer?.openArchetypeInBuscador) { CardViewer.openArchetypeInBuscador(name); return; }
        this.goToTab('buscador');
    },

// ── Tu Personaje de Yu-Gi-Oh! ────────────────────────────
    _renderPersonajeTab: function () {
        const result = this.getPersonajeResult();
        return `
            <div class="form-topic-container">
                <div class="form-notebook form-notebook--test">
                    <h2 class="form-nb-title">🎭 Tu Personaje de Yu-Gi-Oh!</h2>
                    <p class="form-nb-text">Responde según lo que sientas de verdad frente a un duelo — no hay respuesta correcta. El resultado busca al personaje cuya personalidad, motivaciones y objetivos se parezcan más a los tuyos.</p>
                    ${result ? this._renderPersonajeResult(result) : this._renderPersonajeQuiz()}
                </div>
            </div>`;
    },

    _renderPersonajeQuiz: function () {
        return `
            <div class="form-quiz form-quiz--test fperso-quiz" id="fperso-quiz">
                ${this.PERSONAJE_PREGUNTAS.map((q, qi) => `
                    <div class="form-quiz-q">
                        <p class="form-quiz-question">${qi + 1}. ${q.q}</p>
                        <div class="form-quiz-opts">
                            ${q.options.map((op, oi) => `
                                <label class="form-quiz-opt">
                                    <input type="radio" name="fperso-q-${qi}" value="${oi}">
                                    <span>${op.text}</span>
                                </label>`).join('')}
                        </div>
                    </div>`).join('')}
                <button class="form-quiz-check-btn form-quiz-check-btn--green" onclick="Formacion.checkPersonaje()">🎭 Descubrir mi Personaje</button>
            </div>`;
    },

    _computePersonajeAxes: function () {
        const axes = {};
        this.PERSONAJE_AXES.forEach(a => axes[a] = { raw: 0, max: 0 });
        this.PERSONAJE_PREGUNTAS.forEach((q, qi) => {
            const sel = document.querySelector(`input[name="fperso-q-${qi}"]:checked`);
            const chosenIdx = sel ? Number(sel.value) : null;
            this.PERSONAJE_AXES.forEach(axis => {
                const maxAbs = Math.max(...q.options.map(op => Math.abs(op.delta?.[axis] || 0)));
                axes[axis].max += maxAbs;
            });
            if (chosenIdx !== null) {
                const delta = q.options[chosenIdx].delta || {};
                Object.entries(delta).forEach(([axis, val]) => { if (axes[axis]) axes[axis].raw += val; });
            }
        });
        return axes;
    },

    checkPersonaje: function () {
        const total = this.PERSONAJE_PREGUNTAS.length;
        let answered = 0;
        for (let qi = 0; qi < total; qi++) {
            if (document.querySelector(`input[name="fperso-q-${qi}"]:checked`)) answered++;
        }
        if (answered < total) {
            alert(`Responde las ${total} preguntas antes de descubrir tu personaje (llevas ${answered}).`);
            return;
        }

        const axesRaw = this._computePersonajeAxes();
        const perfil = {};
        this.PERSONAJE_AXES.forEach(a => { perfil[a] = axesRaw[a].max ? +(axesRaw[a].raw / axesRaw[a].max).toFixed(3) : 0; });

        const scored = this.PERSONAJE_CATALOGO.map(p => {
            let distSq = 0;
            this.PERSONAJE_AXES.forEach(a => { const d = (perfil[a] || 0) - (p.vector[a] || 0); distSq += d * d; });
            return { p, dist: Math.sqrt(distSq) };
        }).sort((a, b) => a.dist - b.dist);

        this._savePersonajeResult({ perfil, personajeId: scored[0].p.id, evaluatedAt: Date.now() });
        const content = document.getElementById('form-tab-content');
        if (content) content.innerHTML = this._renderCurrentTab();
    },

    getPersonajeResult: function () {
        try { return JSON.parse(localStorage.getItem(this.PERSONAJE_KEY)) || null; }
        catch (_) { return null; }
    },

    _savePersonajeResult: function (data) {
        try { localStorage.setItem(this.PERSONAJE_KEY, JSON.stringify(data)); } catch (_) {}
    },

    resetPersonaje: function () {
        if (!confirm('¿Rehacer el Test de Tu Personaje? Se reemplazará tu resultado actual.')) return;
        localStorage.removeItem(this.PERSONAJE_KEY);
        const content = document.getElementById('form-tab-content');
        if (content) content.innerHTML = this._renderCurrentTab();
    },

    _renderPersonajeResult: function (result) {
        const p = this.PERSONAJE_CATALOGO.find(x => x.id === result.personajeId);
        if (!p) return '<p class="form-empty">No se pudo determinar tu personaje. Rehaz el test.</p>';

        const AXIS_LABELS = {
            vinculo:      { low: 'Solitario',            high: 'En equipo / Amistad' },
            ambicion:     { low: 'Humilde',               high: 'Ambicioso / Busca poder' },
            instinto:     { low: 'Calculador',            high: 'Instintivo / Emocional' },
            resiliencia:  { low: 'Se rinde fácil',        high: 'Nunca se rinde' },
            moralidad:    { low: 'El fin justifica los medios', high: 'Código de honor' }
        };
        const barsHtml = this.PERSONAJE_AXES.map(a => {
            const v = result.perfil[a] || 0;
            const pct = Math.round(((v + 1) / 2) * 100);
            return `
            <div class="festilo-axis-row">
                <div class="festilo-axis-labels">
                    <span>${AXIS_LABELS[a].low}</span>
                    <span>${AXIS_LABELS[a].high}</span>
                </div>
                <div class="festilo-axis-track">
                    <div class="festilo-axis-fill" style="width:${pct}%"></div>
                    <div class="festilo-axis-marker" style="left:${pct}%"></div>
                </div>
            </div>`;
        }).join('');

        return `
            <div class="festilo-result">
                <div class="fperso-card">
                    <img class="fperso-img" src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">
                    <div class="fperso-name">${p.name}</div>
                    <p class="fperso-desc">${p.desc}</p>
                </div>
                <h3 class="festilo-result-title">Tu perfil</h3>
                <div class="festilo-axes">${barsHtml}</div>
                <button class="form-quiz-check-btn fpt-reset-btn" onclick="Formacion.resetPersonaje()">↺ Rehacer Test</button>
            </div>`;
    },

// ═══════════════════════════════════════════════════════════
    // TEST PRÁCTICO — tablero aislado (no usa ZonaPractica real)
    // Interacción: tocar carta → seleccionar → tocar zona/carta destino
    // (mismo patrón tap-menú-mover de Zona de Práctica, simplificado)
    // ═══════════════════════════════════════════════════════════

    _renderPracticalTest: function (test) {
        if (!this._pt || this._pt.testId !== test.id) this._ptInit(test);
        return `
            <div class="form-topic-container">
                <div class="form-notebook form-notebook--test">
                    <span class="form-nb-level-badge form-nb-level-badge--green">Nivel: ${test.level || 'Avanzado'}</span>
                    <h2 class="form-nb-title">${test.label}</h2>
                    ${test.desc ? `<p class="form-nb-text">${test.desc}</p>` : ''}
                    <p class="form-nb-text fpt-scenario">📋 ${test.scenario}</p>
                    ${this._ptRenderBoard()}
                    <div class="fpt-actions">
                        <button class="form-quiz-check-btn fpt-hint-btn" onclick="Formacion._ptShowHint()">💡 Pista</button>
                        <button class="form-quiz-check-btn fpt-reset-btn" onclick="Formacion._ptReset()">↺ Reiniciar</button>
                        <button class="form-quiz-check-btn fpt-listo-btn" onclick="Formacion._ptCheck()">✅ Listo</button>
                    </div>
                    <div id="form-pt-result"></div>
                </div>
            </div>
        `;
    },
_findPracticoTest: function (id) {
        return this.TESTS.practicos.find(x => x.id === id) || TestDuelo.get(id);
    },
    _ptInit: function (test) {
        const ZONE_KEYS = ['0','1','2','3','4','5','6','7','8','9','10','A','B',
                            'o0','o1','o2','o3','o4','o5','o6','o7','o8','o9','o10'];
        const zones = {};
        ZONE_KEYS.forEach(z => zones[z] = null);
        if (test.board.zones) {
            Object.keys(test.board.zones).forEach(z => {
                const c = test.board.zones[z];
                if (c && (z in zones)) zones[z] = { ...c };
            });
        }
        this._pt = {
            testId: test.id, zones,
            hand:   test.board.hand.map(c => ({ ...c })),
            gy:     (test.board.gy || []).map(c => ({ ...c })),
            banish: (test.board.banish || []).map(c => ({ ...c })),
            main:   (test.board.main || []).map(c => ({ ...c })),
            extra:  (test.board.extra || []).map(c => ({ ...c })),
            selected: null,
            oppEnabled: !!test.board.oppEnabled,
        };
    },

    _ptRenderBoard: function () {
        const t = this._pt;
        if (!t) return '';
        const imgUrl = (c) => `https://images.ygoprodeck.com/images/cards/${c.imgId}.jpg`;
        const lp = (iid) => `onpointerdown="Formacion._ptLongPressStart('${iid}',event)" onpointerup="Formacion._ptCancelLongPress()" onpointerleave="Formacion._ptCancelLongPress()" oncontextmenu="return false;"`;
        const chipField = (c) => `
            <img class="pz-card-img fpt-chip${t.selected === c.iid ? ' fpt-chip-selected' : ''}"
                 src="${imgUrl(c)}" alt="${c.label}" title="${(c.desc || c.label || '').replace(/"/g, '&quot;')}"
                 onclick="event.stopPropagation(); Formacion._ptCardClick('${c.iid}')" ${lp(c.iid)} draggable="false">`;
        const chipMulti = (c) => `
            <div class="pz-card-slot fpt-chip${t.selected === c.iid ? ' fpt-chip-selected' : ''}"
                 title="${(c.desc || c.label || '').replace(/"/g, '&quot;')}"
                 onclick="event.stopPropagation(); Formacion._ptCardClick('${c.iid}')" ${lp(c.iid)}>
                <img src="${imgUrl(c)}" alt="${c.label}" draggable="false">
            </div>`;
        const chipStack = (cards) => cards.slice(-4).map((c, i) => `
            <img class="pz-card-img fpt-chip${t.selected === c.iid ? ' fpt-chip-selected' : ''}"
                 src="${imgUrl(c)}" alt="${c.label}" style="position:relative;left:${i * 10}px;z-index:${i};width:70%;"
                 onclick="event.stopPropagation(); Formacion._ptCardClick('${c.iid}')" ${lp(c.iid)} draggable="false">`).join('');

        const z = t.zones;
        const monsterFieldRow = ['0','1','2','3','4','5'].map((n, idx) => {
            const cls = n === '0' ? 'pz-zone-field' : 'pz-zone-monster';
            return `<div class="pz-zone ${cls}" style="grid-column:${idx + 1};grid-row:1;" onclick="Formacion._ptZoneClick('${n}')">
                        <span class="pz-zone-lbl">${n}</span>${z[n] ? chipField(z[n]) : ''}
                    </div>`;
        }).join('');
        const stRow = ['6','7','8','9','10'].map((n, idx) => {
            const cls = (n === '6' || n === '10') ? 'pz-zone-pendulum' : 'pz-zone-st';
            return `<div class="pz-zone ${cls}" style="grid-column:${idx + 2};grid-row:2;" onclick="Formacion._ptZoneClick('${n}')">
                        <span class="pz-zone-lbl">${n}</span>${z[n] ? chipField(z[n]) : ''}
                    </div>`;
        }).join('');
        const ownGrid = `<div class="pz-field-grid" style="margin-bottom:6px;">${monsterFieldRow}${stRow}</div>`;

        const emzGrid = `
            <div class="pz-field-grid" style="margin-bottom:6px;">
                <div class="pz-zone pz-zone-emz" style="grid-column:3;grid-row:1;" onclick="Formacion._ptZoneClick('A')">
                    <span class="pz-zone-lbl">A</span>${z['A'] ? chipField(z['A']) : ''}
                </div>
                <div class="pz-logo-cell pz-fg-logo" style="grid-column:4;grid-row:1;"></div>
                <div class="pz-zone pz-zone-emz" style="grid-column:5;grid-row:1;" onclick="Formacion._ptZoneClick('B')">
                    <span class="pz-zone-lbl">B</span>${z['B'] ? chipField(z['B']) : ''}
                </div>
            </div>`;

        const oppStRow = ['6','7','8','9','10'].map((n, idx) => {
            const cls = (n === '6' || n === '10') ? 'pz-zone-pendulum' : 'pz-zone-st';
            return `<div class="pz-zone ${cls}" style="grid-column:${idx + 2};grid-row:1;" onclick="Formacion._ptZoneClick('o${n}')">
                        <span class="pz-zone-lbl">${n}</span>${z['o'+n] ? chipField(z['o'+n]) : ''}
                    </div>`;
        }).join('');
        const oppMonsterFieldRow = ['0','1','2','3','4','5'].map((n, idx) => {
            const cls = n === '0' ? 'pz-zone-field' : 'pz-zone-monster';
            return `<div class="pz-zone ${cls}" style="grid-column:${idx + 1};grid-row:2;" onclick="Formacion._ptZoneClick('o${n}')">
                        <span class="pz-zone-lbl">${n}</span>${z['o'+n] ? chipField(z['o'+n]) : ''}
                    </div>`;
        }).join('');
        const oppGrid = t.oppEnabled ? `
            <p style="font-size:0.75rem;color:rgba(255,255,255,0.45);margin:0 0 4px;">📋 Campo Rival:</p>
            <div class="pz-field-grid" style="margin-bottom:6px;opacity:0.9;">${oppStRow}${oppMonsterFieldRow}</div>` : '';

        return `
            <div class="pz-board-outer fpt-board" id="form-pt-board">
                ${oppGrid}
                ${t.oppEnabled ? '<p style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin:0 0 4px;">Zonas Extra Monstruo (compartidas):</p>' : ''}
                ${emzGrid}
                ${t.selected ? `<div class="pz-move-hint">🖐️ Toca la zona (o carta) destino — o vuelve a tocar la carta para cancelar.</div>` : ''}
                ${ownGrid}

                <div class="pz-zone-row" style="gap:8px;">
                    <div style="flex:1;display:flex;align-items:center;gap:6px;min-width:0;">
                        <span class="pz-row-label">GY</span>
                        <div class="pz-multi-zone pz-gy-zone" style="overflow-x:auto;flex-wrap:nowrap;" onclick="Formacion._ptMultiZoneClick('gy')">
                            ${t.gy.length ? t.gy.map(chipMulti).join('') : '<span class="fpt-empty-lbl">Vacío</span>'}
                        </div>
                    </div>
                    <div style="flex:1;display:flex;align-items:center;gap:6px;min-width:0;">
                        <span class="pz-row-label">Banish</span>
                        <div class="pz-multi-zone pz-banish-zone" style="overflow-x:auto;flex-wrap:nowrap;" onclick="Formacion._ptMultiZoneClick('banish')">
                            ${t.banish.length ? t.banish.map(chipMulti).join('') : '<span class="fpt-empty-lbl">Vacío</span>'}
                        </div>
                    </div>
                </div>

                <div class="pz-zone-row" style="gap:6px;align-items:flex-start;">
                    <div style="width:100px;flex-shrink:0;">
                        <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;">
                            <span class="pz-row-label" style="font-size:0.68rem;">Extra</span>
                            <button class="pz-mini-btn" onclick="Formacion._ptOpenPileList('extra')">👁</button>
                        </div>
                        <div class="pz-multi-zone" onclick="Formacion._ptMultiZoneClick('extra')">
                            ${t.extra.length ? chipStack(t.extra) : '<span class="fpt-empty-lbl">Vacío</span>'}
                        </div>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <span class="pz-row-label">Mano</span>
                        <div class="pz-multi-zone pz-hand-zone" style="overflow-x:auto;flex-wrap:nowrap;" onclick="Formacion._ptMultiZoneClick('hand')">
                            ${t.hand.length ? t.hand.map(chipMulti).join('') : '<span class="fpt-empty-lbl">Vacía</span>'}
                        </div>
                    </div>
                    <div style="width:100px;flex-shrink:0;">
                        <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;">
                            <span class="pz-row-label" style="font-size:0.68rem;">Main</span>
                            <button class="pz-mini-btn" onclick="Formacion._ptOpenPileList('main')">👁</button>
                        </div>
                        <div class="pz-multi-zone" onclick="Formacion._ptMultiZoneClick('main')">
                            ${t.main.length ? chipStack(t.main) : '<span class="fpt-empty-lbl">Vacío</span>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _ptCardClick: function (iid) {
        if (this._ptLPFired) { this._ptLPFired = false; return; }
        const t = this._pt;
        if (!t) return;
        if (!t.selected)        { t.selected = iid; this._ptRefresh(); return; }
        if (t.selected === iid) { t.selected = null; this._ptRefresh(); return; }
        this._ptSwapInto(iid);
    },

    _ptZoneClick: function (zone) {
        const t = this._pt;
        if (!t || !t.selected) return;
        const occupantIid = t.zones[zone]?.iid;
        if (occupantIid && occupantIid !== t.selected) { this._ptSwapInto(occupantIid); return; }
        const moving = this._ptFindAndRemove(t.selected);
        if (!moving) { t.selected = null; this._ptRefresh(); return; }
        t.zones[zone] = moving;
        t.selected = null;
        this._ptRefresh();
    },

    _ptMultiZoneClick: function (zoneName) {
        const t = this._pt;
        if (!t || !t.selected) return;
        const moving = this._ptFindAndRemove(t.selected);
        if (!moving) { t.selected = null; this._ptRefresh(); return; }
        t[zoneName].push(moving);
        t.selected = null;
        this._ptRefresh();
    },

    _ptSwapInto: function (targetIid) {
        const t = this._pt;
        const movingIid = t.selected;
        const loc = this._ptLocate(targetIid);
        const movingCard = this._ptFindAndRemove(movingIid);
        if (!movingCard) { t.selected = null; this._ptRefresh(); return; }
        if (loc.type === 'zone') {
            const occupant = t.zones[loc.zone];
            t.zones[loc.zone] = movingCard;
            if (occupant) t.hand.push(occupant);
        } else {
            t[loc.type].push(movingCard);
        }
        t.selected = null;
        this._ptRefresh();
    },

    _ptLocate: function (iid) {
        const t = this._pt;
        for (const z in t.zones) { if (t.zones[z]?.iid === iid) return { type: 'zone', zone: z }; }
        const POOLS = ['hand','gy','banish','main','extra'];
        for (const p of POOLS) { if (t[p].some(c => c.iid === iid)) return { type: p }; }
        return { type: 'hand' };
    },

    _ptFindAndRemove: function (iid) {
        const t = this._pt;
        for (const z in t.zones) { if (t.zones[z]?.iid === iid) { const c = t.zones[z]; t.zones[z] = null; return c; } }
        const POOLS = ['hand','gy','banish','main','extra'];
        for (const p of POOLS) {
            const idx = t[p].findIndex(c => c.iid === iid);
            if (idx > -1) return t[p].splice(idx, 1)[0];
        }
        return null;
    },
_ptLongPressStart: function (iid, ev) {
        this._ptCancelLongPress();
        this._ptLPTimer = setTimeout(() => {
            this._ptLPFired = true;
            if (navigator.vibrate) navigator.vibrate(30);
            this._ptShowCardMenu(iid, ev);
        }, 1000);
    },
    _ptCancelLongPress: function () {
        if (this._ptLPTimer) { clearTimeout(this._ptLPTimer); this._ptLPTimer = null; }
    },
    _ptShowCardMenu: function (iid, ev) {
        document.querySelectorAll('.fpt-card-menu').forEach(m => m.remove());
        const menu = document.createElement('div');
        menu.className = 'pz-action-submenu fpt-card-menu';
        menu.innerHTML = `<button class="pz-zmenu-btn pz-zmenu-ver" onclick="Formacion._ptViewCard('${iid}')">Ver</button>`;
        document.body.appendChild(menu);
        const rect = ev.target.getBoundingClientRect();
        menu.style.position = 'fixed'; menu.style.zIndex = '99999';
        menu.style.left = (rect.left + rect.width / 2) + 'px';
        menu.style.top  = (rect.bottom + 6) + 'px';
        menu.style.transform = 'translateX(-50%)';
        const close = (e2) => { if (!menu.contains(e2.target)) { menu.remove(); document.removeEventListener('click', close, true); } };
        setTimeout(() => document.addEventListener('click', close, true), 50);
    },
    _ptViewCard: function (iid) {
        document.querySelectorAll('.fpt-card-menu').forEach(m => m.remove());
        const t = this._pt;
        if (!t) return;
        let entry = null;
        for (const z in t.zones) { if (t.zones[z]?.iid === iid) entry = t.zones[z]; }
        if (!entry) ['hand','gy','banish','main','extra'].forEach(p => { const f = t[p].find(c => c.iid === iid); if (f) entry = f; });
        if (!entry) return;
        ZonaPractica._openMiniCV({
            id: entry.imgId, name: entry.label,
            card_images: [{ image_url_small: `https://images.ygoprodeck.com/images/cards_small/${entry.imgId}.jpg` }],
        });
    },
    _ptOpenPileList: function (poolName) {
        const t = this._pt;
        if (!t) return;
        document.getElementById('fpt-pile-overlay')?.remove();
        const cards = t[poolName] || [];
        const labelMap = { main: 'Main Deck', extra: 'Extra Deck' };
        const overlay = document.createElement('div');
        overlay.id = 'fpt-pile-overlay';
        overlay.className = 'pz-modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="pz-modal-box">
                <div class="pz-modal-title">${labelMap[poolName] || poolName} (${cards.length})</div>
                <button class="pz-modal-close" onclick="document.getElementById('fpt-pile-overlay').remove()">✕</button>
                <div style="max-height:60vh;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
                    ${cards.length ? cards.map(c => `
                        <div class="pz-search-item">
                            <img src="https://images.ygoprodeck.com/images/cards_small/${c.imgId}.jpg" class="pz-search-thumb">
                            <div class="pz-search-info"><div class="pz-search-name">${c.label}</div></div>
                            <div class="pz-search-btns">
                                <button class="pz-search-view-btn" onclick="Formacion._ptViewCard('${c.iid}')">Ver</button>
                            </div>
                        </div>`).join('') : '<p class="pz-search-hint">Vacío.</p>'}
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },
    _ptRefresh: function () {
        const el = document.getElementById('form-pt-board');
        if (el) el.outerHTML = this._ptRenderBoard();
    },

    _ptCheck: function () {
        const t = this._pt;
        if (!t) return;
        const test = this._findPracticoTest(t.testId);
        if (!test) return;

        const zoneGroupsOf = (z) => {
            const g = [];
            if (['1','2','3','4','5'].includes(z)) g.push('monster');
            if (['6','7','8','9','10'].includes(z)) g.push('st');
            if (z === '6' || z === '10') g.push('pendulum');
            if (z === 'A' || z === 'B') g.push('emz');
            return g;
        };
        const currentPos = {};
        for (const z in t.zones) { if (t.zones[z]) currentPos[t.zones[z].iid] = z; }
        ['hand','gy','banish','main','extra'].forEach(pool => (t[pool] || []).forEach(c => currentPos[c.iid] = pool));

        const allCards = [
            ...test.board.hand, ...(test.board.gy || []), ...(test.board.banish || []),
            ...(test.board.main || []), ...(test.board.extra || []),
            ...Object.values(test.board.zones || {}).filter(Boolean),
        ];
        let allCorrect = true;
        const wrong = [];
        Object.keys(test.solution).forEach(iid => {
            const sol = test.solution[iid];
            const cur = currentPos[iid];
            let ok;
            if (typeof sol === 'string') {
                const curGroup = ['1','2','3','4','5'].includes(cur) ? 'monster' : ['6','7','8','9','10'].includes(cur) ? 'st' : cur;
                ok = curGroup === sol;
            } else {
                ok = cur === sol.zone || (sol.groups?.length && zoneGroupsOf(cur).some(g => sol.groups.includes(g)));
            }
            if (!ok) { allCorrect = false; const c = allCards.find(x => x.iid === iid); wrong.push(c ? c.label : iid); }
        });

        const resultEl = document.getElementById('form-pt-result');
        if (!resultEl) return;
        resultEl.innerHTML = allCorrect
            ? `<div class="fpt-result fpt-result--ok">✅ <strong>${test.okMsg || '¡Resuelto!'}</strong>${test.okMsg ? '' : ' Cada carta quedó en su zona correcta.'}</div>`
            : `<div class="fpt-result fpt-result--fail">❌ <strong>${test.failMsg || 'Todavía no.'}</strong>${test.failMsg ? '' : ` Revisa: ${wrong.join(', ')}`}</div>`;
    },

  _ptShowHint: function () {
        const t = this._pt;
        if (!t) return;
        const test = this._findPracticoTest(t.testId);
        const resultEl = document.getElementById('form-pt-result');
        if (resultEl && test?.hint) resultEl.innerHTML = `<div class="fpt-result fpt-result--hint">💡 ${test.hint}</div>`;
    },

  _ptReset: function () {
        const t = this._pt;
        if (!t) return;
        const test = this._findPracticoTest(t.testId);
        if (!test) return;
        this._ptInit(test);
        const resultEl = document.getElementById('form-pt-result');
        if (resultEl) resultEl.innerHTML = '';
        this._ptRefresh();
    },
   checkTest: function (testId) {
    const custom = [...this.TESTS.teoricos, ...TestDuelo.getByCategory('teoricos')].find(t => t.id === testId);
    const qs = custom?.questions || this.TEST_QUESTIONS[testId];
        if (!qs) return;
        let correct = 0;
        qs.forEach((item, qi) => {
            const sel = document.querySelector(`input[name="test-${testId}-${qi}"]:checked`);
            const fb  = document.getElementById(`test-${testId}-${qi}-fb`);
            if (!fb) return;
            if (!sel) { fb.innerHTML = '<span class="form-quiz-fb-empty">⚠ Sin responder</span>'; return; }
            const ok = parseInt(sel.value) === item.correct;
            if (ok) correct++;
            fb.innerHTML = ok
                ? `<span class="form-quiz-fb-ok">✔ Correcto — ${item.explain}</span>`
                : `<span class="form-quiz-fb-bad">✘ Incorrecto — ${item.explain}</span>`;
        });
        const scoreEl = document.getElementById(`test-${testId}-score`);
        if (scoreEl) scoreEl.textContent = `Puntaje: ${correct}/${qs.length}`;
    },

    // ===============================

    _renderApuntesTab: function () {
        return `
            <div class="form-apuntes-layout">

                <!-- Editor -->
                <div class="form-apuntes-editor">
                    <div class="form-apuntes-editor-header">
                        <input type="text" id="apunte-titulo" class="form-apunte-title-input"
                               placeholder="Título del apunte..." maxlength="80">
                    </div>
                    <textarea id="apunte-contenido" class="form-apunte-textarea"
                              placeholder="Escribe tus apuntes aquí..."></textarea>
                    <div class="form-apunte-actions">
                        <button class="form-apunte-btn form-apunte-btn--save"
                                onclick="Formacion.saveNote()">💾 Guardar</button>
                        <button class="form-apunte-btn form-apunte-btn--download"
                                onclick="Formacion.downloadNote()">⬇ Descargar .txt</button>
                        <button class="form-apunte-btn form-apunte-btn--clear"
                                onclick="Formacion.clearEditor()">✕ Limpiar</button>
                    </div>
                </div>

                <!-- Lista de apuntes -->
                <div class="form-apuntes-list-panel">
                    <div class="form-apuntes-list-header">
                        <span>Lista de apuntes:</span>
                        <label class="form-apunte-import-btn" title="Importar .txt">
                            📂 Importar
                            <input type="file" accept=".txt" style="display:none;"
                                   onchange="Formacion.importNote(this)">
                        </label>
                    </div>
                    <div id="form-notes-list" class="form-notes-list">
                        ${this._renderNotesList()}
                    </div>
                </div>

            </div>
        `;
    },

    _renderNotesList: function () {
        const notes = this._getNotes();
        if (!notes.length) return '<p class="form-empty">Sin apuntes guardados.</p>';
        return notes.map((n, i) => `
            <div class="form-note-item" id="form-note-item-${i}">
                <div class="form-note-name" onclick="Formacion.openNote(${i})" title="${this._escHtml(n.title)}">
                    📄 ${this._escHtml(n.title || 'Sin título')}
                </div>
                <div class="form-note-item-btns">
                    <button class="form-note-btn form-note-btn--open"
                            onclick="Formacion.openNote(${i})">Abrir</button>
                    <button class="form-note-btn form-note-btn--dl"
                            onclick="Formacion.downloadNoteByIndex(${i})">⬇</button>
                    <button class="form-note-btn form-note-btn--del"
                            onclick="Formacion.deleteNote(${i})">✕</button>
                </div>
            </div>
        `).join('');
    },

    saveNote: function () {
        const title   = document.getElementById('apunte-titulo')?.value.trim();
        const content = document.getElementById('apunte-contenido')?.value.trim();
        if (!title && !content) { alert('Escribe algo antes de guardar.'); return; }
        const notes = this._getNotes();
        // Si hay un apunte abierto con el mismo título, sobreescribir
        const idx = notes.findIndex(n => n.title === (title || 'Sin título'));
        const note = { title: title || 'Sin título', content, date: new Date().toISOString() };
        if (idx >= 0) notes[idx] = note;
        else notes.unshift(note);
        this._saveNotes(notes);
        this._refreshNotesList();
    },

    openNote: function (index) {
        const notes = this._getNotes();
        const n     = notes[index];
        if (!n) return;
        const titleEl   = document.getElementById('apunte-titulo');
        const contentEl = document.getElementById('apunte-contenido');
        if (titleEl)   titleEl.value   = n.title;
        if (contentEl) contentEl.value = n.content;
        titleEl?.focus();
    },

    deleteNote: function (index) {
        const notes = this._getNotes();
        notes.splice(index, 1);
        this._saveNotes(notes);
        this._refreshNotesList();
    },

    clearEditor: function () {
        const t = document.getElementById('apunte-titulo');
        const c = document.getElementById('apunte-contenido');
        if (t) t.value = '';
        if (c) c.value = '';
    },

    downloadNote: function () {
        const title   = document.getElementById('apunte-titulo')?.value.trim() || 'apunte';
        const content = document.getElementById('apunte-contenido')?.value || '';
        this._downloadTxt(title, content);
    },

    downloadNoteByIndex: function (index) {
        const n = this._getNotes()[index];
        if (!n) return;
        this._downloadTxt(n.title, n.content);
    },

    importNote: function (input) {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const titleEl   = document.getElementById('apunte-titulo');
            const contentEl = document.getElementById('apunte-contenido');
            if (titleEl)   titleEl.value   = file.name.replace('.txt', '');
            if (contentEl) contentEl.value = e.target.result;
        };
        reader.readAsText(file);
        input.value = '';
    },

    _downloadTxt: function (filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${filename}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    _refreshNotesList: function () {
        const el = document.getElementById('form-notes-list');
        if (el) el.innerHTML = this._renderNotesList();
    },

    _getNotes: function () {
        try { return JSON.parse(localStorage.getItem(this.NOTES_KEY)) || []; }
        catch (_) { return []; }
    },

    _saveNotes: function (notes) {
        localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
    },

    // ===============================

    _renderTopicTab: function (topic) {
        const mastered = this._getMastered();
        const html     = this._getTopicContent(topic.id);
        return `
            <div class="form-topic-container">
                <div class="form-notebook">
                    ${topic.level ? `<span class="form-nb-level-badge">Nivel: ${topic.level}</span>` : ''}
                    ${html}
                </div>
                ${!mastered.includes(topic.id) ? `
                    <div class="form-topic-footer">
                        <button class="form-mastered-btn" onclick="Formacion.masterTopic('${topic.id}')">
                            ✅ Tema Dominado
                        </button>
                    </div>
                ` : `
                    <div class="form-topic-footer">
                        <span class="form-mastered-badge">✅ Ya dominaste este tema</span>
                        <button class="form-unmaster-btn" onclick="Formacion.unmasterTopic('${topic.id}')">
                            Marcar como no dominado
                        </button>
                    </div>
                `}
            </div>
        `;
    },

    masterTopic: function (topicId) {
        const mastered = this._getMastered();
        if (!mastered.includes(topicId)) mastered.push(topicId);
        this._saveMastered(mastered);
        // Actualizar vista: quitar el botón
        const footer = document.querySelector('.form-topic-footer');
        if (footer) footer.outerHTML = `
            <div class="form-topic-footer">
                <span class="form-mastered-badge">✅ Ya dominaste este tema</span>
                <button class="form-unmaster-btn" onclick="Formacion.unmasterTopic('${topicId}')">
                    Marcar como no dominado
                </button>
            </div>`;
        if (window.ConfigManager?.getFormacionTopicsConfig?.()[topicId]?.hideOnMaster !== false) {
            this.render();
        }
    },

    unmasterTopic: function (topicId) {
        const mastered = this._getMastered().filter(id => id !== topicId);
        this._saveMastered(mastered);
        this.render();
    },

    _getMastered: function () {
        try { return JSON.parse(localStorage.getItem(this.MASTERED_KEY)) || []; }
        catch (_) { return []; }
    },

    _saveMastered: function (arr) {
        localStorage.setItem(this.MASTERED_KEY, JSON.stringify(arr));
    },

    _getActiveTopics: function () {
        const mastered     = this._getMastered();
        const topicsConfig = window.ConfigManager?.getFormacionTopicsConfig?.() ?? {};
        return this.TOPICS.filter(t => {
            const cfg = topicsConfig[t.id];
            if (cfg && cfg.active === false) return false;
            if (mastered.includes(t.id) && (cfg?.hideOnMaster !== false)) return false;
            return true;
        });
    },

    // ===============================

    _getTopicContent: function (topicId) {
        const topics = {
            'que-es-yugioh':           this._topicQueEsYugioh(),
            'vocabulario-legal':       this._topicVocabularioLegal(),
            'fases-del-duelo':         this._topicFasesDelDuelo(),
            'tipos-cartas-basicas':    this._topicTiposCartasBasicas(),
            'estructura-efecto-carta': this._topicEstructuraEfecto(),
            'tipos-cartas-especiales': this._topicTiposCartasEspeciales(),
            'funciones-de-las-cartas': this._topicFuncionesCartas(),
            'palabras-tecnicas-juego': this._topicPalabrasTecnicas(),
            'estructura-arquetipos':   this._topicEstructuraArquetipos(),
            'mentalidad-del-jugador':  this._topicMentalidadJugador(),
'secuenciacion':           this._topicSecuenciacion(),
            'elegir-construir-deck':     this._topicElegirConstruirDeck(),
'pet-deck-dominar':          this._topicPetDeckDominar(),
'valorar-carta':             this._topicValorarCarta(),
'staples-formato':           this._topicStaples(),
            'anatomia-deck-competitivo': this._topicAnatomiaDeckCompetitivo(),
            'debilidades-deck':          this._topicDebilidadesDeck(),
            'optimizar-deck':            this._topicOptimizarDeck(),
'equilibrio-deck':           this._topicEquilibrioDeck(),  
            'rulings-invocaciones':    this._topicRulingsInvocaciones(),
            'rulings-batalla':         this._topicRulingsBatalla(),
            'if-when-timing':          this._topicIfWhenTiming(),
            'leer-campo-oponente':     this._topicLeerCampoOponente(),
            'gestion-lp-recursos':     this._topicGestionLpRecursos(),
            'formatos-diferencias':    this._topicFormatosDiferencias(),
            'side-deck':               this._topicSideDeck(),
'bo1-vs-bo3':              this._topicBo1VsBo3(),
'practicar-evento':        this._topicPracticarEvento(),
            'meta-tiers':              this._topicMetaTiers(),
        };
        return topics[topicId] || '<p>Contenido no disponible.</p>';
    },

    _topicQueEsYugioh: function () {
        return `
            <h2 class="form-nb-title">¿Qué es Yu-Gi-Oh!?</h2>

            <h3 class="form-nb-subtitle">📜 Historia y Origen</h3>
            <p class="form-nb-text">
                Yu-Gi-Oh! es una franquicia japonesa creada por <strong>Kazuki Takahashi</strong> en 1996, 
                publicada en la revista Shonen Jump de Shueisha. Lo que comenzó como un manga de 
                juegos de azar y magia evolucionó en uno de los juegos de cartas coleccionables 
                más populares del mundo, gestionado actualmente por <strong>Konami</strong>.
            </p>

            <h3 class="form-nb-subtitle">🃏 ¿De qué trata el juego?</h3>
            <p class="form-nb-text">
                Es un juego de cartas estratégico donde dos jugadores se enfrentan con mazos de 
                40 a 60 cartas. El objetivo principal es reducir los <strong>Puntos de Vida (LP)</strong> 
                del rival de 8000 a 0 invocando monstruos, activando hechizos y trampas.
            </p>

            <h3 class="form-nb-subtitle">📦 Tipos de Cartas</h3>
            <p class="form-nb-text">
                Existen tres tipos principales de cartas:
            </p>
            <ul class="form-nb-list">
                <li><strong>Monstruos:</strong> Atacan y defienden. Tienen ATK (ataque) y DEF (defensa).</li>
                <li><strong>Hechizos (Magias):</strong> Efectos instantáneos o continuos que apoyan tu estrategia.</li>
                <li><strong>Trampas:</strong> Se activan en respuesta a las acciones del rival.</li>
            </ul>

            <h3 class="form-nb-subtitle">⚔️ Condiciones de Victoria</h3>
            <ul class="form-nb-list">
                <li>Reducir los LP del rival a 0.</li>
                <li>El rival no puede robar carta al inicio de su turno (deck out).</li>
                <li>Cumplir la condición especial de una carta (ej: Exodia).</li>
            </ul>

            <h3 class="form-nb-subtitle">🏆 Formatos de Juego</h3>
            <p class="form-nb-text">
                El juego tiene varios formatos competitivos activos:
            </p>
            <ul class="form-nb-list">
                <li><strong>TCG:</strong> Formato occidental (Europa y América).</li>
                <li><strong>OCG:</strong> Formato oriental (Japón, Asia).</li>
                <li><strong>Master Duel:</strong> Versión digital oficial de Konami.</li>
                <li><strong>Duel Links:</strong> Versión móvil simplificada.</li>
                <li><strong>Genesys:</strong> Formato alternativo con sus propias reglas.</li>
            </ul>

            <h3 class="form-nb-subtitle">🎴 Ejemplos Reales de Cada Tipo</h3>
            <p class="form-nb-text">Haz clic en cada nombre para abrir su carta real dentro de la app:</p>
            <ul class="form-nb-list">
                <li><strong>Monstruo:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Dark Magician'); return false;">Dark Magician</a> — Monstruo Normal: solo ATK/DEF, sin efecto.</li>
                <li><strong>Hechizo:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Monster Reborn'); return false;">Monster Reborn</a> — revive cualquier monstruo del cementerio, tuyo o del rival.</li>
                <li><strong>Trampa:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Mirror Force'); return false;">Mirror Force</a> — boca abajo, destruye todos los monstruos en ataque del rival al declarar batalla.</li>
            </ul>

            <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
            ${this._renderQuiz('que-es-yugioh')}

            <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
            <p class="form-nb-text">
                Ve a <strong>Buscador</strong> y busca tú mismo "Dark Magician", "Monster Reborn" y "Mirror Force" para comparar sus fichas.
                Luego entra a <strong>Mi Deck → 📥 Importar Deck</strong> y prueba
                <a href="#" class="form-link" onclick="Formacion.tryExampleDeck('Yugi - Nivel 1'); return false;">cargar el deck de ejemplo "Yugi - Nivel 1"</a>
                para ver un mazo real con estos tres tipos de carta funcionando juntos.
            </p>
        `;
    },
_topicBo1VsBo3: function () { return `
        <h2 class="form-nb-title">Bo1 vs Bo3: Diferencias Estratégicas</h2>
        <p class="form-nb-text">No es lo mismo construir para Master Duel Ranked (partida única, Bo1) que para un torneo físico TCG/OCG (mejor de 3, Bo3 con Side Deck). Copiar una lista de un formato al otro sin ajustar la filosofía de construcción es un error frecuente.</p>

        <h3 class="form-nb-subtitle">🎮 Bo1 (Master Duel Ranked)</h3>
        <ul class="form-nb-list">
            <li>No hay información previa del rival ni oportunidad de ajustar entre partidas — cada duelo es un ambiente completamente ciego.</li>
            <li>No existe Side Deck: la lista con la que empiezas es la única que tendrás durante todo el duelo.</li>
            <li>Favorece listas más redondeadas y auto-suficientes: cada carta debe defenderse por sí sola contra cualquier matchup posible, no solo contra los 2-3 decks que esperas enfrentar.</li>
            <li>El tech card muy específico (que solo brilla contra 1 arquetipo puntual) pierde valor relativo — puede ser una carta muerta la mayoría de tus duelos.</li>
        </ul>

        <h3 class="form-nb-subtitle">🏆 Bo3 (TCG/OCG Físico)</h3>
        <ul class="form-nb-list">
            <li>Puedes perder el Game 1, observar la lista del rival, y ajustar con el Side Deck para el Game 2 y 3.</li>
            <li>Permite listas más "greedy" o especializadas desde el Game 1, porque sabes que tendrás la oportunidad de corregir después.</li>
            <li>El tech card específico gana valor: aunque sea flojo en algunos matchups, puede ser la carta que decide un Game 2/3 completo contra el arquetipo correcto.</li>
            <li>El conocimiento del meta local (qué juegan los rivales de tu región/tienda) pesa más que en Ranked, donde el pool de rivales es global y variado.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚖️ Consecuencia Práctica</h3>
        <p class="form-nb-text">En Bo1, prioriza cartas genéricas y flexibles (rol Flex de la lección "Cómo Valorar una Carta") por encima de tech muy puntual. En Bo3, un Main Deck algo más genérico + un Side Deck agresivo y específico suele superar a un Main ya sobrecargado de tech desde el Game 1 — porque ese tech estorba en el Game 1 contra rivales para los que no sirve.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Antes de copiar una lista, pregúntate para qué formato fue diseñada. Una lista optimizada para Ranked suele ser más "segura" y menos explosiva que una lista de torneo físico pensada para ganar rápido el Game 1 y ajustar después.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('bo1-vs-bo3')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Guarda dos versiones de tu deck si juegas ambos formatos (usa nombres distintos, ej. "MiDeck (Ranked)" y
            "MiDeck (Físico)") — cada una con su propio <strong>Internal Score</strong> y su propia zona de Side en
            <strong>Mi Deck → 🔨 Construcción</strong>. Así comparas objetivamente si tu build de Bo1 es más genérica que tu
            build de Bo3, en vez de asumirlo.
        </p>
    `; },
    _topicPracticarEvento: function () { return `
        <h2 class="form-nb-title">Practicar Antes de un Evento</h2>
        <p class="form-nb-text">Llegar a un torneo sin haber estresado tu línea de combo bajo interrupción real es la forma más común de perder rondas que deberías haber ganado. Practicar no es "jugar partidas" — es una rutina con objetivo.</p>

        <h3 class="form-nb-subtitle">📋 Rutina de Práctica Pre-Torneo</h3>
        <ul class="form-nb-list">
            <li><strong>Volumen mínimo:</strong> antes de un evento importante, apunta a un número concreto de rondas de Optimización con tu lista final — no partidas casuales sin registro, sino rondas documentadas con resultado real.</li>
            <li><strong>Contra las listas correctas:</strong> practica contra las 3-4 listas más probables del meta local (o del torneo específico si lo conoces), no contra bots genéricos o el primer oponente random de Ranked.</li>
            <li><strong>Bajo presión real:</strong> juega asumiendo que el rival tiene la interrupción óptima en el momento óptimo, no la mejor mano posible para ti. Practicar solo contra manos fáciles genera una falsa confianza.</li>
            <li><strong>Ambos turnos:</strong> practica tanto yendo primero como yendo segundo — muchos jugadores solo ensayan su combo de ir primero y llegan al torneo sin plan real yendo segundo.</li>
        </ul>

        <h3 class="form-nb-subtitle">🧊 Cuándo "Congelar" la Lista</h3>
        <p class="form-nb-text">Define un punto de corte (ej. 2-3 días antes del evento) después del cual dejas de tocar el Main Deck salvo un cambio crítico confirmado. Cambiar cartas hasta la noche anterior genera un deck que nunca practicaste realmente — vuelves al torneo con una versión no probada.</p>

        <h3 class="form-nb-subtitle">🔁 Método AAR — Revisión Post-Duelo</h3>
        <p class="form-nb-text">Después de cada duelo de práctica, responde estas 5 preguntas (tómalas como plantilla de tus notas):</p>
        <ol class="form-nb-list">
            <li><strong>1. ¿Cuál era mi plan al empezar el duelo?</strong></li>
            <li><strong>2. ¿En qué momento cambió mi plan?</strong></li>
            <li><strong>3. ¿Qué información ignoré?</strong></li>
            <li><strong>4. ¿Qué decisión me dio más dudas?</strong> (aquí es donde más se aprende)</li>
            <li><strong>5. Si jugara otra vez, ¿qué haría diferente?</strong></li>
        </ol>
        <p class="form-nb-text">Este método (usado por pilotos y equipos de alto rendimiento bajo el nombre After Action Review) convierte cada derrota de práctica en información útil, en vez de solo frustración.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El objetivo de practicar no es ganar todas las partidas de entrenamiento — es descubrir tus fallas de decisión antes de que cuesten un torneo real. Si nunca pierdes en tus prácticas, probablemente no estás practicando contra la presión correcta.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('practicar-evento')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Usa <strong>Mi Deck → 🎯 Optimización</strong> como bitácora de práctica: crea una sesión etiquetada con el
            nombre del evento próximo, registra cada ronda, y usa el campo <strong>notas</strong> con las 5 preguntas del
            método AAR. Antes de congelar la lista, revisa el bloque <strong>🎖️ Nivel como Piloto</strong> — si sigues en
            un nivel bajo con tu deck actual, es señal de que necesitas más rondas antes del evento, no más cambios a la lista.
        </p>
        `;
    },
    _topicVocabularioLegal: function () { return `
        <h2 class="form-nb-title">Vocabulario Legal del Juego</h2>
        <p class="form-nb-text">Antes de aprender cartas, aprende el idioma. En Yu-Gi-Oh! cada palabra de un efecto es una acción legal distinta — confundirlas es la causa número uno de errores de novato.</p>

        <h3 class="form-nb-subtitle">⚔️ Las 4 Acciones que Nunca Son lo Mismo</h3>
        <ul class="form-nb-list">
            <li><strong>Destruir:</strong> Manda la carta al cementerio como resultado de un efecto o batalla. Se puede negar con cartas que "protegen de destrucción". <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Raigeki'); return false;">Raigeki</a> destruye todos los monstruos del rival.</li>
            <li><strong>Enviar al Cementerio (Send/Mill):</strong> Mover una carta ahí sin que sea "destrucción". No activa efectos que dicen "si es destruido". <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Foolish Burial'); return false;">Foolish Burial</a> envía 1 monstruo de tu deck sin destruirlo.</li>
            <li><strong>Tributar:</strong> Costo de Invocación (o efecto) que manda una carta al cementerio como parte de invocar otro monstruo. No es destrucción ni cuenta como "enviado por efecto" para la mayoría de propósitos. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Blue-Eyes White Dragon'); return false;">Blue-Eyes White Dragon</a> es Nivel 8 — necesita 2 tributos.</li>
            <li><strong>Desterrar (Banish):</strong> Saca la carta del juego (Removed from Play). No pasa por el cementerio — cartas que reviven desde cementerio no pueden tocarla. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('D.D. Crow'); return false;">D.D. Crow</a> destierra 1 carta del cementerio de cualquier jugador.</li>
        </ul>

        <h3 class="form-nb-subtitle">🎯 Objetivo (Target) vs Sin Objetivo</h3>
        <p class="form-nb-text">Si el efecto dice "selecciona" o "target", el oponente puede reaccionar sobre esa carta antes de que resuelva (ej: cambiándola de posición o protegiéndola). Si dice "todos los monstruos" o no menciona selección, no hay ventana de reacción por objetivo.</p>
<p class="form-nb-text"><em>Compara:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Mystical Space Typhoon'); return false;">Mystical Space Typhoon</a> selecciona 1 carta (tiene target) — el rival puede reaccionar. En cambio, <a href="#" class="form-link" onclick="Formacion.openCard('Raigeki'); return false;">Raigeki</a> destruye "todos" sin seleccionar ninguno — no hay objetivo que defender.</p>
        <h3 class="form-nb-subtitle">🚫 Negar (Negate)</h3>
        <ul class="form-nb-list">
            <li><strong>Negar la activación:</strong> El efecto nunca resuelve. Si tenía costo, el costo ya se pagó y se pierde igual. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Solemn Judgment'); return false;">Solemn Judgment</a> niega la activación de cualquier hechizo, trampa o invocación.</li>
            <li><strong>Negar el efecto:</strong> La activación cuenta como "usada" (once per turn se consume) pero no pasa nada al resolver. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Effect Veiler'); return false;">Effect Veiler</a> niega el efecto de un monstruo rival sin negar su Invocación.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Cuando leas cualquier carta nueva, pregúntate primero: ¿destruye, envía, tributa o destierra? ¿Tiene objetivo? ¿Niega activación o efecto? Estas 4 preguntas resuelven la mayoría de las confusiones de reglas.</p>
    <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('vocabulario-legal')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Ve a <strong>Buscador</strong> y abre cualquier carta de tu <strong>Mi Deck → Staples</strong>: lee su texto resaltado
            (nomenclatura) en el visor y aplícale las 4 preguntas de esta lección. Puedes revisar cómo la app clasifica ese
            texto en <strong>Config → Nomenclatura de Efectos</strong>.
        </p>
        `; },

    _topicFasesDelDuelo: function () { return `
        <h2 class="form-nb-title">Las Fases del Duelo</h2>
        <p class="form-nb-text">Un duelo de Yu-Gi-Oh! no es caótico — tiene una estructura fija de fases que se repite cada turno. Entender cuándo puedes hacer qué cosa es la base de todo lo demás.</p>

        <h3 class="form-nb-subtitle">📋 Las 6 Fases en Orden</h3>
        <ul class="form-nb-list">
            <li><strong>1. Draw Phase (DP):</strong> Robas 1 carta. El jugador que va primero en el primer turno NO roba. Algunos efectos se activan obligatoriamente aquí (triggers de "inicio de turno"), y el oponente puede activar efectos de velocidad 2 en respuesta a tu robo.</li>
            <li><strong>2. Standby Phase (SP):</strong> Parece vacía, pero es donde muchos efectos de mantenimiento se activan — costos de mantener ciertos monstruos en campo, efectos periódicos. Ambos jugadores pueden activar efectos aquí.</li>
            <li><strong>3. Main Phase 1 (MP1):</strong> La fase más activa del turno. Puedes invocar monstruos (1 invocación normal por turno), activar hechizos, colocar trampas boca abajo, activar efectos de monstruos y cambiar posición. Aquí construyes tu campo antes de atacar.</li>
            <li><strong>4. Battle Phase (BP):</strong> Declaras ataques con tus monstruos. El jugador que va primero en el primer turno NO puede atacar. Tiene subfases propias (Start, Battle Step, Damage Step, End — ver Tema: Rulings en Fase de Batalla) y los ataques se resuelven uno a uno.</li>
            <li><strong>5. Main Phase 2 (MP2):</strong> Igual que MP1, pero después de atacar. Útil para colocar trampas o invocar monstruos que no necesitan atacar. No puedes cambiar la posición de un monstruo que ya atacó ese turno.</li>
            <li><strong>6. End Phase (EP):</strong> Ambos jugadores descartan hasta tener 6 cartas en mano si tienen más. Efectos de "al final del turno" se resuelven aquí, y algunos efectos temporales expiran.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚖️ Las 2 Reglas de Oro en un Duelo</h3>
        <ul class="form-nb-list">
            <li><strong>Regla 1 — Es un duelo de caballeros:</strong> Siempre pide permiso antes de pasar de fase ("¿Pasamos a batalla?"). Confirma con tu oponente cada acción importante. Mantener el estado del juego claro evita disputas y malentendidos — en torneo, una jugada no comunicada puede generar problemas serios.</li>
            <li><strong>Regla 2 — Se juega por partes:</strong> Cada vez que hagas algo, anuncia qué estás haciendo y espera respuesta. No resuelvas varios pasos de golpe sin dar ventana al oponente. Un oponente puede interrumpirte en casi cualquier momento si tiene la carta correcta — darle esa ventana es parte del juego limpio.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔄 Lo que Cambia entre el Turno 1 y los Siguientes</h3>
        <ul class="form-nb-list">
            <li><strong>Turno 1 (jugador que va primero):</strong> Sin robo en Draw Phase, sin ataque en Battle Phase. Por eso ir primero significa protegerte con un buen campo, no ganar rápido.</li>
            <li><strong>Turno 2 en adelante:</strong> El juego está completamente abierto. El jugador que va segundo tiene la ventaja de atacar primero y ver el campo rival antes de decidir.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El error más común del novato es actuar sin pensar en las fases. Poner una trampa en MP1 la deja vulnerable ese turno porque el oponente puede destruirla antes de que "madure". Ponerla en MP2 (después de atacar) la protege hasta el turno del oponente. Aprender a usar MP2 correctamente es lo que separa a un jugador intuitivo de uno que realmente entiende la estructura del juego.</p>
    
        <h3 class="form-nb-subtitle">🎮 Practica las Fases en Vivo</h3>
        <p class="form-nb-text">
            La <strong>Zona de Práctica</strong> (Simuladores) tiene un campo visual real con botones para cada fase
            (Draw → Standby → Main 1 → Battle → Main 2 → End) y contador de turno.
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','practica'); return false;">Abrir Zona de Práctica</a>
        </p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('fases-del-duelo')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Entra a <strong>Mi Deck → 📥 Importar Deck</strong> y carga el deck de ejemplo
            <a href="#" class="form-link" onclick="Formacion.tryExampleDeck('Yugi - Nivel 1'); return false;">"Yugi - Nivel 1"</a>,
            luego pulsa <strong>"⚔️ Probar Deck"</strong> para enviarlo directo a Zona de Práctica. Ahí recorre manualmente
            Draw → Standby → Main 1 → Battle → Main 2 → End, usa 🪙 Moneda para decidir quién va primero, y sigue tu LP y turno.
            Para partidas reales en Master Duel, usa <strong>Simuladores → ⚔️ Duelo en Vivo → 👑 Cronómetro Master Duel</strong>.
        </p>
        `; },

    _topicTiposCartasBasicas: function () { return `
        <h2 class="form-nb-title">Tipos de Cartas Básicas</h2>
        <p class="form-nb-text">Antes de aprender combos o estrategias, necesitas conocer exactamente qué puede hacer cada tipo de carta y cuándo puede usarse. Aquí no hay atajos: si confundes una trampa con un hechizo de juego rápido, pierdes.</p>

        <h3 class="form-nb-subtitle">👾 Monstruos</h3>
        <p class="form-nb-text">Son el corazón del juego. Atacan, defienden y activan efectos.</p>
        <ul class="form-nb-list">
            <li><strong>Invocación Normal:</strong> Puedes invocar 1 monstruo boca arriba por turno en posición de ataque, o "setear" (colocar boca abajo) 1 monstruo por turno en defensa. Solo 1 invocación normal por turno, salvo que una carta diga lo contrario.</li>
            <li><strong>ATK / DEF:</strong> Puntos de ataque y defensa. El ATK se compara al atacar; la DEF solo importa si el monstruo está en posición de defensa.</li>
            <li><strong>Nivel / Rango:</strong> Número de estrellas. Afecta cómo se invocan los monstruos especiales (Sincro, XYZ, Ritual).</li>
            <li><strong>Tipo y Atributo:</strong> Tipo (Dragón, Guerrero, Mago, etc.) y Atributo (AGUA, FUEGO, VIENTO, TIERRA, LUZ, OSCURIDAD). Algunas cartas afectan tipos o atributos específicos — revisa esto en el Buscador de la app.</li>
            <li><strong>Monstruos Normales (Vainilla) vs de Efecto:</strong> Los normales no tienen efecto — solo ATK/DEF y texto de lore. Los de efecto tienen uno o más efectos activables o continuos.</li>
            <li><strong>Cambio de Posición:</strong> 1 vez por turno. No puedes cambiarlo si fue invocado ese mismo turno, ni si ya atacó ese turno.</li>
        </ul>
<p class="form-nb-text"><em>Compara:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Summoned Skull'); return false;">Summoned Skull</a> es un Monstruo Normal (Vainilla) — solo ATK/DEF, sin efecto. <a href="#" class="form-link" onclick="Formacion.openCard('Ash Blossom & Joyous Spring'); return false;">Ash Blossom & Joyous Spring</a> es un Monstruo de Efecto — su texto niega jugadas del rival desde la mano.</p>
        <h3 class="form-nb-subtitle">🟢 Hechizos (Magias)</h3>
        <p class="form-nb-text">Cartas verdes. Se activan y su efecto resuelve inmediatamente (salvo los Continuos y de Campo, que permanecen en campo).</p>
     <ul class="form-nb-list">
            <li><strong>Normal:</strong> Se activa, resuelve y va al cementerio. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Raigeki'); return false;">Raigeki</a>.</li>
            <li><strong>Continuo:</strong> Permanece en campo y su efecto dura mientras esté ahí. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Rivalry of Warlords'); return false;">Rivalry of Warlords</a>.</li>
            <li><strong>Equipo:</strong> Se equipa a un monstruo y modifica sus stats o le da efectos. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('United We Stand'); return false;">United We Stand</a>.</li>
            <li><strong>Campo:</strong> Va a la zona de Campo. Solo puede haber 1 por lado del tablero. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Necrovalley'); return false;">Necrovalley</a>.</li>
            <li><strong>Ritual:</strong> Se usa para realizar una Invocación Ritual específica. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Advanced Ritual Art'); return false;">Advanced Ritual Art</a>.</li>
            <li><strong>Juego Rápido (Quick-Play):</strong> Puede activarse en cualquier fase de TU turno, o en el turno del oponente si está boca abajo desde el turno anterior. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Mystical Space Typhoon'); return false;">Mystical Space Typhoon</a>.</li>
        </ul>
        <p class="form-nb-text">Importante: los hechizos normales NO pueden activarse en respuesta directa a algo — necesitan una ventana abierta para jugarse. Si tu oponente activa un efecto y quieres responder, necesitas un hechizo de juego rápido o una trampa.</p>

        <h3 class="form-nb-subtitle">🟣 Trampas</h3>
        <p class="form-nb-text">Cartas rosadas/moradas. La regla más importante: deben colocarse boca abajo primero y no pueden activarse el mismo turno que fueron colocadas (salvo excepciones).</p>
       <ul class="form-nb-list">
            <li><strong>Normal:</strong> Activa su efecto una vez y va al cementerio. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Mirror Force'); return false;">Mirror Force</a>.</li>
            <li><strong>Continua:</strong> Permanece en campo y sigue activa. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Skill Drain'); return false;">Skill Drain</a>.</li>
            <li><strong>Counter (Contraefecto):</strong> Velocidad de hechizo 3. Solo puede ser respondida por otra counter trap. Son las más rápidas del juego. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Solemn Judgment'); return false;">Solemn Judgment</a>.</li>
        </ul>
        <p class="form-nb-text"><strong>La regla del turno:</strong> si colocas una trampa en MP1, tu oponente puede destruirla antes de que "madure" — solo puede activarse desde el turno del oponente en adelante. Por eso colocarlas en MP2 es la jugada más segura.</p>

        <h3 class="form-nb-subtitle">❓ ¿Por Qué Importa Saber Qué es Qué?</h3>
        <p class="form-nb-text">Porque la velocidad de activación cambia todo. Si quieres responder a la jugada del oponente en su turno, necesitas: trampas ya colocadas, hechizos de juego rápido ya colocados, o efectos de monstruo de tipo quick. Un hechizo normal en tu mano no te sirve de nada en el turno del oponente.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Antes de jugar cualquier carta, hazte 3 preguntas:</p>
        <ul class="form-nb-list">
            <li>1. ¿Es mi turno o el del oponente?</li>
            <li>2. ¿El efecto genera cadena o es una acción sin cadena?</li>
            <li>3. ¿Mi oponente puede responder a esto?</li>
        </ul>
        <p class="form-nb-text">Esas 3 preguntas te evitan el 90% de los errores del novato.</p>
    <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('tipos-cartas-basicas')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Ve a <strong>Buscador → ⚙ Filtros avanzados</strong> y elige la categoría "Mágica" o "Trampa": aparecerán chips
            con cada subtipo (Normal, Continua, Equipo, Campo, Ritual, Juego Rápido / Contraefecto) para filtrar cartas reales
            de cada uno. Luego entra a <strong>Mi Deck → Decklist</strong> y observa el color del borde de cada carta
            (verde = hechizo, morado = trampa) para identificar el tipo sin leer el texto completo.
        </p>
        
        `; },

    _topicTiposCartasEspeciales: function () { return `
        <h2 class="form-nb-title">Tipos de Cartas Especiales (Extra Deck)</h2>
        <p class="form-nb-text">El Extra Deck guarda hasta 15 cartas especiales que se invocan con mecánicas únicas. En el juego moderno, el Extra Deck es donde está la mayor parte del poder de un deck.</p>

        <h3 class="form-nb-subtitle">🟣 Fusión</h3>
        <p class="form-nb-text">Marco morado. Requiere una Magia de Fusión que combina los materiales desde mano, campo o cementerio. La <em>Fusión de Contacto</em> es inherente (sin magia), y los materiales regresan al deck, no al cementerio. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Blue-Eyes Ultimate Dragon'); return false;">Blue-Eyes Ultimate Dragon</a>.</p>

        <h3 class="form-nb-subtitle">🔵 Ritual</h3>
        <p class="form-nb-text">Marco azul claro. Único tipo que llega del deck principal, no del Extra Deck. Necesita la Magia de Ritual correspondiente y tributar monstruos cuyo nivel total iguale o supere el del Ritual. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Black Luster Soldier'); return false;">Black Luster Soldier</a>.</p>

        <h3 class="form-nb-subtitle">⚪ Sincronía (Synchro)</h3>
        <p class="form-nb-text">Marco blanco/gris. Necesitas 1 Tuner + 1 o más no-Tuner. La suma exacta de sus niveles debe igualar el del Sincro. Los materiales van al cementerio. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Stardust Dragon'); return false;">Stardust Dragon</a>.</p>

        <h3 class="form-nb-subtitle">⬛ XYZ ("Exceed")</h3>
        <p class="form-nb-text">Marco negro. Necesitas 2+ monstruos del mismo nivel. Los materiales quedan <em>debajo</em> del XYZ — no están en el cementerio hasta que el XYZ se destruye. Los XYZ tienen Rango, no Nivel. El <em>Caos XYZ</em> permite usar otro XYZ como material para invocar una versión superior. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Number 39: Utopia'); return false;">Number 39: Utopia</a>.</p>

        <h3 class="form-nb-subtitle">🔷 Link</h3>
        <p class="form-nb-text">Marco azul oscuro hexagonal. No tienen DEF ni Nivel — tienen Flechas de Link que habilitan zonas del Extra Deck para tus demás monstruos. Son el andamio de los decks modernos. Sin un Link en campo, solo puedes usar 1 zona central del Extra Deck. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Decode Talker'); return false;">Decode Talker</a>.</p>

        <h3 class="form-nb-subtitle">🟠🟢 Péndulo</h3>
        <p class="form-nb-text">Marco mitad verde, mitad naranja. Dos cartas Péndulo con escalas distintas se colocan en las Zonas Péndulo. Una vez por turno puedes invocar especialmente todos los monstruos de tu mano cuyo nivel esté dentro del rango de las escalas. Cuando salen del campo, van al tope del Extra Deck boca arriba. <em>Ejemplo:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Odd-Eyes Pendulum Dragon'); return false;">Odd-Eyes Pendulum Dragon</a>.</p>
        <h3 class="form-nb-subtitle">📈 Orden de Aprendizaje Recomendado</h3>
        <ul class="form-nb-list">
            <li>1. Fusión — más intuitiva</li>
            <li>2. Sincro — suma de niveles sencilla</li>
            <li>3. XYZ — mismo nivel, concepto de materiales debajo</li>
            <li>4. Link — cambia cómo funciona el tablero completo</li>
            <li>5. Ritual — costoso, necesita conocer el arquetipo</li>
            <li>6. Péndulo — el más complejo, requiere dominar los anteriores</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Un error común es creer que el Extra Deck es "opcional". En el juego moderno, el Extra Deck es donde está la mayor parte del poder de un deck. Un deck sin Extra Deck bien construido es un deck que no puede responder a amenazas reales. Aprende al menos Fusión, Sincro y XYZ antes de intentar un deck competitivo.</p>
    <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('tipos-cartas-especiales')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Ve a <strong>Buscador → ⚙ Filtros avanzados → Monstruo</strong> y usa los chips de subtipo
            (Ritual / Fusion / Synchro / XYZ / Link / Pendulum) para ver ejemplos reales de cada mecánica.
            Luego abre tu deck en <strong>Mi Deck → Decklist</strong> y pulsa la pestaña <strong>"Extra"</strong>
            para revisar qué mecánicas del Extra Deck ya estás usando (o si te falta alguna).
        </p>

        `; },

    _topicEstructuraEfecto: function () { return `
        <h2 class="form-nb-title">Estructura de un Efecto de Carta</h2>
        <p class="form-nb-text">Leer mal una carta es uno de los errores más costosos en Yu-Gi-Oh!. Cada línea de texto tiene una función específica. Este tema te enseña a diseccionar cualquier efecto, incluso uno que nunca hayas visto.</p>

        <h3 class="form-nb-subtitle">🔬 Las 6 Partes de un Efecto</h3>
        <ul class="form-nb-list">
            <li><strong>1. Requisito:</strong> Condición externa que debe cumplirse para que el efecto pueda activarse. Generalmente aparece al inicio, antes de los dos puntos. Ej: "Si tienes un monstruo 'Nombre' en tu campo:"</li>
            <li><strong>2. Condición:</strong> Restricción sobre el estado del juego en el momento de activación. Ej: "Solo puedes activar este efecto una vez por turno." / "No puedes invocar excepto monstruos 'Nombre' el turno que actives esto."</li>
            <li><strong>3. Costo:</strong> Lo que pagas ANTES de que el efecto resuelva. Si el oponente niega el efecto, el costo ya fue pagado — no se devuelve. Los dos puntos después del costo son clave: "Descarta 1 carta:" / "Libera este monstruo:"</li>
            <li><strong>4. Efecto/Objetivo:</strong> Lo que hace la carta cuando resuelve. Si dice "selecciona" o "elige", tiene objetivo (target) — el oponente puede responder a la selección. Si no lo dice, el efecto no tiene objetivo.</li>
            <li><strong>5. Duración:</strong> Por cuánto tiempo aplica el efecto. Ej: "hasta el final del turno", "durante esta Battle Phase", "mientras esté en campo". Si no dice cuánto dura, es permanente o hasta que se quite la carta.</li>
            <li><strong>6. Restricción:</strong> Limitación que aplica DESPUÉS de resolver el efecto, a menudo en una frase separada al final. Ej: "No puedes atacar directamente el turno que actives este efecto."</li>
        </ul>
<p class="form-nb-text"><em>Ejemplo real de Costo separado del Efecto:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Pot of Desires'); return false;">Pot of Desires</a> — el costo (desterrar 10 cartas boca abajo desde tu deck) se paga primero; si el efecto es negado, esas 10 cartas se pierden igual.</p>
        <p class="form-nb-text"><em>Ejemplo real de Duración:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Enemy Controller'); return false;">Enemy Controller</a> — su efecto de cambiar posición o tomar control de un monstruo rival dura solo hasta el final de ese turno.</p>
        <h3 class="form-nb-subtitle">🔗 Conectores Lógicos Clave</h3>
        <ul class="form-nb-list">
            <li><strong>IF (si):</strong> El efecto puede "miss the timing" en casos específicos, pero es más flexible que WHEN — solo necesita que la condición se haya cumplido en algún momento del proceso. Ej: "Si esta carta fue enviada al cementerio" tiene una ventana específica.</li>
            <li><strong>WHEN (cuando):</strong> Similar a IF pero más estricto en timing. Muy común en efectos opcionales que requieren ser "lo último que pasó" para activarse (ver Tema: IF vs WHEN y Timing Avanzado).</li>
            <li><strong>EACH TIME (cada vez que):</strong> El efecto puede activarse múltiples veces en el mismo turno si la condición se repite — no se limita a una vez por ocurrencia.</li>
            <li><strong>THEN (luego):</strong> Las dos partes del efecto se resuelven en orden. No son opcionales entre sí — si falla la primera, la segunda también falla.</li>
            <li><strong>AND IF YOU DO / AND ALSO:</strong> Ambas partes se resuelven simultáneamente. Si una falla, la otra también falla.</li>
            <li><strong>YOU CAN (puedes):</strong> El efecto es opcional. No estás obligado a activarlo ni a resolver toda su parte.</li>
            <li><strong>ONCE PER TURN (una vez por turno):</strong> Limita la activación a 1 por turno. OJO: hay diferencia entre "una vez por turno por carta" y "una vez por turno por nombre de carta" — el segundo limita incluso si tienes copias múltiples.</li>
        </ul>

        <h3 class="form-nb-subtitle">🎯 Objetivo (Target) vs Sin Objetivo</h3>
        <ul class="form-nb-list">
            <li><strong>Con objetivo</strong> ("Selecciona 1 carta en el campo de tu oponente y destrúyela"): el oponente puede responder y remover el objetivo antes de que resuelva. Si el objetivo ya no está cuando resuelve, el efecto falla.</li>
            <li><strong>Sin objetivo</strong> ("Destruye todos los monstruos en el campo de tu oponente"): no hay selección previa. El efecto resuelve directamente y el oponente no puede "escapar" moviendo la carta — todo aplica al resolver.</li>
        </ul>
<p class="form-nb-text"><em>Compara en monstruos:</em> <a href="#" class="form-link" onclick="Formacion.openCard('Effect Veiler'); return false;">Effect Veiler</a> selecciona ("target") 1 monstruo específico para negar su efecto. <a href="#" class="form-link" onclick="Formacion.openCard('Ash Blossom & Joyous Spring'); return false;">Ash Blossom & Joyous Spring</a> niega sin seleccionar nada — no tiene objetivo.</p>
        <h3 class="form-nb-subtitle">🧪 Ejemplo Práctico Diseccionado</h3>
        <p class="form-nb-text">Texto: <em>"Si tienes 3 o más cartas en tu mano: descarta 1 carta; roba 2 cartas. Solo puedes activar este efecto una vez por turno."</em></p>
        <ul class="form-nb-list">
            <li><strong>Requisito:</strong> "Si tienes 3 o más cartas en tu mano"</li>
            <li><strong>Costo:</strong> "descarta 1 carta" (pagado antes de resolver)</li>
            <li><strong>Efecto:</strong> "roba 2 cartas" (resuelve si el efecto no es negado)</li>
            <li><strong>Condición/Restricción:</strong> "Solo puedes activar este efecto una vez por turno"</li>
        </ul>
        <p class="form-nb-text">Si el oponente niega el efecto, igual descartaste 1 carta. El costo no se devuelve.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Lee siempre en este orden: 1. ¿Qué necesito para activarlo? (Requisito) 2. ¿Qué pago? (Costo) — ¿vale la pena si me lo niegan? 3. ¿Qué hace? (Efecto) — ¿tiene objetivo? 4. ¿Qué limitación me queda después? (Restricción). El jugador que entiende los costos y las restricciones toma mejores decisiones que el que solo ve el efecto en bruto.</p>
    
        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('estructura-efecto-carta')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Abre cualquier carta desde <strong>Buscador</strong>: el visor ya resalta el texto por colores según su
            nomenclatura (condición de activación, costo, restricción, efecto genérico) — el mismo motor que usa el
            Scoring G1/G2 internamente. Antes de mirarlo, intenta identificar tú mismo las 6 partes en 3 cartas de tu
            <strong>Mi Deck → Staples</strong>, y luego compara tu lectura con el resaltado automático de la app.
        </p>

        `; },

    _topicFuncionesCartas: function () { return `
        <h2 class="form-nb-title">Funciones de las Cartas (Roles)</h2>
        <p class="form-nb-text">Una carta no vale por sus estadísticas ni por su rareza — vale por lo que hace dentro de tu deck. Aprender a identificar la función de cada carta es lo que distingue a alguien que "tiene cartas" de alguien que "juega".</p>

        <h3 class="form-nb-subtitle">⚙️ Cartas Engine (las que arman tu combo)</h3>
        <ul class="form-nb-list">
            <li><strong>Starter (Arrancadora):</strong> Inicia tu combo desde la mano sin necesitar otra carta previa. Es la pieza más valiosa del engine — perderla a una Handtrap es el golpe más duro al inicio del turno.</li>
            <li><strong>Extender (Extendedora):</strong> Continúa o amplía tu combo después de que ya está en marcha. No puede iniciar la línea sola, pero es la respuesta a las interrupciones: si te niegan el starter y tienes un extender independiente, puedes seguir.</li>
            <li><strong>Searcher (Buscadora):</strong> Busca cartas específicas del deck y las lleva a la mano. No invoca directamente, pero garantiza que tengas la pieza que necesitas. Los mejores buscan al activarse, no al ser destruidos.</li>
            <li><strong>Bridge (Puente):</strong> Conecta dos piezas que normalmente no interactúan. No inicia ni cierra — transforma el estado del campo para habilitar lo que viene después.</li>
            <li><strong>Garnet / Brick (Ladrillo):</strong> Carta que necesitas en el deck para que otro efecto la busque, pero que en mano no sirve de nada. Regla general: no más de 2 Garnets en un deck, o la consistencia cae drásticamente.</li>
        </ul>
        <p class="form-nb-text">Ejemplos reales — haz clic para abrir la carta:</p>
        <ul class="form-nb-list">
            <li><strong>Starter:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Emergency Teleport'); return false;">Emergency Teleport</a> — trae un Tuner de bajo Nivel sin depender de nada más en campo.</li>
            <li><strong>Extender:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Instant Fusion'); return false;">Instant Fusion</a> — Invoca un monstruo de Fusión del Extra Deck sin materiales, extendiendo aunque el starter original haya sido negado.</li>
            <li><strong>Searcher:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Terraforming'); return false;">Terraforming</a> — busca cualquier Hechizo de Campo, sin importar el arquetipo.</li>
            <li><strong>Bridge:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Foolish Burial Goods'); return false;">Foolish Burial Goods</a> — envía un monstruo Ritual o de Fusión al cementerio, habilitando recuperación que de otro modo no tendrías.</li>
        </ul>

        <h3 class="form-nb-subtitle">🛡️ Cartas Defensivas (las que interrumpen)</h3>
        <ul class="form-nb-list">
            <li><strong>Handtrap (Trampa de Mano):</strong> Monstruo que activa su efecto desde la mano en respuesta a algo del oponente. No necesita estar en campo para funcionar — la interrupción estándar del formato moderno. Ej: <a href="#" class="form-link" onclick="Formacion.openCard('Ash Blossom & Joyous Spring'); return false;">Ash Blossom & Joyous Spring</a>, <a href="#" class="form-link" onclick="Formacion.openCard('Infinite Impermanence'); return false;">Infinite Impermanence</a>, <a href="#" class="form-link" onclick="Formacion.openCard('Nibiru, the Primal Being'); return false;">Nibiru, the Primal Being</a>.</li>
            <li><strong>Boardbreaker (Rompe-Campo):</strong> Destruye, regresa o neutraliza el campo ya construido del oponente. Se usan principalmente cuando vas segundo. Ej: <a href="#" class="form-link" onclick="Formacion.openCard('Raigeki'); return false;">Raigeki</a>, <a href="#" class="form-link" onclick="Formacion.openCard('Dark Ruler No More'); return false;">Dark Ruler No More</a>, <a href="#" class="form-link" onclick="Formacion.openCard('Evenly Matched'); return false;">Evenly Matched</a>.</li>
            <li><strong>Anti-Handtrap (Anti-Trampa de Mano):</strong> Protege tu combo de las Handtraps del oponente. <a href="#" class="form-link" onclick="Formacion.openCard('Crossout Designator'); return false;">Crossout Designator</a> y <a href="#" class="form-link" onclick="Formacion.openCard('Called by the Grave'); return false;">Called by the Grave</a> son los ejemplos más claros — en decks combo, son tan importantes como el combo mismo.</li>
        </ul>

        <h3 class="form-nb-subtitle">🏆 Cartas de Finalización (lo que gana el duelo)</h3>
        <ul class="form-nb-list">
            <li><strong>Boss Monster (Monstruo Jefe):</strong> La amenaza final del combo. El oponente necesita resolverlo para sobrevivir — y si tiene buenas protecciones, hacerlo es muy difícil. Un buen Boss Monster niega, destruye, es indestructible o tiene alta ATK. Ej: <a href="#" class="form-link" onclick="Formacion.openCard('Baronne de Fleur'); return false;">Baronne de Fleur</a>.</li>
            <li><strong>Endboard (Campo Final):</strong> No es una carta — es el estado completo de tu campo cuando terminas tu turno. Un endboard fuerte = varios Boss Monsters con diferentes tipos de negación.</li>
        </ul>
        <p class="form-nb-text">
            Para mapear estos roles en tu propia línea real (Starter → Extenders → Boss Monster/Endboard), usa
            <a href="#" class="form-link" onclick="Formacion.goToTab('mideck','combos'); return false;">Mi Deck → 🧬 Línea de Combos</a>.
        </p>

        <h3 class="form-nb-subtitle">🧭 Las 4 Funciones Universales</h3>
        <p class="form-nb-text">Más allá de los nombres específicos, toda carta en el juego hace una de estas:</p>
        <ul class="form-nb-list">
            <li><strong>Motor:</strong> te ayuda a generar recursos, buscar o invocar más cartas.</li>
            <li><strong>Interacción:</strong> interrumpe o responde al oponente.</li>
            <li><strong>Protección:</strong> mantiene tu campo o tus cartas en el juego.</li>
            <li><strong>Ventaja de Recursos:</strong> te da más cartas, monstruos o LP que el oponente.</li>
        </ul>
        <p class="form-nb-text">Cuando no sepas dónde clasificar una carta, usa estas 4 categorías.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El error más frecuente del novato es evaluar una carta por su ATK o porque "se ve poderosa". La pregunta correcta es: ¿qué función cumple en mi deck? Una carta que no cumple ninguna función concreta es una carta que no debería estar en el deck, sin importar qué tan impresionante parezca en papel.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('funciones-de-las-cartas')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Con un deck cargado en <strong>Mi Deck</strong>, abre cualquier carta desde <strong>Buscador</strong>: el visor calcula
            en vivo su "🎯 Posibles Roles" y su "📊 Aporte al deck activo" (delta de Consistencia/Potencia/Resiliencia si la agregaras).
            Compara ese resultado con tu propia clasificación de esta lección. Para ver o editar cómo la app detecta cada rol
            (keywords, condiciones), entra a
            <a href="#" class="form-link" onclick="Formacion.goToConfigSection('roles-section'); return false;">Config → 🎭 Mecánicas y Roles</a>.
        </p>
    `; },
_topicPalabrasTecnicas: function () { return `
        <h2 class="form-nb-title">Palabras Clave y Técnicas del Juego</h2>
        <p class="form-nb-text">Más allá del texto oficial de las cartas, los jugadores competitivos usan una jerga propia para describir técnicas y patrones que se repiten partida tras partida. Conocerla no cambia las reglas — cambia qué tan rápido entiendes lo que pasa en la mesa y lo que dice la comunidad (guías, streams, foros).</p>

        <h3 class="form-nb-subtitle">🎲 Estado del Juego (Game State)</h3>
        <p class="form-nb-text">El "Estado del Juego" es el contexto completo del duelo en un momento dado: qué hay en cada mano, cada campo, cada cementerio, cuántos LP tiene cada jugador, en qué fase están y quién tiene la prioridad. La jugada correcta casi nunca depende de una sola carta — depende de leer todo este estado antes de decidir.</p>
        <ul class="form-nb-list">
            <li><strong>Recursos en mano:</strong> tuyos (conocidos) y del rival (deducidos por lo que ya activó o dejó de activar).</li>
            <li><strong>Campo:</strong> monstruos, Hechizos/Trampas boca arriba y boca abajo de ambos lados — y qué de eso ya se puede considerar "gastado".</li>
            <li><strong>Cementerio y Desterrados:</strong> qué recursos ya no están disponibles y qué efectos de recuperación podrían reactivarlos.</li>
            <li><strong>LP y fase del juego:</strong> cuánto margen de error tienes y si conviene jugar agresivo o conservador.</li>
        </ul>
        <p class="form-nb-text">Dos jugadores con las mismas cartas en mano pueden tomar decisiones opuestas y ambas ser correctas, si el Estado del Juego frente a ellos es distinto.</p>

        <h3 class="form-nb-subtitle">🔄 Bounce (Regresar a la Mano)</h3>
        <p class="form-nb-text">"Hacer bounce" es regresar una carta del campo a la mano de su dueño — no la destruye ni la manda al cementerio. Es una acción legal distinta de destruir o desterrar (ver <a href="#" class="form-link" onclick="Formacion.switchTab('vocabulario-legal'); return false;">Vocabulario Legal del Juego</a>).</p>
        <ul class="form-nb-list">
            <li><strong>Sobre el rival:</strong> quita tempo — su carta vuelve a la mano y debe gastar otro recurso para reactivarla. No dispara efectos "si es destruida" ni "si es enviada al cementerio", porque ninguna de las dos cosas ocurrió.</li>
            <li><strong>Sobre tu propia carta:</strong> la técnica más importante — regresarla te permite volver a invocarla y disparar de nuevo cualquier efecto "cuando es invocada" (recursión), multiplicando el valor de una sola carta.</li>
        </ul>
        <p class="form-nb-text">Ejemplo real: <a href="#" class="form-link" onclick="Formacion.openCard('Compulsory Evacuation Device'); return false;">Compulsory Evacuation Device</a> es un Hechizo de Juego Rápido genérico que selecciona cualquier monstruo en campo (propio o rival) y lo regresa a la mano — sirve tanto para quitarle tempo a un Boss Monster rival como para reciclar tu propio monstruo con efecto de invocación.</p>

        <h3 class="form-nb-subtitle">🌀 Float (Cartas "Flotantes")</h3>
        <p class="form-nb-text">Un efecto "flota" (float) cuando se dispara justo cuando la carta sale del campo — sin importar si fue por destrucción, tributo, uso como material de Fusión/Sincro/XYZ/Link, o desterrada. Un floater le da al rival una razón para pensar dos veces antes de removerlo, porque quitarlo del campo no evita el valor — al contrario, es lo que lo activa.</p>
        <p class="form-nb-text">Ejemplo conocido del meta: <a href="#" class="form-link" onclick="Formacion.openCard('Sky Striker Ace - Kagari'); return false;">Sky Striker Ace - Kagari</a> suma una Magia/Trampa "Sky Striker" del deck a la mano cuando sale del campo, sin importar cómo salió. El rival no gana nada removiéndola — el float ya cumplió su función.</p>

        <h3 class="form-nb-subtitle">🤺 Dodge (Esquivar la Interacción)</h3>
        <p class="form-nb-text">"Esquivar" (dodge) es evitar que una remoción dirigida ("target") cumpla su función, quitando la carta amenazada del campo antes de que el efecto rival resuelva. Si el objetivo original ya no está donde el efecto lo esperaba, ese efecto falla por falta de objetivo válido ("whiff") — sin importar qué tan poderosa fuera la remoción.</p>
        <ul class="form-nb-list">
            <li><strong>Cómo se hace:</strong> con tu propio bounce, tributo, o convirtiendo la carta amenazada en material de una Invocación Especial en respuesta, antes de que la cadena del rival resuelva.</li>
            <li><strong>Por qué importa:</strong> es la diferencia entre perder una carta a un solo removal o convertir esa amenaza en la base de tu próxima jugada.</li>
        </ul>
        <p class="form-nb-text">Este patrón depende directamente de entender <a href="#" class="form-link" onclick="Formacion.switchTab('cadenas-prioridad'); return false;">Cadenas, Prioridad y Spell Speed</a> — sin saber en qué eslabón puedes responder, no hay ventana para esquivar nada.</p>

        <h3 class="form-nb-subtitle">🧮 Jerga de Ventaja de Cartas</h3>
        <ul class="form-nb-list">
            <li><strong>+1 / -1 (Ventaja neta):</strong> contar cuántas cartas gastaste contra cuántas del rival neutralizaste o generaste. Gastar 1 para negar 1 es "1-for-1" (neutral); gastar 1 para negar 2 es un "+1" a tu favor.</li>
            <li><strong>Bait (Carnada):</strong> activar a propósito una carta para que el rival gaste su interrupción ahí, dejando pasar tu jugada real.</li>
            <li><strong>Blowout:</strong> una jugada que parecía segura pero termina costando mucho más de lo esperado — típicamente caminar directo hacia un Boardbreaker que no se vio venir.</li>
            <li><strong>In position / Out of position:</strong> "in position" es tener las piezas necesarias en mano o campo para tu plan de juego; "out of position" es lo contrario — te obliga a improvisar.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Esta jerga no son reglas oficiales — son atajos que la comunidad usa para nombrar patrones reales del juego. Cuando alguien dice "esa carta flota" o "voy a esquivar con esto", ya sabes exactamente a qué técnica se refiere y por qué importa en el Estado del Juego actual.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('palabras-tecnicas-juego')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Con un deck cargado, abre cualquier carta desde <strong>Buscador</strong>: el visor calcula en vivo su "🎯 Posibles Roles" y su
            "📊 Aporte al deck activo" — útil para confirmar si una pieza que valoras por su float o su bounce realmente suma
            Consistencia/Potencia/Resiliencia a tu deck concreto. Para saber si tu deck está construido para ir primero o ir
            segundo (la base de saber cuándo esquivar en vez de proteger), revisa "Going First / Going Second" en
            <strong>Estadísticas → Análisis de Deck</strong>. Y cada ronda real donde rompiste el campo rival o el rival te negó
            la jugada, regístrala en <strong>Mi Deck → 🎯 Optimización</strong> — esos datos alimentan tu Nivel como Piloto del Deck.
        </p>
    `; },
    _topicEstructuraArquetipos: function () { return `
        <h2 class="form-nb-title">Estructura de un Arquetipo (Diseño TCG)</h2>
        <p class="form-nb-text">Cada arquetipo nuevo parece un rompecabezas distinto, pero casi todos se arman con las mismas piezas de diseño. Aprender ese patrón te permite abrir una carta que viste por primera vez hace 5 minutos y ya saber qué función cumple, sin esperar a que exista una guía.</p>

        <h3 class="form-nb-subtitle">🎮 Fundamentos de Diseño de un TCG</h3>
        <ul class="form-nb-list">
            <li><strong>Costo vs Efecto:</strong> toda carta fuerte paga un precio — una carta, LP, un tributo, una restricción de invocación. Un TCG balanceado casi nunca da algo poderoso completamente gratis.</li>
            <li><strong>Ventaja de Recursos como moneda:</strong> cartas en mano, monstruos en campo y LP son la "moneda" del juego. El diseño de cada carta decide cuánta moneda pide y cuánta devuelve.</li>
            <li><strong>Redundancia vs Versatilidad:</strong> un deck necesita piezas redundantes (varias copias que hacen lo mismo, para consistencia) y piezas versátiles (que sirven en distintos escenarios). Los arquetipos bien diseñados combinan ambas.</li>
            <li><strong>Restricciones como balance:</strong> cuando un efecto es muy fuerte, el diseño lo limita con un costo, una condición o un "una vez por turno" — no le quita poder, controla cuántas veces se puede repetir.</li>
        </ul>

        <h3 class="form-nb-subtitle">🏷️ Arquetipo vs Serie</h3>
        <p class="form-nb-text">Son términos oficiales distintos, no sinónimos:</p>
        <ul class="form-nb-list">
            <li><strong>Arquetipo:</strong> cartas que comparten un nombre específico (ej. "Blue-Eyes", "Sky Striker") o cuyo propio texto las declara "siempre tratadas como" cartas de ese nombre. Cualquier efecto que diga "1 monstruo '[Arquetipo]'" las reconoce a todas por igual.</li>
            <li><strong>Serie:</strong> cartas relacionadas por tema, arte o mecánica compartida, pero sin ese requisito de nombre. Ej: "Number" es oficialmente una Serie, no un Arquetipo — comparten "Number" en el nombre, pero un efecto que pide "1 monstruo Number" no las trata igual que un efecto de Arquetipo real.</li>
        </ul>
        <p class="form-nb-text">Por qué importa: si una carta de "apoyo" pide "1 monstruo '[X]'" y la tuya solo pertenece a la Serie pero no al Arquetipo, ese efecto no la reconoce. Confirmarlo evita errores caros al comprar cartas de soporte que en realidad no aplican.</p>

        <h3 class="form-nb-subtitle">🧬 Las Piezas Estándar de un Arquetipo</h3>
        <ul class="form-nb-list">
            <li><strong>Mecánica Unificadora:</strong> la acción que casi todas las cartas del arquetipo comparten o habilitan (desterrar para avanzar, enviar al cementerio para buscar, voltear una moneda, etc.). Es el "gimmick" que lo hace único.</li>
            <li><strong>Starter de bajo costo:</strong> el monstruo más barato de invocar (Nivel/Rango bajo, usualmente buscable) que activa la mecánica desde la mano. Es la primera carta que debes identificar.</li>
            <li><strong>Buscador / Puente:</strong> casi siempre el Hechizo de Campo — busca la pieza que falta y suele dar un segundo beneficio (robar, ganar LP, invocar). Es la carta más clara para entender el arquetipo de un vistazo.</li>
            <li><strong>As / Boss Monster:</strong> el monstruo que da nombre al arquetipo, normalmente el de mayor Nivel/Rango o el de invocación de Extra Deck más compleja. Es el objetivo final del combo.</li>
            <li><strong>Apoyo Continuo:</strong> Magia o Trampa Continua que sostiene el motor de recursos turno tras turno, casi siempre con restricción "una vez por turno" para evitar loops infinitos.</li>
            <li><strong>Apoyo Genérico:</strong> cartas que NO llevan el nombre del arquetipo pero dicen "mientras controles una carta '[X]'..." — funcionan como Staples reciclables entre arquetipos que comparten la misma mecánica base.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔒 Restricciones como Herramienta de Diseño</h3>
        <p class="form-nb-text">Cuando ves "una vez por turno (incluso si este efecto está en el Cementerio o Desterrado)" — el <strong>Hard Once Per Turn (Hard OPT)</strong> — significa que ese efecto está limitado sin importar cuántas copias distintas lo generen. Es la forma en que se permite un efecto muy fuerte sin que se vuelva un loop infinito. Otras restricciones comunes: "no puede ser Invocado Especial excepto por el efecto de una carta '[Arquetipo]'" (obliga a construir el combo específico) o "solo puedes activar esto si controlas una carta '[Arquetipo]'" (protege la identidad del arquetipo de ser abusada por otros decks).</p>

        <h3 class="form-nb-subtitle">🔍 Checklist para Leer un Arquetipo Nuevo</h3>
        <ul class="form-nb-list">
            <li><strong>Paso 1:</strong> busca el Hechizo de Campo o la primera carta de soporte revelada — resume la mecánica y el objetivo de búsqueda.</li>
            <li><strong>Paso 2:</strong> identifica al Starter — el monstruo de menor costo que activa la cadena desde la mano.</li>
            <li><strong>Paso 3:</strong> identifica al As — el que da nombre al arquetipo, usualmente el de mayor Nivel/Rango o del Extra Deck.</li>
            <li><strong>Paso 4:</strong> revisa las restricciones (Hard OPT, condiciones de invocación) — te dicen el límite real de extensión por turno.</li>
            <li><strong>Paso 5:</strong> confirma qué tipo de Invocación de Extra Deck necesita (ver <a href="#" class="form-link" onclick="Formacion.switchTab('tipos-cartas-especiales'); return false;">Tipos de Cartas Especiales</a>) para saber qué debes dominar antes de jugarlo.</li>
        </ul>

        <h3 class="form-nb-subtitle">📚 Ejemplo Real: Blue-Eyes</h3>
        <p class="form-nb-text"><a href="#" class="form-link" onclick="Formacion.openCard('Blue-Eyes White Dragon'); return false;">Blue-Eyes White Dragon</a> es el As que da nombre al arquetipo — prácticamente todo el soporte "Blue-Eyes" gira en torno a invocarlo más rápido, protegerlo en campo o convertirlo en algo superior, como <a href="#" class="form-link" onclick="Formacion.openCard('Blue-Eyes Ultimate Dragon'); return false;">Blue-Eyes Ultimate Dragon</a>, que fusiona 3 copias del original en un solo monstruo. Es el patrón completo: un As icónico + soporte que existe únicamente para llevarte a él más rápido y con más protección.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">No memorices arquetipos uno por uno — memoriza el patrón. Cuando salga el próximo arquetipo, ya sabrás dónde mirar primero (Field Spell), qué buscar (el Starter) y qué esperar al final (el As). Esa habilidad de lectura vale más a largo plazo que memorizar cualquier decklist específica.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('estructura-arquetipos')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            En <strong>Buscador → ⚙ Filtros avanzados</strong>, el selector de Arquetipo trae de un jalón todas las cartas de
            un arquetipo nuevo — aplica el checklist de esta lección directamente sobre esa lista. Al abrir cualquier carta
            en el CardViewer, el campo "Arquetipo:" es un link directo a esa misma búsqueda. El sistema de roles de la app
            (<a href="#" class="form-link" onclick="Formacion.goToConfigSection('roles-section'); return false;">Config → 🎭 Mecánicas y Roles</a>)
            no depende del nombre del arquetipo — detecta Starter/Searcher/Boss Monster por palabras clave en el texto, así
            que un arquetipo recién salido ya se clasifica automáticamente en cuanto agregas sus cartas al deck.
        </p>
    `; },
    _topicMentalidadJugador: function () { return `
        <h2 class="form-nb-title">Mentalidad del Jugador</h2>
        <p class="form-nb-text">Las reglas se aprenden en semanas. Los combos se memorizan en días. Pero la mentalidad correcta tarda meses o años en instalarse — y es lo que determina si realmente mejorarás como jugador.</p>

        <h3 class="form-nb-subtitle">🎮 El Juego Ya No Es para Niños (y Eso Es Bueno)</h3>
        <p class="form-nb-text">Invocar un monstruo, subirle el ATK y atacar era la estrategia estándar hace 20 años. Hoy, esa jugada en turno 1 es básicamente pasar el turno. El juego creció porque adultos con mentalidad estratégica entraron a la comunidad y elevaron el nivel. No tienes que llegar a ese nivel de golpe, pero sí entender que el estándar de juego promedio ya no es el que ves en el anime.</p>

        <h3 class="form-nb-subtitle">🧠 Las Mentalidades Correctas</h3>
        <ul class="form-nb-list">
            <li><strong>"Siempre habrá una carta mejor para mi estrategia":</strong> no todas las cartas que hacen lo mismo son iguales en tu deck. El contexto importa — la mejor carta genérica puede ser peor que una específica que encaje con tu plan de juego.</li>
            <li><strong>"Las cartas no se evalúan solas — se evalúan en conjunto":</strong> una carta poderosa puede arruinar un deck si contradice su estrategia. Antes de agregarla, pregúntate: ¿qué hace en mano vacía? ¿ayuda al combo o lo interrumpe?</li>
            <li><strong>"Cada carta fue creada con una función específica":</strong> no existe la carta inútil, existe la carta usada en el deck equivocado. Antes de descartar una carta, pregunta para qué fue diseñada.</li>
            <li><strong>"Gusto vs conveniencia":</strong> si quieres ser competitivo, la conveniencia gana siempre. Puedes tener decks de gusto y decks competitivos — no tienes que elegir uno, pero en el deck de torneo las decisiones deben ser funcionales.</li>
            <li><strong>"Los costos altos no son malos — depende del deck":</strong> el "disadvantage" de una carta es el "advantage" de otra en el deck correcto.</li>
            <li><strong>"Practicar un deck es lo que lo hace bueno, no las cartas solas":</strong> el deck en papel es una hipótesis; el deck jugado 50 veces es la respuesta.</li>
            <li><strong>"El META es el conjunto de las mejores cartas descubiertas hasta ahora":</strong> no es permanente ni definitivo — es el mejor entendimiento colectivo del momento, y puede cambiar en 3 meses.</li>
            <li><strong>"Todo deck tiene puntos débiles — incluyendo el meta":</strong> no hay deck invencible, solo decks cuyo counter aún nadie ha encontrado.</li>
            <li><strong>"Los decks no-meta pueden ganar — pero les falta consistencia":</strong> pueden vencer a cualquier deck meta en una partida, pero hacerlo consistentemente en 7+ rondas requiere mucho más conocimiento del meta para compensar.</li>
            <li><strong>"Yu-Gi-Oh! es un juego de probabilidad y estadística":</strong> entender esto evita frustraciones cuando "no salió lo que necesitabas" y ayuda a construir decks que maximicen probabilidades.</li>
            <li><strong>"Consistencia vs Potencia — siempre hay que elegir":</strong> no puedes maximizar ambas al mismo tiempo. Saber qué necesita tu deck es una decisión estratégica, no técnica.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔍 Cómo Usar el Tipo de Carta Correctamente</h3>
        <p class="form-nb-text">Antes de activar cualquier carta, pregúntate:</p>
        <ul class="form-nb-list">
            <li><strong>¿Es mi turno o el del oponente?</strong> Determina qué cartas puedes usar activamente.</li>
            <li><strong>¿Cuántas interacciones tiene el oponente (que yo sepa)?</strong> Si tiene muchas, no gastes tu combo principal todavía.</li>
            <li><strong>¿Cómo empezó el oponente?</strong> Mano llena y campo vacío probablemente significa Handtraps.</li>
            <li><strong>¿Cuántas partidas llevamos en el match?</strong> En la 2da y 3ra partida, el Side Deck cambia todo.</li>
            <li><strong>¿Voy ganando o perdiendo?</strong> Si vas perdiendo, vale asumir más riesgos. Si vas ganando, juega seguro.</li>
        </ul>

        <h3 class="form-nb-subtitle">📈 De la Teoría a los Datos Reales</h3>
        <p class="form-nb-text">
            Estas mentalidades dejan de ser frases cuando las mides. Cada ronda que registras en
            <strong>Mi Deck → 🎯 Optimización</strong> (resultado, presión de tiempo, si rompiste o te negaron la jugada) es la
            autoevaluación que separa a quien "siente" que jugó bien de quien lo sabe con datos. Con suficientes rondas, tu
            <strong>Nivel como Piloto del Deck</strong> (ahí mismo y en Estadísticas) sube — "practicar el deck es lo que lo
            hace bueno" deja de ser una frase y se vuelve un número real.
        </p>
        <p class="form-nb-text">
            El mismo bloque de Optimización tiene el quiz <strong>🧩 Complejidad del Deck</strong>: separa la curva de aprendizaje
            (qué tan fácil es empezar) del techo de habilidad (qué tan difícil es dominarlo al máximo) — los mismos dos ejes detrás
            de "gusto vs conveniencia" y "los costos altos no son malos, depende del deck". Evalúa tu deck ahí para ponerle un
            número a esa intuición.
        </p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">La mentalidad es lo que convierte el conocimiento técnico en victoria real. Puedes saber todos los combos del meta y perder constantemente si tu toma de decisiones bajo presión es mala. El mejor entrenamiento no es aprender más combos — es aprender a pensar mejor en los momentos donde la jugada correcta no es obvia.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('mentalidad-del-jugador')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Antes de tu próxima partida real, repasa el checklist de 5 preguntas de esta lección. Después de jugarla, entra a
            <strong>Mi Deck → 🎯 Optimización</strong> y registra la ronda con sus datos reales (orden, resultado, presión de
            tiempo, si tuviste que romper el campo rival). Para practicar la toma de decisiones sin que una partida real esté en
            juego, usa
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','duelo'); return false;">Simuladores → ⚔️ Duelo en Vivo</a>,
            que incluye el cronómetro de Master Duel para simular presión de tiempo real.
        </p>
    `; },

    _topicCadenasPrioridad: function () { return `
        <h2 class="form-nb-title">Cadenas, Prioridad y Spell Speed</h2>
        <p class="form-nb-text">El sistema de cadenas es el motor del juego a nivel técnico. Entenderlo completamente es lo que te permite activar tus cartas en el momento correcto, responder al oponente sin cometer errores y ganar disputas que un jugador sin este conocimiento perdería.</p>

        <h3 class="form-nb-subtitle">⚡ Spell Speed (Velocidad de Hechizo)</h3>
        <p class="form-nb-text">Cada efecto tiene una velocidad. Una cadena solo puede subir de velocidad, nunca bajar: un efecto de velocidad 2 puede responder a uno de velocidad 2 o 1, pero no a uno de velocidad 3.</p>
        <ul class="form-nb-list">
            <li><strong>Velocidad 1:</strong> Efectos que NO pueden activarse como respuesta directa a otro efecto — son la base de la cadena, nunca el eslabón reactivo. Incluye Efectos de Ignición (Ignition Effects) de monstruo, Efectos Continuos (ni siquiera generan cadena, solo aplican mientras la carta esté en campo), y Magias Normales, de Campo, de Equipo y de Ritual.</li>
            <li><strong>Velocidad 2:</strong> Pueden responder a velocidad 1 y a velocidad 2. Incluye Quick Effects de monstruo, Magias de Juego Rápido (Quick-Play), Trampas Normales y Continuas, y las Handtraps (se activan desde la mano como velocidad 2).</li>
            <li><strong>Velocidad 3:</strong> Solo puede responder a velocidad 3. Son las Trampas Counter (Counter Traps) — <a href="#" class="form-link" onclick="Formacion.openCard('Solemn Judgment'); return false;">Solemn Judgment</a>, <a href="#" class="form-link" onclick="Formacion.openCard('Solemn Warning'); return false;">Solemn Warning</a>, etc. La única forma de responder a una Counter Trap es con otra Counter Trap.</li>
        </ul>

        <h3 class="form-nb-subtitle">🧩 Tipos de Efectos</h3>
        <ul class="form-nb-list">
            <li><strong>Trigger Effect (Efecto Gatillo):</strong> se activa automáticamente cuando ocurre un evento específico. Puede ser <em>mandatorio</em> (DEBE activarse, ej. "cuando esta carta es destruida, haz X") u <em>opcional</em> (PUEDE activarse, ej. "cuando esta carta es enviada al cementerio, puedes..." — los opcionales pueden "miss the timing", ver Tema: IF vs WHEN y Timing Avanzado).</li>
            <li><strong>Ignition Effect (Efecto Ignición):</strong> lo activas voluntariamente durante una ventana abierta en tu turno. Velocidad 1, no puede activarse como respuesta. Ej: "Una vez por turno: puedes..." en la descripción de un monstruo.</li>
            <li><strong>Quick Effect (Efecto Rápido):</strong> velocidad 2. Puede activarse en el turno del oponente o en respuesta a sus efectos. Se indican con "(Quick Effect):" en el texto.</li>
            <li><strong>Continuous Effect (Efecto Continuo):</strong> aplica automáticamente mientras la carta esté en campo. No genera cadena, simplemente está activo. Ej: "Los monstruos que controla tu oponente no pueden activar efectos."</li>
        </ul>

        <h3 class="form-nb-subtitle">🔗 Cómo Funciona una Cadena</h3>
        <p class="form-nb-text">Una cadena es una secuencia de efectos activados en respuesta mutua. Se resuelve al revés: el último activado resuelve primero (LIFO — Last In, First Out).</p>
        <ul class="form-nb-list">
            <li><strong>Ejemplo:</strong> Jugador A activa <a href="#" class="form-link" onclick="Formacion.openCard('Ash Blossom & Joyous Spring'); return false;">Ash Blossom</a> (Vel. 2) — Eslabón 1. Jugador B responde con <a href="#" class="form-link" onclick="Formacion.openCard('Called by the Grave'); return false;">Called by the Grave</a> (Vel. 2) — Eslabón 2. Resolución: Called by the Grave resuelve primero (eslabón 2) y destierra a Ash del cementerio, negándola. Ash Blossom intenta resolver (eslabón 1) pero ya no puede porque fue negada.</li>
            <li>Las cadenas siempre se construyen completamente ANTES de resolverse. No puedes activar un nuevo efecto a mitad de la resolución.</li>
            <li>Si el eslabón 1 (el original) es negado, el resto de la cadena resuelve igual desde el eslabón más alto hacia abajo — no se cancela toda la cadena.</li>
        </ul>

        <h3 class="form-nb-subtitle">👑 Ventana de Interacción</h3>
        <p class="form-nb-text">Es el momento en que puedes activar efectos de velocidad 2 o superior como respuesta a lo que el oponente está haciendo.</p>
        <ul class="form-nb-list">
            <li><strong>Se abre cuando:</strong> el jugador activo activa un efecto (hechizo, trampa, efecto de monstruo), realiza una invocación (especial o normal), o realiza una acción visible (cambiar de posición, atacar).</li>
            <li><strong>Se cierra cuando:</strong> ambos jugadores pasan sin agregar nada a la cadena, o cuando la cadena resuelve y ningún jugador agrega otro efecto.</li>
            <li><strong>Prioridad en la ventana:</strong> primero los efectos mandatorios, luego los trigger opcionales del jugador activo, luego los trigger opcionales del oponente, y por último los efectos rápidos. El jugador sin nada que activar debe ceder prioridad.</li>
        </ul>

        <h3 class="form-nb-subtitle">🚫 Error Frecuente: Activar sin Ventana</h3>
        <p class="form-nb-text">Si el oponente no ha hecho nada que genere una ventana, no puedes activar tu Handtrap — solo puedes activarla en respuesta a algo. Un Quick Effect de monstruo tampoco puede activarse en cualquier momento: necesita que haya una ventana abierta o que sea tu turno en una fase válida.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El 80% de las disputas en torneo vienen de no entender cuándo hay ventana. Si tienes dudas sobre si puedes activar algo, pregunta: ¿hubo una acción o efecto de mi oponente que abrió la ventana? Si la respuesta es no, espera.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('cadenas-prioridad')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Abre en <strong>Buscador</strong> las cartas de esta lección y confirma tú mismo su Spell Speed leyendo su tipo
            (Trampa Normal vs Counter Trap, Quick-Play vs Normal). Luego practica construir y resolver una cadena paso a paso
            campo real en
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','practica'); return false;">Simuladores → 🎴 Zona de Práctica</a>,
            o aplícalo directamente en una partida cronometrada con
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','duelo'); return false;">Simuladores → ⚔️ Duelo en Vivo</a>.
        </p>
    `; },

    _topicStaples: function () { return `
        <h2 class="form-nb-title">Staples del Formato</h2>
        <p class="form-nb-text">Un Staple es una carta tan generalmente útil que aparece en la mayoría de los decks del meta, independientemente del arquetipo. No son "las mejores cartas del juego" — son las más versátiles para el meta actual. Y cambian con cada banlist y cada expansión.</p>

        <h3 class="form-nb-subtitle">❓ Qué Hace a una Carta Ser Staple</h3>
        <ul class="form-nb-list">
            <li>Tiene efecto sin ser específica de un arquetipo.</li>
            <li>Su función es universalmente útil (negar, destruir, buscar).</li>
            <li>No contradice las restricciones de la mayoría de los decks.</li>
            <li>Su presencia en el meta justifica su inclusión defensiva u ofensiva.</li>
        </ul>
        <p class="form-nb-text">Una carta puede ser Staple en un meta y completamente prescindible en otro. Por eso el criterio de "Staple eterno" casi no existe — todo cambia.</p>

        <h3 class="form-nb-subtitle">🤚 Handtraps (Interrupciones desde la Mano)</h3>
        <p class="form-nb-text">Haz clic en cada nombre para abrir su carta real:</p>
        <ul class="form-nb-list">
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Ash Blossom & Joyous Spring'); return false;">Ash Blossom &amp; Joyous Spring</a>:</strong> Niega cualquier efecto que busque, robe o invoque especialmente desde el deck. Una de las más versátiles del juego.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Droll & Lock Bird'); return false;">Droll &amp; Lock Bird</a>:</strong> Si el oponente agrega 1+ cartas a su mano desde el deck en un turno, niega que puedan agregar más ese mismo turno.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Maxx &quot;C&quot;'); return false;">Maxx "C"</a>:</strong> Roba 1 carta cada vez que el oponente invoca especialmente ese turno. Prohibida en TCG, pero la más icónica del juego.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Mulcharmy Fuwalos'); return false;">Mulcharmy Fuwalos</a> / <a href="#" class="form-link" onclick="Formacion.openCard('Mulcharmy Purulia'); return false;">Purulia</a>:</strong> Hacen robar cartas si el oponente invoca monstruos de cierto tipo bajo ciertas condiciones.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Ghost Belle & Haunted Mansion'); return false;">Ghost Belle &amp; Haunted Mansion</a>:</strong> Niega efectos del cementerio, zonas desterradas o efectos de turno extra.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Effect Veiler'); return false;">Effect Veiler</a>:</strong> Niega el efecto de un monstruo hasta el final del turno. Velocidad 1 desde la mano — limitada pero específica.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Infinite Impermanence'); return false;">Infinite Impermanence</a>:</strong> Niega el efecto de un monstruo en campo. Juego Rápido, puede usarse en el turno del oponente. Si lo seteas en la primera columna sin carta, te da inmunidad a esa columna.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Nibiru, the Primal Being'); return false;">Nibiru, the Primal Being</a>:</strong> Si el oponente ha invocado especialmente 5+ monstruos en ese turno, puedes tributarlos todos y dar un Token Nibiru. La respuesta a los combo-decks.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('D.D. Crow'); return false;">D.D. Crow</a>:</strong> Destierra 1 carta del cementerio del oponente desde la mano. Muy específico pero devastador contra decks que usan el cementerio.</li>
        </ul>

        <h3 class="form-nb-subtitle">🛡️ Anti-Handtraps (Protegen tu Combo)</h3>
        <ul class="form-nb-list">
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Called by the Grave'); return false;">Called by the Grave</a>:</strong> Destierra 1 carta del cementerio del oponente y niega efectos de cartas con ese nombre ese turno. Contraresta Ash, Ghost Belle.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Crossout Designator'); return false;">Crossout Designator</a>:</strong> Declara un nombre de carta que tienes en tu deck. Niega todos los efectos de cartas con ese nombre ese turno. Respuesta a casi cualquier Handtrap.</li>
        </ul>

        <h3 class="form-nb-subtitle">💥 Boardbreakers (Destruyen el Campo del Oponente)</h3>
        <p class="form-nb-text">Para usar cuando vas segundo y el oponente ya tiene campo construido.</p>
        <ul class="form-nb-list">
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Raigeki'); return false;">Raigeki</a> / <a href="#" class="form-link" onclick="Formacion.openCard('Dark Hole'); return false;">Dark Hole</a>:</strong> Destruye todos los monstruos del oponente. Clásico.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Dark Ruler No More'); return false;">Dark Ruler No More</a>:</strong> Niega todos los efectos de los monstruos del oponente hasta el final del turno. No pueden ser respondidos. Limpia el camino.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Forbidden Droplet'); return false;">Forbidden Droplet</a>:</strong> Manda cartas al cementerio para negar efectos y bajar ATK a la mitad. La respuesta más versátil al campo rival.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Evenly Matched'); return false;">Evenly Matched</a>:</strong> El oponente desterrará cartas hasta tener 1. Devastador si el oponente tiene campo lleno y tú tienes pocos recursos.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Super Polymerization'); return false;">Super Polymerization</a>:</strong> Fusiona usando cartas del campo del oponente. No puede ser respondida. Quita 2+ amenazas en 1 carta.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Lightning Storm'); return false;">Lightning Storm</a>:</strong> Destruye todos los monstruos de ataque O todos los mágicas/trampas boca abajo del oponente. Solo funciona con mano vacía.</li>
        </ul>

        <h3 class="form-nb-subtitle">👑 Monstruos Endboard Universales</h3>
        <p class="form-nb-text">Van al campo del oponente o se usan en el campo para cerrar el duelo.</p>
        <ul class="form-nb-list">
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('I:P Masquerena'); return false;">I:P Masquerena</a>:</strong> Link 2. Permite invocar Links en el turno del oponente. Acceso al Extra Deck como respuesta.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('S:P Little Knight'); return false;">S:P Little Knight</a>:</strong> Link 2. Destierra temporalmente cualquier monstruo en campo. Una de las mejores cartas del formato actual.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Accesscode Talker'); return false;">Accesscode Talker</a>:</strong> Link 4. Efecto de destrucción continua al invocar el Link correcto. Cierra duelos por sí solo.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Chaos Angel'); return false;">Chaos Angel</a>:</strong> Sincro 10. Inafectado por hechizos/trampas y puede desterrar al hacer daño. Endboard de alto impacto.</li>
        </ul>

        <h3 class="form-nb-subtitle">📜 Magias y Trampas de Utilidad</h3>
        <ul class="form-nb-list">
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Monster Reborn'); return false;">Monster Reborn</a>:</strong> Invoca especialmente 1 monstruo del cementerio de cualquiera.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Solemn Judgment'); return false;">Solemn Judgment</a>:</strong> Niega 1 invocación, hechizo o trampa pagando la mitad de LP.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Solemn Warning'); return false;">Solemn Warning</a> / <a href="#" class="form-link" onclick="Formacion.openCard('Solemn Strike'); return false;">Solemn Strike</a>:</strong> Más específicas pero siguen siendo poderosas.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Dimensional Barrier'); return false;">Dimensional Barrier</a>:</strong> Declara 1 tipo de invocación especial (Fusión, Sincro, etc.). El oponente no puede usar ese tipo en ese turno.</li>
        </ul>

        <h3 class="form-nb-subtitle">✅ Cómo Usar Este Conocimiento</h3>
        <p class="form-nb-text">No incluyas un Staple solo porque "es bueno". Pregunta:</p>
        <ul class="form-nb-list">
            <li>1. ¿Su efecto me sirve en el meta actual?</li>
            <li>2. ¿Su restricción no rompe mi combo?</li>
            <li>3. ¿Tengo el espacio en el deck sin sacrificar consistencia?</li>
        </ul>
        <p class="form-nb-text">Un Staple mal incluido es peor que no incluirlo. Si una Handtrap te deja sin poder jugar tu combo, no la metas por moda.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El criterio más importante para elegir Staples: ¿qué es lo que más me amenaza en el meta actual? Construye tu selección de non-engine en función de eso, no en función de lo que está de moda en los videos.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('staples-formato')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            La sidebar <strong>Mi Deck → Staples</strong> ya trae varios de estos Staples cargados para agregar con un clic.
            Para revisar si alguno está prohibido o limitado en tu formato, entra a <strong>Mi Deck → sidebar → Banlist</strong>
            y usa "＋ Agregar carta" para buscarlo directamente. Y para decidir si una carta cuenta como Staple en tu Internal
            Score, ajústalo en
            <a href="#" class="form-link" onclick="Formacion.goToConfigSection('staples-section'); return false;">Config → 📌 Lista de Staples</a>.
        </p>
    `; },
_topicSecuenciacion: function () { return `
        <h2 class="form-nb-title">Secuenciación: El Orden Importa</h2>
        <p class="form-nb-text">En Yu-Gi-Oh! muchas veces no gana quien tiene la mejor mano — gana quien juega sus cartas en el mejor orden. Un jugador novato piensa "empiezo con mi mejor carta". Un jugador de nivel Master piensa "¿qué quiero averiguar antes de comprometer mi mejor carta?".</p>

        <h3 class="form-nb-subtitle">❓ Las 4 Preguntas Antes de Jugar una Carta</h3>
        <p class="form-nb-text">Antes de activar cualquier efecto, pregúntate:</p>
        <ul class="form-nb-list">
            <li><strong>1. ¿Qué información obtengo si esta carta resuelve?</strong></li>
            <li><strong>2. ¿Qué información obtengo si esta carta es negada?</strong></li>
            <li><strong>3. ¿Estoy obligando al rival a decidir ahora, o le estoy regalando una decisión fácil?</strong></li>
            <li><strong>4. ¿Estoy revelando mi plan demasiado pronto?</strong></li>
        </ul>
        <p class="form-nb-text">La mayoría de las partidas se ganan o se pierden en estas cuatro preguntas, no en cuántas cartas poderosas tienes en mano.</p>

        <h3 class="form-nb-subtitle">🔍 El Concepto de "Cartas de Prueba"</h3>
        <p class="form-nb-text">Hay cartas cuyo propósito principal no es resolver — es hacer hablar al rival. Juegas una carta de valor medio primero: si el rival usa una negación importante sobre ella, ya sabes algo (esa carta le preocupaba, o no tiene otra respuesta, o evaluó mal la amenaza). En cualquiera de los tres casos obtuviste información. La información también es un recurso — tan real como una carta en mano.</p>

        <h3 class="form-nb-subtitle">⚠️ El Error del 90% de los Jugadores</h3>
        <p class="form-nb-text">Mano típica: Motor, Motor, Extensor, Handtrap, Buscador. El error casi universal es empezar con el motor más fuerte porque "quieren hacer el combo". Pero muchas veces es mejor empezar con el buscador o una jugada menos comprometida para ver cómo responde el rival antes de exponer la pieza clave.</p>

        <h3 class="form-nb-subtitle">🕵️ La Analogía del Detective</h3>
        <p class="form-nb-text">Un detective no llega a un interrogatorio mostrando todas las pruebas de golpe. Empieza con preguntas pequeñas, observa, deja que el rival hable y cometa errores, y solo entonces presenta la prueba importante. Eso es secuenciar: administrar cuándo revelas cada pieza de tu plan.</p>

        <h3 class="form-nb-subtitle">💰 El Costo de "Limpiar el Camino"</h3>
        <p class="form-nb-text">No siempre conviene forzar que el rival gaste sus cartas colocadas antes de empezar tu combo. Depende del costo: si para hacerlo activar 2 cartas tienes que gastar 3 recursos importantes, el intercambio puede ser malo. La pregunta correcta no es "¿cómo limpio el camino?" — es "¿qué estoy dispuesto a pagar para limpiarlo?".</p>

        <h3 class="form-nb-subtitle">🎯 Los 3 Niveles de Amenaza</h3>
        <ul class="form-nb-list">
            <li><strong>Amenaza inmediata:</strong> si no respondes ahora, pierdes. Ej: una carta que inicia un combo imparable.</li>
            <li><strong>Amenaza latente:</strong> no hace nada ahora, pero en 2 turnos será un problema enorme. Muchos jugadores la ignoran — los buenos la identifican y la neutralizan antes de que crezca.</li>
            <li><strong>Amenaza psicológica:</strong> ni siquiera necesita activarse. El rival juega alrededor de ella. Ej: dejas 2 cartas en mano sin usar y el rival asume que tienes una Handtrap, aunque no la tengas — eso ya te generó valor.</li>
        </ul>

        <h3 class="form-nb-subtitle">🧠 Lectura de Manos por Deducción</h3>
        <p class="form-nb-text">Leer manos no significa adivinar las 5 cartas exactas del rival — significa reducir las posibilidades. Ejemplo: el rival no usó Ash Blossom cuando pudo. Entonces, probablemente: no la tiene, o está esperando un objetivo mejor, o tiene otra interrupción que considera más valiosa. No sabes cuál es la correcta, pero ya pasaste de 100 posibilidades a 3 — y eso es suficiente para decidir mejor.</p>

        <h3 class="form-nb-subtitle">🧪 Ejercicio de Razonamiento</h3>
        <p class="form-nb-text">Vas segundo. El rival tiene: 1 monstruo con negación, 1 carta colocada, 2 cartas en mano. Tú tienes 5 cartas: tu mejor iniciador, un extensor, una carta que destruye un monstruo, una Handtrap inútil en este momento, y una carta que busca. ¿Cuál juegas primero?</p>
        <p class="form-nb-text">No hay una respuesta única — la respuesta correcta siempre empieza con "depende", seguida de preguntas: ¿qué deck juega el rival? ¿qué representa esa carta colocada? ¿qué tipo de negación tiene el monstruo? ¿mi iniciador pierde contra esa negación? ¿mi buscador fuerza una respuesta? Eso es pensar en probabilidades, no en recetas memorizadas.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El objetivo final no es memorizar el mejor orden de un combo específico — es dejar de jugar cartas y empezar a jugar contra la mente del oponente. Ese cambio de enfoque, más que cualquier carta nueva, es lo que separa a un jugador de nivel medio de uno de nivel Master.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('secuenciacion')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Antes de tu próxima partida, planea el orden de tu línea de combo en
            <a href="#" class="form-link" onclick="Formacion.goToTab('mideck','combos'); return false;">Mi Deck → 🧬 Línea de Combos</a>
            y márcate mentalmente en qué punto exacto usarías una "carta de prueba". Después, en
            <strong>Mi Deck → 🎯 Optimización</strong>, usa el campo <strong>notas</strong> de cada ronda para anotar qué
            información obtuviste (o ignoraste) del rival — con el tiempo verás patrones en tus propias decisiones de orden.
        </p>
    `; },
    _topicAnatomiaDeckCompetitivo: function () { return `
        <h2 class="form-nb-title">Anatomía de un Deck Competitivo</h2>
        <p class="form-nb-text">Todo deck competitivo puede diseccionarse en los mismos componentes. Aprende a leer estas métricas y podrás evaluar cualquier deck que veas, incluso uno que nunca hayas jugado.</p>

        <h3 class="form-nb-subtitle">📐 Los 6 Ejes de Evaluación</h3>
        <ul class="form-nb-list">
            <li><strong>1. Engine — Consistencia:</strong> qué tan probable es que el deck arme su estrategia desde la mano inicial. Ideal: 85%+ de las partidas abriendo con al menos 1 Starter (13+ cartas del engine). Pregunta clave: ¿cuántas cartas del deck "activan" el plan de juego?</li>
            <li><strong>2. Techo de Poder (The Ceiling):</strong> qué tan poderoso es el endboard si el oponente no interrumpió nada. Ideal: 2+ negaciones en campo, con Boardbreakers disponibles y al menos 1 carta anti-meta que el oponente no pueda remover fácilmente.</li>
            <li><strong>3. The Floor — Resiliencia:</strong> qué pasa cuando el oponente interrumpe el combo. Ideal: sobrepasar 2 negaciones corridas y aun así tener una amenaza en campo. Sin Floor = "Glass Cannon" (lo interrumpes y queda muerto). La solución son los Extenders.</li>
            <li><strong>4. Slot Non-Engine — Eficiencia:</strong> el espacio que le queda al deck para Handtraps, Boardbreakers y tech cards después del engine. Un engine de 18 deja 22 para non-engine — mucha libertad. Un engine de 30 en un deck de 40 deja muy poco.</li>
            <li><strong>5. Grind Game / Follow-Up:</strong> qué hace el deck en los turnos 3, 4 y 5 si el duelo se extiende. Ideal: tener jugadas para esos turnos. Sin Grind Game, el deck pierde automáticamente si no cierra rápido.</li>
            <li><strong>6. Fragilidad / Choke Point:</strong> qué tan vulnerable es el deck a una sola carta o combo del oponente. Pregunta clave: ¿qué carta del meta me destruye completamente?</li>
        </ul>

        <h3 class="form-nb-subtitle">📈 Otras Métricas Importantes</h3>
        <ul class="form-nb-list">
            <li><strong>Linealidad:</strong> qué tan fijo es el camino del combo. Un deck lineal es predecible pero poderoso; uno no-lineal tiene múltiples caminos, menos predecible pero más complejo de aprender.</li>
            <li><strong>Versatilidad:</strong> cuántas formas distintas de jugar tiene el deck según la mano y el oponente.</li>
            <li><strong>Cartas Multifuncionales:</strong> cumplen más de un rol en el mismo deck (ej. Starter y Extender según el contexto). Son oro: reducen el tamaño efectivo del engine sin perder funciones.</li>
            <li><strong>Tipo de Interacción:</strong> ¿destruye, destierra, regresa al deck, niega activaciones, niega efectos? Importa porque el oponente puede tener protecciones contra uno u otro.</li>
            <li><strong>Novedad:</strong> qué tan expuesta está la mecánica del deck al meta. Un deck nuevo sorprende porque nadie tiene counters preparados; uno viejo ya es conocido por todos.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Cuando evalúes tu deck, no preguntes solo "¿es poderoso?". Pregunta: ¿es consistente? ¿qué pasa si me niegan? ¿puedo seguir jugando? Un deck con 10/10 de techo de poder pero 2/10 de Floor perderá contra cualquier jugador que haya estudiado sus weaknesses. El balance entre estos 6 ejes es lo que hace a un deck realmente competitivo.</p>

        <h3 class="form-nb-subtitle">🔗 Estos 6 Ejes ya los Mide la App</h3>
        <p class="form-nb-text">
            No son solo teoría: <strong>Engine — Consistencia</strong>, <strong>Techo de Poder</strong> y
            <strong>Floor — Resiliencia</strong> son literalmente los 3 pilares del <strong>Internal Score</strong>
            (Consistencia/Potencia/Resiliencia) que la app calcula en vivo. La <strong>Fragilidad / Choke Point</strong> es
            lo que mide el <strong>External Score</strong> junto a la vulnerabilidad G1/G2 contra el meta cargado.
        </p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('anatomia-deck-competitivo')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Con tu deck activo cargado, entra a
            <a href="#" class="form-link" onclick="Formacion.goToTab('estadisticas'); return false;">Estadísticas</a>
            y abre el Análisis de Deck: verás las barras de Consistencia/Potencia/Resiliencia (tus 3 primeros ejes) y, si
            tienes Power Scores del meta cargados, el External Score con la vulnerabilidad G1/G2 (tu eje de Fragilidad).
            Compara ese desglose numérico contra tu propia evaluación cualitativa de los 6 ejes.
        </p>
    `; },

    _topicDebilidadesDeck: function () { return `
        <h2 class="form-nb-title">Qué Hace Débil a un Deck o Arquetipo</h2>
        <p class="form-nb-text">Si la Anatomía de un Deck Competitivo te enseña a leer lo que hace fuerte a un deck, esta lección es la contraparte: aprender a diagnosticar por qué un deck pierde, de forma sistemática, antes de sentarte a jugar 50 rondas para descubrirlo por prueba y error. Las debilidades vienen de dos fuentes distintas — el diseño del propio arquetipo (lo que Konami imprimió) y las decisiones de construcción (lo que tú decidiste meter o dejar fuera). Separarlas es clave: no puedes arreglar con Optimización un problema que es de diseño.</p>

        <h3 class="form-nb-subtitle">🧬 Debilidades de Diseño (el Arquetipo en Sí)</h3>
        <ul class="form-nb-list">
            <li><strong>Single Point of Failure:</strong> todo el combo depende de 1 sola pieza sin redundancia real (sin buscador, sin sustituto). Si esa carta es negada o no llega a mano, el deck no tiene plan B. Se detecta preguntando: "¿qué pasa si me niegan exactamente esta carta primero?".</li>
            <li><strong>Combo Lineal de Muchos Pasos:</strong> cuantos más eslabones tiene la línea antes de llegar al endboard, más ventanas de interrupción existen. Un combo de 8 pasos da al rival 8 oportunidades de romperte con 1 sola Handtrap; uno de 3 pasos da solo 3.</li>
            <li><strong>Sin Protección/Negación Propia:</strong> arquetipos que dependen 100% de non-engine prestado (Handtraps, Boardbreakers genéricos) para sobrevivir, porque su propio kit no incluye ninguna interrupción. Reduce drásticamente el espacio disponible para tech cards.</li>
            <li><strong>Curva de Invocación Alta sin Payoff Proporcional:</strong> el arquetipo exige mucho esfuerzo (varios materiales, varias invocaciones intermedias) para un resultado que otro deck logra con la mitad de recursos. Es ineficiente incluso si "funciona".</li>
            <li><strong>Sin Follow-Up (Grind Game Nulo):</strong> el deck todo lo apuesta al primer turno; si el duelo se extiende a los turnos 3-5, no tiene nada más que hacer y pierde por desgaste.</li>
            <li><strong>Dependencia de un Tipo de Invocación Fácil de Hatear:</strong> arquetipos 100% Special Summon (o 100% Fusión, o 100% Sincro) son vulnerables en bloque a cartas que niegan ese tipo específico de invocación (Dimensional Barrier, Skill Drain, Vanity's Emptiness).</li>
        </ul>

        <h3 class="form-nb-subtitle">🎴 Debilidades de Construcción (Decisiones del Jugador)</h3>
        <ul class="form-nb-list">
            <li><strong>Exceso de Garnets:</strong> cartas situacionales que solo funcionan combadas con otra pieza específica y son cartas muertas en la mano inicial. Cada Garnet extra resta Consistencia real, aunque en teoría sea "poderoso".</li>
            <li><strong>Ratios Mal Calculados:</strong> 1-2 copias de la pieza que realmente activa el combo mientras se meten 3 copias de una tech situacional. El Starter real siempre necesita ser el más redundante del deck.</li>
            <li><strong>Non-Engine Desalineado con el Meta Local:</strong> Handtraps y Boardbreakers elegidos por moda de internet, no por lo que realmente enfrentas en tu meta. Un non-engine "genérico" puede ser ciego a la amenaza real que te está ganando torneos.</li>
            <li><strong>Splash sin Sinergia Real:</strong> mezclar 2 engines de arquetipos distintos que no se potencian entre sí solo porque "ambos son buenos por separado". Resta espacio de deck y consistencia sin sumar un plan de juego coherente.</li>
            <li><strong>Cero Extenders:</strong> construir pensando solo en el Techo de Poder e ignorar el Floor. El deck es imparable si nadie interrumpe, y completamente muerto si lo hacen.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚠️ Señales Claras de que tu Deck es Débil</h3>
        <ul class="form-nb-list">
            <li>Brickeas seguido con manos de 5-6 cartas que "en teoría" deberían tener algo jugable.</li>
            <li>Pierdes recurrentemente contra la misma carta o el mismo tipo de jugada del rival.</li>
            <li>Con 1 sola Handtrap encima, tu turno termina sin ningún resultado en campo.</li>
            <li>Ganas el turno 1 casi siempre, pero pierdes casi siempre que el duelo llega al turno 3+.</li>
            <li>Tienes cartas en el deck que nunca recuerdas haber usado en ninguna partida reciente.</li>
        </ul>

        <h3 class="form-nb-subtitle">🥊 Fragilidad Estructural Frente al Meta</h3>
        <p class="form-nb-text">La debilidad más grave no es interna, es relacional: existe 1 carta o combo específico del formato que, si el rival la tiene, tu deck no tiene ninguna respuesta. Esto no se arregla con más copias de tu propio engine — se arregla identificando esa amenaza puntual y dedicándole espacio de non-engine específico (Tech Cards), o aceptando conscientemente el riesgo si es poco común en tu meta local.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Diagnosticar antes de optimizar. No agregues cartas al azar esperando que "algo mejore" — primero identifica si el problema es de diseño (el arquetipo tiene un techo bajo por naturaleza) o de construcción (tus decisiones de ratio y non-engine). Un arquetipo con debilidad de diseño real tiene un límite competitivo que ninguna optimización de construcción puede superar del todo.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('debilidades-deck')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            La app traduce estos conceptos en números concretos: un <strong>Internal Score</strong> con Resiliencia baja en
            <a href="#" class="form-link" onclick="Formacion.goToTab('estadisticas'); return false;">Estadísticas</a>
            es la señal directa de "Glass Cannon"; un <strong>External Score</strong> con vulnerabilidad G1/G2 alta apunta a
            Fragilidad frente al meta cargado. Revisa también <strong>Mi Deck → 🎯 Optimización → getOptDiagnostics()</strong>,
            que detecta patrones reales de tus propias rondas (exceso de bricks, pocos Boardbreakers de segundo) en vez de
            teoría genérica. Y si dudas de cuánto esfuerzo pide el arquetipo antes de rendir, el quiz de
            <strong>🧩 Complejidad del Deck</strong> te da un número honesto del techo de habilidad que exige.
        </p>
    `; },

    _topicElegirConstruirDeck: function () { return `
        <h2 class="form-nb-title">Cómo Elegir y Construir tu Deck</h2>
        <p class="form-nb-text">Elegir mal un deck es el error más costoso en tiempo, dinero y motivación. Construirlo mal es el segundo. Este tema te da el proceso completo, desde cero hasta tener algo funcional que puedas mejorar.</p>

        <h3 class="form-nb-subtitle">🎯 Parte 1: Elegir tu Deck</h3>
        <ul class="form-nb-list">
            <li><strong>Paso 1 — Define qué quieres del deck:</strong> ¿torneos o casual? ¿combos largos, control lento o agresión rápida? ¿presupuesto limitado? ¿fácil de aprender o difícil pero poderoso?</li>
            <li><strong>Paso 2 — Investiga antes de comprar:</strong> prueba el deck en un simulador (EDOPro, Master Duel, Dueling Nexus) al menos 10 duelos antes de decidir. Revisa tutoriales y comentarios de jugadores experimentados. Analiza si el deck es o fue meta y cuánto tiempo le queda antes de la próxima banlist.</li>
            <li><strong>Paso 3 — Evalúa la curva de aprendizaje:</strong> decks fáciles tienen línea de combo fija y pocas decisiones; decks difíciles tienen múltiples líneas y la diferencia entre buen y mal piloto es enorme. Empieza con algo que puedas ejecutar bien antes de subir dificultad.</li>
            <li><strong>Paso 4 — Considera rareza y precio:</strong> existen opciones budget que juegan al 70-80% del nivel original, sacrificando consistencia, una pieza del endboard o velocidad. Evalúa si ese sacrificio es aceptable para tu objetivo.</li>
        </ul>
        <p class="form-nb-text">
            <em>Pruébalo sin gastar nada:</em> importa una decklist (.ydk o Lista Oficial .pdf) desde
            <strong>Mi Deck → 📥 Importar Deck</strong> y llévala a
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','practica'); return false;">Simuladores → 🎴 Zona de Práctica</a>
            para sentir cómo juega antes de invertir en cartas reales.
        </p>

        <h3 class="form-nb-subtitle">🧩 Parte 2: Entender las Piezas</h3>
        <ul class="form-nb-list">
            <li><strong>Core:</strong> las cartas que definen al arquetipo. Sin ellas, el deck no es el deck. Fijas e irremplazables — siempre en 3 copias si es posible.</li>
            <li><strong>Engine:</strong> el conjunto funcional que arma el combo. Puede incluir cartas de otros arquetipos que complementan.</li>
            <li><strong>Non-Engine:</strong> todo lo que no forma parte del combo pero protege, interrumpe o cierra (Handtraps, Boardbreakers, tech cards). Define tu adaptación al meta.</li>
            <li><strong>Tech Card:</strong> carta no-Staple específica para combatir una amenaza del meta local. Puede ser 1 sola copia y no siempre aparece en decklists genéricos. Ej: <a href="#" class="form-link" onclick="Formacion.openCard('Droll & Lock Bird'); return false;">Droll & Lock Bird</a>.</li>
        </ul>
        <p class="form-nb-text">
            La sidebar <strong>Mi Deck → Staples</strong> ya trae Staples genéricos del formato. Para ajustar cuáles cuentan como
            Staple en tu Internal Score, entra a
            <a href="#" class="form-link" onclick="Formacion.goToConfigSection('staples-section'); return false;">Config → 📌 Lista de Staples</a>.
        </p>

        <h3 class="form-nb-subtitle">🔨 Parte 3: Construir desde Cero</h3>
        <ul class="form-nb-list">
            <li><strong>Paso 1:</strong> define el plan de juego o endboard — ¿qué quieres tener en campo al final de tu primer turno? Trabaja hacia atrás.</li>
            <li><strong>Paso 2:</strong> arma el engine mínimo con las cartas que más directamente llevan al endboard, sin preocuparte del tamaño del deck todavía.</li>
            <li><strong>Paso 3:</strong> agrega consistencia — buscadores, extenders, todo lo que aumenta la probabilidad de abrir con el starter.</li>
            <li><strong>Paso 4:</strong> revisa el espacio libre de 40 — ¿puedes recortar el engine sin sacrificar consistencia? El objetivo es maximizar el non-engine.</li>
            <li><strong>Paso 5:</strong> elige el non-engine según el meta — ¿contra qué decks juegas? ¿cuántos Boardbreakers necesitas? ¿necesitas anti-handtraps?</li>
            <li><strong>Paso 6:</strong> prueba y ajusta — 10 partidas contra lo que esperas encontrar, anota qué nunca usaste y qué te hizo falta.</li>
        </ul>

        <h3 class="form-nb-subtitle">📊 Hipergeometría Básica</h3>
        <p class="form-nb-text">Probabilidad de robar al menos 1 copia de una carta en la mano inicial (5 cartas de un deck de 40) según cuántas copias tienes:</p>
        <ul class="form-nb-list">
            <li><strong>1 copia</strong> → ~11% de probabilidad</li>
            <li><strong>2 copias</strong> → ~21%</li>
            <li><strong>3 copias</strong> → ~30%</li>
        </ul>
        <p class="form-nb-text">Si necesitas tener la carta en mano al menos 50% de las veces, necesitas al menos 8-9 copias (contando searchers que buscan esa carta). Esto explica por qué los Starters siempre van en 3, más todos sus buscadores: para maximizar la probabilidad de abrir con la pieza que activa todo.</p>
        <p class="form-nb-text">
            No lo calcules a mano:
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','mulligan'); return false;">Simuladores → 🎲 Probabilidad de Robo</a>
            tiene una calculadora hipergeométrica completa, con cálculo directo sobre tus propios decks guardados y un modo
            Montecarlo Multivariado para combinar varias piezas a la vez.
        </p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El deck no termina en la construcción — termina en el conocimiento. El mejor deck del mundo en manos de alguien que no lo conoce profundamente pierde contra un deck mediocre en manos de quien lo domina completamente. Elige un deck que puedas comprometerte a practicar durante meses, no el que está de moda esta semana.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('elegir-construir-deck')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            El ciclo completo vive en <strong>Mi Deck</strong>: entra por <strong>📥 Importar Deck</strong> (.ydk o Lista Oficial
            .pdf) para traer una decklist real, ajústala en <strong>🔨 Construcción</strong> viendo el Internal Score en vivo,
            pruébala en <strong>🎯 Optimización</strong> o en
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','experimentacion'); return false;">Simuladores → 🧪 Experimentación</a>,
            y valida tus cantidades de copias con la calculadora de Probabilidad de Robo.
        </p>
    `; },
_topicValorarCarta: function () { return `
        <h2 class="form-nb-title">Cómo Valorar una Carta</h2>
        <p class="form-nb-text">La mayoría de los jugadores evalúan una carta preguntando "¿es fuerte?". Esa pregunta está mal planteada. Nunca evalúes una carta aislada — evalúala dentro del sistema que es tu deck. La pregunta correcta es: "¿qué trabajo hace esta carta en mi deck?".</p>

        <h3 class="form-nb-subtitle">🧩 Las 7 Funciones de una Carta</h3>
        <p class="form-nb-text">Toda carta cumple una o más de estas 7 funciones. Clasificar cada carta de tu deck en estas categorías es el primer paso para saber si merece un espacio:</p>
        <ul class="form-nb-list">
            <li><strong>1. Motor (Engine):</strong> hace que tu deck funcione. Pregunta clave: ¿qué pasa si nunca la robo? Si la respuesta es "mi deck casi no funciona", es Motor.</li>
            <li><strong>2. Consistencia:</strong> no gana partidas por sí sola, pero hace que el Motor aparezca más veces (buscadores, tutores, robo de cartas).</li>
            <li><strong>3. Extensor:</strong> te permite seguir jugando después de una interrupción. La función favorita de los jugadores de alto nivel, porque asumen que el rival siempre tendrá respuestas.</li>
            <li><strong>4. Interrupción:</strong> frena al rival — Handtraps y respuestas rápidas.</li>
            <li><strong>5. Recuperación:</strong> devuelve recursos desde el cementerio o reconstruye el campo. Suele decidir partidas largas.</li>
            <li><strong>6. Finalizador:</strong> no sirve para empezar, sirve para convertir una ventaja ya obtenida en victoria.</li>
            <li><strong>7. Flex:</strong> cumple 2 o 3 funciones según el contexto. Mientras más cartas Flex tenga un deck, más decisiones interesantes ofrece cada partida.</li>
        </ul>
        <p class="form-nb-text">Esta clasificación es más fina que las 4 Funciones Universales (Motor/Interacción/Protección/Ventaja de Recursos) que ya viste en Funciones de las Cartas — úsala cuando necesites precisión real al comparar dos cartas parecidas.</p>

        <h3 class="form-nb-subtitle">✅ El Test de 5 Preguntas Antes de Incluir una Carta</h3>
        <ol class="form-nb-list">
            <li><strong>1. ¿Qué problema resuelve?</strong> Si no resuelve ninguno, ¿por qué está ahí?</li>
            <li><strong>2. ¿Qué carta sale para hacerle espacio?</strong> Esta pregunta destruye muchos malos hábitos. Decir "esta carta es buenísima" no basta — hay que poder responder cuál de las 40 actuales es peor. Si no puedes, la nueva carta probablemente no mejora el deck.</li>
            <li><strong>3. ¿Cuándo es mala?</strong> Toda carta tiene momentos malos. Conócelos antes de incluirla, no después de perder por ellos.</li>
            <li><strong>4. ¿Cómo interactúa con el resto del deck?</strong> Una carta mediocre puede ser excelente si potencia a otras diez.</li>
            <li><strong>5. ¿Me acerca a mi condición de victoria?</strong> La pregunta definitiva. Si la respuesta es no, ninguna de las anteriores importa.</li>
        </ol>

        <h3 class="form-nb-subtitle">🎭 El Costo Oculto</h3>
        <p class="form-nb-text">Compara dos cartas: la Carta A hace un efecto increíble pero necesita 3 condiciones para activarse; la Carta B hace un efecto un poco peor pero siempre funciona. ¿Cuál es mejor? Depende — porque el costo oculto de la Carta A es la inconsistencia. Y la consistencia gana muchísimas partidas en formatos largos (Bo3, Ranked). Cuando compares dos cartas parecidas, no te preguntes solo qué tan poderoso es el efecto — pregúntate qué tan seguido vas a poder usarlo realmente.</p>

        <h3 class="form-nb-subtitle">⚖️ Aplicación: Elegir Entre Cartas Similares</h3>
        <p class="form-nb-text">Cuando dos cartas cumplen un rol parecido (dos Handtraps, dos Boardbreakers, dos negadores), aplica el mismo test:</p>
        <ul class="form-nb-list">
            <li>¿Cuál depende de menos condiciones para activarse? (menor costo oculto)</li>
            <li>¿Cuál interactúa mejor con el resto de tus 40 cartas?</li>
            <li>¿Cuál es peor con más frecuencia — en qué % de tus manos esta carta sería "muerta"?</li>
            <li>¿Cuál te acerca más rápido a tu condición de victoria específica, no a "ganar en general"?</li>
        </ul>

        <h3 class="form-nb-subtitle">🏗️ El Ejercicio del Arquitecto</h3>
        <p class="form-nb-text">Construir un deck es como construir una casa. No preguntas "¿cuál es el mejor ladrillo?" — preguntas "¿necesito otro ladrillo o una ventana?". Cada carta cumple un papel estructural. Una carta nunca entra al deck porque sea buena en abstracto — entra porque responde una pregunta concreta de tu sistema.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">"Cada carta debe justificar ocupar uno de los 40 (o 60) lugares más valiosos de tu deck." Cuando construyes con esa filosofía, dejas de pensar en "cartas buenas" y empiezas a pensar en sistemas eficientes — y ese cambio de mentalidad es lo que te permite algún día dejar de copiar listas de internet y empezar a construir las tuyas.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('valorar-carta')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Antes de agregar una carta candidata, ábrela en el <strong>Buscador</strong> con un deck activo cargado: el
            CardViewer calcula en vivo su "🎯 Posibles Roles" y su "📊 Aporte al deck activo" (delta real de
            Consistencia/Potencia/Resiliencia si la sumaras). Compara ese número contra la carta que pensabas sacar —
            así respondes la Pregunta 2 del test ("¿qué carta sale?") con datos, no con intuición.
        </p>
    `; },
    _topicOptimizarDeck: function () { return `
        <h2 class="form-nb-title">Cómo Optimizar tu Deck</h2>
        <p class="form-nb-text">Un deck construido y un deck optimizado son cosas distintas. La construcción es el primer borrador. La optimización es el proceso continuo de pulirlo hasta que cada carta en el deck tiene una razón clara de estar ahí, y cada carta fuera del deck tiene una razón clara de no estar.</p>

        <h3 class="form-nb-subtitle">🔧 Los 6 Tipos de Optimización</h3>
        <ul class="form-nb-list">
            <li><strong>1. Consistencia:</strong> reduce Garnets al mínimo (0-2), agrega buscadores de buscadores, recorta cartas situacionales que no sirven en mano inicial. Señal: brickeas frecuentemente o hay turnos sin nada que hacer.</li>
            <li><strong>2. Potencia (Combo):</strong> estudia si un extender habilita un endboard más fuerte, revisa si el Extra Deck está optimizado para las líneas que realmente usas. Señal: el endboard final es débil o el oponente lo rompe fácilmente.</li>
            <li><strong>3. Techo de Poder (Endboard):</strong> agrega protecciones al Boss Monster, busca un Lock más específico, considera cartas de Extra Deck con efectos continuos. Señal: el oponente rompe tu campo consistentemente con recursos básicos.</li>
            <li><strong>4. Defensa:</strong> analiza con qué cartas estás perdiendo más seguido y ajusta el ratio de Handtraps para ese meta. Señal: pierdes al mismo tipo de jugada repetidamente sin poder responder.</li>
            <li><strong>5. Versatilidad:</strong> busca Extenders alternativos desde diferentes estados del campo, agrega un "Plan B" y Bridges que conecten piezas que normalmente no interactúan. Señal: el deck es muy lineal y sin segunda opción si le niegan el primer paso.</li>
            <li><strong>6. Resiliencia (Floor):</strong> agrega Extenders que activen después de una negación, busca cartas de "recovery". Señal: con 1 Handtrap encima, el deck queda muerto.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔄 El Proceso de Optimización</h3>
        <ul class="form-nb-list">
            <li><strong>Paso 1 — Identifica el problema específico:</strong> no optimices "en general". ¿Pierdo por inconsistencia, endboard débil, o falta de respuesta a X del meta?</li>
            <li><strong>Paso 2 — Un cambio a la vez:</strong> si cambias 3 cosas a la vez, no sabes cuál causó qué. Un cambio = una variable.</li>
            <li><strong>Paso 3 — Prueba con suficientes partidas:</strong> un cambio necesita al menos 10-15 partidas para evaluarse correctamente.</li>
            <li><strong>Paso 4 — Documenta:</strong> anota qué cambiaste y qué efecto tuvo. La memoria no es confiable con varios ajustes a lo largo de semanas.</li>
        </ul>

        <h3 class="form-nb-subtitle">✅ Señales de un Deck Bien Optimizado</h3>
        <ul class="form-nb-list">
            <li>Rara vez tienes cartas "muertas" en mano.</li>
            <li>El non-engine se siente exactamente calibrado para el meta local.</li>
            <li>Las líneas de combo son fluidas porque las conoces.</li>
            <li>Puedes responder a la mayoría de las amenazas comunes del meta.</li>
            <li>El deck se siente "tuyo" — ajustado a tu estilo y a tu entorno de juego.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">La optimización nunca termina mientras el meta cambie. Un deck optimizado para el meta de hace 3 meses puede ser mediocre hoy. Trata tu deck como un proyecto en evolución, no como algo terminado.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('optimizar-deck')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            El proceso completo (identificar problema → un cambio a la vez → probar → documentar) está integrado en
            <strong>Mi Deck → 🎯 Optimización</strong>: registra cada ronda de prueba (resultado, si brickeaste, si el rival
            rompió tu jugada) y revisa <strong>getOptDiagnostics()</strong> — la app misma te sugiere si te falta
            Consistencia, Boardbreakers u otro ajuste según tus propias rondas. Antes y después del cambio, compara el
            Internal Score en <strong>Estadísticas</strong> para confirmar con números si realmente mejoró.
        </p>
    `; },
_topicPetDeckDominar: function () { return `
        <h2 class="form-nb-title">Pet Deck: De Jugarlo a Dominarlo</h2>
        <p class="form-nb-text">Hay una diferencia enorme entre jugar un deck y pilotarlo al máximo nivel. Muchos jugadores saltan de arquetipo en arquetipo cada meta persiguiendo la lista "top", pero nunca acumulan la profundidad de decisión que da jugar el mismo deck cientos de veces.</p>

        <h3 class="form-nb-subtitle">♟️ La Analogía del Ajedrez</h3>
        <p class="form-nb-text">Un gran maestro de ajedrez puede analizar una misma apertura durante cientos de partidas y seguir encontrando matices nuevos. ¿Por qué? Porque al eliminar la variable "cambiar de herramienta", empieza a notar patrones reales en sus propias decisiones. Lo mismo aplica a un deck de Yu-Gi-Oh!: cuando fijas el deck, tus errores dejan de ser "no conocía esta carta" y empiezan a ser errores de decisión puros — que es justo lo que se puede corregir y mejorar.</p>

        <h3 class="form-nb-subtitle">🎯 Jugar vs. Pilotar</h3>
        <ul class="form-nb-list">
            <li><strong>Jugar el deck:</strong> conoces el combo principal, ganas algunas partidas, pierdes otras sin saber muy bien por qué.</li>
            <li><strong>Pilotar el deck:</strong> conoces todas las líneas alternativas (qué hacer si te niegan la primera carta, qué hacer con una mano incompleta), sabes exactamente contra qué matchups tu deck es débil y por qué, y tomas decisiones de secuenciación específicas para tu lista, no genéricas.</li>
        </ul>
        <p class="form-nb-text">La transición de uno a otro no ocurre jugando partidas casuales sin registro — ocurre revisando decisión por decisión, con el Método AAR (ver "Practicar Antes de un Evento") aplicado de forma consistente sobre el mismo deck.</p>

        <h3 class="form-nb-subtitle">🔁 Repetición Contra tus Peores Matchups</h3>
        <p class="form-nb-text">No mejoras pilotando tu deck contra los matchups que ya dominas — mejoras jugando repetidamente contra los 2-3 arquetipos donde peor te va. Cada repetición contra tu peor matchup revela una línea de juego que no habías considerado, o confirma que ese matchup realmente necesita ajustes de Side Deck en vez de mejor piloteo.</p>

        <h3 class="form-nb-subtitle">📈 Progreso Medible, no Solo "Sentido"</h3>
        <p class="form-nb-text">Dominar un pet deck no es una sensación subjetiva de comodidad — se puede medir con el tiempo: más rondas jugadas, mejor Winrate general y por turno (1º/2º), menor Brick Rate, y un nivel más alto en "Nivel como Piloto del Deck". Si esas métricas no mejoran con las partidas, jugar más partidas sin cambiar el método de revisión no va a generar dominio real, solo repetición.</p>

        <h3 class="form-nb-subtitle">⚠️ El Riesgo de Comprometerse con el Deck Equivocado</h3>
        <p class="form-nb-text">Comprometerse a dominar un deck no significa aferrarse a cualquier deck. Antes de invertir semanas de piloteo, confirma que el deck realmente te gusta jugar y que su Complejidad (ver esa lección en Optimización) es la que estás dispuesto a asumir — dominar un deck de techo de habilidad muy alto toma más tiempo que uno de curva de entrada simple, y eso está bien, siempre que sea una decisión consciente y no una sorpresa a mitad de camino.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">La meta no es celebrar un rango o un resultado de torneo puntual — es llegar al punto en que dejas de pensar en cartas individuales y empiezas a jugar contra la mente del rival, anticipando su plan con la lista que mejor conoces de todo el juego: la tuya.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('pet-deck-dominar')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            El bloque <strong>🎖️ Nivel como Piloto del Deck</strong> (Estadísticas y Mi Deck → Optimización) mide
            exactamente esto: se calcula EXCLUSIVAMENTE con las rondas del deck activo, escala de Novato a Legendario.
            Combínalo con <strong>⚔️ Historial de Enfrentamientos</strong> filtrando por rival (clic en la fila) para ver
            tu progreso real contra ese matchup específico a lo largo del tiempo, y con
            <strong>🧩 Complejidad del Deck</strong> para confirmar si el deck que elegiste dominar coincide con el nivel
            de compromiso que estás dispuesto a asumir.
        </p>

    `; },
    _topicEquilibrioDeck: function () { return `
        <h2 class="form-nb-title">Equilibrio del Deck: Detectando Excesos</h2>
        <p class="form-nb-text">Un deck no se rompe solo por tener cartas malas — se rompe cuando tiene demasiado de algo bueno. Cada rol que agregas (Starter, Extender, Handtrap, Boardbreaker...) compite por el mismo espacio de 40-60 cartas. Esta lección enseña a leer proporciones, no cantidades sueltas.</p>

        <h3 class="form-nb-subtitle">📐 Piensa en Ratios, No en Cantidades Absolutas</h3>
        <p class="form-nb-text">"Tengo 9 Handtraps" no dice nada por sí solo. La pregunta correcta es: ¿qué porcentaje de mi deck son Handtraps, y qué le quité al engine para meterlas? Un deck de 40 cartas con 9 Handtraps dejó solo 31 espacios para Motor + Consistencia + Extensores + Finalizadores — probablemente muy poco para un combo real.</p>

        <h3 class="form-nb-subtitle">⚠️ Señales de Exceso por Rol</h3>
        <ul class="form-nb-list">
            <li><strong>Exceso de Starters:</strong> muchas manos abren con 2-3 formas de empezar el mismo combo — redundante. El espacio de la 3ra o 4ta fuente de arranque casi siempre rinde más como Extensor o Handtrap.</li>
            <li><strong>Exceso de Extenders sin Starters suficientes:</strong> tienes con qué seguir el combo, pero no suficientes formas de empezarlo — el deck bricka porque nunca llega a usarlos.</li>
            <li><strong>Exceso de Handtraps:</strong> por encima de ~9-11 copias en un deck combo empieza a robarle espacio crítico al engine. Un deck que interrumpe mucho pero no arma su propio plan de juego pierde el juego largo.</li>
            <li><strong>Exceso de Boardbreakers:</strong> son cartas que solo brillan yendo segundo — si tu deck es principalmente de ir primero, un exceso de Boardbreakers son cartas muertas en mano la mayoría de las partidas.</li>
            <li><strong>Exceso de Bricks/Tech situacional:</strong> cartas que solo sirven combadas con otra pieza específica. Cada Garnet extra resta consistencia real aunque en teoría sea poderoso — la regla general es no pasar de 2 en el deck.</li>
            <li><strong>Cero de un rol crítico:</strong> el exceso no es el único problema — 0 Extenders (glass cannon) o 0 Boardbreakers (indefenso yendo segundo) son la misma falla de balance, en dirección contraria.</li>
        </ul>

        <h3 class="form-nb-subtitle">🧮 Cómo Detectarlo Sin Adivinar</h3>
        <p class="form-nb-text">No se trata de "sentir" que algo está desbalanceado — se trata de medirlo con datos de tus propias partidas:</p>
        <ul class="form-nb-list">
            <li>Si brickeas seguido con manos de 5-6 cartas "que en teoría deberían tener algo jugable" → señal de exceso de Bricks o falta de Consistencia.</li>
            <li>Si con 1 sola Handtrap encima tu turno termina sin nada en campo → señal de falta de Extenders (Floor bajo).</li>
            <li>Si el promedio de Boardbreakers en mano yendo de segundo es consistentemente bajo pero pierdes casi siempre yendo segundo → señal de que necesitas más, no menos.</li>
            <li>Si tienes 2+ negaciones y el oponente igual te rompe el campo con recursos básicos → no es problema de cantidad de Handtraps, es problema de Techo de Poder (otro eje distinto, no lo confundas).</li>
        </ul>

        <h3 class="form-nb-subtitle">🎯 El Balance no es 50/50 — es Contextual</h3>
        <p class="form-nb-text">No existe una proporción universal correcta. Un deck combo lineal de pocos pasos necesita menos Extenders que uno de combo largo con muchas ventanas de interrupción. Un deck de control necesita más Interrupción que Motor. El equilibrio correcto es el que responde a la identidad de tu deck y al meta que enfrentas, no una fórmula fija copiada de otro arquetipo.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Cuando dudes si tienes exceso de un rol, pregúntate: "si sacara 1 copia de este rol, ¿qué perdería realmente?". Si la respuesta es "casi nada, porque ya tengo redundancia de sobra", esa copia probablemente está de más y ese espacio rinde más en otro rol que hoy tienes en cero o casi cero.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('equilibrio-deck')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            En <strong>Mi Deck → 🎯 Optimización</strong>, cada ronda que registras alimenta promedios reales por rol
            (Starters, Extenders, Handtraps, Boardbreaker en mano, Bricks/Tech). Revisa <strong>getOptDiagnostics()</strong>:
            la app te avisa directamente si tu <em>avgBoardbreaker</em> es bajo jugando de segundo, o si tu Brick Rate está
            alto. Compleméntalo con <strong>Estadísticas → Internal Score</strong>: si Consistencia es sólida pero
            Resiliencia es baja, es una señal cuantitativa de que te falta balance hacia Extenders, no hacia más Motor.
        </p>
    `; },
    _topicRulingsInvocaciones: function () { return `
        <h2 class="form-nb-title">Rulings de Invocaciones</h2>
        <p class="form-nb-text">Las invocaciones son el corazón de cada jugada. Saber exactamente qué tipo de invocación estás realizando, cuándo puede ser negada, y qué consecuencias tiene la negación, es lo que determina si puedes o no continuar el combo.</p>

        <h3 class="form-nb-subtitle">⚔️ Invocación Inherente vs Invocación por Efecto</h3>
        <ul class="form-nb-list">
            <li><strong>Invocación Inherente:</strong> la que realizas directamente por las reglas del juego, sin necesitar que un efecto de carta la active. Se coloca en el Eslabón 1 de una cadena o directamente sin cadena. Ej: Invocación Normal, Invocación Especial de un XYZ con 2 monstruos del mismo nivel, Invocación Sincro con Tuner + no-Tuner, Invocación Link.</li>
            <li><strong>Invocación por Efecto:</strong> la que realiza un efecto de carta. La cadena ya está en marcha cuando la invocación ocurre — no puedes responder a la invocación misma, solo al efecto. Ej: "Invoca especialmente esta carta desde el cementerio" como parte de un efecto.</li>
            <li><strong>¿Por qué importa?</strong> Porque "negar una invocación" solo aplica a invocaciones inherentes. No puedes negar una invocación que sea el resultado de resolver un efecto — ya fue demasiado tarde, el efecto ya resolvió.</li>
        </ul>

        <h3 class="form-nb-subtitle">🚫 Negar la Invocación y sus Consecuencias</h3>
        <p class="form-nb-text">Cuando niegas una invocación (con Solemn Warning, por ejemplo):</p>
        <ul class="form-nb-list">
            <li>El monstruo va al cementerio (o fuera del juego según la regla específica).</li>
            <li>La invocación cuenta como "negada" — el monstruo nunca llegó al campo.</li>
            <li>Efectos que dicen "si fue invocado exitosamente" NO se activarán.</li>
            <li>Efectos que dicen "si fue enviado al cementerio" SÍ pueden activarse.</li>
            <li>Si el monstruo iba a ser usado como material y la invocación es negada, los materiales que ya fueron enviados NO regresan — se van al cementerio normalmente. La negación aplica al monstruo invocado, no a los materiales.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔍 Diferencias Clave por Tipo de Invocación</h3>
        <ul class="form-nb-list">
            <li><strong>Tributo vs Invocación Especial por Tributo:</strong> la Invocación Normal por tributo (monstruo de nivel 5+) es una invocación normal que puede ser negada igual que cualquier otra. La Invocación Especial por tributo (Kaijus, Nibiru, Esfera de Ra) es una invocación especial que ocurre como parte del efecto — el tributo es el costo, no la invocación en sí.</li>
            <li><strong>Ritual vs Fusión:</strong> el Ritual requiere la Magia de Ritual como efecto que realiza la invocación — no es inherente; si niegas el efecto de la magia, el Ritual no sale. La Fusión es similar: la magia de fusión realiza la fusión como efecto. La "Fusión de Contacto" en cambio es inherente — no usa magia de fusión.</li>
            <li><strong>XYZ y Materiales Debajo:</strong> los materiales de un XYZ no están en el cementerio — están "adjuntos". Los efectos del cementerio no los afectan. Cuando un XYZ es destruido, sus materiales van al cementerio solo entonces.</li>
            <li><strong>Péndulo y la Negación de Escala:</strong> si te niegan 1 de las 2 cartas Péndulo que estás colocando como escala, la otra queda colocada. Pero si no tienes la segunda escala ya puesta, la Invocación Péndulo no puede realizarse sin ambas escalas activas.</li>
            <li><strong>Link y Zonas:</strong> si no hay zonas del Extra Deck habilitadas para invocar un monstruo del Extra, la invocación no puede realizarse aunque tengas los materiales. Los Links habilitan zonas — sin ellas, solo tienes la zona central del Extra.</li>
            <li><strong>Fichas (Tokens):</strong> son monstruos, tienen tipo, atributo y nivel. Pueden ser materiales de Sincro, XYZ, Link y Fusión. Pero no pueden ir al Extra Deck ni al deck — cuando dejan el campo, desaparecen, no van al cementerio.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Antes de intentar una invocación de Extra Deck, confirma: 1) ¿Los materiales son válidos? (niveles, tipos, atributos según la carta). 2) ¿Hay zona disponible? 3) ¿Mi combo tiene restricciones que bloqueen esta invocación? Muchos combos se rompen porque el jugador no leyó la restricción de una carta anterior que ya resolvió ese mismo turno.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('rulings-invocaciones')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Practica tu línea de invocaciones campo real en
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','practica'); return false;">Simuladores → 🎴 Zona de Práctica</a>,
            e identifica qué invocación específica es el "choke point" de tu combo (dónde te rompen el turno si niegan algo).
            Documenta esa restricción como Choke Point real de tu línea en
            <a href="#" class="form-link" onclick="Formacion.goToTab('mideck','combos'); return false;">Mi Deck → 🧬 Línea de Combos</a>.
        </p>
    `; },

    _topicRulingsBatalla: function () { return `
        <h2 class="form-nb-title">Rulings en Fase de Batalla</h2>
        <p class="form-nb-text">La Fase de Batalla tiene más reglas específicas que cualquier otra fase. La mayoría de los jugadores la tratan como "declaro ataque y listo", pero los rulings de esta fase determinan partidas enteras en torneo.</p>

        <h3 class="form-nb-subtitle">🪜 Las Subfases de la Batalla</h3>
        <ul class="form-nb-list">
            <li><strong>Start of Battle Phase:</strong> el momento en que la Fase de Batalla comienza. Algunos efectos se activan aquí específicamente. Ambos jugadores pueden activar efectos de velocidad 2.</li>
            <li><strong>Battle Step (Declaración de Ataque):</strong> declaras qué monstruo ataca y a quién (o ataque directo). El oponente puede responder con Quick Effects o trampas aquí. Si el objetivo del ataque desaparece, ocurre un "Replay".</li>
            <li><strong>Damage Step:</strong> tiene 5 subfases propias (ver abajo) — son las más importantes y las que más confusión generan.</li>
            <li><strong>End of Battle Phase:</strong> todos los efectos temporales de la Battle Phase expiran. El juego pasa obligatoriamente a Main Phase 2.</li>
        </ul>

        <h3 class="form-nb-subtitle">💥 Las 5 Subfases del Damage Step</h3>
        <ul class="form-nb-list">
            <li><strong>A. Start of Damage Step:</strong> se pueden activar efectos que modifican ATK/DEF o cambian posición de los monstruos. También es cuando se voltean los monstruos boca abajo.</li>
            <li><strong>B. Before Damage Calculation:</strong> el último momento para cambiar ATK/DEF antes de que se calcule el daño. Aquí se activan cartas como <a href="#" class="form-link" onclick="Formacion.openCard('Rush Recklessly'); return false;">Rush Recklessly</a> o similares. SOLO pueden activarse efectos de velocidad 2 que modifiquen ATK/DEF o que se activen específicamente "en el Damage Step".</li>
            <li><strong>C. Damage Calculation:</strong> los puntos de vida cambian. Se compara ATK vs ATK (o ATK vs DEF). Aquí ocurre el daño de batalla.</li>
            <li><strong>D. After Damage Calculation:</strong> efectos que se activan "después del cálculo de daño" van aquí, así como los efectos Flip de monstruos volteados.</li>
            <li><strong>E. End of Damage Step:</strong> los monstruos destruidos por combate son enviados al cementerio aquí. Efectos de "cuando sea destruido por combate" se activan en este punto.</li>
        </ul>
        <p class="form-nb-text">Durante el Damage Step hay restricciones muy específicas sobre qué puedes activar. En general, SOLO puedes activar efectos de velocidad 2+ que modifiquen ATK/DEF, efectos que se activan explícitamente "durante el Damage Step", Counter Traps (velocidad 3), y efectos mandatorios. Casi todas las Handtraps y las Trampas Normales NO pueden activarse durante el Damage Step.</p>

        <h3 class="form-nb-subtitle">⚡ Daño de Batalla vs Daño de Efecto</h3>
        <ul class="form-nb-list">
            <li><strong>Daño de Batalla:</strong> ocurre cuando un monstruo ataca y los LP cambian por esa razón. Puede ser negado o modificado por cartas específicas que aplican durante la Battle Phase o el Damage Step.</li>
            <li><strong>Daño de Efecto:</strong> ocurre cuando un efecto de carta dice "inflige X de daño". No puede ser negado por cartas que solo aplican a daño de batalla. Funciona fuera del Damage Step, en cualquier fase.</li>
            <li><strong>Conversión de Daño:</strong> algunas cartas convierten el daño de batalla en daño de efecto, o hacen que el oponente tome el daño en vez de tú. Cuando dos efectos del mismo orden de prioridad se aplican, el daño ocurre 1 sola vez y tiene prioridad el jugador cuyo turno es.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔄 Replay Attacks</h3>
        <p class="form-nb-text">Un Replay ocurre cuando el objetivo de un ataque desaparece del campo durante el Battle Step (antes de entrar al Damage Step).</p>
        <ul class="form-nb-list">
            <li>El monstruo atacante puede elegir un nuevo objetivo, o puede elegir no atacar en absoluto.</li>
            <li>Si aparecieron nuevos monstruos en campo (por una invocación en respuesta), pueden ser seleccionados como nuevo objetivo.</li>
            <li>El Replay solo ocurre en el Battle Step, no durante el Damage Step. Si el objetivo desaparece ya dentro del Damage Step, el ataque continúa pero no inflige daño de batalla (el objetivo ya no está).</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">En torneo, declarar el ataque y entrar al Damage Step sin dar ventana al oponente es un error que puede costarte la partida. Siempre anuncia "declaro ataque con X contra Y" y espera antes de pasar a calcular el daño. Esa pausa es la ventana de tu oponente para responder.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('rulings-batalla')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Recorre manualmente las subfases del combate en
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','practica'); return false;">Simuladores → 🎴 Zona de Práctica</a>:
            avanza a Battle Phase y practica declarar el ataque, esperar la ventana y simular un Replay cambiando el campo antes
            de pasar al daño. Para sentir el ritmo real de una Battle Phase con presión de tiempo, usa
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','duelo'); return false;">Simuladores → ⚔️ Duelo en Vivo</a>.
        </p>
    `; },

    _topicIfWhenTiming: function () { return `
        <h2 class="form-nb-title">IF vs WHEN y Timing Avanzado</h2>
        <p class="form-nb-text">"Miss the timing" es uno de los conceptos más mal entendidos en Yu-Gi-Oh!. Un jugador que no entiende la diferencia entre IF y WHEN perderá efectos clave en momentos críticos — o los usará fuera de tiempo sin saberlo.</p>

        <h3 class="form-nb-subtitle">🔀 La Diferencia Fundamental</h3>
        <ul class="form-nb-list">
            <li><strong>WHEN (cuando) — opcional:</strong> el efecto tiene una ventana muy específica para activarse. Si el evento que lo activa NO fue "lo último que ocurrió" antes de que se abra la nueva ventana de activación, el efecto "miss the timing" y NO puede activarse. "When X: you can do Y" = tiene posibilidad de miss the timing.</li>
            <li><strong>IF (si) — opcional:</strong> más flexible que WHEN. Solo necesita que la condición se haya cumplido en algún momento del proceso, no necesariamente ser lo "último". Menos propenso a miss the timing. "If X: you can do Y" = generalmente no pierde el timing.</li>
            <li><strong>WHEN / IF — mandatorio:</strong> si dice "must" o es claramente mandatorio (sin "you can"), NUNCA pierde el timing. Siempre se activa si la condición ocurre.</li>
        </ul>

        <h3 class="form-nb-subtitle">❓ Qué Significa "Miss the Timing"</h3>
        <p class="form-nb-text">Ocurre cuando el efecto usa WHEN (opcional) y la condición de activación ocurrió, pero NO fue el último evento antes de que se abra la nueva ventana de activación.</p>
        <ul class="form-nb-list">
            <li><strong>Ejemplo:</strong> la carta X dice "When this card is sent to the GY: you can add 1 card...".</li>
            <li><strong>Escenario A:</strong> la carta X fue enviada al cementerio como el último paso de un efecto que resolvió → el efecto PUEDE activarse, no miss the timing.</li>
            <li><strong>Escenario B:</strong> la carta X fue enviada al cementerio como parte de un efecto que también hizo otras cosas después (ej: "envía X al cementerio, luego invoca especialmente Y") — el envío al cementerio NO fue lo último que pasó → el efecto PIERDE el timing y no puede activarse.</li>
        </ul>

        <h3 class="form-nb-subtitle">📋 El Timing de Activación General</h3>
        <p class="form-nb-text">Al final de una cadena que resuelve, se abre una nueva ventana. En esa ventana, los efectos se activan en este orden de prioridad:</p>
        <ul class="form-nb-list">
            <li>1. Efectos mandatorios (SIEMPRE primero).</li>
            <li>2. Efectos Trigger opcionales del jugador activo.</li>
            <li>3. Efectos Trigger opcionales del jugador no activo.</li>
            <li>4. Efectos rápidos (Quick Effects) de ambos jugadores.</li>
        </ul>
        <p class="form-nb-text">Si en ese momento hay múltiples triggers opcionales del mismo jugador, ese jugador elige el orden en que se activan.</p>

        <h3 class="form-nb-subtitle">🔁 "Each Time" — Sin Límite de Activaciones</h3>
        <p class="form-nb-text">Cuando un efecto dice "each time X happens: do Y", puede activarse múltiples veces en el mismo turno si la condición se repite. No está limitado a "once per turn" implícitamente. Ej: "Each time a Spell Card is activated: gain 500 LP" — si tu oponente activa 3 hechizos en un turno, ganas 1500 LP en total.</p>

        <h3 class="form-nb-subtitle">🤫 Efectos en Zona de Conocimiento Privado</h3>
        <p class="form-nb-text">Las cartas en la mano y el deck son "conocimiento privado" — el oponente no sabe qué hay ahí. Los efectos que se activan desde esas zonas tienen una prioridad menor en ciertas reglas del OCG, aunque en TCG aplica igual (ver Tema: Formatos y sus Diferencias). Ej: <a href="#" class="form-link" onclick="Formacion.openCard('Ash Blossom & Joyous Spring'); return false;">Ash Blossom & Joyous Spring</a> activa su efecto desde la mano; después de que la cadena se construye, se revela.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Cuando no estés seguro de si tu efecto "miss the timing": 1) ¿Dice "when" y "you can"? → Potencial miss. 2) ¿El evento que activa el efecto fue lo último que ocurrió? → No miss. 3) ¿El efecto es mandatorio? → Nunca miss. En torneo, ante la duda, declara el efecto y deja que el juez decida.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('if-when-timing')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Abre en <strong>Buscador</strong> una carta con efecto "when"/"cuando": el visor resalta por color el segmento
            de "condición de activación" del texto, aislando exactamente la cláusula de timing de la que habla esta lección.
            Para ver o ajustar cómo la app detecta esas categorías de texto, entra a
            <a href="#" class="form-link" onclick="Formacion.goToConfigSection('nomenclature-section'); return false;">Config → 🏷️ Nomenclatura de Efectos</a>.
        </p>
    `; },

    _topicLeerCampoOponente: function () { return `
        <h2 class="form-nb-title">Leer el Campo del Oponente</h2>
        <p class="form-nb-text">La habilidad más subestimada del juego no es memorizar combos — es leer lo que el oponente tiene antes de que lo revele. Los jugadores de alto nivel toman decisiones basadas en información deducida, no solo en lo que ven directamente.</p>

        <h3 class="form-nb-subtitle">🔎 Por Qué Leer el Campo Importa</h3>
        <p class="form-nb-text">Cada vez que activas una carta sin leer al oponente, estás tomando una decisión a ciegas. A veces funciona, pero el jugador consistente no depende de la suerte — deduce y actúa con información. Leer el campo te permite saber si es seguro activar tu combo o esperar, identificar qué Handtrap o trampa probablemente tiene el oponente, decidir si gastas tus recursos anti-handtrap ahora o los guardas, y adaptar tu plan de juego en tiempo real.</p>

        <h3 class="form-nb-subtitle">📡 Señales que Dan Información</h3>
        <ul class="form-nb-list">
            <li><strong>Número de cartas en mano:</strong> 5+ cartas al inicio del turno del oponente = mano llena, muchas opciones, posibles múltiples Handtraps o combo completo. 1-2 cartas = mano comprometida, probablemente ya gastó sus Handtraps o fue afectado por algún efecto — menor amenaza inmediata.</li>
            <li><strong>Cómo manejó el turno anterior:</strong> ¿pasó el turno rápido? Probablemente tiene una mano débil o planea interrumpirte con trampas ya colocadas. ¿Jugó despacio y deliberadamente? Está calculando — su mano es compleja o tiene opciones que quiere preservar. ¿No activó nada durante tu turno? Puede que no tenga Handtraps, o está guardando respuesta para algo específico.</li>
            <li><strong>Cartas boca abajo en el backrow:</strong> 1 carta boca abajo puede ser trampa o Quick-Play — juega con precaución. 3+ cartas boca abajo indica deck de Control o Trampas, alto riesgo al combo. 0 cartas boca abajo te da más libertad para actuar, pero puede tener Handtraps en mano.</li>
            <li><strong>El deck que está jugando:</strong> si sabes qué deck es, ya sabes sus Handtraps probables, sus combos, sus puntos débiles y qué busca hacer. Si no lo sabes, los primeros 2-3 efectos activados te lo revelan — guarda esa información.</li>
        </ul>

        <h3 class="form-nb-subtitle">🤚 Deducir las Handtraps</h3>
        <ul class="form-nb-list">
            <li><strong>¿Pasó su turno sin usar Handtraps?</strong> → Probablemente no tiene en mano o está guardando algo específico. Más seguro para ejecutar combo.</li>
            <li><strong>¿Ya activó una Handtrap este turno?</strong> → Los decks que juegan 3+ Handtraps pueden tener otra; los decks más agresivos pueden haberla gastado ya.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Ash Blossom & Joyous Spring'); return false;">Ash Blossom</a>:</strong> el oponente que sabe tu deck la usará contra tu buscador. Si no la activó cuando buscaste, probablemente no la tiene.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Nibiru, the Primal Being'); return false;">Nibiru</a>:</strong> solo importa si estás en tu quinta invocación especial. Puedes contar tus invocaciones y decidir si vale continuar o cerrar antes.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Droll & Lock Bird'); return false;">Droll</a>:</strong> si ya agregaste una carta a tu mano desde el deck este turno y no te la activaron, probablemente no la tiene.</li>
            <li><strong><a href="#" class="form-link" onclick="Formacion.openCard('Infinite Impermanence'); return false;">Impermanence</a>:</strong> si no la activaron cuando invocaste el primer monstruo con efecto, puede que no la tengan (o estén esperando algo más importante).</li>
        </ul>

        <h3 class="form-nb-subtitle">🧭 Cómo Responder a lo que Deduces</h3>
        <ul class="form-nb-list">
            <li><strong>Si crees que tiene Handtrap:</strong> activa primero la carta menos crítica como "cebo". Si gastan la Handtrap en el cebo, tu pieza clave queda libre. Si no la usan en el cebo, avanza con más confianza.</li>
            <li><strong>Si crees que no tiene nada:</strong> puedes ejecutar el combo sin rodeos y maximizar el endboard. Pero no asumas al 100% — el oponente podría estar esperando un momento específico para activar su respuesta.</li>
            <li><strong>Si hay backrow y no sabes qué es:</strong> actúa como si fuera la peor trampa posible para tu combo. Si tienes destructor de trampas en mano, úsalo primero. Si no tienes respuesta a trampas, considera si vale más atacar con un monstruo menor primero para "revelar" qué hay boca abajo.</li>
        </ul>

        <h3 class="form-nb-subtitle">🔄 Leer el Campo en Partidas 2 y 3 (Side Deck)</h3>
        <p class="form-nb-text">Después de la partida 1 ya sabes qué deck juega el oponente, qué Handtraps usó (o no usó), si tiene mucho backrow o juega más en mano, y qué le costó más trabajo hacer contra tu deck. Usa esa información para sidear y para adaptar cómo juegas la partida 2 (ver Tema: El Side Deck). Si sideó agresivamente contra tu combo — lo notarás si su comportamiento cambia drásticamente — puede que tenga cartas anti-combo que no te esperabas.</p>

        <h3 class="form-nb-subtitle">⚠️ Errores Comunes al Leer el Campo</h3>
        <ul class="form-nb-list">
            <li>Asumir que tiene X carta porque perdiste contra ella antes — cada duelo es nuevo, la experiencia informa pero no determina.</li>
            <li>Jugar mecánicamente sin observar al oponente — la velocidad a la que mueve cartas, dónde pone la vista, cuándo vacila, todo da información.</li>
            <li>Ignorar lo que NO hizo — la información más valiosa a veces es que el oponente no activó nada.</li>
            <li>Sobre-pensar y quedarte paralizado — leer el campo debe hacerse rápido: analizas, decides, actúas.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Al inicio de cada turno del oponente hazte 3 preguntas: 1) ¿Cuántas cartas tiene en mano y qué dice eso? 2) ¿Qué hizo (o no hizo) en MI último turno? 3) ¿Qué necesita hacer en este turno para ganar? La tercera pregunta es la más poderosa — si sabes qué necesita tu oponente para ganar, puedes centrar todos tus recursos en negarlo exactamente.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('leer-campo-oponente')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Después de cada duelo real, anota tus lecturas y deducciones en el campo <strong>notas</strong> de la ronda en
            <strong>Mi Deck → 🎯 Optimización</strong>. Si te enfrentas al mismo rival varias veces, registra el enfrentamiento
            en <strong>⚔️ Historial de Enfrentamientos</strong> (dentro de Optimización) e importa su decklist por .ydk — así
            puedes repasar con "Ver Deck" exactamente qué juega antes de tu próxima partida contra él.
        </p>
    `; },

    _topicGestionLpRecursos: function () { return `
        <h2 class="form-nb-title">Gestión de LP y Recursos</h2>
        <p class="form-nb-text">Los LP (Life Points) son el recurso más mal gestionado por jugadores intermedios. El jugador novato teme perder LP. El jugador avanzado los usa como herramienta. La diferencia entre ambos determina quién gana los duelos ajustados.</p>

        <h3 class="form-nb-subtitle">💰 Los LP No Son el Objetivo — Son un Recurso</h3>
        <p class="form-nb-text">En Yu-Gi-Oh!, perder LP no te hace perder el duelo si no llegas a 0. Ir de 8000 a 4000 es exactamente tan válido como estar en 8000 — en ambos casos sigues en el juego. El error del novato es evitar perder LP a cualquier costo, incluso a costa de no activar efectos o de no jugar de forma óptima. El enfoque correcto: los LP son un recurso que se invierte para ganar ventaja. A veces, pagar 2000 LP por activar Solemn Judgment es la mejor inversión del duelo porque niegas algo que te habría costado el juego.</p>

        <h3 class="form-nb-subtitle">📦 Tipos de "Recursos" en el Duelo</h3>
        <ul class="form-nb-list">
            <li><strong>Cartas en mano:</strong> el recurso más importante del turno. Cada carta que tienes en mano es una opción potencial. Con muchas tienes libertad; con pocas, cada decisión pesa más.</li>
            <li><strong>Cartas en campo:</strong> los monstruos y mágicas/trampas activas. Representan amenazas actuales y protecciones presentes.</li>
            <li><strong>Cartas en cementerio:</strong> en el juego moderno es un recurso activo, no solo un descarte. Muchos decks "gastan" recursos al cementerio para recuperarlos después.</li>
            <li><strong>Cartas desterradas:</strong> generalmente el "recurso muerto" — pero algunos decks usan el destierro activamente (Kashtira, decks de Bystial, etc.).</li>
            <li><strong>LP:</strong> cuánto margen de error tienes antes de perder. 4000 LP = aguantas un ataque de 4000 más. 1000 LP = cualquier ataque directamente te mata.</li>
            <li><strong>Turno:</strong> el tiempo — cuántos turnos lleva el duelo y si la posición actual es sostenible o está empeorando con el tiempo.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚖️ Cuándo Vale la Pena Pagar LP</h3>
        <ul class="form-nb-list">
            <li><strong>Siempre vale la pena cuando:</strong> pagas LP para negar algo que no puedes recuperar de otra forma; el costo es pequeño comparado con la amenaza que niegas; estás en posición ganadora y solo necesitas cerrar el duelo.</li>
            <li><strong>Evalúa cuidadosamente cuando:</strong> ya estás por debajo de 4000 LP — cada pago te acerca al rango mortal; el efecto que pagas podría no cambiar el resultado del duelo; el oponente podría tener otro golpe de seguimiento.</li>
            <li><strong>No vale la pena cuando:</strong> pagas LP para salvar una situación que de todas formas perderás; estás en 2000 LP o menos — el margen de error es casi nulo; el gasto no te da ventaja concreta, solo tiempo.</li>
        </ul>

        <h3 class="form-nb-subtitle">🃏 Gestión de Cartas en Mano</h3>
        <ul class="form-nb-list">
            <li><strong>Hand Advantage:</strong> tener más cartas que el oponente es ventaja, pero no es absoluto — 5 cartas malas valen menos que 2 cartas buenas. Calidad &gt; cantidad en mano.</li>
            <li><strong>Cuándo descartar:</strong> algunos efectos te piden descartar como costo. Evalúa: ¿la carta que descarto tiene utilidad desde el cementerio? ¿es una carta que no sirve en esta situación de todas formas? ¿vale la pena lo que obtengo a cambio? No desperdicies cartas en cadenas que no van a cambiar el resultado.</li>
        </ul>

        <h3 class="form-nb-subtitle">🏟️ Gestión del Campo</h3>
        <ul class="form-nb-list">
            <li><strong>Sobreconstruir el campo:</strong> un error común es invocar más monstruos de los necesarios para ganar. Cada monstruo adicional es un recurso gastado que podría ser necesario después. Pregunta: ¿necesito invocar este quinto monstruo para ganar este turno?</li>
            <li><strong>Proteger lo necesario, no todo:</strong> proteger cada carta en campo consume recursos rápidamente. Identifica cuál es la carta más crítica y protege esa — las demás son prescindibles si el núcleo de la estrategia sobrevive.</li>
            <li><strong>Dejar al oponente en 100 LP:</strong> el oponente con 100 LP es tan peligroso como con 8000. No desperdicies un combo completo para dejarlo en LP bajos sin cerrar el duelo.</li>
        </ul>

        <h3 class="form-nb-subtitle">🕐 Gestión del Duelo Largo (Grind Game)</h3>
        <p class="form-nb-text">Si el duelo llega al turno 4 o 5, evalúa quién tiene más recursos totales (cartas + campo + cementerio + LP). Si vas arriba en recursos, juega conservador — el tiempo trabaja a tu favor. Si vas abajo, necesitas asumir riesgos para recuperar ventaja. El Deckout (quedarte sin cartas) también es una forma de perder si el duelo se extiende mucho — algunos decks usan esto como victoria alternativa (mill); si tu deck tiene pocos recursos de recuperación, evita robar de más.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Al final de cada turno, hazte esta pregunta: "¿Tengo más recursos que al inicio de mi turno, menos, o igual?" Si consistentemente tienes menos recursos cada turno sin estar más cerca de ganar, estás siendo outresourced — necesitas cambiar el plan. El jugador que mejor gestiona sus recursos en el largo plazo, no el que hace los combos más espectaculares, gana los duelos ajustados.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('gestion-lp-recursos')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            <a href="#" class="form-link" onclick="Formacion.goToTab('simuladores','duelo'); return false;">Simuladores → ⚔️ Duelo en Vivo</a>
            trae un contador de LP para ambos jugadores —úsalo en tu próxima partida de práctica para acostumbrarte a pensar
            en LP como recurso, no como marcador de miedo. Después, en <strong>Mi Deck → 🎯 Optimización</strong>, registra si
            la ronda terminó en victoria/derrota y con qué tipo de cierre, para ver si tus decisiones de gasto de LP
            correlacionan con ganar más rondas.
        </p>
    `; },

    _topicFormatosDiferencias: function () { return `
        <h2 class="form-nb-title">Formatos y sus Diferencias</h2>
        <p class="form-nb-text">Yu-Gi-Oh! no es un solo juego — es varios juegos con las mismas cartas pero reglas distintas. Saber en qué formato estás jugando cambia completamente qué cartas son válidas, qué estrategias funcionan y qué rulings aplican.</p>

        <h3 class="form-nb-subtitle">🏆 Formato Avanzado (TCG / OCG — Actual)</h3>
        <p class="form-nb-text">El formato estándar moderno. Se basa en la Master Rule 5 (vigente desde 2020) y es el que usa la mayoría de los torneos oficiales de Konami.</p>
        <ul class="form-nb-list">
            <li>Banlist actualizada ~cada 3 meses (Prohibidas, Limitadas, Semi-Limitadas).</li>
            <li>Sistema de zonas con Extra Monster Zones — solo 2 zonas del Extra disponibles por defecto. Los Links habilitan más zonas.</li>
            <li>Deck: 40-60 cartas. Extra Deck: hasta 15. Side Deck: hasta 15.</li>
            <li>Match de 3 partidas (Best of 3), con Side Deck entre partidas.</li>
        </ul>
        <p class="form-nb-text"><strong>TCG vs OCG:</strong> TCG (Trading Card Game) es la versión occidental (América, Europa); OCG (Original Card Game) es la versión oriental (Japón, Asia). La banlist es DIFERENTE — cartas prohibidas en TCG pueden estar libres en OCG. Algunas cartas son exclusivas de OCG o llegaron antes allá. Las reglas de timing y prioridad tienen diferencias menores en casos específicos: en OCG, los efectos activados en zona privada (mano) tienen menor prioridad que los de zona pública (campo) en ciertas ventanas.</p>

        <h3 class="form-nb-subtitle">💻 Master Duel (Digital Oficial)</h3>
        <p class="form-nb-text">Versión digital de Konami, gratuita en PC, consolas y móvil. Tiene su propia banlist, diferente a TCG y OCG — puede ser más o menos restrictiva. Usa tiendas de cartas con gemas (moneda del juego) y torneos con clasificatorias oficiales. El pool de cartas va atrasado respecto al físico.</p>

        <h3 class="form-nb-subtitle">🐐 GOAT Format</h3>
        <p class="form-nb-text">Formato nostálgico que simula el meta de 2005 (la época del "GOAT" o meta óptimo). No usa las Master Rules modernas.</p>
        <ul class="form-nb-list">
            <li>6 cartas en mano máximo, 1 sola zona de campo (sin Extra Monster Zones ni Link mechanics).</li>
            <li>Los Ignition Effects del jugador activo tienen prioridad al invocar (podías activar un efecto al mismo tiempo que invocabas, antes de que el oponente pudiera responder).</li>
            <li>Las jugadas ilegales resultan en la pérdida de la carta y un rebarajeo, no simplemente se deshacen.</li>
            <li>Los monstruos trampa ocupan tanto el backrow original como la zona de monstruos. Si no puedes pagar el costo de LP de un efecto, la carta se destruye.</li>
            <li>Sin Extra Deck, sin Links, sin Sincro, sin XYZ ni Péndulos. Se juega con el pool de cartas de 2005.</li>
        </ul>

        <h3 class="form-nb-subtitle">⚖️ Genesys Format</h3>
        <p class="form-nb-text">Formato alternativo independiente de Konami. No hay banlist — en cambio, cada carta tiene un valor en puntos y construyes tu deck con un presupuesto máximo. Las cartas que no aparecen en la lista de puntos valen 0 (libres). No se permiten monstruos Link ni Péndulo. Diseñado para equilibrar el juego sin restricciones directas.</p>

        <h3 class="form-nb-subtitle">⏳ Time Wizard Format</h3>
        <p class="form-nb-text">No es un meta fijo — es una categoría de torneos nostálgicos donde ambos jugadores acuerdan jugar con el cardpool y las reglas de una fecha específica del pasado (ej: "Format de Octubre 2010"). Cada Time Wizard es un formato diferente según la fecha elegida.</p>

        <h3 class="form-nb-subtitle">📝 Erratas en las Cartas</h3>
        <p class="form-nb-text">Algunas cartas tuvieron cambios en su texto oficial a lo largo de los años. Las versiones más antiguas pueden tener texto diferente al actual, pero siempre aplica el texto oficial más reciente, no el de la impresión antigua. Ej: "Monster Reborn" fue erratada para especificar que invoca del cementerio de cualquier jugador, no solo el tuyo. Si hay discrepancia, el texto actual en el ruling oficial de Konami prevalece.</p>

        <h3 class="form-nb-subtitle">🌐 Terminología: Diferencias TCG vs OCG</h3>
        <ul class="form-nb-list">
            <li><strong>"cards you control"</strong> = cartas en tu campo (no en mano).</li>
            <li><strong>"add"</strong> = agregar a la mano (no robar del deck). <strong>"draw"</strong> = robar del deck específicamente.</li>
            <li><strong>"unaffected"</strong> = inafectado por efectos. <strong>"cannot be destroyed"</strong> = indestructible.</li>
            <li><strong>"negate the effect"</strong> ≠ "negate the activation" (son cosas distintas).</li>
            <li><strong>"special summon"</strong> ≠ "normal summon". <strong>"send to the GY"</strong> ≠ "discard" (enviar desde campo ≠ descartar desde mano).</li>
            <li><strong>"any player"</strong> = ambos jugadores, no solo uno.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Cuando veas un decklist de internet, siempre confirma en qué formato fue construido. Un deck de OCG puede tener cartas prohibidas en TCG. Un deck de GOAT no tiene sentido en el formato moderno. El formato cambia todo: las cartas, las estrategias, los rulings y el ritmo del juego.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('formatos-diferencias')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Entra a
            <a href="#" class="form-link" onclick="Formacion.goToConfigSection('banlist-section'); return false;">Config → 🚫 Banlist del Formato</a>
            y alterna entre las pestañas <strong>TCG</strong>, <strong>OCG</strong> y <strong>Genesys</strong>: verás en vivo
            qué cartas cambian de estatus entre formatos, y en Genesys el sistema de puntos con el presupuesto de tu deck
            activo — la diferencia entre formatos dejada de ser teoría y se vuelve algo que puedes comparar carta por carta.
        </p>
    `; },

    _topicSideDeck: function () { return `
        <h2 class="form-nb-title">El Side Deck</h2>
        <p class="form-nb-text">El Side Deck es la diferencia entre un jugador que "juega el deck" y uno que "juega el match". Un deck sin Side Deck pensado es un deck que renuncia a la mitad de la estrategia competitiva antes de empezar.</p>

        <h3 class="form-nb-subtitle">📋 Qué Es el Side Deck</h3>
        <p class="form-nb-text">Es una zona de hasta 15 cartas que puedes intercambiar libremente con tu Main Deck y Extra Deck entre partidas del mismo match.</p>
        <ul class="form-nb-list">
            <li>La cantidad de cartas en tu Main Deck y Extra Deck no puede cambiar entre partidas (si empezaste con 40 en Main, terminas con 40).</li>
            <li>Puedes hacer todos los intercambios que quieras, pero siempre 1 a 1.</li>
            <li>El oponente ve qué cambias visualmente (sabe que cambiaste X cartas), pero no sabe exactamente qué metiste o sacaste.</li>
            <li>Solo puedes sidear entre partidas 2 y 3, no antes de la 1.</li>
        </ul>

        <h3 class="form-nb-subtitle">🎯 Para Qué Sirve</h3>
        <ul class="form-nb-list">
            <li><strong>Agregar counters específicos:</strong> si en la partida 1 confirmas qué deck juega el oponente, mete las cartas que más lo afectan. Ej: si juega Labrynth, metes <a href="#" class="form-link" onclick="Formacion.openCard('Anti-Spell Fragrance'); return false;">Anti-Spell Fragrance</a> o <a href="#" class="form-link" onclick="Formacion.openCard('Spell Canceller'); return false;">Spell Canceller</a>.</li>
            <li><strong>Quitar cartas que no sirven:</strong> algunas cartas de tu main deck no tienen uso en ciertos matchups. Ej: Anti-Handtraps contra un deck sin Handtraps — sabes que no necesitas <a href="#" class="form-link" onclick="Formacion.openCard('Crossout Designator'); return false;">Crossout Designator</a>.</li>
            <li><strong>Cambiar el plan de juego completamente:</strong> algunos decks tienen un "plan B" de Side Deck tan poderoso que la partida 2 es casi un deck diferente. Ej: meter un engine de "going second" si el oponente ganó el coin flip y elige ir primero.</li>
        </ul>

        <h3 class="form-nb-subtitle">🛠️ Cómo Construir el Side Deck</h3>
        <ul class="form-nb-list">
            <li><strong>Paso 1 — Identifica los 3-4 decks más comunes del meta local:</strong> no el meta global de internet — el meta de tu torneo específico.</li>
            <li><strong>Paso 2 — Para cada deck, identifica su punto débil:</strong> ¿qué carta o efecto lo apaga completamente? ¿qué lo hace más lento o inconsistente?</li>
            <li><strong>Paso 3 — Busca cartas que cubran múltiples matchups:</strong> una carta que sirve contra 3 decks es mejor que una que solo sirve contra 1.</li>
            <li><strong>Paso 4 — Define cuántas copias incluir:</strong> 3 copias si el matchup es crítico y la necesitas casi siempre; 2 si es útil pero no urgente; 1 si es muy situacional o ya la tienes en el Main.</li>
            <li><strong>Paso 5 — Decide qué sacas del Main para cada situación:</strong> tenerlo definido de antemano, sin improvisar, es la clave del siding efectivo.</li>
        </ul>

        <h3 class="form-nb-subtitle">⏱️ Cuándo Sidear y Cuándo No</h3>
        <ul class="form-nb-list">
            <li><strong>Sidear mucho:</strong> si el oponente tiene un mecanismo central que debes apagar; si tu plan A claramente no funcionó en la partida 1; si el oponente sideó también — asume que tiene counters para tu plan A.</li>
            <li><strong>Sidear poco o nada:</strong> si ganaste la partida 1 cómodamente — tu plan A funcionó; si tus Side Cards no son relevantes para este matchup específico; si cambiar mucho rompe la consistencia de tu deck.</li>
            <li><strong>¿Sidear contra tu propio estilo?</strong> a veces, si ganaste la partida 1 y el oponente sideó agresivamente contra ti, meter algunas cartas "inesperadas" puede sorprenderlo. Ej: si eres un deck combo y el oponente mete Anti-Combo cards, podrías sidear un engine de Control alternativo que no esperan.</li>
        </ul>

        <h3 class="form-nb-subtitle">🛡️ Anti-Metas Comunes por Tipo de Deck</h3>
        <ul class="form-nb-list">
            <li><strong>Contra Combo Decks:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Nibiru, the Primal Being'); return false;">Nibiru</a> (si invocan 5+ en turno 1), <a href="#" class="form-link" onclick="Formacion.openCard('Dimensional Barrier'); return false;">Dimensional Barrier</a> (declara el tipo de invocación especial del combo), <a href="#" class="form-link" onclick="Formacion.openCard('Summon Limit'); return false;">Summon Limit</a> (limita las invocaciones especiales por turno), <a href="#" class="form-link" onclick="Formacion.openCard('Skill Drain'); return false;">Skill Drain</a> (niega efectos de monstruos en campo).</li>
            <li><strong>Contra Control Decks:</strong> monstruos con efectos que no pueden ser negados, cartas de robo masivo para superar las interrupciones, <a href="#" class="form-link" onclick="Formacion.openCard('Twin Twisters'); return false;">Twin Twisters</a> / <a href="#" class="form-link" onclick="Formacion.openCard('Cosmic Cyclone'); return false;">Cosmic Cyclone</a> (destruye backrow).</li>
            <li><strong>Contra Decks de Cementerio:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Dimensional Shifter'); return false;">Dimensional Shifter</a> (todo va desterrado ese turno), <a href="#" class="form-link" onclick="Formacion.openCard('Macro Cosmos'); return false;">Macro Cosmos</a> / <a href="#" class="form-link" onclick="Formacion.openCard('Dimensional Fissure'); return false;">Dimensional Fissure</a> (desterrar en vez de al cementerio), <a href="#" class="form-link" onclick="Formacion.openCard('D.D. Crow'); return false;">D.D. Crow</a> / <a href="#" class="form-link" onclick="Formacion.openCard('Ghost Belle & Haunted Mansion'); return false;">Ghost Belle</a> (responde efectos de cementerio).</li>
            <li><strong>Contra Graveyard Recursion:</strong> <a href="#" class="form-link" onclick="Formacion.openCard('Necrovalley'); return false;">Necrovalley</a> (el campo que bloquea el uso del cementerio), <a href="#" class="form-link" onclick="Formacion.openCard('Imperial Iron Wall'); return false;">Imperial Iron Wall</a> (nada puede ser desterrado — frena Outs al cementerio).</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El mejor Side Deck no es el que tiene las cartas más poderosas — es el que tiene las cartas más específicas para lo que vas a enfrentar. Un jugador con 15 cartas bien pensadas para su meta local gana más que uno con 15 Staples genéricos que sirven para "todo pero no para nada específico".</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('side-deck')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Arma tu zona de Side en <strong>Mi Deck → 🔨 Construcción</strong> (las cartas con ubicación "side" no cuentan
            para el conteo de Main/Extra). Para decidir qué sidear contra cada rival, registra tus matches en
            <strong>Mi Deck → 🎯 Optimización → ⚔️ Historial de Enfrentamientos</strong>: el W/L y las notas por rival te dicen
            exactamente qué matchup necesita más ayuda del Side Deck.
        </p>
    `; },


    _topicPracticarEvento: function () { return `
        <h2 class="form-nb-title">Practicar Antes de un Evento</h2>
        <p class="form-nb-text">Llegar a un torneo sin haber estresado tu línea de combo bajo interrupción real es la forma más común de perder rondas que deberías haber ganado. Practicar no es "jugar partidas" — es una rutina con objetivo.</p>

        <h3 class="form-nb-subtitle">📋 Rutina de Práctica Pre-Torneo</h3>
        <ul class="form-nb-list">
            <li><strong>Volumen mínimo:</strong> antes de un evento importante, apunta a un número concreto de rondas de Optimización con tu lista final — no partidas casuales sin registro, sino rondas documentadas con resultado real.</li>
            <li><strong>Contra las listas correctas:</strong> practica contra las 3-4 listas más probables del meta local (o del torneo específico si lo conoces), no contra bots genéricos o el primer oponente random de Ranked.</li>
            <li><strong>Bajo presión real:</strong> juega asumiendo que el rival tiene la interrupción óptima en el momento óptimo, no la mejor mano posible para ti. Practicar solo contra manos fáciles genera una falsa confianza.</li>
            <li><strong>Ambos turnos:</strong> practica tanto yendo primero como yendo segundo — muchos jugadores solo ensayan su combo de ir primero y llegan al torneo sin plan real yendo segundo.</li>
        </ul>

        <h3 class="form-nb-subtitle">🧊 Cuándo "Congelar" la Lista</h3>
        <p class="form-nb-text">Define un punto de corte (ej. 2-3 días antes del evento) después del cual dejas de tocar el Main Deck salvo un cambio crítico confirmado. Cambiar cartas hasta la noche anterior genera un deck que nunca practicaste realmente — vuelves al torneo con una versión no probada.</p>

        <h3 class="form-nb-subtitle">🔁 Método AAR — Revisión Post-Duelo</h3>
        <p class="form-nb-text">Después de cada duelo de práctica, responde estas 5 preguntas (tómalas como plantilla de tus notas):</p>
        <ol class="form-nb-list">
            <li><strong>1. ¿Cuál era mi plan al empezar el duelo?</strong></li>
            <li><strong>2. ¿En qué momento cambió mi plan?</strong></li>
            <li><strong>3. ¿Qué información ignoré?</strong></li>
            <li><strong>4. ¿Qué decisión me dio más dudas?</strong> (aquí es donde más se aprende)</li>
            <li><strong>5. Si jugara otra vez, ¿qué haría diferente?</strong></li>
        </ol>
        <p class="form-nb-text">Este método (usado por pilotos y equipos de alto rendimiento bajo el nombre After Action Review) convierte cada derrota de práctica en información útil, en vez de solo frustración.</p>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">El objetivo de practicar no es ganar todas las partidas de entrenamiento — es descubrir tus fallas de decisión antes de que cuesten un torneo real. Si nunca pierdes en tus prácticas, probablemente no estás practicando contra la presión correcta.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('practicar-evento')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Usa <strong>Mi Deck → 🎯 Optimización</strong> como bitácora de práctica: crea una sesión etiquetada con el
            nombre del evento próximo, registra cada ronda, y usa el campo <strong>notas</strong> con las 5 preguntas del
            método AAR. Antes de congelar la lista, revisa el bloque <strong>🎖️ Nivel como Piloto</strong> — si sigues en
            un nivel bajo con tu deck actual, es señal de que necesitas más rondas antes del evento, no más cambios a la lista.
        </p>
    `; },
    _topicMetaTiers: function () { return `
        <h2 class="form-nb-title">El Meta y los Tiers de Poder</h2>
        <p class="form-nb-text">Antes de un torneo, la pregunta no es "¿mi deck es bueno?" sino "¿mi deck es bueno <em>contra lo que voy a enfrentar</em>?". El Meta es ese contexto: la fotografía de qué decks se están jugando, en qué proporción, y qué tan fuertes son entre sí.</p>

        <h3 class="form-nb-subtitle">📸 Qué es "El Meta"</h3>
        <p class="form-nb-text">El metagame (Meta) es el conjunto de decks que realmente se están jugando en un formato/región/momento dado — no lo que es teóricamente posible, sino lo que de verdad te vas a encontrar en las mesas. Se construye leyendo resultados de torneos recientes (Top Cut, Champions, YCS, locales grandes) y agrupando qué arquetipos repiten presencia.</p>
        <ul class="form-nb-list">
            <li><strong>Meta global:</strong> lo que domina a nivel mundial/competitivo alto (útil como referencia, no siempre representa tu mesa local).</li>
            <li><strong>Meta local:</strong> lo que realmente juega tu tienda/región. Para el Side Deck (ver lección anterior) y la preparación real de un evento, este es el que más importa.</li>
        </ul>

        <h3 class="form-nb-subtitle">🏆 Qué es un "Tier"</h3>
        <p class="form-nb-text">Un Tier es un rango de poder relativo dentro del Meta. Clasifica arquetipos según qué tan consistentemente rinden en torneos:</p>
        <ul class="form-nb-list">
            <li><strong>Tier 0 (raro, señal de formato roto):</strong> un deck tan por encima del resto que domina sin rival real. Suele terminar en Banlist rápido.</li>
            <li><strong>Tier 1:</strong> los decks más fuertes y consistentes del formato actual — los que más vas a ver, y contra los que más necesitas un plan.</li>
            <li><strong>Tier 2:</strong> competitivos y viables, ganan torneos pero con menos frecuencia o algo más de dependencia de matchup favorable.</li>
            <li><strong>Tier 3 / Rogue:</strong> jugables y a veces con techo alto, pero inconsistentes o con debilidades explotables; sorprenden porque son menos conocidos.</li>
            <li><strong>Off-meta / Casual:</strong> divertidos o nostálgicos, pero sin presencia real en el competitivo actual.</li>
        </ul>

        <h3 class="form-nb-subtitle">📊 Cómo se Establece un Tier (en la práctica)</h3>
        <ul class="form-nb-list">
            <li><strong>Presencia (Meta Share):</strong> qué porcentaje de los decks en un torneo grande son ese arquetipo.</li>
            <li><strong>Conversión:</strong> de los que lo juegan, ¿cuántos llegan a Top Cut/premian? Presencia sin conversión indica un deck popular pero no necesariamente fuerte.</li>
            <li><strong>Consistencia interna:</strong> qué tan seguido el deck ejecuta su plan de juego ideal (starters, extenders, board completo) — el mismo concepto que mide tu <strong>Internal Score</strong> en esta app.</li>
            <li><strong>Resiliencia frente al campo:</strong> qué tan bien resiste interrupciones (Handtraps, Boardbreakers) del resto del meta — tu eje de <strong>Resiliencia</strong> y <strong>vulnerabilidad G1/G2</strong>.</li>
        </ul>

        <h3 class="form-nb-subtitle">🎯 Relevancia de Atención — Priorizar tu Preparación</h3>
        <p class="form-nb-text">No puedes preparar tu Side Deck y tu plan de juego contra los 40 arquetipos que existen — necesitas priorizar. La "relevancia de atención" es simple: dedica preparación proporcional a la probabilidad de encontrarte ese matchup, ponderada por qué tan mal te va contra él.</p>
        <ul class="form-nb-list">
            <li><strong>Alta presencia + tú eres débil contra él → máxima prioridad.</strong> Es el matchup que más veces vas a perder si lo ignoras.</li>
            <li><strong>Alta presencia + tú eres fuerte contra él → prioridad media.</strong> Lo vas a ver seguido, pero ya tienes ventaja natural.</li>
            <li><strong>Baja presencia + tú eres débil contra él → prioridad baja.</strong> Duele si aparece, pero es poco probable — no vale sacrificar Side Deck por él salvo que sepas que está en tu meta local.</li>
            <li><strong>Baja presencia + tú eres fuerte contra él → ignóralo.</strong> No gastes recursos de preparación ahí.</li>
        </ul>

        <h3 class="form-nb-subtitle">💡 Consejo Clave</h3>
        <p class="form-nb-text">Un jugador competitivo no memoriza "qué deck es el mejor" en abstracto — aprende a leer su propio Tier relativo al meta que va a enfrentar. Un deck Tier 2 bien preparado contra el Tier 1 dominante de su región puede rendir mejor en un torneo específico que un Tier 1 jugado sin plan.</p>

        <h3 class="form-nb-subtitle">🧪 Ponte a Prueba</h3>
        ${this._renderQuiz('meta-tiers')}

        <h3 class="form-nb-subtitle">🛠️ Implementación en Destiny Draw!</h3>
        <p class="form-nb-text">
            Entra a
            <a href="#" class="form-link" onclick="Formacion.goToTab('estadisticas'); return false;">Estadísticas → Meta</a>
            e importa los decks de tu meta (local o global, vía .ydk). Presiona <strong>Actualizar Data</strong> para calcular
            el <strong>Top Tier</strong> — ranking real de todos los decks del meta por score, filtrable por pilar dominante.
            Luego compara tu deck activo contra ese meta en <strong>Análisis vs Meta</strong>: el <strong>External Score</strong>
            y la vulnerabilidad G1/G2 te dicen exactamente dónde priorizar tu Side Deck según la lógica de "relevancia de
            atención" de esta lección — no en teoría, con tus propios números.
        </p>
    `; },


    // ===============================
_renderDecksTab: function () {
        if (!window.DecklistsData) {
            return '<p class="form-empty" style="margin-top:20px;">No hay decklists cargadas (falta Modules/decklists.js).</p>';
        }
        const groups = DecklistsData.getGroupedByLevel();
        const ROWS = [
            { key: 'Basico',      label: 'Básico',      icon: '🌱' },
            { key: 'Intermedio',  label: 'Intermedio',  icon: '⚔️' },
            { key: 'Competitivo', label: 'Competitivo', icon: '🏆' }
        ];
        return `
            <div class="form-section" style="margin-top:12px;">
                <div class="form-section-content" style="border-top:none;">
                    ${ROWS.map(row => `
                        <div class="form-decks-row">
                            <div class="form-decks-row-title">${row.icon} ${row.label}</div>
                            <div class="form-decks-row-list">
                                ${groups[row.key].length
                                    ? groups[row.key].map(name => `<button type="button" class="form-deck-chip" onclick="Formacion.loadDeckFromList('${this._escAttr(name)}')">${this._escHtml(name)}</button>`).join('')
                                    : '<span class="form-empty">Sin decks en este nivel.</span>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    loadDeckFromList: async function (deckName) {
        if (!window.DecklistsData || !window.Deck) return;
        const entry = DecklistsData.getByName(deckName);
        if (!entry) return;
        await Deck.parseYDK(entry.ydk, entry.name + '.ydk');
        if (typeof switchTab === 'function') switchTab('mideck');
    },
    _renderJuegosTab: function () {
        const games = window.ConfigManager?.getFormacionGames?.() ?? [];
        if (!games.length) {
            return '<p class="form-empty" style="margin-top:20px;">No hay juegos configurados. Ve a Configuración → Juegos Alternativos.</p>';
        }
        return `
            <div class="form-section" style="margin-top:12px;">
                <div class="form-section-content" style="border-top:none;">
                    <div class="form-juegos-grid">
                        ${games.map(g => this._renderGameCard(g)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    _renderGameCard: function (g) {
        const platforms = Array.isArray(g.platforms) ? g.platforms : [];
        const platformBadges = platforms.length
            ? platforms.map(p => `<span class="form-platform-badge">${this._escHtml(p)}</span>`).join('')
            : '<span class="form-platform-badge form-platform-none">Sin plataforma</span>';

        const fallback = g.fallbackUrl ? g.fallbackUrl.trim() : '';
        const resolved = fallback.startsWith('local:')
            ? (window.ConfigManager?.getFormacionFallbacks?.()[fallback.replace('local:', '')] || '')
            : fallback;

        const imgBlock = resolved
            ? `<img class="form-game-img" src="${this._escAttr(resolved)}" alt="${this._escAttr(g.name || '')}" loading="lazy">`
            : `<div class="form-game-img form-game-img--empty"><span>Sin imagen</span></div>`;

        const hasLink = g.link ? g.link.trim() : '';
        return `
            <a class="form-game-card${hasLink ? '' : ' form-game-card--nolink'}"
               ${hasLink ? `href="${this._escAttr(hasLink)}" target="_blank" rel="noopener noreferrer"` : ''}
               title="${this._escAttr(g.name || '')}">
                <div class="form-game-img-wrap">${imgBlock}</div>
                <div class="form-game-info">
                    <div class="form-game-name">${this._escHtml(g.name || 'Sin nombre')}</div>
                    ${g.title ? `<div class="form-game-title">${this._escHtml(g.title)}</div>` : ''}
                    <div class="form-game-platforms">
                        <span class="form-platforms-label">Plataforma:</span>
                        <div class="form-platforms-row">${platformBadges}</div>
                    </div>
                </div>
            </a>
        `;
    },

    // ===============================

    _escHtml: function (str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    _escAttr: function (str) {
        return String(str).replace(/"/g, '&quot;');
    },
    _renderFuentesTab: function () {
    if (window.Meta) return Meta._renderFuentesSection();
    return '<p class="form-empty">Módulo Meta no disponible.</p>';
},

_renderMaestrosTab: function () {
    if (window.Meta) return Meta._renderMaestrosSection();
    return '<p class="form-empty">Módulo Meta no disponible.</p>';
},
};

window.Formacion = Formacion;



// ── Meta — renderiza secciones Maestros del Juego y Fuentes Externas; usado como delegado por Formacion ──

const Meta = {

    container: null,

    FORMATS: ['TCG', 'OCG', 'Genesys', 'Master Duel', 'Duel Links', 'Time Wizard', 'Todos'],

    init: function () {
        this.container = document.getElementById('meta-content');
        if (!this.container) return;
        this.render();
    },

    render: function () {
        if (!this.container) return;
        this.container.innerHTML = `
            <h2>Meta</h2>

            <!-- Sección: Maestros del Juego (desplegada por defecto) -->
            <div class="meta-section">
                <h3 class="meta-section-title" onclick="Meta.toggleSection('meta-maestros-section')">
                    ▼ Maestros del Juego
                </h3>
                <div id="meta-maestros-section" class="meta-section-content">
                    ${this._renderMaestrosSection()}
                </div>
            </div>

            <!-- Sección: Fuentes Externas -->
            <div class="meta-section" data-section-id="meta-fuentes">
                <h3 class="meta-section-title" onclick="Meta.toggleSection('meta-fuentes-section')">
                    ▶ Fuentes Externas
                </h3>
                <div id="meta-fuentes-section" class="meta-section-content" style="display:none;">
                    ${this._renderFuentesSection()}
                </div>
            </div>
        `;
    },

    toggleSection: function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        const title = el.previousElementSibling;
        if (el.style.display === 'none') {
            el.style.display = 'block';
            if (title) title.textContent = title.textContent.replace('▶', '▼');
        } else {
            el.style.display = 'none';
            if (title) title.textContent = title.textContent.replace('▼', '▶');
        }
    },

    // ===============================

    _renderMaestrosSection: function () {
        const masters = window.ConfigManager?.getMetaMasters?.() ?? [];
        if (!masters.length) {
            return '<p class="meta-empty">No hay maestros configurados. Ve a Configuración → Maestros del Juego.</p>';
        }
        return `
            <div class="meta-maestros-grid">
                ${masters.map(m => this._renderMasterCard(m)).join('')}
            </div>
        `;
    },

    _renderMasterCard: function (m) {
        const videoId  = this._extractYoutubeId(m.videoUrl || '');
        const embedUrl = videoId
            ? `https://www.youtube-nocookie.com/embed/${videoId}`
            : null;
        const formats  = Array.isArray(m.formats) ? m.formats : [];

        const formatBadges = formats.length
            ? formats.map(f => `<span class="meta-format-badge">${this._escHtml(f)}</span>`).join('')
            : '<span class="meta-format-badge meta-format-none">Sin formato</span>';

        const fallback = m.fallbackUrl ? m.fallbackUrl.trim() : '';
        const resolvedFallback = fallback.startsWith('local:')
    ? (ConfigManager.getMetaFallbacks()[fallback.replace('local:', '')] || '')
    : fallback;
        const isMp4 = resolvedFallback.toLowerCase().endsWith('.mp4');

        const fallbackContent = fallback
            ? (isMp4
                ? `<video class="meta-master-fallback-media" autoplay muted loop playsinline>
                    <source src="${this._escAttr(fallback)}" type="video/mp4">
                </video>`
                : `<img class="meta-master-fallback-media" src="${this._escAttr(fallback)}" alt="${this._escAttr(m.name || '')}">`)
            : `<div class="meta-master-video--empty"><span>Sin video configurado</span></div>`;

        const videoBlock = embedUrl
            ? `<div class="meta-master-video">
                <iframe
                    src="${embedUrl}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen loading="lazy"
                    title="${this._escAttr(m.name || 'Video')}"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                </iframe>
                <div class="meta-master-fallback" style="display:none;">${fallbackContent}</div>
            </div>`
            : `<div class="meta-master-video">${fallbackContent}</div>`;

                const channelBtn = m.channelUrl
            ? `<a class="meta-master-channel-btn"
                href="${this._escAttr(m.channelUrl)}"
                target="_blank" rel="noopener noreferrer">
                📺 Ir al canal
            </a>`
            : '';

const videoFallbackBtn = videoId
    ? `<a class="meta-master-yt-fallback"
          href="https://www.youtube.com/watch?v=${videoId}"
          target="_blank" rel="noopener noreferrer">
           ▶ Ver en YouTube si no carga
       </a>`
    : '';

        return `
            <div class="meta-master-card">
                ${videoBlock}
                <div class="meta-master-info">
                    <div class="meta-master-name">${this._escHtml(m.name || 'Sin nombre')}</div>
                    ${m.title ? `<div class="meta-master-title">${this._escHtml(m.title)}</div>` : ''}
                    <div class="meta-master-formats">
                        <span class="meta-formats-label">Formato Especializado:</span>
                        <div class="meta-formats-row">${formatBadges}</div>
                    </div>
                    ${channelBtn}
                    ${videoFallbackBtn}
                </div>
            </div>
        `;
    },

    // Extrae el ID de YouTube desde múltiples formatos de URL
    _extractYoutubeId: function (url) {
        if (!url) return null;
        const patterns = [
            /[?&]v=([^&#]+)/,
            /youtu\.be\/([^?&#]+)/,
            /youtube\.com\/embed\/([^?&#]+)/,
            /youtube\.com\/shorts\/([^?&#]+)/
        ];
        for (const p of patterns) {
            const m = url.match(p);
            if (m) return m[1];
        }
        return null;
    },

    // ===============================

    _renderFuentesSection: function () {
        const links = window.ConfigManager?.getMetaLinks?.() ?? [];
        if (!links.length) {
            return '<p class="meta-empty">No hay fuentes configuradas. Ve a Configuración → Fuentes Externas del Meta.</p>';
        }

        return `
            <div class="meta-fuentes-tabs">
                <div class="meta-tabs-nav" id="meta-tabs-nav">
                    ${links.map((lk, i) => `
                        <button class="meta-tab-btn${i === 0 ? ' active' : ''}"
                                onclick="Meta.showFrame(${i})"
                                id="meta-tab-btn-${i}">
                            ${this._escHtml(lk.title || `Fuente ${i + 1}`)}
                        </button>
                    `).join('')}
                </div>
                <div class="meta-frames-container" id="meta-frames-container">
                    ${links.map((lk, i) => `
                        <div class="meta-frame-pane${i === 0 ? ' active' : ''}" id="meta-frame-pane-${i}">
                            ${lk.desc ? `<p class="meta-frame-desc">${this._escHtml(lk.desc)}</p>` : ''}
                            <div class="meta-frame-toolbar">
                                <span class="meta-frame-url">${this._escHtml(lk.url)}</span>
                                <a class="meta-frame-open-btn" href="${this._escAttr(lk.url)}" target="_blank" rel="noopener noreferrer">
                                    ↗ Abrir en nueva pestaña
                                </a>
                            </div>
                            <div class="meta-iframe-wrapper" id="meta-iframe-wrapper-${i}">
                                <iframe
                                    src="${this._escAttr(lk.url)}"
                                    class="meta-iframe"
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
                                    referrerpolicy="no-referrer"
                                    loading="lazy"
                                    onload="Meta._onFrameLoad(${i}, this)"
                                    onerror="Meta._onFrameError(${i})"
                                    title="${this._escAttr(lk.title || 'Fuente externa')}">
                                </iframe>
                                <div class="meta-iframe-blocked" id="meta-iframe-blocked-${i}" style="display:none;">
                                    <div class="meta-blocked-content">
                                        <span class="meta-blocked-icon">🚫</span>
                                        <p>Este sitio no permite ser embebido.</p>
                                        <a class="btn btn-primary meta-blocked-link"
                                           href="${this._escAttr(lk.url)}"
                                           target="_blank" rel="noopener noreferrer">
                                            ↗ Abrir ${this._escHtml(lk.title || 'enlace')}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    showFrame: function (index) {
        document.querySelectorAll('.meta-frame-pane').forEach((p, i) => p.classList.toggle('active', i === index));
        document.querySelectorAll('.meta-tab-btn').forEach((b, i)  => b.classList.toggle('active',  i === index));
    },

    _onFrameLoad: function (index, iframe) {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc && doc.body) return;
        } catch (_) {}
        const wrapper  = document.getElementById(`meta-iframe-wrapper-${index}`);
        const existing = document.getElementById(`meta-iframe-hint-${index}`);
        if (!wrapper || existing) return;
        const hint = document.createElement('div');
        hint.id        = `meta-iframe-hint-${index}`;
        hint.className = 'meta-iframe-hint';
        hint.innerHTML = `
            <span>¿No ves el contenido?</span>
            <button onclick="Meta._showBlocked(${index})">Ver enlace externo</button>
            <button class="meta-hint-close" onclick="this.parentElement.remove()">✕</button>
        `;
        wrapper.appendChild(hint);
    },

    _onFrameError: function (index) { this._showBlocked(index); },

    _showBlocked: function (index) {
        const blocked = document.getElementById(`meta-iframe-blocked-${index}`);
        const iframe  = document.querySelector(`#meta-frame-pane-${index} .meta-iframe`);
        if (blocked) blocked.style.display = 'flex';
        if (iframe)  iframe.style.display  = 'none';
    },

    // ===============================

    _escHtml: function (str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    _escAttr: function (str) {
        return String(str).replace(/"/g, '&quot;');
    }
};

window.Meta = Meta;



// ── Config — UI de configuración: roles, staples, nomenclatura, pilares, maestros, fuentes, música, borrado de datos ──

// ── TestDuelo — almacenamiento y export/import de Tests custom (Teóricos y Prácticos) ──
const TestDuelo = {
    KEY: 'yugioh_custom_tests',

    getAll: function () {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
        catch (_) { return []; }
    },
    getByCategory: function (cat) { return this.getAll().filter(t => t.category === cat); },
    get: function (id) { return this.getAll().find(t => t.id === id) || null; },

    save: function (test) {
        const list = this.getAll();
        const idx  = list.findIndex(t => t.id === test.id);
        if (idx > -1) list[idx] = test; else list.push(test);
        localStorage.setItem(this.KEY, JSON.stringify(list));
        return test;
    },

    remove: function (id) {
        localStorage.setItem(this.KEY, JSON.stringify(this.getAll().filter(t => t.id !== id)));
    },

    _download: function (content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = filename;
        a.click(); URL.revokeObjectURL(url);
    },

    exportTest: function (id, mode) {
        const test = this.get(id);
        if (!test) { alert('Selecciona un test válido.'); return; }
        const stamp    = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
        const filename = `DD_Test_${(test.label || 'test').replace(/[^a-z0-9]+/gi, '_')}_${stamp}.txt`;
        const content =
            `# DESTINY DRAW — TEST EXPORTADO\n` +
            `# Tipo: ${test.category === 'practicos' ? 'Práctico' : 'Teórico'} | Nivel: ${test.level}\n` +
            `# Importa este archivo desde Config → Test de Duelo → 📥 Agregar Test\n\n` +
            JSON.stringify(test, null, 2);

        this._download(content, filename);

        if (mode === 'send') {
            const subject = encodeURIComponent(`Test Destiny Draw — ${test.label}`);
            const body    = encodeURIComponent(
                `Te comparto un Test de Duelo creado en Destiny Draw!\n\n` +
                `Nombre: ${test.label}\nNivel: ${test.level}\n\n` +
                `📎 Adjunta el archivo .txt que se acaba de descargar:\n  • ${filename}`
            );
            setTimeout(() => { window.location.href = `mailto:franq0524@gmail.com?subject=${subject}&body=${body}`; }, 600);
            alert('✅ Test descargado.\nSe abrirá tu cliente de correo — adjunta el .txt al mensaje.');
        } else {
            alert('✅ Test descargado como .txt.');
        }
    },

    importFromText: function (text) {
        try {
            const jsonPart = text.replace(/^#.*$/gm, '').trim();
            const test = JSON.parse(jsonPart);
            if (!test || (test.category !== 'teoricos' && test.category !== 'practicos')) {
                throw new Error('Formato de test no reconocido.');
            }
            test.id     = `ct_${test.category === 'practicos' ? 'prac' : 'teo'}_${Date.now()}`;
            test.custom = true;
            this.save(test);
            return test;
        } catch (e) {
            alert('❌ No se pudo importar el test: ' + e.message);
            return null;
        }
    },
};
window.TestDuelo = TestDuelo;
const Config = {
    container: null,
    _ta: null,   // estado del Test Práctico en autoría
    _tt: null,   // estado del Test Teórico en autoría (metadata)
    _ttQ: null,  // pregunta actual en construcción

    init: function () {
        this.container = document.getElementById('config-content');
        if (!this.container) { 
            console.error('Config: contenedor no encontrado'); 
            return; 
        }
        this.render();
        if (window.ConfigManager) ConfigManager.renderStaplesPanel();
    },

    render: function () {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <h2>Configuración</h2>

            ${window.ContentManager ? ContentManager.renderConfigSection() : ''}

            <!-- Sección: Roles y Palabras Asociadas -->
            <div class="config-section" data-section-id="config-roles" id="roles-section-wrap">
                <h3 class="config-section-title" onclick="Config.toggleSection('roles-section')">
                    ▶ 🎭 Mecánicas y Roles
                </h3>
                <div id="roles-section" class="config-section-content" style="display:none;">
                    ${this.renderRolesSection()}
                </div>
            </div>

            <!-- Sección: Mecánicas y Counters -->
            <div class="config-section" data-section-id="config-specialties">
                <h3 class="config-section-title" onclick="Config.toggleSection('specialties-section')">
                    ▶ ⚙️ Counters
                </h3>
                <div id="specialties-section" class="config-section-content" style="display:none;">
                    ${this.renderSpecialtiesSection()}
                </div>
            </div>

            <!-- Sección: Lista de Staples -->
            <div class="config-section" data-section-id="config-staples">
                <h3 class="config-section-title" onclick="Config.toggleSection('staples-section')">
                    ▶ 📌 Lista de Staples
                </h3>
                <div id="staples-section" class="config-section-content" style="display:none;">
                    ${this.renderStaplesSection()}
                </div>
            </div>

            <!-- Sección: Nomenclatura de Efectos -->
            <div class="config-section" data-section-id="config-nomenclature">
                <h3 class="config-section-title" onclick="Config.toggleSection('nomenclature-section')">
                    ▶ 🏷️ Nomenclatura de Efectos
                </h3>
                <div id="nomenclature-section" class="config-section-content" style="display:none;">
                    ${this.renderNomenclatureSection()}
                </div>
            </div>

            <!-- Sección: Pilares del Internal Score -->
            <div class="config-section" data-section-id="config-pillars">
                <h3 class="config-section-title" onclick="Config.toggleSection('pillars-section')">
                    ▶ 🧱 Pilares del Internal Score
                </h3>
                <div id="pillars-section" class="config-section-content" style="display:none;">
                    ${this.renderPillarsSection()}
                </div>
            </div>

            <!-- Sección: Scoring Avanzado G1/G2 -->
            <div class="config-section" data-section-id="config-scoring">
                <h3 class="config-section-title" onclick="Config.toggleSection('scoring-section')">
                    ▶ 🎮 Scoring Avanzado (G1/G2)
                </h3>
                <div id="scoring-section" class="config-section-content" style="display:none;">
                    ${this.renderScoringSection()}
                </div>
            </div>

            <!-- Sección: Rendimientos Decrecientes -->
            <div class="config-section" data-section-id="config-diminishing">
                <h3 class="config-section-title" onclick="Config.toggleSection('diminishing-section')">
                    ▶ 📉 Rendimientos Decrecientes
                </h3>
                <div id="diminishing-section" class="config-section-content" style="display:none;">
                    ${this.renderDiminishingSection()}
                </div>
            </div>

            <!-- Sección: Atajos Rápidos -->
            <div class="config-section" data-section-id="config-shortcuts">
                <h3 class="config-section-title" onclick="Config.toggleSection('shortcuts-section')">
                    ▶ ⚡Atajos Rápidos
                </h3>
                <div id="shortcuts-section" class="config-section-content" style="display:none;">
                    ${this.renderShortcutsSection()}
                </div>
            </div>

            <!-- Sección: Banlist del Formato -->
            <div class="config-section" data-section-id="config-banlist">
                <h3 class="config-section-title" onclick="Config.toggleSection('banlist-section'); if(window.Banlist) Banlist.renderSection();">
                    ▶ 🚫 Banlist del Formato
                </h3>
                <div id="banlist-section" class="config-section-content" style="display:none;">
                    <p class="stats-empty">Abre la sección para ver la banlist.</p>
                </div>
                
            </div>
            <!-- Sección: Ajustes de Música -->
            <div class="config-section" data-section-id="config-music">
                <h3 class="config-section-title" onclick="Config.toggleSection('music-section')">
                    ▶ 🎵 Ajustes de Música
                </h3>
                <div id="music-section" class="config-section-content" style="display:none;">
                    ${this.renderMusicSection()}
                </div>
            </div>

            <!-- Sección: Intro de Pestañas -->
            <div class="config-section" data-section-id="config-tabintro">
                <h3 class="config-section-title" onclick="Config.toggleSection('tabintro-section')">
                    ▶ 💡 Intro de Pestañas
                </h3>
                <div id="tabintro-section" class="config-section-content" style="display:none;">
                    ${this.renderTabIntroSection()}
                </div>
            </div>

            <!-- Sección: Maestros del Duelo -->
            <div class="config-section" data-section-id="config-meta-masters">
                <h3 class="config-section-title" onclick="Config.toggleSection('meta-masters-config-section')">
                    ▶ 🎓 Maestros del Duelo
                </h3>
                <div id="meta-masters-config-section" class="config-section-content" style="display:none;">
                    ${this.renderMetaMastersSection()}
                </div>
            </div>

            <!-- Sección: Fuentes Externas del Meta -->
            <div class="config-section" data-section-id="config-meta-links">
                <h3 class="config-section-title" onclick="Config.toggleSection('meta-links-config-section')">
                    ▶ 📚 Fuentes Externas del Meta
                </h3>
                <div id="meta-links-config-section" class="config-section-content" style="display:none;">
                    ${this.renderMetaLinksSection()}
                </div>
            </div>


            <!-- Sección: Juegos Alternativos -->
            <div class="config-section" data-section-id="config-formacion-games">
                <h3 class="config-section-title" onclick="Config.toggleSection('formacion-games-config-section')">
                    ▶ 🎮 Juegos Alternativos de Yu-Gi-Oh!
                </h3>
                <div id="formacion-games-config-section" class="config-section-content" style="display:none;">
                    ${this.renderFormacionGamesSection()}
                </div>
            </div>

            <!-- Sección: Temas de Formación -->
            <div class="config-section" data-section-id="config-formacion-topics">
                <h3 class="config-section-title" onclick="Config.toggleSection('formacion-topics-section')">
                    ▶ 📖 Temas de Formación
                </h3>
                <div id="formacion-topics-section" class="config-section-content" style="display:none;">
                    ${this.renderFormacionTopicsSection()}
                </div>
            </div>

<!-- Sección: Test de Duelo -->
            <div class="config-section" data-section-id="config-test-duelo">
                <h3 class="config-section-title" onclick="Config.toggleSection('test-duelo-section')">
                    ▶ 🧪 Test de Duelo
                </h3>
                <div id="test-duelo-section" class="config-section-content" style="display:none;">
                    ${this.renderTestDueloSection()}
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="config-actions">
                <button class="btn btn-primary" onclick="Config.abrirReportarError()" style="background:#1a5fa8;border-color:#2778d4;" title="Envía un reporte de error al desarrollador">📧 Reportar Error</button>
                <button class="btn btn-success" onclick="Config.generarReporte()" style="background:#2d0a4e;border-color:#7b2cbf;" title="Exporta un .txt con el log de ejecución de esta sesión">📋 Generar Reporte</button>
                <button class="btn btn-primary" onclick="Config.exportConfig()">📥 Exportar Data</button>
                <button class="btn btn-primary" onclick="Config.importConfig()">📤 Importar Data</button>
                <button class="btn btn-success" onclick="Config.resetToDefault()" style="background:#27ae60;border-color:#27ae60;">🔄 Restaurar Configuración</button>
            </div>

            <!-- Zona de borrado -->
            <div class="config-danger-zone" data-section-id="config-danger-zone">
    <div class="config-danger-title">⚠️ Zona de borrado</div>
    <div class="borrar-opciones-grid">
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="decks"> <span>Decks guardados</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="engines"> <span>Engines</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="matchups"> <span>Matchups e Historial</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="optimizacion"> <span>Datos de Optimización (Deck Testing)</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="winrates"> <span>Winrates</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="favoritas"> <span>Favoritas</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="torneo"> <span>Torneo activo</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="practica"> <span>Estados de práctica</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="cache"> <span>Cache de Scores (Power + Cross)</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="meta_library"> <span>Librería de cartas del Meta</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="formacion"> <span>Notas y temas de Formación</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="meta_folders"> <span>Carpetas del Meta (decks importados)</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="banlist"> <span>Banlist del Formato</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="config"> <span>Configuración (roles, scoring, mecánicas…)</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="perfil"> <span>Perfil y bienvenida</span></label>
        <label class="borrar-opcion-row"><input type="checkbox" class="borrar-opcion-cb" data-key="fallbacks"> <span>Imágenes y Fallbacks</span></label>
    </div>
    <div class="borrar-footer-row">
        <label class="borrar-select-all-label">
            <input type="checkbox" id="borrar-select-all" onchange="Config._borrarToggleAll(this.checked)">
            <span>Seleccionar todo</span>
        </label>
        <button class="btn btn-danger" onclick="Config.borrarSeleccion()" style="background:#c0392b;">
            🗑️ Ejecutar Borrado
        </button>
    </div>
</div>

<input type="file" id="config-import-file" accept=".txt" style="display:none;" onchange="Config.handleFileImport(this)">
        `;
    },

    // ===============================
    renderRolesSection: function () {
        const roles = ConfigManager.getRoles();
        
        let html = `
            <div class="config-new-role">
                <input type="text" id="new-role-input" class="config-input" placeholder="Nombre del nuevo rol...">
                <button class="btn btn-primary" onclick="Config.createNewRole()">+ Crear Rol</button>
            </div>
            <div class="roles-list">`;

        for (const [roleName] of Object.entries(roles)) {
            html += this.renderRoleCard(roleName);
        }
        
        html += '</div>';
        return html;
    },

    renderRoleCard: function (roleName) {
        const roleCondition = ConfigManager.getRoleCondition(roleName);
        const keywords     = roleCondition ? (roleCondition.keywords    || []) : [];
        const conditionals = roleCondition ? (roleCondition.conditionals || []) : [];
        const notContains  = roleCondition ? (roleCondition.notContains  || []) : [];

        const kwChips = keywords.map((kw, idx) => `
            <div class="keyword-chip">
                <span class="chip-text">${kw}</span>
                <span class="chip-remove" onclick="Config.removeCondKeywordByIndex('${roleName}',${idx})">×</span>
            </div>`).join('');

        const condChips = conditionals.map((c, idx) => `
            <div class="keyword-chip conditional-chip">
                <span class="chip-text">${c}</span>
                <span class="chip-remove" onclick="Config.removeConditionalByIndex('${roleName}',${idx})">×</span>
            </div>`).join('');

        const notChips = notContains.map((nc, idx) => `
            <div class="keyword-chip conditional-chip">
                <span class="chip-text">${nc}</span>
                <span class="chip-remove" onclick="Config.removeNotContainsByIndex('${roleName}',${idx})">×</span>
            </div>`).join('');

        return `
            <div class="role-card role-panel" data-role="${roleName}" id="role-anchor-${roleName}">
                <div class="role-card-header role-panel-header" onclick="Config.toggleRolePanel('${roleName}')">
                    <span class="role-panel-arrow">▶</span>
                    <span class="role-panel-name" id="rpn-${roleName}">${roleName}</span>
                    <input type="text" class="role-name-input" id="rni-${roleName}" value="${roleName}"
                        data-original="${roleName}"
                        style="display:none;max-width:140px;"
                        onblur="Config.renameRole(this)"
                        onkeydown="if(event.key==='Enter')this.blur()"
                        onclick="event.stopPropagation()">
                    <button title="Renombrar" onclick="event.stopPropagation();Config.focusRenameInput('${roleName}')"
                        style="background:none;border:none;cursor:pointer;font-size:0.85rem;opacity:0.7;padding:0 2px;">✏️</button>
                    <button class="btn-duplicate-role" onclick="event.stopPropagation();Config.duplicateRole('${roleName}')" title="Duplicar rol" style="background:none;border:none;cursor:pointer;font-size:1rem;margin-right:4px;">⧉</button>
                    <button class="btn-delete-role" onclick="event.stopPropagation();Config.deleteRole('${roleName}')" title="Eliminar rol">🗑️</button>
                </div>
                <div class="role-card-body" style="display:none;">

                    <label class="config-label">
                        Keyword
                        <small style="font-weight:normal;color:rgba(241,241,241,0.55);">
                            — sin condicional actúa sola; con condicional ambas deben cumplirse
                        </small>
                    </label>
                    <div class="keywords-container">
                        ${kwChips || '<span class="empty-chips">Sin keywords asignadas</span>'}
                    </div>
                    <div class="add-keyword-container">
                        <input type="text" class="keyword-input" placeholder="Nueva keyword..."
                            data-role="${roleName}"
                            onkeydown="if(event.key==='Enter')Config.addCondKeywordFromInput(this)">
                        <button class="btn btn-sm" onclick="Config.addCondKeywordFromInput(this.previousElementSibling)">+ Agregar</button>
                    </div>

                    <label class="config-label conditional-label">
                        Condicional
                        <small style="font-weight:normal;">— opcional, DEBE estar presente junto a la keyword</small>
                    </label>
                    <div class="keywords-container">
                        ${condChips || '<span class="empty-chips">Sin condicionales (rol simple)</span>'}
                    </div>
                    <div class="add-keyword-container">
                        <input type="text" class="keyword-input conditional-input"
                            placeholder="Nueva condicional..."
                            data-role="${roleName}"
                            onkeydown="if(event.key==='Enter')Config.addConditionalFromInput(this)">
                        <button class="btn btn-sm btn-danger" onclick="Config.addConditionalFromInput(this.previousElementSibling)">+ Agregar</button>
                    </div>

                    <label class="config-label conditional-label">
                        NO contiene
                        <small style="font-weight:normal;">— si ALGUNA está en el efecto, el rol NO se asigna</small>
                    </label>
                    <div class="keywords-container">
                        ${notChips || '<span class="empty-chips">Sin restricciones (ninguna exclusión)</span>'}
                    </div>
                    <div class="add-keyword-container">
                        <input type="text" class="keyword-input conditional-input"
                            placeholder="Nueva exclusión..."
                            data-role="${roleName}"
                            onkeydown="if(event.key==='Enter')Config.addNotContainsFromInput(this)">
                        <button class="btn btn-sm btn-danger" onclick="Config.addNotContainsFromInput(this.previousElementSibling)">+ Agregar</button>
                    </div>

                    <div class="role-nom-filter-row">
                        <label class="config-label" style="margin-bottom:4px;">
                            Restringir detección a Nomenclatura
                            <small style="font-weight:normal;color:rgba(241,241,241,0.45);">
                                — busca keywords solo en esas oraciones del efecto (vacío = todo el efecto)
                            </small>
                        </label>
                        <div class="keywords-container">
                            ${(() => {
                                const selected = ConfigManager.getRoleNomenclatureCategories(roleName);
                                const cats = ConfigManager.getNomenclature().categories || [];
                                if (selected.length === 0) return '<span class="empty-chips">Sin restricción (todo el efecto)</span>';
                                return selected.map(catId => {
                                    const cat = cats.find(c => c.id === catId);
                                    const label = cat ? cat.name : catId;
                                    const borderColor = cat?.color || '#888';
                                    return `<div class="keyword-chip" style="border-color:\${borderColor}">
                                        <span class="chip-text">${label}</span>
                                        <span class="chip-remove" onclick="Config.removeRoleNomCat('${roleName}','${catId}')">×</span>
                                    </div>`;
                                }).join('');
                            })()}
                        </div>
                        <div class="add-keyword-container">
                            <select class="role-nom-select" id="nom-cat-select-${roleName}">
                                ${Config.renderNomCategoryOptionsAdd(roleName)}
                            </select>
                            <button class="btn btn-sm" onclick="Config.addRoleNomCat('${roleName}')">+ Agregar</button>
                        </div>
                    </div>
                    <div class="role-weight-row">
                        <label class="role-weight-label" title="1.0 = genérico (máximo aporte) · 0.1 = arquetípico (aporte reducido)">
                            Peso del rol
                            <span class="role-weight-display" id="rw-${roleName}">${ConfigManager.getRoleWeight(roleName).toFixed(1)}</span>
                        </label>
                        <input type="range" class="role-weight-input"
                            min="0.1" max="1.0" step="0.1"
                            value="${ConfigManager.getRoleWeight(roleName)}"
                            oninput="document.getElementById('rw-${roleName}').textContent=parseFloat(this.value).toFixed(1)"
                            onchange="ConfigManager.setRoleWeight('${roleName}', parseFloat(this.value))">
                    </div>
                </div>
            </div>`;
    },
    removeCondKeywordByIndex: function (roleName, index) {
        const cond = ConfigManager.getRoleCondition(roleName);
        if (!cond?.keywords) return;
        const kw = cond.keywords[index];
        if (kw !== undefined) {
            ConfigManager.removeKeywordFromRoleCondition(roleName, kw);
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        }
    },

    removeConditionalByIndex: function (roleName, index) {
        const cond = ConfigManager.getRoleCondition(roleName);
        if (!cond?.conditionals) return;
        const c = cond.conditionals[index];
        if (c !== undefined) {
            ConfigManager.removeConditionalFromRole(roleName, c);
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        }
    },

    // ===============================
    renderSpecialtiesSection: function() {
    const pairs = ConfigManager.getSpecialties();
    const roles = ConfigManager.getRoleNames();
    const roleOpts = (selected) => ['', ...roles].map(r =>
        `<option value="${r}" ${r === (selected||'') ? 'selected' : ''}>${r || '-- Sin rol --'}</option>`
    ).join('');

    let html = `
        <div class="config-help-text">
            <p><strong>Counters:</strong> Conecta roles entre sí. El sistema detectará automáticamente qué cartas ejecutan cada mecánica y cuáles la contrarrestan según los roles asignados.</p>
            <small>Ejemplo: <em>Searcher ⟷ Handtrap</em> — cualquier carta con rol Handtrap countera a cualquier carta con rol Searcher.</small>
        </div>
        <div style="margin-bottom:var(--spacing-md);">
            <button class="btn btn-primary" onclick="Config.createSpecialtyPair()">➕ Nuevo Par</button>
        </div>
        <div class="specialty-pairs-list">`;

    if (pairs.length === 0) {
        html += '<p class="empty-chips" style="padding:var(--spacing-md);">No hay pares configurados</p>';
    }

    pairs.forEach(pair => {
        html += `
            <div class="specialty-pair-row" id="spec-anchor-${pair.id}" style="position:relative;">
                <div class="specialty-half spec-side">
                    <div class="specialty-half-header">
                        <span class="spec-badge">Mecánica</span>
                    </div>
                    <select class="keyword-input" id="mech-role-${pair.id}"
                        onchange="ConfigManager.updateSpecialtyPair('${pair.id}', this.value, document.getElementById('ctr-role-${pair.id}').value)">
                        ${roleOpts(pair.mechanicRole)}
                    </select>
                </div>
                <div class="specialty-connector">⟷</div>
                <div class="specialty-half counter-side">
                    <div class="specialty-half-header">
                        <span class="counter-badge">Counter</span>
                    </div>
                    <select class="keyword-input" id="ctr-role-${pair.id}"
                        onchange="ConfigManager.updateSpecialtyPair('${pair.id}', document.getElementById('mech-role-${pair.id}').value, this.value)">
                        ${roleOpts(pair.counterRole)}
                    </select>
                </div>
                <button class="btn-delete-role" onclick="Config.deleteSpecialtyPair('${pair.id}')"
                    style="position:absolute;top:8px;right:8px;" title="Eliminar par">🗑️</button>
            </div>`;
    });

    html += '</div>';
    return html;
},

    // ===============================
    renderStaplesSection: function () {
        const staples  = ConfigManager.getStaples();
        const entries  = Object.entries(staples);

        let html = `
            <div class="config-help-text">
                <p><strong>Staples:</strong> Cartas genéricas usadas en múltiples decks. Solo ingresa el ID — los datos se obtienen automáticamente.</p>
                <small>Haz click en cualquier imagen para ver los detalles de la carta.</small>
            </div>
            <div class="config-new-role">
                <input type="text" id="new-staple-id" class="config-input" placeholder="ID de la carta (ej: 83764718)">
                <button class="btn btn-primary" onclick="Config.createNewStaple()">+ Agregar</button>
            </div>
            <div class="staples-grid">`;

        if (entries.length === 0) {
            html += '<p class="empty-chips" style="grid-column:1/-1;padding:var(--spacing-md);">No hay staples configurados</p>';
        }
        
        entries.forEach(([id, data]) => {
            html += `
                <div class="staple-img-card" title="${data.name || id}">
                    <img src="${data.imageUrl}"
                         alt="${data.name || id}"
                         onclick="Config.openStapleCard('${id}')"
                         onerror="this.src='';this.style.background='#002b4d';this.style.minHeight='120px';">
                    <button class="staple-delete-btn" onclick="Config.deleteStaple('${id}')" title="Eliminar">✕</button>
                    <div class="staple-img-name">${data.name || id}</div>
                </div>`;
        });

        html += '</div>';
        return html;
    },

    // ===============================
    renderNomenclatureSection: function () {
        const nomenclature = ConfigManager.getNomenclature();

        let html = `
            <div class="config-help-text">
                <p><strong>Nomenclatura de Efectos:</strong> Define cómo se detecta y colorea cada parte del efecto de una carta.</p>
                <small>Cada categoría tiene UNA configuración con 4 campos. Los campos vacíos no se verifican.</small>
            </div>
            <div class="config-help-text" style="margin-bottom:var(--spacing-md);padding:var(--spacing-sm);background:rgba(255,215,0,0.07);border-left:3px solid var(--gold-color);border-radius:4px;">
    <p style="margin:0 0 6px 0;"><strong>¿Qué es la Nomenclatura?</strong></p>
    <p style="margin:0;line-height:1.6;opacity:0.85;">
        El texto de cada carta YGO sigue una estructura fija: primero indica 
        <em>cuándo</em> se activa (Timing), luego <em>qué necesitas</em> (Requisito/Costo), 
        y finalmente <em>qué hace</em> (Efecto). Las nomenclaturas te permiten colorear 
        cada parte del texto para leerla más rápido.<br>
        <strong>Ejemplo:</strong> <em>"During your opponent's turn (Timing) · send 1 card from your hand (Costo): negate the activation (Efecto)"</em><br>
        Usa <code>contains</code> para detectar palabras clave dentro de una cláusula, 
        <code>startsWith</code> si siempre empieza igual, y <code>notContains</code> para excluir falsos positivos.
    </p>
</div>
            <button class="btn btn-primary" onclick="Config.addNomenclatureCategory()" 
                style="margin-bottom:var(--spacing-md);">➕ Nueva Categoría</button>
            <div class="roles-list">`;

        (nomenclature.categories || []).forEach(cat => {
            html += this.renderNomenclatureCategory(cat);
        });

        html += '</div>';
        return html;
    },
// ===============================

renderDiminishingSection: function() {
    const config = ConfigManager.getDiminishingReturns();
    const roles = Object.keys(ConfigManager.getRoles() || {});
    
    let html = `
        <div class="config-section">
            <h3>⚖️ Rendimientos Decrecientes</h3>
            <p class="config-help-text">
                Define cuántas cartas de cada rol aportan de manera óptima antes de 
                que su valor marginal disminuya. Esto no penaliza Mecánica, 
                solo refleja que carta #1 vale más que carta #20.
            </p>
            
            <label class="config-checkbox">
                <input type="checkbox" id="diminishing-enabled" 
                    ${config.enabled ? 'checked' : ''} 
                    onchange="Config.toggleDiminishing()">
                Activar sistema de rendimientos decrecientes
            </label>
            
            <div id="diminishing-roles-config" style="${config.enabled ? '' : 'display:none'}">
    `;
    
    roles.forEach(role => {
    const threshold = config.roleThresholds[role] || { optimal: 10, max: 15, curve: 0.5, crossPenalty: false };
    html += `
        <div class="diminishing-role-card">
            <h4>${role}</h4>
            <div class="diminishing-inputs">
                <label>
                    Cantidad óptima: 
                    <input type="number" min="1" max="40" value="${threshold.optimal}" 
                        id="dim-optimal-${role}">
                </label>
                <label>
                    Umbral máximo: 
                    <input type="number" min="1" max="40" value="${threshold.max}" 
                        id="dim-max-${role}">
                </label>
                <label>
                    Severidad curva (0.1-1.0): 
                    <input type="number" min="0.1" max="1" step="0.1" value="${threshold.curve}" 
                        id="dim-curve-${role}">
                </label>
                <label class="config-checkbox" style="grid-column: 1 / -1;">
                    <input type="checkbox" id="dim-cross-${role}" 
                        ${threshold.crossPenalty ? 'checked' : ''}>
                    ⚠️ Exceso reduce otros pilares (penalización cruzada)
                </label>
                <button class="btn btn-success" onclick="Config.saveDiminishingRole('${role}')">
                    Guardar
                </button>
            </div>
        </div>
    `;
});
    
    html += `
            </div>
        </div>
    `;
    
    return html;
},

toggleDiminishing: function() {
    const enabled = document.getElementById('diminishing-enabled').checked;
    const config = ConfigManager.getDiminishingReturns();
    config.enabled = enabled;
    ConfigManager.saveDiminishingReturns(config);
    
    document.getElementById('diminishing-roles-config').style.display = 
        enabled ? '' : 'none';
},

saveDiminishingRole: function(role) {
    const optimal = parseFloat(document.getElementById(`dim-optimal-${role}`).value);
    const max = parseFloat(document.getElementById(`dim-max-${role}`).value);
    const curve = parseFloat(document.getElementById(`dim-curve-${role}`).value);
    const crossPenalty = document.getElementById(`dim-cross-${role}`).checked;
    
    ConfigManager.updateRoleThreshold(role, { optimal, max, curve, crossPenalty });
    alert(`✓ Configuración de ${role} guardada`);
},
   renderNomenclatureCategory: function (cat) {
        const cond = cat.conditions || {};

        const toArr = (v) => Array.isArray(v) ? v : (v ? [v] : []);
        const startsArr    = toArr(cond.startsWith);
        const containsArr  = toArr(cond.contains);
        const notContArr   = toArr(cond.notContains);
        const endsArr      = toArr(cond.endsWith);

        const makeChips = (arr, field, chipClass = '') => arr.map((kw, idx) => `
            <div class="keyword-chip ${chipClass}">
                <span class="chip-text">${kw}</span>
                <span class="chip-remove"
                    onclick="Config.removeNomCondKwByIndex('${cat.id}','${field}',${idx})">×</span>
            </div>`).join('');

        return `
        <div class="role-card role-panel" id="nom-anchor-${cat.id}">
            <div class="role-card-header role-panel-header" onclick="Config.toggleNomPanel('${cat.id}')">
                <span class="role-panel-arrow">▶</span>
                <span class="role-panel-name" id="npn-${cat.id}" style="background:${cat.color}33;color:${cat.color};padding:1px 8px;border-radius:4px;font-size:0.85rem;">${cat.name}</span>
                <input type="text" class="role-name-input" id="nni-${cat.id}" value="${cat.name}"
                    style="display:none;max-width:140px;"
                    onclick="event.stopPropagation()"
                    onblur="Config.renameNomCategory('${cat.id}',this)"
                    onkeydown="if(event.key==='Enter')this.blur()">
                <input type="color" value="${cat.color}" title="Color de la categoría"
                    style="width:26px;height:26px;min-width:26px;border:2px solid var(--border-color);border-radius:6px;cursor:pointer;padding:2px;background:transparent;appearance:none;-webkit-appearance:none;margin-left:6px;"
                    onclick="event.stopPropagation()"
                    onchange="ConfigManager.updateNomenclatureCategory('${cat.id}',{color:this.value});Config.render();Config._restoreAndScroll('nomenclature-section','nom-anchor-${cat.id}')">
                <button title="Renombrar" onclick="event.stopPropagation();Config.focusNomRenameInput('${cat.id}')"
                    style="background:none;border:none;cursor:pointer;font-size:0.85rem;opacity:0.7;padding:0 2px;">✏️</button>
                <button title="Duplicar" onclick="event.stopPropagation();Config.duplicateNomCategory('${cat.id}')"
                    style="background:none;border:none;cursor:pointer;font-size:1rem;opacity:0.7;padding:0 2px;margin-right:2px;">⧉</button>
                <button class="btn-delete-role" style="margin-left:2px;"
                    onclick="event.stopPropagation();Config.deleteNomCategory('${cat.id}')">🗑️</button>
            </div>
            <div class="role-card-body" style="display:none;gap:12px;">

                <label class="config-label">
                    Empieza con:
                    <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— AL MENOS UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(startsArr, 'startsWith') || '<span class="empty-chips">Sin restricción de inicio</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-starts-${cat.id}" placeholder="Agregar inicio...">
                    <button class="btn btn-sm"
                        onclick="Config.addNomCondKw('${cat.id}','startsWith',document.getElementById('nom-starts-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label">
                    Contiene:
                    <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— AL MENOS UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(containsArr, 'contains') || '<span class="empty-chips">Sin keywords (cualquier texto)</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-contains-${cat.id}" placeholder="Agregar opción...">
                    <button class="btn btn-sm"
                        onclick="Config.addNomCondKw('${cat.id}','contains',document.getElementById('nom-contains-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label conditional-label">
                    NO contiene:
                    <small style="font-weight:normal;">— NINGUNA debe estar presente</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(notContArr, 'notContains', 'conditional-chip') || '<span class="empty-chips">Sin restricciones</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input conditional-input" id="nom-notcontains-${cat.id}" placeholder="Agregar exclusión...">
                    <button class="btn btn-sm btn-danger"
                        onclick="Config.addNomCondKw('${cat.id}','notContains',document.getElementById('nom-notcontains-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label">
                    Termina en:
                    <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— AL MENOS UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(endsArr, 'endsWith') || '<span class="empty-chips">Sin restricción de cierre</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-ends-${cat.id}" placeholder="Agregar cierre...">
                    <button class="btn btn-sm"
                        onclick="Config.addNomCondKw('${cat.id}','endsWith',document.getElementById('nom-ends-${cat.id}'))">+ Agregar</button>
                </div>

                <div class="config-help-text" style="margin-top:8px;">
                    <small><strong>Cómo funciona:</strong> Un segmento se detecta si empieza con AL MENOS UNA de "Empieza con", contiene AL MENOS UNA de "Contiene", NO contiene NINGUNA de "NO contiene", y termina con AL MENOS UNA de "Termina en". Los campos vacíos no se verifican.</small>
                </div>
            </div>
        </div>`;
    },
renderNomCategoryOptions: function (selectedId) {
        const cats = (ConfigManager.getNomenclature().categories || []);
        const none = `<option value="—" ${!selectedId ? 'selected' : ''}>— Todo el efecto (sin filtro)</option>`;
        const opts = cats.map(cat =>
            `<option value="${cat.id}" ${selectedId === cat.id ? 'selected' : ''}>
                ${cat.name}
            </option>`
        ).join('');
        return none + opts;
    },
    // ===============================
    createNewRole: function () {
        const input = document.getElementById('new-role-input');
        const name  = input.value.trim();
        if (!name) { alert('⚠️ Escribe un nombre para el rol'); return; }
        if (ConfigManager.createRole(name)) { 
            input.value = ''; 
            this.render(); 
        } else {
            alert('❌ No se pudo crear el rol (puede que ya exista)');
        }
    },

    focusRenameInput: function (roleName) {
        const span  = document.getElementById(`rpn-${roleName}`);
        const input = document.getElementById(`rni-${roleName}`);
        if (!input) return;
        if (span) span.style.display = 'none';
        input.style.display = 'inline-block';
        input.focus();
        input.select();
    },

    renameRole: function (el) {
        const oldName = el.dataset.original;
        const newName = el.value.trim();
        // Restore display regardless of outcome
        el.style.display = 'none';
        const span = document.getElementById(`rpn-${oldName}`);
        if (span) span.style.display = '';
        if (newName === oldName) return;
        if (!newName) {
            alert('⚠️ El nombre no puede estar vacío');
            el.value = oldName;
            return;
        }
        if (ConfigManager.renameRole(oldName, newName)) {
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${CSS.escape(newName)}`);
        } else {
            alert('❌ No se pudo renombrar');
            el.value = oldName;
        }
    },

    deleteRole: function (roleName) {
        if (!confirm(`¿Eliminar el rol "${roleName}"?`)) return;
        if (ConfigManager.deleteRole(roleName)) {
            this.render();
        } else {
            alert('❌ No se pudo eliminar el rol');
        }
    },

    addCondKeywordFromInput: function (el) {
        const roleName = el.dataset.role;
        const kw       = el.value.trim().toLowerCase();
        if (!kw) { alert('⚠️ Escribe una keyword'); return; }
        if (ConfigManager.addKeywordToRoleCondition(roleName, kw)) {
            el.value = '';
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        } else {
            alert('❌ No se pudo agregar (puede que ya exista)');
        }
    },

    removeCondKeyword: function (roleName, keyword) {
        if (ConfigManager.removeKeywordFromRoleCondition(roleName, keyword)) {
            this.render();
        }
    },

    addConditionalFromInput: function (el) {
        const roleName = el.dataset.role;
        const val      = el.value.trim().toLowerCase();
        if (!val) { alert('⚠️ Escribe una condicional'); return; }
        if (ConfigManager.addConditionalToRole(roleName, val)) {
            el.value = '';
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        } else {
            alert('❌ No se pudo agregar (puede que ya exista)');
        }
    },

    removeConditional: function (roleName, conditional) {
        if (ConfigManager.removeConditionalFromRole(roleName, conditional)) {
            this.render();
        }
    },

    addNotContainsFromInput: function (el) {
        const roleName = el.dataset.role;
        const val      = el.value.trim().toLowerCase();
        if (!val) { alert('⚠️ Escribe una exclusión'); return; }
        if (ConfigManager.addNotContainsToRole(roleName, val)) {
            el.value = '';
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        } else {
            alert('❌ No se pudo agregar (puede que ya exista)');
        }
    },

    removeNotContainsByIndex: function (roleName, index) {
        if (ConfigManager.removeNotContainsFromRole(roleName, index)) {
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        }
    },

    toggleRolePanel: function (roleName) {
        const card = document.getElementById(`role-anchor-${roleName}`);
        if (!card) return;
        const body  = card.querySelector('.role-card-body');
        const arrow = card.querySelector('.role-panel-arrow');
        if (!body) return;
        const isOpen = body.style.display !== 'none';
        body.style.display = isOpen ? 'none' : 'flex';
        if (arrow) arrow.textContent = isOpen ? '▶' : '▼';
    },

    toggleNomPanel: function (catId) {
        const card = document.getElementById(`nom-anchor-${catId}`);
        if (!card) return;
        const body  = card.querySelector('.role-card-body');
        const arrow = card.querySelector('.role-panel-arrow');
        if (!body) return;
        const isOpen = body.style.display !== 'none';
        body.style.display = isOpen ? 'none' : 'flex';
        if (arrow) arrow.textContent = isOpen ? '▶' : '▼';
    },
    focusNomRenameInput: function (catId) {
        const span  = document.getElementById(`npn-${catId}`);
        const input = document.getElementById(`nni-${catId}`);
        if (!input) return;
        if (span)  span.style.display  = 'none';
        input.style.display = 'inline-block';
        input.focus();
        input.select();
    },

    renameNomCategory: function (catId, el) {
        const newName = el.value.trim();
        el.style.display = 'none';
        const span = document.getElementById(`npn-${catId}`);
        if (span) span.style.display = '';
        if (!newName) return;
        if (window.ConfigManager) {
            ConfigManager.updateNomenclatureCategory(catId, { name: newName });
            this.render();
            this._restoreAndScroll('nomenclature-section', `nom-anchor-${catId}`);
        }
    },

    duplicateNomCategory: function (catId) {
        const newId = window.ConfigManager?.duplicateNomenclatureCategory?.(catId);
        if (!newId) return;
        this.render();
        this._restoreAndScroll('nomenclature-section', `nom-anchor-${newId}`);
    },


    // ===============================
    createSpecialtyPair: function() {
    const id = ConfigManager.createSpecialtyPair('', '');
    this.render();
    this._restoreAndScroll('specialties-section', `spec-anchor-${id}`);
},

    deleteSpecialtyPair: function (id) {
        if (!confirm('¿Eliminar este par?')) return;
        if (ConfigManager.deleteSpecialtyPair(id)) {
            this.render();
        }
    },

    addSpecKw: function (id, side, el) {
        const kw = el.value.trim().toLowerCase();
        if (!kw) return;
        if (ConfigManager.addKeywordToSpecialtyPair(id, side, kw)) { 
            el.value = ''; 
            this.render(); 
        } else {
            alert('❌ Keyword ya existe');
        }
    },

    removeSpecKw: function (id, side, keyword) {
        if (ConfigManager.removeKeywordFromSpecialtyPair(id, side, keyword)) {
            this.render();
        }
    },

    createNewStaple: async function () {
        const input  = document.getElementById('new-staple-id');
        const cardId = input.value.trim();
        if (!cardId) { alert('⚠️ Ingresa un ID de carta'); return; }
        if (ConfigManager.isStaple(cardId)) { 
            alert('⚠️ Esta carta ya está en la lista'); 
            return; 
        }

        const btn = input.nextElementSibling;
        const originalText = btn.textContent;
        btn.textContent = '⏳';
        btn.disabled = true;

        try {
            const resp = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}`);
            if (!resp.ok) throw new Error('not found');
            const data = await resp.json();
            if (!data.data || data.data.length === 0) { 
                alert('❌ Carta no encontrada'); 
                return; 
            }
            const card = data.data[0];
            ConfigManager.createStaple(String(card.id), {
                name:     card.name,
                imageUrl: card.card_images[0]?.image_url_small || `https://images.ygoprodeck.com/images/cards_small/${card.id}.jpg`,
                type:     card.type
            });
            input.value = '';
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
            console.log(`✅ Carta agregada: ${card.name} (ID: ${card.id})`);
        } catch (e) {
            
            console.error('❌ No se encontró la carta. Verifica el ID.' + card.name);
            
        } finally {
            btn.textContent = originalText;
            btn.disabled    = false;
        }
    },

    deleteStaple: function (cardId) {
        if (!confirm('¿Eliminar este staple?')) return;
        if (ConfigManager.deleteStaple(cardId)) {
            this.render();
        }
    },

    openStapleCard: async function (cardId) {
        try {
            const resp = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}`);
            const data = await resp.json();
            if (data.data && data.data[0]) {
                if (window.CardViewer && typeof CardViewer.open === 'function') {
                    CardViewer.open(data.data[0]);
                } else if (window.Buscador && typeof Buscador.openCardModal === 'function') {
                    Buscador.openCardModal(data.data[0]);
                }
            }
        } catch (e) { 
            console.error('Error abriendo staple:', e); 
        }
    },

    // ===============================
    addNomenclatureCategory: function() {
    ConfigManager.addNomenclatureCategory();
    this.render();
    this._restoreAndScroll('nomenclature-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('nomenclature-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
},

    deleteNomCategory: function (categoryId) {
        if (!confirm('¿Eliminar esta categoría?')) return;
        if (ConfigManager.deleteNomenclatureCategory(categoryId)) {
            this.render();
        }
    },

    // ===============================
    resetToDefault: function () {
        if (!confirm(
            '🔄 RESTAURAR DE FÁBRICA\n\n' +
            'Esto borrará TODA la data actual:\n' +
            '• Decks guardados, engines, matchups, winrates\n' +
            '• Meta (decks, librería, scores)\n' +
            '• Configuración completa (roles, G1/G2, scoring, pilares)\n' +
            '• Favoritas, apuntes, torneo, banlist\n\n' +
            'La app se reiniciará con los valores y datos de fábrica.\n\n' +
            '⚠️ Esta acción NO se puede deshacer. Si quieres conservar tu progreso, cancela y usa "Exportar Data" primero.'
        )) return;
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k) allKeys.push(k);
        }
        allKeys.forEach(k => localStorage.removeItem(k));
        if (window.ConfigManager) ConfigManager.resetToDefault();
        this._resetModulesInMemory();
        this.render();
        alert('✅ App restaurada a valores de fábrica.');
    },
abrirReportarError: function () {
    if (document.getElementById('error-report-overlay')) return;
    const counter = parseInt(localStorage.getItem('dd_report_counter') || '0') + 1;
    const now     = new Date();
    const dateStr = now.toLocaleString('es-DO');
    const overlay = document.createElement('div');
    overlay.id        = 'error-report-overlay';
    overlay.className = 'error-report-overlay';
    overlay.innerHTML = `
        <div class="error-report-panel">
            <div class="error-report-header">
                <span>📧 Reportar Error <span class="error-report-num">#${counter}</span></span>
                <button class="error-report-close" onclick="Config.cerrarReportarError()">×</button>
            </div>
            <p class="error-report-hint">
                Se adjuntará el Log del sistema y tu configuración actual en el cuerpo del correo.
            </p>
            <textarea id="error-report-msg" class="error-report-textarea"
                placeholder="Diga que cosas considera no funcionan como deberia. Puede escribir cosas de gustos en un parrafo distinto"
                rows="6"></textarea>
            <div class="error-report-footer">
                <span class="error-report-date">🕐 ${dateStr}</span>
                <button class="btn btn-primary error-report-send-btn"
                        id="error-report-send"
                        onclick="Config.enviarReporte(${counter}, '${dateStr.replace(/'/g, "\\'")}')">
                    📤 Enviar Reporte
                </button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => document.getElementById('error-report-msg')?.focus(), 100);
},

cerrarReportarError: function () {
    document.getElementById('error-report-overlay')?.remove();
},

enviarReporte: function (counter, dateStr) {
    const msg = (document.getElementById('error-report-msg')?.value || '').trim();
    if (!msg) { alert('Escribe un mensaje antes de enviar.'); return; }

    let loggerTxt = 'Logger no disponible en esta sesión.';
    if (window.DDLogger) {
        const logs  = DDLogger.getLogs();
        const stats = DDLogger.getStats();
        const L = [];
        L.push('================================================================');
        L.push('  DESTINY DRAW — LOG REPORT');
        L.push('================================================================');
        L.push(`  Reporte #${counter} | ${dateStr}`);
        L.push(`  Entradas: ${logs.length} | Errores: ${logs.filter(e=>!e.ok).length} | Lentas: ${logs.filter(e=>e.slow).length}`);
        L.push('');
        L.push('--- ESTADÍSTICAS POR MÉTODO ---');
        Object.entries(stats).sort((a,b)=>b[1].calls-a[1].calls).forEach(([k,s])=>{
            const avg = s.calls>0?(s.totalMs/s.calls).toFixed(1):'0.0';
            L.push(`  ${k.padEnd(45)} calls:${s.calls}  avg:${avg}ms  errors:${s.errors}`);
        });
        const errors = logs.filter(e=>!e.ok);
        if (errors.length) {
            L.push(''); L.push('--- ERRORES ---');
            errors.forEach(e=>{
                L.push(`  [#${e.seq}] ${e.ts} | ${e.label}`);
                L.push(`  Msg: ${e.error}`);
                if (e.stack) L.push(`  Stack: ${e.stack.split('\n').slice(0,3).join(' | ')}`);
            });
        }
        L.push(''); L.push('--- LOG COMPLETO ---');
        logs.forEach(e=>{
            const flag=!e.ok?'[ERR]':e.slow?'[SLW]':'[OK] ';
            L.push(`[${e.seq}] ${e.ts} ${flag} ${e.label}(${(e.args||'').slice(0,80)}) ${e.ms}ms`);
        });
        loggerTxt = L.join('\n');
    }

    let configTxt = 'Config no disponible.';
    try {
        const claves = [
            'yugioh_config','yugioh_player_level','dd_player_profile',
            'dd_content_visibility','yugioh_favoritas','yugioh_engines',
            'yugioh_music_config','yugioh_meta_decks','yugioh_meta_fallbacks',
            'yugioh_formacion_notes','yugioh_formacion_mastered','yugioh_formacion_fallbacks',
        ];
        const exportObj = { exportDate: dateStr, reportNumber: counter };
        claves.forEach(k=>{ const v=localStorage.getItem(k); if(v){ try{ exportObj[k]=JSON.parse(v); }catch(_){ exportObj[k]=v; } } });
        exportObj._matchups={};
        for(let i=0;i<localStorage.length;i++){
            const k=localStorage.key(i);
            if(k?.startsWith('matchup_')){ try{ exportObj._matchups[k]=JSON.parse(localStorage.getItem(k)); }catch(_){} }
        }
        configTxt = JSON.stringify(exportObj, null, 2);
    } catch(e){ configTxt='Error al generar config: '+e.message; }

    const stamp = dateStr.replace(/[/:, ]/g,'-').slice(0,16);
    const _dl = (content, filename) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = filename;
        a.click(); URL.revokeObjectURL(url);
    };
    _dl(loggerTxt, `DD_Log_${stamp}.txt`);
    setTimeout(()=> _dl(configTxt, `DD_Config_${stamp}.txt`), 400);

    const subject  = encodeURIComponent(`REPORTE #${counter} ${dateStr}`);
    const body     = encodeURIComponent(
        `REPORTE #${counter} — ${dateStr}\n\n` +
        `MENSAJE:\n${msg}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📎 Adjunta los 2 archivos .txt que se descargaron automáticamente:\n` +
        `  • DD_Log_${stamp}.txt\n` +
        `  • DD_Config_${stamp}.txt`
    );
    setTimeout(()=> { window.location.href = `mailto:franq0524@gmail.com?subject=${subject}&body=${body}`; }, 800);

    localStorage.setItem('dd_report_counter', String(counter));
    this.cerrarReportarError();
    alert(`✅ Reporte #${counter}\n\nSe descargaron 2 archivos .txt automáticamente.\nSe abrirá tu cliente de correo — adjunta los archivos al correo.\nSi no tienes la confianza para aceptar el envio automático, puedes enviar los reportes directamente al creador de la APP.`);
},

// ═══════════════════════════════════════════════════════════
    // TEST DE DUELO — autoría de tests Teóricos y Prácticos
    // ═══════════════════════════════════════════════════════════

    _testRefresh: function () {
        const el = document.getElementById('test-duelo-section');
        if (el) el.innerHTML = this.renderTestDueloSection();
    },

    renderTestDueloSection: function () {
        if (!this._ta) this._taReset();
        if (!this._tt) this._ttReset();
        return `
            <p class="stats-empty" style="margin-bottom:14px;">
                Crea tests para practicar o enseñar a otro jugador. Se guardan en este dispositivo
                y aparecen en Formación → Test.
            </p>

            <div class="config-section-block">
                <div class="config-block-title">📖 Test Teórico</div>
                ${this._renderTeoricoAuthor()}
            </div>

            <div class="config-section-block">
                <div class="config-block-title">🎯 Test Práctico</div>
                ${this._renderPracticoAuthor()}
            </div>

            <div class="config-section-block">
                <div class="config-block-title">📥 Importar Test</div>
                <p class="stats-empty">Agrega un test .txt exportado por ti o por otro jugador.</p>
                <button class="btn btn-primary" onclick="document.getElementById('test-import-file').click()">📥 Agregar Test</button>
                <input type="file" id="test-import-file" accept=".txt" style="display:none;" onchange="Config._importTestFile(this)">
            </div>
        `;
    },

    _renderTestList: function (category) {
        const list = TestDuelo.getByCategory(category);
        if (!list.length) return `<p class="stats-empty" style="margin-top:12px;">Aún no hay tests ${category === 'practicos' ? 'prácticos' : 'teóricos'} guardados.</p>`;
        return `
            <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.1);padding-top:10px;">
                <p style="color:rgba(255,255,255,0.6);font-size:0.8rem;">Tests disponibles:</p>
                <select id="${category}-select-list" class="config-input">
                    ${list.map(t => `<option value="${t.id}">${t.label} (${t.level})</option>`).join('')}
                </select>
                <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                    <button class="btn btn-primary" onclick="TestDuelo.exportTest(document.getElementById('${category}-select-list').value, 'download')">⬇ Descargar Test</button>
                    <button class="btn btn-primary" onclick="TestDuelo.exportTest(document.getElementById('${category}-select-list').value, 'send')">📧 Enviar Test</button>
                    <button class="btn btn-danger" style="background:#c0392b;" onclick="Config._deleteTestFromList('${category}')">🗑️ Borrar</button>
                </div>
            </div>`;
    },

    _deleteTestFromList: function (category) {
        const sel = document.getElementById(`${category}-select-list`);
        if (!sel || !sel.value) { alert('Selecciona un test de la lista.'); return; }
        if (!confirm('¿Borrar este test guardado permanentemente?')) return;
        TestDuelo.remove(sel.value);
        this._testRefresh();
    },

    _importTestFile: function (inputEl) {
        const file = inputEl.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const test = TestDuelo.importFromText(e.target.result);
            if (test) {
                this._testRefresh();
                alert(`✅ Test "${test.label}" agregado. Disponible en Formación → Test → ${test.category === 'practicos' ? 'Prácticos' : 'Teóricos'}.`);
            }
        };
        reader.readAsText(file);
        inputEl.value = '';
    },

    // ── Teórico ──────────────────────────────────────────────────

    _ttReset: function () {
        this._tt  = { label: '', level: 'Avanzado', desc: '', questions: [] };
        this._ttQ = { qText: '', card: null, options: [{ text: '', card: null }, { text: '', card: null }], correct: 0, explain: '' };
    },

    _ttSync: function () {
        const q = this._ttQ, t = this._tt;
        q.qText   = document.getElementById('tt-q-input')?.value ?? q.qText;
        q.explain = document.getElementById('tt-explain')?.value ?? q.explain;
        q.options.forEach((op, i) => { const el = document.getElementById(`tt-opt-${i}`); if (el) op.text = el.value; });
        t.label = document.getElementById('tt-label')?.value ?? t.label;
        t.level = document.getElementById('tt-level')?.value ?? t.level;
        t.desc  = document.getElementById('tt-desc')?.value ?? t.desc;
    },

    _renderTeoricoAuthor: function () {
        const tq = this._ttQ, t = this._tt;
        const levels = ['Básico', 'Intermedio', 'Avanzado', 'Competitivo'];
        const cardChip = (c, onRemove) => c ? `
            <span class="keyword-chip" style="display:inline-flex;align-items:center;gap:6px;">
                <img src="https://images.ygoprodeck.com/images/cards_small/${c.id}.jpg" style="width:22px;border-radius:3px;">
                <span class="chip-text">${c.name}</span>
                <span class="chip-remove" onclick="${onRemove}">×</span>
            </span>` : '';

        return `
            <div class="config-new-role" style="flex-direction:column;align-items:stretch;gap:8px;">
                <input type="text" id="tt-label" class="config-input" placeholder="Nombre del test..." value="${t.label || ''}">
                <select id="tt-level" class="config-input">
                    ${levels.map(l => `<option value="${l}" ${t.level === l ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
                <textarea id="tt-desc" class="config-input" placeholder="Descripción del test (opcional)..." rows="2">${t.desc || ''}</textarea>
            </div>

            <div style="margin-top:12px;padding:10px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;">
                <p style="margin:0 0 6px;color:#FFD700;font-size:0.85rem;">Nueva pregunta</p>
                <textarea id="tt-q-input" class="config-input" placeholder="Escribe la pregunta..." rows="2">${tq.qText || ''}</textarea>
                <div style="margin:6px 0;">
                    ${tq.card ? cardChip(tq.card, `Config._ttRemoveQCard()`)
                              : `<button class="btn btn-secondary" onclick="Config._ttPickQCard()">🔍 Adjuntar carta a la pregunta</button>`}
                </div>
                <p style="margin:8px 0 4px;color:rgba(255,255,255,0.6);font-size:0.8rem;">Opciones (marca la correcta):</p>
                ${tq.options.map((op, i) => `
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                        <input type="radio" name="tt-correct" ${tq.correct === i ? 'checked' : ''} onchange="Config._ttSetCorrect(${i})">
                        <input type="text" id="tt-opt-${i}" class="config-input" style="flex:1;" placeholder="Texto de la opción..." value="${op.text || ''}">
                        ${op.card ? cardChip(op.card, `Config._ttRemoveOptCard(${i})`)
                                  : `<button class="btn btn-secondary" onclick="Config._ttPickOptCard(${i})">🔍</button>`}
                        ${tq.options.length > 2 ? `<span class="chip-remove" onclick="Config._ttRemoveOption(${i})">×</span>` : ''}
                    </div>`).join('')}
                <button class="btn btn-secondary" onclick="Config._ttAddOption()" ${tq.options.length >= 6 ? 'disabled' : ''}>➕ Agregar Opción</button>
                <textarea id="tt-explain" class="config-input" placeholder="Explicación (se muestra al corregir)..." rows="2" style="margin-top:8px;">${tq.explain || ''}</textarea>
                <div style="margin-top:8px;">
                    <button class="btn btn-primary" onclick="Config._ttAddQuestion()">➕ Agregar Pregunta al Test</button>
                </div>
            </div>

            ${t.questions.length ? `
                <div style="margin-top:10px;">
                    <p style="color:rgba(255,255,255,0.6);font-size:0.8rem;">Preguntas en este test (${t.questions.length}):</p>
                    ${t.questions.map((q, i) => `
                        <div class="keyword-chip" style="display:flex;justify-content:space-between;margin-bottom:4px;">
                            <span class="chip-text">${i + 1}. ${(q.q || '').slice(0, 60)}</span>
                            <span class="chip-remove" onclick="Config._ttRemoveQuestion(${i})">×</span>
                        </div>`).join('')}
                </div>` : ''}

            <div style="margin-top:10px;">
                <button class="btn btn-success" onclick="Config._ttSaveTest()">💾 Guardar Test Teórico</button>
            </div>

            ${this._renderTestList('teoricos')}
        `;
    },

    _ttAddOption: function () {
        this._ttSync();
        if (this._ttQ.options.length >= 6) return;
        this._ttQ.options.push({ text: '', card: null });
        this._testRefresh();
    },
    _ttRemoveOption: function (i) {
        this._ttSync();
        if (this._ttQ.options.length <= 2) return;
        this._ttQ.options.splice(i, 1);
        if (this._ttQ.correct >= this._ttQ.options.length) this._ttQ.correct = 0;
        this._testRefresh();
    },
    _ttSetCorrect: function (i) { this._ttSync(); this._ttQ.correct = i; this._testRefresh(); },
    _ttPickQCard: function () {
        this._ttSync();
        CardViewer.openTestCardPicker((card) => { this._ttQ.card = { id: card.id, name: card.name }; this._testRefresh(); });
    },
    _ttRemoveQCard: function () { this._ttSync(); this._ttQ.card = null; this._testRefresh(); },
    _ttPickOptCard: function (i) {
        this._ttSync();
        CardViewer.openTestCardPicker((card) => { this._ttQ.options[i].card = { id: card.id, name: card.name }; this._testRefresh(); });
    },
    _ttRemoveOptCard: function (i) { this._ttSync(); this._ttQ.options[i].card = null; this._testRefresh(); },

    _ttAddQuestion: function () {
        this._ttSync();
        const q = this._ttQ;
        if (!q.qText.trim()) { alert('⚠️ Escribe la pregunta.'); return; }
        const validOpts = q.options.filter(o => o.text.trim());
        if (validOpts.length < 2) { alert('⚠️ Necesitas al menos 2 opciones con texto.'); return; }
        if (!q.options[q.correct] || !q.options[q.correct].text.trim()) { alert('⚠️ Marca cuál opción es la correcta (debe tener texto).'); return; }
        this._tt.questions.push({
            q: q.qText.trim(), card: q.card,
            options: q.options.map(o => ({ text: o.text.trim(), card: o.card })),
            correct: q.correct, explain: q.explain.trim(),
        });
        this._ttQ = { qText: '', card: null, options: [{ text: '', card: null }, { text: '', card: null }], correct: 0, explain: '' };
        this._testRefresh();
    },
    _ttRemoveQuestion: function (i) { this._ttSync(); this._tt.questions.splice(i, 1); this._testRefresh(); },

    _ttSaveTest: function () {
        this._ttSync();
        const t = this._tt;
        if (!t.label.trim()) { alert('⚠️ Ponle un nombre al test.'); return; }
        if (!t.questions.length) { alert('⚠️ Agrega al menos una pregunta.'); return; }
        const test = {
            id: `ct_teo_${Date.now()}`, category: 'teoricos', custom: true,
            label: t.label.trim(), level: t.level, desc: t.desc.trim(), questions: t.questions,
        };
        TestDuelo.save(test);
        this._ttReset();
        this._testRefresh();
        alert(`✅ Test teórico "${test.label}" guardado. Ya está disponible en Formación → Test.`);
    },

    // ── Práctico ─────────────────────────────────────────────────

 _taReset: function () {
        const ZONE_KEYS = ['0','1','2','3','4','5','6','7','8','9','10','A','B',
                            'o0','o1','o2','o3','o4','o5','o6','o7','o8','o9','o10'];
        this._ta = {
            label: '', level: 'Avanzado', scenario: '', hint: '', okMsg: '', failMsg: '',
            zones: Object.fromEntries(ZONE_KEYS.map(z => [z, null])),
            oppEnabled: false,
            hand: [], gy: [], banish: [], main: [], extra: [],
            selected: null,
            initial: null, finalPlacement: null, finalGroups: {}, _seq: 0,
        };
    },

    _taSync: function () {
        const a = this._ta;
        a.label    = document.getElementById('ta-label')?.value ?? a.label;
        a.level    = document.getElementById('ta-level')?.value ?? a.level;
        a.scenario = document.getElementById('ta-scenario')?.value ?? a.scenario;
        a.hint     = document.getElementById('ta-hint')?.value ?? a.hint;
        a.okMsg    = document.getElementById('ta-okmsg')?.value ?? a.okMsg;
        a.failMsg  = document.getElementById('ta-failmsg')?.value ?? a.failMsg;
    },

    _renderPracticoAuthor: function () {
        const a = this._ta;
        return `
            <div class="config-new-role" style="flex-direction:column;align-items:stretch;gap:8px;">
                <input type="text" id="ta-label" class="config-input" placeholder="Nombre del test..." value="${a.label || ''}">
                <select id="ta-level" class="config-input">
                    ${['Básico', 'Intermedio', 'Avanzado', 'Competitivo'].map(l => `<option value="${l}" ${a.level === l ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
                <textarea id="ta-scenario" class="config-input" placeholder="Escenario que verá el jugador (ej: Es tu Main Phase 1...)..." rows="2">${a.scenario || ''}</textarea>
                <textarea id="ta-hint" class="config-input" placeholder="Pista (opcional)..." rows="2">${a.hint || ''}</textarea>
                <div style="display:flex;gap:8px;">
                    <textarea id="ta-okmsg" class="config-input" style="flex:1;" placeholder="Mensaje si el jugador acierta..." rows="2">${a.okMsg || ''}</textarea>
                    <textarea id="ta-failmsg" class="config-input" style="flex:1;" placeholder="Mensaje si el jugador falla..." rows="2">${a.failMsg || ''}</textarea>
                </div>
            </div>

            ${this._taRenderBoard()}

            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">
                <button class="btn btn-primary" onclick="Config._taSetInitial()">📍 Estado Inicial</button>
                <button class="btn btn-primary" onclick="Config._taSetFinal()">🎯 Estado Final</button>
                <button class="btn btn-secondary" onclick="Config._taClearBoard()">↺ Limpiar Tablero</button>
            </div>
            <div id="ta-status" style="margin-top:8px;font-size:0.8rem;color:rgba(255,255,255,0.6);">
                ${a.initial ? '✅ Estado inicial capturado. ' : '⏳ Falta capturar el Estado Inicial. '}
                ${a.finalPlacement ? '✅ Estado final capturado.' : '⏳ Falta capturar el Estado Final.'}
            </div>
            ${a.finalPlacement ? this._taRenderGroupsPanel() : ''}

            <div style="margin-top:10px;">
                <button class="btn btn-success" onclick="Config._taSaveTest()">💾 Guardar Test Práctico</button>
            </div>

            ${this._renderTestList('practicos')}
        `;
    },

   _taRenderBoard: function () {
        const a = this._ta;
        const imgUrl = (c) => `https://images.ygoprodeck.com/images/cards_small/${c.id}.jpg`;
        const lp = (iid) => `onpointerdown="Config._taLongPressStart('${iid}',event)" onpointerup="Config._taCancelLongPress()" onpointerleave="Config._taCancelLongPress()" oncontextmenu="return false;"`;
        const chipField = (c) => `
            <img class="pz-card-img fpt-chip${a.selected === c.iid ? ' fpt-chip-selected' : ''}"
                 src="${imgUrl(c)}" alt="${c.name}" title="${(c.name || '').replace(/"/g, '&quot;')}"
                 onclick="event.stopPropagation();Config._taCardClick('${c.iid}')" ${lp(c.iid)} draggable="false">`;
        const chipMulti = (c) => `
            <div class="pz-card-slot fpt-chip${a.selected === c.iid ? ' fpt-chip-selected' : ''}"
                 title="${(c.name || '').replace(/"/g, '&quot;')}"
                 onclick="event.stopPropagation();Config._taCardClick('${c.iid}')" ${lp(c.iid)}>
                <img src="${imgUrl(c)}" alt="${c.name}" draggable="false">
            </div>`;
        const chipStack = (cards) => cards.slice(-4).map((c, i) => `
            <img class="pz-card-img fpt-chip${a.selected === c.iid ? ' fpt-chip-selected' : ''}"
                 src="${imgUrl(c)}" alt="${c.name}" style="position:relative;left:${i * 10}px;z-index:${i};width:70%;"
                 onclick="event.stopPropagation();Config._taCardClick('${c.iid}')" ${lp(c.iid)} draggable="false">`).join('');

        const monsterFieldRow = ['0','1','2','3','4','5'].map((n, idx) => {
            const cls = n === '0' ? 'pz-zone-field' : 'pz-zone-monster';
            return `<div class="pz-zone ${cls}" style="grid-column:${idx + 1};grid-row:1;" onclick="Config._taZoneClick('${n}')">
                        <span class="pz-zone-lbl">${n}</span>${a.zones[n] ? chipField(a.zones[n]) : ''}
                    </div>`;
        }).join('');
        const stRow = ['6','7','8','9','10'].map((n, idx) => {
            const cls = (n === '6' || n === '10') ? 'pz-zone-pendulum' : 'pz-zone-st';
            return `<div class="pz-zone ${cls}" style="grid-column:${idx + 2};grid-row:2;" onclick="Config._taZoneClick('${n}')">
                        <span class="pz-zone-lbl">${n}</span>${a.zones[n] ? chipField(a.zones[n]) : ''}
                    </div>`;
        }).join('');
        const ownGrid = `<div class="pz-field-grid" style="margin-bottom:6px;">${monsterFieldRow}${stRow}</div>`;

        const emzGrid = `
            <div class="pz-field-grid" style="margin-bottom:6px;">
                <div class="pz-zone pz-zone-emz" style="grid-column:3;grid-row:1;" onclick="Config._taZoneClick('A')">
                    <span class="pz-zone-lbl">A</span>${a.zones['A'] ? chipField(a.zones['A']) : ''}
                </div>
                <div class="pz-logo-cell pz-fg-logo" style="grid-column:4;grid-row:1;"></div>
                <div class="pz-zone pz-zone-emz" style="grid-column:5;grid-row:1;" onclick="Config._taZoneClick('B')">
                    <span class="pz-zone-lbl">B</span>${a.zones['B'] ? chipField(a.zones['B']) : ''}
                </div>
            </div>`;

        const oppStRow = ['6','7','8','9','10'].map((n, idx) => {
            const cls = (n === '6' || n === '10') ? 'pz-zone-pendulum' : 'pz-zone-st';
            return `<div class="pz-zone ${cls}" style="grid-column:${idx + 2};grid-row:1;" onclick="Config._taZoneClick('o${n}')">
                        <span class="pz-zone-lbl">${n}</span>${a.zones['o'+n] ? chipField(a.zones['o'+n]) : ''}
                    </div>`;
        }).join('');
        const oppMonsterFieldRow = ['0','1','2','3','4','5'].map((n, idx) => {
            const cls = n === '0' ? 'pz-zone-field' : 'pz-zone-monster';
            return `<div class="pz-zone ${cls}" style="grid-column:${idx + 1};grid-row:2;" onclick="Config._taZoneClick('o${n}')">
                        <span class="pz-zone-lbl">${n}</span>${a.zones['o'+n] ? chipField(a.zones['o'+n]) : ''}
                    </div>`;
        }).join('');
        const oppGrid = a.oppEnabled ? `
            <p style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin:0 0 4px;">Campo Rival:</p>
            <div class="pz-field-grid" style="margin-bottom:6px;opacity:0.9;">${oppStRow}${oppMonsterFieldRow}</div>` : '';

        return `
            <div class="pz-board-outer fpt-board" id="ta-board">
                <label style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:0.8rem;color:rgba(255,255,255,0.7);">
                    <input type="checkbox" ${a.oppEnabled ? 'checked' : ''} onchange="Config._taToggleOpp(this.checked)">
                    🔁 Habilitar Campo Rival (comparte las Zonas de Monstruo Extra)
                </label>
                ${oppGrid}
                ${a.oppEnabled ? '<p style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin:0 0 4px;">Zonas Extra Monstruo (compartidas):</p>' : ''}
                ${emzGrid}
                ${a.selected ? `<div class="pz-move-hint">🖐️ Toca la zona (o carta) destino — cualquier zona, incluso del rival — o vuelve a tocar la carta para cancelar.</div>` : ''}
                <p style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin:6px 0 4px;">Tu Campo:</p>
                ${ownGrid}

                <div class="pz-zone-row" style="gap:8px;">
                    <div style="flex:1;display:flex;align-items:center;gap:6px;min-width:0;">
                        <span class="pz-row-label">GY</span>
                        <div class="pz-multi-zone pz-gy-zone" style="overflow-x:auto;flex-wrap:nowrap;" onclick="Config._taMultiZoneClick('gy')">
                            ${a.gy.length ? a.gy.map(chipMulti).join('') : '<span class="fpt-empty-lbl">Vacío</span>'}
                        </div>
                    </div>
                    <div style="flex:1;display:flex;align-items:center;gap:6px;min-width:0;">
                        <span class="pz-row-label">Banish</span>
                        <div class="pz-multi-zone pz-banish-zone" style="overflow-x:auto;flex-wrap:nowrap;" onclick="Config._taMultiZoneClick('banish')">
                            ${a.banish.length ? a.banish.map(chipMulti).join('') : '<span class="fpt-empty-lbl">Vacío</span>'}
                        </div>
                    </div>
                </div>

                <div class="pz-zone-row" style="gap:6px;align-items:flex-start;">
                    <div style="width:100px;flex-shrink:0;">
                        <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;">
                            <span class="pz-row-label" style="font-size:0.68rem;">Extra</span>
                            <button class="pz-mini-btn" onclick="Config._taOpenPileList('extra')">👁</button>
                        </div>
                        <div class="pz-multi-zone" onclick="Config._taMultiZoneClick('extra')">
                            ${a.extra.length ? chipStack(a.extra) : '<span class="fpt-empty-lbl">Vacío</span>'}
                        </div>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <span class="pz-row-label">Mano</span>
                        <div class="pz-multi-zone pz-hand-zone" style="overflow-x:auto;flex-wrap:nowrap;" onclick="Config._taMultiZoneClick('hand')">
                            ${a.hand.length ? a.hand.map(chipMulti).join('') : '<span class="fpt-empty-lbl">Vacía</span>'}
                        </div>
                    </div>
                    <div style="width:100px;flex-shrink:0;">
                        <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;">
                            <span class="pz-row-label" style="font-size:0.68rem;">Main</span>
                            <button class="pz-mini-btn" onclick="Config._taOpenPileList('main')">👁</button>
                        </div>
                        <div class="pz-multi-zone" onclick="Config._taMultiZoneClick('main')">
                            ${a.main.length ? chipStack(a.main) : '<span class="fpt-empty-lbl">Vacío</span>'}
                        </div>
                    </div>
                </div>

                <div style="margin-top:8px;">
                    <button class="btn btn-secondary" onclick="Config._taPickCard()">🔍 Buscar carta y agregar a la mano</button>
                </div>
            </div>`;
    },
_taRenderFieldGrid: function () {
        const a = this._ta;
        const imgUrl = (c) => `https://images.ygoprodeck.com/images/cards_small/${c.id}.jpg`;
        const chipField = (c) => `
            <img class="pz-card-img fpt-chip${a.selected === c.iid ? ' fpt-chip-selected' : ''}"
                 src="${imgUrl(c)}" alt="${c.name}" title="${(c.name || '').replace(/"/g, '&quot;')}"
                 onclick="event.stopPropagation();Config._taCardClick('${c.iid}')" draggable="false">`;
        const z = a.zones;
        return `
            <div class="pz-field-grid" style="margin-bottom:6px;">
                <div class="pz-zone pz-zone-emz pz-fg-emz-a" onclick="Config._taZoneClick('A')">
                    <span class="pz-zone-lbl">A</span>${z['A'] ? chipField(z['A']) : ''}
                </div>
                <div class="pz-logo-cell pz-fg-logo"></div>
                <div class="pz-zone pz-zone-emz pz-fg-emz-b" onclick="Config._taZoneClick('B')">
                    <span class="pz-zone-lbl">B</span>${z['B'] ? chipField(z['B']) : ''}
                </div>
                <div class="pz-zone pz-zone-field pz-fg-c" onclick="Config._taZoneClick('0')">
                    <span class="pz-zone-lbl">0</span>${z['0'] ? chipField(z['0']) : ''}
                </div>
                ${['1','2','3','4','5'].map(n => `
                    <div class="pz-zone pz-zone-monster" onclick="Config._taZoneClick('${n}')">
                        <span class="pz-zone-lbl">${n}</span>${z[n] ? chipField(z[n]) : ''}
                    </div>`).join('')}
                <div class="pz-fg-st-spacer"></div>
                ${['6','7','8','9','10'].map(n => `
                    <div class="pz-zone ${n=='6'||n=='10'?'pz-zone-pendulum':'pz-zone-st'}" onclick="Config._taZoneClick('${n}')">
                        <span class="pz-zone-lbl">${n}</span>${z[n] ? chipField(z[n]) : ''}
                    </div>`).join('')}
            </div>`;
    },

    _taRenderOppGrid: function () {
        const z = this._ta.oppZones;
        const chip = (key, c) => `
            <img class="pz-card-img" src="https://images.ygoprodeck.com/images/cards_small/${c.id}.jpg"
                 alt="${c.name}" title="${(c.name || '').replace(/"/g, '&quot;')}"
                 onclick="event.stopPropagation();Config._taOppZoneRemove('${key}')" draggable="false">`;
        return `
            <div class="pz-field-grid" style="margin-bottom:8px;opacity:0.85;">
                <div class="pz-zone pz-zone-emz pz-fg-emz-a"><span class="pz-zone-lbl">A</span>${z['A'] ? chip('A', z['A']) : ''}</div>
                <div class="pz-logo-cell pz-fg-logo"></div>
                <div class="pz-zone pz-zone-emz pz-fg-emz-b"><span class="pz-zone-lbl">B</span>${z['B'] ? chip('B', z['B']) : ''}</div>
                <div class="pz-zone pz-zone-field pz-fg-c"><span class="pz-zone-lbl">0</span>${z['0'] ? chip('0', z['0']) : ''}</div>
                ${['1','2','3','4','5'].map(n => `<div class="pz-zone pz-zone-monster"><span class="pz-zone-lbl">${n}</span>${z[n] ? chip(n, z[n]) : ''}</div>`).join('')}
                <div class="pz-fg-st-spacer"></div>
                ${['6','7','8','9','10'].map(n => `<div class="pz-zone ${n=='6'||n=='10'?'pz-zone-pendulum':'pz-zone-st'}"><span class="pz-zone-lbl">${n}</span>${z[n] ? chip(n, z[n]) : ''}</div>`).join('')}
            </div>`;
    },

    _taToggleOpp: function (checked) {
        this._taSync();
        this._ta.oppEnabled = checked;
        this._testRefresh();
    },

    _taOppZoneRemove: function (key) {
        if (!confirm('¿Quitar esta carta del campo rival?')) return;
        this._ta.oppZones[key] = null;
        this._testRefresh();
    },

    _taPickOppCard: function () {
        CardViewer.openTestCardPicker((card) => {
            const zone = (prompt('¿En qué zona del rival colocarla? (0, 1-5, A, B, 6-10)') || '').trim().toUpperCase();
            if (!zone) return;
            if (!(zone in this._ta.oppZones)) { alert('Zona no válida.'); return; }
            this._ta.oppZones[zone] = { id: card.id, name: card.name };
            this._taRefresh();
        });
    },
    _taRefresh: function () { const el = document.getElementById('ta-board'); if (el) el.outerHTML = this._taRenderBoard(); },

   _taCardClick: function (iid) {
        if (this._taLPFired) { this._taLPFired = false; return; }
        const a = this._ta;
        if (!a.selected) { a.selected = iid; this._taRefresh(); return; }
        if (a.selected === iid) { a.selected = null; this._taRefresh(); return; }
        this._taSwapInto(iid);
    },
    _taZoneClick: function (zone) {
        const a = this._ta;
        if (!a.selected) return;
        const occupantIid = a.zones[zone]?.iid;
        if (occupantIid && occupantIid !== a.selected) { this._taSwapInto(occupantIid); return; }
        const moving = this._taFindAndRemove(a.selected);
        if (!moving) { a.selected = null; this._taRefresh(); return; }
        a.zones[zone] = moving; a.selected = null; this._taRefresh();
    },
    _taMultiZoneClick: function (zoneName) {
        const a = this._ta;
        if (!a.selected) return;
        const moving = this._taFindAndRemove(a.selected);
        if (!moving) { a.selected = null; this._taRefresh(); return; }
        a[zoneName].push(moving); a.selected = null; this._taRefresh();
    },
    _taSwapInto: function (targetIid) {
        const a = this._ta;
        const movingIid = a.selected;
        const loc = this._taLocate(targetIid);
        const movingCard = this._taFindAndRemove(movingIid);
        if (!movingCard) { a.selected = null; this._taRefresh(); return; }
        if (loc.type === 'zone') {
            const occupant = a.zones[loc.zone];
            a.zones[loc.zone] = movingCard;
            if (occupant) a.hand.push(occupant);
        } else { a[loc.type].push(movingCard); }
        a.selected = null; this._taRefresh();
    },
    _taLocate: function (iid) {
        const a = this._ta;
        for (const z in a.zones) { if (a.zones[z]?.iid === iid) return { type: 'zone', zone: z }; }
        const POOLS = ['hand','gy','banish','main','extra'];
        for (const p of POOLS) { if (a[p].some(c => c.iid === iid)) return { type: p }; }
        return { type: 'hand' };
    },
    _taFindAndRemove: function (iid) {
        const a = this._ta;
        for (const z in a.zones) { if (a.zones[z]?.iid === iid) { const c = a.zones[z]; a.zones[z] = null; return c; } }
        const POOLS = ['hand','gy','banish','main','extra'];
        for (const p of POOLS) {
            const idx = a[p].findIndex(c => c.iid === iid);
            if (idx > -1) return a[p].splice(idx, 1)[0];
        }
        return null;
    },

    _taPickCard: function () {
        CardViewer.openTestCardPicker((card) => {
            this._ta.hand.push({ iid: `ta_${this._ta._seq++}`, id: card.id, name: card.name });
            this._taRefresh();
        });
    },
_taClearBoard: function () {
        if (!confirm('¿Vaciar el tablero? Se perderán las cartas agregadas.')) return;
        this._taSync();
        const keep = { label: this._ta.label, level: this._ta.level, scenario: this._ta.scenario, hint: this._ta.hint, okMsg: this._ta.okMsg, failMsg: this._ta.failMsg };
        this._taReset();
        Object.assign(this._ta, keep);
        this._testRefresh();
    },

    _taSetInitial: function () {
        this._taSync();
        const a = this._ta;
        const hasAny = a.hand.length || a.gy.length || a.banish.length || a.main.length || a.extra.length || Object.values(a.zones).some(Boolean);
        if (!hasAny) { alert('⚠️ Agrega al menos una carta al tablero antes de capturar el Estado Inicial.'); return; }
        a.initial = {
            zones:  Object.fromEntries(Object.entries(a.zones).map(([k, v]) => [k, v ? { ...v } : null])),
            hand:   a.hand.map(c => ({ ...c })),
            gy:     a.gy.map(c => ({ ...c })),
            banish: a.banish.map(c => ({ ...c })),
            main:   a.main.map(c => ({ ...c })),
            extra:  a.extra.map(c => ({ ...c })),
            oppEnabled: a.oppEnabled,
        };
        a.finalPlacement = null;
        a.finalGroups = {};
        this._testRefresh();
        alert('📍 Estado Inicial capturado. Ahora mueve las cartas a su posición final y presiona 🎯 Estado Final.');
    },

    _taSetFinal: function () {
        this._taSync();
        const a = this._ta;
        if (!a.initial) { alert('⚠️ Primero captura el Estado Inicial.'); return; }
        const placement = {};
        for (const z in a.zones) { if (a.zones[z]) placement[a.zones[z].iid] = z; }
        ['hand','gy','banish','main','extra'].forEach(pool => a[pool].forEach(c => placement[c.iid] = pool));
        a.finalPlacement = placement;
        const OWN_BOARD = ['0','1','2','3','4','5','6','7','8','9','10','A','B'];
        Object.keys(a.finalGroups).forEach(iid => { if (!OWN_BOARD.includes(placement[iid])) delete a.finalGroups[iid]; });
        this._testRefresh();
        alert('🎯 Estado Final capturado. Ajusta la flexibilidad de zona si quieres y guarda el test.');
    },

    _taSaveTest: function () {
        this._taSync();
        const a = this._ta;
        if (!a.label.trim()) { alert('⚠️ Ponle un nombre al test.'); return; }
        if (!a.initial) { alert('⚠️ Captura el Estado Inicial.'); return; }
        if (!a.finalPlacement) { alert('⚠️ Captura el Estado Final.'); return; }
        const mk = (c) => ({ iid: c.iid, label: c.name, imgId: c.id });
        const solution = {};
        Object.entries(a.finalPlacement).forEach(([iid, zone]) => { solution[iid] = { zone, groups: a.finalGroups[iid] || [] }; });
        const test = {
            id: `ct_prac_${Date.now()}`, category: 'practicos', custom: true, type: 'board',
            label: a.label.trim(), level: a.level,
            scenario: a.scenario.trim(), hint: a.hint.trim(),
            okMsg: a.okMsg.trim(), failMsg: a.failMsg.trim(),
            board: {
                hand:   a.initial.hand.map(mk),
                gy:     a.initial.gy.map(mk),
                banish: a.initial.banish.map(mk),
                main:   a.initial.main.map(mk),
                extra:  a.initial.extra.map(mk),
                zones:  Object.fromEntries(Object.entries(a.initial.zones).map(([z, c]) => [z, c ? mk(c) : null])),
                oppEnabled: a.initial.oppEnabled,
            },
            solution,
        };
        TestDuelo.save(test);
        this._taReset();
        this._testRefresh();
        alert(`✅ Test práctico "${test.label}" guardado. Ya está disponible en Formación → Test.`);
    },

    _taRenderGroupsPanel: function () {
        const a = this._ta;
        const OWN_BOARD = ['0','1','2','3','4','5','6','7','8','9','10','A','B'];
        const nameOf = (iid) => {
            const zEntry = Object.values(a.initial.zones).find(c => c && c.iid === iid);
            if (zEntry) return zEntry.name;
            for (const pool of ['hand','gy','banish','main','extra']) {
                const c = (a.initial[pool] || []).find(c => c.iid === iid);
                if (c) return c.name;
            }
            return iid;
        };
        const relevant = Object.entries(a.finalPlacement).filter(([iid, z]) => OWN_BOARD.includes(z));
        if (!relevant.length) return '';
        const GROUPS = [['pendulum','Péndulo (6 o 10)'], ['monster','Monstruos (1-5)'], ['st','Magia/Trampa (6-10)'], ['emz','Extra Monstruo (A/B)']];
        return `
            <div style="margin-top:10px;padding:8px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;">
                <p style="margin:0 0 6px;color:#FFD700;font-size:0.82rem;">🎯 Flexibilidad de zona (opcional):</p>
                <p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:0.72rem;">Por defecto exige la zona exacta capturada. Marca un grupo para aceptar cualquier zona de ese grupo.</p>
                ${relevant.map(([iid, z]) => `
                    <div style="margin-bottom:6px;">
                        <span style="font-size:0.8rem;color:#eee;">${nameOf(iid)} <em style="color:rgba(255,255,255,0.4);">(zona ${z})</em>:</span>
                        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:2px;">
                            ${GROUPS.map(([g, lbl]) => `
                                <label style="font-size:0.75rem;color:rgba(255,255,255,0.7);">
                                    <input type="checkbox" ${(a.finalGroups[iid] || []).includes(g) ? 'checked' : ''}
                                           onchange="Config._taToggleGroup('${iid}','${g}',this.checked)"> ${lbl}
                                </label>`).join('')}
                        </div>
                    </div>`).join('')}
            </div>`;
    },

    _taToggleGroup: function (iid, group, checked) {
        if (!this._ta.finalGroups[iid]) this._ta.finalGroups[iid] = [];
        const arr = this._ta.finalGroups[iid];
        const idx = arr.indexOf(group);
        if (checked && idx === -1) arr.push(group);
        if (!checked && idx > -1) arr.splice(idx, 1);
    },

    _taToggleOpp: function (checked) {
        this._taSync();
        const a = this._ta;
        if (!checked) {
            Object.keys(a.zones).filter(z => z.startsWith('o')).forEach(z => {
                if (a.zones[z]) { a.hand.push(a.zones[z]); a.zones[z] = null; }
            });
        }
        a.oppEnabled = checked;
        this._testRefresh();
    },

    _taLongPressStart: function (iid, ev) {
        this._taCancelLongPress();
        this._taLPTimer = setTimeout(() => {
            this._taLPFired = true;
            if (navigator.vibrate) navigator.vibrate(30);
            this._taShowCardMenu(iid, ev);
        }, 1000);
    },
    _taCancelLongPress: function () {
        if (this._taLPTimer) { clearTimeout(this._taLPTimer); this._taLPTimer = null; }
    },
    _taShowCardMenu: function (iid, ev) {
        document.querySelectorAll('.fpt-card-menu').forEach(m => m.remove());
        const menu = document.createElement('div');
        menu.className = 'pz-action-submenu fpt-card-menu';
        menu.innerHTML = `<button class="pz-zmenu-btn pz-zmenu-ver" onclick="Config._taViewCard('${iid}')">Ver</button>`;
        document.body.appendChild(menu);
        const rect = ev.target.getBoundingClientRect();
        menu.style.position = 'fixed'; menu.style.zIndex = '99999';
        menu.style.left = (rect.left + rect.width / 2) + 'px';
        menu.style.top  = (rect.bottom + 6) + 'px';
        menu.style.transform = 'translateX(-50%)';
        const close = (e2) => { if (!menu.contains(e2.target)) { menu.remove(); document.removeEventListener('click', close, true); } };
        setTimeout(() => document.addEventListener('click', close, true), 50);
    },
    _taViewCard: function (iid) {
        document.querySelectorAll('.fpt-card-menu').forEach(m => m.remove());
        const a = this._ta;
        let entry = null;
        for (const z in a.zones) { if (a.zones[z]?.iid === iid) entry = a.zones[z]; }
        if (!entry) ['hand','gy','banish','main','extra'].forEach(p => { const f = a[p].find(c => c.iid === iid); if (f) entry = f; });
        if (!entry) return;
        ZonaPractica._openMiniCV({
            id: entry.id, name: entry.name,
            card_images: [{ image_url_small: `https://images.ygoprodeck.com/images/cards_small/${entry.id}.jpg` }],
        });
    },
    _taOpenPileList: function (poolName) {
        const a = this._ta;
        document.getElementById('fpt-pile-overlay')?.remove();
        const cards = a[poolName] || [];
        const labelMap = { main: 'Main Deck', extra: 'Extra Deck' };
        const overlay = document.createElement('div');
        overlay.id = 'fpt-pile-overlay';
        overlay.className = 'pz-modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="pz-modal-box">
                <div class="pz-modal-title">${labelMap[poolName] || poolName} (${cards.length})</div>
                <button class="pz-modal-close" onclick="document.getElementById('fpt-pile-overlay').remove()">✕</button>
                <div style="max-height:60vh;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
                    ${cards.length ? cards.map(c => `
                        <div class="pz-search-item">
                            <img src="https://images.ygoprodeck.com/images/cards_small/${c.id}.jpg" class="pz-search-thumb">
                            <div class="pz-search-info"><div class="pz-search-name">${c.name}</div></div>
                            <div class="pz-search-btns">
                                <button class="pz-search-view-btn" onclick="Config._taViewCard('${c.iid}')">Ver</button>
                                <button class="pz-search-add-btn" onclick="Config._taRemoveFromPool('${poolName}','${c.iid}')">🗑️</button>
                            </div>
                        </div>`).join('') : '<p class="pz-search-hint">Vacío.</p>'}
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },
    _taRemoveFromPool: function (poolName, iid) {
        const a = this._ta;
        const idx = a[poolName].findIndex(c => c.iid === iid);
        if (idx > -1) a[poolName].splice(idx, 1);
        this._taOpenPileList(poolName);
        this._taRefresh();
    },

    exportConfig: function () {
        if (ConfigManager.exportConfig()) {
            alert('✅ Backup exportado correctamente.\n\nEl archivo contiene:\n• Decks guardados y deck activo\n• Engines y Staples\n• Config completa (roles, G1/G2 scoring, mecánicas, pilares, RPS, nomenclatura)\n• Matchups (Historial de Enfrentamientos) e Historial de Sesiones / Optimización (incluye Nivel como Piloto del Deck y Complejidad del Deck)\n• Winrates\n• Meta: decks, librería de cartas, scores y cross-scores\n• Favoritas, Torneo, Formación (apuntes, temas dominados, fallbacks de imágenes) y Banlist\n• Música y Perfil de contenido (novato/casual/competitivo)\n\nGuárdalo en un lugar seguro para restaurar tu progreso en cualquier momento.');
        } else {
            alert('❌ No se pudo exportar el backup. Intenta de nuevo.');
        }
    },

    generarReporte: function () {
        if (typeof window.DDLogger === 'undefined') {
            alert('❌ Logger no disponible en esta sesión.');
            return;
        }
        const total  = window.DDLogger.getLogs().length;
        const errors = window.DDLogger.getLogs().filter(e => !e.ok).length;
        if (!confirm(`📋 Generar reporte de log?\n\nEntradas: ${total}\nErrores: ${errors}\n\nSe descargará un archivo .txt.`)) return;
        window.DDLogger.exportReport();
    },

    importConfig: function () {
        document.getElementById('config-import-file')?.click();
    },

    handleFileImport: async function (el) {
        const file = el.files[0];
        if (!file) return;
        if (!confirm('⚠️ Importar Data\n\nEsto reemplazará TODA la data actual con el contenido del archivo de backup.\n\nAsegúrate de haber exportado tu data actual si quieres conservarla.\n\n¿Continuar?')) {
            el.value = '';
            return;
        }
        try {
            await ConfigManager.importConfig(file);
            alert('✅ Backup importado correctamente. La app se recargará para aplicar los cambios.');
            location.reload();
        } catch (err) {
            alert('❌ Error al importar: ' + err + '\n\nVerifica que el archivo sea un backup válido generado por esta app.');
            el.value = '';
        }
    },
    
    addNomCondKw: function (catId, field, el) {
    const kw = el.value.trim().toLowerCase();
    if (!kw) { alert('⚠️ Escribe una keyword'); return; }
    if (ConfigManager.addNomCondKw(catId, field, kw)) {
        el.value = '';
        this.render();
        this._restoreAndScroll('nomenclature-section', `nom-anchor-${catId}`);
    } else {
        alert('❌ Ya existe esa keyword');
    }
},

removeNomCondKw: function (catId, field, kw) {
        if (ConfigManager.removeNomCondKw(catId, field, kw)) {
            this.render();
            this._restoreAndScroll('nomenclature-section', `nom-anchor-${catId}`);
        }
    },
    removeNomCondKwByIndex: function (catId, field, index) {
        if (ConfigManager.removeNomCondKwByIndex(catId, field, index)) {
            this.render();
            this._restoreAndScroll('nomenclature-section', `nom-anchor-${catId}`);
        }
    },renderNomCategoryOptionsAdd: function(roleName) {
    const cats     = ConfigManager.getNomenclature().categories || [];
    const selected = ConfigManager.getRoleNomenclatureCategories(roleName);
    const available = cats.filter(c => !selected.includes(c.id));
    if (available.length === 0)
        return '<option value="">Sin más categorías</option>';
    return '<option value="">-- Seleccionar --</option>' +
        available.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
},

addRoleNomCat: function(roleName) {
    const sel = document.getElementById(`nom-cat-select-${roleName}`);
    if (!sel || !sel.value) return;
    if (ConfigManager.addRoleNomenclatureCategory(roleName, sel.value)) {
        this.render();
        this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
    }
},

removeRoleNomCat: function(roleName, catId) {
    if (ConfigManager.removeRoleNomenclatureCategory(roleName, catId)) {
        this.render();
        this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
    }
},
_restoreAndScroll: function(sectionId, anchorId) {
    requestAnimationFrame(() => {
        const sec = document.getElementById(sectionId);
        if (sec) sec.style.display = 'block';
        if (anchorId) {
            const el = document.getElementById(anchorId);
            if (el) {
                // Si el elemento es un panel colapsable, expandirlo automáticamente
                const body = el.querySelector('.role-card-body');
                if (body) body.style.display = 'flex';
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
},
    toggleSection: function (sectionId) {
        const sec = document.getElementById(sectionId);
        if (sec) {
            sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
        }
        
    },
    
    _borrarToggleAll: function (checked) {
    document.querySelectorAll('.borrar-opcion-cb').forEach(cb => { cb.checked = checked; });
},

borrarSeleccion: function () {
    const selected = [...document.querySelectorAll('.borrar-opcion-cb:checked')].map(cb => cb.dataset.key);
    if (!selected.length) { alert('Selecciona al menos una opción para borrar.'); return; }

    const etiquetas = {
        decks: 'Decks guardados', engines: 'Engines', matchups: 'Matchups e Historial',
        optimizacion: 'Datos de Optimización (Deck Testing)',
        winrates: 'Winrates', favoritas: 'Favoritas', torneo: 'Torneo activo',
        practica: 'Estados de práctica', cache: 'Cache de Scores (Power + Cross)',
        meta_library: 'Librería de cartas del Meta',
        formacion: 'Notas y temas de Formación', meta_folders: 'Carpetas del Meta (decks importados)',
        banlist: 'Banlist del Formato',
        config: 'Configuración (roles, scoring, mecánicas…)',
        perfil: 'Perfil y bienvenida', fallbacks: 'Imágenes y Fallbacks',
    };
    const lista = selected.map(k => `• ${etiquetas[k]}`).join('\n');
    if (!confirm(`⚠️ ¿Borrar lo siguiente?\n\n${lista}\n\nEsta acción NO se puede deshacer.`)) return;

    const rm  = (k)      => localStorage.removeItem(k);
    const rmP = (prefix) => {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith(prefix)) keys.push(k); }
        keys.forEach(rm);
    };

    if (selected.includes('decks')) {
        rm('yugioh_decks'); rmP('deck_');
        if (window.Deck) { Deck.cards = {}; Deck.name = 'Mi Deck'; Deck.notes = ''; if (document.getElementById('deck-content')) Deck.render(); }
    }
    if (selected.includes('engines')) {
        rm('yugioh_engines');
        if (window.Engines && document.getElementById('mideck-content')) Engines._renderSidebar();
    }
    if (selected.includes('matchups')) {
        rmP('matchup_');
        if (window.Matchups) Matchups.refreshSection?.();
        if (window.Duelista) { const el = document.getElementById('duelista-content-opt'); if (el) Duelista.refreshSection(); }
    }
    if (selected.includes('optimizacion')) {
        rmP('optimization_'); rmP('complejidad_'); rmP('experiencia_');
        if (window.Duelista) { const el = document.getElementById('duelista-content-opt'); if (el) Duelista.refreshSection(); }
    }
    if (selected.includes('winrates')) {
        rm('yugioh_winrates'); rm('pz_winrate_standalone');
        if (window.Winrate) Winrate.refreshSection();
    }
    if (selected.includes('favoritas')) {
        rm('yugioh_favoritas');
        if (window.Favoritas) Favoritas.render?.();
    }
    if (selected.includes('torneo')) {
        rm('yugioh_torneo_actual');
        if (window.Torneo) Torneo._initialized = false;
    }
    if (selected.includes('practica')) {
        rmP('pz_states_');
    }
    if (selected.includes('cache')) {
        rm('yugioh_power_cache'); rm('yugioh_cross_scores'); rm('dd_power_scores_cache');
        rm('yugioh_meta_deck_scores');
        if (window.Estadisticas) {
            Estadisticas.powerScoreCache = null;
            Estadisticas.crossScores     = {};
            Estadisticas.metaDeckScores  = {};
            if (typeof Estadisticas.updateFloatingWidget === 'function') Estadisticas.updateFloatingWidget();
        }
    }
    if (selected.includes('meta_library')) {
        rm('yugioh_meta_card_library');
        if (window.Estadisticas) {
            Estadisticas.metaCardLibrary = {};
        }
    }
    if (selected.includes('formacion')) {
        rm('yugioh_formacion_notes'); rm('yugioh_formacion_mastered');
    }
    if (selected.includes('meta_folders')) {
        rm('yugioh_meta_folders'); rm('yugioh_meta_decks');
        rm('yugioh_meta_deck_scores'); rm('yugioh_cross_scores');
        if (window.Estadisticas) {
            Estadisticas.metaDecks      = {};
            Estadisticas.metaFolders    = [];
            Estadisticas.metaDeckScores = {};
            Estadisticas.crossScores    = {};
            if (document.getElementById('estadisticas-content')) Estadisticas.render();
        }
    }
    if (selected.includes('banlist')) {
        rm('yugioh_banlist_data');
        if (window.Banlist) {
            Banlist.data = {};
            const sec = document.getElementById('banlist-section');
            if (sec && sec.style.display !== 'none' && typeof Banlist.renderSection === 'function') Banlist.renderSection();
        }
    }
    if (selected.includes('config')) {
        rm('yugioh_config');
        if (window.ConfigManager && typeof ConfigManager._ensureDefaults === 'function') ConfigManager._ensureDefaults();
    }
    if (selected.includes('perfil')) {
        rm('yugioh_player_level'); rm('dd_player_profile');
        rm('dd_content_visibility'); rm('dd_welcome_dismissed');
        rm('yugioh_music_config');
        if (window.Welcome) { Welcome.dismissed = false; Welcome.init(); }
        if (window.ContentManager) ContentManager.applyAll();
    }
    if (selected.includes('fallbacks')) {
        rm('yugioh_meta_fallbacks'); rm('yugioh_formacion_fallbacks');
    }

    this.render();
    alert(`✅ ${selected.length} categoría(s) borrada(s) correctamente.`);
},

    // Resetea todos los módulos en memoria tras un clear total
    _resetModulesInMemory: function () {
        if (window.Deck) {
            Deck.cards = {};
            Deck.name  = 'Mi Deck';
            Deck.notes = '';
            if (document.getElementById('deck-content')) Deck.render();
        }
        if (window.Engines) {
            if (document.getElementById('mideck-content')) Engines._renderSidebar();
        }
        if (window.Matchups) {
            if (document.getElementById('historial-content')) Matchups.refreshSection?.();
        }
        if (window.Duelista) {
            const el = document.getElementById('duelista-content-opt');
            if (el) Duelista.refreshSection();
        }
        if (window.Estadisticas) {
            Estadisticas.powerScoreCache  = null;
            Estadisticas.metaDecks        = {};
            Estadisticas.metaFolders      = [];
            Estadisticas.metaCardLibrary  = {};
            Estadisticas.metaDeckScores   = {};
            Estadisticas.crossScores      = {};
            if (document.getElementById('estadisticas-content')) Estadisticas.render();
            if (typeof Estadisticas.updateFloatingWidget === 'function')
                Estadisticas.updateFloatingWidget();
        }
        if (window.Favoritas) {
            const el = document.getElementById('favoritas-panel');
            if (el) Favoritas.render();
        }
        if (window.Winrate) Winrate.refreshSection();
        if (window.Torneo) {
            Torneo._initialized = false;
        }
        if (window.ContentManager) ContentManager.applyAll();
    },
renderPillarsSection: function() {
    const pillars   = ConfigManager.getPillars();
    const allRoles  = ConfigManager.getRoleNames();

    const pillarDefs = [
        { key: 'consistency', label: '🎯 Consistencia', color: '#00b894',
          hint: 'Arranque y búsqueda — roles que garantizan la mano inicial.' },
        { key: 'power',       label: '⚡ Potencia',      color: '#d63031',
          hint: 'Cierre y rompedoras — roles que ganan el juego.' },
        { key: 'resilience',  label: '🛡️ Resiliencia',   color: '#0066cc',
          hint: 'Negación y extensión — roles que sostienen la estrategia.' }
    ];

    const pillarCard = (def) => {
        const assigned = pillars[def.key] || [];
        const available = allRoles.filter(r => !assigned.includes(r));

        const chips = assigned.length > 0
            ? assigned.map(role => {
                const w = ConfigManager.getRoleWeight(role).toFixed(1);
                return `<div class="keyword-chip" style="border-color:${def.color}">
                    <span class="chip-text">${role} <small style="opacity:0.6">(${w})</small></span>
                    <span class="chip-remove"
                        onclick="Config.removePillarRole('${def.key}','${role}')">×</span>
                </div>`;
            }).join('')
            : '<span class="empty-chips">Sin roles asignados</span>';

        const opts = available.length > 0
            ? '<option value="">-- Agregar rol --</option>' +
              available.map(r => `<option value="${r}">${r}</option>`).join('')
            : '<option value="">Sin roles disponibles</option>';

        return `
            <div class="role-card" style="border-top:3px solid ${def.color}">
                <div class="role-card-header" style="background:${def.color}22">
                    <span style="font-weight:bold;color:${def.color}">${def.label}</span>
                </div>
                <div class="role-card-body">
                    <small class="config-help-text" style="display:block;margin-bottom:8px;">${def.hint}</small>
                    <div class="keywords-container">${chips}</div>
                    <div class="add-keyword-container" style="margin-top:8px;">
                        <select class="keyword-input" id="pillar-add-${def.key}">${opts}</select>
                        <button class="btn btn-sm"
                            onclick="Config.addPillarRole('${def.key}')">+ Agregar</button>
                    </div>
                </div>
            </div>`;
    };

   const PILLAR_LABELS = { consistency: 'Consistencia', power: 'Potencia', resilience: 'Resiliencia', ninguno: 'Ninguno' };
    const rps = ConfigManager.getPillarRPS();

    const rpsRows = rps.map((pair, i) => `
        <div class="rps-config-row">
            <select class="keyword-input rps-select" onchange="Config.updateRPSRule(${i}, 0, this.value)">
                ${['consistency','power','resilience'].map(p =>
                    `<option value="${p}" ${pair[0]===p?'selected':''}>${PILLAR_LABELS[p]}</option>`
                ).join('')}
            </select>
            <span class="rps-arrow">vence a</span>
            <select class="keyword-input rps-select" onchange="Config.updateRPSRule(${i}, 1, this.value)">
                ${['consistency','power','resilience','ninguno'].map(p =>
                    `<option value="${p}" ${pair[1]===p?'selected':''}>${PILLAR_LABELS[p]}</option>`
                ).join('')}
            </select>
        </div>`).join('');

    return `
        <div class="config-help-text">
            <p>Define qué roles de tu configuración aportan a cada pilar. El <strong>peso del rol</strong> (definido en Roles) determina cuánto aporta cada uno.</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--spacing-md);">
            ${pillarDefs.map(d => pillarCard(d)).join('')}
        </div>
        <div style="margin-top:var(--spacing-md);">
            <div class="config-help-text" style="margin-bottom:8px;">
                <strong>Relación entre pilares (RPS)</strong> — define qué pilar vence a cuál en match-ups. Afecta el External Score cuando los pilares dominantes se enfrentan.
            </div>
            <div class="rps-config-grid">${rpsRows}</div>
        </div>`;
},

renderTabIntroSection: function () {
    if (!window.TabIntro) return '<p class="stats-empty">TabIntro no disponible.</p>';
    const disabledMap = TabIntro.getDisabledMap();
    const rows = Object.keys(TabIntro.CONTENT).map(tab => {
        const label = TabIntro.CONTENT[tab].title;
        const checked = !disabledMap[tab]; // checked = activo (se muestra)
        return `
            <label class="tabintro-config-row">
                <input type="checkbox" ${checked ? 'checked' : ''}
                       onchange="TabIntro.setDisabled('${tab}', !this.checked)">
                ${label}
            </label>`;
    }).join('');

    return `
        <div class="config-help-text" style="margin-bottom:8px;">
            Activa o desactiva el panel informativo que aparece al entrar por primera
            vez a cada pestaña. La decisión se guarda y se respeta en próximas sesiones.
        </div>
        <div class="tabintro-config-list">${rows}</div>`;
},

renderScoringSection: function () {
    const cfg    = window.ConfigManager?.getConfig?.() || {};
    const g1g2   = cfg.g1g2Roles      || window.ConfigManager?.defaultConfig?.g1g2Roles      || {};
    const rbp    = cfg.roleBasePower   || window.ConfigManager?.defaultConfig?.roleBasePower   || {};
    const rel    = cfg.reliabilityTable|| window.ConfigManager?.defaultConfig?.reliabilityTable|| {1:0.40,2:0.65,3:0.85,4:0.90,5:0.95};
    const layers = cfg.scoringLayers   || window.ConfigManager?.defaultConfig?.scoringLayers   || {};
    const roles  = window.ConfigManager?.getRoleNames?.() || [];

    const G1G2_OPTS = [
        { val: 'g1',      label: 'G1 (Going First)',  color: '#a29bfe' },
        { val: 'g2',      label: 'G2 (Going Second)', color: '#fd79a8' },
        { val: 'neutral', label: 'Neutral',            color: '#b2bec3' }
    ];

    const g1g2Rows = roles.length === 0
        ? '<p style="opacity:0.4;font-size:0.82rem;">No hay roles configurados.</p>'
        : roles.map(r => {
            const cur  = g1g2[r] || 'neutral';
            const opts = G1G2_OPTS.map(o =>
                `<option value="${o.val}" ${cur===o.val?'selected':''}>${o.label}</option>`
            ).join('');
            return `<div class="scoring-row">
                <span class="scoring-role-name">${r}</span>
                <select class="keyword-input scoring-sel" onchange="Config.saveG1G2Role('${r}',this.value)">${opts}</select>
            </div>`;
        }).join('');

    const rbpRows = roles.length === 0
        ? '<p style="opacity:0.4;font-size:0.82rem;">No hay roles configurados.</p>'
        : roles.map(r => {
            const val = rbp[r] !== undefined ? rbp[r] : 3;
            return `<div class="scoring-row">
                <span class="scoring-role-name">${r}</span>
                <input type="number" class="keyword-input scoring-num" min="0" max="10" step="0.5"
                    value="${val}" onchange="Config.saveRoleBasePower('${r}',parseFloat(this.value)||0)">
                <span class="scoring-scale">/ 10</span>
            </div>`;
        }).join('');

    const relRows = [1,2,3,4,5].map(n => {
        const val = rel[n] !== undefined ? rel[n] : 0.65;
        return `<div class="scoring-row">
            <span class="scoring-role-name">${n} cop${n===1?'ia':'ias'}</span>
            <input type="number" class="keyword-input scoring-num" min="0" max="1" step="0.05"
                value="${val}" onchange="Config.saveReliabilityEntry(${n},parseFloat(this.value)||0)">
            <span class="scoring-scale">0–1</span>
        </div>`;
    }).join('');

    const LAYER_META = {
        L1: { label: 'L1 — Velocidad', hint: 'Cuándo se activa el efecto', cat: 'condicionActivacion' },
        L2: { label: 'L2 — Coste',     hint: 'Qué hay que pagar',          cat: 'costoActivacion' },
        L4: { label: 'L4 — Restricción', hint: 'Limitaciones de uso',      cat: 'restriccion' },
        L5: { label: 'L5 — Alcance',   hint: 'Qué tan genérico es',        cat: 'efectoGenerico' }
    };

    const layerCols = ['L1','L2','L4','L5'].map(lKey => {
        const layer  = layers[lKey] || { entries: [], nomenclatureCategory: LAYER_META[lKey].cat };
        const entries = (layer.entries || []).map((e, ei) => `
            <div class="scoring-layer-entry">
                <div style="display:flex;gap:4px;align-items:center;margin-bottom:2px;">
                    <input class="keyword-input scoring-layer-kw"
                        placeholder="keywords separadas por coma"
                        value="${(e.keywords||[]).join(', ')}"
                        onchange="Config.saveLayerEntryKeywords('${lKey}',${ei},this.value)">
                    <button class="btn btn-sm btn-danger" onclick="Config.removeLayerEntry('${lKey}',${ei})">✕</button>
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:0.72rem;opacity:0.55;">mult:</span>
                    <input type="number" class="keyword-input scoring-num" min="0" max="2" step="0.05"
                        value="${e.multiplier}"
                        onchange="Config.saveLayerEntryMultiplier('${lKey}',${ei},parseFloat(this.value)||1)">
                </div>
            </div>`).join('');

        return `<div class="scoring-layer-col">
            <div class="scoring-layer-col-title">${LAYER_META[lKey].label}
                <span class="scoring-layer-cat"> (${layer.nomenclatureCategory || LAYER_META[lKey].cat})</span>
            </div>
            <small class="config-help-text" style="display:block;margin-bottom:6px;">${LAYER_META[lKey].hint}</small>
            ${entries || '<p style="font-size:0.78rem;opacity:0.4;margin:4px 0;">Sin entradas</p>'}
            <button class="btn btn-sm" style="margin-top:6px;width:100%;"
                onclick="Config.addLayerEntry('${lKey}')">+ Entrada</button>
        </div>`;
    }).join('');

    return `
        <div class="config-help-text">
            <p>Configura cómo se evalúa cada carta en los scores de <strong>Going First (G1)</strong> y <strong>Going Second (G2)</strong>.</p>
        </div>
        <div class="config-section-block">
            <div class="config-block-title">🎯 Clasificación G1 / G2 por Rol</div>
            <small class="config-help-text">Define si cada rol aporta al G1, G2, o a ambos por igual (Neutral).</small>
            <div class="scoring-grid" style="margin-top:8px;">${g1g2Rows}</div>
        </div>
        <div class="config-section-block">
            <div class="config-block-title">⚡ Poder Base por Rol (L3)</div>
            <small class="config-help-text">Valor 0–10. Punto de partida del Card Score. Distinto al Peso en Pilares.</small>
            <div class="scoring-grid" style="margin-top:8px;">${rbpRows}</div>
        </div>
        <div class="config-section-block">
            <div class="config-block-title">🎲 Fiabilidad por Copias</div>
            <small class="config-help-text">Probabilidad estimada de ver la carta en apertura (0–1).</small>
            <div class="scoring-grid scoring-grid-sm" style="margin-top:8px;">${relRows}</div>
        </div>
        <div class="config-section-block">
            <div class="config-block-title">🔢 Capas de Modificación (L1, L2, L4, L5)</div>
            <small class="config-help-text">Cada capa multiplica el Card Score según keywords encontradas en su categoría. Keywords separadas por coma.</small>
            <div class="scoring-layers-grid">${layerCols}</div>
        </div>
    `;
},

saveG1G2Role: function (roleName, value) {
    const cfg = window.ConfigManager.getConfig();
    if (!cfg.g1g2Roles) cfg.g1g2Roles = {};
    cfg.g1g2Roles[roleName] = value;
    window.ConfigManager.saveConfig(cfg);
},

saveRoleBasePower: function (roleName, value) {
    const cfg = window.ConfigManager.getConfig();
    if (!cfg.roleBasePower) cfg.roleBasePower = {};
    cfg.roleBasePower[roleName] = value;
    window.ConfigManager.saveConfig(cfg);
},

saveReliabilityEntry: function (copies, value) {
    const cfg = window.ConfigManager.getConfig();
    if (!cfg.reliabilityTable) cfg.reliabilityTable = {};
    cfg.reliabilityTable[copies] = Math.min(1, Math.max(0, value));
    window.ConfigManager.saveConfig(cfg);
},

saveLayerEntryKeywords: function (lKey, entryIndex, raw) {
    const cfg = window.ConfigManager.getConfig();
    if (!cfg.scoringLayers) cfg.scoringLayers = JSON.parse(JSON.stringify(window.ConfigManager.defaultConfig.scoringLayers || {}));
    const entry = cfg.scoringLayers?.[lKey]?.entries?.[entryIndex];
    if (!entry) return;
    entry.keywords = raw.split(',').map(s => s.trim()).filter(Boolean);
    window.ConfigManager.saveConfig(cfg);
},

saveLayerEntryMultiplier: function (lKey, entryIndex, val) {
    const cfg = window.ConfigManager.getConfig();
    if (!cfg.scoringLayers) cfg.scoringLayers = JSON.parse(JSON.stringify(window.ConfigManager.defaultConfig.scoringLayers || {}));
    const entry = cfg.scoringLayers?.[lKey]?.entries?.[entryIndex];
    if (!entry) return;
    entry.multiplier = val;
    window.ConfigManager.saveConfig(cfg);
},

addLayerEntry: function (lKey) {
    const cfg = window.ConfigManager.getConfig();
    if (!cfg.scoringLayers) cfg.scoringLayers = JSON.parse(JSON.stringify(window.ConfigManager.defaultConfig.scoringLayers || {}));
    if (!cfg.scoringLayers[lKey]) cfg.scoringLayers[lKey] = { entries: [], nomenclatureCategory: lKey };
    cfg.scoringLayers[lKey].entries.push({ keywords: [], multiplier: 1.0 });
    window.ConfigManager.saveConfig(cfg);
    this.render();
    requestAnimationFrame(() => {
        const sec = document.getElementById('scoring-section');
        if (sec) sec.style.display = 'block';
    });
},

removeLayerEntry: function (lKey, entryIndex) {
    const cfg = window.ConfigManager.getConfig();
    if (cfg.scoringLayers?.[lKey]?.entries) {
        cfg.scoringLayers[lKey].entries.splice(entryIndex, 1);
    }
    window.ConfigManager.saveConfig(cfg);
    this.render();
    requestAnimationFrame(() => {
        const sec = document.getElementById('scoring-section');
        if (sec) sec.style.display = 'block';
    });
},


renderShortcutsSection: function () {
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    const catalog   = window.Shortcuts?.CATALOG || [];
    const MAX       = 6;

    const rows = shortcuts.map((s, i) => `
        <div class="shortcut-row">
            <span class="shortcut-label">⚡ ${s.label}</span>
            <div class="shortcut-row-actions">
                ${i > 0 ? `<button class="btn btn-sm" onclick="Config.moveShortcut(${i}, -1)" title="Subir">↑</button>` : '<span style="width:32px"></span>'}
                ${i < shortcuts.length - 1 ? `<button class="btn btn-sm" onclick="Config.moveShortcut(${i}, 1)" title="Bajar">↓</button>` : '<span style="width:32px"></span>'}
                <button class="btn btn-sm btn-danger" onclick="Config.removeShortcut(${i})" title="Quitar">✕</button>
            </div>
        </div>`).join('');

    const available = catalog.filter(c => !shortcuts.some(s => s.label === c.label));
    const opts = available.length > 0
        ? '<option value="">-- Agregar atajo --</option>' +
          available.map((c, i) => `<option value="${i}">${c.label}</option>`).join('')
        : '<option value="">Todos los atajos ya están agregados</option>';

    const canAdd = shortcuts.length < MAX && available.length > 0;

    return `
        <div class="config-help-text">
            <p>Configura hasta <strong>${MAX} atajos</strong> para el botón flotante ⚡. El orden determina cómo aparecen en el menú.</p>
        </div>
        <div class="shortcuts-config-list">
            ${rows || '<p class="stats-empty" style="margin:0">No hay atajos configurados.</p>'}
        </div>
        ${canAdd ? `
        <div class="add-keyword-container" style="margin-top:12px;">
            <select class="keyword-input" id="shortcut-add-select">${opts}</select>
            <button class="btn btn-sm" onclick="Config.addShortcut()">+ Agregar</button>
        </div>` : `<p style="opacity:0.4;font-size:0.8rem;margin-top:8px;">Máximo de ${MAX} atajos alcanzado.</p>`}`;
},

addShortcut: function () {
    const sel = document.getElementById('shortcut-add-select');
    if (!sel || !sel.value) return;
    const catalog   = window.Shortcuts?.CATALOG || [];
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    const available = catalog.filter(c => !shortcuts.some(s => s.label === c.label));
    const entry     = available[parseInt(sel.value)];
    if (!entry || shortcuts.length >= 6) return;
    shortcuts.push(entry);
    window.ConfigManager.saveShortcuts(shortcuts);
    this.render();
    this._restoreAndScroll('shortcuts-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('shortcuts-section');
        if (sec) sec.style.display = 'block';
    });
},

removeShortcut: function (index) {
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    shortcuts.splice(index, 1);
    window.ConfigManager.saveShortcuts(shortcuts);
    this.render();
    requestAnimationFrame(() => {
        const sec = document.getElementById('shortcuts-section');
        if (sec) sec.style.display = 'block';
    });
},

moveShortcut: function (index, dir) {
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    const newIndex  = index + dir;
    if (newIndex < 0 || newIndex >= shortcuts.length) return;
    [shortcuts[index], shortcuts[newIndex]] = [shortcuts[newIndex], shortcuts[index]];
    window.ConfigManager.saveShortcuts(shortcuts);
    this.render();
    requestAnimationFrame(() => {
        const sec = document.getElementById('shortcuts-section');
        if (sec) sec.style.display = 'block';
    });
},
addPillarRole: function(pillar) {
    const sel = document.getElementById(`pillar-add-${pillar}`);
    if (!sel || !sel.value) return;
    if (ConfigManager.addRoleToPillar(pillar, sel.value)) {
        this.render();
    this._restoreAndScroll('pillar-section', `pillar-anchor-${pillar}`);
    }
},

removePillarRole: function(pillar, role) {
    if (ConfigManager.removeRoleFromPillar(pillar, role)) {
        this.render();
        this._restoreAndScroll('pillar-section', `pillar-anchor-${pillar}`);
    }
},
updateRPSRule: function (index, position, value) {
    const rps = ConfigManager.getPillarRPS();
    if (!rps[index]) return;
    rps[index][position] = value;
    ConfigManager.savePillarRPS(rps);
},
duplicateRole: function(roleName) {
    const newName = ConfigManager.duplicateRole(roleName);
    if (!newName) return;
    this.render();
    this._restoreAndScroll('roles-section', `role-anchor-${CSS.escape(newName)}`);
},
renderMusicSection: function () {
    const cfg    = window.ConfigManager ? ConfigManager.getMusicConfig() : ConfigManager.defaultMusicConfig;
    const tracks = cfg.tracks || {};
    const volume = cfg.volume ?? 0.40;
    const enabled = cfg.enabled !== false;

    // 10 pistas fijas en ots/, nombradas Climax_Theme_1.mp3 ... Climax_Theme_10.mp3
    const MUSIC_TRACKS = Array.from({ length: 10 }, (_, i) => {
        const n = i + 1;
        return { path: `ots/Climax_Theme_${n}.mp3`, label: `Tema ${n}` };
    });

    const row = (key, label) => `
        <div class="music-track-row">
            <label class="music-track-label">${label}</label>
            <select class="config-input music-track-input" id="music-track-${key}">
                ${MUSIC_TRACKS.map(t => `
                    <option value="${t.path}" ${tracks[key] === t.path ? 'selected' : ''}>${t.label}</option>
                `).join('')}
            </select>
        </div>`;

    return `
        <div class="music-config-block">
            <label class="music-enable-label">
                <input type="checkbox" id="music-enabled-cb" ${enabled ? 'checked' : ''}>
                Activar música de fondo
            </label>

            <div class="music-volume-row">
                <span class="music-track-label">Volumen</span>
                <input type="range" id="music-volume-slider"
                       min="0" max="1" step="0.05" value="${volume}"
                       oninput="Config.onVolumeChange(this.value)">
                <span id="music-volume-display" class="music-volume-display">
                    ${Math.round(volume * 100)}%
                </span>
            </div>

            <div class="music-tracks-block">
                <div class="music-tracks-title">Pistas por Perfil</div>
                ${row('default',     '🎵 Por defecto')}
                ${row('novato',      '🌱 Novato')}
                ${row('casual',      '🃏 Casual')}
                ${row('competitivo', '⚔️ Competitivo')}
            </div>

            <button class="btn btn-primary" onclick="Config.saveMusicConfig()" style="margin-top:12px;">
                Guardar Ajustes de Música
            </button>
        </div>`;
},

saveMusicConfig: function () {
    const enabled = document.getElementById('music-enabled-cb')?.checked !== false;
    const volume  = parseFloat(document.getElementById('music-volume-slider')?.value ?? 0.40);
    const tracks  = {
        default:     (document.getElementById('music-track-default')?.value     || 'ots/Climax_Theme_2.mp3').trim(),
        novato:      (document.getElementById('music-track-novato')?.value      || 'ots/Climax_Theme_5.mp3').trim(),
        casual:      (document.getElementById('music-track-casual')?.value      || 'ots/Climax_Theme_5.mp3').trim(),
        competitivo: (document.getElementById('music-track-competitivo')?.value || 'ots/Climax_Theme_5.mp3').trim()
    };
    const cfg = { enabled, volume, tracks };
    if (window.ConfigManager) ConfigManager.saveMusicConfig(cfg);
    if (window.MusicPlayer) {
        MusicPlayer.setVolume(volume);
        MusicPlayer.setEnabled(enabled);
    }
    const disp = document.getElementById('music-volume-display');
    if (disp) disp.textContent = Math.round(volume * 100) + '%';
},

onVolumeChange: function (val) {
    const disp = document.getElementById('music-volume-display');
    if (disp) disp.textContent = Math.round(parseFloat(val) * 100) + '%';
    if (window.MusicPlayer) MusicPlayer.setVolume(parseFloat(val));
},
renderPlayerLevelSection: function () {
    const current = window.ConfigManager ? ConfigManager.getPlayerLevel() : 'default';
    const levels = [
        { key: 'novato',      icon: '🌱', label: 'Novato',      desc: 'Aprende las bases del juego y la app',           color: '#00b894' },
        { key: 'casual',      icon: '🃏', label: 'Casual',      desc: 'Construye decks y juega por diversión',           color: '#fdcb6e' },
        { key: 'competitivo', icon: '⚔️', label: 'Competitivo', desc: 'Analiza el meta y optimiza tu estrategia',        color: '#d63031' },
    ];

    const buttons = levels.map(l => {
        const isActive = current === l.key;
        const border   = isActive ? `2px solid ${l.color}` : '1px solid rgba(255,255,255,0.1)';
        const bg       = isActive ? `${l.color}18` : 'transparent';
        return `
            <button class="welcome-btn"
                    style="border:${border};background:${bg};cursor:pointer;"
                    onclick="Config.selectPlayerLevel('${l.key}')">
                <span class="wb-icon">${l.icon}</span>
                <span>
                    <span class="wb-label" style="color:${l.color}">${l.label}${isActive ? ' ✓' : ''}</span>
                    <span class="wb-desc">${l.desc}</span>
                </span>
            </button>`;
    }).join('');

    return `
        <div class="config-help-text">
            <p>Cambia tu perfil en cualquier momento. Activa automáticamente la pista musical asociada.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;max-width:480px;">
            ${buttons}
        </div>`;
},

selectPlayerLevel: function (levelKey) {
    if (window.ConfigManager) ConfigManager.savePlayerLevel(levelKey);
    if (window.ContentManager) ContentManager.applyProfile(levelKey);
    if (window.MusicPlayer) {
        const cfg  = window.ConfigManager ? ConfigManager.getMusicConfig() : {};
        const path = cfg.tracks?.[levelKey] || 'ots/Climax_Theme_2.mp3';
        MusicPlayer.setTrack(path);
    }
    this.render();
    this._restoreAndScroll('player-level-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('player-level-section');
        if (sec) sec.style.display = 'block';
    });
},
// ===============================
renderMetaLinksSection: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Define los enlaces que se mostrarán en la pestaña Meta como frames de navegación.
        </p>
        <div class="meta-links-list" id="config-meta-links-list">
            ${links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('')}
        </div>
        <button class="meta-links-add-btn" onclick="Config.addMetaLink()">+ Agregar fuente</button>
        <br>
        <button class="meta-links-save-btn" onclick="Config.saveMetaLinks()">💾 Guardar fuentes</button>
    `;
},

_renderMetaLinkItem: function (lk, i) {
    return `
        <div class="meta-link-item" id="meta-link-item-${i}">
            <div class="meta-link-item-header">
                <span class="meta-link-index">#${i + 1}</span>
                <button class="meta-link-del-btn" onclick="Config.removeMetaLink(${i})">✕ Eliminar</button>
            </div>
            <div class="meta-link-field">
                <label>Título</label>
                <input type="text" id="ml-title-${i}" value="${this._escVal(lk.title)}" placeholder="Ej: Master Duel Meta – Tier List">
            </div>
            <div class="meta-link-field">
                <label>URL</label>
                <input type="url" id="ml-url-${i}" value="${this._escVal(lk.url)}" placeholder="https://...">
            </div>
            <div class="meta-link-field">
                <label>Descripción</label>
                <textarea id="ml-desc-${i}" placeholder="Descripción breve...">${this._escVal(lk.desc)}</textarea>
            </div>
        </div>
    `;
},

_escVal: function (str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
},

addMetaLink: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.push({ id: 'ml_' + Date.now(), title: '', url: '', desc: '' });
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

removeMetaLink: function (index) {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.splice(index, 1);
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

saveMetaLinks: function () {
    const list = document.getElementById('config-meta-links-list');
    if (!list || !window.ConfigManager) return;
    const links = [];
    list.querySelectorAll('.meta-link-item').forEach((item, i) => {
        links.push({
            id:    'ml_' + i,
            title: (document.getElementById(`ml-title-${i}`)?.value || '').trim(),
            url:   (document.getElementById(`ml-url-${i}`)?.value   || '').trim(),
            desc:  (document.getElementById(`ml-desc-${i}`)?.value  || '').trim()
        });
    });
    ConfigManager.saveMetaLinks(links);
    alert('Fuentes guardadas. Los cambios se verán la próxima vez que abras la pestaña Meta.');
},

_reRenderMetaLinks: function (links) {
    const list = document.getElementById('config-meta-links-list');
    if (!list) return;
    list.innerHTML = links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('');
},
// ===============================
_META_FORMATS: ['TCG', 'OCG', 'Genesys', 'Master Duel', 'Duel Links', 'Time Wizard', 'Todos'],

renderMetaMastersSection: function () {
    const masters = window.ConfigManager ? ConfigManager.getMetaMasters() : [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Configura los creadores de contenido que aparecen en la pestaña Meta. Pega la URL del video de YouTube que quieras mostrar.
        </p>
        <div class="meta-masters-list" id="config-meta-masters-list">
            ${masters.map((m, i) => this._renderMetaMasterItem(m, i)).join('')}
        </div>
        <div class="meta-masters-btns">
            <button class="meta-masters-add-btn" onclick="Config.addMetaMaster()">+ Agregar maestro</button>
            <button class="meta-masters-save-btn" onclick="Config.saveMetaMasters()">💾 Guardar maestros</button>
        </div>
    `;
},

_renderMetaMasterItem: function (m, i) {
    const formats   = Array.isArray(m.formats) ? m.formats : [];
    const allFmts   = this._META_FORMATS;
    const checkboxes = allFmts.map(f => {
        const checked = formats.includes(f) ? 'checked' : '';
        return `<label class="meta-format-check-label">
            <input type="checkbox" value="${f}" ${checked} class="mm-fmt-${i}"> ${f}
        </label>`;
    }).join('');

    return `
        <div class="meta-master-item" id="meta-master-item-${i}">
            <div class="meta-master-item-header">
                <span class="meta-master-index">#${i + 1}</span>
                <button class="meta-master-del-btn" onclick="Config.removeMetaMaster(${i})">✕ Eliminar</button>
            </div>
            <div class="meta-master-field">
                <label>Nombre del Canal / Creador</label>
                <input type="text" id="mm-name-${i}" value="${this._escVal(m.name)}" placeholder="Ej: Team APS">
            </div>
            <div class="meta-master-field">
                <label>Título / Descripción corta</label>
                <input type="text" id="mm-title-${i}" value="${this._escVal(m.title)}" placeholder="Ej: El mejor canal de meta TCG">
            </div>
            <div class="meta-master-field">
                <label>URL del Video (YouTube)</label>
                <input type="url" id="mm-video-${i}" value="${this._escVal(m.videoUrl)}" placeholder="https://www.youtube.com/watch?v=...">
            </div>
            <div class="meta-master-field">
                <label>URL del Canal</label>
                <input type="url" id="mm-channel-${i}" value="${this._escVal(m.channelUrl)}" placeholder="https://www.youtube.com/@...">
            </div>
            <div class="meta-master-field">
                <label>Imagen/Video alternativo si el video no carga</label>
                <input type="url" id="mm-fallback-${i}" value="${this._escVal(m.fallbackUrl)}" placeholder="https://... o usa el botón para elegir archivo">
                <div style="display:flex;align-items:center;gap:8px;margin-top:5px;">
                    <button class="meta-master-file-btn" onclick="Config._pickFallbackFile(${i})">📁 Elegir archivo local</button>
                    ${m.fallbackUrl && m.fallbackUrl.startsWith('data:')
                        ? `<span style="font-size:0.72rem;color:rgba(255,215,0,0.6);">✔ Archivo local cargado</span>`
                        : ''}
                </div>
                <input type="file" id="mm-fallback-file-${i}" accept="image/*,video/mp4"
                    style="display:none;" onchange="Config._onFallbackFileChange(${i}, this)">
            </div>     
            <div class="meta-master-field">
                <label>Formato Especializado</label>
                <div class="meta-formats-check-grid">${checkboxes}</div>
            </div>
        </div>
    `;
},
_pickFallbackFile: function (i) {
    document.getElementById(`mm-fallback-file-${i}`)?.click();
},

_onFallbackFileChange: function (i, input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
        alert('El archivo es demasiado grande (máx. 1.5 MB). Usa una URL externa para archivos más pesados.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const urlInput = document.getElementById(`mm-fallback-${i}`);
        if (urlInput) {
            urlInput.value = e.target.result;
            urlInput.dispatchEvent(new Event('input'));
        }
        // Feedback visual
        const btn = input.previousElementSibling?.querySelector('.meta-master-file-btn');
        if (btn) btn.textContent = `✔ ${file.name}`;
    };
    reader.readAsDataURL(file);
},
addMetaMaster: function () {
    const list = document.getElementById('config-meta-masters-list');
    if (!list) return;
    const currentCount = list.querySelectorAll('.meta-master-item').length;
    const emptyMaster  = { id: 'mm_' + Date.now(), name: '', title: '', videoUrl: '', channelUrl: '', formats: [], fallbackUrl: '' };
    list.insertAdjacentHTML('beforeend', this._renderMetaMasterItem(emptyMaster, currentCount));
},

removeMetaMaster: function (index) {
    const item = document.getElementById(`meta-master-item-${index}`);
    if (!item) return;
    item.remove();
    // Re-indexar los items restantes en el DOM
    const list  = document.getElementById('config-meta-masters-list');
    if (!list) return;
    const items = list.querySelectorAll('.meta-master-item');
    items.forEach((el, i) => {
        el.id = `meta-master-item-${i}`;
        const idx = el.querySelector('.meta-master-index');
        if (idx) idx.textContent = `#${i + 1}`;
    });
},
saveMetaMasters: function () {
    const list = document.getElementById('config-meta-masters-list');
    if (!list || !window.ConfigManager) return;
    const items   = list.querySelectorAll('.meta-master-item');
    const masters = [];
    items.forEach((item, i) => {
        const fmtChecks = item.querySelectorAll(`.mm-fmt-${i}:checked`);
        const formats   = Array.from(fmtChecks).map(cb => cb.value);
        masters.push({
            id:         'mm_' + i,
            name:       (document.getElementById(`mm-name-${i}`)?.value    || '').trim(),
            title:      (document.getElementById(`mm-title-${i}`)?.value   || '').trim(),
            videoUrl:   (document.getElementById(`mm-video-${i}`)?.value   || '').trim(),
            channelUrl: (document.getElementById(`mm-channel-${i}`)?.value || '').trim(),
            fallbackUrl: (document.getElementById(`mm-fallback-${i}`)?.value || '').trim(),
            formats
        });
    });
    ConfigManager.saveMetaMasters(masters);
    alert('Maestros guardados. Los cambios se verán la próxima vez que abras la pestaña Meta.');
},

_reRenderMetaMasters: function (masters) {
    const list = document.getElementById('config-meta-masters-list');
    if (!list) return;
    list.innerHTML = masters.map((m, i) => this._renderMetaMasterItem(m, i)).join('');
},

// ===============================
_FORM_PLATFORMS: ['PC', 'GBC', 'GBA', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'Físico'],

renderFormacionGamesSection: function () {
    const games = window.ConfigManager?.getFormacionGames?.() ?? [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Configura los juegos alternativos de Yu-Gi-Oh! que aparecen en la pestaña Formación.
        </p>
        <div class="form-games-list" id="config-form-games-list">
            ${games.map((g, i) => this._renderFormGameItem(g, i)).join('')}
        </div>
        <button class="form-games-add-btn" onclick="Config.addFormGame()">+ Agregar juego</button>
        <br>
        <button class="form-games-save-btn" onclick="Config.saveFormGames()">💾 Guardar juegos</button>
    `;
},

_renderFormGameItem: function (g, i) {
    const platforms  = Array.isArray(g.platforms) ? g.platforms : [];
    const checkboxes = this._FORM_PLATFORMS.map(p => {
        const checked = platforms.includes(p) ? 'checked' : '';
        return `<label class="form-platform-check-label">
            <input type="checkbox" value="${p}" ${checked} class="fg-plt-${i}"> ${p}
        </label>`;
    }).join('');

    return `
        <div class="form-game-item" id="form-game-item-${i}">
            <div class="form-game-item-header">
                <span class="form-game-index">#${i + 1}</span>
                <button class="form-game-del-btn" onclick="Config.removeFormGame(${i})">✕ Eliminar</button>
            </div>
            <div class="form-game-field">
                <label>Nombre del juego</label>
                <input type="text" id="fg-name-${i}" value="${this._escVal(g.name)}" placeholder="Ej: Yu-Gi-Oh! Forbidden Memories">
            </div>
            <div class="form-game-field">
                <label>Descripción corta</label>
                <input type="text" id="fg-title-${i}" value="${this._escVal(g.title)}" placeholder="Ej: Clásico de PS1">
            </div>
            <div class="form-game-field">
                <label>Link (al hacer click en la tarjeta)</label>
                <input type="url" id="fg-link-${i}" value="${this._escVal(g.link)}" placeholder="https://...">
            </div>
            <div class="form-game-field">
                <label>Imagen de portada (URL o archivo local)</label>
                <input type="url" id="fg-fallback-${i}" value="${this._escVal(g.fallbackUrl)}" placeholder="https://... o usa el botón">
                <div style="display:flex;align-items:center;gap:8px;margin-top:5px;">
                    <button class="form-game-file-btn" onclick="Config._pickFormGameFile(${i})">📁 Elegir archivo local</button>
                    ${g.fallbackUrl?.startsWith('local:') ? `<span style="font-size:0.72rem;color:rgba(255,215,0,0.6);">✔ Archivo local cargado</span>` : ''}
                </div>
                <input type="file" id="fg-fallback-file-${i}" accept="image/*"
                       style="display:none;" onchange="Config._onFormGameFileChange(${i}, this)">
            </div>
            <div class="form-game-field">
                <label>Plataforma</label>
                <div class="form-platforms-check-grid">${checkboxes}</div>
            </div>
        </div>
    `;
},

addFormGame: function () {
    const list = document.getElementById('config-form-games-list');
    if (!list) return;
    const i     = list.querySelectorAll('.form-game-item').length;
    const empty = { id: 'fg_' + Date.now(), name: '', title: '', link: '', fallbackUrl: '', platforms: [] };
    list.insertAdjacentHTML('beforeend', this._renderFormGameItem(empty, i));
},

removeFormGame: function (index) {
    const item = document.getElementById(`form-game-item-${index}`);
    if (!item) return;
    item.remove();
    const list  = document.getElementById('config-form-games-list');
    if (!list) return;
    list.querySelectorAll('.form-game-item').forEach((el, i) => {
        el.id = `form-game-item-${i}`;
        const idx = el.querySelector('.form-game-index');
        if (idx) idx.textContent = `#${i + 1}`;
    });
},

saveFormGames: function () {
    const list = document.getElementById('config-form-games-list');
    if (!list || !window.ConfigManager) return;
    const games = [];
    list.querySelectorAll('.form-game-item').forEach((item, i) => {
        const fmtChecks = item.querySelectorAll(`.fg-plt-${i}:checked`);
        games.push({
            id:          'fg_' + i,
            name:        (document.getElementById(`fg-name-${i}`)?.value     || '').trim(),
            title:       (document.getElementById(`fg-title-${i}`)?.value    || '').trim(),
            link:        (document.getElementById(`fg-link-${i}`)?.value     || '').trim(),
            fallbackUrl: (document.getElementById(`fg-fallback-${i}`)?.value || '').trim(),
            platforms:   Array.from(fmtChecks).map(cb => cb.value)
        });
    });
    ConfigManager.saveFormacionGames(games);
    alert('Juegos guardados. Los cambios se verán la próxima vez que abras la pestaña Formación.');
},

_pickFormGameFile: function (i) {
    document.getElementById(`fg-fallback-file-${i}`)?.click();
},

_onFormGameFileChange: function (i, input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
        alert('Máx. 1.5 MB. Usa una URL externa para archivos más pesados.');
        return;
    }
    const reader  = new FileReader();
    reader.onload = (e) => {
        const gameId = `fg_${i}`;
        const ok     = ConfigManager.saveFormacionFallback(gameId, e.target.result);
        if (!ok) { alert('Almacenamiento lleno. Usa una URL externa.'); return; }
        const urlInput = document.getElementById(`fg-fallback-${i}`);
        if (urlInput) urlInput.value = `local:${gameId}`;
        const btn = document.querySelector(`#form-game-item-${i} .form-game-file-btn`);
        if (btn) btn.textContent = `✔ ${file.name}`;
    };
    reader.readAsDataURL(file);
},
renderFormacionTopicsSection: function () {
    const allTopics = window.Formacion?.TOPICS ?? [{ id: 'que-es-yugioh', label: '¿Qué es Yu-Gi-Oh!?' }];
    const cfg       = window.ConfigManager?.getFormacionTopicsConfig?.() ?? {};
    const mastered  = JSON.parse(localStorage.getItem('yugioh_formacion_mastered') || '[]');

    const rows = allTopics.map(t => {
        const topicCfg     = cfg[t.id] || {};
        const isActive     = topicCfg.active !== false;
        const hideOnMaster = topicCfg.hideOnMaster !== false;
        const isMastered   = mastered.includes(t.id);
        return `
            <div style="display:flex;align-items:center;justify-content:space-between;
                        padding:10px 12px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,215,0,0.1);
                        border-radius:8px;gap:12px;flex-wrap:wrap;">
                <div>
                    <span style="font-size:0.88rem;color:#f1f1f1;font-weight:600;">${t.label}</span>
                    ${isMastered ? '<span style="font-size:0.72rem;color:#2ecc71;margin-left:8px;">✅ Dominado</span>' : ''}
                </div>
                <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
                    <label style="font-size:0.78rem;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" ${isActive ? 'checked' : ''}
                               onchange="Config._saveTopicCfg('${t.id}','active',this.checked)"
                               style="accent-color:#FFD700;">
                        Activo (visible)
                    </label>
                    <label style="font-size:0.78rem;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" ${hideOnMaster ? 'checked' : ''}
                               onchange="Config._saveTopicCfg('${t.id}','hideOnMaster',this.checked)"
                               style="accent-color:#FFD700;">
                        Ocultar al dominar
                    </label>
                    ${isMastered ? `
                        <button onclick="Config._resetTopicMastered('${t.id}')"
                                style="background:rgba(214,48,49,0.15);border:1px solid rgba(214,48,49,0.3);
                                       color:#ff7675;border-radius:5px;padding:3px 9px;font-size:0.72rem;cursor:pointer;">
                            Restablecer
                        </button>` : ''}
                </div>
            </div>
        `;
    }).join('');

    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Activa/desactiva temas y controla si se ocultan al ser dominados.
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
    `;
},

_saveTopicCfg: function (topicId, key, value) {
    if (!window.ConfigManager) return;
    const cfg         = ConfigManager.getFormacionTopicsConfig();
    if (!cfg[topicId]) cfg[topicId] = {};
    cfg[topicId][key] = value;
    ConfigManager.saveFormacionTopicsConfig(cfg);
},

_resetTopicMastered: function (topicId) {
    const mastered = JSON.parse(localStorage.getItem('yugioh_formacion_mastered') || '[]')
        .filter(id => id !== topicId);
    localStorage.setItem('yugioh_formacion_mastered', JSON.stringify(mastered));
    this.render();
    this._restoreAndScroll('formacion-topics-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('formacion-topics-section');
        if (sec) sec.style.display = 'block';
    });
},
};

window.Config = Config;
document.addEventListener('DOMContentLoaded', () => Config.init());



// ── Welcome — panel overlay de bienvenida con selección de perfil; MusicPlayer para música de fondo ──

const Welcome = {

    audio: null,
    shown: false,
    dismissed: false,
init: function () {
    if (localStorage.getItem('dd_welcome_dismissed') === 'true') return;
    if (this.dismissed) return;
    this.createPanel();
},
    createPanel: function () {
        const overlay = document.createElement('div');
        overlay.id = 'welcome-overlay';
        overlay.innerHTML = `
            <div class="welcome-panel">

                <div class="welcome-logo-wrap">
                    <img src="img/LOGO - Destiny Draw Yugioh APP.png"
                         alt="Destiny Draw"
                         class="welcome-logo"
                         onerror="this.style.display='none'; document.getElementById('welcome-title-fallback').style.display='block';">
                    <h1 id="welcome-title-fallback" class="welcome-title-fallback" style="display:none;">
                        ✦ Destiny Draw ✦
                    </h1>
                </div>

                <p class="welcome-subtitle">Tu compañero estratégico para Yu-Gi-Oh!</p>
                <p class="welcome-desc">
                    Busca cartas, construye tu deck, analiza el meta y lleva tu juego al siguiente nivel.
                    ¿Cómo describes tu experiencia?
                </p>

                <div class="welcome-buttons">

                    <button class="welcome-btn welcome-btn-novato"
                        onclick="Welcome.enter('formacion', 'novato')"
                    <span class="wb-icon">🌱</span>
                    <span class="wb-label">Novato</span>
                    <span class="wb-desc">Aprende las bases del juego y la app</span>
                </button>

                <button class="welcome-btn welcome-btn-casual"
                        onclick="Welcome.enter('mideck', 'casual')"
                    <span class="wb-icon">🃏</span>
                    <span class="wb-label">Casual</span>
                    <span class="wb-desc">Construye decks y juega por diversión</span>
                </button>

                <button class="welcome-btn welcome-btn-competitivo"
                        onclick="Welcome.enter('buscador', 'competitivo')"
                    <span class="wb-icon">⚔️</span>
                    <span class="wb-label">Competitivo</span>
                    <span class="wb-desc">Analiza el meta y optimiza tu estrategia</span>
                </button>

                </div>

               <button class="welcome-skip" onclick="Welcome.enter('buscador', 'default')">
                    Entrar sin seleccionar
                </button>

                <div class="welcome-music-ctrl">
                    <button onclick="Welcome.toggleMusic()" id="welcome-music-btn" title="Silenciar/Activar música">
                        🔊
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add('welcome-visible');
            });
        });
    },


    toggleMusic: function () {
        const btn = document.getElementById('welcome-music-btn');
        if (!this.audio) return;
        if (this.audio.paused) {
            this.audio.play().catch(() => {});
            if (btn) btn.textContent = '🔊';
        } else {
            this.audio.pause();
            if (btn) btn.textContent = '🔇';
        }
    },
enter: function (tabName, levelKey) {
    if (window.ContentManager && levelKey) ContentManager.applyProfile(levelKey);
    if (window.ConfigManager  && levelKey) ConfigManager.savePlayerLevel(levelKey);
    if (window.MusicPlayer) {
        const cfg   = window.ConfigManager ? ConfigManager.getMusicConfig() : {};
        const path  = cfg.tracks?.[levelKey] || 'ots/Climax_Theme_2.mp3';
        MusicPlayer.setTrack(path);
    }
    this.dismiss();
    if (window.ContentManager) ContentManager.applyProfile(levelKey);
    if (window.Navigation) Navigation.showTab(tabName);
},


startMusic: function (path) {
    if (this.audio && !this.audio.paused && this.audio._path === path) return;
    if (this.audio) {
        this.audio.stop();
        this.audio.currentTime = 0;
    }
    try {
        this.audio = new Audio(path);
        this.audio._path = path;
        this.audio.loop   = true;
        this.audio.volume = 0.40;
        this.audio.play().catch(() => {});
    } catch (_) {}
},

stopMusic: function () {
    if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio = null;
    }
},

dismiss: function () {
    localStorage.setItem('dd_welcome_dismissed', 'true');
    Welcome.dismissed = true;
    // NO se llama stopMusic — la música sigue sonando

    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;

    overlay.classList.remove('welcome-visible');
    overlay.classList.add('welcome-hiding');

    setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 500);
},
};
const MusicPlayer = {
    audio:       null,
    currentPath: null,

    init: function () {
        const cfg = window.ConfigManager ? ConfigManager.getMusicConfig() : { enabled: true, volume: 0.40, tracks: {} };
        const level = window.ConfigManager ? ConfigManager.getPlayerLevel() : 'default';
        this.currentPath = cfg.tracks?.[level] || cfg.tracks?.default || 'ots/Climax_Theme_2.mp3';
        this._buildAudio(this.currentPath, cfg.volume ?? 0.40);
        if (cfg.enabled !== false) this._createButton();
    },

    setTrack: function (path) {
        const cfg      = window.ConfigManager ? ConfigManager.getMusicConfig() : {};
        if (cfg.enabled === false) return;
        const playing  = this.audio && !this.audio.paused;
        this.currentPath = path;
        this._buildAudio(path, cfg.volume ?? 0.40);
        if (playing) this.audio.play().catch(() => {});
        this._updateButton();
    },

    _buildAudio: function (path, volume) {
        if (this.audio) { this.audio.pause(); this.audio = null; }
        try {
            this.audio        = new Audio(path);
            this.audio.loop   = true;
            this.audio.volume = Math.min(1, Math.max(0, volume ?? 0.40));
        } catch (_) {}
    },

    toggle: function () {
        const cfg = window.ConfigManager ? ConfigManager.getMusicConfig() : {};
        if (cfg.enabled === false) return;

        const level = window.ConfigManager ? ConfigManager.getPlayerLevel() : 'default';
        const path  = cfg.tracks?.[level] || cfg.tracks?.default || 'ots/Climax_Theme_2.mp3';

        if (this.audio && !this.audio.paused) {
            // STOP — detiene y resincroniza pista con el perfil activo
            this.audio.pause();
            if (path !== this.currentPath) {
                this.currentPath = path;
                this._buildAudio(path, cfg.volume ?? 0.40); // queda pausado en 0
            } else {
                this.audio.currentTime = 0;
            }
        } else {
            // PLAY — verifica que la pista sea la del perfil activo
            if (!this.audio || path !== this.currentPath) {
                this.currentPath = path;
                this._buildAudio(path, cfg.volume ?? 0.40);
            }
            this.audio.play().catch(() => {});
        }
        this._updateButton();
    },

    setVolume: function (vol) {
        if (this.audio) this.audio.volume = Math.min(1, Math.max(0, parseFloat(vol)));
    },

    setEnabled: function (enabled) {
        if (!enabled && this.audio) this.audio.pause();
        const btn = document.getElementById('music-float-btn');
        if (btn) btn.style.display = enabled ? '' : 'none';
        this._updateButton();
    },

    _createButton: function () {
        if (document.getElementById('music-float-btn')) return;
        const btn     = document.createElement('button');
        btn.id        = 'music-float-btn';
        btn.className = 'music-float-btn';
        btn.onclick = function () { MusicPlayer.toggle(); };
        (document.getElementById('bottom-toolbar') || document.body).appendChild(btn);
        this._updateButton();
    },

    _updateButton: function () {
        const btn = document.getElementById('music-float-btn');
        if (!btn) return;
        const playing   = this.audio && !this.audio.paused;
        btn.textContent = playing ? '⏹ Stop' : '▶ Play';
        btn.title       = playing ? 'Detener música' : 'Reproducir música';
    }
};

window.MusicPlayer = MusicPlayer;
document.addEventListener('DOMContentLoaded', () => MusicPlayer.init());

window.Welcome = Welcome;
document.addEventListener('DOMContentLoaded', () => Welcome.init());



// ── HelpPanel — botón flotante ? con panel de ayuda contextual por pestaña y FAQ ──

const HelpPanel = {
    activeTab: 'help',
    isOpen: false,
    // Contenido de ayuda por pestaña activa
    tabContent: {
    lobby: `
        <h4>🏠 Lobby</h4>
        <p>Pantalla de inicio de la app.</p>
        <ul>
            <li><strong>Lo Nuevo:</strong> tira con las últimas cartas lanzadas en TCG/OCG en el último mes (se actualiza cada 30 min). Toca una carta para abrir su Vista de Carta.</li>
            <li><strong>Sugerencias:</strong> accesos aleatorios a otras secciones de la app (Simuladores, Optimización, Buscador por arquetipo, Config, etc.). Usa "🔀 Otras sugerencias" para re-randomizar, o toca una tarjeta para ir directo. Sección colapsable.</li>
            <li><strong>Aviso de actualización:</strong> resumen de novedades de la versión actual. Aparece una sola vez por versión.</li>
        </ul>`,

    buscador: `
        <h4>🔍 Buscador de Cartas</h4>
        <h4>🔍 Buscador de Cartas</h4>
        <p>Busca cualquier carta de Yu-Gi-Oh! por nombre, arquetipo, set o palabras clave en su efecto.</p>
        <ul>
            <li>Escribe el nombre (o parte) y presiona Enter o el botón Buscar.</li>
            <li>Usa <strong>Carta Random</strong> (🎲) para obtener una carta aleatoria del pool actual.</li>
            <li>Usa <strong>Filtros avanzados</strong> para filtrar por tipo de carta, atributo, subtipo (Fusion, Synchro, XYZ, Link, Pendulum), tipo de monstruo, nivel/rango, ATK, DEF y Link Rating.</li>
            <li>El selector de Arquetipo y el de Packs/Sets permiten búsquedas muy específicas.</li>
            <li>Toca la imagen de la carta para abrir su <strong>Vista de Carta</strong> detallada.</li>
            <li>Desde la Vista puedes agregarla al Main, Extra o Side Deck, marcarla como Staple o Favorita, ver sus roles detectados, aporte estimado al deck y estado de banlist.</li>
            <li>El efecto de la carta se resalta por segmentos según la Nomenclatura configurada en Config.</li>
        </ul>`,

    mideck: `
        <h4>🃏 Mi Deck</h4>
        <p>Tu espacio de construcción y gestión de mazos.</p>
        <ul>
            <li><strong>Decklist / Construcción:</strong> sub-tabs para ver tus cartas o armar el deck desde el sidebar.</li>
            <li><strong>Sidebar:</strong> accede a Engines (combos guardados), Decks guardados, Staples del formato y tus Favoritas.</li>
            <li><strong>Composición:</strong> muestra tipos, atributos, niveles y balance de tu deck en tiempo real.</li>
            <li><strong>Roles:</strong> asigna roles a cada carta (desde el botón en su chip) para que los scores los consideren. Los roles se detectan automáticamente al agregar una carta; puedes sobreescribirlos manualmente.</li>
            <li><strong>Carta As:</strong> marca una carta como ícono del deck — será su imagen en la lista de decks guardados.</li>
            <li><strong>Importar .ydk:</strong> carga un deck completo desde un archivo .ydk (formato YGOPro / EDOPro). Muestra pantalla de carga mientras consulta la API.</li>
            <li><strong>Exportar .ydk:</strong> descarga el deck activo en formato .ydk para usar en otras plataformas o compartir.</li>
            <li><strong>Guardar / Cargar:</strong> guarda el deck activo en la app o carga uno guardado previamente.</li>
            <li><strong>Internal Score y Análisis:</strong> visibles en el sub-tab Construcción. Se recalculan automáticamente con cada cambio.</li>
            <li><strong>Optimización:</strong> sub-tab con <strong>Nivel como Piloto del Deck</strong> (dominio del deck según rondas registradas), <strong>Complejidad del Deck</strong> (evaluación de dificultad), <strong>Notas del Deck</strong> y <strong>Historial de Enfrentamientos</strong> (W/L manual por rival). Aquí también registras cada ronda jugada (rival, resultado, going first/second) para alimentar el <strong>Historial de Sesiones</strong>.</li>
            <li><strong>Importar Lista Oficial (.pdf):</strong> lee el PDF de torneo de Konami y arma el deck automáticamente detectando Main, Extra y Side por encabezados de columna.</li>
            <li><strong>Side Deck:</strong> al mover una carta al Side Deck, un panel te pregunta cuántas copias enviar (por defecto todas). Podés dejar, por ejemplo, 2 copias en Main y sidear solo 1 — competitivamente útil para planes de juego que cambian según el rival.</li>
            <li><strong>Tu Experiencia con el Deck:</strong> 6 sub-tabs — Perfil (dificultad, estrategia, variante), Manos Muertas, Composición automática, Cartas Destacadas, Sets involucrados y Rendimiento (gráfico de araña + winrate).</li>
            <li><strong>Línea de Combos:</strong> mapea combos por zonas (mano, campo, cementerio, baneadas) con starters/Boss Monster auto-detectados, choke points, restricciones, interacciones y endboard. Incluye un <strong>modo de ejecución paso a paso</strong> (robar, mover cartas, log de jugadas) para simular la línea jugada a jugada, y exporta/importa como .txt.</li>
            <li><strong>Cartas Clave y Amenazas:</strong> ranking de cartas marcadas como clave o amenaza del rival durante las rondas de Optimización.</li>
            <li><strong>Historial de Versiones:</strong> cada guardado del deck queda registrado con diff de cambios y comentario editable.</li>
        </ul>`,

    estadisticas: `
        <h4>📊 Estadísticas</h4>
        <p>El centro de análisis. Usa los scores para tomar decisiones de construcción basadas en datos.</p>
        <ul>
            <li><strong>Internal Score:</strong> mide la calidad técnica del deck activo en tres pilares — Consistencia, Potencia y Resiliencia — según los roles asignados y sus pesos. Se recalcula con cada cambio del deck.</li>
            <li><strong>G1/G2 Score:</strong> perfil Going First vs Going Second del deck. Depende de la clasificación G1/G2 de cada rol y las capas de modificación configuradas en Config.</li>
            <li><strong>Counter-Deck Score:</strong> mide qué tan capaz es el deck de interrumpir el meta. Las cartas con rol de counter acumulan puntos; los Bricks aplican penalización.</li>
            <li><strong>Análisis vs Meta:</strong> cruza las mecánicas del deck activo contra el meta cargado. Muestra External Score (ajustado por RPS), vulnerabilidad G1/G2, y decks que representan mayor amenaza.</li>
            <li><strong>Top Tier:</strong> ranking de todos los decks (meta + guardados) por score. Filtrable por pilar.</li>
            <li><strong>Gestión de Carpetas del Meta:</strong> organiza los decks del meta en carpetas. Desde aquí también se actualiza la lista visible.</li>
            <li><strong>Actualizar Data:</strong> botón único arriba de Top Tier. Descarga las cartas faltantes y recalcula de una vez los scores de <strong>Decks del Meta</strong> y el <strong>Poder de Cartas del Meta</strong> — ya no hace falta entrar a cada sección por separado.</li>
            <li><strong>Decks del Meta:</strong> todos los decks importados (.ydk).</li>
            <li><strong>Recurrencia de Cartas en el Meta:</strong> muestra con qué frecuencia aparece cada carta en los decks del meta cargados.</li>
            <li><strong>Poder de Cartas del Meta:</strong> Power Score de cada carta basado en presencia, mecánicas y counter-bonus. Se actualiza junto con los Decks del Meta al presionar <strong>Actualizar Data</strong>.</li>
            <li><strong>Exportar Datos:</strong> descarga reportes del deck o del meta en .txt y .csv.</li>
            <li><strong>Nivel como Piloto del Deck:</strong> nivel de dominio del deck activo según las rondas registradas en <strong>Historial de Sesiones</strong> (Mi Deck → Optimización) — Winrate General, Going 1st y Going 2nd. También visible arriba de Complejidad del Deck en Optimización. Ya no usa el Historial de Enfrentamientos (Matchups).</li>
            <li><strong>Historial de Enfrentamientos:</strong> registro manual de W/L por rival, en Mi Deck → Optimización. Independiente del Nivel como Piloto.</li>
        </ul>`,

    simuladores: `
        <h4>🎮 Simuladores</h4>
        <p>Herramientas para practicar y medir tu rendimiento sin necesidad de un oponente.</p>
        <ul>
            <li><strong>Mulligan:</strong> simula manos iniciales de tu deck activo. Incluye tres modos: Cálculo Estándar (hipergeometría manual), Cálculo con Mis Decks (usando tus decks guardados) y Prueba Mulligan (simulación visual de apertura).</li>
            <li><strong>Winrate:</strong> registro rápido de partidas G1/G2 vinculado al deck activo. Lleva el winrate general y por turno (primero/segundo).</li>
            <li><strong>Torneo:</strong> gestiona un torneo local con sistema suizo — rondas, standings, puntos y bracket.</li>
            <li><strong>Duelo en Vivo:</strong> cronómetro maestro con control de LP, conteo de turnos y temporizador por jugador. Modos estándar y Master Duel.</li>
            <li><strong>Counters:</strong> arma un pool (deck activo, Engine, Staples, Favoritas o búsqueda manual), marca las cartas del rival que querés contrarrestar y te muestra los counters conocidos. Marcá los mejores como ⭐ Perfect Counter y convertí el resultado en Engine.</li>
            <li><strong>Gauntlet:</strong> testea tu deck/engine/pool contra "Pruebas" propias (éxito/fallo, a mano o desde Zona de Práctica) frente a chips de decks del meta. Guarda un Ranking global exportable y plantillas reutilizables.</li>
            <li><strong>Experimentación:</strong> lienzo libre con zoom para plantear líneas de juego visualmente, con cartas buscadas, .ydk o de un deck guardado.</li>
            <li><strong>Zona de Práctica:</strong> campo de duelo por zonas. Incluye resolución de cadena (chain links + botón de resolución), información oculta por zona (para jugar contra otra persona sin revelar mano/campo), visor de mazo/cementerio/baneadas manipulable, log de duelo exportable, navegador de estados guardados con preview y exportación del campo como imagen.</li>
        </ul>`,

    formacion: `
        <h4>📚 Formación</h4>
        <p>Tu cuaderno de estudio y biblioteca de recursos para mejorar como jugador.</p>
        <ul>
            <li><strong>Apuntes:</strong> crea y organiza notas con título, cuerpo y fecha. Ideal para rulings, combos o estrategias.</li>
            <li><strong>Temas:</strong> conceptos del juego que puedes marcar como dominados para llevar tu progreso.</li>
            <li><strong>Juegos:</strong> acceso rápido a plataformas de Yu-Gi-Oh! configuradas en Config.</li>
            <li><strong>Fuentes:</strong> links a sitios del meta (YGOPro, masterduelmeta, etc.) configurados en Config.</li>
            <li><strong>Maestros:</strong> galería de streamers y jugadores de referencia que configuras en Config.</li>
        </ul>`,

        config: `
        <h4>⚙️ Configuración</h4>
        <p>Personaliza cómo la app analiza cartas y decks. Todo lo que cambies aquí afecta directamente los scores, la detección de roles y el resaltado de efectos.</p>
        <ul>
            <li><strong>Mecánicas y Roles:</strong> define roles (Starter, Boss, Handtrap…), sus keywords de detección automática, conditionals, exclusiones (notContains), nomenclatura asociada y peso en pilares. Cada rol es un panel colapsable con botón ✏️ para renombrar, ⧉ para clonar y 🗑️ para borrar.</li>
            <li><strong>Counters:</strong> configura pares mecánica/counter. Estos activan el Power Score del meta y el External Score del deck activo.</li>
            <li><strong>Staples:</strong> cartas esenciales del formato. Se sugieren en el Análisis si no están en el deck.</li>
            <li><strong>Nomenclatura:</strong> categorías de texto para resaltar segmentos del efecto por color. También son la base de las capas L1–L5 del scoring G1/G2.</li>
            <li><strong>Pilares del Internal Score:</strong> asigna qué roles aportan a Consistencia, Potencia y Resiliencia. Aquí también se configura el RPS (qué pilar vence a cuál) con opción "Ninguno" para pilares sin counter natural.</li>
            <li><strong>Scoring Avanzado (G1/G2):</strong> define si cada rol aporta al Going First, Going Second o ambos; su Poder Base (L3, escala 0–10); la tabla de fiabilidad por copias; y los multiplicadores de las capas L1, L2, L4 y L5.</li>
            <li><strong>Rendimientos Decrecientes:</strong> controla cómo cada copia adicional de un rol aporta progresivamente menos al score.</li>
            <li><strong>Banlist del Formato:</strong> podés tener <strong>varios formatos activos a la vez</strong> y crear/borrar formatos custom propios además de los predefinidos y Genesys. Cada formato tiene un toggle "invertido". Se indica en la Vista de Carta del Buscador y en Mi Deck.</li>
            <li><strong>Atajos Rápidos:</strong> hasta 6 accesos directos desde el botón ⚡ flotante.</li>
            <li><strong>Intro de Pestañas:</strong> activa o desactiva el overlay de bienvenida por pestaña.</li>
            <li><strong>Maestros del Duelo:</strong> gestiona los perfiles que se muestran en Formación → Maestros.</li>
            <li><strong>Fuentes Externas del Meta:</strong> administra los links embebidos de Formación → Fuentes.</li>
            <li><strong>Juegos Alternativos de Yu-Gi-Oh!:</strong> gestiona el contenido de Formación → Juegos.</li>
            <li><strong>Temas de Formación:</strong> gestiona y activa los temas de Formación → Temas.</li>
            <li><strong>Test de Duelo:</strong> creá, editá, exportá e importá tests teóricos y prácticos custom para Formación → Test.</li>
            <li><strong>Contenido de la App:</strong> muestra u oculta pestañas y secciones individuales según un perfil base (Novato/Casual/Competitivo), con override manual por sección.</li>
            <li><strong>Música:</strong> asigna pistas por perfil y controla el volumen.</li>
            <li><strong>Exportar / Importar Data:</strong> guarda o restaura toda la data de la app en un archivo .txt. Incluye decks, engines, config, scores, meta, matchups y más.</li>
            <li><strong>Restaurar Configuración:</strong> resetea TODO a los valores de fábrica. Irreversible sin un backup previo.</li>
            <li><strong>Zona de Borrado:</strong> elimina categorías específicas de data sin afectar las demás (16 categorías).</li>
            <li><strong>Reportar Error / Generar Reporte:</strong> "Generar Reporte" descarga el log técnico de la sesión. "Reportar Error" además arma un resumen de tu config y abre tu cliente de correo para enviarlo.</li>
        </ul>`,

    default: `
        <h4>❓ Ayuda</h4>
        <p>Navega entre las pestañas de la app y vuelve a abrir este panel para ver la ayuda específica de cada sección.</p>
        <p>Usa el botón <strong>FAQ</strong> para respuestas a preguntas frecuentes sobre los scores y el funcionamiento interno.</p>`
},

    faqContent: [
        {
            q: '¿Para qué es esta app?',
            a: 'Es una herramienta para jugadores de Yu-Gi-Oh! que quieren analizar con números sus decisiones: buscar cartas, construir decks, entender el meta, practicar estrategias y aprender mecánicas del juego. Funciona con datos reales de la API de YGOProDeck y toda la configuración del análisis es ajustable por el usuario.'
        },
        {
            q: '¿Qué es el Internal Score?',
            a: 'Mide la calidad técnica de tu deck basándose en los roles asignados a cada carta. Evalúa tres pilares — Consistencia (arranque y búsqueda), Potencia (cierre y daño) y Resiliencia (negación y extensión) — usando rendimientos decrecientes para que apilar muchas copias del mismo rol aporte cada vez menos. Se recalcula automáticamente en cada cambio del deck. No mide si el deck gana torneos — mide qué tan bien está construido a nivel de diseño.'
        },
        {
            q: '¿Qué es el G1/G2 Score?',
            a: 'Mide el perfil Going First vs Going Second del deck. Cada rol tiene una clasificación (G1, G2 o Neutral) y un Poder Base. El score de cada carta se calcula multiplicando ese poder por cuatro capas: velocidad de activación (L1), coste (L2), restricciones de uso (L4) y alcance del efecto (L5), más un factor de fiabilidad según cuántas copias hay en el mazo. El resultado determina si el deck es "Dependiente del dado", "Reactivo" o "Equilibrado". Todo esto es configurable en la sección Scoring Avanzado de Config.'
        },
        {
            q: '¿Qué es el External Score del deck activo?',
            a: 'Mide qué tan expuesto está tu deck frente al meta cargado. Toma las mecánicas detectadas de tu deck y las cruza contra las cartas del meta que las contrarrestan. A mayor presencia y peso de esas cartas amenazantes, menor el External Score. Se ajusta adicionalmente por el RPS (relación de pilares dominantes): si tu pilar dominante vence al del meta, el score sube 25%; si pierde, baja 25%. Es relativo al meta que tengas cargado.'
        },
        {
            q: '¿Qué es el External Score de los decks del meta?',
            a: 'Es un Cross-Score N×N: cada deck del meta se mide contra todos los demás decks de esa misma lista. Para cada deck A se suman las amenazas que cada otro deck B puede representar (sus counters apuntando a las mecánicas de A), ponderadas por el Internal Score de B y el RPS entre sus pilares dominantes. El resultado es (1 − amenaza/baseline) × 10. Se calcula al presionar "Actualizar Data" (arriba de Top Tier) y ya no requiere abrir cada deck manualmente.'
        },
        {
            q: '¿Qué es el Counter-Deck Score?',
            a: 'Indica qué tan capaz es tu deck de interrumpir las estrategias del meta. Las cartas con función de counter acumulan puntos proporcionales a la presencia de lo que contrarrestan. Las cartas Brick (sin rol útil) generan penalización porque reducen la probabilidad de ejecutar esas interrupciones.'
        },
        {
            q: '¿Cómo funciona el peso de los roles?',
            a: 'Cada rol tiene un peso de 0.1 a 2.0 (en la sección Pilares). Un peso de 1.0 es el valor base. Peso mayor a 1.0 amplifica la contribución de ese rol al pilar — útil para roles genéricos como Searcher que impactan en cualquier contexto. Peso menor reduce su contribución — útil para roles arquetípicos que solo funcionan en contexto específico. Este peso afecta el Internal Score. El Poder Base (en Scoring Avanzado) es distinto: afecta solo el G1/G2 Score.'
        },
        {
            q: '¿Cómo exporto e importo toda mi data?',
            a: 'En Config, el botón "Exportar Data" descarga un archivo .txt con toda la data: decks guardados, engines, config completa (incluyendo roles, G1/G2, scoring layers), Matchups (Historial de Enfrentamientos), Historial de Sesiones/Optimización (incluye Nivel como Piloto del Deck y Complejidad del Deck), winrates, meta, scores, música, perfil de contenido y fallbacks de imágenes. "Importar Data" restaura ese backup completo reemplazando toda la data actual.'
        },
        {
            q: '¿Qué es el "Nivel como Piloto del Deck"?',
            a: 'Mide qué tan dominado tienes tu deck activo según las rondas que registras en Historial de Sesiones (Mi Deck → Optimización → Nueva Ronda de Duelo): Winrate general, Going 1st y Going 2nd. Se ve tanto en Estadísticas como arriba de Complejidad del Deck en Optimización. No tiene relación con el Historial de Enfrentamientos (Matchups), que es un registro manual e independiente por rival.'
        },
        {
            q: '¿Qué hace "Restaurar Configuración"?',
            a: 'Borra absolutamente toda la data de la app (decks, engines, matchups, config, scores, meta, todo) y la reinicia a los valores de fábrica: roles por defecto, mecánicas y counters predefinidos, staples de ejemplo, apuntes iniciales y engines de demostración. Esta acción es irreversible si no tienes un backup previo exportado. No confundir con la Zona de Borrado, que elimina solo las categorías que selecciones.'
        },
        {
            q: '¿Qué son las Especialidades y Counters?',
            a: 'Son pares de mecánicas configurables en la sección Counters. Una Especialidad es un patrón de juego que un deck ejecuta (por ejemplo: "invocación especial masiva"). Un Counter es lo que lo interrumpe. Configurar estos pares activa el Power Score del meta, el External Score del deck activo y el cross-score entre decks del meta.'
        },
        {
            q: '¿Qué es la Línea de Combos?',
            a: 'Es un mapeo detallado del combo de tu deck en Mi Deck, organizado por zonas (mano, campo, cementerio, baneadas), con starters y Boss Monster detectados automáticamente (o marcados a mano), choke points, restricciones, interacciones entre cartas y el endboard resultante. Tiene un modo de ejecución paso a paso para simular la línea jugada a jugada, con log de jugadas exportable como .txt.'
        },
        {
            q: '¿Qué es Gauntlet?',
            a: 'Es un simulador de testing competitivo: elegís un deck, engine o pool manual y lo probás contra "Pruebas" (situaciones de éxito/fallo definidas por vos) frente a chips de decks del meta. Lleva un Ranking global exportable/importable y permite guardar plantillas reutilizables de pruebas.'
        },
        {
            q: '¿Puedo tener copias de una carta en Main y en Side Deck a la vez?',
            a: 'Sí. Al mover una carta al Side Deck, la app te pregunta cuántas copias enviar (por defecto todas). Si elegís menos que el total, el resto queda en Main/Extra Deck y solo esa parte se registra en el Side — competitivamente equivale a tener un plan de juego que cambia una cantidad puntual de copias según el rival.'
        },
        {
            q: '¿Cómo funciona la Banlist con varios formatos?',
            a: 'Podés activar más de un formato de Banlist a la vez y crear formatos custom propios además de los predefinidos y Genesys. Cada formato tiene un toggle "invertido". El estado de ban de una carta se muestra tanto en la Vista de Carta del Buscador como en Mi Deck.'
        }
    ],

    init: function () {
        this.createButton();
        this.createPanel();
    },

    createButton: function () {
        if (document.getElementById('help-float-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'help-float-btn';
        btn.className = 'help-float-btn';
        btn.innerHTML = '?';
        btn.title = 'Ayuda';
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
    },

    createPanel: function () {
        if (document.getElementById('help-panel-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'help-panel-overlay';
        overlay.className = 'help-panel-overlay';
        overlay.innerHTML = `
            <div class="help-panel" id="help-panel">
                <div class="help-panel-header">
                    <div class="help-panel-tabs">
                        <button class="help-tab-btn active" id="htab-help"
                                onclick="HelpPanel.showTab('help')">Ayuda</button>
                        <button class="help-tab-btn" id="htab-faq"
                                onclick="HelpPanel.showTab('faq')">FAQ</button>
                    </div>
                    <button class="help-panel-close" onclick="HelpPanel.close()">×</button>
                </div>
                <div class="help-panel-body" id="help-panel-body"></div>
            </div>`;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });
        document.body.appendChild(overlay);
    },

    getActiveTab: function () {
        if (window.Navigation && Navigation.currentTab) {
            return Navigation.currentTab;
        }
        // Fallback: busca el tab activo por clase
        const active = document.querySelector('.nav-tab.active, .tab-btn.active, [data-tab].active');
        return active?.dataset?.tab || 'default';
    },

    showTab: function (tab) {
        this.activeTab = tab;

        document.querySelectorAll('.help-tab-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`htab-${tab}`);
        if (btn) btn.classList.add('active');

        const body = document.getElementById('help-panel-body');
        if (!body) return;

        if (tab === 'faq') {
            body.innerHTML = this.renderFAQ();
        } else {
            const pageTab = this.getActiveTab();
            const content = this.tabContent[pageTab] || this.tabContent.default;
            body.innerHTML = `<div class="help-content">${content}</div>`;
        }
    },

    renderFAQ: function () {
        const items = this.faqContent.map((item, i) => `
            <div class="faq-item" id="faq-${i}">
                <button class="faq-question" onclick="HelpPanel.toggleFAQ(${i})">
                    <span>${item.q}</span>
                    <span class="faq-arrow" id="faq-arrow-${i}">▶</span>
                </button>
                <div class="faq-answer" id="faq-answer-${i}" style="display:none;">
                    ${item.a}
                </div>
            </div>`).join('');
        return `<div class="faq-list">${items}</div>`;
    },

    toggleFAQ: function (i) {
        const answer = document.getElementById(`faq-answer-${i}`);
        const arrow  = document.getElementById(`faq-arrow-${i}`);
        if (!answer) return;
        const open = answer.style.display !== 'none';
        answer.style.display = open ? 'none' : 'block';
        if (arrow) arrow.textContent = open ? '▶' : '▼';
    },

    open: function () {
        this.isOpen = true;
        const overlay = document.getElementById('help-panel-overlay');
        if (overlay) overlay.classList.add('active');
        this.showTab('help');
    },

    close: function () {
        this.isOpen = false;
        const overlay = document.getElementById('help-panel-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    toggle: function () {
        this.isOpen ? this.close() : this.open();
    }
};
console.log('ESTADO: Actualizacion de lo que se esta haciendo')
window.HelpPanel = HelpPanel;
document.addEventListener('DOMContentLoaded', () => HelpPanel.init());