import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class PartsSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ADD
  public async addParts() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      await this.page.getByRole('button', { name: 'Add Product' }).click()
      await this.page.getByPlaceholder('Add product name').fill('TestOne')
      await this.page
        .getByPlaceholder('Add product description')
        .fill('for testing')
      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(3000)

      await this.page.getByRole('button', { name: 'Add Product' }).click()
      await this.page.getByPlaceholder('Add product name').fill('TestTwo')
      await this.page
        .getByPlaceholder('Add product description')
        .fill('for testing')
      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(3000)

      const productOne = this.page.locator(`//p[normalize-space()='TestOne']`)
      const productTwo = this.page.locator(`//p[normalize-space()='TestTwo']`)

      if (productOne.isVisible()) {
        await this.page
          .locator(`//button[@aria-label='dropdown menu for TestOne']`)
          .click()
        await this.page
          .locator(`//button[@aria-label='upload sbom for TestOne']`)
          .click()

        const jsonFiles = getFileNamesFromResource('.json')

        const sbom = path.resolve(__dirname, '../resources', jsonFiles[0])
        await this.page.locator("//input[@id='fileInput']").setInputFiles(sbom)
        await this.page.waitForTimeout(2000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(2000)
      } else {
        errors.push('Product 1 not found')
      }

      if (productTwo.isVisible()) {
        await this.page
          .locator(`//button[@aria-label='dropdown menu for TestTwo']`)
          .click()
        await this.page
          .locator(`//button[@aria-label='upload sbom for TestTwo']`)
          .click()

        const jsonFiles = getFileNamesFromResource('.json')

        const sbom = path.resolve(__dirname, '../resources', jsonFiles[1])
        await this.page.locator("//input[@id='fileInput']").setInputFiles(sbom)
        await this.page.waitForTimeout(2000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(2000)

        await productTwo.click()
        await this.page.waitForTimeout(2000)
      } else {
        errors.push('Product 1 not found')
      }

      await this.page.reload()

      const version = this.page.getByTestId('version').nth(0)

      if (version.isVisible()) {
        await version.click()
        await this.page.waitForTimeout(2000)

        await this.page.getByRole('tab', { name: 'parts' }).click()
        await this.page.waitForTimeout(2000)

        await this.page.locator(`//button[@aria-label='add_part']`).click()
        await this.page.waitForTimeout(2000)

        await this.page.locator('#part_groups').click()
        await this.page.keyboard.press('Enter')
        await this.page.waitForTimeout(2000)

        await this.page.locator('#part_products').click()
        await this.page.keyboard.press('Enter')
        await this.page.waitForTimeout(2000)

        await this.page.locator('#part_versions').click()
        await this.page.keyboard.press('Enter')
        await this.page.waitForTimeout(2000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(2000)
      } else {
        errors.push('Version not found')
      }

      await this.page.waitForTimeout(5000)
      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  // PREVIEW
  public async viewParts() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.reload()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'parts' }).click()
          await this.page.waitForTimeout(3000)

          const part = this.page.getByTestId('sbom_part').nth(0)

          if (part.isVisible()) {
            await part.click()
            await this.page.waitForTimeout(2000)

            await this.page
              .getByRole('tab', { name: 'vulnerabilities' })
              .click()
          } else {
            errors.push('Part not found')
          }

          await this.page.waitForTimeout(3000)
        } else {
          errors.push('Version not found')
        }
      } else {
        errors.push('Product not found')
      }

      await this.page.waitForTimeout(2000)
      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  // DELETE
  public async deleteParts() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page.getByTestId(`product_TestTwo`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'parts' }).click()
          await this.page.waitForTimeout(2000)

          const part = this.page.getByTestId('sbom_part').nth(0)

          if (part.isVisible()) {
            await this.page.getByTestId('part-actions').first().click()
            await this.page.getByTestId('delete_part').first().click()
            await this.page.waitForTimeout(2000)

            await this.page.locator("button[type='submit']").click()
            await this.page.waitForTimeout(3000)
          } else {
            errors.push('Part not found')
          }

          await this.page.locator("//a[@aria-label='products']").click()
          await this.page.waitForTimeout(2000)

          await this.page
            .locator(`//button[@aria-label='dropdown menu for TestOne']`)
            .click()
          await this.page.waitForTimeout(2000)
          await this.page
            .locator(`//button[@aria-label='Delete product TestOne']`)
            .click()
          await this.page.getByTestId(`delete-field`).fill('DELETE')
          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(3000)

          await this.page
            .locator(`//button[@aria-label='dropdown menu for TestTwo']`)
            .click()
          await this.page.waitForTimeout(2000)
          await this.page
            .locator(`//button[@aria-label='Delete product TestTwo']`)
            .click()
          await this.page.getByTestId(`delete-field`).fill('DELETE')
          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(3000)
        } else {
          errors.push('Version not found')
        }
      } else {
        errors.push('Product not found')
      }

      await this.page.waitForTimeout(2000)
      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
