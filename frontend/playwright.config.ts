import { defineConfig, devices } from "@playwright/test";

const setup_auth_name = "setup:auth";
const setup_auth_file = "e2e/.auth/user.json";

const browser_list = [
    {
        name: "chrome",
        device: "Desktop Chrome",
    },
    {
        name: "firefox",
        device: "Desktop Firefox",
    },
    {
        name: "safari",
        device: "Desktop Safari",
    },
];

const get_projects = (
    name_prefix: string,
    testMatch: RegExp,
    dependencies: string[] = [],
    use: { [key: string]: string } = {}
) => {
    return browser_list.map((br) => {
        const name = `${name_prefix}:${br.name}`;
        return {
            name,
            use: {
                ...devices[br.device],
                ...use,
            },
            testMatch,
            dependencies: [...dependencies],
        };
    });
};

const projects_login = get_projects("test:login", /login\.spec\.ts/, [], {});
const projects_storage = get_projects("test:storage", /storage\.spec\.ts/, [setup_auth_name], {
    storageState: setup_auth_file,
});

export default defineConfig({
    testDir: "./e2e",
    timeout: 30_000,
    expect: {
        timeout: 15_000,
        toHaveScreenshot: { threshold: 0.2 },
        toMatchSnapshot: { threshold: 0.2 },
    },
    fullyParallel: true,
    forbidOnly: !!process.env["CI"],
    retries: process.env["CI"] ? 2 : 0,
    workers: process.env["CI"] ? 1 : 4,
    reporter: [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["json", { outputFile: "test-results/results.json" }],
        ["junit", { outputFile: "test-results/results.xml" }],
    ],
    use: {
        baseURL: process.env["PLAYWRIGHT_BASE_URL"] || "http://localhost:8080",
        trace: "on-first-retry",
        video: "retain-on-failure",
        screenshot: "only-on-failure",
        testIdAttribute: "data-testid",
        viewport: { width: 1280, height: 800 },
        actionTimeout: 10_000,
        navigationTimeout: 30_000,
        ignoreHTTPSErrors: true,
    },
    webServer: {
        command: "npm run preview",
        url: "http://localhost:3000",
        timeout: 120_000,
        reuseExistingServer: !process.env["CI"],
        stdout: "pipe",
        stderr: "pipe",
    },
    projects: [
        ...projects_login,
        {
            name: setup_auth_name,
            testMatch: /.*fixtures\/auth\.setup\.ts/,
            dependencies: projects_login.map((p) => p.name),
        },
        ...projects_storage,
    ],
});
