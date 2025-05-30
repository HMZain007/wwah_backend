// const Payment = require("../database/models/adminDashboard/paymentTrack");
// const adminDashboardController = {
//   createPaymentTrack: async (req, res) => {
//     try {
//       const { user, transactionName, transactionId, amount, currency, status } =
//         req.body;
//       //  Validate required fields
//       if (!user || !transactionName || !transactionId || !amount) {
//         return res.status(400).json({
//           message:
//             "Missing required fields: user, transactionName, transactionId, amount",
//         });
//       }
//       // Create new payment
//       const newPayment = new Payment({
//         user,
//         transactionName,
//         transactionId,
//         amount,
//         currency: currency || "USD",
//         status: status || "pending",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//       const savedPayment = await newPayment.save();
//       res
//         .status(201)
//         .json({ message: "Payment added successfully", payment: savedPayment });
//     } catch (error) {
//       console.error("Error adding payment:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   },
//   // GET - Get all payments (for admin dashboard)
//   getPayments: async (req, res) => {
//     const studentId = req.params.studentid;
//     console.log("DEBUG: Fetching status for student ID:", studentId);

//     try {
//       const payment = await Payment.findOne({ user: studentId }); // or whatever field matches
//       console.log(payment, "DEBUG: Payment found for student ID:", studentId);
//       if (!payment) {
//         return res.status(404).json({
//           message: "No payment found for this student",
//           success: false,
//         });
//       }

//       return res.status(200).json({
//         message: "Payment retrieved successfully",
//         success: true,
//         data: payment,
//       });
//     } catch (error) {
//       console.error("Error fetching status:", error);
//       res.status(500).json({
//         message: error.message || "Internal Server Error",
//         success: false,
//       });
//     }
//   },
// };
// module.exports = adminDashboardController;
const Payment = require("../database/models/adminDashboard/paymentTrack");

const adminDashboardController = {
  createPaymentTrack: async (req, res) => {
    try {
      const { user, transactionName, transactionId, amount, currency, status } =
        req.body;

      //  Validate required fields
      if (!user || !transactionName || !transactionId || !amount) {
        return res.status(400).json({
          message:
            "Missing required fields: user, transactionName, transactionId, amount",
        });
      }

      // Create new payment
      const newPayment = new Payment({
        user,
        transactionName,
        transactionId,
        amount,
        currency: currency || "USD",
        status: status || "pending",
      });

      const savedPayment = await newPayment.save();

      res.status(201).json({
        message: "Payment added successfully",
        data: savedPayment,
        success: true,
      });
    } catch (error) {
      console.error("Error adding payment:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // GET - Get all payments for a specific student
  getPayments: async (req, res) => {
    const studentId = req.params.studentid;
    console.log("DEBUG: Fetching payments for student ID:", studentId);

    try {
      // Find ALL payments for the user, sorted by creation date (newest first)
      const payments = await Payment.find({ user: studentId }).sort({
        createdAt: -1,
      });

      console.log(
        `DEBUG: Found ${payments.length} payments for student ID:`,
        studentId
      );

      if (!payments || payments.length === 0) {
        return res.status(200).json({
          message: "No payments found for this student",
          success: true,
          data: [], // Return empty array instead of 404
        });
      }

      return res.status(200).json({
        message: `${payments.length} payment(s) retrieved successfully`,
        success: true,
        data: payments,
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        success: false,
      });
    }
  },

  // PUT - Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { paymentId, status } = req.body;

      if (!paymentId || !status) {
        return res.status(400).json({
          message: "Missing required fields: paymentId, status",
          success: false,
        });
      }

      const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          status,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!updatedPayment) {
        return res.status(404).json({
          message: "Payment not found",
          success: false,
        });
      }

      res.status(200).json({
        message: "Payment status updated successfully",
        success: true,
        data: updatedPayment,
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // PUT - Update payment details
  updatePayment: async (req, res) => {
    try {
      const { paymentId, ...updateData } = req.body;

      if (!paymentId) {
        return res.status(400).json({
          message: "Missing required field: paymentId",
          success: false,
        });
      }

      const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          ...updateData,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!updatedPayment) {
        return res.status(404).json({
          message: "Payment not found",
          success: false,
        });
      }

      res.status(200).json({
        message: "Payment updated successfully",
        success: true,
        data: updatedPayment,
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // // DELETE - Delete payment
  // deletePayment: async (req, res) => {
  //   try {
  //     const { paymentId } = req.body;

  //     if (!paymentId) {
  //       return res.status(400).json({
  //         message: "Missing required field: paymentId",
  //         success: false,
  //       });
  //     }

  //     const deletedPayment = await Payment.findByIdAndDelete(paymentId);

  //     if (!deletedPayment) {
  //       return res.status(404).json({
  //         message: "Payment not found",
  //         success: false,
  //       });
  //     }

  //     res.status(200).json({
  //       message: "Payment deleted successfully",
  //       success: true,
  //       data: deletedPayment,
  //     });
  //   } catch (error) {
  //     console.error("Error deleting payment:", error);
  //     res.status(500).json({
  //       message: "Internal server error",
  //       success: false,
  //     });
  //   }
  // },

  // GET - Get payment statistics for a student
  // getPaymentStats: async (req, res) => {
  //   const userId = req.user?.id;
  //   console.log("DEBUG: Fetching payment for user ID:", userId);
  //   try {
  //     const payment = await Payment.findOne({ user: userId }); // or whatever field matches

  //     if (!payment) {
  //       return res.status(404).json({
  //         message: "No status found for this student",
  //         success: false,
  //       });
  //     }

  //     return res.status(200).json({
  //       message: "Status retrieved successfully",
  //       success: true,
  //       data: payment,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching status:", error);
  //     res.status(500).json({
  //       message: error.message || "Internal Server Error",
  //       success: false,
  //     });
  //   }
  // },
  getPaymentStats: async (req, res) => {
    const userId = req.user?.id;
    console.log("DEBUG: Fetching payments for user ID:", userId);

    try {
      // Find ALL payments for the user, not just one
      const payments = await Payment.find({ user: userId }).sort({
        createdAt: -1,
      });

      if (!payments || payments.length === 0) {
        return res.status(404).json({
          message: "No payment history found for this user",
          success: false,
          data: [],
        });
      }

      return res.status(200).json({
        message: "Payment history retrieved successfully",
        success: true,
        data: payments, // Return array of payments
        count: payments.length,
      });
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        success: false,
      });
    }
  },
};

module.exports = adminDashboardController;
