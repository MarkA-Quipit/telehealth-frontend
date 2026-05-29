import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { DoctorCard } from '@/features/doctors/components/DoctorCard';
import { useAIRecommendation } from '../hooks/useAIRecommendation';
import { Button } from '@/shared/ui/button';

export function SymptomChecker() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate, data, isPending, isError, reset } = useAIRecommendation();

  function handleSubmit() {
    if (symptoms.trim().length < 10) return;
    mutate(symptoms, {
      onSuccess: () => setSubmitted(true),
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      {/* Header */}
      <p className="text-sm text-neutral-500">
        Not sure which doctor to see? Describe your symptoms below.
      </p>

      {/* Textarea */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Describe your symptoms</label>
        <textarea
          rows={4}
          value={symptoms}
          onChange={(e) => {
            setSymptoms(e.target.value);
            if (submitted) {
              setSubmitted(false);
              reset();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="e.g., I've been having chest pain and shortness of breath for the past week…"
          className="w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
        />
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={isPending || symptoms.trim().length < 10}
        className="flex items-center gap-2 disabled:cursor-not-allowed"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Find Matching Doctors
      </Button>

      {/* Error state */}
      {isError && (
        <p className="text-sm text-red-500">
          Unable to process your symptoms. Please try again.
        </p>
      )}

      {/* Results */}
      {submitted && data && data.recommendations.length > 0 && (
        <div className="space-y-5 pt-2 border-t border-neutral-100">
          {data.recommendations.map((rec) => (
            <div key={rec.specialization} className="space-y-2">
              {/* Specialization badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-sky-100 text-sky-700 rounded-full px-3 py-1 text-sm font-medium">
                  {rec.specialization}
                </span>
              </div>

              {/* Reason */}
              <p className="text-sm text-neutral-500">{rec.reason}</p>

              {/* Doctor cards */}
              {rec.doctors.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No doctors of this specialization currently available.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rec.doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() =>
                        navigate('/patient/appointments/book', {
                          state: { symptoms, doctorId: doctor.id },
                        })
                      }
                      className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl"
                    >
                      <DoctorCard doctor={doctor} compact />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Disclaimer — always visible after first submit */}
          <p className="text-xs text-neutral-400 text-center pt-2">
            This is a discovery tool only and does not constitute medical advice.
          </p>
        </div>
      )}
    </div>
  );
}
