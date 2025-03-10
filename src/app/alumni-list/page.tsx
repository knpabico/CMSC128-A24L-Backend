"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus } from "@/models/models";

export default function Users() {
  const { alums, isLoading } = useAlums();

  return (
    <div>
      <h1>Alums</h1>
      {isLoading && <h1>Loading</h1>}
      {alums.map((user: Alumnus, index: any) => (
        <div key={index} className="p-1">
          <h2>{user.name}</h2>
          <h1>{user.email}</h1>
          <h2>{user.graduationYear}</h2>
          <h2>{user.fieldOfWork}</h2>
        </div>
      ))}
    </div>
  );
}
