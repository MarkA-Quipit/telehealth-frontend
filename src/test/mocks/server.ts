import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth.handlers';
import { appointmentsHandlers } from './handlers/appointments.handlers';
import { doctorsHandlers } from './handlers/doctors.handlers';
import { notificationsHandlers } from './handlers/notifications.handlers';
import { aiHandlers } from './handlers/ai.handlers';

export const server = setupServer(
  ...authHandlers,
  ...appointmentsHandlers,
  ...doctorsHandlers,
  ...notificationsHandlers,
  ...aiHandlers,
);
