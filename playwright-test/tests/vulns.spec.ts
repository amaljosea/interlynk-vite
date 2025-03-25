import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import VulnsPage from '../pages/vulns.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Vuln status functionality', async ({ page }) => {
  test.setTimeout(180000)
  const pp = new VulnsPage(page)
  try {
    await pp.addStatus()
  } catch (error) {
    console.error('Vuln status test failed:', error)
    throw error
  }
})

test('Vex import functionality', async ({ page }) => {
  test.setTimeout(180000)
  const pp = new VulnsPage(page)
  try {
    await pp.vexImport()
  } catch (error) {
    console.error('Vex import test failed:', error)
    throw error
  }
})

test('Vuln links functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new VulnsPage(page)
  try {
    await pp.updateLinks()
  } catch (error) {
    console.error('Vuln links test failed:', error)
    throw error
  }
})
