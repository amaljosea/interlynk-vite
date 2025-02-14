import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Flex } from '@chakra-ui/react'
import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

const GetProjectGroups = gql`
  query GetProjetGroups {
    organization {
      projectGroups(first: 500) {
        nodes {
          id
          name
          projects {
            name
            sboms {
              projectVersion
            }
          }
        }
      }
    }
  }
`

const Filters = ({ filters, setFilters }) => {
  const params = useParams()
  const { result, projectGroupIds, projectName, projectVersion } = filters || {}

  const { data: groups } = useQuery(GetProjectGroups, {
    skip: params.policyid ? false : true
  })

  const { nodes } = groups?.organization?.projectGroups || []
  const productOptions = nodes?.map((item) => item?.id)
  const getProductName = (id) => nodes?.find((item) => item?.id === id)?.name

  const versionList = nodes?.reduce((acc, node) => {
    return node.projects.reduce((projAcc, project) => {
      return projAcc.concat(project.sboms.map((sbom) => sbom.projectVersion))
    }, acc)
  }, [])
  const sbomVersions = versionList?.length > 0 ? [...new Set(versionList)] : []

  const filteredByProducts =
    projectGroupIds?.length > 0
      ? nodes?.filter((item) => projectGroupIds?.includes(item?.id))
      : nodes

  const filteredByEnvs =
    projectName?.length > 0
      ? filteredByProducts
          ?.map((group) => ({
            ...group,
            projects: group?.projects?.filter((project) =>
              projectName?.includes(project?.name)
            )
          }))
          ?.filter((group) => group?.projects?.length > 0)
      : filteredByProducts

  const filteredVersions = filteredByEnvs?.length
    ? filteredByEnvs.flatMap((group) =>
        group?.projects?.flatMap((project) =>
          project?.sboms?.map((sbom) => sbom?.projectVersion)
        )
      )
    : []

  const uniqueList =
    filteredVersions?.length > 0 ? [...new Set(filteredVersions)] : []
  const versionOptions =
    uniqueList?.length > 0
      ? uniqueList?.filter((item) => sbomVersions?.includes(item))
      : []

  const onFilterProduct = async (value) => {
    const filterValue = value?.includes('all') ? [] : value
    setFilters((oldFilters) => ({
      ...oldFilters,
      projectGroupIds: filterValue
    }))
  }

  const onFilterVersion = async (value) => {
    const filterValue = value?.includes('all') ? [] : value
    setFilters((oldFilters) => ({
      ...oldFilters,
      projectVersion: filterValue
    }))
  }
  const onFilterEnv = async (value) => {
    const filterValue = value?.includes('all') ? [] : value
    setFilters((oldFilters) => ({
      ...oldFilters,
      projectName: filterValue
    }))
  }

  const onFilterResult = (value) => {
    const filterValue = value?.includes('all') ? [] : value
    setFilters((oldFilters) => ({
      ...oldFilters,
      result: filterValue
    }))
  }

  const envOptions = ['default', 'development', 'production']

  const getStatus = (category) => {
    switch (category) {
      case 'products':
        return (
          projectGroupIds?.length !== 0 && !projectGroupIds?.includes('all')
        )
      case 'versions':
        return projectVersion?.length !== 0 && !projectVersion?.includes('all')
      case 'envs':
        return projectName?.length !== 0 && !projectName?.includes('all')
      default:
        return false
    }
  }

  return (
    <Flex gap={2} alignItems={'center'}>
      {/* PRODUCTS */}
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
            value={projectGroupIds}
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
      {/* ENVIRONMENT */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Environment'} active={getStatus('envs')} />
        <CustomList
          value={projectName}
          onChange={onFilterEnv}
          options={envOptions}
        />
      </Menu>
      {/* VERSIONS */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Versions'} active={getStatus('versions')} />
        {sbomVersions?.length > 0 && (
          <CustomList
            value={projectVersion}
            options={versionOptions}
            onChange={onFilterVersion}
          />
        )}
      </Menu>
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Result'}
          active={result?.length !== 0 && !result?.includes('all')}
        />
        <MenuList
          minH={'auto'}
          maxH={'300px'}
          overflowY={'scroll'}
          fontSize={'sm'}
        >
          <MenuOptionGroup
            type='checkbox'
            value={result}
            onChange={onFilterResult}
          >
            {['all', 'detected', 'not_detected'].map((item, index) => (
              <MenuItemOption
                key={index}
                value={item}
                fontSize={'sm'}
                textTransform={'capitalize'}
              >
                {item?.replace('_', ' ')}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default Filters
