import { useMutation, useQuery } from '@apollo/client'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isCustomerView, truncatedValue } from 'utils'
import OrgModal from 'views/Dashboard/Profile/components/OrgModal'

import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons'
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'
import { Button, useDisclosure } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { SwitchOrganization } from 'graphQL/Mutation'
import { AllOrganizations, MyOrganizations } from 'graphQL/Queries'

import { FaBuilding } from 'react-icons/fa'

const Organizations = () => {
  const navigate = useNavigate()
  const customerView = isCustomerView()
  const { organization } = useGlobalState()
  const isSuperAdmin = organization?.currentUser?.superAdmin

  const [switchOrg] = useMutation(SwitchOrganization)

  const [options, setOptions] = useState([])
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: allOrgs } = useQuery(AllOrganizations, {
    skip: isSuperAdmin === true ? false : true,
    variables: { first: 100, status: 'approved' }
  })

  const { data: myOrgs } = useQuery(MyOrganizations, {
    skip: isSuperAdmin === true || customerView ? true : false,
    variables: { invitationStatuses: ['ACCEPTED', 'INVITED'] }
  })

  const { nodes: allOrgList } = allOrgs?.allOrganizations || ''
  const { nodes: myOrgList } = myOrgs?.myOrganizations || ''
  const organisationList = isSuperAdmin ? allOrgList : myOrgList

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
        }, 500)
      })
  }

  useEffect(() => {
    if (organisationList?.length > 0) {
      setOptions(organisationList)
    }
  }, [organisationList])

  return (
    <>
      <Menu placement='bottom-end'>
        <MenuButton
          size='sm'
          as={Button}
          fontSize='sm'
          colorScheme='blue'
          isLoading={!organization?.name}
          leftIcon={<FaBuilding />}
          rightIcon={<ChevronDownIcon />}
        >
          {truncatedValue(organization?.name, 20)}
        </MenuButton>
        <MenuList maxHeight='300px' overflowY='auto'>
          <MenuItem fontSize='sm' icon={<AddIcon />} onClick={onOpen}>
            Add organization
          </MenuItem>
          <MenuDivider />
          {options?.map((item, index) => (
            <MenuOptionGroup
              key={index}
              value={organization?.name}
              type='radio'
            >
              <MenuItemOption
                fontSize='sm'
                value={item.name}
                onClick={() => onChange(item)}
              >
                {item.name}
              </MenuItemOption>
            </MenuOptionGroup>
          ))}
        </MenuList>
      </Menu>

      {isOpen && <OrgModal isOpen={isOpen} onClose={onClose} />}
    </>
  )
}

export default Organizations
