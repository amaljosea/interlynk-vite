import * as dotenv from 'dotenv'
import { Page, expect } from '@playwright/test'

import { LoginSelectors as ls } from '../selectors/login.selector'
import { waitForSelectorWithMinTime } from '../utils/utils'

dotenv.config({ path: '.env' })

const errors: string[] = []

export default class LoginSection {
  page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async applicationLogin(email?: string, password?: string) {
    try {
      if (!email || !password) {
        throw new Error('username, password is undefined')
      }

      const title = await this.page.title()

      if (title == 'Interlynk Platform Dashboard') {
        await waitForSelectorWithMinTime(this.page, ls.email)
        await this.page.fill(ls.email, email)
        await this.page.fill(ls.password, password)
        await this.page.locator(ls.loginBtn).click()
        await this.page.waitForTimeout(1000)
        await this.page.getByTestId('global_env_filter').isVisible()
      } else {
        errors.push('landed on the wrong page!')
      }
      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }

  public async applicationCommonLogin(email?: string, password?: string) {
    try {
      if (!email || !password) {
        throw new Error('username, password is undefined')
      }

      const title = await this.page.title()

      if (title == 'Interlynk Platform Dashboard') {
        await waitForSelectorWithMinTime(this.page, ls.email)
        await this.page.fill(ls.email, email)
        await this.page.fill(ls.password, password)
        await this.page.locator(ls.loginBtn).click()
      } else {
        errors.push('landed on the wrong page!')
      }

      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
