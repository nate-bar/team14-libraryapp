import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("events/event1", "routes/events/event1.tsx"),
    route("events/event2", "routes/events/event2.tsx"),
    route("events/event3", "routes/events/event3.tsx"),
    route("events/event4", "routes/events/event4.tsx"),
    route("about", "routes/info/about.tsx"),
    route("items", "routes/items.tsx"),
    route("search", "routes/search.tsx"),
    route("admin", "routes/admin.tsx"),
    route("FAQ", "routes/faq.tsx"),
    route("resources", "routes/resources.tsx"),
    route("contactus", "routes/contactus.tsx"),
    route("device/:itemId", "routes/devices/DeviceDetail.tsx"),
    route("media/:itemId", "routes/media/mediaDetail.tsx"),
    route("book/:itemId", "routes/books/bookDetail.tsx"),
    route("cart", "routes/CartPage.tsx"),
    route("signup", "routes/signup/signup.tsx"),
    route("login", "routes/login/login.tsx"),
    route("profile", "routes/profile.tsx"),
  ]),
] satisfies RouteConfig;
