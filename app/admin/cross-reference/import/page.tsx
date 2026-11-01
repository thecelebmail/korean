import CrossReferenceImporter from '@/components/admin/CrossReferenceImporter'

export const metadata = {
  title: 'Parts Catalogue Import | Admin',
  robots: { index: false, follow: false },
}

export default function CrossReferenceImportPage() {
  return <CrossReferenceImporter />
}