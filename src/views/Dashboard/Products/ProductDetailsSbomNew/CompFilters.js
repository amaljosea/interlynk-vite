import { gql, useLazyQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { supportLevels } from 'variables/general'

import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import {
  Menu,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import LynkDate from 'components/LynkDate'
import CustomList from 'components/Misc/CustomList'
import LynkMenuList from 'components/Misc/LynkMenuList'
import LynkSwitch from 'components/Misc/LynkSwitch'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useRouteFlags } from 'hooks/useRouteFlags'

const GetEcosystems = gql`
  query GetEcosystems($productId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        ecosystems
      }
    }
  }
`

const GetKinds = gql`
  query GetKinds($productId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        kinds
      }
    }
  }
`

const GetLicenses = gql`
  query GetLicenses($productId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        licenses
      }
    }
  }
`

const CompFilters = ({ reset }) => {
  const params = useParams()
  const productId = params?.productid
  const sbomId = params?.sbomid
  const { prodCompState, dispatch } = useGlobalState()
  const { ecosystems, kinds, licenses, scope, direct, include, supportLevel } =
    prodCompState
  const { prodCompDispatch } = dispatch

  const [compEcosystems, setCompEcosystems] = useState(['All'])
  // const [compSupport, setCompSupport] = useState(['All'])
  const [compLicenses, setCompLicenses] = useState(['All'])
  const [compKinds, setCompKinds] = useState(['All'])

  // GET COMPONENT FILTER HEADS
  const [getEcosystems, { loading: ecoLoading }] = useLazyQuery(GetEcosystems)
  const [getKinds, { loading: kindLoading }] = useLazyQuery(GetKinds)
  const [getLicenses, { loading: licLoading }] = useLazyQuery(GetLicenses)

  const { isFreeTier } = useGlobalQueryContext()
  const { isCustomerView } = useRouteFlags()

  const variables = {
    productId,
    sbomId
  }

  const onFilterSupport = (value) => {
    prodCompDispatch({ type: 'FILTER_SUPPORT', payload: value })
    reset()
  }

  const onFilterType = (value) => {
    prodCompDispatch({ type: 'FILTER_SCOPE', payload: value })
    reset()
  }

  const onFilterDirect = (e) => {
    prodCompDispatch({ type: 'FILTER_DIRECT', payload: e.target.checked })
    reset()
  }

  const onFilterInclude = (value) => {
    prodCompDispatch({ type: 'FILTER_INCLUDE', payload: value })
    reset()
  }

  const onCheckFilters = (type) => {
    switch (type) {
      case 'Ecosystem':
        getEcosystems({ variables }).then((res) => {
          if (res?.data?.sbom?.filters?.ecosystems?.length > 0) {
            setCompEcosystems(['All', ...res.data.sbom.filters.ecosystems])
          }
        })
        break
      case 'Kind':
        getKinds({ variables }).then((res) => {
          if (res?.data?.sbom?.filters?.kinds?.length > 0) {
            setCompKinds(['All', ...res.data.sbom.filters.kinds])
          }
        })
        break
      case 'License':
        getLicenses({ variables }).then((res) => {
          if (res?.data?.sbom?.filters?.licenses?.length > 0) {
            setCompLicenses(['All', ...res.data.sbom.filters.licenses])
          }
        })
        break
    }
  }

  const onFilter = (type, value) => {
    switch (type) {
      case 'Ecosystem':
        prodCompDispatch({
          type: 'FILTER_ECOSYSTEM',
          payload: value
        })
        break
      case 'Kind':
        prodCompDispatch({
          type: 'FILTER_KIND',
          payload: value
        })
        break
      case 'Licenses':
        prodCompDispatch({
          type: 'FILTER_LICENSE',
          payload: value
        })
        break
      case 'Suppliers':
        prodCompDispatch({
          type: 'FILTER_SUPPLIER',
          payload: value
        })
        break
    }
    reset()
  }

  return (
    <Flex gap={2} alignItems={'center'}>
      {/* ECOSYSTEM */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Ecosystem'}
          active={ecosystems?.length !== 0}
          onClick={() => onCheckFilters('Ecosystem')}
        />
        <LynkMenuList
          type='Ecosystem'
          value={ecosystems}
          onFilter={onFilter}
          loading={ecoLoading}
          options={compEcosystems}
        />
      </Menu>
      {/* KIND */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Type'}
          active={kinds?.length !== 0}
          onClick={() => onCheckFilters('Kind')}
        />
        <LynkMenuList
          type='Kind'
          value={kinds}
          onFilter={onFilter}
          options={compKinds}
          loading={kindLoading}
        />
      </Menu>
      {/* LICENSES */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Licenses'}
          active={licenses?.length !== 0}
          onClick={() => onCheckFilters('License')}
        />
        <LynkMenuList
          type='Licenses'
          value={licenses}
          onFilter={onFilter}
          loading={licLoading}
          options={compLicenses}
        />
      </Menu>
      {/* SUPPORT LEVEL */}
      {!isFreeTier && !isCustomerView && (
        <Menu closeOnSelect={false} isLazy>
          <MenuHeading
            title={'Support'}
            active={supportLevel?.length !== 0 && !supportLevel.includes('all')}
          />
          <MenuList
            minH='auto'
            maxH={'350px'}
            minW={'300px'}
            fontSize={'sm'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type={'checkbox'}
              value={supportLevel}
              onChange={onFilterSupport}
            >
              {supportLevels?.map((item) => (
                <MenuItemOption
                  key={item?.id}
                  fontSize={'sm'}
                  value={item?.value}
                >
                  {item?.label}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
            <MenuDivider hidden />
            <Flex hidden flexDirection={'column'} alignItems={'flex-start'}>
              <Stack pl={8}>
                <Text>Start Date</Text>
                <LynkDate />
                <Text>End Date</Text>
                <LynkDate />
              </Stack>
              <Button ml={8} my={3} size='sm'>
                Submit
              </Button>
            </Flex>
          </MenuList>
        </Menu>
      )}
      {/* TYPE */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Visibility'}
          active={scope !== '' && scope !== 'all'}
        />
        <CustomList
          type='radio'
          options={['primary', 'internal']}
          value={scope}
          onChange={onFilterType}
        />
      </Menu>
      {/* INCLUDE */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Include'} active={include.length !== 0} />
        <MenuList fontSize={'sm'}>
          <MenuOptionGroup
            type='checkbox'
            value={include}
            onChange={onFilterInclude}
          >
            <MenuItemOption value={'parts'} fontSize={'sm'}>
              Parts
            </MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      {/* DIRECT */}
      <Flex align='center' gap={2}>
        <LynkSwitch
          id='isDirect'
          isChecked={direct}
          onChange={onFilterDirect}
        />
        <Text fontSize='sm'>Direct Only</Text>
      </Flex>
    </Flex>
  )
}

export default CompFilters
