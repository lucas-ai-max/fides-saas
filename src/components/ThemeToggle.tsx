import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 bg-background-secondary rounded-xl p-1 border border-border-default">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
          theme === 'light'
            ? 'bg-background-elevated text-primary shadow-sm'
            : 'text-text-tertiary hover:text-text-secondary hover:bg-background-tertiary'
        }`}
        aria-label="Modo claro"
      >
        <Sun className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme('system')}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
          theme === 'system'
            ? 'bg-background-elevated text-primary shadow-sm'
            : 'text-text-tertiary hover:text-text-secondary hover:bg-background-tertiary'
        }`}
        aria-label="Usar tema do sistema"
      >
        <Monitor className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
          theme === 'dark'
            ? 'bg-background-elevated text-primary shadow-sm'
            : 'text-text-tertiary hover:text-text-secondary hover:bg-background-tertiary'
        }`}
        aria-label="Modo escuro"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
