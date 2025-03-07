"use client";
import { useAlums } from "@/context/AlumContext";

export default function Users() {
  const { alums, isLoading } = useAlums();

  return (
    <div>
      <h1>Alums</h1>
      {isLoading && <h1>Loading</h1>}
      {alums.map((user: any, index: any) => (
        <div key={index}>
          <h1>{user.email}</h1>
          <h2>{user.graduation_year}</h2>
        </div>
      ))}
    </div>
  );
}
