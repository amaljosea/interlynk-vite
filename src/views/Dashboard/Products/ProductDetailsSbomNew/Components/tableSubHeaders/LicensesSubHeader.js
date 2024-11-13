import { useMemo } from 'react'
import { isCustomerView } from 'utils'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'

import { Flex } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

const LicensesSubHeader = () => {
  const customerView = isCustomerView()
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent='flex-end'
        gap={2}
      >
        {/* EXPORT CSV */}
        {!customerView && <ExportCsv tableType='SBOM License View' />}

        <RefreshBtn />
      </Flex>
    )
  }, [customerView])

  return subHeader
}

export default LicensesSubHeader
