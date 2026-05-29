import { useRef, useState } from 'react';
import { useUploadAvatar } from '../hooks/useUser';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/components/Avatar';

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function AvatarUpload({ userId, currentUrl, firstName, lastName }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const { mutateAsync: upload, isPending } = useUploadAvatar();

  const displayUrl = preview ?? currentUrl;

  function handleFileSelect(file: File) {
    setSizeError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setSizeError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setSizeError('File size exceeds 5 MB limit. Please choose a smaller image.');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    await upload({ id: userId, file: selectedFile });
    setPreview(null);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
      <p className="text-sm font-medium text-neutral-700 mb-3">Profile Photo</p>

      <div className="flex items-center gap-4">
        {/* Avatar preview */}
        <Avatar
          firstName={firstName ?? ''}
          lastName={lastName ?? ''}
          profilePictureUrl={displayUrl}
          size="xl"
        />

        {/* Drop zone + controls */}
        <div className="flex-1">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-neutral-200 rounded-lg p-4 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition"
          >
            <p className="text-sm text-neutral-500">
              {selectedFile ? selectedFile.name : 'Click or drag a photo here'}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">JPG, PNG, WebP · max 5 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleInputChange}
          />

          {sizeError && (
            <p className="text-xs text-red-500 mt-1">{sizeError}</p>
          )}

          {selectedFile && !sizeError && (
            <Button
              onClick={handleUpload}
              disabled={isPending}
              className="mt-2 inline-flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isPending ? 'Uploading…' : 'Upload Photo'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}