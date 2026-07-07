const STATUS_STYLES: Record<string, string> = {
  missing: "bg-red-500/10 text-red-600",
  verified: "bg-amber-500/10 text-amber-600",
  found: "bg-green-500/10 text-green-600",
  closed: "bg-gray-500/10 text-gray-600",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.closed;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}
