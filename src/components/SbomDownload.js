import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatSupportLevel, getSignedUrlParams } from 'utils'
import { exportExcel } from 'utils/DownloadUtils/excelUtils'
import DownloadModal from 'views/Sbom/components/DownloadModal'

import { Box, Divider, IconButton, Stack } from '@chakra-ui/react'
import { Tooltip, useDisclosure } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { recheckHealth } from 'graphQL/Mutation'
import {
  DownloadSBOM,
  GetProductManufacturer,
  SignedSbomDownload,
  SupportLevelCSV
} from 'graphQL/Queries'

import { LuDownload } from 'react-icons/lu'

import Loading from './Misc/Loading'

const SbomDownload = ({ sbom, primaryLoading }) => {
  const params = useParams()
  const { showToast } = useCustomToast()
  const { organization } = useGlobalState()
  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()

  const { primaryTextColor, secondaryTextInverse } = useThemeColor([
    'primaryTextColor',
    'secondaryTextInverse'
  ])

  const [healthRecheck] = useMutation(recheckHealth)
  const [getData] = useLazyQuery(
    signedUrlParams ? SignedSbomDownload : DownloadSBOM
  )

  const [getCSVData] = useLazyQuery(SupportLevelCSV)

  const { data: manufacturerData } = useQuery(GetProductManufacturer, {
    skip: !signedUrlParams ? false : true,
    variables: { id: params?.productid }
  })

  const productName = sbom?.project?.projectGroup?.name
  const version = sbom?.projectVersion

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)
  const [downloadType, setDownloadType] = useState(null)

  //Download Original Sbom
  const downloadOriginalSbom = async () => {
    setIsLoading(true)
    try {
      const response = await getData({
        variables: {
          sbomId: params?.sbomid,
          projectId: signedUrlParams ? undefined : params?.productid,
          original: true
        }
      })

      const downloadData = signedUrlParams
        ? response?.data?.shareLynkQuery?.sbom?.download
        : response?.data?.sbom?.download

      if (!response.data || downloadData === null) {
        showToast({
          description: `No original SBOM present for this version.`,
          status: 'error'
        })
        setIsLoading(false)
        return
      }
      if (response.called) {
        const decodedData = window.atob(downloadData.content)
        const blob = new Blob([decodedData], { type: downloadData.contentType })

        const fileExtension =
          downloadData.contentType === 'application/json' ? 'json' : 'xml'
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${productName}-${version}.${fileExtension}`
        a.click()
        URL.revokeObjectURL(url)
      }
      setIsLoading(false)
    } catch (error) {
      showToast({
        description: `Internal error during SBOM download. Please try again in a few minutes.`,
        status: 'error'
      })
      setIsLoading(false)
    }
  }

  //Open Modal for sbom for updated SBOM or PDF
  const onDownload = () => {
    if (primaryLoading) {
      showToast({
        description:
          'Primary component is still getting uploaded. Please try in some time',
        status: 'warning'
      })
      return
    }
    if (signedUrlParams) {
      onOpen()
    } else {
      healthRecheck({ variables: { sbomId: params?.sbomid } }).then(
        (res) => res?.data && onOpen()
      )
    }
  }

  //Download CSV

  const supportLevelCSVDownload = async () => {
    setIsLoading(true)

    try {
      const response = await getCSVData({
        variables: {
          sbomId: params?.sbomid,
          projectId: params?.productid,
          supportLevelOnly: true
        }
      })

      const downloadData = response?.data?.sbom?.download

      if (!response.data || downloadData === null) {
        showToast({
          description: 'No Data available',
          status: 'warning'
        })
        setIsLoading(false)
        return
      }

      if (response.called) {
        let { content, filename, contentType } = downloadData

        // Checking if the content only has headers
        const splitContent = content.trim().split('\n')

        // Process the content and format the level column values
        const formattedContent = splitContent
          .map((line, index) => {
            if (index === 0) return line // Keep header row as is

            const row = line.split(',') // Split CSV line into columns
            row[4] = formatSupportLevel(row[4]) // Format the 'level' column

            return row.join(',')
          })
          .join('\n')

        const blob = new Blob([formattedContent], {
          type: contentType || 'text/csv'
        })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = filename || `${productName}-${version}-Support-Level.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      setIsLoading(false)
    } catch (error) {
      showToast({
        description: 'Error processing the SBOM CSV download.',
        status: 'error'
      })
      setIsLoading(false)
    }
  }

  //Spreadsheet/Excel download
  const handleExcelExport = async () => {
    try {
      await exportExcel(
        setIsLoading,
        productName,
        version,
        manufacturerData,
        sbom,
        organization,
        params?.productid,
        params?.sbomid
      )
    } catch (err) {
      console.warn(err)
      showToast({
        description:
          'Error downloading SBOM spreadsheet. Please try again later.',
        status: 'error'
      })
      setIsLoading(false)
    }
  }

  const downloadOriginal = () => {
    setDownloadType('original')
    downloadOriginalSbom()
  }
  const downloadUpdated = () => {
    setDownloadType('sbom')
    onDownload()
  }
  const downloadPdf = () => {
    setDownloadType('pdf')
    onDownload()
  }
  const downloadSupport = () => {
    setDownloadType('support')
    supportLevelCSVDownload()
  }
  const downloadExcel = () => {
    setDownloadType('excel')
    handleExcelExport()
  }

  const title = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: primaryTextColor
  }
  const subTitle = { fontSize: '12px', color: secondaryTextInverse }

  return (
    <>
      <Menu>
        <Tooltip label='Download' shouldWrapChildren>
          <MenuButton
            size='md'
            as={IconButton}
            colorScheme='blue'
            className='download'
            isDisabled={isLoading}
            icon={<LuDownload size={18} />}
          />
        </Tooltip>
        <MenuList width='220px'>
          {/* Updated SBOM */}
          <MenuItem onClick={downloadUpdated}>
            <Stack spacing={1}>
              <Box {...title}>SBOM</Box>
              <Box {...subTitle}>
                Download version details as a CycloneDX / SPDX
              </Box>
            </Stack>
          </MenuItem>
          <Divider hidden={signedUrlParams} />
          {/* PDF */}
          <MenuItem
            isDisabled={isFreeTier}
            onClick={downloadPdf}
            hidden={signedUrlParams}
          >
            <Stack spacing={1}>
              <Box {...title}>PDF</Box>
              <Box {...subTitle}>Download version details as PDF</Box>
            </Stack>
          </MenuItem>
          <Divider hidden={signedUrlParams} />
          {/*  SBOM EXCEL DOWNLOAD */}
          <MenuItem
            isDisabled={isFreeTier}
            onClick={downloadExcel}
            hidden={signedUrlParams}
          >
            <Stack spacing={1}>
              <Box {...title} spacing={1}>
                Excel
              </Box>
              <Box {...subTitle}>Download version details as Excel</Box>
            </Stack>
          </MenuItem>
          <Divider hidden={signedUrlParams} />
          {/* Support Level CSV */}
          <MenuItem
            isDisabled={isFreeTier}
            hidden={signedUrlParams}
            onClick={downloadSupport}
          >
            <Stack spacing={1}>
              <Box {...title}>CSV (Support Levels)</Box>
              <Box {...subTitle}>Download component support levels as CSV</Box>
            </Stack>
          </MenuItem>
          <Divider hidden={signedUrlParams} />
          <MenuItem
            isDisabled={isFreeTier}
            hidden={signedUrlParams}
            onClick={downloadOriginal}
          >
            <Stack spacing={1}>
              <Box {...title}>Original</Box>
              <Box {...subTitle}>
                Download the original SBOM (if applicable)
              </Box>
            </Stack>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* DOWNLOAD SBOM */}
      {isOpen && (
        <DownloadModal
          sbom={sbom}
          isOpen={isOpen}
          onClose={onClose}
          downloadType={downloadType}
          version={sbom?.projectVersion}
          productName={sbom?.project?.projectGroup?.name}
        />
      )}

      {/* LOADING */}
      {isLoading && <Loading type={downloadType} />}
    </>
  )
}

export default SbomDownload
