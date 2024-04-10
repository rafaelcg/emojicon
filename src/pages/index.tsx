import { SignIn, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { api } from "~/utils/api";

import type { RouterOutputs } from "~/utils/api";

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
            <span>{`@${author.username} · `}</span>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </div>
          <span>{post.content}</span>
        </div>
      </div>
    </div>
  );
};

const CreatePostWizard = () => {
  const { user } = useUser();

  console.log(user?.id);

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
      />
    </div>
  );
};

export default function Home() {
  const user = useUser();

  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center">
        <div className="h-screen w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!user.isSignedIn ? (
              <div className="flex justify-center">
                <SignIn />
              </div>
            ) : (
              <CreatePostWizard />
            )}
          </div>
          <div className="flex flex-col">
            {data?.map((fullPost) => (
              <PostView key={fullPost.post.id} {...fullPost} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
