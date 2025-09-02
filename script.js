// Configuración Premium
const CONFIG = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  animations: {
    duration: 600,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    stagger: 150
  },
  ui: {
    scrollOffset: 72,
    throttleDelay: 16,
    notificationDuration: 4000
  },
  intersection: {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  },
  scheduling: {
    calendlyUrl: 'https://calendly.com/contacto-nodolocker/30min', // URL actualizada
    meetingDuration: 30,
    timezone: 'America/Mexico_City',
    fallbackEmail: 'contacto@nodolocker.com', // Cambiado a .com
    fallbackPhone: '+52 55 XXXX XXXX' // Tu número real
  } 
};

// Estado de la aplicación
const state = {
  isMenuOpen: false,
  scrollY: 0,
  currentSection: 'inicio',
  reducedMotion: false,
  touchDevice: false,
  animatedElements: new Set()
};

// Cache de elementos DOM
const elements = {};

// Inicialización
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
  detectCapabilities();
  cacheElements();
  initializeNavigation();
  initializeScrollEffects();
  initializeCTAButtons();
  initializeFormHandling();
  initializeSmoothAnimations();
  initializeTabs();
  initializeFloatingCTA();
  
  console.log('✅ Nodo Locker - Aplicación premium inicializada');
}

function detectCapabilities() {
  state.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  state.touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function cacheElements() {
  elements.navbar = document.querySelector('.navbar');
  elements.navToggle = document.querySelector('.nav-toggle');
  elements.navMenu = document.querySelector('.nav-menu');
  elements.navLinks = document.querySelectorAll('.nav-link');
  elements.heroSection = document.querySelector('.hero');
  elements.ctaButtons = {
    download: document.getElementById('downloadBtn'),
    schedule: document.getElementById('scheduleBtn'),
    scheduleMain: document.getElementById('scheduleMainBtn'),
    integrate: document.getElementById('integrateBtn'),
    joinWaitlist: document.getElementById('joinWaitlistBtn')
  };
  elements.contactForm = document.getElementById('contactForm');
  elements.newsletterForm = document.getElementById('newsletterForm');
  elements.tabButtons = document.querySelectorAll('.tab-btn');
  elements.tabPanels = document.querySelectorAll('.tab-panel');
  elements.floatingCTA = document.getElementById('floatingCTA');
}

// Sistema de navegación refinado
function initializeNavigation() {
  if (elements.navToggle) {
    elements.navToggle.addEventListener('click', toggleMobileMenu);
  }

  elements.navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
  });

  document.addEventListener('click', handleOutsideClick);
  initializeActiveNavigation();
}

function toggleMobileMenu() {
  state.isMenuOpen = !state.isMenuOpen;
  
  elements.navToggle.classList.toggle('active', state.isMenuOpen);
  elements.navMenu.classList.toggle('active', state.isMenuOpen);
  
  document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  
  elements.navToggle.setAttribute('aria-expanded', state.isMenuOpen);
  elements.navMenu.setAttribute('aria-hidden', !state.isMenuOpen);
}

function handleNavClick(e) {
  const href = e.target.closest('.nav-link').getAttribute('href');
  
  if (href && href.startsWith('#')) {
    e.preventDefault();
    
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      if (state.isMenuOpen) {
        toggleMobileMenu();
      }
      
      smoothScrollTo(targetElement);
      updateActiveNavLink(e.target.closest('.nav-link'));
      state.currentSection = targetId;
    }
  }
}

function smoothScrollTo(element) {
  const offsetTop = element.offsetTop - CONFIG.ui.scrollOffset;
  
  window.scrollTo({
    top: offsetTop,
    behavior: 'smooth'
  });
}

function updateActiveNavLink(activeLink) {
  elements.navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  activeLink.classList.add('active');
}

function handleOutsideClick(e) {
  if (state.isMenuOpen && 
      !elements.navMenu.contains(e.target) && 
      !elements.navToggle.contains(e.target)) {
    toggleMobileMenu();
  }
}

function initializeActiveNavigation() {
  const sections = document.querySelectorAll('section[id]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
        
        if (navLink && state.currentSection !== id) {
          updateActiveNavLink(navLink);
          state.currentSection = id;
        }
      }
    });
  }, {
    threshold: [0.2, 0.5, 0.8],
    rootMargin: `-${CONFIG.ui.scrollOffset}px 0px -40% 0px`
  });
  
  sections.forEach(section => {
    observer.observe(section);
  });

  // Detectar scroll manual para mejorar la precisión
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      detectCurrentSection();
    }, 100);
  }, { passive: true });
}

function detectCurrentSection() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + CONFIG.ui.scrollOffset + 100;
  
  let currentSection = 'inicio'; // default
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionBottom = sectionTop + sectionHeight;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSection = section.getAttribute('id');
    }
  });
  
  // Actualizar navegación si cambió la sección
  if (state.currentSection !== currentSection) {
    const navLink = document.querySelector(`.nav-link[href="#${currentSection}"]`);
    if (navLink) {
      updateActiveNavLink(navLink);
      state.currentSection = currentSection;
    }
  }
}

// Sistema de animaciones suaves y limpias
function initializeSmoothAnimations() {
  if (state.reducedMotion) return;
  
  // Crear observer para animaciones de entrada
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animationType = element.dataset.animate || 'fadeInUp';
        const delay = element.dataset.delay || 0;
        
        // Evitar re-animar elementos ya animados
        if (state.animatedElements.has(element)) return;
        
        setTimeout(() => {
          animateElement(element, animationType);
          state.animatedElements.add(element);
        }, parseInt(delay));
        
        // Dejar de observar el elemento una vez animado
        animationObserver.unobserve(element);
      }
    });
  }, {
    threshold: CONFIG.intersection.threshold,
    rootMargin: CONFIG.intersection.rootMargin
  });
  
  // Observar todos los elementos con data-animate
  const animatedElements = document.querySelectorAll('[data-animate]');
  animatedElements.forEach(element => {
    // Preparar elemento para animación
    prepareElementForAnimation(element);
    animationObserver.observe(element);
  });
  
  // Animar elementos en grupos con stagger
  initializeStaggeredAnimations();
}

function prepareElementForAnimation(element) {
  const animationType = element.dataset.animate || 'fadeInUp';
  
  // Aplicar estilos iniciales según el tipo de animación
  switch (animationType) {
    case 'fadeInUp':
      element.style.opacity = '0';
      element.style.transform = 'translateY(40px)';
      break;
    case 'fadeInDown':
      element.style.opacity = '0';
      element.style.transform = 'translateY(-40px)';
      break;
    case 'fadeInLeft':
      element.style.opacity = '0';
      element.style.transform = 'translateX(-40px)';
      break;
    case 'fadeInRight':
      element.style.opacity = '0';
      element.style.transform = 'translateX(40px)';
      break;
    case 'fadeIn':
      element.style.opacity = '0';
      break;
    case 'scaleIn':
      element.style.opacity = '0';
      element.style.transform = 'scale(0.8)';
      break;
    case 'slideInUp':
      element.style.opacity = '0';
      element.style.transform = 'translateY(60px)';
      break;
    default:
      element.style.opacity = '0';
      element.style.transform = 'translateY(40px)';
  }
  
  element.style.transition = `all ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
}

function animateElement(element, animationType) {
  // Aplicar animación según el tipo
  switch (animationType) {
    case 'fadeInUp':
    case 'fadeInDown':
    case 'fadeInLeft':
    case 'fadeInRight':
    case 'slideInUp':
      element.style.opacity = '1';
      element.style.transform = 'translateY(0) translateX(0)';
      break;
    case 'fadeIn':
      element.style.opacity = '1';
      break;
    case 'scaleIn':
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
      break;
    default:
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
  }
  
  // Añadir clase para efectos adicionales si es necesario
  element.classList.add('animated');
}

function initializeStaggeredAnimations() {
  // Animar grupos de elementos con retraso escalonado
  const staggerGroups = [
    { selector: '.feature-card', delay: 100 },
    { selector: '.step', delay: 150 },
    { selector: '.timeline-item', delay: 200 },
    { selector: '.stat', delay: 80 },
    { selector: '.benefit-list li', delay: 60 }
  ];
  
  staggerGroups.forEach(group => {
    const elements = document.querySelectorAll(group.selector);
    elements.forEach((element, index) => {
      if (!element.hasAttribute('data-animate')) {
        element.setAttribute('data-animate', 'fadeInUp');
        element.setAttribute('data-delay', index * group.delay);
      }
    });
  });
}

// Efectos de scroll optimizados
function initializeScrollEffects() {
  const throttledScrollHandler = throttle(updateScrollEffects, CONFIG.ui.throttleDelay);
  window.addEventListener('scroll', throttledScrollHandler, { passive: true });
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
}

function updateScrollEffects() {
  state.scrollY = window.scrollY;
  
  if (elements.navbar) {
    const isScrolled = state.scrollY > 50;
    elements.navbar.classList.toggle('scrolled', isScrolled);
  }
}

function updateScrollProgress() {
  const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  
  let progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);
  }
  
  progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
}

// Sistema de tabs
function initializeTabs() {
  if (elements.tabButtons.length === 0) return;
  
  elements.tabButtons.forEach(button => {
    button.addEventListener('click', handleTabClick);
  });
}

function handleTabClick(e) {
  const targetTab = e.target.getAttribute('data-tab');
  
  // Actualizar botones
  elements.tabButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');
  
  // Actualizar paneles con animación suave
  elements.tabPanels.forEach(panel => {
    if (panel.classList.contains('active')) {
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        panel.classList.remove('active');
      }, 200);
    }
  });
  
  // Mostrar nuevo panel
  setTimeout(() => {
    const targetPanel = document.getElementById(targetTab);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.style.opacity = '0';
      targetPanel.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        targetPanel.style.opacity = '1';
        targetPanel.style.transform = 'translateY(0)';
      }, 50);
    }
  }, 200);
}

// Sistema de botón flotante CTA
function initializeFloatingCTA() {
  if (!elements.floatingCTA) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        elements.floatingCTA.classList.remove('visible');
      } else {
        elements.floatingCTA.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });
  
  // Observar la sección de contacto
  const contactSection = document.getElementById('contacto');
  if (contactSection) {
    observer.observe(contactSection);
  }
  
  // Agregar evento click al botón flotante - MEJORADO
  const floatingBtn = elements.floatingCTA.querySelector('.btn-floating');
  if (floatingBtn) {
    floatingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleScheduleMeeting(floatingBtn);
    });
  }
}

// Sistema de botones CTA
function initializeCTAButtons() {
  Object.entries(elements.ctaButtons).forEach(([key, button]) => {
    if (button) {
      button.addEventListener('click', (e) => {
        handleCTAClick(key, e);
      });
    }
  });
}

function handleCTAClick(buttonType, event) {
  const button = event.currentTarget;
  
  button.classList.add('loading');
  
  switch (buttonType) {
    case 'download':
      handleDownload(button);
      break;
    case 'schedule':
    case 'scheduleMain':
      handleScheduleMeeting(button);
      break;
    case 'integrate':
      handleIntegrateOperation(button);
      break;
    case 'joinWaitlist':
      handleJoinWaitlist(button);
      break;
  }
}

// FUNCIÓN MEJORADA PARA DESCARGA DE PDF REAL
async function handleDownload(button) {
  try {
    showNotification('Preparando descarga de la presentación...', 'info');
    
    // Añadir efecto visual inmediato
    button.classList.add('downloading');
    
    // Crear elemento de descarga
    const link = document.createElement('a');
    link.href = 'Assets/NODO_LOCKER SALES DECK 2.pdf';
    link.download = 'Nodo-Locker-Presentacion-Ejecutiva.pdf';
    link.style.display = 'none';
    
    // Añadir al DOM temporalmente
    document.body.appendChild(link);
    
    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Iniciar descarga
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    
    showNotification('¡Descarga iniciada exitosamente! Revisa tu carpeta de descargas.', 'success');
    
    // Actualizar texto del botón temporalmente
    const buttonText = button.querySelector('.btn-text');
    const originalText = buttonText ? buttonText.textContent : '';
    
    if (buttonText) {
      buttonText.textContent = '¡Descargado!';
      setTimeout(() => {
        buttonText.textContent = originalText;
      }, 3000);
    }
    
  } catch (error) {
    console.error('Error en descarga:', error);
    showNotification('Error al iniciar la descarga. Por favor, inténtalo de nuevo.', 'error');
  } finally {
    button.classList.remove('loading', 'downloading');
  }
}

// FUNCIÓN MEJORADA PARA AGENDAR REUNIÓN
async function handleScheduleMeeting(button) {
  try {
    showNotification('Abriendo calendario de reuniones...', 'info');
    
    // Añadir efecto visual inmediato
    button.classList.add('scheduling');
    
    // Crear parámetros para la URL de Calendly
    const schedulingParams = new URLSearchParams({
      'hide_event_type_details': '1',
      'hide_gdpr_banner': '1',
      'primary_color': 'ff6b35',
      'text_color': '1e293b',
      'background_color': 'ffffff',
      'utm_source': 'nodolocker_website',
      'utm_medium': 'cta_button',
      'utm_campaign': 'reunion_comercial'
    });
    
    // URL completa de Calendly con parámetros
    const calendlyUrl = `${CONFIG.scheduling.calendlyUrl}?${schedulingParams.toString()}`;
    
    // Detectar si es dispositivo móvil para mejor experiencia
    const isMobile = window.innerWidth <= CONFIG.breakpoints.mobile;
    
    if (isMobile) {
      // En móvil, abrir directamente
      window.location.href = calendlyUrl;
    } else {
      // En desktop, abrir en nueva pestaña
      const newWindow = window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      
      // Verificar si se bloqueó el popup
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Si se bloqueó, mostrar modal con instrucciones
        showSchedulingModal(calendlyUrl);
      } else {
        showNotification('¡Calendario abierto! Selecciona tu horario preferido.', 'success');
        
        // Opcional: Enfocar la nueva ventana después de un momento
        setTimeout(() => {
          if (newWindow && !newWindow.closed) {
            newWindow.focus();
          }
        }, 500);
      }
    }
    
    // Tracking de evento (opcional)
    trackSchedulingEvent('calendar_opened', {
      source: button.id || 'unknown_button',
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      is_mobile: isMobile
    });
    
  } catch (error) {
    console.error('Error al abrir calendario:', error);
    showNotification('Error al abrir el calendario. Por favor, inténtalo de nuevo.', 'error');
    
    // Fallback: mostrar información de contacto
    showContactFallback();
    
  } finally {
    button.classList.remove('loading', 'scheduling');
  }
}

// Nueva función para mostrar modal cuando se bloquea popup
function showSchedulingModal(calendlyUrl) {
  const modal = document.createElement('div');
  modal.className = 'scheduling-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Agendar Reunión</h3>
          <button class="modal-close" onclick="this.closest('.scheduling-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p>Para agendar tu reunión, haz clic en el botón de abajo:</p>
          <div class="modal-actions">
            <a href="${calendlyUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary large">
              <i class="ph ph-calendar btn-icon-left"></i>
              <span class="btn-text">Abrir Calendario</span>
            </a>
          </div>
          <div class="modal-alternative">
            <p>¿Prefieres contactarnos directamente?</p>
            <div class="contact-options">
              <a href="mailto:${CONFIG.scheduling.fallbackEmail}" class="contact-option">
                <i class="ph ph-envelope"></i>
                <span>Enviar Email</span>
              </a>
              <a href="tel:${CONFIG.scheduling.fallbackPhone}" class="contact-option">
                <i class="ph ph-phone"></i>
                <span>Llamar</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Estilos del modal
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease;
  `;
  
  document.body.appendChild(modal);
  showNotification('Haz clic en "Abrir Calendario" para continuar', 'info');
}

// Nueva función para mostrar información de contacto como fallback
function showContactFallback() {
  const fallbackModal = document.createElement('div');
  fallbackModal.className = 'fallback-modal';
  fallbackModal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Contacta con Nosotros</h3>
          <button class="modal-close" onclick="this.closest('.fallback-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p>Puedes contactarnos directamente a través de:</p>
          <div class="contact-options">
            <a href="mailto:${CONFIG.scheduling.fallbackEmail}?subject=Solicitud de Reunión - Nodo Locker" class="contact-option">
              <i class="ph ph-envelope"></i>
              <span>Enviar Email</span>
            </a>
            <a href="tel:${CONFIG.scheduling.fallbackPhone}" class="contact-option">
              <i class="ph ph-phone"></i>
              <span>Llamar Ahora</span>
            </a>
            <button onclick="document.getElementById('contacto').scrollIntoView({behavior: 'smooth'}); this.closest('.fallback-modal').remove();" class="contact-option">
              <i class="ph ph-chat-text"></i>
              <span>Formulario de Contacto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  fallbackModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease;
  `;
  
  document.body.appendChild(fallbackModal);
}

// Nueva función para tracking de eventos (opcional)
function trackSchedulingEvent(eventName, data) {
  // Aquí puedes integrar con Google Analytics, Mixpanel, etc.
  console.log(`📊 Evento de agendamiento: ${eventName}`, data);
  
  // Ejemplo para Google Analytics (si está configurado)
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'scheduling',
      event_label: data.source,
      custom_map: data
    });
  }
  
  // Ejemplo para Facebook Pixel (si está configurado)
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Schedule', data);
  }
}

async function handleIntegrateOperation(button) {
  try {
    showNotification('Procesando solicitud de integración...', 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    showNotification('¡Solicitud enviada! Te contactaremos pronto para discutir la integración.', 'success');
    
    const buttonText = button.querySelector('.btn-text');
    if (buttonText) {
      buttonText.textContent = '¡Solicitud enviada!';
    }
    
    button.disabled = true;
    button.style.opacity = '0.7';
    
  } catch (error) {
    console.error('Error al procesar integración:', error);
    showNotification('Error al procesar la solicitud', 'error');
  } finally {
    button.classList.remove('loading');
  }
}

// FUNCIÓN MEJORADA PARA JOINWAITLIST (también para agendar)
async function handleJoinWaitlist(button) {
  try {
    showNotification('Abriendo calendario de reuniones...', 'info');
    
    // Añadir efecto visual
    button.classList.add('scheduling');
    
    // Usar la misma lógica que handleScheduleMeeting
    const schedulingParams = new URLSearchParams({
      'hide_event_type_details': '1',
      'hide_gdpr_banner': '1',
      'primary_color': 'ff6b35',
      'text_color': '1e293b',
      'background_color': 'ffffff',
      'utm_source': 'nodolocker_website',
      'utm_medium': 'nav_button',
      'utm_campaign': 'reunion_comercial'
    });
    
    const calendlyUrl = `${CONFIG.scheduling.calendlyUrl}?${schedulingParams.toString()}`;
    const isMobile = window.innerWidth <= CONFIG.breakpoints.mobile;
    
    if (isMobile) {
      window.location.href = calendlyUrl;
    } else {
      const newWindow = window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        showSchedulingModal(calendlyUrl);
      } else {
        showNotification('¡Calendario abierto! Selecciona tu horario preferido.', 'success');
        setTimeout(() => {
          if (newWindow && !newWindow.closed) {
            newWindow.focus();
          }
        }, 500);
      }
    }
    
    trackSchedulingEvent('calendar_opened', {
      source: 'nav_button',
      timestamp: new Date().toISOString(),
      is_mobile: isMobile
    });
    
  } catch (error) {
    console.error('Error al agendar reunión:', error);
    showNotification('Error al abrir el calendario. Por favor, inténtalo de nuevo.', 'error');
    showContactFallback();
  } finally {
    button.classList.remove('loading', 'scheduling');
  }
}

// Manejo de formularios mejorado
function initializeFormHandling() {
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', handleFormSubmit);
  }
  
  if (elements.newsletterForm) {
    elements.newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Validación mejorada
  if (!data.name || !data.email || !data.company || !data.interest) {
    showNotification('Por favor completa todos los campos requeridos', 'error');
    return;
  }
  
  if (!isValidEmail(data.email)) {
    showNotification('Por favor ingresa un email válido', 'error');
    return;
  }
  
  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.classList.add('loading');
  submitButton.disabled = true;
  
  try {
    showNotification('Enviando mensaje...', 'info');
    
    // Envío real con Formspree
    const response = await fetch('https://formspree.io/f/mzzavvvw', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      showNotification('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
      e.target.reset();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el envío');
    }
    
  } catch (error) {
    console.error('Error al enviar formulario:', error);
    showNotification('Error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error');
  } finally {
    submitButton.classList.remove('loading');
    submitButton.disabled = false;
  }
}


async function handleNewsletterSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
  
  // Validación básica
  if (!email) {
    showNotification('Por favor ingresa tu email', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showNotification('Por favor ingresa un email válido', 'error');
    return;
  }
  
  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.classList.add('loading');
  submitButton.disabled = true;
  
  try {
    showNotification('Suscribiendo...', 'info');
    
    // Crear FormData para newsletter
    const newsletterData = new FormData();
    newsletterData.append('email', email);
    newsletterData.append('_subject', 'Nueva suscripción al newsletter - Nodo Locker');
    newsletterData.append('type', 'newsletter');
    
    // Envío real con Formspree
    const response = await fetch('https://formspree.io/f/mzzavvvw', {
      method: 'POST',
      body: newsletterData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      showNotification('¡Te has suscrito exitosamente! Recibirás nuestras actualizaciones.', 'success');
      e.target.reset();
    } else {
      throw new Error('Error en la suscripción');
    }
    
  } catch (error) {
    console.error('Error al suscribir:', error);
    showNotification('Error al procesar la suscripción. Inténtalo de nuevo.', 'error');
  } finally {
    submitButton.classList.remove('loading');
    submitButton.disabled = false;
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Estilos inline para las notificaciones
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-left: 4px solid ${getNotificationColor(type)};
    animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform: translateX(100%);
    opacity: 0;
  `;
  
  const content = notification.querySelector('.notification-content');
  content.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  `;
  
  const icon = notification.querySelector('.notification-icon');
  icon.style.cssText = `
    color: ${getNotificationColor(type)};
    font-size: 18px;
    flex-shrink: 0;
  `;
  
  const messageEl = notification.querySelector('.notification-message');
  messageEl.style.cssText = `
    flex: 1;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
  `;
  
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: #9CA3AF;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
  `;
  
  closeBtn.onmouseover = () => {
    closeBtn.style.background = '#F3F4F6';
    closeBtn.style.color = '#374151';
  };
  
  closeBtn.onmouseout = () => {
    closeBtn.style.background = 'none';
    closeBtn.style.color = '#9CA3AF';
  };
  
  document.body.appendChild(notification);
  
  // Animación de entrada suave
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  });
  
  // Auto-remove con animación suave
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 400);
    }
  }, CONFIG.ui.notificationDuration);
}

function getNotificationIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || icons.info;
}

function getNotificationColor(type) {
  const colors = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  };
  return colors[type] || colors.info;
}

// Utilidades
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Manejo de errores
window.addEventListener('error', function(e) {
  console.error('❌ Error:', e.error);
  showNotification('Se produjo un error inesperado', 'error');
});

// Añadir estilos de animación mejorados
const animationStyles = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .animated {
    animation-fill-mode: both;
  }
  
  .tab-panel {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .loading {
    position: relative;
    pointer-events: none;
    opacity: 0.7;
  }
  
  .loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .scheduling {
    transform: scale(0.98);
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
  }
  
  @keyframes spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  
  /* Estilos para modales */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 24px 16px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .modal-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.2s;
  }
  
  .modal-close:hover {
    background: #f1f5f9;
    color: #475569;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .modal-body p {
    margin-bottom: 20px;
    color: #64748b;
    line-height: 1.6;
  }
  
  .modal-actions {
    margin-bottom: 24px;
  }
  
  .modal-alternative {
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
  }
  
  .modal-alternative p {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .contact-options {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .contact-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #475569;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
  }
  
  .contact-option:hover {
    background: #ff6b35;
    border-color: #ff6b35;
    color: white;
    transform: translateY(-1px);
  }
  
  .contact-option i {
    font-size: 1rem;
  }
  
  /* Animaciones de entrada suaves */
  [data-animate] {
    will-change: transform, opacity;
  }
  
  /* Mejoras de rendimiento */
  .hero-image-container,
  .stat,
  .feature-card,
  .step {
    will-change: transform;
  }
  
  /* Transiciones suaves para elementos interactivos */
  .btn-primary,
  .btn-secondary,
  .nav-link,
  .feature-card,
  .stat,
  .step {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
`;

// Añadir estilos al documento
if (!document.querySelector('#smooth-animation-styles')) {
  const style = document.createElement('style');
  style.id = 'smooth-animation-styles';
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

// Exportar para uso global
window.NodoLocker = {
  showNotification,
  state,
  config: CONFIG,
  elements,
  // Nuevas funciones exportadas
  scheduleeMeeting: handleScheduleMeeting,
  openCalendar: () => {
    const calendlyUrl = `${CONFIG.scheduling.calendlyUrl}?primary_color=ff6b35`;
    window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
  }
};

console.log('🚀 Nodo Locker - Sistema de agendamiento activado');