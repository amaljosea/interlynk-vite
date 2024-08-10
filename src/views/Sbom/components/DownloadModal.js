import { useLazyQuery, useQuery } from '@apollo/client'
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
  Text
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import {
  DownloadSBOM,
  GetSbomQualityScores,
  SignedSbomDownload
} from 'graphQL/Queries'

import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

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
  const { showToast } = useCustomToast()
  const activeUser = localStorage.getItem('email')
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const [getData] = useLazyQuery(
    signedUrlParams ? SignedSbomDownload : DownloadSBOM
  )

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
      showToast({
        description: `Internal error during SBOM download. Please try again in a few minutes.`,
        status: 'error'
      })
    }
  }

  const sbomCategory = ['Timestamp', 'Supplier Name', 'Unique ID', 'Author']

  const getBgColor = (score) => {
    if (score === 0) {
      return '#FED7D7'
    } else if (score === 100) {
      return '#C6F6D5'
    } else {
      return '#FEEBC8'
    }
  }

  const ScoreBoard = ({ data, loading }) => {
    return (
      <>
        {data?.scoreByCategory?.map((item, index) => (
          <Grid key={index} templateColumns='repeat(2, 1fr)' gap={6} mb={3}>
            <GridItem fontSize={'xs'} textTransform={'capitalize'}>
              {item?.category}
            </GridItem>
            <GridItem fontSize={'xs'} ml={'auto'}>
              <Button
                size='xs'
                width={'80px'}
                isLoading={loading}
                color={'#000'}
                bg={getBgColor(item?.score)}
                _hover={{ background: getBgColor(item?.score) }}
              >
                {sbomCategory?.includes(item?.category) ? (
                  <>
                    {item?.score === 100 ? (
                      <FaCheckCircle color='green' size={16} />
                    ) : (
                      <FaTimesCircle color='red' size={16} />
                    )}
                  </>
                ) : (
                  <span> {Math.round(item?.score)} %</span>
                )}
              </Button>
            </GridItem>
          </Grid>
        ))}
      </>
    )
  }

  const checklists = [
    {
      name: 'NTIA Minimum Elements',
      loading: ntiaLoading,
      score: ntiaData?.length > 0 ? Math.round(ntiaData[0].score) : 0,
      data: (
        <ScoreBoard
          loading={ntiaLoading}
          data={ntiaData?.length > 0 ? ntiaData[0] : []}
        />
      )
    },
    {
      name: 'FDA 510(K) Compliance',
      loading: fdaLoading,
      score: fdaData?.length > 0 ? Math.round(fdaData[0].score) : 0,
      data: (
        <ScoreBoard
          loading={fdaLoading}
          data={fdaData?.length > 0 ? fdaData[0] : []}
        />
      )
    },
    {
      name: 'BSI TR-03183',
      score: '',
      data: <Text>Coming soon...</Text>
    }
  ]

  return (
    <Modal
      size='lg'
      isOpen={isOpen}
      onClose={onClose}
      finalFocusRef={finalRef}
      initialFocusRef={initialRef}
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
            <FormControl display={!signedUrlParams ? 'block' : 'none'}>
              <FormLabel>Compliance Checks</FormLabel>
              <Accordion mt={3} allowMultiple>
                {checklists.map((item, index) => (
                  <AccordionItem key={index}>
                    <AccordionButton
                      _focus={{ outline: 'none' }}
                      _expanded={{
                        bg: 'blue.100',
                        color: '#111',
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
                          isLoading={item?.loading}
                          hidden={item?.score === ''}
                        >
                          {item?.score} %
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
