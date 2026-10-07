import { test, Page, expect } from "@playwright/test";

test.use({
    storageState: './user-session.json',
    screenshot: 'only-on-failure',
});

// Scans page 1, 2, 3 ... and deletes the FIRST record that has this employee id.
// Returns true if one record was deleted, false if no record was found on any page.
async function deleteOneEmployee(page: Page, employeeId: string): Promise<boolean> {
    const nextButton = page.locator('button:has(i.bi-chevron-right)');

    while (true) {
        // wait for the table rows of the current page
        await page.locator('.oxd-table-card').first().waitFor();

        // rows on this page whose Id cell exactly equals employeeId
        const rows = page.locator('.oxd-table-card').filter({
            has: page.locator(`div:text-is("${employeeId}")`),
        });

        if (await rows.count() > 0) {
            // .first() because many rows can have the same id
            await rows.first().locator('button:has(i.bi-trash)').click();
            await page.getByRole('button', { name: 'Yes, Delete' }).click();
            await expect(page.locator('.oxd-toast')).toContainText(/Successfully Deleted/i);
            // wait for the toast to disappear so the table has refreshed
            await page.locator('.oxd-toast').waitFor({ state: 'detached' });
            return true;
        }

        // not on this page: no ">" button means this was the last page
        if (await nextButton.count() === 0) {
            return false;
        }

        await nextButton.click();
        await page.waitForLoadState('networkidle'); // let the next page load
    }
}

// Keeps deleting (always starting again from page 1) until no record with this id is left.
// Returns how many records were deleted.
async function deleteAllWithEmployeeId(page: Page, employeeId: string): Promise<number> {
    let deletedCount = 0;

    while (true) {
        await page.getByRole('link', { name: 'PIM' }).click(); // goes back to page 1

        const deleted = await deleteOneEmployee(page, employeeId);
        if (!deleted) {
            return deletedCount;
        }
        deletedCount++;
    }
}

test.only("Delete duplicate Employee Id records by scanning all pages @ForQA", async ({ page }) => {
    test.setTimeout(300000); // many records, each delete takes a few seconds

    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index");

    const employeeId = 'ATPValue';

    const deletedCount = await deleteAllWithEmployeeId(page, employeeId);
    console.log(`Deleted ${deletedCount} record(s) with Employee Id ${employeeId}`);

    if (deletedCount > 0) {
        console.log(`Deleted ${deletedCount} record(s)`);
        expect(deletedCount).toBeGreaterThan(0);
    } else {
        console.log(`No records found with Employee Id ${employeeId}`);
        expect(deletedCount).toBe(0);
    }

    // check again: nothing should be left on any page
    await page.getByRole('link', { name: 'PIM' }).click();
    expect(await deleteOneEmployee(page, employeeId)).toBe(false);
});