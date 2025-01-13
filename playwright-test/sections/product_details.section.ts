import * as dotenv from 'dotenv'
import * as path from 'path'
import { Page, expect } from '@playwright/test'

import { ProductSelectors as ps } from '../selectors/product.selector'
import { ProductDetailsSelectors as ds } from '../selectors/product_details.selector'
import {
  generateUniqueId,
  getFileNamesFromResource,
  getVersionFromJson,
  waitForSelectorWithMinTime
} from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class ProductDetailsSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async productUplaodDelete() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      await waitForSelectorWithMinTime(this.page, ds.productsHeader)

      const productsHeader = await this.page
        .locator(ds.productsHeader)
        .isVisible()

      if (productsHeader) {
        if (productsHeader) {
          const addProductButton = await this.page
            .locator(ps.addProductButton)
            .isVisible()

          if (addProductButton) {
            await this.page.locator(ps.addProductButton).click()
            await waitForSelectorWithMinTime(this.page, ps.popup)

            const uniqueId = generateUniqueId()

            const productName = `demo product - ${uniqueId}`
            await this.page.fill(ps.addProductName, productName)
            await this.page.fill(
              ps.addProductDescription,
              'this is a sample demo product description'
            )
            await this.page.locator(ps.saveBtn).click()
            await waitForSelectorWithMinTime(this.page, ps.productSearch)
            await this.page.fill(ps.productSearch, productName)
            await this.page.press(ps.productSearch, 'Enter')
            await this.page.waitForTimeout(2000)

            const pName = await this.page
              .locator(ps.productName(productName))
              .isVisible()

            if (pName) {
              const productName: any = await this.page
                .locator(ds.getProductName(1))
                .textContent()

              const pName = await this.page
                .locator(ds.productName(productName))
                .isVisible()

              if (!pName) {
                errors.push('product is not found!')
              } else {
                const product = await this.page
                  .locator(ds.getProduct(productName))
                  .isVisible()

                if (!product) {
                  errors.push('product is not visible')
                } else {
                  await this.page.locator(ds.getProduct(productName)).click()
                  await waitForSelectorWithMinTime(this.page, ds.uploadBtn)
                  const productNameHeader = await this.page
                    .locator(ds.pNameHeader(productName))
                    .isVisible()
                  if (!productNameHeader) {
                    errors.push('product name header verified failed!')
                  } else {
                    const uploadButton = await this.page
                      .locator(ds.uploadBtn)
                      .isVisible()
                    if (!uploadButton) {
                      errors.push('upload button is not visible!')
                    } else {
                      await this.page.locator(ds.uploadBtn).click()
                      await waitForSelectorWithMinTime(
                        this.page,
                        ds.uplaodPopup
                      )
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
                        const jsonFiles = getFileNamesFromResource('.json')
                        const filePath = path.resolve(
                          __dirname,
                          '../resources',
                          jsonFiles[0]
                        )
                        this.page
                          .locator(ds.uploadFileInput)
                          .setInputFiles(filePath)

                        await waitForSelectorWithMinTime(this.page, ds.upload)

                        const uplaodBtnStatus = await this.page
                          .locator(ds.upload)
                          .isEnabled()

                        if (!uplaodBtnStatus) {
                          errors.push(
                            'upload button is not enalbed for uploading file!'
                          )
                        } else {
                          await this.page.locator(ds.upload).click()
                          await waitForSelectorWithMinTime(
                            this.page,
                            ds.uploadSuccessMsg
                          )

                          const uploadSuccessMsg = await this.page
                            .locator(ds.uploadSuccessMsg)
                            .isVisible()

                          if (!uploadSuccessMsg) {
                            errors.push('file upload failed!')
                          } else {
                            await this.page.waitForSelector(
                              ds.uploadSuccessMsg,
                              {
                                state: 'hidden'
                              }
                            )

                            const version: any = getVersionFromJson(
                              jsonFiles[0]
                            )
                            await this.page.fill(ds.versionSearch, version)
                            await this.page.press(ds.versionSearch, 'Enter')
                            await this.page.locator(ds.versionBtn).click()
                            const versionElementText = await this.page
                              .locator(ds.versionElement(version))
                              .textContent()

                            if (versionElementText != version) {
                              errors.push(
                                'uploaded SBOM version verification failed!'
                              )
                            }
                            {
                              await this.page.locator(ds.getMenu(1)).click()
                              await this.page.locator(ds.deleteBtn).click()
                              await waitForSelectorWithMinTime(
                                this.page,
                                ds.deletePopup
                              )
                              const deletePopup = await this.page
                                .locator(ds.deletePopup)
                                .isVisible()

                              if (!deletePopup) {
                                errors.push('delete popup is not visible!')
                              } else {
                                await this.page.locator(ds.yesBtn).click()
                                await this.page.waitForSelector(
                                  ds.deletePopup,
                                  {
                                    state: 'hidden'
                                  }
                                )
                                await this.page.fill(ds.versionSearch, version)
                                await this.page.press(ds.versionSearch, 'Enter')
                                await this.page.waitForTimeout(2000)
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        errors.push('products header verification failed')
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  public async edit() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        await this.page.locator(`//button[@aria-label='edit_product']`).click()
        await this.page.waitForTimeout(2000)

        await this.page
          .getByPlaceholder('Add product description')
          .fill('for testing only')
        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)
      }
    } catch (error) {
      throw error
    }
  }

  public async delete() {
    try {
      await this.page.locator("//a[@aria-label='products']").click()
      const product = this.page
        .locator(`//p[@aria-label='product_name']`)
        .nth(0)

      if (product.isVisible()) {
        await product.click()
        await this.page.waitForTimeout(2000)

        await this.page
          .locator(`//button[@aria-label='delete_product']`)
          .click()
        await this.page.waitForTimeout(2000)
        await this.page.getByTestId(`delete-field`).fill('DELETE')

        await this.page.locator("button[type='submit']").click()
        await this.page.waitForTimeout(3000)
      }
    } catch (error) {
      throw error
    }
  }
}
