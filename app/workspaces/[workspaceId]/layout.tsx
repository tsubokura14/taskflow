"use client"

import { useEffect, use } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"

type Props = {
    params: Promise<{ workspaceId: string }>;
    children: React.ReactNode;
}

export default function WorkspaceLayout({ params, children }: Props ) {
    const { workspaceId } = use(params);
    const setCurrentWorkspaceId = useWorkspaceStore((state) => state.setCurrentWorkspaceId);

    useEffect(() => {
        setCurrentWorkspaceId(workspaceId);
        return () => setCurrentWorkspaceId(null);
    }, [workspaceId, setCurrentWorkspaceId]);

    return <>{children}</>
}