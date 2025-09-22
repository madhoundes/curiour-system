import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courier Route Simulation | Parcego",
  description: "Interactive delivery route simulation for courier operations",
};

export default function CourierRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
