// src/context/appReducer.js
export const initialState = {
    wishes: {
      history: [],
      pity: {
        character: {
          current: 0,
          guaranteed: false
        },
        weapon: {
          current: 0,
          guaranteed: false,
          fatePath: 0
        }
      },
      stats: {
        totalWishes: 0,
        fiveStars: 0,
        fourStars: 0,
        primogems: 0
      }
    },
    banners: {
      current: null,
      list: []
    },
    settings: {
      volume: 50,
      autoUpdate: true
    }
  };
  
  export const ActionTypes = {
    ADD_WISHES: 'ADD_WISHES',
    UPDATE_PITY: 'UPDATE_PITY',
    UPDATE_STATS: 'UPDATE_STATS',
    UPDATE_BANNERS: 'UPDATE_BANNERS',
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
    RESET_DATA: 'RESET_DATA'
  };
  
  export const appReducer = (state, action) => {
    switch (action.type) {
      case ActionTypes.ADD_WISHES:
        return {
          ...state,
          wishes: {
            ...state.wishes,
            history: [...state.wishes.history, ...action.payload]
          }
        };
  
      case ActionTypes.UPDATE_PITY:
        return {
          ...state,
          wishes: {
            ...state.wishes,
            pity: {
              ...state.wishes.pity,
              ...action.payload
            }
          }
        };
  
      case ActionTypes.UPDATE_STATS:
        return {
          ...state,
          wishes: {
            ...state.wishes,
            stats: {
              ...state.wishes.stats,
              ...action.payload
            }
          }
        };
  
      case ActionTypes.UPDATE_BANNERS:
        return {
          ...state,
          banners: {
            ...state.banners,
            ...action.payload
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
  
      case ActionTypes.RESET_DATA:
        return initialState;
  
      default:
        return state;
    }
  };