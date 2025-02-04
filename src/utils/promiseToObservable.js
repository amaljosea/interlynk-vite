import { Observable } from '@apollo/client'

export default (promise) =>
  new Observable((subscriber) => {
    promise.then(
      (value) => {
        if (subscriber.closed) return
        subscriber.next(value)
        subscriber.complete()
      },
      (err) => subscriber.error(err)
    )
    return subscriber
  })
