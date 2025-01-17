import { useMutation, useQuery } from '@apollo/client'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { getFullDate, timeSince, updatedValue } from 'utils'
import { formatConditionValue } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { getIcon } from 'utils/styleUtils'
import { customStyles } from 'utils/styleUtils'
import DeleteModal from 'views/Dashboard/Policies/DeleteModal'
import PolicyModal from 'views/Dashboard/Policies/PolicyModal'
import RuleModal from 'views/Dashboard/Policies/RuleModal'
import WarnModal from 'views/Dashboard/Policies/WarnModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Box,
  Flex,
  Icon,
  Portal,
  Select,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'
import { CustomText } from 'components/Misc/CustomText'
import LynkAction from 'components/Misc/LynkAction'
import LynkSwitch from 'components/Misc/LynkSwitch'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { DeletePolicyExclusion, PolicyExclusionCreate } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'

const PolicyTable = (props) => {
  const { data, filters, setFilters, loading, paginationProps } = props

  const { showToast } = useCustomToast()
  const location = useLocation()
  const params = useParams()
  const productId = params.productid
  const tab = useQueryParam('tab')

  const editProdPolicies = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_product_policies'
  })

  const updatePolicy = useHasPermission({
    parentKey: 'view_policy',
    childKey: 'create_update_policy'
  })

  const removePolicy = useHasPermission({
    parentKey: 'view_policy',
    childKey: 'remove_policy'
  })

  const {
    primaryBlueText,
    headingTextColor,
    primaryTextColor,
    secondaryTextInverse,
    primaryErrorColor
  } = useThemeColor([
    'primaryBlueText',
    'headingTextColor',
    'primaryTextColor',
    'secondaryTextInverse',
    'primaryErrorColor'
  ])

  const { search } = filters || ''
  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState(filters ? search : '')

  const { POLICIES } = ProductDetailsTabs

  const { data: subOperators } = useQuery(PolicySubjectOperators, {
    skip:
      tab === POLICIES || location?.pathname === '/vendor/policies'
        ? false
        : true
  })

  const formatSubject = (value) => {
    if (subOperators) {
      const result = subOperators.policySubjectOperatorMapping.find(
        (item) => item?.subject === value
      )
      return { name: result?.name, category: result?.category }
    }
  }

  const [createExclusion] = useMutation(PolicyExclusionCreate)
  const [deleteExclusion] = useMutation(DeletePolicyExclusion)

  const UPDATE = useDisclosure()
  const WARNING = useDisclosure()
  const DELETE = useDisclosure()
  const RULE = useDisclosure()

  const handleCreateExclusion = async (id) => {
    await createExclusion({
      variables: { policyId: id, projectId: productId }
    }).then((res) => {
      const errors = res?.data?.policyExclusionCreate?.errors
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      }
    })
  }

  const handleDeleteExclusion = async (id) => {
    await deleteExclusion({
      variables: { policyId: id, projectId: productId }
    }).then((res) => {
      const errors = res?.data?.policyExclusionDelete?.errors
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      }
    })
  }

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
    },
    [setFilters]
  )

  const handleClear = useCallback(async () => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
  }, [setFilters])

  const onSearchInputChange = useCallback(
    (event) => {
      const { value } = event.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  const handleSearch = useCallback(
    (event) => {
      const {
        key,
        target: { value }
      } = event
      if (key === 'Enter' && value !== '') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

  // SUB HEADER
  const subHeader = useMemo(() => {
    const handleCreate = () => {
      setActiveRow(null)
      UPDATE.onOpen()
    }
    return (
      <Flex
        w={'100%'}
        alignItems={'center'}
        justifyContent={productId ? 'flex-end' : 'space-between'}
      >
        {!productId && (
          <SearchFilter
            id='policies'
            onClear={handleClear}
            filterText={filterText}
            onFilter={handleSearch}
            onChange={onSearchInputChange}
          />
        )}
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <AddButton
            hidden={productId}
            label='Create Policy'
            onClick={handleCreate}
            aria-label='add_policy'
            isDisabled={!updatePolicy}
          />
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
    UPDATE,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange,
    productId,
    updatePolicy
  ])

  // COLUMNS
  const columns = [
    {
      id: 'ACTIVE',
      name: 'ACTIVE',
      selector: (row) => {
        const { isEnabled } = row
        return (
          <LynkSwitch
            size='md'
            isDisabled={!updatePolicy}
            isChecked={isEnabled}
            onChange={() => {
              setActiveRow(row)
              WARNING.onOpen()
            }}
          />
        )
      },
      width: '7%',
      omit: productId
    },
    {
      id: 'POLICY',
      name: 'POLICY',
      selector: (row, index) => (
        <Stack my={4} spacing={1}>
          <Text color={primaryTextColor} data-testid={`policy_${index}`}>
            {row?.name}
          </Text>
          <Text size='sm' color={secondaryTextInverse}>
            {row?.description}
          </Text>
        </Stack>
      ),
      width: '32%',
      wrap: true
    },
    {
      id: 'EXCLUDED',
      name: 'EXCLUDED',
      selector: (row) => {
        const { excludePrimaryComponent, excludeInternalComponent } = row || ''
        return (
          <Flex gap={2} alignItems={'center'}>
            {excludePrimaryComponent && (
              <Tag variant='solid' colorScheme='blue'>
                Primary
              </Tag>
            )}
            {excludeInternalComponent && (
              <Tag variant='solid' colorScheme='cyan'>
                Internal
              </Tag>
            )}
          </Flex>
        )
      },
      omit: productId
    },
    {
      id: 'CONDITIONS',
      name: 'CONDITIONS',
      selector: (row) => (
        <Tag
          minW={'60px'}
          textTransform={'uppercase'}
          colorScheme={row?.operator === 'any' ? 'red' : 'green'}
        >
          <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
            {row?.operator}
          </TagLabel>
        </Tag>
      ),
      width: '10%',
      wrap: true
    },
    {
      id: 'RESULT',
      name: 'RESULT',
      selector: (row) => {
        const { resultType } = row
        return (
          <Tag
            minW={'80px'}
            colorScheme={
              resultType === 'inform'
                ? 'blue'
                : resultType === 'warn'
                  ? 'yellow'
                  : 'red'
            }
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {resultType}
            </TagLabel>
          </Tag>
        )
      },
      width: '10%',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'UPDATED',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDate(row?.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor}>{timeSince(row?.updatedAt)}</Text>
        </Tooltip>
      ),
      right: 'true',
      wrap: true
    },
    // EXCLUSION
    {
      id: 'APPLY',
      name: 'APPLY',
      selector: (row) => {
        const { isExcluded, id } = row
        return (
          <Select
            size='sm'
            value={isExcluded ? 'no' : 'yes'}
            onChange={() =>
              isExcluded ? handleDeleteExclusion(id) : handleCreateExclusion(id)
            }
            color={primaryTextColor}
            isDisabled={!editProdPolicies}
            textTransform={'capitalize'}
          >
            {['yes', 'no'].map((itm, index) => (
              <option
                key={index}
                value={itm}
                style={{ textTransform: 'capitalize' }}
              >
                {itm}
              </option>
            ))}
          </Select>
        )
      },
      right: 'true',
      omit: !productId
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row, index) => {
        return (
          <Menu>
            <LynkAction data-testid={`policy_actions_${index}`} />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT POLICY */}
                <MenuItem
                  isDisabled={!updatePolicy}
                  hidden={productId}
                  onClick={() => {
                    setActiveRow(row)
                    UPDATE.onOpen()
                  }}
                  data-testid={`policy_edit_${index}`}
                >
                  Edit Policy
                </MenuItem>
                {/* ADD POLICY RULE */}
                <MenuItem
                  hidden
                  onClick={() => {
                    setActiveRow(row)
                    RULE.onOpen()
                  }}
                >
                  Add Policy Rule
                </MenuItem>
                {/* DELETE POLICY  */}
                <MenuItem
                  color={primaryErrorColor}
                  isDisabled={!removePolicy}
                  onClick={() => {
                    setActiveRow(row)
                    DELETE.onOpen()
                  }}
                  hidden={productId}
                  data-testid={`policy_delete_${index}`}
                >
                  Delete Policy
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      width: '10%',
      right: 'true',
      omit: productId
    }
  ]

  const conditionalRowStyles = [
    {
      when: (row) => row.isExcluded === true,
      style: {
        // eslint-disable-next-line
        backgroundColor: '#f2f2f2',
        // eslint-disable-next-line
        color: '#111',
        '&:hover': { cursor: 'pointer' }
      }
    }
  ]

  // EXPAND VIEW
  const ExpandedComponent = ({ data }) => {
    const { policyRules } = data || {}

    return (
      <Flex
        p={5}
        gap={6}
        width={'100%'}
        flexDir={'column'}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Box>
          <CustomText>CONDITIONS :</CustomText>
          <Stack mt={3} spacing={3}>
            {policyRules?.map((item, index) => {
              const { name, category } = formatSubject(item?.subject)
              return (
                <Flex gap={3} key={index} alignItems={'center'}>
                  <Text w={'12'} fontSize={'sm'} color={primaryTextColor}>
                    {index + 1}.
                  </Text>
                  <InputGroup
                    size='sm'
                    fontSize={'sm'}
                    color={primaryTextColor}
                  >
                    <InputLeftAddon>
                      <Tooltip label={category} textTransform={'capitalize'}>
                        <Flex>
                          <Icon
                            color={primaryBlueText}
                            as={getIcon(item.subject)}
                          />
                        </Flex>
                      </Tooltip>
                    </InputLeftAddon>
                    <Input
                      readOnly
                      textTransform={'capitalize'}
                      _focus={{ boxShadow: 'none' }}
                      defaultValue={name}
                    />
                  </InputGroup>
                  <InputGroup
                    size='sm'
                    fontSize={'sm'}
                    color={primaryTextColor}
                  >
                    <InputLeftAddon>Operator</InputLeftAddon>
                    <Input
                      readOnly
                      _focus={{ boxShadow: 'none' }}
                      defaultValue={updatedValue(item?.operator?.toLowerCase())}
                    />
                  </InputGroup>
                  {item?.value && (
                    <InputGroup
                      size='sm'
                      fontSize={'sm'}
                      color={primaryTextColor}
                    >
                      <InputLeftAddon>Value</InputLeftAddon>
                      <Input
                        readOnly
                        textTransform={'capitalize'}
                        _focus={{ boxShadow: 'none' }}
                        defaultValue={formatConditionValue(item)}
                      />
                    </InputGroup>
                  )}
                </Flex>
              )
            })}
          </Stack>
        </Box>
      </Flex>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data || []}
          customStyles={customStyles(headingTextColor)}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={ExpandedComponent}
          persistTableHead
          responsive={true}
          conditionalRowStyles={conditionalRowStyles}
        />

        {/* PAGINATION */}
        {<Pagination {...paginationProps} />}
      </Flex>

      {UPDATE.isOpen && (
        <PolicyModal
          data={activeRow}
          isOpen={UPDATE.isOpen}
          onClose={UPDATE.onClose}
          plSubjects={subOperators?.policySubjectOperatorMapping || []}
        />
      )}

      {RULE.isOpen && (
        <RuleModal
          activeRow={activeRow}
          data={activeRow.policyRules[0]}
          isOpen={RULE.isOpen}
          onClose={RULE.onClose}
        />
      )}

      {WARNING.isOpen && (
        <WarnModal
          isOpen={WARNING.isOpen}
          onClose={WARNING.onClose}
          data={activeRow}
        />
      )}
      {DELETE.isOpen && (
        <DeleteModal
          isOpen={DELETE.isOpen}
          onClose={DELETE.onClose}
          data={activeRow}
        />
      )}
    </>
  )
}

export default PolicyTable
