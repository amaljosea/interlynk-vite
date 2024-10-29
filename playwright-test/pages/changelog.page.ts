import { Page } from '@playwright/test'

import ChangelogSection from '../sections/changelog.section'

export default class ChangelogPage {
  page: Page
  changelogSection: ChangelogSection

  constructor(page: Page) {
    this.page = page
    this.changelogSection = new ChangelogSection(this.page)
  }

  public async checkLogs() {
    await this.changelogSection.changelog()
  }
}
