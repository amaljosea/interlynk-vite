import { Page } from '@playwright/test'

import TokenSection from '../sections/token.section'

export default class TokenPage {
  page: Page
  tokenSection: TokenSection

  constructor(page: Page) {
    this.page = page
    this.tokenSection = new TokenSection(this.page)
  }

  public async securityToken() {
    await this.tokenSection.token()
  }
}
