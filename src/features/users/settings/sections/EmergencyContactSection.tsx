import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useUpdatePatient } from '@/features/patients/hooks/usePatient';
import type { Patient } from '@/features/patients/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface EmergencyContactFormValues {
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface EmergencyContactSectionProps {
  patient: Patient;
}

export function EmergencyContactSection({ patient }: EmergencyContactSectionProps) {
  const { mutateAsync: updatePatient, isPending } = useUpdatePatient();
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<EmergencyContactFormValues>({
    defaultValues: {
      emergencyContactName: patient.emergencyContactName ?? '',
      emergencyContactPhone: patient.emergencyContactPhone ?? '',
    },
  });

  useEffect(() => {
    reset({
      emergencyContactName: patient.emergencyContactName ?? '',
      emergencyContactPhone: patient.emergencyContactPhone ?? '',
    });
  }, [patient, reset]);

  async function onSubmit(values: EmergencyContactFormValues) {
    try {
      await updatePatient({
        id: patient.id,
        dto: {
          emergencyContactName: values.emergencyContactName || undefined,
          emergencyContactPhone: values.emergencyContactPhone || undefined,
        },
      });
      reset(values);
      toast.success('Emergency contact updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      <h3 className="text-base font-semibold text-neutral-900">Emergency Contact</h3>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Contact Name</label>
        <Input {...register('emergencyContactName')} className="h-10" placeholder="Full name" />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Contact Phone</label>
        <Input {...register('emergencyContactPhone')} type="tel" className="h-10" placeholder="Phone number" />
      </div>

      {isDirty && (
        <Button type="submit" disabled={isPending} className="w-full disabled:cursor-not-allowed">
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      )}
    </form>
  );
}
