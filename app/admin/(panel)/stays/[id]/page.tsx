"use client";

import { use } from "react";

import { StayEditor, blankStay, type StayDraft } from "@/components/admin/StayEditor";
import { ErrorState, Spinner } from "@/components/admin/ui";
import { useResource } from "@/lib/admin/useResource";

type ApiStay = Omit<StayDraft, "category" | "_id"> & {
  _id: string;
  category: { _id: string } | string | null;
};

export default function EditStayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading, error, reload } = useResource<ApiStay>(
    `/api/stays/${id}`,
  );

  if (loading) return <Spinner label="Loading stay" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const categoryId =
    typeof data.category === "string" ? data.category : (data.category?._id ?? "");

  const initial: StayDraft = {
    ...blankStay,
    ...data,
    _id: data._id,
    category: categoryId,
    description: data.description ?? "",
    cancellationPolicy: data.cancellationPolicy ?? "",
    location: {
      address: data.location?.address ?? "",
      locality: data.location?.locality ?? "",
      region: data.location?.region ?? "",
    },
    host: {
      name: data.host?.name ?? "",
      bio: data.host?.bio ?? "",
      tags: data.host?.tags ?? [],
    },
    amenities: data.amenities ?? [],
    houseRules: data.houseRules ?? [],
    highlights: data.highlights ?? [],
    images: data.images ?? [],
  };

  return <StayEditor initial={initial} />;
}
