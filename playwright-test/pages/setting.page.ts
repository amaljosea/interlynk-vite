import { Page } from '@playwright/test'

import SettingSection from '../sections/setting.section'

export default class SettingPage {
  page: Page
  settingSection: SettingSection

  constructor(page: Page) {
    this.page = page
    this.settingSection = new SettingSection(this.page)
  }

  public async checkSettings() {
    await this.settingSection.settings()
  }
}
