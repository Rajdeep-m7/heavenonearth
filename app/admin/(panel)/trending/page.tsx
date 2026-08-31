"use client";

import { useState } from "react";
import { useResource } from "@/lib/admin/useResource";
import { api } from "@/lib/admin/api";
import { useToast } from "@/components/admin/Toast";
import { Button, Card, EmptyState, ErrorState, Input, PageHeader, Select, Spinner, Badge } from "@/components/admin/ui";
import { ImageUploader, previewSrc, type AdminImage } from "@/components/admin/ImageUploader";

type TrendingRow = {
  _id: string;
  tab: "international" | "india";
  name: string;
  slug: string;
  style: "caps" | "italic" | "title";
  image: AdminImage;
  order: number;
  isActive: boolean;
};

export default function TrendingPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useResource<TrendingRow[]>("/api/trending");
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trending destination?")) return;
    try {
      await api.del(`/api/trending/${id}`);
      toast.success("Deleted");
      await reload();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trending Destinations"
        description="Manage the destinations that appear in the trending tabs on the home page."
        action={
          <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
            Add Destination
          </Button>
        }
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {isCreating && (
        <TrendingEditor
          onCancel={() => setIsCreating(false)}
          onSave={async (body) => {
            try {
              await api.post("/api/trending", body);
              toast.success("Created successfully");
              setIsCreating(false);
              await reload();
            } catch {
              toast.error("Failed to create");
            }
          }}
        />
      )}

      {data && data.length === 0 && !isCreating && (
        <EmptyState title="No trending destinations" description="Add one to display on the home page." action={<Button onClick={() => setIsCreating(true)}>Add Destination</Button>} />
      )}

      {data && data.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((row) => (
            <TrendingEditor
              key={row._id}
              initialData={row}
              onSave={async (body) => {
                try {
                  await api.patch(`/api/trending/${row._id}`, body);
                  toast.success("Updated successfully");
                  await reload();
                } catch {
                  toast.error("Failed to update");
                }
              }}
              onDelete={() => handleDelete(row._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendingEditor({
  initialData,
  onSave,
  onCancel,
  onDelete,
}: {
  initialData?: TrendingRow;
  onSave: (data: any) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => void;
}) {
  const [tab, setTab] = useState<"international" | "india">(initialData?.tab ?? "international");
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [style, setStyle] = useState<"caps" | "italic" | "title">(initialData?.style ?? "title");
  const [image, setImage] = useState<AdminImage | null>(initialData?.image ?? null);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [order, setOrder] = useState(initialData?.order ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !slug || !image) return alert("Name, slug, and image are required");
    setSaving(true);
    await onSave({ tab, name, slug, style, image, isActive, order });
    setSaving(false);
  };

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Badge tone={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Hidden"}</Badge>
        {initialData && (
           <button onClick={() => setIsActive(!isActive)} className="text-[12px] font-medium text-teal-deep hover:underline">
             {isActive ? "Hide" : "Show"}
           </button>
        )}
      </div>

      <ImageUploader folder="trending" value={image} onChange={setImage} requireAlt />

      <Select value={tab} onChange={(e) => setTab(e.target.value as any)}>
        <option value="international">International</option>
        <option value="india">India & Around</option>
      </Select>

      <Input placeholder="Name (e.g. Europe)" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Slug (e.g. europe)" value={slug} onChange={(e) => setSlug(e.target.value)} />

      <Select value={style} onChange={(e) => setStyle(e.target.value as any)}>
        <option value="title">Title Case</option>
        <option value="caps">UPPERCASE</option>
        <option value="italic">Italic</option>
      </Select>

      <Input type="number" placeholder="Order" value={order} onChange={(e) => setOrder(Number(e.target.value))} />

      <div className="flex justify-between mt-2">
        {onDelete ? (
          <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        )}
        <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
      </div>
    </Card>
  );
}
