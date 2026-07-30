import { ProjectRow } from "@/infrastructure/supabase/projectAdapter"

/** フィクスチャ */
export const projectFixtures: ProjectRow[] = [
    {
        id: "001",
        workspace_id: "001",
        name: "サンプルプロジェクト001",
        version: 1,
        created_by: "user001",
        updated_by: "user001",
        created_at: "20260701",
        updated_at: "20260701",
        deleted_at: null
    }, {
        id: "002",
        workspace_id: "002",
        name: "サンプルプロジェクト002",
        version: 1,
        created_by: "user001",
        updated_by: "user001",
        created_at: "20260701",
        updated_at: "20260701",
        deleted_at: null
    }, {
        id: "003",
        workspace_id: "003",
        name: "サンプルプロジェクト003",
        version: 1,
        created_by: "user001",
        updated_by: "user001",
        created_at: "20260701",
        updated_at: "20260701",
        deleted_at: null
    }, {
        id: "004",
        workspace_id: "003",
        name: "サンプルプロジェクト004",
        version: 1,
        created_by: "user001",
        updated_by: "user001",
        created_at: "20260701",
        updated_at: "20260701",
        deleted_at: "20260701"
    }
]