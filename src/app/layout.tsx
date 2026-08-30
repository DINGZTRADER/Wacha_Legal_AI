import type { Metadata } from "next";
import "./globals.css";
import "./styles-extra.css";
export const metadata:Metadata={title:"Wacha Legal AI | Uganda",description:"Guided Ugandan legal information, documents and advocate referrals."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
