import { Home, BookOpen, Church, MessageCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Início', path: '/home' },
    { icon: BookOpen, label: 'Liturgia', path: '/liturgy' },
    { icon: MessageCircle, label: 'Catequista', path: '/catechist' },
    { icon: Church, label: 'Igrejas', path: '/churches' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-elevated dark:bg-background-secondary border-t border-border shadow-2xl pb-safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-background-secondary dark:hover:bg-background-tertiary'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
