import { useMutation } from '@apollo/client'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Stack,
  Checkbox,
  Flex,
  Input,
  Progress,
  Textarea,
  calc
} from '@chakra-ui/react'
import { UpdateComponent } from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const CpeModal = ({
  id,
  data,
  isOpen,
  onClose,
  onCreateCpe,
  onUpdateCpe,
  selectedCpe,
  cpeValue,
  checkId,
  refetch,
  setPageIndex
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')

  const [vendor, setVendor] = useState('')
  const [product, setProduct] = useState('')
  const [type, setType] = useState('')
  const [version, setVersion] = useState('')
  const [hardware, setHardware] = useState('')
  const [vendorProgressValue, setVendorProgressValue] = useState(0)
  const [prodProgressValue, setProdProgressValue] = useState(0)
  const [verProgressValue, setVerProgressValue] = useState(0)

  const [updatedString, setUpdatedString] = useState(cpeValue)

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })
  const [updateComponent] = useMutation(UpdateComponent)

  useEffect(() => {
    if (data) {
      setVendor(data.vendor)
      setProduct(data.product)
      setVersion(data.version)
      setHardware(data.targetHardware)
      setVendorProgressValue(calculateProgress(data.vendor, '', ''))
      setProdProgressValue(calculateProgress(data.vendor, data.product, ''))
      setVerProgressValue(
        calculateProgress(data.vendor, data.product, data.version)
      )
    }
  }, [data])

  const handleSave = () => {
    if (selectedCpe) {
      onUpdateCpe(updatedString, selectedCpe.id)
    } else {
      onCreateCpe(updatedString)
    }
    onClose()
  }

  const handleComUpdate = async () => {
    try {
      await updateComponent({
        variables: {
          id: id,
          sbomId: sbomId,
          cpes: [updatedString]
        }
      })
        .then(() => {
          if (checkId) {
            setPageIndex(1)
            healthRecheck({
              variables: {
                checkId: checkId,
                compId: id,
                sbomId: sbomId
              }
            })
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  const calculateProgress = (vendor, prod, version) => {
    const vendorMap = {}
    vendorMap[['cisco', '', ''].join(',')] = 100
    vendorMap[['microsoft', '', ''].join(',')] = 90
    vendorMap[['hp', '', ''].join(',')] = 100
    vendorMap[['ibm', '', ''].join(',')] = 100
    vendorMap[['intel', '', ''].join(',')] = 100
    vendorMap[['jenkins', '', ''].join(',')] = 100
    vendorMap[['apache', '', ''].join(',')] = 100
    vendorMap[['google', '', ''].join(',')] = 100
    vendorMap[['microsoft', '', ''].join(',')] = 100
    vendorMap[['vim', '', ''].join(',')] = 100
    vendorMap[['redhat', '', ''].join(',')] = 100
    vendorMap[['oracle', '', ''].join(',')] = 100
    vendorMap[['debian', '', ''].join(',')] = 100
    vendorMap[['kernel', '', ''].join(',')] = 80
    vendorMap[['sony', '', ''].join(',')] = 80
    vendorMap[['nutanix', '', ''].join(',')] = 10
    vendorMap[['simpleproxy', '', ''].join(',')] = 10
    vendorMap[['microware', '', ''].join(',')] = 50
    vendorMap[['microsftv', '', ''].join(',')] = 10
    vendorMap[['orange', '', ''].join(',')] = 20
    vendorMap[['orangelab', '', ''].join(',')] = 10

    vendorMap[['cisco', '', ''].join(',')] = 100
    vendorMap[['hp', '', ''].join(',')] = 100
    vendorMap[['ibm', '', ''].join(',')] = 100
    vendorMap[['intel', '', ''].join(',')] = 100
    vendorMap[['jenkins', '', ''].join(',')] = 100
    vendorMap[['apache', '', ''].join(',')] = 100
    vendorMap[['google', '', ''].join(',')] = 100

    vendorMap[['', 'windows_xp', ''].join(',')] = 100
    vendorMap[['', 'apt', ''].join(',')] = 100
    vendorMap[['microsoft', 'windows_xp', ''].join(',')] = 100
    vendorMap[['microsoft', 'windows_xp', 'sp2'].join(',')] = 10
    vendorMap[['microsoft', 'windows_xp', 'sp3'].join(',')] = 10
    vendorMap[['microsoft', 'windows_xp', '1.0'].join(',')] = 100
    vendorMap[['microsoft', 'windows_7', ''].join(',')] = 100
    vendorMap[['microsoft', 'office', ''].join(',')] = 100

    vendorMap[['microsoft', 'internet_explorer', ''].join(',')] = 100

    vendorMap[['microsoft', 'windows_7', ''].join(',')] = 100
    vendorMap[['', 'office', ''].join(',')] = 100
    vendorMap[['', 'internet_explorer', ''].join(',')] = 100

    vendorMap[['debian', '', ''].join(',')] = 100
    vendorMap[['debian', 'cron', ''].join(',')] = 100
    vendorMap[['', 'cron', ''].join(',')] = 100
    vendorMap[['', 'bash', ''].join(',')] = 100
    vendorMap[['', 'base_files', ''].join(',')] = 100
    vendorMap[['debian', 'bash', ''].join(',')] = 100
    vendorMap[['debian', 'bsdutils', ''].join(',')] = 100

    vendorMap[['vim', '', ''].join(',')] = 100
    vendorMap[['redhat', '', ''].join(',')] = 100
    vendorMap[['oracle', '', ''].join(',')] = 100
    vendorMap[['debian', '', ''].join(',')] = 100
    vendorMap[['kernel', '', ''].join(',')] = 80
    vendorMap[['sony', '', ''].join(',')] = 80
    vendorMap[['nutanix', '', ''].join(',')] = 10
    vendorMap[['simpleproxy', '', ''].join(',')] = 10
    vendorMap[['microware', '', ''].join(',')] = 50
    vendorMap[['microsftv', '', ''].join(',')] = 10
    vendorMap[['orange', '', ''].join(',')] = 20
    vendorMap[['orangelab', '', ''].join(',')] = 10

    vendorMap[['vim', '', ''].join(',')] = 100
    vendorMap[['chrome', '', ''].join(',')] = 100
    vendorMap[['ios', '', ''].join(',')] = 100
    vendorMap[['linux_kernel', '', ''].join(',')] = 100
    vendorMap[['node.js', '', ''].join(',')] = 100
    vendorMap[['php', '', ''].join(',')] = 100

    vendorMap[['ruby', '', ''].join(',')] = 80
    vendorMap[['http', '', ''].join(',')] = 20
    vendorMap[['log4js', '', ''].join(',')] = 20
    vendorMap[['pods', '', ''].join(',')] = 10

    vendorMap[['NA', '', ''].join(',')] = 100
    vendorMap[['ANY', '', ''].join(',')] = 100
    vendorMap[['1.0.0', '', ''].join(',')] = 100
    vendorMap[['7.1.2', '', ''].join(',')] = 10

    var newValue =
      vendorMap[
        [vendor.toLowerCase(), prod.toLowerCase(), version.toLowerCase()].join(
          ','
        )
      ]
    // console.log('Vendor:' + vendor, 'Prod:' + prod, 'Version:' + version, newValue)
    if (isNaN(newValue)) {
      newValue = 0
    }
    return newValue
  }

  const getProgressColor = (value) => {
    if (value >= 90) {
      return 'green' // Change color to green if progress is 90% or higher
    } else if (value >= 50) {
      return 'yellow' // Change color to yellow if progress is 50% or higher
    } else {
      return 'red' // Change color to red for lower progress values
    }
  }

  // setCpeData({
  //  vendor: components[3],
  //  product: components[4],
  //  version: components[5],
  //  targetHardware: '*'
  //})

  const handleVendorChange = (e) => {
    setVendor(e.target.value)
    const cpeParts = updatedString.split(':')
    cpeParts[3] = e.target.value
    const cpeString = cpeParts.join(':')
    // console.log('CPE String: ' + cpeString)
    setUpdatedString(cpeString)

    const vendorProgressValue = calculateProgress(cpeParts[3], '', '')
    setVendorProgressValue(vendorProgressValue)

    if (cpeParts[4] === '') {
      setProdProgressValue(0)
    } else {
      const prodProgressValue = calculateProgress(cpeParts[3], cpeParts[4], '')
      setProdProgressValue(prodProgressValue)
    }

    const verProgressValue = calculateProgress(
      cpeParts[3],
      cpeParts[4],
      cpeParts[5]
    )
    setVerProgressValue(verProgressValue)
  }

  const handleTypeChange = (e) => {
    setType(e.target.value)
    const cpeParts = updatedString.split(':')
    cpeParts[2] = e.target.value
    const cpeString = cpeParts.join(':')
    // console.log('CPE String: ' + cpeString)
    setUpdatedString(cpeString)
  }

  const handleProductChange = (e) => {
    setProduct(e.target.value)
    const cpeParts = updatedString.split(':')
    cpeParts[4] = e.target.value
    const cpeString = cpeParts.join(':')
    // console.log('CPE String: ' + cpeString)
    setUpdatedString(cpeString)

    if (e.target.value === '') {
      setProdProgressValue(0)
    } else {
      const prodProgressValue = calculateProgress(
        cpeParts[3],
        e.target.value,
        ''
      )
      setProdProgressValue(prodProgressValue)
    }
  }

  const handleVersionChange = (e) => {
    setVersion(e.target.value)
    const cpeParts = updatedString.split(':')
    cpeParts[5] = e.target.value
    const cpeString = cpeParts.join(':')
    // console.log('CPE String: ' + cpeString)
    setUpdatedString(cpeString)

    if (e.target.value === '') {
      setVerProgressValue(0)
    } else {
      const verProgressValue = calculateProgress(
        cpeParts[3],
        cpeParts[4],
        e.target.value
      )
      setVerProgressValue(verProgressValue)
    }
  }

  const handleHardwareChange = (e) => {
    setHardware(e.target.value)
    const cpeString = cpeValue.replace(data.targetHardware, e.target.value)
    // console.log('CPE String: ' + cpeString)
    setUpdatedString(cpeString)
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>CPE Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
              <FormControl>
                <FormLabel>CPE String</FormLabel>
                <Textarea
                  type='text'
                  variant='outline'
                  mt={1.5}
                  value={updatedString}
                  fontSize='16px'
                  fontStyle={'bold'}
                  color='black'
                  isInvalid
                  errorBorderColor='blue.600'
                  onChange={handleVersionChange}
                  disabled
                />
              </FormControl>
              {/* Vendor */}
              <FormControl>
                Vendor
                <Stack direction='column' spacing={1}>
                  <Input
                    type='text'
                    mt={1.5}
                    value={vendor}
                    size='md'
                    onChange={handleVendorChange}
                  />
                  <Progress
                    value={vendorProgressValue}
                    colorScheme={getProgressColor(vendorProgressValue)}
                  />
                </Stack>
              </FormControl>
              {/* Type */}
              <FormControl>
                <FormLabel htmlFor='type'>Type</FormLabel>
                <Select
                  size='md'
                  id='type'
                  name='type'
                  value={type}
                  onChange={handleTypeChange}
                >
                  <option value='a'>Application</option>
                  <option value='o'>Operating System</option>
                  <option value='h'>Hardware</option>
                </Select>
              </FormControl>
              {/* Product */}
              <FormControl>
                Product
                <Stack direction='column' spacing={1}>
                  <Input
                    type='text'
                    mt={1.5}
                    value={product}
                    size='md'
                    onChange={handleProductChange}
                  />
                  <Progress
                    value={prodProgressValue}
                    colorScheme={getProgressColor(prodProgressValue)}
                  />
                </Stack>
              </FormControl>
              {/* Version */}
              <FormControl>
                Version
                <Stack direction='column' spacing={1}>
                  <Input
                    type='text'
                    mt={1.5}
                    value={version}
                    size='md'
                    onChange={handleVersionChange}
                  />
                  <Progress
                    value={verProgressValue}
                    colorScheme={getProgressColor(verProgressValue)}
                  />
                </Stack>
              </FormControl>
              {/* Hardware */}
              <FormControl>
                <FormLabel htmlFor='targetHardware'>Target Hardware</FormLabel>
                <Stack direction='column' spacing={1}>
                  <Select
                    size='md'
                    id='targetHardware'
                    name='targetHardware'
                    value={hardware}
                    onChange={handleHardwareChange}
                  >
                    <option value=''>-- Select --</option>
                    <option value='x64'>x64</option>
                    <option value='x86'>x86</option>
                    <option value='x32'>x32</option>
                    <option value='arm64'>arm64</option>
                    <option value='amd64'>amd64</option>
                    <option value='itanium'>itanium</option>
                    <option value='arm'>arm</option>
                    <option value='rj45'>rj45</option>
                    <option value='iphone'>iphone</option>
                    <option value='android'>android</option>
                    <option value='*'>*</option>
                  </Select>
                </Stack>
              </FormControl>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button fontSize={'sm'} colorScheme='gray' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              fontSize={'sm'}
              variant='solid'
              colorScheme={'blue'}
              onClick={checkId ? handleComUpdate : handleSave}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CpeModal
