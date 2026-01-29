// META TOOLS MODULE
// Este módulo maneja la funcionalidad de la pestaña META Tools

// CSS específico para el módulo META Tools
const metaToolsStyles = `
<style id="meta-tools-styles">
/* Estilos específicos para META Tools */
.meta-tools-container {
    padding: 20px;
}

.meta-section {
    background: linear-gradient(135deg, #001f3f, #003366);
    border: 2px solid #ffcc00;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}

.meta-section-title {
    color: #ffcc00;
    font-size: 1.8em;
    font-weight: bold;
    margin-bottom: 15px;
    text-align: center;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
}

.meta-deck-selector {
    margin-bottom: 20px;
}

.meta-deck-selector label {
    color: #ffcc00;
    font-weight: bold;
    margin-right: 10px;
}

.meta-deck-selector select {
    background-color: #002244;
    color: #fff;
    border: 2px solid #ffcc00;
    padding: 10px;
    border-radius: 8px;
    font-size: 16px;
    min-width: 300px;
}

.meta-deck-info {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 20px;
    margin-top: 20px;
}

.meta-deck-image {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.meta-deck-image img {
    max-width: 200px;
    border: 3px solid #ffcc00;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}

.meta-deck-image-label {
    color: #ffcc00;
    font-weight: bold;
    margin-top: 10px;
    text-align: center;
}

.meta-deck-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.meta-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.meta-stat-card {
    background: rgba(0, 31, 63, 0.7);
    border: 2px solid #ff9900;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
}

.meta-stat-label {
    color: #ffcc00;
    font-size: 0.9em;
    font-weight: bold;
    margin-bottom: 5px;
}

.meta-stat-value {
    color: #fff;
    font-size: 1.5em;
    font-weight: bold;
}

.meta-characteristics {
    background: rgba(0, 31, 63, 0.7);
    border: 2px solid #ff9900;
    border-radius: 8px;
    padding: 15px;
}

.meta-characteristics-title {
    color: #ffcc00;
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
}

.meta-characteristic-item {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    margin-bottom: 5px;
    background: rgba(0, 51, 102, 0.5);
    border-radius: 4px;
}

.meta-characteristic-label {
    color: #ffcc00;
    font-weight: bold;
}

.meta-characteristic-value {
    color: #fff;
}

.meta-loading {
    text-align: center;
    color: #ffcc00;
    font-size: 1.2em;
    padding: 40px;
}

.meta-error {
    text-align: center;
    color: #ff6b6b;
    font-size: 1.2em;
    padding: 40px;
    background: rgba(255, 0, 0, 0.1);
    border: 2px solid #ff6b6b;
    border-radius: 8px;
}

@media (max-width: 768px) {
    .meta-deck-info {
        grid-template-columns: 1fr;
    }
    
    .meta-stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Variables globales del módulo
let metaDecks = [];
let currentMetaDeck = null;

// Función principal de inicialización
function initMetaTools() {
    console.log('Inicializando META Tools...');
    
    // Inyectar estilos si no existen
    if (!document.getElementById('meta-tools-styles')) {
        document.head.insertAdjacentHTML('beforeend', metaToolsStyles);
    }
    
    // Renderizar la interfaz
    renderMetaToolsInterface();
    
    // Cargar los decks META disponibles
    loadMetaDecks();
}

// Renderizar la interfaz principal
function renderMetaToolsInterface() {
    const container = document.getElementById('metatoolsContent');
    
    container.innerHTML = `
        <div class="meta-tools-container">
            <h2 style="color: #ffcc00; text-align: center; font-size: 2.5em; margin-bottom: 20px;">META Tools</h2>
            
            <!-- Sección 1: Evaluación de Decks META -->
            <div class="meta-section">
                <div class="meta-section-title">📊 Evaluación de Power Level</div>
                
                <div class="meta-deck-selector">
                    <label for="metaDeckSelect">Seleccionar Deck META:</label>
                    <select id="metaDeckSelect" onchange="selectMetaDeck(this.value)">
                        <option value="">-- Selecciona un deck --</option>
                    </select>
                </div>
                
                <div id="metaDeckDisplay" style="display: none;">
                    <div class="meta-deck-info">
                        <div class="meta-deck-image">
                            <img id="metaDeckStarterImage" src="" alt="Starter Card">
                            <div class="meta-deck-image-label" id="metaDeckStarterName">Starter Card</div>
                        </div>
                        
                        <div class="meta-deck-details">
                            <div>
                                <h3 style="color: #ffcc00; margin-bottom: 10px;">Información del Deck</h3>
                                <div style="color: #fff;">
                                    <p><strong style="color: #ffcc00;">Nombre:</strong> <span id="metaDeckName"></span></p>
                                    <p><strong style="color: #ffcc00;">Total de Cartas:</strong> <span id="metaDeckTotal"></span></p>
                                    <p><strong style="color: #ffcc00;">Main Deck:</strong> <span id="metaDeckMain"></span></p>
                                    <p><strong style="color: #ffcc00;">Extra Deck:</strong> <span id="metaDeckExtra"></span></p>
                                    <p><strong style="color: #ffcc00;">Side Deck:</strong> <span id="metaDeckSide"></span></p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 style="color: #ffcc00; margin-bottom: 10px;">Deck Stats</h3>
                                <div class="meta-stats-grid" id="metaDeckStats">
                                    <!-- Stats dinámicas -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="meta-characteristics">
                        <div class="meta-characteristics-title">Características del Deck</div>
                        <div id="metaDeckCharacteristics">
                            <!-- Características dinámicas -->
                        </div>
                    </div>
                </div>
                
                <div id="metaDeckLoading" class="meta-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Cargando deck...</p>
                </div>
                
                <div id="metaDeckError" class="meta-error" style="display: none;"></div>
            </div>
            
            <!-- Placeholder para futuras secciones -->
            <div class="meta-section" style="opacity: 0.6;">
                <div class="meta-section-title">🔮 Próximas Secciones</div>
                <p style="text-align: center; color: #aaa;">Más herramientas META próximamente...</p>
            </div>
        </div>
    `;
}

// Cargar decks desde la carpeta META
async function loadMetaDecks() {
    try {
        // Obtener la fecha actual en formato DD-MM-YYYY
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateFolder = `${day}-${month}-${year}`;
        
        console.log(`Buscando decks en: META/${dateFolder}/`);
        
        // Intentar cargar la lista de archivos
        // Nota: Esto requiere que el servidor permita listar archivos o que tengamos una lista predefinida
        const response = await fetch(`META/${dateFolder}/`);
        
        if (!response.ok) {
            throw new Error(`No se pudo acceder a la carpeta META/${dateFolder}/`);
        }
        
        // Parsear la lista de archivos (esto depende del servidor)
        // Por ahora, usaremos una lista de ejemplo
        const exampleDecks = [
            'Snake-Eye.ydk',
            'Yubel.ydk',
            'Centur-Ion.ydk',
            'Tenpai.ydk'
        ];
        
        const select = document.getElementById('metaDeckSelect');
        select.innerHTML = '<option value="">-- Selecciona un deck --</option>';
        
        exampleDecks.forEach(deckName => {
            const option = document.createElement('option');
            option.value = `META/${dateFolder}/${deckName}`;
            option.textContent = deckName.replace('.ydk', '');
            select.appendChild(option);
        });
        
        console.log('Decks cargados:', exampleDecks);
        
    } catch (error) {
        console.error('Error al cargar decks META:', error);
        const errorDiv = document.getElementById('metaDeckError');
        errorDiv.textContent = `Error: ${error.message}. Asegúrate de que la carpeta META con la fecha de hoy existe.`;
        errorDiv.style.display = 'block';
    }
}

// Seleccionar y cargar un deck META
async function selectMetaDeck(deckPath) {
    if (!deckPath) {
        document.getElementById('metaDeckDisplay').style.display = 'none';
        return;
    }
    
    // Mostrar loading
    document.getElementById('metaDeckLoading').style.display = 'block';
    document.getElementById('metaDeckDisplay').style.display = 'none';
    document.getElementById('metaDeckError').style.display = 'none';
    
    try {
        // Cargar el archivo .ydk
        const response = await fetch(deckPath);
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo del deck');
        }
        
        const ydkContent = await response.text();
        
        // Parsear el deck
        const deck = parseYDKFile(ydkContent);
        
        // Obtener información de las cartas desde la API
        await enrichDeckWithCardData(deck);
        
        // Guardar deck actual
        currentMetaDeck = deck;
        currentMetaDeck.name = deckPath.split('/').pop().replace('.ydk', '');
        
        // Mostrar información del deck
        displayMetaDeck(currentMetaDeck);
        
    } catch (error) {
        console.error('Error al cargar deck:', error);
        const errorDiv = document.getElementById('metaDeckError');
        errorDiv.textContent = `Error al cargar el deck: ${error.message}`;
        errorDiv.style.display = 'block';
    } finally {
        document.getElementById('metaDeckLoading').style.display = 'none';
    }
}

// Parsear archivo .ydk
function parseYDKFile(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    let section = null;
    
    const deck = {
        main: [],
        extra: [],
        side: []
    };
    
    lines.forEach(line => {
        if (line.startsWith('#main')) {
            section = 'main';
        } else if (line.startsWith('#extra')) {
            section = 'extra';
        } else if (line.startsWith('!side')) {
            section = 'side';
        } else if (line.startsWith('#') || line.startsWith('!')) {
            // Ignorar otros metadatos
        } else {
            const cardId = parseInt(line);
            if (!isNaN(cardId) && section) {
                deck[section].push(cardId);
            }
        }
    });
    
    return deck;
}

// Enriquecer deck con datos de cartas desde la API
async function enrichDeckWithCardData(deck) {
    // Obtener todos los IDs únicos
    const allIds = [...new Set([...deck.main, ...deck.extra, ...deck.side])];
    
    // Cargar datos de cartas (usar la variable global allCards si existe)
    if (typeof allCards !== 'undefined' && allCards.length > 0) {
        deck.cards = allIds.map(id => {
            const card = allCards.find(c => c.id == id);
            return card || { id, name: 'Desconocida', type: 'Unknown' };
        });
    } else {
        // Si no hay datos cargados, intentar cargar desde la API
        try {
            const response = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php');
            const data = await response.json();
            const apiCards = data.data;
            
            deck.cards = allIds.map(id => {
                const card = apiCards.find(c => c.id == id);
                return card || { id, name: 'Desconocida', type: 'Unknown' };
            });
        } catch (error) {
            console.error('Error al cargar datos de cartas:', error);
            deck.cards = allIds.map(id => ({ id, name: 'Desconocida', type: 'Unknown' }));
        }
    }
}

// Mostrar información del deck META
function displayMetaDeck(deck) {
    // Ocultar mensajes de error/loading
    document.getElementById('metaDeckError').style.display = 'none';
    document.getElementById('metaDeckLoading').style.display = 'none';
    document.getElementById('metaDeckDisplay').style.display = 'block';
    
    // Información básica
    document.getElementById('metaDeckName').textContent = deck.name;
    document.getElementById('metaDeckTotal').textContent = deck.main.length + deck.extra.length + deck.side.length;
    document.getElementById('metaDeckMain').textContent = deck.main.length;
    document.getElementById('metaDeckExtra').textContent = deck.extra.length;
    document.getElementById('metaDeckSide').textContent = deck.side.length;
    
    // Encontrar la primera carta "starter"
    const starterCard = findStarterCard(deck);
    if (starterCard) {
        document.getElementById('metaDeckStarterImage').src = starterCard.card_images[0].image_url_small;
        document.getElementById('metaDeckStarterName').textContent = starterCard.name;
    } else {
        document.getElementById('metaDeckStarterImage').src = 'https://images.ygoprodeck.com/images/cards/cardback.jpg';
        document.getElementById('metaDeckStarterName').textContent = 'No Starter';
    }
    
    // Calcular y mostrar estadísticas
    const stats = calculateDeckStats(deck);
    displayDeckStats(stats);
    
    // Mostrar características
    const characteristics = analyzeDeckCharacteristics(deck);
    displayDeckCharacteristics(characteristics);
}

// Encontrar carta starter (primera con clasificación de starter según lógica del deck)
function findStarterCard(deck) {
    // Por ahora, buscamos cartas que típicamente son starters
    // Esto se puede mejorar con clasificación más sofisticada
    
    const mainDeckCards = deck.main.map(id => deck.cards.find(c => c.id == id)).filter(c => c);
    
    // Buscar cartas de bajo nivel con efectos de búsqueda o invocación
    const starterKeywords = ['search', 'add', 'special summon', 'from your deck', 'normal summon'];
    
    for (const card of mainDeckCards) {
        if (card.desc) {
            const desc = card.desc.toLowerCase();
            if (starterKeywords.some(keyword => desc.includes(keyword)) && 
                card.type && card.type.includes('Monster') && 
                (!card.level || card.level <= 4)) {
                return card;
            }
        }
    }
    
    // Si no encuentra, retornar la primera carta del main deck
    return mainDeckCards[0] || null;
}

// Calcular estadísticas del deck
function calculateDeckStats(deck) {
    const cards = deck.main.map(id => deck.cards.find(c => c.id == id)).filter(c => c);
    
    // Contar tipos
    const monsters = cards.filter(c => c.type && c.type.includes('Monster')).length;
    const spells = cards.filter(c => c.type && c.type.includes('Spell')).length;
    const traps = cards.filter(c => c.type && c.type.includes('Trap')).length;
    
    // Ratio
    const ratio = `${monsters}/${spells}/${traps}`;
    
    // Nivel promedio de monstruos
    const monsterCards = cards.filter(c => c.level && c.type && c.type.includes('Monster'));
    const avgLevel = monsterCards.length > 0 
        ? (monsterCards.reduce((sum, c) => sum + c.level, 0) / monsterCards.length).toFixed(1)
        : 0;
    
    // Contar hand traps (cartas trampa de mano)
    const handTraps = cards.filter(c => 
        c.desc && (
            c.desc.toLowerCase().includes('from your hand') ||
            c.desc.toLowerCase().includes('you can discard') ||
            c.name.includes('Ash Blossom') ||
            c.name.includes('Effect Veiler') ||
            c.name.includes('Infinite Impermanence')
        )
    ).length;
    
    return {
        ratio,
        monsters,
        spells,
        traps,
        avgLevel,
        handTraps,
        extraDeckSize: deck.extra.length
    };
}

// Mostrar estadísticas
function displayDeckStats(stats) {
    const container = document.getElementById('metaDeckStats');
    
    container.innerHTML = `
        <div class="meta-stat-card">
            <div class="meta-stat-label">Ratio M/S/T</div>
            <div class="meta-stat-value">${stats.ratio}</div>
        </div>
        <div class="meta-stat-card">
            <div class="meta-stat-label">Monstruos</div>
            <div class="meta-stat-value">${stats.monsters}</div>
        </div>
        <div class="meta-stat-card">
            <div class="meta-stat-label">Magias</div>
            <div class="meta-stat-value">${stats.spells}</div>
        </div>
        <div class="meta-stat-card">
            <div class="meta-stat-label">Trampas</div>
            <div class="meta-stat-value">${stats.traps}</div>
        </div>
        <div class="meta-stat-card">
            <div class="meta-stat-label">Nivel Promedio</div>
            <div class="meta-stat-value">${stats.avgLevel}</div>
        </div>
        <div class="meta-stat-card">
            <div class="meta-stat-label">Hand Traps</div>
            <div class="meta-stat-value">${stats.handTraps}</div>
        </div>
        <div class="meta-stat-card">
            <div class="meta-stat-label">Extra Deck</div>
            <div class="meta-stat-value">${stats.extraDeckSize}</div>
        </div>
    `;
}

// Analizar características del deck
function analyzeDeckCharacteristics(deck) {
    const cards = [...deck.main, ...deck.extra].map(id => deck.cards.find(c => c.id == id)).filter(c => c);
    
    // Atributos
    const attributes = {};
    cards.forEach(c => {
        if (c.attribute) {
            attributes[c.attribute] = (attributes[c.attribute] || 0) + 1;
        }
    });
    const mainAttribute = Object.keys(attributes).length > 0 
        ? Object.keys(attributes).reduce((a, b) => attributes[a] > attributes[b] ? a : b)
        : 'N/A';
    
    // Tipos
    const types = {};
    cards.forEach(c => {
        if (c.race) {
            types[c.race] = (types[c.race] || 0) + 1;
        }
    });
    const mainType = Object.keys(types).length > 0 
        ? Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b)
        : 'N/A';
    
    // Arquetipo principal
    const archetypes = {};
    cards.forEach(c => {
        if (c.archetype) {
            archetypes[c.archetype] = (archetypes[c.archetype] || 0) + 1;
        }
    });
    const mainArchetype = Object.keys(archetypes).length > 0 
        ? Object.keys(archetypes).reduce((a, b) => archetypes[a] > archetypes[b] ? a : b)
        : 'N/A';
    
    // Velocidad del deck (basado en nivel promedio y cartas de búsqueda)
    const searchCards = cards.filter(c => 
        c.desc && (c.desc.toLowerCase().includes('search') || c.desc.toLowerCase().includes('add'))
    ).length;
    
    let speed = 'Media';
    if (searchCards >= 8) speed = 'Rápida';
    else if (searchCards <= 3) speed = 'Lenta';
    
    // Combo vs Control
    const comboKeywords = ['special summon', 'xyz summon', 'synchro summon', 'link summon'];
    const controlKeywords = ['negate', 'destroy', 'remove', 'banish'];
    
    let comboCount = 0;
    let controlCount = 0;
    
    cards.forEach(c => {
        if (c.desc) {
            const desc = c.desc.toLowerCase();
            if (comboKeywords.some(kw => desc.includes(kw))) comboCount++;
            if (controlKeywords.some(kw => desc.includes(kw))) controlCount++;
        }
    });
    
    const strategy = comboCount > controlCount ? 'Combo' : 'Control';
    
    // Power Level (simplificado por ahora)
    let powerLevel = 'Tier 2';
    if (searchCards >= 10 && deck.extra.length >= 12) powerLevel = 'Tier 1';
    else if (searchCards <= 5 || deck.extra.length <= 8) powerLevel = 'Tier 3';
    
    return {
        mainAttribute,
        mainType,
        mainArchetype,
        speed,
        strategy,
        powerLevel,
        consistency: searchCards >= 6 ? 'Alta' : searchCards >= 3 ? 'Media' : 'Baja'
    };
}

// Mostrar características
function displayDeckCharacteristics(chars) {
    const container = document.getElementById('metaDeckCharacteristics');
    
    container.innerHTML = `
        <div class="meta-characteristic-item">
            <span class="meta-characteristic-label">Atributo Principal:</span>
            <span class="meta-characteristic-value">${chars.mainAttribute}</span>
        </div>
        <div class="meta-characteristic-item">
            <span class="meta-characteristic-label">Tipo Principal:</span>
            <span class="meta-characteristic-value">${chars.mainType}</span>
        </div>
        <div class="meta-characteristic-item">
            <span class="meta-characteristic-label">Arquetipo Principal:</span>
            <span class="meta-characteristic-value">${chars.mainArchetype}</span>
        </div>
        <div class="meta-characteristic-item">
            <span class="meta-characteristic-label">Velocidad:</span>
            <span class="meta-characteristic-value">${chars.speed}</span>
        </div>
        <div class="meta-characteristic-item">
            <span class="meta-characteristic-label">Estrategia:</span>
            <span class="meta-characteristic-value">${chars.strategy}</span>
        </div>
        <div class="meta-characteristic-item">
            <span class="meta-characteristic-label">Consistencia:</span>
            <span class="meta-characteristic-value">${chars.consistency}</span>
        </div>
        <div class="meta-characteristic-item">
            <span class="meta-characteristic-label">Power Level:</span>
            <span class="meta-characteristic-value" style="color: ${chars.powerLevel === 'Tier 1' ? '#4caf50' : chars.powerLevel === 'Tier 2' ? '#ffcc00' : '#ff6b6b'};">
                ${chars.powerLevel}
            </span>
        </div>
    `;
}

// Exportar funciones globales
window.initMetaTools = initMetaTools;
window.selectMetaDeck = selectMetaDeck;
