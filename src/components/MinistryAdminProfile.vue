<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import OrganizationTable from './AdminProfile/OrganizationTable.vue'
import SearchBox from './AdminProfile/SearchBox.vue'
import ErrorBar from './AdminProfile/ErrorBar.vue'
import LoadingBar from './AdminProfile/LoadingBar.vue'
import EducationMinistryTabs from './EducationMinistryTabs.vue'

const AGE_OPTIONS = ['0-18', '18+', 'СВО']

const admin = ref({
  ministry: localStorage.getItem('user_ministry') || "Министерство культуры Р.Б."
})

const organizations = ref([])
const error = ref('')
const loading = ref(false)
const search = ref('')
const columnWidths = ref([
  48, 250, 250, 210, 105, 100, 150, 110, 260, 280, 380, 108,
])
const originalOrgs = ref([])

const MINISTRY_DICTIONARIES = {
  "Министерство культуры Р.Б.": {
    profile: [
      'Лица с интеллектуальными нарушениями',
      'Лица с нарушениями зрения',
      'Лица с нарушениями слуха',
      'Лица с нарушениями опорно-двигательного аппарата',
    ],
    services: [
      "Арт-терапия", "Музыкотерапия", "Декоративно-прикладное искусство", "Обучение драматическому искусству",
      "Танцевально-двигательная терапия", "Библиотерапия", "Музыко-терапия", "Кинотерапия",
      "Занятия лепкой", "Игровая терапия", "Занятие лепкой"
    ],
    specialists: [
      "Руководители творческих коллективов", "Руководитель кружка", "Библиотекарь", "Психолог",
      "Тифлопедагог", "Мастера декоративно-прикладного искусства",
      "Руководитель студии народных ремесел \"Возрождение наследия\"",
      "Заведующий методическим кабинетом МАУ \"Бураевский РДК им. Р. Галиевой\"",
      "Культорганизатор", "Художественный руководитель", "Приглашенные психологи"
    ]
  },
  "Министерство спорта Р.Б.": {
    profile: [
      "Лица с нарушениями слуха",
      "Лица с поражением ОДА",
      "Лица с нарушениями зрения",
      "Лица с ИН"
    ],
    services: [
      "Организация мероприятий по подготовке спортивных сборных команд",
      "Организация и проведение официальных спортивных мероприятий",
      "Обеспечение участия спортивных сборных команд в официальных спортивных мероприятиях",
      "Спортивная подготовка по спорту лиц с интеллектуальными нарушениями",
      "Спортивная подготовка по спорту слепых",
      "Спортивная подготовка по спорту глухих",
      "Спортивная подготовка по спорту лиц с поражением опорно-двигательного аппарата"
    ],
    specialists: [
      "Тренер-преподаватель",
      "Инструктор-методист",
      "Педагог-психолог"
    ]
  }
}

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

const ministryDict = computed(() => MINISTRY_DICTIONARIES[admin.value.ministry] || {
  profile: [],
  services: [],
  specialists: []
})

const filteredOrgs = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return organizations.value
  return organizations.value.filter(org => {
    const fields = [
      org.id, org.name, org.full_name, org.address, org.phone, org.website,
      (org.age_group || []).join(','),
      org.accessibility,
      getProfileArray(org.profile).join(','),
      getStringArray(org.services).join(','),
      getStringArray(org.specialists).join(',')
    ].map(x => (x || '').toString().toLowerCase())
    return fields.some(val => val.includes(q))
  })
})

const router = useRouter()
function goHome() {
  router.push('/')
}

function isOrgChanged(idx, org) {
  const orig = originalOrgs.value[idx]
  if (!orig) return false
  return [
    'name', 'full_name', 'address', 'phone', 'website'
  ].some(field => (org[field] || '') !== (orig[field] || '')) ||
    JSON.stringify(org.age_group || []) !== JSON.stringify(orig.age_group || []) ||
    (org.accessibility || '') !== (orig.accessibility || '') ||
    JSON.stringify(getProfileArray(org.profile)) !== JSON.stringify(getProfileArray(orig.profile)) ||
    JSON.stringify(getStringArray(org.services)) !== JSON.stringify(getStringArray(orig.services)) ||
    JSON.stringify(getStringArray(org.specialists)) !== JSON.stringify(getStringArray(orig.specialists))
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
    if (ministry === "Министерство культуры Р.Б.") url = '/objects3.json'
    else if (ministry === "Министерство спорта Р.Б.") url = '/objects2.json'
    else return

    console.log('Загрузка данных для министерства:', ministry, url)
    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    const json = await resp.json()
    if (json && json.features) {
      organizations.value = json.features.map(f => ({
        ...f.properties,
        id: f.id || f.properties?.id || Math.random().toString(36).slice(2),
      }))
    } else if (Array.isArray(json)) {
      organizations.value = json
    } else {
      organizations.value = []
    }
    originalOrgs.value = organizations.value.map(org => JSON.parse(JSON.stringify(org)))
    console.log('Организаций загружено:', organizations.value.length)
  } catch (e) {
    error.value = 'Ошибка загрузки организаций: ' + (e.message || e)
    organizations.value = []
    console.error(error.value, e)
  }
  loading.value = false
}

// ------------ onMounted ------------

onMounted(async () => {
  if (admin.value.ministry !== 'Министерство просвещения Р.Б.') {
    await loadOrganizationsForMinistry(admin.value.ministry)
  } else {
    // для "просвещения" ничего не грузим тут, табы сами загрузят
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
      <!-- Вкладки для Минпросвещения, обычная таблица для остальных -->
      <EducationMinistryTabs v-if="admin.ministry === 'Министерство просвещения Р.Б.'" />
      <template v-else>
        <LoadingBar v-if="loading" />
        <OrganizationTable
          v-else
          :organizations="filteredOrgs"
          :columnWidths="columnWidths"
          :profileOptions="ministryDict.profile"
          :serviceOptions="ministryDict.services"
          :specialistOptions="ministryDict.specialists"
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
