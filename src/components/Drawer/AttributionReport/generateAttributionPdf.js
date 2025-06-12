/* eslint-disable no-restricted-syntax */
import { jsPDF } from 'jspdf'
import { attributionFilename } from 'utils/DownloadUtils/pdfUtils'

export const fetchLogo = async () => {
  try {
    const logoUrl = new URL('assets/img/logo.png', import.meta.url).href
    const res = await fetch(logoUrl)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]
        resolve(base64String ? `data:image/png;base64,${base64String}` : null)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn('Logo failed to load:', err)
    return null
  }
}

export const generateAttributionPdf = async (
  finalItems,
  productName,
  productVersion,
  sourcePreferences
) => {
  const filename = attributionFilename(productName, productVersion)
  const pdfDoc = new jsPDF({ compress: true })
  const pageWidth = pdfDoc.internal.pageSize.getWidth()
  const pageHeight = pdfDoc.internal.pageSize.getHeight()
  const margin = 20
  const headerHeight = 25

  const blackColor = '#000000'

  // --- TOC Destinations Array ---

  const tocDestinations = []

  // --- Store header info for each *content* page ---

  const contentPageHeaders = {}

  const logoBase64 = await fetchLogo()

  pdfDoc.setPage(1)

  // Set font and color for general titles on the first page
  pdfDoc.setFont('roboto', 'normal')

  // Page 1 title
  const titleText = 'Software Licenses'
  pdfDoc.setFontSize(36)
  pdfDoc.setTextColor('#333333') // Darker grey for the title
  const titleTextWidth = pdfDoc.getTextWidth(titleText)
  const titleX = (pageWidth - titleTextWidth) / 2 // Center alignment for the initial title
  const titleY = pageHeight / 2 - 50 // Adjust Y position

  pdfDoc.text(titleText, titleX, titleY)

  // Product Name (subtitleText)
  const subtitleText = productName
  pdfDoc.setFontSize(24) / pdfDoc.setTextColor('#555555') // Lighter than title, darker than revision
  const subtitleTextWidth = pdfDoc.getTextWidth(subtitleText) // Get width for centering
  const subtitleX = (pageWidth - subtitleTextWidth) / 2 // Center align product name
  const subtitleY = titleY + 20

  pdfDoc.text(subtitleText, subtitleX, subtitleY)

  // Revision Info
  const today = new Date()
  const generationDate =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0')

  const revisionText = `Revision: ${productVersion || 'N/A'} (${generationDate})` // Use productVersion for {Version}
  pdfDoc.setFontSize(14) // Smaller font size for revision info
  pdfDoc.setTextColor('#666666') // Lighter color for revision info
  const revisionTextWidth = pdfDoc.getTextWidth(revisionText)
  const revisionX = (pageWidth - revisionTextWidth) / 2
  const revisionY = subtitleY + 15

  pdfDoc.text(revisionText, revisionX, revisionY)

  // Bottom Right Image: {Interlynk Logo} Prepared by Interlynk Inc.
  if (logoBase64) {
    const interlynkLogoWidth = 15
    const interlynkLogoHeight = 15
    const textPreparedBy = 'Prepared by Interlynk Inc.'

    pdfDoc.setFontSize(12) / pdfDoc.setTextColor('#555555')
    pdfDoc.setFont('roboto', 'normal')
    const textWidth = pdfDoc.getTextWidth(textPreparedBy)

    const minimalGap = 2

    // Calculate vertical position (Y remains the same for both)
    const blockY = pageHeight - margin - interlynkLogoHeight

    // Calculate horizontal positions:
    // 1. Determine the rightmost edge of the text (pageWidth - margin)
    // 2. Subtract textWidth to get the starting X of the text
    const textX = pageWidth - margin - textWidth
    // 3. Subtract logoWidth and minimalGap from textX to get the starting X of the logo
    const logoX = textX - minimalGap - interlynkLogoWidth

    // Vertically center text with logo
    const textY =
      blockY + interlynkLogoHeight / 2 + pdfDoc.internal.getLineHeight() / 4

    pdfDoc.addImage(
      logoBase64,
      'PNG',
      logoX,
      blockY,
      interlynkLogoWidth,
      interlynkLogoHeight
    )
    pdfDoc.text(textPreparedBy, textX, textY)
  }

  // --- Initialize Content Page Variables ---

  let relativeContentPageNumber = 1
  let yPosition = margin + headerHeight

  // Add the first page where content will be added (initially page 2 in the PDF)
  // This page will later shift due to TOC insertion.
  pdfDoc.addPage()

  finalItems.forEach((comp) => {
    const currentComponentName = `${comp.name || 'Unknown'} - ${comp.version || 'Unknown'}`
    const currentStartingLetter = currentComponentName.charAt(0).toUpperCase()

    const headerCompText =
      currentComponentName.length > 100
        ? `${currentComponentName.slice(0, 100)}...`
        : currentComponentName
    // Store header info for the current relative content page
    contentPageHeaders[relativeContentPageNumber] = {
      componentName: headerCompText,
      startingLetter: currentStartingLetter
    }

    // Store TOC destination for this component
    // page: stores the *relative* content page number
    tocDestinations.push({
      title: currentComponentName,
      page: relativeContentPageNumber,
      y: yPosition // y position is relative to its own page's content area
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
    const licenseText =
      source === 'library'
        ? comp.enrichedContent?.packageVersion?.licenseExp || 'N/A'
        : comp.licensesExp || 'NA'

    const estimatedTitleHeight = 14
    if (yPosition + estimatedTitleHeight > pageHeight - 30) {
      relativeContentPageNumber++
      pdfDoc.addPage()
      yPosition = margin + headerHeight
    }
    yPosition += 10

    pdfDoc.setFontSize(14)
    pdfDoc.setFont('roboto', 'bold')
    pdfDoc.setTextColor(blackColor) // Keeping black for component titles for contrast
    const titleLines = pdfDoc.splitTextToSize(
      currentComponentName,
      pageWidth - 2 * margin
    )
    titleLines.forEach((line, index) => {
      if (yPosition > pageHeight - 30) {
        relativeContentPageNumber++
        pdfDoc.addPage()
        yPosition = margin + headerHeight
        // Store header info for the new page
        contentPageHeaders[relativeContentPageNumber] = {
          componentName: currentComponentName,
          startingLetter: currentStartingLetter
        }
      }
      pdfDoc.text(line, margin, yPosition)
      // Underline for component title
      if (index === titleLines.length - 1) {
        // Underline only the last line of the title
        const textWidth = pdfDoc.getTextWidth(line)
        const underlineY = yPosition + 1
        pdfDoc.setLineWidth(0.1)
        pdfDoc.setDrawColor('#000000')
        pdfDoc.line(margin, underlineY, margin + textWidth, underlineY)
      }
      yPosition += 6
    })
    yPosition += 4

    // Render Notice section
    pdfDoc.setFontSize(11)
    pdfDoc.setFont('roboto', 'normal')
    pdfDoc.setTextColor('#333333')
    const noticeSubtitleText = 'Notice'
    pdfDoc.text(noticeSubtitleText, margin, yPosition)
    // Underline for Notice subtitle
    const noticeSubtitleWidth = pdfDoc.getTextWidth(noticeSubtitleText)
    pdfDoc.setLineWidth(0.1)
    pdfDoc.setDrawColor('#333333')
    pdfDoc.line(
      margin,
      yPosition + 1,
      margin + noticeSubtitleWidth,
      yPosition + 1
    )

    pdfDoc.setFont('roboto', 'normal')
    pdfDoc.setTextColor('#444444')
    pdfDoc.setFontSize(10)
    const noticeLines = pdfDoc.splitTextToSize(
      noticeText,
      pageWidth - 2 * margin
    )
    yPosition += 5
    noticeLines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        relativeContentPageNumber++
        pdfDoc.addPage()
        yPosition = margin + headerHeight

        contentPageHeaders[relativeContentPageNumber] = {
          componentName: currentComponentName,
          startingLetter: currentStartingLetter
        }
      }
      pdfDoc.text(line, margin, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Render License section
    pdfDoc.setFontSize(11)
    pdfDoc.setFont('roboto', 'normal')
    pdfDoc.setTextColor('#333333')
    const licenseSubtitleText = 'License'
    pdfDoc.text(licenseSubtitleText, margin, yPosition)
    // Underline for License subtitle
    const licenseSubtitleWidth = pdfDoc.getTextWidth(licenseSubtitleText)
    pdfDoc.setLineWidth(0.1)
    pdfDoc.setDrawColor('#333333')
    pdfDoc.line(
      margin,
      yPosition + 1,
      margin + licenseSubtitleWidth,
      yPosition + 1
    )

    pdfDoc.setFont('roboto', 'normal')
    pdfDoc.setTextColor('#444444')
    pdfDoc.setFontSize(10)
    const licenseExpLines = pdfDoc.splitTextToSize(
      licenseText,
      pageWidth - 2 * margin
    )
    yPosition += 5
    licenseExpLines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        relativeContentPageNumber++
        pdfDoc.addPage()
        yPosition = margin + headerHeight

        contentPageHeaders[relativeContentPageNumber] = {
          componentName: currentComponentName,
          startingLetter: currentStartingLetter
        }
      }
      pdfDoc.text(line, margin, yPosition)
      yPosition += 5
    })
    yPosition += 8

    // Render License Text section
    pdfDoc.setFontSize(11)
    pdfDoc.setFont('roboto', 'normal')
    pdfDoc.setTextColor('#333333')
    const licenseTextSubtitleText = 'License Text'
    pdfDoc.text(licenseTextSubtitleText, margin, yPosition)
    // Underline for License Text subtitle
    const licenseTextSubtitleWidth = pdfDoc.getTextWidth(
      licenseTextSubtitleText
    )
    pdfDoc.setLineWidth(0.1)
    pdfDoc.setDrawColor('#333333')
    pdfDoc.line(
      margin,
      yPosition + 1,
      margin + licenseTextSubtitleWidth,
      yPosition + 1
    )

    yPosition += 10

    if (Array.isArray(comp.licenseText) && comp.licenseText.length > 0) {
      const validLicenses = comp.licenseText.filter(
        (item) => item?.content?.text
      )

      if (validLicenses.length > 0) {
        pdfDoc.setFont('roboto', 'normal')
        pdfDoc.setTextColor('#323232')
        validLicenses.forEach((licenseItem) => {
          if (yPosition + 10 > pageHeight - 30) {
            relativeContentPageNumber++
            pdfDoc.addPage()
            yPosition = margin + headerHeight

            contentPageHeaders[relativeContentPageNumber] = {
              componentName: currentComponentName,
              startingLetter: currentStartingLetter
            }
          }
          pdfDoc.setTextColor('#333333')
          pdfDoc.setFont('roboto', 'normal')
          pdfDoc.setFontSize(10)
          const licenseItemSubtitleText = `${licenseItem?.content?.shortId || 'N/A'}`
          pdfDoc.text(licenseItemSubtitleText, margin, yPosition)
          pdfDoc.setFontSize(10)
          pdfDoc.setFont('roboto', 'normal')
          yPosition += 10
          pdfDoc.setTextColor('#444444')
          const licenseTextLines = pdfDoc.splitTextToSize(
            licenseItem?.content?.text || 'N/A',
            pageWidth - 2 * margin - 20
          )
          licenseTextLines.forEach((line) => {
            if (yPosition > pageHeight - 30) {
              relativeContentPageNumber++
              pdfDoc.addPage()
              yPosition = margin + headerHeight

              contentPageHeaders[relativeContentPageNumber] = {
                componentName: currentComponentName,
                startingLetter: currentStartingLetter
              }
            }
            pdfDoc.text(`${line}`, margin, yPosition)
            yPosition += 5
          })
          yPosition += 5
        })
      } else {
        pdfDoc.setFont('roboto', 'normal')
        pdfDoc.setTextColor('#444444')
        pdfDoc.setFontSize(10)
        pdfDoc.text('N/A', margin, yPosition)
        yPosition += 5
      }
    } else {
      pdfDoc.setFont('roboto', 'normal')
      pdfDoc.setTextColor('#444444')
      pdfDoc.setFontSize(10)
      pdfDoc.text('N/A', margin, yPosition)
      yPosition += 5
    }
    yPosition += 5

    // Render Copyright section
    pdfDoc.setFontSize(11)
    pdfDoc.setFont('roboto', 'normal')
    pdfDoc.setTextColor('#333333')
    const copyrightSubtitleText = 'Copyright'
    pdfDoc.text(copyrightSubtitleText, margin, yPosition)
    // Underline for Copyright subtitle
    const copyrightSubtitleWidth = pdfDoc.getTextWidth(copyrightSubtitleText)
    pdfDoc.setLineWidth(0.1)
    pdfDoc.setDrawColor('#333333')
    pdfDoc.line(
      margin,
      yPosition + 1,
      margin + copyrightSubtitleWidth,
      yPosition + 1
    )

    pdfDoc.setFont('roboto', 'normal')
    pdfDoc.setTextColor('#444444')
    pdfDoc.setFontSize(10)
    const copyrightLines = pdfDoc.splitTextToSize(
      copyrightText,
      pageWidth - 2 * margin
    )
    yPosition += 5
    copyrightLines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        relativeContentPageNumber++
        pdfDoc.addPage()
        yPosition = margin + headerHeight

        contentPageHeaders[relativeContentPageNumber] = {
          componentName: currentComponentName,
          startingLetter: currentStartingLetter
        }
      }
      pdfDoc.text(line, margin, yPosition)
      yPosition += 5
    })
    yPosition += 15

    if (yPosition > pageHeight - (margin + headerHeight + 50)) {
      relativeContentPageNumber++
      pdfDoc.addPage()
      yPosition = margin + headerHeight
    }
  })

  // --- Calculate and Insert TOC Pages ---
  const TOC_LINE_HEIGHT = 7
  const TOC_HEADER_HEIGHT = 30
  const TOC_ALPHABET_GROUP_HEIGHT = 14
  let estimatedTocContentHeight = TOC_HEADER_HEIGHT
  let currentTocAlphabet = ''

  tocDestinations.forEach((item) => {
    const firstChar = item.title.charAt(0).toUpperCase()
    if (firstChar !== currentTocAlphabet) {
      if (currentTocAlphabet !== '') {
        estimatedTocContentHeight += TOC_LINE_HEIGHT * 2
      }
      estimatedTocContentHeight += TOC_ALPHABET_GROUP_HEIGHT
      currentTocAlphabet = firstChar
    }
    estimatedTocContentHeight += TOC_LINE_HEIGHT
  })

  const availableTocHeight = pageHeight - 2 * margin
  const numTocPagesNeeded = Math.ceil(
    estimatedTocContentHeight / availableTocHeight
  )

  const tocPageShift = numTocPagesNeeded + 1
  const blankPageAfterTocShift = 1
  const finalTocPageShift = tocPageShift + blankPageAfterTocShift

  tocDestinations.forEach((item) => {
    item.page += finalTocPageShift
  })

  for (let i = 0; i < numTocPagesNeeded; i++) {
    pdfDoc.insertPage(2 + i) // Insert TOC pages as before
  }

  const blankPagePhysicalNumber = 2 + numTocPagesNeeded
  pdfDoc.insertPage(blankPagePhysicalNumber)

  // Switch to the blank page to add the watermark
  pdfDoc.setPage(blankPagePhysicalNumber)

  if (logoBase64) {
    // Watermark logo dimensions and position
    const watermarkLogoWidth = 100
    const watermarkLogoHeight = 100
    const watermarkLogoX = (pageWidth - watermarkLogoWidth) / 2
    const watermarkLogoY = (pageHeight - watermarkLogoHeight) / 2

    // Set transparency for watermark effect
    pdfDoc.setGState(new pdfDoc.GState({ opacity: 0.15 }))

    // Add the logo as a watermark
    pdfDoc.addImage(
      logoBase64,
      'PNG',
      watermarkLogoX,
      watermarkLogoY,
      watermarkLogoWidth,
      watermarkLogoHeight
    )

    pdfDoc.setGState(new pdfDoc.GState({ opacity: 1 }))
  }

  // --- Populate TOC on the newly inserted pages ---
  const firstTocPhysicalPage = 2
  let currentTocPhysicalPage = firstTocPhysicalPage
  pdfDoc.setPage(currentTocPhysicalPage) // Go back to the first TOC page to render TOC
  let tocRenderYPosition = margin

  const renderTOCContent = () => {
    // "Contents" Heading
    pdfDoc.setFontSize(18)
    pdfDoc.setTextColor('#111111')
    pdfDoc.setFont('roboto', 'normal')
    pdfDoc.text('Contents', margin, tocRenderYPosition + 10)
    tocRenderYPosition += 30
  }

  renderTOCContent()

  currentTocAlphabet = ''
  let tocItemNumber = 1
  const TOC_INDENT = 10

  tocDestinations.forEach((item) => {
    const firstChar = item.title.charAt(0).toUpperCase()

    if (firstChar !== currentTocAlphabet) {
      if (currentTocAlphabet !== '') {
        tocRenderYPosition += TOC_LINE_HEIGHT * 2
      }
      currentTocAlphabet = firstChar
      // Alphabetical Grouping
      pdfDoc.setFontSize(10)
      pdfDoc.setFont('roboto', 'normal')
      pdfDoc.setTextColor('#333333')
      pdfDoc.text(
        `${tocItemNumber}. ${currentTocAlphabet}`,
        margin,
        tocRenderYPosition
      )
      tocRenderYPosition += TOC_LINE_HEIGHT
      tocItemNumber++
    }

    // Check if TOC overflows the current TOC page
    if (tocRenderYPosition > pageHeight - margin) {
      currentTocPhysicalPage++

      if (
        currentTocPhysicalPage >
        firstTocPhysicalPage + numTocPagesNeeded - 1
      ) {
        pdfDoc.addPage()
      }
      pdfDoc.setPage(currentTocPhysicalPage)
      tocRenderYPosition = margin
      renderTOCContent() // Re-render header on new TOC page
    }

    const titleText = item.title.slice(0, 70)

    const pageNumText = `${item.page}`

    const titleX = margin + TOC_INDENT
    pdfDoc.setFontSize(10)
    pdfDoc.setFont('roboto', 'normal')
    pdfDoc.setTextColor('#666666')
    const pageNumWidth = pdfDoc.getTextWidth(pageNumText)
    const pageNumX = pageWidth - margin - pageNumWidth
    const textWidth = pdfDoc.getTextWidth(titleText)
    const dotWidth = pdfDoc.getTextWidth('.')
    const dotStartX = titleX + textWidth + 2
    const availableDotWidth = pageNumX - dotStartX

    let dots = ''
    let currentDotsWidth = 0

    while (currentDotsWidth + dotWidth < availableDotWidth) {
      dots += '.'
      currentDotsWidth = pdfDoc.getTextWidth(dots)
    }

    // Draw title as link
    pdfDoc.textWithLink(titleText, titleX, tocRenderYPosition, {
      pageNumber: item.page,
      top: item.y
    })

    // Draw dots
    pdfDoc.text(dots, dotStartX, tocRenderYPosition)

    // Draw page number
    pdfDoc.text(pageNumText, pageNumX, tocRenderYPosition)

    tocRenderYPosition += TOC_LINE_HEIGHT
  })

  const totalPages = pdfDoc.internal.getNumberOfPages()

  const firstContentPageAbsolute =
    2 + numTocPagesNeeded + blankPageAfterTocShift

  const relativeToAbsolutePageMap = {}
  let currentRelativePage = 1
  for (let i = firstContentPageAbsolute; i <= totalPages; i++) {
    relativeToAbsolutePageMap[currentRelativePage] = i
    currentRelativePage++
  }

  const C_BOX_MARGIN_LEFT = margin
  const HEADER_TEXT_Y = margin + 5

  const BACK_TO_CONTENTS_TEXT = 'Back to contents page'
  const BACK_TO_CONTENTS_FONT_SIZE = 9
  const BACK_TO_CONTENTS_X = margin
  const BACK_TO_CONTENTS_Y = HEADER_TEXT_Y - 5

  for (let i = 1; i <= totalPages; i++) {
    pdfDoc.setPage(i)

    if (i === 1) {
      continue
    }

    let headerType = 'content'
    let componentName = ''
    let startingLetter = ''

    // Check if the current page is a TOC page OR the blank page after TOC
    if (i >= firstTocPhysicalPage && i < firstContentPageAbsolute) {
      headerType = 'toc'
    } else {
      const relativePage = i - finalTocPageShift
      if (contentPageHeaders[relativePage]) {
        componentName = contentPageHeaders[relativePage].componentName
        startingLetter = contentPageHeaders[relativePage].startingLetter
      }

      pdfDoc.setFontSize(BACK_TO_CONTENTS_FONT_SIZE)
      pdfDoc.setTextColor('#3d71ee')
      pdfDoc.setFont('roboto', 'normal')
      pdfDoc.textWithLink(
        BACK_TO_CONTENTS_TEXT,
        BACK_TO_CONTENTS_X,
        BACK_TO_CONTENTS_Y,
        {
          pageNumber: firstTocPhysicalPage,
          top: margin
        }
      )
    }

    if (i === blankPagePhysicalNumber) {
      pdfDoc.text(`Page ${i}`, pageWidth - margin, HEADER_TEXT_Y, {
        align: 'right'
      })
    } else {
      pdfDoc.setFontSize(10)
      pdfDoc.setTextColor('#808080')
      pdfDoc.setFont('roboto', 'normal')

      pdfDoc.text(`Page ${i}`, pageWidth - margin, HEADER_TEXT_Y, {
        align: 'right'
      })
    }

    if (headerType === 'content') {
      if (startingLetter) {
        pdfDoc.setFont('roboto', 'bold')
        pdfDoc.setFontSize(10)

        const letterX = BACK_TO_CONTENTS_X
        pdfDoc.text(startingLetter, letterX, HEADER_TEXT_Y + 0.5)
      }

      pdfDoc.setFontSize(10)
      pdfDoc.setTextColor(blackColor)
      pdfDoc.setFont('roboto', 'normal')

      pdfDoc.text(componentName, C_BOX_MARGIN_LEFT, HEADER_TEXT_Y + 5)
    }

    pdfDoc.setLineWidth(0.1)
    pdfDoc.setDrawColor('#D3D3D3')
    pdfDoc.line(margin, margin + 15, pageWidth - margin, margin + 15)
  }

  pdfDoc.save(`${filename}.pdf`)
}
