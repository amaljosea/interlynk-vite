import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'
import { cp } from 'fs'

import { LabelSelectors as ls } from '../selectors/label.selector'
import {
  generateUniqueId,
  getRandomNumberBetween,
  waitForSelectorWithMinTime
} from '../utils/utils'

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
          .locator(ls.productsHeader)
          .isVisible()

        if (productsHeader) {
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

              const labelName = `dummy label - ${uniqueId}`
              await this.page.fill(ls.labelInput, labelName)
              await this.page.locator(ls.labelColorInput).click()
              const num = getRandomNumberBetween(1, 14)

              await this.page.locator(ls.getColor(num)).hover()
              await this.page.locator(ls.getColor(num)).click()
              await this.page.keyboard.press('Tab')
              const valueAttr = await this.page
                .locator(ls.labelColorInput)
                .getAttribute('value')
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
                await waitForSelectorWithMinTime(this.page, ls.getLables(1))

                const lableSpanLength = (await this.page.$$(ls.labels)).length

                const labelArr: string[] = []

                for (let i = 0; i < lableSpanLength; i++) {
                  const labelName: any = await this.page
                    .locator(ls.getLables(i + 1))
                    .textContent()
                  labelArr.push(labelName)
                }

                if (!labelArr.includes(labelName)) {
                  errors.push('label added failed!')
                } else {
                  const index = labelArr.indexOf(labelName)
                  const color = await this.page
                    .locator(ls.getLables(index + 1))
                    .evaluate((element) => {
                      const style = window.getComputedStyle(element)
                      return style.color
                    })

                  if (color == null || color == undefined) {
                    errors.push('label color verification failed!')
                  }

                  await this.page.reload()
                  await waitForSelectorWithMinTime(this.page, ls.productsHeader)
                  await this.page.locator(ls.menuBtn).click()
                  await waitForSelectorWithMinTime(this.page, ls.updateLabel)
                  await this.page.locator(ls.updateLabel).click()

                  const labelListLength = (await this.page.$$(ls.labelLists))
                    .length

                  const labelListArr: string[] = []

                  for (let i = 0; i < labelListLength; i++) {
                    const labelName: any = await this.page
                      .locator(ls.getLabelName(i + 1))
                      .textContent()
                    labelListArr.push(labelName)
                  }

                  if (!labelListArr.includes(labelName)) {
                    errors.push('label not found!')
                  } else {
                    const index = labelArr.indexOf(labelName)
                    await this.page.locator(ls.getLabelCheckBox(index)).click()
                    await this.page.locator(ls.productsHeader).click()
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

                    const indexOfLabel = labelLisItemtArr.indexOf(labelName)

                    await this.page
                      .locator(ls.getLabelList(indexOfLabel))
                      .click()
                    await this.page.locator(ls.productsHeader).click()

                    const productWithLabelName = await this.page
                      .locator(ls.productWithLabelName(labelName))
                      .isVisible()

                    if (!productWithLabelName) {
                      errors.push(
                        `label filter failed for label name '${labelName}'`
                      )
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
