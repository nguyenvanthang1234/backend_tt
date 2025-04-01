const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModel");
const EmailService = require("../services/EmailService");

const createOrder = (newOrder) => {
  return new Promise(async (resolve, reject) => {
    const {
      orderItems,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      fullName,
      address,
      city,
      phone,
      user,
      isPaid,
      paidAt,
      email,
    } = newOrder;
    try {
      const promises = orderItems.map(async (order) => {
        const productData = await Product.findOneAndUpdate(
          {
            _id: order.product,
            countInStock: { $gte: order.amount },
          },
          {
            $inc: {
              countInStock: -order.amount,
              selled: +order.amount,
            },
          },
          { new: true }
        );
        if (productData) {
          return {
            status: "OK",
            message: "SUCCESS",
          };
        } else {
          return {
            status: "OK",
            message: "ERR",
            id: order.product,
          };
        }
      });
      const results = await Promise.all(promises);
      const newData = results && results.filter((item) => item.id);
      if (newData.length) {
        const arrId = [];
        newData.forEach((item) => {
          arrId.push(item.id);
        });
        resolve({
          status: "ERR",
          message: `San pham voi id: ${arrId.join(",")} khong du hang`,
        });
      } else {
        const createdOrder = await Order.create({
          orderItems,
          shippingAddress: {
            fullName,
            address,
            city,
            phone,
          },
          paymentMethod,
          itemsPrice,
          shippingPrice,
          totalPrice,
          user: user,
          isPaid,
          paidAt,
        });
        if (createdOrder) {
          await EmailService.sendEmailCreateOrder(email, orderItems);
          resolve({
            status: "OK",
            message: "success",
          });
        }
      }
    } catch (e) {
      console.log("e", e);
      reject(e);
    }
  });
};

const getAllOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.find({
        user: id,
      }).sort({ createdAt: -1, updatedAt: -1 });
      if (order === null) {
        resolve({
          status: "ERR",
          message: "The order is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: order,
      });
    } catch (e) {
      // console.log('e', e)
      reject(e);
    }
  });
};

const getOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById({
        _id: id,
      });
      if (order === null) {
        resolve({
          status: "ERR",
          message: "The order is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCESSS",
        data: order,
      });
    } catch (e) {
      // console.log('e', e)
      reject(e);
    }
  });
};

// const cancelOrderDetails = (id, data) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let order = [];
//       const promises = data.map(async (order) => {
//         const productData = await Product.findOneAndUpdate(
//           {
//             _id: order.product,
//             selled: { $gte: order.amount },
//           },
//           {
//             $inc: {
//               countInStock: +order.amount,
//               selled: -order.amount,
//             },
//           },
//           { new: true }
//         );
//         if (productData) {
//           order = await Order.findByIdAndDelete(id);
//           if (order === null) {
//             resolve({
//               status: "ERR",
//               message: "The order is not defined",
//             });
//           }
//         } else {
//           return {
//             status: "OK",
//             message: "ERR",
//             id: order.product,
//           };
//         }
//       });
//       const results = await Promise.all(promises);
//       const newData = results && results[0] && results[0].id;

//       if (newData) {
//         resolve({
//           status: "ERR",
//           message: `San pham voi id: ${newData} khong ton tai`,
//         });
//       }
//       resolve({
//         status: "OK",
//         message: "success",
//         data: order,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

// const cancelOrderDetails = (id, data) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let deletedOrder = null;

//       const results = await Promise.all(
//         data.map(async (item) => {
//           const productData = await Product.findOneAndUpdate(
//             {
//               _id: item.product,
//               selled: { $gte: item.amount },
//             },
//             {
//               $inc: {
//                 countInStock: +item.amount,
//                 selled: -item.amount,
//               },
//             },
//             { new: true }
//           );

//           if (!productData) {
//             return {
//               status: "ERR",
//               message: `Sản phẩm với id: ${item.product} không tồn tại hoặc không đủ điều kiện.`,
//               id: item.product,
//             };
//           }

//           return { status: "OK" };
//         })
//       );
//       // Kiểm tra xem có sản phẩm nào  bị lỗi không
//       const errors = results.filter((result) => result.status === "ERR");
//       if (errors.length > 0) {
//         return resolve({
//           status: "ERR",
//           message: errors.map((err) => err.message).join(", "),
//         });
//       }

//       deletedOrder = await Order.findByIdAndDelete(id);
//       if (!deletedOrder) {
//         return resolve({
//           status: "ERR",
//           message: "Không tìm thấy đơn hàng cần hủy.",
//         });
//       }

//       resolve({
//         status: "OK",
//         message: "Đơn hàng đã được hủy thành công.",
//         data: deletedOrder,
//       });
//     } catch (error) {
//       reject({
//         status: "ERR",
//         message: "Có lỗi xảy ra trong quá trình xử lý.",
//         error: error.message,
//       });
//     }
//   });
// };

const cancelOrderDetails = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = null;
      const promises = data.map(async (orderItem) => {
        const productData = await Product.findOneAndUpdate(
          {
            _id: orderItem.product,
            selled: { $gte: orderItem.amount },
          },
          {
            $inc: {
              countInStock: +orderItem.amount,
              selled: -orderItem.amount,
            },
          },
          { new: true }
        );
        if (!productData) {
          // Nếu không tìm thấy sản phẩm
          return {
            status: "ERR",
            message: `Product with id ${orderItem.product} not found`,
          };
        }
        // Sau khi cập nhật sản phẩm, xóa đơn hàng
        order = await Order.findByIdAndDelete(id);
        if (!order) {
          // Nếu không tìm thấy đơn hàng
          return {
            status: "ERR",
            message: "The order is not defined",
          };
        }
        return {
          status: "OK",
          message: "Order cancelled successfully",
        };
      });

      const results = await Promise.all(promises);

      // Kiểm tra kết quả của các promise
      const errorResult = results.find((result) => result.status === "ERR");
      if (errorResult) {
        // Nếu có lỗi trong bất kỳ promise nào
        return resolve(errorResult);
      }

      // Nếu tất cả thành công, trả về kết quả
      resolve({
        status: "OK",
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: "An unexpected error occurred",
        error: e,
      });
    }
  });
};

const getAllOrder = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allOrder = await Order.find().sort({ createdAt: -1, updatedAt: -1 });
      resolve({
        status: "OK",
        message: "Success",
        data: allOrder,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createOrder,
  getAllOrderDetails,
  getOrderDetails,
  cancelOrderDetails,
  getAllOrder,
};
