// Skills catalogue — shared by index.html (cards + terminal) and cv.html.
// Loaded before scroll.js, which consumes `skillsData` and `categoryDefs`.
// `cv: false` keeps a skill on the site but out of the printed CV, and
// `site: false` the reverse: the CV carries keywords an ATS matches on that
// would only clutter the skill cards. `i18n` names a translation key for a
// skill whose name differs between languages.
const skillsData = [
  // Data engineering
  { id: 'etl',        name: 'ETL/ELT',    level: 3, category: 'dataeng', icon: null, site: false },
  { id: 'dwh',        name: 'Modélisation de données', level: 3, category: 'dataeng', icon: null, site: false, i18n: 'skill.dwh' },
  { id: 'governance', name: 'Gouvernance des données', level: 3, category: 'dataeng', icon: null, site: false, i18n: 'skill.governance' },
  { id: 'llm',        name: 'LLM',        level: 2, category: 'dataeng', icon: null },
  { id: 'mcp',        name: 'MCP',        level: 2, category: 'dataeng', icon: 'fastmcp' },
  { id: 'pentaho',    name: 'Pentaho',    level: 2, category: 'dataeng', icon: 'hitachi', cv: false },
  { id: 'prefect',    name: 'Prefect',    level: 1, category: 'dataeng', icon: 'prefect' },
  // Languages
  { id: 'python',     name: 'Python',     level: 3, category: 'lang',  icon: 'python' },
  { id: 'sql',        name: 'SQL',        level: 3, category: 'lang',  icon: null },
  // AWS — the CV lists the services, the site the platform
  { id: 'aws',        name: 'AWS',        level: 3, category: 'cloud', icon: 'amazonwebservices', cv: false },
  { id: 'lambda',     name: 'Lambda',     level: 3, category: 'cloud', icon: null, site: false },
  { id: 's3',         name: 'S3',         level: 3, category: 'cloud', icon: null, site: false },
  { id: 'stepfunctions', name: 'Step Functions', level: 3, category: 'cloud', icon: null, site: false },
  { id: 'glue',       name: 'Glue',       level: 2, category: 'cloud', icon: null, site: false },
  { id: 'athena',     name: 'Athena',     level: 2, category: 'cloud', icon: null, site: false },
  { id: 'rds',        name: 'RDS',        level: 2, category: 'cloud', icon: null, site: false },
  { id: 'cloudwatch', name: 'CloudWatch', level: 2, category: 'cloud', icon: null, site: false },
  { id: 'snowflake',  name: 'Snowflake',  level: 1, category: 'cloud', icon: 'snowflake',  cv: false },
  { id: 'databricks', name: 'Databricks', level: 1, category: 'cloud', icon: 'databricks', cv: false },
  // Databases
  { id: 'mysql',      name: 'MySQL',      level: 3, category: 'db',    icon: 'mysql' },
  { id: 'postgresql', name: 'PostgreSQL', level: 3, category: 'db',    icon: 'postgresql' },
  { id: 'mssql',      name: 'SQL Server', level: 2, category: 'db',    icon: 'microsoftsqlserver' },
  { id: 'oracle',     name: 'Oracle',     level: 2, category: 'db',    icon: 'oracle' },
  // BI & data visualization
  { id: 'grafana',    name: 'Grafana',    level: 3, category: 'bi',    icon: 'grafana' },
  { id: 'tableau',    name: 'Tableau',    level: 1, category: 'bi',    icon: 'tableau' },
  { id: 'powerbi',    name: 'Power BI',   level: 1, category: 'bi',    icon: 'powerbi' },
  { id: 'sapbo',      name: 'SAP BO',     level: 1, category: 'bi',    icon: 'sap' },
  // DevOps & IaC
  { id: 'git',        name: 'Git',        level: 3, category: 'devops', icon: 'git' },
  { id: 'bitbucket',  name: 'Bitbucket',  level: 3, category: 'devops', icon: 'bitbucket' },
  { id: 'docker',     name: 'Docker',     level: 2, category: 'devops', icon: 'docker' },
  { id: 'cloudformation', name: 'CloudFormation', level: 2, category: 'devops', icon: null, site: false },
  { id: 'codepipeline',   name: 'CodePipeline',   level: 2, category: 'devops', icon: null, site: false },
  { id: 'pulumi',     name: 'Pulumi',     level: 1, category: 'devops', icon: 'pulumi' },
  // Project management
  { id: 'agile',      name: 'Agile',      level: 3, category: 'pm',    icon: null },
  { id: 'jira',       name: 'Jira',       level: 2, category: 'pm',    icon: 'jira' },
];

const categoryDefs = ['dataeng', 'lang', 'cloud', 'db', 'bi', 'devops', 'pm'];

// Name in the current language, for the skills that carry an `i18n` key
function skillLabel(s) {
  var t = translations[currentLang] || translations.fr;
  return (s.i18n && t[s.i18n]) || s.name;
}
