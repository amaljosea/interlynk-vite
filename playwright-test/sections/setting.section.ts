import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class SettingSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async updateFields() {
    await this.page.getByRole('tab', { name: 'settings' }).click()
    await this.page
      .locator('div')
      .filter({ hasText: /^Vulnerability Scan$/ })
      .locator('span')
      .nth(1)
      .click()
    await this.page.waitForTimeout(2000)
    await this.page
      .locator('div')
      .filter({ hasText: /^Retain Vulnerability Status$/ })
      .locator('span')
      .nth(1)
      .click()
    await this.page.waitForTimeout(2000)
    await this.page
      .locator('div')
      .filter({ hasText: /^Checks$/ })
      .locator('span')
      .first()
      .click()
    await this.page.waitForTimeout(2000)
    await this.page
      .locator('div')
      .filter({ hasText: /^Automation$/ })
      .locator('span')
      .nth(1)
      .click()
    await this.page.waitForTimeout(2000)
    await this.page
      .locator('div')
      .filter({ hasText: /^Internal Component Labeling$/ })
      .locator('span')
      .nth(1)
      .click()
    await this.page.waitForTimeout(2000)

    await this.page.reload()
    await this.page
      .locator('div')
      .filter({ hasText: /^Vulnerability Scan$/ })
      .locator('span')
      .first()
      .click()
    await this.page.waitForTimeout(2000)
    await this.page
      .locator('div')
      .filter({ hasText: /^Retain Vulnerability Status$/ })
      .locator('span')
      .first()
      .click()
    await this.page.waitForTimeout(2000)
    await this.page
      .locator('div')
      .filter({ hasText: /^Checks$/ })
      .locator('span')
      .nth(1)
      .click()
    await this.page.waitForTimeout(2000)
    await this.page
      .locator('div')
      .filter({ hasText: /^Automation$/ })
      .locator('span')
      .first()
      .click()
    await this.page.waitForTimeout(2000)
    await this.page
      .locator('div')
      .filter({ hasText: /^Internal Component Labeling$/ })
      .locator('span')
      .first()
      .click()
    await this.page.waitForTimeout(2000)
    await this.page.locator('#dataRetention').selectOption('365')
    await this.page.waitForTimeout(2000)
    await this.page.locator('#dataRetention').selectOption('0')
    await this.page.waitForTimeout(3000)

    await this.page.locator("//a[@aria-label='products']").click()
    await this.page.waitForTimeout(2000)

    await this.page
      .locator(`//button[@aria-label='dropdown menu for Test']`)
      .click()
    await this.page
      .locator(`//button[@aria-label='Delete product Test']`)
      .click()
    await this.page.locator("button[type='submit']").click()
  }

  public async settings() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(3000)

      const product = await this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        console.log('Product "test" exists. Update settings.')
        await this.page.getByTestId(`product_Test`).click()
        await this.page.waitForTimeout(3000)
        await this.updateFields()
        await this.page.waitForTimeout(3000)
      } else {
        console.log('Product "test" does not exist. Creating it.')
        await this.page.locator("//button[@aria-label='Add product']").click()
        await this.page.getByPlaceholder('Add product name').fill('Test')
        await this.page
          .getByPlaceholder('Add product description')
          .fill('for testing')
        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)
        await this.page.getByTestId(`product_Test`).click()
        await this.page.waitForTimeout(3000)
        await this.updateFields()
        await this.page.waitForTimeout(3000)
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
