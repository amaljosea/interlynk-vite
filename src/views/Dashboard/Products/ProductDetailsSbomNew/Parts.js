import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { useNavigate, useParams } from 'react-router-dom'
import { customStyles, getSignedUrlParams } from 'utils'
import { ProductGeneralTabs } from 'utils/TabsObjects'

import { Flex, Text } from '@chakra-ui/react'
import { useColorMode, useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import CreateParts from 'components/Modal/CreateParts'

import { useGlobalState } from 'hooks/useGlobalState'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { SbomPartDelete } from 'graphQL/Mutation'
import { GetSbomParts } from 'graphQL/Queries'

import ConfirmationModal from '../components/ConfirmationModal'
import PartsColumns from './Components/tableColumns/PartsColumns'
import PartsSubHeader from './Components/tableSubHeaders/PartsSubHeader'

const Parts = ({ data }) => {
  const params = useParams()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const partsContext = usePartsContext()
  const sbomId = params.sbomid
  const prodId = params.productid
  const activeTab = useQueryParam('tab')
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const isArchived = data?.lifecycle === 'archived'

  const { totalRows, dispatch } = useGlobalState()

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const { prodVulnDispatch } = dispatch

  const { PARTS } = ProductGeneralTabs

  // GET SBOM PARTS
  const {
    data: sbomData,
    error,
    startPolling,
    stopPolling
  } = useQuery(GetSbomParts, {
    skip: activeTab === PARTS ? false : true,
    variables: { projectId: prodId, sbomId, first: totalRows }
  })

  const { sbomParts } = sbomData?.sbom || ''

  const signedUrlParams = getSignedUrlParams()

  const updateSboms = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const CREATE = useDisclosure()
  const DELETE = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)

  const [deleteSbomPart, { loading: dlLoading }] = useMutation(SbomPartDelete)

  const handleRemove = async () => {
    await deleteSbomPart({
      variables: { id: activeRow.id }
    }).then((res) => res?.data && DELETE.onClose())
  }

  const onSelectPart = () => partsContext.push()

  const onFilterSev = (part, value, link) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    onSelectPart(part)
    navigate(link)
  }

  const shouldPoll = sbomParts?.some(
    (item) => item?.part?.vulnRunStatus !== 'FINISHED'
  )

  useGradualPolling({ shouldPoll, startPolling, stopPolling })

  // SUB HEADER
  const subHeader = PartsSubHeader(
    isArchived,
    CREATE.onOpen,
    signedUrlParams,
    updateSboms
  )

  // COLUMNS
  const columns = PartsColumns(
    onFilterSev,
    colorMode,
    updateSboms,
    signedUrlParams,
    DELETE.onOpen,
    isArchived,
    setActiveRow,
    onSelectPart,
    generateProductVersionDetailPageUrlFromCurrentUrl
  )

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          data={sbomParts}
          persistTableHead
          columns={columns}
          responsive={true}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
          subHeaderComponent={subHeader}
          progressPending={sbomParts ? false : true}
        />
      </Flex>

      {CREATE.isOpen && (
        <CreateParts
          parts={sbomParts || []}
          isOpen={CREATE.isOpen}
          onClose={CREATE.onClose}
        />
      )}

      {/* DISABLED */}
      {DELETE.isOpen && (
        <ConfirmationModal
          title='Delete Part'
          isLoading={dlLoading}
          isOpen={DELETE.isOpen}
          onClose={DELETE.onClose}
          onConfirm={handleRemove}
          description='Deleting this version will:'
          name={`${activeRow?.part?.project?.projectGroup?.name} - ${activeRow?.part?.projectVersion}`}
          items={[
            'Remove this versions and its SBOM',
            'Remove access to this version for all users'
          ]}
        />
      )}
    </>
  )
}

export default Parts
