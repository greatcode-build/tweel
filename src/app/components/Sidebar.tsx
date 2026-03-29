"use client";
import Image from "next/image";
import Sidebaritem from "./Sidebaritem";
import { HomeIcon } from "@heroicons/react/16/solid";
import {
  BellAlertIcon,
  BookmarkIcon,
  ClipboardDocumentCheckIcon,
  EllipsisHorizontalCircleIcon,
  HashtagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSession } from "../context/session";
import { createClient } from "../../../utils/supabase/client";

export default function Sidebar() {
  const session = useSession();
  const router = useRouter();

  const supabase = createClient();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error", error);
    } else {
      console.log("Sign out successfully");
    }
  };
  return (
    <div className="hidden sm:flex flex-col p-2 xl:items-start fixed h-full xl:ml-24">
      <div className="hoverEffect p-2 hover:bg-white xl:px-3">
        <Image src="/logo.png" width={70} height={70} alt="logo" priority />
      </div>
      <div className="mt-4 mb-2.5 xl:items-start">
        <Sidebaritem text="Home" icon={<HomeIcon className="h-7" />} active />
        <Sidebaritem text="Explore" icon={<HashtagIcon className="h-7" />} />
        {session && (
          <>
            <Sidebaritem
              text="Notifications"
              icon={<BellAlertIcon className="h-7" />}
            />
            <Sidebaritem
              text="Messages"
              icon={<EnvelopeIcon className="h-7" />}
            />
            <Sidebaritem
              text="Bookmarks"
              icon={<BookmarkIcon className="h-7" />}
            />
            <Sidebaritem
              text="Lists"
              icon={<ClipboardDocumentCheckIcon className="h-7" />}
            />
            <Sidebaritem
              text="Profile"
              icon={<UserCircleIcon className="h-7" />}
            />
            <Sidebaritem
              text="More"
              icon={<EllipsisHorizontalCircleIcon className="h-7" />}
            />
          </>
        )}
      </div>
      {session ? (
        <>
          <button className="bg-purple-400 font-bold shadow-md text-white rounded-full w-56 h-12 hover:brightness-95 text-lg hidden xl:inline">
            Tweet
          </button>
          <div className="hoverEffect text-gray-700 flex items-center justify-center xl:justify-start mt-auto">
            <Image
              onClick={signOut}
              src={session.user.user_metadata?.picture}
              alt="user"
              width={50}
              height={50}
              className="rounded-full w-10 h-10 xl:mr-2"
            />
            <div className="leading-5 hidden xl:inline">
              <h4 className="font-bold">{session.user.user_metadata?.name}</h4>
              <p className="text-gray-500">
                @
                {session.user.user_metadata?.name
                  .split(" ")
                  .join("")
                  .toLowerCase()}
              </p>
            </div>
            <EllipsisHorizontalCircleIcon className="h-5 xl:ml-8 hidden xl:inline" />
          </div>
        </>
      ) : (
        <button
          onClick={() => router.push("/signin")}
          className="bg-purple-400 font-bold shadow-md text-white rounded-full w-56 h-12 hover:brightness-95 text-lg hidden xl:inline"
        >
          Sign in
        </button>
      )}
    </div>
  );
}
