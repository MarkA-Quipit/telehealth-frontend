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
  },
  appointments: {
    all: (filters?: object) => ['appointments', filters] as const,
    detail: (id: string) => ['appointments', id] as const,
  },
};