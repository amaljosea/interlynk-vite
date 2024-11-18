import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { generateUniqueId } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []
const ruleName = 'license_check'

export default class AutomationSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async add() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      await this.page.locator("//button[@aria-label='Add product']").click()
      await this.page.getByPlaceholder('Add product name').fill('Test')
      await this.page
        .getByPlaceholder('Add product description')
        .fill('for testing')
      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(3000)

      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        await this.page.getByRole('tab', { name: 'automation rules' }).click()
        await this.page.waitForTimeout(2000)

        await this.page
          .locator(`//button[@aria-label='add_automation_rule']`)
          .click()
        await this.page.waitForTimeout(2000)

        await this.page.getByPlaceholder('Enter rule name').fill(ruleName)
        await this.page
          .getByTestId(`auto_conditon_subject_0`)
          .selectOption('component_licenses_exp')
        await this.page.waitForTimeout(1000)
        await this.page
          .getByTestId(`auto_conditon_operator_0`)
          .selectOption('not_exists')
        await this.page.waitForTimeout(1000)
        await this.page
          .getByTestId(`auto_action_subject_0`)
          .selectOption('component_licenses_exp')
        await this.page.waitForTimeout(1000)
        await this.page.getByPlaceholder('Add value').fill('MIT')
        await this.page.waitForTimeout(1000)
        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)
      } else {
        errors.push(`Product not found`)
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  public async edit() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        await this.page.getByRole('tab', { name: 'automation rules' }).click()
        await this.page.waitForTimeout(2000)

        await this.page.getByTestId(`automation_actions_${ruleName}`).click()
        await this.page.getByTestId(`automation_edit_${ruleName}`).click()
        await this.page.waitForTimeout(3000)

        await this.page.getByPlaceholder('Add value').fill('Apache-1.0')
        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)
      } else {
        errors.push(`Product not found`)
      }
    } catch (error) {
      throw error
    }
  }

  public async delete() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        await this.page.getByRole('tab', { name: 'automation rules' }).click()
        await this.page.waitForTimeout(2000)

        await this.page.getByTestId(`automation_actions_${ruleName}`).click()
        await this.page.getByTestId(`automation_delete_${ruleName}`).click()
        await this.page.waitForTimeout(3000)

        await this.page.locator("button[type='submit']").click()
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
        await this.page.waitForTimeout(2000)
      } else {
        errors.push(`Product not found`)
      }
    } catch (error) {
      throw error
    }
  }
}
