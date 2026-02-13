    // ===============================
    // SECCIÓN DE NOMENCLATURA - ESTRUCTURA NUEVA (4 CAMPOS)
    // ===============================
    renderNomenclatureSection: function () {
        const nomenclature = ConfigManager.getNomenclature();

        let html = `
            <div class="config-help-text">
                <p><strong>Nomenclatura de Efectos:</strong> Define cómo se detecta y colorea cada parte del efecto de una carta.</p>
                <small>Cada categoría tiene 4 campos opcionales. Los campos vacíos no se verifican. Un párrafo se marca si cumple TODAS las condiciones no-vacías.</small>
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
            <div class="role-card" id="nomenclature-card-${cat.id}">
                <div class="role-card-header">
                    <input type="color" value="${cat.color}" title="Color de la categoría"
                        style="width:44px;height:34px;border:2px solid var(--border-color);border-radius:6px;cursor:pointer;padding:2px;margin-right:8px;background:transparent;"
                        id="nomenclature-color-${cat.id}"
                        data-category-id="${cat.id}">
                    <input type="text" class="role-name-input" value="${cat.name}"
                        id="nomenclature-name-${cat.id}"
                        data-category-id="${cat.id}"
                        placeholder="Nombre de la categoría">
                    <button class="btn-delete-role" onclick="Config.deleteNomCategory('${cat.id}')" title="Eliminar categoría">🗑️</button>
                </div>
                <div class="role-card-body" style="gap:12px;">
                    <label class="config-label">Empieza con:</label>
                    <input type="text" class="keyword-input" value="${cond.startsWith || ''}"
                        placeholder="vacío = cualquiera"
                        id="nomenclature-startsWith-${cat.id}"
                        data-category-id="${cat.id}"
                        data-field="startsWith">
                    
                    <label class="config-label">Contiene:</label>
                    <input type="text" class="keyword-input" value="${cond.contains || ''}"
                        placeholder="vacío = cualquiera"
                        id="nomenclature-contains-${cat.id}"
                        data-category-id="${cat.id}"
                        data-field="contains">
                    
                    <label class="config-label">NO contiene:</label>
                    <input type="text" class="keyword-input" value="${cond.notContains || ''}"
                        placeholder="vacío = sin restricción"
                        id="nomenclature-notContains-${cat.id}"
                        data-category-id="${cat.id}"
                        data-field="notContains">
                    
                    <label class="config-label">Termina en:</label>
                    <input type="text" class="keyword-input" value="${cond.endsWith || ''}"
                        placeholder="por defecto: ."
                        id="nomenclature-endsWith-${cat.id}"
                        data-category-id="${cat.id}"
                        data-field="endsWith">
                    
                    <div style="margin-top: 12px;">
                        <button class="btn btn-success" onclick="Config.saveNomenclatureCategory('${cat.id}')" style="width: 100%;">
                            ✅ Guardar Categoría
                        </button>
                    </div>
                    
                    <div class="config-help-text" style="margin-top:8px;">
                        <small><strong>Cómo funciona:</strong> Un párrafo se detecta si cumple TODOS los campos no-vacíos. Ejemplo: si pones "quick effect" en "Contiene" y ":" en "Termina", solo detectará párrafos que contengan "quick effect" Y terminen en ":".</small>
                    </div>
                </div>
            </div>`;
    },

    // ===============================
    // ACCIONES - NOMENCLATURA
    // ===============================
    
    saveNomenclatureCategory: function (categoryId) {
        console.log('💾 [Config] Guardando categoría:', categoryId);
        
        // Obtener valores de los inputs
        const nameInput = document.getElementById(`nomenclature-name-${categoryId}`);
        const colorInput = document.getElementById(`nomenclature-color-${categoryId}`);
        const startsWithInput = document.getElementById(`nomenclature-startsWith-${categoryId}`);
        const containsInput = document.getElementById(`nomenclature-contains-${categoryId}`);
        const notContainsInput = document.getElementById(`nomenclature-notContains-${categoryId}`);
        const endsWithInput = document.getElementById(`nomenclature-endsWith-${categoryId}`);
        
        if (!nameInput || !colorInput) {
            console.error('❌ [Config] No se encontraron los inputs de la categoría');
            alert('Error: No se pudo guardar la categoría');
            return;
        }
        
        const updates = {
            name: nameInput.value.trim(),
            color: colorInput.value,
            conditions: {
                startsWith: startsWithInput ? startsWithInput.value.trim() : '',
                contains: containsInput ? containsInput.value.trim() : '',
                notContains: notContainsInput ? notContainsInput.value.trim() : '',
                endsWith: endsWithInput ? endsWithInput.value.trim() : ''
            }
        };
        
        console.log('📝 [Config] Datos a guardar:', updates);
        
        // Actualizar en ConfigManager
        if (ConfigManager.updateNomenclatureCategory(categoryId, updates)) {
            console.log('✅ [Config] Categoría guardada correctamente');
            
            // Feedback visual
            const card = document.getElementById(`nomenclature-card-${categoryId}`);
            if (card) {
                card.style.border = '2px solid #4CAF50';
                setTimeout(() => {
                    card.style.border = '';
                }, 1000);
            }
            
            // Mostrar mensaje de éxito
            this.showTemporaryMessage('✅ Categoría guardada correctamente', 'success');
        } else {
            console.error('❌ [Config] Error al guardar la categoría');
            alert('Error al guardar la categoría');
        }
    },

    addNomenclatureCategory: function () {
        if (ConfigManager.addNomenclatureCategory()) {
            this.render();
            const sec = document.getElementById('nomenclature-section');
            if (sec) sec.style.display = 'block';
        }
    },

    deleteNomCategory: function (categoryId) {
        if (!confirm('¿Eliminar esta categoría?')) return;
        if (ConfigManager.deleteNomenclatureCategory(categoryId)) {
            this.render();
        }
    },

    // Mostrar mensaje temporal
    showTemporaryMessage: function (message, type = 'success') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `config-message config-message-${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => msgDiv.remove(), 300);
        }, 2000);
    },
