import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'VIV Portfolio | Statement Explorer',description:'A clear view of assets, borrowing and bank-reported performance in the 23 August 2026 statement.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
