"use client"
import { useEffect, use } from 'react';
import { useProjectStore } from '@/store/projectStore';

type Props = {
    params: Promise<{ projectId: string }>;
    children: React.ReactNode;
}

export default function BoardLayout({ params, children }: Props ) {
    const { projectId } = use(params);
    const setCurrentProjectId = useProjectStore((state) => state.setCurrentProjectId);

    useEffect(() => {
        setCurrentProjectId(projectId);
        return () => setCurrentProjectId(null);
    }, [setCurrentProjectId, projectId])
    
    return <>{children}</>
}