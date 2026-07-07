"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { PaginatedResponse, TrustedContact } from "@/lib/api/types";

export function TrustedContacts() {
  const { authFetch, isAuthenticated, isLoading: authLoading } = useAuth();
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

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium">Trusted contacts</h2>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <ul className="mt-3 flex flex-col gap-2">
        {contacts.map((c) => (
          <li key={c.id} className="rounded-md border border-border px-3 py-2 text-sm">
            {c.name} · {c.phone}
            {c.relationship && <span className="text-foreground/50"> ({c.relationship})</span>}
          </li>
        ))}
        {contacts.length === 0 && <li className="text-sm text-foreground/70">No trusted contacts yet.</li>}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap gap-2">
        <input
          required
          placeholder="Name"
          aria-label="Contact name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
        <input
          required
          placeholder="Phone"
          aria-label="Contact phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
        <input
          placeholder="Relationship"
          aria-label="Contact relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
