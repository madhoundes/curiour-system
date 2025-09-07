import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courier Login | Parcego",
  description: "Secure login portal for Parcego courier drivers and delivery professionals.",
  robots: "noindex, nofollow", // Prevent search engine indexing of login page
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
