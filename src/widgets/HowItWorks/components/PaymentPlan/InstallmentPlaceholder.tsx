export function InstallmentPlaceholder({ label }: { label: string }): JSX.Element {
  return (
    <div className="atw-flex atw-flex-row atw-justify-between">
      <span className="atw-capitalize">{label}</span>
      <span>
        <span className="atw-inline-block atw-w-8 atw-bg-orange-900 atw-rounded-sm atw-opacity-25">
          &nbsp;
        </span>
        &nbsp;€
      </span>
    </div>
  )
}
