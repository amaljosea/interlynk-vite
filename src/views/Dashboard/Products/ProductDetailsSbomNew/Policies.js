import { useMutation } from '@apollo/client'
import { useCallback, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles } from 'utils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ViolationDrawer from 'components/Drawer/ViolationDrawer'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { SbomPolicyScan } from 'graphQL/Mutation'
import { PolicyResults } from 'graphQL/Queries'

import PolicyColumns from './Components/tableColumns/PolicyColumns'
import ExpandedComponent from './Components/tableExpanded/PolicyExpanded'
import PolicySubHeader from './Components/tableSubHeaders/PolicySubHeader'

const Policies = ({ sbomData }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const isArchived = sbomData?.lifecycle === 'archived'

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const policyRun = useHasPermission({
    parentKey: 'view_policy',
    childKey: 'run_policy_scan'
  })

  const { nodes, paginationProps, loading, startPolling, stopPolling } =
    usePaginatedQuery(PolicyResults, {
      skip: activeTab === 'policies' ? false : true,
      selector: 'policyResults',
      variables: {
        sbomId
      }
    })

  const isInitialized = nodes?.some((item) => item?.result === 'initialized')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)
  const [activePolicy, setActivePolicy] = useState('')

  const [policyScan] = useMutation(SbomPolicyScan)

  const shouldPoll = isInitialized

  useGradualPolling({ shouldPoll, startPolling, stopPolling })

  const handleRefresh = async () => {
    await policyScan({ variables: { sbomId } }).then((res) => {
      const errors = res?.data?.sbomPolicyScan?.errors
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Policy re-scan started',
          status: 'success'
        })
      }
    })
  }

  const onCheckViolations = useCallback(
    (name, item) => {
      setActiveRow(item)
      setActivePolicy(name)
      onOpen()
    },
    [onOpen]
  )

  //Columns
  const columns = PolicyColumns(isInitialized)

  // SUB HEADER
  const subHeader = PolicySubHeader(isArchived, handleRefresh, policyRun)

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={nodes || []}
          customStyles={customStyles(headingTextColor)}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          persistTableHead
          responsive={true}
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={ExpandedComponent}
          expandableRowsComponentProps={{ onCheckViolations }}
        />

        <Pagination {...paginationProps} />
      </Flex>

      {isOpen && (
        <ViolationDrawer
          isOpen={isOpen}
          sbomId={sbomId}
          onClose={onClose}
          activeRow={activeRow}
          policy={activePolicy}
        />
      )}
    </>
  )
}

export default Policies
