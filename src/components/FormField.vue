<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="form-field">
    <label class="form-field__label">
      {{ label }}
      <span v-if="required" class="form-field__required">*</span>
    </label>
    <slot />
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-field__label {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.form-field__required {
  color: var(--color-danger);
}
</style>
