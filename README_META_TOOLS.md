# META Tools - Documentación

## Descripción General

La nueva pestaña **META Tools** ha sido agregada a la aplicación Destiny Draw Yugioh. Esta pestaña funciona como un módulo externo (`meta-tools.js`) para facilitar futuras mejoras y mantenimiento.

## Cambios Realizados

### 1. Archivos Modificados/Creados

- **index.html** - Versión actualizada con:
  - Nueva pestaña "META Tools" en la navegación
  - Sección dedicada para el contenido del módulo
  - Integración del módulo JavaScript `meta-tools.js`
  - Estilos CSS adicionales para la nueva pestaña

- **meta-tools.js** - Módulo nuevo que contiene:
  - Estilos CSS específicos (no modifica el CSS original)
  - Lógica para cargar y analizar decks META
  - Primera sección: Evaluación de Power Level de decks

### 2. Nueva Funcionalidad - Sección 1: Evaluación de Power Level

Esta sección permite:
- Seleccionar decks en formato .ydk desde una carpeta META
- Mostrar información básica del deck (nombre, cantidad de cartas)
- Visualizar la carta "starter" principal (primera con clasificación de starter)
- Ver estadísticas principales del deck (Deck Stats):
  - Ratio Monstruos/Magias/Trampas
  - Cantidad de cada tipo de carta
  - Nivel promedio de monstruos
  - Cantidad de Hand Traps
  - Tamaño del Extra Deck
- Ver características del deck:
  - Atributo principal
  - Tipo principal
  - Arquetipo principal
  - Velocidad del deck (Rápida/Media/Lenta)
  - Estrategia (Combo/Control)
  - Consistencia (Alta/Media/Baja)
  - Power Level (Tier 1/2/3)

## Estructura de Carpetas Requerida

Para que la funcionalidad META Tools funcione correctamente, debes crear la siguiente estructura de carpetas **al mismo nivel** que el archivo `index.html`:

```
📁 [Carpeta de tu aplicación]
├── index.html
├── meta-tools.js
└── 📁 META/
    └── 📁 29-01-2026/          ← Formato: DD-MM-YYYY (día-mes-año)
        ├── Snake-Eye.ydk
        ├── Yubel.ydk
        ├── Centur-Ion.ydk
        └── Tenpai.ydk
```

### Importante:

1. La carpeta debe llamarse exactamente **META** (en mayúsculas)
2. Dentro de META, crea una subcarpeta con la **fecha del día** en formato `DD-MM-YYYY`
3. Dentro de la carpeta de fecha, coloca tus archivos .ydk

**Ejemplo para hoy (29 de enero de 2026):**
```
META/29-01-2026/
```

**Ejemplo para mañana (30 de enero de 2026):**
```
META/30-01-2026/
```

## Formato de Archivos .ydk

Los archivos .ydk deben seguir el formato estándar de YGOPro:

```
#created by...
#main
[ID de carta 1]
[ID de carta 2]
...
#extra
[ID de carta extra 1]
[ID de carta extra 2]
...
!side
[ID de carta side 1]
[ID de carta side 2]
...
```

**Ejemplo (Snake-Eye.ydk):**
```
#created by Destiny Draw Yugioh
#main
33734439
33734439
33734439
14558127
14558127
14558127
...
#extra
77236826
77236826
...
!side
14558127
14558127
...
```

## Cómo Usar META Tools

1. **Abre la aplicación** en tu navegador
2. **Haz clic en la pestaña "META Tools"** (entre Simulador y Meta Analysis)
3. **Selecciona un deck** del menú desplegable
4. El sistema cargará automáticamente:
   - La información del deck
   - La carta starter principal
   - Las estadísticas calculadas
   - Las características del deck

## Clasificación de Cartas Starter

El sistema identifica cartas "starter" basándose en:
- Cartas de bajo nivel (≤4)
- Efectos que incluyen palabras clave como:
  - "search" (búsqueda)
  - "add" (agregar)
  - "special summon" (invocación especial)
  - "from your deck" (desde tu deck)
  - "normal summon" (invocación normal)

## Próximas Secciones

El módulo META Tools está diseñado para ser expandido con futuras secciones. La estructura modular permite agregar nuevas funcionalidades fácilmente sin modificar el código principal de la aplicación.

## Notas Técnicas

### Compatibilidad
- El módulo usa la API de YGOProDeck para obtener información de cartas
- Compatible con la variable global `allCards` si ya está cargada
- Funciona con navegadores modernos (Chrome, Firefox, Edge)

### Estilos CSS
- Todos los estilos específicos están en el módulo `meta-tools.js`
- No interfieren con los estilos originales de la aplicación
- Responsive design incluido para dispositivos móviles

### Rendimiento
- Carga bajo demanda (solo cuando se activa la pestaña)
- Cache de datos de cartas para evitar llamadas API repetidas
- Interfaz optimizada para carga rápida

## Solución de Problemas

### "Error: No se pudo acceder a la carpeta META/[fecha]/"
- Verifica que la carpeta META existe al mismo nivel que index.html
- Verifica que la carpeta con la fecha de hoy existe dentro de META
- Verifica que el formato de fecha es correcto (DD-MM-YYYY)

### "Error al cargar el deck"
- Verifica que el archivo .ydk tiene el formato correcto
- Verifica que los IDs de las cartas son válidos
- Comprueba la consola del navegador para más detalles

### "No se muestran las cartas correctamente"
- Asegúrate de tener conexión a internet (para la API de YGOProDeck)
- Verifica que las imágenes de las cartas se pueden cargar

## Soporte

Para reportar problemas o sugerir mejoras para futuras secciones del módulo META Tools, consulta con el desarrollador.

---

**Versión:** 1.0.0  
**Fecha:** 29 de enero de 2026  
**Autor:** Yan-Yan
