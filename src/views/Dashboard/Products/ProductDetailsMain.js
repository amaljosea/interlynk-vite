import { gql, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Flex, Skeleton, Text, useDisclosure } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import EnvironmentDrawer from 'components/Drawer/EnvironmentDrawer'

import { useGlobalState } from 'hooks/useGlobalState'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { GetProjectSettings } from 'graphQL/Queries'

import { ProductGraphs } from './ProductGraphs'
import ProductActions from './components/ProductActions'
import ProductInfo from './components/ProductInfo'
import ProductTabs from './components/ProductTabs'

const GetProjectDetails = gql`
  query GetProjectDetails($id: Uuid!) {
    projectGroup(id: $id) {
      id
      description
      enabled
      name
      defaultProject {
        id
      }
      projects {
        id
        name
        sbomsCount
        projectGroup {
          name
        }
      }
    }
  }
`

const ProductDetailsMain = () => {
  const params = useParams()
  const productId = params.productid
  const productGroupId = params.productgroupid
  const sbomId = params.sbomid

  const { dispatch, envName } = useGlobalState()
  const { setIsOpen, setCurrentStep } = useTour()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const activeTour = localStorage.getItem('activeTour')

  const { prodVulnDispatch } = dispatch
  const [activeEnv, setActiveEnv] = useState(productId || '')

  // GET PROJECT DATA
  const { data, loading, error } = useQuery(GetProjectDetails, {
    variables: { id: productGroupId }
  })

  const { name, description, projects } = data?.projectGroup || ''

  const ENV = useDisclosure()

  useEffect(() => {
    if (sbomId === null) {
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodVulnDispatch, sbomId])

  useEffect(() => {
    if (envName && projects) {
      const env = projects?.find((item) => item.name === envName)
      setActiveEnv(env?.id)
    }
  }, [projects, envName])

  useEffect(() => {
    if (shouldShowDemoFeatures) {
      if (activeTour === 'products') {
        document?.body?.classList.add('no-scroll')
        if (data) {
          setCurrentStep(1)
          setIsOpen(true)
        }
      } else {
        document?.body?.classList.remove('no-scroll')
        setIsOpen(false)
      }
    }
  }, [data, activeTour, setCurrentStep, setIsOpen, shouldShowDemoFeatures])

  const { data: settings, loading: settingsLoading } = useQuery(
    GetProjectSettings,
    {
      variables: { id: activeEnv }
    }
  )

  const { projectSetting } = settings?.project || ''

  if (loading) {
    return (
      <Card>
        <Flex width={'100%'} gap={4} direction={'row'}>
          <Skeleton width={'100%'} height='30px' />
          <Skeleton width={'100%'} height='30px' />
        </Flex>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDirection={'column'} alignItems={'flex-start'} gap={6}>
        {/* INFO SECTION */}
        <Card
          display={data ? 'block' : 'none'}
          className='product-details'
          minH={'100px'}
        >
          <CardBody>
            <Grid
              width={'100%'}
              templateColumns='repeat(12, 1fr)'
              alignItems={'top'}
              gap={10}
            >
              {/* PRODUCT INFORMATIONS */}
              <GridItem colSpan={8}>
                <ProductInfo
                  settings={projectSetting}
                  data={{ name, description }}
                />
              </GridItem>
              {/* PRODUCT ACTIONS */}
              <GridItem colSpan={4}>
                <ProductActions data={data?.projectGroup} />
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
        {/* PRODUCT GRAPHS */}
        {shouldShowDemoFeatures && <ProductGraphs />}
        {/* TAB SECTION */}
        <Card display={data ? 'block' : 'none'}>
          <CardBody>
            <ProductTabs
              activeEnv={activeEnv}
              data={data?.projectGroup}
              settings={projectSetting}
              settingsLoading={settingsLoading}
            />
          </CardBody>
        </Card>
      </Flex>

      {/* ENV LIST */}
      {ENV.isOpen && (
        <EnvironmentDrawer
          data={data}
          isOpen={ENV.isOpen}
          onClose={ENV.onClose}
          activeEnv={activeEnv}
          setActiveEnv={setActiveEnv}
        />
      )}
    </>
  )
}

export default ProductDetailsMain
