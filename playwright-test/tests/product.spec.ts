import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import ProductPage from '../pages/product.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('TC_004 Products CRUD Operation Test', async ({ page }) => {
  test.setTimeout(120000)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
  const pp = new ProductPage(page)
  await pp.productsCrudFunctionality()
})

test('TC_008 Products And Version Switching Test', async ({ page }) => {
  test.setTimeout(320000)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
  const pp = new ProductPage(page)
  await pp.productsAndVersionSwitchingFunctionality()
})

test.afterEach(async ({ page }) => {
  await page.close()
})
