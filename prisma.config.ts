// Prisma Config リファレンス
// https://www.prisma.io/docs/orm/reference/prisma-config-reference

import "dotenv/config";
import { defineConfig } from "prisma/config";

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
