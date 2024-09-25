import { Page } from '@playwright/test'

import LoginSection from '../sections/login.section'

export default class LoginPage {
  page: Page
  loginSection: LoginSection

  constructor(page: Page) {
    this.page = page
    this.loginSection = new LoginSection(this.page)
  }
  public async appLoginFunctionality(username?: string, password?: string) {
    await this.loginSection.applicationLogin(username, password)
  }

  public async appLoginCommonFunctionality(
    username?: string,
    password?: string
  ) {
    await this.loginSection.applicationCommonLogin(username, password)
  }
}
