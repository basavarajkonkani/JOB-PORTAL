export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationException';
    this.errors = errors;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Validate signup data
 */
export function validateSignupData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!isValidPassword(data.password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    });
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!data.role || !['candidate', 'recruiter'].includes(data.role)) {
    errors.push({ field: 'role', message: 'Role must be either candidate or recruiter' });
  }

  return errors;
}

/**
 * Validate signin data
 */
export function validateSigninData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
}

/**
 * Validate candidate profile data
 */
export function validateCandidateProfileData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.location !== undefined && typeof data.location !== 'string') {
    errors.push({ field: 'location', message: 'Location must be a string' });
  }

  if (data.skills !== undefined) {
    if (!Array.isArray(data.skills)) {
      errors.push({ field: 'skills', message: 'Skills must be an array' });
    } else if (!data.skills.every((skill: any) => typeof skill === 'string')) {
      errors.push({ field: 'skills', message: 'All skills must be strings' });
    }
  }

  if (data.experience !== undefined) {
    if (!Array.isArray(data.experience)) {
      errors.push({ field: 'experience', message: 'Experience must be an array' });
    } else {
      data.experience.forEach((exp: any, index: number) => {
        if (!exp.company || typeof exp.company !== 'string') {
          errors.push({ field: `experience[${index}].company`, message: 'Company is required' });
        }
        if (!exp.title || typeof exp.title !== 'string') {
          errors.push({ field: `experience[${index}].title`, message: 'Title is required' });
        }
        if (!exp.startDate || typeof exp.startDate !== 'string') {
          errors.push({ field: `experience[${index}].startDate`, message: 'Start date is required' });
        }
        if (!exp.description || typeof exp.description !== 'string') {
          errors.push({ field: `experience[${index}].description`, message: 'Description is required' });
        }
      });
    }
  }

  if (data.education !== undefined) {
    if (!Array.isArray(data.education)) {
      errors.push({ field: 'education', message: 'Education must be an array' });
    } else {
      data.education.forEach((edu: any, index: number) => {
        if (!edu.institution || typeof edu.institution !== 'string') {
          errors.push({ field: `education[${index}].institution`, message: 'Institution is required' });
        }
        if (!edu.degree || typeof edu.degree !== 'string') {
          errors.push({ field: `education[${index}].degree`, message: 'Degree is required' });
        }
        if (!edu.field || typeof edu.field !== 'string') {
          errors.push({ field: `education[${index}].field`, message: 'Field is required' });
        }
        if (!edu.graduationDate || typeof edu.graduationDate !== 'string') {
          errors.push({ field: `education[${index}].graduationDate`, message: 'Graduation date is required' });
        }
      });
    }
  }

  if (data.preferences !== undefined && typeof data.preferences !== 'object') {
    errors.push({ field: 'preferences', message: 'Preferences must be an object' });
  }

  return errors;
}

/**
 * Validate recruiter profile data
 */
export function validateRecruiterProfileData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.orgId !== undefined && typeof data.orgId !== 'string') {
    errors.push({ field: 'orgId', message: 'Organization ID must be a string' });
  }

  if (data.title !== undefined && typeof data.title !== 'string') {
    errors.push({ field: 'title', message: 'Title must be a string' });
  }

  return errors;
}
