<script setup>
import { computed, ref, watch } from 'vue'
import OrganizationRow from './OrganizationRow.vue'

const props = defineProps({
  organizations: Array,
  columnWidths: Array,
  profileOptions: Array,
  serviceOptions: Array,
  specialistOptions: Array,
  ageOptions: Array,
  isOrgChanged: Function,
  pageSize: { type: Number, default: 25 }, // Добавлено: размер страницы
})

const emit = defineEmits(['saveOrg'])

const currentPage = ref(1)
const totalPages = computed(() =>
  Math.max(1, Math.ceil((props.organizations?.length || 0) / props.pageSize))
)

const pagedOrgs = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return props.organizations.slice(start, start + props.pageSize)
})

function gotoPage(page) {
  if (page < 1) page = 1
  if (page > totalPages.value) page = totalPages.value
  currentPage.value = page
}

watch(() => props.organizations, () => { currentPage.value = 1 })

function startResize(index, event) {
  const startX = event.clientX
  const startWidth = props.columnWidths[index]

  const onMouseMove = e => {
    props.columnWidths[index] = Math.max(startWidth + e.clientX - startX, 50)
  }
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function getColumnTitle(index) {
  return [
    'ID', 'Краткое наименование', 'Полное наименование',
    'Адрес', 'Телефон', 'Сайт', 'Возрастные группы',
    'Доступная среда', 'Профиль', 'Услуги', 'Специалисты', ''
  ][index] || ''
}
</script>

<template>
  <div class="table-scroll">
    <table class="org-table" :style="{ minWidth: (columnWidths.reduce((a,b)=>a+b,0)+24) + 'px' }">
      <thead>
        <tr>
          <th v-for="(width, colIndex) in columnWidths" :key="colIndex" :style="{ width: width + 'px', position: 'relative' }">
            {{ getColumnTitle(colIndex) }}
            <span class="col-resize" @mousedown="startResize(colIndex, $event)"></span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(org, rowIdx) in pagedOrgs" :key="org.id" class="virtual-row">
          <OrganizationRow
            :org="org"
            :rowIdx="(currentPage-1)*pageSize + rowIdx"
            :columnWidths="columnWidths"
            :profileOptions="profileOptions"
            :serviceOptions="serviceOptions"
            :specialistOptions="specialistOptions"
            :ageOptions="ageOptions"
            :isChanged="isOrgChanged"
            @save="(org, idx) => emit('saveOrg', org, idx)"
          />
        </tr>
      </tbody>
    </table>
    <!-- Пагинация -->
    <div class="org-pagination" v-if="totalPages > 1">
      <button @click="gotoPage(currentPage-1)" :disabled="currentPage <= 1">&lt;</button>
      <span>Стр. {{currentPage}} из {{totalPages}}</span>
      <button @click="gotoPage(currentPage+1)" :disabled="currentPage >= totalPages">&gt;</button>
    </div>
  </div>
</template>

<style scoped>
.org-pagination {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin: 15px 0;
}
.org-pagination button {
  font-size: 16px;
  padding: 5px 15px;
  border-radius: 7px;
  border: 1px solid #c0c0c0;
  background: #f7fafc;
  cursor: pointer;
  transition: background .15s;
}
.org-pagination button:disabled {
  color: #bbb;
  border-color: #eee;
  background: #f5f5f5;
  cursor: default;
}
</style>
