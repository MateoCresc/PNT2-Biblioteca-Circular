<script setup>
import { onMounted, onUnmounted } from 'vue'
import AppButton from './AppButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'danger'].includes(v)
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const onEscape = (e) => {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

const onBackdropClick = () => {
  emit('close')
}

onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-backdrop" @click.self="onBackdropClick">
        <div class="modal-content">
          <h3 v-if="title" class="modal-title">{{ title }}</h3>
          <div class="modal-body">
            <slot />
          </div>
          <div class="modal-actions">
            <AppButton variant="ghost" @click="emit('cancel')">
              {{ cancelText }}
            </AppButton>
            <AppButton
              :variant="variant === 'danger' ? 'danger' : 'primary'"
              @click="emit('confirm')"
            >
              {{ confirmText }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
}

.modal-content {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--color-text);
}

.modal-body {
  margin-bottom: var(--space-lg);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

/* Transición */
.modal-enter-active {
  transition: opacity 0.2s ease;
}

.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-leave-active .modal-content {
  transition: transform 0.15s ease;
}

.modal-enter-from .modal-content {
  transform: scale(0.95);
}

.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
