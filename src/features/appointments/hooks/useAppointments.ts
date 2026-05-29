import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateStatus,
  cancelAppointment,
  rescheduleAppointment,
  getNotes,
  saveNotes,
  getPrescriptions,
  addPrescription,
  deletePrescription,
  searchPatients,
} from '../api/appointments.api';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { AppointmentFilters, CreateAppointmentDto, UpdateStatusDto, CancelAppointmentDto, ConsultationNote, PatientSearchFilters } from '../types';

// ── List ──────────────────────────────────────────────────────────────────────
export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.appointments.all(filters),
    queryFn: () => listAppointments(filters),
  });
}

// ── Detail ────────────────────────────────────────────────────────────────────
export function useAppointment(id?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.appointments.detail(id ?? ''),
    queryFn: () => getAppointment(id!),
    enabled: !!id,
  });
}

// ── Create ────────────────────────────────────────────────────────────────────
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAppointmentDto) => createAppointment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.all() });
    },
  });
}

// ── Update Status ─────────────────────────────────────────────────────────────
export function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStatusDto }) => updateStatus(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.all() });
    },
  });
}

// ── Cancel ────────────────────────────────────────────────────────────────────
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CancelAppointmentDto }) =>
      cancelAppointment(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.all() });
    },
  });
}

// ── Reschedule ────────────────────────────────────────────────────────────────
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { newScheduledAt: string; durationMinutes?: number } }) =>
      rescheduleAppointment(id, dto),
    onSuccess: (newAppt, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.all() });
      // Also prime the new appointment in cache
      if (newAppt?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.detail(newAppt.id) });
      }
    },
  });
}

// ── Patient Search (doctor-only) ──────────────────────────────────────────────
export function usePatientSearch(filters: PatientSearchFilters) {
  const isEnabled =
    (filters.q?.trim().length ?? 0) >= 2 ||
    !!filters.bloodType ||
    !!filters.sex ||
    filters.minConsultations != null;

  return useQuery({
    queryKey: QUERY_KEYS.appointments.patientSearch(filters.q ?? '', filters),
    queryFn: () => searchPatients(filters),
    enabled: isEnabled,
  });
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export function useNotes(appointmentId?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.appointments.notes(appointmentId ?? ''),
    queryFn: () => getNotes(appointmentId!),
    enabled: !!appointmentId,
  });
}

export function useSaveNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: Partial<Pick<ConsultationNote, 'chiefComplaint' | 'diagnosis' | 'notes' | 'followUpDate'>>;
    }) => saveNotes(appointmentId, data),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.notes(appointmentId) });
    },
  });
}

// ── Prescriptions ─────────────────────────────────────────────────────────────
export function usePrescriptions(appointmentId?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.appointments.prescriptions(appointmentId ?? ''),
    queryFn: () => getPrescriptions(appointmentId!),
    enabled: !!appointmentId,
  });
}

export function useAddPrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: {
        medicationName: string;
        dosage?: string;
        frequency?: string;
        duration?: string;
        instructions?: string;
      };
    }) => addPrescription(appointmentId, data),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.appointments.prescriptions(appointmentId),
      });
    },
  });
}

export function useDeletePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appointmentId,
      prescriptionId,
    }: {
      appointmentId: string;
      prescriptionId: string;
    }) => deletePrescription(appointmentId, prescriptionId),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.appointments.prescriptions(appointmentId),
      });
    },
  });
}
