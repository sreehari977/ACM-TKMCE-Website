const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

const scrollProgress = document.querySelector('.scroll-progress');
function updateScrollProgress() {
  if (!scrollProgress) return;
  const distance = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  scrollProgress.style.setProperty('--scroll-progress', `${(window.scrollY / distance) * 100}%`);
}
updateScrollProgress();
window.addEventListener('scroll', updateScrollProgress, { passive: true });

const sectionLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const navSections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    sectionLinks.forEach((link) => link.setAttribute('aria-current', String(link.getAttribute('href') === `#${current.target.id}`)));
  }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, .12, .4] });
  navSections.forEach((section) => navObserver.observe(section));
}

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

const filterButtons = document.querySelectorAll('[data-filter]');
const eventCards = [...document.querySelectorAll('.roadmap-card')];
const mapCheckpoints = [...document.querySelectorAll('[data-map-event]')];
const empty = document.querySelector('.filter-empty');
const visibleCount = document.querySelector('[data-visible-count]');

function applyEventFilter(filter) {
  let visible = 0;
  eventCards.forEach((card) => {
    const show = filter === 'all' || card.dataset.state === filter || card.dataset.category === filter;
    if (show) {
      const wasHidden = card.hidden;
      card.hidden = false;
      card.classList.remove('is-filtering-out');
      if (!reducedMotion && wasHidden) {
        card.classList.remove('is-filtering-in');
        requestAnimationFrame(() => card.classList.add('is-filtering-in'));
      }
      visible += 1;
    } else if (reducedMotion) {
      card.hidden = true;
    } else {
      card.classList.add('is-filtering-out');
      window.setTimeout(() => { if (card.classList.contains('is-filtering-out')) card.hidden = true; }, 320);
    }
  });
  mapCheckpoints.forEach((checkpoint) => {
    const source = document.querySelector(`#${checkpoint.dataset.mapEvent}`);
    if (!source) return;
    const show = filter === 'all' || source.dataset.state === filter || source.dataset.category === filter;
    checkpoint.hidden = !show;
  });
  empty.hidden = visible !== 0;
  visibleCount.textContent = String(visible);
}

filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  applyEventFilter(button.dataset.filter);
}));

const viewButtons = document.querySelectorAll('[data-view]');
const roadmapViews = document.querySelectorAll('[data-roadmap-view]');
viewButtons.forEach((button) => button.addEventListener('click', () => {
  viewButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  roadmapViews.forEach((panel) => { panel.hidden = panel.dataset.roadmapView !== button.dataset.view; });
}));

const eventModal = document.querySelector('.event-modal');
const eventFields = {
  label: document.querySelector('#event-modal-label'),
  title: document.querySelector('#event-modal-title'),
  date: document.querySelector('#event-modal-date'),
  venue: document.querySelector('#event-modal-venue'),
  speaker: document.querySelector('#event-modal-speaker'),
  registration: document.querySelector('#event-modal-registration'),
  outcomes: document.querySelector('#event-modal-outcomes'),
  link: document.querySelector('#event-modal-link'),
};

function showEvent(card) {
  if (!card) return;
  eventFields.label.textContent = card.dataset.label;
  eventFields.title.textContent = card.dataset.title;
  eventFields.date.textContent = card.dataset.date;
  eventFields.venue.textContent = card.dataset.venue;
  eventFields.speaker.textContent = card.dataset.speaker;
  eventFields.registration.textContent = card.dataset.registration;
  eventFields.outcomes.textContent = card.dataset.outcomes;
  eventFields.link.href = card.dataset.state === 'completed' ? '#gallery' : '#contact';
  eventFields.link.firstChild.textContent = card.dataset.state === 'completed' ? 'Open the archive ' : 'Connect with ACM ';
  eventModal.showModal();
}

document.querySelectorAll('.event-open').forEach((button) => button.addEventListener('click', () => showEvent(button.closest('.roadmap-card'))));
document.querySelectorAll('[data-calendar-event]').forEach((button) => button.addEventListener('click', () => showEvent(document.querySelector(`#${button.dataset.calendarEvent}`))));
mapCheckpoints.forEach((checkpoint) => checkpoint.addEventListener('click', () => showEvent(document.querySelector(`#${checkpoint.dataset.mapEvent}`))));
document.querySelector('.event-modal-close')?.addEventListener('click', () => eventModal.close());
eventModal?.addEventListener('click', (event) => { if (event.target === eventModal) eventModal.close(); });

const galleryModal = document.querySelector('.gallery-modal');
const modalTitle = document.querySelector('#modal-title');
const modalDetail = document.querySelector('#modal-detail');
document.querySelectorAll('.gallery-card').forEach((card) => card.addEventListener('click', () => {
  modalTitle.textContent = card.dataset.title;
  modalDetail.textContent = card.dataset.detail;
  galleryModal.showModal();
}));
document.querySelector('.modal-close')?.addEventListener('click', () => galleryModal.close());
galleryModal?.addEventListener('click', (event) => { if (event.target === galleryModal) galleryModal.close(); });

const galleryFilters = document.querySelectorAll('[data-gallery-filter]');
const galleryCards = document.querySelectorAll('[data-gallery-category]');
galleryFilters.forEach((button) => button.addEventListener('click', () => {
  galleryFilters.forEach((item) => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  galleryCards.forEach((card) => { card.hidden = button.dataset.galleryFilter !== 'all' && card.dataset.galleryCategory !== button.dataset.galleryFilter; });
}));

const teamData = {
  program: ['Program Team', 'Fitha Asma Sulfeekhar · Muhammed Midhlaj K · Nivin M K · Alakananda D'],
  operations: ['Operations Team', 'Amna Hudha C P · Vaishnav V Bishoy · Veda P V · Hridhya B S'],
  design: ['Design Team', 'Parthiv P · Aparna P · Arathy Vinod'],
  documentation: ['Documentation Team', 'Ananya Suresh · Ashish Joy · Muhammed Hisham A H'],
  tech: ['Tech & Web Team', 'Michael Harold Sony · Adithya Kiran · Sruthi Mariam Shaji · Sreehari R'],
  publicity: ['Publicity & Sponsorship Team', 'Affan Muhammed · Arshin T · Sandesh K V · Gouri Parvathy S'],
  network: ['Network Team', 'Niveditha B · Sreenanda V H · Goutham Krishna B'],
  social: ['Social Media Team', 'Janaki R · Asmin Shahal · Mohammed Nihal'],
};
const teamTitle = document.querySelector('[data-team-title]');
const teamMembers = document.querySelector('[data-team-members]');
const teamSpotlight = document.querySelector('.team-spotlight');
const teamModal = document.querySelector('.team-modal');
const teamModalTitle = document.querySelector('#team-modal-title');
const teamModalDescription = document.querySelector('#team-modal-description');
const teamModalLead = document.querySelector('#team-modal-lead');
const teamModalMembers = document.querySelector('#team-modal-members');
// Lead assignments were not included in the supplied roster. Keep the field ready without inventing one.
const teamLeads = {};

function openTeamModal(teamKey, title, members) {
  if (!teamModal || !teamModalMembers) return;
  teamModalTitle.textContent = title;
  teamModalDescription.textContent = 'Select a member tile to keep the roster in focus.';
  teamModalLead.textContent = teamLeads[teamKey] || 'Awaiting official confirmation';
  teamModalMembers.replaceChildren(...members.split(' · ').map((name, index) => {
    const tile = document.createElement('button');
    tile.className = 'team-member-tile';
    tile.type = 'button';
    tile.setAttribute('aria-label', `${name}, ${title} member`);
    tile.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><strong>${name}</strong><small>TEAM MEMBER</small>`;
    tile.addEventListener('click', () => {
      teamModalMembers.querySelectorAll('.team-member-tile').forEach((item) => item.classList.toggle('active', item === tile));
    });
    return tile;
  }));
  if (!teamModal.open) teamModal.showModal();
}

document.querySelectorAll('[data-team]').forEach((button) => button.addEventListener('click', () => {
  const [title, members] = teamData[button.dataset.team];
  document.querySelectorAll('[data-team]').forEach((item) => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
  });
  if (!reducedMotion && teamSpotlight) {
    teamSpotlight.classList.remove('is-swapping');
    void teamSpotlight.offsetWidth;
    teamSpotlight.classList.add('is-swapping');
  }
  teamTitle.textContent = title;
  teamMembers.textContent = members;
  openTeamModal(button.dataset.team, title, members);
}));

document.querySelector('.team-modal-close')?.addEventListener('click', () => teamModal?.close());
teamModal?.addEventListener('click', (event) => { if (event.target === teamModal) teamModal.close(); });

const liveEvent = document.querySelector('[data-live-event]');
const liveCountdown = document.querySelector('[data-live-countdown]');
const liveState = document.querySelector('[data-live-state]');
const clockFields = {
  days: document.querySelector('[data-clock-days]'),
  hours: document.querySelector('[data-clock-hours]'),
  minutes: document.querySelector('[data-clock-minutes]'),
  seconds: document.querySelector('[data-clock-seconds]'),
};

function paintClock(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const values = {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
  Object.entries(values).forEach(([unit, value]) => {
    if (clockFields[unit]) clockFields[unit].textContent = String(value).padStart(2, '0');
  });
  if (!reducedMotion && clockFields.seconds) {
    clockFields.seconds.classList.remove('tick');
    void clockFields.seconds.offsetWidth;
    clockFields.seconds.classList.add('tick');
  }
  return values;
}

function getNextCpCircle() {
  // TKMCE runs on IST all year (UTC+05:30); use it even if a visitor is elsewhere.
  const istOffset = 330 * 60 * 1000;
  const now = Date.now();
  const ist = new Date(now + istOffset);
  const friday = 5;
  let daysUntil = (friday - ist.getUTCDay() + 7) % 7;
  const todayAtFive = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 17) - istOffset;
  if (daysUntil === 0 && now >= todayAtFive) daysUntil = 7;
  return Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + daysUntil, 17) - istOffset;
}

function formatIst(timestamp) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(timestamp).replace(',', ' ·');
}

function updateLiveEvent() {
  if (liveEvent?.dataset.eventSchedule === 'weekly-cp') {
    const now = Date.now();
    const next = getNextCpCircle();
    const remaining = next - now;
    const date = document.querySelector('[data-live-date]');
    if (date) date.textContent = `${formatIst(next)} IST`;
    liveState.textContent = 'UP NEXT';
    liveEvent.dataset.eventState = 'upcoming';
    const values = paintClock(remaining);
    liveCountdown.textContent = `${values.days}d ${String(values.hours).padStart(2, '0')}h ${String(values.minutes).padStart(2, '0')}m until CP Circle`;
    return;
  }
  const dateValue = liveEvent?.dataset.eventDate;
  if (!dateValue) return;
  const target = new Date(dateValue);
  const endValue = liveEvent?.dataset.eventEnd;
  const end = endValue ? new Date(endValue) : null;
  const remaining = target.getTime() - Date.now();
  if (Number.isNaN(target.getTime())) return;
  if (remaining <= 0 && (!end || Number.isNaN(end.getTime()) || Date.now() < end.getTime())) {
    liveState.textContent = 'HAPPENING NOW';
    liveCountdown.textContent = 'The chapter is live';
    liveEvent.dataset.eventState = 'ongoing';
    paintClock(0);
    return;
  }
  if (remaining <= 0) {
    liveState.textContent = 'COMPLETED';
    liveCountdown.textContent = 'This event is now a chapter memory';
    liveEvent.dataset.eventState = 'completed';
    paintClock(0);
    return;
  }
  const values = paintClock(remaining);
  liveCountdown.textContent = `${values.days}d ${String(values.hours).padStart(2, '0')}h ${String(values.minutes).padStart(2, '0')}m until the event`;
}
updateLiveEvent();
window.setInterval(updateLiveEvent, 1000);

// Short chapter principles give long sections a human pause without adding new content blocks.
const sectionSignals = [
  ['#about .about-intro', '“No spectators, only builders.”'],
  ['#goals .goals-copy', '“Curiosity over credentials. Collaboration over competition.”'],
  ['#roadmap .roadmap-head > div:first-child', '“Everything happening at ACM.”'],
  ['#gallery .gallery-head', '“Where the chapter lives.”'],
  ['#execom .execom-head', '“A chapter is a network.”'],
  ['#projects .projects-head', '“A portfolio, not just a certificate.”'],
  ['#contact .contact-copy', '“The next good idea starts here.”'],
];
sectionSignals.forEach(([selector, quote]) => {
  const target = document.querySelector(selector);
  if (!target || target.querySelector('.section-signal')) return;
  const signal = document.createElement('p');
  signal.className = 'section-signal';
  signal.textContent = quote;
  target.append(signal);
});

const mapMonths = document.querySelector('[data-map-months]');
if (mapMonths) {
  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short' });
  const now = new Date();
  for (let offset = 0; offset < 6; offset += 1) {
    const month = document.createElement('span');
    month.textContent = formatter.format(new Date(now.getFullYear(), now.getMonth() + offset, 1)).toUpperCase();
    mapMonths.append(month);
  }
}

// Small pointer depth makes the hero feel responsive without turning scrolling into a chore.
const heroStage = document.querySelector('.hero-stage');
if (!reducedMotion && heroStage && window.matchMedia('(pointer: fine)').matches) {
  heroStage.addEventListener('pointermove', (event) => {
    const bounds = heroStage.getBoundingClientRect();
    heroStage.style.setProperty('--hero-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 24}px`);
    heroStage.style.setProperty('--hero-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 24}px`);
  }, { passive: true });
  heroStage.addEventListener('pointerleave', () => {
    heroStage.style.setProperty('--hero-x', '0px');
    heroStage.style.setProperty('--hero-y', '0px');
  }, { passive: true });
}

function initialiseMotion() {
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('motion-ready');
  const targets = [...document.querySelectorAll('.motion-reveal, .impact-grid article, .roadmap-card, .chapter-numbers div, .gallery-card, .member-node')];
  targets.forEach((target, index) => {
    target.classList.add('motion-reveal');
    target.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 45}ms`);
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((target) => observer.observe(target));

  document.querySelectorAll('.chapter-numbers strong').forEach((counter) => {
    const value = Number(counter.textContent);
    if (!Number.isFinite(value) || value > 100) return;
    const counterObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      const started = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - started) / 650, 1);
        counter.textContent = String(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.disconnect();
    }, { threshold: 0.7 });
    counterObserver.observe(counter);
  });

  const heroFilm = document.querySelector('.hero-film');
  let queued = false;
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      if (heroFilm) heroFilm.style.transform = `translateY(${Math.min(window.scrollY * .08, 34)}px) scale(1.04)`;
      queued = false;
    });
  }, { passive: true });
}
initialiseMotion();
