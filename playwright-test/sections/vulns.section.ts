import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class VulnsSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  // STATUS
  public async vexStatus() {
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
        await this.page
          .locator(`//button[@aria-label='dropdown menu for Test']`)
          .click()
        await this.page
          .locator(`//button[@aria-label='upload sbom for Test']`)
          .click()

        const jsonFiles = getFileNamesFromResource('.json')

        const sbomOne = path.resolve(__dirname, '../resources', jsonFiles[0])
        await this.page
          .locator("//input[@id='fileInput']")
          .setInputFiles(sbomOne)
        await this.page.waitForTimeout(2000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)

        await this.page
          .locator(`//button[@aria-label='dropdown menu for Test']`)
          .click()
        await this.page
          .locator(`//button[@aria-label='upload sbom for Test']`)
          .click()

        const sbomTwo = path.resolve(__dirname, '../resources', jsonFiles[1])
        await this.page
          .locator("//input[@id='fileInput']")
          .setInputFiles(sbomTwo)
        await this.page.waitForTimeout(2000)

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(2000)

        await product.click()

        await this.page.reload()
        await this.page.waitForTimeout(20000)
        await this.page.reload()

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'vulnerabilities' }).click()
          await this.page.waitForTimeout(1000)

          await this.page.locator('//button[@aria-label="refresh"]').click()
          await this.page.waitForTimeout(2000)

          const vulnOne = this.page.getByTestId('vexStatus').nth(0)
          const vulnTwo = this.page.getByTestId('vexStatus').nth(1)

          if (vulnOne.isVisible()) {
            await vulnOne.click()

            await this.page
              .locator('//select[@aria-label="vex_status"]')
              .selectOption({ index: 2 })
            await this.page
              .locator('//select[@aria-label="vex_justification"]')
              .selectOption({ index: 2 })
            await this.page
              .locator('//textarea[@aria-label="vex_notes"]')
              .fill('test')

            await this.page.getByRole('button', { name: 'Save' }).click()
            await this.page.waitForTimeout(2000)
            await vulnOne.click()
          } else {
            errors.push('Vuln 1 not found')
          }

          await this.page.waitForTimeout(2000)

          if (vulnTwo.isVisible()) {
            await vulnTwo.click()

            await this.page
              .locator('//select[@aria-label="vex_status"]')
              .selectOption({ index: 2 })
            await this.page
              .locator('//select[@aria-label="vex_justification"]')
              .selectOption({ index: 3 })
            await this.page
              .locator('//textarea[@aria-label="vex_notes"]')
              .fill('test')

            await this.page.getByRole('button', { name: 'Save' }).click()
            await this.page.waitForTimeout(2000)

            await this.page
              .getByRole('button', { name: 'Show History' })
              .click()
            await this.page.waitForTimeout(2000)

            await this.page.getByLabel('Close').click()
          } else {
            errors.push('Vuln 2 not found')
          }
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

  // LINKS
  public async vulnLinks() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        await this.page.reload()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'vulnerabilities' }).click()

          const action = this.page.getByTestId('vuln-actions').first()

          if (action.isVisible()) {
            await action.click()
            await this.page.waitForTimeout(1000)

            const edit = this.page.getByTestId('edit_vuln_links').first()

            if (edit.isVisible()) {
              await edit.click()
              await this.page.waitForTimeout(2000)

              await this.page.getByLabel('Type*').selectOption('issue-tracker')
              await this.page.getByPlaceholder('Add URL').fill('google.com')
              await this.page.waitForTimeout(2000)

              await this.page.locator("button[type='submit']").click()
              await this.page.waitForTimeout(4000)

              await this.page.getByLabel('Type*').selectOption('issue-tracker')
              const errMsg = await this.page
                .getByTestId('vuln_link_error')
                .isVisible()
              await this.page.waitForTimeout(2000)

              if (errMsg === false) {
                errors?.push('Link validation not working')
              } else {
                await this.page.getByTestId('delete_vuln_link').first().click()

                await this.page.waitForTimeout(4000)
                await this.page
                  .locator("//button[@aria-label='save_vuln_links']")
                  .click()

                await this.page.waitForTimeout(2000)

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
              }
            } else {
              errors.push(`Edit action not found`)
            }
          } else {
            errors.push(`Action not found`)
          }
        } else {
          errors.push(`Version not found`)
        }
      } else {
        errors.push(`Product not found`)
      }
      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  // IMPORT STATUS
  public async importStatus() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()

        await this.page.reload()
        await this.page.waitForTimeout(20000)
        await this.page.reload()

        const version = this.page.getByTestId('version').nth(1)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'vulnerabilities' }).click()

          await this.page
            .locator(`//button[@aria-label='import_status']`)
            .click()
          await this.page.waitForTimeout(2000)

          await this.page.getByLabel('Environment').selectOption({ index: 1 })
          await this.page.getByLabel('Version').selectOption({ index: 1 })
          await this.page.waitForTimeout(2000)

          await this.page
            .getByLabel('Import Vulnerability Status')
            .getByRole('button', { name: 'Next' })
            .click()

          const vulnOne = this.page
            .locator(`//input[@aria-label='select-row-undefined']`)
            .nth(0)

          if (vulnOne.isVisible()) {
            await vulnOne.check()
            await this.page.waitForTimeout(2000)

            await this.page.getByRole('button', { name: 'Submit' }).click()
            await this.page.waitForTimeout(2000)

            await this.page.getByRole('button', { name: 'Done' }).click()
            await this.page.waitForTimeout(2000)
          } else {
            errors.push('Vuln not found')
          }
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
