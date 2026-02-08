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

                <p style="white-space:pre-wrap;">${card.desc}</p>

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

    // MINIATURAS
    const thumbs = document.querySelectorAll('.cv-thumb');
const mainImage = document.getElementById('cv-main-img');

thumbs.forEach((t, index) => {
    t.onclick = () => {
        mainImage.src = images[index].image_url;
    };
});

    // CONTADOR
    const plus = document.getElementById('cv-plus');
    const minus = document.getElementById('cv-minus');
    const count = document.getElementById('cv-count');

    plus.onclick = () => {
        this.quantities[card.id] = (this.quantities[card.id] || 0) + 1;
        count.textContent = this.quantities[card.id];
    };

    minus.onclick = () => {
        this.quantities[card.id] = Math.max(0, (this.quantities[card.id] || 0) - 1);
        count.textContent = this.quantities[card.id];
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

}
,


    openFromIndex(index) {
        const card = window.Buscador.currentCards[index];
        if (!card) return;
        this.open(card);
    }
};

window.CardViewer = CardViewer;
