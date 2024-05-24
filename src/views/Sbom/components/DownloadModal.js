import { useLazyQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Button,
  Checkbox,
  Divider,
  Flex,
  FormLabel,
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

import { DownloadSBOM, SignedSbomDownload } from 'graphQL/Queries'

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
  const [getData] = useLazyQuery(
    signedUrlParams ? SignedSbomDownload : DownloadSBOM
  )

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

  return (
    <Modal
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
          <FormLabel align='center'>Specification</FormLabel>
          <Stack direction='column' gap='20px' mt={2}>
            <RadioGroup value={spec} onChange={(value) => setSpec(value)}>
              <Stack spacing={4} direction='row'>
                {(activeUser === 'sp@interlynk.io' ||
                  activeUser === 'surendra.pathak@interlynk') && (
                  <Radio value='spdx'>SPDX</Radio>
                )}
                <Radio value='cyclonedx'>CycloneDX</Radio>
              </Stack>
            </RadioGroup>
          </Stack>
          <FormLabel align='center' pt='30px'>
            File Format
          </FormLabel>
          <Stack direction='column' gap='20px' mt={2} mb={4}>
            <RadioGroup value={format} onChange={(value) => setFormat(value)}>
              <Stack spacing={4} direction='row'>
                <Radio value='json'>JSON</Radio>
                {/* <Radio value='xml' disabled>XML</Radio> */}
              </Stack>
            </RadioGroup>
            <Stack direction='column' gap='5px'>
              <Checkbox
                isChecked={includeVulns}
                onChange={() => setIncludeVulns(!includeVulns)}
                isDisabled={spec === 'spdx'}
              >
                Include Vulnerabilities
              </Checkbox>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={3} py={3} mt={2}>
            <Flex
              gap={2}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Text fontSize={'sm'} width='100px'>
                File Name
              </Text>
              <Tag
                colorScheme='blue'
                textAlign={'right'}
              >{`${productName}-${version}.${type}.xml`}</Tag>
            </Flex>
          </Stack>
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
