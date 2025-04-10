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
    route("profile", "routes/profile/profile.tsx"), 
    route("dashboard", "routes/profile/dashboard.tsx"),
    route("myitems", "routes/profile/myitems.tsx"),
    route("holds", "routes/profile/holds.tsx"),
    route("mailbox", "routes/profile/mailbox.tsx"),
    route("settings", "routes/profile/settings.tsx"),
    route("borrowinghistory", "routes/profile/borrowinghistory.tsx"),
   route("admin", "routes/admin/admin.tsx", [
      route("reports", "routes/admin/reports.tsx"),
      route("edit", "routes/admin/edit.tsx"),
      route("usermanagement", "routes/admin/usermanagement.tsx"),
      route("insert", "routes/admin/insert.tsx", [
        route("book", "routes/admin/insert/book.tsx"),
        route("media", "routes/admin/insert/media.tsx"),
        route("device", "routes/admin/insert/device.tsx"),
      ]),
      route("edit/book/:itemId", "routes/admin/edit/book.tsx"),
      route("edit/media/:itemId", "routes/admin/edit/media.tsx"),
      route("edit/device/:itemId", "routes/admin/edit/device.tsx"),
    ]),
  ]),
] satisfies RouteConfig;