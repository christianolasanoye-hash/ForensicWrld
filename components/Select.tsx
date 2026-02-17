import { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options?: SelectOption[];
  children?: React.ReactNode;
}

export default function Select({ className = "", options, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full border-b border-white/20 bg-black px-0 py-4 text-xs font-bold uppercase tracking-widest text-white focus:border-white focus:outline-none transition-all ${className}`}
    >
      {options ? (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      ) : (
        children
      )}
    </select>
  );
}









