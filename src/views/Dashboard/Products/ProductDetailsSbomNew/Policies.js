import { useMutation } from '@apollo/client'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isSbomArchived } from 'utils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import ViolationDrawer from 'components/Drawer/ViolationDrawer'
import LynkTable from 'components/LynkTable'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

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

  const isArchived = isSbomArchived(sbomData)

  const policyRun = useHasPermission({
    parentKey: 'view_policy',
    childKey: 'run_policy_scan'
  })

  const { nodes, paginationProps, loading, reset, startPolling, stopPolling } =
    usePaginatedQuery(PolicyResults, {
      skip: activeTab === 'policies' ? false : true,
      selector: 'policyResults',
      variables: { sbomId }
    })

  const isInitialized = nodes?.some((item) => item?.result === 'initialized')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [activeRule, setActiveRule] = useState(null)
  const [activePolicy, setActivePolicy] = useState(null)

  const [policyScan] = useMutation(SbomPolicyScan)

  const shouldPoll = nodes?.some(
    (item) => item?.sbom?.policyRunStatus === 'IN_PROGRESS'
  )

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
    (data, rule) => {
      setActivePolicy(data)
      setActiveRule(rule)
      onOpen()
    },
    [onOpen]
  )

  //Columns
  const columns = PolicyColumns(isInitialized)

  // SUB HEADER
  const subHeader = PolicySubHeader(reset, isArchived, handleRefresh, policyRun)

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          columns={columns}
          data={nodes || []}
          expandOnRowClicked
          progressPending={loading}
          expandableRows={!shouldPoll}
          subHeaderComponent={subHeader}
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
          activeRow={activeRule}
          policy={activePolicy?.policy?.name || ''}
        />
      )}
    </>
  )
}

export default Policies
