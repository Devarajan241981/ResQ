const URGENCY_STYLES: Record<string, string> = {
  normal: "bg-gray-500/10 text-gray-600",
  urgent: "bg-amber-500/10 text-amber-600",
  critical: "bg-red-500/10 text-red-600",
};

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const style = URGENCY_STYLES[urgency] ?? URGENCY_STYLES.normal;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {urgency}
    </span>
  );
}
