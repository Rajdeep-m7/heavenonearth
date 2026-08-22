"use client";

import { useState } from "react";

import { useToast } from "@/components/admin/Toast";
import {
  Badge,
  Button,
  Card,
  ChipsInput,
  ErrorState,
  Field,
  Input,
  Spinner,
  Textarea,
  Toggle,
} from "@/components/admin/ui";
import { ApiClientError, api } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type Room = {
  _id: string;
  name: string;
  description?: string;
  maxAdults: number;
  maxChildren: number;
  bedType?: string;
  pricePerNight: number;
  extraGuestCharge: number;
  totalUnits: number;
  amenities: string[];
  isActive: boolean;
};

type Draft = Omit<Room, "_id"> & { _id?: string };

const blank: Draft = {
  name: "",
  description: "",
  maxAdults: 2,
  maxChildren: 0,
  bedType: "",
  pricePerNight: 0,
  extraGuestCharge: 0,
  totalUnits: 1,
  amenities: [],
  isActive: true,
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function RoomsPanel({ stayId }: { stayId: string }) {
  const toast = useToast();
  const { data, loading, error, reload } = useResource<Room[]>(
    `/api/stays/${stayId}/rooms`,
  );

  const [draft, setDraft] = useState<Draft | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;

    setSaving(true);
    setFields({});

    const body = {
      name: draft.name,
      description: draft.description || undefined,
      maxAdults: draft.maxAdults,
      maxChildren: draft.maxChildren,
      bedType: draft.bedType || undefined,
      pricePerNight: draft.pricePerNight,
      extraGuestCharge: draft.extraGuestCharge,
      totalUnits: draft.totalUnits,
      amenities: draft.amenities,
      isActive: draft.isActive,
    };

    try {
      if (draft._id) {
        await api.patch(`/api/rooms/${draft._id}`, body);
        toast.success("Room saved.");
      } else {
        await api.post(`/api/stays/${stayId}/rooms`, body);
        toast.success("Room added.");
      }
      setDraft(null);
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFields(err.fields ?? {});
        toast.error(err.message);
      } else {
        toast.error("Could not save the room.");
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (room: Room) => {
    if (!confirm(`Delete the “${room.name}” room?`)) return;
    try {
      await api.del(`/api/rooms/${room._id}`);
      toast.success("Room deleted.");
      await reload();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete.",
      );
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Rooms</h2>
          <p className="mt-0.5 text-[13px] text-slate">
            The cheapest active room sets the &ldquo;from&rdquo; price on the
            listing.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setDraft({ ...blank });
            setFields({});
          }}
        >
          Add room
        </Button>
      </div>

      {draft && (
        <form
          onSubmit={save}
          className="mt-5 space-y-5 rounded-xl border border-black/10 bg-black/[0.015] p-5"
        >
          <p className="font-semibold text-ink">
            {draft._id ? "Edit room" : "New room"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room name" error={fields.name} required>
              {(id) => (
                <Input
                  id={id}
                  required
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="The Valley View Suite"
                />
              )}
            </Field>
            <Field label="Bed type">
              {(id) => (
                <Input
                  id={id}
                  value={draft.bedType ?? ""}
                  onChange={(e) => set("bedType", e.target.value)}
                  placeholder="1 King"
                />
              )}
            </Field>
          </div>

          <Field label="Description">
            {(id) => (
              <Textarea
                id={id}
                rows={2}
                value={draft.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price / night (₹)" error={fields.pricePerNight} required>
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  min={0}
                  required
                  value={draft.pricePerNight}
                  onChange={(e) => set("pricePerNight", Number(e.target.value))}
                />
              )}
            </Field>
            <Field
              label="Units available"
              error={fields.totalUnits}
              hint="How many of this room exist."
              required
            >
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  min={1}
                  required
                  value={draft.totalUnits}
                  onChange={(e) => set("totalUnits", Number(e.target.value))}
                />
              )}
            </Field>
            <Field label="Extra guest charge (₹)">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  min={0}
                  value={draft.extraGuestCharge}
                  onChange={(e) => set("extraGuestCharge", Number(e.target.value))}
                />
              )}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Max adults" required>
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  min={1}
                  required
                  value={draft.maxAdults}
                  onChange={(e) => set("maxAdults", Number(e.target.value))}
                />
              )}
            </Field>
            <Field label="Max children">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  min={0}
                  value={draft.maxChildren}
                  onChange={(e) => set("maxChildren", Number(e.target.value))}
                />
              )}
            </Field>
          </div>

          <Field label="Room amenities">
            {(id) => (
              <ChipsInput
                id={id}
                value={draft.amenities}
                onChange={(v) => set("amenities", v)}
                placeholder="En-suite, Balcony, Mountain view"
              />
            )}
          </Field>

          <Toggle
            checked={draft.isActive}
            onChange={(v) => set("isActive", v)}
            label="Bookable"
          />

          <div className="flex gap-3">
            <Button type="submit" size="sm" loading={saving}>
              {draft._id ? "Save room" : "Add room"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDraft(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading && <Spinner label="Loading rooms" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && !draft && (
        <p className="mt-5 rounded-xl border border-dashed border-black/15 px-4 py-8 text-center text-[14px] text-slate">
          No rooms yet. A stay with no rooms cannot be booked.
        </p>
      )}

      {data && data.length > 0 && (
        <ul className="mt-5 divide-y divide-black/8">
          {data.map((room) => (
            <li key={room._id} className="flex flex-col gap-3 py-4 sm:flex-row">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{room.name}</p>
                  {!room.isActive && <Badge tone="danger">Not bookable</Badge>}
                </div>
                <p className="mt-1 text-[13px] text-slate">
                  <span className="font-semibold text-teal">
                    {inr.format(room.pricePerNight)}
                  </span>{" "}
                  / night &middot; sleeps {room.maxAdults}
                  {room.maxChildren > 0 && ` + ${room.maxChildren}`} &middot;{" "}
                  {room.totalUnits} unit{room.totalUnits === 1 ? "" : "s"}
                  {room.bedType && ` · ${room.bedType}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDraft({ ...room });
                    setFields({});
                  }}
                >
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(room)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
