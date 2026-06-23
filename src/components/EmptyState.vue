<script setup>
defineProps({
  icon: {
    type: String,
    default: '📋'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon">{{ icon }}</span>
    <p class="empty-state__title">{{ title }}</p>
    <p v-if="description" class="empty-state__desc">{{ description }}</p>
    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: 48px 24px;
  text-align: center;
}

.empty-state__icon {
  font-size: 3rem;
  margin-bottom: var(--space-sm);
}

.empty-state__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.empty-state__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  max-width: 320px;
}

.empty-state__action {
  margin-top: var(--space-md);
}
</style>
