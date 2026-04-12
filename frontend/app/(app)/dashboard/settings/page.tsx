import { SettingsView } from "@/components/settings-view";

export default function SettingsPage() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  return <SettingsView backendUrl={backendUrl} />;
}
