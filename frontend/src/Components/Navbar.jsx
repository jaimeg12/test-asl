import React from 'react'
import { Link } from 'react-router'
import '../styles/navbar.css'

function Navbar() {
  return (<>
    <nav className='navbar'>
      <Link to='/' className='logo'> 
        VivaSign
      </Link>
    </nav>
  </>)
}

export default Navbar