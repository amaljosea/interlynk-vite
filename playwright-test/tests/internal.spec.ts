import * as dotenv from 'dotenv'
import { test } from '@playwright/test'

dotenv.config({ path: '../.env' })

const url: any = process.env.PLAYWRIGHT_TEST_URL

test.beforeEach(async ({ page }) => {
  await page.goto(url)
})

test('Check internal component CRUD feature', async ({ page }) => {
  test.setTimeout(30000)

  try {
    await page.getByLabel('settings').click()
    await page.getByRole('tab', { name: 'lists' }).click()
    await page.getByLabel('lists').getByRole('button').first().click()

    const orgNameField = page.getByPlaceholder('Org name')
    await orgNameField.press('CapsLock')
    await orgNameField.fill('Testorg')

    const testStringField = page.getByPlaceholder(
      'Enter a string to check if it'
    )
    await testStringField.click()
    await testStringField.fill('testexp')

    await page.getByRole('button', { name: 'Tag' }).click()
    await page.waitForTimeout(3000)

    const tagAction = await page.getByTestId('tag-actions').first().isVisible()

    if (tagAction) {
      await page.getByTestId('tag-actions').first().click()
      await page.getByRole('menuitem', { name: 'Delete' }).click()
      await page.getByRole('button', { name: 'Yes' }).click()
      await page.waitForTimeout(3000)
    } else {
      console.error('Tag not found')
    }
  } catch (error) {
    console.error('Internal component test failed:', error)
    throw error
  }
})
