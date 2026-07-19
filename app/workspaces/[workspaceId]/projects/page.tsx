"use client"

import { useEffect, use } from "react";
import Link from "next/link"
import { useProjectStore } from "@/store/projectStore";

type Props = {
    params: Promise<{ workspaceId: string }>
}

export default function ProjectsPage({ params }: Props) {
    const { workspaceId } = use(params);
    const projects = useProjectStore((state) => state.projects);
    const fetchProjects = useProjectStore((state) => state.fetchProjects);

    useEffect(() => {
        fetchProjects(workspaceId);
    }, [fetchProjects]);

    return (
        <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
            <div className="flex justify-between w-full">
                <Link href="/workspaces/projects/new" >
                    <button
                        className="mb-4 w-24 border border-gray-300 rounded-lg py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        作成
                    </button>
                </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {projects.map((project) => (
                    <div key={project.id} className="flex justify-between w-full border border-gray-200 rounded-xl p-4 bg-white">
                        <Link href={`/workspaces/${project.workspaceId}/projects/${project.id}/boards`}>
                            <button>{project.name}</button>
                        </Link>
                        <Link href="/workspaces/projects/settings">
                            <button>設定</button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}