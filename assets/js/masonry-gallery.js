/**
 * MasonryGallery - Vanilla JavaScript + GSAP
 * Adaptación del componente Masonry de React Bits para Funeraria Perpetuo Socorro
 * Sin frameworks (React/Vue/etc.)
 */

const preloadImages = async urls => {
  await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

export class MasonryGallery {
  constructor(
    container,
    {
      items = [],
      ease = 'power3.out',
      duration = 0.6,
      stagger = 0.05,
      animateFrom = 'bottom',
      scaleOnHover = true,
      hoverScale = 0.98,
      blurToFocus = true,
      colorShiftOnHover = false
    } = {}
  ) {
    if (!container) throw new Error('MasonryGallery: contenedor requerido');
    this.container = container;
    this.items = items;
    this.ease = ease;
    this.duration = duration;
    this.stagger = stagger;
    this.animateFrom = animateFrom;
    this.scaleOnHover = scaleOnHover;
    this.hoverScale = hoverScale;
    this.blurToFocus = blurToFocus;
    this.colorShiftOnHover = colorShiftOnHover;

    this.hasMounted = false;
    this.imagesReady = false;
    this.isIntersecting = false;

    this.init();
  }

  getColumns(width) {
    if (width >= 1200) return 4;
    if (width >= 860) return 3;
    if (width >= 540) return 2;
    return 1;
  }

  computeGrid(width, columns) {
    if (!width) return [];
    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    const grid = this.items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      // Altura ajustada por proporción
      const height = (child.height || 400) / 2;
      const y = colHeights[col];

      colHeights[col] += height;

      return { ...child, x, y, w: columnWidth, h: height };
    });

    const totalHeight = Math.max(...colHeights);
    this.container.style.height = `${totalHeight}px`;

    return grid;
  }

  getInitialPosition(item) {
    const containerRect = this.container.getBoundingClientRect();
    let direction = this.animateFrom;

    if (direction === 'random') {
      const directions = ['top', 'bottom', 'left', 'right'];
      direction = directions[Math.floor(Math.random() * directions.length)];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: item.y + 120 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  }

  renderDOM() {
    this.container.classList.add('masonry-list');
    this.container.innerHTML = '';

    this.items.forEach(item => {
      const wrapper = document.createElement('div');
      wrapper.className = 'masonry-item-wrapper';
      wrapper.setAttribute('data-key', item.id);
      wrapper.setAttribute('role', 'article');
      wrapper.setAttribute('tabindex', '0');
      wrapper.setAttribute('aria-label', `${item.title} - ${item.category}`);

      wrapper.innerHTML = `
        <div class="masonry-item-img" style="background-image: url('${item.img}');">
          <div class="masonry-content-overlay">
            <span class="masonry-badge"><i class="fas fa-heart" aria-hidden="true"></i> ${item.category}</span>
            <h3 class="masonry-item-title">${item.title}</h3>
            <p class="masonry-item-desc">${item.desc || ''}</p>
          </div>
          ${
            this.colorShiftOnHover
              ? '<div class="masonry-color-overlay"></div>'
              : ''
          }
        </div>
      `;

      if (item.url) {
        wrapper.addEventListener('click', () => {
          if (item.url.startsWith('#')) {
            const target = document.querySelector(item.url);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          } else {
            window.open(item.url, '_blank', 'noopener');
          }
        });
      }

      this.attachHoverListeners(wrapper, item);
      this.container.appendChild(wrapper);
    });
  }

  attachHoverListeners(element, item) {
    const gsapLib = window.gsap;
    if (!gsapLib) return;

    element.addEventListener('mouseenter', () => {
      if (this.scaleOnHover) {
        gsapLib.to(element, {
          scale: this.hoverScale,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (this.colorShiftOnHover) {
        const overlay = element.querySelector('.masonry-color-overlay');
        if (overlay) {
          gsapLib.to(overlay, {
            opacity: 0.3,
            duration: 0.3
          });
        }
      }
    });

    element.addEventListener('mouseleave', () => {
      if (this.scaleOnHover) {
        gsapLib.to(element, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (this.colorShiftOnHover) {
        const overlay = element.querySelector('.masonry-color-overlay');
        if (overlay) {
          gsapLib.to(overlay, {
            opacity: 0,
            duration: 0.3
          });
        }
      }
    });
  }

  applyLayout(grid) {
    const gsapLib = window.gsap;
    if (!gsapLib) {
      // Fallback sin GSAP
      grid.forEach(item => {
        const el = this.container.querySelector(`[data-key="${item.id}"]`);
        if (el) {
          el.style.transform = `translate(${item.x}px, ${item.y}px)`;
          el.style.width = `${item.w}px`;
          el.style.height = `${item.h}px`;
          el.style.opacity = '1';
        }
      });
      return;
    }

    if (!this.hasMounted) {
      grid.forEach((item, index) => {
        const el = this.container.querySelector(`[data-key="${item.id}"]`);
        if (!el) return;

        const initialPos = this.getInitialPosition(item);
        const animationProps = {
          x: item.x,
          y: item.y,
          width: item.w,
          height: item.h
        };

        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(this.blurToFocus && { filter: 'blur(10px)' })
        };

        gsapLib.fromTo(el, initialState, {
          opacity: 1,
          ...animationProps,
          ...(this.blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8,
          ease: this.ease,
          delay: index * this.stagger
        });
      });

      this.hasMounted = true;
    } else {
      grid.forEach(item => {
        const el = this.container.querySelector(`[data-key="${item.id}"]`);
        if (!el) return;

        gsapLib.to(el, {
          x: item.x,
          y: item.y,
          width: item.w,
          height: item.h,
          duration: this.duration,
          ease: this.ease,
          overwrite: 'auto'
        });
      });
    }
  }

  updateLayout() {
    if (!this.imagesReady || !this.isIntersecting) return;
    const width = this.container.clientWidth;
    if (!width) return;

    const columns = this.getColumns(width);
    const grid = this.computeGrid(width, columns);
    this.applyLayout(grid);
  }

  initObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.isIntersecting = true;
              this.updateLayout();
            }
          });
        },
        { threshold: 0.1 }
      );
      this.observer.observe(this.container);
    } else {
      this.isIntersecting = true;
      this.updateLayout();
    }
  }

  initResize() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(([entry]) => {
        if (entry.contentRect.width > 0 && this.imagesReady && this.hasMounted) {
          this.updateLayout();
        }
      });
      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener('resize', () => {
        if (this.imagesReady && this.hasMounted) {
          this.updateLayout();
        }
      });
    }
  }

  async init() {
    this.renderDOM();

    // Precargar imágenes antes de activar animación
    await preloadImages(this.items.map(i => i.img));
    this.imagesReady = true;

    this.initObserver();
    this.initResize();
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.container.innerHTML = '';
  }
}

export function initMasonryGallery(container, options = {}) {
  return new MasonryGallery(container, options);
}

if (typeof window !== 'undefined') {
  window.MasonryGallery = MasonryGallery;
  window.initMasonryGallery = initMasonryGallery;
}
