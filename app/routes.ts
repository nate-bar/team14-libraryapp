import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("items", "routes/items.tsx"),
    route("admin", "routes/admin.tsx")
  ]),
  route("signup", "routes/signup/signup.tsx"),
  route("login", "routes/login/login.tsx"),
] satisfies RouteConfig;
