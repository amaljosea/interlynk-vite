import { Page } from '@playwright/test'

import ComponentSection from '../sections/component.section'

export default class ComponentPage {
  page: Page
  componentSection: ComponentSection

  constructor(page: Page) {
    this.page = page
    this.componentSection = new ComponentSection(this.page)
  }

  public async checkProduct() {
    await this.componentSection.checkProduct()
  }

  public async checkVersion() {
    await this.componentSection.checkVersion()
  }

  public async createComponent() {
    await this.componentSection.create()
  }

  public async deleteComponent() {
    await this.componentSection.delete()
  }

  public async editComponent() {
    await this.componentSection.edit()
  }
}
