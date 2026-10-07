import { chromium } from 'playwright';
import dotenv from "dotenv";
//import fs from "fs";

dotenv.config();
// Credentials live in .env (gitignored) — never hardcode them in a public repo.

const ORANGE_HRM_USER = process.env.ORANGE_HRM_USER;
const ORANGE_HRM_PASS = process.env.ORANGE_HRM_PASS;

async function saveSession() {

    let browser = await chromium.launch({ headless: false });
    let context = await browser.newContext();
    let page = await context.newPage();

    await page.goto("https://opensource-demo.orangehrmlive.com/");

    const userName = page.getByPlaceholder('Username');
    const passWord = page.getByPlaceholder('Password');
    const loginBtn = page.getByRole('button', { name: "Login" });

    await userName.fill(ORANGE_HRM_USER!);
    await passWord.fill(ORANGE_HRM_PASS!);

    await loginBtn.click();

    // await page.waitForURL(/#\/(dashboard|home)/, { timeout: 15000 });

    await page.waitForURL(/dashboard/, { timeout: 15000 });

    await context.storageState({ path: "./user-session.json" });
    console.log("Session saved to user-session.json ✅");

    await browser.close();

    // // Read the file
    // const data = fs.readFileSync("./user-session.json", "utf-8");

    // // Parse JSON
    // const session = JSON.parse(data);

    // // Display full content
    // console.log("Session storage content:", session);

    // // If you want to see cookies only
    // console.log("Cookies:", session.cookies);

    // // If you want to see localStorage/sessionStorage
    // console.log("Origins:", session.origins);
}
saveSession();