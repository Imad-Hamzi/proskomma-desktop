import React from 'react';

const handleChange = (ev, setQuery) => {
  if (ev) {
    setQuery(ev.target.value);
  }
};

const PkQuery = (props) => {
  const [result, setResult] = React.useState({});
  const [query, setQuery] = React.useState('{ packageVersion }');

  React.useEffect(() => {
    const doQuery = async () => {
      const now = Date.now();
      const res = await props.pk.gqlQuery(query);
      setResult(res);
      console.log(Date.now()-now);
      // console.log(query, res);
    };
    doQuery();
  }, [query]);
  return (
    <div className="content">
      {!result ? (
        <div>No Result</div>
      ) : (
        <>
          <textarea
            cols="120"
            rows="20"
            onChange={async (event) => handleChange(event, setQuery)}
            value={query}
          />

          <div       
            onClick={() => {
            console.log('Saving');
            props.state.savedQueries.set(  
              Array.from(new Set([...props.state.savedQueries.get, query ]))
              );
            console.log(props.state.savedQueries.get);
          }}
          >
            <button>Save</button>
          </div>

          <ul>
            { [...props.state.savedQueries.get.entries()]
            .map(
              sq => 
                <li key={sq[0]} onClick={() => {
                  console.log('Clicking');
                  setQuery(sq[1]);
                }}
                >
                  <a href="#">{sq[1]}</a>
                </li>
              )
            }
          </ul>

          <pre>{JSON.stringify(result, null, 2)}</pre>
        </>
      )}
    </div>
  );
};

export default PkQuery;
