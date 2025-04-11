import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import { BibucketIntegration } from '../sections/bitbucket.section'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('should add bitbucket connection and import project', async ({ page }) => {
  test.setTimeout(30000)

  const settingsPage = new BibucketIntegration(page)

  await settingsPage.openConnectionTab()
  await settingsPage.addConfig(
    'dreamer87',
    'ATBBb33VAj9R4kDqDwRUQEbkEbNJ21907B14'
  )

  await settingsPage.saveWorkspace()
  await settingsPage.importBitbucketProject()
  await settingsPage.deleteProjectGroup()
})
