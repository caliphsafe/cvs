(() => {
  'use strict';
  const projects = window.CVS_PROJECTS || [];
  const byId = id => projects.find(project => project.id === id);
  const params = new URLSearchParams(location.search);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reducedMotion ? 'instant' : 'smooth';
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const menu = document.querySelector('.menu-button');
  const navigation = document.querySelector('#navigation');
  const closeMenu = () => {
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
    navigation?.classList.remove('is-open');
  };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation?.classList.toggle('is-open', open);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) closeMenu();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  navigation?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.querySelectorAll('[data-service-tab]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.serviceTab;
      document.querySelectorAll('[data-service-tab]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
      document.querySelectorAll('[data-service-panel]').forEach(panel => { panel.hidden = panel.dataset.servicePanel !== key; });
      document.querySelector('.house-panel').dataset.houseService = key;
    });
  });

  // Photo IDs are indices within a known, local project manifest. URLs from query strings are never trusted.
  const safeIndex = (project, value) => {
    const index = Number(value);
    return value !== null && value !== undefined && Number.isInteger(index) && index >= 0 && index < project.photos.length ? index : project.cover - 1;
  };
  const viewer = document.querySelector('#photo-viewer');
  const viewerImage = document.querySelector('#viewer-image');
  const thumbRail = document.querySelector('.viewer-thumbs');
  const projectSelect = document.querySelector('#viewer-project');
  let activeProject = projects[0];
  let activeIndex = activeProject ? activeProject.cover - 1 : 0;
  let returnFocus = null;
  let selectedReference = null;
  let viewerLoading = 0;
  const quoteForm = document.querySelector('#quote-form');

  const renderPhoto = () => {
    const photo = activeProject.photos[activeIndex];
    const version = ++viewerLoading;
    viewerImage.style.opacity = '.45';
    viewerImage.onload = () => { if (version === viewerLoading) viewerImage.style.opacity = '1'; };
    viewerImage.src = photo.src;
    viewerImage.alt = photo.alt;
    if (viewerImage.complete) viewerImage.style.opacity = '1';
    document.querySelector('#viewer-stage').textContent = photo.stage === 'During' ? 'Work in progress' : photo.stage;
    document.querySelector('#viewer-count').textContent = `Photo ${activeIndex + 1} of ${activeProject.photos.length}`;
    thumbRail.querySelectorAll('button').forEach((thumb, i) => thumb.setAttribute('aria-current', String(i === activeIndex)));
    const activeThumb = thumbRail.children[activeIndex];
    if (activeThumb) {
      const left = activeThumb.offsetLeft - thumbRail.offsetLeft - thumbRail.clientWidth / 2 + activeThumb.clientWidth / 2;
      thumbRail.scrollTo({ left: Math.max(0, left), behavior: scrollBehavior });
    }
    // Preload only the adjacent image; the entire album is not eagerly downloaded.
    const adjacent = new Image();
    adjacent.src = activeProject.photos[(activeIndex + 1) % activeProject.photos.length].src;
  };
  const renderAlbum = () => {
    document.querySelector('#viewer-title').textContent = activeProject.title;
    document.querySelector('#viewer-category').textContent = activeProject.category;
    projectSelect.value = activeProject.id;
    thumbRail.replaceChildren();
    activeProject.photos.forEach((photo, index) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'viewer-thumb';
      thumb.setAttribute('aria-label', `${photo.stage} photo ${index + 1} of ${activeProject.photos.length}`);
      const img = document.createElement('img');
      img.src = photo.thumb;
      img.alt = '';
      img.loading = 'lazy';
      img.width = 68;
      img.height = 51;
      const label = document.createElement('span');
      label.textContent = photo.stage === 'During' ? 'In progress' : photo.stage;
      thumb.append(img, label);
      thumb.addEventListener('click', () => { activeIndex = index; renderPhoto(); });
      thumbRail.append(thumb);
    });
    renderPhoto();
  };
  const openAlbum = (id, photoIndex, trigger) => {
    const project = byId(id);
    if (!project || !viewer) return;
    activeProject = project;
    activeIndex = safeIndex(project, photoIndex);
    returnFocus = trigger || document.activeElement;
    renderAlbum();
    viewer.showModal();
    document.body.classList.add('modal-open');
    document.querySelector('.close-viewer').focus();
  };
  const closeAlbum = () => { viewer?.close(); };
  if (viewer) {
    projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.short;
      projectSelect.append(option);
    });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      returnFocus?.focus({ preventScroll: true });
    });
    document.querySelector('.close-viewer').addEventListener('click', closeAlbum);
    viewer.addEventListener('click', event => {
      if (event.target === viewer) {
        const bounds = viewer.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeAlbum();
      }
    });
    const move = delta => { activeIndex = (activeIndex + delta + activeProject.photos.length) % activeProject.photos.length; renderPhoto(); };
    document.querySelector('.photo-nav.previous').addEventListener('click', () => move(-1));
    document.querySelector('.photo-nav.next').addEventListener('click', () => move(1));
    viewer.addEventListener('keydown', event => {
      if (event.target.matches('select,input,textarea')) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    });
    let touchStart = null;
    viewerImage.addEventListener('touchstart', event => {
      if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    viewerImage.addEventListener('touchend', event => {
      if (!touchStart) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
      touchStart = null;
    }, { passive: true });
    projectSelect.addEventListener('change', () => {
      activeProject = byId(projectSelect.value);
      activeIndex = activeProject.cover - 1;
      renderAlbum();
    });
    document.querySelectorAll('[data-project]').forEach(trigger => trigger.addEventListener('click', event => {
      event.preventDefault();
      openAlbum(trigger.dataset.project, trigger.dataset.photo, trigger);
    }));
    document.querySelectorAll('[data-choose-reference]').forEach(button => button.addEventListener('click', () => {
      openAlbum(selectedReference?.project.id || projects[0].id, selectedReference?.index, button);
    }));
    document.querySelector('#use-photo').addEventListener('click', () => {
      if (quoteForm) {
        setReference(activeProject.id, activeIndex);
        closeAlbum();
        hideReview();
      } else {
        location.href = `/contact/?reference=${encodeURIComponent(activeProject.id)}&photo=${activeIndex}`;
      }
    });
  }

  const setReference = (id, index) => {
    const project = byId(id);
    if (!quoteForm || !project) return;
    const validIndex = safeIndex(project, index);
    selectedReference = { project, index: validIndex };
    const photo = project.photos[validIndex];
    document.querySelector('.reference-placeholder').hidden = true;
    document.querySelector('.reference-selected').hidden = false;
    const img = document.querySelector('#reference-image');
    img.src = photo.thumb;
    img.alt = photo.alt;
    document.querySelector('#reference-title').textContent = project.short;
    document.querySelector('#reference-caption').textContent = `${photo.stage} photo ${validIndex + 1} of ${project.photos.length}`;
    document.querySelector('#gallery-reference').value = `${project.title}, photo ${validIndex + 1} (${photo.stage}): ${new URL(photo.src, location.origin).href}`;
    document.querySelector('[data-choose-reference]').firstChild.textContent = 'Change reference photo';
    const url = new URL(location.href);
    url.searchParams.set('reference', id);
    url.searchParams.set('photo', validIndex);
    history.replaceState({}, '', url);
  };
  let currentStep = 0;
  let reviewing = false;
  const steps = [...document.querySelectorAll('[data-step]')];
  const showStep = (step, scroll = true) => {
    currentStep = step;
    reviewing = false;
    document.querySelector('#quote-review').hidden = true;
    steps.forEach((panel, index) => { panel.hidden = index !== step; });
    document.querySelectorAll('[data-progress]').forEach((item, index) => {
      item.classList.toggle('active', index === step);
      if (index === step) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
    });
    if (scroll) {
      steps[step].scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      const title = steps[step].querySelector('h2');
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    }
  };
  const hideReview = () => { if (reviewing) showStep(2, false); };
  const validateStep = step => {
    if (step === 0 && !quoteForm.querySelector('input[name="services"]:checked')) {
      document.querySelector('#services-error').textContent = 'Choose at least one service for your project.';
      quoteForm.querySelector('input[name="services"]').focus();
      return false;
    }
    for (const field of steps[step].querySelectorAll('input,select,textarea')) {
      if (!field.disabled && !field.checkValidity()) { field.reportValidity(); return false; }
    }
    return true;
  };
  if (quoteForm) {
    quoteForm.querySelectorAll('input[type="number"]').forEach(input => { input.min = '1'; input.step = '1'; });
    const synchronizeDetails = () => {
      const selected = [...quoteForm.querySelectorAll('input[name="services"]:checked')].map(input => input.value);
      document.querySelectorAll('[data-details]').forEach(fieldset => {
        fieldset.hidden = !selected.includes(fieldset.dataset.details);
        fieldset.disabled = fieldset.hidden;
      });
      if (selected.length) document.querySelector('#services-error').textContent = '';
      hideReview();
    };
    quoteForm.querySelectorAll('input[name="services"]').forEach(input => input.addEventListener('change', synchronizeDetails));
    const aliases = { 'vinyl-siding': 'siding', 'trim-gutters': 'gutters', 'soffit-fascia': 'trim', 'other-exterior': 'other' };
    const service = aliases[params.get('service')] || params.get('service');
    const selectedService = [...quoteForm.querySelectorAll('input[name="services"]')].find(input => input.value === service);
    if (selectedService) selectedService.checked = true;
    synchronizeDetails();
    setReference(params.get('reference'), params.get('photo'));
    document.querySelector('#remove-reference').addEventListener('click', () => {
      selectedReference = null;
      document.querySelector('.reference-placeholder').hidden = false;
      document.querySelector('.reference-selected').hidden = true;
      document.querySelector('#gallery-reference').value = '';
      document.querySelector('[data-choose-reference]').firstChild.textContent = 'Choose a gallery photo';
      const url = new URL(location.href);
      url.searchParams.delete('reference');
      url.searchParams.delete('photo');
      history.replaceState({}, '', url);
      hideReview();
    });
    quoteForm.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => { if (validateStep(currentStep)) showStep(currentStep + 1); }));
    quoteForm.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => showStep(currentStep - 1)));
    quoteForm.addEventListener('submit', event => {
      event.preventDefault();
      // Enter on an earlier step moves forward, without validating hidden contact fields.
      if (currentStep < 2) { if (validateStep(currentStep)) showStep(currentStep + 1); return; }
      for (let step = 0; step < 3; step++) {
        const invalid = [...steps[step].querySelectorAll('input,select,textarea')].find(input => !input.disabled && !input.checkValidity());
        if (invalid || (step === 0 && !quoteForm.querySelector('input[name="services"]:checked'))) { showStep(step); validateStep(step); return; }
      }
      const data = new FormData(quoteForm);
      const selectedServices = [...quoteForm.querySelectorAll('input[name="services"]:checked')].map(input => input.dataset.label);
      const lines = ['Carlos Vinyl Siding - Project Quote Request', '', `Services: ${selectedServices.join(', ')}`, ''];
      for (const field of quoteForm.querySelectorAll('.field input,.field select,.field textarea')) {
        if (field.disabled || field.closest('fieldset[disabled]') || !field.value.trim()) continue;
        const label = field.closest('.field').querySelector('span').textContent.replace(/\s*\(required\)/g, '').trim();
        lines.push(`${label}: ${field.value.trim()}`);
      }
      const reference = data.get('galleryReference');
      lines.push('', `Gallery reference: ${reference || 'None selected'}`);
      const message = lines.join('\n');
      document.querySelector('#quote-message').value = message;
      const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?';
      document.querySelector('#open-sms').href = `sms:+15089972540${separator}body=${encodeURIComponent(message)}`;
      steps.forEach(step => { step.hidden = true; });
      const review = document.querySelector('#quote-review');
      review.hidden = false;
      reviewing = true;
      review.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      review.focus({ preventScroll: true });
      document.querySelector('#copy-status').textContent = '';
    });
    document.querySelector('#edit-request').addEventListener('click', () => showStep(2));
    document.querySelector('#copy-request').addEventListener('click', async () => {
      const message = document.querySelector('#quote-message');
      const status = document.querySelector('#copy-status');
      try { await navigator.clipboard.writeText(message.value); status.textContent = 'Your project details are copied.'; }
      catch { message.focus(); message.select(); status.textContent = 'Select and copy the highlighted project details.'; }
    });
  }
  if (params.get('project') && byId(params.get('project'))) openAlbum(params.get('project'), params.get('photo'));
})();
