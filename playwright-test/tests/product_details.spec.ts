import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import ProductDetailsPage from '../pages/product_details.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('TC_006 Sbom Upload And Delete Test', async ({ page }) => {
  test.setTimeout(120000)
  const dp = new ProductDetailsPage(page)
  try {
    await dp.productUploadDeleteFunctionality()
  } catch (error) {
    console.error('Product details test failed:', error)
    throw error
  }
})

test('TC_006 Product Edit Test', async ({ page }) => {
  test.setTimeout(120000)
  const dp = new ProductDetailsPage(page)
  try {
    await dp.editProduct()
  } catch (error) {
    console.error('Product edit test failed:', error)
    throw error
  }
})

test('TC_006 Product Delete Test', async ({ page }) => {
  test.setTimeout(120000)
  const dp = new ProductDetailsPage(page)
  try {
    await dp.deleteProduct()
  } catch (error) {
    console.error('Product delete test failed:', error)
    throw error
  }
})
