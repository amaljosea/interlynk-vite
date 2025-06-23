import { useLazyQuery, useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { timeSince, truncatedValue } from 'utils'
import { getItem } from 'utils/localStorageUtils'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import {
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
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

import { LuBuilding, LuChevronDown, LuPlus } from 'react-icons/lu'

const Organizations = () => {
  const navigate = useNavigate()
  const org = getItem('organization')
  const parsedOrg = JSON.parse(org)
  const { organization, setOrganization } = useGlobalState()
  const isSuperAdmin = organization?.currentUser?.superAdmin

  const [switchOrg] = useMutation(SwitchOrganization)

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
    if (isSuperAdmin) {
      await getAllOrg({ variables: { first: 100, status: 'approved' } }).then(
        (res) => {
          if (res?.data?.allOrganizations?.nodes?.length > 0) {
            setOptions(res?.data?.allOrganizations?.nodes)
          }
        }
      )
    } else {
      await getMyOrg({
        variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
      }).then((res) => {
        if (res?.data?.myOrganizations?.nodes?.length > 0) {
          setOptions(res?.data?.myOrganizations?.nodes)
        }
      })
    }
    setSearchInput('')
  }

  const handleSearch = (e) => {
    const { value } = e.target
    setSearchInput(value)
    if (value.trim() === '') {
      handleFetch()
    } else {
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
      <Stack maxHeight='330px' overflowY='auto'>
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
        <MenuList w={'280px'}>
          <Stack w={'95%'} mx={'auto'}>
            <MenuItem
              w={'100%'}
              fontSize='sm'
              onClick={onOpen}
              borderRadius={'md'}
              data-testid='add_org'
              icon={<LuPlus size={18} />}
            >
              Add Organization
            </MenuItem>
            {isSuperAdmin && (
              <Input
                value={searchInput}
                onChange={handleSearch}
                placeholder='Search organization'
                hidden={options?.length === 0 || allOrgLoading || myOrgLoading}
              />
            )}
          </Stack>
          <MenuDivider hidden={options?.length === 0} />
          {allOrgLoading || myOrgLoading ? (
            <SkeletonText
              spacing='3'
              noOfLines={6}
              skeletonHeight='3'
              sx={{ mt: 2, mx: '2' }}
            />
          ) : (
            <OrgList />
          )}
        </MenuList>
      </Menu>

      {isOpen && <OrgModal isOpen={isOpen} onClose={onClose} />}
    </>
  )
}

export default Organizations
