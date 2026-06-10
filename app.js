/* ==========================================================================
   TOPSHAM TECH - 3D SCROLL ANIMATION & STYLES ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Config
    const totalFrames = 240;
    const canvas = document.getElementById('animation-canvas');
    const ctx = canvas.getContext('2d');
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('loader-progress');
    const loaderPercentage = document.getElementById('loader-percentage');
    const loaderSubtext = document.getElementById('loader-subtext');
    const scrollSection = document.querySelector('.scroll-section');
    
    // Status text templates for cybernetic loading vibe
    const loadingStatuses = [
        { pct: 0, text: "CONNECTING TO TOPSHAM TECH HOLOGRAPHIC STORAGE..." },
        { pct: 15, text: "ALLOCATING GPU FRAME BUFFERS..." },
        { pct: 35, text: "CACHING 3D ASSETS & GLASSMORPHIC COMPONENT SHADERS..." },
        { pct: 55, text: "TUNING INTERACTIVE SCROLL-LINK COEFFICIENTS..." },
        { pct: 75, text: "ESTABLISHING ENCRYPTED LOCAL IT SUPPORT MATRIX..." },
        { pct: 92, text: "SYNCHRONIZING SYSTEM CLOCKS & INITIATING SCANLINES..." },
        { pct: 100, text: "SYSTEM COMPLETED. INJECTING HOLOGRAM ENGINE..." }
    ];

    // Image buffer cache
    const images = [];
    let loadedCount = 0;
    let imagesPreloaded = false;

    // Scroll state tracking
    let targetFrame = 1;
    let currentFrame = 1;
    const ease = 0.15; // Smooth scroll trailing index (0.1 - 0.2 is sweet spot)

    // Text Overlays positioning mapping
    const overlays = [
        {
            element: document.getElementById('overlay-intro'),
            calcOpacity: (p) => {
                // Intro text fades out by 10% scroll progress
                if (p < 0.1) return 1 - (p / 0.1);
                return 0;
            }
        },
        {
            element: document.getElementById('overlay-story-1'),
            calcOpacity: (p) => {
                // Story 1: active 18% - 28%
                if (p >= 0.12 && p < 0.18) return (p - 0.12) / 0.06;
                if (p >= 0.18 && p < 0.28) return 1;
                if (p >= 0.28 && p < 0.34) return 1 - (p - 0.28) / 0.06;
                return 0;
            }
        },
        {
            element: document.getElementById('overlay-story-2'),
            calcOpacity: (p) => {
                // Story 2: active 45% - 55%
                if (p >= 0.38 && p < 0.44) return (p - 0.38) / 0.06;
                if (p >= 0.44 && p < 0.54) return 1;
                if (p >= 0.54 && p < 0.60) return 1 - (p - 0.54) / 0.06;
                return 0;
            }
        },
        {
            element: document.getElementById('overlay-story-3'),
            calcOpacity: (p) => {
                // Story 3: active 70% - 80%
                if (p >= 0.64 && p < 0.70) return (p - 0.64) / 0.06;
                if (p >= 0.70 && p < 0.80) return 1;
                if (p >= 0.80 && p < 0.86) return 1 - (p - 0.80) / 0.06;
                return 0;
            }
        }
    ];

    // Get exact file path for a frame index (1 to 240)
    function getFramePath(index) {
        const paddedIndex = index.toString().padStart(3, '0');
        return `images/animation/ezgif-frame-${paddedIndex}.jpg`;
    }

    // Preload all 240 images
    function preloadImages() {
        return new Promise((resolve) => {
            // Load the first frame immediately so we have it rendered
            const firstImg = new Image();
            firstImg.src = getFramePath(1);
            firstImg.onload = () => {
                images[1] = firstImg;
                drawFrame(1); // Draw frame 1 instantly behind the preloader
            };

            for (let i = 1; i <= totalFrames; i++) {
                const img = new Image();
                img.src = getFramePath(i);
                
                img.onload = () => {
                    images[i] = img;
                    onFrameLoaded(resolve);
                };

                img.onerror = () => {
                    console.warn(`Failed to load frame ${i}, substituting fallback...`);
                    // Create an empty dummy image or copy of frame 1 to avoid broken frame loop
                    images[i] = images[1] || img;
                    onFrameLoaded(resolve);
                };
            }
        });
    }

    function onFrameLoaded(resolve) {
        loadedCount++;
        const pct = Math.floor((loadedCount / totalFrames) * 100);
        
        // Update loader progress bar & percentage UI
        progressBar.style.width = `${pct}%`;
        loaderPercentage.textContent = `${pct}%`;
        
        // Update cybernetic terminal message
        let currentStatus = loadingStatuses[0].text;
        for (let status of loadingStatuses) {
            if (pct >= status.pct) {
                currentStatus = status.text;
            }
        }
        loaderSubtext.textContent = `${currentStatus} [${loadedCount}/${totalFrames}]`;

        if (loadedCount === totalFrames) {
            imagesPreloaded = true;
            resolve();
        }
    }

    // Draw single frame on canvas
    function drawFrame(index) {
        const img = images[index];
        if (!img) return;
        
        // Canvas sized at 1920x1080. Since we use CSS object-fit: cover on the canvas,
        // we can simply draw the image directly at native size.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    // Math clamp function
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    // Update overlay opacities and smooth translations
    function updateOverlays(progress) {
        overlays.forEach(overlay => {
            const opacity = overlay.calcOpacity(progress);
            overlay.element.style.opacity = opacity;
            
            // Adjust pointer events & classes
            if (opacity > 0.01) {
                overlay.element.classList.add('active');
                
                // Add vertical shift for subtle parallax transition
                const translateShift = (1 - opacity) * 30; // 30px translation range
                if (overlay.element.id === 'overlay-intro') {
                    overlay.element.style.transform = `translate(-50%, calc(-50% - ${translateShift}px))`;
                } else {
                    overlay.element.style.transform = `translateY(${translateShift}px)`;
                }
            } else {
                overlay.element.classList.remove('active');
            }
        });
    }

    // Handle scroll calculation
    function handleScroll() {
        if (!imagesPreloaded) return;

        const rect = scrollSection.getBoundingClientRect();
        const sectionTop = scrollSection.offsetTop;
        const sectionHeight = scrollSection.offsetHeight;
        
        // Available scroll range for the animation
        const scrollRange = sectionHeight - window.innerHeight;
        
        // Calculate current progress relative to when scroll container enters viewport
        const relativeScroll = window.scrollY - sectionTop;
        const progress = clamp(relativeScroll / scrollRange, 0, 1);
        
        // Map progress to target frame index (1 to 240)
        targetFrame = Math.floor(progress * (totalFrames - 1)) + 1;
        
        // Update the textual layers
        updateOverlays(progress);
    }

    // Smooth animation rendering loop (Lerping)
    function renderLoop() {
        if (imagesPreloaded) {
            // Smoothly interpolate current frame to target frame
            const diff = targetFrame - currentFrame;
            
            if (Math.abs(diff) > 0.05) {
                currentFrame += diff * ease;
                drawFrame(Math.round(currentFrame));
            } else if (Math.round(currentFrame) !== Math.round(targetFrame)) {
                currentFrame = targetFrame;
                drawFrame(Math.round(currentFrame));
            }
        }
        requestAnimationFrame(renderLoop);
    }

    // Initialize Page
    async function init() {
        // Start preloading images
        await preloadImages();
        
        // Hide preloader overlay with fade transition
        loader.classList.add('fade-out');
        canvas.classList.add('ready');
        
        // Initial draw and trigger initial scroll position assessment
        handleScroll();
        drawFrame(1);
        
        // Add scroll and resize listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        
        // Start the requestAnimationFrame draw loop
        requestAnimationFrame(renderLoop);
    }

    // Start
    init();
});
