<script setup>
import CheckboxList from './CheckboxList.vue'

const PROFILE_OPTIONS = [
  'Лица с интеллектуальными нарушениями',
  'Лица с нарушениями зрения',
  'Лица с нарушениями слуха',
  'Лица с нарушениями опорно-двигательного аппарата'
]

const SERVICES_OPTIONS = {
  'Министерство спорта Р.Б.': [
    "Организация мероприятий по подготовке спортивных сборных команд",
    "Организация и проведение официальных спортивных мероприятий",
    "Обеспечение участия спортивных сборных команд в официальных спортивных мероприятиях",
    "Спортивная подготовка по спорту лиц с интеллектуальными нарушениями",
    "Спортивная подготовка по спорту слепых",
    "Спортивная подготовка по спорту глухих",
    "Спортивная подготовка по спорту лиц с поражением опорно-двигательного аппарата"
  ],
  'Министерство культуры Р.Б.': [
    "Арт-терапия", "Музыкотерапия", "Декоративно-прикладное искусство", "Обучение драматическому искусству",
    "Танцевально-двигательная терапия", "Библиотерапия", "Музыко-терапия", "Кинотерапия",
    "Занятия лепкой", "Игровая терапия", "Занятие лепкой"
  ]
}
const DEFAULT_SERVICE_OPTIONS = [
  "Получение начального общего образования",
  "Получение основного общего образования",
  "Получение среднего общего образования"
]

const SPECIALIST_OPTIONS = {
  'Министерство спорта Р.Б.': [
    "Тренер-преподаватель",
    "Инструктор-методист",
    "Педагог-психолог"
  ],
  'Министерство культуры Р.Б.': [
    "Руководители творческих коллективов", "Руководитель кружка", "Библиотекарь", "Психолог",
    "Тифлопедагог", "Мастера декоративно-прикладного искусства",
    "Руководитель студии народных ремесел \"Возрождение наследия\"",
    "Заведующий методическим кабинетом МАУ \"Бураевский РДК им. Р. Галиевой\"",
    "Культорганизатор", "Художественный руководитель", "Приглашенные психологи"
  ]
}
const DEFAULT_SPECIALIST_OPTIONS = [
  "педагог-психолог",
  "учитель логопед",
  "социальный педагог"
]

const props = defineProps({
  org: Object,
  rowIdx: Number,
  columnWidths: Array,
  ageOptions: Array,
  isChanged: Function,
})

const emit = defineEmits(['save'])

// Услуги
function getServicesOptions() {
  return SERVICES_OPTIONS[props.org.department] || DEFAULT_SERVICE_OPTIONS
}
function isServiceChecked(opt) {
  return Array.isArray(props.org.services) && props.org.services.includes(opt)
}
function toggleService(opt) {
  if (!Array.isArray(props.org.services)) props.org.services = []
  const idx = props.org.services.indexOf(opt)
  if (idx === -1) {
    props.org.services.push(opt)
  } else {
    props.org.services.splice(idx, 1)
  }
}

// Специалисты
function getSpecialistsOptions() {
  return SPECIALIST_OPTIONS[props.org.department] || DEFAULT_SPECIALIST_OPTIONS
}
function isSpecialistChecked(opt) {
  return Array.isArray(props.org.specialists) && props.org.specialists.includes(opt)
}
function toggleSpecialist(opt) {
  if (!Array.isArray(props.org.specialists)) props.org.specialists = []
  const idx = props.org.specialists.indexOf(opt)
  if (idx === -1) {
    props.org.specialists.push(opt)
  } else {
    props.org.specialists.splice(idx, 1)
  }
}

// Возрастные группы
function isAgeGroupChecked(age) {
  return Array.isArray(props.org.ageGroups) && props.org.ageGroups.includes(age)
}
function toggleAgeGroup(age) {
  if (!Array.isArray(props.org.ageGroups)) props.org.ageGroups = []
  const idx = props.org.ageGroups.indexOf(age)
  if (idx === -1) {
    props.org.ageGroups.push(age)
  } else {
    props.org.ageGroups.splice(idx, 1)
  }
}

// СВО (Да/Нет) — регистр не важен!
function getSvo() {
  return (props.org.svo || '').toLowerCase() === 'да' ? 'да' : 'нет'
}
function setSvo(val) {
  props.org.svo = val // сохраняем как есть, регистр не важен!
}

// Доступная среда (Да/Нет) — регистр не важен!
function getAccessibility() {
  return (props.org.accessibility || '').toLowerCase() === 'да' ? 'да' : 'нет'
}
function setAccessibility(val) {
  props.org.accessibility = val
}

// Профиль
function isProfileChecked(opt) {
  return Array.isArray(props.org.profile) && props.org.profile.includes(opt)
}
function toggleProfile(opt) {
  if (!Array.isArray(props.org.profile)) props.org.profile = []
  const idx = props.org.profile.indexOf(opt)
  if (idx === -1) {
    props.org.profile.push(opt)
  } else {
    props.org.profile.splice(idx, 1)
  }
}

// Для растягивания строки
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
    {{ rowIdx + 1 }}
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
  <!-- Возрастные группы -->
  <td class="editable-cell">
    <div class="age-group-box">
      <label>
        <input type="checkbox" :checked="isAgeGroupChecked('0-18')" @change="toggleAgeGroup('0-18')" /> 0-18
      </label>
      <label>
        <input type="checkbox" :checked="isAgeGroupChecked('18+')" @change="toggleAgeGroup('18+')" /> 18+
      </label>
    </div>
  </td>
  <!-- СВО -->
  <td class="editable-cell">
    <div class="acc-radio-box">
      <label :class="{ 'active-radio': getSvo() === 'да' }">
        <input type="radio" value="да" :checked="getSvo() === 'да'" @change="setSvo('да')" />Да
      </label>
      <label :class="{ 'active-radio': getSvo() === 'нет' }">
        <input type="radio" value="нет" :checked="getSvo() === 'нет'" @change="setSvo('нет')" />Нет
      </label>
    </div>
  </td>
  <!-- Доступная среда -->
  <td class="editable-cell">
    <div class="acc-radio-box">
      <label :class="{ 'active-radio': getAccessibility() === 'да' }">
        <input type="radio" value="да" :checked="getAccessibility() === 'да'" @change="setAccessibility('да')" />Да
      </label>
      <label :class="{ 'active-radio': getAccessibility() === 'нет' }">
        <input type="radio" value="нет" :checked="getAccessibility() === 'нет'" @change="setAccessibility('нет')" />Нет
      </label>
    </div>
  </td>
  <!-- Профиль -->
  <td class="editable-cell">
    <div class="checkbox-list">
      <label v-for="opt in PROFILE_OPTIONS" :key="opt">
        <input type="checkbox" :checked="isProfileChecked(opt)" @change="toggleProfile(opt)" />
        {{ opt }}
      </label>
    </div>
  </td>
  <!-- Услуги -->
  <td class="editable-cell">
    <div class="checkbox-list">
      <label v-for="opt in getServicesOptions()" :key="opt">
        <input type="checkbox" :checked="isServiceChecked(opt)" @change="toggleService(opt)" />
        {{ opt }}
      </label>
    </div>
  </td>
  <!-- Специалисты -->
  <td class="editable-cell">
    <div class="checkbox-list">
      <label v-for="opt in getSpecialistsOptions()" :key="opt">
        <input type="checkbox" :checked="isSpecialistChecked(opt)" @change="toggleSpecialist(opt)" />
        {{ opt }}
      </label>
    </div>
  </td>
  <td style="text-align:center">
    <button class="save-btn" :disabled="!isChanged(rowIdx, org)" @click="emit('save', org, rowIdx)">
      Сохранить
    </button>
  </td>
</template>

<style scoped>
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0 2px 4px;
}
.checkbox-list label {
  display: flex;
  align-items: center;
  font-size: 13px;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.age-group-box,
.acc-radio-box {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  align-items: center;
  padding: 2px;
}
.agelabel {
  font-size: 13px;
  white-space: nowrap;
}
.acc-radio-box label {
  padding: 2px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.17s;
}
.acc-radio-box label.active-radio {
  background: #cbefff;
  font-weight: 500;
}
.save-btn {
  padding: 7px 15px;
  border-radius: 6px;
  background: #36c900;
  border: none;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.16s, opacity 0.15s;
}
.save-btn.inactive,
.save-btn:disabled {
  background: #b9e4b9;
  opacity: 0.62;
  cursor: not-allowed;
}
.row-resize {
  width: 100%;
  height: 6px;
  bottom: 0;
  left: 0;
  cursor: row-resize;
  position: absolute;
}
</style>
