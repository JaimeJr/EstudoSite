// ============================================================
// main.js - Site Auxiliar Administrativo
// Funcionalidades: Menu Hambúrguer, Scroll Suave, Voltar ao Topo,
//                  Fade-in (Scroll Reveal), Contador Animado
// ============================================================

document.addEventListener('DOMContentLoaded', function() {

    'use strict';

    // ============================================================
    // 1. MENU HAMBÚRGUER (Mobile)
    // ============================================================

    const hamburger = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');

    if (hamburger && mainNav) {

        // Abrir/fechar ao clicar no botão
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = mainNav.classList.toggle('open');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Fechar ao clicar em um link do menu
        const navLinks = mainNav.querySelectorAll('.header__link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mainNav.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Fechar ao clicar fora do menu
        document.addEventListener('click', function(e) {
            if (mainNav.classList.contains('open')) {
                const isClickInsideNav = mainNav.contains(e.target);
                const isClickOnHamburger = hamburger.contains(e.target);
                if (!isClickInsideNav && !isClickOnHamburger) {
                    mainNav.classList.remove('open');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // ============================================================
    // 2. SCROLL SUAVE (Âncoras)
    // ============================================================

    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Ignora links vazios ou apenas "#"
            if (href === '#' || href === '') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();

                // Calcula offset para compensar o header fixo
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 70;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================================
    // 3. BOTÃO VOLTAR AO TOPO
    // ============================================================

    const btnTopo = document.getElementById('btnTopo');

    if (btnTopo) {

        // Mostrar/ocultar baseado no scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                btnTopo.classList.add('visible');
            } else {
                btnTopo.classList.remove('visible');
            }
        });

        // Voltar ao topo ao clicar
        btnTopo.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================================
    // 4. FADE-IN (SCROLL REVEAL)
    // ============================================================

    const revealElements = document.querySelectorAll(
        '.motivacao__card, ' +
        '.modulos__card, ' +
        '.simulador__galeria img, ' +
        '.precos__card, ' +
        '.faq__item'
    );

    if (revealElements.length > 0) {

        const revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    // Opcional: para não ficar observando depois que já apareceu
                    // revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -20px 0px'
        });

        revealElements.forEach(function(el) {
            revealObserver.observe(el);
        });
    }

    // ============================================================
    // 5. CONTADOR ANIMADO
    // ============================================================

    /**
     * Analisa o texto e extrai as informações para a animação
     * @param {string} text - Texto original do elemento
     * @returns {object|null} - { target, prefix, suffix } ou null
     */
    function parseCounterText(text) {
        text = text.trim();

        // Caso 1: "29 mil+" -> conta até 29 e adiciona " mil+"
        if (text.includes('mil+')) {
            return { target: 29, prefix: '', suffix: ' mil+' };
        }

        // Caso 2: "70%" -> conta até 70 e adiciona "%"
        if (text.includes('%')) {
            const num = parseInt(text, 10);
            if (!isNaN(num)) {
                return { target: num, prefix: '', suffix: '%' };
            }
        }

        // Caso 3: "R$ 1.800–2.500" -> conta até 1.800 e mantém o restante
        if (text.includes('R$')) {
            // Divide pelo "–" para pegar a primeira parte (R$ 1.800)
            const parts = text.split('–');
            if (parts.length > 1) {
                // Remove tudo que não é número da primeira parte
                const firstPart = parts[0].replace(/[^0-9]/g, '');
                const num = parseInt(firstPart, 10);
                if (!isNaN(num)) {
                    return {
                        target: num,
                        prefix: 'R$ ',
                        suffix: '–2.500'
                    };
                }
            }
            // Fallback: tenta extrair qualquer número
            const fallbackNum = parseInt(text.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(fallbackNum)) {
                return { target: fallbackNum, prefix: 'R$ ', suffix: '' };
            }
        }

        // Caso genérico: tenta extrair o primeiro número
        const genericMatch = text.match(/\d+/);
        if (genericMatch) {
            const num = parseInt(genericMatch[0], 10);
            return { target: num, prefix: '', suffix: '' };
        }

        return null;
    }

    /**
     * Anima o contador de um elemento
     * @param {HTMLElement} el - Elemento que terá o número animado
     */
    function animateCounter(el) {
        const config = parseCounterText(el.textContent);
        if (!config) return;

        const { target, prefix, suffix } = config;
        let current = 0;
        const duration = 2000; // 2 segundos
        const stepTime = 20; // ms entre cada atualização
        const steps = duration / stepTime;
        const increment = target / steps;

        // Guarda o texto original completo para exibir no final
        const originalText = el.textContent;

        const timer = setInterval(function() {
            current += increment;

            if (current >= target) {
                current = target;
                clearInterval(timer);
                // Exibe o texto original completo ao final
                el.textContent = originalText;
                return;
            }

            // Exibe o número atual formatado
            const displayValue = Math.floor(current);
            el.textContent = prefix + displayValue + suffix;
        }, stepTime);
    }

    // Seleciona os elementos que terão contador animado
    const counterElements = document.querySelectorAll(
        '.hero__stat-number, ' +
        '.motivacao__destaque-numero'
    );

    if (counterElements.length > 0) {

        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                // Se entrou na tela e ainda não foi contado
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = 'true';
                    animateCounter(entry.target);
                }
            });
        }, {
            threshold: 0.5 // 50% visível para começar
        });

        counterElements.forEach(function(el) {
            counterObserver.observe(el);
        });
    }

    // ============================================================
    // 6. EXTRA: Correção de URLs com hash na carga inicial
    // ============================================================

    // Se a página carregar com uma âncora na URL (ex: /#precos),
    // faz o scroll suave após o carregamento
    if (window.location.hash) {
        setTimeout(function() {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 70;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 300); // Pequeno delay para garantir que tudo foi carregado
    }
    
    // ============================================================
    // HERO CARROSSEL - Prints do Curso
    // ============================================================

    (function initHeroCarrossel() {
        const carrossel = document.querySelector('.hero-carrossel');
        if (!carrossel) return;

        const slides = carrossel.querySelectorAll('.hero-carrossel__slide');
        const dots = carrossel.querySelectorAll('.hero-carrossel__dot');
        let currentSlide = 0;
        let autoPlayInterval = null;
        const AUTO_PLAY_DELAY = 4000; // 4 segundos

        if (slides.length === 0) return;

        function goToSlide(index) {
            // Remove active de todos
            slides.forEach(function(slide) {
                slide.classList.remove('hero-carrossel__slide--active');
            });
            dots.forEach(function(dot) {
                dot.classList.remove('hero-carrossel__dot--active');
            });

            // Ajusta índice
            if (index < 0) {
                currentSlide = slides.length - 1;
            } else if (index >= slides.length) {
                currentSlide = 0;
            } else {
                currentSlide = index;
            }

            // Adiciona active
            slides[currentSlide].classList.add('hero-carrossel__slide--active');
            if (dots[currentSlide]) {
                dots[currentSlide].classList.add('hero-carrossel__dot--active');
            }
        }

        function nextSlide() {
            goToSlide(currentSlide + 1);
        }

        function startAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
            autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        // Eventos das bolinhas
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                goToSlide(index);
                startAutoPlay();
            });
        });

        // Pausa no hover
        carrossel.addEventListener('mouseenter', stopAutoPlay);
        carrossel.addEventListener('mouseleave', startAutoPlay);

        // Pausa no toque (mobile)
        carrossel.addEventListener('touchstart', stopAutoPlay);
        carrossel.addEventListener('touchend', startAutoPlay);

        // Inicia
        goToSlide(0);
        startAutoPlay();

        // Limpa ao sair
        window.addEventListener('beforeunload', function() {
            stopAutoPlay();
        });

    })();

    // ============================================================
    // CARROSSEL - Simulador Interativo
    // ============================================================

    (function initCarrossel() {
        const carrossel = document.querySelector('.carrossel');
        if (!carrossel) return;

        const slides = carrossel.querySelectorAll('.carrossel__slide');
        const dots = carrossel.querySelectorAll('.carrossel__dot');
        const prevBtn = carrossel.querySelector('.carrossel__btn--prev');
        const nextBtn = carrossel.querySelector('.carrossel__btn--next');
        let currentSlide = 0;
        let autoPlayInterval = null;
        const AUTO_PLAY_DELAY = 4000; // 4 segundos

        // Verifica se há slides
        if (slides.length === 0) return;

        function goToSlide(index) {
            // Remove active de todos
            slides.forEach(function(slide) {
                slide.classList.remove('carrossel__slide--active');
            });
            dots.forEach(function(dot) {
                dot.classList.remove('carrossel__dot--active');
            });

            // Ajusta índice
            if (index < 0) {
                currentSlide = slides.length - 1;
            } else if (index >= slides.length) {
                currentSlide = 0;
            } else {
                currentSlide = index;
            }

            // Adiciona active ao slide e dot atual
            slides[currentSlide].classList.add('carrossel__slide--active');
            if (dots[currentSlide]) {
                dots[currentSlide].classList.add('carrossel__dot--active');
            }
        }

        function nextSlide() {
            goToSlide(currentSlide + 1);
        }

        function prevSlide() {
            goToSlide(currentSlide - 1);
        }

        function startAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
            autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        // Eventos dos botões
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                nextSlide();
                startAutoPlay(); // Reinicia o timer
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                prevSlide();
                startAutoPlay(); // Reinicia o timer
            });
        }

        // Eventos das bolinhas
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                goToSlide(index);
                startAutoPlay(); // Reinicia o timer
            });
        });

        // Pausa no hover (opcional)
        carrossel.addEventListener('mouseenter', function() {
            stopAutoPlay();
        });

        carrossel.addEventListener('mouseleave', function() {
            startAutoPlay();
        });

        // Pausa no toque (mobile)
        carrossel.addEventListener('touchstart', function() {
            stopAutoPlay();
        });

        carrossel.addEventListener('touchend', function() {
            startAutoPlay();
        });

        // Inicia o carrossel
        goToSlide(0);
        startAutoPlay();

        // Limpa o intervalo quando a página é descarregada (boa prática)
        window.addEventListener('beforeunload', function() {
            stopAutoPlay();
        });

    })();

    // ============================================================
// BOTÃO DE COMPRA - APENAS NA SEÇÃO PREÇOS (com parâmetro)
// ============================================================

    function configurarBotaoCompra() {
        const btnPrecos = document.querySelector('.btn--precos');

        if (!btnPrecos) {
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const plataforma = urlParams.get('plataforma');

        const links = {
            kiwify: 'https://pay.kiwify.com.br/bP8zGKE',
            hotmart: 'https://pay.hotmart.com/Q107215918X'
        };

        let linkEscolhido;
        let plataformaEscolhida;

        if (plataforma === 'hotmart') {
            linkEscolhido = links.hotmart;
            plataformaEscolhida = 'HOTMART';
        } else {
            linkEscolhido = links.kiwify;
            plataformaEscolhida = 'KIWIFY';
        }

        btnPrecos.href = linkEscolhido;

        // 6. (OPCIONAL) ALTERA O TEXTO DO BOTÃO PARA IDENTIFICAR A PLATAFORMA
        if (plataformaEscolhida === 'HOTMART') {
            btnPrecos.innerHTML = '<i class="fas fa-shopping-cart"></i> COMPRAR por R$ 97,00';
        } else {
            btnPrecos.innerHTML = '<i class="fas fa-shopping-cart"></i> COMPRAR por R$ 97,00';
        }
    }
    configurarBotaoCompra();    

}); // fim DOMContentLoaded