// Composition Root: domainの型（Port）とinfrastructureの実装（Adapter）を
// 組み立ててよいのはこのファイルだけ。store以下はこれ以外の場所でinfrastructureを直接importしない。
import { AuthApi } from "@/domain/authApi";
import { WorkspaceApi } from "@/domain/workspaceApi";
import { ProjectApi } from "@/domain/projectApi";
import { TaskApi } from "@/domain/taskApi";

import { supabaseAuthApi } from "@/infrastructure/supabase/authAdapter";
import { apiWorkspaceApi } from "@/infrastructure/api/workspaceAdapter";
import { apiProjectApi } from "@/infrastructure/api/projectAdapter";
import { apiTaskApi } from "@/infrastructure/api/taskAdapter";

export const authApi: AuthApi = supabaseAuthApi;
export const workspaceApi: WorkspaceApi = apiWorkspaceApi;
export const projectApi: ProjectApi = apiProjectApi;
export const taskApi: TaskApi = apiTaskApi;