import assert from "node:assert/strict";
import { By, Key, until } from "selenium-webdriver";
import { buildDriver, BASE_URL } from "./helpers/driver.js";
import { quickLogin, logout } from "./helpers/auth.js";

describe("Login / Register flow", function () {
    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await buildDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("shows a validation error when submitting the login form empty", async () => {
        await driver.get(`${BASE_URL}/login`);

        const signInButton = await driver.wait(
            until.elementLocated(By.xpath("//button[@type='submit' and contains(., 'Sign In')]")),
            15000
        );
        await signInButton.click();

        const emailError = await driver.wait(
            until.elementLocated(By.xpath("//p[contains(., 'Email is required')]")),
            10000
        );
        assert.ok(await emailError.isDisplayed());
    });

    it("rejects an invalid email/password combination", async () => {
        await driver.get(`${BASE_URL}/login`);

        const emailInput = await driver.wait(
            until.elementLocated(By.css("input[type='email']")),
            15000
        );
        await emailInput.sendKeys("no-such-user@example.com");

        const passwordInput = await driver.findElement(By.css("input[type='password']"));
        await passwordInput.sendKeys("WrongPassword123");

        const signInButton = await driver.findElement(
            By.xpath("//button[@type='submit' and contains(., 'Sign In')]")
        );
        await signInButton.click();

        // The error toast auto-dismisses quickly (react-hot-toast, 3s), so
        // assert on the durable outcome instead of racing its animation:
        // a failed login must never navigate the user away from /login.
        await driver.sleep(3000);
        assert.ok((await driver.getCurrentUrl()).includes("/login"));
    });

    it("logs in with the seeded quick-login user account and can log out", async () => {
        await quickLogin(driver, "User");

        assert.ok(!(await driver.getCurrentUrl()).includes("/login"));

        await logout(driver);

        const loginLink = await driver.findElement(By.xpath("//a[contains(., 'Login')]"));
        assert.ok(await loginLink.isDisplayed());
    });

    it("flags a mismatched confirm-password field on the register form", async () => {
        await driver.get(`${BASE_URL}/register`);

        const passwordInput = await driver.wait(
            until.elementLocated(By.css("input[name='password']")),
            15000
        );
        await passwordInput.sendKeys("Password1");

        const confirmInput = await driver.findElement(By.css("input[name='confirmPassword']"));
        await confirmInput.sendKeys("Password2");
        await confirmInput.sendKeys(Key.TAB);

        const submitButton = await driver.findElement(
            By.xpath("//button[@type='submit' and contains(., 'Create Account')]")
        );
        await submitButton.click();

        const mismatchError = await driver.wait(
            until.elementLocated(By.xpath("//p[contains(., 'Passwords do not match')]")),
            10000
        );
        assert.ok(await mismatchError.isDisplayed());
    });
});
