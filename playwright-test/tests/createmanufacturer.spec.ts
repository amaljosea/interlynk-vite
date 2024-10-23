import * as dotenv from 'dotenv'
import { expect, test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import { SettingsPage } from '../sections/createmanufacturer.section'

dotenv.config({ path: '../.env' })

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

test('should add, update, and archive a manufacturer', async ({ page }) => {
  test.setTimeout(120000)

  const loginPage = new LoginPage(page)
  await loginPage.appLoginCommonFunctionality(email, password)

  const settingsPage = new SettingsPage(page)

  await settingsPage.openSettingsTab()
  await settingsPage.openLegalTab()
  await settingsPage.openLegalSection()

  await settingsPage.addOrganizationName('Ello')
  await settingsPage.addURL('https://eximpe.com/')
  await settingsPage.addConfig('Ello', 'ello@yopmail.com', '8080166343')
  await settingsPage.saveChanges()

  await settingsPage.updateManufacturer('Elloo')

  await settingsPage.archiveManufacturer()
})

test.afterEach(async ({ page }) => {
  await page.close()
})
