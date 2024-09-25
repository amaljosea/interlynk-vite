import { Page } from '@playwright/test'

import SharelynkSection from '../sections/sharelynk.section'

export default class SharelynkPage {
  page: Page
  sharelynkSection: SharelynkSection

  constructor(page: Page) {
    this.page = page
    this.sharelynkSection = new SharelynkSection(this.page)
  }
  public async sharelynkFunctionality() {
    await this.sharelynkSection.sharelynk()
  }
}
