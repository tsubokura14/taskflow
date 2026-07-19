"use client"

import { useEffect } from "react";
import Link from "next/link"
import { useWorkspaceStore } from "@/store/workspaceStore";

// 未実装。ユーザーとワークスペース、権限の中間テーブルから取得するのが正。
const workspaceIds: string[] = [ "001", "002", "003" ];

export default function WorkspacesPage() {
    const workspaces = useWorkspaceStore((state) => state.workspaces);
    const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);

    useEffect(() => {
        fetchWorkspaces(workspaceIds);
    }, [fetchWorkspaces, workspaceIds]);

    return (
        <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
            <div className="flex justify-between w-full">
                <Link href="/workspaces/new" >
                    <button
                        className="mb-4 w-24 border border-gray-300 rounded-lg py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        作成
                    </button>
                </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {workspaces.map((workspace) => (
                    <div key={workspace.id} className="flex justify-between w-full border border-gray-200 rounded-xl p-4 bg-white">
                        <Link href={`/workspaces/${workspace.id}/projects`}>
                            <button>{workspace.name}</button>
                        </Link>
                        <Link href="/workspaces/settings">
                            <button>設定</button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}