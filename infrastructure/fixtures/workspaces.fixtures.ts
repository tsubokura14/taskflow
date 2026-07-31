import { WorkspaceRow } from "@/infrastructure/supabase/workspaceAdapter"

/** フィクスチャ */
export const workspaceFixtures: WorkspaceRow[] = [
    {
        id: "001",
        name: "サンプルワークスペース001",
        version: 1,
        created_by: "user001",
        updated_by: "user001",
        created_at: "20260701",
        updated_at: "20260701",
        deleted_at: null
    }, {
        id: "002",
        name: "サンプルワークスペース002",
        version: 1,
        created_by: "user002",
        updated_by: "user002",
        created_at: "20260701",
        updated_at: "20260701",
        deleted_at: "20260701"
    }, {
        id: "003",
        name: "サンプルワークスペース003",
        version: 1,
        created_by: "user003",
        updated_by: "user003",
        created_at: "20260701",
        updated_at: "20260701",
        deleted_at: "20260701"
    }
]