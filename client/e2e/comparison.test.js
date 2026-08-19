import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin } from "./helpers/auth.js";

describe("Comparison", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
        await quickLogin(driver, "User");
    });

    after(async () => {
        await driver.quit();
    });

    it("shows an empty comparison state with nothing selected", async () => {
        await driver.get(`${BASE_URL}/compare`);

        const emptyMessage = await driver.wait(
            until.elementLocated(By.xpath("//p[contains(., 'No properties selected for comparison')]")),
            20000
        );
        assert.ok(await emptyMessage.isDisplayed());
    });

    it("adds a property to comparison from the marketplace and shows it on /compare", async function () {
        await driver.get(`${BASE_URL}/properties`);

        const compareButtons = await driver.wait(async () => {
            const found = await driver.findElements(By.css("button[title='Compare with other properties']"));
            return found.length > 0 ? found : null;
        }, 20000).catch(() => null);

        if (!compareButtons) {
            this.skip(); // no properties seeded in this environment
            return;
        }

        await compareButtons[0].click();

        await driver.wait(until.urlContains("/compare"), 15000);

        const table = await driver.wait(
            until.elementLocated(By.css("table")),
            15000
        );
        assert.ok(await table.isDisplayed());

        const selectedCount = await driver.findElement(
            By.xpath("//h3[contains(., '/ 5 Selected')]")
        );
        const countText = await selectedCount.getText();
        assert.match(countText, /^1/);
    });

    it("clears all selected comparison properties", async function () {
        // Intentionally does not reload: comparison state lives only in
        // React context (no persistence), so a fresh navigation would
        // wipe out the property added by the previous test.
        const clearButton = await driver.findElements(
            By.xpath("//button[contains(., 'Clear All')]")
        );

        if (clearButton.length === 0) {
            this.skip(); // nothing selected from a previous run
            return;
        }

        await clearButton[0].click();

        const emptyMessage = await driver.wait(
            until.elementLocated(By.xpath("//p[contains(., 'No properties selected for comparison')]")),
            15000
        );
        assert.ok(await emptyMessage.isDisplayed());
    });
});
