import { Page } from '@playwright/test'

import GeneralSection from '../sections/general.section'

export default class GeneralPage {
  page: Page
  generalSection: GeneralSection

  constructor(page: Page) {
    this.page = page
    this.generalSection = new GeneralSection(this.page)
  }

  public async tools() {
    await this.generalSection.tools()
  }

  public async authors() {
    await this.generalSection.author()
  }

  public async supplier() {
    await this.generalSection.supplier()
  }

  public async license() {
    await this.generalSection.license()
  }
}
