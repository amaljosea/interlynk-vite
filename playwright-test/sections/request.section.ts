import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { generateRandomEmail, randomProductName } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class RequestSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  // SBOM REQUEST
  public async request() {
    try {
      await this.page.locator("//a[@aria-label='requests']").click()

      await this.page.locator(`//button[@aria-label='request_sbom']`).click()
      await this.page.waitForTimeout(2000)

      const email = generateRandomEmail()
      const name = randomProductName()
      await this.page.getByLabel('Email*').fill(email)
      await this.page.getByLabel('Product Name').fill(name)
      await this.page.getByLabel('Product Version').fill('1.0.2')

      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(2000)

      const request = this.page.getByTestId('request_id').nth(0)

      if (request.isVisible()) {
        await this.page
          .locator(`//button[@aria-label='req action for ${email}']`)
          .click()
        await this.page
          .locator(`//button[@aria-label='resend req ${email}']`)
          .click()
        await this.page.waitForTimeout(2000)

        await this.page
          .locator(`//button[@aria-label='req action for ${email}']`)
          .click()
        await this.page
          .locator(`//button[@aria-label='cancel req ${email}']`)
          .click()
        await this.page.waitForTimeout(2000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(2000)
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
