import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class SupportSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async support() {
    try {
      await this.page.locator("//a[@aria-label='support']").click()

      await this.page.locator(`//button[@aria-label='add_support']`).click()

      const name = 'Test'
      await this.page.getByPlaceholder('Enter Product Name').fill(name)
      await this.page.getByPlaceholder('Enter Product Version').fill('1.0.1')
      await this.page
        .getByPlaceholder('Enter PURL / CPE')
        .fill('pkg:npm/example-package@1.0.0?platform=linux#src')
      await this.page.locator("button[type='submit']").click()

      const supportActions = this.page.locator(
        `//button[@aria-label='support action ${name}']`
      )

      if (supportActions.isVisible()) {
        await supportActions.click()
        this.page
          .locator(`//button[@aria-label='support edit ${name}']`)
          .click()

        await this.page.getByText('Deprecated', { exact: true }).click()

        await this.page.locator("button[type='submit']").click()

        await this.page.locator('.chakra-switch__thumb').nth(0).click()

        await this.page.locator("button[type='submit']").click()

        await this.page.locator('.chakra-switch__thumb').nth(0).click()

        await this.page.locator("button[type='submit']").click()

        await supportActions.click()
        this.page
          .locator(`//button[@aria-label='support delete ${name}']`)
          .click()

        await this.page.locator("button[type='submit']").click()
      } else {
        errors.push('License not found')
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
