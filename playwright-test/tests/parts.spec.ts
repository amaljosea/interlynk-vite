import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import PartsPage from '../pages/parts.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
})

test('Parts create functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new PartsPage(page)
  try {
    await pp.add()
  } catch (error) {
    console.error('Parts create test failed:', error)
    throw error
  }
})

test('View parts page', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new PartsPage(page)
  try {
    await pp.preview()
  } catch (error) {
    console.error('View parts test failed:', error)
    throw error
  }
})

test('Parts delete functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new PartsPage(page)
  try {
    await pp.delete()
  } catch (error) {
    console.error('Parts delete test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
