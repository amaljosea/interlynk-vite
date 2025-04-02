import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

dotenv.config({ path: '.env' })

const errors: string[] = []
const tokenName = 'lynk-api'

export default class ScoreSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async score() {
    try {
      await this.page.locator("//a[@aria-label='settings']").click()
      await this.page.waitForTimeout(3000)

      await this.page.getByRole('tab', { name: 'health' }).click()
      await this.page.getByRole('textbox', { name: 'Age Weight (%)' }).click()
      await this.page
        .getByRole('textbox', { name: 'Age Weight (%)' })
        .fill('40')
      await this.page
        .getByRole('textbox', { name: 'Age Weight (%)' })
        .press('Tab')
      await this.page
        .getByRole('textbox', { name: 'Community Weight (%)' })
        .fill('30')
      await this.page
        .getByRole('textbox', { name: 'Community Weight (%)' })
        .press('Tab')
      await this.page
        .getByRole('textbox', { name: 'Security Weight (%)' })
        .fill('30')
      await this.page
        .getByRole('textbox', { name: 'Security Weight (%)' })
        .press('Tab')
      await this.page
        .getByRole('spinbutton', { name: 'Mark Repository Unmaintained' })
        .fill('120')
      await this.page
        .getByRole('spinbutton', { name: 'Mark Repository Unmaintained' })
        .press('Tab')
      await this.page
        .getByRole('spinbutton', { name: 'Mark Package Unmaintained' })
        .fill('190')
      await this.page.getByText('050100').click()
      await this.page.getByRole('button', { name: 'Update' }).click()
      await this.page
        .getByLabel('Notifications-top', { exact: true })
        .locator('div')
        .filter({ hasText: 'Successful!Scores updated' })
        .nth(2)
        .isVisible()
      await this.page.waitForTimeout(3000)

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
