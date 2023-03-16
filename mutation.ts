import Vue from 'vue'
import { MutationTree } from 'vuex'
import { RecordingsState } from './state'
import { DataTableResponse, HistoryItem, DownloadLink } from '@/models/scripts'

export enum RecordingsMutationTypes {
  LoadSuccess = '[Recordings Mutation] Load Success',
  LoadOnceSuccess = '[Recordings Mutation] Load Once Success',
  LoadHistorySuccess = '[Recordings Mutation] Load History Success',
  DownloadSuccess = '[Recordings Mutation] download Success',
  LoadKanbanItemSuccess = '[Recordings Mutation] Load Kanban Item Success',
  LoadKanbanDeleteItemSuccess = '[Recordings Mutation] Load Kanban Delete Item Success',
  LoadKanbanDeleteOneItemSuccess = '[Recordings Mutation] Load Kanban Delete One Item Success',
  LoadKanbanDeleteAllItemSuccess = '[Recordings Mutation] Load Kanban Delete All Item Success',
}

export type RecordingsLoadSuccessMutationPayload = {
  data: DataTableResponse
}

export type KanbanObjectName = {
  keyName: string
  column: string
}

export type RecordingsLoadKanbanSuccessMutationPayload = RecordingsLoadSuccessMutationPayload & KanbanObjectName

export type RecordingsLoadHistorySuccessMutationPayload = {
  data: HistoryItem[]
}

export type DownloadSuccessMutationPayload = {
  data: DownloadLink
}

export const mutations: MutationTree<RecordingsState> = {
  [RecordingsMutationTypes.LoadSuccess](
    state,
    payload: RecordingsLoadSuccessMutationPayload,
  ) {
    state.list = payload.data
  },

  [RecordingsMutationTypes.LoadOnceSuccess](
    state,
    payload: RecordingsLoadSuccessMutationPayload,
  ) {
    state.item = payload.data.data[0]
  },

  [RecordingsMutationTypes.LoadHistorySuccess](
    state,
    payload: RecordingsLoadHistorySuccessMutationPayload,
  ) {
    state.history = payload.data
  },

  [RecordingsMutationTypes.DownloadSuccess](
    state,
    payload: DownloadSuccessMutationPayload,
  ) {
    state.downloadLink = payload.data.url
  },

  [RecordingsMutationTypes.LoadKanbanItemSuccess](
    state,
    payload: RecordingsLoadKanbanSuccessMutationPayload,
  ) {
    if (state?.kanban?.[payload.keyName]?.[payload.column]) {
      const items = state.kanban[payload.keyName][payload.column].data
      Vue.set(state.kanban[payload.keyName], payload.column, payload.data)
      return (state.kanban[payload.keyName][payload.column].data = items.concat(
        state.kanban[payload.keyName][payload.column].data,
      ))
    }
    Vue.set(state.kanban, payload.keyName, { ...state.kanban[payload.keyName] })
    Vue.set(state.kanban[payload.keyName], payload.column, payload.data)
  },

  [RecordingsMutationTypes.LoadKanbanDeleteItemSuccess](
    state,
    keyName: string,
  ) {
    delete state.kanban[keyName]
  },
  [RecordingsMutationTypes.LoadKanbanDeleteOneItemSuccess](
    state,
    data: KanbanObjectName,
  ) {
    if(state.kanban[data.keyName] && state.kanban[data.keyName][data.column]) {
      delete state.kanban[data.keyName][data.column]
    }
  },
  [RecordingsMutationTypes.LoadKanbanDeleteAllItemSuccess](state) {
    Object.getOwnPropertyNames(state.kanban).forEach(function(prop) {
      delete state.kanban[prop]
    })
  },
}
