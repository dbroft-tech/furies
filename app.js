/**
 * FURIES Restaurant - Main JavaScript
 * Handles mobile menu, cart functionality, animations, and interactions
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
  cart: JSON.parse(localStorage.getItem('furies_cart')) || [],
  currentTestimonial: 0,
  isCartOpen: false,
  isMobileMenuOpen: false
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
  header: document.getElementById('header'),
  menuToggle: document.getElementById('menuToggle'),
  navMobile: document.getElementById('navMobile'),
  cartBtn: document.getElementById('cartBtn'),
  cartSidebar: document.getElementById('cartSidebar'),
  cartOverlay: document.getElementById('cartOverlay'),
  cartClose: document.getElementById('cartClose'),
  cartItems: document.getElementById('cartItems'),
  cartCount: document.getElementById('cartCount'),
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  prevTestimonial: document.getElementById('prevTestimonial'),
  nextTestimonial: document.getElementById('nextTestimonial'),
  testimonials: document.querySelectorAll('.testimonial'),
  menuTabs: document.querySelectorAll('.menu-tab'),
  menuItems: document.querySelectorAll('.menu-item'),
  animateOnScroll: document.querySelectorAll('.animate-on-scroll'),
  videoThumb: document.getElementById('videoThumb'),
  contactForm: document.getElementById('contactForm'),
  newsletterForm: document.getElementById('newsletterForm')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatPrice = (price) => {
  return `$${price.toFixed(2)}`;
};

const saveCart = () => {
  localStorage.setItem('furies_cart', JSON.stringify(state.cart));
};

const showNotification = (message) => {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--primary);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    z-index: 9999;
    font-weight: 600;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateY(100px)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// ============================================
// MOBILE MENU
// ============================================

const toggleMobileMenu = () => {
  state.isMobileMenuOpen = !state.isMobileMenuOpen;
  elements.menuToggle?.classList.toggle('active', state.isMobileMenuOpen);
  elements.navMobile?.classList.toggle('active', state.isMobileMenuOpen);
  document.body.style.overflow = state.isMobileMenuOpen ? 'hidden' : '';
};

const closeMobileMenu = () => {
  state.isMobileMenuOpen = false;
  elements.menuToggle?.classList.remove('active');
  elements.navMobile?.classList.remove('active');
  document.body.style.overflow = '';
};

// ============================================
// CART FUNCTIONALITY
// ============================================

const toggleCart = () => {
  state.isCartOpen = !state.isCartOpen;
  elements.cartSidebar?.classList.toggle('active', state.isCartOpen);
  elements.cartOverlay?.classList.toggle('active', state.isCartOpen);
  document.body.style.overflow = state.isCartOpen ? 'hidden' : '';
};

const closeCart = () => {
  state.isCartOpen = false;
  elements.cartSidebar?.classList.remove('active');
  elements.cartOverlay?.classList.remove('active');
  document.body.style.overflow = '';
};

const addToCart = (item) => {
  const existingItem = state.cart.find(cartItem => cartItem.name === item.name);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({ ...item, quantity: 1 });
  }
  
  saveCart();
  updateCartUI();
  showNotification(`${item.name} added to cart!`);
};

const removeFromCart = (itemName) => {
  state.cart = state.cart.filter(item => item.name !== itemName);
  saveCart();
  updateCartUI();
};

const updateQuantity = (itemName, delta) => {
  const item = state.cart.find(cartItem => cartItem.name === itemName);
  
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(itemName);
    } else {
      saveCart();
      updateCartUI();
    }
  }
};

const updateCartUI = () => {
  // Update count badge
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (elements.cartCount) {
    elements.cartCount.textContent = totalItems;
    elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
  
  // Update cart items list
  if (elements.cartItems) {
    if (state.cart.length === 0) {
      elements.cartItems.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" style="width: 64px; height: 64px; stroke: #e5e5e5; stroke-width: 1; fill: none; margin-bottom: 1rem;">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p>Your cart is empty</p>
        </div>
      `;
    } else {
      elements.cartItems.innerHTML = state.cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-img">
            <img src="${item.img}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p class="price">${formatPrice(item.price * item.quantity)}</p>
            <div class="cart-item-actions">
              <button class="quantity-btn" onclick="window.updateCartItemQuantity('${item.name}', -1)">-</button>
              <span class="cart-item-quantity">${item.quantity}</span>
              <button class="quantity-btn" onclick="window.updateCartItemQuantity('${item.name}', 1)">+</button>
              <button class="cart-item-remove" onclick="window.removeCartItem('${item.name}')">Remove</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
  
  // Update total
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (elements.cartTotal) {
    elements.cartTotal.textContent = formatPrice(total);
  }
};

// Expose cart functions globally for onclick handlers
window.updateCartItemQuantity = (itemName, delta) => {
  updateQuantity(itemName, delta);
};

window.removeCartItem = (itemName) => {
  removeFromCart(itemName);
};

// ============================================
// TESTIMONIALS SLIDER
// ============================================

const showTestimonial = (index) => {
  elements.testimonials.forEach((testimonial, i) => {
    testimonial.style.display = i === index ? 'block' : 'none';
    testimonial.classList.toggle('active', i === index);
  });
};

const nextTestimonial = () => {
  state.currentTestimonial = (state.currentTestimonial + 1) % elements.testimonials.length;
  showTestimonial(state.currentTestimonial);
};

const prevTestimonial = () => {
  state.currentTestimonial = (state.currentTestimonial - 1 + elements.testimonials.length) % elements.testimonials.length;
  showTestimonial(state.currentTestimonial);
};

// ============================================
// MENU FILTERING
// ============================================

const filterMenu = (category) => {
  elements.menuItems.forEach(item => {
    const itemCategory = item.dataset.category;
    if (category === 'all' || itemCategory === category) {
      item.style.display = 'block';
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 10);
    } else {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      setTimeout(() => {
        item.style.display = 'none';
      }, 300);
    }
  });
};

// ============================================
// SCROLL ANIMATIONS
// ============================================

const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Add stagger delay for grid items
        const parent = entry.target.parentElement;
        if (parent && parent.classList.contains('categories-grid') || 
            parent && parent.classList.contains('menu-grid')) {
          const siblings = Array.from(parent.children);
          const index = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${index * 0.1}s`;
        }
      }
    });
  }, observerOptions);

  elements.animateOnScroll.forEach(el => observer.observe(el));
};

// ============================================
// HEADER SCROLL EFFECT
// ============================================

const handleHeaderScroll = () => {
  if (elements.header) {
    if (window.scrollY > 50) {
      elements.header.classList.add('scrolled');
    } else {
      elements.header.classList.remove('scrolled');
    }
  }
};

// ============================================
// VIDEO MODAL
// ============================================

const openVideoModal = () => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.9);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="position: relative; width: 100%; max-width: 900px; aspect-ratio: 16/9;">
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        style="border-radius: 8px;"
      ></iframe>
      <button onclick="this.closest('.video-modal').remove(); document.body.style.overflow = '';" 
        style="position: absolute; top: -50px; right: 0; width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  `;
  
  modal.classList.add('video-modal');
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  });
};

// ============================================
// FORM HANDLING
// ============================================

const handleContactForm = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Simulate form submission
  showNotification('Message sent successfully! We\'ll get back to you soon.');
  e.target.reset();
};

const handleNewsletterForm = (e) => {
  e.preventDefault();
  showNotification('Thanks for subscribing! Check your email for confirmation.');
  e.target.reset();
};

// ============================================
// EVENT LISTENERS
// ============================================

const initEventListeners = () => {
  // Mobile menu
  elements.menuToggle?.addEventListener('click', toggleMobileMenu);
  
  // Close mobile menu when clicking a link
  document.querySelectorAll('.nav-mobile a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
  
  // Cart
  elements.cartBtn?.addEventListener('click', toggleCart);
  elements.cartClose?.addEventListener('click', closeCart);
  elements.cartOverlay?.addEventListener('click', closeCart);
  
  // Checkout
  elements.checkoutBtn?.addEventListener('click', () => {
    if (state.cart.length === 0) {
      showNotification('Your cart is empty!');
    } else {
      showNotification('Checkout coming soon! Thank you for your interest.');
    }
  });
  
  // Testimonials
  elements.prevTestimonial?.addEventListener('click', prevTestimonial);
  elements.nextTestimonial?.addEventListener('click', nextTestimonial);
  
  // Menu tabs
  elements.menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.menuTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterMenu(tab.dataset.category);
    });
  });
  
  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = {
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        img: btn.dataset.img
      };
      addToCart(item);
    });
  });
  
  // Video modal
  elements.videoThumb?.addEventListener('click', openVideoModal);
  
  // Forms
  elements.contactForm?.addEventListener('submit', handleContactForm);
  elements.newsletterForm?.addEventListener('submit', handleNewsletterForm);
  
  // Scroll events
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  
  // Keyboard navigation for cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeMobileMenu();
    }
  });
};

// ============================================
// INITIALIZATION
// ============================================

const init = () => {
  // Initialize cart UI
  updateCartUI();
  
  // Initialize animations
  initScrollAnimations();
  
  // Initialize event listeners
  initEventListeners();
  
  // Check initial scroll position
  handleHeaderScroll();
  
  // Show initial testimonial
  if (elements.testimonials.length > 0) {
    showTestimonial(0);
  }
  
  console.log('🍽️ FURIES Restaurant - Ready to serve!');
};

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
