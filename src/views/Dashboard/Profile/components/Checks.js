import { useMutation, useQuery } from '@apollo/client'
import { refetchActiveQueries } from 'context/ApolloWrapper'
import DataTable from 'react-data-table-component'
import { customStyles, sevColor } from 'utils'

import { Flex, Select, Text, useColorModeValue } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import CustomLoader from 'components/CustomLoader'
import LynkSwitch from 'components/Misc/LynkSwitch'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { orgRuleUpdate } from 'graphQL/Mutation'
import { GetOrgRules } from 'graphQL/Queries'

const Checks = () => {
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const updateOrg = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const { data } = useQuery(GetOrgRules, {
    skip: !orgView ? true : activetab === 'checks' ? false : true,
    variables: {
      field: 'RULES_FRIENDLY_ID',
      direction: 'ASC'
    }
  })

  const [updateRule] = useMutation(orgRuleUpdate)

  const options = [
    { value: 'critical', label: 'Critical', bg: 'red' },
    { value: 'high', label: 'High', bg: 'orange' },
    { value: 'medium', label: 'Medium', bg: 'yellow' },
    { value: 'low', label: 'Low', bg: 'green' }
  ]

  const columns = [
    // STATUS
    {
      id: 'ORGANIZATION_RULES_ENABLED',
      name: 'ACTIVE',
      width: '10%',
      selector: (row) => {
        const { id, rule, enabled } = row
        return (
          <LynkSwitch
            name={rule.friendlyId}
            id={rule.friendlyId}
            isDisabled={!updateOrg}
            isChecked={enabled ? true : false}
            onChange={(e) => handleChange(e.target.checked, id)}
          />
        )
      }
    },
    // CHECK ID
    {
      id: 'RULES_FRIENDLY_ID',
      name: 'CHECK ID',
      width: '10%',
      selector: (row) => <Text color={textColor}>{row.rule.friendlyId}</Text>,
      sortable: true,
      sortFunction: (a, b) => {
        const extractNumber = (str) => str.match(/\d+/) || [-1] // Extracts the number from the string
        const numberA = parseInt(extractNumber(a.rule.friendlyId)[0], 10)
        const numberB = parseInt(extractNumber(b.rule.friendlyId)[0], 10)
        return numberA - numberB
      }
    },
    // DESCRIPTION
    {
      id: 'RULES_SHORT_DESC',
      name: 'DESCRIPTION',
      selector: (row) => {
        const { rule } = row
        return (
          <Flex direction='column' rowGap={1} my={3}>
            <Text color={textColor} fontSize={'sm'}>
              {rule.shortDesc}
            </Text>
            <Text color={textColor} fontSize={'12px'}>
              {rule.longDesc}
            </Text>
          </Flex>
        )
      },
      wrap: true,
      sortable: true
    },
    // SEVERITY
    {
      id: 'ORGANIZATION_RULES_SEVERITY',
      name: 'SEVERITY',
      selector: (row) => {
        const { severity, id } = row
        return (
          <Select
            size='sm'
            name={id}
            id={id}
            value={severity}
            color={sevColor(severity.toLowerCase()).text}
            isDisabled={!updateOrg}
            onChange={(e) => handleStatusChange(id, e.target.value)}
            bg={sevColor(severity.toLowerCase()).bg}
            borderRadius={'6px'}
            border='none'
            focusBorderColor='transparent'
            _focus={{
              boxShadow: 'none'
            }}
          >
            {options.map((itm, index) => (
              <option key={index} value={itm.value}>
                {itm.label}
              </option>
            ))}
          </Select>
        )
      },
      sortable: true,
      right: 'true'
    }
  ]

  const handleSort = () => {
    refetchActiveQueries()
  }

  const handleChange = async (value, id) => {
    try {
      await updateRule({
        variables: {
          id: id,
          enabled: value === true ? true : false
        }
      })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleStatusChange = async (id, value) => {
    try {
      await updateRule({
        variables: {
          id: id,
          severity: value
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Card p={0} boxShadow='none'>
      <CardHeader
        p='12px 0'
        mb='24px'
        display={'flex'}
        flexDirection={'column'}
      >
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          SBOM Check
        </Text>
        <Text fontSize={'sm'}>
          Verify SBOM compliance with essential security, license, and quality
          checks
        </Text>
      </CardHeader>
      <CardBody>
        {data && data.organization && (
          <DataTable
            columns={columns}
            onSort={handleSort}
            data={data && data.organization.organizationRules}
            defaultSortAsc={true}
            defaultSortFieldId={'RULES_FRIENDLY_ID'}
            customStyles={customStyles(headColor)}
            progressPending={data ? false : true}
            progressComponent={<CustomLoader />}
            responsive={true}
          />
        )}
      </CardBody>
    </Card>
  )
}

export default Checks
