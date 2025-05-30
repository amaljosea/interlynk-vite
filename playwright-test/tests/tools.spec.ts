import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import Tools from '../sections/tools.section'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Should create a project group with two SBOM', async ({ page }) => {
  test.setTimeout(120000)
  const toolsPage = new Tools(page)
  await toolsPage.createProjectGroup()
})

test('Should compare two SBOM', async ({ page }) => {
  test.setTimeout(120000)
  const toolsPage = new Tools(page)
  await toolsPage.compareSBOMs()
})

test('Should delete project group', async ({ page }) => {
  test.setTimeout(120000)
  const toolsPage = new Tools(page)
  await toolsPage.deleteProjectGroup()
})
