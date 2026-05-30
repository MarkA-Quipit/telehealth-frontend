import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import { useUpdateUser } from '../../hooks/useUser';
import type { User } from '../../types';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/collapsible';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface PersonalFormValues {
  firstName: string;
  lastName: string;
  phone: string;
}

interface PersonalInfoSectionProps {
  user: User;
  collapsible?: { isOpen: boolean; onToggle: () => void };
  onDirtyChange?: (isDirty: boolean) => void;
}

export function PersonalInfoSection({ user, collapsible, onDirtyChange }: PersonalInfoSectionProps) {
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<PersonalFormValues>({
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
    },
  });

  useEffect(() => {
    reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
    });
  }, [user, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  async function onSubmit(values: PersonalFormValues) {
    try {
      const dto: { firstName?: string; lastName?: string; phone?: string } = {};
      if (values.firstName !== (user.firstName ?? '')) dto.firstName = values.firstName;
      if (values.lastName !== (user.lastName ?? '')) dto.lastName = values.lastName;
      if (values.phone !== (user.phone ?? '')) dto.phone = values.phone;

      if (Object.keys(dto).length > 0) {
        await updateUser({ id: user.id, dto });
      }
      reset(values);
      toast.success('Personal information updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    }
  }

  const formContent = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">First Name</label>
        <Input {...register('firstName')} className="h-10" placeholder="Enter first name" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Last Name</label>
        <Input {...register('lastName')} className="h-10" placeholder="Enter last name" />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm font-medium text-neutral-700">Phone Number</label>
        <Input {...register('phone')} type="tel" className="h-10" placeholder="Enter phone number" />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending} className="disabled:cursor-not-allowed">
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible open={collapsible.isOpen} onOpenChange={(open) => open && collapsible.onToggle()}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors">
              <h3 className="text-base font-semibold text-neutral-900">Personal Information</h3>
              <ChevronDown className={`size-4 text-neutral-400 transition-transform duration-200 ${collapsible.isOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-5 pb-5 space-y-4 border-t border-neutral-100 pt-4">
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
      <h3 className="text-base font-semibold text-neutral-900">Personal Information</h3>
      {formContent}
    </form>
  );
}
