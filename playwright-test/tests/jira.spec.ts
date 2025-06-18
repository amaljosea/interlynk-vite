import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import { JiraIntegration } from '../sections/jira.section'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Should add JIRA connection', async ({ page }) => {
  test.setTimeout(30000)

  const settingsPage = new JiraIntegration(page)
  await settingsPage.openConnectionTab()
  await settingsPage.addConfig(
    'https://interlynk.atlassian.net',
    'ritesh.noronha@interlynk.io',
    'ATATT3xFfGF0oAMCHfZHcwpY36ERU5wLuZwL4VpXeGtfAbmCa2jB-Y41eh2_YMuHO6G_KIXGVr-kzyp4KYXnIr-XIZ_p4VOdnjh1lSgyd_8Nq5XPl-1je8ZOThNz3Lzkt1tZx2DLd0X5KmtUWV6X_0swfCUJO9xQ9UIqGkG48tSPTbsOojPYTBQ=6BEFBC06'
  )
  await settingsPage.saveConnection()
})

test('Update project settings', async ({ page }) => {
  test.setTimeout(30000)

  const settingsPage = new JiraIntegration(page)
  await settingsPage.updateProjectSettings()
})

test('Delete project', async ({ page }) => {
  test.setTimeout(30000)

  const settingsPage = new JiraIntegration(page)
  await settingsPage.deleteProjectGroup()
})

test('Remove JIRA connection', async ({ page }) => {
  test.setTimeout(30000)

  const settingsPage = new JiraIntegration(page)
  await settingsPage.removeConfiguration()
})
