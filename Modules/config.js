/* ====================================
   CONFIG MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Módulo de configuración de la aplicación
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

    // ===============================
    // RENDERIZADO PRINCIPAL
    // ===============================
    render: function () {
        if (!this.container) return;

        const html = `
            <h2>Configuración</h2>
            
            <!-- Sección: Roles y Palabras Asociadas -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('roles-section')">
                    Roles y Palabras Asociadas
                </h3>
                <div id="roles-section" class="config-section-content">
                    ${this.renderRolesSection()}
                </div>
            </div>

            <!-- Sección: Especialidades (NUEVO - Paso 1) -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('specialties-section')">
                    Especialidades y Counters
                </h3>
                <div id="specialties-section" class="config-section-content" style="display: none;">
                    ${this.renderSpecialtiesSection()}
                </div>
            </div>

            <!-- Sección: Staples (NUEVO - Paso 2) -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('staples-section')">
                    Lista de Staples
                </h3>
                <div id="staples-section" class="config-section-content" style="display: none;">
                    ${this.renderStaplesSection()}
                </div>
            </div>

            <!-- Sección: Nomenclatura (NUEVO - Paso 4) -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('nomenclature-section')">
                    Nomenclatura de Efectos
                </h3>
                <div id="nomenclature-section" class="config-section-content" style="display: none;">
                    ${this.renderNomenclatureSection()}
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="config-actions">
                <button class="btn btn-primary" onclick="Config.exportConfig()">
                    📥 Exportar Data
                </button>
                <button class="btn btn-primary" onclick="Config.importConfig()">
                    📤 Importar Data
                </button>
                <button class="btn btn-danger" onclick="Config.resetToDefault()">
                    🔄 Restaurar Configuración por Defecto
                </button>
            </div>
            
            <!-- Input oculto para importar archivo -->
            <input type="file" id="config-import-file" accept=".txt" style="display: none;" onchange="Config.handleFileImport(this)">
        `;

        this.container.innerHTML = html;
    },

    // ===============================
    // SECCIÓN DE ROLES
    // ===============================
    renderRolesSection: function () {
        const roles = ConfigManager.getRoles();
        let html = '';

        // Botón para crear nuevo rol
        html += `
            <div class="config-new-role">
                <input 
                    type="text" 
                    id="new-role-input" 
                    class="config-input" 
                    placeholder="Nombre del nuevo rol..."
                >
                <button class="btn btn-primary" onclick="Config.createNewRole()">
                    + Crear Rol
                </button>
            </div>
        `;

        // Lista de roles existentes
        html += '<div class="roles-list">';

        for (const [roleName, keywords] of Object.entries(roles)) {
            html += this.renderRoleCard(roleName, keywords);
        }

        html += '</div>';

        return html;
    },

    // ===============================
    // TARJETA DE ROL INDIVIDUAL
    // ===============================
    renderRoleCard: function (roleName, keywords) {
        // Generar chips de palabras clave
        let keywordsChips = '';
        keywords.forEach((keyword, index) => {
            keywordsChips += `
                <div class="keyword-chip">
                    <span class="chip-text">${keyword}</span>
                    <span class="chip-remove" onclick="Config.removeKeyword('${roleName}', '${keyword}')">×</span>
                </div>
            `;
        });

        // PASO 3: Obtener roleCondition si existe
        const roleCondition = ConfigManager.getRoleCondition(roleName);
        const conditionals = roleCondition ? (roleCondition.conditionals || []) : [];
        const condKeywords = roleCondition ? (roleCondition.keywords || []) : [];
        
        // Generar chips de condicionales
        let conditionalsChips = '';
        conditionals.forEach(conditional => {
            conditionalsChips += `
                <div class="keyword-chip" style="background: #e74c3c;">
                    <span class="chip-text">${conditional}</span>
                    <span class="chip-remove" onclick="Config.removeConditional('${roleName}', '${conditional}')">×</span>
                </div>
            `;
        });
        
        // Generar chips de keywords de roleCondition
        let condKeywordsChips = '';
        condKeywords.forEach(keyword => {
            condKeywordsChips += `
                <div class="keyword-chip" style="background: #3498db;">
                    <span class="chip-text">${keyword}</span>
                    <span class="chip-remove" onclick="Config.removeCondKeyword('${roleName}', '${keyword}')">×</span>
                </div>
            `;
        });

        return `
            <div class="role-card" data-role="${roleName}">
                <div class="role-card-header">
                    <input 
                        type="text" 
                        class="role-name-input" 
                        value="${roleName}"
                        data-original="${roleName}"
                        onblur="Config.renameRole(this)"
                        onkeydown="if(event.key === 'Enter') this.blur()"
                    >
                    <button class="btn-delete-role" onclick="Config.deleteRole('${roleName}')" title="Eliminar rol">
                        🗑️
                    </button>
                </div>
                
                <div class="role-card-body">
                    <label class="config-label">Palabras clave asociadas:</label>
                    <div class="keywords-container">
                        ${keywordsChips}
                    </div>
                    
                    <div class="add-keyword-container">
                        <input 
                            type="text" 
                            class="keyword-input" 
                            placeholder="Nueva palabra clave..."
                            data-role="${roleName}"
                            onkeydown="if(event.key === 'Enter') Config.addKeywordFromInput(this)"
                        >
                        <button class="btn btn-sm" onclick="Config.addKeywordFromInput(this.previousElementSibling)">
                            + Agregar
                        </button>
                    </div>
                    
                    <!-- PASO 3: Sección de Roles Compuestos -->
                    <div class="role-conditions-section">
                        <label class="config-label" style="margin-top: var(--spacing-md);">
                            <strong>Roles Compuestos (Opcional):</strong>
                            <small style="display: block; color: rgba(241, 241, 241, 0.6); font-weight: normal;">
                                Define condicionales que DEBEN cumplirse + keywords que AL MENOS UNA debe estar presente
                            </small>
                        </label>
                        
                        <label class="config-label" style="font-size: 0.85rem; margin-top: var(--spacing-sm);">
                            Condicionales (TODAS deben cumplirse):
                        </label>
                        <div class="keywords-container">
                            ${conditionalsChips || '<span class="empty-chips">Sin condicionales (rol simple)</span>'}
                        </div>
                        <div class="add-keyword-container">
                            <input 
                                type="text" 
                                class="keyword-input" 
                                placeholder="Nueva condicional..."
                                data-role="${roleName}"
                                onkeydown="if(event.key === 'Enter') Config.addConditionalFromInput(this)"
                            >
                            <button class="btn btn-sm" onclick="Config.addConditionalFromInput(this.previousElementSibling)">
                                + Agregar Condicional
                            </button>
                        </div>
                        
                        <label class="config-label" style="font-size: 0.85rem; margin-top: var(--spacing-sm);">
                            Keywords (AL MENOS UNA debe cumplirse):
                        </label>
                        <div class="keywords-container">
                            ${condKeywordsChips || '<span class="empty-chips">Sin keywords de condición</span>'}
                        </div>
                        <div class="add-keyword-container">
                            <input 
                                type="text" 
                                class="keyword-input" 
                                placeholder="Nueva keyword..."
                                data-role="${roleName}"
                                onkeydown="if(event.key === 'Enter') Config.addCondKeywordFromInput(this)"
                            >
                            <button class="btn btn-sm" onclick="Config.addCondKeywordFromInput(this.previousElementSibling)">
                                + Agregar Keyword
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ===============================
    // SECCIÓN DE ESPECIALIDADES (PASO 1)
    // ===============================
    renderSpecialtiesSection: function () {
        const specialties = ConfigManager.getSpecialties();
        let html = '';

        // Botón para crear nueva especialidad
        html += `
            <div class="config-new-role">
                <input 
                    type="text" 
                    id="new-specialty-input" 
                    class="config-input" 
                    placeholder="Keyword de especialidad (ej: return, negate)..."
                >
                <button class="btn btn-primary" onclick="Config.createNewSpecialty()">
                    + Crear Especialidad
                </button>
            </div>
        `;

        // Lista de especialidades existentes
        html += '<div class="roles-list">';

        for (const [keyword, data] of Object.entries(specialties)) {
            html += this.renderSpecialtyCard(keyword, data);
        }

        html += '</div>';

        return html;
    },

    renderSpecialtyCard: function (keyword, data) {
        return `
            <div class="role-card" data-specialty="${keyword}">
                <div class="role-card-header">
                    <input 
                        type="text" 
                        class="role-name-input" 
                        value="${keyword}"
                        data-original="${keyword}"
                        onblur="Config.renameSpecialtyKeyword(this)"
                        onkeydown="if(event.key === 'Enter') this.blur()"
                        placeholder="Keyword"
                    >
                    <button class="btn-delete-role" onclick="Config.deleteSpecialty('${keyword}')" title="Eliminar especialidad">
                        🗑️
                    </button>
                </div>
                
                <div class="role-card-body">
                    <label class="config-label">Nombre a nivel carta:</label>
                    <input 
                        type="text" 
                        class="specialty-field-input" 
                        value="${data.cardLevel || ''}"
                        data-keyword="${keyword}"
                        data-field="cardLevel"
                        onchange="Config.updateSpecialtyField(this)"
                        placeholder="Ej: Recycle"
                    >
                    
                    <label class="config-label">Nombre a nivel deck:</label>
                    <input 
                        type="text" 
                        class="specialty-field-input" 
                        value="${data.deckLevel || ''}"
                        data-keyword="${keyword}"
                        data-field="deckLevel"
                        onchange="Config.updateSpecialtyField(this)"
                        placeholder="Ej: Bounce"
                    >
                    
                    <label class="config-label">Rol vinculado (opcional):</label>
                    <select 
                        class="specialty-field-input" 
                        data-keyword="${keyword}"
                        data-field="linkedRole"
                        onchange="Config.updateSpecialtyField(this)"
                    >
                        <option value="">-- Sin vincular --</option>
                        ${this.renderRoleOptions(data.linkedRole)}
                    </select>
                    
                    <label class="config-label">
                        <small style="color: rgba(241, 241, 241, 0.6);">
                            Counters y CounteredBy se manejan automáticamente
                        </small>
                    </label>
                </div>
            </div>
        `;
    },

    renderRoleOptions: function (selectedRole) {
        const roles = ConfigManager.getRoleNames();
        let html = '';
        roles.forEach(role => {
            const selected = role === selectedRole ? 'selected' : '';
            html += `<option value="${role}" ${selected}>${role}</option>`;
        });
        return html;
    },

    // ===============================
    // SECCIÓN DE STAPLES (PASO 2)
    // ===============================
    renderStaplesSection: function () {
        const staples = ConfigManager.getStaples();
        let html = '';

        // Explicación de qué son las staples
        html += `
            <div class="config-help-text">
                <p><strong>Staples:</strong> Cartas genéricas que se usan en múltiples decks del meta.</p>
                <p><small>Esta lista es interna y se usa para análisis comparativo y recomendaciones.</small></p>
            </div>
        `;

        // Botón para agregar nuevo staple
        html += `
            <div class="config-new-role">
                <input 
                    type="text" 
                    id="new-staple-id" 
                    class="config-input" 
                    placeholder="ID de la carta (ej: 83764718)"
                    style="width: 200px;"
                >
                <input 
                    type="text" 
                    id="new-staple-name" 
                    class="config-input" 
                    placeholder="Nombre (ej: Renace al monstruo)"
                    style="width: 250px;"
                >
                <button class="btn btn-primary" onclick="Config.createNewStaple()">
                    + Agregar Staple
                </button>
            </div>
        `;

        // Lista de staples existentes
        html += '<div class="staples-list">';
        
        const stapleEntries = Object.entries(staples);
        if (stapleEntries.length === 0) {
            html += '<p class="stats-empty">No hay staples configurados</p>';
        } else {
            stapleEntries.forEach(([id, data]) => {
                html += this.renderStapleCard(id, data);
            });
        }

        html += '</div>';

        return html;
    },

    renderStapleCard: function (cardId, data) {
        // Generar chips de roles
        let rolesChips = '';
        (data.roles || []).forEach(role => {
            rolesChips += `
                <div class="keyword-chip">
                    <span class="chip-text">${role}</span>
                    <span class="chip-remove" onclick="Config.removeRoleFromStaple('${cardId}', '${role}')">×</span>
                </div>
            `;
        });

        // Generar chips de specialty keywords
        let specialtyChips = '';
        (data.specialtyKeywords || []).forEach(keyword => {
            specialtyChips += `
                <div class="keyword-chip" style="background: #6c5ce7;">
                    <span class="chip-text">${keyword}</span>
                    <span class="chip-remove" onclick="Config.removeSpecialtyKeywordFromStaple('${cardId}', '${keyword}')">×</span>
                </div>
            `;
        });

        return `
            <div class="staple-card" data-staple-id="${cardId}">
                <div class="staple-card-header">
                    <div class="staple-info">
                        <strong>${data.name || 'Sin nombre'}</strong>
                        <span class="staple-id">ID: ${cardId}</span>
                        ${data.nameEn ? `<span class="staple-name-en">(${data.nameEn})</span>` : ''}
                    </div>
                    <button class="btn-delete-role" onclick="Config.deleteStaple('${cardId}')" title="Eliminar staple">
                        🗑️
                    </button>
                </div>
                
                <div class="staple-card-body">
                    <label class="config-label">Roles asignados:</label>
                    <div class="keywords-container">
                        ${rolesChips || '<span class="empty-chips">Sin roles</span>'}
                    </div>
                    <div class="add-keyword-container">
                        <select 
                            class="keyword-input" 
                            data-staple-id="${cardId}"
                            onchange="Config.addRoleToStapleFromSelect(this)"
                        >
                            <option value="">-- Seleccionar rol --</option>
                            ${this.renderRoleOptions('')}
                        </select>
                    </div>

                    <label class="config-label">Specialty Keywords:</label>
                    <div class="keywords-container">
                        ${specialtyChips || '<span class="empty-chips">Sin keywords</span>'}
                    </div>
                    <div class="add-keyword-container">
                        <input 
                            type="text" 
                            class="keyword-input" 
                            placeholder="Nueva keyword..."
                            data-staple-id="${cardId}"
                            onkeydown="if(event.key === 'Enter') Config.addSpecialtyKeywordToStapleFromInput(this)"
                        >
                        <button class="btn btn-sm" onclick="Config.addSpecialtyKeywordToStapleFromInput(this.previousElementSibling)">
                            + Agregar
                        </button>
                    </div>

                    <label class="config-label">Notas:</label>
                    <input 
                        type="text" 
                        class="specialty-field-input" 
                        value="${data.notes || ''}"
                        data-staple-id="${cardId}"
                        onchange="Config.updateStapleNotes(this)"
                        placeholder="Notas opcionales..."
                    >
                </div>
            </div>
        `;
    },

    // ===============================
    // ACCIONES DE ROLES
    // ===============================
    createNewRole: function () {
        const input = document.getElementById('new-role-input');
        const roleName = input.value.trim();

        if (!roleName) {
            alert('⚠️ Escribe un nombre para el rol');
            return;
        }

        if (ConfigManager.createRole(roleName)) {
            input.value = '';
            this.render();
            alert('✅ Rol creado exitosamente');
        } else {
            alert('❌ No se pudo crear el rol (puede que ya exista)');
        }
    },

    renameRole: function (inputElement) {
        const oldName = inputElement.dataset.original;
        const newName = inputElement.value.trim();

        if (newName === oldName) return;

        if (!newName) {
            alert('⚠️ El nombre no puede estar vacío');
            inputElement.value = oldName;
            return;
        }

        if (ConfigManager.renameRole(oldName, newName)) {
            this.render();
            alert('✅ Rol renombrado exitosamente');
        } else {
            alert('❌ No se pudo renombrar el rol (puede que el nuevo nombre ya exista)');
            inputElement.value = oldName;
        }
    },

    deleteRole: function (roleName) {
        if (!confirm(`¿Eliminar el rol "${roleName}"?`)) return;

        if (ConfigManager.deleteRole(roleName)) {
            this.render();
            alert('✅ Rol eliminado exitosamente');
        } else {
            alert('❌ No se pudo eliminar el rol');
        }
    },

    // ===============================
    // ACCIONES DE PALABRAS CLAVE
    // ===============================
    addKeywordFromInput: function (inputElement) {
        const roleName = inputElement.dataset.role;
        const keyword = inputElement.value.trim().toLowerCase();

        if (!keyword) {
            alert('⚠️ Escribe una palabra clave');
            return;
        }

        if (ConfigManager.addKeywordToRole(roleName, keyword)) {
            inputElement.value = '';
            this.render();
        } else {
            alert('❌ No se pudo agregar la palabra clave (puede que ya exista)');
        }
    },

    removeKeyword: function (roleName, keyword) {
        if (ConfigManager.removeKeywordFromRole(roleName, keyword)) {
            this.render();
        } else {
            alert('❌ No se pudo eliminar la palabra clave');
        }
    },

    // ===============================
    // ACCIONES DE ROLE CONDITIONS (PASO 3)
    // ===============================
    addConditionalFromInput: function (inputElement) {
        const roleName = inputElement.dataset.role;
        const conditional = inputElement.value.trim().toLowerCase();

        if (!conditional) {
            alert('⚠️ Escribe una condicional');
            return;
        }

        if (ConfigManager.addConditionalToRole(roleName, conditional)) {
            inputElement.value = '';
            this.render();
        } else {
            alert('❌ No se pudo agregar la condicional (puede que ya exista)');
        }
    },

    removeConditional: function (roleName, conditional) {
        if (ConfigManager.removeConditionalFromRole(roleName, conditional)) {
            this.render();
        } else {
            alert('❌ No se pudo eliminar la condicional');
        }
    },

    addCondKeywordFromInput: function (inputElement) {
        const roleName = inputElement.dataset.role;
        const keyword = inputElement.value.trim().toLowerCase();

        if (!keyword) {
            alert('⚠️ Escribe una keyword');
            return;
        }

        if (ConfigManager.addKeywordToRoleCondition(roleName, keyword)) {
            inputElement.value = '';
            this.render();
        } else {
            alert('❌ No se pudo agregar la keyword (puede que ya exista)');
        }
    },

    removeCondKeyword: function (roleName, keyword) {
        if (ConfigManager.removeKeywordFromRoleCondition(roleName, keyword)) {
            this.render();
        } else {
            alert('❌ No se pudo eliminar la keyword');
        }
    },

    // ===============================
    // OTRAS ACCIONES
    // ===============================
    resetToDefault: function () {
        if (!confirm('¿Restaurar toda la configuración a los valores por defecto? Esta acción no se puede deshacer.')) {
            return;
        }

        if (ConfigManager.resetToDefault()) {
            this.render();
            alert('✅ Configuración restaurada a los valores por defecto');
        } else {
            alert('❌ No se pudo restaurar la configuración');
        }
    },

    exportConfig: function () {
        if (ConfigManager.exportConfig()) {
            alert('✅ Configuración exportada exitosamente');
        } else {
            alert('❌ No se pudo exportar la configuración');
        }
    },

    importConfig: function () {
        // Abrir el diálogo de selección de archivo
        const fileInput = document.getElementById('config-import-file');
        if (fileInput) {
            fileInput.click();
        }
    },

    handleFileImport: async function (inputElement) {
        const file = inputElement.files[0];
        if (!file) return;

        try {
            await ConfigManager.importConfig(file);
            this.render();
            alert('✅ Configuración importada exitosamente');
            // Limpiar el input para permitir importar el mismo archivo de nuevo
            inputElement.value = '';
        } catch (error) {
            alert('❌ Error al importar: ' + error);
            inputElement.value = '';
        }
    },

    // ===============================
    // ACCIONES DE ESPECIALIDADES (PASO 1)
    // ===============================
    createNewSpecialty: function () {
        const input = document.getElementById('new-specialty-input');
        const keyword = input.value.trim().toLowerCase();

        if (!keyword) {
            alert('⚠️ Escribe un keyword para la especialidad');
            return;
        }

        const data = {
            cardLevel: keyword,
            deckLevel: keyword,
            linkedRole: '',
            counters: [],
            counteredBy: []
        };

        if (ConfigManager.createSpecialty(keyword, data)) {
            input.value = '';
            this.render();
            alert('✅ Especialidad creada exitosamente');
        } else {
            alert('❌ No se pudo crear la especialidad (puede que ya exista)');
        }
    },

    renameSpecialtyKeyword: function (inputElement) {
        const oldKeyword = inputElement.dataset.original;
        const newKeyword = inputElement.value.trim().toLowerCase();

        if (newKeyword === oldKeyword) return;

        if (!newKeyword) {
            alert('⚠️ El keyword no puede estar vacío');
            inputElement.value = oldKeyword;
            return;
        }

        if (ConfigManager.renameSpecialtyKeyword(oldKeyword, newKeyword)) {
            this.render();
            alert('✅ Keyword renombrado exitosamente');
        } else {
            alert('❌ No se pudo renombrar el keyword (puede que el nuevo ya exista)');
            inputElement.value = oldKeyword;
        }
    },

    deleteSpecialty: function (keyword) {
        if (!confirm(`¿Eliminar la especialidad "${keyword}"?`)) return;

        if (ConfigManager.deleteSpecialty(keyword)) {
            this.render();
            alert('✅ Especialidad eliminada exitosamente');
        } else {
            alert('❌ No se pudo eliminar la especialidad');
        }
    },

    updateSpecialtyField: function (inputElement) {
        const keyword = inputElement.dataset.keyword;
        const field = inputElement.dataset.field;
        const value = inputElement.value.trim();

        const specialty = ConfigManager.getSpecialty(keyword);
        if (!specialty) return;

        specialty[field] = value;

        if (ConfigManager.updateSpecialty(keyword, specialty)) {
            // No re-renderizar para mejor UX
            console.log(`Especialidad ${keyword} actualizada: ${field} = ${value}`);
        } else {
            alert('❌ No se pudo actualizar la especialidad');
        }
    },

    // ===============================
    // ACCIONES DE STAPLES (PASO 2)
    // ===============================
    createNewStaple: function () {
        const idInput = document.getElementById('new-staple-id');
        const nameInput = document.getElementById('new-staple-name');
        const cardId = idInput.value.trim();
        const name = nameInput.value.trim();

        if (!cardId) {
            alert('⚠️ Ingresa el ID de la carta');
            return;
        }

        if (!name) {
            alert('⚠️ Ingresa el nombre de la carta');
            return;
        }

        const data = {
            name: name,
            nameEn: '',
            roles: [],
            specialtyKeywords: [],
            notes: ''
        };

        if (ConfigManager.createStaple(cardId, data)) {
            idInput.value = '';
            nameInput.value = '';
            this.render();
            alert('✅ Staple agregado exitosamente');
        } else {
            alert('❌ No se pudo agregar el staple (puede que ya exista)');
        }
    },

    deleteStaple: function (cardId) {
        const staple = ConfigManager.getStaple(cardId);
        const name = staple ? staple.name : cardId;
        
        if (!confirm(`¿Eliminar staple "${name}"?`)) return;

        if (ConfigManager.deleteStaple(cardId)) {
            this.render();
            alert('✅ Staple eliminado exitosamente');
        } else {
            alert('❌ No se pudo eliminar el staple');
        }
    },

    addRoleToStapleFromSelect: function (selectElement) {
        const cardId = selectElement.dataset.stapleId;
        const roleName = selectElement.value;

        if (!roleName) return;

        if (ConfigManager.addRoleToStaple(cardId, roleName)) {
            selectElement.value = '';
            this.render();
        } else {
            alert('❌ No se pudo agregar el rol (puede que ya exista)');
        }
    },

    removeRoleFromStaple: function (cardId, roleName) {
        if (ConfigManager.removeRoleFromStaple(cardId, roleName)) {
            this.render();
        } else {
            alert('❌ No se pudo eliminar el rol');
        }
    },

    addSpecialtyKeywordToStapleFromInput: function (inputElement) {
        const cardId = inputElement.dataset.stapleId;
        const keyword = inputElement.value.trim().toLowerCase();

        if (!keyword) {
            alert('⚠️ Escribe una keyword');
            return;
        }

        if (ConfigManager.addSpecialtyKeywordToStaple(cardId, keyword)) {
            inputElement.value = '';
            this.render();
        } else {
            alert('❌ No se pudo agregar la keyword (puede que ya exista)');
        }
    },

    removeSpecialtyKeywordFromStaple: function (cardId, keyword) {
        if (ConfigManager.removeSpecialtyKeywordFromStaple(cardId, keyword)) {
            this.render();
        } else {
            alert('❌ No se pudo eliminar la keyword');
        }
    },

    updateStapleNotes: function (inputElement) {
        const cardId = inputElement.dataset.stapleId;
        const notes = inputElement.value.trim();

        const staple = ConfigManager.getStaple(cardId);
        if (!staple) return;

        staple.notes = notes;

        if (ConfigManager.updateStaple(cardId, staple)) {
            console.log(`Notas de staple ${cardId} actualizadas`);
        } else {
            alert('❌ No se pudo actualizar las notas');
        }
    },

    // ===============================
    // SECCIÓN DE NOMENCLATURA (PASO 4)
    // ===============================
    
    renderNomenclatureSection: function () {
        const nomenclature = ConfigManager.getNomenclature();
        const colors = ConfigManager.getNomenclatureColors();

        const categoryNames = {
            effectSpeed: 'Velocidad de Efecto',
            effectType: 'Tipo de Efecto',
            timing: 'Timing del Efecto',
            requirements: 'Requisitos',
            conditions: 'Condición de Activación',
            cost: 'Costo de Activación',
            effects: 'Efecto',
            duration: 'Duración del Efecto',
            restrictions: 'Restricción'
        };

        let html = `
            <div class="config-help-text">
                <p><strong>Nomenclatura de Efectos</strong></p>
                <small>Define las palabras clave que identifican cada parte del efecto de una carta. Los párrafos que contengan estas palabras serán resaltados en el visor de cartas.</small>
            </div>
        `;

        for (const [category, displayName] of Object.entries(categoryNames)) {
            const categoryData = nomenclature[category];
            const color = colors[category] || '#FFFFFF';

            html += `
                <div class="role-card">
                    <div class="role-card-header">
                        <input 
                            type="text" 
                            class="role-name-input" 
                            value="${displayName}"
                            data-category="${category}"
                            onblur="Config.updateNomenclatureName(this)"
                            readonly
                            title="Nombre de la categoría (no editable)"
                        >
                        <input 
                            type="color" 
                            value="${color}"
                            data-category="${category}"
                            onchange="Config.updateNomenclatureColor(this)"
                            title="Color del mark"
                            style="width: 50px; height: 35px; cursor: pointer; border: 2px solid var(--border-color); border-radius: 6px;"
                        >
                    </div>

                    <div class="role-card-body">
                        <label class="config-label">Palabras Clave:</label>
                        <div class="keywords-container" id="nomenclature-keywords-${category}">
                            ${this.renderNomenclatureKeywords(category, categoryData)}
                        </div>

                        <div class="add-keyword-container">
                            <input 
                                type="text" 
                                class="keyword-input" 
                                placeholder="Nueva palabra clave..."
                                data-category="${category}"
                                onkeypress="if(event.key==='Enter') Config.addNomenclatureKeywordFromInput(this)"
                            >
                            <button 
                                class="btn btn-primary btn-sm" 
                                onclick="Config.addNomenclatureKeywordFromInput(this.previousElementSibling)"
                            >
                                + Agregar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        return html;
    },

    renderNomenclatureKeywords: function (category, categoryData) {
        let html = '';

        if (typeof categoryData === 'object' && !Array.isArray(categoryData)) {
            for (const [name, keywords] of Object.entries(categoryData)) {
                keywords.forEach(kw => {
                    html += `
                        <div class="keyword-chip">
                            <span class="chip-text">${kw}</span>
                            <span class="chip-remove" onclick="Config.removeNomenclatureKeyword('${category}', '${name}', '${kw}')">×</span>
                        </div>
                    `;
                });
            }
        } else if (Array.isArray(categoryData)) {
            categoryData.forEach(kw => {
                html += `
                    <div class="keyword-chip">
                        <span class="chip-text">${kw}</span>
                        <span class="chip-remove" onclick="Config.removeNomenclatureKeyword('${category}', null, '${kw}')">×</span>
                    </div>
                `;
            });
        }

        return html;
    },

    updateNomenclatureColor: function (inputElement) {
        const category = inputElement.dataset.category;
        const color = inputElement.value;

        if (ConfigManager.updateNomenclatureColor(category, color)) {
            console.log(`Color de ${category} actualizado a ${color}`);
        } else {
            alert('❌ No se pudo actualizar el color');
        }
    },

    addNomenclatureKeywordFromInput: function (inputElement) {
        const category = inputElement.dataset.category;
        const keyword = inputElement.value.trim().toLowerCase();

        if (!keyword) {
            alert('⚠️ Escribe una palabra clave');
            return;
        }

        const config = ConfigManager.getConfig();
        const nomenclature = config.nomenclature;

        if (typeof nomenclature[category] === 'object' && !Array.isArray(nomenclature[category])) {
            const customKey = `Custom_${Date.now()}`;
            if (!nomenclature[category][customKey]) {
                nomenclature[category][customKey] = [];
            }
            if (!nomenclature[category][customKey].includes(keyword)) {
                nomenclature[category][customKey].push(keyword);
                ConfigManager.saveConfig(config);
                inputElement.value = '';
                this.render();
            } else {
                alert('⚠️ Esta palabra clave ya existe');
            }
        } else if (Array.isArray(nomenclature[category])) {
            if (!nomenclature[category].includes(keyword)) {
                nomenclature[category].push(keyword);
                ConfigManager.saveConfig(config);
                inputElement.value = '';
                this.render();
            } else {
                alert('⚠️ Esta palabra clave ya existe');
            }
        }
    },

    removeNomenclatureKeyword: function (category, name, keyword) {
        const config = ConfigManager.getConfig();
        const nomenclature = config.nomenclature;

        if (typeof nomenclature[category] === 'object' && !Array.isArray(nomenclature[category]) && name) {
            const index = nomenclature[category][name].indexOf(keyword);
            if (index > -1) {
                nomenclature[category][name].splice(index, 1);
                if (nomenclature[category][name].length === 0 && name.startsWith('Custom_')) {
                    delete nomenclature[category][name];
                }
                ConfigManager.saveConfig(config);
                this.render();
            }
        } else if (Array.isArray(nomenclature[category])) {
            const index = nomenclature[category].indexOf(keyword);
            if (index > -1) {
                nomenclature[category].splice(index, 1);
                ConfigManager.saveConfig(config);
                this.render();
            }
        }
    },

    toggleSection: function (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }
    }
};

window.Config = Config;
document.addEventListener('DOMContentLoaded', () => Config.init());