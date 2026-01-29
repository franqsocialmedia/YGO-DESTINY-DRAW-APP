/* META TOOLS MODULE - FINAL ROBUST VERSION
   Integra lectura de carpetas locales y UI completa.
*/

// ==========================================
// 1. CONFIGURACIÓN Y ESTADO
// ==========================================
let metaFileSystem = {}; 
let isMetaInitialized = false;

// ==========================================
// 2. ESTILOS (CSS INYECTADO)
// ==========================================
// Estos estilos aseguran que se vea bien incluso si el CSS principal falla
const metaStyles = `
<style id="meta-tools-critical-css">
    /* Contenedor Principal */
    #metaToolsContent {
        width: 100%;
        min-height: 500px;
        color: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .meta-dashboard {
        background-color: rgba(0, 31, 63, 0.95);
        border: 1px solid #ffcc00;
        border-radius: 10px;
        padding: 20px;
        margin-top: 20px;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
    }

    /* Títulos */
    .meta-header {
        text-align: center;
        border-bottom: 2px solid #ffcc00;
        margin-bottom: 25px;
        padding-bottom: 10px;
    }
    
    .meta-header h2 {
        color: #ffcc00;
        font-size: 2em;
        margin: 0;
        text-transform: uppercase;
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    }

    /* Panel de Control (Botones y Selects) */
    .meta-controls-panel {
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
        align-items: flex-end;
        border: 1px solid rgba(255, 204, 0, 0.3);
    }

    .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .control-group label {
        color: #ffcc00;
        font-weight: bold;
        font-size: 0.9em;
    }

    /* Inputs y Botones */
    .meta-select-input {
        background-color: #001f3f;
        color: white;
        border: 1px solid #ffcc00;
        padding: 10px;
        border-radius: 5px;
        min-width: 220px;
        font-size: 1em;
    }

    .meta-action-btn {
        background: linear-gradient(180deg, #ffcc00 0%, #ffaa00 100%);
        color: #000;
        border: none;
        padding: 10px 25px;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        font-size: 1em;
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .meta-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 204, 0, 0.4);
    }

    .meta-action-btn:active {
        transform: translateY(0);
    }

    /* GRID DE RESULTADOS */
    .meta-results-grid {
        display: grid;
        grid-template-columns: 250px 1fr 1fr;
        gap: 20px;
        margin-top: 30px;
        opacity: 0; /* Animación de entrada */
        animation: fadeIn 0.8s forwards;
    }

    @media (max-width: 900px) {
        .meta-results-grid {
            grid-template-columns: 1fr;
        }
    }

    /* Cajas de Estadísticas */
    .result-box {
        background: rgba(0,0,0,0.4);
        border-radius: 8px;
        padding: 15px;
        border-left: 5px solid #ffcc00;
    }

    .result-box h3 {
        color: #ffcc00;
        margin-top: 0;
        border-bottom: 1px solid rgba(255,255,255,0.2);
        padding-bottom: 10px;
    }

    /* Visualización Carta */
    .card-preview-container {
        text-align: center;
        background: rgba(0,0,0,0.6);
        padding: 10px;
        border-radius: 8px;
    }
    
    .card-preview-img {
        max-width: 100%;
        height: auto;
        border: 2px solid #666;
        box-shadow: 0 0 15px rgba(0,0,0,0.8);
    }

    /* Filas de Datos */
    .data-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px dashed rgba(255,255,255,0.1);
        font-size: 0.95em;
    }
    
    .data-label { color: #aaa; }
    .data-value { color: #fff; font-weight: bold; }

    /* Utilidad */
    .tier-badge {
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: bold;
        text-align: center;
        display: inline-block;
    }
    
    @keyframes fadeIn {
        to { opacity: 1; }
    }
</style>
`;

// ==========================================
// 3. INICIALIZACIÓN (MOTOR GRÁFICO)
// ==========================================

function initMetaTools() {
    // 1. Verificar si ya cargó
    if (isMetaInitialized) return;

    const container = document.getElementById('metaToolsContent');
    
    // 2. Diagnóstico de error en pantalla si no encuentra el ID
    if (!container) {
        console.error("META TOOLS CRITICAL: No se encontró <div id='metaToolsContent'>");
        return; 
    }

    console.log("META TOOLS: Iniciando renderizado...");

    // 3. Inyectar CSS
    if (!document.getElementById('meta-tools-critical-css')) {
        document.head.insertAdjacentHTML('beforeend', metaStyles);
    }

    // 4. Inyectar HTML Estructural
    container.innerHTML = `
        <div class="meta-dashboard">
            <div class="meta-header">
                <h2>🛡️ Meta Deck Analyzer</h2>
                <p style="color: #ccc;">Analiza carpetas locales de YGOPro/Omega para obtener estadísticas del metajuego.</p>
            </div>

            <div class="meta-controls-panel">
                
                <div class="control-group">
                    <label>1. Cargar Base de Datos</label>
                    <input type="file" id="metaDirInput" webkitdirectory directory multiple style="display:none" />
                    <button class="meta-action-btn" onclick="document.getElementById('metaDirInput').click()">
                        <span>📂</span> Seleccionar Carpeta META
                    </button>
                </div>

                <div class="control-group">
                    <label>2. Formato / Fecha</label>
                    <select id="metaFolderSelect" class="meta-select-input" onchange="window.selectMetaFolder()">
                        <option value="">(Esperando carpeta...)</option>
                    </select>
                </div>

                <div class="control-group">
                    <label>3. Deck Específico</label>
                    <select id="metaDeckSelect" class="meta-select-input" onchange="window.selectMetaDeck()" disabled>
                        <option value="">-- Selecciona Deck --</option>
                    </select>
                </div>
            </div>

            <div id="metaResultsArea" style="display:none;">
                <div class="meta-results-grid">
                    
                    <div class="result-box">
                        <h3>Carta Insignia</h3>
                        <div class="card-preview-container">
                            <img id="metaStarterImg" class="card-preview-img" src="https://images.ygoprodeck.com/images/cards/back_high.jpg" alt="Card Back">
                            <div id="metaStarterName" style="margin-top:10px; color:#ffcc00; font-weight:bold;">???</div>
                        </div>
                    </div>

                    <div class="result-box">
                        <h3>Composición</h3>
                        <div id="metaStatsList">
                            </div>
                    </div>

                    <div class="result-box">
                        <h3>Perfil Competitivo</h3>
                        <div id="metaProfileList">
                            </div>
                    </div>

                </div>
            </div>
            
            <div style="text-align:center; margin-top:20px; font-size:0.8em; color:#555;">
                Meta Tools Module v2.0 - Loaded Successfully
            </div>
        </div>
    `;

    // 5. Vincular Eventos
    document.getElementById('metaDirInput').addEventListener('change', handleFolderSelect, false);
    
    isMetaInitialized = true;
    console.log("META TOOLS: Renderizado completado.");
}

// ==========================================
// 4. LÓGICA DE ARCHIVOS (FILE SYSTEM)
// ==========================================

function handleFolderSelect(event) {
    const files = event.target.files;
    metaFileSystem = {}; 
    let folderCount = 0;
    
    const folderSelect = document.getElementById('metaFolderSelect');
    folderSelect.innerHTML = '<option value="">Cargando...</option>';

    console.log(`META: Escaneando ${files.length} archivos...`);

    // Procesamiento optimizado
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Estructura esperada: META/Fecha/Deck.ydk
        // webkitRelativePath devuelve la ruta completa
        const pathParts = file.webkitRelativePath.split('/');
        
        // Validación estricta: Debe ser .ydk y tener al menos una carpeta padre
        if (file.name.endsWith('.ydk') && pathParts.length >= 2) {
            
            // La carpeta de interés es la que contiene el archivo (penúltima en la ruta)
            const folderName = pathParts[pathParts.length - 2];
            
            // Evitar archivos sueltos en la raíz o carpetas del sistema
            if (folderName === pathParts[0]) continue; 

            if (!metaFileSystem[folderName]) {
                metaFileSystem[folderName] = [];
                folderCount++;
            }
            metaFileSystem[folderName].push(file);
        }
    }

    // Actualizar UI
    folderSelect.innerHTML = '<option value="">-- Seleccionar Fecha --</option>';
    
    if (folderCount === 0) {
        alert("⚠️ No se encontraron carpetas válidas.\n\nInstrucciones:\n1. Pulsa el botón 'Seleccionar Carpeta META'\n2. Elige la carpeta RAÍZ que contiene las carpetas de fechas (ej: carpeta 'META').\n3. No entres a las subcarpetas.");
        return;
    }

    // Ordenar fechas (descendente simple)
    const sortedFolders = Object.keys(metaFileSystem).sort().reverse();
    
    sortedFolders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = `📅 ${folder}`;
        folderSelect.appendChild(option);
    });

    alert(`✅ Éxito: Se cargaron ${folderCount} formatos diferentes.`);
}

// Función global para el HTML onchange
window.selectMetaFolder = function() {
    const folderSelect = document.getElementById('metaFolderSelect');
    const deckSelect = document.getElementById('metaDeckSelect');
    const selectedFolder = folderSelect.value;

    // Reset UI
    deckSelect.innerHTML = '<option value="">-- Seleccionar Deck --</option>';
    deckSelect.disabled = true;
    document.getElementById('metaResultsArea').style.display = 'none';

    if (!selectedFolder || !metaFileSystem[selectedFolder]) return;

    // Poblar lista de decks
    const decks = metaFileSystem[selectedFolder];
    decks.forEach((file, index) => {
        const option = document.createElement('option');
        option.value = index; 
        option.textContent = file.name.replace('.ydk', '');
        deckSelect.appendChild(option);
    });

    deckSelect.disabled = false;
};

window.selectMetaDeck = function() {
    const folderSelect = document.getElementById('metaFolderSelect');
    const deckSelect = document.getElementById('metaDeckSelect');
    
    const selectedFolder = folderSelect.value;
    const fileIndex = deckSelect.value;

    if (fileIndex === "" || !selectedFolder) return;

    const file = metaFileSystem[selectedFolder][fileIndex];
    
    // Leer archivo
    const reader = new FileReader();
    reader.onload = function(e) {
        processDeckData(e.target.result, file.name);
    };
    reader.readAsText(file);
};

// ==========================================
// 5. MOTOR DE ANÁLISIS (CORE LOGIC)
// ==========================================

function processDeckData(content, deckName) {
    // Parser YDK simple
    const lines = content.split('\n');
    const mainIds = [];
    const extraIds = [];
    let section = '';

    lines.forEach(line => {
        const l = line.trim();
        if (l === '#main') section = 'main';
        else if (l === '#extra') section = 'extra';
        else if (l === '!side') section = 'side';
        else if (l && !l.startsWith('#') && !l.startsWith('!')) {
            const id = parseInt(l);
            if (!isNaN(id)) {
                if (section === 'main') mainIds.push(id);
                if (section === 'extra') extraIds.push(id);
            }
        }
    });

    renderDeckAnalysis(mainIds, extraIds, deckName);
}

function renderDeckAnalysis(mainIds, extraIds, deckName) {
    document.getElementById('metaResultsArea').style.display = 'block';

    // 1. Obtener objetos carta completos
    // Intentamos usar la base de datos global 'allCards' si existe
    let cards = [];
    if (typeof allCards !== 'undefined' && Array.isArray(allCards)) {
        cards = mainIds.map(id => allCards.find(c => c.id == id)).filter(c => c);
    } else {
        console.warn("Base de datos de cartas no encontrada. Modo básico activado.");
    }

    // 2. Calcular Estadísticas
    const stats = {
        total: cards.length || mainIds.length,
        monsters: cards.filter(c => c.type.includes('Monster')).length,
        spells: cards.filter(c => c.type.includes('Spell')).length,
        traps: cards.filter(c => c.type.includes('Trap')).length,
        extra: extraIds.length,
        // Handtraps comunes (Hardcoded IDs populares para detección rápida)
        handTraps: cards.filter(c => [10045474, 14558127, 23434538, 59438930, 52038441, 94145021].includes(c.id)).length
    };

    // 3. Determinar Características
    const isControl = stats.traps > 8;
    const isTier1 = stats.handTraps >= 9;
    
    // 4. Renderizar UI
    
    // A) Starter Image
    const starter = cards.find(c => c.type.includes('Monster') && c.level <= 4 && !c.type.includes('Normal')) || cards[0];
    if (starter && starter.card_images) {
        document.getElementById('metaStarterImg').src = starter.card_images[0].image_url;
        document.getElementById('metaStarterName').textContent = starter.name;
    }

    // B) Stats List
    document.getElementById('metaStatsList').innerHTML = `
        <div class="data-row"><span class="data-label">Main Deck</span> <span class="data-value">${stats.total}</span></div>
        <div class="data-row"><span class="data-label">Monstruos</span> <span class="data-value">${stats.monsters}</span></div>
        <div class="data-row"><span class="data-label">Magias</span> <span class="data-value">${stats.spells}</span></div>
        <div class="data-row"><span class="data-label">Trampas</span> <span class="data-value">${stats.traps}</span></div>
        <div class="data-row"><span class="data-label">Extra Deck</span> <span class="data-value">${stats.extra}</span></div>
    `;

    // C) Profile List
    const powerColor = isTier1 ? '#4caf50' : '#ffcc00';
    document.getElementById('metaProfileList').innerHTML = `
        <div class="data-row"><span class="data-label">Arquetipo</span> <span class="data-value">${deckName.replace('.ydk','').split('_')[0]}</span></div>
        <div class="data-row"><span class="data-label">Velocidad</span> <span class="data-value">${isControl ? 'Lenta (Control)' : 'Rápida (Combo)'}</span></div>
        <div class="data-row"><span class="data-label">Handtraps</span> <span class="data-value">${stats.handTraps}</span></div>
        <div style="margin-top:15px; text-align:center;">
            <span class="tier-badge" style="background:${powerColor}; color:#000;">
                ${isTier1 ? 'META / TIER 1' : 'ROGUE / TIER 2'}
            </span>
        </div>
    `;
}

// ==========================================
// 6. AUTO-ARRANQUE SEGURO
// ==========================================

// Intenta arrancar al cargar el script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMetaTools);
} else {
    // Si ya cargó, ejecuta inmediatamente
    initMetaTools();
}

// Respaldo: Reintentar cada 500ms hasta que el contenedor exista
// (Soluciona problemas si el HTML de la pestaña se genera dinámicamente)
const safetyCheck = setInterval(() => {
    if (document.getElementById('metaToolsContent') && !isMetaInitialized) {
        initMetaTools();
        clearInterval(safetyCheck);
    }
}, 500);

// Exponer init manualmente por si acaso
window.initMetaTools = initMetaTools;