export const __ = <T>() => new Proxy({}, {
  get(_, str) {
    return (i, ...args) => i[str](...args)
  }
}) as {
  [K in keyof T]: (it: T) => T[K]
}


class OK {
  ok() {
    console.log(this)
    console.log("OK")
    return 1
  }
}


const a = [new OK()]


console.log(a.map(__<OK>().ok))


console.log(__<OK>().ok(new OK()))
