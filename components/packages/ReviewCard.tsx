import Image from "next/image";

import { Star } from "@/components/ui/Icons";

type Props = {
  review: {
    author: string;
    quote: string;
    rating: number;
    trip?: string;
    avatar?: { publicId: string; url: string; alt: string };
    publishedAt?: string;
  };
};

export function ReviewCard({ review }: Props) {
  const avatar = review.avatar?.publicId ?? review.avatar?.url ?? "";
  const date = review.publishedAt
    ? new Date(review.publishedAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <figure className="flex h-full flex-col rounded-[22px] border border-black/10 bg-white p-6 shadow-card">
      <div
        className="flex gap-1 text-gold-deep"
        role="img"
        aria-label={`${review.rating} out of 5 stars`}
      >
        {Array.from({ length: review.rating }).map((_, index) => (
          <Star key={index} className="size-3.5" />
        ))}
      </div>

      <blockquote className="mt-4 flex-1 text-[14px] italic leading-relaxed text-slate">
        &ldquo;{review.quote}&rdquo;
      </blockquote>

      <figcaption className="mt-5 flex items-center gap-3 border-t border-black/8 pt-4">
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={80}
            height={80}
            sizes="40px"
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-[13px] font-semibold text-teal-deep">
            {review.author.charAt(0)}
          </span>
        )}
        <div>
          <p className="text-[13px] font-semibold text-ink">{review.author}</p>
          {(review.trip || date) && (
            <p className="text-[12px] text-slate">
              {[review.trip, date].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
