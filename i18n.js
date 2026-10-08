// Queried once here and reused by scroll.js, which loads after this file
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Whole months from a to b, the one formula every duration on the site uses
const monthsBetween = (a, b) => (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();

// The site and the CV inside its dialog talk through postMessage. A file://
// page has an opaque origin no target can name (Chrome still reports
// "file://"), so messages then go to any.
const MSG_ORIGIN = location.protocol === 'file:' ? '*' : location.origin;

// A click that asks for nothing else: no new tab or window
const plainClick = e => !(e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);

// ─── Dynamic duration for current job ────────────────────────────────────────
const CURRENT_JOB_START = new Date(2024, 1); // February 2024
const currentJobMonths = () => monthsBetween(CURRENT_JOB_START, new Date());

function currentJobDuration(lang) {
  const total  = currentJobMonths();
  const years  = Math.floor(total / 12);
  const months = total % 12;

  if (lang === 'fr') {
    const y = years  > 0 ? `${years} an${years  > 1 ? 's' : ''}` : '';
    const m = months > 0 ? `${months} mois` : '';
    return [y, m].filter(Boolean).join(' ') || 'moins d\'un mois';
  } else {
    const y = years  > 0 ? `${years} yr${years  > 1 ? 's' : ''}` : '';
    const m = months > 0 ? `${months} mo${months > 1 ? 's' : ''}` : '';
    return [y, m].filter(Boolean).join(' ') || 'less than a month';
  }
}

// ─── Language state ───────────────────────────────────────────────────────────
// Priority: ?lang= in the address → the stored language → browser language →
// 'fr'. A link with ?lang=en asks for that language explicitly, whatever the
// toggle remembered from an earlier visit. applyLang() stores whichever
// applies, so the CV, privacy and error pages open in the same one.
function storedLang() {
  try {
    const s = localStorage.getItem('lang');
    if (s === 'fr' || s === 'en') return s;
  } catch(e) {}
  return null;
}

let currentLang = (function(){
  var wanted = new URLSearchParams(location.search).get('lang');
  if (wanted === 'fr' || wanted === 'en') return wanted;
  var nav = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  return storedLang() || (nav.toLowerCase().indexOf('en') === 0 ? 'en' : 'fr');
})();

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  fr: {
    'hero.role':           'Développeur Data & IA',
    'hero.location':       'Montréal, Canada',
    'hero.title': 'développeur data & IA',
    'hero.city.prep': 'à',
    'hero.city': 'Montréal',
    'hero.pitch': 'Je conçois des infrastructures de données **fiables**\u00a0et\u00a0**gouvernées**, de leur source jusqu\'aux agents IA.',
    'hero.gov': 'Qualité & gouvernance',
    'hero.gov.desc': 'tests, accès, masquage, audit — à chaque étape',
    'hero.stack.aria': 'Ma stack, de la source à l\'IA',
    'hero.stack.store': 'Stockage',
    'hero.stack.viz': 'Visualisation',
    'hero.stack.ai': 'IA',
    'hero.stack.d1': 'Collecter chaque source',
    'hero.stack.d2': 'Centraliser les données',
    'hero.stack.d3': 'Nettoyer et modéliser',
    'hero.stack.d4': 'Automatiser les flux',
    'hero.stack.d5': 'Piloter l\'activité',
    'hero.stack.d6': 'Ouvrir les données aux agents',
    'links.cv':           'CV imprimable',
    'links.cv.short':     'Voir le CV',

    // Nav and the phone tab bar's short labels
    'nav.about':    'À propos',
    'nav.exp':      'Expérience',
    'nav.skills':   'Compétences',
    'nav.projects': 'Projets',
    'nav.contact':  'Contact',
    'nav.home': 'Accueil',
    'nav.about.short': 'Profil',
    'nav.exp.short': 'Parcours',
    'nav.skills.short': 'Stack',
    'nav.projects.short': 'Projets',
    'aria.lang': 'FR | EN — changer de langue',
    'aria.theme': 'Basculer le thème clair / sombre',

    // About
    'about.title':    'À propos',
    'about.label': 'Mon métier',
    'about.p1': 'Concrètement\u00a0: collecter les sources, automatiser les pipelines, modéliser l\'entrepôt avec les équipes métier et livrer les tableaux de bord qui pilotent l\'activité. Et désormais, brancher les agents IA sur ces données sans jamais exposer d\'information sensible.',
    'about.p2': 'Du conseil à l\'entreprise, dans la santé, le transport, le logement social et l\'e-commerce. Ce qui ne change pas\u00a0: travailler au plus près des métiers pour transformer des données brutes en décisions.',
    'about.drives.title': 'Ce qui m\'anime',
    'about.drives.1': 'Des plateformes pensées comme un tout, pas brique par brique',
    'about.drives.2': 'Des données dignes de confiance\u00a0: testées, documentées, traçables',
    'about.drives.3': 'Des agents IA qui mettent les données à la portée de toute l\'équipe',
    'about.drives.cta': 'Ces sujets vous parlent\u00a0? Échangeons',

    // Experience
    'exp.title':        'Expérience',
    'exp.sub': 'Trois employeurs, cinq rôles, de Paris à Montréal.',
    'exp.skills.key': 'Compétences clés',
    'exp.did': 'Ce que j\'ai fait',
    'exp.tabs.aria': 'Postes',
    'chrono.title': 'Chronologie',
    'chrono.work': 'Travail',
    'chrono.study': 'Études',
    'chrono.now': 'auj.',
    'chrono.sr': 'Études de 2016 à 2021\u00a0; stage au Park Hyatt en 2018\u00a0; BIAL-R de 2020 à 2023, chez APRR, Clariane puis Bial-S\u00a0; Laps depuis 2024.',
    'exp.bialr.group': 'Conseil en data · 2020 — 2023',
    'edu.miage.city': 'Lyon, France',
    'edu.uqac.city': 'Chicoutimi, Québec',
    'edu.dut.city': 'Vélizy, France',
    'exp.laps.about': 'Réseau e-commerce de matériel de golf\u00a0: conception et mise en place de toute son infrastructure de données.',
    'exp.laps.sector': 'e-commerce',
    'exp.bialr1.about': 'Mission de conseil\u00a0: industrialisation d\'une plateforme décisionnelle cloud pour des Offices Publics de l\'Habitat, et pilotage du centre de services de Clariane.',
    'exp.bialr2.about': 'Mission de conseil chez un grand groupe de santé\u00a0: référent de l\'ensemble de ses flux inter-applicatifs.',
    'exp.bialr3.about': 'Alternance de dernière année de master chez un opérateur autoroutier\u00a0: toute la chaîne décisionnelle.',
    'exp.hyatt.about': 'Stage de fin de DUT au service informatique d\'un palace parisien.',
    'exp.hyatt.sector': 'hôtellerie',
    'contract.permanent': 'CDI',
    'contract.alternance':'Alternance',
    'contract.stage':     'Stage',

    'exp.laps.role':    'Développeur Data & IA',
    'exp.laps.start':   'Févr. 2024',
    'exp.laps.end':     "Aujourd'hui",
    'exp.laps.desc':    'Conception et mise en place de l\'ensemble de l\'infrastructure de données de Laps, réseau e-commerce spécialisé dans le matériel de golf, depuis l\'ingestion et le traitement jusqu\'à la valorisation des données via des rapports stratégiques et opérationnels et leur exposition aux agents IA (serveur MCP). Participation au développement d\'un système automatisé de gestion des prix d\'achat et de vente, renforçant les marges et la compétitivité de l\'entreprise.',
    'exp.laps.li1':     'Conception, déploiement et automatisation de flux de données en Python sur AWS',
    'exp.laps.li2':     'Modélisation et implémentation d\'un entrepôt de données centralisé',
    'exp.laps.li3':     'Développement de rapports et tableaux de bord opérationnels avec Grafana',
    'exp.laps.li4':     'Développement d\'un serveur MCP en Python connectant l\'entrepôt aux agents IA, gouverné et sécurisé',

    'exp.bialr.start':   'Sept. 2020',
    'exp.bialr.end':     'Déc. 2023',
    'exp.bialr1.role':   'Développeur Data',
    'exp.bialr1.start':  'Janv. 2023',
    'exp.bialr1.end':    'Déc. 2023',
    'exp.bialr1.meta':   '1 an',
    'exp.bialr1.client': 'Bial-S',
    'exp.bialr1.desc':   'Participation à l\'industrialisation d\'une plateforme décisionnelle Cloud automatisée sur AWS, permettant l\'ingestion, la visualisation et l\'analyse prédictive de données pour des Offices Publics de l\'Habitat.',
    'exp.bialr1.desc2':  'Parallèlement, pilotage d\'un centre de services MCO pour Clariane.',
    'exp.bialr1.li1':    'Conception, déploiement et automatisation de flux de données ETL avec Pentaho',
    'exp.bialr1.li2':    'Support transversal de la plateforme décisionnelle et intégration de nouveaux clients',
    'exp.bialr1.li3':    'Pilotage du CDS : gestion d\'équipe, coordination des activités et amélioration continue',
    'exp.bialr1.sector': 'logement social',
    'exp.bialr2.role':   'Consultant ETL',
    'exp.bialr2.start':  'Sept. 2021',
    'exp.bialr2.end':    'Déc. 2022',
    'exp.bialr2.meta':   '1 an 4 mois',
    'exp.bialr2.client': 'Clariane',
    'exp.bialr2.desc':   'Référent MCO de l\'ensemble des flux inter-applicatifs de Clariane, couvrant les domaines finance, RH, santé et relation client.',
    'exp.bialr2.li1':    'Développement et maintenance des flux inter-applicatifs avec Pentaho',
    'exp.bialr2.li2':    'Gestion des incidents de production : analyse, correction et reprise de données',
    'exp.bialr2.li3':    'Contribution à la migration des flux inter-applicatifs de Pentaho vers un ESB',
    'exp.bialr2.sector': 'santé',
    'exp.bialr3.role':   'Consultant Data',
    'exp.bialr3.start':  'Sept. 2020',
    'exp.bialr3.end':    'Août 2021',
    'exp.bialr3.meta':   '1 an',
    'exp.hyatt.meta': '3 mois',
    'exp.bialr3.client': 'APRR',
    'exp.bialr3.desc':   'Alternance en dernière année de Master MIAGE, principalement réalisée sur des missions pour le client Autoroutes Paris-Rhin-Rhône (APRR) dans les domaines finance, péage, autoroute et relation clientèle. Cette expérience m\'a permis de monter en compétences sur l\'ensemble de la chaîne décisionnelle.',
    'exp.bialr3.li1':    'Cartographie et mise en place d\'une gouvernance des données',
    'exp.bialr3.li2':    'Développement et déploiement de rapports opérationnels',
    'exp.bialr3.li3':    'Conception et maintenance de flux ETL avec Pentaho',
    'exp.bialr3.sector': 'autoroutes',
    'exp.hyatt.role':    'Technicien Support IT',
    'exp.hyatt.start':   'Avr. 2018',
    'exp.hyatt.end':     'Juill. 2018',
    'exp.hyatt.desc':    'Stage de fin de DUT au sein du service informatique d\'un palace parisien.',
    'exp.hyatt.li1':     'Maintenance et support du parc informatique (poste de travail, réseaux, serveurs)',
    'exp.hyatt.li2':     'Participation au déploiement de nouveaux projets IT',
    'exp.hyatt.li3':     'Contribution à la mise en place et au suivi des mesures de cybersécurité',

    // Skills
    'skills.title':        'Compétences',
    'skills.filter':       'Expériences avec',
    'skills.tools':        'outils',
    'skills.level.expert': 'Expertise',
    'skills.level.mid':    'Maîtrise',
    'skills.level.basic':  'Notions',
    'skills.dataeng':      'Data engineering',
    'skills.lang':         'Langages',
    'skills.cloud':        'Cloud',
    'skills.db':           'Bases de données',
    'skills.bi':           'BI & dataviz',
    'skills.devops':       'DevOps & IaC',
    'skills.pm':           'Gestion de projet',
    // Names of the CV rows that pair two categories (CV_SKILL_ROWS, cv.js)
    'cv.skills.lang':      'Langages',
    'cv.skills.devops':    'DevOps & méthodes',
    'skill.dwh':           'Modélisation de données',
    'skill.governance':    'Gouvernance des données',
    'skill.dwh.short': 'Modélisation',
    'skill.governance.short': 'Gouvernance',
    'skill.ai':            'IA',
    'skills.languages':    'Langues',
    'soft.title': 'Savoir-être',
    'soft.lead.t': 'Pilotage d\'équipe',
    'soft.lead.d': 'Le centre de services de Clariane, mené de front avec une mission technique.',
    'soft.business.t': 'Dialogue avec les métiers',
    'soft.business.d': 'Traduire les questions de la finance, du péage ou de la relation client en indicateurs et en rapports utiles.',
    'soft.e2e.t': 'Vision d\'ensemble',
    'soft.e2e.d': 'Chaque choix fait avec la suite en tête\u00a0: ce qu\'on ingère aujourd\'hui décide de ce qu\'on pourra analyser demain.',
    'lang.french':         'Français',
    'lang.french.level':   'Natif',
    'lang.english':        'Anglais',
    'lang.english.level':  'Courant',
    'skills.hint': 'Cliquez sur une compétence pour voir où je l\'ai utilisée.',

    // Education
    'edu.title':        'Formation',
    'edu.miage.degree': 'Master Méthodes Informatiques Appliquées à la Gestion des Entreprises — MIAGE',
    'edu.miage.dates':  'Sept. 2019 – Juin 2021',
    'edu.miage.desc':   'Parcours Systèmes d\'Information de Gestion de Santé.',
    'edu.uqac.degree':  'Baccalauréat en Informatique',
    'edu.uqac.dates':   'Sept. 2018 – Juin 2019',
    'edu.uqac.desc':    'Double diplômation DUETI avec l\'Université de Versailles Saint-Quentin-en-Yvelines.',
    'edu.dut.degree':   'Diplôme Universitaire de Technologie en Informatique',
    'edu.dut.dates':    'Sept. 2016 – Juin 2018',
    'edu.miage.short': 'Master informatique de gestion',
    'edu.miage.note': 'MIAGE · Systèmes d\'information de santé',
    'edu.uqac.short': 'Baccalauréat en informatique',
    'edu.uqac.note': 'Double diplôme avec l\'UVSQ',
    'edu.dut.short': 'DUT Informatique',

    // Projects
    'projects.title':        'Projets',
    'projects.etl.meta':     'Laps · Juin – Sept. 2025 · 4 mois',
    'projects.etl.desc':     'Développement d\'un framework ETL serverless sur AWS Lambda, permettant la création de pipelines modulaires, évolutifs et économiques pour l\'automatisation des flux de données.',
    'projects.etl.title.main': 'AWS Lambda ETL',
    'projects.etl.title.sub': 'Framework de pipelines serverless',
    'projects.mcp.title.main': 'MCP Server',
    'projects.mcp.title.sub': 'Accès IA gouverné à l\'entrepôt de données',
    'projects.mcp.meta':     'Laps · Avr. – Juin 2026 · 3 mois',
    'projects.mcp.desc':     'Développement d\'un serveur MCP en Python (FastMCP) donnant aux agents IA un accès gouverné à l\'entrepôt de données de Laps : requêtes en lecture seule validées (liste blanche de tables, limites et délais imposés), masquage automatique des données personnelles et journal d\'audit complet.',
    'projects.mcp.pitch':    'Les équipes posent leurs questions en langage naturel à leur agent IA, qui interroge l\'entrepôt sans jamais voir de donnée sensible ni pouvoir y écrire.',
    'projects.badge.pro':    'Professionnel',
    'projects.copill.title.main': 'CoPill',
    'projects.copill.title.sub': 'Pilulier connecté',
    'projects.swarm.title.main': 'Swarm Debugging',
    'projects.swarm.title.sub': 'Migration d\'API vers GraphQL',
    'projects.badge.academic':'Académique',
    'projects.featured': 'Projet phare',
    'projects.private': 'Code privé',
    'projects.academic.title': 'Projets académiques',
    'projects.copill.short': 'Pilulier connecté\u00a0: Raspberry Pi et application Android. UCBL, 2020.',
    'projects.swarm.short': 'Migration d\'une API REST vers GraphQL. UQAC, 2019.',

    // Misc
    'misc.title':        'Centres d\'intérêt',
    'misc.tt.title':     'Tennis de table',
    'misc.tt.desc':      'Activité pratiquée pendant plus de 10 ans en club.',
    'misc.travel.title': 'Voyages',
    'misc.travel.desc':  'Déjà 18 pays explorés, et bien d\'autres à venir.',
    // The site splits the sentence around its easter egg, the CV keeps it whole
    'misc.travel.pre':   'Déjà',
    'misc.travel.count': '18 pays explorés',
    'misc.travel.post':  ', et bien d\'autres à venir.',
    'travel.title':      'Carnet de voyage',
    'travel.sub':        'Choisissez un pays pour le trouver sur le globe, ou faites-le tourner.',
    'travel.close':      'Fermer',
    'travel.countries':  'pays sur 195',
    'travel.continents': 'continents sur 6',
    'travel.next':       'à venir',
    'travel.locked':     'À débloquer',
    'travel.zone.eu':    'Europe',
    'travel.zone.na':    'Amérique du Nord',
    'travel.zone.sa':    'Amérique du Sud',
    'travel.zone.af':    'Afrique',
    'travel.zone.as':    'Asie',
    'travel.zone.oc':    'Océanie',
    'misc.nature.title': 'Nature',
    'misc.nature.desc':  'Ski, randonnée, trek, camping\u00a0: tout ce qui se passe dehors.',

    // Contact
    'contact.title':               'Contact',
    'contact.name.label':          'Nom',
    'contact.name.placeholder':    'Votre nom',
    'contact.email.label':         'Email',
    'contact.email.placeholder':   'votre@email.com',
    'contact.message.label':       'Message',
    'contact.message.placeholder': 'Votre message…',
    'contact.submit':              'Envoyer',
    'contact.success':             'Message envoyé\u00a0! Je vous répondrai dès que possible.',
    'contact.invalid':             'Merci de remplir les champs signalés, avec un email valide.',
    'contact.error':               'Une erreur est survenue. Veuillez réessayer ou m\'écrire directement.',
    'contact.sub': 'Une question, un projet, une idée\u00a0?',
    'contact.pref': 'Mon moyen de contact préféré · réponse sous 24\u00a0h',
    'contact.direct': 'Écrire directement',
    'contact.copy': 'Copier',
    'contact.copied': 'Copié',
    'contact.phone': 'Téléphone',
    'contact.form.title': 'Laisser un message',

    // Footer & aria
    'footer.backtotop':    'Retour en haut',
    'footer.privacy':      'Confidentialité',
    'a11y.skip':           'Aller au contenu',
    'projects.github.label': 'Voir sur GitHub',
    'aria.socials.footer': 'Réseaux sociaux — pied de page',
    'aria.terminal':       'Ouvrir le terminal',
    'aria.terminal.hint':  'Ouvrir le terminal — touche $ ou `',
    'aria.terminal.close': 'Fermer le terminal',
    'aria.terminal.min':   'Réduire le terminal',
    'aria.terminal.max':   'Agrandir le terminal',
    'aria.terminal.input': 'Commande',

    // CV print view
    'cv.back':  'Retour au site',
    'cv.print': 'Imprimer',
    'cv.pdf':   'Télécharger le PDF',
    // The PDFs printed by scripts/cv-pdf.sh, also the name a print saves
    // under. English says "resume": in North America a CV is the long
    // academic document.
    'cv.pdf.file': 'assets/cv/Alexis-Colin-CV.pdf',
    'cv.dialog': 'CV d\'Alexis Colin',
    'cv.close':  'Fermer le CV',
    'cv.tools':  'Actions du CV',
    'cv.newtab': 'Nouvel onglet',
    'cv.laps.duration':  currentJobDuration('fr'),
    'cv.bialr.duration': '3 ans 4 mois',
    // Employer first, then the client, in one string: under a job title,
    // "chez Bial-S" reads to an ATS as the employer, and BIAL-R gets lost.
    'cv.bialr1.org': 'BIAL-R · client : Bial-S',
    'cv.bialr2.org': 'BIAL-R · client : Clariane',
    'cv.bialr3.org': 'BIAL-R · client : APRR',
    'cv.tagline':   'De leur source jusqu\'aux agents IA\u00a0: des données fiables, gouvernées, dignes de confiance',
    'cv.refs.title': 'Références',
    // Names and personal contact details stay out of a public repository;
    // the nominative version goes in the copy shared privately.
    'cv.refs.body':  'Disponibles sur demande.',
    'cv.refs.unlock': 'Références',
    'cv.refs.lock':   'Verrouiller',
    'cv.refs.prompt': 'Phrase de passe des références',
    'cv.refs.placeholder': 'Phrase de passe',
    'cv.refs.go': 'Déverrouiller',
    'cv.refs.wrong':  'Phrase de passe incorrecte.',
    'cv.refs.absent': 'Aucun fichier de références chiffré n\'a été trouvé.',
    'cv.refs.local':  'Ouvert en file://, le navigateur bloque les références : passez par un serveur local.',
  },

  en: {
    'hero.role':           'Data & AI Engineer',
    'hero.location':       'Montreal, Canada',
    'hero.title': 'data & AI engineer',
    'hero.city.prep': 'in',
    'hero.city': 'Montreal',
    'hero.pitch': 'I design **reliable**,\u00a0**governed** data infrastructure, from the source all the way to AI agents.',
    'hero.gov': 'Quality & governance',
    'hero.gov.desc': 'tests, access, masking, audit — at every step',
    'hero.stack.aria': 'My stack, from source to AI',
    'hero.stack.store': 'Storage',
    'hero.stack.viz': 'Visualization',
    'hero.stack.ai': 'AI',
    'hero.stack.d1': 'Pull in every source',
    'hero.stack.d2': 'Centralize the data',
    'hero.stack.d3': 'Clean and model',
    'hero.stack.d4': 'Automate the flows',
    'hero.stack.d5': 'Steer the business',
    'hero.stack.d6': 'Open the data to agents',
    'links.cv':           'Printable CV',
    'links.cv.short':     'View CV',

    // Nav and the phone tab bar's short labels
    'nav.about':    'About',
    'nav.exp':      'Experience',
    'nav.skills':   'Skills',
    'nav.projects': 'Projects',
    'nav.contact':  'Contact',
    'nav.home': 'Home',
    'nav.about.short': 'About',
    'nav.exp.short': 'Career',
    'nav.skills.short': 'Stack',
    'nav.projects.short': 'Projects',
    'aria.lang': 'FR | EN — switch language',
    'aria.theme': 'Toggle light / dark theme',

    // About
    'about.title':    'About',
    'about.label': 'What I do',
    'about.p1': 'In practice: pulling in the sources, automating the pipelines, modeling the warehouse with business teams and shipping the dashboards that steer the business. And now, plugging AI agents into that data without ever exposing sensitive information.',
    'about.p2': 'From consulting to in-house roles, across healthcare, transportation, social housing and e-commerce. What hasn\'t changed: working closely with business teams to turn raw data into decisions.',
    'about.drives.title': 'What drives me',
    'about.drives.1': 'Platforms designed as a whole, not piece by piece',
    'about.drives.2': 'Trustworthy data: tested, documented, traceable',
    'about.drives.3': 'AI agents that put the data within the whole team\'s reach',
    'about.drives.cta': 'Into these topics too? Let\'s talk',

    // Experience
    'exp.title':        'Experience',
    'exp.sub': 'Three employers, five roles, from Paris to Montreal.',
    'exp.skills.key': 'Key skills',
    'exp.did': 'What I did',
    'exp.tabs.aria': 'Positions',
    'chrono.title': 'Timeline',
    'chrono.work': 'Work',
    'chrono.study': 'Studies',
    'chrono.now': 'now',
    'chrono.sr': 'Studies from 2016 to 2021; Park Hyatt internship in 2018; BIAL-R from 2020 to 2023, at APRR, Clariane then Bial-S; Laps since 2024.',
    'exp.bialr.group': 'Data consulting · 2020 — 2023',
    'edu.miage.city': 'Lyon, France',
    'edu.uqac.city': 'Chicoutimi, Quebec',
    'edu.dut.city': 'Vélizy, France',
    'exp.laps.about': 'E-commerce network for golf equipment: designed and built its entire data infrastructure.',
    'exp.laps.sector': 'e-commerce',
    'exp.bialr1.about': 'Consulting assignment: industrialized a cloud BI platform for public housing offices, and ran Clariane\'s service center.',
    'exp.bialr2.about': 'Consulting assignment at a major healthcare group: lead for all its inter-application data flows.',
    'exp.bialr3.about': 'Final-year Master\'s work-study at a highway operator: the whole BI chain.',
    'exp.hyatt.about': 'Final-year DUT internship in the IT department of a Paris palace hotel.',
    'exp.hyatt.sector': 'hospitality',
    'contract.permanent': 'Full-time',
    'contract.alternance':'Apprenticeship',
    'contract.stage':     'Internship',

    'exp.laps.role':    'Data & AI Engineer',
    'exp.laps.start':   'Feb. 2024',
    'exp.laps.end':     'Present',
    'exp.laps.desc':    'Designed and implemented the entire data infrastructure for Laps, an e-commerce network specialized in golf equipment, covering everything from data ingestion and processing to value creation through strategic and operational reporting and data exposure to AI agents (MCP server). Contributed to the development of an automated pricing system for purchase and sales, strengthening the company\'s margins and competitiveness.',
    'exp.laps.li1':     'Designed, deployed, and automated data pipelines in Python on AWS',
    'exp.laps.li2':     'Modeled and implemented a centralized data warehouse',
    'exp.laps.li3':     'Developed operational reports and dashboards with Grafana',
    'exp.laps.li4':     'Built a governed, secure Python MCP server connecting the warehouse to AI agents',

    'exp.bialr.start':   'Sep. 2020',
    'exp.bialr.end':     'Dec. 2023',
    'exp.bialr1.role':   'Data Engineer',
    'exp.bialr1.start':  'Jan. 2023',
    'exp.bialr1.end':    'Dec. 2023',
    'exp.bialr1.meta':   '1 yr',
    'exp.bialr1.client': 'Bial-S',
    'exp.bialr1.desc':   'Contributed to the industrialization of an automated cloud-based data platform on AWS, enabling data ingestion, visualization, and predictive analytics for Public Housing Offices.',
    'exp.bialr1.desc2':  'Alongside, led an Operations & Support service center for Clariane.',
    'exp.bialr1.li1':    'Designed, deployed, and automated ETL data pipelines with Pentaho',
    'exp.bialr1.li2':    'Provided cross-functional support for the data platform and integrated new clients',
    'exp.bialr1.li3':    'Led the service center: team management, coordination, and continuous improvement',
    'exp.bialr1.sector': 'social housing',
    'exp.bialr2.role':   'ETL Consultant',
    'exp.bialr2.start':  'Sep. 2021',
    'exp.bialr2.end':    'Dec. 2022',
    'exp.bialr2.meta':   '1 yr 4 mos',
    'exp.bialr2.client': 'Clariane',
    'exp.bialr2.desc':   'Technical lead within the Operations & Support team, responsible for all inter-application data flows at Clariane across finance, HR, healthcare, and customer relations domains.',
    'exp.bialr2.li1':    'Developed and maintained inter-application data flows with Pentaho',
    'exp.bialr2.li2':    'Managed production incidents: analysis, troubleshooting, and data recovery',
    'exp.bialr2.li3':    'Contributed to the migration of inter-application data flows from Pentaho to an ESB',
    'exp.bialr2.sector': 'healthcare',
    'exp.bialr3.role':   'Data Engineer Trainee',
    'exp.bialr3.start':  'Sep. 2020',
    'exp.bialr3.end':    'Aug. 2021',
    'exp.bialr3.meta':   '1 yr',
    'exp.hyatt.meta': '3 mos',
    'exp.bialr3.client': 'APRR',
    'exp.bialr3.desc':   'Master\'s work-study (final year of MIAGE program), primarily focused on projects for Autoroutes Paris-Rhin-Rhône (APRR) in finance, toll operations, highway management, and customer relations. This experience allowed me to develop skills across the entire business intelligence information system.',
    'exp.bialr3.li1':    'Mapped and implemented data governance processes',
    'exp.bialr3.li2':    'Developed and deployed operational reports',
    'exp.bialr3.li3':    'Designed and maintained ETL data flows using Pentaho',
    'exp.bialr3.sector': 'highways',
    'exp.hyatt.role':    'IT Support Trainee',
    'exp.hyatt.start':   'Apr. 2018',
    'exp.hyatt.end':     'Jul. 2018',
    'exp.hyatt.desc':    'Final-year DUT internship within the IT department of a luxury hotel in Paris.',
    'exp.hyatt.li1':     'Maintained and supported IT infrastructure (workstations, networks, servers)',
    'exp.hyatt.li2':     'Participated in the deployment of new IT projects',
    'exp.hyatt.li3':     'Assisted in implementing and monitoring cybersecurity measures',

    // Skills
    'skills.title':        'Skills',
    'skills.filter':       'Experiences with',
    'skills.tools':        'tools',
    'skills.level.expert': 'Expert',
    'skills.level.mid':    'Proficient',
    'skills.level.basic':  'Familiar',
    'skills.dataeng':      'Data Engineering',
    'skills.lang':         'Programming Languages',
    'skills.cloud':        'Cloud',
    'skills.db':           'Databases',
    'skills.bi':           'BI & Data Visualization',
    'skills.devops':       'DevOps & IaC',
    'skills.pm':           'Project Management',
    'cv.skills.lang':      'Languages',
    'cv.skills.devops':    'DevOps & Methods',
    'skill.dwh':           'Data Warehouse Modeling',
    'skill.governance':    'Data Governance',
    'skill.dwh.short': 'Data Modeling',
    'skill.governance.short': 'Data Governance',
    'skill.ai':            'AI',
    'skills.languages':    'Languages',
    'soft.title': 'Soft skills',
    'soft.lead.t': 'Team leadership',
    'soft.lead.d': 'Ran Clariane\'s service center while delivering a technical assignment.',
    'soft.business.t': 'Business partnering',
    'soft.business.d': 'Turning questions from finance, tolls or customer relations into useful metrics and reports.',
    'soft.e2e.t': 'Big-picture thinking',
    'soft.e2e.d': 'Every choice made with what comes next in mind: what you ingest today decides what you can analyze tomorrow.',
    'lang.french':         'French',
    'lang.french.level':   'Native',
    'lang.english':        'English',
    'lang.english.level':  'Fluent',
    'skills.hint': 'Click a skill to see where I used it.',

    // Education
    'edu.title':        'Education',
    'edu.miage.degree': "Master's degree in Computer Science Applied to Business Management — MIAGE",
    'edu.miage.dates':  'Sep. 2019 – Jun. 2021',
    'edu.miage.desc':   'Specialization in Health Management Information Systems.',
    'edu.uqac.degree':  "Bachelor's degree in Computer Science",
    'edu.uqac.dates':   'Sep. 2018 – Jun. 2019',
    'edu.uqac.desc':    'Dual degree (DUETI) in collaboration with the University of Versailles Saint-Quentin-en-Yvelines.',
    'edu.dut.degree':   "Associate's degree in Computer Science",
    'edu.dut.dates':    'Sep. 2016 – Jun. 2018',
    'edu.miage.short': 'Master\'s in Information Systems',
    'edu.miage.note': 'MIAGE · Healthcare information systems',
    'edu.uqac.short': 'B.Sc. Computer Science',
    'edu.uqac.note': 'Dual degree with UVSQ',
    'edu.dut.short': 'Technical degree, CS',

    // Projects
    'projects.title':        'Projects',
    'projects.etl.meta':     'Laps · Jun. – Sep. 2025 · 4 mos',
    'projects.etl.desc':     'Developed a serverless ETL framework on AWS Lambda, enabling the creation of modular, scalable, and cost-effective pipelines for automated data workflows.',
    'projects.etl.title.main': 'AWS Lambda ETL',
    'projects.etl.title.sub': 'Serverless Pipeline Framework',
    'projects.mcp.title.main': 'MCP Server',
    'projects.mcp.title.sub': 'Governed AI access to the data warehouse',
    'projects.mcp.meta':     'Laps · Apr. – Jun. 2026 · 3 mos',
    'projects.mcp.desc':     'Built a Python MCP server (FastMCP) giving AI agents governed access to the Laps data warehouse: validated read-only queries (table whitelist, enforced limits and timeouts), automatic masking of personal data, and a full audit log.',
    'projects.mcp.pitch':    'Teams ask their AI agent questions in plain language; it queries the warehouse without ever seeing sensitive data or being able to write to it.',
    'projects.badge.pro':    'Professional',
    'projects.copill.title.main': 'CoPill',
    'projects.copill.title.sub': 'Connected Pillbox',
    'projects.swarm.title.main': 'Swarm Debugging',
    'projects.swarm.title.sub': 'API Migration to GraphQL',
    'projects.badge.academic':'Academic',
    'projects.featured': 'Featured project',
    'projects.private': 'Private code',
    'projects.academic.title': 'Academic projects',
    'projects.copill.short': 'Connected pillbox: Raspberry Pi and Android app. UCBL, 2020.',
    'projects.swarm.short': 'REST to GraphQL API migration. UQAC, 2019.',

    // Misc
    'misc.title':        'Interests',
    'misc.tt.title':     'Table Tennis',
    'misc.tt.desc':      'Played for over 10 years in a club.',
    'misc.travel.title': 'Travel',
    'misc.travel.desc':  'Visited 18 countries so far — with many more to come.',
    'misc.travel.pre':   'Visited',
    'misc.travel.count': '18 countries',
    'misc.travel.post':  ' so far — with many more to come.',
    'travel.title':      'Travel log',
    'travel.sub':        'Pick a country to find it on the globe, or give it a spin.',
    'travel.close':      'Close',
    'travel.countries':  'countries out of 195',
    'travel.continents': 'continents out of 6',
    'travel.next':       'coming up',
    'travel.locked':     'To unlock',
    'travel.zone.eu':    'Europe',
    'travel.zone.na':    'North America',
    'travel.zone.sa':    'South America',
    'travel.zone.af':    'Africa',
    'travel.zone.as':    'Asia',
    'travel.zone.oc':    'Oceania',
    'misc.nature.title': 'Outdoors',
    'misc.nature.desc':  'Skiing, hiking, trekking, camping: anything that happens outside.',

    // Contact
    'contact.title':               'Contact',
    'contact.name.label':          'Name',
    'contact.name.placeholder':    'Your name',
    'contact.email.label':         'Email',
    'contact.email.placeholder':   'your@email.com',
    'contact.message.label':       'Message',
    'contact.message.placeholder': 'Your message…',
    'contact.submit':              'Send',
    'contact.success':             'Message sent! I\'ll get back to you as soon as possible.',
    'contact.invalid':             'Please fill in the highlighted fields, with a valid email.',
    'contact.error':               'Something went wrong. Please try again or reach out directly.',
    'contact.sub': 'A question, a project, an idea?',
    'contact.pref': 'My preferred channel · I reply within 24 hours',
    'contact.direct': 'Write directly',
    'contact.copy': 'Copy',
    'contact.copied': 'Copied',
    'contact.phone': 'Phone',
    'contact.form.title': 'Leave a message',

    // Footer & aria
    'footer.backtotop':    'Back to top',
    'footer.privacy':      'Privacy',
    'a11y.skip':           'Skip to content',
    'projects.github.label': 'View on GitHub',
    'aria.socials.footer': 'Social links — footer',
    'aria.terminal':       'Open the terminal',
    'aria.terminal.hint':  'Open the terminal — press $ or `',
    'aria.terminal.close': 'Close the terminal',
    'aria.terminal.min':   'Minimize the terminal',
    'aria.terminal.max':   'Maximize the terminal',
    'aria.terminal.input': 'Command',

    // CV print view
    'cv.back':  'Back to site',
    'cv.print': 'Print',
    'cv.pdf':   'Download PDF',
    'cv.pdf.file': 'assets/cv/Alexis-Colin-Resume.pdf',
    'cv.dialog': 'Alexis Colin\'s resume',
    'cv.close':  'Close the resume',
    'cv.tools':  'Resume actions',
    'cv.newtab': 'New tab',
    'cv.laps.duration':  currentJobDuration('en'),
    'cv.bialr.duration': '3 yrs 4 mos',
    'cv.bialr1.org': 'BIAL-R · client: Bial-S',
    'cv.bialr2.org': 'BIAL-R · client: Clariane',
    'cv.bialr3.org': 'BIAL-R · client: APRR',
    'cv.tagline':   'From their source to AI agents: data that is reliable, governed and trustworthy',
    'cv.refs.title': 'References',
    'cv.refs.body':  'Available on request.',
    'cv.refs.unlock': 'References',
    'cv.refs.lock':   'Lock',
    'cv.refs.prompt': 'References passphrase',
    'cv.refs.placeholder': 'Passphrase',
    'cv.refs.go': 'Unlock',
    'cv.refs.wrong':  'Wrong passphrase.',
    'cv.refs.absent': 'No encrypted references file was found.',
    'cv.refs.local':  'Opened from file://, the browser blocks the references: go through a local server.',
  }
};

// ─── Local preview ────────────────────────────────────────────────────────────
// Pages serves cv.html at /cv; file:// and a plain local server have no clean
// URLs, so there the internal links point at the .html files themselves.
const LOCAL_PREVIEW = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
const pageUrl = path => !LOCAL_PREVIEW ? path : path === '/' ? 'index.html' : path.slice(1) + '.html';

if (LOCAL_PREVIEW) {
  document.querySelectorAll('a[href="/"], a[href="/privacy"]').forEach(a => {
    a.setAttribute('href', pageUrl(a.getAttribute('href')));
  });
}

// ─── Apply translations ───────────────────────────────────────────────────────
// Each attribute names the translation key; the setter says where the string
// lands. data-i18n-rich turns **…** into <strong> and keeps the rest as text.
const I18N_TARGETS = [
  ['data-i18n',             (el, v) => { el.textContent = v; }],
  ['data-i18n-rich',        (el, v) => el.replaceChildren(...v.split(/\*\*(.+?)\*\*/).map((part, i) => {
    if (i % 2 === 0) return part;
    const b = document.createElement('strong');
    b.textContent = part;
    return b;
  }))],
  ['data-i18n-aria',        (el, v) => el.setAttribute('aria-label', v)],
  ['data-i18n-placeholder', (el, v) => el.setAttribute('placeholder', v)],
  ['data-i18n-title',       (el, v) => el.setAttribute('title', v)],
  ['data-i18n-href',        (el, v) => el.setAttribute('href', v)],
];

// The references' errors (decryptRefs, refs-crypto.js) and their message;
// any other one is a wrong passphrase
const REFS_ERRORS = { missing: 'cv.refs.absent', local: 'cv.refs.local' };

// Current translation table, with the fr fallback every caller wants
const t = () => translations[currentLang] || translations.fr;

function applyLang(lang) {
  const tr = translations[lang];

  I18N_TARGETS.forEach(([attr, set]) => {
    document.querySelectorAll('[' + attr + ']').forEach(el => {
      const value = tr[el.getAttribute(attr)];
      if (value !== undefined) set(el, value);
    });
  });

  // CV links — open the print view already in the right language
  document.querySelectorAll('[data-cv-link]').forEach(a => { a.href = `${pageUrl('/cv')}?lang=${lang}`; });

  // <html lang> + toggle button state
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-toggle [data-lang]').forEach(span => {
    span.classList.toggle('active', span.dataset.lang === lang);
  });

  try { localStorage.setItem('lang', lang); } catch(e) {}

  if (typeof updateSkillDurations === 'function') updateSkillDurations(lang);
}

// ─── Toggle handler ───────────────────────────────────────────────────────────
let langSwitching = false;
const FADE_MS = 130; // keep in sync with #pageWrap transition in style.css

const langToggleBtn = document.getElementById('langToggle');
if (langToggleBtn) langToggleBtn.addEventListener('click', () => {
  const next = currentLang === 'fr' ? 'en' : 'fr';

  // Reduced motion: swap instantly, no animation.
  if (prefersReducedMotion) {
    currentLang = next;
    applyLang(next);
    return;
  }

  if (langSwitching) return; // ignore clicks mid-transition
  langSwitching = true;

  // Fade the content out (CSS handles the opacity transition on #pageWrap).
  document.body.classList.add('lang-switching');

  setTimeout(() => {
    currentLang = next;
    applyLang(next);
    // Reveal on the next frame so the new content dissolves back in smoothly.
    requestAnimationFrame(() => {
      document.body.classList.remove('lang-switching');
      langSwitching = false;
    });
  }, FADE_MS);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
applyLang(currentLang);

// ?lang= is a way in, not a state: applied and stored, it leaves the address,
// so a reload, or a Back the back-forward cache missed, reads the stored
// language like any other visit. The entry keeps its state (the CV dialog's).
if (new URLSearchParams(location.search).has('lang')) {
  const url = new URL(location.href);
  url.searchParams.delete('lang');
  history.replaceState(history.state, '', url);
}

// Back from the CV page, a page can come out of the back-forward cache just as
// it was left: it follows a language switched over there in the meantime
addEventListener('pageshow', e => {
  const s = e.persisted && storedLang();
  if (s && s !== currentLang) {
    currentLang = s;
    applyLang(s);
  }
});
