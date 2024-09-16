import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'
import { infoData } from 'variables/general'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'

import { AddIcon, InfoIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  Skeleton,
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
  TagRightIcon,
  Tbody,
  Td,
  Text,
  Tooltip,
  Tr,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'
import SupplierTag from 'components/SupplierTag'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'

import {
  authorDelete,
  sbomUpdate,
  supplierDelete,
  toolDelete
} from 'graphQL/Mutation'

import { FaPen, FaScaleBalanced } from 'react-icons/fa6'

import AuthorModal from '../components/AuthorModal'
import ConfirmationModal from '../components/ConfirmationModal'
import ToolModal from '../components/ToolModal'

const InfoLabel = ({ title, onCheck }) => {
  return (
    <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
      <Text fontSize={'sm'}>{title}</Text>
      <Tooltip label={onCheck} placement='top'>
        <InfoIcon color={'blue.500'} />
      </Tooltip>
    </Flex>
  )
}

const General = ({ data, loading, error }) => {
  const { isFreeTier } = useGlobalQueryContext()
  const { showToast } = useCustomToast()
  const location = useLocation()
  const params = useParams()
  const sbomId = params.sbomid

  const { id, spec, suppliers, licensesExp, authors, creationAt, tools } =
    data || ''

  const isArchived = data?.lifecycle === 'archived'

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

  const textColor = useColorModeValue('gray.700', 'white')
  const customerView = location?.pathname?.startsWith('/customer')
  const [activeTool, setActiveTool] = useState(null)

  const TOOL = useDisclosure()
  const DELETE_TOOL = useDisclosure()
  const AUTHOR = useDisclosure()
  const DELETE_AUTHOR = useDisclosure()
  const LICENSE = useDisclosure()
  const DELETE_LICENSE = useDisclosure()
  const SUPPLIER = useDisclosure()
  const DELETE_SUPPLIER = useDisclosure()

  const [deleteSupplier, { loading: supLoading }] = useMutation(supplierDelete)
  const [deleteTool, { loading: toolLoading }] = useMutation(toolDelete)
  const [deleteAuthor, { loading: authorLoading }] = useMutation(authorDelete)
  const [updateSbom, { loading: sbomLoading }] = useMutation(sbomUpdate)

  const handleToolRemove = (id) => {
    deleteTool({ variables: { toolID: id, sbomID: sbomId } })
      .then((res) => res?.data)
      .finally(() => DELETE_TOOL?.onClose())
  }

  const handleAuthorRemove = async (id) => {
    await deleteAuthor({ variables: { authorId: id, sbomId } })
      .then((res) => res?.data)
      .finally(() => DELETE_AUTHOR?.onClose())
  }

  const handleSupRemove = async (id) => {
    await deleteSupplier({ variables: { id: id } })
      .then((res) => res.data)
      .finally(() => DELETE_SUPPLIER?.onClose())
  }

  const onLicenseOpen = () => {
    sbomDispatch({ type: 'SET_LICENSES', payload: licensesExp })
    LICENSE?.onOpen()
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
      .finally(() => {
        showToast({
          description: 'Licenses updated successfully',
          status: 'success'
        })
        DELETE_LICENSE?.isOpen ? DELETE_LICENSE?.onClose() : LICENSE?.onClose()
      })
  }

  const onDeleteSup = (item) => {
    setActiveTool(item)
    DELETE_SUPPLIER?.onOpen()
  }

  // ADD KEYBOARD SHORTCUT FOR TOGGLE SBOM DRAWER
  const handleSBMDown = useCallback(
    (event) => {
      if (event.altKey && event.key === '2') {
        LICENSE?.onToggle()
      }
    },
    [LICENSE]
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
        >
          <Tbody w={'100%'}>
            {/* CREATED AT */}
            <Tr>
              <Td pl={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel
                  title={`Created At`}
                  onCheck={onCheck('Created At')}
                />
              </Td>
              <Td fontSize={'sm'} color={'gray.500'} width={'85%'}>
                {creationAt ? getFullDateAndTime(creationAt) : ''}
              </Td>
            </Tr>
            {/* CREATION TOOLS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel
                  title={`Creation Tool`}
                  onCheck={onCheck('Creation Tool')}
                />
              </Td>
              <Td width={'85%'}>
                <Flex alignItems={'center'} flexWrap={'wrap'} gap={3}>
                  {tools?.map((item, index) => (
                    <Tag
                      key={index}
                      height={7}
                      variant='subtle'
                      colorScheme='teal'
                    >
                      <TagLabel>
                        {item.name} - {item.version}
                      </TagLabel>
                      {updateComponent && (
                        <TagCloseButton
                          hidden={isArchived}
                          onClick={() => {
                            setActiveTool(item)
                            DELETE_TOOL?.onOpen()
                          }}
                        />
                      )}
                    </Tag>
                  ))}
                  <Button
                    size='xs'
                    variant='unstyled'
                    hidden={isArchived}
                    onClick={TOOL?.onOpen}
                    leftIcon={<AddIcon />}
                    isDisabled={customerView || !editSboms}
                    color={tools?.length > 0 ? 'gray.500' : 'blue.500'}
                  >
                    {tools?.length > 0 ? 'Add New' : 'Add Tool'}
                  </Button>
                </Flex>
              </Td>
            </Tr>
            {/* AUTHORS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel title={`Authors`} onCheck={onCheck('Authors')} />
              </Td>
              <Td width={'85%'}>
                <Flex alignItems={'center'} flexWrap={'wrap'} gap={3}>
                  {authors?.map((item, index) => (
                    <Tag
                      height={7}
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
                          hidden={isArchived}
                          onClick={() => {
                            setActiveTool(item)
                            DELETE_AUTHOR?.onOpen()
                          }}
                        />
                      )}
                    </Tag>
                  ))}
                  <Button
                    size='xs'
                    variant='unstyled'
                    leftIcon={<AddIcon />}
                    onClick={AUTHOR?.onOpen}
                    hidden={isArchived}
                    isDisabled={customerView || !editSboms}
                    color={authors?.length > 0 ? 'gray.500' : 'blue.500'}
                  >
                    {authors?.length > 0 ? 'Add New' : 'Add Author'}
                  </Button>
                </Flex>
              </Td>
            </Tr>
            {/* SUPPLIERS */}
            <Tr>
              <Td pl={0} fontWeight={'medium'} w={'15%'}>
                <InfoLabel title={`Supplier`} onCheck={onCheck('Supplier')} />
              </Td>
              <Td w={'85%'}>
                {suppliers?.length > 0 ? (
                  suppliers?.map((item, index) => (
                    <SupplierTag
                      key={index}
                      item={item}
                      editable={true}
                      onEdit={SUPPLIER?.onOpen}
                      premission={!updateComponent || isArchived}
                      onDelete={() => onDeleteSup(item)}
                    />
                  ))
                ) : (
                  <Button
                    size='xs'
                    variant='unstyled'
                    color={'blue.500'}
                    hidden={isArchived}
                    onClick={SUPPLIER?.onOpen}
                    leftIcon={<AddIcon />}
                    isDisabled={customerView || !editSboms}
                  >
                    Add Supplier
                  </Button>
                )}
              </Td>
            </Tr>
            {/* LICENSES */}
            <Tr>
              <Td pl={0} fontSize={'sm'} fontWeight={'medium'} w={'15%'}>
                Data License
              </Td>
              <Td w={'85%'}>
                {licensesExp && licensesExp !== '' ? (
                  <Tag
                    my={2}
                    height={7}
                    variant='subtle'
                    colorScheme='green'
                    width={'fit-content'}
                  >
                    <TagLabel>{licensesExp}</TagLabel>
                    <TagRightIcon
                      fontSize={12}
                      as={FaPen}
                      cursor={'pointer'}
                      onClick={onLicenseOpen}
                      hidden={!updateComponent || isArchived}
                    />
                    <TagCloseButton
                      onClick={DELETE_LICENSE?.onOpen}
                      hidden={!updateComponent || isArchived}
                    />
                  </Tag>
                ) : (
                  <Button
                    size='xs'
                    variant='unstyled'
                    color={'blue.500'}
                    hidden={isArchived}
                    leftIcon={<AddIcon />}
                    onClick={onLicenseOpen}
                    isDisabled={customerView || !editSboms}
                  >
                    Add License
                  </Button>
                )}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </CardBody>

      {/* SBOM LICENSE MODAL */}
      <LynkModal
        isLoading={sbomLoading}
        Icon={FaScaleBalanced}
        isOpen={LICENSE?.isOpen}
        onClose={LICENSE?.onClose}
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
      {/* SUPPLIER MODAL */}
      <PriSupplierModal
        activeRow={null}
        suppliers={suppliers}
        isFreeTier={isFreeTier}
        isOpen={SUPPLIER?.isOpen}
        onClose={SUPPLIER?.onClose}
      />
      {/* TOOL DELETE MODAL */}
      <ConfirmationModal
        title={'Remove Tool'}
        isLoading={toolLoading}
        isOpen={DELETE_TOOL?.isOpen}
        onClose={DELETE_TOOL?.onClose}
        onConfirm={() => handleToolRemove(activeTool?.id)}
        name={`${activeTool?.name}-${activeTool?.version} `}
        description={`You are about to delete the creator Tool : ${activeTool?.name}-${activeTool?.version} from this version.`}
      />
      {/* AUTHOR DELETE MODAL */}
      <ConfirmationModal
        isOpen={DELETE_AUTHOR?.isOpen}
        onClose={DELETE_AUTHOR?.onClose}
        title={'Remove Author'}
        isLoading={authorLoading}
        name={`${activeTool?.name}-${activeTool?.email} `}
        onConfirm={() => handleAuthorRemove(activeTool?.id)}
        description={`You are about to delete the Author : ${activeTool?.name}-${activeTool?.email} from this version.`}
      />
      {/* SUPPLIER DELETE MODAL */}
      <ConfirmationModal
        isLoading={supLoading}
        name={activeTool?.name}
        title={'Remove Supplier'}
        isOpen={DELETE_SUPPLIER?.isOpen}
        onClose={DELETE_SUPPLIER?.onClose}
        onConfirm={() => handleSupRemove(activeTool?.id)}
        description={`You are about to delete the Supplier : ${activeTool?.name} from this version.`}
      />
      {/* LICENSE DELETE MODAL */}
      <ConfirmationModal
        name={licensesExp}
        isLoading={sbomLoading}
        title={'Remove License'}
        isOpen={DELETE_LICENSE?.isOpen}
        onClose={DELETE_LICENSE?.onClose}
        onConfirm={onUpdateLicense}
        description={`You are about to delete the License : ${licensesExp} from this version.`}
      />

      {/* TOOL MODAL */}
      <ToolModal isOpen={TOOL?.isOpen} onClose={TOOL?.onClose} />
      {/* AUTHOR MODAL */}
      <AuthorModal isOpen={AUTHOR?.isOpen} onClose={AUTHOR?.onClose} />
    </>
  )
}

export default General
