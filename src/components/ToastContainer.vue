<script setup>
import { useToast } from '../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.tipo}`"
      >
        {{ toast.mensaje }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  pointer-events: none;
}

.toast {
  padding: 14px 28px;
  border-radius: var(--radius-md);
  color: var(--color-text-inverse);
  font-weight: 600;
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-md);
  pointer-events: auto;
}

.toast--success {
  background: var(--color-success);
}

.toast--error {
  background: var(--color-danger);
}

.toast--warning {
  background: var(--color-warning);
}

/* Transición */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
