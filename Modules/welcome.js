/* ====================================
   WELCOME MODULE
   Destiny Draw - Yu-Gi-Oh! App
   Pantalla de bienvenida con selección de perfil
   ==================================== */

const Welcome = {

    audio: null,
    shown: false,
    dismissed: false,

init: function () {
    if (Welcome.dismissed) return;
    this.createPanel();
    
},
    createPanel: function () {
        const overlay = document.createElement('div');
        overlay.id = 'welcome-overlay';
        overlay.innerHTML = `
            <div class="welcome-panel">

                <div class="welcome-logo-wrap">
                    <img src="img/LOGO - Destiny Draw Yugioh APP.png"
                         alt="Destiny Draw"
                         class="welcome-logo"
                         onerror="this.style.display='none'; document.getElementById('welcome-title-fallback').style.display='block';">
                    <h1 id="welcome-title-fallback" class="welcome-title-fallback" style="display:none;">
                        ✦ Destiny Draw ✦
                    </h1>
                </div>

                <p class="welcome-subtitle">Tu compañero estratégico para Yu-Gi-Oh!</p>
                <p class="welcome-desc">
                    Busca cartas, construye tu deck, analiza el meta y lleva tu juego al siguiente nivel.
                    ¿Cómo describes tu experiencia?
                </p>

                <div class="welcome-buttons">

                    <button class="welcome-btn welcome-btn-novato"
                        onclick="Welcome.enter('formacion', 'ots/Climax Theme 5.mp3')">
                    <span class="wb-icon">🌱</span>
                    <span class="wb-label">Novato</span>
                    <span class="wb-desc">Aprende las bases del juego y la app</span>
                </button>

                <button class="welcome-btn welcome-btn-casual"
                        onclick="Welcome.enter('mideck', 'ots/Climax Theme 5.mp3')">
                    <span class="wb-icon">🃏</span>
                    <span class="wb-label">Casual</span>
                    <span class="wb-desc">Construye decks y juega por diversión</span>
                </button>

                <button class="welcome-btn welcome-btn-competitivo"
                        onclick="Welcome.enter('buscador', 'ots/Climax Theme 5.mp3')">
                    <span class="wb-icon">⚔️</span>
                    <span class="wb-label">Competitivo</span>
                    <span class="wb-desc">Analiza el meta y optimiza tu estrategia</span>
                </button>

                </div>

               <button class="welcome-skip" onclick="Welcome.enter('buscador', 'ots/Climax Theme 5.mp3')">
                    Entrar sin seleccionar
                </button>

                <div class="welcome-music-ctrl">
                    <button onclick="Welcome.toggleMusic()" id="welcome-music-btn" title="Silenciar/Activar música">
                        🔊
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        // Animación de entrada con pequeño delay
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add('welcome-visible');
            });
        });
    },


    toggleMusic: function () {
        const btn = document.getElementById('welcome-music-btn');
        if (!this.audio) return;
        if (this.audio.paused) {
            this.audio.play().catch(() => {});
            if (btn) btn.textContent = '🔊';
        } else {
            this.audio.pause();
            if (btn) btn.textContent = '🔇';
        }
    },
enter: function (tabName, musicPath) {
    this.startMusic(musicPath);
    this.dismiss();
    if (window.Navigation) Navigation.showTab(tabName);
},

startMusic: function (path) {
    // Si ya hay música sonando del mismo path, no reiniciar
    if (this.audio && !this.audio.paused && this.audio._path === path) return;
    // Detener la anterior si era distinta
    if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
    try {
        this.audio = new Audio(path);
        this.audio._path = path;
        this.audio.loop   = true;
        this.audio.volume = 0.40;
        this.audio.play().catch(() => {});
    } catch (_) {}
},

stopMusic: function () {
    if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio = null;
    }
},

dismiss: function () {
    Welcome.dismissed = true;
    // NO se llama stopMusic — la música sigue sonando

    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;

    overlay.classList.remove('welcome-visible');
    overlay.classList.add('welcome-hiding');

    setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 500);
},
};

window.Welcome = Welcome;
//document.addEventListener('DOMContentLoaded', () => Welcome.init());
