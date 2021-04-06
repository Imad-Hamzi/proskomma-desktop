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
      const res = await props.pk.gqlQuery(query);
      setResult(res);
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
          >
            {query}
          </textarea>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </>
      )}
    </div>
  );
};

export default PkQuery;
