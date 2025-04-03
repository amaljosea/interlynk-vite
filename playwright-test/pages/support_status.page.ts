import { Page } from '@playwright/test'

import SupportStatusSection from '../sections/support_status.section'

export default class SupportStatusPage {
  page: Page
  supportStatusSection: SupportStatusSection

  constructor(page: Page) {
    this.page = page
    this.supportStatusSection = new SupportStatusSection(this.page)
  }

  public async securityToken() {
    await this.supportStatusSection.support()
  }
}
