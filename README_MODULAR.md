# DESTINY DRAW YUGIOH - VERSIÓN MODULAR

## 📋 Descripción

Este proyecto ha sido dividido en módulos independientes para mejorar la mantenibilidad, escalabilidad y organización del código.

## 📁 Estructura de Archivos

```
destiny-draw-yugioh/
│
├── index.html              # Estructura HTML principal
├── styles.css              # Todos los estilos CSS
│
├── app-core.js             # Núcleo: Variables globales y funciones compartidas
├── buscador.js             # Módulo: BUSCADOR de cartas
├── mideck.js               # Módulo: MI DECK
├── simulador.js            # Módulo: SIMULADOR
├── meta-tools.js           # Módulo: META TOOLS (existente, no modificado)
├── meta-analisis.js        # Módulo: META ANALYSIS
└── gestion-datos.js        # Módulo: GESTIÓN DE DATOS
│
└── README_MODULAR.md       # Este archivo
```

## 🔧 Instalación y Uso

### Opción 1: Uso Local
1. Coloca todos los archivos en la misma carpeta
2. Abre `index.html` en tu navegador
3. ¡Listo! La aplicación cargará todos los módulos automáticamente

### Opción 2: Servidor Local
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx http-server

# Luego abre: http://localhost:8000
```

## 📦 Descripción de Módulos

### 1. `index.html`
- **Propósito**: Estructura HTML básica
- **Contenido**:
  - Pestañas de navegación
  - Contenedores para cada sección
  - Referencias a CSS y módulos JS
  - Footer

### 2. `styles.css`
- **Propósito**: Estilos visuales de toda la aplicación
- **Contenido**:
  - Estilos de tabs, sections, cards
  - Modals y paneles
  - Responsive design
  - Animaciones

### 3. `app-core.js` ⭐ NÚCLEO
- **Propósito**: Funcionalidades compartidas entre módulos
- **Variables Globales**:
  - `cardsData` - Base de datos de cartas
  - `library` - Deck del usuario
  - `selectedCards` - Cartas seleccionadas
  - `keywordDefinitions` - Definiciones de keywords
  - `keywordCounters` - Counters de keywords
  - `metaSources` - Fuentes del meta
  
- **Funciones Compartidas**:
  - `fetchCards()` - Carga cartas desde API
  - `saveLibrary()` / `loadLibrary()` - Gestión de localStorage
  - `showTab()` - Navegación entre pestañas
  - `extractCardTypes()` - Extrae tipos de carta
  - `isExtraDeckCard()` - Detecta cartas de Extra Deck

### 4. `buscador.js`
- **Propósito**: Búsqueda y filtrado de cartas
- **Funciones Principales**:
  - `renderBuscadorSection()` - Renderiza el HTML
  - `searchCards()` - Búsqueda de cartas
  - `displayCards()` - Muestra resultados
  - `addCardToLibraryFromBuscador()` - Agrega carta al deck
  - `showCardDetailsPanel()` - Muestra detalles de carta

### 5. `mideck.js`
- **Propósito**: Gestión del deck del usuario
- **Funciones Principales**:
  - `renderMiDeckSection()` - Renderiza el HTML
  - `displayDeckList()` - Muestra Main y Extra Deck
  - `displayDeckStats()` - Muestra estadísticas
  - `removeCardFromDeck()` - Elimina carta
  - `addCardCopy()` - Agrega copia de carta
  - Cálculo hipergeométrico
  - Análisis de keywords
  - Gestión de grupos

### 6. `simulador.js`
- **Propósito**: Simulador de partidas y manos
- **Funciones Principales**:
  - `renderSimuladorSection()` - Renderiza el HTML
  - `initializeSimulator()` - Inicializa simulador
  - `generateRandomHand()` - Genera mano aleatoria
  - `displayHand()` - Muestra mano inicial
  - Simulador de 2 jugadores
  - Gestión de zonas
  - Life points

### 7. `meta-tools.js` ⚠️
- **Propósito**: Evaluación de Power Level de decks META
- **Estado**: YA EXISTE - NO SE MODIFICA
- **Funcionalidad**: 
  - Carga decks desde carpeta META/
  - Análisis de power level
  - Estadísticas de decks competitivos

### 8. `meta-analisis.js`
- **Propósito**: Enlaces a fuentes de metajuego
- **Funciones Principales**:
  - `renderMetaAnalisisSection()` - Renderiza el HTML
  - `displayMetaSources()` - Muestra fuentes del meta
  - Enlaces a tier lists

### 9. `gestion-datos.js`
- **Propósito**: Importar/exportar y configuración
- **Funciones Principales**:
  - `renderGestionDatosSection()` - Renderiza el HTML
  - `exportDeckAsYdk()` - Exporta deck en formato .ydk
  - `exportDeckAsTxt()` - Exporta deck en formato .txt
  - `importDeck()` - Importa deck desde archivo
  - `resetToDefaults()` - Restaura configuración

## 🔄 Comunicación Entre Módulos

### Variables Globales Compartidas
Todos los módulos tienen acceso a las variables globales definidas en `app-core.js`:
- `cardsData`
- `library`
- `selectedCards`
- `keywordDefinitions`
- `keywordCounters`
- etc.

### Funciones Compartidas
Los módulos pueden usar las funciones exportadas por otros módulos:
```javascript
// Ejemplo: Usar función de app-core en otro módulo
window.AppCore.fetchCards();
window.AppCore.saveLibrary();
```

### Sistema de Eventos
- Cada módulo se inicializa cuando su pestaña se activa
- Los cambios en `library` se reflejan automáticamente
- Uso de `saveLibrary()` para persistir cambios

## 🎯 Ventajas de esta Estructura

### ✅ Mantenibilidad
- Código organizado por funcionalidad
- Fácil localizar y corregir errores
- Cambios aislados no afectan otros módulos

### ✅ Escalabilidad
- Agregar nuevas pestañas es simple
- Nuevo módulo = nuevo archivo .js
- No hay que modificar código existente

### ✅ Colaboración
- Múltiples desarrolladores pueden trabajar simultáneamente
- Cada uno en un módulo diferente
- Menos conflictos en control de versiones

### ✅ Performance
- Posibilidad de carga bajo demanda (lazy loading)
- Caché de módulos en el navegador
- Código más limpio = mejor performance

### ✅ Debugging
- Errores más fáciles de rastrear
- Console logs específicos por módulo
- Stack traces más claros

## 🔨 Desarrollo Futuro

### Agregar Nueva Pestaña
1. Crear nuevo archivo: `mi-nueva-pestana.js`
2. Agregar HTML en `index.html`:
   ```html
   <div class="tab" data-section="minuevapestana"><span>MI NUEVA PESTAÑA</span></div>
   <div id="minuevapestana" class="section"></div>
   ```
3. Incluir script en `index.html`:
   ```html
   <script src="mi-nueva-pestana.js"></script>
   ```
4. Implementar en el módulo:
   ```javascript
   function renderMiNuevaPestanaSection() { ... }
   function initMinuevapestana() { ... }
   window.initMinuevapestana = initMinuevapestana;
   ```

## ⚠️ Notas Importantes

1. **Orden de Carga**:
   - `app-core.js` debe cargarse PRIMERO
   - Los demás módulos pueden cargarse en cualquier orden
   - `meta-tools.js` es independiente

2. **Variables Globales**:
   - Definidas en `app-core.js`
   - Accesibles desde todos los módulos
   - Usar con precaución para evitar conflictos

3. **Compatibilidad**:
   - Funciona en todos los navegadores modernos
   - Chrome, Firefox, Edge, Safari
   - No requiere transpilación

4. **LocalStorage**:
   - Los datos se guardan automáticamente
   - Persistencia entre sesiones
   - Límite de ~5-10MB por dominio

## 🐛 Solución de Problemas

### "Module not found"
- Verifica que todos los archivos .js estén en la misma carpeta que index.html
- Revisa la consola del navegador (F12)

### "Function is not defined"
- Asegúrate de que el módulo se haya cargado
- Verifica que la función esté exportada: `window.nombreFuncion = nombreFuncion;`

### "Cannot read property of undefined"
- Verifica que `app-core.js` se haya cargado primero
- Asegúrate de que las variables globales estén inicializadas

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
- Revisa la consola del navegador (F12) para errores
- Documenta los pasos para reproducir el problema
- Incluye capturas de pantalla si es posible

---

**Versión Modular:** 1.0.0  
**Fecha:** 29 de enero de 2026  
**Autor:** Yan-Yan  
**Modificación Modular por:** Claude (Anthropic)
