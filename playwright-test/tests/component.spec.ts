import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import ComponentPage from '../pages/component.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Component create functionality', async ({ page }) => {
  test.setTimeout(200000)
  const pp = new ComponentPage(page)
  try {
    await pp.createComponent()
  } catch (error) {
    console.error('Component create test failed:', error)
    throw error
  }
})

test('Component visibility filter', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.checkVisibility()
  } catch (error) {
    console.error('Component visibility filter test failed:', error)
    throw error
  }
})

test('Component search functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.searchComponent()
  } catch (error) {
    console.error('Component create test failed:', error)
    throw error
  }
})

test('Component edit functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.editComponent()
  } catch (error) {
    console.error('Component edit test failed:', error)
    throw error
  }
})

test('Link CRUD functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.componentLinks()
  } catch (error) {
    console.error('Link test failed:', error)
    throw error
  }
})

test('Relationship CRUD functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.componentRelations()
  } catch (error) {
    console.error('Relationship CRUD test failed:', error)
    throw error
  }
})

test('Component delete functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.deleteComponent()
  } catch (error) {
    console.error('Component delete test failed:', error)
    throw error
  }
})

test('Primary component change functionality', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.changePrimaryComponent()
  } catch (error) {
    console.error('Primary component test failed:', error)
    throw error
  }
})

test('Component PURL editor', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.editPURL()
  } catch (error) {
    console.error('PURL editor test failed:', error)
    throw error
  }
})

test('Component CPE editor', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.editCPE()
  } catch (error) {
    console.error('CPE editor test failed:', error)
    throw error
  }
})

test('Component relationship should render correctly', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.checkRelations()
  } catch (error) {
    console.error('Component relationship test failed:', error)
    throw error
  }
})

test('Component insights should render correctly', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new ComponentPage(page)
  try {
    await pp.checkInsights()
  } catch (error) {
    console.error('Component insights test failed:', error)
    throw error
  }
})
