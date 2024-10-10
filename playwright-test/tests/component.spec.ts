import * as dotenv from 'dotenv'
import { expect, test } from '@playwright/test'

import ComponentPage from '../pages/component.page'
import LoginPage from '../pages/login.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const email: any = process.env.PLAYWRIGHT_USER_EMAIL
const password: any = process.env.PLAYWRIGHT_USER_PASSWORD

let productExists = false
let versionExists = false
let isCreated = false
let isEdited = false

test.beforeEach(async ({ page }) => {
  await page.goto(url)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
})

test('Atleast 1 product should be available', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.checkProduct()
    productExists = true
  } catch (error) {
    console.error('Product test failed:', error)
    throw error
  }
})

test('Atleast 1 version should be available', async ({ page }) => {
  test.setTimeout(120000)

  if (!productExists) {
    test.skip(true, 'Skipping because product test failed')
  }

  const pp = new ComponentPage(page)
  try {
    await pp.checkVersion()
    versionExists = true
  } catch (error) {
    console.error('Version test failed:', error)
    throw error
  }
})

test('Component create functionality', async ({ page }) => {
  test.setTimeout(120000)

  if (!versionExists) {
    test.skip(true, 'Skipping because version test failed')
  }

  const pp = new ComponentPage(page)
  try {
    await pp.createComponent()
    isCreated = true
  } catch (error) {
    console.error('Component create test failed:', error)
    throw error
  }
})

test('Component edit functionality', async ({ page }) => {
  test.setTimeout(120000)

  if (!isCreated) {
    test.skip(true, 'Skipping because component create test failed')
  }

  const pp = new ComponentPage(page)
  try {
    await pp.editComponent()
    isEdited = true
  } catch (error) {
    console.error('Component edit test failed:', error)
    throw error
  }
})

test('Component delete functionality', async ({ page }) => {
  test.setTimeout(120000)

  if (!isEdited) {
    test.skip(true, 'Skipping because component edit test failed')
  }

  const pp = new ComponentPage(page)
  try {
    await pp.deleteComponent()
  } catch (error) {
    console.error('Component delete test failed:', error)
    throw error
  }
})

test.afterEach(async ({ page }) => {
  await page.close()
})
