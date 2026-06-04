import { Metadata } from "next";

export const metadata: Metadata = {
  // This route now just 307-redirects to the unified `/login`. We keep
  // a noindex tag in case a crawler still hits the URL during the
  // redirect window.
  title: "Redirecting… | Parcego",
  description: "Redirecting to the Parcego login page.",
  robots: "noindex, nofollow",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-login-layout">
      {children}
    </div>
  );
}
