"use client";
import { useNewsLetters } from "@/context/NewsLetterContext";

export default function Announcements() {
  const { newsLetters, isLoading } = useNewsLetters();

  return (
    <div>
      <h1>Newsletters</h1>
      {isLoading && <h1>Loading</h1>}
      {newsLetters.map((newsLetter, index) => (
        <div key={index}>
          <h1>{newsLetter.post_title}</h1>
          <h2>{newsLetter.item_type}</h2>
        </div>
      ))}
    </div>
  );
}
