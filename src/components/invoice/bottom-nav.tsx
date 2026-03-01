// Bottom Navigation for Mobile

'use client';

import { Home, FilePlus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  currentPage: 'list' | 'editor';
  onNavigate: (page: 'list' | 'editor' | 'about') => void;
}

const navItems = [
  { id: 'list' as const, label: 'Invoice', icon: Home },
  { id: 'editor' as const, label: 'Buat', icon: FilePlus },
  { id: 'about' as const, label: 'Tentang Kami', icon: Info },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id !== 'about' && currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'font-bold')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
