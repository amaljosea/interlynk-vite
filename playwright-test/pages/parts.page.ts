import { Page } from '@playwright/test'

import PartsSection from '../sections/parts.section'

export default class PartsPage {
  page: Page
  partsSection: PartsSection

  constructor(page: Page) {
    this.page = page
    this.partsSection = new PartsSection(this.page)
  }

  public async add() {
    await this.partsSection.addParts()
  }

  public async preview() {
    await this.partsSection.viewParts()
  }

  public async delete() {
    await this.partsSection.deleteParts()
  }
}
