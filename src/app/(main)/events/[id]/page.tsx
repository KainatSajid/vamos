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
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  const { data: host } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", event.host_id)
    .single();

  return <EventDetailClient event={{ ...event, host }} />;
}