"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  status: string;
  estimated_value: number | null;
  next_follow_up: string | null;
  notes: string | null;
};

const statuses = ["new", "contacted", "interested", "follow-up", "won", "lost"];
const sources = ["WhatsApp", "Instagram", "Facebook", "Phone", "Website", "Walk-in", "Referral", "Other"];

export default function Leads() {
  const supabase = createClient();
  const params = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(params.get("new") === "1");
  const [editing, setEditing] = useState<Lead | null>(null);
  const blank = { name: "", phone: "", email: "", source: "WhatsApp", status: "new", estimated_value: "", next_follow_up: "", notes: "" };
  const [form, setForm] = useState<any>(blank);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setLeads(data || []);
  }

  useEffect(() => { load(); }, []);

  function start(x?: Lead) {
    setEditing(x || null);
    setForm(x ? {
      ...x,
      estimated_value: x.estimated_value ?? "",
      next_follow_up: x.next_follow_up ?? "",
      phone: x.phone ?? "",
      email: x.email ?? "",
      notes: x.notes ?? ""
    } : blank);
    setOpen(true);
  }

  async function save(e: any) {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      source: form.source,
      status: form.status,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      next_follow_up: form.next_follow_up || null,
      notes: form.notes || null
    };

    const result = editing
      ? await supabase.from("leads").update(payload).eq("id", editing.id).eq("user_id", user.id)
      : await supabase.from("leads").insert(payload);

    if (result.error) {
      alert(result.error.message);
      return;
    }

    setOpen(false);
    setEditing(null);
    setForm(blank);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this lead?")) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("leads").delete().eq("id", id).eq("user_id", user.id);
    if (error) alert(error.message);
    else load();
  }

  const filtered = leads.filter(
    (x) =>
      x.name.toLowerCase().includes(q.toLowerCase()) ||
      (x.phone || "").includes(q) ||
      (x.email || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="top">
        <div>
          <h1 className="title">Leads</h1>
          <p className="muted no-margin">Every customer inquiry in one place.</p>
        </div>
        <button className="btn" onClick={() => start()}>+ Add lead</button>
      </div>

      <div className="panel">
        <div className="panelhead">
          <input placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)} className="search" />
          <span className="muted">{filtered.length} leads</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <h3>No leads found</h3>
            <p>Add a lead or change your search.</p>
          </div>
        ) : (
          <div className="scroll">
            <table className="table">
              <thead><tr><th>Customer</th><th>Source</th><th>Status</th><th>Follow-up</th><th></th></tr></thead>
              <tbody>
                {filtered.map((x) => (
                  <tr key={x.id}>
                    <td><strong>{x.name}</strong><br /><span className="muted">{x.phone || x.email || ""}</span></td>
                    <td>{x.source}</td>
                    <td><span className="pill">{x.status}</span></td>
                    <td>{x.next_follow_up || "—"}</td>
                    <td>
                      <button className="btn secondary" onClick={() => start(x)}>Edit</button>{" "}
                      <button className="btn secondary" onClick={() => remove(x.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="modal">
          <div className="authbox modalbox">
            <div className="top">
              <h2>{editing ? "Edit lead" : "Add a lead"}</h2>
              <button className="btn secondary" onClick={() => setOpen(false)}>Close</button>
            </div>

            <form className="form" onSubmit={save}>
              <label>Customer name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>

              <div className="grid2">
                <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              </div>

              <div className="grid2">
                <label>Source<select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>{sources.map((x) => <option key={x}>{x}</option>)}</select></label>
                <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((x) => <option key={x} value={x}>{x.replace("-", " ")}</option>)}</select></label>
              </div>

              <div className="grid2">
                <label>Estimated value (RWF)<input type="number" min="0" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} /></label>
                <label>Next follow-up<input type="date" value={form.next_follow_up} onChange={(e) => setForm({ ...form, next_follow_up: e.target.value })} /></label>
              </div>

              <label>Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
              <button className="btn">{editing ? "Save changes" : "Add lead"}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}