import { useEffect } from 'react'
import { BadgeCheck, CircleAlert, RefreshCw, Trash2, TriangleAlert, X } from '../../fontawesome-icons'

export function AppModal({ title, message, tone, onClose }) {
  return <div className="modal-backdrop" role="presentation"><section className={`feedback-dialog ${tone || 'error'}`} role="dialog" aria-modal="true" aria-labelledby="feedback-title"><button className="dialog-close" type="button" title="Close message" onClick={onClose}><X size={18} /></button><span className="feedback-icon">{tone === 'success' ? <BadgeCheck size={22} /> : <CircleAlert size={22} />}</span><h2 id="feedback-title">{title}</h2><p>{message}</p><button className="admin-primary-button feedback-close" type="button" onClick={onClose}>Understood</button></section></div>
}

export function ConfirmDialog({ title, message, confirmLabel, loading, onClose, onConfirm }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !loading) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [loading, onClose])

  return <div className="modal-backdrop confirm-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose() }}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message"><span className="confirm-dialog-icon"><TriangleAlert size={23} /></span><h2 id="confirm-dialog-title">{title}</h2><p id="confirm-dialog-message">{message}</p><div><button type="button" className="admin-secondary-button" onClick={onClose} disabled={loading}>Cancel</button><button type="button" className="admin-danger-button solid" onClick={onConfirm} disabled={loading}>{loading ? <RefreshCw className="spin" size={16} /> : <Trash2 size={16} />}{loading ? ' Deleting...' : confirmLabel}</button></div></section></div>
}
