import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-[14px]">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <div className="mx-1">
              <ChevronRight size={15} />
            </div>
          )}

          {item.active ? (
            <div className="font-semibold text-[var(--primary-blue)]">{item.label}</div>
          ) : (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
