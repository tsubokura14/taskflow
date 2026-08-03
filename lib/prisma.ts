// このファイルはNext.jsのRoute Handler/Server Actionからのみimportされる想定。
import "server-only";

// PrismaClientは、schema.prismaのモデル定義から自動生成される「DBとやり取りするための型安全な窓口」。
// prisma.task.findMany() のような呼び出しを、実際のSQLに変換して実行し、
// 結果をTypeScriptの型（@mapで定義したcamelCaseのフィールド名）に変換して返してくれる。
import { PrismaClient } from "@/lib/generated/prisma/client";

// Prisma 7では、PrismaClientが自前でDBと通信する仕組みを持たず、既存のNode.js用DBドライバ（pg）に接続処理を委譲する方式。
// PrismaPgは、その委譲を仲介するDriver Adapter（Prismaの内部インターフェースとpgパッケージの間を取り持つ橋渡し役）。
import { PrismaPg } from "@prisma/adapter-pg";

// pooler接続用の接続文字列（.env.localのDATABASE_URL、6543番・pgbouncer経由）。
// CLIツール（migrate/db pull）が使うDIRECT_URLとは別物。
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "DATABASE_URLが設定されていません。.env.localを確認してください。"
    );
}

// PrismaPg（Driver Adapter）のインスタンスを1つ作る。
// connectionStringはただの接続先文字列で、PrismaPgが内部でpg.Poolにそのまま渡して実際の通信に使う。
const adapter = new PrismaPg({ connectionString: databaseUrl });

// --- ここから、開発環境でのPrismaClient使い回し（キャッシュ）の仕組み ---
//
// Next.jsのdev環境（next dev）はホットリロードのたびにこのファイルを再実行する。
// 何も対策しないと、保存するたびに新しいPrismaClient（＝新しいDB接続の束）が作られ続け、
// 古い接続が破棄されないままDBの接続数を圧迫してしまう。
//
// 対策として、プロセスが生きている限り消えない場所（globalThis）にインスタンスを保存し、
// 再実行時はそこから取り出して使い回す。
// 本番（Cloud Run）は起動時に1回しか実行されないため、この対策自体が不要。

// globalThisにTypeScript向けの型（{ prisma?: PrismaClient }）を持たせるための読み替え。
// この行自体はglobalThisと同一の実体を指すだけで、値の取得・保存は行っていない。
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// 開発環境（next dev）でだけ、次回のホットリロードに備えてglobalThisに保存しておく。
// 本番はプロセスが1回しか起動しない＝再実行される問題がそもそも起きないため、保存する意味がない。
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}