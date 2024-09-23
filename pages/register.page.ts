import { Page } from '@playwright/test'

import RegisterSection from '../sections/register.section'

export default class RegisterPage {
  page: Page
  registerSection: RegisterSection

  constructor(page: Page) {
    this.page = page
    this.registerSection = new RegisterSection(this.page)
  }
  public async userRegisterFunctionality(
    name?: string,
    address?: string,
    password?: string
  ) {
    await this.registerSection.userRegistration(name, address, password)
  }

  // public async signUpWithGoogleFunctionality(
  // ) {
  //   await this.registerSection.signUpWithGoogle();
  // }
}
