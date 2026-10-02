"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {useRouter} from "next/navigation";

export default function Login(){
 const r=useRouter();const[loading,setLoading]=useState(false);const[error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError("");const f=new FormData(e.currentTarget);const s=createClient();const{error}=await s.auth.signInWithPassword({email:String(f.get("email")),password:String(f.get("password"))});if(error)setError("Email or password is incorrect.");else r.push("/dashboard");setLoading(false)}
 return <main className="authPage"><div className="authCard"><Link className="brand" href="/">Follow<span>Flow</span></Link><div className="authIntro"><h1>Welcome back 👋</h1><p>Log in to manage your customers and follow-ups.</p></div>{error&&<div className="error">{error}</div>}<form className="form" onSubmit={submit}><div className="field"><label>Email</label><input name="email" type="email" placeholder="you@business.com" required/></div><div className="field"><label>Password</label><input name="password" type="password" placeholder="Your password" required/></div><button className="btn primary" disabled={loading}>{loading?"Logging in…":"Log in"}</button></form><Link className="textLink" href="/forgot-password">Forgot your password?</Link><p className="authBottom">New to FollowFlow? <Link href="/signup">Create a free account</Link></p></div></main>
}