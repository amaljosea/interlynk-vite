import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []
const selector = `span#vulnCountCritical`
const menuBtn = `//button[@aria-label='dropdown menu for Test']`
const uploadBtn = `//button[@aria-label='upload sbom for Test']`

export default class VulnsSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async handleUpdate() {
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

    await this.page.getByTestId(`product_Test`).click()
    await this.page.waitForTimeout(2000)

    const version = this.page.getByTestId('version').nth(0)

    if (version.isVisible()) {
      await version.click()
      await this.page.waitForTimeout(3000)

      await this.page.getByRole('tab', { name: 'vulnerabilities' }).click()
      await this.page.waitForTimeout(3000)

      await this.page.locator(`//button[@aria-label='scan_vulns']`).click()
      await this.page.waitForTimeout(3000)
      await this.page.getByRole('tab', { name: 'general' }).click()

      await this.page
        .waitForSelector(selector, { state: 'visible' })
        .then(async () => {
          await this.page.getByRole('tab', { name: 'vulnerabilities' }).click()
          await this.page.waitForTimeout(2000)

          await this.page.locator('//button[@aria-label="refresh"]').click()
          await this.page.waitForTimeout(5000)

          const vulnOne = this.page.getByTestId('vexStatus-GHSA-22wj-vf5f-wrvj')
          const vulnTwo = this.page.getByTestId('vexStatus-GHSA-c43q-5hpj-4crv')

          await this.page
            .getByRole('tab', { name: 'vulnerabilities' })
            .press('ControlOrMeta+/')
          await this.page
            .getByPlaceholder('Search', { exact: true })
            .fill('GHSA-22wj-vf5f-wrvj')
          await this.page
            .getByPlaceholder('Search', { exact: true })
            .press('Enter')
          await this.page.waitForTimeout(2000)

          if (vulnOne.isVisible()) {
            await vulnOne.click()
            await this.page.waitForTimeout(1000)
            await this.page.locator('#vexType').click()
            await this.page.keyboard.type('in triage')
            await this.page.keyboard.press('Enter')
            await this.page.waitForTimeout(2000)

            await this.page
              .locator('//textarea[@aria-label="vex_notes"]')
              .fill('test')
            await this.page.waitForTimeout(2000)

            await this.page.getByRole('button', { name: 'Save' }).click()
            await this.page.waitForTimeout(2000)
            await vulnOne.click()
          } else {
            errors.push('Vuln 1 not found')
          }

          await this.page
            .getByRole('tab', { name: 'vulnerabilities' })
            .press('ControlOrMeta+/')
          await this.page
            .getByPlaceholder('Search', { exact: true })
            .fill('GHSA-c43q-5hpj-4crv')
          await this.page
            .getByPlaceholder('Search', { exact: true })
            .press('Enter')
          await this.page.waitForTimeout(2000)

          if (vulnTwo.isVisible()) {
            await vulnTwo.click()
            await this.page.waitForTimeout(1000)
            await this.page.locator('#vexType').click()
            await this.page.keyboard.type('fixed')
            await this.page.keyboard.press('Enter')
            await this.page.waitForTimeout(1000)

            await this.page
              .locator('//textarea[@aria-label="vex_notes"]')
              .fill('test')
            await this.page.waitForTimeout(1000)

            await this.page.getByRole('button', { name: 'Save' }).click()
            await this.page.waitForTimeout(2000)

            await this.page
              .getByRole('button', { name: 'Show History' })
              .click()
            await this.page.waitForTimeout(2000)

            await this.page.getByLabel('Close').click()
          } else {
            await this.page.locator('//button[@aria-label="refresh"]').click()
          }
        })
    } else {
      errors.push('Version not found')
    }
  }

  // STATUS
  public async vexStatus() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(3000)

      const product = await this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        console.log('Product "test" exists. Uploading SBOM.')
        await this.page.waitForTimeout(3000)
        await this.handleUpdate()
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
        await this.handleUpdate()
        await this.page.waitForTimeout(3000)
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  // LINKS
  public async vulnLinks() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(3000)

      const product = await this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        await this.page.getByTestId(`product_Test`).click()
        await this.page.waitForTimeout(3000)

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
                  .locator("//button[@aria-label='drawer_submit']")
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
                await this.page.getByTestId(`delete-field`).fill('DELETE')
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
      await this.page.waitForTimeout(3000)

      const product = this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        await this.page.getByTestId(`product_Test`).click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(1)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'vulnerabilities' }).click()
          await this.page.waitForTimeout(3000)

          await this.page.locator(`//button[@aria-label='scan_vulns']`).click()
          await this.page.waitForTimeout(3000)
          await this.page.getByRole('tab', { name: 'general' }).click()

          await this.page
            .waitForSelector(selector, {
              state: 'visible'
            })
            .then(async () => {
              await this.page
                .getByRole('tab', { name: 'vulnerabilities' })
                .click()
              await this.page.waitForTimeout(3000)

              await this.page
                .locator(`//button[@aria-label='import_status']`)
                .click()
              await this.page.waitForTimeout(2000)

              await this.page.locator('#vex_groups').click()
              await this.page.keyboard.press('Enter')
              await this.page.waitForTimeout(2000)

              await this.page.locator('#vex_products').click()
              await this.page.keyboard.press('Enter')
              await this.page.waitForTimeout(2000)

              await this.page.locator('#vex_versions').click()
              await this.page.keyboard.press('Enter')

              await this.page
                .locator(`//button[@aria-label='vulnStepOne']`)
                .click()

              const vulnOne = this.page
                .locator(`//input[@aria-label='select-row-undefined']`)
                .nth(0)

              if (vulnOne.isVisible()) {
                await vulnOne.check()
                await this.page.waitForTimeout(2000)

                await this.page
                  .locator(`//button[@aria-label='vulnStepTwo']`)
                  .click()
                await this.page.waitForTimeout(2000)

                await this.page
                  .locator(`//button[@aria-label='vulnStepThree']`)
                  .click()
                await this.page.waitForTimeout(2000)
              } else {
                errors.push('Vuln not found')
              }
            })
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
