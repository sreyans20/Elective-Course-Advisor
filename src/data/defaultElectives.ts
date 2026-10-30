import { Elective, TimetableSlot } from '../types';

export function parseSlotString(slotStr: string): TimetableSlot[] {
  if (!slotStr || slotStr.trim() === '' || slotStr.toLowerCase() === 'none') {
    return [];
  }
  const parts = slotStr.split(',').map(s => s.trim());
  const parsed: TimetableSlot[] = [];

  for (const part of parts) {
    // Formats like "Mon 10:00-11:00" or "Tue 14:00-16:00"
    const match = part.match(/(Mon|Tue|Wed|Thu|Fri)\s+(\d{1,2}):?(\d{2})?-(\d{1,2}):?(\d{2})?/i);
    if (match) {
      const day = (match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()) as TimetableSlot['day'];
      const startHour = parseInt(match[2], 10);
      const endHour = parseInt(match[4], 10);
      parsed.push({
        day,
        startHour,
        endHour,
        raw: part
      });
    } else {
      // Fallback
      parsed.push({
        day: 'Mon',
        startHour: 9,
        endHour: 10,
        raw: part
      });
    }
  }

  return parsed;
}

export const DEFAULT_ELECTIVES: Elective[] = [
  {
    id: 'CS401',
    name: 'Machine Learning',
    type: 'Professional Elective',
    timetableSlot: 'Mon 10:00-11:00',
    slots: parseSlotString('Mon 10:00-11:00'),
    prerequisites: ['Python', 'Mathematics'],
    difficulty: 4,
    weeklyHours: 4,
    careerTags: ['Artificial Intelligence', 'Data Science', 'Machine Learning'],
    skillTags: ['Python', 'Scikit-Learn', 'Supervised Learning', 'Linear Algebra', 'Model Evaluation'],
    description: 'Foundations of statistical learning, supervised/unsupervised algorithms, regression, and regularization.',
    department: 'Computer Science'
  },
  {
    id: 'CS402',
    name: 'Deep Learning & Neural Networks',
    type: 'Professional Elective',
    timetableSlot: 'Wed 11:00-12:00',
    slots: parseSlotString('Wed 11:00-12:00'),
    prerequisites: ['Machine Learning'],
    difficulty: 5,
    weeklyHours: 5,
    careerTags: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision'],
    skillTags: ['PyTorch', 'TensorFlow', 'CNNs', 'RNNs', 'Deep Neural Networks', 'Backpropagation'],
    description: 'Deep neural architectures, convolutional networks, attention mechanisms, and gradient descent optimization.',
    department: 'Computer Science'
  },
  {
    id: 'CS403',
    name: 'Natural Language Processing',
    type: 'Professional Elective',
    timetableSlot: 'Fri 14:00-15:00',
    slots: parseSlotString('Fri 14:00-15:00'),
    prerequisites: ['Python', 'Machine Learning'],
    difficulty: 4,
    weeklyHours: 4,
    careerTags: ['Artificial Intelligence', 'Data Science'],
    skillTags: ['NLP', 'Transformers', 'HuggingFace', 'Tokenization', 'Language Models', 'Python'],
    description: 'Statistical language processing, sentiment analysis, word embeddings, sequence-to-sequence, and transformers.',
    department: 'Computer Science'
  },
  {
    id: 'CS404',
    name: 'Computer Vision',
    type: 'Professional Elective',
    timetableSlot: 'Thu 10:00-11:00',
    slots: parseSlotString('Thu 10:00-11:00'),
    prerequisites: ['Python', 'Mathematics'],
    difficulty: 4,
    weeklyHours: 4,
    careerTags: ['Artificial Intelligence', 'Robotics'],
    skillTags: ['OpenCV', 'Image Processing', 'Object Detection', 'PyTorch', 'CNNs'],
    description: 'Visual perception, image transformations, feature extraction, object detection, and segmentation.',
    department: 'Computer Science'
  },
  {
    id: 'CS405',
    name: 'Cloud Computing Architecture',
    type: 'Professional Elective',
    timetableSlot: 'Mon 10:00-11:00', // Deliberate slot conflict with CS401 (Machine Learning)
    slots: parseSlotString('Mon 10:00-11:00'),
    prerequisites: ['Operating Systems', 'Computer Networks'],
    difficulty: 3,
    weeklyHours: 3,
    careerTags: ['Cloud Engineering', 'DevOps', 'Distributed Systems'],
    skillTags: ['AWS', 'Cloud Computing', 'Virtualization', 'Serverless', 'Microservices', 'Storage'],
    description: 'Cloud design patterns, scalability, serverless architectures, multi-region deployments, and AWS ecosystem.',
    department: 'Computer Science'
  },
  {
    id: 'CS406',
    name: 'DevOps & Container Orchestration',
    type: 'Professional Elective',
    timetableSlot: 'Tue 09:00-10:00',
    slots: parseSlotString('Tue 09:00-10:00'),
    prerequisites: ['Operating Systems'],
    difficulty: 3,
    weeklyHours: 4,
    careerTags: ['Cloud Engineering', 'DevOps', 'Software Engineering'],
    skillTags: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform', 'GitHub Actions'],
    description: 'Continuous integration and continuous deployment pipelines, containerization, and automated cluster deployment.',
    department: 'Computer Science'
  },
  {
    id: 'CS407',
    name: 'Distributed Systems',
    type: 'Professional Elective',
    timetableSlot: 'Thu 14:00-15:00',
    slots: parseSlotString('Thu 14:00-15:00'),
    prerequisites: ['Computer Networks', 'Operating Systems'],
    difficulty: 5,
    weeklyHours: 5,
    careerTags: ['Cloud Engineering', 'Backend Engineering'],
    skillTags: ['Distributed Systems', 'Consensus Algorithms', 'Raft', 'Fault Tolerance', 'CAP Theorem'],
    description: 'Consensus protocols, RPC frameworks, replication strategies, and fault-tolerant large-scale design.',
    department: 'Computer Science'
  },
  {
    id: 'CS408',
    name: 'Big Data Analytics',
    type: 'Professional Elective',
    timetableSlot: 'Wed 14:00-15:00',
    slots: parseSlotString('Wed 14:00-15:00'),
    prerequisites: ['Database Systems', 'Python'],
    difficulty: 4,
    weeklyHours: 4,
    careerTags: ['Data Science', 'Data Engineering'],
    skillTags: ['Apache Spark', 'Hadoop', 'SQL', 'Big Data', 'Distributed Querying', 'Data Pipelines'],
    description: 'Processing massive distributed datasets using MapReduce, Apache Spark, and resilient distributed datasets.',
    department: 'Computer Science'
  },
  {
    id: 'CS409',
    name: 'Data Warehousing & Mining',
    type: 'Professional Elective',
    timetableSlot: 'Tue 11:00-12:00',
    slots: parseSlotString('Tue 11:00-12:00'),
    prerequisites: ['Database Systems'],
    difficulty: 3,
    weeklyHours: 3,
    careerTags: ['Data Science', 'Business Intelligence'],
    skillTags: ['SQL', 'ETL Pipelines', 'OLAP Cubes', 'Data Mining', 'Schema Design', 'Data Analytics'],
    description: 'Dimensional modeling, ETL workflow construction, association rule mining, and analytical data marts.',
    department: 'Computer Science'
  },
  {
    id: 'CS410',
    name: 'Advanced Web Application Engineering',
    type: 'Professional Elective',
    timetableSlot: 'Tue 14:00-15:00',
    slots: parseSlotString('Tue 14:00-15:00'),
    prerequisites: ['Data Structures'],
    difficulty: 2,
    weeklyHours: 4,
    careerTags: ['Full Stack Development', 'Software Engineering'],
    skillTags: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Web Development', 'State Management'],
    description: 'Modern frontend frameworks, micro-frontends, REST/GraphQL backend architecture, and caching.',
    department: 'Computer Science'
  },
  {
    id: 'CS411',
    name: 'Mobile Application Architecture',
    type: 'Professional Elective',
    timetableSlot: 'Fri 09:00-10:00',
    slots: parseSlotString('Fri 09:00-10:00'),
    prerequisites: ['Data Structures'],
    difficulty: 3,
    weeklyHours: 3,
    careerTags: ['Full Stack Development', 'Mobile Engineering'],
    skillTags: ['React Native', 'Kotlin', 'Mobile UX', 'Offline Storage', 'REST APIs'],
    description: 'Cross-platform mobile application development, device sensors, push notifications, and local caching.',
    department: 'Computer Science'
  },
  {
    id: 'CS412',
    name: 'Cybersecurity Principles & Defense',
    type: 'Professional Elective',
    timetableSlot: 'Wed 09:00-10:00',
    slots: parseSlotString('Wed 09:00-10:00'),
    prerequisites: ['Computer Networks'],
    difficulty: 3,
    weeklyHours: 3,
    careerTags: ['Cybersecurity', 'Information Security'],
    skillTags: ['Cybersecurity', 'Network Security', 'Firewalls', 'Threat Modeling', 'Vulnerability Assessment'],
    description: 'Security architectures, access control, packet inspection, incident remediation, and system hardening.',
    department: 'Computer Science'
  },
  {
    id: 'CS413',
    name: 'Applied Cryptography',
    type: 'Professional Elective',
    timetableSlot: 'Mon 14:00-15:00',
    slots: parseSlotString('Mon 14:00-15:00'),
    prerequisites: ['Mathematics', 'Data Structures'],
    difficulty: 5,
    weeklyHours: 4,
    careerTags: ['Cybersecurity', 'Blockchain'],
    skillTags: ['Cryptography', 'Public Key Infrastructure', 'Symmetric Ciphers', 'Zero-Knowledge Proofs', 'Hashing'],
    description: 'Mathematical foundations of modern cryptography, RSA, elliptic curves, signatures, and post-quantum methods.',
    department: 'Computer Science'
  },
  {
    id: 'CS414',
    name: 'Internet of Things & Embedded Systems',
    type: 'Professional Elective',
    timetableSlot: 'Thu 11:00-12:00',
    slots: parseSlotString('Thu 11:00-12:00'),
    prerequisites: ['Computer Networks', 'Electronics'],
    difficulty: 3,
    weeklyHours: 4,
    careerTags: ['Systems / Embedded Engineer', 'IoT'],
    skillTags: ['IoT', 'Microcontrollers', 'Embedded Systems', 'MQTT', 'Hardware Interfacing', 'C/C++'],
    description: 'Sensor network protocols, edge computing, microcontroller interfacing, and firmware development.',
    department: 'Electronics & Computer'
  },
  {
    id: 'CS415',
    name: 'Compiler Design & Program Analysis',
    type: 'Professional Elective',
    timetableSlot: 'Mon 11:00-12:00',
    slots: parseSlotString('Mon 11:00-12:00'),
    prerequisites: ['Theory of Computation', 'Data Structures'],
    difficulty: 5,
    weeklyHours: 5,
    careerTags: ['Systems / Embedded Engineer', 'Software Engineering'],
    skillTags: ['Lexical Analysis', 'Parsing', 'Intermediate Representation', 'Optimization', 'C/C++'],
    description: 'Lexing, LL/LR parsing, semantic analysis, intermediate representation generation, and compiler optimizations.',
    department: 'Computer Science'
  },
  {
    id: 'CS416',
    name: 'Blockchain & Smart Contract Protocols',
    type: 'Professional Elective',
    timetableSlot: 'Tue 16:00-17:00',
    slots: parseSlotString('Tue 16:00-17:00'),
    prerequisites: ['Cryptography', 'Data Structures'],
    difficulty: 4,
    weeklyHours: 4,
    careerTags: ['Cybersecurity', 'FinTech', 'Backend Engineering'],
    skillTags: ['Blockchain', 'Solidity', 'Smart Contracts', 'Decentralized Applications', 'Consensus Algorithms'],
    description: 'Decentralized ledgers, consensus mechanisms, Ethereum virtual machine, and smart contract security.',
    department: 'Computer Science'
  },

  // OPEN ELECTIVES
  {
    id: 'OE301',
    name: 'UI/UX Design & Human-Computer Interaction',
    type: 'Open Elective',
    timetableSlot: 'Wed 16:00-17:00',
    slots: parseSlotString('Wed 16:00-17:00'),
    prerequisites: [], // No prerequisite
    difficulty: 2,
    weeklyHours: 3,
    careerTags: ['Product Manager', 'Full Stack Development'],
    skillTags: ['UI/UX', 'Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
    description: 'User-centered design principles, wireframing, heuristic evaluation, design thinking, and usability testing.',
    department: 'Design & Humanities'
  },
  {
    id: 'OE302',
    name: 'Tech Entrepreneurship & Product Strategy',
    type: 'Open Elective',
    timetableSlot: 'Thu 16:00-17:00',
    slots: parseSlotString('Thu 16:00-17:00'),
    prerequisites: [],
    difficulty: 2,
    weeklyHours: 3,
    careerTags: ['Product Manager', 'Management'],
    skillTags: ['Product Strategy', 'Agile Methodologies', 'Business Models', 'Pitching', 'Market Research'],
    description: 'Lean startup methodology, product-market fit, unit economics, venture pitching, and roadmap prioritization.',
    department: 'Management Studies'
  },
  {
    id: 'OE303',
    name: 'Financial Technology & Quantitative Analysis',
    type: 'Open Elective',
    timetableSlot: 'Fri 11:00-12:00',
    slots: parseSlotString('Fri 11:00-12:00'),
    prerequisites: ['Mathematics'],
    difficulty: 3,
    weeklyHours: 3,
    careerTags: ['Data Science', 'FinTech'],
    skillTags: ['Financial Modeling', 'Algorithmic Trading', 'Statistics', 'Risk Management', 'Python'],
    description: 'Algorithmic trading systems, risk analytics, portfolio optimization, and decentralized finance metrics.',
    department: 'Finance & Economics'
  },
  {
    id: 'OE304',
    name: 'Cyber Law, Privacy & Digital Ethics',
    type: 'Open Elective',
    timetableSlot: 'Mon 16:00-17:00',
    slots: parseSlotString('Mon 16:00-17:00'),
    prerequisites: [],
    difficulty: 1,
    weeklyHours: 2,
    careerTags: ['Cybersecurity', 'Product Manager'],
    skillTags: ['Digital Ethics', 'GDPR', 'Compliance', 'IP Rights', 'Cyber Law'],
    description: 'Regulatory frameworks, data protection acts (GDPR, DPDP), digital forensics legalities, and AI ethics.',
    department: 'Law & Governance'
  },
  {
    id: 'OE305',
    name: 'Industrial Robotics & Automation',
    type: 'Open Elective',
    timetableSlot: 'Wed 11:00-12:00', // Deliberate slot conflict with CS402 (Deep Learning)
    slots: parseSlotString('Wed 11:00-12:00'),
    prerequisites: ['Mathematics', 'Electronics'],
    difficulty: 4,
    weeklyHours: 4,
    careerTags: ['Systems / Embedded Engineer', 'Robotics'],
    skillTags: ['Robotics', 'Kinematics', 'Control Systems', 'Automation', 'Sensors'],
    description: 'Forward/inverse kinematics, robotic arm trajectories, industrial automation programmable logic, and sensors.',
    department: 'Mechanical & Automation'
  },
  {
    id: 'OE306',
    name: 'Data Visualization & Storytelling',
    type: 'Open Elective',
    timetableSlot: 'Thu 11:00-12:00', // Deliberate slot conflict with CS414 (IoT)
    slots: parseSlotString('Thu 11:00-12:00'),
    prerequisites: [],
    difficulty: 2,
    weeklyHours: 3,
    careerTags: ['Data Scientist', 'Product Manager'],
    skillTags: ['Tableau', 'Data Visualization', 'Storytelling', 'D3.js', 'Dashboard Design', 'Data Analytics'],
    description: 'Information visualization theory, exploratory dashboards, visual encoding rules, and stakeholder narratives.',
    department: 'Data Science & Media'
  },
  {
    id: 'OE307',
    name: 'Environmental Informatics & Sustainability',
    type: 'Open Elective',
    timetableSlot: 'Tue 10:00-11:00',
    slots: parseSlotString('Tue 10:00-11:00'),
    prerequisites: [],
    difficulty: 2,
    weeklyHours: 2,
    careerTags: ['Data Science', 'Management'],
    skillTags: ['Sustainability', 'GIS', 'Carbon Accounting', 'Environmental Modeling', 'Analytics'],
    description: 'Geospatial analytics, climate modeling tools, green computing architectures, and ESG compliance analytics.',
    department: 'Environmental Science'
  },
  {
    id: 'OE308',
    name: 'Quantum Computing Fundamentals',
    type: 'Open Elective',
    timetableSlot: 'Fri 15:00-16:00',
    slots: parseSlotString('Fri 15:00-16:00'),
    prerequisites: ['Mathematics'],
    difficulty: 5,
    weeklyHours: 4,
    careerTags: ['Artificial Intelligence', 'Cybersecurity'],
    skillTags: ['Quantum Algorithms', 'Qubits', 'Quantum Circuits', 'Linear Algebra', 'Qiskit'],
    description: 'Quantum superposition, entanglement, Grover & Shor algorithms, and quantum circuit simulator labs.',
    department: 'Physics & Computing'
  }
];
