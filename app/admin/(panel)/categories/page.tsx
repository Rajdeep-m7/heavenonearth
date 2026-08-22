"use client";

import { useState } from "react";

import { ImageUploader, previewSrc, type AdminImage } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  PageHeader,
  Spinner,
  Textarea,
  Toggle,
} from "@/components/admin/ui";
import { ApiClientError, api } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type Category = {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  thumbnail?: AdminImage;
  order: number;
  isActive: boolean;
  packageCount: number;
};

type Draft = {
  name: string;
  tagline: string;
  description: string;
  thumbnail: AdminImage | null;
  order: number;
  isActive: boolean;
};

const emptyDraft: Draft = {
  name: "",
  tagline: "",
  description: "",
  thumbnail: null,
  order: 0,
  isActive: true,
};

export default function CategoriesPage() {
  const toast = useToast();
  const { data, loading, error, reload } =
    useResource<Category[]>("/api/admin/categories");

  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setDraft(emptyDraft);
    setFields({});
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (category: Category) => {
    setDraft({
      name: category.name,
      tagline: category.tagline ?? "",
      description: category.description ?? "",
      thumbnail: category.thumbnail ?? null,
      order: category.order,
      isActive: category.isActive,
    });
    setFields({});
    setCreating(false);
    setEditing(category);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (draft.thumbnail && !draft.thumbnail.alt.trim()) {
      toast.error("Add alt text to the thumbnail before saving.");
      return;
    }

    setSaving(true);
    setFields({});

    const body = {
      name: draft.name,
      tagline: draft.tagline || undefined,
      description: draft.description || undefined,
      thumbnail: draft.thumbnail ?? undefined,
      order: draft.order,
      isActive: draft.isActive,
    };

    try {
      if (editing) {
        await api.patch(`/api/categories/${editing._id}`, body);
        toast.success(`Saved “${draft.name}”.`);
      } else {
        await api.post("/api/categories", body);
        toast.success(`Created “${draft.name}”.`);
      }
      close();
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFields(err.fields ?? {});
        toast.error(err.message);
      } else {
        toast.error("Could not save. Try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: Category) => {
    if (
      !confirm(
        `Delete “${category.name}”? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await api.del(`/api/categories/${category._id}`);
      toast.success(`Deleted “${category.name}”.`);
      await reload();
    } catch (err) {
      // The API blocks deletion while packages still reference it — surface
      // that specific reason rather than a generic failure.
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete.",
      );
    }
  };

  const showForm = creating || editing !== null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Master packages"
        description="The top-level groupings — Hill, Sea, Forest — that every package and stay belongs to."
        action={<Button onClick={openCreate}>New master package</Button>}
      />

      {showForm && (
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold text-ink">
            {editing ? `Edit ${editing.name}` : "New master package"}
          </h2>

          <form onSubmit={save} className="mt-5 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" error={fields.name} required>
                {(id) => (
                  <Input
                    id={id}
                    required
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Hill"
                  />
                )}
              </Field>

              <Field
                label="Sort order"
                error={fields.order}
                hint="Lower numbers appear first."
              >
                {(id) => (
                  <Input
                    id={id}
                    type="number"
                    value={draft.order}
                    onChange={(e) =>
                      setDraft({ ...draft, order: Number(e.target.value) })
                    }
                  />
                )}
              </Field>
            </div>

            <Field
              label="Tagline"
              error={fields.tagline}
              hint="One line, shown on the card."
            >
              {(id) => (
                <Input
                  id={id}
                  value={draft.tagline}
                  onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                  placeholder="Tea slopes, ridge towns and sunrise over Kanchenjunga."
                />
              )}
            </Field>

            <Field label="Description" error={fields.description}>
              {(id) => (
                <Textarea
                  id={id}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  placeholder="Longer copy for the category page."
                />
              )}
            </Field>

            <ImageUploader
              folder="categories"
              label="Card thumbnail"
              value={draft.thumbnail}
              onChange={(thumbnail) => setDraft({ ...draft, thumbnail })}
            />

            <Toggle
              checked={draft.isActive}
              onChange={(isActive) => setDraft({ ...draft, isActive })}
              label="Visible on the site"
              description="Turn off to hide it without deleting anything."
            />

            <div className="flex gap-3 border-t border-black/8 pt-5">
              <Button type="submit" loading={saving}>
                {editing ? "Save changes" : "Create"}
              </Button>
              <Button type="button" variant="ghost" onClick={close}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && !showForm && (
        <EmptyState
          title="No master packages yet"
          description="Create Hill, Sea and Forest to start grouping your packages and stays."
          action={<Button onClick={openCreate}>New master package</Button>}
        />
      )}

      {data && data.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-black/8">
            {data.map((category) => (
              <li
                key={category._id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-black/[0.04]">
                  {category.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSrc(category.thumbnail, 200)}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-slate">No image</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-display text-lg font-semibold text-ink">
                      {category.name}
                    </p>
                    {!category.isActive && <Badge tone="danger">Hidden</Badge>}
                    <Badge tone="info">
                      {category.packageCount} package
                      {category.packageCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[13px] text-slate">/{category.slug}</p>
                  {category.tagline && (
                    <p className="mt-1 line-clamp-1 text-[14px] text-slate">
                      {category.tagline}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(category)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
