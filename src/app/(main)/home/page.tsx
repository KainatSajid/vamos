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
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .order("start_time", { ascending: false })
    .limit(50);

  console.log("EVENTS:", events?.length, "ERROR:", eventsError);
  console.log("USER:", user.id, user.email);
  // Fetch host profiles separately
  const hostIds = [...new Set((events || []).map((e: any) => e.host_id))];
  const { data: hostProfiles } = hostIds.length > 0
    ? await supabase.from("profiles").select("*").in("id", hostIds)
    : { data: [] };

  const hostMap = new Map((hostProfiles || []).map((p: any) => [p.id, p]));
  const eventsWithHosts = (events || []).map((e: any) => ({
    ...e,
    host: hostMap.get(e.host_id) || null,
  }));

  const { data: circles } = await supabase
    .from("circles")
    .select("*, circle_members(count)")
    .eq("owner_id", user.id);

  const circlesWithCount = (circles || []).map((c: any) => ({
    ...c,
    member_count: c.circle_members?.[0]?.count || 0,
  }));

  return (
    <>
      <HomeClient
        profile={profile!}
        events={eventsWithHosts}
        circles={circlesWithCount}
      />
      {/* <pre className="text-xs text-red-500 p-4 fixed bottom-0 left-0 bg-white z-50">
        {JSON.stringify({ eventsError, eventCount: events?.length, userId: user.id }, null, 2)}
      </pre> */}
    </>
  );
}