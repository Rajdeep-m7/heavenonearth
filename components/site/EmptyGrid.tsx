/** Shared empty state for public listing pages — never a bare blank section. */
export function EmptyGrid({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-[26px] border border-dashed border-black/15 bg-white/60 px-6 py-20 text-center">
      <p className="font-display text-2xl font-semibold text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-3 max-w-md text-[15px] text-slate">{description}</p>
      )}
    </div>
  );
}
