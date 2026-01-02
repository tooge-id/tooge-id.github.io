// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

document.addEventListener('DOMContentLoaded', () => {

    // --- Lenis Anchor Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                lenis.scrollTo(targetId);
            }
        });
    });

    // --- Scroll Spy (Active Nav) ---
    const sections = document.querySelectorAll('section[id], header[id]');
    // Only select internal navigation links to avoid affecting buttons like GitHub
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                // 1. Reset ALL internal nav links to default state
                navLinks.forEach(link => {
                    link.classList.remove('text-brand-green');
                    link.classList.add('text-gray-300');
                });

                // 2. Highlight ALL links causing to this section (Desktop + Mobile)
                const activeLinks = document.querySelectorAll(`nav a[href="#${id}"]`);
                activeLinks.forEach(activeLink => {
                    activeLink.classList.remove('text-gray-300');
                    activeLink.classList.add('text-brand-green');
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Hero Animations ---
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.from('.gsap-hero-title span', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2
    })
        .from('.gsap-hero-subtitle', {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.8')
        .from('.gsap-hero-btn', {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.7)'
        }, '-=0.6');

    // --- Scroll Animations ---

    // Vision Section Fade Up
    gsap.utils.toArray('.gsap-fade-up').forEach(element => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Vision Image Scale Up
    gsap.from('.gsap-scale-up', {
        scrollTrigger: {
            trigger: '.gsap-scale-up',
            start: 'top 80%',
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    // --- Product Cards Animation ---
    ScrollTrigger.batch('.product-card', {
        start: 'top 85%',
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            autoAlpha: 1,
            stagger: 0.15,
            overwrite: true,
            duration: 0.8,
            ease: 'power3.out'
        }),
        onLeave: batch => gsap.set(batch, { opacity: 0, y: 30 }),
        onEnterBack: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, overwrite: true, duration: 0.8, ease: 'power3.out' }),
        onLeaveBack: batch => gsap.set(batch, { opacity: 0, y: 30 })
    });

    gsap.set('.product-card', {
        y: 30,
        opacity: 0
    });


    // --- Particle Canvas Background (Optimized) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
                this.color = `rgba(57, 255, 20, ${Math.random() * 0.2 + 0.1})`; // Neon green
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const count = Math.min((width * height) / 10000, 100);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }
});
