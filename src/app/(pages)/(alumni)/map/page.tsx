"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function MyPage() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/app/(pages)/(alumni)/map/map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  return (
    <div>
      <h1>Maps</h1>
      <div style={{ height: "500px", width: "100%" }}>
        <Map position={[14, 120]} zoom={13} />
      </div>
    </div>
  );
}
