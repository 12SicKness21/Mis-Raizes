// index-reviews.js
document.addEventListener('DOMContentLoaded', () => {
    const REVIEWS_COLLECTION = 'resenas';

    // Selectors
    const avgBadge = document.getElementById('index-avg-badge');
    const avgText = document.getElementById('index-avg-text');
    const avgStars = document.getElementById('index-avg-stars');
    const totalText = document.getElementById('index-total-text');
    const distributionContainer = document.getElementById('index-distribution');
    const carouselContainer = document.getElementById('index-reviews-carousel');

    if (!carouselContainer) return;

    db.collection(REVIEWS_COLLECTION).orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        if (snapshot.empty) {
            carouselContainer.innerHTML = '<p class="text-slate-400 italic flex items-center justify-center w-full">Aún no hay reseñas registradas.</p>';
            return;
        }

        let totalRating = 0;
        let count = 0;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const reviewsData = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            const rating = Math.min(5, Math.max(1, data.rating || 5));
            totalRating += rating;
            count++;
            distribution[rating] = (distribution[rating] || 0) + 1;

            // Limit to newest 15 reviews for the carousel to not overload
            if (reviewsData.length < 15) {
                reviewsData.push({ ...data, rating });
            }
        });

        const average = count > 0 ? (totalRating / count).toFixed(1) : 0;

        // Update Stats
        if (avgText) avgText.textContent = average;
        if (avgBadge) avgBadge.textContent = `GOOGLE (${average})`;
        if (totalText) totalText.textContent = `${count} RESEÑA${count !== 1 ? 'S' : ''}`;

        // Update Stars
        if (avgStars) {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= average) starsHtml += '<span class="material-symbols-outlined text-2xl">star</span>';
                else if (i - 0.5 <= average) starsHtml += '<span class="material-symbols-outlined text-2xl">star_half</span>';
                else starsHtml += '<span class="material-symbols-outlined opacity-30 text-2xl">star</span>';
            }
            avgStars.innerHTML = starsHtml;
        }

        // Update Distribution
        if (distributionContainer) {
            let distHtml = '';
            for (let stars = 5; stars >= 1; stars--) {
                const starCount = distribution[stars] || 0;
                const percentage = count > 0 ? Math.round((starCount / count) * 100) : 0;
                const bgClass = percentage > 0 ? 'bg-primary' : 'bg-primary/40';
                distHtml += `
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-black text-primary opacity-80 w-6">${stars} <span class="material-symbols-outlined text-[10px] align-middle -mt-0.5">star</span></span>
                        <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div class="rounded-full ${bgClass}" style="width: ${percentage}%;"></div>
                        </div>
                        <span class="text-slate-400 text-[10px] font-black w-8 text-right">${percentage}%</span>
                    </div>
                `;
            }
            distributionContainer.innerHTML = distHtml;
        }

        // Render Carousel
        let carHtml = '';
        reviewsData.forEach(rev => {
            // Utilizamos h-full para que todas las tarjetas se estiren a la máxima altura uniforme dictada por el contenedor flex flex-stretch (items-stretch).
            carHtml += `
                <div class="flex-none w-[80vw] sm:w-[320px] snap-center bg-background-dark border border-primary/20 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/5 transition-all duration-300 group cursor-grab active:cursor-grabbing shadow-lg h-auto min-h-[18rem]">
                    <div class="flex flex-col h-full">    
                        <!-- Top: Avatar & Stars -->
                        <div class="flex items-start justify-between mb-4 shrink-0">
                            <div class="flex items-center gap-3">
                                <div class="flex items-center justify-center rounded-full w-10 h-10 border border-primary/30 bg-primary/10 text-primary shrink-0">
                                    <span class="material-symbols-outlined text-xl">person</span>
                                </div>
                                <h3 class="text-white text-sm font-black uppercase tracking-widest italic truncate max-w-[120px]">${escapeHtml(rev.name || 'Anónimo')}</h3>
                            </div>
                            <div class="flex text-primary gap-0.5 shrink-0">
                                ${Array(5).fill(0).map((_, i) => `<span class="material-symbols-outlined text-sm ${i < rev.rating ? '' : 'opacity-30'}">star</span>`).join('')}
                            </div>
                        </div>
                        <!-- Body: Comment -->
                        <div class="flex-1 overflow-hidden relative flex flex-col">
                            <p class="text-slate-300 text-lg leading-relaxed italic opacity-90 line-clamp-6">
                                "${escapeHtml(rev.comment || '')}"
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });
        carouselContainer.innerHTML = carHtml;

        startAutoScroll(carouselContainer);
    }, (error) => {
        console.error('Error fetching reviews:', error);
    });

    let scrollInterval;
    function startAutoScroll(el) {
        clearInterval(scrollInterval);
        if (!el || el.children.length === 0) return;

        let direction = 1;
        scrollInterval = setInterval(() => {
            if (el.matches(':hover')) return; // pause interaction

            const maxScroll = el.scrollWidth - el.clientWidth;

            // Check boundaries and flip direction if needed
            if (el.scrollLeft >= maxScroll - 5) {
                direction = -1; // scroll back
            } else if (el.scrollLeft <= 5) {
                direction = 1; // forward
            }

            const cardWidth = el.firstElementChild.clientWidth + 24;
            el.scrollBy({ left: cardWidth * direction, behavior: 'smooth' });
        }, 3000); // Avanza cada 3s
    }

    // escapeHtml está disponible globalmente desde firebase-config.js
});
