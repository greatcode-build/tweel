"use client";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { useAtom } from "jotai";
import {
  FaceSmileIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { commentState, postIdState } from "../../../store/commentAtom";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import Image from "next/image";
import dayjs from "dayjs";
import { useSession } from "../context/session";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  text: string;
  name: string;
  user_name: string;
  user_image: string;
  timestamp: string;
}

function CommentModal() {
  const supabase = createClient();
  const [open, setOpen] = useAtom(commentState);
  const [post, setPost] = useState<Post | null>(null);
  const [postId] = useAtom(postIdState);
  const session = useSession();
  const [input, setInput] = useState("");
  const router = useRouter();
  const name = session?.user.user_metadata?.name || "";
  const username = name.split(" ").join("").toLowerCase();

  useEffect(() => {
    if (!postId) return;

    let isMounted = true;
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (!isMounted) return;
      if (error) console.error("Error fetching post:", error);
      else setPost(data);
    };

    fetchPost();

    const channel = supabase
      .channel(`post-updates-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `id=eq.${postId}`,
        },
        (payload) => {
          console.log("Post updated:", payload);
          if (payload.eventType === "DELETE") setPost(null);
          else if (payload.new) setPost(payload.new as Post);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [postId, supabase]);

  const sendComment = async () => {
    if (!input.trim() || !session?.user || !postId) return;

    try {
      const { error } = await supabase.from("comments").insert([
        {
          post_id: postId,
          comment: input,
          name: session.user.user_metadata?.name,
          user_name: username,
          user_image: session.user.user_metadata?.picture,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setOpen(false);
      setInput("");
      router.push(`/posts/${postId}`);
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  return (
    <div>
      {open && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          showCloseIcon={false}
          classNames={{
            modal:
              "max-w-lg w-[90%] bg-white border-1 border-gray-400 rounded-xl shadow-md",
          }}
          center
        >
          <div className="p-1">
            <div className="border-b border-gray-200 py-2 px-1.5">
              <div
                onClick={() => setOpen(false)}
                className="hoverEffect w-10 h-10 flex items-center justify-center"
              >
                <XMarkIcon className="h-[23px] text-gray-700 p-0" />
              </div>
            </div>
            <div className="p-4 flex items-center space-x-1 relative">
              <span className="w-0.5 h-full z-[-1] absolute left-8 top-11 bg-gray-300" />
              {post?.user_image && (
                <Image
                  src={post?.user_image}
                  alt="user"
                  width={50}
                  height={50}
                  className="rounded-full w-10 h-10 mr-4 cursor-pointer hover:brightness-95"
                  crossOrigin="anonymous"
                  priority={false}
                />
              )}
              <h4 className="font-bold text-[15px] sm:text-[16px] hover:underline">
                {post?.name}
              </h4>
              <span className="text-sm sm:text-[15px]">
                @{post?.user_name} -{" "}
              </span>
              <span className="text-sm sm:text-[15px] hover:underline">
                {dayjs.utc(post?.timestamp).fromNow()}
              </span>
            </div>
            <p className="text-gray-500 text-[15px] sm:text-[16px] ml-16 mb-2">
              {post?.text}
            </p>
            <div className="flex p-3 space-x-3">
              <Image
                src={session?.user.user_metadata?.picture}
                alt="user"
                width={50}
                height={50}
                className="rounded-full w-11 h-11 cursor-pointer hover:brightness-95"
                priority={false}
              />
              <div className="w-full divide-y divide-gray-200">
                <div>
                  <textarea
                    className="w-full border-none text-lg placeholder-gray-700 tracking-wide min-h-[50px] text-gray-700 focus:outline-none"
                    rows={2}
                    placeholder="Tweet your reply"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-2.5">
                  <div className="flex">
                    {/* <div onClick={() => filePickerRef.current?.click()}> */}
                    <PhotoIcon className="h-10 w-10 hoverEffect p-2 text-purple-500 hover:bg-purple-100" />
                    {/* <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={filePickerRef}
                        onChange={addImageToPost}
                      /> */}
                    {/* </div> */}
                    <FaceSmileIcon className="h-10 w-10 hoverEffect p-2 text-purple-500 hover:bg-purple-100" />
                  </div>
                  <button
                    onClick={sendComment}
                    disabled={!input.trim()}
                    className="bg-purple-500 rounded-full text-white px-4 py-1.5 font-bold shadow-md hover:brightness-95 disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export { CommentModal };
