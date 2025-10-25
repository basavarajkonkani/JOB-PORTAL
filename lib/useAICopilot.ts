'use client';

import { useState } from 'react';
import { AICopilotResponse } from '../components/ai/AICopilotPanel';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState<AICopilotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const clearResponse = () => setResponse(null);

  /**
   * Make an AI API call
   */
  const callAI = async (
    endpoint: string,
    data: any,
    token?: string
  ): Promise<AICopilotResponse> => {
    setIsLoading(true);
    setIsOpen(true);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/ai/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        const errorResponse: AICopilotResponse = {
          summary: '',
          error: result.error || 'An error occurred',
          fallback: result.fallback,
        };
        setResponse(errorResponse);
        return errorResponse;
      }

      setResponse(result);
      return result;
    } catch (error: any) {
      const errorResponse: AICopilotResponse = {
        summary: '',
        error: 'Network error',
        fallback: 'Please check your connection and try again',
      };
      setResponse(errorResponse);
      return errorResponse;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate fit summary
   */
  const generateFitSummary = async (
    jobData: any,
    candidateProfile: any,
    token: string
  ) => {
    return callAI('fit-summary', { jobData, candidateProfile }, token);
  };

  /**
   * Generate cover letter
   */
  const generateCoverLetter = async (
    jobData: any,
    candidateProfile: any,
    token: string
  ) => {
    return callAI('cover-letter', { jobData, candidateProfile }, token);
  };

  /**
   * Improve resume bullets
   */
  const improveResume = async (bullets: string[], token: string) => {
    return callAI('resume-improve', { bullets }, token);
  };

  /**
   * Generate job description
   */
  const generateJD = async (notes: string, token: string) => {
    return callAI('jd-generate', { notes }, token);
  };

  /**
   * Rank candidates
   */
  const rankCandidates = async (
    jobData: any,
    applications: any[],
    token: string
  ) => {
    return callAI('shortlist', { jobData, applications }, token);
  };

  /**
   * Generate screening questions
   */
  const generateScreeningQuestions = async (
    jobData: any,
    candidateProfile: any,
    token: string
  ) => {
    return callAI('screening-questions', { jobData, candidateProfile }, token);
  };

  /**
   * Generate image
   */
  const generateImage = async (
    prompt: string,
    options: { width?: number; height?: number; seed?: number },
    token: string
  ) => {
    return callAI('image', { prompt, ...options }, token);
  };

  return {
    isOpen,
    response,
    isLoading,
    toggle,
    open,
    close,
    clearResponse,
    generateFitSummary,
    generateCoverLetter,
    improveResume,
    generateJD,
    rankCandidates,
    generateScreeningQuestions,
    generateImage,
  };
}
