import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained `.next/standalone` build so the
  // Docker runtime image only needs the traced output, not node_modules.
  output: "standalone",
};

export default nextConfig;
