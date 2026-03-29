"use client";
import { FaceSmileIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";
import { useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "../context/session";
import { createClient } from "../../../utils/supabase/client";

export default function Input() {
  const supabase = createClient();
  const session = useSession();
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const filePickerRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    const filePath = `${session?.user?.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("posts_images")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("posts_images")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const sendPost = async () => {
    setLoading(true);
    let imageUrl: string | null = null;
    if (selectedFile) {
      imageUrl = await uploadImage(selectedFile);
    }

    const name = session?.user.user_metadata?.name || "";
    const username = name.split(" ").join("").toLowerCase();

    const { error } = await supabase
      .from("posts")
      .insert([
        {
          user_id: session?.user?.id,
          name: name,
          user_name: username,
          user_image: session?.user.user_metadata?.picture,
          image: imageUrl,
          text: input,
        },
      ])
      .select()
      .single();
    if (error) {
      console.error("Error inserting post:", error.message);
    }
    setInput("");
    setSelectedFile(null);
    setLoading(false);
  };

  const addImageToPost = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="flex border-b border-gray-200 p-3 space-x-3">
      <Image
        src={session.user.user_metadata?.picture}
        alt="user"
        width={50}
        height={50}
        className="rounded-full w-11 h-11 cursor-pointer hover:brightness-95"
      />
      <div className="w-full divide-y divide-gray-200">
        <div>
          <textarea
            className="w-full border-none text-lg placeholder-gray-700 tracking-wide min-h-[50px] text-gray-700 focus:outline-none"
            rows={2}
            placeholder="what's happening?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
        </div>
        {selectedFile && (
          <div className="relative">
            <XMarkIcon
              onClick={() => setSelectedFile(null)}
              className="border h-7 absolute cursor-pointer text-black shadow-md border-white m-1 rounded-full"
            />
            <Image
              src={URL.createObjectURL(selectedFile)}
              alt="post"
              width={600}
              height={300}
              className={`rounded-2xl mr-2 w-full h-auto ${
                loading && "animate-pulse"
              }`}
            />
          </div>
        )}
        {!loading && (
          <div className="flex items-center justify-between pt-2.5">
            <div className="flex">
              <div onClick={() => filePickerRef.current?.click()}>
                <PhotoIcon className="h-10 w-10 hoverEffect p-2 text-purple-500 hover:bg-purple-100" />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={filePickerRef}
                  onChange={addImageToPost}
                />
              </div>
              <FaceSmileIcon className="h-10 w-10 hoverEffect p-2 text-purple-500 hover:bg-purple-100" />
            </div>
            <button
              onClick={sendPost}
              disabled={!input.trim()}
              className="bg-purple-500 rounded-full text-white px-4 py-1.5 font-bold shadow-md hover:brightness-95 disabled:opacity-50"
            >
              Tweet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
