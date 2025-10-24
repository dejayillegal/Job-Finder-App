import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function parseResumeFile(buffer: Buffer, filename: string): Promise<string> {
  const extension = filename.split('.').pop()?.toLowerCase();

  try {
    if (extension === 'pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (extension === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (extension === 'txt') {
      return buffer.toString('utf-8');
    }
    throw new Error('Unsupported file format');
  } catch (error) {
    throw new Error('Failed to parse resume');
  }
}

export const TARGET_SKILLS = [
  // QA/Testing Core Skills
  'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript',
  'Selenium', 'Appium', 'pytest', 'TestNG', 'JUnit', 'Cypress',
  'API Testing', 'REST API', 'SOAP', 'Postman', 'REST Assured',
  'Performance Testing', 'JMeter', 'LoadRunner', 'K6',
  'Mobile Testing', 'Android', 'iOS', 'React Native', 'Flutter',

  // Automation & CI/CD
  'Jenkins', 'GitLab CI', 'GitHub Actions', 'Azure DevOps', 'CircleCI',
  'CI/CD', 'Docker', 'Kubernetes', 'Git', 'SVN',
  'Test Automation', 'Framework Development', 'BDD', 'TDD',

  // Embedded & Specialized
  'GNSS', 'GPS', 'BLE', 'Bluetooth', 'IoT', 'RTOS', 'Embedded Systems',
  'OTA', 'Firmware Testing', 'Hardware Testing', 'Protocol Testing',

  // Regulatory & Compliance  
  'FDA 21 CFR', 'ISO 13485', 'IEC 62304', 'MDD', 'MDR', 'QMS',
  'Medical Devices', 'Healthcare', 'Compliance Testing', 'Audit',

  // Management & Strategy
  'Test Strategy', 'Test Planning', 'Risk Assessment', 'Team Leadership',
  'Agile', 'Scrum', 'Kanban', 'Project Management', 'Stakeholder Management',

  // Tools & Technologies
  'JIRA', 'Confluence', 'TestRail', 'Zephyr', 'ALM', 'Quality Center',
  'SQL', 'Database Testing', 'ETL Testing', 'Data Validation',
  'AWS', 'Azure', 'GCP', 'Cloud Testing', 'Microservices'
];

export function extractAdvancedSkills(text: string): { skill: string; confidence: number }[] {
  const lowerText = text.toLowerCase();
  const skillMatches: { skill: string; confidence: number }[] = [];

  TARGET_SKILLS.forEach(skill => {
    const skillLower = skill.toLowerCase();
    let confidence = 0;

    // Direct mention
    if (lowerText.includes(skillLower)) {
      confidence += 0.8;
    }

    // Contextual mentions (near keywords like "experience", "proficient", etc.)
    const contextWords = ['experience', 'expert', 'proficient', 'skilled', 'knowledge', 'certified'];
    contextWords.forEach(context => {
      const regex = new RegExp(`${context}.*?${skillLower}|${skillLower}.*?${context}`, 'gi');
      if (regex.test(lowerText)) {
        confidence += 0.2;
      }
    });

    // Years of experience mention
    const expRegex = new RegExp(`(\\d+)\\+?\\s*years?.*?${skillLower}|${skillLower}.*?(\\d+)\\+?\\s*years?`, 'gi');
    if (expRegex.test(lowerText)) {
      confidence += 0.3;
    }

    if (confidence > 0) {
      skillMatches.push({ skill, confidence: Math.min(confidence, 1.0) });
    }
  });

  return skillMatches
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 25); // Top 25 skills
}

export function extractWorkExperience(text: string): {
  totalYears: number;
  positions: Array<{
    title: string;
    company: string;
    duration: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
} {
  const positions: Array<any> = [];
  let totalYears = 0;

  // Extract total experience patterns
  const totalExpPatterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:total\s+)?experience/gi,
    /experience.*?(\d+)\+?\s*years?/gi,
    /(\d+)\s*years?.*?experience/gi,
    /(\d+)\+\s*years?\s+in/gi
  ];

  for (const pattern of totalExpPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      const years = matches.map(match => {
        const numMatch = match.match(/(\d+)/);
        return numMatch ? parseInt(numMatch[1]) : 0;
      });
      totalYears = Math.max(totalYears, ...years);
    }
  }

  // Extract individual positions
  const lines = text.split('\n');
  let currentPosition: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look for job titles (usually followed by company or dates)
    const titlePatterns = [
      /^(.*?)(?:\s*[-|@]\s*(.+?))?\s*$/,
      /^(.+?)\s*\|\s*(.+?)$/,
      /^(.+?)\s*at\s*(.+?)$/i,
      /^(.+?)\s*-\s*(.+?)$/
    ];

    // Look for date ranges
    const datePattern = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2})[\w\s]*\d{4})\s*[-–—]\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current|\d{1,2})[\w\s]*(?:\d{4})?)/gi;

    if (datePattern.test(line)) {
      const dateMatch = line.match(datePattern);
      if (dateMatch && currentPosition) {
        currentPosition.duration = dateMatch[0];

        // Try to parse start and end dates
        const dates = dateMatch[0].split(/[-–—]/);
        if (dates.length >= 2) {
          currentPosition.startDate = dates[0].trim();
          currentPosition.endDate = dates[1].trim();
        }
      }
    }

    // Look for company/position combinations
    for (const pattern of titlePatterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[1].length > 3) {
        if (currentPosition) {
          positions.push(currentPosition);
        }

        currentPosition = {
          title: match[1].trim(),
          company: match[2] ? match[2].trim() : '',
          duration: '',
          description: ''
        };
        break;
      }
    }

    // Add description lines to current position
    if (currentPosition && line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      currentPosition.description += (currentPosition.description ? '\n' : '') + line;
    }
  }

  if (currentPosition) {
    positions.push(currentPosition);
  }

  // Calculate total years from positions if not explicitly stated
  if (totalYears === 0 && positions.length > 0) {
    totalYears = Math.min(positions.length * 2, 15); // Estimate 2 years per position, max 15
  }

  return { totalYears, positions };
}

export function extractEducation(text: string): Array<{
  degree: string;
  institution: string;
  year?: string;
  field?: string;
}> {
  const education: Array<any> = [];
  const lines = text.split('\n');

  const degreePatterns = [
    /\b(bachelor|master|phd|doctorate|diploma|certificate|b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|mba|bba)\b/gi,
    /\b(b\.?a|m\.?a|b\.?com|m\.?com)\b/gi
  ];

  for (const line of lines) {
    for (const pattern of degreePatterns) {
      if (pattern.test(line)) {
        const yearMatch = line.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? yearMatch[0] : undefined;

        education.push({
          degree: line.trim(),
          institution: '',
          year,
          field: ''
        });
        break;
      }
    }
  }

  return education;
}

export function extractContactInfo(text: string): {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
} {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  const locationMatch = text.match(/\b(?:bangalore|mumbai|delhi|hyderabad|pune|chennai|kolkata)[\s,]*(?:karnataka|maharashtra|delhi|telangana|andhra pradesh|tamil nadu|west bengal)?\b/gi);

  return {
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
    github: githubMatch ? githubMatch[0] : undefined,
    location: locationMatch ? locationMatch[0] : undefined
  };
}

export function parseEnhancedResumeData(text: string) {
  const skills = extractAdvancedSkills(text);
  const workExperience = extractWorkExperience(text);
  const education = extractEducation(text);
  const contactInfo = extractContactInfo(text);

  return {
    ...contactInfo,
    skills: skills.map(s => s.skill),
    skillsWithConfidence: skills,
    experience: workExperience.totalYears,
    workHistory: workExperience.positions,
    education,
    rawText: text,
    summary: extractSummary(text),
    certifications: extractCertifications(text)
  };
}

function extractSummary(text: string): string {
  const lines = text.split('\n');
  let summary = '';

  // Look for summary/objective sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('summary') || line.includes('objective') || line.includes('profile')) {
      // Take next few lines as summary
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim().length > 0 && !lines[j].includes('experience') && !lines[j].includes('education')) {
          summary += (summary ? ' ' : '') + lines[j].trim();
        }
      }
      break;
    }
  }

  return summary;
}

function extractCertifications(text: string): string[] {
  const certifications: string[] = [];
  const certPatterns = [
    /certified?\s+[\w\s]+/gi,
    /\b[A-Z]+\s+certified\b/gi,
    /certification\s+in\s+[\w\s]+/gi
  ];

  for (const pattern of certPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      certifications.push(...matches.map(m => m.trim()));
    }
  }

  return [...new Set(certifications)];
}