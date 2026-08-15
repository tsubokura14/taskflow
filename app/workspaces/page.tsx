"use client"

import { useState, useEffect } from "react";
import { Workspace } from "@/types";
import { canCreateWorkspace, canEditWorkspace } from "@/lib/permissions.client";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { WorkspaceForm } from "@/components/WorkspaceForm";
import { TextLink } from "@/components/TextLink";

export default function WorkspacesPage() {
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
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    return (
        <div className="flex flex-col items-center flex-1 p-8 bg-slate-50">
            <div className="flex justify-between w-full">
                {canCreateWorkspace() && (
                    <button
                        onClick={() => setEditingWorkspace(newWorkspace)}
                        className="mb-4 w-24 border border-slate-300 rounded-lg py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        作成
                    </button>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {workspaces.map((workspace) => (
                    <div key={workspace.id} className="flex justify-between w-full border border-slate-200 rounded-xl p-4 bg-white">
                        <TextLink href={`/workspaces/${workspace.id}/projects`}>
                            <button>{workspace.name}</button>
                        </TextLink>
                        {canEditWorkspace() && (
                            <button
                                onClick={() => setEditingWorkspace(workspace)}
                            >
                                設定
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {editingWorkspace && <WorkspaceForm editingWorkspace={editingWorkspace} setEditingWorkspace={setEditingWorkspace} />}
        </div>
    )
}