import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { ComponentSelector as cs } from '../selectors/component.selector'
import { ProductSelectors as ps } from '../selectors/product.selector'
import { ProductDetailsSelectors as ds } from '../selectors/product_details.selector'
import {
  getFileNamesFromResource,
  waitForSelectorWithMinTime
} from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class ComponentSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  // CHECK PRODUCT
  public async checkProduct() {
    try {
      const productMenu = await this.page.isVisible(
        "//a[@aria-label='products']"
      )

      if (productMenu) {
        await this.page.locator("//a[@aria-label='products']").click()
        const product = await this.page.isVisible(
          "(//p[@aria-label='product_name'])[1]"
        )

        if (product) {
          await expect(
            this.page.locator("(//p[@aria-label='product_name'])[1]")
          ).toBeVisible()
        } else {
          await this.page.locator("//button[@aria-label='Add product']").click()
          await this.page
            .getByPlaceholder('Add product name')
            .fill('my product')
          await this.page
            .getByPlaceholder('Add product description')
            .fill('for testing')
          await this.page.locator("button[aria-label='submit']").click()
        }
      } else {
        errors.push('Product menu not found')
      }
    } catch (error) {
      throw error
    }
  }

  // CHECK VERSION
  public async checkVersion() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.locator("(//p[@aria-label='product_name'])[1]").click()

      const version = await this.page.isVisible(
        "(//a[@aria-label='version'])[1]"
      )

      if (version) {
        await expect(
          this.page.locator("(//a[@aria-label='version'])[1]")
        ).toBeVisible()
      } else {
        await this.page.locator(ds.uploadBtn).click()
        await waitForSelectorWithMinTime(this.page, ds.uplaodPopup)
        await this.page.waitForSelector(ds.uplaodPopup, {
          state: 'visible',
          timeout: 5000
        })
        const uploadHeaderTxt = await this.page
          .locator(ds.uploadPopupHeader)
          .textContent()

        if (uploadHeaderTxt != 'Upload SBOM') {
          errors.push('upload popup verification failed!')
        } else {
          await this.page
            .getByText('Drop SBOM here, or click to select a file')
            .click()
          const jsonFiles = getFileNamesFromResource('.json')
          const filePath = path.resolve(__dirname, '../resources', jsonFiles[0])
          this.page.locator("//input[@id='fileInput']").setInputFiles(filePath)
          await this.page.locator("button[aria-label='submit']").click()
          await this.page
            .locator("(//button[@aria-label='refresh'])[1]")
            .click()
        }
      }
    } catch (error) {
      throw error
    }
  }

  // COMPONENT CREATE
  public async create() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.locator("(//p[@aria-label='product_name'])[1]").click()
      await this.page.locator("(//a[@aria-label='version'])[1]").click()

      await this.page.getByRole('tab', { name: 'components' }).click()
      await this.page.locator("button[name='add_component']").click()

      const createModal = await this.page.isVisible('.chakra-modal__content')

      if (createModal) {
        await this.page.getByPlaceholder('Enter name').fill('test name')
        await this.page.getByPlaceholder('Enter version').fill('1.2.3')
        await this.page
          .getByRole('combobox', { name: 'kind' })
          .selectOption('application')
        const submitBtn = await this.page.isEnabled("button[type='submit']")
        if (submitBtn) {
          await this.page.locator("button[type='submit']").click()
        }
      } else {
        errors.push('Modal not found')
      }
    } catch (error) {
      throw error
    }
  }

  // COMPONENT UPDATE
  public async edit() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.locator("(//p[@aria-label='product_name'])[1]").click()
      await this.page.locator("(//a[@aria-label='version'])[1]").click()

      await this.page.getByRole('tab', { name: 'components' }).click()

      await this.page.getByTestId('component-actions').first().click()
      await this.page.getByRole('menuitem', { name: 'Edit Component' }).click()
      const description = this.page.getByRole('textbox', {
        name: 'description'
      })
      const copyright = this.page.getByRole('textbox', {
        name: 'copyright'
      })
      await description.fill('testing')
      await copyright.fill('testing')
      const detailsSave = this.page.getByRole('button', { name: 'Save' })
      !detailsSave.isDisabled() && detailsSave.click()

      await this.page.getByRole('tab', { name: 'identifiers' }).click()
      await this.page
        .getByPlaceholder('PURL')
        .fill(
          'pkg:deb/debian/libvlc-bin@3.0.10-0+deb10u1+rpt2?arch=armhf&distro=buster'
        )
      await this.page
        .getByPlaceholder('CPE')
        .fill('cpe:2.3:a:byonepress:social_locker:2.0.2:*:*:*:*:wordpress:*:*')
      const IdtSave = this.page.getByRole('button', { name: 'Save' })
      !IdtSave.isDisabled() && IdtSave.click()

      await this.page.getByRole('tab', { name: 'suppliers' }).click()
      await this.page
        .getByPlaceholder('Enter organization name')
        .fill('Interlynk')
      await this.page.getByPlaceholder('Enter URL').fill('https://interlynk.io')
      await this.page.getByPlaceholder('Enter supplier name').fill('Surendra')
      await this.page
        .getByPlaceholder('Enter supplier email')
        .fill('sp@interlynk.io')
      const supplierSave = this.page.getByRole('button', {
        name: 'Add Supplier'
      })
      !supplierSave.isDisabled() && supplierSave.click()

      await this.page.getByRole('tab', { name: 'links' }).click()
      await this.page.getByLabel('Type*').selectOption('issue-tracker')
      await this.page.getByPlaceholder('Add URL').fill('github.com')
      const linkSave = this.page.getByRole('button', { name: 'Add Link' })
      !linkSave.isDisabled() && linkSave.click()

      await this.page.getByLabel('Close').click()
    } catch (error) {
      throw error
    }
  }

  // COMPONENT DELETE
  public async delete() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await this.page.locator("(//p[@aria-label='product_name'])[1]").click()
      await this.page.locator("(//a[@aria-label='version'])[1]").click()

      await this.page.getByRole('tab', { name: 'components' }).click()

      await this.page.getByTestId('component-actions').first().click()
      await this.page.getByRole('menuitem', { name: 'Delete' }).click()
      await this.page.locator("button[type='submit']").click()
    } catch (error) {
      throw error
    }
  }
}
