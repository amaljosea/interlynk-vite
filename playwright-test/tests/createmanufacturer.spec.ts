import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import { SettingsPage } from '../sections/createmanufacturer.section'

dotenv.config({ path: '../.env' })

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('should add, update, and archive a manufacturer', async ({ page }) => {
  test.setTimeout(30000)

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
