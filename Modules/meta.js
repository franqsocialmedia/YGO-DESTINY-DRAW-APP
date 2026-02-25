/* ====================================
   META MODULE - Destiny Draw
   Pestaña Meta: Fuentes Externas
   ==================================== */

const Meta = {

    container: null,

    init: function () {
        this.container = document.getElementById('meta-content');
        if (!this.container) return;
        this.render();
    },

    render: function () {
        if (!this.container) return;
        this.container.innerHTML = `
            <h2>Meta</h2>

            <!-- Sección: Fuentes Externas -->
            <div class="meta-section">
                <h3 class="meta-section-title" onclick="Meta.toggleSection('meta-fuentes-section')">
                    ▶ Fuentes Externas
                </h3>
                <div id="meta-fuentes-section" class="meta-section-content" style="display:none;">
                    ${this._renderFuentesSection()}
                </div>
            </div>
        `;
    },

    toggleSection: function (id) {
        const el = document.getElementById(id);
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
    // FUENTES EXTERNAS
    // ===============================

    _renderFuentesSection: function () {
        const links = window.ConfigManager ? ConfigManager.getMetaLinks() : [];
        if (!links.length) {
            return '<p class="meta-empty">No hay fuentes configuradas. Ve a Configuración → Fuentes Externas del Meta.</p>';
        }

        return `
            <div class="meta-fuentes-tabs">
                <div class="meta-tabs-nav" id="meta-tabs-nav">
                    ${links.map((lk, i) => `
                        <button class="meta-tab-btn${i === 0 ? ' active' : ''}"
                                onclick="Meta.showFrame(${i})"
                                id="meta-tab-btn-${i}">
                            ${this._escHtml(lk.title || `Fuente ${i + 1}`)}
                        </button>
                    `).join('')}
                </div>

                <div class="meta-frames-container" id="meta-frames-container">
                    ${links.map((lk, i) => `
                        <div class="meta-frame-pane${i === 0 ? ' active' : ''}" id="meta-frame-pane-${i}">
                            ${lk.desc ? `<p class="meta-frame-desc">${this._escHtml(lk.desc)}</p>` : ''}
                            <div class="meta-frame-toolbar">
                                <span class="meta-frame-url">${this._escHtml(lk.url)}</span>
                                <a class="meta-frame-open-btn" href="${this._escAttr(lk.url)}" target="_blank" rel="noopener noreferrer">
                                    ↗ Abrir en nueva pestaña
                                </a>
                            </div>
                            <div class="meta-iframe-wrapper" id="meta-iframe-wrapper-${i}">
                                <iframe
                                    src="${this._escAttr(lk.url)}"
                                    class="meta-iframe"
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
                                    referrerpolicy="no-referrer"
                                    loading="lazy"
                                    onload="Meta._onFrameLoad(${i}, this)"
                                    onerror="Meta._onFrameError(${i})"
                                    title="${this._escAttr(lk.title || 'Fuente externa')}">
                                </iframe>
                                <div class="meta-iframe-blocked" id="meta-iframe-blocked-${i}" style="display:none;">
                                    <div class="meta-blocked-content">
                                        <span class="meta-blocked-icon">🚫</span>
                                        <p>Este sitio no permite ser embebido.</p>
                                        <a class="btn btn-primary meta-blocked-link"
                                           href="${this._escAttr(lk.url)}"
                                           target="_blank" rel="noopener noreferrer">
                                            ↗ Abrir ${this._escHtml(lk.title || 'enlace')}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    showFrame: function (index) {
        const panes = document.querySelectorAll('.meta-frame-pane');
        const btns  = document.querySelectorAll('.meta-tab-btn');
        panes.forEach((p, i) => p.classList.toggle('active', i === index));
        btns.forEach((b, i)  => b.classList.toggle('active',  i === index));
    },

    // Detección de bloqueo por iframe: si el frame carga pero está vacío (frame-busting),
    // no podemos saberlo desde el padre cross-origin. Lo mejor es mostrar un overlay
    // que el usuario puede cerrar si SÍ cargó. Se muestra 3s después del onload.
    _onFrameLoad: function (index, iframe) {
        // Intentar detectar bloqueo: si contentDocument es nulo → bloqueado
        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            // Si accede sin error → mismo origen, cargó bien
            if (doc && doc.body) return;
        } catch (_) {
            // Cross-origin: no podemos acceder. Mostramos aviso no-intrusivo.
        }
        // Mostrar overlay "puede que esté bloqueado" con botón para cerrarlo
        const wrapper  = document.getElementById(`meta-iframe-wrapper-${index}`);
        const existing = document.getElementById(`meta-iframe-hint-${index}`);
        if (!wrapper || existing) return;
        const hint = document.createElement('div');
        hint.id = `meta-iframe-hint-${index}`;
        hint.className = 'meta-iframe-hint';
        hint.innerHTML = `
            <span>¿No ves el contenido?</span>
            <button onclick="Meta._showBlocked(${index})">Ver enlace externo</button>
            <button class="meta-hint-close" onclick="this.parentElement.remove()">✕</button>
        `;
        wrapper.appendChild(hint);
    },

    _onFrameError: function (index) {
        this._showBlocked(index);
    },

    _showBlocked: function (index) {
        const blocked = document.getElementById(`meta-iframe-blocked-${index}`);
        const iframe  = document.querySelector(`#meta-frame-pane-${index} .meta-iframe`);
        if (blocked) blocked.style.display = 'flex';
        if (iframe)  iframe.style.display  = 'none';
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

window.Meta = Meta;
