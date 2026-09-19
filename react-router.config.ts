import type { Config } from "@react-router/dev/config";

export default {
  // Client rendered. The API is the only server, so there is no second place a token could
  // live and the build deploys as static files.
  ssr: false,
} satisfies Config;
