import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryProvider } from './app/providers/QueryProvider';
import { router } from './app/router';

export default function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}
