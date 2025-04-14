import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import { BibucketIntegration } from '../sections/bitbucket.section'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Should add bitbucket connection', async ({ page }) => {
  test.setTimeout(30000)

  const settingsPage = new BibucketIntegration(page)
  await settingsPage.openConnectionTab()
  await settingsPage.addConfig(
    'dreamer87',
    'ATBBb33VAj9R4kDqDwRUQEbkEbNJ21907B14'
  )
  await settingsPage.saveWorkspace()
})

test('Import repositories from bitbucket', async ({ page }) => {
  test.setTimeout(30000)

  const settingsPage = new BibucketIntegration(page)
  await settingsPage.importBitbucketProject()
})

test('Delete bitbucket repo from product table', async ({ page }) => {
  test.setTimeout(30000)

  const settingsPage = new BibucketIntegration(page)
  await settingsPage.deleteProjectGroup()
})

test('Remove bitbucket configuration', async ({ page }) => {
  test.setTimeout(30000)

  const settingsPage = new BibucketIntegration(page)
  await settingsPage.removeConfiguration()
})
