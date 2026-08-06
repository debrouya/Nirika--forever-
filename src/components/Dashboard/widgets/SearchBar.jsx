import GlassSearchBar from '../../../design-system/components/GlassInput'

export default function SearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return <GlassSearchBar value={value} onChange={onChange} placeholder={placeholder} />
}
