import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import SbomPage from '../pages/sbom.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
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

test('Update SBOM lifestage', async ({ page }) => {
  test.setTimeout(120000)
  const pp = new SbomPage(page)
  try {
    await pp.updateLifestage()
  } catch (error) {
    console.error('Lifestage update test failed:', error)
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

// test('SBOM reprocess functionality', async ({ page }) => {
//   test.setTimeout(120000)
//   const pp = new SbomPage(page)
//   try {
//     await pp.reprocessSbom()
//   } catch (error) {
//     console.error('SBOM reprocess test failed:', error)
//     throw error
//   }
// })

// test('SBOM archive functionality', async ({ page }) => {
//   test.setTimeout(120000)
//   const pp = new SbomPage(page)
//   try {
//     await pp.archiveSbom()
//   } catch (error) {
//     console.error('SBOM archive test failed:', error)
//     throw error
//   }
// })

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
