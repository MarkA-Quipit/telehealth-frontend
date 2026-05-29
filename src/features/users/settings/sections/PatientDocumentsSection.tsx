import { useRef } from 'react';
import { toast } from 'sonner';
import { useDocuments, useUploadDocument } from '@/features/patients/hooks/usePatient';
import { formatDateUTC } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';

interface PatientDocumentsSectionProps {
  patientId: string;
}

export function PatientDocumentsSection({ patientId }: PatientDocumentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: documents = [], isLoading } = useDocuments(patientId);
  const { mutateAsync: doUpload, isPending: uploading } = useUploadDocument(patientId);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await doUpload(file);
      toast.success('Document uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-neutral-900">Medical Documents</h3>
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading…' : '+ Upload'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-neutral-500">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <p className="text-neutral-800 truncate">{doc.fileName}</p>
                <p className="text-xs text-neutral-400">{formatDateUTC(doc.uploadedAt.split('T')[0])}</p>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 ml-3 text-xs font-medium text-sky-700 hover:text-sky-600 transition"
              >
                View →
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
