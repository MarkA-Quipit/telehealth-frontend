import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './app/providers/AuthProvider';
import { QueryProvider } from './app/providers/QueryProvider';
import { AppRouter } from './app/router';

export default function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <AppRouter />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
