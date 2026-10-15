export interface Role {
  company: string
  title: string
  period: string
  location: string
  highlights: string[]
  stack: string[]
}

export interface Stat {
  value: number
  suffix: string
  label: string
}

export const profile = {
  name: 'Shubham Tiwari',
  firstName: 'Shubham',
  lastName: 'Tiwari',
  title: 'Senior Frontend Engineer',
  location: 'London, United Kingdom',
  email: 'tiwari.shubham.54@hotmail.com',
  linkedin: 'https://www.linkedin.com/in/shubhamtiwari-appdev',
  roles: ['React', 'TypeScript', 'Design Systems', 'AI-Augmented Engineering'],
  summary:
    "Frontend-focused engineer with 10+ years building and scaling customer-facing web applications across insurance, technology and enterprise consulting. I maintain a shared component library used across an organisation's monorepo, and I'm increasingly focused on bringing AI into the software lifecycle: agentic coding workflows, RAG-backed assistants over internal docs, and LLM-powered product features, all held to high standards through TDD, visual regression testing and CI/CD.",
}

export const stats: Stat[] = [
  { value: 10, suffix: '+', label: 'Years shipping production web apps' },
  { value: 70, suffix: '%', label: 'Faster UX after legacy revamp at Rackspace' },
  { value: 90, suffix: '%', label: 'Productivity gain from an app built at EY' },
  { value: 80, suffix: '%', label: 'More resilience to XSS and DDoS at Esri' },
]

export const experience: Role[] = [
  {
    company: 'Aviva',
    title: 'Senior Software Engineer',
    period: 'Oct 2023 – Present',
    location: 'Greater London, UK',
    highlights: [
      'Lead adoption of AI-assisted development: Copilot agents and agentic coding workflows with repository-level instructions and custom skills.',
      'Built RAG-based retrieval over design system and engineering docs so agents answer from the organisation’s own source of truth.',
      'Maintain the shared design system in a monorepo, with semver automated releases, visual regression testing and a custom docs tool.',
      'Built a modern stack from scratch for breakdown-cover journeys with React, Contentful and Node.js.',
    ],
    stack: ['React', 'Next.js', 'TypeScript', 'Angular', 'Contentful', 'Node.js', 'RAG', 'MCP'],
  },
  {
    company: 'Rackspace Technology',
    title: 'Senior Software Development Engineer',
    period: 'Sep 2021 – Sep 2023',
    location: 'Gurugram, India',
    highlights: [
      'Revamped legacy web applications on a modern frontend stack for up to 70% faster user experience.',
      'Partnered with design to build a common design system used across the whole organisation.',
      'Built and maintained CI/CD pipelines with Docker, GitHub Actions and Terraform.',
    ],
    stack: ['React', 'Redux', 'TypeScript', 'AWS', 'Terraform', 'Playwright', 'Cypress', 'Jest'],
  },
  {
    company: 'EY',
    title: 'Senior Analyst',
    period: 'Nov 2019 – Sep 2021',
    location: 'Gurgaon, India',
    highlights: [
      'Designed and built a customer-facing app that cut manual effort and raised productivity by 90%.',
      'Mentored junior developers and solved integration problems across SOA, EDA and microservices.',
      'Selected for the top-performing team at EY Techfest.',
    ],
    stack: ['React', 'Redux', 'Angular', 'SharePoint', 'Azure', 'SQL'],
  },
  {
    company: 'Tavant',
    title: 'Software Engineer',
    period: 'Aug 2018 – Nov 2019',
    location: 'Noida, India',
    highlights: [
      'Frontend developer on a large-scale agriculture platform.',
      'Created rich data visualisations with amCharts, Chart.js and D3.js.',
    ],
    stack: ['Angular', 'React', 'D3.js', 'Chart.js', 'AWS Lambda'],
  },
  {
    company: 'Esri India',
    title: 'Application Developer',
    period: 'Dec 2015 – Aug 2018',
    location: 'India',
    highlights: [
      'Built customer-facing GIS web applications across frontend and backend.',
      'Hardened security for up to 80% greater resilience against XSS and DDoS attacks.',
    ],
    stack: ['JavaScript', 'jQuery', 'C#', 'SASS'],
  },
]

export const skillGroups: { name: string; items: string[] }[] = [
  {
    name: 'Frontend',
    items: ['React', 'Next.js', 'Angular', 'TypeScript', 'Redux', 'HTML5', 'CSS3 / SASS', 'Accessible UI'],
  },
  {
    name: 'AI & Agentic',
    items: ['Claude Code', 'Copilot agents', 'RAG pipelines', 'Vector search', 'LLM APIs', 'MCP', 'Prompt engineering'],
  },
  {
    name: 'Design Systems',
    items: ['Component libraries', 'Monorepos', 'Semver releases', 'Visual regression', 'Docs tooling'],
  },
  {
    name: 'Quality',
    items: ['Jest', 'Cypress', 'Playwright', 'TDD', 'Sentry'],
  },
  {
    name: 'Backend & Cloud',
    items: ['Node.js', 'REST', 'Microservices', 'AWS', 'Azure', 'Docker', 'Terraform', 'GitHub Actions'],
  },
  {
    name: 'Data Viz & CMS',
    items: ['D3.js', 'Chart.js', 'amCharts', 'Contentful', 'SharePoint'],
  },
]

export const education = {
  degree: 'BTech, Computer Science',
  school: 'UPES',
  period: '2012 – 2016',
}

export const awards = ['Award of Excellence', 'EY Appreciate Spot Award', 'Pat on the Back ×2', 'EY Techfest top team']
