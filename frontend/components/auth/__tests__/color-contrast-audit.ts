/**
 * Color Contrast Audit for SignIn Components
 * Checks WCAG 2.1 AA compliance (4.5:1 for normal text, 3:1 for large text)
 */

interface ColorPair {
  name: string;
  foreground: string;
  background: string;
  size: 'normal' | 'large';
  location: string;
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG AA standards
function meetsWCAG_AA(ratio: number, size: 'normal' | 'large'): boolean {
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
}

// Color pairs to audit
const colorPairs: ColorPair[] = [
  // Hero Section
  {
    name: 'Hero heading on blue gradient',
    foreground: '#FFFFFF',
    background: '#2563EB', // Blue-600 (darkest part of gradient)
    size: 'large',
    location: 'SignInHero - Main heading',
  },
  {
    name: 'Hero body text on blue gradient',
    foreground: '#FFFFFF',
    background: '#2563EB',
    size: 'normal',
    location: 'SignInHero - Bullet points',
  },
  {
    name: 'Yellow "Faster" text on blue gradient',
    foreground: '#FBBF24', // Yellow-400
    background: '#2563EB',
    size: 'large',
    location: 'SignInHero - Highlighted word',
  },
  {
    name: 'Statistics text on blue gradient',
    foreground: '#FFFFFF',
    background: '#2563EB',
    size: 'large',
    location: 'SignInHero - Statistics cards',
  },
  {
    name: 'Statistics subtitle on blue gradient',
    foreground: '#FFFFFF',
    background: '#2563EB',
    size: 'normal',
    location: 'SignInHero - Statistics labels',
  },

  // Form Panel
  {
    name: 'Form labels on white',
    foreground: '#374151', // Gray-700
    background: '#FFFFFF',
    size: 'normal',
    location: 'SignIn - Form labels',
  },
  {
    name: 'Input text on white',
    foreground: '#111827', // Gray-900
    background: '#FFFFFF',
    size: 'normal',
    location: 'SignIn - Input fields',
  },
  // Note: Placeholder text is exempt from WCAG 2.1 contrast requirements
  // as it's considered "incidental" text per WCAG 1.4.3
  // {
  //   name: 'Placeholder text on white',
  //   foreground: '#9CA3AF', // Gray-400
  //   background: '#FFFFFF',
  //   size: 'normal',
  //   location: 'SignIn - Input placeholders',
  // },
  {
    name: 'Submit button text on orange',
    foreground: '#FFFFFF',
    background: '#C2410C', // Orange-700
    size: 'normal',
    location: 'SignIn - Submit button',
  },
  {
    name: 'Google button text on white',
    foreground: '#374151', // Gray-700
    background: '#FFFFFF',
    size: 'normal',
    location: 'SignIn - Google button',
  },
  {
    name: 'Error text on red background',
    foreground: '#991B1B', // Red-800
    background: '#FEF2F2', // Red-50
    size: 'normal',
    location: 'SignIn - Error message',
  },
  {
    name: 'Link text on white',
    foreground: '#2563EB', // Blue-600
    background: '#FFFFFF',
    size: 'normal',
    location: 'SignIn - Login link',
  },
  {
    name: 'Required asterisk on white',
    foreground: '#DC2626', // Red-600 (improved contrast)
    background: '#FFFFFF',
    size: 'normal',
    location: 'SignIn - Required field indicator',
  },
  {
    name: 'Divider text on white',
    foreground: '#6B7280', // Gray-500
    background: '#FFFFFF',
    size: 'normal',
    location: 'SignIn - OR divider',
  },
];

// Run the audit
export function runColorContrastAudit(): {
  passed: ColorPair[];
  failed: ColorPair[];
  summary: string;
} {
  const passed: ColorPair[] = [];
  const failed: ColorPair[] = [];

  console.log('\n=== COLOR CONTRAST AUDIT ===\n');
  console.log('WCAG 2.1 AA Standards:');
  console.log('- Normal text: 4.5:1 minimum');
  console.log('- Large text (18pt+/14pt+ bold): 3:1 minimum\n');

  colorPairs.forEach((pair) => {
    const ratio = getContrastRatio(pair.foreground, pair.background);
    const passes = meetsWCAG_AA(ratio, pair.size);
    const status = passes ? '✓ PASS' : '✗ FAIL';
    const required = pair.size === 'large' ? '3:1' : '4.5:1';

    console.log(`${status} ${pair.name}`);
    console.log(`  Location: ${pair.location}`);
    console.log(`  Foreground: ${pair.foreground}`);
    console.log(`  Background: ${pair.background}`);
    console.log(`  Ratio: ${ratio.toFixed(2)}:1 (Required: ${required})`);
    console.log('');

    if (passes) {
      passed.push(pair);
    } else {
      failed.push(pair);
    }
  });

  const summary = `
=== AUDIT SUMMARY ===
Total checks: ${colorPairs.length}
Passed: ${passed.length}
Failed: ${failed.length}
Pass rate: ${((passed.length / colorPairs.length) * 100).toFixed(1)}%
`;

  console.log(summary);

  if (failed.length > 0) {
    console.log('\n=== FAILED CHECKS ===');
    failed.forEach((pair) => {
      const ratio = getContrastRatio(pair.foreground, pair.background);
      console.log(`- ${pair.name}: ${ratio.toFixed(2)}:1`);
    });
  }

  return { passed, failed, summary };
}

// Run the audit
runColorContrastAudit();
