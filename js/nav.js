document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    if (hamburgerBtn && sidebar) { // Overlay might not be on every page initially
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            if (overlay) {
                overlay.classList.toggle('open');
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            if (sidebar) {
                sidebar.classList.remove('open');
            }
            overlay.classList.remove('open');
        });
    }
});
