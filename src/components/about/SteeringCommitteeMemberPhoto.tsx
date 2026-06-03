import Image from 'next/image'

type Props = {
  src: string
  alt: string
  /** Compact card on governance grid */
  variant?: 'card' | 'profile'
}

export default function SteeringCommitteeMemberPhoto({
  src,
  alt,
  variant = 'profile',
}: Props) {
  if (variant === 'card') {
    return (
      <div className="relative w-full aspect-[4/5] max-h-80 bg-slate-100 rounded-lg mb-4 overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain object-top"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
    )
  }

  return (
    <div className="relative w-full md:w-80 aspect-[3/4] md:aspect-[3/4] md:max-h-[420px] bg-slate-100 flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain object-top"
        sizes="(max-width: 768px) 100vw, 320px"
        priority={false}
      />
    </div>
  )
}
