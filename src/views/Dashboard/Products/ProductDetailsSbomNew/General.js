import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDateAndTime, isCustomerView } from 'utils'
import { transformLicenseString } from 'utils'
import { infoData } from 'variables/general'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'

import { AddIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel, TagRightIcon } from '@chakra-ui/react'
import { Table, Tbody, Td, Tr } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'
import InfoLabel from 'components/Misc/InfoLabel'
import SupplierTag from 'components/SupplierTag'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  authorDelete,
  sbomUpdate,
  supplierDelete,
  toolDelete
} from 'graphQL/Mutation'

import { FaPen, FaScaleBalanced } from 'react-icons/fa6'

import AuthorModal from '../components/AuthorModal'
import ConfirmationModal from '../components/ConfirmationModal'
import PhaseModal from '../components/PhaseModal'
import ToolModal from '../components/ToolModal'

const General = ({ data, loading, error }) => {
  const { primaryBlueText, inverseSecondaryBgColor, sameSecondaryText } =
    useThemeColor([
      'primaryBlueText',
      'inverseSecondaryBgColor',
      'sameSecondaryText'
    ])
  const { isFreeTier } = useGlobalQueryContext()
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid

  const { id, spec, suppliers, licensesExp, authors, creationAt, tools } =
    data || ''

  const phaseExists = data?.phases?.length > 0

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

  const customerView = isCustomerView()
  const [activeTool, setActiveTool] = useState(null)

  const TOOL = useDisclosure()
  const PHASES = useDisclosure()
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
    const licenseObj = sbomState?.licenseString
    const isCustomLicense = licenseObj && licenseObj?.type === 'Custom License'

    const license = isCustomLicense
      ? transformLicenseString(licenseObj?.value)
      : licenseObj?.value || ''

    await updateSbom({
      variables: {
        id: id,
        spec: spec,
        licenses: { licensesExp: license || '' }
      }
    })
      .then((res) => {
        if (res?.data?.sbomUpdate?.errors?.length > 0) {
          showToast({
            description: res.data.sbomUpdate.errors[0],
            status: 'error'
          })
        } else {
          sbomDispatch({ type: 'CLEAR_LICENSES' })
          showToast({
            description: 'Licenses updated successfully',
            status: 'success'
          })
        }
      })
      .catch((error) => {
        showToast({
          description: error.message || 'Failed to update licenses',
          status: 'error'
        })
      })
      .finally(() => {
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

  const ActiveBtn = ({ children, label, color, onClick, editable }) => {
    return (
      <Button
        size='xs'
        title={label}
        onClick={onClick}
        variant='unstyled'
        hidden={isArchived}
        aria-label={label}
        sx={{ color: color, ml: editable ? 1 : 0 }}
        leftIcon={editable ? <FaPen /> : <AddIcon />}
        isDisabled={customerView || !editSboms}
      >
        {children}
      </Button>
    )
  }

  const toolInfo = (item) => {
    return (
      <Stack dir='column' spacing={1}>
        <Text>Name: {item?.name}</Text>
        {item?.version && <Text>Version: {item?.version}</Text>}
        {item?.vendor && <Text>Vendor: {item?.vendor}</Text>}
      </Stack>
    )
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
          color={inverseSecondaryBgColor}
        >
          <Tbody w={'100%'}>
            {/* CREATED AT */}
            <Tr minH={'64px'}>
              <Td p={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel
                  title={`Created At`}
                  onCheck={onCheck('Created At')}
                />
              </Td>
              <Td fontSize={'sm'} color={sameSecondaryText} width={'85%'}>
                {creationAt ? getFullDateAndTime(creationAt) : ''}
              </Td>
            </Tr>
            {/* PHASES */}
            <Tr minH={'64px'}>
              <Td p={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel title={`Phases`} onCheck={onCheck('SBOM Phases')} />
              </Td>
              <Td width={'85%'}>
                <Flex alignItems={'center'} flexWrap={'wrap'} gap={2}>
                  {phaseExists &&
                    data?.phases?.map((item, index) => (
                      <Tag
                        key={index}
                        variant='subtle'
                        colorScheme='orange'
                        sx={{ w: 'fit-content', h: 7 }}
                      >
                        <TagLabel textTransform='capitalize'>{item}</TagLabel>
                      </Tag>
                    ))}
                  <ActiveBtn
                    onClick={PHASES?.onOpen}
                    editable={phaseExists ? true : false}
                    color={phaseExists ? sameSecondaryText : primaryBlueText}
                  >
                    {phaseExists ? 'Update' : 'Add Phase'}
                  </ActiveBtn>
                </Flex>
              </Td>
            </Tr>
            {/* CREATION TOOLS */}
            <Tr minH={'64px'}>
              <Td pl={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel
                  title={`Creation Tool`}
                  onCheck={onCheck('Creation Tool')}
                />
              </Td>
              <Td width={'85%'}>
                <Flex alignItems={'center'} flexWrap={'wrap'} gap={2}>
                  {tools?.map((item, index) => (
                    <Tooltip key={index} label={toolInfo(item)}>
                      <Tag
                        variant='subtle'
                        colorScheme='teal'
                        sx={{ w: 'fit-content', h: 7, cursor: 'pointer' }}
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
                    </Tooltip>
                  ))}
                  <ActiveBtn
                    label={'add_tool'}
                    onClick={TOOL?.onOpen}
                    color={
                      tools?.length > 0 ? sameSecondaryText : primaryBlueText
                    }
                  >
                    {tools?.length > 0 ? 'Add New' : 'Add Tool'}
                  </ActiveBtn>
                </Flex>
              </Td>
            </Tr>
            {/* AUTHORS */}
            <Tr minH={'64px'}>
              <Td p={0} fontWeight={'medium'} width={'15%'}>
                <InfoLabel title={`Authors`} onCheck={onCheck('Authors')} />
              </Td>
              <Td width={'85%'}>
                <Flex alignItems={'center'} flexWrap={'wrap'} gap={2}>
                  {authors?.map((item, index) => (
                    <Tag
                      key={index}
                      variant='subtle'
                      colorScheme='blue'
                      sx={{ w: 'fit-content', h: 7 }}
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
                  <ActiveBtn
                    label={'add_author'}
                    onClick={AUTHOR?.onOpen}
                    color={
                      authors?.length > 0 ? sameSecondaryText : primaryBlueText
                    }
                  >
                    {authors?.length > 0 ? 'Add New' : 'Add Author'}
                  </ActiveBtn>
                </Flex>
              </Td>
            </Tr>
            {/* SUPPLIERS */}
            <Tr minH={'64px'}>
              <Td pl={0} fontWeight={'medium'} w={'15%'}>
                <InfoLabel title={`Supplier`} onCheck={onCheck('Supplier')} />
              </Td>
              <Td w={'85%'} py={0}>
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
                  <ActiveBtn onClick={SUPPLIER?.onOpen} color={primaryBlueText}>
                    Add Supplier
                  </ActiveBtn>
                )}
              </Td>
            </Tr>
            {/* LICENSES */}
            <Tr minH={'64px'}>
              <Td pl={0} fontSize={'sm'} fontWeight={'medium'} w={'15%'}>
                Data License
              </Td>
              <Td w={'85%'} py={0}>
                {licensesExp && licensesExp !== '' ? (
                  <Tag
                    variant='subtle'
                    colorScheme='green'
                    sx={{ w: 'fit-content', my: 2, h: 7 }}
                  >
                    <TagLabel>{licensesExp}</TagLabel>
                    <TagRightIcon
                      as={FaPen}
                      _hover={{ opacity: 1 }}
                      onClick={onLicenseOpen}
                      data-testid='edit_license'
                      hidden={!updateComponent || isArchived}
                      sx={{ fontSize: 12, cursor: 'pointer', opacity: 0.5 }}
                    />
                    <TagCloseButton
                      data-testid='delete_license'
                      onClick={DELETE_LICENSE?.onOpen}
                      hidden={!updateComponent || isArchived}
                    />
                  </Tag>
                ) : (
                  <ActiveBtn onClick={onLicenseOpen} color={primaryBlueText}>
                    Add License
                  </ActiveBtn>
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
        disabled={!sbomState?.licenseString}
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
        activeRow={suppliers}
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
      {/* PHASE MODAL */}
      <PhaseModal
        data={data?.phases}
        isOpen={PHASES?.isOpen}
        onClose={PHASES?.onClose}
      />
    </>
  )
}

export default General
