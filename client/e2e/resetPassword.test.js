import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";

describe("Reset password page", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("is reachable without being logged in", async () => {
        await driver.get(`${BASE_URL}/reset-password`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h2[contains(., 'Reset Password')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());
    });

    it("flags an empty submit with a required-email error", async () => {
        await driver.get(`${BASE_URL}/reset-password`);

        const submitButton = await driver.wait(
            until.elementLocated(By.xpath("//button[@type='submit' and contains(., 'Send Reset Link')]")),
            20000
        );
        await submitButton.click();

        const error = await driver.wait(
            until.elementLocated(By.xpath("//p[contains(., 'Email is required')]")),
            10000
        );
        assert.ok(await error.isDisplayed());
    });

    it("flags a malformed email address", async () => {
        await driver.get(`${BASE_URL}/reset-password`);

        const emailInput = await driver.wait(
            until.elementLocated(By.css("input[type='email']")),
            20000
        );
        // The input is type="email", so the browser's own native validation
        // blocks submission (and the React submit handler never runs) for
        // something with no "@" at all, before the app's custom regex ever
        // sees it. "test@localhost" passes native validation but fails the
        // app's stricter pattern, which requires a dotted TLD.
        await emailInput.sendKeys("test@localhost");

        const submitButton = await driver.findElement(
            By.xpath("//button[@type='submit' and contains(., 'Send Reset Link')]")
        );
        await submitButton.click();

        const error = await driver.wait(
            until.elementLocated(By.xpath("//p[contains(., 'Invalid email address')]")),
            10000
        );
        assert.ok(await error.isDisplayed());
    });

    it("shows the confirmation screen for a well-formed (non-existent) email", async () => {
        await driver.get(`${BASE_URL}/reset-password`);

        const emailInput = await driver.wait(
            until.elementLocated(By.css("input[type='email']")),
            20000
        );
        // A syntactically valid but non-existent address, so this never
        // sends a real email to a real inbox.
        await emailInput.sendKeys("e2e-test-nonexistent-user@example-ghorbari-test.invalid");

        const submitButton = await driver.findElement(
            By.xpath("//button[@type='submit' and contains(., 'Send Reset Link')]")
        );
        await submitButton.click();

        const confirmation = await driver.wait(
            until.elementLocated(By.xpath("//h2[contains(., 'Check Your Email')]")),
            15000
        );
        assert.ok(await confirmation.isDisplayed());
    });
});
