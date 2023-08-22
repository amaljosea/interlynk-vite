// Chakra imports
import {
  Flex,
  Stack,
  Heading,
  Spacer,
  Icon,
  Button,
  Grid,
  GridItem,
  Text,
  Tag,
  TagLabel,
  Select,
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
  IconButton,
  useDisclosure
} from '@chakra-ui/react'
import React, { useState, useEffect, useRef, useContext } from 'react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'

import SBOMTable from './components/SBOMTable'
import SBOMStatistics from './components/SBOMStatistics'
import semver from 'semver'

import { sbom } from 'variables/general'
import {
  FaBalanceScale,
  FaCubes,
  FaLayerGroup,
  FaFileDownload
} from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { AddIcon } from '@chakra-ui/icons'
import ShareLynkDrawer from 'components/Drawer/ShareLynkDrawer'
import GlobalContext from 'context/GlobalContext'
import { useQuery } from '@apollo/client'
import { GetSBOM } from 'graphQL/Queries'
import { timeSince } from 'utils'
import { GetProject } from 'graphQL/Queries'

function SBOM() {
  const { productVersionsData } = useContext(GlobalContext)

  const initialRef = useRef(null)
  const finalRef = useRef(null)
  const btnRef = useRef()

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const customerView = location.pathname.startsWith('/sharelynk')

  const sbomqsVersions = [
    {
      id: 1,
      name: 'v0.0.1'
    },
    {
      id: 2,
      name: 'v0.0.2'
    },
    {
      id: 3,
      name: 'v0.0.3'
    }
  ]

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isSBMOpen,
    onOpen: setSBMOpen,
    onClose: setSBMClose
  } = useDisclosure()

  const { data: sbomData, refetch } = useQuery(GetSBOM, {
    variables: {
      projectId: productId,
      sbomId: sbomId
    }
  })

  const { data } = useQuery(GetProject, {
    variables: {
      id: productId
    }
  })

  useEffect(() => {
    if (sbomData) {
      setSelectedVersion(
        sbomData.sbom.components.find((item) => item.primary === true).version
      )
      console.log(`SBOM Data`, sbomData)
    }
  }, [sbomData])

  useEffect(() => {
    if (data) {
      console.log(`data`, data)
    }
  }, [data])

  const uniqProjects = []
  const uniqVersions = []

  productVersionsData.map((project) => {
    if (uniqProjects.indexOf(project.name) === -1) {
      uniqProjects.push(project.name)
    }
  })

  data &&
    data.project.sboms.map((project) => {
      project.components.map((sbom) => {
        if (sbom.primary === true) {
          uniqVersions.push(sbom.version)
        }
      })
    })

  const [selectedVersion, setSelectedVersion] = useState('')

  const [imageInfo, setImageInfo] = useState([])

  useEffect(() => {
    if (sbomqsVersions) {
      const clonedImageVersions = sbomqsVersions.map((info) => ({
        ...info
      }))

      clonedImageVersions.sort((a, b) => {
        // If either a or b is 'latest', handle the special case.
        if (a.name === 'latest') {
          return -1
        } else if (b.name === 'latest') {
          return 1
        }
        var coerced_a = semver.valid(semver.coerce(a.name))
        var coerced_b = semver.valid(semver.coerce(b.name))
        if (coerced_a === null || coerced_b === null) {
          return b.name.localeCompare(a.name)
        }
        return semver.compare(coerced_b, coerced_a)
      })

      // console.log(clonedImageVersions)

      setImageInfo(clonedImageVersions)
    }
  }, [])

  return (
    <>
      <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
        <Card mb='6'>
          <CardBody>
            <CardBody>
              <Grid width={'100%'} templateColumns='repeat(5, 1fr)'>
                <GridItem colSpan={2}>
                  {sbomData ? (
                    <Flex
                      direction={'row'}
                      alignItems={'center'}
                      gap={5}
                      width={'100%'}
                    >
                      <Icon
                        as={FaCubes}
                        h={'64px'}
                        w={'64px'}
                        color='blue.300'
                      />
                      <Flex direction={'column'} gap={1}>
                        <Heading as='h3' size='md' noOfLines={1}>
                          <Flex
                            alignItems={'center'}
                            flexDirection={'row'}
                            gap={3}
                          >
                            {sbomData.sbom.project.name}:
                            {
                              sbomData.sbom.components.find(
                                (item) => item.primary === true
                              ).version
                            }
                          </Flex>
                        </Heading>
                        <Text fontSize='xs' cursor={'pointer'}>
                          Last Pushed: {timeSince(sbomData.sbom.creationAt)}
                        </Text>
                        <Flex>
                          <Tag size={'sm'} variant='outline' colorScheme='blue'>
                            <TagLabel>Created</TagLabel>
                          </Tag>
                        </Flex>
                      </Flex>
                    </Flex>
                  ) : (
                    <Text>Loading...</Text>
                  )}
                </GridItem>
                {sbomData && (
                  <GridItem colSpan={3}>
                    <Flex
                      direction={'row'}
                      gap={4}
                      justifyContent='flex-end'
                      ml={'auto'}
                    >
                      <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                        <FaLayerGroup size={18} color='darkgray' />
                        <Select
                          id='version'
                          value={selectedVersion}
                          onChange={(e) => setSelectedVersion(e.target.value)}
                          size='md'
                          width={'150px'}
                          color='gray.500'
                        >
                          {uniqVersions.length > 0 &&
                            uniqVersions.map((item, index) => (
                              <option key={index} value={item}>
                                {item}
                              </option>
                            ))}
                        </Select>
                      </Flex>

                      {!customerView && (
                        <Button
                          width={'120px'}
                          colorScheme='blue'
                          fontSize={'sm'}
                          leftIcon={<AddIcon />}
                          onClick={setSBMOpen}
                        >
                          Share Lynk
                        </Button>
                      )}

                      {!customerView && (
                        <IconButton
                          aria-label='Download SBOM'
                          icon={<FaFileDownload />}
                          onClick={onOpen}
                          colorScheme='blue'
                        />
                      )}
                    </Flex>
                  </GridItem>
                )}
              </Grid>
            </CardBody>
          </CardBody>
        </Card>
        <Flex direction='row' gap='2'>
          <SBOMStatistics
            icon={<Icon h={'24px'} w={'24px'} color='white' as={FaCubes} />}
            title={'Components'}
            description={'Components included in SBOM'}
            amount={31}
          />
          <Spacer />
          <SBOMStatistics
            icon={
              <Icon h={'24px'} w={'24px'} color='white' as={FaBalanceScale} />
            }
            title={'Licenses'}
            description={'Unique licenses included in SBOM'}
            amount={19}
          />
        </Flex>
        {sbomData && (
          <SBOMTable
            title={'SBOM'}
            captions={[
              'Component',
              'Version',
              'PURL',
              'CPES',
              'Licenses',
              'Updated At',
              ''
            ]}
            data={sbomData.sbom}
            refetch={refetch}
          />
        )}
      </Flex>

      <ShareLynkDrawer
        isOpen={isSBMOpen}
        onClose={setSBMClose}
        btnRef={btnRef}
        uniqProjects={uniqProjects}
        uniqVersions={uniqVersions}
      />

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
              <RadioGroup defaultValue='1'>
                <Stack spacing={4} direction='row'>
                  <Radio value='1'>CycloneDX</Radio>
                  <Radio value='2'>SPDX</Radio>
                </Stack>
              </RadioGroup>
            </Stack>

            <FormLabel align='center' pt='30px'>
              File Format
            </FormLabel>
            <Stack direction='column' gap='20px'>
              <RadioGroup defaultValue='1'>
                <Stack spacing={4} direction='row'>
                  <Radio value='1'>JSON</Radio>
                  <Radio value='2'>XML</Radio>
                </Stack>
              </RadioGroup>

              <Stack direction='column' gap='5px'>
                <Checkbox defaultChecked>Include Vulnerabilities</Checkbox>
                <Checkbox defaultChecked>
                  Include Vulnerability Status (VEX)
                </Checkbox>
              </Stack>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3}>
              Download
            </Button>

            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SBOM
