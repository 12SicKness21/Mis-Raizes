// reseñas-public.js

document.addEventListener('DOMContentLoaded', () => {
    const REVIEWS_COLLECTION = 'resenas';
    const reviewsList = document.getElementById('reviews-list');
    const avgRatingText = document.getElementById('avg-rating-text');
    const avgRatingStars = document.getElementById('avg-rating-stars');
    const totalReviewsText = document.getElementById('total-reviews-text');
    const reviewsDistribution = document.getElementById('reviews-distribution');

    function renderStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += `<span class="material-symbols-outlined text-lg fill-1">star</span>`;
            } else if (i - 0.5 <= rating) {
                starsHtml += `<span class="material-symbols-outlined text-lg">star_half</span>`;
            } else {
                starsHtml += `<span class="material-symbols-outlined text-lg opacity-30">star</span>`;
            }
        }
        return starsHtml;
    }

    // Subscribe to reviews collection ordered by createdAt descending (newest first)
    db.collection(REVIEWS_COLLECTION).orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        if (snapshot.empty) {
            reviewsList.innerHTML = `<p class="text-center text-slate-400 italic py-10">No hay reseñas aún. ¡Sé el primero en dejar una!</p>`;
            updateHeaderStats(0, 0, {5:0, 4:0, 3:0, 2:0, 1:0});
            return;
        }

        reviewsList.innerHTML = '';
        let totalRating = 0;
        let count = 0;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        snapshot.forEach((doc) => {
            const data = doc.data();
            const rating = data.rating || 5;
            // Cap rating just in case
            const cappedRating = Math.min(5, Math.max(1, rating)); 
            
            totalRating += cappedRating;
            count++;
            distribution[cappedRating] = (distribution[cappedRating] || 0) + 1;

            // Generate Review Card Html
            const card = document.createElement('div');
            card.className = "flex flex-col gap-4 bg-white/5 p-8 rounded-2xl gold-border hover:bg-white/[0.08] transition-all group";
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center justify-center aspect-square rounded-full size-12 border-2 border-primary/30 bg-primary/10 text-primary">
                            <span class="material-symbols-outlined text-3xl">person</span>
                        </div>
                        <div class="flex flex-col">
                            <p class="text-white text-base font-black uppercase tracking-widest italic">${escapeHtml(data.name || 'Anónimo')}</p>
                        </div>
                    </div>
                    <div class="flex gap-0.5 text-primary">
                        ${renderStars(cappedRating)}
                    </div>
                </div>
                <p class="text-slate-300 text-base leading-relaxed italic opacity-80">
                    "${escapeHtml(data.comment || '')}"
                </p>
            `;
            reviewsList.appendChild(card);
        });

        const average = count > 0 ? (totalRating / count).toFixed(1) : 0;
        updateHeaderStats(average, count, distribution);

    }, (error) => {
        console.error('Error fetching reviews:', error);
        reviewsList.innerHTML = `<p class="text-center text-slate-400 italic py-10">Error cargando las reseñas.</p>`;
    });

    function updateHeaderStats(average, total, distribution) {
        // Update texts
        avgRatingText.textContent = average > 0 ? average : '-.-';
        totalReviewsText.textContent = `${total} RESEÑA${total !== 1 ? 'S' : ''}`;
        
        // Update stars in header
        let headStarsHtml = '';
        const numAverage = parseFloat(average);
        for(let i=1; i<=5; i++) {
            if (i <= numAverage) {
                headStarsHtml += `<span class="material-symbols-outlined fill-1">star</span>`;
            } else if (i - 0.5 <= numAverage) {
                headStarsHtml += `<span class="material-symbols-outlined">star_half</span>`;
            } else {
                headStarsHtml += `<span class="material-symbols-outlined opacity-30">star</span>`;
            }
        }
        avgRatingStars.innerHTML = headStarsHtml;

        // Update distribution bars (5 to 1, or just what they had)
        // In the image, they only showed top 3 counts? Actually let's show 5 to 1.
        let distHtml = '';
        for (let stars = 5; stars >= 1; stars--) {
            const starCount = distribution[stars] || 0;
            const percentage = total > 0 ? Math.round((starCount / total) * 100) : 0;
            
            // Highlight color based on percentage (if 0%, dim it)
            const bgClass = percentage > 0 ? 'bg-primary' : 'bg-primary/40';

            distHtml += `
                <p class="text-[10px] font-black text-primary opacity-70">${stars} <span class="material-symbols-outlined text-[10px] align-middle mb-0.5">star</span></p>
                <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div class="rounded-full ${bgClass}" style="width: ${percentage}%;"></div>
                </div>
                <p class="text-slate-500 text-[10px] font-black text-right">${percentage}%</p>
            `;
        }
        reviewsDistribution.innerHTML = distHtml;
    }

    // escapeHtml está disponible globalmente desde firebase-config.js
});
