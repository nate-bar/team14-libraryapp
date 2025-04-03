import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("items", "routes/items.tsx"),
    route("search", "routes/search.tsx"),
    route("admin", "routes/admin.tsx"),
    route("adminedit", "routes/adminedit.tsx"),
    route("FAQ", "routes/faq.tsx"),
    route("resources", "routes/resources.tsx"),
    route("contactus", "routes/contactus.tsx"),
    route("device/:itemId", "routes/devices/DeviceDetail.tsx"),
    route("media/:itemId", "routes/media/mediaDetail.tsx"),
    route("book/:itemId", "routes/books/bookDetail.tsx"),
    route("cart", "routes/CartPage.tsx"),
    route("signup", "routes/signup/signup.tsx"),
    route("login", "routes/login/login.tsx"),
    route("profile", "routes/profile/profile.tsx", [
      route("dashboard", "routes/profile/dashboard.tsx"),
      //route("myItems", "routes/myItems.tsx"),
      //route("mailbox", "routes/mailbox.tsx"),
      //route("settings", "routes/settings.tsx"),
    ]),
  ]),
] satisfies RouteConfig;

