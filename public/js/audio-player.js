/**
 * Audio Player for Mis Raíces
 * Manages persistent background music across pages with autoplay support.
 */

(function () {
    const AUDIO_SRC = 'audio/Canción_Perú.m4a';
    const STORAGE_KEY_TIME = 'mis_raizes_audio_time';
    const STORAGE_KEY_PLAYING = 'mis_raizes_audio_playing';

    let audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.5;

    // Create UI elements
    const controlContainer = document.createElement('div');
    controlContainer.id = 'audio-control-container';
    controlContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(10, 10, 8, 0.8);
        backdrop-filter: blur(8px);
        padding: 12px;
        border-radius: 50%;
        border: 1px solid rgba(249, 212, 6, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        transition: all 0.3s ease;
        cursor: pointer;
        user-select: none;
    `;

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.innerText = 'music_note';
    icon.style.color = '#f9d406';
    icon.style.fontSize = '24px';

    controlContainer.appendChild(icon);
    document.body.appendChild(controlContainer);

    // Initial state from localStorage
    const savedTime = localStorage.getItem(STORAGE_KEY_TIME);
    const isPlaying = localStorage.getItem(STORAGE_KEY_PLAYING) !== 'false'; // Default to true

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    function updateUI(playing) {
        icon.innerText = playing ? 'pause' : 'play_arrow';
        controlContainer.style.borderColor = playing ? 'rgba(249, 212, 6, 0.8)' : 'rgba(249, 212, 6, 0.3)';
    }

    function playAudio() {
        audio.play().then(() => {
            updateUI(true);
            localStorage.setItem(STORAGE_KEY_PLAYING, 'true');
        }).catch(err => {
            console.log("Autoplay blocked, waiting for interaction.");
            updateUI(false);

            // Fallback: Start on first user interaction anywhere
            const startOnInteraction = () => {
                audio.play().then(() => {
                    updateUI(true);
                    localStorage.setItem(STORAGE_KEY_PLAYING, 'true');
                    document.removeEventListener('click', startOnInteraction);
                    document.removeEventListener('touchstart', startOnInteraction);
                }).catch(e => console.log("Play failed on interaction", e));
            };
            document.addEventListener('click', startOnInteraction);
            document.addEventListener('touchstart', startOnInteraction);
        });
    }

    function toggleAudio(e) {
        if (e) e.stopPropagation();
        if (audio.paused) {
            playAudio();
        } else {
            audio.pause();
            localStorage.setItem(STORAGE_KEY_PLAYING, 'false');
            updateUI(false);
        }
    }

    controlContainer.addEventListener('click', toggleAudio);

    // Persistence logic
    setInterval(() => {
        if (!audio.paused) {
            localStorage.setItem(STORAGE_KEY_TIME, audio.currentTime);
        }
    }, 1000);

    // Auto-start logic
    if (isPlaying) {
        playAudio();
    } else {
        updateUI(false);
    }

    // Handle visibility change to save time
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            localStorage.setItem(STORAGE_KEY_TIME, audio.currentTime);
        }
    });
})();
