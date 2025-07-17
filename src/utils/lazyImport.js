import { lazy } from 'react'

const hardRefresh = () => {
  const time = new Date().getTime()

  if (window.location.href.indexOf('refresh=') > -1) {
    // already refreshed
    return true
  }

  if (window.location.href.indexOf('?') > -1) {
    window.location.href = window.location.href + '&refresh=' + time
  } else {
    window.location.href = window.location.href + '?refresh=' + time
  }
}

function extractModuleName(input) {
  if (!input) {
    return ''
  }
  const regex =
    /(?<=import\(["'].*\/)([^/.]+)(?=\.js|\.ts|["'])|(?<=default:e\.)\w+/
  const match = input.match(regex)
  let moduleName = match ? match[0] : ''

  // If the module name is "index", extract the parent directory name
  if (moduleName === 'index') {
    const parentDirRegex =
      /(?<=import\(["'].*\/)([^/]+)\/index(?=\.js|\.ts|["'])/
    const parentMatch = input.match(parentDirRegex)
    moduleName = parentMatch ? parentMatch[1] : moduleName
  }

  return moduleName
}

// DYNAMIC IMPORT ERROR HANDLING
//
// When a new deployment occurs while the app is open in the browser, cached modules
// with outdated hashes become unavailable. This causes dynamic imports to fail with
// various error messages. When these errors are detected, we perform a hard refresh
// to load the updated modules.
//
// Known error patterns (add new ones as discovered):
// - "load module script" - Module loading failure
// - "dynamically imported module" - Dynamic import failure
// - "Unable to preload CSS" - CSS preloading failure

async function retryImport(importFunction) {
  const moduleName = extractModuleName(importFunction?.toString?.())
  try {
    console.log(`Importing... ${moduleName}`)
    return await importFunction()
  } catch (error) {
    console.log(`Failed to import... ${moduleName}`, error?.message)
    const alreadyRefreshed = hardRefresh()
    if (alreadyRefreshed) {
      throw error
    }
  }
}

export function lazyImport(importFunction = () => {}) {
  return lazy(() => retryImport(importFunction))
}
