// src/context/appReducer.js

// Defines the state management pattern for the entire application
// State is organized by domain (wishes, settings, etc.) for maintainability
// ActionTypes define all possible state transitions in a centralized location

export const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_WISHES: 'ADD_WISHES',
  SET_WISHES: 'SET_WISHES',
  UPDATE_PITY: 'UPDATE_PITY',
  UPDATE_STATS: 'UPDATE_STATS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  RESET_DATA: 'RESET_DATA'
};

export const initialState = {
  wishes: {
    history: [],
    loading: false,
    error: null,
    progress: 0,
    pity: {
      character: {
        current: 0,
        guaranteed: false,
        pity_type: null,
        wishes_to_soft: 0,
        wishes_to_hard: 0,
        probability: 0
      },
      weapon: {
        current: 0,
        guaranteed: false,
        pity_type: null,
        wishes_to_soft: 0,
        wishes_to_hard: 0,
        probability: 0
      }
    },
    stats: {
      total_wishes: 0,
      five_stars: 0,
      four_stars: 0,
      primogems_spent: 0,
      avg_pity: 0,
      pity_distribution: {},
      banner_stats: {}
    }
  },
  settings: {
    volume: 50,
    autoUpdate: true,
    theme: 'dark',
    notifications: true
  }
};

export const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        wishes: {
          ...state.wishes,
          loading: action.payload
        }
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        wishes: {
          ...state.wishes,
          error: action.payload
        }
      };

    case ActionTypes.ADD_WISHES:
      return {
        ...state,
        wishes: {
          ...state.wishes,
          history: action.payload,
          error: null
        }
      };

    case ActionTypes.SET_WISHES:
      return {
        ...state,
        wishes: {
          ...state.wishes,
          history: action.payload,
          error: null
        }
      };

    case ActionTypes.UPDATE_PITY:
      return {
        ...state,
        wishes: {
          ...state.wishes,
          pity: action.payload
        }
      };

    case ActionTypes.UPDATE_STATS:
      return {
        ...state,
        wishes: {
          ...state.wishes,
          stats: action.payload
        }
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case ActionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        wishes: {
          ...state.wishes,
          progress: action.payload
        }
      };

    case ActionTypes.RESET_DATA:
    return {
        ...initialState,
        settings: state.settings // Preserve settings only
    };

    default:
      return state;
  }
};