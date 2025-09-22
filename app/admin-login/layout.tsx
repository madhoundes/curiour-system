import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Parcego",
  description: "Secure administrator access to the Parcego courier platform management system.",
  robots: "noindex, nofollow", // Prevent search engine indexing of admin login
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
