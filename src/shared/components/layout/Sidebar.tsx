import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Stethoscope, Clock, User, Activity } from 'lucide-react';
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
  useSidebar,
} from '../../ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

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

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const location = useLocation();
  const { state } = useSidebar();
  const isActive = location.pathname.startsWith(to);

  const button = (
    <SidebarMenuButton asChild isActive={isActive}>
      <NavLink to={to}>
        <Icon className="shrink-0" />
        <span>{label}</span>
      </NavLink>
    </SidebarMenuButton>
  );

  if (state === 'collapsed') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={14}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

export function AppSidebar() {
  const { user } = useAuth();
  const nav = user?.roles.includes('doctor') ? doctorNav : patientNav;
  const portalLabel = user?.roles.includes('doctor') ? 'Doctor Portal' : 'Patient Portal';

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarPrimitive collapsible="icon">
        <SidebarHeader className="p-3">
          <div className="flex h-12 items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
              <Activity className="size-5" />
            </div>
            <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden overflow-hidden">
              <span className="text-sm font-semibold text-neutral-900 truncate">Telehealth</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider truncate">
                {portalLabel}
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup className="py-3">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {nav.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <NavItem {...item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </SidebarPrimitive>
    </TooltipProvider>
  );
}
