/* ====================================
   BANLIST MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Sistema de Banlist por Formato
   ==================================== */

const Banlist = {
    STORAGE_KEY: 'yugioh_banlist_data',
    currentTab:  'TCG',

    STATUS_PRIORITY: { forbidden: 4, limited: 3, 'semi-limited': 2, free: 1 },
    STATUS_LABEL:    { forbidden: 'Baneada', limited: 'Limitada', 'semi-limited': 'Semi-Limitada' },
    STATUS_COLOR:    { forbidden: '#d63031', limited: '#e17055', 'semi-limited': '#fdcb6e' },
    STATUS_TEXT:     { forbidden: '#fff',    limited: '#fff',    'semi-limited': '#000' },
    STATUS_ORDER:    { forbidden: 0, limited: 1, 'semi-limited': 2 },

    // ── Persistencia ─────────────────────────────────────────────
    getData: function () {
    try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            // Migración: agregar Genesys si no existe
            if (!data.formats.Genesys) {
                data.formats.Genesys = { cards: {}, isCustom: false, isGenesys: true };
                this.saveData(data);
            }
            return data;
        }
    } catch (_) {}
    return {
        activeFormats: ['TCG'],
        formats: {
            TCG:     { cards: {}, lastUpdated: null, isCustom: false },
            OCG:     { cards: {}, lastUpdated: null, isCustom: false },
            Genesys: { cards: {}, isCustom: false, isGenesys: true }
        }
    };
},

    saveData: function (data) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    },

    // ── Formatos activos ─────────────────────────────────────────
    getActiveFormats: function () {
        return this.getData().activeFormats || ['TCG'];
    },

    toggleActiveFormat: function (formatName) {
    const data      = this.getData();
    const isGenesys = !!data.formats[formatName]?.isGenesys;
    const idx       = data.activeFormats.indexOf(formatName);

    if (idx > -1) {
        if (data.activeFormats.length === 1) return; // no deseleccionar el último
        data.activeFormats.splice(idx, 1);
    } else {
        if (isGenesys) {
            // Genesys excluye todos los demás
            data.activeFormats = [formatName];
        } else {
            // Si Genesys estaba activo, quitarlo
            data.activeFormats = data.activeFormats.filter(f => !data.formats[f]?.isGenesys);
            data.activeFormats.push(formatName);
        }
    }
    this.saveData(data);
    this.refreshFormatChips();
},

    // ── Status efectivo ──────────────────────────────────────────
    getEffectiveBanStatus: function (cardId) {
        const data = this.getData();
        const id   = String(cardId);
        let highest = 'free';

        for (const fName of (data.activeFormats || [])) {
            const fmt = data.formats[fName];
            if (!fmt) continue;
            let status;
            if (fmt.inverted) {
                status = fmt.cards[id] ? 'free' : 'forbidden';
            } else {
                status = fmt.cards[id]?.status || 'free';
            }
            if ((this.STATUS_PRIORITY[status] || 1) > (this.STATUS_PRIORITY[highest] || 1)) {
                highest = status;
            }
        }
        return highest;
    },

    // Badge para usar en Mi Deck
    getBadgeHTML: function (cardId) {
    const data         = this.getData();
    const genesysActive = data.activeFormats.some(f => data.formats[f]?.isGenesys);

    if (genesysActive) {
        const pts = this.getCardPoints(cardId);
        if (!pts || pts === 0) return '';
        return `<span class="ban-badge" style="background:#1a1a1a;color:#fff;border:1px solid #555;">${pts} pts</span>`;
    }

    const status = this.getEffectiveBanStatus(cardId);
    if (!status || status === 'free') return '';
    const c = this.STATUS_COLOR[status];
    const t = this.STATUS_TEXT[status];
    const l = this.STATUS_LABEL[status];
    return `<span class="ban-badge" style="background:${c};color:${t};">${l}</span>`;
},

    // ── Operaciones sobre cartas ─────────────────────────────────
    setCardStatus: function (formatName, cardId, cardMeta, status) {
        const data = this.getData();
        if (!data.formats[formatName]) return;
        const id = String(cardId);
        if (status === 'free') {
            delete data.formats[formatName].cards[id];
        } else {
            data.formats[formatName].cards[id] = {
                name:   cardMeta.name || '',
                img:    cardMeta.img  || '',
                status
            };
        }
        this.saveData(data);
    },

    removeCardFromFormat: function (formatName, cardId) {
        const data = this.getData();
        if (!data.formats[formatName]) return;
        delete data.formats[formatName].cards[String(cardId)];
        this.saveData(data);
        const listEl = document.getElementById(`banlist-cards-${formatName}`);
        if (listEl) listEl.innerHTML = this.renderFormatList(formatName);
        const countEl = document.getElementById(`ban-count-${formatName}`);
        if (countEl) countEl.textContent = Object.keys(data.formats[formatName].cards).length + ' cartas';
    },

    // ── Crear / eliminar formato custom ──────────────────────────
    createCustomFormat: function () {
        const name = prompt('Nombre del formato personalizado:');
        if (!name || !name.trim()) return;
        const key  = name.trim();
        const data = this.getData();
        if (data.formats[key]) { alert('Ya existe un formato con ese nombre.'); return; }
        data.formats[key] = { cards: {}, isCustom: true, inverted: false };
        this.saveData(data);
        this.currentTab = key;
        this.renderSection();
    },

    deleteCustomFormat: function (formatName) {
        if (!confirm(`¿Eliminar el formato "${formatName}"?`)) return;
        const data = this.getData();
        delete data.formats[formatName];
        data.activeFormats = data.activeFormats.filter(f => f !== formatName);
        this.saveData(data);
        this.currentTab = 'TCG';
        this.renderSection();
    },

    toggleInverted: function (formatName) {
        const data = this.getData();
        if (!data.formats[formatName]) return;
        data.formats[formatName].inverted = !data.formats[formatName].inverted;
        this.saveData(data);
        const isInv  = data.formats[formatName].inverted;
        const btn    = document.getElementById(`ban-invert-btn-${formatName}`);
        if (btn) btn.textContent = isInv ? '🔄 Lista invertida (activa)' : '🔄 Invertir lista';
        if (btn) btn.style.borderColor = isInv ? '#fdcb6e' : '';
        if (btn) btn.style.color       = isInv ? '#fdcb6e' : '';
    },

    // ── Actualizar listas oficiales ──────────────────────────────
    updateOfficialList: async function (format) {
        const btn = document.getElementById(`ban-update-btn-${format}`);
        if (btn) { btn.disabled = true; btn.textContent = '⏳ Actualizando...'; }

        try {
            const apiFormat = format.toLowerCase();
            const res  = await fetch(
                `https://db.ygoprodeck.com/api/v7/cardinfo.php?banlist=${apiFormat}`
            );
            const json = await res.json();
            const cards = json.data || [];

            const data = this.getData();
            if (!data.formats[format]) data.formats[format] = { cards: {}, isCustom: false };
            data.formats[format].cards = {};

            const STATUS_MAP = { 'Banned': 'forbidden', 'Limited': 'limited', 'Semi-Limited': 'semi-limited' };
            const key        = format === 'TCG' ? 'ban_tcg' : 'ban_ocg';

            cards.forEach(card => {
                const rawStatus = card.banlist_info?.[key];
                const status    = STATUS_MAP[rawStatus];
                if (!status) return;
                data.formats[format].cards[String(card.id)] = {
                    name: card.name,
                    img:  card.card_images?.[0]?.image_url_small || '',
                    status
                };
            });

            data.formats[format].lastUpdated = new Date().toLocaleDateString('es-ES');
            this.saveData(data);

            const listEl  = document.getElementById(`banlist-cards-${format}`);
            if (listEl) listEl.innerHTML = this.renderFormatList(format);
            const dateEl  = document.getElementById(`ban-date-${format}`);
            if (dateEl) dateEl.textContent = data.formats[format].lastUpdated;
            const countEl = document.getElementById(`ban-count-${format}`);
            if (countEl) countEl.textContent = Object.keys(data.formats[format].cards).length + ' cartas';

            if (btn) {
                btn.textContent = '✅ Actualizado';
                btn.disabled    = false;
                setTimeout(() => { btn.textContent = '🔄 Actualizar'; }, 2500);
            }
        } catch (_) {
            if (btn) {
                btn.textContent = '❌ Error de red';
                btn.disabled    = false;
                setTimeout(() => { btn.textContent = '🔄 Actualizar'; }, 2500);
            }
        }
    },

    // ── UI Principal ─────────────────────────────────────────────
    renderSection: function () {
        const el = document.getElementById('banlist-section');
        if (!el) return;
        el.innerHTML = this._buildSectionHTML();
    },

    _buildSectionHTML: function () {
        const data    = this.getData();
        const active  = data.activeFormats;
        const allKeys = ['TCG', 'OCG', ...Object.keys(data.formats).filter(k => k !== 'TCG' && k !== 'OCG')];

        const chips = allKeys.map(name => `
            <span class="ban-format-chip ${active.includes(name) ? 'ban-chip-active' : ''}"
                  onclick="Banlist.toggleActiveFormat('${name}')">${name}</span>`
        ).join('');

        const tabs = allKeys.map(name => `
            <button class="ban-tab-btn ${this.currentTab === name ? 'ban-tab-active' : ''}"
                    onclick="Banlist.switchTab('${name}')">${name}</button>`
        ).join('');

        return `
            <div class="ban-active-row">
                <span class="ban-label-text">Formato(s) activo(s):</span>
                <div class="ban-format-chips" id="ban-format-chips">${chips}</div>
            </div>
            <p class="ban-hint">Al elegir más de uno se aplica el baneo más restrictivo de cada carta.</p>
            <div class="ban-tabs">
                ${tabs}
                <button class="ban-tab-btn ban-tab-create"
                        onclick="Banlist.createCustomFormat()">＋ Crear Banlist</button>
            </div>
            <div class="ban-tab-body">
                ${this._buildTabContent(this.currentTab, data)}
            </div>`;
    },

    _buildTabContent: function (formatName, data) {
    const fmt = data?.formats?.[formatName];
    if (!fmt) return '<p class="stats-empty">Formato no encontrado.</p>';

    const isCustom   = fmt.isCustom;
    const isGenesys  = fmt.isGenesys || false;
    const isInverted = fmt.inverted || false;
    const lastUpd    = fmt.lastUpdated || '—';
    const cardCount  = Object.keys(fmt.cards).length;

    const officialBtns = (!isCustom && !isGenesys) ? `
        <button class="btn btn-sm btn-primary" id="ban-update-btn-${formatName}"
                onclick="Banlist.updateOfficialList('${formatName}')">🔄 Actualizar</button>
        <span class="ban-last-update">
            Última actualización: <span id="ban-date-${formatName}">${lastUpd}</span>
        </span>` : '';

    const customBtns = (isCustom && !isGenesys) ? `
        <button class="btn btn-sm btn-secondary"
                id="ban-invert-btn-${formatName}"
                style="${isInverted ? 'color:#fdcb6e;border-color:#fdcb6e;' : ''}"
                onclick="Banlist.toggleInverted('${formatName}')">
            🔄 ${isInverted ? 'Lista invertida (activa)' : 'Invertir lista'}
        </button>
        <button class="btn btn-sm btn-primary"
                onclick="CardViewer.openCardSearch('${formatName}')">＋ Agregar carta</button>
        <button class="btn btn-sm btn-danger"
                onclick="Banlist.deleteCustomFormat('${formatName}')">🗑️ Eliminar</button>` : '';

    const genesisBtns = isGenesys ? `
        <button class="btn btn-sm btn-primary"
                onclick="CardViewer.openCardSearch('${formatName}', '', 'points')">
            ＋ Agregar carta
        </button>` : '';

    return `
        <div class="ban-tab-header">
            ${officialBtns}${customBtns}${genesisBtns}
            <span class="ban-card-count" id="ban-count-${formatName}">${cardCount} cartas</span>
        </div>
        <div id="banlist-cards-${formatName}" class="ban-cards-list">
            ${this.renderFormatList(formatName)}
        </div>`;
},
    renderFormatList: function (formatName) {
    const data = this.getData();
    const fmt  = data.formats[formatName];
    if (!fmt) return '';

    const isGenesys = fmt.isGenesys || false;

    const entries = Object.entries(fmt.cards).sort((a, b) => {
        if (isGenesys) return (b[1].points || 0) - (a[1].points || 0);
        return (this.STATUS_ORDER[a[1].status] ?? 9) - (this.STATUS_ORDER[b[1].status] ?? 9)
               || a[1].name.localeCompare(b[1].name);
    });

    if (entries.length === 0) {
        return `<p class="stats-empty">
            ${fmt.isCustom || isGenesys
                ? 'Sin cartas. Usa "Agregar carta" para poblar este formato.'
                : 'Sin datos. Usa "Actualizar" para descargar la lista oficial.'}
        </p>`;
    }

    return entries.map(([id, card]) => {
        const isStaple    = window.ConfigManager?.isStaple?.(id);
        const stapleBadge = isStaple ? '<span class="ban-staple-badge">📌 Staple</span>' : '';

        if (isGenesys) {
            const pts = card.points || 0;
            return `
                <div class="ban-card-row">
                    <img class="ban-card-img"
                         src="${card.img}"
                         onerror="this.style.display='none'" alt="${card.name}">
                    <div class="ban-card-info">
                        <div class="ban-card-name">${card.name} ${stapleBadge}</div>
                        <span class="ban-status-badge"
                              style="background:#1a1a1a;color:#fff;border:1px solid #555;">
                            ${pts} pts
                        </span>
                    </div>
                    <div class="ban-card-actions">
                        <button class="btn btn-sm btn-secondary"
                                onclick="Banlist.openChangeBan('${formatName}','${id}','${card.name.replace(/'/g,"\\'")}')">
                            Cambiar Puntos
                        </button>
                        <button class="btn btn-sm btn-secondary"
                                onclick="Banlist.viewCard('${id}')">Ver</button>
                        <button class="btn btn-sm btn-danger"
                                onclick="Banlist.removeCardFromFormat('${formatName}','${id}')">
                            Sacar
                        </button>
                    </div>
                </div>`;
        }

        const c   = this.STATUS_COLOR[card.status] || '#666';
        const t   = this.STATUS_TEXT[card.status]  || '#fff';
        const lbl = this.STATUS_LABEL[card.status] || card.status;

        return `
            <div class="ban-card-row">
                <img class="ban-card-img"
                     src="${card.img}"
                     onerror="this.style.display='none'" alt="${card.name}">
                <div class="ban-card-info">
                    <div class="ban-card-name">${card.name} ${stapleBadge}</div>
                    <span class="ban-status-badge" style="background:${c};color:${t};">${lbl}</span>
                </div>
                <div class="ban-card-actions">
                    <button class="btn btn-sm btn-secondary"
                            onclick="Banlist.openChangeBan('${formatName}','${id}','${card.name.replace(/'/g,"\\'")}')">
                        Cambiar Ban
                    </button>
                    <button class="btn btn-sm btn-secondary"
                            onclick="Banlist.viewCard('${id}')">Ver</button>
                    <button class="btn btn-sm btn-danger"
                            onclick="Banlist.removeCardFromFormat('${formatName}','${id}')">
                        Sacar
                    </button>
                </div>
            </div>`;
    }).join('');
},
openChangeBan: function (formatName, cardId, cardName) {
    const data      = this.getData();
    const isGenesys = data.formats[formatName]?.isGenesys;
    if (isGenesys) {
        const currentPts = this.getCardPoints(cardId);
        CardViewer.openPointsEditor(formatName, cardId, cardName, currentPts);
    } else {
        if (window.CardViewer) CardViewer.openCardSearch(formatName, cardName);
    }
},
    viewCard: function (cardId) {
        if (window.Estadisticas?.powerScoreCache?.cards) {
            const cached = Estadisticas.powerScoreCache.cards.find(c => String(c.cardId) === String(cardId));
            if (cached?.cardData && window.CardViewer) { CardViewer.open(cached.cardData); return; }
        }
        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}`)
            .then(r => r.json())
            .then(d => { if (d.data?.[0] && window.CardViewer) CardViewer.open(d.data[0]); })
            .catch(() => {});
    },

    switchTab: function (name) {
        this.currentTab = name;
        this.renderSection();
    },

    refreshFormatChips: function () {
        const data    = this.getData();
        const active  = data.activeFormats;
        const chips   = document.getElementById('ban-format-chips');
        if (!chips) return;
        const allKeys = ['TCG', 'OCG', ...Object.keys(data.formats).filter(k => k !== 'TCG' && k !== 'OCG')];
        chips.innerHTML = allKeys.map(name =>
            `<span class="ban-format-chip ${active.includes(name) ? 'ban-chip-active' : ''}"
                   onclick="Banlist.toggleActiveFormat('${name}')">${name}</span>`
        ).join('');
    },
    // ── Genesys ──────────────────────────────────────────────────

isGenesysActive: function () {
    const data = this.getData();
    return data.activeFormats.some(f => data.formats[f]?.isGenesys);
},

getGenesysFormatName: function () {
    const data = this.getData();
    return Object.keys(data.formats).find(k => data.formats[k].isGenesys) || 'Genesys';
},

getCardPoints: function (cardId) {
    const data = this.getData();
    const id   = String(cardId);
    for (const fmt of Object.values(data.formats)) {
        if (fmt.isGenesys) return fmt.cards[id]?.points || 0;
    }
    return 0;
},

setCardPoints: function (formatName, cardId, cardMeta, points) {
    const data = this.getData();
    if (!data.formats[formatName]) return;
    const id  = String(cardId);
    const pts = Math.max(0, parseInt(points) || 0);
    if (pts === 0) {
        delete data.formats[formatName].cards[id];
    } else {
        data.formats[formatName].cards[id] = {
            name:   cardMeta.name || '',
            img:    cardMeta.img  || '',
            points: pts
        };
    }
    this.saveData(data);
},

getDeckPoints: function (cards) {
    // Main + Extra únicamente (Side no cuenta en Genesys)
    if (!cards) return 0;
    const data   = this.getData();
    let   genFmt = null;
    for (const fmt of Object.values(data.formats)) {
        if (fmt.isGenesys) { genFmt = fmt; break; }
    }
    if (!genFmt) return 0;
    let total = 0;
    Object.entries(cards).forEach(([id, item]) => {
        if (item.location === 'side') return;
        const pts = genFmt.cards[String(id)]?.points || 0;
        total += pts * (item.qty || 1);
    });
    return total;
},

renderDeckPointsIndicator: function (cards) {
    const total = this.getDeckPoints(cards);
    return `
        <div class="genesys-points-indicator">
            <span class="gpi-label">⚙ Puntos Genesys</span>
            <span class="gpi-value">${total} pts</span>
            <span class="gpi-note">Main + Extra</span>
        </div>`;
},
};

window.Banlist = Banlist;