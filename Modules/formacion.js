/* ====================================
   FORMACION MODULE - Destiny Draw
   Pestaña Formación: Juegos Alternativos
   ==================================== */

const Formacion = {

    container: null,

    PLATFORMS: ['PC', 'GBC', 'GBA', 'NDS', 'NDSi', 'N3DS', 'Switch', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'Físico'],

    init: function () {
        this.container = document.getElementById('formacion-content');
        if (!this.container) return;
        this.render();
    },

    render: function () {
        if (!this.container) return;
        this.container.innerHTML = `
            <h2>Formación</h2>

            <!-- Sección: Juegos Alternativos (desplegada por defecto) -->
            <div class="form-section">
                <h3 class="form-section-title" onclick="Formacion.toggleSection('form-juegos-section')">
                    ▼ Juegos Alternativos de Yu-Gi-Oh!
                </h3>
                <div id="form-juegos-section" class="form-section-content">
                    ${this._renderJuegosSection()}
                </div>
            </div>
        `;
    },

    toggleSection: function (id) {
        const el    = document.getElementById(id);
        if (!el) return;
        const title = el.previousElementSibling;
        if (el.style.display === 'none') {
            el.style.display = 'block';
            if (title) title.textContent = title.textContent.replace('▶', '▼');
        } else {
            el.style.display = 'none';
            if (title) title.textContent = title.textContent.replace('▼', '▶');
        }
    },

    // ===============================
    // JUEGOS ALTERNATIVOS
    // ===============================

    _renderJuegosSection: function () {
        const games = window.ConfigManager?.getFormacionGames?.() ?? [];
        if (!games.length) {
            return '<p class="form-empty">No hay juegos configurados. Ve a Configuración → Juegos Alternativos.</p>';
        }
        return `
            <div class="form-juegos-grid">
                ${games.map(g => this._renderGameCard(g)).join('')}
            </div>
        `;
    },

    _renderGameCard: function (g) {
        const platforms   = Array.isArray(g.platforms) ? g.platforms : [];
        const platformBadges = platforms.length
            ? platforms.map(p => `<span class="form-platform-badge">${this._escHtml(p)}</span>`).join('')
            : '<span class="form-platform-badge form-platform-none">Sin plataforma</span>';

        const fallback    = g.fallbackUrl ? g.fallbackUrl.trim() : '';
        const resolvedFallback = fallback.startsWith('local:')
            ? (window.ConfigManager?.getFormacionFallbacks?.()[fallback.replace('local:', '')] || '')
            : fallback;

        const imgBlock = resolvedFallback
            ? `<img class="form-game-img" src="${this._escAttr(resolvedFallback)}" alt="${this._escAttr(g.name || '')}" loading="lazy">`
            : `<div class="form-game-img form-game-img--empty"><span>Sin imagen</span></div>`;

        const hasLink = g.link ? g.link.trim() : '';

        return `
            <a class="form-game-card${hasLink ? '' : ' form-game-card--nolink'}"
               ${hasLink ? `href="${this._escAttr(hasLink)}" target="_blank" rel="noopener noreferrer"` : ''}
               title="${this._escAttr(g.name || '')}">
                <div class="form-game-img-wrap">
                    ${imgBlock}
                </div>
                <div class="form-game-info">
                    <div class="form-game-name">${this._escHtml(g.name || 'Sin nombre')}</div>
                    ${g.title ? `<div class="form-game-title">${this._escHtml(g.title)}</div>` : ''}
                    <div class="form-game-platforms">
                        <span class="form-platforms-label">Plataforma:</span>
                        <div class="form-platforms-row">${platformBadges}</div>
                    </div>
                </div>
            </a>
        `;
    },

    // ===============================
    // UTILIDADES
    // ===============================

    _escHtml: function (str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    _escAttr: function (str) {
        return String(str).replace(/"/g, '&quot;');
    }
};

window.Formacion = Formacion;
