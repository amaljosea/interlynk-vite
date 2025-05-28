import { useLazyQuery, useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { timeSince, truncatedValue } from 'utils'
import { getItem } from 'utils/localStorageUtils'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons'
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Tooltip
} from '@chakra-ui/react'
import { Button, SkeletonText, Text, useDisclosure } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { SwitchOrganization } from 'graphQL/Mutation'
import {
  AllOrganizations,
  GetOrgConnections,
  MyOrganizations
} from 'graphQL/Queries'

import { LuBuilding } from 'react-icons/lu'

const Organizations = () => {
  const navigate = useNavigate()
  const org = getItem('organization')
  const parsedOrg = JSON.parse(org)
  const { organization, setOrganization } = useGlobalState()
  const isSuperAdmin = organization?.currentUser?.superAdmin

  const [switchOrg] = useMutation(SwitchOrganization)

  const [options, setOptions] = useState([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  const [getAllOrg, { loading: allOrgLoading }] = useLazyQuery(AllOrganizations)
  const [getMyOrg, { loading: myOrgLoading }] = useLazyQuery(MyOrganizations)
  const [getOrg] = useLazyQuery(GetOrgConnections)

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

  const OrgList = () => {
    if (options?.length === 0) return null
    return (
      <>
        {options?.map((item, index) => (
          <MenuOptionGroup key={index} value={organization?.id} type='radio'>
            <MenuItemOption value={item.id} onClick={() => onChange(item)}>
              <Text fontSize={'sm'}>
                <Tooltip label={item?.name}>
                  {truncatedValue(item?.name, 20)}{' '}
                </Tooltip>
                {isSuperAdmin && `(${item?.id.slice(-5)})`}
              </Text>
              {isSuperAdmin && (
                <Text fontSize={'xs'}>{timeSince(item?.updatedAt)}</Text>
              )}
            </MenuItemOption>
          </MenuOptionGroup>
        ))}
      </>
    )
  }

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
          rightIcon={<ChevronDownIcon />}
          leftIcon={<LuBuilding fontSize={20} color={secondaryTextColor} />}
        >
          {truncatedValue(organization?.name, 20)}
        </MenuButton>
        <MenuList maxHeight='300px' overflowY='auto'>
          <MenuItem
            fontSize='sm'
            icon={<AddIcon />}
            onClick={onOpen}
            data-testid='add_org'
          >
            Add organization
          </MenuItem>
          <MenuDivider />
          {allOrgLoading || myOrgLoading ? (
            <SkeletonText mx='2' noOfLines={4} spacing='4' skeletonHeight='4' />
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
