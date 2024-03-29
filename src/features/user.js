import produce from 'immer'
import { selectUser } from '../utils/selector'

const initialState = {
  status: 'void',
  data: null,
  error: null
}

const FETCHING = 'user/fetching'
const RESOLVED = 'user/resolved'
const REJECTED = 'user/rejected'

const userFetching = () => ({ type: FETCHING })
const userResolved = (data) => ({ type: RESOLVED, payload: data })
const userRejected = (error) => ({ type: REJECTED, payload: error })


export async function fetchOrUpdateUser(store, userToken) {
  //console.log(userToken)
  const status = selectUser(store.getState()).status

  if (status === 'pending' || status === 'updating') {
    return
  }

  store.dispatch(userFetching())
  if (userToken !== undefined) {
    try{
      const response = await fetch('http://127.0.0.1/www/FidnerAPI/user/11', {
        method: 'post',
        headers: new Headers({
          'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body: new URLSearchParams({
          'email': userToken.username,
          'password': userToken.password,
        })
      })
      const data = await response.json()
      console.log(data.status)
      if(data.status === 200){
        store.dispatch(userResolved(data))
      }else{
        store.dispatch(userRejected("Connexion non authorizé"))
      }
      //console.log(data)
    }catch (error){
      store.dispatch(userRejected(error))
    } 
  }else{
    store.dispatch(userRejected(""))
  }
}

export default function userReducer(state = initialState, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case FETCHING: {
        if (draft.status === 'void') {
          draft.status = 'pending'
          return
        }
        if (draft.status === 'rejected') {
          draft.error = null
          draft.status = 'pending'
          return
        }
        if (draft.status === 'resolved') {
          draft.status = 'updating'
          return
        }
        return
      }
      case RESOLVED: {
        if (draft.status === 'pending' || draft.status === 'updating') {
          draft.data = action.payload
          draft.status = 'resolved'
          return
        }
        return
      }
      case REJECTED: {
        if (draft.status === 'pending' || draft.status === 'updating') {
          draft.status = 'rejected'
          draft.error = action.payload
          draft.data = null
          return
        }
        return
      }
      default:
        return
    }
  })
}