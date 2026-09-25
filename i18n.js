// Queried once here and reused by scroll.js, which loads after this file
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Dynamic duration for current job ────────────────────────────────────────
const CURRENT_JOB_START = new Date(2024, 1); // February 2024
// Past roles: BIALR, Sept. 2020 – Dec. 2023 (40) + Hyatt, Apr. – July 2018 (4)
const PRIOR_EXPERIENCE_MONTHS = 40 + 4;

function currentJobMonths() {
  const now = new Date();
  return (now.getFullYear() - CURRENT_JOB_START.getFullYear()) * 12
       + (now.getMonth()    - CURRENT_JOB_START.getMonth());
}

// Whole years across all roles, for the "N+ years of experience" stat
function yearsOfExperience() {
  return Math.floor((PRIOR_EXPERIENCE_MONTHS + currentJobMonths()) / 12);
}

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
// Priority: explicit localStorage choice → browser language → 'fr'.
let currentLang = (function(){
  try {
    var s = localStorage.getItem('lang');
    if (s === 'fr' || s === 'en') return s;
  } catch(e) {}
  var nav = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  return nav.toLowerCase().indexOf('en') === 0 ? 'en' : 'fr';
})();

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  fr: {
    'hero.role':           'Développeur Data & IA',
    'hero.location':       'Montréal, Canada',
    'links.cv':           'CV imprimable',
    'status.available':   'Disponible immédiatement',
    'status.open':        'En poste · À l\'écoute du marché',
    'status.unavailable': 'Non disponible pour le moment',

    // Nav (same sections as *.title, without the emoji)
    'nav.about':    'À propos',
    'nav.exp':      'Expérience',
    'nav.skills':   'Compétences',
    'nav.edu':      'Formation',
    'nav.projects': 'Projets',
    'nav.contact':  'Contact',

    // About
    'about.title':    'À propos',
    'stat.exp':       'ans d\'expérience',
    'stat.sectors':   'secteurs d\'activité',
    'stat.pipelines': 'pipelines déployés',
    'about.readmore': 'Lire la suite',
    'about.readless': 'Réduire',
    'about.p1': 'Développeur Data & IA, j\'ai conçu et mis en place l\'infrastructure de données complète d\'un réseau e-commerce — de l\'ingestion des données jusqu\'à leur exposition aux assistants IA via un serveur MCP gouverné et sécurisé. Chez Laps, je construis des systèmes décisionnels qui aident l\'entreprise à prendre des décisions stratégiques éclairées.',
    'about.p2': 'Mon parcours couvre l\'ensemble de la chaîne de traitement des données, dans des secteurs variés : pipelines automatisés, data warehouses modélisés selon les besoins métiers, et rapports stratégiques et opérationnels construits avec différents outils de visualisation — en collaboration étroite avec les équipes métiers pour transformer les données brutes en leviers de décision.',

    // Experience
    'exp.title':        'Expérience',
    'exp.client.prep':    'chez',
    'contract.permanent': 'CDI',
    'contract.alternance':'Alternance',
    'contract.stage':     'Stage',
    'exp.tasks.show': 'Voir les missions',
    'exp.tasks.hide': 'Masquer',

    'exp.laps.role':    'Développeur Data & IA',
    'exp.laps.start':   'Févr. 2024',
    'exp.laps.end':     "Aujourd'hui",
    'exp.laps.total':   `${currentJobDuration('fr')} · Montréal, Canada\u00a0🇨🇦`,
    'exp.laps.desc':    'Conception et mise en place de l\'ensemble de l\'infrastructure de données de Laps, réseau e-commerce spécialisé dans le matériel de golf, depuis l\'ingestion et le traitement jusqu\'à la valorisation des données via des rapports stratégiques et opérationnels et leur exposition aux assistants IA (serveur MCP). Participation au développement d\'un système automatisé de gestion des prix d\'achat et de vente, renforçant les marges et la compétitivité de l\'entreprise.',
    'exp.laps.li1':     'Conception, déploiement et automatisation de flux de données en Python sur AWS',
    'exp.laps.li2':     'Modélisation et implémentation d\'un entrepôt de données centralisé',
    'exp.laps.li3':     'Développement de rapports et tableaux de bord opérationnels avec Grafana',
    'exp.laps.li4':     'Développement d\'un serveur MCP en Python connectant l\'entrepôt de données aux assistants IA, avec gouvernance SQL et masquage des données sensibles',

    'exp.bialr.start':   'Sept. 2020',
    'exp.bialr.end':     'Déc. 2023',
    'exp.bialr.total':   '3 ans 4 mois · Lyon, France\u00a0🇫🇷',
    'exp.bialr1.role':   'Développeur Data',
    'exp.bialr1.start':  'Janv. 2023',
    'exp.bialr1.end':    'Déc. 2023',
    'exp.bialr1.meta':   '1 an',
    'exp.bialr1.client': 'Bial-S',
    'exp.bialr1.desc':   'Participation à l\'industrialisation d\'une plateforme décisionnelle Cloud automatisée sur AWS, permettant l\'ingestion, la visualisation et l\'analyse prédictive de données pour des Offices Publics de l\'Habitat. Parallèlement, pilotage d\'un centre de services MCO pour Clariane.',
    'exp.bialr1.li1':    'Conception, déploiement et automatisation de flux de données ETL avec Pentaho',
    'exp.bialr1.li2':    'Support transversal de la plateforme décisionnelle et intégration de nouveaux clients',
    'exp.bialr1.li3':    'Pilotage du CDS : gestion d\'équipe, coordination des activités et amélioration continue',
    'exp.bialr2.role':   'Consultant ETL',
    'exp.bialr2.start':  'Sept. 2021',
    'exp.bialr2.end':    'Déc. 2022',
    'exp.bialr2.meta':   '1 an 4 mois',
    'exp.bialr2.client': 'Clariane',
    'exp.bialr2.desc':   'Référent MCO de l\'ensemble des flux inter-applicatifs de Clariane, couvrant les domaines finance, RH, santé et relation client.',
    'exp.bialr2.li1':    'Développement et maintenance des flux inter-applicatifs avec Pentaho',
    'exp.bialr2.li2':    'Gestion des incidents de production : analyse, correction et reprise de données',
    'exp.bialr2.li3':    'Contribution à la migration des flux inter-applicatifs de Pentaho vers un ESB',
    'exp.bialr3.role':   'Consultant Data',
    'exp.bialr3.start':  'Sept. 2020',
    'exp.bialr3.end':    'Août 2021',
    'exp.bialr3.meta':   '1 an',
    'exp.bialr3.client': 'APRR',
    'exp.bialr3.desc':   'Alternance en dernière année de Master MIAGE, principalement réalisée sur des missions pour le client Autoroutes Paris-Rhin-Rhône (APRR) dans les domaines finance, péage, autoroute et relation clientèle. Cette expérience m\'a permis de monter en compétences sur l\'ensemble de la chaîne décisionnelle.',
    'exp.bialr3.li1':    'Cartographie et mise en place d\'une gouvernance des données',
    'exp.bialr3.li2':    'Développement et déploiement de rapports opérationnels',
    'exp.bialr3.li3':    'Conception et maintenance de flux ETL avec Pentaho',
    'exp.hyatt.role':    'Technicien Support IT',
    'exp.hyatt.start':   'Avr. 2018',
    'exp.hyatt.end':     'Juill. 2018',
    'exp.hyatt.total':   '3 mois · Paris, France\u00a0🇫🇷',
    'exp.hyatt.desc':    'Stage de fin de DUT au sein du service informatique d\'un palace parisien.',
    'exp.hyatt.li1':     'Maintenance et support du parc informatique (poste de travail, réseaux, serveurs)',
    'exp.hyatt.li2':     'Participation au déploiement de nouveaux projets IT',
    'exp.hyatt.li3':     'Contribution à la mise en place et au suivi des mesures de cybersécurité',

    // Skills
    'skills.title':        'Compétences',
    'skills.filter':       'Expériences avec',
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
    // CV rows: AWS services rather than the platform, and paired categories
    'cv.skills.cloud':     'AWS',
    'cv.skills.lang':      'Langages & bases de données',
    'cv.skills.devops':    'DevOps & méthodes',
    'skill.dwh':           'Modélisation de données',
    'skill.governance':    'Gouvernance des données',
    'skills.languages':    'Langues',
    'lang.french':         'Français',
    'lang.french.level':   'Natif',
    'lang.english':        'Anglais',
    'lang.english.level':  'Courant',

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

    // Projects
    'projects.title':        'Projets',
    'projects.etl.meta':     'Laps · Juin – Sept. 2025 · 4 mois',
    'projects.etl.desc':     'Développement d\'un framework ETL serverless sur AWS Lambda, permettant la création de pipelines modulaires, évolutifs et économiques pour l\'automatisation des flux de données.',
    'projects.etl.title.main': 'AWS Lambda ETL',
    'projects.etl.title.sub': 'Framework de pipelines serverless',
    'projects.mcp.title.main': 'MCP Server',
    'projects.mcp.title.sub': 'Accès IA gouverné à l\'entrepôt de données',
    'projects.mcp.meta':     'Laps · Avr. – Juin 2026 · 3 mois',
    'projects.mcp.desc':     'Développement d\'un serveur MCP en Python (FastMCP) donnant aux assistants IA un accès gouverné à l\'entrepôt de données de Laps : requêtes en lecture seule validées (liste blanche de tables, limites et délais imposés), masquage automatique des données personnelles et journal d\'audit complet.',
    'projects.badge.pro':    'Professionnel',
    'projects.copill.title.main': 'CoPill',
    'projects.copill.title.sub': 'Pilulier connecté',
    'projects.copill.desc1': 'Projet de fin d\'études réalisé en équipe pour transformer un pilulier traditionnel en une solution connectée visant à améliorer l\'adhésion aux traitements (personnes âgées, patients, sportifs). Le projet couvrait l\'ensemble du cycle produit (discovery, spécifications, prototypage, tests utilisateurs et validation) ainsi que la gestion de projet (planification et suivi des itérations).',
    'projects.copill.desc2': 'Sur le plan technique, le prototype embarqué a été développé en Python sur une Raspberry Pi avec modules (LED, capteurs, écran, buzzer) et accompagné d\'une application Android en Java pour le pilotage et le suivi.',
    'projects.swarm.title.main': 'Swarm Debugging',
    'projects.swarm.title.sub': 'Migration d\'API vers GraphQL',
    'projects.swarm.desc1':  'Le projet Swarm Debugging consiste à développer un plug-in sur l\'IDE Eclipse qui facilite le débogage collaboratif des développeurs via le crowdsourcing.',
    'projects.swarm.desc2':  'Dans ce cadre, nous avons migré l\'API d\'un modèle REST vers un modèle GraphQL implémenté en Java avec Spring Boot. La migration a apporté une plus grande flexibilité dans les requêtes, réduit la sur-récupération des données, et a facilité la maintenance et l\'évolution de l\'API grâce à un schéma typé et auto-documenté.',
    'projects.group.perso':   'Personnel',
    'projects.group.academic':'Académique',
    'projects.badge.perso':   'Personnel',
    'projects.badge.academic':'Académique',
    'projects.pinned':        'Épinglé',
    'projects.readmore': 'Lire la suite',
    'projects.readless': 'Réduire',
    'projects.showmore': 'Voir plus de projets',
    'projects.showless': 'Voir moins de projets',
    'projects.github':       'Voir sur GitHub',

    // Misc
    'misc.title':        'Centres d\'intérêt',
    'misc.tt.title':     'Tennis de Table',
    'misc.tt.desc':      'Activité pratiquée pendant plus de 10 ans en club.',
    'misc.travel.title': 'Voyages',
    'misc.travel.desc':  'Déjà 17 pays explorés, et bien d\'autres à venir.',

    // Contact
    'contact.title':               'Contact',
    'contact.name.label':          'Nom',
    'contact.name.placeholder':    'Votre nom',
    'contact.email.label':         'Email',
    'contact.email.placeholder':   'votre@email.com',
    'contact.message.label':       'Message',
    'contact.message.placeholder': 'Votre message…',
    'contact.submit':              'Envoyer',
    'contact.success':             'Message envoyé ! Je vous répondrai dès que possible.',
    'contact.error':               'Une erreur est survenue. Veuillez réessayer ou m\'écrire directement.',

    // Footer & aria
    'footer.backtotop':    'Retour en haut',
    'footer.privacy':      'Confidentialité',
    'a11y.skip':           'Aller au contenu',
    'projects.github.label': 'Voir sur GitHub',
    'aria.socials':     'Réseaux sociaux',
    'aria.socials.footer': 'Réseaux sociaux — pied de page',
    'aria.terminal':       'Ouvrir le terminal',
    'aria.terminal.hint':  'Ouvrir le terminal — touche $ ou `',
    'aria.terminal.close': 'Fermer le terminal',
    'aria.terminal.min':   'Réduire le terminal',
    'aria.terminal.max':   'Agrandir le terminal',
    'aria.terminal.input': 'Commande',

    // CV print view
    'cv.back':  'Retour au site',
    'cv.print': 'Imprimer / PDF',
    // exp.laps.total bundles duration, city and a flag emoji; the CV lays
    // those out in separate slots and has no use for the emoji.
    'cv.laps.duration':  currentJobDuration('fr'),
    'cv.bialr.duration': '3 ans 4 mois',
    // Employer first, then the client, in one string: under a job title,
    // "chez Bial-S" reads to an ATS as the employer, and BIAL-R gets lost.
    'cv.bialr1.org': 'BIAL-R · client : Bial-S',
    'cv.bialr2.org': 'BIAL-R · client : Clariane',
    'cv.bialr3.org': 'BIAL-R · client : APRR',
    'cv.tagline':   'De leur source jusqu\'aux agents IA : des données fiables, gouvernées, dignes de confiance',
    'cv.refs.title': 'Références',
    // Names and personal contact details stay out of a public repository;
    // the nominative version goes in the copy sent to a recruiter.
    'cv.refs.body':  'Disponibles sur demande.',
    'cv.refs.unlock': 'Références',
    'cv.refs.lock':   'Verrouiller',
    'cv.refs.prompt': 'Phrase de passe des références',
    'cv.refs.wrong':  'Phrase de passe incorrecte.',
    'cv.refs.absent': 'Aucun fichier de références chiffré n\'a été trouvé.',
  },

  en: {
    'hero.role':           'Data & AI Engineer',
    'hero.location':       'Montreal, Canada',
    'links.cv':           'Printable CV',
    'status.available':   'Available now',
    'status.open':        'Employed · Open to opportunities',
    'status.unavailable': 'Not available at the moment',

    // Nav (same sections as *.title, without the emoji)
    'nav.about':    'About',
    'nav.exp':      'Experience',
    'nav.skills':   'Skills',
    'nav.edu':      'Education',
    'nav.projects': 'Projects',
    'nav.contact':  'Contact',

    // About
    'about.title':    'About',
    'stat.exp':       'years of experience',
    'stat.sectors':   'industry sectors',
    'stat.pipelines': 'deployed pipelines',
    'about.readmore': 'Read more',
    'about.readless': 'Show less',
    'about.p1': 'As a Data & AI Engineer, I designed and built the complete data infrastructure of an e-commerce network — from data ingestion all the way to exposing it to AI assistants through a governed, secured MCP server. At Laps, I build decision-support systems that help the business make informed strategic decisions.',
    'about.p2': 'My career spans the entire data processing chain, across a range of industries: automated pipelines, data warehouses modeled around business needs, and strategic and operational reporting built with various visualization tools — working closely with business teams to turn raw data into decision-making levers.',

    // Experience
    'exp.title':        'Experience',
    'exp.client.prep':    'for',
    'contract.permanent': 'Full-time',
    'contract.alternance':'Apprenticeship',
    'contract.stage':     'Internship',
    'exp.tasks.show': 'Show tasks',
    'exp.tasks.hide': 'Hide',

    'exp.laps.role':    'Data & AI Engineer',
    'exp.laps.start':   'Feb. 2024',
    'exp.laps.end':     'Present',
    'exp.laps.total':   `${currentJobDuration('en')} · Montreal, Canada\u00a0🇨🇦`,
    'exp.laps.desc':    'Designed and implemented the entire data infrastructure for Laps, an e-commerce network specialized in golf equipment, covering everything from data ingestion and processing to value creation through strategic and operational reporting and data exposure to AI assistants (MCP server). Contributed to the development of an automated pricing system for purchase and sales, strengthening the company\'s margins and competitiveness.',
    'exp.laps.li1':     'Designed, deployed, and automated data pipelines in Python on AWS',
    'exp.laps.li2':     'Modeled and implemented a centralized data warehouse',
    'exp.laps.li3':     'Developed operational reports and dashboards with Grafana',
    'exp.laps.li4':     'Built a Python MCP server connecting the data warehouse to AI assistants, with SQL governance and sensitive-data masking',

    'exp.bialr.start':   'Sep. 2020',
    'exp.bialr.end':     'Dec. 2023',
    'exp.bialr.total':   '3 yrs 4 mos · Lyon, France\u00a0🇫🇷',
    'exp.bialr1.role':   'Data Developer',
    'exp.bialr1.start':  'Jan. 2023',
    'exp.bialr1.end':    'Dec. 2023',
    'exp.bialr1.meta':   '1 yr',
    'exp.bialr1.client': 'Bial-S',
    'exp.bialr1.desc':   'Contributed to the industrialization of an automated cloud-based data platform on AWS, enabling data ingestion, visualization, and predictive analytics for Public Housing Offices. Alongside, led an Operations & Support service center for Clariane.',
    'exp.bialr1.li1':    'Designed, deployed, and automated ETL data pipelines with Pentaho',
    'exp.bialr1.li2':    'Provided cross-functional support for the data platform and integrated new clients',
    'exp.bialr1.li3':    'Led the service center: team management, coordination, and continuous improvement',
    'exp.bialr2.role':   'ETL Consultant',
    'exp.bialr2.start':  'Sep. 2021',
    'exp.bialr2.end':    'Dec. 2022',
    'exp.bialr2.meta':   '1 yr 4 mos',
    'exp.bialr2.client': 'Clariane',
    'exp.bialr2.desc':   'Technical lead within the Operations & Support team, responsible for all inter-application data flows at Clariane across finance, HR, healthcare, and customer relations domains.',
    'exp.bialr2.li1':    'Developed and maintained inter-application data flows with Pentaho',
    'exp.bialr2.li2':    'Managed production incidents: analysis, troubleshooting, and data recovery',
    'exp.bialr2.li3':    'Contributed to the migration of inter-application data flows from Pentaho to an ESB',
    'exp.bialr3.role':   'Data Engineer Trainee',
    'exp.bialr3.start':  'Sep. 2020',
    'exp.bialr3.end':    'Aug. 2021',
    'exp.bialr3.meta':   '1 yr',
    'exp.bialr3.client': 'APRR',
    'exp.bialr3.desc':   'Master\'s work-study (final year of MIAGE program), primarily focused on projects for Autoroutes Paris-Rhin-Rhône (APRR) in finance, toll operations, highway management, and customer relations. This experience allowed me to develop skills across the entire business intelligence information system.',
    'exp.bialr3.li1':    'Mapped and implemented data governance processes',
    'exp.bialr3.li2':    'Developed and deployed operational reports',
    'exp.bialr3.li3':    'Designed and maintained ETL data flows using Pentaho',
    'exp.hyatt.role':    'IT Support Trainee',
    'exp.hyatt.start':   'Apr. 2018',
    'exp.hyatt.end':     'Jul. 2018',
    'exp.hyatt.total':   '3 mos · Paris, France\u00a0🇫🇷',
    'exp.hyatt.desc':    'Final-year DUT internship within the IT department of a luxury hotel in Paris.',
    'exp.hyatt.li1':     'Maintained and supported IT infrastructure (workstations, networks, servers)',
    'exp.hyatt.li2':     'Participated in the deployment of new IT projects',
    'exp.hyatt.li3':     'Assisted in implementing and monitoring cybersecurity measures',

    // Skills
    'skills.title':        'Skills',
    'skills.filter':       'Experiences with',
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
    'cv.skills.cloud':     'AWS',
    'cv.skills.lang':      'Languages & Databases',
    'cv.skills.devops':    'DevOps & Methods',
    'skill.dwh':           'Data Warehouse Modeling',
    'skill.governance':    'Data Governance',
    'skills.languages':    'Languages',
    'lang.french':         'French',
    'lang.french.level':   'Native',
    'lang.english':        'English',
    'lang.english.level':  'Fluent',

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

    // Projects
    'projects.title':        'Projects',
    'projects.etl.meta':     'Laps · Jun. – Sep. 2025 · 4 mos',
    'projects.etl.desc':     'Developed a serverless ETL framework on AWS Lambda, enabling the creation of modular, scalable, and cost-effective pipelines for automated data workflows.',
    'projects.etl.title.main': 'AWS Lambda ETL',
    'projects.etl.title.sub': 'Serverless Pipeline Framework',
    'projects.mcp.title.main': 'MCP Server',
    'projects.mcp.title.sub': 'Governed AI access to the data warehouse',
    'projects.mcp.meta':     'Laps · Apr. – Jun. 2026 · 3 mos',
    'projects.mcp.desc':     'Built a Python MCP server (FastMCP) giving AI assistants governed access to the Laps data warehouse: validated read-only queries (table whitelist, enforced limits and timeouts), automatic masking of personal data, and a full audit log.',
    'projects.badge.pro':    'Professional',
    'projects.copill.title.main': 'CoPill',
    'projects.copill.title.sub': 'Connected Pillbox',
    'projects.copill.desc1': 'Final-year team project to transform a traditional pillbox into a connected solution aimed at improving treatment adherence for seniors, patients, and athletes. The project covered the entire product lifecycle (discovery, specifications, prototyping, user testing, and validation) as well as project management (planning and iteration tracking).',
    'projects.copill.desc2': 'Technically, the embedded prototype was developed in Python on a Raspberry Pi with modules (LEDs, sensors, display, buzzer) and complemented by an Android application in Java for monitoring and control.',
    'projects.swarm.title.main': 'Swarm Debugging',
    'projects.swarm.title.sub': 'API Migration to GraphQL',
    'projects.swarm.desc1':  'Swarm Debugging is a project developing an Eclipse IDE plugin to facilitate collaborative debugging among developers via crowdsourcing.',
    'projects.swarm.desc2':  'As part of this project, we migrated the API from a REST model to a GraphQL model implemented in Java with Spring Boot. The migration provided more flexible queries, reduced data over-fetching, and simplified API maintenance and evolution thanks to a typed, self-documenting schema.',
    'projects.group.perso':   'Personal',
    'projects.group.academic':'Academic',
    'projects.badge.perso':   'Personal',
    'projects.badge.academic':'Academic',
    'projects.pinned':        'Pinned',
    'projects.readmore': 'Read more',
    'projects.readless': 'Show less',
    'projects.showmore': 'Show more projects',
    'projects.showless': 'Show fewer projects',
    'projects.github':       'View on GitHub',

    // Misc
    'misc.title':        'Interests',
    'misc.tt.title':     'Table Tennis',
    'misc.tt.desc':      'Played for over 10 years in a club.',
    'misc.travel.title': 'Travel',
    'misc.travel.desc':  'Visited 17 countries so far — with many more to come.',

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
    'contact.error':               'Something went wrong. Please try again or reach out directly.',

    // Footer & aria
    'footer.backtotop':    'Back to top',
    'footer.privacy':      'Privacy',
    'a11y.skip':           'Skip to content',
    'projects.github.label': 'View on GitHub',
    'aria.socials':     'Social links',
    'aria.socials.footer': 'Social links — footer',
    'aria.terminal':       'Open the terminal',
    'aria.terminal.hint':  'Open the terminal — press $ or `',
    'aria.terminal.close': 'Close the terminal',
    'aria.terminal.min':   'Minimize the terminal',
    'aria.terminal.max':   'Maximize the terminal',
    'aria.terminal.input': 'Command',

    // CV print view
    'cv.back':  'Back to site',
    'cv.print': 'Print / PDF',
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
    'cv.refs.wrong':  'Wrong passphrase.',
    'cv.refs.absent': 'No encrypted references file was found.',
  }
};

// ─── Apply translations ───────────────────────────────────────────────────────
// Each attribute names the translation key; the setter says where the string
// lands. Expand/collapse buttons re-key their own [data-i18n] as they toggle
// (see setupToggle in scroll.js), so their labels come along for free.
const I18N_TARGETS = [
  ['data-i18n',             (el, v) => { el.textContent = v; }],
  ['data-i18n-aria',        (el, v) => el.setAttribute('aria-label', v)],
  ['data-i18n-placeholder', (el, v) => el.setAttribute('placeholder', v)],
  ['data-i18n-title',       (el, v) => el.setAttribute('title', v)],
];

function applyLang(lang) {
  const t = translations[lang];

  I18N_TARGETS.forEach(([attr, set]) => {
    document.querySelectorAll('[' + attr + ']').forEach(el => {
      const value = t[el.getAttribute(attr)];
      if (value !== undefined) set(el, value);
    });
  });

  // CV button — open the print view already in the right language
  const cvBtn = document.getElementById('cvDownload');
  if (cvBtn) cvBtn.href = `/cv?lang=${lang}`;

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
