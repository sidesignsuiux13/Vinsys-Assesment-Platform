import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';

const baseField =
  'w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-maroon-400 focus:ring-1 focus:ring-maroon-400 transition-colors';

interface FieldWrapProps {
  label?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, children }: FieldWrapProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-neutral-700">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const field = <input ref={ref} className={`${baseField} ${className}`} {...props} />;
    if (label || error) return <Field label={label} error={error}>{field}</Field>;
    return field;
  }
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    const field = (
      <select ref={ref} className={`${baseField} appearance-none pr-8 ${className}`} {...props}>
        {children}
      </select>
    );
    if (label || error) return <Field label={label} error={error}>{field}</Field>;
    return field;
  }
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', rows = 3, ...props }, ref) => {
    const field = (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-maroon-400 focus:ring-1 focus:ring-maroon-400 transition-colors ${className}`}
        {...props}
      />
    );
    if (label || error) return <Field label={label} error={error}>{field}</Field>;
    return field;
  }
);
Textarea.displayName = 'Textarea';
