import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const InputField = ({ className = "", ...props }: InputFieldProps) => {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white focus:ring-2 focus:ring-emerald-500 placeholder-gray-500 ${className}`}
    />
  );
};
