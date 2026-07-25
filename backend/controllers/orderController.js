import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { getIo } from "../utils/socket.js";
import {
  sendNewOrderAlertEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "../services/emailService.js";

const orderStatuses = [
  "pending",
  "preparing",
  "out-for-delivery",
  "delivered",
  "cancelled",
];

function getVendorId(value) {
  return typeof value === "string" ? value : value?._id?.toString() || value?.toString();
}

function getItemVendorId(item) {
  return getVendorId(item.vendor) || getVendorId(item.productId?.vendor);
}

function getItemVendor(item) {
  return item.vendor || item.productId?.vendor;
}

function getItemValue(item, field) {
  return item[field] ?? item.productId?.[field];
}

function serializeOrder(order) {
  return typeof order.toObject === "function" ? order.toObject() : order;
}

function getProductId(value) {
  return typeof value === "string" ? value : value?._id?.toString() || value?.toString();
}

function shapeOrderForVendor(order, vendorId) {
  const shapedOrder = serializeOrder(order);
  const vendorKey = vendorId?.toString();
  const vendorItems = (shapedOrder.items || [])
    .filter((item) => getItemVendorId(item) === vendorKey)
    .map((item) => ({
      ...item,
      vendor: getItemVendor(item),
      vendorId: getItemVendorId(item),
      productId: getProductId(item.productId),
      name: getItemValue(item, "name"),
      price: getItemValue(item, "price"),
      image: getItemValue(item, "image"),
      status: item.status || shapedOrder.status || "pending",
    }));

  return {
    ...shapedOrder,
    items: vendorItems,
    vendorStatus: vendorItems[0]?.status || shapedOrder.status || "pending",
    vendorTotalPrice: vendorItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    ),
  };
}

function shapeOrderForBuyer(order) {
  const shapedOrder = serializeOrder(order);

  return {
    ...shapedOrder,
    items: (shapedOrder.items || []).map((item) => ({
      ...item,
      vendorId: getItemVendorId(item),
      name: getItemValue(item, "name"),
      price: getItemValue(item, "price"),
      image: getItemValue(item, "image"),
      status: item.status || shapedOrder.status || "pending",
    })),
  };
}

function calculateOrderStatus(items = []) {
  const statuses = items.map((item) => item.status || "pending");

  if (statuses.length === 0) {
    return "pending";
  }

  if (statuses.every((status) => status === "cancelled")) {
    return "cancelled";
  }

  if (statuses.every((status) => status === "delivered" || status === "cancelled")) {
    return "delivered";
  }

  if (statuses.includes("out-for-delivery")) {
    return "out-for-delivery";
  }

  if (statuses.includes("preparing")) {
    return "preparing";
  }

  return "pending";
}


// CREATE ORDER
export const createOrder = async (
  req,
  res
) => {

  try {

    const { items = [], totalPrice } = req.body;

    // enrich items with productId and vendor (if productId provided)
    const enrichedItems = await Promise.all(
      items.map(async (it) => {
        if (it.productId) {
          try {
            const product = await Product.findById(it.productId);
            return {
              productId: it.productId,
              vendor: product?.vendor || undefined,
              name: it.name,
              price: it.price,
              quantity: it.quantity,
              image: it.image,
              status: "pending",
            };
          } catch (err) {
            return {
              name: it.name,
              price: it.price,
              quantity: it.quantity,
              image: it.image,
              status: "pending",
            };
          }
        }

        return {
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
          status: "pending",
        };
      })
    );

    const order = await Order.create({
      user: req.user.id,
      items: enrichedItems,
      totalPrice,
    });

    const user = await User.findById(req.user.id);

    try {
      await sendOrderConfirmationEmail(
        user?.email,
        user?.name,
        order
      );
    } catch (emailError) {
      console.error("Order confirmation email failed", emailError?.message || emailError);
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.vendor", "name email")
      .populate({
        path: "items.productId",
        select: "name price image vendor",
        populate: { path: "vendor", select: "name email" },
      });

    // Emit real-time events
    const io = getIo();

    // notify buyer
    io?.to(`user_${req.user.id}`).emit("orderCreated", shapeOrderForBuyer(populatedOrder));

    // notify vendors involved
    const vendorIds = Array.from(
      new Set(enrichedItems.map((it) => it.vendor?.toString()).filter(Boolean))
    );

    vendorIds.forEach((vid) => {
      io?.to(`vendor_${vid}`).emit("newOrder", shapeOrderForVendor(populatedOrder, vid));
    });

    await Promise.all(
      vendorIds.map(async (vid) => {
        try {
          const vendor = await User.findById(vid);

          if (vendor?.email) {
            await sendNewOrderAlertEmail(
              vendor.email,
              vendor.name || vendor.brandName || "Vendor",
              populatedOrder,
              vendor.name || vendor.brandName || "Vendor"
            );
          }
        } catch (emailError) {
          console.error("New order alert email failed", emailError?.message || emailError);
        }
      })
    );

    res.status(201).json(shapeOrderForBuyer(populatedOrder));

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL ORDERS (VENDOR)
export const getOrders = async (
  req,
  res
) => {

  try {

    const vendorProductIds = await Product.find({ vendor: req.user.id }).distinct("_id");

    // only return orders that involve this vendor, including older orders whose
    // item vendor was not copied but whose product still belongs to this vendor.
    const orders = await Order.find({
      $or: [
        { "items.vendor": req.user.id },
        { "items.productId": { $in: vendorProductIds } },
      ],
    })
      .populate("user", "name email")
      .populate("items.vendor", "name email")
      .populate({
        path: "items.productId",
        select: "name price image vendor",
        populate: { path: "vendor", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(orders.map((order) => shapeOrderForVendor(order, req.user.id)));

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};


// GET MY ORDERS (BUYER)
export const getMyOrders = async (
  req,
  res
) => {

  try {

    const orders = await Order.find({ user: req.user.id })
      .populate("items.vendor", "name email")
      .populate({
        path: "items.productId",
        select: "name price image vendor",
        populate: { path: "vendor", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(orders.map(shapeOrderForBuyer));

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE ORDER STATUS
export const updateOrderStatus =
  async (req, res) => {

    try {

      const order = await Order.findById(req.params.id).populate({
        path: "items.productId",
        select: "vendor",
      });

      if (!order) {

        return res.status(404).json({
          message: "Order not found",
        });
      }

      const vendorOwnsOrder = order.items.some(
        (item) => getItemVendorId(item) === req.user.id
      );

      if (!vendorOwnsOrder) {
        return res.status(403).json({
          message: "You can only update orders that include your products",
        });
      }

      const requestedStatus = req.body.status || order.status;

      if (!orderStatuses.includes(requestedStatus)) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      order.items.forEach((item) => {
        if (getItemVendorId(item) === req.user.id) {
          item.vendor = item.vendor || item.productId?.vendor;
          item.status = requestedStatus;
        }
      });

      order.status = calculateOrderStatus(order.items);

      await order.save();

      const updatedOrder = await Order.findById(order._id)
        .populate("user", "name email")
        .populate("items.vendor", "name email")
        .populate({
          path: "items.productId",
          select: "name price image vendor",
          populate: { path: "vendor", select: "name email" },
        });

      const vendorOrder = shapeOrderForVendor(updatedOrder, req.user.id);

      try {
        await sendOrderStatusUpdateEmail(
          updatedOrder.user?.email,
          updatedOrder.user?.name,
          updatedOrder,
          requestedStatus
        );
      } catch (emailError) {
        console.error("Order status email failed", emailError?.message || emailError);
      }

      // emit updates to buyer and vendors
      const io = getIo();

      io?.to(`user_${order.user.toString()}`).emit("orderUpdated", shapeOrderForBuyer(updatedOrder));

      const vendorIds = Array.from(
        new Set(order.items.map((it) => getItemVendorId(it)).filter(Boolean))
      );

      vendorIds.forEach((vid) => {
        io?.to(`vendor_${vid}`).emit("orderUpdated", shapeOrderForVendor(updatedOrder, vid));
      });

      res.json(vendorOrder);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });
    }
  };
