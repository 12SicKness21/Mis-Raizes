// ============================================
// Cookie Consent Manager
// ============================================

const CONSENT_KEY = 'misraizes_cookie_consent';

document.addEventListener('DOMContentLoaded', () => {
    // Check if consent has already been given
    const consent = localStorage.getItem(CONSENT_KEY);

    // Si ya aceptó analytics previamente (de antes de que implementáramos el banner), o si ha dado explícitamente su consentimiento.
    if (consent === 'all') {
        enableAnalytics();
    } else if (consent === null) {
        // Only show banner if no decision was made
        showCookieBanner();
    }
    // If 'essential', do not enable analytics
});

function showCookieBanner() {
    // Inject CSS for the banner dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .cookie-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #0a0a08;
            border-top: 1px solid rgba(249, 212, 6, 0.3);
            z-index: 9999;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            color: #f1f5f9;
            font-family: 'Work Sans', sans-serif;
            transform: translateY(100%);
            animation: slideUp 0.5s forwards;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
        }
        
        @media (min-width: 768px) {
            .cookie-banner {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                padding: 1.5rem 2rem;
            }
        }
        
        @keyframes slideUp {
            to { transform: translateY(0); }
        }
        
        .cookie-text {
            font-size: 0.875rem;
            flex: 1;
        }
        
        .cookie-text a {
            color: #f9d406;
            text-decoration: underline;
        }

        .cookie-buttons {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .cookie-btn {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .cookie-btn-primary {
            background-color: #f9d406;
            color: #0a0a08;
            border: 1px solid #f9d406;
        }
        
        .cookie-btn-primary:hover {
            opacity: 0.9;
        }
        
        .cookie-btn-secondary {
            background-color: transparent;
            color: #f1f5f9;
            border: 1px solid rgba(249, 212, 6, 0.5);
        }
        
        .cookie-btn-secondary:hover {
            background-color: rgba(249, 212, 6, 0.1);
        }
    `;
    document.head.appendChild(style);

    // Create banner HTML
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'cookie-banner';

    banner.innerHTML = `
        <div class="cookie-text">
            Utilizamos cookies propias y de terceros (Google Analytics) para fines analíticos y para mostrarle publicidad personalizada en base a un perfil elaborado a partir de sus hábitos de navegación.
            Puede aceptar todas las cookies pulsando el botón "Aceptar todas" o rechazarlas pulsando en "Solo esenciales". 
            Más información en nuestra <a href="politica-cookies.html">Política de Cookies</a>.
        </div>
        <div class="cookie-buttons">
            <button class="cookie-btn cookie-btn-secondary" id="cookie-reject-btn">Solo esenciales</button>
            <button class="cookie-btn cookie-btn-primary" id="cookie-accept-btn">Aceptar todas</button>
        </div>
    `;

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('cookie-accept-btn').addEventListener('click', () => {
        setCookieConsent('all');
        enableAnalytics();
        removeBanner();
    });

    document.getElementById('cookie-reject-btn').addEventListener('click', () => {
        setCookieConsent('essential');
        removeBanner();
    });
}

function setCookieConsent(val) {
    localStorage.setItem(CONSENT_KEY, val);
}

function removeBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.style.animation = 'slideDown 0.5s forwards';
        setTimeout(() => banner.remove(), 500);
    }

    // Add slide down animation implicitly via JS since it's not in the injected CSS
    const style = document.createElement('style');
    style.innerHTML = `@keyframes slideDown { to { transform: translateY(100%); } }`;
    document.head.appendChild(style);
}

// Function to enable Google Analytics dynamically
function enableAnalytics() {
    // Only configure analytics if firebase is available
    if (typeof firebase !== 'undefined' && firebase.analytics) {
        // En firebase-config.js, analytics se inicializa. 
        // Por defecto, firebase intenta enviar datos (page_view) al inicializarse.
        // Como solución, configuramos window.dataLayer para consent mode.

        // This notifies Google tags that consent was given
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('consent', 'update', {
            'analytics_storage': 'granted'
        });

        console.log("Analytics enabled via Cookie Consent");
    }
}
