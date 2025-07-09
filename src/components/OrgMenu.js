import { useLazyQuery, useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { timeSince, truncatedValue } from 'utils'
import { getItem } from 'utils/localStorageUtils'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import {
  Button,
  Center,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListIcon,
  ListItem,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  SkeletonText,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { SwitchOrganization } from 'graphQL/Mutation'
import {
  AllOrganizations,
  GetOrganization,
  MyOrganizations
} from 'graphQL/Queries'

import {
  LuBuilding,
  LuCheck,
  LuChevronDown,
  LuExternalLink,
  LuPlus,
  LuX
} from 'react-icons/lu'

import MenuHeading from './Misc/MenuHeading'

const OrgMenu = () => {
  const { isOpen, onToggle, onClose } = useDisclosure()
  const ORG = useDisclosure()

  const navigate = useNavigate()
  const org = getItem('organization')
  const parsedOrg = JSON.parse(org)
  const { organization, setOrganization } = useGlobalState()
  const isSuperAdmin = organization?.currentUser?.superAdmin

  const { secondaryTextColor, secondaryBgColor } = useThemeColor([
    'secondaryTextColor',
    'secondaryBgColor'
  ])

  const [switchOrg] = useMutation(SwitchOrganization)

  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({
    tier: '',
    status: '',
    search: '',
    orderBy: { field: 'ORGANIZATIONS_CREATED_AT', direction: 'DESC' }
  })
  const { search, tier, status, orderBy } = filters || {}

  const [getOrg] = useLazyQuery(GetOrganization)

  const {
    reset,
    nodes: allOrgs,
    loading: allOrgLoading,
    paginationProps: allPaginationProps
  } = usePaginatedQuery(AllOrganizations, {
    selector: 'allOrganizations',
    skip: isSuperAdmin ? false : true,
    variables: {
      tier: tier !== '' ? tier : undefined,
      search: search !== '' ? search : undefined,
      status: status !== '' ? status : undefined,
      orderBy: { field: orderBy?.field, direction: orderBy?.direction }
    }
  })

  const {
    nodes: myOrgs,
    loading: myOrgLoading,
    paginationProps: myPaginationProps
  } = usePaginatedQuery(MyOrganizations, {
    selector: 'myOrganizations',
    skip: isSuperAdmin ? true : false,
    variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
  })

  const nodes = isSuperAdmin ? allOrgs : myOrgs
  const total = isSuperAdmin
    ? allPaginationProps?.totalCount
    : myPaginationProps?.totalCount
  const loading = isSuperAdmin ? allOrgLoading : myOrgLoading

  console.warn({ total })

  const onChange = async (item) => {
    await switchOrg({ variables: { orgId: item?.id } })
      .then((res) => {
        if (res?.data) {
          Cookies.set('authToken', res.data.organizationSwitch.token)
        }
      })
      .finally(() => {
        setTimeout(() => {
          navigate('/vendor/dashboard')
          window.location.reload()
        }, 100)
      })
  }

  const handleClear = () => {
    setSearchInput('')
    setFilters((prev) => ({ ...prev, search: '' }))
  }

  const handleSearch = (e) => {
    const { value } = e.target
    setSearchInput(value)
    if (value === '') {
      setFilters((prev) => ({ ...prev, search: '' }))
    }
  }

  const handleFilter = (e) => {
    const { value } = e.target
    if (e.key === 'Enter') {
      setFilters((prev) => ({ ...prev, search: value }))
      reset()
    }
  }

  const onFilterTier = (value) => {
    setFilters((prev) => ({ ...prev, tier: value !== 'all' ? value : '' }))
  }

  const onFilterStatus = (value) => {
    setFilters((prev) => ({ ...prev, status: value !== 'all' ? value : '' }))
  }

  const onFilterOrderBy = (value) => {
    setFilters((prev) => ({
      ...prev,
      orderBy: { ...prev.orderBy, field: value }
    }))
  }

  const OrgList = () => {
    if (nodes?.length === 0) return null
    return (
      <List spacing={0} maxHeight='300px' overflowY='auto'>
        {nodes?.map((item, index) => (
          <ListItem
            key={index}
            cursor={'pointer'}
            alignItems={'center'}
            onClick={() => onChange(item)}
            _hover={{ bg: secondaryBgColor }}
            sx={{ display: 'flex', p: 2, gap: 1 }}
          >
            <Stack w={'5'}>
              {organization?.id === item?.id && <ListIcon as={LuCheck} />}
            </Stack>
            <Stack w={'100%'} spacing={0} value={item.id}>
              <Text fontSize={'sm'}>
                {truncatedValue(item?.name, 20)}{' '}
                {isSuperAdmin && `(${item?.id.slice(-5)})`}
              </Text>
              {isSuperAdmin && (
                <Text fontSize={'xs'} color={secondaryTextColor}>
                  {timeSince(item?.updatedAt)}
                </Text>
              )}
            </Stack>
          </ListItem>
        ))}
      </List>
    )
  }

  const menuListStyle = {
    maxW: '200px',
    minH: 'auto',
    maxH: '350px',
    fontSize: 'sm',
    overflowY: 'scroll'
  }

  const link = '/vendor/settings?tab=organizations'

  useEffect(() => {
    if (organization?.id !== parsedOrg?.id) {
      getOrg().then((res) => {
        if (res?.data?.organization) {
          setOrganization(res?.data?.organization)
        }
      })
    }
  }, [getOrg, organization?.id, parsedOrg?.id, setOrganization])

  return (
    <>
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        closeOnBlur={true}
        placement='bottom-start'
        returnFocusOnClose={false}
      >
        <PopoverTrigger>
          <Button
            size={'sm'}
            onClick={onToggle}
            variant={'outline'}
            rightIcon={<LuChevronDown />}
            leftIcon={<LuBuilding fontSize={20} color={secondaryTextColor} />}
          >
            {truncatedValue(organization?.name, 20)}
          </Button>
        </PopoverTrigger>
        <PopoverContent w={isSuperAdmin ? '340px' : '280px'}>
          <PopoverHeader as={Stack}>
            <Flex
              gap={2}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <InputGroup w={'100%'} hidden={!isSuperAdmin}>
                <Input
                  value={searchInput}
                  onChange={handleSearch}
                  onKeyDown={handleFilter}
                  placeholder='Search organization'
                />
                <InputRightElement
                  cursor={'pointer'}
                  hidden={searchInput === ''}
                >
                  <LuX size={18} onClick={() => handleClear()} />
                </InputRightElement>
              </InputGroup>
              {isSuperAdmin ? (
                <IconButton
                  fontSize={'sm'}
                  variant='outline'
                  onClick={() => {
                    onToggle()
                    ORG.onOpen()
                  }}
                  data-testid='add_org'
                  icon={<LuPlus size={18} />}
                />
              ) : (
                <Button
                  w={'100%'}
                  fontSize={'sm'}
                  variant='outline'
                  onClick={ORG.onOpen}
                  data-testid='add_org'
                  leftIcon={<LuPlus size={18} />}
                >
                  Add Organizaton
                </Button>
              )}
            </Flex>
            {isSuperAdmin && (
              <Flex gap={2} alignItems={'center'}>
                <Menu isLazy>
                  <MenuHeading
                    title={'OrderBy'}
                    active={filters?.orderBy?.field !== ''}
                  />
                  <MenuList sx={menuListStyle}>
                    <MenuOptionGroup
                      type={'radio'}
                      onChange={onFilterOrderBy}
                      value={filters?.orderBy?.field}
                    >
                      {[
                        { value: 'ORGANIZATIONS_NAME', label: 'name' },
                        {
                          value: 'ORGANIZATIONS_CREATED_AT',
                          label: 'created at'
                        }
                      ]?.map((item, index) => (
                        <MenuItemOption
                          key={index}
                          value={item?.value}
                          fontSize={'sm'}
                          textTransform={'capitalize'}
                        >
                          {item?.label}
                        </MenuItemOption>
                      ))}
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
                <Menu isLazy>
                  <MenuHeading title={'Tier'} active={filters?.tier !== ''} />
                  <MenuList sx={menuListStyle}>
                    <MenuOptionGroup
                      type={'radio'}
                      value={filters?.tier}
                      onChange={onFilterTier}
                    >
                      {['all', 'free', 'enterprise']?.map((item, index) => (
                        <MenuItemOption
                          key={index}
                          value={item}
                          fontSize={'sm'}
                          textTransform={'capitalize'}
                        >
                          {item}
                        </MenuItemOption>
                      ))}
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
                <Menu isLazy>
                  <MenuHeading title={'Status'} active={status !== ''} />
                  <MenuList sx={menuListStyle}>
                    <MenuOptionGroup
                      type={'radio'}
                      value={status}
                      onChange={onFilterStatus}
                    >
                      {['all', 'approved', 'unapproved']?.map((item, index) => (
                        <MenuItemOption
                          key={index}
                          value={item}
                          fontSize={'sm'}
                          textTransform={'capitalize'}
                        >
                          {item}
                        </MenuItemOption>
                      ))}
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
              </Flex>
            )}
          </PopoverHeader>
          <PopoverArrow />
          {/* <PopoverCloseButton /> */}
          <PopoverBody>
            {loading ? (
              <SkeletonText spacing='3' noOfLines={6} skeletonHeight='3' />
            ) : (
              <>
                {nodes?.length > 0 ? (
                  <OrgList />
                ) : (
                  <Center py={2} fontSize={'sm'} color={secondaryTextColor}>
                    No record to display
                  </Center>
                )}
              </>
            )}
          </PopoverBody>
          <PopoverFooter hidden={total <= 25}>
            <Button
              w={'100%'}
              fontSize={'sm'}
              variant={'ghost'}
              onClick={() => {
                onToggle()
                navigate(link)
              }}
              rightIcon={<LuExternalLink size={18} />}
            >
              View all organizations
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Popover>

      {ORG.isOpen && (
        <OrgModal data={null} isOpen={ORG.isOpen} onClose={ORG.onClose} />
      )}
    </>
  )
}

export default OrgMenu
