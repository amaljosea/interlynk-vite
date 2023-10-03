import { useQuery } from '@apollo/client'
import { AddIcon } from '@chakra-ui/icons'
import { Button, Flex, useDisclosure } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import SBOMDrawer from 'components/Drawer/SBOMDrawer'
import { GetAllShareLynks } from 'graphQL/Queries'
import { useRef, useEffect } from 'react'
import LynkTable from './components/LynkTable'

const Sharelynk = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()

  const { data, refetch, loading } = useQuery(GetAllShareLynks)

  // useEffect(() => {
  //   if (data) {
  //     console.log(`Data`, data)
  //   }
  // }, [data])

  return (
    <>
      <Flex
        flexDirection='column'
        width={'100%'}
        alignItems={'center'}
        px={2}
        justifyContent={'space-between'}
        pt={{ base: '120px', md: '74px' }}
      >
        <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
          <CardHeader mb={5}>
            <Flex
              width={'100%'}
              direction={'row'}
              justifyContent={'flex-end'}
              alignItems={'center'}
            >
              <Button
                width={'120px'}
                colorScheme='blue'
                fontSize={'sm'}
                leftIcon={<AddIcon />}
                onClick={onOpen}
              >
                Share Lynk
              </Button>
            </Flex>
          </CardHeader>
          <CardBody mt={5}>
            {data && (
              <LynkTable
                captions={[
                  'Active',
                  'Users',
                  'Images',
                  'Products',
                  'Updated At',
                  'Link',
                  'Actions'
                ]}
                data={data}
                refetch={refetch}
              />
            )}
          </CardBody>
        </Card>
      </Flex>

      {/* share lynk drawer */}
      {isOpen && (
        <SBOMDrawer
          id={null}
          isOpen={isOpen}
          onClose={onClose}
          btnRef={btnRef}
          refetch={refetch}
          shareUsers={[]}
          contents={[]}
        />
      )}
    </>
  )
}

export default Sharelynk
