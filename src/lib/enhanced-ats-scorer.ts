export interface EnhancedATSScore {
  overall: number;
  breakdown: {
    keywordsMatch: number;
    skillsAlignment: number;
    experienceLevel: number;
    educationCerts: number;
    formatStructure: number;
    industryFocus: number;
    complianceKnowledge: number;
  };
  recommendations: string[];
  strengths: string[];
  improvements: string[];
  targetRoleMatch: number;
}

export function calculateEnhancedATSScore(
  resumeText: string, 
  parsedData: any,
  targetRole?: string
): EnhancedATSScore {
  const scores = {
    keywordsMatch: 0,
    skillsAlignment: 0,
    experienceLevel: 0,
    educationCerts: 0,
    formatStructure: 0,
    industryFocus: 0,
    complianceKnowledge: 0
  };

  const recommendations: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 1. Keywords Match (25% weight)
  const importantKeywords = [
    'experience', 'skills', 'education', 'projects', 'achievements',
    'led', 'managed', 'developed', 'implemented', 'improved',
    'testing', 'quality', 'automation', 'framework', 'strategy'
  ];

  let keywordCount = 0;
  importantKeywords.forEach(keyword => {
    if (resumeText.toLowerCase().includes(keyword)) keywordCount++;
  });

  scores.keywordsMatch = Math.min((keywordCount / importantKeywords.length) * 100, 100);

  if (scores.keywordsMatch >= 80) {
    strengths.push('Strong keyword optimization');
  } else if (scores.keywordsMatch < 60) {
    recommendations.push('Add more action words like "led", "managed", "implemented"');
    improvements.push('Keyword optimization needed');
  }

  // 2. Skills Alignment (20% weight)
  const targetSkills = [
    'Python', 'Selenium', 'Jenkins', 'CI/CD', 'API Testing', 'Performance Testing',
    'Mobile Testing', 'Test Automation', 'Agile', 'JIRA'
  ];

  const userSkills = parsedData?.skills || [];
  const skillMatches = userSkills.filter((skill: string) => 
    targetSkills.some(target => target.toLowerCase().includes(skill.toLowerCase()) || 
                     skill.toLowerCase().includes(target.toLowerCase()))
  );

  scores.skillsAlignment = Math.min((skillMatches.length / Math.min(targetSkills.length, 10)) * 100, 100);

  if (skillMatches.length >= 8) {
    strengths.push('Excellent technical skills alignment');
  } else if (skillMatches.length < 5) {
    recommendations.push('Add more relevant QA/Testing technical skills');
    improvements.push('Skills alignment below expectations');
  }

  // 3. Experience Level (20% weight)
  const experienceYears = parsedData?.experience || 0;

  if (experienceYears >= 10) {
    scores.experienceLevel = 100;
    strengths.push('Senior level experience');
  } else if (experienceYears >= 5) {
    scores.experienceLevel = 80;
    strengths.push('Good professional experience');
  } else if (experienceYears >= 2) {
    scores.experienceLevel = 60;
  } else {
    scores.experienceLevel = 30;
    recommendations.push('Highlight internships, projects, or relevant coursework');
    improvements.push('Limited professional experience');
  }

  // 4. Education & Certifications (15% weight)
  const educationKeywords = [
    'bachelor', 'master', 'phd', 'degree', 'university', 'college',
    'certified', 'certification', 'training', 'course'
  ];

  let educationCount = 0;
  educationKeywords.forEach(keyword => {
    if (resumeText.toLowerCase().includes(keyword)) educationCount++;
  });

  scores.educationCerts = Math.min((educationCount / 6) * 100, 100);

  if (educationCount >= 5) {
    strengths.push('Strong educational background');
  } else if (educationCount < 3) {
    recommendations.push('Add relevant certifications or training');
    improvements.push('Educational qualifications could be enhanced');
  }

  // 5. Format & Structure (10% weight)
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/.test(resumeText);
  const hasSections = resumeText.toLowerCase().includes('experience') && 
                     resumeText.toLowerCase().includes('education');
  const hasSkillsSection = resumeText.toLowerCase().includes('skills') ||
                          resumeText.toLowerCase().includes('technical');

  let formatScore = 0;
  if (hasEmail) formatScore += 25;
  if (hasPhone) formatScore += 25;
  if (hasSections) formatScore += 25;
  if (hasSkillsSection) formatScore += 25;

  scores.formatStructure = formatScore;

  if (formatScore >= 75) {
    strengths.push('Well-structured resume format');
  } else {
    if (!hasEmail) recommendations.push('Add professional email address');
    if (!hasPhone) recommendations.push('Add contact phone number');
    if (!hasSkillsSection) recommendations.push('Add dedicated skills section');
    improvements.push('Resume structure needs improvement');
  }

  // 6. Industry Focus (5% weight)
  const qaKeywords = [
    'qa', 'quality assurance', 'testing', 'test', 'automation', 'manual testing',
    'regression', 'functional', 'integration', 'system testing', 'user acceptance',
    'defect', 'bug', 'test case', 'test plan', 'test strategy'
  ];

  let qaCount = 0;
  qaKeywords.forEach(keyword => {
    if (resumeText.toLowerCase().includes(keyword)) qaCount++;
  });

  scores.industryFocus = Math.min((qaCount / qaKeywords.length) * 100, 100);

  if (qaCount >= 8) {
    strengths.push('Strong QA/Testing domain focus');
  } else if (qaCount < 4) {
    recommendations.push('Emphasize QA/Testing domain experience');
    improvements.push('Industry focus could be stronger');
  }

  // 7. Compliance Knowledge (5% weight)
  const complianceKeywords = [
    'fda', '21 cfr', 'iso 13485', 'iec 62304', 'medical device', 'healthcare',
    'compliance', 'validation', 'verification', 'regulatory', 'audit',
    'gmp', 'gcp', 'risk management', 'traceability'
  ];

  let complianceCount = 0;
  complianceKeywords.forEach(keyword => {
    if (resumeText.toLowerCase().includes(keyword)) complianceCount++;
  });

  scores.complianceKnowledge = Math.min((complianceCount / complianceKeywords.length) * 100, 100);

  if (complianceCount >= 5) {
    strengths.push('Excellent regulatory compliance knowledge');
  } else if (complianceCount >= 2) {
    strengths.push('Good compliance awareness');
  } else {
    recommendations.push('Consider adding regulatory/compliance experience');
  }

  // Calculate overall score with weights
  const overall = Math.round(
    scores.keywordsMatch * 0.25 +
    scores.skillsAlignment * 0.20 +
    scores.experienceLevel * 0.20 +
    scores.educationCerts * 0.15 +
    scores.formatStructure * 0.10 +
    scores.industryFocus * 0.05 +
    scores.complianceKnowledge * 0.05
  );

  // Target Role Match calculation
  const targetRoleMatch = calculateTargetRoleMatch(resumeText, parsedData, targetRole);

  // Add overall recommendations
  if (overall >= 85) {
    strengths.push('Outstanding resume quality - highly competitive');
  } else if (overall >= 70) {
    strengths.push('Good resume quality - competitive profile');
  } else if (overall < 60) {
    recommendations.push('Consider significant resume improvements for better ATS performance');
    improvements.push('Overall resume quality needs enhancement');
  }

  return {
    overall,
    breakdown: scores,
    recommendations,
    strengths,
    improvements,
    targetRoleMatch
  };
}

function calculateTargetRoleMatch(resumeText: string, parsedData: any, targetRole?: string): number {
  if (!targetRole) return 0;

  const roleKeywords = getRoleSpecificKeywords(targetRole);
  const lowerText = resumeText.toLowerCase();
  let matchCount = 0;

  roleKeywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  });

  return Math.min((matchCount / roleKeywords.length) * 100, 100);
}

function getRoleSpecificKeywords(role: string): string[] {
  const roleMap: Record<string, string[]> = {
    'test manager': ['test strategy', 'team leadership', 'test planning', 'risk management', 'stakeholder management'],
    'qa manager': ['quality assurance', 'process improvement', 'team management', 'quality metrics', 'compliance'],
    'test automation lead': ['selenium', 'test automation', 'framework development', 'ci/cd', 'python', 'jenkins'],
    'sdet': ['programming', 'automation', 'api testing', 'performance testing', 'devops', 'continuous integration'],
    'performance test lead': ['jmeter', 'loadrunner', 'performance testing', 'bottleneck analysis', 'scalability'],
    'embedded qa lead': ['embedded systems', 'firmware testing', 'hardware testing', 'rtos', 'protocol testing']
  };

  const lowerRole = role.toLowerCase();

  for (const [key, keywords] of Object.entries(roleMap)) {
    if (lowerRole.includes(key)) {
      return keywords;
    }
  }

  // Default QA keywords
  return ['testing', 'quality', 'automation', 'agile', 'defect management'];
}