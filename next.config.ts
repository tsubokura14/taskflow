import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone", // ビルド成果物をDockerコンテナで動かすことに最適化された必要最低限だけ出力
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
