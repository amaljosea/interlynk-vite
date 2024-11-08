import { Page } from '@playwright/test'

export class SettingsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async openSettingsTab() {
    await this.page.getByLabel('settings').click()
  }

  async openLegalTab() {
    await this.page.getByRole('tab', { name: 'legal' }).click()
  }

  async openLegalSection() {
    await this.page.locator(`//button[@aria-label='add_manufacturer']`).click()
  }

  async addOrganizationName(name: string) {
    const orgNameField = this.page.getByPlaceholder('Add organization name')
    await orgNameField.click()
    await orgNameField.fill(name)
  }

  async addURL(url: string) {
    const urlField = this.page.getByPlaceholder('Add URL')
    await urlField.click()
    await urlField.fill(url)
  }

  async addConfig(name: string, email: string, phoneNumber: string) {
    await this.page.getByLabel('Add config').click()
    await this.page.getByPlaceholder('Name', { exact: true }).click()
    await this.page.getByPlaceholder('Name', { exact: true }).fill(name)
    await this.page.getByPlaceholder('Email').click()
    await this.page.getByPlaceholder('Email').fill(email)
    await this.page.getByPlaceholder('Phone number').click()
    await this.page.getByPlaceholder('Phone number').fill(phoneNumber)
  }

  async saveChanges() {
    await this.page.getByRole('button', { name: 'Save' }).click()
  }

  async updateManufacturer(newName: string) {
    await this.page.locator('[role=row]:has-text("Ello") button').click()
    await this.page
      .getByRole('menuitem', { name: 'Update Manufacturer' })
      .click()
    await this.page.getByPlaceholder('Add organization name').click()
    await this.page.getByPlaceholder('Add organization name').fill(newName)
    await this.page.getByRole('button', { name: 'Update' }).click()
  }

  async archiveManufacturer() {
    await this.page.locator('[role=row]:has-text("Elloo") button').click()
    await this.page
      .getByRole('menuitem', { name: 'Archive Manufacturer' })
      .click()
    await this.page.getByRole('button', { name: 'Yes' }).click()
  }
}
