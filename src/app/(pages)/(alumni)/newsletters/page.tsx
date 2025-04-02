"use client";
import { useNewsLetters } from "@/context/NewsLetterContext";
import { useRouter, useSearchParams } from "next/navigation";

const sortTypes = ["NEWEST FIRST", "OLDEST FIRST"]; //sort types
const sortValues = ["nf", "of"]; //sort values (query params)
export default function NewsLetters() {
  const { newsLetters, isLoading } = useNewsLetters();

  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param
  const router = useRouter();

  //function for handling change on sort type
  function handleSortChange(sortType: string) {
    let sorting = sortType ? `?sort=${sortType}` : "";

    //will push the parameters to the url
    router.push(`${sorting}`);
  }

  //function for getting the defaultValue for the sort by dropdown using the current query
  function getDefaultSort(): string {
    let defaultSort = "nf";
    for (let i = 0; i < sortValues.length; i++) {
      if (sortValues[i] === sort) {
        defaultSort = sortValues[i]; //find its index in the sortValues array
        break;
      }
    }
    return defaultSort;
  }

  return (
    <>
      {/*sorting dropdown*/}
      <div>
        <div className="flex">
          <h1>Sort by:</h1>
          <div>
            <select
              id="sort"
              className="outline rounded-xs ml-2"
              defaultValue={getDefaultSort()}
              onChange={(e) => {
                handleSortChange(e.target.value);
              }}
            >
              {sortTypes.map((sortType, index) => (
                <option key={index} value={sortValues[index]}>
                  {sortType}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h1>Newsletters</h1>
        {isLoading && <h1>Loading</h1>}
        {newsLetters.map((newsLetter, index) => (
          <div key={index}>
            <h1>Category: {newsLetter.category[0]}</h1>
            <h2>
              {newsLetter.dateSent
                .toDate()
                .toISOString()
                .slice(0, 10)
                .replaceAll("-", "/")}
            </h2>
            <br></br>
          </div>
        ))}
      </div>
    </>
  );
}
