import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return 'Not disclosed';
  const fmt = (a: number) => a >= 10000000 ? \`\${(a/10000000).toFixed(1)}Cr\` : a >= 100000 ? \`\${(a/100000).toFixed(0)}L\` : \`\${(a/1000).toFixed(0)}K\`;
  return min && max ? \`₹\${fmt(min)} - \${fmt(max)}\` : \`₹\${fmt(min || max!)}\`;
}