import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { LabelSelectors as ls } from '../selectors/label.selector'
import { ProductSelectors as ps } from '../selectors/product.selector'
import { generateUniqueId, waitForSelectorWithMinTime } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class LabelSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async label() {
    try {
      const productLink = await this.page.locator(ls.productLink).isVisible()

      if (productLink) {
        await this.page.locator(ls.productLink).click()
        await waitForSelectorWithMinTime(this.page, ls.productsHeader)

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

            if (pName) {
              const addLabelButton = await this.page
                .locator(ls.addLabelButton)
                .isVisible()

              if (addLabelButton) {
                await this.page.locator(ls.addLabelButton).click()
                await waitForSelectorWithMinTime(this.page, ls.labelPopup)

                const labelPopup = await this.page
                  .locator(ls.labelPopup)
                  .isVisible()

                if (labelPopup) {
                  const uniqueId = generateUniqueId()

                  const labelName = `${uniqueId}`

                  await this.page.fill(ls.labelInput, labelName)
                  await this.page.locator(ls.addLabel).click()
                  await this.page.waitForSelector(ls.labelAddSuccessMsg, {
                    state: 'visible'
                  })

                  const labelAddSuccessMsg = await this.page
                    .locator(ls.labelAddSuccessMsg)
                    .isVisible()

                  if (!labelAddSuccessMsg) {
                    errors.push('label added success message verified failed!')
                  } else {
                    const label = this.page.getByTestId('product_label').first()
                    await waitForSelectorWithMinTime(this.page, label)

                    const lableSpanLength = await this.page
                      .getByTestId('product_label')
                      .count()

                    const labelArr: string[] = []
                    let lName: any

                    for (let i = 0; i < lableSpanLength; i++) {
                      lName = await this.page
                        .getByTestId('product_label')
                        .first()
                        .textContent()

                      labelArr.push(lName)
                    }

                    if (!labelArr.includes(lName)) {
                      errors.push('label added failed!')
                    } else {
                      const index = labelArr.indexOf(lName)

                      if (index >= 0) {
                        const color = await this.page
                          .getByTestId('product_label')
                          .first()
                          .evaluate((element) => {
                            const style = window.getComputedStyle(element)
                            return style.color
                          })

                        if (color == null || color == undefined) {
                          errors.push('label color verification failed!')
                        }

                        await this.page.reload()
                        // await waitForSelectorWithMinTime(
                        //   this.page,
                        //   ls.productsHeader
                        // )
                        await waitForSelectorWithMinTime(
                          this.page,
                          ps.productSearch
                        )
                        await this.page.fill(ps.productSearch, productName)
                        await this.page.press(ps.productSearch, 'Enter')
                        await this.page.waitForTimeout(2000)

                        await this.page.locator(ls.menuBtn).click()
                        await waitForSelectorWithMinTime(
                          this.page,
                          ls.addLabelBtn
                        )
                        await this.page.locator(ls.addLabelBtn).click()

                        const labelListLength = (
                          await this.page.$$(ls.labelLists)
                        ).length

                        if (labelListLength >= 1) {
                          const lName: any = await this.page
                            .locator(ls.getLabelName(1))
                            .textContent()

                          await this.page
                            .locator(ls.getLabelCheckBox(1))
                            .click()

                          await this.page.locator(ls.productsHeader).click()
                          await this.page.waitForTimeout(2000)
                          await this.page.locator(ls.labelFilterBtn).click()

                          const labelListItemLength = (
                            await this.page.$$(ls.labelLists)
                          ).length

                          const labelLisItemtArr: string[] = []

                          for (let i = 0; i < labelListItemLength; i++) {
                            const labelListItemName: any = await this.page
                              .locator(ls.getLabelList(i + 1))
                              .textContent()
                            labelLisItemtArr.push(labelListItemName)
                          }

                          const indexOfLabel = labelLisItemtArr.indexOf(lName)

                          await this.page
                            .locator(ls.getLabelList(indexOfLabel))
                            .click()
                          await this.page.locator(ls.productsHeader).click()
                          await this.page.waitForTimeout(2000)
                          const productWithLabelName = await this.page
                            .locator(ls.productWithLabelName(lName))
                            .isVisible()

                          if (!productWithLabelName) {
                            errors.push(
                              `label filter failed for label name '${lName}'`
                            )
                          }

                          await this.page.locator(ps.menuBtn).click()
                          await waitForSelectorWithMinTime(
                            this.page,
                            ps.deleteBtn
                          )
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
                              await this.page.fill(
                                ps.productSearch,
                                productName
                              )
                              await this.page.press(ps.productSearch, 'Enter')
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
                } else {
                  errors.push('label popup is not visible!')
                }
              } else {
                errors.push('add label button is not visible!')
              }
            }
          }
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
