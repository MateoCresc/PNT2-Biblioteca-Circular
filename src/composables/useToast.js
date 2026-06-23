import { ref, inject, provide } from 'vue'

const TOAST_KEY = Symbol('toast')

export function crearToastProvider() {
  const toasts = ref([])
  let idCounter = 0

  const mostrar = (mensaje, tipo = 'success', duracion = 3000) => {
    const id = ++idCounter
    toasts.value.push({ id, mensaje, tipo })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duracion)
  }

  provide(TOAST_KEY, { toasts, mostrar })

  return { toasts, mostrar }
}

export function useToast() {
  const toast = inject(TOAST_KEY)
  if (!toast) {
    throw new Error('useToast() requiere crearToastProvider() en un componente padre')
  }
  return toast
}
