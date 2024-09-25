import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import ProductDetailsPage from '../pages/product_details.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('TC_006 Sbom Upload And Delete Test', async ({ page }) => {
  test.setTimeout(120000)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
  const dp = new ProductDetailsPage(page)
  await dp.productUploadDeleteFunctionality()
})

test.afterEach(async ({ page }) => {
  await page.close()
})
