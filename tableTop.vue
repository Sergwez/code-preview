<template lang="pug">
.table-top
  h1 {{ $tc(title) }}
  .total(v-if='total') {{ total }}
  .views
    button.view.table-view(
      v-if="true"
      :class='{ active: isTableView }',
      :disabled='isTableView',
      @click='changeView("table")'
    ) {{ $tc("records.tableView.table") }}
    button.view.kanban-view(
      v-if="true"
      :class='{ active: isKanbanView, "show-select": showSelect }',
      :disabled='isKanbanView',
      v-click-outside='closeSelect'
    ) 
      span(@click.self='changeView("kanban")') {{ $tc("records.tableView.kanban") }}
      iconSliders.icon-sliders(@click.self='toggleSelect')
      .select-items(v-if='selectedItem')
        .select-title {{ $tc("records.fieldSeparation") }}
        .select-item(v-for='item in selectItems', :key='item.key') 
          custom-checkbox(
            @input='changeSelectedItem(item)',
            :rounded='true',
            :inputValue='item.key === selectedItem.key',
            theme='dark'
          )
            template
              .checkbox-label {{ $tc("records." + item.key) }}
  .btns(v-if='showDownloadButton')
    paid-label(theme='button')
      button.btn.-purple(@click='getFile', :disabled='disableDownloadBtn') {{ $tc("records.export") }}
        iconDownload.icon-download
</template>

<script lang="ts">
import Vue from 'vue'
import { ETableView } from '@/constants/dataTable'
import { columnConstants, Column, columns } from '@/helpers/columnConstants'
import PaidLabel from '@/components/PaidLabel/PaidLabel.vue'
import CustomCheckbox from '@/components/Common/CustomCheckbox.vue'
import vClickOutside from 'v-click-outside'
import iconDownload from '@/assets/svg/rounded/download.svg?inline'
import iconSliders from '@/assets/svg/rounded/sliders1.svg?inline'

interface Props {
  title: string
  view: ETableView
  disableDownloadBtn: boolean
  total: number
  columns: Column[]
}

interface Data {
  showKanbanSetting: boolean
  selectedItem: Column
  selectItems: Column[]
  showSelect: boolean
}

interface Methods {
  getFile: () => void
  changeView: (view: ETableView) => void
  toggleKanbanSetting: () => void
  closeKanbansetting: () => void
  changeSelectedItem: (item: Column) => void
  setSelectItems: () => void
  toggleSelect: () => void
  closeSelect: () => void
}

interface Computed {
  model: ETableView
  isTableView: boolean
  isKanbanView: boolean
  showDownloadButton: boolean
}

export default Vue.extend<Data, Methods, Computed, Props>({
  components: {
    iconDownload,
    iconSliders,
    PaidLabel,
    CustomCheckbox,
  },
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    title: {
      required: true,
    },
    view: {
      required: true,
    },
    disableDownloadBtn: {
      required: true,
    },
    total: {
      required: true,
    },
    columns: {
      required: true,
    },
  },
  data() {
    return {
      showSelect: false,
      showKanbanSetting: false,
      selectedItem: this.columns[0],
      selectItems: [],
    }
  },
  methods: {
    getFile() {
      this.$emit('getFile')
    },
    changeView(view) {
      if (this.model === view) {
        return
      }
      if (this.view === ETableView.table) {
        return (this.model = ETableView.kanban)
      }
      this.model = ETableView.table
    },
    toggleKanbanSetting() {
      this.showKanbanSetting = !this.showKanbanSetting
    },
    closeKanbansetting() {
      this.showKanbanSetting = false
    },
    changeSelectedItem(item) {
      this.selectedItem = item
      if (this.view === ETableView.kanban) {
        const query = Object.assign({}, this.$route.query)
        const newColumn = { kanbanColumn: item.key }
        this.$router.push({ query: { ...query, ...newColumn } })
      }
    },
    async setSelectItems() {
      await columnConstants().then(() => {
        this.selectedItem =
          columns.find(elem => elem.key === this.$route.query.kanbanColumn) ||
          columns[0]
        this.selectItems = columns
      })
    },
    toggleSelect() {
      this.changeView(ETableView.kanban)
      this.showSelect = !this.showSelect
    },
    closeSelect() {
      this.showSelect = false
    },
  },
  computed: {
    model: {
      get() {
        return this.view
      },
      set(value) {
        const query = Object.assign({}, this.$route.query)
        if (value === ETableView.table && this.$route.query.view) {
          delete query.view
          this.$router.push({ query: { ...query } })
        }
        if (value !== ETableView.table) {
          const newView = { view: value }
          this.$router.push({ query: { ...query, ...newView } })
        }
        this.$emit('input', value)
      },
    },
    isTableView() {
      return this.view === ETableView.table
    },
    isKanbanView() {
      return this.view === ETableView.kanban
    },
    showDownloadButton() {
      return this.$route.query.view !== 'kanban'
    },
  },
  mounted() {
    this.setSelectItems()
  },
})
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_vars';
.table-top {
  display: flex;
  flex: 0 0;
  margin: 0 0 0 1rem;
  padding-bottom: 0;
  justify-content: space-between;
  @media (min-width: $mobile-breakpoint) {
    padding-left: 0;
  }
  .total {
    display: inline;
    color: $purple;
    padding: 0.25rem 0.5rem;
    border: 1px solid $purple;
    border-radius: $radius-3x;
    font-weight: 700;
    font-size: 1rem;
    margin-left: 1rem;
    height: fit-content;
    margin-top: 0.25rem;
  }
  .btns {
    .btn {
      width: auto;
      .icon-download {
        width: 1.25rem;
        height: 1.25rem;
        fill: #fff;
        margin-left: 0.5rem;
        transform: scaleY(-1);
      }
    }
  }
  .views {
    display: flex;
    flex-grow: 1;
    margin-left: 3.25rem;
    margin-top: 0.25rem;
    @media (max-width: $mobile-breakpoint) {
      display: none;
    }
    .view {
      display: flex;
      position: relative;
      color: $purple;
      padding: 0.25rem 1rem;
      border: 1px solid $purple;
      border-radius: $radius-3x;
      background: $lightpurple;
      font-weight: 700;
      cursor: default;
      transition: 0.3s;
      transition: border-radius 0s;
      height: fit-content;
      &:hover {
        background: #fff;
        cursor: pointer;
      }
      &.active {
        background: $purple;
        color: #fff;
        cursor: unset;
        .icon-sliders {
          fill: #fff;
        }
      }
      &.kanban-view {
        margin-left: 0.5rem;
        span {
          display: inline-block;
        }
      }
      .icon-sliders {
        fill: $purple;
        height: 1rem;
        width: 1rem;
        vertical-align: middle;
        margin-left: 0.5rem;
        cursor: pointer;
      }
      .select-items {
        height: 0;
        background: $purple;
        padding: 0.5rem;
        border-radius: 0 $radius-3x $radius-3x $radius-3x;
        color: #fff;
        border: inherit;
        position: absolute;
        z-index: 2;
        top: 0;
        margin-top: 1.625rem;
        left: -1px;
        width: max-content;
        text-align: start;
        box-shadow: $box-shadow-5;
        min-height: 0;
        opacity: 0;
        overflow: hidden;
        cursor: default;
        .select-title {
          color: $purple4;
          padding: 0.5rem 0;
        }
        .select-item {
          font-size: 0.75rem;
          font-weight: 400;
          display: flex;
          align-items: center;
          padding: 0.25rem;
          cursor: default;
          .checkbox-label {
            margin-left: 0.5rem;
            cursor: pointer;
          }
        }
      }
      &.show-select {
        border-radius: $radius-3x $radius-3x 0 0;
        border-bottom: 1px solid transparent;
        .select-items {
          border-bottom: 1px solid transparent;
          height: fit-content;
          min-height: 3rem;
          opacity: 1;
        }
      }
    }
  }
}
</style>
