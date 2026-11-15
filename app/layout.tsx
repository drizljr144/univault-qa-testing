import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"UniVault QA Lab", description:"UniVault tester portal and QA report dashboard" };
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><body>{children}</body></html>;
}