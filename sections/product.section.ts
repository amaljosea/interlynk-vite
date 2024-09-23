import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { ProductSelectors as ps } from '../selectors/product.selector'
import { generateUniqueId, waitForSelectorWithMinTime } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class ProductSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async productsCrud() {
    try {
      const productLink = await this.page.locator(ps.productLink).isVisible()

      if (productLink) {
        await this.page.locator(ps.productLink).click()
        await waitForSelectorWithMinTime(this.page, ps.productsHeader)

        const productsHeader = await this.page
          .locator(ps.productsHeader)
          .isVisible()

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

            if (!pName) {
              errors.push('product is added failed!')
            } else {
              await this.page.locator(ps.menuBtn).click()
              await this.page.locator(ps.editProduct).click()
              await waitForSelectorWithMinTime(this.page, ps.editProductHeader)

              const editPoupup = await this.page.locator(ps.popup).isVisible()

              if (editPoupup) {
                await this.page.locator(ps.addProductDescription).clear()
                await this.page.fill(
                  ps.addProductDescription,
                  'this is updated demo product description'
                )
                await this.page.locator(ps.updateBtn).click()
                await waitForSelectorWithMinTime(this.page, ps.productSearch)

                await this.page.fill(ps.productSearch, productName)
                await this.page.press(ps.productSearch, 'Enter')
                await this.page.waitForTimeout(2000)
                await this.page.locator(ps.menuBtn).click()
                await waitForSelectorWithMinTime(this.page, ps.editProduct)
                await this.page.locator(ps.editProduct).click()
                await waitForSelectorWithMinTime(
                  this.page,
                  ps.editProductHeader
                )

                const editPoupup = await this.page.locator(ps.popup).isVisible()

                if (editPoupup) {
                  const textContent = await this.page
                    .locator(ps.addProductDescription)
                    .textContent()

                  if (
                    textContent != 'this is updated demo product description'
                  ) {
                    errors.push('product updation failed!')
                  } else {
                    await this.page.locator(ps.closeBtn).click()
                    await waitForSelectorWithMinTime(
                      this.page,
                      ps.productSearch
                    )

                    await this.page.locator(ps.menuBtn).click()
                    await waitForSelectorWithMinTime(this.page, ps.deleteBtn)
                    await this.page.locator(ps.deleteBtn).click()

                    const deletePoupup = await this.page
                      .locator(ps.popup)
                      .isVisible()

                    if (deletePoupup) {
                      const deleteProductHeader = await this.page
                        .locator(ps.deleteProductHeader)
                        .isVisible()

                      if (deleteProductHeader) {
                        await this.page.locator(ps.yesBtn).click()
                        await waitForSelectorWithMinTime(
                          this.page,
                          ps.productSearch
                        )

                        await this.page.locator(ps.productSearch).clear()
                        await this.page.waitForTimeout(2000)
                        await this.page.fill(ps.productSearch, productName)
                        await this.page.press(ps.productSearch, 'Enter')
                        await this.page.waitForTimeout(2000)

                        const noRecordMsg = await this.page
                          .locator(ps.noRecordMsg)
                          .isVisible()

                        if (!noRecordMsg) {
                          errors.push('product deleted failed!')
                        }
                      } else {
                        errors.push('delete product header is not visible!')
                      }
                    }
                  }
                }
              } else {
                errors.push('edit popup is not visible!')
              }
            }
          } else {
            errors.push('add products button not visible!')
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

  public async productsAndVersionSwitching() {
    try {
      const productLink = await this.page.locator(ps.productLink).isVisible()

      if (productLink) {
        await this.page.locator(ps.productLink).click()
        await waitForSelectorWithMinTime(this.page, ps.productsHeader)

        const productsHeader = await this.page
          .locator(ps.productsHeader)
          .isVisible()

        if (productsHeader) {
          const noRecordMsg = await this.page
            .locator(ps.noRecordMsg)
            .isVisible()

          if (!noRecordMsg) {
            const productListLen = (await this.page.$$(ps.productLists)).length
            let productNameArr: string[] = []
            let versionListarr: string[] = []

            for (let i = 0; i < productListLen; i++) {
              const productNameTxt: any = await this.page
                .locator(ps.getProductName(i + 1))
                .textContent()
              productNameArr.push(productNameTxt)
            }

            await this.page.locator(ps.firstProduct).click()
            await this.page.waitForTimeout(2000)
            for (let j = 1; j < productNameArr.length; j++) {
              await this.page.fill(ps.productSelect, '')
              await this.page.fill(ps.productSelect, productNameArr[j])
              await this.page.press(ps.productSelect, 'Tab')
              await this.page.waitForTimeout(2000)
              const productHeaderText: any = await this.page
                .locator(ps.productNameHeader)
                .textContent()

              if (
                !productHeaderText ||
                !productNameArr[j].includes(productHeaderText.trim())
              ) {
                errors.push(
                  `Name of the product '${productNameArr[j]}' is not matching with the product header. Product switching failed!`
                )
              } else {
                const versionListLen = (await this.page.$$(ps.versionList))
                  .length
                if (versionListLen > 0) {
                  for (let k = 0; k < versionListLen; k++) {
                    const versionTxt: any = await this.page
                      .locator(ps.getVersion(k + 1))
                      .textContent()
                    versionListarr.push(versionTxt)
                  }

                  for (let l = 0; l < versionListarr.length; l++) {
                    if (l == 0) {
                      await this.page.locator(ps.getVersion(l + 1)).click()
                    }
                    await waitForSelectorWithMinTime(
                      this.page,
                      ps.versionSelect
                    )
                    if (versionListarr.length > 1) {
                      await this.page.fill(ps.versionSelect, versionListarr[l])
                    }
                    // await this.page.press(ps.versionSelect, 'Enter')
                    await this.page.press(ps.versionSelect, 'Tab')
                    await this.page.waitForTimeout(2000)
                    const versionNameElementText: any = await this.page
                      .locator(ps.versionNameElement)
                      .textContent()
                    if (versionListarr[l] != versionNameElementText) {
                      errors.push(
                        `version of the product '${versionListarr[l]}' is not matching with product and version switching failed!`
                      )
                    }
                  }
                }
                versionListarr = []
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
