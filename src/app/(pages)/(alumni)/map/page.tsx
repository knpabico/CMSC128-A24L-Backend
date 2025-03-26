"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import SearchBox from "./box";

export default function MyPage() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/app/(pages)/(alumni)/map/map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  const [selectPosition, setSelectPosition] = useState(null);
  console.log(selectPosition);
  return (
    <div>
      <h1>Maps</h1>
      <div
        style={{
          height: "500px",
          width: "100%",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Map selectPosition={selectPosition} />
        <SearchBox
          selectPosition={selectPosition}
          setSelectPosition={setSelectPosition}
        />
      </div>
    </div>
  );
}
