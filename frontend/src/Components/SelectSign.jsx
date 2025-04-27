import React, { useMemo, useState, useEffect } from 'react';

function SelectSign({ setCurrentSign }) {
  const [options, setOptions] = useState();

  const handleSelectChange = (e) => {
    const selectedOption = e.target.value;
  // tell ButtonScreenshot which sign it is so it knows how many screenshots to take
    const entryCount = e.target.value.split("|")[0];
    const signName = e.target.value.split("|")[1];
    console.log(options)
    setCurrentSign({
      entryCount: entryCount,
      signName: signName
    })
  } 
    

  async function findSignList() {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch("https://test-asl-api.onrender.com/signs", requestOptions);
      const text = await response.text();
      const json = await JSON.parse(text);
      setOptions(json.signs);
    } catch (e) {
      console.error(e)
    }
    return null;
  }
  
  const menuOptions = useMemo(() => findSignList(), [])

  useEffect(() => {
    if (!options) return

    setCurrentSign({
      entryCount: options[0].entryCount,
      signName: options[0].signName
    })
  }, [options])

  return (<>
  <select name="Signs" id="sign-dropdown" onChange={handleSelectChange}>
      {options && options.map((v, i) => <>
        <option value={`${v.entryCount}|${v.signName}`}>{v.signName}</option>
      </>)}
  </select> 
  </>)
}

export default SelectSign;