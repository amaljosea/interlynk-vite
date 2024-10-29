import { Page } from '@playwright/test'

import PolicySection from '../sections/policy.section'

export default class PolicyPage {
  page: Page
  policySection: PolicySection

  constructor(page: Page) {
    this.page = page
    this.policySection = new PolicySection(this.page)
  }

  public async addPolicy() {
    await this.policySection.add()
  }

  public async editPolicy() {
    await this.policySection.edit()
  }

  public async deletePolicy() {
    await this.policySection.delete()
  }
}
