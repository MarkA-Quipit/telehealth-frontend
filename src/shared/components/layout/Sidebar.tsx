import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Stethoscope, Clock, User } from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '../../ui/sidebar';

const patientNav = [
  { to: '/patient/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/patient/doctors',      label: 'Find Doctors', icon: Stethoscope     },
  { to: '/patient/appointments', label: 'Appointments', icon: CalendarDays    },
  { to: '/patient/profile',      label: 'Profile',      icon: User            },
];

const doctorNav = [
  { to: '/doctor/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays    },
  { to: '/doctor/availability', label: 'Availability', icon: Clock           },
  { to: '/doctor/profile',      label: 'Profile',      icon: User            },
];

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const nav = user?.roles.includes('doctor') ? doctorNav : patientNav;

  return (
    <SidebarPrimitive>
      <SidebarHeader>
        <div className="flex h-10 items-center gap-2.5 px-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold select-none">
            T
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-sidebar-foreground">Telehealth</span>
            <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">
              {user?.roles.includes('doctor') ? 'Doctor Portal' : 'Patient Portal'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(to)}
                  >
                    <NavLink to={to}>
                      <Icon />
                      <span>{label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarPrimitive>
  );
}
