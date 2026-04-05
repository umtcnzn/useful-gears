interface AmazonButtonProps {
  slug: string
}

export function AmazonButton({ slug }: AmazonButtonProps) {
  return (
    <a
      href={`/go/${slug}`}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="btn-amazon flex items-center justify-center gap-3 w-full py-4 text-base"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 11l8-8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 3v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M2 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      Buy on Amazon
    </a>
  )
}
