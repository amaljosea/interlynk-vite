import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

const errors: string[] = []
const menuBtn = `//button[@aria-label='dropdown menu for Test']`
const uploadBtn = `//button[@aria-label='upload sbom for Test']`

export default class Package {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async uploadSBOM() {
    await this.page.locator(menuBtn).click()
    await this.page.locator(uploadBtn).click()

    const jsonFiles = getFileNamesFromResource('.json')

    const sbomOne = path.resolve(__dirname, '../resources', jsonFiles[0])
    await this.page.locator("//input[@id='fileInput']").setInputFiles(sbomOne)
    await this.page.waitForTimeout(2000)

    await this.page.locator("button[type='submit']").click()
    await this.page.waitForTimeout(3000)

    await this.page.locator("//button[@aria-label='refresh']").click()
    await this.page.waitForTimeout(5000)
  }

  public async createProjectGroup() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(3000)

      const product = await this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        console.log('Product "test" exists. Uploading SBOM.')
        await this.page.waitForTimeout(3000)
        await this.uploadSBOM()
        await this.page.waitForTimeout(3000)
      } else {
        console.log('Product "test" does not exist. Creating it.')
        await this.page.getByRole('button', { name: 'Add Product' }).click()
        await this.page.getByPlaceholder('Add product name').fill('Test')
        await this.page
          .getByPlaceholder('Add product description')
          .fill('for testing')
        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)
        await this.uploadSBOM()
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  async createOverride() {
    await this.page.locator("//a[@aria-label='package']").click()
    await this.page.waitForTimeout(3000)

    await this.page.reload()
    await this.page.waitForTimeout(3000)

    await this.page.getByRole('textbox', { name: 'Search' }).click()
    await this.page.getByRole('textbox', { name: 'Search' }).fill('classmate')
    await this.page.getByRole('textbox', { name: 'Search' }).press('Enter')
    await this.page.waitForTimeout(3000)

    await this.page
      .getByRole('row', { name: 'classmate maven 1.5.1 Apache-' })
      .getByTestId('package_actions')
      .click()
    await this.page.getByRole('menuitem', { name: 'Create override' }).click()
    await this.page.waitForTimeout(3000)

    await this.page.getByRole('textbox', { name: 'Copyright' }).fill('Testing')
    await this.page.getByRole('textbox', { name: 'Notice' }).fill('Testing')
    await this.page.getByRole('combobox').fill('apache')
    await this.page.waitForTimeout(3000)
    await this.page.keyboard.press('Enter')

    await this.page.locator("button[type='submit']").click()
    await this.page.waitForTimeout(3000)
  }

  async updateOverride() {
    await this.page.locator("//a[@aria-label='package']").click()
    await this.page.waitForTimeout(3000)

    await this.page.getByRole('tab', { name: 'Package Overrides' }).click()
    await this.page.waitForTimeout(3000)

    await this.page
      .getByRole('row', { name: 'classmate • Override maven 1.' })
      .getByTestId('package_actions')
      .click()
    await this.page.getByRole('menuitem', { name: 'Update override' }).click()
    await this.page.waitForTimeout(3000)

    await this.page
      .getByRole('textbox', { name: 'Copyright' })
      .fill('For testing only')
    await this.page
      .getByRole('textbox', { name: 'Notice' })
      .fill('For testing only')
    await this.page.getByRole('combobox').fill('ap')
    await this.page.waitForTimeout(3000)
    await this.page.keyboard.press('Enter')

    await this.page.locator("button[type='submit']").click()
    await this.page.waitForTimeout(3000)
  }

  async deleteOverride() {
    await this.page.locator("//a[@aria-label='package']").click()
    await this.page.waitForTimeout(3000)

    await this.page.getByRole('tab', { name: 'Package Overrides' }).click()
    await this.page.waitForTimeout(3000)

    await this.page
      .getByRole('row', { name: 'classmate • Override maven 1.' })
      .getByTestId('package_actions')
      .click()
    await this.page.getByRole('menuitem', { name: 'Delete override' }).click()
    await this.page.waitForTimeout(3000)
  }

  async deleteProjectGroup() {
    await this.page.getByLabel('products').click()
    await this.page.getByRole('button', { name: 'refresh' }).click()
    await this.page.waitForTimeout(2000)
    await this.page.getByTestId('product-actions').first().click()
    await this.page.waitForTimeout(2000)
    await this.page.getByTestId('delete_product').first().click()
    await this.page.getByTestId(`delete-field`).fill('DELETE')
    await this.page.locator("button[type='submit']").click()
  }
}
