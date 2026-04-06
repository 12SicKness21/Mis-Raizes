/**
 * miercoles.js — Overlay de cierre los miércoles
 * Detecta si el día es miércoles y muestra una pantalla completa con el vídeo.
 * El vídeo NO se reproduce automáticamente (política de navegadores),
 * sino que requiere un clic del usuario para arrancarse CON sonido.
 */

(function () {
  'use strict';

  // ── 1. Comprobar si es miércoles (día 3 en JS: 0=Dom, 1=Lun... 3=Mié) ──
  const hoy = new Date().getDay();
  if (hoy !== 3) return; // Si no es miércoles, no hacemos nada

  // ── 2. Estilos del overlay ──
  const style = document.createElement('style');
  style.textContent = `
    #mr-miercoles-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #0a0a08;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      overflow: hidden;
    }

    /* Fondo con degradado sutil */
    #mr-miercoles-overlay::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(249,212,6,0.06) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Contenedor del vídeo */
    #mr-video-wrapper {
      position: relative;
      width: 100%;
      max-width: 420px;
      max-height: 70vh;
      aspect-ratio: 9/16;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 0 60px rgba(249,212,6,0.12), 0 24px 60px rgba(0,0,0,0.7);
      margin: 0 16px;
      flex-shrink: 0;
    }

    #mr-video-wrapper video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Botón de play centrado sobre el vídeo */
    #mr-play-btn {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(10,10,8,0.45);
      cursor: pointer;
      border: none;
      transition: background 0.3s;
      gap: 12px;
    }

    #mr-play-btn:hover {
      background: rgba(10,10,8,0.25);
    }

    #mr-play-icon {
      width: 72px;
      height: 72px;
      background: #f9d406;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 12px rgba(249,212,6,0.18), 0 8px 32px rgba(249,212,6,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      flex-shrink: 0;
    }

    #mr-play-btn:hover #mr-play-icon {
      transform: scale(1.1);
      box-shadow: 0 0 0 18px rgba(249,212,6,0.14), 0 12px 40px rgba(249,212,6,0.5);
    }

    #mr-play-icon svg {
      width: 30px;
      height: 30px;
      fill: #0a0a08;
      margin-left: 4px; /* óptico para el triángulo */
    }

    #mr-play-label {
      font-family: 'Work Sans', 'Manrope', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.85);
    }

    /* Texto informativo debajo del vídeo */
    #mr-info {
      text-align: center;
      padding: 24px 16px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    #mr-info-title {
      font-family: 'Work Sans', 'Manrope', sans-serif;
      font-size: clamp(18px, 4vw, 26px);
      font-weight: 900;
      color: #f9d406;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      line-height: 1.1;
    }

    #mr-info-sub {
      font-family: 'Work Sans', 'Manrope', sans-serif;
      font-size: clamp(12px, 2.5vw, 15px);
      color: rgba(255,255,255,0.55);
      font-weight: 500;
      letter-spacing: 0.06em;
    }

    #mr-info-phone {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-family: 'Work Sans', 'Manrope', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #f9d406;
      text-decoration: none;
      letter-spacing: 0.04em;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    #mr-info-phone:hover { opacity: 1; }

    /* Logo arriba */
    #mr-logo {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      height: 48px;
      width: auto;
      object-fit: contain;
      opacity: 0.9;
      pointer-events: none;
    }

    /* Animación entrada */
    @keyframes mr-fadein {
      from { opacity: 0; transform: scale(1.03); }
      to   { opacity: 1; transform: scale(1); }
    }
    #mr-miercoles-overlay {
      animation: mr-fadein 0.6s ease forwards;
    }
  `;
  document.head.appendChild(style);

  // ── 3. Construir el overlay ──
  const overlay = document.createElement('div');
  overlay.id = 'mr-miercoles-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Cerrado por descanso semanal');

  overlay.innerHTML = `
    <img id="mr-logo" src="img/Logo.webp" alt="Mis Raízes" onerror="this.style.display='none'">

    <div id="mr-video-wrapper">
      <video
        id="mr-video"
        src="video/miercoles-cerrado.mp4"
        playsinline
        preload="metadata"
        style="background:#000;"
      ></video>

      <button id="mr-play-btn" aria-label="Reproducir vídeo">
        <div id="mr-play-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <span id="mr-play-label">Reproducir</span>
      </button>
    </div>

    <div id="mr-info">
      <p id="mr-info-title">Hoy descansamos 🙌</p>
      <p id="mr-info-sub">Los miércoles cerramos. Volvemos el jueves.</p>
      <a id="mr-info-phone" href="tel:+34635382559">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02z"/>
        </svg>
        +34 635 38 25 59
      </a>
    </div>
  `;

  // ── 4. Insertar en el body (al inicio para que quede encima de todo) ──
  document.body.insertBefore(overlay, document.body.firstChild);

  // ── 5. Lógica del botón de play ──
  const video = overlay.querySelector('#mr-video');
  const playBtn = overlay.querySelector('#mr-play-btn');

  playBtn.addEventListener('click', function () {
    // Ocultar el botón de play
    playBtn.style.display = 'none';

    // Reproducir con sonido (el clic del usuario lo autoriza)
    video.play().catch(function () {
      // Si igualmente falla (muy raro tras clic), mostrar button de nuevo
      playBtn.style.display = 'flex';
    });
  });

  // Si el vídeo termina, volver a mostrar el play
  video.addEventListener('ended', function () {
    playBtn.style.display = 'flex';
  });

  // Bloquear scroll de la página de fondo
  document.body.style.overflow = 'hidden';

})();
