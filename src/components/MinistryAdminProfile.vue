<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import OrganizationTable from './AdminProfile/OrganizationTable.vue'
import SearchBox from './AdminProfile/SearchBox.vue'
import ErrorBar from './AdminProfile/ErrorBar.vue'
import LoadingBar from './AdminProfile/LoadingBar.vue'
import EducationMinistryTabs from './EducationMinistryTabs.vue'

const AGE_OPTIONS = ['0-18', '18+']

// Универсальный справочник профилей
const PROFILE_OPTIONS = [
  'Лица с интеллектуальными нарушениями',
  'Лица с нарушениями зрения',
  'Лица с нарушениями слуха',
  'Лица с нарушениями опорно-двигательного аппарата',
]

// Пример для двух ведомств (расширяй по необходимости)
const SERVICE_OPTIONS = {
  "Министерство культуры Р.Б.": [
    "Арт-терапия", "Музыкотерапия", "Декоративно-прикладное искусство", "Обучение драматическому искусству",
    "Танцевально-двигательная терапия", "Библиотерапия", "Музыко-терапия", "Кинотерапия",
    "Занятия лепкой", "Игровая терапия", "Занятие лепкой"
  ],
  "Министерство спорта Р.Б.": [
    "Организация мероприятий по подготовке спортивных сборных команд",
    "Организация и проведение официальных спортивных мероприятий",
    "Обеспечение участия спортивных сборных команд в официальных спортивных мероприятиях",
    "Спортивная подготовка по спорту лиц с интеллектуальными нарушениями",
    "Спортивная подготовка по спорту слепых",
    "Спортивная подготовка по спорту глухих",
    "Спортивная подготовка по спорту лиц с поражением опорно-двигательного аппарата"
  ],
}
const SPECIALIST_OPTIONS = {
  "Министерство культуры Р.Б.": [
    "Руководители творческих коллективов", "Руководитель кружка", "Библиотекарь", "Психолог",
    "Тифлопедагог", "Мастера декоративно-прикладного искусства",
    "Руководитель студии народных ремесел \"Возрождение наследия\"",
    "Заведующий методическим кабинетом МАУ \"Бураевский РДК им. Р. Галиевой\"",
    "Культорганизатор", "Художественный руководитель", "Приглашенные психологи"
  ],
  "Министерство спорта Р.Б.": [
    "Тренер-преподаватель",
    "Инструктор-методист",
    "Педагог-психолог"
  ]
}

const admin = ref({
  ministry: localStorage.getItem('user_ministry') || "Министерство культуры Р.Б."
})

const organizations = ref([])
const error = ref('')
const loading = ref(false)
const search = ref('')
const columnWidths = ref([
  48, 250, 250, 210, 105, 100, 115, 95, 160, 220, 210, 100,
])
const originalOrgs = ref([])

const router = useRouter()
function goHome() {
  router.push('/')
}

// Сравнение массивов без учета порядка
function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const as = [...a].sort();
  const bs = [...b].sort();
  return as.every((val, idx) => val === bs[idx]);
}

// Приведение к массиву
function getProfileArray(profile) {
  if (Array.isArray(profile)) return profile
  if (typeof profile === 'string') {
    return profile.split(/[\n\r,;]/).map(x => x.trim()).filter(Boolean)
  }
  return []
}
function getStringArray(val) {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return val.split(/[\n\r,;]/).map(x => x.trim()).filter(Boolean)
  return []
}

// Сравнение для кнопки сохранения
function isOrgChanged(idx, org) {
  const orig = originalOrgs.value[idx]
  if (!orig) return false
  return [
    'name', 'full_name', 'address', 'phone', 'website'
  ].some(field => (org[field] || '') !== (orig[field] || '')) ||
    !arraysEqual(org.ageGroups || [], orig.ageGroups || []) ||
    (org.svo || '') !== (orig.svo || '') ||
    (org.accessibility || '').toLowerCase() !== (orig.accessibility || '').toLowerCase() ||
    !arraysEqual(getProfileArray(org.profile), getProfileArray(orig.profile)) ||
    !arraysEqual(getStringArray(org.services), getStringArray(orig.services)) ||
    !arraysEqual(getStringArray(org.specialists), getStringArray(orig.specialists))
}
function saveOrg(org, idx) {
  alert('Сохранение реализуется через backend. Сейчас только UI.')
  originalOrgs.value[idx] = JSON.parse(JSON.stringify(org))
}

// ----------------- Загрузка организаций для обычных министерств -----------------
async function loadOrganizationsForMinistry(ministry) {
  organizations.value = []
  error.value = ''
  loading.value = true
  try {
    let url = ''
    if (ministry === "Министерство культуры Р.Б.") url = '/api/organizations?department=Министерство%20культуры%20Р.Б.'
    else if (ministry === "Министерство спорта Р.Б.") url = '/api/organizations?department=Министерство%20спорта%20Р.Б.'
    else return

    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    const json = await resp.json()
    organizations.value = json.map((org, i) => ({
      ...org,
      id: i + 1, // просто нумерация
      profile: getProfileArray(org.profile),
      services: getStringArray(org.services),
      specialists: getStringArray(org.specialists),
      ageGroups: org.ageGroups || [],
      svo: org.svo || (Array.isArray(org.ageGroups) && org.ageGroups.includes("СВО") ? "Да" : "Нет"),
      accessibility: (org.accessibility || '').toLowerCase(),
    }))
    originalOrgs.value = organizations.value.map(org => JSON.parse(JSON.stringify(org)))
  } catch (e) {
    error.value = 'Ошибка загрузки организаций: ' + (e.message || e)
    organizations.value = []
  }
  loading.value = false
}

const filteredOrgs = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return organizations.value
  return organizations.value.filter(org => {
    const fields = [
      org.id, org.name, org.full_name, org.address, org.phone, org.website,
      (org.ageGroups || []).join(','),
      org.svo,
      org.accessibility,
      getProfileArray(org.profile).join(','),
      getStringArray(org.services).join(','),
      getStringArray(org.specialists).join(',')
    ].map(x => (x || '').toString().toLowerCase())
    return fields.some(val => val.includes(q))
  })
})

onMounted(async () => {
  if (admin.value.ministry !== 'Министерство просвещения Р.Б.') {
    await loadOrganizationsForMinistry(admin.value.ministry)
  } else {
    organizations.value = []
  }
})
</script>

<template>
  <div class="admin-profile-full">
    <button class="close-btn-modern" @click="goHome" title="На главную">
      <svg width="30" height="30" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r="15" fill="white" />
        <path d="M10 10 L20 20 M20 10 L10 20" stroke="#e04141" stroke-width="2.3" stroke-linecap="round"/>
      </svg>
    </button>
    <ErrorBar v-if="error" :text="error" />
    <div v-if="admin" class="ministry-line">
      <b>Ведомство:</b> {{ admin.ministry }}
    </div>
    <br>
    <SearchBox v-model="search" :count="filteredOrgs.length" />
    <h3 class="orgs-title">Организации ведомства</h3>
    <div class="table-container-flex">
      <EducationMinistryTabs v-if="admin.ministry === 'Министерство просвещения Р.Б.'" />
      <template v-else>
        <LoadingBar v-if="loading" />
        <OrganizationTable
          v-else
          :organizations="filteredOrgs"
          :columnWidths="columnWidths"
          :profileOptions="PROFILE_OPTIONS"
          :serviceOptions="SERVICE_OPTIONS[admin.ministry] || []"
          :specialistOptions="SPECIALIST_OPTIONS[admin.ministry] || []"
          :ageOptions="AGE_OPTIONS"
          :isOrgChanged="isOrgChanged"
          @saveOrg="saveOrg"
          :pageSize="30"
        />
      </template>
    </div>
  </div>
</template>


<style src="./AdminProfile/styles.css"></style>
