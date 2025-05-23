import { attributionFilename } from 'utils/DownloadUtils/pdfUtils'

export const downloadAttributionHtml = async (
  components,
  productName,
  productVersion
) => {
  // Build the HTML content as a string
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Attribution Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { display: flex; align-items: center; }
    .logo { height: 40px; margin-right: 16px; }
    .title { font-size: 2em; color: #3d71ee; }
    .titleBlock { display: flex; justify-content: space-between; align-items: center;}
    .divider { border-bottom: 1px solid #888; margin: 24px 0; }
    .component { margin-bottom: 32px; }
    .component-name { font-weight: bold; font-size: 1.2em; color: #323232; margin-bottom: 10px; text-decoration: underline; }
    .label { color: #888; min-width: 80px; display: inline-block; font-weight: bold; color: #323232; font-size: 1.1em; }
    .value { color: #323232; line-height: 26pt; }
    .item { margin-bottom: 10px; }
     .license-text-container {
      margin-top: 10px;
      margin-bottom: 15px;
    }
    .license-text-label {
      font-weight: bold;
      font-size: 1.1em;
      color: #323232;
      margin-bottom: 5px;
    }
    .license-text-content {
      font-size: 0.9em;
      color: #323232;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-width: 100%;
    }
    .license-item { margin-bottom: 8px; }
    .license-short-id { font-weight: bold; }
  </style>
</head>
<body>
<div class="titleBlock">
<div class="header">
    <img src="data:image/png;base64,${await getBase64Logo()}" class="logo" alt="Interlynk Logo" />
    <span class="title">Interlynk</span>
  </div>
  <div class="title" style="font-size:1.5em; color:#3d71ee; margin-top:8px;">Attribution Report</div>
  </div>
  <div class="divider"></div>
  ${components
    .map((component) => {
      const licenseExpText = component.licensesExp || 'N/A'

      return `
          <div class="component">
            <div class="component-name">${component.name} - ${component.version}</div>
            <div class="item"><span class="label">Notice:</span> <span class="value">${component.notice || 'N/A'}</span></div>
            <div class="item"><span class="label">License:</span> <span class="value">${licenseExpText}</span></div>
           ${
             licenseExpText !== 'N/A'
               ? `
              <div class="license-text-container">
                <div class="license-text-label">License Text:</div>
                ${
                  Array.isArray(component.licenseText) &&
                  component.licenseText.length > 0
                    ? component.licenseText
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
            <div class="item"><span class="label">Copyright:</span> <span class="value">${component.copyright || 'N/A'}</span></div>
          </div>
        `
    })
    .join('')}
</body>
</html>
  `

  const filename = attributionFilename(productName, productVersion)

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
  const response = await fetch(require('assets/img/logo.png'))
  const blob = await response.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(blob)
  })
}
