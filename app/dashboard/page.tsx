import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const metadata = user.user_metadata ?? {};
  const name = metadata.full_name ?? "";
  const businessName = metadata.business_name ?? "Your workspace";

  await supabase.from("users").upsert({
    id: user.id,
    name,
    business_name: businessName,
    email: user.email ?? "",
  });

  const { data: leads } = await supabase
    .from("leads")
    .select("id,name,status,next_follow_up,source")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = leads ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const due = rows.filter(
    (x) => x.next_follow_up && x.next_follow_up <= today && !["won", "lost"].includes(x.status)
  ).length;
  const active = rows.filter((x) => !["won", "lost"].includes(x.status)).length;
  const won = rows.filter((x) => x.status === "won").length;

  return (
    <>
      <div className="top">
        <div>
          <p className="muted no-margin">Today</p>
          <h1 className="title">{businessName}</h1>
        </div>
        <Link href="/dashboard/leads?new=1" className="btn">+ Add lead</Link>
      </div>

      <div className="stats">
        <div className="card stat"><span className="muted">Total leads</span><strong>{rows.length}</strong></div>
        <div className="card stat"><span className="muted">Active</span><strong>{active}</strong></div>
        <div className="card stat"><span className="muted">Follow-ups due</span><strong>{due}</strong></div>
        <div className="card stat"><span className="muted">Won</span><strong>{won}</strong></div>
      </div>

      <div className="panel">
        <div className="panelhead">
          <strong>Recent leads</strong>
          <Link href="/dashboard/leads" className="back">View all →</Link>
        </div>

        {rows.length === 0 ? (
          <div className="empty">
            <h3>No leads yet</h3>
            <p>Add your first customer inquiry and start following up.</p>
            <Link href="/dashboard/leads?new=1" className="btn">Add your first lead</Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Customer</th><th>Source</th><th>Status</th><th>Follow-up</th></tr>
            </thead>
            <tbody>
              {rows.slice(0, 8).map((x) => (
                <tr key={x.id}>
                  <td>{x.name}</td>
                  <td>{x.source}</td>
                  <td><span className="pill">{x.status}</span></td>
                  <td>{x.next_follow_up || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}