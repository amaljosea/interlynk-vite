import { Page } from '@playwright/test'

export class JiraIntegration {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async openConnectionTab() {
    await this.page.getByLabel('settings').click()
    await this.page.getByRole('tab', { name: 'integration' }).click()
  }

  async createConnection(hostURL: string, email: string, token: string) {
    await this.page
      .getByRole('textbox', { name: 'Jira Host URL' })
      .fill(hostURL)
    await this.page.getByRole('textbox', { name: 'User Email' }).fill(email)
    await this.page.getByRole('textbox', { name: 'API Token' }).fill(token)
    await this.page.getByRole('button', { name: 'Verify' }).click()
    await this.page.waitForTimeout(3000)
  }

  async addConfig(hostURL: string, email: string, token: string) {
    await this.page.getByRole('button', { name: 'Configure' }).nth(1).click()
    const deleteBtn = await this.page
      .getByRole('button', { name: 'Delete' })
      .isVisible()
    if (deleteBtn) {
      this.page.getByRole('button', { name: 'Delete' }).click()
      await this.page.waitForTimeout(3000)
      await this.page.getByRole('button', { name: 'Configure' }).nth(1).click()
      await this.page.waitForTimeout(3000)
      await this.createConnection(hostURL, email, token)
    } else {
      await this.createConnection(hostURL, email, token)
    }
  }

  async saveConnection() {
    await this.page.getByRole('button', { name: 'Save' }).click()
    await this.page.waitForTimeout(2000)
  }

  async updateProjectSettings() {
    await this.page.locator("//a[@aria-label='products']").click()
    await this.page.waitForTimeout(3000)

    await this.page.getByRole('button', { name: 'Add Product' }).click()
    await this.page.getByPlaceholder('Add product name').fill('Test')
    await this.page
      .getByPlaceholder('Add product description')
      .fill('for testing')
    await this.page.locator("button[type='submit']").click()
    await this.page.waitForTimeout(3000)

    const product = await this.page.getByTestId(`product_Test`).isVisible()

    if (product) {
      await this.page.getByTestId(`product_Test`).click()
      await this.page.waitForTimeout(3000)

      await this.page.getByRole('tab', { name: 'settings' }).click()
      await this.page.waitForTimeout(5000)

      await this.page.getByRole('combobox', { name: 'jiraProject' }).click()
      await this.page.keyboard.type('my')
      await this.page.keyboard.press('Enter')
      await this.page.waitForTimeout(3000)
    }
  }

  async deleteProjectGroup() {
    await this.page.getByLabel('products').click()
    await this.page.getByRole('button', { name: 'refresh' }).click()
    await this.page.waitForTimeout(2000)
    await this.page.getByTestId('product-actions').first().click()
    await this.page.waitForTimeout(2000)
    await this.page.getByTestId('delete_product').first().click()
    await this.page.getByTestId(`delete-field`).fill('DELETE')
    await this.page.locator("button[type='submit']").click()
  }

  async removeConfiguration() {
    await this.page.getByLabel('settings').click()
    await this.page.getByRole('tab', { name: 'integration' }).click()
    await this.page.getByRole('button', { name: 'Configure' }).nth(1).click()
    await this.page.getByRole('button', { name: 'Delete' }).click()
    await this.page.waitForTimeout(5000)
  }
}
