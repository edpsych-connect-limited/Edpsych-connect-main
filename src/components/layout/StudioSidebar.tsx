'use client';

import React from 'react';
import { Link, usePathname } from '@/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { getNavigationForRole, NavGroup } from '@/config/navigation';
import { STUDIO_DEFINITIONS } from '@/services/navigation-service';
import { ChevronRight, LogOut, User } from 'lucide-react';
import { useBranding } from '@/lib/branding/BrandingProvider';

export function StudioSidebar() {
  const { user, logout } = useAuth();
  const { config } = useBranding();
  const pathname = usePathname();

  // If no user, or on landing/demo, sidebar might not be shown (handled by parent layout logic)
  if (!user) return null;

  const navGroups = getNavigationForRole(user.role?.toUpperCase() || 'GUEST');

  // Helper to get Studio Icon
  const getGroupIcon = (groupId: string) => {
    // Map navigation group IDs to Studio IDs (e.g., 'clinical_studio' -> 'clinical')
    const studioKey = groupId.replace('_studio', '');
    const def = STUDIO_DEFINITIONS[studioKey];
    return def ? def.icon : null;
  };

  return (
    <aside className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800 z-40 hidden lg:flex">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <Link href="/" className="font-bold text-xl text-white tracking-tight">
          {config.portalName}
        </Link>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
        {navGroups.map((group) => {
          const Icon = getGroupIcon(group.id);
          
          return (
            <div key={group.id} className="group">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                {group.label}
              </h3>
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                        ${isActive 
                          ? 'bg-primary-600/10 text-primary-400 border-l-2 border-primary-500' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}
                      `}
                    >
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                      {item.beta && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-300">
                          Beta
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Section (Bottom) */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
            {user.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate capitalize">
              {user.role?.toLowerCase().replace('_', ' ')}
            </p>
          </div>
          <button 
            onClick={() => logout()}
            className="text-slate-400 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
