import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:5173";

export async function buildDriver() {
    const options = new chrome.Options();

    if (process.env.HEADLESS !== "false") {
        options.addArguments("--headless=new");
    }

    options.addArguments(
        "--window-size=1440,900",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage"
    );

    return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}
