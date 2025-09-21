// Ultra Modern Engagement Invitation App with Advanced Animations

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

class UltraModernEngagementApp {
  private openingScreen: HTMLElement | null;
  private mainContainer: HTMLElement | null;
  private navTabs: NodeListOf<HTMLElement>;
  private tabPanels: NodeListOf<HTMLElement>;
  private countdownTimer: number | null = null;
  private targetDate: Date;
  private particles: Particle[] = [];
  private animationFrame: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private previousCountdownValues: { [key: string]: string } = {};
  private intersectionObserver: IntersectionObserver | null = null;

  constructor() {
    this.openingScreen = document.getElementById('openingScreen');
    this.mainContainer = document.getElementById('mainContainer');
    this.navTabs = document.querySelectorAll('.nav-tab');
    this.tabPanels = document.querySelectorAll('.tab-panel');
    
    // Set target date to October 12th, 2025 at 11:00 AM
    this.targetDate = new Date('2025-10-12T11:00:00');
    
    this.init();
  }

  private init(): void {
    this.setupOpeningAnimation();
    this.setupNavigation();
    this.setupCountdown();
    this.createParticleSystem();
    this.addFloatingHearts();
    this.setupIntersectionObserver();
    this.setupMouseTracking();
    this.preloadAnimations();
  }

  private setupOpeningAnimation(): void {
    if (!this.openingScreen) return;

    // Enhanced opening animation with multiple stages
    const hearts = this.openingScreen.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
      const element = heart as HTMLElement;
      element.style.animationDelay = `${index * 0.3}s`;
      element.style.animation = 'heartMagic 2s ease-in-out infinite';
    });

    // Remove opening screen with advanced transition
    setTimeout(() => {
      if (this.openingScreen) {
        this.openingScreen.style.animation = 'screenDissolve 1s ease-in-out forwards';
        setTimeout(() => {
          if (this.openingScreen) {
            this.openingScreen.style.display = 'none';
          }
        }, 1000);
      }
    }, 3000);
  }

  private setupNavigation(): void {
    this.navTabs.forEach((tab, index) => {
      // Enhanced click handler
      tab.addEventListener('click', () => {
        this.switchTab(index);
        this.addTabClickEffect(tab);
      });

      // Enhanced keyboard navigation
      tab.addEventListener('keydown', (e: KeyboardEvent) => {
        this.handleKeyboardNavigation(e, index);
      });

      // Mouse enter/leave effects
      tab.addEventListener('mouseenter', () => {
        this.addTabHoverEffect(tab);
      });

      tab.addEventListener('mouseleave', () => {
        this.removeTabHoverEffect(tab);
      });
    });
  }

  private handleKeyboardNavigation(e: KeyboardEvent, currentIndex: number): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.switchTab(currentIndex);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % this.navTabs.length;
      this.switchTab(nextIndex);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + this.navTabs.length) % this.navTabs.length;
      this.switchTab(prevIndex);
    }
  }

  private switchTab(activeIndex: number): void {
    // Staggered animation for tab switching
    this.navTabs.forEach((tab, index) => {
      const isActive = index === activeIndex;
      
      setTimeout(() => {
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        
        if (isActive) {
          tab.focus();
        }
      }, index * 50); // Staggered timing
    });

    // Animated panel transition
    this.tabPanels.forEach((panel, index) => {
      const isActive = index === activeIndex;
      
      if (!isActive && panel.classList.contains('active')) {
        // Fade out current panel
        panel.style.animation = 'panelFadeOut 0.3s ease-out forwards';
        setTimeout(() => {
          panel.classList.remove('active');
          panel.style.animation = '';
        }, 300);
      }
    });

    // Fade in new panel with delay
    setTimeout(() => {
      const activePanel = this.tabPanels[activeIndex];
      if (activePanel) {
        activePanel.classList.add('active');
        activePanel.style.animation = 'panelSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Smooth scroll to content
        activePanel.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 150);
  }

  private addTabClickEffect(tab: HTMLElement): void {
    // Ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;
    
    const rect = tab.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.marginLeft = ripple.style.marginTop = -(size / 2) + 'px';
    
    tab.style.position = 'relative';
    tab.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  private addTabHoverEffect(tab: HTMLElement): void {
    const icon = tab.querySelector('.tab-icon') as HTMLElement;
    if (icon) {
      icon.style.transform = 'scale(1.2) rotate(10deg)';
      icon.style.filter = 'drop-shadow(0 4px 8px rgba(255, 255, 255, 0.3))';
    }
  }

  private removeTabHoverEffect(tab: HTMLElement): void {
    const icon = tab.querySelector('.tab-icon') as HTMLElement;
    if (icon && !tab.classList.contains('active')) {
      icon.style.transform = '';
      icon.style.filter = '';
    }
  }

  private createParticleSystem(): void {
    // Create canvas for particles
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    if (!this.ctx) return;
    
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    
    this.canvas.className = 'particle-canvas';
    document.body.appendChild(this.canvas);
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Initialize particles
    this.createParticles();
    this.animateParticles();
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private createParticles(): void {
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 2 - 0.5,
        life: 0,
        maxLife: Math.random() * 300 + 200,
        size: Math.random() * 3 + 1,
        hue: Math.random() * 60 + 200 // Blue to purple range
      });
    }
  }

  private animateParticles(): void {
    if (!this.ctx || !this.canvas) return;
    
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    this.particles.forEach((particle, index) => {
      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;
      
      // Mouse interaction
      const dx = this.mouseX - particle.x;
      const dy = this.mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx += (dx / distance) * force * 0.1;
        particle.vy += (dy / distance) * force * 0.1;
      }
      
      // Reset particle if it's off screen or expired
      if (particle.y < -10 || particle.x < -10 || particle.x > canvasWidth + 10 || particle.life > particle.maxLife) {
        particle.x = Math.random() * canvasWidth;
        particle.y = canvasHeight + Math.random() * 100;
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = -Math.random() * 2 - 0.5;
        particle.life = 0;
        particle.maxLife = Math.random() * 300 + 200;
      }
      
      // Draw particle
      const alpha = 1 - (particle.life / particle.maxLife);
      this.ctx!.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${alpha * 0.6})`;
      this.ctx!.beginPath();
      this.ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx!.fill();
    });
    
    this.animationFrame = requestAnimationFrame(() => this.animateParticles());
  }

  private setupMouseTracking(): void {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    
    // Touch support for mobile
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    });
  }

  private addFloatingHearts(): void {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const heartEmojis = ['💕', '💖', '💗', '💝', '💘'];
    
    for (let i = 0; i < 8; i++) {
      const heart = document.createElement('span');
      heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      heart.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 1 + 1.5}rem;
        opacity: ${Math.random() * 0.3 + 0.1};
        animation: heartDance ${Math.random() * 8 + 12}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
        top: ${Math.random() * 80 + 10}%;
        left: ${Math.random() * 80 + 10}%;
        pointer-events: none;
        filter: blur(0.5px);
      `;
      
      heroSection.appendChild(heart);
    }
  }

  private setupCountdown(): void {
    this.updateCountdown();
    this.countdownTimer = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const distance = this.targetDate.getTime() - now;

    if (distance < 0) {
      this.clearCountdown();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const newValues = {
      days: days.toString().padStart(3, '0'),
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };

    // Update with flip animation
    Object.keys(newValues).forEach(key => {
      const element = document.getElementById(key);
      if (element && newValues[key] !== this.previousCountdownValues[key]) {
        this.animateNumberChange(element, newValues[key]);
        this.previousCountdownValues[key] = newValues[key];
      }
    });
  }

  private animateNumberChange(element: HTMLElement, newValue: string): void {
    element.classList.add('flip');
    
    setTimeout(() => {
      element.textContent = newValue;
    }, 300);
    
    setTimeout(() => {
      element.classList.remove('flip');
    }, 600);
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    const countdownContainer = document.querySelector('.countdown-container');
    if (countdownContainer) {
      countdownContainer.innerHTML = `
        <h3 class="countdown-title">🎉 The Big Day is Here! 🎉</h3>
        <p style="font-size: 1.25rem; margin-top: 1rem; animation: titleGlow 2s ease-in-out infinite;">Our engagement ceremony is happening now!</p>
      `;
    }
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) return;

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe elements for scroll animations
    const observeElements = document.querySelectorAll('.info-item, .content-card, .countdown-item');
    observeElements.forEach(el => {
      this.intersectionObserver?.observe(el);
    });
  }

  private preloadAnimations(): void {
    // Preload critical animations for smooth performance
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      @keyframes panelFadeOut {
        to {
          opacity: 0;
          transform: translateY(-20px) scale(0.98);
        }
      }
      
      .animate-in {
        animation: fadeInUp 0.8s ease-out both;
      }
    `;
    document.head.appendChild(style);
  }

  // Cleanup method
  public destroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    const particleCanvas = document.querySelector('.particle-canvas');
    if (particleCanvas) {
      particleCanvas.remove();
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new UltraModernEngagementApp();
});

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
    }, 0);
  });
}
