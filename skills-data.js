// Skills catalogue — shared by index.html (cards + terminal) and cv.html.
// Loaded before scroll.js, which consumes `skillsData` and `categoryDefs`.
// `parent` files a tool under its family (AWS, SQL…): the site lists it when
// the family unfolds, the CV in brackets after it, and the family's tenure
// covers every position where it or one of its tools served.
// `cv: false` keeps a skill on the site but out of the printed CV, and
// `site: false` the reverse. `i18n` names a translation key for a skill whose
// name differs between languages, `short` a shorter one for the site's tiles
// (the CV keeps the full name, which an ATS matches on).
const skillsData = [
  // Data engineering
  { id: 'etl',        name: 'ETL/ELT',    level: 3, category: 'dataeng', icon: null },
  { id: 'pentaho',    name: 'Pentaho',    level: 3, category: 'dataeng', icon: 'hitachi', parent: 'etl', cv: false },
  { id: 'dbt',        name: 'dbt',        level: 2, category: 'dataeng', icon: null, parent: 'etl' },
  { id: 'dwh',        name: 'Modélisation de données', level: 3, category: 'dataeng', icon: null, i18n: 'skill.dwh', short: 'skill.dwh.short' },
  { id: 'governance', name: 'Qualité et gouvernance des données', level: 3, category: 'dataeng', icon: null, i18n: 'skill.governance', short: 'skill.governance.short' },
  { id: 'datalake',   name: 'Data lake',  level: 2, category: 'dataeng', icon: null, i18n: 'skill.datalake' },
  { id: 'parquet',    name: 'Parquet',    level: 2, category: 'dataeng', icon: null, parent: 'datalake' },
  { id: 'duckdb',     name: 'DuckDB',     level: 2, category: 'dataeng', icon: 'duckdb', parent: 'datalake' },
  { id: 'orchestration', name: 'Orchestration', level: 2, category: 'dataeng', icon: null },
  { id: 'dagster',    name: 'Dagster',    level: 2, category: 'dataeng', icon: null, parent: 'orchestration' },
  { id: 'prefect',    name: 'Prefect',    level: 1, category: 'dataeng', icon: 'prefect', parent: 'orchestration' },
  { id: 'ai',         name: 'IA',         level: 2, category: 'dataeng', icon: null, i18n: 'skill.ai' },
  { id: 'llm',        name: 'LLM',        level: 2, category: 'dataeng', icon: null, parent: 'ai' },
  { id: 'mcp',        name: 'MCP',        level: 2, category: 'dataeng', icon: 'fastmcp', parent: 'ai' },
  { id: 'agents',     name: 'Agents',     level: 2, category: 'dataeng', icon: null, parent: 'ai' },
  // Languages, SQL with the databases
  { id: 'python',     name: 'Python',     level: 3, category: 'lang',  icon: 'python' },
  { id: 'sql',        name: 'SQL',        level: 3, category: 'lang',  icon: null },
  { id: 'mysql',      name: 'MySQL',      level: 3, category: 'db',    icon: 'mysql', parent: 'sql' },
  { id: 'postgresql', name: 'PostgreSQL', level: 3, category: 'db',    icon: 'postgresql', parent: 'sql' },
  { id: 'mssql',      name: 'SQL Server', level: 2, category: 'db',    icon: 'microsoftsqlserver', parent: 'sql' },
  { id: 'oracle',     name: 'Oracle',     level: 2, category: 'db',    icon: 'oracle', parent: 'sql' },
  // Cloud, AWS with its services
  { id: 'aws',        name: 'AWS',        level: 3, category: 'cloud', icon: 'amazonwebservices' },
  { id: 'lambda',     name: 'Lambda',     level: 3, category: 'cloud', icon: null, parent: 'aws' },
  { id: 's3',         name: 'S3',         level: 3, category: 'cloud', icon: null, parent: 'aws' },
  { id: 'stepfunctions', name: 'Step Functions', level: 3, category: 'cloud', icon: null, parent: 'aws' },
  { id: 'glue',       name: 'Glue',       level: 2, category: 'cloud', icon: null, parent: 'aws' },
  { id: 'athena',     name: 'Athena',     level: 2, category: 'cloud', icon: null, parent: 'aws' },
  { id: 'rds',        name: 'RDS',        level: 2, category: 'cloud', icon: null, parent: 'aws' },
  { id: 'cloudwatch', name: 'CloudWatch', level: 2, category: 'cloud', icon: null, parent: 'aws' },
  { id: 'cloudformation', name: 'CloudFormation', level: 2, category: 'cloud', icon: null, parent: 'aws' },
  { id: 'codepipeline',   name: 'CodePipeline',   level: 2, category: 'cloud', icon: null, parent: 'aws' },
  { id: 'snowflake',  name: 'Snowflake',  level: 1, category: 'cloud', icon: 'snowflake',  cv: false },
  { id: 'databricks', name: 'Databricks', level: 1, category: 'cloud', icon: 'databricks', cv: false },
  // BI & data visualization
  { id: 'grafana',    name: 'Grafana',    level: 3, category: 'bi',    icon: 'grafana' },
  { id: 'tableau',    name: 'Tableau',    level: 1, category: 'bi',    icon: 'tableau' },
  { id: 'powerbi',    name: 'Power BI',   level: 1, category: 'bi',    icon: 'powerbi' },
  { id: 'sapbo',      name: 'SAP BO',     level: 1, category: 'bi',    icon: 'sap' },
  // DevOps & IaC
  { id: 'git',        name: 'Git',        level: 3, category: 'devops', icon: 'git' },
  { id: 'bitbucket',  name: 'Bitbucket',  level: 3, category: 'devops', icon: 'bitbucket', parent: 'git' },
  { id: 'cicd',       name: 'CI/CD',      level: 2, category: 'devops', icon: null },
  { id: 'docker',     name: 'Docker',     level: 2, category: 'devops', icon: 'docker' },
  { id: 'pulumi',     name: 'Pulumi',     level: 1, category: 'devops', icon: 'pulumi' },
  // Project management
  { id: 'agile',      name: 'Agile',      level: 3, category: 'pm',    icon: null },
  { id: 'jira',       name: 'Jira',       level: 2, category: 'pm',    icon: 'jira', parent: 'agile' },
];

const categoryDefs = ['dataeng', 'lang', 'cloud', 'db', 'bi', 'devops', 'pm'];

// Name in the current language, for the skills that carry an `i18n` key
function skillLabel(s) {
  return (s.i18n && t()[s.i18n]) || s.name;
}
