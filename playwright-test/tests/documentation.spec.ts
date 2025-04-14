import * as dotenv from 'dotenv'
import { expect, test } from '@playwright/test'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Redirect to documentation site', async ({ page }) => {
  test.setTimeout(30000)
  const page1Promise = page.waitForEvent('popup')
  await page.locator('.documentation').click()
  const page1 = await page1Promise
  await expect(page1).toHaveURL('https://docs.interlynk.io/')
})
