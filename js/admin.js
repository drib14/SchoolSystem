document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');

    if (userRole !== 'admin') {
        window.location.href = 'index.html';
    }

    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userRole');
            window.location.href = 'index.html';
        });
    }
});
