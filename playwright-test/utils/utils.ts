import * as fs from 'fs'
import * as path from 'path'
import { Page } from '@playwright/test'

export async function waitForSelectorWithMinTime(
  page: Page,
  selector,
  minWaitTime = 1000,
  timeout = 60000
) {
  const startTime = Date.now()
  await page.waitForLoadState('load')
  // await page.waitForLoadState('domcontentloaded')
  // await page.waitForLoadState('networkidle')
  await page
    .waitForSelector(selector, { timeout: timeout })
    .then(async () => {
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minWaitTime) {
        await page.waitForTimeout(minWaitTime - elapsedTime)
      }
    })
    .catch(async () => {
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minWaitTime) {
        await page.waitForTimeout(minWaitTime - elapsedTime)
      }
    })
}

export function generateUniqueId() {
  return Date.now() + '-' + Math.random().toString(10).substr(2, 4)
}

export function getCurrentDateTime(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function getRandomNumberBetween(min: number, max: number): number {
  if (min > max) {
    throw new Error('Minimum value must be less than maximum value!')
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getVersionFromJson = (fileName: string): string | null => {
  try {
    const filePath = path.resolve(__dirname, '../resources', fileName)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const jsonData = JSON.parse(fileContent)
    return jsonData?.metadata?.component?.version || null
  } catch (error) {
    console.error('Error reading or parsing the JSON file:', error)
    return null
  }
}

export const getFileNamesFromResource = (
  fileNamePattern?: string
): string[] => {
  try {
    const resourcePath = path.resolve(__dirname, '../resources')
    const fileNames = fs.readdirSync(resourcePath)
    if (fileNamePattern) {
      return fileNames.filter((file) => file.endsWith(fileNamePattern))
    }
    return fileNames
  } catch (error) {
    console.error('Error reading the resource folder:', error)
    return []
  }
}

export const randomLicenseName = () => {
  const prefixes = [
    'Professional',
    'Standard',
    'Enterprise',
    'Basic',
    'Advanced',
    'Ultimate',
    'Essential',
    'Pro',
    'Cloud',
    'Unlimited',
    'Personal',
    'Team'
  ]

  const words = [
    'Access',
    'Suite',
    'Package',
    'Edition',
    'License',
    'Version',
    'Toolkit',
    'Platform',
    'Solution',
    'Plan',
    'Bundle',
    'Service'
  ]

  const suffixes = [
    'Plus',
    'Premium',
    'Lite',
    'Standard',
    '2024',
    'X',
    'One',
    'Pro'
  ]

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const word = words[Math.floor(Math.random() * words.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]

  return `${prefix} ${word} ${suffix}`
}

export const generateRandomEmail = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']

  const usernameLength = Math.floor(Math.random() * 8) + 5
  let username = ''
  for (let i = 0; i < usernameLength; i++) {
    username += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  const domain = domains[Math.floor(Math.random() * domains.length)]

  return `${username}@${domain}`
}

export const randomProductName = () => {
  const adjectives = [
    'Sleek',
    'Compact',
    'Portable',
    'Ultimate',
    'Advanced',
    'Premium',
    'Eco',
    'Smart',
    'Efficient',
    'Robust',
    'Versatile',
    'Dynamic',
    'Modern'
  ]

  const nouns = [
    'Gadget',
    'Device',
    'Tool',
    'Machine',
    'System',
    'Appliance',
    'Solution',
    'Gear',
    'Instrument',
    'Platform',
    'Accessory',
    'Utility',
    'Item'
  ]

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adjective} ${noun}`
}
