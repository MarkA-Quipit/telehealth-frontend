export const QUERY_KEYS = {
  users: {
    detail: (id: string) => ['users', id] as const,
  },
  patients: {
    detail: (id: string) => ['patients', id] as const,
  },
  doctors: {
    all: (filters?: object) => ['doctors', filters] as const,
    detail: (id: string) => ['doctors', id] as const,
    slots: (id: string, date: string) => ['doctors', id, 'slots', date] as const,
  },
  appointments: {
    all: (filters?: object) => ['appointments', filters] as const,
    detail: (id: string) => ['appointments', id] as const,
    notes: (id: string) => ['appointments', id, 'notes'] as const,
    prescriptions: (id: string) => ['appointments', id, 'prescriptions'] as const,
  },
};
