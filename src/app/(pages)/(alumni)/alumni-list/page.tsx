"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus } from "@/models/models";
import Link from "next/link";
import { useRouter } from "next/navigation";




export default function Users() {
  const { alums, isLoading } = useAlums();
  const router = useRouter();

  return (
    <div>
      <h1>Alums</h1>
      {isLoading && <h1>Loading</h1>}
      {alums.map((user: Alumnus, index: any) => (
        <div key={index} 
            className="bg-green-500 p-3 border-4 border-red-50"
            onClick={() => router.push(`/alumni-list/${user.alumniId}`)}>
          <Link
            href={`/alumni-list/${user.alumniId}`}
            className="text-blue-700 underline"
          >
            {user.firstName} {user.lastName}
          </Link>
          <h1>{user.email}</h1>
          <h2>{user.graduationYear}</h2>
          <h2>{user.fieldOfWork}</h2>
        </div>
      ))}
    </div>
  );
}
