import './GlassButton.css'

export default function GlassButton({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  disabled,
  loading,
  onClick,
  className = '',
  type = 'button',
}) {
  const variants = {
    default: '',
    primary: 'nirika-btn-primary',
    dark: 'nirika-btn-dark',
    lime: 'nirika-btn-lime',
    icon: 'nirika-btn-icon',
  }
  const sizes = {
    sm: 'nirika-btn-sm',
    md: '',
    lg: 'nirika-btn-lg',
  }

  return (
    <button
      type={type}
      className={`nirika-btn ${variants[variant] || ''} ${sizes[size] || ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,.2)',borderTopColor:'currentColor',animation:'nirika-spin .6s linear infinite',display:'inline-block'}} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
      ) : null}
      {variant !== 'icon' && children}
    </button>
  )
}
