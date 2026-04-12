"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, KeyRound, Loader2, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApiClient } from "@/lib/api";

function CopyButton({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!value) return;

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
      {copied ? "Copied" : label}
    </Button>
  );
}

export function SettingsView({
  backendUrl,
}: {
  backendUrl: string;
}) {
  const api = useApiClient();
  const [token, setToken] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayBackendUrl =
    backendUrl || "NEXT_PUBLIC_API_URL is not configured.";

  async function generateToken() {
    try {
      setGenerating(true);
      setError(null);

      const response = await api.createApiToken();
      setToken(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate API token.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border bg-card p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
          Extension setup
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Settings</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Use these values when the VS Code or Cursor extension asks for your
          Vertoiz API URL and auth token.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] text-[#2563EB]">
              <KeyRound className="h-5 w-5" />
            </div>
            <CardTitle>Vertoiz API Token</CardTitle>
            <CardDescription>
              Generate a long-lived token for the VS Code or Cursor extension.
              Paste the returned <span className="font-mono">vtz_</span> token
              when the extension asks for your Vertoiz auth token.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Token
              </p>
              <code className="block break-all font-mono text-sm text-white">
                {token || "Generate a token to display it here."}
              </code>
            </div>
            {error ? (
              <p className="rounded-2xl border border-border bg-background p-3 text-sm text-white">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={generating}
                onClick={() => {
                  void generateToken();
                }}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {generating ? "Generating..." : "Generate API Token"}
              </Button>
              <CopyButton value={token} label="Copy token" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] text-[#2563EB]">
              <Server className="h-5 w-5" />
            </div>
            <CardTitle>Railway Backend URL</CardTitle>
            <CardDescription>
              Configure this as the Vertoiz API URL in the extension so scans
              are sent to your Railway backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                API URL
              </p>
              <code className="block break-all font-mono text-sm text-white">
                {displayBackendUrl}
              </code>
            </div>

            {backendUrl ? (
              <Button asChild variant="outline">
                <a href={backendUrl} target="_blank" rel="noreferrer">
                  Open backend
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
