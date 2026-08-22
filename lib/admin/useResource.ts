"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiClientError, api } from "@/lib/admin/api";

type State<T> = {
  data: T | null;
  meta: Record<string, unknown> | undefined;
  loading: boolean;
  error: string | null;
};

/**
 * Small fetch-with-state hook. Deliberately not SWR — the admin has a handful
 * of screens and adding a cache layer would cost more than it saves here.
 */
export function useResource<T>(path: string | null) {
  const [state, setState] = useState<State<T>>({
    data: null,
    meta: undefined,
    loading: Boolean(path),
    error: null,
  });

  const load = useCallback(async () => {
    if (!path) {
      setState({ data: null, meta: undefined, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await api.get<T>(path);
      setState({ data: result.data, meta: result.meta, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        meta: undefined,
        loading: false,
        error:
          error instanceof ApiClientError
            ? error.message
            : "Could not load this data.",
      });
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load, setData: (data: T) => setState((s) => ({ ...s, data })) };
}
