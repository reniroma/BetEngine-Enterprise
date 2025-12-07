document.querySelectorAll('[data-dropdown]').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const menu = toggle.nextElementSibling;
        document.querySelectorAll('.dropdown').forEach(d => {
            if (d !== menu) d.style.display = 'none';
        });
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-dropdown]')) {
        document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
    }
});
