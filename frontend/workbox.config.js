// Workbox configuration for service worker
module.exports = {
    // Generate service worker
    swDest: "dist/sw.js",

    // Cache strategies
    runtimeCaching: [
        // Google Fonts
        {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts",
                expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        },
        {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts-stylesheets",
                expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        },

        // Images
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: "CacheFirst",
            options: {
                cacheName: "images",
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                    statuses: [200],
                },
            },
        },

        // Fonts
        {
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: "CacheFirst",
            options: {
                cacheName: "fonts",
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                    statuses: [200],
                },
            },
        },

        // Static assets (JS, CSS)
        {
            urlPattern: /\.(?:js|css|mjs)$/,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-resources",
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                    statuses: [200],
                },
            },
        },

        // API calls
        {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
                cacheName: "api-cache",
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 5, // 5 minutes
                },
                cacheableResponse: {
                    statuses: [200],
                },
                networkTimeoutSeconds: 3,
            },
        },

        // HTML pages
        {
            urlPattern: /\.(?:html)$/,
            handler: "NetworkFirst",
            options: {
                cacheName: "html-cache",
                expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
                cacheableResponse: {
                    statuses: [200],
                },
            },
        },
    ],

    // Skip waiting and claim clients
    skipWaiting: true,
    clientsClaim: true,

    // Clean up outdated caches
    cleanupOutdatedCaches: true,

    // Maximum file size to cache
    maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB

    // Navigation preload
    navigationPreload: true,

    // Offline fallback
    offlineGoogleAnalytics: false,

    // Additional options
    mode: "production",
    sourcemap: false,
};
