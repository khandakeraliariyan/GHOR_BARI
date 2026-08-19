import assert from "node:assert/strict";
import { By, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin } from "./helpers/auth.js";

describe("Profile page", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
        await quickLogin(driver, "User");
    });

    after(async () => {
        await driver.quit();
    });

    it("renders the profile overview with the account's email", async () => {
        await driver.get(`${BASE_URL}/profile`);

        const heading = await driver.wait(
            until.elementLocated(By.xpath("//h1[contains(., 'Profile') and contains(., 'Overview')]")),
            20000
        );
        assert.ok(await heading.isDisplayed());

        const emailLine = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(., 'torr@gmail.com')]")),
            15000
        );
        assert.ok(await emailLine.isDisplayed());
    });

    it("toggles into edit mode and back out via Cancel without saving", async () => {
        await driver.get(`${BASE_URL}/profile`);

        const editButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Edit Profile')]")),
            20000
        );
        await editButton.click();

        // In edit mode, the "Edit Profile" button is replaced by icon-only
        // confirm (check icon) / cancel (X icon) buttons — neither has text.
        const cancelButton = await driver.wait(
            until.elementLocated(By.css("button:has(svg.lucide-x)")),
            10000
        );

        const editButtonsGone = await driver.findElements(
            By.xpath("//button[contains(., 'Edit Profile')]")
        );
        assert.equal(editButtonsGone.length, 0);

        await cancelButton.click();

        const editButtonBack = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Edit Profile')]")),
            15000
        );
        assert.ok(await editButtonBack.isDisplayed());
    });
});
