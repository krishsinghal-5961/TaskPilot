import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string = ""): string {
  if (!name) return "?";
  const names = name.trim().split(' ');
  if (names.length === 1 && names[0].length > 0) {
    return names[0].substring(0, 2).toUpperCase();
  }
  return names
    .map(n => n[0])
    .slice(0, 2) // Max 2 initials
    .join('')
    .toUpperCase();
}
