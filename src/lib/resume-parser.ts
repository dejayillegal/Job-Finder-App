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

export function extractSkills(text: string): string[] {
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
    'React', 'Angular', 'Vue', 'Node.js', 'Express',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'Jenkins', 'Selenium', 'Jest',
    'Agile', 'Scrum', 'Leadership', 'Testing', 'QA',
    'Automation', 'Manual Testing', 'API Testing'
  ];

  const lowerText = text.toLowerCase();
  const foundSkills: string[] = [];

  skillKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return [...new Set(foundSkills)];
}

export function extractExperience(text: string): number {
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
    /experience.*?(\d+)\+?\s*years?/gi,
    /(\d+)\s*years?.*?experience/gi
  ];

  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
  }

  return 0;
}

export function parseResumeData(text: string) {
  const skills = extractSkills(text);
  const experience = extractExperience(text);

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // Extract phone
  const phoneMatch = text.match(/(?:\+\d{1,3}[- ]?)?(?:\(?\d{3}\)?[- ]?)?\d{3}[- ]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  return {
    email,
    phone,
    skills,
    experience,
    rawText: text
  };
}
