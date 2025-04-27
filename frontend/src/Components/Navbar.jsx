import React from 'react'
import { Link } from 'react-router'
import '../styles/navbar.css'

function Navbar() {
  return (<>
    <nav className='navbar'>
      <Link to='/' className='logo'> 
        VivaSign
      </Link>
      <span className='right-align-navbar'>
        <Link to='/webcam' className='link'>
          Learn
        </Link>
      </span>
    </nav>
  </>)
}

export default Navbar