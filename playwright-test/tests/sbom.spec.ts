import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LoginPage from '../pages/login.page'
import SbomPage from '../pages/sbom.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

test.beforeEach(async ({ page }) => {
  await page.goto(url)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
})

test('SBOM build functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new SbomPage(page)
  try {
    await pp.buildSbom()
  } catch (error) {
    console.error('SBOM build test failed:', error)
    throw error
  }
})

test('SBOM list functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new SbomPage(page)
  try {
    await pp.listSbom()
  } catch (error) {
    console.error('SBOM list test failed:', error)
    throw error
  }
})

test('SBOM reprocess functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new SbomPage(page)
  try {
    await pp.reprocessSbom()
  } catch (error) {
    console.error('SBOM reprocess test failed:', error)
    throw error
  }
})

test('SBOM archive functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new SbomPage(page)
  try {
    await pp.archiveSbom()
  } catch (error) {
    console.error('SBOM archive test failed:', error)
    throw error
  }
})

test('SBOM delete functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new SbomPage(page)
  try {
    await pp.deleteSbom()
  } catch (error) {
    console.error('SBOM delete test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
