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

        const thumbsHtml = images.map(img =>
            `<img src="${img.image_url_small}" class="cv-thumb">`
        ).join('');

        const statsHtml = card.atk !== undefined ? `
            <p><b>Atributo:</b> ${card.attribute || '-'}</p>
            <p><b>Nivel:</b> ${card.level || '-'}</p>
            <p><b>ATK:</b> ${card.atk}</p>
            <p><b>DEF:</b> ${card.def}</p>
        ` : '';

        const ban = card.banlist_info || {};

        const showNomenclature = !window.ContentManager || ContentManager.isVisible('cv-nomenclature');
        const highlightedDesc  = showNomenclature
            ? this.highlightNomenclature(card.desc)
            : (card.desc || '');

const html = `
    <div id="cv-overlay" class="cv-overlay">
        <div id="cv-modal" class="cv-modal">

            <button id="cv-close" class="cv-close-btn">✕</button>

            <div class="cv-name">${card.name}</div>

            <img id="cv-main-img" src="${mainImg}" class="cv-main-img">
            <div id="cv-thumbs" class="cv-thumbs">${thumbsHtml}</div>
            <div id="cv-ban-btns" class="cv-ban-area"></div>

            <hr class="cv-hr">

            <div class="cv-stats-block">
                <p><b>Tipo:</b> ${card.type}</p>
                ${statsHtml}
            </div>

            <div class="cv-desc-block">${highlightedDesc}</div>

            <hr class="cv-hr">

            <div class="cv-qty-block">
                <span class="cv-qty-label">Cantidad en Deck:</span>
                <div class="cv-qty-controls">
                    <button id="cv-minus" class="cv-qty-btn">◀</button>
                    <span id="cv-count" class="cv-qty-count">${quantity}</span>
                    <button id="cv-plus" class="cv-qty-btn">▶</button>
                </div>
            </div>

            ${!window.ContentManager || ContentManager.isVisible('cv-contribution')
                ? this.renderCardContribution(card) : ''}

            <hr class="cv-hr">

            <div class="cv-sets-block">
                <span class="cv-sets-label">📦 Pack / Set</span>
                <div id="cv-sets-list" class="cv-sets-list">Cargando...</div>
                <span class="cv-card-id">ID: ${card.id}</span>
            </div>

            <hr class="cv-hr">

            <div class="cv-action-row">
                <button id="cv-open-image" class="cv-action-btn">🖼 Ver HD</button>
                <button id="cv-staple-btn" class="cv-action-btn"></button>
                <button id="cv-fav-btn" class="cv-action-btn"></button>
            </div>

        </div>
    </div>
`;

        document.body.insertAdjacentHTML('beforeend', html);

        // Cargar sets de aparición
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${card.id}&misc=yes`)
            .then(r => r.json())
            .then(data => {
                const sets = data?.data?.[0]?.card_sets;
                const el   = document.getElementById('cv-sets-list');
                if (!el) return;
                if (!sets?.length) { el.textContent = 'No disponible'; return; }
                const unique = [...new Map(sets.map(s => [s.set_name, s])).values()];
                el.innerHTML = unique.map(s => {
                    const year = s.set_release_date ? s.set_release_date.substring(0,4) : '';
                    return `<span onclick="CardViewer.openSetInBuscador('${s.set_name.replace(/'/g,"\\'")}'); return false;" style="display:inline-block;background:rgba(0,51,102,0.5);border:1px solid rgba(255,215,0,0.2);border-radius:4px;padding:2px 7px;margin:2px 3px 2px 0;font-size:0.75rem;cursor:pointer;transition:border-color 0.15s;" onmouseover="this.style.borderColor='rgba(255,215,0,0.6)'" onmouseout="this.style.borderColor='rgba(255,215,0,0.2)'">${s.set_name}${year ? ` (${year})` : ''}</span>`;
                }).join('');
            })
            .catch(() => {
                const el = document.getElementById('cv-sets-list');
                if (el) el.textContent = 'No disponible';
            });

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

        // Botón: Volver Staple
        const stapleBtn = document.getElementById('cv-staple-btn');
        if (window.ContentManager && !ContentManager.isVisible('cv-staple-btn')) {
    stapleBtn.style.display = 'none';
}
        const isStaple  = () => window.ConfigManager?.isStaple?.(card.id);
        const updateStapleBtn = () => {
            stapleBtn.textContent      = isStaple() ? '⭐ Es Staple' : '☆ Volver Staple';
            stapleBtn.style.background = isStaple() ? '#FFD700' : '#4a4a4a';
            stapleBtn.style.color      = isStaple() ? '#000'    : '#fff';
        };
        updateStapleBtn();
        stapleBtn.onclick = () => {
            if (!window.ConfigManager) return;
            if (isStaple()) {
                ConfigManager.deleteStaple(card.id);
            } else {
                ConfigManager.createStaple(card.id, {
                    name:     card.name,
                    type:     card.type,
                    imageUrl: card.card_images?.[0]?.image_url_small || ''
                });
            }
            updateStapleBtn();
            
        };
            // Actualizar panel de staples en buscador
            ConfigManager.renderStaplesPanel();


        // Botón: Marcar / desmarcar Favorita
        const favBtn    = document.getElementById('cv-fav-btn');
        const isFav     = () => window.Favoritas?.has(card.id);
        const updateFav = () => {
            favBtn.textContent      = isFav() ? '★ Favorita' : '☆ Favorita';
            favBtn.style.background = isFav() ? '#FFD700' : '';
            favBtn.style.color      = isFav() ? '#000'    : '';
        };
        updateFav();
        favBtn.onclick = () => {
            if (window.Favoritas) {
                Favoritas.toggle(card);
                updateFav();
            }
        };
        // ── Botones de Banlist ──────────────────────────────────────
// ── Botones de Banlist / Genesys ────────────────────────────
const banContainer = document.getElementById('cv-ban-btns');
if (banContainer && window.Banlist) {
    const data          = Banlist.getData();
    const genesysActive = data.activeFormats.some(f => data.formats[f]?.isGenesys);

    if (genesysActive) {
        // ── Modo Genesys: contador de puntos ────────────────
        const genFmtName = Banlist.getGenesysFormatName();

        const renderGPts = () => {
            const pts = Banlist.getCardPoints(card.id);
            banContainer.innerHTML = `
                <div style="font-size:0.7rem;color:rgba(255,255,255,0.35);width:100%;margin-bottom:5px;">
                    ⚙ Genesys — Puntos de costo
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <button onclick="(()=>{const i=document.getElementById('cv-gpts');i.value=Math.max(0,(parseInt(i.value)||0)-1);})()"
                            style="width:30px;height:30px;background:rgba(255,255,255,0.1);
                                   border:1px solid rgba(255,255,255,0.2);color:#fff;
                                   border-radius:5px;cursor:pointer;font-size:1.1rem;line-height:1;">−</button>
                    <input id="cv-gpts" type="number" min="0" value="${pts}"
                           style="width:64px;text-align:center;background:rgba(255,255,255,0.08);
                                  border:1px solid rgba(255,255,255,0.2);color:#fff;
                                  border-radius:5px;padding:5px;font-size:0.95rem;">
                    <button onclick="(()=>{const i=document.getElementById('cv-gpts');i.value=(parseInt(i.value)||0)+1;})()"
                            style="width:30px;height:30px;background:rgba(255,255,255,0.1);
                                   border:1px solid rgba(255,255,255,0.2);color:#fff;
                                   border-radius:5px;cursor:pointer;font-size:1.1rem;line-height:1;">＋</button>
                    <button onclick="window._cvSaveGPts()"
                            style="padding:5px 14px;background:#0066cc;border:none;
                                   color:#fff;border-radius:5px;cursor:pointer;font-size:0.82rem;">
                        Guardar
                    </button>
                    <span id="cv-gpts-saved" style="font-size:0.72rem;color:#00b894;display:none;">✓ Guardado</span>
                </div>`;
        };

        window._cvSaveGPts = () => {
            const inp = document.getElementById('cv-gpts');
            if (!inp) return;
            const pts = Math.max(0, parseInt(inp.value) || 0);
            Banlist.setCardPoints(genFmtName, card.id,
                { name: card.name, img: card.card_images?.[0]?.image_url_small || '' }, pts);
            const listEl  = document.getElementById(`banlist-cards-${genFmtName}`);
            if (listEl) listEl.innerHTML = Banlist.renderFormatList(genFmtName);
            const countEl = document.getElementById(`ban-count-${genFmtName}`);
            if (countEl) {
                const d = Banlist.getData();
                countEl.textContent = Object.keys(d.formats[genFmtName]?.cards || {}).length + ' cartas';
            }
            const saved = document.getElementById('cv-gpts-saved');
            if (saved) { saved.style.display = 'inline'; setTimeout(() => { saved.style.display = 'none'; }, 1800); }
        };

        renderGPts();

    } else {
        // ── Modo normal: botones de ban status ──────────────
        const BAN_BTNS = [
            { label: 'Free',       status: 'free',         activeColor: '#dfe6e9', activeText: '#000' },
            { label: 'Semi-Limit', status: 'semi-limited', activeColor: '#fdcb6e', activeText: '#000' },
            { label: 'Limit',      status: 'limited',      activeColor: '#e17055', activeText: '#fff' },
            { label: 'Ban',        status: 'forbidden',    activeColor: '#d63031', activeText: '#fff' },
        ];

        const activeFormats  = Banlist.getActiveFormats();
        const writeFormat    = activeFormats[0] || 'TCG';

        const renderBanBtns = () => {
            const current = Banlist.getEffectiveBanStatus(card.id);
            banContainer.innerHTML = `
                <div style="font-size:0.7rem;color:rgba(255,255,255,0.35);width:100%;margin-bottom:3px;">
                    Banlist: ${writeFormat}
                </div>
                ${BAN_BTNS.map(b => {
                    const isActive = b.status === current;
                    const bg    = isActive ? b.activeColor : 'rgba(255,255,255,0.08)';
                    const color = isActive ? b.activeText  : '#aaa';
                    const border = isActive ? b.activeColor : 'rgba(255,255,255,0.2)';
                    return `<button
                        class="cv-ban-btn"
                        data-status="${b.status}"
                        style="background:${bg};color:${color};border:1px solid ${border};
                               padding:4px 10px;border-radius:5px;cursor:pointer;font-size:0.78rem;">
                        ${b.label}
                    </button>`;
                }).join('')}`;

            banContainer.querySelectorAll('.cv-ban-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const status = btn.dataset.status;
                    const meta   = { name: card.name, img: card.card_images?.[0]?.image_url_small || '' };
                    Banlist.setCardStatus(writeFormat, card.id, meta, status);
                    const listEl  = document.getElementById(`banlist-cards-${writeFormat}`);
                    if (listEl) listEl.innerHTML = Banlist.renderFormatList(writeFormat);
                    const countEl = document.getElementById(`ban-count-${writeFormat}`);
                    if (countEl) {
                        const d = Banlist.getData();
                        countEl.textContent = Object.keys(d.formats[writeFormat]?.cards || {}).length + ' cartas';
                    }
                    renderBanBtns();
                });
            });
        };

        renderBanBtns();
    }
}
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
        const ch = text[i];

        // Corte duro en newline — cada línea es su propio segmento
        if (ch === '\n') {
            if (i > currentStart) {
                paragraphs.push({
                    text:  text.substring(currentStart, i),
                    start: currentStart,
                    end:   i
                });
            }
            // Añadir el \n como segmento propio para preservar el pre-wrap visual
            paragraphs.push({ text: '\n', start: i, end: i + 1 });
            currentStart = i + 1;
            continue;
        }

        // Corte en delimitadores de oración
        if (ch === '.' || ch === ':' || ch === ';') {
            paragraphs.push({
                text:  text.substring(currentStart, i + 1),
                start: currentStart,
                end:   i + 1
            });
            currentStart = i + 1;
        }
    }

    // Resto final sin delimitador
    if (currentStart < text.length) {
        paragraphs.push({
            text:  text.substring(currentStart),
            start: currentStart,
            end:   text.length
        });
    }

    return paragraphs;
},

    highlightParagraphNew: function(paragraph, categories) {
    if (!paragraph || paragraph.trim() === '') return paragraph;
    if (!categories || categories.length === 0) return paragraph;

    const paraLower = paragraph.toLowerCase().trim();
    const toArr = (v) => Array.isArray(v) ? v.filter(s => s && s.trim())
                       : (v && String(v).trim() ? [String(v).trim()] : []);

    for (const category of categories) {
        if (!category.conditions) continue;
        const cond = category.conditions;
        let matches = true;

        const swArr = toArr(cond.startsWith);
        if (swArr.length > 0 && !swArr.some(sw => paraLower.startsWith(sw.toLowerCase()))) {
            matches = false;
        }

        if (matches) {
            const cArr = toArr(cond.contains);
            if (cArr.length > 0 && !cArr.some(kw => paraLower.includes(kw.toLowerCase()))) {
                matches = false;
            }
        }

        if (matches) {
            const ncArr = toArr(cond.notContains);
            if (ncArr.length > 0 && ncArr.some(kw => paraLower.includes(kw.toLowerCase()))) {
                matches = false;
            }
        }

        if (matches) {
            const ewArr = toArr(cond.endsWith);
            if (ewArr.length > 0) {
                // Strip trailing quotes/decorative chars before checking
                const stripped = paraLower.replace(/["""''\u2018\u2019\u201C\u201D\s]+$/, '');
                if (!ewArr.some(ew => stripped.endsWith(ew.toLowerCase()))) {
                    matches = false;
                }
            }
        }

        if (matches) {
            const color = category.color || '#FFFFFF';
            const categoryName = category.name || category.id;
            return `<mark style="background-color:${color};padding:2px 4px;border-radius:3px;cursor:help;opacity:0.6;" title="${categoryName}">${paragraph}</mark>`;
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
    },

// ===============================
// DETECCIÓN DE POSIBLES ROLES
// Escanea el texto de la carta contra las keywords y condicionales
// de cada rol definido en Config. Sin Config, devuelve array vacío.
// ===============================
detectPossibleRoles: function(card) {
    if (!window.ConfigManager) return [];
    const desc  = (card.desc || '').toLowerCase();
    const roles = ConfigManager.getRoleNames();
    const found = [];

    roles.forEach(roleName => {
        const cond = ConfigManager.getRoleCondition(roleName);
        if (!cond) return;
        const keywords     = cond.keywords     || [];
        const conditionals = cond.conditionals || [];

        // Multi-nomenclature filter
        const nomCatIds = window.ConfigManager?.getRoleNomenclatureCategories?.(roleName) || [];
        let searchText = desc;
        if (nomCatIds.length > 0 && window.NomenclatureAnalyzer) {
            const segments = NomenclatureAnalyzer.analyzeCard(card) || [];
            const filtered = segments
                .filter(s => nomCatIds.includes(s.category))
                .map(s => s.text.toLowerCase())
                .join(' ');
            searchText = filtered || '';
        }

        const kwMatch = keywords.length > 0 &&
            keywords.some(kw => searchText.includes(kw.toLowerCase()));
        if (!kwMatch) return;

        if (conditionals.length > 0) {
            const condMatch = conditionals.some(c => searchText.includes(c.toLowerCase()));
            if (!condMatch) return;
        }
        found.push(roleName);
    });

    return found;
},

// ===============================
// APORTE DE LA CARTA AL DECK ACTIVO
// ===============================
calculateCardContribution: function (card, detectedRoles) {
    if (!window.Deck || !window.Stats) return null;
    if (Object.keys(Deck.cards).length === 0) return null;

    const cardId = String(card.id);

    const before = Stats.calculateInternalScore(Deck.cards);

    const simCards = { ...Deck.cards };
    if (simCards[cardId]) {
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
},

// ===============================
// RENDER DEL BLOQUE DE APORTE
// ===============================
renderCardContribution: function (card) {
    const hasDeck = window.Deck && Object.keys(Deck.cards || {}).length > 0;
    if (!hasDeck) return '';

    const detectedRoles  = this.detectPossibleRoles(card);
    const contribution   = this.calculateCardContribution(card, detectedRoles);

    const rolesHTML = detectedRoles.length > 0
        ? detectedRoles.map(r =>
            `<span class="cv-role-chip">${r} | </span>`).join('')
        : `<span class="cv-role-none">No se detectaron roles con la configuración actual</span>`;

    let contribHTML = '';
    if (contribution) {
        const row = (label, data, color) => {
            const sign  = data.delta > 0 ? '+' : '';
            const dColor = data.delta > 0 ? '#00b894'
                         : data.delta < 0 ? '#d63031' : '#636e72';
            const pct   = Math.min(100, (data.after / 20) * 100);
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
},

// ── Mini buscador para agregar cartas a banlist / Genesys ────────
openCardSearch: function (formatName, prefillName, mode) {
    // mode: 'points' para Genesys; auto-detecta si el formato es isGenesys
    const isPointsMode = mode === 'points' ||
        !!(window.Banlist?.getData?.()?.formats?.[formatName]?.isGenesys);

    if (document.getElementById('cv-search-overlay')) return;

    const STATUS_OPTS = [
        { val: 'forbidden',    label: 'Ban',        color: '#d63031' },
        { val: 'limited',      label: 'Limitada',   color: '#e17055' },
        { val: 'semi-limited', label: 'Semi-Limit', color: '#fdcb6e' },
    ];

    const overlay = document.createElement('div');
    overlay.id = 'cv-search-overlay';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.82);
        z-index:99999;display:flex;align-items:center;justify-content:center;`;

    overlay.innerHTML = `
        <div style="background:#111;border:1px solid rgba(255,255,255,0.15);
                    border-radius:12px;padding:20px;width:340px;max-height:85vh;
                    overflow:auto;position:relative;">
            <button onclick="document.getElementById('cv-search-overlay').remove()"
                    style="position:absolute;top:10px;right:10px;background:none;
                           border:none;color:#fff;font-size:1.2rem;cursor:pointer;">✕</button>
            <h4 style="margin:0 0 12px;color:#FFD700;">
                ${isPointsMode ? '⚙ Genesys — ' : ''}Agregar carta a ${formatName}
            </h4>
            <div style="display:flex;gap:6px;margin-bottom:10px;">
                <input id="cvs-input" type="text" placeholder="Nombre de carta..."
                       style="flex:1;padding:6px 10px;background:rgba(255,255,255,0.08);
                              border:1px solid rgba(255,255,255,0.2);border-radius:6px;
                              color:#fff;font-size:0.9rem;"
                       autocomplete="off">
                <button id="cvs-btn"
                        style="padding:6px 12px;background:#0066cc;border:none;
                               border-radius:6px;color:#fff;cursor:pointer;">🔍</button>
            </div>
            <div id="cvs-status-row"
                 style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">
                ${isPointsMode
                    ? `<span style="font-size:0.78rem;color:rgba(255,255,255,0.4);">Puntos:</span>
                       <button id="cvs-pts-minus"
                               style="width:26px;height:26px;background:rgba(255,255,255,0.08);
                                      border:1px solid rgba(255,255,255,0.2);color:#fff;
                                      border-radius:5px;cursor:pointer;">−</button>
                       <input id="cvs-pts-input" type="number" min="0" value="1"
                              style="width:56px;text-align:center;background:rgba(255,255,255,0.08);
                                     border:1px solid rgba(255,255,255,0.2);color:#fff;
                                     border-radius:5px;padding:3px;font-size:0.9rem;">
                       <button id="cvs-pts-plus"
                               style="width:26px;height:26px;background:rgba(255,255,255,0.08);
                                      border:1px solid rgba(255,255,255,0.2);color:#fff;
                                      border-radius:5px;cursor:pointer;">＋</button>`
                    : STATUS_OPTS.map(s => `
                        <button class="cvs-status-btn"
                                data-status="${s.val}"
                                data-activecolor="${s.color}"
                                style="padding:3px 10px;border-radius:14px;
                                       border:1px solid rgba(255,255,255,0.25);
                                       background:rgba(0,0,0,0);color:#ccc;
                                       cursor:pointer;font-size:0.78rem;">
                            ${s.label}
                        </button>`).join('')}
            </div>
            <i style="font-size:0.78rem;color:rgba(255,255,255,0.35);">
                ${isPointsMode
                    ? 'Ajusta los puntos y haz clic en la carta.'
                    : 'Selecciona una restricción y haz clic en la carta.'}
            </i>
            <div id="cvs-results"
                 style="display:flex;flex-direction:column;gap:6px;
                        max-height:50vh;overflow:auto;margin-top:8px;"></div>
        </div>`;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    // ── Status chips (modo normal) ────────────────────────────────
    let selectedStatus = 'forbidden';
    if (!isPointsMode) {
        const statusBtns = overlay.querySelectorAll('.cvs-status-btn');
        const updateStatusUI = () => {
            statusBtns.forEach(btn => {
                const active      = btn.dataset.status === selectedStatus;
                const activeColor = btn.dataset.activecolor || '#fff';
                btn.style.color       = active ? activeColor : '#ccc';
                btn.style.borderColor = active ? activeColor : 'rgba(255,255,255,0.25)';
                btn.style.background  = active ? `${activeColor}22` : 'rgba(0,0,0,0)';
                btn.style.fontWeight  = active ? '700' : '400';
            });
        };
        statusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedStatus = btn.dataset.status;
                updateStatusUI();
            });
        });
        updateStatusUI();
    }

    // ── Contador de puntos (modo Genesys) ─────────────────────────
    if (isPointsMode) {
        const pInp = document.getElementById('cvs-pts-input');
        document.getElementById('cvs-pts-minus')?.addEventListener('click', () => {
            pInp.value = Math.max(0, (parseInt(pInp.value) || 0) - 1);
        });
        document.getElementById('cvs-pts-plus')?.addEventListener('click', () => {
            pInp.value = (parseInt(pInp.value) || 0) + 1;
        });
    }

    // ── Búsqueda limpia con data-attributes ───────────────────────
    const inp   = document.getElementById('cvs-input');
    const btn   = document.getElementById('cvs-btn');
    const resEl = document.getElementById('cvs-results');

    const cleanSearch = async () => {
        const term = inp?.value?.trim();
        if (!term) return;
        resEl.innerHTML = '<p style="color:#aaa;font-size:0.85rem;">⏳ Buscando...</p>';
        try {
            const r     = await fetch(
                `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(term)}`
            );
            const json  = await r.json();
            const cards = (json.data || []).slice(0, 15);
            if (!cards.length) {
                resEl.innerHTML = '<p style="color:#aaa;font-size:0.85rem;">Sin resultados.</p>';
                return;
            }
            resEl.innerHTML = cards.map(c => `
                <div data-cardid="${c.id}"
                     data-name="${(c.name || '').replace(/"/g, '&quot;')}"
                     data-img="${c.card_images?.[0]?.image_url_small || ''}"
                     style="display:flex;align-items:center;gap:8px;padding:7px;
                            border-radius:7px;cursor:pointer;background:rgba(255,255,255,0.04);"
                     onmouseenter="this.style.background='rgba(255,255,255,0.09)'"
                     onmouseleave="this.style.background='rgba(255,255,255,0.04)'">
                    <img src="${c.card_images?.[0]?.image_url_small || ''}"
                         style="width:36px;border-radius:3px;" onerror="this.style.display='none'">
                    <div>
                        <div style="font-size:0.83rem;color:#fff;">${c.name}</div>
                        <div style="font-size:0.72rem;color:#aaa;">${c.type}</div>
                    </div>
                </div>`).join('');
        } catch (_) {
            resEl.innerHTML = '<p style="color:#d63031;font-size:0.85rem;">Error de red.</p>';
        }
    };

    // ── Event delegation sobre resultados ─────────────────────────
    resEl.addEventListener('click', e => {
        const row = e.target.closest('[data-cardid]');
        if (!row) return;
        const cid  = row.dataset.cardid;
        const name = row.dataset.name;
        const img  = row.dataset.img;
        if (!window.Banlist) return;

        if (isPointsMode) {
            const pInp = document.getElementById('cvs-pts-input');
            const pts  = Math.max(0, parseInt(pInp?.value) || 1);
            Banlist.setCardPoints(formatName, cid, { name, img }, pts);
        } else {
            Banlist.setCardStatus(formatName, cid, { name, img }, selectedStatus);
        }

        const listEl  = document.getElementById(`banlist-cards-${formatName}`);
        if (listEl) listEl.innerHTML = Banlist.renderFormatList(formatName);
        const countEl = document.getElementById(`ban-count-${formatName}`);
        if (countEl) {
            const d = Banlist.getData();
            countEl.textContent =
                Object.keys(d.formats[formatName]?.cards || {}).length + ' cartas';
        }

        row.style.background = 'rgba(255,215,0,0.18)';
        setTimeout(() => { row.style.background = 'rgba(255,255,255,0.04)'; }, 900);
    });

    btn.addEventListener('click', cleanSearch);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') cleanSearch(); });
    inp.focus();

    if (prefillName) {
        inp.value = prefillName;
        cleanSearch();
    }
},

openPointsEditor: function (formatName, cardId, cardName, currentPoints) {
    if (document.getElementById('cv-pts-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cv-pts-overlay';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.82);
        z-index:99999;display:flex;align-items:center;justify-content:center;`;

    overlay.innerHTML = `
        <div style="background:#111;border:1px solid rgba(255,255,255,0.15);
                    border-radius:12px;padding:24px;width:300px;position:relative;">
            <button onclick="document.getElementById('cv-pts-overlay').remove()"
                    style="position:absolute;top:10px;right:12px;background:none;
                           border:none;color:#fff;font-size:1.2rem;cursor:pointer;">✕</button>
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);margin-bottom:6px;
                        text-transform:uppercase;letter-spacing:0.05em;">⚙ Genesys · ${formatName}</div>
            <div style="font-size:0.98rem;color:#fff;margin-bottom:16px;font-weight:600;">
                ${cardName}
            </div>
            <div style="display:flex;align-items:center;gap:10px;justify-content:center;">
                <button id="pts-minus"
                        style="width:36px;height:36px;background:rgba(255,255,255,0.1);
                               border:1px solid rgba(255,255,255,0.2);color:#fff;
                               border-radius:6px;cursor:pointer;font-size:1.3rem;line-height:1;">−</button>
                <input id="pts-input" type="number" min="0" value="${currentPoints || 0}"
                       style="width:80px;text-align:center;font-size:1.3rem;font-weight:700;
                              background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.25);
                              color:#fff;border-radius:7px;padding:6px;">
                <button id="pts-plus"
                        style="width:36px;height:36px;background:rgba(255,255,255,0.1);
                               border:1px solid rgba(255,255,255,0.2);color:#fff;
                               border-radius:6px;cursor:pointer;font-size:1.3rem;line-height:1;">＋</button>
            </div>
            <button id="pts-save"
                    style="margin-top:18px;width:100%;padding:9px;background:#0066cc;border:none;
                           color:#fff;border-radius:7px;cursor:pointer;font-size:0.9rem;font-weight:600;">
                Guardar puntos
            </button>
            <div id="pts-feedback" style="text-align:center;font-size:0.78rem;color:#00b894;
                                          min-height:18px;margin-top:6px;"></div>
        </div>`;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    const inp  = document.getElementById('pts-input');
    document.getElementById('pts-minus').addEventListener('click', () => {
        inp.value = Math.max(0, (parseInt(inp.value) || 0) - 1);
    });
    document.getElementById('pts-plus').addEventListener('click', () => {
        inp.value = (parseInt(inp.value) || 0) + 1;
    });
    document.getElementById('pts-save').addEventListener('click', () => {
        const pts = Math.max(0, parseInt(inp.value) || 0);
        Banlist.setCardPoints(formatName, cardId,
            { name: cardName, img: '' }, pts);
        const listEl  = document.getElementById(`banlist-cards-${formatName}`);
        if (listEl) listEl.innerHTML = Banlist.renderFormatList(formatName);
        const countEl = document.getElementById(`ban-count-${formatName}`);
        if (countEl) {
            const d = Banlist.getData();
            countEl.textContent = Object.keys(d.formats[formatName]?.cards || {}).length + ' cartas';
        }
        const fb = document.getElementById('pts-feedback');
        if (fb) fb.textContent = '✓ Guardado';
        setTimeout(() => overlay.remove(), 900);
    });
},
    openSetInBuscador: function (setName) {
        // Cerrar el cardviewer
        document.getElementById('cv-overlay')?.remove();
        // Navegar al buscador
        if (window.Navigation) Navigation.showTab('buscador');
        // Aplicar el filtro de set y buscar
        setTimeout(() => {
            if (!window.Buscador) return;
            // Limpiar búsqueda previa
            Buscador.clear();
            // Asegurarse de que el set esté cargado en la lista
            Buscador._loadCardsets().then(() => {
                Buscador.advancedFilters.cardset = setName;
                const sel = document.getElementById('buscador-set-sel');
                if (sel) sel.value = setName;
                Buscador._updateFilterSummary();
                Buscador.autoSearch();
            });
        }, 80);
    },
};

window.CardViewer = CardViewer;