"use client"

import { useState, useEffect, use } from "react";
import { TextLink } from "@/components/TextLink";
import { canCreateProject, canEditProject } from "@/lib/permissions";
import { Project } from "@/types";
import { useProjectStore } from "@/store/projectStore";
import { ProjectForm } from "@/components/ProjectForm";

type Props = {
    params: Promise<{ workspaceId: string }>
}

export default function ProjectsPage({ params }: Props) {
    const { workspaceId } = use(params);
    const projects = useProjectStore((state) => state.projects);
    const fetchProjects = useProjectStore((state) => state.fetchProjects);

    // 新規・編集フォーム
    const [ editingProject, setEditingProject ] = useState<Project | null>(null);

    const newProject: Project = {
        id: "",
        workspaceId: workspaceId,
        name: "",
        version: 1,
        createdBy: "",
        updatedBy: "",
        createdAt: "",
        updatedAt: "",
    };

    useEffect(() => {
        fetchProjects(workspaceId);
    }, [fetchProjects, workspaceId]);

    return (
        <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
            <div className="flex justify-between w-full">
                {canCreateProject() && (
                    <button
                        onClick={() => setEditingProject(newProject)}
                        className="mb-4 w-24 border border-gray-300 rounded-lg py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        作成
                    </button>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {projects.map((project) => (
                    <div key={project.id} className="flex justify-between w-full border border-gray-200 rounded-xl p-4 bg-white">
                        <TextLink href={`/workspaces/${project.workspaceId}/projects/${project.id}/boards`}>
                            <button>{project.name}</button>
                        </TextLink>
                        {canEditProject() && (
                            <button
                                onClick={() => setEditingProject(project)}
                            >
                                設定
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {editingProject && <ProjectForm editingProject={editingProject} setEditingProject={setEditingProject} />}
        </div>
    )
}