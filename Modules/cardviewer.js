const CardViewer = {
    quantities: {}, 

    open(card) {
        const quantity = this.quantities[card.id] || 0;

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
                    <button id="cv-download">Descargar Imagen</button>

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
            this.quantities[card.id] = (this.quantities[card.id] || 0) + 1;
            count.textContent = this.quantities[card.id];
            Deck.syncFromViewer(card.id, card, this.quantities[card.id]);
        };

        minus.onclick = () => {
            this.quantities[card.id] = Math.max(0, (this.quantities[card.id] || 0) - 1);
            count.textContent = this.quantities[card.id];
            Deck.syncFromViewer(card.id, card, this.quantities[card.id]);
        };

        const downloadBtn = document.getElementById('cv-download');
        downloadBtn.onclick = () => {
            const imgUrl = mainImage.src;
            const a = document.createElement('a');
            a.href = imgUrl;
            a.download = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    },

    highlightNomenclature: function(desc) {
        if (!desc || !window.ConfigManager) return desc;

        const nomenclature = ConfigManager.getNomenclature();
        const colors = ConfigManager.getNomenclatureColors();

        const paragraphs = this.splitIntoParagraphs(desc);
        const highlightedParagraphs = paragraphs.map(para => {
            return this.highlightParagraph(para.text, nomenclature, colors);
        });

        return highlightedParagraphs.join('');
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

    highlightParagraph: function(paragraph, nomenclature, colors) {
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
        let matchedKeywords = [];

        const checkMatch = (category, keywords, isObject = false) => {
            if (isObject) {
                for (const [name, kwList] of Object.entries(keywords)) {
                    for (const kw of kwList) {
                        if (paragraph.toLowerCase().includes(kw.toLowerCase())) {
                            matchedCategory = category;
                            matchedKeywords.push(kw);
                            return true;
                        }
                    }
                }
            } else {
                for (const kw of keywords) {
                    if (paragraph.toLowerCase().includes(kw.toLowerCase())) {
                        matchedCategory = category;
                        matchedKeywords.push(kw);
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