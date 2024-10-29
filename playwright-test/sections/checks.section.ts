import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class ChecksSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async check() {
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
        await this.page.getByLabel('Dropdown menu for Test').click()
        await this.page.getByRole('menuitem', { name: 'upload_sbom' }).click()

        const jsonFiles = getFileNamesFromResource('.json')

        const sbom = path.resolve(__dirname, '../resources', jsonFiles[0])
        await this.page.locator("//input[@id='fileInput']").setInputFiles(sbom)
        await this.page.waitForTimeout(2000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(2000)

        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await this.page.reload()

          await version.click()
          await this.page.waitForTimeout(2000)

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
          await this.page
            .getByPlaceholder('Enter organization name')
            .fill('IBM')
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

          await this.page.getByLabel('Dropdown menu for Test').click()
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

      await this.page.waitForTimeout(2000)
      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
