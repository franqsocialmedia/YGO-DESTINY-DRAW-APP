/* mideck.js — Deck activo, banlist y sidebar de Mi Deck */
/* Absorbe: deck.js, banlist.js, engines.js */

// Stats vive en data.js — se carga antes que mideck.js


// Winrate — shim si no existe como módulo independiente
if (!window.Winrate) {
    window.Winrate = { refreshSection: function() {} };
}
// pdf.js — worker para el lector de Listas Oficiales (Importar Deck)
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'Modules/pdf.worker.min.js';
}


// ── Deck — deck activo: render sub-tabs Decklist/Construcción, guardado, importación/exportación .ydk, carta as, notas ──

const Deck = {

    cards: {},
    name: "Mi Deck",
    notes: "",
    _pendingKeyCards: [],
    MAX_VERSIONS: 25,
    _pendingThreatCards: [],
    _roundDraft: null,

    init: function () {
        this.container = document.getElementById('deck-container');
        if (!this.container) return;
        this.render();
        this.createSaveFloatingBtn();
    },

    // ===============================
    isExtraDeckCard: function (card) {
        if (!card || !card.type) return false;
        const t = card.type.toLowerCase();
        return (
            t.includes('fusion') ||
            t.includes('synchro') ||
            t.includes('xyz') ||
            t.includes('link')
        );
    },

    
    // Determinar tipo de carta para ordenamiento Main Deck
    getMainDeckCardType: function(card) {
        if (!card || !card.type) return 999;

        const type = card.type.toLowerCase();

        if (type.includes('spell')) return 4;
        if (type.includes('trap'))  return 5;

        // Péndulo (Normal/Efecto/Ritual/Tuner/Flip por debajo, da igual):
        // van todos juntos en su propio grupo, justo antes de Mágicas.
        if (type.includes('pendulum')) return 3;

        // Ritual (no péndulo)
        if (type.includes('ritual')) return 0;

        // Normal (no péndulo): incluye "Normal Monster" y "Normal Tuner Monster"
        if (type.includes('normal monster')) return 1;

        // Resto de monstruos no-péndulo: Effect, Flip Effect, Flip Tuner Effect,
        // Gemini, Spirit, Toon, Tuner (puro), Union Effect... todos juntos,
        // sin subgrupo propio — solo orden alfabético entre ellos.
        return 2;
    },
    
    // Determinar tipo de carta para ordenamiento Extra Deck
    getExtraDeckCardType: function(card) {
        if (!card || !card.type) return 999;
        
        const type = card.type.toLowerCase();
        
        if (type.includes('fusion')) return 0;
        if (type.includes('synchro')) return 1;
        if (type.includes('xyz')) return 2;
        if (type.includes('link')) return 3;
        
        return 999;
    },
    
    // Comparador para ordenamiento
    compareCards: function(a, b, location) {
        const cardA = a[1].data;
        const cardB = b[1].data;

        // Nivel para monstruos normales/efecto/péndulo/ritual, Rango para Xyz
        // (YGOProDeck también usa 'level' para Rango) y Link Rating para Link.
        const lvl = c => (c.level != null ? c.level : (c.linkval != null ? c.linkval : 0));

        if (location === 'main') {
            // Ordenar Main Deck: Ritual → Normal → Efecto → Péndulo → Mágicas → Trampas
            const typeA = this.getMainDeckCardType(cardA);
            const typeB = this.getMainDeckCardType(cardB);

            if (typeA !== typeB) {
                return typeA - typeB;
            }

            // Dentro de cada grupo de monstruos: Nivel ascendente (empieza en 1),
            // a igual nivel, alfabético. No afecta a Mágicas/Trampas (sin nivel).
            const diffLvl = lvl(cardA) - lvl(cardB);
            if (diffLvl !== 0) return diffLvl;

            return cardA.name.localeCompare(cardB.name);

        } else if (location === 'extra') {
            // Extra Deck: Fusión → Synchro → Xyz → Link
            const typeA = this.getExtraDeckCardType(cardA);
            const typeB = this.getExtraDeckCardType(cardB);

            if (typeA !== typeB) {
                return typeA - typeB;
            }

            // Dentro de cada grupo: Nivel/Rango/Link Rating ascendente, luego alfabético
            const diffLvl = lvl(cardA) - lvl(cardB);
            if (diffLvl !== 0) return diffLvl;

            return cardA.name.localeCompare(cardB.name);

        } else {
            return cardA.name.localeCompare(cardB.name);
        }
    },

    // ===============================
    
    detectSubtypes: function(card) {
        if (!card || !card.type) return [];
        
        const type = card.type.toLowerCase();
        const subtypes = [];
        
        if (type.includes('tuner')) subtypes.push('Tuner');
        if (type.includes('gemini')) subtypes.push('Gemini');
        if (type.includes('union')) subtypes.push('Union');
        if (type.includes('flip')) subtypes.push('Flip');
        if (type.includes('toon')) subtypes.push('Toon');
        
        return subtypes;
    },

    // ===============================
    autoAssignRoles: function (card) {
    const type = (card.type || '').toLowerCase();
    if (type.includes('normal monster')) return [];
    if (window.CardViewer && typeof CardViewer.detectPossibleRoles === 'function') {
        return CardViewer.detectPossibleRoles(card);
    }
    return [];
},

    // ===============================
    syncFromViewer: function (id, card, qty) {
        console.log('🔄 [Deck] syncFromViewer llamado:', { id, cardName: card.name, qty });
        
        if (qty <= 0) {
            console.log('❌ [Deck] Cantidad <= 0, eliminando carta');
            delete this.cards[id];
        } else {
            if (!this.cards[id]) {
                console.log('➕ [Deck] Nueva carta, creando entrada');
                
                // Analizar especialidades de la carta (incluye staples - Paso 2)
                const specialties = typeof SpecialtyAnalyzer !== 'undefined' 
                    ? SpecialtyAnalyzer.analyzeCard(card) 
                    : [];
                
                // PASO 4: Analizar nomenclatura de la carta
                const nomenclature = typeof NomenclatureAnalyzer !== 'undefined'
                    ? NomenclatureAnalyzer.analyzeCard(card)
                    : null;
                
                // Obtener roles automáticos
                let roles = this.autoAssignRoles(card);
                
                console.log('📊 [Deck] Roles automáticos asignados:', roles);
                console.log('🎯 [Deck] Especialidades detectadas:', specialties);
                
                this.cards[id] = {
                    data: card,
                    qty: qty,
                    location: this.isExtraDeckCard(card) ? 'extra' : 'main',
                    roles: roles,
                    specialties: specialties,
                    nomenclature: nomenclature
                };
                
                console.log('✅ [Deck] Carta agregada:', this.cards[id]);
            } else {
                console.log('📝 [Deck] Carta existente, actualizando cantidad');
                this.cards[id].qty = qty;
            }
        }
        
        console.log('🎨 [Deck] Llamando a render()');
        this.render();
        console.log('✅ [Deck] syncFromViewer completado');
    },

    changeQty: function (id, delta) {
        const item = this.cards[id];
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) delete this.cards[id];

        this.render();
    },

    toggleLocation: function (id) {
        const item = this.cards[id];
        if (!item || item.location === 'extra') return;

        item.location = item.location === 'main' ? 'side' : 'main';
        this.render();
    },

    // ===============================
    count: function (loc) {
        return Object.values(this.cards)
            .filter(c => c.location === loc)
            .reduce((s, c) => s + c.qty, 0);
    },

    // ===============================
    openRenamePanel: function () {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        overlay.innerHTML = `
            <div class="deck-modal">
                <h3>Cambiar Nombre del Deck</h3>
                <input id="deck-name-input" value="${this.name}">
                <button onclick="Deck.confirmRename()">Cambiar Nombre</button>
                <button onclick="Deck.closeModal()">Cancelar</button>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    confirmRename: function () {
        const val = document.getElementById('deck-name-input').value.trim();
        if (val) this.name = val;
        this.closeModal();
        this.render();
    },

    closeModal: function () {
        const overlay = document.querySelector('.deck-overlay');
        if (overlay) overlay.remove();
    },

    // ===============================
    openRolePanel: function (id) {
        const item = this.cards[id];
        if (!item) return;

        // ACTUALIZADO: Obtener roles desde ConfigManager
        const availableRoles = ConfigManager.getRoleNames();

        const currentRoles = item.roles || [];

        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        let checkboxesHTML = '';
        availableRoles.forEach(role => {
            const isChecked = currentRoles.includes(role) ? 'checked' : '';
            checkboxesHTML += `
                <label class="role-checkbox-label">
                    <input type="checkbox" value="${role}" ${isChecked} class="role-checkbox">
                    ${role}
                </label>
            `;
        });

        const isCartaAs = this.getCartaAs() === String(id);

        overlay.innerHTML = `
            <div class="deck-modal">
                <div class="role-panel-header">
                    <h3>Asignar Roles</h3>
                    <label class="carta-as-toggle" title="Marcar como carta insignia del deck">
                        <input type="checkbox"
                            id="carta-as-checkbox"
                            ${isCartaAs ? 'checked' : ''}
                            onchange="Deck.setCartaAs(this.checked ? '${id}' : null);">
                        ⭐ Carta As
                    </label>
                </div>
                <p class="deck-modal-highlight">${item.data.name}</p>
                <div class="role-checkboxes">
                    ${checkboxesHTML}
                </div>
                <div class="deck-modal-buttons">
                    <button onclick="Deck.assignRoles(${id})">Asignar Rol</button>
                    <button onclick="Deck.removeRoles(${id})">Quitar Roles</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    assignRoles: function (id) {
        const item = this.cards[id];
        if (!item) return;

        const checkboxes = document.querySelectorAll('.role-checkbox:checked');
        const selectedRoles = Array.from(checkboxes).map(cb => cb.value);

        // Preservar "Carta As" — no es un checkbox normal del panel
        const hadCartaAs = item.roles?.includes('Carta As');
        item.roles = selectedRoles;
        if (hadCartaAs) item.roles.push('Carta As');

        this.closeModal();
        this.render();
    },

    removeRoles: function (id) {
        const item = this.cards[id];
        if (!item) return;

        item.roles = [];
        this.closeModal();
        this.render();
    },

    // ===============================
    saveDeck: function () {
        let prevRaw = null;
        try { prevRaw = JSON.parse(localStorage.getItem(`deck_${this.name}`)); } catch (e) { prevRaw = null; }

        const versions = (prevRaw && Array.isArray(prevRaw.versions)) ? prevRaw.versions : [];
        const diff = this._diffCards(prevRaw ? prevRaw.cards : null, this.cards);
        const hasChanges = diff.added.length || diff.removed.length || diff.changed.length;

        // Solo se crea una versión nueva si es el primer guardado o si hubo
        // cambios reales en la lista de cartas (no en notas, que van por saveNotes()).
        let uid = prevRaw && prevRaw.uid;
        if (!prevRaw || hasChanges) {
            versions.push({
                id:      Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                savedAt: new Date().getTime(),
                comment: '',
                cards:   JSON.parse(JSON.stringify(this.cards)),
                diff:    diff
            });
            while (versions.length > this.MAX_VERSIONS) versions.shift();
            uid = this._generateUid();
        } else if (!uid) {
            uid = this._generateUid(); // deck guardado antes de existir este ID
        }

        const deckData = {
            cards:    this.cards,
            notes:    this.notes || '',
            savedAt:  new Date().getTime(),
            versions: versions,
            uid:      uid
        };
        localStorage.setItem(`deck_${this.name}`, JSON.stringify(deckData));
        alert('Deck guardado');
        this.render();
        if (window.Engines) Engines._renderSidebar();
        if (window.Estadisticas) {
            const panel = document.getElementById('deck-selector-panel');
            if (panel) panel.innerHTML = Estadisticas.renderDeckSelectorPanel();
        }
    },
// ── ID único del Deck (6 dígitos) ──────────────────────────────
    _generateUid: function () {
        return String(Math.floor(100000 + Math.random() * 900000));
    },

    regenerateUid: function (deckName) {
        const name = deckName || this.name;
        let raw;
        try { raw = JSON.parse(localStorage.getItem(`deck_${name}`)); } catch (e) { raw = null; }
        if (!raw) return null; // solo tiene ID un deck ya guardado
        raw.uid = this._generateUid();
        localStorage.setItem(`deck_${name}`, JSON.stringify(raw));
        return raw.uid;
    },
    // ── Historial de Versiones ──────────────────────────────────────
    _diffCards: function (oldCards, newCards) {
        oldCards = oldCards || {};
        newCards = newCards || {};
        const added = [], removed = [], changed = [];
        const allIds = new Set([...Object.keys(oldCards), ...Object.keys(newCards)]);
        allIds.forEach(id => {
            const o = oldCards[id], n = newCards[id];
            const name = (n && n.data && n.data.name) || (o && o.data && o.data.name) || id;
            if (!o && n) added.push({ id, name, qty: n.qty });
            else if (o && !n) removed.push({ id, name, qty: o.qty });
            else if (o && n && o.qty !== n.qty) changed.push({ id, name, from: o.qty, to: n.qty });
        });
        return { added, removed, changed };
    },

    _formatVersionDiff: function (diff) {
        if (!diff) return 'Versión inicial';
        const parts = [];
        if (diff.added.length)   parts.push(`+${diff.added.reduce((s, c) => s + c.qty, 0)} nueva${diff.added.length > 1 ? 's' : ''}`);
        if (diff.removed.length) parts.push(`-${diff.removed.reduce((s, c) => s + c.qty, 0)} quitada${diff.removed.length > 1 ? 's' : ''}`);
        if (diff.changed.length) parts.push(`~${diff.changed.length} cantidad${diff.changed.length > 1 ? 'es' : ''}`);
        return parts.length ? parts.join(' · ') : 'Versión inicial';
    },

    _renderVersionDiffDetail: function (diff) {
        if (!diff) return '<div class="deck-empty">Versión inicial del deck.</div>';
        const lines = [];
        diff.added.forEach(c   => lines.push(`<div class="dv-add">➕ ${c.name} x${c.qty}</div>`));
        diff.removed.forEach(c => lines.push(`<div class="dv-rem">➖ ${c.name} x${c.qty}</div>`));
        diff.changed.forEach(c => lines.push(`<div class="dv-chg">🔁 ${c.name}: ${c.from} → ${c.to}</div>`));
        return lines.length ? lines.join('') : '<div class="deck-empty">Sin cambios de cartas.</div>';
    },

    getVersions: function (deckName) {
        try {
            const raw = JSON.parse(localStorage.getItem(`deck_${deckName || this.name}`));
            return (raw && raw.versions) || [];
        } catch (e) { return []; }
    },

    renderVersionesList: function (deckName) {
        const name = deckName || this.name;
        const versionsAsc = this.getVersions(name);
        if (!versionsAsc.length) return `<p class="deck-empty">Aún no hay versiones guardadas de este deck.</p>`;

        const rows = versionsAsc.map((v, i) => {
            const date = new Date(v.savedAt).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const summary  = this._formatVersionDiff(v.diff);
            const detailId = `vdet-${v.id}`;

            const endAt  = versionsAsc[i + 1] ? versionsAsc[i + 1].savedAt : Infinity;
            const vScore = this.getVersionScore(name, v.savedAt, endAt);
            let scoreHtml = '';
            if (vScore) {
                const [, ptsCls] = this.getSessionScoreBadge(vScore.avg);
                scoreHtml = ` · <span class="deck-version-score ${ptsCls}">${vScore.avg} pts</span>`;
            }

            return `
            <div class="deck-version-row">
                <div class="deck-version-main" onclick="Deck.confirmOpenVersion('${name}','${v.id}')">
                    <span class="deck-version-date">🕒 ${date}</span>
                    <span class="deck-version-diff">${summary}${scoreHtml}</span>
                </div>
                <button class="deck-version-detail-btn" onclick="event.stopPropagation();Deck.toggleVersionDetail('${v.id}')" title="Ver detalle">🔍</button>
                <div id="${detailId}" class="deck-version-detail" style="display:none;">
                    ${this._renderVersionDiffDetail(v.diff)}
                </div>
                <input type="text" class="deck-version-comment" placeholder="Comentario de esta versión..."
                       value="${(v.comment || '').replace(/"/g, '&quot;')}"
                       onclick="event.stopPropagation();"
                       onchange="Deck.saveVersionComment('${name}','${v.id}', this.value)">
            </div>`;
        });

        return rows.reverse().join('');
    },

    toggleVersionDetail: function (versionId) {
        const el = document.getElementById(`vdet-${versionId}`);
        if (el) el.style.display = (el.style.display === 'none') ? 'block' : 'none';
    },

    saveVersionComment: function (deckName, versionId, comment) {
        let raw;
        try { raw = JSON.parse(localStorage.getItem(`deck_${deckName}`)); } catch (e) { return; }
        if (!raw || !Array.isArray(raw.versions)) return;
        const v = raw.versions.find(x => x.id === versionId);
        if (!v) return;
        v.comment = comment;
        localStorage.setItem(`deck_${deckName}`, JSON.stringify(raw));
    },

    confirmOpenVersion: function (deckName, versionId) {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';
        overlay.innerHTML = `
            <div class="deck-modal">
                <h3>Abrir Versión</h3>
                <p class="deck-modal-note">Se reemplazarán las cartas actuales del deck por las de esta versión. Los cambios sin guardar se perderán.</p>
                <div class="deck-modal-buttons">
                    <button onclick="Deck.openVersion('${deckName}','${versionId}')">Sí, Abrir</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    openVersion: function (deckName, versionId) {
        this.closeModal();
        const versions = this.getVersions(deckName);
        const v = versions.find(x => x.id === versionId);
        if (!v) { alert('Versión no encontrada.'); return; }

        this.cards = JSON.parse(JSON.stringify(v.cards));
        this.name  = deckName;

        Object.entries(this.cards).forEach(([id, item]) => {
            if (item.data) item.roles = this.autoAssignRoles(item.data);
        });

        this.render();
        this.onDeckLoaded();
    },
// ===============================
    // Botón flotante "Guardar Deck" — acceso rápido en Mi Deck.
    // Ocupa el mismo espacio que "Lista de Decks" (Estadisticas) pero
    // se muestra en la condición contraria: solo en la pestaña Mi Deck.
    createSaveFloatingBtn: function () {
        if (document.getElementById('deck-save-float-btn')) return;
        const btn = document.createElement('button');
        btn.id          = 'deck-save-float-btn';
        btn.className   = 'deck-save-float-btn';
        btn.textContent = '💾';
        btn.title       = 'Guardar Deck';
        btn.onclick     = () => this.saveDeck();
        document.body.appendChild(btn);
    },

    updateSaveFloatingBtnVisibility: function (tabName) {
        const btn = document.getElementById('deck-save-float-btn');
        if (!btn) return;
        btn.style.display = tabName === 'mideck' ? '' : 'none';
    },
    // Guardado rápido de solo las notas desde Optimización, sin navegar a
    // Decklist ni disparar "Guardar Deck". No toca cards ni savedAt salvo
    // que el deck todavía no tuviera ningún guardado previo.
    saveNotes: function () {
        let raw = {};
        try { raw = JSON.parse(localStorage.getItem(`deck_${this.name}`)) || {}; } catch (e) { raw = {}; }
        raw.cards   = raw.cards   || this.cards;
        raw.savedAt = raw.savedAt || new Date().getTime();
        raw.notes   = this.notes || '';
        raw.uid     = this._generateUid();
        localStorage.setItem(`deck_${this.name}`, JSON.stringify(raw));

        const statusEl = document.getElementById('opt-notes-status');
        if (statusEl) {
            statusEl.textContent = '✅ Notas guardadas';
            clearTimeout(this._notesStatusTimeout);
            this._notesStatusTimeout = setTimeout(() => { statusEl.textContent = ''; }, 2500);
        }
    },

    getSavedDecks: function () {
        const decks = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('deck_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    const deckName = key.replace('deck_', '');
                    decks.push({
                        name: deckName,
                        cards: data.cards || data,
                        savedAt: data.savedAt || 0,
                        uid: data.uid || null
                    });
                } catch (e) {
                    console.error('Error cargando deck:', key);
                }
            }
        }
        return decks.sort((a, b) => b.savedAt - a.savedAt);
    },

    getMostRepeatedCard: function (cards) {
        let maxQty = 0;
        let mostRepeated = null;
        
        Object.values(cards).forEach(item => {
            if (item.qty > maxQty) {
                maxQty = item.qty;
                mostRepeated = item.data;
            }
        });
        
        return mostRepeated;
    },

    openLoadDeckPanel: function (deckName) {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        overlay.innerHTML = `
            <div class="deck-modal">
                <h3>Cargar Deck</h3>
                <p class="deck-modal-highlight">${deckName}</p>
                <p class="deck-modal-note">¿Deseas cargar este deck? Se reemplazarán las cartas actuales.</p>
                <div class="deck-modal-buttons">
                    <button onclick="Deck.confirmLoadDeck('${deckName}')">Sí, Cargar</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    confirmLoadDeck: function (deckName) {
    this.closeModal();

    const loadingEl = document.createElement('div');
    loadingEl.id = 'deck-load-overlay';
    loadingEl.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.78);
        display:flex;align-items:center;justify-content:center;
        z-index:9999;flex-direction:column;gap:14px;`;
    loadingEl.innerHTML = `
        <div class="power-loading-spinner"></div>
        <div style="color:#FFD700;font-size:1rem;text-align:center;padding:0 20px;">
            Cargando <strong>${deckName}</strong>...
        </div>`;
    document.body.appendChild(loadingEl);

    setTimeout(() => {
        try {
            const data = JSON.parse(localStorage.getItem(`deck_${deckName}`));
            this.cards = data.cards || data;
            this.name  = deckName;
            this.notes = data.notes || '';

            Object.entries(this.cards).forEach(([id, item]) => {
                if (item.data) {
                    item.roles = this.autoAssignRoles(item.data);
                }
            });

            this.render();
            this.onDeckLoaded();
        } catch (e) {
            alert('Error al cargar el deck');
        } finally {
            document.getElementById('deck-load-overlay')?.remove();
        }
    }, 50);
},
    openDeleteDeckPanel: function (deckName) {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';

        overlay.innerHTML = `
            <div class="deck-modal deck-modal-warning">
                <h3>Eliminar Deck</h3>
                <p class="deck-modal-highlight">${deckName}</p>
                <p class="deck-modal-note">¿Estás seguro de eliminar este deck? Esta acción no se puede deshacer.</p>
                <div class="deck-modal-buttons">
                    <button class="btn-danger" onclick="Deck.confirmDeleteDeck('${deckName}')">Sí, Eliminar</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    confirmDeleteDeck: function (deckName) {
        localStorage.removeItem(`deck_${deckName}`);
        this.closeModal();
        if (window.Engines) Engines._renderSidebar();
        this.render();
    },

    clearDeck: function () {
        this.cards = {};
        this.render();
    },
tryDeck: function () {
    if (!window.Navigation || !window.Torneo || !window.ZonaPractica) return;
    Navigation.showTab('simuladores');
    setTimeout(() => {
        Torneo.showSimTab('practica');
        setTimeout(() => {
            const dk = { name: this.name, cards: this.cards };
            ZonaPractica._loadDeck('_direct', 0);
            ZonaPractica._dsCache._direct = [dk];
            ZonaPractica._loadDeck('_direct', 0);
        }, 80);
    }, 60);
},
tryDeckExperimentacion: function (deckName) {
    if (!window.Navigation || !window.Torneo || !window.Experimentacion) return;
    const saved = Deck.getSavedDecks();
    const dk = saved.find(d => d.name === deckName);
    if (!dk) return;
    Navigation.showTab('simuladores');
    setTimeout(() => {
        Torneo.showSimTab('experimentacion');
        setTimeout(() => {
            Experimentacion._dsCache._direct = [dk];
            Experimentacion._loadDeck('_direct', 0);
        }, 80);
    }, 60);
},
    exportYDK: function () {
        let main = '', extra = '', side = '';

        Object.entries(this.cards).forEach(([id, item]) => {
            for (let i = 0; i < item.qty; i++) {
                if (item.location === 'main') main += id + '\n';
                if (item.location === 'extra') extra += id + '\n';
                if (item.location === 'side') side += id + '\n';
            }
        });

        const content = `#created by Destiny Draw\n#main\n${main}#extra\n${extra}!side\n${side}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.name}.ydk`;
        a.click();
    },

    exportTXT: function () {
        let txt = `${this.name}\n\n`;

        ['main','extra','side'].forEach(loc => {
            txt += `---- ${loc.toUpperCase()} ----\n`;
            Object.values(this.cards)
                .filter(c => c.location === loc)
                .forEach(c => {
                    txt += `${c.data.name} - ${c.data.type} - x${c.qty}\n`;
                });
            txt += '\n';
        });

        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.name}.txt`;
        a.click();
    },
exportTXT: function () {
        let txt = `${this.name}\n\n`;

        ['main','extra','side'].forEach(loc => {
            txt += `---- ${loc.toUpperCase()} ----\n`;
            Object.values(this.cards)
                .filter(c => c.location === loc)
                .forEach(c => {
                    txt += `${c.data.name} - ${c.data.type} - x${c.qty}\n`;
                });
            txt += '\n';
        });

        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.name}.txt`;
        a.click();
    },

    // ── Exportar/Importar TODA la Data del Deck (.txt con JSON) ──────
    // Bundle completo pensado para trasladar el deck a otro usuario:
    // cartas + Carta As (va dentro de item.roles), notas, historial de
    // versiones, Optimización (sesiones/rondas), Complejidad del Deck,
    // Historial de Enfrentamientos (Matchups) y Líneas de Combo.
    exportDeckData: function () {
        if (!Object.keys(this.cards || {}).length) { alert('No hay deck cargado para exportar.'); return; }

        const name = this.name;
        const get  = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };

        const bundle = {
            formatVersion: 1,
            exportedAt:    Date.now(),
            deckName:      name,
            deck:          get(`deck_${name}`)         || { cards: this.cards, notes: this.notes || '', savedAt: Date.now(), versions: [] },
            optimization:  get(`optimization_${name}`) || { sessions: [] },
            
            complejidad:   get(`complejidad_${name}`)  || null,
            experiencia:   get(`experiencia_${name}`)   || null,
            matchups:      get(`matchup_${name}`)      || [],
            combos:        get(`combos_${name}`)       || []
        };

        const header = [
            `# Destiny Draw — Data completa del Deck`,
            `# Deck: ${name}`,
            `# Incluye: cartas, Carta As, notas, historial de versiones, Optimización,`,
            `# Complejidad del Deck, Tu Experiencia con el Deck, Historial de`,
            `# Enfrentamientos y Líneas de Combo.`,
            `# No editar manualmente el bloque JSON de abajo.`,
            ''
        ].join('\n');

        const blob = new Blob([header + JSON.stringify(bundle)], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name.replace(/[^a-z0-9]+/gi, '_')}_data.txt`;
        a.click();
    },

    importDeckData: function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            this._mergeImportedDeckData(await file.text());
        };
        input.click();
    },

    _mergeImportedDeckData: function (text) {
        const jsonText = text.split('\n').filter(l => !l.trim().startsWith('#')).join('\n').trim();
        let bundle;
        try { bundle = JSON.parse(jsonText); } catch (e) {
            alert('Archivo de Data de Deck inválido o corrupto.');
            return;
        }
        if (!bundle || !bundle.deck || !bundle.deck.cards) {
            alert('Este archivo no parece ser una exportación de Data de Deck de Destiny Draw.');
            return;
        }

        let name = bundle.deckName || 'Deck Importado';
        const exists = !!localStorage.getItem(`deck_${name}`);
        const chosen = prompt(
            exists
                ? `Ya existe un deck llamado "${name}" en tus decks guardados. Escribe un nombre distinto para no sobreescribirlo, o deja el mismo para reemplazarlo:`
                : `Nombre para el deck importado:`,
            name
        );
        if (chosen === null) return; // cancelado
        name = chosen.trim() || name;

        // Escribe cada bloque en su clave correspondiente del deck destino.
        const deckData = bundle.deck;
        deckData.cards = deckData.cards || {};
        localStorage.setItem(`deck_${name}`, JSON.stringify(deckData));

        if (bundle.optimization) localStorage.setItem(`optimization_${name}`, JSON.stringify(bundle.optimization));
        if (bundle.complejidad) localStorage.setItem(`complejidad_${name}`, JSON.stringify(bundle.complejidad));
        if (bundle.experiencia) localStorage.setItem(`experiencia_${name}`, JSON.stringify(bundle.experiencia));
        if (Array.isArray(bundle.matchups)) localStorage.setItem(`matchup_${name}`, JSON.stringify(bundle.matchups));
        if (Array.isArray(bundle.combos)) {
            const combos = bundle.combos.map(c => ({ ...c, deckName: name }));
            localStorage.setItem(`combos_${name}`, JSON.stringify(combos));
        }

        // Carga el deck importado como el deck activo. No se recalculan roles
        // (autoAssignRoles) para no perder la marca de "Carta As" ya guardada.
        this.cards = JSON.parse(JSON.stringify(deckData.cards));
        this.notes = deckData.notes || '';
        this.name  = name;

        this.render();
        this.onDeckLoaded();
        if (window.Engines) Engines._renderSidebar();
        alert(`Data del deck importada: ${name}`);
    },

    importYDK: function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.ydk';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const text = await file.text();
            this.parseYDK(text, file.name);
        };

        input.click();
    },

    parseYDK: async function (content, filename) {
        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        
        let currentSection = '';
        const cardIds = { main: [], extra: [], side: [] };

        lines.forEach(line => {
            if (line.startsWith('#main')) {
                currentSection = 'main';
            } else if (line.startsWith('#extra')) {
                currentSection = 'extra';
            } else if (line.startsWith('!side')) {
                currentSection = 'side';
            } else if (line.startsWith('#') || line.startsWith('!')) {
            } else if (/^\d+$/.test(line)) {
                if (currentSection) {
                    cardIds[currentSection].push(line);
                }
            }
        });

        // Contar cantidades
        const cardCounts = { main: {}, extra: {}, side: {} };
        
        ['main', 'extra', 'side'].forEach(section => {
            cardIds[section].forEach(id => {
                cardCounts[section][id] = (cardCounts[section][id] || 0) + 1;
            });
        });

        // Obtener IDs únicos
        const uniqueIds = new Set([
            ...Object.keys(cardCounts.main),
            ...Object.keys(cardCounts.extra),
            ...Object.keys(cardCounts.side)
        ]);

        if (uniqueIds.size === 0) {
            alert('No se encontraron cartas en el archivo');
            return;
        }

        // ── Pantalla de carga ────────────────────────────────────────
        const loadingEl = document.createElement('div');
        loadingEl.id = 'ydk-import-overlay';
        loadingEl.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.82);
            display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;gap:16px;`;
        loadingEl.innerHTML = `
            <div class="power-loading-spinner"></div>
            <p style="color:#f0d060;font-size:1rem;margin:0;">⏳ Importando deck... (${uniqueIds.size} cartas)</p>`;
        document.body.appendChild(loadingEl);

        try {
            const idsArray = Array.from(uniqueIds);
            const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${idsArray.join(',')}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al buscar cartas');
            
            const result = await response.json();
            const cardsData = result.data || [];

            if (!cardsData.length) throw new Error('La API no devolvió cartas');

            // Construir nuevo deck
            const newCards = {};

            cardsData.forEach(card => {
                const id = card.id.toString();
                let location = '';
                let qty = 0;

                if (cardCounts.main[id]) {
                    location = 'main';
                    qty = cardCounts.main[id];
                } else if (cardCounts.extra[id]) {
                    location = 'extra';
                    qty = cardCounts.extra[id];
                } else if (cardCounts.side[id]) {
                    location = 'side';
                    qty = cardCounts.side[id];
                }

                if (qty > 0) {
                    newCards[id] = {
                        data: card,
                        qty: qty,
                        location: location,
                        roles: this.autoAssignRoles(card)
                    };
                }
            });

            this.cards = newCards;
            this.name = filename.replace('.ydk', '');
            this.render();
            this.onDeckLoaded();
            document.getElementById('ydk-import-overlay')?.remove();
            alert(`Deck importado: ${this.name}`);

        } catch (error) {
            document.getElementById('ydk-import-overlay')?.remove();
            console.error('Error al importar deck:', error);
            alert('Error al importar el deck. Verifica que el archivo sea válido.');
        }
    },
// ===============================
    // IMPORTAR DESDE LISTA OFICIAL (.pdf) — Konami Deck List
    // ===============================
    importPDF: function () {
        if (typeof pdfjsLib === 'undefined') {
            alert('No se pudo cargar el lector de PDF. Verifica que Modules/pdf.min.js esté presente.');
            return;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,application/pdf';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            await this.parsePDFDeckList(file);
        };

        input.click();
    },

    _pdfHeaderPhrases: ['monster cards', 'spell cards', 'trap cards', 'extra deck', 'side deck'],

    _pdfNormalizeExact: function (s) { return String(s).trim().toLowerCase(); },
    _pdfNormalizeLoose: function (s) { return String(s).trim().toLowerCase().replace(/\s+/g, ' '); },

    _pdfIsColumnHeaderText: function (text) {
        return this._pdfHeaderPhrases.indexOf(text.trim().toLowerCase()) !== -1;
    },

    _pdfMapHeaderToZone: function (phrase) {
        switch (phrase) {
            case 'monster cards':
            case 'spell cards':
            case 'trap cards':  return 'main';
            case 'extra deck':  return 'extra';
            case 'side deck':   return 'side';
            default:            return null;
        }
    },

    _pdfIsIgnorableClusterText: function (text) {
        const t = text.toLowerCase();
        const patterns = [
            'judge use only', 'please write', 'please include', 'full name', 'card game id',
            'last initial', 'date:', 'event:', 'for judge use', 'deck list checked',
            'judge initial', 'infraction', 'description:', 'deck checked rd', 'total in', '<<<'
        ];
        for (const p of patterns) { if (t.indexOf(p) !== -1) return true; }
        if (/^\d+\s*\/\s*\d+$/.test(text.trim())) return true;
        if (/^([A-Z])(\s[A-Z])+$/.test(text.trim())) return true;
        return false;
    },

    _pdfIsBarcodeLikeLine: function (text) {
        const tokens = text.trim().split(/\s+/);
        if (tokens.length < 5) return false;
        return tokens.every(tok => /^\d+$/.test(tok));
    },

    _pdfGenerateCandidates: function (rawText) {
        const t = rawText.trim();
        const candidates = [];
        if (t.length === 0) return candidates;
        const leadMatch = t.match(/^(\d{1,2})\s+(.+)$/);
        if (leadMatch && leadMatch[2].trim().length > 0) {
            candidates.push({ quantity: parseInt(leadMatch[1], 10), name: leadMatch[2].trim() });
        }
        const trailMatch = t.match(/^(.+?)\s+(\d{1,2})$/);
        if (trailMatch && trailMatch[1].trim().length > 0) {
            candidates.push({ quantity: parseInt(trailMatch[2], 10), name: trailMatch[1].trim() });
        }
        candidates.push({ quantity: 1, name: t });
        return candidates;
    },

    _pdfDetectHeadersInLine: function (validClusters) {
        let matches = [];
        for (const c of validClusters) {
            if (this._pdfIsColumnHeaderText(c.text)) matches.push({ text: c.text.trim().toLowerCase(), x: c.x });
        }
        if (matches.length > 0) return matches;
        const found = [];
        for (const c of validClusters) {
            const lower = c.text.toLowerCase();
            for (const phrase of this._pdfHeaderPhrases) {
                const idx = lower.indexOf(phrase);
                if (idx !== -1) {
                    const span = Math.max(c.xEnd - c.x, 1);
                    const charWidth = span / Math.max(lower.length, 1);
                    found.push({ text: phrase, x: c.x + idx * charWidth });
                }
            }
        }
        return found;
    },

    // Extrae {zone, candidates[]} por cada línea de carta detectada en el PDF
    _pdfExtractEntries: async function (file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/'
        }).promise;

        const extracted = [];
        let columnDefs = [];
        let anyHeaderFound = false;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const items = textContent.items
                .map(it => ({ str: it.str, x: it.transform[4], y: it.transform[5], width: it.width || 0 }))
                .filter(it => it.str && it.str.trim().length > 0);
            if (items.length === 0) continue;

            const yTolerance = 3;
            const lines = [];
            for (const it of items) {
                let line = lines.find(l => Math.abs(l.y - it.y) <= yTolerance);
                if (!line) { line = { y: it.y, items: [] }; lines.push(line); }
                line.items.push(it);
            }
            lines.sort((a, b) => b.y - a.y);

            const gapThreshold = 22;

            for (const line of lines) {
                line.items.sort((a, b) => a.x - b.x);
                const clusters = [];
                for (const it of line.items) {
                    const last = clusters[clusters.length - 1];
                    if (last && (it.x - last.xEnd) <= gapThreshold) {
                        last.text += ' ' + it.str;
                        last.xEnd = Math.max(last.xEnd, it.x + it.width);
                    } else {
                        clusters.push({ x: it.x, xEnd: it.x + it.width, text: it.str });
                    }
                }
                clusters.forEach(c => c.text = c.text.replace(/\s+/g, ' ').trim());
                const validClusters = clusters.filter(c => c.text.length > 0);
                if (validClusters.length === 0) continue;

                const headerHits = this._pdfDetectHeadersInLine(validClusters);
                if (headerHits.length > 0) {
                    headerHits.sort((a, b) => a.x - b.x);
                    const newDefs = [];
                    for (let i = 0; i < headerHits.length; i++) {
                        const xMin = (i === 0) ? -Infinity : (headerHits[i - 1].x + headerHits[i].x) / 2;
                        const xMax = (i === headerHits.length - 1) ? Infinity : (headerHits[i].x + headerHits[i + 1].x) / 2;
                        newDefs.push({ zone: this._pdfMapHeaderToZone(headerHits[i].text), xMin, xMax });
                    }
                    columnDefs = newDefs;
                    anyHeaderFound = true;
                    continue;
                }

                if (validClusters.length === 1 && /^main deck$/i.test(validClusters[0].text)) continue;

                const combinedRowText = validClusters.map(c => c.text).join(' ');
                if (this._pdfIsBarcodeLikeLine(combinedRowText)) continue;
                if (/^\d+\s*\/\s*\d+$/.test(combinedRowText.trim())) continue;
                if (/^[A-Z](\s[A-Z])+$/.test(combinedRowText.trim())) continue;
                if (validClusters.some(c => this._pdfIsIgnorableClusterText(c.text))) continue;
                if (columnDefs.length === 0) continue;

                for (const c of validClusters) {
                    if (this._pdfIsIgnorableClusterText(c.text)) continue;
                    const colDef = columnDefs.find(cd => c.x >= cd.xMin && c.x < cd.xMax);
                    if (!colDef || !colDef.zone) continue;
                    const candidates = this._pdfGenerateCandidates(c.text);
                    if (candidates.length === 0) continue;
                    extracted.push({ zone: colDef.zone, candidates });
                }
            }
        }

        if (!anyHeaderFound) {
            throw new Error('PDF no reconocido: no se detectaron los encabezados de la Lista Oficial de Konami (Monster Cards / Spell Cards / Trap Cards / Extra Deck / Side Deck).');
        }
        return extracted;
    },

    // Descarga la base completa de YGOProDeck (sin caché) para el matching de nombres
    _pdfFetchFullCardDB: async function () {
        const response = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php');
        if (!response.ok) throw new Error('No se pudo descargar la base de cartas para el matching.');
        const json = await response.json();
        if (!json || !Array.isArray(json.data)) throw new Error('Respuesta inesperada de la API.');
        return json.data;
    },

    _pdfMatchEntries: function (extracted, dbArray) {
        const exactMap = new Map();
        const looseMap = new Map();
        for (const card of dbArray) {
            const ek = this._pdfNormalizeExact(card.name);
            if (!exactMap.has(ek)) exactMap.set(ek, card);
            const lk = this._pdfNormalizeLoose(card.name);
            if (!looseMap.has(lk)) looseMap.set(lk, card);
        }

        const matched = {};
        const unknown = [];

        for (const entry of extracted) {
            let card = null, usedCand = null;
            for (const cand of entry.candidates) {
                card = exactMap.get(this._pdfNormalizeExact(cand.name)) ||
                       looseMap.get(this._pdfNormalizeLoose(cand.name));
                if (card) { usedCand = cand; break; }
            }
            if (card) {
                const key = entry.zone + '_' + card.id;
                if (matched[key]) matched[key].qty += usedCand.quantity;
                else matched[key] = { zone: entry.zone, id: card.id, qty: usedCand.quantity, card };
            } else {
                unknown.push({ zone: entry.zone, name: entry.candidates[0].name, quantity: entry.candidates[0].quantity });
            }
        }
        return { matched: Object.values(matched), unknown };
    },

    parsePDFDeckList: async function (file) {
        const loadingEl = document.createElement('div');
        loadingEl.id = 'pdf-import-overlay';
        loadingEl.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.82);
            display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;gap:16px;`;
        loadingEl.innerHTML = `
            <div class="power-loading-spinner"></div>
            <p style="color:#f0d060;font-size:1rem;margin:0;">⏳ Leyendo Lista Oficial (.pdf)...</p>`;
        document.body.appendChild(loadingEl);

        try {
            const extracted = await this._pdfExtractEntries(file);
            loadingEl.querySelector('p').textContent = '⏳ Buscando cartas en la base de datos...';
            const dbArray = await this._pdfFetchFullCardDB();
            const { matched, unknown } = this._pdfMatchEntries(extracted, dbArray);

            if (matched.length === 0) {
                document.getElementById('pdf-import-overlay')?.remove();
                alert('No se pudo identificar ninguna carta en el PDF. Verifica que sea una Lista Oficial de Konami válida.');
                return;
            }

            const newCards = {};
            matched.forEach(m => {
                const id = m.card.id.toString();
                newCards[id] = {
                    data: m.card,
                    qty: m.qty,
                    location: m.zone,
                    roles: this.autoAssignRoles(m.card)
                };
            });

            const defaultName = file.name.replace(/\.pdf$/i, '');
            const chosenName = prompt('Nombre para el deck importado:', defaultName) || defaultName;

            this.cards = newCards;
            this.name = chosenName;
            this.render();
            this.onDeckLoaded();
            document.getElementById('pdf-import-overlay')?.remove();

            let msg = `Deck importado desde PDF: ${this.name}\n${matched.length} carta(s) reconocida(s).`;
            if (unknown.length > 0) {
                msg += `\n\n⚠ ${unknown.length} línea(s) no reconocida(s):\n` +
                    unknown.map(u => `- ${u.quantity}x ${u.name} (${u.zone})`).join('\n') +
                    '\n\nAgrégalas manualmente desde el Buscador.';
            }
            alert(msg);

        } catch (error) {
            document.getElementById('pdf-import-overlay')?.remove();
            console.error('Error al importar deck desde PDF:', error);
            alert('Error al procesar el PDF: ' + error.message);
        }
    },
    // ===============================
    toggleSection: function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    },

    // ===============================
    renderDeckList: function () {
        if (window.ContentManager && !ContentManager.isVisible('deck-floating-widget')) return '';
        const savedDecks = this.getSavedDecks();
        
        if (savedDecks.length === 0) {
            return '<p class="deck-empty">No hay decks guardados</p>';
        }

        let html = '<div class="deck-list-grid">';

        savedDecks.forEach(deck => {
            // Carta As tiene prioridad sobre la más repetida
            const cartaAsCard = Object.values(deck.cards)
                .find(c => c.roles?.includes('Carta As'));
            const mostRepeatedCard = cartaAsCard || this.getMostRepeatedCard(deck.cards);
            const imgUrl = mostRepeatedCard 
                ? mostRepeatedCard.data
                    ? mostRepeatedCard.data.card_images[0].image_url_small
                    : mostRepeatedCard.card_images[0].image_url_small
                : 'https://images.ygoprodeck.com/images/cards/6983839.jpg';

            const mainCount = Object.values(deck.cards)
                .filter(c => c.location === 'main')
                .reduce((s, c) => s + c.qty, 0);

            const extraCount = Object.values(deck.cards)
                .filter(c => c.location === 'extra')
                .reduce((s, c) => s + c.qty, 0);

            const sideCount = Object.values(deck.cards)
                .filter(c => c.location === 'side')
                .reduce((s, c) => s + c.qty, 0);

            // Calcular Internal Score para tier
            let tierLabel = 'Rogue';
            let tierClass = 'tier-rogue';
            let internalScore = 0;
            
            if (typeof Stats !== 'undefined') {
                const stats = Stats.calculateInternalScore(deck.cards);
                internalScore = parseFloat(stats.internalScore);
                
                if (internalScore >= 20) {
                    tierLabel = 'Tier 1';
                    tierClass = 'tier-1';
                } else if (internalScore >= 12) {
                    tierLabel = 'Tier 2';
                    tierClass = 'tier-2';
                } else if (internalScore >= 6) {
                    tierLabel = 'Tier 3';
                    tierClass = 'tier-3';
                }
            }

            // External Score real si hay powerScoreCache disponible en Estadísticas
            let externalScore = null;
                if (window.Stats && window.Estadisticas?.powerScoreCache) {
                    try {
                        const ext = Stats.calculateExternalScore(
                            deck.cards,
                            Estadisticas.powerScoreCache,
                            Estadisticas.metaDecks || {}
                        );
                        externalScore = ext.externalScore;
                    } catch (_) {}
                }

            html += `
                <div class="deck-list-item">
                    <button class="deck-delete-btn" onclick="Deck.openDeleteDeckPanel('${deck.name}')" title="Eliminar deck">
                        ✖
                    </button>
                    <div class="deck-thumbnail">
                        <img src="${imgUrl}" alt="${deck.name}">
                    </div>
                    <div class="deck-info">
                        <h4 class="deck-item-name">${deck.name}</h4>
                        <p class="deck-counts">
                            <span class="deck-count-main">M: ${mainCount}</span> | 
                            <span class="deck-count-extra">E: ${extraCount}</span> | 
                            <span class="deck-count-side">S: ${sideCount}</span>
                        </p>
                        <div class="deck-scores">
                            <div class="deck-score-row">
                                <span class="deck-score-label">Power Level:</span>
                                <span class="deck-score-value deck-score-internal">${internalScore.toFixed(1)}</span>
                            </div>
                            <div class="deck-score-row">
                                <span class="deck-score-label">Match-up:</span>
                                <span class="deck-score-value deck-score-external">
                                    ${externalScore !== null ? parseFloat(externalScore).toFixed(1) : '—'}
                                </span>
                            </div>
                            ${(() => {
                                if (!window.Winrate) return '';
                                const wr = Winrate.getRecord(deck.name);
                                const total = wr.wins1st + wr.wins2nd + wr.losses1st + wr.losses2nd;
                                if (total === 0) return '';
                                const pct = Winrate.calcWinrate(wr.wins1st + wr.wins2nd, wr.losses1st + wr.losses2nd);
                                const col = pct >= 60 ? '#00b894' : pct >= 45 ? '#fdcb6e' : '#d63031';
                                return `<div class="deck-score-row">
                                    <span class="deck-score-label">Winrate:</span>
                                    <span class="deck-score-value" style="color:${col}">${pct}% <span style="font-size:0.7rem;opacity:0.5">(${total})</span></span>
                                </div>`;
                            })()}
                        </div>
                    </div>
                    <button class="btn btn-primary deck-load-btn" onclick="Deck.openLoadDeckPanel('${deck.name}')">
                        Ver Deck
                    </button>
                </div>
            `;
        });

        html += '</div>';
        return html;
    },

    // ===============================
    renderRows: function (location) {

        const entries = Object.entries(this.cards)
            .filter(([_, c]) => c.location === location)
            .sort((a, b) => this.compareCards(a, b, location));

        if (entries.length === 0) {
            return `<p class="deck-empty">Vacio</p>`;
        }

        let html = '';

        entries.forEach(([id, item]) => {

            const card = item.data;
            const type = card.type.toLowerCase();

            let color = '';
            let nameClass = 'deck-name';
            let qtyColor = '#003366';
            let imgClass = 'deck-img';

            if (location === 'side') {
                color = 'rgba(128, 128, 128, 0.4)';
                nameClass = 'deck-name deck-name-white';
                qtyColor = '#ffffff';
                imgClass = 'deck-img deck-img-desaturated';
            } 
            else {
                if (type.includes('monster')) {
                    if (type.includes('synchro')) {
                        color = '#ffffff';
                    } else if (type.includes('fusion')) {
                        color = '#d8b5d8';
                    } else if (type.includes('xyz')) {
                        color = 'rgba(0, 0, 0, 0.85)';
                        nameClass = 'deck-name deck-name-white';
                        qtyColor = '#ffffff';
                    } else if (type.includes('link')) {
                        color = '#4169e1';
                        nameClass = 'deck-name deck-name-white';
                        qtyColor = '#ffffff';
                    } else if (type.includes('ritual')) {
                        color = '#b3d9ff';
                    } else if (type.includes('pendulum')) {
                        color = 'linear-gradient(to right, #d9b38c, #b7f7c3)';
                    } else {
                        color = '#d9b38c';
                    }
                } else if (type.includes('spell')) {
                    color = '#b7f7c3';
                } else if (type.includes('trap')) {
                    color = '#ffb3d9';
                } else {
                    color = '#d9b38c';
                }
            }

            // Si es degradado, usar background en lugar de background-color
            const backgroundStyle = color.includes('gradient') 
                ? `background: ${color}` 
                : `background: ${color}`;

            // DETECTAR SUBTIPOS AUTOMÁTICOS (Tuner, Gemini, Union, Flip, Toon)
            const subtypes = this.detectSubtypes(card);
            
            // Generar badges de SUBTIPOS (amarillos)
            let subtypesBadges = '';
            subtypes.forEach(subtype => {
                subtypesBadges += `<span class="subtype-badge">${subtype}</span>`;
            });

           // Generar badges de ROLES
            let rolesBadges = '';
            const showRoles = !window.ContentManager || ContentManager.isVisible('deck-roles-badges');
            const dimConfig = window.ConfigManager?.getDiminishingReturns?.();

            if (showRoles && item.roles && item.roles.length > 0) {
                item.roles.forEach(role => {
                    if (role === 'Carta As') {
                        rolesBadges += `<span class="role-badge badge-carta-as">⭐ Carta As</span>`;
                        return;
                    }


                    // Nivel de saturación → clase visual en el badge
                    let satClass = '';
                    if (dimConfig && dimConfig.enabled && location === 'main') {
                        const threshold = dimConfig.roleThresholds?.[role];
                        if (threshold) {
                            const roleCount = Object.values(Deck.cards)
                                .filter(c => c.location === 'main' && (c.roles || []).includes(role))
                                .reduce((sum, c) => sum + c.qty, 0);
                            if (roleCount > threshold.max) {
                                satClass = ' badge-over-saturated';
                            } else if (roleCount > threshold.optimal) {
                                satClass = ' badge-near-saturated';
                            }
                        }
                    }

                    rolesBadges += `<span class="role-badge${satClass}">${role}</span>`;
                });
            }

html += `
    <div class="deck-row" style="${backgroundStyle}">
        <img src="${card.card_images[0].image_url_small}" 
             class="${imgClass}"
             onclick="CardViewer.openFromDeck(${id})">
        <div class="${nameClass}">${card.name}</div>
        <div class="deck-roles">
            ${subtypesBadges}${rolesBadges}
            ${window.Banlist ? Banlist.getBadgeHTML(id) : ''}
        </div>

                    <div class="deck-qty">
                        <button onclick="Deck.changeQty(${id}, -1)">◀</button>
                        <span class="qty-number" style="color: ${qtyColor}">x${item.qty}</span>
                        <button onclick="Deck.changeQty(${id}, 1)">▶</button>
                    </div>

                    <div class="deck-buttons">
                        ${location !== 'extra' ? `
                            <button class="deck-move" onclick="Deck.toggleLocation(${id})">
                                ${item.location === 'main' ? 'Side Deck' : 'Main Deck'}
                            </button>
                        ` : ''}
                        
                        <button class="deck-role-btn" data-section-id="deck-role-btn" onclick="Deck.openRolePanel(${id})">
                            Rol
                        </button>
                    </div>

                </div>
            `;
        });

        return html;
            },


renderDeckStatsBlock: function () {
    const mainCards  = Object.values(this.cards).filter(c => c.location === 'main');
    const extraCards = Object.values(this.cards).filter(c => c.location === 'extra');
    const allCards   = [...mainCards, ...extraCards];

    if (allCards.length === 0) return '';

    // ── Tipos de cartas ──────────────────────────────────────────
    const cardTypes = {};
    allCards.forEach(item => {
        const t = item.data.type || '';
        const qty = item.qty || 1;
        if (t.toLowerCase().includes('spell'))     cardTypes['Hechizo']  = (cardTypes['Hechizo']  || 0) + qty;
        else if (t.toLowerCase().includes('trap')) cardTypes['Trampa']   = (cardTypes['Trampa']   || 0) + qty;
        else                                       cardTypes['Monstruo'] = (cardTypes['Monstruo'] || 0) + qty;
    });

    // ── Atributos ────────────────────────────────────────────────
    const attributes = {};
    allCards.forEach(item => {
        const t = item.data.type || '';
        if (!t.toLowerCase().includes('spell') && !t.toLowerCase().includes('trap')) {
            const attr = item.data.attribute;
            if (attr) attributes[attr] = (attributes[attr] || 0) + (item.qty || 1);
        }
    });

    // ── Raza ─────────────────────────────────────────────────────
    const races = {};
    allCards.forEach(item => {
        const t = item.data.type || '';
        if (!t.toLowerCase().includes('spell') && !t.toLowerCase().includes('trap')) {
            const race = item.data.race;
            if (race) races[race] = (races[race] || 0) + (item.qty || 1);
        }
    });

    // ── Niveles / Rangos / Link ───────────────────────────────────
    const levels = {};
    allCards.forEach(item => {
        const t = (item.data.type || '').toLowerCase();
        if (t.includes('spell') || t.includes('trap')) return;
        const qty = item.qty || 1;
        if (t.includes('link')) {
            const lv = `Link-${item.data.linkval || '?'}`;
            levels[lv] = (levels[lv] || 0) + qty;
        } else if (t.includes('xyz')) {
            const lv = `Rango ${item.data.level || '?'}`;
            levels[lv] = (levels[lv] || 0) + qty;
        } else if (item.data.level) {
            const lv = `Nivel ${item.data.level}`;
            levels[lv] = (levels[lv] || 0) + qty;
        }
    });

    // ── Tipos secundarios ────────────────────────────────────────
    const secondaryTypes = {};
    allCards.forEach(item => {
        const t = (item.data.type || '').toLowerCase();
        if (t.includes('spell') || t.includes('trap')) return;
        const qty = item.qty || 1;
        this.detectSubtypes(item.data).forEach(st => {
            secondaryTypes[st] = (secondaryTypes[st] || 0) + qty;
        });
    });

// ── Tipos de Monstruo (desglose visual) ──────────────────
    const monsterTypeOrder = [
        { key: 'ritual',   label: 'Ritual',         color: '#b3d9ff' },
        { key: 'fusion',   label: 'Fusión',          color: '#d8b5d8' },
        { key: 'synchro',  label: 'Sincronía',       color: '#f0f0f0' },
        { key: 'xyz',      label: 'Xyz',             color: '#9b59b6' },
        { key: 'link',     label: 'Link',            color: '#4169e1' },
        { key: 'pendulum', label: 'Péndulo',         color: '#7bed9f' },
        { key: 'normal',   label: 'Normal',          color: '#f9ca74' },
        { key: 'effect',   label: 'Efecto',          color: '#d9b38c' }
    ];
    const monsterTypeCounts = {};
    allCards.forEach(item => {
        const t = (item.data.type || '').toLowerCase();
        if (t.includes('spell') || t.includes('trap')) return;
        const qty = item.qty || 1;
        let assigned = false;
        for (const mt of monsterTypeOrder) {
            if (mt.key !== 'normal' && mt.key !== 'effect' && t.includes(mt.key)) {
                monsterTypeCounts[mt.key] = (monsterTypeCounts[mt.key] || 0) + qty;
                assigned = true;
                break;
            }
        }
        if (!assigned) {
            const bucket = t.includes('normal monster') ? 'normal' : 'effect';
            monsterTypeCounts[bucket] = (monsterTypeCounts[bucket] || 0) + qty;
        }
    });

    const totalMonsters = Object.values(monsterTypeCounts).reduce((s, v) => s + v, 0);
    const renderMonsterTypeBar = () => {
        if (!totalMonsters) return '';
        const bars = monsterTypeOrder
            .filter(mt => monsterTypeCounts[mt.key] > 0)
            .map(mt => {
                const val = monsterTypeCounts[mt.key];
                const pct = Math.round((val / totalMonsters) * 100);
                return `
            <div class="dsg-bar-item">
                <div class="dsg-bar-label" style="color:${mt.color}">${mt.label}</div>
                <div class="dsg-bar-track">
                    <div class="dsg-bar-fill" style="width:${pct}%;background:${mt.color}"></div>
                </div>
                <div class="dsg-bar-val">${val}</div>
            </div>`;
            }).join('');
        return `<div class="dsg-group"><div class="dsg-group-title">Tipos de Monstruo</div>${bars}</div>`;
    };


    // YGOProDeck devuelve el subtipo en card.race, no en card.type
    const spellTypes = {};
    const spellSubtypeMap = {
        'Quick-Play': 'Juego Rápido', 'Continuous': 'Continuo',
        'Field': 'Campo', 'Equip': 'Equipo', 'Ritual': 'Ritual'
    };
    allCards.forEach(item => {
        const t = item.data.type || '';
        if (!t.toLowerCase().includes('spell')) return;
        const race = item.data.race || '';
        const qty = item.qty || 1;
        let matched = false;
        for (const [key, label] of Object.entries(spellSubtypeMap)) {
            if (race.includes(key)) { spellTypes[label] = (spellTypes[label] || 0) + qty; matched = true; break; }
        }
        if (!matched) spellTypes['Normal'] = (spellTypes['Normal'] || 0) + qty;
    });

    // Ídem: subtipo en card.race
    const trapTypes = {};
    const trapSubtypeMap = { 'Counter': 'Counter', 'Continuous': 'Continua' };
    allCards.forEach(item => {
        const t = item.data.type || '';
        if (!t.toLowerCase().includes('trap')) return;
        const race = item.data.race || '';
        const qty = item.qty || 1;
        let matched = false;
        for (const [key, label] of Object.entries(trapSubtypeMap)) {
            if (race.includes(key)) { trapTypes[label] = (trapTypes[label] || 0) + qty; matched = true; break; }
        }
        if (!matched) trapTypes['Normal'] = (trapTypes['Normal'] || 0) + qty;
    });

    // ── Helpers chips (vista original) ───────────────────────────
    const renderChipRow = (obj, colorFn) => Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `<span class="ds-chip" style="${colorFn ? colorFn(k) : ''}">${k} <strong>(${v})</strong></span>`)
        .join('');

    const attrColors = {
        'FIRE':'background:rgba(255,80,0,0.25);border-color:#ff5000',
        'WATER':'background:rgba(0,120,255,0.25);border-color:#0078ff',
        'EARTH':'background:rgba(140,100,50,0.25);border-color:#8c6432',
        'WIND':'background:rgba(0,200,100,0.25);border-color:#00c864',
        'LIGHT':'background:rgba(255,220,0,0.25);border-color:#ffdc00',
        'DARK':'background:rgba(100,0,180,0.25);border-color:#6400b4',
        'DIVINE':'background:rgba(255,215,0,0.25);border-color:#ffd700'
    };
    const attrColorFn = k => attrColors[k] || '';

    const group = (title, content) => content
        ? `<div class="ds-group"><div class="ds-group-title">${title}</div><div class="ds-chips">${content}</div></div>`
        : '';

    // barColor: string CSS para el color de la barra
    const renderBarGroup = (title, data, barColor, labelColor) => {
        if (!Object.keys(data).length) return '';
        const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const maxVal = sorted[0][1];
        const bars   = sorted.map(([label, val]) => {
            const pct = Math.round((val / maxVal) * 100);
            return `
            <div class="dsg-bar-item">
                <div class="dsg-bar-label" style="color:${labelColor || 'rgba(255,255,255,0.75)'}">${label}</div>
                <div class="dsg-bar-track">
                    <div class="dsg-bar-fill" style="width:${pct}%;background:${barColor}"></div>
                </div>
                <div class="dsg-bar-val">${val}</div>
            </div>`;
        }).join('');

        return `
        <div class="dsg-group">
            <div class="dsg-group-title">${title}</div>
            ${bars}
        </div>`;
    };

    const attrBarColor = (attr) => ({
        'FIRE':  '#ff5000', 'WATER': '#0078ff', 'EARTH': '#8c6432',
        'WIND':  '#00c864', 'LIGHT': '#ffdc00', 'DARK':  '#9b59b6',
        'DIVINE':'#ffd700'
    })[attr] || 'rgba(255,215,0,0.7)';

    // Atributos: barra por atributo con su color propio
    const renderAttrBars = (data) => {
        if (!Object.keys(data).length) return '';
        const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const maxVal = sorted[0][1];
        const bars   = sorted.map(([label, val]) => {
            const pct   = Math.round((val / maxVal) * 100);
            const color = attrBarColor(label);
            return `
            <div class="dsg-bar-item">
                <div class="dsg-bar-label" style="color:${color}">${label}</div>
                <div class="dsg-bar-track">
                    <div class="dsg-bar-fill" style="width:${pct}%;background:${color}"></div>
                </div>
                <div class="dsg-bar-val">${val}</div>
            </div>`;
        }).join('');
        return `<div class="dsg-group"><div class="dsg-group-title">Atributos</div>${bars}</div>`;
    };

    // ── Vista gráfica grupo 1: M / H / T ─────────────────────────
    const typeColors = { 'Monstruo': '#d9b38c', 'Hechizo': '#00b894', 'Trampa': '#ff6b9d' };
    const totalMHT  = Object.values(cardTypes).reduce((s, v) => s + v, 0);
    const mhtBars   = Object.entries(cardTypes)
        .sort((a, b) => b[1] - a[1])
        .map(([label, val]) => {
            const pct = totalMHT > 0 ? Math.round((val / totalMHT) * 100) : 0;
            const col = typeColors[label] || 'rgba(255,215,0,0.6)';
            return `
            <div class="dsg-bar-item dsg-bar-item-lg">
                <div class="dsg-bar-label dsg-bar-label-lg" style="color:${col}">${label}</div>
                <div class="dsg-bar-track dsg-bar-track-lg">
                    <div class="dsg-bar-fill" style="width:${pct}%;background:${col}"></div>
                    <span class="dsg-bar-pct">${pct}%</span>
                </div>
                <div class="dsg-bar-val dsg-bar-val-lg">${val}</div>
            </div>`;
        }).join('');

    const chartGroup1 = `
    <div class="dsg-section">
        <div class="dsg-section-title">Monstruos · Hechizos · Trampas</div>
        <div class="dsg-group dsg-group-mht">${mhtBars}</div>
    </div>`;

    // ── Vista gráfica grupo 2: todo lo demás ─────────────────────
    const chartGroup2 = `
    <div class="dsg-section">
        <div class="dsg-section-title">Desglose detallado</div>
        <div class="dsg-scroll-row">
            ${renderMonsterTypeBar()}
            ${renderAttrBars(attributes)}
            ${renderBarGroup('Tipo de Monstruo', races,         'rgba(108,92,231,0.75)', '#a29bfe')}
            ${renderBarGroup('Niveles / Rangos / Link', levels, 'rgba(0,184,148,0.75)',  '#00b894')}
            ${Object.keys(secondaryTypes).length ? renderBarGroup('Tipos Secundarios', secondaryTypes, 'rgba(253,203,110,0.75)', '#fdcb6e') : ''}
            ${Object.keys(spellTypes).length     ? renderBarGroup('Subtipos Hechizo',  spellTypes,    'rgba(0,200,150,0.65)',   '#00b894') : ''}
            ${Object.keys(trapTypes).length      ? renderBarGroup('Subtipos Trampa',   trapTypes,     'rgba(255,107,157,0.65)', '#ff6b9d') : ''}
        </div>
    </div>`;

    return `
    <div class="deck-stats-block">
        <div class="dstab-tabs">
            <button class="dstab-btn active" id="dstab-main"  onclick="Deck.switchDeckStatsTab('main')">
                🃏 Main
            </button>
            <button class="dstab-btn" id="dstab-extra" onclick="Deck.switchDeckStatsTab('extra')">
                ✨ Extra
            </button>
            <button class="dstab-btn" id="dstab-side"  onclick="Deck.switchDeckStatsTab('side')">
                🔄 Side
            </button>
            <button class="dstab-btn" id="dstab-chips" onclick="Deck.switchDeckStatsTab('chips')">
                📋 Composición
            </button>
            <button class="dstab-btn" id="dstab-chart" onclick="Deck.switchDeckStatsTab('chart')">
                📊 Gráfica
            </button>
        </div>
        <!-- VISTAS DE CARTAS POR ZONA -->
        <div id="dstab-pane-main">${this._buildDeckViewPane('main')}</div>
        <div id="dstab-pane-extra" style="display:none;">${this._buildDeckViewPane('extra')}</div>
        <div id="dstab-pane-side"  style="display:none;">${this._buildDeckViewPane('side')}</div>

       <!-- VISTA CHIPS (original) -->
        <div id="dstab-pane-chips" style="display:none;">
            ${totalMonsters > 0 ? `<div class="ds-row">
                ${group('Tipos de Monstruo', monsterTypeOrder
                    .filter(mt => monsterTypeCounts[mt.key] > 0)
                    .map(mt => `<span class="ds-chip" style="border-color:${mt.color}">${mt.label} <strong>(${monsterTypeCounts[mt.key]})</strong></span>`)
                    .join(''))}
            </div>` : ''}
            <div class="ds-row">
                ${group('Tipo de Cartas', renderChipRow(cardTypes, null))}
                ${Object.keys(attributes).length ? group('Atributos', renderChipRow(attributes, attrColorFn)) : ''}
            </div>
            <div class="ds-row">
                ${Object.keys(races).length ? group('Tipo de Monstruo', renderChipRow(races, null)) : ''}
                ${Object.keys(secondaryTypes).length ? group('Tipos Secundarios', renderChipRow(secondaryTypes, null)) : ''}
            </div>
            <div class="ds-row">
                ${Object.keys(levels).length ? group('Niveles / Rangos / Link', renderChipRow(levels, null)) : ''}
            </div>
            <div class="ds-row">
                ${Object.keys(spellTypes).length ? group('Subtipos Hechizo', renderChipRow(spellTypes, null)) : ''}
                ${Object.keys(trapTypes).length  ? group('Subtipos Trampa',  renderChipRow(trapTypes,  null)) : ''}
            </div>
        </div>

        <!-- VISTA GRÁFICA -->
        <div id="dstab-pane-chart" style="display:none;">
            ${chartGroup1}
            ${chartGroup2}
        </div>
    </div>`;
},

// ── Cambio de sub-pestaña en deck-stats-block ─────────────────
switchDeckStatsTab: function (tab) {
    const panes = ['main', 'extra', 'side', 'chips', 'chart'];
    panes.forEach(p => {
        const pane = document.getElementById(`dstab-pane-${p}`);
        const btn  = document.getElementById(`dstab-${p}`);
        if (pane) pane.style.display = (p === tab) ? '' : 'none';
        if (btn)  btn.classList.toggle('active', p === tab);
    });
},
switchMiDeckTab: function (tab) {
    const panes = ['mideck-importar-pane', 'mideck-decklist-pane', 'mideck-construccion-pane', 'mideck-optimizacion-pane', 'mideck-combos-pane'];
    panes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById('mideck-' + tab + '-pane');
    if (target) target.style.display = 'block';

    document.querySelectorAll('.mideck-subtab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.mideck-subtab-btn[data-tab="' + tab + '"]');
    if (btn) btn.classList.add('active');

    if (tab === 'construccion' && window.Estadisticas) {
        const cStats = document.getElementById('construccion-deck-stats-sec');
        if (cStats) cStats.innerHTML = Estadisticas.renderDeckStats();
        const cAnalysis = document.getElementById('construccion-deck-analysis-sec');
        if (cAnalysis) cAnalysis.innerHTML = Estadisticas.renderDeckAnalysis();
    }
    if (tab === 'combos' && window.Combos) {
        const pane = document.getElementById('mideck-combos-pane');
        if (pane) pane.innerHTML = Combos.renderPane();
    }
},
// ===============================
setCartaAs: function (cardId) {
    for (const [id, item] of Object.entries(this.cards)) {
        if (item.roles && item.roles.includes('Carta As')) {
            this.cards[id].roles = item.roles.filter(r => r !== 'Carta As');
        }
    }
    if (cardId && this.cards[cardId]) {
        if (!this.cards[cardId].roles) this.cards[cardId].roles = [];
        this.cards[cardId].roles.push('Carta As');
    }
},

getCartaAs: function () {
    for (const [id, item] of Object.entries(this.cards)) {
        if (item.roles?.includes('Carta As')) return id;
    }
    return null;
},
// Llamar después de cualquier carga de deck.
onDeckLoaded: function () {
    if (window.Estadisticas) {
        Estadisticas.updateDeckStats();
        if (typeof Estadisticas.updateFloatingWidget === 'function') {
            Estadisticas.updateFloatingWidget();
        }
    }
    if (window.Winrate) Winrate.refreshSection();
},

    // ===============================
    _renderEmptyDeckNotice: function (msgDesktop, msgMobile) {
        const sidebarImgName = window.Buscador?.getSidebarImage?.() || 'Protagonistas';
        return `
    <p class="deck-empty-msg-desktop" style="margin-top:10px;font-size:.85rem;opacity:.6">${msgDesktop}</p>
    <div class="deck-empty-mobile">
        <img src="img/${sidebarImgName}.webp" alt="Yu-Gi-Oh! ${sidebarImgName}" class="deck-empty-mobile-img" loading="lazy">
        <p class="deck-empty-msg-mobile" style="font-size:.85rem;opacity:.6">${msgMobile || msgDesktop}</p>
    </div>`;
    },
    // ===============================
    render: function () {
        if (!this.container) return;

        const mainC = this.count('main');
        const extraC = this.count('extra');
        const sideC = this.count('side');
        const totalCards = Object.keys(this.cards).length;
        const isEmpty = totalCards === 0;
        const sidebarImgName = window.Buscador?.getSidebarImage?.() || 'Protagonistas';

        let html = ``;

if (isEmpty) {
    html += `
<div class="mideck-layout">
<div class="buscador-cover-sidebar">
    <img src="img/${sidebarImgName}.webp" alt="Yu-Gi-Oh! ${sidebarImgName}" class="buscador-cover-img" loading="lazy">
</div>
<div class="mideck-main">`;
}

html += `
<div class="mideck-subtabs-nav">
    <button class="mideck-subtab-btn mideck-subtab-btn-import sim-tab-btn" data-tab="importar" onclick="Deck.switchMiDeckTab('importar')">📥 Import/Export Deck</button>
    <button class="mideck-subtab-btn active sim-tab-btn" data-tab="decklist" onclick="Deck.switchMiDeckTab('decklist')">📋 Decklist</button>
    <button class="mideck-subtab-btn sim-tab-btn" data-tab="construccion" onclick="Deck.switchMiDeckTab('construccion')">🔨 Construcción</button>
    <button class="mideck-subtab-btn sim-tab-btn" data-tab="optimizacion" onclick="Deck.switchMiDeckTab('optimizacion')">🎯 Optimización</button>
    <button class="mideck-subtab-btn sim-tab-btn" data-tab="combos" onclick="Deck.switchMiDeckTab('combos')">🧬 Línea de Combos</button>
</div>`;

html += `
<div id="mideck-importar-pane" style="display:none;">
    <p class="mideck-import-label">Importar desde:</p>
    <div class="mideck-import-actions">
        <button class="deck-move" onclick="Deck.importYDK()">Archivo .ydk</button>
        <button class="deck-move" onclick="Deck.importPDF()">Lista Oficial (.pdf)</button>
    </div>
    <p class="mideck-import-label">Exportar / Guardar:</p>
    <div class="mideck-import-actions">
        <button class="deck-move" onclick="Deck.saveDeck()" ${isEmpty ? 'disabled' : ''}>💾 Guardar Deck</button>
        <button class="deck-move" onclick="Deck.exportYDK()" ${isEmpty ? 'disabled' : ''}>📤 Exportar Deck (.ydk)</button>
        <button class="deck-move" onclick="Deck.exportTXT()" ${isEmpty ? 'disabled' : ''}>📝​ Descargar Lista (.txt)</button>
        <button class="deck-move" onclick="Deck.downloadDecklist()" ${isEmpty ? 'disabled' : ''}>📸 Descargar Decklist (.png)</button>
        <button class="deck-move" style="background:#00b894;border-color:#00b894;color:#fff;"
                onclick="Deck.exportDeckData()" ${isEmpty ? 'disabled' : ''}>📦 Exportar Data del Deck</button>
    </div>
    <p class="mideck-import-note" style="font-size:.75rem;opacity:.65;margin:4px 0 0;">
        * Exporta absolutamente toda la información de este deck (cartas, Carta As, notas, historial de versiones,
        Optimización, Complejidad, Historial de Enfrentamientos y Líneas de Combo) para trasladarla a otro usuario de la App.
    </p>
    <p class="mideck-import-label">Importar Data Completa:</p>
    <div class="mideck-import-actions">
        <button class="deck-move" onclick="Deck.importDeckData()">📥 Importar Data del Deck</button>
    </div>
    ${isEmpty ? this._renderEmptyDeckNotice(
        'Elige un deck desde el panel lateral o agrega cartas desde el Buscador.',
        'Elige un deck desde el panel inferior o agrega cartas desde el Buscador.'
    ) : ''}
</div>`;

html += `
<div class="mideck-mobile-banner">
    <img src="img/${sidebarImgName}.webp" alt="Yu-Gi-Oh! ${sidebarImgName}" class="mideck-mobile-banner-img" loading="lazy">
</div>
<div id="mideck-decklist-pane">`;

if (isEmpty) {
    html += this._renderEmptyDeckNotice(
        'Elige un deck desde el panel lateral o agrega cartas desde el Buscador.',
        'Elige un deck desde el panel inferior o agrega cartas desde el Buscador.'
    );
} else {
    html += `
    <h2 onclick="Deck.openRenamePanel()" class="deck-title">${this.name}</h2>
    <div class="deck-zone-counts">
        <span class="dzc-chip dzc-main">🃏 Main <strong>${mainC}</strong></span>
        <span class="dzc-chip dzc-extra">✨ Extra <strong>${extraC}</strong></span>
        <span class="dzc-chip dzc-side">🔄 Side <strong>${sideC}</strong></span>
        <button class="dzc-exp-btn" data-section-id="deck-experimentacion" onclick="Deck.tryDeckExperimentacion(Deck.name)" title="Abrir en Experimentación">🧪 Exp.</button>
        <button class="dzc-probar-btn" onclick="Deck.tryDeck()">⚔️ Probar Deck</button>
        <button class="deck-move" onclick="Deck.clearDeck()" ${isEmpty ? 'disabled' : ''}>🗑️ Limpiar Deck</button>
    </div>
    ${window.Banlist?.isGenesysActive?.() ? Banlist.renderDeckPointsIndicator(this.cards) : ''}
    <h3 onclick="Deck.toggleSection('main-sec')">🃏 Main Deck (${mainC})</h3>
    <div id="main-sec">${this.renderRows('main')}</div>
    <h3 onclick="Deck.toggleSection('extra-sec')">🃏 Extra Deck (${extraC})</h3>
    <div id="extra-sec">${this.renderRows('extra')}</div>
    <h3 onclick="Deck.toggleSection('side-sec')">🃏 Side Deck (${sideC})</h3>
    <div id="side-sec">${this.renderRows('side')}</div>`;
}
if (!isEmpty) {
    html += this.renderExperienciaSection();
}

if (!isEmpty) {
    html += `
    <div data-section-id="deck-versiones">
    <h3 class="deck-section-title" onclick="Deck.toggleSection('versiones-sec')">🕒 Historial de Versiones</h3>
    <div id="versiones-sec" class="deck-section-content" style="display:none;">
        <div id="deck-versiones-list">${this.renderVersionesList()}</div>
    </div>
    </div>`;
}

html += `</div>`;

html += `<div id="mideck-construccion-pane" style="display:none;">`;

if (!isEmpty) {
    html += `<div id="construccion-complejidad-box">${this.renderComplejidadResultCard()}</div>`;
    html += `<div data-section-id="deck-chart">${this.renderDeckStatsBlock()}</div>`;

    html += `
        <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('construccion-deck-stats-sec')">
            📈 Deck Activo - Internal Score
        </h3>
        <div id="construccion-deck-stats-sec" class="stats-section" style="display:none;">
            ${window.Estadisticas ? Estadisticas.renderDeckStats() : ''}
        </div>

        <h3 class="stats-section-title" onclick="Estadisticas.toggleSection('construccion-deck-analysis-sec')">
            📊 Análisis del Deck vs Meta
        </h3>
        <div id="construccion-deck-analysis-sec" class="stats-section">
            ${window.Estadisticas ? Estadisticas.renderDeckAnalysis() : ''}
        </div>`;
} else {
    html += this._renderEmptyDeckNotice('Carga un deck para ver la sección de Construcción.');
}

html += `</div>`;
html += `<div id="mideck-optimizacion-pane" style="display:none;">${!isEmpty ? this.renderOptimizacionPane() : this._renderEmptyDeckNotice('Carga un deck para usar Optimización.')}</div>`;
html += `<div id="mideck-combos-pane" style="display:none;">${window.Combos ? Combos.renderPane() : ''}</div>`;

if (isEmpty) {
    html += `</div></div>`;
}

this.container.innerHTML = html;
this.renderBuscadorDeckPreview();
    },

    // ── Vista previa Main/Extra en la pestaña Buscador (arriba del buscador) ──
    renderBuscadorDeckPreview: function () {
        const box = document.getElementById('buscador-deck-preview-box');
        if (!box) return;

        const mainEntries  = Object.entries(this.cards).filter(([, c]) => c.location === 'main')
            .sort((a, b) => this.compareCards(a, b, 'main'));
        const extraEntries = Object.entries(this.cards).filter(([, c]) => c.location === 'extra')
            .sort((a, b) => this.compareCards(a, b, 'extra'));

        if (!mainEntries.length && !extraEntries.length) {
            box.style.display = 'none';
            box.innerHTML = '';
            return;
        }
        box.style.display = '';

        const esc = s => (s || '').replace(/"/g, '&quot;');
        const col = (entries, label) => {
            const count = entries.reduce((s, [, c]) => s + c.qty, 0);
            if (!entries.length) {
                return `<div class="bdp-col"><div class="bdp-col-hdr">${label} (0)</div><p class="opt-key-empty">Vacío.</p></div>`;
            }
            const thumbs = entries.map(([id, item]) => {
                const img  = item.data?.card_images?.[0]?.image_url_small || '';
                const name = esc(item.data?.name);
                return `
                    <div class="bdp-thumb-wrap" onclick="Deck.removeFromBuscadorPreview('${id}')" title="Quitar ${name}">
                        <img src="${img}" alt="${name}">
                        <span class="bdp-thumb-qty">x${item.qty}</span>
                    </div>`;
            }).join('');
            return `<div class="bdp-col">
                <div class="bdp-col-hdr">${label} (${count})</div>
                <div class="bdp-col-grid">${thumbs}</div>
            </div>`;
        };

        box.innerHTML = `
            <div class="bdp-title">🗂️ ${esc(this.name) || 'Mi Deck'} — Vista Previa <span class="bdp-hint">(clic en una carta para quitarla)</span></div>
            <div class="bdp-cols">
                ${col(mainEntries, '🃏 Main')}
                ${col(extraEntries, '✨ Extra')}
            </div>`;
    },

    removeFromBuscadorPreview: function (id) {
        this.changeQty(id, -1);
    },

    getOptimizacion: function(deckName) {
        try {
            const raw = JSON.parse(localStorage.getItem(`optimization_${deckName || this.name}`));
            if (!raw) return { sessions: [] };
            // Migración: formato viejo con records[] → convertir a sesión única
            if (raw.records && !raw.sessions) {
                const migrated = { sessions: [] };
                if (raw.records.length) {
                    // Cada record viejo se convierte en sesión con rondas sintéticas
                    raw.records.forEach(rec => {
                        const rounds = [];
                        const total = rec.partidas || 0;
                        for (let i = 0; i < total; i++) {
                            const isWin = i < (rec.victorias || 0);
                            rounds.push({
                                id: rec.id + i,
                                orden: 'primero',
                                resultado: isWin ? 'victoria' : 'derrota',
                                tipoVictoria: isWin ? 'normal' : null,
                                tipoDerrota: !isWin ? 'normal' : null,
                                presionTiempo: 'holgado',
                                comboCompleto: i < (rec.combosCompletos || 0),
                                brick: i < (rec.brickeadas || 0),
                                starter: (rec.vecesStarter || 0) > i ? 1 : 0,
                                extenders: (rec.vecesExtenders || 0) > i ? 1 : 0,
                                handtraps: (rec.demasiasHandtraps || 0) > i ? 3 : 1,
                                rompioBoard: i < (rec.vecesRompioBoard || 0),
                                negoJugada: i < (rec.vecesNegoJugada || 0),
                                rivalRompio: i < (rec.vecesRivalRompio || 0),
                                notas: ''
                            });
                        }
                        migrated.sessions.unshift({ id: rec.id, date: rec.date, label: rec.label || '', rounds });
                    });
                }
                return migrated;
            }
            return raw;
        } catch(e) { return { sessions: [] }; }
    },

    // Clasificación de un score de sesión de Optimización (mismos rangos que
    // scrB en renderOptimizacionPane). Reutilizada por el sidebar de Decks.
    getSessionScoreBadge: function(score) {
        if (score >= 80) return ['💎 Competitivo', 'opt-c-green'];
        if (score >= 65) return ['✅ Optimizado', 'opt-c-blue'];
        if (score >= 50) return ['⚠ Funcional', 'opt-c-yellow'];
        return ['❌ Desbalanceado', 'opt-c-red'];
    },

    // Score de la última sesión de Optimización registrada para un deck
    // (por nombre). Devuelve null si el deck no tiene sesiones aún.
    getLastSessionScore: function(deckName) {
        const data = this.getOptimizacion(deckName);
        const sessions = data.sessions || [];
        if (!sessions.length) return null;
        return this.calcOptMetrics(sessions[0]).score;
    },
// ── Puntaje por Versión del Deck ────────────────────────────────
    // session.id es epoch ms (Date.now()+offset) en todos los caminos de
    // creación (manual, migración vieja, import de Matchups) — sirve como
    // ancla temporal fiable para saber a qué versión pertenece cada sesión.
    _sessionsInRange: function(deckName, startAt, endAt) {
        const data = this.getOptimizacion(deckName);
        return (data.sessions || []).filter(s => {
            const t = s.id || 0;
            return t >= startAt && t < endAt;
        });
    },

    // Promedio de puntaje de sesión dentro de un rango de tiempo (una versión).
    // null si no hay sesiones registradas en ese rango.
    getVersionScore: function(deckName, startAt, endAt) {
        const sessions = this._sessionsInRange(deckName, startAt, endAt ?? Infinity);
        if (!sessions.length) return null;
        const scores = sessions.map(s => this.calcOptMetrics(s).score);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return { avg: Math.round(avg * 10) / 10, count: sessions.length };
    },

    // Puntaje de la versión ACTUALMENTE guardada (la última de versions[]).
    // Se resetea solo con guardar una versión nueva — usado en el sidebar.
    getCurrentVersionScore: function(deckName) {
        const versions = this.getVersions(deckName);
        if (!versions.length) return null;
        const current = versions[versions.length - 1];
        return this.getVersionScore(deckName, current.savedAt, Infinity);
    },
    // ── Cartas Clave / Mayores Amenazas — agregado de TODA la Optimización ──
    // Cuenta en cuántas rondas (todas las sesiones, sin filtrar por versión)
    // se marcó cada carta como Clave o Amenaza. Si aparece en 50% o más de
    // las rondas totales entra al Top, salvo que esté Prohibida en el
    // formato activo de Banlist.
    getTopKeyThreatCards: function(deckName) {
        const data = this.getOptimizacion(deckName);
        const sessions = data.sessions || [];
        let totalRounds = 0;
        const keyFreq = {}, threatFreq = {};

        sessions.forEach(sess => {
            (sess.rounds || []).forEach(r => {
                totalRounds++;
                (r.keyCards || []).forEach(c => {
                    if (!keyFreq[c.id]) keyFreq[c.id] = { ...c, count: 0 };
                    keyFreq[c.id].count++;
                });
                (r.threatCards || []).forEach(c => {
                    if (!threatFreq[c.id]) threatFreq[c.id] = { ...c, count: 0 };
                    threatFreq[c.id].count++;
                });
            });
        });

        if (!totalRounds) return { key: [], threat: [], totalRounds: 0 };

        const notBanned = c => !window.Banlist || Banlist.getEffectiveBanStatus(c.id) !== 'forbidden';
        const half = totalRounds * 0.1; // 10% threshold for top cards
        const key    = Object.values(keyFreq).filter(c => c.count >= half && notBanned(c)).sort((a, b) => b.count - a.count);
        const threat = Object.values(threatFreq).filter(c => c.count >= half && notBanned(c)).sort((a, b) => b.count - a.count);
        return { key, threat, totalRounds };
    },

    // Render de la sección — dos filas horizontales con scroll (Cartas Clave
    // y Mayores Amenazas). Abierta por defecto, click abre el CardViewer.
    _renderKeyThreatCardsSection: function(deckName) {
        const { key, threat } = this.getTopKeyThreatCards(deckName);
        const esc = s => (s || '').replace(/"/g, '&quot;');
        const row = (cards, emptyMsg) => {
            if (!cards.length) return `<p class="opt-key-empty">${emptyMsg}</p>`;
            return `<div class="opt-topcards-row">
                ${cards.map(c => `
                    <div class="opt-topcards-item" onclick="Combos.viewMetaCard('${c.id}')" title="${esc(c.name)}">
                        <img src="${c.img}" alt="${esc(c.name)}">
                        <span class="opt-topcards-name">${c.name}</span>
                    </div>`).join('')}
            </div>`;
        };
        return `
        <div data-section-id="deck-topcards">
        <h3 class="deck-section-title" onclick="Deck.toggleSection('topcards-sec')">📌 Cartas Clave y Amenazas del Deck</h3>
        <div id="topcards-sec" class="deck-section-content">
            <div class="opt-topcards-group">
                <div class="opt-topcards-group-title">🗝️ Cartas Clave</div>
                ${row(key, 'Aún no hay cartas clave que superen el 10% de tus duelos.')}
            </div>
            <div class="opt-topcards-group">
                <div class="opt-topcards-group-title">🎯 Mayores Amenazas</div>
                ${row(threat, 'Aún no hay amenazas que superen el 10% de tus duelos.')}
            </div>
        </div>
        </div>`;
    },
    saveOptimizacionSession: function(session) {
        const data = this.getOptimizacion();
        if (!data.sessions) data.sessions = [];
        data.sessions.unshift(session);
        localStorage.setItem(`optimization_${this.name}`, JSON.stringify(data));
    },

    deleteOptimizacionRecord: function(id) {
        const data = this.getOptimizacion();
        const sess = (data.sessions || []).find(s => s.id === id);
        data.sessions = (data.sessions || []).filter(s => s.id !== id);
        localStorage.setItem(`optimization_${this.name}`, JSON.stringify(data));
        this.regenerateUid();

        // Vínculo con Historial de Enfrentamientos: si esta sesión vino de un import,
        // borra también su registro correspondiente en Matchups.
        if (sess?._importedMatchup && window.Matchups) {
            Matchups._removeRecordByName(sess._importedMatchup);
        }

        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
    },

    deleteOptimizacionRound: function(sessionId, roundId) {
        const data = this.getOptimizacion();
        const sess = (data.sessions || []).find(s => s.id === sessionId);
        if (!sess) return;
        sess.rounds = sess.rounds.filter(r => r.id !== roundId);
        localStorage.setItem(`optimization_${this.name}`, JSON.stringify(data));
        this.regenerateUid();
        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
    },

    editOptimizacionRound: function(sessionId, roundId) {
        // Reabrir el formulario con los valores exactos de una ronda ya registrada
        const data = this.getOptimizacion();
        const sess = (data.sessions || []).find(s => s.id === sessionId);
        if (!sess) return;
        const round = (sess.rounds || []).find(r => r.id === roundId);
        if (!round) return;
        this._activeSessionId = sessionId;
        this._editingRoundId  = roundId;
        this._pendingKeyCards    = round.keyCards    ? [...round.keyCards]    : [];
        this._pendingThreatCards = round.threatCards ? [...round.threatCards] : [];
        this.openRoundModal();
        this._fillRoundForm(round);
    },

    _fillRoundForm: function(round) {
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = (val ?? ''); };
        setVal('opt-r-starter',      round.starter ?? 0);
        setVal('opt-r-extenders',    round.extenders ?? 0);
        setVal('opt-r-handtraps',    round.handtraps ?? 0);
        setVal('opt-r-boardbreaker', round.boardbreakers ?? 0);
        setVal('opt-r-bricks',       round.bricks ?? 0);
        setVal('opt-r-oppname',      round.oppDeck || '');
        setVal('opt-r-negate',       round.interrupciones ?? 0);
        setVal('opt-r-board',        round.vecesRompioBoard ?? 0);
        setVal('opt-r-combo',        round.rivalInterrupciones ?? 0);
        setVal('opt-r-rival',        round.vecesRivalRompioBoard ?? 0);
        setVal('opt-r-resultado',    round.resultado || '');
        setVal('opt-r-orden',        round.orden || '');
        setVal('opt-r-tipo-vic',     round.tipoVictoria || 'normal');
        setVal('opt-r-cat-vic',      round.categoriaVictoria || 3);
        setVal('opt-r-turnovic',     round.turnoVictoria || '');
        setVal('opt-r-tipo-der',     round.tipoDerrota || 'normal');
        setVal('opt-r-turnoder',     round.turnoDerrota || '');
        setVal('opt-r-tiempo',       round.presionTiempo || 'holgado');
        setVal('opt-r-notas',        round.notas || '');
        this._optToggleTipo();
        if (round.resultado === 'victoria') this._setCatVictoria(round.categoriaVictoria || 3);
    },

    calcOptMetrics: function(session) {
        const rounds = session.rounds || [];
        const p = Math.max(rounds.length, 1);
        const wins        = rounds.filter(r => r.resultado === 'victoria').length;
        const losses      = rounds.filter(r => r.resultado === 'derrota').length;
        const bricks      = rounds.filter(r => r.brick).length;
        const starters    = rounds.filter(r => (r.starter || 0) >= 1).length;
        const extenders   = rounds.filter(r => (r.extenders || 0) >= 1).length;
        const rivalInterr = rounds.filter(r => (r.rivalInterrupciones || 0) >= 1 || r.comboCompleto).length;
        const boardBreaks = rounds.filter(r => r.rompioBoard).length;
        const rivalBreaks = rounds.filter(r => (r.vecesRivalRompioBoard || 0) >= 1 || r.rivalRompio).length;
        const negates     = rounds.filter(r => r.negoJugada).length;
        const ftks        = rounds.filter(r => r.tipoVictoria === 'ftk').length;
        const rendiciones = rounds.filter(r => r.tipoVictoria === 'rendicion').length;
        const tiempoGan   = rounds.filter(r => r.tipoVictoria === 'tiempo').length;
        const tiempoPer   = rounds.filter(r => r.tipoDerrota  === 'tiempo').length;
        const criticos    = rounds.filter(r => r.presionTiempo === 'critico').length;
        const ajustados   = rounds.filter(r => r.presionTiempo === 'ajustado').length;
        const rFirst      = rounds.filter(r => r.orden === 'primero');
        const rSecond     = rounds.filter(r => r.orden === 'segundo');
        const avgStarter  = rounds.reduce((a, r) => a + (r.starter   || 0), 0) / p;
        const avgExtender = rounds.reduce((a, r) => a + (r.extenders || 0), 0) / p;
        const avgHandtrap = rounds.reduce((a, r) => a + (r.handtraps || 0), 0) / p;
        const avgBoardbreaker = rounds.reduce((a, r) => a + (r.boardbreakers || 0), 0) / p;
        const avgRivalInterr  = rounds.reduce((a, r) => a + (r.rivalInterrupciones    || 0), 0) / p;
        const avgRivalBreaks  = rounds.reduce((a, r) => a + (r.vecesRivalRompioBoard  || 0), 0) / p;
        const htExceso    = rounds.filter(r => (r.handtraps || 0) >= 3).length;

        // ── Frecuencia de Cartas Clave / Amenazas del Oponente ────────
        const keyCardFreq = {}, threatCardFreq = {};
        rounds.forEach(r => {
            (r.keyCards || []).forEach(c => {
                if (!keyCardFreq[c.id]) keyCardFreq[c.id] = { ...c, count: 0 };
                keyCardFreq[c.id].count++;
            });
            (r.threatCards || []).forEach(c => {
                if (!threatCardFreq[c.id]) threatCardFreq[c.id] = { ...c, count: 0 };
                threatCardFreq[c.id].count++;
            });
        });
        const keyCardStats    = Object.values(keyCardFreq).sort((a, b) => b.count - a.count);
        const threatCardStats = Object.values(threatCardFreq).sort((a, b) => b.count - a.count);

        // ── Distribución de duelos por turno (ganados/perdidos) ──────
        const turnMap = {};
        rounds.forEach(r => {
            const t = r.turnoVictoria || r.turnoDerrota;
            if (!t) return;
            if (!turnMap[t]) turnMap[t] = { wins: 0, losses: 0 };
            if (r.resultado === 'victoria') turnMap[t].wins++; else turnMap[t].losses++;
        });
        const turnDist = Object.keys(turnMap)
            .map(t => ({ turn: parseInt(t), wins: turnMap[t].wins, losses: turnMap[t].losses }))
            .sort((a, b) => a.turn - b.turn);
        const turnTotal = turnDist.reduce((a, td) => a + td.wins + td.losses, 0);

        const winPoints = rounds.reduce((a, r) =>
            a + (r.resultado === 'victoria' ? this._catVictoriaWeight(r.categoriaVictoria) : 0), 0);
        const wr   = Math.round((winPoints    / p) * 100);
        const br   = Math.round((bricks      / p) * 100);
        const str  = Math.round((starters    / p) * 100);
        const extr = Math.round((extenders   / p) * 100);
        const ri   = Math.round((rivalInterr / p) * 100);
        const rib  = Math.round((rivalBreaks / p) * 100);
        const bb   = Math.round((boardBreaks / p) * 100);
        const ctrl = Math.round((negates     / p) * 100);
        const htRate = Math.round((htExceso  / p) * 100);
        const score = Math.min(100, Math.round(
            (wr * 0.35) + ((100 - br) * 0.20) + (str * 0.15) + ((100 - ri) * 0.15) + (bb * 0.10) + (ctrl * 0.05)
        ));
        return {
            p, wins, losses, wr, br, str, extr, ri, rib, bb, ctrl, htRate, score,
            ftks, rendiciones, tiempoGan, tiempoPer, criticos, ajustados,
            rFirst, rSecond, avgStarter, avgExtender, avgHandtrap, avgBoardbreaker, avgRivalInterr, avgRivalBreaks,
            turnDist, turnTotal, keyCardStats, threatCardStats
        };
    },

    getOptDiagnostics: function(m) {
        const w = [];
        if (m.wr   < 40) w.push('⚠ Win rate bajo. Revisa el motor principal del deck.');
        if (m.br   > 20) w.push('⚠ Alto nivel de bricks. Reduce situacionales y añade más starters.');
        if (m.str  < 60) w.push('⚠ Abre starter con poca frecuencia. Añade más cartas que inicien el combo.');
        if (m.str  > 85) w.push('⚠ Exceso de starters. Considera reducir 1-2 para añadir extenders o handtraps.');
        if (m.extr < 30 && m.p >= 5) w.push('⚠ Pocos extenders en mano. El combo se corta fácil ante disrupciones.');
        if (m.ri   > 45) w.push('⚠ El rival interrumpe tus jugadas con frecuencia. Añade más protección u outs a hand traps.');
        if (m.rib  > 30) w.push('⚠ El rival rompe tu campo seguido. Refuerza la resiliencia post-disrupción.');
        if (m.bb   < 30) w.push('⚠ Going Second débil. Considera más outs y rompedores de campo.');
        if (m.avgBoardbreaker < 0.5 && m.rSecond.length >= 3) w.push('⚠ Pocos Boardbreakers en mano jugando de segundo. Considera sumar cartas que rompan el campo rival (Raigeki, Dark Ruler No More, Evenly Matched, etc.).');
        if (m.htRate > 35) w.push('⚠ Exceso de handtraps en mano (3+) frecuente. Reduce 1-2 para mejorar consistencia.');
        if (m.avgHandtrap < 0.5 && m.p >= 5) w.push('⚠ Casi sin handtraps en mano. Considera sumar 3-6 handtraps al main deck.');
        if (m.ftks > 0) w.push(`ℹ ${m.ftks} FTK${m.ftks > 1 ? 's' : ''} registrado${m.ftks > 1 ? 's' : ''}. Vigilar restricciones de banlist.`);
        if (m.tiempoPer > 0) w.push(`⚠ ${m.tiempoPer} derrota${m.tiempoPer > 1 ? 's' : ''} por tiempo. Trabaja la velocidad de tus secuencias.`);
        if (m.criticos > 0) w.push(`⚠ ${m.criticos} ronda${m.criticos > 1 ? 's' : ''} con tiempo crítico. El deck puede ser lento para torneo.`);
        if (m.rSecond.length > 0 && m.bb < 30) w.push('⚠ Juegas de segundo frecuentemente pero el Board Break es bajo. Añade más rompedores.');
        if (m.keyCardStats?.length) {
            const top = m.keyCardStats[0];
            if (top.count / m.p >= 0.5) w.push(`ℹ "${top.name}" fue marcada como Carta Clave en ${top.count}/${m.p} rondas. Es un pilar de tu plan de juego — prioriza protegerla y considera copias adicionales de su soporte.`);
        }
        if (m.threatCardStats?.length) {
            const top = m.threatCardStats[0];
            if (top.count / m.p >= 0.3) w.push(`⚠ "${top.name}" apareció como Amenaza del Oponente en ${top.count}/${m.p} rondas. Evalúa tech en Side Deck específico contra esa carta.`);
        }
        return w;
    },

    addOptimizacionRound: function() {
        if (!Object.keys(this.cards).length) { alert('Carga un deck primero.'); return; }
        const v  = id => document.getElementById(id)?.value ?? '';
        const n  = id => parseInt(document.getElementById(id)?.value) || 0;
        const ck = id => document.getElementById(id)?.checked || false;

        const resultado = v('opt-r-resultado');
        const orden     = v('opt-r-orden');
        if (!resultado) { alert('Selecciona Victoria o Derrota.'); return; }
        if (!orden)     { alert('Selecciona si fuiste Primero o Segundo.'); return; }

        const oppName  = v('opt-r-oppname').trim();
        const oppNotes = v('opt-r-oppnotes').trim();

        const round = {
            id:            Date.now(),
            orden,
            resultado,
            oppDeck:       oppName || null,
            tipoVictoria:  resultado === 'victoria' ? (v('opt-r-tipo-vic') || 'normal') : null,
            categoriaVictoria: resultado === 'victoria' ? (parseInt(v('opt-r-cat-vic'), 10) || 3) : null,
            tipoDerrota:   resultado === 'derrota'  ? (v('opt-r-tipo-der') || 'normal') : null,
            presionTiempo: v('opt-r-tiempo') || 'holgado',
            rivalInterrumpio:      n('opt-r-combo') > 0,
            rivalInterrupciones:   n('opt-r-combo'),
            bricks:        n('opt-r-bricks'),
            starter:       n('opt-r-starter'),
            extenders:     n('opt-r-extenders'),
            handtraps:     n('opt-r-handtraps'),
            boardbreakers: n('opt-r-boardbreaker'),
            rompioBoard:      n('opt-r-board') > 0,
vecesRompioBoard: n('opt-r-board'),
negoJugada:       n('opt-r-negate') > 0,
interrupciones:   n('opt-r-negate'),
turnoVictoria:    resultado === 'victoria' ? (n('opt-r-turnovic') || null) : null,
turnoDerrota:     resultado === 'derrota'  ? (n('opt-r-turnoder') || null) : null,
rivalRompioBoard:      n('opt-r-rival') > 0,
vecesRivalRompioBoard: n('opt-r-rival'),
notas:            v('opt-r-notas').trim(),
keyCards:         [...this._pendingKeyCards],
threatCards:      [...this._pendingThreatCards]
        };

        const data  = this.getOptimizacion();
        if (!data.sessions) data.sessions = [];
        const label = v('opt-label').trim();

        let sess = this._activeSessionId
            ? data.sessions.find(s => s.id === this._activeSessionId)
            : null;

        // ── Modo edición: reemplaza la ronda existente en vez de crear una nueva ──
        // (no se llama _syncRoundToMatchup aquí para no duplicar el conteo de
        // victorias/derrotas ya aplicado en Matchups cuando se registró la ronda)
        if (this._editingRoundId && sess) {
            round.id = this._editingRoundId;
            const idx = sess.rounds.findIndex(r => r.id === this._editingRoundId);
            if (idx !== -1) sess.rounds[idx] = round;
            if (label) sess.label = label;
            localStorage.setItem(`optimization_${this.name}`, JSON.stringify(data));
            this._editingRoundId = null;
            this.closeRoundModal();
            const pane = document.getElementById('mideck-optimizacion-pane');
            if (pane) pane.innerHTML = this.renderOptimizacionPane();
            return;
        }

        if (!sess) {
            sess = { id: Date.now() + 1, date: new Date().toLocaleDateString('es-ES'), label, rounds: [] };
            data.sessions.unshift(sess);
            this._activeSessionId = sess.id;
        } else if (label) {
            sess.label = label;
        }

        sess.rounds.push(round);
        localStorage.setItem(`optimization_${this.name}`, JSON.stringify(data));
        this.regenerateUid();

        this._syncRoundToMatchup(oppName, round, oppNotes);

        // Reset campos de ronda (conserva label y sesión activa)
        this._pendingKeyCards = [];
        this._pendingThreatCards = [];
        this._roundDraft = null;
        ['opt-r-resultado','opt-r-orden','opt-r-tipo-vic','opt-r-tipo-der','opt-r-notas','opt-r-oppname','opt-r-oppnotes']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const oppStatusEl = document.getElementById('opt-oppdeck-status');
        if (oppStatusEl) oppStatusEl.textContent = '';
        ['opt-r-starter','opt-r-extenders','opt-r-handtraps','opt-r-boardbreaker','opt-r-bricks']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = '0'; });
['opt-r-board','opt-r-negate','opt-r-combo','opt-r-rival']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const tvEl = document.getElementById('opt-r-turnovic');
        if (tvEl) tvEl.value = '';
        const tdEl = document.getElementById('opt-r-turnoder');
        if (tdEl) tdEl.value = '';
        const tEl = document.getElementById('opt-r-tiempo');
        if (tEl) tEl.value = 'holgado';
        // Ocultar selects de tipo
        ['opt-row-tipo-vic','opt-row-tipo-der','opt-row-turnovic','opt-row-turnoder','opt-row-cat-vic'].forEach(id => {
            const el = document.getElementById(id); if (el) el.style.display = 'none';
        });
        this._setCatVictoria(3);

        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
        this._refreshRoundModalIfOpen();
    },

   _pendingOppCardData: null,

    _importOppYDK: function() {
        if (!window.Matchups) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.ydk';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const statusEl = document.getElementById('opt-oppdeck-status');
            if (statusEl) statusEl.textContent = '⏳ Importando .ydk...';
            try {
                const text  = await file.text();
                const cards = await Matchups._parseYDKToCards(text);
                if (!cards || !Object.keys(cards).length) {
                    if (statusEl) statusEl.textContent = '❌ No se pudieron resolver las cartas';
                    return;
                }
                this._pendingOppCardData = cards;
                const nameEl = document.getElementById('opt-r-oppname');
                if (nameEl && !nameEl.value.trim()) nameEl.value = file.name.replace('.ydk', '');
                if (statusEl) statusEl.textContent = `✅ YDK importado (${Object.keys(cards).length} cartas únicas)`;
            } catch (_) {
                if (statusEl) statusEl.textContent = '❌ Error al procesar el archivo';
            }
        };
        input.click();
    },

    // Crea o actualiza el registro de Matchups correspondiente al nombre exacto ingresado
    _syncRoundToMatchup: function(name, round, oppNotes) {
        if (!name || !window.Matchups) { this._pendingOppCardData = null; return; }

        const list = Matchups.getAll();
        let rec = list.find(m => m.opponentName === name);
        const isWin   = round.resultado === 'victoria';
        const isFirst = round.orden === 'primero';

        if (!rec) {
            rec = {
                id: Matchups._uid(), opponentName: name,
                wins1st: 0, losses1st: 0, wins2nd: 0, losses2nd: 0,
                notes: '', cardData: null, createdAt: Date.now()
            };
            list.push(rec);
        }

        if (isWin && isFirst)        rec.wins1st   = (rec.wins1st   || 0) + 1;
        else if (!isWin && isFirst)  rec.losses1st = (rec.losses1st || 0) + 1;
        else if (isWin && !isFirst)  rec.wins2nd   = (rec.wins2nd   || 0) + 1;
        else                         rec.losses2nd = (rec.losses2nd || 0) + 1;

        if (this._pendingOppCardData && !rec.cardData) rec.cardData = this._pendingOppCardData;
        if (oppNotes) rec.notes = rec.notes ? `${rec.notes}\n${oppNotes}` : oppNotes;

        Matchups.save(list);
        this._pendingOppCardData = null;
    },

    cerrarSesionOptimizacion: function() {
        this._activeSessionId = null;
        this._roundDraft = null;
        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
    },
    // Alias por si algo externo sigue llamando addOptimizacionSession
    addOptimizacionSession: function() { this.addOptimizacionRound(); },

        
calcOptTrend: function(curr, prev, higherIsBetter) {
        if (prev === null || prev === undefined) return '';
        const diff = curr - prev;
        if (diff === 0) return '<span class="opt-trend opt-tr-eq">=</span>';
        const good = higherIsBetter ? diff > 0 : diff < 0;
        return `<span class="opt-trend ${good ? 'opt-tr-up' : 'opt-tr-dn'}">${diff > 0 ? '↑' : '↓'}</span>`;
    },

    editOptimizacionRecord: function(id) {
        // Reabrir sesión existente para seguir añadiendo rondas
        const data = this.getOptimizacion();
        const sess = (data.sessions || []).find(s => s.id === id);
        if (!sess) return;
        this._activeSessionId = id;
        const pane = document.getElementById('mideck-optimizacion-pane');
        if (pane) pane.innerHTML = this.renderOptimizacionPane();
        this.openRoundModal();
        const lbl = document.getElementById('opt-label');
        if (lbl) lbl.value = sess.label || '';
    },

    _optToggleTipo: function() {
    const res  = document.getElementById('opt-r-resultado')?.value;
    const vic  = document.getElementById('opt-row-tipo-vic');
    const der  = document.getElementById('opt-row-tipo-der');
    const tvic = document.getElementById('opt-row-turnovic');
    const tder = document.getElementById('opt-row-turnoder');
    const catv = document.getElementById('opt-row-cat-vic');
    if (vic)  vic.style.display  = res === 'victoria' ? '' : 'none';
    if (der)  der.style.display  = res === 'derrota'  ? '' : 'none';
    if (tvic) tvic.style.display = res === 'victoria' ? '' : 'none';
    if (tder) tder.style.display = res === 'derrota'  ? '' : 'none';
    if (catv) {
        catv.style.display = res === 'victoria' ? '' : 'none';
        if (res === 'victoria' && !this._editingRoundId) this._setCatVictoria(3);
    }
},

    _catVictoriaLabel: function(cat) {
        if (cat === 2) return 'Por resignación del rival o Carta Counter'; // Categoría C
        if (cat === 1) return 'Por missplay o novatada del rival'; // Categoría B
        return 'Por superar al rival totalmente'; // Categoría A (default / registros previos a esta feature)
    },

    _catVictoriaWeight: function(cat) {
        if (cat === 2) return 0.70;
        if (cat === 1) return 0;
        return 1.0; // Categoría A (default / registros previos a esta feature)
    },

    _setCatVictoria: function(n) {
        const input = document.getElementById('opt-r-cat-vic');
        if (input) input.value = n;
        document.querySelectorAll('#opt-star-rating .opt-star').forEach(s => {
            s.classList.toggle('opt-star-filled', parseInt(s.dataset.val, 10) <= n);
        });
        const lbl = document.getElementById('opt-cat-vic-label');
        if (lbl) lbl.textContent = `Categoría: ${this._catVictoriaLabel(n)}`;
    },
    // Navegación manual entre los 3 slides del formulario de Registro de Ronda
    _goToRoundSlide: function(n) {
        const box = document.querySelector('.opt-round-modal-box') || document;
        box.querySelectorAll('.opt-slide').forEach(s => {
            s.classList.toggle('opt-slide-active', parseInt(s.dataset.slide, 10) === n);
        });
        box.querySelectorAll('.opt-slide-dot').forEach(d => {
            d.classList.toggle('opt-slide-dot-active', parseInt(d.dataset.slide, 10) === n);
        });
        this._updateRoundSubmitBtn(n);
        const firstField = box.querySelector(`.opt-slide[data-slide="${n}"] .opt-input`);
        if (firstField) firstField.focus();
    },

    _updateRoundSubmitBtn: function(n) {
        const btn = document.querySelector('.opt-round-modal-box .opt-submit-btn');
        if (!btn) return;
        btn.textContent = n < 4 ? '➡️ Siguiente Aspecto' : (this._editingRoundId ? '💾 Guardar Cambios' : '📋 Registrar Duelo');
    },

    _onRoundSubmitClick: function() {
        const box = document.querySelector('.opt-round-modal-box');
        const activeSlide = box?.querySelector('.opt-slide.opt-slide-active');
        const slideNum = activeSlide ? parseInt(activeSlide.dataset.slide, 10) : 4;
        if (slideNum < 4) this._goToRoundSlide(slideNum + 1);
        else this.addOptimizacionRound();
    },

    // Botón lateral fijo: avanza el foco campo por campo y cambia de slide al llegar al final
    _advanceRoundField: function() {
        const box = document.querySelector('.opt-round-modal-box');
        if (!box) return;
        const activeSlide = box.querySelector('.opt-slide.opt-slide-active');
        if (!activeSlide) return;
        const slideNum = parseInt(activeSlide.dataset.slide, 10);
        // Solo campos visibles (respeta filas ocultas por _optToggleTipo, ej. tipo-vic/tipo-der)
        const fields = Array.from(activeSlide.querySelectorAll('.opt-input'))
            .filter(el => el.offsetParent !== null);
        const idx = fields.indexOf(document.activeElement);
        const nextIdx = idx === -1 ? 0 : idx + 1;
        if (nextIdx < fields.length) {
            fields[nextIdx].focus();
            if (fields[nextIdx].tagName === 'INPUT') fields[nextIdx].select();
        } else if (slideNum < 4) {
            this._goToRoundSlide(slideNum + 1);
        } else {
            const submitBtn = box.querySelector('.opt-submit-btn');
            if (submitBtn) submitBtn.focus();
        }
    },

    // Stepper +/- para campos numéricos del formulario de Ronda.
    // Vacío + "+" → 1. Vacío o en el mínimo (min del input, default 0) + "-" → se queda en el mínimo.
    _stepNumber: function(id, delta) {
        const el = document.getElementById(id);
        if (!el) return;
        const min = el.hasAttribute('min') ? parseInt(el.getAttribute('min'), 10) : 0;
        const max = el.hasAttribute('max') ? parseInt(el.getAttribute('max'), 10) : null;
        const raw = el.value;
        let val = parseInt(raw, 10);
        if (raw === '' || isNaN(val)) val = min;
        if (delta > 0) {
            val = (raw === '' || isNaN(parseInt(raw, 10))) ? Math.max(min, 1) : val + 1;
            if (max !== null && val > max) val = max;
        } else {
            val = Math.max(min, val - 1);
        }
        el.value = val;
    },

    // Colapsa/expande el cuerpo completo de una sesión en Historial de Sesiones
    _toggleOptRecord: function(id) {
        const body  = document.getElementById(`opt-sess-body-${id}`);
        const arrow = document.getElementById(`opt-sess-arrow-${id}`);
        if (!body) return;
        const willShow = body.style.display === 'none';
        body.style.display = willShow ? 'block' : 'none';
        if (arrow) arrow.textContent = willShow ? '▾' : '▸';
    },

    // ═══════════════════════════════════════════════════════════════════
    // COMPLEJIDAD DEL DECK — clasificador de dificultad de uso/aprendizaje
    // ═══════════════════════════════════════════════════════════════════
    CXD_PREGUNTAS: [
        { titulo: '1. Flujo del deck', grupo: 'aprender', texto: '¿Cuál describe mejor sus combos?',
          opciones: ['Siempre hago casi las mismas jugadas.', 'Tengo varias rutas dependiendo de la mano.', 'Cada mano cambia completamente mi forma de jugar.'] },
        { titulo: '2. Ejecución', grupo: 'aprender', texto: '¿Cómo son sus combos?',
          opciones: ['Cortos y fáciles de recordar.', 'Necesitan práctica.', 'Muy largos y fáciles de fallar.'] },
        { titulo: '3. Margen de error', grupo: 'aprender', texto: 'Si un novato se equivoca...',
          opciones: ['Puede seguir jugando normalmente.', 'Pierde bastante ventaja.', 'Probablemente perdió el turno.'] },
        { titulo: '4. Lectura', grupo: 'aprender', texto: 'Las cartas del deck...',
          opciones: ['Son fáciles de entender.', 'Algunas requieren releerlas.', 'Muchas necesitan reglas avanzadas.'] },
        { titulo: '5. Recursos', grupo: 'dominar', texto: 'Durante la partida...',
          opciones: ['Solo debo controlar pocos recursos.', 'Debo controlar varios recursos.', 'Debo controlar muchísimos recursos.'] },
        { titulo: '6. Decisiones', grupo: 'dominar', texto: 'Durante un turno...',
          opciones: ['La mayoría de jugadas son evidentes.', 'Hay varias decisiones importantes.', 'Cada decisión cambia la partida.'] },
        { titulo: '7. Conocimiento del rival', grupo: 'dominar', texto: 'Para jugar bien este deck...',
          opciones: ['No necesito conocer mucho el meta.', 'Conviene conocer el meta.', 'Debo conocer muy bien casi todos los enfrentamientos.'] },
        { titulo: '8. Adaptación', grupo: 'dominar', texto: 'Cuando el rival interrumpe...',
          opciones: ['El deck sigue funcionando.', 'Debo cambiar parte del plan.', 'Casi siempre debo improvisar completamente.'] }
    ],

    getComplejidad: function (deckName) {
        try { return JSON.parse(localStorage.getItem(`complejidad_${deckName || this.name}`)); }
        catch (e) { return null; }
    },

    _complejidadNivel: function (total) {
        if (total <= 11) return { titulo: '🟢 Ideal para empezar', color: '#81C784',
            texto: 'Este deck es una excelente opción para jugadores nuevos. Su curva de aprendizaje es amable y permite comprender los fundamentos del juego sin sentirse abrumado.' };
        if (total <= 15) return { titulo: '🟢 Principiante', color: '#81C784',
            texto: 'El deck requiere aprender algunos conceptos y practicar ciertas secuencias, pero sigue siendo apropiado para jugadores con poca experiencia.' };
        if (total <= 18) return { titulo: '🟡 Intermedio', color: '#FFD54F',
            texto: 'Es recomendable para jugadores que ya dominan las reglas básicas y desean comenzar a enfrentarse a decisiones y situaciones más complejas.' };
        if (total <= 21) return { titulo: '🟠 Avanzado', color: '#FFB74D',
            texto: 'Este deck exige una buena comprensión de las reglas, experiencia práctica y capacidad para adaptarse durante la partida.' };
        return { titulo: '🔴 Experto', color: '#E57373',
            texto: 'Pensado para jugadores con mucha experiencia. Aprenderlo y jugarlo realmente bien requiere dominar numerosas interacciones, decisiones y enfrentamientos.' };
    },

    _complejidadTextoAprender: function (aprender) {
        if (aprender <= 5) return '📖 Curva de aprendizaje: Baja. En pocas partidas un jugador nuevo debería comprender su funcionamiento básico.';
        if (aprender <= 8) return '📖 Curva de aprendizaje: Media. Requiere practicar varias líneas de juego antes de sentirse cómodo.';
        return '📖 Curva de aprendizaje: Alta. Un jugador nuevo necesitará bastante estudio y práctica antes de jugarlo con confianza.';
    },

    _complejidadTextoDominar: function (dominar) {
        if (dominar <= 5) return '🎯 Techo de habilidad: Bajo. Una vez aprendido, dominarlo no resulta especialmente complicado.';
        if (dominar <= 8) return '🎯 Techo de habilidad: Medio. Siempre habrá espacio para mejorar la toma de decisiones y optimizar el rendimiento.';
        return '🎯 Techo de habilidad: Alto. Incluso jugadores experimentados seguirán encontrando formas de optimizar su juego con este deck.';
    },

    _renderComplejidadSummary: function () {
        const data = this.getComplejidad();
        if (!data) return `<p class="cxd-empty-hint">Aún no evaluado. Complétalo para ver su clasificación aquí y en Decklist.</p>`;
        const nivel = this._complejidadNivel(data.total);
        return `<div class="cxd-summary-line">
            <span class="cxd-summary-badge">${nivel.titulo}</span>
            <span>Aprender ${data.aprender}/12 · Dominar ${data.dominar}/12 · Total ${data.total}/24</span>
            <span class="cxd-summary-date">${new Date(data.evaluatedAt).toLocaleDateString('es-ES')}</span>
        </div>`;
    },

    _renderComplejidadForm: function () {
        const prev    = this.getComplejidad();
        const prevAns = prev?.answers || [];
        const qs = this.CXD_PREGUNTAS.map((p, i) => `
            <div class="cxd-pregunta">
                <h4>${p.titulo}</h4>
                <p>${p.texto}</p>
                ${p.opciones.map((o, j) => `
                    <label class="cxd-opcion">
                        <input type="radio" name="cxd-p${i}" value="${j + 1}" ${(prevAns[i] ? prevAns[i] === j + 1 : j === 0) ? 'checked' : ''}>
                        ${o}
                    </label>`).join('')}
            </div>`).join('');
        return `${qs}<button class="opt-submit-btn cxd-submit-btn" onclick="Deck.calcularComplejidad()">Clasificar Deck</button>`;
    },

    toggleComplejidadForm: function () {
        const wrap = document.getElementById('cxd-form-wrap');
        const btn  = document.getElementById('cxd-toggle-btn');
        if (!wrap) return;
        const opening = wrap.style.display === 'none';
        wrap.style.display = opening ? 'block' : 'none';
        if (btn) btn.textContent = opening ? '✖ Cancelar evaluación' : '🧩 Evaluar Complejidad del Deck';
    },

    calcularComplejidad: function () {
        let aprender = 0, dominar = 0;
        const answers = [];
        this.CXD_PREGUNTAS.forEach((p, i) => {
            const el  = document.querySelector(`input[name="cxd-p${i}"]:checked`);
            const val = el ? Number(el.value) : 1;
            answers.push(val);
            if (p.grupo === 'aprender') aprender += val; else dominar += val;
        });
        const total = aprender + dominar;
        localStorage.setItem(`complejidad_${this.name}`, JSON.stringify({
            answers, aprender, dominar, total, evaluatedAt: new Date().getTime()
        }));
        this.regenerateUid();

        const sum = document.getElementById('cxd-summary');
        if (sum) sum.innerHTML = this._renderComplejidadSummary();
        this.toggleComplejidadForm();

        const box = document.getElementById('construccion-complejidad-box');
        if (box) box.innerHTML = this.renderComplejidadResultCard();
    },

    renderComplejidadResultCard: function () {
        const data = this.getComplejidad();
        if (!data) {
            return `<div class="cxd-result-empty">
                <p>🧩 Este deck no ha sido evaluado en su nivel de dificultad de uso y aprendizaje.</p>
                <p>Si deseas establecer esta información, pasa a <strong>Optimización</strong> y genera una <strong>Clasificación de Dificultad</strong>.</p>
            </div>`;
        }
        const nivel = this._complejidadNivel(data.total);
        return `<div class="cxd-result-card">
            <div class="cxd-result-hdr">
                <span class="cxd-result-title">${nivel.titulo}</span>
                <span class="cxd-result-date">Evaluado el ${new Date(data.evaluatedAt).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="cxd-bar-row">
                <label>📖 Curva de aprendizaje</label>
                <div class="cxd-bar-track"><div class="cxd-bar-fill" style="width:${data.aprender / 12 * 100}%;background:#64B5F6"></div></div>
                <span class="cxd-bar-val">${data.aprender}/12</span>
            </div>
            <p class="cxd-bar-desc">${this._complejidadTextoAprender(data.aprender)}</p>
            <div class="cxd-bar-row">
                <label>🎯 Techo de habilidad</label>
                <div class="cxd-bar-track"><div class="cxd-bar-fill" style="width:${data.dominar / 12 * 100}%;background:#FFD54F"></div></div>
                <span class="cxd-bar-val">${data.dominar}/12</span>
            </div>
            <p class="cxd-bar-desc">${this._complejidadTextoDominar(data.dominar)}</p>
            <div class="cxd-bar-row">
                <label>Dificultad General</label>
                <div class="cxd-bar-track"><div class="cxd-bar-fill" style="width:${data.total / 24 * 100}%;background:${nivel.color}"></div></div>
                <span class="cxd-bar-val">${data.total}/24</span>
            </div>
            <p class="cxd-result-text">${nivel.texto}</p>
        </div>`;
    },
// ═══════════════════════════════════════════════════════════════════
    // TU EXPERIENCIA CON EL DECK — perfil cualitativo por deck (Etapa 1)
    // ═══════════════════════════════════════════════════════════════════
    EXP_ESTRELLAS_LABELS: ['Sin Estrategia', 'Fácil', 'Intermedio', 'Competitivo', 'Especializado'],
    EXP_ESTRATEGIAS: ['Beatdown', 'Stun / Lock', 'Control', 'Combo', 'Midrange', 'Toolbox', 'Burn', 'OTK', 'FTK', 'Grind Game', 'Aggro'],
    EXP_VARIANTES_SUGERIDAS: ['Puro', 'Híbrido', 'Splash', 'Engine Secundario', 'Turbo', 'FTK', 'OTK'],

    getExperiencia: function (deckName) {
        try { return JSON.parse(localStorage.getItem(`experiencia_${deckName || this.name}`)) || {}; }
        catch (e) { return {}; }
    },

    _saveExperiencia: function (partial) {
        const data = this.getExperiencia();
        Object.assign(data, partial, { updatedAt: Date.now() });
        localStorage.setItem(`experiencia_${this.name}`, JSON.stringify(data));
        return data;
    },

    renderExperienciaSection: function () {
        return `
        <div data-section-id="deck-experiencia">
        <h3 class="deck-section-title" onclick="Deck.toggleSection('experiencia-sec')">🧭 Tu Experiencia con el Deck</h3>
        <div id="experiencia-sec" class="deck-section-content" style="display:none;">
            <div class="exp-subtabs-nav">
                <button class="exp-subtab-btn active" data-exp-tab="perfil" onclick="Deck.switchExperienciaTab('perfil')">🎚️ Perfil</button>
                <button class="exp-subtab-btn" data-exp-tab="manos" onclick="Deck.switchExperienciaTab('manos')">🧱 Manos Muertas</button>
                <button class="exp-subtab-btn" data-exp-tab="composicion" onclick="Deck.switchExperienciaTab('composicion')">🧬 Composición</button>
                <button class="exp-subtab-btn" data-exp-tab="cartas" onclick="Deck.switchExperienciaTab('cartas')">🃏 Cartas Destacadas</button>
                <button class="exp-subtab-btn" data-exp-tab="sets" onclick="Deck.switchExperienciaTab('sets')">📦 Sets</button>
                <button class="exp-subtab-btn" data-exp-tab="rendimiento" onclick="Deck.switchExperienciaTab('rendimiento')">📡 Rendimiento</button>
            </div>
            <div id="exp-pane-perfil">${this.renderExpPerfil()}</div>
            <div id="exp-pane-manos" style="display:none;">${this.renderExpManosMuertas()}</div>
            <div id="exp-pane-composicion" style="display:none;">${this.renderExpComposicion()}</div>
            <div id="exp-pane-cartas" style="display:none;">${this.renderExpCartas()}</div>
            <div id="exp-pane-sets" style="display:none;">${this.renderExpSets()}</div>
            <div id="exp-pane-rendimiento" style="display:none;">${this.renderExpRendimiento()}</div>
        </div>
        </div>`;
    },

    switchExperienciaTab: function (tab) {
        ['perfil', 'manos', 'composicion', 'cartas', 'sets', 'rendimiento'].forEach(t => {
            const p = document.getElementById(`exp-pane-${t}`);
            if (p) p.style.display = (t === tab) ? '' : 'none';
        });
        document.querySelectorAll('.exp-subtab-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.expTab === tab));
    },

    

    // ── Perfil: Dificultad, Estrategia, Variante, Non-Engine Slots ──
    renderExpPerfil: function () {
        const d = this.getExperiencia();
        const stars = [1, 2, 3, 4, 5].map(n =>
            `<span class="exp-star ${d.dificultad >= n ? 'exp-star-on' : ''}" onclick="Deck.setExpDificultad(${n})">★</span>`
        ).join('');
        const nivelLabel = d.dificultad ? this.EXP_ESTRELLAS_LABELS[d.dificultad - 1] : 'Sin evaluar';
        const estOpts = this.EXP_ESTRATEGIAS.map(e =>
            `<option value="${e}" ${d.estrategia === e ? 'selected' : ''}>${e}</option>`).join('');
        return `
        <div class="exp-field-block">
            <label class="exp-field-label">⭐ Dificultad de Juego</label>
            <div class="exp-stars-row">${stars}<span class="exp-stars-label">${nivelLabel}</span></div>
        </div>
        <div class="exp-field-block">
            <label class="exp-field-label">🎯 Tipo de Estrategia</label>
            <select class="exp-select" onchange="Deck.setExpEstrategia(this.value)">
                <option value="">— sin definir —</option>
                ${estOpts}
            </select>
        </div>
        <div class="exp-field-block">
            <label class="exp-field-label">🧪 Variante</label>
            <input type="text" class="exp-text-input" list="exp-variantes-list"
                   value="${(d.variante || '').replace(/"/g, '&quot;')}"
                   placeholder="Ej: Puro, Híbrido, FTK..." onchange="Deck.setExpVariante(this.value)">
            <datalist id="exp-variantes-list">${this.EXP_VARIANTES_SUGERIDAS.map(v => `<option value="${v}">`).join('')}</datalist>
        </div>
        <div class="exp-field-block">
            <label class="exp-field-label">🔧 Non-Engine Slots</label>
            <input type="number" class="exp-num-input" min="0" max="20" value="${d.nonEngineSlots || 0}"
                   onchange="Deck.setExpNonEngine(this.value)">
            <p class="exp-field-hint">Cartas que no forman parte del plan de juego principal (tech, flex, situacionales en Main).</p>
        </div>`;
    },

    setExpDificultad: function (n) {
        const d = this.getExperiencia();
        this._saveExperiencia({ dificultad: (d.dificultad === n ? 0 : n) });
        const pane = document.getElementById('exp-pane-perfil');
        if (pane) pane.innerHTML = this.renderExpPerfil();
    },
    setExpEstrategia: function (v) { this._saveExperiencia({ estrategia: v }); },
    setExpVariante:   function (v) { this._saveExperiencia({ variante: v.trim() }); },
    setExpNonEngine:  function (v) { this._saveExperiencia({ nonEngineSlots: Math.max(0, parseInt(v) || 0) }); },

// ── Cartas Destacadas: selección desde las cartas propias del Main Deck ──
    EXP_CARD_CATS: {
        mainBeaters:   { label: '⚔️ Main Beaters',       max: 3, hint: 'Hasta 3 cartas que cierran el duelo por daño de batalla.' },
        mainDefenders: { label: '🛡️ Main Defenders',     max: 3, hint: 'Hasta 3 cartas que sostienen el campo y frenan al rival.' },
        keyCards:      { label: '🗝️ Key Cards',           max: 5, hint: 'Hasta 5 cartas que te encantaría ver en tu mano inicial.' },
        mainStarters:  { label: '🚀 Main Starters',       max: 3, hint: 'Hasta 3 cartas que arrancan tu combo o plan de juego.' },
        bestCard:      { label: '👑 Best Card',           max: 1, hint: 'La carta MVP del deck — solo 1.' },
        menosUsadas:   { label: '📉 Cartas Menos Usadas', max: 3, hint: 'Hasta 3 cartas que rara vez terminan siendo relevantes.' }
    },

    _getExpCardList: function (cat) {
        const d = this.getExperiencia();
        if (cat === 'bestCard') return d.bestCard ? [d.bestCard] : [];
        return Array.isArray(d[cat]) ? d[cat] : [];
    },

    toggleExpCard: function (cat, id, name, img) {
        const meta = this.EXP_CARD_CATS[cat];
        const d = this.getExperiencia();

        if (cat === 'bestCard') {
            const current = d.bestCard;
            this._saveExperiencia({ bestCard: (current && current.id === id) ? null : { id, name, img } });
        } else {
            let list = Array.isArray(d[cat]) ? [...d[cat]] : [];
            const idx = list.findIndex(c => c.id === id);
            if (idx >= 0) {
                list.splice(idx, 1);
            } else {
                if (list.length >= meta.max) { alert(`Máximo ${meta.max} cartas para ${meta.label}.`); return; }
                list.push({ id, name, img });
            }
            this._saveExperiencia({ [cat]: list });
        }
        this._refreshExpCardCat(cat);
    },

    _refreshExpCardCat: function (cat) {
        const wrap = document.getElementById(`exp-cat-${cat}`);
        if (!wrap) return;
        const gridEl = document.getElementById(`exp-grid-${cat}`);
        const wasOpen = gridEl && gridEl.style.display !== 'none';
        wrap.innerHTML = this._renderExpCardCatBlock(cat);
        if (wasOpen) {
            const newGrid = document.getElementById(`exp-grid-${cat}`);
            if (newGrid) newGrid.style.display = '';
        }
    },

    toggleExpCardGrid: function (cat) {
        const el = document.getElementById(`exp-grid-${cat}`);
        if (el) el.style.display = (el.style.display === 'none') ? '' : 'none';
    },

    _renderExpCardCatBlock: function (cat) {
        const esc = s => (s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const meta = this.EXP_CARD_CATS[cat];
        const selectedIds = this._getExpCardList(cat).map(c => c.id);

        const mainCards = Object.entries(this.cards)
            .filter(([, item]) => item.location === 'main')
            .sort((a, b) => this.compareCards(a, b, 'main'))
            .map(([id, item]) => ({
                id, name: item.data.name,
                img: item.data.card_images?.[0]?.image_url_small || ''
            }));

        const extraCards = Object.entries(this.cards)
            .filter(([, item]) => item.location === 'extra')
            .sort((a, b) => this.compareCards(a, b, 'extra'))
            .map(([id, item]) => ({
                id, name: item.data.name,
                img: item.data.card_images?.[0]?.image_url_small || ''
            }));

        const thumb = c => `
            <img src="${c.img}" alt="${esc(c.name)}" title="${esc(c.name)}"
                 class="opt-key-card-thumb ${selectedIds.includes(c.id) ? 'opt-key-card-thumb-selected' : ''}"
                 onclick="Deck.toggleExpCard('${cat}','${c.id}','${esc(c.name)}','${c.img}')">`;

        const grid = (mainCards.length || extraCards.length) ? `
            ${mainCards.length ? `
                <p class="opt-key-group-label">Main Deck</p>
                <div class="opt-key-card-grid">${mainCards.map(thumb).join('')}</div>` : ''}
            ${extraCards.length ? `
                <p class="opt-key-group-label">Extra Deck</p>
                <div class="opt-key-card-grid">${extraCards.map(thumb).join('')}</div>` : ''}
        ` : `<p class="opt-key-empty">Este deck no tiene cartas en Main ni en Extra.</p>`;

        const selected = this._getExpCardList(cat);
        const chips = selected.length ? `
            <div class="opt-key-selected-row">
                ${selected.map(c => `
                    <div class="opt-key-chip">
                        <img src="${c.img}" alt="${c.name}">
                        <span>${c.name}</span>
                        <button type="button" class="opt-key-chip-remove" onclick="Deck.toggleExpCard('${cat}','${c.id}')" title="Quitar">✕</button>
                    </div>
                `).join('')}
            </div>` : `<p class="opt-key-empty">Ninguna seleccionada.</p>`;

        return `
            <div class="opt-group-hdr opt-full">${meta.label} <span class="opt-key-counter">(${selected.length}/${meta.max})</span></div>
            <p class="opt-key-hint">${meta.hint}</p>
            ${chips}
            <button type="button" class="deck-move opt-key-search-btn" onclick="Deck.toggleExpCardGrid('${cat}')">🃏 Elegir de mis cartas</button>
            <div id="exp-grid-${cat}" style="display:none;">${grid}</div>
        `;
    },

    renderExpCartas: function () {
        return Object.keys(this.EXP_CARD_CATS).map(cat =>
            `<div class="exp-field-block" id="exp-cat-${cat}">${this._renderExpCardCatBlock(cat)}</div>`
        ).join('');
    },

    // ── Productos / Sets involucrados (derivado de card_sets ya presente en cada carta) ──
    renderExpSets: function () {
        const mainExtra = Object.entries(this.cards).filter(([, c]) => c.location === 'main' || c.location === 'extra');
        const setMap = {};
        mainExtra.forEach(([id, item]) => {
            const sets = item.data.card_sets || [];
            const seen = new Set();
            sets.forEach(s => {
                const setName = s.set_name;
                if (!setName || seen.has(setName)) return;
                seen.add(setName);
                if (!setMap[setName]) setMap[setName] = [];
                setMap[setName].push({ id, name: item.data.name, img: item.data.card_images?.[0]?.image_url_small || '' });
            });
        });

        const setNames = Object.keys(setMap).sort((a, b) => setMap[b].length - setMap[a].length || a.localeCompare(b));
        if (!setNames.length) {
            return `<p class="exp-empty">No se detectaron Packs/Sets en las cartas de este deck. Se rellenan automáticamente al importar por .ydk o agregar desde el Buscador.</p>`;
        }

        const d = this.getExperiencia();
        const selected = new Set(d.sets || []);

        const rows = setNames.map(setName => {
            const cardsInSet = setMap[setName];
            const isOn = selected.has(setName);
            return `
            <label class="exp-set-row ${isOn ? 'exp-set-row-on' : ''}">
                <input type="checkbox" ${isOn ? 'checked' : ''} onchange="Deck.toggleExpSet('${setName.replace(/'/g, "\\'")}')">
                <span class="exp-set-name">${setName}</span>
                <span class="exp-set-count">(${cardsInSet.length} carta${cardsInSet.length > 1 ? 's' : ''})</span>
                <span class="exp-set-thumbs">
                    ${cardsInSet.slice(0, 6).map(c => `<img src="${c.img}" alt="${c.name}" title="${c.name}">`).join('')}
                    ${cardsInSet.length > 6 ? `<span class="exp-set-more">+${cardsInSet.length - 6}</span>` : ''}
                </span>
            </label>`;
        }).join('');

        return `
        <p class="exp-field-hint" style="margin-bottom:8px;">Marca los Packs/Sets en los que consideras que tu deck realmente está "involucrado" (donde salieron sus piezas clave).</p>
        <div class="exp-sets-list">${rows}</div>`;
    },

    toggleExpSet: function (setName) {
        const d = this.getExperiencia();
        let sets = Array.isArray(d.sets) ? [...d.sets] : [];
        const idx = sets.indexOf(setName);
        if (idx >= 0) sets.splice(idx, 1); else sets.push(setName);
        this._saveExperiencia({ sets });
        const pane = document.getElementById('exp-pane-sets');
        if (pane) pane.innerHTML = this.renderExpSets();
    },

    // ── Manos Muertas (Brickeo manual, X/Y) ──
    renderExpManosMuertas: function () {
        const d = this.getExperiencia();
        const x = d.manosMuertasX || 0, y = d.manosMuertasY || 0;
        const pct = y > 0 ? ((x / y) * 100).toFixed(1) : '—';
        return `
        <div class="exp-field-block">
            <label class="exp-field-label">🧱 Manos Muertas (Brickeo)</label>
            <div class="exp-mm-row">
                <div class="exp-mm-field">
                    <label class="exp-mm-sublabel">¿Cuántos duelos de prueba realizaste?</label>
                    <input type="number" class="exp-num-input" min="0" id="exp-mm-y" value="${y}"
                           placeholder="Total de duelos"
                           oninput="document.getElementById('exp-mm-x').max=this.value">
                </div>
                <div class="exp-mm-field">
                    <label class="exp-mm-sublabel">¿Cuántas de esas manos fueron injugables?</label>
                    <input type="number" class="exp-num-input" min="0" max="${y}" id="exp-mm-x" value="${x}"
                           placeholder="Manos injugables">
                </div>
                <button class="deck-move" onclick="Deck.saveExpManosMuertas()">Guardar</button>
            </div>
            <p class="exp-field-hint">Las manos injugables nunca pueden superar el total de duelos jugados.</p>
            <p class="exp-mm-result">Tasa de brickeo manual: <strong>${pct}${pct !== '—' ? '%' : ''}</strong></p>
        </div>`;
    },

    saveExpManosMuertas: function () {
        const x = Math.max(0, parseInt(document.getElementById('exp-mm-x').value) || 0);
        const y = Math.max(0, parseInt(document.getElementById('exp-mm-y').value) || 0);
        if (x > y) { alert('Las manos injugables no pueden ser más que el total de duelos de prueba realizados.'); return; }
        this._saveExperiencia({ manosMuertasX: x, manosMuertasY: y });
        const pane = document.getElementById('exp-pane-manos');
        if (pane) pane.innerHTML = this.renderExpManosMuertas();
    },

    // ── Composición: Atributos y Tipos principales (auto, desde Main) ──
    renderExpComposicion: function () {
        const mainCards = Object.values(this.cards).filter(c => c.location === 'main');
        const attrCounts = {}, raceCounts = {};
        mainCards.forEach(item => {
            const t = (item.data.type || '').toLowerCase();
            if (t.includes('spell') || t.includes('trap')) return;
            const qty = item.qty || 1;
            if (item.data.attribute) attrCounts[item.data.attribute] = (attrCounts[item.data.attribute] || 0) + qty;
            if (item.data.race) raceCounts[item.data.race] = (raceCounts[item.data.race] || 0) + qty;
        });
        const top = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
        const attrTop = top(attrCounts, 3);
        const raceTop = top(raceCounts, 3);
        const chip = (label, qty) => `<span class="exp-chip">${label} <strong>${qty}</strong></span>`;
        return `
        <div class="exp-field-block">
            <label class="exp-field-label">🌈 Atributos Principales</label>
            <div class="exp-chips-row">${attrTop.length ? attrTop.map(([a, q]) => chip(a, q)).join('') : '<span class="exp-empty">Sin monstruos en Main.</span>'}</div>
        </div>
        <div class="exp-field-block">
            <label class="exp-field-label">🧬 Tipos Principales</label>
            <div class="exp-chips-row">${raceTop.length ? raceTop.map(([r, q]) => chip(r, q)).join('') : '<span class="exp-empty">Sin monstruos en Main.</span>'}</div>
        </div>
        <p class="exp-field-hint">Calculado automáticamente desde las cartas del Main Deck — se actualiza solo.</p>`;
    },

    // ── Rendimiento: gráfico de araña de 6 ejes + Winrate ──
    // Consistencia/Ceiling/Follow Up/Fragilidad: derivados del combo más
    // fuerte registrado en Línea de Combos. Resiliencia: agregado de TODAS
    // las rondas de Optimización. Eficiencia: Non-Engine Slots (Perfil) vs.
    // tamaño del Main.
    EXP_RADAR_POWER_REF: 25, // referencia de "poder de combo tope" para normalizar Ceiling/Follow Up a 0-10

    _getTopCombo: function () {
        if (!window.Combos) return null;
        const combos = Combos.getAll(this.name);
        if (!combos.length) return null;
        return combos.reduce((best, c) => (c.power || 0) > (best.power || 0) ? c : best, combos[0]);
    },

    _getResilienciaFromOptimizacion: function () {
        const data = this.getOptimizacion();
        const rounds = (data.sessions || []).reduce((all, s) => all.concat(s.rounds || []), []);
        const presion = rounds.filter(r =>
            (r.rivalInterrupciones || 0) >= 1 || r.rivalRompio || (r.vecesRivalRompioBoard || 0) >= 1);
        if (!presion.length) return null;
        const wins = presion.filter(r => r.resultado === 'victoria').length;
        return { pct: Math.round((wins / presion.length) * 100), n: presion.length };
    },

    _getRendimientoAxes: function () {
        const topCombo = this._getTopCombo();
        const d = this.getExperiencia();
        const clamp = v => Math.max(0, Math.min(10, v));

        // Consistencia (Starter + Extender del combo más fuerte)
        let consist = null;
        if (topCombo && window.Combos) {
            const s = Combos._starterConsistency(topCombo);
            const e = Combos._extenderConsistency(topCombo);
            if (s && e != null) consist = Math.round(((s.probCurrent + e) / 2) * 10) / 10;
            else if (s) consist = s.probCurrent;
        }

        // Ceiling / Follow Up / Fragilidad (combo más fuerte)
        const ceiling  = topCombo ? topCombo.power : null;
        const followUp = topCombo ? (topCombo.powerBeforeMeta ?? topCombo.power) : null;
        let fragilidad = null;
        if (topCombo && topCombo.powerBeforeMeta) {
            fragilidad = Math.round((1 - (topCombo.power / topCombo.powerBeforeMeta)) * 1000) / 10;
        } else if (topCombo) {
            fragilidad = 0;
        }

        // Resiliencia (Optimización, todas las sesiones)
        const resil = this._getResilienciaFromOptimizacion();

        // Eficiencia (Non-Engine Slots vs Main)
        const mainTotal = Object.values(this.cards).filter(c => c.location === 'main')
            .reduce((sum, c) => sum + (c.qty || 0), 0);
        const nonEngine = d.nonEngineSlots || 0;
        const eficiencia = mainTotal > 0 ? Math.round((1 - Math.min(1, nonEngine / mainTotal)) * 1000) / 10 : null;

        const pow = v => v == null ? 0 : clamp((v / this.EXP_RADAR_POWER_REF) * 10);
        const pct = v => v == null ? 0 : clamp(v / 10);

        return [
            { key: 'consistencia', label: 'Consistencia', raw: consist,  unit: '%', norm: pct(consist),
              desc: 'Prob. de abrir Starter + Extender del combo más fuerte (Línea de Combos).', has: consist != null },
            { key: 'ceiling', label: 'Ceiling', raw: ceiling, unit: 'pts', norm: pow(ceiling),
              desc: 'Poder final (post Choke Points) del combo más fuerte.', has: ceiling != null },
            { key: 'resiliencia', label: 'Resiliencia', raw: resil ? resil.pct : null, unit: '%', norm: pct(resil ? resil.pct : null),
              desc: 'Winrate en rondas de Optimización con interrupción o rotura de campo del rival.', has: !!resil },
            { key: 'followup', label: 'Follow Up', raw: followUp, unit: 'pts', norm: pow(followUp),
              desc: 'Poder bruto del combo más fuerte antes de descontar sus Choke Points (grind game).', has: followUp != null },
            { key: 'fragilidad', label: 'Fragilidad', raw: fragilidad, unit: '%', norm: pct(fragilidad),
              desc: '% de poder perdido por Choke Points del combo más fuerte (más alto = más frágil).', has: fragilidad != null },
            { key: 'eficiencia', label: 'Eficiencia', raw: eficiencia, unit: '%', norm: pct(eficiencia),
              desc: 'Proporción del Main que SÍ es Engine (100% − Non-Engine Slots de Perfil).', has: eficiencia != null }
        ];
    },

    renderExpRendimiento: function () {
        const axes = this._getRendimientoAxes();
        const g = window.Duelista ? Duelista.getDeckStats(this.name) : null;
        const anyData = axes.some(a => a.has);

        let radarHtml = '<p class="exp-empty">Sin datos suficientes — registra al menos un combo en 🧬 Línea de Combos y rondas en 🎯 Optimización.</p>';
        if (anyData) {
            const cx = 160, cy = 160, R = 85, labelR = R + 32, valR = R + 12;
            const angleFor = i => (Math.PI * 2 * i / axes.length) - Math.PI / 2;
            const pt = (i, r) => { const a = angleFor(i); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
            const gridPolys = [0.25, 0.5, 0.75, 1].map(lv => axes.map((_, i) => pt(i, R * lv).join(',')).join(' '));
            const dataPoly = axes.map((a, i) => pt(i, R * (a.norm / 10)).join(',')).join(' ');
            const axisLines = axes.map((a, i) => {
                const [x, y] = pt(i, R);
                return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="exp-radar-axis"/>`;
            }).join('');
            const labels = axes.map((a, i) => {
                const [x, y] = pt(i, labelR);
                const angle = angleFor(i), cos = Math.cos(angle);
                const anchor = cos > 0.35 ? 'start' : (cos < -0.35 ? 'end' : 'middle');
                return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" class="exp-radar-label">${a.label}</text>`;
            }).join('');
            const valLabels = axes.map((a, i) => {
                const [x, y] = pt(i, R * (a.norm / 10) + (a.norm > 0 ? 10 : valR * 0));
                return a.has
                    ? `<text x="${x}" y="${y}" text-anchor="middle" class="exp-radar-val">${a.raw}${a.unit === '%' ? '%' : ''}</text>`
                    : '';
            }).join('');

            radarHtml = `
            <svg viewBox="0 0 320 320" class="exp-radar-svg">
                ${gridPolys.map(p => `<polygon points="${p}" class="exp-radar-grid"/>`).join('')}
                ${axisLines}
                <polygon points="${dataPoly}" class="exp-radar-data"/>
                ${labels}
                ${valLabels}
            </svg>
            <div class="exp-radar-legend">
                ${axes.map(a => `
                    <div class="exp-radar-legend-item ${a.has ? '' : 'exp-radar-legend-missing'}">
                        <strong>${a.label}${a.has ? `: ${a.raw}${a.unit === '%' ? '%' : ' pts'}` : ': sin datos'}</strong>
                        <span>${a.desc}</span>
                    </div>
                `).join('')}
            </div>
            <p class="exp-field-hint exp-radar-note">
                📐 Cada eje se muestra normalizado a una escala de 0 a 10 para poder compararlos en el mismo gráfico
                (el valor real de cada uno está en la leyenda arriba). Ceiling/Follow Up usan como referencia de escala
                un poder de combo de ${this.EXP_RADAR_POWER_REF} pts = 10/10; ajústalo en <code>Deck.EXP_RADAR_POWER_REF</code>
                si tus combos suelen superar ese poder. Consistencia/Ceiling/Follow Up/Fragilidad toman el combo con
                mayor Poder registrado en 🧬 Línea de Combos; Resiliencia se calcula sobre todas las rondas de
                🎯 Optimización; Eficiencia usa los Non-Engine Slots definidos en 🎚️ Perfil.
            </p>`;
        }

        const wrHtml = (g && g.totalDuels > 0) ? `
            <div class="exp-wr-row">
                <div class="exp-wr-cell"><div class="exp-wr-val">${g.wrAll}%</div><div class="exp-wr-tag">General</div></div>
                <div class="exp-wr-cell"><div class="exp-wr-val">${g.wr1st !== null ? g.wr1st + '%' : '—'}</div><div class="exp-wr-tag">1º</div></div>
                <div class="exp-wr-cell"><div class="exp-wr-val">${g.wr2nd !== null ? g.wr2nd + '%' : '—'}</div><div class="exp-wr-tag">2º</div></div>
            </div>
            <p class="exp-field-hint">Tomado de Optimización → Historial de Sesiones (${g.totalDuels} rondas).</p>`
            : `<p class="exp-empty">Sin rondas registradas aún en Optimización.</p>`;

        return `
        <div class="exp-field-block">
            <label class="exp-field-label">📡 Perfil de Rendimiento</label>
            ${radarHtml}
        </div>
        <div class="exp-field-block">
            <label class="exp-field-label">🏆 Winrate del Deck</label>
            ${wrHtml}
        </div>`;
    },
    // ═══════════════════════════════════════════════════════════════════
    // MODAL FLOTANTE — Nueva Ronda de Duelo (reemplaza el desplegable)
    // ═══════════════════════════════════════════════════════════════════
    _renderRoundFormFields: function() {
        return `
            <datalist id="opt-matchup-suggestions">
                ${(window.Matchups ? Matchups.getAll() : []).map(m =>
                    `<option value="${(m.opponentName || '').replace(/"/g,'&quot;')}">`).join('')}
            </datalist>
            <div class="opt-slide-dots">
                <button type="button" class="opt-slide-dot opt-slide-dot-active" data-slide="1" onclick="Deck._goToRoundSlide(1)">1. Going</button>
                <button type="button" class="opt-slide-dot" data-slide="2" onclick="Deck._goToRoundSlide(2)">2. Enfrentamiento</button>
                <button type="button" class="opt-slide-dot" data-slide="3" onclick="Deck._goToRoundSlide(3)">3. Oponente</button>
                <button type="button" class="opt-slide-dot" data-slide="4" onclick="Deck._goToRoundSlide(4)">4. Cartas Clave</button>
            </div>

            <div class="opt-round-fields-row">
            <div class="opt-slides-wrap">

            <div class="opt-slide opt-slide-active" data-slide="1">
            <div class="opt-form-grid">

                <div class="opt-form-row opt-full">
                    <label class="opt-lbl">¿Orden?</label>
                    <select id="opt-r-orden" class="opt-input">
                        <option value="">— seleccionar —</option>
                        <option value="primero">🥇 Voy Primero</option>
                        <option value="segundo">🥈 Voy Segundo</option>
                    </select>
                </div>

                <div class="opt-group-hdr opt-full">🃏 Registrar Robo (Mano Inicial)</div>

                <div class="opt-mano-inicial-grid">

                <div class="opt-form-row">
                    <label class="opt-lbl">Starters en mano</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-starter',-1)">−</button>
                        <input type="number" id="opt-r-starter" class="opt-input opt-stepper-input" min="0" max="6" value="0" inputmode="numeric">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-starter',1)">+</button>
                    </div>
                </div>

                <div class="opt-form-row">
                    <label class="opt-lbl">Extenders en mano</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-extenders',-1)">−</button>
                        <input type="number" id="opt-r-extenders" class="opt-input opt-stepper-input" min="0" max="6" value="0" inputmode="numeric">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-extenders',1)">+</button>
                    </div>
                </div>

                <div class="opt-form-row">
                    <label class="opt-lbl">Handtraps en mano</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-handtraps',-1)">−</button>
                        <input type="number" id="opt-r-handtraps" class="opt-input opt-stepper-input" min="0" max="6" value="0" inputmode="numeric">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-handtraps',1)">+</button>
                    </div>
                </div>

                <div class="opt-form-row">
                    <label class="opt-lbl">Boardbreaker en mano</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-boardbreaker',-1)">−</button>
                        <input type="number" id="opt-r-boardbreaker" class="opt-input opt-stepper-input" min="0" max="6" value="0" inputmode="numeric">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-boardbreaker',1)">+</button>
                    </div>
                </div>

                <div class="opt-form-row">
                    <label class="opt-lbl">Bricks/Tech en mano</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-bricks',-1)">−</button>
                        <input type="number" id="opt-r-bricks" class="opt-input opt-stepper-input" min="0" max="6" value="0" inputmode="numeric">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-bricks',1)">+</button>
                    </div>
                </div>

                </div>

            </div>
            </div>

            <div class="opt-slide" data-slide="3">
            <div class="opt-form-grid">

                <div class="opt-group-hdr opt-full">🎯 Registrar Oponente</div>

                <div class="opt-form-row opt-full">
                    <label class="opt-lbl">Deck del oponente</label>
                    <input type="text" id="opt-r-oppname" class="opt-input" list="opt-matchup-suggestions"
                           placeholder="Ej: Dragon Link, Snake-Eye Fire King..." maxlength="60">
                </div>
                <div class="opt-form-row opt-full">
                    <label class="opt-lbl">Deck rival (.ydk, opcional)</label>
                    <div class="opt-oppdeck-row">
                        <button type="button" class="opt-ydk-btn" onclick="Deck._importOppYDK()">📂 Importar .ydk</button>
                        <span id="opt-oppdeck-status" class="opt-oppdeck-status"></span>
                    </div>
                </div>
                <div class="opt-form-row opt-full">
                    <label class="opt-lbl">Notas del deck rival (opcional)</label>
                    <input type="text" id="opt-r-oppnotes" class="opt-input" placeholder="Ej: control endboard, cuidado con Droll..." maxlength="200">
                </div>

            </div>
            </div>

            <div class="opt-slide" data-slide="2">
            <div class="opt-form-grid">

                <div class="opt-group-hdr opt-full">⚔ Interacciones del Duelo</div>

                <div class="opt-interacciones-grid">

                <div class="opt-form-row">
                    <label class="opt-lbl">🛡️ Interrupciones exitosas (tuyas)</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-negate',-1)">−</button>
                        <input type="number" id="opt-r-negate" class="opt-input opt-stepper-input" min="0" max="20" value="0" inputmode="numeric">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-negate',1)">+</button>
                    </div>
                </div>
                <div class="opt-form-row">
                    <label class="opt-lbl">🛑 Interrupciones exitosas (rival)</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-combo',-1)">−</button>
                        <input type="number" id="opt-r-combo" class="opt-input opt-stepper-input" min="0" max="20" value="0" inputmode="numeric">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-combo',1)">+</button>
                    </div>
                </div>
                <div class="opt-form-row">
                    <label class="opt-lbl">⚔️ Limpieza de campo exitosa (tuya)</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-board',-1)">−</button>
                        <input type="number" id="opt-r-board" class="opt-input opt-stepper-input" min="0" max="15" value="0" inputmode="numeric">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-board',1)">+</button>
                    </div>
                </div>
                <div class="opt-form-row">
                    <label class="opt-lbl">💢 Limpieza de campo exitosa (rival)</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-rival',-1)">−</button>
                        <input type="number" id="opt-r-rival" class="opt-input opt-stepper-input" min="0" max="15" value="0" inputmode="numeric">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-rival',1)">+</button>
                    </div>
                </div>

                </div>

                <div class="opt-group-hdr opt-full">Resultado</div>

                <div class="opt-form-row">
                    <label class="opt-lbl">¿Resultado?</label>
                    <select id="opt-r-resultado" class="opt-input" onchange="Deck._optToggleTipo()">
                        <option value="">— seleccionar —</option>
                        <option value="victoria">✅ Victoria</option>
                        <option value="derrota">❌ Derrota</option>
                    </select>
                </div>

                

                <div class="opt-form-row opt-full" id="opt-row-cat-vic" style="display:none;">
                    <label class="opt-lbl">Categoría de Victoria</label>
                    <div class="opt-star-rating" id="opt-star-rating">
                        <span class="opt-star" data-val="1" onclick="Deck._setCatVictoria(1)">★</span>
                        <span class="opt-star" data-val="2" onclick="Deck._setCatVictoria(2)">★</span>
                        <span class="opt-star" data-val="3" onclick="Deck._setCatVictoria(3)">★</span>
                    </div>
                    <input type="hidden" id="opt-r-cat-vic" value="3">
                    <span class="opt-cat-vic-label" id="opt-cat-vic-label">Categoría: Por superar al rival</span>
                </div>

                <div class="opt-form-row" id="opt-row-tipo-vic" style="display:none;">
                    <label class="opt-lbl">Tipo de victoria</label>
                    <select id="opt-r-tipo-vic" class="opt-input">
                        <option value="normal">Normal</option>
                        <option value="ftk">⚡ FTK (Turno 1)</option>
                        <option value="rendicion">🏳 Rendición rival</option>
                        <option value="tiempo">⏰ Victoria por tiempo</option>
                    </select>
                </div>
                <div class="opt-form-row" id="opt-row-turnovic" style="display:none;">
                    <label class="opt-lbl">🏁 Turno en que gané</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-turnovic',-1)">−</button>
                        <input type="number" id="opt-r-turnovic" class="opt-input opt-stepper-input" min="1" max="20" placeholder="Ej: 3">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-turnovic',1)">+</button>
                    </div>
                </div>
                <div class="opt-form-row" id="opt-row-tipo-der" style="display:none;">
                    <label class="opt-lbl">Tipo de derrota</label>
                  <select id="opt-r-tipo-der" class="opt-input">
                    <option value="normal">Normal</option>
                    <option value="ftk">🔱 FTK del rival</option>
                    <option value="rendicion">🏳 Me rendí</option>
                    <option value="tiempo">⏰ Derrota por tiempo</option>
                </select>
                </div>
                <div class="opt-form-row" id="opt-row-turnoder" style="display:none;">
                    <label class="opt-lbl">💀 Turno en que perdí</label>
                    <div class="opt-stepper">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-turnoder',-1)">−</button>
                        <input type="number" id="opt-r-turnoder" class="opt-input opt-stepper-input" min="1" max="20" placeholder="Ej: 4">
                        <button type="button" class="opt-stepper-btn" onmousedown="event.preventDefault()" onclick="Deck._stepNumber('opt-r-turnoder',1)">+</button>
                    </div>
                </div>

                <div class="opt-form-row opt-full">
                    <label class="opt-lbl">Presión de tiempo</label>
                    <select id="opt-r-tiempo" class="opt-input">
                        <option value="holgado">🟢 Holgado</option>
                        <option value="ajustado">🟡 Ajustado (&lt;60s por turno)</option>
                        <option value="critico">🔴 Crítico (sin tiempo)</option>
                    </select>
                </div>

                <div class="opt-form-row opt-full">
                    <label class="opt-lbl">Notas adicionales (opcional)</label>
                    <input type="text" id="opt-r-notas" class="opt-input" placeholder="Ej: brick en extender, rival jugó Ash..." maxlength="120">
                </div>

            </div>
            </div>

            <div class="opt-slide" data-slide="4">
                <div id="opt-keycards-slide-content">${this._renderKeyCardsSlideContent()}</div>
            </div>

            </div>
            <div class="opt-slide-nav-col">
                <button type="button" class="opt-slide-nav-btn" onmousedown="event.preventDefault()" onclick="Deck._advanceRoundField()" title="Siguiente campo / slide">➜</button>
            </div>
            </div>

            <button class="opt-submit-btn" onclick="Deck._onRoundSubmitClick()">➡️ Siguiente Aspecto</button>
        `;
    },

// ═══════════════════════════════════════════════════════════════════
    // CARTAS CLAVE — mis cartas clave (del deck activo) y amenazas del rival
    // ═══════════════════════════════════════════════════════════════════
    _renderKeyCardsSlideContent: function() {
        const esc = s => (s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const selectedIds = this._pendingKeyCards.map(c => c.id);

        // Agrupado Main/Extra (sin Side) y orden alfabético ascendente para
        // que sea más fácil ubicar la carta buscada.
        const buildGroup = (loc) => Object.entries(this.cards)
            .filter(([, item]) => item.location === loc)
            .sort((a, b) => this.compareCards(a, b, loc))
            .map(([id, item]) => ({
                id, name: item.data.name,
                img: item.data.card_images?.[0]?.image_url_small || ''
            }));

        const mainCards  = buildGroup('main');
        const extraCards = buildGroup('extra');
        const sideCards  = buildGroup('side');

        const renderThumbs = (cards) => cards.map(c => `
                    <img src="${c.img}" alt="${esc(c.name)}" title="${esc(c.name)}"
                         class="opt-key-card-thumb ${selectedIds.includes(c.id) ? 'opt-key-card-thumb-selected' : ''}"
                         onclick="Deck.toggleKeyCard('${c.id}','${esc(c.name)}','${c.img}')">
                `).join('');

        const keyGrid = (mainCards.length || extraCards.length || sideCards.length) ? `
            ${mainCards.length ? `
            <div class="opt-key-card-group">
                <div class="opt-key-card-group-title">🃏 Main Deck</div>
                <div class="opt-key-card-grid">${renderThumbs(mainCards)}</div>
            </div>` : ''}
            ${extraCards.length ? `
            <div class="opt-key-card-group">
                <div class="opt-key-card-group-title">✨ Extra Deck</div>
                <div class="opt-key-card-grid">${renderThumbs(extraCards)}</div>
            </div>` : ''}
            ${sideCards.length ? `
            <div class="opt-key-card-group">
                <div class="opt-key-card-group-title">🗂️ Side Deck</div>
                <div class="opt-key-card-grid">${renderThumbs(sideCards)}</div>
            </div>` : ''}
        ` : `<p class="opt-key-empty">Este deck no tiene cartas cargadas.</p>`;

        const keySelected = this._pendingKeyCards.length ? `
            <div class="opt-key-selected-row">
                ${this._pendingKeyCards.map(c => `
                    <div class="opt-key-chip">
                        <img src="${c.img}" alt="${c.name}">
                        <span>${c.name}</span>
                        <button type="button" class="opt-key-chip-remove" onclick="Deck.toggleKeyCard('${c.id}','${esc(c.name)}','${c.img}')" title="Quitar">✕</button>
                    </div>
                `).join('')}
            </div>` : `<p class="opt-key-empty">Sin cartas clave seleccionadas.</p>`;

        const threatSelected = this._pendingThreatCards.length ? `
            <div class="opt-key-selected-row">
                ${this._pendingThreatCards.map(c => `
                    <div class="opt-key-chip opt-key-chip-threat">
                        <img src="${c.img}" alt="${c.name}">
                        <span>${c.name}</span>
                        <button type="button" class="opt-key-chip-remove" onclick="Deck.removeThreatCard('${c.id}')" title="Quitar">✕</button>
                    </div>
                `).join('')}
            </div>` : `<p class="opt-key-empty">Sin amenazas registradas.</p>`;

        return `
            <div class="opt-group-hdr opt-full">🗝️ Mis Cartas Clave <span class="opt-key-counter">(${this._pendingKeyCards.length}/3)</span></div>
            <p class="opt-key-hint">Elige hasta 3 cartas de tu deck que dieron o pudieron dar el duelo (sin importar copias).</p>
            <button type="button" class="deck-move opt-key-search-btn" onclick="Deck.openKeyCardSearch()">🔍 Buscar Carta</button>
            ${keyGrid}
            ${keySelected}

            <div class="opt-group-hdr opt-full" style="margin-top:14px;">🎯 Amenazas del Oponente <span class="opt-key-counter">(${this._pendingThreatCards.length}/3)</span></div>
            <p class="opt-key-hint">Hasta 3 cartas rivales que amenazaron o rompieron tu plan en este duelo.</p>
            <button type="button" class="deck-move opt-key-search-btn" onclick="Deck.openThreatCardSearch()" ${this._pendingThreatCards.length >= 3 ? 'disabled' : ''}>🔍 Buscar Carta</button>
            ${threatSelected}
        `;
    },

    toggleKeyCard: function(id, name, img) {
        const idx = this._pendingKeyCards.findIndex(c => c.id === id);
        if (idx !== -1) {
            this._pendingKeyCards.splice(idx, 1);
        } else {
            if (this._pendingKeyCards.length >= 3) { alert('Máximo 3 Cartas Clave.'); return; }
            this._pendingKeyCards.push({ id, name, img });
        }
        this._refreshKeyCardsSlide();
    },

    removeThreatCard: function(id) {
        this._pendingThreatCards = this._pendingThreatCards.filter(c => c.id !== id);
        this._refreshKeyCardsSlide();
    },

    _refreshKeyCardsSlide: function() {
        const el = document.getElementById('opt-keycards-slide-content');
        if (el) el.innerHTML = this._renderKeyCardsSlideContent();
    },

    openThreatCardSearch: function() {
        if (this._pendingThreatCards.length >= 3) { alert('Máximo 3 Amenazas del Oponente.'); return; }
        this._openCardSearchModal('threat', {
            title: '🔍 Buscar Carta Amenaza',
            onPick: (card, closeModal) => {
                if (this._pendingThreatCards.length >= 3) { alert('Máximo 3 Amenazas del Oponente.'); return; }
                const id = String(card.id);
                if (this._pendingThreatCards.some(c => c.id === id)) { alert('Esa carta ya está agregada.'); return; }
                this._pendingThreatCards.push({ id, name: card.name, img: card.card_images?.[0]?.image_url_small || '' });
                closeModal();
                this._refreshKeyCardsSlide();
            }
        });
    },

    openKeyCardSearch: function() {
        this._openCardSearchModal('keycard', {
            title: '🔍 Buscar Carta para Mi Deck',
            onPick: (card, closeModal) => {
                const id = String(card.id);
                const currentQty = this.cards[id] ? this.cards[id].qty : 0;
                this.syncFromViewer(id, card, currentQty + 1);
                closeModal();
                this._refreshKeyCardsSlide();
            }
        });
    },

    // ── Motor genérico de mini-buscador (paginado x100 + filtros avanzados) ──
    // Reutilizado por openThreatCardSearch y openKeyCardSearch. No usa el DOM
    // ni el estado del Buscador principal; solo llama sus métodos por .call()
    // para no duplicar la lógica de filtros/API.
    _openCardSearchModal: function(stateKey, opts) {
        if (!this._csStates) this._csStates = {};
        if (document.getElementById(`cs-overlay-${stateKey}`)) return;
        this._csStates[stateKey] = { filters: this._csDefaultFilters(), page: 0, cards: [], panelOpen: false };

        const overlay = document.createElement('div');
        overlay.id = `cs-overlay-${stateKey}`;
        overlay.className = 'opt-round-modal-overlay';
        overlay.innerHTML = `
            <div class="opt-round-modal-box" style="width:520px;max-width:94vw;">
                <div class="opt-round-modal-hdr">
                    <span>${opts.title}</span>
                    <button class="opt-round-modal-close" onclick="document.getElementById('cs-overlay-${stateKey}').remove()">✕</button>
                </div>
                <div class="opt-round-modal-body">
                    <div class="opt-oppdeck-row" style="margin-bottom:10px;">
                        <input type="text" id="cs-input-${stateKey}" class="opt-input" placeholder="Nombre de carta..." autocomplete="off">
                        <button type="button" class="deck-move" id="cs-search-btn-${stateKey}" title="Buscar">🔍</button>
                        <button type="button" class="deck-move" id="cs-filter-btn-${stateKey}" title="Filtros avanzados">⚙</button>
                        <button type="button" class="deck-move" id="cs-clear-btn-${stateKey}" title="Limpiar filtros y búsqueda">🗑️</button>
                    </div>
                    <div id="cs-filters-${stateKey}" class="advanced-filters-panel" style="display:none;"></div>
                    <div id="cs-results-${stateKey}" class="opt-key-card-grid-search"></div>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        document.getElementById(`cs-search-btn-${stateKey}`).addEventListener('click', () => this._csDoSearch(stateKey));
        document.getElementById(`cs-filter-btn-${stateKey}`).addEventListener('click', () => this._csToggleFilters(stateKey));
        document.getElementById(`cs-clear-btn-${stateKey}`).addEventListener('click', () => this._csClear(stateKey));
        document.getElementById(`cs-results-${stateKey}`).addEventListener('click', e => {
            const el = e.target.closest('[data-idx]');
            if (!el) return;
            const st = this._csStates[stateKey];
            const card = st.cards[parseInt(el.dataset.idx, 10)];
            if (card) opts.onPick(card, () => overlay.remove());
        });

        const inp = document.getElementById(`cs-input-${stateKey}`);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') this._csDoSearch(stateKey); });
        inp.focus();
    },

    _csDefaultFilters: function() {
        return {
            cardCategory: '', attribute: '', monsterType: '', monsterSubtype: '',
            spellSubtype: '', trapSubtype: '', level: '', linkval: '', scale: '',
            atk: '', def: '', archetype: '', cardset: ''
        };
    },

    _csToggleFilters: function(stateKey) {
        const st = this._csStates[stateKey];
        if (!st) return;
        st.panelOpen = !st.panelOpen;
        const panel = document.getElementById(`cs-filters-${stateKey}`);
        if (!panel) return;
        panel.style.display = st.panelOpen ? 'block' : 'none';
        if (st.panelOpen) this._csRenderFilterPanel(stateKey);
    },

    _csRenderFilterPanel: function(stateKey) {
        const st = this._csStates[stateKey];
        const panel = document.getElementById(`cs-filters-${stateKey}`);
        if (!panel || !st) return;
        const f = st.filters, fd = Buscador.FILTER_DATA;
        const chip = (val, key, current, label) => {
            const active = current === val ? ' adv-chip-active' : '';
            return `<span class="adv-chip${active}" onclick="Deck._csSetFilter('${stateKey}','${key}','${val}')">${label || val}</span>`;
        };

        let html = `<div class="adv-row">
            <span class="adv-label">Tipo de carta</span>
            <div class="adv-chips">
                ${chip('monster','cardCategory',f.cardCategory,'Monstruo')}
                ${chip('spell','cardCategory',f.cardCategory,'Mágica')}
                ${chip('trap','cardCategory',f.cardCategory,'Trampa')}
            </div>
        </div>`;

        if (f.cardCategory === 'monster') {
            html += `<div class="adv-row">
                <span class="adv-label">Atributo</span>
                <div class="adv-chips">${fd.attributes.map(a => chip(a,'attribute',f.attribute)).join('')}</div>
            </div>`;
            html += `<div class="adv-row">
                <span class="adv-label">Subtipo</span>
                <div class="adv-chips">${fd.monsterSubtypes.map(s => chip(s,'monsterSubtype',f.monsterSubtype)).join('')}</div>
            </div>`;
            html += `<div class="adv-row">
                <span class="adv-label">Tipo monstruo</span>
                <div class="adv-chips adv-chips-wrap">${fd.monsterTypes.map(t => chip(t,'monsterType',f.monsterType)).join('')}</div>
            </div>`;

            const isLink = f.monsterSubtype === 'Link';
            const isPendulum = f.monsterSubtype === 'Pendulum';
            const isXYZ = f.monsterSubtype === 'XYZ';

            if (!isLink) {
                const levelLabel = isXYZ ? 'Rango' : 'Nivel';
                html += `<div class="adv-row">
                    <span class="adv-label">${levelLabel}</span>
                    <div class="adv-chips">${fd.levels.map(l => chip(l,'level',f.level)).join('')}</div>
                </div>`;
            }
            if (isLink) {
                html += `<div class="adv-row">
                    <span class="adv-label">Rating Link</span>
                    <div class="adv-chips">${fd.linkvals.map(l => chip(l,'linkval',f.linkval)).join('')}</div>
                </div>`;
            }
            if (isPendulum) {
                html += `<div class="adv-row">
                    <span class="adv-label">Escala</span>
                    <div class="adv-chips">${fd.scales.map(s => chip(s,'scale',f.scale)).join('')}</div>
                </div>`;
            }

            html += `<div class="adv-row adv-row-inputs">
                <div class="adv-input-group">
                    <span class="adv-label">ATK</span>
                    <input type="number" class="adv-input" placeholder="ej: 2500" value="${f.atk}" min="0" max="99999"
                        onchange="Deck._csSetFilter('${stateKey}','atk',this.value)">
                </div>
                <div class="adv-input-group">
                    <span class="adv-label">DEF</span>
                    <input type="number" class="adv-input" placeholder="ej: 2000" value="${f.def}" min="0" max="99999"
                        onchange="Deck._csSetFilter('${stateKey}','def',this.value)">
                </div>
            </div>`;

        } else if (f.cardCategory === 'spell') {
            html += `<div class="adv-row">
                <span class="adv-label">Tipo mágica</span>
                <div class="adv-chips">${fd.spellSubtypes.map((s,i) => chip(fd.spellSubtypesEn[i],'spellSubtype',f.spellSubtype,s)).join('')}</div>
            </div>`;
        } else if (f.cardCategory === 'trap') {
            html += `<div class="adv-row">
                <span class="adv-label">Tipo trampa</span>
                <div class="adv-chips">${fd.trapSubtypes.map((s,i) => chip(fd.trapSubtypesEn[i],'trapSubtype',f.trapSubtype,s)).join('')}</div>
            </div>`;
        }

        panel.innerHTML = html;
    },

    _csSetFilter: function(stateKey, key, value) {
        const st = this._csStates[stateKey];
        if (!st) return;
        if (st.filters[key] === value) {
            st.filters[key] = '';
        } else {
            st.filters[key] = value;
            if (key === 'cardCategory') Object.assign(st.filters, {
                attribute: '', monsterType: '', monsterSubtype: '', spellSubtype: '',
                trapSubtype: '', level: '', linkval: '', scale: '', atk: '', def: ''
            });
            if (key === 'monsterSubtype') Object.assign(st.filters, { level: '', linkval: '', scale: '' });
        }
        this._csRenderFilterPanel(stateKey);
        this._csDoSearch(stateKey);
    },

    _csDoSearch: async function(stateKey) {
        const st = this._csStates[stateKey];
        if (!st) return;
        const inp = document.getElementById(`cs-input-${stateKey}`);
        const term = inp ? inp.value.trim() : '';
        const ctx = { advancedFilters: st.filters };
        ctx.hasAdvancedFilters = Buscador.hasAdvancedFilters.bind(ctx);
        if (!term && !ctx.hasAdvancedFilters()) return;

        const resWrap = document.getElementById(`cs-results-${stateKey}`);
        if (resWrap) resWrap.innerHTML = `<p class="opt-key-empty">⏳ Buscando...</p>`;
        try {
            const url = Buscador.buildApiUrl.call(Object.assign({ apiUrl: Buscador.apiUrl }, ctx), term);
            const r = await fetch(url);
            const j = await r.json();
            st.cards = Buscador.applyAdvancedLocalFilter.call(ctx, j.data || []);
            st.page = 0;
            this._csRenderResultsPage(stateKey);
        } catch (_) {
            if (resWrap) resWrap.innerHTML = `<p class="opt-key-empty">Error de red.</p>`;
        }
    },

    _csRenderResultsPage: function(stateKey) {
        const st = this._csStates[stateKey];
        const resWrap = document.getElementById(`cs-results-${stateKey}`);
        if (!st || !resWrap) return;
        const PAGE_SIZE = 100;
        const cards = st.cards || [];
        if (!cards.length) { resWrap.innerHTML = `<p class="opt-key-empty">Sin resultados.</p>`; return; }

        const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
        if (st.page >= totalPages) st.page = totalPages - 1;
        if (st.page < 0) st.page = 0;
        const start = st.page * PAGE_SIZE;
        const pageCards = cards.slice(start, start + PAGE_SIZE);

        let html = `<div class="opt-key-card-grid opt-key-card-grid-search">`;
        pageCards.forEach((c, i) => {
            const img = c.card_images?.[0]?.image_url_small || '';
            const name = (c.name || '').replace(/"/g,'&quot;');
            html += `<img src="${img}" alt="${name}" title="${name}" class="opt-key-card-thumb" data-idx="${start + i}">`;
        });
        html += `</div>`;

        if (totalPages > 1) {
            html += `<div class="results-pagination">`;
            for (let p = 0; p < totalPages; p++) {
                const from = p * PAGE_SIZE + 1, to = Math.min((p + 1) * PAGE_SIZE, cards.length);
                html += `<button type="button" class="results-page-btn ${p === st.page ? 'results-page-active' : ''}"
                            onclick="Deck._csGoToPage('${stateKey}',${p})">${from}-${to}</button>`;
            }
            html += `</div>`;
        }
        resWrap.innerHTML = html;
    },

    _csGoToPage: function(stateKey, page) {
        const st = this._csStates[stateKey];
        if (!st) return;
        st.page = page;
        this._csRenderResultsPage(stateKey);
        document.getElementById(`cs-results-${stateKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    _csClear: function(stateKey) {
        const st = this._csStates[stateKey];
        if (!st) return;
        st.filters = this._csDefaultFilters();
        st.page = 0;
        st.cards = [];
        st.panelOpen = false;
        const inp = document.getElementById(`cs-input-${stateKey}`);
        if (inp) inp.value = '';
        const panel = document.getElementById(`cs-filters-${stateKey}`);
        if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }
        const resWrap = document.getElementById(`cs-results-${stateKey}`);
        if (resWrap) resWrap.innerHTML = '';
    },

    openRoundModal: function() {
        if (!Object.keys(this.cards).length) { alert('Carga un deck primero.'); return; }
        if (document.getElementById('opt-round-modal-overlay')) return;
        if (!this._editingRoundId) {
            if (this._roundDraft) {
                this._pendingKeyCards    = this._roundDraft.keyCards    ? [...this._roundDraft.keyCards]    : [];
                this._pendingThreatCards = this._roundDraft.threatCards ? [...this._roundDraft.threatCards] : [];
            } else {
                this._pendingKeyCards = [];
                this._pendingThreatCards = [];
            }
        }
        const overlay = document.createElement('div');
        overlay.id = 'opt-round-modal-overlay';
        overlay.className = 'opt-round-modal-overlay';
        overlay.innerHTML = this._renderRoundModalBox();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) Deck.closeRoundModal(); });
        document.body.appendChild(overlay);
        if (!this._editingRoundId && this._roundDraft) this._applyRoundDraft();
    },

    closeRoundModal: function() {
        if (this._editingRoundId) {
            this._editingRoundId = null;
            this._pendingKeyCards = [];
            this._pendingThreatCards = [];
        } else {
            this._roundDraft = this._captureRoundDraft();
        }
        document.getElementById('opt-round-modal-overlay')?.remove();
    },

    _captureRoundDraft: function() {
        const ids = ['opt-r-starter','opt-r-extenders','opt-r-handtraps','opt-r-boardbreaker','opt-r-bricks',
                     'opt-r-oppname','opt-r-oppnotes',
                     'opt-r-negate','opt-r-board','opt-r-combo','opt-r-rival',
                     'opt-r-resultado','opt-r-orden','opt-r-tipo-vic','opt-r-turnovic',
                     'opt-r-tipo-der','opt-r-turnoder','opt-r-tiempo','opt-r-notas'];
        const values = {};
        ids.forEach(id => { const el = document.getElementById(id); if (el) values[id] = el.value; });
        const activeSlideEl = document.querySelector('.opt-round-modal-box .opt-slide.opt-slide-active');
        return {
            values,
            slide: activeSlideEl ? parseInt(activeSlideEl.dataset.slide, 10) : 1,
            keyCards: [...this._pendingKeyCards],
            threatCards: [...this._pendingThreatCards]
        };
    },

    _applyRoundDraft: function() {
        if (!this._roundDraft) return;
        Object.entries(this._roundDraft.values).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        });
        this._optToggleTipo();
        this._goToRoundSlide(this._roundDraft.slide || 1);
    },

    _refreshRoundModalIfOpen: function() {
        const overlay = document.getElementById('opt-round-modal-overlay');
        if (overlay) overlay.innerHTML = this._renderRoundModalBox();
    },

    _renderRoundModalBox: function() {
        const data      = this.getOptimizacion();
        const activeSess = this._activeSessionId
            ? (data.sessions || []).find(s => s.id === this._activeSessionId) : null;
        const activeRounds = activeSess ? activeSess.rounds.length : 0;
        const isEditing = !!this._editingRoundId;
        return `
        <div class="opt-round-modal-box">
            <div class="opt-round-modal-hdr">
                <span>${isEditing ? '✏️ Editar Ronda' : `➕ Nueva Ronda de Duelo${activeSess ? ` <span class="opt-round-count">#${activeRounds + 1}</span>` : ''}`}</span>
                <button class="opt-round-modal-close" onclick="Deck.closeRoundModal()">✕</button>
            </div>
            <div class="opt-round-modal-body">
                <div class="opt-record opt-form-card">
                    ${this._renderRoundFormFields()}
                </div>
            </div>
        </div>`;
    },
    renderOptimizacionPane: function() {
        if (!Object.keys(this.cards).length)
            return `<p style="opacity:.6;margin-top:10px;">Carga un deck para usar Optimización.</p>`;

        const data     = this.getOptimizacion();
        const sessions = data.sessions || [];
        const activeSess = this._activeSessionId
            ? sessions.find(s => s.id === this._activeSessionId) : null;
        const activeRounds = activeSess ? activeSess.rounds.length : 0;
        const isActive = !!activeSess;

        const badge = (v, ranges) => { for (const [mn,mx,lbl,cls] of ranges) if (v>=mn && v<mx) return [lbl,cls]; return ['—','']; };
        const winB  = v => badge(v,[[65,101,'💎 Competitivo','opt-c-green'],[55,65,'✅ Sólido','opt-c-blue'],[40,55,'⚠ Inestable','opt-c-yellow'],[0,40,'❌ Débil','opt-c-red']]);
        const brkB  = v => badge(v,[[0,10,'💎 Excelente','opt-c-green'],[10,15,'✅ Aceptable','opt-c-blue'],[15,25,'⚠ Inestable','opt-c-yellow'],[25,101,'❌ Inconsistencia','opt-c-red']]);
        const strB  = v => v>=70&&v<=85?['✅ Ideal','opt-c-green']:v<60?['❌ Faltan starters','opt-c-red']:v<70?['⚠ Bajo el ideal','opt-c-yellow']:['⚠ Exceso','opt-c-yellow'];
        const riB   = v => badge(v,[[0,15,'💎 Resiliente','opt-c-green'],[15,30,'✅ Controlado','opt-c-blue'],[30,45,'⚠ Vulnerable','opt-c-yellow'],[45,101,'❌ Muy interrumpido','opt-c-red']]);
        const scrB  = v => badge(v,[[80,101,'💎 Competitivo','opt-c-green'],[65,80,'✅ Optimizado','opt-c-blue'],[50,65,'⚠ Funcional','opt-c-yellow'],[0,50,'❌ Desbalanceado','opt-c-red']]);

        // ── WINRATE DEL DECK (Historial de Sesiones) — siempre desplegado ──────
        let html = `
        <div data-section-id="deck-piloto">
        <h3 class="deck-section-title" style="cursor:default;">🏆 Winrate del Deck</h3>
        <div id="piloto-sec" class="deck-section-content">
            <div id="duelista-content-opt">
                <p class="stats-empty">Cargando...</p>
            </div>
        </div>
        </div>

        <!-- ── COMPLEJIDAD DEL DECK ── -->
        <div data-section-id="deck-complejidad">
        <h3 class="deck-section-title" onclick="Deck.toggleSection('cxd-sec')">🧩 Complejidad del Deck</h3>
        <div id="cxd-sec" class="deck-section-content" style="display:none;">
            <div id="cxd-summary">${this._renderComplejidadSummary()}</div>
            <button class="opt-submit-btn cxd-toggle-btn" id="cxd-toggle-btn"
                    onclick="Deck.toggleComplejidadForm()">🧩 Evaluar Complejidad del Deck</button>
            <div id="cxd-form-wrap" class="cxd-form-wrap" style="display:none;">
                ${this._renderComplejidadForm()}
            </div>
        </div>
        </div>

        <!-- ── NOTAS DEL DECK + HISTORIAL DE ENFRENTAMIENTOS (movido desde Construcción) ── -->
        <div data-section-id="deck-notas">
        <h3 class="deck-section-title" onclick="Deck.toggleSection('notes-sec')">📝 Notas del Deck</h3>
        <div id="notes-sec" class="deck-section-content" style="display:none;">
            <textarea class="deck-notes-textarea"
                placeholder="Anota estrategias, combos clave, mulligan ideal, matchups difíciles..."
                oninput="Deck.notes = this.value"
            >${this.notes || ''}</textarea>
            <div class="deck-notes-actions">
                <button class="opt-submit-btn opt-notes-save-btn" onclick="Deck.saveNotes()">💾 Guardar Notas</button>
                <span id="opt-notes-status" class="opt-notes-status"></span>
            </div>
        </div>
        </div>`;

        html += this._renderKeyThreatCardsSection(this.name);

        if (window.Matchups) {
            html += `<div data-section-id="deck-matchups">${Matchups.renderSection()}</div>`;
            if (Matchups._activeFilterDeck) {
                html += `<div class="opt-filter-banner">
                    🎯 Mostrando Historial de Sesiones solo vs <b>${Matchups._activeFilterDeck}</b>
                    <button class="opt-filter-clear-btn" onclick="Matchups.clearDeckFilter()">✕ Quitar filtro</button>
                </div>`;
            }
        }

        // ── BARRA DE SESIÓN ACTIVA ────────────────────────────────────────
        html += `<div class="opt-session-bar ${isActive ? 'opt-session-active' : ''}">`;
        if (isActive) {
            html += `<span class="opt-sess-indicator">🟢 Sesión activa · <b>${activeRounds}</b> ronda${activeRounds !== 1 ? 's' : ''}</span>
                     <input type="text" id="opt-label" class="opt-input opt-label-inline" placeholder="Etiqueta de sesión..." maxlength="50" value="${(activeSess.label || '').replace(/"/g,'&quot;')}">
                     <button class="opt-close-sess-btn" onclick="Deck.cerrarSesionOptimizacion()">✅ Cerrar Sesión</button>`;
        } else {
            html += `<span class="opt-sess-indicator">⚪ Sin sesión activa</span>
                     <input type="text" id="opt-label" class="opt-input opt-label-inline" placeholder="Etiqueta (torneo, casual…)" maxlength="50">
                     <small class="opt-sess-hint">La sesión se abre al registrar la primera ronda</small>`;
        }
        html += `</div>`;

        // ── BOTÓN FLOTANTE: NUEVA RONDA DE DUELO ────────────────────────────
        html += `
        <button class="opt-fab-round-btn" onclick="Deck.openRoundModal()">
            ${isActive ? `🔄 Continuar Duelo <span class="opt-round-count">#${activeRounds + 1}</span>` : '➕ Nueva Ronda de Duelo'}
        </button>`;

        // ── HISTORIAL DE SESIONES ─────────────────────────────────────────
        const filterDeck  = window.Matchups ? Matchups._activeFilterDeck : null;
        const viewSessions = filterDeck
            ? sessions
                .map(s => ({ ...s, rounds: (s.rounds || []).filter(r => r.oppDeck === filterDeck) }))
                .filter(s => s.rounds.length > 0)
            : sessions;

        if (sessions.length > 0) {
            html += `<h3 class="deck-section-title" style="margin-top:14px;" onclick="Deck.toggleSection('opt-hist-sec')">
                📊 Historial de Sesiones <span style="font-size:.72em;opacity:.6">(${viewSessions.length})</span>
            </h3><div id="opt-hist-sec" class="deck-section-content">`;

            const cartaAsCard = Object.values(this.cards).find(c => c.roles?.includes('Carta As'));
            const coverCard   = cartaAsCard || this.getMostRepeatedCard(this.cards);
            const coverImg    = coverCard
                ? (coverCard.data ? coverCard.data.card_images[0].image_url_small : coverCard.card_images[0].image_url_small)
                : 'https://images.ygoprodeck.com/images/cards/6983839.jpg';

            if (filterDeck && viewSessions.length === 0) {
                html += `<p class="opt-empty-msg">Sin rondas registradas vs "${filterDeck}".</p>`;
            }
            viewSessions.forEach((sess, si) => {
                const m    = this.calcOptMetrics(sess);
                const prev = viewSessions[si + 1] ? this.calcOptMetrics(viewSessions[si + 1]) : null;
                const tr   = (curr, prv, higher) => this.calcOptTrend(curr, prv ?? null, higher);
                const diag = this.getOptDiagnostics(m);
                const [sLbl,sCls]  = scrB(m.score);
                const [wLbl,wCls]  = winB(m.wr);
                const [bLbl,bCls]  = brkB(m.br);
                const [stLbl,stCls]= strB(m.str);
                const [riLbl,riCls] = riB(m.ri);
                const isThisActive = sess.id === this._activeSessionId;

                const wrFirst  = m.rFirst.length
                    ? Math.round(m.rFirst.filter(r=>r.resultado==='victoria').length / m.rFirst.length * 100) : null;
                const wrSecond = m.rSecond.length
                    ? Math.round(m.rSecond.filter(r=>r.resultado==='victoria').length / m.rSecond.length * 100) : null;
                const lrFirst  = wrFirst  !== null ? 100 - wrFirst  : null;
                const lrSecond = wrSecond !== null ? 100 - wrSecond : null;
                const sessOpen = si === 0;
                html += `
                <div class="opt-record${isThisActive ? ' opt-record-active' : ''}">
                    <div class="opt-record-hdr">
                        <span class="opt-rec-date" onclick="Deck._toggleOptRecord(${sess.id})">
                            <span class="opt-sess-toggle-arrow" id="opt-sess-arrow-${sess.id}">${sessOpen ? '▾' : '▸'}</span>
                            ${sess.date}${sess.label ? ` — ${sess.label}` : ''}
                            <span class="opt-rounds-pill">${m.p} rondas</span>
                            ${isThisActive ? '<span class="opt-active-pill">🟢 activa</span>' : ''}
                            <span class="opt-rec-deck-id">
                                <img src="${coverImg}" alt="${this.name}" class="opt-rec-deck-img">
                                ${this.name}
                            </span>
                        </span>
                        <span class="opt-score-main ${sCls}">${m.score} pts ${tr(m.score, prev?.score, true)} · ${sLbl}</span>
                        <span class="opt-session-actions">
                            <button class="opt-dl-btn" onclick="Deck.exportYDK()" title="Descargar Deck">⬇️</button>
                            <button class="opt-edit-btn" onclick="Deck.editOptimizacionRecord(${sess.id})" title="Reabrir sesión">🔁</button>
                            <button class="opt-del-btn" onclick="Deck.deleteOptimizacionRecord(${sess.id})" title="Eliminar sesión">🗑</button>
                        </span> </div>

                    <div id="opt-sess-body-${sess.id}" class="opt-sess-body" style="display:${sessOpen ? 'block' : 'none'};">
                    <div class="opt-metrics-grid">
                        <div class="opt-metric"><div class="opt-m-name">Win Rate</div><div class="opt-m-val">${m.wr}% ${tr(m.wr, prev?.wr, true)}</div><div class="opt-m-badge ${wCls}">${wLbl}</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Brick Rate</div><div class="opt-m-val">${m.br}% ${tr(m.br, prev?.br, false)}</div><div class="opt-m-badge ${bCls}">${bLbl}</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Starter Rate</div><div class="opt-m-val">${m.str}% ${tr(m.str, prev?.str, true)}</div><div class="opt-m-badge ${stCls}">${stLbl}</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Interrupción Rival</div><div class="opt-m-val">${m.ri}% ${tr(m.ri, prev?.ri, false)}</div><div class="opt-m-badge ${riCls}">${riLbl}</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Board Break</div><div class="opt-m-val">${m.bb}% ${tr(m.bb, prev?.bb, true)}</div><div class="opt-m-badge opt-c-neutral">Going 2nd</div></div>
                        <div class="opt-metric"><div class="opt-m-name">Control Rate</div><div class="opt-m-val">${m.ctrl}% ${tr(m.ctrl, prev?.ctrl, true)}</div><div class="opt-m-badge opt-c-neutral">Going 1st</div></div>
                    </div>

                    <div class="opt-order-split">
                        ${wrFirst  !== null ? `<span class="opt-order-chip opt-order-first">🥇 Primero (${m.rFirst.length}): ${wrFirst}% WR · ${lrFirst}% LR (${m.rFirst.filter(r=>r.resultado==='victoria').length}V/${m.rFirst.filter(r=>r.resultado==='derrota').length}D)</span>` : ''}
                        ${wrSecond !== null ? `<span class="opt-order-chip opt-order-second">🥈 Segundo (${m.rSecond.length}): ${wrSecond}% WR · ${lrSecond}% LR (${m.rSecond.filter(r=>r.resultado==='victoria').length}V/${m.rSecond.filter(r=>r.resultado==='derrota').length}D)</span>` : ''}
                    </div>

                    <div class="opt-turn-dist-block">
                        <div class="opt-turn-dist-title">⏱ Distribución de Duelos por Turno</div>
                        ${m.turnTotal > 0 ? `
                        <div class="opt-turn-dist-bar">
                            ${m.turnDist.map(td => {
                                const segTotal = td.wins + td.losses;
                                const winPct   = Math.round((td.wins / segTotal) * 100);
                                const lossPct  = 100 - winPct;
                                return `<div class="opt-turn-dist-seg" style="flex-grow:${segTotal};" title="Turno ${td.turn}: ${td.wins}V / ${td.losses}D">
                                            ${td.wins   ? `<div class="opt-turn-seg-win" style="width:${winPct}%"></div>`   : ''}
                                            ${td.losses ? `<div class="opt-turn-seg-loss" style="width:${lossPct}%"></div>` : ''}
                                        </div>`;
                            }).join('')}
                        </div>
                        <div class="opt-turn-dist-labels">
                            ${m.turnDist.map(td => `<span class="opt-turn-dist-lbl" style="flex-grow:${td.wins + td.losses};">T${td.turn}</span>`).join('')}
                        </div>
                        <div class="opt-turn-dist-legend">
                            <span><i class="opt-turn-dot opt-turn-dot-win"></i> Victoria</span>
                            <span><i class="opt-turn-dot opt-turn-dot-loss"></i> Derrota</span>
                            <span class="opt-turn-dist-count">${m.turnTotal} de ${m.p} rondas con turno registrado</span>
                        </div>` : `
                        <p class="opt-turn-dist-empty">Aún no hay rondas con turno registrado. Usa "🏁 Turno en que gané" / "💀 Turno en que perdí" al registrar.</p>`}
                    </div>

                    <div class="opt-raw-chips">
                        <span>🃏 ${m.p} rondas · ✅ ${m.wins}V / ❌ ${m.losses}D</span>
                        <span>🧱 ${sess.rounds.filter(r=>(r.bricks||0)>=1 || r.brick).length} bricks</span>
                        <span>⚡ ø${m.avgStarter.toFixed(1)} starters</span>
                        <span>🔗 ø${m.avgExtender.toFixed(1)} extenders</span>
                        <span>🖐 ø${m.avgHandtrap.toFixed(1)} HT</span>
                        <span>🧨 ø${m.avgBoardbreaker.toFixed(1)} BB</span>
                        ${m.ftks       ? `<span>⚡ ${m.ftks} FTK${m.ftks>1?'s':''}</span>` : ''}
                        ${m.rendiciones? `<span>🏳 ${m.rendiciones} rendición${m.rendiciones>1?'es':''}</span>` : ''}
                        ${m.tiempoGan  ? `<span>⏰ ${m.tiempoGan} ganada${m.tiempoGan>1?'s':''} x tiempo</span>` : ''}
                        ${m.tiempoPer  ? `<span>⏰ ${m.tiempoPer} perdida${m.tiempoPer>1?'s':''} x tiempo</span>` : ''}
                        ${m.criticos   ? `<span>🔴 ${m.criticos} crítico${m.criticos>1?'s':''}</span>` : ''}
                        ${m.ajustados  ? `<span>🟡 ${m.ajustados} ajustado${m.ajustados>1?'s':''}</span>` : ''}
                    </div>

                    ${(m.keyCardStats.length || m.threatCardStats.length) ? `
                    <div class="opt-key-summary">
                        ${m.keyCardStats.length ? `
                        <div class="opt-key-summary-col">
                            <button type="button" class="opt-key-summary-title opt-collapsible-title" onclick="Deck.toggleSection('opt-keycards-${sess.id}')">🗝️ Cartas Clave (${m.keyCardStats.length})</button>
                            <div id="opt-keycards-${sess.id}" style="display:none;">
                                ${m.keyCardStats.map(c => `<span class="opt-key-summary-chip"><img src="${c.img}" alt="${c.name}">${c.name} ×${c.count}</span>`).join('')}
                            </div>
                        </div>` : ''}
                        ${m.threatCardStats.length ? `
                        <div class="opt-key-summary-col">
                            <button type="button" class="opt-key-summary-title opt-collapsible-title" onclick="Deck.toggleSection('opt-threats-${sess.id}')">🎯 Amenazas del Oponente (${m.threatCardStats.length})</button>
                            <div id="opt-threats-${sess.id}" style="display:none;">
                                ${m.threatCardStats.map(c => `<span class="opt-key-summary-chip opt-key-summary-chip-threat"><img src="${c.img}" alt="${c.name}">${c.name} ×${c.count}</span>`).join('')}
                            </div>
                        </div>` : ''}
                    </div>` : ''}

                    ${diag.length ? `
                    <button type="button" class="opt-diag-toggle-btn opt-collapsible-title" onclick="Deck.toggleSection('opt-diag-${sess.id}')">⚠️ Diagnósticos (${diag.length})</button>
                    <div id="opt-diag-${sess.id}" class="opt-diagnostics" style="display:none;">${diag.map(d=>`<div class="opt-diag-item">${d}</div>`).join('')}</div>` : ''}
                    <details class="opt-rounds-detail">
                        <summary class="opt-rounds-summary">Ver rondas individuales (${sess.rounds.length})</summary>
                        <div class="opt-rounds-table">
                            ${sess.rounds.map((r, ri) => {
                                const orden  = r.orden === 'primero' ? '🥇' : '🥈';
                                const res    = r.resultado === 'victoria' ? '✅' : '❌';
                                const tipoV  = r.tipoVictoria === 'ftk' ? ' FTK' : r.tipoVictoria === 'rendicion' ? ' Rend.' : r.tipoVictoria === 'tiempo' ? ' Tpo.' : '';
                                const tipoD  = r.tipoDerrota === 'ftk' ? ' FTK' : r.tipoDerrota === 'rendicion' ? ' Rend.' : r.tipoDerrota === 'tiempo' ? ' Tpo.' : '';
                                const tiempo = r.presionTiempo === 'critico' ? '🔴' : r.presionTiempo === 'ajustado' ? '🟡' : '🟢';
                                return `<div class="opt-round-row">
                                    <span class="opt-rn">#${ri+1}</span>
                                    <span>${orden}</span>
                                    <span>${res}${tipoV}${tipoD}${r.oppDeck ? ` vs ${r.oppDeck}` : ''}</span>
                                    <span title="Tiempo">${tiempo}</span>
                                    <span title="Starters">⚡${r.starter||0}</span>
                                    <span title="Extenders">🔗${r.extenders||0}</span>
                                    <span title="Handtraps">🖐${r.handtraps||0}</span>
                                    <span title="Boardbreakers en mano">🧨${r.boardbreakers||0}</span>
                                    ${r.keyCards?.length ? `<span title="Cartas Clave: ${r.keyCards.map(c=>c.name).join(', ').replace(/"/g,'&quot;')}">🗝️${r.keyCards.length}</span>` : ''}
                                    ${r.threatCards?.length ? `<span title="Amenazas: ${r.threatCards.map(c=>c.name).join(', ').replace(/"/g,'&quot;')}">🎯${r.threatCards.length}</span>` : ''}
                                    ${r.brick        ? '<span class="opt-tag-brick" title="Brick">🧱</span>' : ''}
                                    ${(r.rivalInterrupciones || r.comboCompleto) ? `<span class="opt-tag-combo" title="Interrupciones del rival">🛑${r.rivalInterrupciones || 1}</span>` : ''}
                                    ${r.rompioBoard  ? `<span title="Campos rotos">⚔️${r.vecesRompioBoard ?? 1}</span>` : ''}
                                    ${r.negoJugada   ? `<span title="Interrupciones">🛡${r.interrupciones ?? 1}</span>` : ''}
                                    ${(r.vecesRivalRompioBoard || r.rivalRompio) ? `<span title="Veces que el rival rompió mi campo">💢${r.vecesRivalRompioBoard || 1}</span>` : ''}
                                    ${r.turnoVictoria? `<span title="Ganó en turno ${r.turnoVictoria}">🏁T${r.turnoVictoria}</span>` : ''}
                                    ${r.turnoDerrota ? `<span title="Perdió en turno ${r.turnoDerrota}">💀T${r.turnoDerrota}</span>` : ''}
                                    ${r.notas        ? `<span class="opt-round-nota" title="${r.notas.replace(/"/g,'&quot;')}">📝</span>` : ''}
                                    <button class="opt-edit-btn opt-round-edit" onclick="Deck.editOptimizacionRound(${sess.id},${r.id})" title="Editar ronda">✏️</button>
                                    <button class="opt-round-del" onclick="Deck.deleteOptimizacionRound(${sess.id},${r.id})" title="Eliminar ronda">×</button>
                                </div>`;
                            }).join('')}
                        </div>
                    </details>
                    </div>
                </div>`;
            });
            html += `</div>`;
        } else {
            html += `<p class="opt-empty-msg">Registra rondas para comenzar a analizar tu deck.</p>`;
        }
        setTimeout(() => { if (window.Duelista) Duelista.refreshSection(); }, 0);
        return html;
    },
    downloadDecklist: async function() {
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'decklist-loading';
        loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;min-width:260px;';
        const setMsg = t => loadingMsg.innerHTML = `<p style="text-align:center;padding:20px;background:#333;color:white;border-radius:8px;">${t}</p>`;
        setMsg('⏳ Cargando imágenes...');
        document.body.appendChild(loadingMsg);

        try {
            const mainCards  = Object.entries(this.cards).filter(([, c]) => c.location === 'main')
                .sort((a, b) => this.compareCards(a, b, 'main')).map(([, c]) => c);
            const extraCards = Object.entries(this.cards).filter(([, c]) => c.location === 'extra')
                .sort((a, b) => this.compareCards(a, b, 'extra')).map(([, c]) => c);
            const sideCards  = Object.entries(this.cards).filter(([, c]) => c.location === 'side')
                .sort((a, b) => this.compareCards(a, b, 'side')).map(([, c]) => c);

            // ── Parámetros de layout ──
            const SCALE      = 2;          // resolución x2
            const PAD        = 30 * SCALE;
            const CARD_W     = 75 * SCALE;
            const CARD_H     = 110 * SCALE;
            const GAP_X      = 10 * SCALE;
            const GAP_Y      = 14 * SCALE;
            const COLS       = 10;
            const SECTION_GAP = 40 * SCALE;
            const TITLE_H    = 60 * SCALE;
            const SECTION_H  = 36 * SCALE;
            const NAME_H     = 28 * SCALE;  // altura reservada para nombre bajo la carta
            const BADGE_R    = 13 * SCALE;
            const ROLE_H     = 70 * SCALE;
            const CANVAS_W   = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP_X;

            // ── Cargar todas las imágenes como HTMLImageElement vía blob ──
            // images.ygoprodeck.com no manda Access-Control-Allow-Origin, así que
            // cargar la imagen directo con crossOrigin='anonymous' siempre falla
            // (necesario para toBlob() sin taintear el canvas). Se enruta vía
            // wsrv.nl, un proxy de imágenes gratuito que sí agrega el header CORS.
            const CORS_PROXY = url => `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
            const loadImg = (url) => new Promise(resolve => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload  = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = CORS_PROXY(url);
            });

            const allItems = [...mainCards, ...extraCards, ...sideCards];
            const urls     = [...new Set(allItems.map(c => c.data?.card_images?.[0]?.image_url_small).filter(Boolean))];
            const total    = urls.length;
            let loaded = 0;
            const imgCache = {};
            await Promise.all(urls.map(async url => {
                imgCache[url] = await loadImg(url);
                loaded++;
                setMsg(`⏳ Cargando imágenes... (${loaded}/${total})`);
            }));
            await new Promise(r => setTimeout(r, 300));

            // ── Calcular roles del main ──
            const rolesCount = {};
            mainCards.forEach(item => {
                (item.roles || []).forEach(r => { rolesCount[r] = (rolesCount[r] || 0) + item.qty; });
            });
            const roleEntries = Object.entries(rolesCount).sort((a, b) => b[1] - a[1]);

            // ── Helper: altura de una sección de cartas ──
            const sectionHeight = (cards) => {
                if (!cards.length) return 0;
                const rows = Math.ceil(cards.length / COLS);
                return SECTION_H + rows * (CARD_H + NAME_H + GAP_Y) + SECTION_GAP;
            };

            // ── Altura total del canvas ──
            let canvasH = PAD + TITLE_H;
            if (mainCards.length)  canvasH += sectionHeight(mainCards);
            if (extraCards.length) canvasH += sectionHeight(extraCards);
            if (sideCards.length)  canvasH += sectionHeight(sideCards);
            if (roleEntries.length) canvasH += SECTION_H + ROLE_H + SECTION_GAP;
            canvasH += PAD;

            setMsg('⏳ Generando imagen...');
            let canvas  = document.createElement('canvas');
            canvas.width  = CANVAS_W;
            canvas.height = canvasH;
            let ctx     = canvas.getContext('2d');

            // Fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let y = PAD;

            // ── Título ──
            ctx.fillStyle = '#222222';
            ctx.font      = `bold ${28 * SCALE}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(this.name, CANVAS_W / 2, y + 40 * SCALE);
            y += TITLE_H;

            // ── Función para dibujar una sección ──
            const drawSection = (cards, label, lineColor) => {
                if (!cards.length) return;

                // Encabezado
                ctx.fillStyle = '#2c3e50';
                ctx.font      = `bold ${18 * SCALE}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText(label, PAD, y + 22 * SCALE);
                ctx.strokeStyle = lineColor;
                ctx.lineWidth   = 3 * SCALE;
                ctx.beginPath();
                ctx.moveTo(PAD, y + 30 * SCALE);
                ctx.lineTo(CANVAS_W - PAD, y + 30 * SCALE);
                ctx.stroke();
                y += SECTION_H;

                // Cartas
                cards.forEach((item, i) => {
                    const col  = i % COLS;
                    const row  = Math.floor(i / COLS);
                    const x    = PAD + col * (CARD_W + GAP_X);
                    const cardY = y + row * (CARD_H + NAME_H + GAP_Y);

                    // Imagen
                    const url = item.data?.card_images?.[0]?.image_url_small;
                    const img = url ? imgCache[url] : null;
                    if (img) {
                        ctx.drawImage(img, x, cardY, CARD_W, CARD_H);
                    } else {
                        // Placeholder gris
                        ctx.fillStyle = '#cccccc';
                        ctx.fillRect(x, cardY, CARD_W, CARD_H);
                        ctx.fillStyle = '#888';
                        ctx.font = `${9 * SCALE}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.fillText('?', x + CARD_W / 2, cardY + CARD_H / 2);
                    }

                    // Badge cantidad
                    const bx = x + CARD_W - BADGE_R + 4 * SCALE;
                    const by = cardY + BADGE_R - 4 * SCALE;
                    ctx.fillStyle = 'rgba(220,0,0,0.92)';
                    ctx.beginPath();
                    ctx.arc(bx, by, BADGE_R, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.font      = `bold ${10 * SCALE}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.fillText(`x${item.qty}`, bx, by + 4 * SCALE);

                    // Nombre
                    const nameY = cardY + CARD_H + 4 * SCALE;
                    ctx.fillStyle = '#222222';
                    ctx.font      = `${8 * SCALE}px Arial`;
                    ctx.textAlign = 'center';
                    // Truncar nombre si es muy largo
                    let name = item.data?.name || '';
                    const maxW = CARD_W - 4;
                    if (ctx.measureText(name).width > maxW) {
                        while (name.length > 1 && ctx.measureText(name + '…').width > maxW) name = name.slice(0, -1);
                        name += '…';
                    }
                    ctx.fillText(name, x + CARD_W / 2, nameY + 10 * SCALE);
                });

                const rows = Math.ceil(cards.length / COLS);
                y += rows * (CARD_H + NAME_H + GAP_Y) + SECTION_GAP;
            };

            drawSection(mainCards,  `MAIN DECK (${mainCards.reduce((s,c)=>s+c.qty,0)})`,  '#3498db');
            drawSection(extraCards, `EXTRA DECK (${extraCards.reduce((s,c)=>s+c.qty,0)})`, '#9b59b6');
            if (sideCards.length)
                drawSection(sideCards, `SIDE DECK (${sideCards.reduce((s,c)=>s+c.qty,0)})`, '#7f8c8d');

            // ── Roles ──
            if (roleEntries.length) {
                ctx.fillStyle = '#2c3e50';
                ctx.font      = `bold ${18 * SCALE}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText('ROLES', PAD, y + 22 * SCALE);
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth   = 3 * SCALE;
                ctx.beginPath();
                ctx.moveTo(PAD, y + 30 * SCALE);
                ctx.lineTo(CANVAS_W - PAD, y + 30 * SCALE);
                ctx.stroke();
                y += SECTION_H + 6 * SCALE;

                const PILL_H   = 22 * SCALE;
                const PILL_PAD = 12 * SCALE;
                const PILL_GAP = 8 * SCALE;
                let rx = PAD;
                let ry = y;

                ctx.font = `bold ${9 * SCALE}px Arial`;
                roleEntries.forEach(([role, count]) => {
                    const label = `${role}: ${count}`;
                    const tw    = ctx.measureText(label).width;
                    const pw    = tw + PILL_PAD * 2;

                    if (rx + pw > CANVAS_W - PAD) { rx = PAD; ry += PILL_H + PILL_GAP; }

                    // Píldora
                    ctx.fillStyle = '#3498db';
                    const radius  = PILL_H / 2;
                    ctx.beginPath();
                    ctx.moveTo(rx + radius, ry);
                    ctx.lineTo(rx + pw - radius, ry);
                    ctx.arcTo(rx + pw, ry, rx + pw, ry + PILL_H, radius);
                    ctx.lineTo(rx + pw, ry + PILL_H - radius);
                    ctx.arcTo(rx + pw, ry + PILL_H, rx + pw - radius, ry + PILL_H, radius);
                    ctx.lineTo(rx + radius, ry + PILL_H);
                    ctx.arcTo(rx, ry + PILL_H, rx, ry + PILL_H - radius, radius);
                    ctx.lineTo(rx, ry + radius);
                    ctx.arcTo(rx, ry, rx + radius, ry, radius);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(label, rx + PILL_PAD, ry + PILL_H / 2 + 3 * SCALE);

                    rx += pw + PILL_GAP;
                });
            }

            // ── Descargar ──
            try {
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a   = document.createElement('a');
                    a.href     = url;
                    a.download = `${this.name.replace(/[^a-z0-9]/gi, '_')}_decklist.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    loadingMsg.remove();
                });
            } catch(e) {
                // Canvas taintado: reintentar en un canvas NUEVO sin imágenes
                // (reusar el mismo canvas no sirve, el taint es permanente).
                console.warn('Canvas taintado, descargando sin imágenes:', e);
                Object.keys(imgCache).forEach(k => { imgCache[k] = null; });

                const canvas2 = document.createElement('canvas');
                canvas2.width  = CANVAS_W;
                canvas2.height = canvasH;
                const ctx2 = canvas2.getContext('2d');
                ctx = ctx2; canvas = canvas2; // reasignar para reusar drawSection()

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                y = PAD;
                ctx.fillStyle = '#222222';
                ctx.font = `bold ${28 * SCALE}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(this.name, CANVAS_W / 2, y + 40 * SCALE);
                y += TITLE_H;
                drawSection(mainCards,  `MAIN DECK (${mainCards.reduce((s,c)=>s+c.qty,0)})`,  '#3498db');
                drawSection(extraCards, `EXTRA DECK (${extraCards.reduce((s,c)=>s+c.qty,0)})`, '#9b59b6');
                if (sideCards.length) drawSection(sideCards, `SIDE DECK (${sideCards.reduce((s,c)=>s+c.qty,0)})`, '#7f8c8d');
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a   = document.createElement('a');
                    a.href     = url;
                    a.download = `${this.name.replace(/[^a-z0-9]/gi, '_')}_decklist.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    loadingMsg.remove();
                });
            }

        } catch (error) {
            console.error('=== ERROR DECKLIST ===', error);
            console.error('Tipo:', error.constructor.name);
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            alert('❌ Error: ' + error.message + '\n\nRevisa la consola (F12).');
            loadingMsg.remove();
        }
    },

    generateDecklistHTML: function() {
        const mainCards = Object.entries(this.cards).filter(([_, c]) => c.location === 'main');
        const extraCards = Object.entries(this.cards).filter(([_, c]) => c.location === 'extra');
        const sideCards = Object.entries(this.cards).filter(([_, c]) => c.location === 'side');

        // Contar roles en Main Deck
        const rolesCount = {};
        mainCards.forEach(([_, item]) => {
            if (item.roles && item.roles.length > 0) {
                item.roles.forEach(role => {
                    rolesCount[role] = (rolesCount[role] || 0) + item.qty;
                });
            }
        });

        let html = `
            <div style="font-family: Arial, sans-serif; max-width: 1200px; padding: 20px;">
                <h1 style="text-align: center; margin-bottom: 30px; color: #333;">${this.name}</h1>
        `;

        if (mainCards.length > 0) {
            const mainCount = mainCards.reduce((sum, [_, c]) => sum + c.qty, 0);
            html += `
                <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">
                    MAIN DECK (${mainCount})
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; margin-bottom: 30px;">
            `;
            mainCards.forEach(([_, item]) => {
                html += this.generateCardHTML(item);
            });
            html += '</div>';
        }

        if (extraCards.length > 0) {
            const extraCount = extraCards.reduce((sum, [_, c]) => sum + c.qty, 0);
            html += `
                <h2 style="color: #2c3e50; border-bottom: 3px solid #9b59b6; padding-bottom: 10px;">
                    EXTRA DECK (${extraCount})
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; margin-bottom: 30px;">
            `;
            extraCards.forEach(([_, item]) => {
                html += this.generateCardHTML(item);
            });
            html += '</div>';
        }

        if (sideCards.length > 0) {
            const sideCount = sideCards.reduce((sum, [_, c]) => sum + c.qty, 0);
            html += `
                <h2 style="color: #2c3e50; border-bottom: 3px solid #95a5a6; padding-bottom: 10px;">
                    SIDE DECK (${sideCount})
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; margin-bottom: 30px;">
            `;
            sideCards.forEach(([_, item]) => {
                html += this.generateCardHTML(item);
            });
            html += '</div>';
        }

        if (Object.keys(rolesCount).length > 0) {
            html += `
                <h2 style="color: #2c3e50; border-bottom: 3px solid #e74c3c; padding-bottom: 10px;">
                    ROLES
                </h2>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
            `;
            Object.entries(rolesCount)
                .sort((a, b) => b[1] - a[1])
                .forEach(([role, count]) => {
                    html += `
                        <div style="background: #3498db; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold;">
                            ${role}: ${count}
                        </div>
                    `;
                });
            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    generateCardHTML: function(item) {
        const card = item.data;
        const imgUrl = card.card_images[0].image_url_small;
        
        return `
            <div style="text-align: center; position: relative;">
                <img src="${imgUrl}" crossorigin="anonymous"
                     style="width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                <div style="font-size: 11px; margin-top: 5px; font-weight: bold; color: #333;">
                    ${card.name}
                </div>
                <div style="position: absolute; top: 5px; right: 5px; background: rgba(255, 0, 0, 0.9); 
                            color: white; font-weight: bold; font-size: 18px; padding: 5px 10px; 
                            border-radius: 50%; min-width: 30px; text-align: center;">
                    x${item.qty}
                </div>
            </div>
        `;
    },
    // ── Vista de cartas por zona (solo lectura) ───────────────
_buildDeckViewPane: function (location) {
    const entries = Object.entries(this.cards).filter(([, c]) => c.location === location);
    if (!entries.length) return `<p class="stats-empty">Sin cartas en esta sección.</p>`;

    // Definir grupos según zona
    // Extra Deck y Side Deck: un solo grupo cada uno, alfabético puro.
    // Main Deck: subgrupos por tipo, en orden Ritual→Normal→Efecto→Péndulo→Mágicas→Trampas.
    let groups;
    if (location === 'extra') {
        groups = [
            { label: 'Extra Deck', test: () => true }
        ];
    } else if (location === 'side') {
        groups = [
            { label: 'Side Deck', test: () => true }
        ];
    } else {
        groups = [
            { label: 'Monstruos Rituales', test: t => t.includes('ritual') && !t.includes('pendulum') },
            { label: 'Monstruos Normales', test: t => t.includes('normal monster') && !t.includes('pendulum') },
            { label: 'Monstruos de Efecto',test: t => t.includes('monster') && !t.includes('normal monster') && !t.includes('ritual') && !t.includes('pendulum') && !t.includes('fusion') && !t.includes('synchro') && !t.includes('xyz') && !t.includes('link') },
            { label: 'Monstruos Péndulo',  test: t => t.includes('pendulum') },
            { label: 'Mágicas',            test: t => t.includes('spell') },
            { label: 'Trampas',            test: t => t.includes('trap') }
        ];
    }

    let html = '<div class="dv-pane">';

    groups.forEach(group => {
        const cards = entries
            .filter(([, c]) => group.test((c.data?.type || '').toLowerCase()))
            .sort(([, a], [, b]) => (a.data?.name || '').localeCompare(b.data?.name || ''));

        if (!cards.length) return;

        html += `<div class="dv-group-label">${group.label}</div>`;
        html += '<div class="tdp-cards-grid">';
        cards.forEach(([, item]) => {
            const img = item.data?.card_images?.[0]?.image_url_small || '';
            const qty = item.qty || 1;
            html += `
<div class="tdp-card">
    <img src="${img}" alt="${item.data?.name || ''}"
         onerror="this.style.opacity='0.3'">
    <span class="tdp-qty">x${qty}</span>
</div>`;
        });
        html += '</div>';
    });

    html += '</div>';
    return html;
},
};

window.Deck = Deck;
document.addEventListener('DOMContentLoaded', () => Deck.init());


// ── Combos — "Línea de Combos": registro de combos por deck guardado, vistos todos juntos en Mi Deck ──
// Etapa 1: infraestructura, Objetivo editable y lista global. El registro de
// pasos (HAND/GY/Banish/Field), Endboard, Poder, Choke Points, ramas y
// restricciones se agregan en etapas siguientes — ver plan acordado.

const Combos = {
    STORAGE_PREFIX:  'combos_',
    DEFAULT_OBJETIVO: 'Escribe aquí el objetivo del deck respondiendo a ¿Cuál estrategia emplea el deck con este combo? y ¿Cuál es el recurso que utiliza para realizarlo?',
    CARD_BACK: 'https://images.ygoprodeck.com/images/cards/back.jpg',
    
    _activeComboId: null,
    // Vista compacta/detallada por zona de Endboard: clave `${comboId}:${zone}`.
    // Solo en memoria (preferencia de sesión, no se persiste en el combo).
    _zoneCompact: {},

    // Índice de grupo para ordenar listas de cartas: Ritual→Normal→Efecto→
    // Péndulo→Mágicas→Trampas→Extra Deck→Side Deck (mismo orden del panel "Ver Deck").
    _typeGroupIndex: function (location, cardData) {
        if (location === 'extra') return 6;
        if (location === 'side')  return 7;
        const t = Deck.getMainDeckCardType ? Deck.getMainDeckCardType(cardData) : 2;
        return (t === 999) ? 2 : t;
    },

    // ── Persistencia (1 clave por deck: combos_${deckName}) ──────────
    getAll: function (deckName) {
        try {
            const raw = localStorage.getItem(`${this.STORAGE_PREFIX}${deckName}`);
            return raw ? (JSON.parse(raw) || []) : [];
        } catch (e) { return []; }
    },

    saveAll: function (deckName, combos) {
        localStorage.setItem(`${this.STORAGE_PREFIX}${deckName}`, JSON.stringify(combos));
        if (window.Deck) Deck.regenerateUid(deckName);
    },

    getAllAcrossDecks: function () {
        const result = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.STORAGE_PREFIX)) {
                try {
                    const combos = JSON.parse(localStorage.getItem(key)) || [];
                    combos.forEach(c => result.push(c));
                } catch (e) {}
            }
        }
        return result;
    },

    _findCombo: function (deckName, comboId) {
        return this.getAll(deckName).find(c => c.id === comboId) || null;
    },

    _updateCombo: function (deckName, comboId, patch) {
        const combos = this.getAll(deckName);
        const combo  = combos.find(c => c.id === comboId);
        if (!combo) return null;
        Object.assign(combo, patch);
        this.saveAll(deckName, combos);
        return combo;
    },

    // ── Crear / borrar combo ──────────────────────────────────────
    startNewCombo: function () {
        if (!Object.keys(Deck.cards || {}).length) {
            alert('Carga o construye un deck antes de registrar un combo.');
            return;
        }
        const deckName = Deck.name;
        const combos = this.getAll(deckName);
        const combo = {
            id:            'combo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            deckName:      deckName,
            objetivo:      '',
            status:        'draft',   // draft | started | finished — etapa 2 usa started/finished
            steps:         [],
            startCards:    [],
            endboard:      [],
            chokePoints:   [],
            restricciones: [],
            parentComboId: null,
            branchType:    null,   // 'choke' | 'variant' — solo en combos hijos (rama)
            branchStepId:  null,
            branchChokeId: null,
            power:         0,
            powerBeforeMeta: null,
            powerBreakdown: [],
            bossCardId:    null,
            starterCardId: null,
            manualStarterId: null, // override manual del Starter (ver setManualStarter)
            bossName:      null,
            starterName:   null,
            imageUrl:      null,
            imageUrlSmall: null,
            name:          '',
            comment:       '',
            createdAt:     Date.now()
        };
        combos.push(combo);
        this.saveAll(deckName, combos);
        this._activeComboId = combo.id;
        this._refresh();
    },

    confirmDeleteCombo: function (deckName, comboId) {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';
        overlay.innerHTML = `
            <div class="deck-modal deck-modal-warning">
                <h3>Borrar Combo</h3>
                <p class="deck-modal-note">¿Seguro que quieres borrar este combo? Se perderá todo su registro.</p>
                <div class="deck-modal-buttons">
                    <button class="btn-danger" onclick="Combos.deleteCombo('${deckName}','${comboId}');Deck.closeModal()">Sí, Borrar</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    deleteCombo: function (deckName, comboId) {
        const combos = this.getAll(deckName).filter(c => c.id !== comboId);
        this.saveAll(deckName, combos);
        if (this._activeComboId === comboId) this._activeComboId = null;
        this._refresh();
    },

    openCombo: function (deckName, comboId) {
        if (deckName !== Deck.name) {
            alert(`Este combo pertenece a "${deckName}". Cárgalo desde el panel de decks para poder editarlo.`);
            return;
        }
        this._activeComboId = comboId;
        this._refresh();
    },

    // ── Grabación: mazo restante, zonas y pasos ────────────────────
    _withCombo: function (deckName, comboId, mutator) {
        const combos = this.getAll(deckName);
        const combo  = combos.find(c => c.id === comboId);
        if (!combo) return null;
        mutator(combo);
        this.saveAll(deckName, combos);
        return combo;
    },

    _buildDeckPool: function () {
        const pool = [];
        Object.entries(Deck.cards).forEach(([id, item]) => {
            if (item.location !== 'main') return;
            for (let i = 0; i < item.qty; i++) pool.push({ uid: `${id}_${i}`, id });
        });
        return pool;
    },
_buildExtraPool: function () {
    const pool = [];
    Object.entries(Deck.cards).forEach(([id, item]) => {
        if (item.location !== 'extra') return;
        for (let i = 0; i < item.qty; i++) pool.push({ uid: `${id}_${i}`, id });
    });
    return pool;
},
    _logStep: function (combo, msg, cardId, meta) {
        if (!combo.steps) combo.steps = [];
        const step = {
            id:            'step_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
            msg:           msg,
            cardId:        cardId || null,
            time:          new Date().toLocaleTimeString('es-ES', { hour12: false }),
            // Foto de las zonas justo después de este paso — permite ramificar
            // (Etapa 6) reconstruyendo el estado exacto en ese punto. Pasos
            // grabados antes de esta actualización no tendrán este campo.
            zonesSnapshot: combo.zones ? JSON.parse(JSON.stringify(combo.zones)) : null
        };
        // kind/from/to: metadata estructurada para Estadísticas de Interacciones
        // (Robos/Invocaciones/Grinding/Recovery/Banish/Efectos). Pasos grabados
        // antes de esta actualización no tendrán estos campos y no contarán.
        if (meta) { step.kind = meta.kind; step.from = meta.from; step.to = meta.to; }
        combo.steps.push(step);
    },

  _zoneLabel: function (zone) {
        return { deckPool: 'Mazo', hand: 'HAND', gy: 'GY', banish: 'Banish', field: 'Field' }[zone] || zone;
    },
// Colorea HAND/GY/Banish/Field dentro del texto de un paso (solo en render,
    // el s.msg guardado sigue siendo texto plano — el export a .txt ya limpia HTML).
    _colorizeZones: function (msg) {
        const cls = { HAND: 'combo-zone-hand', GY: 'combo-zone-gy', Banish: 'combo-zone-banish', Field: 'combo-zone-field' };
        msg = msg.replace(/(^|:\s|→\s|\()(HAND|GY|Banish|Field)(?=\s|→|\)|$)/g,
            (m, pre, zone) => `${pre}<span class="combo-zone-tag ${cls[zone]}">${zone}</span>`);
        msg = msg.replace(/Activación de Efecto/g, '<span class="combo-effect-tag">Activación de Efecto</span>');
        return msg;
    },
    startCombo: function (deckName, comboId) {
        this._withCombo(deckName, comboId, combo => {
            combo.status      = 'started';
            combo.zones = { deckPool: this._buildDeckPool(), extraPool: this._buildExtraPool(), hand: [], gy: [], banish: [], field: [] };
            combo.steps         = [];
            combo.startCards    = [];
            combo.endboard      = [];
            combo.chokePoints   = [];
        });
        this._refresh();
    },
confirmResetZones: function (deckName, comboId) {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';
        overlay.innerHTML = `
            <div class="deck-modal deck-modal-warning">
                <h3>Reiniciar Zonas</h3>
                <p class="deck-modal-note">Esto borra HAND, Field, GY, Banish y todos los pasos registrados en este combo (el registro del combo en sí no se elimina). ¿Continuar?</p>
                <div class="deck-modal-buttons">
                    <button class="btn-danger" onclick="Combos.resetZones('${deckName}','${comboId}');Deck.closeModal()">Sí, Reiniciar</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    // "Borrar" las zonas/campo del combo que se está registrando — vacía todo
    // "Borrar" las zonas/campo del combo que se está registrando — vacía todo
    // y reinicia el mazo restante, pero NO elimina el registro del combo.
    resetZones: function (deckName, comboId) {
        this._withCombo(deckName, comboId, combo => {
            combo.zones      = { deckPool: this._buildDeckPool(), extraPool: this._buildExtraPool(), hand: [], gy: [], banish: [], field: [] };
            combo.steps      = [];
            combo.startCards = [];
            combo.endboard   = [];
            combo.chokePoints = [];
            combo.status     = 'started';
        });
        this._refresh();
    },

    drawCard: function (deckName, comboId) {
    this._withCombo(deckName, comboId, combo => {
        if (!combo.zones || !combo.zones.deckPool.length) return;
        const idx = Math.floor(Math.random() * combo.zones.deckPool.length);
        const [entry] = combo.zones.deckPool.splice(idx, 1);
        entry.faceDown = true; // robo aleatorio simulado: se revela al moverla/activarla
        combo.zones.hand.push(entry);
        this._logStep(combo, `🃏 Robas 1 carta`, null, { kind: 'draw', from: 'deckPool', to: 'hand' });
    });
    this._refresh();
},

    // Mueve una carta entre zonas (HAND/Field/GY/Banish) — cada movimiento es 1 paso.
    moveCard: function (deckName, comboId, uid, fromZone, toZone) {
        this._withCombo(deckName, comboId, combo => {
            if (!combo.zones) return;
            const fromArr = combo.zones[fromZone];
            const idx = fromArr.findIndex(c => c.uid === uid);
            if (idx === -1) return;

            // La mano "inicial" del combo se congela justo antes de jugar la
            // primera carta que sale de HAND (no al robar/armar la mano).
            if (fromZone === 'hand' && (!combo.startCards || !combo.startCards.length)) {
                combo.startCards = fromArr.map(c => c.id);
            }

            const [entry] = fromArr.splice(idx, 1);
            if (entry.faceDown) delete entry.faceDown; // se revela al moverla
            combo.zones[toZone].push(entry);

            const cardData = Deck.cards[entry.id]?.data;
            const name = cardData?.name || entry.id;
            this._logStep(combo, `${name}: ${this._zoneLabel(fromZone)} → ${this._zoneLabel(toZone)}`, entry.id, { kind: 'move', from: fromZone, to: toZone });
        });
        this._refresh();
    },
// Devuelve una carta de cualquier zona a su mazo de origen (Principal o
// Extra según location). Los Pendulum, sean del Main o del Extra Deck,
// regresan boca arriba al Extra Deck (regla real del juego).
sendToDeck: function (deckName, comboId, uid, fromZone) {
    this._withCombo(deckName, comboId, combo => {
        if (!combo.zones) return;
        const fromArr = combo.zones[fromZone];
        const idx = fromArr.findIndex(c => c.uid === uid);
        if (idx === -1) return;
        const [entry] = fromArr.splice(idx, 1);
        delete entry.faceDown;

        const cardData      = Deck.cards[entry.id]?.data;
        const item          = Deck.cards[entry.id];
        const isPendulum    = !!(cardData?.type && cardData.type.includes('Pendulum'));
        const pendulumFaceUp = isPendulum && fromZone === 'field';
        const toExtra       = pendulumFaceUp || (item && item.location === 'extra');
        const poolKey       = toExtra ? 'extraPool' : 'deckPool';
        if (!combo.zones[poolKey]) combo.zones[poolKey] = [];
        combo.zones[poolKey].push(entry);

        const name      = cardData?.name || entry.id;
        const destLabel = pendulumFaceUp ? 'boca arriba en el Extra Deck' : (toExtra ? 'Extra Deck' : 'Mazo');
        this._logStep(combo, `${name}: ${this._zoneLabel(fromZone)} → ${destLabel}`, entry.id, { kind: 'toDeck', from: fromZone, to: poolKey });
    });
    this._refresh();
},

// Registra la activación de efecto de una carta sin moverla de zona —
// solo deja constancia en el log de pasos para aclarar el combo.
activateEffect: function (deckName, comboId, uid, zoneKey) {
    this._withCombo(deckName, comboId, combo => {
        if (!combo.zones) return;
        const arr = combo.zones[zoneKey];
        const entry = arr && arr.find(c => c.uid === uid);
        if (!entry) return;
        if (entry.faceDown) delete entry.faceDown; // activar revela la carta

        const cardData = Deck.cards[entry.id]?.data;
        const name = cardData?.name || entry.id;
        this._logStep(combo, `✨ ${name}: Activación de Efecto (${this._zoneLabel(zoneKey)})`, entry.id, { kind: 'effect', from: zoneKey });
    });
    this._refresh();
},
    finishCombo: function (deckName, comboId) {
        this._withCombo(deckName, comboId, combo => {
            if (!combo.zones) return;
            combo.status = 'finished';
            const board  = [];
            ['field', 'hand', 'gy', 'banish'].forEach(zone => {
                (combo.zones[zone] || []).forEach(entry => {
                    board.push({
                        uid:          entry.uid,
                        id:           entry.id,
                        zone:         zone,
                        active:       zone === 'field', // el campo se cuenta activo por defecto; HAND/GY/Banish se marcan a mano
                        mainFunction: null,
                        dependsOn:    []
                    });
                });
            });
            combo.endboard   = board;
            combo.finishedAt = Date.now();
            this._recalcPower(combo);
        });
        this._refresh();
    },

    reopenCombo: function (deckName, comboId) {
        this._withCombo(deckName, comboId, combo => { combo.status = 'started'; });
        this._refresh();
    },
// ── Ramas / Variantes (Etapa 6) ─────────────────────────────────
    // Bifurca un combo existente desde un paso concreto: crea un combo hijo
    // (mismo deck) que arranca con el estado de zonas/pasos/chokes hasta ese
    // punto, y sigue grabándose de forma independiente desde ahí.
    branchCombo: function (deckName, parentComboId, stepId, branchType, chokePointId) {
        const parent = this._findCombo(deckName, parentComboId);
        if (!parent) return;
        const stepIdx = (parent.steps || []).findIndex(s => s.id === stepId);
        if (stepIdx === -1) return;
        const step = parent.steps[stepIdx];
        if (!step.zonesSnapshot) {
            alert('Este paso no tiene datos suficientes para ramificar (fue grabado antes de esta actualización).');
            return;
        }

        const combos = this.getAll(deckName);
        const child = {
            id:             'combo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            deckName:       deckName,
            objetivo:       parent.objetivo || '',
            status:         'started',
            steps:          JSON.parse(JSON.stringify(parent.steps.slice(0, stepIdx + 1))),
            zones:          JSON.parse(JSON.stringify(step.zonesSnapshot)),
            startCards:     [...(parent.startCards || [])],
            endboard:       [],
            chokePoints:    (parent.chokePoints || [])
                                .filter(cp => {
                                    const cpIdx = parent.steps.findIndex(s => s.id === cp.stepId);
                                    return cpIdx !== -1 && cpIdx <= stepIdx;
                                })
                                .map(cp => ({ ...cp })),
            restricciones:  (parent.restricciones || [])
                                .filter(r => {
                                    const rIdx = parent.steps.findIndex(s => s.id === r.stepId);
                                    return rIdx !== -1 && rIdx <= stepIdx;
                                })
                                .map(r => ({ ...r })),
            parentComboId:  parent.id,
            branchType:     branchType,
            branchStepId:   stepId,
            branchChokeId:  branchType === 'choke' ? chokePointId : null,
            power:          0,
            powerBeforeMeta: null,
            powerBreakdown: [],
            bossCardId:     null,
            starterCardId:  null,
            manualStarterId: null, // override manual del Starter (ver setManualStarter)
            bossName:       null,
            starterName:    null,
            imageUrl:       null,
            imageUrlSmall:  null,
            name:           '',
            comment:        '',
            createdAt:      Date.now()
        };
        combos.push(child);
        this.saveAll(deckName, combos);
        this._activeComboId = child.id;
        this._refresh();
    },
    viewCard: function (cardId) {
        const cardData = Deck.cards[cardId]?.data;
        if (!cardData) { alert('No se encontró la información de esta carta en el deck activo.'); return; }
        if (window.CardViewer && typeof CardViewer.open === 'function') CardViewer.open(cardData);
    },

    // Choke Points: la carta suele ser del meta, no del deck activo — se busca por ID.
    viewMetaCard: function (cardId) {
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}`)
            .then(r => r.json())
            .then(d => { if (d.data?.[0] && window.CardViewer) CardViewer.open(d.data[0]); })
            .catch(() => {});
    },
openDeckPicker: function (deckName, comboId) {
    document.getElementById('combo-deckpicker-overlay')?.remove();
    const combo = this._findCombo(deckName, comboId);
    if (!combo || !combo.zones) return;

    const grouped = {};
    (combo.zones.deckPool || []).forEach(entry => { grouped[entry.id] = (grouped[entry.id] || 0) + 1; });

    const rows = Object.keys(grouped).map(id => {
        const cardData = Deck.cards[id]?.data;
        const img  = cardData?.card_images?.[0]?.image_url_small || '';
        const name = cardData?.name || id;
        return `
        <div class="combo-picker-row">
            <img src="${img}" class="combo-picker-thumb" onclick="Combos.viewCard('${id}')">
            <div class="combo-picker-info">
                <div class="combo-picker-name">${this._escape(name)}</div>
                <div class="combo-picker-qty">x${grouped[id]} en el Mazo</div>
            </div>
            <div class="combo-picker-actions">
                <button onclick="Combos.sendFromPool('${deckName}','${comboId}','${id}','field','deckPool')">🏟️ Field</button>
                <button onclick="Combos.sendFromPool('${deckName}','${comboId}','${id}','hand','deckPool')">✋ Hand</button>
                <button onclick="Combos.sendFromPool('${deckName}','${comboId}','${id}','gy','deckPool')">⚰️ GY</button>
                <button onclick="Combos.sendFromPool('${deckName}','${comboId}','${id}','banish','deckPool')">🌀 Banish</button>
            </div>
        </div>`;
    }).join('') || '<p class="deck-empty">No quedan cartas en el Mazo.</p>';

    const overlay = document.createElement('div');
    overlay.id = 'combo-deckpicker-overlay';
    overlay.className = 'deck-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
        <div class="deck-modal combo-picker-modal">
            <h3>📖 Elegir carta del Mazo</h3>
            <div class="combo-picker-list">${rows}</div>
            <div class="deck-modal-buttons">
                <button onclick="document.getElementById('combo-deckpicker-overlay').remove()">Cerrar</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
},
    // ── Elegir carta del Extra Deck restante → HAND/Field/GY/Banish ─
openExtraPicker: function (deckName, comboId) {
    document.getElementById('combo-extrapicker-overlay')?.remove();
    const combo = this._findCombo(deckName, comboId);
    if (!combo || !combo.zones) return;

    const grouped = {};
    (combo.zones.extraPool || []).forEach(entry => { grouped[entry.id] = (grouped[entry.id] || 0) + 1; });

    const rows = Object.keys(grouped).map(id => {
        const cardData = Deck.cards[id]?.data;
        const img  = cardData?.card_images?.[0]?.image_url_small || '';
        const name = cardData?.name || id;
        return `
        <div class="combo-picker-row">
            <img src="${img}" class="combo-picker-thumb" onclick="Combos.viewCard('${id}')">
            <div class="combo-picker-info">
                <div class="combo-picker-name">${this._escape(name)}</div>
                <div class="combo-picker-qty">x${grouped[id]} en el Extra Deck</div>
            </div>
            <div class="combo-picker-actions">
                <button onclick="Combos.sendFromPool('${deckName}','${comboId}','${id}','field','extraPool')">🏟️ Field</button>
                <button onclick="Combos.sendFromPool('${deckName}','${comboId}','${id}','hand','extraPool')">✋ Hand</button>
                <button onclick="Combos.sendFromPool('${deckName}','${comboId}','${id}','gy','extraPool')">⚰️ GY</button>
                <button onclick="Combos.sendFromPool('${deckName}','${comboId}','${id}','banish','extraPool')">🌀 Banish</button>
            </div>
        </div>`;
    }).join('') || '<p class="deck-empty">No quedan cartas en el Extra Deck.</p>';

    const overlay = document.createElement('div');
    overlay.id = 'combo-extrapicker-overlay';
    overlay.className = 'deck-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
        <div class="deck-modal combo-picker-modal">
            <h3>🎴 Elegir carta del Extra Deck</h3>
            <div class="combo-picker-list">${rows}</div>
            <div class="deck-modal-buttons">
                <button onclick="document.getElementById('combo-extrapicker-overlay').remove()">Cerrar</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
},
    sendFromPool: function (deckName, comboId, cardId, toZone, fromPool) {
    fromPool = fromPool || 'deckPool';
    this._withCombo(deckName, comboId, combo => {
        if (!combo.zones || !combo.zones[fromPool]) return;
        const idx = combo.zones[fromPool].findIndex(c => c.id === cardId);
        if (idx === -1) return;
        const [entry] = combo.zones[fromPool].splice(idx, 1);
        combo.zones[toZone].push(entry);
        const cardData = Deck.cards[entry.id]?.data;
        const fromLabel = fromPool === 'extraPool' ? 'Extra Deck' : 'Mazo';
        this._logStep(combo, `${cardData?.name || entry.id}: ${fromLabel} → ${this._zoneLabel(toZone)}`, entry.id, { kind: 'fromPool', from: fromPool, to: toZone });
    });
    this._refresh();
    if (document.getElementById('combo-deckpicker-overlay')) this.openDeckPicker(deckName, comboId);
    if (document.getElementById('combo-extrapicker-overlay')) this.openExtraPicker(deckName, comboId);
},

    // ── Render de zonas y del log de pasos ─────────────────────────
    _renderZones: function (combo) {
        const zones = [['hand', '✋ HAND'], ['field', '🏟️ Field'], ['gy', '⚰️ GY'], ['banish', '🌀 Banish']];
        return `<div class="combo-zones-grid">
            ${zones.map(([key, label]) => `
            <div class="combo-zone-box">
                <h5 class="combo-zone-title">${label} (${(combo.zones[key] || []).length})</h5>
                <div class="combo-zone-cards">
                    ${(combo.zones[key] || []).length
                        ? combo.zones[key].map(entry => this._renderZoneCard(combo, key, entry)).join('')
                        : '<p class="combo-zone-empty">Vacío</p>'}
                </div>
            </div>`).join('')}
        </div>`;
    },

   _renderZoneCard: function (combo, zoneKey, entry) {
    const cardData    = Deck.cards[entry.id]?.data;
    const faceDown    = !!entry.faceDown;
    const img         = faceDown ? this.CARD_BACK : (cardData?.card_images?.[0]?.image_url_small || '');
    const name        = faceDown ? 'Carta boca abajo' : (cardData?.name || entry.id);
    const icons       = { hand: '✋', field: '🏟️', gy: '⚰️', banish: '🌀' };
    const targets     = ['hand', 'field', 'gy', 'banish'].filter(z => z !== zoneKey);
    const item        = Deck.cards[entry.id];
    const isPendulum     = !faceDown && !!(cardData?.type && cardData.type.includes('Pendulum'));
    const pendulumFaceUp = isPendulum && zoneKey === 'field';
    const toExtra        = pendulumFaceUp || (item && item.location === 'extra');
    const toDeckTitle    = pendulumFaceUp ? '→ boca arriba en el Extra Deck' : (toExtra ? '→ Extra Deck' : '→ Mazo');

    return `
    <div class="combo-card-chip">
        <img src="${img}" class="combo-card-thumb ${faceDown ? 'combo-card-facedown' : ''}" alt="${name}" title="${name}"
            ${faceDown ? '' : `onclick="Combos.viewCard('${entry.id}')"`}>
        <div class="combo-card-actions">
            ${targets.map(t => `<button class="combo-card-move-btn" title="→ ${this._zoneLabel(t)}"
                onclick="Combos.moveCard('${combo.deckName}','${combo.id}','${entry.uid}','${zoneKey}','${t}')">${icons[t]}</button>`).join('')}
            <button class="combo-card-move-btn combo-card-effect-btn" title="Activación de Efecto"
                onclick="Combos.activateEffect('${combo.deckName}','${combo.id}','${entry.uid}','${zoneKey}')">✨</button>
            <button class="combo-card-move-btn combo-card-todeck-btn" title="${toDeckTitle}"
                onclick="Combos.sendToDeck('${combo.deckName}','${combo.id}','${entry.uid}','${zoneKey}')">↩️</button>
        </div>
    </div>`;
},

    _renderSteps: function (combo) {
        const steps = combo.steps || [];
        if (!steps.length) return '<p class="deck-empty">Aún no hay pasos registrados.</p>';
        return steps.map((s, i) => {
            const cardName = s.cardId ? (Deck.cards[s.cardId]?.data?.name || null) : null;
        const cardImg  = s.cardId ? (Deck.cards[s.cardId]?.data?.card_images?.[0]?.image_url_small || null) : null;
        let msg = s.msg;
        if (cardName) {
            const idx = msg.indexOf(cardName);
            if (idx !== -1) {
                const before = msg.slice(0, idx);
                const after  = msg.slice(idx + cardName.length);
                const thumb  = cardImg ? `<img src="${cardImg}" class="combo-step-thumb" alt="" onclick="Combos.viewCard('${s.cardId}')">` : '';
                msg = `${before}${thumb}<span class="combo-step-cardname" onclick="Combos.viewCard('${s.cardId}')">${cardName}</span>${after}`;
            }
        }
        msg = this._colorizeZones(msg);
            const chokes = (combo.chokePoints || []).filter(cp => cp.stepId === s.id);
            const chokeChips = chokes.map(cp => `
                <span class="combo-choke-chip">
                    🚧 <img src="${cp.metaCardImg}" class="combo-choke-chip-img" alt="${this._escape(cp.metaCardName)}"
                        title="${this._escape(cp.metaCardName)}" onclick="Combos.viewMetaCard('${cp.metaCardId}')">
                    <select class="combo-choke-freq-sel" onchange="Combos.setChokeFrequency('${combo.deckName}','${combo.id}','${cp.id}', this.value)">
                        ${Object.keys(this.CHOKE_FREQ).map(k => `<option value="${k}" ${cp.frequency === k ? 'selected' : ''}>${this.CHOKE_FREQ[k].label}</option>`).join('')}
                    </select>
                    <button class="combo-branch-choke-btn" onclick="Combos.branchCombo('${combo.deckName}','${combo.id}','${cp.stepId}','choke','${cp.id}')" title="Ramificar: combo interrumpido aquí">🔀</button>
                    <button class="combo-choke-remove-btn" onclick="Combos.removeChokePoint('${combo.deckName}','${combo.id}','${cp.id}')">✖</button>
                </span>`).join('');
            const restrictions = (combo.restricciones || []).filter(r => r.stepId === s.id);
            const restrictionChips = restrictions.map(r => `
                <span class="combo-restriction-chip">
                    🔒 ${this._escape(r.text)}
                    <select class="combo-restriction-sev-sel" onchange="Combos.setRestrictionSeverity('${combo.deckName}','${combo.id}','${r.id}', this.value)">
                        ${Object.keys(this.RESTRICTION_SEV).map(k => `<option value="${k}" ${r.severity === k ? 'selected' : ''}>${this.RESTRICTION_SEV[k].label}</option>`).join('')}
                    </select>
                    <button class="combo-restriction-remove-btn" onclick="Combos.removeRestriction('${combo.deckName}','${combo.id}','${r.id}')">✖</button>
                </span>`).join('');
            return `<div class="combo-step-row">
                <span class="combo-step-idx">${i + 1}</span>
                <span class="combo-step-time">${s.time}</span>
                <span class="combo-step-msg">${msg}</span>
                <button class="combo-choke-add-btn" onclick="Combos.openChokePicker('${combo.deckName}','${combo.id}','${s.id}')" title="Marcar Choke Point">🚧</button>
                <button class="combo-restriction-add-btn" onclick="Combos.openRestrictionModal('${combo.deckName}','${combo.id}','${s.id}')" title="Marcar Restricción desde aquí">🔒</button>
                <button class="combo-branch-step-btn" onclick="Combos.branchCombo('${combo.deckName}','${combo.id}','${s.id}','variant', null)" title="Crear variante desde este paso">🔀</button>
                <button class="combo-step-delete-btn" onclick="Combos.confirmDeleteStepsFrom('${combo.deckName}','${combo.id}','${s.id}', ${i + 1})" title="Borrar desde este paso en adelante">🗑️</button>
                ${chokeChips}
                ${restrictionChips}
            </div>`;
        }).join('');
    },

// ── Cálculo de Poder (Etapa 4) ──────────────────────────────────
    POWER_CFG: {
        depPenaltyPerDep:           0.15,
        depPenaltyFloor:            0.35,
        depBonusPerDependent:       0.10,
        depBonusCap:                0.40,
        stepPenaltyPerStep:         0.015,
        stepPenaltyFloor:           0.5,
        starterDistPenaltyPerStep:  0.05,
        starterDistFloor:           0.3,
      starterHandPenaltyPerExtra: 0.08, // el Starter pierde 8% por cada carta extra en la mano inicial
        starterHandFloor:           0.3,
        noFunctionValue:            1,    // valor de una carta activa sin función principal asignada
        chokeFloor:                 0.15, // el impacto acumulado de Choke Points nunca baja el poder de este piso
        restrictionFloor:           0.55  // piso del multiplicador acumulado de Restricciones, por carta afectada
    },

    CHOKE_FREQ: {
        baja:  { label: 'Baja (nicho)',             impact: 0.05 },
        media: { label: 'Media (rotativa/side)',    impact: 0.12 },
        alta:  { label: 'Alta (staple del formato)', impact: 0.22 },
        tier1: { label: 'Tier 1 (omnipresente)',     impact: 0.35 }
    },
// Restricciones de turno/efecto (Etapa 7) — impacto menor que un Choke Point:
    // no interrumpen el combo, solo limitan lo que se puede hacer de ahí en adelante.
    RESTRICTION_SEV: {
        leve:   { label: 'Leve (cosmético)',        impact: 0.04 },
        media:  { label: 'Media (limita opciones)', impact: 0.09 },
        severa: { label: 'Severa (cierra líneas)',   impact: 0.16 }
    },

    
//    _chokeSearchResults: [],

    _bossRoles: ['Boss Monster', 'Tower'],

    _getRoleBasePower: function (role) {
        if (!role) return this.POWER_CFG.noFunctionValue;
        if (window.ConfigManager && typeof ConfigManager.getRoleBasePower === 'function') {
            const v = ConfigManager.getRoleBasePower(role);
            if (typeof v === 'number' && !isNaN(v)) return v;
        }
        return 3;
    },

    _stepIndexForCardId: function (combo, cardId) {
        const steps = combo.steps || [];
        for (let i = 0; i < steps.length; i++) if (steps[i].cardId === cardId) return i;
        return -1;
    },
_stepIndex: function (combo, stepId) {
        return (combo.steps || []).findIndex(s => s.id === stepId);
    },

    // Restricciones vigentes en o antes del paso donde entró esta carta al
    // endboard — ya estaban activas cuando se llegó a esa pieza, así que su
    // valor de follow up baja un poco.
    _restrictionMultiplierForEntry: function (combo, entry) {
        const restrictions = combo.restricciones || [];
        if (!restrictions.length) return 1;
        const entryStepIdx = this._stepIndexForCardId(combo, entry.id);
        if (entryStepIdx === -1) return 1;
        let mult = 1;
        restrictions.forEach(r => {
            const rIdx = this._stepIndex(combo, r.stepId);
            if (rIdx !== -1 && rIdx <= entryStepIdx) {
                const impact = (this.RESTRICTION_SEV[r.severity] || this.RESTRICTION_SEV.media).impact;
                mult *= (1 - impact);
            }
        });
        return Math.max(this.POWER_CFG.restrictionFloor, mult);
    },
    _recalcPower: function (combo) {
        const endboard = combo.endboard || [];
        const activeEntries = endboard.filter(e => e.active);

        const dependentsCount = {};
        endboard.forEach(e => (e.dependsOn || []).forEach(depUid => {
            dependentsCount[depUid] = (dependentsCount[depUid] || 0) + 1;
        }));

        const totalSteps    = (combo.steps || []).length;
        const startHandSize = (combo.startCards || []).length;

        const breakdown = activeEntries.map(entry => {
            const cardData = Deck.cards[entry.id]?.data;
            const name = cardData?.name || entry.id;
            const role = entry.mainFunction || null;
            let value  = this._getRoleBasePower(role);

            const depCount   = (entry.dependsOn || []).length;
            const depPenalty = Math.max(this.POWER_CFG.depPenaltyFloor, 1 - this.POWER_CFG.depPenaltyPerDep * depCount);
            const depBonus   = 1 + Math.min(this.POWER_CFG.depBonusCap, this.POWER_CFG.depBonusPerDependent * (dependentsCount[entry.uid] || 0));
            value *= depPenalty * depBonus;

            if (role === 'Starter') {
                const stepIdx   = this._stepIndexForCardId(combo, entry.id);
                const distSteps = stepIdx === -1 ? totalSteps : Math.max(0, totalSteps - stepIdx - 1);
                const distMult  = Math.max(this.POWER_CFG.starterDistFloor, 1 - this.POWER_CFG.starterDistPenaltyPerStep * distSteps);
                const extraHand = Math.max(0, startHandSize - 1);
                const handMult  = Math.max(this.POWER_CFG.starterHandFloor, 1 - this.POWER_CFG.starterHandPenaltyPerExtra * extraHand);
                value *= distMult * handMult;
            }

            value *= this._restrictionMultiplierForEntry(combo, entry);

            return { uid: entry.uid, id: entry.id, name, role, zone: entry.zone, value: Math.round(value * 100) / 100 };
        });

        const totalBeforeSteps = breakdown.reduce((sum, b) => sum + b.value, 0);
        const stepsMult = Math.max(this.POWER_CFG.stepPenaltyFloor, 1 - this.POWER_CFG.stepPenaltyPerStep * totalSteps);
        const total = Math.round(totalBeforeSteps * stepsMult * 100) / 100;

        breakdown.sort((a, b) => b.value - a.value);

        // "Boss" = la carta activa de mayor puntaje (breakdown ya viene ordenado
        // desc) — ya no se prioriza el rol Boss Monster/Tower sobre el puntaje
        // real, así el nombre del combo refleja la pieza más fuerte de verdad.
        const bossEntry  = breakdown[0] || null;
        const startCards = combo.startCards || [];
        const autoStarterId = startCards.find(id => {
            const item = Deck.cards[id];
            if (!item) return false;
            if ((item.roles || []).includes('Starter')) return true;
            // Cuenta también si esta carta es "copia de" un Starter (ver #4).
            return (item.copyOf || []).some(cid => (Deck.cards[cid]?.roles || []).includes('Starter'));
        }) || startCards[0] || null;
        const starterId = combo.manualStarterId || autoStarterId;

        const bossData    = bossEntry ? Deck.cards[bossEntry.id]?.data : null;
        const starterData = starterId ? Deck.cards[starterId]?.data : null;
        const bossName    = bossEntry ? (bossData?.name || bossEntry.id) : null;
        const starterName = starterId ? (starterData?.name || starterId) : null;
        const repData     = bossData || starterData || null; // carta representativa para thumbnail

        const chokeMult = this._computeChokeMultiplier(combo);

        combo.powerBeforeMeta = total;
        combo.power           = Math.round(total * chokeMult * 100) / 100;
        combo.powerBreakdown  = breakdown;
        combo.bossCardId      = bossEntry ? bossEntry.id : null;
        combo.starterCardId   = starterId;
        combo.bossName        = bossName;
        combo.starterName     = starterName;
        combo.imageUrl        = repData?.card_images?.[0]?.image_url || null;
        combo.imageUrlSmall   = repData?.card_images?.[0]?.image_url_small || null;

        // Nombre = carta de mayor puntaje, o el Starter si no hay ninguna carta
        // activa puntuando, + el # de combo registrado para este deck.
        const topName = bossName || starterName || null;
        if (topName) {
            combo.name = `${topName} #${this._comboSeq(combo)}`;
        }
    },

    // Número de creación del combo dentro del deck (1, 2, 3...) — fijo, no
    // depende del puntaje ni del orden en pantalla. Sirve para identificar
    // el combo aunque todavía no tenga nombre o cambie de "carta top".
    _comboSeq: function (combo) {
        const deckCombos = this.getAll(combo.deckName).slice().sort((a, b) => a.createdAt - b.createdAt);
        return Math.max(1, deckCombos.findIndex(c => c.id === combo.id) + 1);
    },

    // Cada Choke Point marcado descuenta % del poder según su frecuencia; se
    // acumulan multiplicativamente (varios chokes = combo más frágil), con piso.
    _computeChokeMultiplier: function (combo) {
        const points = combo.chokePoints || [];
        if (!points.length) return 1;
        let mult = 1;
        points.forEach(cp => {
            const impact = (this.CHOKE_FREQ[cp.frequency] || this.CHOKE_FREQ.media).impact;
            mult *= (1 - impact);
        });
        return Math.max(this.POWER_CFG.chokeFloor, mult);
    },

    // ── Meta y Choke Points (Etapa 5) ────────────────────────────────
    // Buscador compartido con Zona de Práctica (filtros avanzados, chips,
    // tope de 100 resultados) + acceso rápido a Engines/Favoritas del usuario.
    openChokePicker: function (deckName, comboId, stepId) {
        document.getElementById('combo-choke-overlay')?.remove();
        this._chokePickerCtx = { deckName, comboId, stepId };
        const overlay = document.createElement('div');
        overlay.id = 'combo-choke-overlay';
        overlay.className = 'deck-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="deck-modal combo-choke-modal">
                <h3>🚧 Marcar Choke Point</h3>
                <p class="deck-modal-note">Busca la carta del meta que interrumpe este paso del combo, o elígela desde tus Engines/Favoritas.</p>
                <div class="combo-choke-picker-btns">
                    <button class="combo-choke-picker-btn" onclick="Combos._openChokeSearch()">🔍 Buscar Carta</button>
                    <button class="combo-choke-picker-btn" onclick="Combos._openChokeGroupPicker()">📁 Desde Engine / Favoritas</button>
                </div>
                <div class="deck-modal-buttons">
                    <button onclick="document.getElementById('combo-choke-overlay').remove()">Cerrar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    _openChokeSearch: function () {
        if (!window.ZonaPractica) { alert('Buscador no disponible.'); return; }
        this._prevChokeAddSearch = ZonaPractica._addSearchCard.bind(ZonaPractica);
        ZonaPractica._addSearchCard = (index) => {
            const card = ZonaPractica._lastSearchResults[index];
            if (!card) return;
            this._addChokePointCard(card);
            const btns = document.querySelectorAll('#pz-search-results .pz-search-add-btn');
            const btn  = btns[index];
            if (btn) {
                const orig = btn.textContent;
                btn.textContent = '✓';
                btn.disabled = true;
                setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 900);
            }
        };
        ZonaPractica.openCardSearch();
        const restore = () => { if (this._prevChokeAddSearch) ZonaPractica._addSearchCard = this._prevChokeAddSearch; };
        const observer = new MutationObserver((muts, obs) => {
            if (!document.getElementById('pz-search-overlay')) { restore(); obs.disconnect(); }
        });
        observer.observe(document.body, { childList: true });
    },

    _openChokeGroupPicker: function () {
        document.getElementById('combo-choke-group-overlay')?.remove();
        const engines = window.Engines ? Engines.getAll() : [];
        const favs    = window.Favoritas ? Favoritas.getAll() : {};

        const engineCards = {};
        engines.forEach(e => Object.entries(e.cards || {}).forEach(([id, item]) => {
            if (!engineCards[id] && item.data) engineCards[id] = item.data;
        }));
        const favCards = {};
        Object.entries(favs).forEach(([id, f]) => {
            favCards[id] = f.data || { id: f.id, name: f.name, type: f.type, card_images: [{ image_url_small: f.img }] };
        });
        this._chokeGroupCards = { ...engineCards, ...favCards };

        const renderGroup = (title, cardsObj) => {
            const entries = Object.values(cardsObj);
            if (!entries.length) return `<p class="deck-empty">Sin cartas en ${title}.</p>`;
            return `<div class="combo-choke-group-title">${title}</div>` + entries.map(c => `
                <div class="combo-choke-result-row">
                    <img src="${c.card_images?.[0]?.image_url_small || ''}" class="combo-picker-thumb">
                    <span class="combo-picker-name">${this._escape(c.name)}</span>
                    <button onclick="Combos._pickChokeFromGroup('${c.id}')">＋ Elegir</button>
                </div>`).join('');
        };

        const overlay = document.createElement('div');
        overlay.id = 'combo-choke-group-overlay';
        overlay.className = 'deck-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="deck-modal combo-choke-modal">
                <h3>📁 Elegir desde Engine / Favoritas</h3>
                <div class="combo-choke-results">
                    ${renderGroup('⚙️ Engines', engineCards)}
                    ${renderGroup('⭐ Favoritas', favCards)}
                </div>
                <div class="deck-modal-buttons">
                    <button onclick="document.getElementById('combo-choke-group-overlay').remove()">Cerrar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    _pickChokeFromGroup: function (cardId) {
        const card = this._chokeGroupCards?.[cardId];
        if (!card) return;
        this._addChokePointCard(card);
        document.getElementById('combo-choke-group-overlay')?.remove();
    },

    _addChokePointCard: function (card) {
        const ctx = this._chokePickerCtx;
        if (!ctx || !card) return;
        this._withCombo(ctx.deckName, ctx.comboId, combo => {
            if (!combo.chokePoints) combo.chokePoints = [];
            combo.chokePoints.push({
                id:           'choke_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
                stepId:       ctx.stepId,
                metaCardId:   card.id,
                metaCardName: card.name,
                metaCardImg:  card.card_images?.[0]?.image_url_small || '',
                frequency:    'media',
                createdAt:    Date.now()
            });
            this._recalcPower(combo);
        });
        document.getElementById('combo-choke-overlay')?.remove();
        this._refresh();
    },

    setChokeFrequency: function (deckName, comboId, chokeId, freq) {
        this._withCombo(deckName, comboId, combo => {
            const cp = (combo.chokePoints || []).find(c => c.id === chokeId);
            if (cp) cp.frequency = freq;
            this._recalcPower(combo);
        });
        this._refresh();
    },

    removeChokePoint: function (deckName, comboId, chokeId) {
        this._withCombo(deckName, comboId, combo => {
            combo.chokePoints = (combo.chokePoints || []).filter(c => c.id !== chokeId);
            this._recalcPower(combo);
        });
        this._refresh();
    },

    // ── Restricciones por paso (Etapa 7) ────────────────────────────
    // Limitación real de esta línea del combo (ej. "No Special Summon excepto
    // Dragón el resto del turno"), vigente desde ese paso en adelante. Solo
    // penaliza piezas del endboard armadas en o después de ese punto.
    openRestrictionModal: function (deckName, comboId, stepId) {
        document.getElementById('combo-restriction-overlay')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'combo-restriction-overlay';
        overlay.className = 'deck-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="deck-modal combo-restriction-modal">
                <h3>🔒 Marcar Restricción</h3>
                <p class="deck-modal-note">Describe la restricción activada en este paso. Afecta el valor de las piezas armadas de aquí en adelante.</p>
                <textarea id="combo-restriction-input" class="combo-restriction-textarea"
                    placeholder="Ej: No puedes Special Summon monstruos excepto de Tipo Dragón por el resto de este turno"></textarea>
                <div class="combo-restriction-sev-row">
                    <label>Severidad:</label>
                    <select id="combo-restriction-sev-sel">
                        ${Object.keys(this.RESTRICTION_SEV).map(k => `<option value="${k}" ${k === 'media' ? 'selected' : ''}>${this.RESTRICTION_SEV[k].label}</option>`).join('')}
                    </select>
                </div>
                <div class="deck-modal-buttons">
                    <button class="opt-submit-btn" onclick="Combos.addRestriction('${deckName}','${comboId}','${stepId}')">💾 Guardar</button>
                    <button onclick="document.getElementById('combo-restriction-overlay').remove()">Cancelar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    addRestriction: function (deckName, comboId, stepId) {
        const textEl = document.getElementById('combo-restriction-input');
        const sevEl  = document.getElementById('combo-restriction-sev-sel');
        const text = textEl ? textEl.value.trim() : '';
        if (!text) { alert('Escribe una descripción para la restricción.'); return; }
        const severity = sevEl ? sevEl.value : 'media';
        this._withCombo(deckName, comboId, combo => {
            if (!combo.restricciones) combo.restricciones = [];
            combo.restricciones.push({
                id:       'restr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
                stepId:   stepId,
                text:     text,
                severity: severity
            });
            this._recalcPower(combo);
        });
        document.getElementById('combo-restriction-overlay')?.remove();
        this._refresh();
    },

    setRestrictionSeverity: function (deckName, comboId, restrId, severity) {
        this._withCombo(deckName, comboId, combo => {
            const r = (combo.restricciones || []).find(x => x.id === restrId);
            if (r) r.severity = severity;
            this._recalcPower(combo);
        });
        this._refresh();
    },

    removeRestriction: function (deckName, comboId, restrId) {
        this._withCombo(deckName, comboId, combo => {
            combo.restricciones = (combo.restricciones || []).filter(r => r.id !== restrId);
            this._recalcPower(combo);
        });
        this._refresh();
    },

    // ── Endboard: cartas activas para follow up, función principal y dependencias ──
    // Field arranca activa por defecto (está en juego); HAND/GY/Banish se marcan
    // a mano — no todo lo que quedó ahí aporta valor real de follow up.
    // Todas las funciones/roles definidos por el usuario en Config → Mecánicas y
    // Roles — no solo los que el sistema detectó automáticamente en esta carta.
    _roleOptionsForCard: function (id) {
        if (window.ConfigManager && typeof ConfigManager.getRoleNames === 'function') {
            const names = ConfigManager.getRoleNames();
            if (names.length) return names;
        }
        // Fallback si no hay roles configurados en el sistema
        return [
            'Starter', 'Extender', 'Handtrap', 'Boardbreaker', 'Disruptor', 'Removal',
            'Negate-activation', 'Negate-effect', 'Boss Monster', 'Tower',
            'Searcher', 'Recycler', 'Protector', 'Otro'
        ];
    },

    // Alterna vista lista/detallada de una zona del Endboard (Field/HAND/GY/Banish).
    // Preferencia solo visual, no dispara recálculo de poder.
    toggleZoneView: function (comboId, zone) {
        const key = `${comboId}:${zone}`;
        this._zoneCompact[key] = !this._zoneCompact[key];
        this._refresh();
    },

    toggleEndboardActive: function (deckName, comboId, uid) {
        this._withCombo(deckName, comboId, combo => {
            const entry = combo.endboard?.find(e => e.uid === uid);
            if (entry) entry.active = !entry.active;
            this._recalcPower(combo);
        });
        this._refresh();
    },

    setEndboardFunction: function (deckName, comboId, uid, role) {
        this._withCombo(deckName, comboId, combo => {
            const entry = combo.endboard?.find(e => e.uid === uid);
            if (entry) entry.mainFunction = role || null;
            this._recalcPower(combo);
        });
        this._refresh();
    },
// Fija manualmente cuál carta del Endboard es el Starter de este combo,
    // por encima de la detección automática. Click de nuevo la desmarca.
    setManualStarter: function (deckName, comboId, cardId) {
        this._withCombo(deckName, comboId, combo => {
            combo.manualStarterId = (combo.manualStarterId === cardId) ? null : cardId;
            this._recalcPower(combo);
        });
        this._refresh();
    },
    openDependencyPicker: function (deckName, comboId, uid) {
        document.getElementById('combo-deps-overlay')?.remove();
        const combo = this._findCombo(deckName, comboId);
        const entry = combo?.endboard?.find(e => e.uid === uid);
        if (!combo || !entry) return;

        const others = combo.endboard.filter(e => e.uid !== uid).sort((a, b) => {
            const dataA = Deck.cards[a.id]?.data, dataB = Deck.cards[b.id]?.data;
            const gA = this._typeGroupIndex(Deck.cards[a.id]?.location, dataA);
            const gB = this._typeGroupIndex(Deck.cards[b.id]?.location, dataB);
            if (gA !== gB) return gA - gB;
            return (dataA?.name || '').localeCompare(dataB?.name || '');
        });
        const rows = others.map(o => {
            const name    = Deck.cards[o.id]?.data?.name || o.id;
            const img     = Deck.cards[o.id]?.data?.card_images?.[0]?.image_url_small || '';
            const checked = (entry.dependsOn || []).includes(o.uid);
            return `<label class="combo-deps-row">
                <input type="checkbox" value="${o.uid}" ${checked ? 'checked' : ''}>
                ${img ? `<img src="${img}" class="combo-deps-thumb" alt="">` : ''}
                <span>${this._escape(name)} <small>(${this._zoneLabel(o.zone)})</small></span>
            </label>`;
        }).join('') || '<p class="deck-empty">No hay otras cartas en el endboard.</p>';

        const overlay = document.createElement('div');
        overlay.id = 'combo-deps-overlay';
        overlay.className = 'deck-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="deck-modal combo-deps-modal">
                <h3>🔗 Dependencias</h3>
                <p class="deck-modal-note">Marca de qué cartas depende esta pieza para conservar su valor. Si pierdes esas cartas, esta ya no vale nada.</p>
                <div class="combo-deps-list" id="combo-deps-list">${rows}</div>
                <div class="deck-modal-buttons">
                    <button onclick="Combos.saveDependencies('${deckName}','${comboId}','${uid}')">💾 Guardar</button>
                    <button onclick="document.getElementById('combo-deps-overlay').remove()">Cancelar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    saveDependencies: function (deckName, comboId, uid) {
        const checked = Array.from(document.querySelectorAll('#combo-deps-list input[type=checkbox]:checked')).map(cb => cb.value);
        this._withCombo(deckName, comboId, combo => {
            const entry = combo.endboard?.find(e => e.uid === uid);
            if (entry) entry.dependsOn = checked;
            this._recalcPower(combo);
        });
        document.getElementById('combo-deps-overlay')?.remove();
        this._refresh();
    },
// Marca una carta del deck como "copia de" otra: sus copias sumarán al
    // calcular Consistencia del Starter y la detección de Starter (#4).
    openCopyOfPicker: function (deckName, comboId, cardId) {
        document.getElementById('combo-copyof-overlay')?.remove();
        const item = Deck.cards[cardId];
        if (!item) return;
        const selected = new Set(item.copyOf || []);

        const others = Object.entries(Deck.cards)
            .filter(([id, c]) => id !== cardId && (c.location === 'main' || c.location === 'extra'))
            .sort(([, a], [, b]) => {
                const gA = this._typeGroupIndex(a.location, a.data);
                const gB = this._typeGroupIndex(b.location, b.data);
                if (gA !== gB) return gA - gB;
                return (a.data?.name || '').localeCompare(b.data?.name || '');
            });
        const rows = others.map(([id, c]) => {
            const name = c.data?.name || id;
            const img  = c.data?.card_images?.[0]?.image_url_small || '';
            const tag  = c.location === 'extra' ? ' <small>(Extra)</small>' : '';
            return `<label class="combo-deps-row">
                <input type="checkbox" name="combo-copyof-check" value="${id}" ${selected.has(id) ? 'checked' : ''}>
                ${img ? `<img src="${img}" class="combo-deps-thumb" alt="">` : ''}
                <span>${this._escape(name)}${tag}</span>
            </label>`;
        }).join('') || '<p class="deck-empty">No hay otras cartas en el Main/Extra Deck.</p>';

        const overlay = document.createElement('div');
        overlay.id = 'combo-copyof-overlay';
        overlay.className = 'deck-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
            <div class="deck-modal combo-deps-modal">
                <h3>🧩 Marcar como copia de...</h3>
                <p class="deck-modal-note">Si esta carta funciona como copia extra de otra (buscador dedicado, sustituto funcional), sus copias sumarán en la Consistencia del Starter y en su detección automática. Puedes marcar varias — por ejemplo, una carta que reemplaza el uso de dos piezas distintas.</p>
                <div class="combo-deps-list" id="combo-copyof-list">
                    ${rows}
                </div>
                <div class="deck-modal-buttons">
                    <button onclick="Combos.saveCopyOf('${deckName}','${comboId}','${cardId}')">💾 Guardar</button>
                    <button onclick="document.getElementById('combo-copyof-overlay').remove()">Cancelar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    saveCopyOf: function (deckName, comboId, cardId) {
        const item = Deck.cards[cardId];
        if (!item) return;
        const checked = Array.from(document.querySelectorAll('#combo-copyof-list input[name="combo-copyof-check"]:checked')).map(cb => cb.value);

        const newSet = new Set(checked);
        const oldSet = new Set(item.copyOf || []);

        // Relación simétrica: si A queda marcada como copia de B, B también
        // marca a A como copia suya (y viceversa al desmarcar) — sin tener
        // que repetir la operación carta por carta.
        Object.entries(Deck.cards).forEach(([id, c]) => {
            if (id === cardId) return;
            const isNowSelected = newSet.has(id);
            const wasSelected   = oldSet.has(id);
            if (isNowSelected === wasSelected) return;
            c.copyOf = c.copyOf || [];
            if (isNowSelected) {
                if (!c.copyOf.includes(cardId)) c.copyOf.push(cardId);
            } else {
                c.copyOf = c.copyOf.filter(id2 => id2 !== cardId);
            }
        });

        item.copyOf = checked;
        document.getElementById('combo-copyof-overlay')?.remove();
        this._recalcPower(this._findCombo(deckName, comboId));
        this.saveAll(deckName, this.getAll(deckName)); // persiste starterCardId/power recalculado
        this._refresh();
    },
    // ── Estadísticas de Interacciones: automáticas (por zona/tipo de paso) + manuales ──
    _computeAutoInteractions: function (combo) {
        const st = { robos:0, invocaciones:0, grinding:0, recovery:0, banish:0,
                     efectosMano:0, efectosCampo:0, efectosGY:0, efectosBanish:0 };
        (combo.steps || []).forEach(s => {
            if (!s.kind) return; // paso viejo sin metadata — no contribuye
            if (s.kind === 'draw') { st.robos++; return; }
            if (s.kind === 'effect') {
                if (s.from === 'hand')        st.efectosMano++;
                else if (s.from === 'field')  st.efectosCampo++;
                else if (s.from === 'gy')     st.efectosGY++;
                else if (s.from === 'banish') st.efectosBanish++;
                return;
            }
            const from = s.from, to = s.to;
            if (to === 'banish') { st.banish++; return; }
            if (to === 'field')  { st.invocaciones++; return; }
            if (to === 'gy' && (from === 'hand' || from === 'deckPool' || from === 'extraPool')) { st.grinding++; return; }
            if ((from === 'gy' || from === 'banish') && (to === 'hand' || to === 'field' || to === 'deckPool' || to === 'extraPool')) { st.recovery++; }
        });
        return st;
    },

    addManualInteraction: function (deckName, comboId) {
        const labelInput = document.getElementById(`combo-mi-label-${comboId}`);
        const qtyInput   = document.getElementById(`combo-mi-qty-${comboId}`);
        const label = (labelInput?.value || '').trim();
        const qty   = parseInt(qtyInput?.value, 10) || 1;
        if (!label) return;
        this._withCombo(deckName, comboId, combo => {
            if (!combo.manualInteractions) combo.manualInteractions = [];
            combo.manualInteractions.push({
                id: 'mi_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
                label, qty
            });
        });
        this._refresh();
    },

    removeManualInteraction: function (deckName, comboId, miId) {
        this._withCombo(deckName, comboId, combo => {
            combo.manualInteractions = (combo.manualInteractions || []).filter(m => m.id !== miId);
        });
        this._refresh();
    },

    _renderInteractionStats: function (combo) {
        const auto = this._computeAutoInteractions(combo);
        const AUTO_LABELS = {
            robos:        '🃏 Robos',
            invocaciones: '⬆️ Invocaciones',
            grinding:     '⚰️ Grinding',
            recovery:     '♻️ Recovery',
            banish:       '🌀 Banish',
            efectosMano:  '✋ Efectos en Mano',
            efectosCampo: '🏟️ Efectos en Campo',
            efectosGY:    '⚰️ Efecto en Cementerio',
            efectosBanish:'🌀 Efectos desde el Destierro'
        };
        const autoChips = Object.keys(AUTO_LABELS).map(k =>
            `<span class="combo-stat-chip">${AUTO_LABELS[k]}: <strong>${auto[k]}</strong></span>`).join('');

        const manual = combo.manualInteractions || [];
        const manualChips = manual.map(m => `
            <span class="combo-stat-chip combo-stat-chip-manual">
                ${this._escape(m.label)}: <strong>${m.qty}</strong>
                <button class="combo-stat-chip-remove" onclick="Combos.removeManualInteraction('${combo.deckName}','${combo.id}','${m.id}')">✖</button>
            </span>`).join('') || '<span class="deck-empty">Sin interacciones manuales aún.</span>';

        return `
        <div class="combo-stats-block">
            <h5 class="combo-zone-title">📊 Interacciones (automático)</h5>
            <div class="combo-stats-grid">${autoChips}</div>
            <h5 class="combo-zone-title">✍️ Interacciones del Endboard (manual)</h5>
            <div class="combo-stats-grid">${manualChips}</div>
            <div class="combo-mi-add-row">
                <input type="text" id="combo-mi-label-${combo.id}" class="combo-mi-input" placeholder="Ej: Pops, Negates...">
                <input type="number" id="combo-mi-qty-${combo.id}" class="combo-mi-qty-input" min="1" value="1">
                <button class="deck-move" onclick="Combos.addManualInteraction('${combo.deckName}','${combo.id}')">➕ Agregar</button>
            </div>
        </div>`;
    },
    _renderEndboard: function (combo) {
        const zones = [['field', '🏟️ Field'], ['hand', '✋ HAND'], ['gy', '⚰️ GY'], ['banish', '🌀 Banish']];
        const groups = zones.map(([key, label]) => {
            const entries = (combo.endboard || []).filter(e => e.zone === key);
            if (!entries.length) return '';
            const compact = !!this._zoneCompact[`${combo.id}:${key}`];
            const cardsHTML = entries
                .map(e => compact ? this._renderEndboardCardCompact(combo, e) : this._renderEndboardCard(combo, e))
                .join('');
            return `<div class="combo-eb-zone">
                <div class="combo-eb-zone-header">
                    <h5 class="combo-zone-title">${label}</h5>
                    <button class="combo-eb-zone-view-btn" onclick="Combos.toggleZoneView('${combo.id}','${key}')"
                        title="Cambiar entre vista lista y vista detallada">
                        ${compact ? '🔍 Detalle' : '📋 Lista'}
                    </button>
                </div>
                <div class="${compact ? 'combo-eb-cards-compact' : 'combo-eb-cards'}">${cardsHTML}</div>
            </div>`;
        }).join('');
        return `<h4 class="combo-steps-title">🎯 Endboard</h4><div class="combo-eb-grid">${groups}</div>`;
    },

    // Versión lista: nombre + badges (Activa/Starter/Función/Copia) en una sola
    // línea, sin editores inline — para identificar rápido cuando hay muchas
    // cartas. Click en la fila abre el visor de carta.
    _renderEndboardCardCompact: function (combo, entry) {
        const cardData   = Deck.cards[entry.id]?.data;
        const item       = Deck.cards[entry.id];
        const img        = cardData?.card_images?.[0]?.image_url_small || '';
        const name       = cardData?.name || entry.id;
        const isStarter  = combo.starterCardId === entry.id;
        const copyOfNames = item ? (item.copyOf || []).map(cid => Deck.cards[cid]?.data?.name || cid) : [];
        return `
        <div class="combo-eb-card-compact ${entry.active ? 'combo-eb-active' : ''}"
             onclick="Combos.viewCard('${entry.id}')" title="Click para ver la carta">
            <img src="${img}" class="combo-eb-thumb-sm" alt="">
            <span class="combo-eb-compact-name">${this._escape(name)}</span>
            ${entry.active ? '<span class="combo-eb-chip combo-eb-chip-active">Activa</span>' : ''}
            ${isStarter ? '<span class="combo-eb-chip combo-eb-chip-starter">⭐ Starter</span>' : ''}
            ${entry.mainFunction ? `<span class="combo-eb-chip combo-eb-chip-func">${this._escape(entry.mainFunction)}</span>` : ''}
            ${copyOfNames.map(n => `<span class="combo-eb-chip combo-eb-chip-copy">🧩 ${this._escape(n)}</span>`).join('')}
        </div>`;
    },

    _renderEndboardCard: function (combo, entry) {
        const cardData = Deck.cards[entry.id]?.data;
        const item     = Deck.cards[entry.id];
        const img   = cardData?.card_images?.[0]?.image_url_small || '';
        const name  = cardData?.name || entry.id;
        const roles = this._roleOptionsForCard(entry.id);
        const deps  = (entry.dependsOn || []).map(depUid => {
            const depEntry = combo.endboard.find(e => e.uid === depUid);
            const depName  = depEntry ? (Deck.cards[depEntry.id]?.data?.name || depEntry.id) : '?';
            return `<span class="combo-dep-chip">${this._escape(depName)}</span>`;
        }).join('') || '<span class="combo-dep-empty">Sin dependencias</span>';

        const copyOfNames = item ? (item.copyOf || []).map(cid => Deck.cards[cid]?.data?.name || cid) : [];
        const isStarter  = combo.starterCardId === entry.id;

        return `
        <div class="combo-eb-card ${entry.active ? 'combo-eb-active' : ''}">
            <img src="${img}" class="combo-eb-thumb" title="${name}" onclick="Combos.viewCard('${entry.id}')">
            <div class="combo-eb-info">
                <div class="combo-eb-name">${this._escape(name)}</div>
                <label class="combo-eb-switch">
                    <input type="checkbox" ${entry.active ? 'checked' : ''}
                        onchange="Combos.toggleEndboardActive('${combo.deckName}','${combo.id}','${entry.uid}')">
                    Carta Activa
                </label>
                <button class="combo-eb-starter-btn ${isStarter ? 'combo-eb-starter-active' : ''}"
                    onclick="Combos.setManualStarter('${combo.deckName}','${combo.id}','${entry.id}')"
                    title="Marcar/quitar esta carta como Starter de este combo">
                    ${isStarter ? '⭐' : '☆'} Starter
                </button>
                <select class="combo-eb-func-sel" onchange="Combos.setEndboardFunction('${combo.deckName}','${combo.id}','${entry.uid}', this.value)">
                    <option value="">— Función principal —</option>
                    ${roles.slice().sort((a, b) => a.localeCompare(b)).map(r => `<option value="${r}" ${entry.mainFunction === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
                <div class="combo-eb-deps">
                    <span class="combo-eb-deps-label">🔗 Depende de:</span> ${deps}
                    <button class="combo-eb-deps-edit-btn" onclick="Combos.openDependencyPicker('${combo.deckName}','${combo.id}','${entry.uid}')">✏️</button>
                </div>
                <div class="combo-eb-deps">
                    <span class="combo-eb-deps-label">🧩 Copia de:</span> ${copyOfNames.length ? copyOfNames.map(n => `<span class="combo-dep-chip">${this._escape(n)}</span>`).join('') : '<span class="combo-dep-empty">Ninguna</span>'}
                    <button class="combo-eb-deps-edit-btn" onclick="Combos.openCopyOfPicker('${combo.deckName}','${combo.id}','${entry.id}')">✏️</button>
                </div>
            </div>
        </div>`;
    },

// Lista TODAS las cartas involucradas en el combo (mano inicial + pasos +
    // endboard), tengan o no una zona asignada, para poder marcarlas como
    // "copia de" aunque se hayan devuelto al mazo durante el combo.
    // Vista colapsada/expandida del panel "Cartas del Deck" — clave: comboId.
    _comboCopyPanelOpen: {},

    toggleComboCopyPanel: function (comboId) {
        this._comboCopyPanelOpen[comboId] = !this._comboCopyPanelOpen[comboId];
        this._refresh();
    },

    _renderComboCopyPanel: function (combo) {
        const validIds = Object.entries(Deck.cards)
            .filter(([, c]) => c.location === 'main' || c.location === 'extra')
            .sort(([, a], [, b]) => {
                const gA = this._typeGroupIndex(a.location, a.data);
                const gB = this._typeGroupIndex(b.location, b.data);
                if (gA !== gB) return gA - gB;
                return (a.data?.name || '').localeCompare(b.data?.name || '');
            })
            .map(([id]) => id);
        if (!validIds.length) return '';

        const isOpen = !!this._comboCopyPanelOpen[combo.id];
        const rows = validIds.map(id => {
            const item = Deck.cards[id];
            const name = item.data?.name || id;
            const img  = item.data?.card_images?.[0]?.image_url_small || '';
            const copyOfNames = (item.copyOf || []).map(cid => Deck.cards[cid]?.data?.name || cid);
            const copyOfHTML = copyOfNames.length
                ? copyOfNames.map(n => `<span class="combo-dep-chip">${this._escape(n)}</span>`).join('')
                : '<span class="combo-dep-empty">Ninguna</span>';
            return `<div class="combo-copy-row">
                ${img ? `<img src="${img}" class="combo-deps-thumb" alt="">` : ''}
                <span class="combo-copy-name">${this._escape(name)}</span>
                <span class="combo-eb-deps-label">🧩 Copia de:</span>
                ${copyOfHTML}
                <button class="combo-eb-deps-edit-btn" onclick="Combos.openCopyOfPicker('${combo.deckName}','${combo.id}','${id}')">✏️</button>
            </div>`;
        }).join('');

        return `
        <div class="combo-copy-panel-wrap">
            <button class="combo-copy-panel-toggle" onclick="Combos.toggleComboCopyPanel('${combo.id}')">
                🧩 Cartas del Deck <span class="combo-copy-panel-arrow">${isOpen ? '▾' : '▸'}</span>
            </button>
            ${isOpen ? `<div class="combo-copy-panel">${rows}</div>` : ''}
        </div>`;
    },

    // ── Consistencia del Starter (Etapa 8) — hipergeométrica ────────
    // Usa el tamaño ACTUAL del mazo principal (no un snapshot de cuando se
    // grabó el combo) y la mano inicial REAL registrada en este combo.
    _mainDeckSize: function () {
        return Object.values(Deck.cards || {})
            .filter(c => c.location === 'main')
            .reduce((sum, c) => sum + c.qty, 0);
    },
// Copias "reales" de una carta para consistencia = sus propias copias en
    // el Main + las copias de toda carta marcada como "copia de" ella
    // (recursivo, por si A es copia de B y B es copia de C).
    _effectiveCopies: function (cardId, seen) {
        seen = seen || new Set();
        if (seen.has(cardId)) return 0;
        seen.add(cardId);
        const item = Deck.cards[cardId];
        if (!item) return 0;
        let total = item.qty || 0;
        Object.entries(Deck.cards).forEach(([id, c]) => {
            if ((c.copyOf || []).includes(cardId)) total += this._effectiveCopies(id, seen);
        });
        return total;
    },
    // P(al menos 1 copia) en una mano de `drawn` cartas, mazo de `deckSize`,
    // `successes` copias del target. Calculado por productos (sin factoriales)
    // para evitar overflow con mazos grandes.
    _hyperAtLeastOneFallback: function (deckSize, successes, drawn) {
        if (successes <= 0 || drawn <= 0 || deckSize <= 0) return 0;
        if (drawn > deckSize) drawn = deckSize;
        const nonSuccess = deckSize - successes;
        if (drawn > nonSuccess) return 1; // no cabe una mano sin al menos 1 copia
        let probNone = 1;
        for (let i = 0; i < drawn; i++) probNone *= (nonSuccess - i) / (deckSize - i);
        return 1 - probNone;
    },
// Usa el motor ya existente de Hipergeometria (simuladores.js) — misma
    // fórmula exacta que la calculadora de Simuladores, para no duplicar la
    // matemática de probabilidad en dos módulos. Si por algún motivo no
    // está cargado, cae al cálculo propio de respaldo.
    _hyperAtLeast: function (deckSize, successes, drawn) {
        if (window.Hipergeometria && typeof Hipergeometria.hyperAtLeast === 'function') {
            return Hipergeometria.hyperAtLeast(deckSize, successes, drawn, 1);
        }
        return this._hyperAtLeastOneFallback(deckSize, successes, drawn);
    },
    _starterConsistency: function (combo) {
        const starterId = combo.starterCardId;
        const item = starterId ? Deck.cards[starterId] : null;
        if (!starterId || !item) return null;

        const deckSize   = this._mainDeckSize();
        const handSize   = (combo.startCards || []).length || 5;
        const currentQty = this._effectiveCopies(starterId);
        const TARGET     = 0.85;

        const probCurrent = this._hyperAtLeast(deckSize, currentQty, handSize);

        let copiesNeeded = null, probWithNeeded = null;
        for (let k = 1; k <= 3; k++) {
            const p = this._hyperAtLeast(deckSize, k, handSize);
            if (p >= TARGET) { copiesNeeded = k; probWithNeeded = p; break; }
        }

        return {
            starterName:  Deck.cards[starterId]?.data?.name || starterId,
            deckSize, handSize, currentQty,
            probCurrent:    Math.round(probCurrent * 1000) / 10,
            copiesNeeded,
            probWithNeeded: probWithNeeded != null ? Math.round(probWithNeeded * 1000) / 10 : null
        };
    },

// Consistencia de abrir al menos 1 Extender activo del combo (mismo
    // motor hipergeométrico que _starterConsistency, pool = todos los
    // Extenders marcados como función principal en el Endboard de este combo).
    _extenderConsistency: function (combo) {
        const entries = (combo.endboard || []).filter(e => e.active && e.mainFunction === 'Extender');
        if (!entries.length) return null;
        const ids = [...new Set(entries.map(e => e.id))];
        const deckSize = this._mainDeckSize();
        const handSize = (combo.startCards || []).length || 5;
        const successes = ids.reduce((sum, id) => sum + this._effectiveCopies(id), 0);
        if (successes <= 0) return null;
        const prob = this._hyperAtLeast(deckSize, successes, handSize);
        return Math.round(prob * 1000) / 10;
    },

    _renderStarterConsistency: function (combo) {
        const info = this._starterConsistency(combo);
        if (!info) return '';
        const meetsNow = info.probCurrent >= 85;
        return `
        <div class="combo-consistency-block">
            <h5 class="combo-zone-title">🎲 Consistencia del Starter</h5>
            <p class="combo-consistency-line">
                <strong>${this._escape(info.starterName)}</strong> — ${info.currentQty} copia${info.currentQty === 1 ? '' : 's'} en un mazo de ${info.deckSize},
                mano de ${info.handSize}: <span class="${meetsNow ? 'combo-consistency-ok' : 'combo-consistency-low'}">${info.probCurrent}% de abrirlo</span>
            </p>
            <p class="combo-consistency-line">
                ${info.copiesNeeded
                    ? `Necesitas <strong>${info.copiesNeeded}</strong> copia${info.copiesNeeded === 1 ? '' : 's'} para superar 85% (con ${info.copiesNeeded}: ${info.probWithNeeded}%).`
                    : `Ni con 3 copias se supera el 85% con este tamaño de mazo (${info.deckSize} cartas) — reduce el mazo o suma buscadores del Starter.`}
            </p>
        </div>`;
    },

_renderPowerSummary: function (combo) {
        if (!combo.powerBreakdown || !combo.powerBreakdown.length) {
            return `<div class="combo-power-block"><p class="deck-empty">Marca cartas activas y su función principal en el Endboard para calcular el poder del combo.</p></div>`;
        }
        const top = combo.powerBreakdown.slice(0, 5);
        return `
        <div class="combo-power-block">
            <div class="combo-power-header">
                ${combo.imageUrl ? `<img src="${combo.imageUrl}" class="combo-power-thumb" alt="${this._escape(combo.name || '')}">` : ''}
                <div class="combo-power-info">
                    <div class="combo-power-seq">Combo ${this._comboSeq(combo)}</div>
                    <div class="combo-power-name">${combo.name ? this._escape(combo.name) : '— agrega función principal a una carta activa —'}</div>
                    <div class="combo-power-value">⚡ Poder del Combo: <strong>${combo.power}</strong>
                        ${combo.powerBeforeMeta != null && combo.powerBeforeMeta !== combo.power ? `<span class="combo-power-premeta"> (antes del Meta: ${combo.powerBeforeMeta})</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="combo-power-top">
                <h5 class="combo-zone-title">🏆 Cartas de mayor poder</h5>
                <div class="combo-power-top-list">
                    ${top.map(b => `
                    <div class="combo-power-top-row">
                        <span class="combo-power-top-name">${this._escape(b.name)}</span>
                        <span class="combo-power-top-role">${b.role ? this._escape(b.role) : 'sin función'}</span>
                        <span class="combo-power-top-val">${b.value}</span>
                    </div>`).join('')}
                </div>
            </div>
        </div>`;
    },
_renderBranchBanner: function (combo) {
        const parent = this._findCombo(combo.deckName, combo.parentComboId);
        const parentLabel = parent ? (parent.name || '(combo sin nombre)') : '(combo original no encontrado)';
        const typeLabel = combo.branchType === 'choke' ? '🚧 Rama por interrupción' : '🔀 Variante';
        let chokeInfo = '';
        if (combo.branchType === 'choke' && parent) {
            const cp = (parent.chokePoints || []).find(c => c.id === combo.branchChokeId);
            if (cp) chokeInfo = ` — interrumpido por <strong>${this._escape(cp.metaCardName)}</strong>`;
        }
        return `
        <div class="combo-branch-banner">
            <span class="combo-branch-badge">${typeLabel}</span>
            <span class="combo-branch-text">de: ${this._escape(parentLabel)}${chokeInfo}</span>
            ${parent ? `<button class="combo-branch-goto-btn" onclick="Combos.openCombo('${combo.deckName}','${parent.id}')">Ver combo original</button>` : ''}
        </div>`;
    },
    // ── Objetivo: editar / limpiar / guardar ──────────────────────

    editObjetivo: function (comboId) {
        document.getElementById(`combo-objetivo-view-${comboId}`).style.display = 'none';
        document.getElementById(`combo-objetivo-edit-${comboId}`).style.display = 'block';
    },

    clearObjetivo: function (comboId) {
        const input = document.getElementById(`combo-objetivo-input-${comboId}`);
        if (input) input.value = '';
    },

    saveObjetivo: function (deckName, comboId) {
        const input = document.getElementById(`combo-objetivo-input-${comboId}`);
        const value = input ? input.value.trim() : '';
        this._updateCombo(deckName, comboId, { objetivo: value });
        this._refresh();
    },

    // ── Render ──────────────────────────────────────────────────
    _refresh: function () {
        const pane = document.getElementById('mideck-combos-pane');
        if (pane) pane.innerHTML = this.renderPane();
    },

    renderPane: function () {
        const activeDeckName = Deck.name;
        const activeDraft = this._activeComboId ? this._findCombo(activeDeckName, this._activeComboId) : null;

        let html = `<div class="combos-toolbar">
            <button class="opt-submit-btn" onclick="Combos.startNewCombo()">➕ Nuevo Combo</button>
            <button class="deck-move" onclick="Combos.importCombo()">📥 Importar Combo</button>
        </div>`;
        
        if (activeDraft) html += this._renderComboEditor(activeDraft);

        html += `<h3 class="deck-section-title">📚 Lista de Combos</h3>`;
        html += this._renderComboList();

        return html;
    },

    _renderComboEditor: function (combo) {
        const objetivoText = combo.objetivo ? this._escape(combo.objetivo) : this.DEFAULT_OBJETIVO;
        const isDraft    = combo.status === 'draft';
        const isFinished = combo.status === 'finished';

        let body = '';
        if (isDraft) {
            body = `<button class="opt-submit-btn" onclick="Combos.startCombo('${combo.deckName}','${combo.id}')">🎬 Empezar Combo</button>`;
        } else if (isFinished) {
            body = `
            <div class="combo-controls-row">
                <button class="deck-move" onclick="Combos.reopenCombo('${combo.deckName}','${combo.id}')">↩️ Reabrir Combo</button>
            </div>
            ${this._renderPowerSummary(combo)}
            ${this._renderStarterConsistency(combo)}
            ${this._renderInteractionStats(combo)}
            ${this._renderEndboard(combo)}
            ${this._renderComboCopyPanel(combo)}
    <div class="combo-hint-box">
        💡 <strong>Carta Activa</strong>: sigue aportando algo después de terminado el combo (presión, protección, recursos), por eso suma al Poder. <strong>Depende de</strong>: de qué otra(s) pieza(s) necesita para conservar ese valor — si pierdes esas cartas, esta deja de aportar.
    </div>
    <h4 class="combo-steps-title">📜 Pasos del Combo (${(combo.steps || []).length})</h4>
            <div class="combo-steps-log">${this._renderSteps(combo)}</div>
            `;
        } else {
            const poolCount = combo.zones?.deckPool?.length || 0;
            body = `
            <div class="combo-controls-row">
                <button class="deck-move" onclick="Combos.drawCard('${combo.deckName}','${combo.id}')" ${poolCount ? '' : 'disabled'}>🃏 Robar 1 (${poolCount} restantes)</button>
                <button class="deck-move" onclick="Combos.openDeckPicker('${combo.deckName}','${combo.id}')">📖 Ver Main Deck</button>
                <button class="deck-move" onclick="Combos.openExtraPicker('${combo.deckName}','${combo.id}')">🎴 Ver Extra Deck</button>
                <button class="opt-submit-btn" onclick="Combos.finishCombo('${combo.deckName}','${combo.id}')">🏁 Finalizar Combo</button>
            </div>
            ${this._renderZones(combo)}
            ${this._renderInteractionStats(combo)}
            <div class="combo-reset-row">
                <button class="deck-move combo-reset-btn" onclick="Combos.confirmResetZones('${combo.deckName}','${combo.id}')">🔄 Reiniciar Zonas</button>
            </div>
            <h4 class="combo-steps-title">📜 Pasos del Combo (${(combo.steps || []).length})</h4>
            <div class="combo-steps-log">${this._renderSteps(combo)}</div>
            `;
        }

        return `
        <div class="combo-editor" data-combo-id="${combo.id}">
            <div class="combo-editor-header">
                <span class="combo-editor-deck">🃏 ${this._escape(combo.deckName)} <span class="combo-status-badge combo-status-${combo.status}">${combo.status}</span></span>
                <div class="combo-header-actions">
                    <button class="combo-export-btn" onclick="Combos.exportComboTXT('${combo.deckName}','${combo.id}')">⬇️ Exportar .txt (para lectura)</button>
                    <button class="combo-export-btn" onclick="Combos.exportComboFull('${combo.deckName}','${combo.id}')">📦 Exportar Combo (para importacion)</button>
                    <button class="combo-discard-btn" onclick="Combos.confirmDeleteCombo('${combo.deckName}','${combo.id}')">🗑️ Borrar Combo</button>
                </div>
            </div>

            ${combo.parentComboId ? this._renderBranchBanner(combo) : ''}

            <div class="combo-objetivo-box">
                <div class="combo-objetivo-label">🎯 Objetivo</div>
                <div id="combo-objetivo-view-${combo.id}" class="combo-objetivo-view">
                    <p class="combo-objetivo-text ${combo.objetivo ? '' : 'combo-objetivo-placeholder'}">${objetivoText}</p>
                    <button class="combo-objetivo-edit-btn" onclick="Combos.editObjetivo('${combo.id}')">✏️ Editar</button>
                </div>
                <div id="combo-objetivo-edit-${combo.id}" class="combo-objetivo-edit" style="display:none;">
                    <textarea id="combo-objetivo-input-${combo.id}" class="combo-objetivo-textarea"
                        placeholder="${this.DEFAULT_OBJETIVO}">${combo.objetivo ? this._escape(combo.objetivo) : ''}</textarea>
                    <div class="combo-objetivo-edit-actions">
                        <button class="combo-objetivo-clear-btn" onclick="Combos.clearObjetivo('${combo.id}')">🗑️ Limpiar</button>
                        <button class="combo-objetivo-save-btn" onclick="Combos.saveObjetivo('${combo.deckName}','${combo.id}')">💾 Guardar</button>
                    </div>
                </div>
            </div>

            ${body}
        </div>`;
    },

   _renderComboList: function () {
        const activeDeckName = Deck.name;
        const all = this.getAll(activeDeckName);
        if (!all.length) return `<p class="deck-empty">Aún no hay combos registrados para este deck.</p>`;

        const byId = {};
        all.forEach(c => { byId[c.id] = c; });
        // Raíces: combos sin padre, o cuyo padre ya no existe (huérfanos de rama borrada).
        const roots = all.filter(c => !c.parentComboId || !byId[c.parentComboId]);

        const sortSiblings = (arr) => arr.slice().sort((a, b) => {
            const p = (b.power || 0) - (a.power || 0);
            if (p !== 0) return p;
            return (a.bossCardId || '').localeCompare(b.bossCardId || '');
        });

        const branchIcon = (combo) => combo.branchType === 'choke' ? '🚧' : '🔀';
        const branchTitle = (combo) => combo.branchType === 'choke' ? 'Rama por interrupción' : 'Variante';

        const renderBranchNode = (combo, depth) => {
            const row = `
            <div class="combo-branch-row" style="margin-left:${(depth - 1) * 16}px"
                 onclick="Combos.openCombo('${combo.deckName}','${combo.id}')">
                ${combo.imageUrlSmall ? `<img src="${combo.imageUrlSmall}" class="combo-branch-thumb" alt="">` : ''}
                <span class="combo-list-branch-badge" title="${branchTitle(combo)}">${branchIcon(combo)}</span>
                <span class="combo-branch-seq">Combo ${this._comboSeq(combo)}</span>
                <span class="combo-branch-name">${combo.name ? this._escape(combo.name) : '(Sin nombre — ' + combo.status + ')'}</span>
                <span class="combo-status-badge combo-status-${combo.status}">${combo.status}</span>
                <span class="combo-branch-power">⚡ ${combo.power || 0}</span>
            </div>`;
            const children = sortSiblings(all.filter(c => c.parentComboId === combo.id));
            return row + children.map(c => renderBranchNode(c, depth + 1)).join('');
        };

        const renderRootCard = (combo) => {
            const branches = sortSiblings(all.filter(c => c.parentComboId === combo.id));
            const branchesHTML = branches.length
                ? `<div class="combo-branch-list">${branches.map(c => renderBranchNode(c, 1)).join('')}</div>`
                : '';
            return `
            <div class="combo-root-card">
                <div class="combo-root-main" onclick="Combos.openCombo('${combo.deckName}','${combo.id}')">
                    ${combo.imageUrlSmall
                        ? `<img src="${combo.imageUrlSmall}" class="combo-root-thumb" alt="">`
                        : `<div class="combo-root-thumb combo-root-thumb-empty">🃏</div>`}
                    <div class="combo-root-body">
                        <div class="combo-root-seq">Combo ${this._comboSeq(combo)}</div>
                        <div class="combo-root-top">
                            <span class="combo-root-name">${combo.name ? this._escape(combo.name) : '(Sin nombre — ' + combo.status + ')'}</span>
                            <span class="combo-status-badge combo-status-${combo.status}">${combo.status}</span>
                        </div>
                        <div class="combo-root-power">⚡ Poder: ${combo.power || 0}</div>
                        ${branches.length ? `<div class="combo-root-branch-count">${branches.length} rama${branches.length === 1 ? '' : 's'}/variante${branches.length === 1 ? '' : 's'}</div>` : ''}
                    </div>
                </div>
                ${branchesHTML}
            </div>`;
        };

        return `<div class="combo-grid">${sortSiblings(roots).map(renderRootCard).join('')}</div>`;
    },

    // ── Borrar línea desde un paso (Etapa 9) ─────────────────────────
    // Trunca el combo desde el paso indicado en adelante: restaura las zonas
    // al estado justo ANTES de ese paso (snapshot del paso previo) y descarta
    // Choke Points/Restricciones posteriores. El Endboard/Poder quedan
    // invalidados (la línea cambió) y el combo vuelve a 'started' para
    // seguir grabándose desde ese punto corregido.
    confirmDeleteStepsFrom: function (deckName, comboId, stepId, stepNumber) {
        const overlay = document.createElement('div');
        overlay.className = 'deck-overlay';
        overlay.innerHTML = `
            <div class="deck-modal deck-modal-warning">
                <h3>Borrar línea desde el paso ${stepNumber}</h3>
                <p class="deck-modal-note">Se borrará el paso ${stepNumber} y todos los siguientes, junto con sus Choke Points, Restricciones y el Endboard/Poder ya calculado. El combo vuelve a "en grabación" desde ese punto. No se puede deshacer.</p>
                <div class="deck-modal-buttons">
                    <button class="btn-danger" onclick="Combos.deleteStepsFrom('${deckName}','${comboId}','${stepId}');Deck.closeModal()">Sí, Borrar</button>
                    <button onclick="Deck.closeModal()">Cancelar</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    },

    deleteStepsFrom: function (deckName, comboId, stepId) {
        this._withCombo(deckName, comboId, combo => {
            const steps = combo.steps || [];
            const idx = steps.findIndex(s => s.id === stepId);
            if (idx === -1) return;

            if (idx === 0) {
                combo.zones      = { deckPool: this._buildDeckPool(), extraPool: this._buildExtraPool(), hand: [], gy: [], banish: [], field: [] };
                combo.startCards = [];
            } else if (steps[idx - 1].zonesSnapshot) {
                combo.zones = JSON.parse(JSON.stringify(steps[idx - 1].zonesSnapshot));
            }

            combo.steps          = steps.slice(0, idx);
            combo.chokePoints    = (combo.chokePoints   || []).filter(cp => combo.steps.some(s => s.id === cp.stepId));
            combo.restricciones  = (combo.restricciones || []).filter(r  => combo.steps.some(s => s.id === r.stepId));
            combo.endboard        = [];
            combo.power            = 0;
            combo.powerBeforeMeta   = null;
            combo.powerBreakdown    = [];
            combo.bossCardId        = null;
            combo.starterCardId     = null;
            combo.bossName          = null;
            combo.starterName       = null;
            combo.imageUrl          = null;
            combo.imageUrlSmall     = null;
            combo.name              = '';
            combo.finishedAt        = null;
            combo.status            = 'started';
        });
        this._refresh();
    },

    // ── Exportar combo a .txt (Etapa 9) ──────────────────────────────
    exportComboTXT: function (deckName, comboId) {
        const combo = this._findCombo(deckName, comboId);
        if (!combo) return;

        const lines = [];
        lines.push(`Destiny Draw — Línea de Combos`);
        lines.push(`Deck: ${combo.deckName}`);
        lines.push(`Combo: ${combo.name || '(sin nombre — ' + combo.status + ')'}`);
        lines.push(`Estado: ${combo.status}`);
        if (combo.parentComboId) {
            const parent = this._findCombo(combo.deckName, combo.parentComboId);
            lines.push(`Rama de: ${parent ? (parent.name || parent.id) : combo.parentComboId} (${combo.branchType === 'choke' ? 'interrupción' : 'variante'})`);
        }
        lines.push('');
        lines.push(`Objetivo: ${combo.objetivo || '(sin definir)'}`);
        lines.push('');

        if (combo.power) {
            lines.push(`Poder del Combo: ${combo.power}${combo.powerBeforeMeta != null && combo.powerBeforeMeta !== combo.power ? ` (antes del Meta: ${combo.powerBeforeMeta})` : ''}`);
            if (combo.bossName)    lines.push(`Boss: ${combo.bossName}`);
            if (combo.starterName) lines.push(`Starter: ${combo.starterName}`);
            lines.push('');
        }

        const info = this._starterConsistency(combo);
        if (info) {
            lines.push(`Consistencia del Starter (${info.starterName}): ${info.probCurrent}% con ${info.currentQty} copia(s) en un mazo de ${info.deckSize} (mano de ${info.handSize}).`);
            lines.push(info.copiesNeeded
                ? `  -> ${info.copiesNeeded} copia(s) necesarias para superar 85% (${info.probWithNeeded}%).`
                : `  -> Ni con 3 copias se supera el 85% con este tamaño de mazo.`);
            lines.push('');
        }

        lines.push(`---- PASOS (${(combo.steps || []).length}) ----`);
        (combo.steps || []).forEach((s, i) => {
            let line = `${i + 1}. [${s.time}] ${s.msg.replace(/<[^>]+>/g, '')}`;
            (combo.chokePoints || []).filter(cp => cp.stepId === s.id).forEach(cp => {
                line += `  [Choke: ${cp.metaCardName} - ${(this.CHOKE_FREQ[cp.frequency] || {}).label || cp.frequency}]`;
            });
            (combo.restricciones || []).filter(r => r.stepId === s.id).forEach(r => {
                line += `  [Restricción ${(this.RESTRICTION_SEV[r.severity] || {}).label || r.severity}: ${r.text}]`;
            });
            lines.push(line);
        });
        lines.push('');

        if ((combo.endboard || []).length) {
            lines.push(`---- ENDBOARD ----`);
            combo.endboard.forEach(e => {
                const name = Deck.cards[e.id]?.data?.name || e.id;
                const deps = (e.dependsOn || []).map(depUid => {
                    const d = combo.endboard.find(x => x.uid === depUid);
                    return d ? (Deck.cards[d.id]?.data?.name || d.id) : '?';
                });
                lines.push(`- [${this._zoneLabel(e.zone)}] ${name}${e.active ? ' (activa)' : ' (inactiva)'}${e.mainFunction ? ` - función: ${e.mainFunction}` : ''}${deps.length ? ` - depende de: ${deps.join(', ')}` : ''}`);
            });
            lines.push('');
        }

        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${(combo.name || combo.deckName + '_' + combo.id).replace(/[^a-z0-9]+/gi, '_')}.txt`;
        a.click();
    },

    // ── Exportar/Importar Combo COMPLETO (.txt con JSON) ────────────
    // A diferencia de exportComboTXT (resumen legible y con pérdida), esto
    // serializa el objeto combo entero — steps, zones, endboard, chokePoints,
    // restricciones, power, boss/starter, ramas — para poder reconstruirlo
    // 1:1 como un combo nuevo, en el mismo deck o en otro.
    exportComboFull: function (deckName, comboId) {
        const combo = this._findCombo(deckName, comboId);
        if (!combo) return;
        const header = [
            `# Destiny Draw — Combo completo (para reimportar)`,
            `# Combo: ${combo.name || combo.id}`,
            `# Deck original: ${combo.deckName}`,
            `# No editar manualmente el bloque JSON de abajo.`,
            ''
        ].join('\n');
        const blob = new Blob([header + JSON.stringify(combo)], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${(combo.name || combo.deckName + '_' + combo.id).replace(/[^a-z0-9]+/gi, '_')}_full.txt`;
        a.click();
    },

    importCombo: function () {
        if (!Deck.name) { alert('Carga un deck antes de importar un combo.'); return; }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            this._mergeImportedCombo(await file.text());
        };
        input.click();
    },

    _mergeImportedCombo: function (text) {
        const jsonText = text.split('\n').filter(l => !l.trim().startsWith('#')).join('\n').trim();
        let imported;
        try { imported = JSON.parse(jsonText); } catch (e) {
            alert('Archivo de combo inválido o corrupto.');
            return;
        }
        if (!imported || typeof imported !== 'object' || !Array.isArray(imported.steps)) {
            alert('Este archivo no parece ser un combo exportado de Destiny Draw.');
            return;
        }

        const deckName = Deck.name;
        const combos   = this.getAll(deckName);

        // Se registra como combo NUEVO e independiente: id propio, dueño el
        // deck activo, sin vínculo de rama (el padre podría no existir aquí).
        const newCombo = {
            ...imported,
            id:            'combo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            deckName:      deckName,
            parentComboId: null,
            branchType:    null,
            branchStepId:  null,
            branchChokeId: null,
            createdAt:     Date.now(),
            name:          imported.name ? `${imported.name} (importado)` : '(importado)'
        };

        combos.push(newCombo);
        this.saveAll(deckName, combos);
        this._activeComboId = newCombo.id;
        this._refresh();
        alert(`Combo importado: ${newCombo.name}`);
    },

    _escape: function (str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
};

window.Combos = Combos;


// ── Banlist — estado de banlist por formato; decora filas del deck y advierte cartas limitadas/prohibidas ──

const Banlist = {
    STORAGE_KEY: 'yugioh_banlist_data',
    currentTab:  'TCG',

    STATUS_PRIORITY: { forbidden: 4, limited: 3, 'semi-limited': 2, free: 1 },
    STATUS_LABEL:    { forbidden: 'Baneada', limited: 'Limitada', 'semi-limited': 'Semi-Limitada' },
    STATUS_COLOR:    { forbidden: '#d63031', limited: '#e17055', 'semi-limited': '#fdcb6e' },
    STATUS_TEXT:     { forbidden: '#fff',    limited: '#fff',    'semi-limited': '#000' },
    STATUS_ORDER:    { forbidden: 0, limited: 1, 'semi-limited': 2 },

    // ── Persistencia ─────────────────────────────────────────────
    getData: function () {
    try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (!data.formats.Genesys) {
                data.formats.Genesys = { cards: {}, isCustom: false, isGenesys: true };
                this.saveData(data);
            }
            return data;
        }
    } catch (_) {}
    return {
        activeFormats: ['TCG'],
        formats: {
            TCG:     { cards: {}, lastUpdated: null, isCustom: false },
            OCG:     { cards: {}, lastUpdated: null, isCustom: false },
            Genesys: { cards: {}, isCustom: false, isGenesys: true }
        }
    };
},

    saveData: function (data) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    },

    // ── Formatos activos ─────────────────────────────────────────
    getActiveFormats: function () {
        return this.getData().activeFormats || ['TCG'];
    },

    toggleActiveFormat: function (formatName) {
    const data      = this.getData();
    const isGenesys = !!data.formats[formatName]?.isGenesys;
    const idx       = data.activeFormats.indexOf(formatName);

    if (idx > -1) {
        if (data.activeFormats.length === 1) return;
        data.activeFormats.splice(idx, 1);
    } else {
        if (isGenesys) {
            data.activeFormats = [formatName];
        } else {
            data.activeFormats = data.activeFormats.filter(f => !data.formats[f]?.isGenesys);
            data.activeFormats.push(formatName);
        }
    }
    this.saveData(data);
    this.refreshFormatChips();
},

    // ── Status efectivo ──────────────────────────────────────────
    getEffectiveBanStatus: function (cardId) {
        const data = this.getData();
        const id   = String(cardId);
        let highest = 'free';

        for (const fName of (data.activeFormats || [])) {
            const fmt = data.formats[fName];
            if (!fmt) continue;
            let status;
            if (fmt.inverted) {
                status = fmt.cards[id] ? 'free' : 'forbidden';
            } else {
                status = fmt.cards[id]?.status || 'free';
            }
            if ((this.STATUS_PRIORITY[status] || 1) > (this.STATUS_PRIORITY[highest] || 1)) {
                highest = status;
            }
        }
        return highest;
    },

    // Badge para usar en Mi Deck
    getBadgeHTML: function (cardId) {
    const data         = this.getData();
    const genesysActive = data.activeFormats.some(f => data.formats[f]?.isGenesys);

    if (genesysActive) {
        const pts = this.getCardPoints(cardId);
        if (!pts || pts === 0) return '';
        return `<span class="ban-badge" style="background:#1a1a1a;color:#fff;border:1px solid #555;">${pts} pts</span>`;
    }

    const status = this.getEffectiveBanStatus(cardId);
    if (!status || status === 'free') return '';
    const c = this.STATUS_COLOR[status];
    const t = this.STATUS_TEXT[status];
    const l = this.STATUS_LABEL[status];
    return `<span class="ban-badge" style="background:${c};color:${t};">${l}</span>`;
},

    // ── Operaciones sobre cartas ─────────────────────────────────
    setCardStatus: function (formatName, cardId, cardMeta, status) {
        const data = this.getData();
        if (!data.formats[formatName]) return;
        const id = String(cardId);
        if (status === 'free') {
            delete data.formats[formatName].cards[id];
        } else {
            data.formats[formatName].cards[id] = {
                name:   cardMeta.name || '',
                img:    cardMeta.img  || '',
                status
            };
        }
        this.saveData(data);
    },

    removeCardFromFormat: function (formatName, cardId) {
        const data = this.getData();
        if (!data.formats[formatName]) return;
        delete data.formats[formatName].cards[String(cardId)];
        this.saveData(data);
        const listEl = document.getElementById(`banlist-cards-${formatName}`);
        if (listEl) listEl.innerHTML = this.renderFormatList(formatName);
        const countEl = document.getElementById(`ban-count-${formatName}`);
        if (countEl) countEl.textContent = Object.keys(data.formats[formatName].cards).length + ' cartas';
    },

    // ── Crear / eliminar formato custom ──────────────────────────
    createCustomFormat: function () {
        const name = prompt('Nombre del formato personalizado:');
        if (!name || !name.trim()) return;
        const key  = name.trim();
        const data = this.getData();
        if (data.formats[key]) { alert('Ya existe un formato con ese nombre.'); return; }
        data.formats[key] = { cards: {}, isCustom: true, inverted: false };
        this.saveData(data);
        this.currentTab = key;
        this.renderSection();
    },

    deleteCustomFormat: function (formatName) {
        if (!confirm(`¿Eliminar el formato "${formatName}"?`)) return;
        const data = this.getData();
        delete data.formats[formatName];
        data.activeFormats = data.activeFormats.filter(f => f !== formatName);
        this.saveData(data);
        this.currentTab = 'TCG';
        this.renderSection();
    },

    toggleInverted: function (formatName) {
        const data = this.getData();
        if (!data.formats[formatName]) return;
        data.formats[formatName].inverted = !data.formats[formatName].inverted;
        this.saveData(data);
        const isInv  = data.formats[formatName].inverted;
        const btn    = document.getElementById(`ban-invert-btn-${formatName}`);
        if (btn) btn.textContent = isInv ? '🔄 Lista invertida (activa)' : '🔄 Invertir lista';
        if (btn) btn.style.borderColor = isInv ? '#fdcb6e' : '';
        if (btn) btn.style.color       = isInv ? '#fdcb6e' : '';
    },

    updateOfficialList: async function (format) {
        const btn = document.getElementById(`ban-update-btn-${format}`);
        if (btn) { btn.disabled = true; btn.textContent = '⏳ Actualizando...'; }

        try {
            const apiFormat = format.toLowerCase();
            const res  = await fetch(
                `https://db.ygoprodeck.com/api/v7/cardinfo.php?banlist=${apiFormat}`
            );
            const json = await res.json();
            const cards = json.data || [];

            const data = this.getData();
            if (!data.formats[format]) data.formats[format] = { cards: {}, isCustom: false };
            data.formats[format].cards = {};

            const STATUS_MAP = { 'Banned': 'forbidden', 'Limited': 'limited', 'Semi-Limited': 'semi-limited' };
            const key        = format === 'TCG' ? 'ban_tcg' : 'ban_ocg';

            cards.forEach(card => {
                const rawStatus = card.banlist_info?.[key];
                const status    = STATUS_MAP[rawStatus];
                if (!status) return;
                data.formats[format].cards[String(card.id)] = {
                    name: card.name,
                    img:  card.card_images?.[0]?.image_url_small || '',
                    status
                };
            });

            data.formats[format].lastUpdated = new Date().toLocaleDateString('es-ES');
            this.saveData(data);

            const listEl  = document.getElementById(`banlist-cards-${format}`);
            if (listEl) listEl.innerHTML = this.renderFormatList(format);
            const dateEl  = document.getElementById(`ban-date-${format}`);
            if (dateEl) dateEl.textContent = data.formats[format].lastUpdated;
            const countEl = document.getElementById(`ban-count-${format}`);
            if (countEl) countEl.textContent = Object.keys(data.formats[format].cards).length + ' cartas';

            if (btn) {
                btn.textContent = '✅ Actualizado';
                btn.disabled    = false;
                setTimeout(() => { btn.textContent = '🔄 Actualizar'; }, 2500);
            }
        } catch (_) {
            if (btn) {
                btn.textContent = '❌ Error de red';
                btn.disabled    = false;
                setTimeout(() => { btn.textContent = '🔄 Actualizar'; }, 2500);
            }
        }
    },

    // ── UI Principal ─────────────────────────────────────────────
    renderSection: function () {
        const el = document.getElementById('banlist-section');
        if (!el) return;
        el.innerHTML = this._buildSectionHTML();
    },

    _buildSectionHTML: function () {
        const data    = this.getData();
        const active  = data.activeFormats;
        const allKeys = ['TCG', 'OCG', ...Object.keys(data.formats).filter(k => k !== 'TCG' && k !== 'OCG')];

        const chips = allKeys.map(name => `
            <span class="ban-format-chip ${active.includes(name) ? 'ban-chip-active' : ''}"
                  onclick="Banlist.toggleActiveFormat('${name}')">${name}</span>`
        ).join('');

        const tabs = allKeys.map(name => `
            <button class="ban-tab-btn ${this.currentTab === name ? 'ban-tab-active' : ''}"
                    onclick="Banlist.switchTab('${name}')">${name}</button>`
        ).join('');

        return `
            <div class="ban-active-row">
                <span class="ban-label-text">Formato(s) activo(s):</span>
                <div class="ban-format-chips" id="ban-format-chips">${chips}</div>
            </div>
            <p class="ban-hint">Al elegir más de uno se aplica el baneo más restrictivo de cada carta.</p>
            <div class="ban-tabs">
                ${tabs}
                <button class="ban-tab-btn ban-tab-create"
                        onclick="Banlist.createCustomFormat()">＋ Crear Banlist</button>
            </div>
            <div class="ban-tab-body">
                ${this._buildTabContent(this.currentTab, data)}
            </div>`;
    },

    _buildTabContent: function (formatName, data) {
    const fmt = data?.formats?.[formatName];
    if (!fmt) return '<p class="stats-empty">Formato no encontrado.</p>';

    const isCustom   = fmt.isCustom;
    const isGenesys  = fmt.isGenesys || false;
    const isInverted = fmt.inverted || false;
    const lastUpd    = fmt.lastUpdated || '—';
    const cardCount  = Object.keys(fmt.cards).length;

    const officialBtns = (!isCustom && !isGenesys) ? `
    <button class="btn btn-sm btn-primary" id="ban-update-btn-${formatName}"
            onclick="Banlist.updateOfficialList('${formatName}')">🔄 Actualizar</button>
    <span class="ban-last-update">
        Última actualización: <span id="ban-date-${formatName}">${lastUpd}</span>
    </span>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.copyFormat('${formatName}')">📋 Copiar Banlist</button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.downloadTXT('${formatName}')">⬇️ .txt</button>` : '';

const customBtns = (isCustom && !isGenesys) ? `
    <button class="btn btn-sm btn-secondary"
            id="ban-invert-btn-${formatName}"
            style="${isInverted ? 'color:#fdcb6e;border-color:#fdcb6e;' : ''}"
            onclick="Banlist.toggleInverted('${formatName}')">
        🔄 ${isInverted ? 'Lista invertida (activa)' : 'Invertir lista'}
    </button>
    <button class="btn btn-sm btn-primary"
            onclick="CardViewer.openCardSearch('${formatName}')">＋ Agregar carta</button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.copyFormat('${formatName}')">📋 Copiar Banlist</button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.downloadTXT('${formatName}')">⬇️ .txt</button>
    <button class="btn btn-sm btn-danger"
            onclick="Banlist.deleteCustomFormat('${formatName}')">🗑️ Eliminar</button>` : '';

const genesisBtns = isGenesys ? `
    <button class="btn btn-sm btn-primary"
            onclick="CardViewer.openCardSearch('${formatName}', '', 'points')">
        ＋ Agregar carta
    </button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.copyFormat('${formatName}')">📋 Copiar Banlist</button>
    <button class="btn btn-sm btn-secondary"
            onclick="Banlist.downloadTXT('${formatName}')">⬇️ .txt</button>` : '';

    return `
        <div class="ban-tab-header">
            ${officialBtns}${customBtns}${genesisBtns}
            <span class="ban-card-count" id="ban-count-${formatName}">${cardCount} cartas</span>
        </div>
        <div id="banlist-cards-${formatName}" class="ban-cards-list">
            ${this.renderFormatList(formatName)}
        </div>`;
},
    renderFormatList: function (formatName) {
    const data = this.getData();
    const fmt  = data.formats[formatName];
    if (!fmt) return '';

    const isGenesys = fmt.isGenesys || false;

    const entries = Object.entries(fmt.cards).sort((a, b) => {
        if (isGenesys) return (b[1].points || 0) - (a[1].points || 0);
        return (this.STATUS_ORDER[a[1].status] ?? 9) - (this.STATUS_ORDER[b[1].status] ?? 9)
               || a[1].name.localeCompare(b[1].name);
    });

    if (entries.length === 0) {
        return `<p class="stats-empty">
            ${fmt.isCustom || isGenesys
                ? 'Sin cartas. Usa "Agregar carta" para poblar este formato.'
                : 'Sin datos. Usa "Actualizar" para descargar la lista oficial.'}
        </p>`;
    }

    return entries.map(([id, card]) => {
        const isStaple    = window.ConfigManager?.isStaple?.(id);
        const stapleBadge = isStaple ? '<span class="ban-staple-badge">📌 Staple</span>' : '';

        if (isGenesys) {
            const pts = card.points || 0;
            return `
                <div class="ban-card-row">
                    <img class="ban-card-img"
                         src="${card.img}"
                         onerror="this.style.display='none'" alt="${card.name}">
                    <div class="ban-card-info">
                        <div class="ban-card-name">${card.name} ${stapleBadge}</div>
                        <span class="ban-status-badge"
                              style="background:#1a1a1a;color:#fff;border:1px solid #555;">
                            ${pts} pts
                        </span>
                    </div>
                    <div class="ban-card-actions">
                        <button class="btn btn-sm btn-secondary"
                                onclick="Banlist.openChangeBan('${formatName}','${id}','${card.name.replace(/'/g,"\\'")}')">
                            Cambiar Puntos
                        </button>
                        <button class="btn btn-sm btn-secondary"
                                onclick="Banlist.viewCard('${id}')">Ver</button>
                        <button class="btn btn-sm btn-danger"
                                onclick="Banlist.removeCardFromFormat('${formatName}','${id}')">
                            Sacar
                        </button>
                    </div>
                </div>`;
        }

        const c   = this.STATUS_COLOR[card.status] || '#666';
        const t   = this.STATUS_TEXT[card.status]  || '#fff';
        const lbl = this.STATUS_LABEL[card.status] || card.status;

        return `
            <div class="ban-card-row">
                <img class="ban-card-img"
                     src="${card.img}"
                     onerror="this.style.display='none'" alt="${card.name}">
                <div class="ban-card-info">
                    <div class="ban-card-name">${card.name} ${stapleBadge}</div>
                    <span class="ban-status-badge" style="background:${c};color:${t};">${lbl}</span>
                </div>
                <div class="ban-card-actions">
                    <button class="btn btn-sm btn-secondary"
                            onclick="Banlist.openChangeBan('${formatName}','${id}','${card.name.replace(/'/g,"\\'")}')">
                        Cambiar Ban
                    </button>
                    <button class="btn btn-sm btn-secondary"
                            onclick="Banlist.viewCard('${id}')">Ver</button>
                    <button class="btn btn-sm btn-danger"
                            onclick="Banlist.removeCardFromFormat('${formatName}','${id}')">
                        Sacar
                    </button>
                </div>
            </div>`;
    }).join('');
},
openChangeBan: function (formatName, cardId, cardName) {
    const data      = this.getData();
    const isGenesys = data.formats[formatName]?.isGenesys;
    if (isGenesys) {
        const currentPts = this.getCardPoints(cardId);
        
        CardViewer.openPointsEditor(formatName, cardId, cardName, currentPts);
    } else {
        if (window.CardViewer) CardViewer.openCardSearch(formatName, cardName);
    }
},
    viewCard: function (cardId) {
        if (window.Estadisticas?.powerScoreCache?.cards) {
            const cached = Estadisticas.powerScoreCache.cards.find(c => String(c.cardId) === String(cardId));
            if (cached?.cardData && window.CardViewer) { CardViewer.open(cached.cardData); return; }
        }
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}`)
            .then(r => r.json())
            .then(d => { if (d.data?.[0] && window.CardViewer) CardViewer.open(d.data[0]); })
            .catch(() => {});
    },

    switchTab: function (name) {
        this.currentTab = name;
        this.renderSection();
    },

    refreshFormatChips: function () {
        const data    = this.getData();
        const active  = data.activeFormats;
        const chips   = document.getElementById('ban-format-chips');
        if (!chips) return;
        const allKeys = ['TCG', 'OCG', ...Object.keys(data.formats).filter(k => k !== 'TCG' && k !== 'OCG')];
        chips.innerHTML = allKeys.map(name =>
            `<span class="ban-format-chip ${active.includes(name) ? 'ban-chip-active' : ''}"
                   onclick="Banlist.toggleActiveFormat('${name}')">${name}</span>`
        ).join('');
    },
    // ── Genesys ──────────────────────────────────────────────────

isGenesysActive: function () {
    const data = this.getData();
    return data.activeFormats.some(f => data.formats[f]?.isGenesys);
},

getGenesysFormatName: function () {
    const data = this.getData();
    return Object.keys(data.formats).find(k => data.formats[k].isGenesys) || 'Genesys';
},

getCardPoints: function (cardId) {
    const data = this.getData();
    const id   = String(cardId);
    for (const fmt of Object.values(data.formats)) {
        if (fmt.isGenesys) return fmt.cards[id]?.points || 0;
    }
    return 0;
},

setCardPoints: function (formatName, cardId, cardMeta, points) {
    const data = this.getData();
    if (!data.formats[formatName]) return;
    const id  = String(cardId);
    const pts = Math.max(0, parseInt(points) || 0);
    if (pts === 0) {
        delete data.formats[formatName].cards[id];
    } else {
        data.formats[formatName].cards[id] = {
            name:   cardMeta.name || '',
            img:    cardMeta.img  || '',
            points: pts
        };
    }
    this.saveData(data);
},

getDeckPoints: function (cards) {
    if (!cards) return 0;
    const data   = this.getData();
    let   genFmt = null;
    for (const fmt of Object.values(data.formats)) {
        if (fmt.isGenesys) { genFmt = fmt; break; }
    }
    if (!genFmt) return 0;
    let total = 0;
    Object.entries(cards).forEach(([id, item]) => {
        if (item.location === 'side') return;
        const pts = genFmt.cards[String(id)]?.points || 0;
        total += pts * (item.qty || 1);
    });
    return total;
},

renderDeckPointsIndicator: function (cards) {
    const total = this.getDeckPoints(cards);
    return `
        <div class="genesys-points-indicator">
            <span class="gpi-label">⚙ Puntos Genesys</span>
            <span class="gpi-value">${total} pts</span>
            <span class="gpi-note">Main + Extra</span>
        </div>`;
},

// ── Copiar formato ────────────────────────────────────────────
copyFormat: function (sourceFormat) {
    const name = prompt(`Nombre para la copia de "${sourceFormat}":`);
    if (!name || !name.trim()) return;
    const key  = name.trim();
    const data = this.getData();
    if (data.formats[key]) { alert('Ya existe un formato con ese nombre.'); return; }

    const src = data.formats[sourceFormat];
    data.formats[key] = {
        cards:     JSON.parse(JSON.stringify(src.cards || {})),
        isCustom:  true,
        isGenesys: src.isGenesys || false,
        inverted:  src.inverted  || false
    };
    this.saveData(data);
    this.currentTab = key;
    this.renderSection();
},

// ── Descargar .txt ────────────────────────────────────────────
downloadTXT: function (formatName) {
    const data = this.getData();
    const fmt  = data.formats[formatName];
    if (!fmt) return;

    const entries = Object.entries(fmt.cards);
    if (!entries.length) { alert('Este formato no tiene cartas.'); return; }

    let txt = '';

    if (fmt.isGenesys) {
        // Orden descendente por puntos, bloques por rango
        const sorted = entries
            .map(([id, c]) => ({ name: c.name, pts: c.points || 0 }))
            .filter(c => c.pts > 0)
            .sort((a, b) => b.pts - a.pts);

        const high = sorted.filter(c => c.pts >= 51);
        const mid  = sorted.filter(c => c.pts >= 34 && c.pts <= 50);
        const low  = sorted.filter(c => c.pts >= 1  && c.pts <= 33);

        const block = (title, list) => list.length
            ? `${title}\n${'─'.repeat(title.length)}\n` +
              list.map(c => `${c.pts.toString().padStart(3)} pts  ${c.name}`).join('\n') + '\n\n'
            : '';

        txt += `GENESYS — ${formatName}\n${'═'.repeat(30)}\n\n`;
        txt += block('ALTO IMPACTO (51+ pts)',  high);
        txt += block('IMPACTO MEDIO (34–50 pts)', mid);
        txt += block('IMPACTO BAJO (1–33 pts)',  low);

    } else {
        // Banlist estándar por grupos
        const byStatus = { forbidden: [], limited: [], 'semi-limited': [] };
        entries.forEach(([_, c]) => {
            if (byStatus[c.status]) byStatus[c.status].push(c.name);
        });
        Object.values(byStatus).forEach(arr => arr.sort());

        const block = (title, list) => list.length
            ? `${title}\n${'─'.repeat(title.length)}\n` +
              list.map(n => `  ${n}`).join('\n') + '\n\n'
            : '';

        txt += `BANLIST — ${formatName}\n${'═'.repeat(30)}\n\n`;
        txt += block('PROHIBIDAS',     byStatus.forbidden);
        txt += block('LIMITADAS',      byStatus.limited);
        txt += block('SEMI-LIMITADAS', byStatus['semi-limited']);
    }

    txt += `Exportado desde Destiny Draw — ${new Date().toLocaleDateString('es-ES')}`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `banlist_${formatName.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
},
};

window.Banlist = Banlist;



// ── Engines — sidebar 4 tabs (Engines/Decks/Staples/Favoritas); gestión de engines guardados; imágenes de staples usan campo imageUrl ──

const Engines = {

    STORAGE_KEY: 'yugioh_engines',
    CARD_BACK:   'https://images.ygoprodeck.com/images/cards/back.jpg',
    _activeTab: 'saved',
    _activeTabBefore: null,
    _sidebarExpanded: false,

    // Estado del panel de creación
    _creating: {
        name:        '',
        cards:       {},
        roles:       [],
        notes:       '',
        coverCardId: null,
        coverCardImg: null
    },
    _searchTimeout: null,
    _searchResults: [],

    // ═══════════════════════════════════════════════════

    getAll: function () {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
        catch (_) { return []; }
    },

    saveAll: function (engines) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(engines)); }
        catch (_) {}
    },

    // ═══════════════════════════════════════════════════

    init: function () {
    if (document.getElementById('engines-sidebar')) {
        // Si ya existe, actualizar visibilidad según ContentManager
        const sidebar = document.getElementById('engines-sidebar');
        if (sidebar) {
            const visible = !window.ContentManager || ContentManager.isVisible('deck-engines');
            sidebar.style.display = visible ? '' : 'none';
        }
        return;
    }

    // Si ContentManager dice que no es visible, no crear el sidebar
    if (window.ContentManager && !ContentManager.isVisible('deck-engines')) return;

    const deckContainer = document.getElementById('deck-container');
    if (!deckContainer) return;

    // Crear wrapper flex DENTRO de mideck-content, sin tocar su display
    let wrapper = document.getElementById('mideck-flex-wrap');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id        = 'mideck-flex-wrap';
        wrapper.className = 'mideck-flex-wrap';
        deckContainer.parentNode.insertBefore(wrapper, deckContainer);
        wrapper.appendChild(deckContainer);
    }

    const sidebar = document.createElement('div');
    sidebar.id        = 'engines-sidebar';
    sidebar.className = 'engines-sidebar';
    wrapper.appendChild(sidebar);

    this._renderSidebar();
},
    // ═══════════════════════════════════════════════════

    _renderSidebar: function () {
    const sidebar = document.getElementById('engines-sidebar');
    if (!sidebar) return;

    sidebar.classList.toggle('eng-sidebar-expanded', this._sidebarExpanded !== false);

    const tab      = this._activeTab;
    const engines  = this.getAll();
    const tabs = [
        { id: 'engines',   label: '⚙️ Engines' },
        { id: 'saved',     label: '📁 Decks'   },
        { id: 'staples',   label: '📌 Staples' },
        { id: 'favoritas', label: '⭐ Favoritas'}
    ];

    // Contenido de cada panel
    const enginesHTML = `
        <div class="eng-sidebar-actions">
            <button class="eng-action-btn eng-btn-primary"
                    onclick="Engines.openCreatePanel()">＋ Añadir Engine</button>
            <button class="eng-action-btn eng-btn-secondary"
                    onclick="Engines.importYDK()">📥 Importar .ydk</button>
        </div>
        <div class="eng-list" id="eng-list">
            ${engines.length
                ? engines.map((e, i) => this._renderEngineItem(e, i)).join('')
                : '<div class="eng-empty">Sin engines guardados</div>'}
        </div>`;

    const savedHTML = `
        <div class="eng-list" id="eng-saved-list">
            ${this._renderSavedDeckItems()}
        </div>`;

    const staplesHTML = `
        <div class="eng-list" id="eng-staples-list">
            ${window.ConfigManager ? this._renderStaplesItems() : '<div class="eng-empty">Módulo no disponible.</div>'}
        </div>`;

    const favoritasHTML = `
        <div class="eng-list" id="eng-favoritas-list">
            ${window.Favoritas ? this._renderFavoritasItems() : '<div class="eng-empty">Módulo no disponible.</div>'}
        </div>`;

    const contentMap = {
        engines:   enginesHTML,
        saved:     savedHTML,
        staples:   staplesHTML,
        favoritas: favoritasHTML
    };

    sidebar.innerHTML = `
        <div class="eng-tabs eng-tabs-4">
            ${tabs.map(t => `
            <button class="eng-tab-btn ${tab === t.id ? 'eng-tab-active' : ''}"
                    onclick="Engines._switchTab('${t.id}')">${t.label}</button>`).join('')}
        </div>
        <div class="eng-panel-content">
            ${contentMap[tab] || ''}
        </div>`;
},

    _switchTab: function (tab) {
        if (this._activeTab === tab) {
            this._sidebarExpanded = !this._sidebarExpanded;
        } else {
            this._activeTab = tab;
            this._sidebarExpanded = true;
        }
        this._renderSidebar();
    },

_renderSavedDeckItems: function () {
        if (!window.Deck) return '<div class="eng-empty">Módulo de decks no disponible.</div>';
        const saved = Deck.getSavedDecks();
        if (!saved.length) return '<div class="eng-empty">Sin decks guardados.</div>';

        return saved.map(deck => {
            const cartaAs = Object.values(deck.cards).find(c => c.roles?.includes('Carta As'));
            const cover   = cartaAs || (window.Deck ? Deck.getMostRepeatedCard(deck.cards) : null);
            const img     = cover
                ? (cover.data?.card_images?.[0]?.image_url_small || cover.card_images?.[0]?.image_url_small || this.CARD_BACK)
                : this.CARD_BACK;

            const mainCount = Object.values(deck.cards)
                .filter(c => c.location === 'main').reduce((s, c) => s + c.qty, 0);
            const extraCount = Object.values(deck.cards)
                .filter(c => c.location === 'extra').reduce((s, c) => s + c.qty, 0);

            // Pts: promedio de sesiones de la versión VIGENTE del deck.
            // Se resetea automáticamente al guardar una versión nueva.
            let ptsHtml = '';
            const versionScore = Deck.getCurrentVersionScore(deck.name);
            if (versionScore) {
                const [ptsLbl, ptsCls] = Deck.getSessionScoreBadge(versionScore.avg);
                ptsHtml = `<div class="eng-item-pts ${ptsCls}">Pts: ${versionScore.avg} · ${ptsLbl} <span style="opacity:.55">(${versionScore.count})</span></div>`;
            } else if (Deck.getVersions(deck.name).length) {
                ptsHtml = `<div class="eng-item-pts" style="opacity:.4">Optimiza esta versión del Deck con Duelos</div>`;
            }

            // Winrate si está disponible
            let wrHtml = '';
            if (window.Winrate) {
                const wr    = Winrate.getRecord(deck.name);
                const total = wr.wins1st + wr.wins2nd + wr.losses1st + wr.losses2nd;
                if (total > 0) {
                    const pct = Winrate.calcWinrate(wr.wins1st + wr.wins2nd, wr.losses1st + wr.losses2nd);
                    const col = pct >= 60 ? '#00b894' : pct >= 45 ? '#fdcb6e' : '#d63031';
                    wrHtml = `<div class="eng-item-stats" style="color:${col}">WR ${pct}% (${total})</div>`;
                }
            }

            return `
<div class="eng-item">
    <img src="${img}" class="eng-item-img" onerror="this.src='${this.CARD_BACK}'"
         onclick="Deck.openLoadDeckPanel('${deck.name}')">
    <div class="eng-item-info">
        <div class="eng-item-name">${deck.name}</div>
        <div class="eng-item-counts">M:${mainCount} · E:${extraCount}</div>
        ${ptsHtml}
        ${deck.uid ? `<div class="eng-item-counts">ID: ${deck.uid}</div>` : ''}
        ${wrHtml}
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Ver / Cargar"
                onclick="Deck.openLoadDeckPanel('${deck.name}')">📂</button>
        <button class="eng-item-delete" title="Eliminar"
                onclick="Deck.openDeleteDeckPanel('${deck.name}');Engines._renderSidebar()">✖</button>
    </div>
</div>`;
        }).join('');
    },

    _renderEngineItem: function (engine, idx) {
    const img  = engine.coverCardImg || this.CARD_BACK;
    const s    = engine.stats || {};
    const mainCount  = Object.values(engine.cards || {})
        .filter(c => c.location === 'main')
        .reduce((sum, c) => sum + (c.qty || 1), 0);
    const extraCount = Object.values(engine.cards || {})
        .filter(c => c.location === 'extra')
        .reduce((sum, c) => sum + (c.qty || 1), 0);

    const statLine = [
        s.consistency > 0 ? `Cons: <b>+${s.consistency.toFixed(1)}</b>` : '',
        s.power       > 0 ? `Pot: <b>+${s.power.toFixed(1)}</b>`        : '',
        s.resilience  > 0 ? `Res: <b>+${s.resilience.toFixed(1)}</b>`   : ''
    ].filter(Boolean).join(' · ');

    return `
<div class="eng-item" onclick="Engines.clickEngine(${idx})">
    <img src="${img}" class="eng-item-img" onerror="this.src='${this.CARD_BACK}'">
    <div class="eng-item-info">
        <div class="eng-item-name">${engine.name}</div>
        <div class="eng-item-counts">M:${mainCount} · E:${extraCount}</div>
        ${statLine ? `<div class="eng-item-stats">${statLine}</div>` : ''}
        ${engine.roles?.length ? `<div class="eng-item-roles">${engine.roles.map(r =>
            `<span class="eng-role-chip">${r}</span>`).join('')}</div>` : ''}
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Editar"
                onclick="event.stopPropagation(); Engines.openEditPanel(${idx})">✏️</button>
        <button class="eng-item-delete" title="Eliminar"
                onclick="event.stopPropagation(); Engines.deleteEngine(${idx})">✕</button>
    </div>
</div>`;
},

    // ═══════════════════════════════════════════════════

    clickEngine: function (idx) {
        const engines = this.getAll();
        const engine  = engines[idx];
        if (!engine) return;

        if (!window.Deck || Object.keys(Deck.cards).length === 0) {
            alert(`Engine "${engine.name}" seleccionado, pero no hay ningún deck cargado. Carga primero un deck desde Decks Guardados.`);
            return;
        }

        if (!confirm(`¿Agregar el engine "${engine.name}" al deck "${Deck.name}"?\n\nSe respetará el límite de 3 copias por carta.`)) return;

        let added = 0;
        Object.entries(engine.cards || {}).forEach(([id, item]) => {
            const current = Deck.cards[id];
            const currentQty = current ? current.qty : 0;
            const canAdd  = Math.min(item.qty || 1, 3 - currentQty);
            if (canAdd <= 0) return;

            if (current) {
                current.qty += canAdd;
            } else {
                Deck.cards[id] = {
                    data:     item.data,
                    qty:      canAdd,
                    location: item.location,
                    roles:    window.Deck ? Deck.autoAssignRoles(item.data) : []
                };
            }
            added++;
        });

        Deck.render();
        alert(`Engine "${engine.name}" añadido. ${added} cartas actualizadas.`);
    },

    // ═══════════════════════════════════════════════════

    deleteEngine: function (idx) {
        const engines = this.getAll();
        if (!confirm(`¿Eliminar el engine "${engines[idx]?.name}"?`)) return;
        engines.splice(idx, 1);
        this.saveAll(engines);
        this._renderSidebar();
    },

    // ═══════════════════════════════════════════════════

    openCreatePanel: function () {
        this._creating = {
            name: '', cards: {}, roles: [], notes: '',
            coverCardId: null, coverCardImg: null
        };
        this._showCreateModal();
    },

    _showCreateModal: function () {
        document.getElementById('eng-modal')?.remove();

        const roles    = window.ConfigManager ? ConfigManager.getRoleNames() : [];
        const specs    = window.ConfigManager ? ConfigManager.getSpecialties() : [];
        const allTags  = [...new Set([
            ...roles,
            ...specs.map(s => s.mechanicRole).filter(Boolean),
            ...specs.map(s => s.counterRole).filter(Boolean)
        ])].filter(Boolean).sort();

        const overlay = document.createElement('div');
        overlay.id        = 'eng-modal';
        overlay.className = 'eng-modal';
        overlay.onclick   = e => { if (e.target === overlay) this.closeCreatePanel(); };

        overlay.innerHTML = `
<div class="eng-modal-box">
    <div class="eng-modal-header">
        <span>Nuevo Engine</span>
        <button class="eng-modal-close" onclick="Engines.closeCreatePanel()">✕</button>
    </div>

    <!-- Nombre -->
    <label class="eng-label">Nombre del Engine</label>
    <input type="text" id="eng-name-input" class="eng-input"
           placeholder="Ej: Paquete de búsqueda Infernoble..."
           oninput="Engines._creating.name = this.value">

    <!-- Layout principal: buscador + preview -->
    <div class="eng-create-layout">

        <!-- Columna izquierda: buscador + cartas -->
        <div class="eng-create-left">
            <label class="eng-label">Buscar cartas</label>
            <div class="eng-search-row">
                <input type="text" id="eng-search-input" class="eng-input"
                       placeholder="Nombre de la carta..."
                       oninput="Engines._onSearchInput()">
            </div>
            <div id="eng-search-results" class="eng-search-results">
                <div class="eng-search-hint">Escribe para buscar</div>
            </div>

            <!-- Cartas del engine -->
            <div class="eng-cards-header">
                <span class="eng-label">Cartas del Engine</span>
                <span class="eng-counters">
                    Main: <strong id="eng-count-main">0</strong> ·
                    Extra: <strong id="eng-count-extra">0</strong>
                </span>
            </div>
            <div id="eng-cards-grid" class="eng-cards-grid">
                <div class="eng-cards-empty">Sin cartas añadidas</div>
            </div>
        </div>

        <!-- Columna derecha: portada + tags + notas -->
        <div class="eng-create-right">

            <!-- Carta portada -->
            <label class="eng-label">Carta de Portada</label>
            <div class="eng-cover-slot" onclick="Engines.openCoverPicker()">
                <img id="eng-cover-img" src="${this.CARD_BACK}"
                     class="eng-cover-img" alt="Portada">
                <div class="eng-cover-hint">Toca para elegir</div>
            </div>

            <!-- Roles / mecánicas -->
            <label class="eng-label" style="margin-top:12px">Roles / Mecánicas que apoya</label>
            <div class="eng-roles-dropdown-wrap">
                <button class="eng-dropdown-btn"
                        onclick="Engines.toggleRolesDropdown()">
                    Seleccionar roles ▼
                </button>
                <div id="eng-roles-dropdown" class="eng-roles-dropdown" style="display:none">
                    ${allTags.map(tag => `
                    <label class="eng-role-opt">
                        <input type="checkbox" value="${tag}"
                               onchange="Engines._toggleRole('${tag}', this.checked)">
                        ${tag}
                    </label>`).join('')}
                    ${!allTags.length ? '<span class="eng-search-hint">No hay roles definidos en Config</span>' : ''}
                </div>
            </div>
            <div id="eng-selected-roles" class="eng-selected-roles"></div>

            <!-- Notas -->
            <label class="eng-label" style="margin-top:12px">Notas</label>
            <textarea id="eng-notes-input" class="eng-notes"
                      placeholder="Combos, sinergias, cómo usar este engine..."
                      oninput="Engines._creating.notes = this.value"></textarea>
        </div>
    </div>

    <!-- Botones de acción -->
    <div class="eng-modal-footer">
        <button class="eng-action-btn eng-btn-secondary"
                onclick="Engines.downloadCreatingYDK()">⬇️ Descargar .ydk</button>
        <button class="eng-action-btn eng-btn-primary"
                onclick="Engines.saveEngine()">✅ Crear Engine</button>
    </div>
</div>`;

        document.body.appendChild(overlay);
    },

    closeCreatePanel: function () {
        document.getElementById('eng-modal')?.remove();
        document.getElementById('eng-cover-picker')?.remove();
    },

    // ═══════════════════════════════════════════════════

    _onSearchInput: function () {
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => this._doSearch(), 380);
    },

    _doSearch: async function () {
        const q   = document.getElementById('eng-search-input')?.value?.trim();
        const box = document.getElementById('eng-search-results');
        if (!box) return;
        if (!q || q.length < 2) {
            box.innerHTML = '<div class="eng-search-hint">Escribe al menos 2 caracteres</div>';
            return;
        }
        box.innerHTML = '<div class="eng-search-hint">Buscando...</div>';
        try {
            const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}&num=30&offset=0`);
            const data = await res.json();
            if (!data.data?.length) { box.innerHTML = '<div class="eng-search-hint">Sin resultados</div>'; return; }
            this._searchResults = data.data;
            box.innerHTML = data.data.map((card, i) => {
                const img      = card.card_images?.[0]?.image_url_small || this.CARD_BACK;
                const existing = this._creating.cards[String(card.id)]?.qty || 0;
                return `
<div class="eng-sitem">
    <img src="${img}" class="eng-sitem-img" loading="lazy">
    <div class="eng-sitem-name">${card.name}</div>
    <div class="eng-sitem-btns">
        <button class="eng-qty-btn ${existing >= 1 ? 'eng-qty-active' : ''}"
                ${existing >= 3 ? 'disabled' : ''}
                onclick="Engines.addCard(${i}, 1)">x1</button>
        <button class="eng-qty-btn ${existing >= 2 ? 'eng-qty-active' : ''}"
                ${existing >= 2 ? 'disabled' : ''}
                onclick="Engines.addCard(${i}, 2)">x2</button>
        <button class="eng-qty-btn ${existing >= 3 ? 'eng-qty-active' : ''}"
                ${existing >= 1 ? 'disabled' : ''}
                onclick="Engines.addCard(${i}, 3)">x3</button>
    </div>
</div>`;
            }).join('');
        } catch (_) { box.innerHTML = '<div class="eng-search-hint">Error de conexión</div>'; }
    },

    addCard: function (searchIdx, qty) {
        const card = this._searchResults[searchIdx];
        if (!card) return;
        const id       = String(card.id);
        const isExtra  = window.Deck ? Deck.isExtraDeckCard(card) : this._isExtraCard(card);
        const location = isExtra ? 'extra' : 'main';
        const existing = this._creating.cards[id]?.qty || 0;
        const final    = Math.min(3, existing + qty);
        if (final <= existing) return;

        this._creating.cards[id] = {
            data: card,
            qty:  final,
            location
        };
        this._refreshCardsGrid();
        this._doSearch();
    },

    removeCard: function (cardId) {
        const item = this._creating.cards[cardId];
        if (!item) return;
        if (item.qty > 1) item.qty--;
        else delete this._creating.cards[cardId];
        this._refreshCardsGrid();
        this._doSearch();
    },

    _isExtraCard: function (card) {
        const t = (card.type || '').toLowerCase();
        return t.includes('fusion') || t.includes('synchro') || t.includes('xyz') || t.includes('link');
    },

    _refreshCardsGrid: function () {
        const grid = document.getElementById('eng-cards-grid');
        if (!grid) return;

        const entries = Object.entries(this._creating.cards);
        if (!entries.length) {
            grid.innerHTML = '<div class="eng-cards-empty">Sin cartas añadidas</div>';
        } else {
            grid.innerHTML = entries.map(([id, item]) => {
                const img = item.data?.card_images?.[0]?.image_url_small || this.CARD_BACK;
                return `
<div class="eng-card-thumb">
    <img src="${img}" class="eng-card-thumb-img" loading="lazy">
    <div class="eng-card-qty">x${item.qty}</div>
    <button class="eng-card-remove" onclick="Engines.removeCard('${id}')">✕</button>
</div>`;
            }).join('');
        }

        // Actualizar contadores
        const mainCount  = entries.filter(([,c]) => c.location === 'main') .reduce((s,[,c]) => s+c.qty,0);
        const extraCount = entries.filter(([,c]) => c.location === 'extra').reduce((s,[,c]) => s+c.qty,0);
        const mEl = document.getElementById('eng-count-main');
        const eEl = document.getElementById('eng-count-extra');
        if (mEl) mEl.textContent  = mainCount;
        if (eEl) eEl.textContent  = extraCount;
    },

    // ═══════════════════════════════════════════════════

    openCoverPicker: function () {
        document.getElementById('eng-cover-picker')?.remove();

        const entries = Object.entries(this._creating.cards);
        if (!entries.length) { alert('Añade cartas al engine primero.'); return; }

        const picker = document.createElement('div');
        picker.id        = 'eng-cover-picker';
        picker.className = 'eng-cover-picker';
        picker.onclick   = e => { if (e.target === picker) picker.remove(); };

        picker.innerHTML = `
<div class="eng-cover-picker-box">
    <div class="eng-modal-header">
        <span>Elegir Portada</span>
        <button class="eng-modal-close" onclick="document.getElementById('eng-cover-picker').remove()">✕</button>
    </div>
    <div class="eng-cover-picker-grid">
        ${entries.map(([id, item]) => {
            const img = item.data?.card_images?.[0]?.image_url_small || this.CARD_BACK;
            return `
<div class="eng-cover-option" onclick="Engines.setCover('${id}', '${img}')">
    <img src="${img}" class="eng-cover-option-img">
    <div class="eng-cover-option-name">${item.data?.name || id}</div>
</div>`;
        }).join('')}
    </div>
</div>`;

        document.body.appendChild(picker);
    },

    setCover: function (cardId, imgUrl) {
        this._creating.coverCardId  = cardId;
        this._creating.coverCardImg = imgUrl;
        const img = document.getElementById('eng-cover-img');
        if (img) img.src = imgUrl;
        document.getElementById('eng-cover-picker')?.remove();
    },

    // ═══════════════════════════════════════════════════

    toggleRolesDropdown: function () {
        const dd = document.getElementById('eng-roles-dropdown');
        if (dd) dd.style.display = dd.style.display === 'none' ? '' : 'none';
    },

    _toggleRole: function (role, checked) {
        if (checked) {
            if (!this._creating.roles.includes(role)) this._creating.roles.push(role);
        } else {
            this._creating.roles = this._creating.roles.filter(r => r !== role);
        }
        this._refreshSelectedRoles();
    },

    _refreshSelectedRoles: function () {
        const el = document.getElementById('eng-selected-roles');
        if (!el) return;
        el.innerHTML = this._creating.roles.map(r =>
            `<span class="eng-role-chip">${r}</span>`).join('') ||
            '<span class="eng-search-hint">Sin roles seleccionados</span>';
    },

    // ═══════════════════════════════════════════════════

    saveEngine: function () {
        const name = (document.getElementById('eng-name-input')?.value || this._creating.name).trim();
        if (!name) { alert('Escribe un nombre para el engine.'); return; }
        if (!Object.keys(this._creating.cards).length) { alert('Añade al menos una carta.'); return; }

        // Calcular stats con Stats.calculateInternalScore si disponible
        let stats = { consistency: 0, power: 0, resilience: 0 };
        if (window.Stats) {
            // Preparar cards con autoAssignRoles
            const cardsForStats = {};
            Object.entries(this._creating.cards).forEach(([id, item]) => {
                const roles = window.Deck ? Deck.autoAssignRoles(item.data) : [];
                cardsForStats[id] = { ...item, roles };
            });
            const result = Stats.calculateInternalScore(cardsForStats);
            stats = { consistency: result.consistency, power: result.power, resilience: result.resilience };
        }

        const engines = this.getAll();
        engines.push({
            name,
            coverCardId:  this._creating.coverCardId,
            coverCardImg: this._creating.coverCardImg || this.CARD_BACK,
            cards:        this._creating.cards,
            roles:        this._creating.roles,
            notes:        this._creating.notes,
            stats,
            createdAt:    Date.now()
        });

        this.saveAll(engines);
        this.closeCreatePanel();
        this._renderSidebar();
    },

    // ═══════════════════════════════════════════════════

    downloadCreatingYDK: function () {
        this._downloadCardsAsYDK(this._creating.cards,
            (document.getElementById('eng-name-input')?.value || 'engine').trim() || 'engine');
    },

    downloadEngineYDK: function (idx) {
        const engine = this.getAll()[idx];
        if (!engine) return;
        this._downloadCardsAsYDK(engine.cards, engine.name);
    },

    _downloadCardsAsYDK: function (cards, filename) {
        let main = '', extra = '', side = '';
        Object.entries(cards || {}).forEach(([id, item]) => {
            for (let i = 0; i < (item.qty || 1); i++) {
                if (item.location === 'main')  main  += id + '\n';
                if (item.location === 'extra') extra += id + '\n';
                if (item.location === 'side')  side  += id + '\n';
            }
        });
        const content = `#created by Destiny Draw\n#main\n${main}#extra\n${extra}!side\n${side}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = `${filename.replace(/[^a-z0-9]/gi, '_')}.ydk`;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    // ═══════════════════════════════════════════════════

    importYDK: function () {
        const input   = document.createElement('input');
        input.type    = 'file';
        input.accept  = '.ydk';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            await this._parseAndOpenYDK(text, file.name.replace('.ydk', ''));
        };
        input.click();
    },

    _parseAndOpenYDK: async function (content, defaultName) {
        const lines   = content.split('\n').map(l => l.trim()).filter(l => l);
        const cardIds = { main: [], extra: [], side: [] };
        let section   = 'main';

        lines.forEach(line => {
            if (line.startsWith('#main'))  { section = 'main';  return; }
            if (line.startsWith('#extra')) { section = 'extra'; return; }
            if (line.startsWith('!side'))  { section = 'side';  return; }
            if (line.startsWith('#') || line.startsWith('!')) return;
            if (/^\d+$/.test(line)) cardIds[section].push(line);
        });

        const counts = {};
        const locs   = {};
        ['main','extra','side'].forEach(loc => {
            cardIds[loc].forEach(id => {
                counts[id] = Math.min(3, (counts[id] || 0) + 1);
                if (!locs[id]) locs[id] = loc;
            });
        });

        const uniqueIds = Object.keys(counts);
        if (!uniqueIds.length) { alert('No se encontraron cartas en el archivo.'); return; }

        this.openCreatePanel();
        document.getElementById('eng-name-input').value = defaultName;
        this._creating.name = defaultName;

        const loadingEl = document.getElementById('eng-cards-grid');
        if (loadingEl) loadingEl.innerHTML = '<div class="eng-cards-empty">Cargando cartas...</div>';

        try {
            const chunks = [];
            for (let i = 0; i < uniqueIds.length; i += 50) chunks.push(uniqueIds.slice(i, i+50));

            for (const chunk of chunks) {
                const res  = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${chunk.join(',')}`);
                const data = await res.json();
                (data.data || []).forEach(card => {
                    const id  = String(card.id);
                    this._creating.cards[id] = {
                        data:     card,
                        qty:      counts[id] || 1,
                        location: locs[id]  || 'main'
                    };
                });
            }
        } catch (_) { alert('Error al cargar cartas de la API.'); }

        this._refreshCardsGrid();
    },
    openEditPanel: function (idx) {
    const engines = this.getAll();
    const engine  = engines[idx];
    if (!engine) return;

    this._creating = {
        name:         engine.name,
        cards:        JSON.parse(JSON.stringify(engine.cards || {})),
        roles:        [...(engine.roles || [])],
        notes:        engine.notes || '',
        coverCardId:  engine.coverCardId  || null,
        coverCardImg: engine.coverCardImg || null,
        _editIdx:     idx
    };

    this._showCreateModal();

    requestAnimationFrame(() => {
        const nameInput = document.getElementById('eng-name-input');
        if (nameInput) nameInput.value = engine.name;

        const coverImg = document.getElementById('eng-cover-img');
        if (coverImg && engine.coverCardImg) coverImg.src = engine.coverCardImg;

        document.querySelectorAll('#eng-roles-dropdown input[type=checkbox]').forEach(cb => {
            cb.checked = this._creating.roles.includes(cb.value);
        });
        this._refreshSelectedRoles();

        const notesInput = document.getElementById('eng-notes-input');
        if (notesInput) notesInput.value = engine.notes || '';

        this._refreshCardsGrid();

        // Cambiar texto del botón de crear
        const footer = document.querySelector('#eng-modal .eng-modal-footer');
        if (footer) {
            const saveBtn = footer.querySelector('.eng-btn-primary');
            if (saveBtn) {
                saveBtn.textContent = '💾 Guardar Cambios';
                saveBtn.onclick     = () => Engines.saveEditEngine();
            }
        }
    });
},

saveEditEngine: function () {
    const idx = this._creating._editIdx;
    if (idx === undefined || idx === null) { this.saveEngine(); return; }

    const name = (document.getElementById('eng-name-input')?.value || this._creating.name).trim();
    if (!name) { alert('Escribe un nombre para el engine.'); return; }
    if (!Object.keys(this._creating.cards).length) { alert('Añade al menos una carta.'); return; }

    let stats = { consistency: 0, power: 0, resilience: 0 };
    if (window.Stats) {
        const cardsForStats = {};
        Object.entries(this._creating.cards).forEach(([id, item]) => {
            cardsForStats[id] = { ...item, roles: window.Deck ? Deck.autoAssignRoles(item.data) : [] };
        });
        const result = Stats.calculateInternalScore(cardsForStats);
        stats = { consistency: result.consistency, power: result.power, resilience: result.resilience };
    }

    const engines = this.getAll();
    engines[idx] = {
        ...engines[idx],
        name,
        coverCardId:  this._creating.coverCardId,
        coverCardImg: this._creating.coverCardImg || this.CARD_BACK,
        cards:        this._creating.cards,
        roles:        this._creating.roles,
        notes:        this._creating.notes,
        stats
    };

    this.saveAll(engines);
    this.closeCreatePanel();
    this._renderSidebar();
},
_renderStaplesItems: function () {
    const staples = ConfigManager.getStaples();
    const ids     = ConfigManager.getStapleIds();
    if (!ids.length) return '<div class="eng-empty">Sin staples en este formato.</div>';

    ConfigManager._staplePanelCards = ids.map(id => staples[id]);

    const BACK = this.CARD_BACK;
    return ids.map((id, idx) => {
        const s   = staples[id] || {};
        const img = s.imageUrl || `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`;
        const name = s.name || id;
        return `
<div class="eng-item">
    <img src="${img}" class="eng-item-img" onerror="this.src='${BACK}'"
         onclick="ConfigManager.openStapleCard(${idx})">
    <div class="eng-item-info">
        <div class="eng-item-name">${name}</div>
        <div class="eng-item-counts">${s.type || ''}</div>
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Añadir al deck"
                onclick="ConfigManager.addStapleToDeck(${idx})">＋</button>
        <button class="eng-item-delete" title="Quitar staple"
                onclick="ConfigManager.deleteStaple('${id}');Engines._renderSidebar()">✕</button>
    </div>
</div>`;
    }).join('');
},

_renderFavoritasItems: function () {
    const all = Favoritas.getAll();
    const ids = Object.keys(all);
    if (!ids.length) return '<div class="eng-empty">Sin favoritas guardadas.</div>';
    const BACK = this.CARD_BACK;
    return ids.map((id, idx) => {
        const f   = all[id];
        const img = f.img || f.data?.card_images?.[0]?.image_url_small || BACK;
        return `
<div class="eng-item">
    <img src="${img}" class="eng-item-img" onerror="this.src='${BACK}'"
         onclick="Favoritas.viewCard(${idx})">
    <div class="eng-item-info">
        <div class="eng-item-name">${f.name || id}</div>
    </div>
    <div class="eng-item-btns">
        <button class="eng-item-edit" title="Añadir al deck"
                onclick="Favoritas.addCard(${idx})">＋</button>
        <button class="eng-item-delete" title="Quitar favorita"
                onclick="Favoritas.remove('${id}');Engines._renderSidebar()">✕</button>
    </div>
</div>`;
    }).join('');
},
};

window.Engines = Engines;
document.addEventListener('DOMContentLoaded', () => {
});