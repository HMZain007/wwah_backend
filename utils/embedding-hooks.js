// utils/embedding-hooks.js
const fetch = require("node-fetch");
const UserDb = require("../database/models/UserDb");

// Define all frontend URLs
const FRONTEND_URLS =
  process.env.NODE_ENV === "production"
    ? ["https://wwah.vercel.app", "https://wwah.ai"]
    : [process.env.NEXTJS_APP_URL]; // Development fallback

const WEBHOOK_SECRET =
  process.env.WEBHOOK_SECRET ||
  "8f3fda4b91822b4a0d5b2a27947f9f21a8cbbd1a124a20aa8b2f76f0e6cfac12";

// Helper function to trigger webhooks on all frontends
async function triggerEmbeddingWebhooks(
  action,
  collection,
  documentId,
  document
) {
  const webhookPromises = FRONTEND_URLS.map(async (frontendUrl) => {
    if (!frontendUrl) return null;

    const webhookUrl = `${frontendUrl}/api/webhooks/embeddingUpdate`;

    try {
      console.log(
        `🔄 Triggering embedding webhook: ${action} for ${collection} document ${documentId} on ${frontendUrl}`
      );

      const response = await fetch(webhookUrl, {
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
          `❌ Embedding webhook failed for ${frontendUrl}: ${response.status} ${response.statusText}`,
          errorText
        );
        return { success: false, url: frontendUrl, error: errorText };
      } else {
        const result = await response.json();
        console.log(
          `✅ Embedding webhook successful: ${action} for ${collection} on ${frontendUrl}`,
          result
        );
        return { success: true, url: frontendUrl, result };
      }
    } catch (error) {
      console.error(
        `❌ Error triggering embedding webhook for ${frontendUrl}:`,
        error
      );
      return { success: false, url: frontendUrl, error: error.message };
    }
  });

  // Wait for all webhooks to complete
  const results = await Promise.allSettled(webhookPromises);

  // Log summary
  const successful = results.filter(
    (r) => r.status === "fulfilled" && r.value?.success
  ).length;
  const failed = results.length - successful;

  console.log(
    `📊 Webhook summary: ${successful} successful, ${failed} failed out of ${results.length} total`
  );

  return results;
}

// Enhanced database operation wrappers
class ExpressDbHooks {
  static async createUser(userData) {
    try {
      // Create user in database first
      const newUser = new UserDb(userData);
      await newUser.save();

      // Trigger embedding creation on all frontends
      await triggerEmbeddingWebhooks(
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
        // Trigger embedding update on all frontends
        await triggerEmbeddingWebhooks(
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
        // Trigger embedding deletion on all frontends
        await triggerEmbeddingWebhooks("delete", "userdbs", userId.toString());
      }

      return deletedUser;
    } catch (error) {
      console.error("Error deleting user with embeddings:", error);
      throw error;
    }
  }
}

module.exports = {
  triggerEmbeddingWebhooks,
  ExpressDbHooks,
};
