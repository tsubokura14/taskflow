"use client"

import { useAuthStore } from "@/store/authStore"
import { TextLink } from "./TextLink"
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/lib/errors";

export function Header() {
    const authStatus = useAuthStore((state) => state.authStatus);
    const signOut = useAuthStore((state) => state.signOut);
    const openToast = useToastStore((state) => state.openToast);

    async function handleSignOut() {
        try {
            await signOut();
        } catch (error) {
            openToast([{ status: "error", text: getErrorMessage(error) }]);
        }
    }
 
    return (
        <header
         className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-white/90 backdrop-blur-sm"
        >
            <TextLink href={authStatus === "authenticated" ? "/workspaces" : "/" }>
                <span className="text-base font-semibold tracking-tight text-slate-900">
                    TaskFlow
                </span>
            </TextLink>

            {authStatus === "authenticated" &&
                <button
                    onClick={handleSignOut}
                    className="rounded-lg px-3 py-1.5 text-sm font-midium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                    サインアウト
                </button>
            }
        </header>
    )
}