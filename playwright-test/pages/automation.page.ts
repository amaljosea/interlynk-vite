import { Page } from '@playwright/test'

import AutomationSection from '../sections/automation.section'

export default class AutomationPage {
  page: Page
  automationSection: AutomationSection

  constructor(page: Page) {
    this.page = page
    this.automationSection = new AutomationSection(this.page)
  }

  public async addRule() {
    await this.automationSection.add()
  }

  public async editRule() {
    await this.automationSection.edit()
  }

  public async deleteRule() {
    await this.automationSection.delete()
  }
}
