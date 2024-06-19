import React, { useState } from 'react'

import {
  Box,
  Center,
  Flex,
  Menu,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CheckMark from 'components/Misc/CheckMark'
import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

const Analytics = () => {
  const [envs, setEnvs] = useState([])
  const [products, setProducts] = useState([])
  const [versions, setVersions] = useState([])
  const [durations, setDurations] = useState('')

  const bgColor = useColorModeValue('gray.200', 'gray.800')

  const onFilterEnv = (value) => {
    setEnvs(value?.includes('all') ? [] : value)
  }

  const onFilterProduct = (value) => {
    setProducts(value?.includes('all') ? [] : value)
  }

  const onFilterVersion = (value) => {
    setVersions(value?.includes('all') ? [] : value)
  }

  const onFilterDuration = (value) => {
    setDurations(value)
  }

  return (
    <Card>
      <CardBody>
        <Flex
          gap={6}
          width={'100%'}
          flexDir={'column'}
          alignItems={'flex-start'}
        >
          {/* FILTERS */}
          <Flex alignItems={'center'} gap={4}>
            {/* ENVIRONMENT */}
            <Box width={'fit-content'} position={'relative'}>
              <Menu closeOnSelect={false}>
                {envs.length !== 0 && <CheckMark />}
                <MenuHeading title={'Environment'} />
                <CustomList
                  value={envs}
                  onChange={onFilterEnv}
                  options={['Default', 'Development', 'Production']}
                />
              </Menu>
            </Box>
            {/* PRODUCT */}
            <Box width={'fit-content'} position={'relative'}>
              <Menu closeOnSelect={false}>
                {products.length !== 0 && <CheckMark />}
                <MenuHeading title={'Products'} />
                <CustomList
                  value={products}
                  onChange={onFilterProduct}
                  options={['dropwizard', 'biotronix', 'calibrator']}
                />
              </Menu>
            </Box>
            {/* VERSION */}
            <Box width={'fit-content'} position={'relative'}>
              <Menu closeOnSelect={false}>
                {versions.length !== 0 && <CheckMark />}
                <MenuHeading title={'Versions'} />
                <CustomList
                  value={versions}
                  onChange={onFilterVersion}
                  options={['1.0.1', '2.0.31', '3.5.1', '2.0.32']}
                />
              </Menu>
            </Box>
            {/* TIME DURATION */}
            <Box width={'fit-content'} position={'relative'}>
              <Menu closeOnSelect={false}>
                <MenuHeading title={'Duration'} />
                <CustomList
                  type='radio'
                  value={durations}
                  onChange={onFilterDuration}
                  options={['7 Days', 'Last 30 Days', 'last 90 Days']}
                />
              </Menu>
            </Box>
          </Flex>
          {/* GRAPHS */}
          <SimpleGrid width={'100%'} columns={2} spacing='24px'>
            <Center width={'100%'} height={400} bg={bgColor}></Center>
            <Center width={'100%'} height={400} bg={bgColor}></Center>
          </SimpleGrid>
          <Center width={'100%'} height={400} bg={bgColor}></Center>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default Analytics
