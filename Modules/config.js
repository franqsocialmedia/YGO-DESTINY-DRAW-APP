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

    toggleSection: function (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }
    }
};

window.Config = Config;
document.addEventListener('DOMContentLoaded', () => Config.init());