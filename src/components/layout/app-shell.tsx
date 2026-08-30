import Link from "next/link";
import type { ReactNode } from "react";
export function AppShell({children,audience}:{children:ReactNode;audience:"citizen"|"advocate"}){
 return <div className="site-shell">
  <a className="skip-link" href="#main">Skip to main content</a>
  <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">W</span><span>Wacha <b>Legal AI</b></span></Link>
   <nav aria-label="Workspace"><Link className={audience==="citizen"?"active":""} href="/">Citizen & SME</Link><Link className={audience==="advocate"?"active":""} href="/advocate">Advocate</Link></nav>
   <Link className="text-link" href="/matters/new">My matters</Link>
  </header>
  <main id="main">{children}</main>
  <footer><strong>Wacha Legal AI</strong><span>Legal information, not a substitute for advice from an enrolled advocate.</span><span>Uganda | English</span></footer>
 </div>;
}
