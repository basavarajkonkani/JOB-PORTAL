/**
 * AI Prompt Templates and Generators
 * All prompts use deterministic parameters for reproducible results
 */

export interface JobData {
  title: string;
  level: string;
  location: string;
  type: string;
  remote: boolean;
  description: string;
  requirements: string[];
  compensation?: {
    min?: number;
    max?: number;
    currency: string;
  };
  benefits?: string[];
}

export interface CandidateProfile {
  name?: string;
  location?: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
  }>;
}

export interface Application {
  candidateProfile: CandidateProfile;
  resumeData?: any;
  coverLetter?: string;
}

/**
 * System prompt for fit summary generation
 */
export function getFitSummarySystemPrompt(): string {
  return `You are an expert career advisor analyzing job fit. Provide concise, actionable insights about how well a candidate matches a job posting. Focus on skills alignment, experience relevance, and growth potential. Be honest but encouraging.`;
}

/**
 * User prompt for fit summary
 */
export function getFitSummaryUserPrompt(
  jobData: JobData,
  candidateProfile: CandidateProfile
): string {
  const skillsList = candidateProfile.skills.join(', ');
  const experienceList = candidateProfile.experience
    .map((exp) => `${exp.title} at ${exp.company}`)
    .join('; ');

  return `Analyze the fit between this candidate and job:

JOB:
Title: ${jobData.title}
Level: ${jobData.level}
Requirements: ${jobData.requirements.join(', ')}
Description: ${jobData.description}

CANDIDATE:
Skills: ${skillsList}
Experience: ${experienceList}

Provide a 2-3 sentence summary of the match quality, highlighting strengths and any gaps.`;
}

/**
 * System prompt for cover letter generation
 */
export function getCoverLetterSystemPrompt(): string {
  return `You are a professional career coach helping candidates write compelling cover letters. Create personalized, authentic cover letters that highlight relevant experience and genuine interest. Keep it concise (3-4 paragraphs), professional, and avoid clichés.`;
}

/**
 * User prompt for cover letter
 */
export function getCoverLetterUserPrompt(
  jobData: JobData,
  candidateProfile: CandidateProfile
): string {
  const experienceList = candidateProfile.experience
    .map(
      (exp) =>
        `${exp.title} at ${exp.company}: ${exp.description}`
    )
    .join('\n');

  return `Write a cover letter for this application:

JOB:
Title: ${jobData.title}
Company: [Company Name]
Level: ${jobData.level}
Requirements: ${jobData.requirements.join(', ')}

CANDIDATE BACKGROUND:
Skills: ${candidateProfile.skills.join(', ')}
Experience:
${experienceList}

Write a professional cover letter (3-4 paragraphs) that:
1. Opens with enthusiasm for the specific role
2. Highlights 2-3 most relevant experiences
3. Explains why they're a great fit
4. Closes with a call to action`;
}

/**
 * System prompt for resume improvement
 */
export function getResumeImprovementSystemPrompt(): string {
  return `You are an ATS optimization expert. Analyze resume bullets and suggest improvements for better ATS compatibility and impact. Focus on: action verbs, quantifiable results, relevant keywords, and clear formatting. Keep suggestions concise and actionable.`;
}

/**
 * User prompt for resume improvement
 */
export function getResumeImprovementUserPrompt(bullets: string[]): string {
  const bulletList = bullets.map((b, i) => `${i + 1}. ${b}`).join('\n');

  return `Improve these resume bullets for ATS compatibility:

${bulletList}

For each bullet, provide:
1. The improved version
2. One-line explanation of the change

Format as:
BULLET 1: [improved text]
Why: [explanation]`;
}

/**
 * System prompt for JD generation
 */
export function getJDGenerationSystemPrompt(): string {
  return `You are an expert recruiter creating inclusive, compelling job descriptions. Transform rough notes into well-structured JDs with clear sections: Overview, Responsibilities, Requirements, Nice-to-Haves, Benefits. Use inclusive language, avoid jargon, and focus on impact over credentials.`;
}

/**
 * User prompt for JD generation
 */
export function getJDGenerationUserPrompt(notes: string): string {
  return `Create a structured job description from these notes:

${notes}

Format the output with these sections:
## Overview
[2-3 sentences about the role and team]

## Responsibilities
[5-7 bullet points of key responsibilities]

## Requirements
[Must-have qualifications and skills]

## Nice to Have
[Preferred but not required qualifications]

## Benefits
[Compensation range if mentioned, benefits, perks]

Use inclusive language and avoid gendered terms or unnecessary degree requirements.`;
}

/**
 * System prompt for candidate ranking
 */
export function getCandidateRankingSystemPrompt(): string {
  return `You are an expert recruiter evaluating candidates for job fit. Analyze each candidate's profile against job requirements and rank them by overall match quality. Consider skills alignment, experience relevance, and potential. Provide clear rationale for rankings.`;
}

/**
 * User prompt for candidate ranking
 */
export function getCandidateRankingUserPrompt(
  jobData: JobData,
  applications: Application[]
): string {
  const candidatesList = applications
    .map((app, idx) => {
      const profile = app.candidateProfile;
      return `CANDIDATE ${idx + 1}:
Skills: ${profile.skills.join(', ')}
Experience: ${profile.experience.map((e) => `${e.title} at ${e.company}`).join('; ')}
Education: ${profile.education.map((e) => `${e.degree} in ${e.field} from ${e.institution}`).join('; ')}
`;
    })
    .join('\n');

  return `Rank these candidates for this job:

JOB:
Title: ${jobData.title}
Level: ${jobData.level}
Requirements: ${jobData.requirements.join(', ')}

CANDIDATES:
${candidatesList}

For each candidate, provide:
1. Fit score (0-100)
2. Brief rationale (2-3 sentences)
3. Top strength
4. Potential concern

Format as:
CANDIDATE 1: Score [X/100]
Rationale: [explanation]
Strength: [key strength]
Concern: [if any]`;
}

/**
 * System prompt for screening questions
 */
export function getScreeningQuestionsSystemPrompt(): string {
  return `You are an expert interviewer creating targeted screening questions. Generate 3-5 specific questions that assess the candidate's fit for the role based on their background and the job requirements. Focus on practical scenarios and skill validation.`;
}

/**
 * User prompt for screening questions
 */
export function getScreeningQuestionsUserPrompt(
  jobData: JobData,
  candidateProfile: CandidateProfile
): string {
  return `Generate screening questions for this candidate-job match:

JOB:
Title: ${jobData.title}
Level: ${jobData.level}
Key Requirements: ${jobData.requirements.slice(0, 5).join(', ')}

CANDIDATE:
Skills: ${candidateProfile.skills.join(', ')}
Recent Role: ${candidateProfile.experience[0]?.title || 'N/A'}

Create 3-5 specific screening questions that:
1. Validate key technical skills
2. Assess relevant experience
3. Explore problem-solving approach
4. Gauge cultural fit

Format as numbered list with brief context for each question.`;
}

/**
 * Prompt builder with deterministic parameters
 */
export function buildPromptOptions(seed?: number) {
  return {
    model: 'openai',
    temperature: 0.7,
    seed: seed ?? 42,
    cacheTTL: 3600, // 1 hour
  };
}

export default {
  getFitSummarySystemPrompt,
  getFitSummaryUserPrompt,
  getCoverLetterSystemPrompt,
  getCoverLetterUserPrompt,
  getResumeImprovementSystemPrompt,
  getResumeImprovementUserPrompt,
  getJDGenerationSystemPrompt,
  getJDGenerationUserPrompt,
  getCandidateRankingSystemPrompt,
  getCandidateRankingUserPrompt,
  getScreeningQuestionsSystemPrompt,
  getScreeningQuestionsUserPrompt,
  buildPromptOptions,
};
