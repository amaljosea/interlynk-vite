// const { test, expect } = require('@playwright/test')

// const url: any = process.env.url

// test('Login + Product Create, Read, Delete test', async ({ page }) => {
//   // Navigate to the login page
//   await page.goto(url)

//   // Fill in email address
//   await page.fill('#email', 'amaljoseami@gmail.com')

//   // Fill in password
//   await page.fill('#passowrd', 'LynkRisk@1.0')

//   // Click on the login button
//   await page.click('button:has-text("Log in")')

//   // Verify navigation to the dashboard or a successful login indicator
//   await expect(page).toHaveURL(/.*dashboard/) // Assuming that a successful login takes you to the dashboard

//   await page.click('a[href="/vendor/products"]')

//   // Wait for navigation to the vendor products page
//   await expect(page).toHaveURL(/.*vendor\/products/)

//   await page.click('[aria-label="Add product"]')

//   const productName = 'New product name ' + new Date().getTime()

//   await page.fill('#product-name', productName)

//   await page.click('button:has-text("Save")')

//   await expect(page.getByText(productName)).toBeVisible()

//   await page.click(`[aria-label="Dropdown menu for ${productName}"]`)

//   await page.click(`[aria-label="Delete product ${productName}"]`)

//   const element = page.locator('//button[@type="submit" and text()="Yes"]')

//   await expect(element).toBeVisible()
//   await element.click()
//   await page.waitForTimeout(1000)
//   await page.waitForLoadState('networkidle')

//   const elementLocator = page.locator(`text="${productName}"`)
//   await expect(elementLocator).toBeHidden()
// })
