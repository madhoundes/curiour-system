import type { Metadata } from "next";

export const metadata: Metadata = {
  // This route now just 307-redirects to the unified `/login`. We keep
  // a noindex tag in case a crawler still hits the URL during the
  // redirect window.
  title: "Redirecting… | Parcego",
  description: "Redirecting to the Parcego login page.",
  robots: "noindex, nofollow",
};

export default function CourierLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
