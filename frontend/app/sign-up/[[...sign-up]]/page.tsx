import { BrandLogo } from "@/components/brand-logo";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="absolute inset-0 grid-surface opacity-25" />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/60">
        <div className="mb-6">
          <BrandLogo size={32} className="mb-6" />
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Start scanning your codebase.
          </h1>
        </div>
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#2563EB",
              colorBackground: "#111111",
              colorInputBackground: "#0a0a0a",
              colorInputText: "#ffffff",
              colorText: "#ffffff",
              colorTextSecondary: "#888888",
              colorDanger: "#2563EB",
              colorNeutral: "#222222",
            },
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none",
              formButtonPrimary: "bg-[#2563EB] text-white hover:bg-[#1d4ed8]",
              formFieldInput: "border border-[#222222] bg-[#0a0a0a] text-white",
              formFieldLabel: "text-white",
              footerActionLink: "text-[#2563EB] hover:text-[#1d4ed8]",
              socialButtonsBlockButton: "border border-[#222222] bg-[#111111] text-white hover:border-[rgba(37,99,235,0.2)] hover:bg-[rgba(37,99,235,0.1)]",
              dividerLine: "bg-[#222222]",
              dividerText: "text-[#888888]",
            },
          }}
        />
      </div>
    </main>
  );
}
