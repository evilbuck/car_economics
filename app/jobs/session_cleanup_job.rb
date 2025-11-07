class SessionCleanupJob < ApplicationJob
  queue_as :default

  def perform
    # Delete sessions older than 1 year with no user_id
    # These are anonymous sessions that were never associated with a user
    Session.where("created_at < ? AND user_id IS NULL", 1.year.ago).delete_all

    # Optionally, also delete all sessions older than 1 year regardless of user_id
    # Uncomment the line below if you want more aggressive cleanup:
    # Session.where("created_at < ?", 1.year.ago).delete_all
  end
end
