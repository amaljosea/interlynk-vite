import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { randomLicenseName } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class LicenseSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async license() {
    try {
      await this.page.locator("//a[@aria-label='licenses']").click()

      await this.page.locator(`//button[@aria-label='add_license']`).click()

      const name = randomLicenseName()
      await this.page.locator(`//input[@aria-label='license_name']`).fill(name)

      await this.page.locator("button[type='submit']").click()

      const license = this.page.getByTestId(`license_${name}`)

      if (license.isVisible()) {
        await this.page
          .locator(`//button[@aria-label='license action ${name}']`)
          .click()
        await this.page
          .locator(`//button[@aria-label='license edit ${name}']`)
          .click()

        await this.page.locator('#license_attr').click()
        await this.page.keyboard.type('YES')
        await this.page.keyboard.press('Enter')

        await this.page.locator('#license_status').click()
        await this.page.keyboard.type('APPROVED')
        await this.page.keyboard.press('Enter')

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
