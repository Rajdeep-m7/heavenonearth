"use client";

import { useRef, useState, useEffect } from "react";

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
  
  // State for explicit Edit/Done flow
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  
  // State for Delete confirmation modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      const { data: inserted } = await api.post<GalleryRow[]>("/api/gallery", { items });
      toast.success(`Added ${items.length} image${items.length === 1 ? "" : "s"}.`);
      
      // Automatically open the form fields for the newly uploaded images
      const newIds = inserted.map(item => item._id);
      setEditingIds(current => new Set([...current, ...newIds]));
      
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
      throw err; // Re-throw to handle in UI if needed
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

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await api.del(`/api/gallery/${deletingId}`);
      toast.success("Deleted.");
      setDeletingId(null);
      await reload();
    } catch {
      toast.error("Could not delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gallery"
        description="Public gallery photos. Upload in 4:5 portrait format (e.g. 800 × 1000) to match the website layout."
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
            <GalleryCard
              key={row._id}
              row={row}
              categories={categories || []}
              isSelected={selected.has(row._id)}
              isEditing={editingIds.has(row._id)}
              onToggleSelect={() => toggleSelect(row._id)}
              onDeleteReq={() => setDeletingId(row._id)}
              onSetEditing={(editing) => {
                setEditingIds((current) => {
                  const next = new Set(current);
                  if (editing) next.add(row._id);
                  else next.delete(row._id);
                  return next;
                });
              }}
              onPatch={patch}
            />
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-ink">Delete Image?</h3>
            <p className="mt-2 text-[15px] text-slate">
              Are you sure you want to delete this image? It will also be removed from Cloudinary. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                loading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryCard({
  row,
  categories,
  isSelected,
  isEditing,
  onToggleSelect,
  onDeleteReq,
  onSetEditing,
  onPatch,
}: {
  row: GalleryRow;
  categories: { _id: string; name: string }[];
  isSelected: boolean;
  isEditing: boolean;
  onToggleSelect: () => void;
  onDeleteReq: () => void;
  onSetEditing: (editing: boolean) => void;
  onPatch: (row: GalleryRow, body: Record<string, unknown>) => Promise<void>;
}) {
  const [alt, setAlt] = useState(row.image.alt || "");
  const [caption, setCaption] = useState(row.caption || "");
  const [categoryId, setCategoryId] = useState(row.category?._id || "");
  const [saving, setSaving] = useState(false);

  // Sync state if row updates externally (e.g. on reload)
  useEffect(() => {
    if (!isEditing) {
      setAlt(row.image.alt || "");
      setCaption(row.caption || "");
      setCategoryId(row.category?._id || "");
    }
  }, [row, isEditing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onPatch(row, {
        image: { ...row.image, alt },
        caption,
        category: categoryId || undefined,
      });
      onSetEditing(false);
    } catch {
      // toast is handled in patch
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Revert
    setAlt(row.image.alt || "");
    setCaption(row.caption || "");
    setCategoryId(row.category?._id || "");
    onSetEditing(false);
  };

  return (
    <li>
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/5] overflow-hidden bg-black/[0.04]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc(row.image, 500)}
            alt={row.image.alt || ""}
            className="size-full object-cover"
          />
          <label className="absolute left-3 top-3 flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-medium shadow">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="size-3.5 accent-teal"
            />
            Select
          </label>
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            4:5 Portrait
          </span>
          {!row.isActive && (
            <span className="absolute right-3 top-3">
              <Badge tone="danger">Hidden</Badge>
            </span>
          )}
        </div>

        <div className="space-y-2.5 p-4">
          {isEditing ? (
            <>
              <Input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Alt text (required for SEO)"
                className="!py-2 !text-[13px]"
              />
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption"
                className="!py-2 !text-[13px]"
              />
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="!py-2 !text-[13px]"
                aria-label="Category"
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              
              {!alt && (
                <p className="text-[12px] font-medium text-red-600">
                  Missing alt text.
                </p>
              )}

              <div className="mt-2 flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} loading={saving}>
                  Done
                </Button>
              </div>
            </>
          ) : (
            <>
              {row.image.alt ? (
                <p className="text-[13px] font-semibold text-ink">{row.image.alt}</p>
              ) : (
                <p className="text-[13px] font-medium text-red-600">Missing alt text</p>
              )}
              {row.caption && <p className="text-[13px] text-slate">{row.caption}</p>}
              <p className="text-[12px] text-slate/70">
                {row.category ? row.category.name : "No category"}
              </p>

              <div className="flex justify-between pt-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSetEditing(true)}
                    className="text-[13px] font-medium text-teal-deep hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onPatch(row, { isActive: !row.isActive })}
                    className="text-[13px] font-medium text-teal-deep hover:underline"
                  >
                    {row.isActive ? "Hide" : "Show"}
                  </button>
                </div>
                <button
                  onClick={onDeleteReq}
                  className="text-[13px] font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </Card>
    </li>
  );
}

