export const downloadAttributionHtml = async (components) => {
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
    .map(
      (component) => `
    <div class="component">
      <div class="component-name">${component.name} - ${component.version}</div>
      <div class="item"><span class="label">Notice:</span> <span class="value">${component.notice || 'N/A'}</span></div>
      <div class="item"><span class="label">License:</span> <span class="value">${component.licensesExp || 'N/A'}</span></div>
      <div class="item"><span class="label">Copyright:</span> <span class="value">${component.copyright || 'N/A'}</span></div>
    </div>
  `
    )
    .join('')}
</body>
</html>
  `

  // Create a Blob and trigger download
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'attribution-report.html'
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
