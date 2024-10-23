import { Page } from '@playwright/test'

export class RolesPage {
  constructor(private page: Page) {}

  async navigateToSettings() {
    await this.page.getByLabel('settings').click()
  }

  async openRolesTab() {
    await this.page.getByRole('tab', { name: 'roles' }).click()
  }

  async addRole(name: string, role: string) {
    await this.page.getByRole('banner').getByRole('button').click()
    await this.page.getByLabel('Name*').click()

    await this.page.getByLabel('Name*').press('CapsLock')
    await this.page.getByLabel('Name*').fill(name[0])
    await this.page.getByLabel('Name*').press('CapsLock')
    await this.page.getByLabel('Name*').fill(name)

    await this.page.locator('.css-1n2nce7').click()
    await this.page.getByRole('option', { name: role }).click()
    await this.page.getByRole('button', { name: 'Save' }).click()
  }

  async deleteRole(roleName: string) {
    await this.page.locator(`[role=row]:has-text("${roleName}") button`).click()
    await this.page.getByRole('menuitem', { name: 'Delete Role' }).click()
    await this.page.click('div[role="group"].chakra-form-control.css-mxcfd1')

    await this.page
      .locator('div[role="group"].chakra-form-control.css-mxcfd1')
      .focus()

    for (let i = 0; i < 3; i++) {
      await this.page.keyboard.press('ArrowDown')
    }

    await this.page.keyboard.press('Enter')

    await this.page
      .getByRole('button', { name: 'Reassign Users and Delete' })
      .click()
  }
}
