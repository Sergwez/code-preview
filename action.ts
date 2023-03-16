import { ActionTree } from 'vuex'
import { RecordingsState } from './state'
import {
  RecordingsMutationTypes,
  RecordingsLoadSuccessMutationPayload,
  RecordingsLoadHistorySuccessMutationPayload,
  DownloadSuccessMutationPayload,
  KanbanObjectName,
} from './mutations'
import { RootState } from '../../state'
import scriptsApiService from '@/services/scripts'
import { DataTablePayload } from '@/models/dataTable'

export enum RecordingsActionTypes {
  Load = '[Recordings Action] Load',
  LoadOnce = '[Recordings Action] Load Once',
  LoadHistory = '[Recordings Action] Load History',
  LoadActiveHistory = '[Recordings Action] Load Active History',
  Download = '[Recordings Action] Download',
  LoadKanbanItem = '[Recordings Action] Load Kanban Item',
  DeleteKanbanItem = '[Recordings Action] Delete Kanban Item',
  DeleteOneKanbanItem = '[Recordings Action] Delete Kanban Item',
  DeleteAllKanbanItems = '[Recordings Action] Delete All Kanban Items',
}

export type RecordingLoadOncePayload = {
  id: string
  expand: string
}

export interface RecordingsLoadKanbanitemPayload extends DataTablePayload {
  keyName: string
  column: string
}

export const actions: ActionTree<RecordingsState, RootState> = {
  async [RecordingsActionTypes.Load](context, data: DataTablePayload) {
    const { limit, offset, expand, sort, filter } = data
    const response = await scriptsApiService.getRecordings(
      limit,
      offset,
      expand,
      sort,
      filter,
    )

    const payload: RecordingsLoadSuccessMutationPayload = response
    context.commit(RecordingsMutationTypes.LoadSuccess, payload)

    return response
  },

  async [RecordingsActionTypes.LoadOnce](
    context,
    data: RecordingLoadOncePayload,
  ) {
    const response = await scriptsApiService.getRecordingItem(data)
    const payload: RecordingsLoadSuccessMutationPayload = response
    context.commit(RecordingsMutationTypes.LoadOnceSuccess, payload)

    return response
  },

  async [RecordingsActionTypes.LoadHistory](context, recordId: string) {
    const response = await scriptsApiService.getRecordingHistory(recordId)

    const payload: RecordingsLoadHistorySuccessMutationPayload = response
    context.commit(RecordingsMutationTypes.LoadHistorySuccess, payload)

    return response
  },

  async [RecordingsActionTypes.LoadActiveHistory](context) {
    const response = await scriptsApiService.getActiveScriptRecordingHistory()

    const payload: RecordingsLoadHistorySuccessMutationPayload = response
    context.commit(RecordingsMutationTypes.LoadHistorySuccess, payload)

    return response
  },

  async [RecordingsActionTypes.Download](context, data) {
    const { id, exept } = data
    const response = await scriptsApiService.downloadRecordings(id, exept)

    const payload: DownloadSuccessMutationPayload = response
    context.commit(RecordingsMutationTypes.DownloadSuccess, payload)

    return response
  },

  async [RecordingsActionTypes.LoadKanbanItem](
    context,
    data: RecordingsLoadKanbanitemPayload,
  ) {
    const { limit, offset, expand, sort, filter } = data
    const kanbanPayload = {
      keyName: data.keyName,
      column: data.column,
    }
    const response = await scriptsApiService.getRecordings(
      limit,
      offset,
      expand,
      sort,
      filter,
    )

    const payload: RecordingsLoadSuccessMutationPayload = {
      ...response,
      ...kanbanPayload,
    }
    context.commit(RecordingsMutationTypes.LoadKanbanItemSuccess, payload)

    return response
  },

  [RecordingsActionTypes.DeleteKanbanItem](context, keyName: string) {
    context.commit(RecordingsMutationTypes.LoadKanbanDeleteItemSuccess, keyName)
  },

  [RecordingsActionTypes.DeleteOneKanbanItem](context, data: KanbanObjectName) {
    context.commit(RecordingsMutationTypes.LoadKanbanDeleteOneItemSuccess, data)
  },

  [RecordingsActionTypes.DeleteAllKanbanItems](context) {
    context.commit(RecordingsMutationTypes.LoadKanbanDeleteItemSuccess)
  },
}
