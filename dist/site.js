(() => {
  const root = document.documentElement;
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = reduceQuery.matches;
  root.classList.add('js');
  if (!reduced) root.classList.add('motion');

  const nav = document.querySelector('.nav');
  const menuButton = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');

  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = 'Menu';
  };
  menuButton.addEventListener('click', () => {
    const willOpen = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', willOpen);
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.textContent = willOpen ? 'Close' : 'Menu';
  });
  navLinks.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target)) closeMenu();
  });

  if (!reduced) {
    document.querySelectorAll('h1, .display').forEach(title => {
      let index = 0;
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim()) textNodes.push(walker.currentNode);
      }
      textNodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach(part => {
          if (!part.trim()) {
            fragment.append(part);
            return;
          }
          const span = document.createElement('span');
          span.className = 'word';
          span.style.setProperty('--word-index', index++);
          span.textContent = part;
          fragment.append(span);
        });
        node.replaceWith(fragment);
      });
    });
  }

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
    reveals.forEach(element => {
      if (!element.classList.contains('in')) revealObserver.observe(element);
    });
  } else {
    reveals.forEach(element => element.classList.add('in'));
  }

  const journeySections = [...document.querySelectorAll('header[id], main section[id]')];
  const navAnchors = [...navLinks.querySelectorAll('a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const chapterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(anchor => {
          const active = anchor.getAttribute('href') === '#' + entry.target.id;
          if (active) anchor.setAttribute('aria-current', 'true');
          else anchor.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-34% 0px -55% 0px', threshold: 0 });
    journeySections.forEach(section => chapterObserver.observe(section));
  }

  const artWindows = [...document.querySelectorAll('.art-window')];
  const dividers = [...document.querySelectorAll('.chapter-divider')];
  const vines = [...document.querySelectorAll('.margin-vine')];
  const heroCrest = document.querySelector('.figure-crest');
  const manuscript = document.querySelector('.manuscript-card');
  if ('IntersectionObserver' in window && !reduced) {
    const peacockObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
    dividers.forEach(divider => peacockObserver.observe(divider));
  } else {
    dividers.forEach(divider => divider.classList.add('is-visible'));
  }
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduced) {
    dividers.forEach(divider => {
      const resetPointer = () => {
        divider.classList.remove('is-hovering');
        divider.style.setProperty('--hover-x', '0px');
        divider.style.setProperty('--hover-y', '0px');
        divider.style.setProperty('--hover-left-tilt', '0deg');
        divider.style.setProperty('--hover-right-tilt', '0deg');
        divider.style.setProperty('--hover-glow-x', '0px');
        divider.style.setProperty('--hover-glow-y', '0px');
      };
      divider.addEventListener('pointerenter', event => {
        if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        divider.classList.add('is-hovering');
      });
      divider.addEventListener('pointermove', event => {
        if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        const rect = divider.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
        const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
        divider.style.setProperty('--hover-x', (x * 12).toFixed(2) + 'px');
        divider.style.setProperty('--hover-y', (y * 5).toFixed(2) + 'px');
        divider.style.setProperty('--hover-left-tilt', (x * 1.6).toFixed(2) + 'deg');
        divider.style.setProperty('--hover-right-tilt', (-x * 1.6).toFixed(2) + 'deg');
        divider.style.setProperty('--hover-glow-x', (x * 88).toFixed(2) + 'px');
        divider.style.setProperty('--hover-glow-y', (y * 34).toFixed(2) + 'px');
      });
      divider.addEventListener('pointerleave', resetPointer);
    });
  }

  /* Give each visible part of a chapter its own entrance vector. The observer
     deliberately removes the state when an item leaves the viewport, so the
     choreography plays again when someone scrolls back through the story. */
  const choreoSelectors = [
    'main section .section-header',
    '.overture-copy',
    '.manuscript-card',
    '.ornament-detail',
    '.class-card',
    '.program-facts > div',
    '.philosophy-inner',
    '.philosophy-inner > *',
    '.expectation-card',
    '.conduct-note',
    '.enquire-copy',
    '.contact-form .field',
    '.contact-form .form-actions',
    '.footer-inner > *'
  ];
  const choreoItems = [...new Set(choreoSelectors.flatMap(selector => [...document.querySelectorAll(selector)]))];
  const decorItems = [...document.querySelectorAll('.ornament-detail .mughal-frieze, .footer-ornament .mughal-frieze, .fine-floral, .manuscript-card .seal')];
  const motionKinds = ['slide-left', 'lift', 'slide-right', 'drop', 'tilt', 'rise'];
  choreoItems.forEach((element, index) => {
    element.classList.add('choreo');
    element.dataset.motionKind = motionKinds[index % motionKinds.length];
    element.style.setProperty('--motion-index', String(index));
    element.style.setProperty('--motion-delay', Math.min(420, (index % 8) * 58) + 'ms');
  });
  decorItems.forEach((element, index) => {
    element.classList.add('decor-choreo');
    element.style.setProperty('--decor-r', (index % 2 ? 3 : -3) + 'deg');
    element.style.setProperty('--decor-y', ((index % 3) - 1) * 10 + 'px');
  });
  if ('IntersectionObserver' in window && !reduced) {
    const choreoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const target = entry.target;
        const isDecor = target.classList.contains('decor-choreo');
        const visibleClass = isDecor ? 'decor-visible' : 'choreo-visible';
        const popClass = 'choreo-pop';
        target.classList.toggle(visibleClass, entry.isIntersecting);
        if (!isDecor && entry.isIntersecting) {
          target.classList.remove(popClass);
          requestAnimationFrame(() => target.classList.add(popClass));
          clearTimeout(target._choreoTimer);
          target._choreoTimer = setTimeout(() => target.classList.remove(popClass), 1180);
        }
      });
    }, { threshold: 0.13, rootMargin: '-9% 0px -9% 0px' });
    choreoItems.forEach(element => choreoObserver.observe(element));
    decorItems.forEach(element => choreoObserver.observe(element));
  } else {
    choreoItems.forEach(element => element.classList.add('choreo-visible'));
    decorItems.forEach(element => element.classList.add('decor-visible'));
  }
  let scrollFrame = 0;

  const localProgress = element => {
    const rect = element.getBoundingClientRect();
    return Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
  };
  const updateScroll = () => {
    scrollFrame = 0;
    const maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const reading = Math.max(0, Math.min(1, scrollY / maximum));
    root.style.setProperty('--reading', reading.toFixed(4));
    nav.classList.toggle('scrolled', scrollY > 18);
    if (reduced) return;

    artWindows.forEach(windowElement => {
      const progress = localProgress(windowElement);
      windowElement.style.setProperty('--art-y', ((0.5 - progress) * 14).toFixed(2) + 'px');
      windowElement.style.setProperty('--chapter-progress', progress.toFixed(3));
    });
    dividers.forEach(divider => {
      const progress = localProgress(divider);
      divider.style.setProperty('--line-progress', Math.min(1, progress * 1.55).toFixed(3));
      divider.style.setProperty('--divider-y', ((0.5 - progress) * 7).toFixed(2) + 'px');
    });
    vines.forEach((vine, index) => {
      const progress = localProgress(vine.parentElement);
      const direction = index % 2 ? -1 : 1;
      vine.style.setProperty('--vine-y', ((progress - 0.5) * 32 * direction).toFixed(2) + 'px');
    });
    if (heroCrest) heroCrest.style.setProperty('--crest-y', Math.min(12, scrollY * 0.035).toFixed(2) + 'px');
    if (manuscript) manuscript.style.setProperty('--card-y', ((0.5 - localProgress(manuscript)) * 12).toFixed(2) + 'px');
    journeySections.forEach(section => {
      const progress = localProgress(section);
      section.style.setProperty('--section-progress', progress.toFixed(3));
      section.classList.toggle('is-active', progress > .08 && progress < .92);
    });
    choreoItems.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const centerOffset = Math.max(-1.2, Math.min(1.2, (innerHeight * .5 - (rect.top + rect.height * .5)) / innerHeight));
      const direction = index % 2 ? -1 : 1;
      const sway = Math.sin(scrollY * .0025 + index * .77) * (innerWidth < 700 ? 2.1 : 4.4);
      element.style.setProperty('--drift-y', (centerOffset * 10).toFixed(2) + 'px');
      element.style.setProperty('--drift-x', (sway + centerOffset * direction * 2.4).toFixed(2) + 'px');
      element.style.setProperty('--drift-r', (centerOffset * direction * .75).toFixed(2) + 'deg');
    });
    decorItems.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const centerOffset = Math.max(-1.2, Math.min(1.2, (innerHeight * .5 - (rect.top + rect.height * .5)) / innerHeight));
      element.style.setProperty('--decor-y', (centerOffset * (innerWidth < 700 ? 10 : 17) + ((index % 2) ? 3 : -3)).toFixed(2) + 'px');
    });
  };
  const requestScrollUpdate = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  };
  addEventListener('scroll', requestScrollUpdate, { passive: true });
  addEventListener('resize', requestScrollUpdate, { passive: true });
  updateScroll();

  const form = document.querySelector('#contact-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || 'there').trim();
    form.querySelector('.form-note').textContent =
      'Thanks, ' + name + '. This preview has not emailed your application. Please send the completed form to kiransohailazeemi1994@gmail.com.';
  });

  const canvas = document.querySelector('.page-canvas');
  if (!reduced && canvas.getContext) {
    const context = canvas.getContext('2d');
    const flecks = Array.from({ length: 30 }, (_, index) => ({
      x: ((index * 47) % 97) / 97,
      y: ((index * 73) % 101) / 101,
      size: 0.45 + (index % 5) * 0.18,
      speed: 0.00002 + (index % 7) * 0.000004,
      alpha: 0.08 + (index % 4) * 0.025
    }));
    let canvasWidth = 0;
    let canvasHeight = 0;
    let dustFrame = 0;
    let lastTime = performance.now();
    const sizeCanvas = () => {
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvasWidth = innerWidth;
      canvasHeight = innerHeight;
      canvas.width = Math.round(canvasWidth * ratio);
      canvas.height = Math.round(canvasHeight * ratio);
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const paintFlecks = time => {
      const delta = Math.min(40, time - lastTime);
      lastTime = time;
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.fillStyle = '#986e32';
      flecks.forEach(fleck => {
        fleck.y -= fleck.speed * delta;
        if (fleck.y < -0.02) fleck.y = 1.02;
        context.globalAlpha = fleck.alpha;
        context.beginPath();
        context.arc(fleck.x * canvasWidth, fleck.y * canvasHeight, fleck.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      dustFrame = requestAnimationFrame(paintFlecks);
    };
    sizeCanvas();
    addEventListener('resize', sizeCanvas, { passive: true });
    dustFrame = requestAnimationFrame(paintFlecks);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(dustFrame);
        dustFrame = 0;
      } else if (!dustFrame) {
        lastTime = performance.now();
        dustFrame = requestAnimationFrame(paintFlecks);
      }
    });
  }

})();
