import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../../shared/components/layout/Header';
import { AppSidebar } from '../../shared/components/layout/Sidebar';
import { SidebarProvider, SidebarInset } from '../../shared/ui/sidebar';

export function MainLayout() {
  const location = useLocation();
  const [visitedPaths] = useState(() => new Set<string>());

  const isFirstVisit = !visitedPaths.has(location.pathname);

  useEffect(() => {
    visitedPaths.add(location.pathname);
  }, [location.pathname, visitedPaths]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div key={location.pathname} className={isFirstVisit ? 'page-enter' : undefined}>
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
