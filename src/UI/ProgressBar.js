import React from 'react'
import styled from 'styled-components'

const ProgressContainer = styled.div`
  width: 100%;
  height: 20px;
  background-color: #222;
  border-radius: 10px;
  box-shadow: inset 0 0 5px #000;
`;

const ProgressLine = styled.div`
height: 100%;
border-radius: 8px;
background-color: #6bccf9;
transition: width 0.3s ease-in-out;`;


const ProgressBar = ({percentage}) => {
  return(
    <ProgressContainer>
      <ProgressLine style={{width: `${percentage}%`}} />
    </ProgressContainer>
  )
}

export default ProgressBar