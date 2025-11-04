import mammoth from 'mammoth';
import { storage } from '../config/firebase';
import logger from './logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

export interface ParsedResumeData {
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Download file from Firestore-based storage (temporary solution)
 */
async function downloadFileFromStorage(storagePath: string): Promise<Buffer> {
  try {
    // Extract file ID from storage path (e.g., "resumes/userId/uuid.pdf" -> "uuid.pdf")
    const fileName = storagePath.split('/').pop();
    if (!fileName) {
      throw new Error(`Invalid storage path: ${storagePath}`);
    }
    
    // The document ID is the full filename (including extension)
    const fileId = fileName;

    // Import firestore dynamically to avoid circular dependencies
    const { firestore } = await import('../config/firebase');
    
    // Get file from Firestore
    const fileDoc = await firestore.collection('file_storage').doc(fileId).get();
    
    if (!fileDoc.exists) {
      throw new Error(`File not found in storage: ${storagePath} (fileId: ${fileId})`);
    }

    const fileData = fileDoc.data();
    if (!fileData || !fileData.content) {
      throw new Error(`File content not found: ${storagePath}`);
    }

    // Convert base64 back to buffer
    const buffer = Buffer.from(fileData.content, 'base64');

    logger.info('File downloaded from Firestore storage', { 
      storagePath, 
      fileId,
      bufferSize: buffer.length 
    });
    return buffer;
  } catch (error) {
    logger.error('Failed to download file from Firestore storage', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
      storagePath,
    });
    throw new Error(
      `File download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract structured data from resume text using pattern matching
 */
function extractStructuredData(text: string): ParsedResumeData {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Extract skills - look for common skill section headers
  const skills: string[] = [];
  const skillSectionRegex = /^(skills?|technical skills?|core competencies|technologies)[\s:]*$/i;
  let inSkillsSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (skillSectionRegex.test(line)) {
      inSkillsSection = true;
      continue;
    }

    // Stop if we hit another section
    if (inSkillsSection && /^(experience|education|work history|employment)/i.test(line)) {
      inSkillsSection = false;
    }

    if (inSkillsSection) {
      // Split by common delimiters
      const skillTokens = line.split(/[,;|•·]/);
      skillTokens.forEach((skill) => {
        const trimmed = skill.trim();
        if (trimmed.length > 1 && trimmed.length < 50) {
          skills.push(trimmed);
        }
      });
    }
  }

  // Extract experience - look for company names and job titles
  const experience: ParsedResumeData['experience'] = [];
  const experienceSectionRegex =
    /^(experience|work history|employment|professional experience)[\s:]*$/i;
  const dateRangeRegex = /(\d{4}|\w+\s+\d{4})\s*[-–—to]+\s*(\d{4}|\w+\s+\d{4}|present|current)/i;

  let inExperienceSection = false;
  let currentExperience: Partial<ParsedResumeData['experience'][0]> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (experienceSectionRegex.test(line)) {
      inExperienceSection = true;
      continue;
    }

    if (inExperienceSection && /^(education|certifications|projects)/i.test(line)) {
      if (currentExperience && currentExperience.company && currentExperience.title) {
        experience.push(currentExperience as ParsedResumeData['experience'][0]);
      }
      inExperienceSection = false;
      break;
    }

    if (inExperienceSection) {
      const dateMatch = line.match(dateRangeRegex);

      if (dateMatch) {
        // Save previous experience if exists
        if (currentExperience && currentExperience.company && currentExperience.title) {
          experience.push(currentExperience as ParsedResumeData['experience'][0]);
        }

        currentExperience = {
          company: '',
          title: '',
          startDate: dateMatch[1],
          endDate:
            dateMatch[2].toLowerCase() === 'present' || dateMatch[2].toLowerCase() === 'current'
              ? undefined
              : dateMatch[2],
          description: '',
        };
      } else if (currentExperience) {
        // Try to identify company and title
        if (!currentExperience.company && line.length > 3 && line.length < 100) {
          currentExperience.company = line;
        } else if (!currentExperience.title && line.length > 3 && line.length < 100) {
          currentExperience.title = line;
        } else if (currentExperience.description !== undefined) {
          currentExperience.description += (currentExperience.description ? ' ' : '') + line;
        }
      }
    }
  }

  // Add last experience if exists
  if (currentExperience && currentExperience.company && currentExperience.title) {
    experience.push(currentExperience as ParsedResumeData['experience'][0]);
  }

  // Extract education
  const education: ParsedResumeData['education'] = [];
  const educationSectionRegex = /^(education|academic background|qualifications)[\s:]*$/i;
  const degreeRegex =
    /(bachelor|master|phd|doctorate|associate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?)/i;

  let inEducationSection = false;
  let currentEducation: Partial<ParsedResumeData['education'][0]> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (educationSectionRegex.test(line)) {
      inEducationSection = true;
      continue;
    }

    if (inEducationSection && /^(experience|certifications|projects|skills)/i.test(line)) {
      if (currentEducation && currentEducation.institution && currentEducation.degree) {
        education.push(currentEducation as ParsedResumeData['education'][0]);
      }
      break;
    }

    if (inEducationSection) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      const degreeMatch = line.match(degreeRegex);

      if (degreeMatch || yearMatch) {
        // Save previous education if exists
        if (currentEducation && currentEducation.institution && currentEducation.degree) {
          education.push(currentEducation as ParsedResumeData['education'][0]);
        }

        currentEducation = {
          institution: '',
          degree: degreeMatch ? degreeMatch[0] : '',
          field: '',
          graduationDate: yearMatch ? yearMatch[0] : '',
        };

        // Try to extract institution and field from the same line
        if (line.length > 3 && line.length < 200) {
          currentEducation.institution = line;
        }
      } else if (currentEducation) {
        if (!currentEducation.institution && line.length > 3 && line.length < 100) {
          currentEducation.institution = line;
        } else if (!currentEducation.field && line.length > 3 && line.length < 100) {
          currentEducation.field = line;
        }
      }
    }
  }

  // Add last education if exists
  if (currentEducation && currentEducation.institution && currentEducation.degree) {
    education.push(currentEducation as ParsedResumeData['education'][0]);
  }

  return {
    skills: [...new Set(skills)], // Remove duplicates
    experience,
    education,
  };
}

/**
 * Parse resume file and extract structured data
 */
export async function parseResume(
  storagePath: string,
  mimeType: string
): Promise<{ rawText: string; parsedData: ParsedResumeData }> {
  try {
    // Download file from Firebase Cloud Storage
    const buffer = await downloadFileFromStorage(storagePath);

    // Extract text based on file type
    let rawText: string;
    if (mimeType === 'application/pdf') {
      rawText = await extractTextFromPDF(buffer);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      rawText = await extractTextFromDOCX(buffer);
    } else {
      throw new Error('Unsupported file type');
    }

    // Extract structured data
    const parsedData = extractStructuredData(rawText);

    logger.info('Resume parsed successfully', {
      storagePath,
      skillsCount: parsedData.skills.length,
      experienceCount: parsedData.experience.length,
      educationCount: parsedData.education.length,
    });

    return {
      rawText,
      parsedData,
    };
  } catch (error) {
    logger.error('Error parsing resume:', { error, storagePath });
    throw error;
  }
}
