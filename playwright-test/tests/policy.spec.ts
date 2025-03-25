import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import PolicyPage from '../pages/policy.page'

dotenv.config({ path: '../.env' })

test('Policy create functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new PolicyPage(page)
  try {
    await pp.addPolicy()
  } catch (error) {
    console.error('Policy create test failed:', error)
    throw error
  }
})

test('Policy edit functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new PolicyPage(page)
  try {
    await pp.editPolicy()
  } catch (error) {
    console.error('Policy edit test failed:', error)
    throw error
  }
})

test('Policy delete functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new PolicyPage(page)
  try {
    await pp.deletePolicy()
  } catch (error) {
    console.error('Policy delete test failed:', error)
    throw error
  }
})
