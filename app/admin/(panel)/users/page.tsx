"use client";

import { useState } from "react";

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
  Select,
  Spinner,
  Toggle,
} from "@/components/admin/ui";
import { ApiClientError, api } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type AdminUser = {
  _id: string;
  email: string;
  name: string;
  role: "owner" | "editor";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

type Draft = {
  email: string;
  password: string;
  name: string;
  role: "owner" | "editor";
};

const emptyDraft: Draft = { email: "", password: "", name: "", role: "editor" };

const lastSeen = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "Never signed in";

export default function AdminUsersPage() {
  const toast = useToast();

  // Whoever is looking at this page - used to grey out "act on yourself"
  // controls. The server enforces the same rule regardless, but the UI
  // should not invite a click it is only going to reject.
  const { data: me } = useResource<{ id: string }>("/api/admin/auth/me");
  const { data, loading, error, reload } = useResource<AdminUser[]>("/api/admin/users");

  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"owner" | "editor">("editor");
  const [editActive, setEditActive] = useState(true);
  const [editPassword, setEditPassword] = useState("");

  const startCreate = () => {
    setDraft(emptyDraft);
    setFields({});
    setEditingId(null);
    setCreating(true);
  };

  const startEdit = (user: AdminUser) => {
    setEditingId(user._id);
    setEditName(user.name);
    setEditRole(user.role);
    setEditActive(user.isActive);
    setEditPassword("");
    setFields({});
    setCreating(false);
  };

  const closeForms = () => {
    setCreating(false);
    setEditingId(null);
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFields({});
    try {
      await api.post("/api/admin/users", draft);
      toast.success(`Added ${draft.email}.`);
      closeForms();
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFields(err.fields ?? {});
        toast.error(err.message);
      } else {
        toast.error("Could not create the admin.");
      }
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (event: React.FormEvent, user: AdminUser) => {
    event.preventDefault();
    setSaving(true);
    setFields({});
    try {
      await api.patch(`/api/admin/users/${user._id}`, {
        name: editName,
        role: editRole,
        isActive: editActive,
        ...(editPassword ? { password: editPassword } : {}),
      });
      toast.success(`Saved ${user.email}.`);
      closeForms();
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFields(err.fields ?? {});
        toast.error(err.message);
      } else {
        toast.error("Could not save.");
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (user: AdminUser) => {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    try {
      await api.del(`/api/admin/users/${user._id}`);
      toast.success(`Deleted ${user.email}.`);
      await reload();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Could not delete.");
    }
  };

  const isSelf = (user: AdminUser) => me?.id === user._id;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin users"
        description="Everyone with access to this panel. Owners can manage other admins; editors cannot."
        action={<Button onClick={startCreate}>New admin</Button>}
      />

      {creating && (
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold text-ink">New admin</h2>

          <form onSubmit={create} className="mt-5 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" error={fields.email} required>
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    required
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    placeholder="teammate@example.com"
                  />
                )}
              </Field>
              <Field label="Full name" error={fields.name} required>
                {(id) => (
                  <Input
                    id={id}
                    required
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Priya Sharma"
                  />
                )}
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Temporary password"
                error={fields.password}
                hint="12+ characters. Share it securely - they should change it after first login."
                required
              >
                {(id) => (
                  <Input
                    id={id}
                    type="text"
                    required
                    value={draft.password}
                    onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                    placeholder="a long random passphrase"
                  />
                )}
              </Field>
              <Field label="Role" error={fields.role} required>
                {(id) => (
                  <Select
                    id={id}
                    value={draft.role}
                    onChange={(e) =>
                      setDraft({ ...draft, role: e.target.value as Draft["role"] })
                    }
                  >
                    <option value="editor">Editor - everyday content work</option>
                    <option value="owner">Owner - can also manage admins</option>
                  </Select>
                )}
              </Field>
            </div>

            <div className="flex gap-3 border-t border-black/8 pt-5">
              <Button type="submit" loading={saving}>
                Create admin
              </Button>
              <Button type="button" variant="ghost" onClick={closeForms}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && !creating && (
        <EmptyState
          title="No admins yet"
          description="That should not be possible if you are looking at this page - but you can add one here."
          action={<Button onClick={startCreate}>New admin</Button>}
        />
      )}

      {data && data.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-black/8">
            {data.map((user) => (
              <li key={user._id} className="p-5">
                {editingId === user._id ? (
                  <form onSubmit={(e) => saveEdit(e, user)} className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="font-semibold text-ink">{user.email}</p>
                      {isSelf(user) && <Badge tone="info">You</Badge>}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Full name" error={fields.name} required>
                        {(id) => (
                          <Input
                            id={id}
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        )}
                      </Field>
                      <Field
                        label="New password"
                        error={fields.password}
                        hint="Leave blank to keep the current password."
                      >
                        {(id) => (
                          <Input
                            id={id}
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Leave blank to keep unchanged"
                          />
                        )}
                      </Field>
                    </div>

                    <Field
                      label="Role"
                      error={fields.role}
                      hint={
                        isSelf(user)
                          ? "You cannot change your own role - ask another owner."
                          : undefined
                      }
                    >
                      {(id) => (
                        <Select
                          id={id}
                          value={editRole}
                          disabled={isSelf(user)}
                          onChange={(e) => setEditRole(e.target.value as "owner" | "editor")}
                        >
                          <option value="editor">Editor</option>
                          <option value="owner">Owner</option>
                        </Select>
                      )}
                    </Field>

                    <Toggle
                      checked={editActive}
                      onChange={setEditActive}
                      label="Active"
                      description={
                        isSelf(user)
                          ? "You cannot deactivate your own account."
                          : "Turn off to block sign-in without deleting the account."
                      }
                    />

                    <div className="flex gap-3 border-t border-black/8 pt-5">
                      <Button type="submit" loading={saving}>
                        Save changes
                      </Button>
                      <Button type="button" variant="ghost" onClick={closeForms}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-semibold text-ink">{user.name}</p>
                        <Badge tone={user.role === "owner" ? "warning" : "neutral"}>
                          {user.role}
                        </Badge>
                        {!user.isActive && <Badge tone="danger">Deactivated</Badge>}
                        {isSelf(user) && <Badge tone="info">You</Badge>}
                      </div>
                      <p className="mt-0.5 text-[13px] text-slate">{user.email}</p>
                      <p className="mt-1 text-[12px] text-slate">
                        Last sign-in: {lastSeen(user.lastLoginAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(user)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf(user)}
                        onClick={() => remove(user)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
