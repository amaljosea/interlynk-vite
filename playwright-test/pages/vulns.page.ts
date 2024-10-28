import { Page } from '@playwright/test'

import VulnsSection from '../sections/vulns.section'

export default class VulnsPage {
  page: Page
  vulnsSection: VulnsSection

  constructor(page: Page) {
    this.page = page
    this.vulnsSection = new VulnsSection(this.page)
  }

  public async addStatus() {
    await this.vulnsSection.vexStatus()
  }

  public async updateLinks() {
    await this.vulnsSection.vulnLinks()
  }

  public async vexImport() {
    await this.vulnsSection.importStatus()
  }
}
