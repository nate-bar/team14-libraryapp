// vite.config.ts
import { reactRouter } from "file:///C:/Software/Git/team14-libraryapp/node_modules/@react-router/dev/dist/vite.js";
import tailwindcss from "file:///C:/Software/Git/team14-libraryapp/node_modules/@tailwindcss/vite/dist/index.mjs";
import { defineConfig } from "file:///C:/Software/Git/team14-libraryapp/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///C:/Software/Git/team14-libraryapp/node_modules/vite-tsconfig-paths/dist/index.js";
var vite_config_default = defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild ? {
      input: "./server/app.ts"
    } : void 0
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()]
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxTb2Z0d2FyZVxcXFxHaXRcXFxcdGVhbTE0LWxpYnJhcnlhcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFNvZnR3YXJlXFxcXEdpdFxcXFx0ZWFtMTQtbGlicmFyeWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovU29mdHdhcmUvR2l0L3RlYW0xNC1saWJyYXJ5YXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcmVhY3RSb3V0ZXIgfSBmcm9tIFwiQHJlYWN0LXJvdXRlci9kZXYvdml0ZVwiO1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcIkB0YWlsd2luZGNzcy92aXRlXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgaXNTc3JCdWlsZCB9KSA9PiAoe1xyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiBpc1NzckJ1aWxkXHJcbiAgICAgID8ge1xyXG4gICAgICAgICAgaW5wdXQ6IFwiLi9zZXJ2ZXIvYXBwLnRzXCIsXHJcbiAgICAgICAgfVxyXG4gICAgICA6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFt0YWlsd2luZGNzcygpLCByZWFjdFJvdXRlcigpLCB0c2NvbmZpZ1BhdGhzKCldLFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlIsU0FBUyxtQkFBbUI7QUFDelQsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFFMUIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxXQUFXLE9BQU87QUFBQSxFQUMvQyxPQUFPO0FBQUEsSUFDTCxlQUFlLGFBQ1g7QUFBQSxNQUNFLE9BQU87QUFBQSxJQUNULElBQ0E7QUFBQSxFQUNOO0FBQUEsRUFDQSxTQUFTLENBQUMsWUFBWSxHQUFHLFlBQVksR0FBRyxjQUFjLENBQUM7QUFDekQsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
