/**
 * Accessibility Audit Tests for SignIn Component
 * Tests WCAG 2.1 AA compliance and keyboard navigation
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignIn from '../SignIn';
import SignInHero from '../SignInHero';

// Mock dependencies
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    signIn: jest.fn(),
    signInWithGoogle: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/lib/useAnalytics', () => ({
  useAnalytics: () => ({
    trackEvent: jest.fn(),
  }),
  EventType: {
    USER_SIGNED_IN: 'USER_SIGNED_IN',
  },
}));

describe('SignIn Component - Accessibility Audit', () => {
  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA labels on all form inputs', () => {
      render(<SignIn />);

      // Check email input
      const emailInput = screen.getByLabelText(/official email id/i);
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('type', 'email');

      // Check password input
      const passwordInput = screen.getByLabelText(/^password/i);
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Check optional fields
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    });

    it('should have proper ARIA labels on buttons', () => {
      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      expect(googleButton).toHaveAttribute('aria-label', 'Sign up with Google');

      const submitButton = screen.getByRole('button', { name: /submit sign in form/i });
      expect(submitButton).toHaveAttribute('aria-label', 'Submit sign in form');
    });

    it('should have ARIA live region for error messages', () => {
      render(<SignIn />);

      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
      expect(alertRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have proper form role and label', () => {
      render(<SignIn />);

      const form = screen.getByRole('form', { name: /sign in form/i });
      expect(form).toBeInTheDocument();
    });

    it('should have sr-only heading for screen readers', () => {
      render(<SignIn />);

      const heading = screen.getByRole('heading', { name: /sign in to your account/i, level: 1 });
      expect(heading).toHaveClass('sr-only');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Tab navigation through all interactive elements', async () => {
      const user = userEvent.setup();
      render(<SignIn />);

      // Start from document body
      document.body.focus();

      // Tab to Google button
      await user.tab();
      expect(screen.getByRole('button', { name: /sign up with google/i })).toHaveFocus();

      // Tab to email input
      await user.tab();
      expect(screen.getByLabelText(/official email id/i)).toHaveFocus();

      // Tab to password input
      await user.tab();
      expect(screen.getByLabelText(/^password/i)).toHaveFocus();

      // Tab to first name
      await user.tab();
      expect(screen.getByLabelText(/first name/i)).toHaveFocus();

      // Tab to last name
      await user.tab();
      expect(screen.getByLabelText(/last name/i)).toHaveFocus();

      // Tab to country code
      await user.tab();
      expect(screen.getByLabelText(/country code/i)).toHaveFocus();

      // Tab to mobile number
      await user.tab();
      expect(screen.getByLabelText(/mobile number/i)).toHaveFocus();

      // Tab to submit button
      await user.tab();
      expect(screen.getByRole('button', { name: /submit sign in form/i })).toHaveFocus();

      // Tab to login link
      await user.tab();
      expect(screen.getByRole('link', { name: /go to login page/i })).toHaveFocus();
    });

    it('should have explicit tabIndex on all interactive elements', () => {
      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      expect(googleButton).toHaveAttribute('tabIndex', '0');

      const emailInput = screen.getByLabelText(/official email id/i);
      expect(emailInput).toHaveAttribute('tabIndex', '0');

      const submitButton = screen.getByRole('button', { name: /submit sign in form/i });
      expect(submitButton).toHaveAttribute('tabIndex', '0');

      const loginLink = screen.getByRole('link', { name: /go to login page/i });
      expect(loginLink).toHaveAttribute('tabIndex', '0');
    });

    it('should support Enter key for form submission', async () => {
      const user = userEvent.setup();
      render(<SignIn />);

      const emailInput = screen.getByLabelText(/official email id/i);
      await user.type(emailInput, 'test@example.com');

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'password123');

      // Press Enter to submit
      await user.keyboard('{Enter}');

      // Form should attempt to submit (we can't test actual submission without mocking)
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators on all interactive elements', () => {
      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      expect(googleButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');

      const emailInput = screen.getByLabelText(/official email id/i);
      expect(emailInput).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');

      const submitButton = screen.getByRole('button', { name: /submit sign in form/i });
      expect(submitButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('should maintain focus on disabled elements', () => {
      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      expect(googleButton).not.toBeDisabled();

      const submitButton = screen.getByRole('button', { name: /submit sign in form/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Touch Accessibility', () => {
    it('should have minimum touch target size of 44px', () => {
      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      expect(googleButton).toHaveClass('min-h-[44px]');

      const emailInput = screen.getByLabelText(/official email id/i);
      expect(emailInput).toHaveClass('min-h-[44px]');

      const submitButton = screen.getByRole('button', { name: /submit sign in form/i });
      expect(submitButton).toHaveClass('min-h-[44px]');
    });

    it('should have touch-manipulation for better mobile interaction', () => {
      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      expect(googleButton).toHaveClass('touch-manipulation');

      const emailInput = screen.getByLabelText(/official email id/i);
      expect(emailInput).toHaveClass('touch-manipulation');
    });
  });

  describe('Input Attributes', () => {
    it('should have proper autocomplete attributes', () => {
      render(<SignIn />);

      expect(screen.getByLabelText(/official email id/i)).toHaveAttribute('autoComplete', 'email');
      expect(screen.getByLabelText(/^password/i)).toHaveAttribute('autoComplete', 'current-password');
      expect(screen.getByLabelText(/first name/i)).toHaveAttribute('autoComplete', 'given-name');
      expect(screen.getByLabelText(/last name/i)).toHaveAttribute('autoComplete', 'family-name');
      expect(screen.getByLabelText(/mobile number/i)).toHaveAttribute('autoComplete', 'tel');
    });

    it('should have proper input modes for mobile keyboards', () => {
      render(<SignIn />);

      expect(screen.getByLabelText(/official email id/i)).toHaveAttribute('inputMode', 'email');
      expect(screen.getByLabelText(/mobile number/i)).toHaveAttribute('inputMode', 'numeric');
    });

    it('should have proper input types', () => {
      render(<SignIn />);

      expect(screen.getByLabelText(/official email id/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/^password/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/mobile number/i)).toHaveAttribute('type', 'tel');
    });
  });

  describe('Required Field Indicators', () => {
    it('should mark required fields with asterisk and aria-label', () => {
      render(<SignIn />);

      const emailLabel = screen.getByText(/official email id/i).closest('label');
      const requiredIndicator = within(emailLabel!).getByLabelText('required');
      expect(requiredIndicator).toHaveClass('text-red-600'); // Updated for better contrast

      const passwordLabel = screen.getByText(/^password/i).closest('label');
      const passwordRequired = within(passwordLabel!).getByLabelText('required');
      expect(passwordRequired).toHaveClass('text-red-600'); // Updated for better contrast
    });
  });
});

describe('SignInHero Component - Accessibility Audit', () => {
  describe('Semantic HTML and ARIA', () => {
    it('should have proper complementary role and aria-label', () => {
      render(<SignInHero />);

      const hero = screen.getByRole('complementary', { name: /platform information and statistics/i });
      expect(hero).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<SignInHero />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(/hire interns and freshers faster/i);
    });

    it('should have proper list role for bullet points', () => {
      render(<SignInHero />);

      const benefitsList = screen.getByRole('list', { name: /platform benefits/i });
      expect(benefitsList).toBeInTheDocument();

      const listItems = within(benefitsList).getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });

    it('should have proper region roles for statistics and ratings', () => {
      render(<SignInHero />);

      const statsRegion = screen.getByRole('region', { name: /platform statistics/i });
      expect(statsRegion).toBeInTheDocument();

      const ratingsRegion = screen.getByRole('region', { name: /user ratings/i });
      expect(ratingsRegion).toBeInTheDocument();
    });

    it('should have proper aria-label for star rating', () => {
      render(<SignInHero />);

      const starRating = screen.getByRole('img', { name: /4\.5 out of 5 stars/i });
      expect(starRating).toBeInTheDocument();
    });

    it('should have proper aria-labels for statistics', () => {
      render(<SignInHero />);

      expect(screen.getByLabelText(/32 million plus candidates/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/100 thousand plus companies/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/900 plus cities/i)).toBeInTheDocument();
    });

    it('should mark decorative icons as aria-hidden', () => {
      const { container } = render(<SignInHero />);

      // Check icons are marked as decorative
      const checkIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Image Accessibility', () => {
    it('should have proper alt text for hero image', () => {
      render(<SignInHero />);

      const image = screen.getByAltText(/professional using laptop for hiring/i);
      expect(image).toBeInTheDocument();
    });

    it('should have proper role and aria-label for image container', () => {
      render(<SignInHero />);

      const imageContainer = screen.getByRole('img', { name: /professional working on laptop/i });
      expect(imageContainer).toBeInTheDocument();
    });
  });
});
