import {
  Box,
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tbody,
  Th,
  Thead,
  Tooltip,
  Tr
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { useState } from 'react'
import { CSVLink } from 'react-csv'
import { BiExport } from 'react-icons/bi'
import { BsFilterRight } from 'react-icons/bs'
import { vuln_captions } from 'utils'
import VulnerabilityRow from 'components/Tables/VulnerabilityRow.js'
import { useMutation } from '@apollo/client'
import { ImageUpdate } from 'graphQL/Mutation'
import Cookies from 'js-cookie'

const ImageLogs = ({ data, refetch, imageInfo }) => {
  const signedParams = Cookies.get(`signedParamId`)

  const [searchInput, setSearchInput] = useState('')

  const [checkedRows, setCheckedRows] = useState([])

  const [imageUpdate, { loading }] = useMutation(ImageUpdate)

  const flattenedData =
    data.imageVersion.imageVulns.nodes.length > 0 &&
    data.imageVersion.imageVulns.nodes.map((item, index) => {
      const allVulData = {
        ID: index + 1,
        CVEID: item.cveId,
        SEVERITY: item.severity[0],
        CVSS: item.cvss?.v3Score,
        COMPONENT: item.component?.name,
        VERSION: item.component?.version,
        FIXED_COMPONENT: item.component?.fixedInVersion[0],
        FIXED_PRODUCT: item.fixedInImage,
        SCANNER: item.scanners?.map((scanner) => scanner.name),
        VEX_JUSTIFICATION: item.vexVuln?.vexJustification?.name,
        VEX_STATUS: item.vexVuln?.vexStatus?.name
      }

      return allVulData
    })

  const refreshImage = async () => {
    try {
      await imageUpdate({
        variables: {
          id: data.imageVersion.id,
          scanRefresh: true
        }
      }).then(() =>
        refetch({
          signedParams: signedParams
        })
      )
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <Tabs variant='enclosed'>
        <TabList mt='20px'>
          <Tab _focus={{ outline: 'none' }}>Vulnerabilities</Tab>
        </TabList>
        <TabPanels>
          {/* vulnerabilities */}
          <TabPanel px={0}>
            {/* header */}
            <CardHeader mt={2} mb={4}>
              <Flex
                width={'100%'}
                gap={2}
                direction={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Flex gap={2} direction={'row'} alignItems={'center'}>
                  <Input
                    placeholder='Search'
                    width={'300px'}
                    size='md'
                    id='vulnerabilities'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <Menu closeOnSelect={true}>
                    <MenuButton
                      as={Button}
                      colorScheme='blue'
                      leftIcon={<BsFilterRight size={24} />}
                    >
                      Filter
                    </MenuButton>
                    <MenuList minWidth='240px'>
                      <MenuOptionGroup title='Resolution' type='radio'>
                        {['Unresolved', 'Total'].map((p, index) => (
                          <MenuItemOption value={p} key={index} fontSize={'sm'}>
                            {p}
                          </MenuItemOption>
                        ))}
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                </Flex>
                <Flex gap={2} direction={'row'}>
                  <Box as={Flex} direction={'row'} gap={2}>
                    <Tooltip label='Export'>
                      <Button colorScheme='blue' size='md'>
                        <CSVLink
                          data={flattenedData.length > 0 ? flattenedData : ''}
                          filename='vulnerabilities.csv'
                        >
                          <BiExport />
                        </CSVLink>
                      </Button>
                    </Tooltip>
                    <Button colorScheme='blue' size='md' onClick={refreshImage}>
                      Refresh
                    </Button>
                  </Box>
                </Flex>
              </Flex>
            </CardHeader>
            {/* body */}
            <CardBody>
              {data.imageVersion.imageVulns.nodes.length > 0 && (
                <Table variant='simple' size='sm'>
                  <Thead>
                    <Tr my='.8rem' pl='0px'>
                      {vuln_captions.map((item, index) => (
                        <Th key={index} py={4}>
                          <Box>{item}</Box>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.imageVersion.imageVulns.nodes.map((row, idx) => {
                      return (
                        <VulnerabilityRow
                          key={idx}
                          id={idx}
                          severity={row.severity[0]}
                          component={row.component.name}
                          version={row.component.version}
                          cvss={row.cvss.v3Score}
                          cve={row.cveId}
                          fixed_component={row.component.fixedInVersion}
                          fixed_product={row.vexVuln?.fixedByImageVersion?.name}
                          description={row.component.name}
                          status={row.vexVuln?.vexStatus}
                          justify={row.vexVuln?.vexJustification}
                          scanner={row.scanners}
                          shared_data={row.component.name}
                          versions={row.component.name}
                          refetch={refetch}
                          isRefresh={loading}
                          imgVersionId={data.imageVersion.id}
                          imageInfo={imageInfo}
                          checkedRows={checkedRows}
                          setCheckedRows={setCheckedRows}
                        />
                      )
                    })}
                  </Tbody>
                </Table>
              )}
            </CardBody>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default ImageLogs
