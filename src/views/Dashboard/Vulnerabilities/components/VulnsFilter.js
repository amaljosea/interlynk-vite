import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import LynkSwitch from 'components/Misc/LynkSwitch'
import MenuHeading from 'components/Misc/MenuHeading'

const VulnFilters = ({ setFilter, sbomVersions, prodGroups }) => {
  const params = useParams()

  const getProductName = (id) =>
    prodGroups?.find((item) => item?.id === id)?.name

  const [products, setProducts] = useState([])
  const onFilterProduct = async (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setProducts(value?.includes('all') ? [] : value)
    setFilter((oldFilters) => ({
      ...oldFilters,
      projectGroupIds: filterValue
    }))
  }

  const [versions, setVersions] = useState([])
  const onFilterVesion = async (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setVersions(value?.includes('all') ? [] : value)
    setFilter((oldFilters) => ({
      ...oldFilters,
      versions: filterValue
    }))
  }
  const [envs, setEnvs] = useState([])
  const onFilterEnv = async (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setEnvs(value?.includes('all') ? [] : value)
    setFilter((oldFilters) => ({
      ...oldFilters,
      projectNames: filterValue
    }))
  }

  const [isComplete, setIsComplete] = useState(false)
  const onFilterComplete = async (e) => {
    setIsComplete(e.target.checked)
    setFilter((oldFilters) => ({
      ...oldFilters,
      vexComplete: e?.target?.checked ? false : undefined
    }))
  }

  const productOptions = prodGroups?.map((item) => item?.id)
  const versionOptions = sbomVersions?.map((item) => item)
  const envOptions = ['default', 'development', 'production', 'others']

  const getStatus = (category) => {
    switch (category) {
      case 'products':
        return products?.length !== 0 && !products?.includes('all')
      case 'versions':
        return versions?.length !== 0 && !versions?.includes('all')
      case 'envs':
        return envs?.length !== 0 && !envs?.includes('all')
    }
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={2}>
      {/* PRODUCTS */}
      <Box
        width={'fit-content'}
        position={'relative'}
        hidden={params?.productid}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Products'} active={getStatus('products')} />
          <MenuList
            minH='auto'
            maxH={'350px'}
            overflowY={'scroll'}
            fontSize={'sm'}
          >
            <MenuOptionGroup
              type={'checkbox'}
              value={products}
              onChange={onFilterProduct}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {productOptions?.map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  maxW={'300px'}
                  fontSize={'sm'}
                  wordBreak={'break-all'}
                  textTransform={'capitalize'}
                  name={item}
                >
                  {getProductName(item) || ''}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* ENVIRONMENT */}
      <Box
        width={'fit-content'}
        position={'relative'}
        hidden={params?.productid}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Environment'} active={getStatus('envs')} />
          <CustomList
            value={envs}
            onChange={onFilterEnv}
            options={envOptions}
          />
        </Menu>
      </Box>
      {/* VERSIONS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Versions'} active={getStatus('versions')} />
          {sbomVersions?.length > 0 && (
            <CustomList
              value={versions}
              options={versionOptions}
              onChange={onFilterVesion}
            />
          )}
        </Menu>
      </Box>
      {/* INCOMPLETE STATUS */}
      <Flex align='center' gap={2}>
        <LynkSwitch
          id='incompleteStatus'
          isChecked={isComplete}
          onChange={onFilterComplete}
        />
        <Text>Incomplete Only</Text>
      </Flex>
    </Stack>
  )
}

export default VulnFilters
