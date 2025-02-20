import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { customStyles } from 'utils/styleUtils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  AutomationConditionSubjectFieldMapping,
  GetProjectAutomations
} from 'graphQL/Queries'

import AutomationSubHeader from './components/AutomationSubHeader'
import CopyRule from './components/CopyRule'
import CreateRule from './components/CreateRule'
import DeleteRule from './components/DeleteRule'
import ImportRule from './components/ImportRule'
import StatusWarning from './components/StatusWarning'
import { useAutomationColumns } from './components/automationColumns'

const Automation = ({ projects }) => {
  const params = useParams()
  const productId = params.productid

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const [activeRow, setActiveRow] = useState(null)
  const [activeEnv, setActiveEnv] = useState(null)

  const tab = useQueryParam('tab')

  const { AUTOMATION_RULES } = ProductDetailsTabs

  const { data: subOperators } = useQuery(
    AutomationConditionSubjectFieldMapping,
    {
      skip: tab === AUTOMATION_RULES ? false : true
    }
  )

  const { nodes, paginationProps, loading } = usePaginatedQuery(
    GetProjectAutomations,
    {
      skip: tab === AUTOMATION_RULES ? false : true,
      selector: 'project.automationRules',
      variables: {
        id: productId
      }
    }
  )

  const RULE = useDisclosure()
  const RULE_COPY = useDisclosure()
  const RULE_ACTIVE = useDisclosure()
  const RULE_DELETE = useDisclosure()
  const RULE_IMPORT = useDisclosure()

  const subHeaderComponent = useMemo(
    () => (
      <AutomationSubHeader
        RULE={RULE}
        RULE_IMPORT={RULE_IMPORT}
        setActiveRow={setActiveRow}
        projects={projects}
      />
    ),
    [RULE, RULE_IMPORT, setActiveRow, projects]
  )

  // COLUMNS
  const columns = useAutomationColumns(
    setActiveRow,
    activeRow,
    RULE_ACTIVE,
    RULE,
    subOperators,
    projects,
    setActiveEnv,
    RULE_COPY,
    RULE_DELETE
  )

  return (
    <>
      <CardBody>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            subHeader
            data={nodes}
            persistTableHead
            responsive={true}
            columns={columns}
            customStyles={customStyles(headingTextColor)}
            progressPending={loading}
            progressComponent={<CustomLoader />}
            subHeaderComponent={subHeaderComponent}
          />
          <Pagination {...paginationProps} />
        </Flex>
      </CardBody>

      {RULE.isOpen && (
        <CreateRule
          data={activeRow}
          isOpen={RULE.isOpen}
          onClose={RULE.onClose}
          subOperators={subOperators}
        />
      )}

      {RULE_DELETE.isOpen && (
        <DeleteRule
          isOpen={RULE_DELETE.isOpen}
          onClose={RULE_DELETE.onClose}
          activeRow={activeRow}
        />
      )}

      {RULE_ACTIVE.isOpen && (
        <StatusWarning
          isOpen={RULE_ACTIVE.isOpen}
          onClose={RULE_ACTIVE.onClose}
          activeRow={activeRow}
        />
      )}

      {RULE_COPY.isOpen && (
        <CopyRule
          env={activeEnv}
          data={activeRow}
          isOpen={RULE_COPY.isOpen}
          onClose={RULE_COPY.onClose}
        />
      )}

      {RULE_IMPORT.isOpen && (
        <ImportRule isOpen={RULE_IMPORT.isOpen} onClose={RULE_IMPORT.onClose} />
      )}
    </>
  )
}

export default Automation
