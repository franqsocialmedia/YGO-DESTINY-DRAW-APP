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
                <div id="roles-section" class="config-section-content">
                    ${this.renderRolesSection()}
                </div>
            </div>

            <!-- Sección: Especialidades y Counters -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('specialties-section')">
                    ▶ Especialidades y Counters
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
                <div id="staples-section" class="config-section-content" style="display:none;">
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
                <button class="btn btn-danger" onclick="Config.resetToDefault()">🔄 Restaurar por Defecto</button>
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
        
        return `
            <div class="role-card">
                <div class="role-card-header">
                    <input type="color" value="${cat.color}" title="Color de la categoría"
                        style="width:44px;height:34px;border:2px solid var(--border-color);border-radius:6px;cursor:pointer;padding:2px;margin-right:8px;background:transparent;"
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
                    
                    <label class="config-label">Contiene:</label>
                    <input type="text" class="keyword-input" value="${cond.contains || ''}"
                        placeholder="vacío = cualquiera"
                        onblur="ConfigManager.updateNomenclatureCategoryCondition('${cat.id}','contains',this.value)"
                        onkeydown="if(event.key==='Enter')this.blur()">
                    
                    <label class="config-label">NO contiene:</label>
                    <input type="text" class="keyword-input" value="${cond.notContains || ''}"
                        placeholder="vacío = sin restricción"
                        onblur="ConfigManager.updateNomenclatureCategoryCondition('${cat.id}','notContains',this.value)"
                        onkeydown="if(event.key==='Enter')this.blur()">
                    
                    <label class="config-label">Termina en:</label>
                    <input type="text" class="keyword-input" value="${cond.endsWith || ''}"
                        placeholder="por defecto: ."
                        onblur="ConfigManager.updateNomenclatureCategoryCondition('${cat.id}','endsWith',this.value)"
                        onkeydown="if(event.key==='Enter')this.blur()">
                    
                    <div class="config-help-text" style="margin-top:8px;">
                        <small><strong>Cómo funciona:</strong> Un párrafo se detecta si cumple TODOS los campos no-vacíos. Ejemplo: si pones "quick effect" en "Contiene" y ":" en "Termina", solo detectará párrafos que contengan "quick effect" Y terminen en ":".</small>
                    </div>
                </div>
            </div>`;
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
    },

    toggleSection: function (sectionId) {
        const sec = document.getElementById(sectionId);
        if (sec) {
            sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
        }
    }
};

window.Config = Config;
document.addEventListener('DOMContentLoaded', () => Config.init());