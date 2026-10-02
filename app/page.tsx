import Link from "next/link";

const steps=[
  ["1","Add a lead","Save a customer inquiry in a few seconds."],
  ["2","Follow up","See who needs a call or message today."],
  ["3","Move the lead","Update the customer from New to Won or Lost."]
];

export default function Home(){
 return <main>
  <nav className="nav"><Link className="brand" href="/">Follow<span>Flow</span></Link><div className="navlinks"><a href="#how">How it works</a><a href="#features">Features</a><Link href="/login">Log in</Link><Link className="navCta" href="/signup">Start free</Link></div></nav>
  <section className="hero simpleHero">
   <div className="eyebrow">SIMPLE CUSTOMER FOLLOW-UP</div>
   <h1>Turn missed leads into paying customers.</h1>
   <p>FollowFlow gives your business one simple place to save customer inquiries, remember follow-ups, and see which customers become sales.</p>
   <div className="actions"><Link className="button" href="/signup">Start free</Link><a className="ghost" href="#how">See how it works ↓</a></div>
   <div className="heroNote">No complicated setup. No fake messaging. Just your customer follow-up workspace.</div>
  </section>
  <section id="features" className="featureStrip">
   {["Keep every lead in one place","Know who to contact next","Track wins and lost opportunities"].map((x,i)=><article key={x}><span>0{i+1}</span><h3>{x}</h3><p>Simple tools made for busy business owners.</p></article>)}
  </section>
  <section id="how" className="section">
   <div className="sectionHead"><div className="eyebrow">HOW IT WORKS</div><h2>Three steps. That's it.</h2><p>You don't need to be technical to use FollowFlow.</p></div>
   <div className="steps">{steps.map(([n,t,d])=><article key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></article>)}</div>
  </section>
  <section className="cta"><div><div className="eyebrow">READY?</div><h2>Stop losing customers because you forgot to follow up.</h2><p>Start your workspace and manage your first leads today.</p></div><Link className="button" href="/signup">Create my workspace</Link></section>
  <footer><span>FollowFlow © 2026</span><span>Built for small and medium businesses.</span></footer>
 </main>
}