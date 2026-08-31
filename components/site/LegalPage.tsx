export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-mint py-16 sm:py-24">
      <div className="mx-auto max-w-[780px] px-6 sm:px-10">
        <div className="rounded-[26px] bg-white p-8 shadow-card sm:p-12">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-[13px] text-slate">Last updated {updated}</p>

          <div className="prose-legal mt-8 space-y-6 text-[15px] leading-relaxed text-slate [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
