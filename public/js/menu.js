// ============================================
// Mis Raízes - Menu Frontend Logic (Firebase)
// ============================================

// Category icons mapping
const CATEGORY_ICONS = {
    'DESAYUNOS': '☀️',
    'PLATOS CRIOLLOS': '🍽️',
    'COMBOS': '⭐',
    'ENTRADAS': '🥑',
    'POSTRES': '🍰',
    'RACIONES': '🍲',
    'BEBIDAS': '🥛',
    'LICORES': '🍺'
};

function getCategoryIcon(category) {
    const upper = category.toUpperCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
        if (upper.includes(key)) return icon;
    }
    return '🍴';
}

function getCategorySubtitle(category) {
    const upper = category.toUpperCase();
    if (upper.includes('DESAYUNOS')) return 'Servido de 9:00 a 12:00';
    if (upper.includes('CRIOLLOS')) return 'Platos que regresan al Perú';
    if (upper.includes('MARINOS')) return 'Del mar a la mesa';
    if (upper.includes('COMBOS')) return 'Las mejores combinaciones';
    if (upper.includes('ENTRADAS')) return 'Para empezar';
    if (upper.includes('POSTRES')) return 'El broche de oro';
    if (upper.includes('RACIONES')) return 'Acompañamientos';
    if (upper.includes('BEBIDAS')) return 'Refrescantes';
    if (upper.includes('LICORES')) return 'Para brindar';
    return '';
}

function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.', ',');
}

// Load menu from Firestore
async function loadMenu() {
    const content = document.getElementById('menuContent');
    const loading = document.getElementById('loadingState');
    const navScroll = document.getElementById('navScroll');

    try {
        const snapshot = await db.collection('menu').orderBy('orden').get();

        if (snapshot.empty) {
            loading.innerHTML = `
        <p class="loading-text" style="color: var(--gold);">La carta se está preparando...</p>
        <p class="loading-text" style="font-size: 0.7rem;">Vuelve pronto</p>
      `;
            return;
        }

        const categories = [];
        const menu = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const catName = data.nombre;
            categories.push(catName);
            // Only show available items
            menu[catName] = (data.items || []).filter(item => item.disponible !== 'no').map(item => ({
                nombre: item.nombre,
                precio: parseFloat(item.precio) || 0,
                descripcion: item.descripcion || ''
            }));
        });

        if (categories.length === 0) {
            loading.innerHTML = `
        <p class="loading-text" style="color: var(--gold);">La carta se está preparando...</p>
        <p class="loading-text" style="font-size: 0.7rem;">Vuelve pronto</p>
      `;
            return;
        }

        // Build navigation
        const menuBtn = document.createElement('button');
        menuBtn.className = 'nav-btn highlight-gold'; // Added a special class for visibility
        menuBtn.textContent = 'MENÚ DEL DÍA';
        menuBtn.addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
        navScroll.appendChild(menuBtn);

        const allBtn = document.createElement('button');
        allBtn.className = 'nav-btn active';
        allBtn.textContent = 'Todo';
        allBtn.addEventListener('click', () => {
            filterCategory('all');
            setActiveNav(allBtn);
        });
        navScroll.appendChild(allBtn);

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.dataset.category = cat; // Add data attribute for scroll-spy
            btn.textContent = cat.replace(/\(.*\)/, '').trim();
            btn.addEventListener('click', () => {
                filterCategory(cat);
                setActiveNav(btn);
            });
            navScroll.appendChild(btn);
        });

        // Build menu sections
        let html = '';
        categories.forEach(cat => {
            const items = menu[cat];
            if (!items || items.length === 0) return;

            const icon = getCategoryIcon(cat);
            const subtitle = getCategorySubtitle(cat);
            const isCombo = cat.toUpperCase().includes('COMBO');
            const isDesayuno = cat.toUpperCase().includes('DESAYUNO');

            html += `
        <section class="category-section" data-category="${cat}" id="cat-${cat.replace(/\s+/g, '-')}">
          <div class="category-header">
            <span class="category-icon">${icon}</span>
            <div>
              <h2 class="category-title">${cat}</h2>
              ${subtitle ? `<p class="category-subtitle">${subtitle}</p>` : ''}
            </div>
          </div>
          ${isDesayuno ? '<div class="category-note"><span class="icon">☕</span> Café incluido</div>' : ''}
          <div class="menu-items">
      `;

            items.forEach(item => {
                const extraClass = isCombo ? ' combo' : '';
                html += `
          <div class="menu-item${extraClass}">
            <div class="item-info">
              <p class="item-name">${item.nombre}</p>
              ${item.descripcion ? `<p class="item-description">${item.descripcion}</p>` : ''}
            </div>
            ${!isCombo ? '<div class="item-dots"></div>' : ''}
            <span class="item-price">${formatPrice(item.precio)}<span class="euro"> €</span></span>
          </div>
        `;
            });

            html += `</div></section>`;
        });

        loading.style.display = 'none';
        content.insertAdjacentHTML('beforeend', html);

        // Intersection observer for scroll animations
        observeSections();

    } catch (err) {
        console.error('Error loading menu:', err);
        loading.innerHTML = `
      <p class="loading-text" style="color: var(--gold);">No se pudo cargar la carta</p>
      <p class="loading-text" style="font-size: 0.7rem;">Inténtalo de nuevo más tarde</p>
    `;
    }
}

// Filter by category
function filterCategory(cat) {
    const sections = document.querySelectorAll('.category-section');
    sections.forEach(section => {
        if (cat === 'all' || section.dataset.category === cat) {
            section.style.display = '';
            section.classList.add('visible');
        } else {
            section.style.display = 'none';
        }
    });

    if (cat !== 'all') {
        const target = document.querySelector(`[data-category="${cat}"]`);
        if (target) {
            const navHeight = document.getElementById('categoryNav').offsetHeight;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 15;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }
}

function setActiveNav(activeBtn) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Intersection Observer for reveal animations & Scroll-Spy
function observeSections() {
    const navHeight = document.getElementById('categoryNav')?.offsetHeight || 70;

    // Observer for "visible" fade-in animation
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observer for Scroll-Spy (highlighting active nav)
    const spyObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // If the user is at the very top of the page, highlight 'Todo'
                if (window.scrollY < 100) {
                    const allBtn = document.querySelector('.nav-btn:nth-child(2)'); // 'Todo' is the 2nd button
                    if (allBtn) setActiveNav(allBtn);
                    return;
                }

                if (entry.isIntersecting) {
                    const cat = entry.target.dataset.category;
                    const btn = document.querySelector(`.nav-btn[data-category="${cat}"]`);
                    if (btn) {
                        setActiveNav(btn);
                        // Auto-scroll the nav bar to center the active button
                        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                }
            });
        },
        // Trigger when the section reaches the sticky nav bottom
        { threshold: 0, rootMargin: `-${navHeight + 20}px 0px -70% 0px` }
    );

    document.querySelectorAll('.category-section').forEach(section => {
        revealObserver.observe(section);
        spyObserver.observe(section);
    });
}

// Scroll to top button
function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Sticky nav shadow
function initNavShadow() {
    const nav = document.getElementById('categoryNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// === Weekly Menu Modal Logic ===
function showWeeklyModal() {
    const modal = document.getElementById('weeklyModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scroll
    loadWeeklyModalData();
}

function closeWeeklyModal() {
    const modal = document.getElementById('weeklyModal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scroll
}

async function loadWeeklyModalData() {
    // Dynamic loading removed, displaying static image only
}

// Close modal when clicking outside content
window.addEventListener('click', (e) => {
    const modal = document.getElementById('weeklyModal');
    if (e.target === modal) {
        closeWeeklyModal();
    }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    initScrollTop();
    initNavShadow();
});
