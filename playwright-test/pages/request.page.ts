import { Page } from '@playwright/test'

import RequestSection from '../sections/request.section'

export default class RequestPage {
  page: Page
  requestSection: RequestSection

  constructor(page: Page) {
    this.page = page
    this.requestSection = new RequestSection(this.page)
  }

  public async sbomRequest() {
    await this.requestSection.request()
  }
}
