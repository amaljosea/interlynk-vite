import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

dotenv.config({ path: '.env' })

const errors: string[] = []
const ruleName = 'license_check'

export default class AutomationSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async createRule() {
    const automationTab = await this.page
      .getByRole('tab', { name: 'automation rules' })
      .isVisible()

    if (automationTab) {
      await this.page.getByRole('tab', { name: 'automation rules' }).click()
      await this.page.waitForTimeout(2000)

      const addBtn = `//button[@aria-label='add_automation_rule']`
      const addAutomation = await this.page.locator(addBtn).isVisible()

      if (addAutomation) {
        await this.page.locator(addBtn).click()
        await this.page.waitForTimeout(2000)
        await this.page.getByPlaceholder('Enter rule name').fill(ruleName)

        await this.page.locator('#auto_conditon_subject_0').click()
        await this.page.keyboard.type('component_licenses_exp')
        await this.page.keyboard.press('Enter')

        await this.page.waitForTimeout(1000)
        await this.page.locator('#auto_conditon_operator_0').click()
        await this.page.keyboard.type('not_exists')
        await this.page.keyboard.press('Enter')

        await this.page.waitForTimeout(1000)
        await this.page.locator('#auto_action_subject_0').click()
        await this.page.keyboard.type('component_licenses_exp')
        await this.page.keyboard.press('Enter')

        await this.page.waitForTimeout(1000)
        await this.page.getByPlaceholder('Add value').fill('MIT')
        await this.page.waitForTimeout(1000)
        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)
      } else {
        errors.push('Add action not found')
      }
    } else {
      errors.push('Automation tab not found')
    }
  }

  public async add() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(3000)

      const product = await this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        console.log('Product "test" exists. Creating rule.')
        await this.page.getByTestId(`product_Test`).click()
        await this.page.waitForTimeout(3000)
        await this.createRule()
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
        await this.createRule()
        await this.page.waitForTimeout(3000)
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
        await this.page.getByTestId(`delete-field`).fill('DELETE')
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
