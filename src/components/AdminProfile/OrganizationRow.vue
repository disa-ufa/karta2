<script setup>
import CheckboxList from './CheckboxList.vue'

const props = defineProps({
  org: Object,
  rowIdx: Number,
  columnWidths: Array,
  profileOptions: Array,
  serviceOptions: Array,
  specialistOptions: Array,
  ageOptions: Array,
  isChanged: Function,
})

const emit = defineEmits(['save'])

function startRowResize(event) {
  const tr = event.target.closest('tr')
  const startY = event.clientY
  const startHeight = tr.offsetHeight

  const onMouseMove = e => {
    tr.style.height = `${Math.max(startHeight + e.clientY - startY, 40)}px`
  }
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <td style="text-align:center;position:relative">
    {{ org.id }}
    <span class="row-resize" @mousedown="startRowResize"></span>
  </td>
  <td class="editable-cell">
    <textarea v-model="org.name" class="cell-area"></textarea>
  </td>
  <td class="editable-cell">
    <textarea v-model="org.full_name" class="cell-area"></textarea>
  </td>
  <td class="editable-cell">
    <textarea v-model="org.address" class="cell-area"></textarea>
  </td>
  <td class="editable-cell">
    <input v-model="org.phone" class="cell-input" />
  </td>
  <td class="editable-cell">
    <input v-model="org.website" class="cell-input" />
  </td>
  <td class="editable-cell">
    <div class="age-group-box">
      <label v-for="age in ageOptions" :key="age" class="agelabel">
        <input type="checkbox" :value="age" v-model="org.age_group" class="cell-checkbox" />{{ age }}
      </label>
    </div>
  </td>
  <td class="editable-cell">
    <div class="acc-radio-box">
      <label><input type="radio" value="да" v-model="org.accessibility" />Да</label>
      <label><input type="radio" value="нет" v-model="org.accessibility" />Нет</label>
    </div>
  </td>
  <td class="editable-cell">
    <CheckboxList :options="profileOptions" :selected="org.profile"
      @toggle="opt => org.profile.includes(opt) ? org.profile.splice(org.profile.indexOf(opt),1) : org.profile.push(opt)" />
  </td>
  <td class="editable-cell">
    <CheckboxList :options="serviceOptions" :selected="org.services"
      @toggle="opt => org.services.includes(opt) ? org.services.splice(org.services.indexOf(opt),1) : org.services.push(opt)" />
  </td>
  <td class="editable-cell">
    <CheckboxList :options="specialistOptions" :selected="org.specialists"
      @toggle="opt => org.specialists.includes(opt) ? org.specialists.splice(org.specialists.indexOf(opt),1) : org.specialists.push(opt)" />
  </td>
  <td style="text-align:center">
    <button class="save-btn" :disabled="!isChanged(rowIdx, org)" @click="emit('save', org, rowIdx)">
      Сохранить
    </button>
  </td>
</template>
