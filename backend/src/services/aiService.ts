import crypto from 'crypto';
import redisClient from '../config/redis';
import { ErrorFactory, ErrorLogger } from '../utils/errors';

// Circuit breaker state
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  state: 'CLOSED',
};

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

/**
 * Generate a hash for caching purposes
 */
function generateCacheKey(prefix: string, data: any): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return `${prefix}:${hash}`;
}

/**
 * Check circuit breaker state
 */
function checkCircuitBreaker(): boolean {
  const now = Date.now();

  if (circuitBreaker.state === 'OPEN') {
    if (now - circuitBreaker.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
      circuitBreaker.state = 'HALF_OPEN';
      return true;
    }
    return false;
  }

  return true;
}

/**
 * Record circuit breaker failure
 */
function recordFailure(): void {
  circuitBreaker.failures++;
  circuitBreaker.lastFailureTime = Date.now();

  if (circuitBreaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreaker.state = 'OPEN';
    console.error('Circuit breaker opened due to repeated failures');
  }
}

/**
 * Record circuit breaker success
 */
function recordSuccess(): void {
  circuitBreaker.failures = 0;
  circuitBreaker.state = 'CLOSED';
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      recordSuccess();
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${i + 1} failed:`, error);

      if (i < retries - 1) {
        const delay = BASE_DELAY * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  recordFailure();
  throw lastError || new Error('All retry attempts failed');
}

/**
 * Get cached value from Redis
 */
async function getCachedValue(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Set cached value in Redis
 */
async function setCachedValue(key: string, value: string, ttlSeconds: number): Promise<void> {
  try {
    await redisClient.setEx(key, ttlSeconds, value);
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

/**
 * Call Pollinations text API
 */
async function callPollinationsText(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    seed?: number;
  } = {}
): Promise<string> {
  if (!checkCircuitBreaker()) {
    throw new Error('Circuit breaker is open - service temporarily unavailable');
  }

  const model = options.model || 'openai';
  const temperature = options.temperature ?? 0.7;
  const seed = options.seed ?? 42;

  // Construct URL with query parameters
  const baseUrl = 'https://text.pollinations.ai';
  const url = new URL(`${baseUrl}/${model}`);
  url.searchParams.append('temperature', temperature.toString());
  url.searchParams.append('seed', seed.toString());
  url.searchParams.append('system', systemPrompt);
  url.searchParams.append('prompt', userPrompt);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'text/plain',
    },
  });

  if (!response.ok) {
    throw new Error(`Pollinations API error: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Generate text with caching and retry logic
 * Implements graceful degradation with fallback support
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    seed?: number;
    cacheTTL?: number;
    fallbackMessage?: string;
  } = {}
): Promise<string> {
  const cacheTTL = options.cacheTTL ?? 3600; // 1 hour default
  const cacheKey = generateCacheKey('ai:text', {
    system: systemPrompt,
    prompt: userPrompt,
    model: options.model,
    temperature: options.temperature,
    seed: options.seed,
  });

  // Try to get from cache
  const cached = await getCachedValue(cacheKey);
  if (cached) {
    console.log('Returning cached AI response');
    return cached;
  }

  try {
    // Generate new response with retry logic
    const result = await retryWithBackoff(() =>
      callPollinationsText(systemPrompt, userPrompt, options)
    );

    // Cache the result
    await setCachedValue(cacheKey, result, cacheTTL);

    return result;
  } catch (error) {
    ErrorLogger.logError(error as Error, {
      service: 'aiService',
      operation: 'generateText',
      circuitBreakerState: circuitBreaker.state,
    });

    // Check if we have a cached fallback (even if expired)
    const fallbackKey = `${cacheKey}:fallback`;
    const fallback = await getCachedValue(fallbackKey);

    if (fallback) {
      ErrorLogger.logWarning('Using expired cached result as fallback', {
        cacheKey,
      });
      throw ErrorFactory.aiServiceError(
        'AI service temporarily unavailable. Using cached result.',
        fallback
      );
    }

    // No fallback available
    const fallbackMessage =
      options.fallbackMessage ||
      'AI service is currently unavailable. Please try again later or enter content manually.';

    throw ErrorFactory.aiServiceError(fallbackMessage);
  }
}

/**
 * Generate image URL with Pollinations
 */
export function generateImageUrl(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    seed?: number;
    nologo?: boolean;
  } = {}
): string {
  const width = options.width ?? 1200;
  const height = options.height ?? 630;
  const seed = options.seed ?? 42;
  const nologo = options.nologo ?? true;

  const encodedPrompt = encodeURIComponent(prompt);
  const baseUrl = 'https://image.pollinations.ai/prompt';
  const url = new URL(`${baseUrl}/${encodedPrompt}`);

  url.searchParams.append('width', width.toString());
  url.searchParams.append('height', height.toString());
  url.searchParams.append('seed', seed.toString());
  if (nologo) {
    url.searchParams.append('nologo', 'true');
  }

  return url.toString();
}

/**
 * Default placeholder image URL
 */
export const DEFAULT_PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"%3E%3Crect fill="%234F46E5" width="1200" height="630"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="white"%3EJob Opportunity%3C/text%3E%3C/svg%3E';

/**
 * Generate and cache image URL with fallback support
 */
export async function generateImage(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    seed?: number;
    nologo?: boolean;
    fallbackUrl?: string;
  } = {}
): Promise<string> {
  const cacheTTL = 86400; // 24 hours
  const cacheKey = generateCacheKey('ai:image', { prompt, ...options });

  // Try to get from cache
  const cached = await getCachedValue(cacheKey);
  if (cached) {
    console.log('Returning cached image URL');
    return cached;
  }

  try {
    // Generate new URL
    const imageUrl = generateImageUrl(prompt, options);

    // Cache the URL
    await setCachedValue(cacheKey, imageUrl, cacheTTL);

    return imageUrl;
  } catch (error) {
    ErrorLogger.logError(error as Error, {
      service: 'aiService',
      operation: 'generateImage',
      prompt,
    });

    // Return fallback image
    const fallbackUrl = options.fallbackUrl || DEFAULT_PLACEHOLDER_IMAGE;
    ErrorLogger.logWarning('Using fallback image due to AI service error', {
      fallbackUrl,
    });

    return fallbackUrl;
  }
}

// Import prompt templates
import {
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
  JobData,
  CandidateProfile,
  Application,
} from './aiPrompts';

/**
 * Generate fit summary for a candidate-job match
 */
export async function generateFitSummary(
  jobData: JobData,
  candidateProfile: CandidateProfile
): Promise<string> {
  const systemPrompt = getFitSummarySystemPrompt();
  const userPrompt = getFitSummaryUserPrompt(jobData, candidateProfile);
  const options = buildPromptOptions();

  return await generateText(systemPrompt, userPrompt, options);
}

/**
 * Generate tailored cover letter
 */
export async function generateCoverLetter(
  jobData: JobData,
  candidateProfile: CandidateProfile
): Promise<string> {
  const systemPrompt = getCoverLetterSystemPrompt();
  const userPrompt = getCoverLetterUserPrompt(jobData, candidateProfile);
  const options = buildPromptOptions();

  return await generateText(systemPrompt, userPrompt, options);
}

/**
 * Improve resume bullets for ATS compatibility
 */
export async function improveResumeBullets(bullets: string[]): Promise<string> {
  const systemPrompt = getResumeImprovementSystemPrompt();
  const userPrompt = getResumeImprovementUserPrompt(bullets);
  const options = buildPromptOptions();

  return await generateText(systemPrompt, userPrompt, options);
}

/**
 * Generate job description from notes
 */
export async function generateJD(notes: string): Promise<string> {
  const systemPrompt = getJDGenerationSystemPrompt();
  const userPrompt = getJDGenerationUserPrompt(notes);
  const options = buildPromptOptions();

  return await generateText(systemPrompt, userPrompt, options);
}

/**
 * Rank candidates for a job
 */
export async function rankCandidates(
  jobData: JobData,
  applications: Application[]
): Promise<string> {
  const systemPrompt = getCandidateRankingSystemPrompt();
  const userPrompt = getCandidateRankingUserPrompt(jobData, applications);
  const options = buildPromptOptions();

  return await generateText(systemPrompt, userPrompt, options);
}

/**
 * Generate screening questions for a candidate
 */
export async function generateScreeningQuestions(
  jobData: JobData,
  candidateProfile: CandidateProfile
): Promise<string> {
  const systemPrompt = getScreeningQuestionsSystemPrompt();
  const userPrompt = getScreeningQuestionsUserPrompt(jobData, candidateProfile);
  const options = buildPromptOptions();

  return await generateText(systemPrompt, userPrompt, options);
}

export default {
  generateText,
  generateImage,
  generateImageUrl,
  generateFitSummary,
  generateCoverLetter,
  improveResumeBullets,
  generateJD,
  rankCandidates,
  generateScreeningQuestions,
};
