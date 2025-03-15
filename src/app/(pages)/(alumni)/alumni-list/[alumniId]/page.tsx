"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus } from "@/models/models";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AlumPage() {
  const { alums, loading: alumsloading } = useAlums();
  const { loading: authloading } = useAuth();
  const params = useParams();
  const alumniId = params?.alumniId;
  const [alum, setAlum] = useState<Alumnus | null>(null);

  useEffect(() => {
    if (alumniId) {
      const foundAlum =
        alums.find((alum: Alumnus) => alum.alumniId === alumniId) || null;
      setAlum(foundAlum);
    }
  }, [alumniId, alums]);

  if (alumsloading || authloading) return <h1>Loading...</h1>;
  if (!alum) return <h1>Alum not found...</h1>;

  return (
    <div>
      <h1>{alum.name}</h1>
      <h1>{alum.companyName}</h1>
      <h1>{alum.address}</h1>
      <h1>{alum.age}</h1>
      <h1>{alum.birthDate.toDate().toISOString().slice(0,10).replaceAll("-", "/")}</h1>
      <h1>{alum.fieldOfWork}</h1>
      <h1>{alum.companyName}</h1>
      <h1>{alum.jobTitle}</h1>
      <h1>{alum.address}</h1>
      <h1>{alum.affiliation}</h1>
    </div>
  );
}
