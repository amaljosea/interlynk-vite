import * as dotenv from 'dotenv'
import { expect, test } from '@playwright/test'

import LoginPage from '../pages/login.page'

dotenv.config({ path: '../.env' })

const url = process.env.PLAYWRIGHT_TEST_URL as string | undefined
const email = process.env.PLAYWRIGHT_USER_EMAIL as string | undefined
const password = process.env.PLAYWRIGHT_USER_PASSWORD as string | undefined

if (!url || !email || !password) {
  throw new Error(
    'Environment variables PLAYWRIGHT_TEST_URL, PLAYWRIGHT_USER_EMAIL, and PLAYWRIGHT_USER_PASSWORD must be set.'
  )
}

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('should add organization, check string, and delete entry', async ({
  page
}) => {
  const loginPage = new LoginPage(page)
  await loginPage.appLoginCommonFunctionality(email, password)
  await page.getByLabel('settings').click()
  await page.locator(`//button[@aria-label='add_user']`).click()
  await page.getByLabel('Email*').click()
  await page.getByLabel('Email*').fill('aaa@yopmail.com')
  await page.getByRole('button', { name: 'Add' }).click()
  await page.getByPlaceholder('Search', { exact: true }).click()
  await page.getByPlaceholder('Search', { exact: true }).fill('aaa@yopmail.com')
  await page.getByPlaceholder('Search', { exact: true }).press('Enter')
  await page
    .locator(
      "//div[@data-tag='allowRowEvents']/button[contains(@class, 'chakra-button')]"
    )
    .click()

  await page.getByRole('menuitem', { name: 'Change Role' }).click()
  await page.locator('[role=presentation]:has-text("Admin") button')

  await page.getByLabel('Role', { exact: true }).selectOption('Viewer')
  await page.getByRole('button', { name: 'Update' }).click()
  await page
    .locator(
      "//div[@data-tag='allowRowEvents']/button[contains(@class, 'chakra-button')]"
    )
    .click()
  await page.getByRole('menuitem', { name: 'Resend Invite' }).click()
  await page
    .locator(
      "//div[@data-tag='allowRowEvents']/button[contains(@class, 'chakra-button')]"
    )
    .click()

  await page.getByRole('menuitem', { name: 'Revoke Invitation' }).click()
  await page.getByRole('button', { name: 'Remove' }).click()
})

test.afterEach(async ({ page }) => {
  await page.close()
})
