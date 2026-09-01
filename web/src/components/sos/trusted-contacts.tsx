"use client";

import { Phone, UsersRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { PaginatedResponse, TrustedContact } from "@/lib/api/types";

export function TrustedContacts() {
  const { authFetch, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    authFetch<PaginatedResponse<TrustedContact>>("/sos/trusted-contacts/")
      .then((data) => setContacts(data.results))
      .catch((err) => setError(extractErrorMessage(err)));
  }, [authFetch, isAuthenticated, authLoading]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const contact = await authFetch<TrustedContact>("/sos/trusted-contacts/", {
        method: "POST",
        body: { name, phone, relationship },
      });
      setContacts((prev) => [...prev, contact]);
      setName("");
      setPhone("");
      setRelationship("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!authLoading && !isAuthenticated) return null;

  const initials = (n: string) =>
    n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-background p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-600">
          <UsersRound className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-semibold">{t("sos.contacts.heading")}</h2>
          <p className="text-xs text-foreground/55">{t("sos.contacts.subheading")}</p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-3 py-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#123a6b]/10 text-xs font-semibold text-[#123a6b] dark:bg-blue-400/10 dark:text-blue-300">
              {initials(c.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {c.name}
                {c.relationship && <span className="font-normal text-foreground/50"> · {c.relationship}</span>}
              </p>
              <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-xs text-foreground/60 hover:text-red-600">
                <Phone className="h-3 w-3" aria-hidden />
                {c.phone}
              </a>
            </div>
          </li>
        ))}
        {contacts.length === 0 && (
          <li className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-sm text-foreground/60">
            {t("sos.contacts.empty")}
          </li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          required
          placeholder={t("sos.contacts.namePlaceholder")}
          aria-label={t("sos.contacts.nameAriaLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          required
          placeholder={t("sos.contacts.phonePlaceholder")}
          aria-label={t("sos.contacts.phoneAriaLabel")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          placeholder={t("sos.contacts.relationshipPlaceholder")}
          aria-label={t("sos.contacts.relationshipAriaLabel")}
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {t("common.add")}
        </button>
      </form>
    </div>
  );
}
