import { Page } from '@playwright/test'

import SupportSection from '../sections/support.section'

export default class SupportPage {
  page: Page
  supportSection: SupportSection

  constructor(page: Page) {
    this.page = page
    this.supportSection = new SupportSection(this.page)
  }

  public async support() {
    await this.supportSection.support()
  }
}
