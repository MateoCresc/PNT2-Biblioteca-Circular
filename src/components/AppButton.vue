<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'success', 'danger', 'outline', 'ghost'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button
    class="app-btn"
    :class="[`app-btn--${variant}`, `app-btn--${size}`]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
  white-space: nowrap;
}

.app-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Sizes */
.app-btn--sm {
  padding: 6px 14px;
  font-size: var(--font-size-xs);
}

.app-btn--md {
  padding: 10px 18px;
  font-size: var(--font-size-sm);
}

/* Variants */
.app-btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.app-btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.app-btn--success {
  background: var(--color-success);
  color: var(--color-text-inverse);
}

.app-btn--success:hover:not(:disabled) {
  background: var(--color-success-hover);
}

.app-btn--danger {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}

.app-btn--danger:hover:not(:disabled) {
  background: var(--color-danger-hover);
}

.app-btn--outline {
  background: none;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.app-btn--outline:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.app-btn--ghost {
  background: none;
  color: var(--color-text-muted);
}

.app-btn--ghost:hover:not(:disabled) {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
</style>
