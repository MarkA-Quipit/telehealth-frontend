import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface QuickAction {
  label: string;
  description: string;
  path: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  columns?: 2 | 3;
}

export function QuickActions({ actions, columns = 2 }: QuickActionsProps) {
  const navigate = useNavigate();
  const gridCols = columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
      <h3 className="text-base font-semibold text-neutral-900 mb-3">Quick Actions</h3>
      <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 text-left hover:bg-neutral-50 transition"
          >
            <div className={`w-9 h-9 rounded-full ${action.iconBg} flex items-center justify-center shrink-0`}>
              <span className={action.iconColor}>{action.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{action.label}</p>
              <p className="text-xs text-neutral-500">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
