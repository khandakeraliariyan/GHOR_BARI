import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin } from "./helpers/auth.js";

// Covers the admin routes not already exercised by admin.test.js
// (dashboard home, all-users, all-properties). Note: a
// PendingPropertyListings.jsx component exists in the source tree but is
// not wired into the router or the sidebar nav (see DashboardLayout.jsx's
// navItems) — it has no reachable URL, so there is nothing to test here.
describe("Remaining admin dashboard pages", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
        await quickLogin(driver, "Admin");
    });

    after(async () => {
        await driver.quit();
    });

    it("loads the Pending User Verifications page", async () => {
        await driver.get(`${BASE_URL}/admin-dashboard/pending-verifications`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'User Verification Management')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());
    });

    it("loads the Revenue Analytics page", async () => {
        await driver.get(`${BASE_URL}/admin-dashboard/revenue`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'Revenue Analytics')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());
    });
});
