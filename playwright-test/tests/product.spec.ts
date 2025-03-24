import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import ProductPage from '../pages/product.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('TC_004 Products CRUD Operation Test', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ProductPage(page)
  try {
    await pp.productsCrudFunctionality()
  } catch (error) {
    console.error('Products CRUD Operation Test failed:', error)
    throw error
  }
})

test('TC_008 Products And Version Switching Test', async ({ page }) => {
  test.setTimeout(320000)
  const pp = new ProductPage(page)
  try {
    await pp.productsAndVersionSwitchingFunctionality()
  } catch (error) {
    console.error('Products And Version Switching Test failed:', error)
    throw error
  }
})

test('TC_009 Products Disable and Enable Test', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ProductPage(page)
  try {
    await pp.productsDisableAndEnableFunctionality()
  } catch (error) {
    console.error('Products Disable and Enable Test failed:', error)
    throw error
  }
})
