import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import ProductPage from '../pages/product.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.url
const email: any = process.env.email
const password: any = process.env.password

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

const isCI = process.env.CI === 'true'

test('TC_007 Products And Version Switching Test', async ({ page }) => {
  test.setTimeout(isCI ? 320000 : 240000)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
  const pp = new ProductPage(page)
  await pp.productsAndVersionSwitchingFunctionality()
})

test.afterEach(async ({ page }) => {
  await page.close()
})
