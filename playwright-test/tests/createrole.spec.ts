import * as dotenv from 'dotenv'
import { expect, test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import { RolesPage } from '../sections/createrole.section'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Create and delete role', async ({ page }) => {
  test.setTimeout(1200000)
  const loginPage = new LoginPage(page)
  await loginPage.appLoginCommonFunctionality(email, password)
  const rolesPage = new RolesPage(page)
  await rolesPage.navigateToSettings()
  await rolesPage.openRolesTab()
  const roleName = 'aaaa'
  const roleType = 'Admin'
  await rolesPage.addRole(roleName, roleType)

  await rolesPage.deleteRole(roleName)
})

test.afterEach(async ({ page }) => {
  await page.close()
})
