"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { extractErrorMessage } from "@/lib/api/client";
import { canOrganize } from "@/lib/auth/roles";

export function GalleryUpload({ onUploaded }: { onUploaded?: () => void }) {
  const { authFetch, user } = useAuth();
  const { t } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canOrganize(user?.role, user?.is_verified)) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      body.append("caption", caption);
      await authFetch("/gallery/images/", { method: "POST", body });
      setFile(null);
      setCaption("");
      onUploaded?.();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1 text-sm">
        {t("gallery.imageLabel")}
        {/* no `required` attr: the submit button is disabled without a file, and
            jsdom (tests) never marks required file inputs as satisfied */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-1 flex-col gap-1 text-sm">
        {t("gallery.captionLabel")}
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={300}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={isUploading || !file}
        className="shrink-0 rounded-md bg-[#138808] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isUploading ? t("gallery.uploading") : t("gallery.uploadButton")}
      </button>
      {error && (
        <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
