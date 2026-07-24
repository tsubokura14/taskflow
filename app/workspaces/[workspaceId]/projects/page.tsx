"use client"

import { useEffect, use } from "react";
import { TextLink } from "@/components/TextLink";
import { useToastStore } from "@/store/toastStore";
import { useProjectStore } from "@/store/projectStore";
import { toastMessages } from "@/lib/messages";

type Props = {
    params: Promise<{ workspaceId: string }>
}

export default function ProjectsPage({ params }: Props) {
    const { workspaceId } = use(params);
    const projects = useProjectStore((state) => state.projects);
    const fetchProjects = useProjectStore((state) => state.fetchProjects);
    const openToast = useToastStore((state) => state.openToast)

    useEffect(() => {
        fetchProjects(workspaceId);
    }, [fetchProjects, workspaceId]);

    function handleDevelopingClick(): void {
        openToast([
            { status: "error", text: toastMessages.developing }
        ])
    }

    return (
        <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
            <div className="flex justify-between w-full">
                {/* <Link href={`/workspaces/projects/new`}> */}
                    <button
                        onClick={() => handleDevelopingClick()}
                        className="mb-4 w-24 border border-gray-300 rounded-lg py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        作成
                    </button>
                {/* </Link> */}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {projects.map((project) => (
                    <div key={project.id} className="flex justify-between w-full border border-gray-200 rounded-xl p-4 bg-white">
                        <TextLink href={`/workspaces/${project.workspaceId}/projects/${project.id}/boards`}>
                            <button>{project.name}</button>
                        </TextLink>
                        {/* <Link href="/workspaces/projects/settings"> */}
                            <button
                                onClick={() => handleDevelopingClick()}
                            >
                                設定
                            </button>
                        {/* </Link> */}
                    </div>
                ))}
            </div>
        </div>
    )
}