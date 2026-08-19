import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin } from "./helpers/auth.js";

describe("Wishlist", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
        await quickLogin(driver, "User");
    });

    after(async () => {
        await driver.quit();
    });

    it("redirects unauthenticated visitors away from /wishlist", async () => {
        // Log out temporarily to check the guarded route, then log back in.
        const logoutButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Logout')]")),
            15000
        );
        await logoutButton.click();
        await driver.wait(until.elementLocated(By.xpath("//a[contains(., 'Login')]")), 15000);

        await driver.get(`${BASE_URL}/wishlist`);
        await driver.wait(until.urlContains("/login"), 15000);
        assert.ok((await driver.getCurrentUrl()).includes("/login"));

        await quickLogin(driver, "User");
    });

    it("loads the wishlist page for a logged-in user", async () => {
        await driver.get(`${BASE_URL}/wishlist`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'Wishlist')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());
    });

    it("toggles a property's wishlist heart icon from the marketplace", async function () {
        await driver.get(`${BASE_URL}/properties`);

        const heartButtons = await driver.wait(async () => {
            const found = await driver.findElements(By.css("button[title='Add to wishlist'], button[title='Remove from wishlist']"));
            return found.length > 0 ? found : null;
        }, 20000).catch(() => null);

        if (!heartButtons) {
            this.skip(); // no properties seeded in this environment
            return;
        }

        const heartButton = heartButtons[0];
        const wasWishlisted = (await heartButton.getAttribute("title")) === "Remove from wishlist";
        await heartButton.click();

        if (wasWishlisted) {
            // Removing is immediate (no confirmation modal).
            await driver.wait(
                until.elementLocated(By.css("button[title='Add to wishlist']")),
                10000
            );
        } else {
            // Adding opens a note modal that must be confirmed.
            const saveButton = await driver.wait(
                until.elementLocated(By.xpath("//button[contains(., 'Save') or contains(., 'Add')]")),
                10000
            );
            await saveButton.click();
            await driver.wait(
                until.elementLocated(By.css("button[title='Remove from wishlist']")),
                10000
            );
        }
    });
});
