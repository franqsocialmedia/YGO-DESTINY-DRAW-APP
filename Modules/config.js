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

    toggleSection: function (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }
    }
};

window.Config = Config;
document.addEventListener('DOMContentLoaded', () => Config.init());