import { Page } from '@playwright/test'

import ChecksSection from '../sections/checks.section'

export default class ChecksPage {
  page: Page
  checksSection: ChecksSection

  constructor(page: Page) {
    this.page = page
    this.checksSection = new ChecksSection(this.page)
  }

  public async sbomCheck() {
    await this.checksSection.check()
  }
}
