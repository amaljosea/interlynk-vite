import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import PolicyPage from '../pages/policy.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Policy create functionality', async ({ page }) => {
  const pp = new PolicyPage(page)
  try {
    await pp.addPolicy()
  } catch (error) {
    console.error('Policy create test failed:', error)
    throw error
  }
})

test('Policy edit functionality', async ({ page }) => {
  const pp = new PolicyPage(page)
  try {
    await pp.editPolicy()
  } catch (error) {
    console.error('Policy edit test failed:', error)
    throw error
  }
})

test('Policy delete functionality', async ({ page }) => {
  const pp = new PolicyPage(page)
  try {
    await pp.deletePolicy()
  } catch (error) {
    console.error('Policy delete test failed:', error)
    throw error
  }
})
