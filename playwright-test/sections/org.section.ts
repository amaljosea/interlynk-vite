import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { randomProductName } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []
const orgName = randomProductName()

export default class OrgSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async org() {
    try {
      await this.page.getByTestId('org_menu').click()
      await this.page.getByTestId('add_org').click()
      await this.page.waitForTimeout(2000)

      await this.page.getByPlaceholder('Enter name').fill(orgName)
      await this.page.waitForTimeout(2000)

      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(2000)

      await this.page.getByTestId('org_menu').click()
      await this.page.getByRole('menuitemradio', { name: orgName }).click()
      await this.page.waitForTimeout(5000)

      await this.page.getByTestId('org_menu').click()
      await this.page
        .getByRole('menuitemradio', { name: 'Test Interlynk' })
        .click()
      await this.page.waitForTimeout(5000)

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
