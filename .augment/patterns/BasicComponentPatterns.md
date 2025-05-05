# Basic Component Patterns

This document provides examples of basic React component patterns to use throughout the Bitcoin Node Manager implementation.

## Functional Component Template

```tsx
import React from 'react';

interface ButtonProps {
  /** Text to display inside the button */
  children: React.ReactNode;
  /** Function to call when button is clicked */
  onClick?: () => void;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

/**
 * Button component for user interactions
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  variant = 'primary',
}) => {
  // Determine the base classes based on the variant
  const baseClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-800',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200 ease-in-out
        ${baseClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

## Card Component

```tsx
import React from 'react';

interface CardProps {
  /** Card title */
  title?: string;
  /** Card content */
  children: React.ReactNode;
  /** Additional actions to display in the header */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card component for containing content in a box with optional title
 */
export const Card: React.FC<CardProps> = ({
  title,
  children,
  actions,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
```

## Input Component

```tsx
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Whether the input has an error */
  error?: boolean;
  /** Helper text to display below the input */
  helperText?: string;
}

/**
 * Input component for text entry
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500'
            }
            ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${className}
          `}
          {...props}
        />
        {helperText && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

## Select Component

```tsx
import React, { forwardRef } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  /** Options to display in the select */
  options: Option[];
  /** Function to call when selection changes */
  onChange?: (value: string) => void;
  /** Whether the select has an error */
  error?: boolean;
  /** Helper text to display below the select */
  helperText?: string;
}

/**
 * Select component for choosing from options
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, onChange, error = false, helperText, className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        <select
          ref={ref}
          onChange={handleChange}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500'
            }
            ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helperText && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
```

## Checkbox Component

```tsx
import React, { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label to display next to the checkbox */
  label: string;
  /** Whether the checkbox has an error */
  error?: boolean;
  /** Helper text to display below the checkbox */
  helperText?: string;
}

/**
 * Checkbox component for boolean selection
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error = false, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={`
              h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500
              ${error ? 'border-red-500' : ''}
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
            {...props}
          />
          <label
            htmlFor={props.id}
            className={`ml-2 block text-sm font-medium ${
              props.disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {label}
          </label>
        </div>
        {helperText && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
```

## Badge Component

```tsx
import React from 'react';

interface BadgeProps {
  /** Text to display inside the badge */
  children: React.ReactNode;
  /** Badge variant */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Badge component for displaying status or count
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  // Determine the base classes based on the variant
  const baseClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${baseClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
```

## Alert Component

```tsx
import React from 'react';

interface AlertProps {
  /** Alert title */
  title?: string;
  /** Alert content */
  children: React.ReactNode;
  /** Alert variant */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Function to call when close button is clicked */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Alert component for displaying messages to the user
 */
export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  onClose,
  className = '',
}) => {
  // Determine the base classes based on the variant
  const baseClasses = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  // Determine the icon based on the variant
  const icons = {
    info: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`
        border rounded-md p-4 ${baseClasses[variant]} ${className}
      `}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">{icons[variant]}</div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className="text-sm mt-1">{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${
                    variant === 'info'
                      ? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                      : variant === 'success'
                      ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                      : variant === 'warning'
                      ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                      : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                  }
                `}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Spinner Component

```tsx
import React from 'react';

interface SpinnerProps {
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large';
  /** Color of the spinner */
  color?: 'primary' | 'white';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Spinner component for loading states
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  className = '',
}) => {
  // Determine size classes
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  // Determine color classes
  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      data-testid="spinner"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};
```

## Empty State Component

```tsx
import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  /** Title for the empty state */
  title: string;
  /** Description for the empty state */
  description?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Action button text */
  actionText?: string;
  /** Function to call when action button is clicked */
  onAction?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState component for displaying when no data is available
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center p-8
        ${className}
      `}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {actionText && onAction && (
        <div className="mt-4">
          <Button onClick={onAction}>{actionText}</Button>
        </div>
      )}
    </div>
  );
};
```

## Tabs Component

```tsx
import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  /** Array of tab objects */
  tabs: Tab[];
  /** Default active tab ID */
  defaultActiveTab?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tabs component for organizing content into tabbed sections
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id);

  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
```

## Modal Component

```tsx
import React, { useEffect, useRef } from 'react';

interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to call when the modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (usually buttons) */
  footer?: React.ReactNode;
  /** Maximum width of the modal */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Modal component for displaying content in a dialog
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Determine max width class
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title}
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        {/* Center modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel */}
        <div
          ref={modalRef}
          className={`
            inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left 
            overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle 
            w-full ${maxWidthClasses[maxWidth]} ${className}
          `}
        >
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              type="button"
              className="bg-gray-50 dark:bg-gray-700 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-3 sm:p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

These basic component patterns provide a foundation for building the Bitcoin Node Manager UI. Each component follows best practices for React development, including:

1. TypeScript interfaces for props
2. JSDoc comments for documentation
3. Consistent styling with TailwindCSS
4. Accessibility considerations
5. Responsive design
6. Dark mode support
7. Proper handling of loading and error states

Use these components as building blocks for more complex UI elements and pages.
