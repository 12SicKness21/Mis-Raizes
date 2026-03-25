const galleryData = [
    { src: 'img/platos/plato1.avif', name: 'Laura Cs' },
    { src: 'img/platos/plato2.webp', name: 'Rolando Dias' },
    { src: 'img/platos/plato3.webp', name: 'Rolando Dias' },
    { src: 'img/platos/plato4.avif', name: 'Rolando Dias' },
    { src: 'img/platos/plato5.webp', name: 'Nelson Marín' },
    { src: 'img/platos/plato6.avif', name: 'Naomi Quiroga' },
    { src: 'img/platos/plato7.avif', name: 'Israel Vargas Ledezma' },
    { src: 'img/platos/plato8.avif', name: 'sam de nully' },
    { src: 'img/platos/plato9.avif', name: 'Danna Canales' }
];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('gallery-container');
    const dotsContainer = document.getElementById('gallery-dots');

    if (!container) return;

    let html = '';
    let dotsHtml = '';

    galleryData.forEach((item, index) => {
        html += `
            <div class="flex-none w-[80vw] md:w-96 snap-center group relative overflow-hidden rounded-2xl border border-primary/10 transition-all duration-500 hover:border-primary/40 cursor-grab active:cursor-grabbing select-none">
                <img src="${item.src}" alt="Sabor Peruano ${index + 1}" class="w-full h-[400px] md:h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700 pointer-events-none">
                <div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 pointer-events-none">
                    <span class="text-primary font-black uppercase tracking-widest italic">${item.name}</span>
                </div>
            </div>
        `;

        dotsHtml += `
            <button class="gallery-dot w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-primary/20'} hover:bg-primary/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50" data-index="${index}" aria-label="Ir a foto ${index + 1}"></button>
        `;
    });

    container.innerHTML = html;
    if (dotsContainer) dotsContainer.innerHTML = dotsHtml;

    // Lógica para arrastre manual en escritorio (drag to scroll)
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.remove('snap-x'); // Desactiva temporalmente el snap para un scroll más fluido
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.add('snap-x');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.add('snap-x');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // multiplicador de velocidad de scroll
        container.scrollLeft = scrollLeft - walk;
    });

    // Observador para actualizar los puntos (dots)
    const items = container.querySelectorAll('.flex-none');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.gallery-dot') : [];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(items).indexOf(entry.target);
                updateDots(index);
            }
        });
    }, {
        root: container,
        threshold: 0.5 
    });

    items.forEach(item => observer.observe(item));

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            const item = items[index];
            if (item) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    });

    function updateDots(activeIndex) {
        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.remove('bg-primary/20', 'hover:bg-primary/50');
                dot.classList.add('bg-primary');
            } else {
                dot.classList.remove('bg-primary');
                dot.classList.add('bg-primary/20', 'hover:bg-primary/50');
            }
        });
    }
});
