"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function WorkspacesLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const authStatus = useAuthStore((state) => state.authStatus);

    useEffect(() => {
        if (authStatus === "unauthenticated") {
            router.push("/");
        }
    }, [authStatus, router]);

    if (authStatus !== "authenticated") {
        return null;
    }

    return <>{children}</>;
}