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
  Input,
  Td,
  useDisclosure,
  Button,
  Flex,
  Box
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMComponentRow from 'components/Tables/SBOMComponentRow.js'
import React, { useRef, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import ShareLynkRow from 'components/Tables/ShareLynkRow'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import CardHeader from 'components/Card/CardHeader'
import { AddIcon, PlusSquareIcon } from '@chakra-ui/icons'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import { timeSince } from 'utils'

const SBOMTable = ({ captions, data, refetch, versionName, status }) => {
  const { SBOMLinksData } = useContext(GlobalContext)
  const textColor = useColorModeValue('gray.700', 'white')

  const location = useLocation()

  const customerView = location.pathname.startsWith('/customer')

  const link_captions = ['Active', 'Contains', 'Visits', 'Created', 'Link', '']

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isCompOpen,
    onOpen: onCompOpen,
    onClose: onCompClose
  } = useDisclosure()

  const btnRef = useRef(null)
  const compBtn = useRef(null)

  const [selectedKey, setSelectedKey] = useState('')

  return (
    <>
      <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <Tabs variant='enclosed'>
          <TabList mt='20px'>
            <Tab _focus={{ outline: 'none' }}>General</Tab>
            <Tab _focus={{ outline: 'none' }}>Components</Tab>
          </TabList>
          <TabPanels>
            {/* general */}
            <TabPanel>
              <CardBody>
                <Table
                  __css={{ 'table-layout': 'fixed', width: 'full' }}
                  variant='simple'
                  color={textColor}
                  size='sm'
                >
                  <Thead>
                    <Tr>
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
                    >
                      Component
                    </Button>
                  </Flex>
                </CardHeader>
              )}
              <CardBody overflowX={'scroll'}>
                <Table
                  __css={{ 'table-layout': 'fixed', width: 'full' }}
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
                    {data.components.map((row, index) => {
                      return (
                        <SBOMComponentRow
                          key={index}
                          id={row.id}
                          type={row.kind}
                          sbomId={data.id}
                          component={row.name}
                          version={row.version}
                          purl={row.purl}
                          licenses={row.licenses}
                          primary={row.primary}
                          internal={row.internal}
                          cpes={row.cpes}
                          updatedAt={row.updatedAt}
                          uniqueId={row.uniqueId}
                          refetch={refetch}
                          suppliers={row.suppliers}
                        />
                      )
                    })}
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
        />
      )}
    </>
  )
}

export default SBOMTable
