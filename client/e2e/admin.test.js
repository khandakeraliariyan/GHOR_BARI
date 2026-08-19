import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin } from "./helpers/auth.js";

describe("Admin dashboard", function () {
    this.timeout(60000);

    describe("as an Admin account", () => {
        let driver;

        before(async () => {
            driver = await buildDriver();
            await quickLogin(driver, "Admin");
        });

        after(async () => {
            await driver.quit();
        });

        it("loads the admin dashboard home with system stats", async () => {
            await driver.get(`${BASE_URL}/admin-dashboard`);

            const heading = await driver.wait(
                until.elementLocated(By.xpath("//h1[contains(., 'GhorBari Admin Dashboard')]")),
                20000
            );
            assert.ok(await heading.isDisplayed());
        });

        it("loads the All Users management page", async () => {
            await driver.get(`${BASE_URL}/admin-dashboard/all-users`);

            const heading = await driver.wait(
                until.elementLocated(By.xpath("//h1[contains(., 'All Users')]")),
                20000
            );
            assert.ok(await heading.isDisplayed());
        });

        it("loads the All Property Listings management page", async () => {
            await driver.get(`${BASE_URL}/admin-dashboard/all-properties`);

            const heading = await driver.wait(
                until.elementLocated(By.xpath("//h1[contains(., 'All Property Listings')]")),
                20000
            );
            assert.ok(await heading.isDisplayed());
        });
    });

    describe("access control for non-admin accounts", () => {
        let driver;

        before(async () => {
            driver = await buildDriver();
            await quickLogin(driver, "User");
        });

        after(async () => {
            await driver.quit();
        });

        it("ejects a logged-in non-admin user who navigates to /admin-dashboard", async () => {
            await driver.get(`${BASE_URL}/admin-dashboard`);

            // AdminRoute force-logs-out non-admin users and redirects to /login.
            await driver.wait(until.urlContains("/login"), 20000);
            assert.ok((await driver.getCurrentUrl()).includes("/login"));

            const loginLink = await driver.wait(
                until.elementLocated(By.xpath("//a[contains(., 'Login')]")),
                15000
            );
            assert.ok(await loginLink.isDisplayed());
        });
    });
});
