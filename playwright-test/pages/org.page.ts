import { Page } from '@playwright/test'

import OrgSection from '../sections/org.section'

export default class OrgPage {
  page: Page
  orgSection: OrgSection

  constructor(page: Page) {
    this.page = page
    this.orgSection = new OrgSection(this.page)
  }

  public async createAndSwitch() {
    await this.orgSection.org()
  }
}
