// Bottom Navigation for Mobile

'use client';

import { Home, FilePlus, Settings, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInvoiceStore } from '@/store/invoice-store';

interface BottomNavProps {
  currentPage: 'list' | 'editor';
  onNavigate: (page: 'list' | 'editor') => void;
}

const navItems = [
  { id: 'list' as const, label: 'Invoice', icon: Home },
  { id: 'editor' as const, label: 'Buat', icon: FilePlus },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
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
