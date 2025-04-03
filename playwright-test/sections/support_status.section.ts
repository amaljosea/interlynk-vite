import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []
const tokenName = 'lynk-api'

export default class SupportStatusSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async updateStatus() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(3000)

      const product = await this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        await this.page
          .locator(`//button[@aria-label='dropdown menu for Test']`)
          .click()
        await this.page
          .locator(`//button[@aria-label='upload sbom for Test']`)
          .click()

        const jsonFiles = getFileNamesFromResource('.json')
        const filePath = path.resolve(__dirname, '../resources', jsonFiles[0])
        await this.page
          .locator("//input[@id='fileInput']")
          .setInputFiles(filePath)

        await this.page.waitForTimeout(2000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(2000)

        await this.page.getByTestId(`product_Test`).click()
        await this.page.waitForTimeout(2000)
        await this.page.reload()

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'Support Status' }).click()
          await this.page.getByTestId('support-actions').first().click()
          await this.page.getByTestId('edit_component_support').first().click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('button', { name: 'Edit' }).click()
          await this.page
            .locator('.css-rldctj-control > .css-1de614h > .css-1n2nce7')
            .click()
          await this.page.locator('.css-rldctj-control > .css-1wy0on6').click()
          await this.page
            .locator('.css-rldctj-control > .css-1de614h > .css-1n2nce7')
            .click()
          await this.page.getByRole('option', { name: 'Unspecified' }).click()
          await this.page.getByRole('textbox', { name: 'Select date' }).click()
          await this.page.getByText('›').click()
          await this.page.getByRole('cell', { name: '30' }).nth(1).click()
          await this.page.getByRole('textbox', { name: 'Select date' }).click()
          await this.page
            .getByRole('group')
            .filter({ hasText: 'Assessment Expires On*‹May' })
            .locator('div')
            .nth(1)
            .click()
          await this.page.getByRole('textbox', { name: 'Select date' }).click()
          await this.page.getByText('‹').dblclick()
          await this.page.getByRole('cell', { name: '10' }).click()
          await this.page.getByRole('button', { name: 'Save' }).click()

          await this.page.waitForTimeout(2000)

          await this.page.locator("//a[@aria-label='products']").click()
          await this.page.getByTestId('product-actions').first().click()

          await this.page.waitForTimeout(2000)

          await this.page.getByTestId('delete_product').first().click()
          await this.page.getByTestId(`delete-field`).fill('DELETE')
          await this.page.locator("button[type='submit']").click()

          await this.page.waitForTimeout(3000)
        } else {
          errors.push('Version not found')
        }
      }
    } catch (error) {
      throw error
    }
  }

  // COMPONENT CREATE
  public async support() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(3000)

      const product = await this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        console.log('Product "test" exists. Uploading SBOM.')
        await this.page.waitForTimeout(3000)
        await this.updateStatus()
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
        await this.updateStatus()
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
