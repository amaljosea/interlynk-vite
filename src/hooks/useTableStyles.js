import { useThemeColor } from './useThemeColors'

export const useDataTableStyles = () => {
  const {
    headingTextColor,
    hoverBgColor,
    semiTransparentBorder,
    grayHeaderColor
  } = useThemeColor([
    'headingTextColor',
    'hoverBgColor',
    'semiTransparentBorder',
    'grayHeaderColor'
  ])

  return {
    headCells: {
      style: {
        fontFamily: 'inherit',
        fontWeight: 600,
        fontSize: 11,
        backgroundColor: 'transparent', // change this to the desired color
        color: grayHeaderColor // change this to the desired text color
        // padding: paddingHeadCell
      }
    },
    headRow: {
      style: {
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: semiTransparentBorder
      }
    },
    cells: {
      style: {
        backgroundColor: 'transparent' // cell background color
        // padding: paddingCell
      }
    },
    rows: {
      style: {
        backgroundColor: 'transparent', // row background color
        '&:not(:last-of-type)': {
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: semiTransparentBorder
        },
        '&:hover': {
          backgroundColor: hoverBgColor,
          cursor: 'pointer'
        },
        transition: 'background-color 0.2s ease'
      },
      stripedStyle: {
        backgroundColor: 'transparent' // striped row background color
      }
    },
    table: {
      style: {
        backgroundColor: 'transparent' // entire table background color
      }
    },
    progress: {
      style: {
        backgroundColor: 'transparent' // progress component background color
      }
    },
    subHeader: {
      style: {
        padding: 0,
        backgroundColor: 'transparent' // sub-header background color
      }
    },
    noData: {
      style: {
        backgroundColor: 'transparent',
        color: headingTextColor
      }
    },
    expanderRow: {
      style: {
        backgroundColor: 'transparent' // expandable row background color
      }
    },
    expanderCell: {
      style: {
        '& svg': {
          color: 'darkgray'
        }
      }
    }
  }
}
