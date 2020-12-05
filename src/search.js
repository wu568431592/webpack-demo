// 定义三种状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

const PromiseFn = function(cb){
  const self = this;            // 缓存this
  self.status = PENDING         // 保存当前promise的状态
  self.resolveRes = null;       // 成功返回值
  self.rejectError = null;      // 失败返回值
  self.resolveFunctionArr = [];  // 成功回调函数,考虑到要链式调用。所以这里使用数组存放回调函数
  self.rejectFunctionArr = [];   // 失败回调函数,考虑到要链式调用。所以这里使用数组存放回调函数

  // Promise 向外暴露出去的 resolve 方法。用于接收外部异步方法的成功返回值
  function resolve(res){
    /**
     *  只有在 当前Promise 对象是 pending 状态时 才有可能执行 resolve方法
     *  严格保证 整个Promis的状态只能是从 pending => fulfilled 或者 pending => rejected
     */
    if(res instanceof PromiseFn){
      return res.then(resolve, reject)
    }
    if(self.status === PENDING){
      /**
       * 这里使用一个定时器的原因是：
       * 为了使Promise可以执行同步代码
       * 因为：new Promise((resolve,reject)=>{
       *    resolve(200)
       * }).then(res=>{console.log(res)})
       * 这样的同步代码执行时。是先执行 resolve(),再执行then(),此时。我的resolve中的回调函数还是空数组。还没有通过then方法将
       * 需要执行的回调函数传入Promise对象内部。所以当我加上 setTimeOut 之后，代码运行到 resolve方法时，发现setTimeOut是一个宏
       * 任务则继续执行同步代码then,将then中的回调函数注入Promise对象中。则在同步代码处理完成后。调用宏任务队列中的setTimeOut，执行其中的
       * resolve的同步代码。reject 方法也是同理
       */
      setTimeout(()=>{
        self.status = FULFILLED     // 更新promise 状态
        self.resolveRes = res       // 记录当前resolve返回值
        self.resolveFunctionArr.forEach((callBack) => callBack(self.resolveRes))      // 依次执行回调函数
      },0)
    }
  }
  // Promise 向外暴露出去的 reject 方法。用于接收外部异步方法的失败返回值

  function reject(err){
    /**
     *  只有在 当前Promise 对象是 pending 状态时 才有可能执行 reject
     *  严格保证 整个Promis的状态只能是从 pending => fulfilled 或者 pending => rejected
     */
    if(self.status === PENDING){
      setTimeout(()=>{
        self.status = REJECTED      // 更新promise 状态
        self.rejectError = err      // 记录当前reject返回值
        self.rejectFunctionArr.forEach((callBack) => callBack(self.rejectError))       // 依次执行回调函数
      },0)
    }
  }
  // 执行 new Promise时传入函数的代码，并将成功回调reslove和reject失败回调传入函数内部
  try{
    cb(resolve,reject)
  }catch(e){
    reject(e)
  }
}

/**
 * 给Promise添加then方法，改方法接受两个参数。一个是成功执行后的回调。一个是失败执行后的回调
 * @param {成功执行后的回调} onFulfilled 
 * @param {失败执行后的回调} onRejected 
 */
PromiseFn.prototype.then = function(onFulfilled, onRejected){
  const self = this;
  let bridgePromise 
  //防止使用者不传成功或失败回调函数，所以成功失败回调都给了默认回调函数
  onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
  onRejected = typeof onRejected === "function" ? onRejected : error => { throw error };

  // 如果当前promise状态为pending，则将回调函数缓存在Promise对象内部
  if(this.status === PENDING){
    return bridgePromise = new PromiseFn((resolve, reject)=>{
      self.resolveFunctionArr.push((value)=>{
        try{
          let x = onFulfilled(value);
          resolvePromise(bridgePromise, x, resolve, reject);
        }catch(e){
          reject(e)
        }
      })
      self.rejectFunctionArr.push((err)=>{
        try{
          let x = onRejected(err);
          resolvePromise(bridgePromise, x, resolve, reject);
        }catch(e){
          reject(e)
        }
      })
    })
  }else if(this.status === FULFILLED){
    // 如果当前Promise状态为 fulfilled，直接调用该函数
    return bridgePromise = new PromiseFn((resolve, reject)=>{
      setTimeout(()=>{
        try{
          let x = onFulfilled(self.resolveRes);
          resolvePromise(bridgePromise, x, resolve, reject);
        }catch(e){
          reject(e)
        }
      },0)
    })
  }else{
    // 如果当前Promise状态为 rejected，直接调用该函数
    return bridgePromise = new PromiseFn((resolve, reject)=>{
      setTimeout(()=>{
        try{
          let x = onRejected(self.rejectError);
          resolvePromise(bridgePromise, x, resolve, reject);
        }catch(e){
          reject(e)
        }
      },0)
    })
  }
}
//catch方法其实是个语法糖，就是只传onRejected不传onFulfilled的then方法
PromiseFn.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
}


//用来解析回调函数的返回值x，x可能是普通值也可能是个promise对象
function resolvePromise(bridgepromise, x, resolve, reject) {
  //2.3.1规范，避免循环引用
  if (bridgepromise === x) {
    return reject(new TypeError('Circular reference'));
  }
  let called = false;
  //这个判断分支其实已经可以删除，用下面那个分支代替，因为promise也是一个thenable对象
  // if (x instanceof PromiseFn) {
  //     if (x.status === PENDING) {
  //         x.then(y => {
  //             resolvePromise(bridgepromise, y, resolve, reject);
  //         }, error => {
  //             reject(error);
  //         });
  //     } else {
  //         x.then(resolve, reject);
  //     }
  //     // 2.3.3规范，如果 x 为对象或者函数
  // } else 
  if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
    try {
      // 是否是thenable对象（具有then方法的对象/函数）
      //2.3.3.1 将 then 赋为 x.then
      let then = x.then;
      if (typeof then === 'function') {
      //2.3.3.3 如果 then 是一个函数，以x为this调用then函数，且第一个参数是resolvePromise，第二个参数是rejectPromise
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(bridgepromise, y, resolve, reject);
        }, error => {
          if (called) return;
          called = true;
          reject(error);
        })
      } else {
      //2.3.3.4 如果 then不是一个函数，则 以x为值fulfill promise。
        resolve(x);
      }
    } catch (e) {
    //2.3.3.2 如果在取x.then值时抛出了异常，则以这个异常做为原因将promise拒绝。
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

PromiseFn.prototype.all = function(promises){
  return new PromiseFn((resolve,reject)=>{
    const result = []
    let count = 0;
    for(let i = 0; i < promises.length; i++){
      promises[i].then(function(data){
        result[i] = data;
        if (++count == promises.length) {
          resolve(result);
        }
      },function(error){
        reject(error)
      })
    }
  })
}

PromiseFn.prototype.race = function(promises){
  return new PromiseFn((resolve,reject)=>{
    for(let i = 0; i < promises.length; i++){
      promises[i].then(function(data){
        resolve(data);
      },function(error){
        reject(error)
      })
    }
  })
}

PromiseFn.prototype.resolve = function(data){
  return new PromiseFn((resolve)=>{
    resolve(data)
  })
}

PromiseFn.prototype.reject = function(error){
  return new PromiseFn((resolve, reject)=>{
    reject(error)
  })
}

PromiseFn.prototype.promisify = function(fn) {
  return function() {
    var args = Array.from(arguments);
    return new PromiseFn(function(resolve, reject) {
      fn.apply(null, args.concat(function(err) {
        err ? reject(err) : resolve(arguments[1])
      }));
    })
  }
}


/**
 * TODO 以下为测试代码
 */

PromiseFn.deferred = function() {
  let defer = {};
  defer.promise = new PromiseFn((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
  });
  return defer;
}
// try {
//   module.exports = PromiseFn
// } catch (e) {}

// const mp = new PromiseFn(function(resolve, reject){
//   // setTimeout(()=>{
//     // resolve(200)
//     Math.random()>0.5 ? resolve(200) : reject(new Error)
//   // },2000)
// }).then(res=>{
//   console.log(res)
// },error=>{
//   console.log(error)
// }).then(res=>{
//   console.log('again'+res)
// },error=>{
//   console.log('again'+error)
// })

// console.log(mp)
// setTimeout(()=>{
//   console.log(mp)
//   mp.then(res=>{
//     console.log('1'+res)
//   },error=>{
//     console.log('1'+error)
//   })
// },3000)

// const pp = new PromiseFn(function(resolve, reject){
//     setTimeout(()=>{
//       resolve(100)
//     },2000)
//   }).then(res =>{
//     console.log(res)
//     return new PromiseFn((res,rej)=>{
//       setTimeout(()=>{
//         res(200)
//       },2000)
//     })
//   }).then(res=>{
//     console.log(res)
//     return new PromiseFn((res,rej)=>{
//       setTimeout(()=>{
//         res(300)
//       },2000)
//     })
//   }).then(res=>{
//     console.log(res)
//   })