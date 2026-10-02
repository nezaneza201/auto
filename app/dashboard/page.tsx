import Link from "next/link";
import {createClient} from "@/lib/supabase/server";

export default async function Dashboard(){
 const s=await createClient();const{data:{user}}=await s.auth.getUser();
 const{data:b}=await s.from("businesses").select("id,name").eq("owner_id",user?.id).single();
 const{data:leads}=b?await s.from("leads").select("id,name,phone,status,next_follow_up,created_at,estimated_value").eq("business_id",b.id).order("created_at",{ascending:false}).limit(8):{data:[]};
 const all=leads||[];const today=new Date();today.setHours(23,59,59,999);
 const due=all.filter(x=>x.next_follow_up&&new Date(x.next_follow_up)<=today&& !["won","lost"].includes(x.status)).length;
 const won=all.filter(x=>x.status==="won").length;const active=all.filter(x=>!["won","lost"].includes(x.status)).length;
 return <><div className="pageIntro"><div><div className="eyebrow">OVERVIEW</div><h1>Good to see you 👋</h1><p>{b?.name||"Your business"} at a glance.</p></div><Link className="btn primary" href="/dashboard/leads?new=1">+ Add lead</Link></div>
 <section className="stats"><div><span>Total leads</span><strong>{all.length}</strong><small>Recent leads shown below</small></div><div><span>Active</span><strong>{active}</strong><small>Customers still in progress</small></div><div><span>Follow-ups due</span><strong>{due}</strong><small>People to contact</small></div><div><span>Won</span><strong>{won}</strong><small>Converted customers</small></div></section>
 <section className="card"><div className="cardHead"><div><h2>Recent leads</h2><p>Your newest customer opportunities.</p></div><Link className="textLink" href="/dashboard/leads">View all →</Link></div>{all.length===0?<div className="empty"><div className="emptyIcon">＋</div><h3>Your first lead is waiting.</h3><p>Add a customer inquiry and FollowFlow will help you keep track of it.</p><Link className="btn primary" href="/dashboard/leads?new=1">Add your first lead</Link></div>:<div className="leadCards">{all.map(l=><Link className="leadCard" href={"/dashboard/leads/"+l.id} key={l.id}><div><strong>{l.name}</strong><span>{l.phone}</span></div><div className="leadMeta"><span className={"status "+l.status}>{l.status.replace("-"," ")}</span>{l.next_follow_up&&<small>Next: {new Date(l.next_follow_up).toLocaleDateString()}</small>}</div></Link>)}</div>}</section></>
}