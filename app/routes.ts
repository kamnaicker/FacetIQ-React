import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("register", "routes/register.tsx"),

  layout("routes/protected.tsx", [
    route("lookup", "routes/lookup.tsx"),
    route("norms", "routes/norms.tsx"),
    route("claims", "routes/claims.tsx"),
    route("people", "routes/standings.tsx"),
    route("requests", "routes/history.tsx"),
  ]),
] satisfies RouteConfig;
