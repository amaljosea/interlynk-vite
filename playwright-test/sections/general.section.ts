import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class GeneralSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async addSBOM() {
    await this.page
      .locator(`//button[@aria-label='dropdown menu for Test']`)
      .click()
    await this.page
      .locator(`//button[@aria-label='upload sbom for Test']`)
      .click()

    const jsonFiles = getFileNamesFromResource('.json')

    const sbom = path.resolve(__dirname, '../resources', jsonFiles[0])
    await this.page.locator("//input[@id='fileInput']").setInputFiles(sbom)
    await this.page.waitForTimeout(2000)

    await this.page.locator("button[type='submit']").click()
    await this.page.waitForTimeout(2000)

    await this.page.getByTestId(`product_Test`).click()
    await this.page.waitForTimeout(2000)

    const version = this.page.getByTestId('version').nth(0)

    if (version.isVisible()) {
      await version.click()
      await this.page.waitForTimeout(2000)

      await this.page.locator(`//button[@aria-label='add_tool']`).click()
      await this.page.getByPlaceholder('Add vendor').fill('SPDX')
      await this.page.getByPlaceholder('Add name').fill('Maven')
      await this.page.getByPlaceholder('Add version').fill('4.5.6')
      await this.page.getByRole('button', { name: 'Save' }).click()
      await this.page.waitForTimeout(3000)

      await this.page.getByLabel('close').nth(1).click()
      await this.page.waitForTimeout(3000)

      await this.page.getByRole('button', { name: 'Yes' }).click()
    } else {
      errors.push('Version not found')
    }
  }

  // TOOLS
  public async tools() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(3000)

      const product = await this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        console.log('Product "test" exists. Uploading SBOM.')
        await this.page.waitForTimeout(3000)
        await this.addSBOM()
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
        await this.addSBOM()
        await this.page.waitForTimeout(3000)
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  // AUTHOR
  public async author() {
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
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.locator(`//button[@aria-label='add_author']`).click()
          await this.page.getByPlaceholder('Add name').fill('Abhisek Paul')
          await this.page
            .getByPlaceholder('Add email address')
            .fill('abhisek@sofueled.com')
          await this.page.getByRole('button', { name: 'Save' }).click()
          await this.page.waitForTimeout(3000)

          await this.page
            .getByRole('row', { name: 'Authors Abhisek Paul -' })
            .getByLabel('close')
            .click()
          await this.page.getByRole('button', { name: 'Yes' }).click()
          await this.page.waitForTimeout(3000)
        } else {
          errors.push('Version not found')
        }
      } else {
        errors.push('Product not found')
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  // SUPPLIER
  public async supplier() {
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
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('button', { name: 'Add Supplier' }).click()
          await this.page
            .getByPlaceholder('Enter organization name')
            .fill('Microsoft')
          await this.page.getByRole('button', { name: 'Save' }).click()
          await this.page.waitForTimeout(3000)

          await this.page.getByLabel('supplier_edit').click()
          await this.page
            .getByPlaceholder('Enter URL')
            .fill('https://microsoft.com')
          await this.page.getByRole('button', { name: 'Update' }).click()
          await this.page.waitForTimeout(3000)

          await this.page.getByLabel('supplier_delete').click()
          await this.page.getByRole('button', { name: 'Yes' }).click()
          await this.page.waitForTimeout(3000)
        } else {
          errors.push('Version not found')
        }
      } else {
        errors.push('Product not found')
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  // LICENSE
  public async license() {
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
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('button', { name: 'Add License' }).click()
          await this.page.getByRole('combobox').fill('ap')
          await this.page.waitForTimeout(3000)
          await this.page.keyboard.press('Enter')
          await this.page.waitForTimeout(3000)

          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(3000)

          await this.page.getByTestId('edit_license').click()
          await this.page.getByRole('combobox').fill('mit')
          await this.page.waitForTimeout(3000)
          await this.page.keyboard.press('Enter')

          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(3000)

          await this.page.getByTestId('delete_license').click()
          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(3000)

          await this.page.locator("//a[@aria-label='products']").click()
          await this.page
            .locator(`//button[@aria-label='dropdown menu for Test']`)
            .click()
          await this.page.waitForTimeout(2000)

          await this.page
            .locator(`//button[@aria-label='Delete product Test']`)
            .click()
          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(2000)
        } else {
          errors.push('Version not found')
        }
      } else {
        errors.push('Product not found')
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
