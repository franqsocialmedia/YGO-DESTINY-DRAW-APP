document.addEventListener('DOMContentLoaded', () => {

    const scrollTopBtn    = document.getElementById('scrollTopBtn');
    const scrollBottomBtn = document.getElementById('scrollBottomBtn');

    if (!scrollTopBtn || !scrollBottomBtn) return;

    const updateButtons = () => {
    const inSim = window.Navigation?.currentTab === 'simuladores';
    if (inSim) {
        scrollTopBtn.style.display    = 'none';
        scrollBottomBtn.style.display = 'none';
        return;
    }
    const scrolled  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollTopBtn.style.display    = scrolled > 300 ? 'block' : 'none';
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