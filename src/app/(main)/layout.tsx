import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-cream-gradient">
      <Sidebar profile={profile} />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 md:px-12">
        {children}
      </main>
    </div>
  );
}
