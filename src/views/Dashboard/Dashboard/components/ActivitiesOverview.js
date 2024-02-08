// Chakra imports
import { Flex, Text, useColorModeValue, useDisclosure } from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import CardHeader from 'components/Card/CardHeader.js'
import PurlCard from 'components/Misc/PurlCard'
import ActivitiesOverviewRow from 'components/Tables/ActivitiesOverviewRow'
import React, { useState } from 'react'
import { FaEye } from 'react-icons/fa'

const ActivitiesOverview = ({ title, amount, data }) => {
  const textColor = useColorModeValue('gray.700', 'white')
  const [activeRow, setActiveRow] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Card maxH='100%'>
        <CardHeader p='12px 0px 30px 0px'>
          <Flex direction='column'>
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              {title}
            </Text>
          </Flex>
        </CardHeader>
        <CardBody ps='20px' pe='0px' position='relative'>
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
                    setActiveRow={setActiveRow}
                  />
                )
              })}
          </Flex>
        </CardBody>
      </Card>

      {isOpen && <PurlCard value={activeRow} isOpen={isOpen} onClose={onClose} />}
    </>
  )
}

export default ActivitiesOverview
