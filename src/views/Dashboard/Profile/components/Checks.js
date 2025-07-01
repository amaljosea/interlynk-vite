import { useMutation, useQuery } from '@apollo/client'
import { sevColor } from 'utils/styleUtils'

import { Button, Flex, Text } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import LynkTable from 'components/LynkTable'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { orgRuleUpdate } from 'graphQL/Mutation'
import { GetOrgRulesForChecks } from 'graphQL/Queries'

import { LuChevronDown } from 'react-icons/lu'

const Checks = () => {
  const showToast = useCustomToast()
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()

  const { primaryTextColor, secondaryTextInverse } = useThemeColor([
    'primaryTextColor',
    'secondaryTextInverse'
  ])

  const canEdit = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const { data, loading } = useQuery(GetOrgRulesForChecks, {
    skip: !orgView ? true : activetab === 'compliance' ? false : true,
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
            isDisabled={!canEdit}
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
      selector: (row) => (
        <Text fontSize={14} color={primaryTextColor}>
          {row.rule.friendlyId}
        </Text>
      ),
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
            <Text color={primaryTextColor} fontSize={14}>
              {rule.shortDesc}
            </Text>
            <Text color={secondaryTextInverse}>{rule.longDesc}</Text>
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
          <Menu>
            <MenuButton
              as={Button}
              size='sm'
              width={'110px'}
              variant='solid'
              isDisabled={!canEdit}
              _hover={{ bg: 'auto' }}
              _active={{ bg: 'auto' }}
              _focus={{ boxShadow: 'none' }}
              rightIcon={<LuChevronDown boxSize={5} />}
              colorScheme={sevColor(severity.toLowerCase()).btn}
            >
              {options.find((option) => option.value === severity)?.label ||
                'Select option'}
            </MenuButton>
            <MenuList w='100px' minW='50px' fontSize={'sm'}>
              {options.map((itm, index) => (
                <MenuItem
                  key={index}
                  textColor={primaryTextColor}
                  onClick={() => handleStatusChange(id, itm.value)}
                >
                  {itm.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )
      },
      sortable: true,
      right: 'true'
    }
  ]

  const handleChange = async (value, id) => {
    try {
      await updateRule({
        variables: {
          id: id,
          enabled: value === true ? true : false
        }
      })
    } catch (error) {
      showToast({
        description: `Unable to change status, please try again.`,
        status: 'error'
      })
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
      showToast({
        description: `Unable to change status, please try again.`,
        status: 'error'
      })
    }
  }

  return (
    <Card p={0} boxShadow='none'>
      <CardHeader display={'flex'} flexDirection={'column'}>
        <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
          SBOM Check
        </Text>
        <Text fontSize={'sm'}>
          Verify SBOM compliance with essential security, license, and quality
          checks
        </Text>
      </CardHeader>
      <CardBody>
        {data && data.organization && (
          <LynkTable
            columns={columns}
            data={data && data.organization.organizationRules}
            defaultSortFieldId={'RULES_FRIENDLY_ID'}
            progressPending={loading}
          />
        )}
      </CardBody>
    </Card>
  )
}

export default Checks
