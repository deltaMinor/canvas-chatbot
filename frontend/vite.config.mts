import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import svgrPlugin from "vite-plugin-svgr";

export default defineConfig(({ mode, command }) => {
    // Loads `.env`, `.env.local`, `.env.[mode]`, etc. from the project root
    // (Vite's standard convention) and merges them into `process.env` so
    // this config file itself (not just client code via `import.meta.env`)
    // can read them - e.g. VITE_PORT, VITE_API_PROXY_TARGET below.
    Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

    const isProduction = mode === "production";
    const isDev = command === "serve";
    const isPwaDisabled = process.env["VITE_DISABLE_PWA_PLUGIN"] === "TRUE";
    const apiRedirectBaseUrl = (process.env["VITE_API_REDIRECT_BASE_URL"] || "").replace(
        /\/+$/,
        ""
    );

    return {
        plugins: [
            {
                name: "redirect-api-fallthrough",
                configureServer(server) {
                    // Registered as a post-hook (returning a function) so it
                    // runs *after* Vite's own internal `server.proxy`
                    // middleware - the proxy configured above should get
                    // first chance at any `/api/*` request, and this only
                    // acts as a fallback for anything it didn't handle.
                    return () => {
                        server.middlewares.use((req, res, next) => {
                            if (req.url?.startsWith("/api/")) {
                                if (apiRedirectBaseUrl) {
                                    res.writeHead(302, {
                                        Location: apiRedirectBaseUrl,
                                    });
                                    res.end();
                                    return;
                                }
                                res.writeHead(404, { "Content-Type": "application/json" });
                                res.end(JSON.stringify({ detail: "Not found" }));
                                return;
                            }
                            next();
                        });
                    };
                },
            },
            react({
                jsxImportSource: "@emotion/react",
            }),
            svgrPlugin({
                svgrOptions: {
                    icon: true,
                },
            }),
            tailwindcss(),
            ...(isPwaDisabled
                ? []
                : [
                      VitePWA({
                          registerType: "autoUpdate",
                          includeAssets: ["**/*.{png,ico,svg,woff2}"],
                          injectRegister: "auto",
                          devOptions: {
                              enabled: isDev,
                              type: "module",
                          },
                          workbox: {
                              globPatterns: ["**/*.{js,css,html,woff2}"],
                              cleanupOutdatedCaches: true,
                              clientsClaim: true,
                              skipWaiting: true,
                              maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
                              runtimeCaching: [
                                  {
                                      urlPattern: ({ request }) =>
                                          request.destination === "image" &&
                                          request.url.endsWith(".svg"),
                                      handler: "CacheFirst",
                                      options: {
                                          cacheName: "images-svg",
                                          expiration: {
                                              maxEntries: 100,
                                              maxAgeSeconds: 30 * 24 * 60 * 60,
                                          },
                                          cacheableResponse: {
                                              statuses: [200],
                                          },
                                      },
                                  },
                                  {
                                      urlPattern: ({ request }) => request.destination === "font",
                                      handler: "CacheFirst",
                                      options: {
                                          cacheName: "fonts",
                                          expiration: {
                                              maxEntries: 50,
                                              maxAgeSeconds: 365 * 24 * 60 * 60,
                                          },
                                          cacheableResponse: {
                                              statuses: [200],
                                          },
                                      },
                                  },
                                  {
                                      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                                      handler: "CacheFirst",
                                      options: {
                                          cacheName: "google-fonts",
                                          expiration: {
                                              maxEntries: 10,
                                              maxAgeSeconds: 365 * 24 * 60 * 60,
                                          },
                                          cacheableResponse: {
                                              statuses: [0, 200],
                                          },
                                      },
                                  },
                                  {
                                      urlPattern: /^https:\/\/api\./i,
                                      handler: "NetworkFirst",
                                      options: {
                                          cacheName: "api-cache",
                                          expiration: {
                                              maxEntries: 50,
                                              maxAgeSeconds: 5 * 60,
                                          },
                                          cacheableResponse: {
                                              statuses: [200],
                                          },
                                      },
                                  },
                              ],
                          },
                          manifest: {
                              name: "ITMP - Integrative Threat Modelling Project",
                              short_name: "ITMP",
                              description:
                                  "A web application designed to identify, assess, and mitigate threats in complex systems.",
                              icons: [
                                  {
                                      src: "favicon.ico",
                                      sizes: "64x64 32x32 24x24 16x16",
                                      type: "image/x-icon",
                                  },
                              ],
                              theme_color: "#1976d2",
                              background_color: "#ffffff",
                              scope: "/",
                              start_url: "/",
                              display: "standalone",
                              lang: "en",
                              orientation: "portrait-primary",
                              categories: ["productivity", "utilities"],
                              shortcuts: [
                                  {
                                      name: "Dashboard",
                                      short_name: "Dashboard",
                                      description: "Go to dashboard",
                                      url: "/dashboard",
                                      icons: [{ src: "favicon.ico", sizes: "96x96" }],
                                  },
                              ],
                          },
                      }),
                  ]),
        ],

        resolve: {
            alias: {
                "#root": path.resolve(__dirname, "./src"),
                src: path.resolve(__dirname, "./src"),
            },
            extensions: [".ts", ".tsx", ".json", ".png", ".js", ".jsx", ".mjs", ".mts"],
            dedupe: ["react", "react-dom"],
            tsconfigPaths: true,
        },

        publicDir: "public",

        optimizeDeps: {
            include: [
                "@mui/material",
                "@mui/icons-material",
                "@emotion/react",
                "@emotion/styled",
                "react",
                "react-dom",
                "react-router-dom",
                "@reduxjs/toolkit",
                "react-redux",
                "axios",
                "lodash",
            ],
            // exclude: ["@xyflow/react"],
            force: false,
        },

        build: {
            outDir: "dist",
            manifest: true,
            sourcemap: isDev ? "inline" : false,
            minify: isProduction ? "esbuild" : false,
            target: "esnext",
            cssCodeSplit: true,
            chunkSizeWarningLimit: 1500,
            commonjsOptions: {
                include: [/node_modules/],
                transformMixedEsModules: true,
            },
            rollupOptions: {
                output: {
                    entryFileNames: isProduction ? "assets/[name].[hash].js" : "assets/[name].js",
                    chunkFileNames: isProduction ? "assets/[name].[hash].js" : "assets/[name].js",
                    assetFileNames: isProduction
                        ? "assets/[name].[hash].[ext]"
                        : "assets/[name].[ext]",
                },
            },
            cacheDir: "node_modules/.vite",
        },

        server: {
            host: process.env["VITE_HOST"] || "0.0.0.0",
            port: Number(process.env["VITE_PORT"]) || 39173,
            open: isDev,
            cors: true,
            allowedHosts: ["localhost", "127.0.0.1"],
            // This demo removes the nginx reverse proxy the full application
            // normally sits behind. The frontend's API clients assume the
            // backend lives on the same origin (`window.location.origin`),
            // so instead we proxy API requests straight to the single
            // collapsed Django backend during local dev.
            proxy: {
                "/api": {
                    target: process.env["VITE_API_PROXY_TARGET"] || "http://localhost:39006",
                    changeOrigin: true,
                },
            },
            watch: {
                ignored: [
                    "**/node_modules/**",
                    "**/dist/**",
                    "**/.git/**",
                    "**/coverage/**",
                    "**/test-results/**",
                    "**/playwright-report/**",
                    "**/temp/**",
                    "**/*.log",
                    "**/.DS_Store",
                    "**/Thumbs.db",
                ],
                usePolling: false,
                interval: 500,
                binaryInterval: 500,
            },
            hmr: {
                overlay: true,
                clientPort: Number(process.env["VITE_PORT"]) || 39173,
                port: Number(process.env["VITE_PORT"]) || 39173,
            },
            middlewareMode: false,
            fs: {
                strict: false,
                allow: [".."],
            },
        },

        preview: {
            host: process.env["VITE_HOST"] || "localhost",
            port: Number(process.env["VITE_PORT"]) || 39174,
            open: true,
        },

        css: {
            devSourcemap: isDev,
        },

        define: {
            __APP_VERSION__: JSON.stringify(process.env["npm_package_version"]),
            global: "globalThis",
        },

        experimental: {
            renderBuiltUrl(filename, { hostType }) {
                if (hostType === "js") {
                    return { js: `/${filename}` };
                } else {
                    return { relative: true };
                }
            },
        },
    };
});
