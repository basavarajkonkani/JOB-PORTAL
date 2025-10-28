'use client';

import { useState } from 'react';

export interface AICopilotAction {
  label: string;
  type: 'primary' | 'secondary';
  handler: string;
}

export interface AICopilotResponse {
  summary: string;
  items?: string[] | null;
  actions?: AICopilotAction[] | null;
  imageUrl?: string;
  error?: string;
  fallback?: string;
}

interface AICopilotPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  response: AICopilotResponse | null;
  isLoading: boolean;
  onActionClick?: (handler: string) => void;
}

export default function AICopilotPanel({
  isOpen,
  onToggle,
  response,
  isLoading,
  onActionClick,
}: AICopilotPanelProps) {
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed right-4 top-20 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={isOpen ? 'Close AI Copilot' : 'Open AI Copilot'}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          )}
        </svg>
      </button>

      {/* Sliding Panel */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-96 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">AI Copilot</h2>
            <p className="text-sm text-blue-100">Your intelligent assistant</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading && <LoadingState />}

            {!isLoading && !response && <EmptyState />}

            {!isLoading && response && (
              <ResponseContent response={response} onActionClick={onActionClick} />
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-25 transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      <p className="text-sm text-gray-600">AI is thinking...</p>
      <p className="text-xs text-gray-400">This may take a few seconds</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
      <svg
        className="h-16 w-16 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      <div>
        <h3 className="text-lg font-medium text-gray-900">Ready to assist</h3>
        <p className="mt-2 text-sm text-gray-500">
          Trigger an AI action to see suggestions and insights here
        </p>
      </div>
    </div>
  );
}

interface ResponseContentProps {
  response: AICopilotResponse;
  onActionClick?: (handler: string) => void;
}

function ResponseContent({ response, onActionClick }: ResponseContentProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Error state
  if (response.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{response.error}</h3>
            {response.fallback && <p className="mt-2 text-sm text-red-700">{response.fallback}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-blue-900">Summary</h3>
        <p className="text-sm text-blue-800">{response.summary}</p>
      </div>

      {/* Items */}
      {response.items && response.items.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Details</h3>
          {response.items.map((item, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white">
              <button
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900">Item {index + 1}</span>
                <svg
                  className={`h-5 w-5 transform text-gray-400 transition-transform ${
                    expandedItems.has(index) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expandedItems.has(index) && (
                <div className="border-t border-gray-200 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">{item}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image */}
      {response.imageUrl && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Generated Image</h3>
          <img
            src={response.imageUrl}
            alt="AI generated"
            className="w-full rounded-lg border border-gray-200"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Failed+to+Load';
            }}
          />
        </div>
      )}

      {/* Actions */}
      {response.actions && response.actions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
          <div className="flex flex-col space-y-2">
            {response.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => onActionClick?.(action.handler)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  action.type === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
