// Everything the profile says lives here. Edit, push, and the workflow redraws the SVGs.
// In bullets, wrap text in **double asterisks** to highlight it.

export const settings = {
  repo: 'JoaquimColacilli/JoaquimColacilli', // profile repository
  branch: 'output', // branch the workflow publishes the SVGs to
  heatmap: 'brand', // 'brand' (indigo, matches the rest) or 'github' (classic greens)
  timeZone: 'America/Argentina/Buenos_Aires',
};

export const profile = {
  name: 'Joaquim Colacilli',
  greeting: "Hi, I'm",
  role: 'Frontend-focused full-stack developer',
  summary:
    'I build product-facing web applications with React, Next.js and Angular, backed by Java/Spring Boot and Node.js services.',
  now: { label: 'NOW', text: 'Cross Selling @ Despegar' },
  focus: 'UX, conversion & front-end performance',
  location: 'Buenos Aires, AR',
  timezone: 'UTC−3',
  github: 'JoaquimColacilli',
};

export const links = [
  { id: 'portfolio', label: 'Portfolio', href: 'https://joaquimcolacilli-portfolio.netlify.app/', primary: true },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/joaquim-colacilli/' },
  { id: 'email', label: 'Email', href: 'mailto:joaquimcolacilli9@gmail.com' },
];

export const stack = {
  groups: [
    { label: 'Frontend', items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Angular', 'Tailwind CSS'] },
    { label: 'Backend', items: ['Java', 'Spring Boot', 'Node.js', 'NestJS', 'Express'] },
    { label: 'Data', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
    { label: 'Infra & Tooling', items: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Git', 'Postman'] },
  ],
  also: ['Oracle', 'Cassandra', 'OpenSearch', 'OpenShift', 'RabbitMQ', 'ActiveMQ', 'Liquibase', 'Resilience4j'],
  practices: [
    'Hexagonal architecture',
    'SOLID & clean code',
    'Retry · Circuit breaker · DLQ',
    'JUnit & Mockito',
    'GitFlow & code review',
    'CI/CD pipelines',
    'Scrum & Kanban',
  ],
};

export const experience = [
  {
    company: 'Despegar',
    role: 'Software Developer',
    start: '2026-02',
    end: null,
    bullets: [
      'Frontend development and maintenance for **Cross Selling**, focused on user experience and conversion.',
      'Reusable component design and API integration, with close attention to performance and code quality.',
      'Collaboration with Product, Design and Backend teams, applying code reviews and shared engineering standards.',
    ],
    tech: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    company: 'Almundo',
    role: 'Software Developer',
    start: '2025-06',
    end: '2026-02',
    bullets: [
      '**Cars and Tours verticals**, built with Angular 17/18 and Java / Spring Boot 3.',
      'White-label microsites for partners: parameterization, SEO and performance.',
      'BackOffice platform: feature flags, permissions, reporting and support tooling.',
      'Cars supplier integration (CNET) with retries, validation and resilience handling.',
      'Hexagonal architecture and idempotent pipelines over MongoDB, Cassandra and OpenSearch.',
    ],
    tech: ['Angular', 'Java', 'Spring Boot', 'MongoDB', 'Docker'],
  },
  {
    company: 'NTT Data',
    role: 'Software Developer',
    start: '2022-09',
    end: '2025-06',
    bullets: [
      'Design of scalable distributed systems with Spring Boot and Spring Cloud.',
      'RESTful APIs using WebFlux, with Circuit Breaker and Retry patterns via Resilience4j.',
      'PostgreSQL and Oracle optimization: indexing, query tuning and Hibernate tuning.',
      'Asynchronous processing with RabbitMQ and ActiveMQ.',
      'CI/CD with GitLab and Jenkins, deploying to OpenShift.',
    ],
    tech: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Jenkins'],
  },
  {
    company: 'Freelance',
    role: 'Full Stack Developer',
    start: '2021-01',
    end: null,
    bullets: [
      'Modern, responsive landing pages built with React and Next.js.',
      'RESTful APIs with Node.js and Express.',
      'Custom administrative dashboards and SEO optimization.',
      'Web development for **Cubiqa Studio**, delivering premium real-estate project sites.',
    ],
    tech: ['React', 'Next.js', 'Node.js', 'Tailwind CSS', 'AWS'],
  },
];

// `href` is where the card links to; `kind` is the small tag on the card.
export const work = [
  {
    id: 'primatech',
    title: 'Primatech',
    kind: 'Client',
    icon: 'layers',
    description: 'Corporate site for a technology solutions company covering web, mobile and cloud services.',
    href: 'https://primatech.com.ar/',
    action: 'Visit site',
  },
  {
    id: 'bramelec',
    title: 'Bramelec',
    kind: 'Client',
    icon: 'zap',
    description: 'Site for an electrical installations studio specializing in building electrical plans.',
    href: 'https://bramelec.com/',
    action: 'Visit site',
  },
  {
    id: 'el-calculetas',
    title: 'El Calculetas',
    kind: 'Side project',
    icon: 'wallet',
    description: 'Personal finance manager for tracking income, expenses and balances.',
    tech: ['Angular', 'Tailwind CSS'],
    href: 'https://el-calculetas.netlify.app',
    source: 'https://github.com/JoaquimColacilli/el-calculetas',
    action: 'Live demo',
  },
  {
    id: 'estimador-desarrollo',
    title: 'Development Estimator',
    kind: 'Side project',
    icon: 'calculator',
    description: 'Estimation tool that calculates development effort from configurable project parameters.',
    tech: ['Angular', 'TypeScript'],
    href: 'https://joaquimcolacilli.github.io/estimador-desarrollo/',
    source: 'https://github.com/JoaquimColacilli/estimador-desarrollo',
    action: 'Live demo',
  },
  {
    id: 'checklistwf3',
    title: 'Deployment Checklist',
    kind: 'Side project',
    icon: 'list-checks',
    description: 'Checklist application for controlling and validating deployment procedures.',
    tech: ['Angular', 'TypeScript'],
    href: 'https://joaquimcolacilli.github.io/checklistwf3/',
    source: 'https://github.com/JoaquimColacilli/checklistwf3',
    action: 'Live demo',
  },
  {
    id: 'playertimer',
    title: 'Player Timer',
    kind: 'Side project',
    icon: 'timer',
    description: 'Multi-player timer with custom names, colors and per-player time tracking.',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    href: 'https://joaquimcolacilli.github.io/playertimer/',
    source: 'https://github.com/JoaquimColacilli/playertimer',
    action: 'Live demo',
  },
  {
    id: 'json-parser-exec',
    title: 'JSON Formatter',
    kind: 'Side project',
    icon: 'braces',
    description: 'Desktop-oriented utility for parsing and formatting JSON.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    href: 'https://github.com/JoaquimColacilli/json-parser-exec',
    action: 'Source',
  },
  {
    id: 'wpf',
    title: 'WPF Gym',
    kind: 'Side project',
    icon: 'dumbbell',
    description: 'Landing page for a gym brand, focused on fitness motivation and mental strength.',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    href: 'https://joaquimcolacilli.github.io/wpf/',
    source: 'https://github.com/JoaquimColacilli/wpf',
    action: 'Live demo',
  },
];

export const education = {
  schools: [
    {
      school: 'University of Buenos Aires',
      detail: 'School of Engineering (FIUBA)',
      program: 'Systems Analysis (Análisis de Sistemas)',
      status: 'In progress',
      start: '2021-03',
      end: null,
    },
    {
      school: 'Escuela Técnica N.º 36',
      detail: '“Alte. Guillermo Brown”',
      program: 'Technical Diploma in Information Technology',
      start: '2015-03',
      end: '2020-12',
    },
  ],
  training: [
    { name: 'IBM Startup Challenge', year: '2021' },
    { name: 'CoderHouse', detail: 'JavaScript, React, Web Development', year: '2022' },
    { name: 'Udemy', detail: 'Node.js with MongoDB, Angular + OpenAI, React Hooks & Redux, React Native with Expo', year: '2023–24' },
  ],
  languages: [
    { name: 'Spanish', level: 'Native' },
    { name: 'English', level: 'Professional working proficiency' },
  ],
};
