import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import Package from '../sections/package.section'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Should create a project group', async ({ page }) => {
  test.setTimeout(120000)

  const projectPage = new Package(page)
  await projectPage.createProjectGroup()
})

test('Should create a package override', async ({ page }) => {
  test.setTimeout(120000)

  const packagePage = new Package(page)
  await packagePage.createOverride()
})

test('Should update package override', async ({ page }) => {
  test.setTimeout(120000)

  const packagePage = new Package(page)
  await packagePage.updateOverride()
})

test('Should delete package override', async ({ page }) => {
  test.setTimeout(120000)

  const packagePage = new Package(page)
  await packagePage.deleteOverride()
})

test('Should delete project group', async ({ page }) => {
  test.setTimeout(120000)

  const projectPage = new Package(page)
  await projectPage.deleteProjectGroup()
})
