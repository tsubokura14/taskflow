// Composition Root: domainの型（Port）とinfrastructureの実装（Adapter）を
// 組み立ててよいのはこのファイルだけ。store以下はこれ以外の場所でinfrastructureを直接importしない。
import { AuthApi } from "@/domain/authApi";
import { WorkspaceApi } from "@/domain/workspaceApi";
import { ProjectApi } from "@/domain/projectApi";
import { TaskApi } from "@/domain/taskApi";

import { supabaseAuthApi } from "@/infrastructure/supabase/authAdapter";
import { supabaseWorkspaceApi } from "@/infrastructure/supabase/workspaceAdapter";
import { supabaseProjectApi } from "@/infrastructure/supabase/projectAdapter";
import { apiTaskApi } from "@/infrastructure/api/taskAdapter";

export const authApi: AuthApi = supabaseAuthApi;
export const workspaceApi: WorkspaceApi = supabaseWorkspaceApi;
export const projectApi: ProjectApi = supabaseProjectApi;
// Taskドメインのみ、Route Handler + Prisma経由の新アーキテクチャに切り替え済み
export const taskApi: TaskApi = apiTaskApi;