document.addEventListener('DOMContentLoaded', () => {

    const scrollTopBtn    = document.getElementById('scrollTopBtn');
    const scrollBottomBtn = document.getElementById('scrollBottomBtn');

    if (!scrollTopBtn || !scrollBottomBtn) return;

    const updateButtons = () => {
        const scrolled  = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        // Top: visible si scrolled > 300
        scrollTopBtn.style.display = scrolled > 300 ? 'block' : 'none';

        // Bottom: visible si no estamos al fondo (margen 50px)
        scrollBottomBtn.style.display = scrolled < maxScroll - 50 ? 'block' : 'none';
    };

    window.addEventListener('scroll', updateButtons);
    updateButtons(); // estado inicial

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    scrollBottomBtn.addEventListener('click', () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    });
});