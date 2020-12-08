import cbLogo from '../assets/cards/cb.svg'
import visaLogo from '../assets/cards/visa.svg'
import mastercardLogo from '../assets/cards/mastercard.svg'

type CardLogoProps = {
  brand: 'visa' | 'mastercard' | 'cb'
  alt?: string
}

type CardDict = { [k in CardLogoProps['brand']]: string }

const DEFAULT_LABELS: CardDict = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  cb: 'Cartes Bancaires',
}

const LOGOS: CardDict = {
  cb: cbLogo,
  visa: visaLogo,
  mastercard: mastercardLogo,
}

export function CardLogo({ brand, alt = DEFAULT_LABELS[brand] }: CardLogoProps): JSX.Element {
  return <img className="atw-h-full" src={LOGOS[brand]} alt={alt} />
}
