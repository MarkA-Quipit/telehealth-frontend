import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Stethoscope, Clock, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../../features/auth/hooks/useAuth';

const patientNav = [
  { to: '/patient/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/patient/doctors',   label: 'Find Doctors', icon: Stethoscope     },
  { to: '/patient/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/patient/profile',   label: 'Profile',      icon: User            },
];

const doctorNav = [
  { to: '/doctor/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/doctor/appointments',  label: 'Appointments', icon: CalendarDays    },
  { to: '/doctor/availability',  label: 'Availability', icon: Clock           },
  { to: '/doctor/profile',       label: 'Profile',      icon: User            },
];

export function Sidebar() {
  const { user } = useAuth();
  const nav = user?.roles.includes('doctor') ? doctorNav : patientNav;

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          {user?.roles.includes('doctor') ? 'Doctor' : 'Patient'}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}