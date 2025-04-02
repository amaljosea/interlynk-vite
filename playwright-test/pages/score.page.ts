import { Page } from '@playwright/test'

import ScoreSection from '../sections/score.section'

export default class ScorePage {
  page: Page
  scoreSection: ScoreSection

  constructor(page: Page) {
    this.page = page
    this.scoreSection = new ScoreSection(this.page)
  }

  public async securityToken() {
    await this.scoreSection.score()
  }
}
