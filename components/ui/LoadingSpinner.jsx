import Image from 'next/image';
import { cn } from "@/lib/utils";

const sizeVariants = {
  sm: "h-4 w-4",
  md: "h-5 w-5", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

export function LoadingSpinner({ 
  size = "md", 
  className = "", 
  label = "Loading..." 
}) {
  return (
    <div className="flex items-center justify-center" role="status" aria-label={label}>
      <svg 
        className={cn(
          "animate-spin text-current",
          sizeVariants[size],
          className
        )}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function CompanyLogo() {
  return (
    <div className="flex justify-center mb-4">
      <Image
        src="/ew-logo-full.png"
        alt="Company Logo"
        width={240}
        height={72}
        priority
        className="h-auto"
        data-testid="company-logo"
      />
    </div>
  );
}