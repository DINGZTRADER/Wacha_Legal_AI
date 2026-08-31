import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
export function AppShell({children,audience}:{children:ReactNode;audience:"citizen"|"advocate"}){
 return <div className="site-shell">
  <a className="skip-link" href="#main">Skip to main content</a>
  <header className="topbar"><Link className="brand" href="/" aria-label="Wacha Legal AI home"><Image src="/wachaai-logo.png" alt="WachaAI" width={176} height={79} priority unoptimized/><span className="brand-product"><b>Legal</b><small>Uganda</small></span></Link>
   <nav aria-label="Workspace"><Link className={audience==="citizen"?"active":""} href="/">Citizen & SME</Link><Link className={audience==="advocate"?"active":""} href="/advocate">Advocate</Link></nav>
   <Link className="text-link" href="/matters/new">My matters</Link>
  </header>
  <main id="main">{children}</main>
  <footer><strong>Wacha Legal AI</strong><span>Legal information, not a substitute for advice from an enrolled advocate.</span><span>Uganda | English</span></footer>
 </div>;
}
