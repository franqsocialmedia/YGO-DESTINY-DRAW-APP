/* ====================================
   HELP PANEL MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Panel flotante de ayuda contextual + FAQ
   ==================================== */

const HelpPanel = {
    activeTab: 'help',
    isOpen: false,

    // Contenido de ayuda por pestaña activa
    tabContent: {
        buscador: `
            <h4>🔍 Buscador de Cartas</h4>
            <p>Aquí puedes buscar cualquier carta de Yu-Gi-Oh! por nombre. Al encontrarla, puedes ver su efecto completo, sus estadísticas y agregarla directamente a tu deck activo.</p>
            <ul>
                <li>Escribe el nombre (o parte de él) y presiona Enter o el botón Buscar.</li>
                <li>Toca la imagen de la carta para abrir su vista detallada.</li>
                <li>Desde la vista detallada puedes agregarla al Main Deck, Extra Deck o Side Deck.</li>
                <li>El sistema resalta automáticamente las palabras clave según la nomenclatura que configures.</li>
            </ul>`,

        mideck: `
            <h4>🃏 Mi Deck</h4>
            <p>Este es tu espacio de construcción. Aquí ves todas las cartas de tu deck activo organizadas por sección.</p>
            <ul>
                <li><strong>Composición:</strong> el bloque superior muestra un resumen de tipos, atributos, niveles y más de tu deck actual.</li>
                <li><strong>Roles:</strong> asigna roles a cada carta (Starter, Negadora, Boss, etc.) para que el Internal Score los tome en cuenta.</li>
                <li><strong>Carta As:</strong> puedes marcar una carta como insignia de tu deck — será la imagen que representa al deck guardado.</li>
                <li><strong>Acciones:</strong> guarda, limpia, exporta o importa tu deck en formato .ydk compatible con otras plataformas.</li>
            </ul>`,

        estadisticas: `
            <h4>📊 Estadísticas</h4>
            <p>El centro de análisis de la app. Cada sección te da una perspectiva distinta sobre tu deck y el meta:</p>
            <ul>
                <li><strong>Análisis del Deck vs Meta:</strong> comparativa entre el poder teórico de tu deck y qué tan bien sobrevive frente al meta seleccionado. Incluye las mecánicas detectadas, cartas amenaza y decks que más te contrarrestan.</li>
                <li><strong>Internal Score:</strong> mide la calidad técnica de tu deck en tres pilares — Consistencia, Potencia y Resiliencia — basado en los roles asignados.</li>
                <li><strong>Counter-Deck Score:</strong> indica qué tan capaz es tu deck de interrumpir las estrategias del meta. A mayor puntaje, más disruptivo es tu deck contra el formato.</li>
                <li><strong>Gestión de Carpetas:</strong> aquí importas los decks del meta en formato .ydk, organizados por fecha de formato.</li>
                <li><strong>Decks del Meta:</strong> visualiza todos los decks importados. Usa los chips de carpeta para filtrar por uno o varios formatos a la vez.</li>
                <li><strong>Recurrencia de Cartas:</strong> muestra qué cartas aparecen más veces en el meta y con qué frecuencia promedio por deck.</li>
                <li><strong>Poder de Cartas del Meta:</strong> calcula un puntaje de poder para cada carta del meta basado en su presencia, mecánicas y capacidad de counter.</li>
                <li><strong>Counter-Cards del Meta:</strong> lista las cartas del meta que tienen función de interrupción activa contra mecánicas específicas.</li>
                <li><strong>Exportar:</strong> descarga reportes de tu deck o rankings del meta en .txt y .csv.</li>
            </ul>`,

        config: `
            <h4>⚙️ Configuración</h4>
            <p>Aquí personalizas cómo la app analiza las cartas y los decks. Lo que configures aquí afecta directamente a los scores y al resaltado del Buscador.</p>
            <ul>
                <li><strong>Roles:</strong> define los roles que puedes asignar a las cartas (Starter, Boss, etc.), sus keywords de detección, y el peso de valor (1.0 = rol genérico de máximo aporte · 0.1 = rol arquetípico de menor aporte general).</li>
                <li><strong>Especialidades y Counters:</strong> configura pares de mecánicas de juego y sus contrapartes. Esto activa el sistema de Power Score y External Score.</li>
                <li><strong>Staples del Formato:</strong> agrega cartas que consideras esenciales en el formato actual. El sistema las sugerirá si no las tienes en tu deck.</li>
                <li><strong>Nomenclatura:</strong> define categorías de texto para que el Buscador resalte partes del efecto de las cartas por color.</li>
            </ul>`,

        default: `
            <h4>❓ Ayuda</h4>
            <p>Esta pestaña es para ayudarte a ser mejor jugador de Yu-Gi-Oh!.</p>
            <p>Navega entre las pestañas de la app y vuelve a abrir este panel para ver la ayuda específica de cada sección.</p>`
    },

    faqContent: [
        {
            q: '¿Para qué es esta app?',
            a: 'Es una app que ayuda a los jugadores del juego de cartas Yu-Gi-Oh! — ya sean nuevos, casuales, competitivos, profesionales, incluso curiosos — a tomar el juego en sus propias manos y analizar con números sus decisiones a la hora de buscar cartas, construir decks, analizar el META, practicar sus estrategias, aprender mejor rulings básicos, intermedios y avanzados, crear su propia versión del metagame y hasta importar o exportar sus propios decks para abrirlos en otras plataformas o compartirlos con amigos.'
        },
        {
            q: '¿Qué es el Internal Score?',
            a: 'Es una puntuación de 0 a 10 que mide la calidad técnica de tu deck basándose en los roles que le asignas a cada carta. Evalúa tres pilares con el mismo peso: Consistencia (qué tan bien arrancas), Potencia (qué tan bien cierras) y Resiliencia (qué tan bien aguantas). No mide si el deck gana torneos — mide qué tan bien construido está a nivel de diseño.'
        },
        {
            q: '¿Qué es el External Score?',
            a: 'Mide qué tan bien sobrevive tu deck frente al meta actualmente cargado. Toma las mecánicas de tu deck y las cruza contra las cartas del meta que las contrarrestan. A más cartas del meta que te amenazan y mayor su presencia, menor será tu External Score. Es relativo al meta que selecciones, no a un valor fijo.'
        },
        {
            q: '¿Qué es el Counter-Deck Score?',
            a: 'Indica qué tan capaz es tu deck de interrumpir las estrategias del meta. Las cartas de tu deck que tienen función de counter acumulan puntos. Las cartas "brick" (sin uso práctico en mano) generan una penalización proporcional porque reducen la probabilidad de ejecutar esas interrupciones.'
        },
        {
            q: '¿Cómo funciona el peso de los roles?',
            a: 'Cada rol tiene un peso de 0.1 a 1.0. Un peso de 1.0 significa que la carta aporta el 100% de su valor al pilar (rol genérico, útil en cualquier situación). Un peso menor significa que aporta menos (rol arquetípico, útil solo en contexto específico). Esto te permite distinguir un buscador genérico de uno que solo busca cartas de tu arquetipo.'
        },
        {
            q: '¿Qué son las Especialidades y Counters?',
            a: 'Son pares de mecánicas configurables. Una Especialidad es un patrón de juego que un deck ejecuta (por ejemplo: "búsqueda de deck"). Un Counter es lo que lo interrumpe (por ejemplo: "niega la búsqueda"). Configurar estos pares activa el Power Score del meta y el External Score de tu deck.'
        }
    ],

    init: function () {
        this.createButton();
        this.createPanel();
    },

    createButton: function () {
        if (document.getElementById('help-float-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'help-float-btn';
        btn.className = 'help-float-btn';
        btn.innerHTML = '?';
        btn.title = 'Ayuda';
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
    },

    createPanel: function () {
        if (document.getElementById('help-panel-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'help-panel-overlay';
        overlay.className = 'help-panel-overlay';
        overlay.innerHTML = `
            <div class="help-panel" id="help-panel">
                <div class="help-panel-header">
                    <div class="help-panel-tabs">
                        <button class="help-tab-btn active" id="htab-help"
                                onclick="HelpPanel.showTab('help')">Ayuda</button>
                        <button class="help-tab-btn" id="htab-faq"
                                onclick="HelpPanel.showTab('faq')">FAQ</button>
                    </div>
                    <button class="help-panel-close" onclick="HelpPanel.close()">×</button>
                </div>
                <div class="help-panel-body" id="help-panel-body"></div>
            </div>`;
        // Cierra al clic fuera del panel
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });
        document.body.appendChild(overlay);
    },

    getActiveTab: function () {
        // Detecta la pestaña activa vía Navigation si existe
        if (window.Navigation && Navigation.currentTab) {
            return Navigation.currentTab;
        }
        // Fallback: busca el tab activo por clase
        const active = document.querySelector('.nav-tab.active, .tab-btn.active, [data-tab].active');
        return active?.dataset?.tab || 'default';
    },

    showTab: function (tab) {
        this.activeTab = tab;

        // Actualizar botones de tab
        document.querySelectorAll('.help-tab-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`htab-${tab}`);
        if (btn) btn.classList.add('active');

        const body = document.getElementById('help-panel-body');
        if (!body) return;

        if (tab === 'faq') {
            body.innerHTML = this.renderFAQ();
        } else {
            const pageTab = this.getActiveTab();
            const content = this.tabContent[pageTab] || this.tabContent.default;
            body.innerHTML = `<div class="help-content">${content}</div>`;
        }
    },

    renderFAQ: function () {
        const items = this.faqContent.map((item, i) => `
            <div class="faq-item" id="faq-${i}">
                <button class="faq-question" onclick="HelpPanel.toggleFAQ(${i})">
                    <span>${item.q}</span>
                    <span class="faq-arrow" id="faq-arrow-${i}">▶</span>
                </button>
                <div class="faq-answer" id="faq-answer-${i}" style="display:none;">
                    ${item.a}
                </div>
            </div>`).join('');
        return `<div class="faq-list">${items}</div>`;
    },

    toggleFAQ: function (i) {
        const answer = document.getElementById(`faq-answer-${i}`);
        const arrow  = document.getElementById(`faq-arrow-${i}`);
        if (!answer) return;
        const open = answer.style.display !== 'none';
        answer.style.display = open ? 'none' : 'block';
        if (arrow) arrow.textContent = open ? '▶' : '▼';
    },

    open: function () {
        this.isOpen = true;
        const overlay = document.getElementById('help-panel-overlay');
        if (overlay) overlay.classList.add('active');
        this.showTab('help');
    },

    close: function () {
        this.isOpen = false;
        const overlay = document.getElementById('help-panel-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    toggle: function () {
        this.isOpen ? this.close() : this.open();
    }
};
console.log('ESTADO: Actualizacion de lo que se esta haciendo')
window.HelpPanel = HelpPanel;
document.addEventListener('DOMContentLoaded', () => HelpPanel.init());