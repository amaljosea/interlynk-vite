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
      await this.page.waitForTimeout(2000)

      const name = randomLicenseName()
      await this.page.locator(`//input[@aria-label='license_name']`).fill(name)

      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(2000)

      const licenseMenu = this.page.locator(
        `//button[@aria-label='license action ${name}']`
      )

      if (licenseMenu.isVisible()) {
        await licenseMenu.click()
        this.page
          .locator(`//button[@aria-label='license edit ${name}']`)
          .click()
        await this.page.waitForTimeout(2000)
        await this.page
          .locator(`//select[@aria-label='license_attr']`)
          .selectOption('YES')
        await this.page
          .locator(`//select[@aria-label='license_status']`)
          .selectOption('APPROVED')

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)
      } else {
        errors.push('License not found')
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
