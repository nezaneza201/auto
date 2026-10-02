"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {account} from "@/lib/appwrite/client";
import {useRouter} from "next/navigation";
export default function Layout({children}:{children:React.ReactNode}){const router=useRouter();const [email,setEmail]=useState("");useEffect(()=>{account.get().then(u=>setEmail(u.email)).catch(()=>router.replace("/login"))},[router]);async function logout(){await account.deleteSession("current").catch(()=>{});router.replace("/login")}return <div className="dash"><aside className="side"><Link href="/" className="brand">Follow<span>Flow</span></Link><p className="muted small">{email}</p><nav><Link href="/dashboard">🏠 Today</Link><Link href="/dashboard/leads">👥 Leads</Link></nav><div className="logout"><button className="btn secondary full" onClick={logout}>Log out</button></div></aside><main className="main">{children}</main></div>}