// 1. Dynamic Local Time Clock
function updateClock() {
  const clockEl = document.getElementById('local-time-clock');
  if (!clockEl) return;
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
  clockEl.textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// 2. Interactive Spotlight Follow Cursor (Desktop)
const cursorGlow = document.getElementById('cursor-glow');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Smooth cursor lag loop
function animateCursor() {
  const dx = mouseX - glowX;
  const dy = mouseY - glowY;
  
  glowX += dx * 0.12; // Easing offset lag
  glowY += dy * 0.12;
  
  if (cursorGlow) {
    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// 3. Living Background Canvas (drifting glows + floating node particles)
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

class Particle {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 0.2 - 0.1;
    this.speedY = Math.random() * 0.2 - 0.1;
    this.alpha = Math.random() * 0.3 + 0.1;
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Slow drift boundary reset
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.reset();
    }
  }
  
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    ctx.fillStyle = isLightTheme ? `rgba(15, 23, 42, ${this.alpha * 1.5})` : `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fill();
  }
}

class LightBubble {
  constructor(color) {
    this.color = color;
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 150 + 150;
    this.speedX = Math.random() * 0.15 - 0.075;
    this.speedY = Math.random() * 0.15 - 0.075;
    this.alpha = Math.random() * 0.04 + 0.02;
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    if (this.x < -this.radius || this.x > width + this.radius || this.y < -this.radius || this.y > height + this.radius) {
      this.reset();
    }
  }
  
  draw() {
    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    const opacityMultiplier = isLightTheme ? 0.35 : 1.0;
    
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = this.alpha * opacityMultiplier;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

const particles = Array.from({ length: 45 }, () => new Particle());
const lightBubbles = [
  new LightBubble('rgba(26, 72, 173, 0.4)'), // Brand Medium Blue
  new LightBubble('rgba(0, 214, 255, 0.25)'), // Secondary Cyan
  new LightBubble('rgba(212, 168, 71, 0.15)')  // Accent Gold
];

function drawCanvas() {
  ctx.clearRect(0, 0, width, height);
  
  // Draw glowing drifting bubbles
  lightBubbles.forEach((bubble) => {
    bubble.update();
    bubble.draw();
  });
  
  // Draw node particles
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  
  requestAnimationFrame(drawCanvas);
}
drawCanvas();

// 4. Floating Mockup 3D Parallax (Hero Visuals)
const heroVisual = document.getElementById('hero-visual-3d');
const mockupContainer = document.getElementById('mockup-container');
const mockupCards = document.querySelectorAll('.mockup-card');

if (heroVisual && mockupContainer) {
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Tilt mockup container slightly
    mockupContainer.style.transform = `rotateY(${x * 0.03}deg) rotateX(${-y * 0.03}deg)`;
    
    // Add offset translation to cards based on data-depth
    mockupCards.forEach((card) => {
      const depth = parseFloat(card.dataset.depth || 0.1);
      const tx = x * depth * 0.4;
      const ty = y * depth * 0.4;
      card.style.transform = `translate3d(${tx}px, ${ty}px, ${depth * 100}px)`;
    });
  });
  
  heroVisual.addEventListener('mouseleave', () => {
    mockupContainer.style.transform = 'rotateY(0deg) rotateX(0deg)';
    mockupCards.forEach((card) => {
      const depth = parseFloat(card.dataset.depth || 0.1);
      card.style.transform = `translate3d(0, 0, ${depth * 100}px)`;
    });
  });
}

// 5. 3D Card Tilting & Interactive Glow highlights (ByteX Devices & Projects)
const tiltCards = document.querySelectorAll('.device-card, .bento-card');

tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 8; // Max 8 deg rotation
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
});

// 6. Magnetic Button Pull (attraction to cursor)
const magneticButtons = document.querySelectorAll('.btn-primary, .btn-accent, .nav-cta-btn');

magneticButtons.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Stretch button toward the mouse within boundaries
    btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});

// 7. Navigation capsule link hover slide highlights
const navLinks = document.getElementById('nav-links');
const navItems = document.querySelectorAll('.nav-item');
const navHighlight = document.getElementById('nav-highlight');

if (navLinks && navHighlight) {
  navItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const rect = item.getBoundingClientRect();
      const parentRect = navLinks.getBoundingClientRect();
      
      navHighlight.style.left = `${rect.left - parentRect.left}px`;
      navHighlight.style.width = `${rect.width}px`;
      navHighlight.style.opacity = '1';
    });
  });
  
  navLinks.addEventListener('mouseleave', () => {
    navHighlight.style.opacity = '0';
  });
}

// 8. 5-Stage Interactive Journey Board Switcher
function activateStage(stageIndex, activeColor) {
  const steps = document.querySelectorAll('.journey-node-step');
  const panels = document.querySelectorAll('.journey-stage-panel');
  const progressLine = document.getElementById('journey-node-line-progress');
  
  steps.forEach((step, idx) => {
    step.classList.toggle('active', idx === stageIndex);
    if (idx === stageIndex) {
      step.style.setProperty('--color-active', activeColor);
      step.style.setProperty('--glow-active', `${activeColor}40`); // Adds opacity glow hex mapping
    }
  });
  
  panels.forEach((panel, idx) => {
    panel.classList.toggle('active', idx === stageIndex);
  });
  
  // Set stage track progress line fill percentage
  if (progressLine) {
    const percent = (stageIndex / (steps.length - 1)) * 100;
    progressLine.style.width = `${percent}%`;
  }
}

// Initialize stage board to first node
activateStage(0, 'rgb(26, 72, 173)');

// 9. Admission Step-by-Step Portal Wizard
let currentWrittenStep = 0;
const streamScenarios = {
  'Computer Science / IT': "Identify one daily process in your campus (e.g. hostel entry, library checkout, canteen ordering) that suffers from operational delays. Briefly describe how you would design a simple system to track and optimize this workflow.",
  'Mechanical Engineering': "Examine a physical tool or assembly step in your college laboratory. Propose a small adjustment to make it safer or faster based on JIT production principles.",
  'Civil Engineering': "Locate a congested traffic bottleneck near your college campus. Describe a simple layout change or signal timing logic that could optimize vehicle throughput.",
  'Electrical & Electronics': "Suggest a low-power wireless sensor system that could monitor vacant classrooms and automatically switch off lights/fans to reduce electricity waste.",
  'MBA / Management': "Analyze a local student shop or café on campus. Outline one simple marketing or delivery feature that could double their daily order count."
};

function togglePortalPath(path) {
  const btnWritten = document.getElementById('path-btn-written');
  const btnBytex = document.getElementById('path-btn-bytex');
  const divWritten = document.getElementById('written-path-container');
  const divBytex = document.getElementById('bytex-path-container');
  
  if (path === 'written') {
    btnWritten.classList.add('active');
    btnBytex.classList.remove('active');
    divWritten.style.display = 'block';
    divBytex.style.display = 'none';
  } else {
    btnWritten.classList.remove('active');
    btnBytex.classList.add('active');
    divWritten.style.display = 'none';
    divBytex.style.display = 'block';
  }
}

function proceedWrittenStep(stepIdx) {
  // Validate Step 1 (Contact Form)
  if (stepIdx === 1 && currentWrittenStep === 0) {
    const name = document.getElementById('student-name').value.trim();
    const phone = document.getElementById('student-phone').value.trim();
    const college = document.getElementById('student-college').value.trim();
    
    if (!name || !phone || !college) {
      alert('Please fill out your name, phone number, and college name first.');
      return;
    }
    
    // Set custom stream scenario text dynamically
    const stream = document.getElementById('student-stream').value;
    const scenarioBox = document.getElementById('assignment-desc-box');
    if (scenarioBox && streamScenarios[stream]) {
      scenarioBox.textContent = streamScenarios[stream];
    }
  }
  
  // Validate Step 2 (Response validation)
  if (stepIdx === 2 && currentWrittenStep === 1) {
    const responseText = document.getElementById('student-response').value.trim();
    if (responseText.length < 20) {
      alert('Please write a brief response (at least 2-3 sentences) detailing your logic.');
      return;
    }
    
    // Bind values to step 3 summary
    document.getElementById('summary-name').textContent = document.getElementById('student-name').value.trim();
    document.getElementById('summary-phone').textContent = document.getElementById('student-phone').value.trim();
    document.getElementById('summary-college').textContent = document.getElementById('student-college').value.trim();
  }
  
  // Navigate steps
  document.querySelectorAll('#written-path-container .portal-step-pane').forEach((pane, idx) => {
    pane.classList.toggle('active', idx === stepIdx);
  });
  
  // Update indicator dots
  const dots = document.querySelectorAll('#portal-form-widget .portal-widget-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === stepIdx);
  });
  
  currentWrittenStep = stepIdx;
}

function resetWrittenPortal() {
  document.getElementById('student-name').value = '';
  document.getElementById('student-phone').value = '';
  document.getElementById('student-college').value = '';
  document.getElementById('student-response').value = '';
  proceedWrittenStep(0);
}

function openAdmissionPortal() {
  const portalSection = document.getElementById('admission-portal');
  if (portalSection) {
    portalSection.scrollIntoView({ behavior: 'smooth' });
    togglePortalPath('written');
    resetWrittenPortal();
  }
}

// 10. Manual WhatsApp Checkout Link generator
function initiateWhatsAppCheckout(deviceName, price) {
  const phoneNum = "919876543210"; // Default representative contact
  const messageText = `Hello ByteX Edu! I would like to bypass the admission task and unlock my full IMReady journey by purchasing the *${deviceName}* laptop for *₹${price.toLocaleString('en-IN')}* through my college's campus MoU partnership. Please initiate my checkout setup.`;
  
  const encodedText = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${phoneNum}?text=${encodedText}`;
  
  window.open(waUrl, '_blank');
}

// 11. Bento Card Project details display & Detail Modal popup
const detailModal = document.getElementById('project-detail-modal');
const modalTitle = document.getElementById('project-modal-title');
const modalDesc = document.getElementById('project-modal-desc');

function focusBentoProject(name, desc) {
  if (!detailModal || !modalTitle || !modalDesc) return;
  modalTitle.textContent = name;
  modalDesc.textContent = desc;
  
  detailModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectDetailModal() {
  if (!detailModal) return;
  detailModal.classList.remove('open');
  document.body.style.overflow = '';
}

function openAdmissionPortalFromProject() {
  closeProjectDetailModal();
  openAdmissionPortal();
}

// 12. FAQ Accordion handler
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  
  // Close all other FAQ entries
  document.querySelectorAll('.faq-item').forEach((i) => {
    i.classList.remove('open');
    i.querySelector('.faq-a').style.maxHeight = '0px';
  });
  
  // Toggle current FAQ
  if (!isOpen) {
    item.classList.add('open');
    const answer = item.querySelector('.faq-a');
    answer.style.maxHeight = `${answer.scrollHeight}px`;
  }
}

// 13. Viewport Scroll Reveal Observer (IntersectionObserver)
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target); // Reveal only once
    }
  });
}, {
  threshold: 0.12
});

revealElements.forEach((el) => revealObserver.observe(el));

// Duplicate live activity ticker track to ensure infinite scroll loop
const tickerTrack = document.getElementById('ticker-track');
if (tickerTrack) {
  const clone = tickerTrack.innerHTML;
  tickerTrack.innerHTML += clone; // Append duplicate copy
}

// 14. Theme Toggle and Light/Dark Switch Handler (Delegated to window.ThemeEngine)
const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    // Determine toggle direction based on upcoming state change
    const isMovingRight = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.classList.add(isMovingRight ? 'sliding-right' : 'sliding-left');
    
    setTimeout(() => {
      if (window.ThemeEngine) {
        window.ThemeEngine.toggle();
      }
      themeToggle.classList.remove(isMovingRight ? 'sliding-right' : 'sliding-left');
    }, 150);
  });

  // Accessibility support
  themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      themeToggle.click();
    }
  });
}

// 15. Mobile Menu Toggle Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');

if (mobileMenuBtn && mobileMenuDrawer) {
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = mobileMenuBtn.classList.toggle('active');
    mobileMenuDrawer.classList.toggle('active', isActive);
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenuDrawer.contains(e.target) && e.target !== mobileMenuBtn) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.classList.remove('active');
    mobileMenuDrawer.classList.remove('active');
  }
}

// 16. Dynamic Liquid Glass Refraction Animation
let refractionScale = 12;
let targetRefractionScale = 12;
let refractionScaleVelocity = 0;

// Track mouse movement speed for elastic refraction perturbation
let lastMouseX = null;
let lastMouseY = null;
let lastMouseTime = null;

document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (lastMouseX !== null && lastMouseTime !== null) {
    const dt = Math.max(1, now - lastMouseTime);
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt; // pixels per millisecond
    
    // Smooth bump scale based on speed
    if (speed > 0.15) {
      targetRefractionScale = 12 + Math.min(18, speed * 12);
    }
  }
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  lastMouseTime = now;
});

// Click impulse to ripple the gel
document.addEventListener('click', () => {
  targetRefractionScale = 25;
});

function updateRefraction() {
  const displacement = document.querySelector('#liquid-refraction feDisplacementMap');
  const turbulence = document.querySelector('#liquid-refraction feTurbulence');
  
  if (displacement) {
    // Spring physics to return scale to baseline 12
    const springForce = (targetRefractionScale - refractionScale) * 0.14; // stiffness
    refractionScaleVelocity += springForce;
    refractionScaleVelocity *= 0.8; // damping
    refractionScale += refractionScaleVelocity;
    
    displacement.setAttribute('scale', refractionScale.toFixed(2));
    
    // Ripple turbulence offset over time for organic liquid shifting
    if (turbulence) {
      const time = Date.now() * 0.00018;
      const baseFreqX = 0.008 + Math.sin(time) * 0.0012;
      const baseFreqY = 0.008 + Math.cos(time * 1.4) * 0.0012;
      turbulence.setAttribute('baseFrequency', `${baseFreqX.toFixed(5)} ${baseFreqY.toFixed(5)}`);
    }
  }
  
  requestAnimationFrame(updateRefraction);
}

// Start refraction animation loop
updateRefraction();

// MASTER OTP definition (defined only once, modular for future replaceability)
const MASTER_OTP = "101010";

// Reusable Step Transition with Spring Easing
function transitionToStep(stepElement, show) {
  if (!stepElement) return;
  if (show) {
    stepElement.style.display = 'block';
    stepElement.offsetHeight; // Force reflow
    stepElement.classList.add('active');
  } else {
    stepElement.classList.remove('active');
    setTimeout(() => {
      if (!stepElement.classList.contains('active')) {
        stepElement.style.display = 'none';
      }
    }, 500);
  }
}

// Error Shaker visual feedback
function triggerErrorFeedback(errorEl) {
  if (!errorEl) return;
  errorEl.classList.remove('shake-animation');
  errorEl.offsetHeight; // force reflow
  errorEl.classList.add('shake-animation');
}

// OTP Timer Tracker States
let registerTimerInterval = null;
let forgotTimerInterval = null;

function startOTPTimer(prefix) {
  const container = document.getElementById(`${prefix}-timer-container`);
  const countdownSpan = document.getElementById(`${prefix}-countdown`);
  const sendBtn = document.getElementById(`${prefix}-send-otp-btn`);
  
  if (!container || !countdownSpan || !sendBtn) return;
  
  if (prefix === 'register' && registerTimerInterval) {
    clearInterval(registerTimerInterval);
  } else if (prefix === 'forgot' && forgotTimerInterval) {
    clearInterval(forgotTimerInterval);
  }
  
  container.style.display = 'block';
  sendBtn.disabled = true;
  
  let timeLeft = OTP_RESEND_TIME;
  
  const updateTimerText = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    countdownSpan.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  updateTimerText();
  
  const intervalId = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      container.style.display = 'none';
      sendBtn.disabled = false;
    } else {
      updateTimerText();
    }
  }, 1000);
  
  if (prefix === 'register') {
    registerTimerInterval = intervalId;
  } else {
    forgotTimerInterval = intervalId;
  }
}

// Setup 6-digit Premium OTP Component input event handlers
function setupOTPBoxes(prefix) {
  const stepId = prefix === 'register' ? 'register-step-2' : 'forgot-step-otp';
  const container = document.querySelector(`#${stepId} .otp-inputs-container`);
  if (!container) return;
  
  const boxes = container.querySelectorAll('.otp-box');
  const hiddenInput = document.getElementById(`${prefix}-otp`);
  
  const updateHiddenValue = () => {
    let val = '';
    boxes.forEach(box => {
      val += box.value;
    });
    if (hiddenInput) {
      hiddenInput.value = val;
    }
  };
  
  boxes.forEach((box, index) => {
    // Only numeric inputs
    box.addEventListener('input', (e) => {
      const val = e.target.value;
      const sanitized = val.replace(/\D/g, '');
      box.value = sanitized;
      
      updateHiddenValue();
      
      if (sanitized && index < boxes.length - 1) {
        boxes[index + 1].focus();
      }
    });
    
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!box.value && index > 0) {
          boxes[index - 1].value = '';
          boxes[index - 1].focus();
          updateHiddenValue();
        } else {
          box.value = '';
          updateHiddenValue();
        }
      } else if (e.key === 'ArrowLeft') {
        if (index > 0) boxes[index - 1].focus();
      } else if (e.key === 'ArrowRight') {
        if (index < boxes.length - 1) boxes[index + 1].focus();
      }
    });
    
    // Paste handler supporting complete string distribution
    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      const digits = pastedData.replace(/\D/g, '').substring(0, 6);
      
      if (digits) {
        for (let i = 0; i < boxes.length; i++) {
          if (digits[i]) {
            boxes[i].value = digits[i];
          } else {
            boxes[i].value = '';
          }
        }
        updateHiddenValue();
        
        // Auto-focus appropriate input box
        const nextFocusIdx = Math.min(digits.length, boxes.length - 1);
        boxes[nextFocusIdx].focus();
      }
    });
  });
}

// 17. Login Modal Open/Close Logic
const loginModal = document.getElementById('login-modal');

function openLoginModal() {
  if (!loginModal) return;
  loginModal.classList.add('open');
  document.body.classList.add('modal-open');
  // Reset form and errors
  const form = document.getElementById('login-modal-form');
  if (form) form.reset();
  const errorMsg = document.getElementById('login-error-msg');
  if (errorMsg) errorMsg.style.display = 'none';
  const submitBtn = document.getElementById('login-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Login</span>';
  }
  const formState = document.getElementById('login-form-state');
  const welcomeState = document.getElementById('login-welcome-state');
  if (formState) formState.style.display = 'block';
  if (welcomeState) welcomeState.style.display = 'none';
  
  setTimeout(() => {
    const phoneInput = document.getElementById('login-phone');
    if (phoneInput) phoneInput.focus();
  }, 100);
}

function closeLoginModal() {
  if (!loginModal) return;
  loginModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

// Keyboard ESC to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLoginModal();
    closeRegisterModal();
    closeForgotModal();
    closeProfileSuccessModal();
    if (typeof closeProjectDetailModal === 'function') {
      closeProjectDetailModal();
    }
  }
});

// 18. Registration Modal Open/Close & Progressive OTP Workflow
const registerModal = document.getElementById('register-modal');
const registerFormState = document.getElementById('register-form-state');
const registerSuccessState = document.getElementById('register-success-state');
const registerForm = document.getElementById('register-modal-form');

function openRegisterModal() {
  if (!registerModal) return;
  registerModal.classList.add('open');
  document.body.classList.add('modal-open');
  
  if (registerFormState) registerFormState.style.display = 'block';
  if (registerSuccessState) registerSuccessState.style.display = 'none';
  if (registerForm) registerForm.reset();
  
  // Reset onboarding step elements with active transitions
  const step1 = document.getElementById('register-step-1');
  const step2 = document.getElementById('register-step-2');
  const step3 = document.getElementById('register-step-3');
  
  if (step1) {
    step1.style.display = 'block';
    step1.classList.add('active');
  }
  if (step2) {
    step2.classList.remove('active');
    step2.style.display = 'none';
  }
  if (step3) {
    step3.classList.remove('active');
    step3.style.display = 'none';
  }

  // Clear OTP boxes
  const otpBoxes = document.querySelectorAll('#register-step-2 .otp-box');
  otpBoxes.forEach(b => b.value = '');
  const hiddenOtp = document.getElementById('register-otp');
  if (hiddenOtp) hiddenOtp.value = '';

  // Clear timer
  const timerContainer = document.getElementById('register-timer-container');
  if (timerContainer) timerContainer.style.display = 'none';
  if (registerTimerInterval) {
    clearInterval(registerTimerInterval);
    registerTimerInterval = null;
  }
  
  // Enable inputs in case they were locked
  const nameInput = document.getElementById('register-name');
  const phoneInput = document.getElementById('register-phone');
  if (nameInput) nameInput.disabled = false;
  if (phoneInput) phoneInput.disabled = false;
  
  const sendBtn = document.getElementById('register-send-otp-btn');
  if (sendBtn) {
    sendBtn.disabled = false;
    sendBtn.innerHTML = 'Send OTP';
    sendBtn.style.opacity = '1';
    sendBtn.style.cursor = 'pointer';
  }
  
  const verifyBtn = document.getElementById('register-verify-otp-btn');
  if (verifyBtn) {
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = 'Verify OTP';
  }

  // Clear messages
  const errorMsg = document.getElementById('register-error-msg');
  const successMsg = document.getElementById('register-success-msg');
  if (errorMsg) errorMsg.style.display = 'none';
  if (successMsg) successMsg.style.display = 'none';

  setTimeout(() => {
    if (nameInput) nameInput.focus();
  }, 100);
}

function closeRegisterModal() {
  if (!registerModal) return;
  registerModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

function switchToRegisterModal() {
  closeLoginModal();
  setTimeout(() => {
    openRegisterModal();
  }, 300);
}

function switchToLoginModal() {
  closeRegisterModal();
  closeForgotModal();
  setTimeout(() => {
    openLoginModal();
  }, 300);
}

// Indian Mobile Validation (Starts with 6-9, exactly 10 digits)
function validateIndianMobile(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

// Helper to filter non-digits in phone/otp fields
function initNumericFilters() {
  const numericIds = ['login-phone', 'register-phone', 'register-otp', 'forgot-phone', 'forgot-otp'];
  numericIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      });
    }
  });
}
// Run initialization immediately since script runs deferred/at bottom
setTimeout(initNumericFilters, 100);

// ================= AUTHENTICATION SERVICES & persistence =================
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=\[\]]).{8,20}$/;
const OTP_RESEND_TIME = 30; // seconds resend countdown timer

function getUsers() {
  try {
    const raw = localStorage.getItem('imready_users');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading users from localStorage', e);
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem('imready_users', JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage', e);
  }
}

function findUserByMobile(mobile) {
  const users = getUsers();
  return users.find(u => u.mobile === mobile) || null;
}

function createUser(name, mobile, password, email) {
  const users = getUsers();
  const newUser = {
    name: name,
    mobile: mobile,
    passwordHash: hashPassword(password),
    email: email
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

function validateLogin(mobile, password) {
  const user = findUserByMobile(mobile);
  if (!user) {
    return { success: false, error: 'No account found. Please create an account first.' };
  }
  if (comparePassword(password, user.passwordHash)) {
    return { success: true, user: user };
  } else {
    return { success: false, error: 'Incorrect password.' };
  }
}

function hashPassword(password) {
  // Simulates non-raw storage of passwords
  return "pbkdf2_sha256$20000$salt$" + btoa(password);
}

function comparePassword(inputPassword, storedHash) {
  return hashPassword(inputPassword) === storedHash;
}

// Session Management
function startSession(user) {
  try {
    localStorage.setItem('imready_session', JSON.stringify({
      name: user.name,
      mobile: user.mobile,
      email: user.email
    }));
  } catch (e) {
    console.error('Error starting session', e);
  }
}

function endSession() {
  localStorage.removeItem('imready_session');
}

function getSession() {
  try {
    const session = localStorage.getItem('imready_session');
    return session ? JSON.parse(session) : null;
  } catch (e) {
    return null;
  }
}

// Password Visibility toggling helper
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPrivate = input.type === 'password';
  input.type = isPrivate ? 'text' : 'password';
  
  if (btn) {
    if (isPrivate) {
      btn.innerHTML = `
        <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    } else {
      btn.innerHTML = `
        <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  }
}

// Password Checklist update helper
function updateChecklist(val, prefix) {
  const rules = {
    length: val.length >= 8 && val.length <= 20,
    uppercase: /[A-Z]/.test(val),
    lowercase: /[a-z]/.test(val),
    number: /\d/.test(val),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]]/.test(val)
  };

  for (const [key, isValid] of Object.entries(rules)) {
    const item = document.getElementById(`${prefix}rule-${key}`);
    if (item) {
      const bullet = item.querySelector('.bullet');
      if (isValid) {
        item.style.color = 'var(--brand-secondary)';
        if (bullet) bullet.style.background = 'var(--brand-secondary)';
      } else {
        item.style.color = 'var(--text-muted)';
        if (bullet) bullet.style.background = 'var(--text-muted)';
      }
    }
  }
}

// Progressive Registration OTP triggers
function sendRegisterOTP() {
  const nameInput = document.getElementById('register-name');
  const phoneInput = document.getElementById('register-phone');
  const errorMsg = document.getElementById('register-error-msg');
  const successMsg = document.getElementById('register-success-msg');
  const sendBtn = document.getElementById('register-send-otp-btn');
  
  if (!nameInput || !phoneInput || !errorMsg || !successMsg || !sendBtn) return;
  
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';
  
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  
  if (!name) {
    errorMsg.innerText = 'Please enter your full name.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  if (!validateIndianMobile(phone)) {
    errorMsg.innerText = 'Please enter a valid 10-digit Indian mobile number.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }

  // Prevent duplicates
  if (findUserByMobile(phone)) {
    errorMsg.innerText = 'This mobile number is already registered.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  // Loading state
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<span class="btn-spinner" style="margin-right: 6px;"></span><span>Sending OTP...</span>';
  
  setTimeout(() => {
    successMsg.innerText = 'OTP has been sent to your mobile number.';
    successMsg.style.display = 'block';
    
    // Reveal step 2 OTP Verification input
    const step2 = document.getElementById('register-step-2');
    if (step2) {
      transitionToStep(step2, true);
      // Auto-focus first field in newly revealed section
      setTimeout(() => {
        const firstBox = document.querySelector('#register-step-2 .otp-box');
        if (firstBox) firstBox.focus();
      }, 100);
    }
    
    // Setup listeners on individual boxes
    setupOTPBoxes('register');
    
    sendBtn.innerHTML = 'Resend OTP';
    // Start resend countdown timer (which disables the button automatically)
    startOTPTimer('register');
  }, 1000);
}

function verifyRegisterOTP() {
  const otpInput = document.getElementById('register-otp');
  const errorMsg = document.getElementById('register-error-msg');
  const successMsg = document.getElementById('register-success-msg');
  const verifyBtn = document.getElementById('register-verify-otp-btn');
  
  if (!otpInput || !errorMsg || !successMsg || !verifyBtn) return;
  
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';
  
  const otp = otpInput.value.trim();
  
  if (otp.length !== 6) {
    errorMsg.innerText = 'OTP must be exactly 6 digits.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  // Loading state
  verifyBtn.disabled = true;
  verifyBtn.innerHTML = '<span class="btn-spinner" style="margin-right: 6px;"></span><span>Verifying...</span>';
  
  setTimeout(() => {
    if (otp === MASTER_OTP) {
      verifyBtn.innerHTML = 'Verified ✓';
      verifyBtn.style.background = 'rgba(0, 212, 255, 0.1)';
      verifyBtn.style.color = 'var(--brand-secondary)';
      verifyBtn.style.borderColor = 'rgba(0, 212, 255, 0.3)';
      verifyBtn.disabled = true;
      
      successMsg.innerText = 'Mobile number verified successfully.';
      successMsg.style.display = 'block';
      
      // Lock current step inputs
      const nameInput = document.getElementById('register-name');
      const phoneInput = document.getElementById('register-phone');
      if (nameInput) nameInput.disabled = true;
      if (phoneInput) phoneInput.disabled = true;
      
      const sendBtn = document.getElementById('register-send-otp-btn');
      if (sendBtn) sendBtn.style.display = 'none';
      const timerContainer = document.getElementById('register-timer-container');
      if (timerContainer) timerContainer.style.display = 'none';
      if (registerTimerInterval) {
        clearInterval(registerTimerInterval);
        registerTimerInterval = null;
      }
      
      // Reveal Step 3 Credentials
      const step3 = document.getElementById('register-step-3');
      if (step3) {
        transitionToStep(step3, true);
        // Auto-focus first field in newly revealed section
        setTimeout(() => {
          const emailInput = document.getElementById('register-email');
          if (emailInput) emailInput.focus();
        }, 100);
      }
    } else {
      errorMsg.innerText = 'Invalid OTP. Please enter the correct demo OTP (101010).';
      errorMsg.style.display = 'block';
      triggerErrorFeedback(errorMsg);
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = 'Verify OTP';
    }
  }, 1000);
}

function handleRegisterSubmit(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById('register-name');
  const phoneInput = document.getElementById('register-phone');
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const confirmPasswordInput = document.getElementById('register-confirm-password');
  const errorMsg = document.getElementById('register-error-msg');
  const submitBtn = document.getElementById('register-submit-btn');
  
  if (!emailInput || !passwordInput || !confirmPasswordInput || !errorMsg || !submitBtn) return;
  
  errorMsg.style.display = 'none';
  
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  
  if (!email) {
    errorMsg.innerText = 'Please enter your email address.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    errorMsg.innerText = 'Password does not meet validation criteria.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  if (password !== confirmPassword) {
    errorMsg.innerText = 'Passwords do not match.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }

  // Prevent duplicates double-check
  if (findUserByMobile(phone)) {
    errorMsg.innerText = 'This mobile number is already registered.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  // Submit complete
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="btn-spinner" style="margin-right: 6px;"></span><span>Creating Account...</span>';
  
  setTimeout(() => {
    // Create new persistent user
    createUser(name, phone, password, email);
    
    if (registerFormState && registerSuccessState) {
      registerFormState.style.display = 'none';
      registerSuccessState.style.display = 'block';
    }
  }, 1200);
}

function handleSuccessContinue() {
  closeRegisterModal();
  setTimeout(() => {
    openLoginModal();
  }, 300);
}

// 19. Forgot Password Modal & OTP Reset Flow
const forgotModal = document.getElementById('forgot-modal');

function openForgotModal(event) {
  if (event) event.preventDefault();
  closeLoginModal();
  setTimeout(() => {
    if (!forgotModal) return;
    forgotModal.classList.add('open');
    document.body.classList.add('modal-open');
    resetForgotFlow();
    setTimeout(() => {
      const phoneInput = document.getElementById('forgot-phone');
      if (phoneInput) phoneInput.focus();
    }, 100);
  }, 300);
}

function closeForgotModal() {
  if (!forgotModal) return;
  forgotModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

function switchToLoginFromForgot() {
  closeForgotModal();
  setTimeout(() => {
    openLoginModal();
  }, 300);
}

function resetForgotFlow() {
  const form = document.getElementById('forgot-modal-form');
  if (form) form.reset();
  
  const stepPhone = document.getElementById('forgot-step-phone');
  const stepOtp = document.getElementById('forgot-step-otp');
  const stepPassword = document.getElementById('forgot-step-password');
  const formState = document.getElementById('forgot-form-state');
  const successState = document.getElementById('forgot-success-state');
  
  if (stepPhone) {
    stepPhone.style.display = 'block';
    stepPhone.classList.add('active');
  }
  if (stepOtp) {
    stepOtp.classList.remove('active');
    stepOtp.style.display = 'none';
  }
  if (stepPassword) {
    stepPassword.classList.remove('active');
    stepPassword.style.display = 'none';
  }
  if (formState) formState.style.display = 'block';
  if (successState) successState.style.display = 'none';
  
  const phoneInput = document.getElementById('forgot-phone');
  if (phoneInput) phoneInput.disabled = false;
  
  const sendBtn = document.getElementById('forgot-send-otp-btn');
  if (sendBtn) {
    sendBtn.disabled = false;
    sendBtn.innerHTML = 'Send OTP';
    sendBtn.style.opacity = '1';
    sendBtn.style.cursor = 'pointer';
    sendBtn.style.display = 'block';
  }
  
  const verifyBtn = document.getElementById('forgot-verify-otp-btn');
  if (verifyBtn) {
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = 'Verify OTP';
  }

  // Clear OTP boxes
  const otpBoxes = document.querySelectorAll('#forgot-step-otp .otp-box');
  otpBoxes.forEach(b => b.value = '');
  const hiddenOtp = document.getElementById('forgot-otp');
  if (hiddenOtp) hiddenOtp.value = '';

  // Clear timer
  const timerContainer = document.getElementById('forgot-timer-container');
  if (timerContainer) timerContainer.style.display = 'none';
  if (forgotTimerInterval) {
    clearInterval(forgotTimerInterval);
    forgotTimerInterval = null;
  }
  
  const errorMsg = document.getElementById('forgot-error-msg');
  const successMsg = document.getElementById('forgot-success-msg');
  if (errorMsg) errorMsg.style.display = 'none';
  if (successMsg) successMsg.style.display = 'none';
}

function sendForgotOTP() {
  const phoneInput = document.getElementById('forgot-phone');
  const errorMsg = document.getElementById('forgot-error-msg');
  const successMsg = document.getElementById('forgot-success-msg');
  const sendBtn = document.getElementById('forgot-send-otp-btn');
  
  if (!phoneInput || !errorMsg || !successMsg || !sendBtn) return;
  
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';
  
  const phone = phoneInput.value.trim();
  
  if (!validateIndianMobile(phone)) {
    errorMsg.innerText = 'Please enter a valid 10-digit Indian mobile number.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }

  // Check if account exists
  if (!findUserByMobile(phone)) {
    errorMsg.innerText = 'No account found. Please create an account first.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<span class="btn-spinner" style="margin-right: 6px;"></span><span>Sending OTP...</span>';
  
  setTimeout(() => {
    successMsg.innerText = 'OTP has been sent to your mobile number.';
    successMsg.style.display = 'block';
    
    const stepOtp = document.getElementById('forgot-step-otp');
    if (stepOtp) {
      transitionToStep(stepOtp, true);
      // Auto-focus first field in newly revealed section
      setTimeout(() => {
        const firstBox = document.querySelector('#forgot-step-otp .otp-box');
        if (firstBox) firstBox.focus();
      }, 100);
    }
    
    // Setup listeners on individual boxes
    setupOTPBoxes('forgot');
    
    sendBtn.innerHTML = 'Resend OTP';
    // Start resend countdown timer (which disables the button automatically)
    startOTPTimer('forgot');
  }, 1000);
}

function verifyForgotOTP() {
  const otpInput = document.getElementById('forgot-otp');
  const errorMsg = document.getElementById('forgot-error-msg');
  const successMsg = document.getElementById('forgot-success-msg');
  const verifyBtn = document.getElementById('forgot-verify-otp-btn');
  
  if (!otpInput || !errorMsg || !successMsg || !verifyBtn) return;
  
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';
  
  const otp = otpInput.value.trim();
  
  if (otp.length !== 6) {
    errorMsg.innerText = 'OTP must be exactly 6 digits.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  verifyBtn.disabled = true;
  verifyBtn.innerHTML = '<span class="btn-spinner" style="margin-right: 6px;"></span><span>Verifying...</span>';
  
  setTimeout(() => {
    if (otp === MASTER_OTP) {
      verifyBtn.innerHTML = 'Verified ✓';
      verifyBtn.style.background = 'rgba(0, 212, 255, 0.1)';
      verifyBtn.style.color = 'var(--brand-secondary)';
      verifyBtn.style.borderColor = 'rgba(0, 212, 255, 0.3)';
      verifyBtn.disabled = true;
      
      successMsg.innerText = 'Mobile number verified successfully.';
      successMsg.style.display = 'block';
      
      // Lock step inputs
      const phoneInput = document.getElementById('forgot-phone');
      if (phoneInput) phoneInput.disabled = true;
      const sendBtn = document.getElementById('forgot-send-otp-btn');
      if (sendBtn) sendBtn.style.display = 'none';
      const timerContainer = document.getElementById('forgot-timer-container');
      if (timerContainer) timerContainer.style.display = 'none';
      if (forgotTimerInterval) {
        clearInterval(forgotTimerInterval);
        forgotTimerInterval = null;
      }
      
      const stepPassword = document.getElementById('forgot-step-password');
      if (stepPassword) {
        transitionToStep(stepPassword, true);
        // Auto-focus first field in newly revealed section
        setTimeout(() => {
          const newPassInput = document.getElementById('forgot-new-password');
          if (newPassInput) newPassInput.focus();
        }, 100);
      }
    } else {
      errorMsg.innerText = 'Invalid OTP. Please enter the correct demo OTP (101010).';
      errorMsg.style.display = 'block';
      triggerErrorFeedback(errorMsg);
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = 'Verify OTP';
    }
  }, 1000);
}

// Reusable Page Transition System with Logout Handler
function initPageTransitions() {
  const mainContent = document.querySelector('main');
  if (mainContent) {
    // Clean transition entry states immediately
    setTimeout(() => {
      mainContent.classList.add('page-visible');
      document.body.classList.add('page-loaded');
    }, 20);
  }

  const transLinks = document.querySelectorAll('a');
  transLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.endsWith('.html') && !href.startsWith('#') && !href.startsWith('http')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Handle Logout check
        if (link.textContent.trim() === 'Logout' || href === 'index.html') {
          endSession();
        }
        
        if (mainContent) {
          mainContent.classList.add('page-exiting');
        }
        
        setTimeout(() => {
          window.location.href = href;
        }, 280);
      });
    }
  });
}

function handleForgotSubmit(event) {
  event.preventDefault();
  
  const phoneInput = document.getElementById('forgot-phone');
  const newPassInput = document.getElementById('forgot-new-password');
  const confirmPassInput = document.getElementById('forgot-confirm-password');
  const errorMsg = document.getElementById('forgot-error-msg');
  const submitBtn = document.getElementById('forgot-submit-btn');
  
  if (!phoneInput || !newPassInput || !confirmPassInput || !errorMsg || !submitBtn) return;
  
  errorMsg.style.display = 'none';
  
  const phone = phoneInput.value.trim();
  const newPass = newPassInput.value.trim();
  const confirmPass = confirmPassInput.value.trim();
  
  if (!PASSWORD_REGEX.test(newPass)) {
    errorMsg.innerText = 'Password does not meet validation criteria.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  if (newPass !== confirmPass) {
    errorMsg.innerText = 'Passwords do not match.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="btn-spinner" style="margin-right: 6px;"></span><span>Resetting...</span>';
  
  setTimeout(() => {
    // Update user's password in simulated database
    const users = getUsers();
    const userIndex = users.findIndex(u => u.mobile === phone);
    if (userIndex !== -1) {
      users[userIndex].passwordHash = hashPassword(newPass);
      saveUsers(users);
    }

    const formState = document.getElementById('forgot-form-state');
    const successState = document.getElementById('forgot-success-state');
    if (formState && successState) {
      formState.style.display = 'none';
      successState.style.display = 'block';
    }
  }, 1200);
}

// 19.5 Updated Mock Login Submission (Phone & Password)
function handleLoginSubmit(event) {
  event.preventDefault();
  
  const phoneInput = document.getElementById('login-phone');
  const passwordInput = document.getElementById('login-password');
  const errorMsg = document.getElementById('login-error-msg');
  const submitBtn = document.getElementById('login-submit-btn');
  
  if (!phoneInput || !passwordInput || !errorMsg || !submitBtn) return;
  
  // Reset errors
  errorMsg.style.display = 'none';
  errorMsg.innerText = '';
  
  const phone = phoneInput.value.trim();
  const password = passwordInput.value.trim();
  
  // Inline Validation
  if (!validateIndianMobile(phone)) {
    errorMsg.innerText = 'Please enter a valid 10-digit Indian mobile number.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  if (!password) {
    errorMsg.innerText = 'Please enter your password.';
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }

  // Validate credentials with persistency helper
  const res = validateLogin(phone, password);
  if (!res.success) {
    errorMsg.innerText = res.error;
    errorMsg.style.display = 'block';
    triggerErrorFeedback(errorMsg);
    return;
  }
  
  // Loading State
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="btn-spinner" style="margin-right: 6px;"></span><span>Signing In...</span>';
  
  // Wait ~1.5 seconds
  setTimeout(() => {
    // Success State
    submitBtn.innerHTML = '<span>✓ Login Successful</span>';
    
    // Save session
    startSession(res.user);
    
    // Wait ~500ms
    setTimeout(() => {
      const formState = document.getElementById('login-form-state');
      const welcomeState = document.getElementById('login-welcome-state');
      const progressBar = document.getElementById('welcome-progress-bar');
      
      if (formState && welcomeState) {
        formState.style.display = 'none';
        welcomeState.style.display = 'block';
        
        // Trigger progress bar transition
        setTimeout(() => {
          if (progressBar) progressBar.style.width = '100%';
        }, 50);
        
        // Wait ~1 second then redirect
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 500);
    
  }, 1500);
}

// Hook password checklists and page authentication routing checks on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';
  const session = getSession();
  
  if (isLoginPage) {
    if (session) {
      window.location.replace('dashboard.html');
      return;
    }
  } else {
    if (!session) {
      window.location.replace('index.html');
      return;
    }
    
    // Auto-populate user details in profile inputs if matching selectors exist
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    if (profileName) profileName.value = session.name || '';
    if (profileEmail) profileEmail.value = session.email || '';
    if (profilePhone) profilePhone.value = session.mobile || '';
    
    // Set up active shared state subscription
    setupStateSync(session);
  }

  // Attach live checklists
  const regPassword = document.getElementById('register-password');
  if (regPassword) {
    regPassword.addEventListener('input', (e) => {
      updateChecklist(e.target.value, '');
    });
  }
  
  const forgotNewPassword = document.getElementById('forgot-new-password');
  if (forgotNewPassword) {
    forgotNewPassword.addEventListener('input', (e) => {
      updateChecklist(e.target.value, 'forgot-');
    });
  }

  // Set up logout link interceptors and page transitions
  initPageTransitions();

  // Initialize OTP boxes
  setupOTPBoxes('register');
  setupOTPBoxes('forgot');

  // Initialize Stage Workspace for Stage 0 if workspace element is present
  if (document.getElementById('stage-0-mission-workspace')) {
    window.stage0Mission = new StageWorkspace('stage-0-mission-workspace');
  }
});

// Central Shared State Handlers
function setupStateSync(session) {
  if (!window.IMReadyState) return;

  // Sync initial user details from session if not set
  const state = window.IMReadyState.getState();
  if (session && (!state.student.name || state.student.name === "Student")) {
    window.IMReadyState.updateState({
      student: {
        name: session.name || "Student",
        email: session.email || "",
        phone: session.mobile || ""
      }
    });
  }

  // Subscribe to central state changes to update DOM elements reactively
  window.IMReadyState.subscribe((state) => {
    updateDashboardUI(state);
    updateJourneyUI(state);
    updateProfileUI(state);
    updateWorkspacePageUI(state);
  });

  // Call once initially to draw current state
  const currentState = window.IMReadyState.getState();
  updateDashboardUI(currentState);
  updateJourneyUI(currentState);
  updateProfileUI(currentState);
  updateWorkspacePageUI(currentState);
}

function updateDashboardUI(state) {
  // Name
  const nameEl = document.getElementById('dashboard-student-name');
  if (nameEl) {
    nameEl.textContent = state.student.name || 'Student';
  }

  // Status Badge
  const badgeEl = document.getElementById('dashboard-status-badge');
  if (badgeEl) {
    const prevText = badgeEl.textContent;
    badgeEl.textContent = state.journey.statusText;
    if (prevText !== state.journey.statusText) {
      // micro-animation: pulse badge on update
      badgeEl.classList.remove('pulse-animation');
      void badgeEl.offsetWidth; // trigger reflow
      badgeEl.classList.add('pulse-animation');
    }
    
    // Style depending on status
    if (state.journey.statusText === 'Under Technical Review') {
      badgeEl.style.background = 'rgba(212, 168, 71, 0.08)';
      badgeEl.style.borderColor = 'rgba(212, 168, 71, 0.15)';
      badgeEl.style.color = 'var(--brand-accent)';
    } else {
      badgeEl.style.background = 'rgba(0,212,255,0.06)';
      badgeEl.style.borderColor = 'rgba(0,212,255,0.15)';
      badgeEl.style.color = 'var(--brand-secondary)';
    }
  }

  // Progress Pct
  const pctEl = document.getElementById('dashboard-progress-pct');
  if (pctEl) {
    pctEl.textContent = `${state.journey.overallProgress}%`;
  }

  // Progress Bar
  const barEl = document.getElementById('dashboard-progress-bar');
  if (barEl) {
    barEl.style.width = `${state.journey.overallProgress}%`;
    barEl.style.transition = 'width 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
  }

  // Required Next Step
  const nextTitle = document.getElementById('dashboard-next-title');
  const nextDesc = document.getElementById('dashboard-next-desc');
  const nextBtn = document.getElementById('dashboard-next-btn');

  if (nextTitle && nextDesc && nextBtn) {
    if (state.student.profileCompleteness < 100) {
      nextTitle.textContent = "Complete Your Profile";
      nextDesc.textContent = "Set up your academic details to align with the first batch of industry projects.";
      nextBtn.textContent = "Complete Profile";
      nextBtn.onclick = () => location.href = 'profile.html';
    } else if (!state.assessment.submitCompleted) {
      nextTitle.textContent = "Complete Initial Assessment";
      nextDesc.textContent = "Showcase your problem-solving capabilities by completing the core analytical scenario review.";
      nextBtn.textContent = state.assessment.unlockedStep > 0 ? "Continue Assessment" : "Start Assessment";
      nextBtn.onclick = () => location.href = 'stage-workspace.html';
    } else {
      nextTitle.textContent = "Assessment Under Review";
      nextDesc.textContent = "Our team is reviewing your Stage 0 submission. We'll unlock Stage 1 as soon as it passes.";
      nextBtn.textContent = "Review Submission";
      nextBtn.onclick = () => location.href = 'stage-workspace.html';
    }
  }

  // Lock Banner
  const lockBanner = document.getElementById('dashboard-lock-banner');
  if (lockBanner) {
    lockBanner.style.display = state.assessment.submitCompleted ? 'none' : 'flex';
  }

  // Unlock Stage 1 if assessment is completed
  const stage1El = document.getElementById('dashboard-stage-1');
  if (stage1El) {
    if (state.assessment.submitCompleted) {
      stage1El.style.opacity = '1';
      stage1El.style.pointerEvents = 'auto';
      stage1El.style.userSelect = 'auto';
      
      const lockIconContainer = stage1El.querySelector('.stage-lock-icon-container');
      if (lockIconContainer) {
        lockIconContainer.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-secondary)" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      }
    } else {
      stage1El.style.opacity = '0.45';
      stage1El.style.pointerEvents = 'none';
      stage1El.style.userSelect = 'none';
      
      const lockIconContainer = stage1El.querySelector('.stage-lock-icon-container');
      if (lockIconContainer) {
        lockIconContainer.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--text-muted);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
      }
    }
  }

  // Activity Container
  const activityContainer = document.getElementById('dashboard-activity-container');
  if (activityContainer && state.recentActivity) {
    if (state.recentActivity.length === 0) {
      activityContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text-muted); opacity: 0.7; border: 1.5px dashed rgba(255,255,255,0.04); border-radius: 16px; padding: 2rem; width: 100%; box-sizing: border-box;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span style="font-size: 0.85rem; font-family: 'JetBrains Mono', monospace;">No activity yet.</span>
        </div>
      `;
    } else {
      let html = '<div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">';
      state.recentActivity.forEach((act) => {
        html += `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; width: 100%; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="pulse-dot" style="background: var(--brand-secondary);"></span>
              <span style="font-size: 0.9rem; color: var(--text-primary);">${act.text}</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">${act.time}</span>
          </div>
        `;
      });
      html += '</div>';
      activityContainer.innerHTML = html;
    }
  }
}

function updateJourneyUI(state) {
  // Current Stage title
  const stageTitle = document.getElementById('journey-stage-title');
  if (stageTitle) {
    stageTitle.textContent = state.assessment.submitCompleted ? "Stage 1 — Learning" : "Pre-Stage 1";
  }

  // Header status text
  const headerStatus = document.getElementById('journey-header-status');
  if (headerStatus) {
    headerStatus.textContent = state.journey.statusText;
    if (state.journey.statusText === 'Under Technical Review') {
      headerStatus.style.color = 'var(--brand-accent)';
    } else {
      headerStatus.style.color = 'var(--brand-secondary)';
    }
  }

  // Progress percentage
  const pctEl = document.getElementById('journey-progress-pct');
  if (pctEl) {
    pctEl.textContent = `${state.journey.overallProgress}%`;
  }

  // Progress Bar
  const barEl = document.getElementById('journey-progress-bar');
  if (barEl) {
    barEl.style.width = `${state.journey.overallProgress}%`;
    barEl.style.transition = 'width 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
  }

  // Next active step CTA block
  const nextTitle = document.getElementById('journey-next-title');
  const nextDesc = document.getElementById('journey-next-desc');
  const nextBtn = document.getElementById('current-mission-cta-btn');

  if (nextTitle && nextDesc && nextBtn) {
    if (state.assessment.submitCompleted) {
      nextTitle.textContent = "Stage 1 Initiation";
      nextDesc.textContent = "Welcome to the initiation stage. Start your fundamental coursework on the command structure.";
      nextBtn.textContent = "Enter Stage 1 Workspace";
      nextBtn.onclick = () => location.href = 'stage-workspace.html';
    } else {
      nextTitle.textContent = "Initial Assessment";
      nextDesc.textContent = "This assessment is your gateway into the IMReady Journey. Once submitted, our team will review your work. After successful review, Stage 1 will unlock.";
      nextBtn.textContent = state.assessment.unlockedStep > 0 ? "Continue Assessment" : "Start Assessment";
      nextBtn.onclick = () => location.href = 'stage-workspace.html';
    }
  }

  // Timeline Connector Line fill
  const lineEl = document.getElementById('journey-timeline-line');
  if (lineEl) {
    const progress = state.journey.overallProgress;
    if (progress === 0) {
      lineEl.style.background = 'rgba(255,255,255,0.06)';
    } else if (progress < 100) {
      lineEl.style.background = `linear-gradient(to bottom, var(--brand-secondary) ${progress}%, rgba(255,255,255,0.06) ${progress}%)`;
    } else {
      lineEl.style.background = 'var(--brand-secondary)';
    }
  }

  // Adjust vertical timeline line bottom offset to end exactly at the center of the final node
  const lastStageWrapper = document.getElementById('journey-timeline-stage-5');
  if (lastStageWrapper && lineEl) {
    const updateLineHeight = () => {
      const cardEl = lastStageWrapper.querySelector('.timeline-card-content');
      if (cardEl) {
        const cardHeight = cardEl.offsetHeight;
        // Node top is 4px. Center is 4px + 12px = 16px.
        const bottomOffset = cardHeight - 16;
        lineEl.style.bottom = `${bottomOffset}px`;
      }
    };
    
    updateLineHeight();

    // Register ResizeObserver if not already registered to react to resizing/reflowing
    if (typeof ResizeObserver !== 'undefined' && !window.journeyTimelineObserver) {
      window.journeyTimelineObserver = new ResizeObserver(() => {
        updateLineHeight();
      });
      window.journeyTimelineObserver.observe(lastStageWrapper);
    }
  }

  // Stage 0 card update
  const stage0Card = document.getElementById('journey-timeline-stage-0');
  if (stage0Card) {
    const badgeText = stage0Card.querySelector('span[style*="monospace"]');
    const ctaBtn = document.getElementById('stage-0-cta-btn');
    if (state.assessment.submitCompleted) {
      if (badgeText) badgeText.textContent = "Stage 0 — Completed";
      if (ctaBtn) {
        ctaBtn.textContent = "Review Submission";
        ctaBtn.classList.remove('btn-outline');
        ctaBtn.classList.add('btn-primary');
      }
    } else {
      if (badgeText) badgeText.textContent = "Stage 0 — Current";
      if (ctaBtn) {
        ctaBtn.textContent = state.assessment.unlockedStep > 0 ? "Continue Assessment" : "Start Assessment";
      }
    }
  }

  // Stage 1 card lock/unlock update
  const stage1Card = document.getElementById('journey-timeline-stage-1');
  if (stage1Card) {
    const badgeText = stage1Card.querySelector('span[style*="monospace"]');
    const nodeEl = stage1Card.querySelector('div[style*="left: -2.5rem"]');
    const cardContent = stage1Card.querySelector('.timeline-card-content');
    if (state.assessment.submitCompleted) {
      if (cardContent) {
        cardContent.style.opacity = '1';
        cardContent.style.pointerEvents = 'auto';
        cardContent.style.userSelect = 'auto';
      }
      if (badgeText) {
        badgeText.textContent = "Stage 1 — Current";
        badgeText.style.color = 'var(--brand-secondary)';
      }
      if (nodeEl) {
        nodeEl.style.borderColor = 'var(--brand-secondary)';
        nodeEl.innerHTML = `<div style="width: 8px; height: 8px; border-radius: 50%; background: var(--brand-secondary); animation: pulse-glow 2s infinite;"></div>`;
      }
    } else {
      if (cardContent) {
        cardContent.style.opacity = '0.45';
        cardContent.style.pointerEvents = 'none';
        cardContent.style.userSelect = 'none';
      }
      if (badgeText) {
        badgeText.textContent = "Stage 1 — Locked";
        badgeText.style.color = 'var(--text-muted)';
      }
      if (nodeEl) {
        nodeEl.style.borderColor = 'var(--text-muted)';
        nodeEl.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
      }
    }
  }
}

function updateProfileUI(state) {
  // Populate form elements if on Profile Page
  if (!window.location.pathname.endsWith('profile.html')) return;

  const fields = {
    'profile-name': state.student.name,
    'profile-email': state.student.email,
    'profile-phone': state.student.phone,
    'profile-univ': state.student.academic.university,
    'profile-degree': state.student.academic.degree,
    'profile-grad-year': state.student.academic.gradYear,
    'profile-gpa': state.student.academic.gpa,
    'profile-bio': state.student.bio
  };

  for (const [id, value] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el && !el.matches(':focus')) {
      el.value = value || '';
      if (id === 'profile-bio' && document.getElementById('bio-char-count')) {
        document.getElementById('bio-char-count').textContent = (value || '').length;
      }
    }
  }
}

function updateWorkspacePageUI(state) {
  if (!window.location.pathname.endsWith('stage-workspace.html')) return;

  if (window.stage0Mission) {
    window.stage0Mission.updateUI();
  }
}

function calculateProfileCompleteness(student) {
  let totalFields = 8;
  let filled = 0;
  if (student.name) filled++;
  if (student.email) filled++;
  if (student.phone) filled++;
  if (student.academic.university) filled++;
  if (student.academic.degree) filled++;
  if (student.academic.gradYear) filled++;
  if (student.academic.gpa) filled++;
  if (student.bio) filled++;
  return Math.round((filled / totalFields) * 100);
}

// 20. Student Profile Page Logic
function handleProfileSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('profile-name').value;
  const email = document.getElementById('profile-email').value;
  const phone = document.getElementById('profile-phone').value;
  const university = document.getElementById('profile-univ').value;
  const degree = document.getElementById('profile-degree').value;
  const gradYear = document.getElementById('profile-grad-year').value;
  const gpa = document.getElementById('profile-gpa').value;
  const bio = document.getElementById('profile-bio').value;

  const studentData = {
    name,
    email,
    phone,
    academic: {
      university,
      degree,
      gradYear,
      gpa
    },
    bio
  };

  const completeness = calculateProfileCompleteness(studentData);
  studentData.profileCompleteness = completeness;

  // Update session storage details
  const session = getSession();
  if (session) {
    session.name = name;
    session.email = email;
    session.mobile = phone;
    sessionStorage.setItem('imready_session', JSON.stringify(session));
  }

  // Update central state
  window.IMReadyState.updateState({
    student: studentData,
    recentActivity: [
      { text: "Updated profile details", time: "Just now" },
      ...window.IMReadyState.getState().recentActivity.slice(0, 4)
    ]
  });

  const successModal = document.getElementById('profile-success-modal');
  if (successModal) {
    successModal.classList.add('open');
    document.body.classList.add('modal-open');
  }
}

function closeProfileSuccessModal() {
  const successModal = document.getElementById('profile-success-modal');
  if (successModal) {
    successModal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
}

// Character counter for Bio
const bioTextarea = document.getElementById('profile-bio');
const bioCountSpan = document.getElementById('bio-char-count');
if (bioTextarea && bioCountSpan) {
  bioTextarea.addEventListener('input', () => {
    bioCountSpan.textContent = bioTextarea.value.length;
  });
}

// 21. Stage 0 Assessment Workspace Expansion
function expandStage0Workspace() {
  location.href = 'journey.html';
}

// 22. StageWorkspace Controller Class for Evolving Command Card
class StageWorkspace {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Preparation verification tasks
    this.deliverablesReviewed = false;
    this.evaluationReviewed = false;
    this.resourcesReviewed = false;
    this.activeDrawerKey = null;

    // Workbench execution sub-states
    this.pdfAttached = false;
    this.logsStreamed = false;

    // Load initial parameters from state manager
    const state = window.IMReadyState.getState();
    this.briefCompleted = state.assessment.briefCompleted || false;
    this.prepCompleted = state.assessment.prepCompleted || false;
    this.downloadCompleted = state.assessment.downloadCompleted || false;
    this.submitCompleted = state.assessment.submitCompleted || false;

    this.determineCurrentStep();
    this.init();
  }

  determineCurrentStep() {
    if (this.submitCompleted) {
      this.currentStep = 4; // Review Mode
    } else if (this.prepCompleted) {
      this.currentStep = 3; // Development Workbench
    } else if (this.briefCompleted) {
      this.currentStep = 2; // Preparation Console
    } else {
      this.currentStep = 1; // Mission Briefing
    }
  }

  init() {
    this.updateUI();
  }

  updateUI() {
    const state = window.IMReadyState.getState();
    this.briefCompleted = state.assessment.briefCompleted || false;
    this.prepCompleted = state.assessment.prepCompleted || false;
    this.downloadCompleted = state.assessment.downloadCompleted || false;
    this.submitCompleted = state.assessment.submitCompleted || false;

    this.determineCurrentStep();

    // 1. Update Step Indicator & Header Metadata
    const stepIndicator = document.getElementById('mission-step-indicator');
    const milestoneText = document.getElementById('mission-milestone-text');
    const statusBadge = document.getElementById('stage-0-status-badge');

    if (stepIndicator) stepIndicator.textContent = `Step ${this.currentStep} of 4`;

    if (milestoneText) {
      if (this.currentStep === 4) {
        milestoneText.textContent = 'Under Technical Review';
      } else if (this.currentStep === 3) {
        milestoneText.textContent = 'Active Workbench';
      } else if (this.currentStep === 2) {
        milestoneText.textContent = 'Preparation Phase';
      } else {
        milestoneText.textContent = 'Initialized';
      }
    }

    if (statusBadge) {
      if (this.currentStep === 4) {
        statusBadge.textContent = 'Under Review';
        statusBadge.style.background = 'rgba(212, 168, 71, 0.08)';
        statusBadge.style.borderColor = 'rgba(212, 168, 71, 0.15)';
        statusBadge.style.color = 'var(--brand-accent)';
      } else if (this.currentStep === 3) {
        statusBadge.textContent = 'Active Workbench';
        statusBadge.style.background = 'rgba(0, 212, 255, 0.08)';
        statusBadge.style.borderColor = 'rgba(0, 212, 255, 0.2)';
        statusBadge.style.color = 'var(--brand-secondary)';
      } else {
        statusBadge.textContent = 'Initialized';
        statusBadge.style.background = 'rgba(26, 72, 173, 0.08)';
        statusBadge.style.borderColor = 'rgba(26, 72, 173, 0.15)';
        statusBadge.style.color = 'var(--brand-primary)';
      }
    }

    // Update Horizontal Step Tracker & indicator dots
    for (let i = 1; i <= 4; i++) {
      // 1.1 Update dots
      const dot = document.getElementById(`dot-step-${i}`);
      if (dot) {
        dot.classList.toggle('active', i === this.currentStep);
      }

      // 1.2 Update horizontal tracker steps
      const trackerStep = document.getElementById(`tracker-step-${i}`);
      if (trackerStep) {
        const stepNum = trackerStep.querySelector('span:first-child');
        const stepName = trackerStep.querySelector('span:last-child');
        
        if (i === this.currentStep) {
          // Active Step
          trackerStep.style.borderTopColor = 'var(--brand-primary)';
          trackerStep.style.opacity = '1';
          if (stepNum) stepNum.style.color = 'var(--brand-primary)';
          if (stepName) {
            stepName.style.color = 'var(--text-primary)';
            stepName.style.fontWeight = '600';
          }
        } else if (i < this.currentStep) {
          // Completed Step
          trackerStep.style.borderTopColor = 'var(--brand-secondary)';
          trackerStep.style.opacity = '1';
          if (stepNum) stepNum.style.color = 'var(--brand-secondary)';
          if (stepName) {
            stepName.style.color = 'var(--text-secondary)';
            stepName.style.fontWeight = '500';
          }
        } else {
          // Pending Step
          trackerStep.style.borderTopColor = 'var(--border-light)';
          trackerStep.style.opacity = '0.5';
          if (stepNum) stepNum.style.color = 'var(--text-muted)';
          if (stepName) {
            stepName.style.color = 'var(--text-muted)';
            stepName.style.fontWeight = '500';
          }
        }
      }
    }

    // 2. Show Active Viewpane (1 to 4)
    const panes = {
      1: 'pane-brief',
      2: 'pane-prep',
      3: 'pane-workbench',
      4: 'pane-review'
    };
    Object.entries(panes).forEach(([step, paneId]) => {
      const paneEl = document.getElementById(paneId);
      if (paneEl) {
        paneEl.style.display = parseInt(step) === this.currentStep ? 'block' : 'none';
      }
    });

    // 3. Update Checkboxes for Prep phase (Step 2)
    const checkDeliv = document.getElementById('check-deliverables');
    const checkEval = document.getElementById('check-evaluation');
    const checkRes = document.getElementById('check-resources');
    if (checkDeliv) checkDeliv.checked = this.deliverablesReviewed;
    if (checkEval) checkEval.checked = this.evaluationReviewed;
    if (checkRes) checkRes.checked = this.resourcesReviewed;

    // Toggle custom visual double-ring checkboxes and card left borders
    const customDeliv = document.getElementById('custom-check-deliverables');
    const customEval = document.getElementById('custom-check-evaluation');
    const customRes = document.getElementById('custom-check-resources');

    const cardDeliv = document.getElementById('check-card-deliverables');
    const cardEval = document.getElementById('check-card-evaluation');
    const cardRes = document.getElementById('check-card-resources');

    if (customDeliv) {
      const dot = customDeliv.querySelector('.custom-checkbox-dot');
      if (this.deliverablesReviewed) {
        customDeliv.style.borderColor = 'var(--brand-secondary)';
        if (dot) dot.style.transform = 'scale(1)';
        if (cardDeliv) cardDeliv.style.borderLeftColor = 'var(--brand-secondary)';
      } else {
        customDeliv.style.borderColor = 'var(--text-muted)';
        if (dot) dot.style.transform = 'scale(0)';
        if (cardDeliv) cardDeliv.style.borderLeftColor = 'var(--border-light)';
      }
    }
    if (customEval) {
      const dot = customEval.querySelector('.custom-checkbox-dot');
      if (this.evaluationReviewed) {
        customEval.style.borderColor = 'var(--brand-secondary)';
        if (dot) dot.style.transform = 'scale(1)';
        if (cardEval) cardEval.style.borderLeftColor = 'var(--brand-secondary)';
      } else {
        customEval.style.borderColor = 'var(--text-muted)';
        if (dot) dot.style.transform = 'scale(0)';
        if (cardEval) cardEval.style.borderLeftColor = 'var(--border-light)';
      }
    }
    if (customRes) {
      const dot = customRes.querySelector('.custom-checkbox-dot');
      if (this.resourcesReviewed) {
        customRes.style.borderColor = 'var(--brand-secondary)';
        if (dot) dot.style.transform = 'scale(1)';
        if (cardRes) cardRes.style.borderLeftColor = 'var(--brand-secondary)';
      } else {
        customRes.style.borderColor = 'var(--text-muted)';
        if (dot) dot.style.transform = 'scale(0)';
        if (cardRes) cardRes.style.borderLeftColor = 'var(--border-light)';
      }
    }

    const continueBtn = document.getElementById('btn-prep-continue');
    if (continueBtn) {
      continueBtn.disabled = !(this.deliverablesReviewed && this.evaluationReviewed && this.resourcesReviewed);
    }

    // 4. Update Workbench Sub-States Layout (Step 3)
    if (this.currentStep === 3) {
      const objTitle = document.getElementById('workbench-objective-title');
      const downloadSec = document.getElementById('workbench-download-sec');
      const uploadSec = document.getElementById('workbench-upload-sec');
      const repoSec = document.getElementById('workbench-repo-sec');
      const submitBtn = document.getElementById('stage-0-submit-btn');
      const guideText = document.getElementById('workbench-guidance-text');

      // Top horizontal completed badges
      const badgeDownloaded = document.getElementById('workbench-download-summary');
      const badgeUploaded = document.getElementById('workbench-upload-summary');
      if (badgeDownloaded) badgeDownloaded.style.display = this.downloadCompleted ? 'flex' : 'none';
      if (badgeUploaded) badgeUploaded.style.display = this.pdfAttached ? 'flex' : 'none';

      // Dropzone vs Attached Card
      const uploaderDropzone = document.getElementById('pdf-uploader-box');
      const uploaderAttached = document.getElementById('workbench-uploader-attached');
      if (uploaderDropzone) uploaderDropzone.style.display = this.pdfAttached ? 'none' : 'block';
      if (uploaderAttached) uploaderAttached.style.display = this.pdfAttached ? 'flex' : 'none';

      if (!this.downloadCompleted) {
        // Sub-state 3.1: Download Package
        if (objTitle) objTitle.textContent = 'Download your starter package files.';
        if (downloadSec) { downloadSec.style.display = 'flex'; downloadSec.style.opacity = '1'; }
        if (uploadSec) { uploadSec.style.opacity = '0.15'; uploadSec.style.pointerEvents = 'none'; }
        if (repoSec) { repoSec.style.opacity = '0.15'; repoSec.style.pointerEvents = 'none'; }
        if (submitBtn) submitBtn.style.display = 'none';
        if (guideText) {
          guideText.innerHTML = `<strong>What to do next:</strong> Click the "Download" button to save the assessment starter files. This package contains local testing structures, configuration parameters, and execution scripts.`;
        }
      } else if (!this.pdfAttached) {
        // Sub-state 3.2: Upload PDF
        if (objTitle) objTitle.textContent = 'Upload your completed design proposal.';
        if (downloadSec) downloadSec.style.display = 'none';
        if (uploadSec) { uploadSec.style.opacity = '1'; uploadSec.style.pointerEvents = 'auto'; }
        if (repoSec) { repoSec.style.opacity = '0.15'; repoSec.style.pointerEvents = 'none'; }
        if (submitBtn) submitBtn.style.display = 'none';
        if (guideText) {
          guideText.innerHTML = `<strong>What to do next:</strong> Baseline files downloaded. Draft your systems concurrency proposal specifying tables layout and query lock scopes, export it to PDF, and upload it in the dropzone above.`;
        }
      } else {
        // Sub-state 3.3: Link Repository URL
        if (objTitle) objTitle.textContent = 'Link your Git repository URL and deploy.';
        if (downloadSec) downloadSec.style.display = 'none';
        if (uploadSec) { uploadSec.style.opacity = '1'; uploadSec.style.pointerEvents = 'auto'; }
        if (repoSec) { repoSec.style.opacity = '1'; repoSec.style.pointerEvents = 'auto'; }
        if (submitBtn) submitBtn.style.display = 'flex';
        if (guideText) {
          guideText.innerHTML = `<strong>What to do next:</strong> Document uploaded successfully! Finally, enter your public git repository link containing your schema migrations and API tests, then click "Deploy Proposal" to initiate automated CI checks.`;
        }
      }
      this.validateSubmissionForm();
    }

    // 5. Render Historical Completed Milestones
    const historyStack = document.getElementById('workspace-history-stack');
    if (historyStack) {
      historyStack.innerHTML = '';
      let hasHistory = false;

      if (this.currentStep > 1) {
        hasHistory = true;
        historyStack.appendChild(this.createHistoryItem(
          '1. Mission Brief Completed',
          'Review Brief',
          'brief-details'
        ));
      }
      if (this.currentStep > 2) {
        hasHistory = true;
        historyStack.appendChild(this.createHistoryItem(
          '2. Preparation Console Completed',
          'Review Checks',
          'prep-details'
        ));
      }
      if (this.currentStep > 3 && this.downloadCompleted) {
        hasHistory = true;
        historyStack.appendChild(this.createHistoryItem(
          '3. Starter Package Downloaded',
          'Review Package',
          'download-details'
        ));
      }

      historyStack.style.display = hasHistory ? 'flex' : 'none';
    }

    // 6. Render Future Locked Steps
    const lockedStack = document.getElementById('workspace-locked-stack');
    if (lockedStack) {
      lockedStack.innerHTML = '';
      let hasLocked = false;
      const lockedSteps = {
        2: { title: '2. Preparation Console', hint: 'Requires Mission Brief' },
        3: { title: '3. Development Workbench', hint: 'Requires Prep verification' },
        4: { title: '4. Technical Review', hint: 'Requires Submission' }
      };

      for (let i = this.currentStep + 1; i <= 4; i++) {
        if (lockedSteps[i]) {
          hasLocked = true;
          const lockedItem = document.createElement('div');
          lockedItem.style.display = 'flex';
          lockedItem.style.justifyContent = 'space-between';
          lockedItem.style.alignItems = 'center';
          lockedItem.style.padding = '0.55rem 0.85rem';
          lockedItem.style.background = 'var(--bg-glass)';
          lockedItem.style.border = '1px solid var(--border-light)';
          lockedItem.style.borderRadius = '6px';
          lockedItem.style.fontSize = '0.75rem';
          lockedItem.style.color = 'var(--text-muted)';
          lockedItem.style.fontFamily = "'JetBrains Mono', monospace";
          lockedItem.innerHTML = `
            <span>🔒 ${lockedSteps[i].title}</span>
            <span style="font-size: 0.65rem; color: var(--text-muted); opacity: 0.6;">${lockedSteps[i].hint}</span>
          `;
          lockedStack.appendChild(lockedItem);
        }
      }

      lockedStack.style.display = hasLocked ? 'flex' : 'none';
    }

    // 7. Handle Review Mode live status timeline (Step 4)
    if (this.currentStep === 4 && !this.logsStreamed) {
      this.streamReviewLogs();
    }
  }

  createHistoryItem(title, status, drawerKey) {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '0.55rem 0.85rem';
    item.style.background = 'var(--bg-glass)';
    item.style.border = '1px solid var(--border-light)';
    item.style.borderRadius = '6px';
    item.style.fontSize = '0.78rem';
    item.style.color = 'var(--text-secondary)';
    item.style.fontFamily = "'JetBrains Mono', monospace";
    item.innerHTML = `
      <span>✓ ${title}</span>
      <span style="font-size: 0.7rem; color: var(--brand-primary); cursor: pointer; font-weight: 500;" onclick="window.stage0Mission.openDetailsDrawer('${drawerKey}')">${status}</span>
    `;
    return item;
  }

  openDetailsDrawer(key) {
    this.activeDrawerKey = key;
    const drawer = document.getElementById('workspace-drawer');
    const backdrop = document.getElementById('workspace-drawer-backdrop');
    const titleEl = document.getElementById('drawer-title');
    const bodyEl = document.getElementById('drawer-body');

    if (!drawer || !backdrop || !titleEl || !bodyEl) return;

    const state = window.IMReadyState.getState();
    let title = '';
    let body = '';

    if (key === 'deliverables') {
      title = 'Deliverables Specification';
      body = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p>Review the specific deliverables required for Stage 0:</p>
          <div style="background: var(--bg-mindset); border-left: 2px solid var(--brand-primary); padding: 0.75rem; border-radius: 4px;">
            <strong>System Block Diagram</strong>
            <p style="margin: 4px 0 0; color: var(--text-secondary); font-size: 0.8rem;">Visual mapping of APIs, message router gateways, database indices, and event loops.</p>
          </div>
          <div style="background: var(--bg-mindset); border-left: 2px solid var(--brand-primary); padding: 0.75rem; border-radius: 4px;">
            <strong>Queue Relational DB Mappings</strong>
            <p style="margin: 4px 0 0; color: var(--text-secondary); font-size: 0.8rem;">Database schema outlining indices, partition keys, and schema transaction isolation constraints.</p>
          </div>
        </div>
      `;
    } else if (key === 'evaluation') {
      title = 'Evaluation Rubrics';
      body = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p>Evaluation scoring distributions:</p>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
            <div><strong>• Separation of Concerns (40%):</strong> Clean API routing decoupling from worker queries.</div>
            <div><strong>• Concurrency Locking Safety (30%):</strong> SQL transactions isolation prevention.</div>
            <div><strong>• Performance Load Limits (30%):</strong> Handling duplicate check-ins event safety.</div>
          </div>
        </div>
      `;
    } else if (key === 'resources') {
      title = 'Resources & Guides';
      body = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p>Starter template documents:</p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-mindset); padding: 0.5rem; border-radius: 4px;">
              <span>Architecture Template (Markdown)</span>
              <button class="btn btn-outline" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">Download</button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-mindset); padding: 0.5rem; border-radius: 4px;">
              <span>Sample Database Schema SQL</span>
              <button class="btn btn-outline" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">Download</button>
            </div>
          </div>
        </div>
      `;
    } else if (key === 'brief-details') {
      title = 'Mission Briefing';
      body = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p>Initial Assessment for Canteen Concurrency Design:</p>
          <div style="background: var(--bg-mindset); padding: 0.75rem; border-radius: 8px; border-left: 2px solid var(--brand-primary);">
            <strong>Objective</strong>
            <p style="margin: 4px 0 0; color: var(--text-secondary); font-size: 0.8rem;">Design a scalable database locking scheme and API routes to handle peak campus canteen checkout load (1,000+ simultaneous requests).</p>
          </div>
        </div>
      `;
    } else if (key === 'prep-details') {
      title = 'Preparation Verification';
      body = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p>Completed preparation criteria review:</p>
          <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.8rem;">
            <div><strong>✓ Deliverables checked:</strong> SQL Schema draft & diagram definitions.</div>
            <div><strong>✓ Evaluation rubric reviewed:</strong> Locking safety rules (30% weight).</div>
            <div><strong>✓ References checked:</strong> Markdown baseline templates downloaded.</div>
          </div>
        </div>
      `;
    } else if (key === 'download-details') {
      title = 'Assessment Package';
      body = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p>Baseline environment package downloaded:</p>
          <div style="background: var(--bg-mindset); padding: 0.75rem; border-radius: 8px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--brand-primary); font-weight: 500;">baseline_package.zip</span>
            <div style="margin-top: 6px; font-size: 0.75rem; color: var(--text-secondary);">Contains template documents, local testing schema, and instructions.</div>
          </div>
        </div>
      `;
    }

    titleEl.textContent = title;
    bodyEl.innerHTML = body;

    backdrop.classList.add('open');
  }

  closeDrawer() {
    const drawer = document.getElementById('workspace-drawer');
    const backdrop = document.getElementById('workspace-drawer-backdrop');

    if (!drawer || !backdrop) return;

    backdrop.classList.remove('open');

    // Mark tasks complete reactively on close
    if (this.currentStep === 2) {
      if (this.activeDrawerKey === 'deliverables') this.deliverablesReviewed = true;
      if (this.activeDrawerKey === 'evaluation') this.evaluationReviewed = true;
      if (this.activeDrawerKey === 'resources') this.resourcesReviewed = true;
      this.updateUI();
    }

    this.activeDrawerKey = null;
  }

  completeBrief() {
    this.briefCompleted = true;
    window.IMReadyState.updateState({
      assessment: {
        briefCompleted: true
      }
    });
    this.updateUI();
  }

  completePrep() {
    this.prepCompleted = true;
    window.IMReadyState.updateState({
      assessment: {
        prepCompleted: true
      }
    });
    this.updateUI();
  }

  triggerDownload() {
    const btn = document.getElementById('download-assessment-btn');
    if (!btn || btn.disabled) return;

    btn.disabled = true;
    btn.innerHTML = `<span class="btn-spinner" style="margin-right: 8px; vertical-align: middle;"></span>Downloading...`;

    setTimeout(() => {
      this.downloadCompleted = true;
      window.IMReadyState.updateState({
        journey: {
          overallProgress: 50
        },
        assessment: {
          downloadCompleted: true,
          unlockedStep: 7
        },
        recentActivity: [
          { text: "Downloaded Stage 0 assessment package", time: "Just now" },
          ...window.IMReadyState.getState().recentActivity.slice(0, 4)
        ]
      });
      this.updateUI();
    }, 1200);
  }

  simulateUpload() {
    const statusText = document.getElementById('upload-status-text');
    const dropzone = document.getElementById('workbench-uploader-dropzone');

    if (!statusText || !dropzone) return;

    dropzone.style.borderColor = 'var(--brand-primary)';
    statusText.innerHTML = `<span class="btn-spinner" style="margin-right: 8px; vertical-align: middle;"></span>Uploading system_design.pdf...`;

    setTimeout(() => {
      this.pdfAttached = true;
      dropzone.style.borderColor = 'var(--border-light)';
      statusText.innerHTML = `Upload completed proposal document (PDF)`;
      this.updateUI();
    }, 1000);
  }

  removeUploadedFile() {
    this.pdfAttached = false;
    this.updateUI();
  }

  validateSubmissionForm() {
    const githubInput = document.getElementById('submit-github-url');
    const feedback = document.getElementById('repo-verification-feedback');
    const submitBtn = document.getElementById('stage-0-submit-btn');

    let isValid = false;
    if (githubInput && githubInput.value.trim().length > 10) {
      isValid = true;
      if (feedback) {
        feedback.textContent = '✓ Repository Verified';
        feedback.style.color = 'var(--brand-primary)';
      }
    } else {
      if (feedback) {
        feedback.textContent = 'Please link a valid Git repository URL';
        feedback.style.color = 'var(--text-muted)';
      }
    }

    if (submitBtn) {
      submitBtn.disabled = !(this.pdfAttached && isValid);
    }
  }

  triggerSubmit() {
    const btn = document.getElementById('stage-0-submit-btn');
    if (!btn || btn.disabled) return;

    btn.disabled = true;
    btn.innerHTML = `<span class="btn-spinner" style="margin-right: 8px; vertical-align: middle;"></span>Transmitting deployment package...`;

    setTimeout(() => {
      this.submitCompleted = true;
      const githubInput = document.getElementById('submit-github-url');
      const commentsInput = document.getElementById('submit-comments');

      window.IMReadyState.updateState({
        journey: {
          statusText: "Under Technical Review",
          overallProgress: 100,
          nextActionText: "Review Submission",
          nextActionUrl: "stage-workspace.html"
        },
        assessment: {
          submitCompleted: true,
          reviewStatus: "Under Technical Review",
          submissionTimestamp: new Date().toISOString(),
          githubUrl: githubInput ? githubInput.value : "",
          comments: commentsInput ? commentsInput.value : "",
          unlockedStep: 8
        },
        recentActivity: [
          { text: "Submitted Stage 0 design proposal", time: "Just now" },
          ...window.IMReadyState.getState().recentActivity.slice(0, 4)
        ]
      });
      this.updateUI();
    }, 1200);
  }

  streamReviewLogs() {
    this.logsStreamed = true;

    const steps = [
      {
        id: 1,
        title: 'Transmit Assessment Package',
        activeStatus: 'Uploading...',
        completeStatus: 'Completed ✓',
        color: 'var(--brand-primary)'
      },
      {
        id: 2,
        title: 'Automated Schema Validation',
        activeStatus: 'Linting...',
        completeStatus: 'Completed ✓',
        color: 'var(--brand-primary)'
      },
      {
        id: 3,
        title: 'Allocate Reviewer Workspace',
        activeStatus: 'Queue Pos: #2',
        completeStatus: 'Assigned ✓',
        color: 'var(--brand-secondary)'
      },
      {
        id: 4,
        title: 'Mentor Panel Assessment',
        activeStatus: 'Reviewing...',
        completeStatus: 'Under Evaluation',
        color: 'var(--brand-accent)'
      }
    ];

    steps.forEach((step, idx) => {
      // Stagger step activations by 1.5s
      setTimeout(() => {
        const stepEl = document.getElementById(`pipeline-step-${step.id}`);
        if (!stepEl) return;

        // Make step active
        stepEl.style.opacity = '1';
        const circle = stepEl.querySelector('.step-indicator-circle');
        const status = stepEl.querySelector('.step-status');

        if (circle) {
          circle.style.background = step.color;
          circle.style.borderColor = step.color;
          circle.style.color = '#fff';
          if (step.id === 3 || step.id === 4) {
            circle.style.boxShadow = `0 0 10px ${step.color}`;
          }
        }
        if (status) {
          status.textContent = step.activeStatus;
          status.style.color = step.color;
        }

        // Complete the step after 1.2s (except the last one which remains active/running)
        if (step.id < 4) {
          setTimeout(() => {
            if (circle) {
              circle.style.background = 'rgba(0, 212, 255, 0.08)';
              circle.style.borderColor = 'rgba(0, 212, 255, 0.2)';
              circle.style.color = 'var(--brand-secondary)';
              circle.textContent = '✓';
              circle.style.boxShadow = 'none';
            }
            if (status) {
              status.textContent = step.completeStatus;
              status.style.color = 'var(--brand-secondary)';
            }
          }, 1200);
        }
      }, idx * 1500);
    });
  }
}

// Global Demo Data Reset Helper
function resetDemoSite() {
  if (confirm("Reset all demo data (registered accounts, session progress, and activity logs)?")) {
    localStorage.removeItem('imready_users');
    localStorage.removeItem('imready_shared_state');
    sessionStorage.removeItem('imready_session');
    window.location.href = 'index.html';
  }
}
