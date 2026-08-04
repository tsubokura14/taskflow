// Prisma Config リファレンス
// https://www.prisma.io/docs/orm/reference/prisma-config-reference

// import "dotenv/config";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// "dotenv/config" は既定で .env しか読まないため、
// Next.js流の .env.local を明示的に指定して読み込む
config({ path: ".env.local" });

export default defineConfig({
  // Prismaスキーマファイルの場所
  schema: "prisma/schema.prisma",
  migrations: {
    // マイグレーションファイルの出力先ディレクトリ
    // マイグレーションの対象はデータベースの構造に関わるもの全て
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
