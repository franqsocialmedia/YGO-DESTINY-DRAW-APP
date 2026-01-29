// ================================================================
// APP-CORE.JS - Destiny Draw Yugioh
// Núcleo de la aplicación: Variables globales y funciones compartidas
// ================================================================

console.log('app-core.js loaded successfully.');
console.log('Codigo creado por: Giantfranco Santos (Panda24 / Gmask) con la ayuda y apoyo de Dr. Darus y Kanzaki de la Comunidad de Discord: "Reino del Caos" by: Hyliank');

function creators(){
	confirm(`Esta APP fue creada gracias al apoyo de Kanzaki y Dr. Darius!!! Muchas gracias por aportar a esta gran comunidad de Yugioh! 2025`)
}

// ================================================================
// VARIABLES GLOBALES
// ================================================================

let cardsData = [];
let library = { name: 'Mi Deck', main: [], extra: [], groups: [], incompatiblePairs: [] };
let selectedCards = new Set();
let groupCounter = 1;
let compareDeck1 = null;
let compareDeck1Name = '';
let compareDeck2 = null;
let compareDeck2Name = '';
let currentDeckSelectionForModal = 0;
let deckSelectionModalPurpose = '';
let cardNameDatabase = new Map();
let scrollButtonTimeout;
let currentEditedCard = null;
let dataManagementUnlocked = false;
let compareDecksUnlocked = false;
let simplifiedPlayerDeck = null;
let simplifiedPlayerDeckName = '';
let simplifiedSimulationMode = 'twoPlayers';
let simplifiedHandSize = 5;

// ================================================================
// CONFIGURACIÓN POR DEFECTO
// ================================================================

const defaultKeywordDefinitions = {
  "searcher": ["add 1", "add 2", "add 3", "add 4", "add up", "add it", "add that"],
  "trigger": ["Summoned:", "If this card is Normal Summoned", "If this card is Normal or Special Summoned","When this card is Normal Summoned", "When this card is Normal or Special Summoned"],
  "extender": ["you can special summon", "you can normal summon", "special summon this", "special summon it"],
  "draw-engine": ["draw 1", "draw 2", "draw 3"],
  "disruption": ["opponent's monster", "your opponent", "when your opponent"],
  "negater": ["negate the effects", "negate its effects"],
  "removal": ["target", "choice", "destroy"],
  "spell": ["spell"],
  "trap": ["trap"]
};

const defaultKeywordCounters = {
  "searcher": ["Ash Blossom & Joyous Spring", "Droll & Lock Bird"],
  "extender": ["Nibiru, the Primal Being", "Maxx \"C\""],
  "draw-engine": ["Ash Blossom & Joyous Spring"],
  "disruption": ["Called by the Grave"],
  "negater": ["Super Polymerization"],
  "removal": ["Book of Moon"],
  "spell": ["Anti-Spell Fragrance"],
  "trap": ["Jinzo"]
};

const defaultMetaSources = [
    { id: "md_meta", name: "Master Duel Meta", url: "https://www.masterduelmeta.com/tier-list", description: "Tier list actual del metajuego de Master Duel" },
    { id: "yg_meta", name: "Yugioh Meta", url: "https://www.yugiohmeta.com/tier-list", description: "Análisis del metaguego de TCG" }
];

const defaultCardRoles = ["Starter", "Extender", "Brick", "Handtrap", "Boardbreaker"];

let keywordDefinitions = {...defaultKeywordDefinitions};
let keywordCounters = {...defaultKeywordCounters};
let metaSources = [...defaultMetaSources];
let cardRoles = [...defaultCardRoles];

// ================================================================
// NAVEGACIÓN ENTRE PESTAÑAS
// ================================================================

function showTab(target) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    const selectedSection = document.getElementById(target);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    const selectedTab = document.querySelector(`[data-target="${target}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// ================================================================
// UTILIDADES
// ================================================================

function isExtraDeckCard(card) {
    const extraTypes = ['Fusion Monster', 'Synchro Monster', 'XYZ Monster', 'Link Monster', 'Xyz Monster'];
    return card.type && extraTypes.some(type => card.type.includes(type));
}

function buildCardNameDatabase() {
    cardNameDatabase.clear();
    cardsData.forEach(card => {
        const normalizedName = card.name.toLowerCase();
        cardNameDatabase.set(normalizedName, card);
    });
}

// ================================================================
// SCROLL BUTTONS
// ================================================================

function setupScrollButtons() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
    
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    if (scrollToBottomBtn) {
        scrollToBottomBtn.addEventListener('click', () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
    }
    
    window.addEventListener('scroll', () => {
        clearTimeout(scrollButtonTimeout);
        if (scrollToTopBtn) scrollToTopBtn.style.display = 'block';
        if (scrollToBottomBtn) scrollToBottomBtn.style.display = 'block';
        
        scrollButtonTimeout = setTimeout(() => {
            if (scrollToTopBtn) scrollToTopBtn.style.display = 'none';
            if (scrollToBottomBtn) scrollToBottomBtn.style.display = 'none';
        }, 2000);
    });
}

// ================================================================
// INICIALIZACIÓN
// ================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded - Initializing App Core');
    
    // Setup tab navigation
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            showTab(target);
        });
    });
    
    setupScrollButtons();
    
    console.log('App Core initialized successfully');
});

console.log('app-core.js fully loaded');
