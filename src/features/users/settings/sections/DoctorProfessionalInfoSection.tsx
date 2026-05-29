import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import { useUpdateDoctor } from '@/features/doctors/hooks/useDoctors';
import type { DoctorWithUser } from '@/features/doctors/types';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/collapsible';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface ProfessionalFormValues {
  specialization: string;
  bio: string;
  yearsOfExperience: string;
  consultationFee: string;
  licenseNumber: string;
}

interface DoctorProfessionalInfoSectionProps {
  doctor: DoctorWithUser;
  collapsible?: { isOpen: boolean; onToggle: () => void };
}

export function DoctorProfessionalInfoSection({ doctor, collapsible }: DoctorProfessionalInfoSectionProps) {
  const { mutateAsync: updateDoctor, isPending } = useUpdateDoctor();
  const { register, handleSubmit, reset } = useForm<ProfessionalFormValues>({
    defaultValues: {
      specialization: doctor.specialization ?? '',
      bio: doctor.bio ?? '',
      yearsOfExperience: doctor.yearsOfExperience != null ? String(doctor.yearsOfExperience) : '',
      consultationFee: doctor.consultationFee != null ? String(doctor.consultationFee) : '',
      licenseNumber: doctor.licenseNumber ?? '',
    },
  });

  useEffect(() => {
    reset({
      specialization: doctor.specialization ?? '',
      bio: doctor.bio ?? '',
      yearsOfExperience: doctor.yearsOfExperience != null ? String(doctor.yearsOfExperience) : '',
      consultationFee: doctor.consultationFee != null ? String(doctor.consultationFee) : '',
      licenseNumber: doctor.licenseNumber ?? '',
    });
  }, [doctor, reset]);

  async function onSubmit(values: ProfessionalFormValues) {
    try {
      await updateDoctor({
        id: doctor.id,
        dto: {
          specialization: values.specialization || undefined,
          bio: values.bio || undefined,
          licenseNumber: values.licenseNumber || undefined,
          yearsOfExperience: values.yearsOfExperience ? parseInt(values.yearsOfExperience, 10) : undefined,
          consultationFee: values.consultationFee ? parseInt(values.consultationFee, 10) : undefined,
        },
      });
      toast.success('Professional information updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    }
  }

  const formContent = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Specialization</label>
        <Input {...register('specialization')} className="h-10" placeholder="e.g. General Practitioner, Cardiologist" />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Bio</label>
        <textarea
          {...register('bio')}
          rows={4}
          className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
          placeholder="Describe your background, expertise, and approach to patient care"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Years of Experience</label>
          <Input {...register('yearsOfExperience')} type="number" min="0" className="h-10" placeholder="e.g. 5" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">
            Consultation Fee{' '}
            <span className="text-xs font-normal text-neutral-400">(stored as centavos — enter 50000 for ₱500)</span>
          </label>
          <Input {...register('consultationFee')} type="number" min="0" className="h-10" placeholder="e.g. 50000" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">License Number</label>
        <Input {...register('licenseNumber')} className="h-10" placeholder="Professional license number" />
      </div>

      <Button type="submit" disabled={isPending} className="disabled:cursor-not-allowed">
        {isPending ? 'Saving…' : 'Save Changes'}
      </Button>
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible open={collapsible.isOpen} onOpenChange={(open) => open && collapsible.onToggle()}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors">
              <h3 className="text-base font-semibold text-neutral-900">Professional Information</h3>
              <ChevronDown className={`size-4 text-neutral-400 transition-transform duration-200 ${collapsible.isOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-5 pb-5 border-t border-neutral-100 pt-4">
                {formContent}
              </div>
            </CollapsibleContent>
          </div>
        </form>
      </Collapsible>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      <h3 className="text-base font-semibold text-neutral-900">Professional Information</h3>
      {formContent}
    </form>
  );
}
