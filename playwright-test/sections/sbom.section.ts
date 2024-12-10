import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []
const sbomName = 'python'
const sbomVersion = '4.5.6'
const sbomType = 'framework'
const orgName = 'Interlynk Inc'

export default class SbomSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  // BUILD
  public async build() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      await this.page.locator("//button[@aria-label='Add product']").click()
      await this.page.getByPlaceholder('Add product name').fill('Test')
      await this.page
        .getByPlaceholder('Add product description')
        .fill('for testing')
      await this.page.locator("button[type='submit']").click()

      await this.page.waitForTimeout(3000)

      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(3000)

        await this.page.locator(`//button[@aria-label='build_sbom']`).click()
        await this.page.waitForTimeout(3000)

        await this.page.getByPlaceholder('Enter name').fill(sbomName)
        await this.page.getByPlaceholder('Enter version').fill(sbomVersion)
        await this.page.getByLabel('Type *').selectOption(sbomType)
        await this.page
          .getByPlaceholder('Enter organization name')
          .fill(orgName)

        await this.page.getByRole('button', { name: 'Save' }).click()
        await this.page.waitForTimeout(3000)

        const SBOM = this.page.getByTestId('version').nth(0)

        if (SBOM.isVisible()) {
          await this.page.locator("//a[@aria-label='products']").click()
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

  // LIST
  public async list() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(3000)

        await this.page.locator(`//button[@aria-label='build_sbom']`).click()
        await this.page.waitForTimeout(3000)

        await this.page.getByPlaceholder('Enter name').fill(sbomName)
        await this.page.getByPlaceholder('Enter version').fill(sbomVersion)
        await this.page.getByLabel('Type *').selectOption(sbomType)
        await this.page
          .getByPlaceholder('Enter organization name')
          .fill(orgName)

        await this.page.getByRole('button', { name: 'Save' }).click()
        await this.page.waitForTimeout(5000)

        const SBOM = this.page.getByTestId('version').nth(0)

        if (SBOM.isVisible()) {
          await this.page
            .locator(`//button[@aria-label='sbom-${sbomVersion}-actions']`)
            .click()
          await this.page
            .locator(`//button[@aria-label='sbom-${sbomVersion}-list']`)
            .click()
          await this.page.waitForTimeout(2000)

          await this.page.getByLabel('Close').click()
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

  // REPROCESS
  public async reprocess() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await this.page
            .locator(`//button[@aria-label='sbom-${sbomVersion}-actions']`)
            .click()
          await this.page
            .locator(`//button[@aria-label='sbom-${sbomVersion}-reprocess']`)
            .click()
          await this.page.waitForTimeout(3000)

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

  // ARCHIVE
  public async archive() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await this.page
            .locator(`//button[@aria-label='sbom-${sbomVersion}-actions']`)
            .click()
          await this.page
            .locator(`//button[@aria-label='sbom-${sbomVersion}-archive']`)
            .click()
          await this.page.waitForTimeout(2000)

          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(2000)

          await this.page
            .locator(`//button[@aria-label='show_archive_sboms']`)
            .click()
          await this.page.waitForTimeout(2000)

          await this.page
            .locator(`//button[@aria-label='sbom-${sbomVersion}-restore']`)
            .click()
          await this.page.waitForTimeout(2000)

          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(2000)

          await this.page.getByLabel('Close').click()
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
  public async delete() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await this.page
            .locator(`//button[@aria-label='sbom-${sbomVersion}-actions']`)
            .click()
          await this.page
            .locator(`//button[@aria-label='sbom-${sbomVersion}-delete']`)
            .click()
          await this.page.waitForTimeout(3000)

          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(3000)

          await this.page.locator("//a[@aria-label='products']").click()
          await this.page.getByTestId('product-actions').first().click()
          await this.page.waitForTimeout(2000)

          await this.page.getByTestId('delete_product').first().click()
          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(2000)
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
