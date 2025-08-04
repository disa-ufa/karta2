<template>
  <div>
    <div class="tabs">
      <button
        v-for="(tab, idx) in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="error" class="tab-error">
      <b>Ошибка:</b> {{ error }}
    </div>

    <div class="tab-content" v-if="activeTab === 'municipal'">
      <OrganizationTable
        :organizations="municipalOrgs"
        v-bind="tableProps"
        :pageSize="30"
      />
      <pre class="debug-raw">municipalOrgs ({{ municipalOrgs.length }}): 
        {{ municipalOrgs.slice(0,2) }}</pre>
    </div>
    <div class="tab-content" v-else-if="activeTab === 'correctional'">
      <OrganizationTable
        :organizations="correctionalOrgs"
        v-bind="tableProps"
        :pageSize="30"
      />
      <pre class="debug-raw">correctionalOrgs ({{ correctionalOrgs.length }}):
        {{ correctionalOrgs.slice(0,2) }}</pre>
    </div>
    <div class="tab-content" v-else-if="activeTab === 'pmpk'">
      <OrganizationTable
        :organizations="pmpkOrgs"
        v-bind="tableProps"
        :pageSize="30"
      />
      <pre class="debug-raw">pmpkOrgs ({{ pmpkOrgs.length }}):
        {{ pmpkOrgs.slice(0,2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import OrganizationTable from './AdminProfile/OrganizationTable.vue'

const municipalOrgs = ref([])
const correctionalOrgs = ref([])
const pmpkOrgs = ref([])

const error = ref('')

const tableProps = {
  columnWidths: [48, 250, 250, 210, 105, 100, 150, 110, 260, 280, 300, 108],
  profileOptions: [],
  serviceOptions: [],
  specialistOptions: [],
  ageOptions: [],
  isOrgChanged: () => false,
}

const tabs = [
  { key: 'municipal', label: 'Муниципальные ОО' },
  { key: 'correctional', label: 'Коррекционные ОО' },
  { key: 'pmpk', label: 'ПМПК' },
]

const activeTab = ref('municipal')

onMounted(async () => {
  try {
    municipalOrgs.value = await loadJson('/objects1-1.json', 'municipalOrgs')
    correctionalOrgs.value = await loadJson('/objects1-2.json', 'correctionalOrgs')
    pmpkOrgs.value = await loadJson('/objects1-3.json', 'pmpkOrgs')
  } catch (e) {
    error.value = e.message || String(e)
    console.error('Global load error:', e)
  }
})

async function loadJson(url, label = '') {
  try {
    const resp = await fetch(url)
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }
    const json = await resp.json()
    // GeoJSON: {features: [ ... ]}
    if (Array.isArray(json.features)) {
      return json.features.map(f => f.properties)
    }
    // Просто массив объектов
    if (Array.isArray(json)) {
      return json
    }
    // Неизвестная структура
    return []
  } catch (e) {
    error.value = `Ошибка загрузки ${url}: ${e.message || e}`
    return []
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 14px;
}
.tab-btn {
  padding: 7px 22px;
  background: #eaf2fa;
  border: 1px solid #b2cbe9;
  border-bottom: none;
  border-radius: 7px 7px 0 0;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.15s;
  outline: none;
}
.tab-btn.active {
  background: #fff;
  border-bottom: 2px solid #fff;
  font-weight: bold;
  color: #2474ca;
}
.tab-content {
  border: 1px solid #b2cbe9;
  border-radius: 0 0 8px 8px;
  background: #fff;
  padding-top: 8px;
}
.tab-error {
  color: #c00;
  padding: 8px 0;
  font-size: 16px;
  font-weight: bold;
}
.debug-raw {
  background: #fffbea;
  font-size: 13px;
  max-height: 140px;
  overflow: auto;
  margin: 8px 0 0 0;
  padding: 8px 10px;
  border-radius: 7px;
  color: #726312;
  border: 1px dashed #ffe;
}
</style>
