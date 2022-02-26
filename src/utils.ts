import { Notify } from 'quasar'
import { useUserStore } from './store/loggedUser'

export const getShortDate = (date: Date, delimiter = '/') => {
  delimiter === '-' ? delimiter = '-' : delimiter = '/'
  return `${new Date(date).getFullYear()}${delimiter}${new Date(date).getMonth() + 1 > 9 ? '' : '0'}${new Date(date).getMonth() + 1}${delimiter}${new Date(date).getDate() > 9 ? '' : '0'}${new Date(date).getDate()}`
}

export const getShortTime = (date: Date) => {
  return `${date.getHours() > 9 ? '' : '0'}${date.getHours()}:${date.getMinutes() > 9 ? '' : '0'}${date.getMinutes()}`
}

export const getDaysDifference = (startDate: Date, endDate: Date) => {
  return Math.ceil((new Date(endDate).valueOf() - new Date(startDate).valueOf()) / (1000 * 60 * 60 * 24) + 1)
}

export const getMilliDifference = (startDate: Date, endDate: Date) => {
  return (new Date(endDate).valueOf() - new Date(startDate).valueOf()) + 1
}

export const loggedUserIsAdmin = () => {
  return useUserStore().role.toLocaleLowerCase() === 'admin'
}

export const loggedUserIsManager = () => {
  return useUserStore().role.toLocaleLowerCase() === 'manager'
}

export const getRandomHexColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

export const newRoomId = () => { return 'new_room' }
export const newClientId = () => { return 'new_client' }
export const newReservationId = () => { return 'new_reservation' }

export const isNewRoom = (id: string) => { return id === newRoomId() }
export const isNewClient = (id: string) => { return id === newClientId() }
export const isNewReservation = (id: string) => { return id === newReservationId() }

export const notify = (type = 'none', message = '', caption = '') => {
  if (type === 'success') {
    Notify.create({
      position: 'top',
      color: 'green',
      icon: 'done',
      message,
      caption
    })
  } else if (type === 'warning') {
    Notify.create({
      position: 'top',
      color: 'orange',
      icon: 'priority_high',
      message,
      caption
    })
  } else if (type === 'error') {
    Notify.create({
      position: 'top',
      color: 'red',
      icon: 'report',
      message,
      caption
    })
  } else if (type === 'role_restriction') {
    Notify.create({
      position: 'top',
      color: 'red',
      icon: 'do_not_disturb',
      message: 'Role Access Restriction',
      caption: 'Action is forbidden'
    })
  } else {
    Notify.create({
      position: 'top',
      color: '',
      icon: '',
      message,
      caption
    })
  }
}
