// Modern Engagement Invitation App
var EngagementApp = /** @class */ (function () {
    function EngagementApp() {
        this.openingScreen = document.getElementById('openingScreen');
        this.mainContainer = document.getElementById('mainContainer');
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        this.countdownTimer = null;
        // Set target date to October 12th, 2025 at 11:00 AM
        this.targetDate = new Date('2025-10-12T11:00:00');
        this.init();
    }
    EngagementApp.prototype.init = function () {
        this.setupOpeningAnimation();
        this.setupNavigation();
        this.setupCountdown();
        this.addFloatingHearts();
    };
    EngagementApp.prototype.setupOpeningAnimation = function () {
        var _this = this;
        if (!this.openingScreen)
            return;
        // Remove opening screen after animation
        setTimeout(function () {
            if (_this.openingScreen) {
                _this.openingScreen.style.display = 'none';
            }
        }, 3500);
    };
    EngagementApp.prototype.setupNavigation = function () {
        var _this = this;
        this.navTabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                _this.switchTab(index);
            });
            // Keyboard navigation
            tab.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    _this.switchTab(index);
                }
                else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    var nextIndex = (index + 1) % _this.navTabs.length;
                    _this.switchTab(nextIndex);
                }
                else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    var prevIndex = (index - 1 + _this.navTabs.length) % _this.navTabs.length;
                    _this.switchTab(prevIndex);
                }
            });
        });
    };
    EngagementApp.prototype.switchTab = function (activeIndex) {
        var _this = this;
        // Update tab buttons
        this.navTabs.forEach(function (tab, index) {
            var isActive = index === activeIndex;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
            if (isActive) {
                tab.focus();
            }
        });
        // Update tab panels
        this.tabPanels.forEach(function (panel, index) {
            var isActive = index === activeIndex;
            panel.classList.toggle('active', isActive);
        });
        // Smooth scroll to content
        var activePanel = _this.tabPanels[activeIndex];
        if (activePanel) {
            activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    EngagementApp.prototype.setupRsvpForm = function () {
        var _this = this;
        if (!this.rsvpForm || !this.rsvpSuccess)
            return;
        this.rsvpForm.addEventListener('submit', function (e) {
            e.preventDefault();
            _this.handleRsvpSubmission();
        });
        // Real-time validation
        var inputs = this.rsvpForm.querySelectorAll('input, select, textarea');
        inputs.forEach(function (input) {
            input.addEventListener('blur', function () {
                _this.validateField(input);
            });
        });
    };
    EngagementApp.prototype.validateField = function (field) {
        var value = field.value.trim();
        var isValid = true;
        var errorMessage = '';
        // Remove existing error styling
        field.classList.remove('error');
        var existingError = field.parentElement === null || field.parentElement === void 0 ? void 0 : field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        // Validation rules
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
        // Show error if invalid
        if (!isValid) {
            field.classList.add('error');
            var errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            field.parentElement === null || field.parentElement === void 0 ? void 0 : field.parentElement.appendChild(errorDiv);
        }
        return isValid;
    };
    EngagementApp.prototype.isValidEmail = function (email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    EngagementApp.prototype.isValidPhone = function (phone) {
        var phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };
    EngagementApp.prototype.handleRsvpSubmission = function () {
        var _this = this;
        if (!this.rsvpForm || !this.rsvpSuccess)
            return;
        // Validate all fields
        var fields = this.rsvpForm.querySelectorAll('input, select, textarea');
        var allValid = true;
        fields.forEach(function (field) {
            var isValid = _this.validateField(field);
            if (!isValid) {
                allValid = false;
            }
        });
        if (!allValid) {
            // Scroll to first error
            var firstError = this.rsvpForm.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }
        // Collect form data
        var formData = new FormData(this.rsvpForm);
        var rsvpData = {
            guestName: formData.get('guestName'),
            guestCount: formData.get('guestCount'),
            phone: formData.get('phone') || undefined,
            email: formData.get('email') || undefined,
            message: formData.get('message') || undefined,
            submittedAt: new Date().toISOString()
        };
        // Save to localStorage
        this.saveRsvp(rsvpData);
        // Show success message
        this.showSuccessMessage();
        // Reset form
        this.rsvpForm.reset();
    };
    EngagementApp.prototype.saveRsvp = function (rsvpData) {
        var existingRsvps = this.getRsvps();
        existingRsvps.push(rsvpData);
        localStorage.setItem('engagement-rsvps', JSON.stringify(existingRsvps));
    };
    EngagementApp.prototype.getRsvps = function () {
        var stored = localStorage.getItem('engagement-rsvps');
        return stored ? JSON.parse(stored) : [];
    };
    EngagementApp.prototype.showSuccessMessage = function () {
        var _this = this;
        if (!this.rsvpForm || !this.rsvpSuccess)
            return;
        this.rsvpForm.style.display = 'none';
        this.rsvpSuccess.style.display = 'block';
        // Add success animation
        this.rsvpSuccess.style.opacity = '0';
        this.rsvpSuccess.style.transform = 'translateY(20px)';
        setTimeout(function () {
            _this.rsvpSuccess.style.transition = 'all 0.5s ease-out';
            _this.rsvpSuccess.style.opacity = '1';
            _this.rsvpSuccess.style.transform = 'translateY(0)';
        }, 100);
    };
    EngagementApp.prototype.addFloatingHearts = function () {
        // Add some extra floating hearts to the hero section
        var heroSection = document.querySelector('.hero-section');
        if (!heroSection)
            return;
        for (var i = 0; i < 3; i++) {
            var heart = document.createElement('span');
            heart.textContent = ['💕', '💖', '💗'][i];
            heart.style.position = 'absolute';
            heart.style.fontSize = '1.5rem';
            heart.style.opacity = '0.2';
            heart.style.animation = "floatAround " + (8 + i * 2) + "s ease-in-out infinite";
            heart.style.animationDelay = i * 2 + "s";
            // Random positioning
            heart.style.top = 20 + i * 25 + "%";
            heart.style.left = 10 + i * 30 + "%";
            heroSection.appendChild(heart);
        }
    };
    EngagementApp.prototype.setupCountdown = function () {
        var _this = this;
        this.updateCountdown();
        this.countdownTimer = setInterval(function () {
            _this.updateCountdown();
        }, 1000);
    };
    EngagementApp.prototype.updateCountdown = function () {
        var now = new Date().getTime();
        var distance = this.targetDate.getTime() - now;
        if (distance < 0) {
            // Event has passed
            this.clearCountdown();
            return;
        }
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        // Update DOM elements
        var daysElement = document.getElementById('days');
        var hoursElement = document.getElementById('hours');
        var minutesElement = document.getElementById('minutes');
        var secondsElement = document.getElementById('seconds');
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
    };
    EngagementApp.prototype.clearCountdown = function () {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        // Show event has started message
        var countdownContainer = document.querySelector('.countdown-container');
        if (countdownContainer) {
            countdownContainer.innerHTML = "\n        <h3 class=\"countdown-title\">\ud83c\udf89 The Big Day is Here! \ud83c\udf89</h3>\n        <p style=\"font-size: 1.25rem; margin-top: 1rem;\">Our engagement ceremony is happening now!</p>\n      ";
        }
    };
    return EngagementApp;
}());
// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    new EngagementApp();
});
// Add some extra CSS for error states
var style = document.createElement('style');
style.textContent = "\n  .error {\n    border-color: #e74c3c !important;\n    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;\n  }\n  \n  .error-message {\n    color: #e74c3c;\n    font-size: 0.875rem;\n    margin-top: 0.25rem;\n  }\n";
document.head.appendChild(style);