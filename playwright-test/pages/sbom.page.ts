import { Page } from '@playwright/test'

import SbomSection from '../sections/sbom.section'

export default class SbomPage {
  page: Page
  sbomSection: SbomSection

  constructor(page: Page) {
    this.page = page
    this.sbomSection = new SbomSection(this.page)
  }

  public async buildSbom() {
    await this.sbomSection.build()
  }

  public async listSbom() {
    await this.sbomSection.list()
  }

  public async reprocessSbom() {
    await this.sbomSection.reprocess()
  }

  public async archiveSbom() {
    await this.sbomSection.archive()
  }

  public async deleteSbom() {
    await this.sbomSection.delete()
  }

  public async updateLifestage() {
    await this.sbomSection.lifestage()
  }
}
