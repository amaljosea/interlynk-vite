/* eslint-disable no-restricted-syntax */
import { jsPDF } from 'jspdf'
import { attributionFilename } from 'utils/DownloadUtils/pdfUtils'

import { NO_COMPONENTS_FILTERED_MESSAGE } from './AttributionTable'
import './fonts/arialBold'
import './fonts/arialLight'
import './fonts/arialNormal'

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
  sourcePreferences,
  includeEmptyLicenses,
  includeUnresolvedLicenses
) => {
  const filename = attributionFilename(productName, productVersion)
  const pdfDoc = new jsPDF({ compress: true })

  // This check will be needed in future while adding new fonts
  /*   console.log('Initial font list from doc instance:', pdfDoc.getFontList()) */

  const pageWidth = pdfDoc.internal.pageSize.getWidth()
  const pageHeight = pdfDoc.internal.pageSize.getHeight()
  const margin = 20

  const blackColor = '#000000'

  // --- TOC Destinations Array ---
  const tocDestinations = []

  // --- Store header info for each *content* page ---
  const contentPageHeaders = {}

  const logoBase64 = await fetchLogo()

  pdfDoc.setPage(1)

  // Set font and color for general titles on the first page
  pdfDoc.setFont('ARIAL', 'normal')

  // Page 1 title
  const titleText = 'Software Licenses'
  pdfDoc.setFontSize(36)
  pdfDoc.setTextColor('#444444') // Darker grey for the title
  const titleTextWidth = pdfDoc.getTextWidth(titleText)
  const titleX = (pageWidth - titleTextWidth) / 2 // Center alignment for the initial title
  const titleY = pageHeight / 2 - 50 // Adjust Y position

  pdfDoc.text(titleText, titleX, titleY)

  // Product Name (subtitleText)
  const subtitleText = productName
  pdfDoc.setFontSize(24)
  pdfDoc.setTextColor('#555555') // Lighter than title, darker than revision
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

    pdfDoc.setFontSize(12)
    pdfDoc.setTextColor('#555555')
    pdfDoc.setFont('ARIAL', 'normal')
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
  // Content starts at this Y position after the header area.
  // This value remains consistent for all content pages.
  let yPosition = margin + 20

  const CONTENT_LEFT_ALIGNMENT_X = 40 // Adjusted to ensure content aligns with the capital letter in the header

  // Add the first page where content will be added (initially page 2 in the PDF)
  // This page will later shift due to TOC insertion.
  pdfDoc.addPage()

  finalItems.forEach((comp) => {
    const componentId = comp.components[0].id
    const source = sourcePreferences[componentId] || 'sbom'

    const isLibrarySource = source === 'library'

    const override = comp.attributionOverride
    const attribution = comp.attribution

    const noticeText = isLibrarySource
      ? override?.notice || 'N/A'
      : attribution.notice || 'N/A'

    const copyrightText = isLibrarySource
      ? override?.copyright || 'N/A'
      : attribution.copyright || 'N/A'

    const licenseText = isLibrarySource
      ? override?.licensesExp || 'N/A'
      : attribution.licensesExp || 'N/A'

    const isEmptyLicense = () => {
      if (Array.isArray(licenseText)) return licenseText.length === 0
      return !licenseText || licenseText === 'N/A'
    }

    //when user does not want to include the components with empty licenses
    if (!includeEmptyLicenses && isEmptyLicense()) {
      return // Skip this component due to empty license
    }
    if (!includeUnresolvedLicenses && licenseText.includes('OR')) {
      return // Skip this component due to unresolved licenses
    }
    const currentComponentName = `${comp.components[0].name || 'Unknown'} - ${comp.components[0].version || 'Unknown'}`
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
      // Adjust y for TOC link to account for new header positioning
      y: yPosition
    })

    const estimatedTitleHeight = 14
    // Adjusted check for page breaks to ensure content starts from yPosition
    if (yPosition + estimatedTitleHeight > pageHeight - margin - 30) {
      relativeContentPageNumber++
      pdfDoc.addPage()
      yPosition = margin + 20 // Consistent content start Y
    }
    yPosition += 10

    pdfDoc.setFontSize(14)
    pdfDoc.setFont('ARIALBD 1', 'normal')
    pdfDoc.setTextColor(blackColor) // Keeping black for component titles for contrast
    const titleLines = pdfDoc.splitTextToSize(
      currentComponentName,
      pageWidth - CONTENT_LEFT_ALIGNMENT_X - margin
    )
    titleLines.forEach((line, index) => {
      if (yPosition > pageHeight - 30) {
        relativeContentPageNumber++
        pdfDoc.addPage()
        yPosition = margin + 20 // Consistent content start Y
        // Store header info for the new page
        contentPageHeaders[relativeContentPageNumber] = {
          componentName: currentComponentName,
          startingLetter: currentStartingLetter
        }
      }
      pdfDoc.text(line, 28, yPosition)
      // Underline for component title
      if (index === titleLines.length - 1) {
        //
      }
      yPosition += 6
    })
    yPosition += 4

    // Render Copyright section
    if (copyrightText && copyrightText !== 'N/A') {
      pdfDoc.setFontSize(11)
      pdfDoc.setFont('ARIAL', 'normal')
      pdfDoc.setTextColor('#444444')
      const copyrightSubtitleText = 'Copyright'
      pdfDoc.text(copyrightSubtitleText, CONTENT_LEFT_ALIGNMENT_X, yPosition)

      pdfDoc.setFont('ARIAL', 'normal')
      pdfDoc.setTextColor('#444444')
      pdfDoc.setFontSize(10)
      const copyrightLines = pdfDoc.splitTextToSize(
        copyrightText,
        pageWidth - CONTENT_LEFT_ALIGNMENT_X - margin
      )
      yPosition += 5
      copyrightLines.forEach((line) => {
        if (yPosition > pageHeight - 30) {
          relativeContentPageNumber++
          pdfDoc.addPage()
          yPosition = margin + 20 // Consistent content start Y

          contentPageHeaders[relativeContentPageNumber] = {
            componentName: currentComponentName,
            startingLetter: currentStartingLetter
          }
        }
        pdfDoc.text(line, CONTENT_LEFT_ALIGNMENT_X, yPosition)
        yPosition += 5
      })
      yPosition += 5
    }
    // Render License section
    pdfDoc.setFontSize(11)
    pdfDoc.setFont('ARIAL', 'normal')
    pdfDoc.setTextColor('#444444')
    const licenseSubtitleText = 'License'
    pdfDoc.text(licenseSubtitleText, CONTENT_LEFT_ALIGNMENT_X, yPosition)

    pdfDoc.setFont('ARIAL', 'normal')
    pdfDoc.setTextColor('#444444')
    pdfDoc.setFontSize(10)
    const licenseExpLines = pdfDoc.splitTextToSize(
      licenseText,
      pageWidth - CONTENT_LEFT_ALIGNMENT_X - margin
    )
    yPosition += 5
    licenseExpLines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        relativeContentPageNumber++
        pdfDoc.addPage()
        yPosition = margin + 20 // Consistent content start Y

        contentPageHeaders[relativeContentPageNumber] = {
          componentName: currentComponentName,
          startingLetter: currentStartingLetter
        }
      }
      pdfDoc.text(line, CONTENT_LEFT_ALIGNMENT_X, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Render License Text section
    let licenseTextArr = []
    if (source === 'library') {
      licenseTextArr = comp.attributionOverride?.licensesText || []
    } else {
      licenseTextArr = comp.attribution?.licensesText || []
    }

    // Filter out empty or N/A license text entries
    const filteredLicenseTextArr = Array.isArray(licenseTextArr)
      ? licenseTextArr.filter(
          (licenseObj) =>
            (licenseObj?.key && licenseObj.key !== 'N/A') ||
            (licenseObj?.value && licenseObj.value !== 'N/A')
        )
      : []

    if (filteredLicenseTextArr.length > 0) {
      pdfDoc.setFontSize(11)
      pdfDoc.setFont('ARIAL', 'normal')
      pdfDoc.setTextColor('#444444')
      const licenseTextSubtitleText = 'License Text'
      pdfDoc.text(licenseTextSubtitleText, CONTENT_LEFT_ALIGNMENT_X, yPosition)
      yPosition += 5

      filteredLicenseTextArr.forEach((licenseObj) => {
        const licenseKey = licenseObj?.key || ''
        const licenseValue = licenseObj?.value || ''

        if (yPosition + 10 > pageHeight - 30) {
          relativeContentPageNumber++
          pdfDoc.addPage()
          yPosition = margin + 20 // Consistent content start Y

          contentPageHeaders[relativeContentPageNumber] = {
            componentName: currentComponentName,
            startingLetter: currentStartingLetter
          }
        }
        pdfDoc.setTextColor('#444444')
        pdfDoc.setFont('ARIAL', 'normal')
        pdfDoc.setFontSize(10)
        if (licenseKey) {
          pdfDoc.text(licenseKey, CONTENT_LEFT_ALIGNMENT_X, yPosition)
          yPosition += 10
        }
        pdfDoc.setTextColor('#444444')
        const licenseTextLines = pdfDoc.splitTextToSize(
          licenseValue,
          pageWidth - CONTENT_LEFT_ALIGNMENT_X - margin - 20
        )
        licenseTextLines.forEach((line) => {
          if (yPosition > pageHeight - 30) {
            relativeContentPageNumber++
            pdfDoc.addPage()
            yPosition = margin + 20 // Consistent content start Y

            contentPageHeaders[relativeContentPageNumber] = {
              componentName: currentComponentName,
              startingLetter: currentStartingLetter
            }
          }
          pdfDoc.text(`${line}`, CONTENT_LEFT_ALIGNMENT_X, yPosition)
          yPosition += 5
        })
        yPosition += 5
      })
      yPosition += 5
    }

    // Render Patches section
    const patchesArr = comp.components[0]?.patches || []
    if (Array.isArray(patchesArr) && patchesArr.length > 0) {
      pdfDoc.setFontSize(11)
      pdfDoc.setFont('ARIAL', 'normal')
      pdfDoc.setTextColor('#444444')
      const patchesSubtitleText = 'Patches'
      pdfDoc.text(patchesSubtitleText, CONTENT_LEFT_ALIGNMENT_X, yPosition)
      yPosition += 5
      patchesArr.forEach((patch) => {
        const hasContent = patch.content
        const hasUrl = !!patch.url
        if (!hasContent && !hasUrl) {
          // Skip this patch if both content and url are empty or N/A
          return
        }
        // Content
        if (hasContent) {
          pdfDoc.setFont('ARIAL', 'normal')
          pdfDoc.setFontSize(10)
          pdfDoc.setTextColor('#444444')
          const contentLines = pdfDoc.splitTextToSize(
            patch.content,
            pageWidth - CONTENT_LEFT_ALIGNMENT_X - margin // Apply text wrapping
          )
          contentLines.forEach((line) => {
            if (yPosition > pageHeight - 30) {
              relativeContentPageNumber++
              pdfDoc.addPage()
              yPosition = margin + 20
              contentPageHeaders[relativeContentPageNumber] = {
                componentName: currentComponentName,
                startingLetter: currentStartingLetter
              }
            }
            pdfDoc.text(line, CONTENT_LEFT_ALIGNMENT_X, yPosition)
            yPosition += 5 // Line height for wrapped text
          })
          yPosition += 2 // Add a small gap after the content lines and before the URL
        }
        if (hasUrl) {
          if (yPosition > pageHeight - 30) {
            // Check for page break before adding URL
            relativeContentPageNumber++
            pdfDoc.addPage()
            yPosition = margin + 20 // Consistent content start Y
            contentPageHeaders[relativeContentPageNumber] = {
              componentName: currentComponentName,
              startingLetter: currentStartingLetter
            }
          }
          pdfDoc.setFont('ARIAL', 'normal')
          pdfDoc.setFontSize(9)
          pdfDoc.setTextColor('#3d71ee')
          pdfDoc.textWithLink(patch.url, CONTENT_LEFT_ALIGNMENT_X, yPosition, {
            url:
              patch.url &&
              (patch.url.startsWith('http://') ||
              patch.url.startsWith('https://')
                ? patch.url
                : `https://${patch.url}`)
          })
          yPosition += 5
        }
        yPosition += 2 // Small gap between each patch entry
      })
      yPosition += 5
    }
    // Render Notice section
    if (noticeText && noticeText !== 'N/A') {
      pdfDoc.setFontSize(11)
      pdfDoc.setFont('ARIAL', 'normal')
      pdfDoc.setTextColor('#444444')
      const noticeSubtitleText = 'Notice'
      pdfDoc.text(noticeSubtitleText, CONTENT_LEFT_ALIGNMENT_X, yPosition)

      pdfDoc.setFont('ARIAL', 'normal')
      pdfDoc.setTextColor('#444444')
      pdfDoc.setFontSize(10)
      const noticeLines = pdfDoc.splitTextToSize(
        noticeText,
        pageWidth - CONTENT_LEFT_ALIGNMENT_X - margin
      )
      yPosition += 5
      noticeLines.forEach((line) => {
        if (yPosition > pageHeight - 30) {
          relativeContentPageNumber++
          pdfDoc.addPage()
          yPosition = margin + 20 // Consistent content start Y

          contentPageHeaders[relativeContentPageNumber] = {
            componentName: currentComponentName,
            startingLetter: currentStartingLetter
          }
        }
        pdfDoc.text(line, CONTENT_LEFT_ALIGNMENT_X, yPosition)
        yPosition += 5
      })
      yPosition += 5
    }
    yPosition += 15

    // Adjusted check for page breaks
    if (yPosition > pageHeight - (margin + 50)) {
      relativeContentPageNumber++
      pdfDoc.addPage()
      yPosition = margin + 20 // Consistent content start Y
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
  // Adjust tocRenderYPosition to move TOC header higher
  let tocRenderYPosition = margin + 2

  const renderTOCContent = (currentPage) => {
    // "Contents" Heading
    pdfDoc.setFontSize(10)
    pdfDoc.setTextColor('#111111')
    pdfDoc.setFont('ARIAL', 'normal')

    const pageNumText = `${currentPage}`
    const pageNumWidth = pdfDoc.getTextWidth(pageNumText)
    const verticalLineX = margin + pageNumWidth + 1.5
    const contentsTextX = verticalLineX + 3

    // Draw page number
    pdfDoc.text(pageNumText, margin, tocRenderYPosition + 10)
    pdfDoc.setFont('ARIAL', 'normal')
    // Draw
    pdfDoc.setLineWidth(0.2)
    pdfDoc.setDrawColor('#808080')
    pdfDoc.line(
      verticalLineX,
      tocRenderYPosition + 5,
      verticalLineX,
      tocRenderYPosition + 15
    )

    // Draw "Contents" text
    pdfDoc.text('Contents', contentsTextX, tocRenderYPosition + 10)

    tocRenderYPosition += 30
  }

  // Initial render of TOC header
  renderTOCContent(currentTocPhysicalPage)

  currentTocAlphabet = ''
  let tocItemNumber = 1
  const TOC_INDENT = 10

  //If there are no components to print due to the currently set filters
  if (tocDestinations.length === 0) {
    throw new Error(NO_COMPONENTS_FILTERED_MESSAGE)
  }

  tocDestinations.forEach((item) => {
    const firstChar = item.title.charAt(0).toUpperCase()

    if (firstChar !== currentTocAlphabet) {
      if (currentTocAlphabet !== '') {
        tocRenderYPosition += TOC_LINE_HEIGHT * 2
      }
      currentTocAlphabet = firstChar
      // Alphabetical Grouping
      pdfDoc.setFontSize(10)
      pdfDoc.setFont('ARIAL', 'normal')
      pdfDoc.setTextColor('#444444')
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
      renderTOCContent(currentTocPhysicalPage) // Re-render header on new TOC page with updated page number
    }

    const titleText = item.title.slice(0, 70)

    const pageNumText = `${item.page}`

    const titleX = margin + TOC_INDENT
    pdfDoc.setFontSize(10)
    pdfDoc.setFont('ARIAL', 'normal')
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

  // Define constants for the new header layout
  const PAGE_NUMBER_FONT_SIZE = 10
  const STARTING_LETTER_FONT_SIZE_HEADER = 10
  const COMPONENT_NAME_FONT_SIZE_HEADER = 10
  const BACK_TO_CONTENTS_FONT_SIZE = 9

  // Y position for the top line of header text (page number, starting letter, back to contents link)
  const HEADER_TEXT_BASELINE_Y = margin

  for (let i = 1; i <= totalPages; i++) {
    pdfDoc.setPage(i)

    if (i === 1) {
      continue // Skip the first page (cover page)
    }

    let headerType = 'content'
    let componentName = ''
    let startingLetter = ''

    // Determine if current page is a TOC page, blank page, or content page
    if (i >= firstTocPhysicalPage && i < firstContentPageAbsolute) {
      headerType = 'toc'
    } else {
      const relativePage = i - finalTocPageShift
      if (contentPageHeaders[relativePage]) {
        componentName = contentPageHeaders[relativePage].componentName
        startingLetter = contentPageHeaders[relativePage].startingLetter
      }
    }

    // Only draw the "Back to contents page" link on content pages (not TOC or blank watermark page)
    if (i !== blankPagePhysicalNumber && headerType !== 'toc') {
      pdfDoc.setFontSize(BACK_TO_CONTENTS_FONT_SIZE)
      pdfDoc.setTextColor('#3d71ee')
      pdfDoc.setFont('ARIAL', 'normal')

      const backToContentsText = 'Back to contents page'
      const backToContentsTextWidth = pdfDoc.getTextWidth(backToContentsText)
      const backToContentsX = pageWidth - margin - backToContentsTextWidth

      pdfDoc.textWithLink(
        backToContentsText,
        backToContentsX,
        HEADER_TEXT_BASELINE_Y,
        {
          pageNumber: firstTocPhysicalPage,
          top: margin
        }
      )
    }

    if (i === blankPagePhysicalNumber) {
      // For the blank watermark page, only show "Page X" on the left
      pdfDoc.setFontSize(10)
      pdfDoc.setTextColor('#808080')
      pdfDoc.setFont('ARIAL', 'normal')
    } else if (headerType === 'content') {
      // Header style for content pages
      const pageNumText = `${i}`

      // We want the letterX to be CONTENT_LEFT_ALIGNMENT_X
      const letterX = CONTENT_LEFT_ALIGNMENT_X

      // Calculate verticalLineX based on fixed letterX
      const verticalLineX = letterX - 5

      // Calculate pageNumX based on fixed verticalLineX
      const pageNumWidth = pdfDoc.getTextWidth(pageNumText)
      const pageNumX = verticalLineX - 4 - pageNumWidth

      // Page Number (Left, larger, bold)
      pdfDoc.setFontSize(PAGE_NUMBER_FONT_SIZE)
      pdfDoc.setTextColor('#000000') // Black for page number
      pdfDoc.setFont('ARIAL', 'normal')
      pdfDoc.text(pageNumText, pageNumX, HEADER_TEXT_BASELINE_Y)

      // Draw vertical line
      pdfDoc.setLineWidth(0.2) // Thicker line
      pdfDoc.setDrawColor('#808080') // Grey color for the line
      pdfDoc.line(
        verticalLineX,
        HEADER_TEXT_BASELINE_Y - 5, // Adjusted y-start for line to align with text
        verticalLineX,
        HEADER_TEXT_BASELINE_Y + 5 // Adjusted y-end for line to align with text
      )

      // Starting Letter (Right of vertical line, bold, vertically aligned with page number)
      if (startingLetter) {
        pdfDoc.setFont('ARIALBD 1', 'normal')
        pdfDoc.setFontSize(STARTING_LETTER_FONT_SIZE_HEADER)
        pdfDoc.text(startingLetter, letterX, HEADER_TEXT_BASELINE_Y)
      }

      // Component Name (Below page number/starting letter, left-aligned with starting letter)
      pdfDoc.setFontSize(COMPONENT_NAME_FONT_SIZE_HEADER)
      pdfDoc.setTextColor('#444444') // Black
      pdfDoc.setFont('ARIAL', 'normal')
      // Reduced vertical gap to bring component name closer to the letter
      const componentNameY = HEADER_TEXT_BASELINE_Y + 4
      pdfDoc.text(componentName, letterX, componentNameY)
    } else {
      // headerType === 'toc'
      // The TOC header is now handled within the renderTOCContent function
      // This else block is no longer needed for drawing "Page X" on TOC pages.
    }
  }

  pdfDoc.save(`${filename}.pdf`)
}
