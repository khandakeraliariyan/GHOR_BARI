import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";

describe("Static pages", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("renders the About page without requiring login", async () => {
        await driver.get(`${BASE_URL}/about`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'GhorBari')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());
        assert.ok(!(await driver.getCurrentUrl()).includes("/login"));
    });

    it("renders the Privacy Policy page without requiring login", async () => {
        await driver.get(`${BASE_URL}/privacy-policy`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'Policy')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());
    });

    it("renders the Trust & Safety page without requiring login", async () => {
        await driver.get(`${BASE_URL}/trust-safety`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'Safety')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());
    });

    it("shows the 404 page for an unknown route", async () => {
        await driver.get(`${BASE_URL}/this-route-does-not-exist`);

        // Error404Page renders its own heading; just confirm we did not
        // silently land on a real route.
        await driver.sleep(1000);
        const url = await driver.getCurrentUrl();
        assert.ok(url.includes("/this-route-does-not-exist"));
    });
});

describe("Private route guards (logged out)", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
    });

    after(async () => {
        await driver.quit();
    });

    const guardedRoutes = [
        "/properties",
        "/list-property",
        "/add-property",
        "/profile",
        "/chat",
        "/compare",
        "/wishlist",
    ];

    guardedRoutes.forEach((route) => {
        it(`redirects ${route} to /login when logged out`, async () => {
            await driver.get(`${BASE_URL}${route}`);

            await driver.wait(until.urlContains("/login"), 15000);
            assert.ok((await driver.getCurrentUrl()).includes("/login"));
        });
    });
});
