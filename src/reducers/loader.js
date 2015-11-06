import {List, Map} from 'immutable'
import * as types from '../constants/ActionTypes'

let INITIAL_STATE = Map({ 'loaded': false, 'totalApis': 0, 'loadedApis': 0, 'progress': List([]), 'currentStep': '' })

export default function loaderReducer (state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.API_CONFIGURATIONS:
      return state
              .set('totalApis', action.payload.length)
    case types.UPDATE_PROGRESS:
      return state
              .set('currentStep', action.currentStep)
              .set('progress',
                state.get('progress').push(action.currentStep)
              )
    case types.LOAD_COMPLETE:
      const loadedApis = state.get('loadedApis') + 1
      const allApisLoaded = loadedApis === state.get('totalApis')
      return state
              .set('loadedApis', loadedApis)
              .set('loaded', allApisLoaded)
  }
  return state
}
