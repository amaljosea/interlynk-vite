import { useContext, useMemo } from 'react'
import { AddIcon, DeleteIcon, SettingsIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Input,
  Select,
  Switch,
  Tag,
  Text,
  Tooltip
} from '@chakra-ui/react'
import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import GlobalContext from 'context/GlobalContext'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

const Settings = () => {
  const { automationRules, setAutomationRules } = useContext(GlobalContext)

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      active: true,
      selectorOne: '',
      conditionOne: '',
      selectorTwo: '',
      conditionTwo: '',
      fixAction: ''
    }
    setAutomationRules([...automationRules, newRow])
  }

  const deleteRow = (id) => {
    const updatedData = automationRules.filter((item) => item.id !== id)
    setAutomationRules(updatedData)
  }

  const handleInputChange = (id, column, value) => {
    const updatedData = automationRules.map((item) => {
      if (item.id === id && column === 'selectorOne') {
        return { ...item, [column]: value, selectorTwo: '' }
      }
      if (item.id === id) {
        return { ...item, [column]: value }
      }
      return item
    })
    setAutomationRules(updatedData)
  }

  // COLUMNS
  const columns = [
    // ACTIVE
    {
      id: 'active',
      name: 'ACTIVE',
      selector: (row) => {
        const { active } = row
        return <Switch isChecked={active}></Switch>
      },
      width: '8%'
    },
    // RULE
    {
      id: 'rule',
      name: 'RULE APPLIES TO',
      selector: (row) => {
        const { selectorOne } = row

        return (
          <Select size='sm' value={selectorOne}>
            <option value=''>-- Select --</option>
            <option value='document'>Document</option>
            <option value='component'>Component</option>
          </Select>
        )
      }
    },
    // NAME
    {
      id: 'name',
      name: 'NAME',
      selector: (row) => {
        const { conditionOne } = row

        return (
          <Input
            size='sm'
            // disabled={row.selectorOne === 'document'}
            placeholder='Add name'
            value={conditionOne}
          />
        )
      }
    },
    // CONDITION
    {
      id: 'condition',
      name: 'CONDITION',
      selector: (row) => {
        const { conditionTwo } = row
        return (
          <Select size='sm' value={conditionTwo}>
            <option value=''>-- Select --</option>
            <option value='Missing'>Missing</option>
            <option value='Invalid'>Invalid</option>
            <option value='Invalid'>Missing or Invalid</option>
            <option value='Always'>Always</option>
          </Select>
        )
      }
    },
    // ATTRIBUTE
    {
      id: 'attribute',
      name: 'ATTRIBUTE',
      selector: (row) => {
        const { selectorOne, selectorTwo } = row
        return (
          <>
            {selectorOne === 'document' ? (
              <Select size='sm' value={selectorTwo}>
                <option value=''>-- Select --</option>
                <option value='Supplier'>Supplier</option>
                <option value='Author'>Author</option>
                <option value='Creation Time'>Creation Time</option>
                <option value='Creation Tools'>Creation Tools</option>
                <option value='Product Type'>Product Type</option>
                <option value='Product Version'>Product Version</option>
                <option value='Package URL (PURL)'>Package URL (PURL)</option>
                <option value='Common Platform Enumeration (CPE)'>
                  Common Platform Enumeration (CPE)
                </option>
                <option value='Primary Component'>Primary Component</option>
              </Select>
            ) : (
              <Select size='sm' value={selectorTwo}>
                <option value=''>-- Select --</option>
                <option value='Component Version'>Component Version</option>
                <option value='Component Type'>Component Type</option>
                <option value='Package URL (PURL)'>Package URL (PURL)</option>
                <option value='Common Platform Enumeration (CPE)'>
                  Common Platform Enumeration (CPE)
                </option>
              </Select>
            )}
          </>
        )
      }
    },
    // FIX
    {
      id: 'fix',
      name: 'FIX',
      selector: (row) => {
        const { selectorTwo, selectorOne } = row
        return (
          <>
            {selectorTwo !== '' ? (
              <Flex width={'100%'} alignItems={'center'} gap={2}>
                <Text fontSize={'sm'}>Set:</Text>
                {selectorOne === 'component' ? (
                  <Tag>pkg:nuget/Fizzler@1.2.0</Tag>
                ) : (
                  <Tag>Biotronik.ScsApp.Pr-1.0.0</Tag>
                )}
                <IconButton
                  size='xs'
                  colorScheme='blue'
                  icon={<SettingsIcon />}
                />
              </Flex>
            ) : (
              ''
            )}
          </>
        )
      },
      wrap: true,
      width: '25%'
    },
    // ACTIONS
    {
      id: 'actions',
      name: 'ACTIONS',
      selector: (row) => {
        const { id } = row
        return <IconButton size='sm' icon={<DeleteIcon />} colorScheme='red' />
      },
      right: 'true'
    }
  ]

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        width={'100%'}
      >
        <Text fontSize={18}>Rule Automation Settings</Text>
        <Tooltip label='Add Rule'>
          <IconButton
            variant='solid'
            colorScheme='blue'
            fontWeight='normal'
            icon={<AddIcon />}
          />
        </Tooltip>
      </Flex>
    )
  }, [])

  return (
    <CardBody>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={automationRules}
          customStyles={customStyles}
          subHeader
          subHeaderComponent={subHeaderComponent}
          progressPending={automationRules ? false : true}
          progressComponent={<CustomLoader />}
          responsive={true}
          persistTableHead
        />
      </Flex>
    </CardBody>
  )
}

export default Settings
