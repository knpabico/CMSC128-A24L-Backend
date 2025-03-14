"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
export default function Navbar() {
  const { user, logOut, loading } = useAuth();
  const router = useRouter();
  return (
    <div className=" flex ">
      <div className="p-3">
        {loading && <></>}
        <Link className="text-black font-bold p-3" href={"/"}>
          Website Logo
        </Link>
        {!user && !loading && (
          <Link href={"/auth/login"} className="text-black font-bold">
            Log In
          </Link>
        )}
      </div>
      {!user && !loading ? (
        <div className="p-3">
          <Link href={"/auth/signup"} className="text-black font-bold">
            Sign Up
          </Link>
        </div>
      ) : (
        <></>
      )}

      {user && (
        <div
          className="p-3 text-black font-bold"
          onClick={async () => {
            router.push("/newsletters");
          }}
        >
          <button className=" cursor-pointer">See Newsletters</button>
        </div>
      )}
      {user && (
        <div
          className="p-3 text-black font-bold"
          onClick={async () => {
            router.push("/alumni-list");
          }}
        >
          <button className=" cursor-pointer">See Alums</button>
        </div>
      )}
      {user && (
        <div
          className="p-3 text-black font-bold"
          onClick={async () => {
            router.push("/joboffer-list");
          }}
        >
          <button className=" cursor-pointer">See Job Offers</button>
        </div>
      )}
      {user && (
        <div
          className="p-3 text-black font-bold"
          onClick={async () => {
            router.push("/announcement-list");
          }}
        >
          <button className=" cursor-pointer">ANNOUNCEMENTS</button>
        </div>
      )}
      {user && (
        <div
          className="p-3 text-black font-bold"
          onClick={async () => {
            router.push("/donationdrive-list");
          }}
        >
          <button className=" cursor-pointer">Donation Drives</button>
        </div>
      )}
      {user && (
        <div
          className="p-3 text-black font-bold"
          onClick={async () => {
            router.push("/bookmark-list");
          }}
        >
          <button className=" cursor-pointer">Bookmarks</button>
        </div>
      )}
      {user && (
        <div
          onClick={async () => {
            await logOut();
            router.push("/");
            // router.refresh();
          }}
          className="p-3 text-black font-bold"
        >
          <button className=" cursor-pointer">Sign Out</button>
        </div>
      )}
    </div>
  );
}
