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
      const productLink = await this.page.locator(ds.productLink).isVisible()

      if (productLink) {
        await this.page.locator(ds.productLink).click()
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
                                  await this.page.fill(
                                    ds.versionSearch,
                                    version
                                  )
                                  await this.page.press(
                                    ds.versionSearch,
                                    'Enter'
                                  )
                                  await waitForSelectorWithMinTime(
                                    this.page,
                                    ds.noRecordMsg
                                  )
                                  const noRecordMsg = await this.page
                                    .locator(ds.noRecordMsg)
                                    .isVisible()

                                  if (!noRecordMsg) {
                                    errors.push('deletion of SBOM failed!')
                                  } else {
                                    await this.page.goBack()
                                    await this.page.waitForSelector(
                                      ps.productSearch,
                                      { state: 'visible', timeout: 5000 }
                                    )
                                    await this.page.fill(
                                      ps.productSearch,
                                      productName
                                    )
                                    await this.page.press(
                                      ps.productSearch,
                                      'Enter'
                                    )
                                    await this.page.waitForTimeout(2000)
                                    await this.page.locator(ps.menuBtn).click()
                                    await waitForSelectorWithMinTime(
                                      this.page,
                                      ps.deleteBtn
                                    )
                                    await this.page
                                      .locator(ps.deleteBtn)
                                      .click()

                                    const deletePoupup = await this.page
                                      .locator(ps.popup)
                                      .isVisible()

                                    if (deletePoupup) {
                                      const deleteProductHeader =
                                        await this.page
                                          .locator(ps.deleteProductHeader)
                                          .isVisible()

                                      if (deleteProductHeader) {
                                        await this.page
                                          .locator(ps.yesBtn)
                                          .click()
                                        await waitForSelectorWithMinTime(
                                          this.page,
                                          ps.productSearch
                                        )

                                        await this.page
                                          .locator(ps.productSearch)
                                          .clear()
                                        await this.page.waitForTimeout(2000)
                                        await this.page.fill(
                                          ps.productSearch,
                                          productName
                                        )
                                        await this.page.press(
                                          ps.productSearch,
                                          'Enter'
                                        )
                                        await this.page.waitForTimeout(2000)

                                        const noRecordMsg = await this.page
                                          .locator(ps.noRecordMsg)
                                          .isVisible()

                                        if (!noRecordMsg) {
                                          errors.push('product deleted failed!')
                                        }
                                      } else {
                                        errors.push(
                                          'delete product header is not visible!'
                                        )
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
              }
            }
          }
        } else {
          errors.push('products header verification failed')
        }
      } else {
        errors.push('product link is not visible properly!')
      }

      if (errors.length > 0) {
        throw new Error(`Errors encountered:\n${errors.join('\n')}`)
      }
      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
