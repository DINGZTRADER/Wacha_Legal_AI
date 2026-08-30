import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getDepartment } from "@/features/departments/registry";
export default async function DepartmentPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const d=getDepartment(id);if(!d)notFound();return <AppShell audience="citizen"><section className="detail"><Link href="/">Back to all departments</Link><p className="eyebrow">Guided legal pathway</p><h1>{d.title}</h1><p className="lead">{d.description}</p><div className="notice"><strong>Before you continue</strong><p>Wacha will confirm the parties, important dates, documents you have, urgency, and risks. Information is not a substitute for advice from an enrolled advocate.</p></div><Link className="button" href="/matters/new">Start a guided matter</Link></section></AppShell>}
