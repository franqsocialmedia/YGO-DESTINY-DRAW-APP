/* ====================================
   CARD VIEWER MODULE - CON DEBUG
   Destiny Draw - Yu-Gi-Oh! App
   ==================================== */

const CardViewer = {
    quantities: {}, 

    open(card) {
        console.log('🔍 [CardViewer] Abriendo carta:', card.name, 'ID:', card.id);
        
        const quantity = this.quantities[card.id] || 0;
        console.log('📊 [CardViewer] Cantidad actual en quantities:', quantity);

        const images = card.card_images || [];
        const mainImg = images[0]?.image_url || '';

        const thumbsHtml = images.map(img => `
            <img src="${img.image_url_small}"
                 class="cv-thumb"
                 style="width:50px; cursor:pointer; margin:3px;">
        `).join('');

        const statsHtml = card.atk !== undefined ? `
            <p><b>Atributo:</b> ${card.attribute || '-'}</p>
            <p><b>Nivel:</b> ${card.level || '-'}</p>
            <p><b>ATK:</b> ${card.atk}</p>
            <p><b>DEF:</b> ${card.def}</p>
        ` : '';

        const ban = card.banlist_info || {};

        const highlightedDesc = this.highlightNomenclature(card.desc);

        const html = `
            <div id="cv-overlay"
                 style="position:fixed;top:0;left:0;width:100%;height:100%;
                        background:rgba(0,0,0,0.75);z-index:99998;">

                <div id="cv-modal"
                     style="position:absolute;top:50%;left:50%;
                            transform:translate(-50%,-50%);
                            background:#111;color:white;
                            padding:20px;border:2px solid yellow;
                            width:350px;max-height:90%;overflow:auto;">

                    <button id="cv-close"
                            style="float:right;background:red;color:white;border:none;cursor:pointer;">X</button>

                    <h2>${card.name}</h2>

                    <img id="cv-main-img"
                         src="${mainImg}"
                         style="width:100%;margin-bottom:10px;">

                    <div id="cv-thumbs">${thumbsHtml}</div>

                    <hr>

                    <p><b>Tipo:</b> ${card.type}</p>
                    ${statsHtml}

                    <div style="white-space:pre-wrap; line-height: 1.8;">${highlightedDesc}</div>

                    <hr>

                    <div>
                        <b>Cantidad en Deck:</b><br>
                        <button id="cv-minus">◀</button>
                        <span id="cv-count">${quantity}</span>
                        <button id="cv-plus">▶</button>
                    </div>

                    <hr>

                    <div>
                        <b>Limitaciones:</b><br>
                        TCG: ${ban.ban_tcg || 'Free'}<br>
                        OCG: ${ban.ban_ocg || 'Free'}<br>
                    </div>

                    <hr>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button id="cv-open-image" style="flex: 1; min-width: 120px;">Abrir Imagen</button>
                        <button id="cv-download-test" style="flex: 1; min-width: 120px; background: #4CAF50; color: white;">PRUEBA DECKLIST</button>
                    </div>

                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        const overlay = document.getElementById('cv-overlay');
        const close = document.getElementById('cv-close');

        close.onclick = () => overlay.remove();
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };

        const thumbs = document.querySelectorAll('.cv-thumb');
        const mainImage = document.getElementById('cv-main-img');

        thumbs.forEach((t, index) => {
            t.onclick = () => {
                mainImage.src = images[index].image_url;
            };
        });

        const plus = document.getElementById('cv-plus');
        const minus = document.getElementById('cv-minus');
        const count = document.getElementById('cv-count');

        plus.onclick = () => {
            console.log('➕ [CardViewer] Click en botón PLUS');
            
            // Verificar que Deck existe
            if (!window.Deck) {
                console.error('❌ [CardViewer] ERROR: window.Deck no existe');
                alert('ERROR: El módulo Deck no está cargado. Verifica que deck.js esté incluido en index.html');
                return;
            }
            
            // Verificar que Deck.syncFromViewer existe
            if (typeof Deck.syncFromViewer !== 'function') {
                console.error('❌ [CardViewer] ERROR: Deck.syncFromViewer no es una función');
                alert('ERROR: Deck.syncFromViewer no está implementado. Verifica deck.js');
                return;
            }
            
            // Incrementar cantidad
            this.quantities[card.id] = (this.quantities[card.id] || 0) + 1;
            const newQty = this.quantities[card.id];
            
            console.log('📈 [CardViewer] Nueva cantidad:', newQty);
            
            // Actualizar UI
            count.textContent = newQty;
            
            // Sincronizar con Deck
            console.log('🔄 [CardViewer] Llamando a Deck.syncFromViewer...');
            console.log('   ID:', card.id);
            console.log('   Card:', card.name);
            console.log('   Qty:', newQty);
            
            try {
                Deck.syncFromViewer(card.id, card, newQty);
                console.log('✅ [CardViewer] Deck.syncFromViewer ejecutado correctamente');
            } catch (error) {
                console.error('❌ [CardViewer] ERROR al ejecutar Deck.syncFromViewer:', error);
                alert('ERROR: ' + error.message);
            }
        };

        minus.onclick = () => {
            console.log('➖ [CardViewer] Click en botón MINUS');
            
            // Verificar que Deck existe
            if (!window.Deck) {
                console.error('❌ [CardViewer] ERROR: window.Deck no existe');
                alert('ERROR: El módulo Deck no está cargado');
                return;
            }
            
            // Verificar que Deck.syncFromViewer existe
            if (typeof Deck.syncFromViewer !== 'function') {
                console.error('❌ [CardViewer] ERROR: Deck.syncFromViewer no es una función');
                alert('ERROR: Deck.syncFromViewer no está implementado');
                return;
            }
            
            // Decrementar cantidad (mínimo 0)
            this.quantities[card.id] = Math.max(0, (this.quantities[card.id] || 0) - 1);
            const newQty = this.quantities[card.id];
            
            console.log('📉 [CardViewer] Nueva cantidad:', newQty);
            
            // Actualizar UI
            count.textContent = newQty;
            
            // Sincronizar con Deck
            console.log('🔄 [CardViewer] Llamando a Deck.syncFromViewer...');
            
            try {
                Deck.syncFromViewer(card.id, card, newQty);
                console.log('✅ [CardViewer] Deck.syncFromViewer ejecutado correctamente');
            } catch (error) {
                console.error('❌ [CardViewer] ERROR al ejecutar Deck.syncFromViewer:', error);
                alert('ERROR: ' + error.message);
            }
        };

        // Botón: Abrir Imagen en nueva pestaña
        const openImageBtn = document.getElementById('cv-open-image');
        openImageBtn.onclick = () => {
            const imgUrl = mainImage.src;
            window.open(imgUrl, '_blank');
        };

        // Botón: PRUEBA DECKLIST - Descarga automática
        const downloadTestBtn = document.getElementById('cv-download-test');
        downloadTestBtn.onclick = () => {
            this.downloadCardImage(mainImage.src, card.name);
        };
    },

    // Nueva función para descargar imagen evitando CORS
    downloadCardImage: async function(imageUrl, cardName) {
        try {
            console.log('📥 [CardViewer] Iniciando descarga de:', cardName);
            
            // Crear un elemento de imagen temporal
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Intenta evitar CORS
            
            // Esperar a que la imagen cargue
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });
            
            // Crear canvas del tamaño de la imagen
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            // Dibujar imagen en el canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Convertir canvas a blob
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('❌ [CardViewer] Error al crear blob');
                    alert('Error al procesar la imagen');
                    return;
                }
                
                // Crear URL temporal del blob
                const url = URL.createObjectURL(blob);
                
                // Crear enlace de descarga
                const a = document.createElement('a');
                a.href = url;
                a.download = cardName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
                document.body.appendChild(a);
                a.click();
                
                // Limpiar
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                
                console.log('✅ [CardViewer] Imagen descargada exitosamente');
            }, 'image/png');
            
        } catch (error) {
            console.error('❌ [CardViewer] Error al descargar imagen:', error);
            
            // Fallback: intentar descarga directa
            console.log('🔄 [CardViewer] Intentando descarga directa...');
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = cardName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    },

    highlightNomenclature: function(desc) {
        if (!desc || !window.ConfigManager) return desc;

        const nomenclature = ConfigManager.getNomenclature();
        
        // Verificar si tiene la estructura NUEVA (categories)
        if (nomenclature && nomenclature.categories) {
            const paragraphs = this.splitIntoParagraphs(desc);
            const highlightedParagraphs = paragraphs.map(para => {
                return this.highlightParagraphNew(para.text, nomenclature.categories);
            });
            return highlightedParagraphs.join('');
        } 
        // Verificar si tiene estructura OLD (effectSpeed, cost, etc.)
        else if (nomenclature && nomenclature.effectSpeed) {
            const colors = ConfigManager.getNomenclatureColors();
            const paragraphs = this.splitIntoParagraphs(desc);
            const highlightedParagraphs = paragraphs.map(para => {
                return this.highlightParagraphOld(para.text, nomenclature, colors);
            });
            return highlightedParagraphs.join('');
        }
        
        return desc;
    },

    splitIntoParagraphs: function(text) {
        const paragraphs = [];
        let currentStart = 0;
        
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '.' || text[i] === ':' || text[i] === ';') {
                paragraphs.push({
                    text: text.substring(currentStart, i + 1),
                    start: currentStart,
                    end: i + 1
                });
                currentStart = i + 1;
            }
        }

        if (currentStart < text.length) {
            paragraphs.push({
                text: text.substring(currentStart),
                start: currentStart,
                end: text.length
            });
        }

        return paragraphs;
    },

    highlightParagraphNew: function(paragraph, categories) {
        if (!categories || categories.length === 0) return paragraph;

        const paraLower = paragraph.toLowerCase().trim();
        
        for (const category of categories) {
            if (!category.conditions) continue;

            const cond = category.conditions;
            let matches = true;

            if (cond.startsWith && cond.startsWith.trim() !== '') {
                if (!paraLower.startsWith(cond.startsWith.toLowerCase().trim())) {
                    matches = false;
                }
            }

            if (matches && cond.contains && cond.contains.trim() !== '') {
                if (!paraLower.includes(cond.contains.toLowerCase().trim())) {
                    matches = false;
                }
            }

            if (matches && cond.notContains && cond.notContains.trim() !== '') {
                if (paraLower.includes(cond.notContains.toLowerCase().trim())) {
                    matches = false;
                }
            }

            if (matches && cond.endsWith && cond.endsWith.trim() !== '') {
                if (!paraLower.endsWith(cond.endsWith.toLowerCase().trim())) {
                    matches = false;
                }
            }

            if (matches) {
                const color = category.color || '#FFFFFF';
                const categoryName = category.name || category.id;
                return `<mark style="background-color: ${color}; padding: 2px 4px; border-radius: 3px; cursor: help; opacity: 0.6;" title="${categoryName}">${paragraph}</mark>`;
            }
        }

        return paragraph;
    },

    highlightParagraphOld: function(paragraph, nomenclature, colors) {
        const categoryNames = {
            effectSpeed: 'Velocidad de Efecto',
            effectType: 'Tipo de Efecto',
            timing: 'Timing del Efecto',
            requirements: 'Requisitos',
            conditions: 'Condicion de Activacion',
            cost: 'Costo de Activacion',
            effects: 'Efecto',
            duration: 'Duracion del Efecto',
            restrictions: 'Restriccion'
        };

        let matchedCategory = null;

        const checkMatch = (category, keywords, isObject = false) => {
            if (isObject) {
                for (const [name, kwList] of Object.entries(keywords)) {
                    for (const kw of kwList) {
                        if (paragraph.toLowerCase().includes(kw.toLowerCase())) {
                            matchedCategory = category;
                            return true;
                        }
                    }
                }
            } else {
                for (const kw of keywords) {
                    if (paragraph.toLowerCase().includes(kw.toLowerCase())) {
                        matchedCategory = category;
                        return true;
                    }
                }
            }
            return false;
        };

        checkMatch('effectSpeed', nomenclature.effectSpeed, true) ||
        checkMatch('effectType', nomenclature.effectType, true) ||
        checkMatch('timing', nomenclature.timing, true) ||
        checkMatch('requirements', nomenclature.requirements, false) ||
        checkMatch('conditions', nomenclature.conditions, false) ||
        checkMatch('cost', nomenclature.cost, false) ||
        checkMatch('effects', nomenclature.effects, true) ||
        checkMatch('duration', nomenclature.duration, true) ||
        checkMatch('restrictions', nomenclature.restrictions, true);

        if (matchedCategory) {
            const color = colors[matchedCategory] || '#FFFFFF';
            const categoryName = categoryNames[matchedCategory] || matchedCategory;
            return `<mark style="background-color: ${color}; opacity: 0.6; padding: 2px 4px; border-radius: 3px; cursor: help;" title="${categoryName}">${paragraph}</mark>`;
        }

        return paragraph;
    },

    openFromDeck: function(id) {
        if (!window.Deck) return;

        const item = Deck.cards[id];
        if (!item) return;

        this.open(item.data);
    },

    openFromIndex(index) {
        const card = window.Buscador.currentCards[index];
        if (!card) return;
        this.open(card);
    }
};

window.CardViewer = CardViewer;