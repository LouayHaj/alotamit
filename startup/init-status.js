// const https = require('https');
// var request = require('request');
// const order = require('./../models/order');

// module.exports = async function () {
//     order.trackingStatus.findOne({})
//         .then(data => {
//             if (!data) {
//                 order.insertMany([
//                     { nameTr: 'Pendding', nameAr: 'قيد الانظار', value: 1 },
//                     { nameTr: 'Proccssing', nameAr: 'قيد المعالجة', value: 2 },
//                     { nameTr: 'Proccessed', nameAr: 'تمت المعالجة', value: 3 },
//                     { nameTr: 'Shipping', nameAr: 'قيد الشحن', value: 4 },
//                     { nameTr: 'Shipped', nameAr: 'تم الشحن', value: 5 },
//                     { nameTr: 'Completed', nameAr: 'تمت العملية بنجاح', value: 6 },
//                     { nameTr: 'Canceled', nameAr: 'تم الالغاء', value: 7 },
//                     { nameTr: 'Refunded', nameAr: 'تم رد المبلغ', value: 8 }
//                 ])
//                     .then(currencies => console.log('[+] order status has been inited :)'))
//                     .catch(err => { });
//             } else {
//                 console.log('[-] error on init order status !');
//             }
//         })
//         .catch(error => { });
// };
