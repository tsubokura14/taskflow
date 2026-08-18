"use client"

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/lib/errors";
import { TextLink } from "./TextLink";

export function Login() {
    const router = useRouter();
    const currentUser = useAuthStore((state) => state.currentUser);
    const signIn = useAuthStore((state) => state.signIn);
    const signInAsGuest = useAuthStore((state) => state.signInAsGuest);
    const openToast = useToastStore((state) => state.openToast);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    useEffect(() => {
        if (currentUser) router.push("/workspaces");
    }, [currentUser, router]) 

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await signIn({ email, password });
        } catch(error) {
            openToast([{ status: "error", text: getErrorMessage(error) }]);
        }
        
        setIsSubmitting(false);
    }

    async function guestLogin() {
        setIsSubmitting(true);

        try {
            await signInAsGuest();
        } catch (error) {
            openToast([{ status: "error", text: getErrorMessage(error) }]);
        }

        setIsSubmitting(false);
    }
 
    return (
        <div className="flex items-center justify-center flex-1 p-8">
            <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-8 w-72">
                <h2 className="text-lg font-semibold text-slate-900">ログイン</h2>
                <form 
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3" >
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="px-1.5 py-1 rounded-lg border border-slate-300 text-sm" />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="xxxxxxxxxxxx"
                        className="px-1.5 py-1 rounded-lg border border-slate-300 text-sm" />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-300 bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        ログイン
                    </button>
                    <button
                        type="button"
                        onClick={guestLogin}
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        デモを試す
                    </button>
                </form>
                <TextLink href="/signup">
                    <span className="text-xs">アカウントをお持ちでない方はこちら</span>
                </TextLink>
            </div>
        </div>
    )
}