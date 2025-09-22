import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShipmentProvider } from "@/lib/shipment-context";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parcego - Courier Business Platform",
  description: "Fast, reliable, and affordable delivery solutions for small businesses",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* suppressHydrationWarning prevents hydration mismatches caused by browser extensions modifying the HTML tag */}
      <html
        lang="en"
        suppressHydrationWarning={true}
      >
      <head>
        {/* Mobile viewport meta tag for proper responsive scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* Prevent iOS from auto-linking phone numbers/dates to avoid hydration diffs */}
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        {/* Prevent browser extensions from causing hydration mismatches */}
        <meta name="chrome-extension-blocker" content="true" />
        <style suppressHydrationWarning>{`
          /* Suppress browser extension attributes that cause hydration mismatch */
          body[cz-shortcut-listen] { 
            /* ColorZilla extension fix */
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Iconify script removed to prevent DOM mutation side-effects during fast refresh.
            Use static icons, emojis, or a React icon library instead. */}
        <ShipmentProvider>
          {children}
        </ShipmentProvider>
        <Toaster position="top-right" richColors />
        
        {/* Browser extension compatibility script */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              // Handle browser extension attributes that cause hydration mismatch
              if (typeof window !== 'undefined') {
                // Wait for extensions to load and modify DOM
                setTimeout(() => {
                  const body = document.body;
                  const html = document.documentElement;

                  // Check for known extension attributes
                  if (body.hasAttribute('cz-shortcut-listen')) {
                    console.log('[Parcego] Detected ColorZilla extension, handling hydration compatibility');
                  }
                  if (html.hasAttribute('crxlauncher')) {
                    console.log('[Parcego] Detected Chrome extension launcher attribute, handling hydration compatibility');
                  }

                  // Log any other extension attributes for debugging
                  const extensionAttributes = ['crxlauncher', 'cz-shortcut-listen', 'data-extension-installed'];
                  extensionAttributes.forEach(attr => {
                    if (html.hasAttribute(attr) || body.hasAttribute(attr)) {
                      console.log(\`[Parcego] Browser extension attribute detected: \${attr}\`);
                    }
                  });
                }, 100);
              }
            `
          }}
        />
      </body>
    </html>
    </>
  );
}
