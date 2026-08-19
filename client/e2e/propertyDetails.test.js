import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin } from "./helpers/auth.js";

async function openFirstPropertyDetails(driver) {
    await driver.get(`${BASE_URL}/properties`);

    // Note: a bare `div.grid > div` selector also matches the page
    // Footer's link-column grid (which renders immediately, well before
    // the property cards load), so it can click the wrong element. The
    // card's own root div carries a `cursor-pointer` class the footer
    // never uses, and a click on it still bubbles up to the wrapping
    // <div onClick={...}> in BuyOrRentPage that triggers navigation.
    const cards = await driver.wait(async () => {
        const found = await driver.findElements(By.css("div[class*='cursor-pointer'][class*='rounded-lg']"));
        return found.length > 0 ? found : null;
    }, 20000).catch(() => null);

    if (!cards) {
        return false;
    }

    await cards[0].click();
    await driver.wait(until.urlContains("/property-details/"), 15000);
    return true;
}

describe("Property details page", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
        await quickLogin(driver, "User");
    });

    after(async () => {
        await driver.quit();
    });

    it("renders the property title, price and AI appraisal panel", async function () {
        const opened = await openFirstPropertyDetails(driver);
        if (!opened) {
            this.skip(); // no properties seeded in this environment
            return;
        }

        const heading = await driver.wait(until.elementLocated(By.css("h1")), 20000);
        assert.ok((await heading.getText()).length > 0);

        const appraisalPanel = await driver.wait(
            until.elementLocated(By.xpath("//h3[contains(., 'AI Market Appraisal')]")),
            15000
        );
        assert.ok(await appraisalPanel.isDisplayed());
    });
});
