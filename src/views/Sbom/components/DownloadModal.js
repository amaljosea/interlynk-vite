import { useLazyQuery, useQuery } from '@apollo/client'
import { useState } from 'react'
import { truncatedValue } from 'utils'

import { DownloadIcon } from '@chakra-ui/icons'
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  Text,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  DownloadSBOM,
  GetSbomQualityScores,
  SignedSbomDownload
} from 'graphQL/Queries'

import ComplianceChecks from './ComplianceChecks'

const DownloadModal = (props) => {
  const { isOpen, onClose, productId, productName, version, sbomId } =
    props || ''
  const { showToast } = useCustomToast()
  const { organization } = useGlobalState()
  const activeUser = organization?.currentUser?.email
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const [getData] = useLazyQuery(
    signedUrlParams ? SignedSbomDownload : DownloadSBOM
  )

  const [spec, setSpec] = useState('cyclonedx')
  const [format, setFormat] = useState('json')
  const [includeVulns, setIncludeVulns] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  const {
    isOpen: isOpenDetails,
    onOpen: onOpenDetails,
    onClose: onCloseDetails
  } = useDisclosure()

  const textColor = useColorModeValue('#1A202C', '#f6f6f6')
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  const type = spec === 'cyclonedx' ? 'cdx' : 'spdx'

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

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      await getData({
        variables: {
          projectId: signedUrlParams ? undefined : productId,
          sbomId: sbomId,
          includeVulns
        }
      })
        .then((res) => {
          console.log(`res`, res)
          if (res.called) {
            setIsLoading(false)
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
        })
        .finally(() => onClose())
    } catch (error) {
      console.log(`Error`, error)
      showToast({
        description: `Internal error during SBOM download. Please try again in a few minutes.`,
        status: 'error'
      })
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

  const fileName = `${truncatedValue(productName, 14)}-${version}.${type}.xml`

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
            fontSize={'xs'}
            w={'fit-content'}
            colorScheme='blue'
            textAlign={'right'}
            wordBreak={'break-all'}
          >
            {fileName}
          </Tag>
          <FormControl>
            <FormLabel>Specification</FormLabel>
            <RadioGroup value={spec} onChange={(value) => setSpec(value)}>
              <Stack spacing={4} direction='row'>
                {(activeUser === 'sp@interlynk.io' ||
                  activeUser === 'surendra.pathak@interlynk') && (
                  <Radio value='spdx'>SPDX</Radio>
                )}
                <Radio value='cyclonedx'>CycloneDX</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          <FormControl>
            <FormLabel>File Format</FormLabel>
            <RadioGroup value={format} onChange={(value) => setFormat(value)}>
              <Stack spacing={4} direction='row'>
                <Radio value='json'>JSON</Radio>
                {/* <Radio value='xml'>XML</Radio> */}
              </Stack>
            </RadioGroup>
          </FormControl>
          <Checkbox
            isChecked={includeVulns}
            onChange={() => setIncludeVulns(!includeVulns)}
            isDisabled={spec === 'spdx'}
          >
            Include Vulnerabilities
          </Checkbox>
          <Divider />
          <Flex
            flexDir={'column'}
            gap={4}
            display={!signedUrlParams ? 'flex' : 'none'}
          >
            <Flex
              flexDir={'row'}
              alignItems='center'
              justifyContent='space-between'
            >
              <Text fontWeight={'medium'}>Compliance Checks</Text>
              <Text
                fontSize={'sm'}
                color={primaryBlueText}
                cursor={'pointer'}
                fontWeight={'medium'}
                onClick={onOpenDetails}
              >
                View Details
              </Text>
            </Flex>
            <Flex gap={4} flexDir={'column'} alignItems='flex-start'>
              {checklists.map((item, index) => (
                <Flex
                  w={'100%'}
                  key={index}
                  alignItems='center'
                  justifyContent={'space-between'}
                >
                  <Text fontSize={'sm'} color={textColor}>
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

      {isOpenDetails && (
        <ComplianceChecks
          name={fileName}
          isOpen={isOpenDetails}
          fdaLoading={fdaLoading}
          onClose={onCloseDetails}
          ntiaLoading={ntiaLoading}
          fda={fdaData?.length > 0 ? fdaData[0] : []}
          ntia={ntiaData?.length > 0 ? ntiaData[0] : []}
        />
      )}
    </>
  )
}

export default DownloadModal
