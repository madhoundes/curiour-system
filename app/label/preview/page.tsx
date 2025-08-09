import { Suspense } from "react";
import LabelPreviewClient from "./label-client";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading label preview…</div>}>
      <LabelPreviewClient />
    </Suspense>
  );
}