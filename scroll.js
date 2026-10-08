
// ─── Shared helpers ───────────────────────────────────────────────────────────
// A row that scrolls sideways fades on the side that has more to show
// (.fade-l / .fade-r in style.css): the chronology and the position tabs on phones
function edgeFades(box) {
  const update = () => {
    const max = box.scrollWidth - box.clientWidth;
    box.classList.toggle('fade-l', box.scrollLeft > 2);
    box.classList.toggle('fade-r', max > 2 && box.scrollLeft < max - 2);
  };
  box.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

// A small scroll bar under a sideways scroller: the thumb's width shows how much
// is in view, its place where (--w and --p, read by style.css)
function scrollThumb(box, bar) {
  const update = () => {
    const max = box.scrollWidth - box.clientWidth;
    bar.style.setProperty('--w', `${Math.min(100, box.clientWidth / box.scrollWidth * 100).toFixed(1)}%`);
    bar.style.setProperty('--p', max > 0 ? (box.scrollLeft / max).toFixed(3) : 0);
  };
  box.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

// Brings el to the middle of a sideways scroller — when it scrolls at all
function centerIn(box, el) {
  if (!box || box.scrollWidth <= box.clientWidth) return;
  const d = el.getBoundingClientRect().left - box.getBoundingClientRect().left;
  box.scrollBy({ left: d - (box.clientWidth - el.offsetWidth) / 2, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  box.dispatchEvent(new Event('scroll')); // the fades follow at once, not a frame later
}

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

// ─── Custom SVG icons (for skills without a simple-icons slug) ────────────────
const customIcons = {
  sql:   'M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2zm0 16c-3.87 0-6-1.5-6-2v-2.23C7.61 17.63 9.72 18 12 18s4.39-.37 6-1.23V19c0 .5-2.13 2-6 2zm0-4c-3.87 0-6-1.5-6-2v-2.23C7.61 13.63 9.72 14 12 14s4.39-.37 6-1.23V15c0 .5-2.13 2-6 2zm0-4c-3.87 0-6-1.5-6-2V9.77C7.61 10.63 9.72 11 12 11s4.39-.37 6-1.23V11c0 .5-2.13 2-6 2z',
  agile: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z',
  // "sparkles" glyph (Material auto_awesome) for the LLM skill
  llm: 'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z',
  // Material account_tree, a model DAG: dbt Labs' guidelines require permission
  // to redistribute their logo, which is why Simple Icons dropped it
  dbt:   'M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z',
  // Three nodes of a DAG — Dagster's logo isn't in Simple Icons
  dagster: 'M5 3a3 3 0 1 1 0 6a3 3 0 1 1 0-6Zm0 12a3 3 0 1 1 0 6a3 3 0 1 1 0-6ZM19 9a3 3 0 1 1 0 6a3 3 0 1 1 0-6ZM7.4 8.01 15.89 11.65 16.6 9.99 8.11 6.36ZM8.11 17.64 16.6 14.01 15.89 12.35 7.4 15.99Z',
  // Material sync_alt, schema and verified_user — no logo exists for a practice
  etl:        'M7.5 21 3 16.5 7.5 12l1.05 1.05-2.7 2.7H21v1.5H5.85l2.7 2.7Zm9-9-1.05-1.05 2.7-2.7H3v-1.5h15.15l-2.7-2.7L16.5 3 21 7.5Z',
  dwh:        'M14 9v2h-3V9H8.5V7H11V1H4v6h2.5v2H4v6h2.5v2H4v6h7v-6H8.5v-2H11v-2h3v2h7V9h-7zM6 3h3v2H6V3zm3 18H6v-2h3v2zm0-8H6v-2h3v2zm10 0h-3v-2h3v2z',
  governance: 'M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z',
  // Material device_hub, memory and smart_toy for the families and the agents
  orchestration: 'M17 16l-4-4V8.82C14.16 8.4 15 7.3 15 6c0-1.66-1.34-3-3-3S9 4.34 9 6c0 1.3.84 2.4 2 2.82V12l-4 4H3v5h5v-3.05l4-4.2 4 4.2V21h5v-5h-4z',
  ai:         'M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z',
  agents:     'M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z',
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

// A skill's logo, or its custom glyph — null when it has neither
function skillIcon(s) {
  if (s.icon) {
    const img = document.createElement('img');
    img.src = `assets/icons/${s.icon}.svg`;
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => { img.style.display = 'none'; });
    return img;
  }
  return customIcons[s.id] ? makeCustomSvg(customIcons[s.id]) : null;
}

// Skills of a category, ordered by level then tenure — shared by the cards UI
// and the terminal `skills` command so both always show the same ordering.
// A family's tools aren't listed on their own: toolsOf() brings them with it.
const byLevelThenTenure = (a, b) => b.level - a.level || (skillMonths[b.id] || 0) - (skillMonths[a.id] || 0);
function skillsByCategory(cat) {
  return skillsData.filter(s => s.category === cat && !s.parent && s.site !== false).sort(byLevelThenTenure);
}
function toolsOf(id) {
  return skillsData.filter(s => s.parent === id && s.site !== false).sort(byLevelThenTenure);
}

// Translation key of each level, read out by screen readers next to the meter
const LEVEL_KEYS = { 3: 'skills.level.expert', 2: 'skills.level.mid', 1: 'skills.level.basic' };

// One skill's row. <button> so the skill → experience filter is keyboard
// accessible; a skill no position lists has nothing to filter, so it stays a
// plain row. A family's row (given its tool count) is a button too, that
// unfolds its tools instead.
function skillRow(s, toolCount) {
  const tr = t();
  const filterable = !toolCount && Object.values(roleSkills).some(r => r.skills.some(x => x.id === s.id));
  const row = document.createElement(toolCount || filterable ? 'button' : 'div');
  row.className = toolCount ? 'skill-row skill-fam__head' : filterable ? 'skill-row' : 'skill-row is-static';
  row.dataset.level = s.level;
  row.dataset.skill = s.id;
  if (toolCount || filterable) row.type = 'button';
  if (filterable) row.setAttribute('aria-pressed', 'false');
  if (toolCount) row.setAttribute('aria-expanded', 'false');

  // A tool without a logo keeps its name in line with the others
  const icon = skillIcon(s) || (s.parent && document.createElement('i'));
  if (icon) row.appendChild(icon);

  const name = document.createElement('span');
  name.className = 'skill-row__name';
  setSkillName(name, s.id);
  row.appendChild(name);

  if (toolCount) {
    const count = document.createElement('span');
    count.className = 'skill-fam__count';
    count.setAttribute('aria-hidden', 'true');
    count.textContent = toolCount;
    row.appendChild(count);
  }

  // Filled by updateSkillDurations(), which re-runs on a language change
  const dur = document.createElement('span');
  dur.className = 'skill-row__dur';
  row.appendChild(dur);

  const meter = document.createElement('span');
  meter.className = 'lvl';
  meter.dataset.level = s.level;
  meter.setAttribute('aria-hidden', 'true');
  row.appendChild(meter);

  const level = document.createElement('span');
  level.className = 'sr-only';
  level.dataset.i18n = LEVEL_KEYS[s.level];
  level.textContent = tr[LEVEL_KEYS[s.level]];
  row.appendChild(level);

  if (toolCount) {
    const tools = document.createElement('span');
    tools.className = 'sr-only';
    const word = document.createElement('span');
    word.dataset.i18n = 'skills.tools';
    word.textContent = tr['skills.tools'];
    tools.append(`, ${toolCount} `, word);
    row.appendChild(tools);
  }
  return row;
}

function renderSkills() {
  const container = document.querySelector('.skills-grid');
  if (!container) return;
  const staticTile = container.querySelector('[data-static]'); // languages & co. stay last
  const tr = t();

  categoryDefs.forEach(cat => {
    const items = skillsByCategory(cat);
    if (!items.length) return;

    const tile = document.createElement('article');
    tile.className = 'tile reveal';

    const label = document.createElement('p');
    label.className = 'label';
    label.dataset.i18n = `skills.${cat}`;
    label.textContent = tr[`skills.${cat}`] || cat;
    tile.appendChild(label);

    const rows = document.createElement('div');
    rows.className = 'skill-rows';

    items.forEach(s => {
      const tools = toolsOf(s.id);
      if (!tools.length) return rows.appendChild(skillRow(s));

      // A family: its row unfolds the tools, each a row of its own
      const fam = document.createElement('div');
      fam.className = 'skill-fam';
      const head = skillRow(s, tools.length);
      const list = document.createElement('div');
      list.className = 'skill-fam__tools';
      list.id = `skill-tools-${s.id}`;
      list.hidden = true;
      head.setAttribute('aria-controls', list.id);
      list.append(...tools.map(tool => skillRow(tool)));
      fam.append(head, list);
      rows.appendChild(fam);
    });

    tile.appendChild(rows);
    container.insertBefore(tile, staticTile);
  });
}

// ─── Role → Skills mapping ────────────────────────────────────────────────────
const roleSkills = {
  laps: {
    start: CURRENT_JOB_START,
    end: null,                  // ongoing
    skills: [
      { id: 'mcp',             key: true,  start: new Date(2026, 3) },  // Apr 2026
      { id: 'python',          key: true  },
      { id: 'aws',             key: true  },
      { id: 'llm',             key: false },
      { id: 'agents',          key: false, months: 6 },
      { id: 'sql',             key: true  },
      { id: 'snowflake',       key: false, months: 6 },
      { id: 'docker',          key: false },
      { id: 'bitbucket',       key: false },
      { id: 'agile',           key: false },
      { id: 'databricks',      key: false, months: 6 },
      { id: 'jira',            key: false },
      { id: 'pulumi',          key: false },
      { id: 'dbt',             key: true,  start: new Date(2026, 8) },  // Sep 2026
      { id: 'duckdb',          key: true,  start: new Date(2026, 8) },  // Sep 2026
      { id: 'etl',             key: true  },
      { id: 'governance',      key: false },
      { id: 'dagster',         key: false, start: new Date(2026, 8) },  // Sep 2026
      { id: 'prefect',         key: false, months: 3 },
      { id: 'dwh',             key: false },
      { id: 'lambda',          key: false },
      { id: 's3',              key: false },
      { id: 'stepfunctions',   key: false },
      { id: 'rds',             key: false },
      { id: 'cloudwatch',      key: false },
      { id: 'postgresql',      key: false },
      { id: 'cloudformation',  key: false },
      { id: 'codepipeline',    key: false },
      { id: 'mysql',           key: false },
      { id: 'git',             key: false },
      { id: 'grafana',         key: false },
    ]
  },
  bialr1: {
    start: new Date(2023, 0),   // Jan 2023
    end:   new Date(2023, 11),  // Dec 2023
    skills: [
      { id: 'pentaho',     key: true  },
      { id: 'aws',         key: true  },
      { id: 'postgresql',  key: true  },
      { id: 'sql',         key: true  },
      { id: 'agile',       key: false },
      { id: 'jira',        key: false },
      { id: 'git',         key: false },
      { id: 'etl',         key: true  },
      { id: 'dwh',         key: false },
      { id: 'prefect',     key: false },
      { id: 'glue',        key: false },
      { id: 'athena',      key: false },
      { id: 'rds',         key: false },
      { id: 'cloudwatch',  key: false },
      { id: 's3',          key: false },
      { id: 'powerbi',     key: false },
      { id: 'tableau',     key: false },
    ]
  },
  bialr2: {
    start: new Date(2021, 8),   // Sep 2021
    end:   new Date(2022, 11),  // Dec 2022
    skills: [
      { id: 'pentaho',  key: true  },
      { id: 'oracle',   key: true  },
      { id: 'git',      key: true  },
      { id: 'sql',      key: true  },
      { id: 'etl',      key: true  },
      { id: 'grafana',  key: false },
    ]
  },
  bialr3: {
    start: new Date(2020, 8),   // Sep 2020
    end:   new Date(2021, 7),   // Aug 2021
    skills: [
      { id: 'pentaho',     key: true  },
      { id: 'mssql',       key: true  },
      { id: 'sapbo',       key: true  },
      { id: 'sql',         key: true  },
      { id: 'etl',         key: true  },
      { id: 'governance',  key: true  },
    ]
  }
};

// Total hands-on months per skill, summed over the roles that used it. Built in
// one pass here and reused by both the card ordering and the hover label, so the
// two can't disagree.
// A skill picked up mid-role counts from its own start, and one used for a set
// span only (a proof of concept) gives its months outright
function monthsInRole(role, s) {
  const end = role.end || new Date();
  return s.months || Math.max(1, monthsBetween(s.start || role.start, end));
}
const skillMonths = {};
Object.values(roleSkills).forEach(role => {
  role.skills.forEach(s => { skillMonths[s.id] = (skillMonths[s.id] || 0) + monthsInRole(role, s); });
});
// A family counts each position where it or one of its tools served, once
skillsData.forEach(f => {
  const ids = [f.id, ...skillsData.filter(s => s.parent === f.id).map(s => s.id)];
  if (ids.length === 1) return;
  skillMonths[f.id] = Object.values(roleSkills).reduce((sum, role) => {
    const used = role.skills.filter(s => ids.includes(s.id));
    return used.length ? sum + Math.max(...used.map(s => monthsInRole(role, s))) : sum;
  }, 0);
});

// Writes a skill's name into el — its short form when it has one — keyed for
// applyLang() when it is translated
const skillById = Object.fromEntries(skillsData.map(s => [s.id, s]));
function setSkillName(el, id) {
  const s = skillById[id];
  const key = s && (s.short || s.i18n);
  el.textContent = s ? (key && t()[key]) || s.name : id;
  if (key) el.dataset.i18n = key;
}

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
  document.querySelectorAll('.skill-row[data-skill]').forEach(el => {
    const months = skillMonths[el.dataset.skill];
    el.querySelector('.skill-row__dur').textContent = months ? formatSkillDuration(months, lang) : '';
  });
}

// Each position lists its key skills, with their logos. The filter still
// matches every skill a position used, listed here or not.
function renderRoleSkills() {
  document.querySelectorAll('.xp-panel[data-role]').forEach(el => {
    const role = roleSkills[el.dataset.role];
    const keyList = el.querySelector('.key-skills');
    if (!role || !keyList) return;

    keyList.replaceChildren(...role.skills.filter(s => s.key).map(s => {
      const li = document.createElement('li');
      li.dataset.skill = s.id;
      const icon = skillById[s.id] && skillIcon(skillById[s.id]);
      if (icon) li.appendChild(icon);
      const name = document.createElement('span');
      setSkillName(name, s.id);
      li.appendChild(name);
      return li;
    }));
  });
}

// ─── Chronology: work and studies on one axis ─────────────────────────────────
// Months count from 0, an end month is excluded. Laps runs to today and the
// axis stretches with it, so the tile never goes stale. A work span names the
// position tab it stands for, so the two point at each other.
const CHRONO = {
  work: [
    { cls: 'c-hyatt', role: 'hyatt',  from: [2018, 3], to: [2018, 7], tip: 'Park Hyatt · 2018' },
    { cls: 'c-bialr', role: 'bialr3', label: 'APRR',     from: [2020, 8], to: [2021, 8], tip: 'BIAL-R · APRR · 2020 – 2021' },
    { cls: 'c-bialr', role: 'bialr2', label: 'Clariane', from: [2021, 8], to: [2023, 0], tip: 'BIAL-R · Clariane · 2021 – 2022' },
    { cls: 'c-bialr', role: 'bialr1', label: 'Bial-S',   from: [2023, 0], to: [2024, 0], tip: 'BIAL-R · Bial-S · 2023' },
    { cls: 'c-laps',  role: 'laps',   label: 'Laps',     from: [2024, 1], to: null },
  ],
  study: [
    { cls: 'c-edu', label: 'UVSQ', from: [2016, 8], to: [2018, 6], tip: 'UVSQ · DUT · 2016 – 2018' },
    { cls: 'c-edu', label: 'UQAC', from: [2018, 8], to: [2019, 6], tip: 'UQAC · 2018 – 2019' },
    { cls: 'c-edu', label: 'UCBL', from: [2019, 8], to: [2021, 6], tip: 'UCBL · Master · 2019 – 2021' },
  ],
};

function renderChrono() {
  const tl = document.querySelector('.chrono__tl');
  if (!tl) return;
  const now = new Date();
  const today = now.getFullYear() + (now.getMonth() + now.getDate() / 31) / 12;
  const start = 2016.5;
  const end = Math.max(2027, Math.ceil((today + 0.25) * 2) / 2);
  const at = y => (y - start) / (end - start) * 100;
  const year = ([y, m]) => y + m / 12;

  Object.entries(CHRONO).forEach(([track, spans]) => {
    const box = tl.querySelector(`[data-track="${track}"]`);
    box.replaceChildren(...spans.map(sp => {
      const el = document.createElement('span');
      const from = year(sp.from), to = sp.to ? year(sp.to) : today;
      el.className = sp.cls;
      el.style.setProperty('--s', at(from).toFixed(2));
      el.style.setProperty('--w', (at(to) - at(from)).toFixed(2));
      if (sp.label) el.textContent = sp.label;
      if (sp.tip) el.title = sp.tip;
      if (sp.role) {
        el.dataset.role = sp.role;
        // A shortcut for the mouse: the tabs below stay the accessible control
        el.addEventListener('click', () => {
          const tab = document.querySelector(`.xp-tab[data-role="${sp.role}"]`);
          if (tab && roleTabs) roleTabs.select(tab);
        });
      }
      return el;
    }));
  });

  const axis = tl.querySelector('.chrono__axis');
  const ticks = [];
  for (let y = Math.ceil(start / 2) * 2; y < end; y += 2) {
    const tick = document.createElement('span');
    tick.style.setProperty('--s', at(y).toFixed(2));
    tick.textContent = y;
    ticks.push(tick);
  }
  axis.replaceChildren(...ticks);

  const mark = document.createElement('div');
  mark.className = 'chrono__now';
  mark.style.setProperty('--s', at(today).toFixed(2));
  const label = document.createElement('span');
  label.dataset.i18n = 'chrono.now';
  label.textContent = t()['chrono.now'];
  mark.appendChild(label);
  tl.appendChild(mark);
}

// The position open below, picked out on the timeline once one is chosen —
// and scrolled into view on a phone
function markChrono(role) {
  const chrono = document.querySelector('.chrono');
  if (!chrono) return;
  chrono.classList.add('has-current');
  chrono.querySelectorAll('.chrono__track [data-role]').forEach(el => el.classList.toggle('is-current', el.dataset.role === role));
  const current = chrono.querySelector('.is-current');
  if (current) centerIn(chrono.querySelector('.chrono__scroll'), current);
}

// ─── Skill tiles & role skills ────────────────────────────────────────────────
// Rendered before the reveal observer below starts, so the tiles get observed
renderSkills();
updateSkillDurations(currentLang);
renderRoleSkills();

// The projects' tags wear the same logos as the positions' key skills
document.querySelectorAll('.project-card .key-skills li[data-skill]').forEach(li => {
  const icon = skillById[li.dataset.skill] && skillIcon(skillById[li.dataset.skill]);
  if (icon) li.prepend(icon);
});

// A family's row unfolds its tools
document.querySelector('.skills-grid')?.addEventListener('click', e => {
  const head = e.target.closest('.skill-fam__head');
  if (!head) return;
  const open = head.getAttribute('aria-expanded') !== 'true';
  head.setAttribute('aria-expanded', String(open));
  document.getElementById(head.getAttribute('aria-controls')).hidden = !open;
});

// CSS columns rebalance whenever a tile grows, so an unfolding family would
// send tiles hopping between columns, the clicked one included. The tiles are
// shared out once instead, in reading order and as evenly as CSS would, and
// stay put: an unfolding family only lengthens its own column. Shared out
// again when the column count changes, the fonts arrive or the language does.
(() => {
  const grid = document.querySelector('.skills-grid');
  if (!grid) return;
  const tiles = [...grid.children];
  const narrow = [matchMedia('(max-width: 599.98px)'), matchMedia('(max-width: 899.98px)')]; // as in style.css

  function layout() {
    const n = narrow[0].matches ? 1 : narrow[1].matches ? 2 : 3;
    const cols = Array.from({ length: n }, () => Object.assign(document.createElement('div'), { className: 'skills-col' }));
    grid.style.setProperty('--cols', n);
    grid.classList.add('is-laid');
    grid.replaceChildren(...cols);
    cols[0].append(...tiles); // measured at a column's width
    const h = tiles.map(el => el.offsetHeight + parseFloat(getComputedStyle(el).marginBottom));
    const run = (a, b) => h.slice(a, b).reduce((x, y) => x + y, 0);

    // The cut into n runs whose tallest is the shortest
    let best = { tallest: Infinity, ends: [] };
    (function cut(from, left, ends) {
      if (left === 1) {
        const all = [...ends, tiles.length];
        const tallest = Math.max(...all.map((b, i) => run(i ? all[i - 1] : 0, b)));
        if (tallest < best.tallest) best = { tallest, ends: all };
        return;
      }
      for (let i = from + 1; i <= tiles.length - left + 1; i++) cut(i, left - 1, [...ends, i]);
    })(0, n, []);
    best.ends.forEach((b, i) => cols[i].append(...tiles.slice(i ? best.ends[i - 1] : 0, b)));
  }

  layout();
  narrow.forEach(q => q.addEventListener('change', layout));
  document.fonts?.ready.then(layout);
  new MutationObserver(layout).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
renderChrono();

// On a phone the chronology is wider than the screen: it opens on today
const chronoScroll = document.querySelector('.chrono__scroll');
if (chronoScroll) {
  chronoScroll.scrollLeft = chronoScroll.scrollWidth;
  edgeFades(chronoScroll);
  const bar = document.querySelector('.chrono__bar');
  if (bar) scrollThumb(chronoScroll, bar);
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
// Content is only hidden while the observer can show it: if it never reports
// (background tab, some link previews), everything is revealed anyway.
const revealAll = () => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
let revealSeen = false;
const revealObserver = new IntersectionObserver(
  entries => {
    revealSeen = true;
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.08 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
setTimeout(() => { if (!revealSeen) revealAll(); }, 1500);
window.addEventListener('beforeprint', revealAll);

// ─── Top bar: glass background once the page scrolls ─────────────────────────
const topbar = document.getElementById('topbar');
if (topbar) onScroll(y => topbar.classList.toggle('is-stuck', y > 8));

// ─── Active nav link + sliding indicator ──────────────────────────────────────
// The active section is the last one whose top has crossed 40% of the viewport
// (the last one too once the page bottoms out). A click lights its link at once
// and holds it until the smooth scroll settles.
(() => {
  const nav = document.getElementById('siteNav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const ind = nav.querySelector('.site-nav__ind');
  const sections = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
  let current = null;
  let clickedLink = null;
  let clickTimer = null;

  function place() {
    if (!ind) return;
    if (!current) { ind.classList.remove('is-on'); return; }
    ind.style.setProperty('--x', current.offsetLeft + 'px');
    ind.style.setProperty('--y', current.offsetTop + 'px');
    ind.style.width = current.offsetWidth + 'px';
    ind.style.height = current.offsetHeight + 'px';
    ind.classList.add('is-on');
  }

  function setActive(link) {
    if (link === current) return;
    current = link;
    links.forEach(a => {
      if (a === link) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    place();
  }

  onScroll(y => {
    if (clickedLink) return;
    const line = window.innerHeight * 0.4;
    const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 2;
    let active = null;
    sections.forEach((s, i) => {
      if (s && (atBottom || s.getBoundingClientRect().top <= line)) active = links[i];
    });
    setActive(active);
  });

  links.forEach(a => a.addEventListener('click', () => {
    clickedLink = a;
    setActive(a);
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickedLink = null; }, 1000);
  }));

  // The labels change width with the language and once the fonts load, and the
  // bar changes shape across the mobile breakpoint
  new MutationObserver(place).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('resize', place);
  if (document.fonts) document.fonts.ready.then(place);
  requestAnimationFrame(() => { if (ind) ind.classList.add('is-ready'); });
})();

// Active theme: explicit data-theme override, else the OS preference.
// Shared by the theme toggle and the terminal `theme` command.
function isDarkTheme() {
  const theme = document.documentElement.dataset.theme;
  return theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
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

// ─── Experience: one position at a time ──────────────────────────────────────
// Tabs, arrow keys included. Without JS no panel is hidden: they all show.
const roleTabs = (() => {
  const tabs = [...document.querySelectorAll('.xp-tab')];
  if (!tabs.length) return null;

  function select(tab, focus, mark = true) {
    if (mark) {
      markChrono(tab.dataset.role);
      centerIn(tab.closest('.xp-tabs'), tab); // phones: the open chip stays in view
    }
    tabs.forEach(el => {
      const on = el === tab;
      el.setAttribute('aria-selected', String(on));
      el.tabIndex = on ? 0 : -1;
      document.getElementById(el.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }

  const MOVES = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
  const box = document.querySelector('.xp-tabs');
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      let to = -1;
      let step = MOVES[e.key];
      // Phones lay the row out oldest first, the reverse of the markup:
      // left and right follow what the eye sees
      if (/^Arrow(Left|Right)$/.test(e.key) && getComputedStyle(box).flexDirection === 'row') step = -step;
      if (e.key in MOVES) to = (i + step + tabs.length) % tabs.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = tabs.length - 1;
      if (to < 0) return;
      e.preventDefault();
      select(tabs[to], true);
    });
  });

  // The page opens on the current position without singling it out
  select(tabs.find(el => el.getAttribute('aria-selected') === 'true') || tabs[0], false, false);
  box.scrollLeft = box.scrollWidth; // phones: the row opens on the latest position, at its end
  edgeFades(box);
  return { select };
})();

// ─── Skill → experience cross-filter ─────────────────────────────────────────
// Click a skill row to dim the positions that didn't use it and open the first
// that did (data comes from roleSkills). Click again / × pill / Escape to clear.
(() => {
  const expSection = document.getElementById('experience');
  const skillsContainer = document.querySelector('.skills-grid');
  if (!expSection || !skillsContainer) return;

  let activeSkill = null;
  let pill = null;

  const rolesUsing = skillId => new Set(
    Object.keys(roleSkills).filter(r => roleSkills[r].skills.some(s => s.id === skillId))
  );

  function clearFilter() {
    activeSkill = null;
    skillsContainer.querySelectorAll('.skill-row.is-selected').forEach(el => {
      el.classList.remove('is-selected');
      el.setAttribute('aria-pressed', 'false');
    });
    expSection.querySelectorAll('.skill-dim').forEach(el => el.classList.remove('skill-dim'));
    expSection.querySelectorAll('.skill-match-tag').forEach(el => el.classList.remove('skill-match-tag'));
    if (pill) {
      // Focus would drop to <body> with the pill
      if (pill.contains(document.activeElement)) expSection.querySelector('.xp-tab[aria-selected="true"]')?.focus();
      pill.remove();
      pill = null;
    }
  }

  function applyFilter(skillId, chip) {
    clearFilter();
    activeSkill = skillId;
    chip.classList.add('is-selected');
    chip.setAttribute('aria-pressed', 'true');

    const matches = rolesUsing(skillId);
    let first = null;
    expSection.querySelectorAll('.xp-tab[data-role]').forEach(tab => {
      const ok = matches.has(tab.dataset.role);
      tab.classList.toggle('skill-dim', !ok);
      if (ok && !first) first = tab;
    });
    expSection.querySelectorAll(`.xp-panel [data-skill="${skillId}"]`).forEach(el => el.classList.add('skill-match-tag'));
    if (first && roleTabs) roleTabs.select(first);

    pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'skill-filter-pill';
    const label = document.createElement('span');
    label.dataset.i18n = 'skills.filter';
    label.textContent = t()['skills.filter'];
    const name = document.createElement('strong');
    setSkillName(name, skillId);
    const cross = document.createElement('span');
    cross.setAttribute('aria-hidden', 'true');
    cross.textContent = '×';
    pill.append(label, ' ', name, ' ', cross);
    pill.addEventListener('click', clearFilter);
    expSection.querySelector('.sec-head').insertAdjacentElement('afterend', pill);
    // Focus follows the jump to the positions
    pill.focus({ preventScroll: true });

    expSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  skillsContainer.addEventListener('click', e => {
    const chip = e.target.closest('button.skill-row');
    if (!chip || !chip.dataset.skill || chip.hasAttribute('aria-expanded')) return;
    if (activeSkill === chip.dataset.skill) clearFilter();
    else applyFilter(chip.dataset.skill, chip);
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !activeSkill) return;
    // Escape then belongs to the CV dialog or the terminal
    const html = document.documentElement;
    if (html.classList.contains('cv-open') || html.classList.contains('travel-open') || !document.getElementById('terminalOverlay').hidden) return;
    clearFilter();
  });
})();

// ─── Easter egg: the countries behind "18 countries" ──────────────────────────
// A click on the count opens a dot globe (assets/world-dots.js, built by
// scripts/world-dots.py) with these countries lit, beside their list by
// continent; the terminal's `travel` prints the list. A new country is one
// line here: `iso` is its ISO 3166-1 numeric code (the globe's data-c), and
// `next` marks a trip to come. The count in i18n.js (misc.travel.count, and
// misc.travel.desc for the CV) follows the list, Saint-Martin aside: it is France.
const TRAVEL = [
  { iso: '250', zone: 'eu', fr: 'France',      en: 'France' },
  { iso: '826', zone: 'eu', fr: 'Royaume-Uni', en: 'United Kingdom' },
  { iso: '056', zone: 'eu', fr: 'Belgique',    en: 'Belgium' },
  { iso: '276', zone: 'eu', fr: 'Allemagne',   en: 'Germany' },
  { iso: '756', zone: 'eu', fr: 'Suisse',      en: 'Switzerland' },
  { iso: '724', zone: 'eu', fr: 'Espagne',     en: 'Spain' },
  { iso: '380', zone: 'eu', fr: 'Italie',      en: 'Italy' },
  { iso: '233', zone: 'eu', fr: 'Estonie',     en: 'Estonia' },
  { iso: '440', zone: 'eu', fr: 'Lituanie',    en: 'Lithuania' },
  { iso: '428', zone: 'eu', fr: 'Lettonie',    en: 'Latvia' },
  { iso: '616', zone: 'eu', fr: 'Pologne',     en: 'Poland' },
  { iso: '300', zone: 'eu', fr: 'Grèce',       en: 'Greece' },
  { iso: '620', zone: 'eu', fr: 'Portugal',    en: 'Portugal' },
  { iso: '208', zone: 'eu', fr: 'Danemark',    en: 'Denmark' },
  { iso: '124', zone: 'na', fr: 'Canada',      en: 'Canada' },
  { iso: '840', zone: 'na', fr: 'États-Unis',  en: 'United States' },
  { iso: '484', zone: 'na', fr: 'Mexique',     en: 'Mexico' },
  { iso: '214', zone: 'na', fr: 'République dominicaine', en: 'Dominican Republic' },
  { iso: '663', zone: 'na', fr: 'Saint-Martin', en: 'Saint Martin', part: true }, // France
  { iso: '266', zone: 'af', fr: 'Gabon',       en: 'Gabon',   next: true },
  { iso: '504', zone: 'af', fr: 'Maroc',       en: 'Morocco', next: true },
];
// Continents and their UN member states, 195 with the two observer states
const TRAVEL_ZONES = [
  { id: 'eu', total: 44 }, { id: 'na', total: 23 }, { id: 'sa', total: 12 },
  { id: 'af', total: 54 }, { id: 'as', total: 48 }, { id: 'oc', total: 14 },
];
const travelName = c => c[currentLang] || c.fr;

// A zone's countries, visited or to come, A to Z in the current language
function travelIn(zone, next = false) {
  return TRAVEL.filter(c => c.zone === zone && !!c.next === next)
    .sort((a, b) => travelName(a).localeCompare(travelName(b), currentLang));
}

(() => {
  const dialog = document.getElementById('travelDialog');
  if (!dialog) return;
  const html = document.documentElement;
  const canvas = dialog.querySelector('.travel__globe');
  const ctx = canvas.getContext('2d');
  const zones = document.getElementById('travelZones');
  const sum = document.getElementById('travelSum');

  // ─── The list: continents travelled, then the ones with a trip to come ───
  function renderList() {
    const tr = t();
    const been = TRAVEL.filter(c => !c.next && !c.part);
    const count = z => been.filter(c => c.zone === z.id).length;
    const reached = TRAVEL_ZONES.filter(count).length;
    const soon = TRAVEL.filter(c => c.next).length;
    const b = n => Object.assign(document.createElement('b'), { textContent: n });
    sum.replaceChildren(b(been.length), ` ${tr['travel.countries']} · `, b(reached), ` ${tr['travel.continents']}`,
      ...(soon ? [' · ', b(soon), ` ${tr['travel.next']}`] : []));

    const rank = z => (count(z) ? 0 : travelIn(z.id, true).length ? 1 : 2);
    const order = [...TRAVEL_ZONES].sort((a, z) => rank(a) - rank(z) || count(z) - count(a));
    zones.replaceChildren(...order.map(z => {
      const tile = document.createElement('div');
      const visited = travelIn(z.id), next = travelIn(z.id, true), locked = !visited.length && !next.length;
      tile.className = locked ? 'travel__zone is-locked' : 'travel__zone';

      const head = document.createElement('header');
      if (locked) head.insertAdjacentHTML('beforeend', '<svg class="ico" aria-hidden="true"><use href="#i-lock"/></svg>');
      const name = document.createElement('span');
      name.dataset.i18n = `travel.zone.${z.id}`;
      name.textContent = tr[`travel.zone.${z.id}`];
      const n = document.createElement('span');
      n.className = 'travel__n';
      n.textContent = `${count(z)} / ${z.total}`;
      head.append(name, n);

      const bar = document.createElement('div');
      bar.className = 'travel__bar';
      bar.innerHTML = `<i style="width:${count(z) / z.total * 100}%"></i>`;
      tile.append(head, bar);

      if (locked) {
        const p = document.createElement('p');
        p.className = 'travel__lock';
        p.dataset.i18n = 'travel.locked';
        p.textContent = tr['travel.locked'];
        tile.append(p);
        return tile;
      }
      const list = document.createElement('ul');
      list.className = 'travel__list';
      list.append(...[...visited, ...next].map(c => {
        const li = document.createElement('li');
        li.dataset.c = c.iso;
        li.textContent = travelName(c);
        if (c.part) li.append(Object.assign(document.createElement('small'), { textContent: ' · France' }));
        if (c.next) {
          li.className = 'is-next';
          li.title = tr['travel.next'];
        }
        return li;
      }));
      tile.append(list);
      return tile;
    }));
  }

  // ─── The globe: the dots of assets/world-dots.js on a sphere ───
  let xyz = null;              // the dots, x y z on the unit sphere
  let every = [];              // and all their indices, for the land
  const dotsOf = {};           // a country's dots
  const facing = {};           // the turn and tilt that face a country
  function parse() {
    if (xyz) return;
    const all = [];
    for (const [, iso, d] of window.worldDots.matchAll(/<path data-c="([^"]+)" d="([^"]+)"\/>/g)) {
      const mine = dotsOf[iso] = [];
      let col = 0, row = 0, sx = 0, sy = 0, sz = 0;
      for (const [, m, a, b] of d.matchAll(/([Mm])(-?\d+) (-?\d+)h0/g)) {
        col = m === 'M' ? +a : col + +a;
        row = m === 'M' ? +b : row + +b;
        // One dot per degree from 75°N, as scripts/world-dots.py lays them out
        const lon = (col - 179.5) * Math.PI / 180, lat = (74.5 - row) * Math.PI / 180;
        const x = Math.cos(lat) * Math.sin(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon);
        mine.push(all.length / 3);
        all.push(x, y, z);
        sx += x; sy += y; sz += z;
      }
      facing[iso] = [Math.atan2(sx, sz), Math.asin(sy / (Math.hypot(sx, sy, sz) || 1))];
    }
    xyz = new Float32Array(all);
    every = Array.from({ length: all.length / 3 }, (_, i) => i);
  }

  // Loaded on first opening only, as a script rather than with fetch(), which
  // a file:// copy of the site refuses; after a failed load (a network blip),
  // the next opening tries again
  let loading = null;
  const loadDots = () => (loading ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'assets/world-dots.js?v=3';
    script.onload = resolve;
    script.onerror = e => { script.remove(); loading = null; reject(e); };
    document.head.appendChild(script);
  }));

  // The theme's colours, read from its tokens
  let ink = {};
  function colours() {
    const probe = document.createElement('i');
    dialog.append(probe);
    const read = v => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
    ink = { edge: read('--border'), land: read('--border-2'), lit: read('--accent'), hot: read('--accent-text') };
    probe.remove();
  }
  new MutationObserver(() => dialog.open && colours()).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => dialog.open && colours());

  // Over the Atlantic, every trip in sight; then a slow turn, eastward
  const view = { rot: -.6, tilt: .52 };
  let goal = null, hot = null, drag = null, opened = 0, last = 0, frame = 0;
  const ease = p => 1 - (1 - p) ** 3;
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  const shown = TRAVEL.filter(c => !c.next);

  function draw(now) {
    frame = requestAnimationFrame(draw);
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;
    const dpr = window.devicePixelRatio || 1, size = Math.round(canvas.clientWidth * dpr);
    if (!size) return;
    if (canvas.width !== size) canvas.width = canvas.height = size;

    const t = now - opened, still = prefersReducedMotion;
    if (!drag && goal) {
      const k = still ? 1 : 1 - Math.exp(-dt / 150);
      view.rot += wrap(goal[0] - view.rot) * k;
      view.tilt += (goal[1] - view.tilt) * k;
    } else if (!drag && !still) view.rot -= dt * .00012;

    // Opening: the globe grows in and spins into place, then lights up
    const p = still ? 1 : ease(Math.min(1, t / 1000));
    const rot = view.rot + (1 - p) * 2.6, tilt = view.tilt;
    const R = size / 2 * (.6 + .34 * p), mid = size / 2, unit = R / 160; // dots grow with the globe
    const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
    // Round dots, smaller towards the rim, all of one colour in a single path
    const plot = (ids, px) => {
      ctx.beginPath();
      for (const i of ids) {
        const x = xyz[i * 3], y = xyz[i * 3 + 1], z = xyz[i * 3 + 2];
        const x1 = x * cr - z * sr, z1 = x * sr + z * cr;
        const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
        if (z2 <= 0) continue;
        const r = px * unit * (.5 + .5 * z2) / 2, cx = mid + R * x1, cy = mid - R * y2;
        ctx.moveTo(cx + r, cy);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    ctx.clearRect(0, 0, size, size);
    ctx.globalAlpha = p;
    // A faint rim: the sphere still reads when the Pacific faces us
    ctx.beginPath();
    ctx.arc(mid, mid, R, 0, Math.PI * 2);
    ctx.strokeStyle = ink.edge;
    ctx.lineWidth = dpr;
    ctx.stroke();
    ctx.fillStyle = ink.land;
    plot(every, 1.6);
    ctx.fillStyle = ink.lit;
    shown.forEach((c, i) => {
      const on = still ? 1 : Math.max(0, Math.min(1, (t - 800 - i * 55) / 260));
      if (!on || !dotsOf[c.iso]) return;
      ctx.globalAlpha = on * (hot && hot !== c.iso ? .45 : 1);
      plot(dotsOf[c.iso], 2.3);
    });
    // A trip to come pulses
    TRAVEL.filter(c => c.next && dotsOf[c.iso]).forEach(c => {
      ctx.globalAlpha = still ? .6 : Math.max(0, Math.min(1, (t - 1900) / 400)) * (.3 + .35 * (1 + Math.sin(t / 380)));
      plot(dotsOf[c.iso], 2.3);
    });
    if (hot && dotsOf[hot]) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = ink.hot;
      plot(dotsOf[hot], 2.9);
    }
    ctx.globalAlpha = 1;
  }

  // A country picked in the list turns to face us and lights up
  function focus(iso) {
    hot = iso || null;
    goal = iso && facing[iso] ? facing[iso] : null;
    zones.querySelectorAll('.is-on').forEach(li => li.classList.remove('is-on'));
    if (iso) zones.querySelector(`[data-c="${iso}"]`)?.classList.add('is-on');
  }
  const picked = e => e.target.closest('li[data-c]')?.dataset.c;
  zones.addEventListener('pointerover', e => { if (e.pointerType === 'mouse' && picked(e)) focus(picked(e)); });
  zones.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') focus(null); });
  zones.addEventListener('click', e => focus(picked(e))); // a tap, on a touch screen

  // Or the globe turns by hand
  canvas.addEventListener('pointerdown', e => {
    focus(null);
    drag = { x: e.clientX, y: e.clientY, rot: view.rot, tilt: view.tilt };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const half = canvas.clientWidth / 2 || 1;
    view.rot = drag.rot - (e.clientX - drag.x) / half;
    view.tilt = Math.max(-1.3, Math.min(1.3, drag.tilt + (e.clientY - drag.y) / half));
  });
  const release = () => { drag = null; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  async function open() {
    renderList();
    dialog.showModal();
    html.classList.add('travel-open');
    try { await loadDots(); canvas.hidden = false; } catch (e) { canvas.hidden = true; return; }
    if (!dialog.open) return;
    parse();
    colours();
    Object.assign(view, { rot: -.6, tilt: .52 });
    focus(null);
    opened = performance.now();
    last = 0;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  }
  dialog.addEventListener('close', () => {
    cancelAnimationFrame(frame);
    html.classList.remove('travel-open');
    focus(null);
  });
  // A click beside the sheet closes, as the cross does
  dialog.addEventListener('click', e => {
    if (e.target === dialog || e.target.closest('[data-travel-close]')) dialog.close();
  });
  document.addEventListener('click', e => { if (e.target.closest('[data-travel-open]')) open(); });
  new MutationObserver(() => { if (dialog.open) renderList(); })
    .observe(html, { attributes: true, attributeFilter: ['lang'] });
})();

// ─── Copy the e-mail address ──────────────────────────────────────────────────
(() => {
  const btn = document.getElementById('copyEmail');
  if (!btn) return;
  let timer = null;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
    } catch (e) {
      return; // no clipboard here (insecure context, denied): the address is right next to the button
    }
    btn.classList.add('is-done');
    clearTimeout(timer);
    timer = setTimeout(() => btn.classList.remove('is-done'), 1600);
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
      dismissTimer = setTimeout(() => {
        status.className = 'contact-form__status';
        status.textContent = '';
      }, 600);
    }, 10000);
  }

  // A field in error is flagged for screen readers too, the first one takes
  // the focus and the status line says what is expected
  function setInvalid(el, bad) {
    el.classList.toggle('is-invalid', bad);
    if (bad) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function validateForm() {
    let first = null;
    form.querySelectorAll('[required]').forEach(el => {
      const empty = !el.value.trim();
      const badEmail = el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
      setInvalid(el, empty || badEmail);
      if ((empty || badEmail) && !first) first = el;
    });
    if (first) {
      first.focus();
      setStatus(t()['contact.invalid'], 'is-error');
    }
    return !first;
  }

  form.querySelectorAll('[required]').forEach(el => {
    el.addEventListener('input', () => setInvalid(el, false));
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
// ` (or the >_ footer button) opens a fake zsh; t / l / 1-5 are page shortcuts.
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
  // Number keys follow the nav, so 1–5 land on the sections numbered 01–05
  const SHORTCUT_SECTIONS = [...document.querySelectorAll('#siteNav a')].map(a => a.hash.slice(1));

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
        '  travel              pays visités',
        '  contact             email, téléphone, réseaux',
        '  open <réseau>       ouvrir un profil (github, linkedin…)',
        '  cv [fr|en]          ouvrir le CV',
        '  ping [n]            latence vers Cloudflare',
        '  refs                références du CV (propriétaire)',
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
      netHint:   'réseaux : github · linkedin',
      langSet:   'Langue',
      themeSet:  'Thème',
      lastLogin: 'Dernière connexion :',
      pingFail:  'ping : Cloudflare ne répond pas ici (en local ?)',
      refs: {
        pass:      'Phrase de passe :',
        newPass:   'Nouvelle phrase de passe (Entrée = garder l\'actuelle) :',
        confirm:   'Confirmation :',
        loading:   'Déchiffrement…',
        wrong:     'Phrase de passe incorrecte.',
        missing:   'cv-refs.enc introuvable.',
        local:     'cv-refs.enc ne se lit pas en file:// : ouvrez le site par un serveur (python3 -m http.server).',
        failed:    'Échec : rien n\'a été écrit.',
        mismatch:  'Les deux phrases diffèrent : rien n\'a été écrit.',
        locked:    'Références verrouillées.',
        noSession: 'Aucune référence ouverte : tapez « refs ».',
        badIndex:  'numéro de référence invalide :',
        badField:  'champ inconnu :',
        saved:     'cv-refs.enc téléchargé : remplacez celui du dépôt, puis commit et push.',
        usage: [
          'refs                           déverrouiller et afficher',
          'refs set <n> <champ> <valeur>  name, email, phone, role, role.fr, role.en',
          'refs add <nom>                 ajouter une référence',
          'refs rm <n>                    supprimer une référence',
          'refs save                      chiffrer et télécharger cv-refs.enc',
          'refs lock                      oublier les références',
        ],
      },
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
        '  travel              countries visited',
        '  contact             email, phone, socials',
        '  open <network>      open a profile (github, linkedin…)',
        '  cv [fr|en]          open the resume',
        '  ping [n]            latency to Cloudflare',
        '  refs                CV references (owner only)',
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
      netHint:   'networks: github · linkedin',
      langSet:   'Language',
      themeSet:  'Theme',
      lastLogin: 'Last login:',
      pingFail:  'ping: Cloudflare is not answering here (running locally?)',
      refs: {
        pass:      'Passphrase:',
        newPass:   'New passphrase (Enter = keep the current one):',
        confirm:   'Confirm:',
        loading:   'Decrypting…',
        wrong:     'Wrong passphrase.',
        missing:   'cv-refs.enc not found.',
        local:     'cv-refs.enc cannot be read from file://: serve the site (python3 -m http.server).',
        failed:    'Failed: nothing was written.',
        mismatch:  'The passphrases differ: nothing was written.',
        locked:    'References locked.',
        noSession: "No references open: type 'refs'.",
        badIndex:  'invalid reference number:',
        badField:  'unknown field:',
        saved:     'cv-refs.enc downloaded: replace the one in the repo, then commit and push.',
        usage: [
          'refs                           unlock and list',
          'refs set <n> <field> <value>   name, email, phone, role, role.fr, role.en',
          'refs add <name>                add a reference',
          'refs rm <n>                    remove a reference',
          'refs save                      encrypt and download cv-refs.enc',
          'refs lock                      forget the references',
        ],
      },
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

  // The previous terminal login, stamped at each new one: only the terminal
  // reads it, so a visitor who never opens it gets nothing stored
  function lastLoginLine() {
    let prev = null;
    try {
      const raw = localStorage.getItem('lastVisit');
      if (raw) prev = new Date(Number(raw));
      localStorage.setItem('lastVisit', Date.now());
    } catch (e) {}
    const d = prev || new Date();
    const datePart = new Intl.DateTimeFormat(currentLang, { weekday: 'short', day: '2-digit', month: 'short' }).format(d);
    const time = new Intl.DateTimeFormat(currentLang, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d);
    return `${tt().lastLogin} ${datePart} ${time}`;
  }

  // One pending question at a time: the next Enter answers it instead of
  // running a command. A secret answer is typed masked, echoed as dots and
  // kept out of the history. Closing the terminal answers null.
  let pending = null;

  function ask(label, secret) {
    print(label, 'terminal__line--muted');
    input.type = secret ? 'password' : 'text';
    return new Promise(resolve => { pending = { resolve, secret }; });
  }

  function settle(value) {
    const p = pending;
    pending = null;
    input.type = 'text';
    if (p) p.resolve(value);
  }

  // ─── refs: edit the CV references (for the owner, flagged so in help) ─────
  // Unlocks cv-refs.enc, edits the referees in memory and downloads the
  // re-encrypted file, to commit in place of the old one: the site is static,
  // nothing is sent anywhere. The plain text lives in refsSession until
  // `refs lock` or the terminal closes.
  let refsSession = null;
  let refsLib = null;

  // Fetched on first use only. Keep ?v= in step with the tag in cv.html.
  const loadRefsLib = () => refsLib || (refsLib = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'refs-crypto.js?v=5';
    s.onload = resolve;
    s.onerror = () => { refsLib = null; reject(new Error('load')); };
    document.head.appendChild(s);
  }));

  function showRefs() {
    refsSession.refs.forEach((ref, i) => {
      const role = ref.role && typeof ref.role === 'object'
        ? `${ref.role.fr} / ${ref.role.en}`
        : ref.role || '';
      print(`  ${i + 1}  ${ref.name}${role ? ' — ' + role : ''}`);
      const contact = [ref.email, ref.phone].filter(Boolean).join(' · ');
      if (contact) print(`     ${contact}`, 'terminal__line--muted');
    });
  }

  async function refsCommand(args) {
    const r = tt().refs;
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'help') { print(r.usage); return; }
    if (sub === 'lock') {
      // The scrollback holds the listed referees too
      refsSession = null;
      clearQueue();
      output.innerHTML = '';
      print(r.locked);
      return;
    }

    if (!refsSession) {
      if (sub && sub !== 'show') { print(r.noSession, 'terminal__line--error'); return; }
      const pass = await ask(r.pass, true);
      if (!pass) return;
      print(r.loading, 'terminal__line--muted');
      try {
        await loadRefsLib();
        const refs = await decryptRefs(pass);
        // Closed while the key was derived: the list must not outlive the close
        if (terminalClosed()) return;
        refsSession = { refs, pass };
      } catch (e) {
        const msg = { missing: r.missing, local: r.local, load: r.failed }[e.message] || r.wrong;
        print(msg, 'terminal__line--error');
        return;
      }
      showRefs();
      print('');
      print(r.usage, 'terminal__line--muted');
      return;
    }

    const refs = refsSession.refs;
    if (!sub || sub === 'show') { showRefs(); return; }
    if (sub === 'add') { refs.push({ name: args.slice(1).join(' ') || '?' }); showRefs(); return; }

    if (sub === 'rm' || sub === 'set') {
      const n = Number(args[1]);
      const ref = Number.isInteger(n) ? refs[n - 1] : undefined;
      if (!ref) { print(`${r.badIndex} ${args[1] || ''}`, 'terminal__line--error'); return; }
      if (sub === 'rm') { refs.splice(n - 1, 1); showRefs(); return; }

      const field = (args[2] || '').toLowerCase();
      const value = args.slice(3).join(' ');
      if (['name', 'email', 'phone', 'role'].includes(field)) {
        if (value) ref[field] = value;
        else delete ref[field];
      } else if (field === 'role.fr' || field === 'role.en') {
        // A plain role becomes { fr, en }, both starting from the old text
        const role = ref.role && typeof ref.role === 'object'
          ? ref.role
          : { fr: ref.role || '', en: ref.role || '' };
        role[field.slice(5)] = value;
        ref.role = role;
      } else {
        print(`${r.badField} ${args[2] || ''}`, 'terminal__line--error');
        return;
      }
      showRefs();
      return;
    }

    if (sub === 'save') {
      const next = await ask(r.newPass, true);
      if (next === null || !refsSession) return;
      let pass = refsSession.pass;
      if (next) {
        if ((await ask(r.confirm, true)) !== next) { print(r.mismatch, 'terminal__line--error'); return; }
        pass = next;
      }
      if (!refsSession) return;
      try {
        const file = await encryptRefs(refs, pass);
        if (terminalClosed()) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([file], { type: 'application/octet-stream' }));
        a.download = 'cv-refs.enc';
        a.click();
        // Revoked later: some browsers start the download after click() returns
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
        refsSession.pass = pass;
        print(r.saved);
      } catch (e) {
        print(r.failed, 'terminal__line--error');
      }
      return;
    }

    print(r.usage, 'terminal__line--muted');
  }

  // ─── ping: real round trips to the Cloudflare edge ──────────────────────────
  // /cdn-cgi/trace answers on every hostname Cloudflare proxies, is never
  // cached, and names the datacenter that served it (colo, an airport code).
  // Same origin, so the CSP's connect-src 'self' already allows it. The output
  // stays in English, like the real ping's.
  const COLOS = {
    YUL: 'Montreal', YYZ: 'Toronto', YVR: 'Vancouver', YOW: 'Ottawa',
    EWR: 'Newark', IAD: 'Ashburn', ORD: 'Chicago', BOS: 'Boston',
    SJC: 'San Jose', LAX: 'Los Angeles', CDG: 'Paris', MRS: 'Marseille',
    LHR: 'London', FRA: 'Frankfurt', AMS: 'Amsterdam', GVA: 'Geneva',
  };
  let pinging = false;
  const terminalClosed = () => overlay.hidden || overlay.classList.contains('terminal-overlay--closing');

  async function pingCommand(args) {
    if (pinging) return;
    pinging = true;
    const count = Math.min(Math.max(parseInt(args[0], 10) || 4, 1), 10);
    const host = location.hostname;
    const times = [];
    let sent = 0;
    try {
      for (let seq = 0; seq < count && !terminalClosed(); seq++) {
        const t0 = performance.now();
        sent++;
        let text = null;
        try {
          const res = await fetch('/cdn-cgi/trace', { cache: 'no-store' });
          if (res.ok) text = await res.text();
        } catch (e) {}
        const ms = performance.now() - t0;
        if (terminalClosed()) return;

        if (text === null) {
          // Nothing from the very first one: no Cloudflare in front, say so once
          if (seq === 0) { print(tt().pingFail, 'terminal__line--error'); return; }
          print(`Request timeout for icmp_seq ${seq}`, 'terminal__line--error');
        } else {
          if (seq === 0) {
            const colo = (text.match(/^colo=(\w+)$/m) || [])[1] || '?';
            print(`PING ${host} via Cloudflare ${colo}${COLOS[colo] ? ` (${COLOS[colo]})` : ''}`);
          }
          times.push(ms);
          print(`${text.length} bytes from ${host}: icmp_seq=${seq} time=${ms.toFixed(1)} ms`);
        }
        // A second between pings, like the real one
        if (seq < count - 1) await new Promise(r => setTimeout(r, Math.max(0, 1000 - ms)));
      }
      if (!sent || terminalClosed()) return;

      const loss = Math.round((1 - times.length / sent) * 100);
      print('');
      print(`--- ${host} ping statistics ---`);
      print(`${sent} packets transmitted, ${times.length} packets received, ${loss}% packet loss`);
      if (times.length) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const fmt = n => n.toFixed(1);
        print(`round-trip min/avg/max = ${fmt(Math.min(...times))}/${fmt(avg)}/${fmt(Math.max(...times))} ms`);
      }
    } finally {
      pinging = false;
    }
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
        '',
        tt().bio,
      ]);
    },

    // The pitch first: the paragraph after it starts from what it promises
    about() {
      print('');
      print(t()['hero.pitch'].replace(/\*\*/g, ''));
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
        items.forEach(s => {
          const tools = toolsOf(s.id).map(skillLabel).join(', ');
          print(`    ${dots(s.level)}  ${skillLabel(s)}${tools ? ` (${tools})` : ''}`, 'terminal__line--muted');
        });
      });
    },

    travel() {
      const sep = currentLang === 'en' ? ': ' : ' : ';
      TRAVEL_ZONES.forEach(z => {
        const been = travelIn(z.id).map(travelName), next = travelIn(z.id, true).map(travelName);
        if (!been.length && !next.length) return;
        print(`  ${t()['travel.zone.' + z.id]}`);
        if (been.length) print(`    ${been.join(', ')}`, 'terminal__line--muted');
        if (next.length) print(`    ${t()['travel.next']}${sep}${next.join(', ')}`, 'terminal__line--muted');
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
      window.open(`${pageUrl('/cv')}?lang=${lang}`, '_blank', 'noopener');
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
      // Label in the target language: langToggle defers currentLang by the
      // page fade (FADE_MS), so tt() would still resolve to the previous one.
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
    ping: pingCommand,
    refs: refsCommand,
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
    // Dropped now rather than after the animation: the plain-text references
    // should not outlive the click on close
    settle(null);
    refsSession = null;
    // No close animation under reduced motion, nor for the docked window (its
    // own animation wins) → animationend never fires, so hide immediately.
    if (prefersReducedMotion || isMinimized()) { finishClose(focus); return; }
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
      if (pending) {
        print(pending.secret ? '••••••••' : value);
        settle(value);
        return;
      }
      // refs lines carry names, emails and phones: ↑ must not bring them back
      // once the references are locked
      if (value.trim() && !/^\s*refs\b/i.test(value)) { history.push(value); }
      histIdx = history.length;
      run(value);
    } else if (pending) {
      // No history recall into an answer, least of all a passphrase
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
    // The CV and travel dialogs handle their own keys; the page behind them takes none
    const html = document.documentElement;
    if (html.classList.contains('cv-open') || html.classList.contains('travel-open')) return;
    if (e.key === 'Escape') { if (!overlay.hidden) closeTerminal(); return; }
    const el = e.target;
    if (el.closest && (el.closest('input, textarea, select, [contenteditable]'))) return;
    // Modal is up (open, not minimized): swallow page shortcuts so a stray
    // 1-5 / t / l can't scroll or toggle the page behind the backdrop.
    if (!overlay.hidden && !isMinimized()) return;

    // e.code 'Backquote' = the physical key left of 1, whatever the layout
    // (on CA-FR / FR keyboards the ` character itself is a dead key);
    // '$' as a fallback — a dedicated key on CA-FR, and shell-themed
    if (e.code === 'Backquote' || e.key === '`' || e.key === '~' || e.key === '$') {
      openTerminal();
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

// ─── CV in a dialog ───────────────────────────────────────────────────────────
// On a computer or a tablet, every CV button opens the print view in front of
// the page instead of leaving it: cv.html loads into a frame on first intent,
// the page blurs behind, and
// the buttons beside the sheet drive the frame — print, references, language.
// They talk to it through postMessage rather than reaching into its document:
// opened from a file:// copy the frame counts as another origin, and only
// messages get through. The links keep their href, so a new tab (middle or
// ⌘-click), a phone and a browser without JavaScript still get /cv on its own.
(function () {
  const dialog = document.getElementById('cvDialog');
  const frame = document.getElementById('cvFrame');
  if (!dialog || !frame || typeof dialog.showModal !== 'function') return;

  const root = document.documentElement;
  const stage = dialog.querySelector('.cv-stage');
  const refsBtn = document.getElementById('cvRefs');
  const pass = document.getElementById('cvPass');
  const passInput = document.getElementById('cvPassInput');
  const passErr = document.getElementById('cvPassErr');
  // iPadOS prints the page around a frame, not the frame: there the button
  // opens the CV on its own, which prints itself (cv.js reads ?print=1). An
  // iPhone never gets the dialog.
  const IOS = /iPad/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Phones, held upright or sideways: the sheet would take the whole screen
  // anyway, so the links lead to the CV page, where back, zoom and printing
  // are the browser's own. The same query labels the buttons (style.css) and
  // trims the CV page's toolbar (cv.css).
  const PHONE = matchMedia('(max-width: 599.98px), (max-height: 499.98px) and (pointer: coarse)');
  const cvUrl = () => `${pageUrl('/cv')}?lang=${currentLang}`;
  let ready = false;          // cv.js answered from inside the frame
  let refsState = 'locked';   // as the frame last reported it

  const send = msg => { if (ready) frame.contentWindow.postMessage({ cv: true, ...msg }, MSG_ORIGIN); };

  // Loaded on the first hover, focus or click, then kept for an instant
  // reopen; never on a phone, which leaves for the page instead
  const warm = () => { if (!PHONE.matches && !frame.getAttribute('src')) frame.src = cvUrl(); };

  window.addEventListener('message', e => {
    if (e.source !== frame.contentWindow || !e.data || e.data.cv !== true) return;
    const m = e.data;
    if (m.type === 'ready') {
      ready = true;
      // The site may have switched language while the frame was loading
      send({ type: 'lang', lang: currentLang });
    } else if (m.type === 'refs') {
      // The frame's own references button, mirrored on ours: it holds the
      // decrypted list and says what the button does next
      refsState = m.state;
      const label = refsBtn.querySelector('span');
      label.textContent = m.label;
      label.setAttribute('data-i18n', m.key);
      refsBtn.querySelector('use').setAttribute('href', m.icon);
    } else if (m.type === 'unlock') {
      if (m.ok) { showPass(false); refsBtn.focus(); return; }
      // Keyed, so a language switch translates the message too
      const key = REFS_ERRORS[m.error] || 'cv.refs.wrong';
      passErr.setAttribute('data-i18n', key);
      passErr.textContent = t()[key];
      passInput.select();
    } else if (m.type === 'key' && m.key === 'Escape') {
      escape();
    }
  });

  // The frame follows the site's language: applyLang() rewrites <html lang>
  new MutationObserver(() => send({ type: 'lang', lang: currentLang }))
    .observe(root, { attributes: true, attributeFilter: ['lang'] });

  // The close animation under way, if any
  let closing = null;

  function cancelClose() {
    if (!closing) return;
    clearTimeout(closing.timer);
    stage.removeEventListener('animationend', closing.onEnd);
    closing = null;
    dialog.classList.remove('cv-dialog--closing');
  }

  function open() {
    warm();
    cancelClose();
    if (!dialog.open) {
      root.classList.add('cv-open');
      dialog.showModal();
    }
    // An entry of its own, so the back button closes the CV instead of leaving the site
    if (!(history.state && history.state.cv)) history.pushState({ cv: true }, '');
  }

  // Tidied up here rather than on the close event, which a hidden page may
  // only dispatch much later: the page behind must not stay locked
  function finish() {
    cancelClose();
    showPass(false);
    root.classList.remove('cv-open');
    dialog.close();
  }

  function hide() {
    if (!dialog.open || closing) return;
    // No animation under reduced motion: animationend would never come
    if (prefersReducedMotion) { finish(); return; }
    // The timer covers an animation that never runs, in a background tab say
    closing = { onEnd: e => { if (e.animationName === 'terminalOut') finish(); }, timer: setTimeout(finish, 400) };
    stage.addEventListener('animationend', closing.onEnd);
    dialog.classList.add('cv-dialog--closing');
  }

  // Through history while the CV's entry is current, so the close button and
  // the back button leave the same history behind
  const close = () => (history.state && history.state.cv ? history.back() : hide());
  addEventListener('popstate', () => { if (!(history.state && history.state.cv)) hide(); });
  // A window narrowed to a phone's width, the CV open: the sheet would no
  // longer fit beside its controls. Width only: a keyboard taking half of a
  // tablet's height must not close it in the middle of the passphrase.
  matchMedia('(max-width: 599.98px)').addEventListener('change', e => { if (e.matches && dialog.open) close(); });
  // A reload keeps the entry's state: dropped, or closing would leave the page
  if (history.state && history.state.cv) history.replaceState(null, '');

  // Closed by the browser itself (a repeated Escape, say): tidy up and drop
  // the history entry too
  dialog.addEventListener('close', () => {
    if (!root.classList.contains('cv-open')) return;
    cancelClose();
    showPass(false);
    root.classList.remove('cv-open');
    if (history.state && history.state.cv) history.back();
  });
  dialog.addEventListener('cancel', e => { e.preventDefault(); escape(); });
  // A click on the blur around the sheet
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
  document.getElementById('cvClose').addEventListener('click', close);

  // Escape: the passphrase field first, then the dialog
  function escape() {
    if (!pass.hidden) { showPass(false); refsBtn.focus(); } else close();
  }

  function print() {
    if (IOS) { window.open(`${cvUrl()}&print=1`, '_blank', 'noopener'); return; }
    if (!ready) return;   // a blank frame would print a blank page
    // Same origin: the frame's own print(). A file:// copy refuses that, and
    // gets the request as a message instead.
    try { frame.contentWindow.focus(); frame.contentWindow.print(); }
    catch (e) { send({ type: 'print' }); }
  }
  document.getElementById('cvPrint').addEventListener('click', print);

  // Escape, and ⌘P / Ctrl+P printing the CV rather than the page. Inside the
  // sheet, cv.js prints the frame itself and sends Escape here.
  document.addEventListener('keydown', e => {
    if (!dialog.open) return;
    if (e.key === 'Escape') { e.preventDefault(); escape(); }
    else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); print(); }
  });

  document.getElementById('cvLang').addEventListener('click', () => document.getElementById('langToggle').click());

  // References: the passphrase in a field of ours (a prompt() is blocked in
  // some embedded browsers), the frame decrypts and shows them; once
  // decrypted, the button only shows or hides the list
  function showPass(on) {
    pass.hidden = !on;
    refsBtn.setAttribute('aria-expanded', String(on));
    passErr.textContent = '';
    passErr.removeAttribute('data-i18n');
    if (on) passInput.focus();
    else passInput.value = '';
  }

  refsBtn.addEventListener('click', () => {
    if (!ready) return;
    if (refsState === 'locked') showPass(pass.hidden);
    else send({ type: 'refs' });
  });

  pass.addEventListener('submit', e => {
    e.preventDefault();
    if (passInput.value) send({ type: 'unlock', passphrase: passInput.value });
  });

  document.querySelectorAll('[data-cv-link]:not([data-cv-tab])').forEach(a => {
    a.addEventListener('pointerenter', warm);
    a.addEventListener('focus', warm);
    a.addEventListener('click', e => {
      // A new tab or window stays one, and a phone follows the link
      if (!plainClick(e) || PHONE.matches) return;
      e.preventDefault();
      open();
    });
  });
})();
