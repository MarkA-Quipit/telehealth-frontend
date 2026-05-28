import { Outlet } from 'react-router-dom';
import { Header } from '../../shared/components/layout/Header';
import { AppSidebar } from '../../shared/components/layout/Sidebar';
import { SidebarProvider, SidebarInset } from '../../shared/ui/sidebar';

export function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
