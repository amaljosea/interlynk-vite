import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LoginPage from '../pages/login.page'

dotenv.config({ path: '../.env' })

const url = process.env.PLAYWRIGHT_TEST_URL as string | undefined
const email = process.env.PLAYWRIGHT_USER_EMAIL as string | undefined
const password = process.env.PLAYWRIGHT_USER_PASSWORD as string | undefined

test.beforeEach(async ({ page }) => {
  await page.goto(url)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
})

test('Check internal component CRUD feature', async ({ page }) => {
  test.setTimeout(120000)

  try {
    await page.getByLabel('settings').click()
    await page.getByRole('tab', { name: 'lists' }).click()
    await page.getByLabel('lists').getByRole('button').click()

    const orgNameField = page.getByPlaceholder('Org name')
    await orgNameField.press('CapsLock')
    await orgNameField.fill('Testorg')

    const testStringField = page.getByPlaceholder(
      'Enter a string to check if it'
    )
    await testStringField.click()
    await testStringField.fill('testexp')

    await page.getByRole('button', { name: 'Tag' }).click()

    await page.waitForTimeout(3000)

    await page.getByTestId('tag-actions').first().click()

    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Yes' }).click()
  } catch (error) {
    console.error('Internal component test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
