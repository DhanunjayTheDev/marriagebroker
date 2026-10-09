import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, X, Star, ImagePlus, ArrowRight, Loader2 } from 'lucide-react';
import { profileService } from '../../../services/profile.service';
import { cn } from '../../../lib/utils';

interface StepProps {
  onNext: (data?: Record<string, unknown>) => void;
  isSaving?: boolean;
}

export const StepPhotos: React.FC<StepProps> = ({ onNext }) => {
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: () => profileService.uploadPhotos(previews.map((p) => p.file), setUploadProgress),
    onSuccess: () => {
      toast.success('Photos uploaded!');
      onNext({});
    },
    onError: () => toast.error('Upload failed. Try again.'),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 10,
    onDrop: (accepted) => {
      const newPreviews = accepted.map((file) => ({ file, url: URL.createObjectURL(file) }));
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
    },
  });

  const removePhoto = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
          isDragActive ? 'border-brand-700 bg-brand-50 dark:bg-brand-900/20' : 'border-border hover:border-brand-300'
        )}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
          <ImagePlus className="w-8 h-8 text-brand-700" />
        </div>
        <p className="font-semibold mb-1">
          {isDragActive ? 'Drop photos here' : 'Drag & drop your photos'}
        </p>
        <p className="text-sm text-slate-500">
          or click to browse · JPG, PNG, WebP · Max 10 photos · Up to 10MB each
        </p>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
        <p className="font-medium mb-1">📸 Photo Tips for More Matches</p>
        <ul className="text-xs space-y-0.5 text-amber-700 dark:text-amber-400">
          <li>• Use a clear, recent, front-facing photo as your main picture</li>
          <li>• Profiles with photos get 10x more interest</li>
          <li>• Avoid group photos and heavy filters</li>
        </ul>
      </div>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((preview, index) => (
            <div key={preview.url} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={preview.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              {index === 0 && (
                <div className="absolute top-1.5 left-1.5 badge-premium text-[10px]">
                  <Star className="w-3 h-3 fill-current" />
                  Main
                </div>
              )}
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadMutation.isPending && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-maroon transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <button
        onClick={() => (previews.length > 0 ? uploadMutation.mutate() : onNext({}))}
        disabled={uploadMutation.isPending}
        className="btn-luxury w-full flex items-center justify-center gap-2 py-3"
      >
        {uploadMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {previews.length > 0 ? `Upload ${previews.length} Photo${previews.length > 1 ? 's' : ''}` : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

