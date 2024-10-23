import { Page } from '@playwright/test'

import ComponentSection from '../sections/component.section'

export default class ComponentPage {
  page: Page
  componentSection: ComponentSection

  constructor(page: Page) {
    this.page = page
    this.componentSection = new ComponentSection(this.page)
  }

  public async createComponent() {
    await this.componentSection.create()
  }

  public async searchComponent() {
    await this.componentSection.search()
  }

  public async changePrimaryComponent() {
    await this.componentSection.primary()
  }

  public async checkVisibility() {
    await this.componentSection.visibility()
  }

  public async deleteComponent() {
    await this.componentSection.delete()
  }

  public async editComponent() {
    await this.componentSection.edit()
  }

  public async componentLinks() {
    await this.componentSection.updateLinks()
  }

  public async componentRelations() {
    await this.componentSection.updateRelations()
  }

  public async editPURL() {
    await this.componentSection.purlEditor()
  }

  public async editCPE() {
    await this.componentSection.cpeEditor()
  }

  public async checkRelations() {
    await this.componentSection.relationship()
  }

  public async checkInsights() {
    await this.componentSection.insights()
  }
}
