# taskflow — タスク管理アプリ

タスクをカード形式で管理し、ドラッグ＆ドロップでステータス（未着手 / 進行中 / 完了）を切り替えられるカンバンボードアプリです。  
エンタープライズ利用が可能なレベルのタスク管理SaaSを最終形として想定し、その最初のステップとして構築しています。

**公開URL**: https://tm-taskflow.vercel.app

## 主な機能

- タスクの作成・編集・削除
- ドラッグ＆ドロップによるステータス変更（`@dnd-kit`）
- Supabase (PostgreSQL) によるデータ永続化

## 技術スタック

| レイヤー | 技術 |
| --- | --- |
| フロントエンド | Next.js 16 (App Router) / React 19 / TypeScript |
| 状態管理 | Zustand |
| ドラッグ＆ドロップ | @dnd-kit |
| データベース / BaaS | Supabase (PostgreSQL) |
| ホスティング | Vercel（GitHub連携によるCI/CD） |

## アーキテクチャ

UIコンポーネントからSupabaseクライアントを直接呼ばず、以下の層に分離しています。

```
UI (KanbanBoard, TaskForm)
  ↓
状態管理 (Zustand store)
  ↓
データアクセス層 (lib/tasks.ts) ← DBの行データとアプリの型を変換
  ↓
Supabaseクライアント (lib/supabaseClient.ts)
  ↓
Supabase (PostgreSQL + Row Level Security)
```

## ディレクトリ構成

| パス | 説明 |
| --- | --- |
| app/ | Next.js App Router のエントリポイント |
| components/ | UIコンポーネント（KanbanBoard, TaskForm, TaskCard） |
| store/ | Zustandによる状態管理 |
| lib/ | Supabaseクライアント・データアクセス・権限チェック |
| types/ | 型定義 |