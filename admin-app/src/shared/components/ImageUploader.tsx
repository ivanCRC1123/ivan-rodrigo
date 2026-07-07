import { useState, useRef, useEffect, useCallback } from "react";
import { uploadImage } from "../../features/uploads/services/uploadService";

const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

interface ImageUploaderProps {
  folder: "productos" | "categorias";
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const ImageUploader = ({
  folder,
  onUpload,
  onError,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  disabled = false,
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Revoke preview object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const clearError = useCallback(() => setError(null), []);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearError();

    // Validate MIME type
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      const msg =
        "Formato no válido. Solo se permiten JPEG, PNG y WebP.";
      setError(msg);
      onError?.(msg);
      // Reset input so the same file can be selected again after fix
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      const msg = `El archivo supera el límite de ${maxSizeMB} MB.`;
      setError(msg);
      onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    setUploading(true);
    setError(null);

    try {
      const secureUrl = await uploadImage(file, folder);
      setUploadedUrl(secureUrl);
      onUpload(secureUrl);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al subir la imagen.";
      setError(msg);
      onError?.(msg);
      // Remove preview on error since upload failed
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-400">
        Imagen
      </label>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => void handleFileSelect(event)}
        disabled={disabled || uploading}
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled || uploading}
        className="w-full rounded-lg border border-dashed border-zinc-600 bg-zinc-800 px-4 py-3 text-sm text-gray-300 hover:border-emerald-500 hover:text-emerald-400 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Subiendo...
          </span>
        ) : (
          "Subir imagen"
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Preview thumbnail */}
      {(preview || uploadedUrl) && (
        <div className="group relative mt-1 inline-block">
          <img
            src={uploadedUrl ?? preview ?? ""}
            alt="Vista previa"
            className="h-24 w-24 rounded-lg border border-zinc-700 object-cover"
          />
          <button
            type="button"
            onClick={() => {
              if (preview) URL.revokeObjectURL(preview);
              setPreview(null);
              setUploadedUrl(null);
              setError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
            title="Descartar imagen"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
