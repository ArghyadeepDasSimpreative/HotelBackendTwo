import Transaction from "../models/transaction.model.js";

export const getUserTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId })
      .populate({
        path: "bookingId",
        populate: {
          path: "roomId",
          select: "roomNumber description"
        },
        select: "roomId checkInDate checkOutDate totalAmount paymentStatus"
      })
      .sort({ createdAt: -1 });

    const formatted = transactions.map(tx => ({
      _id: tx._id,
      bookingId: tx.bookingId?._id,
      roomId: tx.bookingId?.roomId?._id,
      roomName: tx.bookingId?.roomId?.roomNumber,
      roomDescription: tx.bookingId?.roomId?.description,
      checkInDate: tx.bookingId?.checkInDate,
      checkOutDate: tx.bookingId?.checkOutDate,
      totalAmount: tx.bookingId?.totalAmount,
      paymentStatus: tx.bookingId?.paymentStatus,
      transactionId: tx.transactionId,
      amount: tx.amount,
      paymentMethod: tx.paymentMethod,
      paymentStatus: tx.paymentStatus,
      paidAt: tx.paidAt,
      createdAt: tx.createdAt,
    }));

    res.status(200).json({ success: true, transactions: formatted });
  } catch (err) {
    next(err);
  }
};