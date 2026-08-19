import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin } from "./helpers/auth.js";

describe("Chat page", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
        await quickLogin(driver, "User");
    });

    after(async () => {
        await driver.quit();
    });

    it("loads the Messages panel", async () => {
        await driver.get(`${BASE_URL}/chat`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'Messages')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());
    });

    it("shows either the conversation list or the empty-chats message", async () => {
        await driver.get(`${BASE_URL}/chat`);

        const listOrEmpty = await driver.wait(
            until.elementLocated(By.xpath(
                "//p[contains(., 'No active chats')] | //input[@placeholder='Search conversations...']"
            )),
            20000
        );
        assert.ok(await listOrEmpty.isDisplayed());
    });
});
