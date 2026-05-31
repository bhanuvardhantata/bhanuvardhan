document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. DYNAMIC COPYRIGHT YEAR
    // ==========================================
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ==========================================
    // THEME TOGGLE (LIGHT / DARK MODE)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');

    // Retrieve saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggleIcon) {
            themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
        }
    }

    if (themeToggleBtn && themeToggleIcon) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            if (isLight) {
                localStorage.setItem('theme', 'light');
                themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                localStorage.setItem('theme', 'dark');
                themeToggleIcon.classList.replace('fa-sun', 'fa-moon');
            }
        });
    }

    // ==========================================
    // 2. MOBILE NAVIGATION DRAWER
    // ==========================================
    const mobileNavBtn = document.getElementById('mobile-nav-btn');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileNavBtn && mainNav) {
        mobileNavBtn.addEventListener('click', () => {
            const expanded = mobileNavBtn.getAttribute('aria-expanded') === 'true';
            mobileNavBtn.setAttribute('aria-expanded', !expanded);
            mainNav.classList.toggle('active');
            
            // Toggle hamburger icon between bars and times (close)
            const icon = mobileNavBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });

        // Close drawer when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavBtn.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('active');
                const icon = mobileNavBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark');
                }
            });
        });
    }

    // ==========================================
    // 3. SCROLL PROGRESS & SHRINKING HEADER
    // ==========================================
    const header = document.getElementById('main-header');
    const progressBar = document.getElementById('scroll-progress-bar');
    const scrollDistanceThreshold = 50;

    const handleScrollEffects = () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Update Scroll Progress Bar
        if (progressBar && docHeight > 0) {
            const scrollPercent = (scrollY / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        }

        // Shrinking header class toggle
        if (header) {
            if (scrollY > scrollDistanceThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };

    window.addEventListener('scroll', handleScrollEffects, { passive: true });
    // Initial run to capture correct state on load
    handleScrollEffects();

    // ==========================================
    // 4. INTERACTIVE BACKGROUND (CANVAS PARTICLES)
    // ==========================================
    const canvas = document.getElementById('bg-canvas');
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const mouse = {
            x: null,
            y: null,
            radius: 120
        };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        }, { passive: true });

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }, { passive: true });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2.5 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = Math.random() * 20 + 2;
                
                // Color gradient (Salesforce blue vs Agentforce violet)
                const isSfBlue = Math.random() > 0.35;
                this.color = isSfBlue ? 'rgba(1, 118, 211, 0.25)' : 'rgba(124, 58, 237, 0.18)';
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // If mouse position is defined, interact
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;

                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = forceDirectionX * force * this.density * 0.7;
                        let directionY = forceDirectionY * force * this.density * 0.7;
                        
                        // Push away from mouse
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        // Slowly return to base coordinate
                        if (this.x !== this.baseX) {
                            let dxBase = this.x - this.baseX;
                            this.x -= dxBase / 15;
                        }
                        if (this.y !== this.baseY) {
                            let dyBase = this.y - this.baseY;
                            this.y -= dyBase / 15;
                        }
                    }
                } else {
                    // Slowly drift back to base coordinate
                    if (this.x !== this.baseX) {
                        let dxBase = this.x - this.baseX;
                        this.x -= dxBase / 20;
                    }
                    if (this.y !== this.baseY) {
                        let dyBase = this.y - this.baseY;
                        this.y -= dyBase / 20;
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            const count = Math.min(60, Math.floor((width * height) / 25000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Render connections if close
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 100) {
                        const alpha = (100 - dist) / 100 * 0.08;
                        ctx.strokeStyle = `rgba(1, 118, 211, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            animationFrameId = requestAnimationFrame(animateParticles);
        };

        // Initialize and animate
        initParticles();
        animateParticles();

        // Optimized execution: stop loop when tab is hidden to save resources
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animateParticles();
            }
        });
    }

    // ==========================================
    // 5. SCROLL ENTRANCE INTERSECTION OBSERVER
    // ==========================================
    const fadeElements = document.querySelectorAll('.fade-in-up');
    
    // Observer for fade-in animations
    const entryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entryObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => entryObserver.observe(el));

    // ==========================================
    // 6. CERTIFICATIONS LIVE GRID FILTERING
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const certCards = document.querySelectorAll('.cert-card');
    const certsGrid = document.getElementById('certs-grid');

    if (filterButtons.length && certCards.length) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button classes
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                // Apply opacity and transform before hiding/showing for nice visuals
                certCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'flex';
                        // Small timeout to allow browser layout calculation before opacity transition
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(15px) scale(0.95)';
                        // Wait for transition to finish before display: none
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ==========================================
    // 7. SECURE INTERACTIVE CONTACT FORM
    // ==========================================
    const contactForm = document.getElementById('portfolio-contact-form');
    const formStatus = document.getElementById('form-feedback-status');
    const submitBtn = document.getElementById('form-submit-btn');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Check form validity using HTML5 API
            if (!contactForm.checkValidity()) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please make sure all fields are correctly filled.';
                
                // Trigger native browser invalid alerts visually
                contactForm.reportValidity();
                return;
            }

            // Disable submit button and show loading sequence
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending Message... <i class="fa-solid fa-circle-notch fa-spin"></i>';
            formStatus.style.display = 'none';

            // Extract inputs safely (resilient to simple injection)
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();

            // Simulate server POST with delay
            setTimeout(() => {
                // Mock successful delivery
                formStatus.className = 'form-status success';
                formStatus.textContent = `Thank you, ${name}! Your message has been successfully received. Bhanu will review your request and get back to you at ${email} shortly.`;
                
                // Clear the form
                contactForm.reset();
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                
                // Scroll slightly to let the status be fully visible
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1800);
        });
    }
});
