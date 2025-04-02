import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/info/about.tsx"),
    route("catalog", "routes/catalog.tsx"),
    route("search", "routes/search.tsx"),
    route("FAQ", "routes/info/faq.tsx"),
    route("resources", "routes/info/resources.tsx"),
    route("contactus", "routes/info/contactus.tsx"),
    route("device/:itemId", "routes/detail/DeviceDetail.tsx"),
    route("media/:itemId", "routes/detail/mediaDetail.tsx"),
    route("book/:itemId", "routes/detail/bookDetail.tsx"),
    route("cart", "routes/CartPage.tsx"),
    route("signup", "routes/signup/signup.tsx"),
    route("login", "routes/login/login.tsx"),
    route("profile", "routes/profile/profile.tsx", [
      route("dashboard", "routes/profile/dashboard.tsx"),
      route("myitems", "routes/profile/myitems.tsx"),
      //route("mailbox", "routes/mailbox.tsx"),
      //route("settings", "routes/settings.tsx"),
    ]),
    route("admin", "routes/admin/admin.tsx", [
      route("reports", "routes/admin/reports.tsx"),
      route("edit", "routes/admin/edit.tsx"),
      route("usermanagement", "routes/admin/usermanagement.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
