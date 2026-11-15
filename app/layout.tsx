import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"UniVault QA Lab", description:"UniVault tester portal and QA report dashboard", icons: { icon: "https://raw.githubusercontent.com/drizljr144/univault-qa-testing/main/univault-logo.png" } };
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><body>{children}</body></html>;
}