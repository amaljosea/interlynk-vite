import * as dotenv from 'dotenv'
import { expect, test } from '@playwright/test'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('should add organization, check string, and delete entry', async ({
  page
}) => {
  test.setTimeout(30000)
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

  await page.locator('#role').click()
  await page.keyboard.type('Viewer')
  await page.keyboard.press('Enter')

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
