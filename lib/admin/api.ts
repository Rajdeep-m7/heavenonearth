"use client";

/**
 * Thin client for the API envelope. Every admin fetch goes through here so the
 * `{ok, data, meta}` / `{ok, error}` shape is unwrapped in exactly one place
 * and field errors always arrive in the same form.
 */

export type ApiFieldErrors = Record<string, string>;

export class ApiClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly fields?: ApiFieldErrors,
    readonly data?: unknown,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type Envelope<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | {
      ok: false;
      error: { code: string; message: string; fields?: ApiFieldErrors; data?: unknown };
    };

export type Result<T> = { data: T; meta?: Record<string, unknown> };

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<Result<T>> {
  const { json, ...rest } = init ?? {};

  let response: Response;
  try {
    response = await fetch(path, {
      ...rest,
      // Admin data must never be served from a stale cache.
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        ...(json !== undefined ? { "content-type": "application/json" } : {}),
        ...rest.headers,
      },
      ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
    });
  } catch {
    throw new ApiClientError(
      "NETWORK",
      "Could not reach the server. Check your connection and try again.",
    );
  }

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    // A non-JSON body means something upstream failed before our handler ran.
    throw new ApiClientError(
      "SERVER_ERROR",
      `Unexpected response from the server (${response.status}).`,
      undefined,
      undefined,
      response.status,
    );
  }

  if (!payload || payload.ok !== true) {
    const error = payload && "error" in payload ? payload.error : undefined;
    throw new ApiClientError(
      error?.code ?? "SERVER_ERROR",
      error?.message ?? "Something went wrong.",
      error?.fields,
      error?.data,
      response.status,
    );
  }

  return { data: payload.data, meta: payload.meta };
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, json?: unknown) =>
    request<T>(path, { method: "POST", json: json ?? {} }),
  patch: <T>(path: string, json: unknown) =>
    request<T>(path, { method: "PATCH", json }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Uploads a file straight to Cloudinary, with real progress. */
export function uploadToCloudinary(
  file: File,
  signature: {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
  },
  onProgress?: (percent: number) => void,
): Promise<{ publicId: string; url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signature.apiKey);
    form.append("timestamp", String(signature.timestamp));
    form.append("signature", signature.signature);
    form.append("folder", signature.folder);

    // XHR rather than fetch: fetch has no upload progress event.
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Cloudinary rejected the upload (${xhr.status}).`));
        return;
      }
      try {
        const result = JSON.parse(xhr.responseText);
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
        });
      } catch {
        reject(new Error("Cloudinary returned an unreadable response."));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(form);
  });
}
