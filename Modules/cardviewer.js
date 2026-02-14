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

                   ${this.renderCardContribution(card)}

                    <hr>

                    <div>
                        <b>Limitaciones:</b><br>
                        TCG: ${ban.ban_tcg || 'Free'}<br>
                        OCG: ${ban.ban_ocg || 'Free'}<br>
                    </div>

                    <hr>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button id="cv-open-image" style="flex: 1; min-width: 120px;">Ver Imagen HD</button>
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

        // Botón: Ver Imagen HD en nueva pestaña
        const openImageBtn = document.getElementById('cv-open-image');
        openImageBtn.onclick = () => {
            const imgUrl = mainImage.src;
            window.open(imgUrl, '_blank');
        };

        // Botón: PRUEBA DECKLIST - Generar imagen con html2canvas
        const downloadTestBtn = document.getElementById('cv-download-test');
        downloadTestBtn.onclick = () => {
            this.generateCardDecklistHTML2Canvas(card);
        };
    },

    // Método 1: html2canvas (recomendado - igual que downloadDecklist)
    generateCardDecklistHTML2Canvas: async function(card) {
        try {
            // Verificar si html2canvas está disponible
            if (typeof html2canvas === 'undefined') {
                alert('⚠️ html2canvas no está cargado.\n\nVerifica que esté en index.html');
                return;
            }

            console.log('📸 [CardViewer] Generando decklist con html2canvas');

            // Obtener URL de imagen
            const imgUrl = card.card_images[0].image_url || card.card_images[0].image_url_small;

            // Crear HTML temporal
            const html = `
                <div style="font-family: Arial, sans-serif; background: white; padding: 30px; text-align: center; display: inline-block;">
                    <img src="${imgUrl}" 
                         style="max-width: 400px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"
                         crossorigin="anonymous">
                    <div style="margin-top: 20px; font-size: 24px; font-weight: bold; color: #333;">
                        ${card.name}
                    </div>
                </div>
            `;

            // Crear contenedor temporal
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            tempContainer.style.cssText = 'position:absolute;left:-9999px;top:0;';
            document.body.appendChild(tempContainer);

            // Esperar a que la imagen cargue
            await new Promise(resolve => setTimeout(resolve, 500));

            // Generar canvas con html2canvas
            const canvas = await html2canvas(tempContainer.firstElementChild, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            // Descargar
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_card.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Limpiar
                document.body.removeChild(tempContainer);
                console.log('✅ [CardViewer] Descarga completada');
            });

        } catch (error) {
            console.error('❌ [CardViewer] Error:', error);
            alert('Error al generar la imagen. Intenta con "Ver Imagen HD"');
        }
    },

    // Método 2: Canvas manual sin CORS (alternativa)
    generateCardDecklistCanvas: async function(card) {
        try {
            console.log('📸 [CardViewer] Método Canvas manual');
            
            const imgUrl = card.card_images[0].image_url;
            
            // Cargar imagen sin CORS
            const img = new Image();
            img.src = imgUrl; // SIN crossOrigin
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            
            const padding = 40;
            const nameHeight = 80;
            const canvas = document.createElement('canvas');
            canvas.width = img.width + (padding * 2);
            canvas.height = img.height + nameHeight + (padding * 2);
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, padding, padding);
            
            ctx.fillStyle = '#333';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(card.name, canvas.width / 2, padding + img.height + 40);
            
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = card.name.replace(/[^a-z0-9]/gi, '_') + '_card.png';
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (error) {
            console.error('❌ Error:', error);
            this.generateCardDecklistFallback(card);
        }
    },

    // Método 3: Fallback - descarga directa
    generateCardDecklistFallback: function(card) {
        const imgUrl = card.card_images[0].image_url;
        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = card.name.replace(/[^a-z0-9]/gi, '_') + '.jpg';
        a.target = '_blank';
        a.click();
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

            if (matches) {
                const containsArr = Array.isArray(cond.contains)
                    ? cond.contains.filter(c => c.trim())
                    : (cond.contains && cond.contains.trim() ? [cond.contains.trim()] : []);
                if (containsArr.length > 0 && !containsArr.some(kw => paraLower.includes(kw.toLowerCase()))) {
                    matches = false;
                }
            }

            if (matches) {
                const notContainsArr = Array.isArray(cond.notContains)
                    ? cond.notContains.filter(c => c.trim())
                    : (cond.notContains && cond.notContains.trim() ? [cond.notContains.trim()] : []);
                if (notContainsArr.length > 0 && notContainsArr.some(kw => paraLower.includes(kw.toLowerCase()))) {
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
    },// ===============================
// DETECCIÓN DE POSIBLES ROLES
// Escanea el texto de la carta contra las keywords y condicionales
// de cada rol definido en Config. Sin Config, devuelve array vacío.
// ===============================
detectPossibleRoles: function (card) {
    if (!window.ConfigManager) return [];
    const desc   = (card.desc || '').toLowerCase();
    const type   = (card.type || '').toLowerCase();
    const roles  = ConfigManager.getRoleNames();
    const found  = [];

    roles.forEach(roleName => {
        const cond     = ConfigManager.getRoleCondition(roleName);
        if (!cond) return;
        const keywords     = cond.keywords     || [];
        const conditionals = cond.conditionals || [];

        const kwMatch = keywords.length > 0 &&
            keywords.some(kw => desc.includes(kw.toLowerCase()));

        if (!kwMatch) return;

        // Si hay condicionales, al menos una debe cumplirse también
        if (conditionals.length > 0) {
            const condMatch = conditionals.some(c => desc.includes(c.toLowerCase()));
            if (!condMatch) return;
        }

        found.push(roleName);
    });

    return found;
},// ===============================
// APORTE DE LA CARTA AL DECK ACTIVO
// Calcula qué cambio habría en cada pilar del Internal Score
// si esta carta fuera añadida al deck con los roles detectados.
// ===============================
calculateCardContribution: function (card, detectedRoles) {
    if (!window.Deck || !window.Stats) return null;
    if (Object.keys(Deck.cards).length === 0) return null;

    const cardId = String(card.id);

    // Score actual del deck
    const before = Stats.calculateInternalScore(Deck.cards);

    // Simular deck con la carta añadida (qty 1, main deck)
    const simCards = { ...Deck.cards };
    if (simCards[cardId]) {
        // Ya está en el deck — simular con una copia más
        simCards[cardId] = {
            ...simCards[cardId],
            qty: simCards[cardId].qty + 1
        };
    } else {
        simCards[cardId] = {
            data:     card,
            qty:      1,
            location: 'main',
            roles:    detectedRoles
        };
    }

    const after = Stats.calculateInternalScore(simCards);

    const delta = (a, b) => parseFloat((parseFloat(a) - parseFloat(b)).toFixed(2));

    return {
        consistency: {
            before: parseFloat(before.consistency),
            after:  parseFloat(after.consistency),
            delta:  delta(after.consistency, before.consistency)
        },
        power: {
            before: parseFloat(before.power),
            after:  parseFloat(after.power),
            delta:  delta(after.power, before.power)
        },
        resilience: {
            before: parseFloat(before.resilience),
            after:  parseFloat(after.resilience),
            delta:  delta(after.resilience, before.resilience)
        },
        internalScore: {
            before: parseFloat(before.internalScore),
            after:  parseFloat(after.internalScore),
            delta:  delta(after.internalScore, before.internalScore)
        }
    };
},// ===============================
// RENDER DEL BLOQUE DE APORTE
// ===============================
renderCardContribution: function (card) {
    const hasDeck = window.Deck && Object.keys(Deck.cards || {}).length > 0;
    if (!hasDeck) return '';

    const detectedRoles  = this.detectPossibleRoles(card);
    const contribution   = this.calculateCardContribution(card, detectedRoles);

    // ── Posibles Roles ────────────────────────────────────────
    const rolesHTML = detectedRoles.length > 0
        ? detectedRoles.map(r =>
            `<span class="cv-role-chip">${r} | </span>`).join('')
        : `<span class="cv-role-none">No se detectaron roles con la configuración actual</span>`;

    // ── Barras de aporte ──────────────────────────────────────
    let contribHTML = '';
    if (contribution) {
        const row = (label, data, color) => {
            const sign  = data.delta > 0 ? '+' : '';
            const dColor = data.delta > 0 ? '#00b894'
                         : data.delta < 0 ? '#d63031' : '#636e72';
            const pct   = Math.min(100, (data.after / 10) * 100);
            return `
                <div class="cv-contrib-row">
                    <span class="cv-contrib-label">${label}</span>
                    <div class="cv-contrib-bar-track">
                        <div class="cv-contrib-bar"
                             style="width:${pct}%;background:${color};"></div>
                    </div>
                    <span class="cv-contrib-val">${data.after.toFixed(1)}</span>
                    <span class="cv-contrib-delta" style="color:${dColor}">
                        ${data.delta !== 0 ? sign + data.delta : '—'}
                    </span>
                </div>`;
        };

        const totalSign  = contribution.internalScore.delta > 0 ? '+' : '';
        const totalColor = contribution.internalScore.delta > 0 ? '#00b894'
                         : contribution.internalScore.delta < 0 ? '#d63031' : '#636e72';

        contribHTML = `
            <div class="cv-contrib-grid">
                ${row('Consistencia:', contribution.consistency,  '#00b894')}
                ${row('Potencia:',     contribution.power,        '#d63031')}
                ${row('Resiliencia:',  contribution.resilience,   '#0066cc')}
            </div>
            <div class="cv-contrib-total">
                Internal Score: <strong>${contribution.internalScore.after.toFixed(2)}</strong>
                <span style="color:${totalColor};margin-left:6px;">
                    (${totalSign}${contribution.internalScore.delta})
                </span>
            </div>`;
    } else {
        contribHTML = `<p class="cv-contrib-empty">Agrega roles a las cartas del deck para ver el impacto.</p>`;
    }

    return `
        <hr>
        <div class="cv-contribution-block">
            <div class="cv-contrib-section-title">🎯 Posibles Roles</div>
            <div class="cv-roles-row">${rolesHTML}</div>

            <div class="cv-contrib-section-title" style="margin-top:10px;">
                📊 Aporte al deck activo
                <span class="cv-deck-name">${Deck.name}</span>
            </div>
            ${contribHTML}
        </div>`;
}
    
};

window.CardViewer = CardViewer;