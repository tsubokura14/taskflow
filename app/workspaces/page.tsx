"use client"

import { useState, useEffect } from "react";
import { Workspace } from "@/types";
import { canCreateWorkspace } from "@/lib/permissions";
import { useToastStore } from "@/store/toastStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { WorkspaceForm } from "@/components/WorkspaceForm";
import { toastMessages } from "@/lib/messages";
import { TextLink } from "@/components/TextLink";

// 未実装。ユーザーとワークスペース、権限の中間テーブルから取得するのが正。
const workspaceIds: string[] = [ "001", "002", "003" ];

export default function WorkspacesPage() {
    const openToast = useToastStore((state) => state.openToast)
    const workspaces = useWorkspaceStore((state) => state.workspaces);
    const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);

    // 新規・編集フォーム
    const [ editingWorkspace, setEditingWorkspace ] = useState<Workspace | null>(null);

    const newWorkspace: Workspace = {
        id: "",
        name: "",
        version: 1,
        createdBy: "",
        updatedBy: "",
        createdAt: "",
        updatedAt: "",
    };

    useEffect(() => {
        fetchWorkspaces(workspaceIds);
    }, [fetchWorkspaces]);

    function handleDevelopingClick(): void {
        openToast([
            { status: "error", text: toastMessages.developing }
        ])
    }

    return (
        <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
            <div className="flex justify-between w-full">
                {canCreateWorkspace() && (
                    <button
                        onClick={() => setEditingWorkspace(newWorkspace)}
                        className="mb-4 w-24 border border-gray-300 rounded-lg py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        作成
                    </button>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {workspaces.map((workspace) => (
                    <div key={workspace.id} className="flex justify-between w-full border border-gray-200 rounded-xl p-4 bg-white">
                        <TextLink href={`/workspaces/${workspace.id}/projects`}>
                            <button>{workspace.name}</button>
                        </TextLink>
                        {/* <Link href="/workspaces/${workspace.id}/settings"> */}
                            <button
                                onClick={() => handleDevelopingClick()}
                            >
                                設定
                            </button>
                        {/* </Link> */}
                    </div>
                ))}
            </div>

            {editingWorkspace && <WorkspaceForm editingWorkspace={editingWorkspace} setEditingWorkspace={setEditingWorkspace} />}
        </div>
    )
}