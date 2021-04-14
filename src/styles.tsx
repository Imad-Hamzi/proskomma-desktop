const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  toolbarMargin:
    theme.mixins.toolbar,
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
  boldPara: {
    marginBottom: '3px',
    fontWeight: 'bold',
  },
  boldItalicPara: {
    marginBottom: '3px',
    fontWeight: 'bold',
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
  browseModeButton: {
    marginLeft: "1em",
    float: "right",
  },
  browseNavigationText: {
    fontWeight: "bold",
    fontSize: "larger",
  },
  browseBlocksScriptureText: {
    marginTop: "5px",
  },
  pre: {
    whiteSpace: "pre",
    fontFamily: "monospace",
  },
  pkQueryTextarea: {
    width: "100%",
  },
  pkQueryButton: {
    float: "right",
  },
  pkQueryPreviousQueries: {
    color: "blue",
    textDecoration: "underline",
    fontSize: "smaller",
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  pkQueryPreviousQueriesTitle: {
    marginTop: '20px',
    fontWeight: 'bold',
  },
  searchTerms: {
    width: '50%',
  },
  searchButton: {
    float: 'right',
  },
  usfm_p: {
    marginTop: "2px",
    marginBottom: "2px",
  },
  usfm_d: {
    marginTop: "2px",
    fontWeight: "bold",
  },
  usfm_q: {
    marginTop: "2px",
    marginLeft: "2em",
    fontStyle: "italic",
  },
  usfm_q2: {
    marginTop: "2px",
    marginLeft: "4em",
    fontStyle: "italic",
  },
});

export default styles;
