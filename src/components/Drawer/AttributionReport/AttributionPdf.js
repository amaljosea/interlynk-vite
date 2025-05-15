import html2pdf from 'html2pdf.js'

export const downloadAttributionPdf = async (
  components,
  productName,
  productVersion
) => {
  try {
    // Format the filename
    const formatFilename = (name, version) => {
      // Get current date
      const now = new Date()
      const month = now
        .toLocaleString('default', { month: 'short' })
        .toLowerCase()
      const year = now.getFullYear()

      // Format name and version
      const formattedName = name.replace(/[.\s]/g, '_')
      const formattedVersion = version.replace(/[.\s]/g, '_')

      return `${formattedName}_${formattedVersion}_${month}_${year}`
    }

    const filename = formatFilename(productName, productVersion)

    let logoImg = null
    try {
      const logoBase64 = await getBase64Logo()
      if (logoBase64) {
        logoImg = await loadImage(logoBase64)
      }
    } catch (logoError) {
      console.error('Error loading logo:', logoError)
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Attribution Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      margin-bottom: 70px;
      position: relative;
    }
    .header {
      display: flex;
      align-items: center;
    }
    .logo {
      height: 40px;
      margin-right: 16px;
    }
    .title {
      font-size: 2em;
      color: #3d71ee;
    }
    .titleBlock {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .divider {
      border-bottom: 1px solid #888;
      margin: 24px 0;
    }
    .component {
      margin-bottom: 32px;
    }
    .component-name {
      font-weight: bold;
      font-size: 1.2em;
      color: #323232;
      margin-bottom: 10px;
      text-decoration: underline;
    }
    .label {
      min-width: 80px;
      display: inline-block;
      font-weight: bold;
      font-size: 1.1em;
      color: #323232;
    }
    .value {
      line-height: 26pt;
      color: #323232;
    }
    .item {
      margin-bottom: 10px;
    }
    .page-number {
      position: absolute;
      bottom: 10px;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 0.8em;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="titleBlock">
    <div class="header">
      ${logoImg ? `<img src="${logoImg.src}" class="logo" alt="Interlynk Logo" />` : ''}
      <span class="title">Interlynk</span>
    </div>
    <div class="title" style="font-size:1.5em; margin-top:8px;">Attribution Report</div>
  </div>
  <div class="divider"></div>
  ${components
    .map(
      (c) => `
    <div class="component">
      <div class="component-name">${c.name || 'Unknown'} - ${c.version || 'Unknown'}</div>
      <div class="item"><span class="label">Notice:</span> <span class="value">${c.notice || 'N/A'}</span></div>
      <div class="item"><span class="label">License:</span> <span class="value">${c.licensesExp || 'N/A'}</span></div>
      <div class="item"><span class="label">Copyright:</span> <span class="value">${c.copyright || 'N/A'}</span></div>
    </div>
  `
    )
    .join('')}
    <div class="page-number"></div>
</body>
</html>
    `

    const opt = {
      margin: [20, 20, 20, 20],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.7 },
      html2canvas: { scale: 1.5 },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      }
    }

    const pdfPromise = html2pdf().from(htmlContent).set(opt)

    const pdf = await pdfPromise.toPdf().get('pdf')

    const totalPages = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      pdf.setTextColor(100)
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
        align: 'center'
      })
    }

    return pdfPromise.save()
  } catch (err) {
    console.error('Error generating PDF:', err)
    throw err
  }
}

// Separate function to load image
function loadImage(base64Data) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = (err) => {
        console.error('Error loading logo image:', err)
        reject(new Error('Failed to load image'))
      }
      img.src = `data:image/png;base64,${base64Data}`

      // Set a timeout in case the image never loads or errors
      setTimeout(() => {
        if (!img.complete) {
          reject(new Error('Image loading timed out'))
        }
      }, 5000)
    } catch (error) {
      reject(error)
    }
  })
}

async function getBase64Logo() {
  try {
    const logoUrl = new URL('assets/img/logo.png', import.meta.url).href

    const response = await fetch(logoUrl)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch logo: ${response.status} ${response.statusText}`
      )
    }

    const blob = await response.blob()
    return await blobToBase64(blob)
  } catch (error) {
    console.log('Error fetching logo:', error)
    return null
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      reject(error)
    }
  })
}
