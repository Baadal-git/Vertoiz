"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, UserRound } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getDisplayNameValue(user: ReturnType<typeof useUser>["user"]) {
  const metadataName = user?.unsafeMetadata?.displayName;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName;
  }

  const combinedName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return combinedName || user?.fullName || "";
}

export function SettingsView() {
  const { isLoaded, user } = useUser();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setDisplayName(getDisplayNameValue(user));
    setEmail(user.primaryEmailAddress?.emailAddress ?? "");
  }, [user]);

  if (!isLoaded) {
    return <LoadingState label="Loading profile..." />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("Profile is unavailable.");
      return;
    }

    const nextDisplayName = displayName.trim();
    const nextEmail = email.trim().toLowerCase();
    const currentDisplayName = getDisplayNameValue(user).trim();
    const currentEmail = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? "";

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      if (nextDisplayName !== currentDisplayName) {
        const nextUnsafeMetadata = { ...user.unsafeMetadata };

        if (nextDisplayName) {
          nextUnsafeMetadata.displayName = nextDisplayName;
        } else {
          delete nextUnsafeMetadata.displayName;
        }

        await user.update({
          unsafeMetadata: nextUnsafeMetadata,
        });
      }

      if (nextEmail && nextEmail !== currentEmail) {
        const existingEmail = user.emailAddresses.find(
          (emailAddress) => emailAddress.emailAddress.toLowerCase() === nextEmail,
        );

        if (existingEmail) {
          if (existingEmail.verification.status === "verified") {
            await user.update({
              primaryEmailAddressId: existingEmail.id,
            });

            setMessage("Profile updated. Your primary email was changed.");
          } else {
            await existingEmail.prepareVerification({
              strategy: "email_link",
              redirectUrl: window.location.href,
            });

            setMessage("Verification link sent. Confirm the new email to finish the update.");
          }
        } else {
          const createdEmail = await user.createEmailAddress({ email: nextEmail });

          await createdEmail.prepareVerification({
            strategy: "email_link",
            redirectUrl: window.location.href,
          });

          setMessage("Verification link sent. Confirm the new email to finish the update.");
        }
      } else if (nextDisplayName !== currentDisplayName) {
        setMessage("Profile updated.");
      }

      await user.reload();
      setDisplayName(getDisplayNameValue(user));
      setEmail(user.primaryEmailAddress?.emailAddress ?? nextEmail);
    } catch (err) {
      const maybeError = err as {
        errors?: Array<{ longMessage?: string; message?: string }>;
        message?: string;
      };

      const clerkMessage =
        maybeError.errors?.[0]?.longMessage ??
        maybeError.errors?.[0]?.message ??
        maybeError.message ??
        "Failed to update profile.";

      setError(clerkMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border bg-card p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Workspace config</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Settings</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Manage environment details for your Vertoiz workspace. API tokens now
          live under the dedicated <span className="text-[#2563EB]">API Keys</span> page.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] text-[#2563EB]">
              <UserRound className="h-5 w-5" />
            </div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update the name and email attached to your Clerk account. Email
              changes use Clerk verification before they become primary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground" htmlFor="display-name">
                  Display name
                </label>
                <input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => {
                    setDisplayName(event.target.value);
                    setError(null);
                    setMessage(null);
                  }}
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-white outline-none transition focus:border-[rgba(37,99,235,0.6)] focus:ring-2 focus:ring-[rgba(37,99,235,0.18)]"
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError(null);
                    setMessage(null);
                  }}
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-white outline-none transition focus:border-[rgba(37,99,235,0.6)] focus:ring-2 focus:ring-[rgba(37,99,235,0.18)]"
                  placeholder="you@company.com"
                />
              </div>

              {error ? (
                <p className="rounded-2xl border border-border bg-background p-3 text-sm text-white">
                  {error}
                </p>
              ) : null}

              {message ? (
                <p className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] p-3 text-sm text-white">
                  {message}
                </p>
              ) : null}

              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token management</CardTitle>
            <CardDescription>
              Generate, copy, and rotate your extension API token from the dedicated
              API Keys page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted-foreground">
              Use API Keys when the VS Code or Cursor extension asks for a
              <span className="mx-1 font-mono text-white">vtz_</span>
              token. Regenerating the token there invalidates the previously active one.
            </p>
            <Button asChild>
              <Link href="/dashboard/api-keys">Open API Keys</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
