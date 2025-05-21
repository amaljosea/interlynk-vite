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
    'srijan.kpr@gmail.com',
    'ATATT3xFfGF0-gLbHjLMZkunbAO3kePMBFN3UD-Jhy7y-4vBpAvLliI64V8OrvSFv-JPH5q5CHeJqcoB7KohO1FjAdm49GxfoGF2L4YtP-roc6dZwOrjdzl2S2bcJVcOBdNwbK5LpYjtfLTYJUfn41KqteZZC0e4xusX64wScP4Z9LmMf6oTN-Y=14A6ECBF'
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
