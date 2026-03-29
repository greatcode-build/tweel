import {
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { createClient } from "../../../utils/supabase/client";
import { useSession } from "../context/session";
import { useEffect, useState } from "react";
import { HeartIcon as HeartIconFilled } from "@heroicons/react/16/solid";
import { useAtom } from "jotai";
import { commentState, postIdState } from "../../../store/commentAtom";
import { useRouter } from "next/navigation";

interface Like {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
}

interface CommentProps {
  id: string;
  commentId: string;
  comment: {
    name: string;
    user_name: string;
    user_image: string;
    user_id: string;
    comment: string;
    created_at: string;
  };
}

function Comment({ comment, commentId, id }: CommentProps) {
  const [likes, setLikes] = useState<Like[]>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [open, setOpen] = useAtom(commentState);
  const [postId, setPostId] = useAtom(postIdState);
  const router = useRouter();

  dayjs.extend(relativeTime);
  dayjs.extend(utc);
  const supabase = createClient();
  const session = useSession();
  const name = session?.user.user_metadata?.name || "";
  const username = name.split(" ").join("").toLowerCase();

  useEffect(() => {
    const fetchCommentLikes = async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("comment_id", commentId);
      if (!error && data) setLikes(data);
    };

    fetchCommentLikes();

    const likeSubscription = supabase
      .channel(`public:likes-post-${commentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter: `comment_id=eq.${commentId}`,
        },
        () => {
          fetchCommentLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likeSubscription);
    };
  }, [commentId, supabase]);

  useEffect(() => {
    if (!session?.user?.id) return;
    setHasLiked(likes.some((like) => like.user_id === session.user.id));
  }, [likes, session]);

  const likeComment = async () => {
    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }

    if (hasLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", session?.user.id);

      if (error) console.error("Error unliking comment:", error);

      setHasLiked(false);
      setLikes((prev) =>
        prev.filter((like) => like.user_id !== session?.user.id)
      );
    } else {
      const { data, error } = await supabase
        .from("likes")
        .insert([
          {
            post_id: id,
            comment_id: commentId,
            user_id: session?.user.id,
            user_name: username,
          },
        ])
        .select("*")
        .single();

      if (error) {
        console.error("Error liking comment:", error);
        return;
      }

      setHasLiked(true);
      setLikes((prev) => [...prev, data]);
    }
  };

  const deleteComment = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return;
    try {
      const { error: postError } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", session?.user.id);

      if (postError) console.error("Error deleting post:", postError.message);
    } catch (err) {
      console.error("Unexpected delete error:", err);
    }
  };

  return (
    <div className="flex p-3 cursor-pointer border-b border-gray-200 pl-15">
      <Image
        src={comment.user_image}
        alt="user"
        width={50}
        height={50}
        className="rounded-full w-10 h-10 mr-4 cursor-pointer hover:brightness-95"
        crossOrigin="anonymous"
        priority={false}
      />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 whitespace-nowrap items-center">
            <h4 className="font-bold text-[15px] sm:text-[16px] hover:underline">
              {comment.name}
            </h4>
            <span className="text-sm sm:text-[15px]">
              @{comment.user_name} -{" "}
            </span>
            <span className="text-sm sm:text-[15px] hover:underline">
              {dayjs.utc(comment.created_at).fromNow()}
            </span>
          </div>
          <EllipsisHorizontalCircleIcon className="h-10 hoverEffect w-10 hover:bg-purple-100 hover:text-purple-500 p-2" />
        </div>
        <p className="text-gray-800 text-[15px] sm:text-[16px] mb-4">
          {comment.comment}
        </p>

        <div className="flex justify-between text-gray-500 p-2 mt-1">
          <div className="flex items-center select-none">
            <ChatBubbleOvalLeftEllipsisIcon
              onClick={() => {
                if (!session?.user?.id) {
                  router.push("/signin");
                  return;
                } else {
                  setPostId(id);
                  setOpen(!open);
                }
              }}
              className="h-9 w-9 hoverEffect p-2 hover:bg-purple-100
            hover:text-purple-500"
            />
          </div>
          {session?.user.id === comment.user_id && (
            <TrashIcon
              onClick={deleteComment}
              className="h-9 w-9 hoverEffect p-2 hover:bg-red-100
            hover:text-red-600"
            />
          )}
          <div className="flex items-center">
            {hasLiked ? (
              <HeartIconFilled
                onClick={likeComment}
                className="h-9 w-9 hoverEffect p-2 hover:bg-red-100 text-red-600"
              />
            ) : (
              <HeartIcon
                onClick={likeComment}
                className="h-9 w-9 hoverEffect p-2 hover:bg-red-100 hover:text-red-600"
              />
            )}
            {likes.length > 0 && (
              <span className={`${hasLiked && "text-red-600"} text-sm`}>
                {likes.length}
              </span>
            )}
          </div>
          <ShareIcon
            className="h-9 w-9 hoverEffect p-2 hover:bg-purple-100
            hover:text-purple-500"
          />
          <ChartBarIcon
            className="h-9 w-9 hoverEffect p-2 hover:bg-purple-100
            hover:text-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

export { Comment };
