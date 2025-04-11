import { Page } from '@playwright/test'

export class BibucketIntegration {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async openConnectionTab() {
    await this.page.getByLabel('settings').click()
    await this.page.getByRole('tab', { name: 'integration' }).click()
  }

  async addConfig(username: string, token: string) {
    await this.page.getByRole('button', { name: 'Configure' }).first().click()
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username)
    await this.page.getByRole('textbox', { name: 'API Token' }).fill(token)
    await this.page.getByRole('button', { name: 'Verify' }).click()
  }

  async saveWorkspace() {
    await this.page.getByLabel('Workspace*').selectOption('interlynk')
    await this.page.getByRole('button', { name: 'Save' }).click()
  }

  async importBitbucketProject() {
    await this.page.getByLabel('products').click()
    const importBtn = `//button[@aria-label='import_bitbucket_projects']`
    await this.page.locator(importBtn).click()
    const isVisible = await this.page.locator(importBtn).isVisible()
    if (isVisible) {
      const repository = this.page
        .locator(`//input[@aria-label='select-row-undefined']`)
        .nth(0)
      if (repository.isVisible()) {
        await repository.check()
        await this.page.waitForTimeout(2000)
        await this.page.getByRole('button', { name: 'drawer_submit' }).click()
      }
    }
  }

  async deleteProjectGroup() {
    await this.page.locator("//a[@aria-label='products']").click()
    await this.page.waitForTimeout(2000)
    await this.page.getByRole('button', { name: 'refresh' }).click()
    await this.page.waitForTimeout(5000)
    await this.page.getByTestId('product-actions').first().click()
    await this.page.waitForTimeout(2000)
    await this.page.getByTestId('delete_product').first().click()
    await this.page.getByTestId(`delete-field`).fill('DELETE')
    await this.page.locator("button[type='submit']").click()
  }
}
