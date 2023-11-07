import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  FormLabel,
  ModalBody,
  Checkbox,
  RadioGroup,
  Radio,
  ModalFooter,
  Stack,
  Button,
  useToast,
  Box,
  Flex,
  Spinner
} from '@chakra-ui/react'
import { useLazyQuery } from '@apollo/client'
import { DownloadSBOM } from 'graphQL/Queries'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

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
  const location = useLocation()
  const customerView = location.pathname.startsWith('/customer')

  const [getData] = useLazyQuery(DownloadSBOM)

  const [spec, setSpec] = useState('cyclonedx')
  const [format, setFormat] = useState('json')
  const [includeVulns, setIncludeVulns] = useState(false)
  const [includeVex, setIncludeVex] = useState(false)

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

  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      await getData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          spec,
          format,
          includeVulns,
          includeVex,
          original: true
        }
      })
        .then((res) => {
          console.log(`res`, res)
          if (res.called) {
            setIsLoading(false)
            const decodedData = window.atob(res.data.sbom.download)
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
        description: `${error}`,
        duration: 3000,
        position: 'top',
        status: 'error'
      })
    }
  }

  const onDownload = async () => {
    try {
      await getData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          spec,
          format,
          includeVulns,
          includeVex,
          original: true
        }
      })
        .then((res) => {
          console.log(`res`, res)
          const decodedData = window.atob(res.data.sbom.download)
          const parsedJson = JSON.parse(decodedData)
          if (format === 'json') {
            downloadJsonFile(parsedJson)
          } else {
            downloadXmlFile(decodedData)
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.log(`Error`, error)
    }
  }

  return (
    <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Download SBOM</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormLabel align='center'>Specification</FormLabel>
          <Stack direction='column' gap='20px'>
            <RadioGroup value={spec} onChange={(value) => setSpec(value)}>
              <Stack spacing={4} direction='row'>
                <Radio value='cyclonedx'>CycloneDX</Radio>
                {/* <Radio value='spdx' disabled>SPDX</Radio> */}
              </Stack>
            </RadioGroup>
          </Stack>

          <FormLabel align='center' pt='30px'>
            File Format
          </FormLabel>
          <Stack direction='column' gap='20px'>
            <RadioGroup value={format} onChange={(value) => setFormat(value)}>
              <Stack spacing={4} direction='row'>
                <Radio value='json'>JSON</Radio>
                {/* <Radio value='xml' disabled>XML</Radio> */}
              </Stack>
            </RadioGroup>

            <Stack direction='column' gap='5px'>
              <Box
                bg='blue.600'
                w='100%'
                p={2}
                color='white'
                fontWeight='medium'
                fontSize='16px'
                align='center'
                borderRadius='lg'
                boxShadow='md'
              >
                Download Options coming soon...
              </Box>
              <Checkbox
                isChecked={includeVulns}
                onChange={() => setIncludeVulns(!includeVulns)}
                disabled
              >
                Include Vulnerabilities
              </Checkbox>
              <Checkbox
                isChecked={includeVex}
                onChange={() => setIncludeVex(!includeVex)}
                disabled
              >
                Include Vulnerability Status (VEX)
              </Checkbox>
            </Stack>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Flex
            width={'100%'}
            alignItems={'center'}
            justifyContent={'space-between'}
            gap={4}
          >
            <Stack>{isLoading && <Spinner color='blue.500' />}</Stack>
            <Stack direction='row' alignItems='center' gap={1}>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>

              <Button
                colorScheme='blue'
                mr={3}
                onClick={customerView ? onDownload : handleDownload}
              >
                Download
              </Button>
            </Stack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DownloadModal
