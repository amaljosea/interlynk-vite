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
        await waitForSelectorWithMinTime(this.page, ls.dashboard)
        const dashboard = await this.page.locator(ls.dashboard).isVisible()

        if (dashboard != true) {
          errors.push('login failed!')
        }
      } else {
        errors.push('landed on the wrong page!')
      }

      if (errors.length > 0) {
        throw new Error(`Errors encountered:\n${errors.join('\n')}`)
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
        await waitForSelectorWithMinTime(this.page, ls.dashboard)
        const dashboard = await this.page.locator(ls.dashboard).isVisible()

        if (dashboard != true) {
          errors.push('login failed!')
        }
      } else {
        errors.push('landed on the wrong page!')
      }

      if (errors.length > 0) {
        throw new Error(`Errors encountered:\n${errors.join('\n')}`)
      }
      expect(errors.length).toBe(0)
    } catch (error) {
      throw error
    }
  }
}
