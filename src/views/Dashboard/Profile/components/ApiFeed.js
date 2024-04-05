// Chakra imports
import { useMutation, useQuery } from '@apollo/client'
import DataTable from 'react-data-table-component'
import { sevColor } from 'utils'

import {
  Box,
  Flex,
  Select,
  Skeleton,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import CustomLoader from 'components/CustomLoader'

import { orgRuleUpdate } from 'graphQL/Mutation'
import { GetOrgRules } from 'graphQL/Queries'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  }
}

const ApiFeed = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const { data, refetch } = useQuery(GetOrgRules, {
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
          <Switch
            name={rule.friendlyId}
            id={rule.friendlyId}
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
      selector: (row) => row.rule.friendlyId,
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
            <Text fontSize={'sm'}>{rule.shortDesc}</Text>
            <Text fontSize={'12px'} color={'#666'}>
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
            width={'130px'}
            value={severity}
            onChange={(e) => handleStatusChange(id, e.target.value)}
            bg={sevColor(severity.toLowerCase()) + '.200'}
            variant={'outline'}
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

  const handleSort = (column, sortDirection) => {
    refetch({
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    })
  }

  const handleChange = async (value, id) => {
    try {
      await updateRule({
        variables: {
          id: id,
          enabled: value === true ? true : false
        }
      }).then(() => refetch())
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
      }).then(() => refetch())
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='8px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          SBOM Checks
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
            customStyles={customStyles}
            progressPending={data ? false : true}
            progressComponent={<CustomLoader />}
            responsive={true}
          />
        )}
      </CardBody>
    </Card>
  )
}

export default ApiFeed
