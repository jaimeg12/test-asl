import React from 'react'
import { Link } from 'react-router'
import './styles/home.css'
import './styles/button.css'

function Home() {
  return (<>
    <h1>
      VivaSign — Your personal ASL tutor
    </h1>

    <h3>
      Learn ASL with a practical, hands on approach.
      <br />
      VivaSign teaches by analyzing your ASL signage and giving you personalized feedback.
    </h3>

    <div>
      <h3>
        How to Use: 
      </h3>

      <p>
        Pick the sign you want to practice and click "Start Recording". A timer will count down for each key part of the sign, taking 1-3 screenshots based on the complexity of your sign. 
      </p>
      <p> Perform each part to the best of your ability, focusing on hand shape, movement, and facial expression. Make sure you are in the correct position by the time each countdown finishes. 
      </p>
      <p>
      Once all parts are done, you'll receive personalized feedback based on your performance. 
      </p>
    </div>
    <Link className='button' to='/webcam'>
      Begin
    </Link>
  </>)
}

export default Home