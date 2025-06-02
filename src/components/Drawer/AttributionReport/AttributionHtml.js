import { attributionFilename } from 'utils/DownloadUtils/pdfUtils'

export const downloadAttributionHtml = async (
  components,
  productName,
  productVersion,
  sourcePreferences
) => {
  const filename = attributionFilename(productName, productVersion)
  const logoBase64 = await getBase64Logo()

  //  Generate TOC Destinations and Content HTML
  const tocDestinations = []
  let contentHtml = ''
  let currentTocAlphabet = ''
  let tocItemNumber = 1

  components.forEach((comp) => {
    const currentComponentName = `${comp.name || 'Unknown'} - ${comp.version || 'Unknown'}`
    const componentId = `component-${comp.id}` // Unique ID for linking

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
        title: `${tocItemNumber}. ${currentTocAlphabet}`
      })
      tocItemNumber++
    }

    tocDestinations.push({
      isGroupHeader: false,
      title: currentComponentName,
      id: componentId
    })

    const source = sourcePreferences[comp.id] || 'sbom'
    const noticeText =
      source === 'library'
        ? comp.enrichedContent?.packageVersion?.notice || 'N/A'
        : comp.notice || 'N/A'
    const copyrightText =
      source === 'library'
        ? comp.enrichedContent?.packageVersion?.copyright || 'N/A'
        : comp.copyright || 'N/A'
    const licenseExpText =
      source === 'library'
        ? comp.enrichedContent?.packageVersion?.licenseExp
        : comp.licensesExp || 'N/A'

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
            <div class="item"><span class="label">Notice:</span> <span class="value">${noticeText}</span></div>
            <div class="item"><span class="label">License:</span> <span class="value">${licenseExpText}</span></div>
            ${
              licenseExpText !== 'N/A'
                ? `
                <div class="license-text-container">
                    <div class="license-text-label">License Text:</div>
                    ${
                      Array.isArray(comp.licenseText) &&
                      comp.licenseText.length > 0
                        ? comp.licenseText
                            .filter((item) => item?.content?.text)
                            .map(
                              (licenseItem) => `
                                <div class="license-item">
                                    <span class="license-short-id">${licenseItem?.content?.shortId || 'N/A'}:</span>
                                    <div class="license-text-content" style="margin-left: 20px;">${licenseItem?.content?.text || 'N/A'}</div>
                                </div>
                            `
                            )
                            .join('')
                        : `<div class="license-text-content">N/A</div>`
                    }
                </div>
            `
                : `<div class="item"><span class="label">License Text:</span> <span class="value">N/A</span></div>`
            }
            <div class="item"><span class="label">Copyright:</span> <span class="value">${copyrightText}</span></div>
        </div>
      </div>
    `
  })

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
  <title>Attribution Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #323232; }
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
        justify-content: center;
        align-items: center;
        text-align: center;
        height: 100vh; /* Full viewport height for the front page */
        padding: 0 40px; /* Adjust padding if needed */
    }
    .front-page .logo { height: 100px; margin-bottom: 20px; }
    .front-page .interlynk-title { font-size: 4em; color: #3d71ee; margin-bottom: 5px; }
    .front-page .report-title { font-size: 2.5em; color: #3d71ee; }

    /* TOC Styles */
    .toc-section {
        padding: 40px;
        break-before: page; /* For printing */
    }
    .toc-section h2 { font-size: 2em; color: #000000; margin-bottom: 30px; }
    .toc-list { list-style: none; padding: 0; }
    .toc-list li { margin-bottom: 7px; font-size: 1.1em; }
    .toc-list li a { text-decoration: none; color: #323232; }
    .toc-list li a:hover { text-decoration: underline; }
    .toc-group-header h3 { font-size: 1.2em; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #000000; }

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
        font-size: 1em;
        color: #000000;
    }
    .header-divider {
      border-bottom: 1px solid #D3D3D3;
      margin-top: 10px;
      margin-bottom: 20px;
    }

    .component-content {
        margin-top: 20px;
    }

    .component-name { font-weight: bold; font-size: 1.2em; color: #000000; margin-bottom: 10px; }
    .label { font-weight: bold; color: #000000; font-size: 1.1em; display: inline-block; width: 100px;}
    .value { color: #323232; line-height: 1.4; }
    .item { margin-bottom: 15px; }

    .license-text-container { margin-top: 15px; margin-bottom: 15px; }
    .license-text-label { font-weight: bold; font-size: 1.1em; color: #000000; margin-bottom: 10px; }
    .license-text-content { font-size: 0.9em; color: #323232; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; max-width: 100%; margin-left: 20px; }
    .license-item { margin-bottom: 8px; }
    .license-short-id { font-weight: bold; color: #323232; font-size: 1em;}

    /* Page Numbers (for print) - This is more complex to simulate accurately in HTML for all pages */
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
  <div class="page front-page">
    ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="logo" alt="Interlynk Logo" />` : ''}
    <div class="interlynk-title">Interlynk</div>
    <div class="report-title">Attribution Report</div>
  </div>

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
