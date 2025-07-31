// utils/embedding-hooks.js
const fetch = require("node-fetch"); // or axios if you prefer
const UserDb = require("../database/models/UserDb");

const WEBHOOK_URL =
  process.env.NEXTJS_APP_URL + "/api/webhooks/embeddingUpdate";
const WEBHOOK_SECRET =
  process.env.WEBHOOK_SECRET ||
  "8f3fda4b91822b4a0d5b2a27947f9f21a8cbbd1a124a20aa8b2f76f0e6cfac12";

// Helper function to trigger Next.js webhook
async function triggerEmbeddingWebhook(
  action,
  collection,
  documentId,
  document
) {
  try {
    console.log(
      `🔄 Triggering embedding webhook: ${action} for ${collection} document ${documentId}`
    );

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        collection,
        documentId,
        document,
        secret: WEBHOOK_SECRET,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Embedding webhook failed: ${response.status} ${response.statusText}`,
        errorText
      );
    } else {
      const result = await response.json();
      console.log(
        `✅ Embedding webhook successful: ${action} for ${collection}`,
        result
      );
    }
  } catch (error) {
    console.error("❌ Error triggering embedding webhook:", error);
  }
}

// Enhanced database operation wrappers
class ExpressDbHooks {
  static async createUser(userData) {
    try {
      // Create user in database first
      const newUser = new UserDb(userData);
      await newUser.save();

      // Trigger embedding creation
      await triggerEmbeddingWebhook(
        "create",
        "userdbs",
        newUser._id.toString(),
        {
          ...newUser.toObject(),
          _id: newUser._id,
        }
      );

      return newUser;
    } catch (error) {
      console.error("Error creating user with embeddings:", error);
      throw error;
    }
  }

  static async updateUser(userId, updateData) {
    try {
      // Update user in database
      const updatedUser = await UserDb.findByIdAndUpdate(userId, updateData, {
        new: true,
      });

      if (updatedUser) {
        // Trigger embedding update
        await triggerEmbeddingWebhook(
          "update",
          "userdbs",
          userId.toString(),
          updatedUser.toObject()
        );
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating user with embeddings:", error);
      throw error;
    }
  }

  static async deleteUser(userId) {
    try {
      // Delete user from database
      const deletedUser = await UserDb.findByIdAndDelete(userId);

      if (deletedUser) {
        // Trigger embedding deletion
        await triggerEmbeddingWebhook("delete", "userdbs", userId.toString());
      }

      return deletedUser;
    } catch (error) {
      console.error("Error deleting user with embeddings:", error);
      throw error;
    }
  }
}

module.exports = {
  triggerEmbeddingWebhook,
  ExpressDbHooks,
};
