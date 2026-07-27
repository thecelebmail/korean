// lib/utils/generateBreadcrumbJsonLd.ts
export function generateBreadcrumbJsonLd(
  items: { label: string; href?: string }[],
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      // Last item can omit "item" per spec, but including the canonical URL is safer/more consistent
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  }
}