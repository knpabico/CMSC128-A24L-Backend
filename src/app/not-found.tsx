"use client";

import SearchParamsWrapper from "@/components/SearchParamsWrapper";
import NotFoundContent from "@/components/NotFoundContent";

export default function NotFound() {
  return (
    <SearchParamsWrapper
      fallback={
        <div className="flex justify-center items-center h-screen text-xl">
          Loading...
        </div>
      }
    >
      <NotFoundContent />
    </SearchParamsWrapper>
  );
}
