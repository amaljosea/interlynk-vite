import { Page } from '@playwright/test'

import LabelSection from '../sections/label.section'

export default class ProductPage {
  page: Page
  labelSection: LabelSection

  constructor(page: Page) {
    this.page = page
    this.labelSection = new LabelSection(this.page)
  }
  public async labelFunctionality() {
    await this.labelSection.label()
  }
}
