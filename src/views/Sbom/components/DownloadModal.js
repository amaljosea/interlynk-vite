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
  Button
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
  sbomId
}) => {
  const location = useLocation()
  const customerView = location.pathname.startsWith('/customer')

  const [getData] = useLazyQuery(DownloadSBOM)

  const [spec, setSpec] = useState('cyclonedx')
  const [format, setFormat] = useState('json')
  const [includeVulns, setIncludeVulns] = useState(false)
  const [includeVex, setIncludeVex] = useState(false)

  const downloadJsonFile = (jsonData) => {
    if (jsonData) {
      const jsonDataStr = JSON.stringify(jsonData, null, 2)
      const blob = new Blob([jsonDataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'data.json'
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
      a.download = 'data.xml'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDownload = async () => {
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
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>SBOM Download</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormLabel align='center'>SBOM Specification</FormLabel>
          <Stack direction='column' gap='20px'>
            <RadioGroup value={spec} onChange={(value) => setSpec(value)}>
              <Stack spacing={4} direction='row'>
                <Radio value='cyclonedx'>CycloneDX</Radio>
                <Radio value='spdx'>SPDX</Radio>
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
                <Radio value='xml'>XML</Radio>
              </Stack>
            </RadioGroup>

            <Stack direction='column' gap='5px'>
              <Checkbox
                value={includeVulns}
                onChange={() => setIncludeVulns(!includeVulns)}
              >
                Include Vulnerabilities
              </Checkbox>
              <Checkbox
                value={includeVex}
                onChange={() => setIncludeVex(!includeVex)}
              >
                Include Vulnerability Status (VEX)
              </Checkbox>
            </Stack>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme='blue'
            mr={3}
            onClick={customerView ? onDownload : handleDownload}
          >
            Download
          </Button>

          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DownloadModal
