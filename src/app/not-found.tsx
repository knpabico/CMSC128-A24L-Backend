"use client";

import { Suspense } from "react";
import NotFoundContent from "@/components/NotFoundContent";

export default function NotFound() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen text-xl">
          Loading...
        </div>
      }
    >
      <NotFoundContent />
    </Suspense>
  );
}
