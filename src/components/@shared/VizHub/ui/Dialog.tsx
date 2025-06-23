'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'danger' | 'primary'
}

export default function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  confirmVariant = 'primary'
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen, onClose])

  // Prevent scrolling on body when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // Determine button styles based on variant
  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-blue-500 hover:bg-blue-600 text-white'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl animate-slide-up"
      >
        <div className="px-5 py-3">
          <h2
            id="dialog-title"
            className="text-lg font-medium text-gray-800 dark:text-gray-200"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
