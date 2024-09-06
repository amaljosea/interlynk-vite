import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'
import { infoData } from 'variables/general'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'

import { EditIcon, InfoIcon } from '@chakra-ui/icons'
import {
  Flex,
  HStack,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'

import {
  authorDelete,
  sbomUpdate,
  supplierDelete,
  toolDelete
} from 'graphQL/Mutation'

import { FaScaleBalanced } from 'react-icons/fa6'

import ConfirmationModal from '../components/ConfirmationModal'

const InfoLabel = ({ title, onCheck }) => {
  return (
    <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
      <Text>{title}</Text>
      <Tooltip label={onCheck}>
        <InfoIcon color={'blue.500'} />
      </Tooltip>
    </Flex>
  )
}

const General = ({ data, loading, error }) => {
  const { isFreeTier } = useGlobalQueryContext()
  const location = useLocation()
  const params = useParams()
  const sbomId = params.sbomid

  const {
    id,
    spec,
    suppliers,
    licensesExp,
    licenses,
    authors,
    creationAt,
    tools
  } = data || ''

  const { sbomState, dispatch } = useGlobalState()
  const { expLicense } = sbomState
  const { sbomDispatch } = dispatch

  const updateComponent = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const editSboms = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const btnRef = useRef(null)
  const textColor = useColorModeValue('gray.700', 'white')
  const iconColor = useColorModeValue('blue.500', 'gray.100')
  const customerView = location?.pathname?.startsWith('/customer')
  const [selectedKey, setSelectedKey] = useState('')
  const [activeTool, setActiveTool] = useState(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()
  const {
    isOpen: isSBMOpen,
    onOpen: onSBMOpen,
    onClose: onSBMClose,
    onToggle: onSBMToggle
  } = useDisclosure()
  const {
    isOpen: isSupOpen,
    onOpen: onSupOpen,
    onClose: onSupClose
  } = useDisclosure()
  const {
    isOpen: isAutDelOpen,
    onOpen: onAutDelOpen,
    onClose: onAutDelClose
  } = useDisclosure()
  const {
    isOpen: isSupplierDelOpen,
    onOpen: onSupplierDelOpen,
    onClose: onSupplierDelClose
  } = useDisclosure()
  const {
    isOpen: isLicenseDelOpen,
    onOpen: onLicenseDelOpen,
    onClose: onLicenseDelClose
  } = useDisclosure()

  const [deleteSupplier] = useMutation(supplierDelete)
  const [deleteTool] = useMutation(toolDelete)
  const [deleteAuthor] = useMutation(authorDelete)
  const [updateSbom, { loading: sbomLoading }] = useMutation(sbomUpdate)

  const handleToolRemove = async (id) => {
    try {
      await deleteTool({ variables: { toolID: id, sbomID: sbomId } })
        .then((res) => res?.data)
        .finally(() => onDelClose())
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const handleAuthorRemove = async (id) => {
    try {
      await deleteAuthor({ variables: { authorId: id, sbomId } })
        .then((res) => res?.data)
        .finally(() => onAutDelClose())
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const handleClick = (ref) => {
    setSelectedKey(ref)
    onOpen()
  }

  const handleSupRemove = async (id) => {
    await deleteSupplier({ variables: { id: id } })
      .then((res) => res.data)
      .finally(() => onSupplierDelClose())
  }

  // const onRemoveLicense = async () => console.log('License');

  const onLicenseOpen = () => {
    sbomDispatch({ type: 'SET_LICENSES', payload: licensesExp })
    onSBMOpen()
  }

  const onUpdateLicense = async () => {
    await updateSbom({
      variables: {
        id: id,
        spec: spec,
        licenses: { licensesExp: expLicense || '' }
      }
    })
      .then((res) => res.data && sbomDispatch({ type: 'CLEAR_LICENSES' }))
      .finally(() => onSBMClose())
  }

  // ADD KEYBOARD SHORTCUT FOR TOGGLE SBOM DRAWER
  const handleSBMDown = useCallback(
    (event) => {
      if (event.altKey && event.key === '2') {
        onSBMToggle()
      }
    },
    [onSBMToggle]
  )

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  // KEYBOARD EVENT LISTNER FOR SBOM DRAWER
  useEffect(() => {
    window.addEventListener('keydown', handleSBMDown)
    return () => {
      window.removeEventListener('keydown', handleSBMDown)
    }
  }, [handleSBMDown])

  if (loading) {
    return (
      <Flex mt={4} width={'100%'} flexDir={'column'} gap={4}>
        {[1, 2].map((_, index) => (
          <Skeleton key={index} width={'100%'} height='20px' />
        ))}
      </Flex>
    )
  }

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <CardBody>
        <Table
          __css={{ tableLayout: 'fixed', width: 'full' }}
          variant='simple'
          color={textColor}
          size='sm'
        >
          {/* TABLE HEAD */}
          <Thead>
            <Tr>
              {[1, 2, 3].map((_, index) => (
                <Th key={index}></Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {/* CREATED AT */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <InfoLabel
                  title={`Created At`}
                  onCheck={onCheck('Created At')}
                />
              </Td>
              <Td pl={0}>
                <Text my={2}>
                  {creationAt ? getFullDateAndTime(creationAt) : ''}
                </Text>
              </Td>
              <Td pl={0}></Td>
            </Tr>
            {/* CREATION TOOLS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <InfoLabel
                  title={`Creation Tool`}
                  onCheck={onCheck('Creation Tool')}
                />
              </Td>
              <Td pl={0}>
                <Flex
                  my={2}
                  flexDirection={'row'}
                  alignItems={'flex-start'}
                  flexWrap={'wrap'}
                  gap={2.5}
                >
                  {tools &&
                    tools.map((item, index) => (
                      <Tag
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='teal'
                        width={'fit-content'}
                      >
                        <TagLabel>
                          {item.name} - {item.version}
                        </TagLabel>
                        {updateComponent && (
                          <TagCloseButton
                            onClick={() => {
                              setActiveTool(item)
                              onDelOpen()
                            }}
                          />
                        )}
                      </Tag>
                    ))}
                </Flex>
              </Td>
              <Td pl={0}>
                <IconButton
                  size='sm'
                  isDisabled={customerView || !editSboms}
                  icon={<EditIcon color={iconColor} />}
                  onClick={() => handleClick('tools')}
                />
              </Td>
            </Tr>
            {/* AUTHORS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <InfoLabel title={`Authors`} onCheck={onCheck('Authors')} />
              </Td>
              <Td pl={0}>
                <Stack spacing={2} direction={'column'} my={2}>
                  {authors &&
                    authors.length > 0 &&
                    authors.map((item, index) => (
                      <Tag
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='blue'
                        width={'fit-content'}
                      >
                        <TagLabel>
                          {item.name} - {item.email}
                        </TagLabel>
                        {updateComponent && (
                          <TagCloseButton
                            onClick={() => {
                              setActiveTool(item)
                              onAutDelOpen()
                            }}
                          />
                        )}
                      </Tag>
                    ))}
                </Stack>
              </Td>
              <Td pl={0}>
                <IconButton
                  size='sm'
                  isDisabled={customerView || !editSboms}
                  icon={<EditIcon color={iconColor} />}
                  onClick={() => handleClick('author')}
                />
              </Td>
            </Tr>
            {/* SUPPLIERS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                <InfoLabel title={`Supplier`} onCheck={onCheck('Supplier')} />
              </Td>
              <Td pl={0}>
                <HStack spacing={4}>
                  {suppliers?.length > 0 &&
                    suppliers.map((item, index) => (
                      <Tag
                        my={2}
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='orange'
                      >
                        <TagLabel>
                          {item?.contactName || ''}
                          {item?.contactEmail && ` (${item.contactEmail})`}
                          {item.url ? (
                            <Link
                              href={
                                item?.url?.startsWith('http')
                                  ? item.url
                                  : `http://${item.url}`
                              }
                              isExternal
                            >
                              {' '}
                              {item?.name || ''}
                            </Link>
                          ) : (
                            ` ${item?.name || ''}`
                          )}
                        </TagLabel>
                        {updateComponent && (
                          <TagCloseButton
                            onClick={() => {
                              setActiveTool(item)
                              onSupplierDelOpen()
                            }}
                          />
                        )}
                      </Tag>
                    ))}
                </HStack>
              </Td>
              <Td pl={0}>
                <IconButton
                  size='sm'
                  isDisabled={customerView || !editSboms}
                  icon={<EditIcon color={iconColor} />}
                  onClick={onSupOpen}
                />
              </Td>
            </Tr>
            {/* LICENSES */}
            <Tr>
              <Td pl={0} fontWeight={'medium'}>
                Data License
              </Td>
              <Td pl={0}>
                <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
                  {/* SPDX */}
                  {licenses?.length > 0 &&
                    licenses?.map((item, index) => (
                      <Tag
                        my={2}
                        size={'md'}
                        key={index}
                        variant='subtle'
                        colorScheme='green'
                        width={'fit-content'}
                      >
                        <TagLabel>{item}</TagLabel>
                      </Tag>
                    ))}
                  {/* EXPRESSION */}
                  {licensesExp && licensesExp !== '' && (
                    <Tag
                      my={2}
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{licensesExp}</TagLabel>
                      {updateComponent && (
                        <TagCloseButton onClick={onLicenseDelOpen} />
                      )}
                    </Tag>
                  )}
                </Flex>
              </Td>
              <Td pl={0}>
                <IconButton
                  size='sm'
                  isDisabled={customerView || !editSboms}
                  icon={<EditIcon color={iconColor} />}
                  onClick={onLicenseOpen}
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </CardBody>
      {/* GENERAL DRAWER */}
      {data && isOpen && (
        <GeneralDataDrawer
          isOpen={isOpen}
          onClose={onClose}
          btnRef={btnRef}
          data={data}
          selectedKey={selectedKey}
          checkId={null}
          isFreeTier={isFreeTier}
        />
      )}
      {/* SBOM LICENSE MODAL */}
      {isSBMOpen && (
        <LynkModal
          isOpen={isSBMOpen}
          onClose={onSBMClose}
          disabled={sbomLoading}
          Icon={FaScaleBalanced}
          onSubmit={onUpdateLicense}
          buttonText={licensesExp?.length > 0 ? 'Update' : 'Save'}
          title={`${licensesExp?.length > 0 ? 'Update' : 'Add'} License`}
        >
          <LicenseField
            sbomView={true}
            isDisabled={customerView}
            license={licensesExp}
          />
        </LynkModal>
      )}
      {/* SUPPLIER MODAL */}
      {isSupOpen && (
        <PriSupplierModal
          isOpen={isSupOpen}
          onClose={onSupClose}
          suppliers={suppliers}
          activeRow={null}
          isFreeTier={isFreeTier}
        />
      )}
      {/* TOOL DELETE MODAL */}
      {isDelOpen && activeTool && (
        <ConfirmationModal
          isOpen={isDelOpen}
          onClose={onDelClose}
          onConfirm={() => handleToolRemove(activeTool.id)}
          name={`${activeTool.name}-${activeTool.version} `}
          title={'Remove Tool'}
          description={`You are about to delete the creator Tool : ${activeTool.name}-${activeTool.version} from this version.`}
        />
      )}
      {/* AUTHOR DELETE MODAL */}
      {isAutDelOpen && activeTool && (
        <ConfirmationModal
          isOpen={isAutDelOpen}
          onClose={onAutDelClose}
          onConfirm={() => handleAuthorRemove(activeTool.id)}
          name={`${activeTool.name}-${activeTool.email} `}
          title={'Remove Author'}
          description={`You are about to delete the Author : ${activeTool.name}-${activeTool.email} from this version.`}
        />
      )}
      {/* SUPPLIER DELETE MODAL */}
      {isSupplierDelOpen && activeTool && (
        <ConfirmationModal
          isOpen={isSupplierDelOpen}
          onClose={onSupplierDelClose}
          onConfirm={() => handleSupRemove(activeTool.id)}
          name={activeTool.name}
          title={'Remove Supplier'}
          description={`You are about to delete the Supplier : ${activeTool.name} from this version.`}
        />
      )}
      {/* LICENSE DELETE MODAL */}
      {isLicenseDelOpen && (
        <ConfirmationModal
          isOpen={isLicenseDelOpen}
          onClose={onLicenseDelClose}
          onConfirm={onUpdateLicense}
          name={licensesExp}
          title={'Remove License'}
          description={`You are about to delete the License : ${licensesExp} from this version.`}
        />
      )}
    </>
  )
}

export default General
