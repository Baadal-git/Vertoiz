import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WaitlistHome } from "@/components/waitlist-home";

export default async function HomePage() {
  try {
    const { userId } = await auth();
    if (userId) {
      redirect("/dashboard");
    }
  } catch {
    // Not authenticated, show waitlist
  }

  return <WaitlistHome />;
}
