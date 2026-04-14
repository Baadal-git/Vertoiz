"use client";

import { useEffect, useState } from "react";
import { Check, Copy, KeyRound, Loader2, RefreshCw } from "lucide-react";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError, useApiClient } from "@/lib/api";
import { formatDateTime } from "@/lib/dashboard";

function CopyButton({
  value,
}: {
  value: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={!value}
      onClick={() => {
        void copy();
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy token"}
    </Button>
  );
}

export function ApiKeysView() {
  const api = useApiClient();
  const [token, setToken] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadToken() {
    try {
      setLoading(true);
      setError(null);

      let response;

      try {
        response = await api.getApiToken();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          response = await api.createApiToken();
        } else {
          throw err;
        }
      }

      setToken(response.token);
      setCreatedAt(response.createdAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API token.");
    } finally {
      setLoading(false);
    }
  }

  async function regenerateToken() {
    try {
      setRegenerating(true);
      setError(null);

      const response = await api.createApiToken();
      setToken(response.token);
      setCreatedAt(response.createdAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate API token.");
    } finally {
      setRegenerating(false);
    }
  }

  useEffect(() => {
    void loadToken();
  }, []);

  if (loading) {
    return <LoadingState label="Loading API key..." />;
  }

  if (error && !token) {
    return (
      <ErrorState
        title="API key failed to load"
        description={error}
        onRetry={() => {
          void loadToken();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border bg-card p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
          Extension access
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">API Keys</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Use your Vertoiz <span className="font-mono text-white">vtz_</span> token
          in the VS Code or Cursor extension. Regenerating replaces the currently active
          token and invalidates the previous one.
        </p>
      </section>

      <Card>
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] text-[#2563EB]">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle>Current API Token</CardTitle>
          <CardDescription>
            Keep this token private. The extension sends it as a bearer token when
            it connects to your Vertoiz backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Token
            </p>
            <code className="block break-all font-mono text-sm text-white">
              {token ?? "No token generated yet."}
            </code>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Last generated
            </p>
            <p className="text-sm text-white">
              {createdAt ? formatDateTime(createdAt) : "Generate a token to activate extension access."}
            </p>
          </div>

          {error ? (
            <p className="rounded-2xl border border-border bg-background p-3 text-sm text-white">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <CopyButton value={token} />
            <Button
              type="button"
              disabled={regenerating}
              onClick={() => {
                void regenerateToken();
              }}
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {regenerating ? "Regenerating..." : token ? "Regenerate token" : "Generate token"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
