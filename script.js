/**
 * ACOLHE+ — Scripts Interativos Institucionais
 * Funcionalidades:
 * 1. Cabeçalho fixo com efeito de rolagem
 * 2. Menu mobile responsivo (gaveta com backdrop e suporte a teclado)
 * 3. Contadores de impacto animados com IntersectionObserver
 * 4. Filtros dinâmicos por categoria na seção de Projetos
 * 5. Sistema unificado de modais acessíveis (Apoio/PIX, Parcerias, História, Notícias)
 * 6. Cópia de chave PIX em 1 clique com notificação Toast
 * 7. Envio simulado com validação e feedback amigável nos formulários
 * 8. Navegação ativa durante scroll e botão de voltar ao topo
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileDrawer();
  initHeroSlider();
  initImpactCounters();
  initProjectFilters();
  initModalsSystem();
  initPixCopy();
  initDonationPills();
  initForms();
  initBackToTop();
  initScrollSpy();
  updateCurrentYear();
});

/* --------------------------------------------------------------------------
   0. Hero Slider / Carrossel de Imagens
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const slider    = document.getElementById('heroSlider');
  const slides    = slider ? slider.querySelectorAll('.hero-slide') : [];
  const dots      = document.querySelectorAll('.slider-dot[data-slide]');
  const prevBtn   = document.getElementById('sliderPrev');
  const nextBtn   = document.getElementById('sliderNext');

  if (!slider || slides.length < 2) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 4500; // ms entre slides

  /* Vai para um slide específico */
  const goToSlide = (newIndex) => {
    if (newIndex === currentIndex) return;

    // Marca o slide atual como "saindo"
    slides[currentIndex].classList.add('leaving');
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].setAttribute('aria-hidden', 'true');

    // Remove a classe "leaving" depois da transição
    const leavingSlide = slides[currentIndex];
    setTimeout(() => leavingSlide.classList.remove('leaving'), 780);

    // Ativa o novo slide
    currentIndex = (newIndex + slides.length) % slides.length;
    slides[currentIndex].classList.add('active');
    slides[currentIndex].setAttribute('aria-hidden', 'false');

    // Atualiza os dots
    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));

      // Reinicia a animação da barra de progresso no dot ativo
      if (isActive) {
        dot.classList.remove('active');
        void dot.offsetWidth; // Força reflow para reiniciar a animação CSS
        dot.classList.add('active');
      }
    });
  };

  /* Avança um slide */
  const nextSlide = () => goToSlide(currentIndex + 1);

  /* Volta um slide */
  const prevSlide = () => goToSlide(currentIndex - 1);

  /* Inicia o autoplay */
  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
  };

  /* Para o autoplay */
  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  /* Botão Próximo */
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      stopAutoplay();
      startAutoplay(); // Reinicia contagem após interação manual
    });
  }

  /* Botão Anterior */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  /* Dots de navegação */
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIndex = parseInt(dot.getAttribute('data-slide'), 10);
      goToSlide(targetIndex);
      stopAutoplay();
      startAutoplay();
    });
  });

  /* Suporte a swipe touch (mobile) */
  let touchStartX = 0;
  let touchEndX   = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      stopAutoplay();
      startAutoplay();
    }
  }, { passive: true });

  /* Pausa o autoplay quando o mouse está sobre o carrossel */
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  /* Pausa se a aba / janela estiver oculta */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  /* Suporte a teclado (setas esquerda/direita quando o foco está no slider) */
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prevSlide(); stopAutoplay(); startAutoplay(); }
    if (e.key === 'ArrowRight') { nextSlide(); stopAutoplay(); startAutoplay(); }
  });

  /* Inicia o autoplay */
  startAutoplay();
}


/* --------------------------------------------------------------------------
   1. Cabeçalho Fixo com Detecção de Scroll
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 25) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   2. Menu Mobile Responsivo (Gaveta Acessível)
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.querySelector('.mobile-drawer-backdrop');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const navLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer .btn');

  if (!toggleBtn || !drawer || !backdrop) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('visible');
    backdrop.setAttribute('aria-hidden', 'false');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('visible');
    backdrop.setAttribute('aria-hidden', 'true');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  navLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* --------------------------------------------------------------------------
   3. Contadores de Impacto Animados com IntersectionObserver
   -------------------------------------------------------------------------- */
function initImpactCounters() {
  const counters = document.querySelectorAll('.impact-counter[data-target]');
  if (!counters.length) return;

  let animated = false;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1600; // ms
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Curva de desaceleração suave (easeOutExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => animateCounter(counter));
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const impactSection = document.querySelector('.impact-section');
  if (impactSection) {
    observer.observe(impactSection);
  }
}

/* --------------------------------------------------------------------------
   4. Filtro Dinâmico de Projetos
   -------------------------------------------------------------------------- */
function initProjectFilters() {
  const filterPills = document.querySelectorAll('.filter-pill[data-filter]');
  const projectCards = document.querySelectorAll('.project-card[data-category]');

  if (!filterPills.length || !projectCards.length) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const filter = pill.getAttribute('data-filter');

      // Atualiza botões
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      // Filtra cards
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. Sistema de Modais Acessíveis e Leitura de Conteúdo
   -------------------------------------------------------------------------- */
const PROJECT_DETAILS = {
  gastronomia: {
    badge: 'Capacitação Profissional',
    title: 'Trilha Gastronômica & Panificação',
    subtitle: 'Formação técnica intensiva com certificação e inserção no mercado.',
    content: `
      <p>A Trilha Gastronômica da ACOLHE+ oferece uma formação completa que abrange boas práticas sanitárias, manipulação segura de alimentos, panificação artesanal e técnicas básicas de cozinha comercial.</p>
      <div style="background: var(--color-blue-light); padding: 16px; border-radius: var(--radius-sm); margin: 16px 0; border-left: 3px solid var(--color-teal);">
        <strong>Duração do ciclo:</strong> 12 semanas (180 horas práticas).<br>
        <strong>Certificação:</strong> Reconhecida por sindicatos e associações gastronômicas parceiras.<br>
        <strong>Empregabilidade:</strong> 85% dos concluintes são encaminhados a vagas ativas.
      </div>
      <p>Além das técnicas culinárias, os participantes desenvolvem competências socioemocionais como trabalho em equipe, pontualidade e resolução ágil de problemas em ambiente sob pressão.</p>
    `
  },
  talentos: {
    badge: 'Inclusão & ESG',
    title: 'Banco de Talentos ESG',
    subtitle: 'Ponte direta entre pessoas qualificadas e empresas com compromisso social.',
    content: `
      <p>O Banco de Talentos conecta empresas comprometidas com metas ESG a profissionais que concluíram os cursos da ACOLHE+. Fazemos a triagem e o alinhamento de perfil conforme a cultura de cada contratante.</p>
      <div style="background: var(--color-blue-light); padding: 16px; border-radius: var(--radius-sm); margin: 16px 0; border-left: 3px solid var(--color-teal);">
        <strong>Áreas atendidas:</strong> Logística, atendimento ao cliente, gastronomia e serviços gerais.<br>
        <strong>Mentoria Continuada:</strong> Suporte semanal da equipe ACOLHE+ durante os primeiros 6 meses de contrato formal.<br>
        <strong>Índice de Permanência:</strong> 88% após o período de experiência.
      </div>
      <p>Sua empresa pode cadastrar vagas afirmativas e receber suporte completo da nossa consultoria de diversidade e inclusão.</p>
    `
  },
  conecta: {
    badge: 'Inclusão Digital',
    title: 'Conecta+: Inclusão Digital e Cidadania',
    subtitle: 'Tecnologia acessível para autonomia cidadã e profissional.',
    content: `
      <p>O programa Conecta+ ensina desde os fundamentos do uso do computador e smartphone até a elaboração de currículos digitais, envio de e-mails formais e consulta a serviços do governo (como Carteira de Trabalho Digital e Poupatempo).</p>
      <div style="background: var(--color-blue-light); padding: 16px; border-radius: var(--radius-sm); margin: 16px 0; border-left: 3px solid var(--color-teal);">
        <strong>Módulos:</strong> Informática básica, digitação, ferramentas Google, redação profissional e segurança online.<br>
        <strong>Impacto:</strong> 100% dos alunos saem com documentação regularizada e currículo cadastrado nas plataformas de emprego.
      </div>
    `
  },
  maos: {
    badge: 'Acolhimento Humanizado',
    title: 'Mãos que Acolhem: Atuação Comunitária',
    subtitle: 'Escuta ativa e suporte nas ruas como porta de entrada para a transformação.',
    content: `
      <p>Nossas equipes multidisciplinares (assistentes sociais, psicólogos e educadores) realizam rondas e atendimentos humanizados nos principais pontos de vulnerabilidade da cidade.</p>
      <p>O foco é estabelecer um vínculo genuíno de respeito e dignidade, identificando as necessidades de saúde, regularização civil e motivação pessoal para ingresso nas turmas de formação técnica.</p>
    `
  }
};

const NEWS_DETAILS = {
  'turma-gastronomia': {
    badge: 'Cursos e Capacitações',
    title: 'Início das aulas da nova turma de Gastronomia e Confeitaria',
    subtitle: 'Publicado em 10 de Setembro de 2026',
    content: `
      <p>Com muita emoção e expectativa, iniciamos nesta semana as aulas da 4ª turma de Gastronomia da ACOLHE+. São 25 alunos que terão 12 semanas de imersão prática em técnicas de panificação, confeitaria e cozinha comercial.</p>
      <p>A aula inaugural contou com a presença de chefs parceiros voluntários que compartilharam suas trajetórias e inspiraram a turma sobre as oportunidades crescentes no setor de hospitalidade e serviços.</p>
    `
  },
  'historia-joao': {
    badge: 'Histórias de Transformação',
    title: 'Do acolhimento ao emprego formal: a história de superação de João',
    subtitle: 'Publicado em 28 de Agosto de 2026',
    content: `
      <p>Após viver quase dois anos em situação de rua no centro de São Paulo, João encontrou na ACOLHE+ o acolhimento necessário para recomeçar. Ingressou no curso de Logística e Armazenagem, destacando-se pela pontualidade e dedicação aos estudos.</p>
      <p>Hoje, aos 38 anos, João completa três meses como conferente contratado em um centro de distribuição parceiro, já alugou seu próprio quarto e sonha em continuar estudando para se tornar encarregado de estoque.</p>
    `
  },
  'campanha-kit': {
    badge: 'Campanhas Solidárias',
    title: 'Campanha “Kit Futuro”: doe ferramentas de trabalho para novos alunos',
    subtitle: 'Publicado em 15 de Agosto de 2026',
    content: `
      <p>Lançamos a campanha “Kit Futuro” com o objetivo de equipar cada concluinte dos nossos cursos com seu próprio conjunto de ferramentas profissionais (como avental térmico, facas de chef ou calçado de segurança padrão).</p>
      <p>Com apenas R$ 50 você viabiliza um kit completo e permite que um formando inicie sua nova jornada de trabalho com dignidade e autonomia.</p>
    `
  }
};

function initModalsSystem() {
  const openButtons = document.querySelectorAll('[data-open-modal]');
  const closeButtons = document.querySelectorAll('[data-close-modal]');
  const backdrops = document.querySelectorAll('.modal-backdrop');

  const openModalById = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Foca o primeiro elemento focável dentro do modal
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea');
    if (focusable.length) focusable[0].focus();
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-open-modal');
      const projectKey = btn.getAttribute('data-project');
      const newsKey = btn.getAttribute('data-news');

      // Se for modal de detalhes de projeto
      if (modalId === 'modal-projeto' && projectKey && PROJECT_DETAILS[projectKey]) {
        const item = PROJECT_DETAILS[projectKey];
        populateInfoModal(item.badge, item.title, item.subtitle, item.content);
        openModalById('modal-info');
        return;
      }

      // Se for modal de detalhes de notícia
      if (modalId === 'modal-noticia' && newsKey && NEWS_DETAILS[newsKey]) {
        const item = NEWS_DETAILS[newsKey];
        populateInfoModal(item.badge, item.title, item.subtitle, item.content);
        openModalById('modal-info');
        return;
      }

      openModalById(modalId);
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      const modal = document.getElementById(modalId);
      closeModal(modal);
    });
  });

  backdrops.forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) closeModal(activeModal);
    }
  });
}

function populateInfoModal(badge, title, subtitle, htmlContent) {
  const badgeEl = document.getElementById('modal-info-badge');
  const titleEl = document.getElementById('modal-info-title');
  const subtitleEl = document.getElementById('modal-info-subtitle');
  const contentEl = document.getElementById('modal-info-content');

  if (badgeEl) badgeEl.textContent = badge || 'ACOLHE+';
  if (titleEl) titleEl.textContent = title || '';
  if (subtitleEl) subtitleEl.textContent = subtitle || '';
  if (contentEl) contentEl.innerHTML = htmlContent || '';
}

/* --------------------------------------------------------------------------
   6. Cópia da Chave PIX com Feedback Toast
   -------------------------------------------------------------------------- */
function initPixCopy() {
  const copyBtn = document.getElementById('btn-copy-pix');
  const pixKeyVal = document.getElementById('pix-key-val');

  if (!copyBtn || !pixKeyVal) return;

  copyBtn.addEventListener('click', async () => {
    const keyText = pixKeyVal.textContent.trim();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(keyText);
      } else {
        const temp = document.createElement('textarea');
        temp.value = keyText;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      showToast('Chave PIX copiada com sucesso!');
    } catch (err) {
      showToast('Chave PIX: contato@acolhemais.org.br');
    }
  });
}

/* --------------------------------------------------------------------------
   7. Seleção de Pílulas de Doação
   -------------------------------------------------------------------------- */
function initDonationPills() {
  const pills = document.querySelectorAll('.donation-pill');
  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   8. Manipulação dos Formulários com Validação e Feedback
   -------------------------------------------------------------------------- */
function initForms() {
  // Formulário de Contato
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = contactForm.querySelector('#contact-name')?.value.trim();
      const email = contactForm.querySelector('#contact-email')?.value.trim();
      const message = contactForm.querySelector('#contact-message')?.value.trim();

      if (!name || !email || !message) {
        showToast('Por favor, preencha todos os campos obrigatórios (*).');
        return;
      }

      showToast(`Obrigado, ${name}! Sua mensagem foi enviada. Responderemos em breve.`);
      contactForm.reset();
    });
  }

  // Formulário de Parceria Corporativa
  const partnerForm = document.getElementById('partner-form');
  if (partnerForm) {
    partnerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const company = partnerForm.querySelector('#partner-company')?.value.trim();
      const contactName = partnerForm.querySelector('#partner-contact-name')?.value.trim();

      if (!company || !contactName) {
        showToast('Por favor, preencha os dados da sua empresa.');
        return;
      }

      // Fecha modal de parceria
      const modal = document.getElementById('modal-parceria');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }

      showToast(`Proposta da ${company} recebida com sucesso! Nossa equipe de parcerias entrará em contato.`);
      partnerForm.reset();
    });
  }
}

/* --------------------------------------------------------------------------
   9. Botão de Voltar ao Topo
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const topBtn = document.querySelector('.back-to-top-btn');
  if (!topBtn) return;

  topBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* --------------------------------------------------------------------------
   10. ScrollSpy para Menu Ativo Durante a Rolagem
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const onScroll = () => {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* --------------------------------------------------------------------------
   11. Notificação Toast Acessível
   -------------------------------------------------------------------------- */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F58A00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3800);
}

/* --------------------------------------------------------------------------
   12. Atualização Automática do Ano no Rodapé
   -------------------------------------------------------------------------- */
function updateCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
