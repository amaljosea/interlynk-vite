import React, { useState } from 'react'

import { Flex, Text, useColorModeValue, useDisclosure } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import ViewAlert from 'components/Misc/ViewAlert'
import ActivitiesOverviewRow from 'components/Tables/ActivitiesOverviewRow'

import { FaEye } from 'react-icons/fa'

const ActivitiesOverview = ({ title, prodPermissions, data }) => {
  const textColor = useColorModeValue('gray.700', 'white')
  const [activeRow, setActiveRow] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isCpeOpen,
    onOpen: onCpeOpen,
    onClose: onCpeClose
  } = useDisclosure()

  if (prodPermissions?.value === false)
    return (
      <Card maxH='100%'>
        <Text mb={4} fontSize='lg' color={textColor} fontWeight='bold'>
          {title}
        </Text>
        <ViewAlert category='recent activities' />
      </Card>
    )

  return (
    <>
      <Card maxH='100%'>
        <Flex direction='column'>
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
            {title}
          </Text>
        </Flex>
        <CardBody mt={8} ps='20px' pe='0px' position='relative'>
          <Flex direction='column'>
            {data?.length > 0 &&
              data?.map((row, index) => {
                return (
                  <ActivitiesOverviewRow
                    key={index}
                    logo={FaEye}
                    event={row.event}
                    orig={row.orig}
                    updated={row.updated}
                    changedBy={row.changedBy}
                    date={row.updatedAt}
                    color={'gray'}
                    index={index}
                    arrLength={data?.length}
                    action={row.action}
                    onOpen={onOpen}
                    onCpeOpen={onCpeOpen}
                    setActiveRow={setActiveRow}
                  />
                )
              })}
          </Flex>
        </CardBody>
      </Card>

      {isOpen && (
        <PurlCard value={activeRow} isOpen={isOpen} onClose={onClose} />
      )}

      {isCpeOpen && (
        <CpeCard value={activeRow} isOpen={isCpeOpen} onClose={onCpeClose} />
      )}
    </>
  )
}

export default ActivitiesOverview
