import { Page } from '@playwright/test'

import LicenseSection from '../sections/license.section'

export default class LicensePage {
  page: Page
  licenseSection: LicenseSection

  constructor(page: Page) {
    this.page = page
    this.licenseSection = new LicenseSection(this.page)
  }

  public async license() {
    await this.licenseSection.license()
  }
}
