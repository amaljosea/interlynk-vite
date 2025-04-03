import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import { RolesPage } from '../sections/createrole.section'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Create and delete role', async ({ page }) => {
  test.setTimeout(30000)
  const rolesPage = new RolesPage(page)
  await rolesPage.navigateToSettings()
  await rolesPage.openRolesTab()
  const roleName = 'aaaa'
  const roleType = 'Admin'
  await rolesPage.addRole(roleName, roleType)

  await rolesPage.deleteRole(roleName)
})
