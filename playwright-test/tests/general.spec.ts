import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import GeneralPage from '../pages/general.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Version tool functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new GeneralPage(page)
  try {
    await pp.tools()
  } catch (error) {
    console.error('Version tool test failed:', error)
    throw error
  }
})

test('Version author functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new GeneralPage(page)
  try {
    await pp.authors()
  } catch (error) {
    console.error('Version author test failed:', error)
    throw error
  }
})

test('Version supplier functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new GeneralPage(page)
  try {
    await pp.supplier()
  } catch (error) {
    console.error('Version supplier test failed:', error)
    throw error
  }
})

test('Version license functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new GeneralPage(page)
  try {
    await pp.license()
  } catch (error) {
    console.error('Version license test failed:', error)
    throw error
  }
})
