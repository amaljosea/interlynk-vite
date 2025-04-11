import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { randomProductName } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []
const tokenName = 'lynk-api'

export default class TokenSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async token() {
    try {
      await this.page.locator("//a[@aria-label='settings']").click()

      await this.page.getByRole('button', { name: 'organization' }).click()

      await this.page.getByRole('menuitemradio', { name: 'personal' }).click()

      await this.page.getByTestId('new_token').click()

      await this.page.getByLabel('Token Name*').fill(tokenName)
      await this.page.getByRole('button', { name: 'Create' }).click()

      await this.page.getByRole('button', { name: 'Done' }).click()

      await this.page.getByTestId(`token_actions_0`).click()
      await this.page.getByTestId(`token_edit_0`).click()

      await this.page.getByText('No Expiration').click()
      await this.page.getByRole('button', { name: 'Update' }).click()

      await this.page.getByTestId(`token_actions_0`).click()
      await this.page.getByTestId(`token_revoke_0`).click()

      await this.page.getByTestId(`token_actions_0`).click()
      await this.page.getByTestId(`token_delete_0`).click()

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
