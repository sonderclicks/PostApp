"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { createPost } from "@/app/actions";

export default function UploadForm({ clientId, month }: { clientId: string; month: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string;

    if (!file || file.size === 0) {
      setError("Choose a photo or video first.");
      return;
    }

    setUploading(true);
    try {
      const mediaType = file.type.startsWith("video") ? "video" : "image";

      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      });

      await createPost({
        clientId,
        month,
        mediaUrl: blob.url,
        mediaType,
        caption,
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
      if (captionInputRef.current) captionInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 sm:flex-row sm:items-center dark:border-white/10"
    >
      <input
        ref={fileInputRef}
        type="file"
        name="file"
        accept="image/*,video/*"
        required
        className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-black/5 file:px-3 file:py-2 file:text-sm file:font-medium dark:file:bg-white/10"
      />
      <input
        ref={captionInputRef}
        type="text"
        name="caption"
        placeholder="Caption (optional)"
        className="flex-1 rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
      />
      <button
        type="submit"
        disabled={uploading}
        className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
