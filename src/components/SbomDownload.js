import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { client } from 'context/ApolloWrapper'
import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { convertToCSV, downloadCSV, getSignedUrlParams } from 'utils'
import { exportExcel } from 'views/Sbom/DownloadUtils/excelUtils'
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
  GetComponentSupportData,
  SignedSbomDownload
} from 'graphQL/Queries'
import { GetProductManufacturer } from 'graphQL/Queries'

import { FaFileDownload } from 'react-icons/fa'

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

  const { data: manufacturerData } = useQuery(GetProductManufacturer, {
    skip: !signedUrlParams ? false : true,
    variables: { id: params?.productid }
  })

  const productName = sbom?.project?.projectGroup?.name
  const version = sbom?.projectVersion

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)
  const [downloadType, setDownloadType] = useState(null)

  const initialRef = useRef(null)
  const finalRef = useRef(null)

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
      console.error('Error downloading original SBOM:', error)
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

  //Download CSV for support status
  const handleExport = async () => {
    const selectedColumns = ['name', 'version', 'supportLevel', 'endOfSupport']
    const fileName = `${productName}-${version}-Support-Level.csv`
    setIsLoading(true)
    try {
      let allFetchedData = []
      let componentsHasNextPage = true
      let componentsEndCursor = null

      while (componentsHasNextPage) {
        const componentsRes = await client.query({
          query: GetComponentSupportData,
          variables: {
            first: 200,
            sbomId: params?.sbomid,
            projectId: params?.productid,
            after: componentsEndCursor || undefined,
            includeParts: true
          },
          fetchPolicy: 'no-cache'
        })

        const fetchedComponents =
          componentsRes?.data?.sbom?.components?.nodes || []
        const pageInfo = componentsRes?.data?.sbom?.components?.pageInfo

        allFetchedData.push(...fetchedComponents)
        componentsEndCursor = pageInfo?.endCursor // Only assign once
        componentsHasNextPage = pageInfo?.hasNextPage // Only assign once
      }

      if (allFetchedData.length > 0) {
        const csvContent = convertToCSV(allFetchedData, selectedColumns)
        downloadCSV(csvContent, fileName)
      } else {
        showToast({
          description: 'No data available for export.',
          status: 'warning'
        })
      }
    } catch (error) {
      console.error('Export Error:', error)
      showToast({
        description:
          'Internal error during data download. Please try again in a few minutes.',
        status: 'error'
      })
    } finally {
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
      console.log(err)
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
    setDownloadType('csv')
    handleExport()
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
            icon={<FaFileDownload />}
          />
        </Tooltip>
        <MenuList width='220px'>
          <MenuItem onClick={downloadOriginal}>
            <Stack spacing={1}>
              <Box {...title}>Original SBOM</Box>
              <Box {...subTitle}>
                Download the original SBOM file that created this version
              </Box>
            </Stack>
          </MenuItem>
          <Divider />
          {/* Updated SBOM */}
          <MenuItem onClick={downloadUpdated}>
            <Stack spacing={1}>
              <Box {...title}>Updated SBOM</Box>
              <Box {...subTitle}>
                Download the current state of the version as a CycloneDX / SPDX
                or SPDX-Lite file
              </Box>
            </Stack>
          </MenuItem>
          <Divider />
          {/* PDF */}
          <MenuItem isDisabled={isFreeTier} onClick={downloadPdf}>
            <Stack spacing={1}>
              <Box {...title}>PDF</Box>
              <Box {...subTitle}>
                Download the current state of the version as PDF
              </Box>
            </Stack>
          </MenuItem>
          {/* Support Level CSV */}
          <MenuItem onClick={downloadSupport}>
            <Stack spacing={1}>
              <Box {...title}>Support Level</Box>
              <Box {...subTitle}>
                Download CSV of current Support Level for all components
              </Box>
            </Stack>
          </MenuItem>
          {/*  SBOM EXCEL DOWNLOAD */}
          <MenuItem onClick={downloadExcel} hidden={signedUrlParams}>
            <Stack spacing={1}>
              <Box {...title} spacing={1} mb='4px'>
                SBOM Spreadsheet
              </Box>
              <Box {...subTitle}>Download Spreadsheet of SBOM</Box>
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
          finalRef={finalRef}
          initialRef={initialRef}
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
