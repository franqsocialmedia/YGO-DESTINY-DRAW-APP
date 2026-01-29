// ================================================================
// MIDECK.JS - Destiny Draw Yugioh
// Módulo: Pestaña MI DECK
// ================================================================

console.log('mideck.js loaded');

function renderMiDeckSection() {
    const section = document.getElementById('library');
    section.innerHTML = `
        <h2 class="text-2xl mb-4">Mi Deck - EN DESARROLLO</h2>
        <p>Este módulo está en desarrollo. Funcionalidad completa próximamente.</p>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    renderMiDeckSection();
});

console.log('mideck.js loaded');
