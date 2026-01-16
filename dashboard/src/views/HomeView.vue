<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTableUIStore } from "@/stores/table";
import {
  useGetTables,
  useBulkUpdateStatus,
  type TableQueryParams,
} from "@/services/queries/table.queries";
import { useGetCustomer } from "@/services/queries/customer.queries";
import TableSection from "@/components/TableSection.vue";
import TableLegend from "@/components/TableLegend.vue";
import ReservationModal from "@/components/ReservationModal.vue";
import BulkStatusModal from "@/components/BulkStatusModal.vue";
import ToastContainer from "@/components/ToastContainer.vue";
import { useToast } from "@/composables/useToast";
import { useTableWebSocket } from "@/composables/useWebSocket";
import type { ITable, ICustomer, TableStatus, ReservationPayload } from "@/types/table";
import { useReserveTable, useCancelReservation, useSeatReservation } from "@/services/queries/reservation.queries";

function getTodayDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

const queryParams = ref<TableQueryParams>({
  date: getTodayDate(),
  time: getCurrentTime(),
});

const { data: tables, isLoading, error, indoorTables, outdoorTables, getTableById } = useGetTables(queryParams);
const { data: customers } = useGetCustomer();
const reserveTableMutation = useReserveTable();
const cancelReservationMutation = useCancelReservation();
const seatReservationMutation = useSeatReservation();
const bulkUpdateMutation = useBulkUpdateStatus();

const uiStore = useTableUIStore();
const toast = useToast();
useTableWebSocket();

const _isReservationModalOpen = ref(false);
const _isBulkStatusModalOpen = ref(false);
const _impersonateUser = ref("admin");

watch(_impersonateUser, (newValue) => {
  uiStore.setSelectionMode(newValue === "admin" ? "status" : "reserve");
});

const currentCustomer = computed((): ICustomer | null => {
  if (_impersonateUser.value === "admin") return null;
  return customers.value?.find((c) => c.id === _impersonateUser.value) ?? null;
});

const currentCustomerId = computed(() => {
  return _impersonateUser.value === "admin" ? null : _impersonateUser.value;
});

const selectedTables = computed(() => {
  return uiStore.selectedTableIds
    .map((id) => getTableById(id))
    .filter((t): t is ITable => t !== undefined);
});

const totalCapacity = computed(() => selectedTables.value.reduce((sum, t) => sum + t.capacity, 0));
const selectedTableNames = computed(() => selectedTables.value.map((t) => t.number).join(", "));

const hasOwnReservationSelected = computed(() => {
  return selectedTables.value.some(
    (t) => t.reservation && t.reservation.customerId === currentCustomerId.value
  );
});

const selectedOwnReservation = computed(() => {
  return selectedTables.value.filter(
    (t) => t.reservation && t.reservation.customerId === currentCustomerId.value
  ) ?? null;
});

function isOwnReservation(table: ITable): boolean {
  if (!currentCustomerId.value) return false;
  if (!table.reservation) return false;
  return table.reservation.customerId === currentCustomerId.value;
}

function handleSelectTable(table: ITable) {
  if (uiStore.selectionMode === "reserve") {
    const isOwn = isOwnReservation(table);
    if (hasOwnReservationSelected.value && !isOwn) return;
    if (isOwn && uiStore.selectedTableIds.length > 0 && !hasOwnReservationSelected.value) {
      uiStore.clearSelection();
    }
    if (table.status !== "available" && !isOwn) return;
  }
  uiStore.toggleSelection(table.id);
}

function selectAllTables() {
  if (uiStore.selectionMode === "status") {
    uiStore.selectAll(tables.value?.map((t) => t.id) ?? []);
  } else {
    uiStore.selectAll(tables.value?.filter((t) => t.status === "available").map((t) => t.id) ?? []);
  }
}

async function handleReservation(payload: ReservationPayload) {
  try {
    let response;
    for (const tableId of uiStore.selectedTableIds) {
      response = await reserveTableMutation.mutateAsync({ ...payload, tableId });
    }
    toast.success(response?.message || 'Reservation created successfully');
    _isReservationModalOpen.value = false;
    uiStore.clearSelection();
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to create reservation');
  }
}

async function handleCancelReservation() {
  if (!selectedOwnReservation.value?.length) return;
  const reservationIds = selectedOwnReservation.value.map((t) => t.reservation?.id).filter((id): id is string => !!id);
  try {
    const response = await cancelReservationMutation.mutateAsync(reservationIds);
    toast.success(response?.message || 'Reservation cancelled');
    uiStore.clearSelection();
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to cancel reservation');
  }
}

async function handleSeatReservation() {
  if (!selectedOwnReservation.value?.length) return;
  const reservationIds = selectedOwnReservation.value.map((t) => t.reservation?.id).filter((id): id is string => !!id);
  try {
    const response = await seatReservationMutation.mutateAsync(reservationIds);
    toast.success(response?.message || 'Table seated successfully');
    uiStore.clearSelection();
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to seat table');
  }
}

async function handleBulkStatusChange(status: TableStatus) {
  try {
    const response = await bulkUpdateMutation.mutateAsync({ tableIds: uiStore.selectedTableIds, status });
    toast.success(response?.message || `Status changed to ${status}`);
    _isBulkStatusModalOpen.value = false;
    uiStore.clearSelection();
    uiStore.setSelectionMode("status");
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to change status');
  }
}
</script>

<template>
  <ToastContainer />
  <main class="min-h-screen bg-slate-950 p-8 pb-24">
    <!-- Header -->
    <header class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <h1 class="text-lg font-medium text-slate-200">Table Reservation</h1>
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="queryParams.date"
          type="date"
          :min="new Date().toISOString().split('T')[0]"
          class="date-input px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300 text-sm border border-slate-700 focus:outline-none focus:border-slate-500"
        />
        <input
          v-model="queryParams.time"
          type="time"
          class="time-input px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300 text-sm border border-slate-700 focus:outline-none focus:border-slate-500"
        />
        <select
          v-model="_impersonateUser"
          class="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300 text-sm border border-slate-700 min-w-[140px] focus:outline-none focus:border-slate-500"
        >
          <option value="admin">Admin</option>
          <option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customer.name }}
          </option>
        </select>
      </div>
    </header>

    <!-- Status Mode Banner -->
    <div
      v-if="uiStore.selectionMode === 'status'"
      class="flex items-center gap-3 mb-6 px-4 py-2.5 bg-slate-900/50 rounded-lg border border-slate-800"
    >
      <span class="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs font-medium rounded">Admin</span>
      <span class="text-sm text-slate-400">Select tables to change status</span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12 text-slate-500">Loading...</div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12 text-rose-400">Failed to load tables</div>

    <!-- Content -->
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2" style="gap: 24px;">
        <TableSection
          title="Indoor"
          :tables="indoorTables"
          :selected-table-ids="uiStore.selectedTableIds"
          :selection-mode="uiStore.selectionMode"
          :current-customer-id="currentCustomerId"
          @select-table="handleSelectTable"
        />
        <TableSection
          title="Outdoor"
          :tables="outdoorTables"
          :selected-table-ids="uiStore.selectedTableIds"
          :selection-mode="uiStore.selectionMode"
          :current-customer-id="currentCustomerId"
          @select-table="handleSelectTable"
        />
      </div>
    </template>

    <!-- Action Bar -->
    <transition name="slide-up">
      <div
        v-if="uiStore.selectedTableIds.length > 0"
        class="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 px-8 py-4 flex items-center justify-between z-50"
      >
        <div class="text-sm text-slate-500">
          <span class="text-slate-300 font-medium">{{ uiStore.selectedTableIds.length }}</span> selected
          <span class="text-slate-600 ml-2">{{ selectedTableNames }}</span>
          <span v-if="uiStore.selectionMode === 'reserve'" class="text-slate-600"> · {{ totalCapacity }} seats</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="cursor-pointer px-3 py-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            @click="selectAllTables"
          >
            Select All
          </button>
          <button
            class="cursor-pointer px-3 py-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            @click="uiStore.clearSelection"
          >
            Clear
          </button>
          <template v-if="uiStore.selectionMode === 'reserve'">
            <template v-if="hasOwnReservationSelected && selectedOwnReservation">
              <button
                class="cursor-pointer px-4 py-1.5 text-sm bg-rose-400/20 text-rose-300 rounded-lg hover:bg-rose-400/30 transition-colors"
                @click="handleCancelReservation"
              >
                Cancel
              </button>
              <button
                class="cursor-pointer px-4 py-1.5 text-sm bg-emerald-400/20 text-emerald-300 rounded-lg hover:bg-emerald-400/30 transition-colors"
                @click="handleSeatReservation"
              >
                Seat
              </button>
            </template>
            <button
              v-else
              class="cursor-pointer px-4 py-1.5 text-sm bg-sky-400/20 text-sky-300 rounded-lg hover:bg-sky-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="reserveTableMutation.isPending.value"
              @click="_isReservationModalOpen = true"
            >
              Reserve
            </button>
          </template>
          <button
            v-else
            class="cursor-pointer px-4 py-1.5 text-sm bg-amber-400/20 text-amber-300 rounded-lg hover:bg-amber-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="bulkUpdateMutation.isPending.value"
            @click="_isBulkStatusModalOpen = true"
          >
            Change Status
          </button>
        </div>
      </div>
    </transition>

    <!-- Legend (fixed bottom-right) -->
    <TableLegend class="fixed bottom-20 right-8 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 z-40" />

    <!-- Modals -->
    <ReservationModal
      :is-open="_isReservationModalOpen"
      :tables="selectedTables"
      :total-capacity="totalCapacity"
      :customer="currentCustomer"
      :date="queryParams.date"
      :time="queryParams.time"
      @close="_isReservationModalOpen = false"
      @submit="handleReservation"
    />
    <BulkStatusModal
      :is-open="_isBulkStatusModalOpen"
      :selected-count="uiStore.selectedTableIds.length"
      @close="_isBulkStatusModalOpen = false"
      @change-status="handleBulkStatusChange"
    />
  </main>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* Date/Time picker icon colors */
.date-input::-webkit-calendar-picker-indicator,
.time-input::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
  cursor: pointer;
}
.date-input::-webkit-calendar-picker-indicator:hover,
.time-input::-webkit-calendar-picker-indicator:hover {
  filter: invert(0.9);
}
</style>
