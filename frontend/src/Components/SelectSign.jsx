import React from 'react';
// import { Dropdown } from 'flowbite-react';

function SelectSign({ setCurrentSign }) {
const handleSelectChange = (e) => {
  const selectedOption = e.target.value;
  // tell ButtonScreenshot which sign it is so it knows how many screenshots to take
  
}

  return (<>
  <select name="Signs" id="cars" onChange={handleSelectChange}>
    <option value="1">One</option>
    <option value="2">Two</option>
    <option value="3">Three</option>
    <option value="4">Four</option>
  </select> 
  </>)
}

export default SelectSign;