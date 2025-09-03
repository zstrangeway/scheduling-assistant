import { ReactNode } from "react";
import { FieldError } from "react-hook-form";
import { Label } from "../atoms/label";

interface FormFieldProps {
  label?: string;
  error?: FieldError;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  required = false,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}
