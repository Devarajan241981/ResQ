"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth, type RegisterInput } from "@/lib/auth/auth-context";
import { extractErrorMessage } from "@/lib/api/client";
import type { BloodGroup, Gender } from "@/lib/api/types";

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

type StepId = "name" | "email" | "phone" | "password" | "gender" | "city" | "bloodGroup" | "review";
const STEPS: StepId[] = ["name", "email", "phone", "password", "gender", "city", "bloodGroup", "review"];

interface Answers {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  gender: Gender | "";
  city: string;
  blood_group: BloodGroup | "";
}

const EMPTY_ANSWERS: Answers = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  gender: "",
  city: "",
  blood_group: "",
};

function ProgressBar({ stepIndex, total }: { stepIndex: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-red-600 transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-foreground/50">
        Step {stepIndex + 1} of {total}
      </p>
    </div>
  );
}

function QuestionShell({
  question,
  hint,
  children,
  onSubmit,
  onBack,
  canGoBack,
  submitLabel = "Next",
  onSkip,
}: {
  question: string;
  hint?: string;
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
  canGoBack: boolean;
  submitLabel?: string;
  onSkip?: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">{question}</h1>
      {hint && <p className="mt-1 text-sm text-foreground/60">{hint}</p>}
      <div className="mt-6">{children}</div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          {submitLabel}
        </button>
        {onSkip && (
          <button type="button" onClick={onSkip} className="text-sm text-foreground/50 hover:underline">
            Skip
          </button>
        )}
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            className="ml-auto text-sm text-foreground/50 hover:underline"
          >
            Back
          </button>
        )}
      </div>
    </form>
  );
}

export function RegisterWizard() {
  const router = useRouter();
  const { register } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[stepIndex];
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFinalSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: RegisterInput = {
        full_name: answers.full_name,
        email: answers.email,
        phone: answers.phone,
        password: answers.password,
      };
      if (answers.gender) payload.gender = answers.gender;
      if (answers.city) payload.city = answers.city;
      if (answers.blood_group) payload.blood_group = answers.blood_group;

      await register(payload);
      router.push("/");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepIndexForProgress = STEPS.indexOf(step);

  return (
    <div>
      <ProgressBar stepIndex={stepIndexForProgress} total={STEPS.length} />

      {error && (
        <p role="alert" className="mx-auto mb-4 max-w-md rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {step === "name" && (
        <QuestionShell
          question="What's your name?"
          canGoBack={false}
          onBack={goBack}
          onSubmit={(e) => {
            e.preventDefault();
            if (answers.full_name.trim()) goNext();
          }}
        >
          <input
            autoFocus
            required
            aria-label="Full name"
            value={answers.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            placeholder="Asha Kumar"
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-lg"
          />
        </QuestionShell>
      )}

      {step === "email" && (
        <QuestionShell
          question="What's your email?"
          canGoBack
          onBack={goBack}
          onSubmit={(e) => {
            e.preventDefault();
            if (answers.email.trim()) goNext();
          }}
        >
          <input
            autoFocus
            type="email"
            required
            aria-label="Email"
            value={answers.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="asha@example.com"
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-lg"
          />
        </QuestionShell>
      )}

      {step === "phone" && (
        <QuestionShell
          question="What's your phone number?"
          hint="Used for OTP login and SOS alerts."
          canGoBack
          onBack={goBack}
          onSubmit={(e) => {
            e.preventDefault();
            if (answers.phone.trim()) goNext();
          }}
        >
          <input
            autoFocus
            type="tel"
            required
            aria-label="Phone"
            value={answers.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+91XXXXXXXXXX"
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-lg"
          />
        </QuestionShell>
      )}

      {step === "password" && (
        <QuestionShell
          question="Choose a password"
          hint="At least 10 characters."
          canGoBack
          onBack={goBack}
          onSubmit={(e) => {
            e.preventDefault();
            if (answers.password.length >= 10) goNext();
          }}
        >
          <input
            autoFocus
            type="password"
            required
            minLength={10}
            aria-label="Password"
            value={answers.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-lg"
          />
        </QuestionShell>
      )}

      {step === "gender" && (
        <QuestionShell
          question="How do you identify?"
          hint="Optional — helps us route the right kind of assistance during an emergency."
          canGoBack
          onBack={goBack}
          onSkip={() => {
            update("gender", "");
            goNext();
          }}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-3 gap-3">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => {
                  update("gender", g.value);
                  goNext();
                }}
                className={`rounded-lg border px-4 py-4 text-sm font-medium transition-colors ${
                  answers.gender === g.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-surface"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </QuestionShell>
      )}

      {step === "city" && (
        <QuestionShell
          question="Which city are you in?"
          hint="Helps match you with nearby volunteers, donors, and alerts. Optional."
          canGoBack
          onBack={goBack}
          onSkip={() => {
            update("city", "");
            goNext();
          }}
          onSubmit={(e) => {
            e.preventDefault();
            goNext();
          }}
        >
          <input
            autoFocus
            aria-label="City"
            value={answers.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Bengaluru"
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-lg"
          />
        </QuestionShell>
      )}

      {step === "bloodGroup" && (
        <QuestionShell
          question="What's your blood group?"
          hint="Optional — register as a donor so nearby emergency requests can reach you."
          canGoBack
          onBack={goBack}
          onSkip={() => {
            update("blood_group", "");
            goNext();
          }}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-4 gap-3">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => {
                  update("blood_group", bg);
                  goNext();
                }}
                className={`rounded-lg border px-4 py-4 text-center text-lg font-semibold transition-colors ${
                  answers.blood_group === bg
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-border hover:bg-surface"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </QuestionShell>
      )}

      {step === "review" && (
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-semibold">Review &amp; create account</h1>
          <dl className="mt-6 divide-y divide-border rounded-lg border border-border text-sm">
            {[
              ["Name", answers.full_name],
              ["Email", answers.email],
              ["Phone", answers.phone],
              ["Gender", answers.gender || "Not specified"],
              ["City", answers.city || "Not specified"],
              ["Blood group", answers.blood_group || "Not registering as a donor"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-4 py-3">
                <dt className="text-foreground/50">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
            <button type="button" onClick={goBack} className="ml-auto text-sm text-foreground/50 hover:underline">
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
