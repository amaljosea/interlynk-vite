import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { ShareLynkSelectors as ss } from '../selectors/sharelynks.selector'
import { generateUniqueId, waitForSelectorWithMinTime } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class SharelynkSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async sharelynk() {
    try {
      const productLink = await this.page.locator(ss.productLink).isVisible()

      if (productLink) {
        await this.page.locator(ss.productLink).click()
        await waitForSelectorWithMinTime(this.page, ss.productsHeader)

        const productsHeader = await this.page
          .locator(ss.productsHeader)
          .isVisible()

        if (productsHeader) {
          const addProductButton = await this.page
            .locator(ss.addProductButton)
            .isVisible()

          if (addProductButton) {
            await this.page.locator(ss.addProductButton).click()
            await waitForSelectorWithMinTime(this.page, ss.popup)

            const uniqueId = generateUniqueId()

            const productName = `demo product - ${uniqueId}`
            await this.page.fill(ss.addProductName, productName)
            await this.page.fill(
              ss.addProductDescription,
              'this is a sample demo product description'
            )
            await this.page.locator(ss.saveBtn).click()
            await waitForSelectorWithMinTime(this.page, ss.productSearch)
            await this.page.fill(ss.productSearch, productName)
            await this.page.press(ss.productSearch, 'Enter')
            await this.page.waitForTimeout(2000)

            const pName = await this.page
              .locator(ss.productName(productName))
              .isVisible()

            if (pName) {
              await waitForSelectorWithMinTime(this.page, ss.productSearch)
              await this.page.fill(ss.productSearch, productName)
              await this.page.press(ss.productSearch, 'Enter')
              await this.page.waitForTimeout(2000)
              await this.page.locator(ss.menuBtn).click()
              await waitForSelectorWithMinTime(this.page, ss.viewShareLink)
              await this.page.locator(ss.viewShareLink).click()
              await waitForSelectorWithMinTime(this.page, ss.shareLynkHeader)

              const shareLynkPopup = await this.page
                .locator(ss.shareLynkPopup)
                .isVisible()

              if (!shareLynkPopup) {
                errors.push('sharelynk popup is not display!')
              } else {
                await this.page.locator(ss.addShareLynkButton).click()
                await waitForSelectorWithMinTime(
                  this.page,
                  ss.createShareLynkPoupup
                )

                const createShareLynkPoupup = await this.page
                  .locator(ss.createShareLynkPoupup)
                  .isVisible()

                if (!createShareLynkPoupup) {
                  errors.push('create sharelynk popup is not display')
                } else {
                  //   await this.page.locator(ss.noExpirationCheckBox).click()
                  await this.page.locator(ss.noExpirationSpan).hover()
                  await this.page.locator(ss.noExpirationSpan).click()

                  await this.page.locator(ss.addBtn).click()
                  await waitForSelectorWithMinTime(
                    this.page,
                    ss.shareLynkHeader
                  )
                  const linkUrl: any = await this.page
                    .locator(ss.link)
                    .getAttribute('value')

                  const newPage = await this.page.context().newPage()
                  await newPage.goto(linkUrl)
                  await waitForSelectorWithMinTime(
                    newPage,
                    ss.productNameParagraph
                  )
                  const productNameParagraphTxt: any = await newPage
                    .locator(ss.productNameParagraph)
                    .textContent()
                  const cleanedProductName = productNameParagraphTxt?.replace(
                    /\.\.\.$/,
                    ''
                  )
                  if (!productName.includes(cleanedProductName)) {
                    errors.push('sharelynk verification failed')
                  }

                  await newPage.close()
                  await waitForSelectorWithMinTime(this.page, ss.closeBtn)
                  await this.page.locator(ss.closeBtn).click()
                  await waitForSelectorWithMinTime(this.page, ss.menuBtn)
                  await this.page.locator(ss.menuBtn).click()
                  await waitForSelectorWithMinTime(this.page, ss.deleteBtn)
                  await this.page.locator(ss.deleteBtn).click()

                  const deletePoupup = await this.page
                    .locator(ss.popup)
                    .isVisible()

                  if (deletePoupup) {
                    const deleteProductHeader = await this.page
                      .locator(ss.deleteProductHeader)
                      .isVisible()

                    if (deleteProductHeader) {
                      await this.page.locator(ss.yesBtn).click()
                      await waitForSelectorWithMinTime(
                        this.page,
                        ss.productSearch
                      )

                      await this.page.locator(ss.productSearch).clear()
                      await this.page.waitForTimeout(2000)
                      await this.page.fill(ss.productSearch, productName)
                      await this.page.press(ss.productSearch, 'Enter')
                      await this.page.waitForTimeout(2000)

                      const noRecordMsg = await this.page
                        .locator(ss.noRecordMsg)
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
}
