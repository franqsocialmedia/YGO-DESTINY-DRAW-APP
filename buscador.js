// ================================================================
// BUSCADOR.JS - Destiny Draw Yugioh
// Módulo: Pestaña BUSCADOR
// ================================================================

console.log('buscador.js loaded');

// ================================================================
// RENDERIZAR HTML DE LA SECCIÓN
// ================================================================

function renderBuscadorSection() {
    const section = document.getElementById('search');
    section.innerHTML = `
        <h2 class="text-2xl mb-4">Buscar cartas (en ingles)</h2>
        <div class="search-controls flex flex-wrap items-center mb-4">
            <input type="text" id="nameSearch" placeholder="Buscar por nombre o parte del nombre" class="flex-grow">
            <input type="text" id="tagsSearch" placeholder="Palabras clave (separadas por coma)" class="flex-grow mt-2 md:mt-0">
            <button onclick="searchCards()" class="bg-blue-600 hover:bg-blue-700 text-white mt-2 md:mt-0 ml-0 md:ml-4">Buscar</button>
            <button onclick="clearSearch()" class="clear-btn mt-2 md:mt-0 ml-0 md:ml-2">Limpiar</button>
        </div>
        <div id="results" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
    `;
    
    // Event listeners for Enter key
    document.getElementById('nameSearch').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') searchCards();
    });
    
    document.getElementById('tagsSearch').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') searchCards();
    });
}

// ================================================================
// FUNCIONES DE BÚSQUEDA
// ================================================================

function clearSearch() {
    document.getElementById('nameSearch').value = '';
    document.getElementById('tagsSearch').value = '';
    document.getElementById('results').innerHTML = '';
}

async function searchCards() {
    const name = document.getElementById('nameSearch').value.toLowerCase();
    const tags = document.getElementById('tagsSearch').value.toLowerCase().split(',').map(t => t.trim()).filter(t => t);
    
    // Load cards if not loaded
    if (cardsData.length === 0) {
        try {
            const res = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php');
            const data = await res.json();
            cardsData = data.data;
            buildCardNameDatabase();
        } catch (error) {
            console.error("Error fetching card data:", error);
            alert('Error al cargar datos de cartas. Intenta de nuevo más tarde.');
            return;
        }
    }

    // Unlock secret feature
    if (name === 'g' && tags.length === 0 && !dataManagementUnlocked) {
        dataManagementUnlocked = true;
        const dataManagementTab = document.querySelector('.tab[data-target="data-management"]');
        if (dataManagementTab) {
            dataManagementTab.style.display = 'flex';
        }
    }

    let results = cardsData.filter(c => c.name.toLowerCase().includes(name));
    
    if (tags.length) {
        results = results.filter(c => {
            const text = JSON.stringify(c).toLowerCase();
            return tags.every(tag => text.includes(tag));
        });
    }
    
    results = results.slice(0, 300);
    const container = document.getElementById('results');
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400">No se encontraron cartas.</p>';
        return;
    }

    // Get card counts in library
    const libraryCardCounts = new Map();
    library.main.forEach(card => {
        if (card.isGroup) {
            card.cards.forEach(groupCard => {
                libraryCardCounts.set(groupCard.id, (libraryCardCounts.get(groupCard.id) || 0) + groupCard.copies);
            });
        } else {
            libraryCardCounts.set(card.id, (libraryCardCounts.get(card.id) || 0) + card.copies);
        }
    });
    library.extra.forEach(card => {
        libraryCardCounts.set(card.id, (libraryCardCounts.get(card.id) || 0) + card.copies);
    });

    results.forEach(c => {
        const div = document.createElement('div');
        const cardCountInLibrary = libraryCardCounts.get(c.id) || 0;
        
        div.className = `card ${cardCountInLibrary > 0 ? 'in-library' : ''}`;
        let cardCountOverlay = '';
        if (cardCountInLibrary > 0) {
            cardCountOverlay = `<div class="card-count-overlay">${cardCountInLibrary}</div>`;
        }

        div.innerHTML = `
            ${cardCountOverlay}
            <img src="${c.card_images[0].image_url_small}" alt="${c.name}" onerror="this.onerror=null;this.src='https://placehold.co/150x200/001f3f/ffcc00?text=No+Img';">
            <div>
                <strong>${c.name}</strong><br>
                ${c.type}
                ${c.atk !== undefined ? `<br>ATK:${c.atk} / DEF:${c.def}` : ''}
            </div>
        `;
        div.onclick = () => showPanel(c, 'add');
        container.appendChild(div);
    });
}

// ================================================================
// PANEL FLOTANTE DE DETALLES
// ================================================================

function showPanel(card, mode) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('cardModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cardModal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        document.body.appendChild(modal);
    }
    
    const isExtra = isExtraDeckCard(card);
    const targetDeck = isExtra ? library.extra : library.main;
    const cardInLibrary = targetDeck.find(c => c.id === card.id);
    const currentCopies = cardInLibrary ? cardInLibrary.copies : 0;

    modal.innerHTML = `
        <div class="floating-panel">
            <h3>${card.name}</h3>
            <img src="${card.card_images[0].image_url}" alt="${card.name}" style="max-width: 200px; display: block; margin: 10px auto;">
            <p><strong>Tipo:</strong> ${card.type}</p>
            ${card.atk !== undefined ? `<p><strong>ATK:</strong> ${card.atk} / <strong>DEF:</strong> ${card.def}</p>` : ''}
            ${card.level ? `<p><strong>Level:</strong> ${card.level}</p>` : ''}
            ${card.attribute ? `<p><strong>Attribute:</strong> ${card.attribute}</p>` : ''}
            <p><strong>Descripción:</strong> ${card.desc}</p>
            
            <div style="margin-top: 15px;">
                <p>Copias en deck: <span id="panelCopies">${currentCopies}</span></p>
                <button class="quantity-btn" onclick="increaseCardCopies(${card.id}, ${isExtra})" ${currentCopies >= 3 ? 'disabled' : ''}>+</button>
                <button class="quantity-btn" onclick="decreaseCardCopies(${card.id}, ${isExtra})" ${currentCopies === 0 ? 'disabled' : ''}>-</button>
            </div>
            
            <button onclick="closePanel()" style="margin-top: 15px; background-color: #dc3545;">Cerrar</button>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Close on background click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closePanel();
        }
    };
}

function closePanel() {
    const modal = document.getElementById('cardModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function increaseCardCopies(id, isExtra) {
    const targetDeck = isExtra ? library.extra : library.main;
    let card = targetDeck.find(c => c.id === id);
    
    if (!card) {
        const cardData = cardsData.find(c => c.id === id);
        card = {
            id: id,
            name: cardData.name,
            copies: 0,
            role: '',
            keywords: []
        };
        targetDeck.push(card);
    }
    
    if (card.copies < 3) {
        card.copies++;
        updatePanelQuantity(id, card.copies);
        updateMainDeckCount();
    }
}

function decreaseCardCopies(id, isExtra) {
    const targetDeck = isExtra ? library.extra : library.main;
    const cardIndex = targetDeck.findIndex(c => c.id === id);
    
    if (cardIndex !== -1) {
        if (targetDeck[cardIndex].copies > 1) {
            targetDeck[cardIndex].copies--;
        } else {
            targetDeck.splice(cardIndex, 1);
        }
        updatePanelQuantity(id, targetDeck[cardIndex] ? targetDeck[cardIndex].copies : 0);
        updateMainDeckCount();
    }
}

function updatePanelQuantity(cardId, newCopies) {
    const panelCopies = document.getElementById('panelCopies');
    if (panelCopies) {
        panelCopies.textContent = newCopies;
    }
}

function updateMainDeckCount() {
    const mainCount = library.main.reduce((sum, card) => sum + (card.copies || 0), 0);
    const countElement = document.getElementById('mainDeckCardCount');
    if (countElement) {
        countElement.textContent = mainCount;
    }
}

// ================================================================
// INICIALIZACIÓN
// ================================================================

function initBuscador() {
    console.log('Initializing Buscador module');
    renderBuscadorSection();
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    initBuscador();
});

window.initBuscador = initBuscador;
window.searchCards = searchCards;
window.clearSearch = clearSearch;
window.showPanel = showPanel;
window.closePanel = closePanel;
window.increaseCardCopies = increaseCardCopies;
window.decreaseCardCopies = decreaseCardCopies;

console.log('buscador.js fully loaded');
