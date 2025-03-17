import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { getFileNamesFromResource } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class ComponentSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async createComponent() {
    await this.page
      .locator(`//button[@aria-label='dropdown menu for Test']`)
      .click()
    await this.page
      .locator(`//button[@aria-label='upload sbom for Test']`)
      .click()

    const jsonFiles = getFileNamesFromResource('.json')
    const filePath = path.resolve(__dirname, '../resources', jsonFiles[0])
    await this.page.locator("//input[@id='fileInput']").setInputFiles(filePath)

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

      await this.page.getByRole('tab', { name: 'components' }).click()
      await this.page.waitForTimeout(3000)
      await this.page.locator("button[name='add_component']").click()

      const createModal = await this.page
        .locator('.chakra-modal__content')
        .isVisible()

      if (createModal) {
        await this.page.getByPlaceholder('Enter name').fill('Kernel')
        await this.page.getByPlaceholder('Enter version').fill('1.2.3')
        await this.page.getByRole('combobox', { name: 'kind' }).click()
        await this.page.keyboard.type('application')
        await this.page.keyboard.press('Enter')
        const submitBtn = await this.page.isEnabled("button[type='submit']")
        if (submitBtn) {
          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(12000)
        }
      } else {
        errors.push('Modal not found')
      }
    } else {
      errors.push('Version not found')
    }
  }

  // COMPONENT CREATE
  public async create() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.waitForTimeout(3000)

      const product = await this.page.getByTestId(`product_Test`).isVisible()

      if (product) {
        console.log('Product "test" exists. Uploading SBOM.')
        await this.page.waitForTimeout(3000)
        await this.createComponent()
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
        await this.createComponent()
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  // COMPONENT SEARCH
  public async search() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await this.page.getByTestId('version').first().click()

          await this.page.getByRole('tab', { name: 'components' }).click()

          await this.page.waitForTimeout(5000)

          await this.page
            .getByRole('tab', { name: 'components' })
            .press('ControlOrMeta+/')
          await this.page
            .getByPlaceholder('Search', { exact: true })
            .fill('Kernel')
          await this.page
            .getByPlaceholder('Search', { exact: true })
            .press('Enter')
          const searchResult = await this.page
            .getByLabel('component_name')
            .textContent()

          await this.page.waitForTimeout(4000)

          if (searchResult !== 'Kernel') {
            errors.push('Result not found')
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

  // COMPONENT UPDATE
  public async edit() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'components' }).click()

          await this.page.getByTestId('component-actions').first().click()
          await this.page.getByTestId('edit_component').first().click()
          const description = this.page.getByRole('textbox', {
            name: 'description'
          })
          const copyright = this.page.getByRole('textbox', {
            name: 'copyright'
          })
          await description.fill('testing')
          await copyright.fill('testing')

          await this.page.getByRole('button', { name: 'Save' }).click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'identifiers' }).click()
          await this.page
            .locator('input#purl')
            .fill(
              'pkg:deb/debian/libvlc-bin@3.0.10-0+deb10u1+rpt2?arch=armhf&distro=buster'
            )
          await this.page.keyboard.press('Tab')
          await this.page.keyboard.type(
            'cpe:2.3:a:byonepress:social_locker:2.0.2:*:*:*:*:wordpress:*:*'
          )
          await this.page.waitForTimeout(5000)
          await this.page.keyboard.press('ArrowDown')
          await this.page.keyboard.press('Enter')
          await this.page.waitForTimeout(1000)

          await this.page.getByRole('button', { name: 'Save' }).click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'suppliers' }).click()
          await this.page
            .getByPlaceholder('Enter organization name')
            .fill('Interlynk')
          await this.page
            .getByPlaceholder('Enter URL')
            .fill('https://interlynk.io')
          await this.page
            .getByPlaceholder('Enter supplier name')
            .fill('Surendra')
          await this.page
            .getByPlaceholder('Enter supplier email')
            .fill('sp@interlynk.io')

          await this.page.getByRole('button', { name: 'Save' }).click()
          await this.page.waitForTimeout(2000)

          await this.page.locator("//button[@aria-label='comp_close']").click()
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

  // COMPONENT LINKS CRUD
  public async updateLinks() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'components' }).click()

          await this.page.getByTestId('component-actions').first().click()
          await this.page.getByTestId('edit_component').first().click()

          await this.page.getByRole('tab', { name: 'links' }).click()

          await this.page.getByLabel('Type*').selectOption('issue-tracker')
          await this.page.getByPlaceholder('Add URL').fill('github.com')
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('button', { name: 'Save' }).click()
          await this.page.waitForTimeout(4000)

          await this.page.getByLabel('Type*').selectOption('issue-tracker')
          const errMsg = await this.page
            .getByTestId('link_type_error')
            .isVisible()
          await this.page.waitForTimeout(2000)

          if (!errMsg) {
            errors?.push('Link validation not working')
          } else {
            await this.page.getByTestId('delete_comp_link').first().click()
            await this.page
              .getByTestId('confirm_delete_comp_link')
              .first()
              .click()
          }

          await this.page.waitForTimeout(4000)
          await this.page.locator("//button[@aria-label='comp_close']").click()
        } else {
          errors?.push('Version not found')
        }
      } else {
        errors?.push('Product not found')
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  // COMPONENT RELATIONSHIP CRUD
  public async updateRelations() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'components' }).click()

          await this.page.getByTestId('component-actions').first().click()
          await this.page.getByTestId('edit_component').first().click()

          await this.page.getByRole('tab', { name: 'relationships' }).click()

          await this.page.waitForTimeout(5000)

          await this.page
            .locator('[name="relationType"]')
            .selectOption({ index: 1 })
          await this.page.waitForTimeout(2000)

          this.page.locator('input#relationTo').fill('antlr')
          await this.page.waitForTimeout(2000)
          await this.page.keyboard.press('Enter')

          await this.page.getByRole('button', { name: 'Save' }).click()
          await this.page.waitForTimeout(2000)

          await this.page.getByTestId('delete_depends_on').first().click()
          await this.page.waitForTimeout(2000)

          await this.page.locator("button[type='submit']").click()
          await this.page.waitForTimeout(2000)

          await this.page.locator("//button[@aria-label='comp_close']").click()
          await this.page.waitForTimeout(2000)
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

  // COMPONENT DELETE
  public async delete() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'components' }).click()

          await this.page.waitForTimeout(5000)

          await this.page.getByTestId('component-actions').first().click()
          await this.page.waitForTimeout(1000)
          await this.page.getByTestId('delete_component').first().click()
          await this.page.waitForTimeout(1000)
          await this.page.locator("button[type='submit']").click()
        } else {
          errors.push('Version not found')
        }
      } else {
        errors.push('Product not found')
      }

      await this.page.waitForTimeout(3000)
    } catch (error) {
      throw error
    }
  }

  // PRIMARY COMPONENT CHANGE
  public async primary() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'components' }).click()

          await this.page.waitForTimeout(5000)

          await this.page.getByTestId('component-actions').first().click()
          await this.page.getByTestId('edit_component').first().click()

          await this.page.getByText('Primary component').click()

          const modalHeader = await this.page
            .locator("//p[@aria-label='modal_header']")
            .textContent()

          if (modalHeader === 'Primary Component Change') {
            await this.page.getByRole('button', { name: 'Yes' }).click()
            await this.page.waitForTimeout(1000)
            await this.page.getByRole('button', { name: 'Save' }).click()
            await this.page.waitForTimeout(1000)
            await this.page
              .locator("//button[@aria-label='comp_close']")
              .click()
          } else {
            errors.push('Modal not found')
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

  // COMPONENT VISIBILITY FILTER
  public async visibility() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()

      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'components' }).click()

          await this.page.waitForTimeout(5000)

          await this.page.getByRole('button', { name: 'Visibility' }).click()
          await this.page.waitForTimeout(1000)
          await this.page
            .getByRole('menuitemradio', { name: 'primary' })
            .click()

          await this.page.waitForTimeout(2000)

          const result = await this.page
            .getByLabel('component_name')
            .isVisible()

          if (!result) {
            errors.push('Result not found')
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

  // COMPONENT PURL EDITOR
  public async purlEditor() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'components' }).click()
          await this.page.waitForTimeout(3000)

          await this.page.getByTestId('component-actions').first().click()
          await this.page.waitForTimeout(1000)
          await this.page.getByTestId('edit_component').first().click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'identifiers' }).click()

          await this.page.getByTestId('purl_expand').first().click()
          await this.page.waitForTimeout(3000)

          await this.page.getByTestId('purl_type').click()
          await this.page.waitForTimeout(1000)
          await this.page.getByTestId('purl_type').selectOption('npm')
          await this.page.waitForTimeout(2000)
          await this.page.locator('#purl_namespace').click()
          await this.page.keyboard.type('react')
          await this.page.waitForTimeout(3000)
          await this.page.keyboard.press('Enter')
          await this.page.waitForTimeout(1000)
          await this.page.locator('#purl_name').click()
          await this.page.keyboard.type('react-dom')
          await this.page.waitForTimeout(3000)
          await this.page.keyboard.press('Enter')
          await this.page.waitForTimeout(1000)
          await this.page.locator('#purl_version').click()
          await this.page.keyboard.type('2.3.5')
          await this.page.waitForTimeout(3000)
          await this.page.keyboard.press('Enter')
          await this.page.waitForTimeout(1000)
          await this.page.getByTestId('purl_qualifiers').fill('type=jar')
          await this.page.waitForTimeout(1000)
          await this.page.getByRole('button', { name: 'Save PURL' }).click()

          await this.page.getByLabel('Close').click()
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

  // COMPONENT CPE EDITOR
  public async cpeEditor() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(3000)

          await this.page.getByRole('tab', { name: 'components' }).click()
          await this.page.waitForTimeout(3000)

          await this.page.getByTestId('component-actions').first().click()
          await this.page.waitForTimeout(1000)
          await this.page.getByTestId('edit_component').first().click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'identifiers' }).click()

          await this.page.getByTestId('cpe_expand').first().click()
          await this.page.waitForTimeout(2000)

          await this.page.getByTestId('cpe_part').click()
          await this.page.waitForTimeout(1000)
          await this.page.getByTestId('cpe_part').selectOption('a')
          await this.page.waitForTimeout(3000)
          await this.page.locator('#cpe_vendor').click()
          await this.page.keyboard.type('calibre-ebook')
          await this.page.waitForTimeout(3000)
          await this.page.keyboard.press('Enter')
          await this.page.waitForTimeout(1000)
          await this.page.locator('#cpe_product').click()
          await this.page.keyboard.type('calibre')
          await this.page.waitForTimeout(3000)
          await this.page.keyboard.press('Enter')
          await this.page.waitForTimeout(1000)
          await this.page.locator('#cpe_version').click()
          await this.page.keyboard.type('1.0')
          await this.page.waitForTimeout(3000)
          await this.page.keyboard.press('Enter')
          await this.page.waitForTimeout(1000)

          await this.page.getByRole('button', { name: 'Save CPE' }).click()

          await this.page.getByRole('button', { name: 'Save' }).click()
          await this.page.waitForTimeout(2000)

          await this.page.getByLabel('Close').click()
          await this.page.waitForTimeout(1000)
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

  // COMPONENT RELATIONS
  public async relationship() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'components' }).click()
          await this.page.waitForTimeout(3000)

          await this.page.getByTestId('component-actions').first().click()
          await this.page.waitForTimeout(1000)
          await this.page.getByTestId('view_relation').first().click()

          const parentComp = this.page
            .locator("//p[@aria-label='parent_comp']")
            .first()
            .isVisible()

          if (parentComp) {
            await this.page.getByLabel('Close').click()
          } else {
            errors.push('Parent component not found')
          }

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

  // COMPONENT INSIGHTS
  public async insights() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page.getByTestId(`product_Test`)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        const version = this.page.getByTestId('version').nth(0)

        if (version.isVisible()) {
          await version.click()
          await this.page.waitForTimeout(2000)

          await this.page.getByRole('tab', { name: 'components' }).click()

          await this.page.waitForTimeout(5000)

          await this.page.getByTestId('component-actions').first().click()
          await this.page.getByTestId('view_insights').first().click()

          const parentComp = this.page
            .locator("//p[@aria-label='comp_name']")
            .isVisible()

          if (parentComp) {
            await this.page.getByLabel('Close').click()
          } else {
            errors.push('component name tag not found')
          }

          await this.page.waitForTimeout(2000)

          await this.page.locator("//a[@aria-label='products']").click()
          await this.page.getByTestId('product-actions').first().click()

          await this.page.waitForTimeout(2000)

          await this.page.getByTestId('delete_product').first().click()
          await this.page.getByTestId(`delete-field`).fill('DELETE')
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
