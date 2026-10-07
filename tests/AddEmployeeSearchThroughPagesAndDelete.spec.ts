import { test, Page, expect } from "@playwright/test";
import path from 'path';

test.use({
    storageState: './user-session.json',
    screenshot: 'only-on-failure',
});

// Checks page 1, 2, 3 ... until the employee id is found, then deletes it.
// Returns true if deleted, false if the id was not found on any page.
async function deleteEmployeeFromAllPages(page: Page, employeeId: string): Promise<boolean> {
    const nextButton = page.locator('button:has(i.bi-chevron-right)');

    while (true) {
        // wait for the table rows of the current page
        await page.locator('.oxd-table-card').first().waitFor();

        // rows on this page whose Id cell exactly equals employeeId
        const row = page.locator('.oxd-table-card').filter({
            has: page.locator(`div:text-is("${employeeId}")`),
        });

        if (await row.count() > 0) {
            await row.locator('button:has(i.bi-trash)').click();
            await page.getByRole('button', { name: 'Yes, Delete' }).click();
            await expect(page.locator('.oxd-toast')).toContainText(/Successfully Deleted/i);
            return true;
        }

        // not on this page: if there is no ">" button, this was the last page
        if (await nextButton.count() === 0) {
            return false;
        }

        await nextButton.click();
        await page.waitForLoadState('networkidle'); // let the next page load
    }
}

test("Add --> Delete Employee by scanning all pages @ForQA", async ({ page }) => {
    test.setTimeout(120000);

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const ddmmyy = `${dd}${mm}${yy}`;

    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index");

    const pimLink = page.getByRole('link', { name: 'PIM' });
    await pimLink.click();
    await page.getByRole('button', { name: 'Add' }).click();

    await page.locator('[name="firstName"]').fill(`F${ddmmyy}`);
    await page.locator('[name="middleName"]').fill(`M${ddmmyy}`);
    await page.locator('[name="lastName"]').fill(`L${ddmmyy}`);

    const filePath = path.join(__dirname, '..', 'Imgs', 'Pic.png');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.oxd-toast')).toContainText(/Successfully Saved/i);

    // capture the Employee Id
    const employeeIdInput = page.locator("//label[normalize-space()='Employee Id']/following::input[1]");
    await expect(employeeIdInput).not.toHaveValue('');
    const employeeId = await employeeIdInput.inputValue();
    console.log("Captured Employee Id:", employeeId);

    // open the employee list and delete from whichever page it is on
    await pimLink.click();
    expect(await deleteEmployeeFromAllPages(page, employeeId)).toBe(true);

    // check again: the id should not be found on any page now
    await pimLink.click();
    expect(await deleteEmployeeFromAllPages(page, employeeId)).toBe(false);
});

test.only("Delete Employee by scanning all pages @ForQA", async ({ page }) => {
    test.setTimeout(120000);

    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index");

    const pimLink = page.getByRole('link', { name: 'PIM' });
    await pimLink.click();

    // capture the Employee Id
    const employeeId = '0323';
    
    // open the employee list and delete from whichever page it is on
    await pimLink.click();
    expect(await deleteEmployeeFromAllPages(page, employeeId)).toBe(true);

    // check again: the id should not be found on any page now
    await pimLink.click();
    expect(await deleteEmployeeFromAllPages(page, employeeId)).toBe(false);
});