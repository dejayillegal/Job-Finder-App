import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function parseResume(file: Buffer, filename: string) {
  let text = '';

  if (filename.endsWith('.pdf')) {
    const data = await pdfParse(file);
    text = data.text;
  } else if (filename.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer: file });
    text = result.value;
  } else {
    throw new Error('Unsupported file format');
  }

  // Extract skills using keywords
  const qaKeywords = [
    'selenium', 'cypress', 'playwright', 'api testing', 'automation',
    'manual testing', 'jmeter', 'postman', 'jira', 'agile', 'scrum',
    'performance testing', 'load testing', 'test management', 'qa', 'quality',
    'python', 'java', 'javascript', 'jenkins', 'ci/cd', 'docker', 'kubernetes'
  ];

  const lowerText = text.toLowerCase();
  const foundSkills = qaKeywords.filter(skill => lowerText.includes(skill));

  // Extract experience years
  const expMatch = text.match(/(\d+)\+?\s*(years?|yrs?)/i);
  const experienceYears = expMatch ? parseInt(expMatch[1]) : 0;

  // Extract current role
  const roleMatch = text.match(/(qa|test|quality|sdet|automation)\s+(manager|lead|engineer|architect)/i);
  const currentRole = roleMatch ? roleMatch[0] : '';

  return {
    rawText: text,
    skills: foundSkills,
    experienceYears,
    currentRole,
    keywords: foundSkills.join(', ')
  };
}