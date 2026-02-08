import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch events visible to this user
  // RLS handles visibility filtering automatically
  const { data: events } = await supabase
    .from("events")
    .select("*, host:profiles!events_host_id_fkey(*)")
    .order("start_time", { ascending: false })
    .limit(50);

  // Fetch user's circles
  const { data: circles } = await supabase
    .from("circles")
    .select("*, circle_members(count)")
    .eq("owner_id", user.id);

  return (
    <HomeClient
      profile={profile!}
      events={events || []}
      circles={circles || []}
    />
  );
}
