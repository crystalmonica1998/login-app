import { auth } from "@/auth";

// This can be used inside server components, server actions and server routes
export const currentUser = async () => {
    const session = await auth();

    return session?.user;
}

export const currentRole = async () => {
    const session = await auth();

    return session?.user?.role;
}