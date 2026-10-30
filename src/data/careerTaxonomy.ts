// Ontology mapping Career Goals to foundational, specialized skills and domain keywords
export interface CareerPathway {
  goal: string;
  aliases: string[];
  coreSkills: string[];
  recommendedKeywords: string[];
  description: string;
}

export const CAREER_PATHWAYS: CareerPathway[] = [
  {
    goal: 'AI Engineer',
    aliases: ['Artificial Intelligence Engineer', 'AI/ML Engineer', 'Machine Learning Engineer', 'Deep Learning Specialist'],
    coreSkills: ['Python', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'PyTorch', 'TensorFlow', 'Natural Language Processing', 'Computer Vision', 'Mathematics', 'Statistics'],
    recommendedKeywords: ['AI', 'ML', 'Deep Learning', 'Data Science', 'Linear Algebra', 'NLP', 'Computer Vision'],
    description: 'Designs and builds intelligent autonomous systems, machine learning models, and deep neural architectures.'
  },
  {
    goal: 'Data Scientist',
    aliases: ['Data Analyst', 'Big Data Specialist', 'Business Intelligence Analyst', 'Analytics Engineer'],
    coreSkills: ['Python', 'SQL', 'Data Analytics', 'Statistics', 'Pandas', 'Data Visualization', 'Machine Learning', 'Big Data', 'R Programming', 'Tableau'],
    recommendedKeywords: ['Data Science', 'Statistics', 'Analytics', 'Business Intelligence', 'Database', 'Predictive Modeling'],
    description: 'Extracts actionable insights from complex datasets using statistical modeling, data visualization, and exploratory analysis.'
  },
  {
    goal: 'Cloud Architect',
    aliases: ['Cloud Engineer', 'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Solutions Architect'],
    coreSkills: ['AWS', 'Cloud Computing', 'Docker', 'Kubernetes', 'Microservices', 'Distributed Systems', 'Linux', 'DevOps', 'Terraform', 'CI/CD'],
    recommendedKeywords: ['Cloud', 'DevOps', 'Distributed Systems', 'Virtualization', 'Infrastructure', 'Networking'],
    description: 'Architects scalable, fault-tolerant cloud infrastructures and automated continuous deployment pipelines.'
  },
  {
    goal: 'Full Stack Developer',
    aliases: ['Software Engineer', 'Web Developer', 'Frontend Developer', 'Backend Developer', 'Application Engineer'],
    coreSkills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'HTML/CSS', 'SQL', 'REST APIs', 'Web Development', 'System Design', 'Git'],
    recommendedKeywords: ['Web Development', 'Software Engineering', 'Frontend', 'Backend', 'Database Systems', 'UI/UX'],
    description: 'Builds responsive client-side interfaces, performant APIs, and end-to-end web applications.'
  },
  {
    goal: 'Cybersecurity Analyst',
    aliases: ['Information Security Specialist', 'Security Engineer', 'Penetration Tester', 'Ethical Hacker'],
    coreSkills: ['Network Security', 'Cryptography', 'Ethical Hacking', 'Cybersecurity', 'Linux', 'Threat Modeling', 'Incident Response', 'Identity Management'],
    recommendedKeywords: ['Security', 'Cryptography', 'Networking', 'Vulnerability Assessment', 'Forensics'],
    description: 'Protects enterprise digital assets, conducts threat evaluations, and implements cryptographic safeguards.'
  },
  {
    goal: 'Product Manager',
    aliases: ['Technical Product Manager', 'Product Owner', 'Technology Consultant', 'Business Analyst'],
    coreSkills: ['Agile Methodologies', 'User Research', 'Product Design', 'Business Analytics', 'Project Management', 'Tech Strategy', 'Communication', 'Data-Driven Decision Making'],
    recommendedKeywords: ['Management', 'Strategy', 'Analytics', 'Human-Computer Interaction', 'Innovation'],
    description: 'Bridges engineering, user experience, and business strategy to deliver impactful digital products.'
  },
  {
    goal: 'Systems / Embedded Engineer',
    aliases: ['Embedded Systems Developer', 'IoT Engineer', 'Firmware Engineer', 'Robotics Engineer'],
    coreSkills: ['C/C++', 'Operating Systems', 'Microcontrollers', 'IoT', 'Embedded Systems', 'Computer Architecture', 'RTOS', 'Hardware Interfacing'],
    recommendedKeywords: ['Embedded', 'IoT', 'Hardware', 'Robotics', 'Systems Programming', 'Electronics'],
    description: 'Develops low-level firmware, real-time operating system applications, and hardware-software integrated IoT devices.'
  }
];

// Helper to find pathway
export function getCareerPathway(goal: string): CareerPathway | undefined {
  const normalized = goal.toLowerCase().trim();
  return CAREER_PATHWAYS.find(
    p => p.goal.toLowerCase() === normalized || p.aliases.some(a => a.toLowerCase().includes(normalized) || normalized.includes(a.toLowerCase()))
  );
}

// Calculate semantic/tag alignment score between elective tags and student career goal
export function calculateCareerMatchScore(
  electiveCareerTags: string[],
  electiveSkillTags: string[],
  studentGoal: string
): { score: number; matchedSkills: string[]; matchedCareers: string[] } {
  const pathway = getCareerPathway(studentGoal);
  const normalizedGoal = studentGoal.toLowerCase().trim();
  
  const matchedCareers: string[] = [];
  const matchedSkills: string[] = [];
  let score = 0;

  // Direct goal match
  for (const cTag of electiveCareerTags) {
    const cNorm = cTag.toLowerCase().trim();
    if (cNorm.includes(normalizedGoal) || normalizedGoal.includes(cNorm)) {
      matchedCareers.push(cTag);
      score += 45;
    }
  }

  // Ontology match through core skills and keywords
  if (pathway) {
    for (const sTag of electiveSkillTags) {
      const sNorm = sTag.toLowerCase().trim();
      const match = pathway.coreSkills.find(cs => cs.toLowerCase() === sNorm || sNorm.includes(cs.toLowerCase()) || cs.toLowerCase().includes(sNorm));
      if (match && !matchedSkills.includes(sTag)) {
        matchedSkills.push(sTag);
        score += 15;
      }
    }

    for (const cTag of electiveCareerTags) {
      const cNorm = cTag.toLowerCase().trim();
      const match = pathway.recommendedKeywords.find(kw => kw.toLowerCase() === cNorm || cNorm.includes(kw.toLowerCase()));
      if (match && !matchedCareers.includes(cTag)) {
        matchedCareers.push(cTag);
        score += 20;
      }
    }
  } else {
    // Fallback substring matching
    for (const sTag of electiveSkillTags) {
      if (normalizedGoal.includes(sTag.toLowerCase())) {
        matchedSkills.push(sTag);
        score += 20;
      }
    }
  }

  // Cap score at 100
  return {
    score: Math.min(100, Math.round(score)),
    matchedSkills,
    matchedCareers
  };
}
