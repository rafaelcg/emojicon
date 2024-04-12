import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

type PostWithUser = RouterOutputs["post"]["getAll"][number];

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const PostView = (props: PostWithUser) => {
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

export default PostView;
