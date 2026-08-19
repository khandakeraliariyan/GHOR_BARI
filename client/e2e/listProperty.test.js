import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin } from "./helpers/auth.js";

describe("List Property / Add Property (owner flow)", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
        await quickLogin(driver, "User");
    });

    after(async () => {
        await driver.quit();
    });

    it("loads the owner dashboard with stats and a listings/requests tab switch", async () => {
        await driver.get(`${BASE_URL}/list-property`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'My Properties')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());

        const requestsTab = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'My Requested Properties')]")),
            15000
        );
        await requestsTab.click();

        const requestsHeading = await driver.wait(
            until.elementLocated(By.xpath("//h2[contains(., 'My Requested Properties')]")),
            15000
        );
        assert.ok(await requestsHeading.isDisplayed());
    });

    it("navigates to /add-property via the 'Add New Property' button", async () => {
        await driver.get(`${BASE_URL}/list-property`);

        const addButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Add New Property')]")),
            20000
        );
        await addButton.click();

        await driver.wait(until.urlContains("/add-property"), 15000);
        assert.match(await driver.getCurrentUrl(), /\/add-property/);
    });

    it("flags the title field when submitting the add-property form empty", async () => {
        await driver.get(`${BASE_URL}/add-property`);

        const submitButton = await driver.wait(
            until.elementLocated(By.css("button[type='submit']")),
            20000
        );
        await submitButton.click();

        // Note: contains(text(), ...) only matches an element's *first*
        // text-node child; this error <span> has an icon before its
        // message text, splitting the content across two text nodes.
        // contains(., ...) matches the full descendant text instead.
        const titleError = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(., 'Title is required')]")),
            10000
        );
        assert.ok(await titleError.isDisplayed());
    });
});
