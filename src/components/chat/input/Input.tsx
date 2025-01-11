// Input.tsx
'use client';

import clsx from 'clsx';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';

interface InputProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  type = 'text',
  required = false,
  register,
  errors,
  disabled = false,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium leading-6 text-foreground"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          type={type}
          id={id}
          autoComplete={id}
          disabled={disabled}
          {...register(id, { required })}
          className={clsx(`
            form-input
            block
            w-full
            rounded-md
            border-0
            py-1.5
            text-foreground
            shadow-sm
            ring-1
            ring-inset
            ring-border
            bg-background
            placeholder:text-muted-foreground
            focus:ring-2
            focus:ring-inset
            focus:ring-primary
            transition-colors
            duration-200
            sm:text-sm
            sm:leading-6`,
            errors[id] && 'focus:ring-destructive ring-destructive/50',
            disabled && 'opacity-50 cursor-default bg-muted'
          )}
        />
      </div>
    </div>
  );
};

export default Input;
