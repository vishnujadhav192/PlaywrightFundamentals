import { test, Page, expect } from "@playwright/test";
import path from 'path';
// Load the saved session

test.use(
    {
        storageState: './user-session.json',
        screenshot: 'only-on-failure',
    });
    
async function deleteByEmployeeId(page: Page, employeeId: string) {
    await page.locator('.oxd-input-group', { has: page.locator('label', { hasText: 'Employee Id' }) })
        .locator('input')
        .fill(employeeId);

    await page.getByRole('button', { name: 'Search' }).click();

    const row = page.locator('.oxd-table-card').filter({
        has: page.locator('.oxd-table-cell:nth-child(2) div:text-is("' + employeeId + '")'),
    });

    await expect(row).toHaveCount(1);
    await row.locator('button:has(i.bi-trash)').click();
    await page.getByRole('button', { name: 'Yes, Delete' }).click();
    await expect(page.locator('.oxd-toast')).toContainText(/Success/i);
}

test("Add --> Search --> Delete Employee @ForQA", async ({ page }) => {
    test.setTimeout(60000);

    const today = new Date();

    const dd = String(today.getDate()).padStart(2, '0');        // Day with leading zero
    const mm = String(today.getMonth() + 1).padStart(2, '0');   // Month is 0-based
    const yy = String(today.getFullYear()).slice(-2);           // Last 2 digits of year

    const ddmmyy = `${dd}${mm}${yy}`;

    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index");
    await expect(page).toHaveURL(/dashboard/);

    const pimLink = page.getByRole('link', { name: 'PIM' });
    await pimLink.click();

    const addEmployee = page.getByRole('button', { name: 'Add' });
    await addEmployee.click();

    const employeeFirstNameInput = `F${ddmmyy}`;
    const employeeMiddleNameInput = `M${ddmmyy}`;
    const employeeLastNameInput = `L${ddmmyy}`;

    const employeeFirstName = page.locator('[name="firstName"]');
    await employeeFirstName.fill(employeeFirstNameInput);

    const employeeMiddleName = page.locator('[name="middleName"]');
    await employeeMiddleName.fill(employeeMiddleNameInput);

    const employeeLastName = page.locator('[name="lastName"]');
    await employeeLastName.fill(employeeLastNameInput);

    const filename = 'Pic.png';
    const filePath = path.join(__dirname, '..', 'Imgs', filename);

    await page.setInputFiles('input[type="file"]', filePath);

    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    await expect(page.locator('.oxd-toast')).toContainText(/Successfully Saved/i);

    // Locate the Employee Id input field
    const employeeIdInput = page.locator("//label[normalize-space()='Employee Id']/following::input[1]");

    // Capture the value
    const employeeId = await employeeIdInput.inputValue();

    // Print or use it in your test
    console.log("Captured Employee Id:", employeeId);

    await page.waitForTimeout(5000);
    await pimLink.click();
    await expect(page).toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList')

    await deleteByEmployeeId(page, employeeId);

    await expect(page.locator('.oxd-toast')).toContainText(/Successfully Deleted/i);

    // Re-run the search to confirm deletion
    await pimLink.click();
    await page.locator('.oxd-input-group', { has: page.locator('label', { hasText: 'Employee Id' }) })
        .locator('input')
        .fill(employeeId);

    await page.getByRole('button', { name: 'Search' }).click();

    // Assert that no rows exist with that Employee ID
    const deletedRow = page.locator('.oxd-table-card').filter({
        has: page.locator('.oxd-table-cell:nth-child(2) div:text-is("' + employeeId + '")'),
    });

    await expect(deletedRow).toHaveCount(0);
    await expect(page.locator('.oxd-toast')).toContainText(/No Records Found/i);
});