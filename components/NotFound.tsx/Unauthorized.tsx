import React from 'react'

{/* <Unauthorized description="You are not authorized to view this page" /> */}

export default function Unauthorized({description}:{description:string}) {
  return (
   <div className="flex flex-col items-center justify-center mt-20">

        <svg width="100%" height="100%" viewBox="0 0 600 250"
     xmlns="http://www.w3.org/2000/svg">
 
  <g transform="translate(250 90)" fill="none" stroke="#ffffff" stroke-width="8"> 
    <rect x="0" y="70" width="100" height="90" rx="12"/> 
    <path d="M20 70 V45 C20 10 80 10 80 45 V70"/>
  </g>
 
  <g transform="translate(250 90)" fill="#ffffff">
    <circle cx="50" cy="120" r="7"/>
    <rect x="47" y="120" width="6" height="18" rx="3"/>
  </g>  

</svg>
<h6 className='text-sm lg:text-base font-medium font-parkinsans mt-5'>{description}</h6>
    </div>
  )
}
