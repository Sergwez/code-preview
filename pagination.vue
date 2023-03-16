<template lang="pug">
.pagination(v-if='pagination' :class="[{ 'is-open': showSelect }, position]")
  v-popover.container(
    offset='0',
    placement-x='bottom',
    popover-class='custom-select',
    popover-inner-class='select-items',
    popover-arrow-class='select-arrow'
    @update:open = "toggleSelect($event)"
  )
    .custom-select {{ currentLimit }} {{ $tc("records.recordsPerPage") }}
      icon-caret-down.icon.icon-caret-down
    template(slot='popover' v-model="showSelect")
      .select-items(v-close-popover)
        .select-item(
          v-for='item in selectItems',
          :key='item',
          :class='{ active: item === currentLimit }',
          @click='changeCount(item)'
        ) {{ item }} {{ $tc("records.recordsPerPage") }}
  .current-count {{ `${currentOffsetPlusOne} - ${showedItems}` }}
  .btns
    button.prev-page(@click='changePage(-1)', :disabled='disablePrevBtn')
      icon-chevron-left.icon.icon-chevron-left
    button.next-page(@click='changePage(1)', :disabled='disableNextBtn')
      icon-chevron-right.icon.icon-chevron-right
</template>

<script lang="ts">
import Vue from 'vue'
import iconChevronLeft from '@/assets/svg/rounded/chevron-left.svg?inline'
import iconChevronRight from '@/assets/svg/rounded/chevron-right.svg?inline'
import iconCaretDown from '@/assets/svg/rounded/caret-down.svg?inline'
import {
  DATA_TABLE_SELECT_VALUES,
  DEFAULT_ITEMS_ON_PAGE,
} from '@/constants/dataTable'

interface Props {
  pagination: DataPagination
  tableId: string
  position: string
}

interface Data {
  currentLimit: number
  currentOffset: number
  selectItems: Array<number>
  showSelect: boolean
  defaultLimit: number
  defaultOffset: number
}

interface Computed {
  showedItems: number
  disablePrevBtn: boolean
  disableNextBtn: boolean
  currentOffsetPlusOne: number
}

interface Methods {
  changeCount: (newCount: number) => void
  changePage: (nextPage: number) => void
  setValues: () => void
  toggleSelect: (status: boolean) => void
}

export interface DataPagination {
  offset: number
  limit: number
  total: number
}

export default Vue.extend<Data, Methods, Computed, Props>({
  components: {
    iconCaretDown,
    iconChevronRight,
    iconChevronLeft,
  },
  props: {
    pagination: {
      required: true,
    },
    tableId: {
      required: false,
      default: '',
    },
    position: {
      required: false,
      default: 'top',
    },
  },
  data() {
    return {
      defaultLimit: DEFAULT_ITEMS_ON_PAGE,
      showSelect: false,
      currentLimit: DEFAULT_ITEMS_ON_PAGE,
      currentOffset: 0,
      selectItems: DATA_TABLE_SELECT_VALUES,
      defaultOffset: 0,
    }
  },
  computed: {
    showedItems() {
      if (
        this.pagination &&
        this.pagination.total - this.currentOffset - this.currentLimit < 0
      ) {
        return this.pagination.total
      }
      if (
        this.pagination &&
        !(this.pagination.total - this.currentOffset - this.currentLimit < 0)
      ) {
        return this.currentOffset + Number(this.currentLimit)
      }
      return 0
    },
    currentOffsetPlusOne() {
      if (this.pagination.total === 0) {
        return 0
      } else {
        return this.currentOffset + 1
      }
    },
    disablePrevBtn() {
      const newOffset = this.currentOffset - this.currentLimit
      return newOffset < 0
    },
    disableNextBtn() {
      const newOffset = this.currentOffset + this.currentLimit
      return this.pagination.total - newOffset <= 0
    },
  },
  methods: {
    toggleSelect(status) {
      this.showSelect = status
    },
    changeCount(newCount: number) {
      this.currentLimit = newCount
      this.currentOffset = 0
      const query = Object.assign({}, this.$route.query)
      if (this.currentLimit !== DEFAULT_ITEMS_ON_PAGE) {
        query[`limit${this.tableId}`] = String(newCount)
      } else {
        delete query[`limit${this.tableId}`]
      }
      delete query[`offset${this.tableId}`]
      if (
        query[`limit${this.tableId}`] !==
        this.$route.query[`limit${this.tableId}`]
      ) {
        this.$router.push({ query })
      }
    },
    changePage(nextPage) {
      this.currentOffset = this.currentOffset + this.currentLimit * nextPage
      this.$router.push({
        query: {
          ...this.$route.query,
          [`offset${this.tableId}`]: String(this.currentOffset),
        },
      })
      if (this.currentOffset === 0) {
        const query = Object.assign({}, this.$route.query)
        delete query[`offset${this.tableId}`]
        this.$router.replace({ query })
      }
    },
    setValues() {
      if (
        this.$route.query[`limit${this.tableId}`] &&
        Number.isInteger(+this.$route.query[`limit${this.tableId}`])
      ) {
        this.currentLimit = Number(this.$route.query[`limit${this.tableId}`])
      } else {
        this.currentLimit = Number(this.defaultLimit)
      }
      if (
        this.$route.query[`offset${this.tableId}`] &&
        Number.isInteger(+this.$route.query[`offset${this.tableId}`])
      ) {
        this.currentOffset = Number(this.$route.query[`offset${this.tableId}`])
      } else {
        this.currentOffset = Number(this.defaultOffset)
      }
    },
  },
  mounted() {
    this.setValues()
  },
  watch: {
    '$route.query'(oldValue, newValue) {
      if (
        oldValue[`limit${this.tableId}`] !== newValue[`limit${this.tableId}`]
      ) {
        this.setValues()
      }
      if (
        oldValue[`offset${this.tableId}`] !== newValue[`offset${this.tableId}`]
      ) {
        this.setValues()
      }
    },
  },
})
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_vars';
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  align-self: flex-end;
  position: sticky;
  top: 0;
  padding: 0 1rem 0 0.25rem;
  background-color: #fff;
  border-radius: $radius-3x;
  box-shadow: $box-shadow-5;
  margin: 0 1.125rem 0;
  &.top {
    @media (min-width: $mobile-breakpoint) {
      border-radius: $radius-3x $radius-3x 0 0;
    }
  }
  &.bottom {
    @media (min-width: $mobile-breakpoint) {
      border-radius: 0 0 $radius-3x $radius-3x;
    }
  }
  &.center {
    @media (min-width: $mobile-breakpoint) {
      border-radius: $radius-3x;
    }
  }
  @media (min-width: $mobile-breakpoint) {
    background-color: #fff;
    border-radius: $radius-3x $radius-3x 0 0;
    max-width: 314px;
    padding: 0;
    margin: 0;
    box-shadow: none;
  }
  @media (min-width: $tablet-breakpoint) {
    max-width: 383px;
  }
  .btns {
    display: flex;
    padding-right: 0.375rem;
    .next-page,
    .prev-page {
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      .icon {
        fill: $text;
        transition: 0.3s;
      }
      &:hover:not(:disabled) {
        .icon {
          fill: $purple;
          filter: drop-shadow($box-shadow-5);
        }
      }
      &:disabled {
        cursor: unset;
        .icon {
          fill: $decor;
        }
      }
    }
  }
}
.current-count {
  color: $text;
  font-weight: 700;
}
.custom-select {
  cursor: pointer;
  padding: 0.75rem 1rem 0.75rem;
  color: $text;
  font-size: 0.75rem;
  @media (max-width: $tablet-breakpoint) {
    padding: 0.75rem 0.5rem 0.75rem 1rem;
  }
  .select-items {
    flex-direction: column;
    margin-bottom: 0.25rem;
    margin-top: -0.3125rem;
    margin-left: -0.5rem;
    left: 0.5rem;
    background: #fff;
    color: $text;
    box-shadow: $box-shadow-1;
    padding: 0.5rem;
    border-radius: 0 0 $radius-3x $radius-3x;
    box-shadow: $box-shadow-5;
    @media (min-width: $tablet-breakpoint) {
      box-shadow: none;
      margin-left: -0.5rem;
    }
    .select-item {
      padding: 0 0.5rem;
      line-height: 1;
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 0.75rem;
      min-width: 3rem;
      height: 1.375rem;
      border: 1px solid #fff;
      border-radius: 1rem;
      &.active {
        color: #fff;
        background-color: $purple;
      }
      &:not(.active):hover {
        background-color: $smoke;
      }
    }
  }
  .icon.icon-caret-down {
    margin-left: 0.25rem;
    fill: $text;
    transition: 0.3s;
    margin-top: -0.125rem;
    width: 0.5rem;
    height: 0.375rem;
    .open & {
      transform: scaleY(-1);
    }
  }
}
</style>
