import { Page } from '@playwright/test'

import ProductDetailsSection from '../sections/product_details.section'

export default class ProductDetailsPage {
  page: Page
  productDetailsSection: ProductDetailsSection

  constructor(page: Page) {
    this.page = page
    this.productDetailsSection = new ProductDetailsSection(this.page)
  }
  public async productUploadDeleteFunctionality() {
    await this.productDetailsSection.productUplaodDelete()
  }
}
