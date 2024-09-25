import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import RegisterPage from '../pages/register.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL
const name: any = 'demo user'
const address: any = 'demo@gmail.com'
const password: any = 'Demo08081994#'

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('TC_002 Registration with Email ID Test', async ({ page }) => {
  test.setTimeout(60000)
  const rp = new RegisterPage(page)
  await rp.userRegisterFunctionality(name, address, password)
})

test.afterEach(async ({ page }) => {
  await page.close()
})
