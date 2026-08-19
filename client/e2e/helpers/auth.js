import { By, until } from "selenium-webdriver";
import { BASE_URL } from "./driver.js";

const QUICK_LOGIN_TIMEOUT = 30000;

/**
 * Logs in using one of the seeded "Quick Login" accounts exposed on the
 * login page (see client/src/Pages/LoginPage.jsx). Avoids re-typing
 * credentials for every test and exercises the real Firebase auth flow.
 */
export async function quickLogin(driver, role = "User") {
    await driver.get(`${BASE_URL}/login`);

    const quickLoginButton = await driver.wait(
        until.elementLocated(By.xpath(`//button[contains(., '${role} Account')]`)),
        QUICK_LOGIN_TIMEOUT
    );
    await quickLoginButton.click();

    // The navbar can flip to "Logout" as soon as Firebase auth resolves,
    // which happens before LoginPage finishes its async admin check and
    // navigate() call. Wait for the actual route change too, so callers
    // don't race the still-in-flight redirect.
    await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Logout')]")),
        QUICK_LOGIN_TIMEOUT
    );
    await driver.wait(async () => !(await driver.getCurrentUrl()).includes("/login"), QUICK_LOGIN_TIMEOUT);

    // The post-login "Welcome back" toast renders top-right (see main.jsx's
    // <Toaster position="top-right" />), the same corner as the navbar's
    // Logout/notification controls, and intercepts clicks there until it
    // finishes its ~3s auto-dismiss. Give it time to clear before any
    // caller tries to interact with the navbar.
    await driver.sleep(3300);
}

export async function logout(driver) {
    const logoutButton = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Logout')]")),
        QUICK_LOGIN_TIMEOUT
    );
    await logoutButton.click();

    await driver.wait(
        until.elementLocated(By.xpath("//a[contains(., 'Login')]")),
        QUICK_LOGIN_TIMEOUT
    );
}
