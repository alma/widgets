import { css } from 'lit'

export const sharedStyles = css`
  .card-icon {
    display: inline-block;
    width: var(--alma-card-icon-width, 24px);
    height: var(--alma-card-icon-height, 16px);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .card-cb {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16' viewBox='0 0 24 16'%3E%3Cdefs%3E%3ClinearGradient id='cardcb' x1='5.842%25' x2='95.393%25' y1='81.753%25' y2='17.344%25'%3E%3Cstop offset='0%25' stop-color='%2339B54A'/%3E%3Cstop offset='100%25' stop-color='%230A5296'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='none' fill-rule='nonzero'%3E%3Cpath fill='url(%23cardcb)' d='M22.621 16H1.38C.627 16 0 15.392 0 14.662V1.338C0 .608.627 0 1.379 0H22.62C23.373 0 24 .608 24 1.338v13.324c-.063.73-.627 1.338-1.379 1.338z'/%3E%3Cg fill='%23FFF'%3E%3Cpath d='M19.094 4.03h-6.437V8h6.498c1.165 0 2.084-.889 2.084-2.015-.06-1.066-.98-1.955-2.145-1.955zM19.094 8.593h-6.437v3.97h6.498c1.165 0 2.084-.889 2.084-2.015-.06-1.067-.98-1.955-2.145-1.955zM7.017 8.06h4.966c-.245-2.371-2.391-4.267-4.966-4.267-2.758 0-5.027 2.074-5.027 4.681s2.269 4.682 5.027 4.682c2.698 0 4.904-2.015 5.027-4.563H7.017v-.534z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .card-visa {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16' viewBox='0 0 24 16'%3E%3Cg fill='none' fill-rule='nonzero'%3E%3Cpath fill='%23FCFCFC' d='M22.684 16H1.38C.627 16 0 15.39 0 14.656V1.344C0 .61.627 0 1.379 0H22.62C23.373 0 24 .61 24 1.344v13.374c0 .671-.564 1.282-1.316 1.282z'/%3E%3Cpath fill='%23005098' d='M8.889 10.726l.948-5.393h1.482l-.949 5.393zM15.704 5.452a3.658 3.658 0 0 0-1.304-.237c-1.481 0-2.489.71-2.489 1.778 0 .77.711 1.185 1.304 1.481.592.237.77.415.77.652 0 .355-.474.533-.889.533-.592 0-.889-.059-1.363-.296l-.177-.06-.178 1.186c.355.178 1.007.296 1.659.296 1.54 0 2.548-.71 2.548-1.837 0-.592-.415-1.067-1.244-1.481-.534-.237-.83-.415-.83-.652 0-.237.237-.474.83-.474.474 0 .83.118 1.126.178l.118.059.119-1.126M19.496 5.333H18.37c-.355 0-.592.119-.77.474l-2.193 4.919h1.541s.237-.652.296-.83h1.897c.059.178.178.83.178.83h1.362l-1.185-5.393zM17.66 8.77l.593-1.481s.118-.296.178-.533l.118.474s.296 1.303.356 1.54h-1.245zM7.644 5.333L6.222 9.007l-.178-.77C5.748 7.348 4.92 6.459 4.03 5.985l1.303 4.682h1.541l2.311-5.393h-1.54' /%3E%3Cpath fill='%23F6A500' d='M4.919 5.333h-2.37v.119c1.836.474 3.08 1.54 3.555 2.844L5.57 5.807c-.118-.414-.355-.474-.651-.474'/%3E%3Cpath fill='%230A5296' d='M23.937 3.23H0V1.316C0 .598.627 0 1.379 0H22.62C23.373 0 24 .598 24 1.316V3.23h-.063z'/%3E%3Cpath fill='%23F4A428' d='M.063 13H24v1.8c0 .655-.625 1.2-1.375 1.2H1.375C.625 16 0 15.455 0 14.8V13h.063z'/%3E%3C/g%3E%3C/svg%3E");
  }

  .card-mastercard {
    background-image: url("data:image/svg+xml,%3Csvg width='24' height='16' viewBox='0 0 24 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Crect fill='%23FFFFFF' x='0' y='0' width='24' height='16' rx='1'/%3E%3Cg transform='translate(4.000000, 3.000000)'%3E%3Ccircle fill='%23EA001B' cx='5.05263158' cy='5.05263158' r='5.05263158'/%3E%3Ccircle fill-opacity='0.25' fill='%23F79F1A' cx='10.9473684' cy='5.05263158' r='5.05263158'/%3E%3Ccircle fill-opacity='0.6' fill='%23F79F1A' cx='10.9473684' cy='5.05263158' r='5.05263158'/%3E%3Ccircle fill-opacity='0.3' fill='%23EA001B' cx='5.05263158' cy='5.05263158' r='5.05263158'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .card-amex {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16' viewBox='0 0 24 16'%3E%3Cdefs%3E%3ClinearGradient id='amexgrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%233FA9F5;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%230071BC;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='24' height='16' fill='url(%23amexgrad)' /%3E%3Cg fill='%23FFF'%3E%3Cpath d='M10.115 8.711L8.889 6.044H7.295v3.852L5.517 6.044H4.17l-1.778 4.03h1.103l.368-.889h2.023l.368.89h2.084V7.11l1.349 2.963h.92l1.348-2.904v2.904h.98v-4.03H11.28l-1.165 2.667zm-5.272-.474H4.23l.613-1.422v.06l.613 1.362h-.613z'/%3E%3Cpath d='M19.372 7.94l.735-.77 1.042-1.185h-1.287L18.697 7.23l-1.164-1.245h-3.985v3.97h3.923l1.226-1.303 1.165 1.304h1.287L20.107 8.71l-.735-.77zM16.92 9.186h-2.33v-.77h2.268v-.77H14.59v-.712h2.33L18.084 8 16.92 9.185z'/%3E%3C/g%3E%3C/svg%3E");
  }

  /* Screen reader only - hide visually but keep accessible to assistive tech */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`
