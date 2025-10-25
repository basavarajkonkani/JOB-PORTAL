# AI Copilot Component

The AI Copilot provides an intelligent assistant panel that can be integrated into any page.

## Usage Example

```tsx
'use client';

import { useAICopilot } from '@/lib/useAICopilot';
import AICopilotPanel from '@/components/ai/AICopilotPanel';
import { useAuth } from '@/lib/auth-context';

export default function MyPage() {
  const { user, token } = useAuth();
  const copilot = useAICopilot();

  const handleGenerateFitSummary = async () => {
    if (!token) return;

    const jobData = {
      title: 'Senior Software Engineer',
      level: 'senior',
      location: 'San Francisco, CA',
      type: 'full-time',
      remote: true,
      description: 'Build scalable systems...',
      requirements: ['5+ years experience', 'React', 'Node.js'],
    };

    const candidateProfile = {
      skills: ['React', 'Node.js', 'TypeScript'],
      experience: [
        {
          company: 'Tech Corp',
          title: 'Software Engineer',
          description: 'Built web applications',
        },
      ],
      education: [
        {
          institution: 'University',
          degree: 'BS',
          field: 'Computer Science',
        },
      ],
    };

    await copilot.generateFitSummary(jobData, candidateProfile, token);
  };

  const handleActionClick = (handler: string) => {
    console.log('Action clicked:', handler);
    // Handle different actions based on handler name
    switch (handler) {
      case 'generateCoverLetter':
        // Trigger cover letter generation
        break;
      case 'useCoverLetter':
        // Use the generated cover letter
        break;
      // ... other handlers
    }
  };

  return (
    <div>
      <button onClick={handleGenerateFitSummary}>
        Analyze Job Fit
      </button>

      <AICopilotPanel
        isOpen={copilot.isOpen}
        onToggle={copilot.toggle}
        response={copilot.response}
        isLoading={copilot.isLoading}
        onActionClick={handleActionClick}
      />
    </div>
  );
}
```

## Available Methods

- `generateFitSummary(jobData, candidateProfile, token)` - Analyze job-candidate fit
- `generateCoverLetter(jobData, candidateProfile, token)` - Create tailored cover letter
- `improveResume(bullets, token)` - Get resume improvement suggestions
- `generateJD(notes, token)` - Generate job description from notes
- `rankCandidates(jobData, applications, token)` - Rank candidates by fit
- `generateScreeningQuestions(jobData, candidateProfile, token)` - Create interview questions
- `generateImage(prompt, options, token)` - Generate hero image URL

## Response Format

All AI methods return a response with this structure:

```typescript
interface AICopilotResponse {
  summary: string;           // Brief summary of the result
  items?: string[] | null;   // Detailed items (expandable)
  actions?: Action[] | null; // Available actions
  imageUrl?: string;         // Generated image URL (for image endpoint)
  error?: string;            // Error message if failed
  fallback?: string;         // Fallback suggestion on error
}
```

## Features

- **Collapsible Panel**: Slides in from the right side
- **Loading States**: Shows spinner while AI is processing
- **Error Handling**: Displays errors with fallback suggestions
- **Expandable Items**: Long content can be collapsed/expanded
- **Action Buttons**: Primary and secondary actions
- **Image Support**: Displays generated images with fallback
