import { FunctionComponent } from 'preact'
import { useEffect } from 'preact/hooks'

type ModalProps = {
  closeCallback?: () => void
}

export const Modal: FunctionComponent<ModalProps> = ({ closeCallback, children }) => {
  useEffect(() => {
    const listener = (ev: KeyboardEvent) => {
      if (ev.key?.toLowerCase() === 'escape' || ev.keyCode === 27) {
        closeCallback?.()
      }
    }

    document.addEventListener('keyup', listener)
    return () => {
      document.removeEventListener('keyup', listener)
    }
  }, [closeCallback])

  return (
    <div className="atw-inset-0 atw-flex atw-fixed atw-justify-center atw-items-center atw-z-50 atw-bg-black atw-bg-opacity-50">
      {children}
    </div>
  )
}
