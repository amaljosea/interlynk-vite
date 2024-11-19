import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []
const menuBtn = `//button[@aria-label='dropdown menu for Test']`
const uploadBtn = `//button[@aria-label='upload sbom for Test']`
const deleteBtn = `//button[@aria-label='Delete product Test']`

export default class ChecksSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async addSBOM() {
    await this.page.locator(menuBtn).click()
    await this.page.locator(uploadBtn).click()

    const jsonFiles = getFileNamesFromResource('.json')

    const sbom = path.resolve(__dirname, '../resources', jsonFiles[0])
    await this.page.locator("//input[@id='fileInput']").setInputFiles(sbom)
    await this.page.waitForTimeout(2000)

    await this.page.locator("button[type='submit']").click()
    await this.page.waitForTimeout(2000)

    await this.page.getByTestId(`product_Test`).click()
    await this.page.waitForTimeout(2000)

    const version = await this.page.getByTestId('version').nth(0).isVisible()

    if (version) {
      await this.page.getByTestId('version').nth(0).click()
      await this.page.waitForTimeout(2000)

      await this.page
        .getByRole('row', { name: 'Authors STERIS -' })
        .getByLabel('close')
        .click()
      await this.page.getByRole('button', { name: 'Yes' }).click()
      await this.page.waitForTimeout(3000)

      await this.page
        .getByRole('gridcell', { name: 'STERIS close' })
        .getByLabel('close')
        .click()
      await this.page.getByRole('button', { name: 'Yes' }).click()
      await this.page.waitForTimeout(3000)

      await this.page.getByRole('tab', { name: 'checks' }).click()
      await this.page.waitForTimeout(2000)

      await this.page.getByTestId('filter_Check ID').click()
      await this.page
        .getByRole('menuitemcheckbox', { name: 'SB-HC-8: Document has' })
        .click()
      await this.page
        .getByRole('row', { name: 'SB-HC-8 medium Document has' })
        .getByRole('button')
        .first()
        .click()
      await this.page.getByPlaceholder('Enter organization name').fill('IBM')
      await this.page.locator("button[type='submit']").click()
      await this.page.waitForTimeout(2000)

      await this.page.reload()
      await this.page.waitForTimeout(3000)

      await this.page
        .getByRole('row', { name: 'SB-HC-8 medium Document has' })
        .getByRole('button')
        .first()
        .click()
      await this.page.waitForTimeout(2000)
      await this.page.getByLabel('Close').click()
      await this.page.waitForTimeout(2000)

      await this.page.getByTestId('filter_Check ID').click()
      await this.page.getByRole('menuitemcheckbox', { name: 'All' }).click()
      await this.page
        .getByRole('menuitemcheckbox', {
          name: 'SB-HC-7: Document has authors'
        })
        .click()
      await this.page
        .getByRole('row', { name: 'SB-HC-7 medium Document has' })
        .getByRole('button')
        .nth(1)
        .click()
      await this.page.waitForTimeout(3000)

      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(2000)

      await this.page.locator(menuBtn).click()
      await this.page.locator(deleteBtn).click()
      await this.page.locator("button[type='submit']").click()
    }
  }

  public async check() {
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
}
