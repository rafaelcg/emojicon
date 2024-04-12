import { SignIn, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { api } from "~/utils/api";

import type { RouterOutputs } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex border-b border-slate-400 p-4">
      <div className="flex gap-3">
        <Image
          src={author.profileImageUrl || "/profile-placeholder.png"}
          alt="Profile image"
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
        <div className="flex flex-col">
          <div className="font-semibold text-slate-300">
            <Link href={`/@${author.username}`}>
              <span>{`@${author.username} · `}</span>
            </Link>
            <Link href={`/post/${post.id}`}>
              <span className="font-thin">
                {dayjs(post.createdAt).fromNow()}
              </span>
            </Link>
          </div>
          <span className="text-2xl">{post.content}</span>
        </div>
      </div>
    </div>
  );
};

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isPending: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");

      void ctx.post.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("An error occurred");
      }
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.imageUrl || "/profile-placeholder.png"}
        alt="Profile image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="What's on your mind?"
        className="w-full bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            mutate({ content: input });
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) {
    return <LoadingPage />;
  }

  if (!data) {
    return <div>No posts found</div>;
  }

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.post.getAll.useQuery();

  if (!userLoaded) {
    return <div />;
  }

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignIn />
            </div>
          )}

          {isSignedIn && <CreatePostWizard />}
        </div>

        <Feed />
      </PageLayout>
    </>
  );
}
