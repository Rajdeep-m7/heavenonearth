type JsonLdProps = {
  /** Any serialisable schema.org object or @graph wrapper. */
  data: Record<string, unknown>;
  id?: string;
};

/**
 * Renders structured data inline so it is present in the initial HTML that
 * crawlers parse — no client hydration, no external request.
 * `<` is escaped to prevent a stray "</script>" inside the data from closing
 * the tag early.
 */
export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
