const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  flex: {
    flex: 1,
  },
  content: {
    display: "flex",
    padding: "10px",
    height: "100%",

    flexDirection:"column",
  },
  tabContent: {
    padding: theme.spacing(2),
  },
  footer: {
    padding: "5px",
    display: "block",
  },
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
  para: {
    marginBottom: '3px',
  },
  italicPara: {
    marginBottom: '3px',
    fontStyle: 'italic',
  },
  loading: {
    paddingLeft: '50px',
    paddingTop: '50px',
    paddingBottom: '50px',
  },
  docSetsSection: {
    marginTop: '20px',
  },
});

export default styles;
