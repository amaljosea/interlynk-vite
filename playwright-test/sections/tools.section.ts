import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

const errors: string[] = []
const menuBtn = `//button[@aria-label='dropdown menu for Test']`
const uploadBtn = `//button[@aria-label='upload sbom for Test']`

export default class Tools {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async uploadSBOMs() {
    await this.page.locator(menuBtn).click()
    await this.page.locator(uploadBtn).click()

    const jsonFiles = getFileNamesFromResource('.json')

    const sbomOne = path.resolve(__dirname, '../resources', jsonFiles[0])
    await this.page.locator("//input[@id='fileInput']").setInputFiles(sbomOne)
    await this.page.waitForTimeout(2000)

    await this.page.locator("button[type='submit']").click()
    await this.page.waitForTimeout(3000)

    await this.page.locator(menuBtn).click()
    await this.page.locator(uploadBtn).click()

    const sbomTwo = path.resolve(__dirname, '../resources', jsonFiles[1])
    await this.page.locator("//input[@id='fileInput']").setInputFiles(sbomTwo)
    await this.page.waitForTimeout(2000)

    await this.page.locator("button[type='submit']").click()
    await this.page.waitForTimeout(2000)

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
        await this.uploadSBOMs()
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
        await this.uploadSBOMs()
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  async compareSBOMs() {
    await this.page.locator("//a[@aria-label='products']").click()
    await this.page.waitForTimeout(5000)

    await this.page.locator("//button[@aria-label='refresh']").click()
    await this.page.waitForTimeout(5000)

    await this.page.locator("//a[@aria-label='tools']").click()

    // SBOM ONE
    await this.page.waitForTimeout(5000)

    await this.page.getByRole('combobox', { name: 'groupOne' }).click()
    await this.page.keyboard.type('Test')
    await this.page.waitForTimeout(10000)
    await this.page.keyboard.press('Enter')

    await this.page.getByRole('combobox', { name: 'productOne' }).click()
    await this.page.keyboard.type('Default')
    await this.page.keyboard.press('Enter')
    await this.page.waitForTimeout(5000)

    await this.page.getByRole('combobox', { name: 'versionOne' }).click()
    await this.page.keyboard.type('2.0.31')
    await this.page.keyboard.press('Enter')

    // SBOM TWO
    await this.page.waitForTimeout(5000)

    await this.page.getByRole('combobox', { name: 'groupTwo' }).click()
    await this.page.keyboard.type('Test')
    await this.page.waitForTimeout(10000)
    await this.page.keyboard.press('Enter')

    await this.page.getByRole('combobox', { name: 'productTwo' }).click()
    await this.page.keyboard.type('Default')
    await this.page.keyboard.press('Enter')
    await this.page.waitForTimeout(5000)

    await this.page.getByRole('combobox', { name: 'versionTwo' }).click()
    await this.page.keyboard.type('2.0.32')
    await this.page.keyboard.press('Enter')

    await this.page.waitForTimeout(3000)
    await this.page.getByRole('button', { name: 'Compare' }).click()
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
