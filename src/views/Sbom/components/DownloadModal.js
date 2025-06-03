import { gql, useLazyQuery, useQuery } from '@apollo/client'
import { client } from 'context/ApolloWrapper'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { csvToJson, getSignedUrlParams, truncatedValue } from 'utils'

import { DownloadIcon } from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  VStack
} from '@chakra-ui/react'
import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react'
import { Radio, RadioGroup, useDisclosure } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  DownloadSBOM,
  GetComponentData,
  GetProductManufacturer,
  GetSbomQualityScores,
  GetVulnData,
  SignedSbomDownload
} from 'graphQL/Queries'
import { ActiveCompliances } from 'graphQL/Queries'

import ComplianceChecks from './ComplianceChecks'
import { downloadSbomPdf } from './SbomPdf'

const GetProjectGroup = gql`
  query GetProjectGroup($id: Uuid!) {
    projectGroup(id: $id) {
      description
    }
  }
`

const DownloadModal = (props) => {
  const { isOpen, onClose, productName, version, sbom, downloadType } =
    props || ''
  const params = useParams()
  const sbomId = params?.sbomid
  const productId = params?.productid
  const { showToast } = useCustomToast()
  const { organization } = useGlobalState()
  const { superAdmin } = organization?.currentUser || ''
  const signedUrlParams = getSignedUrlParams()
  const { isCustomerView } = useRouteFlags()

  const [getData] = useLazyQuery(
    signedUrlParams ? SignedSbomDownload : DownloadSBOM
  )

  const {
    data,
    loading: prodDescLoading,
    error: prodDescErr
  } = useQuery(GetProjectGroup, {
    variables: { id: params?.productgroupid },
    skip: isCustomerView
  })

  const productDescription = data?.projectGroup.description

  const { data: complianceData } = useQuery(ActiveCompliances)

  const activeCompliances =
    complianceData?.organization?.activeCompliances || []
  const compliance = activeCompliances?.find((item) => item?.scoreEnabled)
  const isUnspecified =
    compliance === undefined || compliance?.complianceType === 'unspecified'

  const [spec, setSpec] = useState('CycloneDX')
  const [format, setFormat] = useState('json')
  const [includeVulns, setIncludeVulns] = useState(false)
  const [includeSupport, setIncludeSupport] = useState(false)
  const [includeComponents, setIncludeComponents] = useState(true)
  const [encoded, setEncoded] = useState(false)
  const [includeVulnStatus, setIncludeVulnStatus] = useState(true)
  const [includeStatusNotes, setIncludeStatusNotes] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [includeParts, setIncludeParts] = useState(true)

  const { data: ntia, loading: ntiaLoading } = useQuery(GetSbomQualityScores, {
    skip: isOpen && !signedUrlParams ? false : true,
    variables: { sbomIds: [sbomId], reportFormat: 'NTIA' }
  })
  const { data: fda, loading: fdaLoading } = useQuery(GetSbomQualityScores, {
    skip: isOpen && !signedUrlParams ? false : true,
    variables: { sbomIds: [sbomId], reportFormat: 'FDA' }
  })

  const { data: manufacturerData } = useQuery(GetProductManufacturer, {
    skip: isOpen && !signedUrlParams ? false : true,
    variables: { id: productId }
  })

  const { nodes: ntiaData } = ntia?.complianceReports || ''
  const { nodes: fdaData } = fda?.complianceReports || ''

  const DETAILS = useDisclosure()

  // Remove checks for vulnerabilities, status, and internal notes
  useEffect(() => {
    if (includeVulns === false) {
      setIncludeVulnStatus(false)
      setIncludeStatusNotes(false)
    } else if (includeVulnStatus === false) {
      setIncludeStatusNotes(false)
    }
  }, [includeVulns, includeVulnStatus])

  useEffect(() => {
    if (downloadType === 'pdf') {
      setFormat('pdf')
    } else {
      setFormat('json')
    }
  }, [downloadType])

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
      a.download = `${productName}-${version}.${type}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDownloadPdf = async () => {
    setIsLoading(true)
    let allComponents = []
    let allVulns = []
    let componentsHasNextPage = includeComponents ? true : false
    let vulnsHasNextPage = includeVulns ? true : false
    let componentsEndCursor = null
    let vulnsEndCursor = null
    const parentSbom = sbom?.project.projectGroup.name

    try {
      while (componentsHasNextPage || vulnsHasNextPage) {
        if (componentsHasNextPage) {
          const componentsRes = await client.query({
            query: GetComponentData,
            variables: {
              projectId: productId,
              sbomId,
              first: 200,
              after: componentsEndCursor || undefined,
              includeParts
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
          //Filtering vulnerabilities based on includeParts
          const actualVulns = includeParts
            ? fetchedVulns
            : fetchedVulns.filter(
                (vuln) =>
                  vuln.component.sbom.project.projectGroup.name === parentSbom
              )
          allVulns.push(...actualVulns)
          vulnsEndCursor = pageInfo?.endCursor
          vulnsHasNextPage = pageInfo?.hasNextPage
        }
      }

      downloadSbomPdf(
        productName,
        version,
        productDescription,
        sbom,
        allComponents,
        allVulns,
        organization?.currentUser.name,
        manufacturerData,
        includeVulnStatus,
        includeStatusNotes,
        includeParts
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
      if (downloadType === 'pdf') {
        handleDownloadPdf()
        return
      }
      await getData({
        variables: {
          includeVulns,
          sbomId: sbomId,
          package: encoded,
          includeSupportStatus: includeSupport,
          lite: spec === 'SPDX-Lite' ? true : false,
          spec: spec === 'SPDX-Lite' ? 'SPDX' : spec,
          projectId: signedUrlParams ? undefined : productId,
          excludeParts: signedUrlParams ? undefined : !includeParts
        }
      }).then((res) => {
        const { called, variables, data } = res || ''
        if (called) {
          setIsLoading(false)
          if (variables?.package === true) {
            const parsedJson = signedUrlParams
              ? JSON.parse(data?.shareLynkQuery?.sbom?.download?.content)
              : JSON.parse(data?.sbom?.download?.content)

            downloadJsonFile(parsedJson)
          } else if (data?.sbom?.download?.contentType === 'text/csv') {
            const decodedData = csvToJson(data?.sbom?.download?.content)
            downloadJsonFile(decodedData)
          } else {
            const decodedData = signedUrlParams
              ? window.atob(data?.shareLynkQuery?.sbom?.download?.content)
              : window.atob(data?.sbom?.download?.content)
            const parsedJson = JSON.parse(decodedData)

            downloadJsonFile(parsedJson)
          }
        }
      })
    } catch (error) {
      console.warn('error', error)
      showToast({
        description: `Internal error during SBOM download. Please try again in a few minutes.`,
        status: 'error'
      })
      setIsLoading(false)
    }
    onClose()
  }

  const checklists = [
    {
      id: 'ntia',
      name: 'NTIA Minimum Elements',
      loading: ntiaLoading,
      score: ntiaData?.length > 0 ? Math.round(ntiaData[0]?.score) : 0
    },
    {
      id: 'fda',
      name: 'FDA Cybersecurity Compliance',
      loading: fdaLoading,
      score: fdaData?.length > 0 ? Math.round(fdaData[0]?.score) : 0
    },
    {
      id: 'bsi',
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
  const isHidden = signedUrlParams || format === 'pdf' || isUnspecified

  if (prodDescErr) {
    showToast({
      description: `Unable to load some details. Please try again in a few minutes.`,
      status: 'error'
    })
    onClose()
  }

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleDownload}
        title={`Download ${downloadType.toUpperCase()}`}
        Icon={DownloadIcon}
        isLoading={isLoading}
        buttonText={'Download'}
        disabled={prodDescLoading}
      >
        <Flex flexDirection={'column'} gap={4}>
          <Tag
            colorScheme='blue'
            textAlign={'right'}
            sx={{ w: 'fit-content', fontSize: 'xs', wordBreak: 'break-all' }}
          >
            {format === 'json' ? fileName : pdfFileName}
          </Tag>
          {downloadType === 'sbom' && (
            <FormControl>
              <FormLabel>Specification</FormLabel>
              <RadioGroup value={spec} onChange={(value) => setSpec(value)}>
                <Stack spacing={4} direction='row'>
                  <Radio value='CycloneDX'>CycloneDX</Radio>
                  <Radio value='SPDX'>SPDX</Radio>
                  <Radio value='SPDX-Lite'>SPDX-Lite</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          )}

          <SimpleGrid columns={2}>
            <FormControl>
              <FormLabel>Content</FormLabel>
              <VStack align='start'>
                {downloadType === 'pdf' && (
                  <Checkbox
                    isChecked={includeComponents}
                    onChange={() => setIncludeComponents(!includeComponents)}
                  >
                    Components
                  </Checkbox>
                )}
                <Checkbox
                  hidden={signedUrlParams || isFreeTier}
                  isChecked={includeParts}
                  onChange={() => setIncludeParts(!includeParts)}
                  isDisabled={spec === 'SPDX'}
                >
                  Parts
                </Checkbox>
                <Checkbox
                  isChecked={includeVulns}
                  onChange={() => setIncludeVulns(!includeVulns)}
                  isDisabled={spec === 'SPDX'}
                >
                  Vulnerabilities
                </Checkbox>
                {downloadType !== 'pdf' && (
                  <Checkbox
                    hidden={signedUrlParams || isFreeTier}
                    isChecked={includeSupport}
                    isDisabled={spec === 'SPDX'}
                    onChange={() => setIncludeSupport(!includeSupport)}
                  >
                    Support Level
                  </Checkbox>
                )}
                {downloadType === 'pdf' && (
                  <Checkbox
                    isDisabled={!includeVulns}
                    isChecked={includeVulnStatus}
                    onChange={() => {
                      setIncludeVulnStatus(!includeVulnStatus)
                    }}
                  >
                    Vulnerability Status
                  </Checkbox>
                )}

                {downloadType === 'pdf' && (
                  <Checkbox
                    isDisabled={!includeVulns || !includeVulnStatus}
                    isChecked={includeStatusNotes}
                    onChange={() => {
                      setIncludeStatusNotes(!includeStatusNotes)
                    }}
                  >
                    Internal Notes
                  </Checkbox>
                )}
                {/* <Checkbox>Redact Internal Components</Checkbox> */}
              </VStack>
            </FormControl>
            <FormControl>
              <FormLabel>Output</FormLabel>
              <HStack justify='space-between'>
                <RadioGroup
                  value={format}
                  onChange={(value) => setFormat(value)}
                >
                  <Stack spacing={4} direction='row'>
                    <Radio value={downloadType === 'pdf' ? 'pdf' : 'json'}>
                      {downloadType === 'pdf' ? 'PDF' : 'JSON'}
                    </Radio>
                    {/*  <Radio isDisabled={isFreeTier} value='pdf'>
                    XML
                  </Radio> */}
                  </Stack>
                </RadioGroup>
                <Checkbox
                  hidden={!superAdmin}
                  isChecked={encoded}
                  onChange={() => setEncoded(!encoded)}
                  isDisabled={spec === 'SPDX'}
                >
                  Base64 Unencoded
                </Checkbox>
              </HStack>
            </FormControl>
          </SimpleGrid>

          <Divider hidden={isHidden || isFreeTier} />
          {!isUnspecified && !isFreeTier && (
            <Flex
              sx={{ flexDir: 'column', gap: 4 }}
              display={!signedUrlParams ? 'flex' : 'none'}
            >
              <Flex alignItems='center' justifyContent='space-between'>
                <Text fontWeight={'medium'}>Compliance Checks</Text>
                <Text
                  color={primaryBlueText}
                  onClick={DETAILS.onOpen}
                  sx={{
                    fontSize: 'sm',
                    cursor: 'pointer',
                    fontWeight: 'medium'
                  }}
                >
                  View Details
                </Text>
              </Flex>
              <Flex gap={4} flexDir={'column'} alignItems='flex-start'>
                {checklists
                  ?.filter((item) => item?.id === compliance?.complianceType)
                  ?.map((item, index) => (
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
                        title='Compliance score'
                        isLoading={item?.loading}
                        isDisabled={item?.score === 0}
                      >
                        {item?.score === 0
                          ? `Coming Soon..`
                          : `${item?.score} %`}
                      </Button>
                    </Flex>
                  ))}
              </Flex>
            </Flex>
          )}
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
