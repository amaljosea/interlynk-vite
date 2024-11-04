import { useLazyQuery, useQuery } from '@apollo/client'
import { client } from 'context/ApolloWrapper'
import { useState } from 'react'
import { getSignedUrlParams, truncatedValue } from 'utils'

import { DownloadIcon } from '@chakra-ui/icons'
import { Button, Divider, Flex, Stack, Tag, Text } from '@chakra-ui/react'
import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react'
import { Radio, RadioGroup, useDisclosure } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetSbomQualityScores, SignedSbomDownload } from 'graphQL/Queries'
import { DownloadSBOM } from 'graphQL/Queries'
import { GetComponentData, GetVulnData } from 'graphQL/Queries'

import ComplianceChecks from './ComplianceChecks'
import { downloadSbomPdf } from './SbomPdf'
import { authorsList } from './SbomPdf'

const DownloadModal = (props) => {
  const { isOpen, onClose, productId, productName, version, sbomId, sbom } =
    props || ''

  const { showToast } = useCustomToast()
  const { organization } = useGlobalState()
  const { superAdmin } = organization?.currentUser || ''
  const signedUrlParams = getSignedUrlParams()
  const [getData] = useLazyQuery(
    signedUrlParams ? SignedSbomDownload : DownloadSBOM
  )

  const { primaryComponent } = sbom || ''
  const { description, purl } = primaryComponent || ''

  const authors =
    sbom?.authors.length > 0 ? authorsList(sbom?.authors) : undefined

  const [spec, setSpec] = useState('CycloneDX')
  const [format, setFormat] = useState('json')
  const [includeVulns, setIncludeVulns] = useState(false)
  const [original, setOriginal] = useState(false)
  const [encoded, setEncoded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [excludeParts, setExcludeParts] = useState(false)

  const { data: ntia, loading: ntiaLoading } = useQuery(GetSbomQualityScores, {
    skip: isOpen && !signedUrlParams ? false : true,
    variables: { sbomIds: [sbomId], reportFormat: 'NTIA' }
  })
  const { data: fda, loading: fdaLoading } = useQuery(GetSbomQualityScores, {
    skip: isOpen && !signedUrlParams ? false : true,
    variables: { sbomIds: [sbomId], reportFormat: 'FDA' }
  })

  const { nodes: ntiaData } = ntia?.complianceReports || ''
  const { nodes: fdaData } = fda?.complianceReports || ''

  const DETAILS = useDisclosure()

  const onCheckOrigin = (e) => {
    const { checked } = e.target
    setOriginal((prev) => !prev)
    setSpec(checked ? '' : 'CycloneDX')
    setFormat(checked ? 'xml' : 'json')
    setIncludeVulns(false)
    setEncoded(false)
  }

  const { primaryBlueText, primaryTextColor } = useThemeColor([
    'primaryBlueText'
  ])
  const type = spec === 'CycloneDX' ? 'cdx' : 'spdx'

  const downloadJsonFile = (jsonData) => {
    if (jsonData) {
      const jsonDataStr = JSON.stringify(jsonData, null, 2)
      const blob = new Blob([jsonDataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      console.log(`URL`, url)
      a.download = `${productName}-${version}.${type}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const downloadXmlFile = (xmlData) => {
    if (xmlData) {
      const blob = new Blob([xmlData], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${productName}-${version}.${type}.xml`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDownloadPdf = async () => {
    setIsLoading(true)
    let allComponents = []
    let allVulns = []
    let componentsHasNextPage = true
    let vulnsHasNextPage = true
    let componentsEndCursor = null
    let vulnsEndCursor = null

    try {
      while (componentsHasNextPage || vulnsHasNextPage) {
        if (componentsHasNextPage) {
          const componentsRes = await client.query({
            query: GetComponentData,
            variables: {
              projectId: productId,
              sbomId,
              first: 200,
              after: componentsEndCursor || undefined
            },
            fetchPolicy: 'no-cache'
          })

          const fetchedComponents =
            componentsRes?.data?.sbom?.components?.nodes || []
          const pageInfo = componentsRes?.data?.sbom?.components?.pageInfo

          allComponents.push(...fetchedComponents)
          componentsEndCursor = pageInfo?.endCursor
          componentsHasNextPage = pageInfo?.hasNextPage
        }

        if (vulnsHasNextPage) {
          const vulnRes = await client.query({
            query: GetVulnData,
            variables: {
              projectId: productId,
              sbomId,
              first: 200,
              after: vulnsEndCursor || undefined
            },
            fetchPolicy: 'no-cache'
          })

          const fetchedVulns = vulnRes?.data?.sbom?.vulns?.nodes || []
          const pageInfo = vulnRes?.data?.sbom?.vulns?.pageInfo

          allVulns.push(...fetchedVulns)
          vulnsEndCursor = pageInfo?.endCursor
          vulnsHasNextPage = pageInfo?.hasNextPage
        }
      }

      downloadSbomPdf(
        productName,
        version,
        description,
        purl,
        authors,
        sbom,
        allComponents,
        allVulns,
        organization?.currentUser.name
      )

      setIsLoading(false)
      onClose()
    } catch (error) {
      setIsLoading(false)
      showToast({
        description: 'Error downloading SBOM PDF. Please try again later.',
        status: 'error'
      })
    }
  }

  const { isFreeTier } = useGlobalQueryContext()

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      if (format === 'pdf') {
        handleDownloadPdf()
        return
      }
      await getData({
        variables: {
          includeVulns,
          sbomId: sbomId,
          package: encoded,
          original: original,
          lite: spec === 'SPDX-Lite' ? true : false,
          projectId: signedUrlParams ? undefined : productId,
          excludeParts: signedUrlParams ? undefined : excludeParts,
          spec: original ? undefined : spec === 'SPDX-Lite' ? 'SPDX' : spec
        }
      })
        .then((res) => {
          console.log(`res`, res)
          const { called, variables } = res || ''
          if (called) {
            setIsLoading(false)
            if (variables?.package === true) {
              const parsedJson = signedUrlParams
                ? JSON.parse(res?.data?.shareLynkQuery?.sbom?.download)
                : JSON.parse(res?.data?.sbom?.download)
              if (format === 'json') {
                downloadJsonFile(parsedJson)
              } else {
                downloadXmlFile(res?.data?.sbom?.download)
              }
            } else {
              const decodedData = signedUrlParams
                ? window.atob(res?.data?.shareLynkQuery?.sbom?.download)
                : window.atob(res?.data?.sbom?.download)
              const parsedJson = JSON.parse(decodedData)
              if (format === 'json') {
                downloadJsonFile(parsedJson)
              } else {
                downloadXmlFile(decodedData)
              }
            }
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.log(`Error`, error)
      showToast({
        description: `Internal error during SBOM download. Please try again in a few minutes.`,
        status: 'error'
      })
      setIsLoading(false)
    }
  }

  const checklists = [
    {
      name: 'NTIA Minimum Elements',
      loading: ntiaLoading,
      score: ntiaData?.length > 0 ? Math.round(ntiaData[0].score) : 0
    },
    {
      name: 'FDA Cybersecurity Compliance',
      loading: fdaLoading,
      score: fdaData?.length > 0 ? Math.round(fdaData[0].score) : 0
    },
    {
      name: 'BSI TR-03183',
      loading: false,
      score: 0
    }
  ]

  const fileName =
    spec === ''
      ? `${truncatedValue(productName, 14)}-${version}.${format}`
      : `${truncatedValue(productName, 14)}-${version}.${type}.${format}`

  const pdfFileName = `${truncatedValue(productName, 14)}-${version}.${format}`

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleDownload}
        title={'Download SBOM'}
        Icon={DownloadIcon}
        isLoading={isLoading}
        buttonText={'Download'}
      >
        <Flex flexDirection={'column'} gap={4}>
          <Tag
            colorScheme='blue'
            textAlign={'right'}
            sx={{ w: 'fit-content', fontSize: 'xs', wordBreak: 'break-all' }}
          >
            {format === 'json' ? fileName : pdfFileName}
          </Tag>
          {format !== 'pdf' && (
            <FormControl>
              <FormLabel>Specification</FormLabel>
              <RadioGroup
                value={spec}
                isDisabled={original}
                onChange={(value) => setSpec(value)}
              >
                <Stack spacing={4} direction='row'>
                  <Radio value='CycloneDX'>CycloneDX</Radio>
                  <Radio value='SPDX'>SPDX</Radio>
                  <Radio value='SPDX-Lite'>SPDX-Lite</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          )}
          <Divider />
          <FormControl isDisabled={original}>
            <FormLabel>File Format</FormLabel>
            <RadioGroup value={format} onChange={(value) => setFormat(value)}>
              <Stack spacing={4} direction='row'>
                <Radio value='json'>JSON</Radio>
                <Radio isDisabled={isFreeTier} value='pdf'>
                  PDF
                </Radio>
                {/* <Radio value='xml'>XML</Radio> */}
              </Stack>
            </RadioGroup>
          </FormControl>
          <Divider />

          {format !== 'pdf' && (
            <>
              <Checkbox
                hidden={signedUrlParams}
                isChecked={excludeParts}
                onChange={() => setExcludeParts(!excludeParts)}
                isDisabled={spec === 'SPDX' || original}
              >
                Exclude Parts
              </Checkbox>
              <Checkbox
                isChecked={includeVulns}
                onChange={() => setIncludeVulns(!includeVulns)}
                isDisabled={spec === 'SPDX' || original}
              >
                Include Vulnerabilities
              </Checkbox>
              <Checkbox
                isChecked={original}
                onChange={onCheckOrigin}
                isDisabled={spec === 'SPDX'}
              >
                Original SBOM
              </Checkbox>
              <Checkbox
                hidden={!superAdmin}
                isChecked={encoded}
                onChange={() => setEncoded(!encoded)}
                isDisabled={spec === 'SPDX' || original}
              >
                Base64 Unencoded
              </Checkbox>
            </>
          )}

          <Divider hidden={signedUrlParams || format === 'pdf'} />
          <Flex
            sx={{ flexDir: 'column', gap: 4 }}
            display={!signedUrlParams ? 'flex' : 'none'}
          >
            <Flex alignItems='center' justifyContent='space-between'>
              <Text fontWeight={'medium'}>Compliance Checks</Text>
              <Text
                color={primaryBlueText}
                onClick={DETAILS.onOpen}
                sx={{ fontSize: 'sm', cursor: 'pointer', fontWeight: 'medium' }}
              >
                View Details
              </Text>
            </Flex>
            <Flex gap={4} flexDir={'column'} alignItems='flex-start'>
              {checklists.map((item, index) => (
                <Flex
                  key={index}
                  justifyContent={'space-between'}
                  sx={{ w: '100%', alignItems: 'center' }}
                >
                  <Text fontSize={'sm'} color={primaryTextColor}>
                    {item?.name}
                  </Text>
                  <Button
                    size='xs'
                    minW={'60px'}
                    cursor={'default'}
                    isLoading={item?.loading}
                    isDisabled={item?.score === 0}
                  >
                    {item?.score === 0 ? `Coming Soon..` : `${item?.score} %`}
                  </Button>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </LynkModal>

      {DETAILS.isOpen && (
        <ComplianceChecks
          name={fileName}
          isOpen={DETAILS.isOpen}
          fdaLoading={fdaLoading}
          onClose={DETAILS.onClose}
          ntiaLoading={ntiaLoading}
          fda={fdaData?.length > 0 ? fdaData[0] : []}
          ntia={ntiaData?.length > 0 ? ntiaData[0] : []}
        />
      )}
    </>
  )
}

export default DownloadModal
