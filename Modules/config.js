/* ====================================
   CONFIG MODULE - Destiny Draw
   Versión Unificada CORRECTA
   ==================================== */

const Config = {
    container: null,

    init: function () {
        this.container = document.getElementById('config-content');
        if (!this.container) { 
            console.error('Config: contenedor no encontrado'); 
            return; 
        }
        this.render();
    },

    render: function () {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <h2>Configuración</h2>

            <!-- Sección: Roles y Palabras Asociadas -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('roles-section')">
                    ▶ Roles y Palabras Asociadas
                </h3>
                <div id="roles-section" class="config-section-content" style="display:none;">
                    ${this.renderRolesSection()}
                </div>
            </div>

            <!-- Sección: Mecánicas y Counters -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('specialties-section')">
                    ▶ Mecánicas y Counters
                </h3>
                <div id="specialties-section" class="config-section-content" style="display:none;">
                    ${this.renderSpecialtiesSection()}
                </div>
            </div>

            <!-- Sección: Lista de Staples -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('staples-section')">
                    ▶ Lista de Staples
                </h3>
                <div id="staples-section" class="config-section-content">
                    ${this.renderStaplesSection()}
                </div>
            </div>

            <!-- Sección: Nomenclatura de Efectos -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('nomenclature-section')">
                    ▶ Nomenclatura de Efectos
                </h3>
                <div id="nomenclature-section" class="config-section-content" style="display:none;">
                    ${this.renderNomenclatureSection()}
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="config-actions">
                <button class="btn btn-primary" onclick="Config.exportConfig()">📥 Exportar Data</button>
                <button class="btn btn-primary" onclick="Config.importConfig()">📤 Importar Data</button>
                <button class="btn btn-danger" onclick="Config.borrarTodo()" style="background:#c0392b;">🗑️ Borrar Data</button>
                <button class="btn btn-success" onclick="Config.resetToDefault()" style="background:#27ae60;border-color:#27ae60;">🔄 Restaurar Configuración</button>
            </div>

            <!-- Zona de borrado -->
            <div class="config-danger-zone">
                <div class="config-danger-title">⚠️ Zona de borrado</div>
                <div class="config-danger-buttons">
                    <button class="btn btn-danger" onclick="Config.borrarDeck()">
                        🗑️ Borrar Deck
                        <small style="display:block;font-weight:normal;font-size:0.7rem;opacity:0.75;">
                            Decks guardados, winrates, notas, cache de scores
                        </small>
                    </button>
                    <button class="btn btn-danger" onclick="Config.borrarMeta()">
                        🗑️ Borrar META
                        <small style="display:block;font-weight:normal;font-size:0.7rem;opacity:0.75;">
                            Carpetas, decks importados, poder de cartas calculado
                        </small>
                    </button>
                </div>
            </div>
            
            <input type="file" id="config-import-file" accept=".txt" style="display:none;" onchange="Config.handleFileImport(this)">
        `;
    },

    // ===============================
    // SECCIÓN DE ROLES
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
        const keywords     = roleCondition ? (roleCondition.keywords || []) : [];
        const conditionals = roleCondition ? (roleCondition.conditionals || []) : [];

        const kwChips = keywords.map(kw => `
            <div class="keyword-chip">
                <span class="chip-text">${kw}</span>
                <span class="chip-remove" onclick="Config.removeCondKeyword('${roleName}','${kw.replace(/'/g, "\\'")}')">×</span>
            </div>`).join('');

        const condChips = conditionals.map(c => `
            <div class="keyword-chip conditional-chip">
                <span class="chip-text">${c}</span>
                <span class="chip-remove" onclick="Config.removeConditional('${roleName}','${c.replace(/'/g, "\\'")}')">×</span>
            </div>`).join('');

        return `
            <div class="role-card" data-role="${roleName}">
                <div class="role-card-header">
                    <input type="text" class="role-name-input" value="${roleName}"
                        data-original="${roleName}"
                        onblur="Config.renameRole(this)"
                        onkeydown="if(event.key==='Enter')this.blur()">
                    <button class="btn-delete-role" onclick="Config.deleteRole('${roleName}')" title="Eliminar rol">🗑️</button>
                </div>
                <div class="role-card-body">

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
                    <div class="role-nom-filter-row">
                        <label class="config-label" style="margin-bottom:4px;">
                            Restringir detección a Nomenclatura
                            <small style="font-weight:normal;color:rgba(241,241,241,0.45);">
                                — solo busca keywords dentro de esas oraciones del efecto
                            </small>
                        </label>
                        <select class="role-nom-select"
                            onchange="ConfigManager.setRoleNomenclatureCategory('${roleName}', this.value)">
                            ${Config.renderNomCategoryOptions(
                                (roleCondition || {}).nomenclatureCategory
                            )}
                        </select>
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

    // ===============================
    // SECCIÓN DE ESPECIALIDADES (pares horizontales)
    // ===============================
    renderSpecialtiesSection: function () {
        const pairs = ConfigManager.getSpecialties();
        const roles = ConfigManager.getRoleNames();
        const roleOpts = (sel) => ['', ...roles].map(r =>
            `<option value="${r}" ${r === sel ? 'selected' : ''}>${r || '-- Sin rol --'}</option>`
        ).join('');

        let html = `
            <div class="config-help-text">
                <p><strong>Especialidades:</strong> Pares de Especialización y Counter asociado.</p>
                <small>Los keywords son internos — no se exponen en texto. Se usan para análisis automático de cartas.</small>
            </div>
            <div style="margin-bottom:var(--spacing-md);">
                <button class="btn btn-primary" onclick="Config.createSpecialtyPair()">➕ Nuevo Par</button>
            </div>
            <div class="specialty-pairs-list">`;

        if (pairs.length === 0) {
            html += '<p class="empty-chips" style="padding:var(--spacing-md);">No hay pares configurados</p>';
        }

        pairs.forEach(pair => {
            const specKwChips = (pair.specialization.keywords || []).map(kw =>
                `<div class="keyword-chip spec-kw-chip">
                    <span class="chip-text">${kw}</span>
                    <span class="chip-remove" onclick="Config.removeSpecKw('${pair.id}','specialization','${kw.replace(/'/g, "\\'")}')">×</span>
                </div>`).join('');

            const counterKwChips = (pair.counter.keywords || []).map(kw =>
                `<div class="keyword-chip counter-kw-chip">
                    <span class="chip-text">${kw}</span>
                    <span class="chip-remove" onclick="Config.removeSpecKw('${pair.id}','counter','${kw.replace(/'/g, "\\'")}')">×</span>
                </div>`).join('');

            html += `
                <div class="specialty-pair-row">
                    <!-- Lado Especialización -->
                    <div class="specialty-half spec-side">
                        <div class="specialty-half-header">
                            <span class="spec-badge">Especialización</span>
                        </div>
                        <input type="text" class="role-name-input" value="${pair.specialization.name}"
                            style="margin-bottom:6px;"
                            onblur="ConfigManager.updateSpecialtyPairField('${pair.id}','specialization','name',this.value)"
                            onkeydown="if(event.key==='Enter')this.blur()">
                        <label class="config-label" style="font-size:0.8rem;margin-bottom:2px;">Rol asociado:</label>
                        <select class="keyword-input" style="margin-bottom:8px;"
                            onchange="ConfigManager.updateSpecialtyPairField('${pair.id}','specialization','rol',this.value)">
                            ${roleOpts(pair.specialization.rol)}
                        </select>
                        <label class="config-label" style="font-size:0.8rem;">Keywords:</label>
                        <div class="keywords-container" style="min-height:34px;">
                            ${specKwChips || '<span class="empty-chips" style="font-size:0.75rem;">Sin keywords</span>'}
                        </div>
                        <div class="add-keyword-container">
                            <input type="text" id="spec-kw-${pair.id}" class="keyword-input" placeholder="Keyword...">
                            <button class="btn btn-sm" onclick="Config.addSpecKw('${pair.id}','specialization',document.getElementById('spec-kw-${pair.id}'))">+</button>
                        </div>
                    </div>

                    <div class="specialty-connector">⟷</div>

                    <!-- Lado Counter -->
                    <div class="specialty-half counter-side">
                        <div class="specialty-half-header">
                            <span class="counter-badge">Counter</span>
                        </div>
                        <input type="text" class="role-name-input" value="${pair.counter.name}"
                            style="margin-bottom:6px;"
                            onblur="ConfigManager.updateSpecialtyPairField('${pair.id}','counter','name',this.value)"
                            onkeydown="if(event.key==='Enter')this.blur()">
                        <label class="config-label" style="font-size:0.8rem;margin-bottom:2px;">Rol asociado:</label>
                        <select class="keyword-input" style="margin-bottom:8px;"
                            onchange="ConfigManager.updateSpecialtyPairField('${pair.id}','counter','rol',this.value)">
                            ${roleOpts(pair.counter.rol)}
                        </select>
                        <label class="config-label" style="font-size:0.8rem;">Keywords:</label>
                        <div class="keywords-container" style="min-height:34px;">
                            ${counterKwChips || '<span class="empty-chips" style="font-size:0.75rem;">Sin keywords</span>'}
                        </div>
                        <div class="add-keyword-container">
                            <input type="text" id="counter-kw-${pair.id}" class="keyword-input" placeholder="Keyword...">
                            <button class="btn btn-sm btn-counter" onclick="Config.addSpecKw('${pair.id}','counter',document.getElementById('counter-kw-${pair.id}'))">+</button>
                        </div>
                    </div>

                    <button class="btn-delete-role" onclick="Config.deleteSpecialtyPair('${pair.id}')" 
                        style="position:absolute;top:8px;right:8px;" title="Eliminar par">🗑️</button>
                </div>`;
        });

        html += '</div>';
        return html;
    },

    // ===============================
    // SECCIÓN DE STAPLES (grid de imágenes)
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
    // SECCIÓN DE NOMENCLATURA (Compatible con cardviewer)
    // ===============================
    renderNomenclatureSection: function () {
        const nomenclature = ConfigManager.getNomenclature();

        let html = `
            <div class="config-help-text">
                <p><strong>Nomenclatura de Efectos:</strong> Define cómo se detecta y colorea cada parte del efecto de una carta.</p>
                <small>Cada categoría tiene UNA configuración con 4 campos. Los campos vacíos no se verifican.</small>
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

    renderNomenclatureCategory: function (cat) {
    const cond = cat.conditions || {};

    const containsArr = Array.isArray(cond.contains) ? cond.contains 
        : (cond.contains ? [cond.contains] : []);
    const notContainsArr = Array.isArray(cond.notContains) ? cond.notContains 
        : (cond.notContains ? [cond.notContains] : []);

    const containsChips = containsArr.map(kw => `
        <div class="keyword-chip">
            <span class="chip-text">${kw}</span>
            <span class="chip-remove" onclick="Config.removeNomCondKw('${cat.id}','contains','${kw.replace(/'/g,"\\'")}')">×</span>
        </div>`).join('');

    const notContainsChips = notContainsArr.map(kw => `
        <div class="keyword-chip conditional-chip">
            <span class="chip-text">${kw}</span>
            <span class="chip-remove" onclick="Config.removeNomCondKw('${cat.id}','notContains','${kw.replace(/'/g,"\\'")}')">×</span>
        </div>`).join('');

    return `
        <div class="role-card">
            <div class="role-card-header">
                <input type="color" value="${cat.color}" title="Color de la categoría"
                    style="width:36px;height:36px;min-width:36px;border:2px solid var(--border-color);border-radius:6px;cursor:pointer;padding:2px;margin-right:3px;background:transparent;appearance:none;-webkit-appearance:none;"
                    onchange="ConfigManager.updateNomenclatureCategory('${cat.id}',{color:this.value});Config.render()">
                <input type="text" class="role-name-input" value="${cat.name}"
                    onblur="ConfigManager.updateNomenclatureCategory('${cat.id}',{name:this.value})"
                    onkeydown="if(event.key==='Enter')this.blur()">
                <button class="btn-delete-role" onclick="Config.deleteNomCategory('${cat.id}')">🗑️</button>
            </div>
            <div class="role-card-body" style="gap:12px;">

                <label class="config-label">Empieza con:</label>
                <input type="text" class="keyword-input" value="${cond.startsWith || ''}"
                    placeholder="vacío = cualquiera"
                    onblur="ConfigManager.updateNomenclatureCategoryCondition('${cat.id}','startsWith',this.value)"
                    onkeydown="if(event.key==='Enter')this.blur()">

                <label class="config-label">
                    Contiene: <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— al menos UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${containsChips || '<span class="empty-chips">Sin keywords (cualquier texto)</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-contains-${cat.id}" placeholder="Agregar opción..."
                        onkeydown="if(event.key==='Enter')Config.addNomCondKw('${cat.id}','contains',this)">
                    <button class="btn btn-sm" onclick="Config.addNomCondKw('${cat.id}','contains',document.getElementById('nom-contains-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label conditional-label">
                    NO contiene: <small style="font-weight:normal;">— TODAS deben estar ausentes</small>
                </label>
                <div class="keywords-container">
                    ${notContainsChips || '<span class="empty-chips">Sin restricciones</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input conditional-input" id="nom-notcontains-${cat.id}" placeholder="Agregar exclusión..."
                        onkeydown="if(event.key==='Enter')Config.addNomCondKw('${cat.id}','notContains',this)">
                    <button class="btn btn-sm btn-danger" onclick="Config.addNomCondKw('${cat.id}','notContains',document.getElementById('nom-notcontains-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label">Termina en:</label>
                <input type="text" class="keyword-input" value="${cond.endsWith || ''}"
                    placeholder="por defecto: ."
                    onblur="ConfigManager.updateNomenclatureCategoryCondition('${cat.id}','endsWith',this.value)"
                    onkeydown="if(event.key==='Enter')this.blur()">

                <div class="config-help-text" style="margin-top:8px;">
                    <small><strong>Cómo funciona:</strong> Un párrafo se detecta si: empieza con el texto indicado, contiene AL MENOS UNA de las keywords de "Contiene", NO contiene NINGUNA de las de "NO contiene", y termina con el texto indicado.</small>
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
    // ACCIONES - ROLES
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

    renameRole: function (el) {
        const oldName = el.dataset.original;
        const newName = el.value.trim();
        if (newName === oldName) return;
        if (!newName) { 
            alert('⚠️ El nombre no puede estar vacío'); 
            el.value = oldName; 
            return; 
        }
        if (ConfigManager.renameRole(oldName, newName)) {
            this.render();
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
        } else {
            alert('❌ No se pudo agregar (puede que ya exista)');
        }
    },

    removeConditional: function (roleName, conditional) {
        if (ConfigManager.removeConditionalFromRole(roleName, conditional)) {
            this.render();
        }
    },

    // ===============================
    // ACCIONES - ESPECIALIDADES
    // ===============================
    createSpecialtyPair: function () {
        ConfigManager.createSpecialtyPair('Nueva Especialización', '', 'Nuevo Counter', '');
        const sec = document.getElementById('specialties-section');
        if (sec && sec.style.display === 'none') sec.style.display = 'block';
        this.render();
        const sec2 = document.getElementById('specialties-section');
        if (sec2) sec2.style.display = 'block';
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

    // ===============================
    // ACCIONES - STAPLES
    // ===============================
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
            const sec = document.getElementById('staples-section');
            if (sec) sec.style.display = 'block';
        } catch (e) {
            alert('❌ No se encontró la carta. Verifica el ID.');
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
    // ACCIONES - NOMENCLATURA
    // ===============================
    addNomenclatureCategory: function () {
        ConfigManager.addNomenclatureCategory();
        this.render();
        const sec = document.getElementById('nomenclature-section');
        if (sec) sec.style.display = 'block';
    },

    deleteNomCategory: function (categoryId) {
        if (!confirm('¿Eliminar esta categoría?')) return;
        if (ConfigManager.deleteNomenclatureCategory(categoryId)) {
            this.render();
        }
    },

    // ===============================
    // ACCIONES GENERALES
    // ===============================
    resetToDefault: function () {
        if (!confirm('¿Restaurar toda la configuración a los valores por defecto? Esta acción no se puede deshacer.')) return;
        if (ConfigManager.resetToDefault()) { 
            this.render(); 
            alert('✅ Configuración restaurada'); 
        } else {
            alert('❌ No se pudo restaurar la configuración');
        }
    },

    exportConfig: function () {
        if (ConfigManager.exportConfig()) {
            alert('✅ Configuración exportada exitosamente');
        } else {
            alert('❌ No se pudo exportar');
        }
    },

    importConfig: function () {
        document.getElementById('config-import-file')?.click();
    },

    handleFileImport: async function (el) {
        const file = el.files[0];
        if (!file) return;
        try {
            await ConfigManager.importConfig(file);
            this.render();
            alert('✅ Configuración importada exitosamente');
        } catch (err) {
            alert('❌ Error al importar: ' + err);
        }
        el.value = '';
    },addNomCondKw: function (catId, field, el) {
    const kw = el.value.trim().toLowerCase();
    if (!kw) { alert('⚠️ Escribe una keyword'); return; }
    if (ConfigManager.addNomCondKw(catId, field, kw)) {
        el.value = '';
        this.render();
        const sec = document.getElementById('nomenclature-section');
        if (sec) sec.style.display = 'block';
    } else {
        alert('❌ Ya existe esa keyword');
    }
},

removeNomCondKw: function (catId, field, kw) {
    if (ConfigManager.removeNomCondKw(catId, field, kw)) {
        this.render();
        const sec = document.getElementById('nomenclature-section');
        if (sec) sec.style.display = 'block';
    }
},

    toggleSection: function (sectionId) {
        const sec = document.getElementById(sectionId);
        if (sec) {
            sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
        }
        
    },
    
    borrarDeck: function () {
        if (!confirm(
            '¿Borrar TODOS los decks guardados, winrates y cache de scores?\n' +
            'El META y la configuración no se tocarán.\n' +
            'Esta acción no se puede deshacer.'
        )) return;

        const deckKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('deck_')) deckKeys.push(k);
        }
        deckKeys.forEach(k => localStorage.removeItem(k));
        localStorage.removeItem('yugioh_winrates');
        localStorage.removeItem('yugioh_power_cache');

        if (window.Deck) {
            Deck.cards = {};
            Deck.name  = 'Mi Deck';
            Deck.notes = '';
            Deck.render();
        }
        if (window.Estadisticas) {
            Estadisticas.powerScoreCache = null;
            Estadisticas.updateDeckStats();
            if (typeof Estadisticas.updateFloatingWidget === 'function')
                Estadisticas.updateFloatingWidget();
        }
        if (window.Winrate)  Winrate.refreshSection();
        if (window.Duelista) Duelista.refreshSection();

        alert(`✅ ${deckKeys.length} deck(s) y datos relacionados eliminados.`);
    },

    borrarMeta: function () {
        if (!confirm(
            '¿Borrar TODO el META (carpetas, decks importados, poder de cartas calculado)?\n' +
            'Los decks guardados y winrates no se tocarán.\n' +
            'Esta acción no se puede deshacer.'
        )) return;

        localStorage.removeItem('yugioh_meta_decks');
        localStorage.removeItem('yugioh_power_cache');

        // Resetear estado en memoria
        if (window.Estadisticas) {
            Estadisticas.powerScoreCache = null;
            Estadisticas.metaDecks       = {};
            Estadisticas.metaFolders     = [];
            // Re-renderizar estadisticas en vivo
            const statsEl = document.getElementById('estadisticas-content');
            if (statsEl) Estadisticas.render();
            if (typeof Estadisticas.updateFloatingWidget === 'function')
                Estadisticas.updateFloatingWidget();
        }

        alert('✅ META eliminado completamente.');
    },

    borrarTodo: function () {
        if (!confirm(
            '⚠️ BORRAR TODO ⚠️\n\n' +
            'Esto eliminará:\n' +
            '• Todos los decks guardados\n' +
            '• Meta completo (carpetas e importados)\n' +
            '• Winrates e historial\n' +
            '• Cartas favoritas\n' +
            '• Cache de poder de cartas\n' +
            '• Roles, Mecánicas, Counters, Staples y Nomenclatura\n\n' +
            'La app quedará completamente vacía.\n' +
            'Esta acción NO se puede deshacer.'
        )) return;

        // Borrar absolutamente todo el localStorage
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k) allKeys.push(k);
        }
        allKeys.forEach(k => localStorage.removeItem(k));

        // Guardar config vacía explícitamente (sin roles, sin pares, sin nada)
        const emptyConfig = {
            roles:            {},
            roleConditions:   {},
            roleWeights:      {},
            specialties:      [],
            staples:          {},
            nomenclature:     { categories: [] }
        };
        if (window.ConfigManager) ConfigManager.saveConfig(emptyConfig);

        // Resetear módulos en memoria
        if (window.Deck) {
            Deck.cards = {};
            Deck.name  = 'Mi Deck';
            Deck.notes = '';
            Deck.render();
        }
        if (window.Estadisticas) {
            Estadisticas.powerScoreCache = null;
            Estadisticas.metaDecks       = {};
            Estadisticas.metaFolders     = [];
            const statsEl = document.getElementById('estadisticas-content');
            if (statsEl) Estadisticas.render();
            if (typeof Estadisticas.updateFloatingWidget === 'function')
                Estadisticas.updateFloatingWidget();
        }
        if (window.Favoritas) Favoritas.render();
        if (window.Winrate)   Winrate.refreshSection();
        if (window.Duelista)  Duelista.refreshSection();

        // Re-renderizar config para reflejar los campos vacíos
        this.render();

        alert('✅ Todo borrado. La app está completamente vacía.');
    }

};

window.Config = Config;
document.addEventListener('DOMContentLoaded', () => Config.init());