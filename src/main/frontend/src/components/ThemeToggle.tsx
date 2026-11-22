import { Moon, Sun } from 'lucide-react'

export type Theme = 'light' | 'dark'

export function getSavedTheme(): Theme {
  try {
    return localStorage.getItem('sprintmate-theme') === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const Icon = theme === 'dark' ? Sun : Moon
  return <button
    type="button"
    className="theme-toggle"
    onClick={onToggle}
    aria-label={`Switch to ${nextTheme} theme`}
    aria-pressed={theme === 'dark'}
    title={`Switch to ${nextTheme} theme`}
  >
    <Icon size={15} aria-hidden="true" />
    <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
  </button>
}
