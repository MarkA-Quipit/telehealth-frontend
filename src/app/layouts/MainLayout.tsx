import { Outlet } from 'react-router-dom';
import { Header } from '../../shared/components/layout/Header';
import { Sidebar } from '../../shared/components/layout/Sidebar';

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}