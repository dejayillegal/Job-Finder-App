export interface ATSScore {
  overall: number;
  breakdown: {
    keywords: number;
    formatting: number;
    experience: number;
    education: number;
    skills: number;
  };
  recommendations: string[];
}

export function calculateATSScore(resumeText: string, parsedData: any): ATSScore {
  const scores = {
    keywords: 0,
    formatting: 0,
    experience: 0,
    education: 0,
    skills: 0
  };

  const recommendations: string[] = [];

  // Keywords score (30%)
  const importantKeywords = ['experience', 'skills', 'education', 'projects', 'achievements'];
  let keywordCount = 0;
  importantKeywords.forEach(keyword => {
    if (resumeText.toLowerCase().includes(keyword)) keywordCount++;
  });
  scores.keywords = Math.min((keywordCount / importantKeywords.length) * 100, 100);

  if (scores.keywords < 60) {
    recommendations.push('Add more relevant keywords like "experience", "skills", and "achievements"');
  }

  // Formatting score (20%)
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(?:\+\d{1,3}[- ]?)?(?:\(?\d{3}\)?[- ]?)?\d{3}[- ]?\d{4}/.test(resumeText);
  const hasSections = resumeText.toLowerCase().includes('experience') && 
                     resumeText.toLowerCase().includes('education');

  let formatScore = 0;
  if (hasEmail) formatScore += 35;
  if (hasPhone) formatScore += 35;
  if (hasSections) formatScore += 30;
  scores.formatting = formatScore;

  if (!hasEmail) recommendations.push('Add your email address');
  if (!hasPhone) recommendations.push('Add your phone number');

  // Experience score (20%)
  const experienceYears = parsedData?.experience || 0;
  scores.experience = Math.min((experienceYears / 10) * 100, 100);

  if (experienceYears < 2) {
    recommendations.push('Highlight any internships or relevant projects');
  }

  // Education score (15%)
  const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college'];
  let educationCount = 0;
  educationKeywords.forEach(keyword => {
    if (resumeText.toLowerCase().includes(keyword)) educationCount++;
  });
  scores.education = Math.min((educationCount / 3) * 100, 100);

  if (scores.education < 50) {
    recommendations.push('Add your educational qualifications');
  }

  // Skills score (15%)
  const skillCount = parsedData?.skills?.length || 0;
  scores.skills = Math.min((skillCount / 10) * 100, 100);

  if (skillCount < 5) {
    recommendations.push('Add more relevant technical skills');
  }

  // Calculate overall score
  const overall = Math.round(
    scores.keywords * 0.30 +
    scores.formatting * 0.20 +
    scores.experience * 0.20 +
    scores.education * 0.15 +
    scores.skills * 0.15
  );

  return {
    overall,
    breakdown: scores,
    recommendations
  };
}
