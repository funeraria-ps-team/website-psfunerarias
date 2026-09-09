/*
	Funeraria Perpetuo Socorro
	Scripts interactivos basados en HTML5 UP Helios
	Incluye: Carrusel Infinito, Acordeón FAQ, Navegación Móvil y Animaciones
*/

(function($) {

	var $window = $(window),
		$body = $('body'),
		settings = {
			carousels: {
				speed: 5,
				stepSpeed: 300,
				fadeIn: false,
				fadeDelay: 0
			}
		};

	// Breakpoints
	breakpoints({
		wide:      [ '1281px',  '1680px' ],
		normal:    [ '961px',   '1280px' ],
		narrow:    [ '841px',   '960px'  ],
		narrower:  [ '737px',   '840px'  ],
		mobile:    [ null,      '736px'  ]
	});

	// Animación inicial de Helios al cargar la página
	$window.on('load', function() {
		window.setTimeout(function() {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Dropdowns (Dropotron) - Respuesta instantánea al hover sin retardos
	if ($.fn.dropotron) {
		$('#nav > ul').dropotron({
			mode: 'fade',
			speed: 150,
			hoverDelay: 20,
			hideDelay: 60,
			noOpenerFade: true,
			alignment: 'center',
			offsetY: 8
		});
	}

	// Scrolly (Desplazamiento suave y ágil sin esperas)
	if ($.fn.scrolly) {
		$('.scrolly').scrolly({
			speed: 300,
			offset: 68
		});
	}

	// Desplazamiento ultra-rápido de 1 solo clic para todo el navbar y enlaces internos
	$(document).on('click', '#nav a[href^="#"], #navPanel a[href^="#"], .scrolly', function(e) {
		var href = $(this).attr('href');
		if (!href || href === '#' || href === '#navPanel') return;

		var $target = $(href);
		if ($target.length) {
			e.preventDefault();

			// Cerrar inmediatamente el panel móvil si está abierto
			if ($body.hasClass('navPanel-visible')) {
				$body.removeClass('navPanel-visible');
			}

			// Scroll inmediato y fluido sin delays en 300ms
			var offsetTop = $target.offset().top - 68;
			if (offsetTop < 0) offsetTop = 0;

			$('html, body').stop(true, false).animate({
				scrollTop: offsetTop
			}, 300, 'swing');

			if (history.pushState) {
				history.pushState(null, null, href);
			}
		}
	});

	// Panel Móvil (Helios Nav Panel) sin retraso artificial (delay: 0)
	$(
		'<div id="navButton">' +
			'<a href="#navPanel" class="toggle" aria-label="Abrir menú de navegación"></a>' +
		'</div>'
	).appendTo($body);

	if ($.fn.navList && $.fn.panel) {
		$(
			'<div id="navPanel">' +
				'<nav>' +
					$('#nav').navList() +
				'</nav>' +
			'</div>'
		)
			.appendTo($body)
			.panel({
				delay: 0,
				hideOnClick: true,
				hideOnSwipe: true,
				resetScroll: true,
				resetForms: true,
				target: $body,
				visibleClass: 'navPanel-visible'
			});
	}

	// CONTROL DINÁMICO DE VISIBILIDAD DEL NAVBAR / MENÚ HAMBURGUESA
	// Si el primer elemento o cualquier botón se corta al reducir el ancho de pantalla, se convierte de inmediato a la hamburguesa
	function checkNavResponsiveness() {
		var $nav = $('#nav');
		if (!$nav.length) return;
		var $ul = $nav.children('ul');
		if (!$ul.length) return;

		var winWidth = $window.width();
		var totalItemsWidth = 0;

		$ul.children('li').each(function() {
			totalItemsWidth += $(this).outerWidth(true);
		});

		if (winWidth <= 1260 || (totalItemsWidth > 0 && winWidth < (totalItemsWidth + 25))) {
			$body.addClass('nav-collapsed');
		} else {
			$body.removeClass('nav-collapsed');
		}
	}

	$window.on('resize orientationchange load', function() {
		checkNavResponsiveness();
	});
	checkNavResponsiveness();

	// CARRUSEL INFINITO GENUINO CON CLONACIÓN, TOUCH SWIPE Y DOTS
	$('.carousel').each(function() {
		var $t = $(this);
		var $reel = $t.children('.reel');
		var $originalItems = $reel.children('article');
		var numItems = $originalItems.length; // 5 instalaciones

		if (numItems === 0) return;

		// Clonar elementos antes y después para crear el bucle infinito sin saltos
		var $clonesBefore = $originalItems.clone().addClass('clone clone-before');
		var $clonesAfter = $originalItems.clone().addClass('clone clone-after');
		$reel.prepend($clonesBefore);
		$reel.append($clonesAfter);

		var $allItems = $reel.children('article');
		var currentIndex = numItems; // Inicia en el primer elemento del bloque original (índice 5)
		var isTransitioning = false;
		var autoPlayTimer = null;

		// Todos los artículos del carrusel visibles y listos de inmediato sin retrasos
		$allItems.removeClass('loading');

		// Crear Contenedor de Indicadores (Dots)
		var $dotsContainer = $('<div class="carousel-dots" role="tablist" aria-label="Navegación de instalaciones"></div>');
		for (var i = 0; i < numItems; i++) {
			var $dot = $('<button class="dot" role="tab" aria-label="Ver instalación ' + (i + 1) + '" data-index="' + i + '"></button>');
			if (i === 0) $dot.addClass('active');
			$dotsContainer.append($dot);
		}
		$t.append($dotsContainer);

		// Crear Botones de Navegación con íconos FontAwesome
		var $forward = $('<button class="forward" aria-label="Siguiente instalación"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>');
		var $backward = $('<button class="backward" aria-label="Instalación anterior"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>');
		$t.append($forward).append($backward);

		function getItemStep() {
			var $first = $allItems.first();
			var margin = parseFloat($first.css('margin-right')) || 20;
			return $first.outerWidth() + margin;
		}

		var transitionSafetyTimer = null;

		function updatePosition(animate) {
			var step = getItemStep();
			var offset = -1 * currentIndex * step;

			if (animate) {
				isTransitioning = true;
				$reel.css({
					'transition': 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)',
					'transform': 'translate3d(' + offset + 'px, 0, 0)'
				});
				clearTimeout(transitionSafetyTimer);
				transitionSafetyTimer = setTimeout(function() {
					isTransitioning = false;
				}, 600);
			} else {
				$reel.css({
					'transition': 'none',
					'transform': 'translate3d(' + offset + 'px, 0, 0)'
				});
				isTransitioning = false;
			}

			// Actualizar punto activo según índice real
			var realIdx = currentIndex % numItems;
			if (realIdx < 0) realIdx += numItems;
			$dotsContainer.children('.dot').removeClass('active')
				.filter('[data-index="' + realIdx + '"]').addClass('active');
		}

		// Al terminar la transición, si nos salimos del bloque central, reajustar sin transición
		$reel.on('transitionend webkitTransitionEnd', function(e) {
			if (e.target !== $reel[0]) return;
			isTransitioning = false;

			// Si sobrepasamos hacia el bloque posterior clonado
			if (currentIndex >= numItems * 2) {
				currentIndex = currentIndex - numItems;
				updatePosition(false);
			}
			// Si retrocedemos hacia el bloque anterior clonado
			else if (currentIndex < numItems) {
				currentIndex = currentIndex + numItems;
				updatePosition(false);
			}
		});

		function nextSlide() {
			if (isTransitioning) return;
			currentIndex++;
			updatePosition(true);
		}

		function prevSlide() {
			if (isTransitioning) return;
			currentIndex--;
			updatePosition(true);
		}

		function goToIndex(targetRealIdx) {
			if (isTransitioning) return;
			var currentReal = currentIndex % numItems;
			if (currentReal < 0) currentReal += numItems;
			var diff = targetRealIdx - currentReal;
			currentIndex += diff;
			updatePosition(true);
		}

		// Eventos de botones y dots
		$forward.on('click', function(e) {
			e.preventDefault();
			nextSlide();
			resetAutoPlay();
		});

		$backward.on('click', function(e) {
			e.preventDefault();
			prevSlide();
			resetAutoPlay();
		});

		$dotsContainer.on('click', '.dot', function(e) {
			e.preventDefault();
			var idx = parseInt($(this).attr('data-index'), 10);
			goToIndex(idx);
			resetAutoPlay();
		});

		// Soporte de Desplazamiento Táctil (Touch Swipe) en Móviles
		var touchStartX = 0;
		var touchCurrentX = 0;
		var isSwiping = false;

		$reel.on('touchstart', function(e) {
			if (e.originalEvent.touches && e.originalEvent.touches.length === 1) {
				touchStartX = e.originalEvent.touches[0].clientX;
				touchCurrentX = touchStartX;
				isSwiping = true;
				stopAutoPlay();
			}
		});

		$reel.on('touchmove', function(e) {
			if (!isSwiping) return;
			touchCurrentX = e.originalEvent.touches[0].clientX;
		});

		$reel.on('touchend', function(e) {
			if (!isSwiping) return;
			isSwiping = false;
			var diffX = touchCurrentX - touchStartX;
			if (Math.abs(diffX) > 40) {
				if (diffX < 0) {
					nextSlide();
				} else {
					prevSlide();
				}
			}
			resetAutoPlay();
		});

		// Avance automático continuo cada 3 segundos como en el carrusel superior
		function startAutoPlay() {
			stopAutoPlay();
			autoPlayTimer = setInterval(function() {
				nextSlide();
			}, 3000);
		}

		function stopAutoPlay() {
			if (autoPlayTimer) {
				clearInterval(autoPlayTimer);
				autoPlayTimer = null;
			}
		}

		function resetAutoPlay() {
			stopAutoPlay();
			startAutoPlay();
		}

		// Iniciar y pausar el auto-scroll inteligentemente según visibilidad en pantalla
		if ('IntersectionObserver' in window) {
			var carouselInViewObserver = new IntersectionObserver(function(entries) {
				entries.forEach(function(entry) {
					if (entry.isIntersecting) {
						startAutoPlay();
					} else {
						stopAutoPlay();
					}
				});
			}, { threshold: 0.15 });
			carouselInViewObserver.observe($t[0]);
		} else {
			startAutoPlay();
		}

		// Pausar si la pestaña del navegador pasa a segundo plano
		document.addEventListener('visibilitychange', function() {
			if (document.hidden) {
				stopAutoPlay();
			} else {
				startAutoPlay();
			}
		});

		// Ajuste al redimensionar ventana
		$window.on('resize load', function() {
			updatePosition(false);
		});

		// Inicialización inicial
		setTimeout(function() {
			updatePosition(false);
			startAutoPlay();
		}, 60);
	});

	// Acordeón de Preguntas Frecuentes (FAQ)
	$('.faq-question').on('click', function(e) {
		e.preventDefault();
		var $btn = $(this);
		var $item = $btn.closest('.faq-item');
		var isExpanded = $btn.attr('aria-expanded') === 'true';

		$('.faq-item').not($item).removeClass('active').find('.faq-question').attr('aria-expanded', 'false');

		if (isExpanded) {
			$item.removeClass('active');
			$btn.attr('aria-expanded', 'false');
		} else {
			$item.addClass('active');
			$btn.attr('aria-expanded', 'true');
		}
	});

	// Pestañas de Paquetes Funerarios (detalles.html)
	$('.tab-nav-btn').on('click', function(e) {
		e.preventDefault();
		var targetId = $(this).attr('data-target');
		if (!targetId) return;

		// Alternar estado activo en pestañas
		$('.tab-nav-btn').removeClass('active').attr('aria-selected', 'false');
		$(this).addClass('active').attr('aria-selected', 'true');

		// Mostrar panel correspondiente
		$('.tab-pane').removeClass('active');
		$('#' + targetId).addClass('active');

		// Actualizar el hash en la URL sin salto brusco
		if (history.replaceState) {
			history.replaceState(null, null, '#' + targetId);
		}
	});

	// Activar pestaña según hash en URL al cargar
	if (window.location.hash) {
		var hashId = window.location.hash.replace('#', '');
		var $matchingBtn = $('.tab-nav-btn[data-target="' + hashId + '"]');
		if ($matchingBtn.length) {
			$matchingBtn.trigger('click');
		}
	}

	// Año actual dinámico en el footer
	var currentYear = new Date().getFullYear();
	$('#current-year, .current-year').text(currentYear);

	// Conmutador de Modo Claro / Oscuro (Theme Toggle)
	function getCurrentTheme() {
		return document.documentElement.getAttribute('data-theme') || localStorage.getItem('perpetuo_theme') || 'dark';
	}

	function applyTheme(theme) {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('perpetuo_theme', theme);
		var label = (theme === 'dark') ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
		$('#theme-toggle, #theme-toggle-mobile, #theme-toggle-floating, .theme-toggle-floating').attr('aria-label', label).attr('title', label);
	}

	// Inicializar tema guardado o por defecto dark
	var initTheme = localStorage.getItem('perpetuo_theme') || 'dark';
	applyTheme(initTheme);

	$(document).on('click', '#theme-toggle, #theme-toggle-mobile, #theme-toggle-floating, .theme-toggle-floating', function(e) {
		e.preventDefault();
		var current = getCurrentTheme();
		var next = (current === 'dark') ? 'light' : 'dark';
		applyTheme(next);
	});

	// =========================================================================
	// Carrusel de Fondo Automático del Header (#header) y Animación de Texto
	// =========================================================================
	(function initHeaderBackgroundCarousel() {
		var $carousel = $('.header-bg-carousel');
		if (!$carousel.length) return;

		var $slides = $carousel.find('.header-bg-slide');
		var $dots = $('.header-carousel-dot');
		var totalSlides = $slides.length;
		if (totalSlides <= 1) return;

		var $heroText = $('.hero-header-text');
		var $heroLead = $('.hero-lead');

		// Mensajes contextuales y empáticos para cada espacio de la funeraria
		var slideMessages = [
			'¡Protegemos Familias! — Más de 30 años brindando acompañamiento sereno, cálido y digno en los momentos de mayor trascendencia.',
			'Santuario de Despedida y Homenaje — Cada despedida merece la máxima solemnidad, respeto y calidez humana.',
			'Intimidad, Confort y Contención — Salas de velación y suites privadas pensadas para el consuelo de tu familia.',
			'Paz y Acompañamiento Permanente — Guardia inmediata y orientación tanatológica sensible las 24 horas del día.'
		];

		var currentIndex = 0;
		var slideDuration = 5500; // 5.5 segundos por imagen
		var slideTimer = null;
		var textAnimTimer = null;

		function triggerProgress($dot) {
			$dots.find('.dot-progress').css({
				'transition': 'none',
				'width': '0%'
			});

			// Forzar reflow en el navegador para reiniciar la animación
			if ($dot.length && $dot[0]) {
				void $dot[0].offsetWidth;
				$dot.find('.dot-progress').css({
					'transition': 'width ' + (slideDuration - 300) + 'ms linear',
					'width': '100%'
				});
			}
		}

		function showSlide(index) {
			if (index === currentIndex) return;

			var $prevSlide = $slides.eq(currentIndex);
			var $nextSlide = $slides.eq(index);

			// Manejo de clases de imágenes para crossfade suave
			$slides.removeClass('prev-active');
			$prevSlide.addClass('prev-active');

			$slides.removeClass('active');
			$nextSlide.addClass('active');

			// Animación del texto: se desvanece suavemente hacia arriba
			$heroText.addClass('fade-out').removeClass('fade-in');
			$heroLead.addClass('fade-out').removeClass('fade-in');

			if (textAnimTimer) clearTimeout(textAnimTimer);
			textAnimTimer = setTimeout(function() {
				if (slideMessages[index] && $heroLead.length) {
					$heroLead.text(slideMessages[index]);
				}
				// Vuelve a aparecer suavemente con la nueva frase
				$heroText.removeClass('fade-out').addClass('fade-in');
				$heroLead.removeClass('fade-out').addClass('fade-in');
			}, 380);

			// Actualizar estado de indicadores
			$dots.removeClass('active');
			var $activeDot = $dots.eq(index);
			$activeDot.addClass('active');
			triggerProgress($activeDot);

			currentIndex = index;
		}

		function nextSlide() {
			var nextIndex = (currentIndex + 1) % totalSlides;
			showSlide(nextIndex);
		}

		function startAutoPlay() {
			stopAutoPlay();
			var $activeDot = $dots.eq(currentIndex);
			triggerProgress($activeDot);

			slideTimer = setInterval(function() {
				nextSlide();
			}, slideDuration);
		}

		function stopAutoPlay() {
			if (slideTimer) {
				clearInterval(slideTimer);
				slideTimer = null;
			}
		}

		// Evento de clic en los indicadores
		$dots.on('click', function(e) {
			e.preventDefault();
			var targetIdx = parseInt($(this).attr('data-slide'), 10);
			if (!isNaN(targetIdx) && targetIdx !== currentIndex) {
				showSlide(targetIdx);
				startAutoPlay(); // Reiniciar contador tras cambio manual
			}
		});

		// Pausar reproducción automática si el usuario cambia de pestaña
		document.addEventListener('visibilitychange', function() {
			if (document.hidden) {
				stopAutoPlay();
			} else {
				startAutoPlay();
			}
		});

		// Iniciar reproducción automática
		startAutoPlay();
	})();

	// =========================================================================
	// SISTEMA DE ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER)
	// Alto rendimiento a 60fps, aceleración GPU y cero dependencias pesadas
	// =========================================================================
	function initScrollReveal() {
		if (!('IntersectionObserver' in window)) {
			// Fallback inmediato: si no hay soporte, todo permanece visible
			return;
		}

		// Activar clase maestra en html para inicializar estados ocultos
		$('html').addClass('reveal-ready');

		// 1. Grupos de Cuadrículas con Cascada Escalonada (Stagger)
		var staggerSelectors = [
			'.packages-row-5',
			'.about-pillars-grid',
			'#guia .row',
			'#catalogo .row.gtr-50',
			'#historias .row',
			'.faq-container',
			'.about-bento-grid',
			'.about-values-grid',
			'.about-team-roles',
			'.about-facilities-grid',
			'.about-guarantees-grid'
		];

		staggerSelectors.forEach(function(sel) {
			$(sel).each(function() {
				var $container = $(this);
				$container.addClass('reveal-stagger-group');
				$container.children().each(function(idx) {
					$(this).css('--stagger-idx', idx);
				});
			});
		});

		// 2. Encabezados de sección (Fade up con sutil desenfoque)
		$('section > .container > header, section > .container-wide > header, .wrapper > .container > header').each(function() {
			if (!$(this).hasClass('reveal-on-scroll')) {
				$(this).addClass('reveal-on-scroll reveal-fade-up');
			}
		});

		// 3. Bloques asimétricos editoriales
		$('.about-home-content').addClass('reveal-on-scroll reveal-slide-left');
		$('.about-home-visual').addClass('reveal-on-scroll reveal-slide-right');
		$('#prevision .container').addClass('reveal-on-scroll reveal-fade-up');
		$('#ubicacion .row').addClass('reveal-on-scroll reveal-fade-up');
		$('.about-story-quote').addClass('reveal-on-scroll reveal-fade-up');
		$('.about-metrics-bar').addClass('reveal-on-scroll reveal-scale');

		// Elementos con atributo explícito data-reveal
		$('[data-reveal]').each(function() {
			var revealType = $(this).attr('data-reveal') || 'reveal-fade-up';
			$(this).addClass('reveal-on-scroll ' + revealType);
		});

		// 4. Instanciar IntersectionObserver con margen calibrado para que la animación empiece en la vista
		var isMobile = window.innerWidth <= 768;
		var observerConfig = {
			root: null,
			// Espera a que el elemento haya entrado 115px en pantalla (55px en móviles)
			// garantizando que la animación se despliegue justo frente a los ojos del usuario
			rootMargin: isMobile ? '0px 0px -55px 0px' : '0px 0px -115px 0px',
			threshold: 0.12
		};

		var scrollObserver = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-revealed');
				} else {
					// Al salir completamente del campo visual al subir o bajar,
					// se remueve la clase para que vuelva a reproducir la animación al regresar
					entry.target.classList.remove('is-revealed');
				}
			});
		}, observerConfig);

		// Conectar observador a todos los elementos preparados
		$('.reveal-on-scroll, .reveal-stagger-group').each(function() {
			scrollObserver.observe(this);
		});
	}

	// Inicializar sistema de animaciones al cargar el DOM
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initScrollReveal);
	} else {
		initScrollReveal();
	}

	// =========================================================================
	// BOTÓN FLOTANTE "VOLVER ARRIBA" (Muestra/Oculta al hacer scroll y suave)
	// =========================================================================
	var $backToTop = $('#back-to-top');
	if ($backToTop.length) {
		var isTicking = false;
		$window.on('scroll', function() {
			if (!isTicking) {
				window.requestAnimationFrame(function() {
					if ($window.scrollTop() > 320) {
						$backToTop.addClass('is-visible');
					} else {
						$backToTop.removeClass('is-visible');
					}
					isTicking = false;
				});
				isTicking = true;
			}
		});

		$backToTop.on('click', function(e) {
			e.preventDefault();
			$('html, body').stop(true, false).animate({
				scrollTop: 0
			}, 350, 'swing');
		});
	}

})(jQuery);
