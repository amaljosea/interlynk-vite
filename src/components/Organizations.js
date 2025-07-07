import { useLazyQuery, useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { timeSince, truncatedValue } from 'utils'
import { getItem } from 'utils/localStorageUtils'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import {
  Center,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  SimpleGrid,
  Stack
} from '@chakra-ui/react'
import { Button, SkeletonText, Text, useDisclosure } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { SwitchOrganization } from 'graphQL/Mutation'
import {
  AllOrganizations,
  GetOrganization,
  MyOrganizations
} from 'graphQL/Queries'

import {
  LuBuilding,
  LuChevronDown,
  LuExternalLink,
  LuPlus,
  LuX
} from 'react-icons/lu'

const Organizations = () => {
  const navigate = useNavigate()
  const org = getItem('organization')
  const parsedOrg = JSON.parse(org)
  const { organization, setOrganization } = useGlobalState()
  const isSuperAdmin = organization?.currentUser?.superAdmin

  const [switchOrg] = useMutation(SwitchOrganization)

  const [total, setTotal] = useState(0)
  const [options, setOptions] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  const [getOrg] = useLazyQuery(GetOrganization)
  const [getAllOrg, { loading: allOrgLoading }] = useLazyQuery(AllOrganizations)
  const [getMyOrg, { loading: myOrgLoading }] = useLazyQuery(MyOrganizations)

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

  const handleFetch = async () => {
    setSearchInput('')
    if (isSuperAdmin) {
      await getAllOrg({ variables: { first: 10, status: 'approved' } }).then(
        (res) => {
          if (res?.data?.allOrganizations?.nodes?.length > 0) {
            setTotal(res?.data?.allOrganizations?.totalCount || 0)
            setOptions(res?.data?.allOrganizations?.nodes)
          }
        }
      )
    } else {
      await getMyOrg({
        variables: { first: 10, invitationStatuses: ['ACCEPTED', 'INVITED'] }
      }).then((res) => {
        if (res?.data?.myOrganizations?.nodes?.length > 0) {
          setTotal(res?.data?.myOrganizations?.totalCount || 0)
          setOptions(res?.data?.myOrganizations?.nodes)
        }
      })
    }
  }

  const handleSearch = (e) => {
    const { value } = e.target
    setSearchInput(value)
    if (value === '') {
      handleFetch()
    }
  }

  const handleFilter = (e) => {
    const { value } = e.target
    if (e.key === 'Enter') {
      const filteredOptions = options.filter(
        (item) =>
          item.name.toLowerCase().includes(value.toLowerCase()) ||
          item.id.toLowerCase().includes(value.toLowerCase())
      )
      setOptions(filteredOptions)
    }
  }

  const OrgList = () => {
    if (options?.length === 0) return null
    return (
      <Stack maxHeight='300px' overflowY='auto'>
        {options?.map((item, index) => (
          <MenuOptionGroup key={index} value={organization?.id} type='radio'>
            <MenuItemOption value={item.id} onClick={() => onChange(item)}>
              <Text fontSize={'sm'}>
                {truncatedValue(item?.name, 20)}{' '}
                {isSuperAdmin && `(${item?.id.slice(-5)})`}
              </Text>
              {isSuperAdmin && (
                <Text fontSize={'xs'} color={secondaryTextColor}>
                  {timeSince(item?.updatedAt)}
                </Text>
              )}
            </MenuItemOption>
          </MenuOptionGroup>
        ))}
      </Stack>
    )
  }

  const isLoading = allOrgLoading || myOrgLoading
  const showAll = total > 10
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
      <Menu placement='bottom-end'>
        <MenuButton
          px={2}
          size='sm'
          as={Button}
          fontSize='sm'
          variant={'outline'}
          data-testid='org_menu'
          onClick={handleFetch}
          isLoading={!organization?.name}
          rightIcon={<LuChevronDown />}
          leftIcon={<LuBuilding fontSize={20} color={secondaryTextColor} />}
        >
          {truncatedValue(organization?.name, 20)}
        </MenuButton>
        <MenuList w={isSuperAdmin ? '280px' : '250px'}>
          <Stack w={'95%'} mx={'auto'}>
            <SimpleGrid gap={2} columns={showAll ? 2 : 1}>
              <MenuItem
                as={Button}
                fontSize={'sm'}
                onClick={onOpen}
                variant='outline'
                data-testid='add_org'
                leftIcon={<LuPlus size={18} />}
              >
                Add {!showAll && 'Organizaton'}
              </MenuItem>
              <MenuItem
                as={Button}
                fontSize={'sm'}
                hidden={!showAll}
                variant={'outline'}
                onClick={() => navigate(link)}
                rightIcon={<LuExternalLink size={18} />}
              >
                View all
              </MenuItem>
            </SimpleGrid>
            {isSuperAdmin && (
              <InputGroup>
                <Input
                  value={searchInput}
                  onChange={handleSearch}
                  onKeyDown={handleFilter}
                  placeholder='Search organization'
                />
                <InputRightElement hidden={searchInput === ''}>
                  <LuX size={18} onClick={() => setSearchInput('')} />
                </InputRightElement>
              </InputGroup>
            )}
          </Stack>
          <MenuDivider mt={2} hidden={isLoading} />
          {isLoading ? (
            <SkeletonText
              spacing='3'
              noOfLines={6}
              skeletonHeight='3'
              sx={{ mt: 2, mx: '2' }}
            />
          ) : (
            <>
              {options?.length > 0 ? (
                <OrgList />
              ) : (
                <Center py={2} fontSize={'sm'} color={secondaryTextColor}>
                  No record to display
                </Center>
              )}
            </>
          )}
        </MenuList>
      </Menu>

      {isOpen && <OrgModal data={null} isOpen={isOpen} onClose={onClose} />}
    </>
  )
}

export default Organizations
