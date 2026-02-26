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
        // Inyectar panel de Content Manager al principio del contenido de Config
        
        this.render();
        if (window.ConfigManager) ConfigManager.renderStaplesPanel();
    },

    render: function () {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <h2>Configuración</h2>
            ${window.ContentManager ? ContentManager.renderConfigSection() : ''}
            <!-- Sección: Roles y Palabras Asociadas -->
            <div class="config-section" data-section-id="config-roles" id="roles-section-wrap">
                <h3 class="config-section-title" onclick="Config.toggleSection('roles-section')">
                    ▶ Roles y Palabras Asociadas
                </h3>
                <div id="roles-section" class="config-section-content" style="display:none;">
                    ${this.renderRolesSection()}
                </div>
            </div>

            <!-- Sección: Mecánicas y Counters -->
            <div class="config-section" data-section-id="config-specialties">
                <h3 class="config-section-title" onclick="Config.toggleSection('specialties-section')">
                    ▶ Mecánicas y Counters
                </h3>
                <div id="specialties-section" class="config-section-content" style="display:none;">
                    ${this.renderSpecialtiesSection()}
                </div>
            </div>

            <!-- Sección: Lista de Staples -->
            <div class="config-section" data-section-id="config-staples">
                <h3 class="config-section-title" onclick="Config.toggleSection('staples-section')">
                    ▶ Lista de Staples
                </h3>
                <div id="staples-section" class="config-section-content" style="display:none;">
                    ${this.renderStaplesSection()}
                </div>
            </div>

            <!-- Sección: Nomenclatura de Efectos -->
            <div class="config-section" data-section-id="config-nomenclature">
                <h3 class="config-section-title" onclick="Config.toggleSection('nomenclature-section')">
                    ▶ Nomenclatura de Efectos
                </h3>
                <div id="nomenclature-section" class="config-section-content" style="display:none;">
                    ${this.renderNomenclatureSection()}
                </div>
            </div>

            <!-- Sección: Pilares del Internal Score -->
            <div class="config-section" data-section-id="config-pillars">
                <h3 class="config-section-title" onclick="Config.toggleSection('pillars-section')">
                    ▶ Pilares del Internal Score
                </h3>
                <div id="pillars-section" class="config-section-content" style="display:none;">
                    ${this.renderPillarsSection()}
                </div>
            </div>

            <!-- Sección: Rendimientos Decrecientes -->
            <div class="config-section" data-section-id="config-diminishing">
                <h3 class="config-section-title" onclick="Config.toggleSection('diminishing-section')">
                    ▶ Rendimientos Decrecientes
                </h3>
                <div id="diminishing-section" class="config-section-content" style="display:none;">
                    ${this.renderDiminishingSection()}
                </div>
            </div>

            <!-- Sección: Atajos Rápidos -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('shortcuts-section')">
                    ▶ Atajos Rápidos
                </h3>
                <div id="shortcuts-section" class="config-section-content" style="display:none;">
                    ${this.renderShortcutsSection()}
                </div>
            </div>

            <!-- Sección: Banlist del Formato -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('banlist-section'); if(window.Banlist) Banlist.renderSection();">
                    ▶ Banlist del Formato
                </h3>
                <div id="banlist-section" class="config-section-content" style="display:none;">
                    <p class="stats-empty">Abre la sección para ver la banlist.</p>
                </div>
                
            </div>
            <!-- Sección: Perfil del Jugador -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('player-level-section')">
                    ▶ Perfil del Jugador
                </h3>
                <div id="player-level-section" class="config-section-content" style="display:none;">
                    ${this.renderPlayerLevelSection()}
                </div>
            </div>

            <!-- Sección: Ajustes de Música -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('music-section')">
                    ▶ Ajustes de Música
                </h3>
                <div id="music-section" class="config-section-content" style="display:none;">
                    ${this.renderMusicSection()}
                </div>
            </div>

            <!-- Sección: Maestros del Duelo -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('meta-masters-config-section')">
                    ▶ Maestros del Duelo
                </h3>
                <div id="meta-masters-config-section" class="config-section-content" style="display:none;">
                    ${this.renderMetaMastersSection()}
                </div>
            </div>

            <!-- Sección: Fuentes Externas del Meta -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('meta-links-config-section')">
                    ▶ Fuentes Externas del Meta
                </h3>
                <div id="meta-links-config-section" class="config-section-content" style="display:none;">
                    ${this.renderMetaLinksSection()}
                </div>
            </div>


            <!-- Sección: Juegos Alternativos -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('formacion-games-config-section')">
                    ▶ Juegos Alternativos de Yu-Gi-Oh!
                </h3>
                <div id="formacion-games-config-section" class="config-section-content" style="display:none;">
                    ${this.renderFormacionGamesSection()}
                </div>
            </div>

            <!-- Sección: Temas de Formación -->
            <div class="config-section">
                <h3 class="config-section-title" onclick="Config.toggleSection('formacion-topics-section')">
                    ▶ Temas de Formación
                </h3>
                <div id="formacion-topics-section" class="config-section-content" style="display:none;">
                    ${this.renderFormacionTopicsSection()}
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
                    <button class="btn btn-danger" data-section-id="config-danger-delete" onclick="Config.borrarDeck()">
                        🗑️ Borrar Deck
                        <small style="display:block;font-weight:normal;font-size:0.7rem;opacity:0.75;">
                            Decks guardados, winrates, notas, cache de scores
                        </small>
                    </button>
                    <button class="btn btn-danger" data-section-id="config-danger-meta" onclick="Config.borrarMeta()">
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

      const kwChips = keywords.map((kw, idx) => `
            <div class="keyword-chip">
                <span class="chip-text">${kw}</span>
                <span class="chip-remove" onclick="Config.removeCondKeywordByIndex('${roleName}',${idx})">×</span>
            </div>`).join('');

        const condChips = conditionals.map((c, idx) => `
            <div class="keyword-chip conditional-chip">
                <span class="chip-text">${c}</span>
                <span class="chip-remove" onclick="Config.removeConditionalByIndex('${roleName}',${idx})">×</span>
            </div>`).join('');

        return `
            <div class="role-card" data-role="${roleName}" id="role-anchor-${roleName}">
                <div class="role-card-header">
                    <input type="text" class="role-name-input" value="${roleName}"
                        data-original="${roleName}"
                        onblur="Config.renameRole(this)"
                        onkeydown="if(event.key==='Enter')this.blur()">
                    <button class="btn-duplicate-role" onclick="Config.duplicateRole('${roleName}')" title="Duplicar rol" style="background:none;border:none;cursor:pointer;font-size:1rem;margin-right:4px;">⧉</button>
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
                                — busca keywords solo en esas oraciones del efecto (vacío = todo el efecto)
                            </small>
                        </label>
                        <div class="keywords-container">
                            ${(() => {
                                const selected = ConfigManager.getRoleNomenclatureCategories(roleName);
                                const cats = ConfigManager.getNomenclature().categories || [];
                                if (selected.length === 0) return '<span class="empty-chips">Sin restricción (todo el efecto)</span>';
                                return selected.map(catId => {
                                    const cat = cats.find(c => c.id === catId);
                                    const label = cat ? cat.name : catId;
                                    const borderColor = cat?.color || '#888';
                                    return `<div class="keyword-chip" style="border-color:${borderColor}">
                                        <span class="chip-text">${label}</span>
                                        <span class="chip-remove" onclick="Config.removeRoleNomCat('${roleName}','${catId}')">×</span>
                                    </div>`;
                                }).join('');
                            })()}
                        </div>
                        <div class="add-keyword-container">
                            <select class="role-nom-select" id="nom-cat-select-${roleName}">
                                ${Config.renderNomCategoryOptionsAdd(roleName)}
                            </select>
                            <button class="btn btn-sm" onclick="Config.addRoleNomCat('${roleName}')">+ Agregar</button>
                        </div>
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
    removeCondKeywordByIndex: function (roleName, index) {
        const cond = ConfigManager.getRoleCondition(roleName);
        if (!cond?.keywords) return;
        const kw = cond.keywords[index];
        if (kw !== undefined) {
            ConfigManager.removeKeywordFromRoleCondition(roleName, kw);
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        }
    },

    removeConditionalByIndex: function (roleName, index) {
        const cond = ConfigManager.getRoleCondition(roleName);
        if (!cond?.conditionals) return;
        const c = cond.conditionals[index];
        if (c !== undefined) {
            ConfigManager.removeConditionalFromRole(roleName, c);
            this.render();
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
        }
    },

    // ===============================
    // SECCIÓN DE ESPECIALIDADES (pares horizontales)
    // ===============================
    renderSpecialtiesSection: function() {
    const pairs = ConfigManager.getSpecialties();
    const roles = ConfigManager.getRoleNames();
    const roleOpts = (selected) => ['', ...roles].map(r =>
        `<option value="${r}" ${r === (selected||'') ? 'selected' : ''}>${r || '-- Sin rol --'}</option>`
    ).join('');

    let html = `
        <div class="config-help-text">
            <p><strong>Mecánicas y Counters:</strong> Conecta roles entre sí. El sistema detectará automáticamente qué cartas ejecutan cada mecánica y cuáles la contrarrestan según los roles asignados.</p>
            <small>Ejemplo: <em>Searcher ⟷ Handtrap</em> — cualquier carta con rol Handtrap countera a cualquier carta con rol Searcher.</small>
        </div>
        <div style="margin-bottom:var(--spacing-md);">
            <button class="btn btn-primary" onclick="Config.createSpecialtyPair()">➕ Nuevo Par</button>
        </div>
        <div class="specialty-pairs-list">`;

    if (pairs.length === 0) {
        html += '<p class="empty-chips" style="padding:var(--spacing-md);">No hay pares configurados</p>';
    }

    pairs.forEach(pair => {
        html += `
            <div class="specialty-pair-row" id="spec-anchor-${pair.id}" style="position:relative;">
                <div class="specialty-half spec-side">
                    <div class="specialty-half-header">
                        <span class="spec-badge">Mecánica</span>
                    </div>
                    <select class="keyword-input" id="mech-role-${pair.id}"
                        onchange="ConfigManager.updateSpecialtyPair('${pair.id}', this.value, document.getElementById('ctr-role-${pair.id}').value)">
                        ${roleOpts(pair.mechanicRole)}
                    </select>
                </div>
                <div class="specialty-connector">⟷</div>
                <div class="specialty-half counter-side">
                    <div class="specialty-half-header">
                        <span class="counter-badge">Counter</span>
                    </div>
                    <select class="keyword-input" id="ctr-role-${pair.id}"
                        onchange="ConfigManager.updateSpecialtyPair('${pair.id}', document.getElementById('mech-role-${pair.id}').value, this.value)">
                        ${roleOpts(pair.counterRole)}
                    </select>
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
            <div class="config-help-text" style="margin-bottom:var(--spacing-md);padding:var(--spacing-sm);background:rgba(255,215,0,0.07);border-left:3px solid var(--gold-color);border-radius:4px;">
    <p style="margin:0 0 6px 0;"><strong>¿Qué es la Nomenclatura?</strong></p>
    <p style="margin:0;line-height:1.6;opacity:0.85;">
        El texto de cada carta YGO sigue una estructura fija: primero indica 
        <em>cuándo</em> se activa (Timing), luego <em>qué necesitas</em> (Requisito/Costo), 
        y finalmente <em>qué hace</em> (Efecto). Las nomenclaturas te permiten colorear 
        cada parte del texto para leerla más rápido.<br>
        <strong>Ejemplo:</strong> <em>"During your opponent's turn (Timing) · send 1 card from your hand (Costo): negate the activation (Efecto)"</em><br>
        Usa <code>contains</code> para detectar palabras clave dentro de una cláusula, 
        <code>startsWith</code> si siempre empieza igual, y <code>notContains</code> para excluir falsos positivos.
    </p>
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
// ===============================
// RENDIMIENTOS DECRECIENTES
// ===============================

renderDiminishingSection: function() {
    const config = ConfigManager.getDiminishingReturns();
    const roles = Object.keys(ConfigManager.getRoles() || {});
    
    let html = `
        <div class="config-section">
            <h3>⚖️ Rendimientos Decrecientes</h3>
            <p class="config-help-text">
                Define cuántas cartas de cada rol aportan de manera óptima antes de 
                que su valor marginal disminuya. Esto no penaliza Mecánica, 
                solo refleja que carta #1 vale más que carta #20.
            </p>
            
            <label class="config-checkbox">
                <input type="checkbox" id="diminishing-enabled" 
                    ${config.enabled ? 'checked' : ''} 
                    onchange="Config.toggleDiminishing()">
                Activar sistema de rendimientos decrecientes
            </label>
            
            <div id="diminishing-roles-config" style="${config.enabled ? '' : 'display:none'}">
    `;
    
    roles.forEach(role => {
    const threshold = config.roleThresholds[role] || { optimal: 10, max: 15, curve: 0.5, crossPenalty: false };
    html += `
        <div class="diminishing-role-card">
            <h4>${role}</h4>
            <div class="diminishing-inputs">
                <label>
                    Cantidad óptima: 
                    <input type="number" min="1" max="40" value="${threshold.optimal}" 
                        id="dim-optimal-${role}">
                </label>
                <label>
                    Umbral máximo: 
                    <input type="number" min="1" max="40" value="${threshold.max}" 
                        id="dim-max-${role}">
                </label>
                <label>
                    Severidad curva (0.1-1.0): 
                    <input type="number" min="0.1" max="1" step="0.1" value="${threshold.curve}" 
                        id="dim-curve-${role}">
                </label>
                <label class="config-checkbox" style="grid-column: 1 / -1;">
                    <input type="checkbox" id="dim-cross-${role}" 
                        ${threshold.crossPenalty ? 'checked' : ''}>
                    ⚠️ Exceso reduce otros pilares (penalización cruzada)
                </label>
                <button class="btn btn-success" onclick="Config.saveDiminishingRole('${role}')">
                    Guardar
                </button>
            </div>
        </div>
    `;
});
    
    html += `
            </div>
        </div>
    `;
    
    return html;
},

toggleDiminishing: function() {
    const enabled = document.getElementById('diminishing-enabled').checked;
    const config = ConfigManager.getDiminishingReturns();
    config.enabled = enabled;
    ConfigManager.saveDiminishingReturns(config);
    
    document.getElementById('diminishing-roles-config').style.display = 
        enabled ? '' : 'none';
},

saveDiminishingRole: function(role) {
    const optimal = parseFloat(document.getElementById(`dim-optimal-${role}`).value);
    const max = parseFloat(document.getElementById(`dim-max-${role}`).value);
    const curve = parseFloat(document.getElementById(`dim-curve-${role}`).value);
    const crossPenalty = document.getElementById(`dim-cross-${role}`).checked;
    
    ConfigManager.updateRoleThreshold(role, { optimal, max, curve, crossPenalty });
    alert(`✓ Configuración de ${role} guardada`);
},
   renderNomenclatureCategory: function (cat) {
        const cond = cat.conditions || {};

        const toArr = (v) => Array.isArray(v) ? v : (v ? [v] : []);
        const startsArr    = toArr(cond.startsWith);
        const containsArr  = toArr(cond.contains);
        const notContArr   = toArr(cond.notContains);
        const endsArr      = toArr(cond.endsWith);

        const makeChips = (arr, field, chipClass = '') => arr.map((kw, idx) => `
            <div class="keyword-chip ${chipClass}">
                <span class="chip-text">${kw}</span>
                <span class="chip-remove"
                    onclick="Config.removeNomCondKwByIndex('${cat.id}','${field}',${idx})">×</span>
            </div>`).join('');

        return `
        <div class="role-card" id="nom-anchor-${cat.id}">
            <div class="role-card-header">
                <input type="color" value="${cat.color}" title="Color de la categoría"
                    style="width:36px;height:36px;min-width:36px;border:2px solid var(--border-color);border-radius:6px;cursor:pointer;padding:2px;background:transparent;appearance:none;-webkit-appearance:none;"
                    onchange="ConfigManager.updateNomenclatureCategory('${cat.id}',{color:this.value});Config.render()">
                <input type="text" class="role-name-input" value="${cat.name}"
                    onblur="ConfigManager.updateNomenclatureCategory('${cat.id}',{name:this.value})"
                    onkeydown="if(event.key==='Enter')this.blur()">
                <button class="btn-delete-role" style="margin-left:auto;"
                    onclick="Config.deleteNomCategory('${cat.id}')">🗑️</button>
            </div>
            <div class="role-card-body" style="gap:12px;">

                <label class="config-label">
                    Empieza con:
                    <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— AL MENOS UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(startsArr, 'startsWith') || '<span class="empty-chips">Sin restricción de inicio</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-starts-${cat.id}" placeholder="Agregar inicio...">
                    <button class="btn btn-sm"
                        onclick="Config.addNomCondKw('${cat.id}','startsWith',document.getElementById('nom-starts-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label">
                    Contiene:
                    <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— AL MENOS UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(containsArr, 'contains') || '<span class="empty-chips">Sin keywords (cualquier texto)</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-contains-${cat.id}" placeholder="Agregar opción...">
                    <button class="btn btn-sm"
                        onclick="Config.addNomCondKw('${cat.id}','contains',document.getElementById('nom-contains-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label conditional-label">
                    NO contiene:
                    <small style="font-weight:normal;">— NINGUNA debe estar presente</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(notContArr, 'notContains', 'conditional-chip') || '<span class="empty-chips">Sin restricciones</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input conditional-input" id="nom-notcontains-${cat.id}" placeholder="Agregar exclusión...">
                    <button class="btn btn-sm btn-danger"
                        onclick="Config.addNomCondKw('${cat.id}','notContains',document.getElementById('nom-notcontains-${cat.id}'))">+ Agregar</button>
                </div>

                <label class="config-label">
                    Termina en:
                    <small style="font-weight:normal;color:rgba(241,241,241,0.55);">— AL MENOS UNA debe cumplirse</small>
                </label>
                <div class="keywords-container">
                    ${makeChips(endsArr, 'endsWith') || '<span class="empty-chips">Sin restricción de cierre</span>'}
                </div>
                <div class="add-keyword-container">
                    <input type="text" class="keyword-input" id="nom-ends-${cat.id}" placeholder="Agregar cierre...">
                    <button class="btn btn-sm"
                        onclick="Config.addNomCondKw('${cat.id}','endsWith',document.getElementById('nom-ends-${cat.id}'))">+ Agregar</button>
                </div>

                <div class="config-help-text" style="margin-top:8px;">
                    <small><strong>Cómo funciona:</strong> Un segmento se detecta si empieza con AL MENOS UNA de "Empieza con", contiene AL MENOS UNA de "Contiene", NO contiene NINGUNA de "NO contiene", y termina con AL MENOS UNA de "Termina en". Los campos vacíos no se verifican.</small>
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
    createSpecialtyPair: function() {
    const id = ConfigManager.createSpecialtyPair('', '');
    this.render();
    this._restoreAndScroll('specialties-section', `spec-anchor-${id}`);
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
            this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
            console.log(`✅ Carta agregada: ${card.name} (ID: ${card.id})`);
        } catch (e) {
            
            console.error('❌ No se encontró la carta. Verifica el ID.' + card.name);
            
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
    addNomenclatureCategory: function() {
    ConfigManager.addNomenclatureCategory();
    this.render();
    // La nueva categoría queda primera — scroll al inicio de la sección
    this._restoreAndScroll('nomenclature-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('nomenclature-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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
    
    addNomCondKw: function (catId, field, el) {
    const kw = el.value.trim().toLowerCase();
    if (!kw) { alert('⚠️ Escribe una keyword'); return; }
    if (ConfigManager.addNomCondKw(catId, field, kw)) {
        el.value = '';
        this.render();
        this._restoreAndScroll('nomenclature-section', `nomenclature-category-anchor-${catId}`);
    } else {
        alert('❌ Ya existe esa keyword');
    }
},

removeNomCondKw: function (catId, field, kw) {
        if (ConfigManager.removeNomCondKw(catId, field, kw)) {
            this.render();
            this._restoreAndScroll('nomenclature-section', `nomenclature-category-anchor-${catId}`);
        }
    },
    removeNomCondKwByIndex: function (catId, field, index) {
        if (ConfigManager.removeNomCondKwByIndex(catId, field, index)) {
            this.render();
            this._restoreAndScroll('nomenclature-section', `nomenclature-category-anchor-${catId}`);
        }
    },renderNomCategoryOptionsAdd: function(roleName) {
    const cats     = ConfigManager.getNomenclature().categories || [];
    const selected = ConfigManager.getRoleNomenclatureCategories(roleName);
    const available = cats.filter(c => !selected.includes(c.id));
    if (available.length === 0)
        return '<option value="">Sin más categorías</option>';
    return '<option value="">-- Seleccionar --</option>' +
        available.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
},

addRoleNomCat: function(roleName) {
    const sel = document.getElementById(`nom-cat-select-${roleName}`);
    if (!sel || !sel.value) return;
    if (ConfigManager.addRoleNomenclatureCategory(roleName, sel.value)) {
        this.render();
        this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
    }
},

removeRoleNomCat: function(roleName, catId) {
    if (ConfigManager.removeRoleNomenclatureCategory(roleName, catId)) {
        this.render();
        this._restoreAndScroll('roles-section', `role-anchor-${roleName}`);
    }
},
_restoreAndScroll: function(sectionId, anchorId) {
    requestAnimationFrame(() => {
        const sec = document.getElementById(sectionId);
        if (sec) sec.style.display = 'block';
        if (anchorId) {
            const el = document.getElementById(anchorId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
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
        '• Biblioteca de cartas del meta\n' +
        '• Scores calculados de decks del meta\n' +
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
    if (window.Welcome) Welcome.dismissed = false;

    // Guardar config vacía explícitamente
    const emptyConfig = {
        roles:          {},
        roleConditions: {},
        roleWeights:    {},
        specialties:    [],
        staples:        {},
        nomenclature:   { categories: [] },
        pillars:        { consistency: [], power: [], resilience: [] }
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
        Estadisticas.powerScoreCache  = null;
        Estadisticas.metaDecks        = {};
        Estadisticas.metaFolders      = [];
        Estadisticas.metaCardLibrary  = {};
       Estadisticas.metaDeckScores   = {};
        Estadisticas.crossScores      = {};
        const statsEl = document.getElementById('estadisticas-content');
        if (statsEl) Estadisticas.render();
        if (typeof Estadisticas.updateFloatingWidget === 'function')
            Estadisticas.updateFloatingWidget();
    }
    if (window.Favoritas) Favoritas.render();
    if (window.Winrate)   Winrate.refreshSection();
    if (window.Duelista)  Duelista.refreshSection();
    
    this.render();

    // Mostrar welcome panel de nuevo
if (window.Welcome) Welcome.init();
    alert('✅ Todo borrado. La app está completamente vacía.');
},
renderPillarsSection: function() {
    const pillars   = ConfigManager.getPillars();
    const allRoles  = ConfigManager.getRoleNames();

    const pillarDefs = [
        { key: 'consistency', label: '🎯 Consistencia', color: '#00b894',
          hint: 'Arranque y búsqueda — roles que garantizan la mano inicial.' },
        { key: 'power',       label: '⚡ Potencia',      color: '#d63031',
          hint: 'Cierre y rompedoras — roles que ganan el juego.' },
        { key: 'resilience',  label: '🛡️ Resiliencia',   color: '#0066cc',
          hint: 'Negación y extensión — roles que sostienen la estrategia.' }
    ];

    const pillarCard = (def) => {
        const assigned = pillars[def.key] || [];
        const available = allRoles.filter(r => !assigned.includes(r));

        const chips = assigned.length > 0
            ? assigned.map(role => {
                const w = ConfigManager.getRoleWeight(role).toFixed(1);
                return `<div class="keyword-chip" style="border-color:${def.color}">
                    <span class="chip-text">${role} <small style="opacity:0.6">(${w})</small></span>
                    <span class="chip-remove"
                        onclick="Config.removePillarRole('${def.key}','${role}')">×</span>
                </div>`;
            }).join('')
            : '<span class="empty-chips">Sin roles asignados</span>';

        const opts = available.length > 0
            ? '<option value="">-- Agregar rol --</option>' +
              available.map(r => `<option value="${r}">${r}</option>`).join('')
            : '<option value="">Sin roles disponibles</option>';

        return `
            <div class="role-card" style="border-top:3px solid ${def.color}">
                <div class="role-card-header" style="background:${def.color}22">
                    <span style="font-weight:bold;color:${def.color}">${def.label}</span>
                </div>
                <div class="role-card-body">
                    <small class="config-help-text" style="display:block;margin-bottom:8px;">${def.hint}</small>
                    <div class="keywords-container">${chips}</div>
                    <div class="add-keyword-container" style="margin-top:8px;">
                        <select class="keyword-input" id="pillar-add-${def.key}">${opts}</select>
                        <button class="btn btn-sm"
                            onclick="Config.addPillarRole('${def.key}')">+ Agregar</button>
                    </div>
                </div>
            </div>`;
    };

   const PILLAR_LABELS = { consistency: 'Consistencia', power: 'Potencia', resilience: 'Resiliencia' };
    const rps = ConfigManager.getPillarRPS();

    const rpsRows = rps.map((pair, i) => `
        <div class="rps-config-row">
            <select class="keyword-input rps-select" onchange="Config.updateRPSRule(${i}, 0, this.value)">
                ${['consistency','power','resilience'].map(p =>
                    `<option value="${p}" ${pair[0]===p?'selected':''}>${PILLAR_LABELS[p]}</option>`
                ).join('')}
            </select>
            <span class="rps-arrow">vence a</span>
            <select class="keyword-input rps-select" onchange="Config.updateRPSRule(${i}, 1, this.value)">
                ${['consistency','power','resilience'].map(p =>
                    `<option value="${p}" ${pair[1]===p?'selected':''}>${PILLAR_LABELS[p]}</option>`
                ).join('')}
            </select>
        </div>`).join('');

    return `
        <div class="config-help-text">
            <p>Define qué roles de tu configuración aportan a cada pilar. El <strong>peso del rol</strong> (definido en Roles) determina cuánto aporta cada uno.</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--spacing-md);">
            ${pillarDefs.map(d => pillarCard(d)).join('')}
        </div>
        <div style="margin-top:var(--spacing-md);">
            <div class="config-help-text" style="margin-bottom:8px;">
                <strong>Relación entre pilares (RPS)</strong> — define qué pilar vence a cuál en match-ups. Afecta el External Score cuando los pilares dominantes se enfrentan.
            </div>
            <div class="rps-config-grid">${rpsRows}</div>
        </div>`;
},
renderShortcutsSection: function () {
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    const catalog   = window.Shortcuts?.CATALOG || [];
    const MAX       = 6;

    const rows = shortcuts.map((s, i) => `
        <div class="shortcut-row">
            <span class="shortcut-label">⚡ ${s.label}</span>
            <div class="shortcut-row-actions">
                ${i > 0 ? `<button class="btn btn-sm" onclick="Config.moveShortcut(${i}, -1)" title="Subir">↑</button>` : '<span style="width:32px"></span>'}
                ${i < shortcuts.length - 1 ? `<button class="btn btn-sm" onclick="Config.moveShortcut(${i}, 1)" title="Bajar">↓</button>` : '<span style="width:32px"></span>'}
                <button class="btn btn-sm btn-danger" onclick="Config.removeShortcut(${i})" title="Quitar">✕</button>
            </div>
        </div>`).join('');

    const available = catalog.filter(c => !shortcuts.some(s => s.label === c.label));
    const opts = available.length > 0
        ? '<option value="">-- Agregar atajo --</option>' +
          available.map((c, i) => `<option value="${i}">${c.label}</option>`).join('')
        : '<option value="">Todos los atajos ya están agregados</option>';

    const canAdd = shortcuts.length < MAX && available.length > 0;

    return `
        <div class="config-help-text">
            <p>Configura hasta <strong>${MAX} atajos</strong> para el botón flotante ⚡. El orden determina cómo aparecen en el menú.</p>
        </div>
        <div class="shortcuts-config-list">
            ${rows || '<p class="stats-empty" style="margin:0">No hay atajos configurados.</p>'}
        </div>
        ${canAdd ? `
        <div class="add-keyword-container" style="margin-top:12px;">
            <select class="keyword-input" id="shortcut-add-select">${opts}</select>
            <button class="btn btn-sm" onclick="Config.addShortcut()">+ Agregar</button>
        </div>` : `<p style="opacity:0.4;font-size:0.8rem;margin-top:8px;">Máximo de ${MAX} atajos alcanzado.</p>`}`;
},

addShortcut: function () {
    const sel = document.getElementById('shortcut-add-select');
    if (!sel || !sel.value) return;
    const catalog   = window.Shortcuts?.CATALOG || [];
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    const available = catalog.filter(c => !shortcuts.some(s => s.label === c.label));
    const entry     = available[parseInt(sel.value)];
    if (!entry || shortcuts.length >= 6) return;
    shortcuts.push(entry);
    window.ConfigManager.saveShortcuts(shortcuts);
    this.render();
    this._restoreAndScroll('shortcuts-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('shortcuts-section');
        if (sec) sec.style.display = 'block';
    });
},

removeShortcut: function (index) {
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    shortcuts.splice(index, 1);
    window.ConfigManager.saveShortcuts(shortcuts);
    this.render();
    requestAnimationFrame(() => {
        const sec = document.getElementById('shortcuts-section');
        if (sec) sec.style.display = 'block';
    });
},

moveShortcut: function (index, dir) {
    const shortcuts = window.ConfigManager?.getShortcuts?.() || [];
    const newIndex  = index + dir;
    if (newIndex < 0 || newIndex >= shortcuts.length) return;
    [shortcuts[index], shortcuts[newIndex]] = [shortcuts[newIndex], shortcuts[index]];
    window.ConfigManager.saveShortcuts(shortcuts);
    this.render();
    requestAnimationFrame(() => {
        const sec = document.getElementById('shortcuts-section');
        if (sec) sec.style.display = 'block';
    });
},
addPillarRole: function(pillar) {
    const sel = document.getElementById(`pillar-add-${pillar}`);
    if (!sel || !sel.value) return;
    if (ConfigManager.addRoleToPillar(pillar, sel.value)) {
        this.render();
    this._restoreAndScroll('pillar-section', `pillar-anchor-${pillar}`);
    }
},

removePillarRole: function(pillar, role) {
    if (ConfigManager.removeRoleFromPillar(pillar, role)) {
        this.render();
        this._restoreAndScroll('pillar-section', `pillar-anchor-${pillar}`);
    }
},
updateRPSRule: function (index, position, value) {
    const rps = ConfigManager.getPillarRPS();
    if (!rps[index]) return;
    rps[index][position] = value;
    ConfigManager.savePillarRPS(rps);
    // No re-render completo — los selects ya tienen el valor correcto
},
duplicateRole: function(roleName) {
    const newName = ConfigManager.duplicateRole(roleName);
    if (!newName) return;
    this.render();
    this._restoreAndScroll('roles-section', `role-anchor-${CSS.escape(newName)}`);
},
renderMusicSection: function () {
    const cfg    = window.ConfigManager ? ConfigManager.getMusicConfig() : ConfigManager.defaultMusicConfig;
    const tracks = cfg.tracks || {};
    const volume = cfg.volume ?? 0.40;
    const enabled = cfg.enabled !== false;

    const row = (key, label) => `
        <div class="music-track-row">
            <label class="music-track-label">${label}</label>
            <input type="text" class="config-input music-track-input"
                   id="music-track-${key}"
                   value="${tracks[key] || ''}"
                   placeholder="ots/nombre.mp3">
        </div>`;

    return `
        <div class="music-config-block">
            <label class="music-enable-label">
                <input type="checkbox" id="music-enabled-cb" ${enabled ? 'checked' : ''}>
                Activar música de fondo
            </label>

            <div class="music-volume-row">
                <span class="music-track-label">Volumen</span>
                <input type="range" id="music-volume-slider"
                       min="0" max="1" step="0.05" value="${volume}"
                       oninput="Config.onVolumeChange(this.value)">
                <span id="music-volume-display" class="music-volume-display">
                    ${Math.round(volume * 100)}%
                </span>
            </div>

            <div class="music-tracks-block">
                <div class="music-tracks-title">Pistas por Perfil</div>
                ${row('default',     '🎵 Por defecto')}
                ${row('novato',      '🌱 Novato')}
                ${row('casual',      '🃏 Casual')}
                ${row('competitivo', '⚔️ Competitivo')}
            </div>

            <button class="btn btn-primary" onclick="Config.saveMusicConfig()" style="margin-top:12px;">
                Guardar Ajustes de Música
            </button>
        </div>`;
},

saveMusicConfig: function () {
    const enabled = document.getElementById('music-enabled-cb')?.checked !== false;
    const volume  = parseFloat(document.getElementById('music-volume-slider')?.value ?? 0.40);
    const tracks  = {
        default:     (document.getElementById('music-track-default')?.value     || 'ots/Climax Theme 2.mp3').trim(),
        novato:      (document.getElementById('music-track-novato')?.value      || 'ots/Climax Theme 5.mp3').trim(),
        casual:      (document.getElementById('music-track-casual')?.value      || 'ots/Climax Theme 5.mp3').trim(),
        competitivo: (document.getElementById('music-track-competitivo')?.value || 'ots/Climax Theme 5.mp3').trim()
    };
    const cfg = { enabled, volume, tracks };
    if (window.ConfigManager) ConfigManager.saveMusicConfig(cfg);
    if (window.MusicPlayer) {
        MusicPlayer.setVolume(volume);
        MusicPlayer.setEnabled(enabled);
    }
    const disp = document.getElementById('music-volume-display');
    if (disp) disp.textContent = Math.round(volume * 100) + '%';
},

onVolumeChange: function (val) {
    const disp = document.getElementById('music-volume-display');
    if (disp) disp.textContent = Math.round(parseFloat(val) * 100) + '%';
    if (window.MusicPlayer) MusicPlayer.setVolume(parseFloat(val));
},
renderPlayerLevelSection: function () {
    const current = window.ConfigManager ? ConfigManager.getPlayerLevel() : 'default';
    const levels = [
        { key: 'novato',      icon: '🌱', label: 'Novato',      desc: 'Aprende las bases del juego y la app',           color: '#00b894' },
        { key: 'casual',      icon: '🃏', label: 'Casual',      desc: 'Construye decks y juega por diversión',           color: '#fdcb6e' },
        { key: 'competitivo', icon: '⚔️', label: 'Competitivo', desc: 'Analiza el meta y optimiza tu estrategia',        color: '#d63031' },
    ];

    const buttons = levels.map(l => {
        const isActive = current === l.key;
        const border   = isActive ? `2px solid ${l.color}` : '1px solid rgba(255,255,255,0.1)';
        const bg       = isActive ? `${l.color}18` : 'transparent';
        return `
            <button class="welcome-btn"
                    style="border:${border};background:${bg};cursor:pointer;"
                    onclick="Config.selectPlayerLevel('${l.key}')">
                <span class="wb-icon">${l.icon}</span>
                <span>
                    <span class="wb-label" style="color:${l.color}">${l.label}${isActive ? ' ✓' : ''}</span>
                    <span class="wb-desc">${l.desc}</span>
                </span>
            </button>`;
    }).join('');

    return `
        <div class="config-help-text">
            <p>Cambia tu perfil en cualquier momento. Activa automáticamente la pista musical asociada.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;max-width:480px;">
            ${buttons}
        </div>`;
},

selectPlayerLevel: function (levelKey) {
    if (window.ConfigManager) ConfigManager.savePlayerLevel(levelKey);
    if (window.MusicPlayer) {
        const cfg  = window.ConfigManager ? ConfigManager.getMusicConfig() : {};
        const path = cfg.tracks?.[levelKey] || 'ots/Climax Theme 2.mp3';
        MusicPlayer.setTrack(path);
    }
    this.render();
    this._restoreAndScroll('player-level-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('player-level-section');
        if (sec) sec.style.display = 'block';
    });
},
// ===============================
// FUENTES EXTERNAS DEL META
// ===============================
renderMetaLinksSection: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Define los enlaces que se mostrarán en la pestaña Meta. Cada fuente tiene título, URL y descripción opcional.
        </p>
        <div class="meta-links-list" id="config-meta-links-list">
            ${links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('')}
        </div>
        <button class="meta-links-add-btn" onclick="Config.addMetaLink()">+ Agregar fuente</button>
        <br>
        <button class="meta-links-save-btn" onclick="Config.saveMetaLinks()">💾 Guardar fuentes</button>
    `;
},

_renderMetaLinkItem: function (lk, i) {
    return `
        <div class="meta-link-item" id="meta-link-item-${i}">
            <div class="meta-link-item-header">
                <span class="meta-link-index">#${i + 1}</span>
                <button class="meta-link-del-btn" onclick="Config.removeMetaLink(${i})">✕ Eliminar</button>
            </div>
            <div class="meta-link-field">
                <label>Título</label>
                <input type="text" id="ml-title-${i}" value="${this._escVal(lk.title)}" placeholder="Ej: Master Duel Meta – Tier List">
            </div>
            <div class="meta-link-field">
                <label>URL</label>
                <input type="url" id="ml-url-${i}" value="${this._escVal(lk.url)}" placeholder="https://...">
            </div>
            <div class="meta-link-field">
                <label>Descripción</label>
                <textarea id="ml-desc-${i}" placeholder="Descripción breve de la fuente...">${this._escVal(lk.desc)}</textarea>
            </div>
        </div>
    `;
},

_escVal: function (str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
},

addMetaLink: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.push({ id: 'ml_' + Date.now(), title: '', url: '', desc: '' });
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

removeMetaLink: function (index) {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.splice(index, 1);
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

saveMetaLinks: function () {
    const list = document.getElementById('config-meta-links-list');
    if (!list || !window.ConfigManager) return;
    const items = list.querySelectorAll('.meta-link-item');
    const links = [];
    items.forEach((item, i) => {
        links.push({
            id:    document.getElementById(`ml-title-${i}`) ? ('ml_' + i) : ('ml_' + Date.now() + i),
            title: (document.getElementById(`ml-title-${i}`)?.value || '').trim(),
            url:   (document.getElementById(`ml-url-${i}`)?.value   || '').trim(),
            desc:  (document.getElementById(`ml-desc-${i}`)?.value  || '').trim()
        });
    });
    ConfigManager.saveMetaLinks(links);
    alert('Fuentes guardadas. Los cambios se verán la próxima vez que abras la pestaña Meta.');
},

_reRenderMetaLinks: function (links) {
    const list = document.getElementById('config-meta-links-list');
    if (!list) return;
    list.innerHTML = links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('');
},
// ===============================
// MAESTROS DEL JUEGO - CONFIG
// ===============================
_META_FORMATS: ['TCG', 'OCG', 'Genesys', 'Master Duel', 'Duel Links', 'Time Wizard', 'Todos'],

renderMetaMastersSection: function () {
    const masters = window.ConfigManager ? ConfigManager.getMetaMasters() : [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Configura los creadores de contenido que aparecen en la pestaña Meta. Pega la URL del video de YouTube que quieras mostrar.
        </p>
        <div class="meta-masters-list" id="config-meta-masters-list">
            ${masters.map((m, i) => this._renderMetaMasterItem(m, i)).join('')}
        </div>
        <div class="meta-masters-btns">
            <button class="meta-masters-add-btn" onclick="Config.addMetaMaster()">+ Agregar maestro</button>
            <button class="meta-masters-save-btn" onclick="Config.saveMetaMasters()">💾 Guardar maestros</button>
        </div>
    `;
},

_renderMetaMasterItem: function (m, i) {
    const formats   = Array.isArray(m.formats) ? m.formats : [];
    const allFmts   = this._META_FORMATS;
    const checkboxes = allFmts.map(f => {
        const checked = formats.includes(f) ? 'checked' : '';
        return `<label class="meta-format-check-label">
            <input type="checkbox" value="${f}" ${checked} class="mm-fmt-${i}"> ${f}
        </label>`;
    }).join('');

    return `
        <div class="meta-master-item" id="meta-master-item-${i}">
            <div class="meta-master-item-header">
                <span class="meta-master-index">#${i + 1}</span>
                <button class="meta-master-del-btn" onclick="Config.removeMetaMaster(${i})">✕ Eliminar</button>
            </div>
            <div class="meta-master-field">
                <label>Nombre del Canal / Creador</label>
                <input type="text" id="mm-name-${i}" value="${this._escVal(m.name)}" placeholder="Ej: Team APS">
            </div>
            <div class="meta-master-field">
                <label>Título / Descripción corta</label>
                <input type="text" id="mm-title-${i}" value="${this._escVal(m.title)}" placeholder="Ej: El mejor canal de meta TCG">
            </div>
            <div class="meta-master-field">
                <label>URL del Video (YouTube)</label>
                <input type="url" id="mm-video-${i}" value="${this._escVal(m.videoUrl)}" placeholder="https://www.youtube.com/watch?v=...">
            </div>
            <div class="meta-master-field">
                <label>URL del Canal</label>
                <input type="url" id="mm-channel-${i}" value="${this._escVal(m.channelUrl)}" placeholder="https://www.youtube.com/@...">
            </div>
            <div class="meta-master-field">
                <label>Imagen/Video alternativo si el video no carga</label>
                <input type="url" id="mm-fallback-${i}" value="${this._escVal(m.fallbackUrl)}" placeholder="https://... o usa el botón para elegir archivo">
                <div style="display:flex;align-items:center;gap:8px;margin-top:5px;">
                    <button class="meta-master-file-btn" onclick="Config._pickFallbackFile(${i})">📁 Elegir archivo local</button>
                    ${m.fallbackUrl && m.fallbackUrl.startsWith('data:')
                        ? `<span style="font-size:0.72rem;color:rgba(255,215,0,0.6);">✔ Archivo local cargado</span>`
                        : ''}
                </div>
                <input type="file" id="mm-fallback-file-${i}" accept="image/*,video/mp4"
                    style="display:none;" onchange="Config._onFallbackFileChange(${i}, this)">
            </div>     
            <div class="meta-master-field">
                <label>Formato Especializado</label>
                <div class="meta-formats-check-grid">${checkboxes}</div>
            </div>
        </div>
    `;
},
_pickFallbackFile: function (i) {
    document.getElementById(`mm-fallback-file-${i}`)?.click();
},

_onFallbackFileChange: function (i, input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
        alert('El archivo es demasiado grande (máx. 1.5 MB). Usa una URL externa para archivos más pesados.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const urlInput = document.getElementById(`mm-fallback-${i}`);
        if (urlInput) {
            urlInput.value = e.target.result;
            urlInput.dispatchEvent(new Event('input'));
        }
        // Feedback visual
        const btn = input.previousElementSibling?.querySelector('.meta-master-file-btn');
        if (btn) btn.textContent = `✔ ${file.name}`;
    };
    reader.readAsDataURL(file);
},
addMetaMaster: function () {
    const list = document.getElementById('config-meta-masters-list');
    if (!list) return;
    const currentCount = list.querySelectorAll('.meta-master-item').length;
    const emptyMaster  = { id: 'mm_' + Date.now(), name: '', title: '', videoUrl: '', channelUrl: '', formats: [], fallbackUrl: '' };
    list.insertAdjacentHTML('beforeend', this._renderMetaMasterItem(emptyMaster, currentCount));
},

removeMetaMaster: function (index) {
    const item = document.getElementById(`meta-master-item-${index}`);
    if (!item) return;
    item.remove();
    // Re-indexar los items restantes en el DOM
    const list  = document.getElementById('config-meta-masters-list');
    if (!list) return;
    const items = list.querySelectorAll('.meta-master-item');
    items.forEach((el, i) => {
        el.id = `meta-master-item-${i}`;
        const idx = el.querySelector('.meta-master-index');
        if (idx) idx.textContent = `#${i + 1}`;
    });
},
saveMetaMasters: function () {
    const list = document.getElementById('config-meta-masters-list');
    if (!list || !window.ConfigManager) return;
    const items   = list.querySelectorAll('.meta-master-item');
    const masters = [];
    items.forEach((item, i) => {
        const fmtChecks = item.querySelectorAll(`.mm-fmt-${i}:checked`);
        const formats   = Array.from(fmtChecks).map(cb => cb.value);
        masters.push({
            id:         'mm_' + i,
            name:       (document.getElementById(`mm-name-${i}`)?.value    || '').trim(),
            title:      (document.getElementById(`mm-title-${i}`)?.value   || '').trim(),
            videoUrl:   (document.getElementById(`mm-video-${i}`)?.value   || '').trim(),
            channelUrl: (document.getElementById(`mm-channel-${i}`)?.value || '').trim(),
            fallbackUrl: (document.getElementById(`mm-fallback-${i}`)?.value || '').trim(),
            formats
        });
    });
    ConfigManager.saveMetaMasters(masters);
    alert('Maestros guardados. Los cambios se verán la próxima vez que abras la pestaña Meta.');
},

_reRenderMetaMasters: function (masters) {
    const list = document.getElementById('config-meta-masters-list');
    if (!list) return;
    list.innerHTML = masters.map((m, i) => this._renderMetaMasterItem(m, i)).join('');
},

// ===============================
// FUENTES EXTERNAS - CONFIG
// ===============================
renderMetaLinksSection: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Define los enlaces que se mostrarán en la pestaña Meta como frames de navegación.
        </p>
        <div class="meta-links-list" id="config-meta-links-list">
            ${links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('')}
        </div>
        <button class="meta-links-add-btn" onclick="Config.addMetaLink()">+ Agregar fuente</button>
        <br>
        <button class="meta-links-save-btn" onclick="Config.saveMetaLinks()">💾 Guardar fuentes</button>
    `;
},

_renderMetaLinkItem: function (lk, i) {
    return `
        <div class="meta-link-item" id="meta-link-item-${i}">
            <div class="meta-link-item-header">
                <span class="meta-link-index">#${i + 1}</span>
                <button class="meta-link-del-btn" onclick="Config.removeMetaLink(${i})">✕ Eliminar</button>
            </div>
            <div class="meta-link-field">
                <label>Título</label>
                <input type="text" id="ml-title-${i}" value="${this._escVal(lk.title)}" placeholder="Ej: Master Duel Meta – Tier List">
            </div>
            <div class="meta-link-field">
                <label>URL</label>
                <input type="url" id="ml-url-${i}" value="${this._escVal(lk.url)}" placeholder="https://...">
            </div>
            <div class="meta-link-field">
                <label>Descripción</label>
                <textarea id="ml-desc-${i}" placeholder="Descripción breve...">${this._escVal(lk.desc)}</textarea>
            </div>
        </div>
    `;
},

_escVal: function (str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
},

addMetaLink: function () {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.push({ id: 'ml_' + Date.now(), title: '', url: '', desc: '' });
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

removeMetaLink: function (index) {
    const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
    links.splice(index, 1);
    ConfigManager.saveMetaLinks(links);
    this._reRenderMetaLinks(links);
},

saveMetaLinks: function () {
    const list = document.getElementById('config-meta-links-list');
    if (!list || !window.ConfigManager) return;
    const links = [];
    list.querySelectorAll('.meta-link-item').forEach((item, i) => {
        links.push({
            id:    'ml_' + i,
            title: (document.getElementById(`ml-title-${i}`)?.value || '').trim(),
            url:   (document.getElementById(`ml-url-${i}`)?.value   || '').trim(),
            desc:  (document.getElementById(`ml-desc-${i}`)?.value  || '').trim()
        });
    });
    ConfigManager.saveMetaLinks(links);
    alert('Fuentes guardadas. Los cambios se verán la próxima vez que abras la pestaña Meta.');
},

_reRenderMetaLinks: function (links) {
    const list = document.getElementById('config-meta-links-list');
    if (!list) return;
    list.innerHTML = links.map((lk, i) => this._renderMetaLinkItem(lk, i)).join('');
},
// ===============================
// JUEGOS ALTERNATIVOS - CONFIG
// ===============================
_FORM_PLATFORMS: ['PC', 'GBC', 'GBA', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'Físico'],

renderFormacionGamesSection: function () {
    const games = window.ConfigManager?.getFormacionGames?.() ?? [];
    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Configura los juegos alternativos de Yu-Gi-Oh! que aparecen en la pestaña Formación.
        </p>
        <div class="form-games-list" id="config-form-games-list">
            ${games.map((g, i) => this._renderFormGameItem(g, i)).join('')}
        </div>
        <button class="form-games-add-btn" onclick="Config.addFormGame()">+ Agregar juego</button>
        <br>
        <button class="form-games-save-btn" onclick="Config.saveFormGames()">💾 Guardar juegos</button>
    `;
},

_renderFormGameItem: function (g, i) {
    const platforms  = Array.isArray(g.platforms) ? g.platforms : [];
    const checkboxes = this._FORM_PLATFORMS.map(p => {
        const checked = platforms.includes(p) ? 'checked' : '';
        return `<label class="form-platform-check-label">
            <input type="checkbox" value="${p}" ${checked} class="fg-plt-${i}"> ${p}
        </label>`;
    }).join('');

    return `
        <div class="form-game-item" id="form-game-item-${i}">
            <div class="form-game-item-header">
                <span class="form-game-index">#${i + 1}</span>
                <button class="form-game-del-btn" onclick="Config.removeFormGame(${i})">✕ Eliminar</button>
            </div>
            <div class="form-game-field">
                <label>Nombre del juego</label>
                <input type="text" id="fg-name-${i}" value="${this._escVal(g.name)}" placeholder="Ej: Yu-Gi-Oh! Forbidden Memories">
            </div>
            <div class="form-game-field">
                <label>Descripción corta</label>
                <input type="text" id="fg-title-${i}" value="${this._escVal(g.title)}" placeholder="Ej: Clásico de PS1">
            </div>
            <div class="form-game-field">
                <label>Link (al hacer click en la tarjeta)</label>
                <input type="url" id="fg-link-${i}" value="${this._escVal(g.link)}" placeholder="https://...">
            </div>
            <div class="form-game-field">
                <label>Imagen de portada (URL o archivo local)</label>
                <input type="url" id="fg-fallback-${i}" value="${this._escVal(g.fallbackUrl)}" placeholder="https://... o usa el botón">
                <div style="display:flex;align-items:center;gap:8px;margin-top:5px;">
                    <button class="form-game-file-btn" onclick="Config._pickFormGameFile(${i})">📁 Elegir archivo local</button>
                    ${g.fallbackUrl?.startsWith('local:') ? `<span style="font-size:0.72rem;color:rgba(255,215,0,0.6);">✔ Archivo local cargado</span>` : ''}
                </div>
                <input type="file" id="fg-fallback-file-${i}" accept="image/*"
                       style="display:none;" onchange="Config._onFormGameFileChange(${i}, this)">
            </div>
            <div class="form-game-field">
                <label>Plataforma</label>
                <div class="form-platforms-check-grid">${checkboxes}</div>
            </div>
        </div>
    `;
},

addFormGame: function () {
    const list = document.getElementById('config-form-games-list');
    if (!list) return;
    const i     = list.querySelectorAll('.form-game-item').length;
    const empty = { id: 'fg_' + Date.now(), name: '', title: '', link: '', fallbackUrl: '', platforms: [] };
    list.insertAdjacentHTML('beforeend', this._renderFormGameItem(empty, i));
},

removeFormGame: function (index) {
    const item = document.getElementById(`form-game-item-${index}`);
    if (!item) return;
    item.remove();
    const list  = document.getElementById('config-form-games-list');
    if (!list) return;
    list.querySelectorAll('.form-game-item').forEach((el, i) => {
        el.id = `form-game-item-${i}`;
        const idx = el.querySelector('.form-game-index');
        if (idx) idx.textContent = `#${i + 1}`;
    });
},

saveFormGames: function () {
    const list = document.getElementById('config-form-games-list');
    if (!list || !window.ConfigManager) return;
    const games = [];
    list.querySelectorAll('.form-game-item').forEach((item, i) => {
        const fmtChecks = item.querySelectorAll(`.fg-plt-${i}:checked`);
        games.push({
            id:          'fg_' + i,
            name:        (document.getElementById(`fg-name-${i}`)?.value     || '').trim(),
            title:       (document.getElementById(`fg-title-${i}`)?.value    || '').trim(),
            link:        (document.getElementById(`fg-link-${i}`)?.value     || '').trim(),
            fallbackUrl: (document.getElementById(`fg-fallback-${i}`)?.value || '').trim(),
            platforms:   Array.from(fmtChecks).map(cb => cb.value)
        });
    });
    ConfigManager.saveFormacionGames(games);
    alert('Juegos guardados. Los cambios se verán la próxima vez que abras la pestaña Formación.');
},

_pickFormGameFile: function (i) {
    document.getElementById(`fg-fallback-file-${i}`)?.click();
},

_onFormGameFileChange: function (i, input) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
        alert('Máx. 1.5 MB. Usa una URL externa para archivos más pesados.');
        return;
    }
    const reader  = new FileReader();
    reader.onload = (e) => {
        const gameId = `fg_${i}`;
        const ok     = ConfigManager.saveFormacionFallback(gameId, e.target.result);
        if (!ok) { alert('Almacenamiento lleno. Usa una URL externa.'); return; }
        const urlInput = document.getElementById(`fg-fallback-${i}`);
        if (urlInput) urlInput.value = `local:${gameId}`;
        const btn = document.querySelector(`#form-game-item-${i} .form-game-file-btn`);
        if (btn) btn.textContent = `✔ ${file.name}`;
    };
    reader.readAsDataURL(file);
},
renderFormacionTopicsSection: function () {
    const allTopics = window.Formacion?.TOPICS ?? [{ id: 'que-es-yugioh', label: '¿Qué es Yu-Gi-Oh!?' }];
    const cfg       = window.ConfigManager?.getFormacionTopicsConfig?.() ?? {};
    const mastered  = JSON.parse(localStorage.getItem('yugioh_formacion_mastered') || '[]');

    const rows = allTopics.map(t => {
        const topicCfg     = cfg[t.id] || {};
        const isActive     = topicCfg.active !== false;
        const hideOnMaster = topicCfg.hideOnMaster !== false;
        const isMastered   = mastered.includes(t.id);
        return `
            <div style="display:flex;align-items:center;justify-content:space-between;
                        padding:10px 12px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,215,0,0.1);
                        border-radius:8px;gap:12px;flex-wrap:wrap;">
                <div>
                    <span style="font-size:0.88rem;color:#f1f1f1;font-weight:600;">${t.label}</span>
                    ${isMastered ? '<span style="font-size:0.72rem;color:#2ecc71;margin-left:8px;">✅ Dominado</span>' : ''}
                </div>
                <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
                    <label style="font-size:0.78rem;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" ${isActive ? 'checked' : ''}
                               onchange="Config._saveTopicCfg('${t.id}','active',this.checked)"
                               style="accent-color:#FFD700;">
                        Activo (visible)
                    </label>
                    <label style="font-size:0.78rem;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" ${hideOnMaster ? 'checked' : ''}
                               onchange="Config._saveTopicCfg('${t.id}','hideOnMaster',this.checked)"
                               style="accent-color:#FFD700;">
                        Ocultar al dominar
                    </label>
                    ${isMastered ? `
                        <button onclick="Config._resetTopicMastered('${t.id}')"
                                style="background:rgba(214,48,49,0.15);border:1px solid rgba(214,48,49,0.3);
                                       color:#ff7675;border-radius:5px;padding:3px 9px;font-size:0.72rem;cursor:pointer;">
                            Restablecer
                        </button>` : ''}
                </div>
            </div>
        `;
    }).join('');

    return `
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin:0 0 12px 0;">
            Activa/desactiva temas y controla si se ocultan al ser dominados.
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
    `;
},

_saveTopicCfg: function (topicId, key, value) {
    if (!window.ConfigManager) return;
    const cfg         = ConfigManager.getFormacionTopicsConfig();
    if (!cfg[topicId]) cfg[topicId] = {};
    cfg[topicId][key] = value;
    ConfigManager.saveFormacionTopicsConfig(cfg);
},

_resetTopicMastered: function (topicId) {
    const mastered = JSON.parse(localStorage.getItem('yugioh_formacion_mastered') || '[]')
        .filter(id => id !== topicId);
    localStorage.setItem('yugioh_formacion_mastered', JSON.stringify(mastered));
    this.render();
    this._restoreAndScroll('formacion-topics-section', null);
    requestAnimationFrame(() => {
        const sec = document.getElementById('formacion-topics-section');
        if (sec) sec.style.display = 'block';
    });
},
};

window.Config = Config;
document.addEventListener('DOMContentLoaded', () => Config.init());