import { useSession } from "next-auth/react"

// This can be used inside client side pages
export const useCurrentRole = () => {
    const session = useSession();

    return session.data?.user?.role;
};