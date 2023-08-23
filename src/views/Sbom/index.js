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
  useDisclosure,
  Code
} from '@chakra-ui/react'
import React, { useState, useEffect, useRef, useContext } from 'react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMTable from './components/SBOMTable'
import SBOMStatistics from './components/SBOMStatistics'
import {
  FaBalanceScale,
  FaCubes,
  FaLayerGroup,
  FaFileDownload
} from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import { AddIcon } from '@chakra-ui/icons'
import ShareLynkDrawer from 'components/Drawer/ShareLynkDrawer'
import GlobalContext from 'context/GlobalContext'
import { useQuery } from '@apollo/client'
import { GetSBOM, GetProject } from 'graphQL/Queries'
import { timeSince } from 'utils'

function SBOM() {
  const { productVersionsData } = useContext(GlobalContext)

  const initialRef = useRef(null)
  const finalRef = useRef(null)
  const btnRef = useRef()

  const location = useLocation()
  const history = useHistory()

  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const customerView = location.pathname.startsWith('/sharelynk')

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
          uniqVersions.push({
            version: sbom.version,
            id: project.id
          })
        }
      })
    })

  // console.log(`uniqVersions`, uniqVersions)

  const allSboms = []

  data && data.project.sboms.map((sbom) => allSboms.push(sbom))

  // console.log(`SBOM`, allSboms)

  const validSBOMS =
    sbomData && sbomData.sbom.components.find((com) => com.primary === true)

  // const validSbom = validSBOMS

  // console.log(`validSBOMS`, validSBOMS)

  const invalidSBOMS =
    sbomData &&
    sbomData.sbom.components.filter((item) => item.primary === false)

  // console.log(`invalidSBOMS`, invalidSBOMS)

  const [selectedVersion, setSelectedVersion] = useState('')

  const refetchSBOM = async (id) => {
    try {
      await refetch({
        productId: productId,
        sbomId: id
      }).then(() => history.push(`/vendor/products?p=${productId}&sbom=${id}`))
    } catch (error) {
      console.log(`fetch error`, error)
    }
  }

  const handleSBOMChange = async (e) => {
    setSelectedVersion(e.target.value)
    refetchSBOM(e.target.value)
  }

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
                            {sbomData.sbom.project.name} :{' '}
                            {validSBOMS
                              ? validSBOMS.version
                              : invalidSBOMS &&
                                invalidSBOMS.length > 0 &&
                                invalidSBOMS[0].version}
                          </Flex>
                        </Heading>
                        {validSBOMS === undefined && (
                          <Code color={'red.400'} fontSize={'xs'}>
                            Primary component not exists. <br /> Please update
                            any component as primary before proceed
                          </Code>
                        )}
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
                          onChange={handleSBOMChange}
                          size='md'
                          width={'150px'}
                          color='gray.500'
                        >
                          {uniqVersions.length > 0 &&
                            uniqVersions.map((item, index) => (
                              <option
                                key={index}
                                value={item.id}
                                name={item.version}
                              >
                                {item.version}
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

      {isSBMOpen && sbomData && (
        <ShareLynkDrawer
          isOpen={isSBMOpen}
          onClose={setSBMClose}
          btnRef={btnRef}
          uniqProjects={uniqProjects}
          uniqVersions={uniqVersions}
          productName={sbomData.sbom.project.name}
          versionName={validSBOMS?.version}
        />
      )}

      {isOpen && (
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
      )}
    </>
  )
}

export default SBOM
