import { Home, BookOpen, MessageCircle, User, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProfileMenu } from "@/components/ProfileMenu";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Início', path: '/home' },
    { icon: BookOpen, label: 'Liturgia', path: '/liturgy' },
    { icon: MessageCircle, label: 'Catequista', path: '/catechist' },
    { icon: Heart, label: 'Orações', path: '/prayers' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-elevated dark:bg-background-secondary border-t border-border shadow-2xl pb-safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          const ButtonContent = (
            <button
              onClick={item.path !== '/profile' ? () => navigate(item.path) : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[72px] px-4 py-3 rounded-xl transition-colors duration-300 touch-manipulation ${isActive
                ? 'text-primary bg-primary-50 dark:bg-primary-950/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
            >
              <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );

          if (item.path === '/profile') {
            return (
              <ProfileMenu key={item.path}>
                {ButtonContent}
              </ProfileMenu>
            );
          }

          return (
            <div key={item.path}>
              {ButtonContent}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
