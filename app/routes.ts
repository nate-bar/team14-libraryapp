import { type RouteConfig, route, index, layout, prefix } from "@react-router/dev/routes";

export default [
    layout("routes/layout.tsx", [
        index("routes/home.tsx"),
        route("about", "routes/about.tsx"),
        route("items", "routes/items.tsx"),
        route("members", "routes/members.tsx")
      ])
] satisfies RouteConfig;