import { gql, useLazyQuery, useQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  Text,
  useToast
} from '@chakra-ui/react'

import {
  DownloadSBOM,
  GetCheckResults,
  GetOrgName,
  SignedSbomDownload
} from 'graphQL/Queries'

import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const QUERY = gql`
  query Organization($projectId: Uuid!, $sbomId: Uuid!, $checkId: [String!]) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(sbomId: $sbomId) {
        totalCount
      }
      unresolvedCheckResults: checkResults(
        sbomId: $sbomId
        status: ["unresolved"]
        checkId: $checkId
      ) {
        totalCount
      }
    }
  }
`

const DownloadModal = ({
  finalRef,
  isOpen,
  onClose,
  initialRef,
  productId,
  productName,
  version,
  sbomId
}) => {
  const toast = useToast()
  const activeUser = localStorage.getItem('email')
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const [totalRows, setTotalRows] = useState(25)
  const [getData] = useLazyQuery(
    signedUrlParams ? SignedSbomDownload : DownloadSBOM
  )

  const { data: orgData } = useQuery(GetOrgName, {
    fetchPolicy: 'network-only',
    skip: isOpen ? false : true
  })

  const ntiaData = [
    {
      id: 1,
      category: 'SBOM Timestamp',
      name: 'SB-HC-5',
      type: 'check'
    },
    {
      id: 2,
      category: 'SBOM Supplier Name',
      name: 'SB-HC-8',
      type: 'check'
    },
    {
      id: 3,
      category: 'SBOM Unique Identifier',
      name: 'SB-HC-4',
      type: 'check'
    },
    {
      id: 4,
      category: 'SBOM Author Name',
      name: 'SB-HC-7',
      type: 'check'
    },
    {
      id: 5,
      category: 'Component Name',
      name: 'SB-HC-11',
      type: 'count'
    },
    {
      id: 6,
      category: 'Component Version',
      name: 'SB-HC-12',
      type: 'count'
    },
    {
      id: 7,
      category: 'Component Supplier Name',
      name: 'SB-HC-15',
      type: 'count'
    },
    {
      id: 8,
      category: 'Component Unique Identifier',
      name: 'SB-HC-16',
      type: 'count'
    },
    {
      id: 9,
      category: 'Component Relationships',
      name: 'SB-HC-10',
      type: 'count'
    }
  ]

  const fdaData = [
    {
      id: 1,
      category: 'Known Vulnerabilities',
      name: 'vulns',
      type: 'check'
    },
    {
      id: 2,
      category: 'SBOM Timestamp',
      name: 'SB-HC-5',
      type: 'check'
    },
    {
      id: 3,
      category: 'SBOM Supplier Name',
      name: 'SB-HC-8',
      type: 'check'
    },
    {
      id: 4,
      category: 'SBOM Unique Identifier',
      name: 'SB-HC-4',
      type: 'check'
    },
    {
      id: 5,
      category: 'SBOM Author Name',
      name: 'SB-HC-7',
      type: 'check'
    },
    {
      id: 6,
      category: 'Component Name',
      name: 'SB-HC-11',
      type: 'count'
    },
    {
      id: 7,
      category: 'Component Version',
      name: 'SB-HC-12',
      type: 'count'
    },
    {
      id: 8,
      category: 'Component Supplier Name',
      name: 'SB-HC-15',
      type: 'count'
    },
    {
      id: 9,
      category: 'Component Unique Identifier',
      name: 'SB-HC-16',
      type: 'count'
    },
    {
      id: 10,
      category: 'Component Relationships',
      name: 'SB-HC-10',
      type: 'count'
    },
    {
      id: 11,
      category: 'Component Support Level',
      name: `support`,
      type: 'count'
    }
  ]

  const checkId = ntiaData.map((item) => item?.name)

  const { data } = useQuery(QUERY, {
    skip: isOpen ? false : true,
    variables: {
      sbomId: sbomId,
      projectId: productId,
      checkId
    }
  })

  const { data: checkData } = useQuery(GetCheckResults, {
    fetchPolicy: 'network-only',
    skip: isOpen ? false : true,
    variables: {
      sbomId: sbomId,
      projectId: productId,
      field: 'CHECK_RESULTS_UPDATED_AT',
      direction: 'DESC',
      first: totalRows
    },
    onCompleted: (data) =>
      data && setTotalRows(data?.sbom?.checkResults?.totalCount)
  })

  const { components, unresolvedCheckResults } = data?.sbom || ''
  const { totalCount: totalComponents } = components || ''
  const { totalCount: totalUnresolvedChecks } = unresolvedCheckResults || ''
  const { checkResults } = checkData?.sbom || ''
  const { nodes: checkNodes } = checkResults || ''
  const { organization } = orgData || ''

  const isDemo = organization?.name === 'Interlynk - Demo'

  const [spec, setSpec] = useState('cyclonedx')
  const [format, setFormat] = useState('json')
  const [includeVulns, setIncludeVulns] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
      toast({
        description: `Internal error during SBOM download. Please try again in a few minutes.`,
        duration: 3000,
        position: 'top',
        status: 'error'
      })
    }
  }

  const ntiaMaxScore = 4 + totalComponents * 5
  const fdaMaxScore = 5 + totalComponents * 6
  const ntiaActualScore = ntiaMaxScore - totalUnresolvedChecks
  const fdaActualScore = fdaMaxScore - (totalUnresolvedChecks + totalComponents)

  const getValue = (check) => {
    const filterChecks = checkNodes?.filter(
      (item) =>
        item?.organizationRule?.rule?.friendlyId === check &&
        item?.status === 'unresolved'
    )
    return filterChecks?.length > 0 ? false : true
  }

  const getCount = (check) => {
    if (check === 'support') {
      return `0 / ${totalComponents}`
    } else {
      const filterChecks = checkNodes?.filter(
        (item) => item?.organizationRule?.rule?.friendlyId === check
      )
      const unresolvedChecks = filterChecks?.filter(
        (item) => item?.status === 'unresolved'
      )
      return `${totalComponents - unresolvedChecks?.length || 0} / ${totalComponents || 0}`
    }
  }

  const NTIA = () => {
    return (
      <>
        {ntiaData?.map((item, index) => (
          <Grid key={index} templateColumns='repeat(2, 1fr)' gap={6} mb={3}>
            <GridItem fontSize={'xs'}>{item?.category}</GridItem>
            <GridItem fontSize={'xs'} textAlign={'right'} ml={'auto'}>
              <Button
                size='xs'
                width={'100px'}
                _hover={{ background: '#EDF2F7' }}
                isLoading={checkNodes ? false : true}
              >
                {item?.type === 'check' ? (
                  <>
                    {getValue(item?.name) === true ? (
                      <FaCheckCircle color='green' size={16} />
                    ) : (
                      <FaTimesCircle color='red' size={16} />
                    )}
                  </>
                ) : (
                  getCount(item?.name)
                )}
              </Button>
            </GridItem>
          </Grid>
        ))}
      </>
    )
  }

  const FDA = () => {
    return (
      <>
        {fdaData?.map((item, index) => (
          <Grid key={index} templateColumns='repeat(2, 1fr)' gap={6} mb={3}>
            <GridItem fontSize={'xs'}>{item?.category}</GridItem>
            <Button
              size='xs'
              ml={'auto'}
              width={'100px'}
              _hover={{ background: '#EDF2F7' }}
              isLoading={checkNodes ? false : true}
            >
              {item?.type === 'check' ? (
                <>
                  {getValue(item?.name) === true ||
                  item?.category === 'vulns' ? (
                    <FaCheckCircle color='green' size={16} />
                  ) : (
                    <FaTimesCircle color='red' size={16} />
                  )}
                </>
              ) : (
                getCount(item?.name)
              )}
            </Button>
          </Grid>
        ))}
      </>
    )
  }

  const checklists = [
    {
      name: 'NTIA Minimum Elements',
      score: `${ntiaActualScore || 0} / ${ntiaMaxScore || 0}`,
      data: <NTIA />
    },
    {
      name: 'FDA 510(K) Compliance',
      score: `${fdaActualScore || 0} / ${fdaMaxScore || 0}`,
      data: <FDA />
    },
    {
      name: 'BSI TR-03183',
      score: '',
      // score: `${fdaActualScore || 0}/${fdaMaxScore || 0}`,
      data: <Text>Coming soon...</Text>
    }
  ]

  return (
    <Modal
      size='lg'
      finalFocusRef={finalRef}
      initialFocusRef={initialRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Download SBOM</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex flexDirection={'column'} gap={4}>
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
              gap={2}
              flexWrap={'wrap'}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Text fontWeight={'medium'} fontSize={'sm'} width='100px'>
                File Name
              </Text>
              <Tag
                p={2}
                fontSize={'xs'}
                colorScheme='blue'
                textAlign={'right'}
                wordBreak={'break-all'}
              >{`${productName}-${version}.${type}.xml`}</Tag>
            </Flex>
            <FormControl>
              <FormLabel>Compliance Checklist</FormLabel>
              <Accordion
                mt={3}
                allowMultiple
                display={isDemo ? 'block' : 'none'}
              >
                {checklists.map((item, index) => (
                  <AccordionItem key={index}>
                    <AccordionButton
                      _focus={{ outline: 'none' }}
                      _expanded={{
                        bg: 'blue.100',
                        boxShadow: 'none',
                        outline: 'none'
                      }}
                    >
                      <Flex
                        width={'100%'}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                      >
                        <Text fontSize={'sm'}>{item?.name}</Text>
                        <Button
                          size='xs'
                          ml={'auto'}
                          hidden={item?.score === ''}
                        >
                          {item?.score}
                        </Button>
                      </Flex>
                      <AccordionIcon ml={2} />
                    </AccordionButton>
                    <AccordionPanel pb={4}>{item?.data}</AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </FormControl>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Flex
            width={'100%'}
            alignItems={'center'}
            justifyContent={'flex-end'}
            gap={4}
          >
            <Button colorScheme='gray' onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleDownload}
              isLoading={isLoading}
              loadingText='Loading...'
            >
              Download
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DownloadModal
