import type { LucideProps } from "lucide-react";

export const Logo = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 3v18h18" />
    <path d="M7 16.5A4.5 4.5 0 0 1 11.5 12A4.5 4.5 0 0 1 16 7.5" />
    <path d="M19 4.5h-3v3" />
    <path d="m11.5 7.5.5-2.5-2.5.5" />
  </svg>
);
