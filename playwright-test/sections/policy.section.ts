import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { generateUniqueId } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class PolicySection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async add() {
    try {
      await this.page.locator("//a[@aria-label='policies']").click()

      await this.page.locator(`//button[@aria-label='add_policy']`).click()
      await this.page.waitForTimeout(2000)

      const uniqueId = generateUniqueId()
      await this.page
        .getByPlaceholder('Enter name')
        .fill(`${uniqueId} - Component version cehck`)
      await this.page.getByPlaceholder('Enter description').fill('for testing')
      await this.page.getByTestId(`policy_result_type`).selectOption('WARN')
      await this.page.waitForTimeout(1000)
      await this.page.getByTestId(`policy_result_condition`).selectOption('ANY')
      await this.page.waitForTimeout(1000)
      await this.page
        .getByTestId(`condition_subject_0`)
        .selectOption('COMPONENT_VERSION')
      await this.page.waitForTimeout(1000)
      await this.page
        .getByTestId(`condition_operator_0`)
        .selectOption('NOT_EXISTS')
      await this.page.waitForTimeout(1000)

      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(3000)

      await this.page.locator('.chakra-switch__thumb').nth(0).click()
      await this.page.waitForTimeout(2000)

      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(3000)

      await this.page.locator('.chakra-switch__thumb').nth(0).click()
      await this.page.waitForTimeout(2000)

      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(3000)

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  public async edit() {
    try {
      await this.page.locator("//a[@aria-label='policies']").click()

      const policy = this.page.getByTestId(`policy_0`)

      if (policy.isVisible()) {
        await this.page.getByTestId(`policy_actions_0`).click()
        await this.page.getByTestId(`policy_edit_0`).click()
        await this.page.waitForTimeout(3000)

        await this.page.getByTestId(`add_policy_condition`).click()
        await this.page.waitForTimeout(1000)

        await this.page
          .getByTestId(`condition_subject_1`)
          .selectOption('COMPONENT_TYPE')
        await this.page.waitForTimeout(1000)
        await this.page
          .getByTestId(`condition_operator_1`)
          .selectOption('NOT_EXISTS')
        await this.page.waitForTimeout(1000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)
      }
    } catch (error) {
      throw error
    }
  }

  public async delete() {
    try {
      await this.page.locator("//a[@aria-label='policies']").click()
      await this.page.reload()

      const policy = this.page.getByTestId(`policy_0`)

      if (policy.isVisible()) {
        await this.page.getByTestId(`policy_actions_0`).click()
        await this.page.getByTestId(`policy_delete_0`).click()
        await this.page.waitForTimeout(3000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(5000)
      }
    } catch (error) {
      throw error
    }
  }
}
