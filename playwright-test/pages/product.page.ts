import { Page } from '@playwright/test'

import ProductSection from '../sections/product.section'

export default class ProductPage {
  page: Page
  productSection: ProductSection

  constructor(page: Page) {
    this.page = page
    this.productSection = new ProductSection(this.page)
  }
  public async productsCrudFunctionality() {
    await this.productSection.productsCrud()
  }

  public async productsAndVersionSwitchingFunctionality() {
    await this.productSection.productsAndVersionSwitching()
  }

  public async productsDisableAndEnableFunctionality() {
    await this.productSection.productsDisableEnable()
  }
}
