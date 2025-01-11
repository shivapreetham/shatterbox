
// Select.tsx
'use client';

import ReactSelect from 'react-select';

interface SelectProps {
  label: string;
  value?: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  options: Record<string, any>[];
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  disabled,
}) => {
  return (
    <div className="z-[100]">
      <label className="block text-sm font-medium leading-6 text-foreground">
        {label}
      </label>
      <div className="mt-2">
        <ReactSelect
          isDisabled={disabled}
          value={value}
          onChange={onChange}
          isMulti
          options={options}
          menuPortalTarget={document.body}
          classNames={{
            control: () => 'text-sm',
          }}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            control: (base, state) => ({
              ...base,
              backgroundColor: 'hsl(var(--background))',
              borderColor: state.isFocused 
                ? 'hsl(var(--primary))' 
                : 'hsl(var(--border))',
              boxShadow: state.isFocused 
                ? '0 0 0 1px hsl(var(--primary))' 
                : 'none',
              '&:hover': {
                borderColor: state.isFocused 
                  ? 'hsl(var(--primary))' 
                  : 'hsl(var(--border))'
              }
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused 
                ? 'hsl(var(--secondary))' 
                : 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              '&:active': {
                backgroundColor: 'hsl(var(--secondary))'
              }
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: 'hsl(var(--secondary))',
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: 'hsl(var(--foreground))',
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: 'hsl(var(--muted-foreground))',
              '&:hover': {
                backgroundColor: 'hsl(var(--destructive))',
                color: 'white',
              }
            }),
            input: (base) => ({
              ...base,
              color: 'hsl(var(--foreground))'
            }),
            placeholder: (base) => ({
              ...base,
              color: 'hsl(var(--muted-foreground))'
            }),
            singleValue: (base) => ({
              ...base,
              color: 'hsl(var(--foreground))'
            }),
          }}
        />
      </div>
    </div>
  );
};

export default Select;