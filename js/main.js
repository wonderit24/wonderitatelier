(() => {
  "use strict";
  const config = window.SITE_CONFIG;
  const items = window.GALLERY_ITEMS || [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  document.documentElement.style.setProperty('--navy', config.colors.navy);
  document.documentElement.style.setProperty('--cyan', config.colors.cyan);
  document.documentElement.style.setProperty('--white', config.colors.white);
  $$('[data-brand]').forEach(el => { el.textContent = config.brand; });
  $$('[data-tagline]').forEach(el => { el.textContent = config.tagline; });
  const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent("Hi, I saw your portfolio and I'd like to discuss a design project.")}`;
  $$('[data-whatsapp]').forEach(el => { el.href = whatsappUrl; el.target = "_blank"; el.rel = "noopener"; });
  $$('[data-email]').forEach(el => { el.href = `mailto:${config.email}?subject=${encodeURIComponent("Let's talk about a design project")}`; el.target = "_blank"; el.rel = "noopener"; });
  $$('[data-instagram]').forEach(el => { el.href = `https://ig.me/m/${config.instagram}`; el.target = "_blank"; el.rel = "noopener"; });
  $('#year').textContent = new Date().getFullYear();

  const designItems = items.filter(item => item.type === 'design');
  const productItems = items.filter(item => item.type === 'product');
  const designGallery = $('#design-gallery');
  const designViewport = $('#design-slider');
  const productGallery = $('#product-gallery');
  const filters = $('#design-filters');
  const slideCount = $('#design-slide-count');
  const previousDesigns = $('#design-prev');
  const nextDesigns = $('#design-next');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createCard(item, index, group) {
    const card = document.createElement('button');
    card.type = 'button'; card.className = `gallery-card ${item.type === 'product' ? 'product-card' : ''}`;
    card.dataset.category = item.category;
    card.setAttribute('aria-label', `View ${item.title}`);
    if (item.type === 'design') card.setAttribute('aria-roledescription', 'slide');
    const media = document.createElement('span'); media.className = 'card-media';
    const img = document.createElement('img'); img.src = item.file; img.alt = `${item.title} — ${item.description}`; img.loading = 'lazy';
    media.append(img);
    const overlay = document.createElement('span'); overlay.className = 'card-overlay';
    const title = document.createElement('span'); title.className = 'card-title'; title.textContent = item.title;
    const arrow = document.createElement('span'); arrow.className = 'card-open'; arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗';
    overlay.append(title, arrow); media.append(overlay);
    const meta = document.createElement('span'); meta.className = 'card-meta';
    const label = document.createElement('span'); label.textContent = item.category;
    const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0');
    meta.append(label, number); card.append(media, meta);
    card.addEventListener('click', () => openLightbox(item, group));
    return card;
  }
  designItems.forEach((item, index) => designGallery.append(createCard(item, index, designItems)));
  productItems.forEach((item, index) => productGallery.append(createCard(item, index, productItems)));

  function getVisibleSlides() {
    return $$('.gallery-card:not(.is-hidden)', designGallery);
  }
  function getCurrentSlideIndex(slides = getVisibleSlides()) {
    if (!slides.length) return 0;
    let currentIndex = 0;
    let nearestDistance = Infinity;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - designViewport.scrollLeft);
      if (distance < nearestDistance) { nearestDistance = distance; currentIndex = index; }
    });
    return currentIndex;
  }
  function getSlidesPerView(slides = getVisibleSlides()) {
    if (!slides.length) return 1;
    const gap = parseFloat(getComputedStyle(designGallery).columnGap) || 0;
    const slideWidth = slides[0].getBoundingClientRect().width;
    return Math.max(1, Math.floor((designViewport.clientWidth + gap) / (slideWidth + gap)));
  }
  function updateSliderControls() {
    const slides = getVisibleSlides();
    const total = slides.length;
    const first = getCurrentSlideIndex(slides);
    const perView = getSlidesPerView(slides);
    const start = total ? first + 1 : 0;
    const end = Math.min(total, first + perView);
    const format = value => String(value).padStart(2, '0');
    slideCount.textContent = total ? `${format(start)}–${format(end)} / ${format(total)}` : '00 / 00';
    previousDesigns.disabled = total === 0 || first === 0;
    nextDesigns.disabled = total === 0 || first + perView >= total;
  }
  function moveDesignSlides(direction) {
    const slides = getVisibleSlides();
    if (!slides.length) return;
    const first = getCurrentSlideIndex(slides);
    const step = getSlidesPerView(slides);
    const targetIndex = direction > 0 ? Math.min(slides.length - 1, first + step) : Math.max(0, first - step);
    designViewport.scrollTo({ left: slides[targetIndex].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  previousDesigns.addEventListener('click', () => moveDesignSlides(-1));
  nextDesigns.addEventListener('click', () => moveDesignSlides(1));
  designViewport.addEventListener('scroll', () => requestAnimationFrame(updateSliderControls), { passive: true });
  designViewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveDesignSlides(-1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); moveDesignSlides(1); }
    else if (event.key === 'Home') { event.preventDefault(); const first = getVisibleSlides()[0]; if (first) designViewport.scrollTo({ left: first.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' }); }
    else if (event.key === 'End') { event.preventDefault(); const slides = getVisibleSlides(); const last = slides[slides.length - 1]; if (last) designViewport.scrollTo({ left: last.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' }); }
  });
  window.addEventListener('resize', updateSliderControls, { passive: true });

  // Category controls follow the data, so new categories need no code changes.
  ['All', ...new Set(designItems.map(item => item.category))].forEach(category => {
    const button = document.createElement('button'); button.type = 'button'; button.className = `filter-button${category === 'All' ? ' is-active' : ''}`;
    button.textContent = category; button.setAttribute('aria-pressed', String(category === 'All'));
    button.addEventListener('click', () => {
      $$('.filter-button', filters).forEach(filter => { const active = filter === button; filter.classList.toggle('is-active', active); filter.setAttribute('aria-pressed', String(active)); });
      $$('.gallery-card', designGallery).forEach((card, index) => {
        const show = category === 'All' || card.dataset.category === category;
        card.classList.toggle('is-hidden', !show);
        if (show) { card.style.setProperty('--item-order', index % 4); card.classList.remove('filter-in'); void card.offsetWidth; card.classList.add('filter-in'); }
      });
      designViewport.scrollTo({ left: 0, behavior: 'auto' });
      updateSliderControls();
    }); filters.append(button);
  });
  updateSliderControls();

  // Mobile menu closes after choosing a section or pressing Escape.
  const menu = $('.menu-toggle'); const nav = $('#nav-links');
  function setMenu(open) { menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); nav.classList.toggle('is-open', open); document.body.classList.toggle('menu-open', open); }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  $$('.nav-links a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  const revealTargets = $$('.reveal, .gallery-card');
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealTargets.forEach((element, index) => { if (element.classList.contains('gallery-card')) element.style.setProperty('--reveal-order', index % 4); });
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(element => revealObserver.observe(element));
  } else revealTargets.forEach(element => element.classList.add('is-visible'));

  const header = $('.site-header');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-links a[href^="#"]');
  function updateScrollState() { header.classList.toggle('scrolled', window.scrollY > 18); }
  window.addEventListener('scroll', updateScrollState, { passive: true }); updateScrollState();
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('is-current', link.getAttribute('href') === `#${entry.target.id}`)); }), { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Reusable lightbox with keyboard navigation, focus return and touch swipes.
  const lightbox = $('#lightbox'); const lightboxImage = $('img', lightbox); const lightboxTitle = $('h2', lightbox); const lightboxDescription = $('p', lightbox);
  let lightboxItems = []; let lightboxIndex = 0; let lastFocus = null; let touchStartX = 0;
  function renderLightbox() { const item = lightboxItems[lightboxIndex]; lightboxImage.src = item.file; lightboxImage.alt = `${item.title} — ${item.description}`; lightboxTitle.textContent = item.title; lightboxDescription.textContent = item.description || ''; }
  function openLightbox(item, group) { lightboxItems = group; lightboxIndex = group.indexOf(item); lastFocus = document.activeElement; renderLightbox(); lightbox.classList.add('is-open'); lightbox.setAttribute('aria-hidden', 'false'); document.body.classList.add('lightbox-open'); $('.lightbox-close', lightbox).focus(); }
  function closeLightbox() { lightbox.classList.remove('is-open'); lightbox.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lightbox-open'); if (lastFocus) lastFocus.focus(); }
  function moveLightbox(delta) { lightboxIndex = (lightboxIndex + delta + lightboxItems.length) % lightboxItems.length; renderLightbox(); }
  $('.lightbox-close', lightbox).addEventListener('click', closeLightbox);
  $('.lightbox-prev', lightbox).addEventListener('click', () => moveLightbox(-1)); $('.lightbox-next', lightbox).addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { if (lightbox.classList.contains('is-open')) closeLightbox(); else setMenu(false); }
    if (lightbox.classList.contains('is-open')) { if (event.key === 'ArrowLeft') moveLightbox(-1); if (event.key === 'ArrowRight') moveLightbox(1); }
  });
  lightbox.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend', event => { const delta = event.changedTouches[0].screenX - touchStartX; if (Math.abs(delta) > 45) moveLightbox(delta > 0 ? -1 : 1); }, { passive: true });
  lightbox.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = $$('button', lightbox); const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  // Contact becomes live when formEndpoint is replaced with a service URL.
  const form = $('#contact-form'); const formStatus = $('#form-status'); const submit = $('.submit-button', form);
  form.addEventListener('submit', async event => {
    event.preventDefault(); formStatus.className = 'form-status'; formStatus.textContent = '';
    if (!form.reportValidity()) return;
    if (!config.formEndpoint || config.formEndpoint.includes('your-form-endpoint.example')) {
      formStatus.classList.add('is-note'); formStatus.textContent = 'The message form is ready to connect. For now, please use WhatsApp, email or Instagram above.'; return;
    }
    const originalText = $('span', submit).textContent; submit.disabled = true; submit.classList.add('is-loading'); $('span', submit).textContent = 'Sending…';
    try {
      const response = await fetch(config.formEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('The form service returned an error.');
      form.reset(); formStatus.classList.add('is-success'); formStatus.textContent = 'Thanks for your message. I’ll be in touch soon.';
    } catch (error) { formStatus.classList.add('is-error'); formStatus.textContent = 'Your message could not be sent right now. Please try one of the direct contact options above.'; }
    finally { submit.disabled = false; submit.classList.remove('is-loading'); $('span', submit).textContent = originalText; }
  });
})();
