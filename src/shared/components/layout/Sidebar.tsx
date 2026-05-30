import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Stethoscope, Clock, HeartPulse } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { QUERY_KEYS } from '../../constants/queryKeys';
import { listAppointments } from '../../../features/appointments/api/appointments.api';
import { listDoctors } from '../../../features/doctors/api/doctors.api';
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

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prefetch?: () => void;
}

function NavItem({ to, label, icon: Icon, prefetch }: NavItemDef) {
  const location = useLocation();
  const { state } = useSidebar();
  const isActive = location.pathname.startsWith(to);

  const button = (
    <SidebarMenuButton asChild isActive={isActive}>
      <NavLink to={to} onMouseEnter={prefetch}>
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
  const queryClient = useQueryClient();
  const isDoctor = user?.roles.includes('doctor') ?? false;

  const nav: NavItemDef[] = isDoctor
    ? [
        {
          to: '/doctor/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          prefetch: () => queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.appointments.all(),
            queryFn: () => listAppointments(),
            staleTime: 30_000,
          }),
        },
        {
          to: '/doctor/appointments',
          label: 'Appointments',
          icon: CalendarDays,
          prefetch: () => queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.appointments.all(),
            queryFn: () => listAppointments(),
            staleTime: 30_000,
          }),
        },
        {
          to: '/doctor/availability',
          label: 'Availability',
          icon: Clock,
        },
      ]
    : [
        {
          to: '/patient/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          prefetch: () => queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.appointments.all(),
            queryFn: () => listAppointments(),
            staleTime: 30_000,
          }),
        },
        {
          to: '/patient/doctors',
          label: 'Find Doctors',
          icon: Stethoscope,
          prefetch: () => queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.doctors.all(),
            queryFn: () => listDoctors({}),
            staleTime: 30_000,
          }),
        },
        {
          to: '/patient/appointments',
          label: 'Appointments',
          icon: CalendarDays,
          prefetch: () => queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.appointments.all(),
            queryFn: () => listAppointments(),
            staleTime: 30_000,
          }),
        },
      ];

  const portalLabel = isDoctor ? 'Doctor Portal' : 'Patient Portal';

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarPrimitive collapsible="icon">
        <SidebarHeader className="p-3">
          <div className="flex h-12 items-center gap-3 transition-[gap] duration-200 group-data-[collapsible=icon]:gap-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
              <HeartPulse className="size-5" />
            </div>
            <div className="flex flex-col leading-tight overflow-hidden max-w-full transition-[max-width,opacity] duration-200 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
              <span className="text-sm font-semibold text-neutral-900 truncate">VitalLink</span>
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
