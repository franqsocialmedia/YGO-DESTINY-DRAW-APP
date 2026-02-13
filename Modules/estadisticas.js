/* ====================================
   ESTADISTICAS MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Visualizacion de estadisticas y comparacion con meta
   ==================================== */

const Estadisticas = {
    container: null,
    metaDecks: {},
    metaFolders: [],
    currentMetaDeck: null,
    selectedFolder: 'all',
    deckListExpanded: false,

    init: function () {
        this.container = document.getElementById('estadisticas-content');
        if (!this.container) return;

        this.loadMetaData();
        this.render();
        this.createDeckFloatingWidget();
    },

    loadMetaData: function () {
        try {
            const saved = localStorage.getItem('yugioh_meta_decks');
            if (saved) {
                const data = JSON.parse(saved);
                this.metaDecks = data.decks || {};
                this.metaFolders = Object.keys(this.metaDecks).sort((a, b) => {
                    const [mA, yA] = a.split(' ');
                    const [mB, yB] = b.split(' ');
                    const dateA = new Date(parseInt(yA), this.getMonthNumber(mA));
                    const dateB = new Date(parseInt(yB), this.getMonthNumber(mB));
                    return dateB - dateA;
                });
            }
        } catch (error) {
            console.error('Error cargando meta data:', error);
        }
    },

    getMonthNumber: function (monthName) {
        const months = {
            'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3,
            'Mayo': 4, 'Junio': 5, 'Julio': 6, 'Agosto': 7,
            'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
        };
        return months[monthName] || 0;
    },

    saveMetaData: function () {
        try {
            localStorage.setItem('yugioh_meta_decks', JSON.stringify({
                decks: this.metaDecks
            }));
        } catch (error) {
            console.error('Error guardando meta data:', error);
        }
    },

    createFolder: function () {
        const folderName = prompt('Ingresa el mes y año del meta\nEjemplo: Febrero 2026');
        if (!folderName) return;

        const regex = /^[A-Za-z]+ \d{4}$/;
        if (!regex.test(folderName)) {
            alert('Formato invalido. Usa: Mes Año (ejemplo: Febrero 2026)');
            return;
        }

        if (this.metaDecks[folderName]) {
            alert('Esta carpeta ya existe');
            return;
        }

        this.metaDecks[folderName] = [];
        this.metaFolders.unshift(folderName);
        this.saveMetaData();
        this.render();
        alert('Carpeta creada: ' + folderName);
    },

    deleteFolder: function (folderName) {
        if (!confirm('¿Eliminar carpeta "' + folderName + '" y todos sus decks?')) {
            return;
        }

        delete this.metaDecks[folderName];
        this.metaFolders = this.metaFolders.filter(f => f !== folderName);
        this.saveMetaData();
        this.render();
    },

    importYDK: function (folderName) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.ydk';
        input.multiple = true;

        input.onchange = async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            for (let file of files) {
                await this.processYDKFile(file, folderName);
            }

            this.saveMetaData();
            this.render();
            alert(files.length + ' deck(s) importado(s) a ' + folderName);
        };

        input.click();
    },

    processYDKFile: async function (file, folderName) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target.result;
                const deckData = this.parseYDK(content);

                const mostFrequentId = this.getMostFrequentCardId(deckData.cards);

                const deckInfo = {
                    filename: file.name.replace('.ydk', ''),
                    mostFrequentCard: mostFrequentId,
                    cardCount: deckData.cards.length
                };

                if (!this.metaDecks[folderName]) {
                    this.metaDecks[folderName] = [];
                }

                const existingIndex = this.metaDecks[folderName].findIndex(d => d.filename === deckInfo.filename);
                if (existingIndex >= 0) {
                    this.metaDecks[folderName][existingIndex] = deckInfo;
                } else {
                    this.metaDecks[folderName].push(deckInfo);
                }

                resolve();
            };

            reader.readAsText(file);
        });
    },

    parseYDK: function (content) {
        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        const cards = [];
        let section = '';

        for (let line of lines) {
            if (line.startsWith('#') || line.startsWith('!')) {
                section = line;
                continue;
            }

            const cardId = line.trim();
            if (cardId && !isNaN(cardId)) {
                cards.push(cardId);
            }
        }

        return { cards };
    },

    getMostFrequentCardId: function (cards) {
        if (!cards || cards.length === 0) return null;

        const frequency = {};
        cards.forEach(id => {
            frequency[id] = (frequency[id] || 0) + 1;
        });

        let maxCount = 0;
        let mostFrequent = null;

        for (let id in frequency) {
            if (frequency[id] > maxCount) {
                maxCount = frequency[id];
                mostFrequent = id;
            }
        }

        return mostFrequent;
    },

    deleteDeck: function (folderName, deckFilename) {
        if (!confirm('¿Eliminar deck "' + deckFilename + '"?')) {
            return;
        }

        this.metaDecks[folderName] = this.metaDecks[folderName].filter(d => d.filename !== deckFilename);
        this.saveMetaData();
        this.render();
    },

    setFolderFilter: function (folder) {
        this.selectedFolder = folder;
        this.render();
    },

    getFilteredDecks: function () {
        const filtered = [];

        if (this.selectedFolder === 'all') {
            for (let folder in this.metaDecks) {
                this.metaDecks[folder].forEach(deck => {
                    filtered.push({ ...deck, folder });
                });
            }
        } else {
            const decks = this.metaDecks[this.selectedFolder] || [];
            decks.forEach(deck => {
                filtered.push({ ...deck, folder: this.selectedFolder });
            });
        }

        return filtered;
    },

    viewMetaDeck: function (folderName, deckFilename) {
        if (!Deck || !Deck.getSavedDecks) return;

        const savedDecks = Deck.getSavedDecks();
        
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        let deckListHTML = '';
        savedDecks.forEach(deck => {
            const mainCount = Object.values(deck.cards).filter(c => c.location === 'main').reduce((s, c) => s + c.qty, 0);
            const extraCount = Object.values(deck.cards).filter(c => c.location === 'extra').reduce((s, c) => s + c.qty, 0);
            
            deckListHTML += `
                <div class="deck-select-item" onclick="Estadisticas.selectAndLoadDeck('${deck.key}')">
                    <span class="deck-select-name">${deck.name}</span>
                    <span class="deck-select-count">Main: ${mainCount} | Extra: ${extraCount}</span>
                </div>
            `;
        });

        overlay.innerHTML = `
            <div class="deck-modal">
                <h3>Seleccionar Deck para Comparar</h3>
                <p>Deck del Meta: <strong>${deckFilename}</strong></p>
                <p class="deck-modal-note">Selecciona un deck guardado para cargar y comparar</p>
                <div class="deck-select-list">
                    ${savedDecks.length === 0 ? '<p class="stats-empty">No hay decks guardados</p>' : deckListHTML}
                </div>
                <div class="deck-modal-buttons">
                    <button class="btn btn-secondary" onclick="Estadisticas.closeModal()">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    selectAndLoadDeck: function (deckKey) {
        if (Deck && Deck.loadDeck) {
            Deck.loadDeck(deckKey);
        }
        this.closeModal();
        this.updateDeckStats();
        this.updateFloatingWidget();
    },

    closeModal: function () {
        const overlay = document.querySelector('.deck-overlay');
        if (overlay) overlay.remove();
    },

    renderDeckStats: function () {
        if (!Deck || !Deck.cards || Object.keys(Deck.cards).length === 0) {
            return `
                <div class="stats-empty">
                    <p>No hay deck activo para mostrar estadisticas</p>
                    <p class="stats-help">Ve a "Mi Deck" y carga un deck para ver sus estadisticas</p>
                </div>
            `;
        }

        const stats = Stats.calculateInternalScore(Deck.cards);

        const scoreColor = stats.internalScore >= 7 ? '#00b894' : 
                          stats.internalScore >= 5 ? '#fdcb6e' : '#d63031';

        return `
            <div class="stats-card">
                <div class="stats-header">
                    <h3>Internal Score - ${Deck.name}</h3>
                    <div class="stats-score" style="color: ${scoreColor}">
                        ${stats.internalScore} / 10
                    </div>
                </div>

                <div class="stats-bars">
                    <div class="stat-bar-row">
                        <span class="stat-bar-label">Consistencia (50%)</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar" style="width: ${stats.consistency * 10}%; background: #00b894"></div>
                        </div>
                        <span class="stat-bar-value">${stats.consistency}/10</span>
                    </div>

                    <div class="stat-bar-row">
                        <span class="stat-bar-label">Potencia (30%)</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar" style="width: ${stats.power * 10}%; background: #d63031"></div>
                        </div>
                        <span class="stat-bar-value">${stats.power}/10</span>
                    </div>

                    <div class="stat-bar-row">
                        <span class="stat-bar-label">Resiliencia (20%)</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar" style="width: ${stats.resilience * 10}%; background: #0066cc"></div>
                        </div>
                        <span class="stat-bar-value">${stats.resilience}/10</span>
                    </div>
                </div>

                <div class="stats-footer">
                    <span>Total: ${stats.totalCards} cartas</span>
                </div>
            </div>
        `;
    },

    updateDeckStats: function () {
        const statsSection = document.getElementById('deck-stats-sec');
        if (statsSection) {
            statsSection.innerHTML = this.renderDeckStats();
        }
    },

    createDeckFloatingWidget: function () {
        const widget = document.createElement('div');
        widget.id = 'deck-floating-widget';
        widget.className = 'deck-floating-widget';
        widget.onclick = () => this.toggleDeckList();

        document.body.appendChild(widget);
        this.updateFloatingWidget();
    },
    openDeckFromWidget(deckId) {
    const metaDecks = JSON.parse(localStorage.getItem('yugioh_meta_decks')) || {};
    
    let selectedDeck = null;

    Object.values(metaDecks).forEach(folder => {
        folder.decks.forEach(deck => {
            if (deck.id === deckId) {
                selectedDeck = deck;
            }
        });
    });

    if (!selectedDeck) {
        alert('No se pudo cargar el deck');
        return;
    }

    // Sustituye el deck activo
    Deck.cards = JSON.parse(JSON.stringify(selectedDeck.cards));
    Deck.name = selectedDeck.name;

    Deck.render();

    // Feedback visual
    document
        .querySelectorAll('.widget-deck-item')
        .forEach(el => el.classList.remove('active'));

    const activeItem = document.querySelector(`[data-deck-id="${deckId}"]`);
    if (activeItem) activeItem.classList.add('active');
},


    updateFloatingWidget: function () {
        const widget = document.getElementById('deck-floating-widget');
        if (!widget) return;

        if (!Deck || !Deck.cards || Object.keys(Deck.cards).length === 0) {
            widget.innerHTML = `
                <div class="widget-thumbnail">
                    <div class="widget-no-deck">Sin Deck</div>
                </div>
            `;
            return;
        }

        const mostFrequent = Deck.getMostFrequentCard ? Deck.getMostFrequentCard(Deck.cards) : null;
        const thumbnailUrl = mostFrequent && mostFrequent.data.card_images 
            ? mostFrequent.data.card_images[0].image_url_small 
            : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="116"><rect width="80" height="116" fill="%23003366"/><text x="40" y="63" font-family="sans-serif" font-size="11" text-anchor="middle" fill="%23FFD700">Deck</text></svg>';

        widget.innerHTML = `
            <div class="widget-thumbnail">
                <img src="${thumbnailUrl}" alt="${Deck.name}">
            </div>
        `;
    },

    toggleDeckList: function () {
        if (this.deckListExpanded) {
            this.collapseDeckList();
        } else {
            this.expandDeckList();
        }
    },

    expandDeckList: function () {
        this.deckListExpanded = true;
        const widget = document.getElementById('deck-floating-widget');
        if (!widget) return;

        const savedDecks = Deck.getSavedDecks ? Deck.getSavedDecks() : [];
        const currentDeckKey = Deck.name ? `deck_${Deck.name}` : '';

        let deckListHTML = '';
        savedDecks.forEach(deck => {
            const mainCount = Object.values(deck.cards).filter(c => c.location === 'main').reduce((s, c) => s + c.qty, 0);
            const extraCount = Object.values(deck.cards).filter(c => c.location === 'extra').reduce((s, c) => s + c.qty, 0);
            const isActive = deck.key === currentDeckKey;

            // Obtener imagen de la primera carta del deck
            const firstCard = Object.values(deck.cards)[0];
            const thumbnailUrl = firstCard && firstCard.data && firstCard.data.card_images
                ? firstCard.data.card_images[0].image_url_small
                : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="87"><rect width="60" height="87" fill="%23003366"/><text x="30" y="48" font-family="sans-serif" font-size="10" text-anchor="middle" fill="%23FFD700">Deck</text></svg>';

            deckListHTML += `
                <div class="widget-deck-item ${isActive ? 'active' : ''}" 
                     onclick="event.stopPropagation(); Estadisticas.selectDeckFromWidget('${deck.key}')">
                    <img src="${thumbnailUrl}" class="widget-deck-thumbnail" alt="${deck.name}">
                    <div class="widget-deck-info">
                        <span class="widget-deck-name">${deck.name}</span>
                        <span class="widget-deck-counts">Main: ${mainCount} | Extra: ${extraCount}</span>
                    </div>
                </div>
            `;
        });

        widget.className = 'deck-floating-widget expanded';
        widget.innerHTML = `
            <button class="widget-close-btn" onclick="event.stopPropagation(); Estadisticas.collapseDeckList()">X</button>
            <div class="widget-deck-list">
                ${savedDecks.length === 0 ? '<p class="widget-no-decks">No hay decks guardados</p>' : deckListHTML}
            </div>
        `;

        this.autoCollapseTimeout = setTimeout(() => {
            this.collapseDeckList();
        }, 7000);
    },

    collapseDeckList: function () {
        this.deckListExpanded = false;
        if (this.autoCollapseTimeout) {
            clearTimeout(this.autoCollapseTimeout);
        }
        this.updateFloatingWidget();
        const widget = document.getElementById('deck-floating-widget');
        if (widget) {
            widget.className = 'deck-floating-widget';
        }
    },

    selectDeckFromWidget: function (deckKey) {
        if (Deck && Deck.loadDeck) {
            Deck.loadDeck(deckKey);
        }
        
        // Cambiar a la pestaña "Mi Deck"
        if (window.Navigation && typeof Navigation.showTab === 'function') {
            Navigation.showTab('mideck');   // ✅ nombre correcto del tab
        }
        
        this.updateDeckStats();
        this.collapseDeckList();
        setTimeout(() => {
            this.updateFloatingWidget();
        }, 100);
    },
    initFloatingDeckWidgetEvents() {
    const widget = document.querySelector('.deck-floating-widget');
    if (!widget) return;

    widget.addEventListener('click', (e) => {

        // Botón eliminar (X) → no abrir deck
        if (e.target.classList.contains('meta-deck-delete')) {
            e.stopPropagation();
            return;
        }

        // Buscar el item del deck clickeado
        const deckItem = e.target.closest('.widget-deck-item, .meta-deck-item');
        if (!deckItem) return;

        const deckId = deckItem.dataset.deckId;
        if (!deckId) {
            console.warn('[Stats] Deck sin dataset.deckId');
            return;
        }

        // 👉 ACCIÓN REAL: abrir / sustituir deck
        Estadisticas.openDeckFromWidget(deckId);
    });
},

    render: function () {
        if (!this.container) return;

        const filteredDecks = this.getFilteredDecks();

        let html = `
            <h2>Estadisticas</h2>

            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('deck-stats-sec')">
                Deck Activo - Internal Score
            </h3>
            <div id="deck-stats-sec" class="stats-section">
                ${this.renderDeckStats()}
            </div>

            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('meta-management-sec')">
                Gestion de Carpetas del Meta
            </h3>
            <div id="meta-management-sec" class="stats-section" ">
                <button onclick="Estadisticas.createFolder()" class="btn btn-primary">Crear Carpeta</button>
                <div class="meta-folders-list">
                    ${this.metaFolders.length === 0 ? '<p class="stats-empty">No hay carpetas creadas</p>' : ''}
                    ${this.metaFolders.map(folder => `
                        <div class="meta-folder-item">
                            <span class="folder-name">${folder}</span>
                            <span class="folder-count">${this.metaDecks[folder].length} decks</span>
                            <button onclick="Estadisticas.importYDK('${folder}')" class="btn btn-primary btn-sm">Importar .ydk</button>
                            <button onclick="Estadisticas.deleteFolder('${folder}')" class="btn btn-danger btn-sm">Eliminar</button>
                        </div>
                    `).join('')}
                </div>
            </div>

            <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('meta-decks-sec')">
                Decks del Meta
            </h3>
            <div id="meta-decks-sec" class="stats-section">
                <div class="meta-filter">
                    <label>Filtrar por carpeta:</label>
                    <select onchange="Estadisticas.setFolderFilter(this.value)" class="meta-filter-select">
                        <option value="all" ${this.selectedFolder === 'all' ? 'selected' : ''}>Todo el Meta</option>
                        ${this.metaFolders.map(folder => `
                            <option value="${folder}" ${this.selectedFolder === folder ? 'selected' : ''}>${folder}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="meta-decks-scroll">
                    ${filteredDecks.length === 0 ? '<p class="stats-empty">No hay decks en esta seleccion</p>' : ''}
                    ${filteredDecks.map(deck => `
                        <div class="meta-deck-item" onclick="Estadisticas.viewMetaDeck('${deck.folder}', '${deck.filename}')">
                            <button class="meta-deck-delete" onclick="event.stopPropagation(); Estadisticas.deleteDeck('${deck.folder}', '${deck.filename}')" title="Eliminar">X</button>
                            <div class="meta-deck-thumbnail">
                                <img src="https://images.ygoprodeck.com/images/cards_small/${deck.mostFrequentCard || '0'}.jpg" 
                                     onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22145%22><rect width=%22100%22 height=%22145%22 fill=%22%23003366%22/><text x=%2250%22 y=%2278%22 font-family=%22sans-serif%22 font-size=%2212%22 text-anchor=%22middle%22 fill=%22%23FFD700%22>Deck</text></svg>'"
                                     alt="${deck.filename}">
                            </div>
                            <div class="meta-deck-info">
                                <div class="meta-deck-name">${deck.filename}</div>
                                <div class="meta-deck-folder">${deck.folder}</div>
                                <div class="meta-deck-score">External: 0.0</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    },

    toggleSection: function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
};

window.Estadisticas = Estadisticas;
document.addEventListener('DOMContentLoaded', () => Estadisticas.init());