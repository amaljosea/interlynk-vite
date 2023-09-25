// Chakra imports
import {
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  useDisclosure,
  Button,
  Flex,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Badge
} from '@chakra-ui/react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMComponentRow from 'components/Tables/SBOMComponentRow.js'
import React, { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import CardHeader from 'components/Card/CardHeader'
import { AddIcon } from '@chakra-ui/icons'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import { FaFilter } from 'react-icons/fa'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'
import HealthCheckRow from 'components/Tables/HealthCheckRow'

const SBOMTable = ({
  captions,
  data,
  refetch,
  handlePreviousPage,
  handleNextPage,
  status
}) => {
  const { healthCheckData } = useContext(GlobalContext)

  const textColor = useColorModeValue('gray.700', 'white')

  const location = useLocation()

  const customerView = location.pathname.startsWith('/customer')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isCompOpen,
    onOpen: onCompOpen,
    onClose: onCompClose
  } = useDisclosure()

  const btnRef = useRef(null)
  const compBtn = useRef(null)

  const [selectedKey, setSelectedKey] = useState('')
  const [filterPurl, setFilterPurl] = useState('')
  const [filterCpe, setFilterCpe] = useState('')
  const [filterResolution, setFilterResolution] = useState('')

  const activeFiltersCount = [filterPurl, filterCpe, filterResolution].filter(
    Boolean
  ).length

  return (
    <>
      <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <Tabs variant='enclosed' defaultIndex={1}>
          <TabList mt='20px'>
            <Tab _focus={{ outline: 'none' }}>General</Tab>
            <Tab _focus={{ outline: 'none' }}>Components</Tab>
            <Tab _focus={{ outline: 'none' }}>Health Checks</Tab>
          </TabList>
          <TabPanels>
            {/* general */}
            <TabPanel>
              <CardBody>
                <Table
                  __css={{ tableLayout: 'fixed', width: 'full' }}
                  variant='simple'
                  color={textColor}
                  size='sm'
                >
                  <Thead>
                    <Tr>
                      <Th></Th>
                      <Th></Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <GeneralDataRow
                      onOpen={onOpen}
                      setSelectedKey={setSelectedKey}
                      data={data}
                      status={status}
                    />
                  </Tbody>
                </Table>
              </CardBody>
            </TabPanel>
            {/* component */}
            <TabPanel>
              {!customerView && (
                <CardHeader>
                  <Flex
                    width={'100%'}
                    alignItems={'flex-end'}
                    justifyContent={'flex-end'}
                  >
                    <Button
                      ref={compBtn}
                      onClick={onCompOpen}
                      leftIcon={<AddIcon />}
                      colorScheme='blue'
                      variant='solid'
                      mb={6}
                      fontSize={'sm'}
                      isDisabled={data.lifecycle === 'signed'}
                    >
                      Component
                    </Button>
                  </Flex>
                </CardHeader>
              )}
              <CardBody overflowX={'scroll'}>
                <Table
                  // __css={{ tableLayout: 'fixed', width: 'full' }}
                  variant='simple'
                  color={textColor}
                  size='sm'
                >
                  <Thead>
                    <Tr my='.8rem' pl='0px'>
                      {captions.map((caption, idx) => {
                        return (
                          <Th key={idx} ps={idx === 0 ? '0px' : null} pb={4}>
                            <Box>{caption}</Box>
                          </Th>
                        )
                      })}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.components.nodes.map((row, index) => {
                      return (
                        <SBOMComponentRow
                          key={index}
                          id={row.id}
                          type={row.kind}
                          lifecycle={data.lifecycle}
                          sbomId={data.id}
                          component={row.name}
                          version={row.version}
                          purl={row.purl}
                          group={row.group}
                          licenses={row.licenses}
                          primary={row.primary}
                          internal={row.internal}
                          cpes={row.cpes}
                          updatedAt={row.updatedAt}
                          uniqueId={row.uniqueId}
                          refetch={refetch}
                          suppliers={row.suppliers}
                          status={status}
                        />
                      )
                    })}
                  </Tbody>
                </Table>
              </CardBody>

              {data && (
                <Flex
                  flexDir={'row'}
                  gap={4}
                  alignItems={'center'}
                  mt={6}
                  justifyContent={'flex-start'}
                >
                  <Button
                    colorScheme='blue'
                    onClick={handlePreviousPage}
                    isDisabled={!data.components.pageInfo.hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <Button
                    colorScheme='blue'
                    onClick={handleNextPage}
                    isDisabled={!data.components.pageInfo.hasNextPage}
                  >
                    Next
                  </Button>
                </Flex>
              )}
            </TabPanel>
            {/* health check */}
            <TabPanel>
              <CardHeader>
                <Flex
                  width={'100%'}
                  alignItems={'flex-end'}
                  justifyContent={'flex-end'}
                  pos={'relative'}
                >
                  <Menu closeOnSelect={true}>
                    {activeFiltersCount > 0 && (
                      <Badge
                        variant='solid'
                        colorScheme='teal'
                        position={'absolute'}
                        right={-2}
                        top={-1.5}
                        zIndex={11}
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                    <MenuButton
                      as={Button}
                      colorScheme='blue'
                      fontWeight='normal'
                      leftIcon={<FaFilter size={18} />}
                    >
                      Filter
                    </MenuButton>
                    <MenuList minWidth='240px'>
                      <MenuOptionGroup
                        title='Severity'
                        type='radio'
                        value={filterPurl}
                        onChange={(value) => setFilterPurl(value)}
                      >
                        {['Critical', 'High', 'Medium', 'Low'].map(
                          (p, index) => (
                            <MenuItemOption
                              value={p}
                              key={index}
                              fontSize={'sm'}
                            >
                              {p}
                            </MenuItemOption>
                          )
                        )}
                      </MenuOptionGroup>
                      <MenuOptionGroup
                        title='Short Desc'
                        type='radio'
                        value={filterResolution}
                        onChange={(value) => setFilterResolution(value)}
                      >
                        {[
                          'Primary Component',
                          'Component Name',
                          'Supplier Name',
                          'Unique Identifier',
                          'Author Name',
                          'Timestamp'
                        ].map((p, index) => (
                          <MenuItemOption value={p} key={index} fontSize={'sm'}>
                            {p}
                          </MenuItemOption>
                        ))}
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                </Flex>
              </CardHeader>
              <CardBody overflowX={'scroll'}>
                <Table
                  // __css={{ tableLayout: 'fixed', width: 'full' }}
                  variant='simple'
                  color={textColor}
                  size='sm'
                  mt={6}
                >
                  <Thead>
                    <Tr my='.8rem' pl='0px'>
                      {[
                        'Health Check Id',
                        'Severity',
                        'Short Description',
                        'Long Description',
                        'Status'
                      ].map((caption, idx) => {
                        return (
                          <Th key={idx} ps={idx === 0 ? '0px' : null} pb={4}>
                            <Box>{caption}</Box>
                          </Th>
                        )
                      })}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {healthCheckData.length > 0 &&
                      healthCheckData.map((item, index) => (
                        <HealthCheckRow
                          key={index}
                          id={item.id}
                          severity={item.severity}
                          shortDesc={item.shortDesc}
                          longDesc={item.longDesc}
                          status={item.status}
                        />
                      ))}
                  </Tbody>
                </Table>
              </CardBody>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {data && isOpen && (
        <GeneralDataDrawer
          isOpen={isOpen}
          onClose={onClose}
          btnRef={btnRef}
          data={data}
          selectedKey={selectedKey}
          refetch={refetch}
        />
      )}

      {isCompOpen && data && (
        <ComponentDrawer
          isOpen={isCompOpen}
          onClose={onCompClose}
          btnRef={compBtn}
          component={''}
          version={''}
          license={''}
          type={''}
          cpes={[]}
          purl={''}
          primary={false}
          internal={false}
          refetch={refetch}
          suppliers={null}
          shortDesc={null}
        />
      )}
    </>
  )
}

export default SBOMTable
