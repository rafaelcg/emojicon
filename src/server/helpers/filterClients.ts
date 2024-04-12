import type { User } from "@clerk/nextjs/server";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profileImageUrl: user.imageUrl,
  };
};
