"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth, type RegisterInput } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { extractErrorMessage } from "@/lib/api/client";
import type { BloodGroup, Gender } from "@/lib/api/types";
import { normalizePhone } from "@/lib/phone";
import { PasswordInput } from "./password-input";

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS: { value: Gender; labelKey: TranslationKey }[] = [
  { value: "female", labelKey: "common.female" },
  { value: "male", labelKey: "common.male" },
  { value: "other", labelKey: "common.other" },
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
  const { t } = useLanguage();
  return (
    <div className="mb-8">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-red-600 transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-foreground/50">
        {t("wizard.stepOf", { current: stepIndex + 1, total })}
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
  onSkip,
}: {
  question: string;
  hint?: string;
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
  canGoBack: boolean;
  onSkip?: () => void;
}) {
  const { t } = useLanguage();
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
          {t("common.next")}
        </button>
        {onSkip && (
          <button type="button" onClick={onSkip} className="text-sm text-foreground/50 hover:underline">
            {t("common.skip")}
          </button>
        )}
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            className="ml-auto text-sm text-foreground/50 hover:underline"
          >
            {t("common.back")}
          </button>
        )}
      </div>
    </form>
  );
}

export function RegisterWizard() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
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
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-background/60 p-6 shadow-sm sm:p-8">
      <ProgressBar stepIndex={stepIndexForProgress} total={STEPS.length} />

      {error && (
        <p role="alert" className="mx-auto mb-4 max-w-md rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {step === "name" && (
        <QuestionShell
          question={t("wizard.nameQ")}
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
            placeholder={t("wizard.namePlaceholder")}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-lg"
          />
        </QuestionShell>
      )}

      {step === "email" && (
        <QuestionShell
          question={t("wizard.emailQ")}
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
          question={t("wizard.phoneQ")}
          hint={t("wizard.phoneHint")}
          canGoBack
          onBack={goBack}
          onSubmit={(e) => {
            e.preventDefault();
            const normalized = normalizePhone(answers.phone);
            if (!normalized) {
              setPhoneError(t("wizard.phoneError"));
              return;
            }
            setPhoneError(null);
            update("phone", normalized);
            goNext();
          }}
        >
          <input
            autoFocus
            type="tel"
            required
            aria-label="Phone"
            value={answers.phone}
            onChange={(e) => {
              setPhoneError(null);
              update("phone", e.target.value);
            }}
            placeholder="+91XXXXXXXXXX"
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-lg"
          />
          {phoneError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {phoneError}
            </p>
          )}
        </QuestionShell>
      )}

      {step === "password" && (
        <QuestionShell
          question={t("wizard.passwordQ")}
          hint={t("wizard.passwordHint")}
          canGoBack
          onBack={goBack}
          onSubmit={(e) => {
            e.preventDefault();
            if (answers.password.length >= 10) goNext();
          }}
        >
          <PasswordInput
            autoFocus
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
          question={t("wizard.genderQ")}
          hint={t("wizard.genderHint")}
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
                {t(g.labelKey)}
              </button>
            ))}
          </div>
        </QuestionShell>
      )}

      {step === "city" && (
        <QuestionShell
          question={t("wizard.cityQ")}
          hint={t("wizard.cityHint")}
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
            placeholder={t("wizard.cityPlaceholder")}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-lg"
          />
        </QuestionShell>
      )}

      {step === "bloodGroup" && (
        <QuestionShell
          question={t("wizard.bloodGroupQ")}
          hint={t("wizard.bloodGroupHint")}
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
          <h1 className="text-2xl font-semibold">{t("wizard.reviewHeading")}</h1>
          <dl className="mt-6 divide-y divide-border rounded-lg border border-border text-sm">
            {[
              [t("wizard.reviewName"), answers.full_name],
              [t("wizard.reviewEmail"), answers.email],
              [t("wizard.reviewPhone"), answers.phone],
              [t("wizard.reviewGender"), answers.gender || t("common.notSpecified")],
              [t("wizard.reviewCity"), answers.city || t("common.notSpecified")],
              [t("wizard.reviewBloodGroup"), answers.blood_group || t("wizard.notRegisteringDonor")],
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
              {isSubmitting ? t("wizard.creatingAccount") : t("wizard.createAccount")}
            </button>
            <button type="button" onClick={goBack} className="ml-auto text-sm text-foreground/50 hover:underline">
              {t("common.back")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
