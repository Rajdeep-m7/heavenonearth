"use client";

import { use } from "react";

import {
  PackageEditor,
  blankPackage,
  type PackageDraft,
} from "@/components/admin/PackageEditor";
import { ErrorState, Spinner } from "@/components/admin/ui";
import { useResource } from "@/lib/admin/useResource";

type ApiPackage = Omit<PackageDraft, "category" | "coverImage" | "_id"> & {
  _id: string;
  category: { _id: string } | string | null;
  coverImage: PackageDraft["coverImage"];
};

export default function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading, error, reload } = useResource<ApiPackage>(
    `/api/packages/${id}`,
  );

  if (loading) return <Spinner label="Loading package" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  // The API populates category; the form needs just the id.
  const categoryId =
    typeof data.category === "string"
      ? data.category
      : (data.category?._id ?? "");

  const initial: PackageDraft = {
    ...blankPackage,
    ...data,
    _id: data._id,
    category: categoryId,
    description: data.description ?? "",
    destination: data.destination ?? "",
    inclusions: data.inclusions ?? [],
    exclusions: data.exclusions ?? [],
    itinerary: (data.itinerary ?? []).map((day) => ({
      day: day.day,
      title: day.title,
      detail: day.detail ?? "",
    })),
    images: data.images ?? [],
  };

  return <PackageEditor initial={initial} />;
}
