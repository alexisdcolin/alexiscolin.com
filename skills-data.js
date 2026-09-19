// Skills catalogue — shared by index.html (cards + terminal) and cv.html.
// Loaded before scroll.js, which consumes `skillsData` and `categoryDefs`.
const skillsData = [
  // Development
  { id: 'genai',      name: 'GenAI',      level: 3, category: 'dev',   icon: null },
  { id: 'python',     name: 'Python',     level: 3, category: 'dev',   icon: 'python' },
  { id: 'git',        name: 'Git',        level: 2, category: 'dev',   icon: 'git' },
  { id: 'pentaho',    name: 'Pentaho',    level: 2, category: 'dev',   icon: 'hitachi' },
  { id: 'docker',     name: 'Docker',     level: 2, category: 'dev',   icon: 'docker' },
  { id: 'sql',        name: 'SQL',        level: 3, category: 'dev',   icon: null },
  { id: 'pulumi',     name: 'Pulumi',     level: 1, category: 'cloud', icon: 'pulumi' },
  // Data analysis
  { id: 'grafana',    name: 'Grafana',    level: 3, category: 'data',  icon: 'grafana' },
  { id: 'tableau',    name: 'Tableau',    level: 1, category: 'data',  icon: 'tableau' },
  { id: 'powerbi',    name: 'Power BI',   level: 1, category: 'data',  icon: 'powerbi' },
  { id: 'sapbo',      name: 'SAP BO',     level: 1, category: 'data',  icon: 'sap' },
  // Orchestration
  { id: 'stepfunctions',    name: 'Step Functions',    level: 3, category: 'orchestration',  icon: 'amazonwebservices' },
  { id: 'prefect',    name: 'Prefect',    level: 1, category: 'orchestration',  icon: 'prefect' },
  { id: 'airflow',    name: 'Airflow',    level: 1, category: 'orchestration',  icon: 'apacheairflow' },
  // Databases
  { id: 'mysql',      name: 'MySQL',      level: 3, category: 'db',    icon: 'mysql' },
  { id: 'mssql',      name: 'SQL Server', level: 2, category: 'db',    icon: 'microsoftsqlserver' },
  { id: 'postgresql', name: 'PostgreSQL', level: 3, category: 'db',    icon: 'postgresql' },
  { id: 'oracle',     name: 'Oracle',     level: 2, category: 'db',    icon: 'oracle' },
  // Cloud
  { id: 'aws',        name: 'AWS',        level: 3, category: 'cloud', icon: 'amazonwebservices' },
  { id: 'snowflake',  name: 'Snowflake',  level: 1, category: 'cloud', icon: 'snowflake' },
  { id: 'databricks', name: 'Databricks', level: 1, category: 'cloud', icon: 'databricks' },
  // Project management
  { id: 'bitbucket',  name: 'Bitbucket',  level: 3, category: 'pm',    icon: 'bitbucket' },
  { id: 'agile',      name: 'Agile',      level: 3, category: 'pm',    icon: null },
  { id: 'jira',       name: 'Jira',       level: 2, category: 'pm',    icon: 'jira' },
];

const categoryDefs = ['dev', 'data', 'orchestration', 'db', 'cloud', 'pm'];
