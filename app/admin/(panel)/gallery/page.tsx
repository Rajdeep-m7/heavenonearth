"use client";

import { useRef, useState } from "react";

import { previewSrc, type AdminImage } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Spinner,
} from "@/components/admin/ui";
import { ApiClientError, api, uploadToCloudinary } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type GalleryRow = {
  _id: string;
  image: AdminImage;
  title?: string;
  caption?: string;
  tags: string[];
  isActive: boolean;
  category?: { _id: string; name: string } | null;
};

const MAX_BYTES = 10 * 1024 * 1024;

export default function GalleryPage() {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, loading, error, reload } =
    useResource<GalleryRow[]>("/api/admin/gallery");
  const { data: categories } = useResource<{ _id: string; name: string }[]>(
    "/api/admin/categories",
  );

  const [uploading, setUploading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const upload = async (files: FileList) => {
    setUploading(true);
    try {
      const { data: signature } = await api.post<{
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        folder: string;
      }>("/api/admin/upload/signature", { folder: "gallery" });

      const items: { image: AdminImage }[] = [];
      const list = Array.from(files);

      for (const [index, file] of list.entries()) {
        if (!file.type.startsWith("image/") || file.size > MAX_BYTES) {
          toast.error(`Skipped ${file.name} — not an image, or over 10 MB.`);
          continue;
        }
        setProgressLabel(`Uploading ${index + 1} of ${list.length}…`);
        const uploaded = await uploadToCloudinary(file, signature);
        items.push({ image: { ...uploaded, alt: "" } });
      }

      if (items.length === 0) return;

      // One request for the whole batch rather than N.
      await api.post("/api/gallery", { items });
      toast.success(`Added ${items.length} image${items.length === 1 ? "" : "s"}.`);
      await reload();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
      setProgressLabel("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const patch = async (row: GalleryRow, body: Record<string, unknown>) => {
    try {
      await api.patch(`/api/gallery/${row._id}`, body);
      await reload();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not update.",
      );
    }
  };

  const removeSelected = async () => {
    if (selected.size === 0) return;
    if (
      !confirm(
        `Delete ${selected.size} image${selected.size === 1 ? "" : "s"}? They will be removed from Cloudinary too.`,
      )
    ) {
      return;
    }
    const ids = [...selected];
    const results = await Promise.allSettled(
      ids.map((id) => api.del(`/api/gallery/${id}`)),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed) toast.error(`${failed} could not be deleted.`);
    else toast.success(`Deleted ${ids.length}.`);
    setSelected(new Set());
    await reload();
  };

  const toggleSelect = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gallery"
        description="Photos for the public gallery page. Add alt text so they earn their place in search."
        action={
          <div className="flex gap-2">
            {selected.size > 0 && (
              <Button variant="ghost" onClick={removeSelected}>
                Delete {selected.size}
              </Button>
            )}
            <Button
              onClick={() => inputRef.current?.click()}
              loading={uploading}
            >
              {uploading ? progressLabel || "Uploading…" : "Upload images"}
            </Button>
          </div>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) void upload(event.target.files);
        }}
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState
          title="No images yet"
          description="Upload a batch — you can add captions and tags afterwards."
          action={
            <Button onClick={() => inputRef.current?.click()}>
              Upload images
            </Button>
          }
        />
      )}

      {data && data.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((row) => (
            <li key={row._id}>
              <Card className="overflow-hidden">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc(row.image, 500)}
                    alt={row.image.alt || ""}
                    className="h-40 w-full object-cover"
                  />
                  <label className="absolute left-3 top-3 flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-medium shadow">
                    <input
                      type="checkbox"
                      checked={selected.has(row._id)}
                      onChange={() => toggleSelect(row._id)}
                      className="size-3.5 accent-teal"
                    />
                    Select
                  </label>
                  {!row.isActive && (
                    <span className="absolute right-3 top-3">
                      <Badge tone="danger">Hidden</Badge>
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 p-4">
                  <Input
                    defaultValue={row.image.alt}
                    placeholder="Alt text (required for SEO)"
                    onBlur={(e) => {
                      if (e.target.value !== row.image.alt) {
                        patch(row, { image: { ...row.image, alt: e.target.value } });
                      }
                    }}
                    className="!py-2 !text-[13px]"
                  />
                  <Input
                    defaultValue={row.caption ?? ""}
                    placeholder="Caption"
                    onBlur={(e) => {
                      if (e.target.value !== (row.caption ?? "")) {
                        patch(row, { caption: e.target.value });
                      }
                    }}
                    className="!py-2 !text-[13px]"
                  />
                  <Select
                    defaultValue={row.category?._id ?? ""}
                    onChange={(e) =>
                      patch(row, { category: e.target.value || undefined })
                    }
                    className="!py-2 !text-[13px]"
                    aria-label="Category"
                  >
                    <option value="">No category</option>
                    {(categories ?? []).map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>

                  {!row.image.alt && (
                    <p className="text-[12px] font-medium text-red-600">
                      Missing alt text.
                    </p>
                  )}

                  <div className="flex justify-between pt-1">
                    <button
                      onClick={() => patch(row, { isActive: !row.isActive })}
                      className="text-[13px] font-medium text-teal-deep hover:underline"
                    >
                      {row.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this image?")) return;
                        try {
                          await api.del(`/api/gallery/${row._id}`);
                          toast.success("Deleted.");
                          await reload();
                        } catch {
                          toast.error("Could not delete.");
                        }
                      }}
                      className="text-[13px] font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
