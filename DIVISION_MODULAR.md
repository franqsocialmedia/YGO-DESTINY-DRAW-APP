# DIVISIÓN MODULAR - DESTINY DRAW YUGIOH APP

## Estructura de Archivos

```
destiny-draw-yugioh/
├── index.html              # HTML principal y estructura de pestañas
├── styles.css              # Todos los estilos CSS de la aplicación
├── app-core.js             # Funcionalidades compartidas y navegación
├── buscador.js             # Módulo: Pestaña BUSCADOR
├── mideck.js               # Módulo: Pestaña MI DECK
├── simulador.js            # Módulo: Pestaña SIMULADOR
├── meta-tools.js           # Módulo: Pestaña META TOOLS (ya existente)
├── meta-analisis.js        # Módulo: Pestaña META ANALYSIS
└── gestion-datos.js        # Módulo: Pestaña GESTIÓN DE DATOS
```

## Descripción de Módulos

### 1. **index.html**
- Estructura HTML básica
- Pestañas de navegación
- Contenedores para cada sección
- Referencias a CSS y JS
- Footer

### 2. **styles.css**
- Todos los estilos CSS extraídos del archivo original
- Estilos de tabs, secciones, cards, modals, etc.
- Estilos responsive
- Animaciones y transiciones

### 3. **app-core.js** (Núcleo de la aplicación)
**Variables Globales:**
- `cardsData` - Datos de todas las cartas
- `library` - Deck del usuario
- `selectedCards` - Cartas seleccionadas
- `cardNameDatabase` - Base de datos de nombres
- `keywordDefinitions` - Definiciones de palabras clave
- `keywordCounters` - Counters de keywords
- `metaSources` - Fuentes del meta
- Configuraciones por defecto

**Funciones Compartidas:**
- `showTab()` - Navegación entre pestañas
- `fetchCards()` - Carga de cartas desde API
- `saveLibrary()` / `loadLibrary()` - Gestión de localStorage
- `saveCookie()` / `loadCookie()` - Gestión de cookies
- `exportLibrary()` / `importLibrary()` - Exportar/importar decks
- Funciones de utilidad compartidas

**Inicialización:**
- Event listeners para tabs
- Carga inicial de datos
- Configuración de scroll buttons

### 4. **buscador.js** (Pestaña BUSCADOR)
**Responsabilidades:**
- Renderizar HTML de la sección buscador
- Búsqueda y filtrado de cartas
- Mostrar resultados de búsqueda
- Agregar cartas a "MI DECK"
- Modal de detalles de carta

**Funciones principales:**
- `renderBuscadorSection()` - Renderiza el HTML
- `searchCards()` - Búsqueda de cartas
- `displayCards()` - Muestra resultados
- `addCardToLibrary()` - Agrega carta al deck
- `showCardDetails()` - Muestra detalles

### 5. **mideck.js** (Pestaña MI DECK)
**Responsabilidades:**
- Renderizar HTML de la sección MI DECK
- Mostrar Main Deck y Extra Deck
- Estadísticas del deck
- Cálculo hipergeométrico
- Gestión de grupos de cartas
- Asignación de roles (starter, extender, etc.)
- Análisis de palabras clave
- Counters de efectos

**Funciones principales:**
- `renderMiDeckSection()` - Renderiza el HTML
- `displayLibrary()` - Muestra el deck
- `calculateStats()` - Calcula estadísticas
- `calculateHypergeometric()` - Cálculo de probabilidades
- `assignCardRole()` - Asigna roles a cartas
- `createGroup()` - Crea grupos de cartas
- `showKeywordAnalysis()` - Análisis de keywords

### 6. **simulador.js** (Pestaña SIMULADOR)
**Responsabilidades:**
- Renderizar HTML de la sección SIMULADOR
- Simulador de 2 jugadores
- Simulador de mano inicial (5 cartas)
- Gestión de zonas de juego
- Life points
- Fases de juego
- Movimiento de cartas entre zonas
- Creación de tokens
- Dados y monedas
- Contadores

**Funciones principales:**
- `renderSimuladorSection()` - Renderiza el HTML
- `initializeSimulator()` - Inicializa el simulador
- `drawCards()` - Roba cartas
- `moveCard()` - Mueve cartas entre zonas
- `renderBoard()` - Renderiza el tablero
- `createToken()` - Crea fichas
- `rollDice()` / `flipCoin()` - Utilidades de juego

### 7. **meta-tools.js** (Pestaña META TOOLS)
**Este módulo YA EXISTE** - No se modifica
- Evaluación de Power Level de decks
- Análisis de decks META desde carpeta local
- Estadísticas de decks competitivos

### 8. **meta-analisis.js** (Pestaña META ANALYSIS)
**Responsabilidades:**
- Renderizar HTML de la sección META ANALYSIS
- Mostrar fuentes de metajuego
- Enlaces a páginas de análisis
- Tier lists y tendencias

**Funciones principales:**
- `renderMetaAnalisisSection()` - Renderiza el HTML
- `displayMetaSources()` - Muestra fuentes del meta
- `updateMetaSources()` - Actualiza enlaces

### 9. **gestion-datos.js** (Pestaña GESTIÓN DE DATOS)
**Responsabilidades:**
- Renderizar HTML de la sección GESTIÓN DE DATOS
- Importar/Exportar decks (.ydk, .txt)
- Gestión de localStorage y cookies
- Configuración de keywords
- Configuración de counters
- Restaurar valores por defecto

**Funciones principales:**
- `renderGestionDatosSection()` - Renderiza el HTML
- `handleFileImport()` - Importa archivos
- `exportDeck()` - Exporta deck
- `manageKeywords()` - Gestión de keywords
- `resetToDefaults()` - Restaurar defaults

## Comunicación Entre Módulos

### Variables Globales Compartidas (app-core.js)
Todos los módulos pueden acceder a:
- `cardsData`
- `library`
- `selectedCards`
- `cardNameDatabase`
- `keywordDefinitions`
- `keywordCounters`
- `metaSources`

### Funciones Compartidas (app-core.js)
Todos los módulos pueden usar:
- `saveLibrary()` / `loadLibrary()`
- `fetchCards()`
- `exportLibrary()` / `importLibrary()`
- Utilidades de formateo y cálculo

### Event System
- Cada módulo se inicializa cuando su pestaña se activa
- Los cambios en el deck (`library`) se reflejan automáticamente
- Los módulos emiten eventos personalizados si es necesario

## Ventajas de esta División

1. **Mantenibilidad**: Cada módulo es independiente y fácil de mantener
2. **Escalabilidad**: Agregar nuevas pestañas es simple
3. **Debugging**: Errores más fáciles de localizar
4. **Colaboración**: Múltiples desarrolladores pueden trabajar en paralelo
5. **Performance**: Carga bajo demanda (lazy loading posible)
6. **Organización**: Código limpio y estructurado

## Notas Importantes

- **meta-tools.js** ya es modular, NO se modifica
- Todas las funciones mantienen su lógica original
- No se cambia el comportamiento de la aplicación
- Solo se reorganiza el código en módulos
- Compatibilidad total con el sistema actual
