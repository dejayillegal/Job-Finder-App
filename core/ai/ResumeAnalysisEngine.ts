import { OpenAI } from 'openai';
import { z } from 'zod';
import { MLModelService } from '@/core/ml/MLModelService';
import { NLPProcessor } from '@/core/nlp/NLPProcessor';
import { SkillTaxonomy } from '@/core/taxonomy/SkillTaxonomy';
import { ExperienceAnalyzer } from '@/core/analysis/ExperienceAnalyzer';
import { CompetencyMapper } from '@/core/mapping/CompetencyMapper';
import { ConfidenceScorer } from '@/core/scoring/ConfidenceScorer';

// Comprehensive resume analysis schema
const ResumeAnalysisSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedIn: z.string().url().optional(),
    github: z.string().url().optional(),
    portfolio: z.string().url().optional(),
  }),

  professionalSummary: z.object({
    summary: z.string(),
    keyStrengths: z.array(z.string()),
    careerObjective: z.string().optional(),
    valueProposition: z.string(),
  }),

  technicalSkills: z.object({
    primarySkills: z.array(z.object({
      skill: z.string(),
      proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
      yearsOfExperience: z.number(),
      lastUsed: z.string().optional(),
      certifications: z.array(z.string()).optional(),
    })),

    toolsAndTechnologies: z.object({
      programmingLanguages: z.array(z.string()),
      frameworks: z.array(z.string()),
      databases: z.array(z.string()),
      cloudPlatforms: z.array(z.string()),
      testingTools: z.array(z.string()),
      cicdTools: z.array(z.string()),
      otherTools: z.array(z.string()),
    }),

    skillCategories: z.object({
      testAutomation: z.number(), // 0-100 score
      manualTesting: z.number(),
      performanceTesting: z.number(),
      securityTesting: z.number(),
      apiTesting: z.number(),
      mobileTesting: z.number(),
      devops: z.number(),
      programming: z.number(),
      leadership: z.number(),
      projectManagement: z.number(),
    }),
  }),

  workExperience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    duration: z.object({
      years: z.number(),
      months: z.number(),
    }),

    responsibilities: z.array(z.string()),
    achievements: z.array(z.object({
      description: z.string(),
      impact: z.string().optional(),
      metrics: z.string().optional(),
    })),

    technologiesUsed: z.array(z.string()),
    teamSize: z.number().optional(),
    projectTypes: z.array(z.string()),
    industryVertical: z.string().optional(),
  })),

  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    graduationYear: z.number(),
    gpa: z.number().optional(),
    relevantCoursework: z.array(z.string()).optional(),
    honors: z.array(z.string()).optional(),
  })),

  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    dateObtained: z.string(),
    expiryDate: z.string().optional(),
    credentialId: z.string().optional(),
    verificationUrl: z.string().url().optional(),
    relevanceScore: z.number(), // 0-100
  })),

  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    role: z.string(),
    duration: z.string(),
    technologiesUsed: z.array(z.string()),
    outcomes: z.array(z.string()),
    url: z.string().url().optional(),
  })),

  analysisMetadata: z.object({
    confidenceScore: z.number(), // 0-100
    processingTime: z.number(), // milliseconds
    modelVersion: z.string(),
    analysisDate: z.string(),

    qualityMetrics: z.object({
      completeness: z.number(), // 0-100
      consistency: z.number(), // 0-100
      accuracy: z.number(), // 0-100
      professionalism: z.number(), // 0-100
    }),

    recommendedImprovements: z.array(z.object({
      category: z.string(),
      suggestion: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'critical']),
      impact: z.string(),
    })),

    marketAlignment: z.object({
      demandScore: z.number(), // 0-100
      competitiveIndex: z.number(), // 0-100
      salaryBenchmark: z.object({
        min: z.number(),
        median: z.number(),
        max: z.number(),
        currency: z.string(),
        region: z.string(),
      }),
    }),
  }),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

export class ResumeAnalysisEngine {
  private openai: OpenAI;
  private mlModelService: MLModelService;
  private nlpProcessor: NLPProcessor;
  private skillTaxonomy: SkillTaxonomy;
  private experienceAnalyzer: ExperienceAnalyzer;
  private competencyMapper: CompetencyMapper;
  private confidenceScorer: ConfidenceScorer;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    this.mlModelService = new MLModelService();
    this.nlpProcessor = new NLPProcessor();
    this.skillTaxonomy = new SkillTaxonomy();
    this.experienceAnalyzer = new ExperienceAnalyzer();
    this.competencyMapper = new CompetencyMapper();
    this.confidenceScorer = new ConfidenceScorer();
  }

  async analyzeResume(
    resumeText: string,
    fileMetadata: {
      fileName: string;
      fileSize: number;
      uploadedAt: string;
      userId: string;
    }
  ): Promise<ResumeAnalysis> {
    const startTime = performance.now();

    try {
      // Step 1: Preprocess and clean the resume text
      const cleanedText = await this.nlpProcessor.preprocessText(resumeText);

      // Step 2: Extract structured information using multiple approaches
      const [
        basicExtraction,
        aiExtraction,
        mlPredictions,
        skillAnalysis,
        experienceAnalysis
      ] = await Promise.all([
        this.extractBasicInformation(cleanedText),
        this.performAIExtraction(cleanedText),
        this.mlModelService.predictCandidateProfile(cleanedText),
        this.skillTaxonomy.analyzeSkills(cleanedText),
        this.experienceAnalyzer.analyzeExperience(cleanedText)
      ]);

      // Step 3: Merge and validate extracted data
      const mergedData = await this.mergeExtractions([
        basicExtraction,
        aiExtraction,
        mlPredictions,
      ]);

      // Step 4: Map competencies and calculate scores
      const competencyMapping = await this.competencyMapper.mapSkillsToCompetencies(
        skillAnalysis.skills
      );

      // Step 5: Calculate confidence scores
      const confidenceMetrics = await this.confidenceScorer.calculateConfidence({
        textQuality: cleanedText,
        extractionConsistency: mergedData,
        skillsRelevance: skillAnalysis,
        experienceCoherence: experienceAnalysis,
      });

      // Step 6: Generate market alignment data
      const marketAlignment = await this.generateMarketAlignment(
        skillAnalysis,
        experienceAnalysis
      );

      // Step 7: Generate improvement recommendations
      const recommendations = await this.generateRecommendations(
        mergedData,
        skillAnalysis,
        confidenceMetrics
      );

      const processingTime = performance.now() - startTime;

      // Step 8: Construct final analysis
      const analysis: ResumeAnalysis = {
        personalInfo: mergedData.personalInfo,
        professionalSummary: mergedData.professionalSummary,
        technicalSkills: {
          primarySkills: skillAnalysis.primarySkills,
          toolsAndTechnologies: skillAnalysis.toolsAndTechnologies,
          skillCategories: competencyMapping.categoryScores,
        },
        workExperience: experienceAnalysis.positions,
        education: mergedData.education,
        certifications: mergedData.certifications,
        projects: mergedData.projects,
        analysisMetadata: {
          confidenceScore: confidenceMetrics.overallScore,
          processingTime: Math.round(processingTime),
          modelVersion: '2.1.0',
          analysisDate: new Date().toISOString(),
          qualityMetrics: confidenceMetrics.qualityMetrics,
          recommendedImprovements: recommendations,
          marketAlignment: marketAlignment,
        },
      };

      // Step 9: Validate against schema
      return ResumeAnalysisSchema.parse(analysis);

    } catch (error) {
      throw new Error(
        \`Resume analysis failed: \${error instanceof Error ? error.message : 'Unknown error'}\`
      );
    }
  }

  private async extractBasicInformation(text: string): Promise<any> {
    // Rule-based extraction for reliable data points
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})(?:\s?(?:ext|x|extension)[\s.]?(\d{1,5}))?/g;
    const linkedInRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/gi;
    const githubRegex = /(?:https?\/\/)?(?:www\.)?github\.com\/[\w-]+/gi;

    return {
      personalInfo: {
        email: text.match(emailRegex)?.[0] || '',
        phone: text.match(phoneRegex)?.[0] || '',
        linkedIn: text.match(linkedInRegex)?.[0] || '',
        github: text.match(githubRegex)?.[0] || '',
      },
    };
  }

  private async performAIExtraction(text: string): Promise<any> {
    const prompt = \`
      Analyze the following resume and extract structured information. 
      Focus on accuracy and completeness.

      Resume Text:
      \${text}

      Please provide a detailed JSON analysis including:
      - Personal information
      - Professional summary
      - Work experience with achievements
      - Education details
      - Certifications
      - Projects

      Be precise and only include information that is explicitly mentioned.
    \`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume analyzer. Extract information accurately and format it as structured JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    try {
      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      throw new Error('Failed to parse AI extraction results');
    }
  }

  private async mergeExtractions(extractions: any[]): Promise<any> {
    // Implement sophisticated merging logic
    // Prioritize most confident extractions
    // Resolve conflicts using confidence scores

    return extractions.reduce((merged, extraction) => {
      // Merge logic implementation
      return { ...merged, ...extraction };
    }, {});
  }

  private async generateMarketAlignment(
    skillAnalysis: any,
    experienceAnalysis: any
  ): Promise<ResumeAnalysis['analysisMetadata']['marketAlignment']> {
    // Calculate market demand score based on skills
    const demandScore = await this.calculateSkillDemand(skillAnalysis.skills);

    // Calculate competitive index
    const competitiveIndex = await this.calculateCompetitiveIndex(
      skillAnalysis,
      experienceAnalysis
    );

    // Get salary benchmark data
    const salaryBenchmark = await this.getSalaryBenchmark(
      skillAnalysis.primarySkills,
      experienceAnalysis.totalYears
    );

    return {
      demandScore,
      competitiveIndex,
      salaryBenchmark,
    };
  }

  private async calculateSkillDemand(skills: string[]): Promise<number> {
    // Implementation would analyze job market data
    return 85; // Placeholder
  }

  private async calculateCompetitiveIndex(
    skillAnalysis: any,
    experienceAnalysis: any
  ): Promise<number> {
    // Implementation would compare against market benchmarks
    return 78; // Placeholder
  }

  private async getSalaryBenchmark(
    primarySkills: any[],
    experienceYears: number
  ): Promise<ResumeAnalysis['analysisMetadata']['marketAlignment']['salaryBenchmark']> {
    // Implementation would query salary databases
    return {
      min: 800000,
      median: 1500000,
      max: 2500000,
      currency: 'INR',
      region: 'India',
    };
  }

  private async generateRecommendations(
    mergedData: any,
    skillAnalysis: any,
    confidenceMetrics: any
  ): Promise<ResumeAnalysis['analysisMetadata']['recommendedImprovements']> {
    const recommendations = [];

    // Analyze completeness and suggest improvements
    if (confidenceMetrics.qualityMetrics.completeness < 80) {
      recommendations.push({
        category: 'Completeness',
        suggestion: 'Add quantifiable achievements and metrics to your experience',
        priority: 'high' as const,
        impact: 'Increases credibility and demonstrates measurable impact',
      });
    }

    if (skillAnalysis.skills.length < 10) {
      recommendations.push({
        category: 'Skills',
        suggestion: 'Expand your technical skills section with relevant technologies',
        priority: 'medium' as const,
        impact: 'Improves keyword matching and demonstrates broader expertise',
      });
    }

    return recommendations;
  }
}