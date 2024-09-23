import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

import LabelPage from '../pages/label.page'
import LoginPage from '../pages/login.page'

dotenv.config({ path: '../.env' })

const url: any = process.env.url
const email: any = process.env.email
const password: any = process.env.password

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('TC_007 Label Test', async ({ page }) => {
  test.setTimeout(120000)
  const lp = new LoginPage(page)
  await lp.appLoginCommonFunctionality(email, password)
  const pp = new LabelPage(page)
  await pp.labelFunctionality()
})

test.afterEach(async ({ page }) => {
  await page.close()
})
