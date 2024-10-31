import React, { FC } from 'react'

const AmexCard: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
    <defs>
      <linearGradient id="cardamex" x1="10.914%" x2="87.432%" y1="86.279%" y2="15.035%">
        <stop offset="0%" stopColor="#3FA9F5" />
        <stop offset="100%" stopColor="#0071BC" />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd">
      <path
        fill="url(#cardamex)"
        fillRule="nonzero"
        d="M22.559 16H1.379C.627 16 0 15.392 0 14.662V1.338C0 .608.627 0 1.379 0H22.62C23.373 0 24 .608 24 1.338v13.324c-.063.73-.627 1.338-1.441 1.338z"
      />
      <g fill="#FFF">
        <path d="M10.115 8.711L8.889 6.044H7.295v3.852L5.517 6.044H4.17l-1.778 4.03h1.103l.368-.889h2.023l.368.89h2.084V7.11l1.349 2.963h.92l1.348-2.904v2.904h.98v-4.03H11.28l-1.165 2.667zm-5.272-.474H4.23l.613-1.422v.06l.613 1.362h-.613z" />
        <path
          fillRule="nonzero"
          d="M19.372 7.94l.735-.77 1.042-1.185h-1.287L18.697 7.23l-1.164-1.245h-3.985v3.97h3.923l1.226-1.303 1.165 1.304h1.287L20.107 8.71l-.735-.77zM16.92 9.186h-2.33v-.77h2.268v-.77H14.59v-.712h2.33L18.084 8 16.92 9.185z"
        />
      </g>
    </g>
  </svg>
)

export default AmexCard
