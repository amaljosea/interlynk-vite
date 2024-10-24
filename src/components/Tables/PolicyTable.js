import { useMutation, useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import {
  customStyles,
  getFullDateAndTime,
  timeSince,
  updatedValue
} from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import DeleteModal from 'views/Dashboard/Policies/DeleteModal'
import PolicyModal from 'views/Dashboard/Policies/PolicyModal'
import RuleModal from 'views/Dashboard/Policies/RuleModal'
import WarnModal from 'views/Dashboard/Policies/WarnModal'

import {
  Box,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Select,
  Stack,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkSwitch from 'components/Misc/LynkSwitch'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { DeletePolicyExclusion, PolicyExclusionCreate } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'

import { FaEllipsisV, FaPlus } from 'react-icons/fa'

const PolicyTable = ({ data, loading, paginationProps }) => {
  const { showToast } = useCustomToast()
  const location = useLocation()
  const params = useParams()
  const productId = params.productid
  const queryParams = new URLSearchParams(location.search)
  const tab = queryParams.get('tab')

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
    headingTextColor,
    primaryTextColor,
    secondaryTextColor,
    secondaryTextInverse,
    primaryErrorColor
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'secondaryTextColor',
    'secondaryTextInverse',
    'primaryErrorColor'
  ])

  const [activeRow, setActiveRow] = useState(null)
  const [activeRule, setActiveRule] = useState(null)

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
      return `${result?.category} ${result?.name}`
    }
  }

  const [createExclusion] = useMutation(PolicyExclusionCreate)
  const [deleteExclusion] = useMutation(DeletePolicyExclusion)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()
  const {
    isOpen: isRuleOpen,
    onOpen: onRuleOpen,
    onClose: onRuleClose
  } = useDisclosure()

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

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        {/* SEARCH COMPONENTS */}
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <Tooltip label='Create Policy'>
            <IconButton
              hidden={productId}
              colorScheme='blue'
              isDisabled={!updatePolicy}
              onClick={() => {
                setActiveRow(null)
                onOpen()
              }}
              icon={<FaPlus />}
            />
          </Tooltip>
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [onOpen, productId, updatePolicy])

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
              onWarningOpen()
            }}
          />
        )
      },
      width: '8%',
      omit: productId
    },
    {
      id: 'POLICY',
      name: 'POLICY',
      selector: (row) => (
        <Text color={primaryTextColor} my={4}>
          {row?.name}
        </Text>
      ),
      wrap: true
    },
    {
      id: 'CONDITIONS',
      name: 'CONDITIONS',
      selector: (row) => (
        <Tag minW={'60px'} textTransform={'uppercase'} colorScheme='blue'>
          <TagLabel
            pt={0.5}
            style={{ textTransform: 'capitalize' }}
            mx={'auto'}
          >
            {row?.operator}
          </TagLabel>
        </Tag>
      ),
      width: '12%',
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
            <TagLabel
              pt={0.5}
              style={{ textTransform: 'capitalize' }}
              mx={'auto'}
            >
              {resultType}
            </TagLabel>
          </Tag>
        )
      },
      width: '12%',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'UPDATED',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)} placement={'top'}>
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
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color={secondaryTextColor}
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT POLICY */}
                <MenuItem
                  isDisabled={!updatePolicy}
                  hidden={productId}
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Edit Policy
                </MenuItem>
                {/* ADD POLICY RULE */}
                <MenuItem
                  hidden
                  onClick={() => {
                    setActiveRow(row)
                    setActiveRule(null)
                    onRuleOpen()
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
                    onDeleteOpen()
                  }}
                  hidden={productId}
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
    const { description, policyRules } = data
    const CustomText = styled(Text)`
      font-size: 13px;
      font-weight: bold;
      color: ${secondaryTextInverse};
      text-transform: uppercase;
      letter-spacing: 0.6px;
    `
    return (
      <Flex
        p={5}
        gap={6}
        width={'100%'}
        flexDir={'column'}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Box>
          <CustomText>Description :</CustomText>
          <Text
            width={'90%'}
            mt={1}
            fontSize={14}
            wordBreak={'break-all'}
            color={primaryTextColor}
          >
            {description || ''}
          </Text>
        </Box>
        <Box>
          <Heading
            mb={3}
            fontFamily={'inherit'}
            fontSize={'sm'}
            color={primaryTextColor}
          >
            CONDITIONS
          </Heading>
          <TableContainer>
            <Table variant='striped'>
              <Thead>
                <Tr>
                  {['subject', 'operator', 'value'].map((item, index) => (
                    <Th
                      fontFamily={'inherit'}
                      key={index}
                      color={secondaryTextInverse}
                      isNumeric={item === 'value'}
                    >
                      {item}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {policyRules?.map((item, index) => (
                  <Tr key={index}>
                    <Td>
                      <Text
                        color={primaryTextColor}
                        fontSize={'sm'}
                        textTransform={'capitalize'}
                      >
                        {formatSubject(item?.subject)}
                      </Text>
                    </Td>
                    <Td>
                      <Text
                        color={primaryTextColor}
                        fontSize={'sm'}
                        textTransform={'lowercase'}
                      >
                        {updatedValue(item?.operator)}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text
                        color={primaryTextColor}
                        fontSize={'sm'}
                        wordBreak={'break-all'}
                        hidden={
                          item?.operator === 'EXISTS' ||
                          item?.operator === 'NOT_EXISTS'
                        }
                      >
                        {item?.value}{' '}
                        {item?.subject === 'VULNERABILITY_EPSS' &&
                        (item?.operator === 'LESS_THAN' ||
                          item?.operator === 'MORE_THAN')
                          ? ' %'
                          : ''}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
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

      {isOpen && (
        <PolicyModal
          data={activeRow}
          isOpen={isOpen}
          onClose={onClose}
          plSubjects={subOperators?.policySubjectOperatorMapping || []}
        />
      )}

      {isRuleOpen && (
        <RuleModal
          activeRow={activeRow}
          data={activeRow.policyRules[0]}
          isOpen={isRuleOpen}
          onClose={onRuleClose}
        />
      )}

      {isWarningOpen && (
        <WarnModal
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          data={activeRow}
        />
      )}
      {isDeleteOpen && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          data={activeRow}
        />
      )}
    </>
  )
}

export default PolicyTable
