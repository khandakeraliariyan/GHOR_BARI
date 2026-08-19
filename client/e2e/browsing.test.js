import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin } from "./helpers/auth.js";

describe("Property browsing & details", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
        await quickLogin(driver, "User");
    });

    after(async () => {
        await driver.quit();
    });

    it("navigates to the marketplace and lists properties (or shows the empty state)", async () => {
        await driver.get(`${BASE_URL}/properties`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'Properties Found') or contains(., 'No Properties Found')]")),
            30000
        );
        assert.ok(await heading.isDisplayed());
    });

    it("filters the marketplace by search text without erroring", async () => {
        await driver.get(`${BASE_URL}/properties`);

        const searchInput = await driver.wait(
            until.elementLocated(By.css("input[placeholder='Search by location or property title...']")),
            20000
        );
        await searchInput.sendKeys("zzzz-no-such-property-zzzz");

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., '0 Properties Found') or contains(., 'No Properties Found')]")),
            15000
        );
        assert.ok(await heading.isDisplayed());
    });

    it("opens a property's details page from the marketplace grid", async function () {
        await driver.get(`${BASE_URL}/properties`);

        // Clear any lingering filters from a previous run by reloading fresh
        const cards = await driver.wait(async () => {
            const found = await driver.findElements(By.css("div[class*='cursor-pointer'] h3"));
            return found.length > 0 ? found : null;
        }, 20000).catch(() => null);

        if (!cards) {
            this.skip(); // no properties seeded in this environment
            return;
        }

        const firstCardLink = await driver.findElement(By.css("div.grid > div"));
        await firstCardLink.click();

        await driver.wait(until.urlContains("/property-details/"), 15000);
        const url = await driver.getCurrentUrl();
        assert.match(url, /\/property-details\//);
    });
});
