import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import EventDetailClient from "./EventDetailClient";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const { data: event } = await supabase
    .from("events")
    .select("*, host:profiles!events_host_id_fkey(*)")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  return <EventDetailClient event={event} />;
}
