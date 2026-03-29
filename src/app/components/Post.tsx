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
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { commentState, postIdState } from "../../../store/commentAtom";

interface PostProps {
  post: {
    id: string;
    name: string;
    user_name: string;
    user_image: string;
    user_id: string;
    image: string;
    text: string;
    timestamp: string;
  };
  id: string;
  commentCount?: number;
}

interface Like {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
}

export default function Post({ post, id, commentCount }: PostProps) {
  const [likes, setLikes] = useState<Like[]>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState<number>(commentCount ?? 0);
  const [open, setOpen] = useAtom(commentState);
  const [postId, setPostId] = useAtom(postIdState);

  dayjs.extend(relativeTime);
  dayjs.extend(utc);
  const supabase = createClient();
  const session = useSession();
  const router = useRouter();
  const name = session?.user.user_metadata?.name || "";
  const username = name.split(" ").join("").toLowerCase();

  useEffect(() => {
    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", id)
        .is("comment_id", null); //exclude comment likes
      if (!error && data) setLikes(data);
    };

    fetchLikes();

    const likeSubscription = supabase
      .channel(`likes:post-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter: `post_id=eq.${id}`,
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likeSubscription);
    };
  }, [id, supabase]);

  const shouldFetchComments = commentCount === undefined;

  useEffect(() => {
    if (!shouldFetchComments) {
      setCommentsCount(commentCount || 0);
      return;
    }

    const fetchCommentCount = async () => {
      const { count } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);
      setCommentsCount(count || 0);
    };

    fetchCommentCount();

    const commentSubscription = supabase
      .channel(`comments:post-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${id}`,
        },
        fetchCommentCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentSubscription);
    };
  }, [id, supabase, commentCount]);

  useEffect(() => {
    if (!session?.user?.id) return;
    setHasLiked(likes.some((like) => like.user_id === session.user.id));
  }, [likes, session]);

  const likePost = async () => {
    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }

    if (hasLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", id)
        .eq("user_id", session?.user.id);

      if (error) console.error("Error unliking post:", error);

      setHasLiked(false);
      setLikes((prev) =>
        prev.filter((like) => like.user_id !== session?.user.id)
      );
    } else {
      const { error } = await supabase
        .from("likes")
        .insert([
          {
            post_id: post.id,
            user_id: session?.user.id,
            user_name: username,
          },
        ])
        .select()
        .single();

      if (error) console.error("Error liking post:", error);

      setHasLiked(true);
    }
  };

  const deletePost = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;
    try {
      if (post.image) {
        const match = post.image.match(/posts_images\/(.+)$/);
        if (match && match[1]) {
          const imagePath = decodeURIComponent(match[1]);

          const { error: imageError } = await supabase.storage
            .from("posts_images")
            .remove([imagePath]);

          if (imageError)
            console.error("Error deleting image:", imageError.message);
        } else {
          console.warn("Could not extract image path from URL:", post.image);
        }
      }

      const { error: postError } = await supabase
        .from("posts")
        .delete()
        .eq("id", id)
        .eq("user_id", session?.user.id);

      router.push("/");
      if (postError) console.error("Error deleting post:", postError.message);
    } catch (err) {
      console.error("Unexpected delete error:", err);
    }
  };

  const displayedCommentCount =
    commentCount !== undefined ? commentCount : commentsCount;
  return (
    <div className="flex p-3 cursor-pointer border-b border-gray-200">
      <Image
        src={post.user_image}
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
              {post.name}
            </h4>
            <span className="text-sm sm:text-[15px]">@{post.user_name} - </span>
            <span className="text-sm sm:text-[15px] hover:underline">
              {dayjs.utc(post.timestamp).fromNow()}
            </span>
          </div>
          <EllipsisHorizontalCircleIcon className="h-10 hoverEffect w-10 hover:bg-purple-100 hover:text-purple-500 p-2" />
        </div>
        <p
          onClick={() => router.push(`/posts/${id}`)}
          className="text-gray-800 text-[15px] sm:text-[16px] mb-4"
        >
          {post.text}
        </p>
        {post.image && (
          <Image
            onClick={() => router.push(`/posts/${id}`)}
            src={post.image}
            alt="post"
            width={600}
            height={300}
            className="rounded-2xl mr-2 w-full h-auto"
            crossOrigin="anonymous"
            priority={false}
          />
        )}
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
            {displayedCommentCount > 0 && (
              <span className="text-sm">{displayedCommentCount}</span>
            )}
          </div>
          {session?.user.id === post.user_id && (
            <TrashIcon
              onClick={deletePost}
              className="h-9 w-9 hoverEffect p-2 hover:bg-red-100
            hover:text-red-600"
            />
          )}
          <div className="flex items-center">
            {hasLiked ? (
              <HeartIconFilled
                onClick={likePost}
                className="h-9 w-9 hoverEffect p-2 hover:bg-red-100 text-red-600"
              />
            ) : (
              <HeartIcon
                onClick={likePost}
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
