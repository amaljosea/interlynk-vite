import { IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import { FaFileCsv } from 'react-icons/fa6'

import ExportCsvModal from './ExportCsvModal'

const ExportCsv = ({ tableType, filters }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Tooltip label='Export CSV'>
        <IconButton
          onClick={onOpen}
          icon={<FaFileCsv fontSize={18} />}
          colorScheme='blue'
          variant='solid'
          name='export_csv'
          fontSize='sm'
          fontWeight='normal'
        />
      </Tooltip>

      {isOpen && (
        <ExportCsvModal
          isOpen={isOpen}
          onClose={onClose}
          tableType={tableType}
          filters={filters}
        />
      )}
    </>
  )
}

export default ExportCsv
