import { attributionFilename } from 'utils/DownloadUtils/pdfUtils'

import { NO_COMPONENTS_FILTERED_MESSAGE } from './AttributionTable'

export const downloadAttributionHtml = async (
  components,
  productName,
  productVersion,
  sourcePreferences,
  includeEmptyLicenses,
  includeUnresolvedLicenses,
  includeTitlePage
) => {
  const filename = attributionFilename(productName, productVersion)
  const logoBase64 = await getBase64Logo()

  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`

  //  Generate TOC Destinations and Content HTML
  const tocDestinations = []
  let contentHtml = ''
  let currentTocAlphabet = ''

  components.forEach((comp) => {
    const currentComponentName = `${comp.components?.[0]?.name || 'Unknown'} - ${comp.components?.[0]?.version || 'Unknown'}`
    const componentId = `component-${comp.components?.[0].id}` // Unique ID for linking

    const source = sourcePreferences[comp.components?.[0].id] || 'sbom'
    const isLibrarySource = source === 'library'
    const override = comp.attributionOverride
    const attribution = comp.attribution
    const noticeText = isLibrarySource
      ? override?.notice || 'N/A'
      : attribution?.notice || 'N/A'
    const copyrightText = isLibrarySource
      ? override?.copyright || 'N/A'
      : attribution?.copyright || 'N/A'
    const licenseExpText = isLibrarySource
      ? override?.licensesExp || 'N/A'
      : attribution?.licensesExp || 'N/A'

    // Filtering logic
    const isEmptyLicense = () => {
      if (Array.isArray(licenseExpText)) return licenseExpText.length === 0
      return !licenseExpText || licenseExpText === 'N/A'
    }
    if (!includeEmptyLicenses && isEmptyLicense()) {
      return // Skip this component due to empty license
    }
    if (
      !includeUnresolvedLicenses &&
      typeof licenseExpText === 'string' &&
      licenseExpText.includes('OR')
    ) {
      return // Skip this component due to unresolved licenses
    }

    // Store TOC destination for this component
    const firstChar = currentComponentName.charAt(0).toUpperCase()

    // Add alphabetical grouping to TOC
    if (firstChar !== currentTocAlphabet) {
      if (currentTocAlphabet !== '') {
        // Add a visual separator or extra space in TOC for previous group
      }
      currentTocAlphabet = firstChar
      tocDestinations.push({
        isGroupHeader: true,
        title: `${currentTocAlphabet}`
      })
    }

    tocDestinations.push({
      isGroupHeader: false,
      title: currentComponentName,
      id: componentId
    })

    // Only render Copyright if not empty or 'N/A'
    const copyrightHtml =
      copyrightText && copyrightText !== 'N/A'
        ? `<div class="item"><span class="subTitle">Copyright</span> <span class="value">${copyrightText}</span></div>`
        : ''

    // Only render Notice if not empty or 'N/A'
    const noticeHtml =
      noticeText && noticeText !== 'N/A'
        ? `<div class="item"><span class="subTitle">Notice</span> <span class="value">${noticeText}</span></div>`
        : ''

    // Only render Patches section if there are patches
    const patchesArr = comp.components?.[0]?.patches || []
    const patchesHtml = (() => {
      if (Array.isArray(patchesArr) && patchesArr.length > 0) {
        return (
          `<div class="patches-container"><div class="subTitle">Patches</div>` +
          patchesArr
            .map(
              (patch) => `
                <div class="patch-item">
                  <div class="patch-content">${patch.content || ''}</div>
                  ${patch.url ? `<div class="patch-url"><a href="${patch.url.startsWith('http://') || patch.url.startsWith('https://') ? patch.url : `https://${patch.url}`}" target="_blank">${patch.url}</a></div>` : ''}
                </div>
              `
            )
            .join('') +
          `</div>`
        )
      } else {
        return ''
      }
    })()

    // License Text section: only render if at least one non-empty entry
    const licenseTextArr =
      source === 'library'
        ? comp.attributionOverride?.licensesText || []
        : comp.attribution?.licensesText || []
    const filteredLicenseTextArr = Array.isArray(licenseTextArr)
      ? licenseTextArr.filter(
          (licenseObj) =>
            (licenseObj?.key && licenseObj.key !== 'N/A') ||
            (licenseObj?.value && licenseObj.value !== 'N/A')
        )
      : []
    const licenseTextHtml =
      filteredLicenseTextArr.length > 0
        ? `<div class="license-text-container"><div class="subTitle">License Text</div>` +
          filteredLicenseTextArr
            .map(
              (licenseObj) => `
              <div class="license-item">
                <span class="license-short-id">${licenseObj?.key || ''}</span>
                <div class="license-text-content">${licenseObj?.value || ''}</div>
              </div>
            `
            )
            .join('') +
          `</div>`
        : ''

    contentHtml += `
      <div class="component-section" id="${componentId}">
        <div class="component-header">
            <a href="#toc-start" class="back-to-contents">Back to contents page</a>
            <span class="component-letter">${firstChar}</span>
            <span class="component-header-name">${currentComponentName}</span>
        </div>
        <div class="header-divider"></div>
        <div class="component-content">
            <div class="component-name">${currentComponentName}</div>
            ${copyrightHtml}
            <div class="item"><span class="subTitle">License</span> <span class="value">${licenseExpText}</span></div>
            ${licenseTextHtml}
            ${patchesHtml}
            ${noticeHtml}
        </div>
      </div>
    `
  })

  // Throw error if no components to export
  if (tocDestinations.length === 0) {
    throw new Error(NO_COMPONENTS_FILTERED_MESSAGE)
  }

  //  Generate TOC HTML
  const tocHtml = `
    <div class="toc-section" id="toc-start">
      <h2>Contents</h2>
      <ul class="toc-list">
        ${tocDestinations
          .map((item) => {
            if (item.isGroupHeader) {
              return `<li class="toc-group-header"><h3>${item.title}</h3></li>`
            }
            return `<li><a href="#${item.id}">${item.title}</a></li>`
          })
          .join('')}
      </ul>
    </div>
  `

  // Assemble the Full HTML Content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Attribution Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #323232; }
    .page {
      min-height: 100vh; /* Simulate a page height */
      box-sizing: border-box;
      padding: 40px;
      position: relative;
      break-after: page; /* For printing */
    }

    /* Front Page Styles */
    .front-page {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      height: 100vh;
      padding: 0 40px;
      padding-bottom: 40px; /* Add padding to the bottom for the footer */
    }

    .front-page-content {
      flex-grow: 1; /* Allows content to take up available space */
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      width: 100%;
    }

    .main-title {
      font-size: 3.5em;
      color: #323232;
      margin-bottom: 10px;
      border-bottom: 2px solid #323232;
      padding-bottom: 5px;
      display: inline-block; 
    }

    .subtitle {
      font-size: 2em;
      color: #323232;
      margin-top: 5px;
      margin-bottom: 30px;
    }

    .revision {
      font-size: 1.2em;
      color: #323232;
      margin-top: 50px;
    }

    .footer-logo-container {
      display: flex;
      align-items: center;
      justify-content: flex-end; 
      width: 100%;
      padding-right: 40px;
    }

    .footer-logo-container .logo {
      height: 40px;   
      margin-right: 5px;
    }

    .prepared-by {
      font-size: 0.9em;
      color: #323232;
    }

    /* TOC Styles */
    .toc-section {
        padding: 40px;
        break-before: page; /* For printing */
    }
    .toc-section h2 { font-size: 22px; color: #000000; margin-bottom: 30px; }
    .toc-list { list-style: none; padding: 0; }
    .toc-list li { margin-bottom: 7px; font-size: 12px; font-weight: bold; }
    .toc-list li a { text-decoration: none; color: #323232; }
    .toc-list li a:hover { text-decoration: underline; }
    .toc-group-header h3 { font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 5px; color: #000000; }

    /* Component Section Styles */
    .component-section {
      padding: 40px;
      break-before: page; /* For printing */
    }
    .component-header {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #D3D3D3;
        padding-bottom: 10px;
        margin-bottom: 20px;
        position: sticky; /* Make header sticky when scrolling */
        top: 0;
        background-color: #fff;
        z-index: 10;
    }
    .back-to-contents {
        font-size: 0.9em;
        color: #3d71ee;
        text-decoration: none;
        margin-right: 20px;
    }
    .component-letter {
        font-weight: bold;
        font-size: 1em;
        color: #000000;
        margin-right: 10px;
    }
    .component-header-name {
        font-size: 18px;
        color: #000000;
    }
    .header-divider {
      margin-top: 10px;
      margin-bottom: 20px;
    }

    .component-content {
      margin-top: 20px;
    }

    .patches-container{
      margin-bottom: 20px;
    }

    .patch-item{
     margin-bottom: 10px;
     font-size: 13.33px
    }

    .component-name { font-weight: bold; font-size: 18px; color: #000000; margin-bottom: 10px; }
    .label { font-weight: bold; color: #000000; font-size: 16px; display: block;}
    .subTitle { font-weight: normal; color: #222222; font-size: 14px; display: block;}
    .value { color: #323232; line-height: 1.4; font-size: 13.33px; display: block; }
    .item { margin-bottom: 15px; }

    .license-text-container { margin-top: 15px; margin-bottom: 15px; }
    .license-text-label { font-weight: bold; font-size: 16px; color: #000000; margin-bottom: 10px; }
    .license-text-content { font-size: 13.33px; color: #323232; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; max-width: 100%; }
    .license-item { margin-bottom: 8px; }
    .license-short-id { font-weight: normal; color: #323232; font-size: 15px; }

 
    @media print {
        body { margin: 0; }
        .page {
            border: none;
            page-break-after: always;
            position: relative;
        }
        .page:last-of-type {
            page-break-after: auto;
        }
        .component-header { position: static; } /* Don't sticky headers in print */

        /* Basic footer for page number simulation */
        .page::after {
            content: "Page " counter(page);
            counter-increment: page;
            position: absolute;
            bottom: 20px;
            right: 40px;
            font-size: 10px;
            color: #808080;
        }
         /* Reset counter for front page */
        .front-page::after {
            content: "Page 1"; /* Hardcode for front page or use another counter */
            counter-reset: page 1;
        }
    }

  </style>
</head>
<body>
  ${
    includeTitlePage
      ? `
  <div class="page front-page">
    <div class="front-page-content">
      <h1 class="main-title">Software Licenses</h1>
      <p class="subtitle">${productName}</p>
      <p class="revision">Revision: ${productVersion} (${formattedDate})</p>
    </div>
    <div class="footer-logo-container">
      ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="logo" alt="Interlynk Logo" />` : ''}
      <span class="prepared-by">Prepared by Interlynk Inc.</span>
    </div>
  </div>
  `
      : ''
  }

  ${tocHtml}

  ${contentHtml}

</body>
</html>
  `

  // Create a Blob and trigger download
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function getBase64Logo() {
  try {
    const logoUrl = new URL('assets/img/logo.png', import.meta.url).href
    const response = await fetch(logoUrl)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    return null
  }
}
