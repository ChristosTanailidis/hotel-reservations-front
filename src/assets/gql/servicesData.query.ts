import gql from 'graphql-tag'

export const getServicesData = gql`
  query($getServicesDataRoomLevel: Float!) {
    serviceData: getServicesData(roomLevel: $getServicesDataRoomLevel) {
      foodData: foodServices {
        type
        cost
      }
      spaData: spaServices {
        type
        cost
      }
    }
  }
`
