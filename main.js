/**
 * ChinoEffy - Main JavaScript
 * Virtual Products Store Functionality
 */

// ============================================
// Cart Management
// ============================================
class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('chinoeffy_cart')) || [];
    this.updateCartCount();
  }

  addItem(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    this.save();
    this.updateCartCount();
    this.showToast(`${product.name} added to cart!`);
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.save();
    this.updateCartCount();
    this.renderCartItems();
  }

  updateQuantity(id, quantity) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.save();
      this.updateCartCount();
      this.renderCartItems();
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  save() {
    localStorage.setItem('chinoeffy_cart', JSON.stringify(this.items));
  }

  clear() {
    this.items = [];
    this.save();
    this.updateCartCount();
  }

  updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = this.getItemCount();
    cartCountElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;

    if (this.items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p>Your cart is empty</p>
        </div>
      `;
    } else {
      cartItemsContainer.innerHTML = this.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          </div>
          <div class="cart-item-actions">
            <button class="quantity-btn minus">-</button>
            <span class="cart-item-quantity">${item.quantity}</span>
            <button class="quantity-btn plus">+</button>
            <button class="cart-item-remove">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('');

      // Add event listeners
      cartItemsContainer.querySelectorAll('.cart-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        
        item.querySelector('.minus').addEventListener('click', () => {
          const qty = parseInt(item.querySelector('.cart-item-quantity').textContent) - 1;
          if (qty >= 1) this.updateQuantity(id, qty);
        });
        
        item.querySelector('.plus').addEventListener('click', () => {
          const qty = parseInt(item.querySelector('.cart-item-quantity').textContent) + 1;
          this.updateQuantity(id, qty);
        });
        
        item.querySelector('.cart-item-remove').addEventListener('click', () => {
          this.removeItem(id);
        });
      });
    }

    // Update total
    const cartTotalElement = document.querySelector('.cart-total-value');
    if (cartTotalElement) {
      cartTotalElement.textContent = `$${this.getTotal().toFixed(2)}`;
    }
  }
}

// Initialize cart
const cart = new Cart();

// ============================================
// Navigation
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Cart modal
  const cartBtn = document.querySelector('.cart-btn');
  const cartModal = document.querySelector('.cart-modal');
  const cartClose = document.querySelector('.cart-close');
  const cartOverlay = document.querySelector('.cart-overlay');

  if (cartBtn && cartModal) {
    cartBtn.addEventListener('click', () => {
      cartModal.classList.add('active');
      cart.renderCartItems();
      document.body.style.overflow = 'hidden';
    });

    const closeCart = () => {
      cartModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
  }

  // Add to cart buttons
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (card) {
        const product = {
          id: parseInt(card.dataset.id),
          name: card.querySelector('.product-name').textContent,
          price: parseFloat(card.querySelector('.product-price').textContent.replace('$', '')),
          image: card.querySelector('.product-image img').src
        };
        cart.addItem(product);
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.closest('.faq-item');
      const isActive = faqItem.classList.contains('active');
      
      // Close all
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Open clicked if wasn't active
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });

  // Product tabs
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Payment option selection
  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      option.querySelector('input').checked = true;
    });
  });

  // Filter tabs on category pages
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const filter = tab.dataset.filter;
      const products = document.querySelectorAll('.product-card');
      
      products.forEach(product => {
        if (filter === 'all' || product.dataset.category === filter) {
          product.style.display = 'block';
        } else {
          product.style.display = 'none';
        }
      });
    });
  });

  // Sort dropdown
  const sortSelect = document.querySelector('.filter-sort select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const sortValue = e.target.value;
      const grid = document.querySelector('.category-grid');
      const products = Array.from(grid.querySelectorAll('.product-card'));
      
      products.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.product-price').textContent.replace('$', ''));
        const priceB = parseFloat(b.querySelector('.product-price').textContent.replace('$', ''));
        
        if (sortValue === 'price-low') return priceA - priceB;
        if (sortValue === 'price-high') return priceB - priceA;
        return 0;
      });
      
      products.forEach(product => grid.appendChild(product));
    });
  }

  // Thumbnail selection on product page
  document.querySelectorAll('.product-thumbnail').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      
      const mainImage = document.querySelector('.product-main-image img');
      if (mainImage) {
        mainImage.src = thumb.querySelector('img').src;
      }
    });
  });

  // Checkout form submission
  const checkoutForm = document.querySelector('.checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Simulate payment processing
      const btn = checkoutForm.querySelector('button[type="submit"]');
      btn.textContent = 'Processing...';
      btn.disabled = true;
      
      setTimeout(() => {
        cart.clear();
        window.location.href = 'download.html';
      }, 2000);
    });
  }

  // Scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.product-card, .section-header, .trust-item').forEach(el => {
    observer.observe(el);
  });
});

// ============================================
// Utility Functions
// ============================================
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
