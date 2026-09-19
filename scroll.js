
// ─── Shared helpers ───────────────────────────────────────────────────────────
// Current translation table, with the fr fallback every caller in this file wants
const t = () => translations[currentLang] || translations.fr;

// One scroll listener for the whole page, coalesced into a single rAF: each job
// runs at most once per frame, so a fast scroll can't queue up a layout read per
// event. Jobs also run once at registration, so a page loaded already scrolled
// (reload, #hash deep link) starts in the right state.
const scrollJobs = [];
let scrollTicking = false;

function onScroll(job) {
  scrollJobs.push(job);
  job(window.scrollY);
}

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    scrollTicking = false;
    const y = window.scrollY;
    scrollJobs.forEach(job => job(y));
  });
}, { passive: true });

// ─── Scroll progress bar ──────────────────────────────────────────────────────
const scrollProgressBar = document.getElementById('scrollProgress');
if (scrollProgressBar) {
  onScroll(y => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgressBar.style.width = total > 0 ? (y / total * 100) + '%' : '0%';
  });
}

// ─── Custom SVG icons (for skills without a simple-icons slug) ────────────────
const customIcons = {
  sql:   'M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2zm0 16c-3.87 0-6-1.5-6-2v-2.23C7.61 17.63 9.72 18 12 18s4.39-.37 6-1.23V19c0 .5-2.13 2-6 2zm0-4c-3.87 0-6-1.5-6-2v-2.23C7.61 13.63 9.72 14 12 14s4.39-.37 6-1.23V15c0 .5-2.13 2-6 2zm0-4c-3.87 0-6-1.5-6-2V9.77C7.61 10.63 9.72 11 12 11s4.39-.37 6-1.23V11c0 .5-2.13 2-6 2z',
  agile: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z',
  // "sparkles" glyph (Material auto_awesome) for the GenAI skill
  genai: 'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z',
};

function makeCustomSvg(pathData) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '22');
  svg.setAttribute('height', '22');
  svg.innerHTML = `<path d="${pathData}"/>`;
  return svg;
}

// Skills of a category, ordered by level then tenure — shared by the cards UI
// and the terminal `skills` command so both always show the same ordering.
function skillsByCategory(cat) {
  return skillsData
    .filter(s => s.category === cat)
    .sort((a, b) => b.level - a.level || (skillMonths[b.id] || 0) - (skillMonths[a.id] || 0));
}

function renderSkills() {
  const container = document.querySelector('.skills-cards');
  if (!container) return;
  container.innerHTML = '';
  const lang = document.documentElement.lang || 'fr';
  const t = translations[lang] || translations.fr;

  categoryDefs.forEach(cat => {
    const items = skillsByCategory(cat);
    if (!items.length) return;

    const card = document.createElement('div');
    card.className = 'skill-card';

    const label = document.createElement('span');
    label.className = 'skill-card__label';
    label.dataset.i18n = `skills.${cat}`;
    label.textContent = t[`skills.${cat}`] || cat;
    card.appendChild(label);

    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'skill-card__items';

    items.forEach(s => {
      // <button> so the skill → experience filter is keyboard accessible
      const div = document.createElement('button');
      div.type = 'button';
      div.className = 'stack-item';
      div.dataset.level = s.level;
      div.dataset.skill = s.id;
      div.setAttribute('aria-pressed', 'false');

      if (s.icon) {
        const img = document.createElement('img');
        img.src = `assets/icons/${s.icon}.svg`;
        img.alt = '';
        img.loading = 'lazy';
        img.addEventListener('error', () => { img.style.display = 'none'; });
        div.appendChild(img);
      } else if (customIcons[s.id]) {
        div.appendChild(makeCustomSvg(customIcons[s.id]));
      }

      const nameSpan = document.createElement('span');
      nameSpan.textContent = s.name;
      div.appendChild(nameSpan);

      itemsDiv.appendChild(div);
    });

    card.appendChild(itemsDiv);
    container.appendChild(card);
  });
}

// ─── Role → Skills mapping ────────────────────────────────────────────────────
const roleSkills = {
  laps: {
    start: CURRENT_JOB_START,
    end: null,                  // ongoing
    skills: [
      { id: 'genai',          key: true  },
      { id: 'python',         key: true  },
      { id: 'aws',            key: true  },
      { id: 'grafana',        key: true  },
      { id: 'mysql',          key: true  },
      { id: 'sql',            key: false },
      { id: 'snowflake',      key: false },
      { id: 'docker',         key: false },
      { id: 'bitbucket',      key: false },
      { id: 'agile',          key: false },
      { id: 'databricks',     key: false },
      { id: 'jira',           key: false },
      { id: 'pulumi',         key: false },
      { id: 'git',            key: false },
      { id: 'stepfunctions',  key: false },
      { id: 'airflow',        key: false },
    ]
  },
  bialr1: {
    start: new Date(2023, 0),   // Jan 2023
    end:   new Date(2023, 11),  // Dec 2023
    skills: [
      { id: 'pentaho',    key: true  },
      { id: 'aws',        key: true  },
      { id: 'postgresql', key: true  },
      { id: 'prefect',    key: true  },
      { id: 'sql',        key: false },
      { id: 'agile',      key: false },
      { id: 'jira',       key: false },
      { id: 'git',        key: false },
    ]
  },
  bialr2: {
    start: new Date(2021, 8),   // Sep 2021
    end:   new Date(2022, 11),  // Dec 2022
    skills: [
      { id: 'pentaho', key: true  },
      { id: 'oracle',  key: true  },
      { id: 'git',     key: true  },
      { id: 'sql',     key: false },
    ]
  },
  bialr3: {
    start: new Date(2020, 8),   // Sep 2020
    end:   new Date(2021, 7),   // Aug 2021
    skills: [
      { id: 'pentaho', key: true  },
      { id: 'oracle',  key: true  },
      { id: 'mssql',   key: true  },
      { id: 'sapbo',   key: true  },
      { id: 'sql',     key: false },
      { id: 'tableau', key: false },
      { id: 'powerbi', key: false },
      { id: 'git',     key: false },
    ]
  }
};

// Total hands-on months per skill, summed over the roles that used it. Built in
// one pass here and reused by both the card ordering and the hover label, so the
// two can't disagree.
const skillMonths = {};
Object.values(roleSkills).forEach(role => {
  const end = role.end || new Date();
  const months = Math.max(1,
    (end.getFullYear() - role.start.getFullYear()) * 12 +
    end.getMonth() - role.start.getMonth()
  );
  role.skills.forEach(s => {
    skillMonths[s.id] = (skillMonths[s.id] || 0) + months;
  });
});

const skillNames = Object.fromEntries(skillsData.map(s => [s.id, s.name]));

function formatSkillDuration(months, lang) {
  const halfYears = Math.ceil(months / 6);
  const y = Math.floor(halfYears / 2);
  const half = halfYears % 2 === 1;

  if (lang === 'fr') {
    if (halfYears <= 1) return '6 mois';
    const base = `${y} an${y > 1 ? 's' : ''}`;
    return half ? `${y},5 an${y > 1 ? 's' : ''}` : base;
  } else {
    if (halfYears <= 1) return '6 mo';
    const n = y + (half ? 0.5 : 0);
    return `${half ? `${y}.5` : y} yr${n > 1 ? 's' : ''}`;
  }
}

function updateSkillDurations(lang) {
  document.querySelectorAll('.stack-item[data-skill]').forEach(el => {
    el.dataset.years = formatSkillDuration(skillMonths[el.dataset.skill] || 0, lang);
  });
}

function generateExperienceTags() {
  document.querySelectorAll('.timeline-subitem[data-role]').forEach(el => {
    const role = roleSkills[el.dataset.role];
    if (!role) return;
    const container = el.querySelector('.tags');
    if (!container) return;
    container.innerHTML = '';
    role.skills
      .filter(s => s.key)
      .forEach(s => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.dataset.skill = s.id;
        span.textContent = skillNames[s.id] || s.id;
        container.appendChild(span);
      });
  });
}

// ─── Expand / collapse toggles ────────────────────────────────────────────────
// Shared by the About "read more", the per-experience task lists, the project
// descriptions and "show more projects". The button's [data-i18n] span is
// re-keyed on every state change, so applyLang() re-translates the label from
// the attribute alone and needs no per-toggle special-casing.
//   toggleClass — class carrying the expanded state on `target` (default 'expanded')
//   delayLabel  — ms to wait before restoring the collapsed label, so the text
//                 doesn't swap while the block is still visibly closing
function setupToggle(btn, target, expandedKey, collapsedKey, opts = {}) {
  const span = btn.querySelector('[data-i18n]');
  const { toggleClass = 'expanded', delayLabel = 0 } = opts;
  let labelTimer = null;

  const isExpanded = () => target.classList.contains(toggleClass);

  function set(expanded) {
    target.classList.toggle(toggleClass, expanded);
    btn.classList.toggle('expanded', expanded);
    btn.setAttribute('aria-expanded', String(expanded));

    // Drop any label swap still pending from an earlier click — otherwise a
    // quick collapse→expand lets the stale timer relabel an open block.
    clearTimeout(labelTimer);
    const key = expanded ? expandedKey : collapsedKey;
    const apply = () => {
      span.dataset.i18n = key;
      span.textContent = t()[key];
    };
    if (!expanded && delayLabel) labelTimer = setTimeout(apply, delayLabel);
    else apply();
  }

  btn.addEventListener('click', () => set(!isExpanded()));
  return { set, isExpanded };
}

// ─── About read more ──────────────────────────────────────────────────────────
const aboutBody   = document.getElementById('aboutBody');
const aboutToggle = document.getElementById('aboutToggle');
if (aboutBody && aboutToggle) {
  setupToggle(aboutToggle, aboutBody, 'about.readless', 'about.readmore', { delayLabel: 400 });
}

// ─── Experience tasks toggles ─────────────────────────────────────────────────
document.querySelectorAll('.tasks-toggle').forEach(btn => {
  const list = document.getElementById(btn.getAttribute('aria-controls'));
  if (list) setupToggle(btn, list, 'exp.tasks.hide', 'exp.tasks.show');
});

// ─── Stat counters ────────────────────────────────────────────────────────────
// prefersReducedMotion comes from i18n.js (loaded first) — one query, both files
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';

  if (prefersReducedMotion) {
    el.textContent = target + suffix;
    return;
  }

  const duration = 1300;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-count]').forEach(animateCounter);
      counterObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.3 }
);

const statsBlock = document.querySelector('.about-stats');
if (statsBlock) counterObserver.observe(statsBlock);

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.08 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── Sticky Nav show/hide (desktop only) ─────────────────────────────────────
const nav = document.getElementById('siteNav');
if (nav) {
  const mq = window.matchMedia('(min-width: 901px)');
  let navVisible = false;

  function setNav(show) {
    if (show === navVisible) return;
    navVisible = show;
    nav.classList.toggle('visible', show);
  }

  onScroll(y => { if (mq.matches) setNav(y > 80); });

  // On resize to mobile, remove visible class
  mq.addEventListener('change', e => { if (!e.matches) setNav(false); });
}

// ─── Active nav link ──────────────────────────────────────────────────────────
const sections = document.querySelectorAll('main section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

let clickedLink = null;

function setActive(link) {
  navLinks.forEach(a => a.classList.toggle('active', a === link));
  scrollNavToActive(link);
}

function scrollNavToActive(link) {
  const container = link.closest('.nav-links');
  if (!container) return;
  const linkCenter = link.offsetLeft + link.offsetWidth / 2;
  const target = linkCenter - container.offsetWidth / 2;
  container.scrollTo({ left: target, behavior: 'smooth' });
}

navLinks.forEach(a => {
  a.addEventListener('click', () => {
    clickedLink = a;
    setActive(a);
    // Release click lock once scroll settles
    setTimeout(() => { clickedLink = null; }, 1000);
  });
});

const activeObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting && !clickedLink) {
      navLinks.forEach(a => {
        const isActive = a.getAttribute('href') === '#' + e.target.id;
        a.classList.toggle('active', isActive);
        if (isActive) scrollNavToActive(a);
      });
    }
  }),
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(s => activeObserver.observe(s));

// Active theme: explicit data-theme override, else the OS preference.
// Shared by the theme toggle and the terminal `theme` command.
function isDarkTheme() {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ─── Theme toggle ─────────────────────────────────────────────────────────────
(function () {
  const html = document.documentElement;
  const btn  = document.getElementById('themeToggle');

  if (btn) {
    btn.addEventListener('click', () => {
      const dark = !isDarkTheme();
      html.dataset.theme = dark ? 'dark' : 'light';
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch(e) {}
    });
  }
})();

// ─── Footer year ──────────────────────────────────────────────────────────────
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Skill durations & experience tags ───────────────────────────────────────
const initLang = document.documentElement.lang || 'fr';
renderSkills();
updateSkillDurations(initLang);
generateExperienceTags();

// ─── Skill → experience cross-filter ─────────────────────────────────────────
// Click a skill chip to highlight the experiences where it was used
// (data comes from roleSkills). Click again / × pill / Escape to clear.
(() => {
  const expSection = document.getElementById('experience');
  const skillsContainer = document.querySelector('.skills-cards');
  if (!expSection || !skillsContainer) return;

  let activeSkill = null;
  let pill = null;

  const rolesUsing = skillId => new Set(
    Object.keys(roleSkills).filter(r => roleSkills[r].skills.some(s => s.id === skillId))
  );

  function clearFilter() {
    activeSkill = null;
    skillsContainer.querySelectorAll('.stack-item.is-selected').forEach(el => {
      el.classList.remove('is-selected');
      el.setAttribute('aria-pressed', 'false');
    });
    expSection.querySelectorAll('.skill-dim').forEach(el => el.classList.remove('skill-dim'));
    expSection.querySelectorAll('.skill-match-tag').forEach(el => el.classList.remove('skill-match-tag'));
    if (pill) { pill.remove(); pill = null; }
  }

  function applyFilter(skillId, chip) {
    clearFilter();
    activeSkill = skillId;
    chip.classList.add('is-selected');
    chip.setAttribute('aria-pressed', 'true');

    const matches = rolesUsing(skillId);
    expSection.querySelectorAll('.timeline-subitem').forEach(item => {
      const ok = item.dataset.role && matches.has(item.dataset.role);
      item.classList.toggle('skill-dim', !ok);
      if (ok) item.querySelectorAll(`.tag[data-skill="${skillId}"]`)
        .forEach(t => t.classList.add('skill-match-tag'));
    });
    expSection.querySelectorAll('.timeline-group').forEach(group => {
      const header = group.querySelector('.timeline-group__header');
      const any = [...group.querySelectorAll('.timeline-subitem')]
        .some(i => i.dataset.role && matches.has(i.dataset.role));
      if (header) header.classList.toggle('skill-dim', !any);
    });

    pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'skill-filter-pill';
    const label = document.createElement('span');
    label.dataset.i18n = 'skills.filter';
    label.textContent = t()['skills.filter'];
    const name = document.createElement('strong');
    name.textContent = skillNames[skillId] || skillId;
    const cross = document.createElement('span');
    cross.setAttribute('aria-hidden', 'true');
    cross.textContent = '×';
    pill.append(label, ' ', name, ' ', cross);
    pill.addEventListener('click', clearFilter);
    expSection.querySelector('.section-title').insertAdjacentElement('afterend', pill);

    expSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  skillsContainer.addEventListener('click', e => {
    const chip = e.target.closest('.stack-item');
    if (!chip || !chip.dataset.skill) return;
    if (activeSkill === chip.dataset.skill) clearFilter();
    else applyFilter(chip.dataset.skill, chip);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeSkill) clearFilter();
  });
})();

// ─── Project read more ────────────────────────────────────────────────────────
document.querySelectorAll('.project-readmore').forEach(btn => {
  const body = document.getElementById(btn.dataset.desc);
  if (body) setupToggle(btn, body, 'projects.readless', 'projects.readmore', { delayLabel: 400 });
});

// ─── Projects: show more / less (reveal the collapsed academic cards) ─────────
(() => {
  const toggle  = document.getElementById('projectsToggle');
  const section = document.getElementById('projects');
  if (!toggle || !section) return;

  const projects = setupToggle(
    toggle, section, 'projects.showless', 'projects.showmore', { toggleClass: 'show-all' }
  );

  // Deep links (e.g. #project-swarm): when the hash targets a card inside the
  // collapsed block, expand it first, then scroll once the height animation
  // is done (the card's final position isn't known before that).
  function revealHashTarget() {
    const id = location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target || !target.closest('#projectsExtra')) return;
    const wasExpanded = projects.isExpanded();
    projects.set(true);
    setTimeout(() => {
      target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }, wasExpanded || prefersReducedMotion ? 0 : 480);
  }
  window.addEventListener('hashchange', revealHashTarget);
  revealHashTarget();
})();

// ─── Status dot: tap-to-toggle on touch devices ───────────────────────────────
(() => {
  const statusDot = document.querySelector('.avatar-status');
  if (!statusDot) return;
  const tooltip = statusDot.querySelector('.avatar-status__tooltip');

  statusDot.addEventListener('click', e => {
    e.stopPropagation();
    tooltip.classList.toggle('is-open');
  });

  document.addEventListener('click', () => {
    tooltip.classList.remove('is-open');
  });
})();

// ─── Contact form — Formspree AJAX ───────────────────────────────────────────
(() => {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');
  const submit = document.getElementById('contactSubmit');
  if (!form) return;

  let dismissTimer = null;

  function setStatus(msg, type) {
    clearTimeout(dismissTimer);
    status.className = `contact-form__status ${type}`;
    status.textContent = msg;
    dismissTimer = setTimeout(() => {
      status.classList.add('is-fading');
      setTimeout(() => {
        status.className = 'contact-form__status';
        status.textContent = '';
      }, 600);
    }, 10000);
  }

  function validateForm() {
    let valid = true;
    form.querySelectorAll('[required]').forEach(el => {
      const empty = !el.value.trim();
      const badEmail = el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
      if (empty || badEmail) {
        el.classList.add('is-invalid');
        valid = false;
      } else {
        el.classList.remove('is-invalid');
      }
    });
    return valid;
  }

  // Clear invalid state on input
  form.querySelectorAll('[required]').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('is-invalid'));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    submit.disabled = true;
    submit.classList.add('is-loading');
    status.className = 'contact-form__status';
    status.textContent = '';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        setStatus(t()['contact.success'], 'is-success');
        form.reset();
      } else {
        throw new Error('server');
      }
    } catch {
      setStatus(t()['contact.error'], 'is-error');
    } finally {
      submit.disabled = false;
      submit.classList.remove('is-loading');
    }
  });
})();

// ─── Terminal easter egg + keyboard shortcuts ─────────────────────────────────
// ` (or the >_ footer button) opens a fake zsh; t / l / 1-6 are page shortcuts.
(() => {
  const overlay  = document.getElementById('terminalOverlay');
  const term     = document.getElementById('terminal');
  const bar      = document.getElementById('terminalBar');
  const triggers = document.querySelectorAll('[data-terminal-open]');
  const dotClose = document.getElementById('termDotClose');
  const dotMin   = document.getElementById('termDotMin');
  const dotMax   = document.getElementById('termDotMax');
  const body     = document.getElementById('terminalBody');
  const output   = document.getElementById('terminalOutput');
  const input    = document.getElementById('terminalInput');
  if (!overlay || !input) return;

  triggers.forEach(b => { b.hidden = false; }); // need JS, so revealed here

  const SECTIONS = ['about', 'experience', 'skills', 'education', 'projects', 'misc', 'contact'];
  // Number-key targets = the same sections minus 'misc' (no nav entry of its own)
  const SHORTCUT_SECTIONS = SECTIONS.filter(id => id !== 'misc');

  // Terminal copy — kept local: easter-egg text, not page content.
  // Everything that IS page content (roles, dates, projects, skills) is pulled
  // from the i18n `translations` at call time, so it follows the language too.
  const termText = {
    fr: {
      welcome: "Tapez « help » pour la liste des commandes.",
      help: [
        'Usage : <commande> [argument]',
        '',
        'Commandes',
        '  whoami              qui suis-je',
        '  about               présentation',
        '  experience          parcours professionnel',
        '  education           formation',
        '  skills              compétences techniques',
        '  projects            projets',
        '  contact             email, téléphone, réseaux',
        '  open <réseau>       ouvrir un profil (github, linkedin…)',
        '  cv [fr|en]          télécharger le CV',
        '  ls                  lister les sections',
        '  cd <section>        aller à une section',
        '  lang [fr|en]        changer la langue',
        '  theme [dark|light]  thème clair / sombre',
        '  clear               effacer l\'écran',
        '  exit                quitter',
      ],
      bio:       'Polyvalent sur toute la chaîne de données : ingestion, transformation, visualisation et IA.',
      lblPhone:  'tél.',
      sections:  'Sections :',
      notFound:  'zsh: commande introuvable :',
      hint:      "tapez « help »",
      cvOpen:    'Ouverture du CV',
      noSection: 'section inconnue :',
      opening:   'Ouverture de',
      noNet:     'réseau inconnu :',
      netHint:   'réseaux : github · linkedin · instagram · threads · x',
      langSet:   'Langue',
      themeSet:  'Thème',
      lastLogin: 'Dernière connexion :',
    },
    en: {
      welcome: "Type 'help' to list the commands.",
      help: [
        'Usage: <command> [argument]',
        '',
        'Commands',
        '  whoami              who am I',
        '  about               short bio',
        '  experience          work history',
        '  education           education',
        '  skills              technical skills',
        '  projects            projects',
        '  contact             email, phone, socials',
        '  open <network>      open a profile (github, linkedin…)',
        '  cv [fr|en]          download the resume',
        '  ls                  list sections',
        '  cd <section>        jump to a section',
        '  lang [fr|en]        switch language',
        '  theme [dark|light]  light / dark theme',
        '  clear               clear the screen',
        '  exit                quit',
      ],
      bio:       'Versatile across the whole data chain: ingestion, transformation, visualization and AI.',
      lblPhone:  'phone',
      sections:  'Sections:',
      notFound:  'zsh: command not found:',
      hint:      "type 'help'",
      cvOpen:    'Opening resume',
      noSection: 'unknown section:',
      opening:   'Opening',
      noNet:     'unknown network:',
      netHint:   'networks: github · linkedin · instagram · threads · x',
      langSet:   'Language',
      themeSet:  'Theme',
      lastLogin: 'Last login:',
    }
  };

  // Page data referenced by i18n keys → stays bilingual automatically
  const EXPERIENCE = [
    { role: 'exp.laps.role',   org: 'Laps',              start: 'exp.laps.start',   end: 'exp.laps.end' },
    { role: 'exp.bialr1.role', org: 'BIAL-R → Bial-S',   start: 'exp.bialr1.start', end: 'exp.bialr1.end' },
    { role: 'exp.bialr2.role', org: 'BIAL-R → Clariane', start: 'exp.bialr2.start', end: 'exp.bialr2.end' },
    { role: 'exp.bialr3.role', org: 'BIAL-R → APRR',     start: 'exp.bialr3.start', end: 'exp.bialr3.end' },
    { role: 'exp.hyatt.role',  org: 'Park Hyatt Paris',  start: 'exp.hyatt.start',  end: 'exp.hyatt.end' },
  ];
  const EDUCATION = [
    { deg: 'edu.miage.degree', dates: 'edu.miage.dates', org: 'UCBL' },
    { deg: 'edu.uqac.degree',  dates: 'edu.uqac.dates',  org: 'UQAC' },
    { deg: 'edu.dut.degree',   dates: 'edu.dut.dates',   org: 'UVSQ' },
  ];
  const PROJECTS = [
    { name: 'projects.mcp.title.main',    sub: 'projects.mcp.title.sub' },
    { name: 'projects.etl.title.main',    sub: 'projects.etl.title.sub' },
    { name: 'projects.copill.title.main', sub: 'projects.copill.title.sub' },
    { name: 'projects.swarm.title.main',  sub: 'projects.swarm.title.sub' },
  ];
  const SOCIALS = {
    github:    'https://github.com/alexisdcolin',
    linkedin:  'https://www.linkedin.com/in/alexisdcolin',
    instagram: 'https://www.instagram.com/alexisdcolin',
    threads:   'https://www.threads.com/@alexisdcolin',
    x:         'https://x.com/alexisdcolin',
  };

  // Terminal-local copy; page content comes from the shared t() above
  const tt = () => termText[currentLang] || termText.fr;

  let printQueue = [];
  let printTimer = null;

  function clearQueue() {
    printQueue.length = 0;
    if (printTimer) { clearTimeout(printTimer); printTimer = null; }
  }

  function drainQueue() {
    if (!printQueue.length) { printTimer = null; return; }
    const { line, cls } = printQueue.shift();
    const div = document.createElement('div');
    div.className = 'terminal__line' + (cls ? ` ${cls}` : '');
    div.textContent = line === '' ? ' ' : line;
    output.appendChild(div);
    body.scrollTop = body.scrollHeight;
    printTimer = setTimeout(drainQueue, 15);
  }

  function print(lines, cls) {
    (Array.isArray(lines) ? lines : [lines]).forEach(line => {
      printQueue.push({ line, cls });
    });
    if (!printTimer) drainQueue();
  }

  // Echo a typed command the way a real shell does: coloured prompt prefix,
  // command itself in the default text colour (not the whole line tinted).
  function printCommand(raw) {
    const div = document.createElement('div');
    div.className = 'terminal__line';
    const ps = document.createElement('span');
    ps.className = 'terminal__ps1';
    ps.innerHTML = '<span class="t-arrow">➜</span> <span class="t-path">~</span>';
    div.append(ps, document.createTextNode(' ' + raw));
    output.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  // Read the previous visit timestamp from localStorage, then stamp the current
  // one for next time. Falls back gracefully when storage is unavailable.
  let prevVisit = null;
  try {
    const raw = localStorage.getItem('lastVisit');
    if (raw) prevVisit = new Date(Number(raw));
    localStorage.setItem('lastVisit', Date.now());
  } catch(e) {}

  function lastLoginLine() {
    const d = prevVisit || new Date();
    const datePart = new Intl.DateTimeFormat(currentLang, { weekday: 'short', day: '2-digit', month: 'short' }).format(d);
    const time = new Intl.DateTimeFormat(currentLang, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d);
    return `${tt().lastLogin} ${datePart} ${time}`;
  }

  function gotoSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  const commands = {
    help() { print(tt().help); },

    whoami() {
      print([
        `Alexis Colin — ${t()['hero.role']}`,
        `📍 ${t()['hero.location']} 🇨🇦`,
        t()['status.open'],
        '',
        tt().bio,
      ]);
    },

    about() {
      print('');
      print(t()['about.p1']);
    },

    experience() {
      EXPERIENCE.forEach(e => {
        print(`  ${t()[e.role]}`);
        print(`    ${e.org} · ${t()[e.start]} – ${t()[e.end]}`, 'terminal__line--muted');
      });
    },

    education() {
      EDUCATION.forEach(e => {
        print(`  ${t()[e.deg]}`);
        print(`    ${e.org} · ${t()[e.dates]}`, 'terminal__line--muted');
      });
    },

    skills() {
      const dots = lvl => '●'.repeat(lvl) + '○'.repeat(3 - lvl);
      categoryDefs.forEach(cat => {
        const items = skillsByCategory(cat);
        if (!items.length) return;
        print(`  ${t()['skills.' + cat]}`);
        items.forEach(s => print(`    ${dots(s.level)}  ${s.name}`, 'terminal__line--muted'));
      });
    },

    projects() {
      PROJECTS.forEach(p => {
        print(`  ${t()[p.name]}`);
        print(`    ${t()[p.sub]}`, 'terminal__line--muted');
      });
    },

    contact() {
      print([
        `email     contact@alexiscolin.com`,
        `${tt().lblPhone.padEnd(9)} +1 (438) 543-6098`,
        `github    github.com/alexisdcolin`,
        `linkedin  linkedin.com/in/alexisdcolin`,
      ]);
    },

    open(args) {
      const key = (args[0] || '').toLowerCase();
      if (SOCIALS[key]) {
        print(`${tt().opening} ${key}…`);
        window.open(SOCIALS[key], '_blank', 'noopener');
      } else {
        print(`open: ${tt().noNet} ${args[0] || ''}`, 'terminal__line--error');
        print(tt().netHint, 'terminal__line--muted');
      }
    },

    cv(args) {
      const lang = args[0] === 'en' || args[0] === 'fr' ? args[0] : currentLang;
      print(`${tt().cvOpen} (${lang})…`);
      window.open(`assets/cv-${lang}.pdf`, '_blank', 'noopener');
    },

    ls() {
      print(tt().sections);
      print('  ' + SECTIONS.join('  '));
    },

    cd(args) {
      const arg = args[0];
      if (!arg || arg === '~' || arg === '/') { window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }); return; }
      const id = arg.replace(/^[#/]/, '');
      if (SECTIONS.includes(id)) gotoSection(id);
      else print(`cd: ${tt().noSection} ${arg}`, 'terminal__line--error');
    },

    lang(args) {
      const next = args[0] === 'fr' || args[0] === 'en' ? args[0] : (currentLang === 'fr' ? 'en' : 'fr');
      if (next !== currentLang) document.getElementById('langToggle').click();
      // Label in the target language: langToggle defers currentLang by ~70ms,
      // so tt() would still resolve to the previous language here.
      print(`${(termText[next] || termText.fr).langSet} → ${next}`);
    },

    theme(args) {
      const want = (args[0] || '').toLowerCase();
      if (want === 'dark' || want === 'light') {
        if ((want === 'dark') !== isDarkTheme()) document.getElementById('themeToggle').click();
      } else {
        document.getElementById('themeToggle').click();
      }
      print(`${tt().themeSet} → ${isDarkTheme() ? 'dark' : 'light'}`);
    },

    clear() { clearQueue(); output.innerHTML = ''; },
    exit() { closeTerminal(); },
  };

  // Short aliases for the two longest command names
  commands.exp = commands.experience;
  commands.edu = commands.education;

  let greeted = false;
  let lastFocus = null;
  const history = [];
  let histIdx = -1;

  let onCloseEnd = null;

  // aria-modal only holds while the window is actually modal. Minimized, the
  // page behind is fully usable, so leaving it set would tell screen readers
  // the rest of the document is inert when it isn't.
  function setModal(on) {
    if (on) term.setAttribute('aria-modal', 'true');
    else term.removeAttribute('aria-modal');
  }

  function openTerminal() {
    // Cancel any in-flight close so reopening mid-animation can't re-hide us
    if (onCloseEnd) { term.removeEventListener('animationend', onCloseEnd); onCloseEnd = null; }
    overlay.classList.remove('terminal-overlay--closing');
    // Only capture the trigger on a real open — not when restoring a minimized
    // window (focus would be <body>, losing the original return target)
    if (overlay.hidden) { lastFocus = document.activeElement; resetPosition(); }
    overlay.hidden = false;
    overlay.classList.remove('terminal-overlay--min');
    setModal(true);
    // Each fresh open (after a close) is a new session: login banner + welcome
    if (!greeted) {
      greeted = true;
      print(lastLoginLine(), 'terminal__line--muted');
      print(tt().welcome, 'terminal__line--muted');
    }
    input.focus();
  }

  function finishClose(focus) {
    overlay.classList.remove('terminal-overlay--closing');
    overlay.classList.remove('terminal-overlay--min');
    term.classList.remove('terminal--max');
    resetPosition();
    setModal(false);
    overlay.hidden = true;
    clearQueue();
    output.innerHTML = '';
    greeted = false;
    if (focus && focus.focus) focus.focus({ preventScroll: true });
  }

  function closeTerminal() {
    if (overlay.hidden) return;
    const focus = lastFocus;
    // No close animation under reduced motion → animationend never fires, so
    // hide immediately rather than waiting for an event that won't come.
    if (prefersReducedMotion) { finishClose(focus); return; }
    overlay.classList.add('terminal-overlay--closing');
    onCloseEnd = function () { onCloseEnd = null; finishClose(focus); };
    term.addEventListener('animationend', onCloseEnd, { once: true });
  }

  function minimizeTerminal() {
    resetPosition();
    overlay.classList.add('terminal-overlay--min');
    setModal(false);
    input.blur();
  }

  function restoreTerminal() {
    resetPosition();
    overlay.classList.remove('terminal-overlay--min');
    setModal(true);
    input.focus();
  }

  const isMinimized = () => overlay.classList.contains('terminal-overlay--min');

  function run(raw) {
    const line = raw.trim();
    printCommand(raw);
    if (!line) return;
    const parts = line.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);
    const cmd = commands[name];
    if (cmd) cmd(args);
    else print(`${tt().notFound} ${name} — ${tt().hint}`, 'terminal__line--error');
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      // preventDefault: 'exit' moves focus to the >_ trigger; without it the
      // browser delivers this same Enter to the trigger → click → reopen
      e.preventDefault();
      const value = input.value;
      input.value = '';
      if (value.trim()) { history.push(value); }
      histIdx = history.length;
      run(value);
    } else if (e.key === 'ArrowUp') {
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
      else { histIdx = history.length; input.value = ''; }
      e.preventDefault();
    }
  });

  // Keep Tab inside the dialog while it's modal — without this, tabbing walks
  // onto the page hidden behind the backdrop with no visible focus (WCAG 2.4.3)
  term.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || isMinimized()) return;
    const stops = [dotClose, dotMin, dotMax, input];
    const i = stops.indexOf(document.activeElement);
    const step = e.shiftKey ? -1 : 1;
    stops[(i + step + stops.length) % stops.length].focus();
    e.preventDefault();
  });

  // Clicking anywhere in the terminal refocuses the input (like a real one)
  term.addEventListener('click', e => {
    if (e.target.closest('.terminal__dot')) return;
    if (isMinimized()) { restoreTerminal(); return; }
    if (!window.getSelection().toString()) input.focus();
  });

  // Click on the dimmed backdrop closes (not when minimized: backdrop is gone)
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeTerminal();
  });

  triggers.forEach(b => b.addEventListener('click', openTerminal));
  dotClose.addEventListener('click', closeTerminal);
  dotMin.addEventListener('click', () => { isMinimized() ? restoreTerminal() : minimizeTerminal(); });
  dotMax.addEventListener('click', () => {
    overlay.classList.remove('terminal-overlay--min');
    term.classList.toggle('terminal--max');
    input.focus();
  });

  // ── Drag to move ──
  let dragOffX = 0, dragOffY = 0, dragging = false;

  function resetPosition() {
    term.style.position = '';
    term.style.left = '';
    term.style.top = '';
  }

  function onDragMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(cx - dragOffX, window.innerWidth  - term.offsetWidth));
    const y = Math.max(0, Math.min(cy - dragOffY, window.innerHeight - term.offsetHeight));
    term.style.left = x + 'px';
    term.style.top  = y + 'px';
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    term.classList.remove('terminal--dragging');
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup',   onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend',  onDragEnd);
  }

  function startDrag(clientX, clientY, isTouchEvent) {
    const rect = term.getBoundingClientRect();
    dragOffX = clientX - rect.left;
    dragOffY = clientY - rect.top;
    // Anchor at current position before detaching from flex centering
    term.style.position = 'fixed';
    term.style.left = rect.left + 'px';
    term.style.top  = rect.top  + 'px';
    dragging = true;
    term.classList.add('terminal--dragging');
    if (isTouchEvent) {
      document.addEventListener('touchmove', onDragMove, { passive: false });
      document.addEventListener('touchend',  onDragEnd);
    } else {
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup',   onDragEnd);
    }
  }

  bar.addEventListener('mousedown', e => {
    if (e.target.closest('.terminal__dot') || isMinimized()) return;
    startDrag(e.clientX, e.clientY, false);
    e.preventDefault();
  });

  bar.addEventListener('touchstart', e => {
    if (e.target.closest('.terminal__dot') || isMinimized()) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY, true);
  }, { passive: true });

  // ── Global keyboard shortcuts ──
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape') { if (!overlay.hidden) closeTerminal(); return; }
    const el = e.target;
    if (el.closest && (el.closest('input, textarea, select, [contenteditable]'))) return;
    // Modal is up (open, not minimized): swallow page shortcuts so a stray
    // 1-6 / t / l can't scroll or toggle the page behind the backdrop.
    if (!overlay.hidden && !isMinimized()) return;

    // e.code 'Backquote' = the physical key left of 1, whatever the layout
    // (on CA-FR / FR keyboards the ` character itself is a dead key);
    // '$' as a fallback — a dedicated key on CA-FR, and shell-themed
    if (e.code === 'Backquote' || e.key === '`' || e.key === '~' || e.key === '$') {
      overlay.hidden || isMinimized() ? openTerminal() : closeTerminal();
    } else if (e.key === 't') {
      document.getElementById('themeToggle').click();
    } else if (e.key === 'l') {
      document.getElementById('langToggle').click();
    } else if (e.key >= '1' && e.key <= String(SHORTCUT_SECTIONS.length)) {
      gotoSection(SHORTCUT_SECTIONS[Number(e.key) - 1]);
    } else {
      return;
    }
    e.preventDefault();
  });
})();
