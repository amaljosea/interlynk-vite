import { attributionFilename } from 'utils/DownloadUtils/pdfUtils'

export const downloadAttributionHtml = async (
  components,
  productName,
  productVersion,
  sourcePreferences
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
        title: `${currentTocAlphabet}`
      })
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
            <div class="item"><span class="subTitle">Copyright</span> <span class="value">${copyrightText}</span></div>
            <div class="item"><span class="subTitle">License</span> <span class="value">${licenseExpText}</span></div>
            ${
              licenseExpText !== 'N/A'
                ? `
                <div class="license-text-container">
                    <div class="subTitle">License Text</div>
                    ${
                      Array.isArray(comp.licenseText) &&
                      comp.licenseText.length > 0
                        ? comp.licenseText
                            .filter((item) => item?.content?.text)
                            .map(
                              (licenseItem) => `
                                <div class="license-item">
                                    <span class="license-short-id">${licenseItem?.content?.shortId || 'N/A'}</span>
                                    <div class="license-text-content">${licenseItem?.content?.text || 'N/A'}</div>
                                </div>
                            `
                            )
                            .join('')
                        : `<div class="license-text-content">N/A</div>`
                    }
                </div>
            `
                : `<div class="item"><span class="subTitle">License Text</span> <span class="value">N/A</span></div>`
            }
            <div class="item"><span class="subTitle">Notice</span> <span class="value">${noticeText}</span></div>
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
