// Modern Engagement Invitation App

class EngagementInvitationApp {
  private openingScreen: HTMLElement | null;
  private mainContainer: HTMLElement | null;
  private navTabs: NodeListOf<HTMLElement>;
  private tabPanels: NodeListOf<HTMLElement>;
  private countdownTimer: number | null = null;
  private targetDate: Date;

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
    this.addFloatingHearts();
  }

  private setupOpeningAnimation(): void {
    if (!this.openingScreen) return;

    // Remove opening screen after animation
    setTimeout(() => {
      if (this.openingScreen) {
        this.openingScreen.style.display = 'none';
      }
    }, 3500);
  }

  private setupNavigation(): void {
    this.navTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this.switchTab(index);
      });

      // Keyboard navigation
      tab.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.switchTab(index);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (index + 1) % this.navTabs.length;
          this.switchTab(nextIndex);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (index - 1 + this.navTabs.length) % this.navTabs.length;
          this.switchTab(prevIndex);
        }
      });
    });
  }

  private switchTab(activeIndex: number): void {
    // Update tab buttons
    this.navTabs.forEach((tab, index) => {
      const isActive = index === activeIndex;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      
      if (isActive) {
        tab.focus();
      }
    });

    // Update tab panels
    this.tabPanels.forEach((panel, index) => {
      const isActive = index === activeIndex;
      panel.classList.toggle('active', isActive);
    });

    // Smooth scroll to content
    const activePanel = this.tabPanels[activeIndex];
    if (activePanel) {
      activePanel.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }



  private addFloatingHearts(): void {
    // Add some extra floating hearts to the hero section
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('span');
      heart.textContent = ['💕', '💖', '💗'][i];
      heart.style.position = 'absolute';
      heart.style.fontSize = '1.5rem';
      heart.style.opacity = '0.2';
      heart.style.animation = `floatAround ${8 + i * 2}s ease-in-out infinite`;
      heart.style.animationDelay = `${i * 2}s`;
      
      // Random positioning
      heart.style.top = `${20 + i * 25}%`;
      heart.style.left = `${10 + i * 30}%`;
      
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
      // Event has passed
      this.clearCountdown();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update DOM elements
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    if (daysElement) {
      daysElement.textContent = days.toString().padStart(3, '0');
    }
    if (hoursElement) {
      hoursElement.textContent = hours.toString().padStart(2, '0');
    }
    if (minutesElement) {
      minutesElement.textContent = minutes.toString().padStart(2, '0');
    }
    if (secondsElement) {
      secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    // Show event has started message
    const countdownContainer = document.querySelector('.countdown-container');
    if (countdownContainer) {
      countdownContainer.innerHTML = `
        <h3 class="countdown-title">🎉 The Big Day is Here! 🎉</h3>
        <p style="font-size: 1.25rem; margin-top: 1rem;">Our engagement ceremony is happening now!</p>
      `;
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new EngagementInvitationApp();
});

// Add some extra CSS for error states
const style = document.createElement('style');
style.textContent = `
  .error {
    border-color: #e74c3c !important;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
`;
document.head.appendChild(style);